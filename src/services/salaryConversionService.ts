/**
 * SALARY CONVERSION SERVICE (NET ⇄ GROSS) - CHUẨN QUỐC TẾ & LUẬT PHÁP VIỆT NAM
 * Căn cứ pháp lý:
 * 1. Luật Thuế TNCN & Thông tư 111/2013/TT-BTC, Thông tư 92/2015/TT-BTC (Phụ lục 02/PL-TNCN).
 * 2. Nghị quyết 954/2020/UBTVQH14: Mức giảm trừ gia cảnh (Bản thân: 11 triệu, NPT: 4.4 triệu).
 * 3. Nghị định 73/2024/NĐ-CP: Lương cơ sở 2.340.000đ (Trần BHXH, BHYT = 46.800.000đ).
 * 4. Nghị định 74/2024/NĐ-CP: Mức lương tối thiểu vùng (Vùng 1: 4.960.000đ -> Trần BHTN = 99.200.000đ).
 * 5. Nghị định 143/2018/NĐ-CP: Bảo hiểm bắt buộc đối với Người lao động nước ngoài (Không đóng BHTN).
 * 6. Điểm đ.1 Khoản 2 Điều 2 TT 111/2013/TT-BTC: Tiền nhà trả hộ tính vào TNCT không vượt quá 15% tổng TNCT chưa gồm tiền nhà.
 */

export type NationalityType = 'VIETNAMESE' | 'EXPAT_RESIDENT' | 'EXPAT_NON_RESIDENT';
export type InsuranceSalaryBasisType = 'FULL_GROSS' | 'CUSTOM_AMOUNT' | 'NO_INSURANCE';
export type RegionType = 'REGION_1' | 'REGION_2' | 'REGION_3' | 'REGION_4';

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  defaultRateToVND: number; // 1 Ngoại tệ = ? VND
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'VND', name: 'Việt Nam Đồng', symbol: '₫', defaultRateToVND: 1 },
  { code: 'USD', name: 'Đô La Mỹ (USD)', symbol: '$', defaultRateToVND: 25780 }, // Tỷ giá Vietcombank mua chuyển khoản
  { code: 'EUR', name: 'Đồng Euro (EUR)', symbol: '€', defaultRateToVND: 27850 },
  { code: 'JPY', name: 'Yên Nhật (JPY)', symbol: '¥', defaultRateToVND: 172.5 },
  { code: 'KRW', name: 'Won Hàn Quốc (KRW)', symbol: '₩', defaultRateToVND: 18.8 },
  { code: 'SGD', name: 'Đô La Singapore (SGD)', symbol: 'S$', defaultRateToVND: 19400 },
  { code: 'GBP', name: 'Bảng Anh (GBP)', symbol: '£', defaultRateToVND: 32800 },
  { code: 'CNY', name: 'Nhân Dân Tệ (CNY)', symbol: '¥', defaultRateToVND: 3550 },
  { code: 'AUD', name: 'Đô La Úc (AUD)', symbol: 'A$', defaultRateToVND: 16800 },
];

// CHUẨN MỚI: Nghị định 293/2025/NĐ-CP (Áp dụng từ 2026)
export const REGIONAL_MINIMUM_SALARIES_NEW: Record<RegionType, { name: string; amount: number; maxUnemploymentCap: number }> = {
  REGION_1: { name: 'Vùng I: 5.310.000₫ (Hà Nội, TP.HCM, Bình Dương...)', amount: 5310000, maxUnemploymentCap: 5310000 * 20 },
  REGION_2: { name: 'Vùng II: 4.730.000₫ (Đà Nẵng, Cần Thơ, Hải Phòng...)', amount: 4730000, maxUnemploymentCap: 4730000 * 20 },
  REGION_3: { name: 'Vùng III: 4.140.000₫ (Các TP/Thị xã trực thuộc tỉnh)', amount: 4140000, maxUnemploymentCap: 4140000 * 20 },
  REGION_4: { name: 'Vùng IV: 3.700.000₫ (Các vùng sâu, vùng xa còn lại)', amount: 3700000, maxUnemploymentCap: 3700000 * 20 },
};

