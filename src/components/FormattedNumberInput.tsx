import React, { useEffect, useState } from 'react';
import { formatInputValue, parseInputValue } from '../utils/formatters';

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | string;
  onChange: (value: number) => void;
  isVND?: boolean;
  unit?: string;
  allowZero?: boolean;
}

/**
 * Ô nhập liệu số thông minh có tự động chèn dấu chấm phân cách hàng ngàn (VNĐ)
 * hoặc dấu phẩy (Ngoại tệ) trong thời gian thực khi gõ.
 */
export const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  value,
  onChange,
  isVND = true,
  unit,
  allowZero = true,
  className = '',
  placeholder = '0',
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (value === 0 && !allowZero) return '';
    return formatInputValue(value, isVND);
  });

  useEffect(() => {
    const formatted = formatInputValue(value, isVND);
    setDisplayValue(formatted);
  }, [value, isVND]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatInputValue(rawVal, isVND);
    setDisplayValue(formatted);
    const numeric = parseInputValue(formatted, isVND);
    onChange(numeric);
  };

  if (unit) {
    return (
      <div className="relative w-full">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${className} pr-12`}
          {...props}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
          {unit}
        </span>
      </div>
    );
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
};
