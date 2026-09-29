import React from 'react';
import { Calendar } from 'lucide-react';

export type DatePreset = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR';

interface DateRangePresetPickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string, presetName?: string) => void;
  activePreset?: DatePreset;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Helper: Tính toán dải ngày theo bộ chọn nhanh
 */
export const computeDateRange = (preset: DatePreset): { start: string; end: string } => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-11
  const d = now.getDate();

  const fmt = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  switch (preset) {
    case 'TODAY':
      return { start: fmt(now), end: fmt(now) };
    case 'YESTERDAY': {
      const yest = new Date(y, m, d - 1);
      return { start: fmt(yest), end: fmt(yest) };
    }
    case 'THIS_WEEK': {
      // Thứ 2 đầu tuần đến Chủ nhật
      const dayOfWeek = now.getDay() || 7; // 1 (Mon) -> 7 (Sun)
      const monday = new Date(y, m, d - dayOfWeek + 1);
      const sunday = new Date(y, m, d - dayOfWeek + 7);
      return { start: fmt(monday), end: fmt(sunday) };
    }
    case 'THIS_MONTH': {
      const first = new Date(y, m, 1);
      const last = new Date(y, m + 1, 0);
      return { start: fmt(first), end: fmt(last) };
    }
    case 'LAST_MONTH': {
      const first = new Date(y, m - 1, 1);
      const last = new Date(y, m, 0);
      return { start: fmt(first), end: fmt(last) };
    }
    case 'THIS_QUARTER': {
      const qStartMonth = Math.floor(m / 3) * 3;
      const first = new Date(y, qStartMonth, 1);
      const last = new Date(y, qStartMonth + 3, 0);
      return { start: fmt(first), end: fmt(last) };
    }
    case 'THIS_YEAR': {
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    }
  }
};

/**
 * Component thanh nút bấm chọn nhanh thời gian thông minh
 */
export const DateRangePresetPicker: React.FC<DateRangePresetPickerProps> = ({
  startDate,
  endDate,
  onChange,
  className = '',
  size = 'sm',
}) => {
  const presets: { id: DatePreset; label: string }[] = [
    { id: 'TODAY', label: 'Hôm nay' },
    { id: 'THIS_WEEK', label: 'Tuần này' },
    { id: 'THIS_MONTH', label: 'Tháng này' },
    { id: 'LAST_MONTH', label: 'Tháng trước' },
    { id: 'THIS_QUARTER', label: 'Quý này' },
  ];

  const handleSelect = (preset: DatePreset) => {
    const { start, end } = computeDateRange(preset);
    onChange(start, end, preset);
  };

  const isSelected = (preset: DatePreset) => {
    const { start, end } = computeDateRange(preset);
    return startDate === start && endDate === end;
  };

  const btnPadding = size === 'sm' ? 'px-2 py-0.5 text-[10.5px]' : 'px-3 py-1 text-xs';

  return (
    <div className={`inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 ${className}`}>
      <span className="text-[10px] font-bold text-slate-400 px-1.5 flex items-center gap-1">
        <Calendar className="w-3 h-3 text-slate-500" />
        <span>Nhanh:</span>
      </span>
      {presets.map(p => {
        const active = isSelected(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelect(p.id)}
            className={`${btnPadding} font-bold rounded-lg transition-all cursor-pointer ${
              active
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
};
