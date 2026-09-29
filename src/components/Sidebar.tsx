import { 
  Megaphone,
  LayoutDashboard, 
  Users, 
  Clock, 
  FileSpreadsheet, 
  Sliders, 
  FileCheck, 
  UserMinus, 
  BadgePercent,
  MessageSquare,
  Network,
  ShieldAlert,
  Building2,
  UserCog,
  FileSignature,
  X
} from 'lucide-react';
import { UserRole } from '../types/hrm';
import { AppLanguage, languageService } from '../services/languageService';

export type NavTab = 
  | 'COMPANY_NOTICES'
  | 'DASHBOARD'
  | 'POLICY'
  | 'CHECKLIST'
  | 'ORG_CHART'
  | 'RECRUITMENT'
  | 'TRAINING'
  | 'EMPLOYEE_CONTRACTS'
  | 'EMPLOYEES'
  | 'CONTRACTS'
  | 'PERSONNEL_CHANGES'
  | 'ATTENDANCE'
  | 'REQUESTS'
  | 'PAYROLL'
  | 'BANK_TRANSFER_AUDIT'
  | 'PERFORMANCE'
  | 'ACCOUNTING'
  | 'OFFBOARDING'
  | 'TAX_YEARLY'
  | 'GOV_REPORTS'
  | 'ADMINISTRATION'
  | 'FEEDBACK_LIST';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole: UserRole;
  pendingRequestsCount: number;
  expiringContractsCount?: number;
  govReportsUrgentCount?: number;
  currentLanguage?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  onResetData?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  pendingRequestsCount,
  expiringContractsCount = 0,
  govReportsUrgentCount = 0,
  currentLanguage,
  onLanguageChange,
  onResetData,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const lang = currentLanguage || languageService.getLanguage();

  const labelsMap: Record<NavTab, { vi: string; en: string; zh: string }> = {
    COMPANY_NOTICES: { vi: 'Thông Báo & Bản Tin', en: 'Announcements & Bulletin', zh: '企业公告与快讯' },
    DASHBOARD: { vi: 'B. Điều Khiển (Dashboard)', en: 'Dashboard & Overview', zh: '控制台大盘 (Dashboard)' },
    POLICY: { vi: 'Bảng Quy Ước DN', en: 'Company Policies', zh: '规章制度管理' },
    CHECKLIST: { vi: 'Khoản Đóng BHXH & Thuế', en: 'Social Insurance & Tax', zh: '社保与税费清单' },
    ORG_CHART: { vi: 'SĐTC & Phòng Ban', en: 'Organization Chart', zh: '企业组织架构图' },
    RECRUITMENT: { vi: 'Tuyển Dụng (ATS AI)', en: 'Recruitment & ATS AI', zh: '招聘管理 (ATS AI)' },
    TRAINING: { vi: 'Đào Tạo Nội Bộ (LMS)', en: 'Training Academy (LMS)', zh: '培训学院 (LMS)' },
    EMPLOYEE_CONTRACTS: { vi: 'Hồ Sơ & Hợp Đồng', en: 'Profiles & Contracts', zh: '人事档案与劳动合同' },
    EMPLOYEES: { vi: 'Hồ Sơ & Hợp Đồng', en: 'Profiles & Contracts', zh: '人事档案与劳动合同' },
    CONTRACTS: { vi: 'Hồ Sơ & Hợp Đồng', en: 'Profiles & Contracts', zh: '人事档案与劳动合同' },
    PERSONNEL_CHANGES: { vi: 'Thủ Tục Biến Động NS', en: 'Personnel Changes & Procedures', zh: '人事手续与异动管理' },
    ATTENDANCE: { vi: 'Chấm Công & Phân Ca', en: 'Attendance & Shifts', zh: '考勤排班与打卡' },
    REQUESTS: { vi: 'Đăng Ký & Phê Duyệt', en: 'Requests & Approvals', zh: '申请与在线审批' },
    PAYROLL: { vi: 'Bảng Lương & Tạm Ứng', en: 'Payroll & Advance', zh: '薪资核算与预支' },
    BANK_TRANSFER_AUDIT: { vi: 'Kiểm Tra & Chuyển Khoản', en: 'Bank Transfer Audit', zh: '银行代发资金核对' },
    PERFORMANCE: { vi: 'Công Việc & Hiệu Suất KPI', en: 'Work Log & KPI Performance', zh: '日常工作与绩效考核' },
    ACCOUNTING: { vi: 'Hạch Toán Kế Toán (TT200)', en: 'Payroll Accounting', zh: '薪酬财务核算' },
    OFFBOARDING: { vi: 'Thanh Lý & Nghỉ Việc', en: 'Offboarding & Severance', zh: '离职交接与补偿金' },
    TAX_YEARLY: { vi: 'Quyết Toán Thuế TNCN', en: 'Annual Tax Settlement', zh: '年度个税汇算清缴' },
    GOV_REPORTS: { vi: 'BC HCNS Đến CQNN', en: 'Gov Compliance Reports', zh: '政府机构合规报告' },
    ADMINISTRATION: { vi: 'Hành Chính & ATVSLĐ', en: 'Administration & Office', zh: '综合行政管理' },
    FEEDBACK_LIST: { vi: 'Bảng Theo Dõi Góp Ý', en: 'User Feedback', zh: '用户意见反馈' },
  };

  const navItems: { id: NavTab; label: string; icon: any; roles?: UserRole[]; badge?: number }[] = [
    { id: 'COMPANY_NOTICES', label: labelsMap.COMPANY_NOTICES[lang] || labelsMap.COMPANY_NOTICES.vi, icon: Megaphone, badge: 1 },
    { id: 'DASHBOARD', label: labelsMap.DASHBOARD[lang] || labelsMap.DASHBOARD.vi, icon: LayoutDashboard },
    { id: 'POLICY', label: labelsMap.POLICY[lang] || labelsMap.POLICY.vi, icon: Sliders, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'PAYROLL_SPECIALIST', 'HR_ADMIN_HSE'] },
    { id: 'CHECKLIST', label: labelsMap.CHECKLIST[lang] || labelsMap.CHECKLIST.vi, icon: FileSpreadsheet },
    { id: 'ORG_CHART', label: labelsMap.ORG_CHART[lang] || labelsMap.ORG_CHART.vi, icon: Network },
    { id: 'RECRUITMENT', label: labelsMap.RECRUITMENT[lang] || labelsMap.RECRUITMENT.vi, icon: LayoutDashboard, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'HR_RECRUITMENT', 'PAYROLL_SPECIALIST'] },
    { id: 'TRAINING', label: labelsMap.TRAINING[lang] || labelsMap.TRAINING.vi, icon: FileSpreadsheet },
    { id: 'EMPLOYEE_CONTRACTS', label: labelsMap.EMPLOYEE_CONTRACTS[lang] || labelsMap.EMPLOYEE_CONTRACTS.vi, icon: Users, badge: expiringContractsCount, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'PAYROLL_SPECIALIST', 'HR_RECRUITMENT', 'HR_ADMIN_HSE', 'DEPT_HEAD', 'FACTORY_MANAGER'] },
    { id: 'PERSONNEL_CHANGES', label: labelsMap.PERSONNEL_CHANGES[lang] || labelsMap.PERSONNEL_CHANGES.vi, icon: UserCog, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'PAYROLL_SPECIALIST', 'HR_ADMIN_HSE', 'DEPT_HEAD', 'FACTORY_MANAGER'] },
    { id: 'ATTENDANCE', label: labelsMap.ATTENDANCE[lang] || labelsMap.ATTENDANCE.vi, icon: Clock },
    { id: 'REQUESTS', label: labelsMap.REQUESTS[lang] || labelsMap.REQUESTS.vi, icon: FileCheck, badge: pendingRequestsCount },
    { id: 'PAYROLL', label: labelsMap.PAYROLL[lang] || labelsMap.PAYROLL.vi, icon: BadgePercent, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'PAYROLL_SPECIALIST', 'EMPLOYEE'] },
    { id: 'BANK_TRANSFER_AUDIT', label: labelsMap.BANK_TRANSFER_AUDIT[lang] || labelsMap.BANK_TRANSFER_AUDIT.vi, icon: ShieldAlert, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'PAYROLL_SPECIALIST'] },
    { id: 'PERFORMANCE', label: labelsMap.PERFORMANCE[lang] || labelsMap.PERFORMANCE.vi, icon: BadgePercent },
    { id: 'ACCOUNTING', label: labelsMap.ACCOUNTING[lang] || labelsMap.ACCOUNTING.vi, icon: FileSpreadsheet, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'PAYROLL_SPECIALIST'] },
    { id: 'OFFBOARDING', label: labelsMap.OFFBOARDING[lang] || labelsMap.OFFBOARDING.vi, icon: UserMinus, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'PAYROLL_SPECIALIST', 'HR_ADMIN_HSE'] },
    { id: 'TAX_YEARLY', label: labelsMap.TAX_YEARLY[lang] || labelsMap.TAX_YEARLY.vi, icon: FileSpreadsheet, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'PAYROLL_SPECIALIST'] },
    { id: 'GOV_REPORTS', label: labelsMap.GOV_REPORTS[lang] || labelsMap.GOV_REPORTS.vi, icon: Building2, badge: govReportsUrgentCount, roles: ['GENERAL_DIRECTOR', 'HR_MANAGER', 'PAYROLL_SPECIALIST', 'HR_ADMIN_HSE'] },
    { id: 'ADMINISTRATION', label: labelsMap.ADMINISTRATION[lang] || labelsMap.ADMINISTRATION.vi, icon: Building2 },
    { id: 'FEEDBACK_LIST', label: labelsMap.FEEDBACK_LIST[lang] || labelsMap.FEEDBACK_LIST.vi, icon: MessageSquare },
  ];

  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(currentRole));

  const headerTitle = lang === 'en' ? 'HRM Enterprise Suite' : lang === 'zh' ? 'HRM 人力资源系统' : 'Hệ Thống Phân Hệ HRM';
  const headerSubtitle = lang === 'en' ? 'HR Operations & Governance' : lang === 'zh' ? '人力资源治理与运营' : 'Quản Trị Và Vận Hành Nhân Sự';

  const renderNavList = (isMobileMode = false) => (
    <nav className="flex-1 px-2.5 py-2 flex flex-col justify-between overflow-y-auto no-scrollbar">
      {visibleItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || 
          (item.id === 'EMPLOYEE_CONTRACTS' && (activeTab === 'EMPLOYEES' || activeTab === 'CONTRACTS'));
        const displayIndex = String(index + 1).padStart(2, '0');
        const displayLabel = `${displayIndex}. ${item.label}`;
        return (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              if (isMobileMode && onCloseMobile) {
                onCloseMobile();
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:bg-slate-800 hover:text-white text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2.5 truncate">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{displayLabel}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="px-1.5 py-0.2 text-[9.5px] font-bold rounded-full bg-rose-500 text-white shrink-0 ml-1">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 min-w-[16rem] max-w-[16rem] shrink-0 h-full bg-slate-900/95 backdrop-blur-2xl text-slate-300 shadow-2xl flex-col border-r border-slate-800 no-print select-none z-20 transition-none overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-slate-800 shrink-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{headerTitle}</p>
          <p className="text-xs text-slate-500 mt-0.5">{headerSubtitle}</p>
        </div>
        {renderNavList(false)}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile}
          />

          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900/95 backdrop-blur-2xl text-slate-300 shadow-2xl flex flex-col shadow-2xl z-10 border-r border-slate-800 animate-in slide-in-from-left duration-200">
            <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{headerTitle}</p>
                <p className="text-xs text-slate-500 mt-0.5">{headerSubtitle}</p>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderNavList(true)}
          </aside>
        </div>
      )}
    </>
  );
};
