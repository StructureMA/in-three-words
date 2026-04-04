"use client";

import Link from "next/link";
import { useState } from "react";

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-[#E8E6E3]/60">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-lg font-bold text-[#2E6B8A] hover:text-[#245a74] transition-colors"
        >
          In a Few Words
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/gallery"
            className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/enter"
            className="text-sm font-semibold text-[#2E6B8A] hover:text-[#245a74] transition-colors"
          >
            Enter
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden flex flex-col gap-1 p-2"
          aria-label="Toggle navigation"
        >
          <span
            className={`block w-5 h-0.5 bg-[#1A1A1A] transition-transform ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#1A1A1A] transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#1A1A1A] transition-transform ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E8E6E3]/60 px-4 pb-4 pt-2 space-y-3">
          <Link
            href="/gallery"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/enter"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-semibold text-[#2E6B8A] hover:text-[#245a74] transition-colors"
          >
            Enter
          </Link>
        </div>
      )}
    </nav>
  );
}
