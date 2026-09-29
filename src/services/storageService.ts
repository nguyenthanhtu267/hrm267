// ========================================================
// STORAGE SERVICE - LƯU TRỮ VÀ ĐỒNG BỘ DỮ LIỆU LOCALSTORAGE
// ========================================================

import { CompanyPolicy, Employee, AttendanceRecord, WorkflowRequest, OffboardingRecord, FeedbackItem, PersonnelChange, DailyWorkReportItem } from '../types/hrm';
import { initialPolicies, initialAttendanceRecords, initialRequests, initialOffboardings, initialPersonnelChanges, initialDailyReports } from './mockData';
import { generate250Employees, generateDailyAttendanceForEmployees, generateOffboardingRecords, generateRichWorkflowRequests } from './largeDatasetGenerator';

const KEYS = {
  POLICIES: 'omnihrm_policies_v6789_sync',
  EMPLOYEES: 'omnihrm_employees_v6789_sync',
  ATTENDANCE: 'omnihrm_attendance_v6789_sync',
  REQUESTS: 'omnihrm_requests_v6789_sync',
  OFFBOARDINGS: 'omnihrm_offboardings_v6789_sync',
  FEEDBACKS: 'omnihrm_feedbacks',
  PERSONNEL_CHANGES: 'omnihrm_personnel_changes_v6789_sync',
  DAILY_REPORTS: 'omnihrm_daily_reports_v1',
  CURRENT_TENANT: 'omnihrm_current_tenant',
  CURRENT_ROLE: 'omnihrm_current_role',
};

/**
 * Đọc an toàn từ localStorage - trả về null nếu JSON bị hỏng
 * Tránh crash toàn bộ app khi localStorage chứa dữ liệu corrupt
 */
function safeGetItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch (e) {
    console.warn(`[StorageService] Dữ liệu localStorage bị lỗi tại key "${key}", đang xóa và dùng dữ liệu mặc định.`, e);
    try { localStorage.removeItem(key); } catch (_) {}
    return null;
  }
}

/**
 * Lưu an toàn vào localStorage - bắt lỗi QuotaExceeded
 */
