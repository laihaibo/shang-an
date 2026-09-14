"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { allQuestions } from "@/content/questions";
import { tips } from "@/content/tips";
import { essayLessons } from "@/content/essay";
import { interviewQuestions } from "@/content/interview";
import { MODULE_LABEL } from "@/lib/utils";

type Hit = {
  kind: "题" | "技巧" | "申论" | "面试";
  title: string;
  excerpt: string;
  href: string;
  tag: string;
};

export default function SearchPage() {
  const [q, setQ] = useState("");

  const hits = useMemo(() => {
    const query = q.trim();
    if (!query) return [] as Hit[];
    const lower = query.toLowerCase();
    const out: Hit[] = [];

    for (const item of allQuestions) {
      const hay = `${item.stem} ${item.analysis} ${item.tags.join(" ")}`;
      if (hay.toLowerCase().includes(lower)) {
        out.push({
          kind: "题",
          title: item.stem.slice(0, 48) + (item.stem.length > 48 ? "…" : ""),
          excerpt: item.tags.join(" · "),
          href: `/practice/${item.module}/`,
          tag: MODULE_LABEL[item.module],
        });
      }
    }
    for (const t of tips) {
      const hay = `${t.title} ${t.summary} ${t.body.join(" ")}`;
      if (hay.toLowerCase().includes(lower)) {
        out.push({
          kind: "技巧",
          title: t.title,
          excerpt: t.summary,
          href: `/tips/${t.module}/`,
          tag: MODULE_LABEL[t.module],
        });
      }
    }
    for (const l of essayLessons) {
      const hay = `${l.title} ${l.summary} ${l.sections.map((s) => s.heading + s.body.join("")).join(" ")}`;
      if (hay.toLowerCase().includes(lower)) {
        out.push({
          kind: "申论",
          title: l.title,
          excerpt: l.summary,
          href: `/essay/${l.slug}/`,
          tag: "申论",
        });
      }
    }
    for (const i of interviewQuestions) {
      const hay = `${i.title} ${i.stem} ${i.framework.join(" ")}`;
      if (hay.toLowerCase().includes(lower)) {
        out.push({
          kind: "面试",
          title: i.title,
          excerpt: i.stem.slice(0, 60),
          href: `/interview/${i.id}/`,
          tag: "面试",
        });
      }
    }
    return out.slice(0, 40);
  }, [q]);

  return (
    <main>
      <PageHeader title="搜索" description="题目、技巧、申论讲次、面试题" backHref="/" />
      <div className="relative mb-4">
        <SearchIcon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜「增长率」「归纳概括」「综合分析」…"
          className="pl-10"
          autoFocus
        />
      </div>
      {q.trim() && hits.length === 0 ? (
        <Card className="p-6 text-center text-[var(--ink-soft)]">
          没有找到「{q.trim()}」相关内容
        </Card>
      ) : null}
      <div className="space-y-2">
        {hits.map((h, i) => (
          <Link key={i} href={h.href} className="focus-ring block">
            <Card className="p-4 hover:brightness-[1.03]">
              <div className="mb-1 flex items-center gap-2">
                <Badge tone="accent">{h.kind}</Badge>
                <Badge>{h.tag}</Badge>
              </div>
              <p className="text-[15px] font-medium leading-snug">{h.title}</p>
              {h.excerpt ? (
                <p className="mt-1 text-[13px] text-[var(--ink-soft)]">{h.excerpt}</p>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
