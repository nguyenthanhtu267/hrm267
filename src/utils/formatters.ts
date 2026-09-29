/**
 * FORMATTERS UTILITIES - HRM SOFT
 * Chuẩn hóa hiển thị và nhập liệu số / tiền tệ trên toàn hệ thống:
 * 1. Tiền tệ / Số lượng lớn (VNĐ): Dấu chấm '.' ngăn cách hàng ngàn (VD: 1.500.000)
 * 2. Ngoại tệ (USD, EUR...): Dấu phẩy ',' ngăn cách hàng ngàn, dấu chấm '.' thập phân (VD: 25,780.50)
 * 3. Hiển thị đếm số lượng, người, giờ, công việc: formatNumber(value) có dấu chấm phân cách.
 */

/**
 * Định dạng số thành chuỗi có dấu chấm phân cách hàng ngàn (chuẩn Việt Nam)
 * @param value Số hoặc chuỗi số
 * @param options Tùy chọn số chữ số thập phân
 */
export const formatNumber = (value: number | string | null | undefined, options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }): string => {
  if (value === null || value === undefined || value === '') return '0';
  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('vi-VN', {
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
  });
};

/**
 * Định dạng tiền tệ VNĐ (ví dụ: 15.000.000 ₫)
 */
export const formatVND = (value: number | string | null | undefined, showUnit: boolean = true): string => {
  const formatted = formatNumber(value);
  return showUnit ? `${formatted} ₫` : formatted;
};

/**
 * Format chuỗi người dùng gõ vào ô input thành định dạng có dấu chấm/phẩy theo thời gian thực
 */
export const formatInputValue = (val: string | number, isVND: boolean = true): string => {
  if (val === undefined || val === null || val === '') return '';
  const str = val.toString();
  if (isVND) {
    // Chỉ giữ lại chữ số
    const digitsOnly = str.replace(/\D/g, '');
    if (!digitsOnly) return '';
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } else {
    // Với ngoại tệ: giữ số và tối đa 1 dấu chấm thập phân
    const cleaned = str.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) {
      return intPart + '.' + parts.slice(1).join('');
    }
    return intPart;
  }
};

/**
 * Parse chuỗi từ ô input có dấu chấm/phẩy ngược lại thành kiểu số nguyên/thực Javascript
 */
export const parseInputValue = (val: string | number, isVND: boolean = true): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (isVND) {
    const clean = val.toString().replace(/\./g, '').replace(/,/g, '');
    return parseInt(clean, 10) || 0;
  } else {
    const clean = val.toString().replace(/,/g, '');
    return parseFloat(clean) || 0;
  }
};
