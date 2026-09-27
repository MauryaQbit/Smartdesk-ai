import { forwardRef } from 'react';

export function Button({ variant="primary", size="md", className="", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60";
  const variants = {
    primary: "bg-[#b9f4d5] text-[#10201a] hover:bg-[#d4f9e4] shadow-lg shadow-emerald-950/30",
    secondary: "border border-white/10 bg-white/[0.07] text-white hover:border-emerald-200/25 hover:bg-white/[0.11] backdrop-blur",
    ghost: "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
    danger: "bg-[#ff8069] text-[#24120f] hover:bg-[#ff9a87] shadow-lg shadow-red-950/20",
  };
  const sizes = { sm: "h-9 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-5 text-[15px]" };
  return <button className={`${base} ${variants[variant]||variants.primary} ${sizes[size]} ${className}`} {...props} />;
}
export function Card({ className="", ...props }) {
  return <div className={`rounded-2xl border border-white/[0.11] bg-[#192522]/80 shadow-2xl shadow-black/20 backdrop-blur-xl ${className}`} {...props} />;
}
export function CardHeader({ className="", ...props }) {
  return <div className={`border-b border-white/[0.08] p-6 ${className}`} {...props} />;
}
export function CardContent({ className="", ...props }) {
  return <div className={`p-6 ${className}`} {...props} />;
}
export function Badge({ tone="zinc", className="", ...props }) {
  const tones = {
    zinc: "bg-white/5 text-zinc-400 border border-white/10",
    blue: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
    red: "bg-red-500/10 text-red-300 border border-red-500/20",
    violet: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`} {...props} />;
}
export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`h-10 w-full rounded-xl border border-white/[0.12] bg-[#101917]/70 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-300/50 focus:bg-[#101917] focus:ring-2 focus:ring-emerald-300/10 ${className}`} {...props} />;
});
export function Textarea(props) {
  return <textarea className="min-h-[96px] w-full rounded-xl border border-white/[0.12] bg-[#101917]/70 p-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-300/50 focus:bg-[#101917] focus:ring-2 focus:ring-emerald-300/10" {...props} />;
}
export function Select(props) {
  return <select className="h-10 rounded-xl border border-white/[0.12] bg-[#101917] px-3 text-sm text-white outline-none focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10" {...props} />;
}
export function Skeleton({ className="" }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.07] ${className}`} />;
}
export function Toast({ message }) {
  if (!message) return null;
  return <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-200/20 bg-[#d4f9e4] px-4 py-3 text-sm font-medium text-[#10201a] shadow-2xl shadow-black/40">{message}</div>;
}
export function Stat({ label, value, sub }) {
  return <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur"><div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</div><div className="mt-1 text-2xl font-semibold text-white">{value}</div>{sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}</div>;
}
