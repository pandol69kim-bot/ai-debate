"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Trophy, Zap } from "lucide-react";
import { clsx } from "clsx";

const links = [
  { href: "/", label: "Arena", icon: Swords },
  { href: "/rankings", label: "Rankings", icon: Trophy },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-arena-border bg-arena-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-arena-accent flex items-center justify-center glow-accent">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            AI <span className="text-arena-accent">Arena</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
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
      </div>
    </header>
  );
}
