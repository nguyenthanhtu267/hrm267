import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calculator, 
  DollarSign, 
  Building2, 
  ShieldCheck, 
  Users, 
  Home, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  ArrowRightLeft, 
  Award, 
  Briefcase,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { 
  SUPPORTED_CURRENCIES, 
  REGIONAL_MINIMUM_SALARIES, 
  REGIONAL_MINIMUM_SALARIES_NEW, 
  REGIONAL_MINIMUM_SALARIES_OLD, 
  NationalityType, 
  InsuranceSalaryBasisType, 
  RegionType, 
  SalaryCalculationInput, 
  calculateSalaryConversion, 
  formatCurrency, 
  PERSONAL_DEDUCTION, 
  DEPENDENT_DEDUCTION,
  OLD_PERSONAL_DEDUCTION,
  OLD_DEPENDENT_DEDUCTION
} from '../services/salaryConversionService';
import { JobCandidate } from '../types/hrm';

interface SalaryDealCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: JobCandidate | null;
  onApplyOfferSalary?: (grossSalaryVND: number, candidateId?: string) => void;
}

// Helper: Định dạng số có dấu chấm ngăn cách hàng ngàn (cho VND) hoặc định dạng tiền tệ
const formatDotNumber = (val: string | number, isVND: boolean = true): string => {
  if (val === undefined || val === null || val === '') return '';
  const str = val.toString();
  if (isVND) {
    const digitsOnly = str.replace(/\D/g, '');
    if (!digitsOnly) return '';
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } else {
    // Với ngoại tệ: giữ số và tối đa 1 dấu chấm thập phân
    const cleaned = str.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) {
      return intPart + '.' + parts.slice(1).join('');
    }
    return intPart;
  }
};

// Helper: Parse chuỗi có dấu chấm / phẩy thành số
const parseDotNumber = (val: string, isVND: boolean = true): number => {
  if (!val) return 0;
  if (isVND) {
    const clean = val.replace(/\./g, '').replace(/,/g, '');
    return parseInt(clean, 10) || 0;
  } else {
    const clean = val.replace(/,/g, '');
    return parseFloat(clean) || 0;
  }
};

