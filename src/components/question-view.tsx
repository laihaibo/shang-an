"use client";

import { useMemo, useState } from "react";
import { cn, extractKeywords } from "@/lib/utils";
import type { Question } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

export function QuestionMaterialBlock({
  material,
}: {
  material?: Question["material"];
}) {
  if (!material) return null;
  return (
    <div className="mb-4 space-y-3">
      {material.text ? (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--ink-soft)]">
          {material.text}
        </p>
      ) : null}
      {material.table ? (
        <div className="overflow-x-auto rounded-[12px] border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)]">
          <table className="w-full min-w-[320px] border-collapse text-[13px]">
            <thead>
              <tr className="bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]">
                {material.table.headers.map((h) => (
                  <th
                    key={h}
                    className="border-b px-3 py-2 text-left font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {material.table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border-b px-3 py-2"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export function HighlightedText({
  text,
  keywords,
  enabled,
}: {
  text: string;
  keywords: string[];
  enabled: boolean;
}) {
  if (!enabled || keywords.length === 0) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }
  const pattern = new RegExp(`(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(pattern);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((p, i) =>
        keywords.includes(p) ? (
          <mark
            key={i}
            className="rounded bg-[var(--warning-soft)] px-0.5 text-inherit"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}

export function QuestionView({
  question,
  mode,
  selectedIndex,
  onSelect,
  highlight = true,
  showIndex,
}: {
  question: Question;
  mode: "practice" | "mock" | "review";
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  highlight?: boolean;
  showIndex?: number;
}) {
  const keywords = useMemo(
    () => extractKeywords(question.stem, highlight ? 2 : 0),
    [question.stem, highlight]
  );
  const revealed = mode !== "mock" && selectedIndex != null;
  const correct = selectedIndex === question.answer;

  return (
    <Card className="rise-in p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {showIndex != null ? (
          <Badge tone="accent">第 {showIndex} 题</Badge>
        ) : null}
        {question.tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
      <QuestionMaterialBlock material={question.material} />
      <p className="text-[16px] font-medium leading-relaxed">
        <HighlightedText
          text={question.stem}
          keywords={keywords}
          enabled={highlight}
        />
      </p>
      <ul className="mt-4 space-y-2">
        {question.options.map((opt, i) => {
          const selected = selectedIndex === i;
          const isAnswer = mode !== "mock" && i === question.answer;
          const state = revealed
            ? isAnswer
              ? "correct"
              : selected
                ? "wrong"
                : "idle"
            : selected
              ? "selected"
              : "idle";
          return (
            <li key={i}>
              <button
                type="button"
                disabled={mode === "review" || (mode === "practice" && selectedIndex != null)}
                onClick={() => onSelect?.(i)}
                className={cn(
                  "focus-ring w-full rounded-[14px] border px-4 py-3 text-left text-[15px] leading-relaxed transition-colors",
                  state === "idle" &&
                    "border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]",
                  state === "selected" &&
                    "border-[var(--accent)] bg-[var(--accent-soft)]",
                  state === "correct" &&
                    "border-[var(--success)] bg-[var(--success-soft)]",
                  state === "wrong" &&
                    "border-[var(--danger)] bg-[var(--danger-soft)] shake"
                )}
              >
                <span className="mr-2 font-semibold text-[var(--ink-soft)]">
                  {optionLabels[i]}
                </span>
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {revealed ? (
        <div
          className={cn(
            "mt-4 rounded-[14px] p-4 text-[14px] leading-relaxed",
            correct
              ? "bg-[var(--success-soft)]"
              : "bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]"
          )}
        >
          <p className="mb-1 font-semibold">
            {correct ? "回答正确" : `正确答案 ${optionLabels[question.answer]}`}
          </p>
          <p className="text-[var(--ink-soft)]">{question.analysis}</p>
        </div>
      ) : null}
    </Card>
  );
}

export function useQuestionLocalAnswer(initial?: number | null) {
  const [selected, setSelected] = useState<number | null>(initial ?? null);
  return { selected, setSelected };
}
