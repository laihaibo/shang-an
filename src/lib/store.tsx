"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applySettingsTheme,
  loadState,
  parseImport,
  saveState,
  touchStudy,
  upsertWrong,
  buildExport,
  type ExportBundle,
} from "./storage";
import {
  emptyState,
  type AppState,
  type AppSettings,
  type ModuleKey,
  type Question,
} from "./types";
import { questionMap } from "@/content/questions";

type Ctx = {
  state: AppState;
  ready: boolean;
  recordAnswer: (q: Question, selectedIndex: number, source: "practice" | "mock", mockId?: string) => boolean;
  setWrongMastered: (questionId: string, mastered: boolean) => void;
  setWrongNote: (questionId: string, note: string) => void;
  removeWrong: (questionId: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  addMockResult: (result: AppState["mockResults"][number]) => void;
  importState: (json: unknown) => boolean;
  exportState: () => ExportBundle;
  resetState: () => void;
  moduleProgress: Record<ModuleKey, { attempts: number; correct: number; accuracy: number }>;
  pendingReviewCount: number;
  wrongCount: number;
};

const StoreContext = createContext<Ctx | null>(null);

const MODULE_KEYS: ModuleKey[] = [
  "verbal",
  "judgment",
  "quantitative",
  "data",
  "common",
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applySettingsTheme(state.settings);
  }, [ready, state.settings]);

  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, ready]);

  useEffect(() => {
    if (!ready || state.settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applySettingsTheme(state.settings);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [ready, state.settings]);

  const recordAnswer = useCallback(
    (
      q: Question,
      selectedIndex: number,
      source: "practice" | "mock",
      mockId?: string
    ) => {
      const correct = selectedIndex === q.answer;
      setState((prev) => {
        let next: AppState = {
          ...prev,
          totalQuestions: prev.totalQuestions + 1,
          attempts: [
            ...prev.attempts,
            {
              questionId: q.id,
              selectedIndex,
              correct,
              at: Date.now(),
              source,
              mockId,
            },
          ],
        };
        if (!correct) {
          next = { ...next, wrong: upsertWrong(next.wrong, q.id) };
        } else {
          // 答对不自动移除错题，由用户标已掌握
        }
        next = touchStudy(next);
        return next;
      });
      return correct;
    },
    []
  );

  const setWrongMastered = useCallback((questionId: string, mastered: boolean) => {
    setState((prev) => ({
      ...prev,
      wrong: prev.wrong.map((w) =>
        w.questionId === questionId ? { ...w, mastered } : w
      ),
    }));
  }, []);

  const setWrongNote = useCallback((questionId: string, note: string) => {
    setState((prev) => ({
      ...prev,
      wrong: prev.wrong.map((w) =>
        w.questionId === questionId ? { ...w, note } : w
      ),
    }));
  }, []);

  const removeWrong = useCallback((questionId: string) => {
    setState((prev) => ({
      ...prev,
      wrong: prev.wrong.filter((w) => w.questionId !== questionId),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const addMockResult = useCallback((result: AppState["mockResults"][number]) => {
    setState((prev) => touchStudy({ ...prev, mockResults: [result, ...prev.mockResults] }));
  }, []);

  const importState = useCallback((json: unknown) => {
    const parsed = parseImport(json);
    if (!parsed) return false;
    setState(parsed);
    saveState(parsed);
    return true;
  }, []);

  const exportState = useCallback(() => buildExport(state), [state]);

  const resetState = useCallback(() => {
    const next = emptyState();
    setState(next);
    saveState(next);
  }, []);

  const moduleProgress = useMemo(() => {
    const acc = {} as Ctx["moduleProgress"];
    for (const m of MODULE_KEYS) {
      const rows = state.attempts.filter((a) => a.questionId.startsWith(`${m}-`));
      const correct = rows.filter((a) => a.correct).length;
      acc[m] = {
        attempts: rows.length,
        correct,
        accuracy: rows.length === 0 ? 0 : Math.round((correct / rows.length) * 1000) / 10,
      };
    }
    return acc;
  }, [state.attempts]);

  const pendingReviewCount = useMemo(
    () => state.wrong.filter((w) => !w.mastered).length,
    [state.wrong]
  );

  const value: Ctx = {
    state,
    ready,
    recordAnswer,
    setWrongMastered,
    setWrongNote,
    removeWrong,
    updateSettings,
    addMockResult,
    importState,
    exportState,
    resetState,
    moduleProgress,
    pendingReviewCount,
    wrongCount: state.wrong.length,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { questionMap };
