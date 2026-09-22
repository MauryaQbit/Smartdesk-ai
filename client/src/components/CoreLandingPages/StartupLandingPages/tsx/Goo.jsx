import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import {
    ArrowRight,
    Layers,
    Zap,
    Shield,
    BarChart3,
    Globe,
    Code2,
    CheckCircle2,
    Play,
    Cpu,
    Plus,
    Star,
    Send
} from "lucide-react";
import { cn } from "../../../../lib/utils";

export function BackgroundGradient() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse delay-1000" />
            <div className="absolute top-[20%] left-[30%] w-[20%] h-[20%] rounded-full bg-violet-500/10 blur-[100px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>
    );
}

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                    N
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Nexus</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                <a href="#" className="hover:text-white transition-colors">Product</a>
                <a href="#" className="hover:text-white transition-colors">Solutions</a>
                <a href="#" className="hover:text-white transition-colors">Pricing</a>
                <a href="#" className="hover:text-white transition-colors">Docs</a>
            </div>
            <div className="flex items-center gap-4">
                <button className="text-sm font-medium text-white hover:text-zinc-300 transition-colors">
                    Login
                </button>
                <button className="group relative px-4 py-2 text-sm font-semibold text-white bg-white/10 rounded-full overflow-hidden hover:bg-white/20 transition-all border border-white/5">
                    <span className="relative z-10 flex items-center gap-2">
                        Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
            </div>
        </nav>
    );
}

export function HeroSection() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
    const x = useMotionValue(0);
    const yMove = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(yMove, { stiffness: 500, damping: 100 });
    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPct = (clientX - left) / width - 0.5;
        const yPct = (clientY - top) / height - 0.5;
        x.set(xPct);
        yMove.set(yPct);
    }
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);
    return (
        <section ref={ref} className="relative min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center overflow-hidden">
            <motion.div style={{ opacity, y }} className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-4">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    v2.0 is now live
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl md:text-7xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
                    Orchestrate your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        digital ecosystem
                    </span>
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
                    The agency-grade dashboard for modern engineering teams.
                    Manage deployments, monitor analytics, and collaborate in 3D space.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                        Start Building Free <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                        <Play className="w-4 h-4 fill-white" /> Watch Demo
                    </button>
                </motion.div>
            </motion.div>
            <motion.div style={{ scale }} className="mt-20 w-full max-w-6xl perspective-1000" onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); yMove.set(0); }}>
                <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative rounded-xl border border-white/10 bg-zinc-950/50 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm aspect-[16/9] group">
                    <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        </div>
                        <div className="mx-auto text-xs text-zinc-500 font-mono">dashboard.nexus.app</div>
                    </div>
                    <div className="p-6 pt-16 h-full w-full grid grid-cols-12 gap-4">
                        <div className="col-span-2 hidden md:block rounded-lg border border-white/5 bg-white/5"></div>
                        <div className="col-span-12 md:col-span-7 rounded-lg border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                            <div className="h-full flex items-end gap-2">
                                {[40, 70, 50, 90, 60, 80, 50, 75].map((h, i) => (
                                    <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="flex-1 bg-indigo-500/50 rounded-t-sm hover:bg-indigo-400 transition-colors" />
                                ))}
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-3 flex flex-col gap-4">
                            <div className="flex-1 rounded-lg border border-white/5 bg-zinc-900/50 p-4">
                                <div className="text-sm text-zinc-400">Total Revenue</div>
                                <div className="text-2xl font-mono text-white mt-1">$124,500</div>
                            </div>
                            <div className="flex-1 rounded-lg border border-white/5 bg-zinc-900/50 p-4">
                                <div className="text-sm text-zinc-400">Active Users</div>
                                <div className="text-2xl font-mono text-white mt-1">+2,400</div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-xl" />
                </motion.div>
            </motion.div>
        </section>
    );
}

