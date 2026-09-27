import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
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
  return (
    <Suspense
      fallback={
        <main>
          <PageHeader title="刷题" backHref="/practice/" />
        </main>
      }
    >
      <PracticeModulePage params={params} />
    </Suspense>
  );
}
