import AdminNav from "./admin-nav";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <AdminNav />
      <main className="p-6">{children}</main>
    </div>
  );
}
