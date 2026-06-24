import { createClient } from "@/lib/supabase/server";
import { MenuManager } from "@/components/owner/menu-manager";
import type { MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OwnerMenuPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  return <MenuManager initialItems={(data as MenuItem[]) ?? []} />;
}
