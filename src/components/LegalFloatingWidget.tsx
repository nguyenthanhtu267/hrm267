import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, ExternalLink, Sparkles, Scale, BookOpen, Clock, AlertTriangle, X, Search, Filter } from 'lucide-react';

interface LegalDoc {
  title: string;
  code: string;
  effectiveDate: string;
  status: 'ACTIVE' | 'UPCOMING';
  scope: string;
  summary: string;
  officialUrl: string;
}

const LEGAL_DOCUMENTS: LegalDoc[] = [
  // 1. VĂN BẢN ĐANG ÁP DỤNG
  {
    title: 'Bộ luật Lao động 2019',
    code: 'Bộ luật số 45/2019/QH14',
    effectiveDate: '01/01/2021',
    status: 'ACTIVE',
    scope: 'Hợp đồng lao động, tiền lương, thời giờ làm việc, nghỉ ngơi, kỷ luật, giải quyết tranh chấp',
    summary: 'Bộ luật nền tảng điều chỉnh toàn diện quan hệ lao động; thời giờ làm việc tối đa 48h/tuần; trần làm thêm OT 40h/tháng và 200-300h/năm; khoảng cách nghỉ giữa 2 ca tối thiểu 12 giờ liên tục; giới hạn tối đa 2 lần ký HĐLĐ xác định thời hạn.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx'
  },
  {
    title: 'Nghị định 74/2024/NĐ-CP (và văn bản cập nhật) quy định mức lương tối thiểu đối với người lao động làm việc theo HĐLĐ',
    code: 'Nghị định số 74/2024/NĐ-CP',
    effectiveDate: '01/07/2024 (Đang cập nhật mức mới)',
    status: 'ACTIVE',
    scope: 'Mức sàn tiền lương Vùng 1 (4.960.000đ → điều chỉnh 5.310.000đ), Vùng 2, Vùng 3, Vùng 4',
    summary: 'Quy định mức lương tối thiểu tháng và giờ. Doanh nghiệp tuyệt đối không được trả lương thấp hơn mức tối thiểu vùng đối với người lao động làm công việc giản đơn. Chế độ lương đã thỏa thuận cao hơn (như +7% đào tạo nghề) tiếp tục thực hiện theo thỏa ước/HĐLĐ.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-74-2024-ND-CP-muc-luong-toi-thieu-doi-voi-nguoi-lao-dong-lam-viec-theo-hop-dong-lao-dong-614949.aspx'
  },
  {
    title: 'Nghị định 145/2020/NĐ-CP hướng dẫn thi hành một số điều của Bộ luật Lao động về điều kiện lao động và quan hệ lao động',
    code: 'Nghị định số 145/2020/NĐ-CP',
    effectiveDate: '01/02/2021',
    status: 'ACTIVE',
    scope: 'Thời giờ làm việc, thời giờ nghỉ ngơi, làm thêm giờ (OT), lao động nữ, kỷ luật lao động và sa thải',
    summary: 'Quy định chi tiết cách tính tiền lương làm thêm giờ (OT ngày thường 150%, ngày nghỉ hàng tuần 200%, lễ tết 300% + làm đêm 390%), trình tự thủ tục xử lý kỷ luật sa thải có Công đoàn tham dự và thỏa ước lao động tập thể.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-145-2020-ND-CP-huong-dan-Bo-luat-Lao-dong-ve-dieu-kien-lao-dong-quan-he-lao-dong-460984.aspx'
  },
  {
    title: 'Thông tư 24/2022/TT-BLĐTBXH hướng dẫn bồi dưỡng bằng hiện vật đối với người làm việc điều kiện nguy hiểm, độc hại',
    code: 'Thông tư số 24/2022/TT-BLĐTBXH',
    effectiveDate: '01/03/2023',
    status: 'ACTIVE',
    scope: 'Cấp phát hiện vật trực tiếp theo ca (sữa, đường, bánh, nước hoa quả), 4 định mức (13.000đ, 20.000đ, 26.000đ, 32.000đ)',
    summary: 'Bắt buộc cấp phát bằng HIỆN VẬT trực tiếp tại nơi làm việc trong ca làm việc. Tuyệt đối không quy đổi thành tiền mặt hay trả gộp vào tiền lương chuyển khoản qua tài khoản ngân hàng.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Thong-tu-24-2022-TT-BLDTBXH-boi-duong-bang-hien-vat-doi-voi-nguoi-lao-dong-dieu-kien-lao-dong-nguy-hiem-511746.aspx'
  },
  {
    title: 'Thông tư 111/2013/TT-BTC hướng dẫn thực hiện Luật Thuế Thu nhập cá nhân',
    code: 'Thông tư số 111/2013/TT-BTC',
    effectiveDate: '01/10/2013',
    status: 'ACTIVE',
    scope: 'Thuế suất lũy tiến từng phần 5% - 35%, các khoản phụ cấp miễn thuế, khấu trừ thuế vãng lai 10%',
    summary: 'Quy định các khoản phụ cấp được miễn thuế TNCN (tiền ăn giữa ca tối đa 1.2 triệu/tháng hoặc theo hóa đơn suất ăn, trang phục 5tr/năm, công tác phí, hiện vật độc hại), thủ tục ủy quyền quyết toán thuế và cấp chứng từ khấu trừ thuế điện tử.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Thong-tu-111-2013-TT-BTC-huong-dan-Luat-thue-thu-nhap-ca-nhan-va-Nghi-dinh-65-2013-ND-CP-205356.aspx'
  },
  {
    title: 'Nghị quyết 954/2020/UBTVQH14 về điều chỉnh mức giảm trừ gia cảnh của thuế thu nhập cá nhân',
    code: 'Nghị quyết số 954/2020/UBTVQH14',
    effectiveDate: '01/07/2020',
    status: 'ACTIVE',
    scope: 'Mức giảm trừ đối với đối tượng nộp thuế là 11 triệu đồng/tháng; mức giảm trừ đối với mỗi người phụ thuộc là 4,4 triệu đồng/tháng',
    summary: 'Mức giảm trừ gia cảnh chính thức áp dụng trong tính thuế TNCN hàng tháng và quyết toán thuế năm của người nộp thuế có thu nhập từ tiền lương, tiền công.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Nghi-quyet-954-2020-UBTVQH14-dieu-chinh-muc-giam-tru-gia-canh-thue-thu-nhap-ca-nhan-444007.aspx'
  },
  {
    title: 'Luật Bảo hiểm xã hội 2014',
    code: 'Luật số 58/2014/QH13',
    effectiveDate: '01/01/2016',
    status: 'ACTIVE',
    scope: 'Tỷ lệ đóng BHXH 8%, BHYT 1.5%, BHTN 1% (NLĐ) và 17.5%, 3%, 1% (Doanh nghiệp); chế độ thai sản, ốm đau, tai nạn',
    summary: 'Quy định tiền lương làm căn cứ đóng BHXH bắt buộc gồm: mức lương, phụ cấp lương và các khoản bổ sung khác xác định được mức tiền cụ thể cùng với mức lương thỏa thuận trong HĐLĐ, trả thường xuyên trong mỗi kỳ trả lương.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2014-259701.aspx'
  },
  {
    title: 'Thông tư 10/2020/TT-BLĐTBXH quy định chi tiết Bộ luật Lao động về nội dung HĐLĐ, thỏa ước lao động, kỷ luật',
    code: 'Thông tư số 10/2020/TT-BLĐTBXH',
    effectiveDate: '01/01/2021',
    status: 'ACTIVE',
    scope: 'Quy định chi tiết các nội dung chủ yếu của HĐLĐ, thang bảng lương, nội quy lao động và trình tự xử lý bồi thường thiệt hại',
    summary: 'Hướng dẫn ghi chi tiết mức lương, phụ cấp lương và các khoản bổ sung khác trong Hợp đồng lao động; quy trình đăng ký nội quy lao động tại cơ quan quản lý nhà nước về lao động.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Thong-tu-10-2020-TT-BLDTBXH-huong-dan-Bo-luat-Lao-dong-ve-noi-dung-hop-dong-lao-dong-460983.aspx'
  },
  {
    title: 'Luật An toàn, vệ sinh lao động 2015',
    code: 'Luật số 84/2015/QH13',
    effectiveDate: '01/07/2016',
    status: 'ACTIVE',
    scope: 'Khám sức khỏe định kỳ, bồi dưỡng độc hại, trang bị bảo hộ lao động cá nhân, tai nạn lao động',
    summary: 'Khám sức khỏe định kỳ ít nhất 1 lần/năm; đối với người làm nghề nặng nhọc, độc hại, nguy hiểm hoặc người lao động chưa thành niên, người cao tuổi phải được khám sức khỏe ít nhất 6 tháng/lần.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Luat-an-toan-ve-sinh-lao-dong-2015-282431.aspx'
  },
  {
    title: 'Thông tư 200/2014/TT-BTC hướng dẫn Chế độ kế toán doanh nghiệp',
    code: 'Thông tư số 200/2014/TT-BTC',
    effectiveDate: '01/01/2015',
    status: 'ACTIVE',
    scope: 'Hạch toán chi phí tiền lương (TK 334), các khoản trích theo lương (TK 338), trích trước lương phép (TK 335)',
    summary: 'Chuẩn mực tài khoản kế toán doanh nghiệp: hạch toán chi phí nhân công trực tiếp (TK 622), sản xuất chung (TK 6271), bán hàng (TK 6411), quản lý doanh nghiệp (TK 6421).',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Doanh-nghiep/Thong-tu-200-2014-TT-BTC-huong-dan-Che-do-ke-toan-Doanh-nghiep-262426.aspx'
  },
  {
    title: 'Nghị định 12/2022/NĐ-CP quy định xử phạt vi phạm hành chính trong lĩnh vực lao động, bảo hiểm xã hội',
    code: 'Nghị định số 12/2022/NĐ-CP',
    effectiveDate: '17/01/2022',
    status: 'ACTIVE',
    scope: 'Mức phạt tiền đối với hành vi vi phạm về HĐLĐ, tiền lương, làm thêm giờ, bồi dưỡng độc hại, BHXH',
    summary: 'Phạt tiền từ 20.000.000đ đến 75.000.000đ đối với NSDLĐ có hành vi trả lương thấp hơn mức tối thiểu vùng; phạt đến 150.000.000đ đối với vi phạm thời giờ làm việc làm thêm giờ OT quá quy định.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-12-2022-ND-CP-xu-phat-vi-pham-hanh-chinh-linh-vuc-lao-dong-bao-hiem-xa-hoi-499318.aspx'
  },

  // 2. VĂN BẢN SẮP CÓ HIỆU LỰC & DỰ THẢO QUAN TRỌNG
  {
    title: 'Luật Bảo hiểm xã hội 2024 (Sắp có hiệu lực từ 01/07/2025)',
    code: 'Luật số 41/2024/QH15',
    effectiveDate: '01/07/2025',
    status: 'UPCOMING',
    scope: 'Giảm số năm đóng BHXH tối thiểu hưởng lương hưu xuống 15 năm; bổ sung trợ cấp hưu trí xã hội; xử lý chậm/trốn đóng BHXH',
    summary: 'Thay thế Luật BHXH 2014. Bổ sung chế độ thai sản cho người tham gia BHXH tự nguyện; quy định rõ hành vi chậm đóng và trốn đóng BHXH bắt buộc kèm biện pháp ngừng sử dụng hóa đơn, hoãn xuất cảnh.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-526431.aspx'
  },
  {
    title: 'Nghị định 293/2025/NĐ-CP quy định mức lương tối thiểu vùng mới (Áp dụng năm 2026)',
    code: 'Nghị định số 293/2025/NĐ-CP',
    effectiveDate: '01/01/2026',
    status: 'UPCOMING',
    scope: 'Mức lương tối thiểu Vùng I: 5.310.000 đ/tháng; Vùng II: 4.730.000 đ/tháng; Vùng III: 4.140.000 đ/tháng; Vùng IV: 3.700.000 đ/tháng',
    summary: 'Tăng bình quân 6% so với mức cũ. Thiết lập sàn lương mới bắt buộc ghi nhận trên toàn bộ HĐLĐ và hệ thống bảng thanh toán tiền lương của doanh nghiệp.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-293-2025-ND-CP-muc-luong-toi-thieu-vung.aspx'
  },
  {
    title: 'Dự thảo Luật Thuế Thu nhập cá nhân sửa đổi (Dự kiến trình Quốc hội 2025-2026)',
    code: 'Dự thảo Luật Thuế TNCN sửa đổi',
    effectiveDate: 'Dự kiến 2026',
    status: 'UPCOMING',
    scope: 'Nâng mức giảm trừ gia cảnh bản thân (lên 14 - 15 triệu/tháng) và người phụ thuộc (lên 5.5 - 6 triệu/tháng); rút gọn biểu thuế lũy tiến',
    summary: 'Điều chỉnh biểu thuế lũy tiến từng phần từ 7 bậc xuống 5 bậc, nới rộng khoảng cách giữa các bậc thu nhập để khoan thư sức dân và phù hợp biến động chỉ số giá CPI thực tế.',
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Du-thao-Luat-Thue-thu-nhap-ca-nhan-sua-doi.aspx'
  }
];

