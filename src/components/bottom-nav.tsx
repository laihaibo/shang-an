"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpenCheck,
  ClipboardCheck,
  NotebookPen,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "首页", icon: Home },
  { href: "/practice/", label: "刷题", icon: BookOpenCheck },
  { href: "/mock/", label: "模考", icon: ClipboardCheck },
  { href: "/wrong/", label: "错题", icon: NotebookPen },
  { href: "/me/", label: "我的", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="glass-strong fixed inset-x-0 bottom-0 z-50 border-t"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="主导航"
    >
      <ul className="mx-auto flex h-16 w-full max-w-[560px] items-stretch">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/" || pathname === "/shang-an" || pathname === "/shang-an/"
              : pathname.startsWith(item.href.replace(/\/$/, "")) ||
                pathname.includes(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "focus-ring flex h-full flex-col items-center justify-center gap-0.5 text-[11px] transition-colors",
                  active
                    ? "text-[var(--accent)]"
                    : "text-[var(--ink-soft)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.2 : 1.8}
                  fill={active ? "currentColor" : "none"}
                  fillOpacity={active ? 0.12 : 0}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
