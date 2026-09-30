import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  FileSpreadsheet, 
  Video, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Download, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  User, 
  Building, 
  Copy, 
  Check, 
  BookOpen
} from 'lucide-react';

export type ViewerFileType = 'PDF' | 'EXCEL' | 'WORD' | 'VIDEO' | 'INTERNAL_DOC';

export interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileType: ViewerFileType;
  fileUrl?: string;
  subTitle?: string;
  metadata?: {
    dotBaoCao?: string;
    ngayGui?: string;
    soCongVan?: string;
    canBoGui?: string;
    coQuanTiepNhan?: string;
    nguoiNhanLienHe?: string;
    ghiChu?: string;
  };
  customContent?: string;
  canDownloadPrint?: boolean;
  currentRole?: string;
  isExpired?: boolean;
  expiredReason?: string;
  supersededBy?: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  fileType,
  fileUrl = '',
  subTitle = '',
  metadata,
  customContent,
  canDownloadPrint = true,
  currentRole,
  isExpired = false,
  expiredReason,
  supersededBy
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'VIEW' | 'METADATA' | 'LINKS'>('VIEW');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (fileUrl) {
      navigator.clipboard.writeText(fileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getIcon = () => {
    switch (fileType) {
      case 'EXCEL':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'WORD':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'VIDEO':
        return <Video className="w-5 h-5 text-rose-600" />;
      case 'INTERNAL_DOC':
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      default:
        return <FileText className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-2 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div 
        className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
          isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* Header Thanh Tiêu Đề Modal */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">{title}</h3>
              <p className="text-[11px] text-slate-400 truncate">
                {subTitle || (fileType === 'INTERNAL_DOC' ? 'Văn bản quy định nội bộ công ty' : 'Tài liệu / Báo cáo tuân thủ điện tử')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {fileUrl && (
              <button
                onClick={handleCopyLink}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="Sao chép đường link liên kết"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Đã chép' : 'Sao chép link'}</span>
              </button>
            )}

            {/* Nút Tải xuống & In chỉ hiển thị cho User có quyền tải/in (Quản trị & Tiền lương) */}
            {canDownloadPrint && (
              <>
                <button
                  onClick={() => {
                    if (fileUrl) {
                      window.open(fileUrl, '_blank');
                    } else {
                      alert('Đang tải file đính kèm xuống thiết bị...');
                    }
                  }}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Tải file xuống máy (Chỉ Quản trị & Cán bộ Tiền lương)"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="In văn bản (Chỉ dành cho Quản trị & Cán bộ Tiền lương)"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFullScreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer ml-1"
              title="Đóng cửa sổ xem tài liệu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cảnh báo văn bản hết hiệu lực hoàn toàn */}
        {isExpired && (
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white px-4 sm:px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner shrink-0 border-b border-rose-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white text-rose-700 font-black text-[10px] tracking-wider uppercase shadow-xs">
                ⚠️ HẾT HIỆU LỰC HOÀN TOÀN
              </span>
              <span className="font-semibold text-rose-50">
                Văn bản này không còn giá trị thi hành. 
                {supersededBy && <span> Đã được thay thế bởi: <u>{supersededBy}</u>.</span>}
                {expiredReason && <span className="opacity-90"> ({expiredReason})</span>}
              </span>
            </div>
            <span className="text-[11px] font-mono text-rose-200">Lưu trữ phục vụ tra cứu lịch sử</span>
          </div>
        )}

        {/* Thanh Tab Chuyển Đổi Chế Độ Xem */}
        <div className="px-4 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('VIEW')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'VIEW'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              👁️ Xem Nội Dung Trực Tiếp
            </button>
            {metadata && (
              <button
                onClick={() => setActiveTab('METADATA')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'METADATA'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                📋 Thông Tin & Biên Nhận Nộp
              </button>
            )}
            <button
              onClick={() => setActiveTab('LINKS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'LINKS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔗 Link Lưu Trữ Đám Mây
            </button>
          </div>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="w-3 h-3" />
            Tài liệu số hóa nội bộ — Xem trực tiếp không cần tải về máy
          </span>
        </div>

        {/* Thân Cửa Sổ Hiển Thị Nội Dung */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-3 sm:p-3 flex flex-col">
          {activeTab === 'VIEW' && (
            <div className="w-full h-full flex flex-col">
              {/* TRƯỜNG HỢP 1: VĂN BẢN NỘI QUY HOẶC NỘI DUNG TÙY BIẾN */}
              {customContent ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-8 overflow-y-auto max-w-4xl mx-auto w-full text-slate-800 space-y-1.5">
                  <div className="text-center pb-4 border-b border-slate-200">
                    <p className="font-bold text-xs uppercase tracking-widest text-slate-500">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs text-slate-500">Độc lập - Tự do - Hạnh phúc</p>
                    <div className="w-24 h-0.5 bg-slate-300 mx-auto mt-2"></div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5 uppercase">{title}</h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{subTitle}</p>
                  </div>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap font-sans leading-relaxed text-slate-700">
                    {customContent}
                  </div>
                </div>
              ) : fileType === 'VIDEO' ? (
                /* TRƯỜNG HỢP 2: VIDEO */
                <div className="w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden shadow-inner">
                  {fileUrl ? (
                    <video controls className="w-full max-h-full" src={fileUrl}>
                      Trình duyệt của bạn không hỗ trợ phát video trực tiếp.
                    </video>
                  ) : (
                    <div className="text-center text-slate-400 p-3">
                      <Video className="w-16 h-16 mx-auto text-slate-600 mb-3" />
                      <p className="text-sm font-bold text-slate-300">Xem video bằng chứng kiểm tra định kỳ</p>
                      <p className="text-xs text-slate-500 mt-1">Đã lưu trữ link video xác thực công tác ATVSLĐ & PCCC cơ sở</p>
                    </div>
                  )}
                </div>
              ) : fileType === 'EXCEL' ? (
                /* TRƯỜNG HỢP 3: FILE EXCEL / SPREADSHEET */
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-3 w-full h-full flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center space-x-2 text-xs text-slate-600 font-bold">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>BẢNG KÊ SỐ LIỆU ĐÍNH KÈM BÁO CÁO (XLSX)</span>
                    </div>
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Mở bằng Google Trang tính / Excel Online <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left text-slate-700 border-collapse">
                      <thead className="bg-slate-100 font-bold text-slate-800 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5 border-r border-slate-200 text-center w-12">STT</th>
                          <th className="p-2.5 border-r border-slate-200">Chỉ Tiêu / Hạng Mục Thống Kê</th>
                          <th className="p-2.5 border-r border-slate-200 text-center">Kỳ Trước</th>
                          <th className="p-2.5 border-r border-slate-200 text-center">Kỳ Này (Thực Hiện)</th>
                          <th className="p-2.5 border-r border-slate-200 text-center">Tỷ Lệ Đạt (%)</th>
                          <th className="p-2.5">Ghi Chú Nghiệp Vụ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold">1</td>
                          <td className="p-2.5 border-r border-slate-100 font-sans font-medium">Tổng số lao động tham gia công tác ATVSLĐ</td>
                          <td className="p-2.5 border-r border-slate-100 text-center">6.750</td>
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold text-indigo-700">6.789</td>
                          <td className="p-2.5 border-r border-slate-100 text-center text-emerald-700 font-bold">100.5%</td>
                          <td className="p-2.5 font-sans text-slate-500">Đã chốt danh sách nhân sự</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold">2</td>
                          <td className="p-2.5 border-r border-slate-100 font-sans font-medium">Số lao động đã khám sức khỏe định kỳ năm</td>
                          <td className="p-2.5 border-r border-slate-100 text-center">6.750</td>
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold text-indigo-700">6.789</td>
                          <td className="p-2.5 border-r border-slate-100 text-center text-emerald-700 font-bold">100%</td>
                          <td className="p-2.5 font-sans text-slate-500">Phòng khám đa khoa khu công nghiệp</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold">3</td>
                          <td className="p-2.5 border-r border-slate-100 font-sans font-medium">Số sự cố tai nạn lao động nghiêm trọng</td>
                          <td className="p-2.5 border-r border-slate-100 text-center">0</td>
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold text-emerald-700">0</td>
                          <td className="p-2.5 border-r border-slate-100 text-center text-emerald-700 font-bold">0%</td>
                          <td className="p-2.5 font-sans text-slate-500">Đạt chỉ tiêu An toàn tuyệt đối</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold">4</td>
                          <td className="p-2.5 border-r border-slate-100 font-sans font-medium">Chi phí trang bị phương tiện bảo vệ cá nhân</td>
                          <td className="p-2.5 border-r border-slate-100 text-center">2.450.000.000</td>
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold text-indigo-700">2.680.000.000</td>
                          <td className="p-2.5 border-r border-slate-100 text-center text-emerald-700 font-bold">109%</td>
                          <td className="p-2.5 font-sans text-slate-500">Cấp phát đúng tiêu chuẩn</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold">5</td>
                          <td className="p-2.5 border-r border-slate-100 font-sans font-medium">Tổng kinh phí thực hiện công tác ATVSLĐ</td>
                          <td className="p-2.5 border-r border-slate-100 text-center">4.120.000.000</td>
                          <td className="p-2.5 border-r border-slate-100 text-center font-bold text-indigo-700">4.520.000.000</td>
                          <td className="p-2.5 border-r border-slate-100 text-center text-emerald-700 font-bold">110%</td>
                          <td className="p-2.5 font-sans text-slate-500">Kế hoạch tài chính đã phê duyệt</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* TRƯỜNG HỢP 4: FILE PDF / WORD THƯỜNG */
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-8 max-w-4xl mx-auto w-full overflow-y-auto space-y-3">
                  {/* Bản hiển thị mẫu xem trước tài liệu pháp lý */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    <div className="flex justify-between items-start pb-4 border-b border-slate-200 mb-1.5">
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500">DOANH NGHIỆP: AN VIỆT MANUFACTURING</p>
                        <p className="text-xs text-slate-500">Mã số thuế: 0314897268</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase text-slate-500">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                        <p className="text-[11px] text-slate-500">Độc lập - Tự do - Hạnh phúc</p>
                      </div>
                    </div>

                    <div className="text-center py-2">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">{title}</h2>
                      <p className="text-xs font-semibold text-indigo-700 mt-1">{subTitle || 'BẢN LƯU BÁO CÁO CHÍNH THỨC GỬI CƠ QUAN QUẢN LÝ NHÀ NƯỚC'}</p>
                      {metadata?.soCongVan && (
                        <p className="text-xs font-mono text-slate-500 mt-0.5">Số hiệu: {metadata.soCongVan}</p>
                      )}
                    </div>

                    <div className="space-y-3 text-xs text-slate-700 leading-relaxed pt-2">
                      <p><b>Kính gửi:</b> {metadata?.coQuanTiepNhan || 'Sở Nội vụ / Cơ quan có thẩm quyền'}</p>
                      <p>Thực hiện các quy định pháp luật lao động, an toàn vệ sinh lao động và nghĩa vụ báo cáo tuân thủ định kỳ của Doanh nghiệp trên địa bàn;</p>
                      <p>Công ty TNHH Sản Xuất Thực Phẩm An Việt trân trọng báo cáo chi tiết các số liệu tuân thủ, kết quả thực hiện và phương án duy trì điều kiện làm việc đảm bảo quyền lợi cho 6.789 người lao động.</p>
                      
                      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-950 font-medium my-3">
                        <p>✓ Tình trạng văn bản: <b>Đã ký duyệt & đóng dấu điện tử</b></p>
                        <p>✓ Cán bộ chịu trách nhiệm: <b>{metadata?.canBoGui || 'Trưởng phòng Nhân sự & Pháp chế'}</b></p>
                        <p>✓ Đơn vị tiếp nhận: <b>{metadata?.coQuanTiepNhan || 'Cơ quan quản lý địa phương'}</b></p>
                      </div>
                    </div>

                    <div className="pt-6 mt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Hệ thống HRM Soft — Tự động đối soát & lưu vết</span>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">ĐẠI DIỆN DOANH NGHIỆP</p>
                        <p className="text-[10px] text-slate-500 italic mt-0.5">Đã ký số hợp lệ</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: THÔNG TIN BIÊN NHẬN CHI TIẾT */}
          {activeTab === 'METADATA' && metadata && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 max-w-2xl mx-auto w-full space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Thông Tin Chi Tiết Đợt Báo Cáo Đã Gửi
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block mb-0.5">Đợt báo cáo:</span>
                  <span className="font-bold text-slate-900">{metadata.dotBaoCao || 'Kỳ định kỳ'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block mb-0.5">Ngày gửi thực tế:</span>
                  <span className="font-bold text-slate-900">{metadata.ngayGui || 'Đã ghi nhận'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block mb-0.5">Số hiệu công văn:</span>
                  <span className="font-bold text-slate-900 font-mono">{metadata.soCongVan || 'Theo quy chuẩn'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block mb-0.5">Cán bộ phụ trách gửi:</span>
                  <span className="font-bold text-slate-900">{metadata.canBoGui || 'Phòng Nhân sự'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 text-[10px] block mb-0.5">Cơ quan & người tiếp nhận:</span>
                  <span className="font-bold text-slate-900">{metadata.coQuanTiepNhan || 'Sở Nội vụ / Sở ban ngành liên quan'}</span>
                  {metadata.nguoiNhanLienHe && (
                    <span className="text-indigo-600 block mt-0.5">({metadata.nguoiNhanLienHe})</span>
                  )}
                </div>

                {metadata.ghiChu && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-slate-400 text-[10px] block mb-0.5">Ghi chú tiếp nhận:</span>
                    <span className="text-slate-700">{metadata.ghiChu}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LIÊN KẾT ĐÁM MÂY */}
          {activeTab === 'LINKS' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 max-w-2xl mx-auto w-full space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Đường Dẫn Lưu Trữ Tài Liệu Đám Mây (Không làm nặng web)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tài liệu được lưu giữ an toàn trên Google Drive / OneDrive hoặc hệ thống văn thư điện tử. Người dùng có thể sao chép link hoặc mở trực tiếp trên cửa sổ mới.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-800 block truncate">
                      {fileUrl || 'https://drive.google.com/drive/folders/sample_compliance_reports'}
                    </span>
                    <span className="text-[10px] text-slate-400">Liên kết chính thức</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 text-xs"
                    >
                      {copied ? 'Đã chép' : 'Sao chép'}
                    </button>
                    <a
                      href={fileUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1"
                    >
                      Mở tab mới <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Hệ thống HRM Soft Viewer — Bảo mật & Lưu trữ trực tuyến</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
