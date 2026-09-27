"use client";
/* 初始化 effect 在数据就绪后一次性从 localStorage 恢复模考会话并设置本地状态，
   属预期行为（静态导出下不能用惰性初始化，会有 hydration 差异）。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Timer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { QuestionView } from "@/components/question-view";
import { useStore } from "@/lib/store";
import { getPaper, questionMap, standardMockPapers } from "@/content/questions";
import type { MockPaper, MockResult, ModuleKey } from "@/lib/types";
import { MODULES } from "@/lib/types";
import { MODULE_LABEL, formatDuration, cn, accuracy } from "@/lib/utils";

function buildWrongPack(wrongIds: string[]) {
  const ids = wrongIds.filter((id) => questionMap[id]).slice(0, 20);
  return {
    id: "wrong-pack",
    title: "待复盘错题卷",
    description: "从错题本抽取，限时完成。",
    minutes: Math.max(10, Math.min(30, Math.round(ids.length * 1.2) || 10)),
    questionIds: ids,
  };
}

export default function MockRunnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { ready, state, addMockResult, recordAnswer, setMockSession } = useStore();

  const [phase, setPhase] = useState<"loading" | "empty" | "running">("loading");
  const [paper, setPaper] = useState<MockPaper | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [idx, setIdx] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [restored, setRestored] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [wide, setWide] = useState(false);
  const submittedRef = useRef(false);

  // 初始化 / 恢复：数据就绪后执行一次。
  // 有未过期会话 → 按快照卷恢复（wrong-pack 不受错题列表变动影响）；已过期 → 丢弃重开。
  const initRef = useRef(false);
  useEffect(() => {
    if (!ready || initRef.current) return;
    initRef.current = true;
    const saved = state.activeMock;
    if (saved && saved.paper.id === id && Date.now() < saved.deadline) {
      setPaper(saved.paper);
      setAnswers(saved.answers);
      setIdx(
        Math.min(saved.index, Math.max(0, saved.paper.questionIds.length - 1))
      );
      setStartedAt(saved.startedAt);
      setDeadline(saved.deadline);
      setRemaining(Math.max(0, Math.floor((saved.deadline - Date.now()) / 1000)));
      setRestored(true);
      setPhase(saved.paper.questionIds.length === 0 ? "empty" : "running");
      return;
    }
    const p =
      id === "wrong-pack"
        ? buildWrongPack(
            state.wrong.filter((w) => !w.mastered).map((w) => w.questionId)
          )
        : getPaper(id) ?? standardMockPapers[0];
    if (saved && saved.paper.id === id) setMockSession(null);
    setPaper(p);
    if (p.questionIds.length === 0) {
      setPhase("empty");
      return;
    }
    const now = Date.now();
    setStartedAt(now);
    setDeadline(now + p.minutes * 60000);
    setRemaining(p.minutes * 60);
    setPhase("running");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id]);

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const questions = useMemo(
    () => (paper ? paper.questionIds.map((qid) => questionMap[qid]).filter(Boolean) : []),
    [paper]
  );

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (!paper || questions.length === 0) {
      router.push("/mock/");
      return;
    }
    const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
    // 未答题补 null 键，报告页据此显示未答数量
    const finalAnswers: Record<string, number | null> = {};
    for (const q of questions) finalAnswers[q.id] = answers[q.id] ?? null;
    const byModule = {} as MockResult["byModule"];
    for (const m of MODULES) {
      byModule[m.key as ModuleKey] = { total: 0, correct: 0, seconds: 0 };
    }
    let correct = 0;
    for (const q of questions) {
      const sel = finalAnswers[q.id];
      const ok = sel === q.answer;
      byModule[q.module].total += 1;
      if (ok) {
        byModule[q.module].correct += 1;
        correct += 1;
      }
    }
    const result: MockResult = {
      id: `mock-${Date.now()}`,
      paperId: paper.id,
      title: paper.title,
      startedAt,
      submittedAt: Date.now(),
      durationSeconds,
      answers: finalAnswers,
      total: questions.length,
      correct,
      byModule,
    };
    // addMockResult 会同时清除进行中的 activeMock
    addMockResult(result);
    for (const q of questions) {
      const sel = finalAnswers[q.id];
      if (sel == null) continue;
      recordAnswer(q, sel, "mock", result.id);
    }
    router.push(`/mock/report/?id=${result.id}`);
  }, [answers, addMockResult, paper, questions, router, startedAt, recordAnswer]);

  // 倒计时以 deadline 为基准，interval 不随作答重建，避免漂移
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  useEffect(() => {
    if (phase !== "running" || !deadline) return;
    const tick = () => {
      const remain = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemaining(remain);
      if (remain <= 0) {
        setTimeout(() => submitRef.current(), 0);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [phase, deadline]);

  // 进行中的模考落盘，刷新/退出可恢复
  useEffect(() => {
    if (phase !== "running" || !paper || !deadline || !startedAt) return;
    setMockSession({ paper, answers, index: idx, startedAt, deadline });
  }, [phase, paper, answers, idx, startedAt, deadline, setMockSession]);

  const current = questions[idx];
  const answeredCount = questions.filter((q) => answers[q.id] != null).length;
  const unansweredCount = questions.length - answeredCount;

  const onSelect = (i: number) => {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.id]: i }));
  };

  if (phase === "loading") {
    return (
      <main aria-busy="true">
        <PageHeader title="模考" backHref="/mock/" />
        <Card className="h-40 animate-pulse" aria-hidden />
      </main>
    );
  }

  if (phase === "empty" || !paper) {
    return (
      <main>
        <PageHeader title="无法开始" backHref="/mock/" />
        <Card className="p-5">
          <p className="text-[15px]">
            {id === "wrong-pack"
              ? "当前没有待复盘错题，先去刷题积累错题。"
              : "该试卷没有可用题目。"}
          </p>
          <Button className="mt-4" onClick={() => router.push("/mock/")}>
            返回模考
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main>
      <PageHeader
        title={paper.title}
        description="限时作答，可回看已做题目。到时自动交卷。"
        backHref="/mock/"
        action={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "glass inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-mono text-[13px] font-medium",
                remaining < 120 && "text-[var(--danger)]"
              )}
            >
              <Timer size={14} />
              {formatDuration(remaining)}
            </span>
            <Button size="sm" onClick={() => setConfirmOpen(true)}>
              <Flag size={16} /> 交卷
            </Button>
          </div>
        }
      />

      <div className="mb-3 flex items-center justify-between text-[13px] text-[var(--ink-soft)]">
        <span>
          {idx + 1} / {questions.length} · 已答 {answeredCount}
        </span>
        <span className="font-mono">
          {accuracy(answeredCount, questions.length)}% 已完成
        </span>
      </div>

      {restored ? (
        <p className="glass mb-3 rounded-[12px] px-3 py-2 text-[13px] text-[var(--ink-soft)]">
          已恢复上次进度，倒计时按剩余时间继续。
        </p>
      ) : null}

      {wide ? (
        <div className="grid grid-cols-[1fr_240px] gap-4">
          <div className="space-y-3">
            {current ? (
              <QuestionView
                question={current}
                mode="mock"
                selectedIndex={answers[current.id] ?? null}
                onSelect={onSelect}
                highlight={state.settings.highlightKeywords}
                showIndex={idx + 1}
              />
            ) : null}
            <div className="flex justify-between">
              <Button
                variant="secondary"
                disabled={idx === 0}
                onClick={() => setIdx((i) => i - 1)}
              >
                上一题
              </Button>
              <Button
                disabled={idx + 1 >= questions.length}
                onClick={() => setIdx((i) => i + 1)}
              >
                下一题
              </Button>
            </div>
          </div>
          <Card className="h-fit p-4">
            <p className="mb-2 text-[13px] font-medium">答题卡</p>
            <div className="grid grid-cols-4 gap-1.5">
              {questions.map((q, i) => {
                const ans = answers[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={cn(
                      "focus-ring aspect-square rounded-[12px] text-[12px] font-medium",
                      i === idx
                        ? "bg-[var(--accent)] text-white"
                        : ans != null
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-[var(--ink-soft)]"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[12px] text-[var(--muted)]">
              蓝底为已答。桌面/横屏侧栏总览。
            </p>
          </Card>
        </div>
      ) : (
        <>
          {current ? (
            <QuestionView
              question={current}
              mode="mock"
              selectedIndex={answers[current.id] ?? null}
              onSelect={onSelect}
              highlight={state.settings.highlightKeywords}
              showIndex={idx + 1}
            />
          ) : null}
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={idx === 0}
              onClick={() => setIdx((i) => i - 1)}
            >
              上一题
            </Button>
            <span className="font-mono text-[12px] text-[var(--ink-soft)]">
              {idx + 1}
            </span>
            <Button
              size="sm"
              disabled={idx + 1 >= questions.length}
              onClick={() => setIdx((i) => i + 1)}
            >
              下一题
            </Button>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-[12px] font-medium text-[var(--ink-soft)]">
              答题卡
            </p>
            <div className="glass grid grid-cols-6 gap-1.5 rounded-[20px] p-3">
              {questions.map((q, i) => {
                const ans = answers[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={cn(
                      "focus-ring aspect-square rounded-[12px] text-[12px] font-medium",
                      i === idx
                        ? "bg-[var(--accent)] text-white"
                        : ans != null
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-[var(--ink-soft)]"
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {MODULES.map((m) => (
          <Badge key={m.key}>
            {MODULE_LABEL[m.key]}{" "}
            {
              questions.filter((q) => q.module === m.key && answers[q.id] != null)
                .length
            }
            /{questions.filter((q) => q.module === m.key).length}
          </Badge>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="确认交卷？"
        description={
          unansweredCount > 0
            ? `还有 ${unansweredCount} 题未作答，未答题按错误计。交卷后立即出报告。`
            : "全部作答完毕，交卷后立即出报告。"
        }
        confirmLabel="交卷"
        onConfirm={() => {
          setConfirmOpen(false);
          submit();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  );
}
