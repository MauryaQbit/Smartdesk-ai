export function Button({ variant="primary", size="md", className="", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20";
  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10",
    secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/15 backdrop-blur",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
  };
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-9 px-4 text-sm", lg: "h-11 px-5 text-[15px]" };
  return <button className={`${base} ${variants[variant]||variants.primary} ${sizes[size]} ${className}`} {...props} />;
}
export function Card({ className="", ...props }) {
  return <div className={`bg-zinc-900/50 border border-white/10 rounded-3xl backdrop-blur shadow-2xl shadow-black/20 ${className}`} {...props} />;
}
export function CardHeader({ className="", ...props }) {
  return <div className={`p-6 border-b border-white/5 ${className}`} {...props} />;
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
export function Input(props) {
  return <input className="w-full h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 placeholder:text-zinc-500" {...props} />;
}
export function Textarea(props) {
  return <textarea className="w-full min-h-[96px] rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-zinc-500" {...props} />;
}
export function Select(props) {
  return <select className="h-10 rounded-xl border border-white/10 bg-zinc-900 text-white px-3 text-sm focus:ring-2 focus:ring-indigo-500/30" {...props} />;
}
export function Skeleton({ className="" }) {
  return <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />;
}
export function Toast({ message }) {
  if (!message) return null;
  return <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-sm shadow-xl z-50 font-medium">{message}</div>;
}
export function Stat({ label, value, sub }) {
  return <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-4 backdrop-blur"><div className="text-xs text-zinc-500 tracking-widest uppercase">{label}</div><div className="text-2xl font-black text-white mt-1">{value}</div>{sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}</div>;
}
