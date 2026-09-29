import { FormattedNumberInput } from './FormattedNumberInput';
import React, { useState, useMemo } from 'react';
import { CompanyPolicy, PolicyDocument, PolicyConflictItem, UserRole } from '../types/hrm';
import { FileViewerModal, ViewerFileType } from './FileViewerModal';
import { 
  Sliders, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Milk, 
  DollarSign, 
  Check, 
  Save, 
  RotateCcw,
  Info,
  FileText,
  Sparkles,
  AlertTriangle,
  Upload,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  FolderLock,
  Download,
  Eye,
  FileSpreadsheet,
  ExternalLink,
  Lock,
  Printer,
  Archive,
  FileX2,
  AlertCircle,
  Filter,
  Scale,
  Target
} from 'lucide-react';

interface CompanyPolicyViewProps {
  policy: CompanyPolicy;
  onSavePolicy: (updated: CompanyPolicy) => void;
  currentRole?: UserRole;
}

// Danh mục văn bản pháp quy nội bộ: Nhóm 2.1 (Toàn phần), Nhóm 2.2 (Một phần), Nhóm 3 (Hết hiệu lực)
const initialPolicyDocuments: PolicyDocument[] = [
  // --- NHÓM 2.1: HIỆU LỰC TOÀN PHẦN (Áp dụng 100%, không bị sửa đổi) ---
  {
    id: 'DOC-01',
    tenantId: 'TENANT-ASIAFOODS',
    title: 'Nội Quy Lao Động 2026 (Bản chuẩn hóa áp dụng đa loại hình doanh nghiệp)',
    category: 'LABOR_REGULATION',
    fileName: '02 Nội quy lao động 2026 - Bản mẫu áp dụng đa loại hình DN.docx',
    uploadDate: '2026-08-25',
    effectiveDate: '2026-09-01',
    version: 'V2.6-2026',
    fileSizeText: '142 KB',
    status: 'ACTIVE',
    validityScope: 'FULL',
    isApproved: true,
    linkPdf: 'https://drive.google.com/file/d/sample_noi_quy_lao_dong_approved.pdf',
    linkOffice: 'https://docs.google.com/document/d/sample_noi_quy_lao_dong_draft.docx',
    summary: 'Quy định chi tiết thời giờ làm việc (44h-48h), quy trình chấm công, chế độ nghỉ phép, định mức bồi dưỡng độc hại TT 24, quy trình xử lý kỷ luật lao động và sa thải chuẩn Điều 122 & 125 BLLĐ 2019.',
    contentText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---
NỘI QUY LAO ĐỘNG DOANH NGHIỆP NĂM 2026
(Ban hành kèm theo Quyết định số 189/QĐ-AV ngày 15/03/2024 của Tổng Giám Đốc)
Đăng ký hiệu lực tại Sở Lao động - Thương binh & Xã hội / Sở Nội vụ

CHƯƠNG I: THỜI GIỜ LÀM VIỆC VÀ THỜI GIỜ NGHỈ NGƠI
Điều 1. Thời giờ làm việc tiêu chuẩn:
1. Khối Văn phòng: Làm việc 44 giờ/tuần, từ Thứ 2 đến sáng Thứ 7 (Nghỉ chiều Thứ 7 và cả ngày Chủ nhật). Ca sáng: 08h00 - 12h00; Ca chiều: 13h00 - 17h00.
2. Khối Nhà máy Sản xuất: Làm việc theo 03 ca kíp luân phiên (Ca 1: 06h00 - 14h00; Ca 2: 14h00 - 22h00; Ca 3: 22h00 - 06h00). Đảm bảo thời gian nghỉ chuyển ca tối thiểu 12 giờ liên tục theo Điều 110 Bộ luật Lao động 2019.

CHƯƠNG II: NỀN NẾP, TRẬT TỰ VÀ AN TOÀN VỆ SINH LAO ĐỘNG
Điều 2. Chấp hành trang thiết bị bảo hộ lao động:
Người lao động bắt buộc tuân thủ trang bị bảo hộ cá nhân (BHLĐ), thẻ nhân viên khi ra vào nhà xưởng. Nghiêm cấm hút thuốc lá, sử dụng chất kích thích trong khuôn viên công ty.

CHƯƠNG III: BẢO VỆ TÀI SẢN VÀ BÍ MẬT CÔNG NGHỆ DOANH NGHIỆP
Điều 3. Tuyệt đối giữ gìn tài sản chung, bí mật công thức chế biến thực phẩm và bảo mật dữ liệu nhân sự tiền lương toàn hệ thống.`,
    extractedClauses: {
      standardHoursPerWeek: 44,
      probationSalaryRate: 0.85,
      regionalMinimumTier: 1,
      annualLeaveDays: 12,
      overtimeWeekdayRate: 1.5,
      overtimeWeekendRate: 2.0,
      lateGraceMinutes: 5
    }
  },
  {
    id: 'DOC-02',
    tenantId: 'TENANT-ASIAFOODS',
    title: 'Thỏa Ước Lao Động Tập Thể (TƯLĐTT) Đã Ký Kết & Đăng Ký Cơ Quan Nhà Nước',
    category: 'LABOR_REGULATION',
    fileName: 'Thoa_Uoc_Lao_Dong_Tap_The_2026.docx',
    uploadDate: '2026-08-20',
    effectiveDate: '2026-09-01',
    version: 'V2.0-2026',
    fileSizeText: '320 KB',
    status: 'ACTIVE',
    validityScope: 'FULL',
    isApproved: true,
    linkPdf: 'https://drive.google.com/file/d/sample_thoa_uoc_lao_dong_tap_the_approved.pdf',
    linkOffice: 'https://docs.google.com/document/d/sample_thoa_uoc_lao_dong_draft.docx',
    summary: 'Cam kết mức lương tối thiểu cho lao động qua đào tạo nghề luôn cao hơn ít nhất 7% mức lương vùng, thưởng Lễ/Tết từ 1 triệu đến 1 tháng lương, phụ cấp bữa ăn giữa ca 1.200.000 đ/tháng.',
    contentText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---
THỎA ƯỚC LAO ĐỘNG TẬP THỂ (TƯLĐTT)
(Áp dụng toàn thể 6.789 người lao động Công ty TNHH Sản Xuất Thực Phẩm An Việt)
Ký kết giữa Đại diện Doanh nghiệp và Ban Chấp hành Công đoàn Cơ sở

ĐIỀU 1. CHẾ ĐỘ TIỀN LƯƠNG VÀ NÂNG BẬC LƯƠNG
1. Doanh nghiệp cam kết mức lương tối thiểu áp dụng cho lao động đã qua đào tạo nghề luôn cao hơn ít nhất 7% so với mức lương tối thiểu vùng I (Nghị định 293/2025/NĐ-CP).
2. Định kỳ tháng 12 hằng năm, Doanh nghiệp cùng Ban Chấp hành Công đoàn tổ chức rà soát hiệu quả sản xuất để điều chỉnh tăng lương định kỳ cho người lao động từ 5% đến 10%.

ĐIỀU 2. CHẾ ĐỘ PHÚC LỢI VÀ TIỀN ĂN GIỮA CA
1. Hỗ trợ suất ăn trưa/ca miễn phí hoặc chi tiền ăn ca 1.200.000 đ/tháng (được miễn trừ thuế TNCN theo Thông tư 111/2013/TT-BTC).
2. Thưởng các dịp Lễ, Tết (Tết Dương lịch, 30/4 - 1/5, Quốc khánh 2/9): Mức chi thưởng tối thiểu từ 1.000.000 đ đến 01 tháng lương thực lãnh.`,
    extractedClauses: {
      standardHoursPerWeek: 44,
      probationSalaryRate: 0.85,
      regionalMinimumTier: 1,
      annualLeaveDays: 12,
      overtimeWeekdayRate: 1.5,
      overtimeWeekendRate: 2.0,
      lateGraceMinutes: 5
    }
  },

  // --- NHÓM 2.2: HIỆU LỰC MỘT PHẦN (Vẫn áp dụng nhưng có văn bản mới thay thế một phần) ---
  {
    id: 'DOC-03',
    tenantId: 'TENANT-ASIAFOODS',
    title: 'Quy Chế Tiền Lương, Thưởng & Đãi Ngộ 2024 (Đang Áp Dụng - Hiệu Lực Một Phần)',
    category: 'SALARY_RULE',
    fileName: 'Quy_Che_Tien_Luong_Thuong_2024_SuaDoi.xlsx',
    uploadDate: '2024-03-10',
    effectiveDate: '2024-04-01',
    version: 'V1.4-2024 (Đã sửa đổi)',
    fileSizeText: '2.4 MB',
    status: 'ACTIVE',
    validityScope: 'PARTIAL',
    isApproved: true,
    partialValidityNote: 'Khoản chi tiền ăn giữa ca (đã nâng từ 730k lên 1.200.000 đ/tháng) và thang bậc lương bậc 1 đã được sửa đổi, thay thế một phần theo Quyết định số 88/2026/QĐ-TGĐ và Nghị định 293/2025/NĐ-CP; các điều khoản còn lại về cơ chế tính KPI và tạm ứng lương giữa kỳ vẫn giữ nguyên hiệu lực thi hành.',
    linkPdf: 'https://drive.google.com/file/d/sample_quy_che_luong_thuong_approved.pdf',
    linkOffice: 'https://docs.google.com/spreadsheets/d/sample_quy_che_luong_thuong_draft.xlsx',
    summary: 'Quy định thang bảng lương 3P, quy chế tạm ứng lương giữa kỳ, bồi hoàn tài sản nhiều kỳ và đối soát chuyển khoản ngân hàng.',
    contentText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---
QUY CHẾ TIỀN LƯƠNG, THƯỞNG VÀ ĐÃI NGỘ
Căn cứ Bộ luật Lao động 2019 và Nghị định 145/2020/NĐ-CP

1. CẤU TRÚC TIỀN LƯƠNG 3P:
- P1 (Position): Lương cơ bản theo chức danh công việc và ngạch bậc lương đã đăng ký.
- P2 (Person): Phụ cấp năng lực, thâm niên, tay nghề và trình độ chuyên môn.
- P3 (Performance): Lương hiệu quả công việc, thưởng năng suất sản phẩm và KPI tháng.

2. CÁC KHOẢN PHỤ CẤP VÀ PHÚC LỢI:
- Tiền ăn giữa ca: 1.200.000 đ/tháng/người (áp dụng thực tế theo ngày công, đã cập nhật theo QĐ 88/2026).
- Bồi dưỡng độc hại bằng hiện vật (sữa/đường) theo Thông tư 24/2022/TT-BLĐTBXH.`,
    extractedClauses: {
      standardHoursPerWeek: 48,
      probationSalaryRate: 0.85,
      regionalMinimumTier: 1,
      annualLeaveDays: 12,
      overtimeWeekdayRate: 1.5,
      overtimeWeekendRate: 2.0,
      lateGraceMinutes: 5
    }
  },
  {
    id: 'DOC-04',
    tenantId: 'TENANT-ASIAFOODS',
    title: 'Quy Trình Xử Lý Kỷ Luật Lao Động & Bồi Thường Thiệt Hại 2023 (Hiệu Lực Một Phần)',
    category: 'DISCIPLINE_RULE',
    fileName: 'Quy_Trinh_Xu_Ly_Ky_Luat_2023_SuaDoi.docx',
    uploadDate: '2023-07-20',
    effectiveDate: '2023-08-01',
    version: 'V2.1-2023 (Đã sửa đổi)',
    fileSizeText: '380 KB',
    status: 'ACTIVE',
    validityScope: 'PARTIAL',
    isApproved: true,
    partialValidityNote: 'Khoản 2 Điều 4 về hình thức lập biên bản qua giấy tờ vật lý đã được thay thế một phần bởi Quy chế Chữ ký số & Họp kỷ luật trực tuyến theo QĐ 12/2026/QĐ-TGĐ; toàn bộ các quy định về căn cứ sa thải Điều 125 BLLĐ và thời hiệu xử lý vẫn đang có hiệu lực áp dụng.',
    linkPdf: 'https://drive.google.com/file/d/sample_quy_trinh_ky_luat_approved.pdf',
    linkOffice: 'https://docs.google.com/document/d/sample_quy_trinh_ky_luat_draft.docx',
    summary: 'Trình tự gửi giấy mời họp trước 5 ngày làm việc, biên bản xử lý kỷ luật có đại diện Ban chấp hành Công đoàn cơ sở tham dự, ban hành quyết định sa thải có hiệu lực pháp lý.',
    contentText: `QUY TRÌNH XỬ LÝ KỶ LUẬT LAO ĐỘNG VÀ TRÁCH NHIỆM VẬT CHẤT
Tuân thủ nghiêm ngặt Điều 122 & 125 Bộ luật Lao động 2019

Bước 1: Lập biên bản vi phạm kỷ luật lao động có chữ ký của các bên liên quan.
Bước 2: Ban hành giấy mời họp xử lý kỷ luật trước ít nhất 05 ngày làm việc gửi người lao động và Công đoàn cơ sở.
Bước 3: Tổ chức phiên họp xử lý kỷ luật có sự tham gia đầy đủ của Ban Chấp hành Công đoàn.
Bước 4: Ban hành Quyết định xử lý kỷ luật lao động hoặc Quyết định bồi thường thiệt hại theo đúng thẩm quyền.`
  },

  // --- NHÓM 3: HẾT HIỆU LỰC HOÀN TOÀN (Lưu trữ lịch sử, vẫn mở xem được với tem cảnh báo) ---
  {
    id: 'DOC-05',
    tenantId: 'TENANT-ASIAFOODS',
    title: 'Nội Quy Lao Động 2020 (Thời Kỳ Bộ Luật Lao Động 2012 - Hết Hiệu Lực Hoàn Toàn)',
    category: 'LABOR_REGULATION',
    fileName: 'Noi_Quy_Lao_Dong_2020_Het_Hieu_Luc.docx',
    uploadDate: '2020-05-10',
    effectiveDate: '2020-06-01',
    expiredDate: '2026-08-31',
    version: 'V1.0-2020 (Lịch sử)',
    fileSizeText: '210 KB',
    status: 'SUPERSEDED',
    validityScope: 'EXPIRED',
    isApproved: false,
    supersededBy: 'Nội Quy Lao Động 2026 (DOC-01)',
    expiredReason: 'Hết hiệu lực hoàn toàn do Doanh nghiệp đã ban hành Nội quy lao động 2026 mới đăng ký với Sở Lao động.',
    summary: 'Bản nội quy cũ áp dụng chuẩn 48h/tuần và quy chế kỷ luật thời kỳ Bộ luật Lao động 2012 cũ. Đã hết hiệu lực thi hành hoàn toàn, hệ thống lưu trữ phục vụ tra cứu lịch sử hồ sơ thanh kiểm tra.',
    linkPdf: 'https://drive.google.com/file/d/sample_noi_quy_lao_dong_2020_expired.pdf',
    linkOffice: 'https://docs.google.com/document/d/sample_noi_quy_2020_draft.docx',
    contentText: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---
NỘI QUY LAO ĐỘNG CŨ NĂM 2020
[VĂN BẢN ĐÃ HẾT HIỆU LỰC HOÀN TOÀN TỪ NGÀY 31/08/2026]
Văn bản thay thế: Nội Quy Lao Động 2026 (Quyết định số 189/QĐ-AV)

CHƯƠNG I: THỜI GIỜ LÀM VIỆC CŨ
Thời giờ làm việc tiêu chuẩn 48 giờ/tuần đối với toàn thể cán bộ công nhân viên...`
  },
  {
    id: 'DOC-06',
    tenantId: 'TENANT-ASIAFOODS',
    title: 'Thang Bảng Lương Cũ Năm 2022 (Theo Nghị Định 38/2022/NĐ-CP - Hết Hiệu Lực Hoàn Toàn)',
    category: 'SALARY_RULE',
    fileName: 'Thang_Bang_Luong_Cu_2022_NghiDinh38.xlsx',
    uploadDate: '2022-07-01',
    effectiveDate: '2022-07-15',
    expiredDate: '2025-12-31',
    version: 'V1.0-2022 (Lịch sử)',
    fileSizeText: '1.8 MB',
    status: 'SUPERSEDED',
    validityScope: 'EXPIRED',
    isApproved: false,
    supersededBy: 'Quy Chế Tiền Lương Thưởng 3P 2026 (DOC-03)',
    expiredReason: 'Hết hiệu lực hoàn toàn do áp dụng hệ thống thang bảng lương 3P và mức lương tối thiểu vùng mới theo Nghị định 293/2025/NĐ-CP.',
    summary: 'Hệ thống thang bảng lương cũ theo mức tối thiểu vùng 4.680.000 đ (Vùng I cũ). Đã chấm dứt hiệu lực thi hành hoàn toàn từ ngày 01/01/2026.',
    linkPdf: 'https://drive.google.com/file/d/sample_thang_luong_2022_expired.pdf',
    linkOffice: 'https://docs.google.com/spreadsheets/d/sample_thang_luong_2022_draft.xlsx',
    contentText: `THANG BẢNG LƯƠNG CŨ NĂM 2022
[VĂN BẢN ĐÃ HẾT HIỆU LỰC HOÀN TOÀN TỪ 31/12/2025]
Căn cứ Nghị định số 38/2022/NĐ-CP (Đã được thay thế bởi Nghị định 74/2024 và Nghị định 293/2025/NĐ-CP)
Mức lương tối thiểu Vùng I cũ: 4.680.000 đ/tháng.`
  },
  {
    id: 'DOC-07',
    tenantId: 'TENANT-ASIAFOODS',
    title: 'Quy Định Định Mức Bồi Dưỡng Hiện Vật Độc Hại Cũ (Theo TT 25/2013 - Hết Hiệu Lực Hoàn Toàn)',
    category: 'SAFETY_RULE',
    fileName: 'Dinh_Muc_Boi_Duong_Doc_Hai_TT25_Cu.docx',
    uploadDate: '2019-01-15',
    effectiveDate: '2019-02-01',
    expiredDate: '2023-03-01',
    version: 'V1.0-2019 (Lịch sử)',
    fileSizeText: '95 KB',
    status: 'SUPERSEDED',
    validityScope: 'EXPIRED',
    isApproved: false,
    supersededBy: 'Tiêu Chuẩn Bồi Dưỡng Hiện Vật Độc Hại Theo TT 24/2022/TT-BLĐTBXH',
    expiredReason: 'Thông tư số 25/2013/TT-BLĐTBXH đã hết hiệu lực thi hành và bị bãi bỏ toàn bộ bởi Thông tư số 24/2022/TT-BLĐTBXH từ ngày 01/03/2023.',
    summary: 'Định mức bồi dưỡng hiện vật 10.000đ - 15.000đ - 20.000đ - 25.000đ/ngày cũ. Đã bãi bỏ hoàn toàn, Doanh nghiệp áp dụng mức mới theo TT 24/2022.',
    linkPdf: 'https://drive.google.com/file/d/sample_boi_duong_doc_hai_tt25_expired.pdf',
    linkOffice: 'https://docs.google.com/document/d/sample_boi_duong_doc_hai_tt25_draft.docx',
    contentText: `QUY ĐỊNH ĐỊNH MỨC BỒI DƯỠNG HIỆN VẬT ĐỘC HẠI THEO TT 25/2013
[VĂN BẢN ĐÃ HẾT HIỆU LỰC HOÀN TOÀN TỪ NGÀY 01/03/2023]
Văn bản thay thế: Thông tư 24/2022/TT-BLĐTBXH (Mức mới: 13k - 20k - 26k - 32k/ngày).`
  }
];

