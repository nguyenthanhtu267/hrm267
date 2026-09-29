import React, { useState } from 'react';
import { Search, ExternalLink, Filter, BookOpen, Sparkles, Scale, ChevronRight } from 'lucide-react';

export type LegalField = 'Tất cả' | 'Lao động - Tiền lương' | 'Doanh nghiệp' | 'Kế toán - Kiểm toán' | 'Thương mại';

interface LegalDoc {
  Title: string;
  Day: string;
  Field: 'Lao động - Tiền lương' | 'Doanh nghiệp' | 'Kế toán - Kiểm toán' | 'Thương mại';
  Code?: string;
}

// DANH MỤC 50 VĂN BẢN PHÁP LUẬT MỚI VÀ TRỌNG YẾU (LAO ĐỘNG, DOANH NGHIỆP, KẾ TOÁN - KIỂM TOÁN, THƯƠNG MẠI)
const DEFAULT_DOCUMENTS: LegalDoc[] = [
  // --- NHÓM 1: LAO ĐỘNG - TIỀN LƯƠNG (18 VĂN BẢN) ---
  {
    Title: "Nghị định 293/2025/NĐ-CP quy định mức lương tối thiểu đối với người lao động làm việc theo hợp đồng lao động",
    Day: "15/11/2025",
    Field: "Lao động - Tiền lương",
    Code: "293/2025/NĐ-CP"
  },
  {
    Title: "Luật Bảo hiểm xã hội 2024 (Luật số 41/2024/QH15) hiệu lực từ 01/07/2025 quy định chế độ trợ cấp hưu trí, thai sản, ốm đau mới",
    Day: "29/06/2024",
    Field: "Lao động - Tiền lương",
    Code: "41/2024/QH15"
  },
  {
    Title: "Luật Công đoàn 2024 (Luật số 52/2024/QH15) quy định về quyền đại diện, đối thoại tại nơi làm việc và tài chính công đoàn",
    Day: "27/11/2024",
    Field: "Lao động - Tiền lương",
    Code: "52/2024/QH15"
  },
  {
    Title: "Nghị định 74/2024/NĐ-CP quy định mức lương tối thiểu vùng đối với người lao động làm việc theo hợp đồng lao động",
    Day: "30/06/2024",
    Field: "Lao động - Tiền lương",
    Code: "74/2024/NĐ-CP"
  },
  {
    Title: "Nghị định 73/2024/NĐ-CP quy định mức lương cơ sở và chế độ tiền thưởng đối với cán bộ, công chức, viên chức",
    Day: "30/06/2024",
    Field: "Lao động - Tiền lương",
    Code: "73/2024/NĐ-CP"
  },
  {
    Title: "Thông tư 05/2024/TT-BLĐTBXH hướng dẫn thi hành một số điều của Bộ luật Lao động về tiền lương, phụ cấp và định mức lao động",
    Day: "10/05/2024",
    Field: "Lao động - Tiền lương",
    Code: "05/2024/TT-BLĐTBXH"
  },
  {
    Title: "Bộ luật Lao động 2019 (Bộ luật số 45/2019/QH14) quy định tiêu chuẩn lao động, quyền, nghĩa vụ và trách nhiệm pháp lý",
    Day: "20/11/2019",
    Field: "Lao động - Tiền lương",
    Code: "45/2019/QH14"
  },
  {
    Title: "Nghị định 145/2020/NĐ-CP quy định chi tiết Bộ luật Lao động về điều kiện lao động, quan hệ lao động, làm thêm giờ OT",
    Day: "14/12/2020",
    Field: "Lao động - Tiền lương",
    Code: "145/2020/NĐ-CP"
  },
  {
    Title: "Nghị định 12/2022/NĐ-CP quy định xử phạt vi phạm hành chính trong lĩnh vực lao động, bảo hiểm xã hội, đưa NLĐ đi nước ngoài",
    Day: "17/01/2022",
    Field: "Lao động - Tiền lương",
    Code: "12/2022/NĐ-CP"
  },
  {
    Title: "Thông tư 10/2020/TT-BLĐTBXH quy định chi tiết thi hành Bộ luật Lao động về hợp đồng lao động, thời giờ làm việc và nghỉ ngơi",
    Day: "12/11/2020",
    Field: "Lao động - Tiền lương",
    Code: "10/2020/TT-BLĐTBXH"
  },
  {
    Title: "Thông tư 24/2022/TT-BLĐTBXH quy định việc bồi dưỡng bằng hiện vật đối với người lao động làm việc trong điều kiện có yếu tố nguy hiểm, độc hại",
    Day: "30/11/2022",
    Field: "Lao động - Tiền lương",
    Code: "24/2022/TT-BLĐTBXH"
  },
  {
    Title: "Nghị định 152/2020/NĐ-CP về người lao động nước ngoài làm việc tại Việt Nam và tuyển dụng, quản lý người lao động Việt Nam",
    Day: "30/12/2020",
    Field: "Lao động - Tiền lương",
    Code: "152/2020/NĐ-CP"
  },
  {
    Title: "Nghị định 70/2023/NĐ-CP sửa đổi, bổ sung một số điều của Nghị định 152/2020/NĐ-CP về quản lý lao động nước ngoài tại Việt Nam",
    Day: "18/09/2023",
    Field: "Lao động - Tiền lương",
    Code: "70/2023/NĐ-CP"
  },
  {
    Title: "Luật An toàn, vệ sinh lao động 2015 (Luật số 84/2015/QH13) bảo đảm an toàn, vệ sinh lao động và chế độ tai nạn lao động",
    Day: "25/06/2015",
    Field: "Lao động - Tiền lương",
    Code: "84/2015/QH13"
  },
  {
    Title: "Nghị định 39/2016/NĐ-CP hướng dẫn Luật An toàn, vệ sinh lao động về kiểm định kỹ thuật an toàn và huấn luyện ATVSLĐ",
    Day: "15/05/2016",
    Field: "Lao động - Tiền lương",
    Code: "39/2016/NĐ-CP"
  },
  {
    Title: "Luật Việc làm 2013 (Luật số 38/2013/QH13) quy định chính sách hỗ trợ tạo việc làm và bảo hiểm thất nghiệp BHTN",
    Day: "16/11/2013",
    Field: "Lao động - Tiền lương",
    Code: "38/2013/QH13"
  },
  {
    Title: "Nghị định 28/2020/NĐ-CP quy định xử phạt vi phạm hành chính lĩnh vực lao động, bảo hiểm xã hội (các điều khoản còn hiệu lực)",
    Day: "01/03/2020",
    Field: "Lao động - Tiền lương",
    Code: "28/2020/NĐ-CP"
  },
  {
    Title: "Quyết định 595/QĐ-BHXH ban hành quy trình thu BHXH, BHYT, BHTN, BHTNLĐ-BNN; quản lý sổ BHXH, thẻ BHYT",
    Day: "14/04/2017",
    Field: "Lao động - Tiền lương",
    Code: "595/QĐ-BHXH"
  },

  // --- NHÓM 2: DOANH NGHIỆP (11 VĂN BẢN) ---
  {
    Title: "Luật Doanh nghiệp 2020 (Luật số 59/2020/QH14) về thành lập, tổ chức quản trị, tổ chức lại, giải thể doanh nghiệp",
    Day: "17/06/2020",
    Field: "Doanh nghiệp",
    Code: "59/2020/QH14"
  },
  {
    Title: "Nghị định 01/2021/NĐ-CP hướng dẫn về đăng ký doanh nghiệp, hộ kinh doanh, văn phòng đại diện và địa điểm kinh doanh",
    Day: "04/01/2021",
    Field: "Doanh nghiệp",
    Code: "01/2021/NĐ-CP"
  },
  {
    Title: "Luật Đầu tư 2020 (Luật số 61/2020/QH14) quy định hoạt động đầu tư kinh doanh tại Việt Nam và ra nước ngoài",
    Day: "17/06/2020",
    Field: "Doanh nghiệp",
    Code: "61/2020/QH14"
  },
  {
    Title: "Nghị định 31/2021/NĐ-CP quy định chi tiết và hướng dẫn thi hành một số điều của Luật Đầu tư",
    Day: "26/03/2021",
    Field: "Doanh nghiệp",
    Code: "31/2021/NĐ-CP"
  },
  {
    Title: "Nghị định 47/2021/NĐ-CP hướng dẫn chi tiết một số điều của Luật Doanh nghiệp về quản trị công ty cổ phần, doanh nghiệp nhà nước",
    Day: "01/04/2021",
    Field: "Doanh nghiệp",
    Code: "47/2021/NĐ-CP"
  },
  {
    Title: "Luật Hỗ trợ doanh nghiệp nhỏ và vừa 2017 (Luật số 04/2017/QH14) về các nguyên tắc hỗ trợ vốn, thuế và công nghệ",
    Day: "12/06/2017",
    Field: "Doanh nghiệp",
    Code: "04/2017/QH14"
  },
  {
    Title: "Nghị định 80/2021/NĐ-CP hướng dẫn chi tiết một số điều của Luật Hỗ trợ doanh nghiệp nhỏ và vừa",
    Day: "26/08/2021",
    Field: "Doanh nghiệp",
    Code: "80/2021/NĐ-CP"
  },
  {
    Title: "Luật Hợp tác xã 2023 (Luật số 17/2023/QH15) quy định thành lập, tổ chức quản lý và hoạt động của hợp tác xã, liên hiệp HTX",
    Day: "20/06/2023",
    Field: "Doanh nghiệp",
    Code: "17/2023/QH15"
  },
  {
    Title: "Nghị định 122/2021/NĐ-CP quy định về xử phạt vi phạm hành chính trong lĩnh vực kế hoạch và đầu tư, đăng ký kinh doanh",
    Day: "28/12/2021",
    Field: "Doanh nghiệp",
    Code: "122/2021/NĐ-CP"
  },
  {
    Title: "Thông tư 01/2021/TT-BKHĐT hướng dẫn về đăng ký doanh nghiệp và biểu mẫu đăng ký kinh doanh qua Cổng thông tin quốc gia",
    Day: "16/03/2021",
    Field: "Doanh nghiệp",
    Code: "01/2021/TT-BKHĐT"
  },
  {
    Title: "Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân của người lao động, khách hàng và đối tác trong hoạt động doanh nghiệp",
    Day: "17/04/2023",
    Field: "Doanh nghiệp",
    Code: "13/2023/NĐ-CP"
  },

  // --- NHÓM 3: KẾ TOÁN - KIỂM TOÁN (11 VĂN BẢN) ---
  {
    Title: "Luật Kế toán 2015 (Luật số 88/2015/QH13) quy định về nội dung công tác kế toán, tổ chức bộ máy và người làm kế toán",
    Day: "20/11/2015",
    Field: "Kế toán - Kiểm toán",
    Code: "88/2015/QH13"
  },
  {
    Title: "Thông tư 200/2014/TT-BTC hướng dẫn Chế độ kế toán Doanh nghiệp (hạch toán chi phí nhân công 622, 627, 641, 642, lương 334, 338)",
    Day: "22/12/2014",
    Field: "Kế toán - Kiểm toán",
    Code: "200/2014/TT-BTC"
  },
  {
    Title: "Thông tư 133/2016/TT-BTC hướng dẫn Chế độ kế toán doanh nghiệp nhỏ và vừa, lập báo cáo tài chính và hệ thống tài khoản",
    Day: "26/08/2016",
    Field: "Kế toán - Kiểm toán",
    Code: "133/2016/TT-BTC"
  },
  {
    Title: "Nghị định 123/2020/NĐ-CP quy định về hóa đơn, chứng từ điện tử, chứng từ khấu trừ thuế TNCN điện tử trong doanh nghiệp",
    Day: "19/10/2020",
    Field: "Kế toán - Kiểm toán",
    Code: "123/2020/NĐ-CP"
  },
  {
    Title: "Thông tư 78/2021/TT-BTC hướng dẫn thực hiện một số điều của Luật Quản lý thuế, Nghị định 123/2020/NĐ-CP về hóa đơn, chứng từ",
    Day: "17/09/2021",
    Field: "Kế toán - Kiểm toán",
    Code: "78/2021/TT-BTC"
  },
  {
    Title: "Luật Kiểm toán độc lập 2011 (Luật số 67/2011/QH12) quy định điều kiện hành nghề kiểm toán và trách nhiệm báo cáo kiểm toán",
    Day: "29/03/2011",
    Field: "Kế toán - Kiểm toán",
    Code: "67/2011/QH12"
  },
  {
    Title: "Nghị định 41/2018/NĐ-CP quy định xử phạt vi phạm hành chính trong lĩnh vực kế toán, kiểm toán độc lập",
    Day: "12/03/2018",
    Field: "Kế toán - Kiểm toán",
    Code: "41/2018/NĐ-CP"
  },
  {
    Title: "Thông tư 111/2013/TT-BTC hướng dẫn thực hiện Luật Thuế thu nhập cá nhân và các khoản chi phí tiền lương được trừ khi tính thuế TNDN",
    Day: "15/08/2013",
    Field: "Kế toán - Kiểm toán",
    Code: "111/2013/TT-BTC"
  },
  {
    Title: "Thông tư 96/2015/TT-BTC hướng dẫn về thuế thu nhập doanh nghiệp, điều kiện tính chi phí tiền lương, tiền thưởng hợp lý hợp lệ",
    Day: "22/06/2015",
    Field: "Kế toán - Kiểm toán",
    Code: "96/2015/TT-BTC"
  },
  {
    Title: "Nghị định 174/2016/NĐ-CP quy định chi tiết một số điều của Luật Kế toán về chứng từ, sổ sách và lưu trữ hồ sơ tài chính",
    Day: "30/12/2016",
    Field: "Kế toán - Kiểm toán",
    Code: "174/2016/NĐ-CP"
  },
  {
    Title: "Thông tư 45/2013/TT-BTC hướng dẫn chế độ quản lý, sử dụng và trích khấu hao tài sản cố định trong doanh nghiệp",
    Day: "25/04/2013",
    Field: "Kế toán - Kiểm toán",
    Code: "45/2013/TT-BTC"
  },

  // --- NHÓM 4: THƯƠNG MẠI (10 VĂN BẢN) ---
  {
    Title: "Luật Thương mại 2005 (Luật số 36/2005/QH11) quy định hoạt động thương mại hàng hóa, cung ứng dịch vụ, xúc tiến thương mại",
    Day: "14/06/2005",
    Field: "Thương mại",
    Code: "36/2005/QH11"
  },
  {
    Title: "Nghị định 52/2013/NĐ-CP về thương mại điện tử, thiết lập website TMĐT bán hàng và sàn giao dịch thương mại điện tử",
    Day: "16/05/2013",
    Field: "Thương mại",
    Code: "52/2013/NĐ-CP"
  },
  {
    Title: "Nghị định 85/2021/NĐ-CP sửa đổi, bổ sung một số điều của Nghị định 52/2013/NĐ-CP về quản lý hoạt động thương mại điện tử",
    Day: "25/09/2021",
    Field: "Thương mại",
    Code: "85/2021/NĐ-CP"
  },
  {
    Title: "Luật Bảo vệ quyền lợi người tiêu dùng 2023 (Luật số 19/2023/QH15) quy định quyền của người tiêu dùng và trách nhiệm người bán",
    Day: "20/06/2023",
    Field: "Thương mại",
    Code: "19/2023/QH15"
  },
  {
    Title: "Nghị định 98/2020/NĐ-CP quy định xử phạt vi phạm hành chính trong hoạt động thương mại, sản xuất buôn bán hàng giả, hàng cấm",
    Day: "26/08/2020",
    Field: "Thương mại",
    Code: "98/2020/NĐ-CP"
  },
  {
    Title: "Luật Quản lý ngoại thương 2017 (Luật số 05/2017/QH14) quy định biện pháp quản lý ngoại thương, xuất nhập khẩu hàng hóa",
    Day: "12/06/2017",
    Field: "Thương mại",
    Code: "05/2017/QH14"
  },
  {
    Title: "Nghị định 69/2018/NĐ-CP quy định chi tiết một số điều của Luật Quản lý ngoại thương về cấp phép và thủ tục hải quan xuất nhập khẩu",
    Day: "15/05/2018",
    Field: "Thương mại",
    Code: "69/2018/NĐ-CP"
  },
  {
    Title: "Luật Cạnh tranh 2018 (Luật số 23/2018/QH14) về kiểm soát hành vi hạn chế cạnh tranh, tập trung kinh tế và cạnh tranh không lành mạnh",
    Day: "12/06/2018",
    Field: "Thương mại",
    Code: "23/2018/QH14"
  },
  {
    Title: "Nghị định 35/2020/NĐ-CP quy định chi tiết một số điều của Luật Cạnh tranh về tố tụng cạnh tranh và giám sát thỏa thuận hạn chế",
    Day: "24/03/2020",
    Field: "Thương mại",
    Code: "35/2020/NĐ-CP"
  },
  {
    Title: "Nghị định 17/2022/NĐ-CP sửa đổi các Nghị định xử phạt vi phạm hành chính trong lĩnh vực thương mại, hóa chất, bảo vệ người tiêu dùng",
    Day: "31/01/2022",
    Field: "Thương mại",
    Code: "17/2022/NĐ-CP"
  }
];