interface LegalFloatingWidgetProps {
  className?: string;
}

export const LegalFloatingWidget: React.FC<LegalFloatingWidgetProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'UPCOMING'>('ALL');

  const filteredDocs = LEGAL_DOCUMENTS.filter(doc => {
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.code.toLowerCase().includes(q) ||
        doc.scope.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      {/* Nút Kích Hoạt Trên Thanh Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className={`h-11 w-full flex flex-col items-center justify-center px-2 sm:px-3 py-0.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer shadow-xs text-center group ${className}`}
        title="Bấm để mở tra cứu Căn Cứ Pháp Lý & AI Rà Soát ở chính giữa màn hình"
      >
        <div className="flex items-center justify-center space-x-1 text-[10px] text-indigo-500 font-bold uppercase tracking-wider leading-none mb-1">
          <Scale className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
          <span>TRA CỨU LUẬT</span>
        </div>
        <div className="flex items-center justify-center space-x-1 font-bold text-slate-900 text-xs leading-none">
          <span>Căn Cứ Pháp Lý</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </button>

      {/* Modal To Đặt CHÍNH GIỮA MÀN HÌNH (Centered Modal) Không Bị Treo Lên Trên */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[88vh] h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 m-auto">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30 shrink-0">
                  <Scale className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Căn Cứ Pháp Lý &amp; AI Rà Soát Văn Bản ({LEGAL_DOCUMENTS.length} Văn Bản Trọng Yếu)</h2>
                  <p className="text-xs text-indigo-200">
                    Đối chiếu Bộ luật Lao động 2019, Nghị định lương tối thiểu NĐ 293/2025, Thông tư BHXH, Thuế TNCN
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

            {/* Thanh Tìm Kiếm & Bộ Lọc Nhanh */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên luật, số hiệu, nội dung..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs w-full sm:w-auto justify-end">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tất Cả ({LEGAL_DOCUMENTS.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ✓ Đang Áp Dụng ({LEGAL_DOCUMENTS.filter(d => d.status === 'ACTIVE').length})
                </button>
                <button
                  onClick={() => setStatusFilter('UPCOMING')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    statusFilter === 'UPCOMING'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Sắp Hiệu Lực ({LEGAL_DOCUMENTS.filter(d => d.status === 'UPCOMING').length})
                </button>
              </div>
            </div>

            {/* Danh sách 14 văn bản cuộn độc lập */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                      doc.status === 'UPCOMING'
                        ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mb-1 ${
                            doc.status === 'UPCOMING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {doc.status === 'UPCOMING' ? '⚡ Sắp có hiệu lực / Dự thảo' : '✓ Đang áp dụng thực thi'}
                          </span>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(doc.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-xs text-slate-900 leading-snug hover:text-indigo-600 hover:underline cursor-pointer block"
                            title={`Bấm để tìm kiếm "${doc.title}" trên Google`}
                          >
                            {doc.title}
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] mb-3">
                        <div className="flex items-center space-x-1 text-slate-500 font-mono text-[10px]">
                          <span className="font-semibold text-slate-700">{doc.code}</span>
                          <span>•</span>
                          <span>HL: {doc.effectiveDate}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-3 leading-relaxed mt-1">
                          {doc.summary}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        Phạm vi: {doc.scope}
                      </span>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(doc.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors inline-flex items-center space-x-1 shrink-0 cursor-pointer"
                        title={`Tìm kiếm văn bản "${doc.title}" trên Google`}
                      >
                        <span>Tìm văn bản</span>
                        <Search className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDocs.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy văn bản pháp luật nào phù hợp với từ khóa "{searchQuery}".
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>Bản quyền dữ liệu pháp quy đối chiếu: Thư Viện Pháp Luật &amp; Cổng TTĐT Chính Phủ – AI có thể mắc sai sót</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
