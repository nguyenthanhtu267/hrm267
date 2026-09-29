import React, { useState, useEffect, useMemo } from 'react';
import { 
  SmartBadgeConfig, 
  BadgeReissueRequest, 
  generateZaloBadgeQR, 
  cleanVietnamesePhone, 
  getZaloProfileUrl,
  initialSmartBadges
} from '../services/smartBadgeService';
import { 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  X, 
  FileText, 
  Sparkles, 
  UserCheck, 
  Layers, 
  CreditCard,
  Crown,
  Search,
  UserPlus,
  ArrowUpDown,
  Car,
  Utensils,
  Lock,
  Building,
  Check,
  Smartphone,
  Copy
} from 'lucide-react';

interface SmartBadgePrintingHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'NEW_EMPLOYEES' | 'REISSUE_REQUESTS';
  initialBadgeToView?: SmartBadgeConfig | null;
  allBadges?: SmartBadgeConfig[];
  reissueRequests?: BadgeReissueRequest[];
  onUpdateRequests?: (requests: BadgeReissueRequest[]) => void;
  companyName?: string;
}

export const SmartBadgePrintingHubModal: React.FC<SmartBadgePrintingHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'NEW_EMPLOYEES',
  initialBadgeToView = null,
  allBadges = Object.values(initialSmartBadges),
  reissueRequests: propReissueRequests,
  onUpdateRequests,
  companyName = 'An Việt Manufacturing'
}) => {
  // 1. Quản lý Tab chính: NEW_EMPLOYEES (Mục 1) | REISSUE_REQUESTS (Mục 2) | BATCH_PRINT_A4 | SINGLE_PREVIEW | BLACKLIST
  const [activeTab, setActiveTab] = useState<'NEW_EMPLOYEES' | 'REISSUE_REQUESTS' | 'BATCH_PRINT_A4' | 'SINGLE_PREVIEW' | 'BLACKLIST'>(
    initialBadgeToView ? 'SINGLE_PREVIEW' : initialTab
  );

  // 2. Danh sách thẻ & trạng thái in
  const [badgeList, setBadgeList] = useState<SmartBadgeConfig[]>(allBadges);
  const [reissueList, setReissueList] = useState<BadgeReissueRequest[]>(propReissueRequests || []);

  // 3. Định dạng thẻ toàn cục: THẺ ĐỨNG vs THẺ NGANG
  const [globalOrientation, setGlobalOrientation] = useState<'VERTICAL' | 'HORIZONTAL'>('VERTICAL');

  // 4. Thẻ đang xem trước (Single Preview)
  const [previewBadge, setPreviewBadge] = useState<SmartBadgeConfig>(
    initialBadgeToView || allBadges[0]
  );
  const [cardSide, setCardSide] = useState<'FRONT' | 'BACK' | 'BOTH'>('BOTH');

  // 5. Thẻ được chọn để in hàng loạt A4
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<Set<string>>(new Set(['NH-VIP-01', 'NH-EMP-01', 'NH-EMP-02']));

  // 6. Cache QR code
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  // 7. Bộ lọc tìm kiếm
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPrintStatus, setFilterPrintStatus] = useState<'ALL' | 'NOT_PRINTED' | 'PRINTED'>('ALL');

  // 8. Sổ đen RFID đã vô hiệu hóa
  const [blacklistedCards, setBlacklistedCards] = useState<Array<{ rfid: string; name: string; code: string; date: string; reason: string }>>([
    { rfid: 'RFID-8822-3344-OLD', name: 'BÀ NGUYỄN THU HÀ', code: 'AV-0891', date: '09/09/2026 08:15', reason: 'Báo mất thẻ trên đường đi làm' },
    { rfid: 'RFID-9988-1122-OLD', name: 'ÔNG LÊ HOÀNG NAM', code: 'AV-0755', date: '05/09/2026 17:30', reason: 'Rơi mất tại bãi xe siêu thị' }
  ]);

  // Sinh mã QR Zalo cho tất cả thẻ
  useEffect(() => {
    let isMounted = true;
    const generateAllQrs = async () => {
      const qrs: Record<string, string> = {};
      for (const badge of badgeList) {
        if (!qrMap[badge.employeeId]) {
          const url = await generateZaloBadgeQR(badge.phone);
          if (isMounted) {
            qrs[badge.employeeId] = url;
          }
        }
      }
      if (isMounted && Object.keys(qrs).length > 0) {
        setQrMap(prev => ({ ...prev, ...qrs }));
      }
    };
    generateAllQrs();
    return () => { isMounted = false; };
  }, [badgeList]);

  // Cập nhật khi có initialBadgeToView
  useEffect(() => {
    if (initialBadgeToView) {
      setPreviewBadge(initialBadgeToView);
      setGlobalOrientation(initialBadgeToView.orientation || 'VERTICAL');
      setActiveTab('SINGLE_PREVIEW');
    }
  }, [initialBadgeToView]);

  if (!isOpen) return null;

  // Xử lý chọn/bỏ chọn in hàng loạt
  const handleToggleSelectBadge = (id: string) => {
    setSelectedBadgeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllBadges = () => {
    if (selectedBadgeIds.size === badgeList.length) {
      setSelectedBadgeIds(new Set());
    } else {
      setSelectedBadgeIds(new Set(badgeList.map(b => b.employeeId)));
    }
  };

  // Đánh dấu đã in thẻ cho nhân viên
  const handleMarkAsPrinted = (badgeId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setBadgeList(prev => prev.map(b => {
      if (b.employeeId === badgeId) {
        return {
          ...b,
          printStatus: 'PRINTED',
          printedDate: timeStr
        };
      }
      return b;
    }));
  };

  // HR duyệt mắt thường cấp lại thẻ
  const handleVerifyReissue = (reqId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setReissueList(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          hrVisualVerified: true,
          hrVerifiedBy: 'HR Chuyên viên (Đã đối chiếu mắt thường)',
          hrVerifiedDate: timeStr,
          status: 'READY_TO_PRINT' as const,
        };
      }
      return r;
    }));
  };

  // Mở in lẻ cho 1 thẻ
  const handleOpenSinglePreview = (badge: SmartBadgeConfig, orientation?: 'VERTICAL' | 'HORIZONTAL') => {
    setPreviewBadge(badge);
    if (orientation) setGlobalOrientation(orientation);
    setActiveTab('SINGLE_PREVIEW');
  };

  // Chuyển sang in hàng loạt A4
  const handleOpenBatchA4Print = (orientation?: 'VERTICAL' | 'HORIZONTAL') => {
    if (orientation) setGlobalOrientation(orientation);
    setActiveTab('BATCH_PRINT_A4');
  };

  // Danh sách nhân viên lọc theo tab 1
  const filteredNewHiresBadges = badgeList.filter(b => {
    if (filterPrintStatus === 'NOT_PRINTED' && b.printStatus === 'PRINTED') return false;
    if (filterPrintStatus === 'PRINTED' && b.printStatus !== 'PRINTED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        b.fullName.toLowerCase().includes(q) ||
        b.employeeCode.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.department.toLowerCase().includes(q) ||
        b.position.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Số lượng đếm
  const notPrintedCount = badgeList.filter(b => b.printStatus === 'NOT_PRINTED').length;
  const printedCount = badgeList.filter(b => b.printStatus === 'PRINTED').length;
  const pendingReissueCount = reissueList.filter(r => r.status === 'PENDING_HR_CHECK').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden relative print:max-h-none print:shadow-none print:border-none">
        
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black flex items-center justify-center shadow-lg">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Trung Tâm Quản Lý &amp; In Thẻ Nhân Viên Thông Minh
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  CR-80 &amp; A4
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Phân định rõ: <b>Mục 1 (Nhân viên mới chưa từng in)</b> &amp; <b>Mục 2 (Cấp lại thẻ mất/hỏng)</b> • Hỗ trợ cả <b>Thẻ Đứng &amp; Thẻ Ngang</b>
              </p>
            </div>
          </div>

          {/* Công tắc Định dạng Thẻ & Nút đóng */}
          <div className="flex items-center space-x-3">
            {/* Công tắc THẺ ĐỨNG vs THẺ NGANG */}
            <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700 flex items-center">
              <button
                type="button"
                onClick={() => setGlobalOrientation('VERTICAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  globalOrientation === 'VERTICAL'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Định dạng thẻ dọc chuẩn CR-80 (54 x 86 mm) - Phổ biến đeo dây xưởng & kỹ sư"
              >
                <span>🏷️ Thẻ Đứng (54x86mm)</span>
              </button>
              <button
                type="button"
                onClick={() => setGlobalOrientation('HORIZONTAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  globalOrientation === 'HORIZONTAL'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Định dạng thẻ ngang chuẩn CR-80 (86 x 54 mm) - Phổ biến kẹp áo văn phòng & quản lý"
              >
                <span>💳 Thẻ Ngang (86x54mm)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================== THANH ĐIỀU HƯỚNG TABS ===================== */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 flex space-x-2 overflow-x-auto print:hidden">
          {/* MỤC 1: NHÂN VIÊN MỚI CHƯA IN */}
          <button
            type="button"
            onClick={() => setActiveTab('NEW_EMPLOYEES')}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-t border-x cursor-pointer ${
              activeTab === 'NEW_EMPLOYEES'
                ? 'bg-white text-indigo-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-indigo-700 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <span>Mục 1: Nhân Viên Mới Chưa Từng In ({notPrintedCount})</span>
            {notPrintedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black animate-pulse">
                Cần In
              </span>
            )}
          </button>

          {/* MỤC 2: CẤP LẠI THẺ */}
          <button
            type="button"
            onClick={() => setActiveTab('REISSUE_REQUESTS')}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-t border-x cursor-pointer ${
              activeTab === 'REISSUE_REQUESTS'
                ? 'bg-white text-teal-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-teal-700 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-teal-600" />
            <span>Mục 2: Đề Nghị Cấp Lại Thẻ (Mất/Hỏng) ({reissueList.length})</span>
            {pendingReissueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-slate-950 font-black">
                {pendingReissueCount} Chờ Duyệt
              </span>
            )}
          </button>

          {/* XEM & IN LẺ */}
          <button
            type="button"
            onClick={() => setActiveTab('SINGLE_PREVIEW')}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-t border-x cursor-pointer ${
              activeTab === 'SINGLE_PREVIEW'
                ? 'bg-white text-purple-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-purple-700 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Eye className="w-4 h-4 text-purple-600" />
            <span>Xem &amp; In Thẻ Đơn Lẻ (CR-80)</span>
          </button>

          {/* DÀN TRANG IN HÀNG LOẠT A4 */}
          <button
            type="button"
            onClick={() => setActiveTab('BATCH_PRINT_A4')}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-t border-x cursor-pointer ${
              activeTab === 'BATCH_PRINT_A4'
                ? 'bg-white text-emerald-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Dàn Trang In Hàng Loạt A4 (8 Thẻ/Trang)</span>
          </button>

          {/* SỔ ĐEN VÔ HIỆU HÓA */}
          <button
            type="button"
            onClick={() => setActiveTab('BLACKLIST')}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all flex items-center space-x-2 border-t border-x cursor-pointer ${
              activeTab === 'BLACKLIST'
                ? 'bg-white text-rose-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-rose-700 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Sổ Đen Thẻ Đã Vô Hiệu Hóa ({blacklistedCards.length})</span>
          </button>
        </div>

        {/* ===================== NỘI DUNG TỪNG TAB ===================== */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          
          {/* ═════════════════════════════════════════════════════════════ */}
          {/* TAB 1: MỤC 1 - NHÂN VIÊN MỚI CHƯA TỪNG IN THẺ                  */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'NEW_EMPLOYEES' && (
            <div className="space-y-4">
              
              {/* Banner hướng dẫn nghiệp vụ */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-indigo-950 font-black">
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    <span>MỤC 1: QUẢN LÝ CẤP THẺ LẦN ĐẦU CHO NHÂN VIÊN MỚI TIẾP NHẬN</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    • <b>Nguyên tắc Poka-Yoke:</b> Hệ thống tự động phân biệt nhân sự <b>Chưa In Thẻ</b> và <b>Đã In Thẻ</b>.<br />
                    • HR có thể bấm <b>In Thẻ Lẻ (CR-80)</b> cho từng người hoặc tick chọn nhiều người để <b>In Hàng Loạt Khổ A4 (8 thẻ/trang)</b>.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenBatchA4Print(globalOrientation)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In Hàng Loạt A4 ({selectedBadgeIds.size} Thẻ Đã Chọn)</span>
                  </button>
                </div>
              </div>

              {/* Thanh tìm kiếm & bộ lọc trạng thái in */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">Trạng thái in:</span>
                  <div className="inline-flex p-0.5 bg-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFilterPrintStatus('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterPrintStatus === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Tất Cả ({badgeList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterPrintStatus('NOT_PRINTED')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterPrintStatus === 'NOT_PRINTED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Chưa In Thẻ ({notPrintedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterPrintStatus('PRINTED')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterPrintStatus === 'PRINTED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Đã In Thẻ ({printedCount})
                    </button>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, mã NV, phòng ban..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full py-1.5 pl-8 pr-3 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
                  />
                </div>
              </div>

              {/* Bảng danh sách nhân viên mới */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10.5px] border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedBadgeIds.size === badgeList.length && badgeList.length > 0}
                          onChange={handleSelectAllBadges}
                          className="rounded text-indigo-600 cursor-pointer"
                        />
                      </th>
                      <th className="p-3">Họ Và Tên / Mã NV</th>
                      <th className="p-3">Chức Vụ &amp; Phòng Ban</th>
                      <th className="p-3">Cấu Hình Thẻ Từ RFID / QR Zalo</th>
                      <th className="p-3 text-center">Kiểu Thẻ</th>
                      <th className="p-3 text-center">Trạng Thái In</th>
                      <th className="p-3 text-right">Hành Động HR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredNewHiresBadges.map(badge => {
                      const isSelected = selectedBadgeIds.has(badge.employeeId);
                      const isPrinted = badge.printStatus === 'PRINTED';

                      return (
                        <tr key={badge.employeeId} className={`hover:bg-indigo-50/40 transition-colors ${isSelected ? 'bg-indigo-50/60' : ''}`}>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectBadge(badge.employeeId)}
                              className="rounded text-indigo-600 cursor-pointer"
                            />
                          </td>

                          <td className="p-3">
                            <div className="flex items-center space-x-2.5">
                              <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                                badge.isManagerLevel ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {badge.avatarInitial || badge.fullName.slice(-2)}
                              </div>
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-extrabold text-slate-900 text-xs uppercase">{badge.fullName}</span>
                                  {badge.isManagerLevel && (
                                    <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                                  )}
                                </div>
                                <span className="font-mono text-[10.5px] text-indigo-700 font-bold">{badge.employeeCode}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            <p className="font-bold text-slate-800 text-xs">{badge.position}</p>
                            <p className="text-[10.5px] text-slate-500">{badge.department}</p>
                          </td>

                          <td className="p-3">
                            <div className="space-y-0.5 text-[10.5px]">
                              <div className="flex items-center space-x-1 text-slate-700">
                                <CreditCard className="w-3 h-3 text-emerald-600" />
                                <span className="font-mono font-bold text-emerald-800">{badge.rfidUid}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-500">
                                <span>Zalo SĐT: <b className="font-mono text-slate-800">{badge.phone}</b></span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setBadgeList(prev => prev.map(b => b.employeeId === badge.employeeId ? {
                                  ...b,
                                  orientation: b.orientation === 'VERTICAL' ? 'HORIZONTAL' : 'VERTICAL'
                                } : b));
                              }}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-300 hover:bg-slate-100 cursor-pointer"
                              title="Bấm để đổi kiểu thẻ Đứng / Ngang"
                            >
                              {badge.orientation === 'HORIZONTAL' ? '💳 Thẻ Ngang' : '🏷️ Thẻ Đứng'}
                            </button>
                          </td>

                          <td className="p-3 text-center">
                            {isPrinted ? (
                              <div>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-[10px]">
                                  ✓ Đã In Thẻ
                                </span>
                                <span className="text-[9.5px] text-slate-400 block mt-0.5">{badge.printedDate}</span>
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px]">
                                ⏳ Chưa In Thẻ
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenSinglePreview(badge, badge.orientation || globalOrientation)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem &amp; In Lẻ</span>
                              </button>

                              {!isPrinted && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsPrinted(badge.employeeId)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs border border-emerald-300 cursor-pointer"
                                  title="Đánh dấu đã in xong thẻ và giao cho nhân sự"
                                >
                                  ✓ Xong
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredNewHiresBadges.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-xs text-slate-400 italic">
                          Không tìm thấy nhân viên nào phù hợp với điều kiện tìm kiếm.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* TAB 2: MỤC 2 - ĐỀ NGHỊ CẤP LẠI THẺ (MẤT THẺ / HỎNG CHIP)       */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'REISSUE_REQUESTS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-teal-950 font-black">
                    <RefreshCw className="w-4 h-4 text-teal-600" />
                    <span>MỤC 2: QUY TRÌNH TIẾP NHẬN &amp; CẤP LẠI THẺ (MẤT THẺ / HỎNG CHIP)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    • <b>Phí in thẻ 10.000đ:</b> Nhân viên đóng trực tiếp tiền mặt ngoài quầy cho thủ quỹ (không cần ghi nhận bảng lương).<br />
                    • <b>HR kiểm tra mắt thường:</b> Đối chiếu diện mạo nhân viên để xác nhận danh tính trước khi cấp phôi thẻ mới. Thẻ cũ sẽ tự động bị vô hiệu hóa (Blacklist).
                  </p>
                </div>
              </div>

              {/* Danh sách đề nghị cấp lại */}
              <div className="space-y-3">
                {reissueList.map((req) => {
                  const isVerified = req.hrVisualVerified;

                  return (
                    <div 
                      key={req.id}
                      className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-teal-300 transition-all"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300">
                            Đề Nghị #{req.id}
                          </span>
                          <span className="text-xs font-black text-slate-900 uppercase">
                            {req.fullName} ({req.employeeCode})
                          </span>
                          <span className="text-xs text-slate-500">
                            • {req.position} ({req.department})
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center space-x-2 text-slate-700">
                            <span className="font-bold text-rose-700">Lý do xin cấp lại:</span>
                            <span>{req.reasonLabel}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span>Tiền phí in thẻ: <b className="text-emerald-700 font-bold">10.000 VNĐ</b> (Đã nộp tiền mặt thủ quỹ)</span>
                            <span className="font-mono">Ngày gửi đề nghị: {req.requestDate}</span>
                          </div>
                        </div>

                        {/* Trạng thái duyệt mắt thường */}
                        <div className="flex items-center space-x-2 text-xs">
                          {isVerified ? (
                            <span className="text-emerald-700 font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Đã kiểm tra mắt thường bởi: <b>{req.hrVerifiedBy}</b> ({req.hrVerifiedDate})</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span>Chưa đối chiếu mắt thường. Vui lòng kiểm tra nhân diện trước khi in!</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hành động HR */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {!isVerified && (
                          <button
                            type="button"
                            onClick={() => handleVerifyReissue(req.id)}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Xác Nhận Mắt Thường</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenSinglePreview(req.badgeConfig, globalOrientation)}
                          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer transition-all"
                        >
                          <Printer className="w-4 h-4" />
                          <span>In Thẻ Cấp Lại (Đứng/Ngang)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {reissueList.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    Hiện không có đề nghị cấp lại thẻ nào đang chờ xử lý.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* TAB 3: XEM & IN THẺ ĐƠN LẺ (CHUẨN PHÔI CR-80)                   */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'SINGLE_PREVIEW' && previewBadge && (
            <div className="space-y-4">
              
              {/* Thanh điều khiển xem trước & in */}
              <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-700 uppercase">Xem trước nhân sự:</span>
                  <select
                    value={previewBadge.employeeId}
                    onChange={e => {
                      const b = badgeList.find(item => item.employeeId === e.target.value);
                      if (b) setPreviewBadge(b);
                    }}
                    className="p-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs"
                  >
                    {badgeList.map(b => (
                      <option key={b.employeeId} value={b.employeeId}>
                        {b.fullName} ({b.employeeCode} - {b.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Chuyển Đứng / Ngang */}
                  <div className="inline-flex p-0.5 bg-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setGlobalOrientation('VERTICAL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        globalOrientation === 'VERTICAL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700'
                      }`}
                    >
                      🏷️ Thẻ Đứng
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlobalOrientation('HORIZONTAL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        globalOrientation === 'HORIZONTAL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700'
                      }`}
                    >
                      💳 Thẻ Ngang
                    </button>
                  </div>

                  {/* Nút In Trực Tiếp */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In Phôi Thẻ Lẻ Này</span>
                  </button>
                </div>
              </div>

              {/* KHU VỰC HIỂN THỊ PHÔI THẺ CHUẨN IN ẤN (CR-80) */}
              <div className="bg-slate-900/90 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[460px]">
                
                {/* 1. HIỂN THỊ THẺ ĐỨNG (VERTICAL: 54 x 86 mm) - CHUẨN 1 MẶT DUY NHẤT */}
                {globalOrientation === 'VERTICAL' && (
                  <div className="flex items-center justify-center">
                    {/* THẺ ĐỨNG 1 MẶT DUY NHẤT: ĐẦY ĐỦ LOGO, ẢNH, HỌ TÊN, CHỨC VỤ, PHÒNG BAN, RFID & MÃ QR ZALO */}
                    <div className="w-[270px] h-[430px] rounded-2xl shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden bg-white text-slate-900 border-2 border-indigo-200 select-none">
                      {/* Dải nhận diện thương hiệu trên cùng */}
                      <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800" />

                      {/* Header Logo */}
                      <div className="pt-1.5 flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px] text-white bg-indigo-700">
                            AV
                          </div>
                          <span className="font-black text-xs uppercase tracking-wider text-slate-900">
                            {companyName}
                          </span>
                        </div>
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          THẺ NHÂN VIÊN
                        </span>
                      </div>

                      {/* Khối Ảnh Chân Dung 3x4 + Mã Nhân Viên */}
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-20 h-24 rounded-xl flex items-center justify-center font-black text-2xl shadow-sm border border-slate-300 bg-slate-100 text-slate-800">
                          {previewBadge.avatarInitial || previewBadge.fullName.slice(-2)}
                        </div>
                        <span className="font-mono text-[10px] font-black text-indigo-700 mt-1">
                          {previewBadge.employeeCode}
                        </span>
                      </div>

                      {/* Khối Họ Tên, Chức Vụ, Phòng Ban */}
                      <div className="text-center space-y-0.5 px-1">
                        <h3 className="font-black text-sm uppercase text-slate-900 leading-tight">
                          {previewBadge.fullName}
                        </h3>
                        <p className="text-[11px] font-bold text-indigo-700 leading-tight">
                          {previewBadge.position}
                        </p>
                        <p className="text-[9.5px] font-semibold text-slate-500">
                          {previewBadge.department}
                        </p>
                      </div>

                      {/* Khối Mã QR Zalo Kích Thước Vừa Phải (20x20mm) & Thông Tin Chip RFID */}
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[8px] text-slate-400 block font-bold uppercase">CHIP RA VÀO / CHẤM CÔNG</span>
                          <span className="font-mono text-[9px] text-emerald-700 font-bold block">
                            {previewBadge.rfidUid}
                          </span>
                          <span className="text-[8px] text-slate-500 block font-medium">
                            Hạn thẻ: {previewBadge.expiryDate}
                          </span>
                          <span className="font-mono text-[8.5px] text-slate-700 font-bold block">
                            Zalo: {previewBadge.phone}
                          </span>
                        </div>

                        {/* Mã QR Zalo kích thước vừa vặn */}
                        <div className="p-1 bg-white border border-slate-900 rounded-lg shadow-xs shrink-0">
                          {qrMap[previewBadge.employeeId] ? (
                            <img
                              src={qrMap[previewBadge.employeeId]}
                              alt="QR Zalo Badge"
                              className="w-16 h-16 object-contain rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded">
                              <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer chú thích nhỏ */}
                      <div className="text-center text-[7.5px] text-slate-400 border-t pt-1">
                        Quét mã QR bằng ứng dụng Zalo để liên hệ trực tiếp • Hotline HR: 028.3888.9999
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. HIỂN THỊ THẺ NGANG (HORIZONTAL: 86 x 54 mm) - CHUẨN 1 MẶT DUY NHẤT */}
                {globalOrientation === 'HORIZONTAL' && (
                  <div className="flex items-center justify-center">
                    {/* THẺ NGANG 1 MẶT DUY NHẤT: BỐ CỤC ĐỒNG NHẤT KHÔNG PHÂN BIỆT VỚI THẺ ĐỨNG */}
                    <div className="w-[420px] h-[265px] rounded-2xl shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden bg-white text-slate-900 border-2 border-indigo-200 select-none">
                      {/* Dải nhận diện thương hiệu trên cùng */}
                      <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800" />

                      {/* Header Ngang */}
                      <div className="flex items-center justify-between pt-1 border-b border-slate-100 pb-1.5">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px] text-white bg-indigo-700">
                            AV
                          </div>
                          <span className="font-black text-xs uppercase tracking-wider text-slate-900">
                            {companyName}
                          </span>
                        </div>
                        <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          THẺ NHÂN VIÊN
                        </span>
                      </div>

                      {/* Body Ngang: Chia 2 nửa đồng nhất nội dung với thẻ đứng */}
                      <div className="grid grid-cols-12 gap-3 items-center my-auto">
                        {/* Nửa trái: Ảnh chân dung + Mã nhân viên */}
                        <div className="col-span-4 flex flex-col items-center">
                          <div className="w-20 h-24 rounded-xl flex items-center justify-center font-black text-2xl shadow-sm border border-slate-300 bg-slate-100 text-slate-800">
                            {previewBadge.avatarInitial || previewBadge.fullName.slice(-2)}
                          </div>
                          <span className="font-mono text-[10px] font-black text-indigo-700 mt-1">
                            {previewBadge.employeeCode}
                          </span>
                        </div>

                        {/* Nửa phải: Thông tin nhân sự + QR Zalo vừa phải */}
                        <div className="col-span-8 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h3 className="font-black text-sm uppercase text-slate-900 leading-tight">
                              {previewBadge.fullName}
                            </h3>
                            <p className="text-[11px] font-bold text-indigo-700 leading-tight">
                              {previewBadge.position}
                            </p>
                            <p className="text-[9.5px] font-semibold text-slate-500 leading-tight">
                              {previewBadge.department}
                            </p>
                            <p className="font-mono text-[9px] text-emerald-700 font-bold pt-1">
                              RFID: {previewBadge.rfidUid}
                            </p>
                            <p className="text-[8px] text-slate-500 font-medium">
                              Hạn thẻ: {previewBadge.expiryDate}
                            </p>
                            <p className="font-mono text-[8.5px] text-slate-700 font-bold">
                              Zalo: {previewBadge.phone}
                            </p>
                          </div>

                          {/* QR Zalo kích thước vừa vặn */}
                          <div className="p-1 bg-white border border-slate-900 rounded-lg shadow-xs shrink-0 ml-2">
                            {qrMap[previewBadge.employeeId] ? (
                              <img
                                src={qrMap[previewBadge.employeeId]}
                                alt="QR Zalo"
                                className="w-18 h-18 object-contain rounded"
                              />
                            ) : (
                              <div className="w-18 h-18 bg-slate-100 rounded flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Ngang chú thích nhỏ */}
                      <div className="flex items-center justify-between text-[8px] text-slate-400 border-t pt-1">
                        <span>Quét mã QR bằng ứng dụng Zalo để liên hệ trực tiếp</span>
                        <span>Hotline HR: 028.3888.9999</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* TAB 4: DÀN TRANG IN HÀNG LOẠT KHỔ A4 (8 THẺ / TRANG)            */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'BATCH_PRINT_A4' && (
            <div className="space-y-4">
              
              {/* Thanh điều khiển in A4 */}
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:hidden">
                <div>
                  <h4 className="font-black text-slate-900 uppercase">
                    Dàn Trang In Hàng Loạt Khổ A4 (8 Thẻ / Trang)
                  </h4>
                  <p className="text-slate-500 mt-0.5">
                    Đang dàn trang <b>{selectedBadgeIds.size} thẻ</b> theo định dạng <b>{globalOrientation === 'VERTICAL' ? 'THẺ ĐỨNG (54x86mm)' : 'THẺ NGANG (86x54mm)'}</b> kèm đường viền cắt kéo nét đứt chuẩn.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="inline-flex p-0.5 bg-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setGlobalOrientation('VERTICAL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        globalOrientation === 'VERTICAL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700'
                      }`}
                    >
                      🏷️ Dàn 8 Thẻ Đứng
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlobalOrientation('HORIZONTAL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        globalOrientation === 'HORIZONTAL' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700'
                      }`}
                    >
                      💳 Dàn 8 Thẻ Ngang
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg flex items-center space-x-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In Ngay Khổ A4 (Ctrl+P)</span>
                  </button>
                </div>
              </div>

              {/* KHU VỰC IN TỜ A4 CHUẨN (PRINT CONTAINER) */}
              <div id="printable-a4-sheet" className="p-4 sm:p-6 bg-slate-200/60 rounded-3xl overflow-x-auto flex justify-center">
                <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[10mm] text-slate-900 border border-slate-300 print:w-full print:p-0 print:border-none print:shadow-none">
                  
                  {/* TIÊU ĐỀ TRANG IN */}
                  <div className="text-center pb-3 mb-3 border-b-2 border-slate-900 print:mb-2">
                    <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
                      BẢNG PHÔI IN THẺ NHÂN VIÊN THÔNG MINH • KHỔ A4 (8 THẺ / TRANG)
                    </h1>
                    <p className="text-[10px] text-slate-600 font-semibold">
                      {companyName} • Cắt theo đường viền nét đứt bên ngoài • Tích hợp Chip RFID &amp; Mã QR Zalo
                    </p>
                  </div>

                  {/* LƯỚI 8 THẺ TRÊN KHỔ A4 (2 CỘT X 4 HÀNG) */}
                  <div className={`grid ${globalOrientation === 'VERTICAL' ? 'grid-cols-2 gap-3' : 'grid-cols-2 gap-2.5'}`}>
                    {Array.from(selectedBadgeIds).map(id => {
                      const badge = badgeList.find(b => b.employeeId === id) || badgeList[0];
                      
                      return (
                        <div 
                          key={badge.employeeId} 
                          className={`border-2 border-dashed border-slate-400 p-2 rounded-xl flex items-center justify-center bg-white ${
                            globalOrientation === 'VERTICAL' ? 'h-[62mm]' : 'h-[36mm]'
                          }`}
                        >
                          {globalOrientation === 'VERTICAL' ? (
                            /* MINI THẺ ĐỨNG */
                            <div className="w-full h-full flex flex-col justify-between text-center p-1.5 border border-slate-300 rounded-lg bg-slate-50/50">
                              <div className="flex items-center justify-between border-b pb-1">
                                <span className="font-black text-[9px] uppercase">{companyName}</span>
                                <span className="font-mono text-[8.5px] font-bold text-indigo-700">{badge.employeeCode}</span>
                              </div>

                              <div className="my-auto flex items-center justify-around py-1">
                                <div className="w-12 h-14 bg-slate-200 border rounded-lg font-black text-base flex items-center justify-center">
                                  {badge.avatarInitial || badge.fullName.slice(-2)}
                                </div>

                                <div className="w-14 h-14 p-0.5 bg-white border border-slate-900 rounded-lg">
                                  {qrMap[badge.employeeId] ? (
                                    <img src={qrMap[badge.employeeId]} alt="QR" className="w-full h-full object-contain" />
                                  ) : (
                                    <div className="w-full h-full bg-slate-100" />
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-black text-[10.5px] uppercase text-slate-900 leading-tight">{badge.fullName}</h4>
                                <p className="text-[8.5px] font-bold text-indigo-700 leading-tight">{badge.position}</p>
                                <p className="text-[7.5px] text-slate-500">{badge.department}</p>
                              </div>
                            </div>
                          ) : (
                            /* MINI THẺ NGANG */
                            <div className="w-full h-full flex items-center justify-between p-1.5 border border-slate-300 rounded-lg bg-slate-50/50">
                              <div className="w-11 h-13 bg-slate-200 border rounded-lg font-black text-sm flex items-center justify-center shrink-0">
                                {badge.avatarInitial || badge.fullName.slice(-2)}
                              </div>

                              <div className="flex-1 px-2 text-left space-y-0.5">
                                <span className="font-mono text-[8px] font-bold text-indigo-700 block">{badge.employeeCode}</span>
                                <h4 className="font-black text-[10px] uppercase text-slate-900 leading-tight truncate">{badge.fullName}</h4>
                                <p className="text-[8px] font-bold text-indigo-700 leading-tight truncate">{badge.position}</p>
                                <p className="text-[7px] text-slate-500 truncate">{badge.department}</p>
                              </div>

                              <div className="w-12 h-12 p-0.5 bg-white border border-slate-900 rounded-lg shrink-0">
                                {qrMap[badge.employeeId] ? (
                                  <img src={qrMap[badge.employeeId]} alt="QR" className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full bg-slate-100" />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* TAB 5: SỔ ĐEN VÔ HIỆU HÓA THẺ CŨ (BLACKLIST)                    */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'BLACKLIST' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-rose-950 uppercase text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Sổ Đen An Ninh: Danh Sách Mã Chip RFID Đã Bị Vô Hiệu Hóa</span>
                  </h4>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Tất cả các thẻ từ bị báo mất hoặc gãy chip khi cấp lại sẽ bị khóa vĩnh viễn trên đầu đọc Barrier gửi xe, cửa từ phân xưởng và thang máy.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-mono font-bold text-xs">
                  {blacklistedCards.length} Thẻ Đã Khóa
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10.5px]">
                    <tr>
                      <th className="p-3">Mã Chip RFID Bị Khóa</th>
                      <th className="p-3">Nhân Viên Báo Mất</th>
                      <th className="p-3">Mã NV</th>
                      <th className="p-3">Thời Điểm Khóa</th>
                      <th className="p-3">Lý Do Khóa An Ninh</th>
                      <th className="p-3 text-center">Trạng Thái Đầu Đọc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {blacklistedCards.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-rose-700">{c.rfid}</td>
                        <td className="p-3 font-bold text-slate-900">{c.name}</td>
                        <td className="p-3 font-mono text-indigo-700 font-semibold">{c.code}</td>
                        <td className="p-3 text-slate-500 font-mono">{c.date}</td>
                        <td className="p-3 text-slate-700">{c.reason}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">
                            ⛔ ĐÃ CHẶN 100%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* ===================== FOOTER ===================== */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 print:hidden">
          <div>
            Hệ thống in thẻ tự động đồng bộ mã QR Zalo thực tế &amp; phân quyền thẻ từ 4-trong-1.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Đóng Trung Tâm In Thẻ
          </button>
        </div>

      </div>
    </div>
  );
};
