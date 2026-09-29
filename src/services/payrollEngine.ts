// ========================================================
// ĐỘNG CƠ TÍNH TOÁN TIỀN LƯƠNG, THUẾ TNCN & BÓC TÁCH KIỂM TRA NGƯỢC
// Chuẩn Bộ luật Lao động 2019, Thông tư 111/2013/TT-BTC, Thông tư 24/2022/TT-BLĐTBXH,
// Nghị định 293/2025/NĐ-CP (Lương tối thiểu vùng I: 5.310.000đ), Nghị định 158/2025/NĐ-CP
// ========================================================

import { Employee, CompanyPolicy, PayrollRecord } from '../types/hrm';

/**
 * Tính thuế TNCN theo biểu lũy tiến từng phần 7 bậc (Áp dụng theo Luật Thuế TNCN 2007 và các sửa đổi trước năm 2026)
 * @param assessableIncome Thu nhập tính thuế (đã trừ gia cảnh, bảo hiểm, khoản miễn thuế)
 */
export function calculatePIT7Tiers(assessableIncome: number): number {
  if (assessableIncome <= 0) return 0;
  const income = assessableIncome;

  if (income <= 5_000_000) {
    return income * 0.05;
  } else if (income <= 10_000_000) {
    return income * 0.10 - 250_000;
  } else if (income <= 18_000_000) {
    return income * 0.15 - 750_000;
  } else if (income <= 32_000_000) {
    return income * 0.20 - 1_650_000;
  } else if (income <= 52_000_000) {
    return income * 0.25 - 3_250_000;
  } else if (income <= 80_000_000) {
    return income * 0.30 - 5_850_000;
  } else {
    return income * 0.35 - 9_850_000;
  }
}

/**
 * Tính thuế TNCN theo biểu lũy tiến từng phần 5 bậc mới theo Luật Thuế TNCN năm 2025 (Luật số 109/2025/QH15)
 * Áp dụng từ kỳ tính thuế năm 2026:
 * Bậc 1: Đến 10 triệu/tháng: 5%
 * Bậc 2: Trên 10 triệu đến 30 triệu/tháng: 10% (trừ 500.000đ)
 * Bậc 3: Trên 30 triệu đến 60 triệu/tháng: 20% (trừ 3.500.000đ)
 * Bậc 4: Trên 60 triệu đến 100 triệu/tháng: 30% (trừ 9.500.000đ)
 * Bậc 5: Trên 100 triệu/tháng: 35% (trừ 14.500.000đ)
 * @param assessableIncome Thu nhập tính thuế
 */
export function calculatePIT5Tiers(assessableIncome: number): number {
  if (assessableIncome <= 0) return 0;
  const income = assessableIncome;

  if (income <= 10_000_000) {
    return income * 0.05;
  } else if (income <= 30_000_000) {
    return income * 0.10 - 500_000;
  } else if (income <= 60_000_000) {
    return income * 0.20 - 3_500_000;
  } else if (income <= 100_000_000) {
    return income * 0.30 - 9_500_000;
  } else {
    return income * 0.35 - 14_500_000;
  }
}

/**
 * Tính thuế TNCN linh hoạt theo mốc ngày áp dụng của Quy Định Doanh Nghiệp (CompanyPolicy)
 * Nếu tháng tính lương >= pit5TiersEffectiveDate (mặc định 2026-01-01) -> Tính Biểu 5 Bậc mới.
 * Nếu tháng tính lương < pit5TiersEffectiveDate (hoặc quy định ép 7 bậc) -> Tính Biểu 7 Bậc cũ.
 */
