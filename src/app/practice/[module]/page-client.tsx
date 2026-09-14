"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { QuestionView } from "@/components/question-view";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { MODULES, type ModuleKey } from "@/lib/types";
import { questionsByModule } from "@/content/questions";
import { cn } from "@/lib/utils";

function isValidModule(key: string): key is ModuleKey {
  return MODULES.some((m) => m.key === key);
}

export default function PracticeModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleParam } = use(params);
  const router = useRouter();
  const { recordAnswer, state } = useStore();
  const highlight = state.settings.highlightKeywords;

  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const moduleInfo = useMemo(
    () => MODULES.find((m) => m.key === moduleParam),
    [moduleParam]
  );
  const bank = useMemo(
    () => (isValidModule(moduleParam) ? questionsByModule(moduleParam) : []),
    [moduleParam]
  );

  const sequence = useMemo(() => {
    if (order.length === bank.length) return order;
    return bank.map((_, i) => i);
  }, [order, bank.length]);

  if (!isValidModule(moduleParam) || !moduleInfo) {
    return (
      <main>
        <PageHeader title="模块不存在" backHref="/practice/" />
      </main>
    );
  }

  const current = bank[sequence[idx]];

  const startShuffle = () => {
    const arr = bank.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setOrder(arr);
    setIdx(0);
    setSelected(null);
    setCorrectCount(0);
    setDone(false);
  };

  const reset = () => {
    setOrder([]);
    setIdx(0);
    setSelected(null);
    setCorrectCount(0);
    setDone(false);
  };

  const onSelect = (i: number) => {
    if (selected != null || !current) return;
    setSelected(i);
    const ok = recordAnswer(current, i, "practice");
    if (ok) setCorrectCount((c) => c + 1);
  };

  const goNext = () => {
    if (idx + 1 >= sequence.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  };

  const goPrev = () => {
    setIdx((i) => Math.max(0, i - 1));
    setSelected(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (done || !current) return;
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

  return (
    <main onKeyDown={onKeyDown} tabIndex={-1}>
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
            <Button size="sm" onClick={goNext} disabled={selected == null}>
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
