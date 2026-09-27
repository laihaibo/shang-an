import { cn } from "@/lib/utils";

/** 数据未就绪时的占位块 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-[20px] bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]",
        className
      )}
    />
  );
}
