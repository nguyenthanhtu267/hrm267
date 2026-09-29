// ========================================================
// NGHIỆP VỤ ĐẶC THÙ KẾ TOÁN (TT200, TT133, TT111, TT96)
// 1. HỢP ĐỒNG DỊCH VỤ DÂN SỰ & THÙ LAO CỘNG TÁC VIÊN (KHẤU TRỪ 10% THUẾ TNCN)
// 2. CHI PHÍ TIẾP KHÁCH & XỬ LÝ TIẾP KHÁCH KHÔNG HÓA ĐƠN (CHỈ TIÊU B4 THUẾ TNDN)
// ========================================================

export interface ServiceContractEntry {
  id: string;
  contractCode: string;
  contractorName: string;
  contractorIdNumber: string; // CCCD
  taxCode: string; // MST cá nhân
  phone: string;
  serviceCategory: 'IT_SOFTWARE' | 'EQUIPMENT_MAINTENANCE' | 'LEGAL_CONSULTING' | 'TRAINING_EXPERT' | 'PACKAGING_DESIGN' | 'MARKETING_FREELANCE';
  serviceCategoryLabel: string;
  contractDescription: string;
  signDate: string;
  completionDate: string;
  grossAmount: number; // Thù lao trước thuế (Gross)
  hasCommitment08: boolean; // Làm bản cam kết 08/CK-TNCN
  taxRatePercent: number; // 10% hoặc 0%
  withheldTaxAmount: number; // Tiền thuế TNCN khấu trừ
  netPaidAmount: number; // Thực chi chuyển khoản (Net)
  accountingDebitAccount: string; // '642', '641', '627'
  accountingCreditAccount: string; // '331' hoặc '3388'
  paymentStatus: 'PAID' | 'PENDING_PAYMENT';
  bankAccountInfo: string;
  documents: {
    hasContract: boolean;
    hasAcceptanceReport: boolean;
    hasLiquidationReport: boolean;
    hasBankTransferDoc: boolean;
    hasTaxWithholdingDoc: boolean;
  };
}

export interface HospitalityExpenseEntry {
  id: string;
  voucherCode: string;
  requestDate: string;
  eventDate: string;
  requesterName: string;
  requesterDepartment: string;
  requesterPosition: string;
  partnerName: string;
  partnerCompany: string;
  guestCount: number;
  businessPurpose: string;
  venueName: string;
  actualSpentAmount: number;
  invoiceStatus: 'HAS_E_INVOICE' | 'NON_INVOICE_INTERNAL_ALLOWANCE' | 'HOUSEHOLD_BUSINESS_B01';
  invoiceNumber?: string;
  internalAllowanceApproved: boolean;
  citDeductibleAmount: number; // Chi phí ĐƯỢC TRỪ khi tính thuế TNDN
  citNonDeductibleAmount: number; // Chi phí KHÔNG ĐƯỢC TRỪ (Chỉ tiêu B4)
  pitExemptForEmployee: boolean; // Miễn thuế TNCN cho NLĐ theo TT 111/2013
  status: 'APPROVED_REIMBURSED' | 'PENDING_APPROVAL' | 'REJECTED';
  debitAccount: string; // 641, 642
  creditAccount: string; // 111, 112
  approverNote?: string;
}

