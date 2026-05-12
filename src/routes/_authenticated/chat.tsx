import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "AI Assistant — Car Care Ally" }] }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm CCA Ally. Tell me what's going on with your vehicle and I'll help you figure out next steps." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("chat_messages").select("role,content").eq("user_id", user.id).order("created_at").limit(50)
      .then(({ data }) => {
        if (data && data.length > 0) setMessages(data.map((m: any) => ({ role: m.role, content: m.content })));
      });
  }, [user?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading || !user) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: userMsg.content });

    try {
      const { data, error } = await supabase.functions.invoke("ai-chatbot", { body: { messages: next } });
      if (error) throw error;
      const reply = data?.reply ?? "Sorry, something went wrong.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: reply });
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: "I'm temporarily unavailable. Please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <h1 className="font-display text-3xl font-bold text-foreground">CCA Ally — AI Assistant</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ask anything about your vehicle, repairs, or maintenance.</p>

      <div className="mt-6 flex-1 overflow-y-auto rounded-xl border border-border bg-card p-5 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
              {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Describe a symptom, ask about maintenance…"
          className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          disabled={loading}
        />
        <Button onClick={send} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
