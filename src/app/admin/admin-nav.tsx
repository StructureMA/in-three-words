"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/entries", label: "Entries" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/examples", label: "Examples" },
  { href: "/admin/charities", label: "Charities" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  if (pathname === "/admin/login") return null;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center bg-[#1A1A1A] text-white">
      <div className="px-5 py-3.5 font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#2E6B8A] border-r border-[#333]">
        ITW Admin
      </div>
      <div className="flex items-center flex-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#333] text-white font-semibold"
                  : "text-[#999] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <button
        onClick={handleSignOut}
        className="px-4 py-3.5 text-xs text-[#999] hover:text-white transition-colors"
      >
        Sign out
      </button>
    </nav>
  );
}