// MỐC CŨ: Nghị định 74/2024/NĐ-CP
export const REGIONAL_MINIMUM_SALARIES_OLD: Record<RegionType, { name: string; amount: number; maxUnemploymentCap: number }> = {
  REGION_1: { name: 'Vùng I: 4.960.000₫ (Hà Nội, TP.HCM, Bình Dương...)', amount: 4960000, maxUnemploymentCap: 4960000 * 20 },
  REGION_2: { name: 'Vùng II: 4.410.000₫ (Đà Nẵng, Cần Thơ, Hải Phòng...)', amount: 4410000, maxUnemploymentCap: 4410000 * 20 },
  REGION_3: { name: 'Vùng III: 3.860.000₫ (Các TP/Thị xã trực thuộc tỉnh)', amount: 3860000, maxUnemploymentCap: 3860000 * 20 },
  REGION_4: { name: 'Vùng IV: 3.450.000₫ (Các vùng sâu, vùng xa còn lại)', amount: 3450000, maxUnemploymentCap: 3450000 * 20 },
};

// Mặc định alias theo mốc mới
export const REGIONAL_MINIMUM_SALARIES = REGIONAL_MINIMUM_SALARIES_NEW;

export const BASE_SALARY = 2340000; // Lương cơ sở
export const MAX_SI_HI_CAP = BASE_SALARY * 20; // 46.800.000đ (Trần BHXH, BHYT)

// CHUẨN MỚI THUẾ TNCN ÁP DỤNG HIỆN HÀNH
export const PERSONAL_DEDUCTION = 15500000; // 15.5 triệu / tháng (186 triệu / năm)
export const DEPENDENT_DEDUCTION = 6200000; // 6.2 triệu / người phụ thuộc / tháng
export const MEAL_ALLOWANCE_CAP = 1200000; // 1.2 triệu / tháng miễn thuế ăn trưa, ăn ca theo quy định mới
export const UNIFORM_ALLOWANCE_ANNUAL_CAP = 5000000; // 5 triệu / năm (~416.666đ/tháng) nếu chi tiền mặt

// THAM CHIẾU MỐC CŨ (NẾU CẦN ĐỐI CHIẾU)
export const OLD_PERSONAL_DEDUCTION = 11000000;
export const OLD_DEPENDENT_DEDUCTION = 4400000;

export interface TaxBracketDetail {
  bracket: number;
  taxRatePercent: number;
  taxableIncomeInBracket: number;
  taxAmountInBracket: number;
  description: string;
}

export interface SalaryCalculationInput {
  conversionType: 'NET_TO_GROSS' | 'GROSS_TO_NET';
  targetAmount: number; // Mức lương nhập vào (theo ngoại tệ được chọn)
  currencyCode: string;
  customExchangeRate?: number; // Tỷ giá VND tự chỉnh
  nationality: NationalityType;
  dependentsCount: number; // Số người phụ thuộc
  companyPaidHousing: number; // Tiền nhà công ty trả hộ (theo ngoại tệ)
  insuranceBasis: InsuranceSalaryBasisType;
  customInsuranceAmount?: number; // Mức lương đóng BH nếu chọn CUSTOM_AMOUNT (theo ngoại tệ)
  region: RegionType;
  useNewTaxDeduction?: boolean; // Tùy chọn dùng mức giảm trừ mới 15.5tr/6.2tr (mặc định true)
  useNewRegionalWage?: boolean; // Tùy chọn dùng mức lương tối thiểu vùng mới NĐ 293/2025 (mặc định true)
  
  // Các khoản phụ cấp miễn thuế TNCN (Non-taxable allowances)
  nonTaxableAllowances: {
    lunchAllowance: number; // Ăn trưa (tối đa 1.2tr miễn thuế)
    phoneAllowance: number; // Điện thoại công tác
    uniformAllowance: number; // Trang phục (tối đa 5tr/năm ~ 416.666đ/tháng nếu bằng tiền)
    expatFlightTicket: number; // Vé máy bay về nước 1 lần/năm cho expat (quy ra tháng)
    expatChildTuition: number; // Học phí phổ thông cho con expat tại VN
    otherNonTaxable: number; // Khác
  };
}

export interface SalaryCalculationResult {
  input: SalaryCalculationInput;
  exchangeRate: number; // Tỷ giá áp dụng
  
  // Kết quả bằng VND
  grossSalaryVND: number;
  netSalaryVND: number;
  
