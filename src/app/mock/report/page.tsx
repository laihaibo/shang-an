"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { questionMap } from "@/content/questions";
import { MODULES } from "@/lib/types";
import {
  MODULE_LABEL,
  accuracy,
  formatDuration,
  formatDate,
} from "@/lib/utils";

function ReportInner() {
  const search = useSearchParams();
  const id = search.get("id");
  const { state } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const result = id
    ? state.mockResults.find((r) => r.id === id)
    : state.mockResults[0];

  if (!ready) {
    return (
      <main>
        <PageHeader title="模考报告" backHref="/mock/" />
      </main>
    );
  }

  if (!result) {
    return (
      <main>
        <PageHeader title="报告不存在" backHref="/mock/" />
        <Card className="p-5">
          <p className="text-[15px] text-[var(--ink-soft)]">
            可能已清除本地数据，或链接来自另一台设备。请先完成一次模考。
          </p>
          <Button asChild className="mt-4">
            <Link href="/mock/">去模考</Link>
          </Button>
        </Card>
      </main>
    );
  }

  const wrongList = Object.entries(result.answers)
    .filter(([qid, sel]) => {
      const q = questionMap[qid];
      return q && sel != null && sel !== q.answer;
    })
    .map(([qid]) => questionMap[qid]);

  const unanswered = Object.values(result.answers).filter(
    (sel) => sel == null
  ).length;

  return (
    <main>
      <PageHeader
        title="模考报告"
        description={`${result.title} · ${formatDate(result.submittedAt)}`}
        backHref="/mock/"
      />

      <Card strong className="mb-4 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-[var(--ink-soft)]">总正确率</p>
            <p className="font-display text-[56px] font-semibold leading-none tracking-tight">
              {accuracy(result.correct, result.total)}
              <span className="text-[24px]">%</span>
            </p>
            <p className="mt-2 text-[14px] text-[var(--ink-soft)]">
              {result.correct}/{result.total} 正确 · 用时{" "}
              {formatDuration(result.durationSeconds)}
              {unanswered > 0 ? ` · 未答 ${unanswered}` : ""}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/wrong/">整理错题</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/mock/">再来一套</Link>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>模块正确率</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {MODULES.map((m) => {
            const row = result.byModule[m.key];
            if (!row || row.total === 0) return null;
            const acc = accuracy(row.correct, row.total);
            return (
              <div key={m.key}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[14px] font-medium">
                    {MODULE_LABEL[m.key]}
                  </span>
                  <span className="font-mono text-[13px]">
                    {row.correct}/{row.total} · {acc}%
                  </span>
                </div>
                <Progress
                  value={acc}
                  tone={acc >= 75 ? "success" : acc >= 50 ? "accent" : "warning"}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {wrongList.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-[18px] font-semibold">
            本卷错题（{wrongList.length}）
          </h2>
          <div className="space-y-2">
            {wrongList.map((q) => (
              <Link
                key={q.id}
                href={`/wrong/${q.id}/`}
                className="glass focus-ring block rounded-[16px] p-4 hover:brightness-[1.03]"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{MODULE_LABEL[q.module]}</Badge>
                  {q.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
                <p className="line-clamp-2 text-[14px] leading-relaxed">
                  {q.stem}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <Card className="p-5 text-center text-[var(--ink-soft)]">
          本卷没有错题，继续保持。
        </Card>
      )}
    </main>
  );
}

export default function MockReportPage() {
  return (
    <Suspense
      fallback={
        <main>
          <PageHeader title="模考报告" backHref="/mock/" />
        </main>
      }
    >
      <ReportInner />
    </Suspense>
  );
}
