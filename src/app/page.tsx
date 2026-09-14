"use client";

import Link from "next/link";
import {
  BookOpenCheck,
  ClipboardCheck,
  GraduationCap,
  MessagesSquare,
  NotebookPen,
  Search,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { MODULES } from "@/lib/types";
import { MODULE_LABEL, accuracy, formatDuration } from "@/lib/utils";

const shortcuts = [
  { href: "/tips/", label: "技巧手册", icon: Sparkles },
  { href: "/essay/", label: "申论课程", icon: GraduationCap },
  { href: "/interview/", label: "面试练习", icon: MessagesSquare },
  { href: "/search/", label: "搜索", icon: Search },
];

export default function HomePage() {
  const {
    state,
    ready,
    moduleProgress,
    pendingReviewCount,
    wrongCount,
  } = useStore();

  const lastMock = state.mockResults[0];
  const todayAttempts = state.attempts.filter((a) => {
    const d = new Date(a.at);
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate()
    );
  }).length;

  return (
    <main>
      <PageHeader
        title="上岸"
        description="把今天的 20 分钟，变成可复用的判断力。"
      />

      <Card strong className="mb-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] text-[var(--ink-soft)]">今日进度</p>
            <p className="mt-1 font-display text-[40px] font-semibold leading-none">
              {ready ? todayAttempts : "—"}
              <span className="ml-1 text-[16px] font-medium text-[var(--ink-soft)]">
                题
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="accent">连续 {state.streakDays || 0} 天</Badge>
              <Badge tone={pendingReviewCount > 0 ? "warning" : "default"}>
                待复盘 {pendingReviewCount}
              </Badge>
              <Badge>错题 {wrongCount}</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild size="sm">
              <Link href="/practice/">继续刷题</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/wrong/">去复盘</Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {shortcuts.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="glass focus-ring flex flex-col items-center gap-2 rounded-[20px] px-3 py-4 text-center transition-transform hover:scale-[1.02]"
            >
              <Icon size={22} className="text-[var(--accent)]" />
              <span className="text-[13px] font-medium">{s.label}</span>
            </Link>
          );
        })}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>模块掌握</CardTitle>
          <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
            基于已做题目正确率，不是官方赋分。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {MODULES.map((m) => {
            const p = moduleProgress[m.key];
            const acc = p.accuracy;
            const tone =
              acc >= 75 ? "success" : acc >= 50 ? "accent" : acc > 0 ? "warning" : "accent";
            return (
              <div key={m.key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[14px] font-medium">{MODULE_LABEL[m.key]}</span>
                    <span className="ml-2 text-[12px] text-[var(--ink-soft)]">
                      {p.attempts === 0 ? "未开始" : `${p.correct}/${p.attempts} 正确`}
                    </span>
                  </div>
                  <span className="font-mono text-[13px] font-medium">
                    {p.attempts === 0 ? "—" : `${acc}%`}
                  </span>
                </div>
                <Progress value={p.attempts === 0 ? 0 : acc} tone={tone} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-[13px] text-[var(--ink-soft)]">最近模考</p>
          {lastMock ? (
            <>
              <p className="mt-1 font-display text-[28px] font-semibold">
                {accuracy(lastMock.correct, lastMock.total)}%
              </p>
              <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
                {lastMock.title} · 用时 {formatDuration(lastMock.durationSeconds)}
              </p>
              <Button asChild variant="secondary" size="sm" className="mt-3">
                <Link href={`/mock/report/?id=${lastMock.id}`}>查看报告</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="mt-2 text-[15px]">还没有模考记录</p>
              <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
                建议学完一个模块后先做一次标准卷。
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link href="/mock/">开始模考</Link>
              </Button>
            </>
          )}
        </Card>

        <Card className="p-5">
          <p className="text-[13px] text-[var(--ink-soft)]">快速入口</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/practice/verbal/">
                <BookOpenCheck size={16} /> 言语刷题
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/practice/data/">
                <BookOpenCheck size={16} /> 资料刷题
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/wrong/">
                <NotebookPen size={16} /> 错题本
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/mock/">
                <ClipboardCheck size={16} /> 标准卷
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
