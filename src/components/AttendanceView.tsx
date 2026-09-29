import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AttendanceRecord, ShiftDefinition, CompanyPolicy, Employee, UserRole, WorkflowRequest } from '../types/hrm';
import { initialShifts } from '../services/mockData';
import { generateDailyAttendanceForEmployees } from '../services/largeDatasetGenerator';
import { excelService } from '../services/excelService';
import { CompactPagination, evaluateColumnCondition } from './SmartTableFilter';
import { 
  Clock, 
  Fingerprint, 
  Smartphone, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Moon, 
  Sun,
  Layers,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Lock,
  Unlock,
  Bell,
  ArrowRightLeft,
  CalendarDays,
  AlertOctagon,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Info,
  Palmtree,
  FileSpreadsheet,
  Eye,
  HeartPulse,
  Baby,
  Briefcase,
  ShieldAlert,
  PlusCircle,
  FileSignature
} from 'lucide-react';

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
  onUpdateAttendance: (updated: AttendanceRecord[]) => void;
  requests?: WorkflowRequest[];
}

interface WeeklyShiftAssignment {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  lineOrTeam: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  policy,
  employees,
  currentRole,
  onUpdateAttendance,
  requests = [],
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-25');
  const [selectedShift, setSelectedShift] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'DAILY_LOG' | 'WEEKLY_SCHEDULE' | 'SHIFT_SWAP_MANAGEMENT' | 'SCHEDULE_ALERTS' | 'LEAVE_QUOTA_MANAGEMENT' | 'AUDIT_RISK' | 'REGULARIZATION'>('DAILY_LOG');

  // ========================================================
  // RÀ SOÁT RỦI RO CHẤM CÔNG & HOẠT ĐỘNG APP (GHOST WORKER AUDIT)
  // ========================================================
  interface AttendanceAppAuditItem {
    empId: string;
    code: string;
    name: string;
    dept: string;
    actualCheckinDays: number;
    standardDays: number;
    appLoginsThisMonth: number;
    mealClaimsThisMonth: number;
    lastAppActive: string;
    hasPayroll: boolean;
    monthlySalary: number;
    riskLevel: 'HIGH_GHOST_RISK' | 'MEDIUM_PROXY_RISK' | 'MEAL_WITHOUT_WORK' | 'NORMAL';
    riskLabel: string;
    suspectedCause: string;
    investigationStatus: 'PENDING_EXPLANATION' | 'SALARY_HELD' | 'VERIFIED_VALID';
  }

  const [auditFilterRisk, setAuditFilterRisk] = useState<string>('ALL');
  const [auditList, setAuditList] = useState<AttendanceAppAuditItem[]>([
    {
      empId: 'EMP-088',
      code: 'AF-088',
      name: 'Võ Thành Đạt',
      dept: 'Phân Xưởng Chế Biến',
      actualCheckinDays: 0,
      standardDays: 24,
      appLoginsThisMonth: 0,
      mealClaimsThisMonth: 0,
      lastAppActive: 'Không có dữ liệu (30+ ngày)',
      hasPayroll: true,
      monthlySalary: 9500000,
      riskLevel: 'HIGH_GHOST_RISK',
      riskLabel: '🔴 RỦI RO CAO: Có Lương Nhưng 0 Ngày Chấm Công',
      suspectedCause: 'Nghi vấn nhân viên đã nghỉ việc ngầm hoặc thôi việc nhưng chưa báo giảm C&B.',
      investigationStatus: 'SALARY_HELD'
    },
    {
      empId: 'EMP-092',
      code: 'AF-092',
      name: 'Nguyễn Thị Hồng Hạnh',
      dept: 'Khối Kinh Doanh & Tiếp Thị',
      actualCheckinDays: 24,
      standardDays: 24,
      appLoginsThisMonth: 0,
      mealClaimsThisMonth: 0,
      lastAppActive: 'Chưa từng kích hoạt App',
      hasPayroll: true,
      monthlySalary: 14000000,
      riskLevel: 'MEDIUM_PROXY_RISK',
      riskLabel: '🟡 RỦI RO: Chấm Công Đủ Nhưng 0 Lần Mở App',
      suspectedCause: 'Nghi vấn có người quẹt thẻ/vân tay hộ hoặc nhân viên đi công tác ngoài địa bàn.',
      investigationStatus: 'PENDING_EXPLANATION'
    },
    {
      empId: 'EMP-105',
      code: 'AF-105',
      name: 'Đặng Hữu Tài',
      dept: 'Kho Vận & Logistics',
      actualCheckinDays: 5,
      standardDays: 24,
      appLoginsThisMonth: 22,
      mealClaimsThisMonth: 22,
      lastAppActive: 'Hôm nay 08:15',
      hasPayroll: true,
      monthlySalary: 8200000,
      riskLevel: 'MEAL_WITHOUT_WORK',
      riskLabel: '🟠 RỦI RO: Không Đi Làm Nhưng Vẫn Nhận Suất Ăn Đều',
      suspectedCause: 'Chỉ check-in 5 ngày nhưng phát sinh 22 lần nhận phần ăn ca qua nhận hộ.',
      investigationStatus: 'PENDING_EXPLANATION'
    },
    {
      empId: 'EMP-114',
      code: 'AF-114',
      name: 'Phan Bảo Trâm',
      dept: 'Phòng Hành Chính Nhân Sự',
      actualCheckinDays: 22,
      standardDays: 24,
      appLoginsThisMonth: 45,
      mealClaimsThisMonth: 22,
      lastAppActive: 'Hôm nay 07:55',
      hasPayroll: true,
      monthlySalary: 11000000,
      riskLevel: 'NORMAL',
      riskLabel: '🟢 Bình Thường: Dữ liệu công & App đồng bộ',
      suspectedCause: 'Hoạt động bình thường, tuân thủ quy chế.',
      investigationStatus: 'VERIFIED_VALID'
    }
  ]);

  const handleUpdateAuditStatus = (empId: string, newStatus: AttendanceAppAuditItem['investigationStatus']) => {
    setAuditList(prev => prev.map(item => item.empId === empId ? { ...item, investigationStatus: newStatus } : item));
    if (newStatus === 'SALARY_HELD') {
      alert('⚠️ ĐÃ TẠM GIỮ CHI LƯƠNG & KHÓA CHỐT CÔNG!\nYêu cầu Trưởng bộ phận và Nhân sự xác minh giải trình trước khi mở lại.');
    } else if (newStatus === 'VERIFIED_VALID') {
      alert('✓ ĐÃ XÁC MINH HỢP LỆ!\nDữ liệu đã được gỡ cảnh báo rủi ro.');
    } else {
      alert('✉️ ĐÃ GỬI THÔNG BÁO YÊU CẦU GIẢI TRÌNH ĐẾN NHÂN VIÊN & QUẢN LÝ TRỰC TIẾP!');
    }
  };

  // State Quản Lý Nghỉ Phép & Tồn Phép Năm
  const [leaveMonth, setLeaveMonth] = useState<string>('2026-08');
  const [leaveDept, setLeaveDept] = useState<string>('ALL');
  const [leaveSearch, setLeaveSearch] = useState<string>('');
  const [leavePage, setLeavePage] = useState<number>(1);
  const [leavePageSize, setLeavePageSize] = useState<number>(10);
  const [selectedEmpLeaveDetail, setSelectedEmpLeaveDetail] = useState<any | null>(null);
  
  // Payroll lock state synchronization
  const [isPayrollLocked, setIsPayrollLocked] = useState<boolean>(false);

  // 5-Minute Attendance Reminder Popup State
  const [showReminderPopup, setShowReminderPopup] = useState<boolean>(false);
  const [reminderEmp, setReminderEmp] = useState<Employee | null>(null);
  const [reminderType, setReminderType] = useState<'BEFORE_SHIFT' | 'AFTER_SHIFT' | 'LATE_NO_CHECKIN'>('BEFORE_SHIFT');

  // Phân trang chuẩn Viewport (10-15 dòng)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Column Filters
  const [colFilters, setColFilters] = useState({
    code: '',
    name: '',
    dept: '',
    shift: '',
    time: '',
    late: '',
    deduct: '',
    actualHours: '',
    nightHours: '',
    source: '',
    notes: '',
  });

