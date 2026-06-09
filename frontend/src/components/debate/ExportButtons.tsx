"use client";

import { Copy, Check, Download } from "lucide-react";
import { useExportDebate } from "@/hooks/useExportDebate";
import type { DebateRoundEntry, JudgeData, ConsensusData } from "@/lib/debateToMarkdown";

interface ExportButtonsProps {
  topic: string;
  rounds: DebateRoundEntry[];
  judge: JudgeData | null;
  consensus: ConsensusData | null;
  disabled?: boolean;
}

export function ExportButtons({ topic, rounds, judge, consensus, disabled }: ExportButtonsProps) {
  const { copy, download, copied } = useExportDebate(topic, rounds, judge, consensus);

  const base =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copy}
        disabled={disabled || rounds.length === 0}
        title="Markdown 형식으로 클립보드에 복사"
        className={
          base +
          (copied
            ? " border-green-700 bg-green-900/30 text-green-400"
            : " border-arena-border bg-arena-card text-slate-400 hover:text-slate-200 hover:bg-arena-surface disabled:opacity-40 disabled:cursor-not-allowed")
        }
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            복사됨
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            복사
          </>
        )}
      </button>

      <button
        onClick={download}
        disabled={disabled || rounds.length === 0}
        title=".md 파일로 다운로드"
        className={
          base +
          " border-arena-border bg-arena-card text-slate-400 hover:text-slate-200 hover:bg-arena-surface disabled:opacity-40 disabled:cursor-not-allowed"
        }
      >
        <Download className="w-3.5 h-3.5" />
        MD 저장
      </button>
    </div>
  );
}
