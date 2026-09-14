import { MODULES } from "@/lib/types";
import PracticeModulePage from "./page-client";

export function generateStaticParams() {
  return MODULES.map((m) => ({ module: m.key }));
}

export default function Page({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  return <PracticeModulePage params={params} />;
}
