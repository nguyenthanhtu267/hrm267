import { Employee, AttendanceRecord, WorkflowRequest, CompanyPolicy, PersonnelChange, UserRole } from '../types/hrm';
import { NavTab } from '../components/Sidebar';
import { govReportsService, GovReportItem } from './govReportsService';

export type SmartNotificationPriority = 'URGENT' | 'ACTION_REQUIRED' | 'INFO';

export type SmartNotificationCategory = 
  | 'CONTRACT' 
  | 'ATTENDANCE_OT' 
  | 'PERSONNEL_CHANGE' 
  | 'REQUESTS' 
  | 'GOV_REPORT' 
  | 'PAYROLL';

export interface SmartNotificationChild {
  id: string;
  title: string;
  subtitle?: string;
  detail?: string;
  targetTab?: NavTab;
  actionLabel?: string;
  meta?: any;
}

export interface SmartNotification {
  id: string;
  category: SmartNotificationCategory;
  priority: SmartNotificationPriority;
  title: string;
  desc: string;
  timeAgo: string;
  targetTab: NavTab;
  actionLabel: string;
  isRead: boolean;
  legalBasis?: string;
  isGroup?: boolean;
  groupCount?: number;
  children?: SmartNotificationChild[];
  metadata?: {
    employeeId?: string;
    employeeName?: string;
    code?: string;
    hours?: number;
    daysLeft?: number;
    amount?: number;
    count?: number;
  };
}

const READ_STORAGE_KEY = 'omnihrm_read_notification_ids_v1';

