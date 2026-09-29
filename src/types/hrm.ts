// ========================================================
// OMNIHRM ENTERPRISE - TYPE DEFINITIONS
// Hỗ trợ Multi-Tenant, Đa ngành nghề, Chuẩn Luật Lao động VN
// ========================================================

export type UserRole = 
  | 'GENERAL_DIRECTOR'      // Ban Giám Đốc (Lãnh Đạo cấp cao)
  | 'HR_MANAGER'             // Trưởng Phòng Nhân Sự (Toàn quyền cao nhất HRM & Tuân thủ pháp luật)
  | 'HR_RECRUITMENT'         // Chuyên Viên Tuyển Dụng & Đào Tạo
  | 'HR_ADMIN_HSE'           // Chuyên Viên Hành Chính & HSE (An toàn LĐ, Báo cáo CQNN)
  | 'PAYROLL_SPECIALIST'     // Chuyên Viên Tiền Lương & C&B (Có tùy chọn kiêm nhiệm toàn quyền HR)
  | 'DEPT_HEAD'              // Trưởng Các Phòng Ban (Quản đốc, Trưởng bộ phận)
  | 'FACTORY_MANAGER'        // Quản Lý Phân Xưởng / Nhà Máy (tương thích ngược)
  | 'DEPT_SECRETARY'         // Thư Ký Phòng Ban (Gom đơn, nhập liệu hộ cho cả phòng)
  | 'EMPLOYEE';              // Từng Nhân Viên (Góc nhìn ESS cá nhân từ Chủ tịch đến CN)

export type ContractType = 
  | 'PROBATION'            // Hợp đồng thử việc
  | 'DEFINITE_12M'         // HĐLĐ xác định thời hạn (12 tháng)
  | 'DEFINITE_24M'         // HĐLĐ xác định thời hạn (24 tháng)
  | 'INDEFINITE'           // HĐLĐ không xác định thời hạn
  | 'CIVIL_SERVICE';       // Hợp đồng dịch vụ / Cộng tác viên (Bộ luật Dân sự)

export type EmployeeStatus = 
  | 'PROBATION'            // Thử việc
  | 'OFFICIAL'             // Chính thức
  | 'SUSPENDED'            // Tạm hoãn HĐLĐ (nghĩa vụ quân sự, thai sản...)
  | 'NOTICE_PERIOD'        // Đang trong thời hạn báo trước chờ nghỉ việc
  | 'RESIGNED'             // Đã nghỉ việc / thanh lý
  | 'DISMISSED'            // Bị xử lý kỷ luật sa thải (Điều 125 BLLĐ 2019)
  | 'COLLABORATOR';        // Cộng tác viên dịch vụ

export type ShiftType = 
  | 'ADMINISTRATIVE'       // Ca hành chính (8h00 - 17h00)
  | 'MORNING'              // Ca sáng (6h00 - 14h00)
  | 'AFTERNOON'            // Ca chiều (14h00 - 22h00)
  | 'NIGHT'                // Ca đêm (22h00 - 06h00)
  | 'FACTORY_12H'          // Ca 12h sản xuất
  | 'SPLIT';               // Ca gãy dịch vụ/nhà hàng

export type LeaveType = 
  | 'ANNUAL'               // Nghỉ phép năm
  | 'SICK'                 // Nghỉ ốm đau (hưởng BHXH)
  | 'MATERNITY'            // Nghỉ thai sản (hưởng BHXH)
  | 'SPECIAL_PAID'         // Nghỉ việc riêng hưởng nguyên lương (Điều 115 BLLĐ)
  | 'UNPAID';              // Nghỉ không hưởng lương

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ----------------------------------------------------
// BẢNG QUY ƯỚC CHUNG DOANH NGHIỆP (COMPANY POLICY)
// ----------------------------------------------------
export interface CompanyPolicy {
  id: string;
  tenantId: string;
  companyName: string;
  taxCode: string;
  address?: string;
  industry: 'MANUFACTURING' | 'TECHNOLOGY' | 'RETAIL' | 'SERVICES';
  
  // 1. Chu kỳ công & Lương
  payrollCycleType: 'MONTH_START_END' | 'CYCLE_26_TO_25'; // 1-30 hoặc 26-25
  standardWorkDaysPerMonth: number; // Thường 24 hoặc 26 ngày (hoặc trừ các ngày nghỉ tuần)
  
  // 2. Chính sách Thứ 7 & Làm việc từ xa (Hybrid)
  saturdayPolicy: 'FULL_OFF' | 'MORNING_ONLY' | 'FULL_WORK';
  allowRemoteOnline: boolean; // Làm online thứ 7 vẫn tự động tính đủ công
  
  // 3. Quy tắc trừ công đi muộn / về sớm
  lateRuleLevel1Minutes: number; // 0-5m -> trừ 30m công
  lateRuleLevel2Minutes: number; // 5-15m -> trừ 60m công
  lateRuleLevel3Minutes: number; // >15m -> không tính công khung giờ đó
  
  // 4. Hệ số làm thêm giờ (OT) & Làm đêm chuẩn BLLĐ 2019
  otDayNormalRate: number; // 1.5 (150%)
  otDayWeekendRate: number; // 2.0 (200%)
  otDayHolidayRate: number; // 3.0 (300%)
  nightWorkBonusRate: number; // 0.3 (+30%)
  otNightNormalRate: number; // 2.1 (210%)
  otNightWeekendRate: number; // 2.7 (270%)
  otNightHolidayRate: number; // 3.9 (390%)
  autoLockOtAtMonthlyCap?: boolean; // Tự động khóa đăng ký thêm OT khi đạt trần (mặc định false - tắt để linh hoạt tùy DN)
  otMonthlyCapHours?: number; // Mức trần OT tháng theo luật (mặc định 40 giờ theo Điều 107 BLLĐ)
  
  // 5. Bồi dưỡng hiện vật độc hại (Thông tư 24/2022/TT-BLĐTBXH)
  toxicAllowanceTier1: number; // 13.000 đ/ngày
  toxicAllowanceTier2: number; // 20.000 đ/ngày
  toxicAllowanceTier3: number; // 26.000 đ/ngày
  toxicAllowanceTier4: number; // 32.000 đ/ngày
  
