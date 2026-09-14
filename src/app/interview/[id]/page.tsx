import { interviewQuestions } from "@/content/interview";
import InterviewDetailPage from "./page-client";

export function generateStaticParams() {
  return interviewQuestions.map((q) => ({ id: q.id }));
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <InterviewDetailPage params={params} />;
}
