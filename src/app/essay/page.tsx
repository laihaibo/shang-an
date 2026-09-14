"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { essayLessons } from "@/content/essay";

const kindLabel: Record<string, string> = {
  overview: "考情",
  skill: "题型精讲",
  case: "范文拆解",
  sprint: "冲刺",
};

const kindTone: Record<string, "accent" | "success" | "warning"> = {
  overview: "accent",
  skill: "accent",
  case: "success",
  sprint: "warning",
};

export default function EssayPage() {
  return (
    <main>
      <PageHeader
        title="申论课程"
        description="考情总则、题型精讲、范文拆解与冲刺清单。完整骨架，按讲推进。"
        backHref="/"
      />
      <div className="space-y-3">
        {essayLessons.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/essay/${lesson.slug}/`}
            className="focus-ring block"
          >
            <Card className="p-5 transition-transform hover:scale-[1.01]">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={kindTone[lesson.kind] ?? "accent"}>
                  {kindLabel[lesson.kind] ?? lesson.kind}
                </Badge>
                <Badge>约 {lesson.minutes} 分钟</Badge>
              </div>
              <h2 className="font-display text-[18px] font-semibold leading-snug">
                {lesson.title}
              </h2>
              <p className="mt-1 text-[14px] leading-relaxed text-[var(--ink-soft)]">
                {lesson.summary}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
