import React, { useState, useMemo, useEffect } from 'react';
import { Employee, CompanyPolicy, PayrollRecord, UserRole } from '../types/hrm';
import { calculateEmployeePayroll } from '../services/payrollEngine';
import { getEmployeePayrollScenario } from '../services/mockData';
import { excelService } from '../services/excelService';
import * as XLSX from 'xlsx';
import { BankTransferAuditView } from './BankTransferAuditView';
import { CompactPagination, evaluateColumnCondition } from './SmartTableFilter';
import { 
  BadgePercent, 
  Download, 
  Building2, 
  CreditCard, 
  FileText, 
  Lock, 
  Unlock, 
  Printer, 
  X, 
  CheckCircle2, 
  Coins,
  Milk,
  DollarSign,
  ShieldCheck,
  FileSpreadsheet,
  HandCoins,
  AlertTriangle,
  Calendar,
  User,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  CheckSquare,
  Square,
  FileCheck,
  Eye,
  TrendingUp
} from 'lucide-react';
import { PayrollVarianceView } from './PayrollVarianceView';
import { CashDenominationView } from './CashDenominationView';

interface PayrollViewProps {
  employees: Employee[];
  policy: CompanyPolicy;
  currentRole: UserRole;
  initialTab?: 'PAYROLL_TABLE' | 'ADVANCE_MANAGEMENT' | 'BANK_AUDIT' | 'MOM_VARIANCE';
}

