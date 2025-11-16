import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-dark to-gray-900 flex items-center justify-center p-6" dir="rtl">
          <div className="max-w-2xl w-full bg-primary-dark/80 border-2 border-red-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border-2 border-red-500/40">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-400">حدث خطأ غير متوقع</h1>
                <p className="text-gray-300 mt-1">نعتذر عن الإزعاج</p>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-200 leading-relaxed">
                حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
              </p>
              {this.state.error && (
                <details className="mt-4">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                    عرض تفاصيل الخطأ
                  </summary>
                  <div className="mt-2 p-3 bg-black/30 rounded-lg">
                    <pre className="text-xs text-red-300 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo && '\n\n' + this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                <span>العودة للرئيسية</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-primary-light/40 hover:bg-primary-light/60 text-gray-200 px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                إعادة تحميل الصفحة
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
