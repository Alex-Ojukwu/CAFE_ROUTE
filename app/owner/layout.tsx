import { OwnerTopbar } from "@/components/owner/owner-topbar";

export const dynamic = "force-dynamic";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OwnerTopbar />
      {children}
    </>
  );
}
