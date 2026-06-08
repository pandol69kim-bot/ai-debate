import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";

export const metadata: Metadata = {
  title: "AI Arena - AI 멀티 모델 경쟁·토론 플랫폼",
  description: "GPT, Claude, Gemini가 동시에 토론하고 경쟁합니다",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-arena-bg text-slate-200">
        <NavBar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
