"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, NotebookPen, Timer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { standardMockPapers, questionMap } from "@/content/questions";
import { MODULES } from "@/lib/types";
import { MODULE_LABEL, accuracy, formatDuration } from "@/lib/utils";

export default function MockIndexPage() {
  const { state, ready, wrongCount, pendingReviewCount } = useStore();
  const [now, setNow] = useState(0);

  // 恢复卡片的剩余时间按秒刷新；now=0 时隐藏，避免渲染期取系统时间
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const pendingIds = state.wrong
    .filter((w) => !w.mastered)
    .map((w) => w.questionId)
    .filter((id) => questionMap[id]);

  const activeMock =
    state.activeMock && now > 0 && now < state.activeMock.deadline
      ? state.activeMock
      : null;

  return (
    <main>
      <PageHeader
        title="模拟考"
        description="标准卷限时训练；也可用待复盘错题组卷。交卷后按模块看正确率。"
      />

      {activeMock ? (
        <Link
          href={`/mock/${activeMock.paper.id}/`}
          className="focus-ring mb-3 flex items-center justify-between rounded-[20px] border border-[var(--accent)] bg-[var(--accent-soft)] p-4"
        >
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[var(--accent)]">
              有未完成的模考
            </p>
            <p className="mt-0.5 truncate text-[15px] font-medium">
              {activeMock.paper.title} · 剩{" "}
              {formatDuration(Math.floor((activeMock.deadline - now) / 1000))}
            </p>
          </div>
          <span className="shrink-0 text-[14px] font-medium text-[var(--accent)]">
            继续作答 →
          </span>
        </Link>
      ) : null}

      <div className="space-y-3">
        {standardMockPapers.map((paper) => (
          <Card key={paper.id} strong className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="accent">
                    <Timer size={12} className="mr-1" />
                    {paper.minutes} 分钟
                  </Badge>
                  <Badge>{paper.questionIds.length} 题</Badge>
                </div>
                <h2 className="font-display text-[22px] font-semibold">
                  {paper.title}
                </h2>
                <p className="mt-1 text-[14px] text-[var(--ink-soft)]">
                  {paper.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {MODULES.map((m) => {
                    const n = paper.questionIds.filter((id) =>
                      id.startsWith(m.key + "-")
                    ).length;
                    if (!n) return null;
                    return (
                      <Badge key={m.key}>
                        {MODULE_LABEL[m.key]} {n}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <Button asChild>
                <Link href={`/mock/${paper.id}/`}>
                  <ClipboardCheck size={18} /> 开始
                </Link>
              </Button>
            </div>
          </Card>
        ))}

        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[20px] font-semibold">
                错题组卷
              </h2>
              <p className="mt-1 text-[14px] text-[var(--ink-soft)]">
                {!ready
                  ? "读取错题本中…"
                  : pendingIds.length > 0
                    ? `从 ${pendingIds.length} 道待复盘错题抽题，建议 20 分钟。`
                    : "当前没有待复盘错题。先去刷题积累错题。"}
              </p>
            </div>
            {pendingIds.length > 0 ? (
              <Button asChild variant="secondary">
                <Link href={`/mock/wrong-pack/`}>
                  <NotebookPen size={18} /> 开始错题卷
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/practice/">去刷题</Link>
              </Button>
            )}
          </div>
          {wrongCount > 0 ? (
            <p className="mt-3 text-[12px] text-[var(--muted)]">
              错题本共 {wrongCount} 题 · 待复盘 {pendingReviewCount}
            </p>
          ) : null}
        </Card>
      </div>

      {state.mockResults.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 font-display text-[18px] font-semibold">历史成绩</h2>
          <div className="space-y-2">
            {state.mockResults.slice(0, 8).map((r) => (
              <Link
                key={r.id}
                href={`/mock/report/?id=${r.id}`}
                className="glass focus-ring flex items-center justify-between rounded-[20px] px-4 py-3 text-[14px] hover:brightness-[1.03]"
              >
                <span className="truncate">{r.title}</span>
                <span className="ml-3 shrink-0 font-mono font-medium">
                  {accuracy(r.correct, r.total)}%
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
