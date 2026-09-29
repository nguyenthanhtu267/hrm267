import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building, 
  Calendar, 
  Users, 
  Clock, 
  Coffee, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  X, 
  Eye, 
  Printer, 
  Check, 
  Sparkles, 
  MapPin, 
  Laptop, 
  AlertTriangle, 
  ClipboardCheck, 
  QrCode, 
  Video, 
  Camera, 
  LogIn, 
  LogOut, 
  Key, 
  FileSignature, 
  UserCheck, 
  ShieldCheck, 
  CheckCheck, 
  HardHat, 
  Gift, 
  DoorOpen, 
  Monitor, 
  Maximize2, 
  Minimize2, 
  Thermometer, 
  Wifi, 
  Sliders, 
  Award, 
  ListChecks, 
  ArrowRight,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';

interface ReceptionAndMeetingHubProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
}

// 6 PHÂN HỆ CHUYÊN BIỆT HÓA
export type ReceptionSubCategory = 
  | 'ROOM_HUB'                // 1. Sơ Đồ & Điều Phối Phòng Họp IoT
  | 'TIMELINE_MATRIX'         // 2. Ma Trận Timeline Khung Giờ & AI Booking
  | 'VIP_DELEGATIONS'         // 3. Nghiệp Vụ Đón Tiếp Khách VIP & Banner LED
  | 'GATE_HSE_CONTROL'        // 4. Kiểm Soát Cổng An Toàn & Cấp Thẻ Ra/Vào
  | 'MEETING_SERVICES'        // 5. Hậu Cần Cuộc Họp & Biên Bản Ký Số
  | 'BUDGET_GIFTS_ANALYTICS'; // 6. Ngân Sách Tiếp Khách, Kho Quà Tặng & Báo Cáo

interface MeetingRoomIoT {
  acTemp: number;
  acRunning: boolean;
  polycom4kOnline: boolean;
  smartDisplayOnline: boolean;
  motionDetected: boolean;
  doorLocked: boolean;
  co2Ppm: number;
}

export interface MeetingRoomData {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  roomType: 'VIP_BOARDROOM' | 'CONFERENCE_HALL' | 'EXECUTIVE' | 'WORKSHOP_OPS' | 'BRAINSTORM_LAB';
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'CLEANING';
  currentMeeting?: string;
  meetingEndTime?: string;
  organizer?: string;
  attendeesCount?: number;
  amenities: string[];
  techLead: string;
  hourlyRate: number;
  iot: MeetingRoomIoT;
}

export interface ScheduledMeeting {
  id: string;
  title: string;
  roomId: string;
  roomName: string;
  type: 'GOVERNMENT' | 'AUDIT' | 'PARTNER' | 'INTERNAL_MEETING' | 'TRAINING';
  typeName: string;
  organization: string;
  visitorCount: number;
  leadVisitor: string;
  hostEmployee: string;
  date: string;
  startTime: string; // '09:00'
  endTime: string;   // '11:30'
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  teaAndSnacks: string;
  cateringCost: number;
  giftsGiven: string[];
  layout: 'U_SHAPE' | 'BOARDROOM' | 'CLASSROOM' | 'THEATER';
  itSupportRequested: boolean;
  minutesNotes?: string;
  actionItems?: Array<{
    id: string;
    task: string;
    assignee: string;
    deadline: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  }>;
}

export interface VipDelegation {
  id: string;
  title: string;
  type: 'GOVERNMENT' | 'AUDIT' | 'PARTNER';
  organization: string;
  visitorCount: number;
  leadVisitor: string;
  hostEmployee: string;
  date: string;
  time: string;
  room: string;
  purpose: string;
  bannerTheme: 'RED_GOLD' | 'NAVY_SILVER' | 'ROYAL_GOLD';
  welcomeBannerText: string;
  teaAndSnacks: string;
  giftAssigned: string;
  vehiclePlate: string;
  protocolSteps: Array<{
    step: number;
    time: string;
    title: string;
    location: string;
    inCharge: string;
    completed: boolean;
  }>;
}

export interface VisitorGateLog {
  id: string;
  fullName: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  company: string;
  phone: string;
  hostPerson: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'IN_PREMISES' | 'CHECKED_OUT';
  visitorCategory: 'VIP_GUEST' | 'GOV_DELEGATE' | 'OUTSOURCED_PARTNER' | 'CONTRACTOR';
  categoryLabel: string;
  safetyTestPassed: boolean;
  safetyTestType: 'QR_MOBILE' | 'PAPER_FORM' | 'EXEMPT';
  ppeIssued: string[];
  vehiclePlate?: string;
  note: string;
}

export interface LostParkingWitness {
  id: string;
  name: string;
  empId: string;
  roleDesc: string;
  confirmed: boolean;
  reasonNote: string;
  confirmedAt?: string;
}

export interface LostParkingCardReport {
  id: string;
  empId: string;
  empName: string;
  department: string;
  cardIdLost: string;
  plateNumber: string;
  vehicleModel: string;
  issueDate: string;
  status: 'WAITING_WITNESS' | 'WITNESS_CONFIRMED' | 'RELEASED_AND_LOCKED';
  witnesses: LostParkingWitness[];
  securityGuardConfirmed: boolean;
  guardName: string;
  releaseTime: string;
  cameraPlateSnapshotUrl: string;
  driverLicenseVerified: boolean;
  vehicleRegistrationVerified: boolean;
}

export interface GiftInventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStockAlert: number;
  unitCost: number;
  recipientLevel: string;
  giftHistory: Array<{
    date: string;
    partnerName: string;
    delegateName: string;
    quantity: number;
    eventTitle: string;
  }>;
}