  // Chi tiết Bảo Hiểm Người Lao Động
  employeeSocialInsuranceVND: number; // 8%
  employeeHealthInsuranceVND: number; // 1.5%
  employeeUnemploymentInsuranceVND: number; // 1% (0% nếu Expat)
  employeeTotalInsuranceVND: number; // 10.5% hoặc 9.5%
  
  // Tiền nhà theo quy định 15%
  housingActualVND: number;
  housingTaxableCap15VND: number; // 15% thu nhập chịu thuế chưa gồm tiền nhà
  housingTaxableVND: number; // Số thực tế tính vào thuế = min(Thực tế, 15% TNCT)
  housingExemptVND: number; // Phần tiền nhà vượt 15% được miễn thuế TNCN
  
  // Thuế TNCN
  totalIncomeBeforeTaxVND: number; // Tổng thu nhập trước thuế
  nonTaxableAllowancesTotalVND: number; // Tổng các khoản phụ cấp miễn thuế
  taxableIncomeExclHousingVND: number; // TNCT chưa gồm tiền nhà
  totalTaxableIncomeVND: number; // Tổng thu nhập chịu thuế (đã gồm tiền nhà chịu thuế)
  totalPersonalDeductionVND: number; // Giảm trừ gia cảnh (bản thân + NPT)
  assessableIncomeVND: number; // Thu nhập tính thuế (TNTT = TNCT - Giảm trừ - BH)
  personalIncomeTaxVND: number; // Thuế TNCN phải nộp
  taxBracketsBreakdown: TaxBracketDetail[]; // Chi tiết 7 bậc thuế
  
  // Chi phí Người Sử Dụng Lao Động (Doanh Nghiệp)
  employerSocialInsuranceVND: number; // 17.5%
  employerHealthInsuranceVND: number; // 3%
  employerUnemploymentInsuranceVND: number; // 1% (0% nếu Expat)
  employerTradeUnionFeeVND: number; // 2% Kinh phí công đoàn
  employerTotalInsuranceVND: number; // 21.5% (VN) hoặc 20.5% (Expat) + 2%
  companyPaidHousingTotalVND: number; // Tiền nhà thực tế DN chi trả
  
  // Con số đắt giá nhất cho Sếp và Tuyển Dụng:
  totalEmployerCostVND: number; // TỔNG CHI PHÍ DOANH NGHIỆP PHẢI TRẢ (Employer Cost)
  
  // Kết quả tương ứng bằng Ngoại tệ đã chọn
  foreignCurrency: {
    code: string;
    symbol: string;
    grossSalary: number;
    netSalary: number;
    personalIncomeTax: number;
    employeeTotalInsurance: number;
    employerTotalCost: number;
  };
}

/**
 * Hàm tính thuế TNCN theo Biểu thuế lũy tiến từng phần (Thông tư 111/2013/TT-BTC)
 */
export function calculateProgressiveTax(assessableIncome: number): { tax: number; breakdown: TaxBracketDetail[] } {
  if (assessableIncome <= 0) {
    return { tax: 0, breakdown: [] };
  }

  const brackets = [
    { limit: 5000000, rate: 0.05, desc: 'Bậc 1: Đến 5 triệu đồng (5%)' },
    { limit: 10000000, rate: 0.10, desc: 'Bậc 2: Trên 5 đến 10 triệu đồng (10%)' },
    { limit: 18000000, rate: 0.15, desc: 'Bậc 3: Trên 10 đến 18 triệu đồng (15%)' },
    { limit: 32000000, rate: 0.20, desc: 'Bậc 4: Trên 18 đến 32 triệu đồng (20%)' },
    { limit: 52000000, rate: 0.25, desc: 'Bậc 5: Trên 32 đến 52 triệu đồng (25%)' },
    { limit: 80000000, rate: 0.30, desc: 'Bậc 6: Trên 52 đến 80 triệu đồng (30%)' },
    { limit: Infinity, rate: 0.35, desc: 'Bậc 7: Trên 80 triệu đồng (35%)' },
  ];

  let remaining = assessableIncome;
  let previousLimit = 0;
  let totalTax = 0;
  const breakdown: TaxBracketDetail[] = [];

  for (let i = 0; i < brackets.length; i++) {
    const { limit, rate, desc } = brackets[i];
    const bracketSpan = limit - previousLimit;
    const taxableInThisBracket = Math.min(Math.max(0, remaining), bracketSpan);

    if (taxableInThisBracket > 0) {
      const taxInBracket = taxableInThisBracket * rate;
      totalTax += taxInBracket;
      breakdown.push({
        bracket: i + 1,
        taxRatePercent: rate * 100,
        taxableIncomeInBracket: Math.round(taxableInThisBracket),
        taxAmountInBracket: Math.round(taxInBracket),
        description: desc,
      });
      remaining -= taxableInThisBracket;
    } else {
      break;
    }
    previousLimit = limit;
  }

  return { tax: Math.round(totalTax), breakdown };
}

