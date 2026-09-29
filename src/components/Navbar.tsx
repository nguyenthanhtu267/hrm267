import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UserRole, CompanyPolicy, Employee, AttendanceRecord, WorkflowRequest, PersonnelChange } from '../types/hrm';
import { 
  Building2, 
  ShieldCheck, 
  MessageSquarePlus,
  MessageSquare, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCheck,
  TrendingUp,
  FileText,
  ShieldAlert,
  Palette,
  ExternalLink,
  Menu,
  ChevronRight,
  ChevronDown,
  Layers,
  List,
  Filter,
  DollarSign,
  UserCheck,
  Briefcase,
  Utensils,
  HelpCircle,
  Wrench,
  Search,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { LegalFloatingWidget } from './LegalFloatingWidget';
import { ThemeModal } from './ThemeModal';
import { WorkTimeTracker } from './WorkTimeTracker';
import { NavTab } from './Sidebar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AppLanguage } from '../services/languageService';
import { smartTriggerService, SmartNotification, SmartNotificationPriority } from '../services/smartTriggerService';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentTenantId: string;
  onTenantChange: (tenantId: string) => void;
  onOpenFeedback: () => void;
  onOpenMessenger?: () => void;
  onResetData: () => void;
  onNavigate?: (tab: NavTab) => void;
  currentLanguage?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
  onToggleMobileSidebar?: () => void;
  policies?: CompanyPolicy[];
  employees?: Employee[];
  attendance?: AttendanceRecord[];
  requests?: WorkflowRequest[];
  personnelChanges?: PersonnelChange[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentTenantId,
  onTenantChange,
  onOpenFeedback,
  onOpenMessenger,
  onResetData,
  onNavigate,
  currentLanguage,
  onLanguageChange,
  onToggleMobileSidebar,
  policies = [],
  employees = [],
  attendance = [],
  requests = [],
  personnelChanges = [],
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showUtilityDropdown, setShowUtilityDropdown] = useState(false);
  const [showMobileSystemSheet, setShowMobileSystemSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [filterPriority, setFilterPriority] = useState<'ALL' | SmartNotificationPriority>('ALL');
  const [viewMode, setViewMode] = useState<'GROUPED' | 'DETAILED'>('GROUPED');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [cbIsGeneralHr, setCbIsGeneralHr] = useState(true);
  const [readVersion, setReadVersion] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const utilityRef = useRef<HTMLDivElement>(null);

  // Tự động đóng dropdown thông báo khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (utilityRef.current && !utilityRef.current.contains(e.target as Node)) {
        setShowUtilityDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

    // Phím tắt Ctrl + K mở tìm kiếm nhanh Spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchDropdown(prev => !prev);
        const searchInput = document.getElementById('navbar-spotlight-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Danh mục 20 phân hệ chức năng cho tìm kiếm nhanh
  const navQuickItems: { tab: NavTab; label: string; desc: string; icon: string }[] = [
    { tab: 'COMPANY_NOTICES', label: '01. Thông Báo & Bản Tin', desc: 'Bản tin doanh nghiệp, công đoàn, khen thưởng', icon: '📢' },
    { tab: 'DASHBOARD', label: '02. B. Điều Khiển (Dashboard)', desc: 'Chỉ số nhân sự, cảnh báo & biểu đồ phân tích', icon: '📊' },
    { tab: 'POLICY', label: '03. Bảng Quy Ước DN', desc: 'Chính sách công ty, thuế, bảo hiểm, trần OT', icon: '📜' },
    { tab: 'CHECKLIST', label: '04. Khoản Đóng BHXH & Thuế', desc: 'Tỷ lệ trích nộp BHXH, BHYT, BHTN, công đoàn', icon: '📋' },
    { tab: 'ORG_CHART', label: '05. Sơ Đồ Tổ Chức & Phòng Ban', desc: 'Sơ đồ hình cây & cơ cấu định biên nhân sự', icon: '🏢' },
    { tab: 'RECRUITMENT', label: '06. Tuyển Dụng (ATS AI)', desc: 'Chiến dịch tuyển dụng, phỏng vấn, hồ sơ ứng viên', icon: '🎯' },
    { tab: 'TRAINING', label: '07. Đào Tạo Nội Bộ (LMS)', desc: 'Khóa học hội nhập, chứng chỉ an toàn lao động', icon: '🎓' },
    { tab: 'EMPLOYEES', label: '08. Hồ Sơ & Hợp Đồng', desc: 'Danh sách nhân sự, mã nhân viên, hợp đồng lao động', icon: '👥' },
    { tab: 'PERSONNEL_CHANGES', label: '09. Thủ Tục Biến Động NS', desc: 'Điều chuyển phòng ban, bổ nhiệm, nâng lương', icon: '🔄' },
    { tab: 'ATTENDANCE', label: '10. Chấm Công & Phần Ca', desc: 'Bảng công tháng, tăng ca, điểm danh ca làm việc', icon: '⏱️' },
    { tab: 'REQUESTS', label: '11. Đăng Ký & Phê Duyệt', desc: 'Đơn nghỉ phép, làm thêm giờ, đổi ca, công tác', icon: '📝' },
    { tab: 'PAYROLL', label: '12. Bảng Lương & Tạm Ứng', desc: 'Bảng lương chi tiết, thuế TNCN, tạm ứng lương', icon: '💰' },
    { tab: 'BANK_TRANSFER_AUDIT', label: '13. Kiểm Tra & Chuyển Khoản', desc: 'Đối soát tài khoản ngân hàng, lệnh chi lương', icon: '🏦' },
    { tab: 'PERFORMANCE', label: '14. Hiệu Suất KPI & Đánh Giá', desc: 'Đánh giá KPI tháng/quý, xếp loại hoàn thành việc', icon: '🏆' },
    { tab: 'ACCOUNTING', label: '15. Hạch Toán Kế Toán (TT200)', desc: 'Bút toán chi phí lương TK 334, 642, bảo hiểm', icon: '📑' },
    { tab: 'OFFBOARDING', label: '16. Thanh Lý & Nghỉ Việc', desc: 'Quyết định thôi việc, trợ cấp mất việc, bàn giao', icon: '🚪' },
    { tab: 'TAX_YEARLY', label: '17. Quyết Toán Thuế TNCN', desc: 'Ủy quyền quyết toán thuế cuối năm, khấu trừ', icon: '📊' },
    { tab: 'GOV_REPORTS', label: '18. BC HCNS Đến CQNN', desc: 'Báo cáo lao động Sở LĐ-TB&XH, bảo hiểm xã hội', icon: '🏛️' },
    { tab: 'ADMINISTRATION', label: '19. Hành Chính & ATVSLĐ', desc: 'Quản lý tài sản, trang thiết bị bảo hộ lao động', icon: '🛡️' },
    { tab: 'FEEDBACK_LIST', label: '20. Bảng Theo Dõi Góp Ý', desc: 'Hòm thư điện tử tiếp nhận phản hồi & cải tiến', icon: '💡' }
  ];

  // Lọc kết quả tìm kiếm thông minh (Phân hệ & Nhân sự)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        tabs: navQuickItems.slice(0, 6),
        employees: []
      };
    }
    const matchedTabs = navQuickItems.filter(item => 
      item.label.toLowerCase().includes(q) || 
      item.desc.toLowerCase().includes(q)
    );
    const matchedEmployees = (employees || []).filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q) ||
      (e.department && e.department.toLowerCase().includes(q)) ||
      (e.position && e.position.toLowerCase().includes(q))
    ).slice(0, 5);

    return {
      tabs: matchedTabs.slice(0, 8),
      employees: matchedEmployees
    };
  }, [searchQuery, employees]);

  const currentPolicy = useMemo(() => {
    return policies.find(p => p.tenantId === currentTenantId) || policies[0] || {
      tenantId: currentTenantId,
      companyName: 'Công ty',
      standardWorkDaysPerMonth: 24,
      dailyWorkHours: 8,
      otDayNormalRate: 1.5,
      otDayWeekendRate: 2.0,
      otDayHolidayRate: 3.0,
      nightWorkBonusRate: 0.3,
      lateGraceMinutes: 5,
      lateRuleLevel1Minutes: 15,
      lateRuleLevel2Minutes: 30,
      mealAllowanceDaily: 35000,
      mealAllowanceMonthly: 730000,
      phoneAllowanceMonthly: 500000,
      toxicAllowanceLevel1: 200000,
      toxicAllowanceLevel2: 350000,
      toxicAllowanceLevel3: 500000,
      toxicAllowanceLevel4: 700000,
      annualLeaveDaysDefault: 12,
      seniorityLeaveStepYears: 5,
      probationSalaryRate: 0.85,
      saturdayPolicy: 'MORNING_ONLY',
      otMonthlyCapHours: 40,
      autoLockOtAtMonthlyCap: false
    } as CompanyPolicy;
  }, [policies, currentTenantId]);

  // Sinh danh sách Cảnh Báo Thông Minh theo thời gian thực có lọc theo vai trò & chế độ xem
  const smartNotifications = useMemo(() => {
    return smartTriggerService.generateTriggers({
      employees,
      attendance,
      requests,
      policy: currentPolicy,
      personnelChanges,
      tenantId: currentTenantId,
      userRole: currentRole,
      cbIsGeneralHr,
      viewMode,
    });
  }, [employees, attendance, requests, currentPolicy, personnelChanges, currentTenantId, currentRole, cbIsGeneralHr, viewMode, readVersion]);

  // Thống kê số lượng cảnh báo
  const unreadCount = smartNotifications.filter(n => !n.isRead).length;
  const urgentCount = smartNotifications.filter(n => n.priority === 'URGENT' && !n.isRead).length;
  const actionCount = smartNotifications.filter(n => n.priority === 'ACTION_REQUIRED' && !n.isRead).length;
  const infoCount = smartNotifications.filter(n => n.priority === 'INFO' && !n.isRead).length;

  // Lọc theo tab phân loại
  const displayedNotifications = useMemo(() => {
    if (filterPriority === 'ALL') return smartNotifications;
    return smartNotifications.filter(n => n.priority === filterPriority);
  }, [smartNotifications, filterPriority]);

  // Toggle mở/đóng thẻ nhóm Accordion
  const toggleGroupExpand = (groupId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Xử lý khi bấm vào 1 cảnh báo hoặc nút Hành Động
  const handleActionClick = (n: SmartNotification | { id: string; targetTab?: NavTab; isRead?: boolean }) => {
    smartTriggerService.markAsRead(n.id);
    setReadVersion(v => v + 1);
    setShowNotifDropdown(false);
    if (onNavigate && n.targetTab) {
      onNavigate(n.targetTab);
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = () => {
    const allIds: string[] = [];
    smartNotifications.forEach(n => {
      allIds.push(n.id);
      if (n.children) {
        n.children.forEach(c => allIds.push(c.id));
      }
    });
    smartTriggerService.markAllAsRead(allIds);
    setReadVersion(v => v + 1);
  };

  const roleDisplayNames: Record<UserRole, string> = {
    GENERAL_DIRECTOR: 'Tổng Giám Đốc (Lãnh Đạo)',
    HR_MANAGER: 'Trưởng Phòng Nhân Sự (Quyền Cao Nhất)',
    HR_RECRUITMENT: 'Chuyên Viên Tuyển Dụng & Đào Tạo',
    HR_ADMIN_HSE: 'Chuyên Viên Hành Chính & HSE',
    PAYROLL_SPECIALIST: 'Chuyên Viên Tiền Lương & C&B',
    DEPT_HEAD: 'Trưởng Các Phòng Ban (Quản Đốc)',
    FACTORY_MANAGER: 'Quản Lý Phân Xưởng',
    DEPT_SECRETARY: 'Thư Ký Phòng Ban (Gom Đơn)',
    EMPLOYEE: 'Từng Nhân Viên (Góc Nhìn ESS)',
  };

  const roleShortNames: Record<UserRole, string> = {
    GENERAL_DIRECTOR: 'Tổng Giám Đốc',
    HR_MANAGER: 'TP. Nhân Sự',
    HR_RECRUITMENT: 'Tuyển Dụng & ĐT',
    HR_ADMIN_HSE: 'Hành Chính & HSE',
    PAYROLL_SPECIALIST: 'Tiền Lương & C&B',
    DEPT_HEAD: 'Trưởng Phòng',
    FACTORY_MANAGER: 'QL Phân Xưởng',
    DEPT_SECRETARY: 'Thư Ký',
    EMPLOYEE: 'Nhân Viên',
  };

  const currentCompany = useMemo(() => {
    return policies.find(p => p.tenantId === currentTenantId)?.companyName || 'An Việt Manufacturing';
  }, [policies, currentTenantId]);

  const currentCompanyShort = useMemo(() => {
    if (currentCompany.includes('An Việt')) return 'An Việt Mfg';
    if (currentCompany.includes('DigiTech')) return 'DigiTech';
    return currentCompany.length > 14 ? currentCompany.slice(0, 12) + '…' : currentCompany;
  }, [currentCompany]);

  return (
        <header className="sticky top-0 z-30 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-3 sm:px-5 py-2 transition-all select-none">
      <div className="flex items-center justify-between gap-2.5 w-full">
        {/* LOGO & THƯƠNG HIỆU */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs"
            title="Mở menu quản trị"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo rút gọn trên Mobile */}
          <span className="sm:hidden font-black text-sm text-slate-900 tracking-tight shrink-0">
            HRM
          </span>

          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight">HRM Việt Enterprise</span>
              <span className="px-2 py-0.5 text-[10.5px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                SaaS v3.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">Quản Trị Và Vận Hành Nhân Sự</p>
          </div>
        </div>

        {/* TOÀN BỘ CỤM ĐIỀU HƯỚNG & TIỆN ÍCH */}
        <div className="flex-1 flex items-center justify-center gap-2 overflow-visible py-0.5 min-w-0">
          
          {/* 1. TRÊN MÀN HÌNH LỚN (DESKTOP >= 1280px): HIỂN THỊ ĐỦ 5 CỘT NHƯ CŨ */}
          <div className="hidden xl:grid flex-1 grid-cols-5 gap-2 min-w-0">
            
            {/* 1. DOANH NGHIỆP */}
            <div className="w-full h-11 flex flex-col items-center justify-center px-2 py-0.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs text-center">
              <div className="flex items-center justify-center space-x-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>DOANH NGHIỆP</span>
              </div>
              <select 
                value={currentTenantId} 
                onChange={(e) => onTenantChange(e.target.value)}
                className="text-center text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500 rounded w-full truncate leading-none text-center"
              >
                {policies.length > 0 ? (
                  policies.map(p => (
                    <option key={p.tenantId} value={p.tenantId} className="text-center">
                      {p.companyName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="TENANT-ASIAFOODS">An Việt Manufacturing</option>
                    <option value="TENANT-DIGITECH">DigiTech</option>
                  </>
                )}
              </select>
            </div>

            {/* 2. CẤP QUẢN TRỊ */}
            <div className="w-full h-11 flex flex-col items-center justify-center px-2 py-0.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs text-center">
              <div className="flex items-center justify-center space-x-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider leading-none mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>CẤP QUẢN TRỊ</span>
              </div>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="text-center text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500 rounded w-full truncate leading-none text-center"
                title="Phân quyền quản trị hệ thống"
              >
                <optgroup label="🏛️ BAN GIÁM ĐỐC">
                  <option value="GENERAL_DIRECTOR">Tổng Giám Đốc (Lãnh Đạo)</option>
                </optgroup>
                
                <optgroup label="👑 KHỐI NHÂN SỰ">
                  <option value="HR_MANAGER">Trưởng Phòng Nhân Sự</option>
                  <option value="HR_RECRUITMENT">CV Tuyển Dụng & Đào Tạo</option>
                  <option value="HR_ADMIN_HSE">CV Hành Chính & CQNN</option>
                  <option value="PAYROLL_SPECIALIST">CV Tiền Lương & C&B</option>
                </optgroup>

                <optgroup label="🏢 KHỐI VẬN HÀNH">
                  <option value="DEPT_HEAD">Trưởng Phòng Ban (Quản Đốc)</option>
                  <option value="DEPT_SECRETARY">Thư Ký Phòng Ban</option>
                </optgroup>

                <optgroup label="👤 NHÂN VIÊN">
                  <option value="EMPLOYEE">Từng Nhân Viên (ESS)</option>
                </optgroup>
              </select>
            </div>

            {/* 3. THỜI GIAN HOẠT ĐỘNG */}
            <div className="w-full flex items-center justify-center">
              <WorkTimeTracker className="w-full" />
            </div>

            {/* 5. TRA CỨU LUẬT (CĂN CỨ PHÁP LÝ) */}
            <div className="w-full flex items-center justify-center">
              <LegalFloatingWidget className="w-full" />
            </div>

            {/* 6. TIỆN ÍCH HỖ TRỢ */}
            <div className="relative w-full" ref={utilityRef}>
              <button
                onClick={() => setShowUtilityDropdown(!showUtilityDropdown)}
                className="w-full h-11 flex flex-col items-center justify-center px-2 py-0.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all shadow-xs cursor-pointer text-center"
                title="Tiện ích & Trợ giúp: Zalo Kỹ thuật, Góp ý báo lỗi, Giao diện & Font"
              >
                <div className="flex items-center justify-center space-x-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider leading-none mb-1">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                  <span>TIỆN ÍCH</span>
                </div>
                <div className="flex items-center justify-center space-x-0.5 text-xs font-bold text-slate-900 leading-none">
                  <span>Hỗ Trợ</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
              </button>

            {showUtilityDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 text-left">
                <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tiện Ích & Trợ Giúp
                </div>

                {/* Zalo Admin */}
                <a
                  href="http://zalo.me/0963084246"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowUtilityDropdown(false)}
                  className="flex items-center space-x-3 px-3.5 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Zalo Kỹ Thuật Admin</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">+84 963-084-246</div>
                  </div>
                </a>

                {/* Góp Ý / Báo Lỗi */}
                <button
                  onClick={() => {
                    setShowUtilityDropdown(false);
                    onOpenFeedback();
                  }}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 hover:bg-amber-50 text-slate-700 hover:text-amber-800 transition-colors group cursor-pointer text-left"
                >
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700 group-hover:bg-amber-200">
                    <MessageSquarePlus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-amber-800">Góp Ý / Báo Lỗi</div>
                    <div className="text-[11px] text-slate-500">Gửi phản hồi nhanh cho đội ngũ</div>
                  </div>
                </button>

                {/* Đổi Giao Diện & Font */}
                <button
                  onClick={() => {
                    setShowUtilityDropdown(false);
                    setShowThemeModal(true);
                  }}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 transition-colors group cursor-pointer text-left"
                >
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-800">Giao Diện & Font Chữ</div>
                    <div className="text-[11px] text-slate-500">Chế độ Sáng/Tối & Bộ font</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. TRÊN MÀN HÌNH DI ĐỘNG & TABLET (< 1280px / xl): QUICK STATUS PILL GỌN ĐẸP */}
        <div className="xl:hidden flex items-center justify-center flex-1 min-w-0 px-0.5">
          <button
            onClick={() => setShowMobileSystemSheet(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95 max-w-full truncate"
            title="Chạm để mở Cài Đặt Hệ Thống, Đổi Doanh Nghiệp & Cấp Quản Trị"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-800 truncate max-w-[85px] sm:max-w-[140px]">
              {currentCompanyShort}
            </span>
            <span className="text-slate-300 text-xs shrink-0">•</span>
            <span className="text-[11px] font-semibold text-indigo-700 truncate max-w-[85px] sm:max-w-[140px]">
              {roleShortNames[currentRole] || 'Quản trị'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
          </button>
        </div>
      </div>

        {/* CỤM CÔNG CỤ BÊN PHẢI (CHAT, CHUÔNG, CỜ) - ĐỒNG BỘ GAP-2 */}
        <div className="flex items-center gap-2 shrink-0">

          {/* 7. NÚT HỘP TIN NHẮN DOANH NGHIỆP & SỔ NHẮC VIỆC THÔNG MINH */}
          <button
            onClick={onOpenMessenger}
            className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 shadow-xs transition-colors relative cursor-pointer shrink-0"
            title="Hộp Tin Nhắn Doanh Nghiệp & Sổ Nhắc Việc Thông Minh (Tự động dọn dẹp sau 30 ngày • Lưu vĩnh viễn nhắc việc)"
          >
            <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 bg-rose-500 text-white rounded-full text-[9.5px] font-bold flex items-center justify-center shadow-xs border-2 border-white">
              2
            </span>
          </button>

          {/* 9. TRUNG TÂM CHUÔNG CẢNH BÁO THÔNG MINH (SMART TRIGGER COMMAND CENTER) */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all shadow-xs relative cursor-pointer shrink-0 ${
                unreadCount > 0 
                  ? urgentCount > 0
                    ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100' 
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Trung Tâm Cảnh Báo Thông Minh: Tự động định tuyến theo quyền hạn vai trò, hỗ trợ xem gom nhóm & soi chi tiết"
            >
              <Bell className={`w-4.5 h-4.5 ${unreadCount > 0 ? (urgentCount > 0 ? 'text-rose-600' : 'text-indigo-600') : 'text-slate-600'}`} />
              
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full text-white font-extrabold text-[9.5px] flex items-center justify-center shadow-xs border-2 border-white ${
                  urgentCount > 0 ? 'bg-rose-600' : 'bg-indigo-600'
                }`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-96 sm:w-[480px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header Trung Tâm Chuông */}
                <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          Trung Tâm Cảnh Báo Thông Minh
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                            Smart Hub v3.1
                          </span>
                        </h3>
                        <p className="text-[10px] text-slate-300 flex items-center gap-1">
                          <span>Quyền hạn:</span>
                          <strong className="text-amber-300 font-semibold">{roleDisplayNames[currentRole]}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold text-indigo-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 border border-indigo-400/20"
                          title="Đánh dấu tất cả cảnh báo đã đọc"
                        >
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                          <span>Đã đọc hết</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thanh điều khiển kép: Bộ lọc Tabs + Nút chuyển chế độ xem (Nhóm gộp <-> Chi tiết) */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-indigo-900/50 gap-2">
                    {/* Tabs Phân Loại Cấp Độ */}
                    <div className="flex items-center space-x-1 text-[10px] flex-1 overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => setFilterPriority('ALL')}
                        className={`py-1 px-2 rounded-lg font-medium text-center transition-all shrink-0 flex items-center gap-1 ${
                          filterPriority === 'ALL'
                            ? 'bg-white text-slate-900 font-bold shadow-xs'
                            : 'bg-white/10 text-slate-200 hover:bg-white/20'
                        }`}
                      >
                        <span>Tất cả</span>
                        <span className="px-1 py-0.2 rounded-full text-[9px] bg-slate-700/80 text-white">
                          {smartNotifications.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setFilterPriority('URGENT')}
                        className={`py-1 px-2 rounded-lg font-medium text-center transition-all shrink-0 flex items-center gap-1 ${
                          filterPriority === 'URGENT'
                            ? 'bg-rose-600 text-white font-bold shadow-xs'
                            : 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/50 border border-rose-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <span>Khẩn cấp</span>
                        {urgentCount > 0 && (
                          <span className="px-1 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-bold">
                            {urgentCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setFilterPriority('ACTION_REQUIRED')}
                        className={`py-1 px-2 rounded-lg font-medium text-center transition-all shrink-0 flex items-center gap-1 ${
                          filterPriority === 'ACTION_REQUIRED'
                            ? 'bg-amber-600 text-white font-bold shadow-xs'
                            : 'bg-amber-950/40 text-amber-200 hover:bg-amber-900/50 border border-amber-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>Cần xử lý</span>
                        {actionCount > 0 && (
                          <span className="px-1 py-0.2 rounded-full text-[9px] bg-amber-500 text-white font-bold">
                            {actionCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setFilterPriority('INFO')}
                        className={`py-1 px-2 rounded-lg font-medium text-center transition-all shrink-0 flex items-center gap-1 ${
                          filterPriority === 'INFO'
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50 border border-emerald-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Thông tin</span>
                      </button>
                    </div>

                    {/* Nút Chuyển Đổi Góc Nhìn: Gom nhóm <-> Chi tiết */}
                    <div className="flex items-center bg-black/30 p-0.5 rounded-lg border border-white/10 shrink-0">
                      <button
                        onClick={() => setViewMode('GROUPED')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
                          viewMode === 'GROUPED'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        title="Chế độ xem gom nhóm thông minh: Gom các sự việc cùng loại thành 1 thẻ mở rộng"
                      >
                        <Layers className="w-3 h-3" />
                        <span className="hidden sm:inline">Gom nhóm</span>
                      </button>
                      <button
                        onClick={() => setViewMode('DETAILED')}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
                          viewMode === 'DETAILED'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        title="Chế độ xem chi tiết từng người: Hiển thị từng dòng cho từng nhân sự"
                      >
                        <List className="w-3 h-3" />
                        <span className="hidden sm:inline">Từng người</span>
                      </button>
                    </div>
                  </div>

                  {/* Tùy chọn kiêm nhiệm toàn quyền HR khi ở vai trò C&B */}
                  {currentRole === 'PAYROLL_SPECIALIST' && (
                    <div className="mt-2 pt-2 border-t border-indigo-900/40 flex items-center justify-between text-[10px]">
                      <span className="text-slate-300">Công ty ít người: Kiêm nhiệm toàn quyền HR?</span>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={cbIsGeneralHr}
                          onChange={(e) => setCbIsGeneralHr(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="text-indigo-200 font-bold">{cbIsGeneralHr ? 'Đang BẬT (Full quyền HR)' : 'TẮT (Chỉ Tiền Lương)'}</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Danh Sách Cảnh Báo Thông Minh (Smart Cards) */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5 max-h-[55vh]">
                  {displayedNotifications.length === 0 ? (
                    <div className="py-8 text-center px-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Không có cảnh báo tồn đọng cho vai trò này!</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Mọi thủ tục thuộc phạm vi trách nhiệm của {roleDisplayNames[currentRole]} đều đang hoàn tất hoặc trong ngưỡng an toàn.
                      </p>
                    </div>
                  ) : (
                    displayedNotifications.map((n) => {
                      const isUrgent = n.priority === 'URGENT';
                      const isActionReq = n.priority === 'ACTION_REQUIRED';
                      const isGroupExpanded = expandedGroups[n.id] ?? false;

                      return (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border transition-all relative group ${
                            !n.isRead 
                              ? isUrgent
                                ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-50' 
                                : isActionReq
                                  ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                                  : 'bg-indigo-50/40 border-indigo-100 hover:bg-indigo-50/70'
                              : 'bg-white border-slate-200/80 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            {/* Icon Cấp độ */}
                            <div className="mt-0.5 shrink-0">
                              {isUrgent ? (
                                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                                  <AlertCircle className="w-4 h-4 text-rose-600" />
                                </div>
                              ) : isActionReq ? (
                                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                                  <Clock className="w-4 h-4 text-amber-700" />
                                </div>
                              ) : n.category === 'PAYROLL' ? (
                                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                                  <DollarSign className="w-4 h-4 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                                  <Sparkles className="w-4 h-4 text-indigo-600" />
                                </div>
                              )}
                            </div>

                            {/* Nội dung thông báo */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex items-center space-x-1.5 flex-wrap">
                                  {/* Cấp độ badge */}
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    isUrgent
                                      ? 'bg-rose-600 text-white'
                                      : isActionReq
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-emerald-600 text-white'
                                  }`}>
                                    {isUrgent ? 'Khẩn cấp' : isActionReq ? 'Cần xử lý' : 'Thông tin'}
                                  </span>

                                  {/* Nhãn thẻ Gom Nhóm Thông Minh */}
                                  {n.isGroup && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                                      <Layers className="w-2.5 h-2.5" />
                                      <span>Gộp {n.groupCount} nhân sự</span>
                                    </span>
                                  )}

                                  {/* Căn cứ pháp lý */}
                                  {n.legalBasis && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-200/70 text-slate-700">
                                      {n.legalBasis}
                                    </span>
                                  )}
                                </div>

                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                  {n.timeAgo}
                                </span>
                              </div>

                              <h4 className={`text-xs leading-snug ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                {n.title}
                              </h4>
                              
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                {n.desc}
                              </p>

                              {/* Hàng nút hành động: Xem chi tiết mở rộng + Nút 1-Click Action */}
                              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60">
                                <div>
                                  {n.isGroup && n.children && n.children.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={(e) => toggleGroupExpand(n.id, e)}
                                      className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      {isGroupExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                      <span>{isGroupExpanded ? 'Thu gọn danh sách' : `Xem chi tiết ${n.children.length} người ▾`}</span>
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">
                                      Mục: <strong className="text-slate-600">{n.targetTab}</strong>
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleActionClick(n)}
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center space-x-1 transition-all shadow-xs cursor-pointer ${
                                    isUrgent
                                      ? 'bg-rose-600 hover:bg-rose-700 text-white ring-1 ring-rose-500'
                                      : isActionReq
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                                  }`}
                                >
                                  <span>{n.actionLabel}</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* DANH SÁCH CON ACCORDION KHI MỞ RỘNG (EXPANDABLE SUB-ITEMS) */}
                              {n.isGroup && isGroupExpanded && n.children && (
                                <div className="mt-2 pt-2 border-t border-indigo-100/80 space-y-1.5 bg-indigo-50/40 p-2 rounded-lg animate-in fade-in">
                                  <div className="text-[10px] font-bold text-indigo-900 mb-1 flex items-center justify-between">
                                    <span>Danh sách chi tiết từng nhân sự:</span>
                                    <span className="text-slate-500 font-normal">Bấm nút để mở hồ sơ riêng</span>
                                  </div>

                                  {n.children.map((child, idx) => (
                                    <div 
                                      key={child.id}
                                      className="p-2 rounded-md bg-white border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs hover:border-indigo-300 transition-colors"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-1.5">
                                          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold flex items-center justify-center shrink-0">
                                            {idx + 1}
                                          </span>
                                          <span className="text-[11px] font-bold text-slate-800 truncate">
                                            {child.title}
                                          </span>
                                        </div>
                                        {child.detail && (
                                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 pl-5">
                                            {child.detail}
                                          </p>
                                        )}
                                      </div>

                                      <button
                                        onClick={() => handleActionClick({
                                          id: child.id,
                                          targetTab: child.targetTab || n.targetTab
                                        })}
                                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 transition-all shrink-0 cursor-pointer"
                                      >
                                        {child.actionLabel || 'Xem ngay →'}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Thanh Trạng Thái */}
                <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Định tuyến đúng thẩm quyền {roleDisplayNames[currentRole]}</span>
                  </span>
                  <button
                    onClick={() => {
                      setShowNotifDropdown(false);
                      if (onNavigate) onNavigate('POLICY');
                    }}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    Bảng Quy Ước & Ngưỡng trần →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 9. Khung Chuyển Đổi Ngôn Ngữ & Khôi Phục Dữ Liệu Gốc */}
          <div className="shrink-0 flex items-center justify-center">
            <LanguageSwitcher 
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              onResetData={onResetData}
            />
          </div>
        </div>
      </div>

      {/* Modal Tùy Chỉnh Phong Cách */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      {/* ════════════════════ MODAL / BOTTOM SHEET TIỆN ÍCH & QUẢN TRỊ TRÊN MOBILE ════════════════════ */}
      {showMobileSystemSheet && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMobileSystemSheet(false);
          }}
        >
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200">
            {/* Mobile Drag Pill */}
            <div className="pt-2.5 pb-1 flex justify-center sm:hidden">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header Bottom Sheet */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Điều Hành & Tiện Ích Hệ Thống</h3>
                  <p className="text-[11px] text-slate-500">Chuyển doanh nghiệp, đổi vai trò & công cụ hỗ trợ</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileSystemSheet(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Bottom Sheet */}
            <div className="p-4 space-y-3.5 overflow-y-auto max-h-[calc(90vh-115px)] text-left">
              {/* 1. Doanh Nghiệp */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>DOANH NGHIỆP HIỆN TẠI</span>
                </label>
                <select
                  value={currentTenantId}
                  onChange={(e) => {
                    onTenantChange(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  {policies.length > 0 ? (
                    policies.map(p => (
                      <option key={p.tenantId} value={p.tenantId}>
                        {p.companyName}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="TENANT-ASIAFOODS">An Việt Manufacturing</option>
                      <option value="TENANT-DIGITECH">DigiTech</option>
                    </>
                  )}
                </select>
              </div>

              {/* 2. Cấp Quản Trị / Vai Trò */}
              <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                <label className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>VAI TRÒ / CẤP QUẢN TRỊ</span>
                </label>
                <select
                  value={currentRole}
                  onChange={(e) => {
                    onRoleChange(e.target.value as UserRole);
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <optgroup label="🏛️ BAN GIÁM ĐỐC">
                    <option value="GENERAL_DIRECTOR">Tổng Giám Đốc (Lãnh Đạo)</option>
                  </optgroup>
                  <optgroup label="👑 KHỐI NHÂN SỰ">
                    <option value="HR_MANAGER">Trưởng Phòng Nhân Sự</option>
                    <option value="HR_RECRUITMENT">CV Tuyển Dụng & Đào Tạo</option>
                    <option value="HR_ADMIN_HSE">CV Hành Chính & CQNN</option>
                    <option value="PAYROLL_SPECIALIST">CV Tiền Lương & C&B</option>
                  </optgroup>
                  <optgroup label="🏢 KHỐI VẬN HÀNH">
                    <option value="DEPT_HEAD">Trưởng Phòng Ban (Quản Đốc)</option>
                    <option value="DEPT_SECRETARY">Thư Ký Phòng Ban</option>
                  </optgroup>
                  <optgroup label="👤 NHÂN VIÊN">
                    <option value="EMPLOYEE">Từng Nhân Viên (ESS)</option>
                  </optgroup>
                </select>
              </div>

              {/* 3. Thời Gian Hoạt Động & 4. Căn Cứ Pháp Lý */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="w-full">
                  <WorkTimeTracker className="w-full" />
                </div>
                <div className="w-full" onClick={() => setShowMobileSystemSheet(false)}>
                  <LegalFloatingWidget className="w-full" />
                </div>
              </div>

              {/* 5. Tiện Ích & Trợ Giúp */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tiện ích & Trợ giúp</span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="http://zalo.me/0963084246"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-xs font-bold transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Zalo Kỹ Thuật</span>
                  </a>

                  <button
                    onClick={() => {
                      setShowMobileSystemSheet(false);
                      onOpenFeedback();
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex items-center space-x-2 text-xs font-bold transition-all text-left cursor-pointer"
                  >
                    <MessageSquarePlus className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate">Góp Ý / Báo Lỗi</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMobileSystemSheet(false);
                      setShowThemeModal(true);
                    }}
                    className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 flex items-center space-x-2 text-xs font-bold transition-all text-left cursor-pointer"
                  >
                    <Palette className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate">Đổi Giao Diện</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMobileSystemSheet(false);
                      onResetData();
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-700 flex items-center space-x-2 text-xs font-bold transition-all text-left cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">Đặt Lại Dữ Liệu</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Bottom Sheet */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowMobileSystemSheet(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Xác Nhận & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
