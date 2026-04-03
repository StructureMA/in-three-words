import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E6E3] py-8">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-sm text-[#6B6B6B] mb-3">
          &copy; 2026 In a Few Words &middot; Original art. A few words. A good
          cause.
        </p>
        <div className="flex justify-center gap-4 text-xs text-[#999]">
          <Link href="/terms" className="hover:text-[#2E6B8A] transition-colors">
            Terms &amp; Stuff
          </Link>
          <span>&middot;</span>
          <Link href="/terms-of-service" className="hover:text-[#2E6B8A] transition-colors">
            Terms of Service
          </Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-[#2E6B8A] transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
