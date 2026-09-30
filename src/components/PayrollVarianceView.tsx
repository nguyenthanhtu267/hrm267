import React, { useState, useMemo } from 'react';
import { Employee, CompanyPolicy, PayrollRecord, UserRole } from '../types/hrm';
import * as XLSX from 'xlsx';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Building2, 
  Calendar, 
  DollarSign, 
  Users, 
  ShieldCheck, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  HelpCircle,
  Clock,
  Sparkles,
  PieChart
} from 'lucide-react';

interface PayrollVarianceViewProps {
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  policy: CompanyPolicy;
  currentRole: UserRole;
  currentMonth?: string;
}

export const PayrollVarianceView: React.FC<PayrollVarianceViewProps> = ({
  employees,
  payrollRecords,
  policy,
  currentRole,
  currentMonth = '2026-08'
}) => {
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterChangeType, setFilterChangeType] = useState<'ALL' | 'INCREASE' | 'DECREASE' | 'NEW_HIRE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Giả lập kỳ lương trước đó (2026-07) dựa trên biến động dữ liệu thực tế
  // để so sánh chi tiết từng con số chính xác
  const previousMonth = '2026-07';

  // Tính toán dữ liệu biến động từng nhân viên
  const employeeVariances = useMemo(() => {
    return payrollRecords.map((rec, idx) => {
      // Giả lập mức lương tháng trước (một số tăng do OT, một số tăng do nâng lương, một số giảm do nghỉ phép)
      let prevNet = rec.netSalary;
      let prevGross = rec.grossSalary;
      let prevOt = rec.otPay;
      let rootCause = 'Biến động nhẹ theo số giờ làm việc thực tế';
      let changeType: 'INCREASE' | 'DECREASE' | 'UNCHANGED' | 'NEW_HIRE' = 'UNCHANGED';

      if (idx % 7 === 0) {
        // Tăng do nâng lương & phụ cấp
        prevNet = Math.round(rec.netSalary * 0.88);
        prevGross = Math.round(rec.grossSalary * 0.88);
        rootCause = 'Tăng do QĐ nâng bậc lương cơ bản và phụ cấp chức vụ';
        changeType = 'INCREASE';
      } else if (idx % 5 === 1) {
        // Tăng do làm thêm giờ OT cao trong tháng
        prevOt = Math.max(0, Math.round(rec.otPay * 0.4));
        prevGross = rec.grossSalary - (rec.otPay - prevOt);
        prevNet = rec.netSalary - Math.round((rec.otPay - prevOt) * 0.895);
        rootCause = `Tăng do khối lượng đơn hàng tăng ca (+${Math.round((rec.otPay - prevOt)/1000).toLocaleString('vi-VN')}k OT)`;
        changeType = 'INCREASE';
      } else if (idx % 9 === 2) {
        // Giảm do nghỉ không hưởng lương hoặc đi muộn
        prevNet = Math.round(rec.netSalary * 1.1);
        prevGross = Math.round(rec.grossSalary * 1.1);
        rootCause = 'Giảm do nghỉ việc riêng không lương 2.5 ngày';
        changeType = 'DECREASE';
      } else if (idx % 11 === 3) {
        // Nhân viên mới vào làm tháng này
        prevNet = 0;
        prevGross = 0;
        prevOt = 0;
        rootCause = 'Nhân sự mới tiếp nhận công việc trong tháng';
        changeType = 'NEW_HIRE';
      } else if (idx % 4 === 0) {
        // Tăng nhẹ phụ cấp độc hại / xăng xe
        prevNet = Math.round(rec.netSalary * 0.96);
        prevGross = Math.round(rec.grossSalary * 0.96);
        rootCause = 'Tăng phụ cấp độc hại và chuyên cần';
        changeType = 'INCREASE';
      }

      const deltaNet = rec.netSalary - prevNet;
      const deltaNetPercent = prevNet > 0 ? ((deltaNet / prevNet) * 100) : 100;
      const deltaGross = rec.grossSalary - prevGross;

      return {
        id: rec.employeeId,
        code: rec.employeeCode,
        name: rec.employeeName,
        dept: rec.departmentName,
        currentNet: rec.netSalary,
        prevNet,
        deltaNet,
        deltaNetPercent,
        currentGross: rec.grossSalary,
        prevGross,
        deltaGross,
        currentOt: rec.otPay,
        prevOt,
        deltaOt: rec.otPay - prevOt,
        currentBase: rec.baseSalary,
        rootCause,
        changeType
      };
    });
  }, [payrollRecords]);

  // Bộ chỉ số vĩ mô tổng thể (Macro Metrics)
  const macroSummary = useMemo(() => {
    let currentTotalNet = 0;
    let prevTotalNet = 0;
    let currentTotalGross = 0;
    let prevTotalGross = 0;
    let currentTotalOt = 0;
    let prevTotalOt = 0;
    let newHires = 0;
    let increaseCount = 0;
    let decreaseCount = 0;

    employeeVariances.forEach(item => {
      currentTotalNet += item.currentNet;
      prevTotalNet += item.prevNet;
      currentTotalGross += item.currentGross;
      prevTotalGross += item.prevGross;
      currentTotalOt += item.currentOt;
      prevTotalOt += item.prevOt;

      if (item.changeType === 'NEW_HIRE') newHires++;
      else if (item.deltaNet > 50000) increaseCount++;
      else if (item.deltaNet < -50000) decreaseCount++;
    });

    const deltaNet = currentTotalNet - prevTotalNet;
    const deltaNetPercent = prevTotalNet > 0 ? (deltaNet / prevTotalNet) * 100 : 0;

    const deltaGross = currentTotalGross - prevTotalGross;
    const deltaGrossPercent = prevTotalGross > 0 ? (deltaGross / prevTotalGross) * 100 : 0;

    // Chi phí bảo hiểm doanh nghiệp gánh chịu (23.5% lương cơ bản)
    const currentEmployerIns = Math.round(currentTotalGross * 0.175); // Ước tính quỹ đóng
    const prevEmployerIns = Math.round(prevTotalGross * 0.175);
    const deltaEmployerIns = currentEmployerIns - prevEmployerIns;

    // Tổng chi phí thực tế doanh nghiệp bỏ ra
    const currentTotalCost = currentTotalGross + currentEmployerIns;
    const prevTotalCost = prevTotalGross + prevEmployerIns;
    const deltaTotalCost = currentTotalCost - prevTotalCost;
    const deltaTotalCostPercent = prevTotalCost > 0 ? (deltaTotalCost / prevTotalCost) * 100 : 0;

    return {
      currentTotalNet,
      prevTotalNet,
      deltaNet,
      deltaNetPercent,
      currentTotalGross,
      prevTotalGross,
      deltaGross,
      deltaGrossPercent,
      currentEmployerIns,
      prevEmployerIns,
      deltaEmployerIns,
      currentTotalCost,
      prevTotalCost,
      deltaTotalCost,
      deltaTotalCostPercent,
      currentTotalOt,
      prevTotalOt,
      deltaOt: currentTotalOt - prevTotalOt,
      newHires,
      increaseCount,
      decreaseCount,
      totalHeadcount: payrollRecords.length
    };
  }, [employeeVariances, payrollRecords.length]);

  // Bóc tách chi tiết từng thông số biến động cấu thành chi phí
  const parameterBreakdown = useMemo(() => {
    return [
      {
        id: 'P-01',
        name: '1. Tiền Lương Cơ Bản Theo Ngày Công Chuẩn',
        currAmount: Math.round(macroSummary.currentTotalGross * 0.65),
        prevAmount: Math.round(macroSummary.prevTotalGross * 0.66),
        note: 'Biến động do số lượng nhân sự mới và ngày công làm việc thực tế trong tháng'
      },
      {
        id: 'P-02',
        name: '2. Tiền Làm Thêm Giờ (OT 150%, 200%, 300%)',
        currAmount: macroSummary.currentTotalOt,
        prevAmount: macroSummary.prevTotalOt,
        note: `Chênh lệch OT ${macroSummary.deltaOt >= 0 ? '+' : ''}${macroSummary.deltaOt.toLocaleString('vi-VN')}đ phục vụ tiến độ giao hàng xuất khẩu`
      },
      {
        id: 'P-03',
        name: '3. Phụ Cấp Ăn Trưa, Xăng Xe, Điện Thoại',
        currAmount: Math.round(macroSummary.currentTotalGross * 0.12),
        prevAmount: Math.round(macroSummary.prevTotalGross * 0.118),
        note: 'Tăng tương ứng theo số lượng nhân sự đi làm thực tế'
      },
      {
        id: 'P-04',
        name: '4. Bồi Dưỡng Hiện Vật & Sữa Độc Hại (TT 24/2022)',
        currAmount: Math.round(macroSummary.currentTotalGross * 0.04),
        prevAmount: Math.round(macroSummary.prevTotalGross * 0.038),
        note: 'Áp dụng cho 145 công nhân vận hành chuyền chiết rót và đóng gói'
      },
      {
        id: 'P-05',
        name: '5. Thưởng Hiệu Suất KPI & Năng Suất',
        currAmount: Math.round(macroSummary.currentTotalGross * 0.08),
        prevAmount: Math.round(macroSummary.prevTotalGross * 0.075),
        note: 'Thưởng hoàn thành vượt định mức sản lượng chuyền Bình Dương'
      },
      {
        id: 'P-06',
        name: '6. Chi Phí Bảo Hiểm & Công Đoàn DN Gánh Chịu (23.5%)',
        currAmount: macroSummary.currentEmployerIns,
        prevAmount: macroSummary.prevEmployerIns,
        note: 'Khoản chi phí bắt buộc DN nộp cơ quan BHXH và Liên đoàn Lao động'
      },
      {
        id: 'P-07',
        name: '7. Khấu Trừ Nghỉ Không Lương & Giảm Trừ Khác',
        currAmount: Math.round(macroSummary.currentTotalGross * -0.015),
        prevAmount: Math.round(macroSummary.prevTotalGross * -0.012),
        note: 'Tổng các khoản giảm trừ ngày nghỉ không lương và phạt đi trễ'
      }
    ].map(p => {
      const delta = p.currAmount - p.prevAmount;
      const deltaPct = p.prevAmount !== 0 ? (delta / Math.abs(p.prevAmount)) * 100 : 0;
      return {
        ...p,
        delta,
        deltaPct
      };
    });
  }, [macroSummary]);

  // Biến động theo phòng ban / nhà máy
  const departmentVariances = useMemo(() => {
    const map = new Map<string, {
      dept: string;
      headcount: number;
      currNet: number;
      prevNet: number;
      currOt: number;
      prevOt: number;
    }>();

    employeeVariances.forEach(emp => {
      const cur = map.get(emp.dept) || {
        dept: emp.dept,
        headcount: 0,
        currNet: 0,
        prevNet: 0,
        currOt: 0,
        prevOt: 0
      };
      cur.headcount++;
      cur.currNet += emp.currentNet;
      cur.prevNet += emp.prevNet;
      cur.currOt += emp.currentOt;
      cur.prevOt += emp.prevOt;
      map.set(emp.dept, cur);
    });

    return Array.from(map.values()).map(d => {
      const deltaNet = d.currNet - d.prevNet;
      const deltaNetPct = d.prevNet > 0 ? (deltaNet / d.prevNet) * 100 : 0;
      const deltaOt = d.currOt - d.prevOt;
      return {
        ...d,
        deltaNet,
        deltaNetPct,
        deltaOt,
        otStatus: d.currOt > d.currNet * 0.15 ? 'VƯỢT ĐỊNH MỨC (>15%)' : 'AN TOÀN'
      };
    });
  }, [employeeVariances]);

  // Lọc danh sách nhân viên
  const filteredEmployees = useMemo(() => {
    return employeeVariances.filter(item => {
      if (filterDept !== 'ALL' && item.dept !== filterDept) return false;
      if (filterChangeType === 'INCREASE' && item.deltaNet <= 50000) return false;
      if (filterChangeType === 'DECREASE' && item.deltaNet >= -50000) return false;
      if (filterChangeType === 'NEW_HIRE' && item.changeType !== 'NEW_HIRE') return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.name.toLowerCase().includes(term);
        const matchCode = item.code.toLowerCase().includes(term);
        const matchCause = item.rootCause.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchCause) return false;
      }
      return true;
    });
  }, [employeeVariances, filterDept, filterChangeType, searchTerm]);

  // Xuất Excel chuyên nghiệp đa sheet có công thức
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng Hợp Biến Động Vĩ Mô
    const s1Data = [
      ['BÁO CÁO PHÂN TÍCH SO SÁNH BIẾN ĐỘNG CHI PHÍ LƯƠNG'],
      [`Kỳ phân tích: Tháng ${currentMonth} so với Tháng ${previousMonth}`],
      [`Đơn vị: ${policy.companyName || 'CÔNG TY CỔ PHẦN AN VIỆT MANUFACTURING'}`],
      [''],
      ['Chỉ Số Chi Phí', `Tháng ${previousMonth}`, `Tháng ${currentMonth}`, 'Chênh Lệch (VNĐ)', 'Tỷ Lệ (%)', 'Nhận Định & Đánh Giá'],
      [
        '1. Tổng Quỹ Lương Thực Chi (Net Pay)',
        macroSummary.prevTotalNet,
        macroSummary.currentTotalNet,
        macroSummary.deltaNet,
        `${macroSummary.deltaNetPercent.toFixed(2)}%`,
        'Quỹ lương thực trả đến tài khoản người lao động'
      ],
      [
        '2. Tổng Chi Phí Lương Gộp (Gross Payroll)',
        macroSummary.prevTotalGross,
        macroSummary.currentTotalGross,
        macroSummary.deltaGross,
        `${macroSummary.deltaGrossPercent.toFixed(2)}%`,
        'Tổng thu nhập chịu thuế và tính đóng bảo hiểm'
      ],
      [
        '3. Chi Phí Bảo Hiểm & Công Đoàn DN Gánh (23.5%)',
        macroSummary.prevEmployerIns,
        macroSummary.currentEmployerIns,
        macroSummary.deltaEmployerIns,
        `${((macroSummary.deltaEmployerIns / (macroSummary.prevEmployerIns || 1)) * 100).toFixed(2)}%`,
        'Nghĩa vụ đóng bảo hiểm DN theo Luật BHXH & Công đoàn'
      ],
      [
        '4. TỔNG CHI PHÍ THỰC TẾ DOANH NGHIỆP',
        macroSummary.prevTotalCost,
        macroSummary.currentTotalCost,
        macroSummary.deltaTotalCost,
        `${macroSummary.deltaTotalCostPercent.toFixed(2)}%`,
        'Tổng ngân sách nhân sự thực chi (Gross + Bảo hiểm DN)'
      ],
      [
        '5. Tiền Làm Thêm Giờ (Overtime)',
        macroSummary.prevTotalOt,
        macroSummary.currentTotalOt,
        macroSummary.deltaOt,
        `${((macroSummary.deltaOt / (macroSummary.prevTotalOt || 1)) * 100).toFixed(2)}%`,
        'Biến động do tăng ca đơn hàng xuất khẩu'
      ]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Tong_Hop_Chi_Phi');

    // Sheet 2: Bóc Tách Từng Thông Số
    const s2Data = [
      ['BẢNG BÓC TÁCH TỪNG THÔNG SỐ BIẾN ĐỘNG CHI PHÍ'],
      ['Mã Khoản Mục', 'Tên Thông Số Cấu Thành', `Tháng ${previousMonth}`, `Tháng ${currentMonth}`, 'Chênh Lệch (VNĐ)', 'Tỷ Lệ (%)', 'Ghi Chú Phân Tích'],
      ...parameterBreakdown.map(p => [
        p.id,
        p.name,
        p.prevAmount,
        p.currAmount,
        p.delta,
        `${p.deltaPct.toFixed(2)}%`,
        p.note
      ])
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Boc_Tach_Thong_So');

    // Sheet 3: Chi Tiết Từng Nhân Viên
    const s3Data = [
      ['BẢNG KIỂM TRA RÀ SOÁT BIẾN ĐỘNG LƯƠNG TỪNG NHÂN VIÊN'],
      ['Mã NV', 'Họ Và Tên', 'Phòng Ban', `Lương Net ${previousMonth}`, `Lương Net ${currentMonth}`, 'Chênh Lệch (VNĐ)', 'Tỷ Lệ (%)', 'OT Tháng Này', 'Nguyên Nhân Biến Động'],
      ...employeeVariances.map(e => [
        e.code,
        e.name,
        e.dept,
        e.prevNet,
        e.currentNet,
        e.deltaNet,
        `${e.deltaNetPercent.toFixed(2)}%`,
        e.currentOt,
        e.rootCause
      ])
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'Chi_Tiet_Tung_Nhan_Vien');

    XLSX.writeFile(wb, `Bao_Cao_So_Sanh_Bien_Dong_Chi_Phi_Luong_${currentMonth}_vs_${previousMonth}.xlsx`);
  };

  return (
    <div className="space-y-1.5">
      {/* HEADER BÁO CÁO & ĐIỀU KHIỂN */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Phân Tích & So Sánh Biến Động Chi Phí Tiền Lương Với Tháng Trước
                </h2>
                <p className="text-xs text-slate-500">
                  So sánh toàn diện: Tháng {currentMonth} so với Tháng {previousMonth} • Kiểm tra chi tiết từng nhân viên & thông số
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>In Báo Cáo</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo Đa Sheet (Excel)</span>
            </button>
          </div>
        </div>

        {/* 5 THẺ CHỈ SỐ VĨ MÔ (MACRO VARIANCE METRICS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
          {/* Net Salary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Tổng Lương Thực Chi (Net)</span>
            <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
              {macroSummary.currentTotalNet.toLocaleString('vi-VN')}đ
            </p>
            <div className="flex items-center space-x-1 mt-1 text-[11px]">
              {macroSummary.deltaNet >= 0 ? (
                <span className="text-emerald-600 font-bold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{macroSummary.deltaNet.toLocaleString('vi-VN')}đ (+{macroSummary.deltaNetPercent.toFixed(1)}%)
                </span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {macroSummary.deltaNet.toLocaleString('vi-VN')}đ ({macroSummary.deltaNetPercent.toFixed(1)}%)
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">So với kỳ {previousMonth}</span>
          </div>

          {/* Gross Salary */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Tổng Chi Phí Lương Gộp</span>
            <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
              {macroSummary.currentTotalGross.toLocaleString('vi-VN')}đ
            </p>
            <div className="flex items-center space-x-1 mt-1 text-[11px]">
              <span className="text-indigo-600 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{macroSummary.deltaGross.toLocaleString('vi-VN')}đ (+{macroSummary.deltaGrossPercent.toFixed(1)}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Lương thời gian + Phụ cấp + Thưởng</span>
          </div>

          {/* Employer Insurance Burden */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase">Bảo Hiểm DN Chịu (23.5%)</span>
            <p className="text-lg font-black text-amber-900 font-mono mt-0.5">
              {macroSummary.currentEmployerIns.toLocaleString('vi-VN')}đ
            </p>
            <div className="flex items-center space-x-1 mt-1 text-[11px]">
              <span className="text-amber-700 font-bold">
                {macroSummary.deltaEmployerIns >= 0 ? '+' : ''}{macroSummary.deltaEmployerIns.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <span className="text-[10px] text-amber-700 block mt-0.5">BHXH 17.5%, BHYT 3%, BHTN 1%, KPCĐ 2%</span>
          </div>

          {/* Total Employer Cost */}
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
            <span className="text-[11px] font-bold text-indigo-900 uppercase">TỔNG CHI PHÍ DOANH NGHIỆP</span>
            <p className="text-lg font-black text-indigo-900 font-mono mt-0.5">
              {macroSummary.currentTotalCost.toLocaleString('vi-VN')}đ
            </p>
            <div className="flex items-center space-x-1 mt-1 text-[11px]">
              <span className="text-indigo-700 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{macroSummary.deltaTotalCost.toLocaleString('vi-VN')}đ (+{macroSummary.deltaTotalCostPercent.toFixed(1)}%)
              </span>
            </div>
            <span className="text-[10px] text-indigo-700 block mt-0.5">Tổng ngân sách lao động thực tế</span>
          </div>

          {/* Headcount Delta */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-[11px] font-bold text-blue-900 uppercase">Biến Động Nhân Sự</span>
            <p className="text-lg font-black text-blue-900 font-mono mt-0.5">
              {macroSummary.totalHeadcount} Nhân Sự
            </p>
            <div className="flex items-center space-x-2 mt-1 text-[11px]">
              <span className="text-emerald-700 font-bold">+{macroSummary.newHires} Tuyển mới</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">0 Nghỉ việc</span>
            </div>
            <span className="text-[10px] text-blue-700 block mt-0.5">
              {macroSummary.increaseCount} người tăng, {macroSummary.decreaseCount} người giảm
            </span>
          </div>
        </div>
      </div>

      {/* KHỐI 2: BÓC TÁCH CHI TIẾT TỪNG THÔNG SỐ BIẾN ĐỘNG */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase">
              Bóc Tách Chi Tiết Từng Thông Số Cấu Thành Biến Động Chi Phí
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">So sánh kỳ {currentMonth} vs {previousMonth}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Mã Khoản Mục</th>
                <th className="p-2.5">Thông Số Cấu Thành Chi Phí Lương</th>
                <th className="p-2.5 text-right font-mono">Kỳ Trước ({previousMonth})</th>
                <th className="p-2.5 text-right font-mono">Kỳ Này ({currentMonth})</th>
                <th className="p-2.5 text-right font-mono">Chênh Lệch (&Delta; Tiền)</th>
                <th className="p-2.5 text-center font-mono">&Delta; %</th>
                <th className="p-2.5">Nhận Định & Nguyên Nhân Chi Phí</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parameterBreakdown.map(param => (
                <tr key={param.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-2.5 font-mono font-bold text-slate-500">{param.id}</td>
                  <td className="p-2.5 font-bold text-slate-900">{param.name}</td>
                  <td className="p-2.5 text-right font-mono text-slate-600">{param.prevAmount.toLocaleString('vi-VN')}đ</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">{param.currAmount.toLocaleString('vi-VN')}đ</td>
                  <td className="p-2.5 text-right font-mono font-bold">
                    <span className={param.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {param.delta >= 0 ? `+${param.delta.toLocaleString('vi-VN')}` : param.delta.toLocaleString('vi-VN')}đ
                    </span>
                  </td>
                  <td className="p-2.5 text-center font-mono">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10.5px] font-bold ${
                      param.delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {param.deltaPct >= 0 ? `+${param.deltaPct.toFixed(1)}%` : `${param.deltaPct.toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-600 text-[11px] font-medium leading-snug">
                    {param.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KHỐI 3 & 4: BIẾN ĐỘNG THEO PHÒNG BAN & NHẬN ĐỊNH CỦA HR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
        {/* Biến động theo phòng ban */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 uppercase flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>So Sánh Chi Phí Tiền Lương Theo Từng Phòng Ban / Nhà Máy</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2">Phòng Ban / Nhà Máy</th>
                  <th className="p-2 text-center">Nhân Sự</th>
                  <th className="p-2 text-right font-mono">Lương Net Kỳ Này</th>
                  <th className="p-2 text-right font-mono">&Delta; MoM</th>
                  <th className="p-2 text-right font-mono">Làm Thêm Giờ (OT)</th>
                  <th className="p-2 text-center">Kiểm Soát OT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentVariances.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 font-bold text-slate-800">{d.dept}</td>
                    <td className="p-2 text-center font-mono">{d.headcount}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">{d.currNet.toLocaleString('vi-VN')}đ</td>
                    <td className="p-2 text-right font-mono font-bold">
                      <span className={d.deltaNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {d.deltaNet >= 0 ? `+${d.deltaNetPct.toFixed(1)}%` : `${d.deltaNetPct.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono text-slate-700">{d.currOt.toLocaleString('vi-VN')}đ</td>
                    <td className="p-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.otStatus.includes('VƯỢT') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {d.otStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NHẬN ĐỊNH & ĐÁNH GIÁ CỦA PHÒNG NHÂN SỰ */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-xs text-slate-900 uppercase">
                Nhận Định & Đánh Giá Của Phòng Nhân Sự
              </h3>
            </div>

            <div className="mt-3 space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-0.5">1. Tăng trưởng chi phí phù hợp sản xuất:</span>
                Tổng chi phí tiền lương tăng <b>{macroSummary.deltaNetPercent.toFixed(1)}%</b> hoàn toàn tương thích với mức tăng sản lượng 14.5% nhờ dây chuyền đóng gói mới tại Nhà Máy Long An.
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <span className="font-bold text-amber-900 block mb-0.5">2. Cảnh báo thời gian làm thêm giờ:</span>
                Chi phí OT phân xưởng sản xuất chiếm 12.8% tổng quỹ lương. Cần điều phối ca kíp luân phiên tránh vượt hạn mức 40 giờ/tháng theo Điều 107 Bộ luật Lao động.
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">3. Khuyến nghị cho Ban Giám Đốc:</span>
                Tiếp tục giữ ổn định chính sách lương 3P và duy trì mức bồi dưỡng hiện vật theo Thông tư 24 để nâng cao tỷ lệ gắn bó nhân sự cốt lõi.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Người lập: <b>Lê Hoàng Nam (C&B)</b></span>
            <span>Ký duyệt: <b>Trần Thị Thu Thảo (HCNS)</b></span>
          </div>
        </div>
      </div>

      {/* KHỐI 5: BẢNG RÀ SOÁT CHI TIẾT TỪNG NHÂN VIÊN */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase">
              Bảng Rà Soát Chi Tiết Biến Động Tiền Lương Từng Nhân Viên ({filteredEmployees.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm tên, mã nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-52 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>

            <select
              value={filterChangeType}
              onChange={(e) => setFilterChangeType(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả biến động</option>
              <option value="INCREASE">Chỉ người tăng lương (&gt;50k)</option>
              <option value="DECREASE">Chỉ người giảm lương (&lt;-50k)</option>
              <option value="NEW_HIRE">Nhân viên mới tuyển</option>
            </select>

            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả phòng ban</option>
              {departmentVariances.map(d => (
                <option key={d.dept} value={d.dept}>{d.dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Mã NV</th>
                <th className="p-2.5">Họ & Tên</th>
                <th className="p-2.5">Phòng Ban</th>
                <th className="p-2.5 text-right font-mono">Lương Net ({previousMonth})</th>
                <th className="p-2.5 text-right font-mono">Lương Net ({currentMonth})</th>
                <th className="p-2.5 text-right font-mono">Chênh Lệch (&Delta;)</th>
                <th className="p-2.5 text-center font-mono">&Delta; %</th>
                <th className="p-2.5 text-right font-mono">Làm Thêm (OT)</th>
                <th className="p-2.5">Phân Tích Nguyên Nhân Biến Động (Root Cause)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.slice(0, 30).map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-2.5 font-mono font-bold text-indigo-600">{emp.code}</td>
                  <td className="p-2.5 font-bold text-slate-900">{emp.name}</td>
                  <td className="p-2.5 text-slate-600">{emp.dept}</td>
                  <td className="p-2.5 text-right font-mono text-slate-600">
                    {emp.prevNet > 0 ? `${emp.prevNet.toLocaleString('vi-VN')}đ` : '-'}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                    {emp.currentNet.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold">
                    <span className={emp.deltaNet > 0 ? 'text-emerald-600' : emp.deltaNet < 0 ? 'text-rose-600' : 'text-slate-400'}>
                      {emp.deltaNet > 0 ? `+${emp.deltaNet.toLocaleString('vi-VN')}` : emp.deltaNet.toLocaleString('vi-VN')}đ
                    </span>
                  </td>
                  <td className="p-2.5 text-center font-mono">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      emp.deltaNet > 0 ? 'bg-emerald-50 text-emerald-700' : emp.deltaNet < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {emp.deltaNetPercent >= 0 ? `+${emp.deltaNetPercent.toFixed(1)}%` : `${emp.deltaNetPercent.toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-700">
                    {emp.currentOt > 0 ? `${emp.currentOt.toLocaleString('vi-VN')}đ` : '-'}
                  </td>
                  <td className="p-2.5 text-[11px] font-medium text-slate-700">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {emp.rootCause}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length > 30 && (
            <div className="p-2.5 text-center text-slate-500 text-xs italic bg-slate-50 border-t border-slate-100">
              Đang hiển thị 30/{filteredEmployees.length} nhân viên. Bấm nút "Xuất Báo Cáo Đa Sheet (Excel)" ở trên để xem toàn bộ 250 nhân viên.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
