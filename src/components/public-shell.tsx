"use client";

import { usePathname } from "next/navigation";
import PublicNav from "./public-nav";
import Footer from "./footer";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isPay = pathname.startsWith("/pay");
  const showShell = !isAdmin && !isPay;

  return (
    <>
      {showShell && <PublicNav />}
      {showShell ? (
        <div className="pt-14">{children}</div>
      ) : (
        children
      )}
      {showShell && <Footer />}
    </>
  );
}
