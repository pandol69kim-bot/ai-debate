"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swords, Zap, Brain, ChevronRight, CheckSquare, Square } from "lucide-react";
import { clsx } from "clsx";
import { startDebate, getModels } from "@/lib/api/client";
import { useDebateStore } from "@/lib/store/debateStore";
import { PROVIDER_COLORS, type AIModel } from "@/types";

const PROVIDER_DESC: Record<string, string> = {
  gpt: "최첨단 추론 & 코딩",
  claude: "심층 분석 & 글쓰기",
  gemini: "멀티모달 & 검색",
};

const ROUND_OPTIONS = [1, 2, 3];

const EXAMPLE_TOPICS = [
  "2030년 가장 유망한 투자 자산은 무엇인가?",
  "AI가 인간의 일자리를 대체할 것인가?",
  "원격 근무와 사무실 근무 중 어느 것이 더 효율적인가?",
  "기후 변화 대응에 있어 탄소세는 효과적인 수단인가?",
];

export default function HomePage() {
  const router = useRouter();
  const { startDebate: initDebate } = useDebateStore();

  const [models, setModels] = useState<AIModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  const [topic, setTopic] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [numRounds, setNumRounds] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getModels()
      .then((res) => {
        const active = res.data;
        setModels(active);
        // Default: select all active models
        setSelectedModels(active.map((m) => m.provider));
      })
      .catch(() => {
        // Fallback to hardcoded list if API is unreachable
        const fallback: AIModel[] = [
          { id: "1", provider: "gpt", model_name: "gpt-4o", display_name: "GPT-4o", is_active: true },
          { id: "2", provider: "claude", model_name: "claude-opus-4-8", display_name: "Claude Opus", is_active: true },
          { id: "3", provider: "gemini", model_name: "gemini-2.0-flash", display_name: "Gemini 2.0", is_active: true },
        ];
        setModels(fallback);
        setSelectedModels(fallback.map((m) => m.provider));
      })
      .finally(() => setModelsLoading(false));
  }, []);

  const toggleModel = (provider: string) => {
    setSelectedModels((prev) =>
      prev.includes(provider)
        ? prev.length > 2 ? prev.filter((m) => m !== provider) : prev
        : [...prev, provider]
    );
  };

  const handleStart = async () => {
    if (!topic.trim()) {
      setError("토론 주제를 입력해주세요.");
      return;
    }
    if (selectedModels.length < 2) {
      setError("최소 2개 이상의 AI를 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await startDebate(topic, selectedModels, numRounds);
      const { conversation_id } = res.data;
      initDebate(conversation_id, topic, selectedModels);
      router.push(`/debate/${conversation_id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "토론을 시작할 수 없습니다.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-radial from-arena-accent/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-arena-accent/40 bg-arena-accent/10 text-arena-accent text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI 멀티 모델 경쟁·토론 플랫폼
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 tracking-tight leading-tight">
            AI들이 직접
            <br />
            <span className="text-arena-accent">토론</span>합니다
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            GPT, Claude, Gemini가 당신의 질문에 동시에 답변하고,
            서로 반박하며, Judge AI가 최종 승자를 선정합니다.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 pb-20 space-y-6">

        {/* Topic Input */}
        <div className="bg-arena-card rounded-2xl border border-arena-border p-6">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            토론 주제
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 2030년 가장 유망한 투자 자산은 무엇인가?"
            className="w-full bg-arena-surface rounded-xl border border-arena-border px-4 py-3 text-white placeholder-slate-600 resize-none focus:outline-none focus:border-arena-accent transition-colors min-h-[100px]"
          />

          {/* Example topics */}
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className="text-xs px-3 py-1 rounded-full border border-arena-border text-slate-500 hover:text-slate-300 hover:border-arena-accent/50 transition-colors"
              >
                {t.length > 25 ? t.slice(0, 25) + "…" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-arena-card rounded-2xl border border-arena-border p-6">
          <label className="block text-sm font-semibold text-slate-300 mb-4">
            참가 AI 선택{" "}
            <span className="text-slate-600 font-normal">(최소 2개)</span>
          </label>

          {modelsLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl border border-arena-border bg-arena-surface animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {models.map((model) => {
                const selected = selectedModels.includes(model.provider);
                const color = PROVIDER_COLORS[model.provider] ?? "#64748b";
                const desc = PROVIDER_DESC[model.provider] ?? model.model_name;
                return (
                  <button
                    key={model.id}
                    onClick={() => toggleModel(model.provider)}
                    className={clsx(
                      "relative p-4 rounded-xl border-2 text-left transition-all",
                      selected
                        ? "border-current bg-current/10"
                        : "border-arena-border bg-arena-surface hover:border-arena-border/80"
                    )}
                    style={selected ? { borderColor: color, color } : {}}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {model.display_name[0]}
                      </div>
                      {selected ? (
                        <CheckSquare className="w-4 h-4" style={{ color }} />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white">{model.display_name}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Round Count */}
        <div className="bg-arena-card rounded-2xl border border-arena-border p-6">
          <label className="block text-sm font-semibold text-slate-300 mb-4">
            토론 라운드
          </label>
          <div className="flex gap-3">
            {ROUND_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setNumRounds(n)}
                className={clsx(
                  "flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all",
                  numRounds === n
                    ? "border-arena-accent bg-arena-accent/20 text-arena-accent"
                    : "border-arena-border text-slate-500 hover:border-arena-border/80"
                )}
              >
                {n} Round
                <span className="block text-xs font-normal mt-0.5 text-slate-600">
                  {n === 1 ? "빠른 비교" : n === 2 ? "기본 토론" : "심층 토론"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={isLoading || !topic.trim() || modelsLoading}
          className={clsx(
            "w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all",
            "bg-gradient-to-r from-arena-accent to-indigo-600 hover:from-indigo-600 hover:to-arena-accent",
            "glow-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:glow-none"
          )}
        >
          {isLoading ? (
            <>
              <Brain className="w-5 h-5 animate-pulse" />
              토론 시작 중...
            </>
          ) : (
            <>
              <Swords className="w-5 h-5" />
              토론 시작
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
