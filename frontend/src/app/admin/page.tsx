"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Users, MessageSquare, CheckCircle, AlertCircle, Activity } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/lib/store/authStore";
import {
  getAdminDebates, getAdminStats, deleteAdminDebate,
  AdminConversationOut, AdminStatsOut,
} from "@/lib/api/client";

const STATUS_LABEL: Record<string, string> = {
  pending: "대기",
  running: "진행",
  judging: "심사",
  done: "완료",
  failed: "실패",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-slate-700 text-slate-300",
  running: "bg-blue-900/50 text-blue-300",
  judging: "bg-purple-900/50 text-purple-300",
  done: "bg-green-900/50 text-green-300",
  failed: "bg-red-900/50 text-red-300",
};

interface DeleteModal {
  id: string;
  topic: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();

  const [debates, setDebates] = useState<AdminConversationOut[]>([]);
  const [stats, setStats] = useState<AdminStatsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user?.is_admin) {
      router.push("/");
    }
  }, [isLoggedIn, user, router]);

  const fetchData = useCallback(async () => {
    try {
      const [debatesRes, statsRes] = await Promise.all([
        getAdminDebates(),
        getAdminStats(),
      ]);
      setDebates(debatesRes.data);
      setStats(statsRes.data);
    } catch {
      // 접근 권한 없으면 홈으로
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isLoggedIn && user?.is_admin) {
      fetchData();
    }
  }, [isLoggedIn, user, fetchData]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteAdminDebate(deleteModal.id);
      setDebates((prev) => prev.filter((d) => d.id !== deleteModal.id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              total_debates: prev.total_debates - 1,
              done: deleteModal ? prev.done : prev.done,
            }
          : prev
      );
      // 통계 재로드
      const statsRes = await getAdminStats();
      setStats(statsRes.data);
    } finally {
      setDeleting(false);
      setDeleteModal(null);
    }
  };

  if (!isLoggedIn || !user?.is_admin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-bold text-white mb-6">관리자 대시보드</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: "전체 토론", value: stats.total_debates, icon: MessageSquare, color: "text-slate-300" },
            { label: "완료", value: stats.done, icon: CheckCircle, color: "text-green-400" },
            { label: "진행 중", value: stats.running, icon: Activity, color: "text-blue-400" },
            { label: "실패", value: stats.failed, icon: AlertCircle, color: "text-red-400" },
            { label: "가입 유저", value: stats.total_users, icon: Users, color: "text-arena-accent" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-arena-card rounded-xl border border-arena-border p-4 flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5">
                <Icon className={clsx("w-4 h-4", color)} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
              <span className={clsx("text-2xl font-bold", color)}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Debates table */}
      <div className="bg-arena-card rounded-xl border border-arena-border overflow-hidden">
        <div className="px-4 py-3 border-b border-arena-border">
          <h2 className="text-sm font-semibold text-slate-300">전체 토론 목록</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
            불러오는 중...
          </div>
        ) : debates.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
            토론이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-arena-border">
            {debates.map((debate) => (
              <div
                key={debate.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-arena-surface/50 transition-colors"
              >
                {/* Status */}
                <span
                  className={clsx(
                    "shrink-0 text-xs px-2 py-0.5 rounded-full font-medium",
                    STATUS_CLASS[debate.status] ?? "bg-slate-700 text-slate-300"
                  )}
                >
                  {STATUS_LABEL[debate.status] ?? debate.status}
                </span>

                {/* Topic */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{debate.topic}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">
                      {debate.user_email ?? "비로그인"}
                    </span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">
                      {new Date(debate.created_at).toLocaleDateString("ko-KR")}
                    </span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{debate.round_count}라운드</span>
                  </div>
                </div>

                {/* Models */}
                <div className="hidden sm:flex gap-1 shrink-0">
                  {debate.selected_models.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-1.5 py-0.5 rounded bg-arena-surface text-slate-400 border border-arena-border"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Delete */}
                <button
                  onClick={() => setDeleteModal({ id: debate.id, topic: debate.topic })}
                  className="shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-arena-card rounded-2xl border border-arena-border p-6 w-full max-w-sm">
            <h3 className="text-base font-semibold text-white mb-2">토론 삭제</h3>
            <p className="text-sm text-slate-400 mb-1">아래 토론을 삭제하시겠습니까?</p>
            <p className="text-sm text-slate-200 font-medium mb-5 line-clamp-2">
              &ldquo;{deleteModal.topic}&rdquo;
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-arena-surface border border-arena-border transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
