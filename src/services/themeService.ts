/**
 * DỊCH VỤ QUẢN LÝ PHONG CÁCH GIAO DIỆN (THEME, COLOR MODE & TYPOGRAPHY)
 * Hỗ trợ 5 mẫu phong cách độc đáo + Tự động Ngày/Đêm theo Hệ Điều Hành + Danh mục Font chữ phong phú
 */

export type ThemeGroup = 'CORE' | 'VECTOR' | 'NATURE';

export type ThemePreset = 
  // 5 Mẫu Doanh Nghiệp Chuẩn Mực
  | 'CORPORATE_INDIGO'
  | 'EMERALD_NATURE'
  | 'MIDNIGHT_LUXURY'
  | 'AMBER_SUNSET'
  | 'TECH_CYAN'
  // 5 Mẫu Nền Hình Vector & Đường Line / Sóng
  | 'VECTOR_WAVE'
  | 'VECTOR_GRID'
  | 'VECTOR_HEXAGON'
  | 'VECTOR_CIRCUIT'
  | 'VECTOR_GEOMETRIC'
  // 5 Mẫu Hình Ảnh Thiên Nhiên Mờ
  | 'NATURE_MEADOW'
  | 'NATURE_WILDLIFE'
  | 'NATURE_OCEAN'
  | 'NATURE_FOREST'
  | 'NATURE_FLORAL';

export type ColorMode = 'LIGHT' | 'DARK' | 'SYSTEM';

export type FontFamilyId = 
  | 'DEFAULT'
  | 'ARIAL'
  | 'TIMES'
  | 'CALIBRI'
  | 'VNI_TIMES'
  | 'BE_VIETNAM'
  | 'ROBOTO'
  | 'COURIER';

export interface ThemeConfig {
  preset: ThemePreset;
  mode: ColorMode;
  font: FontFamilyId;
}

export interface ThemePresetInfo {
  id: ThemePreset;
  name: string;
  group: ThemeGroup;
  description: string;
  previewColors: string[]; // [primary, accent, bg]
  primaryClass: string;
  tagline: string;
}

export interface FontOptionInfo {
  id: FontFamilyId;
  name: string;
  fontFamily: string;
  desc: string;
  sample: string;
}

