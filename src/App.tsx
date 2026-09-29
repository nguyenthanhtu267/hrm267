import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CompanyPolicyView } from './components/CompanyPolicyView';
import { ChecklistView } from './components/ChecklistView';
import { EmployeeListView } from './components/EmployeeListView';
import { EmployeeContractView } from './components/EmployeeContractView';
import { PersonnelChangesView } from './components/PersonnelChangesView';

import { OrgChartView } from './components/OrgChartView';
import { AttendanceView } from './components/AttendanceView';
import { LeaveApprovalView } from './components/LeaveApprovalView';
import { PayrollView } from './components/PayrollView';
import { OffboardingView } from './components/OffboardingView';
import { TaxYearlyView } from './components/TaxYearlyView';
import { GovReportsView } from './components/GovReportsView';
import { FeedbackListView } from './components/FeedbackListView';
import { FeedbackModal } from './components/FeedbackModal';
import { RecruitmentView } from './components/RecruitmentView';
import { PerformanceView } from './components/PerformanceView';
import { TrainingView } from './components/TrainingView';
import { ContractView } from './components/ContractView';
import { AccountingView } from './components/AccountingView';
import { BankTransferAuditView } from './components/BankTransferAuditView';
import { AdministrationView } from './components/AdministrationView';
import { CompanyNewsAndBulletinView } from './components/CompanyNewsAndBulletinView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { InternalMessengerModal } from './components/InternalMessengerModal';
import { CanteenMealPassModal } from './components/CanteenMealPassModal';
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
  const [currentRole, setCurrentRole] = useState<UserRole>('HR_MANAGER');
  const [currentTenantId, setCurrentTenantId] = useState<string>('TENANT-ASIAFOODS');
  const [activeTab, setActiveTab] = useState<NavTab>('COMPANY_NOTICES');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState<boolean>(false);
  const [showMealPassModal, setShowMealPassModal] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>(() => languageService.getLanguage());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

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
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
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
        <main className="flex-1 min-h-0 overflow-y-auto px-2.5 sm:px-4 md:px-5 lg:px-6 pt-1.5 pb-2 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
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
