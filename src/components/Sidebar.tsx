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
    COMPANY_NOTICES: { vi: '01 Thông Báo & Bản Tin', en: '01. Announcements & Bulletin', zh: '01. 企业公告与快讯' },
    DASHBOARD: { vi: '02. B. Điều Khiển (Dashboard)', en: '02. Dashboard & Overview', zh: '02. 控制台大盘 (Dashboard)' },
    POLICY: { vi: '03. Bảng Quy Ước DN', en: '03. Company Policies', zh: '03. 规章制度管理' },
    CHECKLIST: { vi: '04. Khoản Đóng BHXH & Thuế', en: '04. Social Insurance & Tax', zh: '04. 社保与税费清单' },
    ORG_CHART: { vi: '05. SĐTC & Phòng Ban', en: '05. Organization Chart', zh: '05. 企业组织架构图' },
    RECRUITMENT: { vi: '06. Tuyển Dụng (ATS AI)', en: '06. Recruitment & ATS AI', zh: '06. 招聘管理 (ATS AI)' },
    TRAINING: { vi: '07. Đào Tạo Nội Bộ (LMS)', en: '07. Training Academy (LMS)', zh: '07. 培训学院 (LMS)' },
    EMPLOYEE_CONTRACTS: { vi: '08. Hồ Sơ & Hợp Đồng', en: '08. Profiles & Contracts', zh: '08. 人事档案与劳动合同' },
    EMPLOYEES: { vi: '08. Hồ Sơ & Hợp Đồng', en: '08. Profiles & Contracts', zh: '08. 人事档案与劳动合同' },
    CONTRACTS: { vi: '08. Hồ Sơ & Hợp Đồng', en: '08. Profiles & Contracts', zh: '08. 人事档案与劳动合同' },
    PERSONNEL_CHANGES: { vi: '09. Thủ Tục Biến Động NS', en: '09. Personnel Changes & Procedures', zh: '09. 人事手续与异动管理' },
    ATTENDANCE: { vi: '10. Chấm Công & Phân Ca', en: '10. Attendance & Shifts', zh: '10. 考勤排班与打卡' },
    REQUESTS: { vi: '11. Đăng Ký & Phê Duyệt', en: '11. Requests & Approvals', zh: '11. 申请与在线审批' },
    PAYROLL: { vi: '12. Bảng Lương & Tạm Ứng', en: '12. Payroll & Advance', zh: '12. 薪资核算与预支' },
    BANK_TRANSFER_AUDIT: { vi: '13. Kiểm Tra & Chuyển Khoản', en: '13. Bank Transfer Audit', zh: '13. 银行代发资金核对' },
    PERFORMANCE: { vi: '14. Công Việc & Hiệu Suất KPI', en: '14. Work Log & KPI Performance', zh: '14. 日常工作与绩效考核' },
    ACCOUNTING: { vi: '15. Hạch Toán Kế Toán (TT200)', en: '15. Payroll Accounting', zh: '15. 薪酬财务核算' },
    OFFBOARDING: { vi: '16. Thanh Lý & Nghỉ Việc', en: '16. Offboarding & Severance', zh: '16. 离职交接与补偿金' },
    TAX_YEARLY: { vi: '17. Quyết Toán Thuế TNCN', en: '17. Annual Tax Settlement', zh: '17. 年度个税汇算清缴' },
    GOV_REPORTS: { vi: '18. BC HCNS Đến CQNN', en: '18. Gov Compliance Reports', zh: '18. 政府机构合规报告' },
    ADMINISTRATION: { vi: '19. Hành Chính & ATVSLĐ', en: '19. Administration & Office', zh: '19. 综合行政管理' },
    FEEDBACK_LIST: { vi: '20. Bảng Theo Dõi Góp Ý', en: '20. User Feedback', zh: '20. 用户意见反馈' },
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
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || 
          (item.id === 'EMPLOYEE_CONTRACTS' && (activeTab === 'EMPLOYEES' || activeTab === 'CONTRACTS'));
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
              <span className="truncate">{item.label}</span>
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
      <aside className="hidden md:flex w-64 min-w-[16rem] max-w-[16rem] shrink-0 h-full bg-slate-900 text-slate-300 flex-col border-r border-slate-800 no-print select-none z-20 transition-none overflow-hidden">
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

          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-10 border-r border-slate-800 animate-in slide-in-from-left duration-200">
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
