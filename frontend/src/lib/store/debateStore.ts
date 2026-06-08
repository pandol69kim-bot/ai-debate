import { create } from "zustand";
import type { SSEEvent, ModelScore } from "@/types";

interface DebateRoundEntry {
  round_no: number;
  provider: string;
  display_name: string;
  content: string;
  latency_ms: number;
}

interface JudgeData {
  winner: string;
  scores: Record<string, ModelScore>;
  summary: string;
}

interface ConsensusData {
  final_answer: string;
  confidence_score: number;
}

interface DebateState {
  conversationId: string | null;
  topic: string;
  selectedModels: string[];
  status: "idle" | "connecting" | "running" | "judging" | "done" | "error";
  rounds: DebateRoundEntry[];
  currentRound: number;
  judge: JudgeData | null;
  consensus: ConsensusData | null;
  errorMessage: string | null;

  setTopic: (topic: string) => void;
  setSelectedModels: (models: string[]) => void;
  startDebate: (conversationId: string, topic: string, models: string[]) => void;
  handleSSEEvent: (event: SSEEvent) => void;
  reset: () => void;
}

const initialState = {
  conversationId: null,
  topic: "",
  selectedModels: ["gpt", "claude", "gemini"],
  status: "idle" as const,
  rounds: [],
  currentRound: 0,
  judge: null,
  consensus: null,
  errorMessage: null,
};

export const useDebateStore = create<DebateState>((set) => ({
  ...initialState,

  setTopic: (topic) => set({ topic }),

  setSelectedModels: (selectedModels) => set({ selectedModels }),

  startDebate: (conversationId, topic, models) =>
    set({
      conversationId,
      topic,
      selectedModels: models,
      status: "connecting",
      rounds: [],
      currentRound: 0,
      judge: null,
      consensus: null,
      errorMessage: null,
    }),

  handleSSEEvent: (event) => {
    switch (event.type) {
      case "connected":
        set({ status: "running" });
        break;

      case "round_response":
        set((state) => ({
          rounds: [...state.rounds, {
            round_no: event.round_no,
            provider: event.provider,
            display_name: event.display_name,
            content: event.content,
            latency_ms: event.latency_ms,
          }],
          currentRound: event.round_no,
        }));
        break;

      case "round_complete":
        set({ currentRound: event.round_no });
        break;

      case "judge_complete":
        set({
          status: "judging",
          judge: {
            winner: event.winner,
            scores: event.scores,
            summary: event.summary,
          },
        });
        break;

      case "consensus_complete":
        set({
          consensus: {
            final_answer: event.final_answer,
            confidence_score: event.confidence_score,
          },
        });
        break;

      case "done":
        set({ status: "done" });
        break;

      case "error":
        set({ status: "error", errorMessage: event.message });
        break;
    }
  },

  reset: () => set(initialState),
}));
