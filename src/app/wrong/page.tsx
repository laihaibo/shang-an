"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, CheckCheck, Filter } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { questionMap } from "@/content/questions";
import { MODULES } from "@/lib/types";
import { MODULE_LABEL, copyText, cn } from "@/lib/utils";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

function formatWrongMarkdown(
  items: {
    stem: string;
    options: string[];
    answer: number;
    analysis: string;
    tags: string[];
    note: string;
    module: string;
  }[]
) {
  const lines = [
    `# 上岸错题本`,
    ``,
    `导出时间：${new Date().toLocaleString("zh-CN")}`,
    `共 ${items.length} 题`,
    ``,
  ];
  items.forEach((item, i) => {
    lines.push(`## ${i + 1}. [${item.module}] ${item.stem.slice(0, 40)}…`);
    lines.push(``);
    lines.push(`**题干**`);
    lines.push(item.stem);
    lines.push(``);
    item.options.forEach((o, oi) => {
      const mark = oi === item.answer ? "（正确答案）" : "";
      lines.push(`- ${optionLabels[oi]}. ${o}${mark}`);
    });
    lines.push(``);
    lines.push(`**解析**：${item.analysis}`);
    if (item.tags.length) lines.push(`**考点**：${item.tags.join("、")}`);
    if (item.note.trim()) lines.push(`**我的笔记**：${item.note.trim()}`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  });
  return lines.join("\n");
}

export default function WrongPage() {
  const { state, setWrongMastered } = useStore();
  const [onlyPending, setOnlyPending] = useState(true);
  const [copied, setCopied] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<string | "all">("all");

  const list = useMemo(() => {
    return state.wrong
      .filter((w) => questionMap[w.questionId])
      .filter((w) => (onlyPending ? !w.mastered : true))
      .filter((w) =>
        moduleFilter === "all"
          ? true
          : questionMap[w.questionId].module === moduleFilter
      )
      .sort((a, b) => b.lastWrongAt - a.lastWrongAt);
  }, [state.wrong, onlyPending, moduleFilter]);

  const copyAll = async () => {
    const payload = list.map((w) => {
      const q = questionMap[w.questionId];
      return {
        stem: q.stem,
        options: q.options,
        answer: q.answer,
        analysis: q.analysis,
        tags: q.tags,
        note: w.note,
        module: MODULE_LABEL[q.module],
      };
    });
    const md = formatWrongMarkdown(payload);
    const ok = await copyText(md);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main>
      <PageHeader
        title="错题本"
        description="自动收录做错的题。可复制为 Markdown，粘贴到笔记软件。"
        action={
          <Button size="sm" onClick={copyAll} disabled={list.length === 0}>
            {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
            {copied ? "已复制" : "一键复制"}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={onlyPending ? "primary" : "secondary"}
          onClick={() => setOnlyPending(true)}
        >
          待复盘
        </Button>
        <Button
          size="sm"
          variant={!onlyPending ? "primary" : "secondary"}
          onClick={() => setOnlyPending(false)}
        >
          全部
        </Button>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setModuleFilter("all")}
            className={cn(
              "focus-ring rounded-full px-2.5 py-1 text-[12px]",
              moduleFilter === "all"
                ? "bg-[var(--accent)] text-white"
                : "glass text-[var(--ink-soft)]"
            )}
          >
            全部模块
          </button>
          {MODULES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setModuleFilter(m.key)}
              className={cn(
                "focus-ring rounded-full px-2.5 py-1 text-[12px]",
                moduleFilter === m.key
                  ? "bg-[var(--accent)] text-white"
                  : "glass text-[var(--ink-soft)]"
              )}
            >
              {MODULE_LABEL[m.key]}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="p-8 text-center">
          <Filter size={28} className="mx-auto mb-3 text-[var(--muted)]" />
          <p className="font-medium">这里还是空的</p>
          <p className="mt-1 text-[14px] text-[var(--ink-soft)]">
            做错的题会自动进来。先去刷一组题。
          </p>
          <Button asChild className="mt-4">
            <Link href="/practice/">开始刷题</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((w) => {
            const q = questionMap[w.questionId];
            return (
              <Card key={w.questionId} className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{MODULE_LABEL[q.module]}</Badge>
                  <Badge tone={w.mastered ? "success" : "warning"}>
                    {w.mastered ? "已掌握" : `错 ${w.wrongCount} 次`}
                  </Badge>
                  {q.tags.slice(0, 2).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
                <Link
                  href={`/wrong/${q.id}/`}
                  className="focus-ring block text-[15px] leading-relaxed hover:text-[var(--accent)]"
                >
                  {q.stem.slice(0, 100)}
                  {q.stem.length > 100 ? "…" : ""}
                </Link>
                {w.note ? (
                  <p className="mt-2 rounded-[10px] bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] px-3 py-2 text-[13px] text-[var(--ink-soft)]">
                    笔记：{w.note}
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/wrong/${q.id}/`}>详情</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setWrongMastered(q.id, !w.mastered)}
                  >
                    {w.mastered ? "标为待复盘" : "标为已掌握"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
