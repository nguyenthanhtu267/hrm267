import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * ErrorBoundary toàn cục - ngăn màn hình trắng khi bất kỳ component nào crash.
 * Hiển thị thông báo lỗi rõ ràng + nút khôi phục thay vì màn hình trắng.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Runtime error:', error, errorInfo);
    this.setState(prev => ({ errorInfo, errorCount: prev.errorCount + 1 }));
  }

  handleReload = () => window.location.reload();

  handleClearStorageAndReload = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('omnihrm_')) localStorage.removeItem(key);
      });
    } catch (_) {}
    window.location.reload();
  };

  handleReset = () => this.setState({ hasError: false, error: null, errorInfo: null });

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Lỗi không xác định';
      const stack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-xl p-8 max-w-xl w-full">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="p-3 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Gặp sự cố khi tải trang</h2>
                <p className="text-xs text-slate-500 mt-0.5">{this.props.fallbackLabel || 'Một phần giao diện bị lỗi runtime'}</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-1.5">
              <p className="text-xs font-semibold text-rose-800 mb-1">Chi tiết lỗi:</p>
              <p className="text-xs text-rose-700 font-mono break-words">{errorMsg}</p>
              {stack && (
                <details className="mt-2">
                  <summary className="text-[10px] text-rose-500 cursor-pointer select-none">Xem call stack</summary>
                  <pre className="text-[9px] text-rose-400 mt-1 overflow-auto max-h-28 whitespace-pre-wrap">{stack.trim()}</pre>
                </details>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2 text-xs text-amber-800">
              <p className="font-semibold mb-1">💡 Nguyên nhân thường gặp:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                <li>Dữ liệu lưu (localStorage) bị lỗi từ phiên cũ</li>
                <li>Xung đột dữ liệu sau khi cập nhật phần mềm</li>
                <li>Trường dữ liệu bắt buộc bị thiếu / null</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={this.handleReset} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
                <RefreshCw className="w-4 h-4" /> Thử lại (giữ nguyên dữ liệu)
              </button>
              <button onClick={this.handleReload} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
                <RefreshCw className="w-4 h-4" /> Tải lại trang
              </button>
              <button onClick={this.handleClearStorageAndReload} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold rounded-xl border border-rose-200 transition-colors">
                <Trash2 className="w-4 h-4" /> Xóa cache &amp; khôi phục dữ liệu mặc định
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              HRM Soft v2.4 • Nếu vẫn lỗi sau khi xóa cache, hãy báo cáo qua &quot;Góp Ý &amp; Báo Lỗi&quot;
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/** HOC bọc view với ErrorBoundary riêng - 1 tab lỗi không sập toàn app */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  label?: string
) {
  return function BoundedComponent(props: P) {
    return (
      <ErrorBoundary fallbackLabel={label}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
