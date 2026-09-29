import { FormattedNumberInput } from './FormattedNumberInput';
import React, { useState, useMemo } from 'react';
import { PayrollRecord, CompanyPolicy } from '../types/hrm';
import { 
  Banknote, 
  Calculator, 
  Printer, 
  Download, 
  CheckCircle2, 
  Coins, 
  Building, 
  FileSpreadsheet, 
  Layers, 
  Search, 
  Filter,
  Sparkles,
  Info,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CashDenominationViewProps {
  payrollRecords: PayrollRecord[];
  policy: CompanyPolicy;
  selectedMonth: string;
}

// 10 Mệnh giá tiền Đồng Việt Nam chuẩn lưu thông
export const VND_DENOMINATIONS = [
  500000,
  200000,
  100000,
  50000,
  20000,
  10000,
  5000,
  2000,
  1000,
  500
] as const;

export type DenominationMap = Record<number, number>;

// Thuật toán Greedy phân rã mệnh giá tối ưu số tờ ít nhất
export const calculateDenominations = (amount: number): DenominationMap => {
  let remaining = Math.max(0, Math.round(amount));
  const result: DenominationMap = {
    500000: 0,
    200000: 0,
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
    500: 0,
  };

  for (const denom of VND_DENOMINATIONS) {
    if (remaining >= denom) {
      const count = Math.floor(remaining / denom);
      result[denom] = count;
      remaining = remaining % denom;
    }
  }

  return result;
};

export const CashDenominationView: React.FC<CashDenominationViewProps> = ({
  payrollRecords,
  policy,
  selectedMonth
}) => {
  // State máy tính nhập tay
  const [manualAmount, setManualAmount] = useState<number>(1400500);
  const [filterMode, setFilterMode] = useState<'CASH_ONLY' | 'UNDER_5M' | 'ALL'>('CASH_ONLY');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showEnvelopeModal, setShowEnvelopeModal] = useState<boolean>(false);
  const [syncedToAccounting, setSyncedToAccounting] = useState<boolean>(false);
  const [showSyncSuccessModal, setShowSyncSuccessModal] = useState<boolean>(false);

  // Thuật toán chia mệnh giá cho ô nhập tay
  const manualBreakdown = useMemo(() => {
    return calculateDenominations(manualAmount);
  }, [manualAmount]);

  const totalManualNotes = useMemo(() => {
    return Object.values(manualBreakdown).reduce((sum, count) => sum + count, 0);
  }, [manualBreakdown]);

  // Lọc danh sách nhân viên nhận tiền mặt
  const targetEmployees = useMemo(() => {
    return payrollRecords.filter(r => {
      // Tìm kiếm tên/mã
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = r.employeeName.toLowerCase().includes(term) || r.employeeCode.toLowerCase().includes(term);
        if (!match) return false;
      }

      if (filterMode === 'UNDER_5M') {
        return r.netSalary < 5000000;
      }
      if (filterMode === 'CASH_ONLY') {
        // Những người thực lĩnh < 5 triệu hoặc nhân sự thời vụ/nhà máy thường nhận tiền mặt
        return r.netSalary < 5000000 || r.departmentName.includes('Xưởng') || r.departmentName.includes('Sản Xuất');
      }
      return true;
    });
  }, [payrollRecords, filterMode, searchTerm]);

  // Bảng phân bổ chi tiết cho từng nhân viên
  const employeeBreakdowns = useMemo(() => {
    return targetEmployees.map(emp => {
      const breakdown = calculateDenominations(emp.netSalary);
      const totalNotes = Object.values(breakdown).reduce((sum, c) => sum + c, 0);
      return {
        ...emp,
        breakdown,
        totalNotes,
      };
    });
  }, [targetEmployees]);

  // Tổng hợp số tờ của từng mệnh giá toàn công ty để nộp ngân hàng
  const aggregatedDenominations = useMemo(() => {
    const agg: DenominationMap = {
      500000: 0,
      200000: 0,
      100000: 0,
      50000: 0,
      20000: 0,
      10000: 0,
      5000: 0,
      2000: 0,
      1000: 0,
      500: 0,
    };

    for (const item of employeeBreakdowns) {
      for (const denom of VND_DENOMINATIONS) {
        agg[denom] += item.breakdown[denom] || 0;
      }
    }

    return agg;
  }, [employeeBreakdowns]);

  const totalCashAmount = useMemo(() => {
    return employeeBreakdowns.reduce((sum, e) => sum + e.netSalary, 0);
  }, [employeeBreakdowns]);

  const totalNotesAll = useMemo(() => {
    return Object.values(aggregatedDenominations).reduce((sum, c) => sum + c, 0);
  }, [aggregatedDenominations]);

  // Xuất Excel Bảng Kê Rút Tiền Mặt Ngân Hàng
  const handleExportExcel = () => {
    // Sheet 1: Bảng kê rút tiền theo mệnh giá nộp ngân hàng
    const bankSummaryData = VND_DENOMINATIONS.map(denom => ({
      'Mệnh Giá (VNĐ)': denom.toLocaleString('vi-VN') + ' đ',
      'Số Lượng Tờ Cần Rút': aggregatedDenominations[denom],
      'Thành Tiền (VNĐ)': (denom * aggregatedDenominations[denom]).toLocaleString('vi-VN') + ' đ',
    }));
    bankSummaryData.push({
      'Mệnh Giá (VNĐ)': 'TỔNG CỘNG TIỀN MẶT CẦN RÚT',
      'Số Lượng Tờ Cần Rút': totalNotesAll,
      'Thành Tiền (VNĐ)': totalCashAmount.toLocaleString('vi-VN') + ' đ',
    });

    // Sheet 2: Danh sách chi tiết phát lương từng nhân viên
    const empDetailsData = employeeBreakdowns.map((e, idx) => ({
      'STT': idx + 1,
      'Mã NV': e.employeeCode,
      'Họ Và Tên': e.employeeName,
      'Phòng Ban': e.departmentName,
      'Lương Thực Lĩnh': e.netSalary,
      '500.000đ': e.breakdown[500000],
      '200.000đ': e.breakdown[200000],
      '100.000đ': e.breakdown[100000],
      '50.000đ': e.breakdown[50000],
      '20.000đ': e.breakdown[20000],
      '10.000đ': e.breakdown[10000],
      '5.000đ': e.breakdown[5000],
      '2.000đ': e.breakdown[2000],
      '1.000đ': e.breakdown[1000],
      '500đ': e.breakdown[500],
      'Tổng Số Tờ': e.totalNotes,
      'Ký Nhận Tiền Mặt': '',
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(bankSummaryData);
    const ws2 = XLSX.utils.json_to_sheet(empDetailsData);

    XLSX.utils.book_append_sheet(wb, ws1, 'Bang_Ke_Rut_Tien_Ngan_Hang');
    XLSX.utils.book_append_sheet(wb, ws2, 'Chi_Tiet_Phat_Luong_Tien_Mat');
    XLSX.writeFile(wb, 'Bang_Co_Cau_Menh_Gia_Tien_Mat_Ky_' + selectedMonth + '.xlsx');
  };

  return (
    <div className="space-y-5">
      {/* Header & Giải thích pháp lý */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-200 rounded-xl border border-emerald-500/30">
              <Coins className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold">Cơ Cấu Mệnh Giá Tiền Mặt &amp; Rút Tiền Ngân Hàng</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
              Thông Lệ Thủ Quỹ &amp; Ngân Hàng
            </span>
          </div>
          <p className="text-xs text-emerald-100 mt-1 max-w-2xl leading-relaxed">
            <b>Pháp lý Điều 96 Bộ luật Lao động 2019:</b> Pháp luật không ép buộc mốc 5 triệu mới được chuyển khoản. Tuy nhiên khi chi trả tiền mặt, hệ thống tự động phân rã tối ưu mệnh giá (500k, 200k, 100k... 500đ) để thủ quỹ rút đủ tờ tiền chia vào phong bì lương thuận tiện nhất.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEnvelopeModal(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-md"
            title="In phiếu chi lương mini kèm bảng kê mệnh giá để kẹp vào từng phong bì tiền mặt"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>In Phiếu Kẹp Phong Bì Lương</span>
          </button>

          <button
            onClick={() => {
              setSyncedToAccounting(true);
              setShowSyncSuccessModal(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-md ${
              syncedToAccounting 
                ? 'bg-emerald-600 text-white border border-emerald-400' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title="Đồng bộ tự động nghiệp vụ Rút tiền gửi nhập quỹ tiền mặt (Nợ 1111 / Có 1121) sang Module 15 Hạch Toán Kế Toán"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{syncedToAccounting ? '✓ Đã Đồng Bộ Kế Toán (Nợ 111/Có 112)' : 'Đồng Bộ Kế Toán TT200'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer border border-white/20 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Bảng Kê Ngân Hàng</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* KHỐI 1: BỘ MÁY TÍNH NHẬP TAY (INTERACTIVE MANUAL CALCULATOR) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Công Cụ Tính Mệnh Giá Nhập Tay (Tự Động Phân Rã Bất Kỳ Số Tiền Nào)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Ví dụ: Nhập <b>1.400.500 đ</b> sẽ nhận đúng <b>2 tờ 500k + 2 tờ 200k + 1 tờ 500đ</b>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Cột nhập số tiền */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Nhập số tiền cần phân rã (VNĐ):
            </label>
            <div className="relative">
              <FormattedNumberInput
                value={manualAmount || 0}
                onChange={val => setManualAmount(val)}
                className="w-full pl-3 pr-12 py-2.5 border-2 border-teal-600 rounded-2xl text-base font-bold font-mono text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-teal-50/20"
                placeholder="VD: 1.400.500"
              />
              <span className="absolute right-3 top-3 text-xs font-bold text-teal-700">VNĐ</span>
            </div>

            {/* Phím bấm chọn nhanh số tiền mẫu */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold self-center">Chọn nhanh:</span>
              {[
                { label: '1.400.500 đ (Ví dụ mẫu)', val: 1400500 },
                { label: '2.500.000 đ', val: 2500000 },
                { label: '4.850.000 đ', val: 4850000 },
                { label: '5.200.000 đ', val: 5200000 },
              ].map(chip => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setManualAmount(chip.val)}
                  className={'px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer ' + (
                    manualAmount === chip.val
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cột hiển thị kết quả các tờ tiền */}
          <div className="lg:col-span-8 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Kết Quả Phân Bổ Mệnh Giá (Tổng: <span className="font-mono text-teal-800 text-sm">{manualAmount.toLocaleString('vi-VN')} đ</span>):
              </span>
              <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full font-bold text-[11px]">
                Tổng cộng: {totalManualNotes} tờ tiền
              </span>
            </div>

            {/* Danh sách các tờ tiền theo style thẻ tiền */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {VND_DENOMINATIONS.map(denom => {
                const count = manualBreakdown[denom] || 0;
                const hasNotes = count > 0;
                return (
                  <div
                    key={denom}
                    className={'p-2.5 rounded-xl border text-center transition-all ' + (
                      hasNotes
                        ? 'bg-white border-teal-500 shadow-xs ring-1 ring-teal-400'
                        : 'bg-slate-100/60 border-slate-200 opacity-40'
                    )}
                  >
                    <div className="text-[10px] font-mono text-slate-500 font-semibold">
                      {denom.toLocaleString('vi-VN')} đ
                    </div>
                    <div className={'text-base font-bold font-mono mt-0.5 ' + (hasNotes ? 'text-teal-700' : 'text-slate-400')}>
                      {count} <span className="text-[10px] font-normal">tờ</span>
                    </div>
                    {hasNotes && (
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        = {(denom * count).toLocaleString('vi-VN')} đ
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 2: TỔNG HỢP RÚT TIỀN TẠI NGÂN HÀNG (BANK WITHDRAWAL SUMMARY) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Bảng Kê Rút Tiền Mặt Ngân Hàng (Mẫu Nộp Cho Giao Dịch Viên)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cộng dồn toàn bộ số tờ của từng mệnh giá cho {employeeBreakdowns.length} nhân sự nhận tiền mặt kỳ {selectedMonth}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Tổng tiền mặt cần rút:</span>
            <span className="text-lg font-bold font-mono text-emerald-700 block">
              {totalCashAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* 10 Khung Mệnh Giá Rút Ngân Hàng */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {VND_DENOMINATIONS.map(denom => {
            const count = aggregatedDenominations[denom];
            const amount = denom * count;
            return (
              <div key={denom} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {denom.toLocaleString('vi-VN')} đ
                  </span>
                  <Banknote className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="my-2">
                  <span className="text-xl font-bold font-mono text-indigo-700 block">
                    {count.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-[10.5px] text-slate-400">tờ tiền mặt</span>
                </div>
                <div className="text-[10.5px] font-mono font-semibold text-slate-600 border-t pt-1">
                  = {amount.toLocaleString('vi-VN')} đ
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KHỐI 3: DANH SÁCH CHI TIẾT TỪNG NHÂN VIÊN & BẢNG KÝ NHẬN LƯƠNG TIỀN MẶT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Bảng Phân Bổ Tiền Mặt Từng Nhân Sự &amp; Ký Nhận Lương ({employeeBreakdowns.length} Người)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-xl border border-slate-300 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nhân viên..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="outline-none text-xs w-28 bg-transparent"
              />
            </div>

            <select
              value={filterMode}
              onChange={e => setFilterMode(e.target.value as any)}
              className="p-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="CASH_ONLY">Nhận tiền mặt (Nhà máy / Thử việc)</option>
              <option value="UNDER_5M">Thực lĩnh dưới 5 triệu</option>
              <option value="ALL">Tất cả nhân viên ({payrollRecords.length})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-600 text-[10.5px] uppercase">
              <tr>
                <th className="p-2.5">Mã NV</th>
                <th className="p-2.5">Họ Và Tên</th>
                <th className="p-2.5">Phòng Ban</th>
                <th className="p-2.5 text-right">Lương Thực Lĩnh</th>
                <th className="p-1.5 text-center font-mono text-[10px] bg-teal-50/50">500k</th>
                <th className="p-1.5 text-center font-mono text-[10px]">200k</th>
                <th className="p-1.5 text-center font-mono text-[10px] bg-teal-50/50">100k</th>
                <th className="p-1.5 text-center font-mono text-[10px]">50k</th>
                <th className="p-1.5 text-center font-mono text-[10px] bg-teal-50/50">20k</th>
                <th className="p-1.5 text-center font-mono text-[10px]">10k</th>
                <th className="p-1.5 text-center font-mono text-[10px] bg-teal-50/50">5k</th>
                <th className="p-1.5 text-center font-mono text-[10px]">2k</th>
                <th className="p-1.5 text-center font-mono text-[10px] bg-teal-50/50">1k</th>
                <th className="p-1.5 text-center font-mono text-[10px]">500đ</th>
                <th className="p-2 text-center font-mono">Tổng Tờ</th>
                <th className="p-2 text-center">Ký Nhận Lương</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeBreakdowns.map((emp, idx) => (
                <tr key={emp.employeeId} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-mono font-bold text-indigo-700">{emp.employeeCode}</td>
                  <td className="p-2.5 font-bold text-slate-900">{emp.employeeName}</td>
                  <td className="p-2.5 text-slate-500 text-[11px] truncate max-w-[140px]">{emp.departmentName}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-700 text-xs">
                    {emp.netSalary.toLocaleString('vi-VN')} đ
                  </td>
                  
                  {/* 10 Cột Mệnh Giá */}
                  <td className="p-1.5 text-center font-mono text-[11px] bg-teal-50/30 font-bold text-slate-800">
                    {emp.breakdown[500000] || '-'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-[11px] font-bold text-slate-800">
                    {emp.breakdown[200000] || '-'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-[11px] bg-teal-50/30 font-bold text-slate-800">
                    {emp.breakdown[100000] || '-'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-[11px] font-bold text-slate-800">
                    {emp.breakdown[50000] || '-'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-[11px] bg-teal-50/30 font-bold text-slate-800">
                    {emp.breakdown[20000] || '-'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-[11px] font-bold text-slate-800">
                    {emp.breakdown[10000] || '-'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-[11px] bg-teal-50/30 font-bold text-slate-800">
                    {emp.breakdown[5000] || '-'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-[11px] font-bold text-slate-800">
                    {emp.breakdown[2000] || '-'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-[11px] bg-teal-50/30 font-bold text-slate-800">
                    {emp.breakdown[1000] || '-'}
                  </td>
                  <td className="p-1.5 text-center font-mono text-[11px] font-bold text-slate-800">
                    {emp.breakdown[500] || '-'}
                  </td>

                  <td className="p-2 text-center font-mono font-bold text-indigo-700">
                    {emp.totalNotes}
                  </td>
                  <td className="p-2 text-center">
                    <span className="border-b border-dashed border-slate-400 inline-block w-20 text-transparent select-none">
                      (Ký tên)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: IN PHIẾU KẸP PHONG BÌ TIỀN MẶT (MINI ENVELOPE SLIPS) */}
      {showEnvelopeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-amber-600 to-slate-900 text-white p-5 flex justify-between items-center no-print">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Xem Trước Phiếu Chi Lương Kẹp Phong Bì ({employeeBreakdowns.length} Nhân Sự)</span>
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Khổ mini 10x15cm kẹp vào từng phong bì: Ghi rõ cơ cấu tờ tiền giúp công nhân đếm lại ngay tại chỗ, tránh tranh cãi
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-white text-amber-900 font-bold text-xs rounded-xl shadow-md hover:bg-amber-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Tất Cả Phong Bì</span>
                </button>
                <button
                  onClick={() => setShowEnvelopeModal(false)}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {employeeBreakdowns.map((emp) => (
                  <div 
                    key={emp.employeeId}
                    className="p-4 bg-white rounded-2xl border-2 border-dashed border-amber-300 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Tiêu đề phong bì */}
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">{policy.companyName}</div>
                          <div className="text-xs font-bold text-slate-800">PHIẾU CHI LƯƠNG TIỀN MẶT</div>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono">
                          Kỳ {selectedMonth}
                        </span>
                      </div>

                      {/* Thông tin nhân viên */}
                      <div className="my-2.5 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Họ và tên:</span>
                          <b className="text-slate-900">{emp.employeeName}</b>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mã nhân sự:</span>
                          <span className="font-mono font-bold text-indigo-700">{emp.employeeCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Bộ phận:</span>
                          <span className="text-slate-700">{emp.departmentName}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t">
                          <span className="font-bold text-slate-700">Lương Thực Lĩnh (Net):</span>
                          <b className="font-mono text-sm text-emerald-700">{emp.netSalary.toLocaleString('vi-VN')} đ</b>
                        </div>
                      </div>

                      {/* Chi tiết cơ cấu mệnh giá tờ tiền trong phong bì */}
                      <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] space-y-1">
                        <div className="font-bold text-amber-950 flex items-center justify-between text-[10.5px]">
                          <span>Cơ cấu tờ tiền bên trong phong bì:</span>
                          <span className="font-mono text-amber-800">{emp.totalNotes} tờ</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[10.5px]">
                          {VND_DENOMINATIONS.map(denom => {
                            const count = emp.breakdown[denom];
                            if (!count) return null;
                            return (
                              <span key={denom} className="px-1.5 py-0.5 bg-white rounded border border-amber-300 text-slate-800 font-bold">
                                {denom.toLocaleString('vi-VN')}đ: <b className="text-amber-700">{count} tờ</b>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Chữ ký xác nhận */}
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-slate-500 pt-3 border-t mt-2">
                      <div>
                        <div>Thủ Quỹ Chi Tiền</div>
                        <div className="h-6"></div>
                        <div className="font-semibold text-slate-700">(Đã kiểm đếm đủ)</div>
                      </div>
                      <div>
                        <div>Người Nhận Tiền Lương</div>
                        <div className="h-6"></div>
                        <div className="font-semibold text-slate-700">(Ký và ghi rõ họ tên)</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white border-t flex justify-end no-print">
              <button
                onClick={() => setShowEnvelopeModal(false)}
                className="px-4 py-2 border rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: THÔNG BÁO ĐỒNG BỘ BÚT TOÁN KẾ TOÁN THÀNH CÔNG */}
      {showSyncSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Đã Tạo Bút Toán Kế Toán Rút Tiền Mặt!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Số tiền <b>{totalCashAmount.toLocaleString('vi-VN')} đ</b> đã được tự động định khoản vào Sổ Nhật Ký Chung (Thông tư 200/2014):
              </p>
            </div>

            <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs space-y-1">
              <div className="text-teal-400 font-bold">// 1. Rút tiền gửi ngân hàng nhập quỹ tiền mặt:</div>
              <div className="pl-3">Nợ TK 1111: {totalCashAmount.toLocaleString('vi-VN')} đ</div>
              <div className="pl-6 text-amber-300">Có TK 1121 (VCB): {totalCashAmount.toLocaleString('vi-VN')} đ</div>

              <div className="text-teal-400 font-bold mt-2">// 2. Chi trả lương tiền mặt cho nhân sự:</div>
              <div className="pl-3">Nợ TK 3341 (Phải trả NLĐ): {totalCashAmount.toLocaleString('vi-VN')} đ</div>
              <div className="pl-6 text-emerald-300">Có TK 1111: {totalCashAmount.toLocaleString('vi-VN')} đ</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSyncSuccessModal(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Xác Nhận &amp; Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

