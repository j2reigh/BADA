import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    // TODO: Send to Sentry when configured
    // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6 relative"
          style={{
            background: `linear-gradient(to bottom, #ABBBD5 0%, #879DC6 25%, #233F64 50%, #182339 100%)`
          }}
        >
          {/* Logo - fixed top left */}
          <div className="fixed top-0 left-0 right-0 z-50 px-6 h-16 flex items-center">
            <img src="/logo-badaone.svg" alt="bada.one" className="h-5" />
          </div>

          <div className="max-w-md w-full text-center">

            {/* Message */}
            <h1 className="text-2xl font-mono font-medium text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-white/60 mb-10 text-sm leading-relaxed max-w-sm mx-auto">
              We encountered an unexpected error.
              Try refreshing the page or go back to the home page.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-8 py-3 bg-white text-[#182339] rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-8 py-3 border border-white/30 text-white rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Go to Home
              </button>
            </div>

            {/* Error details (dev only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-10 p-4 bg-white/10 backdrop-blur-sm rounded-xl text-left border border-white/10">
                <p className="text-xs font-mono text-white/70 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
