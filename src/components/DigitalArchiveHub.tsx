import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  X, 
  Eye, 
  Printer, 
  Check, 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  ClipboardCheck, 
  QrCode, 
  Key, 
  FileSignature, 
  ShieldCheck, 
  CheckCheck, 
  Folder, 
  FolderArchive, 
  Box, 
  Layers, 
  Truck, 
  Send, 
  FileSpreadsheet, 
  BarChart3, 
  Award, 
  HelpCircle, 
  BookOpen, 
  ExternalLink, 
  ArrowRight, 
  ChevronRight, 
  Tag, 
  Lock, 
  Unlock, 
  Share2, 
  Bookmark, 
  History, 
  Stamp, 
  FileCheck2, 
  Inbox, 
  SendHorizonal, 
  FileBox, 
  Archive
} from 'lucide-react';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';

interface DigitalArchiveHubProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
}

// 6 PHÂN HỆ NGHIỆP VỤ CHUYÊN BIỆT
export type ArchiveSubCategory = 
  | 'ARCHIVE_STORAGE_RACKS'   // 1. Kho Lưu Trữ Số Hóa & Sơ Đồ Kệ/Hộp Tài Liệu Vật Lý (Trọng tâm)
  | 'DOC_INCOMING_WORKFLOW'   // 2. Sổ Công Văn Đến, Bút Phê Điện Tử & Điều Phối SLA
  | 'DOC_OUTGOING_DISPATCH'   // 3. Sổ Công Văn Đi & Theo Dõi Vận Đơn Bưu Điện (VNPost/ViettelPost)
  | 'INTERNAL_POLICIES'       // 4. Quyết Định, Quy Chế & Văn Bản Quản Trị Nội Bộ
  | 'SEAL_AND_TOKEN_LOGS'     // 5. Sổ Quản Lý Con Dấu Pháp Nhân & Chữ Ký Số Token CA
  | 'CLERICAL_ANALYTICS';     // 6. Báo Cáo Thống Kê Văn Thư & Xuất Sổ Chuẩn NĐ 30/2020

// 1. Cấu trúc Hộp Lưu Trữ / Kệ Vật Lý
export interface ArchiveBox {
  id: string;
  boxCode: string; // VD: BOX-A1-01
  title: string;
  warehouseLocation: string; // Kho A (Khu Văn Phòng) / Kho B (Khu Xưởng)
  rackRow: string;           // Dãy Kệ A, B, C
  rackShelf: string;         // Kệ số 1, 2, 3
  shelfTier: number;         // Tầng 1 - 5
  retentionPeriod: 'PERMANENT' | '20_YEARS' | '10_YEARS' | '5_YEARS' | '1_YEAR';
  retentionLabel: string;
  totalFiles: number;
  capacityPercent: number;
  qrCode: string;
  status: 'SAFE' | 'FULL' | 'LENT_OUT';
  deptOwner: string;
  description: string;
}

// Sổ Mượn Trả Tài Liệu Gốc
export interface BorrowDocumentLog {
  id: string;
  boxId: string;
  boxCode: string;
  documentTitle: string;
  borrowerName: string;
  borrowerDept: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  purpose: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
}

// 2. Cấu trúc Công Văn Đến
export interface IncomingOfficialDoc {
  id: string;
  incomingNumber: string; // VD: ĐẾN-2026/045
  originalDocNumber: string; // VD: 1428/SLĐTBXH-TTr
  senderOrganization: string;
  issueDate: string;
  receivedDate: string;
  summary: string;
  urgency: 'NORMAL' | 'HIGH' | 'URGENT';
  confidentiality: 'NORMAL' | 'CONFIDENTIAL' | 'TOP_SECRET';
  leadershipDirective?: string;
  directiveSigner?: string;
  directiveDate?: string;
  assignedLeadDept: string; // Đơn vị chủ trì
  assignedSupportDept?: string; // Đơn vị phối hợp
  handlerStaff: string;
  processingDeadline: string;
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  fileAttachmentName: string;
}

// 3. Cấu trúc Công Văn Đi & Vận Đơn Bưu Điện
export interface OutgoingOfficialDoc {
  id: string;
  docNumber: string; // VD: 142/CV-AVF/2026
  documentType: 'CONG_VAN' | 'THONG_BAO' | 'TO_TRINH' | 'BIEN_BAN' | 'HOP_DONG';
  typeLabel: string;
  summary: string;
  signerName: string;
  signerTitle: string;
  releaseDate: string;
  recipientOrg: string;
  dispatchMethod: 'POST_VNPOST' | 'POST_VIETTEL' | 'INTERNAL_COURIER' | 'DIRECT_HANDOVER';
  courierBrand?: string;
  trackingCode?: string;
  deliveryStatus: 'PREPARING' | 'SENT' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';
  deliveredDate?: string;
  receivedByPerson?: string;
  fileAttachmentName: string;
}

// 4. Quyết Định & Quy Chế Nội Bộ
export interface InternalPolicyDoc {
  id: string;
  policyNumber: string; // VD: 45/QĐ-AVF/2026
  title: string;
  category: 'DECISION_PERSONNEL' | 'SALARY_POLICY' | 'WORK_RULES' | 'SOP_PROCEDURE';
  categoryLabel: string;
  signerName: string;
  effectiveDate: string;
  expiryDate?: string;
  validityStatus: 'ACTIVE' | 'SUPERSEDED' | 'EXPIRED' | 'AMENDED';
  supersededBy?: string;
  scope: string;
  fileAttachmentName: string;
}

// 5. Nhật Ký Đóng Dấu & Quản Lý Token CA
export interface SealUsageLog {
  id: string;
  sealType: 'COMPANY_ROUND' | 'LEGAL_REPRESENTATIVE' | 'TAX_CODE' | 'SEAL_ACROSS_PAGES';
  sealName: string;
  documentTitle: string;
  documentNumber: string;
  copiesCount: number;
  requesterName: string;
  requesterDept: string;
  approvedBy: string;
  stampedAt: string;
  purpose: string;
}

export interface DigitalTokenCA {
  id: string;
  tokenProvider: string; // Viettel-CA, VNPT-CA, FPT-CA
  tokenType: 'USB_TOKEN' | 'SMART_CA_CLOUD';
  purpose: string; // Khai Thuế & Hải Quan, Ký HĐLĐ Điện Tử, BHXH
  holderPerson: string;
  holderDept: string;
  certificateExpiryDate: string;
  daysRemaining: number;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
}