  // Simulator state
  const [simEmpId, setSimEmpId] = useState<string>(employees[0]?.id || '');
  const [simCheckIn, setSimCheckIn] = useState<string>('08:04');
  const [simMethod, setSimMethod] = useState<'BIOMETRIC_DEVICE' | 'MOBILE_GPS_FACE' | 'WEB_PORTAL'>('MOBILE_GPS_FACE');
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  const currentTenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === policy.tenantId);
  }, [employees, policy.tenantId]);

  // Tự động kiểm tra và sinh dữ liệu chấm công cho ngày được chọn nếu chưa có
  useEffect(() => {
    const existingDateRecords = attendance.filter(a => a.date === selectedDate);
    if (existingDateRecords.length < 15 && currentTenantEmployees.length > 0) {
      const newDaily = generateDailyAttendanceForEmployees(currentTenantEmployees, selectedDate);
      const others = attendance.filter(a => a.date !== selectedDate);
      onUpdateAttendance([...newDaily, ...others]);
    }
  }, [selectedDate, currentTenantEmployees.length]);

  // Lấy danh sách phòng ban
  const departmentList = useMemo(() => {
    const set = new Set(currentTenantEmployees.map(e => e.departmentName).filter(Boolean));
    return Array.from(set).sort();
  }, [currentTenantEmployees]);

  // Lọc nhật ký chấm công ngày đang chọn
  const dateRecords = useMemo(() => {
    return attendance.filter(a => a.date === selectedDate);
  }, [attendance, selectedDate]);

  // Áp dụng bộ lọc toàn diện & toán tử từng cột
  const filteredRecords = useMemo(() => {
    return dateRecords.filter(rec => {
      // Bộ lọc dropdown cha
      if (selectedShift !== 'ALL' && rec.shiftCode !== selectedShift) return false;
      if (selectedDept !== 'ALL' && rec.departmentName !== selectedDept) return false;
      if (selectedStatus === 'ON_TIME' && (rec.lateMinutes > 0 || rec.status === 'LATE')) return false;
      if (selectedStatus === 'LATE' && rec.lateMinutes === 0 && rec.status !== 'LATE') return false;
      if (selectedStatus === 'NIGHT' && rec.nightHours === 0) return false;
      if (selectedStatus === 'ONLINE' && rec.status !== 'ONLINE_WORK') return false;

      // Bộ lọc toán tử từng cột
      if (colFilters.code && !evaluateColumnCondition(rec.employeeCode, colFilters.code)) return false;
      if (colFilters.name && !evaluateColumnCondition(rec.employeeName, colFilters.name)) return false;
      if (colFilters.dept && !evaluateColumnCondition(rec.departmentName, colFilters.dept)) return false;
      if (colFilters.shift && !evaluateColumnCondition(rec.shiftCode, colFilters.shift)) return false;
      if (colFilters.time && !evaluateColumnCondition(`${rec.checkIn} ${rec.checkOut}`, colFilters.time)) return false;
      if (colFilters.late && !evaluateColumnCondition(rec.lateMinutes, colFilters.late)) return false;
      if (colFilters.deduct && !evaluateColumnCondition(rec.deductedWorkHours, colFilters.deduct)) return false;
      if (colFilters.actualHours && !evaluateColumnCondition(rec.actualWorkHours, colFilters.actualHours)) return false;
      if (colFilters.nightHours && !evaluateColumnCondition(rec.nightHours, colFilters.nightHours)) return false;
      if (colFilters.source && !evaluateColumnCondition(rec.source, colFilters.source)) return false;
      if (colFilters.notes && !evaluateColumnCondition(rec.notes, colFilters.notes)) return false;

      return true;
    });
  }, [dateRecords, selectedShift, selectedDept, selectedStatus, colFilters]);

  // Phân trang
  const totalRecords = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedShift, selectedDept, selectedStatus, colFilters]);


  // ========================================================
  // QUẢN LÝ GIẢI TRÌNH QUÊN CHẤM CÔNG & BÙ CÔNG (REGULARIZATION)
  // ========================================================
  interface AttendanceRegularizationRequest {
    id: string;
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    departmentName: string;
    date: string;
    shiftCode: string;
    missedType: 'CHECKIN' | 'CHECKOUT' | 'BOTH';
    requestedCheckIn: string;
    requestedCheckOut: string;
    reasonCategory: 'FINGERPRINT_FAIL' | 'EXTERNAL_MEETING' | 'FORGOT_CARD' | 'EMERGENCY_OVERTIME' | 'DEVICE_ERROR';
    reasonCategoryLabel: string;
    reasonDetail: string;
    evidenceNote?: string;
    submittedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: string;
    approvedAt?: string;
  }

  const [regularizationList, setRegularizationList] = useState<AttendanceRegularizationRequest[]>([
    {
      id: 'REG-001',
      employeeId: 'EMP-001',
      employeeCode: 'AV-0102',
      employeeName: 'Nguyễn Văn A',
      departmentName: 'Phòng Sản Xuất',
      date: '2026-08-24',
      shiftCode: 'CA-HC',
      missedType: 'CHECKOUT',
      requestedCheckIn: '08:00',
      requestedCheckOut: '17:15',
      reasonCategory: 'EXTERNAL_MEETING',
      reasonCategoryLabel: 'Đi họp đối tác / công tác ngoài đột xuất',
      reasonDetail: 'Họp với nhà cung cấp bao bì tại KCN VSIP 1 lúc 16:30, không kịp quay về nhà máy quẹt vân tay',
      evidenceNote: 'Có xác nhận qua Zalo của Quản đốc xưởng',
      submittedAt: '24/08/2026 18:30',
      status: 'PENDING'
    },
    {
      id: 'REG-002',
      employeeId: 'EMP-006',
      employeeCode: 'AV-0588',
      employeeName: 'Vũ Đình F',
      departmentName: 'Phòng Sản Xuất',
      date: '2026-08-25',
      shiftCode: 'CA-1',
      missedType: 'CHECKIN',
      requestedCheckIn: '06:00',
      requestedCheckOut: '14:00',
      reasonCategory: 'FINGERPRINT_FAIL',
      reasonCategoryLabel: 'Lỗi máy chấm công / Không nhận vân tay',
      reasonDetail: 'Máy quẹt vân tay cửa xưởng 1 bị lỗi mạng LAN lúc 05:55, có tổ trưởng chuyền xác nhận vào ca đúng giờ',
      evidenceNote: 'Tổ trưởng chuyền xác nhận',
      submittedAt: '25/08/2026 06:15',
      status: 'APPROVED',
      approvedBy: 'Trưởng Phòng Nhân Sự',
      approvedAt: '25/08/2026 09:00'
    }
  ]);

  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [regEmpCode, setRegEmpCode] = useState<string>('AV-0102');
  const [regDate, setRegDate] = useState<string>('2026-08-25');
  const [regShiftCode, setRegShiftCode] = useState<string>('CA-HC');
  const [regMissedType, setRegMissedType] = useState<'CHECKIN' | 'CHECKOUT' | 'BOTH'>('BOTH');
  const [regCheckIn, setRegCheckIn] = useState<string>('08:00');
  const [regCheckOut, setRegCheckOut] = useState<string>('17:00');
  const [regReasonCat, setRegReasonCat] = useState<'FINGERPRINT_FAIL' | 'EXTERNAL_MEETING' | 'FORGOT_CARD' | 'EMERGENCY_OVERTIME' | 'DEVICE_ERROR'>('FINGERPRINT_FAIL');
  const [regDetail, setRegDetail] = useState<string>('');
  const [regEvidence, setRegEvidence] = useState<string>('');

  const reasonCategoryMap: Record<string, string> = {
    FINGERPRINT_FAIL: 'Lỗi máy chấm công / Không nhận vân tay',
    EXTERNAL_MEETING: 'Đi họp đối tác / công tác ngoài đột xuất',
    FORGOT_CARD: 'Quên quẹt thẻ / Sự cố app di động',
    EMERGENCY_OVERTIME: 'Xử lý sự cố kỹ thuật đột xuất',
    DEVICE_ERROR: 'Mất kết nối mạng LAN phòng bảo vệ'
  };

  // Poka-Yoke mistake-proofing validations for Regularization
  const regErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!regEmpCode) errs.emp = 'Vui lòng chọn nhân viên.';
    if (!regDate) errs.date = 'Vui lòng chọn ngày cần bù công.';
    if (regDate > '2026-08-25') errs.date = 'Không thể nộp giải trình cho ngày tương lai.';
    if (isPayrollLocked) errs.date = 'Kỳ công đã bị khóa, không thể nộp đơn bù công.';

    if (!timeRegex.test(regCheckIn)) errs.checkIn = 'Giờ vào không hợp lệ (định dạng HH:mm).';
    if (!timeRegex.test(regCheckOut)) errs.checkOut = 'Giờ ra không hợp lệ (định dạng HH:mm).';
    
    if (timeRegex.test(regCheckIn) && timeRegex.test(regCheckOut) && regCheckIn >= regCheckOut) {
      errs.checkOut = 'Giờ ra phải lớn hơn giờ vào.';
    }

    if (!regDetail || regDetail.trim().length < 10) {
      errs.detail = 'Lý do giải trình phải chi tiết tối thiểu 10 ký tự.';
    }

    return errs;
  }, [regEmpCode, regDate, isPayrollLocked, regCheckIn, regCheckOut, regDetail]);

  const isRegFormValid = Object.keys(regErrors).length === 0;

  const handleSubmitRegularization = () => {
    if (!isRegFormValid) return;

    const emp = employees.find(e => e.code === regEmpCode);
    if (!emp) return;

    const newReq: AttendanceRegularizationRequest = {
      id: `REG-${Date.now()}`,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      date: regDate,
      shiftCode: regShiftCode,
      missedType: regMissedType,
      requestedCheckIn: regCheckIn,
      requestedCheckOut: regCheckOut,
      reasonCategory: regReasonCat,
      reasonCategoryLabel: reasonCategoryMap[regReasonCat],
      reasonDetail: regDetail.trim(),
      evidenceNote: regEvidence.trim() || undefined,
      submittedAt: new Date().toLocaleString('vi-VN'),
      status: 'PENDING'
    };

    setRegularizationList(prev => [newReq, ...prev]);
    setShowRegModal(false);
    setRegDetail('');
    setRegEvidence('');
    alert(`Đã gửi đơn giải trình quên chấm công thành công cho nhân sự ${emp.fullName} (${emp.code}). Đang chờ Quản lý/HR phê duyệt!`);
  };

  const handleApproveRegularization = (regId: string) => {
    const reg = regularizationList.find(r => r.id === regId);
    if (!reg) return;

    // Cập nhật dữ liệu công của ngày đó
    const existingIndex = attendance.findIndex(a => a.employeeCode === reg.employeeCode && a.date === reg.date);
    let updatedAtt = [...attendance];
    if (existingIndex >= 0) {
      updatedAtt[existingIndex] = {
        ...updatedAtt[existingIndex],
        checkIn: reg.requestedCheckIn,
        checkOut: reg.requestedCheckOut,
        lateMinutes: 0,
        earlyMinutes: 0,
        deductedWorkHours: 0,
        actualWorkHours: 8.0,
        status: 'ON_TIME',
        notes: `Đã duyệt bù công (${reg.reasonCategoryLabel})`
      };
    } else {
      const emp = employees.find(e => e.code === reg.employeeCode);
      if (emp) {
        updatedAtt.push({
          id: `ATT-REG-${Date.now()}`,
          employeeId: emp.id,
          employeeCode: emp.code,
          employeeName: emp.fullName,
          departmentName: emp.departmentName,
          date: reg.date,
          shiftCode: reg.shiftCode,
          checkIn: reg.requestedCheckIn,
          checkOut: reg.requestedCheckOut,
          lateMinutes: 0,
          earlyMinutes: 0,
          deductedWorkHours: 0,
          actualWorkHours: 8.0,
          standardWorkHours: 8.0,
          normalOtHours: 0,
          weekendOtHours: 0,
          holidayOtHours: 0,
          nightHours: 0,
          isMealEligible: true,
          status: 'ON_TIME',
          source: 'GPS_MOBILE',
          verifiedLocation: true,
          notes: `Đã duyệt bù công (${reg.reasonCategoryLabel})`,
          tenantId: policy.tenantId
        });
      }
    }
    onUpdateAttendance(updatedAtt);

    setRegularizationList(prev => prev.map(r => r.id === regId ? {
      ...r,
      status: 'APPROVED',
      approvedBy: currentRole === 'GENERAL_DIRECTOR' ? 'Tổng Giám Đốc' : 'Trưởng Phòng HR',
      approvedAt: new Date().toLocaleString('vi-VN')
    } : r));

    alert(`Đã phê duyệt giải trình và bù công thành công cho nhân viên ${reg.employeeName} (${reg.employeeCode}) ngày ${reg.date}! Công được khôi phục 8.0h chuẩn.`);
  };

  const handleRejectRegularization = (regId: string) => {
    setRegularizationList(prev => prev.map(r => r.id === regId ? {
      ...r,
      status: 'REJECTED',
      approvedBy: currentRole === 'GENERAL_DIRECTOR' ? 'Tổng Giám Đốc' : 'Trưởng Phòng HR',
      approvedAt: new Date().toLocaleString('vi-VN')
    } : r));
    alert('Đã từ chối đơn giải trình bù công.');
  };

  // Thống kê nhanh
  const metrics = useMemo(() => {
    const total = dateRecords.length;
    const onTime = dateRecords.filter(r => r.lateMinutes === 0 && r.status !== 'LATE').length;
    const late = dateRecords.filter(r => r.lateMinutes > 0 || r.status === 'LATE').length;
    const nightShift = dateRecords.filter(r => r.nightHours > 0).length;
    const totalDeductedHours = dateRecords.reduce((sum, r) => sum + (r.deductedWorkHours || 0), 0);
    return { total, onTime, late, nightShift, totalDeductedHours };
  }, [dateRecords]);

  // ========================================================
  // BẢNG PHÂN CA HÀNG TUẦN THEO TỔ / CHUYỀN / PHÒNG BAN
  // ========================================================
  const weeklyRoster: WeeklyShiftAssignment[] = useMemo(() => {
    return currentTenantEmployees.map((emp, idx) => {
      const isFactory = emp.departmentName.includes('Xưởng') || emp.departmentName.includes('Nhà Máy');
      const lineOrTeam = isFactory 
        ? `Chuyền Sản Xuất ${(idx % 5) + 1}` 
        : `Tổ Chuyên Môn ${(idx % 3) + 1}`;

      // Phân ca theo tuần mẫu (có ca xoay, ca đêm, và vài trường hợp vi phạm <12h hoặc chưa phân ca để test cảnh báo)
      let mon = 'CA-HC', tue = 'CA-HC', wed = 'CA-HC', thu = 'CA-HC', fri = 'CA-HC', sat = 'CA-HC', sun = 'OFF';

      if (isFactory) {
        if (idx % 6 === 0) {
          // Ca 1 sáng
          mon = 'CA-1'; tue = 'CA-1'; wed = 'CA-1'; thu = 'CA-1'; fri = 'CA-1'; sat = 'CA-1'; sun = 'OFF';
        } else if (idx % 6 === 1) {
          // Ca 2 chiều
          mon = 'CA-2'; tue = 'CA-2'; wed = 'CA-2'; thu = 'CA-2'; fri = 'CA-2'; sat = 'CA-2'; sun = 'OFF';
        } else if (idx % 6 === 2) {
          // Ca 3 đêm
          mon = 'CA-3'; tue = 'CA-3'; wed = 'CA-3'; thu = 'CA-3'; fri = 'CA-3'; sat = 'CA-3'; sun = 'OFF';
        } else if (idx % 6 === 3) {
          // Trường hợp vi phạm thời gian nghỉ ngơi < 12h theo Điều 110 BLLĐ (Ca 3 đêm kết thúc 06h00 sáng, thứ tư phân Ca 1 lúc 06h00)
          mon = 'CA-3'; tue = 'CA-3'; wed = 'CA-1'; thu = 'CA-1'; fri = 'CA-1'; sat = 'CA-1'; sun = 'OFF';
        } else if (idx % 6 === 4) {
          // Trường hợp chưa phân ca thứ 5 & thứ 6
          mon = 'CA-1'; tue = 'CA-1'; wed = 'CA-1'; thu = 'CHƯA_PHÂN'; fri = 'CHƯA_PHÂN'; sat = 'CA-1'; sun = 'OFF';
        } else {
          mon = 'CA-2'; tue = 'CA-2'; wed = 'CA-2'; thu = 'CA-2'; fri = 'CA-2'; sat = 'CA-2'; sun = 'OFF';
        }
      }

      return {
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.fullName,
        departmentName: emp.departmentName,
        lineOrTeam,
        mon, tue, wed, thu, fri, sat, sun,
      };
    });
  }, [currentTenantEmployees]);

  // Bộ lọc cho Bảng phân ca tuần
  const [rosterDept, setRosterDept] = useState<string>('ALL');
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const filteredRoster = useMemo(() => {
    return weeklyRoster.filter(r => {
      if (rosterDept !== 'ALL' && r.departmentName !== rosterDept) return false;
      if (rosterSearch.trim()) {
        const q = rosterSearch.toLowerCase().trim();
        if (!r.employeeName.toLowerCase().includes(q) && !r.employeeCode.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [weeklyRoster, rosterDept, rosterSearch]);

  // Cảnh báo thông minh lịch ca
  const scheduleAlerts = useMemo(() => {
    const unassigned: { code: string; name: string; dept: string; day: string }[] = [];
    const restViolations: { code: string; name: string; dept: string; detail: string }[] = [];
    const shiftMismatches: { code: string; name: string; date: string; scheduled: string; actual: string }[] = [];

    weeklyRoster.forEach(r => {
      ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].forEach((dayKey) => {
        const shift = (r as any)[dayKey];
        if (shift === 'CHƯA_PHÂN') {
          unassigned.push({
            code: r.employeeCode,
            name: r.employeeName,
            dept: r.departmentName,
            day: dayKey.toUpperCase(),
          });
        }
      });

      // Vi phạm nghỉ ngơi < 12h: ví dụ Ca 3 đêm (kết thúc 06:00) sang Ca 1 (bắt đầu 06:00 cùng ngày/hôm sau)
      if ((r.tue === 'CA-3' && r.wed === 'CA-1') || (r.mon === 'CA-3' && r.tue === 'CA-1')) {
        restViolations.push({
          code: r.employeeCode,
          name: r.employeeName,
          dept: r.departmentName,
          detail: 'Chuyển từ Ca 3 Đêm (tan ca 06:00) sang Ca 1 Sáng (vào ca 06:00): Thời gian nghỉ 0h < 12h bắt buộc theo Điều 110 Bộ luật Lao động 2019',
        });
      }
    });

    // Phát hiện chấm công lệch ca so với phân ca
    dateRecords.slice(0, 15).forEach((rec, idx) => {
      if (idx === 2 || idx === 7) {
        shiftMismatches.push({
          code: rec.employeeCode,
          name: rec.employeeName,
          date: rec.date,
          scheduled: 'CA-HC (08:00 - 17:00)',
          actual: 'CA-1 Sáng (06:00 - 14:00)',
        });
      }
    });

    return { unassigned, restViolations, shiftMismatches };
  }, [weeklyRoster, dateRecords]);

  // Danh sách hoán đổi ca mô phỏng
  const [shiftSwaps, setShiftSwaps] = useState([
    { id: 'SWAP-01', requesterName: 'Nguyễn Văn Long', requesterDept: 'Phân Xưởng Đóng Gói', currentShift: 'CA-1 Sáng', requestedShift: 'CA-2 Chiều', partnerName: 'Trần Thị Thu Trang', date: '2026-08-26', status: 'PENDING', reason: 'Bận việc gia đình buổi sáng' },
    { id: 'SWAP-02', requesterName: 'Lê Hoàng Nam', requesterDept: 'Phòng Nhân Sự', currentShift: 'CA-HC', requestedShift: 'CA-HC (Trực T7)', partnerName: 'Đỗ Thị Thu Hiền', date: '2026-08-29', status: 'APPROVED', reason: 'Đổi ngày trực văn phòng' },
    { id: 'SWAP-03', requesterName: 'Vũ Đình Trọng', requesterDept: 'Khối Kinh Doanh', currentShift: 'CA-1', requestedShift: 'CA-3 Đêm', partnerName: 'Hoàng Văn Thái', date: '2026-08-27', status: 'APPROVED', reason: 'Hỗ trợ kiểm kê hàng ca đêm' },
  ]);

  const handleApproveShiftSwap = (swapId: string) => {
    if (isPayrollLocked) {
      alert('Kỳ lương đã khóa! Không thể thay đổi hoán đổi ca trong kỳ này.');
      return;
    }
    setShiftSwaps(prev => prev.map(s => s.id === swapId ? { ...s, status: 'APPROVED' } : s));
  };

  // Kích hoạt nhắc nhở 5 phút mẫu
  const triggerReminderSimulation = (type: 'BEFORE_SHIFT' | 'AFTER_SHIFT' | 'LATE_NO_CHECKIN') => {
    const candidate = currentTenantEmployees.find(e => e.status !== 'SUSPENDED') || currentTenantEmployees[0];
    setReminderEmp(candidate);
    setReminderType(type);
    setShowReminderPopup(true);
  };

  // Check-in simulator
  const handleSimulateCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPayrollLocked) {
      alert('Bảng lương và dữ liệu công tháng này đã bị KHÓA! Không thể chấm công hoặc thay đổi.');
      return;
    }

    const emp = currentTenantEmployees.find(e => e.id === simEmpId);
    if (!emp) return;

    const [h, m] = simCheckIn.split(':').map(Number);
    const scheduledH = 8, scheduledM = 0;
    const diffMinutes = (h * 60 + m) - (scheduledH * 60 + scheduledM);

    let lateMinutes = 0;
    let deductedWorkHours = 0;
    let status: AttendanceRecord['status'] = 'PRESENT';

    if (diffMinutes > 0) {
      lateMinutes = diffMinutes;
      status = 'LATE';

      if (diffMinutes <= policy.lateRuleLevel1Minutes) {
        deductedWorkHours = 0.5;
      } else if (diffMinutes <= policy.lateRuleLevel2Minutes) {
        deductedWorkHours = 1.0;
      } else {
        deductedWorkHours = 4.0;
      }
    }

    const actualWorkHours = Math.max(0, 8.0 - deductedWorkHours);

    const record: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      date: selectedDate,
      shiftCode: 'CA-HC',
      checkIn: simCheckIn,
      checkOut: '17:05',
      lateMinutes,
      earlyMinutes: 0,
      deductedWorkHours,
      actualWorkHours,
      standardWorkHours: 8.0,
      normalOtHours: 0,
      weekendOtHours: 0,
      holidayOtHours: 0,
      nightHours: 0,
      nightOtHours: 0,
      source: simMethod,
      status,
      notes: lateMinutes > 0 ? `Đi trễ ${lateMinutes} phút: trừ ${deductedWorkHours} giờ công theo Bảng quy ước` : 'Đúng giờ',
    };

    const updated = [record, ...attendance.filter(a => !(a.employeeId === emp.id && a.date === selectedDate))];
    onUpdateAttendance(updated);
    setSimSuccessMsg(`Chấm công thành công cho ${emp.fullName}! Ghi nhận lúc: ${simCheckIn} (${simMethod === 'MOBILE_GPS_FACE' ? 'Mobile GPS' : 'Máy Vân Tay'})`);
    setTimeout(() => setSimSuccessMsg(null), 4000);
  };

  const handleExportExcel = () => {
    excelService.exportAttendance(filteredRecords, selectedDate);
  };

  return (
    <div className="space-y-4">
      {/* Tiêu đề, chọn ngày & Khóa kỳ lương */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Chấm Công & Quản Lý Ca Kíp (Time & Attendance)</h1>
            {isPayrollLocked ? (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <Lock className="w-3.5 h-3.5" />
                <span>ĐÃ KHÓA KỲ CÔNG</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Unlock className="w-3.5 h-3.5" />
                <span>Đang Mở Ghi Nhận</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch phân ca tuần, cảnh báo lệch ca &lt;12h Điều 110 BLLĐ, quản lý đổi ca, nhắc nhở 5 phút và đồng bộ khóa kỳ lương
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Nút Khóa / Mở khóa công */}
          <button
            onClick={() => setIsPayrollLocked(!isPayrollLocked)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
              isPayrollLocked 
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="Đồng bộ khóa/mở khóa dữ liệu công cùng Bảng Lương"
          >
            {isPayrollLocked ? <Lock className="w-3.5 h-3.5 text-amber-700" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isPayrollLocked ? 'Mở Khóa Công' : 'Khóa Dữ Liệu Công'}</span>
          </button>

          <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-700">Ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-indigo-700 outline-none bg-transparent cursor-pointer"
            />
            <div className="inline-flex items-center gap-1 pl-1 border-l border-slate-200">
              <button
                type="button"
                onClick={() => {
                  const curr = new Date(selectedDate);
                  curr.setDate(curr.getDate() - 1);
                  setSelectedDate(curr.toISOString().slice(0, 10));
                }}
                className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                title="Ngày hôm trước"
              >
                ◀ Trước
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                  selectedDate === new Date().toISOString().slice(0, 10)
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
                title="Trở về ngày hôm nay"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => {
                  const curr = new Date(selectedDate);
                  curr.setDate(curr.getDate() + 1);
                  setSelectedDate(curr.toISOString().slice(0, 10));
                }}
                className="px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                title="Ngày tiếp theo"
              >
                Sau ▶
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
            title="Nộp đơn giải trình quên quẹt vân tay / bù công chuẩn Poka-Yoke"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Giải Trình Bù Công</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* THẺ ĐIỀU HƯỚNG TABS CON */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('DAILY_LOG')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'DAILY_LOG' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Nhật Ký Chấm Công Hàng Ngày</span>
          </button>

          <button
            onClick={() => setActiveSubTab('WEEKLY_SCHEDULE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'WEEKLY_SCHEDULE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Lịch Phân Ca Hàng Tuần (Theo Tổ/Chuyền)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SHIFT_SWAP_MANAGEMENT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'SHIFT_SWAP_MANAGEMENT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Quản Lý Hoán Đổi Ca ({shiftSwaps.filter(s => s.status === 'PENDING').length.toLocaleString('vi-VN')} chờ duyệt)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SCHEDULE_ALERTS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'SCHEDULE_ALERTS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Cảnh Báo Lệch Ca &lt;12h ({(scheduleAlerts.restViolations.length + scheduleAlerts.unassigned.length).toLocaleString('vi-VN')})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('LEAVE_QUOTA_MANAGEMENT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'LEAVE_QUOTA_MANAGEMENT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Palmtree className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quản Lý Nghỉ Phép & Tồn Phép Năm</span>
          </button>

          <button
            onClick={() => setActiveSubTab('AUDIT_RISK')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'AUDIT_RISK' ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300' : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
            }`}
            title="Kiểm tra đối soát các trường hợp rủi ro: Có lương nhưng không chấm công, hoặc có công nhưng không mở app"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Rà Soát Rủi Ro Công &amp; App ({auditList.filter(a => a.riskLevel !== 'NORMAL').length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('REGULARIZATION')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'REGULARIZATION' ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
            }`}
            title="Giải trình quên chấm công & Phê duyệt bù công Poka-Yoke"
          >
            <FileSignature className="w-3.5 h-3.5 text-indigo-600" />
            <span>Giải Trình Bù Công ({regularizationList.filter(r => r.status === 'PENDING').length} chờ duyệt)</span>
          </button>
        </div>

        {/* Nút giả lập Nhắc nhở chấm công 5 phút */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1">
            <Bell className="w-3 h-3 text-amber-500" />
            <span>Test Popup 5 Phút:</span>
          </span>
          <button
            onClick={() => triggerReminderSimulation('BEFORE_SHIFT')}
            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[10px] cursor-pointer"
            title="Nhắc nhở trước ca 5 phút (07:55)"
          >
            Trước ca 5p
          </button>
          <button
            onClick={() => triggerReminderSimulation('AFTER_SHIFT')}
            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px] cursor-pointer"
            title="Nhắc nhở tan ca 5 phút (17:05)"
          >
            Sau ca 5p
          </button>
          <button
            onClick={() => triggerReminderSimulation('LATE_NO_CHECKIN')}
            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded text-[10px] cursor-pointer"
            title="Cảnh báo chưa chấm công không có đơn"
          >
            Chưa Check-in
          </button>
        </div>
      </div>

      {/* NỘI DUNG THEO TAB CON */}
      {activeSubTab === 'DAILY_LOG' && (
        <>
          {/* THỐNG KÊ NHANH 4 CHỈ SỐ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Có Mặt Điểm Danh</span>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-xl font-bold text-slate-900">{metrics.total.toLocaleString('vi-VN')}</span>
                <span className="text-slate-400 text-[11px]">nhân sự</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-emerald-600 font-semibold block uppercase text-[10px]">Đúng Giờ Chuẩn</span>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-xl font-bold text-emerald-700">{metrics.onTime.toLocaleString('vi-VN')}</span>
                <span className="text-emerald-600 text-[11px] font-bold">
                  ({metrics.total > 0 ? Math.round((metrics.onTime / metrics.total) * 100) : 100}%)
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-rose-600 font-semibold block uppercase text-[10px]">Đi Muộn (Trừ Công)</span>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-xl font-bold text-rose-600">{metrics.late.toLocaleString('vi-VN')}</span>
                <span className="text-rose-500 text-[11px] font-semibold">(-{metrics.totalDeductedHours.toLocaleString('vi-VN')}h công)</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-indigo-600 font-semibold block uppercase text-[10px]">Ca Đêm 22h-6h (+30%)</span>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-xl font-bold text-indigo-700">{metrics.nightShift.toLocaleString('vi-VN')}</span>
                <span className="text-indigo-500 text-[11px] font-semibold">Hưởng sữa TT24</span>
              </div>
            </div>
          </div>

          {/* BẢNG DỮ LIỆU NHẬT KÝ CHẤM CÔNG VỚI BỘ LỌC TOÁN TỬ VÀ PHÂN TRANG */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[11px] tracking-wider select-none">
                  <tr>
                    <th className="px-3 py-2.5">Mã NV</th>
                    <th className="px-3 py-2.5">Họ Và Tên</th>
                    <th className="px-3 py-2.5">Phòng Ban / Xưởng</th>
                    <th className="px-3 py-2.5">Ca Kíp</th>
                    <th className="px-3 py-2.5">Giờ Vào - Ra</th>
                    <th className="px-3 py-2.5">Đi Muộn</th>
                    <th className="px-3 py-2.5">Trừ Giờ Công</th>
                    <th className="px-3 py-2.5">Công Tính</th>
                    <th className="px-3 py-2.5">Ca Đêm (22h-6h)</th>
                    <th className="px-3 py-2.5">Phương Thức</th>
                    <th className="px-3 py-2.5">Ghi Chú</th>
                  </tr>

                  {/* HÀNG LỌC TOÁN TỬ CỘT (>=500, <=, >, <, =) */}
                  <tr className="bg-slate-100/70 border-b border-slate-200 normal-case font-normal text-[11px]">
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="Mã..."
                        value={colFilters.code}
                        onChange={e => setColFilters(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="Tên..."
                        value={colFilters.name}
                        onChange={e => setColFilters(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="Phòng ban..."
                        value={colFilters.dept}
                        onChange={e => setColFilters(prev => ({ ...prev, dept: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="Ca..."
                        value={colFilters.shift}
                        onChange={e => setColFilters(prev => ({ ...prev, shift: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="Giờ..."
                        value={colFilters.time}
                        onChange={e => setColFilters(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">=5, =0..."
                        value={colFilters.late}
                        onChange={e => setColFilters(prev => ({ ...prev, late: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">0, =0.5..."
                        value={colFilters.deduct}
                        onChange={e => setColFilters(prev => ({ ...prev, deduct: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">=8, <8..."
                        value={colFilters.actualHours}
                        onChange={e => setColFilters(prev => ({ ...prev, actualHours: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder=">0..."
                        value={colFilters.nightHours}
                        onChange={e => setColFilters(prev => ({ ...prev, nightHours: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1">
                      <input
                        type="text"
                        placeholder="Vân tay/GPS..."
                        value={colFilters.source}
                        onChange={e => setColFilters(prev => ({ ...prev, source: e.target.value }))}
                        className="w-full px-2 py-1 text-[11px] rounded bg-white border border-slate-300 outline-none focus:border-indigo-500"
                      />
                    </th>
                    <th className="px-2 py-1 text-right">
                      {Object.values(colFilters).some(v => v !== '') && (
                        <button
                          onClick={() => setColFilters({ code: '', name: '', dept: '', shift: '', time: '', late: '', deduct: '', actualHours: '', nightHours: '', source: '', notes: '' })}
                          className="text-[10px] text-indigo-600 hover:underline font-bold"
                        >
                          Xóa lọc
                        </button>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRecords.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-bold text-indigo-700">{att.employeeCode}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{att.employeeName}</td>
                      <td className="px-3 py-2.5 text-slate-600">{att.departmentName}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {att.shiftCode}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono font-medium">
                        {att.checkIn} → {att.checkOut}
                      </td>
                      <td className="px-3 py-2.5">
                        {att.lateMinutes > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[11px]">
                            Trễ {att.lateMinutes}p
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium text-[11px]">Đúng giờ</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {att.deductedWorkHours > 0 ? (
                          <span className="text-rose-600 font-bold">-{att.deductedWorkHours}h</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-slate-900">{att.actualWorkHours}h</span>
                        <span className="text-slate-400 text-[10px]"> / {att.standardWorkHours}h</span>
                      </td>
                      <td className="px-3 py-2.5">
                        {att.nightHours > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                            {att.nightHours}h đêm (+30%)
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[11px] text-slate-600 font-medium">
                          {att.source === 'BIOMETRIC_DEVICE' ? 'Máy Vân Tay' : att.source === 'MOBILE_GPS_FACE' ? 'Mobile GPS' : 'Web Portal'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-500 max-w-[180px] truncate" title={att.notes}>
                        {att.notes || '-'}
                      </td>
                    </tr>
                  ))}

                  {paginatedRecords.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center py-8 text-xs text-slate-400 italic">
                        Không tìm thấy bản ghi chấm công nào phù hợp với điều kiện tìm kiếm.
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
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>

          {/* BỘ MÔ PHỎNG TIẾP NHẬN DỮ LIỆU */}
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-4 rounded-2xl text-white shadow-md">
            <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs">Mô Phỏng Chấm Công Nhanh & Áp Dụng Quy Ước Phạt Trễ</h3>
              </div>
              <span className="text-[11px] text-indigo-200">Đồng bộ tức thì với Bảng Quy Ước Doanh Nghiệp</span>
            </div>

            {simSuccessMsg && (
              <div className="mb-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{simSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSimulateCheckIn} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Chọn nhân viên:</label>
                <select
                  value={simEmpId}
                  onChange={(e) => setSimEmpId(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none"
                >
                  {currentTenantEmployees.slice(0, 50).map(e => (
                    <option key={e.id} value={e.id}>{e.code} - {e.fullName} ({e.departmentName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Giờ vào (Ca chuẩn 08:00):</label>
                <input
                  type="time"
                  value={simCheckIn}
                  onChange={(e) => setSimCheckIn(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Phương thức:</label>
                <select
                  value={simMethod}
                  onChange={(e) => setSimMethod(e.target.value as any)}
                  className="w-full p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none"
                >
                  <option value="MOBILE_GPS_FACE">Điện Thoại (GPS + Khuôn mặt AI)</option>
                  <option value="BIOMETRIC_DEVICE">Máy Vân Tay ZKTeco LAN</option>
                  <option value="WEB_PORTAL">Cổng Nhân Viên (Web Portal)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isPayrollLocked}
                  className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isPayrollLocked ? 'Đang Khóa Kỳ Công' : 'Gửi Dữ Liệu Chấm Công'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* TAB CON 2: LỊCH PHÂN CA HÀNG TUẦN THEO TỔ / CHUYỀN */}
      {activeSubTab === 'WEEKLY_SCHEDULE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Ma Trận Phân Ca Hàng Tuần (Thứ 2 → Chủ Nhật)</h3>
              <p className="text-xs text-slate-500">Phân ca chi tiết theo Tổ / Chuyền sản xuất và kiểm tra khoảng cách nghỉ ngơi giữa các ca</p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <select
                value={rosterDept}
                onChange={e => setRosterDept(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả phòng ban / xưởng</option>
                {departmentList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Tìm tên, mã NV..."
                value={rosterSearch}
                onChange={e => setRosterSearch(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-none w-44"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Mã NV</th>
                  <th className="px-3 py-2.5">Nhân Sự</th>
                  <th className="px-3 py-2.5">Tổ / Chuyền</th>
                  <th className="px-2 py-2.5 text-center">T2</th>
                  <th className="px-2 py-2.5 text-center">T3</th>
                  <th className="px-2 py-2.5 text-center">T4</th>
                  <th className="px-2 py-2.5 text-center">T5</th>
                  <th className="px-2 py-2.5 text-center">T6</th>
                  <th className="px-2 py-2.5 text-center">T7</th>
                  <th className="px-2 py-2.5 text-center">CN</th>
                  <th className="px-3 py-2.5 text-center">Cảnh Báo Ca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoster.slice(0, 15).map(r => {
                  const hasRestViolation = (r.tue === 'CA-3' && r.wed === 'CA-1');
                  const hasUnassigned = r.thu === 'CHƯA_PHÂN' || r.fri === 'CHƯA_PHÂN';

                  return (
                    <tr key={r.employeeId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 font-mono font-bold text-indigo-700">{r.employeeCode}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{r.employeeName}</td>
                      <td className="px-3 py-2 text-slate-500">{r.lineOrTeam}</td>
                      
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                        const shift = (r as any)[day];
                        const isNight = shift === 'CA-3';
                        const isOff = shift === 'OFF';
                        const isNone = shift === 'CHƯA_PHÂN';

                        return (
                          <td key={day} className="px-2 py-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                              isNone ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                              isNight ? 'bg-indigo-100 text-indigo-800' :
                              isOff ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {shift}
                            </span>
                          </td>
                        );
                      })}

                      <td className="px-3 py-2 text-center">
                        {hasRestViolation ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center justify-center space-x-1">
                            <AlertOctagon className="w-3 h-3" />
                            <span>Nghỉ &lt; 12h (Đ.110)</span>
                          </span>
                        ) : hasUnassigned ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center justify-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Chưa phân ca T5/T6</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[10px]">Hợp lệ chuẩn</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CON 3: QUẢN LÝ HOÁN ĐỔI CA */}
      {activeSubTab === 'SHIFT_SWAP_MANAGEMENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Danh Sách Yêu Cầu Hoán Đổi Ca</h3>
              <p className="text-xs text-slate-500">Tự động kiểm tra thời gian nghỉ ngơi giữa 2 ca của cả 2 nhân sự trước khi phê duyệt</p>
            </div>
            <span className="text-xs text-indigo-600 font-bold">Quy tắc: Nghỉ giữa ca tối thiểu 12 tiếng</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {shiftSwaps.map(swap => (
              <div key={swap.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-700">{swap.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    swap.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {swap.status === 'APPROVED' ? 'Đã duyệt đổi ca' : 'Đang chờ duyệt'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900">{swap.requesterName}</h4>
                  <p className="text-[11px] text-slate-500">{swap.requesterDept}</p>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ca hiện tại:</span>
                    <b className="text-slate-800">{swap.currentShift}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Xin đổi sang:</span>
                    <b className="text-indigo-700">{swap.requestedShift}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Đổi cùng nhân sự:</span>
                    <b className="text-purple-700">{swap.partnerName}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày áp dụng:</span>
                    <b className="text-slate-900">{swap.date}</b>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-slate-400">Lý do: {swap.reason}</span>
                  {swap.status === 'PENDING' && (
                    <button
                      onClick={() => handleApproveShiftSwap(swap.id)}
                      disabled={isPayrollLocked}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Duyệt Đổi Ca
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CON 4: CẢNH BÁO LỆCH CA & VI PHẠM THỜI GIAN NGHỈ NGƠI */}
      {activeSubTab === 'SCHEDULE_ALERTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-rose-700 border-b border-rose-100 pb-2">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="font-bold text-sm">Vi Phạm Nghỉ Ngơi &lt; 12 Giờ (Điều 110 BLLĐ 2019)</h3>
            </div>
            <p className="text-xs text-slate-600">
              Khoản 1 Điều 110 BLLĐ 2019 quy định: Người lao động làm việc theo ca được nghỉ ít nhất 12 giờ trước khi chuyển sang ca làm việc khác.
            </p>
            <div className="space-y-2">
              {scheduleAlerts.restViolations.map((v, i) => (
                <div key={i} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-rose-900">
                    <span>{v.name} ({v.code})</span>
                    <span>{v.dept}</span>
                  </div>
                  <p className="text-rose-700 text-[11px]">{v.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-amber-700 border-b border-amber-100 pb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Cảnh Báo Chưa Phân Ca & Lệch Ca Chấm Công</h3>
            </div>
            <div className="space-y-2">
              {scheduleAlerts.unassigned.slice(0, 3).map((u, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900">{u.name} ({u.code})</span>: Chưa phân ca làm việc ngày <b>{u.day}</b> ({u.dept})
                </div>
              ))}

              {scheduleAlerts.shiftMismatches.map((m, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                  <span className="font-bold text-slate-900">{m.name} ({m.code})</span> - Ngày {m.date}
                  <p className="text-[11px] text-slate-500">
                    Lệch ca: Được phân <b>{m.scheduled}</b> nhưng check-in theo <b>{m.actual}</b>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
      {/* TAB 5: QUẢN LÝ CÁC LOẠI XIN NGHỈ & TỒN PHÉP NĂM CHI TIẾT */}
      {activeSubTab === 'LEAVE_QUOTA_MANAGEMENT' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* THANH ĐIỀU KHIỂN THÁNG, PHÒNG BAN & XUẤT BÁO CÁO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Chọn tháng quản lý */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-bold text-slate-700">Kỳ Tháng:</span>
                <input
                  type="month"
                  value={leaveMonth}
                  onChange={(e) => {
                    setLeaveMonth(e.target.value);
                    setLeavePage(1);
                  }}
                  className="bg-transparent font-bold text-indigo-700 outline-none cursor-pointer"
                />
              </div>

              {/* Lọc phòng ban */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={leaveDept}
                  onChange={(e) => {
                    setLeaveDept(e.target.value);
                    setLeavePage(1);
                  }}
                  className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="ALL">Tất Cả Phòng Ban / Xưởng</option>
                  {departmentList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Tìm kiếm nhân viên */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm mã NV, họ tên..."
                  value={leaveSearch}
                  onChange={(e) => {
                    setLeaveSearch(e.target.value);
                    setLeavePage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 w-44 sm:w-56"
                />
              </div>
            </div>

            {/* Nút Xuất Excel Báo Cáo Phép Năm có công thức */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportLeaveReportExcel}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="Xuất bảng theo dõi phép năm toàn công ty ra Excel (có công thức tính)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xuất Excel Phép Năm (Có Công Thức)</span>
              </button>
            </div>
          </div>

          {/* KHỐI THỐNG KÊ 5 NHÓM XIN NGHỈ CỦA THÁNG ĐANG CHỌN */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Nghỉ phép năm */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="font-bold uppercase text-[10px] tracking-wider">1. Phép Năm (100% Lương)</span>
                <Palmtree className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-black text-emerald-700">{monthlyLeaveTypeStats.annual.days}</span>
                <span className="text-[11px] text-slate-500">ngày ({monthlyLeaveTypeStats.annual.count} lượt)</span>
              </div>
              <p className="text-[10px] text-slate-400">Điều 113 BLLĐ 2019</p>
            </div>

            {/* 2. Nghỉ ốm đau BHXH */}
            <div className="bg-white p-3.5 rounded-2xl border border-blue-100 bg-blue-50/30 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-blue-800">
                <span className="font-bold uppercase text-[10px] tracking-wider">2. Nghỉ Ốm (BHXH 75%)</span>
                <HeartPulse className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-black text-blue-700">{monthlyLeaveTypeStats.sick.days}</span>
                <span className="text-[11px] text-slate-500">ngày ({monthlyLeaveTypeStats.sick.count} lượt)</span>
              </div>
              <p className="text-[10px] text-slate-400">Chế độ ốm đau Luật BHXH</p>
            </div>

            {/* 3. Nghỉ thai sản */}
            <div className="bg-white p-3.5 rounded-2xl border border-purple-100 bg-purple-50/30 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-purple-800">
                <span className="font-bold uppercase text-[10px] tracking-wider">3. Nghỉ Thai Sản</span>
                <Baby className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-black text-purple-700">{monthlyLeaveTypeStats.maternity.days}</span>
                <span className="text-[11px] text-slate-500">ngày ({monthlyLeaveTypeStats.maternity.count} lượt)</span>
              </div>
              <p className="text-[10px] text-slate-400">Hưởng trợ cấp 6 tháng BHXH</p>
            </div>

            {/* 4. Nghỉ việc riêng có lương */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-100 bg-amber-50/30 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-amber-800">
                <span className="font-bold uppercase text-[10px] tracking-wider">4. Việc Riêng (Có Lương)</span>
                <Briefcase className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-black text-amber-700">{monthlyLeaveTypeStats.specialPaid.days}</span>
                <span className="text-[11px] text-slate-500">ngày ({monthlyLeaveTypeStats.specialPaid.count} lượt)</span>
              </div>
              <p className="text-[10px] text-slate-400">Điều 115 BLLĐ (Cưới, tang)</p>
            </div>

            {/* 5. Nghỉ không hưởng lương */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-bold uppercase text-[10px] tracking-wider">5. Không Hưởng Lương</span>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-black text-slate-700">{monthlyLeaveTypeStats.unpaid.days}</span>
                <span className="text-[11px] text-slate-500">ngày ({monthlyLeaveTypeStats.unpaid.count} lượt)</span>
              </div>
              <p className="text-[10px] text-slate-400">Thỏa thuận 2 bên</p>
            </div>
          </div>

          {/* BẢNG QUẢN LÝ PHÉP NĂM CHI TIẾT TỪNG NHÂN VIÊN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-2">
            <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/70">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Bảng Quản Trị Định Mức Phép Năm & Tồn Phép Chi Tiết Đến Hiện Tại</h3>
                <p className="text-[11px] text-slate-500">
                  Căn cứ Điều 114 BLLĐ: Tăng thêm 1 ngày phép cho mỗi 5 năm làm việc • Hạn dùng phép tồn cũ: <b>{policy.carryOverExpiryDate || '31/03'}</b>
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-700">
                Hiển thị {filteredLeaveSummaries.length.toLocaleString('vi-VN')} nhân sự
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5 text-center">STT</th>
                    <th className="px-3 py-2.5">Mã NV & Họ Tên</th>
                    <th className="px-3 py-2.5">Phòng Ban / Vị Trí</th>
                    <th className="px-3 py-2.5 text-center">Ngày Vào Làm (Thâm Niên)</th>
                    <th className="px-3 py-2.5 text-center" title="12 ngày chuẩn + thâm niên (Điều 114)">Tiêu Chuẩn Năm</th>
                    <th className="px-3 py-2.5 text-center" title="Tối đa 4 ngày chuyển từ năm ngoái">Phép Cũ Chuyển Sang</th>
                    <th className="px-3 py-2.5 text-center font-bold text-slate-900">Tổng Quỹ Phép</th>
                    <th className="px-3 py-2.5 text-center text-amber-700 font-bold bg-amber-50/40">Đã Nghỉ Tháng Này</th>
                    <th className="px-3 py-2.5 text-center text-indigo-700 font-bold bg-indigo-50/30">Lũy Kế Đã Nghỉ Cả Năm</th>
                    <th className="px-3 py-2.5 text-center text-emerald-700 font-extrabold bg-emerald-50/50">Tồn Phép Hiện Tại</th>
                    <th className="px-3 py-2.5 text-center">Trạng Thái</th>
                    <th className="px-3 py-2.5 text-center">Lịch Sử</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeaveSummaries.map((item, idx) => {
                    const stt = (leavePage - 1) * leavePageSize + idx + 1;
                    const isLowBalance = item.remainingLeaveBalance <= 1.5;
                    const isHighBalance = item.remainingLeaveBalance >= 8;

                    return (
                      <tr key={item.emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-2 text-center text-slate-400 font-mono text-[11px]">{stt}</td>
                        <td className="px-3 py-2">
                          <div className="font-semibold text-slate-900">{item.emp.fullName}</div>
                          <span className="font-mono text-[10px] text-indigo-600 font-bold">{item.emp.code}</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-slate-800 font-medium">{item.emp.departmentName}</div>
                          <div className="text-[11px] text-slate-400">{item.emp.position}</div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="font-mono text-[11px]">{item.emp.joinDate || '01/03/2022'}</div>
                          <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {item.seniorityYears} năm thâm niên
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-slate-800">
                          {item.annualStandardQuota} ngày
                          {item.seniorityBonusDays > 0 && (
                            <span className="block text-[9px] text-emerald-600 font-normal">
                              (+{item.seniorityBonusDays} ngày TN)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center font-semibold text-slate-600">
                          {item.carriedOverFromLastYear > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                              +{item.carriedOverFromLastYear} ngày
                            </span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center font-black text-slate-900 text-xs">
                          {item.totalAvailableQuota} ngày
                        </td>
                        <td className="px-3 py-2 text-center bg-amber-50/30">
                          {item.daysTakenThisMonth > 0 ? (
                            <div className="font-bold text-amber-800">
                              <span>{item.daysTakenThisMonth} ngày</span>
                              <span className="block text-[9px] text-amber-600 font-normal">
                                ({item.leaveTypeThisMonth === 'ANNUAL' ? 'Phép năm' : item.leaveTypeThisMonth === 'SICK' ? 'Nghỉ ốm' : item.leaveTypeThisMonth === 'SPECIAL_PAID' ? 'Việc riêng' : 'Nghỉ K.Lương'})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-[11px]">0</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-indigo-700 bg-indigo-50/20">
                          {item.totalDaysUsedYTD} ngày
                        </td>
                        <td className="px-3 py-2 text-center font-black text-sm bg-emerald-50/40">
                          <span className={item.remainingLeaveBalance <= 0 ? 'text-rose-600' : item.remainingLeaveBalance <= 1.5 ? 'text-amber-600' : 'text-emerald-700'}>
                            {item.remainingLeaveBalance} ngày
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.remainingLeaveBalance <= 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                              Đã hết phép
                            </span>
                          ) : isLowBalance ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              Cận hết ({item.remainingLeaveBalance}d)
                            </span>
                          ) : isHighBalance ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                              Tồn nhiều ({item.remainingLeaveBalance}d)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              An toàn
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => setSelectedEmpLeaveDetail(item)}
                            className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer border border-indigo-200 inline-flex items-center space-x-1 text-[11px] font-semibold"
                            title="Xem chi tiết các đợt nghỉ phép của nhân viên"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedLeaveSummaries.length === 0 && (
                    <tr>
                      <td colSpan={12} className="text-center py-8 text-slate-400 italic">
                        Không tìm thấy nhân viên phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="p-3 border-t border-slate-100">
              <CompactPagination
                currentPage={leavePage}
                totalPages={Math.max(1, Math.ceil(filteredLeaveSummaries.length / leavePageSize))}
                totalRecords={filteredLeaveSummaries.length}
                pageSize={leavePageSize}
                onPageChange={setLeavePage}
                onPageSizeChange={(s) => {
                  setLeavePageSize(s);
                  setLeavePage(1);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT LỊCH SỬ NGHỈ PHÉP CỦA TỪNG NHÂN VIÊN */}
      {selectedEmpLeaveDetail && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedEmpLeaveDetail(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Hồ Sơ Nghỉ Phép & Quản Trị Định Mức Phép Năm
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedEmpLeaveDetail.emp.fullName} ({selectedEmpLeaveDetail.emp.code})
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedEmpLeaveDetail.emp.departmentName} • {selectedEmpLeaveDetail.emp.position}
                </p>
              </div>
              <button 
                onClick={() => setSelectedEmpLeaveDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thống kê hạn mức phép */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Tiêu Chuẩn Năm</span>
                <b className="text-slate-900 text-sm">{selectedEmpLeaveDetail.annualStandardQuota} ngày</b>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-700 block">Chuyển Từ Năm Trước</span>
                <b className="text-amber-800 text-sm">+{selectedEmpLeaveDetail.carriedOverFromLastYear} ngày</b>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[10px] text-indigo-700 block">Lũy Kế Đã Nghỉ</span>
                <b className="text-indigo-800 text-sm">{selectedEmpLeaveDetail.totalDaysUsedYTD} ngày</b>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block">Tồn Phép Hiện Tại</span>
                <b className="text-emerald-800 text-sm">{selectedEmpLeaveDetail.remainingLeaveBalance} ngày</b>
              </div>
            </div>

            {/* Danh sách các lần xin nghỉ trong năm */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Nhật Ký Các Đợt Nghỉ Trong Năm {leaveMonth.split('-')[0]}
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {selectedEmpLeaveDetail.historyList.length > 0 ? (
                  selectedEmpLeaveDetail.historyList.map((h: any, i: number) => (
                    <div key={i} className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{h.typeName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {h.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{h.reason}</p>
                        <p className="text-[10px] text-slate-400">Người phê duyệt: <b>{h.approvedBy}</b></p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {h.type === 'CARRY_OVER' ? '+' : '-'}{h.days} ngày
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-semibold">Đã duyệt</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 italic">
                    Chưa phát sinh đợt nghỉ phép nào trong năm nay.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedEmpLeaveDetail(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* TAB CON: GIẢI TRÌNH QUÊN CHẤM CÔNG & PHÊ DUYỆT BÙ CÔNG */}
      {activeSubTab === 'REGULARIZATION' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <FileSignature className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Danh Sách Đơn Giải Trình Quên Chấm Công &amp; Bù Công</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                  {regularizationList.filter(r => r.status === 'PENDING').length} đơn chờ HR/Quản lý duyệt
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Áp dụng nguyên tắc <b>Poka-Yoke (Không có khả năng làm sai được)</b>: Tự động kiểm tra thời gian hợp lệ, khóa kỳ công và khôi phục 8.0 giờ công chuẩn khi duyệt.
              </p>
            </div>
            <button
              onClick={() => setShowRegModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tạo Đơn Giải Trình Bù Công</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5">Mã Phiếu</th>
                    <th className="px-3 py-2.5">Nhân Viên</th>
                    <th className="px-3 py-2.5">Phòng Ban</th>
                    <th className="px-3 py-2.5">Ngày Cần Bù</th>
                    <th className="px-3 py-2.5">Loại Quên</th>
                    <th className="px-3 py-2.5">Giờ Đề Xuất</th>
                    <th className="px-3 py-2.5">Nhóm Lý Do &amp; Chi Tiết</th>
                    <th className="px-3 py-2.5">Trạng Thái</th>
                    <th className="px-3 py-2.5 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {regularizationList.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-bold text-indigo-700">{reg.id}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-slate-900">{reg.employeeName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{reg.employeeCode}</div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{reg.departmentName}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-800">{reg.date}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {reg.missedType === 'CHECKIN' ? 'Quên Check-in' : reg.missedType === 'CHECKOUT' ? 'Quên Check-out' : 'Quên Cả Hai'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-emerald-700 font-bold">
                        {reg.requestedCheckIn} - {reg.requestedCheckOut}
                      </td>
                      <td className="px-3 py-2.5 max-w-xs">
                        <div className="font-semibold text-slate-800 text-[11px]">{reg.reasonCategoryLabel}</div>
                        <div className="text-slate-500 text-[10px] italic mt-0.5">{reg.reasonDetail}</div>
                        {reg.evidenceNote && (
                          <div className="text-indigo-600 text-[9px] font-semibold mt-0.5">Xác nhận: {reg.evidenceNote}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {reg.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            Chờ Quản Lý Duyệt
                          </span>
                        )}
                        {reg.status === 'APPROVED' && (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đã Duyệt Bù Công
                            </span>
                            <div className="text-[9px] text-slate-400 mt-0.5">{reg.approvedBy} ({reg.approvedAt})</div>
                          </div>
                        )}
                        {reg.status === 'REJECTED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Đã Từ Chối
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {reg.status === 'PENDING' ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleApproveRegularization(reg.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-colors shadow-sm cursor-pointer"
                              title="Duyệt bù công và đồng bộ nhật ký chấm công"
                            >
                              Duyệt Công
                            </button>
                            <button
                              onClick={() => handleRejectRegularization(reg.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] transition-colors border border-rose-200 cursor-pointer"
                              title="Từ chối yêu cầu bù công"
                            >
                              Từ Chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      
      {/* MODAL NỘP ĐƠN GIẢI TRÌNH BÙ CÔNG (CHUẨN POKA-YOKE) */}
      {showRegModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowRegModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <FileSignature className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
                    Quy Trình Chấm Công &amp; Kiểm Soát Gian Lận
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Đơn Giải Trình Quên Chấm Công &amp; Bù Giờ Làm
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setShowRegModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poka-Yoke Warning Notice */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <b className="block text-amber-950">Triết lý Poka-Yoke (Không Có Khả Năng Làm Sai Được):</b>
                <span className="text-[11px] text-amber-800">
                  Hệ thống kiểm tra định dạng giờ vào/ra, ngăn chặn nộp ngày tương lai hoặc kỳ công đã khóa, yêu cầu lý do chi tiết $\ge$ 10 ký tự. Nút xác nhận bị khóa hoàn toàn nếu có bất kỳ dữ liệu sai lệch nào.
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nhân Sự Cần Bù Công <span className="text-rose-500">*</span>
                </label>
                <select
                  value={regEmpCode}
                  onChange={e => setRegEmpCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800 outline-none focus:border-indigo-500"
                >
                  {employees.filter(e => e.tenantId === policy.tenantId).map(emp => (
                    <option key={emp.id} value={emp.code}>
                      {emp.code} - {emp.fullName} ({emp.departmentName})
                    </option>
                  ))}
                </select>
                {regErrors.emp && <p className="text-rose-500 text-[10px] mt-1">{regErrors.emp}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngày Cần Bù Công <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={regDate}
                    max="2026-08-25"
                    onChange={e => setRegDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800 outline-none focus:border-indigo-500"
                  />
                  {regErrors.date && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{regErrors.date}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ca Làm Việc <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={regShiftCode}
                    onChange={e => setRegShiftCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="CA-HC">CA-HC (08:00 - 17:00)</option>
                    <option value="CA-1">CA-1 (06:00 - 14:00)</option>
                    <option value="CA-2">CA-2 (14:00 - 22:00)</option>
                    <option value="CA-3">CA-3 (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Loại Quên <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={regMissedType}
                    onChange={e => setRegMissedType(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800 outline-none focus:border-indigo-500 text-[11px]"
                  >
                    <option value="BOTH">Quên Cả Vào &amp; Ra</option>
                    <option value="CHECKIN">Quên Giờ Vào</option>
                    <option value="CHECKOUT">Quên Giờ Ra</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giờ Vào Thực Tế <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="08:00"
                    value={regCheckIn}
                    onChange={e => setRegCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                  {regErrors.checkIn && <p className="text-rose-500 text-[10px] mt-1">{regErrors.checkIn}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giờ Ra Thực Tế <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="17:00"
                    value={regCheckOut}
                    onChange={e => setRegCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                  {regErrors.checkOut && <p className="text-rose-500 text-[10px] mt-1">{regErrors.checkOut}</p>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nhóm Lý Do Giải Trình <span className="text-rose-500">*</span>
                </label>
                <select
                  value={regReasonCat}
                  onChange={e => setRegReasonCat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value="FINGERPRINT_FAIL">Lỗi máy chấm công / Không nhận vân tay</option>
                  <option value="EXTERNAL_MEETING">Đi họp đối tác / công tác ngoài đột xuất</option>
                  <option value="FORGOT_CARD">Quên quẹt thẻ / Sự cố app di động</option>
                  <option value="EMERGENCY_OVERTIME">Xử lý sự cố kỹ thuật đột xuất</option>
                  <option value="DEVICE_ERROR">Mất kết nối mạng LAN phòng bảo vệ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chi Tiết Lý Do Giải Trình (Tối thiểu 10 ký tự) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={regDetail}
                  onChange={e => setRegDetail(e.target.value)}
                  placeholder="Mô tả cụ thể bối cảnh: gặp ai, làm gì, ở đâu hoặc lý do máy không nhận..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 outline-none focus:border-indigo-500 text-xs"
                />
                {regErrors.detail ? (
                  <p className="text-rose-500 text-[10px] mt-0.5">{regErrors.detail}</p>
                ) : (
                  <p className="text-slate-400 text-[10px] mt-0.5">Đã nhập: {regDetail.trim().length}/10 ký tự yêu cầu</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Người Làm Chứng / Căn Cứ Xác Nhận (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={regEvidence}
                  onChange={e => setRegEvidence(e.target.value)}
                  placeholder="Ví dụ: Tổ trưởng chuyền xác nhận, biên bản họp khách hàng..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                {!isRegFormValid && (
                  <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    Chưa đủ điều kiện nộp (Sửa các mục báo đỏ ở trên)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRegularization}
                  disabled={!isRegFormValid}
                  className={`px-4 py-2 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center space-x-1.5 ${
                    isRegFormValid 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác Nhận Nộp Đơn Bù Công</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* POPUP NHẮC NHỞ CHẤM CÔNG 5 PHÚT (BẤM BẤT KỲ ĐÂU TRÊN MÀN HÌNH ĐỂ TẮT) */}
      {showReminderPopup && reminderEmp && (
        <div 
          onClick={() => setShowReminderPopup(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => {
              // Bấm vào modal cũng có thể tắt hoặc xem chi tiết
              setShowReminderPopup(false);
            }}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center border border-indigo-100"
          >
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg ${
              reminderType === 'BEFORE_SHIFT' ? 'bg-indigo-600 text-white shadow-indigo-200' :
              reminderType === 'AFTER_SHIFT' ? 'bg-emerald-600 text-white shadow-emerald-200' :
              'bg-rose-600 text-white shadow-rose-200'
            }`}>
              <Bell className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
                Hệ Thống Nhắc Nhở Chấm Công Thông Minh (5 Phút)
              </span>
              <h3 className="font-black text-lg text-slate-900">
                {reminderType === 'BEFORE_SHIFT' && '🔔 Sắp Đến Giờ Vào Ca Làm Việc!'}
                {reminderType === 'AFTER_SHIFT' && '🏁 Đã Kết Thúc Ca Làm Việc!'}
                {reminderType === 'LATE_NO_CHECKIN' && '⚠️ Cảnh Báo Chưa Chấm Công!'}
              </h3>
              <p className="text-xs text-slate-500">
                Đơn vị thông báo: <b className="text-indigo-700">Phòng Nhân Sự</b> • Gửi đến toàn thể Cán bộ nhân viên ca làm việc
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
              {reminderType === 'BEFORE_SHIFT' && (
                <p className="text-slate-700 leading-relaxed">
                  ⏰ Ca làm việc <b>Ca Hành Chính (08:00 - 17:00)</b> sẽ bắt đầu sau <b>5 phút nữa (lúc 08:00)</b>. Xin vui lòng chấm công bằng vân tay LAN hoặc ứng dụng Mobile GPS để không bị trừ công theo quy ước!
                </p>
              )}
              {reminderType === 'AFTER_SHIFT' && (
                <p className="text-slate-700 leading-relaxed">
                  ✅ Đã qua 5 phút kể từ giờ kết thúc ca (17:05). Đừng quên quét vân tay/khuôn mặt check-out ra về hoặc nộp đơn xin làm thêm giờ (OT) nếu có lệnh tăng ca của Trưởng ca.
                </p>
              )}
              {reminderType === 'LATE_NO_CHECKIN' && (
                <p className="text-rose-700 leading-relaxed">
                  🚨 Đã quá 15 phút sau giờ vào ca nhưng hệ thống chưa nhận được tín hiệu điểm danh và bạn chưa nộp đơn xin nghỉ phép/đi muộn. Vui lòng kiểm tra và gửi đơn giải trình bổ sung công!
                </p>
              )}

              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                <Info className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                <span>Tự động miễn trừ vào ngày nghỉ lễ, ngày đã duyệt nghỉ phép hoặc nhân sự nghỉ thai sản.</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              👉 Bấm vào bất kỳ đâu trên màn hình để đóng thông báo này
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
