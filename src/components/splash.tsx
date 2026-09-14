"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Splash() {
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHide(true), 900);
    const t2 = setTimeout(() => setGone(true), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]",
        hide && "splash-out"
      )}
      aria-hidden={gone}
    >
      <div className="relative flex flex-col items-center gap-4">
        <div className="glass-strong flex h-24 w-24 items-center justify-center rounded-[28px]">
          <span className="font-display text-[28px] font-semibold tracking-tight">
            上岸
          </span>
        </div>
        <p className="text-[13px] tracking-[0.2em] text-[var(--ink-soft)]">
          SHANG AN
        </p>
      </div>
    </div>
  );
}