  // 6. Quy ước Phép năm
  maxCarryOverDays: number; // Mặc định chuyển tối đa 4 ngày sang năm sau
  carryOverExpiryDate: string; // "31/03" hàng năm
  
  // 7. Thuế & Bảo hiểm
  regionalMinimumWage: number; // 4.960.000 đ (Vùng 1)
  personalDeduction: number; // 11.000.000 đ (Biểu cũ 7 bậc)
  dependentDeduction: number; // 4.400.000 đ/người (Biểu cũ 7 bậc)
  
  // Thiết lập Biểu thuế TNCN Lũy tiến từng phần & Ngày áp dụng
  pitTableType: 'AUTO_BY_DATE' | 'FORCE_7_TIERS' | 'FORCE_5_TIERS'; // Tự động theo mốc thời gian hoặc ép kiểu
  pit5TiersEffectiveDate: string; // Mốc áp dụng Biểu thuế 5 bậc (Mặc định: '2026-01-01' theo kỳ tính thuế năm 2026 của Luật Thuế TNCN số 109/2025/QH15)
  pit5PersonalDeduction?: number; // Mức giảm trừ gia cảnh bản thân mới (14.000.000đ - 15.000.000đ nếu quy định)
  pit5DependentDeduction?: number; // Mức giảm trừ gia cảnh người phụ thuộc mới (5.500.000đ - 6.200.000đ nếu quy định)

  bhxhEmpRate: number; // 8%
  bhytEmpRate: number; // 1.5%
  bhtnEmpRate: number; // 1%
  bhxhCompRate: number; // 17.5%
  bhytCompRate: number; // 3%
  bhtnCompRate: number; // 1%
  unionCompanyRate: number; // 2%
  unionMemberRate: number; // 1% (tối đa 10% lương cơ sở)

  // 8. Chế độ Tiền Ăn Ca & Ngày Áp Dụng (Cập nhật thực tế mới)
  shiftMealAllowancePerDay: number; // Tiền ăn ca (VD: 35.000đ - 45.000đ/ngày hoặc theo tháng 900.000đ - 1.200.000đ)
  shiftMealEffectiveDate: string; // Ngày bắt đầu áp dụng (VD: 2026-01-01)
  shiftMealPaymentType: 'PER_DAY' | 'MONTHLY_FIXED' | 'CATERING_IN_KIND'; // Trả tiền/ngày, khoán tháng, hay nhà ăn công ty phục vụ hiện vật
  lunchAllowancePerDay?: number; // Alias tương thích
  effectiveDate?: string; // Alias tương thích

  // 9. Phân bổ % Đạt theo Kết quả Kinh doanh Doanh nghiệp cho các Nhóm Lương
  companyBusinessPerformanceRate: number; // Tỷ lệ hoàn thành SXKD toàn công ty (% ví dụ: 105%)
  productSalaryPerformanceRate: number; // Tỷ lệ đạt Nhóm Lương Sản Phẩm (Piece-rate) %
  volumeSalaryPerformanceRate: number; // Tỷ lệ đạt Nhóm Lương Sản Lượng (Volume-rate) %
  kpiSalaryPerformanceRate: number; // Tỷ lệ đạt Nhóm Lương KPI / Hiệu quả %
  salaryGroupRatesEffectiveDate: string; // Ngày hiệu lực áp dụng tỷ lệ nhóm lương

  // 10. Tùy chọn Định dạng số & Ngôn ngữ
  thousandSeparator: '.' | ','; // Dấu phân cách hàng ngàn (mặc định '.' theo VN hoặc ',' quốc tế)

  // 11. Cấu hình Báo cáo công việc ngày & Hiệu suất KPI
  allowEmployeesViewDeptHeadReport?: boolean; // Cho phép nhân viên xem Báo cáo công việc của Trưởng phòng (Mặc định: false)
  autoLinkKpiToPayroll?: boolean; // Tự động liên kết hệ số KPI vào Thưởng hiệu suất bảng lương (Mặc định: true)

  decimalSeparator: ',' | '.'; // Dấu thập phân (mặc định ',' theo VN hoặc '.' quốc tế)
  defaultLanguage: 'vi' | 'en' | 'zh'; // Tiếng Việt, Tiếng Anh, Tiếng Trung

  // 12. Cấu hình Marketing Banner
  promoBannerEnabled?: boolean;
  promoBannerLink?: string;
  promoBannerText?: string;
}

// ----------------------------------------------------
// HỒ SƠ NHÂN SỰ 360° (EMPLOYEE 360)
// ----------------------------------------------------
export interface Employee {
  id: string;
  tenantId: string;
  code: string; // Mã nhân viên (VD: AF-001)
  fullName: string;
  avatarUrl?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string; // Ngày sinh
  phone: string;
  email: string;
  cccd: string; // Số CCCD
  cccdDate: string; // Ngày cấp
  cccdPlace: string; // Nơi cấp
  address: string;
  
  // Tổ chức & Chức danh
  branchId: string;
  branchName: string; // Chi nhánh / Nhà máy
  departmentId: string;
  departmentName: string; // Phòng ban / Xưởng
  position: string; // Chức vụ
  role: UserRole;
  managerId?: string; // ID Quản lý trực tiếp
  
  // Hợp đồng & Trạng thái
  status: EmployeeStatus;
  contractType: ContractType;
  contractNumber: string;
  joinDate: string; // Ngày vào làm
  contractStartDate: string;
  contractEndDate?: string;
  
  // Tài chính, Thuế & BHXH
  bankAccountNumber: string;
  bankName: string;
  taxCode: string; // Mã số thuế cá nhân
  socialInsuranceNumber: string; // Mã sổ BHXH
  numberOfDependents: number; // Số người phụ thuộc giảm trừ gia cảnh
  
