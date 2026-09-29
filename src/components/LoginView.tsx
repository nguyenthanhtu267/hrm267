import React, { useState } from 'react';
import { Employee } from '../types/hrm';
import { Fingerprint, LogIn, Building2, User, KeyRound, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  employees: Employee[];
  onLogin: (emp: Employee) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ employees, onLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setErrorMsg('Vui lòng nhập Mã nhân viên (VD: AF-001)');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Simulate network delay for effect
    setTimeout(() => {
      const found = employees.find(
        emp => emp.code.toLowerCase() === loginId.trim().toLowerCase()
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px] opacity-40"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900/80 to-slate-900/80 border-r border-white/10">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">HRM Enterprise</h1>
                <p className="text-indigo-200 text-sm font-medium">SaaS v3.0 • Phiên bản Demo</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">
              Hệ thống quản trị nguồn nhân lực toàn diện. Tối ưu hóa quy trình Tuyển dụng, Đào tạo, Chấm công, Tiền lương và Quản lý văn hóa doanh nghiệp.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>Hướng dẫn Đăng nhập Demo</span>
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>GĐ: <b className="text-white">AF-001</b> (Nguyễn Văn Hùng)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>HR: <b className="text-white">AF-002</b> (Trần Thị Thu Trang)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span>Nhân viên: <b className="text-white">AF-004</b> (Phạm Thị Lan)</span>
                </li>
              </ul>
            </div>
            <p className="text-[10px] text-slate-500 text-center">
              © 2026 DigiTech Enterprise. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đăng Nhập</h2>
            <p className="text-sm text-slate-500 mt-2">Vui lòng nhập mã nhân viên để truy cập không gian làm việc</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Mã nhân viên / ID</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Ví dụ: AF-001"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono font-bold text-slate-800 placeholder:font-sans placeholder:font-normal uppercase"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value="DEMO-PASSWORD-IGNORE"
                  readOnly
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed outline-none font-mono"
                />
              </div>
              <p className="text-xs text-slate-400 ml-1 mt-1 flex justify-between">
                <span>(Mật khẩu đã được tự động điền trong bản Demo)</span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl border border-rose-200 animate-in fade-in slide-in-from-top-2 flex items-start space-x-2">
                <div className="mt-0.5">•</div>
                <p>{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all flex justify-center items-center group relative overflow-hidden disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-base relative z-10">Đăng Nhập Ngay</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 h-full w-0 bg-indigo-600 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center space-x-4">
            <span className="text-xs text-slate-400 font-medium hover:text-slate-600 cursor-pointer transition-colors">Quên mật khẩu?</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="text-xs text-slate-400 font-medium hover:text-slate-600 cursor-pointer transition-colors">Liên hệ IT Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};
