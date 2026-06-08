export interface AIModel {
  id: string;
  provider: string;
  model_name: string;
  display_name: string;
  is_active: boolean;
}

export interface ModelResponse {
  provider: string;
  display_name: string;
  content: string;
  latency_ms: number;
  error?: string;
}

export interface DebateRound {
  id: string;
  round_no: number;
  model_id: string;
  provider: string;
  display_name: string;
  content: string;
  latency_ms: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  topic: string;
  status: "pending" | "running" | "judging" | "done" | "failed";
  selected_models: string[];
  created_at: string;
  completed_at?: string;
  debate_rounds: DebateRound[];
}

export interface ModelScore {
  accuracy: number;
  logic: number;
  evidence: number;
  creativity: number;
  feasibility: number;
  total: number;
  display_name?: string;
}

export interface JudgeResult {
  id: string;
  conversation_id: string;
  winner_provider?: string;
  winner_display_name?: string;
  scores: Record<string, ModelScore>;
  summary: string;
  created_at: string;
}

export interface ConsensusResult {
  id: string;
  conversation_id: string;
  final_answer: string;
  confidence_score: number;
  vote_distribution: Record<string, number>;
  created_at: string;
}

export interface Ranking {
  rank: number;
  model_id: string;
  provider: string;
  display_name: string;
  period: "weekly" | "monthly" | "all_time";
  elo_score: number;
  win_count: number;
  loss_count: number;
  total_debates: number;
  win_rate: number;
  avg_accuracy: number;
}

export type SSEEvent =
  | { type: "connected"; conversation_id: string }
  | { type: "round_response"; round_no: number; provider: string; display_name: string; content: string; latency_ms: number }
  | { type: "round_complete"; round_no: number }
  | { type: "judge_complete"; winner: string; scores: Record<string, ModelScore>; summary: string }
  | { type: "consensus_complete"; final_answer: string; confidence_score: number }
  | { type: "done" }
  | { type: "error"; message: string }
  | { type: "timeout" };

export const PROVIDER_COLORS: Record<string, string> = {
  gpt: "#10a37f",
  claude: "#d97706",
  gemini: "#4285f4",
};

export const PROVIDER_LABELS: Record<string, string> = {
  gpt: "GPT-4o",
  claude: "Claude Opus",
  gemini: "Gemini 2.0",
};
