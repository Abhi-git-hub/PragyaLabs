import { Component, type ReactNode } from 'react';

// Catches render crashes per page and shows the actual error + recovery
// actions instead of unmounting React into a blank white screen.
export default class ErrorBoundary extends Component<{ children: ReactNode; page: string }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // eslint-disable-next-line no-console
    console.error(`Mail Mania UI crash on page "${this.props.page}":`, error);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (error) {
      return (
        <div className="panel">
          <h3>Something went wrong displaying this page</h3>
          <p className="err">{error.message || 'Unknown render error'}</p>
          <details>
            <summary>Technical details (include these when reporting the bug)</summary>
            <pre className="log">{error.stack?.slice(0, 2000) ?? 'no stack'}</pre>
          </details>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn" onClick={() => this.setState({ error: null })}>Try again</button>
            <button className="btn ghost" onClick={() => window.location.reload()}>Reload app</button>
          </div>
          <p style={{ color: '#9aa6b8' }}>
            Tip: if this appeared right after updating, the UI and server builds may be
            out of sync — run <code>npm run build</code> and restart with <code>npm start</code>.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