/**
 * Phụ lục 02/PL-TNCN (Thông tư 111/2013/TT-BTC)
 * Bảng quy đổi Thu Nhập Không Bao Gồm Thuế (Converted Income) thành Thu Nhập Tính Thuế (Assessable Income)
 */
export function convertNetToAssessableIncome(convertedIncome: number): number {
  if (convertedIncome <= 0) return 0;

  if (convertedIncome <= 4750000) {
    return convertedIncome / 0.95;
  } else if (convertedIncome <= 9250000) {
    return (convertedIncome - 250000) / 0.90;
  } else if (convertedIncome <= 16050000) {
    return (convertedIncome - 750000) / 0.85;
  } else if (convertedIncome <= 27250000) {
    return (convertedIncome - 1650000) / 0.80;
  } else if (convertedIncome <= 42250000) {
    return (convertedIncome - 3250000) / 0.75;
  } else if (convertedIncome <= 61850000) {
    return (convertedIncome - 5850000) / 0.70;
  } else {
    return (convertedIncome - 9850000) / 0.65;
  }
}

/**
 * Tính mức trần và tiền bảo hiểm bắt buộc theo chuẩn quy định
 */
export function calculateInsurance(
  salaryBasisAmount: number,
  nationality: NationalityType,
  region: RegionType,
  insuranceBasis: InsuranceSalaryBasisType,
  customInsuranceAmount: number = 0,
  useNewRegionalWage: boolean = true
) {
  if (insuranceBasis === 'NO_INSURANCE') {
    return {
      empSI: 0, empHI: 0, empUI: 0, empTotal: 0,
      compSI: 0, compHI: 0, compUI: 0, compUnion: 0, compTotal: 0,
      siHiSalaryBasis: 0, uiSalaryBasis: 0
    };
  }

  const baseForCalculation = insuranceBasis === 'CUSTOM_AMOUNT' ? customInsuranceAmount : salaryBasisAmount;
  const regionConfig = useNewRegionalWage !== false ? REGIONAL_MINIMUM_SALARIES_NEW[region] : REGIONAL_MINIMUM_SALARIES_OLD[region];

  // Trần BHXH & BHYT (20 lần lương cơ sở)
  const siHiSalaryBasis = Math.min(baseForCalculation, MAX_SI_HI_CAP);

  // Trần BHTN (20 lần lương tối thiểu vùng)
  const uiSalaryBasis = Math.min(baseForCalculation, regionConfig.maxUnemploymentCap);

  // Tỷ lệ cho Người Lao Động
  const empSIRate = 0.08;
  const empHIRate = 0.015;
  const empUIRate = nationality === 'VIETNAMESE' ? 0.01 : 0; // Expat KHÔNG đóng BHTN

  const empSI = Math.round(siHiSalaryBasis * empSIRate);
  const empHI = Math.round(siHiSalaryBasis * empHIRate);
  const empUI = Math.round(uiSalaryBasis * empUIRate);
  const empTotal = empSI + empHI + empUI;

  // Tỷ lệ cho Người Sử Dụng Lao Động
  const compSIRate = 0.175; // 14% Hưu trí + 3% Ốm đau + 0.5% TNLĐ-BNN
  const compHIRate = 0.03;
  const compUIRate = nationality === 'VIETNAMESE' ? 0.01 : 0; // Expat DN KHÔNG đóng BHTN
  const compUnionRate = 0.02; // 2% Kinh phí công đoàn trên quỹ lương đóng BH

  const compSI = Math.round(siHiSalaryBasis * compSIRate);
  const compHI = Math.round(siHiSalaryBasis * compHIRate);
  const compUI = Math.round(uiSalaryBasis * compUIRate);
  const compUnion = Math.round(siHiSalaryBasis * compUnionRate);
  const compTotal = compSI + compHI + compUI + compUnion;

  return {
    empSI, empHI, empUI, empTotal,
    compSI, compHI, compUI, compUnion, compTotal,
    siHiSalaryBasis, uiSalaryBasis
  };
}

