import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  backHref,
  action,
  className,
}: {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-5 pt-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {backHref ? (
            <Link
              href={backHref}
              className="focus-ring mb-1 inline-flex items-center gap-0.5 text-[13px] text-[var(--ink-soft)] hover:text-[var(--accent)]"
            >
              <ChevronLeft size={16} />
              返回
            </Link>
          ) : null}
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-[14px] leading-relaxed text-[var(--ink-soft)]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 pt-1">{action}</div> : null}
      </div>
    </header>
  );
}
