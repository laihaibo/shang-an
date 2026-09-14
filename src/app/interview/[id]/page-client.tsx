"use client";

import { use, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Pause, Play, Square } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInterview } from "@/content/interview";
import { INTERVIEW_CATEGORIES } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

export default function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const q = getInterview(id);
  const [showFramework, setShowFramework] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recError, setRecError] = useState<string | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [mediaRecorder, audioUrl]);

  if (!q) {
    return (
      <main>
        <PageHeader title="题目不存在" backHref="/interview/" />
      </main>
    );
  }

  const cat = INTERVIEW_CATEGORIES.find((c) => c.key === q.category);
  const over = seconds >= q.suggestedSeconds;

  const toggleTimer = () => setRunning((r) => !r);

  const resetTimer = () => {
    setRunning(false);
    setSeconds(0);
  };

  const startRecord = async () => {
    try {
      setRecError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      setMediaRecorder(rec);
    } catch {
      setRecError("无法访问麦克风。可在浏览器权限中开启，或仅用计时练习。");
    }
  };

  const stopRecord = () => {
    mediaRecorder?.stop();
    setMediaRecorder(null);
  };

  return (
    <main>
      <PageHeader
        title={q.title}
        backHref="/interview/"
        action={<Badge tone="accent">{cat?.name}</Badge>}
      />

      <Card strong className="mb-4 p-5">
        <p className="text-[16px] leading-relaxed">{q.stem}</p>
        <p className="mt-3 text-[13px] text-[var(--ink-soft)]">
          建议作答 {formatDuration(q.suggestedSeconds)} · 开口说完整，不要只在心里想。
        </p>
      </Card>

      <Card className="mb-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] text-[var(--ink-soft)]">答题计时</p>
            <p
              className={`font-mono font-display text-[40px] font-semibold leading-none ${
                over ? "text-[var(--danger)]" : ""
              }`}
            >
              {formatDuration(seconds)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={toggleTimer} variant={running ? "secondary" : "primary"}>
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? "暂停" : "开始"}
            </Button>
            <Button variant="ghost" onClick={resetTimer}>
              <Square size={16} /> 重置
            </Button>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <p className="mb-2 text-[13px] font-medium">录音自听（可选）</p>
          {mediaRecorder ? (
            <Button variant="danger" size="sm" onClick={stopRecord}>
              <MicOff size={16} /> 停止录音
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={startRecord}>
              <Mic size={16} /> 开始录音
            </Button>
          )}
          {audioUrl ? (
            <audio controls src={audioUrl} className="mt-3 w-full" />
          ) : null}
          {recError ? (
            <p className="mt-2 text-[13px] text-[var(--danger)]">{recError}</p>
          ) : null}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[18px] font-semibold">答题框架</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowFramework((s) => !s)}
          >
            {showFramework ? "先自己答" : "查看要点"}
          </Button>
        </div>
        {showFramework ? (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[14px] font-medium">推荐结构</p>
              <ol className="space-y-2">
                {q.framework.map((f, i) => (
                  <li key={i} className="flex gap-2 text-[14px] leading-relaxed">
                    <span className="font-mono text-[var(--accent)]">{i + 1}.</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="mb-2 text-[14px] font-medium">常见坑</p>
              <ul className="space-y-1.5">
                {q.pitfalls.map((p, i) => (
                  <li key={i} className="text-[14px] text-[var(--ink-soft)]">
                    · {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[14px] font-medium">可迁移要点</p>
              <ul className="space-y-1.5">
                {q.samplePoints.map((p, i) => (
                  <li key={i} className="text-[14px]">
                    · {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-[14px] text-[var(--ink-soft)]">
            建议先限时口述一遍，再对照框架找漏点。直接看答案会降低训练效果。
          </p>
        )}
      </Card>
    </main>
  );
}
