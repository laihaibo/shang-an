"use client";

import { use, useMemo, useState } from "react";
import { Copy, CheckCheck, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { QuestionView } from "@/components/question-view";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { questionMap } from "@/content/questions";
import { MODULE_LABEL, copyText } from "@/lib/utils";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

export default function WrongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { state, setWrongNote, setWrongMastered, removeWrong } = useStore();
  const [copied, setCopied] = useState(false);

  const q = questionMap[id];
  const entry = state.wrong.find((w) => w.questionId === id);
  const lastAttempt = useMemo(
    () => [...state.attempts].reverse().find((a) => a.questionId === id),
    [state.attempts, id]
  );

  if (!q) {
    return (
      <main>
        <PageHeader title="题目不存在" backHref="/wrong/" />
      </main>
    );
  }

  const copyOne = async () => {
    const md = [
      `## ${MODULE_LABEL[q.module]} · ${q.tags.join(" / ") || "错题"}`,
      ``,
      q.material?.text ?? "",
      q.stem,
      ``,
      ...q.options.map(
        (o, i) =>
          `- ${optionLabels[i]}. ${o}${i === q.answer ? "（正确答案）" : ""}`
      ),
      ``,
      `**解析**：${q.analysis}`,
      entry?.note?.trim() ? `**笔记**：${entry.note.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const ok = await copyText(md);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main>
      <PageHeader
        title="错题详情"
        backHref="/wrong/"
        action={
          <Button size="sm" variant="secondary" onClick={copyOne}>
            {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
            {copied ? "已复制" : "复制本题"}
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="accent">{MODULE_LABEL[q.module]}</Badge>
        {entry ? (
          <Badge tone={entry.mastered ? "success" : "warning"}>
            {entry.mastered ? "已掌握" : `错 ${entry.wrongCount} 次`}
          </Badge>
        ) : (
          <Badge>未在错题本</Badge>
        )}
        {lastAttempt && !lastAttempt.correct ? (
          <Badge tone="danger">上次选 {optionLabels[lastAttempt.selectedIndex]}</Badge>
        ) : null}
      </div>

      <QuestionView
        question={q}
        mode="review"
        selectedIndex={
          lastAttempt && !lastAttempt.correct ? lastAttempt.selectedIndex : null
        }
        highlight={state.settings.highlightKeywords}
      />

      <Card className="mt-4 p-4">
        <p className="mb-2 text-[14px] font-medium">我的笔记</p>
        <Textarea
          value={entry?.note ?? ""}
          onChange={(e) => setWrongNote(q.id, e.target.value)}
          placeholder="写下你当时怎么错的、下次怎么避免…"
          className="min-h-[100px]"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={entry?.mastered ? "secondary" : "success"}
            onClick={() => setWrongMastered(q.id, !entry?.mastered)}
          >
            {entry?.mastered ? "取消已掌握" : "标为已掌握"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => removeWrong(q.id)}>
            <Trash2 size={16} /> 移出错题本
          </Button>
        </div>
      </Card>
    </main>
  );
}
