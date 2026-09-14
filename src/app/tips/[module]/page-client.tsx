"use client";

import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MODULES, type ModuleKey } from "@/lib/types";
import { tipsByModule } from "@/content/tips";

export default function TipsModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = use(params);
  const info = MODULES.find((m) => m.key === module);
  const list = tipsByModule(module as ModuleKey);

  return (
    <main>
      <PageHeader
        title={info?.name ?? "技巧"}
        description="套路条目，点开看要点与用法。"
        backHref="/tips/"
      />
      <div className="space-y-3">
        {list.map((t) => (
          <Card key={t.id} className="p-5">
            <h2 className="font-display text-[18px] font-semibold">{t.title}</h2>
            <p className="mt-1 text-[14px] text-[var(--ink-soft)]">{t.summary}</p>
            <ul className="mt-3 space-y-2">
              {t.body.map((line, i) => (
                <li key={i} className="flex gap-2 text-[14px] leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-[13px] text-[var(--muted)]">
        回到
        <Link href="/practice/" className="mx-1 text-[var(--accent)]">
          刷题
        </Link>
        立刻用一次。
      </p>
    </main>
  );
}
