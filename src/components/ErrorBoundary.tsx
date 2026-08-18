/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { crashReporter } from '../lib/crashReporter';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    try {
      crashReporter.captureException(error, { 
        component: 'CustomerCompanionErrorBoundary',
        componentStack: errorInfo.componentStack 
      });
    } catch (e) {
      console.error('Failed to log error to central crash reporter', e);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div id="companion-error-boundary-wrapper" className="bg-slate-900 border border-red-500/30 rounded-xl p-6 my-4 shadow-xl max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-400 shrink-0">
              <AlertTriangle id="boundary-error-icon" className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-100 font-sans">
                  Metabolic Companion Interface Error
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  An unexpected exception occurred while rendering the metabolic companion interface. Local data has been synchronized and remains safe.
                </p>
              </div>

              {this.state.error && (
                <div className="bg-slate-950/60 rounded-lg p-4 border border-slate-800/80">
                  <div className="text-xs font-mono text-red-400 break-all">
                    {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <pre className="text-[10px] font-mono text-slate-500 overflow-x-auto max-h-40 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  id="boundary-reset-btn"
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors font-sans shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reload Companion
                </button>
                <button
                  id="boundary-reload-page-btn"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 rounded-lg text-xs font-medium transition-colors font-sans cursor-pointer"
                >
                  Hard Reset Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
