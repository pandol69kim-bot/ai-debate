"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, CheckCircle2, Loader2, AlertCircle, Clock, ChevronRight, Swords } from "lucide-react";
import { clsx } from "clsx";
import { getConversations } from "@/lib/api/client";
import type { Conversation } from "@/types";
import { PROVIDER_COLORS, PROVIDER_LABELS } from "@/types";

const STATUS_META = {
  done:    { label: "완료",    color: "text-green-400",      bg: "bg-green-400/10 border-green-400/30",  icon: CheckCircle2 },
  running: { label: "진행 중", color: "text-arena-accent",   bg: "bg-arena-accent/10 border-arena-accent/30", icon: Loader2 },
  judging: { label: "평가 중", color: "text-amber-400",      bg: "bg-amber-400/10 border-amber-400/30",  icon: Loader2 },
  pending: { label: "대기 중", color: "text-slate-400",      bg: "bg-slate-400/10 border-slate-400/30",  icon: Clock },
  failed:  { label: "실패",    color: "text-red-400",        bg: "bg-red-400/10 border-red-400/30",      icon: AlertCircle },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ModelBadge({ provider }: { provider: string }) {
  const color = PROVIDER_COLORS[provider] ?? "#64748b";
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium border"
      style={{ color, borderColor: `${color}50`, backgroundColor: `${color}15` }}
    >
      {PROVIDER_LABELS[provider] ?? provider.toUpperCase()}
    </span>
  );
}

export default function DebatesPage() {
  const router = useRouter();
  const [debates, setDebates] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getConversations()
      .then((res) => setDebates(res.data as Conversation[]))
      .catch(() => setError("토론 목록을 불러오지 못했습니다. 서버가 실행 중인지 확인해주세요."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-arena-accent" />
            토론 기록
          </h1>
          <p className="text-slate-400 text-sm mt-1">지금까지 진행된 모든 AI 토론 내역</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-arena-accent text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          <Swords className="w-4 h-4" />
          새 토론
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-arena-accent animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-5 rounded-xl bg-red-900/20 border border-red-800 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && debates.length === 0 && (
        <div className="text-center py-24">
          <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">아직 진행된 토론이 없습니다.</p>
          <Link href="/" className="inline-block mt-4 text-arena-accent hover:underline text-sm">
            첫 토론 시작하기 →
          </Link>
        </div>
      )}

      {/* List */}
      {!loading && debates.length > 0 && (
        <div className="space-y-3">
          {debates.map((debate) => {
            const meta = STATUS_META[debate.status as keyof typeof STATUS_META] ?? STATUS_META.pending;
            const Icon = meta.icon;
            const roundCount = debate.debate_rounds.length > 0
              ? Math.max(...debate.debate_rounds.map((r) => r.round_no))
              : 0;

            return (
              <button
                key={debate.id}
                onClick={() => router.push(`/debate/${debate.id}`)}
                className={clsx(
                  "w-full text-left bg-arena-card border border-arena-border rounded-2xl p-5",
                  "hover:border-arena-accent/50 hover:bg-arena-card/80 transition-all group"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Topic */}
                    <p className="text-white font-semibold text-base leading-snug mb-3 truncate pr-4">
                      {debate.topic}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status badge */}
                      <span className={clsx("flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium", meta.bg, meta.color)}>
                        <Icon className={clsx("w-3 h-3", (debate.status === "running" || debate.status === "judging") && "animate-spin")} />
                        {meta.label}
                      </span>

                      {/* Model badges */}
                      {debate.selected_models.map((m) => (
                        <ModelBadge key={m} provider={m} />
                      ))}

                      {/* Round count */}
                      {roundCount > 0 && (
                        <span className="text-xs text-slate-500">{roundCount} 라운드</span>
                      )}

                      {/* Date */}
                      <span className="text-xs text-slate-600 ml-auto">
                        {formatDate(debate.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-arena-accent transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
