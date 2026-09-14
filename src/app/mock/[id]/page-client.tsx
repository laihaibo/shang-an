"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Timer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionView } from "@/components/question-view";
import { useStore } from "@/lib/store";
import { getPaper, questionMap, standardMockPapers } from "@/content/questions";
import type { MockResult, ModuleKey } from "@/lib/types";
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
  const { state, addMockResult, recordAnswer } = useStore();

  const paper = useMemo(() => {
    if (id === "wrong-pack") {
      return buildWrongPack(
        state.wrong.filter((w) => !w.mastered).map((w) => w.questionId)
      );
    }
    return getPaper(id) ?? standardMockPapers[0];
  }, [id, state.wrong]);

  const questions = useMemo(
    () => paper.questionIds.map((qid) => questionMap[qid]).filter(Boolean),
    [paper.questionIds]
  );

  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(() => paper.minutes * 60);
  const [startedAt] = useState(() => Date.now());
  const [wide, setWide] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    if (questions.length === 0) {
      router.push("/mock/");
      return;
    }
    submittedRef.current = true;
    const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
    const byModule = {} as MockResult["byModule"];
    for (const m of MODULES) {
      byModule[m.key as ModuleKey] = { total: 0, correct: 0, seconds: 0 };
    }
    let correct = 0;
    for (const q of questions) {
      const sel = answers[q.id];
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
      answers: { ...answers },
      total: questions.length,
      correct,
      byModule,
    };
    addMockResult(result);
    for (const q of questions) {
      const sel = answers[q.id];
      if (sel == null) continue;
      recordAnswer(q, sel, "mock", result.id);
    }
    router.push(`/mock/report/?id=${result.id}`);
  }, [answers, addMockResult, paper, questions, router, startedAt, recordAnswer]);

  useEffect(() => {
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          setTimeout(() => submit(), 0);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submit]);

  const current = questions[idx];
  const answeredCount = questions.filter((q) => answers[q.id] != null).length;

  const onSelect = (i: number) => {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.id]: i }));
  };

  if (questions.length === 0) {
    return (
      <main>
        <PageHeader title="无法开始" backHref="/mock/" />
        <Card className="p-5">
          <p className="text-[15px]">该试卷没有可用题目。</p>
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
            <Button size="sm" onClick={submit}>
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
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const ans = answers[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={cn(
                      "focus-ring aspect-square rounded-lg text-[12px] font-medium",
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
            <div className="glass grid grid-cols-8 gap-1.5 rounded-[16px] p-3">
              {questions.map((q, i) => {
                const ans = answers[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={cn(
                      "focus-ring aspect-square rounded-lg text-[11px] font-medium",
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
    </main>
  );
}
