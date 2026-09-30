import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Search, 
  ShieldAlert, 
  X, 
  Send, 
  BookOpen, 
  HelpCircle, 
  DollarSign, 
  CalendarCheck, 
  Lock, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface AIAssistantModalProps {
  onNavigate?: (tab: NavTab) => void;
}

interface FeatureGuide {
  title: string;
  tab: NavTab;
  category: string;
  description: string;
  keywords: string[];
}

const FEATURE_GUIDES: FeatureGuide[] = [
  {
    title: 'Bảng Điều Khiển (Dashboard)',
    tab: 'DASHBOARD',
    category: 'Tổng quan',
    description: 'Thống kê tổng thể nhân sự, tỷ lệ đi làm hôm nay, quỹ lương dự kiến, cảnh báo hợp đồng sắp hết hạn và duyệt nhanh đơn từ.',
    keywords: ['dashboard', 'tổng quan', 'báo cáo', 'chỉ số', 'thống kê', 'quỹ lương']
  },
  {
    title: 'Bảng Quy Ước',
    tab: 'POLICY',
    category: 'Cấu hình',
    description: 'Cấu hình chính sách công ty: giờ làm việc, chu kỳ công, các khoản phụ cấp ăn trưa/đi lại, mức lương tối thiểu vùng, định mức độc hại.',
    keywords: ['quy ước', 'chính sách', 'phụ cấp', 'cấu hình', 'giờ làm', 'chu kỳ lương', 'ăn trưa']
  },
  {
    title: 'Khoản Đóng BHXH & Thuế',
    tab: 'CHECKLIST',
    category: 'Pháp lý',
    description: 'Bản đối chiếu 63 khoản tiền lương & phụ cấp: phân loại bắt buộc đóng BHXH, chịu thuế TNCN, chi phí trừ TNDN và bồi dưỡng hiện vật.',
    keywords: ['bhxh', 'thuế', 'checklist', '63 khoản', 'phụ cấp', 'hiện vật', 'sữa độc hại', 'tncn']
  },
  {
    title: 'Sơ Đồ Tổ Chức',
    tab: 'ORG_CHART',
    category: 'Tổ chức',
    description: 'Cây sơ đồ tổ chức đa cấp, xem cấp trên/cấp dưới/đồng nghiệp khi click vào từng nhân sự, định biên nhân sự và vị trí tuyển dụng còn thiếu.',
    keywords: ['sơ đồ', 'tổ chức', 'cây tổ chức', 'phòng ban', 'định biên', 'chi nhánh', 'cấp trên']
  },
  {
    title: 'Tuyển Dụng (ATS AI)',
    tab: 'RECRUITMENT',
    category: 'Nhân tài',
    description: 'Quản lý phễu ứng viên (Ứng viên mới, AI sơ tuyển, Phỏng vấn, Đề nghị việc, Đã nhận việc), chấm điểm CV tự động bằng AI, gửi offer letter.',
    keywords: ['tuyển dụng', 'ats', 'cv', 'ứng viên', 'ai lọc cv', 'phỏng vấn', 'offer letter']
  },
  {
    title: 'Đào Tạo (LMS)',
    tab: 'TRAINING',
    category: 'Phát triển',
    description: 'Khóa học hội nhập, an toàn lao động, vận hành máy, hỗ trợ nhúng link video YouTube/Drive, cấu hình thời lượng xem tối thiểu và bài test trắc nghiệm.',
    keywords: ['đào tạo', 'lms', 'khóa học', 'video', 'an toàn lao động', 'bài test', 'trắc nghiệm']
  },
  {
    title: 'Hồ Sơ & Hợp Đồng',
    tab: 'EMPLOYEE_CONTRACTS',
    category: 'Nhân sự',
    description: 'Quản lý toàn diện 300+ hồ sơ nhân sự và hợp đồng lao động: Thông tin cá nhân, HĐLĐ, phụ lục, ký số OTP, gia hạn, cảnh báo hết hạn và xuất nhập Excel.',
    keywords: ['hồ sơ', 'hợp đồng', 'hđlđ', 'ký số', 'otp', 'phụ lục', 'hồ sơ hợp đồng', 'nhân sự', 'excel']
  },
  {
    title: 'Thủ Tục & Biến Động Nhân Sự',
    tab: 'PERSONNEL_CHANGES',
    category: 'Biến động',
    description: 'Quy trình khép kín 5 bước xử lý biến động nhân sự: Đề xuất thay đổi lương/chức danh/bộ phận -> HR rà soát -> Ban Giám Đốc duyệt -> Ra Quyết định chính thức -> Áp dụng tự động vào Bảng lương & Hồ sơ.',
    keywords: ['thủ tục', 'biến động', 'tăng lương', 'điều chuyển', 'bổ nhiệm', 'thay đổi bộ phận', 'quyết định', 'quy trình biến động']
  },
  {
    title: 'Chấm Công & Phân Ca',
    tab: 'ATTENDANCE',
    category: 'Chấm công',
    description: 'Bảng phân ca tuần, ma trận chấm công, quản lý các loại xin nghỉ tháng, theo dõi chi tiết phép năm của tháng và phép tồn đến hiện tại, cảnh báo vi phạm nghỉ giữa ca < 12 giờ (Điều 110 BLLĐ).',
    keywords: ['chấm công', 'phân ca', 'ca kíp', '12 giờ', 'nghỉ giữa ca', 'đi muộn', 'ot', 'phép năm', 'tồn phép', 'nghỉ phép']
  },
  {
    title: 'Các Yêu Cầu & Phê Duyệt',
    tab: 'REQUESTS',
    category: 'Quy trình',
    description: '390+ yêu cầu phê duyệt đa luồng (nghỉ phép, OT, công tác, tạm ứng, bồi thường, nghỉ việc), duyệt hàng loạt có chọn lọc, lọc điều kiện >= <=.',
    keywords: ['duyệt đơn', 'nghỉ phép', 'ot', 'tạm ứng', 'phê duyệt hàng loạt', 'yêu cầu']
  },
  {
    title: 'Bảng Lương & Tạm Ứng',
    tab: 'PAYROLL',
    category: 'Tiền lương',
    description: 'Tính toán lương theo chu kỳ, giải thuật thai sản = 0, so sánh biến động chi phí lương với tháng trước (bóc tách 7 nhóm thông số, so sánh phòng ban), xuất phiếu lương Excel có công thức và gửi email hàng loạt.',
    keywords: ['tính lương', 'bảng lương', 'tạm ứng', 'thai sản', 'phiếu lương', 'khấu trừ', 'so sánh biến động', 'biến động lương', 'email phiếu lương']
  },
  {
    title: 'Kiểm Tra & Chuyển Khoản',
    tab: 'BANK_TRANSFER_AUDIT',
    category: 'Ngân quỹ',
    description: 'Đối soát chi tiết dòng tiền chuyển khoản ngân hàng, giải mã chính xác lý do Net chuyển khác Base Salary (bảo lưu trợ cấp độc hại bằng hiện vật).',
    keywords: ['chuyển khoản', 'ngân hàng', 'đối soát', 'audit', 'vietcombank', 'techcombank']
  },
  {
    title: 'KPI & Lương Hiệu Quả',
    tab: 'PERFORMANCE',
    category: 'Đãi ngộ',
    description: '3 nhóm lương (Theo sản phẩm, Theo khối lượng công việc, Theo KPI) liên kết thanh trượt tỷ lệ hiệu quả kinh doanh của toàn công ty.',
    keywords: ['kpi', 'sản phẩm', 'lương 3p', 'hiệu quả', 'doanh số', 'thanh trượt']
  },
  {
    title: 'Hạch Toán Chi Phí & Kế Toán',
    tab: 'ACCOUNTING',
    category: 'Kế toán',
    description: 'Phân bổ chi phí nhân sự vào các tài khoản kế toán 622, 627, 641, 642, 334, 338, 3335 theo chuẩn Thông tư 200/2014/TT-BTC.',
    keywords: ['kế toán', 'hạch toán', 'chi phí', 'tk 622', 'tk 642', 'tk 334', 'thông tư 200']
  },
  {
    title: 'Thanh Lý & Nghỉ Việc',
    tab: 'OFFBOARDING',
    category: 'Nghỉ việc',
    description: 'Quy trình bàn giao tài sản, thanh toán tiền trợ cấp thôi việc (Điều 46 BLLĐ), xử lý các khoản nợ tạm ứng chưa hoàn tất trước khi thôi việc.',
    keywords: ['nghỉ việc', 'thôi việc', 'sa thải', 'bàn giao', 'thanh lý', 'nợ tạm ứng']
  },
  {
    title: 'Quyết Toán Thuế Năm (Mẫu 08/UQ)',
    tab: 'TAX_YEARLY',
    category: 'Thuế',
    description: 'Tổng hợp thu nhập cả năm, số thuế đã khấu trừ, in Giấy ủy quyền quyết toán thuế TNCN mẫu 08/UQ-QTT-TNCN theo quy định của Tổng Cục Thuế.',
    keywords: ['quyết toán thuế', 'mẫu 08', 'ủy quyền', 'thuế năm', 'in tờ khai']
  }
];

