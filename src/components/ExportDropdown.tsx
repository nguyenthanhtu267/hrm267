import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, Printer, FileText, ChevronDown } from 'lucide-react';

export interface ExportDropdownProps {
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onExportWord?: () => void;
  label?: string;
  className?: string;
  buttonColorClass?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportExcel,
  onExportPdf,
  onExportWord,
  label = 'Xuất File',
  className = '',
  buttonColorClass = 'bg-emerald-600 hover:bg-emerald-700 text-white',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${buttonColorClass}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in-50 zoom-in-95">
          {onExportExcel && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onExportExcel();
              }}
              className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất File Excel (.xlsx)</span>
            </button>
          )}

          {onExportPdf && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onExportPdf();
              }}
              className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-800 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-rose-600" />
              <span>In & Xuất PDF (.pdf)</span>
            </button>
          )}

          {onExportWord && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onExportWord();
              }}
              className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Xuất File Word (.doc)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
