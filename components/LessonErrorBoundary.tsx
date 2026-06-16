import React, { Component } from 'react';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';

interface LessonErrorBoundaryProps {
  children: React.ReactNode;
  onBack: () => void;
  resetKey: string;
}

interface LessonErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class LessonErrorBoundary extends Component<LessonErrorBoundaryProps, LessonErrorBoundaryState> {
  declare props: LessonErrorBoundaryProps;
  declare setState: (state: Partial<LessonErrorBoundaryState>) => void;

  state: LessonErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: unknown): LessonErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'The lesson could not load.',
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Kid Genius lesson failed to render', error, info);
  }

  componentDidUpdate(previousProps: LessonErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: '' });
    }
  }

  private retry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-200 via-indigo-100 to-emerald-200 p-4">
        <div className="w-full max-w-xl rounded-[28px] border-4 border-white bg-white/95 p-6 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
            <AlertTriangle size={34} />
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-amber-700">Lesson reset needed</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">This classroom needs a quick refresh.</h2>
          <p className="mt-3 text-sm font-bold text-slate-600">
            Your school day is still saved. Go back to the campus or try loading this classroom again.
          </p>
          {this.state.message && (
            <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              Teacher note: {this.state.message}
            </p>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={this.props.onBack}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-indigo-700"
            >
              <ArrowLeft size={18} />
              Back to School Map
            </button>
            <button
              type="button"
              onClick={this.retry}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-200"
            >
              <RotateCcw size={18} />
              Try Classroom Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