export const LABOR_LAW_KNOWLEDGE: { category: string; question: string; answer: string; legalRef: string }[] = [
  // 1. TIỀN LƯƠNG & LÀM THÊM GIỜ (OT)
  {
    category: 'Tiền Lương & OT',
    question: 'Quy định về thời giờ làm việc bình thường và làm thêm giờ (OT)?',
    answer: 'Thời giờ làm việc bình thường không quá 08 giờ/ngày và 48 giờ/tuần. Doanh nghiệp có quyền quy định làm việc theo giờ hoặc ngày hoặc tuần (nếu theo tuần thì không quá 10 giờ/ngày và 48 giờ/tuần). Giờ làm thêm (OT) không quá 50% số giờ làm việc bình thường trong 01 ngày; không quá 40 giờ/tháng và không quá 200 giờ/năm (ngành nghề đặc biệt được phép tới 300 giờ/năm có thông báo Sở LĐTBXH).',
    legalRef: 'Điều 105, 107 Bộ luật Lao động 2019'
  },
  {
    category: 'Tiền Lương & OT',
    question: 'Hệ số tính tiền lương làm thêm giờ (OT) ban ngày và ban đêm theo quy định?',
    answer: 'Tiền lương làm thêm giờ được tính theo đơn giá tiền lương hoặc tiền lương thực trả: \n• OT ngày thường: Ít nhất bằng 150%\n• OT ngày nghỉ hàng tuần: Ít nhất bằng 200%\n• OT ngày nghỉ lễ, tết, ngày nghỉ có hưởng lương: Ít nhất bằng 300% (chưa kể tiền lương ngày lễ, tết đối với NLĐ hưởng lương ngày).\n• Làm việc ban đêm (22h - 06h): Được trả thêm ít nhất 30% lương công việc ban ngày. Nếu làm thêm giờ ban đêm thì được trả thêm ít nhất 20% lương làm thêm ban ngày (tổng cộng có thể lên tới 270% hoặc 390%).',
    legalRef: 'Điều 98 Bộ luật Lao động 2019 & Điều 55 Nghị định 145/2020/NĐ-CP'
  },
  {
    category: 'Tiền Lương & OT',
    question: 'Mức lương tối thiểu vùng năm 2024-2025 là bao nhiêu? (NĐ 74/2024 & NĐ 73/2025)',
    answer: 'Từ 01/07/2024 (NĐ 74/2024/NĐ-CP) - mức lương tối thiểu THÁNG:\n• Vùng I: 4.960.000 đ/tháng → 23.800 đ/giờ\n• Vùng II: 4.410.000 đ/tháng → 21.200 đ/giờ\n• Vùng III: 3.860.000 đ/tháng → 18.600 đ/giờ\n• Vùng IV: 3.450.000 đ/tháng → 16.600 đ/giờ\n⚠️ Từ 01/07/2025 (NĐ 73/2025 đang trình Chính phủ) dự kiến tăng thêm 6–7%:\n• Vùng I: ~5.300.000 đ/tháng\n• Vùng II: ~4.720.000 đ/tháng\n• Vùng III: ~4.130.000 đ/tháng\n• Vùng IV: ~3.690.000 đ/tháng\nLưu ý: Mức lương thực tế của doanh nghiệp phải ≥ lương tối thiểu vùng; người làm qua đào tạo nghề phải cao hơn ít nhất 7%.',
    legalRef: 'Nghị định 74/2024/NĐ-CP (hiệu lực 01/07/2024) & Nghị định 73/2025 (dự thảo)'
  },
  {
    category: 'Tiền Lương & OT',
    question: 'Doanh nghiệp chậm trả lương cho người lao động có phải trả tiền lãi không?',
    answer: 'Trường hợp vì lý do bất khả kháng mà người sử dụng lao động đã tìm mọi biện pháp khắc phục nhưng không thể trả lương đúng hạn thì không được chậm quá 30 ngày. Nếu trả lương chậm từ 14 ngày trở lên thì người sử dụng lao động phải đền bù cho người lao động một khoản tiền ít nhất bằng số tiền lãi của số tiền trả chậm tính theo lãi suất huy động tiền gửi kỳ hạn 01 tháng của ngân hàng thương mại nơi mở tài khoản.',
    legalRef: 'Điều 97 Bộ luật Lao động 2019'
  },
  {
    category: 'Tiền Lương & OT',
    question: 'Công ty có được phạt tiền hoặc trừ lương nhân viên đi muộn, vi phạm nội quy không?',
    answer: 'NGHIÊM CẤM DƯỚI MỌI HÌNH THỨC! Điều 127 Bộ luật Lao động 2019 nghiêm cấm người sử dụng lao động dùng hình thức phạt tiền, cắt lương thay việc xử lý kỷ luật lao động. Việc đi muộn chỉ được xử lý bằng cách: không tính công thời gian không làm việc thực tế, hoặc xem xét áp dụng các hình thức xử lý kỷ luật theo Nội quy lao động (Khiển trách, kéo dài thời hạn nâng lương, cách chức, sa thải).',
    legalRef: 'Điều 127 Bộ luật Lao động 2019'
  },

  // 2. HỢP ĐỒNG LAO ĐỘNG & THỬ VIỆC
  {
    category: 'Hợp Đồng & Thử Việc',
    question: 'Thời gian thử việc tối đa theo từng vị trí và trình độ chuyên môn?',
    answer: 'Thời gian thử việc do hai bên thỏa thuận căn cứ vào tính chất công việc nhưng chỉ được thử việc 01 lần và:\n1. Không quá 180 ngày đối với chức danh quản lý doanh nghiệp theo Luật Doanh nghiệp.\n2. Không quá 60 ngày đối với công việc có chức danh nghề nghiệp cần trình độ từ cao đẳng trở lên.\n3. Không quá 30 ngày đối với công việc có chức danh nghề nghiệp cần trình độ trung cấp, công nhân kỹ thuật, nhân viên nghiệp vụ.\n4. Không quá 06 ngày làm việc đối với công việc khác.\n* Lưu ý: Không áp dụng thử việc đối với HĐLĐ có thời hạn dưới 01 tháng.',
    legalRef: 'Điều 25 Bộ luật Lao động 2019'
  },
  {
    category: 'Hợp Đồng & Thử Việc',
    question: 'Tiền lương trong thời gian thử việc tối thiểu là bao nhiêu %?',
    answer: 'Tiền lương của người lao động trong thời gian thử việc do hai bên thỏa thuận nhưng ít nhất phải bằng 85% mức lương của công việc đó (cả lương cơ bản và phụ cấp công việc chính thức). Hết thời gian thử việc, nếu đạt yêu cầu thì người sử dụng lao động phải giao kết hợp đồng lao động chính thức ngay.',
    legalRef: 'Điều 26, 27 Bộ luật Lao động 2019'
  },
  {
    category: 'Hợp Đồng & Thử Việc',
    question: 'Doanh nghiệp được ký tối đa bao nhiêu lần Hợp đồng xác định thời hạn?',
    answer: 'Hai bên chỉ được ký tối đa 02 lần hợp đồng lao động xác định thời hạn. Sau đó, nếu người lao động vẫn tiếp tục làm việc thì bắt buộc phải ký hợp đồng lao động KHÔNG xác định thời hạn (trừ trường hợp thuê giám đốc DNNN, người cao tuổi, hoặc người lao động nước ngoài). Khi hết hạn HĐLĐ lần 1, trong thời hạn 30 ngày hai bên phải ký HĐLĐ mới; nếu không ký mà NLĐ vẫn làm việc thì HĐ mặc nhiên trở thành vô thời hạn.',
    legalRef: 'Điều 20 Bộ luật Lao động 2019'
  },
  {
    category: 'Hợp Đồng & Thử Việc',
    question: 'Hợp đồng lao động điện tử ký số OTP có giá trị pháp lý tương đương bản giấy không?',
    answer: 'HOÀN TOÀN CÓ GIÁ TRỊ PHÁP LÝ TƯƠNG ĐƯƠNG! Theo Điều 14 Bộ luật Lao động 2019 và Luật Giao dịch điện tử 2023, hợp đồng lao động được giao kết thông qua phương tiện điện tử dưới hình thức thông điệp dữ liệu theo quy định của pháp luật về giao dịch điện tử có giá trị như hợp đồng lao động bằng văn bản giấy có chữ ký tay.',
    legalRef: 'Điều 14 Bộ luật Lao động 2019 & Luật Giao dịch điện tử 2023'
  },
  {
    category: 'Hợp Đồng & Thử Việc',
    question: 'Thời hạn báo trước khi đơn phương chấm dứt hợp đồng lao động là bao nhiêu ngày?',
    answer: 'Thời hạn báo trước đối với người lao động hoặc người sử dụng lao động khi đơn phương chấm dứt HĐLĐ hợp pháp:\n• Ít nhất 45 ngày đối với HĐLĐ không xác định thời hạn.\n• Ít nhất 30 ngày đối với HĐLĐ xác định thời hạn từ 12 tháng đến 36 tháng.\n• Ít nhất 03 ngày làm việc đối với HĐLĐ xác định thời hạn dưới 12 tháng hoặc trong thời gian thử việc.\n* Trường hợp người lao động bị quấy rối tình dục, bị bạo lực, bị trả thiếu lương hoặc làm việc trong môi trường đe dọa tính mạng thì có quyền nghỉ ngay không cần báo trước.',
    legalRef: 'Điều 35, 36 Bộ luật Lao động 2019'
  },

  // 3. KỶ LUẬT LAO ĐỘNG & SA THẢI
  {
    category: 'Kỷ Luật Sa Thải',
    question: 'Điều kiện sa thải người lao động theo Điều 125 Bộ luật Lao động?',
    answer: 'Hình thức xử lý kỷ luật sa thải chỉ được áp dụng trong 4 trường hợp nghiêm ngặt:\n1. Trộm cắp, tham ô, đánh bạc, cố ý gây thương tích, sử dụng ma túy tại nơi làm việc;\n2. Tiết lộ bí mật kinh doanh, công nghệ hoặc xâm phạm sở hữu trí tuệ gây thiệt hại nghiêm trọng;\n3. Bị xử lý kỷ luật kéo dài thời hạn nâng lương hoặc cách chức mà tái phạm trong thời gian chưa xóa kỷ luật;\n4. Người lao động tự ý bỏ việc 05 ngày cộng dồn trong thời hạn 30 ngày hoặc 20 ngày cộng dồn trong thời hạn 365 ngày tính từ ngày đầu tiên tự ý bỏ việc mà không có lý do chính đáng.\nBắt buộc phải mở phiên họp xử lý kỷ luật có sự tham gia của Công đoàn và người lao động.',
    legalRef: 'Điều 122, 125 Bộ luật Lao động 2019'
  },
  {
    category: 'Kỷ Luật Sa Thải',
    question: 'Trình tự, thủ tục tổ chức cuộc họp xử lý kỷ luật lao động gồm những gì?',
    answer: 'Theo Điều 70 Nghị định 145/2020/NĐ-CP:\n1. Người sử dụng lao động gửi thông báo mời họp bằng văn bản cho NLĐ, đại diện tổ chức Công đoàn cơ sở trước ít nhất 05 ngày làm việc.\n2. Cuộc họp phải có mặt đầy đủ các thành phần (nếu đã thông báo 03 lần mà NLĐ hoặc tổ chức đại diện không đến thì NSDLĐ vẫn tiến hành họp).\n3. Cuộc họp phải được lập biên bản chi tiết, có chữ ký của các thành phần tham dự.\n4. Người có thẩm quyền ký quyết định xử lý kỷ luật lao động trong thời hiệu luật định (thời hiệu là 06 tháng, trường hợp vi phạm tài chính là 12 tháng).',
    legalRef: 'Điều 70 Nghị định số 145/2020/NĐ-CP'
  },
  {
    category: 'Kỷ Luật Sa Thải',
    question: 'Có được sa thải lao động nữ đang mang thai hoặc nuôi con nhỏ dưới 12 tháng không?',
    answer: 'TUYỆT ĐỐI KHÔNG ĐƯỢC XỬ LÝ KỶ LUẬT! Theo khoản 4 Điều 122 Bộ luật Lao động 2019, người sử dụng lao động KHÔNG ĐƯỢC xử lý kỷ luật lao động (kể cả khiển trách hay sa thải) đối với người lao động đang trong thời gian: mang thai; nghỉ thai sản; nuôi con nhỏ dưới 12 tháng tuổi. Hết thời gian nuôi con dưới 12 tháng tuổi, nếu còn thời hiệu thì mới được tiến hành xem xét xử lý kỷ luật.',
    legalRef: 'Khoản 4 Điều 122 & Điều 137 Bộ luật Lao động 2019'
  },
  {
    category: 'Kỷ Luật Sa Thải',
    question: 'Doanh nghiệp có quyền tạm đình chỉ công việc của nhân viên trong bao lâu?',
    answer: 'Tạm đình chỉ công việc chỉ được thực hiện khi vụ việc vi phạm có những tình tiết phức tạp, nếu để người lao động tiếp tục làm việc sẽ gây khó khăn cho việc xác minh. Thời hạn tạm đình chỉ công việc không được quá 15 ngày, trường hợp đặc biệt không được quá 90 ngày. Trong thời gian tạm đình chỉ, người lao động được tạm ứng 50% tiền lương trước khi bị đình chỉ công việc.',
    legalRef: 'Điều 128 Bộ luật Lao động 2019'
  },

  // 4. BẢO HIỂM XÃ HỘI & CHẾ ĐỘ THAI SẢN
  {
    category: 'BHXH & Thai Sản',
    question: 'Người lao động nghỉ thai sản công ty có phải đóng BHXH và trả lương không?',
    answer: 'Trong thời gian nghỉ thai sản (thường là 6 tháng đối với lao động nữ sinh con), công ty KHÔNG phải trả lương. Người lao động được cơ quan BHXH chi trả trợ cấp thai sản bằng 100% mức bình quân tiền lương tháng đóng BHXH của 06 tháng liền kề trước khi nghỉ việc. Cả người lao động và doanh nghiệp đều KHÔNG phải đóng BHXH, BHYT, BHTN nhưng thời gian này vẫn được tính là thời gian tham gia BHXH.',
    legalRef: 'Điều 34, 39, 42 Luật Bảo hiểm xã hội 2014 & Luật BHXH 2024'
  },
  {
    category: 'BHXH & Thai Sản',
    question: 'Chồng có vợ sinh con được nghỉ chế độ thai sản bao nhiêu ngày?',
    answer: 'Lao động nam đang đóng BHXH khi vợ sinh con được nghỉ việc hưởng chế độ thai sản:\n• 05 ngày làm việc đối với sinh thường 1 con;\n• 07 ngày làm việc khi vợ sinh con phải phẫu thuật hoặc sinh con dưới 32 tuần tuổi;\n• 10 ngày làm việc trường hợp sinh đôi (mỗi con sinh thêm được nghỉ thêm 03 ngày làm việc);\n• 14 ngày làm việc trường hợp sinh đôi trở lên mà phải phẫu thuật.\nThời gian nghỉ này được tính trong khoảng thời gian 30 ngày đầu kể từ ngày vợ sinh con.',
    legalRef: 'Khoản 2 Điều 34 Luật Bảo hiểm xã hội 2014'
  },
  {
    category: 'BHXH & Thai Sản',
    question: 'Tiền lương làm căn cứ đóng BHXH bắt buộc gồm và không gồm những khoản nào?',
    answer: '• KHOẢN PHẢI ĐÓNG BHXH: Mức lương thỏa thuận, phụ cấp chức vụ, chức danh, phụ cấp trách nhiệm, phụ cấp khu vực, phụ cấp lưu động, và các khoản bổ sung khác xác định được mức tiền cụ thể cùng với mức lương.\n• KHOẢN KHÔNG PHẢI ĐÓNG BHXH: Tiền thưởng theo Điều 104 BLLĐ, tiền thưởng sáng kiến; tiền ăn giữa ca; các khoản hỗ trợ xăng xe, điện thoại, đi lại, tiền nhà ở, tiền giữ trẻ, nuôi con nhỏ; tiền hỗ trợ người lao động có thân nhân bị chết, có người thân kết hôn, sinh nhật...',
    legalRef: 'Thông tư 59/2015/TT-BLĐTBXH & Thông tư 06/2021/TT-BLĐTBXH'
  },
  {
    category: 'BHXH & Thai Sản',
    question: 'Điểm mới cốt lõi của Luật Bảo hiểm xã hội 2024 có hiệu lực từ 01/07/2025 là gì?',
    answer: '1. Giảm số năm đóng BHXH tối thiểu để được hưởng lương hưu từ 20 năm xuống 15 năm.\n2. Thay thế khái niệm "mức lương cơ sở" bằng "mức tham chiếu" để tính đóng và hưởng BHXH.\n3. Bổ sung chế độ trợ cấp thai sản cho người tham gia BHXH tự nguyện (2.000.000 đồng/con).\n4. Siết chặt xử lý nợ đọng, trốn đóng BHXH: phạt tiền lãi chậm đóng 0.03%/ngày và áp dụng biện pháp hoãn xuất cảnh đối với người đại diện theo pháp luật.',
    legalRef: 'Luật Bảo hiểm xã hội số 41/2024/QH15'
  },

  // 5. THUẾ THU NHẬP CÁ NHÂN (TNCN)
  {
    category: 'Thuế TNCN',
    question: 'Biểu thuế TNCN 5 bậc mới theo Luật Thuế TNCN 2025 áp dụng từ khi nào và gồm những bậc nào?',
    answer: 'Theo Luật Thuế thu nhập cá nhân 2025 (Luật số 109/2025/QH15) được Quốc hội thông qua:\n• THỜI ĐIỂM ÁP DỤNG: Biểu thuế lũy tiến từng phần 5 bậc đối với thu nhập từ tiền lương, tiền công được áp dụng từ KỲ TÍNH THUẾ NĂM 2026 (từ 01/01/2026). Các giai đoạn trước năm 2026 vẫn áp dụng biểu 7 bậc cũ.\n• CHI TIẾT 5 BẬC THUẾ (THÁNG):\n  - Bậc 1: Đến 10 triệu đồng/tháng: 5%\n  - Bậc 2: Trên 10 triệu đến 30 triệu đồng/tháng: 10% (trừ 0.5 triệu)\n  - Bậc 3: Trên 30 triệu đến 60 triệu đồng/tháng: 20% (trừ 3.5 triệu)\n  - Bậc 4: Trên 60 triệu đến 100 triệu đồng/tháng: 30% (trừ 9.5 triệu)\n  - Bậc 5: Trên 100 triệu đồng/tháng: 35% (trừ 14.5 triệu)\nBiểu 5 bậc giúp giãn khoảng cách thu nhập chịu thuế, giảm áp lực nhảy bậc và giảm nghĩa vụ thuế cho phần lớn người lao động.',
    legalRef: 'Luật Thuế thu nhập cá nhân năm 2025 (Luật số 109/2025/QH15)'
  },
  {
    category: 'Thuế TNCN',
    question: 'Mức giảm trừ gia cảnh thuế TNCN hiện hành cho bản thân và người phụ thuộc?',
    answer: 'Theo Nghị quyết 954/2020/UBTVQH14 của Ủy ban Thường vụ Quốc hội:\n• Mức giảm trừ đối với người nộp thuế (bản thân): 11 triệu đồng/tháng (132 triệu đồng/năm).\n• Mức giảm trừ đối với mỗi người phụ thuộc: 4,4 triệu đồng/tháng (52,8 triệu đồng/năm).\nNgười nộp thuế chỉ được tính giảm trừ cho người phụ thuộc khi đã đăng ký thuế và được cấp mã số thuế cho người phụ thuộc.',
    legalRef: 'Nghị quyết số 954/2020/UBTVQH14 & Thông tư 111/2013/TT-BTC'
  },
  {
    category: 'Thuế TNCN',
    question: 'Phụ cấp tiền ăn ca, ăn trưa được miễn thuế TNCN tối đa bao nhiêu tiền?',
    answer: 'Theo quy định thuế TNCN cập nhật và hướng dẫn tại Thông tư 111/2013/TT-BTC, trường hợp doanh nghiệp trả tiền ăn giữa ca trực tiếp vào tiền lương cho người lao động thì mức tiền ăn được miễn thuế TNCN tối đa là 1.200.000 đồng/người/tháng (1.2 triệu/tháng). Phần chi vượt quá 1.200.000 đồng/tháng phải cộng vào thu nhập chịu thuế TNCN. Trường hợp doanh nghiệp tự tổ chức bếp ăn tập thể, mua suất ăn công nghiệp hoặc cấp phiếu ăn thì toàn bộ chi phí thực tế phát sinh hợp lý được trừ khi tính thuế TNDN và người lao động được miễn hoàn toàn thuế TNCN mà không bị khống chế mức trần 1.2 triệu.',
    legalRef: 'Khoản 2 Điều 2 Thông tư 111/2013/TT-BTC & quy định định mức bữa ăn ca'
  },
  {
    category: 'Thuế TNCN',
    question: 'Hợp đồng dịch vụ cộng tác viên vãng lai khấu trừ thuế TNCN thế nào?',
    answer: 'Đối với cá nhân ký hợp đồng dịch vụ, cộng tác viên hoặc cá nhân kinh doanh không ký HĐLĐ (hoặc HĐLĐ dưới 03 tháng) có tổng mức trả thu nhập từ 2.000.000 đồng/lần trở lên thì doanh nghiệp phải khấu trừ thuế TNCN theo tỷ lệ 10% trên tổng thu nhập trước khi chi trả. Trường hợp cá nhân chỉ có duy nhất thu nhập thuộc đối tượng phải khấu trừ thuế theo tỷ lệ nêu trên nhưng ước tính tổng mức thu nhập chịu thuế sau khi trừ gia cảnh chưa đến mức phải nộp thuế thì được làm Bản cam kết Mẫu 08/CK-TNCN để tạm thời chưa bị khấu trừ 10%.',
    legalRef: 'Điểm i Khoản 1 Điều 25 Thông tư số 111/2013/TT-BTC'
  },
  {
    category: 'Thuế TNCN',
    question: 'Tiền thưởng Tết, thưởng tháng 13 có phải tính thuế TNCN và đóng BHXH không?',
    answer: '• VỀ THUẾ TNCN: Tiền thưởng Tết, tiền lương tháng 13 là khoản thu nhập có tính chất tiền lương, tiền công nên BẮT BUỘC PHẢI CHỊU THUẾ TNCN theo biểu thuế lũy tiến từng phần vào tháng thực tế chi trả.\n• VỀ BHXH: Tiền thưởng quy định tại Điều 104 BLLĐ (bao gồm thưởng Tết, thưởng doanh số, lương tháng 13) KHÔNG PHẢI TÍNH ĐÓNG BHXH BẮT BUỘC.',
    legalRef: 'Điều 104 BLLĐ 2019, Thông tư 111/2013/TT-BTC & Thông tư 06/2021/TT-BLĐTBXH'
  },

  // 6. BỒI DƯỠNG HIỆN VẬT & AN TOÀN VỆ SINH LAO ĐỘNG
  {
    category: 'Độc Hại Sữa',
    question: 'Khoản tiền bồi dưỡng độc hại có được trả bằng tiền mặt vào lương không?',
    answer: 'TUYỆT ĐỐI KHÔNG! Theo quy định tại Điều 3 Thông tư 24/2022/TT-BLĐTBXH, bồi dưỡng độc hại nguy hiểm bắt buộc phải thực hiện bằng HIỆN VẬT (sữa tươi, đường, nước hoa quả, bánh dinh dưỡng...) và phải cấp phát trực tiếp tại nơi làm việc trong ca làm việc. Nghiêm cấm trả bằng tiền mặt hoặc chuyển khoản gộp vào tiền lương.',
    legalRef: 'Thông tư 24/2022/TT-BLĐTBXH & Điều 103 BLLĐ 2019'
  },
  {
    category: 'Độc Hại Sữa',
    question: 'Bốn định mức bồi dưỡng bằng hiện vật theo Thông tư 24/2022/TT-BLĐTBXH?',
    answer: 'Bồi dưỡng hiện vật được tính theo định suất hàng ngày và có giá trị bằng tiền tương ứng theo 4 mức:\n• Mức 1: 13.000 đồng/ngày/người\n• Mức 2: 20.000 đồng/ngày/người\n• Mức 3: 26.000 đồng/ngày/người\n• Mức 4: 32.000 đồng/ngày/người.\nNếu làm việc từ 50% thời giờ làm việc bình thường của ngày thì được hưởng cả suất; làm việc dưới 50% thời giờ thì được hưởng 1/2 suất bồi dưỡng.',
    legalRef: 'Điều 4 Thông tư số 24/2022/TT-BLĐTBXH'
  },

  // 7. NGHỈ PHÉP & NGHỈ VIỆC RIÊNG
  {
    category: 'Nghỉ Phép & Khác',
    question: 'Quy định về ngày nghỉ phép năm và tăng phép theo thâm niên làm việc?',
    answer: 'Người lao động làm việc đủ 12 tháng cho một người sử dụng lao động thì được nghỉ hằng năm hưởng nguyên lương:\n• 12 ngày làm việc đối với người làm công việc trong điều kiện bình thường;\n• 14 ngày làm việc đối với người chưa thành niên, lao động là người khuyết tật, người làm nghề nặng nhọc, độc hại, nguy hiểm;\n• 16 ngày làm việc đối với người làm nghề đặc biệt nặng nhọc, độc hại, nguy hiểm.\nCứ đủ 05 năm làm việc cho một người sử dụng lao động thì số ngày nghỉ hằng năm được tăng thêm tương ứng 01 ngày.',
    legalRef: 'Điều 113, 114 Bộ luật Lao động 2019'
  },
  {
    category: 'Nghỉ Phép & Khác',
    question: 'Nghỉ việc riêng hưởng nguyên lương theo Điều 115 BLLĐ gồm những trường hợp nào?',
    answer: 'Người lao động được nghỉ việc riêng mà vẫn hưởng nguyên lương và phải thông báo với NSDLĐ trong các trường hợp sau:\n1. Kết hôn: nghỉ 03 ngày;\n2. Con đẻ, con nuôi kết hôn: nghỉ 01 ngày;\n3. Cha đẻ, mẹ đẻ, cha nuôi, mẹ nuôi; cha đẻ, mẹ đẻ, cha nuôi, mẹ nuôi của vợ hoặc chồng; vợ hoặc chồng; con đẻ, con nuôi chết: nghỉ 03 ngày.\nNgoài ra, được nghỉ không hưởng lương 01 ngày và phải thông báo với NSDLĐ khi ông nội, bà nội, ông ngoại, bà ngoại, anh, chị, em ruột chết; cha hoặc mẹ kết hôn; anh, chị, em ruột kết hôn.',
    legalRef: 'Điều 115 Bộ luật Lao động 2019'
  },
  {
    category: 'Nghỉ Phép & Khác',
    question: 'Thời gian nghỉ ngơi tối thiểu giữa 2 ca làm việc là bao nhiêu giờ?',
    answer: 'Người lao động làm việc theo ca được nghỉ ít nhất 12 giờ liên tục trước khi chuyển sang ca làm việc khác. Nếu ca làm việc liên tục từ 06 giờ trở lên thì được nghỉ giữa ca ít nhất 30 phút (ban ngày) hoặc 45 phút (ban đêm). Khoảng thời gian này bắt buộc phải được bố trí để đảm bảo tái tạo sức lao động.',
    legalRef: 'Điều 109, 110 Bộ luật Lao động 2019'
  },
  {
    category: 'Nghỉ Phép & Khác',
    question: 'Tiền tạm ứng chưa trả hết khi nhân viên nghỉ việc xử lý thế nào?',
    answer: 'Khi người lao động chấm dứt hợp đồng lao động, hai bên có trách nhiệm thanh toán đầy đủ các khoản tiền liên quan đến quyền lợi của mỗi bên trong thời hạn 14 ngày làm việc. Nếu nhân viên còn nợ tạm ứng hoặc tiền bồi thường thiệt hại, doanh nghiệp có quyền thỏa thuận khấu trừ trực tiếp vào các khoản thanh lý cuối cùng (tiền lương tháng cuối, trợ cấp thôi việc, tiền phép năm chưa nghỉ). Nếu vượt quá số tiền thanh lý, hai bên phải ký cam kết lộ trình hoàn trả dân sự.',
    legalRef: 'Điều 48, 102 Bộ luật Lao động 2019'
  },
  {
    category: 'Biến Động & Thủ Tục',
    question: 'Quy trình và điều kiện điều chuyển nhân sự sang làm công việc khác so với HĐLĐ?',
    answer: 'Theo Điều 29 Bộ luật Lao động 2019:\n1. Khi gặp khó khăn đột xuất do thiên tai, dịch bệnh, hoặc do nhu cầu sản xuất kinh doanh, NSDLĐ được quyền tạm thời chuyển NLĐ làm công việc khác so với HĐLĐ nhưng không quá 60 ngày làm việc cộng dồn trong 01 năm (nếu quá phải được NLĐ đồng ý bằng văn bản).\n2. NSDLĐ phải báo trước cho NLĐ ít nhất 03 ngày làm việc, thông báo rõ thời hạn và bố trí công việc phù hợp sức khỏe, giới tính.\n3. NLĐ được trả lương theo công việc mới; nếu lương mới thấp hơn lương cũ thì được giữ nguyên mức lương cũ trong 30 ngày làm việc. Lương mới ít nhất bằng 85% lương cũ và không thấp hơn lương tối thiểu vùng.',
    legalRef: 'Điều 29 Bộ luật Lao động 2019'
  },
  {
    category: 'Biến Động & Thủ Tục',
    question: 'Thay đổi lương, phụ cấp hoặc chức danh công việc cần lập thủ tục pháp lý gì?',
    answer: 'Theo Điều 33 Bộ luật Lao động 2019:\n1. Trong quá trình thực hiện HĐLĐ, nếu một bên muốn sửa đổi, bổ sung nội dung HĐLĐ (như mức lương, phụ cấp, chức danh, địa điểm làm việc) thì phải báo cho bên kia biết trước ít nhất 03 ngày làm việc về những nội dung cần sửa đổi.\n2. Khi hai bên đã thỏa thuận được thì việc sửa đổi, bổ sung được tiến hành bằng việc ký kết PHỤ LỤC HỢP ĐỒNG LAO ĐỘNG hoặc giao kết HỢP ĐỒNG LAO ĐỘNG MỚI.\n3. Doanh nghiệp ban hành đồng thời Quyết định nâng lương/điều chuyển nội bộ để làm căn cứ hạch toán chi phí lương hợp lý và cập nhật hồ sơ khai trình lao động, điều chỉnh mức đóng BHXH.',
    legalRef: 'Điều 22, 33 Bộ luật Lao động 2019'
  }
];

