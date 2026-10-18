import { useState } from 'react';
import { Bug, CreditCard, Lightbulb, Plus } from 'lucide-react';
import { Button, Input, Select, Textarea } from './ui';
import { TICKET_CATEGORIES, TICKET_LIMITS, TICKET_TEMPLATES } from '../lib/ticketOptions';

const templateButtons = [
  { key: 'bug', label: 'Bug report', icon: Bug },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'feature', label: 'Feature request', icon: Lightbulb },
];

export default function TicketForm({ onSubmit, submitting = false, compact = false }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'general' });
  const [errors, setErrors] = useState({});

  const applyTemplate = (key) => {
    setForm(TICKET_TEMPLATES[key]);
    setErrors({});
  };

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Add a short subject.';
    if (form.title.trim().length > TICKET_LIMITS.title) nextErrors.title = `Keep the subject under ${TICKET_LIMITS.title} characters.`;
    if (!form.description.trim()) nextErrors.description = 'Describe what happened so the team can help.';
    if (form.description.trim().length > TICKET_LIMITS.description) nextErrors.description = `Keep the description under ${TICKET_LIMITS.description} characters.`;
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    await onSubmit(form, () => {
      setForm({ title: '', description: '', category: 'general' });
      setErrors({});
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div>
        <label htmlFor="ticket-title" className="mb-2 block text-sm font-medium text-zinc-300">Subject</label>
        <Input id="ticket-title" aria-invalid={Boolean(errors.title)} maxLength={TICKET_LIMITS.title} placeholder="What do you need help with?" value={form.title} onChange={(event) => update('title', event.target.value)} />
        <div className={`mt-1 flex justify-between text-xs ${errors.title ? 'text-red-300' : 'text-zinc-600'}`}><span>{errors.title || 'A clear subject helps us route your request.'}</span><span>{form.title.length}/{TICKET_LIMITS.title}</span></div>
      </div>
      <div>
        <label htmlFor="ticket-description" className="mb-2 block text-sm font-medium text-zinc-300">Description</label>
        <Textarea id="ticket-description" aria-invalid={Boolean(errors.description)} maxLength={TICKET_LIMITS.description} placeholder="Describe what happened, what you expected, and any steps you tried…" value={form.description} onChange={(event) => update('description', event.target.value)} />
        <div className={`mt-1 flex justify-between text-xs ${errors.description ? 'text-red-300' : 'text-zinc-600'}`}><span>{errors.description || 'Include useful context, error messages, and steps to reproduce.'}</span><span>{form.description.length}/{TICKET_LIMITS.description}</span></div>
      </div>
      <div>
        <label htmlFor="ticket-category" className="mb-2 block text-sm font-medium text-zinc-300">Category</label>
        <Select id="ticket-category" aria-label="Ticket category" className="w-full" value={form.category} onChange={(event) => update('category', event.target.value)}>
          {TICKET_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
        </Select>
      </div>
      {!compact && <div><p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-600">Start with a template</p><div className="flex flex-wrap gap-2">{templateButtons.map(({ key, label, icon: Icon }) => <button type="button" key={key} onClick={() => applyTemplate(key)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-2 text-xs text-zinc-400 transition hover:border-emerald-300/30 hover:text-emerald-200"><Icon size={13} /> {label}</button>)}</div></div>}
      <Button className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" disabled={submitting}><Plus size={14} className="mr-1.5" />{submitting ? 'Creating ticket…' : 'Create ticket'}</Button>
    </form>
  );
}
