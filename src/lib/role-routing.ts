import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "shop_owner" | "specialist" | "customer";

export async function syncUserRoles(userId: string) {
  try {
    await (supabase as any).rpc("claim_team_member_invite");
  } catch {
    /* non-fatal */
  }

  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((row) => row.role as AppRole);
}

export function getPostLoginRoute(roles: AppRole[]) {
  if (roles.includes("super_admin")) return "/admin";
  if (roles.includes("shop_owner") || roles.includes("specialist")) return "/shop";
  return "/dashboard";
}
