"use client";

import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { essayLessons, getEssayLesson } from "@/content/essay";

export default function EssayLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const lesson = getEssayLesson(slug);
  const idx = essayLessons.findIndex((l) => l.slug === slug);
  const prev = idx > 0 ? essayLessons[idx - 1] : null;
  const next =
    idx >= 0 && idx < essayLessons.length - 1 ? essayLessons[idx + 1] : null;

  if (!lesson) {
    return (
      <main>
        <PageHeader title="讲次不存在" backHref="/essay/" />
      </main>
    );
  }

  return (
    <main>
      <PageHeader
        title={lesson.title}
        description={lesson.summary}
        backHref="/essay/"
      />
      <div className="mb-4 flex gap-2">
        <Badge tone="accent">约 {lesson.minutes} 分钟</Badge>
        <Badge>
          {idx + 1}/{essayLessons.length}
        </Badge>
      </div>
      <div className="space-y-4">
        {lesson.sections.map((s, i) => (
          <Card key={i} className="p-5">
            <h2 className="mb-3 font-display text-[18px] font-semibold">
              {s.heading}
            </h2>
            <div className="space-y-2">
              {s.body.map((p, j) => (
                <p key={j} className="text-[15px] leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        {prev ? (
          <Link
            href={`/essay/${prev.slug}/`}
            className="focus-ring text-[14px] text-[var(--accent)]"
          >
            ← 上一讲
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/essay/${next.slug}/`}
            className="focus-ring text-[14px] text-[var(--accent)]"
          >
            下一讲 →
          </Link>
        ) : (
          <Link href="/practice/" className="text-[14px] text-[var(--accent)]">
            去刷行测 →
          </Link>
        )}
      </div>
    </main>
  );
}
