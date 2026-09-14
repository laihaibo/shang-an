import { standardMockPapers } from "@/content/questions";
import MockRunnerPage from "./page-client";

export function generateStaticParams() {
  return [
    ...standardMockPapers.map((p) => ({ id: p.id })),
    { id: "wrong-pack" },
  ];
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <MockRunnerPage params={params} />;
}
