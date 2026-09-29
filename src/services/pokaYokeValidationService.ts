/**
 * POKA-YOKE / MISTAKE-PROOFING VALIDATION SERVICE
 * Triết lý doanh nghiệp: "Không có khả năng làm sai được"
 * Ngăn chặn tuyệt đối dữ liệu rác, sai quy chuẩn ngay từ lúc nhập liệu
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
  normalizedValue?: string;
}

export const pokaYokeValidationService = {
  /**
   * 1. Kiểm tra Số điện thoại di động Việt Nam
   * Quy chuẩn: Bắt buộc đúng 10 chữ số, bắt đầu bằng các đầu số hợp lệ (03, 05, 07, 08, 09)
   */
  validateVietnamPhone(phone: string): ValidationResult {
    if (!phone) {
      return { isValid: false, message: 'Số điện thoại không được để trống' };
    }
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    
    // Kiểm tra ký tự không phải số
    if (!/^\d+$/.test(cleanPhone)) {
      return { isValid: false, message: 'Số điện thoại chỉ được chứa các chữ số, không chứa chữ hay ký tự đặc biệt' };
    }

    if (cleanPhone.length < 10) {
      return { 
        isValid: false, 
        message: `Số điện thoại còn thiếu ${10 - cleanPhone.length} số (Hiện có ${cleanPhone.length}/10 số)` 
      };
    }

    if (cleanPhone.length > 10) {
      return { 
        isValid: false, 
        message: `Số điện thoại bị thừa ${cleanPhone.length - 10} số (Hiện có ${cleanPhone.length}/10 số)` 
      };
    }

    // Kiểm tra đầu số nhà mạng Việt Nam
    const validPrefixes = ['03', '05', '07', '08', '09'];
    const prefix = cleanPhone.substring(0, 2);
    if (!validPrefixes.includes(prefix)) {
      return { 
        isValid: false, 
        message: `Đầu số "${prefix}" không hợp lệ. Phải bắt đầu bằng đầu số di động VN: 03x, 05x, 07x, 08x, 09x` 
      };
    }

    return { isValid: true, message: '✓ Số điện thoại hợp lệ (10 số chuẩn VN)', normalizedValue: cleanPhone };
  },

  /**
   * 2. Kiểm tra Căn Cước Công Dân (CCCD gắn chip)
   * Quy chuẩn: Bắt buộc đúng 12 chữ số
   */
  validateCitizenId(cccd: string): ValidationResult {
    if (!cccd) {
      return { isValid: false, message: 'Số CCCD không được để trống' };
    }
    const cleanCccd = cccd.replace(/[\s.-]/g, '');

    if (!/^\d+$/.test(cleanCccd)) {
      return { isValid: false, message: 'CCCD chỉ được chứa các chữ số' };
    }

    if (cleanCccd.length < 12) {
      return { 
        isValid: false, 
        message: `CCCD gắn chip còn thiếu ${12 - cleanCccd.length} số (Hiện có ${cleanCccd.length}/12 số)` 
      };
    }

    if (cleanCccd.length > 12) {
      return { 
        isValid: false, 
        message: `CCCD bị thừa ${cleanCccd.length - 12} số (Hiện có ${cleanCccd.length}/12 số)` 
      };
    }

    return { isValid: true, message: '✓ Số CCCD hợp lệ (12 số chuẩn quốc gia)', normalizedValue: cleanCccd };
  },

  /**
   * 3. Kiểm tra Mã Số Thuế Cá Nhân (MST)
   * Quy chuẩn: Đúng 10 chữ số (hoặc 13 chữ số với MST phụ thuộc)
   */
  validateTaxId(taxCode: string): ValidationResult {
    if (!taxCode) {
      return { isValid: false, message: 'Mã số thuế không được để trống' };
    }
    const cleanTax = taxCode.replace(/[\s-]/g, '');

    if (!/^\d+$/.test(cleanTax)) {
      return { isValid: false, message: 'Mã số thuế chỉ được chứa các chữ số' };
    }

    if (cleanTax.length !== 10 && cleanTax.length !== 13) {
      return { 
        isValid: false, 
        message: `Mã số thuế phải đúng 10 số (Hiện có ${cleanTax.length} số)` 
      };
    }

    return { isValid: true, message: '✓ Mã số thuế hợp lệ', normalizedValue: cleanTax };
  },

  /**
   * 4. Kiểm tra Mã Số Bảo Hiểm Xã Hội (BHXH)
   * Quy chuẩn: Bắt buộc đúng 10 chữ số
   */
  validateSocialInsurance(bhxh: string): ValidationResult {
    if (!bhxh) {
      return { isValid: false, message: 'Mã số sổ BHXH không được để trống' };
    }
    const cleanBhxh = bhxh.replace(/[\s.-]/g, '');

    if (!/^\d+$/.test(cleanBhxh)) {
      return { isValid: false, message: 'Mã số BHXH chỉ được chứa các chữ số' };
    }

    if (cleanBhxh.length !== 10) {
      return { 
        isValid: false, 
        message: `Mã số sổ BHXH phải đúng 10 chữ số (Hiện có ${cleanBhxh.length}/10 số)` 
      };
    }

    return { isValid: true, message: '✓ Mã số sổ BHXH hợp lệ (10 số)', normalizedValue: cleanBhxh };
  },

  /**
   * 5. Kiểm tra Số Tài Khoản Ngân Hàng
   * Quy chuẩn: Từ 8 đến 16 chữ số
   */
  validateBankAccount(stk: string): ValidationResult {
    if (!stk) {
      return { isValid: false, message: 'Số tài khoản không được để trống' };
    }
    const cleanStk = stk.replace(/[\s.-]/g, '');

    if (!/^\d+$/.test(cleanStk)) {
      return { isValid: false, message: 'Số tài khoản chỉ được chứa các chữ số' };
    }

    if (cleanStk.length < 8 || cleanStk.length > 18) {
      return { 
        isValid: false, 
        message: `Số tài khoản ngân hàng thường có từ 8 đến 16 số (Hiện có ${cleanStk.length} số)` 
      };
    }

    return { isValid: true, message: '✓ Số tài khoản ngân hàng hợp lệ', normalizedValue: cleanStk };
  },

  /**
   * 6. Kiểm tra Địa Chỉ Email
   */
  validateEmail(email: string): ValidationResult {
    if (!email) {
      return { isValid: false, message: 'Email không được để trống' };
    }
    const cleanEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(cleanEmail)) {
      return { isValid: false, message: 'Định dạng email không hợp lệ (Ví dụ đúng: nguyenvan@anviet.vn)' };
    }

    return { isValid: true, message: '✓ Email hợp lệ', normalizedValue: cleanEmail.toLowerCase() };
  },

  /**
   * 7. Kiểm tra Độ Tuổi Lao Động (BLLĐ: ≥ 18 tuổi)
   */
  validateLaborAge(dob: string): ValidationResult {
    if (!dob) {
      return { isValid: false, message: 'Ngày sinh không được để trống' };
    }
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      return { isValid: false, message: 'Ngày sinh không hợp lệ' };
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return { 
        isValid: false, 
        message: `Người lao động chưa đủ 18 tuổi (Hiện tại: ${age} tuổi). Theo Điều 143 BLLĐ 2019, cần có sự đồng ý của người giám hộ` 
      };
    }

    if (age > 65) {
      return { 
        isValid: false, 
        message: `Người lao động đã trên tuổi nghỉ hưu (${age} tuổi). Vui lòng xác minh chế độ người cao tuổi` 
      };
    }

    return { isValid: true, message: `✓ Tuổi lao động hợp lệ (${age} tuổi)` };
  },

  /**
   * Kiểm tra tổng thể form nhân sự
   */
  validateEmployeeForm(emp: {
    phone?: string;
    cccd?: string;
    email?: string;
    taxCode?: string;
    socialInsuranceNumber?: string;
    bankAccountNumber?: string;
    dob?: string;
  }): { isAllValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (emp.phone) {
      const p = this.validateVietnamPhone(emp.phone);
      if (!p.isValid) errors.phone = p.message;
    } else {
      errors.phone = 'Số điện thoại là bắt buộc';
    }

    if (emp.cccd) {
      const c = this.validateCitizenId(emp.cccd);
      if (!c.isValid) errors.cccd = c.message;
    } else {
      errors.cccd = 'Số CCCD là bắt buộc';
    }

    if (emp.email) {
      const e = this.validateEmail(emp.email);
      if (!e.isValid) errors.email = e.message;
    }

    if (emp.taxCode) {
      const t = this.validateTaxId(emp.taxCode);
      if (!t.isValid) errors.taxCode = t.message;
    }

    if (emp.socialInsuranceNumber) {
      const s = this.validateSocialInsurance(emp.socialInsuranceNumber);
      if (!s.isValid) errors.socialInsuranceNumber = s.message;
    }

    if (emp.bankAccountNumber) {
      const b = this.validateBankAccount(emp.bankAccountNumber);
      if (!b.isValid) errors.bankAccountNumber = b.message;
    }

    if (emp.dob) {
      const a = this.validateLaborAge(emp.dob);
      if (!a.isValid) errors.dob = a.message;
    }

    return {
      isAllValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