  // Lương & Chế độ
  baseSalary: number; // Lương cơ bản đóng BHXH
  positionSalary: number; // Lương chức danh / hiệu quả công việc
  lunchAllowance: number; // Phụ cấp ăn trưa
  transportAllowance: number; // Phụ cấp xăng xe / đi lại
  phoneAllowance: number; // Phụ cấp điện thoại
  toxicTier: 0 | 1 | 2 | 3 | 4; // Mức bồi dưỡng độc hại (0 = không, 1-4 theo TT 24)
  
  // Phép năm
  annualLeaveTotal: number; // Tổng phép năm được hưởng (12 + thâm niên)
  annualLeaveUsed: number; // Đã nghỉ
  annualLeaveCarriedOver: number; // Phép năm ngoái chuyển sang (hạn 31/03)
  
  // Ghi chú & Đính kèm
  notes?: string;
  isCivilContractor?: boolean; // Nếu là Cộng tác viên Hợp đồng dịch vụ (khấu trừ thuế 10%)
  isNonResident?: boolean; // Cá nhân không cư trú (thuế TNCN 20% toàn bộ)
  probationRate?: number; // Tỷ lệ lương thử việc (thường 0.85 = 85%)
  hasTaxCommitment08?: boolean; // Làm cam kết mẫu 08/CK-TNCN tạm chưa khấu trừ 10%
  nonCashGiftValue?: number; // Giá trị quà tặng hiện vật chịu thuế
  salaryRegion?: 1 | 2 | 3 | 4; // Vùng lương tối thiểu áp dụng theo NĐ 293/2025/NĐ-CP
  debtBalance?: number; // Số dư công nợ tạm ứng / bồi thường tài sản còn phải trả
  debtNotes?: string; // Ghi chú công nợ (lý do mượn, số kỳ khấu trừ)
  disciplinaryRecord?: DisciplinaryRecord; // Hồ sơ kỷ luật lao động (nếu có)

  // Nhóm lao động đặc thù tuân thủ Luật Lao Động
  laborSpecialType?: 'STANDARD' | 'MINOR_UNDER_18' | 'ELDERLY_OVER_RETIREMENT'; // Lao động vị thành niên (15-18 tuổi) hoặc người cao tuổi
  guardianConsentFile?: string; // Văn bản đồng ý của cha mẹ/người đại diện (Điều 145 BLLĐ)
  maxDailyHoursAllowed?: number; // Tối đa 7 giờ/ngày cho lao động 15-18 tuổi (Điều 146 BLLĐ)
  healthCheckFrequencyMonths?: number; // 6 tháng/lần với lao động chưa thành niên hoặc cao tuổi
  isExemptBhtn?: boolean; // Miễn đóng BHTN cho lao động đang hưởng lương hưu (khoản 2 Điều 43 Luật Việc làm)
}

// ----------------------------------------------------
// CHẤM CÔNG & CA KÍP
// ----------------------------------------------------
export interface ShiftDefinition {
  id: string;
  code: string;
  name: string;
  startTime: string; // "08:00"
  endTime: string; // "17:00"
  breakDurationMinutes: number; // 60 phút
  workHours: number; // 8.0 giờ
  isNightShift: boolean; // Có tính làm đêm (22h - 6h)
  shiftType: ShiftType;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  shiftCode: string;
  
  checkIn: string; // "08:02"
  checkOut: string; // "17:05"
  
  lateMinutes: number;
  earlyMinutes: number;
  deductedWorkHours: number; // Số giờ công bị trừ do đi muộn/về sớm theo quy ước
  
  actualWorkHours: number; // Giờ công thực tế được tính
  standardWorkHours: number; // Giờ công quy định (thường 8h)
  
  normalOtHours: number; // Giờ làm thêm ngày thường
  weekendOtHours: number; // Giờ làm thêm ngày nghỉ
  holidayOtHours: number; // Giờ làm thêm ngày lễ
  nightHours: number; // Giờ làm việc ban đêm (22h-6h)
  nightOtHours: number; // Giờ làm thêm ban đêm
  
  source: 'BIOMETRIC_DEVICE' | 'MOBILE_GPS_FACE' | 'WEB_PORTAL' | 'MANUAL_EXCEL';
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HOLIDAY' | 'ONLINE_WORK';
  notes?: string;
}

// ----------------------------------------------------
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

// ----------------------------------------------------
// QUẢN LÝ ĐƠN TỪ & PHÊ DUYỆT
// ----------------------------------------------------
export interface WorkflowRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode?: string;
  employeeName: string;
  departmentName: string;
  type: 'LEAVE' | 'OVERTIME' | 'ATTENDANCE_CORRECTION' | 'SALARY_ADVANCE' | 'RESIGNATION' | 'RETRACT_RESIGNATION' | 'SHIFT_SWAP' | 'GATE_PASS';
  title: string;
  reason: string;
  
  // Dữ liệu riêng
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  leaveType?: LeaveType;
  otHours?: number;
  otDate?: string;
  requestedAmount?: number; // Cho tạm ứng lương
  lastWorkingDate?: string; // Cho đơn xin thôi việc / nghỉ việc
  targetRequestId?: string; // Cho đơn xin rút lại đơn nghỉ việc đã nộp
  isPrintedAndSigned?: boolean; // Bắt buộc in đơn & ký tên trước khi lưu chính thức
  noticeDeliveredToManager?: boolean; // Tự động thông báo sớm cho Quản lý trực tiếp
  noticeDeliveredToHr?: boolean; // Tự động thông báo sớm cho Phòng Nhân Sự
  currentShiftCode?: string; // Ca hiện tại
  requestedShiftCode?: string; // Ca xin đổi sang
  swapWithEmployeeName?: string; // Người đổi ca cùng
  swapDate?: string; // Ngày đổi ca
  
  // Giấy Ra Vào Cổng Trong Giờ Làm (GATE_PASS)
  gatePassPurpose?: 'COMPANY_BUSINESS' | 'PERSONAL_AFFAIR'; // Việc công ty hoặc Việc riêng
  gatePassExitTime?: string; // Giờ ra dự kiến (ví dụ: "09:30")
  gatePassExpectedReturnTime?: string; // Giờ vào lại dự kiến (ví dụ: "11:30")
  isNotReturning?: boolean; // Không quay lại trong ngày (ra về luôn)
  hasGoodsOrAsset?: boolean; // Có mang theo hàng hóa / tài sản ra cổng không
  assetPermitNumber?: string; // Số hiệu Giấy phép tài sản của Kế toán & Phòng Ban kèm theo
  assetPermitNote?: string; // Ghi chú loại hàng hóa / tài sản
  securityCheckStatus?: 'PENDING_EXIT' | 'CHECKED_OUT' | 'CHECKED_IN'; // Trạng thái xác nhận của bảo vệ
  actualExitTime?: string; // Giờ bảo vệ ghi nhận ra cổng thực tế
  actualReturnTime?: string; // Giờ bảo vệ ghi nhận vào cổng thực tế
  securityGuardName?: string; // Tên bảo vệ chốt ca trực
  securityGuardNote?: string; // Ghi chú của bảo vệ khi qua cổng
  
  status: RequestStatus;
  currentApproverId: string;
  currentApproverName: string;
  approvalHistory: {
    step: number;
    approverName: string;
    action: 'APPROVED' | 'REJECTED' | 'FORWARDED';
    comment?: string;
    timestamp: string;
  }[];
  createdAt: string;
}

