import { essayLessons } from "@/content/essay";
import EssayLessonPage from "./page-client";

export function generateStaticParams() {
  return essayLessons.map((l) => ({ slug: l.slug }));
}

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <EssayLessonPage params={params} />;
}
