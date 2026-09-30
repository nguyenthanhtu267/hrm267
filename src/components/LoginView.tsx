import React, { useState, useEffect } from 'react';
import { Employee } from '../types/hrm';
import { Fingerprint, LogIn, Building2, User, KeyRound, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  employees: Employee[];
  onLogin: (emp: Employee) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ employees, onLogin }) => {
  const [loginId, setLoginId] = useState('AF-002');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('login-btn')?.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLoginId = loginId.trim() || 'AF-002';

    setIsLoading(true);
    setErrorMsg('');

    // Simulate network delay for effect
    setTimeout(() => {
      const found = employees.find(
        emp => emp.code.toLowerCase() === finalLoginId.toLowerCase()
      );
      
      if (found) {
        onLogin(found);
      } else {
        setErrorMsg('Không tìm thấy nhân viên với mã này. Hãy thử mã AF-001 hoặc AF-002.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-2 relative overflow-hidden font-sans selection:bg-indigo-200">
      {/* 🌟 Nền Họa Tiết Vector Sáng & Hiện Đại */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Blob gradients */}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[60%] bg-gradient-to-br from-indigo-200/50 to-blue-200/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-emerald-100/50 to-teal-100/50 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-gradient-to-tr from-amber-100/40 to-orange-100/40 rounded-full blur-[80px]"></div>
        
        {/* Vector Sóng Nhẹ (SVG Data URI) */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1440' height='800' viewBox='0 0 1440 800'%3E%3Cpath fill='%234338ca' fill-opacity='1' d='M0,256L48,272C96,288,192,320,288,320C384,320,480,288,576,288C672,288,768,320,864,309.3C960,299,1056,245,1152,229.3C1248,213,1344,235,1392,245.3L1440,256L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z'%3E%3C/path%3E%3C/svg%3E\")", backgroundSize: 'cover', backgroundPosition: 'bottom' }}></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(99, 102, 241, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* 🏢 Glassmorphism Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] overflow-hidden shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] relative z-10">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-50/80 via-white/50 to-blue-50/80 border-r border-slate-100/50 relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Fingerprint className="w-48 h-48 text-indigo-900" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white border border-indigo-400/30">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">HRM Enterprise</h1>
                <p className="text-indigo-600 font-bold text-sm tracking-wide uppercase mt-0.5">SaaS v3.0 • Premium</p>
              </div>
            </div>
            
            <p className="text-slate-600 leading-relaxed text-[15px] font-medium pr-8">
              Hệ thống quản trị nguồn nhân lực toàn diện. Tối ưu hóa quy trình Tuyển dụng, Đào tạo, Chấm công, Tiền lương và Quản trị vận hành doanh nghiệp.
            </p>
          </div>

          <div className="space-y-2 relative z-10 mt-12">
            <div className="p-2.5 bg-white/80 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-sm">
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2 mb-3">
                <KeyRound className="w-4 h-4 text-emerald-500" />
                <span>Tài Khoản Demo Trải Nghiệm</span>
              </h3>
              <ul className="space-y-3 text-[13px] text-slate-600 font-medium">
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[10px]">GĐ</div>
                  <span>Nguyễn Văn Hùng: <b className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">AF-001</b></span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">HR</div>
                  <span>Trần Thị Thu Trang: <b className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">AF-002</b></span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">NV</div>
                  <span>Phạm Thị Lan: <b className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">AF-004</b></span>
                </li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              © 2026 DigiTech Enterprise. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-10 md:p-14 flex flex-col justify-center bg-white/60 backdrop-blur-3xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 text-center mb-10">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-1.5 border border-indigo-100 shadow-sm">
              <User className="w-7 h-7" />
            </div>
            <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Chào mừng<br/>quay trở lại!</h2>
            <p className="text-[15px] text-slate-500 mt-2 font-medium">Truy cập không gian làm việc số của bạn</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 relative z-10 w-full max-w-sm mx-auto">
            {/* Hộp Thông tin Nhanh */}
            <div className="p-2 bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 rounded-2xl text-center shadow-xs">
              <p className="text-indigo-900 font-bold text-sm">Đăng nhập bằng 1 chạm</p>
              <p className="text-indigo-600 text-xs mt-1 font-medium">Tài khoản mặc định: Giám Đốc Nhân Sự</p>
              <p className="text-slate-500 text-[11px] mt-1.5 flex items-center justify-center gap-1">
                <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 shadow-xs">Enter</span> hoặc click Đăng Nhập
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl border border-rose-200 animate-in fade-in slide-in-from-top-2 flex items-start space-x-2 shadow-xs">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all flex justify-center items-center group relative overflow-hidden disabled:opacity-70 disabled:cursor-wait border border-transparent hover:border-indigo-500"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-[15px] relative z-10 uppercase tracking-wider">Đăng Nhập Ngay</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform relative z-10" />
                  <div className="absolute inset-0 h-full w-0 bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-200/60 flex items-center justify-center space-x-6 relative z-10">
            <span className="text-[13px] text-slate-500 font-bold hover:text-indigo-600 cursor-pointer transition-colors">Quên mật khẩu?</span>
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
            <span className="text-[13px] text-slate-500 font-bold hover:text-indigo-600 cursor-pointer transition-colors">Liên hệ IT Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};