// ----------------------------------------------------
// BẢNG LƯƠNG TỔNG HỢP & CHI TIẾT (PAYROLL)
// ----------------------------------------------------
export interface PayrollRecord {
  id: string;
  tenantId: string;
  month: string; // "2026-08"
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  position: string;
  bankAccount: string;
  bankName: string;
  
  // Ngày công
  standardDays: number; // Công chuẩn tháng (ví dụ 26)
  actualWorkDays: number; // Công đi làm thực tế
  paidLeaveDays: number; // Công nghỉ phép có lương
  holidayDays: number; // Công nghỉ lễ hưởng lương
  totalPaidDays: number; // Tổng ngày công tính lương
  
  // Thu nhập lương chính & phụ cấp
  baseSalary: number; // Lương cơ bản theo HĐLĐ
  actualBaseSalary: number; // Lương cơ bản thực nhận theo ngày công
  positionSalary: number; // Lương hiệu quả / chức danh
  lunchAllowance: number; // Phụ cấp ăn trưa (miễn thuế)
  transportAllowance: number; // Xăng xe
  phoneAllowance: number; // Điện thoại
  toxicInKindCashValue: number; // Bồi dưỡng hiện vật độc hại quy đổi (sữa/đường)
  
  // Làm thêm giờ (OT) & Làm đêm
  normalOtPay: number; // Lương OT thường (150%)
  weekendOtPay: number; // Lương OT nghỉ tuần (200%)
  holidayOtPay: number; // Lương OT lễ tết (300%)
  nightPay: number; // Phụ cấp làm đêm (+30%)
  nightOtPay: number; // Lương OT đêm (210%/270%/390%)
  totalOtPay: number; // Tổng tiền làm thêm giờ
  taxFreeOtDifference: number; // Phần chênh lệch OT cao hơn ban ngày được miễn thuế TNCN
  
  // Thưởng & Khoản khác
  kpiBonus: number;
  attendanceBonus: number; // Thưởng chuyên cần
  totalGrossIncome: number; // Tổng thu nhập trước thuế & bảo hiểm
  
  // Trích nộp Bảo hiểm & Công đoàn (NLĐ chịu)
  bhxhEmp: number; // 8%
  bhytEmp: number; // 1.5%
  bhtnEmp: number; // 1%
  unionEmp: number; // Đoàn phí (1%)
  totalInsuranceEmp: number; // 10.5%
  
  // Bảo hiểm do Doanh nghiệp chịu (để tính chi phí nhân sự)
  bhxhComp: number; // 17.5%
  bhytComp: number; // 3%
  bhtnComp: number; // 1%
  unionComp: number; // Kinh phí CĐ DN (2%)
  totalLaborCostComp: number; // Tổng chi phí doanh nghiệp phải trả cho nhân sự này
  
  // Thuế Thu Nhập Cá Nhân (TNCN)
  taxableIncome: number; // Thu nhập chịu thuế
  personalDeduction: number; // Giảm trừ bản thân (11tr)
  dependentDeduction: number; // Giảm trừ người phụ thuộc (4.4tr x N)
  assessableIncome: number; // Thu nhập tính thuế (sau giảm trừ)
  personalIncomeTax: number; // Thuế TNCN
  taxMethod?: 'PROGRESSIVE_7_TIERS' | 'PROGRESSIVE_5_TIERS' | 'FLAT_10_PERCENT' | 'FLAT_20_NON_RESIDENT'; // Phương pháp tính thuế
  
  // Hiện vật phi tiền mặt (Non-Cash Items - KHÔNG cộng vào chuyển khoản ngân hàng)
  nonCashInKindValue: number; // Giá trị hiện vật (sữa độc hại TT24 + quà tặng hiện vật)
  
  // Khấu trừ khác & Thực lĩnh
  salaryAdvance: number; // Tạm ứng giữa tháng
  debtDeduction?: number; // Khấu trừ bồi hoàn tài sản / công nợ thanh lý
  unusedLeavePayout?: number; // Tiền thanh toán ngày phép tồn khi thôi việc
  otherDeductions: number; // Khấu trừ khác
  netSalary: number; // THỰC LĨNH CHUYỂN KHOẢN NGÂN HÀNG (Net Salary)
  
  // Phân loại kịch bản & Kiểm tra ngược
  scenarioTag?: string; // Nhãn kịch bản kiểm thử (VD: CEO_HIGH_TAX, PROBATION_10PCT, NIGHT_TOXIC, ...)
  scenarioLabel?: string; // Tên kịch bản tiếng Việt dễ đọc
  overtimeHoursDetails?: {
    normalOtHours: number;
    weekendOtHours: number;
    holidayOtHours: number;
    nightHours: number;
    nightOtHours: number;
  };
  reverseAuditTrail?: {
    step1NetBankTransfer: number;
    step2TotalGrossCash: number;
    step3DeductionsSum: number;
    step4NonCashExcluded: number;
    step5DifferenceCheck: number; // Phải bằng 0
    legalNotes: string[];
  };
  
