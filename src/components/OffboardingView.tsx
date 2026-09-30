import React, { useState, useMemo } from 'react';
import { OffboardingRecord, CompanyPolicy, Employee, UserRole } from '../types/hrm';
import { CompactPagination, evaluateColumnCondition } from './SmartTableFilter';
import { 
  UserMinus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  DollarSign, 
  ShieldAlert,
  Printer,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  ShieldCheck,
  Download,
  Eye,
  EyeOff,
  BarChart2,
  TrendingDown,
  Building,
  Check,
  X,
  Mail,
  Send,
  FileSpreadsheet,
  Receipt,
  Lock,
  KeyRound,
  Database
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { initialTrainingCommitments } from '../services/trainingLndService';

interface OffboardingViewProps {
  offboardings: OffboardingRecord[];
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
  onUpdateOffboardings: (updated: OffboardingRecord[]) => void;
}

export const OffboardingView: React.FC<OffboardingViewProps> = ({
  offboardings,
  policy,
  employees,
  currentRole,
  onUpdateOffboardings,
}) => {
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [showTurnoverStats, setShowTurnoverStats] = useState<boolean>(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<OffboardingRecord | null>(null);
  // Tìm cam kết đào tạo còn hiệu lực (Khoản 2 Điều 62 BLLĐ)
  const getActiveBond = (record: OffboardingRecord) => {
    return initialTrainingCommitments.find(
      b => (b.employeeId === record.employeeCode || b.employeeId === record.employeeId) && b.status === 'ACTIVE'
    );
  };


  // Phân trang chuẩn Viewport (10 dòng)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Column Filters
  const [colFilters, setColFilters] = useState({
    code: '',
    name: '',
    dept: '',
    date: '',
    handovers: '',
    debt: '',
    settlement: '',
    status: '',
  });

  const currentTenantOffboardings = useMemo(() => {
    return offboardings.filter(o => o.tenantId === policy.tenantId);
  }, [offboardings, policy.tenantId]);

  // Bộ lọc danh sách hồ sơ thôi việc
  const filteredOffboardings = useMemo(() => {
    return currentTenantOffboardings.filter(off => {
      // 1. Tùy chọn Ẩn hồ sơ đã hoàn tất 100%
      if (hideCompleted && off.status === 'COMPLETED') return false;

      // 2. Bộ lọc từng cột
      if (colFilters.code && !evaluateColumnCondition(off.employeeCode, colFilters.code)) return false;
      if (colFilters.name && !evaluateColumnCondition(off.employeeName, colFilters.name)) return false;
      if (colFilters.dept && !evaluateColumnCondition(off.departmentName, colFilters.dept)) return false;
      if (colFilters.date && !evaluateColumnCondition(off.lastWorkingDate, colFilters.date)) return false;
      if (colFilters.debt && !evaluateColumnCondition(off.deductionDebt, colFilters.debt)) return false;
      if (colFilters.settlement && !evaluateColumnCondition(off.netSettlementAmount, colFilters.settlement)) return false;
      if (colFilters.status && !evaluateColumnCondition(off.status, colFilters.status)) return false;

      return true;
    });
  }, [currentTenantOffboardings, hideCompleted, colFilters]);

  const totalRecords = filteredOffboardings.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedOffboardings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOffboardings.slice(start, start + pageSize);
  }, [filteredOffboardings, currentPage, pageSize]);

  // Thống kê nhanh
  const totalOffboardingsCount = currentTenantOffboardings.length;
  const pendingCount = currentTenantOffboardings.filter(o => o.status !== 'COMPLETED').length;
  const completedCount = currentTenantOffboardings.filter(o => o.status === 'COMPLETED').length;
  const totalDebtToRecover = currentTenantOffboardings.filter(o => o.status !== 'COMPLETED').reduce((sum, o) => sum + (o.deductionDebt || 0), 0);
  const totalSettlementPending = currentTenantOffboardings.filter(o => o.status !== 'COMPLETED').reduce((sum, o) => sum + (o.netSettlementAmount || 0), 0);

  // Thống kê tỷ lệ nghỉ việc (Turnover Rate)
  const turnoverStats = useMemo(() => {
    const deptMap: { [dept: string]: number } = {};
    currentTenantOffboardings.forEach(o => {
      deptMap[o.departmentName] = (deptMap[o.departmentName] || 0) + 1;
    });

    const totalActive = employees.filter(e => e.tenantId === policy.tenantId && e.status !== 'RESIGNED' && e.status !== 'DISMISSED').length;
    const overallTurnoverRate = totalActive > 0 ? ((totalOffboardingsCount / (totalActive + totalOffboardingsCount)) * 100).toFixed(1) : '0';

    return { deptMap, overallTurnoverRate };
  }, [currentTenantOffboardings, employees, policy.tenantId, totalOffboardingsCount]);

  const handleToggleChecklist = (offId: string, field: keyof OffboardingRecord) => {
    const updated = offboardings.map(o => {
      if (o.id === offId) {
        return {
          ...o,
          [field]: !o[field],
        };
      }
      return o;
    });
    onUpdateOffboardings(updated);
  };

  // Khóa quyền truy cập phần mềm sau giờ làm việc cuối cùng & bảo lưu 100% lịch sử kiểm toán
  const handleToggleAccountLockout = (off: OffboardingRecord) => {
    const isCurrentlyLocked = off.accountLockoutStatus === 'LOCKED_POST_SHIFT';
    const newStatus = isCurrentlyLocked ? 'SCHEDULED_LOCK' : 'LOCKED_POST_SHIFT';
    const effectiveTime = `17:30 ngày ${off.lastWorkingDate} (Ngay sau ca làm việc cuối)`;
    
    const updated = offboardings.map(o => {
      if (o.id === off.id) {
        return {
          ...o,
          accountLockoutStatus: newStatus as const,
          lockoutEffectiveTime: effectiveTime,
          handoverItAccountCompleted: !isCurrentlyLocked,
          preserveDataAudit: true,
        };
      }
      return o;
    });
    onUpdateOffboardings(updated);

    if (!isCurrentlyLocked) {
      alert(`[BẢO LƯU KIỂM TOÁN THÔI VIỆC]\nĐã kích hoạt khóa quyền đăng nhập của nhân sự ${off.employeeName} (${off.employeeCode}) sau giờ làm việc cuối cùng (${effectiveTime}).\n\n✓ Mật khẩu đăng nhập: Được mã hóa và bảo lưu nguyên vẹn trong hệ thống (Không xóa hay đổi).\n✓ Dữ liệu lịch sử: Toàn bộ lịch sử chấm công, bảng lương, báo cáo công việc và đơn từ được bảo lưu 100% vĩnh viễn phục vụ kiểm toán.`);
    } else {
      alert(`Đã mở quyền đăng nhập tạm thời cho nhân sự ${off.employeeName} để tiếp tục bàn giao công việc.`);
    }
  };

  const handleApproveSettlement = (offId: string) => {
    const updated = offboardings.map(o => {
      if (o.id === offId) {
        return {
          ...o,
          status: 'COMPLETED' as const,
        };
      }
      return o;
    });
    onUpdateOffboardings(updated);
    alert('Đã phê duyệt quyết toán thôi việc và hoàn tất thủ tục thanh lý!');
  };

  const handleExportExcel = () => {
    const data = filteredOffboardings.map((o, idx) => ({
      'STT': idx + 1,
      'Mã NV': o.employeeCode,
      'Họ và Tên': o.employeeName,
      'Phòng Ban': o.departmentName,
      'Vị Trí': o.position,
      'Ngày Thôi Việc': o.lastWorkingDate,
      'Lương Ngày Công Còn Lại': o.remainingDaysSalary,
      'Tiền Phép Tồn': o.remainingLeavePay,
      'Trợ Cấp Thôi Việc': o.severancePay,
      'Nợ Khấu Trừ': o.deductionDebt,
      'Thực Nhận Quyết Toán': o.netSettlementAmount,
      'Bàn Giao Công Việc': o.handoverWorkCompleted ? 'Đã xong' : 'Chưa xong',
      'Bàn Giao Tài Sản': o.handoverAssetCompleted ? 'Đã xong' : 'Chưa xong',
      'Khóa Tài Khoản IT': o.handoverItAccountCompleted ? 'Đã xong' : 'Chưa xong',
      'Tài Chính Kế Toán': o.handoverFinanceCompleted ? 'Đã xong' : 'Chưa xong',
      'Trạng Thái': o.status === 'COMPLETED' ? 'Đã hoàn tất' : 'Đang xử lý',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'QuyetToanThoiViec');
    XLSX.writeFile(wb, `Danh_Sach_Thanh_Ly_Thoi_Viec_${policy.companyName}.xlsx`);
  };

  return (
    <div className="space-y-3">
      {/* Tiêu đề & Công cụ chuyển đổi */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <UserMinus className="w-4 h-4 text-indigo-600" />
            <h1 className="text-base font-bold text-slate-900">Thanh Lý Nghỉ Việc & Quyết Toán Thôi Việc (Offboarding)</h1>
            <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {pendingCount} chờ xử lý
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Quy trình bàn giao 4 bước chuẩn BLLĐ: Công việc, Tài sản, IT, Kế toán & Quyết toán thanh lý trong 14 ngày
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Nút Ẩn / Hiện hồ sơ đã hoàn tất 100% */}
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              hideCompleted 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {hideCompleted ? <EyeOff className="w-3 h-3 text-indigo-600" /> : <Eye className="w-3 h-3 text-slate-400" />}
            <span>{hideCompleted ? 'Đang Ẩn 100%' : 'Ẩn Đã Xong 100%'}</span>
          </button>

          {/* Nút Xem Thống kê tỷ lệ thôi việc */}
          <button
            onClick={() => setShowTurnoverStats(!showTurnoverStats)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              showTurnoverStats 
                ? 'bg-purple-50 text-purple-700 border-purple-300' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="w-3 h-3 text-purple-600" />
            <span>Tỷ Lệ Nghỉ Việc</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* 4 THẺ TỔNG QUAN CHỈ SỐ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold block uppercase text-[9px]">Chờ Xử Lý Bàn Giao</span>
          <span className="text-base font-bold text-rose-600 mt-0.5 block">{pendingCount} nhân sự</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Chưa hoàn thành thanh lý</span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold block uppercase text-[9px]">Đã Hoàn Tất Thanh Lý</span>
          <span className="text-base font-bold text-emerald-700 mt-0.5 block">{completedCount} nhân sự</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Đã thanh lý & khóa hồ sơ</span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold block uppercase text-[9px]">Công Nợ Tồn Đọng</span>
          <span className="text-base font-bold text-amber-600 mt-0.5 block">{totalDebtToRecover.toLocaleString('vi-VN')} đ</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Khấu trừ tài sản / tạm ứng</span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-semibold block uppercase text-[9px]">Tổng Quyết Toán Chờ Chi</span>
          <span className="text-base font-bold text-indigo-700 mt-0.5 block">{totalSettlementPending.toLocaleString('vi-VN')} đ</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Lương + phép tồn + trợ cấp</span>
        </div>
      </div>

      {/* WIDGET THỐNG KÊ TỶ LỆ NGHỈ VIỆC (TURNOVER RATE) NẾU MỞ */}
      {showTurnoverStats && (
        <div className="bg-white rounded-2xl border border-purple-200 p-2 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-900">Báo Cáo Tỷ Lệ Biến Động Nhân Sự & Thôi Việc (Turnover Rate)</h3>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Tỷ lệ biến động toàn công ty: {turnoverStats.overallTurnoverRate}%
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {Object.entries(turnoverStats.deptMap).map(([dept, count]) => (
              <div key={dept} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[11px] block truncate" title={dept}>{dept}</span>
                <div className="mt-1 flex items-baseline justify-between">
                  <b className="text-base text-slate-900">{count} người</b>
                  <span className="text-[10px] text-purple-600 font-bold">
                    {Math.round((count / totalOffboardingsCount) * 100)}% tổng nghỉ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BẢNG DỮ LIỆU THANH LÝ VỚI BỘ LỌC CỘT VÀ PHÂN TRANG */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="px-3 py-2.5">Mã NV</th>
                <th className="px-3 py-2.5">Họ Và Tên</th>
                <th className="px-3 py-2.5">Phòng Ban / Vị Trí</th>
                <th className="px-3 py-2.5">Ngày Nghỉ Việc</th>
                <th className="px-3 py-2.5 text-center">Tiến Độ Bàn Giao (4 Bước)</th>
                <th className="px-3 py-2.5">Nợ Khấu Trừ</th>
                <th className="px-3 py-2.5 text-right">Quyết Toán Thực Nhận</th>
                <th className="px-3 py-2.5 text-center">Trạng Thái</th>
                <th className="px-3 py-2.5 text-right">Thao Tác</th>
              </tr>

              {/* HÀNG LỌC TOÁN TỬ VÀ TÌM KIẾM */}
              <tr className="bg-slate-100/70 border-b border-slate-200 normal-case font-normal text-[11px]">
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Mã..."
                    value={colFilters.code}
                    onChange={e => { setColFilters(prev => ({ ...prev, code: e.target.value })); setCurrentPage(1); }}
                    className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Họ tên..."
                    value={colFilters.name}
                    onChange={e => { setColFilters(prev => ({ ...prev, name: e.target.value })); setCurrentPage(1); }}
                    className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Phòng ban..."
                    value={colFilters.dept}
                    onChange={e => { setColFilters(prev => ({ ...prev, dept: e.target.value })); setCurrentPage(1); }}
                    className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Ngày..."
                    value={colFilters.date}
                    onChange={e => { setColFilters(prev => ({ ...prev, date: e.target.value })); setCurrentPage(1); }}
                    className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="px-2 py-1 text-center text-slate-400 text-[10px]">
                  <span>4 bước bàn giao</span>
                </th>
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder=">0..."
                    value={colFilters.debt}
                    onChange={e => { setColFilters(prev => ({ ...prev, debt: e.target.value })); setCurrentPage(1); }}
                    className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="px-2 py-1 text-right">
                  <input
                    type="text"
                    placeholder=">=5tr..."
                    value={colFilters.settlement}
                    onChange={e => { setColFilters(prev => ({ ...prev, settlement: e.target.value })); setCurrentPage(1); }}
                    className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500 text-right"
                  />
                </th>
                <th className="px-2 py-1 text-center">
                  <input
                    type="text"
                    placeholder="Trạng thái..."
                    value={colFilters.status}
                    onChange={e => { setColFilters(prev => ({ ...prev, status: e.target.value })); setCurrentPage(1); }}
                    className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500 text-center"
                  />
                </th>
                <th className="px-2 py-1 text-right">
                  {Object.values(colFilters).some(v => v !== '') && (
                    <button
                      onClick={() => {
                        setColFilters({ code: '', name: '', dept: '', date: '', handovers: '', debt: '', settlement: '', status: '' });
                        setCurrentPage(1);
                      }}
                      className="text-[10px] text-indigo-600 hover:underline font-bold"
                    >
                      Xóa lọc
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOffboardings.map((off) => {
                const completedSteps = [off.handoverWorkCompleted, off.handoverAssetCompleted, off.handoverItAccountCompleted, off.handoverFinanceCompleted].filter(Boolean).length;
                const hasPendingHandover = completedSteps < 4;
                const hasDebt = (off.deductionDebt || 0) > 0;

                return (
                  <tr key={off.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-bold text-indigo-700">{off.employeeCode}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">
                      <div>{off.employeeName}</div>
                      {getActiveBond(off) && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 mt-0.5" title="Có cam kết đào tạo chưa phục vụ đủ thời gian (Khoản 2 Điều 62 BLLĐ 2019)">
                          <ShieldAlert className="w-2.5 h-2.5 text-amber-700" />
                          <span>Cấn trừ Đ62: -{((getActiveBond(off)!.potentialRefundAmount) / 1000000).toFixed(0)}Tr</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-slate-800 font-medium">{off.departmentName}</div>
                      <div className="text-[10px] text-slate-400">{off.position}</div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-600">{off.lastWorkingDate}</td>
                    
                    {/* Tiến độ bàn giao 4 bước có thể tick trực tiếp */}
                    <td className="px-3 py-2.5 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => handleToggleChecklist(off.id, 'handoverWorkCompleted')}
                          className={`p-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            off.handoverWorkCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700 animate-pulse'
                          }`}
                          title="Bàn giao công việc"
                        >
                          CV {off.handoverWorkCompleted ? '✓' : '✗'}
                        </button>
                        <button
                          onClick={() => handleToggleChecklist(off.id, 'handoverAssetCompleted')}
                          className={`p-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            off.handoverAssetCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                          title="Bàn giao tài sản / thiết bị"
                        >
                          TS {off.handoverAssetCompleted ? '✓' : '✗'}
                        </button>
                        <button
                          onClick={() => handleToggleAccountLockout(off)}
                          className={`p-1 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-0.5 ${
                            off.accountLockoutStatus === 'LOCKED_POST_SHIFT' || off.handoverItAccountCompleted
                              ? 'bg-slate-900 text-white hover:bg-slate-800' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title={off.accountLockoutStatus === 'LOCKED_POST_SHIFT' 
                            ? 'Tài khoản đã khóa sau giờ làm cuối cùng (Mật khẩu & 100% Lịch sử được bảo lưu vĩnh viễn trong CSDL)' 
                            : 'Nhấn để kích hoạt khóa quyền truy cập phần mềm sau ca làm cuối cùng (Bảo lưu dữ liệu kiểm toán)'
                          }
                        >
                          <Lock className="w-2.5 h-2.5 text-amber-300" />
                          <span>IT {off.accountLockoutStatus === 'LOCKED_POST_SHIFT' || off.handoverItAccountCompleted ? 'Khóa' : 'Mở'}</span>
                        </button>
                        <button
                          onClick={() => handleToggleChecklist(off.id, 'handoverFinanceCompleted')}
                          className={`p-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            off.handoverFinanceCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                          title="Kế toán công nợ"
                        >
                          KT {off.handoverFinanceCompleted ? '✓' : '✗'}
                        </button>
                      </div>
                      <div className="flex items-center justify-center space-x-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">({completedSteps}/4 bước)</span>
                        {off.accountLockoutStatus === 'LOCKED_POST_SHIFT' ? (
                          <span className="text-[9px] text-indigo-700 font-bold bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200 flex items-center gap-0.5" title="Đã khóa truy cập sau ca làm cuối - Lịch sử & Mật khẩu bảo lưu 100%">
                            <ShieldCheck className="w-2.5 h-2.5 text-indigo-600" />
                            <span>Khóa ca cuối</span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-600 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-amber-500" />
                            <span>Chờ khóa 17:30</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Công nợ khấu trừ */}
                    <td className="px-3 py-2.5">
                      {hasDebt ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold font-mono text-[11px] block w-max">
                          -{off.deductionDebt?.toLocaleString()} đ
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">0 đ</span>
                      )}
                    </td>

                    {/* Thực nhận quyết toán */}
                    <td className="px-3 py-2.5 text-right font-bold text-emerald-700 text-sm font-mono">
                      {off.netSettlementAmount.toLocaleString('vi-VN')} đ
                    </td>

                    {/* Trạng thái */}
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        off.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {off.status === 'COMPLETED' ? 'Đã thanh lý' : 'Đang xử lý'}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setSelectedRecordForDetail(off)}
                          className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer border border-indigo-200"
                          title="Xem trực tiếp Biên bản quyết toán thôi việc"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExportOffboardingExcel(off)}
                          className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer border border-emerald-200"
                          title="Xuất file Excel biên bản quyết toán thôi việc (có công thức)"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>
                        {off.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleApproveSettlement(off.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-colors shadow-sm cursor-pointer"
                          >
                            Duyệt
                          </button>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            Xong
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedOffboardings.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400 italic">
                    Không có hồ sơ thôi việc nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang chuẩn Viewport */}
        <CompactPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
        />
      </div>

      {/* MODAL XEM TRỰC TIẾP BIÊN BẢN QUYẾT TOÁN THÔI VIỆC */}
      {selectedRecordForDetail && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in"
          onClick={() => setSelectedRecordForDetail(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-3 shadow-2xl space-y-1.5 border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
                    Biên Bản Quyết Toán Lương & Trợ Cấp Thôi Việc (Điều 48 BLLĐ)
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedRecordForDetail.employeeName} ({selectedRecordForDetail.employeeCode})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedRecordForDetail.departmentName} • Ngày nghỉ việc: {selectedRecordForDetail.lastWorkingDate}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chi tiết các khoản quyết toán */}
            <div className="space-y-3 text-xs">
              {/* Phần I: Các khoản được nhận */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 border-b border-slate-200">
                  I. CÁC KHOẢN DOANH NGHIỆP CHI TRẢ
                </div>
                <div className="divide-y divide-slate-100 p-2 text-[11px]">
                  <div className="flex justify-between py-1.5 px-2">
                    <span>1. Tiền lương những ngày làm việc tháng cuối:</span>
                    <b className="font-mono text-slate-900">{selectedRecordForDetail.remainingDaysSalary.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>2. Tiền thanh toán ngày phép năm còn tồn ({selectedRecordForDetail.remainingLeaveDays} ngày):</span>
                    <b className="font-mono text-emerald-700">+{selectedRecordForDetail.remainingLeavePay.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>3. Trợ cấp thôi việc (Điều 46 BLLĐ):</span>
                    <b className="font-mono text-slate-900">+{selectedRecordForDetail.severancePay.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-2 px-2 bg-slate-50/70 font-bold">
                    <span>= TỔNG CÁC KHOẢN ĐƯỢC NHẬN:</span>
                    <span className="font-mono text-indigo-700">
                      {(selectedRecordForDetail.remainingDaysSalary + selectedRecordForDetail.remainingLeavePay + selectedRecordForDetail.severancePay).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Phần II: Khấu trừ công nợ & Bồi hoàn đào tạo Điều 62 BLLĐ */}
              {(() => {
                const activeBondDetail = getActiveBond(selectedRecordForDetail);
                const totalDeduction = (selectedRecordForDetail.deductionDebt || 0) + (activeBondDetail ? activeBondDetail.potentialRefundAmount : 0);

                return (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
                      <span>II. CÁC KHOẢN KHẤU TRỪ CÔNG NỢ & BỒI THƯỜNG</span>
                      <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        Đối soát Điều 62 BLLĐ 2019
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 p-2 text-[11px]">
                      <div className="flex justify-between items-center py-1.5 px-2">
                        <span>1. Công nợ tạm ứng / Bồi hoàn tài sản thiết bị:</span>
                        <b className="font-mono text-rose-600">-{selectedRecordForDetail.deductionDebt.toLocaleString('vi-VN')} đ</b>
                      </div>
                      {activeBondDetail && (
                        <div className="p-2.5 my-1 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 font-bold text-amber-900">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                              <span>2. Bồi hoàn kinh phí đào tạo nghề vi phạm cam kết (Khoản 2 Điều 62 BLLĐ 2019):</span>
                            </div>
                            <b className="font-mono text-rose-700 font-bold text-xs">-{activeBondDetail.potentialRefundAmount.toLocaleString('vi-VN')} đ</b>
                          </div>
                          <div className="text-[10px] text-slate-600 pl-4 space-y-0.5">
                            <p>• <b>Khóa học:</b> {activeBondDetail.courseName} ({activeBondDetail.provider})</p>
                            <p>• <b>Mã hợp đồng đào tạo:</b> <span className="font-mono font-bold text-indigo-700">{activeBondDetail.commitmentCode}</span> • Tổng kinh phí tài trợ: {activeBondDetail.totalInvestmentCost.toLocaleString('vi-VN')} đ</p>
                            <p>• <b>Thời gian cam kết:</b> {activeBondDetail.commitmentMonths} tháng • Đã làm việc: {activeBondDetail.servedMonths} tháng • <span className="text-rose-700 font-bold">Chưa phục vụ: {activeBondDetail.remainingMonths} tháng</span></p>
                            <p className="text-amber-800 italic bg-amber-100/60 p-1.5 rounded text-[10px] mt-1">
                              *Căn cứ pháp lý: Người lao động nghỉ việc trước khi hoàn thành thời hạn cam kết phục vụ phải hoàn trả kinh phí đào tạo theo tỷ lệ thời gian chưa làm việc theo Khoản 2 Điều 62 Bộ luật Lao động 2019.
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between py-2 px-2 bg-rose-50/60 font-bold text-rose-800">
                        <span>= TỔNG CÁC KHOẢN KHẤU TRỪ:</span>
                        <span className="font-mono text-rose-700">-{totalDeduction.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Thực lĩnh quyết toán */}
              <div className="p-2 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                    TỔNG TIỀN QUYẾT TOÁN THỰC LĨNH (NET):
                  </span>
                  <span className="text-xl font-black text-emerald-700">
                    {selectedRecordForDetail.netSettlementAmount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span className="block font-semibold">Thời hạn chi trả:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 inline-block mt-0.5">
                    {selectedRecordForDetail.paymentDeadlineOption === 'WITHIN_14_DAYS' ? 'Trong 14 ngày làm việc' : 'Kỳ lương kế tiếp'}
                  </span>
                </div>
              </div>

              {/* Phần III: Cắt quyền truy cập phần mềm & Cam kết bảo lưu lịch sử kiểm toán */}
              <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Cắt Quyền Truy Cập Phần Mềm & Bảo Lưu Lịch Sử Kiểm Toán</h4>
                      <p className="text-[10px] text-slate-500">Tài khoản tự động ngắt quyền sau giờ làm cuối; Mật khẩu & 100% dữ liệu lịch sử đóng góp được giữ nguyên vẹn</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                    selectedRecordForDetail.accountLockoutStatus === 'LOCKED_POST_SHIFT'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {selectedRecordForDetail.accountLockoutStatus === 'LOCKED_POST_SHIFT' ? (
                      <>
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Đã Khóa Sau Giờ Làm Cuối</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Hẹn Giờ Khóa: 17:30 Ngày Nghỉ</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Thời điểm hiệu lực khóa tài khoản:</span>
                    <b className="text-slate-900 font-mono">
                      {selectedRecordForDetail.lockoutEffectiveTime || `17:30 ngày ${selectedRecordForDetail.lastWorkingDate} (Sau ca làm cuối)`}
                    </b>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sau thời điểm này, nhân sự không thể đăng nhập ứng dụng trên web/app di động.</p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Cam kết bảo lưu dữ liệu kiểm toán (Audit Trail):</span>
                    <b className="text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Mật khẩu mã hóa & 100% lịch sử giữ nguyên
                    </b>
                    <p className="text-[10px] text-slate-400 mt-0.5">Bảng công, phiếu lương, log thay đổi được bảo lưu vĩnh viễn trong CSDL phục vụ kiểm toán.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-indigo-100">
                  <span className="text-[10px] text-indigo-700 italic">
                    *Quy định bảo mật: Không xóa tài khoản hoặc đổi mật khẩu để tránh làm đứt gãy vết kiểm toán.
                  </span>
                  <button
                    onClick={() => {
                      handleToggleAccountLockout(selectedRecordForDetail);
                      const isNowLocked = selectedRecordForDetail.accountLockoutStatus !== 'LOCKED_POST_SHIFT';
                      setSelectedRecordForDetail(prev => prev ? {
                        ...prev,
                        accountLockoutStatus: isNowLocked ? 'LOCKED_POST_SHIFT' : 'SCHEDULED_LOCK',
                        handoverItAccountCompleted: isNowLocked,
                        lockoutEffectiveTime: `17:30 ngày ${prev.lastWorkingDate} (Sau ca làm việc cuối)`,
                        preserveDataAudit: true
                      } : null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center space-x-1.5"
                  >
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>
                      {selectedRecordForDetail.accountLockoutStatus === 'LOCKED_POST_SHIFT'
                        ? 'Mở Quyền Đăng Nhập Tạm Thời Bàn Giao'
                        : 'Kích Hoạt Khóa Ngay Sau Ca Cuối'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleExportOffboardingExcel(selectedRecordForDetail)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Xuất Excel Quyết Toán (Có Công Thức)</span>
              </button>

              <button
                onClick={() => {
                  alert(`Đã gửi email phiếu quyết toán thôi việc đến: ${selectedRecordForDetail.employeeCode.toLowerCase()}@digitech.vn`);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Gửi Email Quyết Toán</span>
              </button>

              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
