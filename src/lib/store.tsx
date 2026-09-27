"use client";
/* 首次挂载时从 localStorage 一次性读档并 setState 属预期行为：
   静态导出下 SSR 渲染的是 emptyState，惰性初始化会造成 hydration 差异。 */
/* eslint-disable react-hooks/set-state-in-effect */

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
  MAX_ATTEMPTS,
  type ActiveMock,
  type ActivePractice,
  type AppState,
  type AppSettings,
  type ModuleKey,
  type Question,
} from "./types";
import { questionMap } from "@/content/questions";

type Ctx = {
  state: AppState;
  ready: boolean;
  /** 本机数据层问题提示（损坏重置 / 写入失败），非空时「我的」页展示警示 */
  storageWarning: string | null;
  recordAnswer: (q: Question, selectedIndex: number, source: "practice" | "mock", mockId?: string) => boolean;
  setWrongMastered: (questionId: string, mastered: boolean) => void;
  setWrongNote: (questionId: string, note: string) => void;
  removeWrong: (questionId: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  addMockResult: (result: AppState["mockResults"][number]) => void;
  setPracticeSession: (session: ActivePractice | null) => void;
  setMockSession: (session: ActiveMock | null) => void;
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
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);
  const stateRef = useRef(state);

  // 渲染期间不写 ref，统一在提交后同步
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const { state: loaded, issue } = loadState();
    setState(loaded);
    if (issue) setStorageWarning(issue);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applySettingsTheme(state.settings);
    // 同步给 layout 的首帧内联脚本，下次加载不闪主题
    try {
      localStorage.setItem("shang-an-theme", state.settings.theme);
    } catch {
      /* 忽略 */
    }
  }, [ready, state.settings]);

  const persistNow = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (!dirtyRef.current) return true;
    dirtyRef.current = false;
    const ok = saveState(stateRef.current);
    if (!ok) setStorageWarning("学习进度写入失败（存储空间不足或隐私模式），本次改动可能没有被保存。");
    return ok;
  }, []);

  useEffect(() => {
    if (!ready) return;
    dirtyRef.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      persistNow();
    }, 200);
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [state, ready, persistNow]);

  // 关页/切后台前把待写数据落盘，避免 200ms 防抖丢最后一次作答
  useEffect(() => {
    if (!ready) return;
    const flush = () => persistNow();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ready, persistNow]);

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
          ].slice(-MAX_ATTEMPTS),
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
    setState((prev) =>
      touchStudy({
        ...prev,
        mockResults: [result, ...prev.mockResults],
        activeMock: null,
      })
    );
  }, []);

  const setPracticeSession = useCallback((session: ActivePractice | null) => {
    setState((prev) => ({ ...prev, activePractice: session }));
  }, []);

  const setMockSession = useCallback((session: ActiveMock | null) => {
    setState((prev) => ({ ...prev, activeMock: session }));
  }, []);

  const importState = useCallback((json: unknown) => {
    const parsed = parseImport(json);
    if (!parsed) return false;
    setState(parsed);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    dirtyRef.current = false;
    const ok = saveState(parsed);
    if (!ok) setStorageWarning("导入成功，但写入本地存储失败（空间不足或隐私模式），刷新后会丢失。");
    return true;
  }, []);

  const exportState = useCallback(() => buildExport(stateRef.current), []);

  const resetState = useCallback(() => {
    const next = emptyState();
    setState(next);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    dirtyRef.current = false;
    const ok = saveState(next);
    if (!ok) setStorageWarning("已清空，但写入本地存储失败，刷新后可能恢复旧数据。");
  }, []);

  const moduleProgress = useMemo(() => {
    const acc = {} as Ctx["moduleProgress"];
    for (const m of MODULE_KEYS) {
      let attempts = 0;
      let correct = 0;
      for (const a of state.attempts) {
        if (a.questionId.startsWith(`${m}-`)) {
          attempts += 1;
          if (a.correct) correct += 1;
        }
      }
      acc[m] = {
        attempts,
        correct,
        accuracy:
          attempts === 0 ? 0 : Math.round((correct / attempts) * 1000) / 10,
      };
    }
    return acc;
  }, [state.attempts]);

  const pendingReviewCount = useMemo(
    () => state.wrong.filter((w) => !w.mastered).length,
    [state.wrong]
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      storageWarning,
      recordAnswer,
      setWrongMastered,
      setWrongNote,
      removeWrong,
      updateSettings,
      addMockResult,
      setPracticeSession,
      setMockSession,
      importState,
      exportState,
      resetState,
      moduleProgress,
      pendingReviewCount,
      wrongCount: state.wrong.length,
    }),
    [
      state,
      ready,
      storageWarning,
      recordAnswer,
      setWrongMastered,
      setWrongNote,
      removeWrong,
      updateSettings,
      addMockResult,
      setPracticeSession,
      setMockSession,
      importState,
      exportState,
      resetState,
      moduleProgress,
      pendingReviewCount,
    ]
  );

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
