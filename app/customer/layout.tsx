import { createClient } from "@/lib/supabase/server";
import { CartProvider } from "@/components/cart/cart-context";
import { CustomerTopbar } from "@/components/customer/customer-topbar";
import { OrderNotifier } from "@/components/order-notifier";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <CartProvider>
      <CustomerTopbar />
      {user && <OrderNotifier role="customer" userId={user.id} />}
      {children}
    </CartProvider>
  );
}
