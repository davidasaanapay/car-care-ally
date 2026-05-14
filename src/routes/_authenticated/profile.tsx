import { useDocumentTitle } from "@/lib/use-document-title";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
function ProfilePage() {
  useDocumentTitle("Profile — Car Care Ally");
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", phone: "", state: "", city: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,phone,state,city").eq("id", user.id).single().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "", state: data.state ?? "", city: data.city ?? "" });
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      <form onSubmit={save} className="mt-8 rounded-xl border bg-card p-6 grid sm:grid-cols-2 gap-3 max-w-2xl">
        {(["full_name","phone","state","city"] as const).map((k) => (
          <label key={k} className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k.replace("_"," ")}</span>
            <input value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
        ))}
        <div className="sm:col-span-2 flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={signOut}>Sign out</Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
    </>
  );
}

export default ProfilePage;