export const SalaryDealCalculatorModal: React.FC<SalaryDealCalculatorModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onApplyOfferSalary,
}) => {
  // 1. Chiều quy đổi: GROSS_TO_NET hoặc NET_TO_GROSS
  const [conversionType, setConversionType] = useState<'NET_TO_GROSS' | 'GROSS_TO_NET'>('NET_TO_GROSS');

  // 2. Mức lương nhập vào (Mặc định format dấu chấm phân cách)
  const [targetAmountInput, setTargetAmountInput] = useState<string>(() => {
    if (candidate?.expectedSalary) {
      return formatDotNumber(candidate.expectedSalary, true);
    }
    return '30.000.000';
  });

  // 3. Ngoại tệ & Tỷ giá
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('VND');
  const [customExchangeRate, setCustomExchangeRate] = useState<string>('');

  // 4. Đối tượng lao động
  const [nationality, setNationality] = useState<NationalityType>('VIETNAMESE');

  // 5. Số người phụ thuộc & Mức giảm trừ mới (15.5tr/6.2tr)
  const [dependentsCount, setDependentsCount] = useState<number>(0);
  const [useNewTaxDeduction, setUseNewTaxDeduction] = useState<boolean>(true);

  // 6. Tiền nhà công ty trả hộ (Chỉ dùng cho Expat)
  const [companyPaidHousingInput, setCompanyPaidHousingInput] = useState<string>('0');

  // 7. Căn cứ đóng bảo hiểm & Vùng lương
  const [insuranceBasis, setInsuranceBasis] = useState<InsuranceSalaryBasisType>('FULL_GROSS');
  const [customInsuranceInput, setCustomInsuranceInput] = useState<string>('5.310.000');
  const [region, setRegion] = useState<RegionType>('REGION_1');
  const [useNewRegionalWage, setUseNewRegionalWage] = useState<boolean>(true);

  // 8. Các khoản phụ cấp miễn thuế
  const [showAllowancesSection, setShowAllowancesSection] = useState<boolean>(false);
  const [lunchAllowanceInput, setLunchAllowanceInput] = useState<string>('1.200.000');
  const [phoneAllowanceInput, setPhoneAllowanceInput] = useState<string>('0');
  const [uniformAllowanceInput, setUniformAllowanceInput] = useState<string>('0');
  const [expatFlightInput, setExpatFlightInput] = useState<string>('0');
  const [expatTuitionInput, setExpatTuitionInput] = useState<string>('0');
  const [otherNonTaxableInput, setOtherNonTaxableInput] = useState<string>('0');

  // Trạng thái copy
  const [copied, setCopied] = useState<boolean>(false);

  // Tỷ giá hiện hành
  const currencyInfo = useMemo(() => {
    return SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrencyCode) || SUPPORTED_CURRENCIES[0];
  }, [selectedCurrencyCode]);

  const activeExchangeRate = useMemo(() => {
    if (selectedCurrencyCode === 'VND') return 1;
    const num = parseDotNumber(customExchangeRate, true);
    if (!isNaN(num) && num > 0) return num;
    return currencyInfo.defaultRateToVND;
  }, [customExchangeRate, currencyInfo, selectedCurrencyCode]);

  const activeRegionalSalaries = useMemo(() => {
    return useNewRegionalWage ? REGIONAL_MINIMUM_SALARIES_NEW : REGIONAL_MINIMUM_SALARIES_OLD;
  }, [useNewRegionalWage]);

  // Input Object cho Service
  const calculationInput: SalaryCalculationInput = useMemo(() => {
    const isVND = selectedCurrencyCode === 'VND';
    const targetAmount = parseDotNumber(targetAmountInput, isVND);
    
    // Nếu là Người Việt Nam, tự động bỏ qua tiền nhà công ty trả hộ
    const companyPaidHousing = nationality === 'VIETNAMESE' ? 0 : parseDotNumber(companyPaidHousingInput, isVND);
    const customInsuranceAmount = parseDotNumber(customInsuranceInput, true);

    const lunchAllowance = parseDotNumber(lunchAllowanceInput, true);
    const phoneAllowance = parseDotNumber(phoneAllowanceInput, true);
    const uniformAllowance = parseDotNumber(uniformAllowanceInput, true);
    
    // Khoản riêng Expat
    const expatFlightTicket = nationality !== 'VIETNAMESE' ? parseDotNumber(expatFlightInput, true) : 0;
    const expatChildTuition = nationality !== 'VIETNAMESE' ? parseDotNumber(expatTuitionInput, true) : 0;
    const otherNonTaxable = parseDotNumber(otherNonTaxableInput, true);

    return {
      conversionType,
      targetAmount,
      currencyCode: selectedCurrencyCode,
      customExchangeRate: activeExchangeRate,
      nationality,
      dependentsCount,
      companyPaidHousing,
      insuranceBasis,
      customInsuranceAmount,
      region,
      useNewTaxDeduction,
      useNewRegionalWage,
      nonTaxableAllowances: {
        lunchAllowance,
        phoneAllowance,
        uniformAllowance,
        expatFlightTicket,
        expatChildTuition,
        otherNonTaxable,
      },
    };
  }, [
    conversionType,
    targetAmountInput,
    selectedCurrencyCode,
    activeExchangeRate,
    nationality,
    dependentsCount,
    companyPaidHousingInput,
    insuranceBasis,
    customInsuranceInput,
    region,
    useNewTaxDeduction,
    useNewRegionalWage,
    lunchAllowanceInput,
    phoneAllowanceInput,
    uniformAllowanceInput,
    expatFlightInput,
    expatTuitionInput,
    otherNonTaxableInput,
  ]);

  // Kết quả tính toán
  const result = useMemo(() => {
    return calculateSalaryConversion(calculationInput);
  }, [calculationInput]);

  if (!isOpen) return null;

  // Copy tóm tắt deal lương
  const handleCopyDealSummary = () => {
    const text = '=== PHIẾU THỎA THUẬN DEAL LƯƠNG (HRM SOFT) ===\n' +
      'Ứng viên: ' + (candidate?.fullName || 'Ứng viên') + ' (' + (candidate?.positionApplied || 'Vị trí tuyển dụng') + ')\n' +
      'Đối tượng: ' + (nationality === 'VIETNAMESE' ? 'Người Việt Nam' : nationality === 'EXPAT_RESIDENT' ? 'Expat Cư Trú (Khống chế 15% tiền nhà)' : 'Expat Không Cư Trú (Thuế 20%)') + '\n' +
      'Mức giảm trừ gia cảnh: ' + (useNewTaxDeduction ? 'Chuẩn mới 2026 (Bản thân 15.5tr, NPT 6.2tr)' : 'Mốc cũ (Bản thân 11tr, NPT 4.4tr)') + '\n' +
      'Đơn vị tính: ' + selectedCurrencyCode + ' (Tỷ giá VCB: 1 ' + selectedCurrencyCode + ' = ' + new Intl.NumberFormat('vi-VN').format(activeExchangeRate) + ' ₫)\n\n' +
      '1. LƯƠNG GROSS HỢP ĐỒNG: ' + formatCurrency(result.foreignCurrency.grossSalary, selectedCurrencyCode) + ' (' + formatCurrency(result.grossSalaryVND, 'VND') + ')\n' +
      '2. LƯƠNG NET THỰC NHẬN: ' + formatCurrency(result.foreignCurrency.netSalary, selectedCurrencyCode) + ' (' + formatCurrency(result.netSalaryVND, 'VND') + ')\n' +
      '3. BẢO HIỂM NLĐ ĐÓNG: ' + formatCurrency(result.employeeTotalInsuranceVND, 'VND') + '\n' +
      '4. THUẾ TNCN PHẢI NỘP: ' + formatCurrency(result.personalIncomeTaxVND, 'VND') + '\n' +
      (nationality !== 'VIETNAMESE' && result.housingActualVND > 0 ? ('5. TIỀN NHÀ CTY TRẢ HỘ: ' + formatCurrency(result.housingActualVND, 'VND') + ' (Tính vào thuế: ' + formatCurrency(result.housingTaxableVND, 'VND') + ')\n') : '') +
      '--------------------------------------------------\n' +
      '👑 TỔNG CHI PHÍ DOANH NGHIỆP CHI TRẢ/THÁNG: ' + formatCurrency(result.foreignCurrency.employerTotalCost, selectedCurrencyCode) + ' (' + formatCurrency(result.totalEmployerCostVND, 'VND') + ')\n' +
      '(Bao gồm: Lương Gross + Bảo hiểm DN + 2% Công đoàn' + (nationality !== 'VIETNAMESE' && result.housingActualVND > 0 ? ' + Tiền nhà' : '') + ')\n' +
      'Căn cứ: TT 111/2013/TT-BTC, NĐ 143/2018, NĐ 73/2024 & NĐ 293/2025/NĐ-CP';

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // In A4
  const handlePrint = () => {
    window.print();
  };

  // Áp dụng lương offer vào ứng viên
  const handleApplyOffer = () => {
    if (onApplyOfferSalary) {
      onApplyOfferSalary(result.grossSalaryVND, candidate?.id);
    }
    alert('Đã lưu mức lương GROSS ' + formatCurrency(result.grossSalaryVND, 'VND') + ' vào hồ sơ của ứng viên ' + (candidate?.fullName || '') + '!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none">
        
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900 print:bg-none print:text-black print:p-2">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg text-slate-900 font-black">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white print:text-black">
                  Bảng Deal Lương &amp; Dự Toán Chi Phí Quốc Tế (NET ⇄ GROSS)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  Chuẩn Luật 2026
                </span>
              </div>
              <p className="text-xs text-indigo-200 print:text-slate-600">
                {candidate ? (
                  <span>Đang thẩm định deal lương cho ứng viên: <b className="text-amber-300 font-bold">{candidate.fullName}</b> ({candidate.positionApplied})</span>
                ) : (
                  <span>Mô phỏng chuyển đổi lương, khống chế tiền nhà 15% Expat, trần bảo hiểm NĐ 73-74/2024 &amp; NĐ 293/2025</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handleCopyDealSummary}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Copy kết quả tóm tắt"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Đã Copy!' : 'Copy Deal'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
              title="In phiếu thẩm định A4"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In A4</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================== BODY CHÍNH ===================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* THANH ĐIỀU HƯỚNG CHÍNH: CHIỀU QUY ĐỔI & ĐỐI TƯỢNG */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 print:grid-cols-2">
            {/* Chiều quy đổi */}
            <div className="md:col-span-5 bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => setConversionType('NET_TO_GROSS')}
                className={'flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ' + (
                  conversionType === 'NET_TO_GROSS'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Tính NET ➔ GROSS (Deal Lương)</span>
              </button>
              <button
                type="button"
                onClick={() => setConversionType('GROSS_TO_NET')}
                className={'flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ' + (
                  conversionType === 'GROSS_TO_NET'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Tính GROSS ➔ NET</span>
              </button>
            </div>

            {/* Đối tượng lao động */}
            <div className="md:col-span-7 bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200 space-x-1">
              <button
                type="button"
                onClick={() => setNationality('VIETNAMESE')}
                className={'flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ' + (
                  nationality === 'VIETNAMESE'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                🇻🇳 Người Việt Nam (BH 10.5%)
              </button>
              <button
                type="button"
                onClick={() => setNationality('EXPAT_RESIDENT')}
                className={'flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ' + (
                  nationality === 'EXPAT_RESIDENT'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                )}
                title="Expat cư trú tại VN >= 183 ngày: Biểu 7 bậc, BH 9.5%, Khống chế tiền nhà 15%"
              >
                🌐 Expat Cư Trú (Khống chế 15%)
              </button>
              <button
                type="button"
                onClick={() => setNationality('EXPAT_NON_RESIDENT')}
                className={'flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ' + (
                  nationality === 'EXPAT_NON_RESIDENT'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                )}
                title="Expat không cư trú (< 183 ngày): Thuế cố định 20%, không giảm trừ"
              >
                ✈️ Expat Không Cư Trú (20%)
              </button>
            </div>
          </div>

          {/* DÒNG TIÊU CHUẨN THUẾ TNCN & GIẢM TRỪ GIA CẢNH */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-xs font-bold text-indigo-950">
                <span>Chính sách Giảm trừ Gia cảnh: </span>
                <span className="text-indigo-700 font-semibold">
                  {useNewTaxDeduction ? 'Bản thân 15.500.000₫/tháng • Người phụ thuộc 6.200.000₫/tháng' : 'Bản thân 11.000.000₫/tháng • Người phụ thuộc 4.400.000₫/tháng'}
                </span>
              </div>
            </div>
            <div className="inline-flex rounded-xl bg-white p-0.5 border border-indigo-200 shadow-2xs text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setUseNewTaxDeduction(true)}
                className={'px-3 py-1 rounded-lg transition-all cursor-pointer ' + (
                  useNewTaxDeduction
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                ⭐ Chuẩn Mới (15.5tr / 6.2tr)
              </button>
              <button
                type="button"
                onClick={() => setUseNewTaxDeduction(false)}
                className={'px-3 py-1 rounded-lg transition-all cursor-pointer ' + (
                  !useNewTaxDeduction
                    ? 'bg-slate-700 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Mốc Cũ (11tr / 4.4tr)
              </button>
            </div>
          </div>

          {/* ===================== FORM NHẬP LIỆU ===================== */}
          <div className="bg-slate-50/80 rounded-3xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Mức lương đầu vào */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                  <span>
                    {conversionType === 'NET_TO_GROSS' ? 'Lương NET Thực Nhận Mong Muốn' : 'Lương GROSS Đề Xuất (Trước Thuế/BH)'}:
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    ({selectedCurrencyCode})
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={targetAmountInput}
                    onChange={e => {
                      const val = e.target.value;
                      if (selectedCurrencyCode === 'VND') {
                        const digits = val.replace(/\D/g, '');
                        setTargetAmountInput(digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
                      } else {
                        setTargetAmountInput(val.replace(/[^0-9.]/g, ''));
                      }
                    }}
                    placeholder={selectedCurrencyCode === 'VND' ? 'VD: 30.000.000' : 'VD: 2500'}
                    className="w-full py-2.5 px-3.5 pr-12 text-base font-black text-slate-900 bg-white rounded-2xl border-2 border-indigo-200 focus:border-indigo-600 focus:outline-hidden shadow-xs"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
                    {currencyInfo.symbol}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Tương đương: <b className="text-slate-900 font-bold">{formatCurrency(parseDotNumber(targetAmountInput, selectedCurrencyCode === 'VND') * activeExchangeRate, 'VND')}</b>
                </p>
              </div>

              {/* 2. Loại Tiền Tệ & Ngoại tệ */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Loại Tiền Tệ:</span>
                </label>
                <select
                  value={selectedCurrencyCode}
                  onChange={e => {
                    const newCode = e.target.value;
                    setSelectedCurrencyCode(newCode);
                    const curr = SUPPORTED_CURRENCIES.find(c => c.code === newCode);
                    if (curr) {
                      setCustomExchangeRate(curr.code === 'VND' ? '1' : formatDotNumber(curr.defaultRateToVND, true));
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-white text-xs font-bold text-slate-800 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                >
                  {SUPPORTED_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <p className="text-[10.5px] font-semibold text-emerald-700">AI tra cứu tỷ giá VCB: 25.780 ₫ (Mua CK) / 26.160 ₫ (Bán)</p>
              </div>

              {/* 3. Tỷ giá quy đổi sang VND + Link VCB */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1">
                    <span>Tỷ Giá VND:</span>
                  </label>
                  <a
                    href="https://www.vietcombank.com.vn/vi-VN/KHCN/Cong-cu-Tien-ich/Ty-gia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10.5px] text-emerald-600 hover:text-emerald-700 font-bold underline inline-flex items-center gap-0.5"
                    title="Mở cổng tỷ giá ngoại tệ chính thức của Vietcombank"
                  >
                    Tra cứu VCB ↗
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    disabled={selectedCurrencyCode === 'VND'}
                    value={selectedCurrencyCode === 'VND' ? '1' : (customExchangeRate || formatDotNumber(currencyInfo.defaultRateToVND, true))}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setCustomExchangeRate(digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
                    }}
                    placeholder={selectedCurrencyCode === 'USD' ? '25.780' : 'Tỷ giá...'}
                    className="w-full py-2.5 px-3 text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                    đ/{selectedCurrencyCode}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500">
                  {selectedCurrencyCode === 'VND' ? 'Đồng nội tệ cố định' : 'AI tra cứu tỷ giá VCB: 25.780 ₫ (Mua CK) / 26.160 ₫ (Bán)'}
                </p>
              </div>

            </div>

            {/* HÀNG 2: NGƯỜI PHỤ THUỘC, MỨC ĐÓNG BẢO HIỂM, VÙNG LƯƠNG & TIỀN NHÀ (CHỈ EXPAT) */}
            <div className={'grid grid-cols-1 sm:grid-cols-2 ' + (nationality === 'VIETNAMESE' ? 'lg:grid-cols-3' : 'lg:grid-cols-4') + ' gap-4 pt-2 border-t border-slate-200'}>
              
              {/* 4. Số người phụ thuộc */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Người Phụ Thuộc:</span>
                  </span>
                  <span className="text-[10.5px] font-bold text-indigo-600">
                    {nationality === 'EXPAT_NON_RESIDENT' ? 'Không áp dụng' : '-' + (useNewTaxDeduction ? '6.2' : '4.4') + 'tr/người'}
                  </span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    disabled={nationality === 'EXPAT_NON_RESIDENT'}
                    value={nationality === 'EXPAT_NON_RESIDENT' ? 0 : dependentsCount}
                    onChange={e => setDependentsCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full py-2 px-3 text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                  />
                  <div className="flex space-x-1">
                    {[0, 1, 2].map(n => (
                      <button
                        key={n}
                        type="button"
                        disabled={nationality === 'EXPAT_NON_RESIDENT'}
                        onClick={() => setDependentsCount(n)}
                        className={'px-2 py-1.5 text-xs font-bold rounded-xl cursor-pointer ' + (
                          dependentsCount === n && nationality !== 'EXPAT_NON_RESIDENT'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-500">
                  Giảm trừ: {formatCurrency(dependentsCount * (useNewTaxDeduction ? DEPENDENT_DEDUCTION : OLD_DEPENDENT_DEDUCTION), 'VND')}/tháng
                </p>
              </div>

              {/* 5. Tiền nhà công ty trả hộ (CHỈ HIỂN THỊ KHI LÀ EXPAT, ẨN HOÀN TOÀN VỚI NGƯỜI VIỆT NAM) */}
              {nationality !== 'VIETNAMESE' && (
                <div className="space-y-1 animate-in fade-in-50">
                  <label className="text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Home className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tiền Thuê Nhà Trả Hộ:</span>
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                      Khống chế 15%
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyPaidHousingInput}
                      onChange={e => {
                        const val = e.target.value;
                        if (selectedCurrencyCode === 'VND') {
                          const digits = val.replace(/\D/g, '');
                          setCompanyPaidHousingInput(digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
                        } else {
                          setCompanyPaidHousingInput(val.replace(/[^0-9.]/g, ''));
                        }
                      }}
                      placeholder="VD: 15.000.000 hoặc 1000"
                      className="w-full py-2 px-3 text-xs font-bold text-slate-900 bg-white rounded-2xl border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      {selectedCurrencyCode}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    Chỉ tính vào thuế tối đa 15% tổng TNCT Expat
                  </p>
                </div>
              )}

              {/* 6. Căn cứ đóng bảo hiểm & Nhập mức khác tùy ý */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mức Đóng BHXH/BHYT:</span>
                </label>
                <select
                  value={insuranceBasis}
                  onChange={e => setInsuranceBasis(e.target.value as InsuranceSalaryBasisType)}
                  className="w-full py-2 px-3 bg-white text-xs font-bold text-slate-800 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="FULL_GROSS">Đóng trên 100% Gross (Trần 46.8tr)</option>
                  <option value="CUSTOM_AMOUNT">✏️ Nhập mức khác (Tự nhập tay số tiền tham gia)</option>
                  <option value="NO_INSURANCE">Không đóng bảo hiểm (Dịch vụ / CTV / Expat)</option>
                </select>
                {insuranceBasis === 'CUSTOM_AMOUNT' && (
                  <div className="mt-1.5 space-y-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={customInsuranceInput}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setCustomInsuranceInput(digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
                        }}
                        placeholder="VD: 5.310.000"
                        className="w-full py-1.5 px-3 text-xs font-bold text-slate-900 bg-amber-50/90 border border-amber-300 rounded-xl focus:border-amber-600 focus:outline-hidden"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-700">
                        ₫/tháng
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-800 font-medium">
                      * Nhập tay số tiền đóng (Khống chế trần BHXH 46.8tr, BHTN 20 lần LTT Vùng).
                    </p>
                  </div>
                )}
                {insuranceBasis !== 'CUSTOM_AMOUNT' && (
                  <p className="text-[10.5px] text-slate-500">
                    {nationality === 'VIETNAMESE' ? 'NLĐ 10.5% • DN 21.5%' : 'NLĐ 9.5% • DN 20.5% (Không BHTN)'}
                  </p>
                )}
              </div>

              {/* 7. Vùng lương tối thiểu (Cập nhật chuẩn Nghị định 293/2025/NĐ-CP hoặc NĐ 74/2024/NĐ-CP) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Lương Tối Thiểu Vùng:</span>
                  </label>
                  <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setUseNewRegionalWage(true)}
                      className={'px-2 py-0.5 rounded-md transition-all cursor-pointer ' + (
                        useNewRegionalWage
                          ? 'bg-indigo-600 text-white shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                      title="Nghị định 293/2025/NĐ-CP: Vùng 1 là 5.310.000đ"
                    >
                      ⭐ NĐ 293/2025 (Mới)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseNewRegionalWage(false)}
                      className={'px-2 py-0.5 rounded-md transition-all cursor-pointer ' + (
                        !useNewRegionalWage
                          ? 'bg-slate-700 text-white shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                      title="Nghị định 74/2024/NĐ-CP: Vùng 1 là 4.960.000đ"
                    >
                      NĐ 74/2024 (Cũ)
                    </button>
                  </div>
                </div>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value as RegionType)}
                  className="w-full py-2 px-3 bg-white text-xs font-bold text-slate-800 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value="REGION_1">{activeRegionalSalaries.REGION_1.name}</option>
                  <option value="REGION_2">{activeRegionalSalaries.REGION_2.name}</option>
                  <option value="REGION_3">{activeRegionalSalaries.REGION_3.name}</option>
                  <option value="REGION_4">{activeRegionalSalaries.REGION_4.name}</option>
                </select>
                <p className="text-[10.5px] text-slate-500">
                  Trần BHTN (20 lần LTT Vùng): <b className="text-slate-800">{formatCurrency(activeRegionalSalaries[region].maxUnemploymentCap, 'VND')}</b>
                </p>
              </div>

            </div>

            {/* TOGGLE MỞ RỘNG: CÁC KHOẢN PHỤ CẤP MIỄN THUẾ (KHỚP HOÀN TOÀN GIỮA TIÊU ĐỀ VÀ NỘI DUNG) */}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAllowancesSection(!showAllowancesSection)}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1.5 cursor-pointer"
              >
                {showAllowancesSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>
                  {showAllowancesSection
                    ? 'Ẩn các khoản phụ cấp miễn thuế theo Luật'
                    : (nationality === 'VIETNAMESE'
                        ? '+ Thêm Phụ Cấp Miễn Thuế TNCN (Ăn ca trần 1.2tr, Điện thoại, Trang phục trần 5tr/năm)'
                        : '+ Thêm Phụ Cấp Miễn Thuế TNCN & Đãi Ngộ Expat (Ăn trưa, Điện thoại, Trang phục, Vé máy bay, Học phí con Expat)')}
                </span>
              </button>

              {showAllowancesSection && (
                <div className="mt-3 p-3.5 bg-white rounded-2xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in-50">
                  
                  {/* Cơm trưa / Ăn ca */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>Cơm trưa, ăn ca (Mặc định 1.2tr):</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Tự do chỉnh sửa</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={lunchAllowanceInput}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setLunchAllowanceInput(digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
                        }}
                        placeholder="1.200.000"
                        className="w-full py-1.5 px-2.5 text-xs font-bold rounded-xl border border-slate-300 focus:border-indigo-600 focus:outline-hidden"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">₫/tháng</span>
                    </div>
                    {parseDotNumber(lunchAllowanceInput, true) > 1200000 ? (
                      <p className="text-[10px] text-amber-700 font-semibold">
                        * Miễn thuế 1.200.000₫, phần vượt ({formatCurrency(parseDotNumber(lunchAllowanceInput, true) - 1200000, 'VND')}) tính thuế TNCN.
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Mặc định 1.200.000₫/tháng (miễn thuế 100%). Có thể sửa số khác tùy cty.</p>
                    )}
                  </div>

                  {/* Điện thoại công tác */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>Điện thoại công tác:</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Theo quy chế cty</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phoneAllowanceInput}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setPhoneAllowanceInput(digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
                        }}
                        placeholder="0"
                        className="w-full py-1.5 px-2.5 text-xs font-bold rounded-xl border border-slate-300"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">₫</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Khoán chi theo quy chế tài chính</p>
                  </div>

                  {/* Tiền trang phục */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>Trang phục (Trần 5tr/năm):</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">~417k/tháng</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={uniformAllowanceInput}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setUniformAllowanceInput(digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
                        }}
                        placeholder="0"
                        className="w-full py-1.5 px-2.5 text-xs font-bold rounded-xl border border-slate-300"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">₫</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Chi tiền mặt trần 5tr/năm; hiện vật miễn 100%</p>
                  </div>

                  {/* Chỉ hiển thị cho Expat nếu không phải Người Việt Nam */}
                  {nationality !== 'VIETNAMESE' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span>Vé máy bay về nước Expat:</span>
                          <span className="text-[10px] text-indigo-600 font-semibold">Miễn 1 lần/năm</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={expatFlightInput}
                            onChange={e => {
                              const digits = e.target.value.replace(/\D/g, '');
                              setExpatFlightInput(digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
                            }}
                            placeholder="0"
                            className="w-full py-1.5 px-2.5 text-xs font-bold rounded-xl border border-slate-300"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">₫</span>
                        </div>
                        <p className="text-[10px] text-slate-500">1 vé khứ hồi/năm theo TT 111</p>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span>Học phí phổ thông cho con Expat tại VN:</span>
                          <span className="text-[10px] text-indigo-600 font-semibold">Miễn 100% TT111</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={expatTuitionInput}
                            onChange={e => {
                              const digits = e.target.value.replace(/\D/g, '');
                              setExpatTuitionInput(digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
                            }}
                            placeholder="0"
                            className="w-full py-1.5 px-2.5 text-xs font-bold rounded-xl border border-slate-300"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">₫</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Mầm non đến hết Trung học Phổ thông tại Việt Nam</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ===================== KẾT QUẢ ĐẮT GIÁ: THẺ TỔNG HỢP ===================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* THẺ 1: LƯƠNG GROSS */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wide block">
                  1. Lương GROSS Hợp Đồng
                </span>
                <p className="text-2xl font-black text-indigo-950 mt-1">
                  {formatCurrency(result.grossSalaryVND, 'VND')}
                </p>
                {selectedCurrencyCode !== 'VND' && (
                  <p className="text-xs font-extrabold text-indigo-600 mt-0.5">
                    ≈ {formatCurrency(result.foreignCurrency.grossSalary, selectedCurrencyCode)}
                  </p>
                )}
              </div>
              <p className="text-[10.5px] text-indigo-600/90 mt-3 pt-2 border-t border-indigo-100 font-medium">
                Mức lương ghi trong Hợp Đồng Lao Động
              </p>
            </div>

            {/* THẺ 2: LƯƠNG NET THỰC NHẬN */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wide block">
                  2. Lương NET Về Tay Ứng Viên
                </span>
                <p className="text-2xl font-black text-emerald-950 mt-1">
                  {formatCurrency(result.netSalaryVND, 'VND')}
                </p>
                {selectedCurrencyCode !== 'VND' && (
                  <p className="text-xs font-extrabold text-emerald-600 mt-0.5">
                    ≈ {formatCurrency(result.foreignCurrency.netSalary, selectedCurrencyCode)}
                  </p>
                )}
              </div>
              <p className="text-[10.5px] text-emerald-700/90 mt-3 pt-2 border-t border-emerald-100 font-medium">
                Số tiền thực chuyển khoản vào tài khoản ngân hàng
              </p>
            </div>

            {/* THẺ 3: THUẾ TNCN & BẢO HIỂM */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 shadow-xs flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide block">
                  3. Khấu Trừ Thuế &amp; Bảo Hiểm
                </span>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 font-semibold">Thuế TNCN:</span>
                  <b className="text-rose-700 font-bold">{formatCurrency(result.personalIncomeTaxVND, 'VND')}</b>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">BH NLĐ ({nationality === 'VIETNAMESE' ? '10.5%' : '9.5%'}):</span>
                  <b className="text-slate-900 font-bold">{formatCurrency(result.employeeTotalInsuranceVND, 'VND')}</b>
                </div>
              </div>
              <p className="text-[10.5px] text-slate-500 mt-2 pt-2 border-t border-slate-200 font-medium">
                Giảm trừ gia cảnh: {formatCurrency(result.totalPersonalDeductionVND, 'VND')}
              </p>
            </div>

            {/* THẺ 4: TỔNG CHI PHÍ DOANH NGHIỆP CHI TRẢ */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white border-2 border-amber-400/80 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-16 h-16 bg-amber-400/10 rounded-full blur-xs" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider block">
                    👑 Tổng Chi Phí Doanh Nghiệp
                  </span>
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-md">
                    EMPLOYER COST
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1.5 tracking-tight">
                  {formatCurrency(result.totalEmployerCostVND, 'VND')}
                </p>
                {selectedCurrencyCode !== 'VND' && (
                  <p className="text-xs font-black text-amber-200/90 mt-0.5">
                    ≈ {formatCurrency(result.foreignCurrency.employerTotalCost, selectedCurrencyCode)}
                  </p>
                )}
              </div>
              <p className="text-[10.5px] text-slate-300 mt-3 pt-2 border-t border-indigo-800 font-medium leading-tight">
                = Gross + BH DN ({nationality === 'VIETNAMESE' ? '21.5%' : '20.5%'}) + Công đoàn (2%){nationality !== 'VIETNAMESE' && result.companyPaidHousingTotalVND > 0 ? ' + Tiền nhà' : ''}
              </p>
            </div>

          </div>

          {/* ===================== HAI CỘT ĐỐI SOÁT CHI TIẾT ===================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* CỘT A: BẢNG DIỄN GIẢI THUẾ TNCN & QUY ĐỊNH TIỀN NHÀ 15% */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
                  A. Bảng Diễn Giải Thuế TNCN &amp; Giảm Trừ
                </h3>
              </div>

              {/* Hộp giải trình tiền nhà 15% (Chỉ hiển thị với Expat khi có tiền nhà) */}
              {nationality !== 'VIETNAMESE' && result.housingActualVND > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center space-x-1.5">
                      <Home className="w-4 h-4 text-amber-600" />
                      <span>Thẩm định Quy định Khống chế Tiền Nhà 15% (TT 111):</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-amber-200 text-amber-950 rounded-lg">
                      Điểm đ.1 K2 Đ2
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>• Tiền nhà thực tế DN trả hộ:</span>
                      <b className="font-mono text-slate-900">{formatCurrency(result.housingActualVND, 'VND')}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>• Mức trần 15% TNCT (chưa gồm tiền nhà):</span>
                      <b className="font-mono text-slate-900">{formatCurrency(result.housingTaxableCap15VND, 'VND')}</b>
                    </div>
                    <div className="flex justify-between text-amber-950 font-bold pt-1 border-t border-amber-200/80">
                      <span>➔ Tiền nhà TÍNH VÀO THU NHẬP CHỊU THUẾ:</span>
                      <span className="font-mono text-amber-800 font-black">{formatCurrency(result.housingTaxableVND, 'VND')}</span>
                    </div>
                    {result.housingExemptVND > 0 && (
                      <div className="flex justify-between text-emerald-800 text-[11px] font-semibold">
                        <span>✓ Phần tiền nhà vượt 15% được MIỄN THUẾ TNCN:</span>
                        <span className="font-mono font-bold">{formatCurrency(result.housingExemptVND, 'VND')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bảng bậc thuế lũy tiến */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Thu nhập tính thuế (TNTT):</span>
                  <b className="font-mono text-indigo-900 text-sm">{formatCurrency(result.assessableIncomeVND, 'VND')}</b>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Bậc Thuế</th>
                        <th className="p-2">Mức Thu Nhập</th>
                        <th className="p-2 text-center">Thuế Suất</th>
                        <th className="p-2 text-right">Số Thuế</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {result.taxBracketsBreakdown.map(b => (
                        <tr key={b.bracket} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-800">Bậc {b.bracket}</td>
                          <td className="p-2 font-mono text-slate-600">{formatCurrency(b.taxableIncomeInBracket, 'VND')}</td>
                          <td className="p-2 text-center font-bold text-indigo-600">{b.taxRatePercent}%</td>
                          <td className="p-2 text-right font-mono font-bold text-rose-700">
                            {formatCurrency(b.taxAmountInBracket, 'VND')}
                          </td>
                        </tr>
                      ))}
                      {result.taxBracketsBreakdown.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-3 text-center text-slate-400 italic">
                            Chưa phát sinh thuế TNCN (Thu nhập chưa vượt mức giảm trừ gia cảnh).
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                      <tr>
                        <td colSpan={3} className="p-2 text-slate-800 uppercase font-black">
                          Tổng Thuế TNCN Phải Nộp:
                        </td>
                        <td className="p-2 text-right font-mono font-black text-rose-700">
                          {formatCurrency(result.personalIncomeTaxVND, 'VND')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>

            {/* CỘT B: CHI TIẾT BẢO HIỂM VÀ TOÀN BỘ CHI PHÍ DOANH NGHIỆP */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2.5">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
                  B. Đối Soát Toàn Bộ Chi Phí Doanh Nghiệp (Employer Budget)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Khoản Mục</th>
                      <th className="p-2 text-center">Tỷ Lệ NLĐ</th>
                      <th className="p-2 text-right">NLĐ Đóng</th>
                      <th className="p-2 text-center">Tỷ Lệ DN</th>
                      <th className="p-2 text-right">DN Đóng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="p-2 font-semibold text-slate-800">BH Xã Hội (Hưu trí, ốm đau)</td>
                      <td className="p-2 text-center font-bold">8.0%</td>
                      <td className="p-2 text-right font-mono text-slate-700">{formatCurrency(result.employeeSocialInsuranceVND, 'VND')}</td>
                      <td className="p-2 text-center font-bold text-indigo-700">17.5%</td>
                      <td className="p-2 text-right font-mono text-indigo-900 font-bold">{formatCurrency(result.employerSocialInsuranceVND, 'VND')}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-slate-800">BH Y Tế</td>
                      <td className="p-2 text-center font-bold">1.5%</td>
                      <td className="p-2 text-right font-mono text-slate-700">{formatCurrency(result.employeeHealthInsuranceVND, 'VND')}</td>
                      <td className="p-2 text-center font-bold text-indigo-700">3.0%</td>
                      <td className="p-2 text-right font-mono text-indigo-900 font-bold">{formatCurrency(result.employerHealthInsuranceVND, 'VND')}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-slate-800">
                        BH Thất Nghiệp {nationality !== 'VIETNAMESE' && <span className="text-[10px] text-amber-600 block">(Expat miễn đóng)</span>}
                      </td>
                      <td className="p-2 text-center font-bold">{nationality === 'VIETNAMESE' ? '1.0%' : '0%'}</td>
                      <td className="p-2 text-right font-mono text-slate-700">{formatCurrency(result.employeeUnemploymentInsuranceVND, 'VND')}</td>
                      <td className="p-2 text-center font-bold text-indigo-700">{nationality === 'VIETNAMESE' ? '1.0%' : '0%'}</td>
                      <td className="p-2 text-right font-mono text-indigo-900 font-bold">{formatCurrency(result.employerUnemploymentInsuranceVND, 'VND')}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-slate-800">Kinh Phí Công Đoàn</td>
                      <td className="p-2 text-center text-slate-400">-</td>
                      <td className="p-2 text-right text-slate-400 font-mono">0 ₫</td>
                      <td className="p-2 text-center font-bold text-indigo-700">2.0%</td>
                      <td className="p-2 text-right font-mono text-indigo-900 font-bold">{formatCurrency(result.employerTradeUnionFeeVND, 'VND')}</td>
                    </tr>
                    {nationality !== 'VIETNAMESE' && result.companyPaidHousingTotalVND > 0 && (
                      <tr className="bg-amber-50/50">
                        <td className="p-2 font-bold text-amber-900">Tiền Nhà Cty Thuê Hộ</td>
                        <td className="p-2 text-center text-slate-400">-</td>
                        <td className="p-2 text-right text-slate-400 font-mono">0 ₫</td>
                        <td className="p-2 text-center font-bold text-amber-800">100%</td>
                        <td className="p-2 text-right font-mono text-amber-900 font-bold">{formatCurrency(result.companyPaidHousingTotalVND, 'VND')}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-bold text-xs">
                    <tr>
                      <td className="p-2 font-extrabold uppercase text-amber-300">Tổng Cộng Chi Phí</td>
                      <td className="p-2 text-center">{nationality === 'VIETNAMESE' ? '10.5%' : '9.5%'}</td>
                      <td className="p-2 text-right font-mono">{formatCurrency(result.employeeTotalInsuranceVND, 'VND')}</td>
                      <td className="p-2 text-center text-amber-300">{nationality === 'VIETNAMESE' ? '23.5%' : '22.5%'}</td>
                      <td className="p-2 text-right font-mono text-amber-300 font-black">
                        {formatCurrency(result.employerTotalInsuranceVND + (nationality !== 'VIETNAMESE' ? result.companyPaidHousingTotalVND : 0), 'VND')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tóm tắt dòng tiền ngân sách tuyển dụng */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <p className="font-extrabold text-slate-800 uppercase text-[11px] text-indigo-700">
                  Dự toán dòng tiền tuyển dụng cho Ban Giám Đốc:
                </p>
                <div className="flex justify-between text-slate-600">
                  <span>1. Lương Gross thỏa thuận:</span>
                  <b className="font-mono text-slate-900">{formatCurrency(result.grossSalaryVND, 'VND')}</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>2. Bảo hiểm &amp; Công đoàn DN đóng:</span>
                  <b className="font-mono text-slate-900">{formatCurrency(result.employerTotalInsuranceVND, 'VND')}</b>
                </div>
                {nationality !== 'VIETNAMESE' && result.companyPaidHousingTotalVND > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>3. Tiền thuê nhà công ty thanh toán:</span>
                    <b className="font-mono text-slate-900">{formatCurrency(result.companyPaidHousingTotalVND, 'VND')}</b>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black text-indigo-950 pt-1 border-t border-slate-200">
                  <span>➔ TỔNG NGÂN SÁCH DOANH NGHIỆP TRẢ/THÁNG:</span>
                  <span className="font-mono text-indigo-700 text-sm font-black">{formatCurrency(result.totalEmployerCostVND, 'VND')}</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ===================== FOOTER / ACTIONS ===================== */}
        <div className="bg-slate-100 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>Áp dụng biểu thuế lũy tiến TT 111/2013/TT-BTC, chuẩn giảm trừ gia cảnh (Bản thân 15.5tr / NPT 6.2tr) &amp; LTT Vùng NĐ 293/2025/NĐ-CP.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {candidate && (
              <button
                type="button"
                onClick={handleApplyOffer}
                className="flex-1 sm:flex-initial py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Award className="w-4 h-4" />
                <span>Áp Dụng Vào Offer Của {candidate.fullName}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