export const DigitalArchiveHub: React.FC<DigitalArchiveHubProps> = ({
  policy,
  employees,
  currentRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ArchiveSubCategory>('ARCHIVE_STORAGE_RACKS');

  // ==========================================================
  // 1. DỮ LIỆU KHO LƯU TRỮ SỐ HÓA & SƠ ĐỒ KỆ HỘP VẬT LÝ (TRỌNG TÂM)
  // ==========================================================
  const [archiveBoxes, setArchiveBoxes] = useState<ArchiveBox[]>([
    {
      id: 'BOX-001',
      boxCode: 'BOX-A1-01',
      title: 'Hồ Sơ Pháp Lý Thành Lập Công Ty & Giấy Phép ĐKKD Bản Gốc',
      warehouseLocation: 'Kho Lưu Trữ A (Khu Văn Phòng Tầng 2)',
      rackRow: 'Dãy Kệ A',
      rackShelf: 'Kệ Sắt 1',
      shelfTier: 1,
      retentionPeriod: 'PERMANENT',
      retentionLabel: 'Vĩnh Viễn (Luật Doanh Nghiệp)',
      totalFiles: 14,
      capacityPercent: 90,
      qrCode: 'QR-ARCH-A101',
      status: 'SAFE',
      deptOwner: 'Ban Giám Đốc & Pháp Chế',
      description: 'Giấy chứng nhận ĐKDN lần đầu và các lần thay đổi, Điều lệ công ty, Giấy phép đầu tư FDI.'
    },
    {
      id: 'BOX-002',
      boxCode: 'BOX-A1-02',
      title: 'Hồ Sơ Đất Đai, Mặt Bằng Xưởng & Nghiệm Thu PCCC Đã Cấp Phép',
      warehouseLocation: 'Kho Lưu Trữ A (Khu Văn Phòng Tầng 2)',
      rackRow: 'Dãy Kệ A',
      rackShelf: 'Kệ Sắt 1',
      shelfTier: 2,
      retentionPeriod: 'PERMANENT',
      retentionLabel: 'Vĩnh Viễn',
      totalFiles: 9,
      capacityPercent: 75,
      qrCode: 'QR-ARCH-A102',
      status: 'SAFE',
      deptOwner: 'Ban Quản Lý Dự Án & HSE',
      description: 'Sổ đỏ quyền sử dụng đất công nghiệp KCN, Hồ sơ thẩm duyệt PCCC PC07, Giấy phép xả thải DTM.'
    },
    {
      id: 'BOX-003',
      boxCode: 'BOX-A2-05',
      title: 'Hợp Đồng Lao Động & Hồ Sơ Nhân Sự Nghỉ Việc Giai Đoạn 2020 - 2025',
      warehouseLocation: 'Kho Lưu Trữ A (Khu Văn Phòng Tầng 2)',
      rackRow: 'Dãy Kệ A',
      rackShelf: 'Kệ Sắt 2',
      shelfTier: 3,
      retentionPeriod: '20_YEARS',
      retentionLabel: '20 Năm (Điều 11 BLLĐ)',
      totalFiles: 48,
      capacityPercent: 95,
      qrCode: 'QR-ARCH-A205',
      status: 'FULL',
      deptOwner: 'Phòng Hành Chính - Nhân Sự',
      description: 'Bản gốc HĐLĐ, quyết định thôi việc, quyết toán sổ BHXH của 120 CBCNV đã kết thúc hợp đồng.'
    },
    {
      id: 'BOX-004',
      boxCode: 'BOX-A3-12',
      title: 'Báo Cáo Tài Chính Đã Kiểm Toán & Sổ Cái Tổng Hợp 2018 - 2024',
      warehouseLocation: 'Kho Lưu Trữ A (Khu Văn Phòng Tầng 2)',
      rackRow: 'Dãy Kệ A',
      rackShelf: 'Kệ Sắt 3',
      shelfTier: 2,
      retentionPeriod: '10_YEARS',
      retentionLabel: '10 Năm (Luật Kế Toán)',
      totalFiles: 32,
      capacityPercent: 82,
      qrCode: 'QR-ARCH-A312',
      status: 'SAFE',
      deptOwner: 'Phòng Kế Toán - Tài Chính',
      description: 'Báo cáo kiểm toán độc lập PwC, biên bản thanh tra quyết toán thuế các năm, chứng từ chuyển tiền.'
    },
    {
      id: 'BOX-005',
      boxCode: 'BOX-B1-04',
      title: 'Công Văn Đi / Đến & Biên Bản Làm Việc Cơ Quan Nhà Nước 2025',
      warehouseLocation: 'Kho Lưu Trữ B (Khu Nhà Xưởng Sản Xuất)',
      rackRow: 'Dãy Kệ B',
      rackShelf: 'Kệ Sắt 1',
      shelfTier: 4,
      retentionPeriod: '5_YEARS',
      retentionLabel: '05 Năm (NĐ 30/2020/NĐ-CP)',
      totalFiles: 65,
      capacityPercent: 68,
      qrCode: 'QR-ARCH-B104',
      status: 'SAFE',
      deptOwner: 'Bộ Phận Văn Thư Lưu Trữ',
      description: 'Công văn trả lời Sở LĐ-TB&XH, Ban Quản Lý KCN, Hải quan và biên bản kiểm tra liên ngành.'
    },
    {
      id: 'BOX-006',
      boxCode: 'BOX-B2-08',
      title: 'Phiếu Nghỉ Phép, Sổ Giao Nhận Cơm Ca & Báo Cáo Tuần 2025',
      warehouseLocation: 'Kho Lưu Trữ B (Khu Nhà Xưởng Sản Xuất)',
      rackRow: 'Dãy Kệ B',
      rackShelf: 'Kệ Sắt 2',
      shelfTier: 5,
      retentionPeriod: '1_YEAR',
      retentionLabel: '01 Năm (Hết hạn chuẩn bị hủy)',
      totalFiles: 110,
      capacityPercent: 92,
      qrCode: 'QR-ARCH-B208',
      status: 'SAFE',
      deptOwner: 'Khối Sản Xuất & Xưởng Chế Biến',
      description: 'Đơn từ giải quyết sự vụ hành chính ngắn hạn, phiếu cấp phát đồng phục, giấy ra vào cổng.'
    }
  ]);

  // Sổ Theo Dõi Mượn / Trả Hồ Sơ Gốc
  const [borrowLogs, setBorrowLogs] = useState<BorrowDocumentLog[]>([
    {
      id: 'BR-2026-08',
      boxId: 'BOX-003',
      boxCode: 'BOX-A2-05',
      documentTitle: 'Hồ sơ gốc HĐLĐ & Giấy cam kết bảo mật của NV Hoàng Văn Thắng (AV-0210)',
      borrowerName: 'Nguyễn Thị Mai Chi',
      borrowerDept: 'Phòng Pháp Chế & HCNS',
      borrowDate: '08/09/2026',
      dueDate: '15/09/2026',
      purpose: 'Cung cấp hồ sơ gốc cho Tòa Án đối soát tranh chấp hợp đồng lao động',
      status: 'BORROWED'
    },
    {
      id: 'BR-2026-07',
      boxId: 'BOX-002',
      boxCode: 'BOX-A1-02',
      documentTitle: 'Bản vẽ hoàn công hệ thống họng nước vách tường & Giấy nghiệm thu PCCC',
      borrowerName: 'Phạm Hồng Thái',
      borrowerDept: 'Ban An Toàn & HSE',
      borrowDate: '02/09/2026',
      dueDate: '05/09/2026',
      returnDate: '04/09/2026',
      purpose: 'Phục vụ đoàn kiểm tra PCCC Công an Tỉnh nghiệm thu định kỳ',
      status: 'RETURNED'
    }
  ]);

  // ==========================================================
  // 2. DỮ LIỆU SỔ CÔNG VĂN ĐẾN, BÚT PHÊ LÃNH ĐẠO & ĐIỀU PHỐI SLA
  // ==========================================================
  const [incomingDocs, setIncomingDocs] = useState<IncomingOfficialDoc[]>([
    {
      id: 'DOC-IN-2026-045',
      incomingNumber: 'ĐẾN-2026/045',
      originalDocNumber: '1428/SLĐTBXH-TTr',
      senderOrganization: 'Sở Lao Động - Thương Binh & Xã Hội Tỉnh Bình Dương',
      issueDate: '04/09/2026',
      receivedDate: '06/09/2026',
      summary: 'Thông báo lịch thanh tra liên ngành việc chấp hành pháp luật lao động, tiền lương và BHLĐ năm 2026',
      urgency: 'URGENT',
      confidentiality: 'NORMAL',
      leadershipDirective: 'Giao Phòng HCNS chủ trì phối hợp Phòng Kế toán & Ban HSE chuẩn bị đầy đủ 12 đầu mục tài liệu, báo cáo Tổng Giám Đốc trước ngày 14/09.',
      directiveSigner: 'Tổng Giám Đốc Trần An',
      directiveDate: '06/09/2026 lúc 10:30',
      assignedLeadDept: 'Phòng Hành Chính - Nhân Sự',
      assignedSupportDept: 'Phòng Kế Toán, Ban HSE',
      handlerStaff: 'Trần Thị Thu Trang',
      processingDeadline: '2026-09-14',
      status: 'IN_PROGRESS',
      fileAttachmentName: '1428_SLDTBXH_ThongBaoThanhTra2026.pdf'
    },
    {
      id: 'DOC-IN-2026-046',
      incomingNumber: 'ĐẾN-2026/046',
      originalDocNumber: '3892/CT-TTKT',
      senderOrganization: 'Cục Thuế Tỉnh Bình Dương',
      issueDate: '05/09/2026',
      receivedDate: '07/09/2026',
      summary: 'Quyết định kiểm tra thuế sau hoàn thuế GTGT quý 2/2026 đối với mặt hàng thủy sản chế biến xuất khẩu',
      urgency: 'HIGH',
      confidentiality: 'CONFIDENTIAL',
      leadershipDirective: 'Kế toán trưởng Vũ Bích Ngọc trực tiếp chủ trì đối soát bảng kê hóa đơn điện tử và tờ khai hải quan.',
      directiveSigner: 'Tổng Giám Đốc Trần An',
      directiveDate: '07/09/2026 lúc 14:00',
      assignedLeadDept: 'Phòng Kế Toán - Tài Chính',
      assignedSupportDept: 'Kho Vận & Logistics',
      handlerStaff: 'Vũ Bích Ngọc (Kế toán trưởng)',
      processingDeadline: '2026-09-20',
      status: 'IN_PROGRESS',
      fileAttachmentName: '3892_QuyetDinhKiemTraThue_2026.pdf'
    },
    {
      id: 'DOC-IN-2026-047',
      incomingNumber: 'ĐẾN-2026/047',
      originalDocNumber: '512/PC07-PCCC',
      senderOrganization: 'Phòng Cảnh Sát PCCC & CNCH Công An Tỉnh',
      issueDate: '28/08/2026',
      receivedDate: '30/08/2026',
      summary: 'Biên bản kiểm tra an toàn PCCC định kỳ quý 3/2026: Yêu cầu bảo dưỡng máy bơm bù áp và bổ sung bình khí CO2 xưởng 2',
      urgency: 'NORMAL',
      confidentiality: 'NORMAL',
      leadershipDirective: 'Ban HSE thực hiện thay mới bình chữa cháy trước 10/09 và gửi báo cáo khắc phục.',
      directiveSigner: 'Giám Đốc Nhà Máy Hoàng',
      directiveDate: '30/08/2026',
      assignedLeadDept: 'Ban An Toàn & HSE',
      handlerStaff: 'Phạm Hồng Thái',
      processingDeadline: '2026-09-10',
      status: 'COMPLETED',
      fileAttachmentName: '512_BienBanPCCC_Q3_2026.pdf'
    }
  ]);

  // ==========================================================
  // 3. DỮ LIỆU SỔ CÔNG VĂN ĐI & VẬN ĐƠN BƯU ĐIỆN (VNPOST/VIETTELPOST)
  // ==========================================================
  const [outgoingDocs, setOutgoingDocs] = useState<OutgoingOfficialDoc[]>([
    {
      id: 'DOC-OUT-2026-088',
      docNumber: '142/CV-AVF/2026',
      documentType: 'CONG_VAN',
      typeLabel: 'Công Văn Phúc Đáp',
      summary: 'Báo cáo giải trình và khắc phục các kiến nghị an toàn lao động sau đợt tự kiểm tra ATLĐ Quý 3',
      signerName: 'Trần An',
      signerTitle: 'Tổng Giám Đốc',
      releaseDate: '2026-09-08',
      recipientOrg: 'Sở Lao Động - Thương Binh & Xã Hội Tỉnh Bình Dương',
      dispatchMethod: 'POST_VNPOST',
      courierBrand: 'Bưu Điện Việt Nam (VNPost)',
      trackingCode: 'VN-892193821-VN',
      deliveryStatus: 'DELIVERED',
      deliveredDate: '09/09/2026 lúc 14:30',
      receivedByPerson: 'Đ/c Lê Văn Nam (Văn thư Sở LĐ-TB&XH ký nhận)',
      fileAttachmentName: '142_CV_AVF_BaoCaoGiaiTrinhATLD.pdf'
    },
    {
      id: 'DOC-OUT-2026-089',
      docNumber: '143/CV-AVF/2026',
      documentType: 'CONG_VAN',
      typeLabel: 'Công Văn Giao Dịch',
      summary: 'Công văn đề nghị cung cấp kết quả kiểm nghiệm vi sinh lô hàng bao bì màng nhôm nhập khẩu',
      signerName: 'Hoàng Minh Quân',
      signerTitle: 'Giám Đốc Kỹ Thuật',
      releaseDate: '2026-09-09',
      recipientOrg: 'Trung Tâm Kỹ Thuật Tiêu Chuẩn Đo Lường Chất Lượng 3 (QUATEST 3)',
      dispatchMethod: 'POST_VIETTEL',
      courierBrand: 'ViettelPost Chuyển Phát Nhanh',
      trackingCode: 'VT-440192839-VN',
      deliveryStatus: 'IN_TRANSIT',
      fileAttachmentName: '143_CV_AVF_DeNghiKiemNghiemQuatest3.pdf'
    },
    {
      id: 'DOC-OUT-2026-090',
      docNumber: '88/TB-AVF/2026',
      documentType: 'THONG_BAO',
      typeLabel: 'Thông Báo Điều Hành',
      summary: 'Thông báo lịch trực lễ Quốc khánh 02/09 và phương án bố trí suất ăn tăng ca cho Phân xưởng Chế biến',
      signerName: 'Nguyễn Thị Mai Chi',
      signerTitle: 'Trưởng Phòng HCNS',
      releaseDate: '2026-08-28',
      recipientOrg: 'Toàn Thể Phân Xưởng & Nhà Thầu Cung Cấp Suất Ăn',
      dispatchMethod: 'INTERNAL_COURIER',
      courierBrand: 'Giao Nhận Nội Bộ Văn Thư',
      deliveryStatus: 'DELIVERED',
      deliveredDate: '28/08/2026 lúc 16:00',
      receivedByPerson: 'Quản đốc các ca trực ký nhận',
      fileAttachmentName: '88_TB_AVF_LichTrucLe2_9.pdf'
    }
  ]);

  // ==========================================================
  // 4. DỮ LIỆU QUYẾT ĐỊNH & QUY CHẾ QUẢN TRỊ NỘI BỘ
  // ==========================================================
  const [internalPolicies] = useState<InternalPolicyDoc[]>([
    {
      id: 'POL-01',
      policyNumber: '45/QĐ-AVF/2026',
      title: 'Quyết Định Ban Hành Quy Chế Tiền Lương, Tiền Thưởng & Đãi Ngộ Người Lao Động Năm 2026',
      category: 'SALARY_POLICY',
      categoryLabel: 'Quy Chế Tiền Lương',
      signerName: 'Tổng Giám Đốc Trần An',
      effectiveDate: '2026-01-01',
      validityStatus: 'ACTIVE',
      scope: 'Toàn thể Cán bộ nhân viên công ty',
      fileAttachmentName: '45_QD_AVF_QuyCheTienLuong2026.pdf'
    },
    {
      id: 'POL-02',
      policyNumber: '58/QĐ-AVF/2026',
      title: 'Quyết Định Bổ Nhiệm Ông Đỗ Văn Thắng Giữ Chức Vụ Quản Đốc Phân Xưởng Cơ Điện',
      category: 'DECISION_PERSONNEL',
      categoryLabel: 'Quyết Định Bổ Nhiệm',
      signerName: 'Tổng Giám Đốc Trần An',
      effectiveDate: '2026-06-01',
      validityStatus: 'ACTIVE',
      scope: 'Phòng HCNS & Phân Xưởng Cơ Điện',
      fileAttachmentName: '58_QD_BoNhiem_DoVanThang.pdf'
    },
    {
      id: 'POL-03',
      policyNumber: '01/NQLĐ-AVF/2025',
      title: 'Nội Quy Lao Động Công Ty Đã Đăng Ký Ban Hành Hợp Pháp Tại Sở LĐ-TB&XH',
      category: 'WORK_RULES',
      categoryLabel: 'Nội Quy Lao Động',
      signerName: 'Tổng Giám Đốc Trần An',
      effectiveDate: '2025-03-15',
      expiryDate: '2028-03-15',
      validityStatus: 'ACTIVE',
      scope: 'Toàn bộ CBCNV và lao động thuê ngoài',
      fileAttachmentName: '01_NQLD_AVF_DangKySoLDTBXH.pdf'
    }
  ]);

  // ==========================================================
  // 5. DỮ LIỆU SỔ CON DẤU PHÁP NHÂN & CHỮ KÝ SỐ TOKEN CA
  // ==========================================================
  const [sealUsageLogs, setSealUsageLogs] = useState<SealUsageLog[]>([
    {
      id: 'SEAL-LOG-01',
      sealType: 'COMPANY_ROUND',
      sealName: 'Dấu Tròn Pháp Nhân (Công Ty CP An Việt Foods)',
      documentTitle: 'Hợp đồng kinh tế cung ứng bao bì xuất khẩu với Công ty Rạng Đông',
      documentNumber: 'HĐ-RD-2026/89',
      copiesCount: 3,
      requesterName: 'Lê Thị Thu Thảo',
      requesterDept: 'Phòng Mua Hàng & Cung Ứng',
      approvedBy: 'Tổng Giám Đốc Phê Duyệt',
      stampedAt: '08:45 09/09/2026',
      purpose: 'Ký kết hợp đồng nguyên tắc năm 2026'
    },
    {
      id: 'SEAL-LOG-02',
      sealType: 'COMPANY_ROUND',
      sealName: 'Dấu Tròn Pháp Nhân (Công Ty CP An Việt Foods)',
      documentTitle: 'Báo cáo kiểm toán tài chính & Bảng cân đối kế toán nộp Ngân Hàng Vietcombank',
      documentNumber: 'BC-TC-2026/Q2',
      copiesCount: 5,
      requesterName: 'Vũ Bích Ngọc',
      requesterDept: 'Phòng Kế Toán - Tài Chính',
      approvedBy: 'Tổng Giám Đốc Phê Duyệt',
      stampedAt: '14:20 05/09/2026',
      purpose: 'Gia hạn hạn mức tín dụng vốn lưu động tài trợ sản xuất'
    },
    {
      id: 'SEAL-LOG-03',
      sealType: 'LEGAL_REPRESENTATIVE',
      sealName: 'Dấu Chức Danh Tổng Giám Đốc Trần An',
      documentTitle: 'Giấy ủy quyền đại diện ký hợp đồng lao động và giải quyết tranh chấp lao động',
      documentNumber: '08/UQ-AVF/2026',
      copiesCount: 2,
      requesterName: 'Nguyễn Thị Mai Chi',
      requesterDept: 'Phòng Hành Chính - Nhân Sự',
      approvedBy: 'Tổng Giám Đốc Ký Lệnh',
      stampedAt: '10:00 01/09/2026',
      purpose: 'Ủy quyền ký kết HĐLĐ cho Trưởng phòng HCNS'
    }
  ]);

  const [digitalTokens] = useState<DigitalTokenCA[]>([
    {
      id: 'CA-01',
      tokenProvider: 'Viettel-CA (USB Token V6)',
      tokenType: 'USB_TOKEN',
      purpose: 'Kê khai Thuế Điện Tử (eTax) & Hải Quan Điện Tử (VNACCS/VCIS)',
      holderPerson: 'Vũ Bích Ngọc (Kế toán trưởng)',
      holderDept: 'Phòng Kế Toán - Tài Chính',
      certificateExpiryDate: '2026-12-15',
      daysRemaining: 91,
      status: 'ACTIVE'
    },
    {
      id: 'CA-02',
      tokenProvider: 'VNPT-CA (SmartCA Cloud)',
      tokenType: 'SMART_CA_CLOUD',
      purpose: 'Ký số Hợp đồng lao động điện tử & Báo tăng/giảm BHXH',
      holderPerson: 'Nguyễn Thị Mai Chi (Trưởng phòng HCNS)',
      holderDept: 'Phòng Hành Chính - Nhân Sự',
      certificateExpiryDate: '2026-10-20',
      daysRemaining: 35,
      status: 'EXPIRING_SOON'
    },
    {
      id: 'CA-03',
      tokenProvider: 'FPT-CA (USB Token)',
      tokenType: 'USB_TOKEN',
      purpose: 'Ký phát hành Hóa Đơn Điện Tử (VNPT-Invoice / MISA meInvoice)',
      holderPerson: 'Kế toán viên hóa đơn',
      holderDept: 'Phòng Kế Toán',
      certificateExpiryDate: '2027-05-30',
      daysRemaining: 257,
      status: 'ACTIVE'
    }
  ]);

  // ==========================================================
  // STATE CỦA BỘ LỌC, MODAL & TÌM KIẾM
  // ==========================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [retentionFilter, setRetentionFilter] = useState<string>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');

  // Modal Bút phê Lãnh đạo
  const [selectedDocForDirective, setSelectedDocForDirective] = useState<IncomingOfficialDoc | null>(null);
  const [directiveInput, setDirectiveInput] = useState('');
  const [leadDeptInput, setLeadDeptInput] = useState('Phòng Hành Chính - Nhân Sự');
  const [deadlineInput, setDeadlineInput] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));

  // Modal Mượn / Trả hồ sơ gốc
  const [showBorrowModal, setShowBorrowModal] = useState<ArchiveBox | null>(null);
  const [newBorrowForm, setNewBorrowForm] = useState({
    documentTitle: '',
    borrowerName: employees[0]?.fullName || 'Trần Thị Thu Trang',
    borrowerDept: employees[0]?.departmentName || 'Phòng Hành Chính - Nhân Sự',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    purpose: ''
  });

  // Modal In Văn Bản / Phiếu Trích Lục A4
  const [showPrintModal, setShowPrintModal] = useState<{
    title: string;
    code: string;
    type: string;
    details: string;
    date: string;
    owner: string;
  } | null>(null);

  // ==========================================================
  // KPI THỐNG KÊ THỜI GIAN THỰC
  // ==========================================================
  const kpiStats = useMemo(() => {
    const totalBoxes = archiveBoxes.length;
    const totalPhysicalFiles = archiveBoxes.reduce((acc, b) => acc + b.totalFiles, 0);
    const activeBorrowCount = borrowLogs.filter(b => b.status === 'BORROWED').length;
    const incomingPendingDirective = incomingDocs.filter(d => !d.leadershipDirective || d.status === 'NEW').length;
    const incomingUrgentCount = incomingDocs.filter(d => d.urgency === 'URGENT' && d.status !== 'COMPLETED').length;
    const deliveredOutDocCount = outgoingDocs.filter(d => d.deliveryStatus === 'DELIVERED').length;
    const expiringTokensCount = digitalTokens.filter(t => t.status === 'EXPIRING_SOON').length;

    return {
      totalBoxes,
      totalPhysicalFiles,
      activeBorrowCount,
      incomingPendingDirective,
      incomingUrgentCount,
      deliveredOutDocCount,
      expiringTokensCount,
      slaOnTimeRate: 98.2
    };
  }, [archiveBoxes, borrowLogs, incomingDocs, outgoingDocs, digitalTokens]);

  // Lọc Hộp lưu trữ
  const filteredBoxes = useMemo(() => {
    return archiveBoxes.filter(b => {
      const matchSearch = searchTerm === '' ||
        b.boxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.deptOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRetention = retentionFilter === 'ALL' || b.retentionPeriod === retentionFilter;
      const matchWarehouse = warehouseFilter === 'ALL' || b.warehouseLocation.includes(warehouseFilter);

      return matchSearch && matchRetention && matchWarehouse;
    });
  }, [archiveBoxes, searchTerm, retentionFilter, warehouseFilter]);

  // Xử lý lưu bút phê lãnh đạo
  const handleSaveDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForDirective || !directiveInput.trim()) return;

    setIncomingDocs(prev => prev.map(doc => {
      if (doc.id === selectedDocForDirective.id) {
        return {
          ...doc,
          leadershipDirective: directiveInput.trim(),
          directiveSigner: currentRole === 'SUPER_ADMIN' ? 'Tổng Giám Đốc Ký Bút Phê' : 'Ban Lãnh Đạo',
          directiveDate: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
          assignedLeadDept: leadDeptInput,
          processingDeadline: deadlineInput,
          status: 'IN_PROGRESS'
        };
      }
      return doc;
    }));

    setSelectedDocForDirective(null);
    setDirectiveInput('');
    alert('✓ ĐÃ LƯU BÚT PHÊ CHỈ ĐẠO & PHÂN PHỐI VĂN BẢN THÀNH CÔNG!\nĐơn vị chủ trì và các bên liên quan đã nhận chỉ đạo để triển khai theo hạn định.');
  };

  // Xử lý tạo phiếu mượn hồ sơ
  const handleCreateBorrowLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBorrowModal || !newBorrowForm.documentTitle.trim()) return;

    const newLog: BorrowDocumentLog = {
      id: `BR-2026-${10 + borrowLogs.length}`,
      boxId: showBorrowModal.id,
      boxCode: showBorrowModal.boxCode,
      documentTitle: newBorrowForm.documentTitle.trim(),
      borrowerName: newBorrowForm.borrowerName,
      borrowerDept: newBorrowForm.borrowerDept,
      borrowDate: new Date().toLocaleDateString('vi-VN'),
      dueDate: newBorrowForm.dueDate,
      purpose: newBorrowForm.purpose || 'Phục vụ thanh tra, đối soát công việc',
      status: 'BORROWED'
    };

    setBorrowLogs([newLog, ...borrowLogs]);
    setShowBorrowModal(null);
    setNewBorrowForm({
      documentTitle: '',
      borrowerName: employees[0]?.fullName || 'Trần Thị Thu Trang',
      borrowerDept: employees[0]?.departmentName || 'Phòng Hành Chính - Nhân Sự',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      purpose: ''
    });
    alert('✓ ĐÃ GHI NHẬN MƯỢN TÀI LIỆU GỐC!\nThủ thư lưu trữ bàn giao tài liệu và lưu vết thời hạn hoàn trả trên hệ thống.');
  };

  // Xác nhận trả tài liệu gốc
  const handleReturnDocument = (logId: string) => {
    const nowStr = new Date().toLocaleDateString('vi-VN');
    setBorrowLogs(prev => prev.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          returnDate: nowStr,
          status: 'RETURNED'
        };
      }
      return log;
    }));
    alert('✓ ĐÃ XÁC NHẬN HOÀN TRẢ TÀI LIỆU VÀO HỘP LƯU TRỮ VẬT LÝ!');
  };

  // Xuất file Excel chuẩn Nghị định 30/2020
  const handleExportArchiveExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Danh mục Hộp lưu trữ & Vị trí kệ
    const ws1Data = archiveBoxes.map(b => ({
      'Mã Hộp': b.boxCode,
      'Tên Hộp / Tập Hồ Sơ': b.title,
      'Kho Lưu Trữ': b.warehouseLocation,
      'Vị Trí Cụ Thể': `${b.rackRow} • ${b.rackShelf} • Tầng ${b.shelfTier}`,
      'Thời Hạn Bảo Quản': b.retentionLabel,
      'Số Lượng Hồ Sơ': b.totalFiles,
      'Độ Lấp Đầy (%)': b.capacityPercent + '%',
      'Đơn Vị Chủ Quản': b.deptOwner,
      'Mã QR Định Vị': b.qrCode,
      'Mô Tả': b.description
    }));
    const ws1 = XLSX.utils.json_to_sheet(ws1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'So_Hop_Luu_Tru_Kho');

    // Sheet 2: Sổ Công Văn Đến (Chuẩn NĐ 30/2020)
    const ws2Data = incomingDocs.map(d => ({
      'Số Đến': d.incomingNumber,
      'Số Ký Hiệu Gốc': d.originalDocNumber,
      'Cơ Quan Ban Hành': d.senderOrganization,
      'Ngày Văn Bản': d.issueDate,
      'Ngày Đến': d.receivedDate,
      'Trích Yếu Nội Dung': d.summary,
      'Độ Khẩn': d.urgency,
      'Bút Phê Lãnh Đạo': d.leadershipDirective || 'Chưa có',
      'Đơn Vị Chủ Trì': d.assignedLeadDept,
      'Hạn Xử Lý': d.processingDeadline,
      'Tình Trạng': d.status
    }));
    const ws2 = XLSX.utils.json_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'So_Cong_Van_Den');

    // Sheet 3: Sổ Công Văn Đi & Bưu Điện
    const ws3Data = outgoingDocs.map(d => ({
      'Số Đi': d.docNumber,
      'Thể Loại': d.typeLabel,
      'Trích Yếu': d.summary,
      'Người Ký': `${d.signerName} (${d.signerTitle})`,
      'Ngày Ban Hành': d.releaseDate,
      'Nơi Nhận': d.recipientOrg,
      'Kênh Chuyển Phát': d.courierBrand,
      'Mã Vận Đơn': d.trackingCode || 'N/A',
      'Trạng Thái Phát Thư': d.deliveryStatus === 'DELIVERED' ? `Phát thành công (${d.deliveredDate})` : 'Đang chuyển phát',
      'Người Ký Nhận': d.receivedByPerson || 'Chờ cập nhật'
    }));
    const ws3 = XLSX.utils.json_to_sheet(ws3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'So_Cong_Van_Di');

    // Sheet 4: Sổ Mượn Trả Tài Liệu Gốc
    const ws4Data = borrowLogs.map(l => ({
      'Mã Phiếu': l.id,
      'Mã Hộp': l.boxCode,
      'Tài Liệu Mượn': l.documentTitle,
      'Người Mượn': l.borrowerName,
      'Đơn Vị': l.borrowerDept,
      'Ngày Mượn': l.borrowDate,
      'Hạn Hoàn Trả': l.dueDate,
      'Ngày Trả Thực Tế': l.returnDate || 'Đang mượn',
      'Mục Đích': l.purpose,
      'Trạng Thái': l.status
    }));
    const ws4 = XLSX.utils.json_to_sheet(ws4Data);
    XLSX.utils.book_append_sheet(wb, ws4, 'Nhat_Ky_Muon_Tra_Ho_So');

    XLSX.writeFile(wb, `So_Van_Thu_Luu_Tru_So_${policy.companyName.replace(/\s+/g, '_')}_09_2026.xlsx`);
  };

  return (
    <div className="space-y-1.5">
      {/* ════════════════════════════════════════════════════════════
          KHỐI 1: HEADER & KPI CARDS QUẢN TRỊ VĂN THƯ 360°
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 text-slate-800 rounded-2xl p-2 shadow-sm border border-indigo-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-200 pb-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-sm border-0">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-black tracking-wide uppercase">
                    Hệ Thống Văn Thư Lưu Trữ Số &amp; Quản Lý Hồ Sơ Doanh Nghiệp
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Nghị Định 30/2020/NĐ-CP &amp; Luật Lưu Trữ
                  </span>
                </div>
                <p className="text-[11.5px] text-indigo-800/80 font-medium">
                  Số hóa hồ sơ, quản lý vị trí kệ hộp vật lý, điều phối bút phê công văn đến và theo dõi vận đơn bưu điện
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportArchiveExcel}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition-all flex items-center space-x-1.5 border border-indigo-200 cursor-pointer shadow-sm"
              title="Xuất toàn bộ sổ văn thư lưu trữ ra Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Sổ Văn Thư (Excel)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                alert('Mở form tạo văn bản / vào sổ công văn mới');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black transition-all flex items-center space-x-1.5 shadow-md hover:shadow-indigo-500/25 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Vào Sổ Văn Bản Mới</span>
            </button>
          </div>
        </div>

        {/* 4 KPI THỐNG KÊ THỜI GIAN THỰC */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kho Hồ Sơ Vật Lý Đã Số Hóa</span>
              <div className="text-xl font-black font-mono text-white mt-0.5">{kpiStats.totalBoxes} <span className="text-xs font-normal text-slate-300">hộp</span></div>
              <span className="text-[10px] text-emerald-400 font-semibold">{kpiStats.totalPhysicalFiles} tập tài liệu gốc</span>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Box className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Công Văn Đến Cần Xử Lý</span>
              <div className="text-xl font-black font-mono text-amber-300 mt-0.5">{kpiStats.incomingPendingDirective} <span className="text-xs font-normal text-slate-300">đang xử lý</span></div>
              <span className="text-[10px] text-rose-300 font-semibold">{kpiStats.incomingUrgentCount} công văn hỏa tốc</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Inbox className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Công Văn Đi Phát Thành Công</span>
              <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">{kpiStats.deliveredOutDocCount} <span className="text-xs font-normal text-slate-300">văn bản</span></div>
              <span className="text-[10px] text-emerald-300 font-semibold">100% có ký nhận bưu tá</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Truck className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hồ Sơ Gốc Đang Mượn</span>
              <div className="text-xl font-black font-mono text-purple-300 mt-0.5">{kpiStats.activeBorrowCount} <span className="text-xs font-normal text-slate-300">tập hồ sơ</span></div>
              <span className="text-[10px] text-purple-300 font-semibold">Đã lưu vết ngày hoàn trả</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <History className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          KHỐI 2: THANH TAB ĐIỀU HƯỚNG 6 PHÂN HỆ CHUYÊN BIỆT
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-1.5">
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-bold scrollable-tabs pb-0.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('ARCHIVE_STORAGE_RACKS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'ARCHIVE_STORAGE_RACKS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-300" />
            <span>1. Kho Lưu Trữ Số &amp; Sơ Đồ Kệ/Hộp Vật Lý ({archiveBoxes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('DOC_INCOMING_WORKFLOW')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'DOC_INCOMING_WORKFLOW'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-blue-500" />
            <span>2. Công Văn Đến, Bút Phê &amp; Phân Phối SLA ({incomingDocs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('DOC_OUTGOING_DISPATCH')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'DOC_OUTGOING_DISPATCH'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-emerald-500" />
            <span>3. Công Văn Đi &amp; Theo Dõi Vận Đơn Bưu Điện</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('INTERNAL_POLICIES')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'INTERNAL_POLICIES'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-500" />
            <span>4. Quyết Định, Quy Chế &amp; Văn Bản Nội Bộ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('SEAL_AND_TOKEN_LOGS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'SEAL_AND_TOKEN_LOGS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Stamp className="w-3.5 h-3.5 text-rose-500" />
            <span>5. Sổ Con Dấu Pháp Nhân &amp; Token CA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('CLERICAL_ANALYTICS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'CLERICAL_ANALYTICS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            <span>6. Thống Kê &amp; Báo Cáo Nghị Định 30</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: KHO LƯU TRỮ SỐ HÓA & SƠ ĐỒ KỆ/HỘP VẬT LÝ (TRỌNG TÂM)
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'ARCHIVE_STORAGE_RACKS' && (
        <div className="space-y-1.5">
          {/* BẢNG PHÂN LOẠI THỜI HẠN BẢO QUẢN PHÁP LÝ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-indigo-900 font-bold text-xs">
                <span>HỒ SƠ VĨNH VIỄN</span>
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <p className="text-lg font-black font-mono text-indigo-900">2 Hộp <span className="text-xs font-normal text-slate-500">(23 tập)</span></p>
              <p className="text-[10.5px] text-slate-500">Giấy phép ĐKKD, Sổ đỏ đất xưởng, Thẩm duyệt PCCC, Điều lệ cty.</p>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-purple-900 font-bold text-xs">
                <span>HỒ SƠ 10 - 20 NĂM</span>
                <History className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <p className="text-lg font-black font-mono text-purple-900">2 Hộp <span className="text-xs font-normal text-slate-500">(80 tập)</span></p>
              <p className="text-[10.5px] text-slate-500">HĐLĐ nhân sự, Báo cáo tài chính kiểm toán, Bảng lương ký nhận.</p>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-blue-900 font-bold text-xs">
                <span>HỒ SƠ 05 NĂM</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-lg font-black font-mono text-blue-900">1 Hộp <span className="text-xs font-normal text-slate-500">(65 tập)</span></p>
              <p className="text-[10.5px] text-slate-500">Công văn trao đổi thường, Biên bản họp nội bộ, Phiếu tạm ứng.</p>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-900 font-bold text-xs">
                <span>HỒ SƠ 01 NĂM (CHUẨN BỊ HỦY)</span>
                <Archive className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <p className="text-lg font-black font-mono text-slate-800">1 Hộp <span className="text-xs font-normal text-slate-500">(110 tập)</span></p>
              <p className="text-[10.5px] text-slate-500">Đơn xin nghỉ phép, Phiếu ăn ca, Báo cáo công việc tuần.</p>
            </div>
          </div>

          {/* SƠ ĐỒ KHO & MA TRẬN KỆ / HỘP VẬT LÝ */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-indigo-600" />
                  <span>Sơ Đồ Ma Trận Định Vị Kệ &amp; Hộp Tài Liệu Lưu Trữ Vật Lý</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Phân cấp: Kho ➔ Dãy Kệ ➔ Kệ Sắt ➔ Tầng ➔ Hộp Ba Dây ➔ Mã QR gáy hộp
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={warehouseFilter}
                  onChange={e => setWarehouseFilter(e.target.value)}
                  className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="ALL">Toàn Bộ Các Kho Lưu Trữ</option>
                  <option value="Kho A">Kho A (Khu Văn Phòng Tầng 2)</option>
                  <option value="Kho B">Kho B (Khu Nhà Xưởng Sản Xuất)</option>
                </select>

                <select
                  value={retentionFilter}
                  onChange={e => setRetentionFilter(e.target.value)}
                  className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="ALL">Tất Cả Thời Hạn Bảo Quản</option>
                  <option value="PERMANENT">Vĩnh Viễn</option>
                  <option value="20_YEARS">20 Năm</option>
                  <option value="10_YEARS">10 Năm</option>
                  <option value="5_YEARS">05 Năm</option>
                  <option value="1_YEAR">01 Năm</option>
                </select>
              </div>
            </div>

            {/* DANH SÁCH THẺ HỘP LƯU TRỮ VẬT LÝ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBoxes.map(box => (
                <div
                  key={box.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 font-mono font-black text-xs">
                        {box.boxCode}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-xs block leading-tight line-clamp-1" title={box.title}>
                          {box.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{box.deptOwner}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black border shrink-0 ${
                      box.retentionPeriod === 'PERMANENT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      box.retentionPeriod === '20_YEARS' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      box.retentionPeriod === '10_YEARS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {box.retentionLabel}
                    </span>
                  </div>

                  {/* Vị trí vật lý chi tiết */}
                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] space-y-0.5 text-slate-600 font-sans">
                    <div className="flex items-center space-x-1.5 text-indigo-800 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{box.warehouseLocation}</span>
                    </div>
                    <div className="pl-5 text-slate-500 text-[10.5px]">
                      Vị trí: <b>{box.rackRow}</b> • <b>{box.rackShelf}</b> • <b className="text-slate-800">Tầng {box.shelfTier}</b>
                    </div>
                  </div>

                  {/* Thanh độ lấp đầy hộp */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Số lượng: <b>{box.totalFiles} tập</b></span>
                      <span>Độ lấp đầy: <b>{box.capacityPercent}%</b></span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          box.capacityPercent > 90 ? 'bg-rose-500' : box.capacityPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${box.capacityPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tác vụ với hộp */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center space-x-1 text-slate-600 font-mono text-[10.5px]">
                      <QrCode className="w-3.5 h-3.5 text-slate-800" />
                      <span>{box.qrCode}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setShowBorrowModal(box)}
                        className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10.5px] border border-indigo-200 cursor-pointer transition-colors"
                      >
                        Mượn Hồ Sơ
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPrintModal({
                          title: box.title,
                          code: box.boxCode,
                          type: 'Thẻ Nhãn Gáy Hộp Lưu Trữ',
                          details: `${box.warehouseLocation} | ${box.rackRow} | ${box.rackShelf} | Tầng ${box.shelfTier}`,
                          date: new Date().toLocaleDateString('vi-VN'),
                          owner: box.deptOwner
                        })}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
                        title="In nhãn dán gáy hộp QR Code"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SỔ THEO DÕI MƯỢN TRẢ HỒ SƠ GỐC (CHECK-IN / CHECK-OUT) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Sổ Theo Dõi Mượn - Trả Hồ Sơ Gốc Khỏi Kho Lưu Trữ
                </h3>
                <p className="text-[11px] text-slate-500">Lưu vết người mượn, đơn vị, mục đích và thời hạn hoàn trả</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Mã Phiếu</th>
                    <th className="px-3 py-2 text-center">Mã Hộp</th>
                    <th className="px-3 py-2">Tên Tài Liệu Gốc Đang Mượn</th>
                    <th className="px-3 py-2">Người Mượn &amp; Đơn Vị</th>
                    <th className="px-3 py-2 text-center">Ngày Mượn</th>
                    <th className="px-3 py-2 text-center">Hạn Trả</th>
                    <th className="px-3 py-2 text-center">Trạng Thái</th>
                    <th className="px-3 py-2 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {borrowLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-700">{log.id}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">{log.boxCode}</td>
                      <td className="px-3 py-2.5 max-w-[280px]">
                        <div className="font-semibold text-slate-900">{log.documentTitle}</div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{log.purpose}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{log.borrowerName}</div>
                        <span className="text-[10px] text-slate-400">{log.borrowerDept}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-slate-600">{log.borrowDate}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-rose-700">{log.dueDate}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.status === 'BORROWED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {log.status === 'BORROWED' ? 'Đang mượn gốc' : `Đã trả (${log.returnDate})`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {log.status === 'BORROWED' && (
                          <button
                            type="button"
                            onClick={() => handleReturnDocument(log.id)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10.5px] font-bold border border-emerald-200 cursor-pointer"
                          >
                            Xác Nhận Trả
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 2: CÔNG VĂN ĐẾN, BÚT PHÊ LÃNH ĐẠO & ĐIỀU PHỐI SLA
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'DOC_INCOMING_WORKFLOW' && (
        <div className="space-y-1.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Inbox className="w-4 h-4 text-indigo-600" />
                  <span>Sổ Công Văn Đến &amp; Bút Phê Điều Phối Xử Lý Đa Phòng Ban</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tự động cấp số đến, theo dõi bút phê chỉ đạo và giám sát hạn xử lý (SLA)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Số Đến</th>
                    <th className="px-3 py-2 text-center">Số Ký Hiệu Gốc</th>
                    <th className="px-3 py-2">Cơ Quan Ban Hành</th>
                    <th className="px-3 py-2">Trích Yếu Nội Dung &amp; Bút Phê</th>
                    <th className="px-3 py-2 text-center">Ngày Đến</th>
                    <th className="px-3 py-2">Đơn Vị Chủ Trì</th>
                    <th className="px-3 py-2 text-center">Hạn Xử Lý (SLA)</th>
                    <th className="px-3 py-2 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomingDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-700">{doc.incomingNumber}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">{doc.originalDocNumber}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{doc.senderOrganization}</td>
                      <td className="px-3 py-2.5 max-w-[300px]">
                        <div className="font-semibold text-slate-900">{doc.summary}</div>
                        {doc.leadershipDirective ? (
                          <div className="mt-1 p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[10.5px] text-indigo-900">
                            <b>Bút phê ({doc.directiveSigner}):</b> <i>&ldquo;{doc.leadershipDirective}&rdquo;</i>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-bold">Chờ Ban Giám Đốc bút phê</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-slate-500">{doc.receivedDate}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-800">{doc.assignedLeadDept}</div>
                        {doc.assignedSupportDept && (
                          <span className="text-[10px] text-slate-400">Phối hợp: {doc.assignedSupportDept}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-rose-700 whitespace-nowrap">
                        {doc.processingDeadline}
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDocForDirective(doc);
                              setDirectiveInput(doc.leadershipDirective || '');
                            }}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10.5px] font-bold border border-indigo-200 cursor-pointer"
                          >
                            Bút Phê
                          </button>
                          <button
                            type="button"
                            onClick={() => alert(`Xem file scan PDF: ${doc.fileAttachmentName}`)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 cursor-pointer"
                            title="Xem bản scan PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 3: CÔNG VĂN ĐI & VẬN ĐƠN BƯU ĐIỆN (VNPOST/VIETTELPOST)
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'DOC_OUTGOING_DISPATCH' && (
        <div className="space-y-1.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Sổ Công Văn Đi &amp; Theo Dõi Mã Vận Đơn Bưu Điện (VNPost / ViettelPost)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Cấp số văn bản tự động, quản lý mã bưu gửi và xác nhận người nhận ký nhận</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Số Hiệu Đi</th>
                    <th className="px-3 py-2 text-center">Thể Loại</th>
                    <th className="px-3 py-2">Trích Yếu Nội Dung</th>
                    <th className="px-3 py-2">Nơi Nhận</th>
                    <th className="px-3 py-2 text-center">Đơn Vị Chuyển Phát</th>
                    <th className="px-3 py-2 text-center">Mã Vận Đơn (Tracking)</th>
                    <th className="px-3 py-2 text-center">Trạng Thái Phát Thư</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outgoingDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-700">{doc.docNumber}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {doc.typeLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 max-w-[280px]">
                        <div className="font-semibold text-slate-900">{doc.summary}</div>
                        <span className="text-[10px] text-slate-400">Người ký: {doc.signerName} ({doc.signerTitle})</span>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">{doc.recipientOrg}</td>
                      <td className="px-3 py-2.5 text-center text-slate-700 font-semibold">{doc.courierBrand}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-800">
                        {doc.trackingCode || 'Giao trực tiếp'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          doc.deliveryStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {doc.deliveryStatus === 'DELIVERED' ? '✓ Đã phát thành công' : 'Đang trung chuyển'}
                        </span>
                        {doc.receivedByPerson && (
                          <span className="block text-[9px] text-slate-500 mt-0.5 truncate max-w-[160px]" title={doc.receivedByPerson}>
                            {doc.receivedByPerson}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 4: QUYẾT ĐỊNH, QUY CHẾ & VĂN BẢN QUẢN TRỊ NỘI BỘ
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'INTERNAL_POLICIES' && (
        <div className="space-y-1.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Sổ Quản Lý Quyết Định Ban Hành &amp; Quy Chế Quản Trị Doanh Nghiệp</span>
                </h3>
                <p className="text-[11px] text-slate-500">Theo dõi hiệu lực pháp lý của các văn bản nội bộ</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Số Quyết Định</th>
                    <th className="px-3 py-2">Tên Quyết Định &amp; Quy Chế</th>
                    <th className="px-3 py-2 text-center">Phân Loại</th>
                    <th className="px-3 py-2">Người Ký Ban Hành</th>
                    <th className="px-3 py-2 text-center">Ngày Hiệu Lực</th>
                    <th className="px-3 py-2 text-center">Trạng Thái Hiệu Lực</th>
                    <th className="px-3 py-2 text-center">Bản Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {internalPolicies.map(pol => (
                    <tr key={pol.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-700">{pol.policyNumber}</td>
                      <td className="px-3 py-2.5 max-w-[320px]">
                        <div className="font-bold text-slate-900">{pol.title}</div>
                        <span className="text-[10px] text-slate-500">Phạm vi: {pol.scope}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {pol.categoryLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{pol.signerName}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-slate-600">{pol.effectiveDate}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đang có hiệu lực
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => alert(`Xem file đính kèm: ${pol.fileAttachmentName}`)}
                          className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 5: SỔ QUẢN LÝ CON DẤU PHÁP NHÂN & CHỮ KÝ SỐ TOKEN CA
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'SEAL_AND_TOKEN_LOGS' && (
        <div className="space-y-1.5">
          {/* QUẢN LÝ TOKEN CHỮ KÝ SỐ DOANH NGHIỆP */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>Quản Lý Chữ Ký Số Doanh Nghiệp (USB Token / SmartCA)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Thời hạn chứng thư số và cán bộ phụ trách nắm giữ khóa</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {digitalTokens.map(tok => (
                <div key={tok.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{tok.tokenProvider}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${
                      tok.status === 'EXPIRING_SOON' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {tok.status === 'EXPIRING_SOON' ? `Sắp hết hạn (${tok.daysRemaining} ngày)` : 'Đang hoạt động'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600"><b>Mục đích:</b> {tok.purpose}</p>
                  <p className="text-[10.5px] text-slate-500">Cán bộ giữ: <b>{tok.holderPerson}</b> ({tok.holderDept})</p>
                  <div className="pt-1 border-t border-slate-200 text-[10.5px] text-slate-500 font-mono">
                    Hết hạn: <b className="text-indigo-800">{tok.certificateExpiryDate}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NHẬT KÝ MƯỢN & ĐÓNG DẤU PHÁP NHÂN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Stamp className="w-4 h-4 text-rose-600" />
                  <span>Sổ Nhật Ký Kiểm Soát Sử Dụng &amp; Đóng Dấu Pháp Nhân Công Ty</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kiểm soát nghiêm ngặt người đóng dấu, số lượng văn bản và người phê duyệt lệnh đóng dấu
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Loại Con Dấu</th>
                    <th className="px-3 py-2">Tên Văn Bản Đóng Dấu</th>
                    <th className="px-3 py-2 text-center">Số Bản</th>
                    <th className="px-3 py-2">Người Đề Xuất Đóng Dấu</th>
                    <th className="px-3 py-2">Cấp Phê Duyệt Lệnh</th>
                    <th className="px-3 py-2 text-center">Thời Điểm Đóng Dấu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sealUsageLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-bold text-rose-800">{log.sealName}</td>
                      <td className="px-3 py-2.5 max-w-[280px]">
                        <div className="font-semibold text-slate-900">{log.documentTitle}</div>
                        <span className="text-[10px] text-slate-500 font-mono">{log.documentNumber}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-800">{log.copiesCount} bản</td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{log.requesterName}</div>
                        <span className="text-[10px] text-slate-400">{log.requesterDept}</span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-emerald-700">{log.approvedBy}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-slate-500">{log.stampedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 6: BÁO CÁO THỐNG KÊ VĂN THƯ & CHUẨN NGHỊ ĐỊNH 30/2020
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'CLERICAL_ANALYTICS' && (
        <div className="space-y-1.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Báo Cáo Tổng Hợp Tình Hình Văn Thư Lưu Trữ Số Doanh Nghiệp (Nghị Định 30/2020)
                </h3>
                <p className="text-[11px] text-slate-500">Chỉ số tuân thủ thời hạn giải quyết công văn và số hóa lưu trữ</p>
              </div>
              <button
                type="button"
                onClick={handleExportArchiveExcel}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center space-x-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tải Báo Cáo Đầy Đủ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase">Tỷ Lệ Xử Lý Công Văn Đúng Hạn</span>
                <p className="text-2xl font-black font-mono text-emerald-700">98.2%</p>
                <p className="text-[10.5px] text-slate-500">Đạt chỉ tiêu SLA nội bộ Ban Giám Đốc giao.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase">Tỷ Lệ Số Hóa Hồ Sơ Scan PDF</span>
                <p className="text-2xl font-black font-mono text-indigo-700">100%</p>
                <p className="text-[10.5px] text-slate-500">Toàn bộ hồ sơ trong hộp vật lý đều có link scan tra cứu.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase">Hồ Sơ Hết Hạn Bảo Quản Cần Tiêu Hủy</span>
                <p className="text-2xl font-black font-mono text-amber-700">110 tập</p>
                <p className="text-[10.5px] text-slate-500">Đủ điều kiện họp Hội đồng lưu trữ để lập biên bản tiêu hủy.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 1: BÚT PHÊ LÃNH ĐẠO & PHÂN PHỐI CÔNG VĂN ĐẾN
      ════════════════════════════════════════════════════════════ */}
      {selectedDocForDirective && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSignature className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm">Bút Phê Chỉ Đạo &amp; Phân Phối Công Văn Đến</h3>
              </div>
              <button onClick={() => setSelectedDocForDirective(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDirective} className="p-2 space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p><b>Số đến:</b> <span className="font-mono font-bold text-indigo-700">{selectedDocForDirective.incomingNumber}</span> • <b>Số hiệu:</b> {selectedDocForDirective.originalDocNumber}</p>
                <p><b>Cơ quan gửi:</b> <span className="font-bold text-slate-800">{selectedDocForDirective.senderOrganization}</span></p>
                <p><b>Trích yếu:</b> {selectedDocForDirective.summary}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội Dung Bút Phê Chỉ Đạo Của Lãnh Đạo:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập nội dung chỉ đạo thực hiện, phương án xử lý và phân công nhiệm vụ..."
                  value={directiveInput}
                  onChange={e => setDirectiveInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đơn Vị Chủ Trì Thực Hiện:</label>
                  <select
                    value={leadDeptInput}
                    onChange={e => setLeadDeptInput(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 bg-white"
                  >
                    <option value="Phòng Hành Chính - Nhân Sự">Phòng Hành Chính - Nhân Sự</option>
                    <option value="Phòng Kế Toán - Tài Chính">Phòng Kế Toán - Tài Chính</option>
                    <option value="Ban An Toàn & HSE">Ban An Toàn &amp; HSE</option>
                    <option value="Phòng Kỹ Thuật & Cơ Điện">Phòng Kỹ Thuật &amp; Cơ Điện</option>
                    <option value="Kho Vận & Logistics">Kho Vận &amp; Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hạn Chót Báo Cáo Xử Lý (SLA):</label>
                  <input
                    type="date"
                    required
                    value={deadlineInput}
                    onChange={e => setDeadlineInput(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 font-mono font-bold text-rose-700"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDocForDirective(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Lưu Bút Phê &amp; Ban Hành Lệnh</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 2: MƯỢN HỒ SƠ GỐC KHỎI HỘP LƯU TRỮ VẬT LÝ
      ════════════════════════════════════════════════════════════ */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderArchive className="w-5 h-5 text-purple-200" />
                <h3 className="font-bold text-sm">Lập Phiếu Mượn Tài Liệu Gốc: {showBorrowModal.boxCode}</h3>
              </div>
              <button onClick={() => setShowBorrowModal(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBorrowLog} className="p-2 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Tài Liệu Cụ Thể Trong Hộp Cần Mượn:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hợp đồng lao động bản gốc của Nguyễn Văn A..."
                  value={newBorrowForm.documentTitle}
                  onChange={e => setNewBorrowForm({ ...newBorrowForm, documentTitle: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-purple-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Người Mượn:</label>
                  <select
                    value={newBorrowForm.borrowerName}
                    onChange={e => {
                      const emp = employees.find(x => x.fullName === e.target.value);
                      setNewBorrowForm({
                        ...newBorrowForm,
                        borrowerName: e.target.value,
                        borrowerDept: emp?.departmentName || 'Phòng Hành Chính'
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none text-slate-800 bg-white font-semibold"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.fullName}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hạn Hoàn Trả:</label>
                  <input
                    type="date"
                    required
                    value={newBorrowForm.dueDate}
                    onChange={e => setNewBorrowForm({ ...newBorrowForm, dueDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-purple-600 font-mono font-bold text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mục Đích Sử Dụng:</label>
                <textarea
                  rows={2}
                  placeholder="Ghi rõ mục đích mượn tài liệu gốc (phục vụ thanh tra, đối chiếu hợp đồng...)"
                  value={newBorrowForm.purpose}
                  onChange={e => setNewBorrowForm({ ...newBorrowForm, purpose: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác Nhận Xuất Kho Mượn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 3: IN THẺ NHÃN GÁY HỘP LƯU TRỮ VẬT LÝ QR CODE (A4)
      ════════════════════════════════════════════════════════════ */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Mẫu In Nhãn Gáy Hộp Lưu Trữ Kho Kèm Mã QR Code Định Vị
                </h3>
              </div>
              <button onClick={() => setShowPrintModal(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 text-xs font-serif leading-relaxed text-slate-900 bg-white">
              <div className="border-4 border-slate-900 p-2 rounded-xl text-center space-y-2">
                <p className="font-bold text-xs uppercase">{policy.companyName}</p>
                <h2 className="text-lg font-black font-mono text-indigo-900">{showPrintModal.code}</h2>
                <h3 className="font-bold text-sm text-slate-800 uppercase">{showPrintModal.title}</h3>

                <div className="w-36 h-36 mx-auto bg-slate-50 border-2 border-slate-300 rounded-xl flex flex-col items-center justify-center my-2">
                  <QrCode className="w-24 h-24 text-slate-900" />
                  <span className="font-mono text-[9.5px] font-bold text-slate-600 mt-1">SCAN QR VỊ TRÍ KỆ</span>
                </div>

                <div className="text-[11px] text-slate-700 border-t border-slate-300 pt-2 space-y-1">
                  <p><b>Vị trí lưu trữ:</b> {showPrintModal.details}</p>
                  <p><b>Đơn vị quản lý:</b> {showPrintModal.owner} • <b>Ngày lập:</b> {showPrintModal.date}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">In dán lên gáy hộp cặp ba dây lưu trữ hồ sơ</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Nhãn Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
