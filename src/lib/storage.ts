"use client";

import {
  emptyState,
  MAX_ATTEMPTS,
  STORAGE_KEY,
  type ActiveMock,
  type ActivePractice,
  type AppState,
  type AppSettings,
  type AttemptRecord,
  type ModuleKey,
  type MockResult,
  type WrongEntry,
} from "./types";
import { todayKey } from "./utils";

function isBrowser() {
  return typeof window !== "undefined";
}

const THEMES = ["system", "light", "dark"] as const;
const MODULE_KEYS: ModuleKey[] = [
  "verbal",
  "judgment",
  "quantitative",
  "data",
  "common",
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function sanitizeAttempts(v: unknown): AttemptRecord[] {
  if (!Array.isArray(v)) return [];
  const out: AttemptRecord[] = [];
  for (const item of v) {
    if (!isRecord(item)) continue;
    if (typeof item.questionId !== "string") continue;
    if (typeof item.selectedIndex !== "number") continue;
    if (typeof item.correct !== "boolean") continue;
    if (typeof item.at !== "number") continue;
    const source = item.source;
    if (source !== "practice" && source !== "mock") continue;
    out.push({
      questionId: item.questionId,
      selectedIndex: item.selectedIndex,
      correct: item.correct,
      at: item.at,
      source,
      ...(typeof item.mockId === "string" ? { mockId: item.mockId } : {}),
    });
  }
  return out.slice(-MAX_ATTEMPTS);
}

function sanitizeWrong(v: unknown): WrongEntry[] {
  if (!Array.isArray(v)) return [];
  const out: WrongEntry[] = [];
  for (const item of v) {
    if (!isRecord(item)) continue;
    if (typeof item.questionId !== "string") continue;
    out.push({
      questionId: item.questionId,
      wrongCount: Math.max(1, Math.round(num(item.wrongCount, 1))),
      lastWrongAt: num(item.lastWrongAt, Date.now()),
      mastered: item.mastered === true,
      note: str(item.note, ""),
    });
  }
  return out;
}

function sanitizeMockResults(v: unknown): MockResult[] {
  if (!Array.isArray(v)) return [];
  const out: MockResult[] = [];
  for (const item of v) {
    if (!isRecord(item)) continue;
    if (typeof item.id !== "string") continue;
    if (!isRecord(item.answers)) continue;
    const byModule = {} as MockResult["byModule"];
    const rawBy = isRecord(item.byModule) ? item.byModule : {};
    for (const m of MODULE_KEYS) {
      const row = isRecord(rawBy[m]) ? rawBy[m] : {};
      byModule[m] = {
        total: Math.max(0, Math.round(num(row.total, 0))),
        correct: Math.max(0, Math.round(num(row.correct, 0))),
        seconds: Math.max(0, Math.round(num(row.seconds, 0))),
      };
    }
    out.push({
      id: item.id,
      paperId: str(item.paperId, "unknown"),
      title: str(item.title, "模考"),
      startedAt: num(item.startedAt, 0),
      submittedAt: num(item.submittedAt, 0),
      durationSeconds: Math.max(0, Math.round(num(item.durationSeconds, 0))),
      answers: item.answers as MockResult["answers"],
      total: Math.max(0, Math.round(num(item.total, 0))),
      correct: Math.max(0, Math.round(num(item.correct, 0))),
      byModule,
    });
  }
  return out;
}

function sanitizeSettings(v: unknown): AppSettings {
  const base = emptyState().settings;
  if (!isRecord(v)) return base;
  return {
    theme: THEMES.includes(v.theme as (typeof THEMES)[number])
      ? (v.theme as AppSettings["theme"])
      : base.theme,
    highlightKeywords: v.highlightKeywords !== false,
  };
}

function sanitizeActivePractice(v: unknown): ActivePractice | null {
  if (!isRecord(v)) return null;
  if (typeof v.module !== "string" || !MODULE_KEYS.includes(v.module as ModuleKey))
    return null;
  if (!Array.isArray(v.order) || !v.order.every((n) => typeof n === "number"))
    return null;
  if (!isRecord(v.answers)) return null;
  const answers: ActivePractice["answers"] = {};
  for (const [qid, a] of Object.entries(v.answers)) {
    if (!isRecord(a)) continue;
    if (typeof a.selected !== "number" || typeof a.correct !== "boolean") continue;
    answers[qid] = { selected: a.selected, correct: a.correct };
  }
  return {
    module: v.module as ModuleKey,
    order: v.order,
    index: Math.max(0, Math.round(num(v.index, 0))),
    answers,
    savedAt: num(v.savedAt, Date.now()),
  };
}

function sanitizeActiveMock(v: unknown): ActiveMock | null {
  if (!isRecord(v)) return null;
  const paper = v.paper;
  if (!isRecord(paper)) return null;
  if (
    typeof paper.id !== "string" ||
    typeof paper.minutes !== "number" ||
    !Array.isArray(paper.questionIds)
  )
    return null;
  if (!isRecord(v.answers)) return null;
  const answers: Record<string, number | null> = {};
  for (const [qid, a] of Object.entries(v.answers)) {
    if (typeof a === "number") answers[qid] = a;
    else if (a === null) answers[qid] = null;
  }
  return {
    paper: {
      id: paper.id,
      title: str(paper.title, "模考"),
      description: str(paper.description, ""),
      minutes: Math.max(1, Math.round(paper.minutes)),
      questionIds: paper.questionIds.filter((q) => typeof q === "string"),
    },
    answers,
    index: Math.max(0, Math.round(num(v.index, 0))),
    startedAt: num(v.startedAt, Date.now()),
    deadline: num(v.deadline, Date.now()),
  };
}

/** 白名单重建 state：多余字段丢弃、字段级兜底，同时兼容旧版导入 */
function sanitizeState(input: unknown): AppState {
  const base = emptyState();
  if (!isRecord(input)) return base;
  return {
    version: 1,
    attempts: sanitizeAttempts(input.attempts),
    wrong: sanitizeWrong(input.wrong),
    mockResults: sanitizeMockResults(input.mockResults),
    settings: sanitizeSettings(input.settings),
    streakDays: Math.max(0, Math.round(num(input.streakDays, 0))),
    lastStudyDate:
      typeof input.lastStudyDate === "string" ? input.lastStudyDate : null,
    totalQuestions: Math.max(0, Math.round(num(input.totalQuestions, 0))),
    activePractice: sanitizeActivePractice(input.activePractice),
    activeMock: sanitizeActiveMock(input.activeMock),
  };
}

/**
 * 读档。损坏时把原始串备份到独立 key（供手动抢救），返回空档 + 问题说明。
 */
export function loadState(): { state: AppState; issue: string | null } {
  if (!isBrowser()) return { state: emptyState(), issue: null };
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      state: emptyState(),
      issue: "无法读取本地存储（可能是隐私模式），学习进度将无法保存。",
    };
  }
  if (!raw) return { state: emptyState(), issue: null };
  try {
    return { state: sanitizeState(JSON.parse(raw)), issue: null };
  } catch {
    try {
      localStorage.setItem(
        `${STORAGE_KEY}-corrupted-${Date.now()}`,
        raw
      );
    } catch {
      /* 备份失败也不阻塞启动 */
    }
    return {
      state: emptyState(),
      issue:
        "检测到本地数据损坏，已把原始数据备份到浏览器存储并重置。如果之前导出过备份，可在下方导入恢复。",
    };
  }
}

