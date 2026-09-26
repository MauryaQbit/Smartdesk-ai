import { Link } from 'react-router-dom';
import { ArrowRight, Bot, CheckCircle2, Clock3, MessageSquareText, ShieldCheck, Ticket } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';

const workflows = [
    {
        icon: Ticket,
        title: 'Capture every request',
        description: 'Give customers one clear place to report an issue and keep the full context attached.',
    },
    {
        icon: Bot,
        title: 'Triage with AI',
        description: 'Prioritize tickets automatically and surface useful answers from your knowledge base.',
    },
    {
        icon: MessageSquareText,
        title: 'Resolve together',
        description: 'Keep customers and agents in sync with live updates, ownership, and ticket history.',
    },
];

export default function Landing() {
    return (
        <main className="relative overflow-hidden">
            <section className="relative grid gap-12 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
                <div className="relative z-10 max-w-2xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Support operations, made clear
                    </div>
                    <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                        Help customers get unstuck, faster.
                    </h1>
                    <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 md:text-lg">
                        SmartDesk AI brings tickets, knowledge, and real-time collaboration into one calm workspace for modern support teams.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link to="/register">
                            <Button size="lg" className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300 sm:w-auto">
                                Create your workspace <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto">Sign in to SmartDesk</Button>
                        </Link>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-500">
                        <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> Role-based access</span>
                        <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> AI-assisted triage</span>
                        <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> Live ticket updates</span>
                    </div>
                </div>

                <Card className="relative overflow-hidden border-emerald-400/20 bg-zinc-900/80 shadow-2xl shadow-emerald-950/30">
                    <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400" />
                    <CardContent className="p-6 md:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Workspace overview</p>
                                <h2 className="mt-2 text-xl font-semibold text-white">Your support desk</h2>
                            </div>
                            <ShieldCheck className="text-emerald-400" size={22} />
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-xs text-zinc-500">Open tickets</p>
                                <p className="mt-2 text-3xl font-semibold text-white">24</p>
                                <p className="mt-1 text-xs text-emerald-300">8 need attention</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-xs text-zinc-500">AI resolved</p>
                                <p className="mt-2 text-3xl font-semibold text-white">68%</p>
                                <p className="mt-1 text-xs text-zinc-500">this month</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <span className="flex items-center gap-3 text-sm text-zinc-300"><span className="h-2 w-2 rounded-full bg-amber-400" /> Login issue reported</span>
                                <span className="text-xs text-zinc-500">2m ago</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <span className="flex items-center gap-3 text-sm text-zinc-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Billing question resolved</span>
                                <span className="text-xs text-zinc-500">14m ago</span>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-zinc-500">
                            <Clock3 size={14} className="text-emerald-400" /> Average first response: 12 minutes
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="border-t border-white/10 py-14 md:py-20">
                <div className="max-w-2xl">
                    <p className="text-sm font-medium text-emerald-300">A better support rhythm</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Everything your team needs to close the loop.</h2>
                    <p className="mt-4 text-zinc-400">Less tab switching, fewer missed handoffs, and a clearer experience for everyone involved.</p>
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {workflows.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Icon size={19} /></div>
                            <h3 className="mt-5 font-semibold text-white">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