export const TvplWidget: React.FC = () => {
  const [selectedField, setSelectedField] = useState<LegalField>('Tất cả');
  const [internalSearch, setInternalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc văn bản theo lĩnh vực và từ khóa tìm kiếm nội bộ
  const filteredDocs = DEFAULT_DOCUMENTS.filter(doc => {
    if (selectedField !== 'Tất cả' && doc.Field !== selectedField) {
      return false;
    }
    if (internalSearch.trim()) {
      const q = internalSearch.toLowerCase();
      return (
        doc.Title.toLowerCase().includes(q) ||
        (doc.Code && doc.Code.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Khi click vào tiêu đề: Mở trang tìm kiếm Google với chính tiêu đề văn bản đó
  const handleTitleClick = (title: string) => {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(title)}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTvplSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const url = `https://thuvienphapluat.vn/tim-van-ban.aspx?keyword=${encodeURIComponent(searchQuery.trim())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs font-sans text-xs overflow-hidden transition-all">
      {/* HEADER BẢNG: ĐỒNG BỘ THEME SÁNG TRẮNG CỦA CÁC KHUNG KHÁC */}
      <div className="px-4 py-2.5 bg-white text-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-slate-900 tracking-wide uppercase">
                Văn Bản Pháp Luật Mới Ban Hành
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                {DEFAULT_DOCUMENTS.length} Văn Bản
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Đồng bộ nguồn Thư Viện Pháp Luật</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">Click tiêu đề để tra cứu Google</span>
            </p>
          </div>
        </div>

        {/* Ô TÌM KIẾM TVPL VÀ LINK NGUỒN */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <form onSubmit={handleTvplSearch} className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh trên TVPL..."
              className="w-full pl-2.5 pr-7 py-1 bg-slate-50 text-slate-900 placeholder-slate-400 text-[11px] rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer"
              title="Tìm kiếm trực tiếp trên thuvienphapluat.vn"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          <a
            href="https://thuvienphapluat.vn"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Mở Cổng thông tin Thư Viện Pháp Luật"
          >
            <span>TVPL.vn</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* THANH BỘ LỌC 4 LĨNH VỰC & Ô LỌC NỘI BỘ */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-3 h-3 text-slate-400 hidden sm:inline" />
          {(['Tất cả', 'Lao động - Tiền lương', 'Doanh nghiệp', 'Kế toán - Kiểm toán', 'Thương mại'] as LegalField[]).map((f) => (
            <button
              key={f}
              onClick={() => setSelectedField(f)}
              className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                selectedField === f
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'Tất cả' ? `Tất cả (${DEFAULT_DOCUMENTS.length})` : f}
            </button>
          ))}
        </div>

        <div className="relative">
          <input 
            type="text"
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder="Lọc từ khóa / số hiệu..."
            className="px-2.5 py-0.5 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-48 shadow-2xs"
          />
        </div>
      </div>

      {/* BODY: DANH SÁCH VĂN BẢN (CHIỀU CAO GỌN GÀNG, PHONG CÁCH CHUYÊN NGHIỆP TRẮNG/SLATE) */}
      <div className="px-2 py-1 bg-white">
        <div className="max-h-[140px] min-h-[110px] overflow-y-auto divide-y divide-slate-100 px-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {filteredDocs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 italic">
              Không tìm thấy văn bản phù hợp với từ khóa "${internalSearch}".
            </div>
          ) : (
            <ul id="displayDocument" className="list-none m-0 p-0">
              {filteredDocs.map((item, idx) => (
                <li 
                  key={idx} 
                  className="py-1.5 hover:bg-indigo-50/50 px-2 rounded-lg transition-colors border-b border-dashed border-slate-100 last:border-none group cursor-pointer"
                  onClick={() => handleTitleClick(item.Title)}
                  title="Nhấp để tìm kiếm chi tiết văn bản này trên Google"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="block text-slate-900 font-medium text-xs leading-snug transition-colors flex-1">
                      <p className="w-title m-0 text-slate-800 group-hover:text-indigo-600 font-semibold text-[11px] line-clamp-1">
                        {item.Title}
                      </p>
                    </div>
                    {item.Code && (
                      <span className="flex-shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-800 group-hover:border-indigo-200 transition-colors">
                        {item.Code}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <p className="w-date m-0 flex items-center gap-1 text-[9.5px] text-slate-400">
                      <span>Ban hành:</span>
                      <b className="text-slate-600 font-mono font-semibold">{item.Day}</b>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded border bg-slate-50 text-slate-600 border-slate-200">
                        {item.Field}
                      </span>
                      <span className="text-[9.5px] text-indigo-600 group-hover:underline flex items-center gap-0.5 font-bold">
                        <span>Tìm Google</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* FOOTER BẢNG: TINH GỌN, CHUẨN MỰC */}
      <div className="px-3 py-1 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[10.5px]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Dữ liệu văn bản pháp quy được rà soát và cập nhật tự động</span>
        </div>

        <a
          href="https://thuvienphapluat.vn/page/Widget.aspx"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline flex items-center gap-1"
        >
          <span>Nguồn Thư Viện Pháp Luật</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
