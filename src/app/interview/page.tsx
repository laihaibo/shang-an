"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INTERVIEW_CATEGORIES } from "@/lib/types";
import { interviewByCategory } from "@/content/interview";
import { cn, formatDuration } from "@/lib/utils";

export default function InterviewPage() {
  const [cat, setCat] = useState<string>("all");
  const list =
    cat === "all"
      ? interviewByCategory("analysis")
          .concat(
            interviewByCategory("plan"),
            interviewByCategory("interpersonal"),
            interviewByCategory("emergency"),
            interviewByCategory("situational")
          )
      : interviewByCategory(cat as never);

  return (
    <main>
      <PageHeader
        title="面试练习"
        description="结构化面试高频题型。先看框架，再限时作答；可选录音自听。"
        backHref="/"
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={cat === "all" ? "primary" : "secondary"}
          onClick={() => setCat("all")}
        >
          全部
        </Button>
        {INTERVIEW_CATEGORIES.map((c) => (
          <Button
            key={c.key}
            size="sm"
            variant={cat === c.key ? "primary" : "secondary"}
            onClick={() => setCat(c.key)}
          >
            {c.name}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((q) => {
          const catInfo = INTERVIEW_CATEGORIES.find((c) => c.key === q.category);
          return (
            <Link key={q.id} href={`/interview/${q.id}/`} className="focus-ring block">
              <Card className="p-5 transition-transform hover:scale-[1.01]">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{catInfo?.name}</Badge>
                  <Badge>建议 {formatDuration(q.suggestedSeconds)}</Badge>
                </div>
                <h2 className="font-display text-[17px] font-semibold leading-snug">
                  {q.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-[14px] text-[var(--ink-soft)]">
                  {q.stem}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
      <p className={cn("mt-6 text-center text-[13px] text-[var(--muted)]")}>
        面试能力靠开口。建议每天 1—2 题，录下来回听。
      </p>
    </main>
  );
}
