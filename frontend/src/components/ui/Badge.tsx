import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

const variants = {
  default: "bg-arena-border text-slate-300",
  success: "bg-green-900/40 text-green-400 border border-green-800",
  warning: "bg-amber-900/40 text-amber-400 border border-amber-800",
  error: "bg-red-900/40 text-red-400 border border-red-800",
  info: "bg-indigo-900/40 text-indigo-400 border border-indigo-800",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
