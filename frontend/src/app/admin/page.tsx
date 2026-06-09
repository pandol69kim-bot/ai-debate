"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2, Users, MessageSquare, CheckCircle, AlertCircle,
  Activity, Shield, ShieldOff,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/lib/store/authStore";
import {
  getAdminDebates, getAdminStats, deleteAdminDebate,
  getAdminUsers, toggleAdminUser, deleteAdminUser,
  AdminConversationOut, AdminStatsOut, AdminUserOut,
} from "@/lib/api/client";

// ── 상수 ────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending: "대기", running: "진행", judging: "심사", done: "완료", failed: "실패",
};
const STATUS_CLASS: Record<string, string> = {
  pending: "bg-slate-700 text-slate-300",
  running: "bg-blue-900/50 text-blue-300",
  judging: "bg-purple-900/50 text-purple-300",
  done: "bg-green-900/50 text-green-300",
  failed: "bg-red-900/50 text-red-300",
};

type Tab = "debates" | "users";

interface DeleteDebateModal { id: string; topic: string; }
interface DeleteUserModal   { id: string; name: string; email: string; }

// ── 통계 카드 ────────────────────────────────────────────────────────────────

function StatsCards({ stats }: { stats: AdminStatsOut }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
      {[
        { label: "전체 토론", value: stats.total_debates, icon: MessageSquare, color: "text-slate-300" },
        { label: "완료",      value: stats.done,           icon: CheckCircle,   color: "text-green-400" },
        { label: "진행 중",   value: stats.running,        icon: Activity,      color: "text-blue-400"  },
        { label: "실패",      value: stats.failed,         icon: AlertCircle,   color: "text-red-400"   },
        { label: "가입 유저", value: stats.total_users,    icon: Users,         color: "text-arena-accent" },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-arena-card rounded-xl border border-arena-border p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Icon className={clsx("w-4 h-4", color)} />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
          <span className={clsx("text-2xl font-bold", color)}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── 토론 관리 탭 ─────────────────────────────────────────────────────────────

function DebatesTab({
  debates,
  loading,
  onDelete,
}: {
  debates: AdminConversationOut[];
  loading: boolean;
  onDelete: (d: DeleteDebateModal) => void;
}) {
  return (
    <div className="bg-arena-card rounded-xl border border-arena-border overflow-hidden">
      <div className="px-4 py-3 border-b border-arena-border">
        <h2 className="text-sm font-semibold text-slate-300">전체 토론 목록</h2>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">불러오는 중...</div>
      ) : debates.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">토론이 없습니다.</div>
      ) : (
        <div className="divide-y divide-arena-border">
          {debates.map((debate) => (
            <div key={debate.id} className="flex items-center gap-3 px-4 py-3 hover:bg-arena-surface/50 transition-colors">
              <span className={clsx("shrink-0 text-xs px-2 py-0.5 rounded-full font-medium", STATUS_CLASS[debate.status] ?? "bg-slate-700 text-slate-300")}>
                {STATUS_LABEL[debate.status] ?? debate.status}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{debate.topic}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">{debate.user_email ?? "비로그인"}</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-500">{new Date(debate.created_at).toLocaleDateString("ko-KR")}</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-500">{debate.round_count}라운드</span>
                </div>
              </div>
              <div className="hidden sm:flex gap-1 shrink-0">
                {debate.selected_models.map((m) => (
                  <span key={m} className="text-xs px-1.5 py-0.5 rounded bg-arena-surface text-slate-400 border border-arena-border">{m}</span>
                ))}
              </div>
              <button
                onClick={() => onDelete({ id: debate.id, topic: debate.topic })}
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
  );
}

// ── 회원 관리 탭 ─────────────────────────────────────────────────────────────

function UsersTab({
  users,
  loading,
  currentUserId,
  onToggleAdmin,
  onDelete,
}: {
  users: AdminUserOut[];
  loading: boolean;
  currentUserId: string;
  onToggleAdmin: (id: string) => void;
  onDelete: (d: DeleteUserModal) => void;
}) {
  return (
    <div className="bg-arena-card rounded-xl border border-arena-border overflow-hidden">
      <div className="px-4 py-3 border-b border-arena-border">
        <h2 className="text-sm font-semibold text-slate-300">전체 회원 목록</h2>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">불러오는 중...</div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">회원이 없습니다.</div>
      ) : (
        <div className="divide-y divide-arena-border">
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-arena-surface/50 transition-colors">
                {/* 권한 배지 */}
                <span className={clsx(
                  "shrink-0 text-xs px-2 py-0.5 rounded-full font-medium",
                  u.is_admin ? "bg-arena-accent/20 text-arena-accent" : "bg-slate-700 text-slate-400"
                )}>
                  {u.is_admin ? "관리자" : "일반"}
                </span>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-slate-200 truncate">{u.name}</p>
                    {isSelf && <span className="text-xs text-arena-accent">(나)</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 truncate">{u.email}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">토론 {u.debate_count}건</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString("ko-KR")} 가입</span>
                  </div>
                </div>

                {/* 액션 */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onToggleAdmin(u.id)}
                    disabled={isSelf}
                    className={clsx(
                      "p-1.5 rounded-lg transition-colors",
                      isSelf
                        ? "text-slate-700 cursor-not-allowed"
                        : u.is_admin
                          ? "text-arena-accent hover:text-slate-400 hover:bg-arena-surface"
                          : "text-slate-600 hover:text-arena-accent hover:bg-arena-accent/10"
                    )}
                    title={isSelf ? "본인 권한 변경 불가" : u.is_admin ? "관리자 해제" : "관리자 지정"}
                  >
                    {u.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onDelete({ id: u.id, name: u.name, email: u.email })}
                    disabled={isSelf}
                    className={clsx(
                      "p-1.5 rounded-lg transition-colors",
                      isSelf
                        ? "text-slate-700 cursor-not-allowed"
                        : "text-slate-600 hover:text-red-400 hover:bg-red-900/20"
                    )}
                    title={isSelf ? "본인 삭제 불가" : "회원 삭제"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();

  const [tab, setTab] = useState<Tab>("debates");

  const [debates, setDebates]       = useState<AdminConversationOut[]>([]);
  const [users, setUsers]           = useState<AdminUserOut[]>([]);
  const [stats, setStats]           = useState<AdminStatsOut | null>(null);
  const [debatesLoading, setDebatesLoading] = useState(true);
  const [usersLoading, setUsersLoading]     = useState(true);

  const [deleteDebate, setDeleteDebate] = useState<DeleteDebateModal | null>(null);
  const [deleteUser,   setDeleteUser]   = useState<DeleteUserModal | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user?.is_admin) router.push("/");
  }, [isLoggedIn, user, router]);

  const fetchDebates = useCallback(async () => {
    setDebatesLoading(true);
    try {
      const [dr, sr] = await Promise.all([getAdminDebates(), getAdminStats()]);
      setDebates(dr.data);
      setStats(sr.data);
    } finally {
      setDebatesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await getAdminUsers();
      setUsers(res.data);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && user?.is_admin) {
      fetchDebates();
      fetchUsers();
    }
  }, [isLoggedIn, user, fetchDebates, fetchUsers]);

  const handleDeleteDebate = async () => {
    if (!deleteDebate) return;
    setDeleting(true);
    try {
      await deleteAdminDebate(deleteDebate.id);
      setDebates((prev) => prev.filter((d) => d.id !== deleteDebate.id));
      const sr = await getAdminStats();
      setStats(sr.data);
    } finally {
      setDeleting(false);
      setDeleteDebate(null);
    }
  };

  const handleToggleAdmin = async (id: string) => {
    try {
      const res = await toggleAdminUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    } catch {
      // 서버 에러 무시 (버튼 disabled로 방어됨)
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await deleteAdminUser(deleteUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      const sr = await getAdminStats();
      setStats(sr.data);
    } finally {
      setDeleting(false);
      setDeleteUser(null);
    }
  };

  if (!isLoggedIn || !user?.is_admin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-bold text-white mb-6">관리자 대시보드</h1>

      {stats && <StatsCards stats={stats} />}

      {/* 탭 */}
      <div className="flex gap-1 mb-4 border-b border-arena-border">
        {(["debates", "users"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === t
                ? "border-arena-accent text-arena-accent"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            {t === "debates" ? "토론 관리" : "회원 관리"}
          </button>
        ))}
      </div>

      {tab === "debates" ? (
        <DebatesTab debates={debates} loading={debatesLoading} onDelete={setDeleteDebate} />
      ) : (
        <UsersTab
          users={users}
          loading={usersLoading}
          currentUserId={user.id}
          onToggleAdmin={handleToggleAdmin}
          onDelete={setDeleteUser}
        />
      )}

      {/* 토론 삭제 모달 */}
      {deleteDebate && (
        <ConfirmModal
          title="토론 삭제"
          description="아래 토론을 삭제하시겠습니까?"
          highlight={`"${deleteDebate.topic}"`}
          deleting={deleting}
          onCancel={() => setDeleteDebate(null)}
          onConfirm={handleDeleteDebate}
        />
      )}

      {/* 회원 삭제 모달 */}
      {deleteUser && (
        <ConfirmModal
          title="회원 삭제"
          description="아래 회원을 삭제하시겠습니까? 토론 기록은 보존됩니다."
          highlight={`${deleteUser.name} (${deleteUser.email})`}
          deleting={deleting}
          onCancel={() => setDeleteUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}

// ── 공용 확인 모달 ────────────────────────────────────────────────────────────

function ConfirmModal({
  title, description, highlight, deleting, onCancel, onConfirm,
}: {
  title: string;
  description: string;
  highlight: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-arena-card rounded-2xl border border-arena-border p-6 w-full max-w-sm">
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-1">{description}</p>
        <p className="text-sm text-slate-200 font-medium mb-5 line-clamp-2">{highlight}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-arena-surface border border-arena-border transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
