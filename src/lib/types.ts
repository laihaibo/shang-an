export type ModuleKey =
  | "verbal"
  | "judgment"
  | "quantitative"
  | "data"
  | "common";

export type ModuleInfo = {
  key: ModuleKey;
  name: string;
  short: string;
  description: string;
};

export const MODULES: ModuleInfo[] = [
  {
    key: "verbal",
    name: "言语理解与表达",
    short: "言语",
    description: "主旨概括、意图判断、词语填空",
  },
  {
    key: "judgment",
    name: "判断推理",
    short: "判断",
    description: "图形、定义、类比、逻辑",
  },
  {
    key: "quantitative",
    name: "数量关系",
    short: "数量",
    description: "数学运算与数字推理",
  },
  {
    key: "data",
    name: "资料分析",
    short: "资料",
    description: "增长率、比重、平均数",
  },
  {
    key: "common",
    name: "常识判断",
    short: "常识",
    description: "政治、法律、科技、人文",
  },
];

export type QuestionType = "single-choice";

export type QuestionMaterial = {
  /** 纯文本段落，可含换行 */
  text?: string;
  /** 简单表格，第一行表头 */
  table?: {
    headers: string[];
    rows: string[][];
  };
};

export type Question = {
  id: string;
  module: ModuleKey;
  type: QuestionType;
  stem: string;
  options: string[];
  answer: number;
  analysis: string;
  /** 知识点标签，用于薄弱分析 */
  tags: string[];
  material?: QuestionMaterial;
  /** 资料分析题组共用材料时的组 id */
  groupId?: string;
};

export type Tip = {
  id: string;
  module: ModuleKey;
  title: string;
  summary: string;
  body: string[];
  tags: string[];
};

export type EssayLesson = {
  slug: string;
  order: number;
  title: string;
  kind: "overview" | "skill" | "case" | "sprint";
  minutes: number;
  summary: string;
  sections: { heading: string; body: string[] }[];
};

export type InterviewCategory =
  | "analysis"
  | "plan"
  | "interpersonal"
  | "emergency"
  | "situational";

export type InterviewQuestion = {
  id: string;
  category: InterviewCategory;
  title: string;
  stem: string;
  framework: string[];
  pitfalls: string[];
  samplePoints: string[];
  suggestedSeconds: number;
};

export const INTERVIEW_CATEGORIES: {
  key: InterviewCategory;
  name: string;
  short: string;
}[] = [
  { key: "analysis", name: "综合分析", short: "综合" },
  { key: "plan", name: "计划组织", short: "组织" },
  { key: "interpersonal", name: "人际关系", short: "人际" },
  { key: "emergency", name: "应急应变", short: "应急" },
  { key: "situational", name: "情景模拟", short: "情景" },
];

export type AttemptRecord = {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  at: number;
  /** practice | mock */
  source: "practice" | "mock";
  mockId?: string;
};

export type WrongEntry = {
  questionId: string;
  wrongCount: number;
  lastWrongAt: number;
  mastered: boolean;
  note: string;
};

export type MockPaper = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  /** 题目 id 列表，按卷面顺序 */
  questionIds: string[];
};

export type MockSessionStatus = "idle" | "running" | "submitted";

export type MockResult = {
  id: string;
  paperId: string;
  title: string;
  startedAt: number;
  submittedAt: number;
  durationSeconds: number;
  answers: Record<string, number | null>;
  total: number;
  correct: number;
  byModule: Record<
    ModuleKey,
    { total: number; correct: number; seconds: number }
  >;
};

export type AppSettings = {
  theme: "system" | "light" | "dark";
  remindEnabled: boolean;
  remindHour: number;
  highlightKeywords: boolean;
};

export type AppState = {
  version: 1;
  attempts: AttemptRecord[];
  wrong: WrongEntry[];
  mockResults: MockResult[];
  settings: AppSettings;
  streakDays: number;
  lastStudyDate: string | null;
  totalQuestions: number;
};

export const STORAGE_KEY = "shang-an-state-v1";

export function emptyState(): AppState {
  return {
    version: 1,
    attempts: [],
    wrong: [],
    mockResults: [],
    settings: {
      theme: "system",
      remindEnabled: false,
      remindHour: 21,
      highlightKeywords: true,
    },
    streakDays: 0,
    lastStudyDate: null,
    totalQuestions: 0,
  };
}

export function moduleByKey(key: ModuleKey): ModuleInfo {
  return MODULES.find((m) => m.key === key) ?? MODULES[0];
}