export const CompanyPolicyView: React.FC<CompanyPolicyViewProps> = ({ 
  policy, 
  onSavePolicy,
  currentRole = 'HR_MANAGER'
}) => {
  // 4 Nhóm Tab theo đúng chỉ đạo người dùng
  const [activeTab, setActiveTab] = useState<'POLICY_ENGINE' | 'DOCUMENT_REPOSITORY' | 'EXPIRED_REPOSITORY' | 'AI_CONFLICT_ANALYZER'>('POLICY_ENGINE');
  
  // Bộ lọc trong Kho đang hiệu lực: Tất cả | 2.1 Toàn phần | 2.2 Một phần
  const [activeValidityFilter, setActiveValidityFilter] = useState<'ALL' | 'FULL' | 'PARTIAL'>('ALL');
  
  const [formData, setFormData] = useState<CompanyPolicy>(policy);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [documents, setDocuments] = useState<PolicyDocument[]>(initialPolicyDocuments);

  // Phân quyền: Cán bộ Tiền lương và Quản trị (Tổng giám đốc / Trưởng phòng HR / C&B)
  const isPayrollOrAdmin = currentRole === 'GENERAL_DIRECTOR' || currentRole === 'HR_MANAGER' || currentRole === 'PAYROLL_SPECIALIST';

  // Modal xem file trực tiếp
  const [viewerModalState, setViewerModalState] = useState<{
    isOpen: boolean;
    title: string;
    subTitle?: string;
    fileType: ViewerFileType;
    fileUrl?: string;
    customContent?: string;
    metadata?: any;
    canDownloadPrint?: boolean;
    isExpired?: boolean;
    expiredReason?: string;
    supersededBy?: string;
  }>({
    isOpen: false,
    title: '',
    fileType: 'PDF'
  });

  // Trạng thái AI Rà Soát Xung Đột
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Sync khi đổi tenant
  React.useEffect(() => {
    setFormData(policy);
  }, [policy]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSavePolicy(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Phân loại tài liệu theo hiệu lực
  const activeDocs = useMemo(() => {
    return documents.filter(d => d.validityScope !== 'EXPIRED' && d.status === 'ACTIVE');
  }, [documents]);

  const expiredDocs = useMemo(() => {
    return documents.filter(d => d.validityScope === 'EXPIRED' || d.status === 'SUPERSEDED');
  }, [documents]);

  // Bộ lọc danh mục 2.1 & 2.2
  const filteredActiveDocs = useMemo(() => {
    if (activeValidityFilter === 'FULL') {
      return activeDocs.filter(d => d.validityScope === 'FULL');
    }
    if (activeValidityFilter === 'PARTIAL') {
      return activeDocs.filter(d => d.validityScope === 'PARTIAL');
    }
    return activeDocs;
  }, [activeDocs, activeValidityFilter]);

  const fullCount = activeDocs.filter(d => d.validityScope === 'FULL').length;
  const partialCount = activeDocs.filter(d => d.validityScope === 'PARTIAL').length;

  // Danh mục so sánh xung đột giữa Văn bản Nội Quy và Cấu hình HRM
  const conflictItems: PolicyConflictItem[] = [
    {
      id: 'CONF-01',
      category: 'Thời giờ làm việc tiêu chuẩn',
      regulationValue: '44 giờ/tuần (Nội quy Chương I Điều 1)',
      systemSettingValue: `${formData.standardWorkDaysPerMonth} ngày/tháng (Thứ 7: ${formData.saturdayPolicy === 'MORNING_ONLY' ? 'Làm buổi sáng' : formData.saturdayPolicy === 'FULL_OFF' ? 'Nghỉ' : 'Cả ngày'})`,
      isConflict: false,
      legalReference: 'Khoản 2 Điều 105 Bộ luật Lao động 2019',
      explanation: 'Khuyến khích NSDLĐ thực hiện tuần làm việc 40 - 44 giờ đối với khối văn phòng.',
      suggestedAction: 'Đã khớp chuẩn 100%'
    },
    {
      id: 'CONF-02',
      category: 'Quy tắc trừ công đi trễ',
      regulationValue: 'Trễ từ 6-15p trừ 30p; Trễ 16-30p trừ 60p; Trễ >30p trừ nửa buổi',
      systemSettingValue: `Mức 1 (1-${formData.lateRuleLevel1Minutes}p), Mức 2 (${formData.lateRuleLevel1Minutes + 1}-${formData.lateRuleLevel2Minutes}p), Mức 3 (>${formData.lateRuleLevel2Minutes}p)`,
      isConflict: false,
      legalReference: 'Điều 127 Bộ luật Lao động 2019',
      explanation: 'Quy đổi đi muộn thành giảm trừ giờ công thực tế, KHÔNG dùng hình thức phạt tiền mặt.',
      suggestedAction: 'Tuân thủ đúng pháp luật'
    },
    {
      id: 'CONF-03',
      category: 'Mức phụ cấp ăn giữa ca',
      regulationValue: '1.200.000 đ/tháng/người (QĐ số 88/2026/QĐ-TGĐ sửa đổi TT 111)',
      systemSettingValue: `${(formData.shiftMealAllowancePerDay || 40000).toLocaleString('vi-VN')} đ/ngày (tối đa ${((formData.shiftMealAllowancePerDay || 40000) * 26).toLocaleString('vi-VN')} đ/tháng)`,
      isConflict: false,
      legalReference: 'Thông tư 111/2013/TT-BTC & NĐ 293/2025/NĐ-CP',
      explanation: 'Đã cập nhật đúng mức 1.2 triệu đồng/tháng theo hướng dẫn mới nhất, được miễn tính thuế TNCN.',
      suggestedAction: 'Đã đồng bộ chuẩn'
    },
    {
      id: 'CONF-04',
      category: 'Bồi dưỡng độc hại bằng hiện vật',
      regulationValue: 'Mức 1 (13k), Mức 2 (20k), Mức 3 (26k), Mức 4 (32k) cấp phát sữa/đường',
      systemSettingValue: `Mức 1 (${formData.toxicAllowanceTier1.toLocaleString('vi-VN')}đ), Mức 2 (${formData.toxicAllowanceTier2.toLocaleString('vi-VN')}đ), Mức 3 (${formData.toxicAllowanceTier3.toLocaleString('vi-VN')}đ), Mức 4 (${formData.toxicAllowanceTier4.toLocaleString('vi-VN')}đ)`,
      isConflict: false,
      legalReference: 'Thông tư 24/2022/TT-BLĐTBXH',
      explanation: 'Quy đổi hiện vật cấp phát trực tiếp cho người lao động làm việc trong điều kiện có yếu tố nguy hiểm độc hại.',
      suggestedAction: 'Chính xác theo Thông tư 24'
    }
  ];

  const handleRunAiAudit = () => {
    setIsScanning(true);
    setScanCompleted(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
    }, 1200);
  };

  const handleOneClickSync = () => {
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  return (
    <div className="space-y-3.5 animate-in fade-in">
      {/* Tiêu đề thanh tác vụ - Nhỏ gọn, tinh giản */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base font-bold text-slate-900">Bảng Quy Ước & Kho Văn Bản Pháp Quy Doanh Nghiệp</h1>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Quản lý tham số phần mềm, kho văn bản hiệu lực (2.1 toàn phần, 2.2 một phần), văn bản hết hiệu lực và trợ lý AI rà soát đối chiếu xung đột chính sách
          </p>
        </div>

        {activeTab === 'POLICY_ENGINE' && (
          <button
            onClick={() => handleSubmit()}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Đã Lưu Thành Công!' : 'Lưu Quy Ước Áp Dụng'}</span>
          </button>
        )}
      </div>

      {/* 4 Tabs chuyển đổi phân hệ theo đúng yêu cầu người dùng */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white px-3 pt-2 rounded-xl shadow-2xs gap-2 sm:gap-3 text-xs">
        {/* TAB 1 */}
        <button
          onClick={() => setActiveTab('POLICY_ENGINE')}
          className={`flex items-center space-x-1.5 pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'POLICY_ENGINE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>1. Cấu Hình Quy Ước Chấm Công & Lương</span>
        </button>

        {/* TAB 2: ĐANG HIỆU LỰC (2.1 TOÀN PHẦN & 2.2 MỘT PHẦN) */}
        <button
          onClick={() => setActiveTab('DOCUMENT_REPOSITORY')}
          className={`flex items-center space-x-1.5 pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'DOCUMENT_REPOSITORY'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderLock className="w-3.5 h-3.5 text-emerald-600" />
          <span>2. Kho Văn Bản Đang Hiệu Lực</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {activeDocs.length} (2.1 &amp; 2.2)
          </span>
        </button>

        {/* TAB 3: HẾT HIỆU LỰC HOÀN TOÀN (LƯU TRỮ LỊCH SỬ) */}
        <button
          onClick={() => setActiveTab('EXPIRED_REPOSITORY')}
          className={`flex items-center space-x-1.5 pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'EXPIRED_REPOSITORY'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Archive className="w-3.5 h-3.5 text-rose-600" />
          <span>3. Kho Văn Bản Hết Hiệu Lực Hoàn Toàn</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
            {expiredDocs.length}
          </span>
        </button>

        {/* TAB 4: AI RÀ SOÁT & ĐỐI CHIẾU XUNG ĐỘT (TỪ NHÓM 3 CŨ SANG NHÓM 4) */}
        <button
          onClick={() => setActiveTab('AI_CONFLICT_ANALYZER')}
          className={`flex items-center space-x-1.5 pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'AI_CONFLICT_ANALYZER'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>4. AI Rà Soát & Đối Chiếu Xung Đột Chính Sách</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
            AI Engine
          </span>
        </button>
      </div>

      {/* PHÂN HỆ 1: CẤU HÌNH QUY TẮC PHẦN MỀM (CO GỌN TRONG 1 TRANG WEB - 6 BẢNG ĐỐI XỨNG 2 HÀNG x 3 CỘT) */}
      {activeTab === 'POLICY_ENGINE' && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* BẢNG 1: CHU KỲ TÍNH LƯƠNG & NGÀY NGHỈ TUẦN */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-900">1. Chu Kỳ Tính Lương & Nghỉ Tuần</h2>
                    <p className="text-[10px] text-slate-400">Khung tính công & chế độ ngày Thứ 7</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Chu kỳ tính công & trả lương</label>
                    <select
                      value={formData.payrollCycleType}
                      onChange={(e) => setFormData({ ...formData, payrollCycleType: e.target.value as any })}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="CYCLE_26_TO_25">Ngày 26 tháng trước đến 25 tháng này</option>
                      <option value="MONTH_START_END">Ngày 01 đến ngày cuối tháng</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Công chuẩn/tháng</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={formData.standardWorkDaysPerMonth}
                          onChange={(e) => setFormData({ ...formData, standardWorkDaysPerMonth: Number(e.target.value) })}
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                        />
                        <span className="text-[11px] text-slate-500 ml-1.5 shrink-0">ngày</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Chế độ Thứ 7</label>
                      <select
                        value={formData.saturdayPolicy}
                        onChange={(e) => setFormData({ ...formData, saturdayPolicy: e.target.value as any })}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="MORNING_ONLY">Sáng T7</option>
                        <option value="FULL_OFF">Nghỉ T7 & CN</option>
                        <option value="FULL_WORK">Cả ngày T7</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Chốt lương trước mùng 5</span>
                <span className="text-indigo-600 font-semibold">Chuẩn NQLĐ 2026</span>
              </div>
            </div>

            {/* BẢNG 2: QUY TẮC TRỪ CÔNG ĐI MUỘN / VỀ SỚM */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-900">2. Trừ Công Đi Muộn / Về Sớm</h2>
                    <p className="text-[10px] text-slate-400">Quy đổi giờ công chuẩn Điều 127 BLLĐ</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] block">Mức 1 (Trễ nhẹ)</span>
                      <span className="text-[10px] text-amber-700 font-semibold">Khấu trừ 30 phút công</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">1 -</span>
                      <input
                        type="number"
                        value={formData.lateRuleLevel1Minutes}
                        onChange={(e) => setFormData({ ...formData, lateRuleLevel1Minutes: Number(e.target.value) })}
                        className="w-12 p-1 text-xs text-center border border-slate-300 rounded font-bold bg-white"
                      />
                      <span className="text-[10px] text-slate-500">phút</span>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] block">Mức 2 (Trung bình)</span>
                      <span className="text-[10px] text-orange-700 font-semibold">Khấu trừ 60 phút công</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">{formData.lateRuleLevel1Minutes + 1} -</span>
                      <input
                        type="number"
                        value={formData.lateRuleLevel2Minutes}
                        onChange={(e) => setFormData({ ...formData, lateRuleLevel2Minutes: Number(e.target.value) })}
                        className="w-12 p-1 text-xs text-center border border-slate-300 rounded font-bold bg-white"
                      />
                      <span className="text-[10px] text-slate-500">phút</span>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg border border-rose-100 bg-rose-50/50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] block">Mức 3 (Trễ nặng)</span>
                      <span className="text-[10px] text-rose-700 font-semibold">Không tính công khung ca</span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-bold">&gt; {formData.lateRuleLevel2Minutes} phút</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Nghiêm cấm phạt tiền</span>
                <span className="text-amber-700 font-semibold">Quy đổi thời gian công</span>
              </div>
            </div>

            {/* BẢNG 3: HỆ SỐ LÀM THÊM GIỜ (OT) & LÀM ĐÊM */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-900">3. Hệ Số Làm Thêm Giờ (OT) & Đêm</h2>
                    <p className="text-[10px] text-slate-400">Định mức hệ số chuẩn Điều 98 BLLĐ</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="p-2 rounded-lg border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] text-slate-500 block">OT Ngày Thường</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">{formData.otDayNormalRate * 100}%</span>
                    <span className="text-[9px] text-slate-400">× 1.5 lương ca</span>
                  </div>

                  <div className="p-2 rounded-lg border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] text-slate-500 block">OT Nghỉ Hàng Tuần</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">{formData.otDayWeekendRate * 100}%</span>
                    <span className="text-[9px] text-slate-400">× 2.0 lương ca</span>
                  </div>

                  <div className="p-2 rounded-lg border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] text-slate-500 block">OT Lễ, Tết Có Lương</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">{formData.otDayHolidayRate * 100}%</span>
                    <span className="text-[9px] text-slate-400">× 3.0 lương ca</span>
                  </div>

                  <div className="p-2 rounded-lg border border-indigo-200 bg-indigo-50/50">
                    <span className="text-[10px] text-indigo-600 font-semibold block">Phụ Trội Làm Đêm</span>
                    <span className="text-sm font-bold text-indigo-700 block mt-0.5">+{formData.nightWorkBonusRate * 100}%</span>
                    <span className="text-[9px] text-indigo-500">Khung 22h - 6h sáng</span>
                  </div>
                </div>

                {/* Nút kiểm soát Khóa OT khi đạt trần 40h/tháng theo Điều 107 BLLĐ */}
                <div className="mt-2.5 p-2 rounded-lg border border-slate-200 bg-slate-50/80">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-semibold text-slate-800">Khóa Đăng Ký Thêm OT Khi Đạt Trần</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-800">Điều 107 BLLĐ</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        {formData.autoLockOtAtMonthlyCap 
                          ? `Đang BẬT: Hệ thống tự động khóa quyền tạo thêm đơn OT khi đạt ≥ ${formData.otMonthlyCapHours || 40}h/tháng.`
                          : 'Đang TẮT (mặc định): Tùy chọn dành riêng theo nhu cầu từng doanh nghiệp kích hoạt.'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.autoLockOtAtMonthlyCap ?? false}
                        onChange={(e) => setFormData(prev => ({ ...prev, autoLockOtAtMonthlyCap: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  {formData.autoLockOtAtMonthlyCap && (
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] text-slate-600 font-medium">Mức trần khóa tự động:</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={formData.otMonthlyCapHours ?? 40}
                          onChange={(e) => setFormData(prev => ({ ...prev, otMonthlyCapHours: Number(e.target.value) || 40 }))}
                          className="w-14 h-6 text-center text-xs font-bold border border-slate-300 rounded px-1 text-indigo-700 bg-white focus:border-indigo-500 focus:outline-none"
                          min="20"
                          max="60"
                        />
                        <span className="text-[10px] text-slate-500 font-medium">giờ/tháng</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Tính tự động theo máy chấm</span>
                <span className="text-emerald-700 font-semibold">Tối thiểu 150% - 300%</span>
              </div>
            </div>

            {/* BẢNG 4: BỒI DƯỠNG HIỆN VẬT ĐỘC HẠI (TT 24/2022) */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                    <Milk className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-900">4. Hiện Vật Độc Hại (TT 24/2022)</h2>
                    <p className="text-[10px] text-slate-400">Cấp phát bằng hiện vật (sữa, đường/ca)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] text-slate-500 block truncate">Mức 1 (Độc hại nhẹ)</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{formData.toxicAllowanceTier1.toLocaleString('vi-VN')} đ/ngày</span>
                  </div>

                  <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] text-slate-500 block truncate">Mức 2 (Đóng gói/chiên)</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{formData.toxicAllowanceTier2.toLocaleString('vi-VN')} đ/ngày</span>
                  </div>

                  <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] text-slate-500 block truncate">Mức 3 (Lò sấy/nhiệt)</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{formData.toxicAllowanceTier3.toLocaleString('vi-VN')} đ/ngày</span>
                  </div>

                  <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/60">
                    <span className="text-[10px] text-slate-500 block truncate">Mức 4 (Đặc biệt nặng)</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{formData.toxicAllowanceTier4.toLocaleString('vi-VN')} đ/ngày</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                <span className="text-rose-600 font-medium">Không chi bằng tiền mặt</span>
                <span className="text-orange-700 font-semibold">Theo ca thực tế</span>
              </div>
            </div>

            {/* BẢNG 5: TIỀN ĂN GIỮA CA & MIỄN THUẾ TNCN */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-900">5. Tiền Ăn Giữa Ca & Miễn Thuế</h2>
                    <p className="text-[10px] text-slate-400">Chế độ phúc lợi theo Thông tư 111/2013</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg border border-teal-200 bg-teal-50/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-teal-800 font-medium block">Định mức tiền ăn ca</span>
                      <span className="font-bold text-teal-900 text-sm">{(formData.shiftMealAllowancePerDay || 40000).toLocaleString('vi-VN')} đ/ngày</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-teal-600 block">Tối đa (26 công)</span>
                      <span className="font-bold text-teal-800 text-xs">~1.200.000 đ/tháng</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/60">
                      <span className="text-[10px] text-slate-500 block">Hiệu lực áp dụng</span>
                      <span className="font-bold text-slate-800 text-xs font-mono block mt-0.5">{formData.shiftMealEffectiveDate || '2026-01-01'}</span>
                    </div>

                    <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/60">
                      <span className="text-[10px] text-slate-500 block">Miễn trừ thuế TNCN</span>
                      <span className="font-bold text-emerald-700 text-xs block mt-0.5">Toàn bộ suất ăn</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Áp dụng theo ngày công thực tế</span>
                <span className="text-teal-700 font-semibold">QĐ số 88/2026</span>
              </div>
            </div>

            {/* BẢNG 6: TỶ LỆ TRÍCH ĐÓNG BHXH & CHẾ ĐỘ NGHỈ PHÉP */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-900">6. Tỷ Lệ Đóng BHXH &amp; Phép Năm</h2>
                    <p className="text-[10px] text-slate-400">Luật BHXH và Điều 113 - 114 BLLĐ</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/60">
                      <span className="text-[10px] text-slate-500 block">Doanh nghiệp đóng</span>
                      <span className="font-bold text-blue-700 text-sm block mt-0.5">21.5%</span>
                      <span className="text-[9px] text-slate-400">BHXH 17.5%, BHYT 3%, BHTN 1%</span>
                    </div>

                    <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/60">
                      <span className="text-[10px] text-slate-500 block">Người lao động đóng</span>
                      <span className="font-bold text-slate-800 text-sm block mt-0.5">10.5%</span>
                      <span className="text-[9px] text-slate-400">BHXH 8%, BHYT 1.5%, BHTN 1%</span>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg border border-blue-100 bg-blue-50/40 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] block">Nghỉ Phép Năm Cơ Bản</span>
                      <span className="text-[10px] text-blue-700 font-medium">Thâm niên: Cứ 5 năm được +1 ngày</span>
                    </div>
                    <span className="text-xs font-bold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                      12 ngày/năm
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Kinh phí công đoàn: 2% (DN)</span>
                <span className="text-blue-700 font-semibold">Tự động trích trừ</span>
              </div>
            </div>

            {/* BẢNG 7: THIẾT LẬP BIỂU THUẾ TNCN (5 BẬC MỚI / 7 BẬC CŨ CÓ NGÀY ÁP DỤNG) */}
            <div className="bg-white rounded-xl border border-indigo-200 p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-white via-indigo-50/20 to-amber-50/20">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-100 pb-2 mb-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>7. Thiết Lập Biểu Thuế TNCN (Biểu 5 Bậc Mới &amp; Biểu 7 Bậc Cũ Có Ngày Áp Dụng)</span>
                        <span className="text-[9.5px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Luật Thuế TNCN 109/2025/QH15
                        </span>
                      </h2>
                      <p className="text-[10px] text-slate-500">
                        Quy định chuyển tiếp: Thu nhập từ 2026 áp dụng Biểu 5 bậc mới (Đến 10tr: 5%, 10-30tr: 10%, 30-60tr: 20%, 60-100tr: 30%, &gt;100tr: 35%); các giai đoạn trước ngày áp dụng vẫn tính theo Biểu 7 bậc cũ.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">Chế độ biểu thuế:</span>
                    <select
                      value={formData.pitTableType || 'AUTO_BY_DATE'}
                      onChange={(e) => setFormData({ ...formData, pitTableType: e.target.value as any })}
                      className="text-xs p-1 px-2 rounded-lg border border-indigo-300 bg-white font-bold text-indigo-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="AUTO_BY_DATE">Tự động theo ngày áp dụng (Khuyên dùng)</option>
                      <option value="FORCE_5_TIERS">Luôn áp dụng Biểu 5 bậc mới</option>
                      <option value="FORCE_7_TIERS">Cố định Biểu 7 bậc cũ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  {/* Cột 1: Mốc ngày hiệu lực */}
                  <div className="p-2.5 rounded-xl border border-indigo-100 bg-white shadow-2xs space-y-2">
                    <span className="text-[11px] font-bold text-indigo-900 block border-b border-slate-100 pb-1">
                      Mốc Ngày Hiệu Lực Áp Dụng
                    </span>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Ngày bắt đầu áp dụng Biểu 5 bậc:</label>
                      <input
                        type="date"
                        value={formData.pit5TiersEffectiveDate || '2026-01-01'}
                        onChange={(e) => setFormData({ ...formData, pit5TiersEffectiveDate: e.target.value })}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-300 font-mono font-bold bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-tight">
                      • Bảng lương từ tháng <b className="text-indigo-700">{(formData.pit5TiersEffectiveDate || '2026-01-01').substring(0, 7)}</b> trở đi: Hệ thống tự động tính Biểu 5 Bậc mới.<br/>
                      • Các tháng trước mốc này: Hệ thống tự động tính theo Biểu 7 Bậc cũ.
                    </p>
                  </div>

                  {/* Cột 2: So sánh biểu 5 bậc vs 7 bậc */}
                  <div className="p-2.5 rounded-xl border border-indigo-100 bg-white shadow-2xs space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-900 block border-b border-slate-100 pb-1">
                      Chi Tiết Biểu Thuế 5 Bậc Mới (Luật mới)
                    </span>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="flex justify-between p-1 rounded bg-emerald-50 text-emerald-950">
                        <span>Bậc 1: Đến 10 triệu</span>
                        <b className="font-bold">5%</b>
                      </div>
                      <div className="flex justify-between p-1 rounded bg-emerald-50/70 text-emerald-950">
                        <span>Bậc 2: &gt;10 - 30 triệu</span>
                        <b className="font-bold">10% (-0.5tr)</b>
                      </div>
                      <div className="flex justify-between p-1 rounded bg-emerald-50/70 text-emerald-950">
                        <span>Bậc 3: &gt;30 - 60 triệu</span>
                        <b className="font-bold">20% (-3.5tr)</b>
                      </div>
                      <div className="flex justify-between p-1 rounded bg-emerald-50/50 text-emerald-950">
                        <span>Bậc 4: &gt;60 - 100 triệu</span>
                        <b className="font-bold">30% (-9.5tr)</b>
                      </div>
                      <div className="flex justify-between p-1 rounded bg-emerald-50/50 text-emerald-950">
                        <span>Bậc 5: &gt;100 triệu</span>
                        <b className="font-bold">35% (-14.5tr)</b>
                      </div>
                    </div>
                  </div>

                  {/* Cột 3: Giảm trừ gia cảnh */}
                  <div className="p-2.5 rounded-xl border border-indigo-100 bg-white shadow-2xs space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 block border-b border-slate-100 pb-1">
                      Mức Giảm Trừ Gia Cảnh
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9.5px] text-slate-500 block mb-0.5">Bản thân (Biểu cũ):</label>
                        <FormattedNumberInput
                          value={formData.personalDeduction || 11000000}
                          onChange={(val) => setFormData({ ...formData, personalDeduction: val })}
                          className="w-full text-xs p-1 rounded border border-slate-300 font-bold text-right"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] text-slate-500 block mb-0.5">Người phụ thuộc (cũ):</label>
                        <FormattedNumberInput
                          value={formData.dependentDeduction || 4400000}
                          onChange={(val) => setFormData({ ...formData, dependentDeduction: val })}
                          className="w-full text-xs p-1 rounded border border-slate-300 font-bold text-right"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed border-slate-200">
                      <div>
                        <label className="text-[9.5px] text-emerald-700 block mb-0.5 font-semibold">Bản thân (Mới):</label>
                        <FormattedNumberInput
                          value={formData.pit5PersonalDeduction || 15500000}
                          onChange={(val) => setFormData({ ...formData, pit5PersonalDeduction: val })}
                          className="w-full text-xs p-1 rounded border border-emerald-300 bg-emerald-50/50 font-bold text-emerald-900 text-right"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] text-emerald-700 block mb-0.5 font-semibold">Người phụ thuộc (Mới):</label>
                        <FormattedNumberInput
                          value={formData.pit5DependentDeduction || 6200000}
                          onChange={(val) => setFormData({ ...formData, pit5DependentDeduction: val })}
                          className="w-full text-xs p-1 rounded border border-emerald-300 bg-emerald-50/50 font-bold text-emerald-900 text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-100 text-[10px] text-indigo-900 flex items-center justify-between">
                <span>Rà soát chuẩn theo Luật Thuế TNCN số 109/2025/QH15 &amp; Nghị quyết Quốc hội</span>
                <span className="text-emerald-700 font-bold">✓ Tương thích hồi tố &amp; tính tương lai</span>
              </div>
            </div>

            {/* BẢNG 8: QUY ƯỚC BÁO CÁO CÔNG VIỆC HẰNG NGÀY & HIỆU SUẤT KPI */}
            <div className="bg-white rounded-xl border border-indigo-200 p-3.5 shadow-2xs flex flex-col justify-between space-y-2.5 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-100 pb-2 mb-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>8. Quy Ước Báo Cáo Công Việc Hằng Ngày &amp; Hiệu Suất KPI</span>
                        <span className="text-[9.5px] font-bold px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                          MBO &amp; OKRs Enterprise
                        </span>
                      </h2>
                      <p className="text-[10px] text-slate-500">
                        Thiết lập tính minh bạch trong báo cáo tiến độ, quyền xem chéo phòng ban và tự động hóa tính điểm thưởng lương.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Tùy chọn 1: Xem báo cáo của Trưởng phòng */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-slate-900 block">
                        Cho phép Nhân viên xem Báo cáo của Trưởng phòng
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        {formData.allowEmployeesViewDeptHeadReport 
                          ? 'Đang BẬT: Nhân sự cấp dưới được quyền đọc nhật ký công việc hằng ngày của Quản lý phòng mình để tăng tính minh bạch hai chiều.'
                          : 'Đang TẮT (mặc định): Nhân viên chỉ xem được báo cáo của đồng nghiệp ngang cấp; chỉ Ban Giám Đốc mới xem được báo cáo của Trưởng phòng.'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox"
                        checked={formData.allowEmployeesViewDeptHeadReport ?? false}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowEmployeesViewDeptHeadReport: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Tùy chọn 2: Tự động liên kết KPI vào thưởng lương */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-slate-900 block">
                        Tự động liên kết Điểm KPI vào Thưởng Hiệu Suất Bảng Lương
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        {formData.autoLinkKpiToPayroll !== false
                          ? 'Đang BẬT (mặc định): Khi chốt kỳ đánh giá KPI, hệ số xếp loại (A: 120%, B: 100%, C: 80%) tự động chuyển sang cột Thưởng KPI trong Bảng Lương.'
                          : 'Đang TẮT: C&B sẽ nhập tay hoặc phê duyệt riêng mức thưởng hiệu suất cho từng nhân sự.'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox"
                        checked={formData.autoLinkKpiToPayroll !== false}
                        onChange={(e) => setFormData(prev => ({ ...prev, autoLinkKpiToPayroll: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-100 text-[10px] text-indigo-900 flex items-center justify-between">
                <span>100% công việc phải gắn với Mục tiêu KPI tháng hoặc Mô tả công việc (JD)</span>
                <span className="text-emerald-700 font-bold">✓ Kiểm soát mục tiêu không chệch hướng</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* PHÂN HỆ 2: KHO VĂN BẢN ĐANG HIỆU LỰC (2.1 TOÀN PHẦN • 2.2 MỘT PHẦN) */}
      {activeTab === 'DOCUMENT_REPOSITORY' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <FolderLock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Kho Văn Bản Quy Định Đang Hiệu Lực Thi Hành
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bao gồm nhóm <b>2.1 Hiệu lực toàn phần</b> (áp dụng 100%) và nhóm <b>2.2 Hiệu lực một phần</b> (vẫn đang áp dụng nhưng đã có văn bản mới thay thế một số điều khoản cụ thể).
              </p>
            </div>

            {/* Thanh lọc 2.1 & 2.2 */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveValidityFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeValidityFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất Cả ({activeDocs.length})
              </button>
              <button
                onClick={() => setActiveValidityFilter('FULL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeValidityFilter === 'FULL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                <span>2.1 Toàn Phần ({fullCount})</span>
              </button>
              <button
                onClick={() => setActiveValidityFilter('PARTIAL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeValidityFilter === 'PARTIAL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-700 hover:text-amber-800'
                }`}
              >
                <span>2.2 Một Phần ({partialCount})</span>
              </button>
            </div>
          </div>

          {/* Grid các văn bản đang hiệu lực */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredActiveDocs.map((doc) => {
              const isExcel = doc.fileName.endsWith('.xlsx') || doc.fileName.endsWith('.xls');
              const isPartial = doc.validityScope === 'PARTIAL';

              return (
                <div 
                  key={doc.id} 
                  className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 ${
                    isPartial ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {isPartial ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Nhóm 2.2: Hiệu Lực Một Phần</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Nhóm 2.1: Hiệu Lực Toàn Phần</span>
                          </span>
                        )}

                        {doc.isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                            <span>Đã Duyệt &amp; Áp Dụng</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{doc.version}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{doc.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{doc.summary}</p>

                    {/* Hộp ghi chú chi tiết phần bị thay thế một phần (Cho nhóm 2.2) */}
                    {isPartial && doc.partialValidityNote && (
                      <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs space-y-1">
                        <span className="font-bold flex items-center gap-1 text-[11px] text-amber-800 uppercase tracking-wide">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Chi tiết điều khoản bị thay thế / sửa đổi một phần:</span>
                        </span>
                        <p className="text-[11px] text-amber-950 leading-relaxed">
                          {doc.partialValidityNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Khu Vực Quản Lý 02 Loại Link Văn Bản & Quyền Xem/Tải */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Hiệu lực từ: <b className="text-indigo-600 font-mono">{doc.effectiveDate}</b></span>
                      <span>Dung lượng: <b className="text-slate-800">{doc.fileSizeText}</b></span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* LINK 1: BẢN PDF CÔNG TY ĐÃ DUYỆT (Mọi user đều xem được) */}
                      <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-rose-600" />
                            <span>Bản PDF Đã Duyệt</span>
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {doc.isApproved ? '✓ Đã duyệt: Mọi user đều được xem trực tiếp' : 'Chưa áp dụng'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => setViewerModalState({
                              isOpen: true,
                              title: doc.title,
                              subTitle: `Văn bản chính thức: ${doc.fileName}`,
                              fileType: 'INTERNAL_DOC',
                              fileUrl: doc.linkPdf,
                              customContent: doc.contentText,
                              canDownloadPrint: isPayrollOrAdmin,
                              metadata: {
                                canBoGui: 'Ban Lãnh Đạo / Phòng Pháp Chế',
                                dotBaoCao: doc.version,
                                ngayGui: doc.effectiveDate,
                                ghiChu: isPartial ? 'Văn bản có hiệu lực một phần (Nhóm 2.2)' : 'Bản chính thức hiệu lực toàn phần (Nhóm 2.1)'
                              }
                            })}
                            className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Mở xem trực tiếp nội dung bản PDF đã duyệt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Mở Xem PDF</span>
                          </button>

                          {isPayrollOrAdmin ? (
                            <button
                              onClick={() => {
                                if (doc.linkPdf) window.open(doc.linkPdf, '_blank');
                                else alert('Đang tải bản PDF đã ký đóng dấu...');
                              }}
                              className="p-1.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg cursor-pointer transition-colors"
                              title="Tải xuống bản PDF (Chỉ Quản trị & Tiền lương)"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span 
                              className="p-1.5 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed border border-slate-200" 
                              title="Chỉ User Quản trị và Tiền lương mới được tải xuống"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* LINK 2: BẢN OFFICE (WORD/EXCEL) (Chỉ user Tiền lương và Quản trị thao tác) */}
                      <div className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                        isPayrollOrAdmin 
                          ? 'border-indigo-200 bg-indigo-50/50' 
                          : 'border-slate-200 bg-slate-50 opacity-75'
                      }`}>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1">
                            {isExcel ? <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-indigo-600" />}
                            <span>Bản Office ({isExcel ? 'Excel' : 'Word'})</span>
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {isPayrollOrAdmin ? '✓ Quyền hạn: Quản trị & Tiền lương' : '🔒 Khóa: Giới hạn quyền truy cập'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          {isPayrollOrAdmin ? (
                            <>
                              <button
                                onClick={() => setViewerModalState({
                                  isOpen: true,
                                  title: doc.title,
                                  subTitle: `Tệp soạn thảo: ${doc.fileName}`,
                                  fileType: isExcel ? 'EXCEL' : 'WORD',
                                  fileUrl: doc.linkOffice,
                                  canDownloadPrint: true,
                                  metadata: {
                                    canBoGui: 'Phòng Nhân sự & Tiền Lương',
                                    dotBaoCao: doc.version,
                                    ngayGui: doc.uploadDate,
                                    ghiChu: 'Bản thảo định dạng Office phục vụ điều chỉnh nội dung.'
                                  }
                                })}
                                className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                title="Mở xem trực tiếp bản thảo Office"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Mở Bản Office</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (doc.linkOffice) window.open(doc.linkOffice, '_blank');
                                  else alert('Đang tải tệp Office gốc...');
                                }}
                                className="p-1.5 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-lg cursor-pointer transition-colors"
                                title="Tải xuống bản Office gốc"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="w-full py-1.5 px-2 bg-slate-200 text-slate-500 rounded-lg text-[10px] font-semibold text-center flex items-center justify-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Chỉ Quản Trị &amp; Tiền Lương Mới Mở Được</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PHÂN HỆ 3: KHO VĂN BẢN HẾT HIỆU LỰC HOÀN TOÀN (LƯU TRỮ LỊCH SỬ) */}
      {activeTab === 'EXPIRED_REPOSITORY' && (
        <div className="space-y-6">
          <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <FileX2 className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-rose-950">
                  Kho Văn Bản Đã Hết Hiệu Lực Hoàn Toàn (Lưu Trữ Lịch Sử)
                </h3>
              </div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Tất cả các văn bản quy chế, nội quy, thang lương cũ đã chấm dứt giá trị thi hành. Hệ thống vẫn cho phép <b>mở xem trực tiếp</b> cả 02 loại link (PDF &amp; Office) nhằm phục vụ tra cứu lịch sử, giải trình khi cơ quan quản lý nhà nước thanh kiểm tra quá khứ.
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold shrink-0">
              Tổng số văn bản cũ: {expiredDocs.length}
            </span>
          </div>

          {/* Grid văn bản hết hiệu lực */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {expiredDocs.map((doc) => {
              const isExcel = doc.fileName.endsWith('.xlsx') || doc.fileName.endsWith('.xls');

              return (
                <div 
                  key={doc.id} 
                  className="bg-slate-50/90 rounded-2xl border border-slate-300 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Con tem Watermark HẾT HIỆU LỰC HOÀN TOÀN */}
                  <div className="absolute top-3 right-[-32px] transform rotate-45 bg-rose-600 text-white text-[9px] font-black tracking-wider px-8 py-0.5 shadow-sm uppercase pointer-events-none">
                    HẾT HIỆU LỰC
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-xs uppercase">
                        <FileX2 className="w-3 h-3 text-rose-600" />
                        <span>Hết Hiệu Lực Hoàn Toàn</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{doc.version}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-700 leading-snug line-through decoration-rose-400">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{doc.summary}</p>

                    {/* Khung thông tin văn bản thay thế & lý do hết hiệu lực */}
                    <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-950 text-xs space-y-1.5">
                      <div className="flex items-start gap-1">
                        <span className="font-bold text-[11px] text-rose-800 uppercase tracking-wide shrink-0">Thay thế bởi:</span>
                        <span className="font-bold text-indigo-900">{doc.supersededBy || 'Văn bản mới'}</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="font-bold text-[11px] text-rose-800 uppercase tracking-wide shrink-0">Lý do:</span>
                        <span className="text-slate-700">{doc.expiredReason}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vẫn cho phép mở xem 02 loại link với tem cảnh báo */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Hết hiệu lực từ: <b className="text-rose-700 font-mono">{doc.expiredDate || 'Quá khứ'}</b></span>
                      <span>Dung lượng: <b className="text-slate-700">{doc.fileSizeText}</b></span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* LINK 1: BẢN PDF CŨ */}
                      <div className="p-2 rounded-xl border border-slate-300 bg-white flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-rose-600" />
                            <span>Bản PDF Lịch Sử</span>
                          </span>
                          <span className="text-[9px] text-slate-400">Đọc lịch sử</span>
                        </div>

                        <button
                          onClick={() => setViewerModalState({
                            isOpen: true,
                            title: doc.title,
                            subTitle: `Tài liệu lưu trữ: ${doc.fileName}`,
                            fileType: 'INTERNAL_DOC',
                            fileUrl: doc.linkPdf,
                            customContent: doc.contentText,
                            canDownloadPrint: isPayrollOrAdmin,
                            isExpired: true,
                            expiredReason: doc.expiredReason,
                            supersededBy: doc.supersededBy,
                            metadata: {
                              canBoGui: 'Lưu Trữ Văn Thư',
                              dotBaoCao: doc.version,
                              ngayGui: doc.effectiveDate,
                              ghiChu: `Văn bản đã hết hiệu lực hoàn toàn từ ${doc.expiredDate}. Thay thế bởi: ${doc.supersededBy}`
                            }
                          })}
                          className="w-full py-1.5 px-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Mở xem lại văn bản PDF cũ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem PDF Cũ</span>
                        </button>
                      </div>

                      {/* LINK 2: BẢN OFFICE CŨ */}
                      <div className="p-2 rounded-xl border border-slate-300 bg-white flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            {isExcel ? <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> : <FileText className="w-3 h-3 text-indigo-600" />}
                            <span>Bản Office Cũ</span>
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {isPayrollOrAdmin ? 'Được mở' : 'Khóa'}
                          </span>
                        </div>

                        {isPayrollOrAdmin ? (
                          <button
                            onClick={() => setViewerModalState({
                              isOpen: true,
                              title: doc.title,
                              subTitle: `Tài liệu lưu trữ: ${doc.fileName}`,
                              fileType: isExcel ? 'EXCEL' : 'WORD',
                              fileUrl: doc.linkOffice,
                              canDownloadPrint: true,
                              isExpired: true,
                              expiredReason: doc.expiredReason,
                              supersededBy: doc.supersededBy,
                              metadata: {
                                canBoGui: 'Lưu Trữ Văn Thư',
                                dotBaoCao: doc.version,
                                ngayGui: doc.uploadDate,
                                ghiChu: `Tệp Office cũ đã hết hiệu lực. Thay thế bởi: ${doc.supersededBy}`
                              }
                            })}
                            className="w-full py-1.5 px-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Mở xem lại bản Office cũ"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem Office Cũ</span>
                          </button>
                        ) : (
                          <div className="w-full py-1.5 px-2 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-semibold text-center flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Chỉ Quản Trị Mở</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PHÂN HỆ 4: TRỢ LÝ AI RÀ SOÁT XUNG ĐỘT CHÍNH SÁCH (TỪ NHÓM 3 CŨ CHUYỂN SANG NHÓM 4) */}
      {activeTab === 'AI_CONFLICT_ANALYZER' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              <h3 className="font-bold text-base">4. AI Policy Compliance &amp; Conflict Analyzer</h3>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed max-w-3xl">
              Công cụ trí tuệ nhân tạo đối chiếu các văn bản nội bộ <b>"Nội quy lao động 2026"</b>, <b>"Thỏa ước LĐTT"</b> và <b>"Quy chế tiền lương"</b> với các tham số phần mềm HRM Soft đang vận hành thực tế. Tự động phát hiện các điểm sai lệch, nguy cơ vi phạm luật lao động hoặc bất cập nghiệp vụ và hỗ trợ đồng bộ hóa chỉ bằng một lần nhấp.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleRunAiAudit}
                disabled={isScanning}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-2 cursor-pointer"
              >
                {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isScanning ? 'Đang Phân Tích Văn Bản...' : 'Chạy Quét & So Sánh Ngay'}</span>
              </button>

              <button
                onClick={handleOneClickSync}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{syncSuccess ? 'Đã Đồng Bộ Xong!' : 'Đồng Bộ 1 Chạm Sang Phần Mềm'}</span>
              </button>
            </div>
          </div>

          {/* Bảng so sánh kết quả đối chiếu */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Kết Quả Rà Soát Chi Tiết Giữa Văn Bản Và Phần Mềm
              </h4>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Độ Tương Thích: 98% (Chuẩn Luật 100%)
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {conflictItems.map((item) => (
                <div key={item.id} className="p-4.5 hover:bg-slate-50/70 transition-colors space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {item.isConflict ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>XUNG ĐỘT</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                          <FileCheck2 className="w-3 h-3" />
                          <span>KHỚP CHUẨN</span>
                        </span>
                      )}
                      <b className="text-slate-900 font-bold text-sm">{item.category}</b>
                      <span className="text-[11px] text-slate-400">({item.legalReference})</span>
                    </div>

                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                      {item.suggestedAction}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Văn bản Nội quy quy định:</span>
                      <p className="font-semibold text-slate-800">{item.regulationValue}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Cấu hình phần mềm đang chạy:</span>
                      <p className="font-semibold text-slate-800">{item.systemSettingValue}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic pl-1">
                    <b>Đánh giá của AI:</b> {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM TRỰC TIẾP VĂN BẢN QUY ĐỊNH (Không cần tải file về máy) */}
      <FileViewerModal
        isOpen={viewerModalState.isOpen}
        onClose={() => setViewerModalState({ ...viewerModalState, isOpen: false })}
        title={viewerModalState.title}
        subTitle={viewerModalState.subTitle}
        fileType={viewerModalState.fileType}
        fileUrl={viewerModalState.fileUrl}
        customContent={viewerModalState.customContent}
        metadata={viewerModalState.metadata}
        canDownloadPrint={viewerModalState.canDownloadPrint}
        currentRole={currentRole}
        isExpired={viewerModalState.isExpired}
        expiredReason={viewerModalState.expiredReason}
        supersededBy={viewerModalState.supersededBy}
      />
    </div>
  );
};