export function LogosSection() {
    const logos = ["Acme Corp", "Quantum", "Echo", "Nebula", "Vertex", "Horizon"];
    return (
        <section className="py-12 border-y border-white/5 bg-zinc-950/30">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-sm font-medium text-zinc-500 mb-8">TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {logos.map((logo, i) => (
                        <div key={i} className="text-xl font-bold text-white flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-zinc-800" /> {logo}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FeatureCard({ title, desc, icon: Icon, className, children }) {
    return (
        <motion.div whileHover={{ y: -5 }} className={cn("relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 hover:bg-zinc-900/80 transition-colors group", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <Icon className="w-24 h-24 text-white -rotate-12 translate-x-8 -translate-y-8" />
            </div>
            <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/5">
                    <Icon className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">{desc}</p>
                <div className="mt-auto">{children}</div>
            </div>
            <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.15), transparent 40%)" }} />
        </motion.div>
    );
}

export function BentoGrid() {
    return (
        <section className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Everything you need <br /> <span className="text-zinc-500">to scale your product.</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                    <FeatureCard title="Real-time Analytics" desc="Watch your data flow in real-time with our low-latency edge network processing." icon={BarChart3} className="md:row-span-2 bg-gradient-to-b from-zinc-900/50 to-zinc-950">
                        <div className="relative h-40 w-full mt-4 bg-zinc-950 rounded-lg border border-white/5 overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 h-full flex items-end gap-1 px-2 pb-2">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div key={i} className="flex-1 bg-indigo-500" initial={{ height: "10%" }} animate={{ height: `${Math.random() * 80 + 10}%` }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", delay: i * 0.1 }} />
                                ))}
                            </div>
                        </div>
                    </FeatureCard>
                    <FeatureCard title="Global Infrastructure" desc="Deploy to 35+ regions with a single click. Our smart routing engine handles the rest." icon={Globe} className="md:col-span-2">
                        <div className="flex gap-4 mt-4">
                            <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs">US-East</div>
                            <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs">EU-West</div>
                            <div className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs">Asia-Pacific</div>
                        </div>
                    </FeatureCard>
                    <FeatureCard title="AI-Powered" desc="Predictive scaling based on historical usage patterns." icon={Cpu}>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" animate={{ width: ["0%", "100%"] }} transition={{ duration: 3, repeat: Infinity }} />
                        </div>
                    </FeatureCard>
                    <FeatureCard title="Enterprise Security" desc="SOC2 Type II compliant with banking-grade encryption." icon={Shield}>
                        <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
                            <CheckCircle2 className="w-4 h-4" /> 256-bit Encryption
                        </div>
                    </FeatureCard>
                </div>
            </div>
        </section>
    );
}

