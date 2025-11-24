import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service in production
    console.error('Uncaught error:', error, errorInfo);
    
    // In production, send to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            
            <h1 className="text-2xl font-bold text-text mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-textSecondary mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:scale-105"
            >
              Reload Application
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-textSecondary cursor-pointer hover:text-text">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-4 bg-background rounded-lg text-xs text-error overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
