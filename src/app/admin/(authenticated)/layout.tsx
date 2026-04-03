import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminNav from "../admin-nav";

export const dynamic = "force-dynamic";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <AdminNav />
      <main className="p-6">{children}</main>
    </div>
  );
}