  status: 'DRAFT' | 'APPROVED' | 'LOCKED' | 'PAID';
}

// ----------------------------------------------------
// THANH LÝ NGHỈ VIỆC (OFFBOARDING & SETTLEMENT)
// ----------------------------------------------------
export interface OffboardingRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  position: string;
  resignationDate: string; // Ngày nộp đơn
  lastWorkingDate: string; // Ngày làm việc cuối cùng
  reason: string;
  
  // Checklist bàn giao
  handoverWorkCompleted: boolean; // Bàn giao công việc
  handoverAssetCompleted: boolean; // Bàn giao laptop/thiết bị
  handoverItAccountCompleted: boolean; // Khóa tài khoản Email/ERP
  handoverFinanceCompleted: boolean; // Đối chiếu công nợ kế toán
  
  // Quyết toán tiền thôi việc
  remainingDaysSalary: number; // Lương ngày công còn lại chưa nhận
  remainingLeaveDays: number; // Số ngày phép năm còn tồn chưa nghỉ
  remainingLeavePay: number; // Tiền thanh toán phép tồn (theo BLLĐ)
  severancePay: number; // Trợ cấp thôi việc (nếu đủ điều kiện trước 2009)
  deductionDebt: number; // Các khoản nợ/bồi thường tài sản
  netSettlementAmount: number; // TỔNG TIỀN QUYẾT TOÁN THỰC LĨNH
  
  paymentDeadlineOption: 'WITHIN_14_DAYS' | 'NEXT_PAYROLL_CYCLE';
  status: 'IN_PROGRESS' | 'HANDOVER_DONE' | 'APPROVED' | 'COMPLETED';

  // Khóa quyền truy cập phần mềm sau ca làm việc cuối cùng & Bảo lưu lịch sử kiểm toán
  accountLockoutStatus?: 'ACTIVE' | 'SCHEDULED_LOCK' | 'LOCKED_POST_SHIFT';
  lockoutEffectiveTime?: string; // Ví dụ: "17:30 ngày 31/08/2026 (Ngay sau ca làm việc cuối)"
  preserveDataAudit?: boolean; // Mặc định true: Mật khẩu mã hóa & 100% lịch sử công tác giữ nguyên vẹn
}