export function WorkflowSection() {
    const steps = [
        { title: "Connect", desc: "Link your GitHub or GitLab repository.", icon: Code2 },
        { title: "Build", desc: "Our CI/CD pipeline runs tests and builds assets.", icon: Layers },
        { title: "Deploy", desc: "Instant global propagation via Edge network.", icon: Zap },
    ];
    return (
        <section className="py-32 bg-zinc-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-900/5" />
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-20">From Code to Cloud in Seconds</h2>
                <div className="relative">
                    <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent hidden md:block" />
                    <div className="space-y-24">
                        {steps.map((step, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5, delay: i * 0.2 }} className={cn("flex flex-col md:flex-row items-center gap-12", i % 2 === 1 ? "md:flex-row-reverse" : "")}>
                                <div className="flex-1 text-center md:text-right">
                                    <div className={cn("space-y-4", i % 2 === 1 ? "md:text-left" : "md:text-right")}>
                                        <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 text-indigo-400 shadow-xl shadow-indigo-500/10", "md:hidden")}>
                                            <step.icon />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                                        <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                                <div className="relative z-10 hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-zinc-950 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                    <step.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="bg-zinc-900/80 border border-white/5 rounded-lg p-4 font-mono text-xs text-zinc-400 shadow-2xl">
                                        <div className="flex gap-1.5 mb-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                        </div>
                                        <div className="space-y-1">
                                            <p><span className="text-purple-400">$</span> nexus {step.title.toLowerCase()} --init</p>
                                            <p className="text-zinc-500">Processing...</p>
                                            <p className="text-green-400">✓ Success</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function StatsSection() {
    const stats = [
        { val: "99.99", label: "UPTIME PLEDGE", sub: "SOLID GOLD" },
        { val: "10M+", label: "REQUESTS / HR", sub: "FIREHOSE" },
        { val: "250ms", label: "GLOBAL PING", sub: "LIGHTSPEED" },
    ];
    return (
        <section className="py-40 px-6 container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20 text-center">
                {stats.map((s, i) => (
                    <div key={i} className="group flex flex-col items-center">
                        <div className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter relative">
                            {s.val}
                            <div className="absolute -inset-4 bg-indigo-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                        </div>
                        <div className="font-black text-indigo-400 text-sm tracking-widest uppercase mb-2">{s.label}</div>
                        <div className="font-mono text-[10px] text-zinc-600 tracking-[0.3em] uppercase">{s.sub}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function IntegrationsSection() {
    const apps = [
        { name: "Slack", icon: "S", color: "bg-purple-600" },
        { name: "Gitlab", icon: "G", color: "bg-orange-500" },
        { name: "Figma", icon: "F", color: "bg-pink-500" },
        { name: "Docker", icon: "D", color: "bg-blue-400" },
        { name: "Redis", icon: "R", color: "bg-red-600" },
        { name: "Vercel", icon: "V", color: "bg-zinc-100 text-black" },
    ];
    return (
        <section className="py-32 bg-zinc-950 border-y border-white/5 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-16 tracking-tighter">INTEGRATE EVERYTHING_</h2>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-8">
                    {apps.map((app, i) => (
                        <motion.div key={i} whileHover={{ y: -10, scale: 1.05 }} className="p-8 rounded-[32px] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-colors shadow-2xl hover:shadow-indigo-500/10 group">
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl group-hover:rotate-12 transition-transform", app.color)}>
                                {app.icon}
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{app.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function PricingSection() {
    const plans = [
        { name: "Starter", price: "$0", desc: "Perfect for side projects.", features: ["3 Projects", "Basic Analytics", "1GB Storage"] },
        { name: "Pro", price: "$49", desc: "For professional engineers.", features: ["Unlimited Projects", "Premium Support", "100GB Storage", "Custom Domains"], popular: true },
        { name: "Team", price: "$149", desc: "Full power for your agency.", features: ["RBAC & Teams", "Dedicated Node", "1TB Storage", "SSO & Security"] },
    ];
    return (
        <section className="py-32 px-6 bg-zinc-950/50 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[160px] pointer-events-none" />
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Simple <span className="text-indigo-400">Scalable</span> Pricing_</h2>
                    <p className="text-zinc-400 text-lg">No credit card required to start.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((p, i) => (
                        <div key={i} className={cn("relative p-8 rounded-[32px] border transition-all duration-500 group overflow-hidden", p.popular ? "bg-white/5 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.1)] scale-105 z-10" : "bg-zinc-900/30 border-white/5 hover:border-white/20")}>
                            {p.popular && <div className="absolute top-0 right-0 bg-indigo-500 text-white font-black text-[10px] px-6 py-1 rotate-45 translate-x-12 translate-y-4 uppercase tracking-widest shadow-xl">Best Value</div>}
                            <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                            <p className="text-zinc-500 text-sm mb-8">{p.desc}</p>
                            <div className="text-5xl font-black text-white mb-10 tracking-tighter">
                                {p.price}<span className="text-lg text-zinc-600 font-medium">/mo</span>
                            </div>
                            <ul className="space-y-4 mb-12">
                                {p.features.map(f => (
                                    <li key={f} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-400" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button className={cn("w-full py-4 rounded-xl font-bold transition-all", p.popular ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400" : "bg-white/10 text-white border border-white/10 hover:bg-white/20")}>
                                Start with {p.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function TestimonialSection() {
    const reviews = [
        { name: "Alex Rivers", role: "CTO @ Vertex", text: "Nexus redefined our cloud strategy. The 3D visualization is a game changer for system architecture.", img: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex" },
        { name: "Jordan Knox", role: "DevOps Lead", text: "Finally, a dashboard that doesn't feel like it's from 2010. Pure speed and beautiful UI.", img: "https://api.dicebear.com/7.x/notionists/svg?seed=Jordan" },
        { name: "Sam Vance", role: "Founder @ Echo", text: "Scale happened overnight. Nexus handled the load without us writing a single config line.", img: "https://api.dicebear.com/7.x/notionists/svg?seed=Sam" },
    ];
    return (
        <section className="py-32 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
                <div className="flex-1">
                    <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black text-indigo-400 uppercase tracking-widest mb-8">Testimonials</div>
                    <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8">People <br /> Love <span className="text-zinc-600">The Goo_</span></h2>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">Join the 1%ers building the future of decentralized infrastructure.</p>
                </div>
                <div className="flex-1 grid grid-cols-1 gap-6">
                    {reviews.map((r, i) => (
                        <motion.div key={i} whileHover={{ scale: 1.02 }} className="p-8 rounded-[32px] bg-zinc-900/50 border border-white/5 flex gap-6 items-start hover:bg-zinc-900/80 transition-colors">
                            <div className="w-20 h-20 shrink-0 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 overflow-hidden shadow-2xl">
                                <img src={r.img} alt={r.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-4">
                                <p className="text-zinc-300 font-medium italic leading-relaxed">"{r.text}"</p>
                                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                    <div className="font-bold text-white text-sm">{r.name} / <span className="text-indigo-400 opacity-60 uppercase tracking-widest text-[10px]">{r.role}</span></div>
                                    <div className="flex text-indigo-400">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" className={i < 5 ? "text-indigo-400" : "text-zinc-800"} />)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FAQSection() {
    const [open, setOpen] = React.useState(0);
    const faqs = [
        { q: "Is it really cloud-agnostic?", a: "Yes. Nexus runs on top of AWS, GCP, Azure, or even your private cloud setup with minimal configuration." },
        { q: "What about data security?", a: "We use AES-256 at rest and TLS 1.3 in transit. We are SOC2 Type II and HIPAA compliant." },
        { q: "Can I self-host the dashboard?", a: "The Team plan includes a Docker-based self-hosting option for air-gapped environments." },
        { q: "Do you offer migration help?", a: "Our white-glove migration service is included free with the Enterprise plan." }
    ];
    return (
        <section className="py-32 px-6 max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-center text-white mb-20 tracking-tighter">COMMON CURIOSITIES_</h2>
            <div className="space-y-4">
                {faqs.map((f, i) => (
                    <div key={i} onClick={() => setOpen(open === i ? -1 : i)} className="rounded-[24px] bg-zinc-900/30 border border-white/5 overflow-hidden transition-all cursor-pointer hover:border-white/20">
                        <div className={cn("p-8 flex justify-between items-center transition-colors", open === i ? "bg-white/5" : "")}>
                            <h3 className="text-lg font-bold text-zinc-100">{f.q}</h3>
                            <button className={cn("w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-500", open === i ? "rotate-45 text-white" : "text-zinc-500")}>
                                <Plus size={20} />
                            </button>
                        </div>
                        {open === i && (
                            <div className="p-10 text-zinc-400 text-lg font-medium leading-relaxed bg-black/20 animate-in slide-in-from-top-2">
                                {f.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export function GooTeam() {
    const team = [
        { name: "S. Orion", role: "UI / UX Lead", img: "https://api.dicebear.com/7.x/notionists/svg?seed=Orion" },
        { name: "L. Vega", role: "Backend Architect", img: "https://api.dicebear.com/7.x/notionists/svg?seed=Vega" },
        { name: "D. Nova", role: "Growth Hacker", img: "https://api.dicebear.com/7.x/notionists/svg?seed=Nova" },
    ];
    return (
        <section className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">THE <span className="text-indigo-400">PIONEERS_</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {team.map((t, i) => (
                        <motion.div key={i} whileHover={{ y: -10 }} className="p-8 rounded-[40px] bg-zinc-900/40 border border-white/5 backdrop-blur-3xl group">
                            <div className="w-24 h-24 rounded-3xl bg-indigo-500/20 mb-8 overflow-hidden border border-indigo-500/30">
                                <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t.name}</h3>
                            <p className="text-indigo-400 text-sm font-black uppercase tracking-widest">{t.role}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function GooNewsletter() {
    return (
        <section className="py-40 px-6">
            <div className="max-w-5xl mx-auto p-1 border border-white/5 rounded-[48px] bg-white/5 backdrop-blur-sm">
                <div className="p-12 md:p-24 rounded-[40px] bg-zinc-950/80 text-center flex flex-col items-center">
                    <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">Stay In <span className="text-indigo-400">The Loop_</span></h2>
                    <p className="text-zinc-400 text-lg mb-12 max-w-xl">Get the latest technical updates and product deep-dives delivered to your inbox.</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
                        <input type="email" placeholder="ENTER YOUR EMAIL" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                        <button className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors">Subscribe</button>
                    </div>
                    <div className="flex gap-8 mt-16 text-zinc-500">
                        <a href="#" className="hover:text-indigo-400"><Send size={24} /></a>
                        <a href="#" className="hover:text-indigo-400"><Code2 size={24} /></a>
                        <a href="#" className="hover:text-indigo-400"><Globe size={24} /></a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CallToAction() {
    return (
        <section className="py-32 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-1 rounded-3xl bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500">
                    <div className="bg-zinc-950 rounded-[22px] py-20 px-8">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to ship?</h2>
                        <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">
                            Join 10,000+ engineers building the future of the web with Nexus.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">
                                Start for free
                            </button>
                            <button className="px-8 py-4 text-white font-medium hover:text-indigo-300 transition-colors">
                                Talk to sales
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
            <div className="max-w-7xl mx-auto mt-32 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-zinc-500">
                <div>© 2024 Nexus Inc. All rights reserved.</div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white">Privacy</a>
                    <a href="#" className="hover:text-white">Terms</a>
                    <a href="#" className="hover:text-white">Twitter</a>
                </div>
            </div>
        </section>
    );
}
