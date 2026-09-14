import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "danger" | "warning" | "accent";
}) {
  const tones: Record<string, string> = {
    default:
      "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-[var(--ink-soft)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
    warning: "bg-[var(--warning-soft)] text-[#c93400] dark:text-[var(--warning)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
