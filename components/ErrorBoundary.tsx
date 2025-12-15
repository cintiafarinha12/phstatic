'use client';
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h1>
            <p className="text-gray-600 mb-6">
              Encontramos um erro inesperado. Nossa equipe foi notificada.
            </p>
            <details className="mb-6 text-left bg-gray-50 p-3 rounded text-xs text-gray-600 max-h-40 overflow-auto">
              <summary className="cursor-pointer font-semibold mb-2">Detalhes técnicos</summary>
              <pre className="whitespace-pre-wrap break-words">{this.state.error?.message}</pre>
            </details>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              <RefreshCw size={18} />
              Voltar para Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
