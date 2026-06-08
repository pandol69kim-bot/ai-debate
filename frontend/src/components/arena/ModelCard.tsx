"use client";

import { clsx } from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Clock, Cpu, AlertCircle, Loader2 } from "lucide-react";
import { PROVIDER_COLORS } from "@/types";

interface ModelCardProps {
  provider: string;
  displayName: string;
  content?: string;
  latencyMs?: number;
  isLoading?: boolean;
  error?: string;
  roundNo?: number;
  variant?: "compact" | "full";
}

const PROVIDER_BG: Record<string, string> = {
  gpt: "border-[#10a37f]/40 bg-[#10a37f]/5",
  claude: "border-[#d97706]/40 bg-[#d97706]/5",
  gemini: "border-[#4285f4]/40 bg-[#4285f4]/5",
};

const PROVIDER_HEADER: Record<string, string> = {
  gpt: "text-[#10a37f]",
  claude: "text-[#d97706]",
  gemini: "text-[#4285f4]",
};

const PROVIDER_DOT: Record<string, string> = {
  gpt: "bg-[#10a37f]",
  claude: "bg-[#d97706]",
  gemini: "bg-[#4285f4]",
};

const PROVIDER_ICONS: Record<string, string> = {
  gpt: "G",
  claude: "C",
  gemini: "G",
};

export function ModelCard({
  provider,
  displayName,
  content,
  latencyMs,
  isLoading,
  error,
  roundNo,
  variant = "full",
}: ModelCardProps) {
  const color = PROVIDER_COLORS[provider] || "#6366f1";

  return (
    <div
      className={clsx(
        "rounded-xl border transition-all duration-300 animate-slide-up",
        PROVIDER_BG[provider] || "border-arena-border bg-arena-card",
        isLoading && "animate-pulse-soft"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-current/10">
        <div className="flex items-center gap-2.5">
          <div
            className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white",
              PROVIDER_DOT[provider] || "bg-arena-accent"
            )}
            style={{ backgroundColor: color }}
          >
            {PROVIDER_ICONS[provider] || provider[0].toUpperCase()}
          </div>
          <div>
            <p className={clsx("text-sm font-semibold", PROVIDER_HEADER[provider])}>
              {displayName}
            </p>
            {roundNo && (
              <p className="text-xs text-slate-500">Round {roundNo}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {latencyMs !== undefined && !isLoading && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{(latencyMs / 1000).toFixed(1)}s</span>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>생성 중</span>
            </div>
          )}
          <Cpu className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </div>

      {/* Content */}
      <div className={clsx("p-4", variant === "compact" ? "text-sm" : "")}>
        {isLoading && !content && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {content && (
          <div className="prose-arena">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
