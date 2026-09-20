export function Button({ variant="primary", size="md", className="", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10";
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-black shadow-sm",
    secondary: "bg-white border border-zinc-200 hover:bg-zinc-50 shadow-sm",
    ghost: "hover:bg-zinc-100",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  };
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-9 px-4 text-sm", lg: "h-11 px-5 text-[15px]" };
  return <button className={`${base} ${variants[variant]||variants.primary} ${sizes[size]} ${className}`} {...props} />;
}
export function Card({ className="", ...props }) {
  return <div className={`bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${className}`} {...props} />;
}
export function CardHeader({ className="", ...props }) {
  return <div className={`p-5 border-b border-zinc-100 ${className}`} {...props} />;
}
export function CardContent({ className="", ...props }) {
  return <div className={`p-5 ${className}`} {...props} />;
}
export function Badge({ tone="zinc", className="", ...props }) {
  const tones = {
    zinc: "bg-zinc-100 text-zinc-700",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    violet: "bg-violet-50 text-violet-700 border border-violet-200",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`} {...props} />;
}
export function Input(props) {
  return <input className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 placeholder:text-zinc-400" {...props} />;
}
export function Textarea(props) {
  return <textarea className="w-full min-h-[96px] rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 placeholder:text-zinc-400" {...props} />;
}
export function Select(props) {
  return <select className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:ring-2 focus:ring-zinc-900/10" {...props} />;
}
export function Skeleton({ className="" }) {
  return <div className={`animate-pulse bg-zinc-100 rounded-xl ${className}`} />;
}
export function Toast({ message }) {
  if (!message) return null;
  return <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2 rounded-full text-sm shadow-xl z-50">{message}</div>;
}
export function Stat({ label, value, sub }) {
  return <div className="rounded-2xl border bg-white p-4"><div className="text-xs text-zinc-500">{label}</div><div className="text-2xl font-semibold mt-1">{value}</div>{sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}</div>;
}
