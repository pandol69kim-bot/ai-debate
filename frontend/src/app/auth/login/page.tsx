"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, LogIn, Eye, EyeOff } from "lucide-react";
import { clsx } from "clsx";
import { login, getMe } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const loginRes = await login(email.trim(), password);
      const { access_token } = loginRes.data;

      // Store token so getMe interceptor can attach it
      localStorage.setItem("arena_token", access_token);

      const meRes = await getMe();
      const user = meRes.data;
      setAuth(access_token, { id: user.id, email: user.email, name: user.name, plan: user.plan });

      router.push("/");
    } catch (err: unknown) {
      localStorage.removeItem("arena_token");
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const data = (err.response as { data: { detail?: string } }).data;
        if (data?.detail === "Invalid credentials") {
          setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setError(data?.detail || "로그인에 실패했습니다.");
        }
      } else {
        setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-arena-accent mb-4 glow-accent">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AI Arena 로그인</h1>
          <p className="text-slate-400 mt-1.5 text-sm">토론을 시작하려면 로그인하세요</p>
        </div>

        {/* Form */}
        <div className="bg-arena-card rounded-2xl border border-arena-border p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-arena-surface rounded-xl border border-arena-border px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-arena-accent transition-colors text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  autoComplete="current-password"
                  className="w-full bg-arena-surface rounded-xl border border-arena-border px-4 py-2.5 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-arena-accent transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-800 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                "w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all mt-2",
                "bg-gradient-to-r from-arena-accent to-indigo-600 hover:from-indigo-600 hover:to-arena-accent",
                "glow-accent disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  로그인 중...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  로그인
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          아직 계정이 없으신가요?{" "}
          <Link href="/auth/register" className="text-arena-accent hover:underline font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
