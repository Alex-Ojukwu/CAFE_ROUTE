import { CartProvider } from "@/components/cart/cart-context";
import { CustomerTopbar } from "@/components/customer/customer-topbar";

export const dynamic = "force-dynamic";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <CustomerTopbar />
      {children}
    </CartProvider>
  );
}
