import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const CompanyPolicyView = React.lazy(() => import('./components/CompanyPolicyView').then(m => ({ default: m.CompanyPolicyView })));
const ChecklistView = React.lazy(() => import('./components/ChecklistView').then(m => ({ default: m.ChecklistView })));
const EmployeeListView = React.lazy(() => import('./components/EmployeeListView').then(m => ({ default: m.EmployeeListView })));
const EmployeeContractView = React.lazy(() => import('./components/EmployeeContractView').then(m => ({ default: m.EmployeeContractView })));
const PersonnelChangesView = React.lazy(() => import('./components/PersonnelChangesView').then(m => ({ default: m.PersonnelChangesView })));

const OrgChartView = React.lazy(() => import('./components/OrgChartView').then(m => ({ default: m.OrgChartView })));
const AttendanceView = React.lazy(() => import('./components/AttendanceView').then(m => ({ default: m.AttendanceView })));
const LeaveApprovalView = React.lazy(() => import('./components/LeaveApprovalView').then(m => ({ default: m.LeaveApprovalView })));
const PayrollView = React.lazy(() => import('./components/PayrollView').then(m => ({ default: m.PayrollView })));
const OffboardingView = React.lazy(() => import('./components/OffboardingView').then(m => ({ default: m.OffboardingView })));
const TaxYearlyView = React.lazy(() => import('./components/TaxYearlyView').then(m => ({ default: m.TaxYearlyView })));
const GovReportsView = React.lazy(() => import('./components/GovReportsView').then(m => ({ default: m.GovReportsView })));
const FeedbackListView = React.lazy(() => import('./components/FeedbackListView').then(m => ({ default: m.FeedbackListView })));
const FeedbackModal = React.lazy(() => import('./components/FeedbackModal').then(m => ({ default: m.FeedbackModal })));
const RecruitmentView = React.lazy(() => import('./components/RecruitmentView').then(m => ({ default: m.RecruitmentView })));
const PerformanceView = React.lazy(() => import('./components/PerformanceView').then(m => ({ default: m.PerformanceView })));
const TrainingView = React.lazy(() => import('./components/TrainingView').then(m => ({ default: m.TrainingView })));
const ContractView = React.lazy(() => import('./components/ContractView').then(m => ({ default: m.ContractView })));
const AccountingView = React.lazy(() => import('./components/AccountingView').then(m => ({ default: m.AccountingView })));
const BankTransferAuditView = React.lazy(() => import('./components/BankTransferAuditView').then(m => ({ default: m.BankTransferAuditView })));
const AdministrationView = React.lazy(() => import('./components/AdministrationView').then(m => ({ default: m.AdministrationView })));
const CompanyNewsAndBulletinView = React.lazy(() => import('./components/CompanyNewsAndBulletinView').then(m => ({ default: m.CompanyNewsAndBulletinView })));
const AIAssistantModal = React.lazy(() => import('./components/AIAssistantModal').then(m => ({ default: m.AIAssistantModal })));
const InternalMessengerModal = React.lazy(() => import('./components/InternalMessengerModal').then(m => ({ default: m.InternalMessengerModal })));
const CanteenMealPassModal = React.lazy(() => import('./components/CanteenMealPassModal').then(m => ({ default: m.CanteenMealPassModal })));
import { GlobalBannerArea } from './components/GlobalBannerArea';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingBanner } from './components/FloatingBanner';
import { LoginView } from './components/LoginView';
import { storageService } from './services/storageService';
import { themeService } from './services/themeService';
import { languageService, AppLanguage } from './services/languageService';
import { govReportsService } from './services/govReportsService';
import { getEmployeePayrollScenario } from './services/mockData';
import { calculateEmployeePayroll } from './services/payrollEngine';
import { fetchEmployeesFromSupabase, insertEmployeeToSupabase } from './services/supabaseService';
import { CompanyPolicy, Employee, AttendanceRecord, WorkflowRequest, OffboardingRecord, FeedbackItem, UserRole, PayrollRecord, PersonnelChange, DailyWorkReportItem } from './types/hrm';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('hrm_current_role') as UserRole) || 'HR_MANAGER';
  });
  const [currentTenantId, setCurrentTenantId] = useState<string>('TENANT-ASIAFOODS');
  const [activeTab, setActiveTab] = useState<NavTab>('COMPANY_NOTICES');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState<boolean>(false);
  const [showMealPassModal, setShowMealPassModal] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>(() => languageService.getLanguage());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('hrm_is_logged_in') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hrm_current_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('hrm_is_logged_in', isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail) {
        setCurrentLanguage(e.detail);
      }
    };
    window.addEventListener('omnihrm_language_change', handleLangChange);
    return () => window.removeEventListener('omnihrm_language_change', handleLangChange);
  }, []);

  // Dữ liệu ứng dụng
  const [policies, setPolicies] = useState<CompanyPolicy[]>(() => storageService.getPolicies());
  const [employees, setEmployees] = useState<Employee[]>(() => storageService.getEmployees());

  useEffect(() => {
    // Tải dữ liệu từ CSDL Supabase khi khởi động
    const loadEmployees = async () => {
      const data = await fetchEmployeesFromSupabase();
      if (data && data.length > 0) {
        setEmployees(data);
      }
    };
    loadEmployees();
  }, []);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => storageService.getAttendance());
  const [requests, setRequests] = useState<WorkflowRequest[]>(() => storageService.getRequests());
  const [offboardings, setOffboardings] = useState<OffboardingRecord[]>(() => storageService.getOffboardings());
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => storageService.getFeedbacks());
  const [personnelChanges, setPersonnelChanges] = useState<PersonnelChange[]>(() => storageService.getPersonnelChanges());
  const [dailyReports, setDailyReports] = useState<DailyWorkReportItem[]>(() => storageService.getDailyReports());

  // Đồng bộ LocalStorage khi dữ liệu thay đổi
  useEffect(() => { storageService.savePolicies(policies); }, [policies]);
  useEffect(() => { storageService.saveEmployees(employees); }, [employees]);
  useEffect(() => { storageService.saveAttendance(attendance); }, [attendance]);
  useEffect(() => { storageService.saveRequests(requests); }, [requests]);
  useEffect(() => { storageService.saveOffboardings(offboardings); }, [offboardings]);
  useEffect(() => { storageService.saveFeedbacks(feedbacks); }, [feedbacks]);
  useEffect(() => { storageService.savePersonnelChanges(personnelChanges); }, [personnelChanges]);
  useEffect(() => { storageService.saveDailyReports(dailyReports); }, [dailyReports]);

  // Khởi tạo và lắng nghe thay đổi theme / chế độ Ngày Đêm hệ điều hành
  useEffect(() => {
    themeService.checkAndApplyAutoRotate();
    const config = themeService.getConfig();
    themeService.applyToDOM(config);
    const unlisten = themeService.initListener(() => {
      // Khi hệ điều hành đổi theme, tự động đồng bộ lại
    });
    return unlisten;
  }, []);

  // Chính sách của công ty đang chọn
  const currentPolicy = policies.find(p => p.tenantId === currentTenantId) || policies[0];

  // Số lượng đơn từ cần duyệt
  const pendingRequestsCount = requests.filter(r => r.tenantId === currentTenantId && r.status === 'PENDING').length;

  // Số lượng hợp đồng đến hạn xử lý (Thử việc cần ký chính thức, HĐLĐ sắp hết hạn < 45 ngày, Báo trước nghỉ việc)
  const expiringContractsCount = useMemo(() => {
    const now = new Date().getTime();
    return employees.filter(e => {
      if (e.tenantId !== currentTenantId) return false;
      if (e.status === 'PROBATION' || e.contractType === 'PROBATION') return true;
      if (e.status === 'NOTICE_PERIOD') return true;
      if (e.contractEndDate && e.status === 'OFFICIAL') {
        const end = new Date(e.contractEndDate).getTime();
        const diffDays = (end - now) / (1000 * 3600 * 24);
        return diffDays >= -30 && diffDays <= 45;
      }
      return false;
    }).length;
  }, [employees, currentTenantId]);

  // Số lượng báo cáo HCNS đến CQNN đến hạn khẩn cấp (Màu Đỏ + Màu Vàng)
  const govReportsUrgentCount = useMemo(() => {
    return govReportsService.getWarningBadgeCount();
  }, []);

  // Tính toán bảng lương phục vụ kiểm tra chuyển khoản ngân hàng
  const auditPayrollRecords: PayrollRecord[] = useMemo(() => {
    const currentTenantEmployees = employees.filter(e => e.tenantId === currentPolicy.tenantId);
    return currentTenantEmployees.map((emp) => {
      const scenarioOpts = getEmployeePayrollScenario(emp, currentPolicy, '2026-08');
      return calculateEmployeePayroll(emp, currentPolicy, scenarioOpts);
    });
  }, [employees, currentPolicy]);

  const handleSavePolicy = (updated: CompanyPolicy) => {
    setPolicies(policies.map(p => p.tenantId === updated.tenantId ? updated : p));
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu mẫu ban đầu không?')) {
      storageService.resetToDefaults();
    }
  };

  const handleAddFeedback = (item: FeedbackItem) => {
    setFeedbacks([item, ...feedbacks]);
  };

  const handleAddEmployee = async (newEmp: Employee) => {
    // Lưu tạm vào state để UI phản hồi nhanh (Optimistic Update)
    setEmployees([...employees, newEmp]);
    
    // Gửi lên CSDL Supabase
    const saved = await insertEmployeeToSupabase(newEmp);
    if (saved) {
      // Có thể reload lại nếu cần, hoặc để nguyên vì đã Optimistic Update
      console.log('Đã lưu nhân viên lên Supabase:', saved);
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginView 
        employees={employees}
        onLogin={(emp) => {
          let assignedRole = emp.role || 'EMPLOYEE';
          if (emp.code === 'AF-001') assignedRole = 'GENERAL_DIRECTOR';
          if (emp.code === 'AF-002') assignedRole = 'HR_MANAGER';
          setCurrentRole(assignedRole);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="h-screen bg-transparent flex flex-col font-sans overflow-hidden">
      {/* Thanh Header Điều Hướng Trên Cùng */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currentTenantId={currentTenantId}
        onTenantChange={setCurrentTenantId}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenMessenger={() => setIsMessengerOpen(true)}
        onResetData={handleResetData}
        onNavigate={setActiveTab}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        policies={policies}
        employees={employees}
        attendance={attendance}
        requests={requests}
        personnelChanges={personnelChanges}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Thanh Sidebar Trái (Desktop & Mobile Drawer) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
          pendingRequestsCount={pendingRequestsCount}
          expiringContractsCount={expiringContractsCount}
          govReportsUrgentCount={govReportsUrgentCount}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onResetData={handleResetData}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Nội Dung Màn Hình Chính */}
        <main className="flex-1 min-h-0 overflow-y-auto px-2.5 sm:px-4 md:px-5 lg:px-6 pt-2 pb-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {/* Vùng Banner Chung Cho Toàn Bộ Các Tab */}
            {currentPolicy.promoBannerEnabled !== false && (
              <GlobalBannerArea currentTab={activeTab} policy={currentPolicy} />
            )}

            <React.Suspense fallback={<div className="p-10 flex flex-col items-center justify-center space-y-4"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div><div className="text-indigo-800/70 font-semibold animate-pulse text-sm">Đang tải phân hệ...</div></div>}>

            {activeTab === 'COMPANY_NOTICES' && (
              <ErrorBoundary fallbackLabel="Thông Báo & Thông Tin Chung">
                <CompanyNewsAndBulletinView
                  policy={currentPolicy}
                  employees={employees}
                  currentRole={currentRole}
                  onOpenMealPassModal={() => setShowMealPassModal(true)}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'DASHBOARD' && (
              <ErrorBoundary fallbackLabel="Bảng Điều Khiển">
                <Dashboard
                  employees={employees}
                  attendance={attendance}
                  requests={requests}
                  policy={currentPolicy}
                  currentRole={currentRole}
                  onNavigate={setActiveTab}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'POLICY' && (
              <ErrorBoundary fallbackLabel="Bảng Quy Ước Công Ty">
                <CompanyPolicyView
                  policy={currentPolicy}
                  onSavePolicy={handleSavePolicy}
                  currentRole={currentRole}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'CHECKLIST' && (
              <ErrorBoundary fallbackLabel="Khoản Đóng BHXH & Thuế">
                <ChecklistView />
              </ErrorBoundary>
            )}

            {(activeTab === 'EMPLOYEE_CONTRACTS' || activeTab === 'EMPLOYEES' || activeTab === 'CONTRACTS') && (
              <ErrorBoundary fallbackLabel="Hồ Sơ & Hợp Đồng">
                <EmployeeContractView
                  employees={employees}
                  policy={currentPolicy}
                  currentRole={currentRole}
                  personnelChanges={personnelChanges}
                  onUpdateEmployees={setEmployees}
                  onUpdatePersonnelChanges={setPersonnelChanges}
                  initialSubTab={activeTab === 'CONTRACTS' ? 'CONTRACTS' : 'PROFILES'}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'PERSONNEL_CHANGES' && (
              <ErrorBoundary fallbackLabel="Thủ Tục & Biến Động Nhân Sự">
                <PersonnelChangesView
                  personnelChanges={personnelChanges}
                  employees={employees}
                  policy={currentPolicy}
                  currentRole={currentRole}
                  onUpdatePersonnelChanges={setPersonnelChanges}
                  onUpdateEmployees={setEmployees}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'ORG_CHART' && (
              <ErrorBoundary fallbackLabel="Sơ Đồ Tổ Chức">
                <OrgChartView
                  employees={employees}
                  policy={currentPolicy}
                  currentRole={currentRole}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'RECRUITMENT' && (
              <ErrorBoundary fallbackLabel="Tuyển Dụng & AI Sàng Lọc">
                <RecruitmentView
                  policy={currentPolicy}
                  employees={employees}
                  currentRole={currentRole}
                  onAddEmployee={handleAddEmployee}
                  onSavePolicy={handleSavePolicy}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'ATTENDANCE' && (
              <ErrorBoundary fallbackLabel="Chấm Công & Định Vị GPS">
                <AttendanceView
                  attendance={attendance}
                  policy={currentPolicy}
                  employees={employees}
                  currentRole={currentRole}
                  onUpdateAttendance={setAttendance}
                  requests={requests}
                />
              </ErrorBoundary>
            )}

            {(activeTab === 'REQUESTS' || activeTab === 'LEAVE_APPROVAL') && (
              <ErrorBoundary fallbackLabel="Quản Lý Phê Duyệt Đơn Từ">
                <LeaveApprovalView
                  requests={requests}
                  policy={currentPolicy}
                  employees={employees}
                  currentRole={currentRole}
                  onUpdateRequests={setRequests}
                  attendance={attendance}
                  onUpdateAttendance={setAttendance}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'PAYROLL' && (
              <ErrorBoundary fallbackLabel="Bảng Lương 3P & Chuyển Khoản">
                <PayrollView
                  employees={employees}
                  attendance={attendance}
                  policy={currentPolicy}
                  currentRole={currentRole}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'BANK_TRANSFER_AUDIT' && (
              <ErrorBoundary fallbackLabel="Kiểm Tra Bảng Lương & Lệnh Chuyển Khoản">
                <BankTransferAuditView
                  payrollRecords={auditPayrollRecords}
                  policy={currentPolicy}
                  currentRole={currentRole}
                  selectedMonth="2026-08"
                />
              </ErrorBoundary>
            )}

            {activeTab === 'PERFORMANCE' && (
              <ErrorBoundary fallbackLabel="Đánh Giá Hiệu Suất 360°">
                <PerformanceView
                  policy={currentPolicy}
                  employees={employees}
                  currentRole={currentRole}
                  dailyReports={dailyReports}
                  onUpdateDailyReports={setDailyReports}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'TRAINING' && (
              <ErrorBoundary fallbackLabel="Đào Tạo & Thăng Tiến">
                <TrainingView
                  policy={currentPolicy}
                  currentRole={currentRole}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'TAX_YEARLY' && (
              <ErrorBoundary fallbackLabel="Quyết Toán Thuế TNCN Năm">
                <TaxYearlyView
                  employees={employees}
                  policy={currentPolicy}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'ACCOUNTING' && (
              <ErrorBoundary fallbackLabel="Hạch Toán Lương & Tích Hợp ERP">
                <AccountingView
                  policy={currentPolicy}
                  currentRole={currentRole}
                  payrollRecords={auditPayrollRecords}
                  employees={employees}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'OFFBOARDING' && (
              <ErrorBoundary fallbackLabel="Nghỉ Việc & Bàn Giao Tài Sản">
                <OffboardingView
                  offboardings={offboardings}
                  policy={currentPolicy}
                  employees={employees}
                  currentRole={currentRole}
                  onUpdateOffboardings={(updated) => {
                    setOffboardings(updated);
                    const completedEmpIds = new Set(updated.filter(o => o.status === 'COMPLETED').map(o => o.employeeId));
                    if (completedEmpIds.size > 0) {
                      setEmployees(prev => prev.map(emp => {
                        if (completedEmpIds.has(emp.id)) {
                          return { ...emp, status: 'RESIGNED' };
                        }
                        return emp;
                      }));
                    }
                  }}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'GOV_REPORTS' && (
              <ErrorBoundary fallbackLabel="Báo Cáo HCNS Đến CQNN">
                <GovReportsView
                  employees={employees}
                  personnelChanges={personnelChanges}
                  policy={currentPolicy}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'ADMINISTRATION' && (
              <ErrorBoundary fallbackLabel="Hành Chính Doanh Nghiệp">
                <AdministrationView
                  policy={currentPolicy}
                  employees={employees}
                  currentRole={currentRole}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'FEEDBACK_LIST' && (
              <ErrorBoundary fallbackLabel="Góp Ý & Báo Lỗi">
                <FeedbackListView
                  feedbacks={feedbacks}
                  onUpdateFeedbacks={setFeedbacks}
                />
              </ErrorBoundary>
            )}
            </React.Suspense>
          </div>
          {/* Chân trang phong cách Dantri tinh gọn */}
          <Footer />
        </main>
      </div>

      {/* Modal Góp Ý / Báo Lỗi */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentRole={currentRole}
        onSubmitFeedback={handleAddFeedback}
      />

      {/* Trợ lý QA & Pháp Luật (Nút nửa hình tròn mép phải + Modal vuông 2 tab bảo mật) */}
      <AIAssistantModal onNavigate={(tab) => setActiveTab(tab)} />

      {/* Hộp Tin Nhắn Doanh Nghiệp & Sổ Nhắc Việc Thông Minh (Tự dọn dẹp 30 ngày) */}
      <InternalMessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        currentRole={currentRole}
        employees={employees}
        companyName={currentPolicy.companyName}
      />

      {/* Modal Thẻ Lấy Suất Ăn Ca Điện Tử (E-Meal Pass) Dành Riêng Cho Nhân Viên (Tab 01) */}
      <CanteenMealPassModal
        isOpen={showMealPassModal}
        onClose={() => setShowMealPassModal(false)}
        employees={employees}
        attendance={attendance}
        isEmployeeOnlyMode={true}
      />
      
      {/* Nút Banner Quảng Cáo Góc Phải */}
      <FloatingBanner policy={currentPolicy} />
    </div>
  );
};