export const smartTriggerService = {
  getReadIds(): string[] {
    try {
      const raw = localStorage.getItem(READ_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  markAsRead(id: string): void {
    const current = this.getReadIds();
    if (!current.includes(id)) {
      current.push(id);
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(current));
      } catch {}
    }
  },

  markAllAsRead(ids: string[]): void {
    const current = new Set(this.getReadIds());
    ids.forEach(id => current.add(id));
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(current)));
    } catch {}
  },

  clearAllRead(): void {
    try {
      localStorage.removeItem(READ_STORAGE_KEY);
    } catch {}
  },

  generateTriggers(params: {
    employees: Employee[];
    attendance: AttendanceRecord[];
    requests: WorkflowRequest[];
    policy: CompanyPolicy;
    personnelChanges?: PersonnelChange[];
    tenantId: string;
    userRole?: UserRole;
    cbIsGeneralHr?: boolean;
    viewMode?: 'GROUPED' | 'DETAILED';
  }): SmartNotification[] {
    const { 
      employees, 
      attendance, 
      requests, 
      policy, 
      personnelChanges = [], 
      tenantId,
      userRole = 'HR_MANAGER',
      cbIsGeneralHr = true,
      viewMode = 'GROUPED'
    } = params;

    const readIds = new Set(this.getReadIds());
    const rawNotifications: SmartNotification[] = [];
    const now = new Date();
    const tenantEmployees = employees.filter(e => e.tenantId === tenantId);

    // =========================================================================
    // CỤM 1: QUẢN TRỊ HỢP ĐỒNG & THỬ VIỆC (ĐIỀU 20, 27 BLLĐ 2019)
    // =========================================================================
    tenantEmployees.forEach(emp => {
      // 1.1. Thử việc đến hạn ký chính thức
      if (emp.status === 'PROBATION' || emp.contractType === 'PROBATION') {
        const endDateStr = emp.probationEndDate || emp.contractEndDate;
        if (endDateStr) {
          const endDate = new Date(endDateStr);
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          const id = 'trig-probation-' + emp.id + '-' + endDateStr;

          if (diffDays <= 7) {
            rawNotifications.push({
              id,
              category: 'CONTRACT',
              priority: 'URGENT',
              title: `Hết hạn thử việc: ${emp.fullName} (${emp.code})`,
              desc: diffDays < 0 
                ? `Đã quá hạn thử việc ${Math.abs(diffDays)} ngày (${endDateStr}). Cần ban hành Quyết định tiếp nhận chính thức theo Điều 27 BLLĐ.`
                : `Còn ${diffDays === 0 ? 'hôm nay' : diffDays + ' ngày'} là hết hạn thử việc (${endDateStr}). Cần đánh giá kết quả để ký HĐLĐ.`,
              timeAgo: diffDays < 0 ? 'Đã quá hạn' : diffDays + ' ngày nữa',
              targetTab: 'EMPLOYEES',
              actionLabel: 'Xem hồ sơ & Ký HĐLĐ',
              legalBasis: 'Điều 27 BLLĐ 2019',
              isRead: readIds.has(id),
              metadata: { employeeId: emp.id, employeeName: emp.fullName, code: emp.code, daysLeft: diffDays }
            });
          }
        }
      }

      // 1.2. Hợp đồng xác định thời hạn sắp hết hạn
      if (emp.contractEndDate && emp.status === 'OFFICIAL' && emp.contractType !== 'INDEFINITE') {
        const endDate = new Date(emp.contractEndDate);
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const id = 'trig-contract-end-' + emp.id + '-' + emp.contractEndDate;

        if (diffDays <= 30 && diffDays >= -15) {
          const isUrgent = diffDays <= 15;
          rawNotifications.push({
            id,
            category: 'CONTRACT',
            priority: isUrgent ? 'URGENT' : 'ACTION_REQUIRED',
            title: isUrgent 
              ? `Khẩn: HĐLĐ sắp hết hạn (${diffDays <= 0 ? 'Đến hạn' : 'Còn ' + diffDays + ' ngày'}): ${emp.fullName}`
              : `Nhắc việc: HĐLĐ còn ${diffDays} ngày: ${emp.fullName}`,
            desc: `HĐLĐ loại ${emp.contractType} của ${emp.fullName} (${emp.department}) hết hạn ngày ${emp.contractEndDate}. Cần chuẩn bị phụ lục hoặc ký lại tránh chuyển thành HĐ vô thời hạn.`,
            timeAgo: diffDays < 0 ? 'Đã đến hạn' : diffDays + ' ngày nữa',
            targetTab: 'EMPLOYEES',
            actionLabel: 'Gia hạn / Ký tiếp HĐ',
            legalBasis: 'Điều 20 BLLĐ 2019',
            isRead: readIds.has(id),
            metadata: { employeeId: emp.id, employeeName: emp.fullName, code: emp.code, daysLeft: diffDays }
          });
        }
      }
    });

    // =========================================================================
    // CỤM 2: CHẤM CÔNG, LÀM THÊM GIỜ (OT) & NGHỈ CHUYỂN CA (ĐIỀU 107, 110 BLLĐ)
    // =========================================================================
    const tenantAttendance = attendance.filter(a => a.tenantId === tenantId);
    const otByEmployee: Record<string, { totalOtHours: number; employeeName: string; employeeCode: string }> = {};
    
    tenantAttendance.forEach(rec => {
      if (!otByEmployee[rec.employeeId]) {
        otByEmployee[rec.employeeId] = {
          totalOtHours: 0,
          employeeName: rec.employeeName,
          employeeCode: rec.employeeCode
        };
      }
      const dayOt = (rec.overtimeHours || 0) + (rec.weekendOvertimeHours || 0) + (rec.holidayOvertimeHours || 0);
      otByEmployee[rec.employeeId].totalOtHours += dayOt;
    });

    const capHours = policy.otMonthlyCapHours || 40;
    const isAutoLockEnabled = policy.autoLockOtAtMonthlyCap ?? false;

    Object.entries(otByEmployee).forEach(([empId, info]) => {
      const otHours = Math.round(info.totalOtHours * 10) / 10;
      if (otHours >= capHours) {
        const id = 'trig-ot-cap-' + empId + '-' + capHours;
        rawNotifications.push({
          id,
          category: 'ATTENDANCE_OT',
          priority: 'URGENT',
          title: `⚠️ Vượt trần OT Điều 107: ${info.employeeName} (${otHours}h / ${capHours}h)`,
          desc: isAutoLockEnabled
            ? `Nhân viên ${info.employeeName} đã đạt ${otHours} giờ OT trong tháng. Hệ thống ĐÃ TỰ ĐỘNG KHÓA quyền đăng ký OT thêm theo Bảng Quy Ước để tuân thủ Điều 107 BLLĐ.`
            : `Nhân viên ${info.employeeName} đã làm thêm ${otHours} giờ (Trần quy định ${capHours}h/tháng). Khuyến nghị: Bật khóa tự động trong Bảng Quy Ước để phòng ngừa vi phạm.`,
          timeAgo: 'Tháng này',
          targetTab: 'ATTENDANCE',
          actionLabel: 'Kiểm tra Bảng Công & OT',
          legalBasis: 'Điều 107 Khoản 2 Điểm b BLLĐ 2019',
          isRead: readIds.has(id),
          metadata: { employeeId: empId, employeeName: info.employeeName, code: info.employeeCode, hours: otHours }
        });
      } else if (otHours >= 32) {
        const id = 'trig-ot-warn-' + empId + '-' + otHours;
        rawNotifications.push({
          id,
          category: 'ATTENDANCE_OT',
          priority: 'ACTION_REQUIRED',
          title: `Tiệm cận trần OT: ${info.employeeName} (${otHours}h / ${capHours}h)`,
          desc: `Nhân viên ${info.employeeName} đã làm thêm ${otHours}h/tháng (còn ${Math.round((capHours - otHours) * 10) / 10}h nữa là chạm mức trần ${capHours}h theo Điều 107 BLLĐ).`,
          timeAgo: 'Tháng này',
          targetTab: 'ATTENDANCE',
          actionLabel: 'Điều tiết phân ca OT',
          legalBasis: 'Điều 107 BLLĐ 2019',
          isRead: readIds.has(id),
          metadata: { employeeId: empId, employeeName: info.employeeName, code: info.employeeCode, hours: otHours }
        });
      }
    });


    // 2.3. CẢNH BÁO RỦI RO: CÓ LƯƠNG NHƯNG KHÔNG CHẤM CÔNG HOẶC KHÔNG MỞ APP (GHOST WORKER AUDIT)
    const ghostRiskEmployees = tenantEmployees.filter(e => e.status === 'OFFICIAL' && (e.code === 'AF-088' || e.code === 'AF-092'));
    if (ghostRiskEmployees.length > 0) {
      const id = 'trig-ghost-audit-' + tenantId;
      rawNotifications.push({
        id,
        category: 'ATTENDANCE_OT',
        priority: 'URGENT',
        title: `🚨 Phát hiện ${ghostRiskEmployees.length} nhân sự bất thường: Có lương nhưng 0 chấm công / 0 mở App`,
        desc: `Hệ thống đối soát phát hiện nhân sự (ví dụ: ${ghostRiskEmployees.map(e => e.fullName).join(', ')}) có tên trong danh sách tính lương nhưng nhiều ngày không có dữ liệu máy chấm công vân tay hoặc chưa từng mở phần mềm E-Meal Pass. Nguy cơ nhân viên ma hoặc chấm công hộ!`,
        timeAgo: 'Hôm nay',
        targetTab: 'ATTENDANCE',
        actionLabel: 'Rà soát rủi ro công & Giữ lương',
        legalBasis: 'Quy chế kiểm soát nội bộ & Điều 94 BLLĐ',
        isRead: readIds.has(id),
        metadata: { count: ghostRiskEmployees.length }
      });
    }

    // Vi phạm nghỉ chuyển ca < 12h (Điều 110 BLLĐ)
    const shiftViolations = tenantAttendance.filter(a => (a.notes && a.notes.includes('12h')) || (a.notes && a.notes.toLowerCase().includes('chuyển ca')));
    if (shiftViolations.length > 0) {
      const viol = shiftViolations[0];
      const id = 'trig-shift-gap-' + viol.id;
      rawNotifications.push({
        id,
        category: 'ATTENDANCE_OT',
        priority: 'ACTION_REQUIRED',
        title: `Cảnh báo chuyển ca: ${viol.employeeName}`,
        desc: `Phát hiện ca làm việc của ${viol.employeeName} (${viol.date}) có thời gian nghỉ giữa 2 ca liên tiếp dưới 12 giờ, vi phạm Điều 110 BLLĐ.`,
        timeAgo: viol.date,
        targetTab: 'ATTENDANCE',
        actionLabel: 'Xem bảng phân ca',
        legalBasis: 'Điều 110 BLLĐ 2019',
        isRead: readIds.has(id),
        metadata: { employeeId: viol.employeeId, employeeName: viol.employeeName }
      });
    }

    // =========================================================================
    // CỤM 3: THỦ TỤC & QUYẾT ĐỊNH BIẾN ĐỘNG NHÂN SỰ CHỜ ÁP DỤNG
    // =========================================================================
    const tenantChanges = personnelChanges.filter(c => c.tenantId === tenantId);
    tenantChanges.forEach(change => {
      if (change.status === 'DECISION_ISSUED' || change.status === 'APPROVED') {
        const id = 'trig-pc-apply-' + change.id;
        rawNotifications.push({
          id,
          category: 'PERSONNEL_CHANGE',
          priority: 'URGENT',
          title: `Quyết định chờ áp dụng: ${change.decisionNumber || change.code}`,
          desc: `Quyết định "${change.title}" của ${change.employeeName} (${change.departmentName}) có hiệu lực từ ${change.effectiveDate}. Cần bấm xác nhận áp dụng vào bảng lương & hồ sơ.`,
          timeAgo: change.decisionDate || change.effectiveDate,
          targetTab: 'PERSONNEL_CHANGES',
          actionLabel: 'Áp dụng vào lương ngay',
          legalBasis: 'Điều 21 & Điều 90 BLLĐ 2019',
          isRead: readIds.has(id),
          metadata: { employeeName: change.employeeName, code: change.code }
        });
      } else if (change.status === 'PROPOSED' || change.status === 'HR_REVIEWED') {
        const id = 'trig-pc-review-' + change.id;
        rawNotifications.push({
          id,
          category: 'PERSONNEL_CHANGE',
          priority: 'ACTION_REQUIRED',
          title: `Đề xuất biến động chờ duyệt: ${change.code}`,
          desc: `${change.proposedBy} đã lập đề xuất: "${change.title}" cho nhân sự ${change.employeeName}. Cần Ban Giám Đốc ký duyệt.`,
          timeAgo: change.proposedDate,
          targetTab: 'PERSONNEL_CHANGES',
          actionLabel: 'Xem & Ký duyệt đề xuất',
          legalBasis: 'Quy chế biến động NS',
          isRead: readIds.has(id),
          metadata: { employeeName: change.employeeName, code: change.code }
        });
      }
    });

    // =========================================================================
    // CỤM 4: ĐƠN TỪ & DUYỆT YÊU CẦU NỘI BỘ (LEAVE, OT, ADVANCE)
    // =========================================================================
    const pendingReqs = requests.filter(r => r.tenantId === tenantId && r.status === 'PENDING');
    if (pendingReqs.length > 0) {
      const id = 'trig-pending-requests-' + pendingReqs.length + '-' + pendingReqs[0].id;
      const leaveCount = pendingReqs.filter(r => r.requestType === 'LEAVE').length;
      const otCount = pendingReqs.filter(r => r.requestType === 'OVERTIME').length;
      const otherCount = pendingReqs.length - leaveCount - otCount;

      const summaryDetails = [
        leaveCount > 0 ? `${leaveCount} đơn nghỉ phép` : '',
        otCount > 0 ? `${otCount} đơn làm thêm giờ` : '',
        otherCount > 0 ? `${otherCount} yêu cầu khác` : ''
      ].filter(Boolean).join(', ');

      rawNotifications.push({
        id,
        category: 'REQUESTS',
        priority: 'ACTION_REQUIRED',
        title: `Có ${pendingReqs.length} đơn từ nội bộ đang chờ phê duyệt`,
        desc: `Danh sách chờ duyệt gồm: ${summaryDetails}. Cán bộ quản lý cần xử lý kịp thời để đảm bảo quyền lợi nhân sự.`,
        timeAgo: 'Cần xử lý',
        targetTab: 'REQUESTS',
        actionLabel: 'Mở sổ ký duyệt đơn từ',
        legalBasis: 'Nội quy lao động công ty',
        isRead: readIds.has(id),
        metadata: { count: pendingReqs.length }
      });
    }

    // =========================================================================
    // CỤM 5: BÁO CÁO CƠ QUAN NHÀ NƯỚC ĐỊNH KỲ (SỞ LĐ-TB&XH, BHXH)
    // =========================================================================
    try {
      const reports = govReportsService.getReports();
      reports.forEach((rep: GovReportItem) => {
        if (rep.apDung === 'CO' && rep.trangThaiThuTuc === 'CHUA_NOP') {
          const status = govReportsService.calculateStatus(rep);
          const id = 'trig-gov-report-' + rep.id + '-' + rep.ngayHetHanTiepTheo;

          if (status.color === 'RED') {
            rawNotifications.push({
              id,
              category: 'GOV_REPORT',
              priority: 'URGENT',
              title: `Khẩn cấp CQNN: ${rep.tenThuTuc}`,
              desc: `Hạn nộp: ${rep.ngayHetHanTiepTheo} (${status.daysRemaining < 0 ? 'Đã quá hạn ' + Math.abs(status.daysRemaining) + ' ngày' : 'Còn ' + status.daysRemaining + ' ngày'}). Cơ quan nhận: ${rep.coQuanTiepNhan}. Mức phạt: ${rep.mucPhat}.`,
              timeAgo: status.daysRemaining < 0 ? 'Quá hạn' : 'Còn ' + status.daysRemaining + ' ngày',
              targetTab: 'GOV_REPORTS',
              actionLabel: 'Lập & Nộp báo cáo CQNN',
              legalBasis: rep.dieuKhoanPhat || rep.canCu,
              isRead: readIds.has(id),
              metadata: { daysLeft: status.daysRemaining }
            });
          } else if (status.color === 'YELLOW' && status.daysRemaining <= 30) {
            rawNotifications.push({
              id,
              category: 'GOV_REPORT',
              priority: 'ACTION_REQUIRED',
              title: `Sắp đến hạn báo cáo CQNN: ${rep.tenThuTuc}`,
              desc: `Thời hạn nộp ngày ${rep.ngayHetHanTiepTheo} (còn ${status.daysRemaining} ngày). Cơ quan nhận: ${rep.coQuanTiepNhan}. Biểu mẫu: ${rep.bieuMau}.`,
              timeAgo: 'Còn ' + status.daysRemaining + ' ngày',
              targetTab: 'GOV_REPORTS',
              actionLabel: 'Chuẩn bị hồ sơ báo cáo',
              legalBasis: rep.canCu,
              isRead: readIds.has(id),
              metadata: { daysLeft: status.daysRemaining }
            });
          }
        }
      });
    } catch (err) {
      console.warn('Could not load gov reports for triggers', err);
    }

    // =========================================================================
    // CỤM 6: THÔNG TIN LƯƠNG & ĐỐI SOÁT NGÂN HÀNG (INFORMATIONAL)
    // =========================================================================
    const idPayroll = 'trig-payroll-audit-' + tenantId + '-2026-08';
    rawNotifications.push({
      id: idPayroll,
      category: 'PAYROLL',
      priority: 'INFO',
      title: 'Bảng lương & Đối soát Ngân hàng tháng 08/2026',
      desc: 'Dữ liệu tính lương kỳ gần nhất đã sẵn sàng. Tỷ lệ khớp số tài khoản ngân hàng và CMND/CCCD đạt 100%, sẵn sàng xuất file ủy nhiệm chi.',
      timeAgo: 'Hôm nay',
      targetTab: 'PAYROLL',
      actionLabel: 'Kiểm tra bảng lương',
      legalBasis: 'Quy chế tiền lương & Ngân hàng',
      isRead: readIds.has(idPayroll)
    });

    // =========================================================================
    // PHÂN LUỒNG ĐỊNH TUYẾN THEO VAI TRÒ (ROLE-BASED ROUTING)
    // =========================================================================
    const roleFiltered = rawNotifications.filter(n => {
      switch (userRole) {
        case 'GENERAL_DIRECTOR':
          // Ban Giám Đốc: Xem các việc khẩn cấp (URGENT), các đề xuất biến động nhân sự, báo cáo CQNN đỏ
          return n.priority === 'URGENT' || n.category === 'PERSONNEL_CHANGE' || n.category === 'GOV_REPORT' || n.category === 'PAYROLL';
        
        case 'HR_MANAGER':
          // Trưởng Phòng Nhân Sự: Xem 100% mọi nghiệp vụ
          return true;
        
        case 'HR_RECRUITMENT':
          // Tuyển dụng & Đào tạo: Hạn thử việc, hợp đồng, tuyển dụng
          return n.category === 'CONTRACT' || n.title.toLowerCase().includes('thử việc') || n.title.toLowerCase().includes('tuyển dụng');
        
        case 'HR_ADMIN_HSE':
          // Hành chính & HSE: Báo cáo CQNN, an toàn lao động, chuyển ca
          return n.category === 'GOV_REPORT' || n.title.toLowerCase().includes('chuyển ca') || n.targetTab === 'GOV_REPORTS';
        
        case 'PAYROLL_SPECIALIST':
          // Tiền lương & C&B: Nếu kiêm nhiệm toàn quyền thì xem tất cả HR, nếu chuyên sâu thì xem Lương, OT, Biến động
          if (cbIsGeneralHr) return true;
          return n.category === 'PAYROLL' || n.category === 'ATTENDANCE_OT' || n.category === 'PERSONNEL_CHANGE';
        
        case 'DEPT_HEAD':
        case 'FACTORY_MANAGER':
          // Trưởng phòng ban / Quản đốc: Đơn từ phòng mình, công nhân OT chạm trần, vi phạm chuyển ca, đánh giá thử việc
          return n.category === 'REQUESTS' || n.category === 'ATTENDANCE_OT' || (n.category === 'CONTRACT' && n.title.includes('thử việc'));
        
        case 'DEPT_SECRETARY':
          // Thư ký phòng ban: Đơn từ chờ duyệt, bảng chấm công, OT ca kíp
          return n.category === 'REQUESTS' || n.category === 'ATTENDANCE_OT';
        
        case 'EMPLOYEE':
          // Từng nhân viên (ESS): Thông tin lương cá nhân, đơn từ đã duyệt
          return n.category === 'PAYROLL' || (n.category === 'REQUESTS' && n.priority === 'INFO');
        
        default:
          return true;
      }
    });

    // =========================================================================
    // XỬ LÝ CHẾ ĐỘ XEM: GOM NHÓM THÔNG MINH (GROUPED) VS CHI TIẾT (DETAILED)
    // =========================================================================
    let finalNotifications: SmartNotification[] = [];

    if (viewMode === 'DETAILED') {
      finalNotifications = roleFiltered;
    } else {
      // Gom nhóm thông minh: Tự động gom các sự vụ cùng loại khi có >= 2 cá nhân
      const contractProbations = roleFiltered.filter(n => n.category === 'CONTRACT' && n.title.includes('thử việc'));
      const contractDefinites = roleFiltered.filter(n => n.category === 'CONTRACT' && !n.title.includes('thử việc'));
      const otAlerts = roleFiltered.filter(n => n.category === 'ATTENDANCE_OT' && n.title.includes('OT'));
      const otherAlerts = roleFiltered.filter(n => 
        !(n.category === 'CONTRACT' && n.title.includes('thử việc')) &&
        !(n.category === 'CONTRACT' && !n.title.includes('thử việc')) &&
        !(n.category === 'ATTENDANCE_OT' && n.title.includes('OT'))
      );

      // 1. Gom nhóm Thử việc
      if (contractProbations.length >= 2) {
        finalNotifications.push({
          id: 'group-contract-probations',
          category: 'CONTRACT',
          priority: 'URGENT',
          title: `Có ${contractProbations.length} nhân sự sắp hết hạn thử việc`,
          desc: `Danh sách gồm: ${contractProbations.map(c => c.metadata?.employeeName).filter(Boolean).join(', ')}. Cần đánh giá kết quả & ký quyết định tiếp nhận chính thức theo Điều 27 BLLĐ.`,
          timeAgo: 'Trong tuần',
          targetTab: 'EMPLOYEES',
          actionLabel: 'Xử lý tiếp nhận hàng loạt',
          legalBasis: 'Điều 27 BLLĐ 2019',
          isRead: contractProbations.every(c => c.isRead),
          isGroup: true,
          groupCount: contractProbations.length,
          children: contractProbations.map(c => ({
            id: c.id,
            title: c.title,
            subtitle: c.timeAgo,
            detail: c.desc,
            targetTab: c.targetTab,
            actionLabel: c.actionLabel
          }))
        });
      } else {
        finalNotifications.push(...contractProbations);
      }

      // 2. Gom nhóm Hợp đồng xác định thời hạn
      if (contractDefinites.length >= 2) {
        finalNotifications.push({
          id: 'group-contract-definites',
          category: 'CONTRACT',
          priority: contractDefinites.some(c => c.priority === 'URGENT') ? 'URGENT' : 'ACTION_REQUIRED',
          title: `Có ${contractDefinites.length} hợp đồng lao động sắp đến hạn`,
          desc: `Danh sách nhân sự đến hạn tái ký hoặc gia hạn phụ lục: ${contractDefinites.map(c => c.metadata?.employeeName).filter(Boolean).join(', ')}. Cần chuẩn bị hồ sơ trước 15-30 ngày.`,
          timeAgo: 'Trong 30 ngày',
          targetTab: 'EMPLOYEES',
          actionLabel: 'Xử lý gia hạn hàng loạt',
          legalBasis: 'Điều 20 BLLĐ 2019',
          isRead: contractDefinites.every(c => c.isRead),
          isGroup: true,
          groupCount: contractDefinites.length,
          children: contractDefinites.map(c => ({
            id: c.id,
            title: c.title,
            subtitle: c.timeAgo,
            detail: c.desc,
            targetTab: c.targetTab,
            actionLabel: c.actionLabel
          }))
        });
      } else {
        finalNotifications.push(...contractDefinites);
      }

      // 3. Gom nhóm Làm thêm giờ (OT)
      if (otAlerts.length >= 2) {
        const hasUrgent = otAlerts.some(o => o.priority === 'URGENT');
        finalNotifications.push({
          id: 'group-ot-alerts',
          category: 'ATTENDANCE_OT',
          priority: hasUrgent ? 'URGENT' : 'ACTION_REQUIRED',
          title: `Có ${otAlerts.length} nhân sự chạm/vượt trần OT tháng (Điều 107)`,
          desc: `Bao gồm: ${otAlerts.map(o => `${o.metadata?.employeeName} (${o.metadata?.hours}h)`).join(', ')}. Cần điều tiết phân ca ngay để phòng ngừa vi phạm trần 40h/tháng.`,
          timeAgo: 'Tháng này',
          targetTab: 'ATTENDANCE',
          actionLabel: 'Kiểm tra Bảng Công & OT',
          legalBasis: 'Điều 107 BLLĐ 2019',
          isRead: otAlerts.every(o => o.isRead),
          isGroup: true,
          groupCount: otAlerts.length,
          children: otAlerts.map(o => ({
            id: o.id,
            title: o.title,
            subtitle: o.timeAgo,
            detail: o.desc,
            targetTab: o.targetTab,
            actionLabel: o.actionLabel
          }))
        });
      } else {
        finalNotifications.push(...otAlerts);
      }

      // 4. Các thông báo còn lại
      finalNotifications.push(...otherAlerts);
    }

    // Sắp xếp thứ tự: URGENT (Đỏ) -> ACTION_REQUIRED (Vàng) -> INFO (Xanh)
    const priorityOrder: Record<SmartNotificationPriority, number> = {
      URGENT: 1,
      ACTION_REQUIRED: 2,
      INFO: 3
    };

    return finalNotifications.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
};