export const initialServiceContracts: ServiceContractEntry[] = [
  {
    id: 'HDDV-01',
    contractCode: 'HĐDV-2026/08-01',
    contractorName: 'Bùi Quang Huy',
    contractorIdNumber: '079191007788',
    taxCode: '8099234567',
    phone: '0912349988',
    serviceCategory: 'PACKAGING_DESIGN',
    serviceCategoryLabel: 'Thiết Kế Bao Bì & Bộ Nhận Diện Nhãn Hàng Mới',
    contractDescription: 'Thiết kế hệ thống bao bì hộp bánh trung thu cao cấp vụ mùa 2026 và mockup 3D phục vụ quảng bá thị trường xuất khẩu.',
    signDate: '2026-08-01',
    completionDate: '2026-08-20',
    grossAmount: 18000000,
    hasCommitment08: false,
    taxRatePercent: 10,
    withheldTaxAmount: 1800000,
    netPaidAmount: 16200000,
    accountingDebitAccount: '641',
    accountingCreditAccount: '331',
    paymentStatus: 'PAID',
    bankAccountInfo: 'Vietcombank - 0071001234567',
    documents: {
      hasContract: true,
      hasAcceptanceReport: true,
      hasLiquidationReport: true,
      hasBankTransferDoc: true,
      hasTaxWithholdingDoc: true,
    }
  },
  {
    id: 'HDDV-02',
    contractCode: 'HĐDV-2026/08-02',
    contractorName: 'Kỹ Sư Trịnh Đình Trọng',
    contractorIdNumber: '025088001234',
    taxCode: '8044556677',
    phone: '0988776655',
    serviceCategory: 'EQUIPMENT_MAINTENANCE',
    serviceCategoryLabel: 'Bảo Trì & Lập Trình PLC Hệ Thống Chiết Rót Tự Động',
    contractDescription: 'Cân chỉnh thông số cảm biến áp suất và nạp firmware điều khiển PLC Siemens S7-1500 dây chuyền xưởng 1.',
    signDate: '2026-08-05',
    completionDate: '2026-08-18',
    grossAmount: 25000000,
    hasCommitment08: false,
    taxRatePercent: 10,
    withheldTaxAmount: 2500000,
    netPaidAmount: 22500000,
    accountingDebitAccount: '627',
    accountingCreditAccount: '331',
    paymentStatus: 'PAID',
    bankAccountInfo: 'Techcombank - 1903344556601',
    documents: {
      hasContract: true,
      hasAcceptanceReport: true,
      hasLiquidationReport: true,
      hasBankTransferDoc: true,
      hasTaxWithholdingDoc: true,
    }
  },
  {
    id: 'HDDV-03',
    contractCode: 'HĐDV-2026/08-03',
    contractorName: 'Thạc Sĩ Đinh Hoàng Lan',
    contractorIdNumber: '001193005522',
    taxCode: '8011223399',
    phone: '0903123456',
    serviceCategory: 'LEGAL_CONSULTING',
    serviceCategoryLabel: 'Tư Vấn Thẩm Định Pháp Lý Hợp Đồng Ngoại Thương',
    contractDescription: 'Rà soát điều khoản thanh toán LC và bảo hiểm vận tải quốc tế Incoterms 2020 cho lô hàng xuất khẩu sang châu Âu.',
    signDate: '2026-08-10',
    completionDate: '2026-08-22',
    grossAmount: 15000000,
    hasCommitment08: true, // Có cam kết mẫu 08 do tổng thu nhập năm dưới mức chịu thuế
    taxRatePercent: 0,
    withheldTaxAmount: 0,
    netPaidAmount: 15000000,
    accountingDebitAccount: '642',
    accountingCreditAccount: '3388',
    paymentStatus: 'PAID',
    bankAccountInfo: 'ACB - 2345678910',
    documents: {
      hasContract: true,
      hasAcceptanceReport: true,
      hasLiquidationReport: true,
      hasBankTransferDoc: true,
      hasTaxWithholdingDoc: false, // Miễn trừ theo cam kết 08
    }
  },
  {
    id: 'HDDV-04',
    contractCode: 'HĐDV-2026/08-04',
    contractorName: 'Chuyên Gia Vũ Tuấn Anh',
    contractorIdNumber: '034089004411',
    taxCode: '8033669988',
    phone: '0977889900',
    serviceCategory: 'TRAINING_EXPERT',
    serviceCategoryLabel: 'Đào Tạo Kỹ Năng Đàm Phán & Quản Trị Mục Tiêu OKR',
    contractDescription: 'Giảng dạy khóa đào tạo chuyên sâu 16 giờ cho toàn bộ Quản đốc xưởng và Trưởng bộ phận công ty.',
    signDate: '2026-08-12',
    completionDate: '2026-08-25',
    grossAmount: 30000000,
    hasCommitment08: false,
    taxRatePercent: 10,
    withheldTaxAmount: 3000000,
    netPaidAmount: 27000000,
    accountingDebitAccount: '642',
    accountingCreditAccount: '331',
    paymentStatus: 'PENDING_PAYMENT',
    bankAccountInfo: 'BIDV - 12010009988776',
    documents: {
      hasContract: true,
      hasAcceptanceReport: true,
      hasLiquidationReport: false,
      hasBankTransferDoc: false,
      hasTaxWithholdingDoc: false,
    }
  }
];

