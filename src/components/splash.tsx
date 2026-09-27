"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 规范：仅首访展示，总时长约 700ms。
 * 复访由 layout 内联脚本在首帧前给 <html> 加 .splash-off 隐藏，
 * prefers-reduced-motion 由 CSS 直接隐藏，组件内不做分支。
 */
export function Splash() {
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHide(true), 450);
    const t2 = setTimeout(() => setGone(true), 720);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={cn(
        "splash-overlay fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]",
        hide && "splash-out"
      )}
      aria-hidden
    >
      <div className="relative flex flex-col items-center gap-4">
        <div className="glass-strong flex h-24 w-24 items-center justify-center rounded-[24px]">
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
