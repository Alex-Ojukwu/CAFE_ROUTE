import { createClient } from "@/lib/supabase/server";
import { MenuBrowser } from "@/components/customer/menu-browser";
import type { MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomerMenuPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  return <MenuBrowser items={(items as MenuItem[]) ?? []} />;
}
