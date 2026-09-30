import { FormattedNumberInput } from './FormattedNumberInput';
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileCheck, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Plus, 
  AlertCircle,
  FileText,
  DollarSign,
  Printer,
  Bell,
  Eye,
  RotateCcw,
  UserMinus,
  ShieldCheck,
  CheckSquare,
  Square,
  Search,
  Filter,
  ArrowRightLeft,
  LayoutList,
  LayoutGrid,
  QrCode,
  Package,
  DoorOpen,
  LogOut,
  LogIn,
  ExternalLink,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  UserCheck,
  History,
  Download,
  Award,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { WorkflowRequest, CompanyPolicy, Employee, UserRole, AttendanceRecord } from '../types/hrm';
import { CompactPagination, evaluateColumnCondition } from './SmartTableFilter';
import { DateRangePresetPicker } from './DateRangePresetPicker';

interface LeaveApprovalViewProps {
  requests: WorkflowRequest[];
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
  onUpdateRequests: (updated: WorkflowRequest[]) => void;
  attendance?: AttendanceRecord[];
  onUpdateAttendance?: (updated: AttendanceRecord[]) => void;
}

// 6 PHÂN HỆ NGHIỆP VỤ CHUYÊN SÂU
export type RequestSubCategory = 
  | 'OVERVIEW_WORKFLOW'      // 1. Tổng quan & Ma trận chờ duyệt SLA
  | 'LEAVE_MANAGEMENT'       // 2. Nghỉ phép & Quỹ phép năm BLLĐ
  | 'OVERTIME_AND_SHIFTS'    // 3. Tăng ca (OT) & Đổi ca sản xuất
  | 'GATE_PASS_LOGISTICS'    // 4. Giấy ra cổng & Kiểm soát tài sản
  | 'SALARY_ADVANCE_EXPENSE' // 5. Tạm ứng lương & Công tác phí
  | 'RESIGNATION_HANDOVER';   // 6. Thôi việc, Rút đơn & Bàn giao

