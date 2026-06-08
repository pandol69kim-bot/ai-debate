"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Swords, Trophy, Zap, LogIn, UserPlus, LogOut, User, MessageSquare } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/lib/store/authStore";

const navLinks = [
  { href: "/", label: "Arena", icon: Swords },
  { href: "/debates", label: "토론 기록", icon: MessageSquare },
  { href: "/rankings", label: "Rankings", icon: Trophy },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-arena-border bg-arena-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-arena-accent flex items-center justify-center glow-accent">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            AI <span className="text-arena-accent">Arena</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Nav links */}
          <nav className="flex items-center gap-1 mr-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-arena-accent/20 text-arena-accent"
                    : "text-slate-400 hover:text-slate-200 hover:bg-arena-card"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth section */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-arena-card border border-arena-border">
                <div className="w-5 h-5 rounded-full bg-arena-accent/20 flex items-center justify-center">
                  <User className="w-3 h-3 text-arena-accent" />
                </div>
                <span className="text-sm text-slate-300 max-w-[120px] truncate">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-arena-card transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                href="/auth/login"
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/auth/login"
                    ? "bg-arena-accent/20 text-arena-accent"
                    : "text-slate-400 hover:text-slate-200 hover:bg-arena-card"
                )}
              >
                <LogIn className="w-4 h-4" />
                로그인
              </Link>
              <Link
                href="/auth/register"
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                  pathname === "/auth/register"
                    ? "bg-arena-accent text-white"
                    : "bg-arena-accent/10 text-arena-accent hover:bg-arena-accent hover:text-white border border-arena-accent/30"
                )}
              >
                <UserPlus className="w-4 h-4" />
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
