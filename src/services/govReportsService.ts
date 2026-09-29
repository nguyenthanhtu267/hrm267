/**
 * DỊCH VỤ QUẢN LÝ BÁO CÁO HCNS ĐẾN CƠ QUAN NHÀ NƯỚC (GOV COMPLIANCE REPORTS)
 * Trích xuất chuẩn xác từ file "02 NS-BM Tuan thu Bao cao Nha nuoc.xlsx"
 * Mục đích: Kiểm soát thời hạn nộp thủ tục & báo cáo cơ quan nhà nước kịp thời, phòng ngừa xử phạt vi phạm hành chính
 */

export type GovReportApDung = 'CO' | 'KHONG' | 'CAN_XAC_NHAN';
export type GovReportTrangThai = 'CHUA_NOP' | 'DA_NOP';
export type GovReportColor = 'RED' | 'YELLOW' | 'GREEN' | 'GRAY';

export interface GovReportSubmissionHistory {
  id: string;
  dotBaoCao: string;
  ngayGui: string;
  soCongVan?: string;
  canBoGui: string;
  nguoiNhanLienHe?: string;
  coQuanNhan?: string;
  linkWordExcel?: string;
  linkPdf?: string;
  linkVideo?: string;
  ghiChu?: string;
}

export interface GovReportItem {
  id: string;
  stt: number;
  linhVuc: string;
  nhom: string;
  tenThuTuc: string;
  loaiCongViec: string;
  noiDung: string;
  canCu: string;
  bieuMau: string;
  linkMau: string;
  coQuanTiepNhan: string;
  tanSuatThoiHan: string;
  mucPhat: string;
  dieuKhoanPhat: string;
  linkPhat: string;
  apDung: GovReportApDung;
  phuTrach: string;
  ghiChu: string;
  ngayHetHanTiepTheo: string; // YYYY-MM-DD
  trangThaiThuTuc: GovReportTrangThai;
  lichSuBaoCao: GovReportSubmissionHistory[];
}

export interface ReportStatusMeta {
  color: GovReportColor;
  label: string;
  daysRemaining: number;
  priority: number; // 1: RED (Cao nhất, xếp đầu), 2: YELLOW, 3: GREEN, 4: GRAY (Xếp cuối)
  bgClass: string;
  badgeClass: string;
  borderClass: string;
}

const STORAGE_KEY = 'omnihrm_gov_reports_data_v1';