export const THEME_PRESETS: ThemePresetInfo[] = [
  // --- NHÓM 1: 5 MẪU DOANH NGHIỆP CHUẨN MỰC ---
  {
    id: 'CORPORATE_INDIGO',
    name: 'Doanh Nghiệp Hiện Đại',
    group: 'CORE',
    description: 'Phong thái thanh lịch, chuẩn mực tài chính và quản trị nhân sự tập đoàn.',
    previewColors: ['#4f46e5', '#818cf8', '#f8fafc'],
    primaryClass: 'theme-indigo',
    tagline: 'Chuyên nghiệp · Chuẩn mực'
  },
  {
    id: 'EMERALD_NATURE',
    name: 'Sinh Thái Thực Phẩm',
    group: 'CORE',
    description: 'Tone xanh ngọc bích tươi mát, hoàn hảo cho ngành F&B, chế biến thực phẩm sạch.',
    previewColors: ['#059669', '#34d399', '#f0fdf4'],
    primaryClass: 'theme-emerald',
    tagline: 'Tươi mới · Bền vững'
  },
  {
    id: 'MIDNIGHT_LUXURY',
    name: 'Đẳng Cấp Lãnh Đạo',
    group: 'CORE',
    description: 'Tone than đá kết hợp vàng ánh kim sang trọng, tối ưu quyền uy cho Ban Giám Đốc.',
    previewColors: ['#0f172a', '#eab308', '#020617'],
    primaryClass: 'theme-midnight',
    tagline: 'Uy quyền · Sang trọng'
  },
  {
    id: 'AMBER_SUNSET',
    name: 'Năng Động Hoàng Hôn',
    group: 'CORE',
    description: 'Tone vàng cam ấm áp, tăng năng lượng làm việc và bảo vệ thị giác chống mỏi mắt.',
    previewColors: ['#d97706', '#fbbf24', '#fffbeb'],
    primaryClass: 'theme-amber',
    tagline: 'Nhiệt huyết · Dịu mắt'
  },
  {
    id: 'TECH_CYAN',
    name: 'Công Nghệ Tối Giản',
    group: 'CORE',
    description: 'Thiết kế phẳng sắc nét theo xu hướng giao diện công nghệ cao Silicon Valley.',
    previewColors: ['#0891b2', '#22d3ee', '#ecfeff'],
    primaryClass: 'theme-cyan',
    tagline: 'Đột phá · Tốc độ'
  },

  // --- NHÓM 2: 5 MẪU NỀN HÌNH VECTOR, LINE & ĐƯỜNG UỐN SÓNG ---
  {
    id: 'VECTOR_WAVE',
    name: 'Sóng Vector Lượn Sóng',
    group: 'VECTOR',
    description: 'Nền họa tiết vector đường uốn lượn sóng mềm mại, uyển chuyển phía sau chữ.',
    previewColors: ['#4338ca', '#818cf8', '#eef2ff'],
    primaryClass: 'theme-vector-wave',
    tagline: 'Sóng vector uốn lượn'
  },
  {
    id: 'VECTOR_GRID',
    name: 'Lưới Line Kỹ Thuật Số',
    group: 'VECTOR',
    description: 'Đường line dạng lưới ma trận cyber công nghệ, chuẩn kỹ thuật sắc sảo.',
    previewColors: ['#2563eb', '#60a5fa', '#eff6ff'],
    primaryClass: 'theme-vector-grid',
    tagline: 'Đường line lưới công nghệ'
  },
  {
    id: 'VECTOR_HEXAGON',
    name: 'Lục Giác Đa Chiều',
    group: 'VECTOR',
    description: 'Cấu trúc khối đa giác hình học lục giác tổ ong mang phong cách công nghệ cao.',
    previewColors: ['#0d9488', '#2dd4bf', '#f0fdfa'],
    primaryClass: 'theme-vector-hexagon',
    tagline: 'Khối lục giác đa chiều'
  },
  {
    id: 'VECTOR_CIRCUIT',
    name: 'Vi Mạch Điện Tử',
    group: 'VECTOR',
    description: 'Đường line vi mạch điện tử mạch lạc chạy tinh tế phía sau khối nội dung.',
    previewColors: ['#7c3aed', '#a78bfa', '#f5f3ff'],
    primaryClass: 'theme-vector-circuit',
    tagline: 'Đường vi mạch kỹ thuật'
  },
  {
    id: 'VECTOR_GEOMETRIC',
    name: 'Đường Cong Trừu Tượng',
    group: 'VECTOR',
    description: 'Họa tiết đường cong Bauhaus tối giản, nghệ thuật thị giác hiện đại cao cấp.',
    previewColors: ['#db2777', '#f472b6', '#fdf2f8'],
    primaryClass: 'theme-vector-geometric',
    tagline: 'Đường cong Bauhaus tinh tế'
  },

  // --- NHÓM 3: 5 MẪU HÌNH ẢNH THIÊN NHIÊN MỜ DỊU MẮT ---
  {
    id: 'NATURE_MEADOW',
    name: 'Đồng Cỏ Thảo Nguyên',
    group: 'NATURE',
    description: 'Họa tiết đồng cỏ xanh mướt bao la mờ nhẹ phía sau, mang lại cảm giác thư thái.',
    previewColors: ['#16a34a', '#4ade80', '#f0fdf4'],
    primaryClass: 'theme-nature-meadow',
    tagline: 'Đồng cỏ xanh bao la'
  },
  {
    id: 'NATURE_WILDLIFE',
    name: 'Muôn Thú Tự Nhiên',
    group: 'NATURE',
    description: 'Họa tiết bóng thú rừng và muông chim thanh bình, hòa mình cùng thiên nhiên.',
    previewColors: ['#b45309', '#fde047', '#fefce8'],
    primaryClass: 'theme-nature-wildlife',
    tagline: 'Bóng thú rừng thanh bình'
  },
  {
    id: 'NATURE_OCEAN',
    name: 'Đại Dương Biển Sâu',
    group: 'NATURE',
    description: 'Sóng biển ngọc bích êm đềm, rạn san hô xanh mờ làm dịu áp lực công việc.',
    previewColors: ['#0284c7', '#38bdf8', '#f0f9ff'],
    primaryClass: 'theme-nature-ocean',
    tagline: 'Sóng biển ngọc bích'
  },
  {
    id: 'NATURE_FOREST',
    name: 'Rừng Cây Đại Ngàn',
    group: 'NATURE',
    description: 'Bóng rừng thông đại ngàn ẩn hiện trong sương mờ tĩnh lặng, vững vàng trường tồn.',
    previewColors: ['#15803d', '#22c55e', '#f0fdf4'],
    primaryClass: 'theme-nature-forest',
    tagline: 'Rừng thông trong sương'
  },
  {
    id: 'NATURE_FLORAL',
    name: 'Vườn Hoa Hương Sắc',
    group: 'NATURE',
    description: 'Cánh hoa anh đào trang nhã, nhẹ nhàng rơi mờ tinh tế trên trang làm việc.',
    previewColors: ['#e11d48', '#fb7185', '#fff1f2'],
    primaryClass: 'theme-nature-floral',
    tagline: 'Cánh hoa rơi trang nhã'
  }
];

