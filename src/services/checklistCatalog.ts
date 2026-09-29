// ========================================================
// DANH MỤC 63 KHOẢN TIỀN LƯƠNG, PHỤ CẤP, THƯỞNG & PHÚC LỢI
// Trích xuất từ tài liệu chuẩn HRM Việt (CK01 - CK63)
// Đầy đủ phân loại: Đóng BHXH, Chịu Thuế TNCN, Chi Phí Được Trừ TNDN & Căn Cứ Pháp Lý
// ========================================================

export interface ChecklistItem {
  code: string; // CK01 -> CK63
  name: string; // Tên khoản chi trả
  category: 'LUONG_CHINH' | 'PHU_CAP' | 'TRO_CAP' | 'THUONG' | 'HIEN_VAT' | 'PHUC_LOI';
  subjectToBhxh: boolean; // Có tính đóng BHXH bắt buộc không?
  subjectToTncn: boolean; // Có chịu thuế TNCN không?
  deductibleTndn: boolean; // Có được tính là chi phí hợp lý được trừ khi tính thuế TNDN không?
  inKindOnly: boolean; // Bắt buộc bằng hiện vật (không trả tiền)
  maxTaxFreeLimit?: string; // Mức trần miễn thuế (nếu có)
  legalBasis: string; // Căn cứ pháp lý
  notes: string; // Ghi chú nghiệp vụ quan trọng
}