export const LeaveApprovalView: React.FC<LeaveApprovalViewProps> = ({
  requests,
  policy,
  employees,
  currentRole,
  onUpdateRequests,
  attendance,
  onUpdateAttendance,
}) => {
  // Sub-category state (6 Phân hệ chính)
  const [activeSubCategory, setActiveSubCategory] = useState<RequestSubCategory>('OVERVIEW_WORKFLOW');

  // Trạng thái lọc đơn
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARD'>('TABLE');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Multi-selection state
  const [selectedReqIds, setSelectedReqIds] = useState<string[]>([]);

  // Column Filters
  const [colFilters, setColFilters] = useState({
    code: '',
    name: '',
    dept: '',
    type: '',
    detail: '',
    timeAmount: '',
    approver: '',
    status: '',
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResignationPreviewModal, setShowResignationPreviewModal] = useState<WorkflowRequest | null>(null);
  const [showRetractModal, setShowRetractModal] = useState<WorkflowRequest | null>(null);
  const [showGatePassModal, setShowGatePassModal] = useState<WorkflowRequest | null>(null);
  const [showLeaveBalanceModal, setShowLeaveBalanceModal] = useState<Employee | null>(null);
  const [retractReason, setRetractReason] = useState('');

  // Form tạo đơn
  const [newReq, setNewReq] = useState<Partial<WorkflowRequest>>({
    type: 'LEAVE',
    leaveType: 'ANNUAL',
    title: 'Đơn xin nghỉ phép năm',
    reason: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    durationDays: 1,
    otHours: 2,
    requestedAmount: 3000000,
    currentShiftCode: 'CA-1',
    requestedShiftCode: 'CA-2',
    swapWithEmployeeName: '',
    lastWorkingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    gatePassPurpose: 'COMPANY_BUSINESS',
    gatePassExitTime: '09:30',
    gatePassExpectedReturnTime: '11:30',
    isNotReturning: false,
    hasGoodsOrAsset: false,
    assetPermitNumber: '',
    assetPermitNote: '',
  });

  const currentTenantRequests = useMemo(() => {
    return requests.filter(r => r.tenantId === policy.tenantId);
  }, [requests, policy.tenantId]);

  // Quỹ phép năm giả lập gắn theo thâm niên nhân sự (Chuẩn Điều 113 & 114 BLLĐ 2019)
  const employeeLeaveBalances = useMemo(() => {
    return employees.slice(0, 15).map(emp => {
      const joinYear = emp.hireDate ? new Date(emp.hireDate).getFullYear() : 2022;
      const seniorityYears = Math.max(0, 2026 - joinYear);
      const extraSeniorityDays = Math.floor(seniorityYears / 5); // Cứ 5 năm làm việc thêm 1 ngày phép
      const standardDays = 12 + extraSeniorityDays;
      const carryOverDays = seniorityYears > 1 ? 2 : 0; // Phép năm trước chuyển sang
      const totalAllowed = standardDays + carryOverDays;
      
      // Tính số ngày phép đã dùng từ danh sách đơn đã duyệt
      const usedDays = currentTenantRequests
        .filter(r => r.employeeId === emp.id && r.type === 'LEAVE' && r.status === 'APPROVED')
        .reduce((sum, r) => sum + (r.durationDays || 1), 0);
      
      const remainingDays = Math.max(0, totalAllowed - usedDays);
      return {
        empId: emp.id,
        empCode: emp.code,
        fullName: emp.fullName,
        department: emp.departmentName,
        hireDate: emp.hireDate || '01/06/2022',
        seniorityYears,
        standardDays,
        carryOverDays,
        totalAllowed,
        usedDays,
        remainingDays
      };
    });
  }, [employees, currentTenantRequests]);

  // Thống kê giờ làm thêm OT của từng nhân viên và kiểm tra trần 40h/tháng & 200h/năm
  const employeeOtStats = useMemo(() => {
    return employees.slice(0, 12).map(emp => {
      const otRequests = currentTenantRequests.filter(
        r => r.employeeId === emp.id && r.type === 'OVERTIME' && r.status === 'APPROVED'
      );
      const monthHours = otRequests.reduce((sum, r) => sum + (r.otHours || r.durationHours || 2), 0) + 18; // Base simulation
      const yearHours = monthHours * 6; // Base 6 tháng
      const isNearMonthlyCap = monthHours >= 32; // Trần 40h
      const isExceededMonthlyCap = monthHours > 40;
      return {
        empId: emp.id,
        empCode: emp.code,
        fullName: emp.fullName,
        department: emp.departmentName,
        monthHours,
        yearHours,
        isNearMonthlyCap,
        isExceededMonthlyCap
      };
    });
  }, [employees, currentTenantRequests]);

  // Hàm tính điểm ưu tiên sắp xếp đơn từ:
  const getRequestPriority = (r: WorkflowRequest) => {
    const today = new Date().toISOString().slice(0, 10);
    const days = r.durationDays || 0;
    const isLeave = r.type === 'LEAVE' || days > 0;
    
    // Nhóm 1: Nghỉ phép dài ngày (từ 3 ngày trở lên) cần chủ động bố trí nhân sự
    if (isLeave && days >= 3) {
      return {
        weight: 100000 + days * 1000,
        isHighLeave: true,
        isUpcomingUrgent: false
      };
    }
    
    // Nhóm 2: Sắp đến hạn ngày nghỉ cần duyệt sớm (PENDING, cận kề)
    if (isLeave && r.startDate) {
      const diffDays = Math.round((new Date(r.startDate).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24));
      if (r.status === 'PENDING' && diffDays >= -1 && diffDays <= 15) {
        const closeness = Math.max(0, 20 - diffDays);
        return {
          weight: 50000 + closeness * 100 + days,
          isHighLeave: false,
          isUpcomingUrgent: true
        };
      }
    }
    
    // Nhóm 3: Đơn xin nghỉ ngắn ngày (1-2 ngày)
    if (isLeave && days > 0) {
      return {
        weight: 20000 + days * 100,
        isHighLeave: false,
        isUpcomingUrgent: false
      };
    }
    
    // Nhóm 4: Các yêu cầu còn lại (OT, tạm ứng, đổi ca, thôi việc...)
    const createdTime = r.createdAt ? new Date(r.createdAt).getTime() / 1000000000 : 0;
    return {
      weight: 1000 + createdTime,
      isHighLeave: false,
      isUpcomingUrgent: false
    };
  };

  // Bộ lọc và sắp xếp ưu tiên danh sách đơn từ
  const filteredRequests = useMemo(() => {
    const list = currentTenantRequests.filter(r => {
      // 1. Lọc theo sub-category đang chọn nếu không phải tab Tổng quan
      if (activeSubCategory === 'LEAVE_MANAGEMENT' && r.type !== 'LEAVE') return false;
      if (activeSubCategory === 'OVERTIME_AND_SHIFTS' && r.type !== 'OVERTIME' && r.type !== 'SHIFT_SWAP') return false;
      if (activeSubCategory === 'GATE_PASS_LOGISTICS' && r.type !== 'GATE_PASS') return false;
      if (activeSubCategory === 'SALARY_ADVANCE_EXPENSE' && r.type !== 'SALARY_ADVANCE') return false;
      if (activeSubCategory === 'RESIGNATION_HANDOVER' && r.type !== 'RESIGNATION' && r.type !== 'RETRACT_RESIGNATION') return false;

      // 2. Lọc theo tab trạng thái
      if (activeTab !== 'ALL' && r.status !== activeTab) return false;

      // 3. Lọc theo danh mục loại đơn
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;

      // Lọc theo khoảng thời gian nhanh (nếu chọn)
      if (dateRangeFilter.start && dateRangeFilter.end) {
        const reqDate = r.startDate || r.createdAt || '';
        if (reqDate && (reqDate < dateRangeFilter.start || reqDate > dateRangeFilter.end)) return false;
      }

      // 4. Lọc toán tử từng cột
      if (colFilters.code && !evaluateColumnCondition(r.id + ' ' + (r.employeeCode || ''), colFilters.code)) return false;
      if (colFilters.name && !evaluateColumnCondition(r.employeeName, colFilters.name)) return false;
      if (colFilters.dept && !evaluateColumnCondition(r.departmentName, colFilters.dept)) return false;
      if (colFilters.type && !evaluateColumnCondition(r.type, colFilters.type)) return false;
      if (colFilters.detail && !evaluateColumnCondition(r.title + ' ' + r.reason, colFilters.detail)) return false;

      const timeVal = r.requestedAmount || r.durationDays || r.otHours || r.startDate || '';
      if (colFilters.timeAmount && !evaluateColumnCondition(timeVal, colFilters.timeAmount)) return false;

      if (colFilters.approver && !evaluateColumnCondition(r.currentApproverName, colFilters.approver)) return false;
      if (colFilters.status && !evaluateColumnCondition(r.status, colFilters.status)) return false;

      return true;
    });

    return list.sort((a, b) => {
      const priorityA = getRequestPriority(a);
      const priorityB = getRequestPriority(b);
      return priorityB.weight - priorityA.weight;
    });
  }, [currentTenantRequests, activeSubCategory, activeTab, typeFilter, colFilters, dateRangeFilter]);

  // Phân trang
  const totalRecords = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  // Xử lý chọn nhiều đơn (Select All / Row Select)
  const isAllCurrentPageSelected = useMemo(() => {
    if (paginatedRequests.length === 0) return false;
    return paginatedRequests.every(r => selectedReqIds.includes(r.id));
  }, [paginatedRequests, selectedReqIds]);

  const handleToggleSelectAll = () => {
    if (isAllCurrentPageSelected) {
      const pageIds = new Set(paginatedRequests.map(r => r.id));
      setSelectedReqIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const pageIds = paginatedRequests.map(r => r.id);
      setSelectedReqIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedReqIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Duyệt hàng loạt / Từ chối hàng loạt
  const handleBulkAction = (action: 'APPROVED' | 'REJECTED') => {
    if (selectedReqIds.length === 0) return;
    const count = selectedReqIds.length;
    const confirmMsg = action === 'APPROVED' 
      ? `Bạn có chắc chắn muốn DUYỆT HÀNG LOẠT ${count} đơn từ đã chọn?`
      : `Bạn có chắc chắn muốn TỪ CHỐI HÀNG LOẠT ${count} đơn từ đã chọn?`;

    if (!window.confirm(confirmMsg)) return;

    const selectedSet = new Set(selectedReqIds);
    const updated = requests.map(r => {
      if (selectedSet.has(r.id)) {
        return {
          ...r,
          status: action,
          approvalHistory: [
            ...r.approvalHistory,
            {
              step: r.approvalHistory.length + 1,
              approverName: `${currentRole} (Duyệt hàng loạt)`,
              action,
              comment: action === 'APPROVED' ? 'Phê duyệt hàng loạt thành công.' : 'Từ chối hàng loạt.',
              timestamp: new Date().toLocaleString(),
            }
          ]
        };
      }
      return r;
    });

    onUpdateRequests(updated);
    setSelectedReqIds([]);
    alert(`Đã xử lý ${count} đơn từ thành công!`);
  };

  // Xử lý Phê duyệt / Từ chối đơn lẻ
  const handleAction = (reqId: string, action: 'APPROVED' | 'REJECTED') => {
    const updated = requests.map(r => {
      if (r.id === reqId) {
        if (r.type === 'RETRACT_RESIGNATION' && action === 'APPROVED' && r.targetRequestId) {
          return {
            ...r,
            status: action,
            approvalHistory: [
              ...r.approvalHistory,
              {
                step: r.approvalHistory.length + 1,
                approverName: `${currentRole} (Người duyệt)`,
                action,
                comment: 'Đồng ý cho nhân viên rút lại đơn xin nghỉ việc.',
                timestamp: new Date().toLocaleString(),
              }
            ]
          };
        }

        return {
          ...r,
          status: action,
          approvalHistory: [
            ...r.approvalHistory,
            {
              step: r.approvalHistory.length + 1,
              approverName: `${currentRole} (Người duyệt)`,
              action,
              comment: action === 'APPROVED' ? 'Đã phê duyệt chấp thuận' : 'Từ chối đơn do kế hoạch công việc',
              timestamp: new Date().toLocaleString(),
            }
          ]
        };
      }
      return r;
    });

    const targetReq = requests.find(r => r.id === reqId);
    let finalList = updated;
    if (targetReq?.type === 'RETRACT_RESIGNATION' && action === 'APPROVED' && targetReq.targetRequestId) {
      finalList = updated.map(item => item.id === targetReq.targetRequestId ? { ...item, status: 'WITHDRAWN' as const } : item);
    }

    onUpdateRequests(finalList);

    // ĐỒNG BỘ SANG BẢNG CHẤM CÔNG NẾU DUYỆT ĐƠN NGHỈ PHÉP HOẶC OT
    if (action === 'APPROVED' && targetReq && attendance && onUpdateAttendance) {
      const dateKey = targetReq.startDate ? targetReq.startDate.split('T')[0] : new Date().toISOString().split('T')[0];
      const existingIdx = attendance.findIndex(a => a.employeeId === targetReq.employeeId && a.date === dateKey);
      if (existingIdx >= 0) {
        const updatedAtt = [...attendance];
        updatedAtt[existingIdx] = {
          ...updatedAtt[existingIdx],
          status: targetReq.type === 'OVERTIME' ? updatedAtt[existingIdx].status : 'ON_LEAVE',
          overtimeHours: targetReq.type === 'OVERTIME' ? (updatedAtt[existingIdx].overtimeHours || 0) + (targetReq.durationHours || 4) : updatedAtt[existingIdx].overtimeHours,
          note: `${updatedAtt[existingIdx].note || ''} [Đã duyệt đơn ${targetReq.id}]`
        };
        onUpdateAttendance(updatedAtt);
      } else {
        const newRecord: AttendanceRecord = {
          id: `ATT-${Date.now()}`,
          tenantId: targetReq.tenantId || policy.tenantId,
          employeeId: targetReq.employeeId,
          employeeCode: targetReq.employeeCode,
          employeeName: targetReq.employeeName,
          date: dateKey,
          shift: 'ADMINISTRATIVE',
          status: targetReq.type === 'OVERTIME' ? 'PRESENT' : 'ON_LEAVE',
          checkIn: targetReq.type === 'OVERTIME' ? '08:00' : undefined,
          checkOut: targetReq.type === 'OVERTIME' ? '21:00' : undefined,
          overtimeHours: targetReq.type === 'OVERTIME' ? (targetReq.durationHours || 4) : 0,
          isLate: false,
          isEarlyLeave: false,
          note: `[Duyệt đơn ${targetReq.id}]`
        };
        onUpdateAttendance([newRecord, ...attendance]);
      }
    }
  };

  // Nộp đơn mới
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.tenantId === policy.tenantId);
    if (!emp) return;

    if (newReq.type === 'RESIGNATION') {
      const draftResignation: WorkflowRequest = {
        id: `REQ-RESIGN-${Date.now()}`,
        tenantId: policy.tenantId,
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.fullName,
        departmentName: emp.departmentName,
        type: 'RESIGNATION',
        title: 'Đơn xin thôi việc / chấm dứt HĐLĐ',
        reason: newReq.reason || 'Lý do cá nhân',
        lastWorkingDate: newReq.lastWorkingDate,
        status: 'PENDING',
        isPrintedAndSigned: false,
        noticeDeliveredToManager: true,
        noticeDeliveredToHr: true,
        currentApproverId: emp.managerId || 'EMP-002',
        currentApproverName: 'Trưởng Bộ Phận & Phòng Nhân Sự',
        approvalHistory: [
          {
            step: 1,
            approverName: emp.fullName,
            action: 'FORWARDED',
            comment: 'Nhân viên khởi tạo đơn, gửi thông báo sắp xếp bàn giao trước cho Quản lý & Phòng Nhân sự.',
            timestamp: new Date().toLocaleString(),
          }
        ],
        createdAt: new Date().toISOString().split('T')[0],
      };

      setShowResignationPreviewModal(draftResignation);
      setShowCreateModal(false);
      return;
    }

    const isGate = newReq.type === 'GATE_PASS';
    const created: WorkflowRequest = {
      id: isGate ? `REQ-GATE-${Date.now()}` : `REQ-${Date.now()}`,
      tenantId: policy.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      type: newReq.type || 'LEAVE',
      title: newReq.title || (isGate ? (newReq.gatePassPurpose === 'COMPANY_BUSINESS' ? 'Giấy ra cổng việc công ty' : 'Giấy ra cổng việc riêng') : 'Đơn đề nghị'),
      reason: newReq.reason || (isGate ? 'Giải quyết công vụ / việc cá nhân' : 'Nhu cầu cá nhân'),
      startDate: newReq.startDate,
      endDate: newReq.endDate,
      durationDays: newReq.durationDays,
      leaveType: newReq.leaveType,
      otHours: newReq.otHours,
      requestedAmount: newReq.requestedAmount,
      currentShiftCode: newReq.currentShiftCode,
      requestedShiftCode: newReq.requestedShiftCode,
      swapWithEmployeeName: newReq.swapWithEmployeeName,
      gatePassPurpose: newReq.gatePassPurpose,
      gatePassExitTime: newReq.gatePassExitTime,
      gatePassExpectedReturnTime: newReq.gatePassExpectedReturnTime,
      isNotReturning: newReq.isNotReturning,
      hasGoodsOrAsset: newReq.hasGoodsOrAsset,
      assetPermitNumber: newReq.assetPermitNumber,
      assetPermitNote: newReq.assetPermitNote,
      securityCheckStatus: 'PENDING_EXIT',
      status: 'PENDING',
      currentApproverId: emp.managerId || 'EMP-002',
      currentApproverName: 'Trưởng Bộ Phận & Phòng Nhân Sự',
      approvalHistory: [
        {
          step: 1,
          approverName: emp.fullName,
          action: 'FORWARDED',
          comment: 'Khởi tạo đơn gửi lên cấp quản lý',
          timestamp: new Date().toLocaleString(),
        }
      ],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onUpdateRequests([created, ...requests]);
    setShowCreateModal(false);
    alert('Đã gửi đơn thành công lên hệ thống phê duyệt!');
  };

  // Thao tác chốt cổng bảo vệ: Xác nhận giờ ra / giờ vào
  const handleSecurityCheck = (reqId: string, action: 'GATE_OUT' | 'GATE_IN') => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const updated = requests.map(r => {
      if (r.id === reqId) {
        if (action === 'GATE_OUT') {
          return {
            ...r,
            securityCheckStatus: 'CHECKED_OUT' as const,
            actualExitTime: nowTime,
            securityGuardName: 'Bảo Vệ Chốt Chính (Cổng 1)',
            securityGuardNote: r.hasGoodsOrAsset 
              ? `Đã đối chiếu Giấy phép tài sản Kế toán số ${r.assetPermitNumber || 'hợp lệ'}` 
              : 'Xác nhận ra cổng đúng giờ',
          };
        } else {
          return {
            ...r,
            securityCheckStatus: 'CHECKED_IN' as const,
            actualReturnTime: nowTime,
            securityGuardName: 'Bảo Vệ Chốt Chính (Cổng 1)',
          };
        }
      }
      return r;
    });
    onUpdateRequests(updated);
    if (showGatePassModal && showGatePassModal.id === reqId) {
      const target = updated.find(r => r.id === reqId);
      if (target) setShowGatePassModal(target);
    }
  };

  const handleConfirmPrintAndSubmitResignation = () => {
    if (!showResignationPreviewModal) return;
    const finalReq: WorkflowRequest = {
      ...showResignationPreviewModal,
      isPrintedAndSigned: true,
      approvalHistory: [
        ...showResignationPreviewModal.approvalHistory,
        {
          step: 2,
          approverName: showResignationPreviewModal.employeeName,
          action: 'FORWARDED',
          comment: 'Đã in đơn, ký tên xác nhận giấy tờ và hoàn tất nộp đơn chính thức vào hệ thống.',
          timestamp: new Date().toLocaleString(),
        }
      ]
    };

    onUpdateRequests([finalReq, ...requests]);
    setShowResignationPreviewModal(null);
    alert('Đơn xin thôi việc đã được in và lưu thành công! Thông báo đã tự động gửi đến Cấp quản lý trực tiếp và Phòng Nhân sự.');
  };

  // Xuất Báo Cáo Ra File Excel (XLSX)
  const handleExportRequestsExcel = () => {
    const exportData = filteredRequests.map((r, idx) => ({
      'STT': idx + 1,
      'Mã Đơn': r.id,
      'Mã Nhân Viên': r.employeeCode || '',
      'Họ Và Tên': r.employeeName,
      'Phòng Ban': r.departmentName,
      'Loại Đơn': r.type,
      'Tiêu Đề / Lý Do': `${r.title} - ${r.reason}`,
      'Thời Gian / Số Lượng': r.requestedAmount ? `${r.requestedAmount.toLocaleString('vi-VN')} đ` : r.durationDays ? `${r.durationDays} ngày` : r.otHours ? `${r.otHours} giờ` : r.startDate || '',
      'Trạng Thái': r.status === 'PENDING' ? 'Chờ duyệt' : r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Từ chối' : 'Đã rút',
      'Người Duyệt Cuối': r.currentApproverName || '',
      'Ngày Nộp': r.createdAt || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Don_Tu');
    XLSX.writeFile(wb, `Bao_Cao_Don_Tu_Phe_Duyet_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getTypeBadge = (type: WorkflowRequest['type']) => {
    switch (type) {
      case 'LEAVE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Nghỉ Phép</span>;
      case 'OVERTIME':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Tăng Ca (OT)</span>;
      case 'ATTENDANCE_CORRECTION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">Bổ Sung Công</span>;
      case 'SALARY_ADVANCE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Tạm Ứng Lương</span>;
      case 'SHIFT_SWAP':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Đổi Ca SX</span>;
      case 'RESIGNATION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Thôi Việc</span>;
      case 'RETRACT_RESIGNATION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">Rút Đơn</span>;
      case 'GATE_PASS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center space-x-1"><DoorOpen className="w-3 h-3" /><span>Ra Cổng</span></span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Đơn Từ</span>;
    }
  };

  return (
    <div className="space-y-1.5 animate-in fade-in text-slate-800">
      {/* ════════════════════ BANNER TỔNG QUAN LUỒNG PHÊ DUYỆT THÔNG MINH ════════════════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-2 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-indigo-900/30">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
            <FileCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                Hệ Thống Đăng Ký &amp; Phê Duyệt Trực Tuyến Đa Cấp (Smart Workflow Approvals)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-400 text-slate-950">
                6 Phân Hệ Nghiệp Vụ
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Phê duyệt nghỉ phép BLLĐ 2019, kiểm soát trần OT 40h/tháng, giấy ra cổng QR, tạm ứng lương &amp; quy trình thôi việc số hóa
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 shrink-0">
            <span className="text-[10px] text-indigo-200 block uppercase font-bold">Chờ Phê Duyệt:</span>
            <span className="text-base font-black text-amber-300 font-mono">
              {currentTenantRequests.filter(r => r.status === 'PENDING').length} Đơn
            </span>
          </div>
          <div className="text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 shrink-0">
            <span className="text-[10px] text-indigo-200 block uppercase font-bold">Đã Chấp Thuận:</span>
            <span className="text-base font-black text-emerald-300 font-mono">
              {currentTenantRequests.filter(r => r.status === 'APPROVED').length} Đơn
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Đơn Mới</span>
          </button>
        </div>
      </div>

      {/* ════════════════════ 6 NÚT SUB-TAB CHUYÊN BIỆT HÓA ════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center space-x-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollable-tabs">
          <button
            type="button"
            onClick={() => { setActiveSubCategory('OVERVIEW_WORKFLOW'); setTypeFilter('ALL'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubCategory === 'OVERVIEW_WORKFLOW'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4 text-indigo-300" />
            <span>1. Ma Trận Chờ Duyệt &amp; SLA</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
              activeSubCategory === 'OVERVIEW_WORKFLOW' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {currentTenantRequests.filter(r => r.status === 'PENDING').length} Chờ
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubCategory('LEAVE_MANAGEMENT'); setTypeFilter('LEAVE'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubCategory === 'LEAVE_MANAGEMENT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>2. Nghỉ Phép &amp; Quỹ Phép Năm</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-400 text-slate-950">
              BLLĐ 2019
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubCategory('OVERTIME_AND_SHIFTS'); setTypeFilter('ALL'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubCategory === 'OVERTIME_AND_SHIFTS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>3. Tăng Ca (OT) &amp; Đổi Ca Sản Xuất</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
              Trần 40h/tháng
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubCategory('GATE_PASS_LOGISTICS'); setTypeFilter('GATE_PASS'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubCategory === 'GATE_PASS_LOGISTICS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <DoorOpen className="w-4 h-4 text-teal-300" />
            <span>4. Giấy Ra Cổng &amp; Tài Sản Mang Ra</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubCategory('SALARY_ADVANCE_EXPENSE'); setTypeFilter('SALARY_ADVANCE'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubCategory === 'SALARY_ADVANCE_EXPENSE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-300" />
            <span>5. Tạm Ứng Lương &amp; Công Tác Phí</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubCategory('RESIGNATION_HANDOVER'); setTypeFilter('ALL'); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubCategory === 'RESIGNATION_HANDOVER'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <UserMinus className="w-4 h-4 text-rose-300" />
            <span>6. Thôi Việc, Rút Đơn &amp; Bàn Giao</span>
          </button>
        </div>
      </div>

      {/* ════════════════════ PHÂN HỆ 2 EXTRA: BẢNG TRA CỨU QUỸ PHÉP NĂM (NẾU CHỌN TAB 2) ════════════════════ */}
      {activeSubCategory === 'LEAVE_MANAGEMENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Bảng Tra Cứu Quỹ Phép Năm &amp; Phép Thâm Niên (Điều 113 &amp; 114 BLLĐ 2019)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tiêu chuẩn 12 ngày phép/năm + Cứ đủ 5 năm làm việc được cộng thêm 1 ngày phép thâm niên. Phép năm trước chuyển sang dùng trước 31/03.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Chính Sách Chuẩn Pháp Luật
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {employeeLeaveBalances.slice(0, 6).map(item => (
              <div key={item.empId} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{item.fullName}</span>
                    <div className="text-[11px] text-slate-500">{item.empCode} • {item.department}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-700 text-base font-mono">{item.remainingDays}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Ngày khả dụng</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 p-2 rounded-lg bg-white border border-slate-200 text-center text-[10.5px]">
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Tổng Phép:</span>
                    <b className="text-slate-800">{item.totalAllowed} ngày</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Đã Dùng:</span>
                    <b className="text-indigo-700">{item.usedDays} ngày</b>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9.5px]">Thâm Niên:</span>
                    <b className="text-purple-700">+{item.seniorityYears > 4 ? Math.floor(item.seniorityYears / 5) : 0} ngày</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════ PHÂN HỆ 3 EXTRA: GIÁM SÁT TRẦN GIỜ OT 40H/THÁNG (NẾU CHỌN TAB 3) ════════════════════ */}
      {activeSubCategory === 'OVERTIME_AND_SHIFTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Bảng Giám Sát Trần Giờ Làm Thêm OT (Tối Đa 40 Giờ/Tháng - NĐ 145/2020)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hệ thống tự động phát hiện và cảnh báo đỏ đối với nhân sự sắp hoặc đã vượt quá 40 giờ OT/tháng để tránh vi phạm thanh tra lao động.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Kiểm Soát Tuân Thủ Lao Động
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {employeeOtStats.slice(0, 4).map(item => (
              <div key={item.empId} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{item.fullName}</span>
                    <div className="text-[10.5px] text-slate-500">{item.department}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.isExceededMonthlyCap
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : item.isNearMonthlyCap
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {item.isExceededMonthlyCap ? 'Vượt Trần' : item.isNearMonthlyCap ? 'Cận Trần' : 'An Toàn'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Giờ OT Tháng Này:</span>
                    <b className="font-mono text-slate-900">{item.monthHours} / 40 giờ</b>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.monthHours > 40 ? 'bg-rose-600' : item.monthHours >= 32 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (item.monthHours / 40) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════ PHÂN HỆ 6 EXTRA: CHECKLIST BÀN GIAO THÔI VIỆC (NẾU CHỌN TAB 6) ════════════════════ */}
      {activeSubCategory === 'RESIGNATION_HANDOVER' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-rose-600" />
                <span>Quy Trình Bàn Giao Nghĩa Vụ 4 Bước Khi Thôi Việc (Offboarding Checklist)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Đảm bảo nhân sự thu hồi đầy đủ tài sản công ty, hoàn tất công nợ tài chính kế toán và chốt sổ BHXH đúng hạn.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-mono text-[10px] font-bold text-indigo-700">Bước 1. IT &amp; Tài Sản</span>
              <div className="font-bold text-slate-900">Thu hồi Laptop &amp; Thẻ</div>
              <p className="text-[11px] text-slate-500">Khóa tài khoản email nội bộ, thu hồi thẻ nhân viên, đồng phục và chìa khóa tủ.</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-mono text-[10px] font-bold text-indigo-700">Bước 2. Kế Toán Tài Chính</span>
              <div className="font-bold text-slate-900">Quyết Toán Tạm Ứng</div>
              <p className="text-[11px] text-slate-500">Đối chiếu các khoản tạm ứng công tác, tiền tạm ứng lương giữa tháng và công nợ.</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-mono text-[10px] font-bold text-indigo-700">Bước 3. Chuyên Môn</span>
              <div className="font-bold text-slate-900">Bàn Giao Dự Án</div>
              <p className="text-[11px] text-slate-500">Ký biên bản bàn giao hồ sơ tài liệu và công việc dở dang cho nhân sự tiếp nhận.</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-mono text-[10px] font-bold text-indigo-700">Bước 4. Phòng Nhân Sự</span>
              <div className="font-bold text-slate-900">Chốt Sổ BHXH &amp; Quyết Định</div>
              <p className="text-[11px] text-slate-500">Ban hành quyết định chấm dứt HĐLĐ và trả sổ BHXH trong vòng 14 ngày theo luật.</p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ KHỐI DANH SÁCH ĐƠN TỪ CHÍNH (TABLE & ACTIONS) ════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 space-y-3.5">
        {/* Tiêu đề & Công cụ hàng loạt */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Danh Sách Đơn Từ &amp; Luồng Phê Duyệt Trực Tuyến
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {filteredRequests.length.toLocaleString('vi-VN')} đơn
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ duyệt hàng loạt, lọc toán tử cột (&gt;=, &lt;=, =, &gt;, &lt;), tự động phân loại ưu tiên đơn nghỉ dài ngày
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportRequestsExcel}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>

            {/* Nút chuyển đổi View bảng / Card */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-all cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dạng Bảng</span>
              </button>
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-all cursor-pointer ${
                  viewMode === 'CARDS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dạng Thẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* THANH HÀNH ĐỘNG HÀNG LOẠT (KHI CHỌN >= 1 ĐƠN) */}
        {selectedReqIds.length > 0 && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between shadow-xs text-xs">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>Đã chọn {selectedReqIds.length.toLocaleString('vi-VN')} đơn từ</span>
              <button
                onClick={() => setSelectedReqIds([])}
                className="text-indigo-600 hover:underline font-normal text-[11px] ml-2 cursor-pointer"
              >
                (Bỏ chọn tất cả)
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('APPROVED')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Duyệt Hàng Loạt ({selectedReqIds.length.toLocaleString('vi-VN')})</span>
              </button>
              <button
                onClick={() => handleBulkAction('REJECTED')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Từ Chối Hàng Loạt ({selectedReqIds.length.toLocaleString('vi-VN')})</span>
              </button>
            </div>
          </div>
        )}

        {/* BỘ LỌC TABS TRẠNG THÁI & DANH MỤC LOẠI ĐƠN */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {(['PENDING', 'ALL', 'APPROVED', 'REJECTED', 'WITHDRAWN'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'PENDING' ? 'Chờ Duyệt' : tab === 'ALL' ? 'Tất Cả' : tab === 'APPROVED' ? 'Đã Chấp Thuận' : tab === 'REJECTED' ? 'Bị Từ Chối' : 'Đã Rút Lại'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <DateRangePresetPicker
              startDate={dateRangeFilter.start}
              endDate={dateRangeFilter.end}
              onChange={(s, e) => {
                setDateRangeFilter({ start: s, end: e });
                setCurrentPage(1);
              }}
            />

            {dateRangeFilter.start && (
              <button
                type="button"
                onClick={() => {
                  setDateRangeFilter({ start: '', end: '' });
                  setCurrentPage(1);
                }}
                className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                (Bỏ lọc ngày)
              </button>
            )}

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 font-medium">Loại đơn:</span>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none"
              >
                <option value="ALL">Tất cả loại đơn</option>
                <option value="LEAVE">Nghỉ phép</option>
                <option value="OVERTIME">Tăng ca (OT)</option>
                <option value="ATTENDANCE_CORRECTION">Bổ sung công</option>
                <option value="SALARY_ADVANCE">Tạm ứng lương</option>
                <option value="SHIFT_SWAP">Đổi ca sản xuất</option>
                <option value="GATE_PASS">Giấy ra vào cổng</option>
                <option value="RESIGNATION">Thôi việc</option>
                <option value="RETRACT_RESIGNATION">Rút đơn thôi việc</option>
              </select>
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU ĐƠN TỪ CHÍNH */}
        {viewMode === 'TABLE' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                <tr>
                  <th className="px-2 py-2 text-center w-8">
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      onChange={handleToggleSelectAll}
                      className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2">Mã Đơn / NV</th>
                  <th className="px-3 py-2">Họ &amp; Tên Nhân Viên</th>
                  <th className="px-3 py-2">Phòng Ban</th>
                  <th className="px-3 py-2 text-center">Phân Loại</th>
                  <th className="px-3 py-2">Tiêu Đề &amp; Nội Dung Chi Tiết</th>
                  <th className="px-3 py-2 text-right">Thời Gian / Số Tiền</th>
                  <th className="px-3 py-2">Người Duyệt Tiếp Theo</th>
                  <th className="px-3 py-2 text-center">Trạng Thái</th>
                  <th className="px-3 py-2 text-center">Tác Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRequests.map((req) => {
                  const isSelected = selectedReqIds.includes(req.id);
                  const priority = getRequestPriority(req);

                  return (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : priority.isHighLeave ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(req.id)}
                          className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-2 font-mono text-indigo-700 font-bold">
                        <div>{req.id}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{req.employeeCode}</div>
                      </td>

                      <td className="px-3 py-2 font-bold text-slate-900">
                        {req.employeeName}
                        {priority.isHighLeave && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] bg-rose-100 text-rose-700 font-black">
                            Nghỉ {req.durationDays}N
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-slate-600 font-medium">{req.departmentName}</td>

                      <td className="px-3 py-2 text-center">{getTypeBadge(req.type)}</td>

                      <td className="px-3 py-2 max-w-[240px]">
                        <div className="font-bold text-slate-800 truncate" title={req.title}>{req.title}</div>
                        <div className="text-[11px] text-slate-500 truncate" title={req.reason}>{req.reason}</div>
                      </td>

                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">
                        {req.requestedAmount ? (
                          <span className="text-emerald-700">{req.requestedAmount.toLocaleString('vi-VN')} đ</span>
                        ) : req.durationDays ? (
                          <span className="text-indigo-700">{req.durationDays} ngày</span>
                        ) : req.otHours ? (
                          <span className="text-amber-700">{req.otHours} giờ OT</span>
                        ) : (
                          <span className="text-slate-600">{req.startDate || '--'}</span>
                        )}
                      </td>

                      <td className="px-3 py-2 text-indigo-700 font-semibold text-[11px]">
                        {req.currentApproverName}
                      </td>

                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          req.status === 'WITHDRAWN' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {req.status === 'APPROVED' ? '✓ Đã duyệt' :
                           req.status === 'REJECTED' ? '✕ Từ chối' :
                           req.status === 'WITHDRAWN' ? 'Đã rút' : '⏳ Chờ duyệt'}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {req.type === 'GATE_PASS' && (
                            <button
                              onClick={() => setShowGatePassModal(req)}
                              className="p-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[10px] font-bold cursor-pointer"
                              title="Xem phiếu ra cổng và quét QR chốt bảo vệ"
                            >
                              <DoorOpen className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {req.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleAction(req.id, 'APPROVED')}
                                className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                                title="Phê duyệt đơn này"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleAction(req.id, 'REJECTED')}
                                className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                                title="Từ chối đơn"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">Đã xử lý</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* DẠNG THẺ (CARD VIEW) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedRequests.map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {req.id}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">{req.employeeName}</h5>
                    <div className="text-[11px] text-slate-500">{req.departmentName}</div>
                  </div>
                  {getTypeBadge(req.type)}
                </div>

                <div className="p-2 rounded bg-slate-50 border border-slate-100 space-y-1 text-[11px]">
                  <div className="font-bold text-slate-800">{req.title}</div>
                  <div className="text-slate-600">{req.reason}</div>
                  <div className="text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                    <span>Thời gian/Tiền:</span>
                    <b className="text-indigo-700">
                      {req.requestedAmount ? `${req.requestedAmount.toLocaleString('vi-VN')} đ` : req.durationDays ? `${req.durationDays} ngày` : req.otHours ? `${req.otHours} giờ` : req.startDate || ''}
                    </b>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10.5px] text-slate-500">Duyệt: <b>{req.currentApproverName}</b></span>
                  {req.status === 'PENDING' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleAction(req.id, 'APPROVED')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'REJECTED')}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold cursor-pointer"
                      >
                        Từ Chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PHÂN TRANG */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Trang {currentPage} / {totalPages} (Tổng {totalRecords} đơn)
          </div>
          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 font-bold cursor-pointer"
            >
              Trước
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 font-bold cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════ MODAL TẠO ĐƠN MỚI ════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-2.5 shadow-2xl border border-slate-200 space-y-3.5 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase">Khởi Tạo Đơn Đề Nghị Mới</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Loại Đơn Đề Nghị *:</label>
                <select
                  value={newReq.type}
                  onChange={(e) => {
                    const t = e.target.value as WorkflowRequest['type'];
                    setNewReq(prev => ({
                      ...prev,
                      type: t,
                      title: 
                        t === 'LEAVE' ? 'Đơn xin nghỉ phép' :
                        t === 'OVERTIME' ? 'Đơn đăng ký làm thêm giờ (OT)' :
                        t === 'SALARY_ADVANCE' ? 'Đơn xin tạm ứng lương giữa kỳ' :
                        t === 'SHIFT_SWAP' ? 'Đơn đề nghị hoán đổi ca sản xuất' :
                        t === 'GATE_PASS' ? 'Giấy đăng ký ra cổng bảo vệ' :
                        t === 'RESIGNATION' ? 'Đơn xin thôi việc / chấm dứt HĐLĐ' : 'Đơn đề nghị'
                    }));
                  }}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-indigo-700 bg-white"
                >
                  <option value="LEAVE">1. Đơn Xin Nghỉ Phép (BLLĐ 2019)</option>
                  <option value="OVERTIME">2. Đăng Ký Làm Thêm Giờ (OT 150%-300%)</option>
                  <option value="SHIFT_SWAP">3. Hoán Đổi Ca Sản Xuất</option>
                  <option value="GATE_PASS">4. Giấy Ra Cổng Bảo Vệ &amp; Tài Sản</option>
                  <option value="SALARY_ADVANCE">5. Tạm Ứng Lương / Công Tác Phí</option>
                  <option value="RESIGNATION">6. Đơn Xin Thôi Việc (Báo trước 30/45 ngày)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiêu Đề Đơn:</label>
                <input
                  type="text"
                  required
                  value={newReq.title}
                  onChange={e => setNewReq({ ...newReq, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none font-semibold"
                />
              </div>

              {/* Form Chi Tiết Tùy Loại Đơn */}
              {newReq.type === 'LEAVE' && (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Hình Thức Nghỉ:</label>
                    <select
                      value={newReq.leaveType}
                      onChange={e => setNewReq({ ...newReq, leaveType: e.target.value as any })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="ANNUAL">Nghỉ phép năm có lương</option>
                      <option value="SICK">Nghỉ ốm đau BHXH</option>
                      <option value="MATERNITY">Nghỉ thai sản</option>
                      <option value="SPECIAL_PAID">Việc riêng có lương (Cưới/Tang)</option>
                      <option value="UNPAID">Nghỉ không hưởng lương</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số Ngày Nghỉ:</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={newReq.durationDays}
                      onChange={e => setNewReq({ ...newReq, durationDays: Number(e.target.value) })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {newReq.type === 'OVERTIME' && (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số Giờ OT Đăng Ký:</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={newReq.otHours}
                      onChange={e => setNewReq({ ...newReq, otHours: Number(e.target.value) })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Hệ Số Tính Lương:</label>
                    <span className="block p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-amber-700">
                      150% (Ngày thường)
                    </span>
                  </div>
                </div>
              )}

              {newReq.type === 'SALARY_ADVANCE' && (
                <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <label className="font-semibold text-slate-700 block mb-1">Số Tiền Muốn Tạm Ứng (VNĐ):</label>
                  <input
                    type="number"
                    step="500000"
                    value={newReq.requestedAmount}
                    onChange={e => setNewReq({ ...newReq, requestedAmount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    * Định mức tối đa: 50% lương thực tế đã tích lũy trong tháng. Khấu trừ tự động vào bảng lương cuối tháng.
                  </span>
                </div>
              )}

              {newReq.type === 'GATE_PASS' && (
                <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Mục Đích Ra Cổng:</label>
                      <select
                        value={newReq.gatePassPurpose}
                        onChange={e => setNewReq({ ...newReq, gatePassPurpose: e.target.value as any })}
                        className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="COMPANY_BUSINESS">Việc công ty (Gặp khách, công tác)</option>
                        <option value="PERSONAL">Việc riêng (Khám bệnh, việc nhà)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Giờ Dự Kiến Về:</label>
                      <input
                        type="time"
                        value={newReq.gatePassExpectedReturnTime}
                        onChange={e => setNewReq({ ...newReq, gatePassExpectedReturnTime: e.target.value })}
                        className="w-full p-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="hasAsset"
                      checked={newReq.hasGoodsOrAsset}
                      onChange={e => setNewReq({ ...newReq, hasGoodsOrAsset: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <label htmlFor="hasAsset" className="text-slate-700 font-semibold cursor-pointer">
                      Có mang theo Laptop hoặc Tài sản / Thiết bị công ty ra cổng
                    </label>
                  </div>
                  {newReq.hasGoodsOrAsset && (
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Số Phiếu Xuất / Giấy Phép Tài Sản Kế Toán:</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: GPTS-2026-089..."
                        value={newReq.assetPermitNumber}
                        onChange={e => setNewReq({ ...newReq, assetPermitNumber: e.target.value })}
                        className="w-full p-1.5 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lý Do Đề Nghị Chi Tiết *:</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ghi rõ lý do và kế hoạch bàn giao công việc liên quan..."
                  value={newReq.reason}
                  onChange={e => setNewReq({ ...newReq, reason: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Nộp Đơn Lên Cấp Duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL GIẤY RA CỔNG & MÃ QR BẢO VỆ ════════════════════ */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2">
          <div className="bg-white rounded-2xl max-w-md w-full p-2.5 shadow-2xl border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <DoorOpen className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase">Giấy Ra Cổng Điện Tử &amp; Chốt Bảo Vệ</h3>
              </div>
              <button onClick={() => setShowGatePassModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-1">
              <div className="flex justify-between font-mono font-bold text-teal-900">
                <span>{showGatePassModal.id}</span>
                <span>{showGatePassModal.gatePassExitTime} - {showGatePassModal.gatePassExpectedReturnTime}</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">{showGatePassModal.employeeName} ({showGatePassModal.employeeCode})</div>
              <div className="text-slate-600">Phòng ban: {showGatePassModal.departmentName}</div>
              <div className="text-slate-700 font-semibold">Mục đích: {showGatePassModal.reason}</div>
              {showGatePassModal.hasGoodsOrAsset && (
                <div className="text-amber-800 font-bold pt-1 border-t border-teal-200">
                  ⚠️ Có mang tài sản công ty ra cổng (Phiếu số: {showGatePassModal.assetPermitNumber || 'Hợp lệ'})
                </div>
              )}
            </div>

            {/* Mã QR cho Bảo vệ quét điện thoại */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="text-[10.5px] text-slate-500 font-medium">Bảo vệ quét mã QR để xác nhận vào/ra:</div>
              <QrCode className="w-28 h-28 mx-auto text-slate-900" />
              <span className="text-[9.5px] font-mono text-indigo-700 font-bold">PASS-TOKEN: {showGatePassModal.id}-SEC-OK</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => handleSecurityCheck(showGatePassModal.id, 'GATE_OUT')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Bảo Vệ Xác Nhận Ra Cổng</span>
              </button>
              <button
                onClick={() => handleSecurityCheck(showGatePassModal.id, 'GATE_IN')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Xác Nhận Vào Lại</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL IN ĐƠN THÔI VIỆC ════════════════════ */}
      {showResignationPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2">
          <div className="bg-white rounded-2xl max-w-lg w-full p-2.5 shadow-2xl border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Mẫu Đơn Xin Thôi Việc Chuẩn Bản In</h3>
              <button onClick={() => setShowResignationPreviewModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-2 leading-relaxed">
              <div className="text-center font-bold text-sm text-slate-900 uppercase">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br />
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="text-center font-bold text-base text-slate-900 pt-2 uppercase">
                ĐƠN XIN CHẤM DỨT HỢP ĐỒNG LAO ĐỘNG
              </div>
              <div className="text-slate-700 pt-2 space-y-1">
                <div>Kính gửi: Ban Giám Đốc Công Ty &amp; Phòng Nhân Sự</div>
                <div>Tôi tên là: <b>{showResignationPreviewModal.employeeName}</b></div>
                <div>Chức vụ / Bộ phận: <b>{showResignationPreviewModal.departmentName}</b></div>
                <div>Ngày làm việc cuối cùng dự kiến: <b>{showResignationPreviewModal.lastWorkingDate}</b></div>
                <div>Lý do: <i>{showResignationPreviewModal.reason}</i></div>
                <div className="pt-2 text-[11px] text-slate-500">
                  * Tôi cam kết hoàn tất bàn giao toàn bộ trang thiết bị và công nợ trước khi rời vị trí.
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  window.print();
                  handleConfirmPrintAndSubmitResignation();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Ra Giấy &amp; Ký Tên Nộp Đơn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
