import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Catches render errors so a bug doesn't white-screen the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error('App error:', error);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center px-6 text-center">
          <div>
            <div className="text-4xl">😕</div>
            <h1 className="mt-3 text-lg font-bold">Something broke</h1>
            <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">{this.state.error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-2.5 text-sm font-bold text-black hover:opacity-90"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