const INITIAL_REPORTS: GovReportItem[] = [
  {
    "id": "GOV-01",
    "stt": 1,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Báo cáo ATVSLĐ",
    "tenThuTuc": "Báo cáo công tác ATVSLĐ định kỳ hằng năm",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Tổng hợp, báo cáo công tác an toàn, vệ sinh lao động của doanh nghiệp trong năm",
    "canCu": "Luật ATVSLĐ 2015; Nghị định 39/2016/NĐ-CP",
    "bieuMau": "Phụ lục II – TT 07/2016/TT-BLĐTBXH",
    "linkMau": "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/mau-bao-cao-cong-tac-an-toan-ve-sinh-lao-dong-cua-doanh-nghiep-5910.html",
    "coQuanTiepNhan": "Sở Nội vụ (đã hợp nhất từ Sở LĐTBXH, 01/3/2025) nơi đặt trụ sở",
    "tanSuatThoiHan": "Hằng năm, trước ngày 10/01 năm sau",
    "mucPhat": "2.000.000 – 6.000.000 đồng",
    "dieuKhoanPhat": "Khoản 2 Điều 20 NĐ 12/2022/NĐ-CP (đến 09/9/2026); Khoản 2 Điều 31 NĐ 283/2026/NĐ-CP (từ 10/9/2026)",
    "linkPhat": "https://thuvienphapluat.vn/lao-dong-tien-luong/doanh-nghiep-bao-cao-cong-tac-an-toan-ve-sinh-lao-dong-tre-han-bi-phat-gi-15727.html",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "NĐ 39/2016 vẫn còn hiệu lực (có dự thảo thay thế, chưa ban hành tại 27/8/2026)",
    "ngayHetHanTiepTheo": "2026-09-25",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-02",
    "stt": 2,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Tai nạn lao động",
    "tenThuTuc": "Khai báo TNLĐ khẩn cấp",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Khai báo ngay bằng hình thức nhanh nhất khi xảy ra TNLĐ chết người hoặc làm từ 02 người bị thương nặng trở lên",
    "canCu": "Điều 34 Luật ATVSLĐ 2015; Nghị định 39/2016/NĐ-CP",
    "bieuMau": "Mẫu số 01 – Phụ lục II, NĐ 129/2025/NĐ-CP (thay Phụ lục III NĐ 39/2016 cũ)",
    "linkMau": "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/cong-viec-phap-ly/khai-bao-tai-nan-lao-dong-khi-xay-ra-tai-nan-lao-dong-su-co-ky-thuat-gay-mat-an-toan-ve-sinh-lao-dong-329.html",
    "coQuanTiepNhan": "Sở Nội vụ và Công an cấp xã/huyện nơi xảy ra tai nạn",
    "tanSuatThoiHan": "Ngay khi xảy ra (trong vòng 24 giờ)",
    "mucPhat": "40.000.000 – 50.000.000 đồng",
    "dieuKhoanPhat": "Điểm đ Khoản 3 Điều 21 Nghị định 12/2022/NĐ-CP (đến 09/9/2026); Điểm đ Khoản 3 Điều 32 Nghị định 283/2026/NĐ-CP (từ 10/9/2026) — hành vi \"không khai báo hoặc khai báo không kịp thời hoặc khai báo sai sự thật về tai nạn lao động\"; mức phạt tổ chức theo Khoản 1 Điều 6 NĐ 12/2022/NĐ-CP (gấp 2 lần cá nhân)",
    "linkPhat": "https://thuvienphapluat.vn/phap-luat/khi-xay-ra-tai-nan-lao-dong-doi-voi-nguoi-lao-dong-lam-viec-khong-theo-hop-dong-lao-dong-thi-viec-k-512372-151411.html",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Phát sinh theo sự kiện — không đưa vào lịch định kỳ, phải có quy trình ứng phó khẩn cấp riêng",
    "ngayHetHanTiepTheo": "2026-12-31",
    "trangThaiThuTuc": "DA_NOP",
    "lichSuBaoCao": [
      {
        "id": "HIST-2-01",
        "dotBaoCao": "Kỳ 6 tháng đầu năm 2026",
        "ngayGui": "2026-06-25",
        "soCongVan": "CV-2/2026/HRM-AV",
        "canBoGui": "Nguyễn Thị Bích Ngọc (Chuyên viên Nhân sự & Pháp chế)",
        "nguoiNhanLienHe": "Bộ phận một cửa - Sở Nội vụ và Công an cấp xã/huyện nơi xảy ra tai nạn",
        "coQuanNhan": "Sở Nội vụ và Công an cấp xã/huyện nơi xảy ra tai nạn",
        "linkWordExcel": "https://docs.google.com/spreadsheets/d/sample_report_excel",
        "linkPdf": "https://thuvienphapluat.vn/sample_signed_report.pdf",
        "ghiChu": "Đã có phiếu xác nhận tiếp nhận trực tuyến từ cổng Dịch vụ công"
      }
    ]
  },
  {
    "id": "GOV-03",
    "stt": 3,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Tai nạn lao động",
    "tenThuTuc": "Báo cáo TNLĐ sau điều tra",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Gửi biên bản điều tra và báo cáo tai nạn lao động sau khi hoàn tất điều tra",
    "canCu": "Nghị định 39/2016/NĐ-CP",
    "bieuMau": "Mẫu số 10a (NLĐ có HĐLĐ) / 10b (không HĐLĐ) – Biên bản điều tra TNLĐ, kèm Mẫu 11a/11b – Biên bản họp công bố, ban hành theo NĐ 39/2016/NĐ-CP",
    "linkMau": "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/cong-viec-phap-ly/khai-bao-su-dung-cac-loai-may-thiet-bi-vat-tu-co-yeu-cau-nghiem-ngat-ve-an-toan-lao-dong-330.html",
    "coQuanTiepNhan": "Sở Nội vụ",
    "tanSuatThoiHan": "Trong 03 ngày kể từ khi công bố biên bản điều tra TNLĐ",
    "mucPhat": "40.000.000 – 50.000.000 đồng",
    "dieuKhoanPhat": "Điểm đ Khoản 3 Điều 21 Nghị định 12/2022/NĐ-CP (đến 09/9/2026); Điểm đ Khoản 3 Điều 32 Nghị định 283/2026/NĐ-CP (từ 10/9/2026) — cùng cụm hành vi \"không điều tra tai nạn lao động thuộc trách nhiệm; không khai báo hoặc khai báo không kịp thời/sai sự thật\" (luật không tách riêng chế tài cho việc \"không gửi biên bản điều tra sau khi hoàn tất điều tra\" — nghĩa vụ điều tra và báo cáo kết quả điều tra được xử lý chung trong cùng điều khoản này)",
    "linkPhat": "https://thuvienphapluat.vn/lao-dong-tien-luong/khong-dieu-tra-tai-nan-lao-dong-thuoc-trach-nhiem-cua-nguoi-su-dung-lao-dong-theo-quy-dinh-cua-phap-1774.html",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Phát sinh theo sự kiện",
    "ngayHetHanTiepTheo": "2026-09-18",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-04",
    "stt": 4,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Tai nạn lao động",
    "tenThuTuc": "Báo cáo tổng hợp tình hình TNLĐ định kỳ",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo tổng hợp tình hình tai nạn lao động của cơ sở",
    "canCu": "Nghị định 39/2016/NĐ-CP",
    "bieuMau": "Phụ lục XII – Mẫu báo cáo tổng hợp tình hình TNLĐ cấp cơ sở (6 tháng/cả năm), NĐ 39/2016/NĐ-CP",
    "linkMau": "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/cach-dien-bao-cao-tinh-hinh-tai-nan-lao-dong-6-thang-dau-nam-2026-21638.html",
    "coQuanTiepNhan": "Sở Nội vụ",
    "tanSuatThoiHan": "6 tháng đầu năm (trước 05/7); cả năm (trước 10/01 năm sau)",
    "mucPhat": "10.000.000 – 20.000.000 đồng",
    "dieuKhoanPhat": "Khoản 3 Điều 20 Nghị định 12/2022/NĐ-CP (hành vi không thống kê tai nạn lao động; không báo cáo định kỳ hoặc báo cáo không đầy đủ, không chính xác, không đúng thời hạn về tai nạn lao động, bệnh nghề nghiệp); Khoản 1 Điều 6 NĐ 12/2022/NĐ-CP (mức phạt tổ chức gấp 2 lần cá nhân)",
    "linkPhat": "https://thuvienphapluat.vn/hoi-dap-phap-luat/cham-nop-bao-cao-tong-hop-tinh-hinh-tai-nan-lao-dong-bi-xu-phat-bao-nhieu-138042017.html",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "",
    "ngayHetHanTiepTheo": "2026-09-11",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-05",
    "stt": 5,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Huấn luyện ATVSLĐ",
    "tenThuTuc": "Tổ chức huấn luyện ATVSLĐ định kỳ",
    "loaiCongViec": "Hoạt động nội bộ",
    "noiDung": "Tổ chức huấn luyện, cấp/gia hạn thẻ an toàn cho các nhóm lao động theo quy định; lưu hồ sơ huấn luyện",
    "canCu": "Nghị định 44/2016/NĐ-CP (sửa đổi bởi NĐ 140/2018/NĐ-CP)",
    "bieuMau": "Giấy chứng nhận huấn luyện/thẻ an toàn theo NĐ 44/2016/NĐ-CP, lưu hồ sơ nội bộ",
    "linkMau": "",
    "coQuanTiepNhan": "Nội bộ (không nộp báo cáo, trừ khi bị thanh tra yêu cầu)",
    "tanSuatThoiHan": "Định kỳ theo thời hạn thẻ an toàn (thường 2 năm/lần)",
    "mucPhat": "10.000.000 – 100.000.000 đồng (tùy số lượng người lao động vi phạm, từ 1 người đến 301+ người)",
    "dieuKhoanPhat": "Khoản 1 Điều 25 Nghị định 12/2022/NĐ-CP (không tổ chức huấn luyện an toàn, vệ sinh lao động cho người lao động theo quy định của pháp luật); Khoản 1 Điều 6 NĐ 12/2022/NĐ-CP (mức phạt tổ chức gấp 2 lần cá nhân)",
    "linkPhat": "https://thuvienphapluat.vn/lao-dong-tien-luong/doanh-nghiep-khong-to-chuc-huan-luyen-an-toan-ve-sinh-lao-dong-se-bi-xu-phat-the-nao-1168.html",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Kết quả huấn luyện tổng hợp vào Báo cáo ATVSLĐ hằng năm (mục 1)",
    "ngayHetHanTiepTheo": "2026-10-01",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-06",
    "stt": 6,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Quan trắc môi trường lao động",
    "tenThuTuc": "Thực hiện quan trắc môi trường lao động",
    "loaiCongViec": "Hoạt động nội bộ",
    "noiDung": "Thuê đơn vị đủ điều kiện quan trắc các yếu tố có hại tại nơi làm việc",
    "canCu": "Điều 18 Luật ATVSLĐ 2015; Nghị định 44/2016/NĐ-CP",
    "bieuMau": "Mẫu số 04 – Phụ lục III, NĐ 44/2016/NĐ-CP (đơn vị quan trắc bên thứ ba lập, không nộp NN)",
    "linkMau": "https://thuvienphapluat.vn/lao-dong-tien-luong/mau-bao-cao-ket-qua-thuc-hien-quan-trac-moi-truong-lao-dong-moi-nhat-hien-nay-11565.html",
    "coQuanTiepNhan": "Đơn vị quan trắc được cấp phép (bên thứ ba)",
    "tanSuatThoiHan": "Ít nhất 01 lần/năm",
    "mucPhat": "- Không tiến hành quan trắc MTLĐ để kiểm soát tác hại sức khỏe NLĐ theo quy định: 40.000.000 – 80.000.000 đồng\r\n- Không công bố công khai kết quả quan trắc cho NLĐ biết ngay sau khi có kết quả: 4.000.000 – 10.000.000 đồng\r\n- Phối hợp với đơn vị quan trắc gian lận kết quả (chưa đến mức hình sự): 80.000.000 – 120.000.000 đồng",
    "dieuKhoanPhat": "Điều 27 (khoản 2, 3, 4) và Điều 6 khoản 1 Nghị định 12/2022/NĐ-CP ngày 17/01/2022 của Chính phủ quy định xử phạt vi phạm hành chính trong lĩnh vực lao động, bảo hiểm xã hội, người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng. (Lưu ý: NĐ này sẽ bị thay thế bởi Nghị định 283/2026/NĐ-CP kể từ 10/9/2026.)",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-12-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-lao-dong-bao-hiem-nguoi-lam-viec-nuoc-ngoai-479312.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Là căn cứ dữ liệu cho báo cáo kết quả quan trắc (mục 7)",
    "ngayHetHanTiepTheo": "2026-10-21",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-07",
    "stt": 7,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Quan trắc môi trường lao động",
    "tenThuTuc": "Báo cáo kết quả quan trắc MTLĐ",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo kết quả quan trắc môi trường lao động tại cơ sở",
    "canCu": "Thông tư 19/2016/TT-BYT",
    "bieuMau": "Phụ lục 8 – Mẫu báo cáo y tế lao động của cơ sở (kết quả quan trắc là 1 phần trong mẫu này), TT 19/2016/TT-BYT",
    "linkMau": "https://thuvienphapluat.vn/ma-so-thue/phap-luat-thue/cach-dien-chi-tiet-mau-bao-cao-y-te-lao-dong-6-thang-dau-nam-2026-390156-227396.html",
    "coQuanTiepNhan": "Sở Y tế",
    "tanSuatThoiHan": "Cùng đợt Báo cáo Y tế lao động (trước 10/01 năm sau) hoặc theo yêu cầu cụ thể của Sở Y tế",
    "mucPhat": "- Không báo cáo hoặc báo cáo không đúng thời hạn về công tác ATVSLĐ (bao gồm báo cáo y tế lao động — trong đó có phần kết quả quan trắc): 2.000.000 – 6.000.000 đồng\r\n- Nếu ở mức nặng hơn — không thống kê/không báo cáo định kỳ hoặc báo cáo không đầy đủ, không chính xác về TNLĐ, BNN, sự cố kỹ thuật nghiêm trọng liên quan: 10.000.000 – 20.000.000 đồng",
    "dieuKhoanPhat": "Điều 20 (khoản 2, 3) và Điều 6 khoản 1 Nghị định 12/2022/NĐ-CP; đối chiếu thời hạn báo cáo tại Điều 10, Điều 14 Thông tư 19/2016/TT-BYT của Bộ Y tế. (Lưu ý tương tự: NĐ 12/2022 sẽ hết hiệu lực từ 10/9/2026.)",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-12-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-lao-dong-bao-hiem-nguoi-lam-viec-nuoc-ngoai-479312.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "",
    "ngayHetHanTiepTheo": "2026-12-05",
    "trangThaiThuTuc": "DA_NOP",
    "lichSuBaoCao": [
      {
        "id": "HIST-7-01",
        "dotBaoCao": "Kỳ 6 tháng đầu năm 2026",
        "ngayGui": "2026-06-25",
        "soCongVan": "CV-7/2026/HRM-AV",
        "canBoGui": "Nguyễn Thị Bích Ngọc (Chuyên viên Nhân sự & Pháp chế)",
        "nguoiNhanLienHe": "Bộ phận một cửa - Sở Y tế",
        "coQuanNhan": "Sở Y tế",
        "linkWordExcel": "https://docs.google.com/spreadsheets/d/sample_report_excel",
        "linkPdf": "https://thuvienphapluat.vn/sample_signed_report.pdf",
        "ghiChu": "Đã có phiếu xác nhận tiếp nhận trực tuyến từ cổng Dịch vụ công"
      }
    ]
  },
  {
    "id": "GOV-08",
    "stt": 8,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Y tế lao động",
    "tenThuTuc": "Khám sức khỏe định kỳ cho NLĐ",
    "loaiCongViec": "Hoạt động nội bộ",
    "noiDung": "Tổ chức khám sức khỏe định kỳ (tối thiểu 01 lần/năm; 06 tháng/lần với công việc nặng nhọc, độc hại) và khám bệnh nghề nghiệp nếu có",
    "canCu": "Điều 21 Luật ATVSLĐ 2015",
    "bieuMau": "Cùng mẫu STT 7",
    "linkMau": "",
    "coQuanTiepNhan": "Cơ sở y tế đủ điều kiện",
    "tanSuatThoiHan": "Hằng năm",
    "mucPhat": "- 2.000.000 – 6.000.000 đ/người LĐ (tối đa 150.000.000 đ) Không tổ chức khám sức khỏe định kỳ hoặc khám phát hiện bệnh nghề nghiệp cho NLĐ\r\n- 10.000.000 – 20.000.000 đ/người LĐ (tối đa 150.000.000 đ) Không tổ chức khám sức khỏe cho NLĐ trước khi chuyển làm công việc nặng nhọc, độc hại, nguy hiểm hơn; hoặc sau khi bị TNLĐ/BNN đã phục hồi, trở lại làm việc",
    "dieuKhoanPhat": "Khoản 2, Khoản 3 Điều 22 và Khoản 1 Điều 6 Nghị định 12/2022/NĐ-CP ngày 17/01/2022 của Chính phủ quy định xử phạt vi phạm hành chính trong lĩnh vực lao động, bảo hiểm xã hội, người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng.",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-12-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-lao-dong-bao-hiem-xa-hoi-497550.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Kết quả tổng hợp vào Báo cáo hoạt động y tế lao động cơ sở (mục 9)",
    "ngayHetHanTiepTheo": "2027-01-04",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-09",
    "stt": 9,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Y tế lao động",
    "tenThuTuc": "Báo cáo hoạt động y tế lao động cơ sở",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo hoạt động y tế lao động tại cơ sở",
    "canCu": "Thông tư 19/2016/TT-BYT",
    "bieuMau": "Cùng mẫu STT 7",
    "linkMau": "",
    "coQuanTiepNhan": "Sở Y tế / Trung tâm Kiểm soát bệnh tật (CDC)",
    "tanSuatThoiHan": "6 tháng đầu năm (trước 05/7); cả năm (trước 10/01 năm sau)",
    "mucPhat": "- 1.000.000 – 2.000.000 đ Không báo cáo kịp thời khi phát hiện nguy cơ sự cố kỹ thuật gây mất an toàn, vệ sinh lao động, TNLĐ, BNN\r\n- 2.000.000 – 6.000.000 đ Không báo cáo, hoặc báo cáo không đúng thời hạn công tác ATVSLĐ (bao gồm Báo cáo y tế lao động 6 tháng/năm gửi Sở Y tế/CDC)\r\n- 10.000.000 – 20.000.000 đ Báo cáo không đầy đủ, không chính xác nội dung (thống kê TNLĐ, BNN...)",
    "dieuKhoanPhat": "Khoản 1, Khoản 2 Điều 20 và Khoản 1 Điều 6 Nghị định 12/2022/NĐ-CP ngày 17/01/2022 của Chính phủ quy định xử phạt vi phạm hành chính trong lĩnh vực lao động, bảo hiểm xã hội, người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng.",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-12-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-lao-dong-bao-hiem-xa-hoi-497550.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "",
    "ngayHetHanTiepTheo": "2026-09-28",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-10",
    "stt": 10,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Thiết bị yêu cầu nghiêm ngặt về ATLĐ",
    "tenThuTuc": "Khai báo sử dụng thiết bị/máy móc/vật tư có yêu cầu nghiêm ngặt",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Khai báo khi đưa vào sử dụng thang máy, thiết bị nâng, bình chịu áp lực...",
    "canCu": "Nghị định 44/2016/NĐ-CP",
    "bieuMau": "Mẫu số 04 – Phụ lục II, NĐ 04/2023/NĐ-CP (thay Phụ lục Iđ NĐ 44/2016 cũ) — Phiếu khai báo sử dụng đối tượng kiểm định",
    "linkMau": "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/cong-viec-phap-ly/khai-bao-su-dung-cac-loai-may-thiet-bi-vat-tu-co-yeu-cau-nghiem-ngat-ve-an-toan-lao-dong-330.html",
    "coQuanTiepNhan": "Sở Nội vụ nơi lắp đặt, sử dụng thiết bị",
    "tanSuatThoiHan": "Phát sinh theo sự kiện: trong 30 ngày trước/sau khi đưa vào sử dụng",
    "mucPhat": "2.000.000 – 4.000.000 đồng",
    "dieuKhoanPhat": "Khoản 1 Điều 24 Nghị định 12/2022/NĐ-CP (không khai báo với cơ quan quản lý nhà nước có thẩm quyền tại địa phương trong thời hạn 30 ngày trước hoặc sau khi đưa vào sử dụng máy, thiết bị, vật tư có yêu cầu nghiêm ngặt về an toàn lao động); mức phạt tổ chức = 02 lần cá nhân theo Khoản 1 Điều 6 Nghị định 12/2022/NĐ-CP.",
    "linkPhat": "https://thuvienphapluat.vn/lao-dong-tien-luong/thoi-han-toi-da-de-thuc-hien-khai-bao-thiet-bi-co-yeu-cau-nghiem-ngat-ve-an-toan-ve-sinh-lao-dong-l-33547.html",
    "apDung": "CAN_XAC_NHAN",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Chỉ áp dụng nếu công ty có sử dụng thiết bị thuộc danh mục yêu cầu nghiêm ngặt về ATLĐ",
    "ngayHetHanTiepTheo": "2026-09-04",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-11",
    "stt": 11,
    "linhVuc": "ATVSLĐ & Y tế",
    "nhom": "Tháng hành động về ATVSLĐ",
    "tenThuTuc": "Báo cáo tổng kết Tháng hành động ATVSLĐ",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo tổng kết các hoạt động hưởng ứng Tháng hành động về ATVSLĐ",
    "canCu": "Kế hoạch/hướng dẫn hằng năm của Sở Nội vụ",
    "bieuMau": "Theo mẫu/hướng dẫn riêng của Sở Nội vụ địa phương ban hành hằng năm",
    "linkMau": "",
    "coQuanTiepNhan": "Sở Nội vụ",
    "tanSuatThoiHan": "Trước 15/7 hằng năm",
    "mucPhat": "Hoạt động theo phong trào/kế hoạch địa phương, chưa xác định được chế tài xử phạt hành chính cụ thể trong văn bản luật hiện hành — khuyến nghị vẫn thực hiện đầy đủ theo yêu cầu của Sở Nội vụ địa phương để tránh bị nhắc nhở/đưa vào diện theo dõi",
    "dieuKhoanPhat": "",
    "linkPhat": "https://thuvienphapluat.vn/lao-dong-tien-luong/doanh-nghiep-bao-cao-cong-tac-an-toan-ve-sinh-lao-dong-tre-han-bi-phat-gi-15727.html",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Bắt buộc với mọi doanh nghiệp trên địa bàn (kể cả nộp báo cáo trắng nếu không có hoạt động)",
    "ngayHetHanTiepTheo": "2026-09-18",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-12",
    "stt": 12,
    "linhVuc": "Môi trường",
    "nhom": "Giấy phép môi trường",
    "tenThuTuc": "Giấy phép môi trường / Đăng ký môi trường",
    "loaiCongViec": "Giấy phép - Hồ sơ duy trì",
    "noiDung": "Xin cấp và duy trì hiệu lực Giấy phép môi trường (hoặc đăng ký môi trường với đối tượng quy mô nhỏ)",
    "canCu": "Luật BVMT 2020; Nghị định 08/2022/NĐ-CP (sửa đổi bởi NĐ 05/2025, NĐ 48/2026/NĐ-CP)",
    "bieuMau": "Phụ lục XIII (văn bản đề nghị cấp GPMT) hoặc mẫu Đăng ký môi trường tương ứng, NĐ 08/2022/NĐ-CP",
    "linkMau": "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/tu-van-phap-luat/62037/tai-ve-34-phu-luc-nghi-dinh-08-2022-quy-dinh-chi-tiet-luat-bao-ve-moi-truong",
    "coQuanTiepNhan": "Sở Nông nghiệp và Môi trường (trước đây là Sở TN&MT)",
    "tanSuatThoiHan": "Theo thời hạn ghi trong giấy phép (thường 5-10 năm); gia hạn trước khi hết hạn",
    "mucPhat": "- 60.000.000 – 70.000.000 đồng UBND cấp huyện\r\n- 300.000.000 – 340.000.000 đồng UBND cấp tỉnh",
    "dieuKhoanPhat": "Điểm c Khoản 2 (huyện) / Khoản 3 (tỉnh) / Khoản 4 (Bộ NN&MT) Điều 14 Nghị định 45/2022/NĐ-CP – hành vi \"không có giấy phép môi trường theo quy định\"; mức phạt tổ chức = 2 lần cá nhân theo Khoản 2 Điều 6 Nghị định 45/2022/NĐ-CP. Ngoài phạt tiền còn bị đình chỉ nguồn phát sinh chất thải 3–6 tháng.",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Tai-nguyen-Moi-truong/Nghi-dinh-45-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-bao-ve-moi-truong-511468.aspx",
    "apDung": "CAN_XAC_NHAN",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Không phải báo cáo định kỳ hằng năm — theo dõi riêng theo hạn giấy phép cụ thể của công ty",
    "ngayHetHanTiepTheo": "2026-09-24",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-13",
    "stt": 13,
    "linhVuc": "Môi trường",
    "nhom": "Quan trắc chất thải",
    "tenThuTuc": "Quan trắc nước thải, khí thải định kỳ",
    "loaiCongViec": "Hoạt động nội bộ",
    "noiDung": "Thực hiện quan trắc định kỳ nước thải/khí thải theo tần suất quy định trong giấy phép môi trường",
    "canCu": "Nghị định 08/2022/NĐ-CP (sửa đổi bởi NĐ 05/2025, NĐ 48/2026/NĐ-CP)",
    "bieuMau": "Đơn vị quan trắc bên thứ ba lập báo cáo kết quả, lưu hồ sơ nội bộ",
    "linkMau": "",
    "coQuanTiepNhan": "Đơn vị quan trắc được cấp phép (bên thứ ba)",
    "tanSuatThoiHan": "Theo giấy phép môi trường (thường 03 tháng/lần)",
    "mucPhat": "- 160.000.000 – 200.000.000 đồng UBND cấp huyện\r\n- \t200.000.000 – 240.000.000 đồng UBND cấp tỉnh",
    "dieuKhoanPhat": "Điểm b Khoản 2 (huyện) / Khoản 3 (tỉnh) / Khoản 4 (Bộ NN&MT) Điều 16 Nghị định 45/2022/NĐ-CP – hành vi \"không thực hiện nội dung về quan trắc nước thải, bụi, khí thải công nghiệp định kỳ... trong trường hợp phải thực hiện theo quy định\"; mức phạt tổ chức = 2 lần cá nhân theo Khoản 2 Điều 6 Nghị định 45/2022/NĐ-CP.",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Tai-nguyen-Moi-truong/Nghi-dinh-45-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-bao-ve-moi-truong-511468.aspx",
    "apDung": "KHONG",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Là căn cứ dữ liệu cho Báo cáo công tác bảo vệ môi trường (mục 14)",
    "ngayHetHanTiepTheo": "2026-10-01",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-14",
    "stt": 14,
    "linhVuc": "Môi trường",
    "nhom": "Báo cáo môi trường",
    "tenThuTuc": "Báo cáo công tác bảo vệ môi trường",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo công tác bảo vệ môi trường của cơ sở",
    "canCu": "Thông tư 02/2022/TT-BTNMT (sửa đổi bởi TT 07/2025/TT-BTNMT)",
    "bieuMau": "Mẫu 05A (cơ sở có GPMT) hoặc Mẫu 05B (cơ sở có đăng ký MT) – Phụ lục VI, TT 02/2022/TT-BTNMT (sửa bởi TT 07/2025)",
    "linkMau": "https://thuvienphapluat.vn/hoi-dap-phap-luat/cac-mau-bieu-ve-bao-cao-cong-tac-bao-ve-moi-truong-138036905.html",
    "coQuanTiepNhan": "Sở Nông nghiệp và Môi trường",
    "tanSuatThoiHan": "Hằng năm, trước ngày 15/01 năm sau",
    "mucPhat": "10.000.000 – 20.000.000 đồng đối với hành vi không lập, lập không đúng, không đầy đủ hoặc không gửi báo cáo công tác bảo vệ môi trường đến cơ quan nhà nước có thẩm quyền đúng thời hạn.",
    "dieuKhoanPhat": "Điều 43 Nghị định 45/2022/NĐ-CP ngày 07/7/2022 (kết hợp khoản 1 Điều 5 về nguyên tắc mức phạt tổ chức gấp 2 lần cá nhân); nghĩa vụ lập/nộp báo cáo được hướng dẫn tại Thông tư 02/2022/TT-BTNMT (sửa đổi bởi Thông tư 07/2025/TT-BTNMT).",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Nghi-dinh-45-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-bao-ve-moi-truong-484772.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Hạn 15/01 xác nhận đúng theo Điều 66 TT 02/2022 (sửa bởi TT 07/2025, hiệu lực 28/2/2025)",
    "ngayHetHanTiepTheo": "2026-10-21",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-15",
    "stt": 15,
    "linhVuc": "Môi trường",
    "nhom": "Kê khai phí BVMT",
    "tenThuTuc": "Kê khai, nộp phí BVMT đối với nước thải",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Kê khai và nộp phí bảo vệ môi trường đối với nước thải phát sinh",
    "canCu": "Nghị định 346/2025/NĐ-CP (hiệu lực 01/01/2026, thay thế NĐ 53/2020/NĐ-CP)",
    "bieuMau": "Mẫu số 02 (nước thải công nghiệp), ban hành kèm NĐ 346/2025/NĐ-CP (thay NĐ 53/2020)",
    "linkMau": "https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Nghi-dinh-346-2025-ND-CP-phi-bao-ve-moi-truong-doi-voi-nuoc-thai-687678.aspx",
    "coQuanTiepNhan": "Tổ chức thu phí tại địa phương (thường đơn vị cấp nước/Sở NN&MT)",
    "tanSuatThoiHan": "Theo quý, chậm nhất ngày 20 của tháng đầu quý tiếp theo",
    "mucPhat": "- Chậm nộp hồ sơ khai phí (áp theo cơ chế xử phạt khai thuế/phí — mức đã là mức tổ chức): 1–30 ngày: 2 – 5 triệu đồng; 31–60 ngày: 5 – 8 triệu đồng; 61–90 ngày (hoặc quá 90 ngày không phát sinh số phí phải nộp): 8 – 15 triệu đồng; quá 90 ngày có phát sinh số phí phải nộp: 15 – 25 triệu đồng.\r\n- Chậm nộp tiền phí đã kê khai: tính tiền chậm nộp 0,03%/ngày trên số tiền phí nộp chậm.\r\n- Kê khai sai làm thiếu số phí phải nộp: phạt 20% số tiền phí kê khai thiếu + truy thu đủ + tiền chậm nộp.\r\n- Mức phạt tối đa cho một hành vi vi phạm về phí BVMT: không quá 1.000.000.000 đồng.",
    "dieuKhoanPhat": "Điều 42 Nghị định 45/2022/NĐ-CP (dẫn chiếu áp dụng chế tài theo pháp luật quản lý giá, phí, lệ phí, hóa đơn) + Điều 13, 16, 17 Nghị định 125/2020/NĐ-CP (được sửa đổi bởi Nghị định 310/2025/NĐ-CP) về xử phạt vi phạm hành chính thuế, hóa đơn – phí, lệ phí; nghĩa vụ gốc theo Nghị định 346/2025/NĐ-CP (hiệu lực 01/01/2026, thay thế Nghị định 53/2020/NĐ-CP).",
    "linkPhat": "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/tu-van-phap-luat/103629/muc-xu-phat-cham-nop-ho-so-khai-thue-nam-2026",
    "apDung": "CO",
    "phuTrach": "Phòng Kế toán - Tài chính",
    "ghiChu": "",
    "ngayHetHanTiepTheo": "2026-12-05",
    "trangThaiThuTuc": "DA_NOP",
    "lichSuBaoCao": [
      {
        "id": "HIST-15-01",
        "dotBaoCao": "Kỳ 6 tháng đầu năm 2026",
        "ngayGui": "2026-06-25",
        "soCongVan": "CV-15/2026/HRM-AV",
        "canBoGui": "Nguyễn Thị Bích Ngọc (Chuyên viên Nhân sự & Pháp chế)",
        "nguoiNhanLienHe": "Bộ phận một cửa - Tổ chức thu phí tại địa phương (thường đơn vị cấp nước/Sở NN&MT)",
        "coQuanNhan": "Tổ chức thu phí tại địa phương (thường đơn vị cấp nước/Sở NN&MT)",
        "linkWordExcel": "https://docs.google.com/spreadsheets/d/sample_report_excel",
        "linkPdf": "https://thuvienphapluat.vn/sample_signed_report.pdf",
        "ghiChu": "Đã có phiếu xác nhận tiếp nhận trực tuyến từ cổng Dịch vụ công"
      }
    ]
  },
  {
    "id": "GOV-16",
    "stt": 16,
    "linhVuc": "Môi trường",
    "nhom": "Kê khai phí BVMT",
    "tenThuTuc": "Kê khai, nộp phí BVMT đối với khí thải",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Kê khai và nộp phí bảo vệ môi trường đối với khí thải phát sinh",
    "canCu": "Nghị định 153/2024/NĐ-CP",
    "bieuMau": "Mẫu số 01, Phụ lục ban hành kèm NĐ 153/2024/NĐ-CP",
    "linkMau": "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/mau-to-khai-nop-phi-bao-ve-moi-truong-doi-voi-khi-thai-theo-nghi-dinh-153-nam-2024-9779.html",
    "coQuanTiepNhan": "Tổ chức thu phí tại địa phương",
    "tanSuatThoiHan": "Theo quý, theo hướng dẫn kê khai của Nghị định 153/2024/NĐ-CP",
    "mucPhat": "- Chậm nộp hồ sơ khai phí: 2 – 25 triệu đồng (tùy số ngày chậm, như trên).\r\n- Chậm nộp tiền phí: 0,03%/ngày trên số tiền chậm nộp.\r\n- Kê khai thiếu: phạt 20% số tiền phí thiếu + truy thu + chậm nộp.\r\n- Trần chung: không quá 1.000.000.000 đồng.",
    "dieuKhoanPhat": "Điều 42 Nghị định 45/2022/NĐ-CP + Điều 13, 16, 17 Nghị định 125/2020/NĐ-CP (sửa đổi bởi Nghị định 310/2025/NĐ-CP); nghĩa vụ gốc theo Nghị định 153/2024/NĐ-CP về phí BVMT đối với khí thải.",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Nghi-dinh-45-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-bao-ve-moi-truong-484772.aspx",
    "apDung": "KHONG",
    "phuTrach": "Phòng Kế toán - Tài chính",
    "ghiChu": "",
    "ngayHetHanTiepTheo": "2027-01-04",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-17",
    "stt": 17,
    "linhVuc": "Hóa chất",
    "nhom": "Báo cáo hóa chất",
    "tenThuTuc": "Báo cáo tổng hợp tình hình hoạt động hóa chất",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo/cập nhật tổng hợp tình hình hoạt động hóa chất trong năm lên Cơ sở dữ liệu hóa chất quốc gia",
    "canCu": "Luật Hóa chất số 69/2025/QH15 (hiệu lực 01/01/2026); Nghị định 26/2026/NĐ-CP (17/1/2026)",
    "bieuMau": "Chưa xác định số mẫu chính thức mới — Luật Hóa chất 2007/NĐ 113/2017 (và mẫu cũ 05a Phụ lục 5, TT 17/2022/TT-BCT) đã hết hiệu lực từ 01/01/2026. Hệ thống báo cáo mới theo TT 01/2026/TT-BCT (19 phụ lục mẫu biểu) — cần đối chiếu trực tiếp trên Cơ sở dữ liệu hóa chất quốc gia",
    "linkMau": "https://thuvienphapluat.vn/van-ban/Linh-vuc-khac/Nghi-dinh-26-2026-ND-CP-huong-dan-Luat-Hoa-chat-quan-ly-hoat-dong-hoa-chat-trong-san-pham-682552.aspx",
    "coQuanTiepNhan": "Sở Công Thương",
    "tanSuatThoiHan": "Hằng năm, trước ngày 15/02 năm sau",
    "mucPhat": "- Cập nhật/nộp báo cáo muộn hơn 15/02 hằng năm: 10.000.000 – 20.000.000 đồng\r\n- Cập nhật thông tin không đầy đủ hoặc không đúng thực tế: 20.000.000 – 30.000.000 đồng\r\n- Không thực hiện báo cáo: 30.000.000 – 40.000.000 đồng",
    "dieuKhoanPhat": "Điều 25, khoản 1(a)/2(a)/3(a) và Điều 4 khoản 2 Nghị định 275/2026/NĐ-CP ngày 08/7/2026 của Chính phủ quy định xử phạt vi phạm hành chính trong lĩnh vực hóa chất và vật liệu nổ công nghiệp (hiệu lực 25/8/2026, thay thế Nghị định 71/2019/NĐ-CP và Nghị định 17/2022/NĐ-CP)",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Nghi-dinh-275-2026-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-hoa-chat-va-vat-lieu-no-cong-nghiep-683265.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Luật Hóa chất 2007 và NĐ 113/2017 đã hết hiệu lực; hạn báo cáo đổi từ 15/01 sang trước 15/02",
    "ngayHetHanTiepTheo": "2026-09-10",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-18",
    "stt": 18,
    "linhVuc": "Hóa chất",
    "nhom": "Huấn luyện an toàn hóa chất",
    "tenThuTuc": "Tổ chức huấn luyện an toàn hóa chất",
    "loaiCongViec": "Hoạt động nội bộ",
    "noiDung": "Huấn luyện an toàn hóa chất cho người liên quan (nhóm 3 trong huấn luyện ATVSLĐ)",
    "canCu": "Luật Hóa chất 69/2025/QH15; Nghị định 26/2026/NĐ-CP",
    "bieuMau": "Không có mẫu nộp NN — lưu hồ sơ huấn luyện nội bộ",
    "linkMau": "",
    "coQuanTiepNhan": "Nội bộ",
    "tanSuatThoiHan": "Định kỳ theo quy định (thường 2 năm/lần)",
    "mucPhat": "- Không lưu đầy đủ hồ sơ huấn luyện / huấn luyện không đủ thời gian tối thiểu: Cảnh cáo\r\n- Không tổ chức/không cử người tham gia huấn luyện định kỳ cho đối tượng nhóm 3 (nhân viên trực tiếp sản xuất/tiếp xúc hóa chất — theo phân loại của chính NĐ này, không phải \"Nhóm III\" trong file bạn), tùy số người vi phạm: 6.000.000 – 50.000.000 đồng (dưới 10 người: 6–10tr; 10–50 người: 10–20tr; 50–100 người: 20–30tr; 100–1.000 người: 30–40tr; ≥1.000 người: 40–50tr)\r\n- Tương tự với nhóm 1, nhóm 2 (cán bộ quản lý/kỹ thuật): 10.000.000 – 60.000.000 đồng tùy số người\r\n- Không lưu hồ sơ huấn luyện đủ 3 năm: 20.000.000 – 30.000.000 đồng\r\n- Huấn luyện nội dung không đúng quy định theo từng nhóm đối tượng: 30.000.000 – 40.000.000 đồng\r\n- Sử dụng người huấn luyện không đủ điều kiện (bằng cấp/kinh nghiệm/chứng chỉ tư vấn): 40.000.000 – 50.000.000 đồng\r\n- Không thực hiện đúng quy định kiểm tra đánh giá kết quả huấn luyện: 50.000.000 – 60.000.000 đồng",
    "dieuKhoanPhat": "Điều 34 và Điều 4 khoản 2 Nghị định 275/2026/NĐ-CP ngày 08/7/2026 (hiệu lực 25/8/2026)",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Nghi-dinh-275-2026-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-hoa-chat-va-vat-lieu-no-cong-nghiep-683265.aspx",
    "apDung": "KHONG",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "",
    "ngayHetHanTiepTheo": "2026-09-04",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-19",
    "stt": 19,
    "linhVuc": "PCCC",
    "nhom": "Báo cáo PCCC",
    "tenThuTuc": "Báo cáo kết quả kiểm tra an toàn PCCC và CNCH định kỳ (Mẫu PC04)",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo kết quả tự kiểm tra an toàn PCCC và cứu nạn, cứu hộ",
    "canCu": "Nghị định 105/2025/NĐ-CP (thay thế NĐ 136/2020 và NĐ 50/2024); mức phạt theo NĐ 106/2025/NĐ-CP",
    "bieuMau": "Mẫu số PC04, Phụ lục VIII, NĐ 105/2025/NĐ-CP",
    "linkMau": "https://thuvienphapluat.vn/phap-luat/mau-pc04-nghi-dinh-105-moi-nhat-2026-tai-mau-pc04-nghi-dinh-105-bao-cao-ket-qua-thuc-hien-cong-tac--169854-253101.html",
    "coQuanTiepNhan": "Cơ quan Công an PCCC quản lý địa bàn (hoặc UBND xã nếu phân cấp)",
    "tanSuatThoiHan": "2 lần/năm: trước ngày 15/6 và trước ngày 15/12 (thống nhất toàn quốc từ 01/7/2025)",
    "mucPhat": "- Không xuất trình hồ sơ PCCC phục vụ kiểm tra, hoặc không gửi báo cáo kết quả thực hiện công tác PCCC, CNCH của cơ sở: 6.000.000 – 10.000.000 đồng.\r\n- Không thực hiện tự kiểm tra an toàn PCCC định kỳ (dẫn đến không có kết quả để báo cáo): 20.000.000 – 40.000.000 đồng.",
    "dieuKhoanPhat": "Điểm b Khoản 1 và Khoản 3 Điều 10 Nghị định 106/2025/NĐ-CP (mức phạt cá nhân 3.000.000–5.000.000đ và 10.000.000–20.000.000đ, nhân đôi cho tổ chức theo Điều 4 cùng Nghị định)",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Nghi-dinh-106-2025-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-phong-chay-chua-chay-657421.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Biểu mẫu đổi từ PC06/PC07 (cũ) sang PC01-PC23 theo NĐ 105/2025",
    "ngayHetHanTiepTheo": "2026-09-05",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-20",
    "stt": 20,
    "linhVuc": "PCCC",
    "nhom": "Hồ sơ PCCC",
    "tenThuTuc": "Lập và cập nhật Hồ sơ quản lý, theo dõi PCCC",
    "loaiCongViec": "Giấy phép - Hồ sơ duy trì",
    "noiDung": "Lập, cập nhật hồ sơ quản lý, theo dõi hoạt động PCCC và CNCH của cơ sở",
    "canCu": "Nghị định 105/2025/NĐ-CP",
    "bieuMau": "Bộ hồ sơ theo Điều 4, Phụ lục VIII NĐ 105/2025/NĐ-CP (gồm PC01, PC02… tùy nội dung hồ sơ)",
    "linkMau": "https://pccc.vn/bieu-mau-pccc-nghi-dinh-105-2025/",
    "coQuanTiepNhan": "Lưu tại cơ sở, xuất trình khi kiểm tra",
    "tanSuatThoiHan": "Cập nhật thường xuyên khi có thay đổi",
    "mucPhat": "Không lập hồ sơ về phòng cháy, chữa cháy, cứu nạn, cứu hộ (hoặc có lập nhưng không cập nhật đầy đủ theo Khoản 1 Điều 4 Nghị định 105/2025/NĐ-CP): 10.000.000 – 14.000.000 đồng.",
    "dieuKhoanPhat": "Khoản 2 Điều 9 Nghị định 106/2025/NĐ-CP (mức phạt cá nhân 5.000.000–7.000.000đ, nhân đôi cho tổ chức) – lưu ý: một vài nguồn tổng hợp đánh số điều khác nhau (Điều 9/Điều 10) do có văn bản sửa đổi; đề nghị đối chiếu lại số điều chính thức trên Cổng thông tin Chính phủ trước khi ban hành nội bộ.",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Nghi-dinh-106-2025-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-phong-chay-chua-chay-657421.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Khuyến nghị rà soát tổng thể hồ sơ định kỳ mỗi Quý IV để không bị động khi có đợt kiểm tra",
    "ngayHetHanTiepTheo": "2026-09-24",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-21",
    "stt": 21,
    "linhVuc": "PCCC",
    "nhom": "Huấn luyện PCCC",
    "tenThuTuc": "Tập huấn nghiệp vụ / diễn tập phương án PCCC",
    "loaiCongViec": "Hoạt động nội bộ",
    "noiDung": "Tổ chức huấn luyện nghiệp vụ PCCC và diễn tập phương án chữa cháy, cứu nạn cứu hộ",
    "canCu": "Nghị định 105/2025/NĐ-CP",
    "bieuMau": "Không có mẫu nộp NN riêng — phối hợp Cảnh sát PCCC khi diễn tập, lưu chứng nhận huấn luyện",
    "linkMau": "",
    "coQuanTiepNhan": "Nội bộ (phối hợp Cảnh sát PCCC khi diễn tập)",
    "tanSuatThoiHan": "Huấn luyện: hằng năm; Diễn tập: theo phương án đã phê duyệt",
    "mucPhat": "- Không tổ chức bồi dưỡng nghiệp vụ PCCC, CNCH hằng năm cho đội viên Đội PCCC cơ sở: 8.000.000 – 12.000.000 đồng.\r\n- Bố trí người thực hiện nhiệm vụ PCCC, CNCH nhưng chưa qua huấn luyện nghiệp vụ: 12.000.000 – 16.000.000 đồng.\r\n- Không tổ chức thực tập (diễn tập) phương án chữa cháy, CNCH của cơ sở: 30.000.000 – 40.000.000 đồng.\r\n- Không xây dựng phương án chữa cháy, CNCH của cơ sở: 40.000.000 – 50.000.000 đồng.",
    "dieuKhoanPhat": "Khoản 3, Khoản 4 Điều 6 và Khoản 4, Khoản 5 Điều 26 Nghị định 106/2025/NĐ-CP (Khoản 4 Điều 6 được sửa đổi bởi Điều 5 Nghị định 69/2026/NĐ-CP, mức cá nhân 6.000.000–8.000.000đ)",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Nghi-dinh-106-2025-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-phong-chay-chua-chay-657421.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự (phụ trách ATVSLĐ - Môi trường)",
    "ghiChu": "Khuyến nghị tổ chức Quý I để chủ động nhân sự cả năm",
    "ngayHetHanTiepTheo": "2026-10-01",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-22",
    "stt": 22,
    "linhVuc": "ATVSTP",
    "nhom": "Giấy chứng nhận ATTP",
    "tenThuTuc": "Giấy chứng nhận cơ sở đủ điều kiện ATTP (nhà ăn tự vận hành)",
    "loaiCongViec": "Giấy phép - Hồ sơ duy trì",
    "noiDung": "Xin cấp và duy trì hiệu lực Giấy chứng nhận cơ sở đủ điều kiện ATTP cho nhà ăn/bếp ăn tập thể tự vận hành",
    "canCu": "Luật ATTP 2010; Nghị định 15/2018/NĐ-CP",
    "bieuMau": "Mẫu số 01, Phụ lục I, NĐ 155/2018/NĐ-CP (đơn đề nghị cấp GCN ATTP)",
    "linkMau": "https://thuvienphapluat.vn/hoi-dap-phap-luat/mau-don-de-nghi-cap-giay-chung-nhan-an-toan-thuc-pham-moi-nhat-2023-138006101.html",
    "coQuanTiepNhan": "Ban/Chi cục ATTP hoặc cơ quan y tế địa phương",
    "tanSuatThoiHan": "Hiệu lực 03 năm; làm thủ tục cấp lại trước khi hết hạn",
    "mucPhat": "20.000.000 – 30.000.000 đồng",
    "dieuKhoanPhat": "Khoản 1 Điều 18 Nghị định 115/2018/NĐ-CP (sửa đổi bởi khoản 8 Điều 1 Nghị định 124/2021/NĐ-CP) — hành vi kinh doanh dịch vụ ăn uống mà không có Giấy chứng nhận cơ sở đủ điều kiện ATTP, hoặc có nhưng đã hết hiệu lực. Lưu ý: mức phạt tại Điều 18 được quy định áp dụng trực tiếp cho tổ chức (theo khoản 2 Điều 3 NĐ 115/2018, sửa đổi) — không phải nhân đôi từ mức cá nhân; cá nhân vi phạm thì mức phạt giảm một nửa (10–15 triệu).",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Nghi-dinh-124-2021-ND-CP-sua-doi-Nghi-dinh-115-2018-ND-CP-va-117-2020-ND-CP-499187.aspx",
    "apDung": "CAN_XAC_NHAN",
    "phuTrach": "Phòng Nhân sự",
    "ghiChu": "CHỈ áp dụng nếu công ty tự vận hành nhà ăn — nếu thuê suất ăn ngoài thì nghĩa vụ thuộc đơn vị cung cấp",
    "ngayHetHanTiepTheo": "2026-10-21",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-23",
    "stt": 23,
    "linhVuc": "ATVSTP",
    "nhom": "Kiểm soát nội bộ ATTP",
    "tenThuTuc": "Khám sức khỏe & tập huấn kiến thức ATTP cho nhân viên bếp ăn",
    "loaiCongViec": "Hoạt động nội bộ",
    "noiDung": "Khám sức khỏe định kỳ và xác nhận tập huấn kiến thức ATTP cho người trực tiếp chế biến, phục vụ ăn uống",
    "canCu": "Luật ATTP 2010; Nghị định 15/2018/NĐ-CP",
    "bieuMau": "Không có mẫu nộp NN — lưu giấy khám sức khỏe & xác nhận tập huấn tại cơ sở",
    "linkMau": "",
    "coQuanTiepNhan": "Nội bộ / cơ sở y tế đủ điều kiện",
    "tanSuatThoiHan": "Hằng năm",
    "mucPhat": "10.000.000 – 14.000.000 đồng (nếu nhân viên trực tiếp chế biến thức ăn không có giấy xác nhận tập huấn kiến thức ATTP); riêng nếu để nhân viên đang mắc bệnh truyền nhiễm (tả, lỵ, thương hàn, viêm gan A/E, viêm da nhiễm trùng, lao phổi, tiêu chảy cấp) tiếp tục trực tiếp chế biến — mức phạt tăng lên 20.000.000 – 30.000.000 đồng",
    "dieuKhoanPhat": "Khoản 3 và Khoản 5 Điều 15 Nghị định 115/2018/NĐ-CP (sửa đổi bởi khoản 6 Điều 1 Nghị định 124/2021/NĐ-CP). Đây là mức phạt cá nhân (5–7 triệu và 10–15 triệu); mức tổ chức = gấp đôi theo nguyên tắc chung tại khoản 2 Điều 3 (Điều 15 không thuộc danh sách ngoại lệ áp dụng trực tiếp cho tổ chức)",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Nghi-dinh-124-2021-ND-CP-sua-doi-Nghi-dinh-115-2018-ND-CP-va-117-2020-ND-CP-499187.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự",
    "ghiChu": "Chỉ áp dụng nếu tự vận hành bếp ăn — có thể gộp cùng đợt khám sức khỏe định kỳ (mục 8)",
    "ngayHetHanTiepTheo": "2026-12-05",
    "trangThaiThuTuc": "DA_NOP",
    "lichSuBaoCao": [
      {
        "id": "HIST-23-01",
        "dotBaoCao": "Kỳ 6 tháng đầu năm 2026",
        "ngayGui": "2026-06-25",
        "soCongVan": "CV-23/2026/HRM-AV",
        "canBoGui": "Nguyễn Thị Bích Ngọc (Chuyên viên Nhân sự & Pháp chế)",
        "nguoiNhanLienHe": "Bộ phận một cửa - Nội bộ / cơ sở y tế đủ điều kiện",
        "coQuanNhan": "Nội bộ / cơ sở y tế đủ điều kiện",
        "linkWordExcel": "https://docs.google.com/spreadsheets/d/sample_report_excel",
        "linkPdf": "https://thuvienphapluat.vn/sample_signed_report.pdf",
        "ghiChu": "Đã có phiếu xác nhận tiếp nhận trực tuyến từ cổng Dịch vụ công"
      }
    ]
  },
  {
    "id": "GOV-24",
    "stt": 24,
    "linhVuc": "Lao động - Tiền lương",
    "nhom": "Báo cáo sử dụng lao động",
    "tenThuTuc": "Báo cáo tình hình sử dụng lao động định kỳ",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo tình hình sử dụng lao động của doanh nghiệp",
    "canCu": "Nghị định 145/2020/NĐ-CP; kênh nộp theo NĐ 129/2025/NĐ-CP",
    "bieuMau": "Mẫu số 01/PLI, Phụ lục I, NĐ 145/2020/NĐ-CP",
    "linkMau": "https://thuvienphapluat.vn/phap-luat/ho-tro-phap-luat/mau-so-01pli-bao-cao-tinh-hinh-su-dung-lao-dong-2023-ban-hanh-kem-theo-nghi-dinh-1452020ndcp-90411.html",
    "coQuanTiepNhan": "Cổng Dịch vụ công Quốc gia; đồng thời báo cơ quan BHXH khu vực (hoặc Sở Nội vụ nếu nộp giấy)",
    "tanSuatThoiHan": "6 tháng đầu năm (trước 05/6); cả năm (trước 05/12)",
    "mucPhat": "10.000.000 – 20.000.000 đồng đối với tổ chức (doanh nghiệp bị phạt gấp 02 lần mức cá nhân theo khoản 1 Điều 7 NĐ 283/2026/NĐ-CP)",
    "dieuKhoanPhat": "Điểm c khoản 2 Điều 11 Nghị định 283/2026/NĐ-CP (\"Không báo cáo tình hình thay đổi về lao động theo quy định\"), áp dụng từ 10/9/2026, thay thế Nghị định 12/2022/NĐ-CP",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-283-2026-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-lao-dong-bao-hiem-xa-hoi-642116.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự",
    "ghiChu": "Có dự thảo sửa đổi NĐ 145/2020 đang lấy ý kiến, chưa ban hành tại 27/8/2026",
    "ngayHetHanTiepTheo": "2026-09-30",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-25",
    "stt": 25,
    "linhVuc": "Lao động - Tiền lương",
    "nhom": "Biến động lao động",
    "tenThuTuc": "Báo cáo tình hình thay đổi lao động hằng tháng",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo tình hình biến động lao động (tuyển mới, nghỉ việc...) trong tháng nếu có phát sinh",
    "canCu": "Nghị định 145/2020/NĐ-CP",
    "bieuMau": "Cùng mẫu STT 24",
    "linkMau": "",
    "coQuanTiepNhan": "Trung tâm Dịch vụ việc làm địa phương",
    "tanSuatThoiHan": "Hằng tháng, trước ngày 03 của tháng liền kề (nếu có biến động)",
    "mucPhat": "",
    "dieuKhoanPhat": "",
    "linkPhat": "",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự",
    "ghiChu": "",
    "ngayHetHanTiepTheo": "2026-09-10",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-26",
    "stt": 26,
    "linhVuc": "Lao động - Tiền lương",
    "nhom": "Nội quy lao động",
    "tenThuTuc": "Đăng ký/sửa đổi Nội quy lao động",
    "loaiCongViec": "Giấy phép - Hồ sơ duy trì",
    "noiDung": "Đăng ký Nội quy lao động và các lần sửa đổi, bổ sung với cơ quan quản lý nhà nước về lao động",
    "canCu": "Điều 119 Bộ luật Lao động 2019; Nghị định 145/2020/NĐ-CP",
    "bieuMau": "Không có mẫu chính thức bắt buộc — chỉ cần văn bản đề nghị tự soạn theo hướng dẫn tại Điều 69 NĐ 145/2020/NĐ-CP",
    "linkMau": "https://thuvienphapluat.vn/phap-luat/ho-tro-phap-luat/mau-van-ban-de-nghi-dang-ky-noi-quy-lao-dong-moi-nhat-hien-nay-nhu-the-nao-trong-noi-quy-lao-dong-t-406940-66638.html",
    "coQuanTiepNhan": "Sở Nội vụ",
    "tanSuatThoiHan": "Một lần khi ban hành mới; đăng ký lại khi có sửa đổi, bổ sung",
    "mucPhat": "10.000.000 – 20.000.000 đồng (áp dụng cho tổ chức/doanh nghiệp; ngoài ra hành vi không thông báo/không niêm yết nội quy lao động tại nơi làm việc bị phạt riêng 2.000.000 – 6.000.000 đồng đối với tổ chức).",
    "dieuKhoanPhat": "Khoản 2 Điều 19 Nghị định 12/2022/NĐ-CP (mức phạt tổ chức = 2 lần mức cá nhân theo Khoản 1 Điều 6), gộp chung 4 tình huống vi phạm cùng mức 5–10 triệu đồng (cá nhân)/10–20 triệu đồng (tổ chức): (a) không có nội quy lao động bằng văn bản khi sử dụng từ 10 lao động trở lên; (b) không đăng ký nội quy lao động theo quy định; (c) không tham khảo ý kiến tổ chức đại diện người lao động tại cơ sở trước khi ban hành/sửa đổi, bổ sung nội quy; (d) sử dụng nội quy lao động chưa có hiệu lực hoặc đã hết hiệu lực. Riêng hành vi không thông báo/không niêm yết nội quy (Khoản 1 Điều 19) bị phạt nhẹ hơn: 1–3 triệu (cá nhân)/2–6 triệu (tổ chức).",
    "linkPhat": "https://thuvienphapluat.vn/lao-dong-tien-luong/khong-dang-ky-noi-quy-lao-dong-theo-quy-dinh-cua-phap-luat-thi-nguoi-su-dung-lao-dong-bi-phat-bao-n-1879.html",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự",
    "ghiChu": "Không phải nghĩa vụ định kỳ hằng năm — chỉ phát sinh khi ban hành mới/sửa đổi",
    "ngayHetHanTiepTheo": "2026-09-04",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-27",
    "stt": 27,
    "linhVuc": "Lao động - Tiền lương",
    "nhom": "Thang bảng lương",
    "tenThuTuc": "Xây dựng, công bố thang lương, bảng lương",
    "loaiCongViec": "Hoạt động nội bộ",
    "noiDung": "Xây dựng thang lương, bảng lương, tham khảo ý kiến tổ chức đại diện NLĐ và công bố công khai tại nơi làm việc",
    "canCu": "Điều 93 Bộ luật Lao động 2019",
    "bieuMau": "Không cần nộp cơ quan NN từ BLLĐ 2019 — chỉ công khai tại nơi làm việc",
    "linkMau": "",
    "coQuanTiepNhan": "Nội bộ",
    "tanSuatThoiHan": "Khi xây dựng mới hoặc điều chỉnh",
    "mucPhat": "10.000.000 – 20.000.000 đồng (áp dụng cho tổ chức/doanh nghiệp).",
    "dieuKhoanPhat": "Khoản 1 Điều 17 Nghị định 12/2022/NĐ-CP (mức phạt tổ chức = 2 lần mức cá nhân theo Khoản 1 Điều 6), gộp chung 3 tình huống vi phạm cùng mức 5–10 triệu đồng (cá nhân)/10–20 triệu đồng (tổ chức): (a) không công bố công khai tại nơi làm việc trước khi thực hiện thang lương, bảng lương, mức lao động, quy chế thưởng; (b) không xây dựng thang lương, bảng lương hoặc định mức lao động, không áp dụng thử mức lao động trước khi ban hành chính thức; (c) không tham khảo ý kiến tổ chức đại diện người lao động tại cơ sở khi xây dựng thang lương, bảng lương, định mức lao động, quy chế thưởng.",
    "linkPhat": "https://thuvienphapluat.vn/lao-dong-tien-luong/cong-ty-khong-xay-dung-thang-luong-bang-luong-thi-bi-xu-phat-nhu-the-nao-10946.html",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự",
    "ghiChu": "Từ BLLĐ 2019: KHÔNG còn phải gửi cơ quan quản lý nhà nước — chỉ công khai tại nơi làm việc",
    "ngayHetHanTiepTheo": "2026-09-18",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-28",
    "stt": 28,
    "linhVuc": "Lao động - Tiền lương",
    "nhom": "Lao động nước ngoài",
    "tenThuTuc": "Báo cáo giải trình nhu cầu & tình hình sử dụng lao động nước ngoài",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Giải trình nhu cầu sử dụng lao động nước ngoài (đã lồng ghép vào hồ sơ cấp phép); báo cáo định kỳ tình hình sử dụng",
    "canCu": "Nghị định 219/2025/NĐ-CP (hiệu lực 07/8/2025, thay thế NĐ 152/2020 và NĐ 70/2023)",
    "bieuMau": "Mẫu số 03, Phụ lục, NĐ 219/2025/NĐ-CP (đã lồng ghép báo cáo giải trình vào hồ sơ cấp phép)",
    "linkMau": "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/chi-tiet-ho-so-de-nghi-cap-giay-phep-lao-dong-cho-nguoi-nuoc-ngoai-tu-07-8-2025-14026.html",
    "coQuanTiepNhan": "Sở Nội vụ",
    "tanSuatThoiHan": "6 tháng đầu năm (trước 05/7); cả năm (trước 05/01 năm sau)",
    "mucPhat": "Không báo cáo, báo cáo không đúng nội dung, hoặc báo cáo không đúng thời hạn về tình hình sử dụng người lao động nước ngoài; hoặc không gửi hợp đồng lao động bản gốc/bản sao chứng thực của NLĐNN cho cơ quan cấp giấy phép: 2.000.000 – 6.000.000 đồng",
    "dieuKhoanPhat": "- Đến hết 09/9/2026: Khoản 1 Điều 32 Nghị định 12/2022/NĐ-CP (mức cá nhân 1–3 triệu đồng)\r\n- Từ 10/9/2026: Khoản 1 điều tương ứng (quy định về người nước ngoài làm việc tại Việt Nam) Nghị định 283/2026/NĐ-CP – cùng mức tiền phạt 1–3 triệu đồng (cá nhân), chỉ nội dung dẫn chiếu cập nhật theo Nghị định 219/2025/NĐ-CP thay cho NĐ 152/2020",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-12-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-lao-dong-bao-hiem-nguoi-lam-viec-nuoc-ngoai-479312.aspx",
    "apDung": "CAN_XAC_NHAN",
    "phuTrach": "Phòng Nhân sự",
    "ghiChu": "CHỈ áp dụng nếu công ty có sử dụng lao động nước ngoài",
    "ngayHetHanTiepTheo": "2026-09-24",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-29",
    "stt": 29,
    "linhVuc": "Lao động - Tiền lương",
    "nhom": "Lao động nước ngoài",
    "tenThuTuc": "Cấp/gia hạn Giấy phép lao động cho NLĐ nước ngoài",
    "loaiCongViec": "Giấy phép - Hồ sơ duy trì",
    "noiDung": "Xin cấp mới hoặc gia hạn Giấy phép lao động cho từng lao động nước ngoài",
    "canCu": "Nghị định 219/2025/NĐ-CP",
    "bieuMau": "Mẫu số 03 (đề nghị cấp) / Mẫu số 01 (nếu thuộc diện xác nhận không cần GPLĐ), Phụ lục NĐ 219/2025/NĐ-CP",
    "linkMau": "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/tong-hop-cac-mau-ban-hanh-kem-theo-nghi-dinh-219-2025-nd-cp-13929.html",
    "coQuanTiepNhan": "Sở Nội vụ",
    "tanSuatThoiHan": "Theo thời hạn hợp đồng/giấy phép (tối đa 02 năm/lần); làm trước khi hết hạn",
    "mucPhat": "Sử dụng lao động nước ngoài không có giấy phép lao động (hoặc không có giấy xác nhận miễn GPLĐ, hoặc GPLĐ đã hết hạn) mà vẫn để làm việc:\r\n- Vi phạm 1–10 người: 60.000.000 – 90.000.000 đồng\r\n- Vi phạm 11–20 người: 90.000.000 – 120.000.000 đồng\r\n- Vi phạm từ 21 người trở lên: 120.000.000 – 150.000.000 đồng\r\n(ngoài phạt tiền, người lao động nước ngoài vi phạm còn bị buộc trục xuất)",
    "dieuKhoanPhat": "- Đến hết 09/9/2026: Khoản 4 Điều 32 Nghị định 12/2022/NĐ-CP\r\n- Từ 10/9/2026: Khoản 5 điều tương ứng Nghị định 283/2026/NĐ-CP – giữ nguyên mức tiền phạt và các mốc phân loại theo số người vi phạm như NĐ 12/2022",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-283-2026-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-lao-dong-bao-hiem-xa-hoi-642116.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự",
    "ghiChu": "Chỉ áp dụng nếu có lao động nước ngoài — theo dõi riêng theo hạn từng giấy phép cá nhân",
    "ngayHetHanTiepTheo": "2026-10-01",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-30",
    "stt": 30,
    "linhVuc": "Lao động - Tiền lương",
    "nhom": "Công đoàn",
    "tenThuTuc": "Đóng kinh phí công đoàn",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Trích nộp kinh phí công đoàn 2% quỹ tiền lương làm căn cứ đóng BHXH (bắt buộc dù có hay chưa có công đoàn cơ sở)",
    "canCu": "Luật Công đoàn số 50/2024/QH15 (hiệu lực 01/7/2025); Nghị định 105/2026/NĐ-CP (thay NĐ 191/2013)",
    "bieuMau": "Chưa xác định mẫu tờ khai chính thức mới theo NĐ 105/2026/NĐ-CP (thay NĐ 191/2013) — cần liên hệ trực tiếp Liên đoàn Lao động địa phương để lấy mẫu/kênh nộp",
    "linkMau": "",
    "coQuanTiepNhan": "Công đoàn cấp trên cơ sở / Liên đoàn Lao động địa phương",
    "tanSuatThoiHan": "Hằng tháng, cùng thời điểm đóng BHXH bắt buộc",
    "mucPhat": "24% – dưới 30% tổng số tiền kinh phí công đoàn phải đóng tại thời điểm lập biên bản vi phạm (đối với hành vi chậm đóng/đóng không đúng mức/đóng không đủ số người), tối đa không quá 150.000.000 đồng; riêng hành vi không đóng cho toàn bộ người lao động thuộc đối tượng phải đóng bị phạt 36% – 40% tổng số tiền phải đóng, cũng tối đa không quá 150.000.000 đồng (mức áp dụng cho tổ chức/doanh nghiệp).",
    "dieuKhoanPhat": "Điều 38 Nghị định 12/2022/NĐ-CP (đến 09/9/2026); Điều 38 Nghị định 283/2026/NĐ-CP từ 10/9/2026 (mức phạt cá nhân là 12–15% với hành vi chậm đóng/đóng sai mức/đóng thiếu người, 18–20% với hành vi không đóng toàn bộ; mức phạt tổ chức = 2 lần mức cá nhân theo Khoản 1 Điều 6). Ngoài phạt tiền, công ty còn buộc phải nộp bổ sung số kinh phí công đoàn chưa đóng/chậm đóng cộng tiền lãi theo lãi suất tiền gửi không kỳ hạn cao nhất của NHTM nhà nước tại thời điểm xử phạt, trong vòng 30 ngày kể từ ngày có quyết định xử phạt. Lưu ý: cơ chế quản lý, sử dụng kinh phí công đoàn hiện dẫn chiếu Nghị định 105/2026/NĐ-CP (thay NĐ 191/2013/NĐ-CP), nhưng chế tài xử phạt hành chính vẫn theo Điều 38 NĐ 12/2022/NĐ-CP.",
    "linkPhat": "https://thuvienphapluat.vn/lao-dong-tien-luong/doanh-nghiep-cham-dong-kinh-phi-cong-doan-thi-bi-xu-phat-cao-nhat-bao-nhieu-tien-32184.html",
    "apDung": "CO",
    "phuTrach": "Phòng Kế toán - Tài chính",
    "ghiChu": "Mức đóng vẫn giữ 2%; có cơ chế miễn/giảm tối đa 20%/tạm dừng cho DN khó khăn — kiểm tra điều kiện nếu đủ tiêu chí",
    "ngayHetHanTiepTheo": "2026-10-21",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  },
  {
    "id": "GOV-31",
    "stt": 31,
    "linhVuc": "Lao động - Tiền lương",
    "nhom": "Công đoàn",
    "tenThuTuc": "Báo cáo tình hình hoạt động & tài chính công đoàn cơ sở",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo tình hình hoạt động và quyết toán tài chính công đoàn cơ sở",
    "canCu": "Luật Công đoàn 50/2024/QH15; Điều lệ Công đoàn Việt Nam",
    "bieuMau": "Theo mẫu của Tổng Liên đoàn Lao động Việt Nam ban hành (không thuộc hệ thống văn bản Chính phủ/Bộ) — Ban Chấp hành CĐCS liên hệ trực tiếp Công đoàn cấp trên để lấy mẫu",
    "linkMau": "",
    "coQuanTiepNhan": "Công đoàn cấp trên cơ sở",
    "tanSuatThoiHan": "Hằng năm",
    "mucPhat": "Không có mức phạt tiền từ cơ quan nhà nước. Đây là nghĩa vụ báo cáo nội bộ của Ban Chấp hành công đoàn cơ sở lên công đoàn cấp trên (Liên đoàn Lao động tỉnh/thành phố hoặc Công đoàn ngành), không phải báo cáo với cơ quan quản lý nhà nước, nên không thuộc phạm vi xử phạt vi phạm hành chính theo Nghị định 12/2022/NĐ-CP.",
    "dieuKhoanPhat": "Không có chế tài xử phạt hành chính cụ thể từ Nhà nước; việc không lập/không gửi báo cáo dự toán, quyết toán tài chính công đoàn cơ sở đúng hạn (theo mẫu B14-TLĐ, B07-TLĐ) sẽ bị xử lý theo Điều lệ Công đoàn Việt Nam và các quy định nội bộ của hệ thống Công đoàn (Quyết định 4290/QĐ-TLĐ năm 2022; Hướng dẫn 47/HD-TLĐ năm 2021) — có thể bị công đoàn cấp trên nhắc nhở, đưa vào diện kiểm tra, giám sát tài chính, hoặc xem xét trách nhiệm của Ban Chấp hành/Ủy ban Kiểm tra công đoàn cơ sở, chứ không phải phạt tiền hành chính từ Nhà nước.",
    "linkPhat": "https://luatminhkhue.vn/bao-cao-tai-chinh-cong-doan-la-gi-quy-dinh-ve-bao-cao-tai-chinh-cong-doan.aspx",
    "apDung": "CO",
    "phuTrach": "Ban Chấp hành Công đoàn cơ sở (phối hợp Phòng Nhân sự)",
    "ghiChu": "CHỈ áp dụng nếu công ty đã có tổ chức công đoàn cơ sở",
    "ngayHetHanTiepTheo": "2026-12-05",
    "trangThaiThuTuc": "DA_NOP",
    "lichSuBaoCao": [
      {
        "id": "HIST-31-01",
        "dotBaoCao": "Kỳ 6 tháng đầu năm 2026",
        "ngayGui": "2026-06-25",
        "soCongVan": "CV-31/2026/HRM-AV",
        "canBoGui": "Nguyễn Thị Bích Ngọc (Chuyên viên Nhân sự & Pháp chế)",
        "nguoiNhanLienHe": "Bộ phận một cửa - Công đoàn cấp trên cơ sở",
        "coQuanNhan": "Công đoàn cấp trên cơ sở",
        "linkWordExcel": "https://docs.google.com/spreadsheets/d/sample_report_excel",
        "linkPdf": "https://thuvienphapluat.vn/sample_signed_report.pdf",
        "ghiChu": "Đã có phiếu xác nhận tiếp nhận trực tuyến từ cổng Dịch vụ công"
      }
    ]
  },
  {
    "id": "GOV-32",
    "stt": 32,
    "linhVuc": "Lao động - Tiền lương",
    "nhom": "Bảo hiểm xã hội",
    "tenThuTuc": "Báo cáo tăng/giảm lao động tham gia BHXH, BHYT, BHTN",
    "loaiCongViec": "Báo cáo cơ quan NN",
    "noiDung": "Báo cáo danh sách tăng, giảm lao động tham gia BHXH, BHYT, BHTN khi có biến động nhân sự",
    "canCu": "Luật BHXH số 41/2024/QH15; Nghị định 158/2025/NĐ-CP",
    "bieuMau": "Mẫu D02-LT (hoặc mẫu tương đương theo hướng dẫn BHXH Việt Nam, cập nhật theo Luật BHXH 41/2024/QH15 và NĐ 158/2025/NĐ-CP) — nộp qua phần mềm/Cổng giao dịch điện tử BHXH",
    "linkMau": "(liên hệ cơ quan BHXH khu vực quản lý để lấy mẫu điện tử hiện hành)",
    "coQuanTiepNhan": "Cơ quan Bảo hiểm xã hội khu vực quản lý",
    "tanSuatThoiHan": "Phát sinh khi có biến động lao động (không cố định theo năm)",
    "mucPhat": "Theo số lao động bị ảnh hưởng (mức tổ chức = 2 lần mức cá nhân, theo khoản 1 Điều 7 NĐ 283/2026/NĐ-CP):\r\n- Dưới 10 NLĐ: 5–10tr (cá nhân) → 10–20tr (tổ chức)\r\n- 10 – dưới 50 NLĐ: 10–15tr → 20–30tr\r\n- 50 – dưới 100 NLĐ: 15–20tr → 30–40tr\r\n- 100 – dưới 300 NLĐ: 20–30tr → 40–60tr\r\n- 300 – dưới 500 NLĐ: 30–40tr → 60–80tr\r\n- 500 – dưới 700 NLĐ: 40–50tr → 80–100tr\r\n- 700 – dưới 1.000 NLĐ: 50–60tr → 100–120tr\r\n- Từ 1.000 NLĐ trở lên: 60–75tr → 120–150tr",
    "dieuKhoanPhat": "Hành vi \"không đăng ký hoặc đăng ký không đầy đủ số người tham gia BHXH bắt buộc trong thời hạn 60 ngày kể từ ngày hết thời hạn quy định tại khoản 1 Điều 28 Luật BHXH 2024\" — Khoản 2 Điều 43 Nghị định 283/2026/NĐ-CP, áp dụng từ 10/9/2026",
    "linkPhat": "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-283-2026-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-lao-dong-bao-hiem-xa-hoi-642116.aspx",
    "apDung": "CO",
    "phuTrach": "Phòng Nhân sự",
    "ghiChu": "",
    "ngayHetHanTiepTheo": "2027-01-04",
    "trangThaiThuTuc": "CHUA_NOP",
    "lichSuBaoCao": []
  }
];