function safeSetItem(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[StorageService] Không thể lưu vào localStorage key "${key}":`, e);
  }
}


/**
 * Tự động kiểm tra và bù đắp các trường dữ liệu bắt buộc mới cho CompanyPolicy
 */
function migratePolicy(p: CompanyPolicy): CompanyPolicy {
  return {
    ...p,
    companyName: p.tenantId === 'TENANT-ASIAFOODS' || p.companyName.includes('AsiaFoods') ? 'An Việt Manufacturing' : (p.tenantId === 'TENANT-DIGITECH' || p.companyName.includes('DigiTech') ? 'DigiTech' : p.companyName),
    pit5PersonalDeduction: p.pit5PersonalDeduction ?? 15500000,
    pit5DependentDeduction: p.pit5DependentDeduction ?? 6200000,
    shiftMealAllowancePerDay: p.shiftMealAllowancePerDay ?? 35000,
    shiftMealEffectiveDate: p.shiftMealEffectiveDate ?? '2026-01-01',
    shiftMealPaymentType: p.shiftMealPaymentType ?? 'PER_DAY',
    otMonthlyCapHours: p.otMonthlyCapHours ?? 40,
    autoLockOtAtMonthlyCap: p.autoLockOtAtMonthlyCap ?? false,
    thousandSeparator: p.thousandSeparator ?? '.',
    decimalSeparator: p.decimalSeparator ?? ',',
    defaultLanguage: p.defaultLanguage ?? 'vi',
  };
}

/**
 * Tự động bù đắp các trường dữ liệu bắt buộc mới cho Employee
 */
function migrateEmployee(e: Employee): Employee {
  return {
    ...e,
    departmentName: e.departmentName?.includes('Chiên Sấy') ? 'Phân Xưởng Đóng Gói' : e.departmentName,
    dependents: e.dependents ?? 0,
    toxicTier: e.toxicTier ?? 0,
    salaryAdvance: e.salaryAdvance ?? 0,
    contractType: e.contractType ?? 'DEFINITE_12M',
    status: e.status ?? 'OFFICIAL',
  };
}

export const storageService = {
  getDailyReports(): DailyWorkReportItem[] {
    return safeGetItem<DailyWorkReportItem[]>(KEYS.DAILY_REPORTS) ?? initialDailyReports;
  },
  saveDailyReports(reports: DailyWorkReportItem[]) {
    safeSetItem(KEYS.DAILY_REPORTS, reports);
  },

  getPolicies(): CompanyPolicy[] {
    const list = safeGetItem<CompanyPolicy[]>(KEYS.POLICIES) ?? initialPolicies;
    const migrated = list.map(migratePolicy);
    return migrated;
  },
  savePolicies(policies: CompanyPolicy[]) {
    safeSetItem(KEYS.POLICIES, policies);
  },

  getEmployees(): Employee[] {
    const list = safeGetItem<Employee[]>(KEYS.EMPLOYEES) ?? generate250Employees();
    const migrated = list.map(migrateEmployee);
    return migrated;
  },
  saveEmployees(employees: Employee[]) {
    safeSetItem(KEYS.EMPLOYEES, employees);
  },

  getAttendance(targetDate: string = '2026-08-25'): AttendanceRecord[] {
    const parsed = safeGetItem<AttendanceRecord[]>(KEYS.ATTENDANCE);
    if (parsed && Array.isArray(parsed) && parsed.length > 20) return parsed;
    const emps = storageService.getEmployees();
    const generated = generateDailyAttendanceForEmployees(emps, targetDate);
    storageService.saveAttendance(generated);
    return generated;
  },
  saveAttendance(attendance: AttendanceRecord[]) {
    safeSetItem(KEYS.ATTENDANCE, attendance);
  },

  getRequests(): WorkflowRequest[] {
    const parsed = safeGetItem<WorkflowRequest[]>(KEYS.REQUESTS);
    if (parsed && Array.isArray(parsed) && parsed.length >= 50 && parsed.some(r => r.type === 'GATE_PASS')) return parsed;
    const emps = storageService.getEmployees();
    const rich = generateRichWorkflowRequests(emps);
    storageService.saveRequests(rich);
    return rich;
  },
  saveRequests(requests: WorkflowRequest[]) {
    safeSetItem(KEYS.REQUESTS, requests);
  },

  getOffboardings(): OffboardingRecord[] {
    const parsed = safeGetItem<OffboardingRecord[]>(KEYS.OFFBOARDINGS);
    if (parsed && Array.isArray(parsed) && parsed.length > 10) return parsed;
    const emps = storageService.getEmployees();
    const generated = generateOffboardingRecords(emps);
    storageService.saveOffboardings(generated);
    return generated;
  },
  saveOffboardings(offboardings: OffboardingRecord[]) {
    safeSetItem(KEYS.OFFBOARDINGS, offboardings);
  },

  getPersonnelChanges(): PersonnelChange[] {
    return safeGetItem<PersonnelChange[]>(KEYS.PERSONNEL_CHANGES) ?? initialPersonnelChanges;
  },
  savePersonnelChanges(changes: PersonnelChange[]) {
    safeSetItem(KEYS.PERSONNEL_CHANGES, changes);
  },

  getFeedbacks(): FeedbackItem[] {
    return safeGetItem<FeedbackItem[]>(KEYS.FEEDBACKS) ?? [
      {
        id: 'FB-01',
        moduleName: 'Chấm công',
        userName: 'Lê Hoàng Nam (C&B)',
        userRole: 'PAYROLL_SPECIALIST',
        feedbackType: 'FEATURE_REQUEST',
        content: 'Cần thêm tính năng quét mã QR động tại cổng bảo vệ nhà máy.',
        expectedResult: 'Nhân viên quét QR trong vòng 10 giây để check-in chống gian lận.',
        status: 'IN_PROGRESS',
        createdAt: '2026-08-25 14:00',
      }
    ];
  },
  saveFeedbacks(feedbacks: FeedbackItem[]) {
    safeSetItem(KEYS.FEEDBACKS, feedbacks);
  },

  // Reset toàn bộ về dữ liệu gốc
  resetToDefaults() {
    try {
      Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    } catch (_) {}
    window.location.reload();
  }
};