// Từ khóa chặn dữ liệu mật nội bộ

// =========================================================================
// KHO 50 CÂU HỎI & TRẢ LỜI: HỎI ĐÁP BẢNG CHẤM CÔNG & THÔNG TIN CÁ NHÂN
// Tuyệt đối không hỏi về lương, không tính công thức tiền lương
// Tách biệt rõ ràng: Bảng chấm công, Thông tin cá nhân, và chỉ trả lời phép khi được hỏi
// =========================================================================
export interface AttendanceProfileQA {
  category: string;
  question: string;
  answer: string;
  legalRef?: string;
}

const ATTENDANCE_PROFILE_KNOWLEDGE: AttendanceProfileQA[] = [
  // ── NHÓM 1: BẢNG CHẤM CÔNG & GIỜ LÀM VIỆC (14 CÂU) ──
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Hôm nay tôi đã quẹt vân tay chấm công vào ca thành công chưa?',
    answer: '🟢 TRẠNG THÁI CHẤM CÔNG HÔM NAY (09/09/2026):\n\n👤 Nhân viên: Nguyễn Văn Tuấn (Mã NV: AV-0342)\n• Giờ Check-in vào ca: 07:54:12 (Hợp lệ, trước giờ làm 6 phút).\n• Thiết bị ghi nhận: Máy vân tay Cổng 1 - Nhà máy An Việt Foods.\n• Ca làm việc: Ca 1 Hành chính (08:00 - 17:00).\n• Giờ Check-out dự kiến: 17:00:00 (Chưa đến giờ tan ca).\n✓ Kết quả: Đi làm đúng giờ, ghi nhận đủ 1.0 công làm việc.',
    legalRef: 'Dữ liệu máy chấm công thời gian thực & Điều 105 BLLĐ'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Tháng này tôi đã đi làm được bao nhiêu ngày công thực tế?',
    answer: '📊 TIẾN ĐỘ CHẤM CÔNG THÁNG 09/2026 (Tính đến hôm nay 09/09):\n\n• Số ngày công chuẩn của tháng: 26.0 ngày.\n• Số ngày công thực tế đã tích lũy: 7.5 ngày công.\n• Tỷ lệ hoàn thành tiến độ: 28.8% công tháng.\n• Đi muộn / về sớm: 0 lần (100% đúng giờ).\n• Giờ làm thêm (OT): 2.0 giờ ngày thường.\n✓ Bạn đang duy trì phong độ làm việc và kỷ luật giờ giấc xuất sắc!',
    legalRef: 'Dữ liệu chấm công trực tuyến Tháng 09/2026'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Tổng số ngày công chuẩn của tháng này là bao nhiêu ngày?',
    answer: '📅 QUY ĐỊNH NGÀY CÔNG CHUẨN THÁNG:\nTheo Bảng quy ước doanh nghiệp năm 2026, số ngày công chuẩn trong tháng được tính bằng tổng số ngày theo lịch trừ đi các ngày nghỉ hàng tuần (Chủ nhật):\n• Tháng 09/2026 có 30 ngày, gồm 4 ngày Chủ nhật nghỉ tuần.\n• Số ngày công chuẩn: 26.0 ngày.\n• Hoàn thành từ 26.0 ngày công trở lên: Đạt 100% chỉ tiêu chuyên cần của tháng.',
    legalRef: 'Bảng quy ước doanh nghiệp & Điều 111 BLLĐ 2019'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Hôm nay tôi có bị tính đi muộn hoặc về sớm không?',
    answer: '✓ XÁC NHẬN: Hôm nay bạn HOÀN TOÀN KHÔNG BỊ TÍNH ĐI MUỘN hay về sớm!\n• Giờ quẹt vào ca: 07:54:12 (Quy định bắt đầu ca: 08:00).\n• Thời gian đến sớm: 6 phút.\n• Trạng thái: Hợp lệ, đạt tiêu chuẩn chấm công chuẩn xác.',
    legalRef: 'Nhật ký máy quẹt vân tay Cổng 1'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Tháng này tôi có bị ghi nhận lần nào đi muộn hoặc về sớm không?',
    answer: '✓ BÁO CÁO GIỜ GIẤC THÁNG 09/2026:\n• Số lần đi muộn: 0 lần.\n• Số lần về sớm: 0 lần.\n• Giờ quẹt vân tay buổi sáng luôn nằm trong khung 07:45 - 07:55.\n• Bạn đủ điều kiện hưởng 100% Phụ cấp chuyên cần của tháng!',
    legalRef: 'Báo cáo vi phạm chấm công kỳ Tháng 09/2026'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Lịch phân ca tuần này của tôi như thế nào?',
    answer: '🗓️ LỊCH PHÂN CA TUẦN HIỆN TẠI (Tuần 37/2026):\n\n• Thứ Hai (07/09): Ca 1 (08:00 - 17:00) - Đã hoàn thành (8.0h)\n• Thứ Ba (08/09): Ca 1 (08:00 - 17:00) - Đã hoàn thành (8.0h)\n• Thứ Tư (09/09 - Hôm nay): Ca 1 (08:00 - 17:00) - Đang làm việc\n• Thứ Năm (10/09): Ca 1 (08:00 - 17:00)\n• Thứ Sáu (11/09): Ca 1 (08:00 - 17:00)\n• Thứ Bảy (12/09): Ca sáng (08:00 - 12:00)\n• Chủ Nhật (13/09): NGHỈ HÀNG TUẦN THEO CHẾ ĐỘ\nBạn có thể mở phân hệ "10. Chấm Công & Phân Ca" để xem chi tiết ma trận cả tháng.',
    legalRef: 'Lịch phân ca xưởng số 37/2026'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Tôi làm việc theo ca kíp nào, giờ vào ca và tan ca quy định ra sao?',
    answer: '⏰ QUY ĐỊNH GIỜ GIẤC CA LÀM VIỆC CỦA BẠN:\n• Vị trí: Kỹ thuật viên vận hành chuyền chế biến.\n• Chế độ phân ca: Ca 1 Hành chính luân phiên.\n• Giờ vào ca sáng: 08:00:00 (Yêu cầu có mặt quẹt thẻ trước 07:55).\n• Giờ nghỉ trưa & ăn cơm ca: 12:00 - 13:00 (Nghỉ giữa giờ 60 phút có bố trí nhà ăn ca).\n• Giờ tan ca chiều: 17:00:00.\n• Tổng thời gian làm việc tiêu chuẩn: 8.0 giờ/ngày.',
    legalRef: 'Nội quy lao động công ty - Mục Thời giờ làm việc'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Thời gian nghỉ giữa 2 ca của tôi có đảm bảo đủ 12 tiếng theo Điều 110 BLLĐ không?',
    answer: '🛡️ KIỂM TRA TUÂN THỦ ĐIỀU 110 BỘ LUẬT LAO ĐỘNG:\n• Quy định pháp luật: Người lao động làm việc theo ca được nghỉ ít nhất 12 giờ liên tục trước khi chuyển sang ca làm việc khác.\n• Lịch làm việc của bạn: Ca làm việc được sắp xếp cách nhau từ 15 đến 24 tiếng giữa hai ca liên tiếp.\n• Kết luận: Đảm bảo 100% tuân thủ quy định an toàn sức khỏe lao động, không có tình trạng đảo ca gấp.',
    legalRef: 'Điều 110 Bộ luật Lao động 2019'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Quy định về giờ làm việc ban đêm được tính từ mấy giờ đến mấy giờ?',
    answer: '🌙 KHUNG GIỜ LÀM VIỆC BAN ĐÊM THEO LUẬT:\nTheo Điều 106 Bộ luật Lao động 2019:\n• Giờ làm việc ban đêm được tính từ 22:00 hôm trước đến 06:00 sáng hôm sau.\n• Khi bạn được phân công làm việc trong khung giờ này, hệ thống chấm công sẽ tự động tách riêng số giờ làm đêm (Night Shift Hours) để làm căn cứ tính phụ cấp ca đêm theo đúng quy định.',
    legalRef: 'Điều 106 Bộ luật Lao động 2019'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Số giờ làm việc ca đêm trong tháng của tôi được ghi nhận là bao nhiêu tiếng?',
    answer: '🌙 DỮ LIỆU LÀM VIỆC CA ĐÊM THÁNG 08/2026 (Kỳ gần nhất):\n• Số ca đêm đã trực: 2 ca.\n• Tổng số giờ làm việc trong khung 22:00 - 06:00: 16.0 giờ.\n• Số giờ làm thêm (OT) ban đêm: 2.5 giờ.\n✓ Hệ thống đã ghi nhận đầy đủ thẻ quẹt tại cửa xưởng ca 3, dữ liệu chuẩn xác 100%.',
    legalRef: 'Báo cáo giờ ca đêm Phân xưởng Chế biến'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Nếu quên quẹt thẻ chấm công tôi phải làm đơn giải trình thế nào?',
    answer: '📝 HƯỚNG DẪN NỘP ĐƠN GIẢI TRÌNH QUÊN QUẸT THẺ:\n1. Vào phân hệ "11. Đăng Ký & Phê Duyệt" trên điện thoại hoặc máy tính.\n2. Bấm "Tạo Đơn Mới" -> Chọn loại đơn: "Giải trình bổ sung công".\n3. Chọn ngày quên quẹt, chọn bổ sung Giờ Vào hoặc Giờ Ra, nêu rõ lý do (ví dụ: máy nghẽn mạng, bận bàn giao ca gấp).\n4. Thời hạn nộp: Trong vòng 24 giờ kể từ thời điểm phát sinh.\n5. Sau khi Quản đốc ca duyệt, hệ thống sẽ tự động cập nhật đủ 1.0 ngày công cho bạn.',
    legalRef: 'Quy trình giải trình chấm công nội bộ'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Hôm nay tôi quẹt thẻ tại cổng nào và bằng phương thức gì?',
    answer: '📱 THÔNG TIN THIẾT BỊ ĐIỂM DANH HÔM NAY:\n• Điểm chấm: Máy chấm công sinh trắc học Cổng 1 (Khu vực bảo vệ chính).\n• Phương thức: Quẹt vân tay quang học kết hợp nhận diện khuôn mặt AI (Face ID).\n• Thời gian ghi nhận: 07:54:12 ngày 09/09/2026.\n• Địa chỉ IP máy chấm công: 192.168.1.105 (Mạng nội bộ nhà máy An Việt Foods).\n✓ Ghi nhận hợp lệ tại vị trí làm việc.',
    legalRef: 'Log kiểm soát máy chấm công trung tâm'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Điều kiện để đạt 100% chuyên cần trong tháng là gì?',
    answer: '🎯 TIÊU CHUẨN ĐẠT PHỤ CẤP CHUYÊN CẦN:\nTheo Nội quy lao động và Bảng quy ước doanh nghiệp:\n1. Đi làm đủ 100% số ngày công chuẩn trong tháng (không nghỉ không lương, không nghỉ việc riêng trừ trường hợp kết hôn/tang chế theo luật).\n2. Không đi muộn hoặc về sớm quá 2 lần trong tháng (mỗi lần không quá 15 phút và có đơn giải trình).\n3. Tuân thủ đầy đủ quẹt thẻ vào/ra ở mỗi ca làm việc.\n✓ Khi đạt các điều kiện trên, bạn sẽ được xếp loại Chuyên cần Loại A.',
    legalRef: 'Quy chế đánh giá chuyên cần doanh nghiệp'
  },
  {
    category: 'Chấm Công & Giờ Làm',
    question: 'Tỷ lệ hoàn thành ngày công của tôi từ đầu tháng đến nay đạt bao nhiêu %?',
    answer: '📈 TỶ LỆ HOÀN THÀNH NGÀY CÔNG:\n• Số ngày công yêu cầu theo lịch tính đến ngày 09/09: 7.5 ngày.\n• Số ngày công bạn đã đi làm thực tế: 7.5 ngày.\n• TỶ LỆ HOÀN THÀNH: 100% (Đạt tuyệt đối theo tiến độ sản xuất).\n✓ Không có ngày công nào bị gián đoạn hay thiếu hụt.',
    legalRef: 'Tiến độ chấm công tuần 37/2026'
  },

  // ── NHÓM 2: TRA CỨU CÔNG & GIỜ OT TỪNG THÁNG (THÁNG 1 - 9 & CẢ NĂM) (12 CÂU) ──
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Thống kê chi tiết ngày công và giờ OT của tôi trong Tháng 1/2026?',
    answer: '📊 BẢNG THỐNG KÊ CHẤM CÔNG THÁNG 01/2026:\n\n• Số ngày công chuẩn: 25.0 ngày.\n• Số ngày công thực tế đi làm: 25.0 ngày (Đạt 100% chỉ tiêu).\n• Tổng giờ làm việc tiêu chuẩn: 200.0 giờ.\n• Tổng giờ làm thêm (OT): 10.0 giờ:\n  - OT ngày thường: 6.0 giờ\n  - OT ngày nghỉ cuối tuần: 4.0 giờ\n• Đi muộn / về sớm: 0 lần.\n✓ Trạng thái: Hoàn thành kỳ công xuất sắc.',
    legalRef: 'Báo cáo chốt công kỳ Tháng 01/2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Thống kê ngày công và số giờ tăng ca OT của tôi trong Tháng 2/2026?',
    answer: '📊 BẢNG THỐNG KÊ CHẤM CÔNG THÁNG 02/2026 (Kỳ Tết Nguyên Đán):\n\n• Số ngày công chuẩn: 20.0 ngày (Trừ 5 ngày nghỉ Tết hưởng chế độ).\n• Số ngày công đi làm thực tế: 19.0 ngày.\n• Nghỉ Tết Nguyên Đán: 5.0 ngày theo lịch Nhà nước.\n• Số giờ làm thêm (OT trực Tết): 8.0 giờ (Trực kỹ thuật vận hành).\n• Đi trễ / về sớm: 0 lần.\n✓ Trạng thái: Đã chốt công hợp lệ.',
    legalRef: 'Báo cáo chốt công kỳ Tháng 02/2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Thống kê ngày công và giờ làm thêm OT của tôi trong Tháng 3/2026?',
    answer: '📊 BẢNG THỐNG KÊ CHẤM CÔNG THÁNG 03/2026:\n\n• Số ngày công chuẩn: 26.0 ngày.\n• Số ngày công đi làm thực tế: 26.0 ngày (Đạt 100% công chuẩn).\n• Giờ làm việc tiêu chuẩn: 208.0 giờ.\n• Số giờ làm thêm (OT): 4.5 giờ ngày thường.\n• Đi muộn: 1 lần (10 phút ngày 12/03, đã nộp đơn giải trình hợp lệ).\n• Về sớm: 0 lần.\n✓ Trạng thái: Đạt chuyên cần Loại A.',
    legalRef: 'Báo cáo chốt công kỳ Tháng 03/2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Thống kê số ngày công và giờ OT của tôi trong Tháng 4/2026?',
    answer: '📊 BẢNG THỐNG KÊ CHẤM CÔNG THÁNG 04/2026:\n\n• Số ngày công chuẩn: 25.0 ngày (Nghỉ lễ Giỗ Tổ & 30/04 hưởng chế độ).\n• Số ngày công đi làm thực tế: 25.0 ngày.\n• Số giờ làm thêm (OT): 5.0 giờ ngày thường.\n• Đi muộn / về sớm: 0 lần.\n✓ Trạng thái: Hoàn thành 100% ngày công kế hoạch.',
    legalRef: 'Báo cáo chốt công kỳ Tháng 04/2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Tháng 5/2026 tôi đi làm bao nhiêu ngày công, có bị trừ công ngày nào không?',
    answer: '📊 BẢNG THỐNG KÊ CHẤM CÔNG THÁNG 05/2026:\n\n• Số ngày công chuẩn: 25.0 ngày (Nghỉ lễ 01/05 hưởng chế độ).\n• Số ngày công thực tế đi làm: 25.0 ngày.\n• BỊ TRỪ CÔNG: 0 ngày (Không bị trừ bất kỳ ngày công nào).\n• Số giờ làm thêm (OT): 4.0 giờ.\n• Đi trễ / về sớm: 0 lần.\n✓ Bạn được tính đủ 100% ngày công làm việc.',
    legalRef: 'Báo cáo chốt công kỳ Tháng 05/2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Thống kê chi tiết ngày công và giờ OT của tôi trong Tháng 6/2026?',
    answer: '📊 BẢNG THỐNG KÊ CHẤM CÔNG THÁNG 06/2026:\n\n• Số ngày công chuẩn: 26.0 ngày.\n• Số ngày công đi làm thực tế: 24.0 ngày.\n• Số giờ làm thêm (OT): 3.5 giờ ngày thường.\n• Đi trễ / về sớm: 0 lần.\n✓ Trạng thái kỳ công: Hoàn thành tốt nhiệm vụ sản xuất.',
    legalRef: 'Báo cáo chốt công kỳ Tháng 06/2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Thống kê số ngày công và giờ tăng ca OT của tôi trong Tháng 7/2026?',
    answer: '📊 BẢNG THỐNG KÊ CHẤM CÔNG THÁNG 07/2026:\n\n• Số ngày công chuẩn: 27.0 ngày.\n• Số ngày công đi làm thực tế: 27.0 ngày (Đạt 100% chỉ tiêu).\n• TỔNG GIỜ LÀM THÊM (OT): 7.5 giờ:\n  - OT ngày thường: 5.0 giờ\n  - OT ca đêm: 2.5 giờ\n• Đi muộn: 0 lần.\n• Về sớm: 0 lần.\n✓ Đạt chuyên cần xuất sắc trong tháng cao điểm hè.',
    legalRef: 'Báo cáo chốt công kỳ Tháng 07/2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Cho tôi xem tổng kết ngày công, đi muộn và giờ OT trong Tháng 8/2026?',
    answer: '📊 BẢNG THỐNG KÊ CHẤM CÔNG THÁNG 08/2026 (Kỳ vừa qua):\n\n• Số ngày công chuẩn: 26.0 ngày.\n• Số ngày công đi làm thực tế: 25.5 ngày.\n• Tăng ca (OT): 4.5 giờ.\n• Đi muộn: 1 lần (15 phút ngày 08/08, Quản lý đã duyệt đơn giải trình hợp lệ).\n• Về sớm: 0 lần.\n✓ Bảng chấm công tháng 8 đã được phòng HCNS khóa sổ và lưu trữ.',
    legalRef: 'Báo cáo chốt công kỳ Tháng 08/2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Tiến độ ngày công và số giờ OT của tôi trong Tháng 9/2026 hiện tại?',
    answer: '📊 TIẾN ĐỘ CHẤM CÔNG THÁNG 09/2026 (Tính đến hôm nay 09/09):\n\n• Tổng ngày công chuẩn tháng 9: 26.0 ngày.\n• Số ngày công đã hoàn thành: 7.5 ngày.\n• Làm thêm giờ (OT): 2.0 giờ ngày thường.\n• Đi muộn / về sớm: 0 lần.\n• Số ngày công còn lại cần hoàn thành trong tháng: 18.5 ngày.\n✓ Tiến độ duy trì ổn định!',
    legalRef: 'Dữ liệu chấm công trực tuyến Tháng 09/2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Thống kê tổng số ngày công tôi đã đi làm từ đầu năm đến nay là bao nhiêu?',
    answer: '🏆 THỐNG KÊ NGÀY CÔNG TỔNG HỢP TỪ ĐẦU NĂM 2026 (Tháng 1 - Tháng 9):\n\n• TỔNG SỐ NGÀY CÔNG ĐI LÀM THỰC TẾ: 204.0 ngày công.\n• TỔNG SỐ NGÀY NGHỈ LỄ TẾT HƯỞNG NGUYÊN LƯƠNG: 11.0 ngày.\n• TỔNG GIỜ LÀM THÊM (OT) TOÀN BỘ NĂM: 41.0 giờ.\n• TỔNG SỐ LẦN ĐI MUỘN: 2 lần (đều có đơn giải trình hợp lệ).\n• TỶ LỆ HOÀN THÀNH CHỈ TIÊU CÔNG: 99.2%.\n✓ Bạn thuộc Top 10% nhân sự có kỷ luật lao động cao nhất phân xưởng!',
    legalRef: 'Tổng hợp dữ liệu chấm công năm 2026'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'Tổng số giờ làm thêm (OT) tôi đã tích lũy từ đầu năm đến nay là bao nhiêu?',
    answer: '⏱️ TỔNG HỢP GIỜ LÀM THÊM (OT) NĂM 2026:\n\n• Tổng số giờ OT đã làm: 41.0 giờ.\n• Phân loại chi tiết:\n  - OT ngày làm việc bình thường: 29.0 giờ\n  - OT ngày nghỉ Chủ nhật: 4.0 giờ\n  - OT trực dịp Lễ, Tết: 8.0 giờ\n• Hạn mức theo luật quy định: Tối đa 200 giờ/năm (trường hợp đặc biệt không quá 300 giờ/năm theo Điều 107 BLLĐ).\n✓ Bạn đã sử dụng 41/200 giờ, hoàn toàn nằm trong giới hạn an toàn sức khỏe lao động.',
    legalRef: 'Điều 107 Bộ luật Lao động 2019'
  },
  {
    category: 'Tra Cứu Từng Tháng',
    question: 'So sánh số ngày công giữa các tháng từ Tháng 1 đến Tháng 8/2026 của tôi?',
    answer: '📈 BẢNG SO SÁNH NGÀY CÔNG 8 THÁNG ĐẦU NĂM 2026:\n\n• Tháng 1: 25.0 công | OT: 10.0h\n• Tháng 2: 19.0 công | OT: 8.0h (Tết)\n• Tháng 3: 26.0 công | OT: 4.5h\n• Tháng 4: 25.0 công | OT: 5.0h\n• Tháng 5: 25.0 công | OT: 4.0h\n• Tháng 6: 24.0 công | OT: 3.5h\n• Tháng 7: 27.0 công | OT: 7.5h\n• Tháng 8: 25.5 công | OT: 4.5h\n= BÌNH QUÂN: 24.5 ngày công/tháng (Chỉ số làm việc rất đều đặn và ổn định).',
    legalRef: 'Dữ liệu tổng hợp từ Bảng Chấm Công 2026'
  },

  // ── NHÓM 3: THÔNG TIN HỒ SƠ CÁ NHÂN & HỢP ĐỒNG (12 CÂU) ──
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Mã nhân viên và chức vụ hiện tại của tôi trong hệ thống là gì?',
    answer: '👤 THÔNG TIN ĐỊNH DANH NHÂN SỰ CỦA BẠN:\n\n• Họ và tên: NGUYỄN VĂN TUẤN\n• Mã nhân viên: AV-0342\n• Chức vụ: Kỹ thuật viên vận hành dây chuyền chế biến\n• Cấp bậc chuyên môn: Bậc 3/5 (Kỹ thuật viên chính)\n• Bộ phận trực thuộc: Phân Xưởng Chế Biến Thực Phẩm\n• Khối: Khối Nhà Máy Sản Xuất Dĩ An\n✓ Trạng thái nhân sự: Đang làm việc chính thức.',
    legalRef: 'Hồ sơ nhân sự điện tử Core HR'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Tôi đang trực thuộc phòng ban, phân xưởng nào và làm ở tổ nào?',
    answer: '🏢 VỊ TRÍ TỔ CHỨC & PHÒNG BAN:\n\n• Doanh nghiệp: Công ty Cổ phần Chế Biến Thực Phẩm An Việt (An Việt Foods)\n• Phân xưởng: Phân Xưởng Chế Biến 01\n• Tổ công tác: Tổ Vận Hành Thiết Bị & Tiệt Trùng UHT\n• Địa điểm làm việc: Lô B2, KCN Sóng Thần 2, Dĩ An, Bình Dương\n• Vị trí bàn giao tủ đồ cá nhân: Tủ Locker số 42 - Nhà thay đồ Xưởng 1.',
    legalRef: 'Sơ đồ tổ chức phân xưởng năm 2026'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Ai là cấp quản lý trực tiếp duyệt đơn từ chấm công của tôi?',
    answer: '👔 CẤP QUẢN LÝ TRỰC TIẾP CỦA BẠN:\n\n• Quản lý trực tiếp (Người duyệt cấp 1): Ông Trần Văn Nam\n• Chức vụ: Quản Đốc Phân Xưởng Chế Biến (Mã NV: AV-0089)\n• Người phê duyệt cấp 2 (HR): Bà Trần Thị Thu Trang - Trưởng Phòng HCNS\n• Khi bạn nộp đơn xin ra cổng, đổi ca, hoặc giải trình chấm công trên hệ thống, thông báo sẽ được gửi tự động đến ứng dụng của Quản Đốc Nam.',
    legalRef: 'Ma trận phân quyền duyệt Workflow'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Ngày vào công ty chính thức và thâm niên công tác của tôi là bao lâu?',
    answer: '⏳ THÂM NIÊN LÀM VIỆC TẠI AN VIỆT FOODS:\n\n• Ngày nhận việc thử việc: 15/01/2021\n• Ngày ký Hợp đồng chính thức: 15/03/2021\n• Thâm niên công tác tính đến hôm nay: 5 năm 5 tháng (Đã vượt mốc 5 năm).\n• Quyền lợi thâm niên: Đã được cộng thêm +1.0 ngày phép năm thâm niên theo Điều 114 Bộ luật Lao động 2019.',
    legalRef: 'Hồ sơ nhân sự gốc & Điều 114 BLLĐ'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Số hợp đồng lao động và loại hợp đồng hiện tại của tôi?',
    answer: '📄 HỢP ĐỒNG LAO ĐỘNG HIỆN HÀNH:\n\n• Số hợp đồng: HĐLĐ-2023/0342-AVF\n• Loại hợp đồng: HỢP ĐỒNG LAO ĐỘNG KHÔNG XÁC ĐỊNH THỜI HẠN (Hợp đồng vô thời hạn)\n• Ngày ký kết: 15/03/2023 (Chuyển tiếp sau khi hết hạn HĐLĐ xác định thời hạn 24 tháng lần 1)\n• Người đại diện công ty ký: Ông Nguyễn Văn Hùng - Tổng Giám Đốc\n• Phương thức ký: Ký số điện tử OTP xác thực CCCD.',
    legalRef: 'Điều 20 Bộ luật Lao động 2019'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Hợp đồng lao động của tôi có thời hạn đến ngày nào thì hết hạn?',
    answer: '✓ THỜI HẠN HỢP ĐỒNG LAO ĐỘNG:\nHợp đồng hiện tại của bạn là HỢP ĐỒNG KHÔNG XÁC ĐỊNH THỜI HẠN, do đó:\n• Hợp đồng KHÔNG CÓ NGÀY HẾT HẠN.\n• Hợp đồng có hiệu lực pháp lý liên tục cho đến khi hai bên có thỏa thuận chấm dứt hoặc nghỉ việc theo luật định.\n• Bạn hoàn toàn yên tâm về tính ổn định và bảo đảm công việc lâu dài tại Công ty!',
    legalRef: 'Điều 20 Bộ luật Lao động 2019'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Mã số thuế thu nhập cá nhân (MST) của tôi trong hồ sơ là gì?',
    answer: '🏛️ THÔNG TIN THUẾ THU NHẬP CÁ NHÂN:\n\n• Mã số thuế TNCN: 8402918274\n• Tên người nộp thuế: NGUYỄN VĂN TUẤN\n• Cơ quan thuế quản lý: Chi cục Thuế Thành phố Dĩ An - Tỉnh Bình Dương\n• Trạng thái mã số thuế: Đang hoạt động, đã chuẩn hóa theo số Căn cước công dân gắn chip.',
    legalRef: 'Hồ sơ kê khai thuế TNCN ngành thuế'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Số sổ Bảo hiểm xã hội (BHXH) của tôi là số mấy?',
    answer: '🪪 THÔNG TIN BẢO HIỂM XÃ HỘI & VSSID:\n\n• Mã số BHXH / Số sổ: 7420198273\n• Cơ quan BHXH quản lý: Bảo hiểm xã hội Tỉnh Bình Dương\n• Thời gian tham gia BHXH tại công ty: Liên tục từ tháng 03/2021 đến nay (66 tháng).\n• Bạn có thể dùng mã số BHXH này để đăng nhập ứng dụng VssID tra cứu quá trình đóng.',
    legalRef: 'Dữ liệu trích nộp BHXH điện tử'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Nơi đăng ký khám chữa bệnh ban đầu trên thẻ BHYT của tôi ở đâu?',
    answer: '🏥 CƠ SỞ KHÁM CHỮA BỆNH BHYT BAN ĐẦU:\n\n• Mã cơ sở KCB: 74-042\n• Tên cơ sở y tế: Bệnh Viện Đa Khoa Quốc Tế Becamex\n• Địa chỉ: Đại lộ Bình Dương, Khu phố Lái Thiêu, TP. Thuận An, Tỉnh Bình Dương\n• Hạn sử dụng thẻ BHYT: Đang có giá trị sử dụng liên tục (Tra cứu bằng CCCD khi đi khám bệnh).',
    legalRef: 'Dữ liệu cấp thẻ BHYT năm 2026'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Tôi đã đăng ký bao nhiêu người phụ thuộc giảm trừ gia cảnh?',
    answer: '👨‍👩‍👧‍👦 THÔNG TIN NGƯỜI PHỤ THUỘC ĐÃ ĐĂNG KÝ:\n\n• Tổng số người phụ thuộc: 02 người\n• Chi tiết:\n  1. Nguyễn Minh Khang (Con đẻ - Sinh năm 2018, MST người phụ thuộc: 8829104812)\n  2. Lê Thị Mai (Mẹ đẻ ngoài độ tuổi lao động - Sinh năm 1958, MST: 8491029471)\n• Hồ sơ chứng minh người phụ thuộc đã được Phòng Nhân sự nộp đầy đủ cho Cơ quan Thuế.',
    legalRef: 'Thông tư 111/2013/TT-BTC & Hồ sơ giảm trừ'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Thông tin số tài khoản ngân hàng nhận lương của tôi?',
    answer: '💳 TÀI KHOẢN NGÂN HÀNG TRẢ LƯƠNG:\n\n• Chủ tài khoản: NGUYEN VAN TUAN\n• Số tài khoản: 1029384756\n• Tên ngân hàng: Ngân Hàng TMCP Ngoại Thương Việt Nam (Vietcombank)\n• Chi nhánh: Chi nhánh KCN Sóng Thần - Phòng giao dịch Dĩ An\n✓ Đây là tài khoản đăng ký chính thức trên hệ thống chi trả lương của công ty.',
    legalRef: 'Hồ sơ thông tin thanh toán cá nhân'
  },
  {
    category: 'Thông Tin Cá Nhân',
    question: 'Số điện thoại và địa chỉ email công vụ của tôi trong hồ sơ?',
    answer: '📞 THÔNG TIN LIÊN HỆ CỦA BẠN:\n\n• Số điện thoại di động: 0918.234.892 (Dùng nhận mã OTP ký số và nhận thông báo HRM)\n• Email công vụ: tuan.nguyen@antfood.vn\n• Địa chỉ thường trú: Phường Dĩ An, Thành phố Dĩ An, Tỉnh Bình Dương\n• Người liên hệ khẩn cấp: Chị Lê Thị Thảo (Vợ - SĐT: 0917.882.114).',
    legalRef: 'Hồ sơ nhân sự Core HR'
  },

  // ── NHÓM 4: NGHỈ PHÉP & ĐƠN TỪ (CHỈ KHI ĐƯỢC HỎI ĐÚNG VỀ PHÉP) (12 CÂU) ──
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Tôi được hưởng bao nhiêu ngày phép năm trong năm 2026?',
    answer: '🏖️ TỔNG QUỸ PHÉP NĂM 2026 CỦA BẠN:\n\n• Phép tiêu chuẩn năm: 12.0 ngày.\n• Phép thâm niên (đủ 5 năm làm việc theo Điều 114 BLLĐ): +1.0 ngày.\n• Phép tồn năm 2025 chuyển sang: +2.0 ngày.\n= TỔNG QUỸ PHÉP ĐƯỢC HƯỞNG NĂM 2026: 15.0 ngày.',
    legalRef: 'Điều 113, 114 Bộ luật Lao động 2019'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Tôi đã sử dụng bao nhiêu ngày phép năm rồi?',
    answer: '📋 SỐ NGÀY PHÉP ĐÃ SỬ DỤNG TRONG NĂM 2026:\n\n• Tổng số ngày phép đã nghỉ: 3.5 ngày.\n• Chi tiết các đợt nghỉ:\n  - Đợt 1 (02/2026): 1.0 ngày kết hợp nghỉ Tết\n  - Đợt 2 (06/2026): 2.0 ngày nghỉ hè cùng gia đình\n  - Đợt 3 (08/2026): 0.5 ngày giải quyết việc riêng gia đình\n✓ Tất cả các đợt nghỉ đều đã được Quản đốc xưởng phê duyệt hợp lệ trên hệ thống.',
    legalRef: 'Dữ liệu phân hệ 11. Đăng Ký & Phê Duyệt'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Số ngày phép năm còn tồn hiện tại của tôi là bao nhiêu ngày?',
    answer: '🏖️ SỐ NGÀY PHÉP TỒN HIỆN TẠI:\n\n• Tổng quỹ phép được hưởng: 15.0 ngày.\n• Số ngày đã nghỉ: 3.5 ngày.\n= SỐ NGÀY PHÉP CÒN TỒN: 11.5 ngày.\n💡 Bạn có thể chủ động nộp đơn xin nghỉ cho các kế hoạch cá nhân từ nay đến cuối năm!',
    legalRef: 'Điều 113, 114 BLLĐ 2019'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Hạn chót sử dụng số ngày phép tồn năm trước chuyển sang là ngày nào?',
    answer: '⏰ QUY ĐỊNH HẠN SỬ DỤNG PHÉP TỒN NĂM CŨ:\nTheo khoản 4 Điều 113 BLLĐ 2019 và Thỏa ước lao động tập thể công ty:\n• HẠN CHÓT SỬ DỤNG PHÉP TỒN: Đến hết ngày 31/03 của năm kế tiếp.\n• Đối với phép tồn năm 2025: Hạn chót đã sử dụng là 31/03/2026.\n• Đối với số phép chưa nghỉ của năm 2026: Sẽ được bảo lưu sử dụng đến hết ngày 31/03/2027.',
    legalRef: 'Khoản 4 Điều 113 BLLĐ 2019'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Tôi có được cộng thêm ngày phép thâm niên khi làm việc đủ 5 năm không?',
    answer: '✓ CÓ ĐƯỢC CỘNG THÊM 01 NGÀY THEO ĐÚNG ĐIỀU 114 BLLĐ!\nTheo Điều 114 Bộ luật Lao động 2019: Cứ đủ 05 năm làm việc cho một người sử dụng lao động thì số ngày nghỉ hằng năm của người lao động được tăng thêm tương ứng 01 ngày.\n• Từ năm 1 - 5: 12 ngày phép.\n• Từ năm 6 - 10: 13 ngày phép (+1 ngày thâm niên).\nHồ sơ của bạn đã đủ 5 năm làm việc và hệ thống HRM đã tự động cộng thêm 1 ngày phép thâm niên vào quỹ phép.',
    legalRef: 'Điều 114 Bộ luật Lao động 2019'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Nghỉ việc riêng hưởng nguyên lương (kết hôn, tang chế) được bao nhiêu ngày theo luật?',
    answer: '💍 CHẾ ĐỘ NGHỈ VIỆC RIÊNG HƯỞNG NGUYÊN LƯƠNG 100% (Điều 115 BLLĐ):\n1. Bản thân kết hôn: Được nghỉ 03 ngày làm việc.\n2. Con đẻ, con nuôi kết hôn: Được nghỉ 01 ngày làm việc.\n3. Cha đẻ, mẹ đẻ, cha nuôi, mẹ nuôi; cha mẹ vợ/chồng; vợ hoặc chồng; con đẻ, con nuôi chết: Được nghỉ 03 ngày làm việc.\n✓ Các ngày nghỉ này KHÔNG BỊ TRỪ VÀO PHÉP NĂM và được tính hưởng nguyên lương.',
    legalRef: 'Điều 115 Bộ luật Lao động 2019'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Nếu nghỉ không hưởng lương thì có bị trừ vào ngày phép năm không?',
    answer: '📌 QUY ĐỊNH NGHỈ KHÔNG HƯỞNG LƯƠNG:\n• Nghỉ không hưởng lương KHÔNG làm trừ vào quỹ ngày phép năm của bạn (trừ khi bạn chủ động chọn hình thức trừ vào phép năm khi nộp đơn).\n• Tuy nhiên, ngày nghỉ không lương sẽ không được hưởng lương ngày công và có thể ảnh hưởng đến tỷ lệ đạt chuyên cần tháng.',
    legalRef: 'Điều 115 Bộ luật Lao động 2019'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Quy định nộp đơn xin nghỉ phép năm trước bao nhiêu ngày?',
    answer: '🗓️ THỜI HẠN NỘP ĐƠN NGHỈ PHÉP NĂM:\nTheo Nội quy lao động của công ty:\n• Nghỉ từ 01 - 02 ngày: Nộp đơn trên HRM trước ít nhất 24 giờ.\n• Nghỉ từ 03 - 05 ngày: Nộp đơn trước ít nhất 03 ngày làm việc.\n• Nghỉ từ 06 ngày trở lên: Nộp đơn trước ít nhất 07 ngày làm việc để Quản lý xưởng sắp xếp nhân sự thay thế trên dây chuyền.',
    legalRef: 'Nội quy lao động công ty AntFood'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Đơn xin ra cổng trong giờ làm việc của tôi đã được duyệt chưa?',
    answer: '🚪 TRẠNG THÁI ĐƠN RA CỔNG GẦN NHẤT:\n• Mã đơn: REQ-GATE-0882\n• Mục đích: Việc công ty (Giao nhận hồ sơ kiểm định)\n• Trạng thái: ĐÃ ĐƯỢC PHÊ DUYỆT bởi Quản Đốc Trần Văn Nam\n• Bạn có thể mở phân hệ "11. Đăng Ký & Phê Duyệt" -> bấm "Xem Phiếu Cổng" để đưa mã QR cho Bảo vệ quét khi qua cổng.',
    legalRef: 'Phân hệ 11. Đăng Ký & Phê Duyệt'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Đơn xin hoán đổi ca làm việc của tôi đã có người xác nhận chưa?',
    answer: '🔄 TRẠNG THÁI ĐƠN HOÁN ĐỔI CA:\n• Nhân sự đổi ca cùng: Nguyễn Văn Hải (Tổ máy 2)\n• Trạng thái: ĐÃ XÁC NHẬN & ĐÃ DUYỆT bới Quản đốc xưởng\n• Lịch đổi ca đã được tự động cập nhật vào Bảng phân ca tuần.',
    legalRef: 'Quy trình hoán đổi ca làm việc'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Chế độ nghỉ thai sản của lao động nam khi vợ sinh con được nghỉ mấy ngày?',
    answer: '👶 CHẾ ĐỘ THAI SẢN DÀNH CHO LAO ĐỘNG NAM (Điều 34 Luật BHXH):\n• Vợ sinh thường 1 con: Được nghỉ 05 ngày làm việc.\n• Vợ sinh con phải phẫu thuật hoặc sinh con dưới 32 tuần tuổi: Được nghỉ 07 ngày làm việc.\n• Vợ sinh đôi: Được nghỉ 10 ngày làm việc (mỗi con thêm được nghỉ thêm 03 ngày).\n• Vợ sinh đôi trở lên phải phẫu thuật: Được nghỉ 14 ngày làm việc.\nThời gian nghỉ được thực hiện trong vòng 30 ngày đầu kể từ ngày vợ sinh con.',
    legalRef: 'Khoản 2 Điều 34 Luật Bảo hiểm xã hội 2014'
  },
  {
    category: 'Nghỉ Phép & Đơn Từ',
    question: 'Thời hạn báo trước khi đơn phương chấm dứt hợp đồng lao động là bao nhiêu ngày?',
    answer: '⏳ THỜI HẠN BÁO TRƯỚC KHI XIN NGHỈ VIỆC (Điều 35 BLLĐ):\n• Đối với Hợp đồng KHÔNG xác định thời hạn: Báo trước ít nhất 45 ngày.\n• Đối với Hợp đồng xác định thời hạn từ 12 - 36 tháng: Báo trước ít nhất 30 ngày.\n• Đối với Hợp đồng dưới 12 tháng: Báo trước ít nhất 03 ngày làm việc.\nĐơn xin thôi việc được nộp trực tuyến tại phân hệ 11 và cần in bản ký tên lưu hệ thống.',
    legalRef: 'Điều 35 Bộ luật Lao động 2019'
  }
];

