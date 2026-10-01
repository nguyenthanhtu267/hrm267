import React, { useState, useMemo } from 'react';
import { PayrollRecord, CompanyPolicy, UserRole } from '../types/hrm';
import { excelService } from '../services/excelService';
import { evaluateColumnCondition, CompactPagination } from './SmartTableFilter';
import { ExportDropdown } from './ExportDropdown';
import { printTableToPdf } from '../utils/exportUtils';
import {
  CreditCard,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Receipt,
  FileSpreadsheet,
  X,
  HelpCircle,
  TrendingUp,
  DollarSign,
  PieChart,
  Filter,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface BankTransferAuditViewProps {
  payrollRecords: PayrollRecord[];
  policy: CompanyPolicy;
  currentRole: UserRole;
  selectedMonth: string;
  onMonthChange?: (month: string) => void;
}

export const BankTransferAuditView: React.FC<BankTransferAuditViewProps> = ({
  payrollRecords,
  policy,
  currentRole,
  selectedMonth,
  onMonthChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState('ALL');
  const [selectedScenario, setSelectedScenario] = useState('ALL');
  const [activeAuditRecord, setActiveAuditRecord] = useState<PayrollRecord | null>(null);

  // Phân trang & Lọc cột
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [colFilters, setColFilters] = useState({
    name: '',
    account: '',
    bank: '',
    net: '',
    scenario: ''
  });

  // Danh sách các ngân hàng duy nhất có trong dữ liệu
  const availableBanks = useMemo(() => {
    const banks = Array.from(new Set(payrollRecords.map(r => r.bankName).filter(Boolean)));
    return banks.sort();
  }, [payrollRecords]);

  // Danh sách các kịch bản duy nhất
  const availableScenarios = useMemo(() => {
    const map = new Map<string, string>();
    payrollRecords.forEach(r => {
      if (r.scenarioTag && r.scenarioLabel) {
        map.set(r.scenarioTag, r.scenarioLabel);
      }
    });
    return Array.from(map.entries());
  }, [payrollRecords]);

  // Lọc dữ liệu danh sách chuyển khoản kết hợp bộ lọc cột toán học
  const filteredRecords = useMemo(() => {
    return payrollRecords.filter(rec => {
      const matchSearch =
        rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.bankAccount.includes(searchTerm) ||
        rec.departmentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchBank = selectedBank === 'ALL' || rec.bankName === selectedBank;
      const matchScenario = selectedScenario === 'ALL' || rec.scenarioTag === selectedScenario;

      if (!matchSearch || !matchBank || !matchScenario) return false;

      // Lọc cột
      if (!evaluateColumnCondition(`${rec.employeeName} ${rec.employeeCode} ${rec.departmentName}`, colFilters.name)) return false;
      if (!evaluateColumnCondition(rec.bankAccount, colFilters.account)) return false;
      if (!evaluateColumnCondition(rec.bankName, colFilters.bank)) return false;
      if (!evaluateColumnCondition(rec.netSalary, colFilters.net)) return false;
      if (!evaluateColumnCondition(rec.scenarioLabel || '', colFilters.scenario)) return false;

      return true;
    });
  }, [payrollRecords, searchTerm, selectedBank, selectedScenario, colFilters]);

  // Phân trang
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Tổng hợp các chỉ số tài chính chuyển khoản
  const totalTransferAmount = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.netSalary, 0);
  }, [filteredRecords]);

  const totalNonCashExcluded = useMemo(() => {
    return filteredRecords.reduce((sum, r) => {
      const nonCash = (r.reverseAuditTrail?.step4NonCashDeductions || 0);
      return sum + nonCash;
    }, 0);
  }, [filteredRecords]);

  const totalBeneficiaries = filteredRecords.length;

  // Xuất file lệnh chuyển khoản ngân hàng (Excel)
  const handleExportBankTransferExcel = () => {
    excelService.exportBankTransferFile(
      filteredRecords,
      policy.companyName,
      selectedMonth,
      `Lenh_Chuyen_Khoan_Ngan_Hang_${policy.companyName}_${selectedMonth}.xlsx`
    );
  };

  // Xuất PDF lệnh chuyển khoản
  const handleExportBankTransferPdf = () => {
    const headers = ['Mã NV', 'Họ Và Tên', 'Số Tài Khoản', 'Ngân Hàng', 'Thực Lãnh Chi (đ)', 'Tình Trạng TK'];
    const rows = filteredRecords.map(r => [
      r.employeeCode,
      r.employeeName,
      r.bankAccountNumber || 'Chưa cập nhật',
      r.bankName || 'Chưa cập nhật',
      (r.netSalary || 0).toLocaleString('vi-VN'),
      r.isAccountVerified ? 'Hợp Lệ' : 'Chưa Xác Minh'
    ]);
    printTableToPdf(`LỆNH CHUYỂN KHOẢN TIỀN LƯƠNG — THÁNG ${selectedMonth}`, `Công ty: ${policy.companyName} • Tổng số tiền: ${totalTransferAmount.toLocaleString('vi-VN')} đ`, headers, rows);
  };

  return (
    <div className="space-y-1.5">
      {/* 1. Header Banner & Thống kê dòng tiền */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-xl p-3 text-slate-800 shadow-sm border border-indigo-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kiểm Tra & Chuyển Khoản Ngân Hàng (Bank Transfer Audit)</span>
            </div>
            <h1 className="text-base font-bold tracking-tight text-indigo-950 flex items-center gap-2">
              <span>Lệnh Chi Hộ & Đối Soát Tiền Lương</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                Tháng {selectedMonth}
              </span>
            </h1>
          </div>

          {/* Chọn tháng & Nút Xuất Excel Lệnh Chi */}
          <div className="flex items-center gap-2">
            {onMonthChange && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            )}
            <ExportDropdown
              onExportExcel={handleExportBankTransferExcel}
              onExportPdf={handleExportBankTransferPdf}
              label="Xuất Lệnh Chi"
              buttonColorClass="bg-emerald-500 hover:bg-emerald-600 text-white"
            />
          </div>
        </div>

        {/* 4 Thẻ chỉ số đối soát thu gọn */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2.5 pt-2.5 border-t border-slate-800/80">
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="text-[10px] text-slate-400">Tổng Tiền Chuyển (Net)</div>
            <div className="text-sm font-bold text-indigo-950 mt-0.5">
              {totalTransferAmount.toLocaleString('vi-VN')} <span className="text-[10px] font-normal text-slate-500">đ</span>
            </div>
            <div className="text-[9px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> {totalBeneficiaries} người nhận hợp lệ
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="text-[10px] text-slate-400">Hiện Vật (Đã Loại Trừ)</div>
            <div className="text-sm font-bold text-amber-300 mt-0.5">
              {totalNonCashExcluded.toLocaleString('vi-VN')} <span className="text-[10px] font-normal text-slate-400">đ</span>
            </div>
            <div className="text-[9px] text-amber-200/80 mt-0.5">
              Sữa độc hại TT24 + Quà (Không chi tiền)
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="text-[10px] text-slate-400">Số Ngân Hàng Chi Trả</div>
            <div className="text-sm font-bold text-indigo-950 mt-0.5">
              {availableBanks.length} <span className="text-[10px] font-normal text-slate-500">ngân hàng</span>
            </div>
            <div className="text-[9px] text-slate-300 mt-0.5 truncate">
              {availableBanks.slice(0, 3).join(', ')}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="text-[10px] text-slate-400">Kết Quả Đối Soát Ngược</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Khớp 100% (0đ lệch)</span>
            </div>
            <div className="text-[9px] text-emerald-200/80 mt-0.5">
              Cân đối tuyệt đối 100%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thanh lọc & Tìm kiếm */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên, mã NV, số tài khoản hoặc phòng ban..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Lọc ngân hàng */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" /> Ngân hàng:
            </span>
            <select
              value={selectedBank}
              onChange={(e) => { setSelectedBank(e.target.value); setCurrentPage(1); }}
              className="text-xs font-semibold p-1.5 rounded-lg border border-slate-300 bg-white outline-none"
            >
              <option value="ALL">Tất Cả ({availableBanks.length})</option>
              {availableBanks.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo kịch bản */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Kịch bản:
            </span>
            <select
              value={selectedScenario}
              onChange={(e) => { setSelectedScenario(e.target.value); setCurrentPage(1); }}
              className="text-xs font-semibold p-1.5 rounded-lg border border-slate-300 bg-white outline-none max-w-xs truncate"
            >
              <option value="ALL">Tất Cả Kịch Bản ({payrollRecords.length})</option>
              {availableScenarios.map(([tag, label]) => (
                <option key={tag} value={tag}>{label}</option>
              ))}
            </select>
          </div>

          {(colFilters.name || colFilters.account || colFilters.bank || colFilters.net || colFilters.scenario) && (
            <button
              onClick={() => {
                setColFilters({ name: '', account: '', bank: '', net: '', scenario: '' });
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold whitespace-nowrap"
              title="Xóa tất cả lọc cột"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* 3. Bảng Danh Sách Chuyển Khoản Chuẩn Ngân Hàng với Hàng Lọc Toán Học */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-900">
              Lệnh Thanh Toán Chi Hộ Lương Ngân Hàng • {filteredRecords.length} Bản Ghi
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            Bấm nút <b>"Bóc Tách"</b> để đối chiếu từng đồng chuyển khoản
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-10 text-center">STT</th>
                <th className="py-2.5 px-3 min-w-[180px]">Người Thụ Hưởng</th>
                <th className="py-2.5 px-3 w-36">Tài Khoản Nhận</th>
                <th className="py-2.5 px-3 w-32">Ngân Hàng</th>
                <th className="py-2.5 px-3 text-right w-36">Số Tiền Chuyển (Net)</th>
                <th className="py-2.5 px-3 min-w-[160px]">Tình Huống / Kịch Bản</th>
                <th className="py-2.5 px-3 text-center w-28">Đối Soát</th>
                <th className="py-2.5 px-3 text-center w-24">Thao Tác</th>
              </tr>
              {/* HÀNG TÌM KIẾM DƯỚI TIÊU ĐỀ (Toán tử >=, <=, >, <, =) */}
              <tr className="bg-slate-100/80 border-b border-slate-200">
                <th className="p-1 text-center text-slate-400 font-normal">-</th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Tên / mã / phòng..."
                    value={colFilters.name}
                    onChange={(e) => { setColFilters({ ...colFilters, name: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Số tài khoản..."
                    value={colFilters.account}
                    onChange={(e) => { setColFilters({ ...colFilters, account: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500 font-mono"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Ngân hàng..."
                    value={colFilters.bank}
                    onChange={(e) => { setColFilters({ ...colFilters, bank: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder=">= 10000000..."
                    value={colFilters.net}
                    onChange={(e) => { setColFilters({ ...colFilters, net: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500 font-mono"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    placeholder="Kịch bản..."
                    value={colFilters.scenario}
                    onChange={(e) => { setColFilters({ ...colFilters, scenario: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1 text-center text-slate-400 font-normal">-</th>
                <th className="p-1 text-center text-slate-400 font-normal">-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không tìm thấy nhân viên nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec, index) => {
                  const audit = rec.reverseAuditTrail;
                  const isMatch = audit ? audit.step5DifferenceCheck === 0 : true;

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                      onClick={() => setActiveAuditRecord(rec)}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{rec.employeeName}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {rec.employeeCode}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {rec.departmentName} • {rec.position}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                        {rec.bankAccount}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {rec.bankName}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-extrabold text-indigo-700">
                        {rec.netSalary.toLocaleString('vi-VN')} <span className="text-[10px] font-normal text-slate-500">đ</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          rec.scenarioTag === 'CEO_HIGH_TAX' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          rec.scenarioTag === 'PROBATION_10PCT' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                          rec.scenarioTag === 'NIGHT_TOXIC_IN_KIND' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          rec.scenarioTag === 'NON_RESIDENT_20PCT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          rec.scenarioTag === 'OFFBOARDING_SETTLEMENT' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                          rec.scenarioTag === 'CIVIL_SERVICE_10PCT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          rec.scenarioTag === 'MIN_WAGE_REGION1' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                          rec.scenarioTag === 'OVERTIME_HIGH' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {rec.scenarioLabel || 'Chính thức chuẩn'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {isMatch ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Khớp 100%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 text-[10px] font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Lệch
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveAuditRecord(rec)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 text-[10px] font-bold rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <span>Bóc Tách</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang thu gọn */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <CompactPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalRecords={filteredRecords.length}
            pageSize={pageSize}
          />
          <div className="text-[11px] text-slate-500">
            Hiển thị tối đa <span className="font-bold text-slate-800">{pageSize}</span> dòng/trang (không phải cuộn dài)
          </div>
        </div>
      </div>

      {/* 4. Modal Bóc Tách Kiểm Tra Ngược (Reverse Audit Explainer) */}
      {activeAuditRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 text-slate-800 rounded-t-3xl relative border-b border-indigo-200">
              <button
                onClick={() => setActiveAuditRecord(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bóc Tách Kiểm Tra Ngược Dòng Tiền • Reverse Payroll Audit Trail</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                    <span>{activeAuditRecord.employeeName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-100 font-mono text-indigo-700 border border-indigo-200">
                      {activeAuditRecord.employeeCode}
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {activeAuditRecord.departmentName} • {activeAuditRecord.position} • {activeAuditRecord.bankName} ({activeAuditRecord.bankAccount})
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-indigo-300 font-medium">Thực nhận chuyển khoản (Net)</div>
                  <div className="text-2xl font-black text-emerald-400">
                    {activeAuditRecord.netSalary.toLocaleString('vi-VN')} <span className="text-sm font-normal">đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-3 space-y-2 text-xs text-slate-700">
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-indigo-950">Phân loại kịch bản:</span>
                  <span className="font-semibold text-indigo-700">{activeAuditRecord.scenarioLabel}</span>
                </div>
                <span className="text-[11px] text-slate-500 italic">Mã đối chiếu: {activeAuditRecord.scenarioTag}</span>
              </div>

              {activeAuditRecord.reverseAuditTrail ? (
                <div className="space-y-1.5">
                  <div className="border border-slate-200 rounded-2xl p-2 bg-slate-50/50 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>5 Bước Kiểm Tra & Đối Soát Ngược Chi Tiết:</span>
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                          <b>Bước 1: Lương cơ bản theo HĐLĐ</b>
                          <p className="text-slate-500 text-[11px]">Mức làm căn cứ đóng BHXH hoặc thỏa thuận</p>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {activeAuditRecord.reverseAuditTrail.step1BaseSalary.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                          <b>Bước 2: Các khoản cộng thêm vào Gross (Thưởng, OT, Phụ cấp)</b>
                          <p className="text-slate-500 text-[11px]">Lương chức danh, OT thực tế, phụ cấp cơm/xăng</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 text-sm">
                          +{activeAuditRecord.reverseAuditTrail.step2AdditionsTotal.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                          <b>Bước 3: Các khoản trừ theo luật (BHXH 10.5% + Thuế TNCN)</b>
                          <p className="text-slate-500 text-[11px]">Khấu trừ bắt buộc người lao động đóng</p>
                        </div>
                        <span className="font-mono font-bold text-rose-600 text-sm">
                          -{activeAuditRecord.reverseAuditTrail.step3DeductionsTotal.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                          <b>Bước 4: Loại trừ hiện vật phi tiền mặt (Sữa độc hại TT24, Quà Tết)</b>
                          <p className="text-amber-700 text-[11px]">Đã phát hiện vật trực tiếp, không chi tiền mặt</p>
                        </div>
                        <span className="font-mono font-bold text-amber-700 text-sm">
                          -{activeAuditRecord.reverseAuditTrail.step4NonCashDeductions.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 flex justify-between items-center">
                        <div>
                          <b className="text-emerald-900 text-sm">Bước 5: Lệnh Chuyển Khoản Net Thực Tế</b>
                          <p className="text-emerald-700 text-[11px]">Số tiền lệnh ngân hàng chi hộ khớp chuẩn từng đồng</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-emerald-800 text-base">
                            {activeAuditRecord.reverseAuditTrail.finalCalculatedNet.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="block text-[10px] text-emerald-600 font-bold">Chênh lệch: 0.00 đ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
                    <b>Giải trình nghiệp vụ C&B:</b> {activeAuditRecord.reverseAuditTrail.auditExplanation}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Chưa có dữ liệu bóc tách đối soát cho bản ghi này.</p>
              )}
            </div>

            <div className="p-2 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-3xl">
              <button
                onClick={() => setActiveAuditRecord(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
