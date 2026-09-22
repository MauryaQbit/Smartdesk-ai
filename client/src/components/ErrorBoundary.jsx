import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div className="max-w-6xl mx-auto px-4 py-10"><div className="rounded-2xl border bg-red-50 p-6 text-sm text-red-800">Something went wrong: {String(this.state.error?.message||this.state.error)} <button onClick={()=>location.reload()} className="ml-2 underline">Reload</button></div></div>;
    return this.props.children;
  }
}
