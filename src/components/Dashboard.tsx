import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Building, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Milk,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Award,
  Briefcase,
  Activity,
  CheckCheck,
  BadgePercent
} from 'lucide-react';
import { Employee, AttendanceRecord, WorkflowRequest, CompanyPolicy, UserRole } from '../types/hrm';
import { NavTab } from './Sidebar';
import { TvplWidget } from './TvplWidget';
import { BannerAd } from './BannerAd';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  requests: WorkflowRequest[];
  policy: CompanyPolicy;
  currentRole: UserRole;
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  employees,
  attendance,
  requests,
  policy,
  currentRole,
  onNavigate,
}) => {
  const [activeDashboardTab, setActiveDashboardTab] = useState<'OVERVIEW' | 'ANALYTICS' | 'COMPLIANCE'>('OVERVIEW');

  const currentTenantEmployees = employees.filter(e => e.tenantId === policy.tenantId);
  const totalRecords = currentTenantEmployees.length;

  const officialCount = currentTenantEmployees.filter(e => e.status === 'OFFICIAL').length;
  const probationCount = currentTenantEmployees.filter(e => e.status === 'PROBATION').length;
  const noticeCount = currentTenantEmployees.filter(e => e.status === 'NOTICE_PERIOD').length;
  const suspendedCount = currentTenantEmployees.filter(e => e.status === 'SUSPENDED').length;
  const resignedCount = currentTenantEmployees.filter(e => e.status === 'RESIGNED').length;
  const dismissedCount = currentTenantEmployees.filter(e => e.status === 'DISMISSED').length;

  // Nhân sự đang làm việc: Chính thức + Thử việc + Đang báo trước + Tạm hoãn
  const activeEmployees = currentTenantEmployees.filter(e => e.status !== 'RESIGNED' && e.status !== 'DISMISSED');
  const offboardedCount = resignedCount + dismissedCount; // Đã thôi việc / sa thải

  const contractorCount = currentTenantEmployees.filter(e => e.isCivilContractor).length;
  const toxicEmployees = currentTenantEmployees.filter(e => e.toxicTier > 0).length;

  const todayPresent = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const todayLate = attendance.filter(a => a.status === 'LATE').length;
  const todayOnline = attendance.filter(a => a.status === 'ONLINE_WORK').length;

  const pendingRequests = requests.filter(r => r.tenantId === policy.tenantId && r.status === 'PENDING');

  // Ước tính quỹ lương tháng
  const totalBaseSalary = activeEmployees.reduce((sum, e) => sum + (e.baseSalary || 0) + (e.positionSalary || 0), 0);

  // 1. Thống kê phân bổ nhân lực theo phòng ban
  const deptDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {};
    activeEmployees.forEach(emp => {
      const dept = emp.departmentName || 'Khác';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    const total = activeEmployees.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeEmployees]);

  // 2. Biến động quỹ lương và thu nhập bình quân 6 tháng gần nhất
  const payrollTrend = [
    { month: 'T3/26', fund: 3.42, avg: 12.8, height: 58 },
    { month: 'T4/26', fund: 3.51, avg: 13.1, height: 63 },
    { month: 'T5/26', fund: 3.65, avg: 13.4, height: 70 },
    { month: 'T6/26', fund: 3.72, avg: 13.6, height: 75 },
    { month: 'T7/26', fund: 3.88, avg: 14.1, height: 83 },
    { month: 'T8/26', fund: 3.96, avg: 14.3, height: 90 },
  ];

  // 3. Tỷ lệ chấm công & phân bổ hôm nay
  const attendanceRate = activeEmployees.length > 0 ? Math.round((todayPresent / activeEmployees.length) * 100) : 94;
  const lateRate = activeEmployees.length > 0 ? Math.round((todayLate / activeEmployees.length) * 100) : 4;
  const leaveRate = Math.max(0, 100 - attendanceRate);

  // 4. Cơ cấu loại hình HĐLĐ
  const contractBreakdown = React.useMemo(() => {
    const indefinite = currentTenantEmployees.filter(e => e.contractType === 'INDEFINITE').length;
    const definite = currentTenantEmployees.filter(e => e.contractType === 'DEFINITE_12_36' || e.contractType === 'DEFINITE').length;
    const probation = currentTenantEmployees.filter(e => e.contractType === 'PROBATION' || e.status === 'PROBATION').length;
    const contractor = currentTenantEmployees.filter(e => e.isCivilContractor).length;
    const total = currentTenantEmployees.length || 1;
    return [
      { label: 'HĐ Không xác định thời hạn (KXDTH)', count: indefinite, pct: Math.round((indefinite / total) * 100), color: 'bg-emerald-500', barColor: 'bg-emerald-600' },
      { label: 'HĐ Có thời hạn (12-36 tháng)', count: definite, pct: Math.round((definite / total) * 100), color: 'bg-indigo-500', barColor: 'bg-indigo-600' },
      { label: 'HĐ Thử việc & Học nghề', count: probation, pct: Math.round((probation / total) * 100), color: 'bg-amber-500', barColor: 'bg-amber-600' },
      { label: 'Cộng tác viên / HĐ Khoán việc', count: contractor, pct: Math.round((contractor / total) * 100), color: 'bg-sky-500', barColor: 'bg-sky-600' },
    ];
  }, [currentTenantEmployees]);

  return (
    <div className="space-y-3 animate-fade-in-up">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl px-5 py-3 text-white shadow-lg hover-lift flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {policy.industry === 'MANUFACTURING' ? 'Sản Xuất & Nhà Máy' : 'Công Nghệ & Dịch Vụ'}
            </span>
            <span className="text-[11px] text-indigo-300">MST: {policy.taxCode}</span>
          </div>
          <h1 className="text-lg font-bold mt-0.5 tracking-tight">{policy.companyName}</h1>
          <p className="text-[11px] text-indigo-200 mt-0.5">
            Chu kỳ lương: {policy.payrollCycleType === 'CYCLE_26_TO_25' ? 'Ngày 26 đến 25 hàng tháng' : 'Mùng 01 đến cuối tháng'} • Căn cứ theo BLLĐ và các văn bản quy phạm pháp luật hiệu lực hiện hành
          </p>
        </div>

        {/* 3 Tab điều hướng Dashboard để xem trọn vẹn ở trang đầu */}
        <div className="flex items-center space-x-1.5 bg-white/10 p-1 rounded-xl border border-white/15 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveDashboardTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeDashboardTab === 'OVERVIEW'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Tổng Quan Điều Hành</span>
          </button>
          <button
            onClick={() => setActiveDashboardTab('ANALYTICS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeDashboardTab === 'ANALYTICS'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Thống Kê Cơ Cấu & Chi Phí</span>
          </button>
          <button
            onClick={() => setActiveDashboardTab('COMPLIANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeDashboardTab === 'COMPLIANCE'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Đơn Từ & Tuân Thủ</span>
            {pendingRequests.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Banner Quảng Cáo (Horizontal) */}
      <div className="mb-4">
        <BannerAd
          id="dashboard-banner-1"
          variant="horizontal"
          badge="CHỈ 3 NGÀY"
          title="Giảm 50% gói tin nổi bật"
          subtitle="Tin của bạn lên đầu trang tìm kiếm trong 7 ngày, tiếp cận hàng ngàn ứng viên."
          ctaText="Nhận ưu đãi"
          href={policy.promoBannerLink || "https://tuyendungvieclam.vercel.app/"}
          bgClass="bg-gradient-to-r from-rose-900 to-red-900 border border-rose-500/30"
        />
      </div>

      {/* 4 Thẻ KPI chính luôn hiển thị thu gọn */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Thẻ 1: Tổng nhân sự với định dạng dấu chấm phân cách hàng ngàn & giải thích rõ ràng */}
        <div 
          onClick={() => onNavigate('EMPLOYEES')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Quy Mô Nhân Sự</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-slate-900">{activeEmployees.length.toLocaleString('vi-VN')}</span>
            <span className="text-[11px] text-slate-500">đang làm / <b className="text-slate-700">{totalRecords.toLocaleString('vi-VN')}</b> tổng hồ sơ</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-600">
            <span>• Chính thức: <b className="text-emerald-700">{officialCount.toLocaleString('vi-VN')}</b></span>
            <span>• Thử việc: <b className="text-blue-700">{probationCount.toLocaleString('vi-VN')}</b></span>
            <span>• Tạm hoãn/Chờ nghỉ: <b className="text-amber-700">{(noticeCount + suspendedCount).toLocaleString('vi-VN')}</b></span>
            <span>• Đã thôi việc: <b className="text-slate-400">{offboardedCount.toLocaleString('vi-VN')}</b></span>
          </div>
        </div>

        {/* Thẻ 2: Đi làm hôm nay */}
        <div 
          onClick={() => onNavigate('ATTENDANCE')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Đi Làm Hôm Nay</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-slate-900">{todayPresent.toLocaleString('vi-VN')}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              ({activeEmployees.length > 0 ? ((todayPresent / activeEmployees.length) * 100).toFixed(0) : 100}%)
            </span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span className="text-amber-600">Muộn: <b>{todayLate.toLocaleString('vi-VN')}</b></span>
            <span className="text-blue-600">Online: <b>{todayOnline.toLocaleString('vi-VN')}</b></span>
          </div>
        </div>

        {/* Thẻ 3: Quỹ lương dự kiến */}
        <div 
          onClick={() => onNavigate('PAYROLL')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Quỹ Lương Ước Tính</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-bold text-slate-900">{(totalBaseSalary / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</span>
            <span className="text-[10px] font-semibold text-slate-600">triệu VNĐ</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span>Công chuẩn: <b>{policy.standardWorkDaysPerMonth} ngày</b></span>
            <span className="text-indigo-600 font-semibold">Bảng lương →</span>
          </div>
        </div>

        {/* Thẻ 4: Đơn từ chờ duyệt */}
        <div 
          onClick={() => onNavigate('REQUESTS')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Đơn Chờ Phê Duyệt</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-amber-600">{pendingRequests.length.toLocaleString('vi-VN')}</span>
            <span className="text-[10px] text-slate-500">yêu cầu cần duyệt</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
            <span className="flex items-center space-x-1">
              <Milk className="w-3 h-3 text-amber-500" />
              <span>Độc hại: <b>{toxicEmployees.toLocaleString('vi-VN')}</b></span>
            </span>
            <span className="text-indigo-600 font-semibold">Xem ngay →</span>
          </div>
        </div>
      </div>

      {/* TAB 1: TỔNG QUAN ĐIỀU HÀNH */}
      {activeDashboardTab === 'OVERVIEW' && (
        <div className="space-y-3">
          {/* HÀNG 1: 3 BẢNG (Hàng đợi phê duyệt, Cảnh báo tuân thủ, Phân bổ nhân lực) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* BẢNG 1: Hàng đợi phê duyệt */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-xs text-slate-900 uppercase">Hàng Đợi Phê Duyệt Đơn Từ</h3>
                  </div>
                  <button
                    onClick={() => onNavigate('REQUESTS')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold"
                  >
                    Xem tất cả ({requests.length.toLocaleString('vi-VN')}) →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto pr-1">
                  {pendingRequests.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                      Không có đơn từ nào cần duyệt.
                    </div>
                  ) : (
                    pendingRequests.slice(0, 3).map((req) => (
                      <div key={req.id} className="py-1.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                            {req.type === 'LEAVE' ? 'Phép' : req.type === 'OVERTIME' ? 'OT' : 'T.Ứng'}
                          </div>
                          <div className="truncate max-w-[150px]">
                            <p className="text-[11px] font-bold text-slate-900 truncate">{req.title}</p>
                            <p className="text-[10px] text-slate-500 truncate">{req.employeeName} • {req.departmentName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('REQUESTS')}
                          className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md transition-colors shrink-0 cursor-pointer"
                        >
                          Duyệt
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Chờ duyệt: <b className="text-amber-600">{pendingRequests.length.toLocaleString('vi-VN')}</b> đơn</span>
                <span className="text-slate-400">Ưu tiên đơn nghỉ phép dài</span>
              </div>
            </div>

            {/* BẢNG 2: Cảnh báo tuân thủ BLLĐ 2019 */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-xs text-slate-900 uppercase">Cảnh Báo Tuân Thủ BLLĐ 2019</h3>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    Chuẩn pháp lý
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                    <b>✓ 5 NLĐ Chưa Thành Niên (15-18t):</b> Max 7h/ngày, không ca đêm.
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-950">
                    <b>✓ 12 NLĐ Cao Tuổi (Đ.149):</b> HĐLĐ nhiều lần, miễn BHTN.
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-950">
                    <b>Hiện vật độc hại TT 24/2022:</b> Bắt buộc cấp sữa/đường tại ca.
                  </div>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Độc hại: <b className="text-amber-600">{toxicEmployees.toLocaleString('vi-VN')}</b> NLĐ</span>
                <span className="text-emerald-600 font-medium">100% tuân thủ</span>
              </div>
            </div>

            {/* Banner Quảng Cáo (Square) */}
            <div className="mt-2">
              <BannerAd
                id="dashboard-banner-2"
                variant="square"
                badge="ĐỘC QUYỀN VIP"
                title="Quản lý suất ăn AI"
                subtitle="Chấm ăn tự động bằng nhận diện khuôn mặt, chống thất thoát. Trải nghiệm miễn phí 30 ngày."
                ctaText="Kích hoạt ngay"
                href={policy.promoBannerLink || "https://tuyendungvieclam.vercel.app/"}
                bgClass="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/30"
              />
            </div>

            {/* BẢNG 3: Phân Bổ Nhân Lực Theo Phòng Ban */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Phân Bổ Nhân Lực Theo Phòng Ban</h4>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    {activeEmployees.length.toLocaleString('vi-VN')} NS
                  </span>
                </div>

                <div className="space-y-2">
                  {deptDistribution.slice(0, 4).map((d, i) => {
                    const colors = [
                      'bg-indigo-600',
                      'bg-blue-600',
                      'bg-emerald-600',
                      'bg-amber-500',
                      'bg-purple-600',
                    ];
                    const barColor = colors[i % colors.length];
                    return (
                      <div key={d.name} className="space-y-0.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 truncate max-w-[170px]">{d.name}</span>
                          <div className="space-x-1 shrink-0 text-slate-600 text-[10px]">
                            <span className="font-bold text-slate-900">{d.count.toLocaleString('vi-VN')} NS</span>
                            <span className="text-slate-400">({d.percent}%)</span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor} transition-all duration-500`}
                            style={{ width: `${Math.max(5, d.percent)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Khối sản xuất chiếm ~65%</span>
                <button 
                  onClick={() => onNavigate('ORG_CHART')}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-[10px] cursor-pointer"
                >
                  Sơ đồ tổ chức →
                </button>
              </div>
            </div>
          </div>

          {/* HÀNG 2: 3 BẢNG (Biến động quỹ lương, Tỷ lệ tuân thủ, Cơ cấu loại hình HĐLĐ) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* BẢNG 4: Biến Động Quỹ Lương & Thu Nhập (6 Tháng) */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Biến Động Quỹ Lương &amp; Thu Nhập (6 Tháng)</h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    +4.2%
                  </span>
                </div>

                {/* Biểu đồ cột SVG / HTML Bar Chart */}
                <div className="h-28 flex items-end justify-between gap-1.5 pt-2 px-1">
                  {payrollTrend.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 group">
                      <span className="text-[8px] font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.fund}T
                      </span>
                      <div className="w-full bg-slate-100 rounded-t h-20 flex items-end p-0.5 overflow-hidden">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 hover:to-indigo-400 rounded-t transition-all duration-300"
                          style={{ height: `${item.height}%` }}
                          title={`Tháng ${item.month}: Quỹ lương ${item.fund} tỷ VNĐ - Thu nhập TB: ${item.avg} tr/tháng`}
                        ></div>
                      </div>
                      <span className="text-[9px] font-medium text-slate-600">{item.month}</span>
                      <span className="text-[8px] font-mono text-slate-400">{item.avg}tr</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center space-x-2 text-[9px]">
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-xs bg-indigo-600"></span>
                    <span>Quỹ lương (Tỷ)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-xs bg-slate-400"></span>
                    <span>TB (Tr/người)</span>
                  </span>
                </div>
                <button 
                  onClick={() => onNavigate('PAYROLL')}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-[10px] cursor-pointer"
                >
                  Bảng lương →
                </button>
              </div>
            </div>

            {/* BẢNG 5: Tỷ Lệ Tuân Thủ Chấm Công & Đi Làm */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Tỷ Lệ Tuân Thủ Chấm Công &amp; Đi Làm</h4>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    Đúng giờ: {attendanceRate}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 items-center">
                  {/* Vòng tròn trực quan */}
                  <div className="flex flex-col items-center justify-center p-1.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="relative w-18 h-18 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-emerald-500 transition-all duration-700"
                          strokeDasharray={`${attendanceRate}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-bold text-slate-900 leading-none">{attendanceRate}%</span>
                        <span className="text-[8px] text-slate-500 mt-0.5">Hiện diện</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium mt-0.5">ISO 9001</span>
                  </div>

                  {/* Danh sách chỉ số */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-1 rounded bg-emerald-50/70 border border-emerald-100 text-[10px]">
                      <span className="text-emerald-900 font-medium truncate">Đúng giờ:</span>
                      <b className="text-emerald-700 shrink-0">{todayPresent} NS</b>
                    </div>
                    <div className="flex items-center justify-between p-1 rounded bg-amber-50/70 border border-amber-100 text-[10px]">
                      <span className="text-amber-900 font-medium truncate">Đi muộn:</span>
                      <b className="text-amber-700 shrink-0">{todayLate} NS</b>
                    </div>
                    <div className="flex items-center justify-between p-1 rounded bg-rose-50/70 border border-rose-100 text-[10px]">
                      <span className="text-rose-900 font-medium truncate">Nghỉ phép:</span>
                      <b className="text-rose-700 shrink-0">{Math.max(0, activeEmployees.length - todayPresent)} NS</b>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>OT TB: <b>1.2h/ca</b> (An toàn)</span>
                <button 
                  onClick={() => onNavigate('ATTENDANCE')}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-[10px] cursor-pointer"
                >
                  Chấm công →
                </button>
              </div>
            </div>

            {/* BẢNG 6: Cơ Cấu Loại Hình HĐLĐ & Thâm Niên */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Cơ Cấu Loại Hình HĐLĐ &amp; Thâm Niên</h4>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                    Giữ chân 96.2%
                  </span>
                </div>

                <div className="space-y-1.5">
                  {contractBreakdown.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 truncate max-w-[170px]">{item.label}</span>
                        <div className="space-x-1 shrink-0 text-slate-600 text-[10px]">
                          <span className="font-bold text-slate-900">{item.count} HĐ</span>
                          <span className="text-slate-400">({item.pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                          style={{ width: `${Math.max(4, item.pct)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span className="text-[10px]">Thâm niên &gt;3 năm: <b className="text-emerald-700">62.8%</b></span>
                <button 
                  onClick={() => onNavigate('CONTRACTS')}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-[10px] cursor-pointer"
                >
                  Hợp đồng →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THỐNG KÊ CƠ CẤU & CHI PHÍ */}
      {activeDashboardTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          {/* Biểu đồ Giới tính & Độ tuổi */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-md glass hover-lift transition-all space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h3 className="font-bold text-xs text-slate-900 uppercase">Cơ Cấu Giới Tính & Độ Tuổi</h3>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">{activeEmployees.length.toLocaleString('vi-VN')} NS</span>
            </div>

            <div>
              <div className="flex justify-between text-[10.5px] mb-1 font-semibold">
                <span className="text-blue-700">Nam: 60%</span>
                <span className="text-pink-700">Nữ: 40%</span>
              </div>
              <div className="w-full h-2 bg-pink-200 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full" style={{ width: '60%' }}></div>
                <div className="bg-pink-500 h-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10.5px] pt-0.5">
              <div className="flex justify-between text-slate-600"><span>18-30 tuổi:</span><b className="text-emerald-700">42.5%</b></div>
              <div className="flex justify-between text-slate-600"><span>31-45 tuổi:</span><b className="text-indigo-700">38.3%</b></div>
              <div className="flex justify-between text-slate-600"><span>46-60 tuổi:</span><b className="text-blue-700">18.5%</b></div>
              <div className="flex justify-between text-slate-600"><span>&gt; 60 tuổi:</span><b className="text-purple-700">0.7%</b></div>
            </div>
          </div>

          {/* Hiệu suất định biên 3 Cơ sở */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-md glass hover-lift transition-all space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h3 className="font-bold text-xs text-slate-900 uppercase">Định Biên Cơ Sở</h3>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">TB: 94.2%</span>
            </div>

            <div className="space-y-1.5 text-[10.5px]">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="font-semibold text-slate-800">Nhà máy Bình Dương</span>
                  <span className="font-bold text-emerald-700">96.5%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '96.5%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="font-semibold text-slate-800">Nhà máy Long An</span>
                  <span className="font-bold text-indigo-700">92.8%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '92.8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span className="font-semibold text-slate-800">VP Điều Hành TP.HCM</span>
                  <span className="font-bold text-blue-700">98.0%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Phân bổ quỹ lương TK 622/627/641/642 */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-md glass hover-lift transition-all space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h3 className="font-bold text-xs text-slate-900 uppercase">Phân Bổ Chi Phí Lương</h3>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">TT 200</span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div className="p-1 rounded bg-indigo-50 text-indigo-950 flex flex-col justify-between">
                <span>TK 622 - Trực tiếp SX:</span>
                <b className="text-right text-indigo-700 font-bold">68.5%</b>
              </div>
              <div className="p-1 rounded bg-blue-50 text-blue-950 flex flex-col justify-between">
                <span>TK 627 - Phân xưởng:</span>
                <b className="text-right text-blue-700 font-bold">14.2%</b>
              </div>
              <div className="p-1 rounded bg-amber-50 text-amber-950 flex flex-col justify-between">
                <span>TK 641 - Bán hàng:</span>
                <b className="text-right text-amber-700 font-bold">9.8%</b>
              </div>
              <div className="p-1 rounded bg-emerald-50 text-emerald-950 flex flex-col justify-between">
                <span>TK 642 - QLDN:</span>
                <b className="text-right text-emerald-700 font-bold">7.5%</b>
              </div>
            </div>
          </div>

          {/* BẢNG CẬP NHẬT THÔNG TIN LAO ĐỘNG (THƯ VIỆN PHÁP LUẬT) */}
          <div className="lg:col-span-3">
            <TvplWidget />
          </div>
        </div>
      )}

      {/* TAB 3: ĐƠN TỪ & TUÂN THỦ CHI TIẾT */}
      {activeDashboardTab === 'COMPLIANCE' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-md glass hover-lift transition-all space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 uppercase">Tất Cả Yêu Cầu Chờ Xử Lý ({pendingRequests.length.toLocaleString('vi-VN')})</h3>
            <button
              onClick={() => onNavigate('REQUESTS')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Mở màn hình duyệt hàng loạt →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {pendingRequests.slice(0, 6).map((r) => (
              <div key={r.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-bold text-indigo-600">{r.code}</span>
                    <span className="text-slate-400">{r.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{r.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{r.employeeName} ({r.departmentName})</p>
                  <p className="text-[10px] text-slate-600 italic mt-0.5">Lý do: {r.reason}</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => onNavigate('REQUESTS')}
                    className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg shadow-xs hover:bg-indigo-700 transition-colors"
                  >
                    Xử lý đơn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
