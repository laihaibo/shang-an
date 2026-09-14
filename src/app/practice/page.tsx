"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { MODULES } from "@/lib/types";
import { MODULE_LABEL } from "@/lib/utils";
import { questionsByModule } from "@/content/questions";

export default function PracticeIndexPage() {
  const { moduleProgress } = useStore();

  return (
    <main>
      <PageHeader
        title="刷题"
        description="按模块练习。选完立刻判对错并看解析。"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {MODULES.map((m) => {
          const total = questionsByModule(m.key).length;
          const p = moduleProgress[m.key];
          return (
            <Link key={m.key} href={`/practice/${m.key}/`} className="focus-ring block">
              <Card className="h-full p-5 transition-transform hover:scale-[1.01]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-[20px] font-semibold">
                      {m.name}
                    </h2>
                    <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
                      {m.description}
                    </p>
                  </div>
                  <Badge tone="accent">{MODULE_LABEL[m.key]}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between text-[13px] text-[var(--ink-soft)]">
                  <span>样例 {total} 题</span>
                  <span className="font-mono">
                    {p.attempts === 0 ? "未开始" : `正确率 ${p.accuracy}%`}
                  </span>
                </div>
                <Progress
                  className="mt-2"
                  value={p.attempts === 0 ? 0 : p.accuracy}
                />
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
