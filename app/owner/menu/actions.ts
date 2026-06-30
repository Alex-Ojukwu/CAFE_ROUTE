"use server";

import { revalidateTag } from "next/cache";

// Bust the cached customer menu after the owner adds/edits/removes an item or
// toggles availability, so changes show up right away instead of after the
// 60s revalidate window.
export async function revalidateMenu() {
  revalidateTag("menu");
}