// ----------------------------------------------------
// GÓP Ý & BÁO LỖI (FEEDBACK SYSTEM)
// ----------------------------------------------------
export interface FeedbackItem {
  id: string;
  moduleName: string;
  userName: string;
  userRole: UserRole;
  feedbackType: 'BUG' | 'FEATURE_REQUEST' | 'UI_IMPROVEMENT';
  content: string;
  expectedResult: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

// ----------------------------------------------------
// TUYỂN DỤNG ATS & AI BÓC TÁCH CV
// ----------------------------------------------------
export type CandidateStage = 
  | 'NEW_APPLIED'          // Mới nộp
  | 'AI_SCREENED'          // Đạt sơ loại AI (>70%)
  | 'INTERVIEWING'         // Đang phỏng vấn
  | 'OFFERED'              // Đã gửi Offer
  | 'HIRED'                // Đã nhận việc (chuyển sang thử việc)
  | 'REJECTED';            // Không phù hợp

export interface JobCandidate {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  positionApplied: string;
  departmentName: string;
  appliedDate: string;
  cvUrl?: string;
  skills: string[];
  experienceYears: number;
  aiMatchScore: number; // 0 - 100%
  aiReviewNotes: string;
  stage: CandidateStage;
  offeredSalary?: number;
  interviewDate?: string;
  interviewNotes?: string;
}

// ----------------------------------------------------
// HIỆU SUẤT & ĐÁNH GIÁ KPI / OKR 360 ĐỘ
// ----------------------------------------------------
export interface KpiGoal {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  quarter: string; // "Q3-2026"
  title: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  weightPercent: number; // Tỷ trọng (ví dụ 30%)
  selfScore: number; // Nhân viên tự đánh giá (0-100)
  managerScore: number; // Quản lý đánh giá (0-100)
  peerScore: number; // Đồng nghiệp đánh giá (0-100)
  finalWeightedScore: number; // Điểm 360 tổng hợp (20% + 60% + 20%)
  ratingRank: 'A' | 'B' | 'C' | 'D'; // A: Xuất sắc, B: Đạt, C: Cải thiện, D: Yếu
}

// ----------------------------------------------------
// BÁO CÁO CÔNG VIỆC HẰNG NGÀY GẮN KẾT KPI & JD
// ----------------------------------------------------
export interface DailyWorkReportItem {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId?: string;
  departmentName: string;
  positionName?: string;
  isDeptHead?: boolean; // Có phải Trưởng phòng không (để kiểm soát quyền xem chéo theo quy ước)
  date: string; // YYYY-MM-DD
  taskTitle: string;
  taskDescription: string;
  spentHours: number;
  targetType: 'KPI_METRIC' | 'JOB_DESCRIPTION'; // Bắt buộc: Gắn với KPI tháng hoặc Gắn với Mô tả công việc JD
  kpiId?: string;
  kpiName?: string;
  kpiProgressContribution?: number; // % đóng góp tiến độ vào chỉ số KPI này (VD: 5%)
  jdDutyId?: string;
  jdDutyName?: string; // Tên nhiệm vụ thường nhật theo JD
  status: 'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED';
  blockerReason?: string; // Khó khăn / vướng mắc cần sếp hoặc đồng nghiệp hỗ trợ
  managerFeedback?: string; // Nhận xét của Quản lý / Trưởng phòng
  managerRating?: 1 | 2 | 3 | 4 | 5; // Đánh giá sao của Quản lý
  createdAt: string;
}

// ----------------------------------------------------
// BẢN MÔ TẢ CÔNG VIỆC (JOB DESCRIPTION - JD)
// ----------------------------------------------------
export interface JobDescription {
  id: string;
  title: string;
  departmentName: string;
  salaryRange: string;
  minExperienceYears: number;
  summary: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
}

// ----------------------------------------------------
// ĐÀO TẠO NỘI BỘ (LMS) & KHUNG NĂNG LỰC
// ----------------------------------------------------
export interface TrainingCourse {
  id: string;
  tenantId: string;
  title: string;
  category: 'ONBOARDING' | 'SAFETY_LABOR' | 'SKILLS' | 'MANAGEMENT';
  description: string;
  durationHours: number;
  isRequired: boolean;
  totalLessons: number;
  enrolledEmployees: number;
  passPercentage: number;
  videoUrl?: string;
  minRequiredMinutes?: number;
  actualWatchedMinutes?: number;
  watchCount?: number;
  isWatchRequirementMet?: boolean;
  isCompleted?: boolean;
  realVideoDurationSeconds?: number;
  realVideoDurationText?: string;
}

// ----------------------------------------------------
// HỆ THỐNG QUẢN TRỊ ĐÀO TẠO & PHÁT TRIỂN NĂNG LỰC (L&D)
// ----------------------------------------------------
export interface TrainingGroupQuota {
  id: string;
  groupId: 'MANAGEMENT' | 'SPECIALIST' | 'FACTORY' | 'ONBOARDING';
  groupName: string;
  targetHoursPerYear: number;
  minInternalRatio: number; // Tối thiểu % giờ đào tạo nội bộ (mặc định 70%)
  kpiWeightPercent: number; // Trọng số xét thi đua/KPI năm (%)
  description: string;
  applicableRoles: string;
}

export interface EmployeeTrainingProgress {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  roleTitle: string;
  groupId: 'MANAGEMENT' | 'SPECIALIST' | 'FACTORY' | 'ONBOARDING';
  groupName: string;
  targetHours: number;
  internalHours: number; // Giờ đào tạo nội bộ (LMS, OJT, Workshop)
  externalHours: number; // Giờ đào tạo cử đi bên ngoài
  totalAccumulatedHours: number;
  internalRatioActual: number; // % giờ nội bộ thực tế
  completionRate: number; // % hoàn thành so với chỉ tiêu năm
  kpiStatus: 'MET' | 'WARNING_LOW_HOURS' | 'EXCELLENT';
  lastUpdated: string;
}

export interface ExternalTrainingCourse {
  id: string;
  courseName: string;
  provider: string; // Đơn vị đào tạo (VD: Trung tâm Kiểm định ATVSLĐ, Viện FMIT...)
  category: 'LEADERSHIP' | 'COMPLIANCE' | 'TECHNICAL' | 'CERTIFICATION';
  durationHours: number;
  costPerPerson: number;
  location: string;
  startDate: string;
  endDate: string;
  requiredCommitmentMonths: number; // Số tháng cam kết theo Điều 62 BLLĐ
  enrolledCount: number;
  status: 'PLANNED' | 'ENROLLING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface TrainingCommitment {
  id: string;
  commitmentCode: string;
  employeeId: string;
  employeeName: string;
  department: string;
  courseName: string;
  provider: string;
  trainingCost: number; // Chi phí đào tạo do công ty chi trả
  allowanceAmount?: number; // Tiền lương, chi phí ăn ở, đi lại trong thời gian học (Điều 62 BLLĐ)
  totalInvestmentCost: number;
  commitmentMonths: number; // Số tháng cam kết làm việc sau khóa học
  startDate: string; // Ngày ký cam kết / bắt đầu tính cam kết
  endDate: string; // Ngày hết hạn cam kết
  servedMonths: number; // Số tháng đã phục vụ thực tế
  remainingMonths: number; // Số tháng cam kết còn lại
  potentialRefundAmount: number; // Số tiền phải bồi hoàn khấu hao nếu nghỉ việc hiện tại
  status: 'ACTIVE' | 'FULFILLED' | 'REFUNDED';
  legalRef: string; // Căn cứ Điều 62 Bộ luật Lao động 2019
}

export interface SkillMatrixItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  roleTitle: string;
  skillName: string;
  category: 'CORE_TECHNICAL' | 'SAFETY_QUALITY' | 'LEADERSHIP' | 'DIGITAL';
  requiredLevel: 1 | 2 | 3 | 4; // 1: Cơ bản, 2: Làm có hướng dẫn, 3: Làm độc lập, 4: Thành thạo & Đào tạo người khác
  currentLevel: 1 | 2 | 3 | 4;
  gap: number; // requiredLevel - currentLevel (nếu > 0 là thiếu hụt)
  recommendedCourseTitle: string;
  status: 'QUALIFIED' | 'NEEDS_TRAINING' | 'TRAINING_IN_PROGRESS';
}

export interface InternalTrainer {
  id: string;
  trainerCode: string;
  employeeId: string;
  employeeName: string;
  department: string;
  roleTitle: string;
  specialtyTopics: string[];
  totalTeachingHours: number; // Số giờ giảng dạy tích lũy năm 2026
  hourlyAllowanceRate: number; // Mức phụ cấp thù lao giảng dạy vnđ/giờ
  totalAllowancePaid: number; // Tổng thù lao đã chi trả vnđ
  studentRatingAverage: number; // Điểm đánh giá trung bình từ học viên (thang điểm 5)
  totalClassesTaught: number;
  status: 'ACTIVE' | 'RESERVE';
}

export interface TrainingBudgetReport {
  year: number;
  totalApprovedBudget: number;
  totalSpentBudget: number;
  internalTrainingSpent: number;
  externalTrainingSpent: number;
  avgCostPerEmployee: number;
  internalHoursPercentage: number;
  totalEmployeesTargetMet: number;
  totalEmployeesUnderTarget: number;
}

// ----------------------------------------------------
// HẠCH TOÁN KẾ TOÁN TIỀN LƯƠNG (TT 200/133)
// ----------------------------------------------------
export interface AccountingJournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string; // Nợ TK (642, 641, 622, 627)
  creditAccount: string; // Có TK (334, 338, 3335)
  amount: number;
  departmentName: string;
}

// ----------------------------------------------------
// BIẾN ĐỘNG NHÂN SỰ & QUYẾT ĐỊNH / PHỤ LỤC HỢP ĐỒNG
// ----------------------------------------------------
export type PersonnelChangeType = 
  | 'TRANSFER'         // Điều chuyển phòng ban/chi nhánh
  | 'PROMOTION'        // Bổ nhiệm / Thăng chức
  | 'DEMOTION'          // Miễn nhiệm / Giáng chức
  | 'SALARY_ADJUST'    // Điều chỉnh thang bảng lương
  | 'STATUS_CHANGE';   // Chuyển loại hình (Thử việc -> Chính thức)

