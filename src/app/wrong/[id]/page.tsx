import { questionMap, allQuestions } from "@/content/questions";
import WrongDetailPage from "./page-client";

export function generateStaticParams() {
  return allQuestions.map((q) => ({ id: q.id }));
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  void questionMap;
  return <WrongDetailPage params={params} />;
}
