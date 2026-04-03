"use client";

import { useState } from "react";
import { toggleFeatured } from "@/actions/paintings";
import { useRouter } from "next/navigation";

interface FeaturedToggleProps {
  paintingId: string;
  initialFeatured: boolean;
}

export default function FeaturedToggle({
  paintingId,
  initialFeatured,
}: FeaturedToggleProps) {
  const [featured, setFeatured] = useState(initialFeatured);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    const newValue = !featured;
    const result = await toggleFeatured(paintingId, newValue);
    setLoading(false);

    if (result.success) {
      setFeatured(newValue);
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors disabled:opacity-50 ${
        featured
          ? "bg-[#D4A574]/10 text-[#D4A574]"
          : "bg-[#F0F0EE] text-[#999] hover:text-[#6B6B6B]"
      }`}
    >
      {loading ? "..." : featured ? "Featured" : "Feature"}
    </button>
  );
}
