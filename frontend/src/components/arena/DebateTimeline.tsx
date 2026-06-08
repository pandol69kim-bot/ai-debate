"use client";

import { clsx } from "clsx";
import { ModelCard } from "./ModelCard";
import { Badge } from "@/components/ui/Badge";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface RoundEntry {
  round_no: number;
  provider: string;
  display_name: string;
  content: string;
  latency_ms: number;
}

interface DebateTimelineProps {
  rounds: RoundEntry[];
  currentRound: number;
  totalRounds: number;
  isRunning: boolean;
}

export function DebateTimeline({ rounds, currentRound, totalRounds, isRunning }: DebateTimelineProps) {
  const [collapsedRounds, setCollapsedRounds] = useState<Set<number>>(new Set());

  const roundGroups: Record<number, RoundEntry[]> = {};
  for (const r of rounds) {
    if (!roundGroups[r.round_no]) roundGroups[r.round_no] = [];
    roundGroups[r.round_no].push(r);
  }

  const roundNumbers = Array.from(
    { length: totalRounds },
    (_, i) => i + 1
  );

  const toggleRound = (roundNo: number) => {
    setCollapsedRounds((prev) => {
      const next = new Set(prev);
      if (next.has(roundNo)) next.delete(roundNo);
      else next.add(roundNo);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {roundNumbers.map((roundNo) => {
        const entries = roundGroups[roundNo] || [];
        const isCurrentRound = roundNo === currentRound;
        const isUpcoming = roundNo > currentRound;
        const isCollapsed = collapsedRounds.has(roundNo);

        return (
          <div key={roundNo} className={clsx("transition-opacity", isUpcoming && "opacity-40")}>
            {/* Round Header */}
            <button
              onClick={() => entries.length > 0 && toggleRound(roundNo)}
              className="w-full flex items-center gap-3 mb-3 group"
              disabled={entries.length === 0}
            >
              <div
                className={clsx(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-all",
                  isCurrentRound && isRunning
                    ? "border-arena-accent bg-arena-accent/20 text-arena-accent animate-pulse"
                    : entries.length > 0
                    ? "border-slate-600 bg-slate-800 text-slate-300"
                    : "border-slate-700 bg-transparent text-slate-600"
                )}
              >
                {roundNo}
              </div>

              <div className="flex items-center gap-2 flex-1">
                <span
                  className={clsx(
                    "text-sm font-semibold",
                    isCurrentRound && isRunning ? "text-arena-accent" : "text-slate-300"
                  )}
                >
                  Round {roundNo}
                </span>
                {roundNo === 1 && <Badge variant="info">초기 답변</Badge>}
                {roundNo === 2 && <Badge variant="warning">검토 & 반박</Badge>}
                {roundNo >= 3 && <Badge variant="success">최종 입장</Badge>}
                {isCurrentRound && isRunning && (
                  <Badge variant="info">
                    <span className="w-1.5 h-1.5 rounded-full bg-arena-accent animate-pulse" />
                    진행 중
                  </Badge>
                )}
              </div>

              {entries.length > 0 && (
                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              )}
            </button>

            {/* Round Entries */}
            {!isCollapsed && entries.length > 0 && (
              <div className="ml-11 space-y-3">
                {entries.map((entry, idx) => (
                  <ModelCard
                    key={`${entry.provider}-${idx}`}
                    provider={entry.provider}
                    displayName={entry.display_name}
                    content={entry.content}
                    latencyMs={entry.latency_ms}
                    roundNo={entry.round_no}
                  />
                ))}
              </div>
            )}

            {/* Loading placeholder for current round */}
            {isCurrentRound && isRunning && entries.length === 0 && (
              <div className="ml-11 space-y-3">
                {["gpt", "claude", "gemini"].map((p) => (
                  <ModelCard
                    key={p}
                    provider={p}
                    displayName={p === "gpt" ? "GPT-4o" : p === "claude" ? "Claude Opus" : "Gemini 2.0"}
                    isLoading
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
