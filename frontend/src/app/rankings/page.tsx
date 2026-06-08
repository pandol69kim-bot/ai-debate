"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, TrendingUp, Swords } from "lucide-react";
import { getRankings } from "@/lib/api/client";
import type { Ranking } from "@/types";
import { PROVIDER_COLORS } from "@/types";
import { clsx } from "clsx";

const PERIODS = [
  { id: "all_time", label: "전체" },
  { id: "monthly", label: "이번 달" },
  { id: "weekly", label: "이번 주" },
];

const RANK_ICONS: Record<number, React.ReactNode> = {
  1: <Trophy className="w-5 h-5 text-arena-gold" />,
  2: <Medal className="w-5 h-5 text-arena-silver" />,
  3: <Medal className="w-5 h-5 text-arena-bronze" />,
};

export default function RankingsPage() {
  const [period, setPeriod] = useState("all_time");
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getRankings(period)
      .then((res) => setRankings(res.data))
      .catch(() => setError("랭킹을 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-arena-accent/20 mb-4">
          <Trophy className="w-7 h-7 text-arena-accent" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">AI 랭킹</h1>
        <p className="text-slate-400">토론 성과 기반 실시간 AI 모델 순위</p>
      </div>

      {/* Period filter */}
      <div className="flex justify-center gap-2 mb-8">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
              period === p.id
                ? "border-arena-accent bg-arena-accent/20 text-arena-accent"
                : "border-arena-border text-slate-500 hover:text-slate-300"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-arena-card rounded-2xl border border-arena-border animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-slate-500">
          <Swords className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{error}</p>
          <p className="text-sm mt-2">토론을 시작하면 랭킹이 집계됩니다.</p>
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Swords className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">아직 토론 기록이 없습니다</p>
          <p className="text-sm mt-2">첫 번째 토론을 시작해보세요!</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-arena-accent text-white text-sm font-medium hover:bg-arena-accent-hover transition-colors"
          >
            토론 시작하기
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((r) => (
            <RankingCard key={r.model_id} ranking={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function RankingCard({ ranking: r }: { ranking: Ranking }) {
  const color = PROVIDER_COLORS[r.provider] || "#6366f1";
  const winRate = r.total_debates > 0 ? Math.round((r.win_count / r.total_debates) * 100) : 0;

  return (
    <div
      className="flex items-center gap-5 p-5 rounded-2xl border transition-all hover:border-current/30"
      style={{
        borderColor: r.rank <= 3 ? `${color}30` : undefined,
        backgroundColor: r.rank <= 3 ? `${color}08` : undefined,
      }}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-10 flex-shrink-0">
        {RANK_ICONS[r.rank] || (
          <span className="text-lg font-bold text-slate-500">#{r.rank}</span>
        )}
      </div>

      {/* Model Avatar */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {r.display_name[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-white">{r.display_name}</h3>
          <span className="text-xs text-slate-500">{r.provider}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>{r.total_debates}전</span>
          <span className="text-green-400">{r.win_count}승</span>
          <span className="text-red-400">{r.loss_count}패</span>
          <span>승률 {winRate}%</span>
        </div>
      </div>

      {/* ELO Score */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1.5 justify-end mb-1">
          <TrendingUp className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-xs text-slate-500">ELO</span>
        </div>
        <p className="text-2xl font-bold" style={{ color }}>
          {Math.round(r.elo_score)}
        </p>
      </div>

      {/* Win Rate Bar */}
      <div className="w-20 flex-shrink-0">
        <div className="text-xs text-slate-500 mb-1 text-right">승률</div>
        <div className="h-1.5 bg-arena-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${winRate}%`, backgroundColor: color }}
          />
        </div>
        <div className="text-xs text-right mt-1" style={{ color }}>
          {winRate}%
        </div>
      </div>
    </div>
  );
}
