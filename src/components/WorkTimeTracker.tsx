import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * Component hiển thị thời gian phần mềm hoạt động liên tục trong ngày
 * - Lưu nhớ tích lũy vào localStorage theo ngày YYYY-MM-DD
 * - Dù sleep, tắt máy hay đóng tab, khi mở lại vẫn tiếp tục cộng dồn
 * - Nếu >= 10h: nền màu vàng
 * - Nếu >= 12h: nền màu đỏ
 */
interface WorkTimeTrackerProps {
  className?: string;
}

export const WorkTimeTracker: React.FC<WorkTimeTrackerProps> = ({ className = '' }) => {
  const [secondsToday, setSecondsToday] = useState<number>(0);

  useEffect(() => {
    const todayKey = `omnihrm_active_time_${new Date().toISOString().slice(0, 10)}`;

    // Đọc số giây đã tích lũy trong ngày hôm nay
    const saved = localStorage.getItem(todayKey);
    const initialSeconds = saved ? parseInt(saved, 10) || 0 : 0;
    setSecondsToday(initialSeconds);

    let lastTick = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.round((now - lastTick) / 1000);
      
      // Nếu máy tính sleep hoặc đóng nắp trong thời gian dài rồi mở lại:
      // Vẫn ghi nhận thời gian phần mềm hoạt động kể từ khi mở máy
      if (deltaSec > 0) {
        setSecondsToday((prev) => {
          const next = prev + (deltaSec > 300 ? 1 : deltaSec); // bảo vệ chống tràn nếu sleep nhiều ngày
          try {
            localStorage.setItem(todayKey, next.toString());
          } catch (_) {}
          return next;
        });
      }
      lastTick = now;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsToday / 3600);
  const minutes = Math.floor((secondsToday % 3600) / 60);
  const seconds = secondsToday % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeFormatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Kiểm tra mốc cảnh báo thời gian làm việc
  let colorBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let statusText = 'Thời gian phần mềm hoạt động liên tục';

  if (hours >= 12) {
    colorBadgeClass = 'bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-400/30 animate-pulse font-bold';
    statusText = '⚠️ Cảnh báo: Làm việc quá 12 tiếng!';
  } else if (hours >= 10) {
    colorBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30 font-bold';
    statusText = '⏱️ Đã làm việc trên 10 tiếng';
  }

  return (
    <div
      className={`h-11 w-full flex flex-col items-center justify-center px-2 sm:px-3 py-0.5 rounded-xl border text-xs shadow-xs transition-all ${colorBadgeClass} ${className}`}
      title={`${statusText} (Tích lũy trong ngày)`}
    >
      <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">
        <Clock className={`w-3.5 h-3.5 ${hours >= 12 ? 'text-rose-600' : hours >= 10 ? 'text-amber-600' : 'text-slate-500'}`} />
        <span>THỜI GIAN HOẠT ĐỘNG</span>
      </div>
      <div className="flex items-center justify-center space-x-1.5">
        <span className="font-bold text-slate-900 text-xs font-mono tracking-wider bg-white/90 px-1.5 py-0.5 rounded border border-black/5 shadow-inner leading-none">
          {timeFormatted}
        </span>
        {hours >= 10 && (
          <span className="text-[9px] font-bold px-1 rounded bg-amber-200 text-amber-900">
            {hours >= 12 ? 'Quá 12h' : '≥10h'}
          </span>
        )}
      </div>
    </div>
  );
};
