"use client";

import {
  emptyState,
  STORAGE_KEY,
  type AppState,
  type AppSettings,
  type ModuleKey,
  type WrongEntry,
} from "./types";
import { todayKey } from "./utils";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadState(): AppState {
  if (!isBrowser()) return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = emptyState();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      wrong: parsed.wrong ?? [],
      attempts: parsed.attempts ?? [],
      mockResults: parsed.mockResults ?? [],
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

export function parseImport(json: unknown): AppState | null {
  try {
    const data = json as ExportBundle & { state?: AppState };
    const raw =
      data && typeof data === "object" && "state" in data
        ? data.state
        : (json as AppState);
    if (!raw || typeof raw !== "object") return null;
    if (!Array.isArray(raw.attempts) || !Array.isArray(raw.wrong)) return null;
    const base = emptyState();
    return {
      ...base,
      ...raw,
      version: 1,
      settings: { ...base.settings, ...(raw.settings ?? {}) },
      mockResults: raw.mockResults ?? [],
    };
  } catch {
    return null;
  }
}

export function moduleStats(
  state: AppState,
  modules: ModuleKey[]
): Record<ModuleKey, { attempts: number; correct: number; accuracy: number }> {
  const acc = {} as Record<
    ModuleKey,
    { attempts: number; correct: number; accuracy: number }
  >;
  for (const m of modules) {
    const rows = state.attempts.filter(
      (a) => a.questionId.startsWith(m + "-") || a.questionId.includes(`-${m}-`)
    );
    // attempts are keyed by question id which starts with module prefix
    const moduleAttempts = state.attempts.filter((a) =>
      a.questionId.startsWith(`${m}-`)
    );
    void rows;
    const correct = moduleAttempts.filter((a) => a.correct).length;
    acc[m] = {
      attempts: moduleAttempts.length,
      correct,
      accuracy:
        moduleAttempts.length === 0
          ? 0
          : Math.round((correct / moduleAttempts.length) * 1000) / 10,
    };
  }
  return acc;
}

export function applySettingsTheme(settings: AppSettings) {
  if (!isBrowser()) return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark =
    settings.theme === "dark" || (settings.theme === "system" && prefersDark);
  root.classList.toggle("dark", dark);
}