export interface PersonnelChange {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  changeType: PersonnelChangeType;
  effectiveDate: string; // Ngày có hiệu lực
  reason: string; // Lý do biến động

  // Trạng thái phê duyệt
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedDate?: string;

  // Số văn bản pháp lý ban hành
  decisionNumber: string; // Số Quyết định (VD: 45/QĐ-AVM-2026)
  decisionSignerName: string; // Người ký quyết định (Tổng Giám Đốc)
  decisionSignerPosition: string;

  annexNumber: string; // Số Phụ lục HĐLĐ (VD: PL01/HDLD-2020-001)
  annexSignDate: string; // Ngày ký phụ lục

  // So sánh Trước và Sau biến động
  oldDepartment: string;
  newDepartment: string;
  oldPosition: string;
  newPosition: string;
  oldBranch: string;
  newBranch: string;
  oldBaseSalary: number;
  newBaseSalary: number;
  oldPositionSalary: number;
  newPositionSalary: number;

  salaryDiff: number; // Chênh lệch lương (+ / -)
  notes?: string;
}

// ----------------------------------------------------
// KỶ LUẬT LAO ĐỘNG & SA THẢI (ĐIỀU 122, 125 BLLĐ 2019)
// ----------------------------------------------------
export type DisciplinaryInfractionType = 
  | 'ASSAULT_FIGHTING'        // Đánh nhau, gây thương tích tại nơi làm việc
  | 'THEFT'                   // Trộm cắp, tham ô tài sản công ty
  | 'REPEATED_NON_COMPLIANCE' // Không tuân thủ nhiều lần (vắng mặt 5 ngày/30 ngày)
  | 'POOR_PERFORMANCE'        // Không hoàn thành công việc sau nhiều lần nhắc nhở
  | 'SAFETY_VIOLATION';       // Vi phạm nghiêm trọng quy chuẩn an toàn lao động

export type DisciplinaryForm = 
  | 'REPRIMAND'               // Khiển trách bằng văn bản
  | 'SALARY_DELAY'            // Kéo dài thời hạn nâng lương (không quá 6 tháng)
  | 'DEMOTION'                // Cách chức
  | 'DISMISSAL';              // Sa thải (hình thức kỷ luật cao nhất)

export interface DisciplinaryRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  infractionType: DisciplinaryInfractionType;
  infractionDescription: string;
  infractionDate: string;
  form: DisciplinaryForm;
  
  // Trình tự thủ tục pháp lý theo Điều 122 BLLĐ 2019
  invitationLetterSentDate: string; // Ngày gửi giấy mời họp trước 3 ngày
  meetingMinutesDate: string; // Ngày họp và lập biên bản xử lý kỷ luật
  unionRepresentativeAttended: boolean; // Có đại diện BCH Công đoàn cơ sở tham gia
  decisionNumber: string; // Số QĐ (VD: 18/QĐ-ST-AVM-2026)
  decisionDate: string; // Ngày ký quyết định
  decisionSignerName: string; // Người ký (Tổng Giám Đốc)
  decisionSignerPosition: string;
  status: 'PENDING_MEETING' | 'DECIDED' | 'EXECUTED';
  attachments?: { name: string; type: string }[];
}

// ----------------------------------------------------
// KHO TÀI LIỆU NỘI QUY & AI RÀ SOÁT XUNG ĐỘT CHÍNH SÁCH
// ----------------------------------------------------
export interface PolicyDocument {
  id: string;
  tenantId: string;
  title: string;
  category: 'LABOR_REGULATION' | 'SALARY_RULE' | 'DISCIPLINE_RULE' | 'SAFETY_RULE' | 'OTHER';
  fileName: string;
  uploadDate: string;
  effectiveDate: string;
  version: string;
  fileSizeText: string;
  status: 'ACTIVE' | 'DRAFT' | 'SUPERSEDED';
  summary: string;
  extractedClauses?: {
    standardHoursPerWeek: number;
    probationSalaryRate: number;
    regionalMinimumTier: number;
    annualLeaveDays: number;
    overtimeWeekdayRate: number;
    overtimeWeekendRate: number;
    lateGraceMinutes: number;
  };
  linkOffice?: string; // Link bản office (word, docx, excel) - chỉ quản trị & tiền lương thao tác
  linkPdf?: string;    // Link bản pdf công ty đã duyệt & áp dụng - mọi người đều xem được
  isApproved?: boolean; // Trạng thái công ty đã duyệt và áp dụng
  contentText?: string; // Nội dung văn bản xem trực tiếp
  validityScope?: 'FULL' | 'PARTIAL' | 'EXPIRED'; // 2.1: Hiệu lực toàn phần | 2.2: Hiệu lực một phần | 3: Hết hiệu lực hoàn toàn
  partialValidityNote?: string; // Ghi chú cụ thể các điều khoản bị thay thế một phần
  supersededBy?: string; // Tên văn bản mới thay thế
  expiredDate?: string; // Ngày hết hiệu lực
  expiredReason?: string; // Lý do hết hiệu lực hoàn toàn
}

export interface PolicyConflictItem {
  id: string;
  category: string;
  regulationValue: string; // Quy định trong văn bản nội quy tải lên
  systemSettingValue: string; // Cấu hình tham số phần mềm đang áp dụng
  isConflict: boolean; // Có bị xung đột không
  legalReference: string; // Căn cứ pháp lý
  explanation: string; // Giải thích của AI
  suggestedAction: string; // Đề xuất của AI
}