export const FONT_OPTIONS: FontOptionInfo[] = [
  {
    id: 'DEFAULT',
    name: 'Mặc Định Hệ Thống (Inter Sans)',
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    desc: 'Font chuẩn giao diện Web hiện đại, cân bằng độ tương phản, rõ nét từng con số.',
    sample: 'Quản trị nhân sự & Tiền lương An Việt 2026'
  },
  {
    id: 'ARIAL',
    name: 'Arial (Tiêu Chuẩn Quốc Tế)',
    fontFamily: "Arial, Helvetica, sans-serif",
    desc: 'Font chữ không chân phổ biến nhất thế giới, rõ ràng và dễ đọc trên mọi màn hình.',
    sample: 'Quản trị nhân sự & Tiền lương An Việt 2026'
  },
  {
    id: 'TIMES',
    name: 'Times New Roman (Chuẩn Văn Bản Nhà Nước)',
    fontFamily: "'Times New Roman', Times, serif",
    desc: 'Font chữ có chân chuẩn mực soạn thảo văn bản hành chính theo Nghị định 30/2020/NĐ-CP.',
    sample: 'Quản trị nhân sự & Tiền lương An Việt 2026'
  },
  {
    id: 'CALIBRI',
    name: 'Calibri (Văn Phòng Hiện Đại Microsoft)',
    fontFamily: "Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif",
    desc: 'Nét chữ bo tròn nhẹ nhàng, thanh thoát, chuẩn định dạng bảng tính Excel và văn phòng.',
    sample: 'Quản trị nhân sự & Tiền lương An Việt 2026'
  },
  {
    id: 'VNI_TIMES',
    name: 'VNI-Times / Serif Classic (Trang Trọng)',
    fontFamily: "'VNI-Times', 'Times New Roman', Georgia, serif",
    desc: 'Phong thái truyền thống, trang trọng, quen thuộc với giới kế toán và văn thư kỳ cựu.',
    sample: 'Quản trị nhân sự & Tiền lương An Việt 2026'
  },
  {
    id: 'BE_VIETNAM',
    name: 'Be Vietnam Pro (Tối Ưu Tiếng Việt)',
    fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif",
    desc: 'Bộ font thiết kế chuyên biệt cho tiếng Việt, các dấu thanh huyền sắc hỏi ngã chuẩn tỉ lệ vàng.',
    sample: 'Quản trị nhân sự & Tiền lương An Việt 2026'
  },
  {
    id: 'ROBOTO',
    name: 'Roboto (Google Web Chuẩn Mực)',
    fontFamily: "Roboto, 'Segoe UI', sans-serif",
    desc: 'Hình học chuẩn xác, nhịp điệu mở, tiêu chuẩn vàng của các ứng dụng SaaS thế hệ mới.',
    sample: 'Quản trị nhân sự & Tiền lương An Việt 2026'
  },
  {
    id: 'COURIER',
    name: 'Courier New (Monospace Kỹ Thuật Số)',
    fontFamily: "'Courier New', Courier, monospace",
    desc: 'Độ rộng ký tự bằng nhau tuyệt đối, tối ưu tra cứu bảng kê tài khoản và mã số thuế.',
    sample: 'Quản trị nhân sự & Tiền lương An Việt 2026'
  }
];

const STORAGE_KEYS = {
  PRESET: 'omnihrm_theme_preset_v2',
  MODE: 'omnihrm_color_mode_v2',
  FONT: 'omnihrm_theme_font_v2'
};

export const themeService = {
  getConfig(): ThemeConfig {
    const savedPreset = (localStorage.getItem(STORAGE_KEYS.PRESET) as ThemePreset) || 'CORPORATE_INDIGO';
    const savedMode = (localStorage.getItem(STORAGE_KEYS.MODE) as ColorMode) || 'SYSTEM';
    const savedFont = (localStorage.getItem(STORAGE_KEYS.FONT) as FontFamilyId) || 'DEFAULT';
    return {
      preset: savedPreset,
      mode: savedMode,
      font: savedFont
    };
  },

  saveConfig(config: ThemeConfig) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRESET, config.preset);
      localStorage.setItem(STORAGE_KEYS.MODE, config.mode);
      localStorage.setItem(STORAGE_KEYS.FONT, config.font);
      this.applyToDOM(config);
    } catch (e) {
      console.warn('Cannot save theme to localStorage:', e);
    }
  },

  isEffectiveDark(mode: ColorMode): boolean {
    if (mode === 'DARK') return true;
    if (mode === 'LIGHT') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  applyToDOM(config: ThemeConfig) {
    const root = document.documentElement;
    const isDark = this.isEffectiveDark(config.mode);

    // 1. Áp dụng class Theme Preset
    THEME_PRESETS.forEach(p => root.classList.remove(p.primaryClass));
    const currentPreset = THEME_PRESETS.find(p => p.id === config.preset) || THEME_PRESETS[0];
    root.classList.add(currentPreset.primaryClass);

    // 2. Bật/tắt Dark mode
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    root.setAttribute('data-preset', config.preset);

    // 3. Áp dụng Font chữ toàn cục
    const currentFont = FONT_OPTIONS.find(f => f.id === config.font) || FONT_OPTIONS[0];
    root.style.setProperty('--app-font-family', currentFont.fontFamily);
    document.body.style.fontFamily = currentFont.fontFamily;
  },

  initListener(onThemeChange: () => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const config = this.getConfig();
      if (config.mode === 'SYSTEM') {
        this.applyToDOM(config);
        onThemeChange();
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
};
