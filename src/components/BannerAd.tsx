import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface BannerAdProps {
  id: string;
  variant?: 'horizontal' | 'square';
  badge?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  href: string;
  bgClass?: string;
  className?: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  id,
  variant = 'horizontal',
  badge,
  title,
  subtitle,
  ctaText,
  href,
  bgClass = 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  if (variant === 'square') {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden shadow-lg p-2.5 flex flex-col justify-between min-h-[260px] ${bgClass} ${className}`}>
        {/* Nút đóng & Nhãn QC */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider bg-white/60 border border-slate-200 px-1.5 py-0.5 rounded">Quảng cáo</span>
          <button 
            onClick={() => setIsVisible(false)}
            className="w-5 h-5 rounded-full bg-white/60 border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Background Overlay Decor */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full mt-1.5">
          {badge && (
            <span className="px-2 py-0.5 rounded bg-white/80 text-blue-700 text-[10px] font-bold w-fit mb-3 uppercase tracking-wide backdrop-blur-md border border-blue-200 shadow-sm">
              {badge}
            </span>
          )}
          
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight mb-2">
            {title}
          </h3>
          
          <p className="text-xs text-slate-600 leading-relaxed mb-3 flex-1">
            {subtitle}
          </p>

          <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider text-center shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
          >
            {ctaText}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className={`relative w-full rounded-xl overflow-hidden shadow-sm p-3 flex flex-col sm:flex-row items-center justify-between gap-3 ${bgClass} ${className}`}>
      {/* Background Overlay Decor */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>

      {/* Trái: Nội dung (Badge + Text) */}
      <div className="relative z-10 flex-1 flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-3 pr-4">
        {badge && (
          <span className="px-2 py-0.5 rounded bg-white/80 text-blue-700 text-[10px] font-bold whitespace-nowrap uppercase tracking-wide backdrop-blur-md border border-blue-200 shadow-sm shrink-0">
            {badge}
          </span>
        )}
        <div className="flex-1 truncate">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">
            {title}
          </h3>
          <p className="text-[11px] text-slate-600 truncate max-w-[90%]">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Phải: Nút Action & Nút Tắt */}
      <div className="relative z-10 flex items-center shrink-0 gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
        <a 
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-1.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-[10px] font-bold uppercase tracking-wider text-center shadow-sm shadow-orange-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-1 border border-amber-400/50"
        >
          {ctaText}
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Cụm nút đóng gọn gàng */}
        <div className="flex items-center gap-1.5 border-l border-slate-300/50 pl-4">
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider hidden sm:inline-block">QC</span>
          <button 
            onClick={() => setIsVisible(false)}
            className="w-5 h-5 rounded-full bg-white/60 border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
