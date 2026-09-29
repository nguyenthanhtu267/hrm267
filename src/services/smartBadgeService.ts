import QRCode from 'qrcode';

export interface SmartBadgeConfig {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  position: string;
  department: string;
  isManagerLevel: boolean;
  phone: string;
  rfidUid: string;
  avatarInitial?: string;
  photoUrl?: string;
  issueDate: string;
  expiryDate: string;
  
  // Trạng thái in ấn (Poka-Yoke phân biệt Chưa In vs Đã In vs Cấp Lại)
  printStatus: 'NOT_PRINTED' | 'PRINTED' | 'REISSUED';
  printedDate?: string;
  orientation: 'VERTICAL' | 'HORIZONTAL'; // Thẻ đứng vs Thẻ ngang
  
  // Phân quyền 4-trong-1
  parkingEnabled: boolean;
  parkingType: 'MOTO_B1' | 'AUTO_B2_VIP';
  licensePlate?: string;
  
  elevatorEnabled: boolean;
  elevatorFloors: string[]; // ['B1', 'T1', 'T2', 'T3', 'T4']
  
  doorAccessEnabled: boolean;
  doorAccessZones: string[]; // ['Cổng Chính', 'Văn Phòng', 'Xưởng SX', 'Server IT']
  
  attendanceRfidEnabled: boolean;
  canteenMealQrEnabled: boolean;
}

export const cleanVietnamesePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length === 11) {
    return '0' + digits.substring(2);
  }
  return digits;
};

export const getZaloProfileUrl = (phone: string): string => {
  const clean = cleanVietnamesePhone(phone);
  return `https://zalo.me/${clean}`;
};

export const generateZaloBadgeQR = async (phone: string): Promise<string> => {
  const url = getZaloProfileUrl(phone);
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 360,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#00483d', // Xanh đậm nhận diện sắc nét
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR:', err);
    return '';
  }
};

export const initialSmartBadges: Record<string, SmartBadgeConfig> = {
  'NH-VIP-01': {
    employeeId: 'NH-VIP-01',
    employeeCode: 'AV-0012',
    fullName: 'ÔNG HOÀNG VĂN BÁCH',
    position: 'TRƯỞNG PHÒNG CÔNG NGHỆ THÔNG TIN & CHUYỂN ĐỔI SỐ',
    department: 'Phòng Công Nghệ & Tự Động Hóa Doanh Nghiệp',
    isManagerLevel: true,
    phone: '0984963084',
    rfidUid: 'RFID-8496-3084-VIP',
    avatarInitial: 'HB',
    issueDate: '09/09/2026',
    expiryDate: '09/09/2029',
    printStatus: 'NOT_PRINTED',
    orientation: 'HORIZONTAL', // Trưởng phòng chuộng thẻ ngang
    parkingEnabled: true,
    parkingType: 'AUTO_B2_VIP',
    licensePlate: '51K-889.99 (Ô tô riêng B2-08)',
    elevatorEnabled: true,
    elevatorFloors: ['B2', 'B1', 'T1', 'T2', 'T3', 'T4', 'T5'],
    doorAccessEnabled: true,
    doorAccessZones: ['Cổng Chính 24/7', 'Phòng IT Server', 'Phòng Ban Giám Đốc', 'Khu Văn Phòng Tầng 3'],
    attendanceRfidEnabled: true,
    canteenMealQrEnabled: true,
  },
  'NH-EMP-01': {
    employeeId: 'NH-EMP-01',
    employeeCode: 'AV-0891',
    fullName: 'BÀ NGUYỄN THU HÀ',
    position: 'Chuyên Viên Phân Tích Dữ Liệu C&B',
    department: 'Phòng Nhân Sự',
    isManagerLevel: false,
    phone: '0988223344',
    rfidUid: 'RFID-8822-3344-EMP',
    avatarInitial: 'TH',
    issueDate: '09/09/2026',
    expiryDate: '09/09/2028',
    printStatus: 'NOT_PRINTED',
    orientation: 'VERTICAL',
    parkingEnabled: true,
    parkingType: 'MOTO_B1',
    licensePlate: '59-P1 234.56 (Bãi xe máy B1-42)',
    elevatorEnabled: true,
    elevatorFloors: ['B1', 'T1', 'T2', 'T3'],
    doorAccessEnabled: true,
    doorAccessZones: ['Cổng Chính', 'Khối Văn Phòng Tầng 2', 'Phòng Nhân Sự HR-06'],
    attendanceRfidEnabled: true,
    canteenMealQrEnabled: true,
  },
  'NH-EMP-02': {
    employeeId: 'NH-EMP-02',
    employeeCode: 'AV-0922',
    fullName: 'ÔNG TRẦN THANH BÌNH',
    position: 'Kỹ Sư Vận Hành Dây Chuyền Chiết Rót',
    department: 'Xưởng Sản Xuất 1 - Khối Nhà Máy',
    isManagerLevel: false,
    phone: '0912349988',
    rfidUid: 'RFID-1234-9988-FAC',
    avatarInitial: 'TB',
    issueDate: '09/09/2026',
    expiryDate: '09/09/2028',
    printStatus: 'NOT_PRINTED',
    orientation: 'VERTICAL',
    parkingEnabled: true,
    parkingType: 'MOTO_B1',
    licensePlate: '61-D1 678.90 (Bãi xe công nhân Nhà máy)',
    elevatorEnabled: true,
    elevatorFloors: ['T1', 'T2'],
    doorAccessEnabled: true,
    doorAccessZones: ['Cổng Nhà Máy 1', 'Cửa Phân Xưởng Chiết Rót', 'Kho Nguyên Liệu', 'Phòng Kỹ Thuật Xưởng'],
    attendanceRfidEnabled: true,
    canteenMealQrEnabled: true,
  },
  'NH-EMP-03': {
    employeeId: 'NH-EMP-03',
    employeeCode: 'AV-0935',
    fullName: 'BÀ LÊ MAI ANH',
    position: 'Chuyên Viên Kiểm Soát Chất Lượng (QA)',
    department: 'Phòng Đảm Bảo Chất Lượng & ISO',
    isManagerLevel: false,
    phone: '0903882211',
    rfidUid: 'RFID-3882-2110-QA',
    avatarInitial: 'MA',
    issueDate: '08/09/2026',
    expiryDate: '08/09/2028',
    printStatus: 'PRINTED',
    printedDate: '08/09/2026 14:30',
    orientation: 'HORIZONTAL',
    parkingEnabled: true,
    parkingType: 'MOTO_B1',
    licensePlate: '59-S2 998.11',
    elevatorEnabled: true,
    elevatorFloors: ['T1', 'T2'],
    doorAccessEnabled: true,
    doorAccessZones: ['Cổng Chính', 'Phòng Lab QA', 'Phân Xưởng Chế Biến'],
    attendanceRfidEnabled: true,
    canteenMealQrEnabled: true,
  }
};

