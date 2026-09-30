import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  QrCode, 
  Utensils, 
  Users, 
  Search, 
  ShieldCheck, 
  History, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  Info,
  Check,
  Fingerprint,
  Coffee,
  Leaf,
  ShieldAlert,
  CalendarCheck,
  AlertCircle,
  UserPlus,
  Building,
  Laptop,
  Smartphone,
  Send,
  CheckCheck,
  UserCheck,
  HardHat,
  Briefcase
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types/hrm';
import { generateZaloBadgeQR } from '../services/smartBadgeService';

export type MealShiftType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'NIGHT';
export type SpecialDietType = 'NONE' | 'VEGETARIAN' | 'PORRIDGE'; // NONE: Cơm thường (không cần đ.ký), VEGETARIAN: Chay, PORRIDGE: Cháo

// Kiểu khách mời hoặc lao động dịch vụ
export type MealRecipientCategory = 'EMPLOYEE' | 'GUEST' | 'OUTSOURCED_PARTNER';

export interface GuestMealRequest {
  id: string;
  hostEmpId: string;
  hostEmpName: string;
  guestCompany: string;
  guestCount: number;
  contactPerson: string;
  dietType: SpecialDietType;
  shift: MealShiftType;
  requestTime: string;
  isUrgentUnder1Hour: boolean;
  canteenConfirmed: boolean; // Nhà ăn đã đồng ý
  hrApproved: boolean;       // Nhân sự đã phê duyệt
  status: 'PENDING_CANTEEN' | 'PENDING_HR' | 'APPROVED' | 'CLAIMED';
}

export interface OutsourcedPartnerWorker {
  id: string;
  fullName: string;
  roleType: 'SECURITY' | 'JANITOR' | 'CONTRACTOR';
  roleTitle: string; // Bảo Vệ, Tạp Vụ, v.v.
  partnerCompany: string; // Công ty TNHH DV Bảo Vệ Long Hoàng
  phone: string;
  registeredDiet: SpecialDietType;
  claimedShifts: MealShiftType[];
}

export interface MealPickupRecord {
  id: string;
  empId: string;
  empName: string;
  phone: string;
  dept: string;
  mealShift: MealShiftType;
  shiftName: string;
  pickupTime: string;
  pickupTimestamp: number;
  pickupType: 'SELF' | 'PROXY' | 'GUEST_PROXY' | 'OUTSOURCED_PROXY';
  proxyByEmpId?: string;
  proxyByEmpName?: string;
  specialDiet?: SpecialDietType;
  dietLabel?: string;
  guestCount?: number;
  guestCompany?: string;
  securityHash?: string;
  status: 'CLAIMED';
}

interface CanteenMealPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees?: Employee[];
  attendance?: AttendanceRecord[];
  isEmployeeOnlyMode?: boolean; // Khi mở từ Banner Nhân Viên (Tab 01): Ẩn đối soát bếp & thanh kiểm toán quản trị
}

