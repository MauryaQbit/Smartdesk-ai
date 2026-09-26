import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-8"><div className="text-lg font-semibold text-white">Something went wrong</div><p className="mt-2 text-sm leading-6 text-zinc-400">We couldn’t load this part of SmartDesk. Refresh the page and try again.</p><button onClick={()=>location.reload()} className="mt-5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200">Reload SmartDesk</button></div></div>;
    return this.props.children;
  }
}
