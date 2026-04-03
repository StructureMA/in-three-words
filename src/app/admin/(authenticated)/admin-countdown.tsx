"use client";

import { useState, useEffect } from "react";
import { getNextSaturdayMidnight } from "@/lib/utils";

export default function AdminCountdown() {
  const [display, setDisplay] = useState("--");

  useEffect(() => {
    function update() {
      const target = getNextSaturdayMidnight().getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setDisplay("Closed");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setDisplay(`${days}d ${hours}h`);
      } else {
        setDisplay(`${hours}h ${minutes}m`);
      }
    }

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-lg font-bold text-[#2E6B8A]">
      {display}
    </span>
  );
}
