import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  FileText, 
  FileSpreadsheet, 
  ShieldAlert, 
  Eye, 
  Edit3, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  Upload,
  RefreshCw,
  Save,
  ChevronDown,
  ChevronRight,
  Layers,
  AlertCircle
} from 'lucide-react';
import { 
  govReportsService, 
  GovReportItem, 
  GovReportColor, 
  GovReportApDung,
  GovReportSubmissionHistory 
} from '../services/govReportsService';
import { FileViewerModal, ViewerFileType } from './FileViewerModal';
import { excelService } from '../services/excelService';
import { Employee, PersonnelChange, CompanyPolicy } from '../types/hrm';

interface GovReportsViewProps {
  employees?: Employee[];
  personnelChanges?: PersonnelChange[];
  policy?: CompanyPolicy;
}

export const GovReportsView: React.FC<GovReportsViewProps> = ({ employees = [], personnelChanges = [], policy }) => {
  const [reports, setReports] = useState<GovReportItem[]>(() => govReportsService.getReports());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinhVuc, setSelectedLinhVuc] = useState<string>('ALL');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('ALL');

  // Trạng thái co / bung của 5 nhóm báo cáo theo đúng chỉ đạo: Tất cả 5 nhóm mặc định CO LẠI
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    GROUP_RED: false,        // 1. Khẩn cấp: Mặc định CO LẠI
    GROUP_YELLOW: false,     // 2. Cần xử lý: Mặc định CO LẠI
    GROUP_GREEN: false,      // 3. Trong hạn: Mặc định CO LẠI
    GROUP_SUBMITTED: false,  // 4. Đã hoàn tất nộp: Mặc định CO LẠI
    GROUP_GRAY: false        // 5. Không áp dụng: Mặc định CO LẠI
  });

  // Modal xem file trực tiếp (In-app Viewer)
  const [viewerModalState, setViewerModalState] = useState<{
    isOpen: boolean;
    title: string;
    fileType: ViewerFileType;
    fileUrl?: string;
    subTitle?: string;
    metadata?: any;
    customContent?: string;
  }>({
    isOpen: false,
    title: '',
    fileType: 'PDF'
  });

  // Modal chỉnh sửa TOÀN BỘ nội dung dòng thủ tục
  const [editRowReport, setEditRowReport] = useState<GovReportItem | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Modal cập nhật đợt nộp báo cáo
  const [editingReport, setEditingReport] = useState<GovReportItem | null>(null);
  const [submissionForm, setSubmissionForm] = useState({
    dotBaoCao: '',
    ngayGui: new Date().toISOString().slice(0, 10),
    soCongVan: '',
    canBoGui: 'Phòng Nhân sự & Pháp chế',
    coQuanNhan: '',
    nguoiNhanLienHe: '',
    linkWordExcel: '',
    linkPdf: '',
    linkVideo: '',
    ghiChu: ''
  });

  // Danh sách các lĩnh vực duy nhất
  const linhVucList = useMemo(() => {
    return ['ALL', ...Array.from(new Set(reports.map(r => r.linhVuc)))];
  }, [reports]);

  // Thống kê số lượng theo phân loại màu
  const counts = useMemo(() => {
    let red = 0;
    let yellow = 0;
    let green = 0;
    let gray = 0;

    reports.forEach(item => {
      const st = govReportsService.calculateStatus(item);
      if (st.color === 'RED') red++;
      else if (st.color === 'YELLOW') yellow++;
      else if (st.color === 'GREEN') green++;
      else if (st.color === 'GRAY') gray++;
    });

    return { red, yellow, green, gray, total: reports.length, urgentTotal: red + yellow };
  }, [reports]);

  // Danh sách báo cáo sau khi tự động sắp xếp và lọc
  const filteredAndSortedReports = useMemo(() => {
    const sorted = govReportsService.getSortedReports(reports);

    return sorted.filter(({ item, status }) => {
      if (selectedColorFilter === 'RED_YELLOW') {
        if (status.color !== 'RED' && status.color !== 'YELLOW') return false;
      } else if (selectedColorFilter === 'RED') {
        if (status.color !== 'RED') return false;
      } else if (selectedColorFilter === 'YELLOW') {
        if (status.color !== 'YELLOW') return false;
      } else if (selectedColorFilter === 'GREEN') {
        if (status.color !== 'GREEN') return false;
      } else if (selectedColorFilter === 'GRAY') {
        if (status.color !== 'GRAY') return false;
      }

      if (selectedLinhVuc !== 'ALL' && item.linhVuc !== selectedLinhVuc) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.tenThuTuc.toLowerCase().includes(q);
        const matchLinhVuc = item.linhVuc.toLowerCase().includes(q);
        const matchAgency = item.coQuanTiepNhan.toLowerCase().includes(q);
        const matchCanCu = item.canCu.toLowerCase().includes(q);
        const matchBieuMau = item.bieuMau.toLowerCase().includes(q);
        if (!matchName && !matchLinhVuc && !matchAgency && !matchCanCu && !matchBieuMau) {
          return false;
        }
      }

      return true;
    });
  }, [reports, searchQuery, selectedLinhVuc, selectedColorFilter]);

  // Phân chia 5 nhóm báo cáo theo yêu cầu người dùng
  const reportGroups = useMemo(() => {
    const groupRed: Array<{ item: GovReportItem; status: any }> = [];
    const groupYellow: Array<{ item: GovReportItem; status: any }> = [];
    const groupGreen: Array<{ item: GovReportItem; status: any }> = [];
    const groupSubmitted: Array<{ item: GovReportItem; status: any }> = [];
    const groupGray: Array<{ item: GovReportItem; status: any }> = [];

    filteredAndSortedReports.forEach(entry => {
      const { item, status } = entry;
      if (item.apDung === 'KHONG') {
        groupGray.push(entry);
      } else if (item.trangThaiThuTuc === 'DA_NOP') {
        groupSubmitted.push(entry);
      } else if (status.color === 'RED') {
        groupRed.push(entry);
      } else if (status.color === 'YELLOW') {
        groupYellow.push(entry);
      } else {
        groupGreen.push(entry);
      }
    });

    return [
      {
        id: 'GROUP_RED',
        title: '1. Nhóm Khẩn Cấp / Quá Hạn (< 7 ngày)',
        subTitle: 'Nghĩa vụ pháp lý cấp bách — Cần thực hiện nộp ngay để tránh bị phạt tiền hành chính',
        badgeText: `${groupRed.length} thủ tục khẩn cấp`,
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 font-black',
        headerBg: 'bg-rose-50/90 hover:bg-rose-100/90 border-rose-300',
        activeHeaderBg: 'bg-rose-100/90 border-rose-400 text-rose-950',
        icon: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />,
        items: groupRed,
        isDefaultOpen: true
      },
      {
        id: 'GROUP_YELLOW',
        title: '2. Nhóm Cần Xử Lý / Sắp Đến Hạn (7 - 30 ngày)',
        subTitle: 'Đang trong thời hạn chuẩn bị hồ sơ, biểu mẫu báo cáo — Cần rà soát trình duyệt sớm',
        badgeText: `${groupYellow.length} thủ tục cần xử lý`,
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
        headerBg: 'bg-amber-50/90 hover:bg-amber-100/90 border-amber-300',
        activeHeaderBg: 'bg-amber-100/90 border-amber-400 text-amber-950',
        icon: <Clock className="w-5 h-5 text-amber-600 shrink-0" />,
        items: groupYellow,
        isDefaultOpen: true
      },
      {
        id: 'GROUP_GREEN',
        title: '3. Nhóm Đang Trong Hạn Kỳ Tới (> 30 ngày)',
        subTitle: 'Thời hạn còn xa, dữ liệu và hồ sơ đang trong trạng thái bình thường an toàn',
        badgeText: `${groupGreen.length} thủ tục an toàn`,
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
        headerBg: 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200',
        activeHeaderBg: 'bg-emerald-100/80 border-emerald-300 text-emerald-950',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
        items: groupGreen,
        isDefaultOpen: false
      },
      {
        id: 'GROUP_SUBMITTED',
        title: '4. Nhóm Đã Hoàn Tất Nộp Kỳ Này',
        subTitle: 'Đã nộp cơ quan nhà nước, có link hồ sơ Word/Excel và bản PDF mộc đỏ lưu trữ đối chiếu',
        badgeText: `${groupSubmitted.length} thủ tục đã nộp`,
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
        headerBg: 'bg-blue-50/70 hover:bg-blue-100/70 border-blue-200',
        activeHeaderBg: 'bg-blue-100/80 border-blue-300 text-blue-950',
        icon: <FileText className="w-5 h-5 text-blue-600 shrink-0" />,
        items: groupSubmitted,
        isDefaultOpen: false
      },
      {
        id: 'GROUP_GRAY',
        title: '5. Nhóm Không Áp Dụng Cho Doanh Nghiệp',
        subTitle: 'Các thủ tục doanh nghiệp không phát sinh hoạt động hoặc không thuộc diện quản lý',
        badgeText: `${groupGray.length} thủ tục bỏ qua`,
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
        headerBg: 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200',
        activeHeaderBg: 'bg-slate-200/80 border-slate-300 text-slate-900',
        icon: <RotateCcw className="w-5 h-5 text-slate-500 shrink-0" />,
        items: groupGray,
        isDefaultOpen: false
      }
    ];
  }, [filteredAndSortedReports]);

  // Bật/tắt 1 nhóm
  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Mở tất cả / Thu gọn tất cả
  const handleSetAllGroups = (isOpen: boolean) => {
    setOpenGroups({
      GROUP_RED: isOpen,
      GROUP_YELLOW: isOpen,
      GROUP_GREEN: isOpen,
      GROUP_SUBMITTED: isOpen,
      GROUP_GRAY: isOpen
    });
  };

  // Đặt lại mặc định: Tất cả 5 nhóm co lại
  const handleResetToDefaultGroups = () => {
    setOpenGroups({
      GROUP_RED: false,
      GROUP_YELLOW: false,
      GROUP_GREEN: false,
      GROUP_SUBMITTED: false,
      GROUP_GRAY: false
    });
  };

  // Mở modal cập nhật đợt nộp báo cáo
  const handleOpenSubmissionModal = (report: GovReportItem) => {
    setEditingReport(report);
    setSubmissionForm({
      dotBaoCao: `Đợt ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      ngayGui: new Date().toISOString().slice(0, 10),
      soCongVan: `CV-${report.stt}/${new Date().getFullYear()}/HRM-AV`,
      canBoGui: 'Nguyễn Thị Bích Ngọc (Chuyên viên Nhân sự & Pháp chế)',
      coQuanNhan: report.coQuanTiepNhan,
      nguoiNhanLienHe: 'Bộ phận một cửa / Cán bộ chuyên trách',
      linkWordExcel: 'https://docs.google.com/spreadsheets/d/sample_compliance_report',
      linkPdf: 'https://thuvienphapluat.vn/sample_signed_report.pdf',
      linkVideo: '',
      ghiChu: 'Đã hoàn tất nộp đúng hạn, lưu biên nhận điện tử'
    });
  };

  // Lưu đợt nộp báo cáo
  const handleSaveSubmission = () => {
    if (!editingReport) return;
    const updated = govReportsService.addSubmissionRecord(editingReport.id, submissionForm);
    setReports(updated);
    setEditingReport(null);
  };

  // Thay đổi áp dụng cho công ty (Có / Không)
  const handleToggleApDung = (reportId: string, current: GovReportApDung) => {
    const nextVal: GovReportApDung = current === 'CO' ? 'KHONG' : 'CO';
    const updated = govReportsService.toggleApDung(reportId, nextVal);
    setReports(updated);
  };

  // Cập nhật toàn bộ thông tin dòng thủ tục (SỬA TOÀN BỘ NỘI DUNG DÒNG ĐÓ)
  const handleSaveEditRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRowReport) return;
    const updated = govReportsService.updateReport(editRowReport);
    setReports(updated);
    setEditRowReport(null);
    setImportNotice(`Đã cập nhật thành công thủ tục: ${editRowReport.tenThuTuc}`);
    setTimeout(() => setImportNotice(null), 4000);
  };

  // Xuất file Excel chuẩn đầy đủ cột
  const handleExportExcel = () => {
    const exportData = filteredAndSortedReports.map(({ item, status }) => ({
      'STT': item.stt,
      'Mã Thủ Tục': item.id,
      'Lĩnh Vực': item.linhVuc,
      'Hạng Mục Báo Cáo': item.tenThuTuc,
      'Nội Dung Chi Tiết': item.noiDung,
      'Cơ Quan Tiếp Nhận': item.coQuanTiepNhan,
      'Tần Suất / Hạn Nộp': item.tanSuatThoiHan,
      'Ngày Hết Hạn Tới (YYYY-MM-DD)': item.ngayHetHanTiepTheo,
      'Số Ngày Còn Lại': status.daysRemaining === 9999 ? 'Không áp dụng' : status.daysRemaining === 999 ? 'Đã nộp' : status.daysRemaining,
      'Trạng Thái Màu': status.color === 'RED' ? 'ĐỎ (Khẩn cấp/Quá hạn)' : status.color === 'YELLOW' ? 'VÀNG (Sắp đến hạn)' : status.color === 'GREEN' ? 'XANH (Đang tốt)' : 'XÁM (Không áp dụng)',
      'Áp Dụng (Có/Không)': item.apDung === 'CO' ? 'Có' : 'Không',
      'Tình Trạng Nộp (Đã nộp/Chưa nộp)': item.trangThaiThuTuc === 'DA_NOP' ? 'Đã nộp' : 'Chưa nộp',
      'Mức Phạt Vi Phạm': item.mucPhat,
      'Điều Khoản Xử Phạt': item.dieuKhoanPhat,
      'Biểu Mẫu Quy Định': item.bieuMau,
      'Căn Cứ Pháp Lý': item.canCu,
      'Cán Bộ / Phòng Ban Phụ Trách': item.phuTrach,
      'Ghi Chú Nghiệp Vụ': item.ghiChu
    }));

    excelService.exportToExcel(exportData, '02_NS_BM_Tuan_thu_Bao_cao_Nha_nuoc_2026.xlsx');
  };

  // Tải lên file Excel mẫu để cập nhật ngược vào web
  const handleImportExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows = await excelService.readExcelFile(file);
      if (!rows || rows.length === 0) {
        alert('File Excel không có dữ liệu!');
        return;
      }

      const res = govReportsService.importFromExcelRows(rows);
      setReports(res.updatedList);
      setImportNotice(`Đã đồng bộ thành công ${res.successCount}/${res.updatedList.length} thủ tục từ file Excel! Dữ liệu đã được cập nhật ngay trong web.`);
      setTimeout(() => setImportNotice(null), 5000);
    } catch (err) {
      console.error(err);
      alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file!');
    } finally {
      e.target.value = '';
    }
  };

  // Khôi phục dữ liệu gốc 32 thủ tục chuẩn
  const handleResetData = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục danh mục 32 thủ tục về dữ liệu mẫu ban đầu?')) {
      const reset = govReportsService.resetToOriginal();
      setReports(reset);
      setImportNotice('Đã khôi phục dữ liệu 32 thủ tục về bản gốc!');
      setTimeout(() => setImportNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-2.5 animate-in fade-in">
      {/* 1. Header Tiêu Đề & Nút Thao Tác Xuất/Nhập Excel */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                  Báo Cáo HCNS Đến Cơ Quan Nhà Nước (CQNN)
                </h1>
                <p className="text-[10.5px] text-slate-500">
                  Kiểm soát chính xác hạn nộp thủ tục &amp; nghĩa vụ tuân thủ định kỳ (Nguồn: 02 NS-BM Tuân thủ Báo cáo Nhà nước)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Nút Xuất Excel */}
            <button
              onClick={handleExportExcel}
              className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              title="Xuất file Excel đầy đủ 32 thủ tục để tra cứu hoặc chỉnh sửa dữ liệu"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>

            {/* Nút Tải Lên Excel (Cách 2: Sửa trên excel rồi tải lên) */}
            <label
              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              title="Tải lên file Excel đã sửa để cập nhật trực tiếp dữ liệu vào hệ thống"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Lên Excel Cập Nhật</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleImportExcelFile}
              />
            </label>

            {/* Nút Khôi Phục Dữ Liệu Gốc */}
            <button
              onClick={handleResetData}
              className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              title="Khôi phục danh mục 32 thủ tục về dữ liệu gốc chuẩn"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Khôi Phục Gốc</span>
            </button>
          </div>
        </div>

        {/* Thông báo cập nhật / Import Excel thành công */}
        {importNotice && (
          <div className="mt-2 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{importNotice}</span>
            </div>
            <button
              onClick={() => setImportNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 2. Bốn Thẻ KPI Màu Sắc Đạt Chuẩn */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2.5">
          {/* Thẻ 1: MÀU ĐỎ - GẤP / QUÁ HẠN (< 7 NGÀY) */}
          <div 
            onClick={() => setSelectedColorFilter(selectedColorFilter === 'RED' ? 'ALL' : 'RED')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              selectedColorFilter === 'RED'
                ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400'
                : 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Gấp / Quá Hạn (&lt; 7 ngày)
              </span>
              <span className="p-0.5 rounded bg-rose-200/60 text-rose-700">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="text-xl font-black text-rose-900">{counts.red}</span>
              <span className="text-[10px] font-bold text-rose-700">Co lại mặc định</span>
            </div>
            <p className="text-[9px] text-rose-600 mt-0.5">Cần làm thủ tục nộp ngay tránh phạt tiền</p>
          </div>

          {/* Thẻ 2: MÀU VÀNG - SẮP ĐẾN HẠN (7 - 30 NGÀY) */}
          <div 
            onClick={() => setSelectedColorFilter(selectedColorFilter === 'YELLOW' ? 'ALL' : 'YELLOW')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              selectedColorFilter === 'YELLOW'
                ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400'
                : 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Sắp Đến Hạn (7 - 30 ngày)
              </span>
              <span className="p-0.5 rounded bg-amber-200/60 text-amber-700">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="text-xl font-black text-amber-900">{counts.yellow}</span>
              <span className="text-[10px] font-bold text-amber-700">Co lại mặc định</span>
            </div>
            <p className="text-[9px] text-amber-600 mt-0.5">Chuẩn bị số liệu biểu mẫu nộp</p>
          </div>

          {/* Thẻ 3: MÀU XANH LÁ - ĐANG TỐT / ĐÃ NỘP */}
          <div 
            onClick={() => setSelectedColorFilter(selectedColorFilter === 'GREEN' ? 'ALL' : 'GREEN')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              selectedColorFilter === 'GREEN'
                ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400'
                : 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Đang Tốt / Đã Nộp
              </span>
              <span className="p-0.5 rounded bg-emerald-200/60 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="text-xl font-black text-emerald-900">{counts.green}</span>
              <span className="text-[10px] font-bold text-emerald-700">Co lại mặc định</span>
            </div>
            <p className="text-[9px] text-emerald-600 mt-0.5">Đã nộp xong hoặc hạn còn xa</p>
          </div>

          {/* Thẻ 4: MÀU XÁM - CÔNG TY KHÔNG ÁP DỤNG */}
          <div 
            onClick={() => setSelectedColorFilter(selectedColorFilter === 'GRAY' ? 'ALL' : 'GRAY')}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              selectedColorFilter === 'GRAY'
                ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-400'
                : 'bg-slate-100/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Không Áp Dụng
              </span>
              <span className="p-0.5 rounded bg-slate-200 text-slate-600">
                <Filter className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-800">{counts.gray}</span>
              <span className="text-[10px] font-bold text-slate-500">Co lại mặc định</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">Đã cấu hình bỏ qua cho đơn vị</p>
          </div>
        </div>
      </div>

      {/* 3. Thanh Tìm Kiếm, Bộ Lọc & Điều Khiển 5 Nhóm Accordion */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên thủ tục, cơ quan, căn cứ pháp lý, mức phạt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50/80 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 font-normal"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc theo lĩnh vực */}
            <div className="flex items-center space-x-1.5">
              <select
                value={selectedLinhVuc}
                onChange={(e) => setSelectedLinhVuc(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Tất Cả Lĩnh Vực (32)</option>
                <option value="LAO_DONG_TIEN_LUONG">Lao Động &amp; Tiền Lương</option>
                <option value="BHXH_BHYT">Bảo Hiểm Xã Hội (BHXH)</option>
                <option value="THUE_TNCN">Thuế &amp; Quyết Toán Thuế TNCN</option>
                <option value="ATVSLD_PCCC">An Toàn Vệ Sinh Lao Động &amp; PCCC</option>
                <option value="NGUOI_NUOC_NGOAI">Lao Động Nước Ngoài</option>
                <option value="CONG_DOAN">Công Đoàn &amp; Kinh Phí Công Đoàn</option>
                <option value="THONG_KE">Thống Kê Lao Động</option>
              </select>
            </div>

            {/* Lọc theo trạng thái màu */}
            <div className="flex items-center space-x-1.5">
              <select
                value={selectedColorFilter}
                onChange={(e) => setSelectedColorFilter(e.target.value as any)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Tất Cả Mức Độ</option>
                <option value="RED_YELLOW">🚨 Cần Xử Lý (Đỏ + Vàng: {counts.urgentTotal})</option>
                <option value="RED">⚠️ Khẩn Cấp / Quá Hạn (Đỏ: {counts.red})</option>
                <option value="YELLOW">⏱️ Sắp Đến Hạn (Vàng: {counts.yellow})</option>
                <option value="GREEN">✓ An Toàn / Đã Nộp (Xanh: {counts.green})</option>
                <option value="GRAY">⚪ Không Áp Dụng (Xám: {counts.gray})</option>
              </select>
            </div>

            {(selectedColorFilter !== 'ALL' || selectedLinhVuc !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedColorFilter('ALL');
                  setSelectedLinhVuc('ALL');
                  setSearchQuery('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Thanh Điều Khiển Co / Bung Nhanh Của 5 Nhóm */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-800 text-[11.5px]">Điều khiển hiển thị 5 nhóm:</span>
            <span className="text-[10.5px] text-slate-400 italic hidden sm:inline">
              (Tất cả 5 nhóm mặc định co lại nhằm tập trung thông tin và hạn chế tối đa cuộn chuột)
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleResetToDefaultGroups}
              className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10.5px] border border-indigo-200 transition-colors cursor-pointer"
              title="Khôi phục trạng thái chuẩn: Co lại tất cả 5 nhóm"
            >
              Mặc Định (Co Lại Cả 5 Nhóm)
            </button>
            <button
              onClick={() => handleSetAllGroups(true)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[10.5px] transition-colors cursor-pointer"
            >
              Bung Tất Cả
            </button>
            <button
              onClick={() => handleSetAllGroups(false)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[10.5px] transition-colors cursor-pointer"
            >
              Thu Gọn Tất Cả
            </button>
          </div>
        </div>
      </div>

      {/* 4. HIỂN THỊ THEO 5 NHÓM CO / BUNG (ACCORDION SECTIONS) */}
      <div className="space-y-2">
        {reportGroups.map((group) => {
          const isOpen = openGroups[group.id] ?? false;
          const hasItems = group.items.length > 0;

          return (
            <div 
              key={group.id} 
              className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs ${
                isOpen ? 'border-slate-300 ring-1 ring-slate-200/60' : 'border-slate-200'
              }`}
            >
              {/* THANH TIÊU ĐỀ NHÓM (Bấm vào để co lại / tung ra) */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full p-2 flex items-center justify-between text-left transition-colors cursor-pointer border-b ${
                  isOpen ? group.activeHeaderBg : group.headerBg
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200/80">
                    {group.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                        {group.title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] border shadow-xs ${group.badgeColor}`}>
                        {group.badgeText}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 truncate max-w-xl">
                      {group.subTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                    {isOpen ? 'Thu gọn' : 'Bấm để bung ra'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white/80 border border-slate-200 flex items-center justify-center shadow-2xs">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-700" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-700" />
                    )}
                  </div>
                </div>
              </button>

              {/* NỘI DUNG KHI BUNG RA */}
              {isOpen && (
                <div className="animate-in fade-in duration-200">
                  {!hasItems ? (
                    <div className="p-3 text-center text-xs text-slate-400 italic">
                      Không có thủ tục nào thuộc nhóm này theo điều kiện tìm kiếm hoặc bộ lọc hiện tại.
                    </div>
                  ) : (
                    <>
                      {/* GIAO DIỆN BẢNG CHO IPAD VÀ MÁY TÍNH (Tablet / Desktop: md:block) */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-700 border-collapse">
                          <thead className="bg-slate-100/90 text-slate-800 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="p-3 text-center w-12">STT</th>
                              <th className="p-3 min-w-[260px]">Hạng Mục / Thủ Tục Báo Cáo</th>
                              <th className="p-3 min-w-[150px]">Cơ Quan Tiếp Nhận</th>
                              <th className="p-3 min-w-[170px]">Tần Suất &amp; Thời Hạn Nộp</th>
                              <th className="p-3 text-center min-w-[150px]">Trạng Thái / Hạn Tới</th>
                              <th className="p-3 min-w-[180px]">Mức Phạt Vi Phạm</th>
                              <th className="p-3 min-w-[160px]">Hồ Sơ Đã Nộp &amp; Link Lưu</th>
                              <th className="p-3 text-center w-28">Thao Tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.items.map(({ item, status }, index) => {
                              const isUrgent = status.color === 'RED';
                              const isGray = status.color === 'GRAY';

                              return (
                                <tr 
                                  key={item.id} 
                                  className={`transition-colors ${status.bgClass} ${isUrgent ? 'ring-1 ring-rose-200' : ''}`}
                                >
                                  {/* Cột 1: STT & Mã */}
                                  <td className="p-3 text-center font-bold text-slate-500">
                                    <span className="text-xs">{index + 1}</span>
                                    <span className="block text-[9px] font-mono text-slate-400 mt-0.5">{item.id}</span>
                                  </td>

                                  {/* Cột 2: Tên thủ tục & Lĩnh vực */}
                                  <td className="p-3">
                                    <div className="font-bold text-slate-900 text-xs leading-snug">
                                      {item.tenThuTuc}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                      {item.noiDung}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {item.linhVuc}
                                      </span>
                                      {item.bieuMau && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                                          {item.bieuMau}
                                        </span>
                                      )}
                                      {item.linkMau && (
                                        <a
                                          href={item.linkMau}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 hover:underline"
                                          title="Xem mẫu biểu gốc tại Thư Viện Pháp Luật"
                                        >
                                          <span>Mẫu gốc</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </div>
                                  </td>

                                  {/* Cột 3: Cơ quan tiếp nhận */}
                                  <td className="p-3">
                                    <div className="font-semibold text-slate-900 text-xs flex items-start gap-1">
                                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                      <span>{item.coQuanTiepNhan}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-1">
                                      Phụ trách: {item.phuTrach || 'Phòng Nhân sự'}
                                    </span>
                                  </td>

                                  {/* Cột 4: Tần suất & Thời hạn */}
                                  <td className="p-3">
                                    <div className="font-medium text-slate-800 text-xs leading-snug">
                                      {item.tanSuatThoiHan}
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      <span>Kỳ tới: <b>{item.ngayHetHanTiepTheo}</b></span>
                                    </div>
                                  </td>

                                  {/* Cột 5: Trạng thái màu sắc */}
                                  <td className="p-3 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold leading-none ${status.badgeClass}`}>
                                      {status.label}
                                    </span>

                                    <button
                                      onClick={() => handleToggleApDung(item.id, item.apDung)}
                                      className={`mt-2 block mx-auto text-[9px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                        isGray
                                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                      }`}
                                      title="Bấm để chuyển đổi Có áp dụng / Không áp dụng"
                                    >
                                      {isGray ? 'Bấm để Áp dụng' : 'Bấm để Bỏ qua'}
                                    </button>
                                  </td>

                                  {/* Cột 6: Mức phạt vi phạm hành chính */}
                                  <td className="p-3">
                                    <div className="p-2 rounded-xl bg-white/90 border border-slate-200 space-y-1 shadow-xs">
                                      <div className="font-black text-rose-700 text-xs flex items-center gap-1">
                                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                        <span>{item.mucPhat}</span>
                                      </div>
                                      {item.dieuKhoanPhat && (
                                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                                          {item.dieuKhoanPhat}
                                        </p>
                                      )}
                                      {item.linkPhat && (
                                        <a
                                          href={item.linkPhat}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-rose-600 hover:underline"
                                        >
                                          <span>Điều khoản phạt TVPL</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                    </div>
                                  </td>

                                  {/* Cột 7: Hồ sơ đã nộp & Link xem */}
                                  <td className="p-3">
                                    {item.lichSuBaoCao && item.lichSuBaoCao.length > 0 ? (
                                      <div className="space-y-1.5">
                                        {item.lichSuBaoCao.map((hist) => (
                                          <div key={hist.id} className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] shadow-xs">
                                            <div className="font-bold text-slate-900 truncate">{hist.dotBaoCao}</div>
                                            <span className="text-[10px] text-slate-400 block font-mono">Ngày gửi: {hist.ngayGui}</span>
                                            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-100">
                                              {hist.linkPdf && (
                                                <button
                                                  onClick={() => setViewerModalState({
                                                    isOpen: true,
                                                    title: item.tenThuTuc,
                                                    subTitle: hist.dotBaoCao,
                                                    fileType: 'PDF',
                                                    fileUrl: hist.linkPdf,
                                                    metadata: hist
                                                  })}
                                                  className="text-[10px] font-bold text-rose-700 hover:text-rose-900 flex items-center gap-0.5 cursor-pointer"
                                                  title="Xem trực tiếp bản PDF đã ký đóng dấu"
                                                >
                                                  <FileText className="w-3 h-3 text-rose-600" />
                                                  <span>Xem PDF</span>
                                                </button>
                                              )}
                                              {hist.linkWordExcel && (
                                                <button
                                                  onClick={() => setViewerModalState({
                                                    isOpen: true,
                                                    title: item.tenThuTuc,
                                                    subTitle: hist.dotBaoCao,
                                                    fileType: 'EXCEL',
                                                    fileUrl: hist.linkWordExcel,
                                                    metadata: hist
                                                  })}
                                                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer"
                                                  title="Xem trực tiếp bảng tính Excel số liệu"
                                                >
                                                  <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                                                  <span>Xem Excel</span>
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">Chưa lưu link đợt nộp nào</span>
                                    )}
                                  </td>

                                  {/* Cột 8: Nút Thao tác */}
                                  <td className="p-3 text-center space-y-1.5">
                                    {/* Nút 1: Sửa Dòng (Toàn bộ trường dữ liệu) */}
                                    <button
                                      onClick={() => setEditRowReport({ ...item })}
                                      className="w-full px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                      title="Sửa tất cả các thông tin của thủ tục này"
                                    >
                                      <Edit3 className="w-3 h-3 text-amber-600" />
                                      <span>Sửa Dòng</span>
                                    </button>

                                    {/* Nút 2: Nộp / Lưu Hồ Sơ */}
                                    <button
                                      onClick={() => handleOpenSubmissionModal(item)}
                                      className="w-full px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                      title="Cập nhật link đợt nộp báo cáo (Word/Excel & PDF)"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Nộp / Lưu</span>
                                    </button>

                                    {/* Nút 3: Xem Mẫu Quy Định */}
                                    <button
                                      onClick={() => setViewerModalState({
                                        isOpen: true,
                                        title: item.tenThuTuc,
                                        subTitle: `Cơ quan tiếp nhận: ${item.coQuanTiepNhan}`,
                                        fileType: 'WORD',
                                        fileUrl: item.linkMau || 'https://thuvienphapluat.vn',
                                        metadata: {
                                          coQuanTiepNhan: item.coQuanTiepNhan,
                                          canBoGui: item.phuTrach,
                                          dotBaoCao: item.tanSuatThoiHan,
                                          ghiChu: item.ghiChu
                                        }
                                      })}
                                      className="w-full px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px] border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                      title="Xem trước mẫu văn bản & nội dung quy định"
                                    >
                                      <Eye className="w-3 h-3 text-slate-500" />
                                      <span>Xem Mẫu</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* GIAO DIỆN THẺ (CARDS) TỐI ƯU ĐẶC BIỆT CHO ĐIỆN THOẠI DI ĐỘNG (Mobile: md:hidden) */}
                      <div className="md:hidden p-3 space-y-3 bg-slate-50/50">
                        {group.items.map(({ item, status }, index) => {
                          const isUrgent = status.color === 'RED';
                          const isGray = status.color === 'GRAY';

                          return (
                            <div 
                              key={item.id}
                              className={`p-3.5 rounded-2xl bg-white border transition-all space-y-3 shadow-xs ${
                                isUrgent ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                              }`}
                            >
                              {/* Header thẻ: STT, Mã, Lĩnh vực & Trạng thái */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                                    {item.linhVuc}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {item.id}
                                  </span>
                                </div>

                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.badgeClass}`}>
                                  {status.label}
                                </span>
                              </div>

                              {/* Tên thủ tục & nội dung */}
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                                  {item.tenThuTuc}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                  {item.noiDung}
                                </p>
                              </div>

                              {/* Hạn nộp & Cơ quan */}
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Cơ quan nhận:</span>
                                  <span className="font-semibold text-slate-800 truncate block">{item.coQuanTiepNhan}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Hạn tiếp theo:</span>
                                  <span className="font-bold font-mono text-indigo-700 block">{item.ngayHetHanTiepTheo}</span>
                                </div>
                              </div>

                              {/* Mức phạt nếu có */}
                              <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-200 text-[11px]">
                                <span className="font-bold text-rose-800 block text-[10px] uppercase">Mức phạt vi phạm:</span>
                                <span className="font-black text-rose-700 text-xs">{item.mucPhat}</span>
                              </div>

                              {/* 3 Nút thao tác nhanh trên mobile */}
                              <div className="grid grid-cols-3 gap-1.5 pt-1">
                                <button
                                  onClick={() => setEditRowReport({ ...item })}
                                  className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Sửa Dòng</span>
                                </button>

                                <button
                                  onClick={() => handleOpenSubmissionModal(item)}
                                  className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Nộp / Lưu</span>
                                </button>

                                <button
                                  onClick={() => setViewerModalState({
                                    isOpen: true,
                                    title: item.tenThuTuc,
                                    subTitle: `Cơ quan: ${item.coQuanTiepNhan}`,
                                    fileType: 'WORD',
                                    fileUrl: item.linkMau || 'https://thuvienphapluat.vn',
                                    metadata: {
                                      coQuanTiepNhan: item.coQuanTiepNhan,
                                      canBoGui: item.phuTrach,
                                      dotBaoCao: item.tanSuatThoiHan,
                                      ghiChu: item.ghiChu
                                    }
                                  })}
                                  className="py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Xem Mẫu</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. Modal Cập Nhật Đợt Nộp Báo Cáo */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-3 space-y-1.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Cập Nhật Hồ Sơ Nộp Báo Cáo</span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{editingReport.tenThuTuc}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cơ quan nhận: {editingReport.coQuanTiepNhan}</p>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Đợt Báo Cáo / Kỳ Nộp *</label>
                <input
                  type="text"
                  value={submissionForm.dotBaoCao}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, dotBaoCao: e.target.value })}
                  placeholder="VD: Kỳ 6 tháng đầu năm 2026"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày Gửi Báo Cáo Thực Tế *</label>
                <input
                  type="date"
                  value={submissionForm.ngayGui}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, ngayGui: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số Hiệu Công Văn / Mã Hồ Sơ</label>
                <input
                  type="text"
                  value={submissionForm.soCongVan}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, soCongVan: e.target.value })}
                  placeholder="VD: CV-01/2026/HRM-AV"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cán Bộ Phụ Trách Gửi</label>
                <input
                  type="text"
                  value={submissionForm.canBoGui}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, canBoGui: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Cán Bộ / Ô Thông Tin Liên Hệ Nhận Báo Cáo Tại CQNN</label>
                <input
                  type="text"
                  value={submissionForm.nguoiNhanLienHe}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, nguoiNhanLienHe: e.target.value })}
                  placeholder="VD: Đ/c Trần Văn Hùng - Bộ phận Tiếp nhận Sở Nội vụ (ĐT: 028.3822xxxx)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Link File Word / Excel */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đường Link File Word / Excel Đã Gửi (Google Drive / OneDrive)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Chỉ lưu link, không tải file nặng web</span>
                </label>
                <input
                  type="text"
                  value={submissionForm.linkWordExcel}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, linkWordExcel: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-indigo-700"
                />
              </div>

              {/* Link File PDF Có Chữ Ký / Mộc Đỏ */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-rose-600" />
                    <span>Đường Link File PDF Có Ký Tên / Đóng Dấu / Biên Nhận Điện Tử</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Bấm vào sẽ xem trực tiếp</span>
                </label>
                <input
                  type="text"
                  value={submissionForm.linkPdf}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, linkPdf: e.target.value })}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-indigo-700"
                />
              </div>

              {/* Link Video nếu có */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Đường Link Video / Hình Ảnh Bằng Chứng Hiện Trường (Nếu có)
                </label>
                <input
                  type="text"
                  value={submissionForm.linkVideo}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, linkVideo: e.target.value })}
                  placeholder="VD: Link video diễn tập PCCC, quan trắc môi trường..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Ghi Chú Tiếp Nhận &amp; Khuyến Nghị</label>
                <textarea
                  rows={2}
                  value={submissionForm.ghiChu}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, ghiChu: e.target.value })}
                  placeholder="Ghi nhận phản hồi từ cơ quan tiếp nhận hoặc lưu ý cho kỳ tiếp theo..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setEditingReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleSaveSubmission}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Hồ Sơ Nộp &amp; Đổi Sang Xanh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Chỉnh Sửa Toàn Bộ Thông Tin Của 1 Dòng Thủ Tục (Cách 1) */}
      {editRowReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-3 space-y-1.5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5" />
                  Chỉnh Sửa Toàn Bộ Thông Tin Thủ Tục ({editRowReport.id})
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  STT {editRowReport.stt}: {editRowReport.tenThuTuc}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có thể cập nhật mọi thông tin: Tên thủ tục, cơ quan tiếp nhận, hạn nộp, mức phạt, căn cứ pháp lý, biểu mẫu...
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditRowReport(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRow} className="space-y-1.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Tên hạng mục báo cáo / thủ tục */}
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên Thủ Tục / Hạng Mục Báo Cáo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editRowReport.tenThuTuc}
                    onChange={(e) => setEditRowReport({ ...editRowReport, tenThuTuc: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
                  />
                </div>

                {/* 2. Lĩnh vực */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lĩnh Vực</label>
                  <input
                    type="text"
                    value={editRowReport.linhVuc}
                    onChange={(e) => setEditRowReport({ ...editRowReport, linhVuc: e.target.value })}
                    placeholder="VD: LĐ - Tiền Lương, An Toàn VSLĐ..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 3. Cơ quan tiếp nhận */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cơ Quan Tiếp Nhận *</label>
                  <input
                    type="text"
                    required
                    value={editRowReport.coQuanTiepNhan}
                    onChange={(e) => setEditRowReport({ ...editRowReport, coQuanTiepNhan: e.target.value })}
                    placeholder="VD: Sở LĐTBXH / BHXH / Sở Nội Vụ..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 4. Tần suất / Hạn nộp */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tần Suất &amp; Hạn Nộp *</label>
                  <input
                    type="text"
                    required
                    value={editRowReport.tanSuatThoiHan}
                    onChange={(e) => setEditRowReport({ ...editRowReport, tanSuatThoiHan: e.target.value })}
                    placeholder="VD: Hằng năm trước 15/01..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 5. Ngày hết hạn kỳ tới */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày Hết Hạn Tiếp Theo *</label>
                  <input
                    type="date"
                    required
                    value={editRowReport.ngayHetHanTiepTheo}
                    onChange={(e) => setEditRowReport({ ...editRowReport, ngayHetHanTiepTheo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-indigo-700"
                  />
                </div>

                {/* 6. Áp dụng cho công ty */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Áp Dụng Cho Công Ty</label>
                  <select
                    value={editRowReport.apDung}
                    onChange={(e) => setEditRowReport({ ...editRowReport, apDung: e.target.value as GovReportApDung })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="CO">Có Áp Dụng</option>
                    <option value="KHONG">Không Áp Dụng (Bỏ qua)</option>
                  </select>
                </div>

                {/* 7. Trạng thái nộp */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tình Trạng Nộp Kỳ Hiện Tại</label>
                  <select
                    value={editRowReport.trangThaiThuTuc}
                    onChange={(e) => setEditRowReport({ ...editRowReport, trangThaiThuTuc: e.target.value as 'CHUA_NOP' | 'DA_NOP' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="CHUA_NOP">Chưa Nộp (Tính hạn theo ngày)</option>
                    <option value="DA_NOP">Đã Nộp (Chuyển xanh an toàn)</option>
                  </select>
                </div>

                {/* 8. Cán bộ / Bộ phận phụ trách */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cán Bộ / Bộ Phận Phụ Trách</label>
                  <input
                    type="text"
                    value={editRowReport.phuTrach}
                    onChange={(e) => setEditRowReport({ ...editRowReport, phuTrach: e.target.value })}
                    placeholder="VD: Phòng Nhân sự, An toàn viên..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 9. Mức phạt */}
                <div>
                  <label className="font-bold text-rose-700 block mb-1">Mức Phạt Vi Phạm</label>
                  <input
                    type="text"
                    value={editRowReport.mucPhat}
                    onChange={(e) => setEditRowReport({ ...editRowReport, mucPhat: e.target.value })}
                    placeholder="VD: Phạt 2.000.000 - 6.000.000 đ"
                    className="w-full p-2.5 bg-rose-50/50 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-semibold text-rose-800"
                  />
                </div>

                {/* 10. Điều khoản phạt */}
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Điều Khoản Xử Phạt</label>
                  <input
                    type="text"
                    value={editRowReport.dieuKhoanPhat}
                    onChange={(e) => setEditRowReport({ ...editRowReport, dieuKhoanPhat: e.target.value })}
                    placeholder="VD: Khoản 1 Điều 8 Nghị định 12/2022/NĐ-CP"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 11. Biểu mẫu */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên Biểu Mẫu Quy Định</label>
                  <input
                    type="text"
                    value={editRowReport.bieuMau}
                    onChange={(e) => setEditRowReport({ ...editRowReport, bieuMau: e.target.value })}
                    placeholder="VD: Mẫu số 01/PLI Nghị định 145/2020/NĐ-CP"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  />
                </div>

                {/* 12. Link mẫu */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Link Xem / Tải Biểu Mẫu (URL)</label>
                  <input
                    type="text"
                    value={editRowReport.linkMau}
                    onChange={(e) => setEditRowReport({ ...editRowReport, linkMau: e.target.value })}
                    placeholder="https://thuvienphapluat.vn/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-indigo-700"
                  />
                </div>

                {/* 13. Link phạt */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Link Văn Bản Phạt Thư Viện Pháp Luật (URL)</label>
                  <input
                    type="text"
                    value={editRowReport.linkPhat}
                    onChange={(e) => setEditRowReport({ ...editRowReport, linkPhat: e.target.value })}
                    placeholder="https://thuvienphapluat.vn/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-indigo-700"
                  />
                </div>

                {/* 14. Căn cứ pháp lý */}
                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">Căn Cứ Pháp Lý Điều Chỉnh *</label>
                  <input
                    type="text"
                    required
                    value={editRowReport.canCu}
                    onChange={(e) => setEditRowReport({ ...editRowReport, canCu: e.target.value })}
                    placeholder="VD: Điều 12 Bộ luật Lao động 2019, Điều 4 Nghị định 145/2020/NĐ-CP"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                {/* 15. Nội dung chi tiết */}
                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">Nội Dung Chi Tiết Hướng Dẫn Thực Hiện *</label>
                  <textarea
                    rows={3}
                    required
                    value={editRowReport.noiDung}
                    onChange={(e) => setEditRowReport({ ...editRowReport, noiDung: e.target.value })}
                    placeholder="Mô tả cụ thể hồ sơ gồm những gì, gửi qua cổng dịch vụ công hay nộp trực tiếp..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium leading-relaxed"
                  />
                </div>

                {/* 16. Ghi chú nghiệp vụ */}
                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">Ghi Chú Nghiệp Vụ &amp; Kinh Nghiệm Thực Tế</label>
                  <textarea
                    rows={2}
                    value={editRowReport.ghiChu}
                    onChange={(e) => setEditRowReport({ ...editRowReport, ghiChu: e.target.value })}
                    placeholder="Ghi chú lưu ý khi thực hiện thủ tục này tại địa phương..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditRowReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi Dòng Này</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal Xem Trực Tiếp Nội Dung File */}
      <FileViewerModal
        isOpen={viewerModalState.isOpen}
        onClose={() => setViewerModalState({ ...viewerModalState, isOpen: false })}
        title={viewerModalState.title}
        subTitle={viewerModalState.subTitle}
        fileType={viewerModalState.fileType}
        fileUrl={viewerModalState.fileUrl}
        metadata={viewerModalState.metadata}
        customContent={viewerModalState.customContent}
      />
    </div>
  );
};
