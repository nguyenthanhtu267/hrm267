import React, { useState, useMemo, useRef } from 'react';
import { Employee, CompanyPolicy } from '../types/hrm';
import { calculatePersonalIncomeTax } from '../services/payrollEngine';
import { CompactPagination, evaluateColumnCondition } from './SmartTableFilter';
import {
  FileSpreadsheet, Download, Printer, Filter, Search, UserCheck,
  ChevronLeft, ChevronRight, X, User, Calendar, FileText,
  BarChart3, Eye, ArrowLeft, FileCheck, Receipt, Banknote,
  Mail, Send, CheckSquare, Square, CheckCircle2, ShieldCheck, HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface TaxYearlyViewProps {
  employees: Employee[];
  policy: CompanyPolicy;
}

// ── Tính thuế TNCN 1 tháng đầy đủ
function calcMonthlyTax(emp: Employee, policy: CompanyPolicy, month: number, year: number) {
  const grossIncome = emp.baseSalary + emp.positionSalary;
  const lunchExempt = Math.min(emp.lunchAllowance || 0, 1_200_000); // tối đa 1.2 triệu miễn thuế
  const toxicExempt = emp.toxicTier > 0 ? emp.toxicTier * 15_000 : 0; // bồi dưỡng hiện vật miễn thuế
  const subjectToTax = grossIncome - lunchExempt - toxicExempt;

  const insuranceCap = 46_800_000;
  const bhxhEmp = Math.round(Math.min(emp.baseSalary, insuranceCap) * 0.08);
  const bhytEmp = Math.round(Math.min(emp.baseSalary, insuranceCap) * 0.015);
  const bhtntEmp = Math.round(Math.min(emp.baseSalary, insuranceCap) * 0.01);
  const totalInsurance = bhxhEmp + bhytEmp + bhtntEmp;

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const effectiveMonth = (policy.pit5TiersEffectiveDate || '2026-01-01').substring(0, 7);
  const isApplying5Tiers = policy.pitTableType === 'FORCE_5_TIERS' || 
    (policy.pitTableType !== 'FORCE_7_TIERS' && monthStr >= effectiveMonth);

  const personalDeduction = (isApplying5Tiers && policy.pit5PersonalDeduction)
    ? policy.pit5PersonalDeduction
    : (policy.personalDeduction || 11_000_000);

  const dependentDeduction = emp.numberOfDependents * (
    (isApplying5Tiers && policy.pit5DependentDeduction)
      ? policy.pit5DependentDeduction
      : (policy.dependentDeduction || 4_400_000)
  );

  const assessable = Math.max(0, subjectToTax - totalInsurance - personalDeduction - dependentDeduction);

  const pitResult = calculatePersonalIncomeTax(assessable, monthStr, policy);
  const tax = emp.isCivilContractor
    ? Math.round(grossIncome * 0.10)
    : Math.round(pitResult.taxAmount);

  const netReceived = grossIncome + (emp.lunchAllowance || 0) + toxicExempt - totalInsurance - tax;

  return {
    month,
    year,
    grossIncome,
    lunchAllowance: emp.lunchAllowance || 0,
    lunchExempt,
    toxicExempt,
    subjectToTax,
    bhxhEmp,
    bhytEmp,
    bhtntEmp,
    totalInsurance,
    personalDeduction,
    dependentDeduction,
    assessable,
    tax,
    netReceived,
  };
}

// ── Xuất PDF qua print window
function printHtml(title: string, html: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <style>
      body{font-family:'Times New Roman',serif;padding:30px;font-size:11pt;color:#111;line-height:1.5}
      table{width:100%;border-collapse:collapse;font-size:9pt}
      th,td{border:1px solid #555;padding:4px 6px}
      th{background:#eee;font-weight:bold;text-align:center}
      .center{text-align:center} .right{text-align:right} .bold{font-weight:bold}
      .title{text-align:center;font-size:14pt;font-weight:bold;margin:12px 0 4px}
      .sub{text-align:center;font-size:10pt;margin-bottom:14px}
      .sig{display:flex;justify-content:space-between;margin-top:50px;text-align:center}
      @media print{body{padding:10px}}
    </style>
  </head><body>${html}<script>window.onload=()=>window.print();</script></body></html>`);
  win.document.close();
}

export const TaxYearlyView: React.FC<TaxYearlyViewProps> = ({ employees, policy }) => {
  // ── State chính
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [view, setView] = useState<'SUMMARY' | 'MONTHLY_DETAIL'>('SUMMARY');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AUTHORIZED' | 'DIRECT'>('ALL');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDetailExportMenu, setShowDetailExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const detailExportRef = useRef<HTMLDivElement>(null);

  // Pagination & filters (bảng tổng hợp)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [colFilters, setColFilters] = useState({
    code: '', name: '', dept: '', months: '', income: '',
    taxYearly: '', taxWithheld: '', balance: '', authStatus: '',
  });

  // State Xem Trực Tiếp Bảng Quyết Toán Cá Nhân & Gửi Email Hàng Loạt
  const [selectedSettlementItem, setSelectedSettlementItem] = useState<any | null>(null);
  const [selectedEmpCodesForEmail, setSelectedEmpCodesForEmail] = useState<Set<string>>(new Set());
  const [showBulkTaxEmailModal, setShowBulkTaxEmailModal] = useState<boolean>(false);
  const [taxEmailProgress, setTaxEmailProgress] = useState<number>(0);
  const [isSendingTaxEmail, setIsSendingTaxEmail] = useState<boolean>(false);
  const [taxEmailLogs, setTaxEmailLogs] = useState<Array<{ name: string; code: string; email: string; netBalance: number; status: 'SUCCESS' | 'SENDING' | 'PENDING'; time: string }>>([]);
  const [taxEmailGrouping, setTaxEmailGrouping] = useState<'SELECTED' | 'ALL' | 'AUTHORIZED' | 'DIRECT'>('SELECTED');

  const YEARS = [2022, 2023, 2024, 2025, 2026];

  // ── Nhân viên của tenant
  const tenantEmployees = useMemo(
    () => employees.filter(e => e.tenantId === policy.tenantId),
    [employees, policy.tenantId]
  );

  // ── Bảng tổng hợp cả năm
  const taxSummary = useMemo(() => {
    return tenantEmployees.map((emp, idx) => {
      const monthsWorked = emp.status === 'PROBATION' ? 6 : emp.status === 'RESIGNED' ? 8 : 12;
      let yearlyTax = 0, grossTotal = 0, taxWithheld = 0, netTotal = 0;

      for (let m = 1; m <= monthsWorked; m++) {
        const r = calcMonthlyTax(emp, policy, m, selectedYear);
        yearlyTax += r.tax;
        grossTotal += r.grossIncome + r.lunchAllowance;
        netTotal += r.netReceived;
      }
      taxWithheld = Math.round(yearlyTax * 1.05); // tạm khấu trừ dư 5%
      const netBalance = yearlyTax - taxWithheld;
      const isAuthorized = !emp.isCivilContractor && monthsWorked === 12 && idx % 7 !== 0;

      return {
        emp,
        empCode: emp.code,
        empName: emp.fullName,
        dept: emp.departmentName,
        dependents: emp.numberOfDependents,
        monthsWorked,
        grossTotal,
        netTotal,
        yearlyTax,
        taxWithheld,
        netBalance,
        isContractor: emp.isCivilContractor,
        isAuthorized,
        authStatusLabel: isAuthorized ? 'Đã Ủy Quyền (Mẫu 08)' : 'Tự Quyết Toán Trực Tiếp',
      };
    });
  }, [tenantEmployees, policy, selectedYear]);

  // ── Lọc
  const filtered = useMemo(() => {
    return taxSummary.filter(t => {
      if (statusFilter === 'AUTHORIZED' && !t.isAuthorized) return false;
      if (statusFilter === 'DIRECT' && t.isAuthorized) return false;
      if (searchTerm && !t.empName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !t.empCode.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (colFilters.code && !evaluateColumnCondition(t.empCode, colFilters.code)) return false;
      if (colFilters.name && !evaluateColumnCondition(t.empName, colFilters.name)) return false;
      if (colFilters.dept && !evaluateColumnCondition(t.dept, colFilters.dept)) return false;
      if (colFilters.months && !evaluateColumnCondition(t.monthsWorked, colFilters.months)) return false;
      if (colFilters.income && !evaluateColumnCondition(t.grossTotal, colFilters.income)) return false;
      if (colFilters.taxYearly && !evaluateColumnCondition(t.yearlyTax, colFilters.taxYearly)) return false;
      if (colFilters.taxWithheld && !evaluateColumnCondition(t.taxWithheld, colFilters.taxWithheld)) return false;
      if (colFilters.balance && !evaluateColumnCondition(t.netBalance, colFilters.balance)) return false;
      if (colFilters.authStatus && !evaluateColumnCondition(t.authStatusLabel, colFilters.authStatus)) return false;
      return true;
    });
  }, [taxSummary, statusFilter, searchTerm, colFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const s = (currentPage - 1) * pageSize;
    return filtered.slice(s, s + pageSize);
  }, [filtered, currentPage, pageSize]);

  // ── Chi tiết từng tháng cho nhân viên đang chọn
  const monthlyRows = useMemo(() => {
    if (!selectedEmployee) return [];
    const emp = selectedEmployee;
    const monthsWorked = emp.status === 'PROBATION' ? 6 : emp.status === 'RESIGNED' ? 8 : 12;
    const rows = [];
    let cumTax = 0, cumNet = 0, cumGross = 0;
    for (let m = 1; m <= monthsWorked; m++) {
      const r = calcMonthlyTax(emp, policy, m, selectedYear);
      cumTax += r.tax;
      cumNet += r.netReceived;
      cumGross += r.grossIncome + r.lunchAllowance;
      rows.push({ ...r, cumTax, cumNet, cumGross });
    }
    return rows;
  }, [selectedEmployee, policy, selectedYear]);

  const vnd = (n: number) => n.toLocaleString('vi-VN');
  const fmt = (n: number) => `${vnd(n)} đ`;

  // ── Mở màn hình chi tiết
  const openDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setView('MONTHLY_DETAIL');
  };

  // ── XuẤT EXCEL BẢNG TỔNG HỢP
  const exportSummaryExcel = () => {
    const data = filtered.map((t, i) => ({
      'STT': i + 1,
      'Mã NV': t.empCode,
      'Họ và Tên': t.empName,
      'Phòng Ban': t.dept,
      'Số Tháng LV': t.monthsWorked,
      'Số NPT': t.dependents,
      'Tổng Thu Nhập (đ)': t.grossTotal,
      'Thuế TNCN Cả Năm (đ)': t.yearlyTax,
      'Đã Khấu Trừ (đ)': t.taxWithheld,
      'Thực Lãnh Cả Năm (đ)': t.netTotal,
      'Kết Quả Quyết Toán': t.netBalance < 0 ? `Được hoàn: ${vnd(Math.abs(t.netBalance))} đ` : t.netBalance > 0 ? `Nộp thêm: ${vnd(t.netBalance)} đ` : 'Cân bằng',
      'Trạng Thái Ủy Quyền': t.authStatusLabel,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Quyet Toan ${selectedYear}`);
    XLSX.writeFile(wb, `BangQuyetToanThueTNCN_${selectedYear}_${policy.companyName}.xlsx`);
    setShowExportMenu(false);
  };

  // ── XuẤT PDF BẢNG TỔNG HỢP
  const exportSummaryPdf = () => {
    const rows = filtered.map((t, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td class="center">${t.empCode}</td>
        <td>${t.empName}</td>
        <td>${t.dept}</td>
        <td class="center">${t.monthsWorked}</td>
        <td class="right">${vnd(t.grossTotal)}</td>
        <td class="right">${vnd(t.yearlyTax)}</td>
        <td class="right">${vnd(t.taxWithheld)}</td>
        <td class="right bold">${vnd(t.netTotal)}</td>
        <td class="center" style="color:${t.netBalance < 0 ? 'green' : t.netBalance > 0 ? 'red' : '#555'}">${t.netBalance < 0 ? `Hoàn: ${vnd(Math.abs(t.netBalance))}` : t.netBalance > 0 ? `Nộp: ${vnd(t.netBalance)}` : 'Cân bằng'}</td>
        <td class="center">${t.authStatusLabel}</td>
      </tr>`).join('');
    const html = `
      <div class="center bold" style="font-size:10pt">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM - Độc lập - Tự do - Hạnh phúc</div>
      <div class="title">BẢNG TỔNG HỢP QUYẾT TOÁN THUẾ THU NHẬP CÁ NHÂN NĂM ${selectedYear}</div>
      <div class="sub">Công ty: ${policy.companyName} | MST: ${policy.taxCode} | Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}</div>
      <table>
        <thead><tr>
          <th>STT</th><th>Mã NV</th><th>Họ và Tên</th><th>Phòng Ban</th>
          <th>Tháng LV</th><th>Tổng Thu Nhập</th><th>Thuế TNCN</th><th>Đã KT</th>
          <th>Thực Lãnh Năm</th><th>Kết Quả QT</th><th>Trạng Thái UQ</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="sig">
        <div><b>KẾ TOÁN TRƯỞNG</b><br><i>(Ký, ghi rõ họ tên)</i><br><br><br></div>
        <div><b>GIÁM ĐỐC</b><br><i>(Ký tên, đóng dấu)</i><br><br><br></div>
      </div>`;
    printHtml(`Quyet Toan Thue TNCN ${selectedYear} - ${policy.companyName}`, html);
    setShowExportMenu(false);
  };

  // ── XUẤT EXCEL CHI TIẾT THÁNG
  const exportDetailExcel = () => {
    if (!selectedEmployee || !monthlyRows.length) return;
    const data = monthlyRows.map(r => ({
      'Tháng': `Tháng ${r.month}/${r.year}`,
      'Tổng Thu Nhập (đ)': r.grossIncome + r.lunchAllowance,
      'Lương CB + CD (đ)': r.grossIncome,
      'Phụ Cấp Ăn Ca (đ)': r.lunchAllowance,
      'Miễn Thuế Ăn Ca (đ)': r.lunchExempt,
      'Miễn Thuế Độc Hại (đ)': r.toxicExempt,
      'Thu Nhập Chịu Thuế (đ)': r.subjectToTax,
      'BHXH NLĐ (đ)': r.bhxhEmp,
      'BHYT NLĐ (đ)': r.bhytEmp,
      'BHTN NLĐ (đ)': r.bhtntEmp,
      'Tổng BH (đ)': r.totalInsurance,
      'Giảm Trừ Bản Thân (đ)': r.personalDeduction,
      'Giảm Trừ NPT (đ)': r.dependentDeduction,
      'Thu Nhập Tính Thuế (đ)': r.assessable,
      'Thuế TNCN Tháng (đ)': r.tax,
      'Thực Lãnh Tháng (đ)': r.netReceived,
      'Thuế TNCN Lũy Kế (đ)': r.cumTax,
      'Thực Lãnh Lũy Kế (đ)': r.cumNet,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${selectedEmployee.code} - ${selectedYear}`);
    XLSX.writeFile(wb, `ChiTietThueTNCN_${selectedEmployee.code}_${selectedYear}.xlsx`);
    setShowDetailExportMenu(false);
  };

  // ── XUẤT PDF CHI TIẾT THÁNG
  const exportDetailPdf = () => {
    if (!selectedEmployee || !monthlyRows.length) return;
    const emp = selectedEmployee;
    const rows = monthlyRows.map(r => `
      <tr>
        <td class="center">T${r.month}</td>
        <td class="right">${vnd(r.grossIncome + r.lunchAllowance)}</td>
        <td class="right">${vnd(r.grossIncome)}</td>
        <td class="right">${vnd(r.lunchAllowance)}</td>
        <td class="right">${vnd(r.lunchExempt + r.toxicExempt)}</td>
        <td class="right">${vnd(r.subjectToTax)}</td>
        <td class="right">${vnd(r.totalInsurance)}</td>
        <td class="right">${vnd(r.personalDeduction + r.dependentDeduction)}</td>
        <td class="right">${vnd(r.assessable)}</td>
        <td class="right bold" style="color:#c00">${vnd(r.tax)}</td>
        <td class="right bold" style="color:#007700">${vnd(r.netReceived)}</td>
      </tr>`).join('');
    const last = monthlyRows[monthlyRows.length - 1];
    const html = `
      <div class="center bold" style="font-size:9pt">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM - Độc lập - Tự do - Hạnh phúc</div>
      <div class="title">BẢNG CHI TIẾT THUẾ TNCN NĂM ${selectedYear}</div>
      <div class="sub">${emp.fullName} | ${emp.code} | ${emp.departmentName} | ${emp.position}</div>
      <table>
        <thead><tr>
          <th>Tháng</th><th>Tổng TN</th><th>Lương CB+CD</th><th>PC Ăn Ca</th>
          <th>Miễn Thuế</th><th>TNCT</th><th>Tổng BH</th>
          <th>Giảm Trừ</th><th>TNTT</th><th>Thuế TNCN</th><th>Thực Lãnh</th>
        </tr></thead>
        <tbody>${rows}
          <tr style="background:#eee;font-weight:bold">
            <td class="center">TỔNG</td>
            <td class="right">${vnd(last.cumGross)}</td>
            <td colspan="7" class="center">—</td>
            <td class="right" style="color:#c00">${vnd(last.cumTax)}</td>
            <td class="right" style="color:#007700">${vnd(last.cumNet)}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top:12px;font-size:9pt">
        Số người phụ thuộc: <b>${emp.numberOfDependents}</b> | 
        Giảm trừ bản thân: <b>${vnd(policy.personalDeduction || 11_000_000)}</b> đ/tháng |
        Giảm trừ NPT: <b>${vnd((policy.dependentDeduction || 4_400_000) * emp.numberOfDependents)}</b> đ/tháng
      </p>
      <div class="sig">
        <div><b>CÁN BỘ THUẾ</b><br><i>(Ký, ghi rõ họ tên)</i><br><br><br></div>
        <div><b>NHÂN VIÊN</b><br><i>${emp.fullName}</i><br><i>(Ký và ghi rõ họ tên)</i><br><br><br></div>
      </div>`;
    printHtml(`Chi Tiet Thue TNCN ${emp.fullName} ${selectedYear}`, html);
    setShowDetailExportMenu(false);
  };

  // ── XUẤT WORD CHI TIẾT
  const exportDetailWord = () => {
    if (!selectedEmployee || !monthlyRows.length) return;
    const emp = selectedEmployee;
    const last = monthlyRows[monthlyRows.length - 1];
    const rows = monthlyRows.map(r => `
      <tr>
        <td>Tháng ${r.month}/${r.year}</td>
        <td>${vnd(r.grossIncome + r.lunchAllowance)} đ</td>
        <td>${vnd(r.lunchAllowance)} đ</td>
        <td>${vnd(r.lunchExempt + r.toxicExempt)} đ</td>
        <td>${vnd(r.totalInsurance)} đ</td>
        <td>${vnd(r.personalDeduction + r.dependentDeduction)} đ</td>
        <td>${vnd(r.assessable)} đ</td>
        <td>${vnd(r.tax)} đ</td>
        <td><b>${vnd(r.netReceived)} đ</b></td>
      </tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"/><title>Chi Tiet TNCN</title>
      <style>body{font-family:Times New Roman,serif;font-size:12pt} table{border-collapse:collapse;width:100%} th,td{border:1px solid #000;padding:4px 6px} th{background:#ddd}</style>
      </head><body>
      <p align="center"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/>Độc lập - Tự do - Hạnh phúc</p>
      <h2 align="center">BẢNG CHI TIẾT THUẾ THU NHẬP CÁ NHÂN NĂM ${selectedYear}</h2>
      <p><b>Họ và tên:</b> ${emp.fullName} &nbsp;&nbsp; <b>Mã NV:</b> ${emp.code}</p>
      <p><b>Phòng ban:</b> ${emp.departmentName} &nbsp;&nbsp; <b>Chức vụ:</b> ${emp.position}</p>
      <p><b>Số người phụ thuộc:</b> ${emp.numberOfDependents} &nbsp;&nbsp; <b>Loại HĐ:</b> ${emp.contractType}</p>
      <table>
        <thead><tr><th>Tháng</th><th>Tổng Thu Nhập</th><th>PC Ăn Ca</th><th>Miễn Thuế</th><th>Bảo Hiểm</th><th>Giảm Trừ</th><th>TNTT</th><th>Thuế TNCN</th><th>Thực Lãnh</th></tr></thead>
        <tbody>${rows}
          <tr><td><b>TỔNG NĂM</b></td><td><b>${vnd(last.cumGross)} đ</b></td><td colspan="5"></td><td><b>${vnd(last.cumTax)} đ</b></td><td><b>${vnd(last.cumNet)} đ</b></td></tr>
        </tbody>
      </table>
      <br/><p>Ngày ...... tháng ...... năm ${selectedYear}</p>
      <table style="border:none;width:100%"><tr>
        <td style="border:none;text-align:center"><b>KẾ TOÁN TRƯỞNG</b><br/><br/><br/><br/>(Ký, ghi rõ họ tên)</td>
        <td style="border:none;text-align:center"><b>NGƯỜI LAO ĐỘNG</b><br/><br/><br/><br/>${emp.fullName}</td>
      </tr></table>
      </body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ChiTietThueTNCN_${emp.code}_${selectedYear}.doc`;
    a.click(); URL.revokeObjectURL(url);
    setShowDetailExportMenu(false);
  };

  // ── IN GIẤY ỦY QUYỀN
  const printAuthForm = (item: typeof taxSummary[0]) => {
    const html = `
      <div class="center bold" style="font-size:10pt">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div class="center" style="text-decoration:underline;font-size:10pt">Độc lập - Tự do - Hạnh phúc</div>
      <div class="title">GIẤY ỦY QUYỀN QUYẾT TOÁN THUẾ THU NHẬP CÁ NHÂN</div>
      <div class="sub">(Mẫu số 08/UQ-QTT-TNCN ban hành kèm theo Thông tư 80/2021/TT-BTC)</div>
      <p><b>Kính gửi:</b> Ban Giám Đốc Công ty ${policy.companyName}</p>
      <p>1. Tên tôi là: <b>${item.empName}</b></p>
      <p>2. Mã số nhân viên: <b>${item.empCode}</b> — Phòng ban: <b>${item.dept}</b></p>
      <p>3. Tổng thu nhập năm ${selectedYear}: <b>${fmt(item.grossTotal)}</b></p>
      <p>4. Thuế TNCN đã tạm khấu trừ: <b>${fmt(item.taxWithheld)}</b></p>
      <p>5. Thực lãnh cả năm: <b>${fmt(item.netTotal)}</b></p>
      <p>Năm ${selectedYear}, tôi chỉ có thu nhập tại ${policy.companyName} và đề nghị Công ty thay mặt tôi quyết toán thuế TNCN với cơ quan thuế theo quy định hiện hành.</p>
      <p>Tôi cam đoan các thông tin kê khai trên là hoàn toàn đúng sự thật.</p>
      <div class="sig">
        <div><b>ĐẠI DIỆN TỔ CHỨC TRẢ THU NHẬP</b><br><i>(Ký, ghi rõ họ tên, đóng dấu)</i><br><br><br><b>${policy.companyName}</b></div>
        <div><i>Ngày .... tháng .... năm ${selectedYear}</i><br><b>NGƯỜI ỦY QUYỀN</b><br><i>(Ký và ghi rõ họ tên)</i><br><br><br><b>${item.empName}</b></div>
      </div>`;
    printHtml(`Giay Uy Quyen QTT TNCN - ${item.empName}`, html);
  };

  // ── IN GIẤY XÁC NHẬN THU NHẬP
  const printIncomeConfirm = (item: typeof taxSummary[0]) => {
    const html = `
      <div class="center bold" style="font-size:10pt">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div class="center" style="text-decoration:underline;font-size:10pt">Độc lập - Tự do - Hạnh phúc</div>
      <div class="title">GIẤY XÁC NHẬN THU NHẬP</div>
      <div class="sub">Năm ${selectedYear} — Ban hành theo yêu cầu Điều 21 Thông tư 92/2015/TT-BTC</div>
      <p>Công ty: <b>${policy.companyName}</b> | MST: <b>${policy.taxCode}</b></p>
      <p>Xác nhận ông/bà <b>${item.empName}</b> — Mã NV: <b>${item.empCode}</b> làm việc tại <b>${item.dept}</b></p>
      <table>
        <thead><tr><th>Chỉ Tiêu</th><th>Số Tiền (đ)</th></tr></thead>
        <tbody>
          <tr><td>Tổng thu nhập cả năm</td><td class="right">${vnd(item.grossTotal)}</td></tr>
          <tr><td>Thuế TNCN đã khấu trừ tại nguồn</td><td class="right">${vnd(item.taxWithheld)}</td></tr>
          <tr><td>Thuế TNCN phải nộp cả năm (quyết toán)</td><td class="right">${vnd(item.yearlyTax)}</td></tr>
          <tr><td>Kết quả quyết toán</td><td class="right">${item.netBalance < 0 ? `Được hoàn: ${vnd(Math.abs(item.netBalance))}` : item.netBalance > 0 ? `Nộp thêm: ${vnd(item.netBalance)}` : 'Đã cân bằng'}</td></tr>
          <tr><td><b>Thực lãnh cả năm</b></td><td class="right bold">${vnd(item.netTotal)}</td></tr>
          <tr><td>Số tháng làm việc</td><td class="right">${item.monthsWorked} tháng</td></tr>
          <tr><td>Số người phụ thuộc</td><td class="right">${item.dependents} người</td></tr>
        </tbody>
      </table>
      <p style="margin-top:12px">Giấy này được cấp theo yêu cầu và chỉ có giá trị trong năm ${selectedYear}.</p>
      <div class="sig">
        <div><b>KẾ TOÁN TRƯỞNG</b><br><i>(Ký, ghi rõ họ tên)</i><br><br><br></div>
        <div><i>TP.HCM, ngày .... tháng .... năm ${selectedYear}</i><br><b>TỔNG GIÁM ĐỐC</b><br><i>(Ký tên, đóng dấu)</i><br><br><br></div>
      </div>`;
    printHtml(`Giay Xac Nhan Thu Nhap ${selectedYear} - ${item.empName}`, html);
  };

  // ── XUẤT EXCEL MẪU XÁC NHẬN THU NHẬP
  const exportIncomeConfirmExcel = (item: typeof taxSummary[0]) => {
    const data = [
      { 'Chỉ Tiêu': 'Họ và tên', 'Thông Tin': item.empName },
      { 'Chỉ Tiêu': 'Mã nhân viên', 'Thông Tin': item.empCode },
      { 'Chỉ Tiêu': 'Phòng ban', 'Thông Tin': item.dept },
      { 'Chỉ Tiêu': 'Năm tính thuế', 'Thông Tin': selectedYear },
      { 'Chỉ Tiêu': 'Số tháng làm việc', 'Thông Tin': item.monthsWorked },
      { 'Chỉ Tiêu': 'Số người phụ thuộc', 'Thông Tin': item.dependents },
      { 'Chỉ Tiêu': 'Tổng thu nhập cả năm (đ)', 'Thông Tin': item.grossTotal },
      { 'Chỉ Tiêu': 'Thuế TNCN đã khấu trừ (đ)', 'Thông Tin': item.taxWithheld },
      { 'Chỉ Tiêu': 'Thuế TNCN quyết toán (đ)', 'Thông Tin': item.yearlyTax },
      { 'Chỉ Tiêu': 'Thực lãnh cả năm (đ)', 'Thông Tin': item.netTotal },
      { 'Chỉ Tiêu': 'Kết quả quyết toán', 'Thông Tin': item.netBalance < 0 ? `Được hoàn: ${vnd(Math.abs(item.netBalance))} đ` : item.netBalance > 0 ? `Nộp thêm: ${vnd(item.netBalance)} đ` : 'Cân bằng' },
      { 'Chỉ Tiêu': 'Trạng thái ủy quyền', 'Thông Tin': item.authStatusLabel },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'XacNhanThuNhap');
    XLSX.writeFile(wb, `XacNhanThuNhap_${item.empCode}_${selectedYear}.xlsx`);
  };


  // ========================================================
  // XUẤT EXCEL BẢNG QUYẾT TOÁN THUẾ TNCN CÁ NHÂN (CÓ CÔNG THỨC)
  // ========================================================
  const handleExportIndividualTaxSettlementExcel = (item: any) => {
    const wb = XLSX.utils.book_new();

    // 1. SHEET 1: BẢNG QUYẾT TOÁN THUẾ TNCN NĂM (CÓ CÔNG THỨC)
    const title = [[`BẢNG QUYẾT TOÁN THUẾ THU NHẬP CÁ NHÂN NĂM ${selectedYear}`]];
    const company = [[`Đơn vị chi trả thu nhập: ${policy.companyName} • MST: ${policy.taxCode}`]];
    const empty = [[]];
    const empInfo = [
      ['Họ và tên cá nhân:', item.empName, '', 'Mã nhân sự:', item.empCode],
      ['Phòng ban / Xưởng:', item.dept, '', 'Số CCCD:', item.emp.cccd || '001090012345'],
      ['Mã số thuế cá nhân:', item.emp.taxCode || '8012345678', '', 'Số người phụ thuộc:', item.emp.numberOfDependents || 0],
      ['Thời gian làm việc trong năm:', `${item.monthsWorked} tháng`, '', 'Hình thức quyết toán:', item.isAuthorized ? 'Ủy quyền cho tổ chức (Mẫu 08/CK-TNCN)' : 'Tự quyết toán trực tiếp']
    ];

    const part1Title = [['I. CÁC KHOẢN THU NHẬP CHỊU THUẾ TRONG NĂM', 'SỐ TIỀN (VNĐ)', 'CĂN CỨ PHÁP LÝ']];
    const part1Rows = [
      ['1. Tổng thu nhập phát sinh cả năm (Gross)', item.grossTotal, 'Tổng lương + phụ cấp 12 tháng'],
      ['2. Các khoản phụ cấp được miễn thuế (Ăn trưa tối đa 1.2tr/th, độc hại)', Math.round(item.grossTotal * 0.05), 'Thông tư 111/2013/TT-BTC'],
      ['3. THU NHẬP CHỊU THUẾ (TNCT = 1 - 2)', { t: 'n', f: 'B12-B13' }, 'Thu nhập làm căn cứ tính thuế']
    ];

    const part2Title = [['II. CÁC KHOẢN GIẢM TRỪ GIA CẢNH & BẢO HIỂM', 'SỐ TIỀN (VNĐ)', 'QUY ĐỊNH']];
    const part2Rows = [
      ['1. Giảm trừ bản thân (11 triệu/tháng x 12 tháng)', 132000000, 'Nghị quyết 954/2020/UBTVQH14'],
      ['2. Giảm trừ người phụ thuộc (4.4 triệu/người/tháng)', (item.emp.numberOfDependents || 0) * 4400000 * item.monthsWorked, `${item.emp.numberOfDependents || 0} người phụ thuộc`],
      ['3. Bảo hiểm bắt buộc đã nộp (BHXH 8%, BHYT 1.5%, BHTN 1%)', Math.round(item.grossTotal * 0.105), 'Luật BHXH và Luật Việc làm']
    ];
    const part2Total = [['TỔNG CÁC KHOẢN GIẢM TRỪ', { t: 'n', f: 'SUM(B17:B19)' }, 'Tổng trừ trước khi tính thuế']];

    const part3Title = [['III. XÁC ĐỊNH NGHĨA VỤ THUẾ CẢ NĂM', 'SỐ TIỀN (VNĐ)', 'CÔNG THỨC']];
    const part3Rows = [
      ['1. Thu nhập tính thuế (TNTT = TNCT - Giảm trừ)', { t: 'n', f: 'MAX(0, B14-B20)' }, 'TNTT chịu thuế lũy tiến'],
      ['2. Thuế TNCN phải nộp cả năm (Biểu 7 bậc)', item.yearlyTax, 'Luật Thuế TNCN hiện hành'],
      ['3. Thuế TNCN đã tạm khấu trừ tại nguồn trong năm', item.taxWithheld, 'Khấu trừ hàng tháng qua bảng lương']
    ];

    const part4Title = [['IV. KẾT QUẢ QUYẾT TOÁN THUẾ TNCN', 'SỐ TIỀN (VNĐ)', 'KẾT LUẬN XỬ LÝ']];
    const balanceDiff = item.yearlyTax - item.taxWithheld;
    const part4Row = [
      balanceDiff < 0 
        ? 'SỐ THUẾ NỘP THỪA ĐƯỢC HOÀN TRẢ (HOÀN THUẾ)' 
        : balanceDiff > 0 
        ? 'SỐ THUẾ CÒN PHẢI NỘP THÊM VÀO NGÂN SÁCH' 
        : 'SỐ THUẾ CÂN BẰNG (KHÔNG PHẢI NỘP THÊM)',
      { t: 'n', f: 'B24-B25' },
      balanceDiff < 0 
        ? '✓ Doanh nghiệp cấn trừ kỳ lương tiếp hoặc Hoàn từ KBNN' 
        : balanceDiff > 0 
        ? '⚠️ Khấu trừ kỳ lương tiếp hoặc Nộp vào KBNN' 
        : '✓ Đã hoàn tất quyết toán'
    ];

    const signatures = [
      [],
      ['NGƯỜI NỘP THUẾ', '', 'KẾ TOÁN THUẾ', '', 'ĐẠI DIỆN TỔ CHỨC CHI TRẢ THU NHẬP'],
      ['(Ký, ghi rõ họ tên)', '', '(Ký, ghi rõ họ tên)', '', '(Đã ký điện tử CA Doanh Nghiệp)']
    ];

    const wsData = [
      ...title,
      ...company,
      ...empty,
      ...empInfo,
      ...empty,
      ...part1Title,
      ...part1Rows,
      ...empty,
      ...part2Title,
      ...part2Rows,
      ...part2Total,
      ...empty,
      ...part3Title,
      ...part3Rows,
      ...empty,
      ...part4Title,
      part4Row,
      ...signatures
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, `Quyet_Toan_Nam_${selectedYear}`);

    // 2. SHEET 2: CHI TIẾT KÊ KHAI 12 THÁNG
    const detailHeaders = [
      'Tháng', 'Tổng Thu Nhập', 'Phụ Cấp Ăn', 'Miễn Thuế', 'Thu Nhập Chịu Thuế', 
      'BHXH (8%)', 'BHYT (1.5%)', 'BHTN (1%)', 'Tổng BH', 'Giảm Trừ Bản Thân', 
      'Giảm Trừ NPT', 'Thu Nhập Tính Thuế', 'Thuế TNCN Tháng', 'Thực Lãnh Net'
    ];

    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      const r = calcMonthlyTax(item.emp, policy, m, selectedYear);
      monthlyData.push([
        `Tháng ${m}/${selectedYear}`,
        r.grossIncome + r.lunchAllowance,
        r.lunchAllowance,
        r.lunchExempt + r.toxicExempt,
        r.subjectToTax,
        r.bhxhEmp,
        r.bhytEmp,
        r.bhtntEmp,
        r.totalInsurance,
        r.personalDeduction,
        r.dependentDeduction,
        r.assessable,
        r.tax,
        r.netReceived
      ]);
    }

    const detailTotalRow = [
      'TỔNG CỘNG 12 THÁNG',
      { t: 'n', f: 'SUM(B2:B13)' },
      { t: 'n', f: 'SUM(C2:C13)' },
      { t: 'n', f: 'SUM(D2:D13)' },
      { t: 'n', f: 'SUM(E2:E13)' },
      { t: 'n', f: 'SUM(F2:F13)' },
      { t: 'n', f: 'SUM(G2:G13)' },
      { t: 'n', f: 'SUM(H2:H13)' },
      { t: 'n', f: 'SUM(I2:I13)' },
      { t: 'n', f: 'SUM(J2:J13)' },
      { t: 'n', f: 'SUM(K2:K13)' },
      { t: 'n', f: 'SUM(L2:L13)' },
      { t: 'n', f: 'SUM(M2:M13)' },
      { t: 'n', f: 'SUM(N2:N13)' }
    ];

    const wsDetail = XLSX.utils.aoa_to_sheet([detailHeaders, ...monthlyData, detailTotalRow]);
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Chi_Tiet_12_Thang');

    XLSX.writeFile(wb, `Bang_Quyet_Toan_Thue_TNCN_${selectedYear}_${item.empCode}_${item.empName.replace(/\s+/g, '_')}.xlsx`);
  };

  // ========================================================
  // GỬI EMAIL HÀNG LOẠT THÔNG BÁO QUYẾT TOÁN THUẾ TNCN
  // ========================================================
  const recipientsForTaxEmail = useMemo(() => {
    if (taxEmailGrouping === 'ALL') {
      return filtered;
    } else if (taxEmailGrouping === 'AUTHORIZED') {
      return filtered.filter(i => i.isAuthorized);
    } else if (taxEmailGrouping === 'DIRECT') {
      return filtered.filter(i => !i.isAuthorized);
    } else {
      if (selectedEmpCodesForEmail.size === 0) return filtered;
      return filtered.filter(i => selectedEmpCodesForEmail.has(i.empCode));
    }
  }, [taxEmailGrouping, filtered, selectedEmpCodesForEmail]);

  const toggleSelectAllTaxPage = () => {
    const pageCodes = paginated.map(i => i.empCode);
    const allSelected = pageCodes.every(c => selectedEmpCodesForEmail.has(c));
    const next = new Set(selectedEmpCodesForEmail);
    if (allSelected) {
      pageCodes.forEach(c => next.delete(c));
    } else {
      pageCodes.forEach(c => next.add(c));
    }
    setSelectedEmpCodesForEmail(next);
  };

  const toggleSelectTaxEmp = (code: string) => {
    const next = new Set(selectedEmpCodesForEmail);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setSelectedEmpCodesForEmail(next);
  };

  const handleStartSendingTaxEmail = () => {
    if (recipientsForTaxEmail.length === 0) {
      alert('Chưa có nhân viên nào được chọn để gửi email quyết toán thuế!');
      return;
    }

    setIsSendingTaxEmail(true);
    setTaxEmailProgress(0);
    setTaxEmailLogs([]);

    const total = recipientsForTaxEmail.length;
    let sentCount = 0;

    const interval = setInterval(() => {
      if (sentCount >= total) {
        clearInterval(interval);
        setIsSendingTaxEmail(false);
        setTaxEmailProgress(100);
        return;
      }

      const item = recipientsForTaxEmail[sentCount];
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN');
      const empEmail = `${item.empCode.toLowerCase()}@${policy.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.vn`;

      setTaxEmailLogs(prev => [
        {
          name: item.empName,
          code: item.empCode,
          email: empEmail,
          netBalance: item.netBalance,
          status: 'SUCCESS',
          time: timeStr
        },
        ...prev
      ]);

      sentCount += 1;
      const pct = Math.round((sentCount / total) * 100);
      setTaxEmailProgress(pct);
    }, 250);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-4">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          {view === 'MONTHLY_DETAIL' && (
            <button onClick={() => { setView('SUMMARY'); setSelectedEmployee(null); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-bold text-slate-900">
                {view === 'MONTHLY_DETAIL' && selectedEmployee
                  ? `Chi Tiết Thuế TNCN — ${selectedEmployee.fullName}`
                  : 'Quyết Toán Thuế TNCN Năm'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {view === 'MONTHLY_DETAIL'
                ? `${selectedEmployee?.code} · ${selectedEmployee?.departmentName} · Mẫu 08/UQ-QTT-TNCN`
                : 'Lũy kế 12 tháng, đối trừ gia cảnh & bảo hiểm — Mẫu 08/UQ-QTT-TNCN TT 80/2021/TT-BTC'}
            </p>
          </div>
        </div>

        {/* Chọn năm */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <Calendar className="w-4 h-4 text-slate-500 ml-1" />
            <select
              value={selectedYear}
              onChange={e => { setSelectedYear(Number(e.target.value)); setCurrentPage(1); }}
              className="text-sm font-bold bg-transparent border-0 outline-none text-slate-800 cursor-pointer pr-2"
            >
              {YEARS.map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
          </div>

          {/* Xuất file bảng tổng hợp */}
          {view === 'SUMMARY' && (
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportMenu(v => !v)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất File ▾</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-9 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 w-52 text-xs">
                  <button onClick={exportSummaryExcel} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Xuất Excel (.xlsx)
                  </button>
                  <button onClick={exportSummaryPdf} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <Printer className="w-3.5 h-3.5 text-rose-600" /> In / Xuất PDF
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Xuất file chi tiết tháng */}
          {view === 'MONTHLY_DETAIL' && (
            <div className="relative" ref={detailExportRef}>
              <button
                onClick={() => setShowDetailExportMenu(v => !v)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất File ▾</span>
              </button>
              {showDetailExportMenu && (
                <div className="absolute right-0 top-9 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 w-56 text-xs">
                  <div className="px-4 py-1 text-[10px] text-slate-400 font-semibold uppercase">Chi tiết từng tháng</div>
                  <button onClick={exportDetailExcel} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Xuất Excel (.xlsx)
                  </button>
                  <button onClick={exportDetailPdf} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <Printer className="w-3.5 h-3.5 text-rose-600" /> In / Xuất PDF
                  </button>
                  <button onClick={exportDetailWord} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Xuất Word (.doc)
                  </button>
                  <hr className="my-1 border-slate-100"/>
                  <div className="px-4 py-1 text-[10px] text-slate-400 font-semibold uppercase">Giấy xác nhận thu nhập</div>
                  <button onClick={() => { exportIncomeConfirmExcel(taxSummary.find(t => t.emp === selectedEmployee)!); setShowDetailExportMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> XN Thu Nhập — Excel
                  </button>
                  <button onClick={() => { printIncomeConfirm(taxSummary.find(t => t.emp === selectedEmployee)!); setShowDetailExportMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                    <Printer className="w-3.5 h-3.5 text-rose-600" /> XN Thu Nhập — In PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════ VIEW: BẢNG TỔNG HỢP ════════════════════ */}
      {view === 'SUMMARY' && (
        <>
          {/* Tabs lọc */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            {(['ALL', 'AUTHORIZED', 'DIRECT'] as const).map(f => (
              <button key={f}
                onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {f === 'ALL' ? `Tất Cả (${taxSummary.length})` : f === 'AUTHORIZED' ? `Đã Ủy Quyền Mẫu 08 (${taxSummary.filter(t => t.isAuthorized).length})` : `Tự Quyết Toán (${taxSummary.filter(t => !t.isAuthorized).length})`}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm mã/tên..." className="text-xs outline-none w-36 bg-transparent" />
              {searchTerm && <button onClick={() => setSearchTerm('')}><X className="w-3 h-3 text-slate-400" /></button>}
            </div>
          </div>

          {/* Bảng tổng hợp */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10px] tracking-wider select-none">
                  <tr>
                    <th className="px-3 py-2.5 text-center">
                      <button onClick={toggleSelectAllTaxPage} className="cursor-pointer text-slate-400 hover:text-indigo-600">
                        {paginated.length > 0 && paginated.every(i => selectedEmpCodesForEmail.has(i.empCode)) ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-2.5">Mã NV</th>
                    <th className="px-3 py-2.5">Họ và Tên</th>
                    <th className="px-3 py-2.5">Phòng Ban</th>
                    <th className="px-3 py-2.5 text-center">Tháng LV</th>
                    <th className="px-3 py-2.5 text-right">Tổng Thu Nhập</th>
                    <th className="px-3 py-2.5 text-right">Thuế TNCN Năm</th>
                    <th className="px-3 py-2.5 text-right">Đã Khấu Trừ</th>
                    <th className="px-3 py-2.5 text-right">Thực Lãnh Năm</th>
                    <th className="px-3 py-2.5 text-center">Kết Quả QT</th>
                    <th className="px-3 py-2.5 text-center">Ủy Quyền</th>
                    <th className="px-3 py-2.5 text-center">Thao Tác</th>
                  </tr>
                  {/* Hàng lọc cột */}
                  <tr className="bg-slate-100/70 border-b border-slate-200 normal-case font-normal text-[11px]">
                    {(['code','name','dept','months','income','taxYearly','taxWithheld','balance','authStatus'] as const).map((k, i) => (
                      <th key={k} className={`px-2 py-1 ${i === 3 || i === 8 ? 'text-center' : ''}`}>
                        <input value={colFilters[k]} onChange={e => { setColFilters(p => ({...p,[k]:e.target.value})); setCurrentPage(1); }}
                          placeholder={['Mã...','Tên...','Ban...','12,=6...','≥100tr...','≥0...','≥0...','<0=hoàn...','Ủy quyền...'][i]}
                          className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500" />
                      </th>
                    ))}
                    {/* cột thực lãnh không có filter */}
                    <th className="px-2 py-1" />
                    <th className="px-2 py-1 text-center">
                      {Object.values(colFilters).some(v => v) && (
                        <button onClick={() => { setColFilters({code:'',name:'',dept:'',months:'',income:'',taxYearly:'',taxWithheld:'',balance:'',authStatus:''}); setCurrentPage(1); }}
                          className="text-[10px] text-indigo-600 hover:underline font-bold">Xóa lọc</button>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map(item => (
                    <tr key={item.empCode} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-3 py-2.5 text-center">
                          <button onClick={() => toggleSelectTaxEmp(item.empCode)} className="cursor-pointer text-slate-400 hover:text-indigo-600">
                            {selectedEmpCodesForEmail.has(item.empCode) ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold text-indigo-700">{item.empCode}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">
                        <button onClick={() => openDetail(item.emp)} className="hover:text-indigo-600 hover:underline transition-colors text-left">
                          {item.empName}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 max-w-[120px] truncate" title={item.dept}>{item.dept}</td>
                      <td className="px-3 py-2.5 text-center font-medium">{item.monthsWorked} tháng</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-800">{vnd(item.grossTotal)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-700">{vnd(item.yearlyTax)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{vnd(item.taxWithheld)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">{vnd(item.netTotal)}</td>
                      <td className="px-3 py-2.5 text-center">
                        {item.netBalance < 0
                          ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Hoàn: {vnd(Math.abs(item.netBalance))}</span>
                          : item.netBalance > 0
                          ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Nộp: {vnd(item.netBalance)}</span>
                          : <span className="text-slate-400 text-[10px]">Cân bằng</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${item.isAuthorized ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                          {item.isAuthorized ? 'Mẫu 08 ✓' : 'Trực Tiếp'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedSettlementItem(item)}
                            title="Xem trực tiếp Bảng Quyết Toán Cá Nhân (Personal Settlement)"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <Eye className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleExportIndividualTaxSettlementExcel(item)}
                            title="Xuất file Excel Quyết Toán Cá Nhân Cả Năm (Có Công Thức)"
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200">
                            <FileSpreadsheet className="w-3 h-3" />
                          </button>
                          <button onClick={() => printAuthForm(item)}
                            title="In Giấy ủy quyền Mẫu 08"
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200">
                            <Printer className="w-3 h-3" />
                          </button>
                          <button onClick={() => printIncomeConfirm(item)}
                            title="In Giấy xác nhận thu nhập"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <FileCheck className="w-3 h-3" />
                          </button>
                          <button onClick={() => exportIncomeConfirmExcel(item)}
                            title="Xuất Xác Nhận Thu Nhập Excel"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200">
                            <FileSpreadsheet className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={11} className="text-center py-8 text-xs text-slate-400 italic">Không có dữ liệu phù hợp.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <CompactPagination
              currentPage={currentPage} totalPages={totalPages}
              totalRecords={filtered.length} pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={s => { setPageSize(s); setCurrentPage(1); }}
            />
          </div>
        </>
      )}

      {/* ════════════════════ VIEW: CHI TIẾT TỪNG THÁNG ════════════════════ */}
      {view === 'MONTHLY_DETAIL' && selectedEmployee && (
        <>
          {/* Thẻ thông tin nhân viên */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-base">
                {selectedEmployee.fullName.split(' ').pop()?.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{selectedEmployee.fullName}</div>
                <div className="text-slate-500">{selectedEmployee.code} · {selectedEmployee.position}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-slate-600">
              <span>🏢 {selectedEmployee.departmentName}</span>
              <span>👨‍👩‍👧 {selectedEmployee.numberOfDependents} người phụ thuộc</span>
              <span>📄 {selectedEmployee.contractType}</span>
              <span>💰 Lương CB: <b className="text-slate-800">{vnd(selectedEmployee.baseSalary)}</b> đ</span>
              <span>📊 Lương CD: <b className="text-slate-800">{vnd(selectedEmployee.positionSalary)}</b> đ</span>
              <span>🍱 PC Ăn Ca: <b className="text-slate-800">{vnd(selectedEmployee.lunchAllowance || 0)}</b> đ</span>
            </div>
          </div>

          {/* Bảng chi tiết từng tháng */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5">Tháng</th>
                    <th className="px-3 py-2.5 text-right">Tổng TN</th>
                    <th className="px-3 py-2.5 text-right">PC Ăn Ca</th>
                    <th className="px-3 py-2.5 text-right">Miễn Thuế</th>
                    <th className="px-3 py-2.5 text-right">TNCT</th>
                    <th className="px-3 py-2.5 text-right">BHXH NLĐ</th>
                    <th className="px-3 py-2.5 text-right">BHYT</th>
                    <th className="px-3 py-2.5 text-right">BHTN</th>
                    <th className="px-3 py-2.5 text-right">Tổng BH</th>
                    <th className="px-3 py-2.5 text-right">Giảm Trừ BT</th>
                    <th className="px-3 py-2.5 text-right">Giảm Trừ NPT</th>
                    <th className="px-3 py-2.5 text-right">TNTT</th>
                    <th className="px-3 py-2.5 text-right text-rose-700">Thuế TNCN</th>
                    <th className="px-3 py-2.5 text-right text-emerald-700">Thực Lãnh</th>
                    <th className="px-3 py-2.5 text-right text-slate-500">Thuế Lũy Kế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyRows.map(r => (
                    <tr key={r.month} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 font-semibold text-indigo-700">T{r.month}/{r.year}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{vnd(r.grossIncome + r.lunchAllowance)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{vnd(r.lunchAllowance)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-amber-600">{vnd(r.lunchExempt + r.toxicExempt)}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{vnd(r.subjectToTax)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{vnd(r.bhxhEmp)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{vnd(r.bhytEmp)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">{vnd(r.bhtntEmp)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-600">{vnd(r.totalInsurance)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-blue-600">{vnd(r.personalDeduction)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-blue-600">{vnd(r.dependentDeduction)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold">{vnd(r.assessable)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-600">{vnd(r.tax)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">{vnd(r.netReceived)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-400">{vnd(r.cumTax)}</td>
                    </tr>
                  ))}
                </tbody>
                {/* Hàng tổng cộng */}
                {monthlyRows.length > 0 && (() => {
                  const last = monthlyRows[monthlyRows.length - 1];
                  return (
                    <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs">
                      <tr>
                        <td className="px-3 py-2.5 text-indigo-800">TỔNG NĂM {selectedYear}</td>
                        <td className="px-3 py-2.5 text-right font-mono">{vnd(last.cumGross)}</td>
                        <td colSpan={11} className="px-3 py-2.5 text-center text-slate-400 text-[10px]">— lũy kế tất cả các tháng —</td>
                        <td className="px-3 py-2.5 text-right font-mono text-rose-700">{vnd(last.cumTax)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-emerald-700">{vnd(last.cumNet)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  );
                })()}
              </table>
            </div>
          </div>

          {/* Chú thích */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-0.5">
            <p className="font-semibold">📌 Ghi chú tính thuế:</p>
            <p>• <b>TNCT</b>: Thu nhập chịu thuế = Lương CB + CD − Phụ cấp ăn ca miễn thuế (≤1.200.000đ/tháng) − Bồi dưỡng hiện vật miễn thuế</p>
            <p>• <b>TNTT</b>: Thu nhập tính thuế = TNCT − Tổng BH NLĐ − Giảm trừ bản thân − Giảm trừ NPT</p>
            <p>• <b>Thực Lãnh</b> = Lương CB + CD + PC Ăn Ca + Bồi dưỡng hiện vật − Tổng BH NLĐ − Thuế TNCN</p>
            <p>• Giảm trừ bản thân: <b>{vnd(policy.personalDeduction || 11_000_000)} đ/tháng</b> | Giảm trừ NPT: <b>{vnd(policy.dependentDeduction || 4_400_000)} đ/người/tháng</b></p>
            <p>• Căn cứ: Luật Thuế TNCN 2007 (sửa đổi 2012, 2023) | NQ 954/2020/UBTVQH14 | TT 111/2013/TT-BTC</p>
          </div>
        </>
      )}

      {/* ════════════════════ MODAL XEM TRỰC TIẾP BẢNG QUYẾT TOÁN CÁ NHÂN ════════════════════ */}
      {selectedSettlementItem && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedSettlementItem(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">
                    Bảng Quyết Toán Thuế TNCN Cá Nhân Cả Năm {selectedYear}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedSettlementItem.empName} ({selectedSettlementItem.empCode})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedSettlementItem.dept} • {selectedSettlementItem.emp.position}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSettlementItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thẻ trạng thái kết quả quyết toán */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              selectedSettlementItem.netBalance < 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : selectedSettlementItem.netBalance > 0 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider block">
                  {selectedSettlementItem.netBalance < 0 
                    ? '✓ KẾT QUẢ: ĐƯỢC HOÀN THUẾ THỪA' 
                    : selectedSettlementItem.netBalance > 0 
                    ? '⚠️ KẾT QUẢ: CÒN PHẢI NỘP THÊM THUẾ' 
                    : '✓ KẾT QUẢ: THUẾ ĐÃ CÂN BẰNG'}
                </span>
                <span className="text-2xl font-black">
                  {vnd(Math.abs(selectedSettlementItem.netBalance))} VNĐ
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="font-semibold block">Hình thức quyết toán:</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${
                  selectedSettlementItem.isAuthorized 
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300' 
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {selectedSettlementItem.isAuthorized ? 'Ủy quyền Doanh nghiệp (Mẫu 08) ✓' : 'Tự Quyết Toán Trực Tiếp'}
                </span>
              </div>
            </div>

            {/* Chi tiết các chỉ số quyết toán */}
            <div className="space-y-3 text-xs">
              {/* Phần 1: Thu nhập chịu thuế */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
                  <span>I. TỔNG THU NHẬP CHỊU THUẾ TRONG NĂM</span>
                  <span className="font-mono text-slate-900">{vnd(selectedSettlementItem.grossTotal)} đ</span>
                </div>
                <div className="divide-y divide-slate-100 p-2 text-[11px]">
                  <div className="flex justify-between py-1 px-2">
                    <span className="text-slate-600">• Tổng thu nhập phát sinh 12 tháng:</span>
                    <b className="font-mono">{vnd(selectedSettlementItem.grossTotal)} đ</b>
                  </div>
                  <div className="flex justify-between py-1 px-2">
                    <span className="text-slate-600">• Các khoản phụ cấp được miễn thuế (Ăn trưa, độc hại):</span>
                    <b className="font-mono text-emerald-600">-{vnd(Math.round(selectedSettlementItem.grossTotal * 0.05))} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2 bg-slate-50/70 font-bold">
                    <span>= Thu nhập chịu thuế (TNCT):</span>
                    <span className="font-mono text-indigo-700">{vnd(Math.round(selectedSettlementItem.grossTotal * 0.95))} đ</span>
                  </div>
                </div>
              </div>

              {/* Phần 2: Giảm trừ gia cảnh & BHXH */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 border-b border-slate-200">
                  II. CÁC KHOẢN GIẢM TRỪ GIA CẢNH & BẢO HIỂM
                </div>
                <div className="divide-y divide-slate-100 p-2 text-[11px]">
                  <div className="flex justify-between py-1 px-2">
                    <span className="text-slate-600">• Giảm trừ bản thân (11 triệu/tháng x 12 tháng):</span>
                    <b className="font-mono text-blue-700">-132.000.000 đ</b>
                  </div>
                  <div className="flex justify-between py-1 px-2">
                    <span className="text-slate-600">• Giảm trừ người phụ thuộc ({selectedSettlementItem.emp.numberOfDependents || 0} người x 4.4tr/tháng):</span>
                    <b className="font-mono text-blue-700">-{vnd((selectedSettlementItem.emp.numberOfDependents || 0) * 4400000 * selectedSettlementItem.monthsWorked)} đ</b>
                  </div>
                  <div className="flex justify-between py-1 px-2">
                    <span className="text-slate-600">• Các khoản đóng bảo hiểm bắt buộc (BHXH 8%, BHYT 1.5%, BHTN 1%):</span>
                    <b className="font-mono text-slate-700">-{vnd(Math.round(selectedSettlementItem.grossTotal * 0.105))} đ</b>
                  </div>
                </div>
              </div>

              {/* Phần 3: Thuế phải nộp và đã tạm nộp */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-700 border-b border-slate-200">
                  III. NGHĨA VỤ THUẾ TNCN QUYẾT TOÁN CẢ NĂM
                </div>
                <div className="divide-y divide-slate-100 p-2 text-[11px]">
                  <div className="flex justify-between py-1 px-2">
                    <span className="text-slate-600">• Thuế TNCN phải nộp cả năm (áp dụng biểu thuế lũy tiến 7 bậc):</span>
                    <b className="font-mono text-slate-900">{vnd(selectedSettlementItem.yearlyTax)} đ</b>
                  </div>
                  <div className="flex justify-between py-1 px-2">
                    <span className="text-slate-600">• Thuế TNCN đã tạm khấu trừ qua bảng lương 12 tháng:</span>
                    <b className="font-mono text-slate-900">-{vnd(selectedSettlementItem.taxWithheld)} đ</b>
                  </div>
                  <div className="flex justify-between py-1.5 px-2 bg-slate-50/70 font-black text-xs">
                    <span>= Chênh lệch quyết toán (Hoàn / Nộp thêm):</span>
                    <span className={selectedSettlementItem.netBalance < 0 ? 'text-emerald-700' : selectedSettlementItem.netBalance > 0 ? 'text-rose-700' : 'text-slate-700'}>
                      {selectedSettlementItem.netBalance < 0 ? `Được hoàn ${vnd(Math.abs(selectedSettlementItem.netBalance))} đ` : selectedSettlementItem.netBalance > 0 ? `Nộp thêm ${vnd(selectedSettlementItem.netBalance)} đ` : 'Cân bằng'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleExportIndividualTaxSettlementExcel(selectedSettlementItem)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Xuất Excel Quyết Toán (Có Công Thức)</span>
              </button>

              <button
                onClick={() => {
                  setSelectedEmpCodesForEmail(new Set([selectedSettlementItem.empCode]));
                  setTaxEmailGrouping('SELECTED');
                  setShowBulkTaxEmailModal(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Gửi Email Bảng Này</span>
              </button>

              <button
                onClick={() => printIncomeConfirm(selectedSettlementItem)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Bản Cứng</span>
              </button>

              <button
                onClick={() => setSelectedSettlementItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL GỬI EMAIL HÀNG LOẠT QUYẾT TOÁN THUẾ ════════════════════ */}
      {showBulkTaxEmailModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isSendingTaxEmail && setShowBulkTaxEmailModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto"
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
                    Gửi Email Hàng Loạt Bảng Quyết Toán Thuế TNCN Năm {selectedYear}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thông báo kết quả quyết toán (Hoàn thuế / Nộp thêm) kèm chứng từ khấu trừ thuế
                  </p>
                </div>
              </div>
              {!isSendingTaxEmail && (
                <button 
                  onClick={() => setShowBulkTaxEmailModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Nhóm nhận */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">
                Chọn Phân Nhóm Nhận Email Quyết Toán:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setTaxEmailGrouping('SELECTED')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    taxEmailGrouping === 'SELECTED'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>Đã Chọn Tick</div>
                  <span className="text-[10px] opacity-80">{selectedEmpCodesForEmail.size} nhân sự</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaxEmailGrouping('ALL')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    taxEmailGrouping === 'ALL'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>Toàn Doanh Nghiệp</div>
                  <span className="text-[10px] opacity-80">{filtered.length} nhân sự</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaxEmailGrouping('AUTHORIZED')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    taxEmailGrouping === 'AUTHORIZED'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>Ủy Quyền (Mẫu 08)</div>
                  <span className="text-[10px] opacity-80">{filtered.filter(i => i.isAuthorized).length} nhân sự</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaxEmailGrouping('DIRECT')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    taxEmailGrouping === 'DIRECT'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>Tự Quyết Toán</div>
                  <span className="text-[10px] opacity-80">{filtered.filter(i => !i.isAuthorized).length} nhân sự</span>
                </button>
              </div>
            </div>

            {/* Xem trước mẫu email */}
            <div className="p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-indigo-900">
                <span>Xem trước nội dung thư (Preview):</span>
                <span className="text-[11px] font-normal text-slate-500">Số lượng: <b>{recipientsForTaxEmail.length}</b> email</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-indigo-200 text-slate-700 font-mono text-[11px] space-y-1">
                <div><b>Tiêu đề:</b> [DigiTech] Thông Báo Kết Quả Quyết Toán Thuế TNCN Năm {selectedYear} - [Họ Và Tên]</div>
                <div className="pt-1"><b>Kính gửi Ông/Bà [Họ Và Tên],</b></div>
                <p>Phòng Nhân sự & Kế toán {policy.companyName} gửi kết quả quyết toán thuế TNCN năm {selectedYear}:</p>
                <p>• Tổng thu nhập phát sinh cả năm: <b>[Gross Total] VNĐ</b></p>
                <p>• Kết quả chênh lệch quyết toán: <b>[Được Hoàn Thuế / Nộp Thêm]</b></p>
                <p>• Đính kèm: File Excel chi tiết 12 tháng và Chứng từ khấu trừ thuế TNCN điện tử.</p>
              </div>
            </div>

            {/* Tiến trình gửi */}
            {isSendingTaxEmail && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-indigo-700">Đang gửi email thông báo quyết toán thuế...</span>
                  <span className="font-bold text-slate-900">{taxEmailProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-200 rounded-full"
                    style={{ width: `${taxEmailProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Logs */}
            {taxEmailLogs.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700">
                  Nhật Ký Đã Gửi ({taxEmailLogs.length}/{recipientsForTaxEmail.length} email):
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded-xl p-2 bg-slate-50 text-[11px]">
                  {taxEmailLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between py-1 px-1.5 rounded bg-white border border-slate-100">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-800">{log.name}</span>
                        <span className="text-slate-400 font-mono">({log.email})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={log.netBalance < 0 ? 'text-emerald-700 font-bold' : log.netBalance > 0 ? 'text-rose-700 font-bold' : 'text-slate-600 font-bold'}>
                          {log.netBalance < 0 ? `Hoàn ${vnd(Math.abs(log.netBalance))}` : log.netBalance > 0 ? `Nộp ${vnd(log.netBalance)}` : 'Cân bằng'}
                        </span>
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
                Tổng số: <b className="text-slate-800">{recipientsForTaxEmail.length}</b> nhân sự
              </span>
              <div className="flex items-center space-x-2">
                {!isSendingTaxEmail && (
                  <button
                    type="button"
                    onClick={() => setShowBulkTaxEmailModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSendingTaxEmail || recipientsForTaxEmail.length === 0}
                  onClick={handleStartSendingTaxEmail}
                  className={`flex items-center space-x-1.5 px-5 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    isSendingTaxEmail || recipientsForTaxEmail.length === 0
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingTaxEmail ? 'Đang Gửi Hàng Loạt...' : `Bắt Đầu Gửi (${recipientsForTaxEmail.length} Email)`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
