"use client";

import { CheckCircle2, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PROVIDER_COLORS } from "@/types";

interface ConsensusReportProps {
  finalAnswer: string;
  confidenceScore: number;
  voteDistribution: Record<string, number>;
}

export function ConsensusReport({ finalAnswer, confidenceScore, voteDistribution }: ConsensusReportProps) {
  const confidencePct = Math.round(confidenceScore * 100);

  return (
    <div className="rounded-xl border border-green-800/40 bg-green-900/10 p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">최종 합의 결론</h2>
          <p className="text-sm text-slate-500">AI들의 공통 의견 종합</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-500">신뢰도</p>
          <p className="text-2xl font-bold text-green-400">{confidencePct}%</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-6">
        <div className="h-2 bg-arena-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Vote distribution */}
      {Object.keys(voteDistribution).length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">기여도</span>
          </div>
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
            {Object.entries(voteDistribution).map(([provider, share]) => {
              const color = PROVIDER_COLORS[provider] || "#6366f1";
              return (
                <div
                  key={provider}
                  className="relative group flex items-center justify-center text-xs font-bold text-white transition-all"
                  style={{ width: `${share * 100}%`, backgroundColor: color }}
                  title={`${provider}: ${Math.round(share * 100)}%`}
                >
                  <span className="truncate px-1">{provider.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Final Answer */}
      <div className="bg-arena-surface rounded-xl p-5 border border-arena-border">
        <div className="prose-arena">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{finalAnswer}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