export const PayrollView: React.FC<PayrollViewProps> = ({ employees, policy, currentRole, initialTab = 'PAYROLL_TABLE' }) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [isLocked, setIsLocked] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  // State Quản Lý Gửi Email Hàng Loạt & Xuất Phiếu Lương
  const [selectedEmpIdsForEmail, setSelectedEmpIdsForEmail] = useState<Set<string>>(new Set());
  const [showBulkEmailModal, setShowBulkEmailModal] = useState<boolean>(false);
  const [emailSendingProgress, setEmailSendingProgress] = useState<number>(0);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailLogs, setEmailLogs] = useState<Array<{ name: string; code: string; email: string; net: number; status: 'SUCCESS' | 'SENDING' | 'PENDING'; time: string }>>([]);
  const [emailGrouping, setEmailGrouping] = useState<'SELECTED' | 'ALL' | 'DEPARTMENT' | 'FACTORY'>('SELECTED');
  const [emailSecurityPass, setEmailSecurityPass] = useState<'CCCD' | 'DOB' | 'NONE'>('CCCD');

  const [activeSubTab, setActiveSubTab] = useState<'PAYROLL_TABLE' | 'ADVANCE_MANAGEMENT' | 'BANK_AUDIT' | 'MOM_VARIANCE' | 'CASH_DENOMINATION'>(initialTab);

  const currentTenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === policy.tenantId);
  }, [employees, policy.tenantId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [colFilters, setColFilters] = useState({
    code: '',
    name: '',
    dept: '',
    workDays: '',
    baseSalary: '',
    otPay: '',
    toxic: '',
    gross: '',
    ins: '',
    tax: '',
    advance: '',
    net: '',
  });

  // Sinh bảng lương chi tiết chuẩn xác cho toàn bộ nhân sự theo kịch bản thực tế
  const payrollRecords: PayrollRecord[] = useMemo(() => {
    return currentTenantEmployees.map((emp) => {
      const scenarioOpts = getEmployeePayrollScenario(emp, policy, selectedMonth);
      return calculateEmployeePayroll(emp, policy, scenarioOpts);
    });
  }, [currentTenantEmployees, policy, selectedMonth]);

  const departmentList = useMemo(() => {
    const set = new Set(currentTenantEmployees.map(e => e.departmentName).filter(Boolean));
    return Array.from(set).sort();
  }, [currentTenantEmployees]);

  const [sortField, setSortField] = useState<keyof PayrollRecord | 'none'>('none');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: keyof PayrollRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredPayrollRecords = useMemo(() => {
    let result = payrollRecords.filter(rec => {
      if (selectedDept !== 'ALL' && rec.departmentName !== selectedDept) return false;
      if (selectedStatusFilter === 'ACTIVE' && rec.actualWorkDays === 0) return false;
      if (selectedStatusFilter === 'RESIGNED' && rec.actualWorkDays > 0) return false;
      if (selectedStatusFilter === 'WITH_DEBT' && (!rec.salaryAdvance || rec.salaryAdvance === 0)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = rec.employeeName.toLowerCase().includes(q);
        const matchCode = rec.employeeCode.toLowerCase().includes(q);
        const matchDept = rec.departmentName.toLowerCase().includes(q);
        const matchPos = rec.position.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDept && !matchPos) return false;
      }

      // Lọc điều kiện toán tử từng cột
      if (colFilters.code && !evaluateColumnCondition(rec.employeeCode, colFilters.code)) return false;
      if (colFilters.name && !evaluateColumnCondition(rec.employeeName, colFilters.name)) return false;
      if (colFilters.dept && !evaluateColumnCondition(rec.departmentName, colFilters.dept)) return false;
      if (colFilters.workDays && !evaluateColumnCondition(rec.actualWorkDays, colFilters.workDays)) return false;
      if (colFilters.baseSalary && !evaluateColumnCondition(rec.actualBaseSalary, colFilters.baseSalary)) return false;
      if (colFilters.otPay && !evaluateColumnCondition(rec.totalOtPay, colFilters.otPay)) return false;
      if (colFilters.toxic && !evaluateColumnCondition(rec.toxicInKindCashValue, colFilters.toxic)) return false;
      if (colFilters.gross && !evaluateColumnCondition(rec.totalGrossIncome, colFilters.gross)) return false;
      if (colFilters.ins && !evaluateColumnCondition(rec.totalInsuranceEmp, colFilters.ins)) return false;
      if (colFilters.tax && !evaluateColumnCondition(rec.personalIncomeTax, colFilters.tax)) return false;
      if (colFilters.advance && !evaluateColumnCondition(rec.salaryAdvance, colFilters.advance)) return false;
      if (colFilters.net && !evaluateColumnCondition(rec.netSalary, colFilters.net)) return false;

      return true;
    });

    if (sortField !== 'none') {
      result = [...result].sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        const strA = String(valA || '');
        const strB = String(valB || '');
        return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [payrollRecords, selectedDept, selectedStatusFilter, searchQuery, colFilters, sortField, sortAsc]);

  const totalFiltered = filteredPayrollRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedPayrollRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayrollRecords.slice(start, start + pageSize);
  }, [filteredPayrollRecords, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedDept, selectedStatusFilter, searchQuery]);

  // Tổng cộng toàn công ty
  const totalGross = payrollRecords.reduce((sum, r) => sum + r.totalGrossIncome, 0);
  const totalNet = payrollRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const totalTax = payrollRecords.reduce((sum, r) => sum + r.personalIncomeTax, 0);
  const totalInsuranceEmp = payrollRecords.reduce((sum, r) => sum + r.totalInsuranceEmp, 0);
  const totalCompanyLaborCost = payrollRecords.reduce((sum, r) => sum + r.totalLaborCostComp, 0);
  const totalAdvanceDeduction = payrollRecords.reduce((sum, r) => sum + (r.salaryAdvance || 0), 0);
  const totalActivePaidCount = payrollRecords.filter(r => r.actualWorkDays > 0).length;

  // Xuất Excel
  const handleExportPayrollExcel = () => {
    excelService.exportPayroll(payrollRecords, selectedMonth);
  };


  // ========================================================
  // XUẤT EXCEL PHIẾU LƯƠNG CÁ NHÂN (CÓ CÔNG THỨC EXCEL THẬT)
  // ========================================================
  // 1. Xuất phiếu lương 1 tháng có công thức
  const handleExportSingleMonthPayslipExcel = (rec: PayrollRecord) => {
    const wb = XLSX.utils.book_new();

    const title = [[`PHIẾU LƯƠNG ĐIỆN TỬ - KỲ LƯƠNG ${rec.month}`]];
    const company = [[`Đơn vị chi trả: ${policy.companyName} • Mã số thuế: ${policy.taxCode}`]];
    const empty = [[]];
    const empInfo = [
      ['Họ và tên:', rec.employeeName, '', 'Mã nhân viên:', rec.employeeCode],
      ['Phòng ban / Xưởng:', rec.departmentName, '', 'Chức vụ:', rec.position],
      ['Số tài khoản ngân hàng:', rec.bankAccount, '', 'Ngân hàng thụ hưởng:', rec.bankName],
      ['Ngày công tiêu chuẩn:', rec.standardDays, '', 'Ngày công làm việc thực tế:', rec.actualWorkDays]
    ];

    const part1Title = [['I. CÁC KHOẢN THU NHẬP (GROSS INCOME)', 'SỐ TIỀN (VNĐ)', 'GHI CHÚ']];
    const part1Rows = [
      ['1. Lương cơ bản theo ngày công làm việc', rec.actualBaseSalary, `Định mức ${rec.baseSalary.toLocaleString('vi-VN')} đ`],
      ['2. Lương chức danh / năng lực 3P', rec.positionSalary, 'Theo kết quả đánh giá vị trí'],
      ['3. Phụ cấp ăn trưa (miễn thuế TNCN)', rec.lunchAllowance, '730.000 đ/tháng'],
      ['4. Phụ cấp xăng xe, điện thoại, công tác', rec.transportAllowance + rec.phoneAllowance, 'Khoán chi nghiệp vụ'],
      ['5. Bồi dưỡng độc hại hiện vật (TT 24/2022/TT-BLĐTBXH)', rec.toxicInKindCashValue, rec.toxicInKindCashValue > 0 ? 'Hiện vật quy đổi' : 'Không thuộc danh mục'],
      ['6. Tiền làm thêm giờ (OT) & Phụ cấp ca đêm', rec.totalOtPay, `${rec.otHours}h OT theo hệ số BLLĐ`],
      ['7. Thưởng KPI hoàn thành mục tiêu & chuyên cần', rec.kpiBonus, 'Đạt chỉ tiêu tháng']
    ];
    // Dòng Tổng Gross dùng công thức SUM từ dòng 13 đến 19
    const part1Total = [['TỔNG THU NHẬP GROSS (I)', { t: 'n', f: 'SUM(B13:B19)' }, 'Tổng các khoản thu nhập trước trích nộp']];

    const part2Title = [['II. CÁC KHOẢN TRÍCH NỘP & KHẤU TRỪ', 'SỐ TIỀN (VNĐ)', 'TỶ LỆ TRÍCH']];
    const part2Rows = [
      ['1. Bảo hiểm xã hội NLĐ (BHXH)', rec.bhxhEmp, '8% trên lương đóng bảo hiểm'],
      ['2. Bảo hiểm y tế NLĐ (BHYT)', rec.bhytEmp, '1.5% trên lương đóng bảo hiểm'],
      ['3. Bảo hiểm thất nghiệp NLĐ (BHTN)', rec.bhtnEmp, '1% trên lương đóng bảo hiểm'],
      ['4. Đoàn phí công đoàn', rec.unionEmp, '1% (theo Điều lệ CĐVN)'],
      ['5. Thuế thu nhập cá nhân (TNCN lũy tiến)', rec.personalIncomeTax, 'Theo biểu thuế 7 bậc BLLĐ'],
      ['6. Tạm ứng giữa tháng đã nhận', rec.salaryAdvance, rec.salaryAdvance > 0 ? 'Đã chi tiền mặt/CK giữa tháng' : 'Không phát sinh']
    ];
    // Dòng Tổng Giảm Trừ dùng công thức SUM từ dòng 22 đến 27
    const part2Total = [['TỔNG CÁC KHOẢN KHẤU TRỪ (II)', { t: 'n', f: 'SUM(B22:B27)' }, 'Các khoản giảm trừ trừ trực tiếp vào lương']];

    // Dòng Thực Lĩnh NET = Tổng Gross (B20) - Tổng Khấu Trừ (B28)
    const part3Title = [['III. THỰC LĨNH CHUYỂN KHOẢN (NET SALARY)', 'SỐ TIỀN (VNĐ)', 'TRẠNG THÁI']];
    const part3Net = [['THỰC LĨNH CHUYỂN KHOẢN (NET = I - II)', { t: 'n', f: 'B20-B28' }, '✓ ĐÃ DUYỆT CHI QUA TÀI KHOẢN NGÂN HÀNG']];

    const signatures = [
      [],
      ['NGƯỜI LẬP BIỂU', '', 'KẾ TOÁN TRƯỞNG', '', 'TỔNG GIÁM ĐỐC / ĐẠI DIỆN DOANH NGHIỆP'],
      ['(Ký, ghi rõ họ tên)', '', '(Ký, ghi rõ họ tên)', '', '(Đã ký số điện tử CA)']
    ];

    const wsData = [
      ...title,
      ...company,
      ...empty,
      ...empInfo,
      ...empty,
      ...part1Title,
      ...part1Rows,
      ...part1Total,
      ...empty,
      ...part2Title,
      ...part2Rows,
      ...part2Total,
      ...empty,
      ...part3Title,
      ...part3Net,
      ...signatures
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, `Phieu_Luong_${rec.month}`);
    XLSX.writeFile(wb, `Phieu_Luong_${rec.employeeCode}_${rec.employeeName.replace(/\s+/g, '_')}_${rec.month}.xlsx`);
  };

  // 2. Xuất phiếu lương CẢ NĂM 12 THÁNG (Sheet đầu Tổng Hợp Cả Năm + 12 Sheet Tháng Chi Tiết)
  const handleExportFullYearPayslipExcel = (rec: PayrollRecord) => {
    const wb = XLSX.utils.book_new();
    const currentYear = rec.month.split('-')[0] || '2026';
    const emp = currentTenantEmployees.find(e => e.code === rec.employeeCode) || currentTenantEmployees[0];

    // --- SHEET 1: TỔNG HỢP CẢ NĂM 2026 ---
    const summaryTitle = [[`BẢNG TỔNG HỢP LƯƠNG & THU NHẬP CẢ NĂM ${currentYear}`]];
    const summarySub = [[`Nhân viên: ${rec.employeeName} • Mã NV: ${rec.employeeCode} • Phòng ban: ${rec.departmentName} • Vị trí: ${rec.position}`]];
    const summaryCompany = [[`Doanh nghiệp: ${policy.companyName} • MST: ${policy.taxCode}`]];
    const summaryEmpty = [[]];

    const summaryHeaders = [
      'Kỳ Tháng',
      'Ngày Công',
      'Lương Cơ Bản',
      'Phụ Cấp Ăn Ca',
      'Tiền Làm Thêm (OT)',
      'Thưởng KPI',
      'Tổng Thu Nhập Gross',
      'Trích Nộp BHXH/YT/TN',
      'Thuế TNCN',
      'Tạm Ứng',
      'Thực Lĩnh Net'
    ];

    // Dữ liệu 12 tháng với công thức liên kết động sang từng Sheet tháng
    const monthlySummaryRows = [];
    for (let m = 1; m <= 12; m++) {
      const monthPadded = m < 10 ? `0${m}` : `${m}`;
      const sheetName = `Thang_${monthPadded}`;
      // Hàng tham chiếu công thức từ các sheet con
      monthlySummaryRows.push([
        `Tháng ${monthPadded}/${currentYear}`,
        { t: 'n', f: `'${sheetName}'!B8` },   // Ngày công
        { t: 'n', f: `'${sheetName}'!B13` },  // Lương CB
        { t: 'n', f: `'${sheetName}'!B15` },  // Phụ cấp ăn
        { t: 'n', f: `'${sheetName}'!B18` },  // Tiền OT
        { t: 'n', f: `'${sheetName}'!B19` },  // Thưởng KPI
        { t: 'n', f: `'${sheetName}'!B20` },  // Tổng Gross
        { t: 'n', f: `SUM('${sheetName}'!B22:B24)` }, // BHXH + BHYT + BHTN
        { t: 'n', f: `'${sheetName}'!B26` },  // Thuế TNCN
        { t: 'n', f: `'${sheetName}'!B27` },  // Tạm ứng
        { t: 'n', f: `'${sheetName}'!B28` }   // Thực Lĩnh Net
      ]);
    }

    // Dòng TỔNG CỘNG CẢ NĂM (công thức SUM của 12 tháng từ hàng 6 đến 17)
    const summaryTotalRow = [
      'TỔNG CỘNG CẢ NĂM',
      { t: 'n', f: 'SUM(B6:B17)' },
      { t: 'n', f: 'SUM(C6:C17)' },
      { t: 'n', f: 'SUM(D6:D17)' },
      { t: 'n', f: 'SUM(E6:E17)' },
      { t: 'n', f: 'SUM(F6:F17)' },
      { t: 'n', f: 'SUM(G6:G17)' },
      { t: 'n', f: 'SUM(H6:H17)' },
      { t: 'n', f: 'SUM(I6:I17)' },
      { t: 'n', f: 'SUM(J6:J17)' },
      { t: 'n', f: 'SUM(K6:K17)' }
    ];

    // Dòng BÌNH QUÂN THÁNG (công thức AVERAGE của 12 tháng từ hàng 6 đến 17)
    const summaryAvgRow = [
      'BÌNH QUÂN / THÁNG',
      { t: 'n', f: 'AVERAGE(B6:B17)' },
      { t: 'n', f: 'AVERAGE(C6:C17)' },
      { t: 'n', f: 'AVERAGE(D6:D17)' },
      { t: 'n', f: 'AVERAGE(E6:E17)' },
      { t: 'n', f: 'AVERAGE(F6:F17)' },
      { t: 'n', f: 'AVERAGE(G6:G17)' },
      { t: 'n', f: 'AVERAGE(H6:F17)' },
      { t: 'n', f: 'AVERAGE(I6:I17)' },
      { t: 'n', f: 'AVERAGE(J6:J17)' },
      { t: 'n', f: 'AVERAGE(K6:K17)' }
    ];

    const summarySheetData = [
      ...summaryTitle,
      ...summarySub,
      ...summaryCompany,
      ...summaryEmpty,
      summaryHeaders,
      ...monthlySummaryRows,
      summaryTotalRow,
      summaryAvgRow
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(wb, wsSummary, `Tong_Hop_Nam_${currentYear}`);

    // --- CÁC SHEET TIẾP THEO: 12 THÁNG CHI TIẾT (Thang_01 -> Thang_12) ---
    for (let m = 1; m <= 12; m++) {
      const monthPadded = m < 10 ? `0${m}` : `${m}`;
      const monthStr = `${currentYear}-${monthPadded}`;
      const sheetName = `Thang_${monthPadded}`;

      // Tính toán lương thực tế của nhân viên cho từng tháng
      const scenarioOpts = getEmployeePayrollScenario(emp, policy, monthStr);
      const mRec = calculateEmployeePayroll(emp, policy, scenarioOpts);

      const mTitle = [[`PHIẾU LƯƠNG CHI TIẾT - THÁNG ${monthPadded}/${currentYear}`]];
      const mCompany = [[`Đơn vị: ${policy.companyName} • Nhân viên: ${mRec.employeeName} (${mRec.employeeCode})`]];
      const mEmpty = [[]];
      const mInfo = [
        ['Phòng ban / Xưởng:', mRec.departmentName, '', 'Chức vụ:', mRec.position],
        ['Số tài khoản:', mRec.bankAccount, '', 'Ngân hàng:', mRec.bankName],
        ['Ngày công tiêu chuẩn:', mRec.standardDays, '', 'Ngày công thực tế:', mRec.actualWorkDays]
      ];

      const mPart1Title = [['I. THU NHẬP (GROSS)', 'SỐ TIỀN (VNĐ)', 'DIỄN GIẢI']];
      const mPart1Rows = [
        ['1. Lương cơ bản', mRec.actualBaseSalary, 'Theo ngày công thực tế'],
        ['2. Lương vị trí 3P', mRec.positionSalary, 'Định mức theo chức danh'],
        ['3. Phụ cấp ăn trưa', mRec.lunchAllowance, 'Miễn thuế TNCN'],
        ['4. Phụ cấp xăng xe, điện thoại', mRec.transportAllowance + mRec.phoneAllowance, 'Khoán chi phí'],
        ['5. Bồi dưỡng độc hại hiện vật', mRec.toxicInKindCashValue, 'Theo Thông tư 24/2022'],
        ['6. Tiền làm thêm giờ (OT)', mRec.totalOtPay, `${mRec.otHours} giờ làm thêm`],
        ['7. Thưởng KPI & Chuyên cần', mRec.kpiBonus, 'Hoàn thành nhiệm vụ']
      ];
      const mPart1Total = [['TỔNG THU NHẬP GROSS (I)', { t: 'n', f: 'SUM(B13:B19)' }, 'Tổng thu nhập trước giảm trừ']];

      const mPart2Title = [['II. CÁC KHOẢN KHẤU TRỪ', 'SỐ TIỀN (VNĐ)', 'GHI CHÚ']];
      const mPart2Rows = [
        ['1. BHXH NLĐ (8%)', mRec.bhxhEmp, 'Trừ vào lương'],
        ['2. BHYT NLĐ (1.5%)', mRec.bhytEmp, 'Trừ vào lương'],
        ['3. BHTN NLĐ (1%)', mRec.bhtnEmp, 'Trừ vào lương'],
        ['4. Đoàn phí công đoàn (1%)', mRec.unionEmp, 'Đoàn phí CĐ'],
        ['5. Thuế thu nhập cá nhân (TNCN)', mRec.personalIncomeTax, 'Lũy tiến từng phần 7 bậc'],
        ['6. Tạm ứng giữa tháng', mRec.salaryAdvance, 'Đã chi giữa tháng']
      ];
      const mPart2Total = [['TỔNG CÁC KHOẢN KHẤU TRỪ (II)', { t: 'n', f: 'SUM(B22:B27)' }, 'Các khoản trích nộp']];

      const mPart3Title = [['III. THỰC LĨNH CHUYỂN KHOẢN (NET)', 'SỐ TIỀN (VNĐ)', 'XÁC NHẬN']];
      const mPart3Net = [['THỰC LĨNH CHUYỂN KHOẢN (NET = I - II)', { t: 'n', f: 'B20-B28' }, '✓ ĐÃ CHUYỂN KHOẢN VCB']];

      const mSheetData = [
        ...mTitle,
        ...mCompany,
        ...mEmpty,
        ...mInfo,
        ...mEmpty,
        ...mPart1Title,
        ...mPart1Rows,
        ...mPart1Total,
        ...mEmpty,
        ...mPart2Title,
        ...mPart2Rows,
        ...mPart2Total,
        ...mEmpty,
        ...mPart3Title,
        ...mPart3Net
      ];

      const mWs = XLSX.utils.aoa_to_sheet(mSheetData);
      XLSX.utils.book_append_sheet(wb, mWs, sheetName);
    }

    XLSX.writeFile(wb, `Bang_Luong_Ca_Nam_${currentYear}_${rec.employeeCode}_${rec.employeeName.replace(/\s+/g, '_')}.xlsx`);
  };

  // ========================================================
  // GỬI EMAIL HÀNG LOẠT PHIẾU LƯƠNG THEO PHÂN NHÓM
  // ========================================================
  // Danh sách nhân viên nhận email theo nhóm đã chọn
  const recipientsForEmail = useMemo(() => {
    if (emailGrouping === 'ALL') {
      return filteredPayrollRecords;
    } else if (emailGrouping === 'DEPARTMENT') {
      return filteredPayrollRecords.filter(r => selectedDept === 'ALL' || r.departmentName === selectedDept);
    } else if (emailGrouping === 'FACTORY') {
      return filteredPayrollRecords.filter(r => r.departmentName.includes('Xưởng') || r.departmentName.includes('Sản Xuất') || r.departmentName.includes('Đóng Gói'));
    } else {
      // Selected
      if (selectedEmpIdsForEmail.size === 0) {
        return filteredPayrollRecords;
      }
      return filteredPayrollRecords.filter(r => selectedEmpIdsForEmail.has(r.employeeId));
    }
  }, [emailGrouping, filteredPayrollRecords, selectedDept, selectedEmpIdsForEmail]);

  // Chọn / Hủy chọn tất cả nhân viên trên trang hiện tại
  const toggleSelectAllCurrentPage = () => {
    const pageEmpIds = paginatedPayrollRecords.map(r => r.employeeId);
    const allSelected = pageEmpIds.every(id => selectedEmpIdsForEmail.has(id));
    const next = new Set(selectedEmpIdsForEmail);
    if (allSelected) {
      pageEmpIds.forEach(id => next.delete(id));
    } else {
      pageEmpIds.forEach(id => next.add(id));
    }
    setSelectedEmpIdsForEmail(next);
  };

  const toggleSelectEmp = (empId: string) => {
    const next = new Set(selectedEmpIdsForEmail);
    if (next.has(empId)) {
      next.delete(empId);
    } else {
      next.add(empId);
    }
    setSelectedEmpIdsForEmail(next);
  };

  // Bắt đầu gửi email hàng loạt
  const handleStartSendingBulkEmail = () => {
    if (recipientsForEmail.length === 0) {
      alert('Chưa có nhân viên nào được chọn để gửi email phiếu lương!');
      return;
    }

    setIsSendingEmail(true);
    setEmailSendingProgress(0);
    setEmailLogs([]);

    const total = recipientsForEmail.length;
    let sentCount = 0;

    const interval = setInterval(() => {
      if (sentCount >= total) {
        clearInterval(interval);
        setIsSendingEmail(false);
        setEmailSendingProgress(100);
        return;
      }

      const rec = recipientsForEmail[sentCount];
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN');
      const empEmail = `${rec.employeeCode.toLowerCase()}@${policy.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.vn`;

      setEmailLogs(prev => [
        {
          name: rec.employeeName,
          code: rec.employeeCode,
          email: empEmail,
          net: rec.netSalary,
          status: 'SUCCESS',
          time: timeStr
        },
        ...prev
      ]);

      sentCount += 1;
      const pct = Math.round((sentCount / total) * 100);
      setEmailSendingProgress(pct);
    }, 250);
  };

  const handleExportBankTransfer = (bankName: string) => {
    excelService.exportBankTransfer(payrollRecords, bankName);
  };

  const handleExportReverseAudit = () => {
    excelService.exportReverseAuditReport(payrollRecords, selectedMonth);
  };

  return (
    <div className="space-y-3">
      {/* Tiêu đề & Công cụ điều khiển */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
        <div>
          <div className="flex items-center space-x-2">
            <BadgePercent className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Bảng Lương & Tạm Ứng</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chu kỳ: <b className="text-slate-900">{policy.payrollCycleType === 'CYCLE_26_TO_25' ? '26/07 → 25/08' : '01/08 → 31/08'}</b> • Quản lý tạm ứng giữa tháng, khấu trừ nhiều kỳ nợ vay/bồi thường và theo dõi nhân viên sắp nghỉ việc
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-white outline-none"
          >
            <option value="2026-08">Kỳ Lương Tháng 08/2026</option>
            <option value="2026-07">Kỳ Lương Tháng 07/2026</option>
          </select>

          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              isLocked 
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isLocked ? 'Đã Khóa Kỳ Lương' : 'Đang Mở Kỳ'}</span>
          </button>

          <button
            onClick={() => setShowBulkEmailModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-colors cursor-pointer"
            title="Gửi email hàng loạt phiếu lương điện tử đến nhân viên theo phân nhóm"
          >
            <Mail className="w-4 h-4" />
            <span>Gửi Email Hàng Loạt ({selectedEmpIdsForEmail.size > 0 ? `${selectedEmpIdsForEmail.size} đã chọn` : 'Toàn bộ'})</span>
          </button>

          <button
            onClick={handleExportPayrollExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Bảng Lương Excel</span>
          </button>

          <button
            onClick={handleExportReverseAudit}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Đối Chiếu Ngược</span>
          </button>

          <button
            onClick={() => handleExportBankTransfer('Vietcombank')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Xuất Chi Hộ VCB</span>
          </button>
        </div>
      </div>

      {/* Tab chuyển đổi chế độ xem */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('PAYROLL_TABLE')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'PAYROLL_TABLE'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BadgePercent className="w-4 h-4" />
          <span>Bảng Lương Tổng Hợp (HR/C&B)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ADVANCE_MANAGEMENT')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'ADVANCE_MANAGEMENT'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HandCoins className="w-4 h-4 text-amber-500" />
          <span>Quản Lý Tạm Ứng & Mượn Nợ Nhiều Kỳ</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-mono">
            Kiểm Soát Riêng
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('BANK_AUDIT')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'BANK_AUDIT'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Kiểm Tra & Chuyển Khoản Ngân Hàng</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-mono">
            15 Mẫu
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('CASH_DENOMINATION')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'CASH_DENOMINATION'
              ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
          }`}
          title="Phân rã cơ cấu mệnh giá tiền mặt VND, bảng kê rút tiền nộp ngân hàng & máy tính chia tiền"
        >
          <Coins className="w-4 h-4 text-emerald-600" />
          <span>Cơ Cấu Mệnh Giá Tiền Mặt (Rút Tiền)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-700 text-white font-mono">
            500k-500đ
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('MOM_VARIANCE')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'MOM_VARIANCE'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>So Sánh Biến Động Chi Phí Với Tháng Trước</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-mono">
            Rà Soát Chi Tiết
          </span>
        </button>
      </div>

      {activeSubTab === 'MOM_VARIANCE' ? (
        <PayrollVarianceView
          employees={employees}
          payrollRecords={payrollRecords}
          policy={policy}
          currentRole={currentRole}
          currentMonth={selectedMonth}
        />
      ) : activeSubTab === 'BANK_AUDIT' ? (
        <BankTransferAuditView
          payrollRecords={payrollRecords}
          policy={policy}
          currentRole={currentRole}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      ) : activeSubTab === 'CASH_DENOMINATION' ? (
        <CashDenominationView
          payrollRecords={payrollRecords}
          policy={policy}
          selectedMonth={selectedMonth}
        />
      ) : activeSubTab === 'PAYROLL_TABLE' ? (
        <>
          {/* 5 Thẻ tổng hợp tài chính kỳ lương */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-semibold block">Tổng Thu Nhập (Gross)</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{(totalGross).toLocaleString('vi-VN')} đ</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{totalActivePaidCount} NS có ngày công</span>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-semibold block">Tổng Bảo Hiểm NLĐ</span>
              <span className="text-lg font-bold text-blue-600 mt-1 block">{(totalInsuranceEmp).toLocaleString('vi-VN')} đ</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">BHXH 8%, BHYT 1.5%, BHTN 1%</span>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-semibold block">Tổng Thuế TNCN</span>
              <span className="text-lg font-bold text-rose-600 mt-1 block">{(totalTax).toLocaleString('vi-VN')} đ</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Lũy tiến 7 bậc & 10% khoán</span>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-semibold block">Khấu Trừ Nợ / Tạm Ứng</span>
              <span className="text-lg font-bold text-amber-600 mt-1 block">{(totalAdvanceDeduction).toLocaleString('vi-VN')} đ</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Trích trừ công nợ tồn đọng</span>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white p-2 rounded-2xl shadow-md">
              <span className="text-emerald-100 font-semibold block">THỰC LĨNH CHUYỂN KHOẢN</span>
              <span className="text-lg font-bold mt-1 block">{(totalNet).toLocaleString('vi-VN')} đ</span>
              <span className="text-[11px] text-emerald-200 mt-0.5 block">Ngân hàng chi hộ</span>
            </div>
          </div>

          {/* BẢNG LƯƠNG TỔNG HỢP CHI TIẾT */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
            {/* Thanh tìm kiếm & Bộ lọc */}
            <div className="p-2 border-b border-slate-200 space-y-3 bg-slate-50/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Bảng Lương Chi Tiết Toàn Doanh Nghiệp ({totalFiltered} nhân sự)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tính toán tự động theo ngày vào, ngày nghỉ, phụ cấp độc hại TT24, ca đêm và trích trừ công nợ
                  </p>
                </div>

                {/* Tìm kiếm */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên, mã NV, phòng ban..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-indigo-500 outline-none w-64 transition-all"
                  />
                </div>
              </div>

              {/* Bộ lọc phòng ban & trạng thái */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 font-medium text-[11px]">Phòng ban:</span>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none text-xs"
                  >
                    <option value="ALL">Tất Cả Phòng Ban</option>
                    {departmentList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 font-medium text-[11px]">Tình trạng lương:</span>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none text-xs"
                  >
                    <option value="ALL">Tất Cả Nhân Sự (250 NS)</option>
                    <option value="ACTIVE">Đang Làm Việc (Có ngày công & lương)</option>
                    <option value="RESIGNED">Đã Nghỉ Việc / Sa Thải (0 ngày công)</option>
                    <option value="WITH_DEBT">Có Khấu Trừ Tạm Ứng / Nợ</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[11px] tracking-wider select-none">
                  <tr>
                    <th onClick={() => handleSort('employeeCode')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Mã NV {sortField === 'employeeCode' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th onClick={() => handleSort('employeeName')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Họ Và Tên {sortField === 'employeeName' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th onClick={() => handleSort('departmentName')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Phòng Ban {sortField === 'departmentName' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th onClick={() => handleSort('actualWorkDays')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Công {sortField === 'actualWorkDays' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th onClick={() => handleSort('actualBaseSalary')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Lương Cơ Bản {sortField === 'actualBaseSalary' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th onClick={() => handleSort('totalOtPay')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Lương OT {sortField === 'totalOtPay' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th className="px-3.5 py-3">Sữa Độc Hại</th>
                    <th onClick={() => handleSort('totalGrossIncome')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Tổng Thu Nhập {sortField === 'totalGrossIncome' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th onClick={() => handleSort('totalInsuranceEmp')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Bảo Hiểm {sortField === 'totalInsuranceEmp' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th onClick={() => handleSort('personalIncomeTax')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Thuế TNCN {sortField === 'personalIncomeTax' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th onClick={() => handleSort('salaryAdvance')} className="px-3.5 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      Tạm Ứng {sortField === 'salaryAdvance' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th onClick={() => handleSort('netSalary')} className="px-3.5 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                      THỰC LĨNH {sortField === 'netSalary' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th className="px-3.5 py-3 text-center">Phiếu Lương</th>
                  </tr>

                  {/* HÀNG LỌC TOÁN TỬ VÀ CHUỖI TỪNG CỘT (>=500, <=, >, <, =) */}
                  <tr className="bg-slate-100/70 border-b border-slate-200 normal-case font-normal text-[11px]">
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="Mã NV..."
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
                        placeholder=">=20, =0..."
                        value={colFilters.workDays}
                        onChange={e => { setColFilters(prev => ({ ...prev, workDays: e.target.value })); setCurrentPage(1); }}
                        className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">=10tr..."
                        value={colFilters.baseSalary}
                        onChange={e => { setColFilters(prev => ({ ...prev, baseSalary: e.target.value })); setCurrentPage(1); }}
                        className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">0..."
                        value={colFilters.otPay}
                        onChange={e => { setColFilters(prev => ({ ...prev, otPay: e.target.value })); setCurrentPage(1); }}
                        className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">0..."
                        value={colFilters.toxic}
                        onChange={e => { setColFilters(prev => ({ ...prev, toxic: e.target.value })); setCurrentPage(1); }}
                        className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">=15tr..."
                        value={colFilters.gross}
                        onChange={e => { setColFilters(prev => ({ ...prev, gross: e.target.value })); setCurrentPage(1); }}
                        className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">0, =0..."
                        value={colFilters.ins}
                        onChange={e => { setColFilters(prev => ({ ...prev, ins: e.target.value })); setCurrentPage(1); }}
                        className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">0, =0..."
                        value={colFilters.tax}
                        onChange={e => { setColFilters(prev => ({ ...prev, tax: e.target.value })); setCurrentPage(1); }}
                        className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">0..."
                        value={colFilters.advance}
                        onChange={e => { setColFilters(prev => ({ ...prev, advance: e.target.value })); setCurrentPage(1); }}
                        className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">=10tr..."
                        value={colFilters.net}
                        onChange={e => { setColFilters(prev => ({ ...prev, net: e.target.value })); setCurrentPage(1); }}
                        className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1 text-center">
                      {Object.values(colFilters).some(v => v !== '') && (
                        <button
                          onClick={() => {
                            setColFilters({ code: '', name: '', dept: '', workDays: '', baseSalary: '', otPay: '', toxic: '', gross: '', ins: '', tax: '', advance: '', net: '' });
                            setCurrentPage(1);
                          }}
                          className="text-[10px] text-indigo-600 hover:underline font-bold"
                        >
                          Xóa
                        </button>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPayrollRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-3 font-mono font-bold text-indigo-700">{rec.employeeCode}</td>
                      <td className="px-3.5 py-3 font-semibold text-slate-900">{rec.employeeName}</td>
                      <td className="px-3.5 py-3 text-slate-500">{rec.departmentName}</td>
                      <td className="px-3.5 py-3">
                        <span className={`font-bold ${rec.actualWorkDays === 0 ? 'text-slate-400' : 'text-slate-800'}`}>
                          {rec.actualWorkDays}
                        </span> / {rec.standardDays}
                        {rec.paidLeaveDays > 0 && <span className="text-emerald-600 text-[10px]"> (+{rec.paidLeaveDays} phép)</span>}
                        {rec.actualWorkDays === 0 && <span className="text-slate-400 text-[10px] block">Nghỉ/Hoãn</span>}
                      </td>
                      <td className="px-3.5 py-3 font-medium">{rec.actualBaseSalary.toLocaleString('vi-VN')} đ</td>
                      <td className="px-3.5 py-3">
                        {rec.totalOtPay > 0 ? (
                          <span className="text-indigo-600 font-bold">+{rec.totalOtPay.toLocaleString('vi-VN')} đ</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3">
                        {rec.toxicInKindCashValue > 0 ? (
                          <span className="text-amber-700 font-bold flex items-center space-x-1">
                            <Milk className="w-3 h-3 text-amber-500" />
                            <span>+{rec.toxicInKindCashValue.toLocaleString('vi-VN')} đ</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 font-bold text-slate-900">{rec.totalGrossIncome.toLocaleString('vi-VN')} đ</td>
                      <td className="px-3.5 py-3 text-blue-700 font-medium">
                        {rec.totalInsuranceEmp > 0 ? `-${rec.totalInsuranceEmp.toLocaleString('vi-VN')} đ` : '0 đ'}
                      </td>
                      <td className="px-3.5 py-3 text-rose-700 font-medium">
                        {rec.personalIncomeTax > 0 ? `-${rec.personalIncomeTax.toLocaleString('vi-VN')} đ` : '0 đ'}
                      </td>
                      <td className="px-3.5 py-3 text-amber-700 font-medium">
                        {rec.salaryAdvance > 0 ? `-${rec.salaryAdvance.toLocaleString('vi-VN')} đ` : '0'}
                      </td>
                      <td className="px-3.5 py-3 text-right font-bold text-emerald-700 text-sm">
                        {rec.netSalary.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <button
                          onClick={() => setSelectedPayslip(rec)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors"
                        >
                          Xem Phiếu
                        </button>
                      </td>
                    </tr>
                  ))}

                  {paginatedPayrollRecords.length === 0 && (
                    <tr>
                      <td colSpan={13} className="text-center py-8 text-xs text-slate-400 italic">
                        Không tìm thấy bản ghi lương nào phù hợp với bộ lọc tìm kiếm.
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
              totalRecords={totalFiltered}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>
        </>
      ) : (
        /* PHÂN HỆ QUẢN LÝ TẠM ỨNG & MƯỢN NỢ CÔNG TY (KIỂM SOÁT RIÊNG) */
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs">
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-semibold block">Tổng Đã Tạm Ứng Trong Kỳ</span>
              <span className="text-xl font-bold text-amber-600 mt-1 block">5.000.000 đ</span>
              <span className="text-[11px] text-slate-400 mt-1 block">1 nhân sự đã nhận tiền giữa tháng (Trừ kỳ lương này)</span>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-semibold block">Các Khoản Mượn Nợ Trả Nhiều Kỳ</span>
              <span className="text-xl font-bold text-indigo-600 mt-1 block">18.000.000 đ</span>
              <span className="text-[11px] text-slate-400 mt-1 block">2 hợp đồng vay mượn / bồi hoàn tài sản đang khấu trừ dần</span>
            </div>

            <div className="bg-rose-50 p-2 rounded-2xl border border-rose-200 shadow-sm">
              <div className="flex items-center space-x-1.5 text-rose-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Cảnh Báo Nhân Sự Sắp Nghỉ Việc Còn Nợ</span>
              </div>
              <span className="text-xl font-bold text-rose-700 mt-1 block">500.000 đ</span>
              <span className="text-[11px] text-rose-600 mt-1 block">
                Đỗ Thị Thu Hiền (AF-008) • <b>Chuyển sang phân hệ Thanh Lý & Nghỉ Việc</b> để bù trừ quyết toán thôi việc
              </span>
            </div>
          </div>

          {/* BẢNG THEO DÕI TỔNG HỢP CÁC KHOẢN TẠM ỨNG & MƯỢN NỢ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-2 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <HandCoins className="w-4 h-4 text-amber-500" />
                  <span>Danh Sách Nhân Sự Đang Có Khoản Tạm Ứng / Nợ Công Ty</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động kiểm soát khấu trừ theo kỳ, cảnh báo rủi ro âm lương và kết nối chặt chẽ với phân hệ Offboarding
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  ✓ Quy tắc: Không ứng vượt quá 50% lương ngày công thực tế
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Mã NV & Họ Tên</th>
                    <th className="px-4 py-3">Phòng Ban / Xưởng</th>
                    <th className="px-4 py-3">Loại Khoản Nợ / Tạm Ứng</th>
                    <th className="px-4 py-3 text-right">Tổng Khoản Nợ</th>
                    <th className="px-4 py-3 text-center">Kỳ Hạn Khấu Trừ</th>
                    <th className="px-4 py-3 text-right">Trừ Vào Kỳ Này</th>
                    <th className="px-4 py-3 text-right">Số Dư Còn Lại</th>
                    <th className="px-4 py-3 text-center">Tình Trạng Nhân Sự</th>
                    <th className="px-4 py-3 text-center">Xử Lý Khi Nghỉ Việc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Trường hợp 1: Tạm ứng giữa tháng thông thường */}
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>Vũ Đình Trọng</div>
                      <span className="text-[11px] font-mono text-indigo-600">AF-006</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Khối Kinh Doanh Toàn Quốc</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        Tạm ứng lương giữa tháng (Công tác phí)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">5.000.000 đ</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-600">1 kỳ (Tháng 08)</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">-5.000.000 đ</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">0 đ (Hết nợ)</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Đang làm việc
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 italic">Không áp dụng</td>
                  </tr>

                  {/* Trường hợp 2: Mượn tiền công ty trả góp nhiều kỳ */}
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>Hoàng Văn Đức</div>
                      <span className="text-[11px] font-mono text-indigo-600">AF-005</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Phân Xưởng Đóng Gói</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                        Mượn quỹ phúc lợi (Hỗ trợ viện phí gia đình)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">12.000.000 đ</td>
                    <td className="px-4 py-3 text-center font-semibold text-indigo-700">Kỳ 2 / 6 kỳ (2tr/tháng)</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">-2.000.000 đ</td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-700">8.000.000 đ</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Đang làm việc
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 italic">Trừ tiếp kỳ 09/2026</td>
                  </tr>

                  {/* Trường hợp 3: Bồi thường tài sản / công nợ chia nhiều kỳ */}
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>Trần Văn Thành</div>
                      <span className="text-[11px] font-mono text-indigo-600">AF-010</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Phân Xưởng Đóng Gói</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                        Bồi thường làm hỏng cảm biến máy đóng gói
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">6.000.000 đ</td>
                    <td className="px-4 py-3 text-center font-semibold text-indigo-700">Kỳ 1 / 3 kỳ (2tr/tháng)</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">-2.000.000 đ</td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-700">4.000.000 đ</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Đang làm việc
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 italic">Trừ tiếp kỳ 09/2026</td>
                  </tr>

                  {/* Trường hợp 4: CÒN NỢ MÀ SẮP NGHỈ VIỆC HOẶC ĐÃ NỘP ĐƠN */}
                  <tr className="bg-rose-50/60 hover:bg-rose-50 font-medium">
                    <td className="px-4 py-3 font-semibold text-rose-950">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold">Đỗ Thị Thu Hiền</span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-800 text-[9px] font-bold">THÔI VIỆC</span>
                      </div>
                      <span className="text-[11px] font-mono text-rose-700">AF-008</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Phòng Tài Chính Kế Toán</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold border border-rose-300">
                        Bồi hoàn công cụ & công nợ tạm ứng còn dư
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-900">500.000 đ</td>
                    <td className="px-4 py-3 text-center font-bold text-rose-700">Tất toán gấp</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-700">-500.000 đ</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">0 đ</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                        Đã Nghỉ Việc (15/08)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px] shadow-sm">
                        <span>Đã Cấn Trừ Quyết Toán Offboarding</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM PHIẾU LƯƠNG ĐIỆN TỬ (PAYSLIP) */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Phiếu Lương Điện Tử (Payslip)</span>
                <h3 className="font-bold text-base text-slate-900">{selectedPayslip.employeeName} ({selectedPayslip.employeeCode})</h3>
                <p className="text-xs text-slate-500">{selectedPayslip.departmentName} • Kỳ lương {selectedPayslip.month}</p>
              </div>
              <button onClick={() => setSelectedPayslip(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chi tiết phiếu lương */}
            <div className="space-y-1.5 text-xs">
              {/* Bảng thu nhập */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 border-b border-slate-200">
                  I. CÁC KHOẢN THU NHẬP (GROSS INCOME)
                </div>
                <div className="divide-y divide-slate-100 p-2">
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Lương cơ bản theo ngày công ({selectedPayslip.actualWorkDays}/{selectedPayslip.standardDays} ngày):</span>
                    <b className="text-slate-900">{selectedPayslip.actualBaseSalary.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Lương chức danh / hiệu quả 3P:</span>
                    <b className="text-slate-900">{selectedPayslip.positionSalary.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Phụ cấp ăn trưa (miễn thuế):</span>
                    <b className="text-slate-900">{selectedPayslip.lunchAllowance.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Phụ cấp xăng xe & điện thoại:</span>
                    <b className="text-slate-900">{(selectedPayslip.transportAllowance + selectedPayslip.phoneAllowance).toLocaleString('vi-VN')} đ</b>
                  </div>
                  {selectedPayslip.toxicInKindCashValue > 0 && (
                    <div className="flex justify-between py-1.5 px-2 bg-amber-50/50">
                      <span>Bồi dưỡng hiện vật độc hại (Sữa/đường TT 24):</span>
                      <b className="text-amber-700">+{selectedPayslip.toxicInKindCashValue.toLocaleString('vi-VN')} đ</b>
                    </div>
                  )}
                  {selectedPayslip.totalOtPay > 0 && (
                    <div className="flex justify-between py-1.5 px-2 bg-indigo-50/50">
                      <span>Tiền làm thêm giờ (OT) & Phụ cấp làm đêm:</span>
                      <b className="text-indigo-700">+{selectedPayslip.totalOtPay.toLocaleString('vi-VN')} đ</b>
                    </div>
                  )}
                  {selectedPayslip.kpiBonus > 0 && (
                    <div className="flex justify-between py-1.5 px-2">
                      <span>Thưởng KPI & Chuyên cần:</span>
                      <b className="text-emerald-700">+{selectedPayslip.kpiBonus.toLocaleString('vi-VN')} đ</b>
                    </div>
                  )}
                  <div className="flex justify-between py-2 px-2 bg-slate-50 font-bold text-slate-900">
                    <span>TỔNG THU NHẬP TRƯỚC KHẤU TRỪ:</span>
                    <span>{selectedPayslip.totalGrossIncome.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>

              {/* Bảng khấu trừ */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 border-b border-slate-200">
                  II. CÁC KHOẢN TRÍCH NỘP & KHẤU TRỪ
                </div>
                <div className="divide-y divide-slate-100 p-2">
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Bảo hiểm xã hội NLĐ (BHXH 8%):</span>
                    <b className="text-rose-600">-{selectedPayslip.bhxhEmp.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Bảo hiểm y tế NLĐ (BHYT 1.5%):</span>
                    <b className="text-rose-600">-{selectedPayslip.bhytEmp.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Bảo hiểm thất nghiệp NLĐ (BHTN 1%):</span>
                    <b className="text-rose-600">-{selectedPayslip.bhtnEmp.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Đoàn phí công đoàn (1%):</span>
                    <b className="text-rose-600">-{selectedPayslip.unionEmp.toLocaleString('vi-VN')} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2">
                    <span>Thuế thu nhập cá nhân (TNCN lũy tiến 7 bậc):</span>
                    <b className="text-rose-600">-{selectedPayslip.personalIncomeTax.toLocaleString('vi-VN')} đ</b>
                  </div>
                  {selectedPayslip.salaryAdvance > 0 && (
                    <div className="flex justify-between py-1.5 px-2">
                      <span>Tạm ứng giữa tháng:</span>
                      <b className="text-slate-700">-{selectedPayslip.salaryAdvance.toLocaleString('vi-VN')} đ</b>
                    </div>
                  )}
                </div>
              </div>

              {/* Thực lĩnh chuyển khoản */}
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider block">THỰC LĨNH CHUYỂN KHOẢN (NET):</span>
                  <span className="text-xl font-extrabold text-emerald-700">{selectedPayslip.netSalary.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>Chuyển vào tài khoản:</span>
                  <p className="font-bold text-slate-800">{selectedPayslip.bankAccount} ({selectedPayslip.bankName})</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => selectedPayslip && handleExportSingleMonthPayslipExcel(selectedPayslip)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Xuất file Excel phiếu lương tháng có công thức SUM và TRỪ"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Xuất Excel Tháng (Có Công Thức)</span>
              </button>

              <button
                onClick={() => selectedPayslip && handleExportFullYearPayslipExcel(selectedPayslip)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Xuất file Excel cả năm: Sheet 1 Tổng Hợp Cả Năm (SUM, AVERAGE) và 12 Sheet Tháng Chi Tiết"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Xuất Excel Cả Năm (12 Tháng + Sheet Tổng)</span>
              </button>

              <button
                onClick={() => {
                  if (selectedPayslip) {
                    setSelectedEmpIdsForEmail(new Set([selectedPayslip.employeeId]));
                    setEmailGrouping('SELECTED');
                    setShowBulkEmailModal(true);
                  }
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                title="Gửi email trực tiếp phiếu lương bảo mật này cho nhân viên"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Gửi Email Phiếu Này</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu</span>
              </button>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GỬI EMAIL HÀNG LOẠT PHIẾU LƯƠNG ĐIỆN TỬ */}
      {showBulkEmailModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in"
          onClick={() => !isSendingEmail && setShowBulkEmailModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-3 shadow-2xl space-y-1.5 border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Gửi Email Hàng Loạt Phiếu Lương Điện Tử (Bulk Payslips)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kỳ lương: <b className="text-indigo-700">{selectedMonth}</b> • Doanh nghiệp: {policy.companyName}
                  </p>
                </div>
              </div>
              {!isSendingEmail && (
                <button 
                  onClick={() => setShowBulkEmailModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Bộ chọn phân nhóm gửi */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">
                1. Chọn Phân Nhóm Nhân Sự Nhận Email
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setEmailGrouping('SELECTED')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    emailGrouping === 'SELECTED'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>Đã Chọn Tick</div>
                  <span className="text-[10px] opacity-80">{selectedEmpIdsForEmail.size} nhân sự</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmailGrouping('ALL')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    emailGrouping === 'ALL'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>Toàn Công Ty</div>
                  <span className="text-[10px] opacity-80">{filteredPayrollRecords.length} nhân sự</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmailGrouping('DEPARTMENT')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    emailGrouping === 'DEPARTMENT'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>Theo Phòng Ban</div>
                  <span className="text-[10px] opacity-80">{selectedDept === 'ALL' ? 'Tất cả' : selectedDept}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmailGrouping('FACTORY')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    emailGrouping === 'FACTORY'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>Khối Sản Xuất</div>
                  <span className="text-[10px] opacity-80">Công nhân xưởng</span>
                </button>
              </div>

              {/* Tùy chọn bảo mật mật khẩu mở file PDF */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-slate-600 font-medium">Bảo mật mật khẩu mở file đính kèm:</span>
                <select
                  value={emailSecurityPass}
                  onChange={(e: any) => setEmailSecurityPass(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800"
                >
                  <option value="CCCD">4 Số cuối CCCD (Bảo mật cao)</option>
                  <option value="DOB">Ngày tháng năm sinh (DDMMYYYY)</option>
                  <option value="NONE">Không đặt mật khẩu</option>
                </select>
              </div>
            </div>

            {/* Xem trước mẫu email */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-indigo-900 font-bold">
                <span>Xem trước định dạng Email (Preview):</span>
                <span className="text-[11px] font-normal text-slate-500">Số lượng người nhận: <b>{recipientsForEmail.length}</b> email</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-200 space-y-1 text-slate-700 text-[11px] leading-relaxed font-mono">
                <div><b>Tiêu đề:</b> [DigiTech HRM] Thông Báo Phiếu Lương Tháng {selectedMonth} - [Họ Và Tên]</div>
                <div className="pt-1"><b>Kính gửi Ông/Bà [Họ Và Tên],</b></div>
                <p>Phòng Nhân sự & Kế toán {policy.companyName} xin gửi Phiếu lương chi tiết kỳ tháng {selectedMonth}.</p>
                <p>• Số tiền thực lĩnh chuyển khoản (NET): <b>[Số Tiền] VNĐ</b> qua tài khoản [Số TK VCB].</p>
                <p>• Mật khẩu mở file PDF đính kèm: <i>{emailSecurityPass === 'CCCD' ? '4 chữ số cuối trên CCCD của bạn' : emailSecurityPass === 'DOB' ? 'Ngày tháng năm sinh (DDMMYYYY)' : 'Không yêu cầu mật khẩu'}</i>.</p>
                <p className="text-slate-400">Mọi thắc mắc đối soát vui lòng phản hồi trước ngày 10 hàng tháng.</p>
              </div>
            </div>

            {/* Thanh tiến trình gửi khi đang gửi */}
            {isSendingEmail && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-indigo-700">Đang gửi email tự động hàng loạt...</span>
                  <span className="font-bold text-slate-900">{emailSendingProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-200 rounded-full"
                    style={{ width: `${emailSendingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Nhật ký gửi email realtime */}
            {emailLogs.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700">
                  Nhật Ký Tiến Trình ({emailLogs.length}/{recipientsForEmail.length} email):
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded-xl p-2 bg-slate-50 text-[11px]">
                  {emailLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between py-1 px-1.5 rounded bg-white border border-slate-100">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-800">{log.name}</span>
                        <span className="text-slate-400 font-mono">({log.email})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-emerald-700">{log.net.toLocaleString('vi-VN')} đ</span>
                        <span className="text-slate-400 text-[10px]">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Tổng cộng: <b className="text-slate-800">{recipientsForEmail.length}</b> người nhận
              </span>
              <div className="flex items-center space-x-2">
                {!isSendingEmail && (
                  <button
                    type="button"
                    onClick={() => setShowBulkEmailModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSendingEmail || recipientsForEmail.length === 0}
                  onClick={handleStartSendingBulkEmail}
                  className={`flex items-center space-x-1.5 px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    isSendingEmail || recipientsForEmail.length === 0
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingEmail ? 'Đang Gửi Hàng Loạt...' : `Bắt Đầu Gửi (${recipientsForEmail.length} Email)`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
