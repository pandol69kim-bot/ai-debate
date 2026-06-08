"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Gavel } from "lucide-react";
import Link from "next/link";
import { useDebateStore } from "@/lib/store/debateStore";
import { createDebateStream } from "@/lib/api/client";
import { DebateTimeline } from "@/components/arena/DebateTimeline";
import { JudgePanel } from "@/components/arena/JudgePanel";
import { ConsensusReport } from "@/components/arena/ConsensusReport";
import type { SSEEvent } from "@/types";

const STATUS_LABELS = {
  idle: "",
  connecting: "연결 중...",
  running: "토론 진행 중",
  judging: "Judge AI 평가 중",
  done: "토론 완료",
  error: "오류 발생",
};

export default function DebatePage() {
  const { id } = useParams<{ id: string }>();
  const store = useDebateStore();
  const esRef = useRef<EventSource | null>(null);
  const hasConnected = useRef(false);

  useEffect(() => {
    if (!id || hasConnected.current) return;
    hasConnected.current = true;

    const es = createDebateStream(id);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as SSEEvent;
        store.handleSSEEvent(event);
      } catch {}
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [id]);

  const numRounds = store.status === "idle" ? 3 : Math.max(3, store.currentRound);

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          새 토론
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white leading-tight mb-2">
              {store.topic || "토론 로딩 중..."}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <StatusIndicator status={store.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 p-4 bg-arena-card rounded-xl border border-arena-border">
        <Step done={store.currentRound > 0} active={store.status === "running"} label="토론" />
        <div className="flex-1 h-px bg-arena-border" />
        <Step done={!!store.judge} active={store.status === "judging"} label="Judge 평가" icon={<Gavel className="w-3 h-3" />} />
        <div className="flex-1 h-px bg-arena-border" />
        <Step done={!!store.consensus} active={false} label="합의 도출" icon={<CheckCircle2 className="w-3 h-3" />} />
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Debate Timeline */}
        {(store.status !== "idle") && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              토론 진행
              <span className="text-sm text-slate-500 font-normal">
                Round {store.currentRound} / {numRounds}
              </span>
            </h2>
            <DebateTimeline
              rounds={store.rounds}
              currentRound={store.currentRound}
              totalRounds={numRounds}
              isRunning={store.status === "running"}
            />
          </section>
        )}

        {/* Judge Panel */}
        {store.judge && (
          <section>
            <JudgePanel
              winner={store.judge.winner}
              scores={store.judge.scores}
              summary={store.judge.summary}
            />
          </section>
        )}

        {/* Consensus Report */}
        {store.consensus && (
          <section>
            <ConsensusReport
              finalAnswer={store.consensus.final_answer}
              confidenceScore={store.consensus.confidence_score}
              voteDistribution={{}}
            />
          </section>
        )}

        {/* Error */}
        {store.status === "error" && (
          <div className="flex items-center gap-3 p-5 rounded-xl bg-red-900/20 border border-red-800 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{store.errorMessage || "알 수 없는 오류가 발생했습니다."}</p>
          </div>
        )}

        {/* Connecting */}
        {store.status === "connecting" && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-arena-accent animate-spin mx-auto mb-4" />
              <p className="text-slate-400">AI들을 깨우는 중...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const colors = {
    running: "text-arena-accent",
    judging: "text-amber-400",
    done: "text-green-400",
    error: "text-red-400",
    connecting: "text-slate-400",
    idle: "text-slate-500",
  };

  const icons = {
    running: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    judging: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    done: <CheckCircle2 className="w-3.5 h-3.5" />,
    error: <AlertCircle className="w-3.5 h-3.5" />,
    connecting: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    idle: null,
  };

  return (
    <span className={`flex items-center gap-1.5 ${colors[status as keyof typeof colors] || "text-slate-500"}`}>
      {icons[status as keyof typeof icons]}
      {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
    </span>
  );
}

function Step({
  done,
  active,
  label,
  icon,
}: {
  done: boolean;
  active: boolean;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
          done
            ? "bg-green-500 text-white"
            : active
            ? "bg-arena-accent text-white animate-pulse"
            : "bg-arena-border text-slate-600"
        }`}
      >
        {icon || (done ? "✓" : "")}
      </div>
      <span className={`text-xs font-medium ${done ? "text-green-400" : active ? "text-arena-accent" : "text-slate-600"}`}>
        {label}
      </span>
    </div>
  );
}