export const govReportsService = {
  getReports(): GovReportItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
    return INITIAL_REPORTS;
  },

  saveReports(items: GovReportItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
  },

  resetToDefault(): GovReportItem[] {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    return INITIAL_REPORTS;
  },

  /**
   * Tính toán trạng thái thời hạn và màu sắc theo đúng tiêu chí:
   * - Gần hạn / Quá hạn (<7 ngày): MÀU ĐỎ, ưu tiên 1 (tự nhảy lên đầu)
   * - Chưa gấp nhưng gần (7 - 30 ngày): MÀU VÀNG, ưu tiên 2
   * - Đang tốt (>30 ngày hoặc đã nộp): MÀU XANH, ưu tiên 3
   * - Công ty không áp dụng: MÀU XÁM NHẸ, ưu tiên 4
   */
  calculateStatus(item: GovReportItem, referenceDateStr?: string): ReportStatusMeta {
    if (item.apDung === 'KHONG') {
      return {
        color: 'GRAY',
        label: 'Không áp dụng',
        daysRemaining: 9999,
        priority: 4,
        bgClass: 'bg-slate-50 hover:bg-slate-100/80',
        badgeClass: 'bg-slate-100 text-slate-500 border border-slate-300',
        borderClass: 'border-slate-200'
      };
    }

    if (item.trangThaiThuTuc === 'DA_NOP') {
      return {
        color: 'GREEN',
        label: '✓ Đã hoàn tất nộp kỳ này',
        daysRemaining: 999,
        priority: 3,
        bgClass: 'bg-emerald-50/50 hover:bg-emerald-50',
        badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        borderClass: 'border-emerald-200'
      };
    }

    const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
    refDate.setHours(0, 0, 0, 0);

    const deadline = new Date(item.ngayHetHanTiepTheo);
    deadline.setHours(0, 0, 0, 0);

    const diffMs = deadline.getTime() - refDate.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        color: 'RED',
        label: `⚠️ ĐÃ QUÁ HẠN ${Math.abs(daysRemaining)} NGÀY!`,
        daysRemaining,
        priority: 1,
        bgClass: 'bg-rose-50/80 hover:bg-rose-100/60',
        badgeClass: 'bg-rose-100 text-rose-900 border border-rose-300 font-black animate-pulse',
        borderClass: 'border-rose-300 ring-1 ring-rose-300'
      };
    }

    if (daysRemaining <= 7) {
      return {
        color: 'RED',
        label: `🚨 KHẨN CẤP: CÒN ${daysRemaining} NGÀY!`,
        daysRemaining,
        priority: 1,
        bgClass: 'bg-rose-50/80 hover:bg-rose-100/60',
        badgeClass: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold',
        borderClass: 'border-rose-300 ring-1 ring-rose-200'
      };
    }

    if (daysRemaining <= 30) {
      return {
        color: 'YELLOW',
        label: `⏱️ Sắp đến hạn: Còn ${daysRemaining} ngày`,
        daysRemaining,
        priority: 2,
        bgClass: 'bg-amber-50/60 hover:bg-amber-100/50',
        badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold',
        borderClass: 'border-amber-200'
      };
    }

    return {
      color: 'GREEN',
      label: `✓ Đang an toàn: Còn ${daysRemaining} ngày`,
      daysRemaining,
      priority: 3,
      bgClass: 'bg-white hover:bg-emerald-50/30',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      borderClass: 'border-slate-200'
    };
  },

  /**
   * Trả về danh sách được tự động sắp xếp theo thứ tự:
   * 1. ĐỎ (Quá hạn & Khẩn cấp < 7 ngày) - Tự động đẩy lên đầu bảng
   * 2. VÀNG (Sắp đến hạn 7 - 30 ngày)
   * 3. XANH (Còn xa hoặc đã nộp xong)
   * 4. XÁM (Công ty không áp dụng - ở cuối cùng)
   */
  getSortedReports(items?: GovReportItem[]): { item: GovReportItem; status: ReportStatusMeta }[] {
    const list = items || this.getReports();
    return list
      .map(item => ({ item, status: this.calculateStatus(item) }))
      .sort((a, b) => {
        if (a.status.priority !== b.status.priority) {
          return a.status.priority - b.status.priority;
        }
        return a.status.daysRemaining - b.status.daysRemaining;
      });
  },

  /**
   * Tính số lượng badge cảnh báo nổi trên Sidebar:
   * Số lượng = Tổng số mục MÀU ĐỎ + Tổng số mục MÀU VÀNG
   */
  getWarningBadgeCount(items?: GovReportItem[]): number {
    const list = items || this.getReports();
    let count = 0;
    for (const item of list) {
      const st = this.calculateStatus(item);
      if (st.color === 'RED' || st.color === 'YELLOW') {
        count++;
      }
    }
    return count;
  },

  /**
   * Thêm hoặc cập nhật đợt nộp báo cáo
   */
  addSubmissionRecord(
    reportId: string,
    submission: Omit<GovReportSubmissionHistory, 'id'>
  ): GovReportItem[] {
    const list = this.getReports();
    const updated = list.map(item => {
      if (item.id === reportId) {
        const newHist: GovReportSubmissionHistory = {
          id: `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ...submission
        };
        return {
          ...item,
          trangThaiThuTuc: 'DA_NOP' as GovReportTrangThai,
          lichSuBaoCao: [newHist, ...(item.lichSuBaoCao || [])]
        };
      }
      return item;
    });
    this.saveReports(updated);
    return updated;
  },

  /**
   * Chuyển đổi trạng thái áp dụng cho công ty (Có / Không áp dụng)
   */
  toggleApDung(reportId: string, apDung: GovReportApDung): GovReportItem[] {
    const list = this.getReports();
    const updated = list.map(item => {
      if (item.id === reportId) {
        return { ...item, apDung };
      }
      return item;
    });
    this.saveReports(updated);
    return updated;
  },

  /**
   * Cập nhật toàn bộ thông tin chi tiết một dòng thủ tục
   */
  updateReport(updatedItem: GovReportItem): GovReportItem[] {
    const list = this.getReports();
    const index = list.findIndex(item => item.id === updatedItem.id);
    let newList: GovReportItem[];
    if (index >= 0) {
      newList = list.map(item => item.id === updatedItem.id ? updatedItem : item);
    } else {
      newList = [updatedItem, ...list];
    }
    this.saveReports(newList);
    return newList;
  },

  /**
   * Khôi phục danh sách báo cáo về dữ liệu gốc ban đầu
   */
  resetToOriginal(): GovReportItem[] {
    localStorage.removeItem(STORAGE_KEY);
    return this.getReports();
  },

  /**
   * Nhập dữ liệu từ file Excel (Cách 2: Cập nhật / Đồng bộ từ Excel người dùng tải lên)
   */
  importFromExcelRows(rows: any[]): { successCount: number; updatedList: GovReportItem[] } {
    const currentList = this.getReports();
    let successCount = 0;

    const updatedList = currentList.map(item => {
      // Tìm dòng đối ứng trong Excel theo Mã Thủ Tục hoặc STT hoặc Tên Thủ Tục
      const matchedRow = rows.find(r => {
        const rowId = r['Mã Thủ Tục'] || r['Mã thủ tục'] || r['MaThuTuc'] || r['id'] || r['ID'];
        const rowStt = r['STT'] || r['stt'];
        const rowName = r['Hạng Mục Báo Cáo'] || r['Hạng mục báo cáo'] || r['Tên Thủ Tục'] || r['tenThuTuc'];

        if (rowId && String(rowId).trim().toUpperCase() === item.id.toUpperCase()) return true;
        if (rowStt && Number(rowStt) === item.stt) return true;
        if (rowName && String(rowName).trim().toLowerCase() === item.tenThuTuc.toLowerCase()) return true;
        return false;
      });

      if (matchedRow) {
        successCount++;
        // Trích xuất các trường thông tin cập nhật nếu có trong Excel
        const linhVuc = matchedRow['Lĩnh Vực'] || matchedRow['Lĩnh vực'] || item.linhVuc;
        const tenThuTuc = matchedRow['Hạng Mục Báo Cáo'] || matchedRow['Tên Thủ Tục'] || matchedRow['Hạng mục báo cáo'] || item.tenThuTuc;
        const noiDung = matchedRow['Nội Dung Chi Tiết'] || matchedRow['Nội dung'] || item.noiDung;
        const coQuanTiepNhan = matchedRow['Cơ Quan Tiếp Nhận'] || matchedRow['Cơ quan tiếp nhận'] || item.coQuanTiepNhan;
        const tanSuatThoiHan = matchedRow['Tần Suất / Hạn Nộp'] || matchedRow['Tần suất'] || item.tanSuatThoiHan;
        const ngayHetHanTiepTheo = matchedRow['Ngày Hết Hạn Tới (YYYY-MM-DD)'] || matchedRow['Ngày Hết Hạn Tới'] || matchedRow['Hạn nộp tiếp theo'] || item.ngayHetHanTiepTheo;
        const mucPhat = matchedRow['Mức Phạt Vi Phạm'] || matchedRow['Mức phạt'] || item.mucPhat;
        const dieuKhoanPhat = matchedRow['Điều Khoản Xử Phạt'] || matchedRow['Điều khoản phạt'] || item.dieuKhoanPhat;
        const bieuMau = matchedRow['Biểu Mẫu Quy Định'] || matchedRow['Biểu mẫu'] || item.bieuMau;
        const canCu = matchedRow['Căn Cứ Pháp Lý'] || matchedRow['Căn cứ'] || item.canCu;
        const phuTrach = matchedRow['Cán Bộ / Phòng Ban Phụ Trách'] || matchedRow['Phụ trách'] || item.phuTrach;
        const ghiChu = matchedRow['Ghi Chú Nghiệp Vụ'] || matchedRow['Ghi chú'] || item.ghiChu;
        
        // Trạng thái áp dụng
        let apDung = item.apDung;
        const rawApDung = matchedRow['Áp Dụng (Có/Không)'] || matchedRow['Áp Dụng'] || matchedRow['Trạng Thái Màu'];
        if (rawApDung) {
          const str = String(rawApDung).toUpperCase();
          if (str.includes('KHÔNG') || str.includes('XÁM') || str.includes('NO')) {
            apDung = 'KHONG';
          } else if (str.includes('CÓ') || str.includes('YES') || str.includes('ĐỎ') || str.includes('VÀNG') || str.includes('XANH')) {
            apDung = 'CO';
          }
        }

        // Tình trạng nộp
        let trangThaiThuTuc = item.trangThaiThuTuc;
        const rawTinhTrang = matchedRow['Tình Trạng Nộp (Đã nộp/Chưa nộp)'] || matchedRow['Tình Trạng Nộp'];
        if (rawTinhTrang) {
          const str = String(rawTinhTrang).toUpperCase();
          if (str.includes('ĐÃ') || str.includes('DA_NOP') || str.includes('XONG')) {
            trangThaiThuTuc = 'DA_NOP';
          } else {
            trangThaiThuTuc = 'CHUA_NOP';
          }
        }

        return {
          ...item,
          linhVuc: String(linhVuc).trim(),
          tenThuTuc: String(tenThuTuc).trim(),
          noiDung: String(noiDung || item.noiDung).trim(),
          coQuanTiepNhan: String(coQuanTiepNhan).trim(),
          tanSuatThoiHan: String(tanSuatThoiHan).trim(),
          ngayHetHanTiepTheo: String(ngayHetHanTiepTheo || item.ngayHetHanTiepTheo).trim(),
          mucPhat: String(mucPhat).trim(),
          dieuKhoanPhat: String(dieuKhoanPhat || item.dieuKhoanPhat).trim(),
          bieuMau: String(bieuMau || item.bieuMau).trim(),
          canCu: String(canCu || item.canCu).trim(),
          phuTrach: String(phuTrach || item.phuTrach).trim(),
          ghiChu: String(ghiChu || item.ghiChu).trim(),
          apDung,
          trangThaiThuTuc
        };
      }

      return item;
    });

    this.saveReports(updatedList);
    return { successCount, updatedList };
  }
};

