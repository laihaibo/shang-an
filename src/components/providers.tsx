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
      <div className="min-h-dvh pb-safe">
        <div className="mx-auto w-full max-w-[960px] px-4 pt-2 sm:px-6">
          {children}
        </div>
      </div>
      <BottomNav />
    </StoreProvider>
  );
}
