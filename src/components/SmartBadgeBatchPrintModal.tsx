import React, { useState, useEffect } from 'react';
import { SmartBadgeConfig, BadgeReissueRequest, generateZaloBadgeQR } from '../services/smartBadgeService';
import { Printer, ShieldCheck, CheckCircle2, AlertCircle, Eye, RefreshCw, X, FileText, Sparkles, UserCheck, Layers } from 'lucide-react';

interface SmartBadgeBatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  reissueRequests: BadgeReissueRequest[];
  onUpdateRequests: (requests: BadgeReissueRequest[]) => void;
  allBadges: SmartBadgeConfig[];
  companyName: string;
}

export const SmartBadgeBatchPrintModal: React.FC<SmartBadgeBatchPrintModalProps> = ({
  isOpen,
  onClose,
  reissueRequests,
  onUpdateRequests,
  allBadges,
  companyName
}) => {
  const [activeTab, setActiveTab] = useState<'REQUEST_LIST' | 'BATCH_PRINT_A4' | 'SINGLE_PREVIEW' | 'BLACKLIST_CARDS'>('REQUEST_LIST');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewBadge, setPreviewBadge] = useState<SmartBadgeConfig | null>(null);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [blacklistedCards, setBlacklistedCards] = useState<Array<{ rfid: string; name: string; code: string; date: string; reason: string }>>([
    { rfid: 'RFID-8822-3344-OLD', name: 'BÀ NGUYỄN THU HÀ', code: 'AV-0891', date: '09/09/2026 08:15', reason: 'Báo mất thẻ trên đường đi làm' },
    { rfid: 'RFID-9988-1122-OLD', name: 'ÔNG LÊ HOÀNG NAM', code: 'AV-0755', date: '05/09/2026 17:30', reason: 'Rơi mất tại bãi xe siêu thị' }
  ]);
  const [newRequestForm, setNewRequestForm] = useState({
    employeeCode: '',
    fullName: '',
    department: 'Phòng Nhân Sự',
    position: 'Chuyên Viên',
    phone: '',
    reason: 'LOST_CARD' as BadgeReissueRequest['reason'],
    customNote: 'Làm rơi mất thẻ',
  });

  // Load QR codes for all badges to be printed
  useEffect(() => {
    const loadQRs = async () => {
      const qrs: Record<string, string> = {};
      for (const badge of allBadges) {
        if (!qrMap[badge.employeeId]) {
          const qr = await generateZaloBadgeQR(badge.phone);
          qrs[badge.employeeId] = qr;
        }
      }
      setQrMap(prev => ({ ...prev, ...qrs }));
    };
    loadQRs();
  }, [allBadges]);

  if (!isOpen) return null;

  // Select all or toggle
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === reissueRequests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reissueRequests.map(r => r.id)));
    }
  };

  // HR visual verification 1-click
  const handleVerifyRequest = (reqId: string) => {
    const updated = reissueRequests.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          hrVisualVerified: true,
          hrVerifiedBy: 'Chuyên viên Nhân sự (Đã đối chiếu mắt thường)',
          hrVerifiedDate: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          status: 'READY_TO_PRINT' as const,
        };
      }
      return r;
    });
    onUpdateRequests(updated);
  };

  // Submit new request
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonLabels: Record<string, string> = {
      LOST_CARD: 'Làm rơi mất thẻ tên / thẻ từ',
      DAMAGED_CHIP: 'Hư hỏng / Gãy chip RFID thang máy',
      BROKEN_CARD: 'Thẻ bị gãy / Trầy xước mờ thông tin',
      CHANGE_INFO: 'Thay đổi chức danh / Bộ phận mới',
    };

    const newReq: BadgeReissueRequest = {
      id: 'REISSUE-' + Date.now(),
      employeeId: 'EMP-' + Date.now(),
      employeeCode: newRequestForm.employeeCode || 'AV-NEW',
      fullName: newRequestForm.fullName,
      department: newRequestForm.department,
      position: newRequestForm.position,
      phone: newRequestForm.phone || '0988000000',
      requestDate: new Date().toLocaleDateString('vi-VN'),
      reason: newRequestForm.reason,
      reasonLabel: reasonLabels[newRequestForm.reason] + (newRequestForm.customNote ? ' (' + newRequestForm.customNote + ')' : ''),
      fee: 10000,
      paymentNote: 'Đóng 10.000đ tiền mặt tại quầy thủ quỹ (Kế toán không thao tác trên phần mềm)',
      hrVisualVerified: false,
      status: 'PENDING_HR_CHECK',
      badgeConfig: {
        employeeId: 'EMP-' + Date.now(),
        employeeCode: newRequestForm.employeeCode || 'AV-NEW',
        fullName: newRequestForm.fullName,
        position: newRequestForm.position,
        department: newRequestForm.department,
        isManagerLevel: false,
        phone: newRequestForm.phone || '0988000000',
        rfidUid: 'RFID-' + Date.now().toString().slice(-8),
        avatarInitial: newRequestForm.fullName.split(' ').slice(-1)[0]?.substring(0, 2).toUpperCase() || 'NV',
        issueDate: new Date().toLocaleDateString('vi-VN'),
        expiryDate: '09/09/2028',
        parkingEnabled: true,
        parkingType: 'MOTO_B1',
        elevatorEnabled: true,
        elevatorFloors: ['T1', 'T2'],
        doorAccessEnabled: true,
        doorAccessZones: ['Cổng Chính', 'Khu Làm Việc'],
        attendanceRfidEnabled: true,
        canteenMealQrEnabled: true,
      }
    };

    onUpdateRequests([newReq, ...reissueRequests]);
    setShowNewRequestForm(false);
    setNewRequestForm({
      employeeCode: '',
      fullName: '',
      department: 'Phòng Nhân Sự',
      position: 'Chuyên Viên',
      phone: '',
      reason: 'LOST_CARD',
      customNote: '',
    });
  };

  // Badges selected for batch print
  const badgesToBatchPrint = reissueRequests
    .filter(r => selectedIds.has(r.id))
    .map(r => r.badgeConfig);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 text-white p-2.5 flex justify-between items-center no-print">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-200 border border-teal-500/30">
                <RefreshCw className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold">Quản Lý Đề Nghị Cấp Lại Thẻ &amp; In Thẻ (Lẻ / Hàng Loạt)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-400 text-slate-900">
                Nhân Sự Tự Kiểm Tra Mắt Thường
              </span>
            </div>
            <p className="text-xs text-teal-100 mt-1">
              Phí in thẻ 10.000đ nhân viên nộp tiền mặt trực tiếp ngoài quầy • Kế toán hoàn toàn không phải thao tác trên phần mềm
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2 no-print">
          <button
            onClick={() => setActiveTab('REQUEST_LIST')}
            className={'px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center space-x-2 border-t border-x cursor-pointer ' + (
              activeTab === 'REQUEST_LIST'
                ? 'bg-white text-teal-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Danh Sách Đề Nghị Cấp Lại ({reissueRequests.length})</span>
          </button>

          <button
            onClick={() => {
              if (selectedIds.size === 0 && reissueRequests.length > 0) {
                setSelectedIds(new Set(reissueRequests.map(r => r.id)));
              }
              setActiveTab('BATCH_PRINT_A4');
            }}
            className={'px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center space-x-2 border-t border-x cursor-pointer ' + (
              activeTab === 'BATCH_PRINT_A4'
                ? 'bg-white text-teal-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dàn Trang In Hàng Loạt Khổ A4 ({selectedIds.size > 0 ? selectedIds.size : reissueRequests.length} Thẻ)</span>
          </button>

          {previewBadge && (
            <button
              onClick={() => setActiveTab('SINGLE_PREVIEW')}
              className={'px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center space-x-2 border-t border-x cursor-pointer ' + (
                activeTab === 'SINGLE_PREVIEW'
                  ? 'bg-white text-teal-700 border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Trước Thẻ Lẻ: {previewBadge.fullName}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('BLACKLIST_CARDS')}
            className={'px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center space-x-2 border-t border-x cursor-pointer ' + (
              activeTab === 'BLACKLIST_CARDS'
                ? 'bg-white text-rose-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-rose-700 border-transparent hover:bg-slate-100'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Thẻ Đã Khóa / Báo Mất ({blacklistedCards.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-2.5 flex-1 overflow-y-auto">
          {/* TAB 1: DANH SÁCH YÊU CẦU */}
          {activeTab === 'REQUEST_LIST' && (
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50/50 p-3 rounded-2xl border border-teal-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-teal-900">
                    Chọn thẻ cần in hàng loạt: ({selectedIds.size}/{reissueRequests.length} thẻ đã chọn)
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-[11px] text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    {selectedIds.size === reissueRequests.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowNewRequestForm(!showNewRequestForm)}
                    className="px-3 py-1.5 bg-white border border-teal-300 text-teal-700 text-xs font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    {showNewRequestForm ? '✕ Đóng form' : '+ Tạo Đề Nghị Cấp Lại Thẻ'}
                  </button>

                  <button
                    disabled={selectedIds.size === 0}
                    onClick={() => setActiveTab('BATCH_PRINT_A4')}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Hàng Loạt {selectedIds.size} Thẻ Đã Chọn</span>
                  </button>
                </div>
              </div>

              {/* Form tạo đề nghị nhanh */}
              {showNewRequestForm && (
                <form onSubmit={handleCreateRequest} className="p-2 bg-slate-50 border border-slate-300 rounded-2xl space-y-3 text-xs animate-fade-in">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Gửi Đề Nghị Cấp Lại Thẻ (Mất / Hỏng / Đổi Chức Danh)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Mã nhân viên *</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: AV-0891"
                        value={newRequestForm.employeeCode}
                        onChange={e => setNewRequestForm({...newRequestForm, employeeCode: e.target.value})}
                        className="w-full border rounded-lg p-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Họ và tên nhân sự *</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Nguyễn Thu Hà"
                        value={newRequestForm.fullName}
                        onChange={e => setNewRequestForm({...newRequestForm, fullName: e.target.value})}
                        className="w-full border rounded-lg p-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Số điện thoại Zalo *</label>
                      <input
                        type="text"
                        required
                        placeholder="0988xxxxxx"
                        value={newRequestForm.phone}
                        onChange={e => setNewRequestForm({...newRequestForm, phone: e.target.value})}
                        className="w-full border rounded-lg p-2 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Phòng ban</label>
                      <input
                        type="text"
                        value={newRequestForm.department}
                        onChange={e => setNewRequestForm({...newRequestForm, department: e.target.value})}
                        className="w-full border rounded-lg p-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Chức vụ</label>
                      <input
                        type="text"
                        value={newRequestForm.position}
                        onChange={e => setNewRequestForm({...newRequestForm, position: e.target.value})}
                        className="w-full border rounded-lg p-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Lý do cấp lại *</label>
                      <select
                        value={newRequestForm.reason}
                        onChange={e => setNewRequestForm({...newRequestForm, reason: e.target.value as any})}
                        className="w-full border rounded-lg p-2 bg-white"
                      >
                        <option value="LOST_CARD">Làm rơi mất thẻ tên / thẻ từ</option>
                        <option value="DAMAGED_CHIP">Hư hỏng / Gãy chip RFID thang máy</option>
                        <option value="BROKEN_CARD">Thẻ bị gãy / Bể vỏ nhựa</option>
                        <option value="CHANGE_INFO">Thay đổi bộ phận / Bổ nhiệm mới</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                    💡 <b>Quy định chi phí:</b> Phí cấp lại thẻ 10.000đ được thu bằng tiền mặt trực tiếp tại quầy thủ quỹ ngoài đời. Kế toán không cần thao tác trên phần mềm.
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNewRequestForm(false)}
                      className="px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 shadow-xs cursor-pointer"
                    >
                      Tạo Đề Nghị Cấp Lại
                    </button>
                  </div>
                </form>
              )}

              {/* Bảng danh sách đề nghị cấp lại */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10.5px]">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.size > 0 && selectedIds.size === reissueRequests.length}
                          onChange={handleSelectAll}
                          className="rounded text-teal-600 cursor-pointer"
                        />
                      </th>
                      <th className="p-3">Mã NV &amp; Họ Tên</th>
                      <th className="p-3">Lý Do Cấp Lại</th>
                      <th className="p-3 text-center">Phí Cấp Lại</th>
                      <th className="p-3">Kiểm Tra Mắt Thường (HR)</th>
                      <th className="p-3 text-center">Trạng Thái In</th>
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reissueRequests.map((req) => {
                      const isSelected = selectedIds.has(req.id);
                      return (
                        <tr key={req.id} className={'hover:bg-slate-50 transition-colors ' + (isSelected ? 'bg-teal-50/40' : '')}>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(req.id)}
                              className="rounded text-teal-600 cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{req.fullName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {req.employeeCode} • {req.department}
                            </div>
                            <div className="text-[10px] text-teal-700 font-mono mt-0.5">
                              Zalo: {req.phone}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{req.reasonLabel}</div>
                            <div className="text-[10px] text-slate-400">Yêu cầu ngày: {req.requestDate}</div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {req.fee.toLocaleString('vi-VN')} đ
                            </span>
                            <div className="text-[9.5px] text-slate-400 mt-0.5">Tiền mặt tại quầy</div>
                          </td>
                          <td className="p-3">
                            {req.hrVisualVerified ? (
                              <div className="flex items-center space-x-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Đã đối chiếu mắt thường</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleVerifyRequest(req.id)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                                title="Nhân sự nhìn mắt thường nhận diện đúng người đã nộp 10k"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Bấm Duyệt Mắt Thường</span>
                              </button>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {req.hrVerifiedBy ? req.hrVerifiedBy : 'Chờ nhân sự đối chiếu'}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {req.status === 'READY_TO_PRINT' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                Sẵn Sàng In Mới
                              </span>
                            ) : req.status === 'PRINTED_DELIVERED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                Đã In &amp; Giao Thẻ
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Chờ HR Kiểm Tra
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                setPreviewBadge(req.badgeConfig);
                                setActiveTab('SINGLE_PREVIEW');
                              }}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Xem và in thẻ lẻ cho nhân viên này"
                            >
                              In Thẻ Lẻ
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DÀN TRANG IN HÀNG LOẠT KHỔ A4 */}
          {activeTab === 'BATCH_PRINT_A4' && (
            <div className="space-y-1.5">
              <div className="bg-slate-100 p-3.5 rounded-2xl flex items-center justify-between no-print">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-teal-600" />
                    <span>Dàn Trang Khổ Giấy A4 Chuẩn (8 Thẻ / Trang - 2 Cột x 4 Hàng)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Chuẩn kích thước thẻ CR-80 (85.6 x 54mm) có đường viền cắt xén. Dùng máy in văn phòng hoặc máy in thẻ nhựa.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('REQUEST_LIST')}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    ← Quay lại danh sách
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Lệnh In Ngay (Print A4)</span>
                  </button>
                </div>
              </div>

              {/* Khu vực in A4 */}
              <div id="print-area" className="bg-white p-2 border border-slate-200 rounded-2xl shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 p-2">
                  {badgesToBatchPrint.map((b, idx) => {
                    const qr = qrMap[b.employeeId];
                    return (
                      <div
                        key={idx}
                        className="border-2 border-dashed border-slate-300 rounded-2xl p-2 bg-gradient-to-br from-white via-slate-50 to-teal-50/30 flex flex-col justify-between"
                        style={{ minHeight: '190px' }}
                      >
                        {/* Header thẻ */}
                        <div className="flex items-center justify-between border-b pb-1.5">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-5 h-5 rounded bg-teal-700 text-white flex items-center justify-center font-bold text-[9px]">
                              HR
                            </div>
                            <span className="text-[9.5px] font-bold text-slate-800 uppercase tracking-tight truncate max-w-[140px]">
                              {companyName}
                            </span>
                          </div>
                          <span className="text-[8.5px] font-mono font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                            {b.employeeCode}
                          </span>
                        </div>

                        {/* Nội dung giữa thẻ */}
                        <div className="flex items-center justify-between gap-2 py-2">
                          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                              {b.avatarInitial || 'NV'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                                {b.fullName}
                              </h4>
                              <p className="text-[9.5px] text-teal-700 font-semibold truncate mt-0.5">
                                {b.position}
                              </p>
                              <p className="text-[8.5px] text-slate-500 truncate">
                                {b.department}
                              </p>
                            </div>
                          </div>

                          {/* QR Zalo */}
                          <div className="text-center shrink-0">
                            {qr ? (
                              <img src={qr} alt="Zalo QR" className="w-13 h-13 rounded border border-slate-200" />
                            ) : (
                              <div className="w-13 h-13 bg-slate-100 rounded flex items-center justify-center text-[8px] text-slate-400">
                                QR
                              </div>
                            )}
                            <span className="text-[7.5px] font-mono text-teal-800 block font-bold mt-0.5">
                              Quét Zalo
                            </span>
                          </div>
                        </div>

                        {/* Footer thẻ */}
                        <div className="flex items-center justify-between border-t pt-1.5 text-[8.5px] text-slate-500">
                          <span className="font-mono">
                            RFID: {b.rfidUid ? b.rfidUid.slice(0, 16) : 'CHIP-ACTIVE'}
                          </span>
                          <span className="font-bold text-teal-700">
                            {b.parkingEnabled ? '🚗 Bãi xe' : ''} • {b.elevatorEnabled ? '🛗 Thang' : ''} • 🚪 Cửa
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: XEM TRƯỚC IN THẺ LẺ */}
          {activeTab === 'SINGLE_PREVIEW' && previewBadge && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between no-print">
                <button
                  onClick={() => setActiveTab('REQUEST_LIST')}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  ← Quay lại danh sách
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Thẻ Lẻ (CR-80)</span>
                </button>
              </div>

              <div id="print-area" className="flex justify-center p-3 bg-slate-100 rounded-2xl">
                <div
                  className="border-2 border-slate-800 rounded-2xl p-2.5 bg-gradient-to-br from-white via-slate-50 to-teal-50 shadow-2xl flex flex-col justify-between"
                  style={{ width: '340px', minHeight: '210px' }}
                >
                  {/* Top */}
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                        HR
                      </div>
                      <span className="text-[10.5px] font-bold text-slate-800 uppercase tracking-tight">
                        {companyName}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                      {previewBadge.employeeCode}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex items-center justify-between gap-3 py-2">
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                        {previewBadge.avatarInitial || 'NV'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {previewBadge.fullName}
                        </h4>
                        <p className="text-[10px] text-teal-700 font-semibold truncate mt-0.5">
                          {previewBadge.position}
                        </p>
                        <p className="text-[9px] text-slate-500 truncate">
                          {previewBadge.department}
                        </p>
                      </div>
                    </div>

                    <div className="text-center shrink-0">
                      {qrMap[previewBadge.employeeId] && (
                        <img
                          src={qrMap[previewBadge.employeeId]}
                          alt="Zalo QR"
                          className="w-14 h-14 rounded border border-slate-200"
                        />
                      )}
                      <span className="text-[8px] font-mono text-teal-800 block font-bold mt-0.5">
                        Quét Zalo
                      </span>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="flex items-center justify-between border-t pt-1.5 text-[8.5px] text-slate-500">
                    <span className="font-mono">
                      RFID: {previewBadge.rfidUid}
                    </span>
                    <span className="font-bold text-teal-700">
                      Gửi xe • Thang máy • Nhà ăn
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DANH SÁCH THẺ ĐÃ BÁO MẤT & KHÓA BLACKLIST (AN NINH CỔNG & NHÀ ĂN) */}
          {activeTab === 'BLACKLIST_CARDS' && (
            <div className="space-y-1.5">
              <div className="p-2 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-rose-950 flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Cơ Chế Bảo Vệ Tự Động (Poka-Yoke An Ninh): Vô Hiệu Hóa Thẻ Cũ 24/7</span>
                  </h3>
                  <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                    Khi nhân sự báo mất thẻ và được cấp thẻ mới, <b>mã RFID cũ sẽ tự động bị khóa vĩnh viễn</b>. Nếu kẻ gian hoặc người lạ nhặt được thẻ cũ quẹt vào Cổng Bảo Vệ, Thang Máy hoặc Nhà Ăn, hệ thống đầu đọc sẽ <b>từ chối mở cửa và hú còi cảnh báo</b>.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-xs font-mono shrink-0">
                  {blacklistedCards.length} Thẻ Đang Bị Khóa
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10.5px]">
                    <tr>
                      <th className="p-3">Mã RFID Thẻ Cũ</th>
                      <th className="p-3">Nhân Sự Báo Mất</th>
                      <th className="p-3">Thời Điểm Khóa Thẻ</th>
                      <th className="p-3">Lý Do Khóa</th>
                      <th className="p-3 text-center">Tình Trạng Đồng Bộ Thiết Bị</th>
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blacklistedCards.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-rose-700">{c.rfid}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <span className="font-mono text-slate-400 text-[10.5px]">{c.code}</span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">{c.date}</td>
                        <td className="p-3 text-slate-700">{c.reason}</td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            🔒 ĐÃ KHÓA 100% (CỔNG + THANG MÁY + NHÀ ĂN)
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn mở khóa lại thẻ RFID ' + c.rfid + ' cho nhân sự ' + c.name + ' không?')) {
                                setBlacklistedCards(prev => prev.filter((_, i) => i !== idx));
                                alert('✓ Đã mở khóa lại thẻ ' + c.rfid + ' thành công!');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Mở Khóa Lại Thẻ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-2 flex justify-between items-center no-print">
          <div className="text-xs text-slate-500">
            Tổng số đề nghị: <b className="text-slate-800">{reissueRequests.length}</b> • Đã chọn: <b className="text-teal-700">{selectedIds.size}</b>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
