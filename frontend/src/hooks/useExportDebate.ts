import { useState } from "react";
import { debateToMarkdown, sanitizeFilename } from "@/lib/debateToMarkdown";
import type { DebateRoundEntry, JudgeData, ConsensusData } from "@/lib/debateToMarkdown";

export function useExportDebate(
  topic: string,
  rounds: DebateRoundEntry[],
  judge: JudgeData | null,
  consensus: ConsensusData | null,
) {
  const [copied, setCopied] = useState(false);

  const getMarkdown = () => debateToMarkdown(topic, rounds, judge, consensus);

  const copy = async () => {
    const md = getMarkdown();
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 미지원 환경 fallback
      const el = document.createElement("textarea");
      el.value = md;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const download = () => {
    const md = getMarkdown();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `토론_${sanitizeFilename(topic)}_${date}.md`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { copy, download, copied };
}
