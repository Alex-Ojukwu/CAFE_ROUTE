import { createClient } from "@/lib/supabase/server";
import { RiderTopbar } from "@/components/rider/rider-topbar";
import { OrderNotifier } from "@/components/order-notifier";

export const dynamic = "force-dynamic";

export default async function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", user!.id)
    .single();

  return (
    <>
      <RiderTopbar userId={user!.id} initialActive={profile?.is_active ?? true} />
      <OrderNotifier role="rider" userId={user!.id} />
      {children}
    </>
  );
}
