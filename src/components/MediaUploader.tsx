import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Mic, Paperclip, Square, Trash2, Loader2, Play } from "lucide-react";

export type MediaItem = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  caption: string | null;
  uploader_role: string;
  captured_at: string;
  signedUrl?: string;
};

type Props = {
  uploaderId: string;
  uploaderRole?: "customer" | "specialist" | "admin";
  context?: "diagnostics" | "appointment_pre" | "appointment_during" | "appointment_post";
  appointmentId?: string;
  diagnosticId?: string;
  vehicleId?: string;
  readOnly?: boolean;
  /** Filter shown items by these contexts */
  showContexts?: string[];
};

const MAX_BYTES = 25 * 1024 * 1024; // 25MB

export function MediaUploader({
  uploaderId,
  uploaderRole = "customer",
  context = "diagnostics",
  appointmentId,
  diagnosticId,
  vehicleId,
  readOnly = false,
  showContexts,
}: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    let q = supabase.from("media_uploads").select("*").order("captured_at", { ascending: false }).limit(50);
    if (appointmentId) q = q.eq("appointment_id", appointmentId);
    else if (diagnosticId) q = q.eq("diagnostic_id", diagnosticId);
    else if (vehicleId) q = q.eq("vehicle_id", vehicleId);
    else q = q.eq("uploader_id", uploaderId).eq("context", context);
    const { data } = await q;
    let list = (data ?? []) as MediaItem[];
    if (showContexts) list = list.filter((m: any) => showContexts.includes(m.context));
    // Sign URLs (1h)
    const signed = await Promise.all(list.map(async (m) => {
      const { data: s } = await supabase.storage.from("media").createSignedUrl(m.storage_path, 3600);
      return { ...m, signedUrl: s?.signedUrl };
    }));
    setItems(signed);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [appointmentId, diagnosticId, vehicleId]);

  const upload = async (file: File | Blob, mime: string, ext: string) => {
    if (file.size > MAX_BYTES) { toast.error("File too large (max 25MB)"); return; }
    setBusy(true);
    const path = `${uploaderId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("media").upload(path, file, { contentType: mime, upsert: false });
    if (upErr) { setBusy(false); toast.error(upErr.message); return; }
    const { error: insErr } = await supabase.from("media_uploads").insert({
      uploader_id: uploaderId, uploader_role: uploaderRole, context,
      appointment_id: appointmentId ?? null, diagnostic_id: diagnosticId ?? null, vehicle_id: vehicleId ?? null,
      storage_path: path, mime_type: mime, size_bytes: (file as File).size ?? null,
    });
    setBusy(false);
    if (insErr) { toast.error(insErr.message); return; }
    toast.success("Uploaded");
    refresh();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      const ext = f.name.split(".").pop() || "bin";
      await upload(f, f.type || "application/octet-stream", ext);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await upload(blob, "audio/webm", "webm");
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const remove = async (m: MediaItem) => {
    if (!confirm("Remove this attachment?")) return;
    await supabase.storage.from("media").remove([m.storage_path]);
    await supabase.from("media_uploads").delete().eq("id", m.id);
    refresh();
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          <input ref={cameraInputRef} type="file" accept="image/*;capture=camera,video/*;capture=camcorder" capture="environment" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          <Button type="button" size="sm" variant="outline" onClick={() => cameraInputRef.current?.click()} disabled={busy}>
            <Camera className="h-3.5 w-3.5 mr-1" /> Camera
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={busy}>
            <Paperclip className="h-3.5 w-3.5 mr-1" /> Attach
          </Button>
          {!recording ? (
            <Button type="button" size="sm" variant="outline" onClick={startRecording} disabled={busy}>
              <Mic className="h-3.5 w-3.5 mr-1" /> Record audio
            </Button>
          ) : (
            <Button type="button" size="sm" variant="destructive" onClick={stopRecording}>
              <Square className="h-3.5 w-3.5 mr-1" /> Stop ({Math.floor((Date.now() % 60000) / 1000)}s)
            </Button>
          )}
          {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No attachments yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((m) => {
            const isImg = (m.mime_type || "").startsWith("image/");
            const isVid = (m.mime_type || "").startsWith("video/");
            const isAud = (m.mime_type || "").startsWith("audio/");
            return (
              <div key={m.id} className="relative rounded-lg border border-border bg-secondary/30 overflow-hidden group">
                {isImg && m.signedUrl && <img src={m.signedUrl} alt={m.caption ?? ""} className="aspect-square w-full object-cover" />}
                {isVid && m.signedUrl && <video src={m.signedUrl} controls className="aspect-square w-full object-cover bg-black" />}
                {isAud && m.signedUrl && (
                  <div className="aspect-square w-full flex flex-col items-center justify-center p-2 gap-2">
                    <Play className="h-6 w-6 text-primary" />
                    <audio src={m.signedUrl} controls className="w-full" />
                  </div>
                )}
                <div className="p-1.5 text-[10px] text-muted-foreground flex items-center justify-between">
                  <span className="truncate">{m.uploader_role} · {new Date(m.captured_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                  {!readOnly && m.uploader_role === uploaderRole && (
                    <button onClick={() => remove(m)} className="opacity-0 group-hover:opacity-100 text-destructive ml-1"><Trash2 className="h-3 w-3" /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