// Từ khóa chặn dữ liệu mật nội bộ

const CONFIDENTIAL_KEYWORDS = [
  'lương của', 'lương ai', 'lương giám đốc', 'lương sếp', 'lương nhân viên',
  'bao nhiêu tiền', 'doanh thu', 'lợi nhuận', 'doanh số', 'quỹ lương thực tế',
  'chuyển khoản cho', 'số tài khoản', 'tiền trong tài khoản', 'thu nhập của',
  'lương thưởng của', 'lương của ông', 'lương của bà', 'bảng lương thực tế của'
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'FEATURES' | 'LABOR_LAW' | 'PERSONAL_PAYROLL_QA'>('FEATURES');
  const [featureSearch, setFeatureSearch] = useState('');
  const [selectedLawCategory, setSelectedLawCategory] = useState<string>('Tất cả');
  const [suggestionOffset, setSuggestionOffset] = useState<number>(0);
  
  
  // ========================================================
  // TAB 3: TRỢ LÝ AI HỎI ĐÁP BẢNG CHẤM CÔNG & THÔNG TIN CÁ NHÂN
  // Tuyệt đối không hỏi lương / công thức tính tiền lương
  // Tách biệt rạch ròi: Bảng chấm công, Thông tin cá nhân, Nghỉ phép
  // ========================================================
  const [payrollMessages, setPayrollMessages] = useState<{ sender: 'USER' | 'AI'; text: string; legalRef?: string; isWarning?: boolean }[]>([
    {
      sender: 'AI',
      text: 'Xin chào! Tôi là Trợ Lý Hỏi Đáp Bảng Chấm Công & Thông Tin Cá Nhân.\n\nTôi sẵn sàng hỗ trợ bạn tra cứu minh bạch và nhanh chóng:\n• BẢNG CHẤM CÔNG: Số ngày công thực tế, giờ quẹt vân tay vào/ra, số giờ làm thêm (OT), đi muộn/về sớm, lịch phân ca tuần, ca đêm của bất kỳ tháng nào từ đầu năm đến nay.\n• THÔNG TIN CÁ NHÂN: Mã nhân viên, chức vụ, phòng ban, ngày vào làm, thâm niên, số hợp đồng lao động, thời hạn HĐLĐ, mã số thuế, số sổ BHXH, nơi KCB, tài khoản ngân hàng...\n• NGHỈ PHÉP & ĐƠN TỪ: Số ngày phép được hưởng, ngày phép đã nghỉ, số ngày phép tồn (khi bạn có nhu cầu hỏi).\n\n🔒 Lưu ý: Để xem bảng lương và số tiền chi tiết, bạn vui lòng mở phân hệ "12. Bảng Lương & Tạm Ứng".'
    }
  ]);
  const [payrollInput, setPayrollInput] = useState('');

  // Bộ lọc danh mục & xoay vòng câu hỏi gợi ý (50 câu)
  const [selectedAttendanceCategory, setSelectedAttendanceCategory] = useState('Tất cả');
  const [attendanceOffset, setAttendanceOffset] = useState(0);

  const handleSendPayrollMessage = (userQueryText?: string) => {
    const query = (userQueryText || payrollInput).trim();
    if (!query) return;

    const newMsgs = [...payrollMessages, { sender: 'USER' as const, text: query }];
    setPayrollMessages(newMsgs);
    if (!userQueryText) setPayrollInput('');

    const lowerQ = query.toLowerCase();

    // 1. CHẶN HỎI THÔNG TIN / LƯƠNG NGƯỜI KHÁC
    const othersKeywords = [
      'người khác', 'lương ai', 'lương sếp', 'lương giám đốc', 'lương đồng nghiệp', 
      'lương bạn', 'lương ông', 'lương bà', 'thu nhập của', 'cho tôi xem lương của', 
      'lương quản lý', 'lương nhân viên khác', 'thông tin của ai', 'hồ sơ của ai'
    ];
    if (othersKeywords.some(kw => lowerQ.includes(kw))) {
      setTimeout(() => {
        setPayrollMessages([
          ...newMsgs,
          {
            sender: 'AI',
            text: '🚫 CẢNH BÁO BẢO MẬT DỮ LIỆU CÁ NHÂN!\n\nTheo quy định của Luật An toàn thông tin và Nghị định 13/2023/NĐ-CP, thông tin nhân sự và thu nhập là DỮ LIỆU BẢO MẬT RIÊNG TƯ.\nNghiêm cấm mọi hành vi tra cứu, thăm dò thông tin của nhân sự khác. Bạn chỉ có quyền tra cứu dữ liệu chấm công và thông tin hồ sơ của chính bản thân mình.',
            isWarning: true
          }
        ]);
      }, 300);
      return;
    }

    // 2. NẾU HỎI VỀ TIỀN LƯƠNG -> HƯỚNG DẪN MỞ PHÂN HỆ BẢNG LƯƠNG (KHÔNG TRẢ LỜI LƯƠNG Ở TAB NÀY)
    const salaryKeywords = [
      'tiền lương', 'lương của tôi', 'lương tháng', 'thực nhận', 'chuyển khoản bao nhiêu', 
      'bao nhiêu tiền', 'lương cơ bản', 'lương cứng', 'tính lương', 'công thức lương', 
      'phiếu lương', 'payslip', 'tiền ot', 'tiền tăng ca'
    ];
    if (salaryKeywords.some(kw => lowerQ.includes(kw))) {
      setTimeout(() => {
        setPayrollMessages([
          ...newMsgs,
          {
            sender: 'AI',
            text: '🔒 LƯU Ý VỀ TIỀN LƯƠNG:\n\nPhân hệ Trợ lý này chuyên sâu phục vụ tra cứu BẢNG CHẤM CÔNG, GIỜ LÀM VIỆC, PHÂN CA, NGHỈ PHÉP và THÔNG TIN HỒ SƠ CÁ NHÂN.\n\n👉 ĐỂ XEM BẢNG LƯƠNG VÀ SỐ TIỀN THỰC NHẬN: Bạn vui lòng truy cập trực tiếp phân hệ "12. Bảng Lương & Tạm Ứng", chọn kỳ tháng cần xem và nhập mật khẩu / mã OTP bảo mật để mở phiếu lương (Payslip) chi tiết!\n\n💡 Tại đây, bạn có thể tra cứu toàn bộ ngày công, giờ OT, lịch ca hoặc hồ sơ hợp đồng của mình.',
            isWarning: false
          }
        ]);
      }, 300);
      return;
    }

    // 3. KHỚP CÂU HỎI TỪ KHO 50 CÂU TRI THỨC (ATTENDANCE_PROFILE_KNOWLEDGE)
    const matchedItem = ATTENDANCE_PROFILE_KNOWLEDGE.find(item => {
      const qLow = item.question.toLowerCase();
      if (lowerQ === qLow || lowerQ.includes(qLow) || qLow.includes(lowerQ)) return true;
      // Khớp theo tháng cụ thể
      for (let m = 1; m <= 9; m++) {
        if (lowerQ.includes('tháng ' + m) && qLow.includes('tháng ' + m + '/')) return true;
        if (lowerQ.includes('tháng 0' + m) && qLow.includes('tháng 0' + m + '/')) return true;
      }
      if ((lowerQ.includes('từ đầu năm') || lowerQ.includes('cả năm') || lowerQ.includes('tổng cộng')) && qLow.includes('từ đầu năm')) return true;
      return false;
    });

    if (matchedItem) {
      setTimeout(() => {
        setPayrollMessages([
          ...newMsgs,
          {
            sender: 'AI',
            text: matchedItem.answer,
            legalRef: matchedItem.legalRef
          }
        ]);
      }, 300);
      return;
    }

    // 4. PHÂN TÁCH Ý ĐỊNH RÕ RÀNG THEO TỪNG CHỦ ĐỀ - TUYỆT ĐỐI KHÔNG CHÈN PHÉP NĂM VÀO CÂU KHÔNG HỎI PHÉP

    // A. HỎI VỀ THÔNG TIN CÁ NHÂN & HỒ SƠ
    if (lowerQ.includes('mã nhân viên') || lowerQ.includes('chức vụ') || lowerQ.includes('chức danh') || lowerQ.includes('bộ phận') || lowerQ.includes('phòng ban') || lowerQ.includes('hợp đồng') || lowerQ.includes('mã số thuế') || lowerQ.includes('mst') || lowerQ.includes('bhxh') || lowerQ.includes('bảo hiểm xã hội') || lowerQ.includes('bhyt') || lowerQ.includes('người phụ thuộc') || lowerQ.includes('tài khoản ngân hàng') || lowerQ.includes('thâm niên') || lowerQ.includes('ngày vào') || lowerQ.includes('quản lý')) {
      setTimeout(() => {
        setPayrollMessages([
          ...newMsgs,
          {
            sender: 'AI',
            text: '👤 THÔNG TIN HỒ SƠ NHÂN SỰ CÁ NHÂN CỦA BẠN:\n\n• Họ và tên: NGUYỄN VĂN TUẤN (Mã NV: AV-0342)\n• Chức vụ: Kỹ thuật viên vận hành dây chuyền chế biến\n• Bộ phận: Phân Xưởng Chế Biến 01 - Tổ Vận Hành & Tiệt Trùng UHT\n• Cấp quản lý trực tiếp: Quản Đốc Trần Văn Nam\n• Ngày vào làm việc: 15/01/2021 (Thâm niên: 5 năm 5 tháng)\n• Hợp đồng lao động: HĐLĐ không xác định thời hạn (Ký ngày 15/03/2023)\n• Mã số thuế TNCN: 8402918274 (Chi cục Thuế TP. Dĩ An)\n• Số sổ BHXH: 7420198273 | Nơi KCB BHYT: Bệnh Viện Đa Khoa Quốc Tế Becamex\n• Người phụ thuộc: 02 người (Con nhỏ & Mẹ ruột)\n• Tài khoản nhận lương: 1029384756 (Vietcombank Chi nhánh KCN Sóng Thần)\n• Email công vụ: tuan.nguyen@antfood.vn | SĐT: 0918.234.892',
            legalRef: 'Dữ liệu hồ sơ nhân sự Core HR'
          }
        ]);
      }, 300);
      return;
    }

    // B. HỎI VỀ PHÉP NĂM & NGHỈ PHÉP (CHỈ TRẢ LỜI PHÉP KHI ĐƯỢC HỎI ĐÚNG VỀ PHÉP!)
    if (lowerQ.includes('phép năm') || lowerQ.includes('tồn phép') || lowerQ.includes('nghỉ phép') || lowerQ.includes('mấy ngày phép') || lowerQ.includes('quỹ phép') || lowerQ.includes('phép thâm niên')) {
      setTimeout(() => {
        setPayrollMessages([
          ...newMsgs,
          {
            sender: 'AI',
            text: '🏖️ TÌNH TRẠNG NGHỈ PHÉP NĂM 2026 CỦA BẠN:\n\n• Phép tiêu chuẩn năm: 12.0 ngày\n• Phép thâm niên (đủ 5 năm làm việc theo Điều 114 BLLĐ): +1.0 ngày\n• Phép tồn năm 2025 chuyển sang: +2.0 ngày\n= TỔNG QUỸ PHÉP ĐƯỢC HƯỞNG: 15.0 ngày\n• Số ngày phép đã sử dụng: 3.5 ngày (Nghỉ hè tháng 6 & việc gia đình tháng 8)\n= SỐ NGÀY PHÉP CÒN TỒN HIỆN TẠI: 11.5 ngày\n• Hạn chót sử dụng số ngày phép năm 2026: Đến hết ngày 31/03/2027.',
            legalRef: 'Điều 113, 114 Bộ luật Lao động 2019'
          }
        ]);
      }, 300);
      return;
    }

    // C. HỎI VỀ TĂNG CA / OT (CHỈ TÍNH GIỜ, KHÔNG TÍNH TIỀN, KHÔNG NÓI VỀ PHÉP)
    if (lowerQ.includes('ot') || lowerQ.includes('tăng ca') || lowerQ.includes('làm thêm giờ')) {
      setTimeout(() => {
        setPayrollMessages([
          ...newMsgs,
          {
            sender: 'AI',
            text: '⏱️ THỐNG KÊ GIỜ LÀM THÊM (OT) CỦA BẠN:\n\n• Tháng 09/2026 hiện tại: Đã làm 2.0 giờ OT ngày thường.\n• Tháng 08/2026 vừa qua: Đã làm 4.5 giờ OT (gồm 2.0h ngày thường và 2.5h ca đêm).\n• Tổng số giờ OT tích lũy từ đầu năm 2026 đến nay: 41.0 giờ.\n• Hạn mức theo luật quy định: Tối đa 40 giờ/tháng và 200 giờ/năm (Điều 107 BLLĐ).\n✓ Bạn đã sử dụng 41/200 giờ, nằm trong ngưỡng an toàn sức khỏe lao động.',
            legalRef: 'Điều 107 Bộ luật Lao động 2019 & Dữ liệu máy chấm công'
          }
        ]);
      }, 300);
      return;
    }

    // D. HỎI VỀ ĐI MUỘN, VỀ SỚM, QUẸT THẺ (KHÔNG NÓI VỀ PHÉP)
    if (lowerQ.includes('đi muộn') || lowerQ.includes('về sớm') || lowerQ.includes('quẹt thẻ') || lowerQ.includes('quên quẹt') || lowerQ.includes('vi phạm')) {
      setTimeout(() => {
        setPayrollMessages([
          ...newMsgs,
          {
            sender: 'AI',
            text: '🕒 THEO DÕI KỶ LUẬT GIỜ GIẤC & QUẸT THẺ:\n\n• Hôm nay (09/09): Check-in lúc 07:54:12 (Đúng giờ, không vi phạm).\n• Tháng 09/2026: 0 lần đi muộn, 0 lần về sớm (Đạt 100% chuyên cần).\n• Tổng cả năm 2026: 2 lần đi muộn (đều dưới 15 phút và đã có đơn giải trình hợp lệ được Quản lý duyệt bù công).\n✓ Nếu quên quẹt thẻ, vui lòng nộp đơn giải trình trong vòng 24h tại phân hệ "11. Đăng Ký & Phê Duyệt".',
            legalRef: 'Nhật ký chấm công Cổng 1 & Nội quy lao động'
          }
        ]);
      }, 300);
      return;
    }

    // E. HỎI VỀ CA LÀM VIỆC, PHÂN CA, ĐỔI CA (KHÔNG NÓI VỀ PHÉP)
    if (lowerQ.includes('ca làm việc') || lowerQ.includes('phân ca') || lowerQ.includes('đổi ca') || lowerQ.includes('ca kíp') || lowerQ.includes('ca đêm')) {
      setTimeout(() => {
        setPayrollMessages([
          ...newMsgs,
          {
            sender: 'AI',
            text: '🗓️ THÔNG TIN CA LÀM VIỆC CỦA BẠN:\n\n• Ca làm việc hiện tại: Ca 1 Hành chính (08:00 - 17:00, nghỉ trưa 12:00 - 13:00).\n• Lịch tuần này: Làm việc từ Thứ 2 đến Thứ 6 (8h/ngày) và sáng Thứ 7 (8:00 - 12:00).\n• Nghỉ hàng tuần: Chủ Nhật nghỉ theo chế độ.\n• Tuân thủ Điều 110 BLLĐ: Khoảng cách nghỉ giữa các ca làm việc của bạn đạt từ 15 đến 24 tiếng, đảm bảo an toàn sức khỏe.',
            legalRef: 'Lịch phân ca tuần số 37/2026 & Điều 110 BLLĐ'
          }
        ]);
      }, 300);
      return;
    }

    // F. HỎI VỀ NGÀY CÔNG / ĐI LÀM (KHÔNG TỰ ĐỘNG NÓI VỀ PHÉP NĂM)
    if (lowerQ.includes('ngày công') || lowerQ.includes('bao nhiêu công') || lowerQ.includes('đi làm') || lowerQ.includes('chấm công') || lowerQ.includes('tiến độ công')) {
      setTimeout(() => {
        setPayrollMessages([
          ...newMsgs,
          {
            sender: 'AI',
            text: '📊 BÁO CÁO NGÀY CÔNG LÀM VIỆC:\n\n👤 Nhân viên: Nguyễn Văn Tuấn (AV-0342)\n• Số ngày công chuẩn Tháng 09/2026: 26.0 ngày.\n• Số ngày công thực tế đã đi làm tính đến hôm nay (09/09): 7.5 ngày công.\n• Tỷ lệ hoàn thành công tháng: 100% tiến độ theo kế hoạch.\n• Tổng số ngày công thực tế đã đi làm từ đầu năm đến nay: 204.0 ngày công.\n✓ Dữ liệu ghi nhận đầy đủ từ hệ thống máy chấm công sinh trắc học.',
            legalRef: 'Dữ liệu Bảng chấm công 2026'
          }
        ]);
      }, 300);
      return;
    }

    // G. PHẢN HỒI MẶC ĐỊNH CHUẨN MỰC
    setTimeout(() => {
      setPayrollMessages([
        ...newMsgs,
        {
          sender: 'AI',
          text: 'Về câu hỏi "' + query + '":\nHệ thống ghi nhận bạn là NGUYỄN VĂN TUẤN (Mã NV: AV-0342), Kỹ thuật viên Phân Xưởng Chế Biến 01.\n\nBạn có thể chọn các câu hỏi gợi ý bên dưới hoặc gõ câu hỏi để tra cứu:\n1. Bảng Chấm Công & Giờ Làm (Check-in hôm nay, ngày công tháng này, số giờ OT, đi muộn...)\n2. Tra Cứu Công & Giờ OT Từng Tháng (Tháng 1 đến Tháng 9 hoặc cả năm)\n3. Thông Tin Hồ Sơ Cá Nhân (Mã NV, chức vụ, bộ phận, hợp đồng, MST, số sổ BHXH...)\n4. Nghỉ Phép & Đơn Từ (Số ngày phép được hưởng, ngày phép đã nghỉ, số phép còn tồn...)',
          legalRef: 'Hệ thống Quản lý Chấm công & Hồ sơ Nhân sự HRM Soft'
        }
      ]);
    }, 300);
  };

    // Tab Pháp Luật Chat
  const [messages, setMessages] = useState<{ sender: 'USER' | 'AI'; text: string; legalRef?: string; isWarning?: boolean }[]>([
    {
      sender: 'AI',
      text: 'Xin chào! Tôi là Trợ Lý Cố Vấn Pháp Lý Lao Động & Hướng Dẫn Tính Năng HRM Soft. Tôi có thể hỗ trợ bạn tra cứu toàn diện quy định Bộ luật Lao động 2019, Luật BHXH 2024, Nghị định lương tối thiểu 74/2024, Thông tư thuế TNCN, Bồi dưỡng hiện vật độc hại hoặc hướng dẫn sử dụng phần mềm. Hãy bấm gợi ý hoặc đặt câu hỏi!',
    }
  ]);
  const [inputText, setInputText] = useState('');

  // Lọc tính năng phần mềm
  const filteredFeatures = FEATURE_GUIDES.filter(f => {
    const q = featureSearch.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.keywords.some(k => k.toLowerCase().includes(q))
    );
  });

  // Lọc danh sách câu hỏi gợi ý theo danh mục và xoay vòng pool 400+
  const filteredQuestions = selectedLawCategory === 'Tất cả' 
    ? LABOR_LAW_KNOWLEDGE 
    : LABOR_LAW_KNOWLEDGE.filter(q => q.category === selectedLawCategory);

  const visibleSuggestions = filteredQuestions.slice(suggestionOffset % Math.max(1, filteredQuestions.length), (suggestionOffset % Math.max(1, filteredQuestions.length)) + 4);
  const displayedSuggestions = visibleSuggestions.length < 3 ? filteredQuestions.slice(0, 4) : visibleSuggestions;

  const handleNextSuggestions = () => {
    setSuggestionOffset(prev => prev + 3);
  };

  // Lọc danh sách gợi ý Bảng Chấm Công & Thông Tin Cá Nhân (50 câu)
  const filteredAttendanceQuestions = selectedAttendanceCategory === 'Tất cả'
    ? ATTENDANCE_PROFILE_KNOWLEDGE
    : ATTENDANCE_PROFILE_KNOWLEDGE.filter(q => q.category === selectedAttendanceCategory);

  const visibleAttendanceSuggestions = filteredAttendanceQuestions.slice(
    attendanceOffset % Math.max(1, filteredAttendanceQuestions.length),
    (attendanceOffset % Math.max(1, filteredAttendanceQuestions.length)) + 4
  );
  const displayedAttendanceSuggestions = visibleAttendanceSuggestions.length < 3
    ? filteredAttendanceQuestions.slice(0, 4)
    : visibleAttendanceSuggestions;

  const handleNextAttendanceSuggestions = () => {
    setAttendanceOffset(prev => prev + 3);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userQuery = inputText.trim();
    const newMessages = [...messages, { sender: 'USER' as const, text: userQuery }];
    setInputText('');

    // KIỂM TRA LÁ CHẮN BẢO MẬT DỮ LIỆU NỘI BỘ (Data Privacy Shield)
    const lowerQ = userQuery.toLowerCase();
    const isConfidential = CONFIDENTIAL_KEYWORDS.some(kw => lowerQ.includes(kw));

    if (isConfidential) {
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            sender: 'AI',
            text: '🛡️ NỘI DUNG NÀY CHỨA DỮ LIỆU BẢO MẬT NỘI BỘ!\nHệ thống được bảo vệ bởi chính sách bảo mật thông tin doanh nghiệp, không được hỗ trợ giải đáp tự động các câu hỏi liên quan đến tiền lương cá nhân cụ thể, doanh thu tài chính hoặc thông tin tài khoản chuyển khoản ngân hàng. Xin vui lòng liên hệ trực tiếp Quản lý trực tiếp hoặc Phòng Nhân sự / Kế toán để được hỗ trợ theo thẩm quyền!',
            isWarning: true
          }
        ]);
      }, 300);
      return;
    }

    // Tra cứu kiến thức pháp luật lao động (chính xác hoặc mờ)
    const matched = LABOR_LAW_KNOWLEDGE.find(item => 
      lowerQ.includes(item.question.toLowerCase()) ||
      item.question.toLowerCase().split(' ').filter(w => w.length > 3).every(w => lowerQ.includes(w))
    ) || LABOR_LAW_KNOWLEDGE.find(item => 
      item.question.toLowerCase().split(' ').some(word => word.length > 3 && lowerQ.includes(word))
    );

    setTimeout(() => {
      if (matched) {
        setMessages([
          ...newMessages,
          {
            sender: 'AI',
            text: matched.answer,
            legalRef: matched.legalRef
          }
        ]);
      } else {
        // Phản hồi thông minh theo từ khóa nghiệp vụ
        let smartAnswer = `Dựa trên quy định của Bộ luật Lao động 2019 và các văn bản hướng dẫn hiện hành:\nĐối với vấn đề "${userQuery}", nguyên tắc chung của pháp luật là bảo đảm quyền và lợi ích hợp pháp của cả hai bên theo nguyên tắc bình đẳng, tự nguyện, thiện chí và tuân thủ thỏa ước lao động tập thể / nội quy lao động đã đăng ký với cơ quan quản lý nhà nước về lao động.`;
        let smartRef = 'Bộ luật Lao động 2019 & Nghị định 145/2020/NĐ-CP';

        if (lowerQ.includes('thai sản') || lowerQ.includes('sinh con')) {
          smartAnswer = 'Theo Luật BHXH, lao động nữ sinh con được nghỉ thai sản 06 tháng, hưởng 100% mức bình quân lương đóng BHXH 6 tháng trước nghỉ. Lao động nam có vợ sinh con được nghỉ từ 5 - 14 ngày làm việc.';
          smartRef = 'Điều 34, 39 Luật BHXH 2014 & Luật BHXH 2024';
        } else if (lowerQ.includes('thử việc')) {
          smartAnswer = 'Thời gian thử việc tối đa 60 ngày đối với trình độ cao đẳng/đại học, 30 ngày đối với trung cấp/công nhân. Lương thử việc ít nhất bằng 85% lương chính thức. Không thử việc với HĐ dưới 1 tháng.';
          smartRef = 'Điều 25, 26 Bộ luật Lao động 2019';
        } else if (lowerQ.includes('phép năm') || lowerQ.includes('nghỉ phép')) {
          smartAnswer = 'Người lao động làm đủ 12 tháng được nghỉ 12 ngày phép năm (công việc độc hại 14-16 ngày). Cứ mỗi 5 năm thâm niên được cộng thêm 1 ngày phép năm.';
          smartRef = 'Điều 113, 114 Bộ luật Lao động 2019';
        } else if (lowerQ.includes('sa thải') || lowerQ.includes('kỷ luật')) {
          smartAnswer = 'Kỷ luật sa thải chỉ áp dụng trong 4 trường hợp tại Điều 125 BLLĐ (trộm cắp, tham ô, tiết lộ bí mật, tái phạm kéo dài nâng lương, bỏ việc 5 ngày/30 ngày không lý do chính đáng). Bắt buộc phải có Công đoàn tham dự.';
          smartRef = 'Điều 122, 125 Bộ luật Lao động 2019';
        }

        setMessages([
          ...newMessages,
          {
            sender: 'AI',
            text: smartAnswer,
            legalRef: smartRef
          }
        ]);
      }
    }, 350);
  };

  return (
    <>
      {/* NÚT NỬA HÌNH TRÒN CỐ ĐỊNH Ở MÉP PHẢI MÀN HÌNH - ĐỘ MỜ 40% (OPACITY-40 HOVER:OPACITY-100) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-[30%] -translate-y-1/2 z-40 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-2 rounded-l-2xl shadow-2xl transition-all duration-300 opacity-40 hover:opacity-100 flex flex-col items-center space-y-1 group cursor-pointer border-y border-l border-indigo-400"
        title="Trợ lý QA & Pháp Luật (Mờ 40%, rê chuột để sáng rõ)"
      >
        <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="font-extrabold tracking-wider text-[11px] writing-mode-vertical">QA</span>
      </button>

      {/* MODAL TO BẰNG BẢNG CĂN CỨ PHÁP LÝ (max-w-5xl h-[88vh]) CHÍNH GIỮA MÀN HÌNH */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[88vh] h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 m-auto">
            {/* Header */}
            <div className="px-6 py-2 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30 shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight flex items-center space-x-2">
                    <span>Trung Tâm Trợ Lý QA &amp; Pháp Luật</span>
                    <span className="px-2 py-0.5 text-[9px] font-semibold bg-indigo-500/40 text-indigo-200 rounded-md border border-indigo-400/30">
                      AI Bảo Mật Nội Bộ
                    </span>
                  </h2>
                  <p className="text-xs text-indigo-200">
                    Tra cứu chức năng phần mềm &amp; Giải đáp Bộ luật Lao động Việt Nam
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chuyển Tab: 1. Tìm tính năng, 2. Chat Luật Lao Động */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2">
              <button
                onClick={() => setActiveTab('FEATURES')}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'FEATURES'
                    ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Hướng Dẫn & Tìm Tính Năng</span>
              </button>
              <button
                onClick={() => setActiveTab('LABOR_LAW')}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'LABOR_LAW'
                    ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Hỏi Đáp Luật Lao Động &amp; Nội Quy</span>
              </button>

              <button
                onClick={() => setActiveTab('PERSONAL_PAYROLL_QA')}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'PERSONAL_PAYROLL_QA'
                    ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hỏi Đáp Bảng Chấm Công &amp; Thông Tin Cá Nhân</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                  Cá Nhân
                </span>
              </button>
            </div>

            {/* Nội dung Tab 1: Tra cứu tính năng phần mềm */}
            {activeTab === 'FEATURES' && (
              <div className="flex-1 flex flex-col p-2.5 overflow-hidden">
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm nhanh tính năng (vd: tính lương, tạm ứng, chấm công 12h, hợp đồng, kpi...)"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {filteredFeatures.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600">
                            {f.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                            {f.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {f.description}
                        </p>
                      </div>

                      {onNavigate && (
                        <button
                          onClick={() => {
                            onNavigate(f.tab);
                            setIsOpen(false);
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[10px] font-bold rounded-lg transition-colors flex-shrink-0 mt-1"
                        >
                          <span>Mở màn hình</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {filteredFeatures.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Không tìm thấy tính năng nào phù hợp với từ khóa "{featureSearch}".
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nội dung Tab 2: Chat Luật Lao Động & Cố Vấn Pháp Lý */}
            {activeTab === 'LABOR_LAW' && (
              <div className="flex-1 flex flex-col p-2 overflow-hidden">
                {/* Lời nhắc bảo mật */}
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lá chắn dữ liệu: Tuyệt đối không tiết lộ số liệu lương cá nhân hoặc tài chính nội bộ.</span>
                  </div>
                  <span className="font-semibold text-indigo-600">BLLĐ 2019</span>
                </div>

                {/* Khung chat */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs mb-2">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        m.sender === 'USER' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          m.sender === 'USER'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                            : m.isWarning
                            ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-bl-none'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed text-[11px]">{m.text}</p>
                        {m.legalRef && (
                          <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-indigo-700 font-semibold flex items-center space-x-1">
                            <span>⚖️ Căn cứ: {m.legalRef}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thanh lọc chủ đề câu hỏi */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 mb-1 text-[10px] no-scrollbar">
                  {['Tất cả', 'Tiền Lương & OT', 'Hợp Đồng & Thử Việc', 'Biến Động & Thủ Tục', 'Kỷ Luật Sa Thải', 'BHXH & Thai Sản', 'Thuế TNCN', 'Độc Hại Sữa', 'Nghỉ Phép & Khác'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setSelectedLawCategory(cat); setSuggestionOffset(0); }}
                      className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                        selectedLawCategory === cat 
                          ? 'bg-indigo-600 text-white font-bold' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Gợi ý câu hỏi nhanh có nút đổi mới xoay vòng */}
                <div className="flex items-center justify-between gap-1 mb-2 bg-indigo-50/50 p-1.5 rounded-xl border border-indigo-100">
                  <div className="flex items-center space-x-1.5 overflow-x-auto flex-1 py-0.5">
                    {displayedSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInputText(item.question)}
                        className="px-2 py-1 bg-white hover:bg-indigo-100 text-indigo-800 text-[10px] font-medium rounded-lg whitespace-nowrap border border-indigo-200 shadow-2xl transition-all hover:scale-105"
                        title={item.question}
                      >
                        {item.question.length > 32 ? item.question.slice(0, 32) + '...' : item.question}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleNextSuggestions}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg flex items-center space-x-1 flex-shrink-0 transition-colors shadow-sm"
                    title="Đổi gợi ý các tình huống pháp lý khác trong kho 400+ câu"
                  >
                    <span>Đổi gợi ý khác ↻</span>
                  </button>
                </div>

                {/* Ô nhập câu hỏi */}
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Hỏi về thời giờ làm việc, nghỉ thai sản, bồi dưỡng hiện vật, kỷ luật sa thải..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Disclaimer AI */}
                <p className="text-[10px] italic text-amber-600 text-center pt-1 border-t border-amber-100 mt-1 bg-amber-50 rounded-lg px-2 py-1.5">
                  ✨ Rất vui đã được hỗ trợ bạn, AI box có thể mắc sai sót. Hãy kiểm tra và xác minh thông tin với văn bản pháp luật gốc trước khi áp dụng.
                </p>
              </div>
            )}

            {/* Nội dung Tab 3: Hỏi Đáp Bảng Chấm Công & Thông Tin Cá Nhân */}
            {activeTab === 'PERSONAL_PAYROLL_QA' && (
              <div className="flex-1 flex flex-col p-2 overflow-hidden bg-slate-50/50">
                {/* Banner phân hệ chuẩn mực */}
                <div className="mb-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 border border-indigo-200 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white font-bold">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-[11.5px]">
                        Hỏi Đáp Bảng Chấm Công &amp; Thông Tin Cá Nhân
                      </p>
                      <p className="text-[10px] text-slate-600">
                        Tra cứu ngày công, giờ quẹt vân tay, số giờ OT, ca làm việc, thông tin hợp đồng &amp; hồ sơ nhân sự cá nhân
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                    Bảo Vệ NĐ 13/2023
                  </span>
                </div>

                {/* Khung chat tin nhắn */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  {payrollMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.sender === 'USER'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                            : msg.isWarning
                            ? 'bg-rose-50 border border-rose-300 text-rose-900 rounded-bl-none'
                            : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        {msg.legalRef && (
                          <div className="mt-2 pt-1.5 border-t border-slate-200 text-[10px] font-bold text-indigo-700 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>Căn cứ: {msg.legalRef}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>


                {/* Thanh lọc chủ đề gợi ý câu hỏi công & phép */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 mb-1 text-[10px] no-scrollbar shrink-0">
                  {['Tất cả', 'Chấm Công & Giờ Làm', 'Tra Cứu Từng Tháng', 'Thông Tin Cá Nhân', 'Nghỉ Phép & Đơn Từ'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setSelectedAttendanceCategory(cat); setAttendanceOffset(0); }}
                      className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedAttendanceCategory === cat 
                          ? 'bg-emerald-600 text-white font-bold' 
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Gợi ý câu hỏi nhanh nằm ở DƯỚI - Chọn câu hỏi thì điền vào input chứ KHÔNG gửi ngay, phải bấm Sent */}
                <div className="flex items-center justify-between gap-1 mb-2 bg-emerald-50/60 p-1.5 rounded-xl border border-emerald-200/80 shrink-0">
                  <div className="flex items-center space-x-1.5 overflow-x-auto flex-1 py-0.5">
                    {displayedAttendanceSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPayrollInput(item.question)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 text-[10.5px] font-medium rounded-lg whitespace-nowrap border border-emerald-300 shadow-2xs transition-all hover:scale-105 cursor-pointer"
                        title={item.question}
                      >
                        {item.question.length > 35 ? item.question.slice(0, 35) + '...' : item.question}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleNextAttendanceSuggestions}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg flex items-center space-x-1 flex-shrink-0 transition-colors shadow-xs cursor-pointer"
                    title="Đổi gợi ý các câu hỏi khác trong kho 50 câu"
                  >
                    <span>Đổi gợi ý khác ↻</span>
                  </button>
                </div>

                {/* Ô nhập tin nhắn */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPayrollMessage();
                  }}
                  className="mt-2.5 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    placeholder="Hỏi về ngày công tháng này, giờ quẹt thẻ, số giờ OT, mã số thuế, hợp đồng, thâm niên..."
                    value={payrollInput}
                    onChange={(e) => setPayrollInput(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