/**
 * HÀM TỔNG HỢP: QUY ĐỔI LƯƠNG TOÀN DIỆN (GROSS ⇄ NET)
 */
export function calculateSalaryConversion(input: SalaryCalculationInput): SalaryCalculationResult {
  // 1. Xác định tỷ giá
  const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === input.currencyCode) || SUPPORTED_CURRENCIES[0];
  const exchangeRate = (input.customExchangeRate && input.customExchangeRate > 0)
    ? input.customExchangeRate
    : currencyInfo.defaultRateToVND;

  // Quy đổi các khoản đầu vào sang VND
  const targetAmountVND = Math.round(input.targetAmount * exchangeRate);
  const housingActualVND = input.nationality === 'VIETNAMESE' ? 0 : Math.round(input.companyPaidHousing * exchangeRate);
  const customInsuranceAmountVND = input.customInsuranceAmount ? Math.round(input.customInsuranceAmount * exchangeRate) : 0;

  // Phụ cấp miễn thuế hợp lệ theo luật (VND)
  const lunchVND = Math.min(Math.round(input.nonTaxableAllowances.lunchAllowance * exchangeRate), MEAL_ALLOWANCE_CAP); // Trần 1.200.000đ
  const phoneVND = Math.round(input.nonTaxableAllowances.phoneAllowance * exchangeRate);
  const uniformVND = Math.min(Math.round(input.nonTaxableAllowances.uniformAllowance * exchangeRate), UNIFORM_ALLOWANCE_ANNUAL_CAP / 12); // Trần 5tr/năm (~416.666đ/tháng) nếu chi tiền mặt

  // Các khoản chỉ dành riêng cho Expat theo Thông tư 111
  const flightVND = input.nationality !== 'VIETNAMESE' ? Math.round(input.nonTaxableAllowances.expatFlightTicket * exchangeRate) : 0;
  const tuitionVND = input.nationality !== 'VIETNAMESE' ? Math.round(input.nonTaxableAllowances.expatChildTuition * exchangeRate) : 0;
  const otherNonTaxableVND = Math.round(input.nonTaxableAllowances.otherNonTaxable * exchangeRate);

  const nonTaxableAllowancesTotalVND = lunchVND + phoneVND + uniformVND + flightVND + tuitionVND + otherNonTaxableVND;

  // Giảm trừ gia cảnh (Mặc định áp dụng mức mới 15.5tr / 6.2tr)
  const personalRate = input.useNewTaxDeduction === false ? OLD_PERSONAL_DEDUCTION : PERSONAL_DEDUCTION;
  const dependentRate = input.useNewTaxDeduction === false ? OLD_DEPENDENT_DEDUCTION : DEPENDENT_DEDUCTION;

  let personalDeductionVND = 0;
  let dependentDeductionVND = 0;

  if (input.nationality !== 'EXPAT_NON_RESIDENT') {
    personalDeductionVND = personalRate;
    dependentDeductionVND = Math.max(0, input.dependentsCount) * dependentRate;
  }
  const totalPersonalDeductionVND = personalDeductionVND + dependentDeductionVND;

  let grossSalaryVND = 0;
  let netSalaryVND = 0;
  let personalIncomeTaxVND = 0;
  let taxBracketsBreakdown: TaxBracketDetail[] = [];
  let assessableIncomeVND = 0;
  let taxableIncomeExclHousingVND = 0;
  let housingTaxableCap15VND = 0;
  let housingTaxableVND = 0;
  let housingExemptVND = 0;
  const useNewRegionalWage = input.useNewRegionalWage !== false;
  let employeeInsurance = calculateInsurance(0, input.nationality, input.region, input.insuranceBasis, customInsuranceAmountVND, useNewRegionalWage);

  // =========================================================================
  // TRƯỜNG HỢP 1: TÍNH TỪ GROSS ➔ NET
  // =========================================================================
  if (input.conversionType === 'GROSS_TO_NET') {
    grossSalaryVND = targetAmountVND;

    // 1. Tính bảo hiểm NLĐ từ Gross
    employeeInsurance = calculateInsurance(
      grossSalaryVND,
      input.nationality,
      input.region,
      input.insuranceBasis,
      customInsuranceAmountVND,
      useNewRegionalWage
    );

    // 2. Thu nhập chịu thuế (chưa gồm tiền nhà) = Gross - Phụ cấp miễn thuế
    taxableIncomeExclHousingVND = Math.max(0, grossSalaryVND - nonTaxableAllowancesTotalVND);

    // 3. Khống chế tiền nhà 15%
    housingTaxableCap15VND = Math.round(taxableIncomeExclHousingVND * 0.15);
    housingTaxableVND = Math.min(housingActualVND, housingTaxableCap15VND);
    housingExemptVND = Math.max(0, housingActualVND - housingTaxableVND);

    // 4. Tổng thu nhập chịu thuế
    const totalTaxableIncome = taxableIncomeExclHousingVND + housingTaxableVND;

    // 5. Thuế TNCN
    if (input.nationality === 'EXPAT_NON_RESIDENT') {
      // Người nước ngoài không cư trú: Thuế phẳng 20% trên tổng TNCT
      assessableIncomeVND = totalTaxableIncome;
      personalIncomeTaxVND = Math.round(totalTaxableIncome * 0.20);
      taxBracketsBreakdown = [{
        bracket: 1,
        taxRatePercent: 20,
        taxableIncomeInBracket: totalTaxableIncome,
        taxAmountInBracket: personalIncomeTaxVND,
        description: 'Thuế suất phẳng 20% áp dụng cho Cá nhân Không cư trú (Khoản 1 Điều 18 TT 111)',
      }];
    } else {
      // Lũy tiến 7 bậc
      assessableIncomeVND = Math.max(0, totalTaxableIncome - totalPersonalDeductionVND - employeeInsurance.empTotal);
      const taxResult = calculateProgressiveTax(assessableIncomeVND);
      personalIncomeTaxVND = taxResult.tax;
      taxBracketsBreakdown = taxResult.breakdown;
    }

    // 6. Lương NET thực nhận
    netSalaryVND = grossSalaryVND - employeeInsurance.empTotal - personalIncomeTaxVND;
  }

  // =========================================================================
  // TRƯỜNG HỢP 2: TÍNH TỪ NET ➔ GROSS (Thuật toán chính xác 100%)
  // =========================================================================
  else {
    netSalaryVND = targetAmountVND;

    if (input.nationality === 'EXPAT_NON_RESIDENT') {
      let approxGross = netSalaryVND;
      for (let iter = 0; iter < 15; iter++) {
        const x = Math.max(0, approxGross - nonTaxableAllowancesTotalVND);
        const hTax = Math.min(housingActualVND, x * 0.15);
        const tax = (x + hTax) * 0.20;
        const currentNet = approxGross - tax;
        approxGross += (netSalaryVND - currentNet);
      }
      grossSalaryVND = Math.round(approxGross);
      taxableIncomeExclHousingVND = Math.max(0, grossSalaryVND - nonTaxableAllowancesTotalVND);
      housingTaxableCap15VND = Math.round(taxableIncomeExclHousingVND * 0.15);
      housingTaxableVND = Math.min(housingActualVND, housingTaxableCap15VND);
      housingExemptVND = Math.max(0, housingActualVND - housingTaxableVND);
      personalIncomeTaxVND = Math.round((taxableIncomeExclHousingVND + housingTaxableVND) * 0.20);
      assessableIncomeVND = taxableIncomeExclHousingVND + housingTaxableVND;
      taxBracketsBreakdown = [{
        bracket: 1,
        taxRatePercent: 20,
        taxableIncomeInBracket: assessableIncomeVND,
        taxAmountInBracket: personalIncomeTaxVND,
        description: 'Thuế suất phẳng 20% áp dụng cho Cá nhân Không cư trú',
      }];
      employeeInsurance = calculateInsurance(0, input.nationality, input.region, input.insuranceBasis, customInsuranceAmountVND, useNewRegionalWage);
    } else {
      let estimatedGross = netSalaryVND + totalPersonalDeductionVND * 0.1;
      for (let iter = 0; iter < 20; iter++) {
        const currentInsurance = calculateInsurance(
          estimatedGross,
          input.nationality,
          input.region,
          input.insuranceBasis,
          customInsuranceAmountVND,
          useNewRegionalWage
        );

        const currentTaxableExclHousing = Math.max(0, estimatedGross - nonTaxableAllowancesTotalVND);
        const currentCap15 = Math.round(currentTaxableExclHousing * 0.15);
        const currentHTaxable = Math.min(housingActualVND, currentCap15);

        const convertedIncome = Math.max(0, (netSalaryVND + currentHTaxable) - totalPersonalDeductionVND);
        const assessable = convertNetToAssessableIncome(convertedIncome);
        const taxRes = calculateProgressiveTax(assessable);

        const nextGross = netSalaryVND + currentInsurance.empTotal + taxRes.tax;

        if (Math.abs(nextGross - estimatedGross) < 1) {
          estimatedGross = nextGross;
          break;
        }
        estimatedGross = nextGross;
      }

      grossSalaryVND = Math.round(estimatedGross);
      employeeInsurance = calculateInsurance(
        grossSalaryVND,
        input.nationality,
        input.region,
        input.insuranceBasis,
        customInsuranceAmountVND,
        useNewRegionalWage
      );

      taxableIncomeExclHousingVND = Math.max(0, grossSalaryVND - nonTaxableAllowancesTotalVND);
      housingTaxableCap15VND = Math.round(taxableIncomeExclHousingVND * 0.15);
      housingTaxableVND = Math.min(housingActualVND, housingTaxableCap15VND);
      housingExemptVND = Math.max(0, housingActualVND - housingTaxableVND);

      const totalTaxable = taxableIncomeExclHousingVND + housingTaxableVND;
      assessableIncomeVND = Math.max(0, totalTaxable - totalPersonalDeductionVND - employeeInsurance.empTotal);
      const taxResult = calculateProgressiveTax(assessableIncomeVND);
      personalIncomeTaxVND = taxResult.tax;
      taxBracketsBreakdown = taxResult.breakdown;
    }
  }

  const employerCost = employeeInsurance;
  const companyPaidHousingTotalVND = housingActualVND;
  const totalEmployerCostVND = grossSalaryVND + employerCost.compTotal + companyPaidHousingTotalVND;

  return {
    input,
    exchangeRate,
    grossSalaryVND,
    netSalaryVND,

    employeeSocialInsuranceVND: employeeInsurance.empSI,
    employeeHealthInsuranceVND: employeeInsurance.empHI,
    employeeUnemploymentInsuranceVND: employeeInsurance.empUI,
    employeeTotalInsuranceVND: employeeInsurance.empTotal,

    housingActualVND,
    housingTaxableCap15VND,
    housingTaxableVND,
    housingExemptVND,

    totalIncomeBeforeTaxVND: grossSalaryVND + housingActualVND,
    nonTaxableAllowancesTotalVND,
    taxableIncomeExclHousingVND,
    totalTaxableIncomeVND: taxableIncomeExclHousingVND + housingTaxableVND,
    totalPersonalDeductionVND,
    assessableIncomeVND,
    personalIncomeTaxVND,
    taxBracketsBreakdown,

    employerSocialInsuranceVND: employerCost.compSI,
    employerHealthInsuranceVND: employerCost.compHI,
    employerUnemploymentInsuranceVND: employerCost.compUI,
    employerTradeUnionFeeVND: employerCost.compUnion,
    employerTotalInsuranceVND: employerCost.compTotal,
    companyPaidHousingTotalVND,

    totalEmployerCostVND,

    foreignCurrency: {
      code: currencyInfo.code,
      symbol: currencyInfo.symbol,
      grossSalary: Number((grossSalaryVND / exchangeRate).toFixed(2)),
      netSalary: Number((netSalaryVND / exchangeRate).toFixed(2)),
      personalIncomeTax: Number((personalIncomeTaxVND / exchangeRate).toFixed(2)),
      employeeTotalInsurance: Number((employeeInsurance.empTotal / exchangeRate).toFixed(2)),
      employerTotalCost: Number((totalEmployerCostVND / exchangeRate).toFixed(2)),
    }
  };
}

export function formatCurrency(amount: number, currencyCode: string = 'VND'): string {
  if (currencyCode === 'VND') {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
