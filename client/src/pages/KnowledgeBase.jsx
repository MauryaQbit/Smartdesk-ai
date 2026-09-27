import { useEffect, useState } from 'react';
import { FileText, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, CardContent, CardHeader, Input, Skeleton, Toast } from '../components/ui';

export default function KnowledgeBase() {
  const { user, uploadKB, getKB } = useAuth();
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [inputKey, setInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try { const data = await getKB(); setDocs(Array.isArray(data.data) ? data.data : []); } catch { setToast('We could not load the knowledge base.'); }
    setLoading(false);
  };
  useEffect(() => { if (['admin', 'agent'].includes(user?.role)) load(); else setLoading(false); }, [user]);

  const upload = async (event) => {
    event.preventDefault();
    if (!file) return setToast('Choose a document first.');
    setUploading(true);
    const formData = new FormData(); formData.append('file', file); formData.append('title', title || file.name);
    try { const result = await uploadKB(formData); setToast(`Uploaded ${result.title} (${result.chunkCount} chunks)`); setTitle(''); setFile(null); setInputKey((key) => key + 1); load(); } catch (error) { setToast(error.response?.data?.message || 'Upload failed.'); }
    setUploading(false);
  };

  if (!['admin', 'agent'].includes(user?.role)) return <Card><CardContent className="py-16 text-center"><ShieldCheck size={26} className="mx-auto text-zinc-600" /><h1 className="mt-4 text-lg font-semibold text-white">Knowledge Base is for support staff</h1><p className="mt-2 text-sm text-zinc-500">Ask SmartDesk from a ticket or create a support request from your dashboard.</p></CardContent></Card>;

  return <div className="space-y-6"><Toast message={toast} /><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">AI context</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Knowledge Base</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Upload the guides, policies, and FAQs SmartDesk can use to answer support questions.</p></div><Badge tone="green"><ShieldCheck size={13} className="mr-1.5" /> Private workspace</Badge></div><div className="grid gap-6 lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]"><Card className="h-fit border-emerald-400/10"><CardHeader><h2 className="flex items-center gap-2 font-semibold text-white"><Upload size={17} className="text-emerald-400" /> Upload document</h2><p className="mt-1 text-sm text-zinc-500">Supported: TXT, MD, JSON, and CSV.</p></CardHeader><CardContent><form onSubmit={upload} className="space-y-4"><div><label htmlFor="knowledge-title" className="mb-2 block text-sm font-medium text-zinc-300">Document title <span className="font-normal text-zinc-600">(optional)</span></label><Input id="knowledge-title" placeholder="Password reset guide" value={title} onChange={(event) => setTitle(event.target.value)} /></div><div><label htmlFor="knowledge-file" className="mb-2 block text-sm font-medium text-zinc-300">File</label><label htmlFor="knowledge-file" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center hover:border-emerald-400/40"><FileText size={23} className="text-emerald-300" /><span className="mt-3 text-sm font-medium text-zinc-200">{file ? file.name : 'Choose a support document'}</span><span className="mt-1 text-xs text-zinc-500">The server will chunk and index it for AI use.</span><input key={inputKey} id="knowledge-file" type="file" className="sr-only" accept=".txt,.md,.json,.csv" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label></div><Button className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" disabled={!file || uploading}><Upload size={14} className="mr-1.5" />{uploading ? 'Indexing document…' : 'Upload to knowledge base'}</Button></form></CardContent></Card><Card><CardHeader><div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold text-white"><FileText size={17} className="text-emerald-400" /> Documents</h2><p className="mt-1 text-sm text-zinc-500">Available as context for SmartDesk answers.</p></div><Badge tone="zinc">{docs.length}</Badge></div></CardHeader><CardContent>{loading ? <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : docs.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center"><FileText size={25} className="mx-auto text-zinc-600" /><p className="mt-3 text-sm font-medium text-zinc-300">Your knowledge base is empty</p><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-zinc-500">Upload a guide or FAQ to give SmartDesk more information to work with.</p></div> : <div className="space-y-2">{docs.map((doc) => <div key={doc._id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><FileText size={16} /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-zinc-200">{doc.title}</div><div className="mt-1 truncate text-xs text-zinc-500">{doc.source || 'Uploaded document'}</div><div className="mt-2 flex flex-wrap items-center gap-2"><Badge tone="green">Available to AI</Badge><span className="text-xs text-zinc-600">{doc.chunkCount ?? '—'} chunks</span>{doc.uploadedBy?.name && <span className="text-xs text-zinc-600">Uploaded by {doc.uploadedBy.name}</span>}</div></div><span className="shrink-0 text-xs text-zinc-600">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}</span></div>)}</div>}</CardContent></Card></div></div>;
}
