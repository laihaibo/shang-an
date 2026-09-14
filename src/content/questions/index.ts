import type { MockPaper, Question } from "@/lib/types";
import { verbalQuestions } from "./verbal";
import { judgmentQuestions } from "./judgment";
import { quantitativeQuestions } from "./quantitative";
import { dataQuestions } from "./data";
import { commonQuestions } from "./common";

export const allQuestions: Question[] = [
  ...verbalQuestions,
  ...judgmentQuestions,
  ...quantitativeQuestions,
  ...dataQuestions,
  ...commonQuestions,
];

export const questionMap: Record<string, Question> = Object.fromEntries(
  allQuestions.map((q) => [q.id, q])
);

export function questionsByModule(module: Question["module"]): Question[] {
  return allQuestions.filter((q) => q.module === module);
}

/** 国考行测结构样例卷（从样例题抽样组成，可重复生成「错题卷」） */
export const standardMockPapers: MockPaper[] = [
  {
    id: "mock-standard-1",
    title: "国考行测样例卷 · 一",
    description:
      "按五大模块抽样组卷，建议限时完成。交卷后按模块查看正确率。",
    minutes: 60,
    questionIds: [
      "verbal-001",
      "verbal-002",
      "verbal-003",
      "verbal-004",
      "verbal-005",
      "verbal-006",
      "verbal-007",
      "verbal-008",
      "judgment-001",
      "judgment-002",
      "judgment-003",
      "judgment-004",
      "judgment-005",
      "judgment-006",
      "judgment-008",
      "judgment-013",
      "quantitative-001",
      "quantitative-003",
      "quantitative-004",
      "quantitative-005",
      "quantitative-010",
      "quantitative-011",
      "data-001",
      "data-002",
      "data-003",
      "data-006",
      "data-007",
      "data-011",
      "common-001",
      "common-002",
      "common-003",
      "common-005",
      "common-010",
      "common-012",
    ],
  },
];

export function getPaper(id: string): MockPaper | undefined {
  return standardMockPapers.find((p) => p.id === id);
}
