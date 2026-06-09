import axios from "axios";

export interface AdminConversationOut {
  id: string;
  topic: string;
  status: string;
  selected_models: string[];
  user_email: string | null;
  round_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface AdminStatsOut {
  total_debates: number;
  done: number;
  failed: number;
  running: number;
  total_users: number;
}

export interface AdminUserOut {
  id: string;
  email: string;
  name: string;
  plan: string;
  is_admin: boolean;
  debate_count: number;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE = `${API_URL}/api/v1`;

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("arena_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Debate
export const startDebate = (topic: string, selectedModels: string[], numRounds = 3) =>
  api.post<{ conversation_id: string; status: string }>("/debate/start", {
    topic,
    selected_models: selectedModels,
    num_rounds: numRounds,
  });

export const getConversation = (id: string) =>
  api.get(`/debate/${id}`);

export const getJudgeResult = (conversationId: string) =>
  api.get(`/judge/${conversationId}`);

export const getConsensus = (conversationId: string) =>
  api.get(`/consensus/${conversationId}`);

// Models
export const getModels = () =>
  api.get("/models/");

export const multiQuery = (topic: string, selectedModels: string[]) =>
  api.post("/models/query", { topic, selected_models: selectedModels });

// Auth
export const register = (email: string, name: string, password: string) =>
  api.post<{ id: string; email: string; name: string; plan: string; created_at: string }>(
    "/auth/register",
    { email, name, password }
  );

export const login = (email: string, password: string) =>
  api.post<{ access_token: string }>("/auth/login", { email, password });

export const getMe = () =>
  api.get<{ id: string; email: string; name: string; plan: string; is_admin: boolean; created_at: string }>("/auth/me");

// Debates list
export const getConversations = () =>
  api.get("/debate/");

// Rankings
export const getRankings = (period: string = "all_time") =>
  api.get(`/rankings/?period=${period}`);

// SSE stream
export const createDebateStream = (conversationId: string) => {
  const url = `${API_BASE}/debate/${conversationId}/stream`;
  return new EventSource(url);
};

// Admin
export const getAdminDebates = () =>
  api.get<AdminConversationOut[]>("/admin/debates");

export const getAdminStats = () =>
  api.get<AdminStatsOut>("/admin/stats");

export const deleteAdminDebate = (id: string) =>
  api.delete(`/admin/debates/${id}`);

export const getAdminUsers = () =>
  api.get<AdminUserOut[]>("/admin/users");

export const toggleAdminUser = (id: string) =>
  api.patch<AdminUserOut>(`/admin/users/${id}/toggle-admin`);

export const deleteAdminUser = (id: string) =>
  api.delete(`/admin/users/${id}`);