export function calculatePersonalIncomeTax(
  assessableIncome: number,
  month?: string,
  policy?: CompanyPolicy
): { taxAmount: number; method: 'PROGRESSIVE_5_TIERS' | 'PROGRESSIVE_7_TIERS' } {
  if (assessableIncome <= 0) {
    return { taxAmount: 0, method: 'PROGRESSIVE_5_TIERS' };
  }

  let use5Tiers = true; // Mặc định từ năm 2026 theo Luật 109/2025/QH15

  if (policy) {
    if (policy.pitTableType === 'FORCE_7_TIERS') {
      use5Tiers = false;
    } else if (policy.pitTableType === 'FORCE_5_TIERS') {
      use5Tiers = true;
    } else {
      // AUTO_BY_DATE
      const effectiveMonth = (policy.pit5TiersEffectiveDate || '2026-01-01').substring(0, 7);
      if (month && month < effectiveMonth) {
        use5Tiers = false;
      }
    }
  } else if (month && month < '2026-01') {
    use5Tiers = false;
  }

  if (use5Tiers) {
    return {
      taxAmount: calculatePIT5Tiers(assessableIncome),
      method: 'PROGRESSIVE_5_TIERS',
    };
  } else {
    return {
      taxAmount: calculatePIT7Tiers(assessableIncome),
      method: 'PROGRESSIVE_7_TIERS',
    };
  }
}

/**
 * Tính giá trị định suất bồi dưỡng hiện vật bằng hiện vật (sữa/đường/đồ hộp) theo Thông tư 24/2022/TT-BLĐTBXH
 * Lưu ý: Bồi dưỡng bắt buộc bằng hiện vật, không quy đổi chi trả tiền mặt cùng lương chuyển khoản!
 */
export function calculateToxicInKindAllowance(
  tier: number,
  actualWorkDays: number,
  policy: CompanyPolicy
): number {
  let dailyRate = 0;
  switch (tier) {
    case 1: dailyRate = policy.toxicAllowanceTier1 || 13000; break;
    case 2: dailyRate = policy.toxicAllowanceTier2 || 20000; break;
    case 3: dailyRate = policy.toxicAllowanceTier3 || 26000; break;
    case 4: dailyRate = policy.toxicAllowanceTier4 || 32000; break;
    default: dailyRate = 0;
  }
  return dailyRate * actualWorkDays;
}

export interface PayrollCalculationOptions {
  month: string; // YYYY-MM
  actualWorkDays: number;
  paidLeaveDays?: number;
  holidayDays?: number;
  unpaidDays?: number;
  sickLeaveDaysInsurance?: number; // Số ngày nghỉ ốm do BHXH trả (>14 ngày thì tháng đó không đóng BHXH)
  normalOtHours?: number;
  weekendOtHours?: number;
  holidayOtHours?: number;
  nightHours?: number;
  nightOtHours?: number;
  kpiBonus?: number;
  attendanceBonus?: number;
  salaryAdvance?: number;
  debtDeduction?: number; // Khấu trừ công nợ / bồi hoàn tài sản thanh lý
  unusedLeavePayout?: number; // Thanh toán tiền phép năm chưa nghỉ khi thôi việc
  scenarioTag?: string;
  scenarioLabel?: string;
}

/**
 * Tính toán toàn bộ bảng lương chi tiết & tạo sẵn cấu trúc Bóc Tách Kiểm Tra Ngược (Reverse Audit Trail)
 */
