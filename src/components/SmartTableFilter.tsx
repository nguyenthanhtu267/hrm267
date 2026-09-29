import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Hàm kiểm tra giá trị của ô có thỏa mãn biểu thức lọc cột không
 * Hỗ trợ các toán tử: >=500, <=200, >100, <50, =30, hoặc chuỗi thông thường
 */
export function evaluateColumnCondition(cellValue: any, filterExpr: string): boolean {
  if (!filterExpr || filterExpr.trim() === '') return true;
  const expr = filterExpr.trim();

  // 1. Kiểm tra toán tử so sánh số học
  const mathMatch = expr.match(/^([><]=?|=)\s*(-?\d+(\.\d+)?)/);
  if (mathMatch) {
    const operator = mathMatch[1];
    const targetNum = parseFloat(mathMatch[2]);
    const numValue = typeof cellValue === 'number' 
      ? cellValue 
      : parseFloat(String(cellValue).replace(/[^\d.-]/g, ''));

    if (isNaN(numValue)) return false;

    switch (operator) {
      case '>=': return numValue >= targetNum;
      case '<=': return numValue <= targetNum;
      case '>': return numValue > targetNum;
      case '<': return numValue < targetNum;
      case '=': return numValue === targetNum;
      default: return true;
    }
  }

  // 2. Nếu người dùng nhập số trực tiếp (VD: 500) trên cột số, hỗ trợ tìm kiếm chứa hoặc bằng
  if (typeof cellValue === 'number' && !isNaN(Number(expr))) {
    return cellValue.toString().includes(expr);
  }

  // 3. So sánh chuỗi không dấu / case-insensitive
  const strVal = String(cellValue || '').toLowerCase();
  const searchStr = expr.toLowerCase();
  return strVal.includes(searchStr);
}

interface CompactPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords?: number;
  totalItems?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const CompactPagination: React.FC<CompactPaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const count = totalRecords ?? totalItems ?? 0;
  const from = count > 0 ? Math.min((currentPage - 1) * pageSize + 1, count) : 0;
  const to = Math.min(currentPage * pageSize, count);

  return (
    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 select-none">
      <div className="flex items-center space-x-2">
        <span>Hiển thị</span>
        {onPageSizeChange ? (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="p-1 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 outline-none cursor-pointer text-xs"
          >
            <option value={10}>10 dòng (Trang đầu gọn)</option>
            <option value={15}>15 dòng (Chuẩn màn hình)</option>
            <option value={25}>25 dòng</option>
            <option value={50}>50 dòng</option>
          </select>
        ) : (
          <b className="text-slate-900">{pageSize}</b>
        )}
        <span>
          dòng • <b>{count > 0 ? from.toLocaleString('vi-VN') : 0}-{to.toLocaleString('vi-VN')}</b> của <b className="text-indigo-600">{(count || 0).toLocaleString('vi-VN')}</b> bản ghi
        </span>
      </div>

      <div className="flex items-center space-x-1">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang đầu"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="px-3 py-1 font-bold text-slate-800 bg-white border border-slate-200 rounded-lg">
          Trang {currentPage} / {Math.max(1, totalPages)}
        </span>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang sau"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang cuối"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
