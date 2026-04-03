"use client";

import { useState, useEffect } from "react";
import { getNextSaturdayMidnight, isEntriesClosed } from "@/lib/utils";

export default function EntryCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    function update() {
      if (isEntriesClosed()) {
        setClosed(true);
        setTimeLeft(null);
        return;
      }

      setClosed(false);
      const target = getNextSaturdayMidnight().getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (closed) {
    return (
      <div className="text-center">
        <p className="font-[family-name:var(--font-playfair)] text-xl text-[#D4A574] font-semibold">
          Entries closed &mdash; entry announced Sunday
        </p>
      </div>
    );
  }

  if (!timeLeft) {
    // Still loading (SSR / initial render)
    return (
      <div className="flex justify-center gap-6">
        {["days", "hrs", "min"].map((label) => (
          <div key={label} className="text-center">
            <div className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
              --
            </div>
            <div className="text-xs uppercase tracking-wider text-[#6B6B6B] mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-6">
      <div className="text-center">
        <div className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
          {timeLeft.days}
        </div>
        <div className="text-xs uppercase tracking-wider text-[#6B6B6B] mt-1">
          days
        </div>
      </div>
      <div className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-[#E8E6E3] self-start">
        :
      </div>
      <div className="text-center">
        <div className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
          {String(timeLeft.hours).padStart(2, "0")}
        </div>
        <div className="text-xs uppercase tracking-wider text-[#6B6B6B] mt-1">
          hrs
        </div>
      </div>
      <div className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-[#E8E6E3] self-start">
        :
      </div>
      <div className="text-center">
        <div className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
          {String(timeLeft.minutes).padStart(2, "0")}
        </div>
        <div className="text-xs uppercase tracking-wider text-[#6B6B6B] mt-1">
          min
        </div>
      </div>
    </div>
  );
}
