import { Component, type ErrorInfo, type ReactNode } from 'react';
import { BraiseMascot } from '@/components/BraiseMascot';

type Props = {
  children: ReactNode;
  /** Called when the player asks to go home — the parent (App.tsx) navigates away, and since
   *  the boundary is mounted with `key={state.view}` at the call site, that navigation remounts
   *  it fresh for whatever view comes next. No reset plumbing needed beyond that one prop. */
  onGoHome?: () => void;
};

type State = { hasError: boolean };

// No boundary existed anywhere in this app before today — a crash in ANY view took the whole
// thing down to a blank white screen with nothing to click, exactly what happened when Réviser's
// session-end hook-order bug shipped (see that fix's commit). That one bug is caught now, but
// the next unknown one won't announce itself in advance either; this is the net for it. A class
// component because React error boundaries have no hook equivalent (getDerivedStateFromError /
// componentDidCatch only exist on the class API).
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] caught a render crash:', error, info.componentStack);
  }

  // "Réessayer" — a purely local reset, no navigation: some crashes are transient (a bad piece
  // of state from a race, not a deterministic bug), and re-rendering the same view costs the
  // player nothing to try first.
  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 bg-[var(--bg)] px-8 text-center">
          <BraiseMascot size={72} mood="hesitant" />
          <p className="mt-3 font-display text-[1.15rem] font-extrabold text-[var(--neo-ink)]">Oups, un truc a planté</p>
          <p className="max-w-[30ch] text-[0.9rem] leading-relaxed text-[var(--ink-soft)]">
            C'est de notre côté, pas du tien. Réessaie, ou retourne à l'accueil en attendant qu'on répare.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-full border-[2.5px] border-black bg-[var(--paper)] px-5 py-3 font-display text-[0.88rem] font-extrabold text-[var(--ink)] shadow-[3px_3px_0_#000] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              Réessayer
            </button>
            {this.props.onGoHome && (
              <button
                type="button"
                onClick={this.props.onGoHome}
                className="rounded-full border-[2.5px] border-black bg-gradient-to-b from-[#FFE066] to-[#FDC800] px-5 py-3 font-display text-[0.88rem] font-extrabold text-black shadow-[3px_3px_0_#000] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                Retour à l'accueil
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
