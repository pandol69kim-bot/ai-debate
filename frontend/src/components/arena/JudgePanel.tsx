"use client";

import { Trophy, Star, Brain, FileCheck, Lightbulb, Target } from "lucide-react";
import { clsx } from "clsx";
import { PROVIDER_COLORS } from "@/types";
import type { ModelScore } from "@/types";

interface JudgePanelProps {
  winner: string;
  scores: Record<string, ModelScore>;
  summary: string;
}

const SCORE_ITEMS = [
  { key: "accuracy", label: "정확성", icon: FileCheck },
  { key: "logic", label: "논리성", icon: Brain },
  { key: "evidence", label: "근거", icon: Star },
  { key: "creativity", label: "창의성", icon: Lightbulb },
  { key: "feasibility", label: "실현가능성", icon: Target },
];

const PROVIDER_BG: Record<string, string> = {
  gpt: "border-[#10a37f]/50 bg-[#10a37f]/10",
  claude: "border-[#d97706]/50 bg-[#d97706]/10",
  gemini: "border-[#4285f4]/50 bg-[#4285f4]/10",
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  const pct = Math.min(100, (score / 10) * 100);
  return (
    <div className="h-1.5 bg-arena-border rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function JudgePanel({ winner, scores, summary }: JudgePanelProps) {
  const sortedProviders = Object.entries(scores).sort(
    ([, a], [, b]) => (b.total || 0) - (a.total || 0)
  );

  return (
    <div className="rounded-xl border border-arena-accent/30 bg-arena-accent/5 p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-arena-accent/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-arena-gold" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Judge AI 평가 결과</h2>
          <p className="text-sm text-slate-500">5개 항목 종합 평가</p>
        </div>
      </div>

      {/* Winner Banner */}
      {winner && (
        <div
          className={clsx(
            "flex items-center gap-3 p-4 rounded-xl border mb-6",
            PROVIDER_BG[winner] || "border-arena-accent/30 bg-arena-accent/10"
          )}
        >
          <Trophy className="w-6 h-6 text-arena-gold flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Winner</p>
            <p className="text-xl font-bold text-white">
              {scores[winner]?.display_name || winner.toUpperCase()}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-500">총점</p>
            <p className="text-2xl font-bold" style={{ color: PROVIDER_COLORS[winner] }}>
              {scores[winner]?.total?.toFixed(1) || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Score Table */}
      <div className="space-y-4 mb-6">
        {sortedProviders.map(([provider, score], idx) => {
          const color = PROVIDER_COLORS[provider] || "#6366f1";
          return (
            <div key={provider} className="bg-arena-card rounded-xl p-4 border border-arena-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-white text-sm">
                    {score.display_name || provider.toUpperCase()}
                  </span>
                </div>
                <span className="text-lg font-bold" style={{ color }}>
                  {score.total?.toFixed(1) || "—"}
                </span>
              </div>

              <div className="space-y-1.5">
                {SCORE_ITEMS.map(({ key, label, icon: Icon }) => {
                  const val = score[key as keyof ModelScore] as number || 0;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className="w-3 h-3 text-slate-600 flex-shrink-0" />
                      <span className="text-xs text-slate-500 w-16">{label}</span>
                      <div className="flex-1">
                        <ScoreBar score={val} color={color} />
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-6 text-right">
                        {val.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-arena-surface rounded-xl p-4 border border-arena-border">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Judge 총평</p>
        <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}