export const ReceptionAndMeetingHub: React.FC<ReceptionAndMeetingHubProps> = ({
  policy,
  employees,
  currentRole
}) => {
  const [activeTab, setActiveTab] = useState<ReceptionSubCategory>('ROOM_HUB');

  // ==========================================
  // 1. DATA: DANH MỤC PHÒNG HỌP IOT THÔNG MINH
  // ==========================================
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoomData[]>([
    {
      id: 'ROOM-VIP-01',
      name: 'Phòng Khánh Tiết VIP Boardroom',
      floor: 'Tầng 5 - Khu Điều Hành',
      capacity: 16,
      roomType: 'VIP_BOARDROOM',
      status: 'IN_USE',
      currentMeeting: 'Đoàn Chuyên Gia Kỹ Thuật Sumitomo (Khảo sát Tự động hóa)',
      meetingEndTime: '16:30',
      organizer: 'Tổng Giám Đốc & Giám Đốc Kỹ Thuật',
      attendeesCount: 12,
      amenities: ['Màn hình LED 86 inch 4K', 'Polycom 4K Tracking', 'Micro cổ ngỗng không dây', 'Bàn trà đạo VIP', 'A/C 2 chiều độc lập', 'Rèm tự động'],
      techLead: 'Kỹ sư CNTT Trần Văn Bình (0912.345.678)',
      hourlyRate: 500000,
      iot: {
        acTemp: 23,
        acRunning: true,
        polycom4kOnline: true,
        smartDisplayOnline: true,
        motionDetected: true,
        doorLocked: true,
        co2Ppm: 540
      }
    },
    {
      id: 'ROOM-HALL-02',
      name: 'Hội Trường Lớn Grand Conference Hall',
      floor: 'Tầng 2 - Khối Trung Tâm',
      capacity: 120,
      roomType: 'CONFERENCE_HALL',
      status: 'AVAILABLE',
      amenities: ['Máy chiếu Laser 10.000 Ansi', 'Âm thanh vòm JBL 8 loa', 'Hệ thống 4 Micro không dây', 'Bục phát biểu gỗ sồi', 'Cabin dịch song ngữ cabin 2 người'],
      techLead: 'Kỹ sư CNTT Trần Văn Bình',
      hourlyRate: 1200000,
      iot: {
        acTemp: 26,
        acRunning: false,
        polycom4kOnline: true,
        smartDisplayOnline: false,
        motionDetected: false,
        doorLocked: false,
        co2Ppm: 420
      }
    },
    {
      id: 'ROOM-MEET-03',
      name: 'Phòng Họp Ban Giám Đốc (Executive Room)',
      floor: 'Tầng 3 - Cạnh Phòng Tổng GĐ',
      capacity: 20,
      roomType: 'EXECUTIVE',
      status: 'AVAILABLE',
      amenities: ['Màn hình cảm ứng Maxhub 75 inch', 'Webcam AI tự nhận diện người nói', 'Bảng kính viết bút lông', 'Tủ bảo mật tài liệu'],
      techLead: 'Hành chính Lê Thu Thảo',
      hourlyRate: 400000,
      iot: {
        acTemp: 25,
        acRunning: false,
        polycom4kOnline: true,
        smartDisplayOnline: true,
        motionDetected: false,
        doorLocked: false,
        co2Ppm: 430
      }
    },
    {
      id: 'ROOM-OPER-04',
      name: 'Phòng Họp Phân Xưởng Sản Xuất (Ops Room)',
      floor: 'Tầng 1 - Khối Nhà Xưởng 1',
      capacity: 30,
      roomType: 'WORKSHOP_OPS',
      status: 'IN_USE',
      currentMeeting: 'Giao ban điều hành ca sản xuất dập & bao bì',
      meetingEndTime: '15:00',
      organizer: 'Quản Đốc Phân Xưởng 1',
      attendeesCount: 22,
      amenities: ['TV Sony 65 inch HDMI/Wireless', 'Bảng Flipchart di động', 'Điều hòa 24.000 BTU', 'Bàn họp chữ U'],
      techLead: 'Kỹ thuật xưởng Vũ Đình Toàn',
      hourlyRate: 250000,
      iot: {
        acTemp: 24,
        acRunning: true,
        polycom4kOnline: false,
        smartDisplayOnline: true,
        motionDetected: true,
        doorLocked: false,
        co2Ppm: 680
      }
    },
    {
      id: 'ROOM-INNOV-05',
      name: 'Phòng Sáng Tạo & Brainstorming Lab',
      floor: 'Tầng 4 - Khối R&D Thiết Kế',
      capacity: 12,
      roomType: 'BRAINSTORM_LAB',
      status: 'AVAILABLE',
      amenities: ['Tường sơn nam châm viết vẽ toàn mảng', 'Ghế hạt xốp công thái học', 'Bàn di động bánh xe', 'Bộ loa thông minh Harman Kardon', 'Cà phê Espresso capsule'],
      techLead: 'Thư ký R&D Phạm Thu Nga',
      hourlyRate: 300000,
      iot: {
        acTemp: 24,
        acRunning: false,
        polycom4kOnline: true,
        smartDisplayOnline: true,
        motionDetected: false,
        doorLocked: false,
        co2Ppm: 410
      }
    }
  ]);

  // ==========================================
  // 2. DATA: LỊCH ĐẶT PHÒNG & TIMELINE MA TRẬN
  // ==========================================
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>([
    {
      id: 'SCH-01',
      title: 'Đoàn Thanh Tra Liên Ngành Sở LĐ-TB&XH Tỉnh Bình Dương',
      roomId: 'ROOM-VIP-01',
      roomName: 'Phòng Khánh Tiết VIP Boardroom',
      type: 'GOVERNMENT',
      typeName: 'Cơ quan Ban ngành',
      organization: 'Sở Lao Động - Thương Binh & Xã Hội',
      visitorCount: 5,
      leadVisitor: 'Ông Nguyễn Văn Thành (Phó Giám Đốc Sở)',
      hostEmployee: 'Trưởng Phòng HCNS & Trưởng Ban HSE',
      date: '2026-08-28',
      startTime: '09:00',
      endTime: '11:30',
      status: 'CONFIRMED',
      teaAndSnacks: 'Trà sen Tây Hồ, cà phê pha máy, hoa tươi, trái cây 4 mùa',
      cateringCost: 850000,
      giftsGiven: ['GFT-01: Bộ ấm chén Bát Tràng in logo mạ vàng'],
      layout: 'BOARDROOM',
      itSupportRequested: true,
      minutesNotes: 'Đoàn kiểm tra ghi nhận công ty tuân thủ tốt chế độ tiền lương, đóng BHXH 100% và trang bị đầy đủ BHLĐ.',
      actionItems: [
        { id: 'ACT-01', task: 'Bổ sung hồ sơ khám sức khỏe định kỳ quý 3/2026', assignee: 'Hành chính Lê Thu Thảo', deadline: '05/09/2026', status: 'IN_PROGRESS' },
        { id: 'ACT-02', task: 'Báo cáo rà soát phụ cấp nặng nhọc độc hại', assignee: 'Phòng C&B', deadline: '10/09/2026', status: 'PENDING' }
      ]
    },
    {
      id: 'SCH-02',
      title: 'Họp Giao Ban Sản Xuất Ca 1 Khối Xưởng Dập & Bao Bì',
      roomId: 'ROOM-OPER-04',
      roomName: 'Phòng Họp Phân Xưởng Sản Xuất (Ops Room)',
      type: 'INTERNAL_MEETING',
      typeName: 'Họp Nội Bộ',
      organization: 'Nội bộ Nhà máy',
      visitorCount: 22,
      leadVisitor: 'Quản Đốc Phân Xưởng 1',
      hostEmployee: 'Quản Đốc Phân Xưởng 1',
      date: '2026-08-28',
      startTime: '13:30',
      endTime: '15:00',
      status: 'IN_PROGRESS',
      teaAndSnacks: 'Nước suối đóng chai Lavie & Khăn lạnh tiệt trùng',
      cateringCost: 150000,
      giftsGiven: [],
      layout: 'U_SHAPE',
      itSupportRequested: false
    },
    {
      id: 'SCH-03',
      title: 'Đoàn Chuyên Gia Kỹ Thuật Tập Đoàn Đối Tác Sumitomo Nhật Bản',
      roomId: 'ROOM-VIP-01',
      roomName: 'Phòng Khánh Tiết VIP Boardroom',
      type: 'PARTNER',
      typeName: 'Đối tác Chiến lược',
      organization: 'Sumitomo Heavy Industries Corp',
      visitorCount: 4,
      leadVisitor: 'Mr. Kenji Sato (Technical Director)',
      hostEmployee: 'Tổng Giám Đốc & Giám Đốc Kỹ Thuật',
      date: '2026-08-28',
      startTime: '14:00',
      endTime: '16:30',
      status: 'IN_PROGRESS',
      teaAndSnacks: 'Trà đạo Nhật Bản Gyokuro, bánh Wagashi, nước cam tươi',
      cateringCost: 1200000,
      giftsGiven: ['GFT-02: Hộp trà Shan Tuyết cổ thụ Hà Giang đặc sản'],
      layout: 'BOARDROOM',
      itSupportRequested: true
    },
    {
      id: 'SCH-04',
      title: 'Đoàn Đánh Giá Tái Chứng Nhận ISO 45001 & ISO 14001',
      roomId: 'ROOM-HALL-02',
      roomName: 'Hội Trường Lớn Grand Conference Hall',
      type: 'AUDIT',
      typeName: 'Đoàn Đánh giá / Audit',
      organization: 'Tổ chức Chứng nhận Quốc tế BSI Vietnam',
      visitorCount: 3,
      leadVisitor: 'Bà Đặng Mai Hoa (Lead Auditor)',
      hostEmployee: 'Giám Đốc Nhà Máy & Trưởng Ban HSE',
      date: '2026-08-29',
      startTime: '08:30',
      endTime: '17:00',
      status: 'CONFIRMED',
      teaAndSnacks: 'Teabreak 2 cữ (sáng & chiều), cơm trưa tiếp khách ngoại giao',
      cateringCost: 2400000,
      giftsGiven: ['GFT-03: Bút ký cao cấp Picasso kim loại khắc tên cty'],
      layout: 'CLASSROOM',
      itSupportRequested: true
    },
    {
      id: 'SCH-05',
      title: 'Họp Brainstorming Chiến Lược R&D Bao Bì Thân Thiện Môi Trường 2027',
      roomId: 'ROOM-INNOV-05',
      roomName: 'Phòng Sáng Tạo & Brainstorming Lab',
      type: 'INTERNAL_MEETING',
      typeName: 'Họp Nội Bộ',
      organization: 'Khối R&D & Marketing',
      visitorCount: 8,
      leadVisitor: 'Trưởng Phòng R&D',
      hostEmployee: 'Trưởng Phòng R&D',
      date: '2026-08-28',
      startTime: '10:00',
      endTime: '12:00',
      status: 'COMPLETED',
      teaAndSnacks: 'Cà phê hạt pha máy, hạt điều Bình Phước rang muối',
      cateringCost: 350000,
      giftsGiven: [],
      layout: 'U_SHAPE',
      itSupportRequested: false
    }
  ]);

  // ==========================================
  // 3. DATA: ĐÓN TIẾP KHÁCH VIP & BAN NGÀNH
  // ==========================================
  const [vipDelegations, setVipDelegations] = useState<VipDelegation[]>([
    {
      id: 'VIP-001',
      title: 'Đoàn Thanh Tra Liên Ngành Sở LĐ-TB&XH Tỉnh Bình Dương',
      type: 'GOVERNMENT',
      organization: 'Sở Lao Động - Thương Binh & Xã Hội',
      visitorCount: 5,
      leadVisitor: 'Ông Nguyễn Văn Thành (Phó Giám Đốc Sở - Trưởng đoàn)',
      hostEmployee: 'Tổng Giám Đốc, Trưởng Phòng HCNS & Trưởng Ban HSE',
      date: '2026-08-28',
      time: '09:00 - 11:30',
      room: 'Phòng Khánh Tiết VIP Boardroom (Tầng 5)',
      purpose: 'Thanh tra định kỳ công tác tuân thủ pháp luật lao động, tiền lương, chính sách BHXH và BHLĐ năm 2026',
      bannerTheme: 'RED_GOLD',
      welcomeBannerText: 'NHIỆT LIỆT CHÀO MỪNG ĐOÀN THANH TRA LIÊN NGÀNH SỞ LAO ĐỘNG - THƯƠNG BINH & XÃ HỘI TỈNH BÌNH DƯƠNG ĐẾN THĂM VÀ LÀM VIỆC TẠI CÔNG TY',
      teaAndSnacks: 'Trà sen Tây Hồ, cà phê pha máy, hoa tươi để bàn, trái cây theo mùa',
      giftAssigned: 'Bộ ấm chén gốm sứ Bát Tràng in logo mạ vàng (5 suất)',
      vehiclePlate: '61A-999.88 (Xe công vụ Sở)',
      protocolSteps: [
        { step: 1, time: '08:45', title: 'Đón đoàn tại Cổng Chính', location: 'Cổng Gate 1 & Sảnh Điều Hành', inCharge: 'Đội trưởng BV & Lễ tân HCNS', completed: true },
        { step: 2, time: '09:00', title: 'Mời đoàn lên Phòng Khánh Tiết & Trà nước', location: 'Tầng 5 - VIP Boardroom', inCharge: 'Hành chính Lê Thu Thảo', completed: true },
        { step: 3, time: '09:15', title: 'Báo cáo tình hình lao động & giải trình tài liệu', location: 'Phòng Khánh Tiết', inCharge: 'Trưởng Phòng HCNS', completed: true },
        { step: 4, time: '10:30', title: 'Thăm quan thực tế điều kiện làm việc tại phân xưởng', location: 'Nhà Xưởng 1 & 2', inCharge: 'Giám Đốc Nhà Máy & Trưởng Ban HSE', completed: false },
        { step: 5, time: '11:15', title: 'Trao quà lưu niệm công ty & Tiễn đoàn', location: 'Sảnh chính Tòa nhà', inCharge: 'Ban Tổng Giám Đốc', completed: false }
      ]
    },
    {
      id: 'VIP-002',
      title: 'Đoàn Chuyên Gia Kỹ Thuật Tập Đoàn Đối Tác Sumitomo Nhật Bản',
      type: 'PARTNER',
      organization: 'Sumitomo Heavy Industries Corp',
      visitorCount: 4,
      leadVisitor: 'Mr. Kenji Sato (Technical Director)',
      hostEmployee: 'Tổng Giám Đốc & Giám Đốc Kỹ Thuật',
      date: '2026-08-28',
      time: '14:00 - 16:30',
      room: 'Phòng Khánh Tiết VIP Boardroom (Tầng 5)',
      purpose: 'Khảo sát dây chuyền tự động hóa giai đoạn 2 và chuyển giao công nghệ robot đóng gói bao bì thông minh',
      bannerTheme: 'NAVY_SILVER',
      welcomeBannerText: 'WARMLY WELCOME TECHNICAL DELEGATION OF SUMITOMO HEAVY INDUSTRIES CORP TO VISIT AND WORK AT OUR FACTORY',
      teaAndSnacks: 'Trà đạo Nhật Bản Gyokuro, bánh Wagashi, nước cam tươi',
      giftAssigned: 'Hộp trà Shan Tuyết cổ thụ Hà Giang đặc sản (4 hộp)',
      vehiclePlate: '51F-888.66 (Xe 7 chỗ cty đưa đón từ Sân bay Tân Sơn Nhất)',
      protocolSteps: [
        { step: 1, time: '13:45', title: 'Xe đưa đón đoàn tới Sảnh Lễ Tân', location: 'Cổng Chính & Sảnh', inCharge: 'Tài xế & Phiên dịch viên tiếng Nhật', completed: true },
        { step: 2, time: '14:00', title: 'Chào mừng & Trình chiếu video giới thiệu nhà máy', location: 'Tầng 5 - VIP Boardroom', inCharge: 'Tổng Giám Đốc & Giám Đốc Kỹ Thuật', completed: true },
        { step: 3, time: '14:30', title: 'Khảo sát hiện trường line lắp đặt robot', location: 'Khu tự động hóa Xưởng 2', inCharge: 'Trưởng Phòng Cơ Điện MEP & Quản Đốc', completed: true },
        { step: 4, time: '16:00', title: 'Hội đàm ký kết biên bản ghi nhớ giai đoạn 2', location: 'Phòng Khánh Tiết', inCharge: 'Ban TGĐ & Luật sư pháp chế', completed: false },
        { step: 5, time: '16:30', title: 'Trao quà lưu niệm đặc sản & Tiễn đoàn về khách sạn', location: 'Sảnh chính Tòa nhà', inCharge: 'Ban TGĐ', completed: false }
      ]
    },
    {
      id: 'VIP-003',
      title: 'Đoàn Chuyên Gia Đánh Giá Tái Chứng Nhận ISO 45001 & ISO 14001',
      type: 'AUDIT',
      organization: 'Tổ chức Chứng nhận Quốc tế BSI Vietnam',
      visitorCount: 3,
      leadVisitor: 'Bà Đặng Mai Hoa (Lead Auditor)',
      hostEmployee: 'Giám Đốc Nhà Máy & Trưởng Ban HSE',
      date: '2026-08-29',
      time: '08:30 - 17:00',
      room: 'Hội Trường Lớn Grand Conference Hall (Tầng 2)',
      purpose: 'Audit định kỳ năm thứ 2 hệ thống quản lý an toàn sức khỏe nghề nghiệp và quản lý môi trường toàn bộ nhà máy',
      bannerTheme: 'ROYAL_GOLD',
      welcomeBannerText: 'NHIỆT LIỆT CHÀO MỪNG ĐOÀN ĐÁNH GIÁ TỔ CHỨC CHỨNG NHẬN QUỐC TẾ BSI VIETNAM ĐẾN ĐÁNH GIÁ ISO 45001 & ISO 14001',
      teaAndSnacks: 'Teabreak hoa quả tươi 2 cữ, cơm trưa phòng VIP',
      giftAssigned: 'Bút ký kim loại cao cấp Picasso khắc tên (3 cây)',
      vehiclePlate: '51K-567.89',
      protocolSteps: [
        { step: 1, time: '08:15', title: 'Đón chuyên gia tại sảnh & Làm thủ tục khai báo HSE', location: 'Cổng 1 & Phòng Đào tạo HSE', inCharge: 'Chuyên viên HSE', completed: false },
        { step: 2, time: '08:30', title: 'Họp Khai Mạc Đánh Giá (Opening Meeting)', location: 'Tầng 2 - Hội Trường Lớn', inCharge: 'Ban Lãnh Đạo & Trưởng các phòng ban', completed: false },
        { step: 3, time: '09:15', title: 'Đánh giá hiện trường nhà xưởng, kho hóa chất, xử lý nước thải', location: 'Toàn bộ khuôn viên nhà máy', inCharge: 'Trưởng Ban HSE & Quản đốc xưởng', completed: false },
        { step: 4, time: '14:00', title: 'Xem xét hồ sơ pháp lý, đo kiểm môi trường & sổ sách an toàn', location: 'Phòng làm việc riêng tầng 2', inCharge: 'Tổ Thư ký ISO', completed: false },
        { step: 5, time: '16:15', title: 'Họp Bế Mạc & Công bố kết quả đánh giá (Closing Meeting)', location: 'Hội Trường Lớn', inCharge: 'Toàn thể Ban Lãnh Đạo', completed: false }
      ]
    }
  ]);

  // ==========================================
  // 4. DATA: SỔ KIỂM SOÁT CỔNG & AN TOÀN HSE
  // ==========================================
  const [visitorGateLogs, setVisitorGateLogs] = useState<VisitorGateLog[]>([
    {
      id: 'VG-101',
      fullName: 'Ông Nguyễn Văn Thành',
      gender: 'Nam',
      company: 'Sở Lao Động - Thương Binh & Xã Hội',
      phone: '0903.999.888',
      hostPerson: 'Trưởng Phòng HCNS',
      checkInTime: '08:45',
      status: 'IN_PREMISES',
      visitorCategory: 'GOV_DELEGATE',
      categoryLabel: 'Cơ quan Ban ngành',
      safetyTestPassed: true,
      safetyTestType: 'EXEMPT',
      ppeIssued: ['Thẻ Khách VIP', 'Mũ bảo hộ trắng'],
      vehiclePlate: '61A-999.88',
      note: 'Trưởng đoàn thanh tra liên ngành'
    },
    {
      id: 'VG-102',
      fullName: 'Mr. Kenji Sato',
      gender: 'Nam',
      company: 'Sumitomo Heavy Industries Corp',
      phone: '+81-90-1234-5678',
      hostPerson: 'Tổng Giám Đốc',
      checkInTime: '13:50',
      status: 'IN_PREMISES',
      visitorCategory: 'VIP_GUEST',
      categoryLabel: 'Khách VIP Đối Tác',
      safetyTestPassed: true,
      safetyTestType: 'QR_MOBILE',
      ppeIssued: ['Thẻ Khách Quốc Tế', 'Mũ bảo hộ', 'Giày bảo hộ mũi thép số 42'],
      vehiclePlate: '51F-888.66',
      note: 'Giám đốc kỹ thuật Sumitomo'
    },
    {
      id: 'VG-103',
      fullName: 'Lê Văn Hùng',
      gender: 'Nam',
      company: 'Công ty Cơ Điện MEP Tân Phát',
      phone: '0918.222.333',
      hostPerson: 'Kỹ sư Trưởng Bảo Trì MEP',
      checkInTime: '07:30',
      status: 'IN_PREMISES',
      visitorCategory: 'CONTRACTOR',
      categoryLabel: 'Nhà Thầu Thi Công',
      safetyTestPassed: true,
      safetyTestType: 'PAPER_FORM',
      ppeIssued: ['Thẻ Thầu màu cam', 'Mũ vàng', 'Áo phản quang', 'Dây an toàn 2 móc'],
      vehiclePlate: '59P1-123.45',
      note: 'Bảo dưỡng tủ điện tổng MSB và biến áp T2'
    },
    {
      id: 'VG-104',
      fullName: 'Trần Thị Thu Hà',
      gender: 'Nữ',
      company: 'Công ty Dịch Vụ Vệ Sinh Pan Pacific',
      phone: '0977.444.555',
      hostPerson: 'Giám Sát Hành Chính',
      checkInTime: '06:00',
      status: 'IN_PREMISES',
      visitorCategory: 'OUTSOURCED_PARTNER',
      categoryLabel: 'Đối Tác Thuê Ngoài',
      safetyTestPassed: true,
      safetyTestType: 'QR_MOBILE',
      ppeIssued: ['Thẻ Dịch Vụ Tạp Vụ', 'Đồng phục Pan Pacific', 'Ủng cao su'],
      note: 'Giám sát ca sáng vệ sinh xưởng 1 & văn phòng'
    },
    {
      id: 'VG-105',
      fullName: 'Hoàng Minh Tuấn',
      gender: 'Nam',
      company: 'Công ty Cổ Phần Giao Hàng Tiết Kiệm',
      phone: '0934.567.890',
      hostPerson: 'Văn thư Lưu trữ',
      checkInTime: '10:15',
      checkOutTime: '10:35',
      status: 'CHECKED_OUT',
      visitorCategory: 'CONTRACTOR',
      categoryLabel: 'Giao Nhận Bưu Phẩm',
      safetyTestPassed: true,
      safetyTestType: 'EXEMPT',
      ppeIssued: ['Thẻ Khách vãng lai'],
      vehiclePlate: '60C-987.65',
      note: 'Giao tài liệu chuyển phát nhanh và chứng từ thuế'
    }
  ]);

  // ==========================================
  // 5. DATA: KHAI BÁO MẤT THẺ XE & CAMERA AI
  // ==========================================
  const [lostParkingReports, setLostParkingReports] = useState<LostParkingCardReport[]>([
    {
      id: 'LST-001',
      empId: 'AF-009',
      empName: 'Trần Thị Mai',
      department: 'Phòng Kế Toán',
      cardIdLost: 'CARD-PK-2024-089',
      plateNumber: '59-S2 888.99',
      vehicleModel: 'Honda Vision màu đỏ mận',
      issueDate: '2026-08-28 11:30',
      status: 'WITNESS_CONFIRMED',
      driverLicenseVerified: true,
      vehicleRegistrationVerified: true,
      securityGuardConfirmed: false,
      guardName: 'Bùi Văn Bình (Đội trưởng BV)',
      releaseTime: '',
      cameraPlateSnapshotUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&q=80',
      witnesses: [
        {
          id: 'WIT-01',
          name: 'Nguyễn Văn Long',
          empId: 'AF-002',
          roleDesc: 'Đồng nghiệp cùng phòng Kế toán',
          confirmed: true,
          reasonNote: 'Xác nhận chị Mai đi xe này đến công ty lúc 07:45 sáng nay, tôi đi vào cổng ngay phía sau.',
          confirmedAt: '2026-08-28 11:45'
        },
        {
          id: 'WIT-02',
          name: 'Phạm Hồng Thái',
          empId: 'AF-005',
          roleDesc: 'Trưởng Phòng Kế Toán',
          confirmed: true,
          reasonNote: 'Xác nhận nhân sự Trần Thị Mai làm việc tại phòng Kế toán, biển số xe chính xác.',
          confirmedAt: '2026-08-28 11:50'
        }
      ]
    },
    {
      id: 'LST-002',
      empId: 'AF-045',
      empName: 'Lê Văn Dũng',
      department: 'Phân Xưởng Cơ Khí',
      cardIdLost: 'CARD-PK-2024-312',
      plateNumber: '61-B1 556.78',
      vehicleModel: 'Yamaha Exciter 150 màu xanh GP',
      issueDate: '2026-08-27 17:15',
      status: 'RELEASED_AND_LOCKED',
      driverLicenseVerified: true,
      vehicleRegistrationVerified: true,
      securityGuardConfirmed: true,
      guardName: 'Nguyễn Văn Đạt (Bảo vệ ca trực)',
      releaseTime: '2026-08-27 17:40',
      cameraPlateSnapshotUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80',
      witnesses: [
        {
          id: 'WIT-03',
          name: 'Vũ Đình Toàn',
          empId: 'AF-033',
          roleDesc: 'Tổ trưởng tổ dập',
          confirmed: true,
          reasonNote: 'Xác nhận xe của anh Dũng, làm rơi thẻ khi thay đồ bảo hộ tan ca.',
          confirmedAt: '2026-08-27 17:25'
        }
      ]
    }
  ]);

  // ==========================================
  // 6. DATA: KHO QUÀ TẶNG NGOẠI GIAO VIP
  // ==========================================
  const [giftInventory, setGiftInventory] = useState<GiftInventoryItem[]>([
    {
      id: 'GFT-01',
      name: 'Bộ ấm chén gốm sứ Bát Tràng in logo mạ vàng 24K',
      category: 'Gốm Sứ Cao Cấp',
      stock: 22,
      minStockAlert: 10,
      unitCost: 450000,
      recipientLevel: 'Cơ quan Ban ngành Nhà nước & Đối tác cấp Lãnh đạo',
      giftHistory: [
        { date: '2026-08-28', partnerName: 'Sở LĐ-TB&XH Tỉnh Bình Dương', delegateName: 'Ông Nguyễn Văn Thành', quantity: 5, eventTitle: 'Đón đoàn thanh tra lao động 2026' },
        { date: '2026-07-15', partnerName: 'Ban Quản Lý KCN VSIP 1', delegateName: 'Trưởng ban QL KCN', quantity: 3, eventTitle: 'Họp giao ban doanh nghiệp quý 2' }
      ]
    },
    {
      id: 'GFT-02',
      name: 'Hộp trà Shan Tuyết cổ thụ Hà Giang đặc sản (Hộp gỗ cao cấp)',
      category: 'Đặc Sản Ngoại Giao',
      stock: 31,
      minStockAlert: 15,
      unitCost: 380000,
      recipientLevel: 'Đoàn Khách Quốc Tế & Chuyên Gia Nước Ngoài',
      giftHistory: [
        { date: '2026-08-28', partnerName: 'Sumitomo Heavy Industries Corp', delegateName: 'Mr. Kenji Sato', quantity: 4, eventTitle: 'Khảo sát chuyển giao công nghệ robot' },
        { date: '2026-08-10', partnerName: 'Đoàn Chuyên Gia Kỹ Thuật Hàn Quốc KITECH', delegateName: 'Mr. Park Jin-woo', quantity: 6, eventTitle: 'Audit tiêu chuẩn năng lượng xanh' }
      ]
    },
    {
      id: 'GFT-03',
      name: 'Bút ký kim loại cao cấp Picasso mạ vàng khắc tên cty',
      category: 'Văn Phòng Phẩm VIP',
      stock: 48,
      minStockAlert: 20,
      unitCost: 220000,
      recipientLevel: 'Đoàn Đánh Giá / Chuyên gia Kiểm toán / Diễn giả',
      giftHistory: [
        { date: '2026-08-29', partnerName: 'Tổ chức BSI Vietnam', delegateName: 'Bà Đặng Mai Hoa (Lead Auditor)', quantity: 3, eventTitle: 'Đánh giá tái chứng nhận ISO 45001' },
        { date: '2026-06-20', partnerName: 'Công ty Kiểm Toán Ernst & Young (EY)', delegateName: 'Kiểm toán viên chính', quantity: 4, eventTitle: 'Kiểm toán BCTC giữa niên độ' }
      ]
    },
    {
      id: 'GFT-04',
      name: 'Bộ giftset sổ tay da dập chìm kèm USB kim loại 64GB & bút cảm ứng',
      category: 'Công Nghệ & Quà Lưu Niệm',
      stock: 45,
      minStockAlert: 20,
      unitCost: 180000,
      recipientLevel: 'Đoàn Giảng Viên Trường ĐH & Đối tác tuyển dụng',
      giftHistory: [
        { date: '2026-08-05', partnerName: 'Trường ĐH Bách Khoa TP.HCM', delegateName: 'PGS.TS Trưởng khoa Cơ Khí', quantity: 8, eventTitle: 'Lễ ký kết hợp tác đào tạo kỹ sư thực tập' }
      ]
    }
  ]);

  // ==========================================
  // MODAL STATES
  // ==========================================
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDoorSignageModal, setShowDoorSignageModal] = useState<MeetingRoomData | null>(null);
  const [showBannerLedModal, setShowBannerLedModal] = useState<VipDelegation | null>(null);
  const [isFullscreenLed, setIsFullscreenLed] = useState(false);
  const [showGateCheckInModal, setShowGateCheckInModal] = useState(false);
  const [showSafetyQrModal, setShowSafetyQrModal] = useState(false);
  const [showSafetyPaperModal, setShowSafetyPaperModal] = useState<{ fullName: string; company: string; date: string } | null>(null);
  const [showAnprModal, setShowAnprModal] = useState<LostParkingCardReport | null>(null);
  const [showMinutesModal, setShowMinutesModal] = useState<ScheduledMeeting | null>(null);
  const [filterRoomStatus, setFilterRoomStatus] = useState<string>('ALL');

  // Form state cho Đặt phòng mới
  const [bookingForm, setBookingForm] = useState({
    title: '',
    roomId: 'ROOM-VIP-01',
    type: 'PARTNER' as ScheduledMeeting['type'],
    organization: '',
    visitorCount: 8,
    leadVisitor: '',
    hostEmployee: 'Trưởng Phòng HCNS',
    date: '2026-08-28',
    startTime: '10:00',
    endTime: '11:30',
    teaAndSnacks: 'Trà sen Tây Hồ, Cà phê pha máy, Hoa quả tươi',
    layout: 'BOARDROOM' as ScheduledMeeting['layout'],
    itSupportRequested: true
  });

  // State AI Gợi Ý Phòng
  const [aiParticipants, setAiParticipants] = useState<number>(10);
  const [aiNeedPolycom, setAiNeedPolycom] = useState<boolean>(true);
  const [aiNeedHall, setAiNeedHall] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // Tính toán kiểm tra trùng lịch (Conflict Detection)
  const isConflict = useMemo(() => {
    return scheduledMeetings.some(m => {
      if (m.roomId !== bookingForm.roomId || m.date !== bookingForm.date) return false;
      const parseTime = (t: string) => {
        const [h, min] = t.split(':').map(Number);
        return h * 60 + min;
      };
      const startA = parseTime(bookingForm.startTime);
      const endA = parseTime(bookingForm.endTime);
      const startB = parseTime(m.startTime);
      const endB = parseTime(m.endTime);
      return Math.max(startA, startB) < Math.min(endA, endB);
    });
  }, [bookingForm, scheduledMeetings]);

  // Hàm xử lý AI gợi ý phòng tối ưu
  const handleRunAiRoomRecommendation = () => {
    if (aiParticipants > 50 || aiNeedHall) {
      setAiRecommendation('ROOM-HALL-02');
      setBookingForm(prev => ({ ...prev, roomId: 'ROOM-HALL-02' }));
    } else if (aiNeedPolycom && aiParticipants <= 16) {
      setAiRecommendation('ROOM-VIP-01');
      setBookingForm(prev => ({ ...prev, roomId: 'ROOM-VIP-01' }));
    } else if (aiParticipants <= 20) {
      setAiRecommendation('ROOM-MEET-03');
      setBookingForm(prev => ({ ...prev, roomId: 'ROOM-MEET-03' }));
    } else {
      setAiRecommendation('ROOM-OPER-04');
      setBookingForm(prev => ({ ...prev, roomId: 'ROOM-OPER-04' }));
    }
  };

  // Hàm Submit Đặt phòng mới
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConflict) {
      alert('CẢNH BÁO TRÙNG LỊCH: Khung giờ và phòng họp này đã có cuộc họp khác được xác nhận!');
      return;
    }

    const targetRoom = meetingRooms.find(r => r.id === bookingForm.roomId);
    const newMeeting: ScheduledMeeting = {
      id: `SCH-${String(scheduledMeetings.length + 1).padStart(2, '0')}`,
      title: bookingForm.title,
      roomId: bookingForm.roomId,
      roomName: targetRoom ? targetRoom.name : 'Phòng họp cơ sở',
      type: bookingForm.type,
      typeName: 
        bookingForm.type === 'GOVERNMENT' ? 'Cơ quan Ban ngành' :
        bookingForm.type === 'AUDIT' ? 'Đoàn Đánh giá / Audit' :
        bookingForm.type === 'PARTNER' ? 'Đối tác Chiến lược' :
        bookingForm.type === 'TRAINING' ? 'Đào Tạo Kỹ Năng' : 'Họp Nội Bộ',
      organization: bookingForm.organization,
      visitorCount: Number(bookingForm.visitorCount),
      leadVisitor: bookingForm.leadVisitor,
      hostEmployee: bookingForm.hostEmployee,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      status: 'CONFIRMED',
      teaAndSnacks: bookingForm.teaAndSnacks,
      cateringCost: 500000,
      giftsGiven: [],
      layout: bookingForm.layout,
      itSupportRequested: bookingForm.itSupportRequested
    };

    setScheduledMeetings([newMeeting, ...scheduledMeetings]);
    setShowBookingModal(false);
    alert(`Đã đặt phòng họp thành công cho "${bookingForm.title}"! Lịch đã được đồng bộ vào hệ thống.`);
  };

  // Hàm Tích Ra Cổng (Check-out 1-click)
  const handleAutoCheckOut = (logId: string) => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setVisitorGateLogs(prev => prev.map(log => 
      log.id === logId 
        ? { ...log, status: 'CHECKED_OUT', checkOutTime: nowTime }
        : log
    ));
  };

  // Hàm Xuất Báo Cáo Tiếp Khách & Phòng Họp ra Excel
  const handleExportExcel = () => {
    const exportData = scheduledMeetings.map((m, idx) => ({
      'STT': idx + 1,
      'Mã Lịch Họp': m.id,
      'Tên Buổi Họp / Tiếp Khách': m.title,
      'Phòng Họp': m.roomName,
      'Phân Loại': m.typeName,
      'Đơn Vị Khách': m.organization,
      'Số Người': m.visitorCount,
      'Trưởng Đoàn / Đại Diện': m.leadVisitor,
      'Người Đón Tiếp': m.hostEmployee,
      'Ngày': m.date,
      'Thời Gian': `${m.startTime} - ${m.endTime}`,
      'Trạng Thái': m.status,
      'Hậu Cần & Teabreak': m.teaAndSnacks,
      'Chi Phí Dự Toán (VNĐ)': m.cateringCost,
      'Bố Trí Bàn Ghế': m.layout,
      'Hỗ Trợ IT/Polycom': m.itSupportRequested ? 'Có' : 'Không'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lich_TiepKhach_PhongHop');
    XLSX.writeFile(wb, 'Bao_Cao_Tiep_Khach_Va_Phong_Hop_2026.xlsx');
  };

  // Time slots cho ma trận timeline (từ 08:00 đến 18:00, mỗi slot 30 phút)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  // Helper check xem 1 slot giờ của 1 phòng có meeting nào đang chiếm không
  const getMeetingAtSlot = (roomId: string, slotTime: string) => {
    const parseTime = (t: string) => {
      const [h, min] = t.split(':').map(Number);
      return h * 60 + min;
    };
    const slotMin = parseTime(slotTime);
    return scheduledMeetings.find(m => {
      if (m.roomId !== roomId) return false;
      const startMin = parseTime(m.startTime);
      const endMin = parseTime(m.endTime);
      return slotMin >= startMin && slotMin < endMin;
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in text-slate-800">
      {/* ════════════════════ BANNER TỔNG QUAN NGOẠI GIAO & PHÒNG HỌP THÔNG MINH ════════════════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-indigo-900/30">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                Tiếp Khách Ngoại Giao, Khánh Tiết &amp; Điều Phối Phòng Họp Thông Minh (Smart Reception Suite)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-400 text-slate-950">
                6 Phân Hệ Chuẩn Doanh Nghiệp
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Sơ đồ IoT thời gian thực, ma trận timeline AI, banner LED đón tiếp khách VIP, kiểm soát cổng an toàn HSE &amp; kho quà tặng ngoại giao
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 shrink-0">
            <span className="text-[10px] text-indigo-200 block uppercase font-bold">Khách Trong Nhà Máy:</span>
            <span className="text-base font-black text-emerald-300 font-mono">
              {visitorGateLogs.filter(v => v.status === 'IN_PREMISES').length} Khách
            </span>
          </div>
          <div className="text-right bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 shrink-0">
            <span className="text-[10px] text-indigo-200 block uppercase font-bold">Phòng Họp Đang Dùng:</span>
            <span className="text-base font-black text-amber-300 font-mono">
              {meetingRooms.filter(r => r.status === 'IN_USE').length} / {meetingRooms.length}
            </span>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Đặt Phòng / Tiếp Khách</span>
          </button>
        </div>
      </div>

      {/* ════════════════════ 6 NÚT SUB-TAB CHUYÊN BIỆT HÓA ════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center space-x-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollable-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('ROOM_HUB')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'ROOM_HUB'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <DoorOpen className="w-4 h-4 text-emerald-400" />
            <span>1. Sơ Đồ &amp; IoT Phòng Họp</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
              activeTab === 'ROOM_HUB' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {meetingRooms.filter(r => r.status === 'AVAILABLE').length} Trống
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TIMELINE_MATRIX')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'TIMELINE_MATRIX'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>2. Ma Trận Timeline &amp; AI Booking</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
              Real-time
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VIP_DELEGATIONS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'VIP_DELEGATIONS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>3. Đón Tiếp VIP &amp; Banner LED</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
              activeTab === 'VIP_DELEGATIONS' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {vipDelegations.length} Đoàn
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GATE_HSE_CONTROL')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'GATE_HSE_CONTROL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>4. Kiểm Soát Cổng &amp; An Toàn HSE</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
              activeTab === 'GATE_HSE_CONTROL' ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {visitorGateLogs.filter(v => v.status === 'IN_PREMISES').length} Tại xưởng
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MEETING_SERVICES')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'MEETING_SERVICES'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Coffee className="w-4 h-4 text-amber-500" />
            <span>5. Hậu Cần Teabreak &amp; Biên Bản Họp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BUDGET_GIFTS_ANALYTICS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'BUDGET_GIFTS_ANALYTICS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Gift className="w-4 h-4 text-rose-400" />
            <span>6. Kho Quà Tặng VIP &amp; Phân Tích Chi Phí</span>
          </button>
        </div>
      </div>

      {/* ════════════════════ PHÂN HỆ 1: SƠ ĐỒ & ĐIỀU PHỐI PHÒNG HỌP IOT ════════════════════ */}
      {activeTab === 'ROOM_HUB' && (
        <div className="space-y-4 animate-in fade-in">
          {/* 4 Thẻ KPI Chỉ Số Phòng Họp */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tổng Số Phòng Họp</span>
                <DoorOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{meetingRooms.length} Phòng</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Từ VIP Boardroom đến xưởng sx</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Phòng Đang Trống (Ready)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {meetingRooms.filter(r => r.status === 'AVAILABLE').length} Phòng
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Sẵn sàng nhận lịch họp</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Đang Diễn Ra Cuộc Họp</span>
                <Clock className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-xl font-bold text-rose-600 mt-1">
                {meetingRooms.filter(r => r.status === 'IN_USE').length} Phòng
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Khóa lịch tự động trên bảng điện tử</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tổng Sức Chứa Đồng Thời</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-purple-600 mt-1">
                {meetingRooms.reduce((sum, r) => sum + r.capacity, 0)} Chỗ Ngồi
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Bao gồm Hội trường 120 chỗ</div>
            </div>
          </div>

          {/* Bộ lọc phòng họp */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                Lọc trạng thái:
              </span>
              <button
                onClick={() => setFilterRoomStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${filterRoomStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Tất cả ({meetingRooms.length})
              </button>
              <button
                onClick={() => setFilterRoomStatus('AVAILABLE')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${filterRoomStatus === 'AVAILABLE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Đang trống ({meetingRooms.filter(r => r.status === 'AVAILABLE').length})
              </button>
              <button
                onClick={() => setFilterRoomStatus('IN_USE')}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${filterRoomStatus === 'IN_USE' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Đang họp ({meetingRooms.filter(r => r.status === 'IN_USE').length})
              </button>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>* Bấm <b>"Màn hình ngoài cửa"</b> để mô phỏng Tablet kỹ thuật số gắn trước phòng họp</span>
            </div>
          </div>

          {/* Lưới các thẻ phòng họp IoT */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {meetingRooms
              .filter(r => filterRoomStatus === 'ALL' || r.status === filterRoomStatus)
              .map((room) => (
                <div
                  key={room.id}
                  className={`rounded-2xl border p-4 transition-all relative flex flex-col justify-between ${
                    room.status === 'IN_USE'
                      ? 'border-rose-300 bg-rose-50/30 shadow-xs'
                      : room.status === 'MAINTENANCE'
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Header phòng & Trạng thái */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10.5px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {room.id}
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-500">
                            {room.floor}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm mt-1 leading-snug">{room.name}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black shrink-0 border flex items-center gap-1 ${
                        room.status === 'IN_USE'
                          ? 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
                          : room.status === 'MAINTENANCE'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${room.status === 'IN_USE' ? 'bg-rose-600' : 'bg-emerald-600'}`}></span>
                        {room.status === 'IN_USE' ? 'Đang Sử Dụng' : room.status === 'MAINTENANCE' ? 'Bảo Trì' : 'Đang Trống'}
                      </span>
                    </div>

                    {/* Sức chứa & Đơn giá phân bổ */}
                    <div className="grid grid-cols-2 gap-2 py-1.5 px-2 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-3">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-600">Sức chứa:</span>
                        <b className="text-indigo-700">{room.capacity} Chỗ</b>
                      </div>
                      <div className="flex items-center space-x-1.5 text-right justify-end">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-slate-600">Định mức:</span>
                        <b className="font-mono text-emerald-700">{room.hourlyRate.toLocaleString('vi-VN')} đ/h</b>
                      </div>
                    </div>

                    {/* Cuộc họp đang diễn ra (nếu có) */}
                    {room.status === 'IN_USE' && room.currentMeeting && (
                      <div className="p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-xs mb-3 space-y-1">
                        <div className="flex items-center justify-between text-rose-800 font-bold text-[11px]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-rose-600" />
                            Đang diễn ra cuộc họp:
                          </span>
                          <span className="font-mono bg-rose-200/80 px-1.5 py-0.2 rounded text-[10px]">
                            Kết thúc: {room.meetingEndTime}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-rose-950 font-bold leading-tight">{room.currentMeeting}</p>
                        <div className="text-[10.5px] text-rose-800 pt-0.5">
                          Chủ trì: <b>{room.organizer}</b> • Tham dự: <b>{room.attendeesCount} người</b>
                        </div>
                      </div>
                    )}

                    {/* Khối Chỉ Số IoT Thời Gian Thực */}
                    <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 mb-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-indigo-400" />
                          Hệ Thống IoT &amp; Cảm Biến Phòng Họp
                        </span>
                        <span className="text-[9.5px] font-bold text-emerald-400 flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-emerald-400" />
                          Online
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div className="p-1 rounded bg-slate-800/80">
                          <span className="text-[9.5px] text-slate-400 block">Nhiệt độ A/C</span>
                          <span className="font-bold font-mono text-amber-300 text-xs flex items-center justify-center gap-0.5">
                            <Thermometer className="w-3 h-3 text-amber-400" />
                            {room.iot.acTemp}°C
                          </span>
                        </div>
                        <div className="p-1 rounded bg-slate-800/80">
                          <span className="text-[9.5px] text-slate-400 block">Polycom 4K</span>
                          <span className={`font-bold text-[10.5px] ${room.iot.polycom4kOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {room.iot.polycom4kOnline ? '✓ Sẵn sàng' : 'Chưa bật'}
                          </span>
                        </div>
                        <div className="p-1 rounded bg-slate-800/80">
                          <span className="text-[9.5px] text-slate-400 block">Cảm biến người</span>
                          <span className={`font-bold text-[10.5px] ${room.iot.motionDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {room.iot.motionDetected ? 'Có người' : 'Không có'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trang thiết bị tiện ích */}
                    <div className="space-y-1 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Trang thiết bị sẵn sàng:</span>
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] border border-slate-200"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer card: Tác vụ & Nút mở Door Signage */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs mt-1 gap-2">
                    <button
                      onClick={() => setShowDoorSignageModal(room)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Mở giao diện mô phỏng tablet ngoài cửa phòng"
                    >
                      <Monitor className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Màn hình ngoài cửa</span>
                    </button>

                    <button
                      onClick={() => {
                        setBookingForm(prev => ({ ...prev, roomId: room.id }));
                        setShowBookingModal(true);
                      }}
                      disabled={room.status === 'MAINTENANCE'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        room.status === 'AVAILABLE'
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                      }`}
                    >
                      {room.status === 'AVAILABLE' ? '+ Đặt Phòng Này' : 'Xem / Chèn Lịch'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ════════════════════ PHÂN HỆ 2: MA TRẬN TIMELINE KHUNG GIỜ & AI BOOKING ════════════════════ */}
      {activeTab === 'TIMELINE_MATRIX' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Hộp Trợ Lý AI Gợi Ý Phòng Họp */}
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 p-4 rounded-2xl text-white shadow-md border border-indigo-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <h3 className="font-black text-sm uppercase tracking-wide">
                  Trợ Lý AI Gợi Ý Phòng Họp Tối Ưu &amp; Quét Cảnh Báo Trùng Lịch
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                AI Smart Match
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] text-indigo-200 block mb-1 font-semibold">Số Người Tham Dự:</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={aiParticipants}
                  onChange={e => setAiParticipants(Number(e.target.value))}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-xl text-white outline-none focus:border-amber-300 font-bold"
                />
              </div>
              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="aiPolycom"
                  checked={aiNeedPolycom}
                  onChange={e => setAiNeedPolycom(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="aiPolycom" className="text-indigo-100 font-semibold cursor-pointer">
                  Cần Polycom 4K / Họp online
                </label>
              </div>
              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="aiHall"
                  checked={aiNeedHall}
                  onChange={e => setAiNeedHall(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="aiHall" className="text-indigo-100 font-semibold cursor-pointer">
                  Cần sân khấu / Hội trường lớn
                </label>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleRunAiRoomRecommendation}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Đề Xuất Phòng Tốt Nhất</span>
                </button>
              </div>
            </div>

            {aiRecommendation && (
              <div className="p-2.5 bg-white/10 border border-amber-300/40 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Gợi ý: <b>{meetingRooms.find(r => r.id === aiRecommendation)?.name}</b> (Sức chứa {meetingRooms.find(r => r.id === aiRecommendation)?.capacity} người, đầy đủ tiện ích yêu cầu).
                  </span>
                </div>
                <button
                  onClick={() => {
                    setBookingForm(prev => ({ ...prev, roomId: aiRecommendation }));
                    setShowBookingModal(true);
                  }}
                  className="px-2.5 py-1 bg-white text-slate-900 font-bold rounded-lg hover:bg-amber-100 cursor-pointer"
                >
                  Đặt Phòng Này Ngay
                </button>
              </div>
            )}
          </div>

          {/* Ma Trận Lịch Phòng Họp Tương Tác (08:00 - 18:00) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Ma Trận Lưới Khung Giờ Phòng Họp Hôm Nay (08:00 - 18:00)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bấm trực tiếp vào các ô giờ trống màu xám nhạt để đặt phòng tức thì. Màu đậm biểu thị khung giờ đã có cuộc họp.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded bg-purple-500 inline-block"></span> VIP Ngoại giao
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded bg-indigo-500 inline-block"></span> Nội bộ / Giao ban
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Đánh giá Audit
                </span>
              </div>
            </div>

            {/* Bảng Lưới Timeline Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-100 text-[10.5px] font-bold text-slate-700">
                    <th className="p-2.5 border border-slate-200 w-44 sticky left-0 bg-slate-100 z-10">Phòng Họp Cơ Sở</th>
                    {timeSlots.map((slot, i) => (
                      <th key={i} className="p-1 text-center border border-slate-200 font-mono text-[10px] w-12">
                        {slot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meetingRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 border border-slate-200 font-bold text-slate-900 sticky left-0 bg-white z-10">
                        <div className="truncate max-w-[170px]" title={room.name}>{room.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">Sức chứa: {room.capacity} người</div>
                      </td>
                      {timeSlots.map((slot, idx) => {
                        const meeting = getMeetingAtSlot(room.id, slot);
                        if (meeting) {
                          const bgClass = 
                            meeting.type === 'GOVERNMENT' || meeting.type === 'PARTNER' ? 'bg-purple-600 text-white' :
                            meeting.type === 'AUDIT' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white';
                          return (
                            <td
                              key={idx}
                              onClick={() => {
                                setShowMinutesModal(meeting);
                              }}
                              className={`p-1 border border-slate-200 text-center font-semibold cursor-pointer transition-all ${bgClass} hover:opacity-90`}
                              title={`${meeting.title} (${meeting.startTime} - ${meeting.endTime}) - Bấm để xem chi tiết`}
                            >
                              <div className="text-[9px] truncate font-mono">Họp</div>
                            </td>
                          );
                        } else {
                          return (
                            <td
                              key={idx}
                              onClick={() => {
                                setBookingForm(prev => ({
                                  ...prev,
                                  roomId: room.id,
                                  startTime: slot,
                                  endTime: timeSlots[idx + 2] || '18:00'
                                }));
                                setShowBookingModal(true);
                              }}
                              className="p-1 border border-slate-200 text-center hover:bg-indigo-100/60 cursor-pointer text-slate-300 hover:text-indigo-700 transition-colors"
                              title={`Phòng trống lúc ${slot}. Bấm để đặt phòng ngay!`}
                            >
                              <span className="text-[9.5px] select-none">+</span>
                            </td>
                          );
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ PHÂN HỆ 3: ĐÓN TIẾP VIP & TRÌNH TẠO BANNER LED ════════════════════ */}
      {activeTab === 'VIP_DELEGATIONS' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Thẻ Giới Thiệu Chuyên Nghiệp */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border border-purple-800/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase">
                  Nghiệp Vụ Tiếp Đón Đoàn Ngoại Giao, Cơ Quan Ban Ngành &amp; Đối Tác VIP
                </h3>
              </div>
              <p className="text-xs text-purple-200/80 mt-1">
                Lịch trình tiếp đón chi tiết từng mốc giờ, chuẩn bị teabreak cao cấp, phân công nhân sự đón tiếp và trình chiếu Banner LED chào mừng sảnh chính
              </p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer shrink-0"
            >
              + Đăng Ký Lịch Đón Khách Mới
            </button>
          </div>

          {/* Danh Sách Các Đoàn Khách VIP */}
          <div className="space-y-4">
            {vipDelegations.map((delegation) => (
              <div key={delegation.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
                {/* Header Đoàn Khách */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {delegation.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black border ${
                        delegation.type === 'GOVERNMENT'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : delegation.type === 'AUDIT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {delegation.type === 'GOVERNMENT' ? '🏛️ Cơ Quan Nhà Nước' : delegation.type === 'AUDIT' ? '🔍 Đoàn Đánh Giá / Audit' : '🤝 Đối Tác Chiến Lược'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Thời gian: <b className="text-slate-800 font-mono">{delegation.date} ({delegation.time})</b>
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 mt-1">{delegation.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Cơ quan: <b className="text-indigo-700">{delegation.organization}</b> • Trưởng đoàn: <b className="text-slate-900">{delegation.leadVisitor}</b> ({delegation.visitorCount} khách)
                    </p>
                  </div>

                  {/* Nút Chiếu Banner LED */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setShowBannerLedModal(delegation)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      title="Mở toàn màn hình Banner LED chào mừng chiếu tại màn hình sảnh hoặc phòng họp"
                    >
                      <Monitor className="w-4 h-4 text-amber-300" />
                      <span>Trình Chiếu Banner LED</span>
                    </button>
                  </div>
                </div>

                {/* Thông tin phòng họp & Hậu cần */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10.5px]">Phòng họp khánh tiết:</span>
                    <b className="text-indigo-700">{delegation.room}</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10.5px]">Thực đơn Teabreak:</span>
                    <span className="text-slate-800 font-medium">{delegation.teaAndSnacks}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10.5px]">Quà tặng ngoại giao dự kiến:</span>
                    <span className="text-purple-700 font-bold">{delegation.giftAssigned}</span>
                  </div>
                </div>

                {/* Checklist 5 Bước Tiếp Đón Đoàn Chuẩn Ngoại Giao */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                    Lịch Trình Chi Tiết Các Bước Đón Tiếp Đoàn (Reception Protocol)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {delegation.protocolSteps.map((step) => (
                      <div
                        key={step.step}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                          step.completed
                            ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-indigo-700">
                            Bước {step.step} ({step.time})
                          </span>
                          {step.completed ? (
                            <span className="text-[10px] font-bold text-emerald-700">✓ Xong</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Chờ</span>
                          )}
                        </div>
                        <div className="font-bold text-slate-900 text-[11px] leading-tight">{step.title}</div>
                        <div className="text-[10px] text-slate-500">Khu vực: {step.location}</div>
                        <div className="text-[9.5px] text-slate-400">Phụ trách: {step.inCharge}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════ PHÂN HỆ 4: KIỂM SOÁT CỔNG & AN TOÀN HSE ════════════════════ */}
      {activeTab === 'GATE_HSE_CONTROL' && (
        <div className="space-y-4 animate-in fade-in">
          {/* 4 Thẻ KPI Kiểm Soát Cổng */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Khách Đang Trong Nhà Máy</span>
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {visitorGateLogs.filter(v => v.status === 'IN_PREMISES').length} Khách
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Kiểm soát real-time qua mã thẻ</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Đạt Bài Thi An Toàn HSE</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-bold text-indigo-600 mt-1">
                {visitorGateLogs.filter(v => v.safetyTestPassed).length} / {visitorGateLogs.length}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">100% tuân thủ nội quy xưởng</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Mất Thẻ Xe Cần Xử Lý</span>
                <Key className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-amber-600 mt-1">
                {lostParkingReports.filter(r => r.status !== 'RELEASED_AND_LOCKED').length} Vụ
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Có làm chứng &amp; Camera AI OCR</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Đã Rời Đi (Check-out)</span>
                <LogOut className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-xl font-bold text-slate-700 mt-1">
                {visitorGateLogs.filter(v => v.status === 'CHECKED_OUT').length} Khách
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Đã thu hồi thẻ khách đầy đủ</div>
            </div>
          </div>

          {/* BẢNG SỔ KIỂM SOÁT CỔNG */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sổ Kiểm Soát Khách Vào / Ra Cổng Bảo Vệ &amp; An Toàn Lao Động</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bấm "Tích Ra Cổng" để tự động ghi giờ ra thực tế. Khách làm bài kiểm tra an toàn qua mã QR điện tử hoặc in phiếu giấy.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSafetyQrModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Mã QR Bài Thi HSE</span>
                </button>

                <button
                  onClick={() => setShowSafetyPaperModal({ fullName: 'Khách / Nhà Thầu Mới', company: 'Đơn Vị Đối Tác', date: new Date().toLocaleDateString('vi-VN') })}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Phiếu Bài Thi Giấy</span>
                </button>

                <button
                  onClick={() => setShowGateCheckInModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>+ Khách Vào Cổng Mới</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Mã Thẻ</th>
                    <th className="px-3 py-2">Phân Loại</th>
                    <th className="px-3 py-2">Họ &amp; Tên Khách</th>
                    <th className="px-3 py-2">Đơn Vị / Công Ty</th>
                    <th className="px-3 py-2">Số Điện Thoại</th>
                    <th className="px-3 py-2">Cán Bộ Đón</th>
                    <th className="px-3 py-2 font-mono text-center">Giờ Vào</th>
                    <th className="px-3 py-2 font-mono text-center">Giờ Ra</th>
                    <th className="px-3 py-2 text-center">KT An Toàn HSE</th>
                    <th className="px-3 py-2 text-center">Tác Vụ Cổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visitorGateLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2 text-center font-mono text-[10px] font-bold text-indigo-700">{log.id}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {log.categoryLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900">{log.fullName}</td>
                      <td className="px-3 py-2 font-semibold text-slate-700">{log.company}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{log.phone}</td>
                      <td className="px-3 py-2 text-indigo-700 font-semibold">{log.hostPerson}</td>
                      <td className="px-3 py-2 font-mono text-emerald-700 font-semibold text-center">{log.checkInTime}</td>
                      <td className="px-3 py-2 font-mono text-center">
                        {log.checkOutTime ? (
                          <span className="text-slate-600">{log.checkOutTime}</span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Tại xưởng
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Đạt ({log.safetyTestType === 'QR_MOBILE' ? 'QR' : log.safetyTestType === 'PAPER_FORM' ? 'Giấy' : 'Miễn'})
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {log.status === 'IN_PREMISES' ? (
                          <button
                            onClick={() => handleAutoCheckOut(log.id)}
                            className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold cursor-pointer"
                          >
                            Tích Ra Cổng
                          </button>
                        ) : (
                          <span className="text-[10.5px] text-slate-400 font-semibold">✓ Đã rời đi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SỔ KHAI BÁO MẤT THẺ XE & CAMERA AI */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>Sổ Khai Báo Mất Thẻ Xe, Xác Nhận Làm Chứng &amp; Camera ANPR</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Quy trình số hóa: Cần 2 chữ ký đồng nghiệp làm chứng xác nhận nhân thân + Camera AI soi biển số đối chiếu trước khi bảo vệ mở barie.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lostParkingReports.map(item => (
                <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {item.id}
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm mt-1">{item.empName} ({item.empId})</h5>
                      <div className="text-[11px] text-slate-500">{item.department} • Biển số: <b className="font-mono text-slate-800">{item.plateNumber}</b></div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === 'RELEASED_AND_LOCKED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.status === 'RELEASED_AND_LOCKED' ? '✓ Đã cho xuất bãi' : '⏳ Chờ đối chiếu'}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-white border border-slate-200 text-[11px] space-y-1">
                    <div className="font-semibold text-slate-700">Người làm chứng xác nhận:</div>
                    {item.witnesses.map(w => (
                      <div key={w.id} className="text-slate-600">
                        • <b>{w.name}</b> ({w.roleDesc}): "{w.reasonNote}"
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setShowAnprModal(item)}
                      className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3 h-3 text-purple-600" />
                      <span>Soi Camera AI OCR Biển Số</span>
                    </button>
                    {item.securityGuardConfirmed ? (
                      <span className="text-emerald-700 font-bold text-xs">✓ BV: {item.guardName}</span>
                    ) : (
                      <button
                        onClick={() => {
                          setLostParkingReports(prev => prev.map(r => r.id === item.id ? { ...r, status: 'RELEASED_AND_LOCKED', securityGuardConfirmed: true, releaseTime: 'Vừa xong' } : r));
                          alert('Bảo vệ đã xác nhận đối chiếu thành công và cho xe xuất bãi!');
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Cho Xe Ra Cổng
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ PHÂN HỆ 5: HẬU CẦN TEABREAK & BIÊN BẢN HỌP ════════════════════ */}
      {activeTab === 'MEETING_SERVICES' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Coffee className="w-4 h-4 text-amber-500" />
                  <span>Dịch Vụ Hậu Cần Cuộc Họp, Teabreak &amp; Biên Bản Ký Số (Meeting Services)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi yêu cầu setup bàn ghế, nước uống, thiết bị AV và ghi nhận biên bản cuộc họp, giao việc sau họp
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scheduledMeetings.map((meeting) => (
                <div key={meeting.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {meeting.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{meeting.title}</h4>
                      <div className="text-[11px] text-slate-500">Phòng: <b className="text-indigo-700">{meeting.roomName}</b> • {meeting.startTime} - {meeting.endTime}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Sơ đồ: {meeting.layout}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                    <div className="text-slate-600 font-semibold flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hậu cần &amp; Teabreak yêu cầu:</span>
                    </div>
                    <p className="text-slate-800 text-[11.5px] font-medium">{meeting.teaAndSnacks}</p>
                    <div className="text-[10.5px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                      <span>Dự toán: <b>{meeting.cateringCost.toLocaleString('vi-VN')} đ</b></span>
                      <span>Hỗ trợ IT/Polycom: <b className={meeting.itSupportRequested ? 'text-emerald-700' : 'text-slate-400'}>{meeting.itSupportRequested ? '✓ Bắt buộc' : 'Không'}</b></span>
                    </div>
                  </div>

                  {/* Biên bản tóm tắt */}
                  {meeting.minutesNotes ? (
                    <div className="p-2 rounded bg-indigo-50/60 border border-indigo-200 text-[11px] text-slate-700">
                      <div className="font-bold text-indigo-900">Biên bản kết luận:</div>
                      <p className="italic mt-0.5">{meeting.minutesNotes}</p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">Chưa lập biên bản cuộc họp</div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setShowMinutesModal(meeting)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>{meeting.minutesNotes ? 'Xem / Cập Nhật Biên Bản' : '+ Lập Biên Bản Cuộc Họp'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ PHÂN HỆ 6: KHO QUÀ TẶNG VIP & BÁO CÁO PHÂN TÍCH ════════════════════ */}
      {activeTab === 'BUDGET_GIFTS_ANALYTICS' && (
        <div className="space-y-4 animate-in fade-in">
          {/* 4 Thẻ KPI Ngân Sách Tiếp Khách */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Ngân Sách Tiếp Khách Tháng</span>
                <DollarSign className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-bold text-indigo-700 mt-1">25.000.000 đ</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Đã giải ngân: 14.850.000 đ (59.4%)</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Chi Phí Trà Bánh Teabreak</span>
                <Coffee className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-amber-600 mt-1">5.650.000 đ</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Bình quân 1.130.000 đ / đoàn</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tổng Quà Tồn Kho</span>
                <Gift className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-purple-600 mt-1">
                {giftInventory.reduce((sum, g) => sum + g.stock, 0)} Suất
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Kho ngoại giao sẵn sàng</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Hiệu Suất Dùng Phòng</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-600 mt-1">78.5%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Cao nhất tại Executive &amp; VIP</div>
            </div>
          </div>

          {/* BẢNG KHO QUÀ TẶNG NGOẠI GIAO VIP */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span>Kho Quà Tặng Ngoại Giao, Khánh Tiết Đối Tác VIP &amp; Lịch Sử Trao Tặng</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Quản lý định mức, tồn kho an toàn và lưu vết lịch sử đã tặng từng đối tác để tránh tặng trùng món quà trong các lần thăm sau.
                </p>
              </div>

              <button
                onClick={handleExportExcel}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Báo Cáo Excel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {giftInventory.map(gift => (
                <div key={gift.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {gift.id}
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm mt-1">{gift.name}</h5>
                      <div className="text-[11px] text-slate-500">Đối tượng: {gift.recipientLevel}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-mono font-black text-purple-700">{gift.stock} Suất</span>
                      <span className="text-[10px] text-slate-400 block">Đơn giá: {gift.unitCost.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1">
                    <div className="font-bold text-slate-700 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lịch sử các đoàn đã trao tặng:</span>
                    </div>
                    {gift.giftHistory.map((h, i) => (
                      <div key={i} className="text-slate-600 text-[10.5px]">
                        • <b className="text-slate-800">{h.date}</b>: Trao tặng {h.quantity} phần cho <b>{h.partnerName}</b> ({h.delegateName}) - <i>{h.eventTitle}</i>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 1: ĐẶT PHÒNG HỌP & TIẾP KHÁCH MỚI ════════════════════ */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-3.5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <DoorOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase">Đăng Ký Đặt Phòng Họp &amp; Tiếp Khách Thông Minh</h3>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cảnh Báo Trùng Lịch Nếu Có */}
            {isConflict && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <b>CẢNH BÁO TRÙNG LỊCH:</b> Khung giờ ({bookingForm.startTime} - {bookingForm.endTime}) tại phòng đã chọn đang bị trùng với một cuộc họp khác. Vui lòng chọn giờ hoặc phòng khác!
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên Cuộc Họp / Chương Trình Tiếp Khách *:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đón tiếp đoàn đối tác chuyên gia công nghệ..."
                  value={bookingForm.title}
                  onChange={e => setBookingForm({ ...bookingForm, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chọn Phòng Họp:</label>
                  <select
                    value={bookingForm.roomId}
                    onChange={e => setBookingForm({ ...bookingForm, roomId: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none bg-white font-bold text-indigo-700"
                  >
                    {meetingRooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.capacity} chỗ - {r.floor})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phân Loại Cuộc Họp:</label>
                  <select
                    value={bookingForm.type}
                    onChange={e => setBookingForm({ ...bookingForm, type: e.target.value as ScheduledMeeting['type'] })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl outline-none bg-white"
                  >
                    <option value="PARTNER">Đối tác Chiến lược / Khách hàng</option>
                    <option value="GOVERNMENT">Cơ quan Ban ngành Nhà nước</option>
                    <option value="AUDIT">Đoàn Đánh giá / Audit Quốc tế</option>
                    <option value="INTERNAL_MEETING">Họp Nội Bộ Công Ty</option>
                    <option value="TRAINING">Đào Tạo &amp; Huấn Luyện</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Họp:</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Bắt Đầu:</label>
                  <input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giờ Kết Thúc:</label>
                  <input
                    type="time"
                    value={bookingForm.endTime}
                    onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đơn Vị Khách / Cơ Quan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Tên công ty hoặc sở ban ngành"
                    value={bookingForm.organization}
                    onChange={e => setBookingForm({ ...bookingForm, organization: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Người Tham Dự:</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingForm.visitorCount}
                    onChange={e => setBookingForm({ ...bookingForm, visitorCount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trưởng Đoàn Khách:</label>
                  <input
                    type="text"
                    placeholder="Họ tên & chức danh khách"
                    value={bookingForm.leadVisitor}
                    onChange={e => setBookingForm({ ...bookingForm, leadVisitor: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sắp Xếp Bàn Ghế:</label>
                  <select
                    value={bookingForm.layout}
                    onChange={e => setBookingForm({ ...bookingForm, layout: e.target.value as ScheduledMeeting['layout'] })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none bg-white"
                  >
                    <option value="BOARDROOM">Hội Đàm Cấp Cao (Boardroom)</option>
                    <option value="U_SHAPE">Bàn Chữ U (U-Shape)</option>
                    <option value="CLASSROOM">Lớp Học / Bàn Dãy (Classroom)</option>
                    <option value="THEATER">Rạp Hát / Ghế Hội Trường (Theater)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Yêu Cầu Hậu Cần &amp; Teabreak:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trà sen Tây Hồ, Cà phê pha máy, Hoa quả tươi..."
                  value={bookingForm.teaAndSnacks}
                  onChange={e => setBookingForm({ ...bookingForm, teaAndSnacks: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="itSupport"
                  checked={bookingForm.itSupportRequested}
                  onChange={e => setBookingForm({ ...bookingForm, itSupportRequested: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="itSupport" className="text-slate-700 font-semibold cursor-pointer">
                  Yêu cầu kỹ sư CNTT trực hỗ trợ kỹ thuật Polycom 4K và test kết nối trước 15 phút
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isConflict}
                  className={`px-5 py-2 rounded-xl text-white font-bold transition-all shadow-md cursor-pointer ${
                    isConflict ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  Xác Nhận Đặt Phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 2: MÔ PHỎNG TABLET DIGITAL DOOR SIGNAGE ════════════════════ */}
      {showDoorSignageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          {/* Vỏ máy tính bảng Digital Signage treo tường */}
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-4 border-slate-700 relative overflow-hidden space-y-4">
            {/* Thanh camera & đèn báo viền tablet */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${showDoorSignageModal.status === 'IN_USE' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
                <span className="font-mono text-xs text-indigo-400 font-bold uppercase">
                  {showDoorSignageModal.id} • {showDoorSignageModal.floor}
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-slate-300">
                {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <button
                onClick={() => setShowDoorSignageModal(null)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thân bảng hiển thị ngoài cửa */}
            <div className={`p-5 rounded-2xl border ${
              showDoorSignageModal.status === 'IN_USE'
                ? 'bg-rose-950/40 border-rose-700/60'
                : 'bg-emerald-950/40 border-emerald-700/60'
            } space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black">{showDoorSignageModal.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  showDoorSignageModal.status === 'IN_USE'
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-emerald-500 text-slate-950 shadow-lg'
                }`}>
                  {showDoorSignageModal.status === 'IN_USE' ? 'ĐANG CÓ CUỘC HỌP (OCCUPIED)' : 'PHÒNG ĐANG TRỐNG (VACANT)'}
                </span>
              </div>

              {showDoorSignageModal.status === 'IN_USE' ? (
                <div className="space-y-2 pt-2">
                  <div className="text-xs text-rose-300 uppercase font-bold">Cuộc họp đang diễn ra:</div>
                  <div className="text-lg font-bold text-white">{showDoorSignageModal.currentMeeting}</div>
                  <div className="text-xs text-slate-300">
                    Chủ trì: <b>{showDoorSignageModal.organizer}</b> • Dự kiến kết thúc: <b className="text-amber-300 font-mono">{showDoorSignageModal.meetingEndTime}</b>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => alert('Đã gửi yêu cầu gia hạn thêm 15 phút tới hệ thống điều phối!')}
                      className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                    >
                      + Gia Hạn 15 Phút
                    </button>
                    <button
                      onClick={() => {
                        setMeetingRooms(prev => prev.map(r => r.id === showDoorSignageModal.id ? { ...r, status: 'AVAILABLE', currentMeeting: '' } : r));
                        setShowDoorSignageModal(null);
                        alert('Đã kết thúc cuộc họp sớm và giải phóng phòng thành công!');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Kết Thúc Sớm (Giải Phóng Phòng)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-emerald-300">
                    Phòng họp sẵn sàng với đầy đủ tiện ích: {showDoorSignageModal.amenities.slice(0, 3).join(', ')}...
                  </p>
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => {
                        setBookingForm(prev => ({ ...prev, roomId: showDoorSignageModal.id }));
                        setShowDoorSignageModal(null);
                        setShowBookingModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                    >
                      + Đặt Phòng Ngay Tại Chỗ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Tablet: QR Check-in & IT Lead */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div>Kỹ thuật hỗ trợ: <b className="text-slate-200">{showDoorSignageModal.techLead}</b></div>
              <div className="flex items-center space-x-1 text-slate-300">
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Quét QR tại cửa để Check-in</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 3: TRÌNH TẠO BANNER LED CHÀO MỪNG KHÁCH VIP ════════════════════ */}
      {showBannerLedModal && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6">
          {/* Thanh công cụ điều khiển Banner */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 text-white text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold uppercase tracking-wider">Trình Chiếu Banner LED Màn Hình Sảnh / Phòng Họp Ngoại Giao</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFullscreenLed(!isFullscreenLed)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer flex items-center gap-1"
              >
                {isFullscreenLed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isFullscreenLed ? 'Thu Nhỏ' : 'Toàn Màn Hình'}</span>
              </button>
              <button
                onClick={() => setShowBannerLedModal(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-rose-600 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vùng Trình Chiếu Banner LED Chuẩn Ngoại Giao */}
          <div className={`w-full max-w-5xl rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-6 shadow-2xl border transition-all ${
            showBannerLedModal.bannerTheme === 'RED_GOLD'
              ? 'bg-gradient-to-b from-red-800 via-red-900 to-rose-950 border-amber-400/40 text-amber-200'
              : showBannerLedModal.bannerTheme === 'ROYAL_GOLD'
              ? 'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-amber-500/50 text-amber-300'
              : 'bg-gradient-to-b from-blue-900 via-slate-900 to-indigo-950 border-blue-400/40 text-blue-200'
          }`}>
            {/* Logo Công Ty */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/30 flex items-center justify-center text-white shadow-xl">
              <Building className="w-10 h-10 text-amber-400" />
            </div>

            <div className="space-y-3 max-w-3xl">
              <h4 className="text-sm font-bold tracking-widest uppercase text-white/80">
                CÔNG TY CỔ PHẦN TẬP ĐOÀN CÔNG NGHIỆP &amp; SẢN XUẤT VIỆT NAM
              </h4>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-amber-300 leading-tight drop-shadow-md">
                {showBannerLedModal.welcomeBannerText}
              </h1>
              <div className="h-1 w-32 bg-amber-400 mx-auto rounded-full mt-2"></div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-white/90 font-medium">
              <span>📍 Địa điểm: {showBannerLedModal.room}</span>
              <span>📅 Ngày: {showBannerLedModal.date}</span>
              <span>⏰ Thời gian: {showBannerLedModal.time}</span>
            </div>
          </div>

          {/* Hướng dẫn phím bấm */}
          <div className="text-slate-500 text-xs text-center">
            * Màn hình này được tối ưu để chiếu toàn màn hình trên TV sảnh chính hoặc màn hình LED phòng khánh tiết khi đoàn khách đến.
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 4: BIÊN BẢN HỌP & GIAO VIỆC ════════════════════ */}
      {showMinutesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase">Biên Bản Cuộc Họp &amp; Giao Việc Sau Họp</h3>
              </div>
              <button onClick={() => setShowMinutesModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{showMinutesModal.title}</div>
                <div className="text-slate-600">Phòng: <b>{showMinutesModal.roomName}</b> • {showMinutesModal.date} ({showMinutesModal.startTime} - {showMinutesModal.endTime})</div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tóm Tắt Nội Dung &amp; Kết Luận Cuộc Họp:</label>
                <textarea
                  rows={3}
                  defaultValue={showMinutesModal.minutesNotes || ''}
                  placeholder="Ghi nhận tóm tắt các thỏa thuận, kết luận chỉ đạo của lãnh đạo..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Đầu Việc Cần Thực Hiện (Action Items):</label>
                <div className="space-y-1.5">
                  {(showMinutesModal.actionItems || [
                    { id: 'ACT-1', task: 'Soạn thảo văn bản phản hồi và gửi báo cáo trước thứ 6', assignee: 'Phòng HCNS', deadline: '05/09/2026', status: 'PENDING' }
                  ]).map((item, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{item.task}</div>
                        <div className="text-[10.5px] text-slate-500">Phụ trách: <b>{item.assignee}</b> • Hạn chót: {item.deadline}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowMinutesModal(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Lưu Biên Bản
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 5: MÃ QR BÀI THI HSE MOBILE ════════════════════ */}
      {showSafetyQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Mã QR Kiểm Tra An Toàn HSE</h3>
              <button onClick={() => setShowSafetyQrModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Khách dùng điện thoại quét mã QR để xem video an toàn 2 phút và trả lời 5 câu hỏi trắc nghiệm an toàn nhà máy.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
              <QrCode className="w-40 h-40 text-slate-900 mx-auto" />
            </div>
            <div className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 py-1 px-2 rounded">
              LINK: https://safety.factory.vn/exam?code=AF-HSE-2026
            </div>
            <button
              onClick={() => {
                setShowSafetyQrModal(false);
                alert('Đã xác nhận kết quả làm bài của khách đạt 5/5 câu!');
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Xác Nhận Đạt Bài Thi
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 6: IN PHIẾU BÀI THI AN TOÀN GIẤY ════════════════════ */}
      {showSafetyPaperModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Mẫu Phiếu Đề Thi &amp; Cam Kết An Toàn HSE Viết Tay</h3>
              <button onClick={() => setShowSafetyPaperModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 leading-relaxed">
              <div className="font-bold text-center text-sm text-slate-900 uppercase">
                BẢN CAM KẾT VÀ BÀI KIỂM TRA NỘI QUY AN TOÀN NHÀ MÁY
              </div>
              <div className="text-[11px] text-slate-600 text-center">
                (Dành cho khách tham quan, chuyên gia kỹ thuật và nhà thầu thi công)
              </div>
              <div className="pt-2 text-slate-700 space-y-1">
                <div>1. Tuyệt đối đi đúng lối vạch sơn màu vàng dành cho người đi bộ.</div>
                <div>2. Bắt buộc đội mũ bảo hộ, đi giày bảo hộ và đeo kính khi vào khu vực sản xuất.</div>
                <div>3. Không chụp ảnh, quay phim khi chưa có sự đồng ý của Ban Giám Đốc.</div>
                <div>4. Cấm hút thuốc lá ngoài khu vực quy định.</div>
              </div>
              <div className="pt-3 flex justify-between text-slate-600 font-semibold border-t border-slate-200">
                <div>Cán bộ bảo vệ phát phiếu: (Ký tên)</div>
                <div>Khách cam kết: (Ký &amp; Ghi rõ họ tên)</div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                  setShowSafetyPaperModal(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Ra Máy In</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 7: KHÁCH VÀO CỔNG MỚI ════════════════════ */}
      {showGateCheckInModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Đăng Ký Khách Vào Cổng Bảo Vệ</h3>
              <button onClick={() => setShowGateCheckInModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Họ &amp; Tên Khách:</label>
                <input type="text" placeholder="Nhập họ và tên..." className="w-full p-2 border border-slate-300 rounded-xl outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Công Ty / Đơn Vị:</label>
                  <input type="text" placeholder="Tên đơn vị..." className="w-full p-2 border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Điện Thoại:</label>
                  <input type="text" placeholder="090..." className="w-full p-2 border border-slate-300 rounded-xl outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cán Bộ Đón:</label>
                  <input type="text" placeholder="Tên cán bộ tiếp đón..." className="w-full p-2 border border-slate-300 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Biển Số Xe (Nếu có):</label>
                  <input type="text" placeholder="61A-..." className="w-full p-2 border border-slate-300 rounded-xl outline-none font-mono" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowGateCheckInModal(false);
                    alert('Đã cấp thẻ khách và ghi nhận vào cổng thành công!');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Xác Nhận Cho Vào Cổng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 8: SOI CAMERA AI OCR BIỂN SỐ ════════════════════ */}
      {showAnprModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Đối Chiếu Camera AI ANPR Biển Số Xe</h3>
              <button onClick={() => setShowAnprModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 text-white rounded-xl space-y-2 text-center">
              <div className="text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                Camera Cổng Vào Gate 1 - AI OCR Snapshot
              </div>
              <div className="w-full h-44 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 relative overflow-hidden">
                <img
                  src={showAnprModal.cameraPlateSnapshotUrl}
                  alt="Vehicle Plate"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 text-emerald-400 font-mono text-xs px-2 py-1 rounded font-bold border border-emerald-500/50">
                  NHẬN DIỆN AI: {showAnprModal.plateNumber} (ĐỘ TIN CẬY 99.4%)
                </div>
              </div>
            </div>
            <div className="text-slate-700 space-y-1">
              <div>Chủ phương tiện: <b>{showAnprModal.empName} ({showAnprModal.empId})</b></div>
              <div>Dòng xe: <b>{showAnprModal.vehicleModel}</b></div>
              <div className="text-emerald-700 font-semibold">✓ Khớp 100% với hồ sơ nhân sự và đăng ký xe lưu trữ.</div>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAnprModal(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
