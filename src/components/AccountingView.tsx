import { FormattedNumberInput } from './FormattedNumberInput';
import React, { useState, useMemo, useEffect } from 'react';
import { AccountingJournalEntry, CompanyPolicy, UserRole, PayrollRecord, Employee } from '../types/hrm';
import { initialAccountingEntries } from '../services/mockData';
import { initialServiceContracts, ServiceContractEntry, initialHospitalityExpenses, HospitalityExpenseEntry } from '../services/accountingSpecialService';
import { CompactPagination, evaluateColumnCondition } from './SmartTableFilter';
import { 
  Calculator, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRightLeft,
  Building,
  DollarSign,
  Filter,
  Calendar,
  Layers,
  Search,
  BookOpen,
  Coffee,
  FileText,
  Plus,
  ShieldCheck,
  AlertCircle,
  Eye,
  Printer,
  Check,
  X,
  FileCheck,
  HelpCircle,
  Receipt,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface AccountingViewProps {
  policy: CompanyPolicy;
  currentRole: UserRole;
  payrollRecords?: PayrollRecord[];
  employees?: Employee[];
}

interface TransferAllocationRecord {
  id: string;
  employeeCode: string;
  employeeName: string;
  fromDept: string;
  toDept: string;
  transferDate: string;
  totalWorkDays: number;
  daysInFromDept: number;
  daysInToDept: number;
  totalMonthlyWage: number;
  fromDeptAccount: string;
  fromDeptAllocatedCost: number;
  toDeptAccount: string;
  toDeptAllocatedCost: number;
}

export const AccountingView: React.FC<AccountingViewProps> = ({ policy, currentRole, payrollRecords, employees }) => {
  const [activeTab, setActiveTab] = useState<'JOURNAL_ENTRIES' | 'TRANSFER_ALLOCATION' | 'SERVICE_CONTRACTS' | 'HOSPITALITY_EXPENSES'>('JOURNAL_ENTRIES');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Phân trang & Lọc cho Sổ Nhật Ký Chung
  const [journalPage, setJournalPage] = useState(1);
  const [journalPageSize, setJournalPageSize] = useState(10);
  const [journalFilters, setJournalFilters] = useState({
    date: '',
    desc: '',
    dept: '',
    debit: '',
    credit: '',
    amount: '',
  });

  // Phân trang & Lọc cho Phân Bổ Luân Chuyển
  const [transferPage, setTransferPage] = useState(1);
  const [transferPageSize, setTransferPageSize] = useState(10);
  const [transferFilters, setTransferFilters] = useState({
    code: '',
    name: '',
    transfer: '',
    split: '',
    costFrom: '',
    costTo: '',
  });

  // Sinh tự động các bút toán kế toán TT200 từ bảng lương thực tế
  const dynamicEntries = useMemo(() => {
    const safeNumber = (val: any): number => {
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    };

    if (!payrollRecords || payrollRecords.length === 0) {
      return initialAccountingEntries;
    }

    const currentRecords = payrollRecords.filter(r => r.month === selectedMonth);
    const recordsToUse = currentRecords.length > 0 ? currentRecords : payrollRecords;
    if (recordsToUse.length === 0) return initialAccountingEntries;

    const deptMap = new Map<string, { 
      totalGross: number; 
      totalInsCompany: number; 
      totalInsEmp: number;
      totalPIT: number;
      totalAdvance: number;
      totalNet: number; 
      count: number 
    }>();

    recordsToUse.forEach(r => {
      const dept = r.departmentName || 'Khối Văn Phòng';
      const cur = deptMap.get(dept) || { 
        totalGross: 0, 
        totalInsCompany: 0, 
        totalInsEmp: 0,
        totalPIT: 0,
        totalAdvance: 0,
        totalNet: 0, 
        count: 0 
      };

      // Xác định các chỉ tiêu lương an toàn tuyệt đối tránh NaN
      const gross = safeNumber(r.totalGrossIncome) || safeNumber((r as any).grossSalary) || (safeNumber(r.actualBaseSalary) + safeNumber(r.positionSalary)) || safeNumber(r.baseSalary) || 12000000;
      
      const insComp = (safeNumber(r.bhxhComp) + safeNumber(r.bhytComp) + safeNumber(r.bhtnComp) + safeNumber(r.unionComp)) || Math.round((safeNumber(r.actualBaseSalary) || safeNumber(r.baseSalary) || gross) * 0.235);
      
      const insEmp = safeNumber(r.totalInsuranceEmp) || (safeNumber(r.bhxhEmp) + safeNumber(r.bhytEmp) + safeNumber(r.bhtnEmp) + safeNumber(r.unionEmp)) || Math.round((safeNumber(r.actualBaseSalary) || safeNumber(r.baseSalary) || gross) * 0.105);
      
      const pit = safeNumber(r.personalIncomeTax);
      const advance = safeNumber(r.salaryAdvance);
      const net = safeNumber(r.netSalary) || Math.max(0, gross - insEmp - pit - advance);

      cur.totalGross += gross;
      cur.totalInsCompany += insComp;
      cur.totalInsEmp += insEmp;
      cur.totalPIT += pit;
      cur.totalAdvance += advance;
      cur.totalNet += net;
      cur.count += 1;
      deptMap.set(dept, cur);
    });

    const result: AccountingJournalEntry[] = [];
    let idx = 1;

    deptMap.forEach((data, dept) => {
      let debitAcc = '642'; // Quản lý doanh nghiệp
      const dLower = dept.toLowerCase();
      if (dLower.includes('sản xuất') || dLower.includes('phân xưởng') || dLower.includes('chế biến') || dLower.includes('đóng gói') || dLower.includes('nhà máy')) {
        debitAcc = '622'; // Chi phí nhân công trực tiếp
      } else if (dLower.includes('bảo trì') || dLower.includes('kỹ thuật') || dLower.includes('cơ điện') || dLower.includes('qa') || dLower.includes('qc') || dLower.includes('quản đốc')) {
        debitAcc = '627'; // Chi phí sản xuất chung
      } else if (dLower.includes('kinh doanh') || dLower.includes('bán hàng') || dLower.includes('phân phối') || dLower.includes('marketing') || dLower.includes('tiếp thị')) {
        debitAcc = '641'; // Chi phí bán hàng
      }

      // 1. Trích tính chi phí tiền lương phải trả người lao động
      result.push({
        id: `ACC-PAY-${String(idx++).padStart(2, '0')}`,
        date: `${selectedMonth}-25`,
        description: `Trích tính lương tháng ${selectedMonth} cho ${data.count} nhân sự ${dept}`,
        debitAccount: debitAcc,
        creditAccount: '334',
        amount: Math.round(data.totalGross),
        departmentName: dept,
      });

      // 2. Trích bảo hiểm bắt buộc & KPCĐ tính vào chi phí doanh nghiệp (23.5%)
      result.push({
        id: `ACC-INS-${String(idx++).padStart(2, '0')}`,
        date: `${selectedMonth}-25`,
        description: `Trích bảo hiểm bắt buộc (21.5%) & KPCĐ (2%) tính vào chi phí ${dept}`,
        debitAccount: debitAcc,
        creditAccount: '338',
        amount: Math.round(data.totalInsCompany),
        departmentName: dept,
      });

      // 3. Trích bảo hiểm bắt buộc khấu trừ vào lương NLĐ (10.5%)
      if (data.totalInsEmp > 0) {
        result.push({
          id: `ACC-EMP-INS-${String(idx++).padStart(2, '0')}`,
          date: `${selectedMonth}-25`,
          description: `Trích bảo hiểm bắt buộc (10.5%) khấu trừ vào lương nhân sự ${dept}`,
          debitAccount: '334',
          creditAccount: '338',
          amount: Math.round(data.totalInsEmp),
          departmentName: dept,
        });
      }

      // 4. Khấu trừ thuế TNCN (nếu có)
      if (data.totalPIT > 0) {
        result.push({
          id: `ACC-PIT-${String(idx++).padStart(2, '0')}`,
          date: `${selectedMonth}-25`,
          description: `Khấu trừ thuế TNCN tạm tính nộp ngân sách nhà nước của ${dept}`,
          debitAccount: '334',
          creditAccount: '3335',
          amount: Math.round(data.totalPIT),
          departmentName: dept,
        });
      }

      // 5. Khấu trừ tạm ứng lương (nếu có)
      if (data.totalAdvance > 0) {
        result.push({
          id: `ACC-ADV-${String(idx++).padStart(2, '0')}`,
          date: `${selectedMonth}-25`,
          description: `Khấu trừ tiền tạm ứng lương giữa tháng của nhân sự ${dept}`,
          debitAccount: '334',
          creditAccount: '141',
          amount: Math.round(data.totalAdvance),
          departmentName: dept,
        });
      }
    });

    // 6. Lệnh chuyển khoản thanh toán lương thực lĩnh (Net) qua ngân hàng
    const totalCompanyNet = recordsToUse.reduce((sum, r) => sum + (safeNumber(r.netSalary) || (safeNumber(r.totalGrossIncome) * 0.85)), 0);
    result.push({
      id: `ACC-NET-${String(idx++).padStart(2, '0')}`,
      date: `${selectedMonth}-28`,
      description: `Lệnh chuyển khoản ngân hàng thanh toán lương thực lĩnh (Net) tháng ${selectedMonth}`,
      debitAccount: '334',
      creditAccount: '112',
      amount: Math.round(totalCompanyNet),
      departmentName: 'Toàn Doanh Nghiệp',
    });

    // 7. Lệnh nộp tiền BHXH & KPCĐ cho cơ quan nhà nước
    const totalAllIns = recordsToUse.reduce((sum, r) => {
      const comp = (safeNumber(r.bhxhComp) + safeNumber(r.bhytComp) + safeNumber(r.bhtnComp) + safeNumber(r.unionComp)) || Math.round((safeNumber(r.baseSalary) || 12000000) * 0.235);
      const emp = safeNumber(r.totalInsuranceEmp) || Math.round((safeNumber(r.baseSalary) || 12000000) * 0.105);
      return sum + comp + emp;
    }, 0);
    result.push({
      id: `ACC-SI-PAY-${String(idx++).padStart(2, '0')}`,
      date: `${selectedMonth}-30`,
      description: `Nộp tiền BHXH, BHYT, BHTN & Kinh phí Công đoàn tháng ${selectedMonth} vào Kho bạc/Cơ quan BHXH`,
      debitAccount: '338',
      creditAccount: '112',
      amount: Math.round(totalAllIns),
      departmentName: 'Toàn Doanh Nghiệp',
    });

    return result;
  }, [payrollRecords, selectedMonth]);

  const [entries, setEntries] = useState<AccountingJournalEntry[]>(dynamicEntries);

  useEffect(() => {
    setEntries(dynamicEntries);
  }, [dynamicEntries]);

  // Bảng phân bổ chi phí nhân sự luân chuyển bộ phận giữa kỳ theo tỷ lệ ngày công thực tế
  const transferAllocations: TransferAllocationRecord[] = useMemo(() => {
    return [
      {
        id: 'TRA-01',
        employeeCode: 'AF-025',
        employeeName: 'Nguyễn Văn Long',
        fromDept: 'Phân Xưởng Đóng Gói (622)',
        toDept: 'Phân Xưởng Chế Biến & Nhiệt Hóa (622)',
        transferDate: '2026-08-11',
        totalWorkDays: 26,
        daysInFromDept: 10,
        daysInToDept: 16,
        totalMonthlyWage: 11500000,
        fromDeptAccount: '622 (Đóng Gói)',
        fromDeptAllocatedCost: Math.round(11500000 * (10 / 26)),
        toDeptAccount: '622 (Chế Biến)',
        toDeptAllocatedCost: Math.round(11500000 * (16 / 26)),
      },
      {
        id: 'TRA-02',
        employeeCode: 'AF-042',
        employeeName: 'Trần Minh Hoàng',
        fromDept: 'Phân Xưởng Chế Biến (622)',
        toDept: 'Phòng Quản Lý Chất Lượng QA/QC (627)',
        transferDate: '2026-08-15',
        totalWorkDays: 26,
        daysInFromDept: 14,
        daysInToDept: 12,
        totalMonthlyWage: 14200000,
        fromDeptAccount: '622 (Trực Tiếp SX)',
        fromDeptAllocatedCost: Math.round(14200000 * (14 / 26)),
        toDeptAccount: '627 (Chi Phí SX Chung)',
        toDeptAllocatedCost: Math.round(14200000 * (12 / 26)),
      },
      {
        id: 'TRA-03',
        employeeCode: 'AF-089',
        employeeName: 'Lê Thị Thu Thảo',
        fromDept: 'Khối Kinh Doanh Toàn Quốc (641)',
        toDept: 'Phòng Tài Chính Kế Toán (642)',
        transferDate: '2026-08-18',
        totalWorkDays: 26,
        daysInFromDept: 17,
        daysInToDept: 9,
        totalMonthlyWage: 18000000,
        fromDeptAccount: '641 (Chi Phí Bán Hàng)',
        fromDeptAllocatedCost: Math.round(18000000 * (17 / 26)),
        toDeptAccount: '642 (Chi Phí QLDN)',
        toDeptAllocatedCost: Math.round(18000000 * (9 / 26)),
      },
      {
        id: 'TRA-04',
        employeeCode: 'AF-115',
        employeeName: 'Phạm Đức Dũng',
        fromDept: 'Phân Xưởng Đóng Gói (622)',
        toDept: 'Kho Thành Phẩm & Logistics (641)',
        transferDate: '2026-08-08',
        totalWorkDays: 26,
        daysInFromDept: 7,
        daysInToDept: 19,
        totalMonthlyWage: 9800000,
        fromDeptAccount: '622 (Nhân Công Trực Tiếp)',
        fromDeptAllocatedCost: Math.round(9800000 * (7 / 26)),
        toDeptAccount: '641 (Chi Phí Bán Hàng / Kho)',
        toDeptAllocatedCost: Math.round(9800000 * (19 / 26)),
      },
    ];
  }, []);


  // ========================================================
  // QUẢN LÝ HỢP ĐỒNG DỊCH VỤ DÂN SỰ & THÙ LAO CTV (TAB 3)
  // ========================================================
  const [serviceContracts, setServiceContracts] = useState<ServiceContractEntry[]>(initialServiceContracts);
  const [selectedContractForDetail, setSelectedContractForDetail] = useState<ServiceContractEntry | null>(null);
  const [showNewContractModal, setShowNewContractModal] = useState<boolean>(false);
  const [newContractForm, setNewContractForm] = useState({
    contractorName: '',
    contractorIdNumber: '',
    taxCode: '',
    phone: '',
    serviceCategory: 'PACKAGING_DESIGN' as ServiceContractEntry['serviceCategory'],
    serviceCategoryLabel: 'Thiết Kế Bao Bì & Bộ Nhận Diện',
    contractDescription: '',
    grossAmount: 15000000,
    hasCommitment08: false,
    accountingDebitAccount: '642',
    accountingCreditAccount: '331',
    bankAccountInfo: ''
  });

  // ========================================================
  // QUẢN LÝ TIẾP KHÁCH & XỬ LÝ KHÔNG HÓA ĐƠN (TAB 4)
  // ========================================================
  const [hospitalityExpenses, setHospitalityExpenses] = useState<HospitalityExpenseEntry[]>(initialHospitalityExpenses);
  const [selectedHospitalityForDetail, setSelectedHospitalityForDetail] = useState<HospitalityExpenseEntry | null>(null);
  const [showNewHospitalityModal, setShowNewHospitalityModal] = useState<boolean>(false);
  const [newHospitalityForm, setNewHospitalityForm] = useState({
    requesterName: 'Phạm Minh Hùng',
    requesterDepartment: 'Khối Kinh Doanh & Tiếp Thị',
    requesterPosition: 'Giám Đốc Kinh Doanh',
    partnerName: '',
    partnerCompany: '',
    guestCount: 4,
    businessPurpose: '',
    venueName: '',
    actualSpentAmount: 5000000,
    invoiceStatus: 'NON_INVOICE_INTERNAL_ALLOWANCE' as HospitalityExpenseEntry['invoiceStatus'],
    invoiceNumber: '',
    debitAccount: '641',
    creditAccount: '112',
    approverNote: ''
  });

  // Thống kê tổng hợp các tài khoản chi phí
  const accountMetrics = useMemo(() => {
    const safeVal = (v: any): number => {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };

    const tk622 = entries.filter(e => e.debitAccount.startsWith('622')).reduce((sum, e) => sum + safeVal(e.amount), 0);
    const tk627 = entries.filter(e => e.debitAccount.startsWith('627')).reduce((sum, e) => sum + safeVal(e.amount), 0);
    const tk641 = entries.filter(e => e.debitAccount.startsWith('641')).reduce((sum, e) => sum + safeVal(e.amount), 0);
    const tk642 = entries.filter(e => e.debitAccount.startsWith('642')).reduce((sum, e) => sum + safeVal(e.amount), 0);
    const tk338 = entries.filter(e => e.creditAccount.startsWith('338')).reduce((sum, e) => sum + safeVal(e.amount), 0);
    const totalCost = tk622 + tk627 + tk641 + tk642;
    return { 
      tk622: isNaN(tk622) ? 0 : tk622, 
      tk627: isNaN(tk627) ? 0 : tk627, 
      tk641: isNaN(tk641) ? 0 : tk641, 
      tk642: isNaN(tk642) ? 0 : tk642, 
      tk338: isNaN(tk338) ? 0 : tk338, 
      totalCost: isNaN(totalCost) ? 0 : totalCost 
    };
  }, [entries]);

  // Lọc sổ nhật ký
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (selectedAccount !== 'ALL' && !e.debitAccount.startsWith(selectedAccount) && !e.creditAccount.startsWith(selectedAccount)) return false;
      if (selectedDept !== 'ALL' && e.departmentName !== selectedDept) return false;

      if (journalFilters.date && !evaluateColumnCondition(e.date, journalFilters.date)) return false;
      if (journalFilters.desc && !evaluateColumnCondition(e.description, journalFilters.desc)) return false;
      if (journalFilters.dept && !evaluateColumnCondition(e.departmentName, journalFilters.dept)) return false;
      if (journalFilters.debit && !evaluateColumnCondition(e.debitAccount, journalFilters.debit)) return false;
      if (journalFilters.credit && !evaluateColumnCondition(e.creditAccount, journalFilters.credit)) return false;
      if (journalFilters.amount && !evaluateColumnCondition(e.amount, journalFilters.amount)) return false;

      return true;
    });
  }, [entries, selectedAccount, selectedDept, journalFilters]);

  const totalJournalPages = Math.max(1, Math.ceil(filteredEntries.length / journalPageSize));
  const paginatedEntries = useMemo(() => {
    const start = (journalPage - 1) * journalPageSize;
    return filteredEntries.slice(start, start + journalPageSize);
  }, [filteredEntries, journalPage, journalPageSize]);

  // Lọc bảng luân chuyển
  const filteredTransferAllocations = useMemo(() => {
    return transferAllocations.filter(t => {
      if (transferFilters.code && !evaluateColumnCondition(t.employeeCode, transferFilters.code)) return false;
      if (transferFilters.name && !evaluateColumnCondition(t.employeeName, transferFilters.name)) return false;
      if (transferFilters.transfer && !evaluateColumnCondition(`${t.fromDept} ${t.toDept}`, transferFilters.transfer)) return false;
      if (transferFilters.split && !evaluateColumnCondition(`${t.daysInFromDept}/${t.daysInToDept}`, transferFilters.split)) return false;
      if (transferFilters.costFrom && !evaluateColumnCondition(t.fromDeptAllocatedCost, transferFilters.costFrom)) return false;
      if (transferFilters.costTo && !evaluateColumnCondition(t.toDeptAllocatedCost, transferFilters.costTo)) return false;
      if (transferFilters.total && !evaluateColumnCondition(t.totalMonthlyWage, transferFilters.total)) return false;
      return true;
    });
  }, [transferAllocations, transferFilters]);

  const totalTransferPages = Math.max(1, Math.ceil(filteredTransferAllocations.length / transferPageSize));
  const paginatedTransfers = useMemo(() => {
    const start = (transferPage - 1) * transferPageSize;
    return filteredTransferAllocations.slice(start, start + transferPageSize);
  }, [filteredTransferAllocations, transferPage, transferPageSize]);


  const handleCreateServiceContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractForm.contractorName || !newContractForm.contractorIdNumber) {
      alert('Vui lòng điền đầy đủ họ tên và số CCCD của chuyên gia / CTV.');
      return;
    }

    const gross = Number(newContractForm.grossAmount) || 0;
    const taxRate = newContractForm.hasCommitment08 ? 0 : 10;
    const taxAmount = Math.round(gross * (taxRate / 100));
    const netAmount = gross - taxAmount;

    const newContract: ServiceContractEntry = {
      id: `HDDV-${Date.now()}`,
      contractCode: `HĐDV-2026/08-${String(serviceContracts.length + 1).padStart(2, '0')}`,
      contractorName: newContractForm.contractorName,
      contractorIdNumber: newContractForm.contractorIdNumber,
      taxCode: newContractForm.taxCode || 'Chưa cập nhật',
      phone: newContractForm.phone || '0988000000',
      serviceCategory: newContractForm.serviceCategory,
      serviceCategoryLabel: newContractForm.serviceCategoryLabel,
      contractDescription: newContractForm.contractDescription,
      signDate: '2026-08-25',
      completionDate: '2026-08-30',
      grossAmount: gross,
      hasCommitment08: newContractForm.hasCommitment08,
      taxRatePercent: taxRate,
      withheldTaxAmount: taxAmount,
      netPaidAmount: netAmount,
      accountingDebitAccount: newContractForm.accountingDebitAccount,
      accountingCreditAccount: newContractForm.accountingCreditAccount,
      paymentStatus: 'PAID',
      bankAccountInfo: newContractForm.bankAccountInfo || 'Chuyển khoản VCB',
      documents: {
        hasContract: true,
        hasAcceptanceReport: true,
        hasLiquidationReport: true,
        hasBankTransferDoc: true,
        hasTaxWithholdingDoc: !newContractForm.hasCommitment08
      }
    };

    setServiceContracts(prev => [newContract, ...prev]);
    setShowNewContractModal(false);
    alert(`✓ Đã tạo thành công Hợp đồng dịch vụ ${newContract.contractCode}! Khấu trừ thuế TNCN: ${taxAmount.toLocaleString('vi-VN')} đ, Thực chi Net: ${netAmount.toLocaleString('vi-VN')} đ.`);
  };

  const handleCreateHospitalityExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospitalityForm.partnerName || !newHospitalityForm.businessPurpose) {
      alert('Vui lòng điền thông tin đối tác và mục đích tiếp khách đàm phán kinh doanh.');
      return;
    }

    const spent = Number(newHospitalityForm.actualSpentAmount) || 0;
    let citDeductible = 0;
    let citNonDeductible = 0;

    if (newHospitalityForm.invoiceStatus === 'HAS_E_INVOICE' || newHospitalityForm.invoiceStatus === 'HOUSEHOLD_BUSINESS_B01') {
      citDeductible = spent;
      citNonDeductible = 0;
    } else {
      // Khoán nội bộ không hóa đơn GTGT -> Tự động đưa vào Chỉ tiêu B4 thuế TNDN
      citDeductible = 0;
      citNonDeductible = spent;
    }

    const newExpense: HospitalityExpenseEntry = {
      id: `PTK-${Date.now()}`,
      voucherCode: `PTK-2026-08/${String(hospitalityExpenses.length + 1).padStart(2, '0')}`,
      requestDate: '2026-08-25',
      eventDate: '2026-08-24',
      requesterName: newHospitalityForm.requesterName,
      requesterDepartment: newHospitalityForm.requesterDepartment,
      requesterPosition: newHospitalityForm.requesterPosition,
      partnerName: newHospitalityForm.partnerName,
      partnerCompany: newHospitalityForm.partnerCompany || 'Đối tác kinh doanh',
      guestCount: newHospitalityForm.guestCount,
      businessPurpose: newHospitalityForm.businessPurpose,
      venueName: newHospitalityForm.venueName || 'Nhà hàng ẩm thực',
      actualSpentAmount: spent,
      invoiceStatus: newHospitalityForm.invoiceStatus,
      invoiceNumber: newHospitalityForm.invoiceNumber,
      internalAllowanceApproved: true,
      citDeductibleAmount: citDeductible,
      citNonDeductibleAmount: citNonDeductible,
      pitExemptForEmployee: true,
      status: 'APPROVED_REIMBURSED',
      debitAccount: newHospitalityForm.debitAccount,
      creditAccount: newHospitalityForm.creditAccount,
      approverNote: newHospitalityForm.invoiceStatus === 'NON_INVOICE_INTERNAL_ALLOWANCE'
        ? 'Duyệt thanh toán theo Quy chế Khoán tiếp khách nội bộ (Nợ ' + newHospitalityForm.debitAccount + ' / Có ' + newHospitalityForm.creditAccount + '). Không có hóa đơn đỏ: Tự động đưa vào Chỉ tiêu B4 thuế TNDN, miễn thuế TNCN 100% cho nhân sự.'
        : 'Hóa đơn chứng từ đầy đủ hợp lệ theo Thông tư 96/2015. Tính 100% chi phí được trừ khi xác định thu nhập chịu thuế TNDN.'
    };

    setHospitalityExpenses(prev => [newExpense, ...prev]);
    setShowNewHospitalityModal(false);
    alert(`✓ Đã lập và phê duyệt Phiếu quyết toán tiếp khách ${newExpense.voucherCode}! ${citNonDeductible > 0 ? 'Số tiền ' + citNonDeductible.toLocaleString('vi-VN') + ' đ được tự động bóc tách vào Chỉ tiêu B4 thuế TNDN.' : 'Đạt chuẩn 100% chi phí được trừ thuế TNDN.'}`);
  };

  const handleExportContractsExcel = () => {
    const data = serviceContracts.map((c, i) => ({
      'STT': i + 1,
      'Mã HĐ': c.contractCode,
      'Bên Cung Ứng / CTV': c.contractorName,
      'CCCD': c.contractorIdNumber,
      'Mã Số Thuế': c.taxCode,
      'Lĩnh Vực Dịch Vụ': c.serviceCategoryLabel,
      'Thù Lao Gross (VNĐ)': c.grossAmount,
      'Thuế TNCN 10% (VNĐ)': c.withheldTaxAmount,
      'Thực Chi Net (VNĐ)': c.netPaidAmount,
      'Tài Khoản Chi Phí': c.accountingDebitAccount,
      'Tài Khoản Phải Trả': c.accountingCreditAccount,
      'Cam Kết 08/CK-TNCN': c.hasCommitment08 ? 'Có' : 'Không',
      'Đủ Hồ Sơ Thuế': Object.values(c.documents).filter(Boolean).length === 5 ? 'Đủ 5/5' : 'Thiếu',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HopDongDichVu');
    XLSX.writeFile(wb, `Bang_Ke_Hop_Dong_Dich_Vu_CTV_${policy.companyName}.xlsx`);
  };

  const handleExportHospitalityExcel = () => {
    const data = hospitalityExpenses.map((h, i) => ({
      'STT': i + 1,
      'Số Phiếu': h.voucherCode,
      'Ngày Tiếp Khách': h.eventDate,
      'Người Đề Xuất': h.requesterName,
      'Bộ Phận': h.requesterDepartment,
      'Đối Tác': h.partnerName,
      'Công Ty Đối Tác': h.partnerCompany,
      'Số Tiền Thực Chi': h.actualSpentAmount,
      'Tình Trạng Hóa Đơn': h.invoiceStatus === 'HAS_E_INVOICE' ? 'Có HĐĐT Đầy Đủ' : h.invoiceStatus === 'NON_INVOICE_INTERNAL_ALLOWANCE' ? 'Khoán Chi Nội Bộ (Không HĐ)' : 'Hộ KD Bảng Kê 01',
      'Chi Phí Được Trừ TNDN': h.citDeductibleAmount,
      'Chi Phí Loại Trừ (Chỉ Tiêu B4)': h.citNonDeductibleAmount,
      'Miễn Thuế TNCN Nhân Viên': h.pitExemptForEmployee ? 'Miễn 100%' : 'Chịu thuế',
      'Định Khoản Kế Toán': `Nợ ${h.debitAccount} / Có ${h.creditAccount}`,
      'Ghi Chú Kế Toán': h.approverNote
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ChiPhiTiepKhach');
    XLSX.writeFile(wb, `Quyet_Toan_Tiep_Khach_Va_Chi_Tieu_B4_${policy.companyName}.xlsx`);
  };

  const handleExportAccountingExcel = () => {
    const data = filteredEntries.map((e, index) => ({
      'STT': index + 1,
      'Ngày Hạch Toán': e.date,
      'Diễn Giải Nghiệp Vụ': e.description,
      'Bộ Phận': e.departmentName,
      'Nợ Tài Khoản': e.debitAccount,
      'Có Tài Khoản': e.creditAccount,
      'Số Tiền (VNĐ)': e.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hach Toan Luong');
    XLSX.writeFile(workbook, `Bang_Hach_Toan_Luong_TT200_${policy.companyName}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Tiêu đề & Chọn kỳ kế toán */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Hạch Toán Kế Toán Tiền Lương (Thông Tư 200 & 133)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo đa chiều theo Tài khoản (TK 622, 627, 641, 642, 334, 338, 3335), Bộ phận & Tự động phân bổ ngày công khi luân chuyển phòng ban
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-700">Kỳ hạch toán:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-indigo-700 outline-none bg-transparent cursor-pointer"
            />
          </div>

          <button
            onClick={handleExportAccountingExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel MISA / FAST / SAP</span>
          </button>
        </div>
      </div>

      {/* 4 THẺ TỔNG HỢP CHI PHÍ THEO TÀI KHOẢN KẾ TOÁN */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">TK 622 - Nhân Công Trực Tiếp</span>
            <span className="font-mono font-bold text-indigo-600 text-xs">622</span>
          </div>
          <span className="text-lg font-bold text-slate-900 mt-1 block">{accountMetrics.tk622.toLocaleString('vi-VN')} đ</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Công nhân trực tiếp tại các phân xưởng</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">TK 627 - Chi Phí Sản Xuất Chung</span>
            <span className="font-mono font-bold text-amber-600 text-xs">627</span>
          </div>
          <span className="text-lg font-bold text-amber-700 mt-1 block">{accountMetrics.tk627.toLocaleString('vi-VN')} đ</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Quản đốc, bảo trì, QA/QC, phụ cấp sữa</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">TK 641 - Chi Phí Bán Hàng</span>
            <span className="font-mono font-bold text-blue-600 text-xs">641</span>
          </div>
          <span className="text-lg font-bold text-blue-700 mt-1 block">{accountMetrics.tk641.toLocaleString('vi-VN')} đ</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Lương & hoa hồng khối kinh doanh</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">TK 642 - Chi Phí Quản Lý DN</span>
            <span className="font-mono font-bold text-emerald-600 text-xs">642</span>
          </div>
          <span className="text-lg font-bold text-emerald-700 mt-1 block">{accountMetrics.tk642.toLocaleString('vi-VN')} đ</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Ban TGĐ, Nhân sự, Tài chính kế toán, IT</span>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG TABS CON */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('JOURNAL_ENTRIES')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'JOURNAL_ENTRIES' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sổ Nhật Ký Định Khoản Chung (TT200)</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSFER_ALLOCATION')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'TRANSFER_ALLOCATION' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Phân Bổ Luân Chuyển ({transferAllocations.length.toLocaleString('vi-VN')})</span>
          </button>

          <button
            onClick={() => setActiveTab('SERVICE_CONTRACTS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'SERVICE_CONTRACTS' 
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300' 
                : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
            }`}
            title="Quản lý tập trung hợp đồng dịch vụ dân sự, chuyên gia thuê ngoài & khấu trừ 10% thuế TNCN"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Hợp Đồng Dịch Vụ &amp; CTV ({serviceContracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('HOSPITALITY_EXPENSES')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'HOSPITALITY_EXPENSES' 
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300' 
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
            title="Quản lý chi phí tiếp khách, xử lý tiếp khách không hóa đơn theo cơ chế khoán & tự động bóc tách Chỉ tiêu B4 thuế TNDN"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            <span>Tiếp Khách &amp; Hóa Đơn ({hospitalityExpenses.length})</span>
          </button>
        </div>

        {activeTab === 'JOURNAL_ENTRIES' && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Tài khoản:</span>
            <select
              value={selectedAccount}
              onChange={e => { setSelectedAccount(e.target.value); setJournalPage(1); }}
              className="p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 outline-none text-xs"
            >
              <option value="ALL">Tất cả tài khoản</option>
              <option value="622">TK 622 - Nhân công trực tiếp</option>
              <option value="627">TK 627 - Chi phí sản xuất chung</option>
              <option value="641">TK 641 - Chi phí bán hàng</option>
              <option value="642">TK 642 - Chi phí quản lý doanh nghiệp</option>
              <option value="334">TK 334 - Phải trả người lao động</option>
              <option value="338">TK 338 - Bảo hiểm & công đoàn</option>
              <option value="3335">TK 3335 - Thuế TNCN khấu trừ</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: SỔ NHẬT KÝ ĐỊNH KHOẢN CHUNG */}
      {activeTab === 'JOURNAL_ENTRIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[11px] tracking-wider select-none">
                <tr>
                  <th className="px-3 py-2.5">Ngày</th>
                  <th className="px-3 py-2.5">Diễn Giải Nghiệp Vụ Kế Toán</th>
                  <th className="px-3 py-2.5">Bộ Phận / Đối Tượng Hạch Toán</th>
                  <th className="px-3 py-2.5 font-mono">Nợ Tài Khoản</th>
                  <th className="px-3 py-2.5 font-mono">Có Tài Khoản</th>
                  <th className="px-3 py-2.5 text-right">Số Tiền (VNĐ)</th>
                </tr>

                {/* HÀNG LỌC TOÁN TỬ VÀ CHUỖI TỪNG CỘT */}
                <tr className="bg-slate-100/70 border-b border-slate-200 normal-case font-normal text-[11px]">
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder="Ngày..."
                      value={journalFilters.date}
                      onChange={e => { setJournalFilters(prev => ({ ...prev, date: e.target.value })); setJournalPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder="Nội dung nghiệp vụ..."
                      value={journalFilters.desc}
                      onChange={e => { setJournalFilters(prev => ({ ...prev, desc: e.target.value })); setJournalPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder="Bộ phận..."
                      value={journalFilters.dept}
                      onChange={e => { setJournalFilters(prev => ({ ...prev, dept: e.target.value })); setJournalPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder="TK Nợ..."
                      value={journalFilters.debit}
                      onChange={e => { setJournalFilters(prev => ({ ...prev, debit: e.target.value })); setJournalPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder="TK Có..."
                      value={journalFilters.credit}
                      onChange={e => { setJournalFilters(prev => ({ ...prev, credit: e.target.value })); setJournalPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1 text-right">
                    <input
                      type="text"
                      placeholder=">=10tr..."
                      value={journalFilters.amount}
                      onChange={e => { setJournalFilters(prev => ({ ...prev, amount: e.target.value })); setJournalPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500 text-right"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-slate-500">{entry.date}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900 max-w-sm">{entry.description}</td>
                    <td className="px-3 py-2.5 text-slate-600">{entry.departmentName}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-indigo-700">{entry.debitAccount}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-700">{entry.creditAccount}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-900 font-mono">
                      {(entry.amount || 0).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}

                {paginatedEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-slate-400 italic">
                      Không tìm thấy bút toán nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <CompactPagination
            currentPage={journalPage}
            totalPages={totalJournalPages}
            totalRecords={filteredEntries.length}
            pageSize={journalPageSize}
            onPageChange={setJournalPage}
            onPageSizeChange={size => { setJournalPageSize(size); setJournalPage(1); }}
          />
        </div>
      )}

      {/* TAB 2: BẢNG PHÂN BỔ CHI PHÍ LUÂN CHUYỂN BỘ PHẬN THEO NGÀY CÔNG */}
      {activeTab === 'TRANSFER_ALLOCATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-bold text-sm text-slate-900">Quy Tắc Phân Bổ Chi Phí Luân Chuyển Giữa Kỳ (Theo Ngày Công Thực Tế)</h4>
            <p className="text-xs text-slate-500">
              Chi phí lương và các khoản trích theo lương được bóc tách tự động tương ứng theo số ngày công làm việc tại Bộ phận cũ và Bộ phận mới
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="px-3 py-2.5">Mã NV</th>
                  <th className="px-3 py-2.5">Họ Và Tên</th>
                  <th className="px-3 py-2.5">Luân Chuyển Phòng Ban</th>
                  <th className="px-3 py-2.5 text-center">Tỷ Lệ Ngày Công</th>
                  <th className="px-3 py-2.5">Phân Bổ Bộ Phận Cũ (Nợ TK)</th>
                  <th className="px-3 py-2.5">Phân Bổ Bộ Phận Mới (Nợ TK)</th>
                  <th className="px-3 py-2.5 text-right">TỔNG LƯƠNG THÁNG</th>
                </tr>

                {/* HÀNG LỌC CỘT */}
                <tr className="bg-slate-100/70 border-b border-slate-200 normal-case font-normal text-[11px]">
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder="Mã..."
                      value={transferFilters.code}
                      onChange={e => { setTransferFilters(prev => ({ ...prev, code: e.target.value })); setTransferPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder="Họ tên..."
                      value={transferFilters.name}
                      onChange={e => { setTransferFilters(prev => ({ ...prev, name: e.target.value })); setTransferPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder="Phòng ban..."
                      value={transferFilters.transfer}
                      onChange={e => { setTransferFilters(prev => ({ ...prev, transfer: e.target.value })); setTransferPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1 text-center">
                    <input
                      type="text"
                      placeholder="10/16..."
                      value={transferFilters.split}
                      onChange={e => { setTransferFilters(prev => ({ ...prev, split: e.target.value })); setTransferPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500 text-center"
                    />
                  </th>
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder=">=4tr..."
                      value={transferFilters.costFrom}
                      onChange={e => { setTransferFilters(prev => ({ ...prev, costFrom: e.target.value })); setTransferPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1">
                    <input
                      type="text"
                      placeholder=">=6tr..."
                      value={transferFilters.costTo}
                      onChange={e => { setTransferFilters(prev => ({ ...prev, costTo: e.target.value })); setTransferPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="px-2 py-1 text-right">
                    <input
                      type="text"
                      placeholder=">=10tr..."
                      value={transferFilters.total}
                      onChange={e => { setTransferFilters(prev => ({ ...prev, total: e.target.value })); setTransferPage(1); }}
                      className="w-full px-1.5 py-0.5 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500 text-right"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransfers.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-bold text-indigo-700">{rec.employeeCode}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{rec.employeeName}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center space-x-1 font-medium text-slate-800">
                        <span className="text-slate-600">{rec.fromDept}</span>
                        <ArrowRightLeft className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                        <span className="text-indigo-700">{rec.toDept}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Chuyển từ ngày {rec.transferDate}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono">
                      <b className="text-slate-700">{rec.daysInFromDept} công</b> / <b className="text-indigo-700">{rec.daysInToDept} công</b>
                      <span className="text-slate-400 text-[10px] block">(Tổng {rec.totalWorkDays} công chuẩn)</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-bold text-slate-800">{rec.fromDeptAllocatedCost.toLocaleString('vi-VN')} đ</span>
                      <span className="text-[10px] text-slate-400 block font-mono">TK {rec.fromDeptAccount}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-bold text-indigo-700">{rec.toDeptAllocatedCost.toLocaleString('vi-VN')} đ</span>
                      <span className="text-[10px] text-slate-400 block font-mono">TK {rec.toDeptAccount}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-emerald-700 text-sm font-mono">
                      {rec.totalMonthlyWage.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <CompactPagination
            currentPage={transferPage}
            totalPages={totalTransferPages}
            totalRecords={filteredTransferAllocations.length}
            pageSize={transferPageSize}
            onPageChange={setTransferPage}
            onPageSizeChange={size => { setTransferPageSize(size); setTransferPage(1); }}
          />
        </div>
      )}
      {/* ======================================================== */}
      {/* TAB 3: HỢP ĐỒNG DỊCH VỤ DÂN SỰ & THÙ LAO CỘNG TÁC VIÊN */}
      {/* ======================================================== */}
      {activeTab === 'SERVICE_CONTRACTS' && (
        <div className="space-y-4 animate-in fade-in">
          {/* 4 Thẻ Tổng Hợp Chỉ Số Thuế & Chi Phí */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Hợp Đồng Dịch Vụ</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">{serviceContracts.length} hợp đồng</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Chuyên gia &amp; Thuê ngoài</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-indigo-600 font-semibold block uppercase text-[10px]">Tổng Thù Lao Gross (Chi Phí)</span>
              <span className="text-lg font-bold text-indigo-700 mt-1 block">
                {serviceContracts.reduce((sum, c) => sum + c.grossAmount, 0).toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Nợ TK 642, 641, 627 / Có TK 331</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-rose-600 font-semibold block uppercase text-[10px]">Thuế TNCN 10% Khấu Trừ</span>
              <span className="text-lg font-bold text-rose-700 mt-1 block">
                {serviceContracts.reduce((sum, c) => sum + c.withheldTaxAmount, 0).toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Khấu trừ tại nguồn (Có TK 3335)</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-emerald-600 font-semibold block uppercase text-[10px]">Thực Chi Chuyển Khoản (Net)</span>
              <span className="text-lg font-bold text-emerald-700 mt-1 block">
                {serviceContracts.reduce((sum, c) => sum + c.netPaidAmount, 0).toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Thực thanh toán (Có TK 112)</span>
            </div>
          </div>

          {/* Thanh công cụ & Cảnh báo kế toán */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Quản Lý Tập Trung Hợp Đồng Dịch Vụ Dân Sự &amp; Thuế TNCN 10%</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Thông tư 200 &amp; Thông tư 111/2013
                </span>
              </div>
              <p className="text-xs text-slate-500">
                <b>Nguyên tắc kế toán:</b> Tuyệt đối hạch toán qua <b>TK 331 (hoặc 3388)</b>, không hạch toán qua TK 334. Kiểm tra đủ <b>5 bước hồ sơ chứng từ</b> để được tính vào chi phí hợp lý thuế TNDN.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleExportContractsExcel}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel Bảng Kê Thuế</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNewContractModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tạo Hợp Đồng Dịch Vụ Mới</span>
              </button>
            </div>
          </div>

          {/* Bảng danh sách hợp đồng dịch vụ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10.5px] tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5">Mã HĐ</th>
                    <th className="px-3 py-2.5">Bên Cung Ứng / CTV</th>
                    <th className="px-3 py-2.5">Nội Dung Dịch Vụ</th>
                    <th className="px-3 py-2.5 text-right">Thù Lao Gross</th>
                    <th className="px-3 py-2.5 text-right">Thuế TNCN (10%)</th>
                    <th className="px-3 py-2.5 text-right">Thực Chi Net</th>
                    <th className="px-3 py-2.5 text-center font-mono">Định Khoản (TT200)</th>
                    <th className="px-3 py-2.5 text-center">Hồ Sơ Chứng Từ</th>
                    <th className="px-3 py-2.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serviceContracts.map(contract => {
                    const docCount = Object.values(contract.documents).filter(Boolean).length;
                    const isFullyDocumented = docCount >= 4;

                    return (
                      <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 font-mono font-bold text-indigo-700">{contract.contractCode}</td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-slate-900">{contract.contractorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            CCCD: {contract.contractorIdNumber} • MST: {contract.taxCode}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 max-w-xs">
                          <div className="font-semibold text-slate-800 text-[11px]">{contract.serviceCategoryLabel}</div>
                          <div className="text-slate-500 text-[10px] truncate">{contract.contractDescription}</div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                          {contract.grossAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          {contract.hasCommitment08 ? (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              0 đ (Mẫu 08)
                            </span>
                          ) : (
                            <span className="font-bold text-rose-600">
                              -{contract.withheldTaxAmount.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700 text-sm">
                          {contract.netPaidAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-3 py-2.5 text-center text-[10.5px]">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                            Nợ {contract.accountingDebitAccount} / Có {contract.accountingCreditAccount}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center justify-center gap-1 w-max mx-auto ${
                            isFullyDocumented ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            <ShieldCheck className="w-3 h-3" />
                            <span>{docCount}/5 mục</span>
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedContractForDetail(contract)}
                            className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer border border-indigo-200"
                            title="Xem chi tiết hồ sơ, định khoản kế toán & In biên bản nghiệm thu"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: QUẢN LÝ TIẾP KHÁCH & XỬ LÝ KHÔNG CÓ HÓA ĐƠN */}
      {/* ======================================================== */}
      {activeTab === 'HOSPITALITY_EXPENSES' && (
        <div className="space-y-4 animate-in fade-in">
          {/* 4 Thẻ Tổng Hợp Tiếp Khách & Bóc Tách Thuế TNDN */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Tổng Chi Phí Tiếp Khách</span>
              <span className="text-lg font-bold text-slate-900 mt-1 block">
                {hospitalityExpenses.reduce((sum, h) => sum + h.actualSpentAmount, 0).toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{hospitalityExpenses.length} đợt tiếp đối tác</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-emerald-600 font-semibold block uppercase text-[10px]">ĐƯỢC TRỪ Thuế TNDN (Có HĐĐT)</span>
              <span className="text-lg font-bold text-emerald-700 mt-1 block">
                {hospitalityExpenses.reduce((sum, h) => sum + h.citDeductibleAmount, 0).toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Hóa đơn hợp pháp theo TT 96/2015</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-300 bg-amber-50/40 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-amber-800 font-bold block uppercase text-[10px]">KHÔNG HÓA ĐƠN (Chỉ Tiêu B4)</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900">Tự Động Bóc Tách</span>
              </div>
              <span className="text-lg font-bold text-amber-900 mt-1 block">
                {hospitalityExpenses.reduce((sum, h) => sum + h.citNonDeductibleAmount, 0).toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[10.5px] text-amber-800 font-medium mt-0.5 block">
                Khoán chi nội bộ hợp lệ • Không bị phạt thuế
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-blue-600 font-semibold block uppercase text-[10px]">Thuế TNCN Người Nhận Khoán</span>
              <span className="text-lg font-bold text-blue-700 mt-1 block">Miễn 100% Thuế TNCN</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Điểm đ.4 Khoản 2 Điều 2 TT 111/2013</span>
            </div>
          </div>

          {/* Căn cứ pháp lý & Nút hành động */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2">
                <Coffee className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cơ Chế Khoán Chi Tiếp Khách &amp; Xử Lý Hóa Đơn Chuẩn Pháp Lý
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Điều 4 TT 96/2015 &amp; TT 111/2013
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <b>Giải pháp kế toán tối ưu:</b> Trường hợp ăn uống tiếp khách không có hóa đơn điện tử, doanh nghiệp áp dụng <b>Quy chế Khoán chi tiếp khách nội bộ</b> để hạch toán chi tiền hợp lệ cho nhân sự (Nợ 642/Có 111,112), đồng thời hệ thống <b>tự động bóc tách sang Chỉ tiêu B4 trên Tờ khai Quyết toán thuế TNDN</b> để loại trừ, bảo đảm cơ quan thuế không phạt truy thu hay chậm nộp.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleExportHospitalityExcel}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Kết Xuất Chỉ Tiêu B4 (Excel)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNewHospitalityModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Lập Phiếu Tiếp Khách &amp; Quyết Toán</span>
              </button>
            </div>
          </div>

          {/* Bảng danh sách phiếu tiếp khách */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10.5px] tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5">Số Phiếu</th>
                    <th className="px-3 py-2.5">Ngày Tiếp</th>
                    <th className="px-3 py-2.5">Người Đề Xuất</th>
                    <th className="px-3 py-2.5">Đối Tác &amp; Mục Đích Tiếp Khách</th>
                    <th className="px-3 py-2.5">Địa Điểm / Nhà Hàng</th>
                    <th className="px-3 py-2.5 text-right">Số Tiền Chi</th>
                    <th className="px-3 py-2.5 text-center">Tình Trạng Hóa Đơn</th>
                    <th className="px-3 py-2.5 text-center font-mono">Định Khoản</th>
                    <th className="px-3 py-2.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hospitalityExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-bold text-amber-800">{exp.voucherCode}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">{exp.eventDate}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-slate-900">{exp.requesterName}</div>
                        <div className="text-[10px] text-slate-400">{exp.requesterDepartment}</div>
                      </td>
                      <td className="px-3 py-2.5 max-w-xs">
                        <div className="font-semibold text-slate-800 text-[11px]">{exp.partnerName} ({exp.partnerCompany})</div>
                        <div className="text-slate-500 text-[10px] truncate">{exp.businessPurpose}</div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 text-[11px]">{exp.venueName}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                        {exp.actualSpentAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {exp.invoiceStatus === 'HAS_E_INVOICE' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 block w-max mx-auto">
                            Có HĐĐT Đầy Đủ
                          </span>
                        )}
                        {exp.invoiceStatus === 'NON_INVOICE_INTERNAL_ALLOWANCE' && (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 block w-max mx-auto">
                              Khoán Nội Bộ (Không HĐ)
                            </span>
                            <span className="text-[9px] text-amber-700 font-bold block mt-0.5">
                              Đưa vào Chỉ tiêu B4
                            </span>
                          </div>
                        )}
                        {exp.invoiceStatus === 'HOUSEHOLD_BUSINESS_B01' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 block w-max mx-auto">
                            Hộ KD Bảng Kê 01
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center text-[10.5px]">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                          Nợ {exp.debitAccount} / Có {exp.creditAccount}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedHospitalityForDetail(exp)}
                          className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer border border-amber-300"
                          title="Xem chi tiết phiếu quyết toán, giải trình và in phiếu"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ======================================================== */}
      {/* MODAL 1: TẠO HỢP ĐỒNG DỊCH VỤ DÂN SỰ / THÙ LAO CTV MỚI */}
      {/* ======================================================== */}
      {showNewContractModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-indigo-700 to-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-300" />
                  <span>Lập Hợp Đồng Dịch Vụ Dân Sự / Thuê Ngoài Mới</span>
                </h3>
                <p className="text-[11px] text-indigo-200 mt-0.5">
                  Tập trung kiểm soát thuế TNCN 10% &amp; Hạch toán TK 331/3388 (Tuyệt đối không dùng TK 334)
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowNewContractModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateServiceContract} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Họ tên Đối tác / CTV chuyên gia *</label>
                  <input 
                    type="text"
                    required
                    placeholder="VD: KS. Bùi Quang Huy"
                    value={newContractForm.contractorName}
                    onChange={e => setNewContractForm({...newContractForm, contractorName: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số CCCD gắn chip (12 số) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="079191007788"
                    value={newContractForm.contractorIdNumber}
                    onChange={e => setNewContractForm({...newContractForm, contractorIdNumber: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã số thuế cá nhân *</label>
                  <input 
                    type="text"
                    placeholder="8099234567"
                    value={newContractForm.taxCode}
                    onChange={e => setNewContractForm({...newContractForm, taxCode: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số điện thoại</label>
                  <input 
                    type="text"
                    placeholder="0912349988"
                    value={newContractForm.phone}
                    onChange={e => setNewContractForm({...newContractForm, phone: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tài khoản ngân hàng</label>
                  <input 
                    type="text"
                    placeholder="Số TK - Ngân hàng"
                    value={newContractForm.bankAccountInfo}
                    onChange={e => setNewContractForm({...newContractForm, bankAccountInfo: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lĩnh vực dịch vụ thuê ngoài *</label>
                  <select 
                    value={newContractForm.serviceCategory}
                    onChange={e => {
                      const cat = e.target.value as any;
                      const labels: Record<string, string> = {
                        PACKAGING_DESIGN: 'Thiết Kế Bao Bì & Bộ Nhận Diện',
                        EQUIPMENT_MAINTENANCE: 'Bảo Trì Đại Tu Máy Móc & Robot',
                        IT_SOFTWARE: 'Phát Triển Phần Mềm ERP & Chuyển Đổi Số',
                        LEGAL_CONSULTING: 'Tư Vấn Pháp Lý Doanh Nghiệp & M&A',
                        TRAINING_EXPERT: 'Chuyên Gia Huấn Luyện Quản Trị Kaizen'
                      };
                      setNewContractForm({
                        ...newContractForm, 
                        serviceCategory: cat,
                        serviceCategoryLabel: labels[cat] || cat
                      });
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="PACKAGING_DESIGN">Thiết Kế Bao Bì & Bộ Nhận Diện Nhãn Hàng</option>
                    <option value="EQUIPMENT_MAINTENANCE">Bảo Trì Đại Tu Máy Móc Phân Xưởng</option>
                    <option value="IT_SOFTWARE">Phát Triển Phần Mềm ERP / Hệ Thống Số Hóa</option>
                    <option value="LEGAL_CONSULTING">Tư Vấn Pháp Lý Hợp Đồng Dân Sự & Lao Động</option>
                    <option value="TRAINING_EXPERT">Huấn Luyện Quản Trị & Kỹ Năng Chuyên Sâu</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tài khoản chi phí hạch toán (Nợ TK) *</label>
                  <select 
                    value={newContractForm.accountingDebitAccount}
                    onChange={e => setNewContractForm({...newContractForm, accountingDebitAccount: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
                  >
                    <option value="642">TK 642 - Chi phí quản lý doanh nghiệp</option>
                    <option value="641">TK 641 - Chi phí bán hàng & Marketing</option>
                    <option value="627">TK 627 - Chi phí sản xuất chung (Phân xưởng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả chi tiết nội dung công việc &amp; Sản phẩm bàn giao</label>
                <textarea 
                  rows={2}
                  placeholder="Ghi rõ phạm vi công việc, yêu cầu nghiệm thu, sản phẩm cụ thể..."
                  value={newContractForm.contractDescription}
                  onChange={e => setNewContractForm({...newContractForm, contractDescription: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thù lao trước thuế (Gross VNĐ) *</label>
                  <FormattedNumberInput 
                    required
                    value={newContractForm.grossAmount || 0}
                    onChange={val => setNewContractForm({...newContractForm, grossAmount: val})}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono text-indigo-700 text-sm"
                    placeholder="VD: 15.000.000"
                    unit="VNĐ"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tài khoản đối ứng (Có TK) *</label>
                  <select 
                    value={newContractForm.accountingCreditAccount}
                    onChange={e => setNewContractForm({...newContractForm, accountingCreditAccount: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono text-slate-700"
                  >
                    <option value="331">TK 331 - Phải trả cho người bán / CTV (Chuẩn TT200)</option>
                    <option value="3388">TK 3388 - Phải trả, phải nộp khác</option>
                  </select>
                </div>
              </div>

              {/* Checkbox Mẫu 08 Cam kết TNCN */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={newContractForm.hasCommitment08}
                    onChange={e => setNewContractForm({...newContractForm, hasCommitment08: e.target.checked})}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="font-bold text-amber-900">
                    Đối tác đã nộp Bản Cam Kết Mẫu 08/CK-TNCN (Thu nhập chưa đến mức chịu thuế)
                  </span>
                </label>
                <p className="text-[11px] text-amber-700 mt-1 pl-6 leading-relaxed">
                  {newContractForm.hasCommitment08
                    ? '✓ Đã có Mẫu 08: Doanh nghiệp tạm thời KHÔNG khấu trừ 10% tại nguồn (Thuế suất áp dụng = 0%). Chịu trách nhiệm pháp lý cá nhân trước cơ quan thuế.'
                    : '⚠️ Chưa có Mẫu 08: Doanh nghiệp BẮT BUỘC khấu trừ 10% thuế TNCN tại nguồn trước khi chi trả thù lao (Theo Điểm i Khoản 1 Điều 25 TT 111/2013/TT-BTC).'}
                </p>
              </div>

              {/* Tóm tắt tính toán tự động */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <span className="text-slate-500 text-[10.5px] block">Thù lao Gross:</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {(newContractForm.grossAmount || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10.5px] block">Thuế TNCN 10%:</span>
                  <span className="text-xs font-bold text-rose-600 block mt-0.5">
                    {newContractForm.hasCommitment08 ? '0 đ' : `-${Math.round((newContractForm.grossAmount || 0) * 0.1).toLocaleString('vi-VN')} đ`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10.5px] block">Thực chi Net (Có 112):</span>
                  <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                    {(newContractForm.hasCommitment08 
                      ? (newContractForm.grossAmount || 0) 
                      : Math.round((newContractForm.grossAmount || 0) * 0.9)
                    ).toLocaleString()} đ
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewContractModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Hợp Đồng &amp; Sinh Bút Toán Kế Toán</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CHI TIẾT HỢP ĐỒNG & CHỨNG TỪ KHẤU TRỪ THUẾ */}
      {/* ======================================================== */}
      {selectedContractForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                  {selectedContractForDetail.contractCode}
                </span>
                <h3 className="text-base font-bold mt-1">Hồ Sơ Hợp Đồng &amp; Chứng Từ Khấu Trừ Thuế TNCN 10%</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedContractForDetail(null)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-400 text-[10.5px]">Bên Cung Ứng / Chuyên gia thụ hưởng:</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedContractForDetail.contractorName}</div>
                  <div className="text-slate-600 mt-1 font-mono">CCCD: {selectedContractForDetail.contractorIdNumber}</div>
                  <div className="text-slate-600 font-mono">MST cá nhân: {selectedContractForDetail.taxCode}</div>
                  <div className="text-slate-600 mt-1">Ngân hàng: {selectedContractForDetail.bankAccountInfo}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10.5px]">Nội dung dịch vụ &amp; Thời hạn:</div>
                  <div className="text-sm font-bold text-indigo-800 mt-0.5">{selectedContractForDetail.serviceCategoryLabel}</div>
                  <div className="text-slate-600 mt-1">{selectedContractForDetail.contractDescription}</div>
                  <div className="text-slate-500 text-[11px] mt-1">Thời gian: {selectedContractForDetail.signDate} → {selectedContractForDetail.completionDate}</div>
                </div>
              </div>

              {/* 5 bước hồ sơ kiểm soát hợp lệ thuế TNDN */}
              <div>
                <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Bộ 5 Hồ Sơ Kiểm Soát Chi Phí Hợp Lệ (Điều 4 Thông tư 96/2015/TT-BTC)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className={`p-2 rounded-lg border text-center ${selectedContractForDetail.documents.hasContract ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <div className="font-bold">{selectedContractForDetail.documents.hasContract ? '✓ Đủ' : '✗ Thiếu'}</div>
                    <div className="text-[10px] mt-0.5">1. Hợp đồng kinh tế</div>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${selectedContractForDetail.documents.hasAcceptanceReport ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <div className="font-bold">{selectedContractForDetail.documents.hasAcceptanceReport ? '✓ Đủ' : '✗ Thiếu'}</div>
                    <div className="text-[10px] mt-0.5">2. Biên bản nghiệm thu</div>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${selectedContractForDetail.documents.hasLiquidationReport ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <div className="font-bold">{selectedContractForDetail.documents.hasLiquidationReport ? '✓ Đủ' : '✗ Thiếu'}</div>
                    <div className="text-[10px] mt-0.5">3. Thanh lý hợp đồng</div>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${selectedContractForDetail.documents.hasBankTransferDoc ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <div className="font-bold">{selectedContractForDetail.documents.hasBankTransferDoc ? '✓ Đủ' : '✗ Thiếu'}</div>
                    <div className="text-[10px] mt-0.5">4. UNC Ngân hàng</div>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${selectedContractForDetail.documents.hasTaxWithholdingDoc ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                    <div className="font-bold">{selectedContractForDetail.documents.hasTaxWithholdingDoc ? '✓ Có CT' : '○ Mẫu 08'}</div>
                    <div className="text-[10px] mt-0.5">5. Khấu trừ thuế TNCN</div>
                  </div>
                </div>
              </div>

              {/* Bút toán định khoản kế toán TT200 */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-[11px] space-y-1.5">
                <div className="text-indigo-400 font-bold">// 1. Ghi nhận chi phí và công nợ dịch vụ thuê ngoài (Thông tư 200/2014):</div>
                <div className="pl-4">Nợ TK {selectedContractForDetail.accountingDebitAccount}: {selectedContractForDetail.grossAmount.toLocaleString('vi-VN')} đ (Thù lao Gross)</div>
                <div className="pl-8 text-amber-300">Có TK {selectedContractForDetail.accountingCreditAccount}: {selectedContractForDetail.grossAmount.toLocaleString('vi-VN')} đ (TUYỆT ĐỐI KHÔNG DÙNG TK 334)</div>

                {selectedContractForDetail.withheldTaxAmount > 0 && (
                  <>
                    <div className="text-indigo-400 font-bold mt-2">// 2. Khấu trừ 10% thuế TNCN tại nguồn nộp NSNN:</div>
                    <div className="pl-4">Nợ TK {selectedContractForDetail.accountingCreditAccount}: {selectedContractForDetail.withheldTaxAmount.toLocaleString('vi-VN')} đ</div>
                    <div className="pl-8 text-rose-300">Có TK 3335 (Thuế TNCN khấu trừ tại nguồn): {selectedContractForDetail.withheldTaxAmount.toLocaleString('vi-VN')} đ</div>
                  </>
                )}

                <div className="text-indigo-400 font-bold mt-2">// 3. Thanh toán thực lĩnh chuyển khoản cho chuyên gia:</div>
                <div className="pl-4">Nợ TK {selectedContractForDetail.accountingCreditAccount}: {selectedContractForDetail.netPaidAmount.toLocaleString('vi-VN')} đ</div>
                <div className="pl-8 text-emerald-300">Có TK 1121 (Tiền gửi ngân hàng): {selectedContractForDetail.netPaidAmount.toLocaleString('vi-VN')} đ</div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <div className="text-slate-500 text-[11px]">
                  Tình trạng: <span className="font-bold text-emerald-700">ĐÃ THANH TOÁN &amp; ĐỦ HỒ SƠ QUYẾT TOÁN THUẾ TNDN</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Đang xuất Chứng Từ Khấu Trừ Thuế TNCN Điện Tử (Mẫu CTT56) cho chuyên gia ${selectedContractForDetail.contractorName} - MST: ${selectedContractForDetail.taxCode}.`)}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Chứng Từ Khấu Trừ Thuế TNCN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedContractForDetail(null)}
                    className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: LẬP PHIẾU TIẾP KHÁCH & QUYẾT TOÁN PHÁP LÝ */}
      {/* ======================================================== */}
      {showNewHospitalityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-amber-700 to-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-300" />
                  <span>Lập Phiếu Tiếp Khách &amp; Xử Lý Pháp Lý Thuế</span>
                </h3>
                <p className="text-[11px] text-amber-200 mt-0.5">
                  Xử lý chuẩn theo TT 96/2015 &amp; TT 111/2013: Miễn thuế TNCN và tự động bóc tách Chỉ tiêu B4
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowNewHospitalityModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHospitalityExpense} className="p-5 space-y-3.5 text-xs">
              {/* Chọn tình trạng hóa đơn pháp lý */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                <label className="font-bold text-amber-950 block mb-1.5">
                  Căn cứ pháp lý &amp; Tình trạng hóa đơn tài chính *
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-amber-200 cursor-pointer">
                    <input 
                      type="radio" 
                      name="invoiceStatus" 
                      value="HAS_E_INVOICE"
                      checked={newHospitalityForm.invoiceStatus === 'HAS_E_INVOICE'}
                      onChange={e => setNewHospitalityForm({...newHospitalityForm, invoiceStatus: e.target.value as any})}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">1. Có Hóa Đơn Điện Tử (HĐĐT) Hợp Lệ Đầy Đủ</div>
                      <div className="text-[11px] text-slate-500">100% được tính vào chi phí được trừ khi xác định thuế TNDN (Điều 4 TT 96/2015).</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-amber-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="invoiceStatus" 
                      value="NON_INVOICE_INTERNAL_ALLOWANCE"
                      checked={newHospitalityForm.invoiceStatus === 'NON_INVOICE_INTERNAL_ALLOWANCE'}
                      onChange={e => setNewHospitalityForm({...newHospitalityForm, invoiceStatus: e.target.value as any})}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold text-amber-900">
                        2. Không Hóa Đơn - Khoán Chi Tiếp Khách Theo Quy Chế Nội Bộ (Tối Ưu &amp; An Toàn Tuyệt Đối)
                      </div>
                      <div className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                        • <b>Kế toán:</b> Chi thanh toán theo Bill + Tờ trình duyệt chi (Nợ TK 641/642, Có TK 111/112).<br/>
                        • <b>Thuế TNCN:</b> <span className="text-emerald-700 font-bold">MIỄN THUẾ TNCN 100% cho người đi tiếp khách</span> (Điểm đ.4 Khoản 2 Điều 2 TT 111/2013).<br/>
                        • <b>Thuế TNDN:</b> Hệ thống tự động bóc tách vào <span className="text-rose-700 font-bold">Chỉ Tiêu B4 (Chi phí không được trừ)</span> khi lập Tờ khai Quyết toán thuế 03/TNDN. Doanh nghiệp an tâm 100%, không lo phạt truy thu.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-amber-200 cursor-pointer">
                    <input 
                      type="radio" 
                      name="invoiceStatus" 
                      value="HOUSEHOLD_BUSINESS_B01"
                      checked={newHospitalityForm.invoiceStatus === 'HOUSEHOLD_BUSINESS_B01'}
                      onChange={e => setNewHospitalityForm({...newHospitalityForm, invoiceStatus: e.target.value as any})}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold text-slate-800">3. Bảng Kê 01/TNDN (Hộ Kinh Doanh Doanh Thu &lt; 100 Triệu)</div>
                      <div className="text-[11px] text-slate-500">Áp dụng thu mua đặc sản / sản phẩm trực tiếp từ hộ kinh doanh không thuộc diện nộp thuế GTGT.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mục đích tiếp khách &amp; Nội dung làm việc *</label>
                  <input 
                    type="text"
                    required
                    placeholder="VD: Tiếp đoàn đối tác Aeon Mall đàm phán hợp đồng cung ứng"
                    value={newHospitalityForm.businessPurpose}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, businessPurpose: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Địa điểm / Nhà hàng tổ chức *</label>
                  <input 
                    type="text"
                    required
                    placeholder="VD: Nhà hàng Quê Nhà, Q.3, TP.HCM"
                    value={newHospitalityForm.venueName}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, venueName: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Người đại diện đề xuất *</label>
                  <input 
                    type="text"
                    required
                    value={newHospitalityForm.requesterName}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, requesterName: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bộ phận đề xuất</label>
                  <select 
                    value={newHospitalityForm.requesterDepartment}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, requesterDepartment: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
                  >
                    <option value="Khối Kinh Doanh & Tiếp Thị">Khối Kinh Doanh & Tiếp Thị</option>
                    <option value="Ban Tổng Giám Đốc">Ban Tổng Giám Đốc</option>
                    <option value="Phòng Thu Mua & Cung Ứng">Phòng Thu Mua & Cung Ứng</option>
                    <option value="Phòng Tài Chính Kế Toán">Phòng Tài Chính Kế Toán</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số lượng người tham gia</label>
                  <input 
                    type="number"
                    min="1"
                    max="50"
                    value={newHospitalityForm.guestCount}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, guestCount: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đại diện đối tác / Khách mời *</label>
                  <input 
                    type="text"
                    required
                    placeholder="VD: Ông Lê Trọng Bằng - Giám đốc Chuỗi Aeon Mall"
                    value={newHospitalityForm.partnerName}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, partnerName: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên công ty đối tác</label>
                  <input 
                    type="text"
                    placeholder="VD: Aeon Delight Vietnam"
                    value={newHospitalityForm.partnerCompany}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, partnerCompany: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số tiền thực chi (VNĐ) *</label>
                  <FormattedNumberInput 
                    required
                    value={newHospitalityForm.actualSpentAmount || 0}
                    onChange={val => setNewHospitalityForm({...newHospitalityForm, actualSpentAmount: val})}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono text-amber-700 text-sm"
                    placeholder="VD: 2.500.000"
                    unit="VNĐ"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tài khoản chi phí (Nợ TK) *</label>
                  <select 
                    value={newHospitalityForm.debitAccount}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, debitAccount: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
                  >
                    <option value="641">TK 641 - Chi phí bán hàng (Tiếp khách KD)</option>
                    <option value="642">TK 642 - Chi phí quản lý DN (Tiếp đối tác chung)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nguồn tiền thanh toán (Có TK) *</label>
                  <select 
                    value={newHospitalityForm.creditAccount}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, creditAccount: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
                  >
                    <option value="112">TK 112 - Chuyển khoản / Thẻ công ty</option>
                    <option value="111">TK 111 - Tiền mặt / Quỹ nội bộ</option>
                  </select>
                </div>
              </div>

              {newHospitalityForm.invoiceStatus === 'HAS_E_INVOICE' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <label className="font-semibold text-emerald-900 block mb-1">Ký hiệu &amp; Số HĐĐT tra cứu</label>
                  <input 
                    type="text"
                    placeholder="VD: 1C24TAA-0004512"
                    value={newHospitalityForm.invoiceNumber}
                    onChange={e => setNewHospitalityForm({...newHospitalityForm, invoiceNumber: e.target.value})}
                    className="w-full border border-emerald-300 rounded-lg p-2 bg-white font-mono"
                  />
                </div>
              )}

              {/* Tóm tắt cảnh báo pháp lý kế toán */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">
                    Phân loại Thuế TNDN: {newHospitalityForm.invoiceStatus === 'HAS_E_INVOICE' ? (
                      <span className="text-emerald-700">100% Chi Phí Được Trừ</span>
                    ) : (
                      <span className="text-rose-700">Tự động kết chuyển vào Chỉ Tiêu B4 (Loại trừ thuế TNDN)</span>
                    )}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Hạch toán: Nợ TK {newHospitalityForm.debitAccount} / Có TK {newHospitalityForm.creditAccount} • Miễn thuế TNCN nhân viên 100%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10.5px] block">Số tiền duyệt chi:</span>
                  <span className="text-sm font-bold text-amber-700 font-mono block mt-0.5">
                    {(newHospitalityForm.actualSpentAmount || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewHospitalityModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Duyệt Chi Quyết Toán Tiếp Khách</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CHI TIẾT TIẾP KHÁCH & HỒ SƠ CHỈ TIÊU B4 */}
      {/* ======================================================== */}
      {selectedHospitalityForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-amber-800 to-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/30 text-amber-200 border border-amber-500/40">
                  {selectedHospitalityForDetail.voucherCode}
                </span>
                <h3 className="text-base font-bold mt-1">Hồ Sơ Quyết Toán Tiếp Khách &amp; Căn Cứ Pháp Lý Thuế</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedHospitalityForDetail(null)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-slate-400 text-[10.5px]">Mục đích tiếp đón:</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedHospitalityForDetail.businessPurpose}</div>
                  <div className="text-slate-600 mt-1">Đối tác: <span className="font-semibold text-slate-800">{selectedHospitalityForDetail.partnerName}</span> ({selectedHospitalityForDetail.partnerCompany})</div>
                  <div className="text-slate-600">Địa điểm: {selectedHospitalityForDetail.venueName} (Gồm {selectedHospitalityForDetail.guestCount} người)</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10.5px]">Người đại diện công ty:</div>
                  <div className="text-sm font-bold text-amber-800 mt-0.5">{selectedHospitalityForDetail.requesterName} ({selectedHospitalityForDetail.requesterPosition})</div>
                  <div className="text-slate-600 mt-1">Bộ phận: {selectedHospitalityForDetail.requesterDepartment}</div>
                  <div className="text-slate-600">Thời gian: {selectedHospitalityForDetail.eventDate}</div>
                  <div className="text-slate-800 font-bold font-mono mt-1">
                    Tổng chi: {selectedHospitalityForDetail.actualSpentAmount.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* Giải pháp pháp lý chi tiết theo văn bản quy phạm pháp luật */}
              <div className={`p-4 rounded-xl border ${selectedHospitalityForDetail.citNonDeductibleAmount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Phân Tích Căn Cứ Pháp Lý Kế Toán &amp; Thuế (Bộ Tài Chính):</span>
                </div>
                <div className="space-y-1.5 leading-relaxed text-slate-700">
                  <div>
                    <b>1. Hạch toán kế toán nội bộ:</b> Chi phí hợp lý phục vụ hoạt động sản xuất kinh doanh theo Quy chế Chi tiêu Nội bộ đã ban hành. Định khoản: <code className="font-mono bg-white px-1 py-0.5 rounded border">Nợ TK {selectedHospitalityForDetail.debitAccount} / Có TK {selectedHospitalityForDetail.creditAccount}</code>.
                  </div>
                  <div>
                    <b>2. Thuế Thu Nhập Cá Nhân (TNCN):</b> Được <span className="text-emerald-700 font-bold">MIỄN THUẾ TNCN 100%</span> theo quy định tại <em>Điểm đ.4 Khoản 2 Điều 2 Thông tư 111/2013/TT-BTC</em> (Khoản khoán chi tiếp khách phục vụ sản xuất kinh doanh của đơn vị không tính vào thu nhập chịu thuế TNCN của nhân viên).
                  </div>
                  <div>
                    <b>3. Thuế Thu Nhập Doanh Nghiệp (TNDN):</b> {selectedHospitalityForDetail.citNonDeductibleAmount > 0 ? (
                      <span className="text-rose-700 font-bold">
                        Do dịch vụ ăn uống tiếp khách KHÔNG THUỘC đối tượng lập Bảng kê 01/TNDN (Điều 4 TT 96/2015). Hệ thống tự động bóc tách và kết chuyển số tiền {selectedHospitalityForDetail.citNonDeductibleAmount.toLocaleString('vi-VN')} đ vào CHỈ TIÊU B4 (Chi phí không được trừ khi xác định thu nhập chịu thuế) trên Tờ khai Quyết toán thuế TNDN (Mẫu 03/TNDN). Doanh nghiệp hoàn toàn an tâm, không lo rủi ro bị cơ quan thuế xử phạt hay truy thu tiền chậm nộp.
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold">
                        Hóa đơn điện tử hợp pháp số {selectedHospitalityForDetail.invoiceNumber || 'HĐĐT'}, kèm bill kê chi tiết món ăn. Được tính 100% vào chi phí được trừ khi xác định thuế TNDN.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bút toán định khoản */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-[11px] space-y-1.5">
                <div className="text-amber-400 font-bold">// Định khoản kế toán ghi nhận chi phí tiếp khách:</div>
                <div className="pl-4">Nợ TK {selectedHospitalityForDetail.debitAccount}: {selectedHospitalityForDetail.actualSpentAmount.toLocaleString('vi-VN')} đ</div>
                <div className="pl-8 text-emerald-300">Có TK {selectedHospitalityForDetail.creditAccount}: {selectedHospitalityForDetail.actualSpentAmount.toLocaleString('vi-VN')} đ</div>
                
                {selectedHospitalityForDetail.citNonDeductibleAmount > 0 && (
                  <div className="text-rose-400 text-[10.5px] mt-2 pt-1 border-t border-slate-800">
                    // Tờ khai Quyết toán thuế 03/TNDN: Cộng vào Chỉ Tiêu B4 = +{selectedHospitalityForDetail.citNonDeductibleAmount.toLocaleString('vi-VN')} đ
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <div className="text-slate-500 text-[11px]">
                  Ghi chú duyệt: <span className="italic text-slate-700">{selectedHospitalityForDetail.approverNote}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Đang xuất Phiếu Quyết Toán Chi Phí Tiếp Khách & Tờ Trình Giải Trình Chỉ Tiêu B4 cho mã ${selectedHospitalityForDetail.voucherCode}.`)}
                    className="px-3.5 py-1.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Phiếu Quyết Toán Tiếp Khách</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHospitalityForDetail(null)}
                    className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
