import React, { useState, useMemo } from 'react';
import { KpiGoal, CompanyPolicy, Employee, UserRole, DailyWorkReportItem } from '../types/hrm';
import { initialKpis } from '../services/mockData';
import { CompactPagination, evaluateColumnCondition } from './SmartTableFilter';
import { 
  Target, 
  TrendingUp, 
  Award, 
  Users, 
  Plus, 
  CheckCircle2, 
  BarChart3, 
  Percent, 
  Calculator, 
  Sliders, 
  Sparkles, 
  DollarSign, 
  Building, 
  Package, 
  BadgePercent, 
  Filter, 
  Search,
  Clock,
  AlertTriangle,
  FileText,
  Check,
  X,
  ChevronRight,
  Star,
  MessageSquare,
  Calendar,
  ShieldAlert,
  Eye,
  EyeOff,
  HelpCircle,
  Briefcase, 
  Layers, 
  ArrowUpRight, 
  CheckCheck,
  BookOpen
} from 'lucide-react';
import { jobDescriptionsLibrary } from '../services/jobDescriptionsLibrary';

interface PerformanceViewProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
  dailyReports?: DailyWorkReportItem[];
  onUpdateDailyReports?: (reports: DailyWorkReportItem[]) => void;
}

interface SalaryGroupRecord {
  id: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  groupType: 'PRODUCT' | 'VOLUME' | 'KPI';
  groupName: string;
  baseMetric: string;
  baseAmount: number;
  adjustedAmount: number;
  appliedRatePercent: number;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  policy,
  employees,
  currentRole,
  dailyReports = [],
  onUpdateDailyReports,
}) => {
  const [activeTab, setActiveTab] = useState<'DAILY_WORK_LOG' | 'DAILY_STANDUP' | 'KPI_EVALUATION' | 'SALARY_GROUPS_PERFORMANCE' | 'JD_LIBRARY'>('DAILY_WORK_LOG');
  const [kpiList, setKpiList] = useState<KpiGoal[]>(initialKpis);
  const [selectedQuarter, setSelectedQuarter] = useState('Q3-2026');

  // Filter & Pagination states cho Tab 5: Thư Viện JD & Khung Năng Lực
  const [jdSearchText, setJdSearchText] = useState('');
  const [jdDeptFilter, setJdDeptFilter] = useState('ALL');
  const [jdPage, setJdPage] = useState(1);
  const [jdPageSize, setJdPageSize] = useState(8);
  const [selectedJdDetail, setSelectedJdDetail] = useState<any | null>(null);

  // Filter states cho Báo Cáo Công Việc Ngày
  const [reportDateFilter, setReportDateFilter] = useState<string>('2026-09-08');
  const [reportDeptFilter, setReportDeptFilter] = useState<string>('ALL');
  const [reportSearchText, setReportSearchText] = useState<string>('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('ALL');

  // Modal tạo Báo Cáo Công Việc Ngày mới
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [formEmpId, setFormEmpId] = useState<string>('EMP-003');
  const [formDate, setFormDate] = useState<string>('2026-09-08');
  const [formTaskTitle, setFormTaskTitle] = useState('');
  const [formTaskDesc, setFormTaskDesc] = useState('');
  const [formSpentHours, setFormSpentHours] = useState<number>(4);
  const [formTargetType, setFormTargetType] = useState<'KPI_METRIC' | 'JOB_DESCRIPTION' | ''>('KPI_METRIC');
  const [formKpiName, setFormKpiName] = useState('Chốt bảng công và chi trả lương đúng hạn trước ngày 05 hàng tháng');
  const [formKpiContribution, setFormKpiContribution] = useState<number>(15);
  const [formJdDutyName, setFormJdDutyName] = useState('Tiếp nhận nhân sự mới và quản lý hồ sơ nhân viên');
  const [formStatus, setFormStatus] = useState<'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED'>('COMPLETED');
  const [formBlockerReason, setFormBlockerReason] = useState('');
  const [formError, setFormError] = useState<string>('');

  // Modal Phản hồi & Đánh giá của Trưởng phòng
  const [selectedReportForFeedback, setSelectedReportForFeedback] = useState<DailyWorkReportItem | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<1 | 2 | 3 | 4 | 5>(5);

  // 4 Tỷ lệ điều chỉnh hiệu quả hoạt động kinh doanh doanh nghiệp
  const [companyRate, setCompanyRate] = useState<number>(policy.companyBusinessPerformanceRate || 105);
  const [productRate, setProductRate] = useState<number>(policy.productSalaryPerformanceRate || 102);
  const [volumeRate, setVolumeRate] = useState<number>(policy.volumeSalaryPerformanceRate || 108);
  const [kpiRate, setKpiRate] = useState<number>(policy.kpiSalaryPerformanceRate || 100);

  // Phân trang & Lọc cho Bảng KPI
  const [kpiPage, setKpiPage] = useState(1);
  const [kpiPageSize, setKpiPageSize] = useState(10);
  const [kpiFilters, setKpiFilters] = useState({
    name: '',
    dept: '',
    title: '',
    score: '',
    rank: '',
  });

  // Phân trang & Lọc cho Bảng 3 Nhóm Lương
  const [groupPage, setGroupPage] = useState(1);
  const [groupPageSize, setGroupPageSize] = useState(10);
  const [groupTypeFilter, setGroupTypeFilter] = useState<'ALL' | 'PRODUCT' | 'VOLUME' | 'KPI'>('ALL');
  const [groupFilters, setGroupFilters] = useState({
    code: '',
    name: '',
    dept: '',
    group: '',
    metric: '',
    baseAmount: '',
    adjustedAmount: '',
    rate: '',
  });

  // Danh sách phòng ban duy nhất
  const departmentList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.departmentName) set.add(e.departmentName);
    });
    return Array.from(set);
  }, [employees]);

  // Sinh danh sách 3 Nhóm lương cho toàn bộ nhân sự theo tỷ lệ HQKD
  const salaryGroupRecords: SalaryGroupRecord[] = useMemo(() => {
    return employees.slice(0, 80).map((emp, idx) => {
      let groupType: 'PRODUCT' | 'VOLUME' | 'KPI' = 'KPI';
      let groupName = 'Nhóm 3: Lương Hiệu Quả KPI / OKR';
      let baseMetric = 'Hạng B (100% lương KPI)';
      let baseAmount = Math.round(emp.baseSalary * 0.25);
      let groupSpecificRate = kpiRate;

      if (emp.departmentName?.includes('Xưởng') || emp.departmentName?.includes('Nhà Máy')) {
        groupType = 'PRODUCT';
        groupName = 'Nhóm 1: Lương Sản Phẩm (Khoán Chi)';
        const pieces = 1200 + (idx % 8) * 150;
        const unitPrice = 5500;
        baseMetric = `${pieces.toLocaleString('vi-VN')} sản phẩm (${unitPrice.toLocaleString('vi-VN')} đ/sp)`;
        baseAmount = pieces * unitPrice;
        groupSpecificRate = productRate;
      } else if (emp.departmentName?.includes('Kinh Doanh') || emp.departmentName?.includes('Sales')) {
        groupType = 'VOLUME';
        groupName = 'Nhóm 2: Lương Doanh Thu / Sản Lượng';
        const revenue = 350000000 + (idx % 5) * 80000000;
        const commissionRate = 0.035;
        baseMetric = `Doanh số ${(revenue / 1000000).toFixed(0)} tr (HH ${commissionRate * 100}%)`;
        baseAmount = Math.round(revenue * commissionRate);
        groupSpecificRate = volumeRate;
      }

      const compositeRate = (groupSpecificRate * companyRate) / 10000;
      const adjustedAmount = Math.round(baseAmount * compositeRate);

      return {
        id: `SGR-${emp.id}`,
        employeeCode: emp.code,
        employeeName: emp.fullName,
        departmentName: emp.departmentName || 'Chưa phân bổ',
        groupType,
        groupName,
        baseMetric,
        baseAmount,
        adjustedAmount,
        appliedRatePercent: Math.round(compositeRate * 100),
      };
    });
  }, [employees, companyRate, productRate, volumeRate, kpiRate]);

  // Bộ lọc danh sách báo cáo công việc ngày
  const filteredDailyReports = useMemo(() => {
    return dailyReports.filter(rep => {
      if (reportDateFilter !== 'ALL' && rep.date !== reportDateFilter) return false;
      if (reportDeptFilter !== 'ALL' && rep.departmentName !== reportDeptFilter) return false;
      if (reportStatusFilter !== 'ALL' && rep.status !== reportStatusFilter) return false;
      if (reportSearchText) {
        const text = `${rep.employeeName} ${rep.employeeCode} ${rep.taskTitle} ${rep.taskDescription}`.toLowerCase();
        if (!text.includes(reportSearchText.toLowerCase())) return false;
      }

      // Kiểm soát quyền xem báo cáo của Trưởng phòng theo Policy
      const isLeader = currentRole === 'GENERAL_DIRECTOR' || currentRole === 'HR_MANAGER';
      if (rep.isDeptHead && !policy.allowEmployeesViewDeptHeadReport && !isLeader) {
        return false;
      }

      return true;
    });
  }, [dailyReports, reportDateFilter, reportDeptFilter, reportStatusFilter, reportSearchText, policy.allowEmployeesViewDeptHeadReport, currentRole]);

  // Thống kê Standup Dashboard
  const standupStats = useMemo(() => {
    const targetDateReports = dailyReports.filter(r => r.date === reportDateFilter);
    const totalReports = targetDateReports.length;
    const completedCount = targetDateReports.filter(r => r.status === 'COMPLETED').length;
    const blockedCount = targetDateReports.filter(r => r.status === 'BLOCKED').length;
    const totalHours = targetDateReports.reduce((acc, r) => acc + (r.spentHours || 0), 0);
    const kpiHours = targetDateReports.filter(r => r.targetType === 'KPI_METRIC').reduce((acc, r) => acc + (r.spentHours || 0), 0);
    const jdHours = targetDateReports.filter(r => r.targetType === 'JOB_DESCRIPTION').reduce((acc, r) => acc + (r.spentHours || 0), 0);
    const kpiRatio = totalHours > 0 ? Math.round((kpiHours / totalHours) * 100) : 0;

    // Phát hiện Target Drift (Nhân sự dành >= 30% giờ công cho việc ngoài KPI)
    const driftEmployees: Array<{ empName: string; empCode: string; dept: string; jdPercent: number }> = [];
    const empHoursMap: Record<string, { name: string; code: string; dept: string; total: number; jd: number }> = {};
    
    targetDateReports.forEach(r => {
      if (!empHoursMap[r.employeeId]) {
        empHoursMap[r.employeeId] = { name: r.employeeName, code: r.employeeCode, dept: r.departmentName, total: 0, jd: 0 };
      }
      empHoursMap[r.employeeId].total += r.spentHours || 0;
      if (r.targetType === 'JOB_DESCRIPTION') {
        empHoursMap[r.employeeId].jd += r.spentHours || 0;
      }
    });

    Object.values(empHoursMap).forEach(info => {
      if (info.total >= 4) {
        const jdRatio = Math.round((info.jd / info.total) * 100);
        if (jdRatio >= 35) {
          driftEmployees.push({ empName: info.name, empCode: info.code, dept: info.dept, jdPercent: jdRatio });
        }
      }
    });

    return {
      totalReports,
      completedCount,
      blockedCount,
      totalHours,
      kpiHours,
      jdHours,
      kpiRatio,
      driftEmployees
    };
  }, [dailyReports, reportDateFilter]);

  // Xử lý nộp báo cáo ngày mới (Bắt buộc gắn với KPI hoặc JD)
  const handleCreateDailyReport = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTargetType) {
      setFormError('⛔ BẮT BUỘC CHỌN MỤC ĐÍCH: Công việc phải gắn với Chỉ số KPI tháng hoặc Mô tả công việc (JD). Doanh nghiệp không cho phép báo cáo công việc vô định!');
      return;
    }

    if (!formTaskTitle.trim()) {
      setFormError('Vui lòng nhập Tiêu đề công việc đã làm!');
      return;
    }

    const emp = employees.find(e => e.id === formEmpId);
    if (!emp) {
      setFormError('Vui lòng chọn nhân sự thực hiện!');
      return;
    }

    const newReport: DailyWorkReportItem = {
      id: `DWR-${Date.now()}`,
      tenantId: policy.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName || 'Chưa phân bổ',
      positionName: emp.position,
      isDeptHead: currentRole === 'DEPT_HEAD',
      date: formDate,
      taskTitle: formTaskTitle.trim(),
      taskDescription: formTaskDesc.trim(),
      spentHours: Number(formSpentHours) || 4,
      targetType: formTargetType,
      kpiName: formTargetType === 'KPI_METRIC' ? formKpiName : undefined,
      kpiProgressContribution: formTargetType === 'KPI_METRIC' ? Number(formKpiContribution) || 10 : undefined,
      jdDutyName: formTargetType === 'JOB_DESCRIPTION' ? formJdDutyName : undefined,
      status: formStatus,
      blockerReason: formStatus === 'BLOCKED' ? formBlockerReason : undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [newReport, ...dailyReports];
    if (onUpdateDailyReports) {
      onUpdateDailyReports(updated);
    }

    setShowAddReportModal(false);
    setFormTaskTitle('');
    setFormTaskDesc('');
    setFormBlockerReason('');
    alert('ĐÃ NỘP BÁO CÁO CÔNG VIỆC THÀNH CÔNG!\n\nTiến độ đã được ghi nhận và liên kết trực tiếp vào Thẻ điểm KPI / Bản mô tả công việc của bạn.');
  };

  // Trưởng phòng lưu phản hồi và chấm điểm
  const handleSaveFeedback = () => {
    if (!selectedReportForFeedback) return;

    const updated = dailyReports.map(r => {
      if (r.id === selectedReportForFeedback.id) {
        return {
          ...r,
          managerFeedback: feedbackText,
          managerRating: feedbackRating
        };
      }
      return r;
    });

    if (onUpdateDailyReports) {
      onUpdateDailyReports(updated);
    }

    setSelectedReportForFeedback(null);
    setFeedbackText('');
    alert('Đã gửi nhận xét & đánh giá sao thành công đến nhân sự!');
  };

  // Đồng bộ hệ số KPI sang bảng lương
  const handleSyncKpiToPayroll = () => {
    alert(`THÀNH CÔNG!\n\nĐã liên kết hệ số KPI (Tỷ lệ đạt ${kpiRate}%) sang cột Thưởng Hiệu Suất của toàn bộ ${salaryGroupRecords.length} nhân viên trong Bảng Lương tháng 08/2026.\n\nCăn cứ: Chính sách tự động hóa KPI & Bảng Quy Ước Doanh Nghiệp.`);
  };

  // Phân trang 3 Nhóm Lương
  const filteredGroupRecords = useMemo(() => {
    return salaryGroupRecords.filter((item) => {
      if (groupTypeFilter !== 'ALL' && item.groupType !== groupTypeFilter) return false;
      if (!evaluateColumnCondition(item.employeeCode, groupFilters.code)) return false;
      if (!evaluateColumnCondition(item.employeeName, groupFilters.name)) return false;
      if (!evaluateColumnCondition(item.departmentName, groupFilters.dept)) return false;
      if (!evaluateColumnCondition(item.groupName, groupFilters.group)) return false;
      if (!evaluateColumnCondition(item.baseMetric, groupFilters.metric)) return false;
      if (!evaluateColumnCondition(item.baseAmount, groupFilters.baseAmount)) return false;
      if (!evaluateColumnCondition(item.adjustedAmount, groupFilters.adjustedAmount)) return false;
      if (!evaluateColumnCondition(item.appliedRatePercent, groupFilters.rate)) return false;
      return true;
    });
  }, [salaryGroupRecords, groupTypeFilter, groupFilters]);

  const totalGroupPages = Math.ceil(filteredGroupRecords.length / groupPageSize) || 1;
  const paginatedGroupRecords = useMemo(() => {
    const start = (groupPage - 1) * groupPageSize;
    return filteredGroupRecords.slice(start, start + groupPageSize);
  }, [filteredGroupRecords, groupPage, groupPageSize]);

  // Phân trang KPI
  const filteredKpis = useMemo(() => {
    return kpiList.filter((item) => {
      if (!evaluateColumnCondition(item.employeeName, kpiFilters.name)) return false;
      if (!evaluateColumnCondition(item.departmentName, kpiFilters.dept)) return false;
      if (!evaluateColumnCondition(item.title, kpiFilters.title)) return false;
      if (!evaluateColumnCondition(item.finalWeightedScore, kpiFilters.score)) return false;
      if (!evaluateColumnCondition(item.ratingRank, kpiFilters.rank)) return false;
      return true;
    });
  }, [kpiList, kpiFilters]);

  const totalKpiPages = Math.ceil(filteredKpis.length / kpiPageSize) || 1;
  const paginatedKpis = useMemo(() => {
    const start = (kpiPage - 1) * kpiPageSize;
    return filteredKpis.slice(start, start + kpiPageSize);
  }, [filteredKpis, kpiPage, kpiPageSize]);

  // Phân trang & Lọc Thư Viện JD
  const jdDepartments = useMemo(() => {
    const set = new Set<string>();
    jobDescriptionsLibrary.forEach(j => {
      if (j.departmentName) set.add(j.departmentName);
    });
    return Array.from(set);
  }, []);

  const filteredJds = useMemo(() => {
    return jobDescriptionsLibrary.filter(jd => {
      if (jdDeptFilter !== 'ALL' && jd.departmentName !== jdDeptFilter) return false;
      if (jdSearchText) {
        const text = `${jd.title} ${jd.departmentName} ${jd.summary} ${jd.keyResponsibilities.join(' ')} ${jd.requiredSkills.join(' ')}`.toLowerCase();
        if (!text.includes(jdSearchText.toLowerCase())) return false;
      }
      return true;
    });
  }, [jdDeptFilter, jdSearchText]);

  const totalJdPages = Math.ceil(filteredJds.length / jdPageSize) || 1;
  const paginatedJds = useMemo(() => {
    const start = (jdPage - 1) * jdPageSize;
    return filteredJds.slice(start, start + jdPageSize);
  }, [filteredJds, jdPage, jdPageSize]);

  return (
    <div className="space-y-1.5 animate-in fade-in duration-200">
      {/* HEADER PHÂN HỆ */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>13. Công Việc &amp; Hiệu Suất KPI</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  MBO &amp; OKRs Enterprise
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Văn hóa Báo cáo tiến độ hằng ngày gắn kết 100% với KPI &amp; Mô tả công việc (JD), minh bạch phòng ban và liên kết bảng lương
              </p>
            </div>
          </div>
        </div>

        {/* Nút tác vụ nhanh */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddReportModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nộp Báo Cáo Ngày Mới</span>
          </button>
        </div>
      </div>

      {/* 5 TABS PHÂN HỆ CỐ ĐỊNH (STICKY SUBTABS) */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md pt-2 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-slate-200 flex items-center space-x-1 overflow-x-auto scrollable-tabs pb-1">
        <button
          onClick={() => setActiveTab('DAILY_WORK_LOG')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'DAILY_WORK_LOG'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Báo Cáo Công Việc Hằng Ngày</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
            {filteredDailyReports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DAILY_STANDUP')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'DAILY_STANDUP'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>2. Giao Ban Sáng &amp; Phân Tích Thông Minh</span>
          {standupStats.blockedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
              {standupStats.blockedCount} kẹt
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('KPI_EVALUATION')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'KPI_EVALUATION'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>3. Bảng Điểm &amp; Mục Tiêu KPI/OKR</span>
        </button>

        <button
          onClick={() => setActiveTab('SALARY_GROUPS_PERFORMANCE')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'SALARY_GROUPS_PERFORMANCE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>4. 3 Nhóm Lương &amp; Liên Kết Bảng Lương</span>
        </button>

        <button
          onClick={() => setActiveTab('JD_LIBRARY')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeTab === 'JD_LIBRARY'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>5. Thư Viện JD &amp; Khung Năng Lực (52 Chức Danh)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {jobDescriptionsLibrary.length} JD
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: BÁO CÁO CÔNG VIỆC HẰNG NGÀY (DAILY WORK LOG)
      ========================================================================= */}
      {activeTab === 'DAILY_WORK_LOG' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* Thanh lọc & Minh bạch thông tin */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">Ngày:</span>
                <input 
                  type="date"
                  value={reportDateFilter}
                  onChange={(e) => setReportDateFilter(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-slate-50 text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">Phòng ban:</span>
                <select
                  value={reportDeptFilter}
                  onChange={(e) => setReportDeptFilter(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-800 outline-none"
                >
                  <option value="ALL">Tất Cả Phòng Ban</option>
                  {departmentList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-700">Trạng thái:</span>
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-800 outline-none"
                >
                  <option value="ALL">Tất Cả Trạng Thái</option>
                  <option value="COMPLETED">✓ Hoàn Thành</option>
                  <option value="IN_PROGRESS">Đang Thực Hiện</option>
                  <option value="BLOCKED">⚠️ Bị Kẹt (Cần Hỗ Trợ)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Tìm nhân sự, việc đã làm..."
                  value={reportSearchText}
                  onChange={(e) => setReportSearchText(e.target.value)}
                  className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-300 w-52 focus:w-64 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Banner Quy ước & Tính minh bạch */}
          <div className="p-3 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-emerald-50/50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-slate-700">
                <strong>Minh bạch nội bộ:</strong> Đồng nghiệp cùng phòng ban đọc được báo cáo của nhau để phối hợp nhịp nhàng. 
                {policy.allowEmployeesViewDeptHeadReport ? (
                  <span className="text-emerald-700 font-semibold ml-1">
                    (Báo cáo của Trưởng phòng đang được công khai cho nhân viên).
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium ml-1">
                    (Báo cáo của Trưởng phòng chỉ Ban Giám Đốc xem được theo quy ước).
                  </span>
                )}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-white border border-slate-200 text-slate-600 shadow-2xs shrink-0">
              Điều 105 &amp; 107 BLLĐ
            </span>
          </div>

          {/* Danh sách Báo cáo công việc ngày */}
          {filteredDailyReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Chưa có báo cáo công việc nào trong ngày được chọn</p>
              <p className="text-xs text-slate-500 mt-1">Bấm nút "Nộp Báo Cáo Ngày Mới" ở góc trên để khai báo tiến độ công việc.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredDailyReports.map((rep) => {
                const isBlocked = rep.status === 'BLOCKED';
                const isCompleted = rep.status === 'COMPLETED';

                return (
                  <div 
                    key={rep.id}
                    className={`p-2 rounded-xl border transition-all bg-white shadow-2xs hover:shadow-sm space-y-3 relative group ${
                      isBlocked ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Header Thẻ Báo Cáo: Nhân sự, Phòng ban, Giờ */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">{rep.employeeName}</span>
                          <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold border border-indigo-100">
                            {rep.employeeCode}
                          </span>
                          {rep.isDeptHead && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              Trưởng Phòng
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {rep.positionName || 'Nhân viên'} • {rep.departmentName}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{rep.spentHours}h</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isBlocked
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isCompleted ? '✓ Hoàn thành' : isBlocked ? '⚠️ Bị kẹt' : 'Đang làm'}
                        </span>
                      </div>
                    </div>

                    {/* Tiêu đề & Nội dung công việc */}
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {rep.taskTitle}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {rep.taskDescription}
                      </p>
                    </div>

                    {/* Khối mục đích bắt buộc: KPI hay JD */}
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[10.5px] space-y-1">
                      {rep.targetType === 'KPI_METRIC' ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-700 flex items-center gap-1">
                              <Target className="w-3 h-3 text-indigo-600" />
                              <span>Gắn với KPI Mục Tiêu Tháng:</span>
                            </span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              +{rep.kpiProgressContribution || 10}% tiến độ
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium mt-0.5 line-clamp-1">
                            {rep.kpiName || 'Chỉ số KPI chính'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-amber-800 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-amber-700" />
                            <span>Gắn với Mô Tả Công Việc (JD):</span>
                          </span>
                          <p className="text-slate-700 font-medium mt-0.5 line-clamp-1">
                            {rep.jdDutyName || 'Nhiệm vụ chuẩn chức danh'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Nếu bị kẹt BLOCKED: Hiển thị lý do vướng mắc */}
                    {isBlocked && rep.blockerReason && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10.5px]">
                        <strong>⚠️ Vướng mắc cần hỗ trợ:</strong> {rep.blockerReason}
                      </div>
                    )}

                    {/* Phản hồi & Đánh giá sao của Quản lý */}
                    {rep.managerFeedback && (
                      <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[10.5px] space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-900 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-indigo-600" />
                            <span>Trưởng Phòng Phản Hồi:</span>
                          </span>
                          {rep.managerRating && (
                            <div className="flex items-center space-x-0.5 text-amber-500 font-bold">
                              {Array.from({ length: rep.managerRating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-slate-700 italic">"{rep.managerFeedback}"</p>
                      </div>
                    )}

                    {/* Nút hành động của Quản lý */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 text-[10px]">
                        Nộp lúc: {rep.createdAt.slice(11, 16)} • {rep.date}
                      </span>

                      {(currentRole === 'HR_MANAGER' || currentRole === 'DEPT_HEAD' || currentRole === 'GENERAL_DIRECTOR') && (
                        <button
                          onClick={() => {
                            setSelectedReportForFeedback(rep);
                            setFeedbackText(rep.managerFeedback || '');
                            setFeedbackRating(rep.managerRating || 5);
                          }}
                          className="px-2.5 py-1 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-bold flex items-center space-x-1 cursor-pointer transition-all shadow-2xs"
                        >
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                          <span>{rep.managerFeedback ? 'Sửa đánh giá' : 'Nhận xét & Chấm sao'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: GIAO BAN SÁNG & PHÂN TÍCH THÔNG MINH (DAILY STANDUP DASHBOARD)
      ========================================================================= */}
      {activeTab === 'DAILY_STANDUP' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* 4 Thẻ KPI Giao Ban Sáng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-2 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tổng Đầu Việc Ngày</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">{standupStats.totalReports}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tổng số giờ công: {standupStats.totalHours} giờ</p>
            </div>

            <div className="p-2 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tỷ Lệ Tập Trung KPI</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-emerald-700 mt-2">{standupStats.kpiRatio}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{standupStats.kpiHours}h dành cho mục tiêu chiến lược</p>
            </div>

            <div className="p-2 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Việc Đã Hoàn Thành</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-blue-700 mt-2">{standupStats.completedCount}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Đạt tiến độ kế hoạch đề ra</p>
            </div>

            <div className={`p-2 rounded-xl border shadow-2xs ${
              standupStats.blockedCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Ca Bị Kẹt (Cần Hỗ Trợ)</span>
                <div className={`p-1.5 rounded-lg ${standupStats.blockedCount > 0 ? 'bg-rose-600 text-white animate-bounce' : 'bg-slate-100 text-slate-500'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-xl font-bold mt-2 ${standupStats.blockedCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                {standupStats.blockedCount}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Cần Trưởng phòng giải quyết trong 10p giao ban</p>
            </div>
          </div>

          {/* CẢNH BÁO LỆCH MỤC TIÊU (TARGET DRIFT ALERT) */}
          <div className="p-2 rounded-xl border border-amber-200 bg-amber-50/50 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <span>Phát Hiện Nguy Cơ Làm Việc Lệch Mục Tiêu (Target Drift Alert)</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                      Smart AI Engine
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Cảnh báo khi nhân sự dành trên 35% thời lượng trong ngày cho các việc hành chính sự vụ phát sinh ngoài mục tiêu KPI trọng tâm
                  </p>
                </div>
              </div>
            </div>

            {standupStats.driftEmployees.length === 0 ? (
              <div className="p-3 bg-white rounded-lg border border-amber-200/60 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Toàn bộ nhân sự đều đang tập trung cao độ vào các chỉ số KPI trọng điểm (Tỷ lệ việc ngoài mục tiêu &lt; 30%).</span>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-amber-200 divide-y divide-slate-100 overflow-hidden text-xs">
                {standupStats.driftEmployees.map((emp, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between hover:bg-amber-50/40">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <strong className="text-slate-900">{emp.empName}</strong>
                        <span className="text-[11px] text-slate-500 ml-1.5">({emp.empCode} • {emp.dept})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] text-rose-700 font-bold">
                        {emp.jdPercent}% thời gian cho việc sự vụ JD
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        Khuyến nghị: Tái phân bổ ca kíp
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Daily Task Summarizer: Bảng Tóm Tắt Họp Giao Ban */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Biên Bản Tóm Tắt Họp Giao Ban Sáng (AI Morning Standup Notes)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Tự động tổng hợp lúc 08h15 hằng ngày</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span>Điểm Sáng Hoàn Thành Xuất Sắc Hôm Qua:</span>
                </h4>
                <ul className="list-disc list-inside text-[11px] text-emerald-950 space-y-1">
                  <li>Phòng Nhân Sự: Chốt đối soát bảng công máy quẹt thẻ vân tay 250 lao động đúng hạn Điều 107.</li>
                  <li>Phân Xưởng Đóng Gói: Hiệu chuẩn nhiệt độ hàn Line 1 và Line 2 đạt định mức 1.400 sản phẩm.</li>
                  <li>Bộ phận Tuyển dụng: Lọc 18 CV trên ATS AI và phỏng vấn 3 ứng viên Kỹ sư R&amp;D.</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 space-y-1.5">
                <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Các Điểm Nghẽn (Blockers) Cần Trưởng Phòng Quyết Định:</span>
                </h4>
                <ul className="list-disc list-inside text-[11px] text-rose-950 space-y-1">
                  <li>Line Đóng Gói: Cần duyệt xuất gấp 02 ron cao su chịu nhiệt từ Kho Vật tư.</li>
                  <li>Phòng Kế Toán: Chờ hóa đơn đầu vào nguyên liệu từ nhà cung cấp Hải Dương để hoàn tất tờ khai thuế.</li>
                  <li>Phòng R&amp;D: Chờ mẫu hương liệu hữu cơ để thử nghiệm công thức sốt mới.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BẢNG ĐIỂM & MỤC TIÊU KPI/OKR
      ========================================================================= */}
      {activeTab === 'KPI_EVALUATION' && (
        <div className="space-y-1.5 animate-in fade-in">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Thẻ Điểm KPI Cá Nhân &amp; Tiến Độ Tự Động Tích Lũy Từ Báo Cáo Ngày
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mỗi báo cáo công việc hoàn thành có gắn với KPI sẽ tự động tăng thanh tiến độ thực tế
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white outline-none"
              >
                <option value="Q3-2026">Kỳ Đánh Giá: Quý 3/2026</option>
                <option value="Q2-2026">Kỳ Đánh Giá: Quý 2/2026</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-center w-12">STT</th>
                  <th className="p-3">Mã NV / Họ Tên</th>
                  <th className="p-3">Phòng Ban</th>
                  <th className="p-3">Chỉ Số Mục Tiêu KPI</th>
                  <th className="p-3 text-center">Tỷ Trọng</th>
                  <th className="p-3 text-center">Điểm Tích Lũy</th>
                  <th className="p-3 text-center">Xếp Loại</th>
                  <th className="p-3 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedKpis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Không có mục tiêu KPI nào phù hợp bộ lọc
                    </td>
                  </tr>
                ) : (
                  paginatedKpis.map((kpi, idx) => (
                    <tr key={kpi.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-slate-500">
                        {(kpiPage - 1) * kpiPageSize + idx + 1}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{kpi.employeeName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{kpi.employeeId}</span>
                      </td>
                      <td className="p-3 text-slate-600">{kpi.departmentName}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 block">{kpi.title}</span>
                        <div className="w-36 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, kpi.finalWeightedScore)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700">{kpi.weightPercent}%</td>
                      <td className="p-3 text-center font-mono font-bold text-indigo-700">{kpi.finalWeightedScore} / 100</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          kpi.ratingRank === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          kpi.ratingRank === 'B' ? 'bg-indigo-100 text-indigo-800' :
                          kpi.ratingRank === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          Hạng {kpi.ratingRank}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-emerald-700 font-semibold text-[11px]">Đang theo dõi</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalKpiPages > 1 && (
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <CompactPagination
                  currentPage={kpiPage}
                  totalPages={totalKpiPages}
                  onPageChange={setKpiPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 3 NHÓM LƯƠNG & LIÊN KẾT THƯỞNG PHẠT BẢNG LƯƠNG
      ========================================================================= */}
      {activeTab === 'SALARY_GROUPS_PERFORMANCE' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* Banner Điều Khiển Tỷ Lệ HQKD Doanh Nghiệp (Dynamic Live Sliders) */}
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 text-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-sm border border-indigo-200 space-y-1.5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-indigo-900/60 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/40 text-indigo-300 border border-indigo-500/30">
                  <Sliders className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    <span>Điều Chỉnh Tỷ Lệ Đạt Hiệu Quả SXKD Toàn Doanh Nghiệp</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Live Sliders
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Kéo thanh trượt để mô phỏng tác động kết quả kinh doanh lên 3 nhóm lương (Sản phẩm, Sản lượng, KPI)
                  </p>
                </div>
              </div>

              {/* Nút Đồng Bộ Hệ Số KPI Sang Bảng Lương */}
              <button
                onClick={handleSyncKpiToPayroll}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <DollarSign className="w-4 h-4" />
                <span>Đồng Bộ Thưởng KPI Sang Bảng Lương</span>
              </button>
            </div>

            {/* 4 Thanh Trượt Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-200">1. Toàn Công Ty:</span>
                  <span className="text-amber-400 font-bold font-mono">{companyRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="80" 
                  max="130" 
                  value={companyRate} 
                  onChange={(e) => setCompanyRate(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-200">2. Lương Sản Phẩm:</span>
                  <span className="text-indigo-300 font-bold font-mono">{productRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="80" 
                  max="130" 
                  value={productRate} 
                  onChange={(e) => setProductRate(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-200">3. Lương Doanh Thu:</span>
                  <span className="text-emerald-300 font-bold font-mono">{volumeRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="80" 
                  max="130" 
                  value={volumeRate} 
                  onChange={(e) => setVolumeRate(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-200">4. Lương KPI/OKR:</span>
                  <span className="text-purple-300 font-bold font-mono">{kpiRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="80" 
                  max="130" 
                  value={kpiRate} 
                  onChange={(e) => setKpiRate(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Bảng Dữ Liệu 3 Nhóm Lương */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-center w-12">STT</th>
                  <th className="p-3">Mã NV</th>
                  <th className="p-3">Họ Và Tên</th>
                  <th className="p-3">Phòng Ban</th>
                  <th className="p-3">Phân Loại Nhóm Lương</th>
                  <th className="p-3">Định Mức Chuẩn</th>
                  <th className="p-3">Mức Định Mức</th>
                  <th className="p-3 text-center">Tỷ Lệ Đạt</th>
                  <th className="p-3 text-right">Lương Sau Điều Chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedGroupRecords.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-slate-500">
                      {(groupPage - 1) * groupPageSize + idx + 1}
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-700">{rec.employeeCode}</td>
                    <td className="p-3 font-bold text-slate-900">{rec.employeeName}</td>
                    <td className="p-3 text-slate-600">{rec.departmentName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.groupType === 'PRODUCT' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        rec.groupType === 'VOLUME' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {rec.groupName}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{rec.baseMetric}</td>
                    <td className="p-3 font-mono text-slate-700">{rec.baseAmount.toLocaleString('vi-VN')} đ</td>
                    <td className="p-3 text-center font-bold text-indigo-700">{rec.appliedRatePercent}%</td>
                    <td className="p-3 text-right font-bold text-emerald-700 text-sm font-mono">
                      {rec.adjustedAmount.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalGroupPages > 1 && (
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <CompactPagination
                  currentPage={groupPage}
                  totalPages={totalGroupPages}
                  onPageChange={setGroupPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: THƯ VIỆN BẢN MÔ TẢ CÔNG VIỆC (JD) & KHUNG NĂNG LỰC CHỨC DANH
      ========================================================================= */}
      {activeTab === 'JD_LIBRARY' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* Header Banner & Tìm Kiếm JD */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Thư Viện Mô Tả Công Việc Chuẩn Chức Danh ({jobDescriptionsLibrary.length} Vị Trí)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Căn Cứ Thiết Lập KPI
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Chuẩn hóa cấu trúc 5 mục: Mục đích vị trí, Nhiệm vụ chính, Yêu cầu năng lực, Khung lương và Chỉ tiêu KPI liên kết
              </p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo chức danh, kỹ năng..."
                  value={jdSearchText}
                  onChange={(e) => {
                    setJdSearchText(e.target.value);
                    setJdPage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 outline-none text-xs w-56 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={jdDeptFilter}
                onChange={(e) => {
                  setJdDeptFilter(e.target.value);
                  setJdPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 outline-none text-xs bg-white"
              >
                <option value="ALL">Tất cả phòng ban / Khối</option>
                {jdDepartments.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lưới Thẻ JD (Grid 2 cột) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {paginatedJds.map((jd, idx) => (
              <div
                key={jd.id}
                className="bg-white p-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold flex items-center justify-center border border-emerald-100">
                          {(jdPage - 1) * jdPageSize + idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{jd.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{jd.departmentName}</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-700 font-semibold">{jd.id}</span>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                      {jd.minExperienceYears > 0 ? `≥ ${jd.minExperienceYears} năm KN` : 'Không yêu cầu KN'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{jd.summary}"
                  </p>

                  {/* 3 Nhiệm vụ chính đầu tiên */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 block">Nhiệm vụ & Trách nhiệm chính (Làm căn cứ KPI):</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                      {jd.keyResponsibilities.slice(0, 3).map((r, i) => (
                        <li key={i} className="line-clamp-1">{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Kỹ năng & Năng lực */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {jd.requiredSkills.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px]">
                    <span className="text-slate-400">Khung lương: </span>
                    <span className="font-bold text-slate-800">{jd.salaryRange}</span>
                  </div>

                  <button
                    onClick={() => setSelectedJdDetail(jd)}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem Bản Đầy Đủ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang Thư Viện JD */}
          {totalJdPages > 1 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Hiển thị {paginatedJds.length} trên tổng số {filteredJds.length} bản mô tả công việc (Trang {jdPage}/{totalJdPages})
              </span>
              <CompactPagination
                currentPage={jdPage}
                totalPages={totalJdPages}
                onPageChange={setJdPage}
              />
            </div>
          )}

          {/* MODAL CHI TIẾT BẢN MÔ TẢ CÔNG VIỆC (FULL JD MODAL) */}
          {selectedJdDetail && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6">
                <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Bản Mô Tả Công Việc Chuẩn Chức Danh • {selectedJdDetail.id}
                    </span>
                    <h3 className="font-bold text-base mt-0.5">{selectedJdDetail.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedJdDetail(null)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-2.5 space-y-1.5 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phòng ban / Bộ phận:</span>
                      <strong className="text-slate-900">{selectedJdDetail.departmentName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kinh nghiệm yêu cầu:</span>
                      <strong className="text-slate-900">≥ {selectedJdDetail.minExperienceYears} năm kinh nghiệm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Khung lương thị trường:</span>
                      <strong className="text-emerald-700 font-bold">{selectedJdDetail.salaryRange}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tiêu chuẩn KPI:</span>
                      <strong className="text-indigo-700 font-bold">Gắn 100% với mục tiêu quý</strong>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 mb-1">1. Mục Đích & Sứ Mệnh Vị Trí:</h5>
                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                      {selectedJdDetail.summary}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 mb-1.5">2. Danh Mục Nhiệm Vụ & Trách Nhiệm Cốt Lõi (Làm Căn Cứ Giao KPI):</h5>
                    <div className="space-y-1.5">
                      {selectedJdDetail.keyResponsibilities.map((resp: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-slate-800 font-medium">{resp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 mb-1.5">3. Khung Năng Lực & Kỹ Năng Yêu Cầu:</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJdDetail.requiredSkills.map((sk: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Khuyến nghị HR:</strong> Nhân sự giữ chức danh này khi làm báo cáo ngày nếu làm việc ngoài danh mục trên sẽ được tính là công việc phát sinh ngoài JD.
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedJdDetail(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: NỘP BÁO CÁO CÔNG VIỆC HẰNG NGÀY (BẮT BUỘC GẮN KPI HOẶC JD)
      ========================================================================= */}
      {showAddReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 text-slate-800 p-2 flex items-center justify-between border-b border-indigo-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Nộp Báo Cáo Công Việc Hằng Ngày</h3>
                  <p className="text-[10px] text-slate-300">Bắt buộc liên kết mục đích với Chỉ số KPI hoặc Mô tả công việc (JD)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDailyReport} className="p-2.5 space-y-1.5 text-xs max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nhân sự & Ngày làm việc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nhân sự nộp báo cáo *</label>
                  <select
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {employees.slice(0, 30).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.code} - {emp.fullName} ({emp.departmentName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày làm việc *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Tiêu đề công việc & Số giờ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề công việc đã làm *</label>
                  <input
                    type="text"
                    placeholder="VD: Rà soát phụ lục hợp đồng lao động tháng 9..."
                    value={formTaskTitle}
                    onChange={(e) => setFormTaskTitle(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số giờ thực hiện *</label>
                  <input
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={formSpentHours}
                    onChange={(e) => setFormSpentHours(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-center outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* KHỐI CHỌN MỤC ĐÍCH BẮT BUỘC: KPI HOẶC JD */}
              <div className="p-3.5 rounded-xl border-2 border-indigo-300 bg-indigo-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Mục Đích Công Việc (Bắt Buộc Chọn 1 Trong 2) *</span>
                  </label>
                  <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded border border-indigo-200">
                    Quy chuẩn MBO
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTargetType('KPI_METRIC')}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      formTargetType === 'KPI_METRIC'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>1. Gắn Với Chỉ Số KPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetType('JOB_DESCRIPTION')}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      formTargetType === 'JOB_DESCRIPTION'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>2. Gắn Với Mô Tả JD</span>
                  </button>
                </div>

                {/* Chi tiết nếu chọn KPI */}
                {formTargetType === 'KPI_METRIC' && (
                  <div className="space-y-2 pt-2 border-t border-indigo-200/80">
                    <div>
                      <label className="text-[11px] font-semibold text-indigo-900 block mb-1">Chỉ số KPI đóng góp:</label>
                      <select
                        value={formKpiName}
                        onChange={(e) => setFormKpiName(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-indigo-300 bg-white font-medium outline-none"
                      >
                        <option value="Chốt bảng công và chi trả lương đúng hạn trước ngày 05 hàng tháng">KPI: Chốt bảng công &amp; chi trả lương đúng hạn trước ngày 05 hàng tháng</option>
                        <option value="Tuân thủ 100% thời hạn pháp lý hợp đồng và hồ sơ lao động theo BLLĐ">KPI: Tuân thủ 100% thời hạn pháp lý hợp đồng &amp; hồ sơ lao động</option>
                        <option value="Đáp ứng 95% định biên nhân sự chất lượng cao đúng tiến độ kế hoạch">KPI: Tuyển dụng đạt 95% định biên nhân sự đúng kế hoạch</option>
                        <option value="Tỷ lệ máy móc sẵn sàng hoạt động đạt trên 98.5%, sự cố dừng máy < 2h">KPI: Tỷ lệ máy móc sẵn sàng &gt; 98.5%, dừng máy sự cố &lt; 2h</option>
                        <option value="Không để xảy ra bất kỳ khoản phạt vi phạm hành chính nào từ cơ quan quản lý">KPI: Báo cáo CQNN 100% đúng hạn, 0 khoản phạt hành chính</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-600 font-medium">Mức độ đóng góp tiến độ vào KPI này:</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={formKpiContribution}
                          onChange={(e) => setFormKpiContribution(Number(e.target.value))}
                          className="w-14 p-1 text-center font-bold border border-indigo-300 rounded bg-white"
                        />
                        <span className="text-indigo-800 font-bold">%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chi tiết nếu chọn JD */}
                {formTargetType === 'JOB_DESCRIPTION' && (
                  <div className="space-y-2 pt-2 border-t border-amber-200/80">
                    <div>
                      <label className="text-[11px] font-semibold text-amber-900 block mb-1">Nhiệm vụ thường nhật theo Bản mô tả công việc (JD):</label>
                      <input
                        type="text"
                        value={formJdDutyName}
                        onChange={(e) => setFormJdDutyName(e.target.value)}
                        placeholder="VD: Tiếp nhận hồ sơ lý lịch, trực văn phòng, hỗ trợ sự cố..."
                        className="w-full p-2 rounded-lg border border-amber-300 bg-white font-medium outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mô tả chi tiết kết quả */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả chi tiết kết quả công việc</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả cụ thể số lượng, đầu mục đã hoàn tất..."
                  value={formTaskDesc}
                  onChange={(e) => setFormTaskDesc(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 outline-none focus:ring-1 focus:ring-indigo-500 font-normal"
                />
              </div>

              {/* Trạng thái công việc */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block mb-1">Trạng thái hoàn thành *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('COMPLETED')}
                    className={`p-2 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                      formStatus === 'COMPLETED' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✓ Hoàn Thành
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('IN_PROGRESS')}
                    className={`p-2 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                      formStatus === 'IN_PROGRESS' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Đang Thực Hiện
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('BLOCKED')}
                    className={`p-2 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                      formStatus === 'BLOCKED' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ⚠️ Bị Kẹt (Cần Giúp)
                  </button>
                </div>

                {formStatus === 'BLOCKED' && (
                  <div className="pt-1">
                    <label className="font-bold text-rose-700 block mb-1">Mô tả vướng mắc / Khó khăn cần sếp gỡ kẹt *</label>
                    <input
                      type="text"
                      placeholder="VD: Chờ phòng vật tư cấp bổ sung phụ tùng thay thế..."
                      value={formBlockerReason}
                      onChange={(e) => setFormBlockerReason(e.target.value)}
                      className="w-full p-2 rounded-lg border border-rose-300 bg-rose-50 text-rose-900 font-semibold outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Nút lưu */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddReportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận Nộp Báo Cáo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: QUẢN LÝ / TRƯỞNG PHÒNG PHẢN HỒI & CHẤM SAO
      ========================================================================= */}
      {selectedReportForFeedback && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6">
            <div className="bg-indigo-900 text-white p-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-bold text-sm">Phản Hồi &amp; Đánh Giá Của Quản Lý</h3>
              </div>
              <button 
                onClick={() => setSelectedReportForFeedback(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2.5 space-y-1.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">{selectedReportForFeedback.employeeName}</strong>
                  <span className="text-slate-500 font-mono text-[10px]">{selectedReportForFeedback.employeeCode}</span>
                </div>
                <p className="font-semibold text-indigo-900 text-[11px]">{selectedReportForFeedback.taskTitle}</p>
                <p className="text-slate-600 text-[10px]">{selectedReportForFeedback.taskDescription}</p>
              </div>

              {/* Chấm điểm sao */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">Chấm điểm chất lượng hoàn thành (1 - 5 sao):</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star as any)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= feedbackRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-amber-700 ml-2">
                    {feedbackRating === 5 ? 'Xuất sắc (5/5)' :
                     feedbackRating === 4 ? 'Tốt (4/5)' :
                     feedbackRating === 3 ? 'Đạt chuẩn (3/5)' :
                     feedbackRating === 2 ? 'Cần cải thiện (2/5)' : 'Yếu (1/5)'}
                  </span>
                </div>
              </div>

              {/* Nhập lời nhận xét / Gỡ khó khăn */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Lời nhận xét &amp; Hướng dẫn tháo gỡ:</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Nhập nhận xét hoặc phương án hỗ trợ cho nhân sự..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Nút lưu */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedReportForFeedback(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveFeedback}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Gửi Nhận Xét &amp; Đánh Giá</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