export interface BadgeReissueRequest {
  id: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  phone: string;
  requestDate: string;
  reason: 'LOST_CARD' | 'DAMAGED_CHIP' | 'BROKEN_CARD' | 'CHANGE_INFO';
  reasonLabel: string;
  fee: number; // 10.000 VNĐ
  paymentNote: string;
  hrVisualVerified: boolean; // Nhân sự kiểm tra bằng mắt thường
  hrVerifiedBy?: string;
  hrVerifiedDate?: string;
  status: 'PENDING_HR_CHECK' | 'READY_TO_PRINT' | 'PRINTED_DELIVERED';
  badgeConfig: SmartBadgeConfig;
}

export const initialReissueRequests: BadgeReissueRequest[] = [
  {
    id: 'REISSUE-001',
    employeeId: 'NH-EMP-01',
    employeeCode: 'AV-0891',
    fullName: 'BÀ NGUYỄN THU HÀ',
    department: 'Phòng Nhân Sự',
    position: 'Chuyên Viên Phân Tích Dữ Liệu C&B',
    phone: '0988223344',
    requestDate: '09/09/2026',
    reason: 'LOST_CARD',
    reasonLabel: 'Làm rơi mất thẻ gửi xe & thẻ tên trên đường đi làm',
    fee: 10000,
    paymentNote: 'Đã đóng 10.000đ tiền mặt tại quầy thủ quỹ (Không cần ghi vào bảng lương)',
    hrVisualVerified: true,
    hrVerifiedBy: 'Phan Mai Lan (HR Manager)',
    hrVerifiedDate: '09/09/2026 08:30',
    status: 'READY_TO_PRINT',
    badgeConfig: initialSmartBadges['NH-EMP-01'],
  },
  {
    id: 'REISSUE-002',
    employeeId: 'NH-EMP-02',
    employeeCode: 'AV-0922',
    fullName: 'ÔNG TRẦN THANH BÌNH',
    department: 'Xưởng Sản Xuất 1 - Khối Nhà Máy',
    position: 'Kỹ Sư Vận Hành Dây Chuyền Chiết Rót',
    phone: '0912349988',
    requestDate: '09/09/2026',
    reason: 'DAMAGED_CHIP',
    reasonLabel: 'Thẻ bị gãy góc không quẹt được cửa phân xưởng',
    fee: 10000,
    paymentNote: 'Đã nộp 10.000đ cho thủ quỹ ca 1',
    hrVisualVerified: false,
    status: 'PENDING_HR_CHECK',
    badgeConfig: initialSmartBadges['NH-EMP-02'],
  }
];
