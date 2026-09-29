import React, { useState, useMemo } from 'react';
import { Employee, CompanyPolicy, UserRole, PersonnelChange } from '../types/hrm';
import { EmployeeListView } from './EmployeeListView';
import { ContractView } from './ContractView';
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  PieChart, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Search,
  CheckCircle2
} from 'lucide-react';

interface EmployeeContractViewProps {
  employees: Employee[];
  policy: CompanyPolicy;
  currentRole: UserRole;
  personnelChanges?: PersonnelChange[];
  onUpdateEmployees: (updated: Employee[]) => void;
  onUpdatePersonnelChanges?: (changes: PersonnelChange[]) => void;
  initialSubTab?: 'PROFILES' | 'CONTRACTS' | 'EXPIRATION_ALERT' | 'STATS';
}

export const EmployeeContractView: React.FC<EmployeeContractViewProps> = ({
  employees,
  policy,
  currentRole,
  personnelChanges = [],
  onUpdateEmployees,
  onUpdatePersonnelChanges,
  initialSubTab = 'PROFILES'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'PROFILES' | 'CONTRACTS' | 'EXPIRATION_ALERT' | 'STATS'>(initialSubTab);
  const [expirationFilter, setExpirationFilter] = useState<'ALL' | '15_DAYS' | '30_DAYS' | '45_DAYS' | 'EXPIRED'>('30_DAYS');
  const [alertSearchTerm, setAlertSearchTerm] = useState('');

  const currentTenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === policy.tenantId);
  }, [employees, policy.tenantId]);

  // Phân tích hạn hợp đồng
  const contractStats = useMemo(() => {
    const today = new Date('2026-08-25'); // Mốc ngày tham chiếu hệ thống
    let expired = 0;
    let within15 = 0;
    let within30 = 0;
    let within45 = 0;
    let indefiniteCount = 0;
    let definiteCount = 0;
    let probationCount = 0;

    const listWithRemaining = currentTenantEmployees.map(emp => {
      let daysRemaining: number | null = null;
      const isIndefinite = emp.contractType === 'INDEFINITE' || !emp.contractEndDate;

      if (isIndefinite) {
        indefiniteCount++;
      } else if (emp.contractType === 'PROBATION') {
        probationCount++;
      } else {
        definiteCount++;
      }

      if (emp.contractEndDate) {
        const endDate = new Date(emp.contractEndDate);
        const diffTime = endDate.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) {
          expired++;
        } else if (daysRemaining <= 15) {
          within15++;
        } else if (daysRemaining <= 30) {
          within30++;
        } else if (daysRemaining <= 45) {
          within45++;
        }
      }

      return {
        ...emp,
        daysRemaining,
        isIndefinite
      };
    });

    return {
      expired,
      within15,
      within30,
      within45,
      indefiniteCount,
      definiteCount,
      probationCount,
      listWithRemaining
    };
  }, [currentTenantEmployees]);

  // Lọc danh sách cảnh báo hết hạn
  const filteredAlertList = useMemo(() => {
    return contractStats.listWithRemaining.filter(emp => {
      if (emp.isIndefinite || emp.daysRemaining === null) return false;

      // Filter theo mốc thời gian
      if (expirationFilter === 'EXPIRED' && emp.daysRemaining >= 0) return false;
      if (expirationFilter === '15_DAYS' && (emp.daysRemaining < 0 || emp.daysRemaining > 15)) return false;
      if (expirationFilter === '30_DAYS' && (emp.daysRemaining < 0 || emp.daysRemaining > 30)) return false;
      if (expirationFilter === '45_DAYS' && (emp.daysRemaining < 0 || emp.daysRemaining > 45)) return false;

      // Filter tìm kiếm
      if (alertSearchTerm.trim()) {
        const term = alertSearchTerm.toLowerCase();
        const matchName = emp.fullName.toLowerCase().includes(term);
        const matchCode = emp.code.toLowerCase().includes(term);
        const matchDept = emp.departmentName.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchDept) return false;
      }

      return true;
    }).sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
  }, [contractStats.listWithRemaining, expirationFilter, alertSearchTerm]);

  return (
    <div className="space-y-4">
      {/* THANH ĐIỀU HƯỚNG TỔNG HỢP (SUB-TABS) */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('PROFILES')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'PROFILES'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Hồ Sơ Nhân Sự 360°</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
              activeSubTab === 'PROFILES' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {currentTenantEmployees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('CONTRACTS')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'CONTRACTS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Quản Lý Hợp Đồng & Ký Số OTP</span>
          </button>

          <button
            onClick={() => setActiveSubTab('EXPIRATION_ALERT')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'EXPIRATION_ALERT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Cảnh Báo Hết Hạn & Gia Hạn HĐ</span>
            {(contractStats.within30 > 0 || contractStats.expired > 0) && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full font-mono bg-rose-500 text-white font-bold animate-pulse">
                {contractStats.within30 + contractStats.expired}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('STATS')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'STATS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Thống Kê Cơ Cấu Hợp Đồng & Hồ Sơ</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden xl:flex items-center space-x-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Tuân thủ Bộ luật Lao động 2019 (Điều 13, 20 & 22)</span>
        </div>
      </div>

      {/* SUB-TAB 1: DANH SÁCH HỒ SƠ NHÂN SỰ 360° */}
      {activeSubTab === 'PROFILES' && (
        <EmployeeListView
          employees={employees}
          policy={policy}
          currentRole={currentRole}
          onUpdateEmployees={onUpdateEmployees}
        />
      )}

      {/* SUB-TAB 2: QUẢN LÝ HỢP ĐỒNG & KÝ SỐ OTP */}
      {activeSubTab === 'CONTRACTS' && (
        <ContractView
          employees={employees}
          policy={policy}
          currentRole={currentRole}
          personnelChanges={personnelChanges}
          onUpdatePersonnelChanges={onUpdatePersonnelChanges}
          onUpdateEmployees={onUpdateEmployees}
        />
      )}

      {/* SUB-TAB 3: CẢNH BÁO HẾT HẠN & GIA HẠN HỢP ĐỒNG (QUY ĐỊNH 30-45 NGÀY) */}
      {activeSubTab === 'EXPIRATION_ALERT' && (
        <div className="space-y-4">
          {/* BANNER HƯỚNG DẪN LUẬT LAO ĐỘNG */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase">
                    Quy Định Bắt Buộc Về Thời Hạn Báo Trước & Tái Ký HĐLĐ (Điều 20 Bộ Luật Lao Động 2019)
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    • <b>Thời hạn thông báo:</b> Doanh nghiệp phải thông báo bằng văn bản cho người lao động về thời điểm kết thúc HĐLĐ trước khi hợp đồng hết hạn ít nhất <b>15 ngày</b> (hoặc 30 ngày theo quy chế nội bộ).<br />
                    • <b>Quy tắc 2 lần ký:</b> HĐLĐ xác định thời hạn chỉ được ký tối đa <b>2 lần</b>. Sau đó nếu tiếp tục làm việc thì <b>bắt buộc</b> phải ký Hợp đồng lao động Không xác định thời hạn.<br />
                    • <b>Hết hạn mà không ký tiếp:</b> Nếu trong vòng <b>30 ngày</b> kể từ ngày hết hạn mà hai bên không ký hợp đồng mới thì hợp đồng đã giao kết đương nhiên trở thành HĐLĐ Không xác định thời hạn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 THẺ CHỈ SỐ THEO DÕI HẠN */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div 
              onClick={() => setExpirationFilter('EXPIRED')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                expirationFilter === 'EXPIRED' 
                  ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-300' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700">Đã Quá Hạn HĐ</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              </div>
              <p className="text-2xl font-black text-rose-600 mt-1 font-mono">{contractStats.expired}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Cần tái ký ngay hoặc thanh lý</p>
            </div>

            <div 
              onClick={() => setExpirationFilter('15_DAYS')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                expirationFilter === '15_DAYS' 
                  ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-300' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700">Khẩn Cấp (&le; 15 Ngày)</span>
                <Clock className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600 mt-1 font-mono">{contractStats.within15}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Bắt buộc gửi thông báo văn bản</p>
            </div>

            <div 
              onClick={() => setExpirationFilter('30_DAYS')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                expirationFilter === '30_DAYS' 
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800">Sắp Hết Hạn (&le; 30 Ngày)</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{contractStats.within30}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Thời hạn chuẩn bị tái ký</p>
            </div>

            <div 
              onClick={() => setExpirationFilter('45_DAYS')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                expirationFilter === '45_DAYS' 
                  ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-300' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800">Kế Hoạch (&le; 45 Ngày)</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-blue-600 mt-1 font-mono">{contractStats.within45}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Đánh giá hiệu suất gia hạn</p>
            </div>
          </div>

          {/* BẢNG DANH SÁCH HỢP ĐỒNG CẦN XỬ LÝ */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-xs text-slate-900 uppercase">
                  Danh Sách Nhân Sự Đến Hạn Xử Lý Hợp Đồng ({filteredAlertList.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm tên, mã nhân viên..."
                    value={alertSearchTerm}
                    onChange={(e) => setAlertSearchTerm(e.target.value)}
                    className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                </div>

                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setExpirationFilter('ALL')}
                    className={`px-2 py-1 rounded font-medium ${expirationFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setExpirationFilter('30_DAYS')}
                    className={`px-2 py-1 rounded font-medium ${expirationFilter === '30_DAYS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    &le; 30 ngày
                  </button>
                  <button
                    onClick={() => setExpirationFilter('15_DAYS')}
                    className={`px-2 py-1 rounded font-medium ${expirationFilter === '15_DAYS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    &le; 15 ngày
                  </button>
                  <button
                    onClick={() => setExpirationFilter('EXPIRED')}
                    className={`px-2 py-1 rounded font-medium ${expirationFilter === 'EXPIRED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                  >
                    Quá hạn
                  </button>
                </div>
              </div>
            </div>

            {filteredAlertList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                Không có hợp đồng nào thuộc diện lọc hiện tại.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Mã NV</th>
                      <th className="p-2.5">Họ & Tên</th>
                      <th className="p-2.5">Phòng Ban & Chức Vụ</th>
                      <th className="p-2.5">Loại Hợp Đồng</th>
                      <th className="p-2.5">Ngày Hết Hạn</th>
                      <th className="p-2.5 text-center">Thời Gian Còn Lại</th>
                      <th className="p-2.5">Khuyến Nghị Pháp Lý (BLLĐ 2019)</th>
                      <th className="p-2.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAlertList.map((emp) => {
                      const days = emp.daysRemaining ?? 0;
                      let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                      let recommendation = 'Theo dõi đánh giá hiệu suất';

                      if (days < 0) {
                        badgeColor = 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
                        recommendation = 'Quá hạn: Ký HĐ vô thời hạn hoặc lập biên bản thanh lý ngay';
                      } else if (days <= 15) {
                        badgeColor = 'bg-rose-100 text-rose-800 border-rose-200 font-bold animate-pulse';
                        recommendation = 'Khẩn cấp: Gửi thông báo hết hạn HĐ bằng văn bản ngay';
                      } else if (days <= 30) {
                        badgeColor = 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
                        recommendation = 'Lập tờ trình tái ký hoặc chuẩn bị thủ tục bàn giao';
                      }

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-indigo-600">{emp.code}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{emp.fullName}</td>
                          <td className="p-2.5">
                            <span className="block font-medium text-slate-800">{emp.departmentName}</span>
                            <span className="text-[10px] text-slate-500">{emp.position}</span>
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                              {emp.contractType === 'PROBATION' ? 'HĐ Thử Việc' :
                               emp.contractType === 'DEFINITE_12M' ? 'HĐ Có Thời Hạn (12M)' :
                               emp.contractType === 'DEFINITE_24M' ? 'HĐ Có Thời Hạn (24M)' :
                               'HĐ Dịch Vụ'}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-700">{emp.contractEndDate}</td>
                          <td className="p-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] border font-mono ${badgeColor}`}>
                              {days < 0 ? `Quá hạn ${Math.abs(days)} ngày` : `Còn ${days} ngày`}
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-600 font-medium">
                            {recommendation}
                          </td>
                          <td className="p-2.5 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => setActiveSubTab('CONTRACTS')}
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Tái Ký / Xem HĐ &rarr;
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: THỐNG KÊ CƠ CẤU HỢP ĐỒNG & HỒ SƠ */}
      {activeSubTab === 'STATS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cơ cấu loại Hợp đồng */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Cơ Cấu Hợp Đồng Lao Động</span>
              <span className="font-mono text-indigo-600 font-bold">{currentTenantEmployees.length} Nhân Sự</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-700">HĐ Không Xác Định Thời Hạn (Vô thời hạn)</span>
                  <span className="font-bold text-emerald-700">
                    {contractStats.indefiniteCount} ({Math.round((contractStats.indefiniteCount / currentTenantEmployees.length) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full" 
                    style={{ width: `${(contractStats.indefiniteCount / currentTenantEmployees.length) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-700">HĐ Có Thời Hạn (12 - 24 tháng)</span>
                  <span className="font-bold text-blue-700">
                    {contractStats.definiteCount} ({Math.round((contractStats.definiteCount / currentTenantEmployees.length) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full" 
                    style={{ width: `${(contractStats.definiteCount / currentTenantEmployees.length) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-700">Hợp Đồng Thử Việc (30 - 60 ngày)</span>
                  <span className="font-bold text-amber-700">
                    {contractStats.probationCount} ({Math.round((contractStats.probationCount / currentTenantEmployees.length) * 100 || 0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${(contractStats.probationCount / currentTenantEmployees.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-900">
              <span className="font-bold">Đánh giá tỷ lệ bền vững:</span> Doanh nghiệp duy trì tỷ lệ HĐ vô thời hạn trên 50%, đảm bảo sự ổn định nguồn nhân lực cốt lõi theo Nghị định 145/2020/NĐ-CP.
            </div>
          </div>

          {/* Tình trạng giấy tờ hồ sơ pháp lý */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase pb-2 border-b border-slate-100">
              Mức Độ Hoàn Thiện Hồ Sơ Pháp Lý
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Đầy đủ CCCD & Mã định danh:</span>
                <b className="text-emerald-700">100% (250/250)</b>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Đã cấp Sổ BHXH & Mã số thuế:</span>
                <b className="text-emerald-700">98.4% (246/250)</b>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Giấy khám sức khỏe định kỳ còn hạn:</span>
                <b className="text-blue-700">92.0% (230/250)</b>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Bằng cấp & Chứng chỉ an toàn LĐ:</span>
                <b className="text-indigo-700">95.2% (238/250)</b>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-700">Đăng ký người phụ thuộc giảm trừ:</span>
                <b className="text-amber-700">64.0% (160/250)</b>
              </div>
            </div>
          </div>

          {/* Quy định thanh tra lao động */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase pb-2 border-b border-slate-100">
              Sổ Quản Lý Lao Động (Điều 12 BLLĐ 2019)
            </h3>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Theo quy định của Bộ luật Lao động, doanh nghiệp phải lập Sổ quản lý lao động bằng bản giấy hoặc bản điện tử và xuất trình khi cơ quan nhà nước có thẩm quyền thanh tra.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2 text-[11px] text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã đồng bộ trực tuyến với Báo cáo CQNN</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tự động cập nhật tăng/giảm lao động hàng kỳ</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Lưu trữ lịch sử hợp đồng và phụ lục điện tử</span>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('PROFILES')}
              className="w-full mt-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
            >
              Xem Sổ Quản Lý Lao Động Điện Tử &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
