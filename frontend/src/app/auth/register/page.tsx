"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, UserPlus, Eye, EyeOff } from "lucide-react";
import { clsx } from "clsx";
import { register } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";
import { login } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({ email: "", name: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    if (!form.email.trim()) return "이메일을 입력해주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "올바른 이메일 형식이 아닙니다.";
    if (!form.name.trim()) return "이름을 입력해주세요.";
    if (form.name.trim().length < 2) return "이름은 2자 이상이어야 합니다.";
    if (!form.password) return "비밀번호를 입력해주세요.";
    if (form.password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
    if (form.password !== form.confirm) return "비밀번호가 일치하지 않습니다.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsLoading(true);
    setError("");

    try {
      const registerRes = await register(form.email, form.name.trim(), form.password);
      const user = registerRes.data;

      // Auto-login after successful registration
      const loginRes = await login(form.email, form.password);
      setAuth(loginRes.data.access_token, {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        is_admin: false,
      });

      router.push("/");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const data = (err.response as { data: { detail?: string } }).data;
        if (data?.detail === "Email already registered") {
          setError("이미 사용 중인 이메일입니다.");
        } else {
          setError(data?.detail || "회원가입에 실패했습니다.");
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
          <h1 className="text-2xl font-bold text-white">AI Arena 가입</h1>
          <p className="text-slate-400 mt-1.5 text-sm">AI 토론 플랫폼에 참여하세요</p>
        </div>

        {/* Form */}
        <div className="bg-arena-card rounded-2xl border border-arena-border p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                autoComplete="email"
                className={clsx(
                  "w-full bg-arena-surface rounded-xl border px-4 py-2.5 text-white placeholder-slate-600",
                  "focus:outline-none focus:border-arena-accent transition-colors text-sm",
                  error && !form.email ? "border-red-700" : "border-arena-border"
                )}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="홍길동"
                autoComplete="name"
                className="w-full bg-arena-surface rounded-xl border border-arena-border px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-arena-accent transition-colors text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="8자 이상"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">비밀번호 확인</label>
              <input
                type={showPw ? "text" : "password"}
                value={form.confirm}
                onChange={update("confirm")}
                placeholder="비밀번호 재입력"
                autoComplete="new-password"
                className={clsx(
                  "w-full bg-arena-surface rounded-xl border px-4 py-2.5 text-white placeholder-slate-600",
                  "focus:outline-none focus:border-arena-accent transition-colors text-sm",
                  form.confirm && form.password !== form.confirm ? "border-red-700" : "border-arena-border"
                )}
              />
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-red-400 mt-1">비밀번호가 일치하지 않습니다.</p>
              )}
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
                  가입 중...
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  회원가입
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-arena-accent hover:underline font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