/** 写档。返回 false 表示写入失败（配额满 / 隐私模式），调用方负责提示。 */
export function saveState(state: AppState): boolean {
  if (!isBrowser()) return true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function touchStudy(state: AppState): AppState {
  const today = todayKey();
  if (state.lastStudyDate === today) return state;
  const last = state.lastStudyDate;
  const streak =
    last && isConsecutive(last, today) ? state.streakDays + 1 : 1;
  return { ...state, lastStudyDate: today, streakDays: streak };
}

function isConsecutive(prev: string, next: string): boolean {
  const p = new Date(prev + "T00:00:00");
  const n = new Date(next + "T00:00:00");
  const diff = (n.getTime() - p.getTime()) / 86400000;
  return Math.round(diff) === 1;
}

export function upsertWrong(
  wrong: WrongEntry[],
  questionId: string
): WrongEntry[] {
  const existing = wrong.find((w) => w.questionId === questionId);
  if (existing) {
    return wrong.map((w) =>
      w.questionId === questionId
        ? { ...w, wrongCount: w.wrongCount + 1, lastWrongAt: Date.now(), mastered: false }
        : w
    );
  }
  return [
    {
      questionId,
      wrongCount: 1,
      lastWrongAt: Date.now(),
      mastered: false,
      note: "",
    },
    ...wrong,
  ];
}

export type ExportBundle = {
  app: "shang-an";
  exportedAt: string;
  schema: 1;
  state: AppState;
};

export function buildExport(state: AppState): ExportBundle {
  return {
    app: "shang-an",
    exportedAt: new Date().toISOString(),
    schema: 1,
    state,
  };
}

/** 接受完整 ExportBundle 或裸 AppState；结构不合法返回 null（不导入，避免误清空） */
export function parseImport(json: unknown): AppState | null {
  try {
    const data = json as ExportBundle & { state?: AppState };
    const raw =
      data && typeof data === "object" && "state" in data
        ? data.state
        : (json as AppState);
    if (!isRecord(raw)) return null;
    if (!Array.isArray(raw.attempts) || !Array.isArray(raw.wrong)) return null;
    return sanitizeState(raw);
  } catch {
    return null;
  }
}

export function applySettingsTheme(settings: AppSettings) {
  if (!isBrowser()) return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark =
    settings.theme === "dark" || (settings.theme === "system" && prefersDark);
  root.classList.toggle("dark", dark);
}
