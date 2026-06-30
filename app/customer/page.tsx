import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { MenuBrowser } from "@/components/customer/menu-browser";
import type { MenuItem } from "@/lib/types";

// The menu changes rarely, so cache it across ALL users: 2,000 visits become
// ~1 DB query per minute instead of 2,000. Owner edits bust this immediately
// via revalidateTag("menu") (see app/owner/menu/actions.ts).
const getMenu = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("is_staple", { ascending: false })
      .order("name", { ascending: true });
    return (data as MenuItem[]) ?? [];
  },
  ["customer-menu"],
  { revalidate: 60, tags: ["menu"] }
);

export default async function CustomerMenuPage() {
  const items = await getMenu();
  return <MenuBrowser items={items} />;
}
