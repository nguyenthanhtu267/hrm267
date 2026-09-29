import React, { useState, useRef, useEffect } from 'react';
import { Check, Globe2, RotateCcw } from 'lucide-react';
import { languageService, AppLanguage, SUPPORTED_LANGUAGES, LanguageOption } from '../services/languageService';

// Component SVG Cờ Việt Nam sắc nét
const VietnamFlag: React.FC<{ className?: string }> = ({ className = "w-6 h-4.5" }) => (
  <svg viewBox="0 0 900 600" className={`${className} rounded-xs shadow-xs border border-red-700/20 shrink-0`} xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#da251d" />
    <polygon points="450,150 491,277 625,277 516,356 558,483 450,404 342,483 384,356 275,277 409,277" fill="#ffff00" />
  </svg>
);

// Component SVG Cờ Vương Quốc Anh (UK)
const UKFlag: React.FC<{ className?: string }> = ({ className = "w-6 h-4.5" }) => (
  <svg viewBox="0 0 60 30" className={`${className} rounded-xs shadow-xs border border-blue-900/20 shrink-0`} xmlns="http://www.w3.org/2000/svg">
    <clipPath id="uk-s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
    <clipPath id="uk-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
    <g clipPath="url(#uk-s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

// Component SVG Cờ Trung Quốc
const ChinaFlag: React.FC<{ className?: string }> = ({ className = "w-6 h-4.5" }) => (
  <svg viewBox="0 0 900 600" className={`${className} rounded-xs shadow-xs border border-red-700/20 shrink-0`} xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#de2910" />
    <polygon points="150,60 179,150 274,150 197,206 226,296 150,240 74,296 103,206 26,150 121,150" fill="#ffde00" />
    <polygon points="300,60 293,92 324,80 291,73 305,103" fill="#ffde00" />
    <polygon points="360,120 348,150 379,143 347,131 356,163" fill="#ffde00" />
    <polygon points="360,210 344,238 376,236 347,220 351,253" fill="#ffde00" />
    <polygon points="300,270 291,301 323,293 293,281 303,313" fill="#ffde00" />
  </svg>
);

export const LanguageFlag: React.FC<{ code: AppLanguage; className?: string }> = ({ code, className }) => {
  if (code === 'en') return <UKFlag className={className} />;
  if (code === 'zh') return <ChinaFlag className={className} />;
  return <VietnamFlag className={className} />;
};

interface LanguageSwitcherProps {
  currentLanguage?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  onResetData?: () => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  onResetData,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeLang, setActiveLang] = useState<AppLanguage>(() => currentLanguage || languageService.getLanguage());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLanguage && currentLanguage !== activeLang) {
      setActiveLang(currentLanguage);
    }
  }, [currentLanguage]);

  // Lắng nghe sự kiện click ra ngoài để tự động đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (lang: AppLanguage) => {
    setActiveLang(lang);
    languageService.setLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
    setIsOpen(false);
  };

  const currentOption = SUPPORTED_LANGUAGES.find(l => l.code === activeLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* NÚT KÍCH HOẠT: KHUNG ĐỒNG NHẤT H-11 W-11 VỚI CÁC ICON NÚT KHÁC, CỜ CĂN GIỮA */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer relative group shrink-0"
        title={`Ngôn ngữ: ${currentOption.name} (${currentOption.nativeName}) - Bấm để chọn Tiếng Việt, Tiếng Anh, Tiếng Trung Quốc`}
      >
        <LanguageFlag code={activeLang} className="w-6 h-4 group-hover:scale-105 transition-transform" />
        {/* Dấu chấm tròn nhỏ tinh tế góc dưới */}
        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white"></span>
      </button>

      {/* DROPDOWN CHỌN NGÔN NGỮ */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Chọn Ngôn Ngữ</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">3 Quốc Gia</span>
          </div>

          {/* Danh sách 3 ngôn ngữ: Tiếng Việt (Mặc định), Tiếng Anh, Tiếng Trung Quốc */}
          <div className="p-1.5 space-y-1">
            {SUPPORTED_LANGUAGES.map((option) => {
              const isSelected = option.code === activeLang;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleSelectLanguage(option.code)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/90 font-bold text-indigo-900 ring-1 ring-indigo-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <LanguageFlag code={option.code} className="w-6 h-4.5" />
                    <div>
                      <div className="text-xs font-semibold leading-none">{option.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-1">{option.nativeName}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center space-x-1 text-indigo-600">
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">
                        {option.code === 'vi' ? 'Mặc định' : 'Đang chọn'}
                      </span>
                      <Check className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mục Khôi Phục Dữ Liệu Gốc - Gom vào nhóm này */}
          {onResetData && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <div className="p-1.5 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onResetData();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 group-hover:bg-rose-200 transition-colors shrink-0">
                    <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition-transform" />
                  </div>
                  <div>
                    <div className="font-bold text-rose-700">Khôi phục dữ liệu gốc</div>
                    <div className="text-[10.5px] text-slate-400">Tải lại dữ liệu mẫu mặc định ban đầu</div>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* Footer ghi chú */}
          <div className="px-3.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 italic">
            Tự động lưu & áp dụng cho toàn bộ phần mềm
          </div>
        </div>
      )}
    </div>
  );
};