export function calculateEmployeePayroll(
  employee: Employee,
  policy: CompanyPolicy,
  monthOrOptions: string | PayrollCalculationOptions,
  legacyActualWorkDays?: number,
  legacyPaidLeaveDays: number = 0,
  legacyHolidayDays: number = 0,
  legacyNormalOtHours: number = 0,
  legacyWeekendOtHours: number = 0,
  legacyHolidayOtHours: number = 0,
  legacyNightHours: number = 0,
  legacyNightOtHours: number = 0,
  legacyKpiBonus: number = 0,
  legacySalaryAdvance: number = 0
): PayrollRecord {
  // Chuẩn hóa tham số (hỗ trợ cả dạng object options mới và tham số rời cũ)
  const opts: PayrollCalculationOptions = typeof monthOrOptions === 'string'
    ? {
        month: monthOrOptions,
        actualWorkDays: legacyActualWorkDays ?? policy.standardWorkDaysPerMonth,
        paidLeaveDays: legacyPaidLeaveDays,
        holidayDays: legacyHolidayDays,
        normalOtHours: legacyNormalOtHours,
        weekendOtHours: legacyWeekendOtHours,
        holidayOtHours: legacyHolidayOtHours,
        nightHours: legacyNightHours,
        nightOtHours: legacyNightOtHours,
        kpiBonus: legacyKpiBonus,
        salaryAdvance: legacySalaryAdvance,
      }
    : monthOrOptions;

  const month = opts.month;
  const standardDays = policy.standardWorkDaysPerMonth || 26;
  const actualWorkDays = opts.actualWorkDays;
  const paidLeaveDays = opts.paidLeaveDays || 0;
  const holidayDays = opts.holidayDays || 0;
  const totalPaidDays = actualWorkDays + paidLeaveDays + holidayDays;
  
  const normalOtHours = opts.normalOtHours || 0;
  const weekendOtHours = opts.weekendOtHours || 0;
  const holidayOtHours = opts.holidayOtHours || 0;
  const nightHours = opts.nightHours || 0;
  const nightOtHours = opts.nightOtHours || 0;
  const kpiBonus = opts.kpiBonus || 0;
  const salaryAdvance = opts.salaryAdvance || 0;
  const debtDeduction = opts.debtDeduction || 0;
  const unusedLeavePayout = opts.unusedLeavePayout || 0;
  const sickLeaveDays = opts.sickLeaveDaysInsurance || 0;

  const legalNotes: string[] = [];

  // ========================================================
  // 1. TRƯỜNG HỢP CỘNG TÁC VIÊN HỢP ĐỒNG DỊCH VỤ DÂN SỰ (CIVIL SERVICE)
  // ========================================================
  if (employee.isCivilContractor || employee.contractType === 'CIVIL_SERVICE') {
    const grossCashIncome = employee.baseSalary + employee.positionSalary + kpiBonus;
    // Khấu trừ 10% tại nguồn từ 2 triệu đồng trở lên (Điểm i Khoản 1 Điều 25 TT 111/2013/TT-BTC)
    const tax = grossCashIncome >= 2_000_000 ? Math.round(grossCashIncome * 0.10) : 0;
    const netSalary = grossCashIncome - tax - salaryAdvance - debtDeduction;

    legalNotes.push('Hợp đồng dịch vụ dân sự (Bộ luật Dân sự 2015), không có quan hệ lao động.');
    legalNotes.push('Không thuộc đối tượng tham gia BHXH bắt buộc và Công đoàn.');
    legalNotes.push('Khấu trừ thuế TNCN 10% tại nguồn đối với thu nhập từ 2.000.000 đ/lần chi trả (TT 111/2013/TT-BTC).');

    return {
      id: `PAY-${employee.id}-${month}`,
      tenantId: employee.tenantId,
      month,
      employeeId: employee.id,
      employeeCode: employee.code,
      employeeName: employee.fullName,
      departmentName: employee.departmentName,
      position: employee.position,
      bankAccount: employee.bankAccountNumber,
      bankName: employee.bankName,
      standardDays,
      actualWorkDays,
      paidLeaveDays: 0,
      holidayDays: 0,
      totalPaidDays: actualWorkDays,
      baseSalary: employee.baseSalary,
      actualBaseSalary: employee.baseSalary,
      positionSalary: employee.positionSalary,
      lunchAllowance: 0,
      transportAllowance: 0,
      phoneAllowance: 0,
      toxicInKindCashValue: 0,
      nonCashInKindValue: 0,
      normalOtPay: 0,
      weekendOtPay: 0,
      holidayOtPay: 0,
      nightPay: 0,
      nightOtPay: 0,
      totalOtPay: 0,
      taxFreeOtDifference: 0,
      kpiBonus,
      attendanceBonus: 0,
      totalGrossIncome: grossCashIncome,
      bhxhEmp: 0,
      bhytEmp: 0,
      bhtnEmp: 0,
      unionEmp: 0,
      totalInsuranceEmp: 0,
      bhxhComp: 0,
      bhytComp: 0,
      bhtnComp: 0,
      unionComp: 0,
      totalLaborCostComp: grossCashIncome,
      taxableIncome: grossCashIncome,
      personalDeduction: 0,
      dependentDeduction: 0,
      assessableIncome: grossCashIncome,
      personalIncomeTax: tax,
      taxMethod: 'FLAT_10_PERCENT',
      salaryAdvance,
      debtDeduction,
      unusedLeavePayout: 0,
      otherDeductions: debtDeduction,
      netSalary,
      scenarioTag: opts.scenarioTag || 'CIVIL_SERVICE_10PCT',
      scenarioLabel: opts.scenarioLabel || 'Cộng tác viên Hợp đồng dịch vụ dân sự (Khấu trừ 10% thuế, không BHXH)',
      reverseAuditTrail: {
        step1NetBankTransfer: netSalary,
        step2TotalGrossCash: grossCashIncome,
        step3DeductionsSum: tax + salaryAdvance + debtDeduction,
        step4NonCashExcluded: 0,
        step5DifferenceCheck: grossCashIncome - (tax + salaryAdvance + debtDeduction) - netSalary,
        legalNotes,
      },
      status: 'APPROVED',
    };
  }

  // ========================================================
  // 2. NHÂN VIÊN THỬ VIỆC HOẶC CHÍNH THỨC
  // ========================================================
  const isProbation = employee.contractType === 'PROBATION' || employee.status === 'PROBATION';
  const probationRate = employee.probationRate || 0.85; // Mặc định 85% theo Điều 26 BLLĐ 2019
  const effectiveBaseSalary = isProbation ? Math.round(employee.baseSalary * probationRate) : employee.baseSalary;

  if (isProbation) {
    legalNotes.push(`Hợp đồng thử việc: Hưởng ${Math.round(probationRate * 100)}% lương chính thức theo Điều 26 Bộ luật Lao động 2019.`);
    legalNotes.push('Hợp đồng thử việc không thuộc đối tượng tham gia BHXH bắt buộc theo Luật BHXH hiện hành.');
  }

  // Tiền lương cơ bản theo ngày công thực tế
  const actualBaseSalary = Math.round((effectiveBaseSalary / standardDays) * totalPaidDays);
  
  // Tiền lương giờ tiêu chuẩn (dùng để tính OT & làm đêm)
  const hourlyRate = (effectiveBaseSalary / standardDays) / 8;

  // Tiền làm thêm giờ (OT) chuẩn BLLĐ 2019
  const normalOtPay = Math.round(normalOtHours * hourlyRate * (policy.otDayNormalRate || 1.5));
  const weekendOtPay = Math.round(weekendOtHours * hourlyRate * (policy.otDayWeekendRate || 2.0));
  const holidayOtPay = Math.round(holidayOtHours * hourlyRate * (policy.otDayHolidayRate || 3.0));
  const nightPay = Math.round(nightHours * hourlyRate * (policy.nightWorkBonusRate || 0.3));
  const nightOtPay = Math.round(nightOtHours * hourlyRate * (policy.otNightNormalRate || 2.1));
  const totalOtPay = normalOtPay + weekendOtPay + holidayOtPay + nightPay + nightOtPay;

  // Phần chênh lệch lương OT cao hơn mức làm ban ngày được MIỄN THUẾ TNCN (Khoản 9 Điều 9 TT 111/2013/TT-BTC)
  const baseOtHoursValue = (normalOtHours + weekendOtHours + holidayOtHours + nightOtHours) * hourlyRate;
  const taxFreeOtDifference = Math.max(0, Math.round(totalOtPay - baseOtHoursValue));
  if (taxFreeOtDifference > 0) {
    legalNotes.push(`Tiền OT được miễn thuế TNCN phần chênh lệch cao hơn ban ngày: ${taxFreeOtDifference.toLocaleString('vi-VN')} đ (Khoản 9 Điều 9 TT 111/2013/TT-BTC).`);
  }

  // Bồi dưỡng độc hại bằng hiện vật (sữa/đường TT 24/2022)
  // ĐẶC BIỆT: Đây là hiện vật cấp phát trực tiếp, KHÔNG cộng tiền vào tài khoản chuyển khoản ngân hàng!
  const toxicInKindCashValue = calculateToxicInKindAllowance(employee.toxicTier, actualWorkDays, policy);
  if (toxicInKindCashValue > 0) {
    legalNotes.push(`Bồi dưỡng độc hại bằng hiện vật (sữa/đường) định suất ${toxicInKindCashValue.toLocaleString('vi-VN')} đ (TT 24/2022/TT-BLĐTBXH). Cấp phát bằng hiện vật, KHÔNG chi trả tiền mặt cùng tài khoản ngân hàng.`);
  }

  // Quà tặng hiện vật phi tiền mặt (Non-cash gift)
  const nonCashGift = employee.nonCashGiftValue || 0;
  if (nonCashGift > 0) {
    legalNotes.push(`Quà tặng hiện vật phi tiền mặt ${nonCashGift.toLocaleString('vi-VN')} đ: ghi nhận tính thuế TNCN nhưng không cộng tiền mặt chuyển khoản.`);
  }

  const nonCashInKindValue = toxicInKindCashValue + nonCashGift;

  // Kiểm tra trường hợp nghỉ thai sản hoặc tạm hoãn HĐLĐ không hưởng lương
  const isMaternity = employee.status === 'MATERNITY' || opts.scenarioTag === 'MATERNITY_LEAVE';
  const isSuspendedOrZeroWork = totalPaidDays === 0 || employee.status === 'SUSPENDED';

  // Thưởng chuyên cần (làm đủ công chuẩn và không đi muộn quá nhiều)
  const attendanceBonus = opts.attendanceBonus !== undefined 
    ? opts.attendanceBonus 
    : (!isSuspendedOrZeroWork && actualWorkDays >= standardDays ? 500_000 : 0);

  // Phụ cấp theo ngày công thực tế (nếu không đi làm thì phụ cấp = 0đ)
  const effectivePositionSalary = isSuspendedOrZeroWork ? 0 : employee.positionSalary;
  const effectiveLunch = isSuspendedOrZeroWork ? 0 : Math.round((employee.lunchAllowance / standardDays) * actualWorkDays);
  const effectiveTransport = isSuspendedOrZeroWork ? 0 : Math.round((employee.transportAllowance / standardDays) * totalPaidDays);
  const effectivePhone = isSuspendedOrZeroWork ? 0 : employee.phoneAllowance;

  if (isMaternity) {
    legalNotes.push('Nghỉ việc hưởng chế độ thai sản theo Luật BHXH 2014 & Luật BHXH 2024: Tiền lương doanh nghiệp chi trả = 0 đ.');
    legalNotes.push('Cơ quan BHXH chi trả trực tiếp 100% bình quân tiền lương đóng BHXH 6 tháng liền kề + 2 tháng lương cơ sở trợ cấp 1 lần.');
    legalNotes.push('Cả NLĐ và người sử dụng lao động được MIỄN ĐÓNG BHXH, BHTN; quỹ BHXH tự động đóng BHYT cho NLĐ theo Điều 39 & Điều 85 Luật BHXH.');
    legalNotes.push('Trợ cấp thai sản do quỹ BHXH chi trả thuộc diện MIỄN THUẾ THU NHẬP CÁ NHÂN theo Thông tư 111/2013/TT-BTC.');
  }

  // Tổng thu nhập bằng TIỀN MẶT (Gross Cash Income - tiền chi trả thực tế trước thuế & bảo hiểm)
  const totalGrossCashIncome = 
    actualBaseSalary + 
    effectivePositionSalary + 
    effectiveLunch + 
    effectiveTransport + 
    effectivePhone + 
    totalOtPay + 
    kpiBonus + 
    attendanceBonus + 
    unusedLeavePayout;

  // Tổng thu nhập toàn diện (bao gồm cả giá trị hiện vật để tính chi phí DN và thuế)
  const totalGrossIncome = totalGrossCashIncome + nonCashInKindValue;

  // ========================================================
  // 3. TRÍCH NỘP BẢO HIỂM BẮT BUỘC & CÔNG ĐOÀN
  // ========================================================
  let bhxhEmp = 0;
  let bhytEmp = 0;
  let bhtnEmp = 0;
  let unionEmp = 0;
  let bhxhComp = 0;
  let bhytComp = 0;
  let bhtnComp = 0;
  let unionComp = 0;

  // Điều kiện tham gia BHXH bắt buộc:
  // - Không phải là thử việc (HĐ thử việc riêng không đóng BHXH)
  // - Không phải nghỉ ốm đau/thai sản từ 14 ngày làm việc trở lên trong tháng (Điều 85 Luật BHXH)
  // - Không phải là lao động đang tạm hoãn/thai sản
  const isExemptFromInsurance = isProbation || sickLeaveDays >= 14 || isMaternity || isSuspendedOrZeroWork;

  if (sickLeaveDays >= 14 && !isMaternity) {
    legalNotes.push(`Nghỉ ốm hưởng trợ cấp BHXH ${sickLeaveDays} ngày (>= 14 ngày): Tháng này cả NLĐ và DN không phải đóng BHXH, BHYT, BHTN theo Khoản 3 Điều 85 Luật BHXH.`);
  }

  if (!isExemptFromInsurance) {
    // Trần đóng BHXH/BHYT: 20 lần mức lương cơ sở (2.340.000 * 20 = 46.800.000 VNĐ)
    const bhxhCap = 46_800_000;
    // Trần đóng BHTN: 20 lần lương tối thiểu vùng I (5.310.000 * 20 = 106.200.000 VNĐ theo NĐ 293/2025)
    const bhtnCap = 106_200_000;

    const insurableSalaryBhxh = Math.min(employee.baseSalary, bhxhCap);
    const insurableSalaryBhtn = Math.min(employee.baseSalary, bhtnCap);

    if (employee.baseSalary > bhxhCap) {
      legalNotes.push(`Lương cơ bản (${employee.baseSalary.toLocaleString('vi-VN')} đ) vượt mức trần đóng BHXH/BHYT 20 lần LTTCS (46.800.000 đ), chỉ trích nộp trên mức trần tối đa.`);
    }

    bhxhEmp = Math.round(insurableSalaryBhxh * (policy.bhxhEmpRate || 0.08));
    bhytEmp = Math.round(insurableSalaryBhxh * (policy.bhytEmpRate || 0.015));
    bhtnEmp = Math.round(insurableSalaryBhtn * (policy.bhtnEmpRate || 0.01));
    // Đoàn phí: 1% lương đóng BHXH, tối đa bằng 10% mức lương cơ sở (234.000 đ)
    const unionCap = 234_000;
    unionEmp = Math.min(unionCap, Math.round(insurableSalaryBhxh * (policy.unionMemberRate || 0.01)));

    bhxhComp = Math.round(insurableSalaryBhxh * (policy.bhxhCompRate || 0.175));
    bhytComp = Math.round(insurableSalaryBhxh * (policy.bhytCompRate || 0.03));
    bhtnComp = Math.round(insurableSalaryBhtn * (policy.bhtnCompRate || 0.01));
    unionComp = Math.round(insurableSalaryBhxh * (policy.unionCompanyRate || 0.02));
  }

  const totalInsuranceEmp = bhxhEmp + bhytEmp + bhtnEmp;
  const totalLaborCostComp = totalGrossIncome + bhxhComp + bhytComp + bhtnComp + unionComp;

  // ========================================================
  // 4. THUẾ THU NHẬP CÁ NHÂN (TNCN)
  // ========================================================
  // Thu nhập miễn thuế: Phụ cấp ăn trưa + Hiện vật độc hại + Phần chênh lệch OT
  const taxExemptAllowances = employee.lunchAllowance + toxicInKindCashValue + taxFreeOtDifference;
  const taxableIncome = Math.max(0, totalGrossIncome - taxExemptAllowances);

  let personalIncomeTax = 0;
  let personalDeduction = 0;
  let dependentDeduction = 0;
  let assessableIncome = 0;
  let taxMethod: 'PROGRESSIVE_7_TIERS' | 'FLAT_10_PERCENT' | 'FLAT_20_NON_RESIDENT' = 'PROGRESSIVE_7_TIERS';

  if (employee.isNonResident) {
    // A. Cá nhân không cư trú: Thuế cố định 20% trên toàn bộ thu nhập chịu thuế, không giảm trừ gia cảnh
    personalIncomeTax = Math.round(taxableIncome * 0.20);
    assessableIncome = taxableIncome;
    taxMethod = 'FLAT_20_NON_RESIDENT';
    legalNotes.push('Cá nhân không cư trú: Khấu trừ thuế TNCN 20% toàn bộ thu nhập chịu thuế phát sinh tại Việt Nam, không được áp dụng giảm trừ gia cảnh (Điều 17 TT 111/2013/TT-BTC).');
  } else if (isProbation) {
    // B. Nhân viên thử việc: Khấu trừ 10% tại nguồn nếu thu nhập từ 2 triệu đồng trở lên (nếu không làm cam kết mẫu 08)
    taxMethod = 'FLAT_10_PERCENT';
    if (employee.hasTaxCommitment08) {
      personalIncomeTax = 0;
      legalNotes.push('Nhân viên thử việc có cam kết mẫu 08/CK-TNCN ước tính thu nhập chưa đến mức nộp thuế, tạm không khấu trừ 10% tại nguồn (Điều 25 TT 111/2013/TT-BTC).');
    } else {
      personalIncomeTax = taxableIncome >= 2_000_000 ? Math.round(taxableIncome * 0.10) : 0;
      legalNotes.push('Nhân viên thử việc (chưa ký HĐLĐ từ 3 tháng): Khấu trừ thuế TNCN 10% tại nguồn theo Điểm i Khoản 1 Điều 25 TT 111/2013/TT-BTC.');
    }
    assessableIncome = taxableIncome;
  } else {
    // C. Nhân viên chính thức: Biểu lũy tiến từng phần (Tự động 5 bậc từ năm 2026 hoặc 7 bậc giai đoạn trước theo ngày áp dụng)
    const effectiveMonth = (policy.pit5TiersEffectiveDate || '2026-01-01').substring(0, 7);
    const isApplying5Tiers = policy.pitTableType === 'FORCE_5_TIERS' || 
      (policy.pitTableType !== 'FORCE_7_TIERS' && (!month || month >= effectiveMonth));

    // Mức giảm trừ gia cảnh theo biểu
    if (isApplying5Tiers && policy.pit5PersonalDeduction) {
      personalDeduction = policy.pit5PersonalDeduction;
      dependentDeduction = employee.numberOfDependents * (policy.pit5DependentDeduction || 5_500_000);
    } else {
      personalDeduction = policy.personalDeduction || 11_000_000;
      dependentDeduction = employee.numberOfDependents * (policy.dependentDeduction || 4_400_000);
    }

    const totalDeductions = personalDeduction + dependentDeduction + totalInsuranceEmp;
    assessableIncome = Math.max(0, taxableIncome - totalDeductions);
    
    const pitResult = calculatePersonalIncomeTax(assessableIncome, month, policy);
    personalIncomeTax = Math.round(pitResult.taxAmount);
    taxMethod = pitResult.method;

    if (personalIncomeTax > 0) {
      if (pitResult.method === 'PROGRESSIVE_5_TIERS') {
        legalNotes.push(`Thuế TNCN tính theo biểu lũy tiến từng phần 5 BẬC MỚI (Luật Thuế TNCN 109/2025/QH15 hiệu lực từ 2026, TN tính thuế: ${assessableIncome.toLocaleString('vi-VN')} đ).`);
      } else {
        legalNotes.push(`Thuế TNCN tính theo biểu lũy tiến từng phần 7 BẬC CŨ (Giai đoạn trước ngày áp dụng ${policy.pit5TiersEffectiveDate || '2026-01-01'}, TN tính thuế: ${assessableIncome.toLocaleString('vi-VN')} đ).`);
      }
    } else {
      legalNotes.push('Thu nhập tính thuế sau khi trừ gia cảnh và bảo hiểm <= 0, không phát sinh thuế TNCN.');
    }
  }

  // ========================================================
  // 5. THỰC LĨNH CHUYỂN KHOẢN NGÂN HÀNG (NET BANK TRANSFER)
  // ========================================================
  // Net = Tổng thu nhập tiền mặt - Bảo hiểm NLĐ - Đoàn phí - Thuế TNCN - Tạm ứng - Khấu trừ công nợ
  const totalDeductionsFromCash = totalInsuranceEmp + unionEmp + personalIncomeTax + salaryAdvance + debtDeduction;
  const netSalary = Math.max(0, totalGrossCashIncome - totalDeductionsFromCash);

  // Kiểm tra đối chiếu ngược (Difference Check - bắt buộc phải bằng 0)
  const differenceCheck = totalGrossCashIncome - totalDeductionsFromCash - netSalary;

  return {
    id: `PAY-${employee.id}-${month}`,
    tenantId: employee.tenantId,
    month,
    employeeId: employee.id,
    employeeCode: employee.code,
    employeeName: employee.fullName,
    departmentName: employee.departmentName,
    position: employee.position,
    bankAccount: employee.bankAccountNumber,
    bankName: employee.bankName,
    standardDays,
    actualWorkDays,
    paidLeaveDays,
    holidayDays,
    totalPaidDays,
    baseSalary: employee.baseSalary,
    actualBaseSalary,
    positionSalary: employee.positionSalary,
    lunchAllowance: employee.lunchAllowance,
    transportAllowance: employee.transportAllowance,
    phoneAllowance: employee.phoneAllowance,
    toxicInKindCashValue,
    nonCashInKindValue,
    normalOtPay,
    weekendOtPay,
    holidayOtPay,
    nightPay,
    nightOtPay,
    totalOtPay,
    taxFreeOtDifference,
    kpiBonus,
    attendanceBonus,
    totalGrossIncome,
    bhxhEmp,
    bhytEmp,
    bhtnEmp,
    unionEmp,
    totalInsuranceEmp,
    bhxhComp,
    bhytComp,
    bhtnComp,
    unionComp,
    totalLaborCostComp,
    taxableIncome,
    personalDeduction,
    dependentDeduction,
    assessableIncome,
    personalIncomeTax,
    taxMethod,
    salaryAdvance,
    debtDeduction,
    unusedLeavePayout,
    otherDeductions: debtDeduction,
    netSalary,
    scenarioTag: opts.scenarioTag,
    scenarioLabel: opts.scenarioLabel,
    overtimeHoursDetails: {
      normalOtHours,
      weekendOtHours,
      holidayOtHours,
      nightHours,
      nightOtHours,
    },
    reverseAuditTrail: {
      step1NetBankTransfer: netSalary,
      step2TotalGrossCash: totalGrossCashIncome,
      step3DeductionsSum: totalDeductionsFromCash,
      step4NonCashExcluded: nonCashInKindValue,
      step5DifferenceCheck: differenceCheck,
      legalNotes,
    },
    status: 'APPROVED',
  };
}