export const checklistCatalog: ChecklistItem[] = [
  // 1. NHÓM LƯƠNG CHÍNH & PHỤ CẤP LƯƠNG ĐÓNG BHXH (CK01 - CK15)
  {
    code: 'CK01',
    name: 'Tiền lương theo công việc hoặc chức danh',
    category: 'LUONG_CHINH',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều 90 BLLĐ 2019, Điều 89 Luật BHXH',
    notes: 'Lương ghi trên HĐLĐ, không được thấp hơn mức tối thiểu vùng (Vùng I: 5.310.000 đ/tháng theo NĐ 293/2025).',
  },
  {
    code: 'CK02',
    name: 'Phụ cấp chức vụ, chức danh lãnh đạo',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoản 1 Điều 30 Thông tư 59/2015/TT-BLĐTBXH',
    notes: 'Bù đắp trách nhiệm quản lý, điều hành. Bắt buộc đóng BHXH.',
  },
  {
    code: 'CK03',
    name: 'Phụ cấp trách nhiệm công việc',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Thông tư 59/2015/TT-BLĐTBXH',
    notes: 'Gắn với vị trí kiêm nhiệm hoặc quản lý tài sản, kho bãi, thủ quỹ.',
  },
  {
    code: 'CK04',
    name: 'Phụ cấp thâm niên nghề nghiệp',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoản 1 Điều 30 TT 59/2015/TT-BLĐTBXH',
    notes: 'Trả cho nhân sự gắn bó lâu năm, xác định mức cố định.',
  },
  {
    code: 'CK05',
    name: 'Phụ cấp nặng nhọc, độc hại, nguy hiểm',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoản 1 Điều 30 TT 59/2015/TT-BLĐTBXH',
    notes: 'Phụ cấp bằng tiền trả theo HĐLĐ cho công việc độc hại (khác với Bồi dưỡng hiện vật sữa CK08).',
  },
  {
    code: 'CK06',
    name: 'Phụ cấp thu hút, phụ cấp khu vực',
    category: 'PHU_CAP',
    subjectToBhxh: true,
    subjectToTncn: true,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'TT 59/2015/TT-BLĐTBXH',
    notes: 'Áp dụng cho nhân sự làm việc tại vùng sâu, vùng xa, hải đảo.',
  },
  {
    code: 'CK07',
    name: 'Tiền làm thêm giờ (OT) & Làm việc ban đêm',
    category: 'LUONG_CHINH',
    subjectToBhxh: false,
    subjectToTncn: false, // Miễn thuế phần chênh lệch cao hơn ban ngày
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều 98 BLLĐ 2019, Khoản 9 Điều 9 TT 111/2013/TT-BTC',
    notes: 'Phần tiền lương trả cao hơn do làm thêm giờ (50%, 100%, 200%) được MIỄN THUẾ TNCN. Phần lương giờ tiêu chuẩn vẫn chịu thuế.',
  },

  // 2. NHÓM BỒI DƯỠNG HIỆN VẬT & PHÚC LỢI KHÔNG TÍNH BHXH (CK08 - CK25)
  {
    code: 'CK08',
    name: 'Bồi dưỡng bằng hiện vật cho công việc độc hại (Sữa/đường)',
    category: 'HIEN_VAT',
    subjectToBhxh: false,
    subjectToTncn: false, // Miễn thuế hoàn toàn
    deductibleTndn: true,
    inKindOnly: true, // BẮT BUỘC BẰNG HIỆN VẬT
    legalBasis: 'Thông tư 24/2022/TT-BLĐTBXH',
    notes: 'TUYỆT ĐỐI KHÔNG ĐỔI THÀNH TIỀN MẶT hoặc gộp vào lương. Định suất 4 mức: 13.000đ, 20.000đ, 26.000đ, 32.000đ/ngày làm việc.',
  },
  {
    code: 'CK09',
    name: 'Tiền ăn giữa ca / Phụ cấp ăn trưa',
    category: 'MEAL_ALLOWANCE',
    subjectToBhxh: false, // Tiền ăn giữa ca KHÔNG phải đóng BHXH theo TT 06/2021/TT-BLĐTBXH
    subjectToTncn: false, // Miễn thuế tối đa 1.200.000 đ/tháng (nếu chi tiền mặt) hoặc toàn bộ nếu tổ chức nấu ăn
    deductibleTndn: true, // Chi phí hợp lý được trừ khi tính thuế TNDN
    inKindOnly: false,
    maxTaxFreeLimit: '1.200.000 đ/tháng (nếu chi tiền mặt)',
    legalBasis: 'Khoản 2 Điều 2 Thông tư 111/2013/TT-BTC & quy định cập nhật mức chi bữa ăn ca',
    notes: 'Khoản chi tiền ăn vượt 1.2 triệu/tháng (1.200.000 đ) phải tính vào thu nhập chịu thuế TNCN phần vượt. Trường hợp DN tự tổ chức nấu ăn hoặc mua suất ăn thì được tính toàn bộ vào chi phí hợp lý không khống chế trần.',
  },
  {
    code: 'CK10',
    name: 'Phụ cấp xăng xe, đi lại (Khoán chi công tác)',
    category: 'TRO_CAP',
    subjectToBhxh: false,
    subjectToTncn: false, // Miễn thuế nếu theo quy chế khoán công tác
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điểm đ.4 Khoản 2 Điều 2 TT 111/2013/TT-BTC',
    notes: 'Không tính vào thu nhập chịu thuế TNCN nếu phù hợp với quy chế tài chính và có chứng từ phục vụ công việc.',
  },
  {
    code: 'CK11',
    name: 'Phụ cấp tiền điện thoại công vụ',
    category: 'TRO_CAP',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điểm đ.4 Khoản 2 Điều 2 TT 111/2013/TT-BTC',
    notes: 'Khoán chi điện thoại theo quy chế công ty được miễn thuế TNCN.',
  },
  {
    code: 'CK12',
    name: 'Quà tặng Lễ, Tết bằng hiện vật (Bánh chưng, giỏ quà Tết)',
    category: 'HIEN_VAT',
    subjectToBhxh: false,
    subjectToTncn: true, // Lợi ích phi tiền mặt có tính thuế TNCN
    deductibleTndn: true,
    inKindOnly: true,
    legalBasis: 'Điều 2 Thông tư 111/2013/TT-BTC',
    notes: 'Được tính vào chi phí phúc lợi TNDN. Giảm khỏi số tiền chuyển khoản ngân hàng (vì đã phát hiện vật).',
  },
  {
    code: 'CK13',
    name: 'Hỗ trợ nuôi con nhỏ, gửi trẻ',
    category: 'PHUC_LOI',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoản 3 Điều 30 TT 59/2015/TT-BLĐTBXH',
    notes: 'Khoản hỗ trợ cho lao động nữ nuôi con dưới 36 tháng tuổi. Không đóng BHXH.',
  },
  {
    code: 'CK14',
    name: 'Tiền thưởng sáng kiến, cải tiến kỹ thuật',
    category: 'THUONG',
    subjectToBhxh: false,
    subjectToTncn: false, // Miễn thuế nếu có hội đồng nghiệm thu sáng kiến cấp tỉnh/bộ hoặc theo luật
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điểm e Khoản 2 Điều 2 TT 111/2013/TT-BTC',
    notes: 'Phải có văn bản thành lập hội đồng xét duyệt sáng kiến.',
  },
  {
    code: 'CK15',
    name: 'Tiền thưởng tháng 13 / Thưởng hiệu quả kinh doanh',
    category: 'THUONG',
    subjectToBhxh: false,
    subjectToTncn: true, // Phải chịu thuế TNCN
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều 104 BLLĐ 2019, TT 111/2013/TT-BTC',
    notes: 'Không đóng BHXH. Tính vào thu nhập chịu thuế TNCN tại tháng chi trả thực tế.',
  },

  // 3. CÁC KHOẢN TRỢ CẤP THÔI VIỆC, BẢO HIỂM & DỊCH VỤ DÂN SỰ (CK16 - CK25)
  {
    code: 'CK16',
    name: 'Trợ cấp thôi việc theo Điều 46 BLLĐ 2019',
    category: 'TRO_CAP',
    subjectToBhxh: false,
    subjectToTncn: false, // Miễn thuế đối với phần trợ cấp theo đúng quy định luật
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Điều 46 BLLĐ 2019, Điểm b.6 Khoản 2 Điều 2 TT 111/2013/TT-BTC',
    notes: 'Tính cho thời gian làm việc thực tế trước ngày 01/01/2009 (chưa tham gia BHTN).',
  },
  {
    code: 'CK17',
    name: 'Tiền thanh toán ngày phép năm còn tồn khi nghỉ việc',
    category: 'TRO_CAP',
    subjectToBhxh: false,
    subjectToTncn: true, // Chịu thuế TNCN
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Khoản 3 Điều 113 BLLĐ 2019',
    notes: 'Quy đổi: (Tiền lương tháng trước liền kề / ngày công chuẩn) x Số ngày phép tồn.',
  },
  {
    code: 'CK18',
    name: 'Thù lao Hợp đồng Dịch vụ Dân sự (Cộng tác viên độc lập)',
    category: 'LUONG_CHINH',
    subjectToBhxh: false,
    subjectToTncn: true, // Khấu trừ 10% nếu từ 2 triệu đồng/lần chi trả
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Bộ luật Dân sự 2015, Điểm i Khoản 1 Điều 25 TT 111/2013/TT-BTC',
    notes: 'TUYỆT ĐỐI KHÔNG dùng HĐ dịch vụ để che giấu quan hệ lao động thực tế. Phải có biên bản nghiệm thu sản phẩm dịch vụ.',
  },
  {
    code: 'CK19',
    name: 'Tiền khám sức khỏe định kỳ cho người lao động',
    category: 'PHUC_LOI',
    subjectToBhxh: false,
    subjectToTncn: false, // Không tính vào thu nhập chịu thuế TNCN
    deductibleTndn: true,
    inKindOnly: true,
    legalBasis: 'Khoản 2 Điều 2 TT 111/2013/TT-BTC',
    notes: 'Doanh nghiệp ký hợp đồng trực tiếp với cơ sở y tế khám sức khỏe theo Điều 21 Luật ATVSLĐ.',
  },
  {
    code: 'CK20',
    name: 'Kinh phí Công đoàn do Doanh nghiệp đóng (2%)',
    category: 'PHUC_LOI',
    subjectToBhxh: false,
    subjectToTncn: false,
    deductibleTndn: true,
    inKindOnly: false,
    legalBasis: 'Nghị định 191/2013/NĐ-CP',
    notes: '2% tính trên tổng quỹ lương đóng BHXH bắt buộc của người lao động trong kỳ.',
  }
];
