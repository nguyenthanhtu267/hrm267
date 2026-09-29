/**
 * DỊCH VỤ ĐA NGÔN NGỮ (I18N - INTERNATIONALIZATION)
 * Hỗ trợ 3 ngôn ngữ:
 * 1. Tiếng Việt (Mặc định) - vi
 * 2. Tiếng Anh (English) - en
 * 3. Tiếng Trung Quốc (中文 - Chinese) - zh
 */

export type AppLanguage = 'vi' | 'en' | 'zh';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flagTitle: string;
  flagEmoji: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'vi',
    name: 'Tiếng Việt',
    nativeName: 'Tiếng Việt (Mặc định)',
    flagTitle: 'Việt Nam',
    flagEmoji: '🇻🇳'
  },
  {
    code: 'en',
    name: 'Tiếng Anh',
    nativeName: 'English (UK / US)',
    flagTitle: 'United Kingdom / English',
    flagEmoji: '🇬🇧'
  },
  {
    code: 'zh',
    name: 'Tiếng Trung Quốc',
    nativeName: '中文 (简体 / 繁體)',
    flagTitle: 'China / 中文',
    flagEmoji: '🇨🇳'
  }
];

const STORAGE_KEY = 'omnihrm_language';

export const languageService = {
  getLanguage(): AppLanguage {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'vi' || saved === 'en' || saved === 'zh') {
        return saved;
      }
    } catch (_) {}
    return 'vi'; // Mặc định luôn là Tiếng Việt
  },

  setLanguage(lang: AppLanguage): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      window.dispatchEvent(new CustomEvent('omnihrm_language_change', { detail: lang }));
    } catch (_) {}
  },

  getCurrentOption(): LanguageOption {
    const current = this.getLanguage();
    return SUPPORTED_LANGUAGES.find(l => l.code === current) || SUPPORTED_LANGUAGES[0];
  },

  translate(key: string, currentLang?: AppLanguage): string {
    const lang = currentLang || this.getLanguage();
    if (lang === 'vi') return DICTIONARY[key]?.vi || key;
    if (lang === 'en') return DICTIONARY[key]?.en || DICTIONARY[key]?.vi || key;
    if (lang === 'zh') return DICTIONARY[key]?.zh || DICTIONARY[key]?.vi || key;
    return key;
  }
};

const DICTIONARY: Record<string, { vi: string; en: string; zh: string }> = {
  // Menu Tabs
  'menu.dashboard': { vi: 'Bảng Điều Khiển', en: 'Dashboard', zh: '工作台大盘' },
  'menu.policy': { vi: 'Quy Định Chính Sách', en: 'Company Policies', zh: '规章制度' },
  'menu.checklist': { vi: 'Bảng Kiểm Soát', en: 'Compliance Checklist', zh: '合规清单' },
  'menu.org_chart': { vi: 'Sơ Đồ Tổ Chức', en: 'Organization Chart', zh: '组织架构' },
  'menu.recruitment': { vi: 'Tuyển Dụng', en: 'Recruitment & JDs', zh: '招聘管理' },
  'menu.training': { vi: 'Đào Tạo', en: 'Training Academy', zh: '员工培训' },
  'menu.employees': { vi: 'Danh Sách Nhân Viên', en: 'Employee Directory', zh: '员工花名册' },
  'menu.contracts': { vi: 'Hợp Đồng Lao Động', en: 'Labor Contracts', zh: '劳动合同' },
  'menu.attendance': { vi: 'Chấm Công & Ca Kíp', en: 'Attendance & Shifts', zh: '考勤排班' },
  'menu.requests': { vi: 'Đơn Từ & Phê Duyệt', en: 'Requests & Approval', zh: '审批流' },
  'menu.payroll': { vi: 'Bảng Tính Lương', en: 'Payroll Calculator', zh: '薪酬核算' },
  'menu.bank_transfer': { vi: 'Đối Soát Ngân Hàng', en: 'Bank Transfer Audit', zh: '银行代发' },
  'menu.performance': { vi: 'Đánh Giá Hiệu Suất', en: 'Performance Review', zh: '绩效评价' },
  'menu.accounting': { vi: 'Hạch Toán Chi Phí', en: 'Payroll Accounting', zh: '财务核算' },
  'menu.offboarding': { vi: 'Thủ Tục Nghỉ Việc', en: 'Offboarding & Severance', zh: '离职管理' },
  'menu.tax_yearly': { vi: 'Quyết Toán Thuế Năm', en: 'Annual Tax Settlement', zh: '年度个税' },
  'menu.gov_reports': { vi: 'Báo Cáo HCNS Đến CQNN', en: 'Gov Compliance Reports', zh: '政府机构合规报告' },
  'menu.feedback_list': { vi: 'Danh Sách Góp Ý', en: 'User Feedback List', zh: '意见反馈' }
};
