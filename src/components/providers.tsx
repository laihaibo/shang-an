"use client";

import { StoreProvider } from "@/lib/store";
import { BottomNav } from "./bottom-nav";
import { Splash } from "./splash";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="app-bg" aria-hidden>
        <div className="blob-extra" />
      </div>
      <Splash />
      <a
        href="#content"
        className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-[12px] focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[14px] focus:text-white"
      >
        跳到主要内容
      </a>
      <div id="content" className="min-h-dvh pb-safe">
        <div className="mx-auto w-full max-w-[960px] px-4 pt-2 sm:px-6">
          {children}
        </div>
      </div>
      <BottomNav />
    </StoreProvider>
  );
}
