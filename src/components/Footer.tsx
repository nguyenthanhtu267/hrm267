import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Smartphone, 
  ExternalLink,
  Laptop
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-3 border-t border-slate-200 bg-white/95 text-slate-600 text-xs shadow-xs print:hidden">
      {/* KHỐI NỘI DUNG CHÍNH: 3 CỘT GỌN GÀNG, ĐỘ CAO THẤP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
          {/* CỘT 1: THÔNG TIN DOANH NGHIỆP & PHẦN MỀM (5 CỘT) */}
          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                D
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">DigiTech Enterprise HRM</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                SaaS v3.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Giải pháp Chuyển đổi số Quản trị Nhân sự theo Bộ luật Lao động, Luật BHXH và Luật Thuế TNCN VN.
            </p>
            <div className="space-y-1 text-[11px] text-slate-600 pt-0.5">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Trụ sở chính: Tòa nhà DigiTech Tower, Khu Công Nghiệp VSIP, Việt Nam</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-900">Hotline: +84 963-084-246</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600">contact@digitech.vn</span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT 2: TẢI ỨNG DỤNG DI ĐỘNG & BẢN CÀI ĐẶT (4 CỘT) */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>TẢI ỨNG DỤNG NHÂN SỰ</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Chấm công GPS, xem phiếu lương và nộp đơn từ trực tiếp trên điện thoại:
            </p>
            
            {/* BADGES TẢI APP HÌNH THỨC TINH TẾ */}
            <div className="flex flex-wrap gap-2 pt-0.5">
              {/* iOS App Store */}
              <div 
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs group"
                title="Ứng dụng HRM trên Apple App Store"
              >
                <div className="w-4 h-4 flex items-center justify-center font-bold text-[13px] leading-none"></div>
                <div className="text-left leading-none">
                  <div className="text-[8px] text-slate-300 uppercase tracking-tight">Tải về trên</div>
                  <div className="text-[10px] font-bold">App Store</div>
                </div>
              </div>

              {/* Android Google Play */}
              <div 
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs group"
                title="Ứng dụng HRM trên Google Play Store"
              >
                <div className="w-4 h-4 flex items-center justify-center font-bold text-[11px] text-emerald-400 leading-none">▶</div>
                <div className="text-left leading-none">
                  <div className="text-[8px] text-slate-300 uppercase tracking-tight">Khám phá trên</div>
                  <div className="text-[10px] font-bold">Google Play</div>
                </div>
              </div>

              {/* Windows App */}
              <div 
                className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200"
                title="Bản cài đặt ứng dụng máy tính Windows PC"
              >
                <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-semibold">Windows PC</span>
              </div>
            </div>
          </div>

          {/* CỘT 3: KÊNH THEO DÕI & HỖ TRỢ TRỰC TUYẾN (3 CỘT) */}
          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>THEO DÕI & HỖ TRỢ</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Kết nối trực tiếp với đội ngũ kỹ thuật:
            </p>
            
            {/* SOCIAL / CHANNEL ICONS HÌNH THỨC GỌN NHẸ */}
            <div className="flex items-center space-x-2 pt-0.5">
              {/* Zalo Admin */}
              <a
                href="http://zalo.me/0963084246"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-[10px] shadow-2xs transition-transform hover:scale-105"
                title="Zalo Admin Hỗ Trợ: +84 963-084-246"
              >
                Zalo
              </a>

              {/* Facebook */}
              <div 
                className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer transition-transform hover:scale-105"
                title="Theo dõi DigiTech trên Facebook"
              >
                f
              </div>

              {/* YouTube */}
              <div 
                className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-[11px] shadow-2xs cursor-pointer transition-transform hover:scale-105"
                title="Xem video hướng dẫn trên YouTube"
              >
                ▶
              </div>

              {/* LinkedIn */}
              <div 
                className="w-7 h-7 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-[10px] shadow-2xs cursor-pointer transition-transform hover:scale-105"
                title="Mạng nghề nghiệp LinkedIn"
              >
                in
              </div>

              {/* Telegram */}
              <div 
                className="w-7 h-7 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 flex items-center justify-center font-bold text-[11px] shadow-2xs cursor-pointer transition-transform hover:scale-105"
                title="Kênh thông báo Telegram"
              >
                ✈
              </div>
            </div>
            
            <div className="text-[10px] text-slate-400 italic">
              Thời gian làm việc: T2 - T6 (09:00 - 18:00)
            </div>
          </div>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN CUỐI CÙNG: 2010 ĐẾN 2026 THEO YÊU CẦU */}
      <div className="border-t border-slate-200 bg-slate-50/90 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500 text-center sm:text-left">
          <div>
            <span>Bản quyền thuộc về </span>
            <b className="text-slate-800">DigiTech</b>
            <span> © 2010 - 2026. Bảo lưu mọi quyền.</span>
          </div>
          <div className="flex items-center space-x-3 text-[10px] text-slate-400">
            <span>Hệ thống Quản trị Nhân sự & Tiền lương chuẩn Luật Lao động Việt Nam</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Bảo mật ISO/IEC 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