export const initialHospitalityExpenses: HospitalityExpenseEntry[] = [
  {
    id: 'PTK-01',
    voucherCode: 'PTK-2026-08/01',
    requestDate: '2026-08-15',
    eventDate: '2026-08-14',
    requesterName: 'Phạm Minh Hùng',
    requesterDepartment: 'Khối Kinh Doanh & Tiếp Thị',
    requesterPosition: 'Giám Đốc Kinh Doanh Toàn Quốc',
    partnerName: 'Mr. Kenji Takahashi & Đoàn công tác',
    partnerCompany: 'Tập Đoàn Bán Lẻ Thực Phẩm Aeon Mall Nhật Bản',
    guestCount: 6,
    businessPurpose: 'Chiêu đãi đàm phán ký kết hợp đồng cung ứng thực phẩm chế biến xuất khẩu trị giá 1.2 triệu USD.',
    venueName: 'Nhà Hàng Ẩm Thực Hải Sản Dĩ An Grand (Bình Dương)',
    actualSpentAmount: 14850000,
    invoiceStatus: 'HAS_E_INVOICE',
    invoiceNumber: 'HDĐT-0012948 (Mã CQT: 010293848)',
    internalAllowanceApproved: true,
    citDeductibleAmount: 14850000,
    citNonDeductibleAmount: 0,
    pitExemptForEmployee: true,
    status: 'APPROVED_REIMBURSED',
    debitAccount: '641',
    creditAccount: '112',
    approverNote: 'Đầy đủ Hóa đơn điện tử máy tính tiền + Bill thanh toán chi tiết + Giấy đề xuất tiếp khách. Hạch toán chi phí được trừ 100% thuế TNDN.'
  },
  {
    id: 'PTK-02',
    voucherCode: 'PTK-2026-08/02',
    requestDate: '2026-08-18',
    eventDate: '2026-08-17',
    requesterName: 'Nguyễn Văn Long',
    requesterDepartment: 'Phòng Kỹ Thuật Cơ Điện',
    requesterPosition: 'Trưởng Phòng Cơ Điện',
    partnerName: 'Đội ngũ kỹ thuật viên chuyển giao công nghệ',
    partnerCompany: 'Công Ty Chế Tạo Máy Công Nghiệp Đức Long',
    guestCount: 5,
    businessPurpose: 'Cơm trưa trao đổi tiến độ lắp đặt dây chuyền đóng gói khẩn cấp ngoài giờ (Quán ăn địa phương không xuất hóa đơn điện tử).',
    venueName: 'Quán Cơm Niêu & Lẩu Đồng Quê Sông Bé',
    actualSpentAmount: 2650000,
    invoiceStatus: 'NON_INVOICE_INTERNAL_ALLOWANCE',
    internalAllowanceApproved: true,
    citDeductibleAmount: 0,
    citNonDeductibleAmount: 2650000, // Tự động đưa vào Chỉ tiêu B4 khi quyết toán thuế TNDN
    pitExemptForEmployee: true, // Miễn thuế TNCN theo Điểm đ.4 Khoản 2 Điều 2 TT 111/2013
    status: 'APPROVED_REIMBURSED',
    debitAccount: '642',
    creditAccount: '111',
    approverNote: 'Thanh toán theo Quy chế Khoán tiếp khách nội bộ (Nợ 642 / Có 111). Không có hóa đơn đỏ: Kế toán trưởng duyệt chi nội bộ, tự động bóc tách vào Chỉ tiêu B4 thuế TNDN để không bị cơ quan thuế xử phạt.'
  },
  {
    id: 'PTK-03',
    voucherCode: 'PTK-2026-08/03',
    requestDate: '2026-08-21',
    eventDate: '2026-08-20',
    requesterName: 'Trần Thanh Vân',
    requesterDepartment: 'Ban Tổng Giám Đốc',
    requesterPosition: 'Phó Tổng Giám Đốc Vận Hành',
    partnerName: 'Ban Quản Lý Khu Công Nghiệp Sóng Thần 2',
    partnerCompany: 'Công Ty Cổ Phần Phát Triển KCN Sóng Thần',
    guestCount: 8,
    businessPurpose: 'Tiếp đón làm việc về thủ tục gia hạn mặt bằng kho bãi 2.5 ha phục vụ mở rộng phân xưởng 3.',
    venueName: 'Trung Tâm Hội Nghị & Ẩm Thực Becamex Bình Dương',
    actualSpentAmount: 21500000,
    invoiceStatus: 'HAS_E_INVOICE',
    invoiceNumber: 'HDĐT-0058291 (Chuyển khoản qua VCB)',
    internalAllowanceApproved: true,
    citDeductibleAmount: 21500000,
    citNonDeductibleAmount: 0,
    pitExemptForEmployee: true,
    status: 'APPROVED_REIMBURSED',
    debitAccount: '642',
    creditAccount: '112',
    approverNote: 'Trên 20 triệu: Đã thanh toán bằng Ủy nhiệm chi chuyển khoản ngân hàng không dùng tiền mặt. Đạt chuẩn 100% chi phí hợp lý được trừ theo Điều 4 Thông tư 96/2015.'
  },
  {
    id: 'PTK-04',
    voucherCode: 'PTK-2026-08/04',
    requestDate: '2026-08-24',
    eventDate: '2026-08-23',
    requesterName: 'Đặng Quốc Huy',
    requesterDepartment: 'Phòng Mua Hàng & Cung Ứng',
    requesterPosition: 'Trưởng Phòng Thu Mua',
    partnerName: 'Nhóm hộ nông dân cung ứng nguyên liệu thanh long',
    partnerCompany: 'Tổ Hợp Tác Nông Nghiệp Sạch Hàm Thuận Nam',
    guestCount: 4,
    businessPurpose: 'Tiếp xúc khảo sát vùng nguyên liệu quả tươi tại nhà vườn địa phương (Đặt ăn tại hộ kinh doanh ẩm thực miệt vườn).',
    venueName: 'Hộ Kinh Doanh Ẩm Thực Miệt Vườn Ba Cây Dừa (Doanh thu dưới 100tr/năm)',
    actualSpentAmount: 3800000,
    invoiceStatus: 'HOUSEHOLD_BUSINESS_B01',
    internalAllowanceApproved: true,
    citDeductibleAmount: 3800000,
    citNonDeductibleAmount: 0,
    pitExemptForEmployee: true,
    status: 'APPROVED_REIMBURSED',
    debitAccount: '642',
    creditAccount: '111',
    approverNote: 'Áp dụng Bảng kê thu mua dịch vụ 01/TNDN kèm Hóa đơn bán lẻ & Bản cam kết doanh thu dưới 100 triệu của hộ kinh doanh. Chi phí được trừ hợp lệ theo TT 96/2015.'
  }
];
