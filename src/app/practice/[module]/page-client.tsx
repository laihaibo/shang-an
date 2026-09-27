"use client";
/* 本页职责是从 localStorage 恢复刷题会话，恢复路径上的 setState 同步发生在
   一次性 effect 中属于预期行为（静态导出下不能用惰性初始化，会有 hydration 差异）。 */
/* eslint-disable react-hooks/set-state-in-effect */

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { QuestionView } from "@/components/question-view";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { MODULES, type ActivePractice, type ModuleKey } from "@/lib/types";
import { questionsByModule } from "@/content/questions";
import { cn } from "@/lib/utils";

type SessionAnswer = { selected: number; correct: boolean };

function isValidModule(key: string): key is ModuleKey {
  return MODULES.some((m) => m.key === key);
}

export default function PracticeModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleParam } = use(params);
  const search = useSearchParams();
  const router = useRouter();
  const { ready, recordAnswer, state, setPracticeSession } = useStore();
  const highlight = state.settings.highlightKeywords;

  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SessionAnswer>>({});
  const [done, setDone] = useState(false);
  // 续作 / 搜索直达定位，只在数据就绪后执行一次
  const restoredRef = useRef(false);

  const moduleInfo = useMemo(
    () => MODULES.find((m) => m.key === moduleParam),
    [moduleParam]
  );
  const valid = isValidModule(moduleParam);
  const bank = useMemo(
    () => (valid ? questionsByModule(moduleParam) : []),
    [valid, moduleParam]
  );

  const sequence = useMemo(() => {
    if (order.length === bank.length) return order;
    return bank.map((_, i) => i);
  }, [order, bank]);

  const correctCount = useMemo(
    () => Object.values(answers).filter((a) => a.correct).length,
    [answers]
  );

  const current = valid ? bank[sequence[idx]] : undefined;
  const selected = current ? (answers[current.id]?.selected ?? null) : null;

  const startShuffle = () => {
    const arr = bank.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setOrder(arr);
    setIdx(0);
    setAnswers({});
    setDone(false);
  };

  const reset = () => {
    setOrder([]);
    setIdx(0);
    setAnswers({});
    setDone(false);
    setPracticeSession(null);
  };

  const onSelect = (i: number) => {
    if (!current) return;
    if (answers[current.id]) return; // 已答过的题不再计数
    const ok = recordAnswer(current, i, "practice");
    setAnswers((a) => ({ ...a, [current.id]: { selected: i, correct: ok } }));
  };

  const goNext = () => {
    if (idx + 1 >= sequence.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
  };

  const goPrev = () => {
    setIdx((i) => Math.max(0, i - 1));
  };

  // 恢复上次会话或定位 ?q= 指定的题目
  useEffect(() => {
    if (!ready || restoredRef.current || !isValidModule(moduleParam)) return;
    restoredRef.current = true;
    const bankNow = questionsByModule(moduleParam);
    const saved = state.activePractice;
    const qParam = search.get("q");

    if (qParam) {
      const qi = bankNow.findIndex((q) => q.id === qParam);
      if (qi >= 0) {
        // 已有会话包含该题 → 在会话内跳转；否则从该题开一组新的
        if (
          saved &&
          saved.module === moduleParam &&
          saved.order.length === bankNow.length &&
          saved.order.includes(qi)
        ) {
          setOrder(saved.order);
          setIdx(saved.order.indexOf(qi));
          setAnswers(saved.answers);
        } else {
          setOrder([]);
          setIdx(qi);
          setAnswers({});
          setPracticeSession(null);
        }
        return;
      }
    }

    if (
      saved &&
      saved.module === moduleParam &&
      (saved.order.length === bankNow.length || saved.order.length === 0) &&
      Object.keys(saved.answers).length > 0
    ) {
      setOrder(saved.order);
      setIdx(Math.min(saved.index, Math.max(0, bankNow.length - 1)));
      setAnswers(saved.answers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, moduleParam]);

  // 会话进度持久化；完成即清除
  useEffect(() => {
    if (!ready || !isValidModule(moduleParam) || done) return;
    if (order.length === 0 && idx === 0 && Object.keys(answers).length === 0) {
      return;
    }
    const session: ActivePractice = {
      module: moduleParam,
      order: order.length === bank.length ? order : [],
      index: idx,
      answers,
      savedAt: Date.now(),
    };
    setPracticeSession(session);
  }, [ready, done, moduleParam, order, idx, answers, bank.length, setPracticeSession]);

  useEffect(() => {
    if (done) setPracticeSession(null);
  }, [done, setPracticeSession]);

  // 快捷键全局生效；焦点在输入控件时跳过
  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.key >= "1" && e.key <= "4") {
        e.preventDefault();
        onSelect(Number(e.key) - 1);
      }
      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!valid || !moduleInfo) {
    return (
      <main>
        <PageHeader title="模块不存在" backHref="/practice/" />
      </main>
    );
  }

  return (
    <main>
      <PageHeader
        title={moduleInfo.short}
        description={moduleInfo.name}
        backHref="/practice/"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={startShuffle} title="乱序">
              <Shuffle size={16} />
            </Button>
            <Button size="sm" variant="secondary" onClick={reset} title="重置">
              <RotateCcw size={16} />
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex items-center justify-between text-[13px] text-[var(--ink-soft)]">
        <span>
          {idx + 1} / {sequence.length}
        </span>
        <span className="font-mono">本组正确 {correctCount}</span>
      </div>

      {done ? (
        <div className="glass-strong rise-in rounded-[24px] p-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-soft)]">
            <Check size={28} className="text-[var(--success)]" />
          </div>
          <h2 className="font-display text-[24px] font-semibold">本组完成</h2>
          <p className="mt-2 text-[15px] text-[var(--ink-soft)]">
            共 {sequence.length} 题，正确 {correctCount} 题
            {sequence.length > 0
              ? `（${Math.round((correctCount / sequence.length) * 100)}%）`
              : ""}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={reset}>再刷一组</Button>
            <Button variant="secondary" onClick={() => router.push("/wrong/")}>
              看错题本
            </Button>
            <Button variant="ghost" onClick={() => router.push("/practice/")}>
              换模块
            </Button>
          </div>
        </div>
      ) : current ? (
        <>
          <QuestionView
            question={current}
            mode="practice"
            selectedIndex={selected}
            onSelect={onSelect}
            highlight={highlight}
            showIndex={idx + 1}
            split
          />
          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goPrev} disabled={idx === 0}>
              <ChevronLeft size={16} /> 上一题
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(sequence.length, 12) }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full",
                    i === idx
                      ? "w-4 bg-[var(--accent)]"
                      : "w-1.5 bg-[color-mix(in_srgb,var(--foreground)_18%,transparent)]"
                  )}
                />
              ))}
            </div>
            <Button size="sm" onClick={goNext}>
              {idx + 1 === sequence.length ? "完成" : "下一题"}
              <ChevronRight size={16} />
            </Button>
          </div>
          <p className="mt-3 text-center text-[12px] text-[var(--muted)]">
            快捷键：1–4 选择 · J/K 切换
          </p>
        </>
      ) : (
        <div className="glass rounded-[20px] p-6 text-center text-[var(--ink-soft)]">
          题库为空
        </div>
      )}
    </main>
  );
}
