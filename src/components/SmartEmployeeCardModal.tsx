import React, { useState, useEffect } from 'react';
import { 
  SmartBadgeConfig, 
  generateZaloBadgeQR, 
  getZaloProfileUrl, 
  cleanVietnamesePhone 
} from '../services/smartBadgeService';
import { 
  CreditCard, 
  QrCode, 
  Printer, 
  ExternalLink, 
  Check, 
  X, 
  ShieldCheck, 
  Car, 
  ArrowUpDown, 
  Lock, 
  Clock, 
  Utensils, 
  Smartphone, 
  Sparkles, 
  Layers, 
  Building2, 
  RefreshCw,
  Crown
} from 'lucide-react';

interface SmartEmployeeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeConfig: SmartBadgeConfig;
  companyName?: string;
  onSaveConfig?: (updated: SmartBadgeConfig) => void;
}

export const SmartEmployeeCardModal: React.FC<SmartEmployeeCardModalProps> = ({
  isOpen,
  onClose,
  badgeConfig,
  companyName = 'An Việt Manufacturing',
  onSaveConfig
}) => {
  const [config, setConfig] = useState<SmartBadgeConfig>(badgeConfig);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [cardSide, setCardSide] = useState<'FRONT' | 'BACK' | 'BOTH'>('BOTH');
  const [cardOrientation, setCardOrientation] = useState<'VERTICAL' | 'HORIZONTAL'>('VERTICAL');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    setConfig(badgeConfig);
  }, [badgeConfig]);

  useEffect(() => {
    let isMounted = true;
    generateZaloBadgeQR(config.phone).then(url => {
      if (isMounted) {
        setQrDataUrl(url);
      }
    });
    return () => { isMounted = false; };
  }, [config.phone]);

  if (!isOpen) return null;

  const zaloUrl = getZaloProfileUrl(config.phone);
  const formattedPhone = cleanVietnamesePhone(config.phone).replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyZaloUrl = () => {
    navigator.clipboard.writeText(zaloUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleFloor = (floor: string) => {
    setConfig(prev => {
      const exists = prev.elevatorFloors.includes(floor);
      return {
        ...prev,
        elevatorFloors: exists 
          ? prev.elevatorFloors.filter(f => f !== floor)
          : [...prev.elevatorFloors, floor].sort()
      };
    });
  };

  const handleToggleZone = (zone: string) => {
    setConfig(prev => {
      const exists = prev.doorAccessZones.includes(zone);
      return {
        ...prev,
        doorAccessZones: exists 
          ? prev.doorAccessZones.filter(z => z !== zone)
          : [...prev.doorAccessZones, zone]
      };
    });
  };

  const isExecutive = config.isManagerLevel;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-2 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 text-slate-100 rounded-3xl max-w-5xl w-full p-2 sm:p-3 shadow-2xl border border-slate-700 space-y-1.5 max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg ${
              isExecutive ? 'bg-amber-400 text-slate-950 shadow-amber-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  Phân Hệ Thẻ Từ Thông Minh &amp; Nhận Diện Nhân Viên
                </span>
                {isExecutive && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" />
                    Thẻ VIP Quản Lý
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Cấp Thẻ Từ Đa Năng &amp; Mã QR Zalo Chuẩn Cho: {config.fullName}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="In trực tiếp ra máy in thẻ nhựa CR80 hoặc lưu PDF chuẩn kích thước"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Thẻ Nhân Viên</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Khung chính chia 2 cột: Cấu hình phân quyền & Xem trước Thẻ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* CỘT TRÁI: CẤU HÌNH THẺ TỪ & MÃ QR ZALO */}
          <div className="lg:col-span-5 space-y-3.5 text-xs">
            {/* 1. Cấu hình số điện thoại & chuẩn QR Zalo */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  Mã QR Chuẩn App Zalo (Quét Kết Bạn Tức Thì)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Zalo Standard
                </span>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                  Số Điện Thoại Nhân Viên (Liên Kết Zalo):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={config.phone}
                    onChange={e => setConfig({ ...config, phone: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold outline-none focus:border-indigo-500"
                    placeholder="VD: 0988223344"
                  />
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 shrink-0 transition-colors"
                    title="Mở thử nghiệm trang Zalo kết nối bạn bè trên trình duyệt"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Thử Zalo</span>
                  </a>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/50 space-y-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-blue-300 font-semibold">Đường dẫn quét tự động:</span>
                  <button 
                    onClick={handleCopyZaloUrl}
                    className="text-[10px] text-blue-400 hover:underline font-bold"
                  >
                    {isCopied ? '✓ Đã sao chép' : 'Sao chép link'}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-blue-200 bg-slate-900/80 px-2 py-1 rounded border border-blue-900/50 truncate">
                  {zaloUrl}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  *Khi mở app Zalo trên điện thoại quét mã QR này, ứng dụng Zalo sẽ nhận diện ngay số điện thoại <b>{formattedPhone}</b> và mở trang kết bạn / nhắn tin trực tiếp.
                </p>
              </div>
            </div>

            {/* 2. Cấu hình Thẻ từ RFID UID & 4 quyền tích hợp */}
            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Mã Chip Thẻ Từ RFID / NFC Đa Năng
                </span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/60">
                  {config.rfidUid}
                </span>
              </div>

              {/* 4 Chức năng tích hợp */}
              <div className="space-y-2">
                {/* 1. Gửi xe */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.parkingEnabled}
                        onChange={e => setConfig({ ...config, parkingEnabled: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="font-bold text-slate-200 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        1. Gửi Xe Thông Minh (Barrier)
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {config.parkingType === 'AUTO_B2_VIP' ? 'Ô tô riêng B2' : 'Xe máy B1'}
                    </span>
                  </div>
                  {config.parkingEnabled && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                      <select
                        value={config.parkingType}
                        onChange={e => setConfig({ ...config, parkingType: e.target.value as any })}
                        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-200 outline-none"
                      >
                        <option value="MOTO_B1">Xe máy (Hầm B1)</option>
                        <option value="AUTO_B2_VIP">Ô tô riêng (Hầm B2)</option>
                      </select>
                      <input
                        type="text"
                        value={config.licensePlate || ''}
                        onChange={e => setConfig({ ...config, licensePlate: e.target.value })}
                        placeholder="Biển số xe..."
                        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-200 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Thang máy */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.elevatorEnabled}
                        onChange={e => setConfig({ ...config, elevatorEnabled: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="font-bold text-slate-200 flex items-center gap-1">
                        <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                        2. Kiểm Soát Thang Máy (Phân Tầng)
                      </span>
                    </label>
                    <span className="text-[10px] text-indigo-400 font-bold">
                      {config.elevatorFloors.length} tầng cấp quyền
                    </span>
                  </div>
                  {config.elevatorEnabled && (
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800">
                      {['B2', 'B1', 'T1', 'T2', 'T3', 'T4', 'T5'].map(floor => (
                        <button
                          key={floor}
                          type="button"
                          onClick={() => handleToggleFloor(floor)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            config.elevatorFloors.includes(floor)
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {floor}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Cửa từ Access Control */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.doorAccessEnabled}
                        onChange={e => setConfig({ ...config, doorAccessEnabled: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="font-bold text-slate-200 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        3. Quẹt Cửa Từ (Access Control)
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {config.doorAccessZones.length} khu vực
                    </span>
                  </div>
                  {config.doorAccessEnabled && (
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800">
                      {['Cổng Chính', 'Khối VP', 'Xưởng SX 1', 'Xưởng SX 2', 'Server IT', 'Phòng BGĐ'].map(zone => (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => handleToggleZone(zone)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            config.doorAccessZones.includes(zone)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {zone}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Chấm công & Suất ăn */}
                <div className="grid grid-cols-2 gap-2">
                  <label className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.attendanceRfidEnabled}
                      onChange={e => setConfig({ ...config, attendanceRfidEnabled: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="leading-tight">
                      <span className="font-bold text-slate-200 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        4. Chấm Công Thẻ
                      </span>
                      <span className="text-[9.5px] text-slate-400 block">Quẹt tại đầu đọc RFID</span>
                    </div>
                  </label>

                  <label className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.canteenMealQrEnabled}
                      onChange={e => setConfig({ ...config, canteenMealQrEnabled: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="leading-tight">
                      <span className="font-bold text-slate-200 flex items-center gap-1 text-[11px]">
                        <Utensils className="w-3 h-3 text-amber-400" />
                        5. Suất Ăn Nhà Ăn
                      </span>
                      <span className="text-[9.5px] text-slate-400 block">Quét QR nhận phần ăn</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Điều khiển hiển thị xem trước */}
            <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700">
              <span className="text-slate-400 font-semibold text-[11px]">Xem Trước Thẻ:</span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setCardSide('FRONT')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] transition-all cursor-pointer ${
                    cardSide === 'FRONT' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Mặt Trước
                </button>
                <button
                  type="button"
                  onClick={() => setCardSide('BACK')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] transition-all cursor-pointer ${
                    cardSide === 'BACK' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Mặt Sau (QR Zalo)
                </button>
                <button
                  type="button"
                  onClick={() => setCardSide('BOTH')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] transition-all cursor-pointer ${
                    cardSide === 'BOTH' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Cả 2 Mặt
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: XEM TRƯỚC THẺ NHÂN VIÊN IN ẤN CHUẨN CR80 */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/60 p-2 sm:p-3 rounded-3xl border border-slate-800">
            <div className="w-full flex items-center justify-between mb-3 text-[11px] text-slate-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Chuẩn Thẻ Nhựa Thông Minh CR80 (85.6mm x 54mm)
              </span>
              <span className="font-mono text-indigo-300">
                Độ phân giải in: 300 DPI
              </span>
            </div>

            {/* VÙNG IN THẺ (PRINT AREA) */}
            <div id="printable-employee-badge" className="flex flex-wrap items-center justify-center gap-3">
              {/* ======================================================== */}
              {/* MẶT TRƯỚC CỦA THẺ (FRONT BADGE) */}
              {/* ======================================================== */}
              {(cardSide === 'FRONT' || cardSide === 'BOTH') && (
                <div 
                  className={`w-[270px] h-[420px] rounded-2xl shadow-2xl p-2 flex flex-col justify-between relative overflow-hidden transition-all text-slate-900 border select-none ${
                    isExecutive 
                      ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50/80 border-amber-300 ring-2 ring-amber-400/40' 
                      : 'bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-indigo-200 ring-1 ring-indigo-300/40'
                  }`}
                >
                  {/* Dải màu thương hiệu nhận diện trên cùng */}
                  <div className={`absolute top-0 left-0 right-0 h-3 ${
                    isExecutive ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600' : 'bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-800'
                  }`} />

                  {/* Header thẻ: Logo & Tên Công Ty */}
                  <div className="pt-2 text-center space-y-1">
                    <div className="flex items-center justify-center space-x-1.5">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] text-white ${
                        isExecutive ? 'bg-amber-600' : 'bg-indigo-700'
                      }`}>
                        AV
                      </div>
                      <span className="font-black text-xs tracking-wider uppercase text-slate-900">
                        {companyName}
                      </span>
                    </div>
                    <p className="text-[8.5px] font-semibold tracking-widest text-slate-500 uppercase">
                      ENTERPRISE SMART IDENTIFICATION BADGE
                    </p>
                  </div>

                  {/* Ảnh chân dung thẻ */}
                  <div className="my-auto flex flex-col items-center space-y-2.5">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-md border-2 ${
                        isExecutive 
                          ? 'bg-amber-100 text-amber-800 border-amber-400 shadow-amber-200/50' 
                          : 'bg-indigo-100 text-indigo-800 border-indigo-300 shadow-indigo-100'
                      }`}>
                        {config.avatarInitial || config.fullName.charAt(0)}
                      </div>
                      {/* Biểu tượng chip thông minh */}
                      <div className="absolute -bottom-2 -right-2 p-1 rounded-full bg-slate-900 text-white shadow-xs" title="Chip thẻ từ thông minh RFID / NFC">
                        <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                    </div>

                    {/* Họ và tên & Chức danh */}
                    <div className="text-center space-y-0.5 px-2">
                      <h3 className="font-black text-sm text-slate-900 tracking-tight leading-tight uppercase">
                        {config.fullName}
                      </h3>
                      <p className={`font-bold text-[11px] leading-tight ${isExecutive ? 'text-amber-800' : 'text-indigo-700'}`}>
                        {config.position}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {config.department}
                      </p>
                    </div>
                  </div>

                  {/* Footer mặt trước: Mã nhân viên & RFID UID */}
                  <div className="border-t border-slate-200 pt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">MÃ NHÂN VIÊN:</span>
                      <b className="text-slate-900 font-bold">{config.employeeCode}</b>
                    </div>
                    <div className="flex items-center justify-between text-[9.5px] font-mono">
                      <span className="text-slate-400">RFID UID:</span>
                      <span className="text-indigo-700 font-bold">{config.rfidUid}</span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] text-slate-400 pt-0.5">
                      <span>Ngày cấp: {config.issueDate}</span>
                      <span>Hạn dùng: {config.expiryDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* MẶT SAU CỦA THẺ (BACK BADGE) - CÓ MÃ QR ZALO TƯƠNG ĐỐI LỚN */}
              {/* ======================================================== */}
              {(cardSide === 'BACK' || cardSide === 'BOTH') && (
                <div 
                  className={`w-[270px] h-[420px] rounded-2xl shadow-2xl p-2 flex flex-col justify-between relative overflow-hidden transition-all text-slate-900 border select-none bg-white ${
                    isExecutive ? 'border-amber-300 ring-2 ring-amber-400/40' : 'border-indigo-200 ring-1 ring-indigo-300/40'
                  }`}
                >
                  {/* Header mặt sau */}
                  <div className="text-center space-y-0.5">
                    <span className="text-[9px] font-bold text-indigo-700 tracking-wider uppercase block">
                      QUÉT MÃ QR BẰNG APP ZALO ĐỂ KẾT NỐI
                    </span>
                    <p className="text-[8px] text-slate-400">
                      Tự động mở danh bạ &amp; gửi tin nhắn Zalo trực tiếp
                    </p>
                  </div>

                  {/* MÃ QR CODE TƯƠNG ĐỐI LỚN SẮC NÉT */}
                  <div className="my-auto flex flex-col items-center space-y-2">
                    <div className="p-2.5 bg-white rounded-2xl border-2 border-indigo-600 shadow-md flex items-center justify-center">
                      {qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt="QR Code Zalo" 
                          className="w-40 h-40 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-40 h-40 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                          Đang tạo mã QR...
                        </div>
                      )}
                    </div>

                    {/* Số điện thoại Zalo */}
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10.5px] font-bold font-mono">
                        <Smartphone className="w-3 h-3 text-blue-600" />
                        <span>Zalo: {formattedPhone}</span>
                      </div>
                      <p className="text-[8.5px] text-slate-500 mt-0.5">
                        Đồng bộ điểm danh Suất ăn &amp; Ra vào cổng bảo vệ
                      </p>
                    </div>
                  </div>

                  {/* 4 Biểu tượng quyền hạn thẻ từ */}
                  <div className="border-t border-slate-100 pt-2 space-y-1.5 text-[9px] text-slate-600">
                    <div className="grid grid-cols-4 gap-1 text-center font-semibold">
                      <div className={`p-1 rounded ${config.parkingEnabled ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                        <Car className="w-3 h-3 mx-auto mb-0.5" />
                        <span>Gửi xe</span>
                      </div>
                      <div className={`p-1 rounded ${config.elevatorEnabled ? 'bg-indigo-50 text-indigo-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                        <ArrowUpDown className="w-3 h-3 mx-auto mb-0.5" />
                        <span>Thang máy</span>
                      </div>
                      <div className={`p-1 rounded ${config.doorAccessEnabled ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                        <Lock className="w-3 h-3 mx-auto mb-0.5" />
                        <span>Cửa từ</span>
                      </div>
                      <div className={`p-1 rounded ${config.canteenMealQrEnabled ? 'bg-rose-50 text-rose-800' : 'bg-slate-100 text-slate-400 line-through'}`}>
                        <Utensils className="w-3 h-3 mx-auto mb-0.5" />
                        <span>Nhà ăn</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[7.5px] text-slate-400 pt-0.5 border-t border-slate-100">
                      <span>Hotline HCNS / Zalo: 084 963-084-246</span>
                      <span>Nhặt được xin trả lại bộ phận HR</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nút bấm kiểm tra quét Zalo & In nhanh */}
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-3">
              <a
                href={zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Thử Quét / Mở Thẳng Trang Zalo Kết Bạn</span>
              </a>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Thẻ Nhân Viên (2 Mặt Chuẩn CR80)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px] italic">
            *Thẻ từ tương thích các đầu đọc tần số 13.56 MHz (Mifare / NFC) và 125 kHz (EM-Marine) phổ biến tại Việt Nam.
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSaveConfig) onSaveConfig(config);
                alert(`✓ Đã lưu cấu hình thẻ từ thông minh và phân quyền cho nhân sự ${config.fullName}!`);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors cursor-pointer shadow-sm"
            >
              Lưu Cấu Hình Thẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
