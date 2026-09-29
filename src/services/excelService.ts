// ========================================================
// EXCEL SERVICE - XUẤT / NHẬP EXCEL HAI CHIỀU VỚI SHEETJS
// ========================================================

import * as XLSX from 'xlsx';
import { Employee, PayrollRecord, AttendanceRecord } from '../types/hrm';

export const excelService = {
  /**
   * Xuất danh sách hồ sơ nhân sự ra file Excel mẫu chuẩn
   */
  exportEmployees(employees: Employee[], fileName: string = 'Danh_sach_nhan_su.xlsx') {
    const data = employees.map((emp, index) => ({
      'STT': index + 1,
      'Mã Nhân Viên': emp.code,
      'Họ Và Tên': emp.fullName,
      'Giới Tính': emp.gender === 'MALE' ? 'Nam' : 'Nữ',
      'Ngày Sinh': emp.dob,
      'Số Điện Thoại': emp.phone,
      'Email': emp.email,
      'Số CCCD': emp.cccd,
      'Chi Nhánh / Nhà Máy': emp.branchName,
      'Phòng Ban': emp.departmentName,
      'Chức Vụ': emp.position,
      'Trạng Thái': emp.status === 'OFFICIAL' ? 'Chính thức' : emp.status === 'PROBATION' ? 'Thử việc' : emp.status === 'COLLABORATOR' ? 'Cộng tác viên' : 'Nghỉ việc',
      'Loại Hợp Đồng': emp.contractType,
      'Ngày Vào Làm': emp.joinDate,
      'Số Tài Khoản': emp.bankAccountNumber,
      'Ngân Hàng': emp.bankName,
      'Mã Số Thuế': emp.taxCode,
      'Mã Sổ BHXH': emp.socialInsuranceNumber,
      'Người Phụ Thuộc': emp.numberOfDependents,
      'Lương Cơ Bản': emp.baseSalary,
      'Lương Chức Danh': emp.positionSalary,
      'Phụ Cấp Ăn Trưa': emp.lunchAllowance,
      'Phụ Cấp Xăng Xe': emp.transportAllowance,
      'Mức Bồi Dưỡng Độc Hại': emp.toxicTier,
      'HĐ Dịch Vụ Dân Sự (CTV)': emp.isCivilContractor ? 'Có' : 'Không',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hồ Sơ Nhân Sự');
    XLSX.writeFile(workbook, fileName);
  },

  /**
   * Xuất bảng lương tổng hợp ra Excel chi tiết từng khoản
   */
  exportPayroll(records: PayrollRecord[], month: string) {
    const data = records.map((rec, index) => ({
      'STT': index + 1,
      'Mã NV': rec.employeeCode,
      'Họ và Tên': rec.employeeName,
      'Phòng Ban': rec.departmentName,
      'Chức Vụ': rec.position,
      'Công Chuẩn': rec.standardDays,
      'Công Đi Làm': rec.actualWorkDays,
      'Công Nghỉ Phép': rec.paidLeaveDays,
      'Tổng Ngày Công': rec.totalPaidDays,
      'Lương Cơ Bản': rec.baseSalary,
      'Lương Theo Công': rec.actualBaseSalary,
      'Lương Hiệu Quả / 3P': rec.positionSalary,
      'Phụ Cấp Ăn Trưa': rec.lunchAllowance,
      'Phụ Cấp Xăng Xe': rec.transportAllowance,
      'Bồi Dưỡng Hiện Vật Độc Hại': rec.toxicInKindCashValue,
      'Lương Làm Thêm Giờ (OT)': rec.totalOtPay,
      'Thưởng KPI & Chuyên Cần': rec.kpiBonus + rec.attendanceBonus,
      'TỔNG THU NHẬP (GROSS)': rec.totalGrossIncome,
      'BHXH (8%)': rec.bhxhEmp,
      'BHYT (1.5%)': rec.bhytEmp,
      'BHTN (1%)': rec.bhtnEmp,
      'Đoàn Phí CĐ (1%)': rec.unionEmp,
      'Giảm Trừ Gia Cảnh': rec.personalDeduction + rec.dependentDeduction,
      'Thu Nhập Tính Thuế': rec.assessableIncome,
      'Thuế TNCN': rec.personalIncomeTax,
      'Tạm Ứng Giữa Kỳ': rec.salaryAdvance,
      'THỰC LĨNH CHUYỂN KHOẢN': rec.netSalary,
      'Số Tài Khoản': rec.bankAccount,
      'Ngân Hàng': rec.bankName,
      'Chi Phí BHXH DN Chịu (17.5%)': rec.bhxhComp,
      'Chi Phí BHYT DN Chịu (3%)': rec.bhytComp,
      'Kinh Phí Công Đoàn DN (2%)': rec.unionComp,
      'TỔNG CHI PHÍ LAO ĐỘNG': rec.totalLaborCostComp,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Bảng Lương ${month}`);
    XLSX.writeFile(workbook, `Bang_Luong_Chi_Tiet_${month}.xlsx`);
  },

  /**
   * Xuất danh sách chuyển khoản ngân hàng (Chi hộ lương)
   */
  exportBankTransfer(records: PayrollRecord[], bankName: string = 'Vietcombank') {
    const filtered = records.filter(r => r.netSalary > 0);
    const data = filtered.map((rec, index) => ({
      'STT': index + 1,
      'Số Tài Khoản': rec.bankAccount,
      'Tên Người Thụ Hưởng': rec.employeeName.toUpperCase(),
      'Số Tiền': rec.netSalary,
      'Ngân Hàng Nhận': rec.bankName,
      'Nội Dung Chi Lương': `Thanh toan tien luong ky ${rec.month} cho ${rec.employeeName}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Chi Luong ${bankName}`);
    XLSX.writeFile(workbook, `Danh_Sach_Chi_Luong_${bankName}.xlsx`);
  },

  /**
   * Xuất Bảng Đối Chiếu Kiểm Tra Ngược Chuyển Khoản Ngân Hàng & Bảng Lương (Reverse Audit Report)
   */
  exportReverseAuditReport(records: PayrollRecord[], month: string) {
    const data = records.map((rec, index) => {
      const audit = rec.reverseAuditTrail;
      const cashGross = audit ? audit.step2TotalGrossCash : rec.totalGrossIncome - rec.nonCashInKindValue;
      const totalDeductions = audit ? audit.step3DeductionsSum : (rec.totalInsuranceEmp + rec.unionEmp + rec.personalIncomeTax + rec.salaryAdvance + (rec.debtDeduction || 0));
      const nonCash = audit ? audit.step4NonCashExcluded : rec.nonCashInKindValue;
      const diffCheck = audit ? audit.step5DifferenceCheck : (cashGross - totalDeductions - rec.netSalary);

      return {
        'STT': index + 1,
        'Mã Nhân Viên': rec.employeeCode,
        'Họ Và Tên': rec.employeeName,
        'Phòng Ban': rec.departmentName,
        'Chức Vụ': rec.position,
        'Số Tài Khoản': rec.bankAccount,
        'Ngân Hàng Nhận': rec.bankName,
        'Kịch Bản / Tình Huống': rec.scenarioLabel || 'Nhân viên chính thức',

        // 1. DÒNG TIỀN CHUYỂN KHOẢN (NET)
        '[A] SỐ TIỀN CHUYỂN KHOẢN (NET)': rec.netSalary,

        // 2. BÓC TÁCH THU NHẬP TIỀN MẶT (GROSS)
        '[B] TỔNG THU NHẬP TIỀN MẶT': cashGross,
        'B1. Lương Công Thực Tế': rec.actualBaseSalary,
        'B2. Lương Hiệu Quả / 3P': rec.positionSalary,
        'B3. Phụ Cấp Ăn Trưa (Miễn Thuế)': rec.lunchAllowance,
        'B4. Phụ Cấp Xăng Xe & ĐT': rec.transportAllowance + rec.phoneAllowance,
        'B5. Lương Làm Thêm Giờ (OT)': rec.totalOtPay,
        'B6. Trong Đó Miễn Thuế OT': rec.taxFreeOtDifference,
        'B7. Thưởng KPI & Chuyên Cần': rec.kpiBonus + rec.attendanceBonus,
        'B8. Thanh Toán Phép Tồn Thôi Việc': rec.unusedLeavePayout || 0,

        // 3. BÓC TÁCH CÁC KHOẢN KHẤU TRỪ
        '[C] TỔNG CÁC KHOẢN KHẤU TRỪ': totalDeductions,
        'C1. BHXH (8%)': rec.bhxhEmp,
        'C2. BHYT (1.5%)': rec.bhytEmp,
        'C3. BHTN (1%)': rec.bhtnEmp,
        'C4. Đoàn Phí Công Đoàn': rec.unionEmp,
        'C5. Thuế Thu Nhập Cá Nhân': rec.personalIncomeTax,
        'Phương Pháp Tính Thuế': rec.taxMethod === 'FLAT_20_NON_RESIDENT' 
          ? 'Khấu trừ 20% (Không cư trú)' 
          : rec.taxMethod === 'FLAT_10_PERCENT' 
          ? 'Khấu trừ 10% (Thử việc/Dịch vụ)' 
          : rec.taxMethod === 'PROGRESSIVE_5_TIERS' 
          ? 'Biểu lũy tiến 5 BẬC MỚI (Luật TNCN 2025)' 
          : 'Biểu lũy tiến 7 BẬC CŨ',
        'C6. Tạm Ứng Giữa Kỳ': rec.salaryAdvance,
        'C7. Khấu Trừ Công Nợ / Bồi Hoàn': rec.debtDeduction || 0,

        // 4. HIỆN VẬT PHI TIỀN MẶT
        '[D] HIỆN VẬT PHI TIỀN MẶT (ĐÃ LOẠI TRỪ)': nonCash,
        'D1. Sữa Độc Hại TT24': rec.toxicInKindCashValue,
        'D2. Quà Hiện Vật Chịu Thuế': nonCash - rec.toxicInKindCashValue,

        // 5. KIỂM TRA ĐỐI CHIẾU NGƯỢC
        '[E] ĐỐI CHIẾU NGƯỢC (B - C - A)': diffCheck,
        'Trạng Thái Kiểm Tra': diffCheck === 0 ? 'KHỚP TUYỆT ĐỐI (100%)' : 'LỆCH CẦN KIỂM TRA',

        // 6. CĂN CỨ PHÁP LÝ & GHI CHÚ
        'Căn Cứ Pháp Lý': audit ? audit.legalNotes.join(' | ') : 'Chuẩn BLLĐ 2019 & TT 111',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Kiem_Tra_Nguoc_${month}`);
    XLSX.writeFile(workbook, `Bang_Kiem_Tra_Nguoc_Chuyen_Khoan_${month}.xlsx`);
  },

  /**
   * Xuất báo cáo chất lượng đào tạo nội bộ
   */
  exportTrainingReport(courses: any[]) {
    const data = courses.map((c, index) => ({
      'STT': index + 1,
      'Tên Khóa Học': c.title,
      'Danh Mục': c.category,
      'Thời Lượng (Giờ)': c.durationHours,
      'Thời Gian Xem Tối Thiểu (Phút)': c.minRequiredMinutes || 0,
      'Thời Gian Đã Xem (Phút)': c.actualWatchedMinutes || 0,
      'Số Lượt Xem': c.watchCount || 0,
      'Đạt Yêu Cầu': c.isWatchRequirementMet ? 'Đạt' : 'Chưa đạt',
      'Số Học Viên': c.enrolledEmployees,
      'Tỷ Lệ Hoàn Thành': `${c.passPercentage}%`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo Cáo Đào Tạo');
    XLSX.writeFile(workbook, 'Bao_Cao_Dao_Tao.xlsx');
  },

  /**
   * Xuất nhật ký chấm công hàng ngày ra Excel
   */
  exportAttendance(records: AttendanceRecord[], dateStr: string) {
    const data = records.map((rec, index) => ({
      'STT': index + 1,
      'Mã Nhân Viên': rec.employeeCode,
      'Họ Và Tên': rec.employeeName,
      'Phòng Ban': rec.departmentName,
      'Ngày': rec.date,
      'Ca Làm Việc': rec.shiftCode,
      'Giờ Vào': rec.checkIn,
      'Giờ Ra': rec.checkOut,
      'Số Phút Đi Muộn': rec.lateMinutes,
      'Giờ Công Bị Trừ': rec.deductedWorkHours,
      'Công Thực Tính': rec.actualWorkHours,
      'Giờ Chuẩn Ca': rec.standardWorkHours,
      'Giờ Làm Đêm (22h-6h)': rec.nightHours,
      'Giờ OT Ngày Thường': rec.normalOtHours,
      'Nguồn Dữ Liệu': rec.source === 'BIOMETRIC_DEVICE' ? 'Máy Vân Tay' : rec.source === 'MOBILE_GPS_FACE' ? 'Mobile GPS' : 'Web Portal',
      'Ghi Chú': rec.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Cham_Cong_${dateStr}`);
    XLSX.writeFile(workbook, `Nhat_ky_cham_cong_${dateStr}.xlsx`);
  },

  /**
   * Đọc file Excel tải lên từ người dùng
   */
  readExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  }
};
