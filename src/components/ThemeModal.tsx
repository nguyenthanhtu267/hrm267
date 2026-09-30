import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
  X,
  Sparkles,
  Sliders,
  Type,
  Waves,
  Leaf,
  Building2,
  CheckCircle2
} from 'lucide-react';
import {
  themeService,
  THEME_PRESETS,
  FONT_OPTIONS,
  ThemePreset,
  ColorMode,
  FontFamilyId,
  ThemeConfig,
  ThemeGroup
} from '../services/themeService';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChanged?: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  onThemeChanged
}) => {
  const [currentConfig, setCurrentConfig] = useState<ThemeConfig>(() => themeService.getConfig());
  const [previewConfig, setPreviewConfig] = useState<ThemeConfig>(() => themeService.getConfig());
  
  // Tab phân nhóm: CORE (Doanh nghiệp) | VECTOR (Vector/Line/Sóng) | NATURE (Thiên nhiên mờ)
  const [activeGroup, setActiveGroup] = useState<ThemeGroup>('CORE');

  useEffect(() => {
    if (isOpen) {
      const cfg = themeService.getConfig();
      setCurrentConfig(cfg);
      setPreviewConfig(cfg);
      // Tự động chuyển tab theo theme đang được chọn
      const currentPresetObj = THEME_PRESETS.find(p => p.id === cfg.preset);
      if (currentPresetObj) {
        setActiveGroup(currentPresetObj.group);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: ThemePreset) => {
    const updated: ThemeConfig = { ...previewConfig, preset };
    setPreviewConfig(updated);
    themeService.applyToDOM(updated);
  };

  const handleSelectMode = (mode: ColorMode) => {
    const updated: ThemeConfig = { ...previewConfig, mode };
    setPreviewConfig(updated);
    themeService.applyToDOM(updated);
  };

  const handleSelectFont = (font: FontFamilyId) => {
    const updated: ThemeConfig = { ...previewConfig, font };
    setPreviewConfig(updated);
    themeService.applyToDOM(updated);
  };

  const handleSelectFontSize = (size: 'NORMAL' | 'LARGE' | 'MAX') => {
    const updated: ThemeConfig = { ...previewConfig, fontSize: size };
    setPreviewConfig(updated);
    themeService.applyToDOM(updated);
  };

  const handleToggleAutoRotate = () => {
    const updated: ThemeConfig = { ...previewConfig, autoRotate: !previewConfig.autoRotate };
    setPreviewConfig(updated);
  };

  const handleSaveAndApply = () => {
    themeService.saveConfig(previewConfig);
    setCurrentConfig(previewConfig);
    if (onThemeChanged) onThemeChanged();
    onClose();
  };

  const handleCancel = () => {
    themeService.applyToDOM(currentConfig);
    onClose();
  };

  // Lọc 5 presets theo từng nhóm
  const displayedPresets = THEME_PRESETS.filter(p => p.group === activeGroup);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal - Gọn gàng, tinh tế */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tùy Chỉnh Giao Diện & Phong Cách Phần Mềm
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  15 Mẫu Phong Cách
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Cá nhân hóa trải nghiệm quản trị, bảo vệ thị giác khi trực ca đêm và nâng tầm thẩm mỹ
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* HÀNG 1: CHẾ ĐỘ ÁNH SÁNG & FONT CHỮ GỌN GÀNG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Chế độ Ánh Sáng */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  1. Chế Độ Ánh Sáng (Ngày / Đêm)
                </span>
                <span className="text-[10px] text-slate-400">Tự động chuyển đổi</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectMode('LIGHT')}
                  className={`py-2 px-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                    previewConfig.mode === 'LIGHT'
                      ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">Ban Ngày</span>
                  </div>
                  {previewConfig.mode === 'LIGHT' && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMode('DARK')}
                  className={`py-2 px-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                    previewConfig.mode === 'DARK'
                      ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">Ban Đêm</span>
                  </div>
                  {previewConfig.mode === 'DARK' && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMode('SYSTEM')}
                  className={`py-2 px-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                    previewConfig.mode === 'SYSTEM'
                      ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">Hệ Thống</span>
                  </div>
                  {previewConfig.mode === 'SYSTEM' && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Font chữ toàn cục */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Type className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  2. Font Chữ Văn Bản (Typography)
                </span>
                <span className="text-[10px] text-slate-400">Chuẩn hành chính / hiện đại</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {FONT_OPTIONS.slice(0, 4).map((f) => {
                  const isSelected = previewConfig.font === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFont(f.id)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                      style={{ fontFamily: f.fontFamily }}
                      title={`${f.name} - ${f.desc}`}
                    >
                      <span className="text-[11px] truncate block">{f.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kích thước chữ (Font Size) */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Type className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  3. Kích Thước Chữ (Độ Thu Phóng)
                </span>
                <span className="text-[10px] text-slate-400">Ưu tiên to rõ</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'NORMAL', label: 'Bình Thường' },
                  { id: 'LARGE', label: 'Lớn (Mặc định)' },
                  { id: 'MAX', label: 'Rất Lớn' }
                ].map(size => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleSelectFontSize(size.id as any)}
                    className={`py-2 px-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      previewConfig.fontSize === size.id
                        ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-xs ring-2 ring-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[11px]">{size.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tự Động Chuyển Giao Diện */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  4. Đổi Nền Tự Động Mỗi Ngày
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Tránh nhàm chán bằng cách ngẫu nhiên đổi 15 mẫu nền</p>
              </div>
              <button
                type="button"
                onClick={handleToggleAutoRotate}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${previewConfig.autoRotate ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${previewConfig.autoRotate ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>

          {/* HÀNG 2: 15 MẪU PHONG CÁCH GIAO DIỆN (CHIA THEO 3 TAB THÔNG MINH) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs">
                <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>5. Chọn Mẫu Phong Cách & Họa Tiết Nền (15 Mẫu Sắc Nét)</span>
              </span>

              {/* 3 Tabs thông minh tiết kiệm diện tích */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setActiveGroup('CORE')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeGroup === 'CORE'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Doanh Nghiệp (5)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGroup('VECTOR')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeGroup === 'VECTOR'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5 text-blue-500" />
                  <span>Vector & Line Sóng (5)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGroup('NATURE')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeGroup === 'NATURE'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Thiên Nhiên Mờ (5)</span>
                </button>
              </div>
            </div>

            {/* Grid 5 cột nhỏ gọn cho 5 presets của nhóm đang chọn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {displayedPresets.map((preset) => {
                const isSelected = previewConfig.preset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Header Card: Color swatches & Check icon */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex -space-x-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700">
                        {preset.previewColors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-2xs"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-slate-400" />
                      )}
                    </div>

                    {/* Tên & Tagline */}
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                        {preset.tagline}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    {/* Dải gradient xem trước ở đáy card */}
                    <div 
                      className="h-1.5 w-full rounded-full mt-2.5 opacity-80"
                      style={{ 
                        background: `linear-gradient(to right, ${preset.previewColors[0]}, ${preset.previewColors[1]})` 
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Modal: Trạng thái & Nút thao tác */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Xem trước trực tiếp theo thời gian thực trên toàn trang web</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu & Áp Dụng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
