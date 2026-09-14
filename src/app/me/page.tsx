"use client";

import { useRef, useState } from "react";
import {
  Download,
  Upload,
  Trash2,
  Bell,
  Moon,
  Sun,
  Monitor,
  Highlighter,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { MODULES } from "@/lib/types";
import {
  MODULE_LABEL,
  downloadJson,
  formatBytes,
  localStorageUsageBytes,
  accuracy,
} from "@/lib/utils";

const themes = [
  { key: "system" as const, label: "跟随系统", icon: Monitor },
  { key: "light" as const, label: "浅色", icon: Sun },
  { key: "dark" as const, label: "深色", icon: Moon },
];

export default function MePage() {
  const {
    state,
    ready,
    moduleProgress,
    importState,
    exportState,
    resetState,
    updateSettings,
    wrongCount,
    pendingReviewCount,
  } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const usage = ready ? localStorageUsageBytes() : 0;

  const onImport = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const ok = importState(json);
      setMsg(ok ? "导入成功" : "导入失败：格式不正确");
    } catch {
      setMsg("导入失败：不是合法 JSON");
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const onExport = () => {
    downloadJson(`shang-an-backup-${Date.now()}.json`, exportState());
    setMsg("已导出备份文件");
    setTimeout(() => setMsg(null), 3000);
  };

  const requestNotify = async () => {
    if (!("Notification" in window)) {
      setMsg("当前浏览器不支持通知");
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      updateSettings({ remindEnabled: true });
      setMsg("已开启提醒（本地，无云端）");
    } else {
      setMsg("通知权限被拒绝");
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <main>
      <PageHeader title="我的" description="进度、数据与设置。数据只存在本机。" />

      {msg ? (
        <div className="glass mb-4 rounded-[14px] px-4 py-3 text-[14px]">
          {msg}
        </div>
      ) : null}

      <Card strong className="mb-4 p-5">
        <p className="text-[13px] text-[var(--ink-soft)]">学习总览</p>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="font-display text-[28px] font-semibold leading-none">
              {state.totalQuestions}
            </p>
            <p className="mt-1 text-[12px] text-[var(--ink-soft)]">累计作答</p>
          </div>
          <div>
            <p className="font-display text-[28px] font-semibold leading-none">
              {state.streakDays}
            </p>
            <p className="mt-1 text-[12px] text-[var(--ink-soft)]">连续天数</p>
          </div>
          <div>
            <p className="font-display text-[28px] font-semibold leading-none">
              {wrongCount}
            </p>
            <p className="mt-1 text-[12px] text-[var(--ink-soft)]">错题</p>
          </div>
          <div>
            <p className="font-display text-[28px] font-semibold leading-none">
              {pendingReviewCount}
            </p>
            <p className="mt-1 text-[12px] text-[var(--ink-soft)]">待复盘</p>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>模块正确率</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MODULES.map((m) => {
            const p = moduleProgress[m.key];
            return (
              <div key={m.key} className="flex items-center justify-between text-[14px]">
                <span>{MODULE_LABEL[m.key]}</span>
                <span className="font-mono text-[13px] text-[var(--ink-soft)]">
                  {p.attempts === 0
                    ? "—"
                    : `${p.correct}/${p.attempts} · ${p.accuracy}%`}
                </span>
              </div>
            );
          })}
          {state.mockResults[0] ? (
            <p className="pt-2 text-[13px] text-[var(--ink-soft)]">
              最近模考正确率{" "}
              <span className="font-mono">
                {accuracy(state.mockResults[0].correct, state.mockResults[0].total)}%
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>主题</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {themes.map((t) => {
            const Icon = t.icon;
            const active = state.settings.theme === t.key;
            return (
              <Button
                key={t.key}
                size="sm"
                variant={active ? "primary" : "secondary"}
                onClick={() => updateSettings({ theme: t.key })}
              >
                <Icon size={16} /> {t.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>偏好</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center justify-between gap-3 text-[14px]">
            <span className="inline-flex items-center gap-2">
              <Highlighter size={16} className="text-[var(--accent)]" />
              题干关键词高亮
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--accent)]"
              checked={state.settings.highlightKeywords}
              onChange={(e) =>
                updateSettings({ highlightKeywords: e.target.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-[14px]">
            <span className="inline-flex items-center gap-2">
              <Bell size={16} className="text-[var(--accent)]" />
              学习提醒（浏览器通知）
            </span>
            {state.settings.remindEnabled ? (
              <Badge tone="success">已开启</Badge>
            ) : (
              <Button size="sm" variant="secondary" onClick={requestNotify}>
                开启
              </Button>
            )}
          </label>
          <p className="text-[12px] text-[var(--muted)]">
            提醒仅在本机请求通知权限，不发送到任何服务器。
          </p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>数据</CardTitle>
          <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
            JSON 导出备份，换设备时导入恢复。
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="text-[var(--ink-soft)]">localStorage 占用</span>
              <span className="font-mono">{formatBytes(usage)}</span>
            </div>
            <Progress value={Math.min(100, (usage / (5 * 1024 * 1024)) * 100)} />
            <p className="mt-1 text-[12px] text-[var(--muted)]">
              相对 5MB 常见配额的粗略占比
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onExport}>
              <Download size={16} /> 导出 JSON
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> 导入 JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.target.value = "";
              }}
            />
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("确定清空本机全部学习数据？此操作不可恢复。")) {
                  resetState();
                  setMsg("已清空");
                  setTimeout(() => setMsg(null), 2000);
                }
              }}
            >
              <Trash2 size={16} /> 清空数据
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="p-5">
        <CardTitle>关于</CardTitle>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-soft)]">
          上岸 · 国考学习系统。内置题目与技巧为学习样例，供练习与方法训练，不构成官方真题或培训承诺。进度与错题保存在你的浏览器本地，请定期导出备份。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>示例题仅供学习</Badge>
          <Badge>无账号 · 无统计</Badge>
          <Badge tone="accent">数据在本机</Badge>
        </div>
      </Card>
    </main>
  );
}