// ========================================================
// THỦ TỤC & BIẾN ĐỘNG NHÂN SỰ (PERSONNEL PROCEDURES & CHANGES)
// ========================================================
export type PersonnelChangeType = 
  | 'SALARY_ADJUSTMENT'      // Điều chỉnh Lương & Phụ cấp
  | 'PROMOTION_APPOINTMENT'  // Bổ nhiệm / Thăng chức / Thay đổi chức danh
  | 'DEPARTMENT_TRANSFER'    // Điều chuyển Phòng ban / Bộ phận / Phân xưởng
  | 'WORKPLACE_RELOCATION'   // Thay đổi Địa điểm / Nơi làm việc (VP/Nhà máy)
  | 'BENEFITS_SHIFT_CHANGE'  // Thay đổi Chế độ đãi ngộ / Ca làm việc
  | 'OFFICIAL_CONVERSION'    // Chuyển nhân sự chính thức sau thử việc
  | 'REWARD_DISCIPLINE';     // Khen thưởng / Kỷ luật lao động

export type PersonnelChangeStatus = 
  | 'DRAFT'                  // Dự thảo / Mới lập
  | 'PROPOSED'               // Đã đề xuất (Chờ HR kiểm tra)
  | 'HR_REVIEWED'            // HR đã rà soát định biên & quỹ lương
  | 'APPROVED'               // Ban Giám Đốc đã phê duyệt
  | 'DECISION_ISSUED'        // Đã ban hành Quyết định chính thức
  | 'APPLIED'                // Đã áp dụng (Cập nhật Hồ sơ & Tiền lương)
  | 'REJECTED';              // Từ chối phê duyệt

export interface PersonnelChange {
  id: string;
  code: string; // Mã phiếu: BDNS-2026-001
  tenantId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  currentPosition: string;
  type: PersonnelChangeType;
  title: string; // Tiêu đề biến động
  reason: string; // Lý do đề xuất biến động
  effectiveDate: string; // Ngày có hiệu lực áp dụng (YYYY-MM-DD)
  
  // Dữ liệu trước biến động
  previousData: {
    baseSalary?: number;
    positionSalary?: number;
    lunchAllowance?: number;
    transportAllowance?: number;
    phoneAllowance?: number;
    toxicTier?: 0 | 1 | 2 | 3 | 4;
    position?: string;
    departmentId?: string;
    departmentName?: string;
    branchId?: string;
    branchName?: string;
    status?: EmployeeStatus;
  };
  
  // Dữ liệu mới đề xuất / được duyệt
  proposedData: {
    baseSalary?: number;
    positionSalary?: number;
    lunchAllowance?: number;
    transportAllowance?: number;
    phoneAllowance?: number;
    toxicTier?: 0 | 1 | 2 | 3 | 4;
    position?: string;
    departmentId?: string;
    departmentName?: string;
    branchId?: string;
    branchName?: string;
    status?: EmployeeStatus;
  };

  // Tiến trình phê duyệt 5 bước
  status: PersonnelChangeStatus;
  proposedBy: string; // Quản lý bộ phận lập đề xuất
  proposedDate: string;
  hrReviewedBy?: string; // Chuyên viên HR thẩm định
  hrReviewedDate?: string;
  hrNotes?: string;
  approvedBy?: string; // Ban Giám Đốc phê duyệt
  approvedDate?: string;
  approvalNotes?: string;
  
  // Quyết định ban hành
  decisionNumber?: string; // Số QĐ: QD-088/2026/QD-NS
  decisionDate?: string;
  signerName?: string;
  signerTitle?: string;
  
  // Trạng thái áp dụng vào dữ liệu thực tế
  isAppliedToPayroll: boolean; // Đã liên kết chu kỳ tính lương
  isAppliedToProfile: boolean; // Đã cập nhật vào hồ sơ nhân sự
  appliedDate?: string;

  // Kiểm soát thủ công phát hành thông báo cho nhân sự (Tránh rủi ro phát hành tự động khi Sếp cần sửa phút chót)
  isNotifiedToEmployee?: boolean;
  notifiedDate?: string;
  notifiedBy?: string;

  attachments?: { name: string; size: string; url: string }[];
}

// ========================================================
// SO SÁNH BIẾN ĐỘNG CHI PHÍ LƯƠNG VỚI THÁNG TRƯỚC (PAYROLL VARIANCE ANALYSIS)
// ========================================================
export interface PayrollCostSummary {
  month: string;
  previousMonth: string;
  totalNet: number;
  prevTotalNet: number;
  deltaNet: number;
  deltaNetPercent: number;

  totalGross: number;
  prevTotalGross: number;
  deltaGross: number;
  deltaGrossPercent: number;

  totalEmployerInsurance: number; // 23.5% (17.5% BHXH + 3% BHYT + 1% BHTN + 2% KPCĐ)
  prevTotalEmployerInsurance: number;
  deltaEmployerInsurance: number;

  totalEmployerCost: number; // Gross + Bảo hiểm DN
  prevTotalEmployerCost: number;
  deltaEmployerCost: number;
  deltaEmployerCostPercent: number;

  totalPersonalTax: number;
  prevTotalPersonalTax: number;
  deltaTax: number;

  totalHeadcount: number;
  prevTotalHeadcount: number;
  deltaHeadcount: number;
  newHiresCount: number;
  resignedCount: number;
}

export interface ParameterVarianceItem {
  id: string;
  category: string;
  currentAmount: number;
  previousAmount: number;
  deltaAmount: number;
  deltaPercent: number;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  analysisNote: string;
}

export interface EmployeeVarianceRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  position: string;
  currentNet: number;
  prevNet: number;
  deltaNet: number;
  deltaPercent: number;
  currentGross: number;
  prevGross: number;
  currentOtPay: number;
  prevOtPay: number;
  currentBaseSalary: number;
  prevBaseSalary: number;
  rootCause: string;
  changeType: 'INCREASE' | 'DECREASE' | 'UNCHANGED' | 'NEW_HIRE' | 'OFFBOARDED';
}

export interface DepartmentVarianceRecord {
  departmentName: string;
  headcount: number;
  prevHeadcount: number;
  currentTotalNet: number;
  prevTotalNet: number;
  deltaNet: number;
  deltaPercent: number;
  currentOtPay: number;
  prevOtPay: number;
  deltaOtPay: number;
  otBudgetStatus: 'WITHIN_BUDGET' | 'WARNING' | 'EXCEEDED';
}



