"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MODULES } from "@/lib/types";
import { MODULE_LABEL } from "@/lib/utils";
import { tipsByModule } from "@/content/tips";

export default function TipsPage() {
  return (
    <main>
      <PageHeader
        title="技巧手册"
        description="行测各模块高频套路，刷题前后对照着看。"
        backHref="/"
      />
      <div className="space-y-4">
        {MODULES.map((m) => {
          const list = tipsByModule(m.key);
          return (
            <Card key={m.key} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-[20px] font-semibold">
                  {m.name}
                </h2>
                <Badge tone="accent">{MODULE_LABEL[m.key]}</Badge>
              </div>
              <ul className="space-y-3">
                {list.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tips/${m.key}/`}
                      className="focus-ring block rounded-[12px] p-2 hover:bg-[var(--accent-soft)]"
                    >
                      <p className="text-[15px] font-medium">{t.title}</p>
                      <p className="mt-0.5 text-[13px] text-[var(--ink-soft)]">
                        {t.summary}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
