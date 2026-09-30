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
  bgClass = 'bg-gradient-to-br from-slate-800 to-slate-900',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  if (variant === 'square') {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden shadow-lg p-5 flex flex-col justify-between min-h-[260px] ${bgClass} ${className}`}>
        {/* Nút đóng & Nhãn QC */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          <span className="text-[9px] font-medium text-white/70 uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded">Quảng cáo</span>
          <button 
            onClick={() => setIsVisible(false)}
            className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-white/70 hover:bg-black/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Background Overlay Decor */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full mt-4">
          {badge && (
            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold w-fit mb-3 uppercase tracking-wide backdrop-blur-md border border-white/10">
              {badge}
            </span>
          )}
          
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2 drop-shadow-sm">
            {title}
          </h3>
          
          <p className="text-xs text-white/80 leading-relaxed mb-6 flex-1 drop-shadow-sm">
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
    <div className={`relative w-full rounded-2xl overflow-hidden shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 ${bgClass} ${className}`}>
      {/* Nút đóng & Nhãn QC */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-2 z-20">
        <span className="text-[9px] font-medium text-white/70 uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded">Quảng cáo</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-white/70 hover:bg-black/40 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Background Overlay Decor */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex-1 w-full pt-4 sm:pt-0">
        {badge && (
          <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold w-fit mb-2 block uppercase tracking-wide backdrop-blur-md border border-white/10 shadow-sm">
            {badge}
          </span>
        )}
        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1.5 drop-shadow-md">
          {title}
        </h3>
        <p className="text-xs text-white/80 max-w-2xl drop-shadow-md">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
        <a 
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-black uppercase tracking-wider text-center shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 border border-amber-400/50"
        >
          {ctaText}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