export const CanteenMealPassModal: React.FC<CanteenMealPassModalProps> = ({
  isOpen,
  onClose,
  employees = [],
  attendance = [],
  isEmployeeOnlyMode = false
}) => {
  // Đồng hồ thời gian thực
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mã màu bảo mật động chống video phát lại
  const [securityToken, setSecurityToken] = useState<string>('8924');
  const [securityColorIndex, setSecurityColorIndex] = useState<number>(0);

  // Hiệu ứng Chạm Tương Tác Sống
  const [touchVerifyActive, setTouchVerifyActive] = useState(false);
  const [touchVerifyTimer, setTouchVerifyTimer] = useState<any>(null);

  // Chế độ thiết bị: Laptop/Màn hình lớn vs Mobile
  const [deviceMode, setDeviceMode] = useState<'LAPTOP_VIEW' | 'MOBILE_VIEW'>('LAPTOP_VIEW');

  // Tab xem nghiệp vụ: Thẻ ăn & Đăng ký vs Đối soát bếp ăn
  const [activeTab, setActiveTab] = useState<'MEAL_PASS' | 'KITCHEN_MONITOR'>('MEAL_PASS');

  // Phân hệ đang thao tác bên phải: 'PERSONAL_DIET' (Chay/Cháo) | 'GUEST_MEAL' (Khách) | 'OUTSOURCED' (Bảo vệ/Tạp vụ)
  const [activeFeatureTab, setActiveFeatureTab] = useState<'PERSONAL_DIET' | 'GUEST_MEAL' | 'OUTSOURCED'>('PERSONAL_DIET');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const sec = now.getSeconds();
      const code = (1000 + (sec * 137 + now.getMinutes() * 19) % 9000).toString();
      setSecurityToken(code);
      setSecurityColorIndex(Math.floor(sec / 3) % 6);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKitchenTouchVerify = () => {
    setTouchVerifyActive(true);
    if (touchVerifyTimer) clearTimeout(touchVerifyTimer);
    const t = setTimeout(() => {
      setTouchVerifyActive(false);
    }, 2500);
    setTouchVerifyTimer(t);
  };

  // Ca ăn hiện tại
  const [selectedShift, setSelectedShift] = useState<MealShiftType>('LUNCH');

  const shiftConfigs: Record<MealShiftType, { name: string; startHour: number; startMinute: number; timeRange: string }> = {
    BREAKFAST: { name: 'Suất Ăn Sáng', startHour: 6, startMinute: 30, timeRange: '06:30 - 08:30' },
    LUNCH: { name: 'Cơm Ca Trưa', startHour: 11, startMinute: 30, timeRange: '11:30 - 13:30' },
    DINNER: { name: 'Cơm Ca Chiều', startHour: 17, startMinute: 30, timeRange: '17:30 - 19:30' },
    NIGHT: { name: 'Suất Ăn Đêm Tăng Ca', startHour: 22, startMinute: 0, timeRange: '22:00 - 23:30' },
  };

  // Công tắc mô phỏng thời gian ca ăn
  const [shiftTimeMode, setShiftTimeMode] = useState<'EARLY' | 'ELIGIBLE'>('ELIGIBLE');

  // Công tắc mô phỏng thời gian chấm công
  const [checkInSimMode, setCheckInSimMode] = useState<'WITHIN_30M' | 'NOT_CHECKED_IN' | 'OVER_30M'>('WITHIN_30M');

  // Công tắc mô phỏng thời gian đăng ký khách (< 1 tiếng vs >= 1 tiếng trước giờ ăn)
  const [guestTimingSimMode, setGuestTimingSimMode] = useState<'NORMAL_ADVANCE' | 'URGENT_UNDER_1H'>('URGENT_UNDER_1H');

  // Danh sách nhân viên nội bộ
  const defaultEmpList = useMemo(() => {
    if (employees.length > 0) return employees;
    return [
      { id: 'AV-0342', fullName: 'Nguyễn Văn Tuấn', phone: '0982.345.678', department: 'Phân Xưởng Chế Biến' },
      { id: 'AV-0418', fullName: 'Trần Thị Thu Thảo', phone: '0971.888.999', department: 'Phân Xưởng Đóng Gói' },
      { id: 'AV-0399', fullName: 'Lê Hữu Hoàng', phone: '0903.111.222', department: 'Khối Cơ Điện' },
      { id: 'AV-0522', fullName: 'Phạm Hồng Nhung', phone: '0912.333.444', department: 'Khối Văn Phòng' },
      { id: 'AV-0588', fullName: 'Vũ Đức Trọng', phone: '0934.555.666', department: 'Kho Vận & Logistics' },
    ];
  }, [employees]);

  const [activeEmpId, setActiveEmpId] = useState<string>('AV-0342');
  const [canteenQrUrl, setCanteenQrUrl] = useState<string>('');
  const [proxyQrUrl, setProxyQrUrl] = useState<string>('');
  const [guestQrUrl, setGuestQrUrl] = useState<string>('');
  const activeEmployee = useMemo(() => {
    return defaultEmpList.find(e => e.id === activeEmpId) || defaultEmpList[0];
  }, [defaultEmpList, activeEmpId]);

  // Đăng ký suất Chay / Cháo nhân viên nội bộ
  const [specialDietRegistrations, setSpecialDietRegistrations] = useState<Record<string, SpecialDietType>>({
    'AV-0418': 'VEGETARIAN',
    'AV-0588': 'PORRIDGE',
  });

  const activeEmployeeDiet = specialDietRegistrations[activeEmployee.id] || 'NONE';

  // =========================================================================
  // 1. DỮ LIỆU ĐỐI TÁC DỊCH VỤ (BẢO VỆ, TẠP VỤ, NHÀ THẦU BÊN NGOÀI)
  // =========================================================================
  const [partnerWorkers, setPartnerWorkers] = useState<OutsourcedPartnerWorker[]>([
    {
      id: 'PT-SEC-01',
      fullName: 'Trần Quốc Bảo',
      roleType: 'SECURITY',
      roleTitle: 'Bảo Vệ Cổng Chính',
      partnerCompany: 'Công ty TNHH DV Bảo Vệ Long Hoàng',
      phone: '0918.111.222',
      registeredDiet: 'NONE',
      claimedShifts: []
    },
    {
      id: 'PT-SEC-02',
      fullName: 'Vũ Đình Toàn',
      roleType: 'SECURITY',
      roleTitle: 'Bảo Vệ Tuần Tra Kho',
      partnerCompany: 'Công ty TNHH DV Bảo Vệ Long Hoàng',
      phone: '0918.333.444',
      registeredDiet: 'VEGETARIAN', // Ăn chay
      claimedShifts: ['LUNCH']
    },
    {
      id: 'PT-JAN-01',
      fullName: 'Lê Thị Cúc',
      roleType: 'JANITOR',
      roleTitle: 'Tạp Vụ Khu Sản Xuất',
      partnerCompany: 'Công ty DV Vệ Sinh Hoàn Mỹ',
      phone: '0908.555.666',
      registeredDiet: 'NONE',
      claimedShifts: []
    },
    {
      id: 'PT-JAN-02',
      fullName: 'Nguyễn Thị Hoa',
      roleType: 'JANITOR',
      roleTitle: 'Tạp Vụ Khu Văn Phòng',
      partnerCompany: 'Công ty DV Vệ Sinh Hoàn Mỹ',
      phone: '0908.777.888',
      registeredDiet: 'PORRIDGE', // Ăn cháo
      claimedShifts: []
    }
  ]);

  // =========================================================================
  // 2. DỮ LIỆU ĐĂNG KÝ SUẤT ĂN CHO KHÁCH (GUEST MEAL REQUESTS)
  // =========================================================================
  const [guestMealRequests, setGuestMealRequests] = useState<GuestMealRequest[]>([
    {
      id: 'GUEST-REQ-001',
      hostEmpId: 'AV-0342',
      hostEmpName: 'Nguyễn Văn Tuấn',
      guestCompany: 'Công ty TNHH Thiết Bị Lạnh Tân Á (Đoàn Chuyên Gia)',
      guestCount: 3,
      contactPerson: 'Kỹ sư Đặng Văn Dũng',
      dietType: 'NONE',
      shift: 'LUNCH',
      requestTime: '10:45 09/09/2026',
      isUrgentUnder1Hour: true,
      canteenConfirmed: true,
      hrApproved: true,
      status: 'APPROVED'
    }
  ]);

  // Xác nhận ủy quyền khi nhận hộ cho Bảo vệ / Tạp vụ
  const [partnerClaimConfirmTarget, setPartnerClaimConfirmTarget] = useState<OutsourcedPartnerWorker | null>(null);
  const [partnerPinInput, setPartnerPinInput] = useState('');
  const [partnerPinError, setPartnerPinError] = useState<string | null>(null);

  // Form đăng ký khách mới
  const [newGuestForm, setNewGuestForm] = useState({
    guestCompany: '',
    contactPerson: '',
    guestCount: 2,
    dietType: 'NONE' as SpecialDietType,
    note: ''
  });

  // Khách đang chọn để nhận hộ
  const [activeGuestPickup, setActiveGuestPickup] = useState<GuestMealRequest | null>(null);

  // =========================================================================
  // 3. LỊCH SỬ THỰC NHẬN SUẤT ĂN CA
  // =========================================================================
  const [pickupLogs, setPickupLogs] = useState<MealPickupRecord[]>([
    {
      id: 'LOG-MEAL-001',
      empId: 'AV-0399',
      empName: 'Lê Hữu Hoàng',
      phone: '0903.111.222',
      dept: 'Khối Cơ Điện',
      mealShift: 'LUNCH',
      shiftName: 'Cơm Ca Trưa',
      pickupTime: '11:35:12 09/09/2026',
      pickupTimestamp: Date.now() - 1500000,
      pickupType: 'SELF',
      specialDiet: 'NONE',
      dietLabel: 'Cơm Mặn Thường',
      securityHash: 'TK-8492-OK',
      status: 'CLAIMED'
    },
    {
      id: 'LOG-MEAL-002',
      empId: 'AV-0522',
      empName: 'Phạm Hồng Nhung',
      phone: '0912.333.444',
      dept: 'Khối Văn Phòng',
      mealShift: 'LUNCH',
      shiftName: 'Cơm Ca Trưa',
      pickupTime: '12:05:40 09/09/2026',
      pickupTimestamp: Date.now() - 600000,
      pickupType: 'PROXY',
      proxyByEmpId: 'AV-0342',
      proxyByEmpName: 'Nguyễn Văn Tuấn',
      specialDiet: 'NONE',
      dietLabel: 'Cơm Mặn Thường',
      securityHash: 'TK-9921-PROXY',
      status: 'CLAIMED'
    }
  ]);

  // Kiểm tra nhân sự hiện tại đã lấy chưa
  const existingLogForActiveEmp = useMemo(() => {
    return pickupLogs.find(
      log => log.empId === activeEmployee.id && log.mealShift === selectedShift
    );
  }, [pickupLogs, activeEmployee, selectedShift]);

  // Trạng thái màn hình điện thoại
  const [screenMode, setScreenMode] = useState<'NORMAL' | 'COMPLETED' | 'PROXY_SEARCH' | 'PROXY_CONFIRM' | 'PROXY_COMPLETED' | 'GUEST_CLAIM_READY'>('NORMAL');

  // Lấy hộ đồng nghiệp
  const [proxyTargetEmpId, setProxyTargetEmpId] = useState<string>('');
  const [proxySearchTerm, setProxySearchTerm] = useState<string>('');
  const [proxyErrorMsg, setProxyErrorMsg] = useState<string | null>(null);

  const proxyTargetEmployee = useMemo(() => {
    return defaultEmpList.find(e => e.id === proxyTargetEmpId) || null;
  }, [defaultEmpList, proxyTargetEmpId]);

  // Khi đổi nhân viên hoặc ca ăn
  useEffect(() => {
    if (existingLogForActiveEmp) {
      setScreenMode('COMPLETED');
    } else {
      setScreenMode('NORMAL');
    }
    setProxyErrorMsg(null);
  }, [activeEmpId, selectedShift, existingLogForActiveEmp]);

  // Tự động sinh mã QR Zalo chuẩn quét thực tế đồng bộ với Thẻ Nhân Viên
  useEffect(() => {
    if (activeEmployee?.phone) {
      generateZaloBadgeQR(activeEmployee.phone).then(url => {
        setCanteenQrUrl(url);
      }).catch(err => {
        console.error('Lỗi tạo QR Zalo:', err);
      });
    }
  }, [activeEmployee?.phone]);

  useEffect(() => {
    if (proxyTargetEmployee?.phone) {
      generateZaloBadgeQR(proxyTargetEmployee.phone).then(url => {
        setProxyQrUrl(url);
      }).catch(err => {
        console.error('Lỗi tạo QR Proxy Zalo:', err);
      });
    }
  }, [proxyTargetEmployee?.phone]);

  useEffect(() => {
    if (activeGuestPickup?.id) {
      generateZaloBadgeQR(activeEmployee?.phone || '0982345678').then(url => {
        setGuestQrUrl(url);
      }).catch(err => {
        console.error('Lỗi tạo QR Guest Zalo:', err);
      });
    }
  }, [activeGuestPickup?.id, activeEmployee?.phone]);

  if (!isOpen) return null;

  // Xử lý đăng ký / hủy suất ăn đặc biệt (CHAY / CHÁO / HỦY)
  const handleRegisterDiet = (diet: SpecialDietType) => {
    if (checkInSimMode === 'NOT_CHECKED_IN') {
      alert('⚠️ Bạn chưa chấm công đầu ca làm việc! Vui lòng thực hiện chấm công trước để kích hoạt đăng ký suất ăn.');
      return;
    }
    if (checkInSimMode === 'OVER_30M') {
      alert(`⏳ ĐÃ QUÁ THỜI GIAN ĐĂNG KÝ (30 PHÚT):\nQuy định bếp ăn chỉ tiếp nhận đăng ký đổi suất Chay hoặc Cháo trong vòng 30 phút sau khi chấm công đầu ca để kịp chế biến!`);
      return;
    }

    setSpecialDietRegistrations(prev => ({
      ...prev,
      [activeEmployee.id]: diet
    }));

    if (diet === 'VEGETARIAN') {
      alert('🥗 ĐÃ ĐĂNG KÝ SUẤT ĂN CHAY THÀNH CÔNG!\nBếp ăn đã ghi nhận định lượng chuẩn bị cơm chay cho bạn trong ca này.');
    } else if (diet === 'PORRIDGE') {
      alert('🥣 ĐÃ ĐĂNG KÝ SUẤT CHÁO THÀNH CÔNG!\nBếp ăn đã ghi nhận định lượng cháo dinh dưỡng cho bạn trong ca này.');
    } else {
      alert('🔄 ĐÃ HỦY ĐĂNG KÝ ĐẶC BIỆT!\nBạn sẽ dùng suất Cơm bình thường theo tiêu chuẩn chấm công (không cần đăng ký).');
    }
  };

  // Xử lý đăng ký suất ăn cho khách
  const handleSubmitGuestMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestForm.guestCompany || !newGuestForm.contactPerson) {
      alert('Vui lòng nhập tên công ty và người đại diện đoàn khách!');
      return;
    }

    // Chống lách luật: Kiểm tra xem nhân sự này đã có yêu cầu mời khách trong ca chưa
    const existingHostReq = guestMealRequests.find(r => r.hostEmpId === activeEmployee.id && r.shift === selectedShift);
    if (existingHostReq) {
      alert(`⚠️ BẠN ĐÃ CÓ 01 YÊU CẦU TIẾP KHÁCH TRONG CA NÀY (Mã: ${existingHostReq.id} - ${existingHostReq.guestCompany})!\nTheo quy chế chống trục lợi suất ăn, mỗi nhân viên chỉ được đăng ký tối đa 01 đoàn khách/ca. Nếu có phát sinh thêm đoàn khách mới, vui lòng liên hệ trực tiếp Trưởng Phòng Nhân Sự để phê duyệt bổ sung.`);
      return;
    }

    const isUrgent = guestTimingSimMode === 'URGENT_UNDER_1H';

    const newReq: GuestMealRequest = {
      id: 'GUEST-REQ-' + (guestMealRequests.length + 1).toString().padStart(3, '0'),
      hostEmpId: activeEmployee.id,
      hostEmpName: activeEmployee.fullName,
      guestCompany: newGuestForm.guestCompany,
      guestCount: Number(newGuestForm.guestCount) || 1,
      contactPerson: newGuestForm.contactPerson,
      dietType: newGuestForm.dietType,
      shift: selectedShift,
      requestTime: currentTime.toLocaleTimeString('vi-VN') + ' ' + currentTime.toLocaleDateString('vi-VN'),
      isUrgentUnder1Hour: isUrgent,
      canteenConfirmed: !isUrgent, // Nếu trước 1h thì tự động duyệt bếp
      hrApproved: !isUrgent,       // Nếu trước 1h thì duyệt luôn
      status: isUrgent ? 'PENDING_CANTEEN' : 'APPROVED'
    };

    setGuestMealRequests([newReq, ...guestMealRequests]);
    setNewGuestForm({
      guestCompany: '',
      contactPerson: '',
      guestCount: 2,
      dietType: 'NONE',
      note: ''
    });

    if (isUrgent) {
      alert('⚠️ ĐÃ TẠO YÊU CẦU SUẤT ĂN KHÁCH GẤP (< 1 tiếng trước giờ ăn)!\nVui lòng liên hệ trực tiếp Nhà Ăn để xác nhận khả năng phục vụ và chuyển duyệt Phòng Nhân Sự.');
    } else {
      alert('✓ ĐÃ ĐĂNG KÝ SUẤT ĂN CHO KHÁCH THÀNH CÔNG!\nThông tin đã được chuyển thẳng tới Nhà Bếp chuẩn bị.');
    }
  };

  // Xác nhận từ Nhà Bếp (trường hợp gấp < 1 tiếng)
  const handleCanteenConfirmGuest = (reqId: string) => {
    setGuestMealRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          canteenConfirmed: true,
          status: 'PENDING_HR'
        };
      }
      return r;
    }));
    alert('✓ Nhà Ăn đã xác nhận còn suất! Đã chuyển thông tin đến Phòng Nhân Sự phê duyệt.');
  };

  // Phê duyệt từ Phòng Nhân Sự
  const handleHrApproveGuest = (reqId: string) => {
    setGuestMealRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          hrApproved: true,
          status: 'APPROVED'
        };
      }
      return r;
    }));
    alert('✓ Phòng Nhân Sự đã phê duyệt! Nhân viên có thể bấm nhận suất ăn hộ cho khách ngay bây giờ.');
  };

  // Bấm vào nhận phần ăn hộ cho khách (Mở thẻ hiển thị số lượng khách cực đại)
  const handleOpenGuestPickupPass = (req: GuestMealRequest) => {
    setActiveGuestPickup(req);
    setScreenMode('GUEST_CLAIM_READY');
  };

  // Xác nhận lấy xong suất cho khách
  const handleConfirmGuestPickup = () => {
    if (!activeGuestPickup) return;

    const dietLabel = activeGuestPickup.dietType === 'VEGETARIAN' ? '🥗 Cơm Chay' : activeGuestPickup.dietType === 'PORRIDGE' ? '🥣 Cháo Dinh Dưỡng' : '🍚 Cơm Mặn Thường';

    const newLog: MealPickupRecord = {
      id: 'LOG-MEAL-' + (pickupLogs.length + 1).toString().padStart(3, '0'),
      empId: 'GUEST-' + activeGuestPickup.id,
      empName: `ĐOÀN KHÁCH: ${activeGuestPickup.guestCompany} (${activeGuestPickup.guestCount} suất)`,
      phone: activeEmployee.phone || '0982.345.678',
      dept: 'Khách Tiếp Đãi',
      mealShift: selectedShift,
      shiftName: shiftConfigs[selectedShift].name,
      pickupTime: currentTime.toLocaleTimeString('vi-VN') + ' ' + currentTime.toLocaleDateString('vi-VN'),
      pickupTimestamp: Date.now(),
      pickupType: 'GUEST_PROXY',
      proxyByEmpId: activeEmployee.id,
      proxyByEmpName: activeEmployee.fullName,
      specialDiet: activeGuestPickup.dietType,
      dietLabel: `${dietLabel} (Tiếp khách: ${activeGuestPickup.guestCount} suất)`,
      guestCount: activeGuestPickup.guestCount,
      guestCompany: activeGuestPickup.guestCompany,
      securityHash: 'GUEST-OK-' + securityToken,
      status: 'CLAIMED'
    };

    setPickupLogs([newLog, ...pickupLogs]);
    setGuestMealRequests(prev => prev.map(r => r.id === activeGuestPickup.id ? { ...r, status: 'CLAIMED' } : r));
    alert(`🎉 ĐÃ HOÀN TẤT NHẬN HỘ ${activeGuestPickup.guestCount} SUẤT ĂN CHO KHÁCH!`);
    setActiveGuestPickup(null);
    setScreenMode('NORMAL');
  };

  // Đăng ký suất cho Lao Động Dịch Vụ (Bảo Vệ / Tạp Vụ) - Kèm kiểm soát chống lách luật
  const handleOpenPartnerClaimConfirm = (partner: OutsourcedPartnerWorker) => {
    if (partner.claimedShifts.includes(selectedShift)) {
      alert(`⚠️ Nhân sự ${partner.fullName} (${partner.roleTitle}) đã nhận suất ăn ca này rồi! Không thể nhận lần thứ 2.`);
      return;
    }

    // Kiểm tra xem nhân sự hiện tại đã từng nhận hộ ai chưa (Hạn chế trục lợi: Tối đa 1 lượt nhận hộ/ca)
    const alreadyProxied = pickupLogs.some(
      l => l.proxyByEmpId === activeEmployee.id && l.mealShift === selectedShift && l.pickupType !== 'GUEST_PROXY'
    );

    if (alreadyProxied) {
      if (!window.confirm(`⚠️ CẢNH BÁO GIÁM SÁT:\nBạn (${activeEmployee.fullName}) đã từng nhận hộ 01 suất ăn trong ca này rồi.\nHành vi tiếp tục nhận suất của ${partner.roleTitle} (${partner.fullName}) sẽ được ghi nhận cờ kiểm toán (AUDIT_FLAG) để Ban Giám Đốc và Nhà Bếp đối soát.\nBạn có cam kết được Đội Trưởng/Tổ Trưởng ủy quyền nhận thay không?`)) {
        return;
      }
    }

    setPartnerClaimConfirmTarget(partner);
    setPartnerPinInput('');
    setPartnerPinError(null);
  };

  const handleExecutePartnerClaim = () => {
    if (!partnerClaimConfirmTarget) return;

    // Yêu cầu nhập đúng 4 số cuối số điện thoại hoặc mã PIN ủy quyền của nhân sự dịch vụ đó
    const expectedPin = partnerClaimConfirmTarget.phone.replace(/\D/g, '').slice(-4); // 4 số cuối SĐT
    if (partnerPinInput !== expectedPin && partnerPinInput !== '1234') {
      setPartnerPinError(`Mã xác nhận bảo mật không đúng! Vui lòng nhập đúng 4 số cuối số điện thoại của ${partnerClaimConfirmTarget.fullName} (Gợi ý: ...${expectedPin}) hoặc mã PIN bàn giao ca.`);
      return;
    }

    const partner = partnerClaimConfirmTarget;
    const dietLabel = partner.registeredDiet === 'VEGETARIAN' ? '🥗 Cơm Chay' : partner.registeredDiet === 'PORRIDGE' ? '🥣 Cháo Dinh Dưỡng' : '🍚 Cơm Mặn Thường';

    const newLog: MealPickupRecord = {
      id: 'LOG-MEAL-' + (pickupLogs.length + 1).toString().padStart(3, '0'),
      empId: partner.id,
      empName: `${partner.fullName} [${partner.roleTitle} - ${partner.partnerCompany}]`,
      phone: partner.phone,
      dept: 'Đối Tác Dịch Vụ Thuê Ngoài',
      mealShift: selectedShift,
      shiftName: shiftConfigs[selectedShift].name,
      pickupTime: currentTime.toLocaleTimeString('vi-VN') + ' ' + currentTime.toLocaleDateString('vi-VN'),
      pickupTimestamp: Date.now(),
      pickupType: 'OUTSOURCED_PROXY',
      proxyByEmpId: activeEmployee.id,
      proxyByEmpName: activeEmployee.fullName,
      specialDiet: partner.registeredDiet,
      dietLabel: `${dietLabel} (LĐ Dịch vụ: ${partner.roleTitle})`,
      securityHash: 'PARTNER-SEC-' + securityToken,
      status: 'CLAIMED'
    };

    setPickupLogs([newLog, ...pickupLogs]);
    setPartnerWorkers(prev => prev.map(p => p.id === partner.id ? { ...p, claimedShifts: [...p.claimedShifts, selectedShift] } : p));
    alert(`✓ ĐÃ XÁC THỰC ỦY QUYỀN HỢP LỆ!\nĐã xuất thành công suất ăn ca cho ${partner.fullName} (${partner.roleTitle}).`);
    setPartnerClaimConfirmTarget(null);
  };

  // Tự lấy cơm bản thân
  const handleConfirmSelfPickup = () => {
    if (existingLogForActiveEmp) {
      alert('⚠️ Bạn đã nhận suất ăn ca này rồi! Không thể nhận lần thứ 2 cho bản thân.');
      return;
    }

    const diet = specialDietRegistrations[activeEmployee.id] || 'NONE';
    const dietLabel = diet === 'VEGETARIAN' ? '🥗 CƠM CHAY' : diet === 'PORRIDGE' ? '🥣 CHÁO DINH DƯỠNG' : '🍚 Cơm Mặn Thường';

    const newLog: MealPickupRecord = {
      id: 'LOG-MEAL-' + (pickupLogs.length + 1).toString().padStart(3, '0'),
      empId: activeEmployee.id,
      empName: activeEmployee.fullName,
      phone: activeEmployee.phone || '0982.345.678',
      dept: activeEmployee.department || 'Nhà Máy',
      mealShift: selectedShift,
      shiftName: shiftConfigs[selectedShift].name,
      pickupTime: currentTime.toLocaleTimeString('vi-VN') + ' ' + currentTime.toLocaleDateString('vi-VN'),
      pickupTimestamp: Date.now(),
      pickupType: 'SELF',
      specialDiet: diet,
      dietLabel: dietLabel,
      securityHash: 'LIVE-' + securityToken + '-VERIFIED',
      status: 'CLAIMED'
    };

    setPickupLogs([newLog, ...pickupLogs]);
    setScreenMode('COMPLETED');
  };

  // Chọn lấy hộ đồng nghiệp
  const handleSelectProxyCandidate = (candidate: any) => {
    setProxyErrorMsg(null);

    if (candidate.id === activeEmployee.id) {
      setProxyErrorMsg('⚠️ Bạn không thể tự lấy hộ cho chính mình. Vui lòng chọn đồng nghiệp khác.');
      return;
    }

    const existingCandidateLog = pickupLogs.find(
      l => l.empId === candidate.id && l.mealShift === selectedShift
    );

    if (existingCandidateLog) {
      if (existingCandidateLog.pickupType === 'PROXY') {
        setProxyErrorMsg(
          `🚫 LỖI TRÙNG LẶP SUẤT ĂN:\nSuất ăn của ${candidate.fullName} (${candidate.id}) ĐÃ ĐƯỢC ĐỒNG NGHIỆP [${existingCandidateLog.proxyByEmpName} - ${existingCandidateLog.proxyByEmpId}] nhận hộ lúc ${existingCandidateLog.pickupTime}!`
        );
      } else {
        setProxyErrorMsg(
          `🚫 LỖI TRÙNG LẶP SUẤT ĂN:\nNhân viên ${candidate.fullName} (${candidate.id}) đã tự nhận suất ăn của mình lúc ${existingCandidateLog.pickupTime}!`
        );
      }
      return;
    }

    if (shiftTimeMode === 'EARLY') {
      const config = shiftConfigs[selectedShift];
      const eligibleTime = `${config.startHour}:${(config.startMinute + 30).toString().padStart(2, '0')}`;
      setProxyErrorMsg(
        `⏳ CHƯA ĐẾN THỜI GIAN LẤY HỘ:\nQuy định nhà máy chỉ cho phép lấy hộ sau 30 phút kể từ giờ bắt đầu ca ăn (từ ${eligibleTime}) để ưu tiên nhân sự ăn trực tiếp xếp hàng!`
      );
      return;
    }

    setProxyTargetEmpId(candidate.id);
    setScreenMode('PROXY_CONFIRM');
  };

  // Xác nhận lấy hộ đồng nghiệp xong
  const handleConfirmProxyPickup = () => {
    if (!proxyTargetEmployee) return;

    const diet = specialDietRegistrations[proxyTargetEmployee.id] || 'NONE';
    const dietLabel = diet === 'VEGETARIAN' ? '🥗 CƠM CHAY (NHẬN HỘ)' : diet === 'PORRIDGE' ? '🥣 CHÁO DINH DƯỠNG (NHẬN HỘ)' : '🍚 Cơm Mặn Thường (Nhận Hộ)';

    const newLog: MealPickupRecord = {
      id: 'LOG-MEAL-' + (pickupLogs.length + 1).toString().padStart(3, '0'),
      empId: proxyTargetEmployee.id,
      empName: proxyTargetEmployee.fullName,
      phone: proxyTargetEmployee.phone || '0971.888.999',
      dept: proxyTargetEmployee.department || 'Nhà Máy',
      mealShift: selectedShift,
      shiftName: shiftConfigs[selectedShift].name,
      pickupTime: currentTime.toLocaleTimeString('vi-VN') + ' ' + currentTime.toLocaleDateString('vi-VN'),
      pickupTimestamp: Date.now(),
      pickupType: 'PROXY',
      proxyByEmpId: activeEmployee.id,
      proxyByEmpName: activeEmployee.fullName,
      specialDiet: diet,
      dietLabel: dietLabel,
      securityHash: 'PROXY-' + securityToken + '-VERIFIED',
      status: 'CLAIMED'
    };

    setPickupLogs([newLog, ...pickupLogs]);
    setScreenMode('PROXY_COMPLETED');
  };

  // Lọc danh sách đồng nghiệp
  const filteredCandidates = defaultEmpList.filter(e => {
    const q = proxySearchTerm.toLowerCase();
    return e.id.toLowerCase().includes(q) || e.fullName.toLowerCase().includes(q);
  });

  // Tổng hợp số liệu nhà ăn
  const totalEmployeesInShift = defaultEmpList.length;
  const vegCount = defaultEmpList.filter(e => specialDietRegistrations[e.id] === 'VEGETARIAN').length;
  const porridgeCount = defaultEmpList.filter(e => specialDietRegistrations[e.id] === 'PORRIDGE').length;
  const regularCount = Math.max(0, totalEmployeesInShift - vegCount - porridgeCount);
  const claimedCount = pickupLogs.filter(l => l.mealShift === selectedShift).length;

  const totalGuestMeals = guestMealRequests.filter(r => r.shift === selectedShift && r.status === 'APPROVED').reduce((acc, r) => acc + r.guestCount, 0);
  const totalPartnerMeals = partnerWorkers.length;

  const securityColors = [
    'from-emerald-500 to-teal-600 border-emerald-400 text-emerald-100',
    'from-blue-500 to-cyan-600 border-blue-400 text-blue-100',
    'from-purple-500 to-indigo-600 border-purple-400 text-purple-100',
    'from-amber-500 to-orange-600 border-amber-400 text-amber-100',
    'from-rose-500 to-pink-600 border-rose-400 text-rose-100',
    'from-teal-500 to-emerald-600 border-teal-400 text-teal-100'
  ];

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Container To Bằng Mục Căn Cứ Pháp Lý (max-w-5xl h-[88vh] m-auto) Chính Giữa Màn Hình */}
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-h-[88vh] h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 m-auto transition-all ${
        deviceMode === 'LAPTOP_VIEW' ? 'max-w-5xl' : 'max-w-md'
      }`}>
        
        {/* THANH HEADER ĐIỀU HƯỚNG TỔNG QUAN */}
        <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between border-b border-slate-800 text-xs shrink-0 gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-sm tracking-tight">HỆ THỐNG ĐĂNG KÝ &amp; THẺ PHẦN ĂN CA (E-MEAL PASS)</span>
                <span className="px-1.5 py-0.2 bg-emerald-600 text-[9.5px] font-extrabold rounded text-white">SaaS Enterprise</span>
              </div>
              <span className="text-[10px] text-slate-400">Kiểm soát suất ăn nội bộ • Đăng ký Chay/Cháo • Tiếp Khách • Lao Động Dịch Vụ</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Chuyển đổi chế độ hiển thị Laptop vs Mobile */}
            <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setDeviceMode('LAPTOP_VIEW')}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  deviceMode === 'LAPTOP_VIEW' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Hiển thị giao diện màn hình rộng cho Laptop / PC"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Laptop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('MOBILE_VIEW')}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  deviceMode === 'MOBILE_VIEW' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Thu nhỏ mô phỏng màn hình điện thoại di động"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Di Động</span>
              </button>
            </div>

            {/* Tab: Thẻ Ăn vs Đối Soát Bếp (Chỉ hiển thị Đối Soát Bếp khi ở chế độ Quản Trị) */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('MEAL_PASS')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeTab === 'MEAL_PASS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Thẻ &amp; Đăng Ký
              </button>
              {!isEmployeeOnlyMode && (
                <button
                  type="button"
                  onClick={() => setActiveTab('KITCHEN_MONITOR')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'KITCHEN_MONITOR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Đối Soát Bếp Ăn ({pickupLogs.length})
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* THANH ĐIỀU HƯỚNG TEST NGHIỆP VỤ (MÔ PHỎNG LIVE) - Chỉ hiển thị cho Admin/Bếp trưởng thử nghiệm */}
        {!isEmployeeOnlyMode && (
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-[11px] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-semibold">Nhân sự:</span>
              <select
                value={activeEmpId}
                onChange={e => setActiveEmpId(e.target.value)}
                className="p-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 outline-none text-[11px]"
              >
                {defaultEmpList.map(e => (
                  <option key={e.id} value={e.id}>{e.fullName} ({e.id})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-semibold">Ca ăn:</span>
              <select
                value={selectedShift}
                onChange={e => setSelectedShift(e.target.value as MealShiftType)}
                className="p-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 outline-none text-[11px]"
              >
                <option value="LUNCH">Cơm Ca Trưa (11:30)</option>
                <option value="BREAKFAST">Suất Ăn Sáng (06:30)</option>
                <option value="DINNER">Cơm Ca Chiều (17:30)</option>
                <option value="NIGHT">Suất Ăn Đêm (22:00)</option>
              </select>
            </div>

            {/* Test Chấm Công Mô Phỏng */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-semibold" title="Thử nghiệm trạng thái chấm công của nhân sự">Chấm công:</span>
              <select
                value={checkInSimMode}
                onChange={e => setCheckInSimMode(e.target.value as any)}
                className={`p-1 border rounded-lg font-extrabold text-[11px] outline-none ${
                  checkInSimMode === 'WITHIN_30M' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : checkInSimMode === 'NOT_CHECKED_IN'
                    ? 'bg-slate-200 text-slate-700 border-slate-400'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                <option value="WITHIN_30M">✓ Đã Chấm Công (&lt; 30p)</option>
                <option value="NOT_CHECKED_IN">✕ Chưa Chấm Công (Khóa nút)</option>
                <option value="OVER_30M">⏳ Quá 30 Phút (Hết hạn)</option>
              </select>
            </div>

            {/* Test Đăng ký khách (< 1h vs >= 1h) */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-semibold" title="Mô phỏng thời gian đăng ký khách trước ca ăn">Giờ báo khách:</span>
              <select
                value={guestTimingSimMode}
                onChange={e => setGuestTimingSimMode(e.target.value as any)}
                className={`p-1 border rounded-lg font-bold text-[11px] outline-none ${
                  guestTimingSimMode === 'URGENT_UNDER_1H' ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                <option value="URGENT_UNDER_1H">⚠️ Dưới 1 tiếng (Cần duyệt HR)</option>
                <option value="NORMAL_ADVANCE">✓ Trước &gt; 1 tiếng (Đ.ký thẳng)</option>
              </select>
            </div>

            {/* Test Lấy Hộ */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 font-semibold">Test lấy hộ:</span>
              <select
                value={shiftTimeMode}
                onChange={e => setShiftTimeMode(e.target.value as any)}
                className={`p-1 border rounded-lg font-bold text-[11px] outline-none ${
                  shiftTimeMode === 'EARLY' ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
              >
                <option value="ELIGIBLE">Sau 30p (Hợp lệ)</option>
                <option value="EARLY">Trong 30p (Chặn)</option>
              </select>
            </div>
          </div>
        )}

        {/* NỘI DUNG CHÍNH: TAB 1 (THẺ ĂN & ĐĂNG KÝ) HOẶC TAB 2 (ĐỐI SOÁT BẾP) */}
        {activeTab === 'MEAL_PASS' ? (
          <div className={`flex-1 overflow-y-auto bg-slate-50/50 p-2 sm:p-2.5 select-none ${
            deviceMode === 'LAPTOP_VIEW' ? 'grid grid-cols-1 lg:grid-cols-12 gap-2' : 'flex flex-col space-y-1.5'
          }`}>
            
            {/* ════════════════ CỘT 1: THẺ E-MEAL PASS TRỌNG TÂM (LỚN VÀ RÕ RÀNG) ════════════════ */}
            <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-2 sm:p-3 flex flex-col justify-between ${
              deviceMode === 'LAPTOP_VIEW' ? 'lg:col-span-6 xl:col-span-6' : 'w-full'
            }`}>
              
              {/* TRƯỜNG HỢP A: ĐÃ ĐƯỢC DUYỆT NHẬN HỘ CHO ĐOÀN KHÁCH (HIỂN THỊ SỐ LƯỢNG RẤT TO) */}
              {screenMode === 'GUEST_CLAIM_READY' && activeGuestPickup ? (
                <div className="flex flex-col items-center justify-between text-center space-y-3 my-auto animate-in zoom-in-95">
                  <div className="w-full bg-amber-500 text-white p-2.5 rounded-2xl text-xs font-black uppercase tracking-wide shadow-md flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>XÁC NHẬN NHẬN PHẦN ĂN HỘ ĐOÀN KHÁCH</span>
                  </div>

                  {/* THẺ SỐ LƯỢNG KHÁCH KÍCH THƯỚC CỰC ĐẠI THEO YÊU CẦU */}
                  <div className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl shadow-xl border-4 border-amber-300/80 animate-pulse">
                    <span className="text-xs font-extrabold uppercase tracking-widest block text-amber-100">
                      SỐ LƯỢNG SUẤT LẤY HỘ CHO KHÁCH
                    </span>
                    <div className="flex items-center justify-center space-x-3 my-1">
                      <Utensils className="w-8 h-8 text-amber-200" />
                      <span className="text-5xl sm:text-7xl font-black font-mono tracking-tighter drop-shadow-md">
                        +{activeGuestPickup.guestCount.toString().padStart(2, '0')}
                      </span>
                      <span className="text-lg sm:text-xl font-black uppercase text-amber-100 leading-tight text-left">
                        SUẤT<br />KHÁCH
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-100 block bg-black/20 py-1 px-3 rounded-full mx-auto max-w-xs">
                      {activeGuestPickup.dietType === 'VEGETARIAN' ? '🥗 Khẩu phần: CƠM CHAY' : activeGuestPickup.dietType === 'PORRIDGE' ? '🥣 Khẩu phần: CHÁO' : '🍚 Khẩu phần: CƠM THƯỜNG'}
                    </span>
                  </div>

                  {/* QR To Chuẩn Zalo Đồng Bộ Thẻ Nhân Viên */}
                  <div className="p-3 bg-white border-2 border-slate-900 rounded-3xl shadow-md flex flex-col items-center">
                    {guestQrUrl ? (
                      <img
                        src={guestQrUrl}
                        alt="QR Đoàn Khách"
                        className="w-44 h-44 object-contain rounded-2xl"
                      />
                    ) : (
                      <QrCode className="w-44 h-44 text-slate-900 mx-auto" />
                    )}
                    <p className="text-[10px] font-mono text-slate-700 mt-1 uppercase font-bold tracking-tight">
                      MÃ QR ĐOÀN KHÁCH: #{activeGuestPickup.id}
                    </p>
                  </div>

                  {/* Thông tin đoàn khách */}
                  <div className="space-y-1 text-xs text-slate-700 font-medium bg-slate-50 w-full p-3 rounded-2xl border border-slate-200 text-left">
                    <p>Đơn vị khách: <b className="text-slate-900 text-sm">{activeGuestPickup.guestCompany}</b></p>
                    <p>Người đại diện: <b>{activeGuestPickup.contactPerson}</b></p>
                    <p>Người bảo lãnh nhận hộ: <b className="text-indigo-700">{activeEmployee.fullName}</b> ({activeEmployee.id})</p>
                    <p className="text-emerald-700 font-bold text-[11px] pt-1">
                      ✓ Đã được Phòng Nhân Sự duyệt cấp phát khẩn cấp
                    </p>
                  </div>

                  {/* Nút bấm xác nhận */}
                  <div className="grid grid-cols-2 gap-3 w-full pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmGuestPickup}
                      className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg cursor-pointer transition-all active:scale-98 tracking-wider uppercase"
                    >
                      XÁC NHẬN LẤY NGAY
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreenMode(existingLogForActiveEmp ? 'COMPLETED' : 'NORMAL')}
                      className="py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm sm:text-base rounded-2xl cursor-pointer transition-all active:scale-98 tracking-wider uppercase"
                    >
                      HỦY BỎ
                    </button>
                  </div>
                </div>

              ) : existingLogForActiveEmp && existingLogForActiveEmp.pickupType === 'PROXY' && screenMode !== 'PROXY_SEARCH' && screenMode !== 'PROXY_CONFIRM' && screenMode !== 'PROXY_COMPLETED' ? (
                /* TRƯỜNG HỢP B: BỊ CHẶN VÌ ĐÃ CÓ NGƯỜI LẤY HỘ */
                <div className="space-y-1.5 text-center my-auto p-3 rounded-3xl bg-rose-50/80 border-2 border-rose-300 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-rose-100 border-4 border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-rose-700 uppercase tracking-tight">
                      CẢNH BÁO: SUẤT ĂN ĐÃ ĐƯỢC LẤY HỘ!
                    </h3>
                    <p className="text-xs text-slate-700">
                      Suất ăn ca này của bạn đã được đồng nghiệp nhận thay tại quầy phát phần ăn.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-rose-200 text-xs text-left space-y-1">
                    <p className="text-slate-600">Đồng nghiệp nhận hộ: <b className="text-slate-900">{existingLogForActiveEmp.proxyByEmpName}</b> (Mã NV: <b>{existingLogForActiveEmp.proxyByEmpId}</b>)</p>
                    <p className="text-slate-600">Thời gian chốt nhận: <b className="font-mono text-rose-700 font-bold">{existingLogForActiveEmp.pickupTime}</b></p>
                    <p className="text-slate-600">Ca ăn: <b>{existingLogForActiveEmp.shiftName}</b></p>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    * Mỗi nhân viên chỉ được nhận tối đa 01 suất ăn/ca. Bạn không thể tự lấy thêm suất thứ hai.
                  </p>

                  <button
                    type="button"
                    onClick={() => setScreenMode('PROXY_SEARCH')}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Tôi muốn lấy hộ phần ăn cho người khác
                  </button>
                </div>

              ) : screenMode === 'PROXY_SEARCH' ? (
                /* TRƯỜNG HỢP C: TÌM KIẾM ĐỒNG NGHIỆP ĐỂ LẤY HỘ */
                <div className="space-y-3 my-auto animate-in fade-in">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h3 className="font-black text-slate-900 uppercase text-xs flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Chọn Đồng Nghiệp Muốn Lấy Hộ (Lần 2)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Tra cứu theo Mã Nhân Sự hoặc Họ Tên để xuất thẻ nhận hộ</p>
                    </div>
                  </div>

                  {proxyErrorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-medium whitespace-pre-line animate-shake">
                      {proxyErrorMsg}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nhập Mã NV (VD: AV-0418) hoặc tên đồng nghiệp..."
                      value={proxySearchTerm}
                      onChange={e => setProxySearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none font-medium"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {filteredCandidates.map(candidate => {
                      const alreadyClaimed = pickupLogs.some(
                        l => l.empId === candidate.id && l.mealShift === selectedShift
                      );
                      const candidateDiet = specialDietRegistrations[candidate.id] || 'NONE';

                      return (
                        <div
                          key={candidate.id}
                          onClick={() => handleSelectProxyCandidate(candidate)}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                            candidate.id === activeEmployee.id
                              ? 'bg-slate-50 border-slate-200 opacity-60'
                              : alreadyClaimed
                              ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                              : 'bg-white hover:bg-indigo-50/50 border-slate-200 hover:border-indigo-300 shadow-2xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900">{candidate.fullName}</span>
                              <span className="font-mono text-[10.5px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">
                                {candidate.id}
                              </span>
                              {candidateDiet === 'VEGETARIAN' && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded font-bold">Chay</span>
                              )}
                              {candidateDiet === 'PORRIDGE' && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded font-bold">Cháo</span>
                              )}
                            </div>
                            <span className="text-[10.5px] text-slate-500">{candidate.department} • SĐT: {candidate.phone}</span>
                          </div>

                          <div>
                            {candidate.id === activeEmployee.id ? (
                              <span className="text-[10px] text-slate-400 font-bold">Bản thân</span>
                            ) : alreadyClaimed ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                Đã lấy suất
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-0.5">
                                <span>Chọn lấy hộ</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setScreenMode(existingLogForActiveEmp ? 'COMPLETED' : 'NORMAL')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Quay Lại Thẻ Của Tôi
                    </button>
                  </div>
                </div>

              ) : screenMode === 'PROXY_CONFIRM' && proxyTargetEmployee ? (
                /* TRƯỜNG HỢP D: XÁC NHẬN LẤY HỘ ĐỒNG NGHIỆP */
                <div className="flex flex-col items-center justify-between text-center space-y-3 my-auto animate-in zoom-in-95">
                  <div className="w-full bg-amber-500 text-white p-2 rounded-xl text-xs font-black uppercase tracking-wide shadow-xs">
                    🤝 CHẾ ĐỘ: LẤY PHẦN ĂN HỘ ĐỒNG NGHIỆP
                  </div>

                  <div className="p-3.5 bg-white border-2 border-slate-900 rounded-3xl shadow-md flex flex-col items-center">
                    {proxyQrUrl ? (
                      <img
                        src={proxyQrUrl}
                        alt="QR Zalo Lấy Hộ"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-2xl"
                      />
                    ) : (
                      <QrCode className="w-48 h-48 sm:w-56 sm:h-56 text-slate-900 mx-auto" />
                    )}
                    <p className="text-[10.5px] font-mono text-slate-700 mt-1.5 uppercase font-bold tracking-tight">
                      MÃ QR ZALO SĐT LẤY HỘ: {proxyTargetEmployee.phone}
                    </p>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-emerald-600 uppercase tracking-tight">
                      ĐANG CHỌN MÓN ĂN HỘ
                    </h1>
                  </div>

                  <div className="space-y-1 text-xs text-slate-700 font-medium w-full">
                    <p className="text-sm">
                      Số điện thoại: <b className="font-mono text-lg text-slate-900 font-black">{proxyTargetEmployee.phone}</b>
                    </p>
                    <p className="text-lg font-black text-slate-900 uppercase">
                      Họ và tên: {proxyTargetEmployee.fullName} ({proxyTargetEmployee.id})
                    </p>
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-semibold mt-1">
                      Người nhận thay: <b className="text-indigo-800">{activeEmployee.fullName}</b> ({activeEmployee.id})
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmProxyPickup}
                      className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg cursor-pointer transition-all active:scale-98 tracking-wider uppercase"
                    >
                      ĐANG LẤY
                    </button>
                    <button
                      type="button"
                      onClick={() => setScreenMode(existingLogForActiveEmp ? 'COMPLETED' : 'NORMAL')}
                      className="py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm sm:text-base rounded-2xl cursor-pointer transition-all active:scale-98 tracking-wider uppercase"
                    >
                      CHƯA
                    </button>
                  </div>
                </div>

              ) : screenMode === 'COMPLETED' || screenMode === 'PROXY_COMPLETED' ? (
                /* TRƯỜNG HỢP E: ĐÃ LẤY XONG (CHỮ TO GẤP ĐÔI, TEST CHỐNG VIDEO PHÁT LẠI) */
                <div 
                  onClick={handleKitchenTouchVerify}
                  className="flex flex-col items-center justify-between text-center space-y-3 my-auto animate-in zoom-in-95 cursor-pointer relative"
                >
                  {/* CON DẤU XÁC THỰC SỐNG 1 CHẠM - CHIỀU CAO GẤP 4 LẦN ĐỂ DỄ BẤM */}
                  {touchVerifyActive ? (
                    <div className="w-full min-h-[96px] py-3 px-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center space-x-3 animate-bounce shadow-xl ring-2 ring-emerald-300">
                      <Fingerprint className="w-8 h-8 animate-spin" />
                      <span className="text-sm sm:text-base">✓ BẾP TRƯỞNG XÁC THỰC: ỨNG DỤNG SỐNG HỢP LỆ!</span>
                    </div>
                  ) : (
                    <div className={`w-full min-h-[96px] py-3 px-5 rounded-2xl text-xs font-bold flex items-center justify-between bg-gradient-to-r ${securityColors[securityColorIndex]} shadow-md hover:shadow-lg transition-all ring-2 ring-white/40 cursor-pointer`}>
                      <div className="flex items-center space-x-3 text-left">
                        <span className="relative flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                        </span>
                        <div>
                          <span className="font-black uppercase text-sm sm:text-base tracking-wide block text-white drop-shadow-xs">
                            MÀN HÌNH SỐNG • CHẠM VÀO ĐỂ TEST
                          </span>
                          <span className="text-[11px] text-white/80 font-medium block">
                            Chạm trực tiếp để đổi màu nền &amp; xác thực chống quay video gian lận
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-sm sm:text-base bg-black/40 px-3.5 py-2 rounded-xl text-white shadow-inner flex-shrink-0 ml-2">
                        MÃ: #{securityToken}
                      </span>
                    </div>
                  )}

                  {/* CHỮ ĐÃ LẤY XONG KÍCH THƯỚC TO GẤP ĐÔI */}
                  <div className="py-1">
                    <h1 className="text-4xl sm:text-6xl font-black text-emerald-600 uppercase tracking-tight leading-none drop-shadow-sm animate-pulse">
                      ĐÃ LẤY XONG
                    </h1>
                    <p className="text-xs text-slate-600 font-semibold mt-1">
                      Dơ màn hình điện thoại cho nhân viên phát phần ăn đọc
                    </p>
                  </div>

                  {/* THỜI GIAN THỰC RẤT TO */}
                  <div className="p-3 bg-slate-900 text-white rounded-2xl w-full border-2 border-emerald-500 shadow-md">
                    <p className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider">Thời gian chốt nhận suất ăn:</p>
                    <p className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-white">
                      {currentTime.toLocaleTimeString('vi-VN')}
                    </p>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      Thứ {currentTime.getDay() === 0 ? 'CN' : currentTime.getDay() + 1}, {currentTime.toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  {/* Thông tin xuống hàng */}
                  <div className="space-y-1 text-xs text-slate-700 font-medium bg-slate-50 w-full p-3 rounded-2xl border border-slate-200 text-left">
                    <p className="text-sm">Số điện thoại: <b className="font-mono text-base text-slate-900 font-bold">{activeEmployee.phone}</b></p>
                    <p className="text-base font-black text-slate-900 uppercase">Họ và tên: {activeEmployee.fullName} ({activeEmployee.id})</p>
                    <p className="text-xs text-slate-500">{activeEmployee.department} • {shiftConfigs[selectedShift].name}</p>
                    <p className="text-xs font-bold pt-1">
                      Khẩu phần: {activeEmployeeDiet === 'VEGETARIAN' ? <span className="text-emerald-700">🥗 Cơm Chay</span> : activeEmployeeDiet === 'PORRIDGE' ? <span className="text-amber-800">🥣 Cháo Dinh Dưỡng</span> : <span className="text-slate-700">🍚 Cơm Mặn Bình Thường</span>}
                    </p>
                  </div>

                  {/* Nút Lấy Hộ */}
                  <div className="w-full space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setScreenMode('PROXY_SEARCH')}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Users className="w-4 h-4" />
                      <span>Lấy Phần Ăn Hộ Đồng Nghiệp (Lần 2)</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                    >
                      Đóng Thẻ
                    </button>
                  </div>
                </div>

              ) : (
                /* TRƯỜNG HỢP F: MÀN HÌNH GỐC BAN ĐẦU */
                <div className="flex flex-col items-center justify-between text-center space-y-3 my-auto">
                  {/* Mã QR SĐT Rất To Chuẩn Zalo Quét Thành Công 100% Đồng Bộ Thẻ Nhân Viên */}
                  <div className="p-3.5 bg-white border-2 border-slate-900 rounded-3xl shadow-md flex flex-col items-center">
                    {canteenQrUrl ? (
                      <img
                        src={canteenQrUrl}
                        alt="QR Zalo Suất Ăn"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-2xl"
                      />
                    ) : (
                      <QrCode className="w-48 h-48 sm:w-56 sm:h-56 text-slate-900 mx-auto" />
                    )}
                    <p className="text-[10.5px] font-mono text-slate-700 mt-1.5 uppercase font-bold tracking-tight">
                      MÃ QR ZALO SĐT: {activeEmployee.phone || '0982.345.678'}
                    </p>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-emerald-600 uppercase tracking-tight">
                      ĐANG CHỌN MÓN ĂN
                    </h1>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Số điện thoại:</p>
                    <p className="font-mono text-xl sm:text-2xl font-black text-slate-900">
                      {activeEmployee.phone || '0982.345.678'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Họ và tên:</p>
                    <p className="text-lg sm:text-xl font-black text-slate-900 uppercase">
                      {activeEmployee.fullName} ({activeEmployee.id})
                    </p>
                    <p className="text-xs text-slate-500">{activeEmployee.department} • {shiftConfigs[selectedShift].name}</p>
                  </div>

                  <div className="p-2.5 bg-slate-900 text-white rounded-2xl w-full border border-slate-800">
                    <p className="text-[10px] text-emerald-400 uppercase font-bold">Ngày &amp; Thời gian thực tế:</p>
                    <p className="text-2xl sm:text-3xl font-mono font-black text-white">
                      {currentTime.toLocaleTimeString('vi-VN')}
                    </p>
                    <p className="text-xs text-slate-300 font-mono">
                      Thứ {currentTime.getDay() === 0 ? 'CN' : currentTime.getDay() + 1}, {currentTime.toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmSelfPickup}
                      className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg cursor-pointer transition-all active:scale-98 tracking-wider uppercase flex items-center justify-center space-x-1"
                    >
                      <span>ĐANG LẤY</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm sm:text-base rounded-2xl cursor-pointer transition-all active:scale-98 tracking-wider uppercase"
                    >
                      <span>CHƯA</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ════════════════ CỘT 2: KHU VỰC ĐĂNG KÝ ĐA NĂNG (LAPTOP VIEW) ════════════════ */}
            <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-2 sm:p-2.5 flex flex-col space-y-1.5 ${
              deviceMode === 'LAPTOP_VIEW' ? 'lg:col-span-6 xl:col-span-6' : 'w-full'
            }`}>
              
              {/* Menu Tab 3 Phân Hệ Đăng Ký */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveFeatureTab('PERSONAL_DIET')}
                  className={`flex-1 py-2 px-2 text-xs font-black rounded-xl transition-all text-center flex items-center justify-center space-x-1 cursor-pointer ${
                    activeFeatureTab === 'PERSONAL_DIET' ? 'bg-white text-emerald-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5" />
                  <span>1. Chay / Cháo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFeatureTab('GUEST_MEAL')}
                  className={`flex-1 py-2 px-2 text-xs font-black rounded-xl transition-all text-center flex items-center justify-center space-x-1 cursor-pointer ${
                    activeFeatureTab === 'GUEST_MEAL' ? 'bg-white text-indigo-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>2. Tiếp Khách ({guestMealRequests.filter(r => r.status === 'APPROVED').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFeatureTab('OUTSOURCED')}
                  className={`flex-1 py-2 px-2 text-xs font-black rounded-xl transition-all text-center flex items-center justify-center space-x-1 cursor-pointer ${
                    activeFeatureTab === 'OUTSOURCED' ? 'bg-white text-purple-800 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>3. Đối Tác Dịch Vụ</span>
                </button>
              </div>

              {/* PHÂN HỆ 1: ĐĂNG KÝ CHAY / CHÁO CỦA NHÂN VIÊN */}
              {activeFeatureTab === 'PERSONAL_DIET' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-emerald-900 uppercase">
                        QUY CHUẨN ĐĂNG KÝ: CHAY HOẶC CHÁO
                      </span>
                      {checkInSimMode === 'NOT_CHECKED_IN' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600">Chưa chấm công</span>
                      ) : checkInSimMode === 'OVER_30M' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Quá hạn 30p</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-200 text-emerald-900">Trong 30p vàng</span>
                      )}
                    </div>

                    <p className="text-[11.5px] text-slate-600 leading-relaxed">
                      💡 <b>Cơm thường KHÔNG CẦN ĐĂNG KÝ</b> (tự động theo chấm công). Chỉ bấm chọn khi bạn có nhu cầu dùng <b>CƠM CHAY</b> hoặc <b>CHÁO DINH DƯỠNG</b>.
                    </p>

                    {/* 3 Nút Chay, Cháo, Hủy */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRegisterDiet('VEGETARIAN')}
                        disabled={checkInSimMode === 'NOT_CHECKED_IN'}
                        className={`py-2.5 px-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                          checkInSimMode === 'NOT_CHECKED_IN'
                            ? 'bg-transparent text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                            : activeEmployeeDiet === 'VEGETARIAN'
                            ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        <Leaf className="w-3.5 h-3.5" />
                        <span>CHAY</span>
                        {activeEmployeeDiet === 'VEGETARIAN' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRegisterDiet('PORRIDGE')}
                        disabled={checkInSimMode === 'NOT_CHECKED_IN'}
                        className={`py-2.5 px-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                          checkInSimMode === 'NOT_CHECKED_IN'
                            ? 'bg-transparent text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                            : activeEmployeeDiet === 'PORRIDGE'
                            ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400'
                            : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>CHÁO</span>
                        {activeEmployeeDiet === 'PORRIDGE' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRegisterDiet('NONE')}
                        disabled={checkInSimMode === 'NOT_CHECKED_IN'}
                        className={`py-2.5 px-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                          checkInSimMode === 'NOT_CHECKED_IN'
                            ? 'bg-transparent text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                            : activeEmployeeDiet === 'NONE'
                            ? 'bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                        }`}
                      >
                        <span>HỦY</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                    <span className="text-slate-600">Khẩu phần đã chọn:</span>
                    <span className="font-bold">
                      {activeEmployeeDiet === 'VEGETARIAN' ? (
                        <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                          🥗 Đã Đăng Ký: CƠM CHAY
                        </span>
                      ) : activeEmployeeDiet === 'PORRIDGE' ? (
                        <span className="text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                          🥣 Đã Đăng Ký: CHÁO DINH DƯỠNG
                        </span>
                      ) : (
                        <span className="text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          🍚 Cơm Bình Thường (Tự Động)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* PHÂN HỆ 2: ĐĂNG KÝ SUẤT ĂN CHO KHÁCH (GUEST MEAL WORKFLOW) */}
              {activeFeatureTab === 'GUEST_MEAL' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-indigo-900 uppercase">Quy Trình Tiếp Khách &amp; Mời Cơm Ca</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {guestTimingSimMode === 'URGENT_UNDER_1H' ? 'Dưới 1 giờ (Khẩn cấp)' : 'Trước >= 1 giờ'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Đăng ký trước 1 tiếng: Nhà bếp tự động chuẩn bị. Nếu <b>dưới 1 tiếng trước giờ ăn</b>: Cần liên hệ trực tiếp Nhà Ăn và chuyển Phòng Nhân Sự duyệt để lấy ngay.
                    </p>
                  </div>

                  {/* Form Nhập Đăng Ký Khách */}
                  <form onSubmit={handleSubmitGuestMeal} className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-600 block mb-1">Tên Công Ty / Đoàn Khách *</label>
                        <input
                          type="text"
                          required
                          placeholder="VD: Cty Kỹ Thuật Tân Á..."
                          value={newGuestForm.guestCompany}
                          onChange={e => setNewGuestForm({ ...newGuestForm, guestCompany: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-600 block mb-1">Người Đại Diện Khách *</label>
                        <input
                          type="text"
                          required
                          placeholder="VD: Kỹ sư Đặng Văn Dũng"
                          value={newGuestForm.contactPerson}
                          onChange={e => setNewGuestForm({ ...newGuestForm, contactPerson: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-600 block mb-1">Số Lượng Khách (Suất)</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={newGuestForm.guestCount}
                          onChange={e => setNewGuestForm({ ...newGuestForm, guestCount: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 text-xs font-black rounded-xl border border-slate-300 focus:border-indigo-600 outline-none text-indigo-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10.5px] font-bold text-slate-600 block mb-1">Chế Độ Ăn Của Khách</label>
                        <select
                          value={newGuestForm.dietType}
                          onChange={e => setNewGuestForm({ ...newGuestForm, dietType: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-indigo-600 outline-none font-semibold"
                        >
                          <option value="NONE">🍚 Cơm Mặn Thường</option>
                          <option value="VEGETARIAN">🥗 Cơm Chay</option>
                          <option value="PORRIDGE">🥣 Cháo Dinh Dưỡng</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>ĐĂNG KÝ PHẦN ĂN CHO KHÁCH</span>
                    </button>
                  </form>

                  {/* Danh Sách Yêu Cầu Khách Đang Xử Lý */}
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {guestMealRequests.map(req => (
                      <div key={req.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{req.guestCompany}</span>
                            <span className="text-[10.5px] text-slate-500">Đại diện: {req.contactPerson} • Tiếp đón: {req.hostEmpName}</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                            {req.guestCount} SUẤT
                          </span>
                        </div>

                        {/* Thanh Trạng Thái Duyệt Của Khách Gấp */}
                        {req.isUrgentUnder1Hour && req.status !== 'CLAIMED' && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] space-y-1.5">
                            <span className="text-amber-800 font-bold block">
                              ⚠️ Dưới 1 tiếng trước giờ ăn: Vui lòng liên hệ trực tiếp Nhà Ăn
                            </span>
                            <div className="flex items-center space-x-2">
                              {!isEmployeeOnlyMode ? (
                                <>
                                  {!req.canteenConfirmed ? (
                                    <button
                                      type="button"
                                      onClick={() => handleCanteenConfirmGuest(req.id)}
                                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                                    >
                                      Nhà Ăn Đồng Ý (Chuyển duyệt HR)
                                    </button>
                                  ) : !req.hrApproved ? (
                                    <button
                                      type="button"
                                      onClick={() => handleHrApproveGuest(req.id)}
                                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] cursor-pointer animate-pulse"
                                    >
                                      Phòng Nhân Sự Phê Duyệt Ngay
                                    </button>
                                  ) : (
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                      <CheckCheck className="w-3.5 h-3.5" />
                                      <span>Đã duyệt xong! Có thể lấy hộ ngay</span>
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-amber-800 font-bold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>
                                    {!req.canteenConfirmed 
                                      ? 'Đang chờ Nhà Ăn xác nhận nguyên liệu...' 
                                      : !req.hrApproved 
                                      ? 'Đang chờ Phòng Hành Chính / HR phê duyệt...' 
                                      : 'Đã phê duyệt!'}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Nút bấm Nhận Hộ Ngay Cho Khách */}
                        {req.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenGuestPickupPass(req)}
                            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <Utensils className="w-3.5 h-3.5" />
                            <span>MỞ THẺ NHẬN HỘ (+{req.guestCount} SUẤT KHÁCH)</span>
                          </button>
                        )}

                        {req.status === 'CLAIMED' && (
                          <div className="text-center py-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 rounded-lg">
                            ✓ Đã nhận xong phần ăn cho đoàn khách
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PHÂN HỆ 3: ĐỐI TÁC DỊCH VỤ (BẢO VỆ, TẠP VỤ, LAO ĐỘNG THUÊ NGOÀI) */}
              {activeFeatureTab === 'OUTSOURCED' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-purple-900 uppercase">NHÓM: ĐỐI TÁC DỊCH VỤ (BẢO VỆ &amp; TẠP VỤ)</span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Thuê Ngoài
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Ghi nhận và xuất suất ăn cho nhân sự đối tác dịch vụ bên ngoài (không thuộc nhân viên công ty). Có đầy đủ họ tên chi tiết và đơn vị cung cấp để đối soát chi phí.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {partnerWorkers.map(p => {
                      const isClaimed = p.claimedShifts.includes(selectedShift);
                      return (
                        <div key={p.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-black text-slate-900">{p.fullName}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                p.roleType === 'SECURITY' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {p.roleTitle}
                              </span>
                            </div>
                            <span className="text-[10.5px] text-slate-500 block">{p.partnerCompany} • SĐT: {p.phone}</span>
                            <span className="text-[10px] font-bold text-indigo-700">
                              Khẩu phần: {p.registeredDiet === 'VEGETARIAN' ? '🥗 Cơm Chay' : p.registeredDiet === 'PORRIDGE' ? '🥣 Cháo Dinh Dưỡng' : '🍚 Cơm Thường'}
                            </span>
                          </div>

                          <div>
                            {isClaimed ? (
                              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                ✓ Đã Lấy Suất
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenPartnerClaimConfirm(p)}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                              >
                                Xuất Thẻ Ăn
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          /* ════════════════════ VIEW 2: MÀN HÌNH ĐỐI SOÁT BẾP ĂN TOÀN DIỆN ════════════════════ */
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 bg-slate-50 text-xs">
            {/* THẺ TỔNG HỢP SUẤT ĂN CA DÀNH CHO NHÀ ĂN */}
            <div className="p-2 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2">
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                      Bảng Tổng Hợp Suất Ăn Ca ({shiftConfigs[selectedShift].name})
                    </h3>
                    <p className="text-[11px] text-slate-500">Số liệu chuẩn xác gửi nhà bếp chuẩn bị nguyên liệu chế biến</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Tổng Chấm Công: {totalEmployeesInShift} Lao Động
                </span>
              </div>

              {/* 5 Khối Số Liệu Tổng Hợp */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Cơm Mặn Thường</span>
                  <span className="text-2xl font-black text-slate-900 block mt-0.5">{regularCount}</span>
                  <span className="text-[9.5px] text-slate-400">(Tự động theo ca)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Cơm Chay</span>
                  <span className="text-2xl font-black text-emerald-700 block mt-0.5">{vegCount}</span>
                  <span className="text-[9.5px] text-emerald-600">(Đ.Ký trong 30p)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Cháo Dinh Dưỡng</span>
                  <span className="text-2xl font-black text-amber-700 block mt-0.5">{porridgeCount}</span>
                  <span className="text-[9.5px] text-amber-600">(Đ.Ký trong 30p)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase block">Tiếp Khách</span>
                  <span className="text-2xl font-black text-indigo-700 block mt-0.5">+{totalGuestMeals}</span>
                  <span className="text-[9.5px] text-indigo-600">(HR đã duyệt)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">Đối Tác Dịch Vụ</span>
                  <span className="text-2xl font-black text-purple-700 block mt-0.5">{totalPartnerMeals}</span>
                  <span className="text-[9.5px] text-purple-600">Bảo vệ &amp; Tạp vụ</span>
                </div>
              </div>
            </div>

            {/* DÒNG SỰ KIỆN ĐỐI SOÁT THỰC NHẬN */}
            <div className="p-2 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>Dòng Sự Kiện Đã Phát Phần Ăn Thực Tế</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">Tự động lưu vết</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {pickupLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900 text-xs">{log.empName}</span>
                        <span className="font-mono text-[10px] text-indigo-700 font-bold">({log.empId})</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {log.dietLabel || 'Cơm Mặn Thường'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.pickupType === 'GUEST_PROXY' 
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-black' 
                          : log.pickupType === 'OUTSOURCED_PROXY'
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : log.pickupType === 'PROXY' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {log.pickupType === 'GUEST_PROXY' ? 'Khách Mời' : log.pickupType === 'OUTSOURCED_PROXY' ? 'LĐ Dịch Vụ' : log.pickupType === 'PROXY' ? 'Nhận Hộ' : 'Tự Lấy'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center justify-between">
                      <span>SĐT: <b className="font-mono">{log.phone}</b> • {log.dept}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.2 rounded border">
                        {log.securityHash}
                      </span>
                    </div>

                    {(log.pickupType === 'PROXY' || log.pickupType === 'GUEST_PROXY' || log.pickupType === 'OUTSOURCED_PROXY') && (
                      <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 font-medium">
                        Người bảo lãnh/nhận thay: <b>{log.proxyByEmpName}</b> ({log.proxyByEmpId})
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-1 border-t border-slate-200">
                      <span className="font-medium text-emerald-700">{log.shiftName}</span>
                      <span className="font-mono font-bold text-slate-800">{log.pickupTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL XÁC THỰC ỦY QUYỀN BẢO VỆ / TẠP VỤ (CHỐNG LÁCH LUẬT LẤY SUẤT ĂN LẦN 2) */}
      {partnerClaimConfirmTarget && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-2.5 shadow-2xl space-y-1.5 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2 text-purple-700">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-black text-sm uppercase text-slate-900">Xác Thực Ủy Quyền Nhận Suất Ăn</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPartnerClaimConfirmTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-1">
              <span className="font-bold text-purple-900 block">Nhân sự đối tác thụ hưởng suất ăn:</span>
              <p className="font-black text-slate-900 text-sm">{partnerClaimConfirmTarget.fullName} ({partnerClaimConfirmTarget.roleTitle})</p>
              <p className="text-slate-600 text-[11px]">{partnerClaimConfirmTarget.partnerCompany} • SĐT: {partnerClaimConfirmTarget.phone}</p>
              <p className="text-purple-800 font-semibold text-[11px] pt-1">
                Người thực hiện lấy thay: <b>{activeEmployee.fullName}</b> ({activeEmployee.id})
              </p>
            </div>

            {partnerPinError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {partnerPinError}
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 block">
                Nhập 4 số cuối SĐT của {partnerClaimConfirmTarget.fullName} (hoặc mã PIN ca): *
              </label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="Nhập 4 số cuối SĐT (VD: 1222 hoặc 1234)..."
                value={partnerPinInput}
                onChange={e => setPartnerPinInput(e.target.value)}
                className="w-full p-2.5 text-sm font-mono font-bold tracking-widest text-center border-2 border-purple-300 focus:border-purple-600 rounded-xl outline-none bg-slate-50"
              />
              <p className="text-[10.5px] text-slate-400 italic">
                * Biện pháp kiểm soát chống giả mạo danh nghĩa bảo vệ/tạp vụ để trục lợi phần ăn lần hai.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={handleExecutePartnerClaim}
                className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Xác Nhận Xuất Suất
              </button>
              <button
                type="button"
                onClick={() => setPartnerClaimConfirmTarget(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  ) : null;
};
