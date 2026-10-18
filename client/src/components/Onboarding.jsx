import { useState } from 'react';
import { ArrowRight, BookOpen, ClipboardCheck, Sparkles, Ticket, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from './ui';

const steps = {
  customer: [
    { label: 'Create your first support ticket', to: '/dashboard#create-ticket', icon: Ticket },
    { label: 'Track replies and status changes', to: '/tickets', icon: ClipboardCheck },
    { label: 'Ask SmartDesk about a ticket', to: '/ai-assistant', icon: Sparkles },
  ],
  agent: [
    { label: 'Review the ticket queue', to: '/tickets', icon: Ticket },
    { label: 'Upload a team guide', to: '/knowledge-base', icon: BookOpen },
    { label: 'Try the AI assistant', to: '/ai-assistant', icon: Sparkles },
  ],
  admin: [
    { label: 'Review workspace tickets', to: '/tickets', icon: Ticket },
    { label: 'Add a knowledge-base guide', to: '/knowledge-base', icon: BookOpen },
    { label: 'Manage team access', to: '/users', icon: Users },
  ],
};

export default function Onboarding({ role, userId }) {
  const storageKey = `smartdesk-onboarding-dismissed-${userId}`;
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(storageKey) !== 'true'; } catch { return true; }
  });
  if (!visible) return null;
  const roleSteps = steps[role] || steps.customer;
  const dismiss = () => {
    try { localStorage.setItem(storageKey, 'true'); } catch { /* storage may be unavailable */ }
    setVisible(false);
  };
  return (
    <Card className="border-indigo-400/20 bg-indigo-400/[0.04]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-indigo-300"><Sparkles size={13} /> Getting started</p><h2 className="mt-2 text-lg font-semibold text-white">A quick path to your first win</h2><p className="mt-1 text-sm text-zinc-400">Complete these steps to get the most from your {role} workspace.</p></div>
          <Button type="button" variant="ghost" size="sm" onClick={dismiss} aria-label="Dismiss getting started guide">Dismiss</Button>
        </div>
        <div className="mt-5 grid gap-2 md:grid-cols-3">{roleSteps.map(({ label, to, icon: Icon }, index) => <Link key={label} to={to} className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-3 transition hover:border-indigo-300/30 hover:bg-white/[0.04]"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-400/10 text-indigo-300"><Icon size={15} /></span><span className="min-w-0 flex-1 text-sm text-zinc-300"><span className="mr-2 text-xs text-zinc-600">0{index + 1}</span>{label}</span><ArrowRight size={14} className="text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-indigo-300" /></Link>)}</div>
      </CardContent>
    </Card>
  );
}
