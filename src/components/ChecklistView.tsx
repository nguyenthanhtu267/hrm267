import React, { useState, useMemo } from 'react';
import { checklistCatalog, ChecklistItem } from '../services/checklistCatalog';
import { evaluateColumnCondition, CompactPagination } from './SmartTableFilter';
import { ExportDropdown } from './ExportDropdown';
import { printTableToPdf } from '../utils/exportUtils';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Milk,
  Check,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ChecklistView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [filterBhxh, setFilterBhxh] = useState<boolean | null>(null);
  const [filterTncn, setFilterTncn] = useState<boolean | null>(null);
  const [filterInKind, setFilterInKind] = useState<boolean | null>(null);

  // Phân trang & Tìm kiếm cột
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [colFilters, setColFilters] = useState({
    code: '',
    name: '',
    bhxh: '',
    tncn: '',
    inKind: '',
    legal: '',
    notes: ''
  });

  const filteredItems = useMemo(() => {
    return checklistCatalog.filter(item => {
      const matchSearch = 
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.legalBasis.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchBhxh = filterBhxh === null || item.subjectToBhxh === filterBhxh;
      const matchTncn = filterTncn === null || item.subjectToTncn === filterTncn;
      const matchInKind = filterInKind === null || item.inKindOnly === filterInKind;

      if (!matchSearch || !matchCat || !matchBhxh || !matchTncn || !matchInKind) return false;

      // Lọc chi tiết từng cột với toán tử toán học & văn bản
      if (!evaluateColumnCondition(item.code, colFilters.code)) return false;
      if (!evaluateColumnCondition(item.name, colFilters.name)) return false;
      if (colFilters.bhxh && !evaluateColumnCondition(item.subjectToBhxh ? 'Đóng BHXH Bắt buộc' : 'Không đóng', colFilters.bhxh)) return false;
      if (colFilters.tncn && !evaluateColumnCondition(item.subjectToTncn ? 'Chịu thuế TNCN' : 'Miễn thuế', colFilters.tncn)) return false;
      if (colFilters.inKind && !evaluateColumnCondition(item.inKindOnly ? 'Hiện vật' : 'Tiền mặt', colFilters.inKind)) return false;
      if (!evaluateColumnCondition(item.legalBasis, colFilters.legal)) return false;
      if (!evaluateColumnCondition(item.notes, colFilters.notes)) return false;

      return true;
    });
  }, [searchTerm, categoryFilter, filterBhxh, filterTncn, filterInKind, colFilters]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleExportExcel = () => {
    const data = filteredItems.map((item) => ({
      'Mã Khoản': item.code,
      'Tên Khoản Chi Trả': item.name,
      'Nhóm': item.category,
      'Tính Đóng BHXH': item.subjectToBhxh ? 'Có' : 'Không',
      'Chịu Thuế TNCN': item.subjectToTncn ? 'Có' : 'Không (Miễn)',
      'Chi Phí Hợp Lý TNDN': item.deductibleTndn ? 'Có' : 'Không',
      'Hiện Vật Bắt Buộc': item.inKindOnly ? 'Bắt buộc hiện vật' : 'Tiền mặt',
      'Hạn Mức Miễn Thuế': item.maxTaxFreeLimit || 'Theo thực tế',
      'Căn Cứ Pháp Lý': item.legalBasis,
      'Ghi Chú Nghiệp Vụ': item.notes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Checklist 63 Khoan');
    XLSX.writeFile(workbook, 'Bang_Checklist_63_Khoan_Tien_Luong_Phu_Cap_HRM_Viet.xlsx');
  };

  const handleExportPdf = () => {
    const headers = ['Mã Khoản', 'Tên Khoản Chi Trả', 'Nhóm', 'BHXH', 'Thuế TNCN', 'Chi Phí TNDN', 'Hình Thức Chi', 'Căn Cứ Pháp Lý'];
    const rows = filteredItems.map(item => [
      item.code,
      item.name,
      item.category,
      item.subjectToBhxh ? 'Đóng BHXH' : 'Không',
      item.subjectToTncn ? 'Chịu Thuế' : 'Miễn Thuế',
      item.deductibleTndn ? 'Chi Phí Hợp Lý' : 'Không',
      item.inKindOnly ? 'Hiện Vật' : 'Tiền Mặt',
      item.legalBasis
    ]);
    printTableToPdf('DANH MỤC 63 KHOẢN TIỀN LƯƠNG & PHỤ CẤP (BHXH & THUẾ TNCN)', `Tổng số: ${filteredItems.length} khoản chi`, headers, rows);
  };

  return (
    <div className="space-y-1.5">
      {/* Tiêu đề & Xuất Excel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Khoản Đóng BHXH & Thuế</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bản đối chiếu pháp lý: Đóng BHXH, Thuế TNCN, Chi phí TNDN & Bồi dưỡng hiện vật (TT 24/2022) • Cắt trang thu gọn
          </p>
        </div>

        <ExportDropdown
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          label="Xuất Bảng Tra Cứu"
        />
      </div>

      {/* LƯU Ý PHÁP LÝ BẤT DI BẤT DỊCH (Gọn ghẽ) */}
      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs space-y-1">
        <div className="flex items-center space-x-2 font-bold text-amber-900 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>3 NGUYÊN TẮC PHÁP LÝ BẮT BUỘC:</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          <b>1. Bồi dưỡng độc hại (CK08):</b> Phải cấp phát bằng <b>hiện vật trực tiếp</b> tại ca làm việc theo TT 24/2022/TT-BLĐTBXH (không gộp vào tiền mặt). 
          • <b>2. Quà lễ Tết hiện vật (CK12):</b> Chịu thuế TNCN, nhưng phải <b>trừ khỏi chuyển khoản thực lĩnh</b>.
          • <b>3. Hợp đồng dịch vụ dân sự (CK18):</b> Quản lý thù lao CTV độc lập theo BLDS, không được dùng để né tránh quan hệ lao động.
        </p>
      </div>

      {/* THANH TÌM KIẾM & LỌC NHANH */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã khoản (CK01...), tên khoản chi, căn cứ pháp lý..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs w-full md:w-auto overflow-x-auto">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs"
          >
            <option value="ALL">Tất cả nhóm</option>
            <option value="LUONG_CHINH">Lương chính & OT</option>
            <option value="PHU_CAP">Phụ cấp lương</option>
            <option value="TRO_CAP">Trợ cấp & Hỗ trợ</option>
            <option value="THUONG">Tiền thưởng</option>
            <option value="HIEN_VAT">Hiện vật (Sữa, quà Tết)</option>
            <option value="PHUC_LOI">Phúc lợi công đoàn</option>
          </select>

          <button
            onClick={() => { setFilterBhxh(filterBhxh === true ? null : true); setCurrentPage(1); }}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-colors text-xs whitespace-nowrap ${
              filterBhxh === true 
                ? 'bg-blue-50 border-blue-400 text-blue-700' 
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Đóng BHXH
          </button>

          <button
            onClick={() => { setFilterTncn(filterTncn === true ? null : true); setCurrentPage(1); }}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-colors text-xs whitespace-nowrap ${
              filterTncn === true 
                ? 'bg-purple-50 border-purple-400 text-purple-700' 
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Đóng Thuế
          </button>

          <button
            onClick={() => { setFilterInKind(filterInKind === true ? null : true); setCurrentPage(1); }}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-colors flex items-center space-x-1 text-xs whitespace-nowrap ${
              filterInKind === true 
                ? 'bg-amber-50 border-amber-400 text-amber-800' 
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Milk className="w-3 h-3" />
            <span>Hiện vật</span>
          </button>

          {(colFilters.code || colFilters.name || colFilters.bhxh || colFilters.tncn || colFilters.legal || colFilters.notes) && (
            <button
              onClick={() => {
                setColFilters({ code: '', name: '', bhxh: '', tncn: '', inKind: '', legal: '', notes: '' });
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold whitespace-nowrap"
              title="Xóa tất cả lọc cột"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* BẢNG DANH MỤC 63 KHOẢN VỚI HÀNG TÌM KIẾM CỘT TOÁN HỌC */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-2 w-24">Mã Khoản</th>
                <th className="px-3 py-2 min-w-[180px]">Tên Khoản Chi Trả</th>
                <th className="px-3 py-2 w-28">Đóng BHXH</th>
                <th className="px-3 py-2 w-28">Thuế TNCN</th>
                <th className="px-3 py-2 w-28">Hình Thức</th>
                <th className="px-3 py-2 min-w-[160px]">Căn Cứ Pháp Lý</th>
                <th className="px-3 py-2 min-w-[220px]">Lưu Ý Nghiệp Vụ</th>
              </tr>
              {/* HÀNG TÌM KIẾM DƯỚI TIÊU ĐỀ HỖ TRỢ >=, <=, >, <, = HOẶC TEXT */}
              <tr className="bg-slate-100/80 border-b border-slate-200">
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Mã..."
                    value={colFilters.code}
                    onChange={(e) => { setColFilters({ ...colFilters, code: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Tên khoản..."
                    value={colFilters.name}
                    onChange={(e) => { setColFilters({ ...colFilters, name: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Đóng / Không..."
                    value={colFilters.bhxh}
                    onChange={(e) => { setColFilters({ ...colFilters, bhxh: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Chịu / Miễn..."
                    value={colFilters.tncn}
                    onChange={(e) => { setColFilters({ ...colFilters, tncn: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Hiện vật/Tiền..."
                    value={colFilters.inKind}
                    onChange={(e) => { setColFilters({ ...colFilters, inKind: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Thông tư / Luật..."
                    value={colFilters.legal}
                    onChange={(e) => { setColFilters({ ...colFilters, legal: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Ghi chú nghiệp vụ..."
                    value={colFilters.notes}
                    onChange={(e) => { setColFilters({ ...colFilters, notes: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 font-mono font-bold text-indigo-700">{item.code}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-3 py-2">
                    {item.subjectToBhxh ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Bắt buộc
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Không</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {item.subjectToTncn ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        Chịu thuế
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Miễn thuế
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {item.inKindOnly ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center space-x-1 w-fit">
                        <Milk className="w-3 h-3" />
                        <span>Hiện vật</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">Tiền mặt</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-500 font-mono text-[11px] max-w-xs">{item.legalBasis}</td>
                  <td className="px-3 py-2 text-slate-600 max-w-xs leading-relaxed text-[11px]">{item.notes}</td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Không tìm thấy khoản nào phù hợp với bộ lọc điều kiện.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang thu gọn */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <CompactPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalRecords={filteredItems.length}
            pageSize={pageSize}
          />
          <div className="text-[11px] text-slate-500">
            Hiển thị tối đa <span className="font-bold text-slate-800">{pageSize}</span> dòng/trang (không phải cuộn dài)
          </div>
        </div>
      </div>
    </div>
  );
};
