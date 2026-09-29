import { FormattedNumberInput } from './FormattedNumberInput';
import React, { useState, useMemo } from 'react';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';
import { CompactPagination, evaluateColumnCondition } from './SmartTableFilter';
import { CanteenMealPassModal } from './CanteenMealPassModal';
import { ReceptionAndMeetingHub } from './ReceptionAndMeetingHub';
import { AdminRequisitionsHub } from './AdminRequisitionsHub';
import { DigitalArchiveHub } from './DigitalArchiveHub';
import { OfficeCostsAndInfraHub } from './OfficeCostsAndInfraHub';
import { VehicleAndTravelHub } from './VehicleAndTravelHub';
import { UniformsAndPPEHub } from './UniformsAndPPEHub';
import { MedicalAndFirstAidHub } from './MedicalAndFirstAidHub';
import { HSEAndSafetyComplianceHub } from './HSEAndSafetyComplianceHub';
import { 
  Building, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  Car, 
  Coffee, 
  HeartPulse, 
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
  Briefcase, 
  Shirt, 
  Wrench, 
  Flame, 
  FileSpreadsheet,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MapPin,
  ExternalLink,
  Laptop,
  AlertTriangle,
  ClipboardCheck,
  Activity,
  Trash2,
  Edit3,
  QrCode,
  Video,
  Camera,
  Utensils,
  LogIn,
  LogOut,
  HelpCircle,
  Send,
  Key,
  FileSignature,
  UserCheck,
  ShieldCheck,
  Leaf,
  CheckCheck,
  UserPlus,
  HardHat,
  Truck,
  Bug,
  TreePine,
  Power,
  MonitorPlay,
  Gift,
  History,
  DoorOpen,
  BarChart3,
  AlertOctagon
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface AdministrationViewProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
}

export type AdminSubTab = 
  | 'VISITORS_AND_MEETINGS'      // 1. Lịch tiếp khách & Đặt phòng họp
  | 'ADMIN_REQUESTS'             // 2. Tiếp nhận & Xử lý yêu cầu (VPP, vé, du lịch, khám SK...)
  | 'ARCHIVE_DOCUMENTS'          // 3. Văn thư lưu trữ (Công văn đến, đi, nội bộ)
  | 'OFFICE_COSTS_INFRA'         // 4. Chi phí văn phòng & Cơ sở hạ tầng
  | 'VEHICLES_TRAVEL'            // 5. Quản lý xe công tác & Đi lại (Grab, Taxi, Xe cty)
  | 'UNIFORMS_AND_ASSETS'        // 6. Đồng phục, CCDC & Tài sản
  | 'MEDICAL_ROOM'               // 7. Phòng y tế & Sơ cấp cứu
  | 'PARTNER_SERVICES'          // 8. Dịch vụ đối tác thuê ngoài & Tiện ích cơ sở (Bảo vệ, Tạp vụ, Cơm ca, Cây xanh, MEP, Máy in)
  | 'HSE_SAFETY_COMPLIANCE';    // 9. Công tác An toàn Vệ sinh Lao động (HSE) & Lịch kiểm tra, Ghi nhận vi phạm

export const AdministrationView: React.FC<AdministrationViewProps> = ({
  policy,
  employees,
  currentRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('VISITORS_AND_MEETINGS');
  const adminTabsRef = React.useRef<HTMLDivElement>(null);
  const handleScrollAdminTabs = (direction: 'left' | 'right') => {
    if (adminTabsRef.current) {
      adminTabsRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth'
      });
    }
  };

  // ========================================================
  // ========================================================
  // 1.C: DỮ LIỆU KHAI BÁO MẤT THẺ XE & XÁC NHẬN LÀM CHỨNG
  // ========================================================
  interface LostParkingWitness {
    id: string;
    name: string;
    empId: string;
    roleDesc: string;
    confirmed: boolean;
    reasonNote: string;
    confirmedAt?: string;
  }

  interface LostParkingCardReport {
    id: string;
    empId: string;
    empName: string;
    dept: string;
    licensePlate: string;
    vehicleModel: string;
    vehicleColor: string;
    registrationDoc: string;
    parkingLocation: string;
    lostTime: string;
    reportDate: string;
    witnessType: 'DEPT_HEAD' | 'TWO_COWORKERS';
    witnesses: LostParkingWitness[];
    securityGuardConfirmed: boolean;
    guardName?: string;
    releaseTime?: string;
    status: 'WAITING_WITNESS' | 'WITNESS_CONFIRMED' | 'RELEASED_AND_LOCKED';
  }

  const [lostParkingReports, setLostParkingReports] = useState<LostParkingCardReport[]>([
    {
      id: 'TX-2026-001',
      empId: 'AV-0342',
      empName: 'Nguyễn Văn Tuấn',
      dept: 'Phân Xưởng Chế Biến',
      licensePlate: '60B1-892.45',
      vehicleModel: 'Honda Wave Alpha 110',
      vehicleColor: 'Xanh ngọc',
      registrationDoc: '054329/CA-Dĩ An',
      parkingLocation: 'Bãi Xe Máy Số 1 (Cổng Nam xưởng)',
      lostTime: '11:45 28/08/2026',
      reportDate: '28/08/2026',
      witnessType: 'TWO_COWORKERS',
      witnesses: [
        {
          id: 'W1',
          name: 'Trần Thị Thu Thảo',
          empId: 'AV-0418',
          roleDesc: 'Đồng nghiệp cùng ca Chế biến',
          confirmed: true,
          reasonNote: 'Tôi cùng ca 1 với anh Tuấn, sáng nay 07:35 có đi gửi xe cùng lúc ở Bãi 1, thấy anh Tuấn đi xe Wave xanh BKS 60B1-892.45 gửi đúng ô số 42.',
          confirmedAt: '12:05 28/08/2026'
        },
        {
          id: 'W2',
          name: 'Lê Hữu Hoàng',
          empId: 'AV-0399',
          roleDesc: 'Đồng nghiệp cùng tổ máy',
          confirmed: true,
          reasonNote: 'Tôi làm cùng chuyền và ở cùng xóm trọ với Tuấn, xác nhận xe này của Tuấn đứng tên cà vẹt chính chủ, trưa nay ăn cơm xong phát hiện rơi thẻ.',
          confirmedAt: '12:15 28/08/2026'
        }
      ],
      securityGuardConfirmed: true,
      guardName: 'Nguyễn Văn Đạt (Bảo vệ Đất Việt)',
      releaseTime: '12:30 28/08/2026',
      status: 'RELEASED_AND_LOCKED'
    },
    {
      id: 'TX-2026-002',
      empId: 'AV-0612',
      empName: 'Phạm Hồng Nhung',
      dept: 'Khối Văn Phòng (Kế Toán)',
      licensePlate: '59P2-431.88',
      vehicleModel: 'Honda Vision 110',
      vehicleColor: 'Trắng bạc',
      registrationDoc: '098124/CA-Thủ Đức',
      parkingLocation: 'Bãi Xe Văn Phòng (Khu A)',
      lostTime: '17:15 28/08/2026',
      reportDate: '28/08/2026',
      witnessType: 'DEPT_HEAD',
      witnesses: [
        {
          id: 'W1',
          name: 'Nguyễn Thị Mai Chi',
          empId: 'AV-0120',
          roleDesc: 'Kế Toán Trưởng (Quản lý trực tiếp)',
          confirmed: true,
          reasonNote: 'Tôi là quản lý trực tiếp xác nhận em Nhung đi xe Vision trắng BKS 59P2-431.88 đi làm từ sáng, để xe đúng ô khu A văn phòng.',
          confirmedAt: '17:25 28/08/2026'
        }
      ],
      securityGuardConfirmed: false,
      status: 'WITNESS_CONFIRMED'
    },
    {
      id: 'TX-2026-003',
      empId: 'AV-0588',
      empName: 'Vũ Đức Trọng',
      dept: 'Kho Vận & Logistics',
      licensePlate: '60C2-675.12',
      vehicleModel: 'Yamaha Exciter 150',
      vehicleColor: 'Đen nhám',
      registrationDoc: '112876/CA-Đồng Nai',
      parkingLocation: 'Bãi Xe Cổng Bắc',
      lostTime: '18:00 28/08/2026',
      reportDate: '28/08/2026',
      witnessType: 'TWO_COWORKERS',
      witnesses: [
        {
          id: 'W1',
          name: 'Đặng Quốc Huy',
          empId: 'AV-0590',
          roleDesc: 'Đồng nghiệp Kho Vận',
          confirmed: false,
          reasonNote: ''
        },
        {
          id: 'W2',
          name: 'Phan Văn Nam',
          empId: 'AV-0594',
          roleDesc: 'Đồng nghiệp Kho Vận',
          confirmed: false,
          reasonNote: ''
        }
      ],
      securityGuardConfirmed: false,
      status: 'WAITING_WITNESS'
    }
  ]);

  const [showLostCardModal, setShowLostCardModal] = useState(false);
  const [showAnprModal, setShowAnprModal] = useState<LostParkingCardReport | null>(null);
  const [showWitnessConfirmModal, setShowWitnessConfirmModal] = useState<{ report: LostParkingCardReport; witnessIndex: number } | null>(null);
  const [showPrintLostCardModal, setShowPrintLostCardModal] = useState<LostParkingCardReport | null>(null);
  const [witnessInputReason, setWitnessInputReason] = useState('');

  const [newLostCardForm, setNewLostCardForm] = useState({
    empName: '',
    empId: '',
    dept: 'Phân Xưởng Chế Biến',
    licensePlate: '',
    vehicleModel: '',
    vehicleColor: '',
    registrationDoc: '',
    parkingLocation: 'Bãi Xe Máy Số 1 (Cổng Nam xưởng)',
    lostTime: '',
    witnessType: 'TWO_COWORKERS' as 'DEPT_HEAD' | 'TWO_COWORKERS',
    witness1Name: '',
    witness1EmpId: '',
    witness2Name: '',
    witness2EmpId: '',
    managerName: '',
    managerEmpId: ''
  });

  // ========================================================
  // 9.B: DỮ LIỆU ĐIỀU TRA SỰ CỐ HIỆN TRƯỜNG & TRUY VẾT NHÂN CHỨNG
  // ========================================================
  interface IncidentPerson {
    name: string;
    empId: string;
    dept: string;
    role: string;
  }

  interface IncidentWitness {
    name: string;
    empId: string;
    dept: string;
    statement: string;
  }

  interface IncidentInvestigationReport {
    id: string;
    title: string;
    incidentDate: string;
    incidentTime: string;
    location: string;
    incidentType: 'TAI_NAN_LAO_DONG' | 'XO_XAT_DANH_NHAU' | 'HOA_HOAN_CHAY_NO' | 'HU_HONG_TAI_SAN' | 'VI_PHAM_KY_LUAT';
    typeName: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    severityName: string;
    involvedPersons: IncidentPerson[];
    witnesses: IncidentWitness[];
    immediateAction: string;
    rootCause: string;
    correctiveAction: string;
    status: 'INVESTIGATING' | 'DISCIPLINARY' | 'RESOLVED';
    statusName: string;
    investigator: string;
  }

  const [incidentReports, setIncidentReports] = useState<IncidentInvestigationReport[]>([
    {
      id: 'SC-2026-001',
      title: 'Tai nạn lao động nhẹ va quẹt góc máy đóng gói tự động',
      incidentDate: '2026-08-25',
      incidentTime: '14:20',
      location: 'Chuyền Đóng Gói 02 - Phân Xưởng Đóng Gói',
      incidentType: 'TAI_NAN_LAO_DONG',
      typeName: 'Tai Nạn Lao Động',
      severity: 'MEDIUM',
      severityName: 'Trung Bình',
      involvedPersons: [
        { name: 'Hoàng Văn Tuấn', empId: 'AV-0452', dept: 'Xưởng Đóng Gói', role: 'Nạn nhân (rách da mu bàn tay)' }
      ],
      witnesses: [
        { name: 'Đỗ Thị Lan', empId: 'AV-0480', dept: 'Xưởng Đóng Gói', statement: 'Anh Tuấn cúi xuống gỡ cuộn màng mọc khi máy chưa dừng hẳn, va quẹt vào góc thép bảo vệ.' },
        { name: 'Vũ Đức Thịnh', empId: 'AV-0391', dept: 'Bảo Trì Cơ Điện', statement: 'Tôi nghe tiếng kêu ngắt máy khẩn cấp ngay lập tức và bấm nút E-Stop hỗ trợ đưa anh Tuấn ra Trạm Y tế.' }
      ],
      immediateAction: 'Sơ cứu băng bó tại Trạm Y tế công ty, đưa đến Bệnh viện Đa khoa Dĩ An khâu 3 mũi, sức khỏe ổn định.',
      rootCause: 'Thao tác xử lý sự cố khi chưa ngắt nguồn hoàn toàn (vi phạm quy trình LOTO ngắt điện).',
      correctiveAction: 'Gia cố thêm cảm biến quang học ngắt máy tự động, tái đào tạo quy trình LOTO cho toàn tổ.',
      status: 'RESOLVED',
      statusName: 'Đã giải quyết & Khắc phục',
      investigator: 'Ban An Toàn HSE & Trưởng Ca Đóng Gói'
    },
    {
      id: 'SC-2026-002',
      title: 'Xô xát to tiếng và tranh cãi tại khu vực Nhà ăn ca trưa',
      incidentDate: '2026-08-27',
      incidentTime: '12:10',
      location: 'Khu vực quầy phát cơm Nhà ăn ca Nhà máy',
      incidentType: 'XO_XAT_DANH_NHAU',
      typeName: 'Xô Xát / Đánh Nhau',
      severity: 'HIGH',
      severityName: 'Nghiêm Trọng',
      involvedPersons: [
        { name: 'Lê Minh H', empId: 'AV-0711', dept: 'Kho Vận & Logistics', role: 'Bên liên quan 1 (chen lấn, to tiếng)' },
        { name: 'Trần Đình K', empId: 'AV-0689', dept: 'Xưởng Chế Biến', role: 'Bên liên quan 2 (xô đẩy khay cơm)' }
      ],
      witnesses: [
        { name: 'Nguyễn Thị Bích', empId: 'AV-0520', dept: 'Tạp vụ Nhà ăn', statement: 'Hai người tranh cãi việc ai xếp hàng trước, anh H xô khay cơm khiến rơi vãi rồi xông vào túm áo nhau.' },
        { name: 'Phạm Quốc Bảo', empId: 'AV-0315', dept: 'Bảo Vệ Ca Trực', statement: 'Tôi có mặt sau 30 giây can ngăn kịp thời, đưa cả hai người về văn phòng Đội an ninh lập biên bản vi phạm.' }
      ],
      immediateAction: 'Bảo vệ lập biên bản hiện trường, tạm đình chỉ công việc buổi chiều, yêu cầu viết bản tường trình.',
      rootCause: 'Thiếu kiềm chế cảm xúc nơi công cộng, vi phạm Nội quy lao động về văn hóa ứng xử.',
      correctiveAction: 'Chuyển hồ sơ Hội đồng kỷ luật xem xét Khiển trách bằng văn bản và trừ điểm đánh giá tháng.',
      status: 'DISCIPLINARY',
      statusName: 'Đang họp Hội đồng kỷ luật',
      investigator: 'Đội Trưởng An Ninh & Đại Diện HCNS'
    }
  ]);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showPrintIncidentModal, setShowPrintIncidentModal] = useState<IncidentInvestigationReport | null>(null);

  const [newIncidentForm, setNewIncidentForm] = useState({
    title: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    location: 'Xưởng Chế Biến',
    incidentType: 'TAI_NAN_LAO_DONG' as 'TAI_NAN_LAO_DONG' | 'XO_XAT_DANH_NHAU' | 'HOA_HOAN_CHAY_NO' | 'HU_HONG_TAI_SAN' | 'VI_PHAM_KY_LUAT',
    severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    involvedPerson1Name: '',
    involvedPerson1Id: '',
    involvedPerson1Dept: '',
    involvedPerson1Role: '',
    witness1Name: '',
    witness1Id: '',
    witness1Dept: '',
    witness1Statement: '',
    witness2Name: '',
    witness2Id: '',
    witness2Dept: '',
    witness2Statement: '',
    immediateAction: '',
    rootCause: '',
    correctiveAction: '',
    investigator: 'Đội An Toàn HSE & An Ninh Cổng'
  });

  const handleWitnessConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showWitnessConfirmModal || !witnessInputReason.trim()) return;
    const { report, witnessIndex } = showWitnessConfirmModal;
    
    setLostParkingReports(prev => prev.map(item => {
      if (item.id !== report.id) return item;
      const updatedWitnesses = [...item.witnesses];
      updatedWitnesses[witnessIndex] = {
        ...updatedWitnesses[witnessIndex],
        confirmed: true,
        reasonNote: witnessInputReason.trim(),
        confirmedAt: new Date().toLocaleString('vi-VN')
      };
      
      const allConfirmed = updatedWitnesses.every(w => w.confirmed);
      return {
        ...item,
        witnesses: updatedWitnesses,
        status: allConfirmed ? 'WITNESS_CONFIRMED' : 'WAITING_WITNESS'
      };
    }));

    setShowWitnessConfirmModal(null);
    setWitnessInputReason('');
  };

  const handleSecurityReleaseVehicle = (reportId: string) => {
    const guardName = prompt('Nhập tên Bảo vệ ca trực xác nhận bàn giao xe:', 'Nguyễn Văn Đạt (Bảo vệ ca trực)') || 'Bảo vệ ca trực';
    setLostParkingReports(prev => prev.map(item => {
      if (item.id !== reportId) return item;
      return {
        ...item,
        securityGuardConfirmed: true,
        guardName,
        releaseTime: new Date().toLocaleString('vi-VN'),
        status: 'RELEASED_AND_LOCKED'
      };
    }));
  };

  // ========================================================
  // 1. QUẢN LÝ TIẾP KHÁCH, KHÁNH TIẾT & ĐẶT PHÒNG HỌP THÔNG MINH
  // ========================================================
  type ReceptionSubCategory = 
    | 'VIP_VISITORS'      // 1. Lịch Tiếp Đón Khách VIP & Đoàn Ban Ngành
    | 'MEETING_ROOMS'     // 2. Sơ Đồ & Điều Phối Phòng Họp Trực Quan
    | 'GATE_CHECKIN'      // 3. Sổ Kiểm Soát Cổng & Bài Thi An Toàn HSE
    | 'LOST_PARKING_CARD' // 4. Khai Báo Mất Thẻ Xe & Camera AI OCR
    | 'BUDGET_ANALYTICS'; // 5. Thống Kê Tiếp Khách & Ngân Sách Quà Tặng

  const [activeReceptionTab, setActiveReceptionTab] = useState<ReceptionSubCategory>('VIP_VISITORS');

  // Danh mục phòng họp cơ sở & trạng thái thời gian thực
  const [meetingRooms, setMeetingRooms] = useState([
    {
      id: 'ROOM-VIP-01',
      name: 'Phòng Khánh Tiết VIP Boardroom',
      floor: 'Tầng 5 - Khu Điều Hành',
      capacity: 16,
      status: 'IN_USE' as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE',
      currentMeeting: 'Đoàn Chuyên Gia Kỹ Thuật Sumitomo (14:00 - 16:30)',
      amenities: ['Màn hình LED 86 inch', 'Hội nghị trực tuyến Polycom 4K', 'Micro cổ ngỗng không dây', 'Bàn trà đạo VIP', 'A/C 2 chiều độc lập'],
      techLead: 'Kỹ sư CNTT Trần Văn Bình (0912.345.678)'
    },
    {
      id: 'ROOM-HALL-02',
      name: 'Hội Trường Lớn Grand Conference Hall',
      floor: 'Tầng 2 - Khối Trung Tâm',
      capacity: 120,
      status: 'AVAILABLE' as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE',
      currentMeeting: '',
      amenities: ['Máy chiếu Laser 10.000 Ansi', 'Âm thanh vòm sân khấu JBL', 'Hệ thống 4 Micro không dây', 'Bục phát biểu gỗ sồi', 'Cabin dịch song ngữ'],
      techLead: 'Kỹ sư CNTT Trần Văn Bình'
    },
    {
      id: 'ROOM-MEET-03',
      name: 'Phòng Họp Ban Giám Đốc (Executive Room)',
      floor: 'Tầng 3 - Cạnh Phòng Tổng GĐ',
      capacity: 20,
      status: 'AVAILABLE' as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE',
      currentMeeting: '',
      amenities: ['Màn hình cảm ứng tương tác Maxhub 75 inch', 'Webcam AI tự lấy nét speaker', 'Bảng kính viết bút lông', 'Tủ bảo mật tài liệu'],
      techLead: 'Hành chính Lê Thu Thảo'
    },
    {
      id: 'ROOM-OPER-04',
      name: 'Phòng Họp Phân Xưởng Sản Xuất (Ops Meeting Room)',
      floor: 'Tầng 1 - Khu Văn Phòng Xưởng 1',
      capacity: 30,
      status: 'IN_USE' as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE',
      currentMeeting: 'Họp giao ban tổ ca dập & bao bì (13:30 - 15:00)',
      amenities: ['TV Sony 65 inch HDMI/Wireless', 'Bảng Flipchart di động', 'Điều hòa 24.000 BTU', 'Bàn họp chữ U'],
      techLead: 'Kỹ sư quản đốc xưởng'
    },
    {
      id: 'ROOM-INNOV-05',
      name: 'Phòng Sáng Tạo & Brainstorming (Design Thinking)',
      floor: 'Tầng 4 - Khối R&D & Thiết Kế',
      capacity: 12,
      status: 'AVAILABLE' as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE',
      currentMeeting: '',
      amenities: ['Tường sơn nam châm viết vẽ toàn mảng', 'Ghế hạt xốp công thái học', 'Bàn di động đa năng', 'Bộ loa thông minh Harman Kardon'],
      techLead: 'Thư ký R&D'
    }
  ]);

  // Danh mục quà tặng lưu niệm & tiếp đãi đối tác VIP
  const [visitorGiftInventory, setVisitorGiftInventory] = useState([
    { id: 'GFT-01', name: 'Bộ ấm chén gốm sứ Bát Tràng in logo mạ vàng', stock: 24, unitCost: 450000, recipientLevel: 'Cơ quan Sở ban ngành & Đối tác chiến lược' },
    { id: 'GFT-02', name: 'Hộp trà Shan Tuyết cổ thụ Hà Giang đặc sản', stock: 35, unitCost: 380000, recipientLevel: 'Đoàn Audit quốc tế & Khách VIP' },
    { id: 'GFT-03', name: 'Bút ký cao cấp Picasso kim loại khắc tên cty', stock: 50, unitCost: 220000, recipientLevel: 'Khách tham quan & Chuyên gia đối tác' },
    { id: 'GFT-04', name: 'Sổ tay da dập chìm kèm USB kim loại 64GB', stock: 42, unitCost: 180000, recipientLevel: 'Đoàn trường ĐH & Đối tác tuyển dụng' }
  ]);

  // 1. DỮ LIỆU LỊCH TIẾP KHÁCH & ĐẶT PHÒNG HỌP (INTERACTIVE)
  // ========================================================
  const [visitorMeetings, setVisitorMeetings] = useState([
    {
      id: 'VM-001',
      title: 'Đoàn Thanh Tra Liên Ngành Sở LĐ-TB&XH Tỉnh Bình Dương',
      type: 'GOVERNMENT',
      typeName: 'Cơ quan Ban ngành',
      organization: 'Sở Lao Động - Thương Binh & Xã Hội',
      visitorCount: 5,
      leadVisitor: 'Ông Nguyễn Văn Thành (Trưởng đoàn)',
      hostEmployee: 'Trưởng Phòng HCNS',
      date: '2026-08-28',
      time: '09:00 - 11:30',
      room: 'Phòng Khánh Tiết (Tầng 3)',
      teaAndSnacks: 'Trà sen, cà phê, hoa tươi, hoa quả tươi',
      status: 'CONFIRMED',
      purpose: 'Thanh tra định kỳ công tác tuân thủ pháp luật lao động, tiền lương và BHLĐ năm 2026'
    },
    {
      id: 'VM-002',
      title: 'Đoàn Đánh Giá Tái Chứng Nhận ISO 45001 & ISO 14001',
      type: 'AUDIT',
      typeName: 'Đoàn Đánh giá / Audit',
      organization: 'Tổ chức Chứng nhận Quốc tế BSI Vietnam',
      visitorCount: 3,
      leadVisitor: 'Bà Đặng Mai Hoa (Lead Auditor)',
      hostEmployee: 'Giám Đốc Nhà Máy & Trưởng Ban HSE',
      date: '2026-08-29',
      time: '08:30 - 17:00',
      room: 'Phòng Họp Lớn Hội Nghị (Tầng 2)',
      teaAndSnacks: 'Bữa trưa tiếp khách tại nhà hàng, teabreak 2 cữ',
      status: 'CONFIRMED',
      purpose: 'Audit định kỳ hệ thống an toàn sức khỏe nghề nghiệp và môi trường nhà xưởng'
    },
    {
      id: 'VM-003',
      title: 'Đoàn Chuyên Gia Kỹ Thuật Tập Đoàn Đối Tác Sumitomo Nhật Bản',
      type: 'PARTNER',
      typeName: 'Đối tác Chiến lược',
      organization: 'Sumitomo Heavy Industries Corp',
      visitorCount: 4,
      leadVisitor: 'Mr. Kenji Sato (Technical Director)',
      hostEmployee: 'Tổng Giám Đốc & Giám Đốc Kỹ Thuật',
      date: '2026-09-02',
      time: '14:00 - 16:30',
      room: 'Phòng VIP Boardroom (Tầng 5)',
      teaAndSnacks: 'Trà đạo Nhật Bản, bánh wagashi, quà lưu niệm cty',
      status: 'PENDING',
      purpose: 'Khảo sát dây chuyền tự động hóa giai đoạn 2 và chuyển giao công nghệ đóng gói'
    },
    {
      id: 'VM-004',
      title: 'Họp Giao Ban Khối Sản Xuất & Điều Hành Tháng 08',
      type: 'INTERNAL_MEETING',
      typeName: 'Họp Nội Bộ',
      organization: 'Nội bộ Công ty',
      visitorCount: 18,
      leadVisitor: 'Ban Tổng Giám Đốc',
      hostEmployee: 'Thư ký Ban Giám Đốc',
      date: '2026-08-27',
      time: '08:00 - 10:00',
      room: 'Phòng Hội Nghị 1 (Tầng 2)',
      teaAndSnacks: 'Nước suối, cà phê hòa tan',
      status: 'CONFIRMED',
      purpose: 'Tổng kết sản lượng, định biên lao động và khắc phục các điểm nóng sản xuất'
    }
  ]);

  // ========================================================
  // 1.B. SỔ KHÁCH RA VÀO CỔNG BẢO VỆ & BÀI KIỂM TRA AN TOÀN (GATE PASS)
  // ========================================================
  const [visitorGateLogs, setVisitorGateLogs] = useState([
    {
      id: 'GT-2026-0828-01',
      visitorCategory: 'GUEST', // 'GUEST' | 'OUTSOURCED_PARTNER'
      categoryLabel: 'Khách Đối Tác',
      fullName: 'Trần Đình Trọng',
      gender: 'Nam',
      company: 'Công ty TNHH Kỹ Thuật Lạnh Tân Á',
      phone: '0918.234.567',
      hostPerson: 'Anh Hoàng (Trưởng Bộ Phận Cơ Điện)',
      checkInTime: '08:15:20 28/08/2026',
      checkOutTime: '11:40:15 28/08/2026',
      status: 'CHECKED_OUT', // IN_PREMISES | CHECKED_OUT
      safetyTestPassed: true,
      safetyTestType: 'QR_MOBILE', // QR_MOBILE | PAPER_FORM | EXEMPT
      note: 'Bảo trì máy nén khí xưởng 2, đã kiểm tra thẻ an toàn điện'
    },
    {
      id: 'GT-2026-0828-02',
      visitorCategory: 'GUEST',
      categoryLabel: 'Khách Thăm Công Ty',
      fullName: 'Nguyễn Thị Thu Hương',
      gender: 'Nữ',
      company: 'Tập Đoàn Bao Bì Nhựa Rạng Đông',
      phone: '0903.888.999',
      hostPerson: 'Chị Mai (Phòng Mua Hàng & Cung Ứng)',
      checkInTime: '09:05:10 28/08/2026',
      checkOutTime: '',
      status: 'IN_PREMISES',
      safetyTestPassed: true,
      safetyTestType: 'QR_MOBILE',
      note: 'Giao mẫu bao bì màng nhôm thực phẩm đợt mới'
    },
    {
      id: 'GT-2026-0828-03',
      visitorCategory: 'OUTSOURCED_PARTNER',
      categoryLabel: 'Đối Tác Dịch Vụ (Nhà thầu)',
      fullName: 'Lê Văn Cường',
      gender: 'Nam',
      company: 'Đội Thi Công Xây Dựng Số 5',
      phone: '0977.123.456',
      hostPerson: 'Kỹ sư Tuấn (Ban Dự Án & Hạ Tầng)',
      checkInTime: '07:45:00 28/08/2026',
      checkOutTime: '',
      status: 'IN_PREMISES',
      safetyTestPassed: true,
      safetyTestType: 'PAPER_FORM',
      note: 'Lắp đặt mái che kho ngoại quan, đã nộp bài thi an toàn giấy'
    },
    {
      id: 'GT-2026-0828-04',
      visitorCategory: 'OUTSOURCED_PARTNER',
      categoryLabel: 'Đối Tác Dịch Vụ (Bảo Vệ)',
      fullName: 'Trần Quốc Bảo',
      gender: 'Nam',
      company: 'Công ty TNHH DV Bảo Vệ Long Hoàng',
      phone: '0918.111.222',
      hostPerson: 'Đội Trưởng Bảo Vệ / Phòng HCNS',
      checkInTime: '06:00:00 28/08/2026',
      checkOutTime: '',
      status: 'IN_PREMISES',
      safetyTestPassed: true,
      safetyTestType: 'EXEMPT',
      note: 'Ca trực cổng chính nhà máy, nhân sự bảo vệ dịch vụ ngoài'
    },
    {
      id: 'GT-2026-0828-05',
      visitorCategory: 'OUTSOURCED_PARTNER',
      categoryLabel: 'Đối Tác Dịch Vụ (Tạp Vụ)',
      fullName: 'Lê Thị Cúc',
      gender: 'Nữ',
      company: 'Công ty DV Vệ Sinh Hoàn Mỹ',
      phone: '0908.555.666',
      hostPerson: 'Tổ Trưởng Tạp Vụ / Phòng HCNS',
      checkInTime: '06:30:00 28/08/2026',
      checkOutTime: '',
      status: 'IN_PREMISES',
      safetyTestPassed: true,
      safetyTestType: 'EXEMPT',
      note: 'Vệ sinh ca ngày phân xưởng sản xuất, nhân sự tạp vụ ngoài'
    },
  ]);

  // Modal Khách vào cổng mới
  const [showGateCheckInModal, setShowGateCheckInModal] = useState(false);
  const [newGateVisitor, setNewGateVisitor] = useState({
    visitorCategory: 'GUEST' as 'GUEST' | 'OUTSOURCED_PARTNER',
    partnerRoleDetail: 'Bảo Vệ', // 'Bảo Vệ' | 'Tạp Vụ' | 'Nhà Thầu Kỹ Thuật'
    fullName: '',
    gender: 'Nam',
    company: '',
    phone: '',
    hostPerson: '',
    note: '',
    requiresSafetyTest: true,
    safetyTestType: 'QR_MOBILE' as 'QR_MOBILE' | 'PAPER_FORM'
  });

  // Modal QR Code kiểm tra an toàn cho khách
  const [showSafetyQrModal, setShowSafetyQrModal] = useState<string | null>(null);

  // Modal In biểu mẫu giấy kiểm tra an toàn
  const [showSafetyPaperModal, setShowSafetyPaperModal] = useState<any | null>(null);

  // Xử lý Check-in tự động (Tích chọn vào cổng)
  const handleAutoCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const nowStr = new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN');
    const catLabel = newGateVisitor.visitorCategory === 'OUTSOURCED_PARTNER'
      ? `Đối Tác Dịch Vụ (${newGateVisitor.partnerRoleDetail})`
      : 'Khách Đến Thăm / Làm Việc';

    const newLog = {
      id: `GT-${Date.now().toString().slice(-6)}`,
      visitorCategory: newGateVisitor.visitorCategory,
      categoryLabel: catLabel,
      fullName: newGateVisitor.fullName,
      gender: newGateVisitor.gender,
      company: newGateVisitor.company,
      phone: newGateVisitor.phone,
      hostPerson: newGateVisitor.hostPerson,
      checkInTime: nowStr,
      checkOutTime: '',
      status: 'IN_PREMISES' as const,
      safetyTestPassed: !newGateVisitor.requiresSafetyTest,
      safetyTestType: newGateVisitor.requiresSafetyTest ? newGateVisitor.safetyTestType : 'EXEMPT' as any,
      note: newGateVisitor.note
    };
    setVisitorGateLogs([newLog, ...visitorGateLogs]);
    setShowGateCheckInModal(false);
    setNewGateVisitor({
      visitorCategory: 'GUEST',
      partnerRoleDetail: 'Bảo Vệ',
      fullName: '',
      gender: 'Nam',
      company: '',
      phone: '',
      hostPerson: '',
      note: '',
      requiresSafetyTest: true,
      safetyTestType: 'QR_MOBILE'
    });
    alert(`✓ Đã ghi nhận khách vào cổng thành công lúc ${nowStr}!`);
  };

  // Xử lý Check-out tự động (Tích chọn ra cổng)
  const handleAutoCheckOut = (logId: string) => {
    const nowStr = new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN');
    setVisitorGateLogs(prev => prev.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          checkOutTime: nowStr,
          status: 'CHECKED_OUT'
        };
      }
      return log;
    }));
    alert(`✓ Đã xác nhận khách rời cổng lúc ${nowStr}!`);
  };

  // Xác nhận bài thi an toàn đạt
  const handlePassSafetyTest = (logId: string) => {
    setVisitorGateLogs(prev => prev.map(log => log.id === logId ? { ...log, safetyTestPassed: true } : log));
    alert('✓ Đã xác nhận Khách đạt bài kiểm tra An toàn Lao động (Safety Pass)!');
  };

  // ========================================================
  // 1.C. HỆ THỐNG ĐÁNH GIÁ SUẤT ĂN CA HẰNG NGÀY (CANTEEN MONITORING)
  // ========================================================
  const [mealFeedbacks, setMealFeedbacks] = useState([
    {
      id: 'FB-MEAL-01',
      date: '2026-08-28',
      shift: 'Ăn Ca Trưa (11:30)',
      employeeCode: 'AV-0128',
      employeeName: 'Phạm Minh Trí',
      department: 'Phân Xưởng Chế Biến',
      rating: 4,
      positiveFeedback: 'Cơm dẻo nóng, sườn xào chua ngọt vừa miệng, rau xào giòn tươi xanh.',
      negativeFeedback: 'Canh mồng tơi hơi mặn một chút so với khẩu vị chung.',
      hasPhotoEvidence: true,
      photoNote: 'Ảnh chụp khay cơm 4 ngăn ngay ngắn, đủ tiêu chuẩn định lượng 25k.',
      resolvedStatus: 'RESOLVED',
      kitchenResponse: 'Đã nhắc nhở bếp phụ gia giảm lượng muối trong canh rau theo chuẩn.'
    },
    {
      id: 'FB-MEAL-02',
      date: '2026-08-28',
      shift: 'Ăn Ca Trưa (12:00)',
      employeeCode: 'AV-0482',
      employeeName: 'Trần Văn Nam',
      department: 'Phân Xưởng Cơ Điện',
      rating: 3,
      positiveFeedback: 'Thịt kho trứng chín mềm, sạch sẽ, bảo quản nóng trong tủ giữ nhiệt.',
      negativeFeedback: 'Tráng miệng dưa hấu thái hơi mỏng, phục vụ phát khay cơm lúc 12h10 bị chậm 5 phút do xếp hàng đông.',
      hasPhotoEvidence: true,
      photoNote: 'Ảnh chụp khay cơm ngay ngắn, góc chụp rõ ràng 4 góc khay thức ăn.',
      resolvedStatus: 'IN_REVIEW',
      kitchenResponse: 'Bếp trưởng ghi nhận sẽ bố trí thêm 1 line tiếp nhận khay cơm ca cao điểm.'
    }
  ]);

  const [showMealFeedbackModal, setShowMealFeedbackModal] = useState(false);
  const [showMealPassDirectModal, setShowMealPassDirectModal] = useState(false);
  const [newMealFeedback, setNewMealFeedback] = useState({
    shift: 'Ăn Ca Trưa (11:30 - 12:30)',
    rating: 4,
    positiveFeedback: '',
    negativeFeedback: '',
    photoConfirmed: true
  });

  const handleCreateMealFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealFeedback.positiveFeedback.trim()) {
      alert('Vui lòng ghi rõ nội dung phù hợp (món ăn ngon, vệ sinh, điểm hài lòng).');
      return;
    }
    const newFb = {
      id: `FB-MEAL-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      shift: newMealFeedback.shift,
      employeeCode: 'NV-ME',
      employeeName: 'Tôi (Nhân sự đánh giá)',
      department: 'Khối Sản Xuất',
      rating: newMealFeedback.rating,
      positiveFeedback: newMealFeedback.positiveFeedback,
      negativeFeedback: newMealFeedback.negativeFeedback || 'Không có điểm trừ, suất ăn hoàn chỉnh.',
      hasPhotoEvidence: true,
      photoNote: 'Đã chụp ảnh thực tế ngay ngắn tại bàn ăn lưu trên thiết bị.',
      resolvedStatus: 'IN_REVIEW',
      kitchenResponse: 'Đang chuyển ý kiến đến Bếp Trưởng và Đơn vị Suất Ăn Hàng Không xử lý.'
    };
    setMealFeedbacks([newFb, ...mealFeedbacks]);
    setShowMealFeedbackModal(false);
    setNewMealFeedback({
      shift: 'Ăn Ca Trưa (11:30 - 12:30)',
      rating: 4,
      positiveFeedback: '',
      negativeFeedback: '',
      photoConfirmed: true
    });
    alert('✓ Đã gửi đánh giá suất ăn thành công! Ý kiến của bạn đã được chuyển tới Quản lý Nhà Ăn và Ban Giám Sát Suất Ăn.');
  };

  // ========================================================
  // 10. TRUNG TÂM QUẢN LÝ SUẤT ĂN CA & NHÀ BẾP DOANH NGHIỆP
  // ========================================================
  const [canteenShiftFilter, setCanteenShiftFilter] = useState<'ALL' | 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'NIGHT'>('LUNCH');
  const [canteenActiveView, setCanteenActiveView] = useState<'FORECAST_AI' | 'GUEST_PARTNER_APPROVAL' | 'BILLING_RECONCILIATION' | 'FOOD_SAFETY_AUDIT'>('FORECAST_AI');

  // Đơn vị cung cấp suất ăn & đơn giá hợp đồng
  const [canteenUnitPrice] = useState({
    regular: 25000,
    vegetarian: 25000,
    porridge: 20000,
    guestVip: 50000,
    partner: 25000,
    penaltyPerViolation: 2000000 // Phạt chất lượng 2 triệu/lỗi phát hiện
  });

  // Dữ liệu yêu cầu suất ăn khách mời chờ duyệt
  const [adminGuestMealRequests, setAdminGuestMealRequests] = useState([
    {
      id: 'GUEST-REQ-101',
      hostEmpId: 'AV-0342',
      hostEmpName: 'Nguyễn Văn Tuấn',
      hostDept: 'Phân Xưởng Chế Biến',
      guestCompany: 'Công ty TNHH Thiết Bị Lạnh Tân Á (Đoàn Kỹ Sư)',
      guestCount: 3,
      contactPerson: 'Kỹ sư Đặng Văn Dũng',
      dietType: 'NONE' as 'NONE' | 'VEGETARIAN' | 'PORRIDGE',
      dietLabel: '🍚 Cơm Mặn Tiêu Chuẩn',
      shift: 'LUNCH',
      shiftName: 'Cơm Ca Trưa',
      requestTime: '10:45 09/09/2026',
      isUrgentUnder1Hour: true,
      canteenConfirmed: true,
      hrApproved: true,
      budgetApprovalCode: 'BGT-VP-2026-89',
      status: 'APPROVED' as 'PENDING_CANTEEN' | 'PENDING_HR' | 'APPROVED' | 'CLAIMED' | 'REJECTED'
    },
    {
      id: 'GUEST-REQ-102',
      hostEmpId: 'AV-0522',
      hostEmpName: 'Phạm Hồng Nhung',
      hostDept: 'Khối Văn Phòng',
      guestCompany: 'Đoàn Kiểm Toán Tài Chính PwC Việt Nam',
      guestCount: 4,
      contactPerson: 'Trưởng đoàn Trần Minh Hoàng',
      dietType: 'VEGETARIAN' as 'NONE' | 'VEGETARIAN' | 'PORRIDGE',
      dietLabel: '🥗 Cơm Chay Dinh Dưỡng',
      shift: 'LUNCH',
      shiftName: 'Cơm Ca Trưa',
      requestTime: '11:05 09/09/2026',
      isUrgentUnder1Hour: true,
      canteenConfirmed: true,
      hrApproved: false,
      budgetApprovalCode: 'BGT-TC-2026-12',
      status: 'PENDING_HR' as 'PENDING_CANTEEN' | 'PENDING_HR' | 'APPROVED' | 'CLAIMED' | 'REJECTED'
    }
  ]);

  // Nhật ký lưu mẫu thực phẩm 24h theo QCVN của Bộ Y Tế
  const [foodSampleLogs, setFoodSampleLogs] = useState([
    {
      id: 'SMP-20260909-01',
      date: '2026-09-09',
      shiftName: 'Cơm Ca Trưa (11:30)',
      menuItems: 'Cơm tấm Sài Gòn, Sườn cốt lết nướng mật ong, Chả trứng hấp, Canh khổ qua nhồi thịt, Dưa leo cà chua',
      sampledAt: '10:45 09/09/2026',
      sampledBy: 'Cán bộ Y tế Nguyễn Thu Thảo & Bếp trưởng Tuấn Anh',
      tempStorage: '3.5°C (Ngăn mát tủ bảo quản mẫu chuyên dụng)',
      sealStatus: 'SEALED',
      sealCode: 'NIEM-PHONG-0909-A1',
      disposeTime: '10:45 10/09/2026 (Đủ 24h)',
      result: 'PASSED'
    },
    {
      id: 'SMP-20260908-02',
      date: '2026-08-28',
      shiftName: 'Cơm Ca Chiều (17:30)',
      menuItems: 'Cơm trắng, Gà kho gừng, Trứng chiên thịt bằm, Canh chua cá lóc bắp chuối, Rau muống xào tỏi',
      sampledAt: '16:45 28/08/2026',
      sampledBy: 'Cán bộ Y tế Nguyễn Thu Thảo & Bếp phó Hoàng',
      tempStorage: '4.0°C',
      sealStatus: 'COMPLETED_DISPOSED',
      sealCode: 'NIEM-PHONG-2808-B2',
      disposeTime: '16:45 29/08/2026',
      result: 'PASSED'
    }
  ]);

  // Modal kiểm tra ATTP & Lưu mẫu mới
  const [showFoodSampleModal, setShowFoodSampleModal] = useState(false);
  const [newFoodSample, setNewFoodSample] = useState({
    shiftName: 'Cơm Ca Trưa (11:30)',
    menuItems: '',
    sampledBy: 'Y tá Nguyễn Thu Thảo & Bếp trưởng Tuấn Anh',
    tempStorage: '3.5°C'
  });

  // Hành vi phê duyệt suất ăn khách của Admin/HR
  const handleAdminApproveGuestMeal = (reqId: string) => {
    setAdminGuestMealRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          canteenConfirmed: true,
          hrApproved: true,
          status: 'APPROVED'
        };
      }
      return r;
    }));
    alert('✓ ĐÃ PHÊ DUYỆT SUẤT ĂN TIẾP KHÁCH THÀNH CÔNG!\nNhà bếp và nhân sự bảo lãnh đã được thông báo để xuất suất ăn.');
  };

  const handleAdminRejectGuestMeal = (reqId: string) => {
    const reason = prompt('Lý do từ chối phê duyệt suất ăn:', 'Vượt hạn mức chi phí tiếp khách tháng');
    if (!reason) return;
    setAdminGuestMealRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: 'REJECTED'
        };
      }
      return r;
    }));
    alert(`Đã từ chối cấp suất ăn: ${reason}`);
  };

  // Xuất file Quyết Toán Nghiệm Thu Chi Phí Suất Ăn Ca Tháng ra Excel
  const handleExportCanteenReconciliationExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Bảng tổng hợp quyết toán
    const summaryData = [
      { 'Chỉ Số Quyết Toán': 'Tổng Lượt Chấm Công Hợp Lệ (Đi làm)', 'Số Lượng': 642, 'Đơn Giá (VNĐ)': 25000, 'Thành Tiền (VNĐ)': 642 * 25000 },
      { 'Chỉ Số Quyết Toán': 'Suất Cơm Mặn Thường', 'Số Lượng': 580, 'Đơn Giá (VNĐ)': 25000, 'Thành Tiền (VNĐ)': 580 * 25000 },
      { 'Chỉ Số Quyết Toán': 'Suất Cơm Chay Dinh Dưỡng', 'Số Lượng': 42, 'Đơn Giá (VNĐ)': 25000, 'Thành Tiền (VNĐ)': 42 * 25000 },
      { 'Chỉ Số Quyết Toán': 'Suất Cháo Dinh Dưỡng', 'Số Lượng': 20, 'Đơn Giá (VNĐ)': 20000, 'Thành Tiền (VNĐ)': 20 * 20000 },
      { 'Chỉ Số Quyết Toán': 'Suất Tiếp Khách (HR Phê Duyệt)', 'Số Lượng': 7, 'Đơn Giá (VNĐ)': 50000, 'Thành Tiền (VNĐ)': 7 * 50000 },
      { 'Chỉ Số Quyết Toán': 'Suất Lao Động Dịch Vụ (Bảo Vệ & Tạp Vụ)', 'Số Lượng': 14, 'Đơn Giá (VNĐ)': 25000, 'Thành Tiền (VNĐ)': 14 * 25000 },
      { 'Chỉ Số Quyết Toán': 'Khấu Trừ Phạt Vi Phạm Chất Lượng (Feedback ảnh)', 'Số Lượng': 1, 'Đơn Giá (VNĐ)': -2000000, 'Thành Tiền (VNĐ)': -2000000 },
      { 'Chỉ Số Quyết Toán': 'TỔNG CỘNG TIỀN PHẢI THANH TOÁN CHO NHÀ BẾP', 'Số Lượng': 663, 'Đơn Giá (VNĐ)': '', 'Thành Tiền (VNĐ)': (580 * 25000) + (42 * 25000) + (20 * 20000) + (7 * 50000) + (14 * 25000) - 2000000 }
    ];
    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Bang_Quyet_Toan_Tien_Com');

    // Sheet 2: Danh sách khách tiếp đãi
    const ws2 = XLSX.utils.json_to_sheet(adminGuestMealRequests.map(g => ({
      'Mã Yêu Cầu': g.id,
      'Người Tiếp Đón': `${g.hostEmpName} (${g.hostEmpId})`,
      'Bộ Phận': g.hostDept,
      'Đoàn Khách': g.guestCompany,
      'Đại Diện Khách': g.contactPerson,
      'Số Lượng Suất': g.guestCount,
      'Khẩu Phần': g.dietLabel,
      'Ca Ăn': g.shiftName,
      'Trạng Thái Phê Duyệt': g.status,
      'Mã Ngân Sách': g.budgetApprovalCode
    })));
    XLSX.utils.book_append_sheet(wb, ws2, 'Suat_An_Khach_Tiep_Dai');

    // Sheet 3: Sổ lưu mẫu thức ăn 24h
    const ws3 = XLSX.utils.json_to_sheet(foodSampleLogs.map(s => ({
      'Mã Mẫu': s.id,
      'Ngày Lưu': s.date,
      'Ca Ăn': s.shiftName,
      'Thực Đơn Lưu Mẫu': s.menuItems,
      'Thời Điểm Lấy Mẫu': s.sampledAt,
      'Người Lấy Mẫu': s.sampledBy,
      'Nhiệt Độ Tủ Lưu': s.tempStorage,
      'Mã Niêm Phong': s.sealCode,
      'Thời Điểm Hủy': s.disposeTime,
      'Kết Quả Kiểm Tra': s.result
    })));
    XLSX.utils.book_append_sheet(wb, ws3, 'Luu_Mau_Thuc_Pham_24H');

    XLSX.writeFile(wb, `Bien_Ban_Doi_Soat_Com_Ca_${policy.companyName.replace(/\s+/g, '_')}_09_2026.xlsx`);
  };

  // Modal tạo lịch tiếp khách / phòng họp mới
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [newMeetingForm, setNewMeetingForm] = useState({
    title: '',
    typeName: 'Cơ quan Ban ngành',
    organization: '',
    visitorCount: 2,
    leadVisitor: '',
    hostEmployee: '',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00 - 11:00',
    room: 'Phòng Hội Nghị 1 (Tầng 2)',
    teaAndSnacks: 'Nước suối, trà, cà phê',
    purpose: ''
  });

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingForm.title || !newMeetingForm.organization) {
      alert('Vui lòng nhập tên chương trình và đơn vị đến làm việc!');
      return;
    }
    const newId = `VM-00${visitorMeetings.length + 1}`;
    setVisitorMeetings([
      {
        id: newId,
        type: 'PARTNER',
        status: 'CONFIRMED',
        ...newMeetingForm
      },
      ...visitorMeetings
    ]);
    setShowMeetingModal(false);
    alert('Đã đăng ký lịch tiếp khách / phòng họp thành công!');
  };

  // ========================================================
  // 2. TIẾP NHẬN & XỬ LÝ YÊU CẦU HÀNH CHÍNH (VPP, VÉ, KHÁM SK...)
  // ========================================================
  const [adminRequests, setAdminRequests] = useState([
    {
      id: 'REQ-HC-101',
      category: 'STATIONERY',
      categoryName: 'Mua Văn Phòng Phẩm (VPP)',
      requesterName: 'Trần Thị Thu Trang',
      department: 'Phân Xưởng Đóng Gói',
      content: 'Đăng ký cấp 20 ram giấy in A4, 5 hộp bút bi, 10 kẹp file hồ sơ kỹ thuật',
      estimatedCost: 1850000,
      createdAt: '2026-08-25',
      deadline: '2026-08-28',
      status: 'APPROVED',
      approvedBy: 'Trưởng Phòng HCNS Duyệt'
    },
    {
      id: 'REQ-HC-102',
      category: 'FLIGHT_HOTEL',
      categoryName: 'Đặt Vé Máy Bay & Khách Sạn Công Tác',
      requesterName: 'Lê Hoàng Nam (Trưởng Ban QA/QC)',
      department: 'Phòng Đảm Bảo Chất Lượng',
      content: 'Công tác chi nhánh Long An 3 ngày 2 đêm: Vé máy bay khứ hồi HN-SGN + Khách sạn Tân Bình',
      estimatedCost: 6500000,
      createdAt: '2026-08-24',
      deadline: '2026-08-30',
      status: 'IN_PROGRESS',
      approvedBy: 'Trưởng Phòng HCNS Duyệt'
    },
    {
      id: 'REQ-HC-103',
      category: 'HEALTH_CHECK',
      categoryName: 'Khám Sức Khỏe Định Kỳ Doanh Nghiệp',
      requesterName: 'Ban An Toàn & Sức Khỏe HSE',
      department: 'Toàn Doanh Nghiệp',
      content: 'Khám sức khỏe định kỳ đợt 2 cho 450 công nhân sản xuất trực tiếp và kiểm tra bệnh nghề nghiệp',
      estimatedCost: 157500000,
      createdAt: '2026-08-20',
      deadline: '2026-09-15',
      status: 'APPROVED',
      approvedBy: 'Tổng Giám Đốc Phê Duyệt'
    },
    {
      id: 'REQ-HC-104',
      category: 'HSE_TRAINING',
      categoryName: 'Huấn Luyện An Toàn Vệ Sinh Lao Động (NĐ 44)',
      requesterName: 'Phạm Hồng Thái (Chuyên viên HSE)',
      department: 'Phòng Kỹ Thuật & HSE',
      content: 'Mời Trung tâm Kiểm định HL ATLĐ Nhóm 1, 2, 3 và cấp thẻ an toàn lao động mới cho 120 công nhân',
      estimatedCost: 36000000,
      createdAt: '2026-08-22',
      deadline: '2026-09-10',
      status: 'PENDING',
      approvedBy: 'Chờ Ban Giám Đốc Phê Duyệt'
    },
    {
      id: 'REQ-HC-105',
      category: 'TRAVEL',
      categoryName: 'Du Lịch / Teambuilding Thường Niên',
      requesterName: 'Ban Chấp Hành Công Đoàn',
      department: 'Toàn Công Ty',
      content: 'Kế hoạch Teambuilding 3 ngày 2 đêm tại Nha Trang cho CBNV xuất sắc Quý 3/2026',
      estimatedCost: 120000000,
      createdAt: '2026-08-18',
      deadline: '2026-09-20',
      status: 'PENDING',
      approvedBy: 'Chờ Tổng Giám Đốc Duyệt'
    }
  ]);

  // Modal đăng ký yêu cầu hành chính mới (Giao diện cho nhân viên thao tác)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState({
    categoryName: 'Mua Văn Phòng Phẩm (VPP)',
    requesterName: employees[0]?.fullName || 'Nhân viên thực tế',
    department: employees[0]?.departmentName || 'Phòng Ban Hành Chính',
    content: '',
    estimatedCost: 500000,
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestForm.content) {
      alert('Vui lòng nhập nội dung chi tiết yêu cầu!');
      return;
    }
    const newReqId = `REQ-HC-${100 + adminRequests.length + 1}`;
    setAdminRequests([
      {
        id: newReqId,
        category: 'STATIONERY',
        status: 'PENDING',
        createdAt: new Date().toISOString().slice(0, 10),
        approvedBy: 'Chờ Phê Duyệt',
        ...newRequestForm
      },
      ...adminRequests
    ]);
    setShowRequestModal(false);
    alert('Đã gửi yêu cầu hành chính thành công! Bộ phận HCNS sẽ xử lý ngay.');
  };

  const handleApproveRequest = (id: string) => {
    setAdminRequests(adminRequests.map(r => r.id === id ? { ...r, status: 'APPROVED', approvedBy: 'Đã Được Phê Duyệt' } : r));
    alert('Đã phê duyệt yêu cầu thành công!');
  };

  // ========================================================
  // 3. VĂN THƯ LƯU TRỮ SỐ (CÔNG VĂN ĐẾN, ĐI, NỘI BỘ)
  // ========================================================
  const [archiveDocuments, setArchiveDocuments] = useState([
    {
      id: 'DOC-IN-045',
      docType: 'DOC_IN',
      docTypeName: 'Công Văn Đến',
      docNumber: '1428/SLĐTBXH-TTr',
      signer: 'Giám Đốc Sở LĐ-TB&XH',
      issueDate: '2026-08-15',
      receivedDate: '2026-08-17',
      summary: 'Kế hoạch kiểm tra việc thực hiện tiền lương tối thiểu vùng, đối thoại định kỳ và thỏa ước lao động tập thể năm 2026',
      handler: 'Phòng HCNS & Pháp chế',
      urgency: 'URGENT',
      fileLink: 'CV_1428_SLDTBXH_Ke_hoach_thanh_tra.pdf'
    },
    {
      id: 'DOC-OUT-088',
      docType: 'DOC_OUT',
      docTypeName: 'Công Văn Đi',
      docNumber: '88/CV-AVM-2026',
      signer: 'Tổng Giám Đốc',
      issueDate: '2026-08-20',
      receivedDate: '2026-08-20',
      summary: 'Báo cáo giải trình tình hình biến động lao động 6 tháng đầu năm và kế hoạch đào tạo lại nhân sự gửi Ban Quản Lý KCN',
      handler: 'Trưởng Phòng HCNS',
      urgency: 'NORMAL',
      fileLink: 'CV_88_AVM_Bao_cao_Ban_Quan_ly_KCN.pdf'
    },
    {
      id: 'DOC-INT-024',
      docType: 'INTERNAL',
      docTypeName: 'Văn Bản Nội Bộ',
      docNumber: '24/TB-AVM-2026',
      signer: 'Tổng Giám Đốc',
      issueDate: '2026-08-22',
      receivedDate: '2026-08-22',
      summary: 'Thông báo lịch nghỉ Lễ Quốc Khánh 02/09/2026 và quy chế làm việc, tiền lương làm thêm giờ ca trực ngày lễ (hưởng 400%)',
      handler: 'Toàn thể Cán bộ nhân viên',
      urgency: 'NORMAL',
      fileLink: 'TB_24_Nghi_le_Quoc_khanh_02_09.pdf'
    }
  ]);

  // Modal thêm công văn
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    docType: 'DOC_IN',
    docTypeName: 'Công Văn Đến',
    docNumber: '',
    signer: '',
    issueDate: new Date().toISOString().slice(0, 10),
    summary: '',
    handler: 'Phòng HCNS',
    urgency: 'NORMAL',
    fileLink: 'van_ban_scan_dinh_kem.pdf'
  });

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.docNumber || !newDocForm.summary) {
      alert('Vui lòng nhập số hiệu và trích yếu nội dung văn bản!');
      return;
    }
    setArchiveDocuments([
      {
        id: `DOC-${Date.now()}`,
        receivedDate: new Date().toISOString().slice(0, 10),
        ...newDocForm
      },
      ...archiveDocuments
    ]);
    setShowDocModal(false);
    alert('Đã vào sổ lưu trữ văn thư thành công!');
  };

  // ========================================================
  // 4. CHI PHÍ VĂN PHÒNG & CƠ SỞ HẠ TẦNG
  // ========================================================
  const [officeExpenses, setOfficeExpenses] = useState([
    { category: 'Hóa Đơn Tiền Điện Sản Xuất & VP (EVN)', amount: 48500000, month: '08/2026', dueDate: '2026-08-28', status: 'PAID' },
    { category: 'Hóa Đơn Nước Sinh Hoạt Nhà Xưởng (Biwase)', amount: 4200000, month: '08/2026', dueDate: '2026-08-30', status: 'PAID' },
    { category: 'Đường Truyền Internet Cáp Quang & Kênh Thuê Riêng (VNPT)', amount: 6800000, month: '08/2026', dueDate: '2026-09-05', status: 'PENDING' },
    { category: 'Bảo Trì Định Kỳ Hệ Thống Điều Hòa Trung Tâm VRV', amount: 8200000, month: '08/2026', dueDate: '2026-09-02', status: 'PAID' },
    { category: 'Kiểm Định & Nạp Sạc Bình Chữa Cháy PCCC Định Kỳ', amount: 3000000, month: '08/2026', dueDate: '2026-09-10', status: 'PENDING' }
  ]);

  // ========================================================
  // 5. QUẢN LÝ XE CÔNG TÁC & DI CHUYỂN
  // ========================================================
  const [vehiclesAndTravel, setVehiclesAndTravel] = useState([
    {
      type: 'COMPANY_CAR',
      name: 'Xe 7 Chỗ Toyota Fortuner (Biển số: 61A-888.68)',
      driver: 'Tài xế Nguyễn Văn Hải (0912.345.678)',
      schedule: 'Đưa đón Tổng Giám Đốc & Khách VIP',
      fuelQuota: 'Định mức 11L / 100km (Thẻ xăng Petrolimex)',
      status: 'AVAILABLE'
    },
    {
      type: 'COMPANY_BUS',
      name: 'Xe Đưa Đón Công Nhân 29 Chỗ (Biển số: 61B-012.34)',
      driver: 'Tài xế Trần Đình Trọng (0988.765.432)',
      schedule: 'Tuyến KCN Sóng Thần ↔ Thủ Dầu Một (Ca 1 & Ca 2)',
      fuelQuota: 'Định mức 16L / 100km',
      status: 'ON_DUTY'
    },
    {
      type: 'GRAB_CORPORATE',
      name: 'Tài Khoản Doanh Nghiệp Grab for Business',
      driver: 'Phân quyền tự động cho Trưởng phòng & Sales',
      schedule: 'Hạn mức tháng: 25.000.000 đ (Đã dùng: 14.200.000 đ)',
      fuelQuota: 'Thanh toán trực tiếp hóa đơn điện tử cuối tháng',
      status: 'ACTIVE'
    }
  ]);



  // ========================================================
  // 8. DỊCH VỤ ĐỐI TÁC THUÊ NGOÀI (CHUYÊN BIỆT HÓA 6 PHÂN HỆ DỊCH VỤ)
  // ========================================================
  type PartnerServiceCategory = 
    | 'SECURITY'      // 1. An Ninh & Bảo Vệ Chuyên Nghiệp
    | 'CLEANING'      // 2. Tạp Vụ, Vệ Sinh & Rác Thải Công Nghiệp
    | 'CANTEEN'       // 3. Suất Ăn Ca & Nhà Bếp Doanh Nghiệp (Gom & đồng bộ Tab 10)
    | 'LANDSCAPE'     // 4. Cảnh Quan, Cây Xanh & Khử Trùng (Pest Control)
    | 'MEP_FACILITY'  // 5. Bảo Trì Cơ Điện, Thang Máy & Tòa Nhà (MEP & PCCC)
    | 'OFFICE_EQUIP'; // 6. Thuê Máy In / Photocopy & Thiết Bị CNTT

  const [activePartnerServiceTab, setActivePartnerServiceTab] = useState<PartnerServiceCategory>('SECURITY');

  const [partnerVendors, setPartnerVendors] = useState([
    {
      id: 'VEN-01',
      serviceType: 'SECURITY',
      serviceCategory: 'SECURITY' as PartnerServiceCategory,
      serviceName: 'Dịch Vụ Bảo Vệ An Ninh Chuyên Nghiệp (24/7)',
      provider: 'Công ty TNHH DV Bảo Vệ Long Hải',
      contactPerson: 'Đội trưởng Bùi Văn Bình (0903.111.222)',
      headcount: 8,
      costMonth: 48000000,
      slaScore: '98/100 (Xuất sắc)',
      scope: 'Tuần tra 24/24, kiểm soát cổng ra vào, bảo vệ kho thành phẩm, PCCC, ngăn chặn thất thoát tài sản',
      status: 'ACTIVE',
      contractNo: 'HD-SEC-2026-01',
      renewalDate: '31/12/2026',
      guardPosts: [
        { postName: 'Cổng Chính (Gate 1)', dutyTime: '24/24 (3 ca/ngày)', headCount: 3, leader: 'Bùi Văn Bình' },
        { postName: 'Cổng Xe Tải & Xuất Nhập (Gate 2)', dutyTime: '06:00 - 22:00', headCount: 2, leader: 'Nguyễn Văn Đạt' },
        { postName: 'Tuần Tra Kho Bãi & Xưởng', dutyTime: 'Ca Đêm (18:00 - 06:00)', headCount: 2, leader: 'Trần Quốc Bảo' },
        { postName: 'Chỉ Huy Trưởng Ca', dutyTime: 'Hành chính & Trực đêm', headCount: 1, leader: 'Vũ Đình Toàn' }
      ],
      incidentsLogged: 0,
      slaDetails: { patrolPunctuality: '99.5%', uniformCompliance: '100%', fireSafetyDrills: 'Đã tập huấn' }
    },
    {
      id: 'VEN-02',
      serviceType: 'CLEANING',
      serviceCategory: 'CLEANING' as PartnerServiceCategory,
      serviceName: 'Dịch Vụ Tạp Vụ, Vệ Sinh Công Nghiệp & Xử Lý Chất Thải',
      provider: 'Công ty Dịch Vụ Vệ Sinh Pan Pacific',
      contactPerson: 'Giám sát Lê Thị Mai (0908.333.444)',
      headcount: 8,
      costMonth: 44500000,
      slaScore: '96/100 (Đạt Chuẩn 5S)',
      scope: 'Vệ sinh sàn xưởng 2 ca/ngày, khu vệ sinh công cộng, thu gom rác thải sinh hoạt & chất thải nguy hại',
      status: 'ACTIVE',
      contractNo: 'HD-CLN-2026-03',
      renewalDate: '15/11/2026',
      cleaningZones: [
        { zone: 'Khu Nhà Xưởng Sản Xuất 1 & 2', freq: '2 lần/ngày (Trưa & Tan ca)', staff: 4 },
        { zone: 'Khu Văn Phòng Khối Điều Hành', freq: 'Đầu giờ sáng & Chiều', staff: 2 },
        { zone: 'Nhà Vệ Sinh & Khu Tiện Ích', freq: 'Mỗi 2 giờ/lần (Checklist dán cửa)', staff: 2 }
      ],
      wasteContracts: {
        hazardousWastePartner: 'Công ty CP Môi Trường Đô Thị Bình Dương',
        wastePermitNo: 'CTNH-BD-2026-99',
        nextDisposalDate: '15/09/2026'
      },
      slaDetails: { audit5SScore: '96.2%', chemicalSafety: '100% Có MSDS', odorControl: 'Tốt' }
    },
    {
      id: 'VEN-03',
      serviceType: 'CANTEEN',
      serviceCategory: 'CANTEEN' as PartnerServiceCategory,
      serviceName: 'Nhà Ăn Ca Doanh Nghiệp & Suất Ăn Công Nghiệp (2 Ca/Ngày)',
      provider: 'Công ty CP Suất Ăn Hàng Không Nội Bài chi nhánh Phía Nam',
      contactPerson: 'Bếp trưởng Đỗ Tuấn Anh (0915.555.666)',
      headcount: 12,
      costMonth: 185000000,
      slaScore: '96/100 (Đảm bảo ATVSTP)',
      scope: 'Phục vụ 650 suất/ngày, lưu mẫu thực phẩm 24h, định lượng 25.000 đ/suất, thực đơn đổi món 7 ngày',
      status: 'ACTIVE',
      contractNo: 'HD-CANTEEN-2026-04',
      renewalDate: '30/06/2027',
      kitchenStaff: [
        { role: 'Bếp Trưởng Điều Hành', name: 'Đỗ Tuấn Anh', cert: 'Bằng Trung cấp Chế biến món ăn & ATTP' },
        { role: 'Bếp Phó Nấu Món Chính', name: 'Hoàng Văn Cường', cert: 'Chứng chỉ ATVSTP Bộ Y Tế' },
        { role: 'Nhân Viên Chia Suất & Khay Ăn', name: '6 Nhân sự', cert: 'Khám sức khỏe định kỳ Thẻ xanh' },
        { role: 'Tạp Vụ Rửa Khay Máy Sấy Nhiệt', name: '4 Nhân sự', cert: 'Khám sức khỏe định kỳ Thẻ xanh' }
      ],
      slaDetails: { foodTemperature: '>= 65°C khi phát', nutritionBalance: 'Đủ 4 nhóm chất', samplePreserve: '100% 24h' }
    },
    {
      id: 'VEN-04',
      serviceType: 'LANDSCAPE',
      serviceCategory: 'LANDSCAPE' as PartnerServiceCategory,
      serviceName: 'Dịch Vụ Cảnh Quan, Cây Xanh & Khử Trùng Côn Trùng (Pest Control)',
      provider: 'Công ty TNHH Cảnh Quan Xanh Sài Gòn & Khử Khuẩn Rentokil',
      contactPerson: 'Kỹ sư Lâm Trường Sơn (0919.888.777)',
      headcount: 3,
      costMonth: 16500000,
      slaScore: '97/100 (Xanh - Sạch)',
      scope: 'Chăm sóc 120 chậu cây văn phòng, cắt tỉa 4.000m² thảm cỏ sân xưởng, phun thuốc diệt mối/muỗi định kỳ tháng',
      status: 'ACTIVE',
      contractNo: 'HD-LAND-2026-02',
      renewalDate: '28/02/2027',
      pestSchedule: {
        lastSprayingDate: '25/08/2026',
        nextSprayingDate: '25/09/2026 (Chủ Nhật, ngoài giờ làm việc)',
        chemicalUsed: 'Fendona 10SC (Đức - Được Bộ Y Tế cấp phép an toàn)'
      },
      slaDetails: { plantHealthRatio: '98.5%', pestFreeRecord: 'Không phát hiện côn trùng khu xưởng', grassHeight: '< 5cm' }
    },
    {
      id: 'VEN-05',
      serviceType: 'MEP_FACILITY',
      serviceCategory: 'MEP_FACILITY' as PartnerServiceCategory,
      serviceName: 'Dịch Vụ Bảo Trì Kỹ Thuật Cơ Điện, Thang Máy & Tòa Nhà (MEP & PCCC)',
      provider: 'Công ty CP Kỹ Thuật Cơ Điện Lạnh SEAREFICO & Thang Máy Schindler',
      contactPerson: 'Kỹ sư Trưởng Phạm Hữu Dũng (0909.123.456)',
      headcount: 4,
      costMonth: 38000000,
      slaScore: '99/100 (An Toàn Tuyệt Đối)',
      scope: 'Bảo trì định kỳ Trạm biến áp 1500kVA, máy phát điện Cummins 800kVA, 2 thang máy tải hàng, hệ thống Chiller VRV',
      status: 'ACTIVE',
      contractNo: 'HD-MEP-2026-08',
      renewalDate: '30/09/2027',
      criticalAssets: [
        { asset: 'Trạm Biến Áp 1500kVA', cycle: 'Hàng Quý', nextDate: '15/10/2026', testCompany: 'Trung Tâm Thí Nghiệm Điện 2' },
        { asset: '02 Thang Máy Tải Hàng 2000kg', cycle: 'Hàng Tháng', nextDate: '20/09/2026', testCompany: 'Schindler Vietnam' },
        { asset: 'Máy Phát Điện Dự Phòng 800kVA', cycle: 'Kiểm tra nổ máy thứ 7 hàng tuần', nextDate: '12/09/2026', testCompany: 'Kỹ thuật nội bộ & Searefico' },
        { asset: 'Hệ Thống PCCC Bơm Áp Lực Tự Động', cycle: 'Hàng Tháng', nextDate: '18/09/2026', testCompany: 'Đội PCCC KCN' }
      ],
      slaDetails: { emergencyResponseTime: '< 30 phút có mặt', uptimeRatio: '99.9%', fireSafetyPermit: 'Đạt chuẩn PCCC tỉnh' }
    },
    {
      id: 'VEN-06',
      serviceType: 'OFFICE_EQUIP',
      serviceCategory: 'OFFICE_EQUIP' as PartnerServiceCategory,
      serviceName: 'Dịch Vụ Thuê Máy In / Photocopy Đa Năng & Thiết Bị CNTT',
      provider: 'Công ty TNHH Fuji Xerox (Fujifilm Business Innovation Vietnam)',
      contactPerson: 'Chuyên viên kỹ thuật Vũ Tiến Đạt (0938.666.999)',
      headcount: 2,
      costMonth: 18500000,
      slaScore: '98/100 (Bản In Sắc Nét)',
      scope: 'Cho thuê trọn gói 6 máy Photocopy đa năng tốc độ cao A3/A4, cấp mực in chính hãng, sửa chữa tận nơi trong 2 giờ',
      status: 'ACTIVE',
      contractNo: 'HD-XRX-2026-11',
      renewalDate: '31/12/2026',
      rentedMachines: [
        { model: 'Fuji Xerox ApeosPort 4570 (Tầng 1 - HCNS)', quotaPages: 12000, currentPages: 8450, status: 'Hoạt động tốt' },
        { model: 'Fuji Xerox ApeosPort 4570 (Tầng 2 - Kế Toán)', quotaPages: 15000, currentPages: 11200, status: 'Hoạt động tốt' },
        { model: 'Fuji Xerox DocuCentre 3060 (Xưởng 1)', quotaPages: 8000, currentPages: 5200, status: 'Hoạt động tốt' },
        { model: 'Fuji Xerox DocuCentre 3060 (Kho Vận)', quotaPages: 6000, currentPages: 3900, status: 'Mới thay trống từ' }
      ],
      slaDetails: { tonerRefillTime: '< 2 giờ', printQualitySLA: '1200x1200dpi', paperJamRatio: '< 0.1%' }
    }
  ]);

  // ========================================================
  // 9. CÔNG TÁC AN TOÀN VỆ SINH LAO ĐỘNG (HSE) & TUÂN THỦ (INTERACTIVE)
  // ========================================================
  const [hseInspections, setHseInspections] = useState([
    {
      id: 'HSE-CHK-01',
      title: 'Kiểm Tra An Toàn PCCC & Hệ Thống Báo Cháy Tự Động Định Kỳ',
      inspector: 'Ban An Toàn HSE & Đội PCCC Cơ Sở',
      frequency: 'Hàng tháng',
      lastDate: '2026-08-15',
      nextDate: '2026-09-15',
      result: 'PASSED',
      resultText: 'Đạt chuẩn 100% bình áp lực, chuông còi báo động thông suốt',
      complianceRatio: '100%'
    },
    {
      id: 'HSE-CHK-02',
      title: 'Đo Kiểm Môi Trường Lao Động (Bụi, Tiếng Ồn, Ánh Sáng, Vi Khí Hậu)',
      inspector: 'Trung Tâm Kiểm Soát Bệnh Tật (CDC) Tỉnh',
      frequency: '1 lần / năm',
      lastDate: '2026-03-20',
      nextDate: '2027-03-20',
      result: 'PASSED',
      resultText: '28 vị trí đo đạt QCVN, phân xưởng dập tiếng ồn 82dBA (trong ngưỡng)',
      complianceRatio: '98.5%'
    },
    {
      id: 'HSE-CHK-03',
      title: 'Kiểm Tra Việc Sử Dụng Phương Tiện Bảo Vệ Cá Nhân (PPE) Tại Xưởng',
      inspector: 'Cán bộ HSE & Quản đốc phân xưởng',
      frequency: 'Hàng tuần',
      lastDate: '2026-08-25',
      nextDate: '2026-09-01',
      result: 'WARNING',
      resultText: 'Phát hiện 2 công nhân tổ cơ điện không đội nón bảo hộ khi leo thang',
      complianceRatio: '92.0%'
    }
  ]);

  // Ghi nhận vi phạm An toàn lao động (Interactive - Có thể ghi nhận, xử lý vi phạm)
  const [hseViolations, setHseViolations] = useState([
    {
      id: 'VIP-01',
      empName: 'Hoàng Văn Phúc (AF-045)',
      dept: 'Tổ Cơ Điện Bảo Trì',
      date: '2026-08-24',
      violation: 'Không đeo dây an toàn toàn thân khi làm việc trên cao (> 2.5m)',
      severity: 'HIGH',
      penalty: 'Cảnh cáo bằng văn bản + Trừ 20% điểm KPI an toàn tháng 8',
      status: 'RESOLVED',
      note: 'Đã học lại quy trình làm việc trên cao và ký cam kết tái phạm'
    },
    {
      id: 'VIP-02',
      empName: 'Nguyễn Văn Đạt (AF-078)',
      dept: 'Kho Thành Phẩm',
      date: '2026-08-25',
      violation: 'Hút thuốc lá sai nơi quy định (gần kho pallet gỗ)',
      severity: 'CRITICAL',
      penalty: 'Đình chỉ công tác 3 ngày + Phạt trừ chuyên cần theo NQLĐ',
      status: 'RESOLVED',
      note: 'Vi phạm nghiêm trọng nội quy PCCC'
    }
  ]);

  // Modal ghi nhận vi phạm HSE mới
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [newViolationForm, setNewViolationForm] = useState({
    empName: '',
    dept: 'Xưởng Sản Xuất 1',
    date: new Date().toISOString().slice(0, 10),
    violation: '',
    severity: 'MEDIUM',
    penalty: 'Nhắc nhở & đào tạo lại'
  });

  const handleCreateViolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViolationForm.empName || !newViolationForm.violation) {
      alert('Vui lòng nhập tên nhân viên và hành vi vi phạm!');
      return;
    }
    const newId = `VIP-0${hseViolations.length + 1}`;
    setHseViolations([
      {
        id: newId,
        status: 'RESOLVED',
        note: 'Đã lập biên bản vi phạm tại hiện trường',
        ...newViolationForm
      },
      ...hseViolations
    ]);
    setShowViolationModal(false);
    alert('Đã ghi nhận biên bản vi phạm ATVSLĐ thành công!');
  };

  // Xuất file Excel Hành chính tổng hợp
  const handleExportAdminSummaryExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Lịch tiếp khách
    const ws1 = XLSX.utils.json_to_sheet(visitorMeetings.map(v => ({
      'Mã Lịch': v.id,
      'Chương Trình Làm Việc': v.title,
      'Phân Loại': v.typeName,
      'Đơn Vị Đến': v.organization,
      'Số Người': v.visitorCount,
      'Trưởng Đoàn': v.leadVisitor,
      'Người Tiếp Đón': v.hostEmployee,
      'Ngày Tiếp': v.date,
      'Thời Gian': v.time,
      'Địa Điểm / Phòng': v.room,
      'Chuẩn Bị Hậu Cần': v.teaAndSnacks,
      'Mục Đích Chi Tiết': v.purpose
    })));
    XLSX.utils.book_append_sheet(wb, ws1, 'Lich_Tiep_Khach');

    // Sheet 2: Yêu cầu hành chính
    const ws2 = XLSX.utils.json_to_sheet(adminRequests.map(r => ({
      'Mã Đơn': r.id,
      'Danh Mục': r.categoryName,
      'Người Đề Xuất': r.requesterName,
      'Phòng Ban': r.department,
      'Nội Dung Chi Tiết': r.content,
      'Kinh Phí Dự Kiến (đ)': r.estimatedCost,
      'Ngày Tạo': r.createdAt,
      'Hạn Chót': r.deadline,
      'Trạng Thái': r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'IN_PROGRESS' ? 'Đang triển khai' : 'Chờ duyệt',
      'Người Phê Duyệt': r.approvedBy
    })));
    XLSX.utils.book_append_sheet(wb, ws2, 'Yeu_Cau_Hanh_Chinh');

    // Sheet 3: Dịch vụ đối tác
    const ws3 = XLSX.utils.json_to_sheet(partnerVendors.map(v => ({
      'Mã DV': v.id,
      'Dịch Vụ': v.serviceName,
      'Nhà Cung Cấp': v.provider,
      'Đầu Mối Liên Hệ': v.contactPerson,
      'Nhân Sự Thường Trực': v.headcount,
      'Chi Phí Hàng Tháng (đ)': v.costMonth,
      'Điểm Đánh Giá SLA': v.slaScore,
      'Phạm Vi Công Việc': v.scope
    })));
    XLSX.utils.book_append_sheet(wb, ws3, 'Doi_Tac_Thue_Ngoai');

    // Sheet 4: An toàn HSE
    const ws4 = XLSX.utils.json_to_sheet(hseViolations.map(h => ({
      'Mã Biên Bản': h.id,
      'Nhân Viên Vi Phạm': h.empName,
      'Bộ Phận': h.dept,
      'Ngày Vi Phạm': h.date,
      'Hành Vi Vi Phạm': h.violation,
      'Mức Độ': h.severity,
      'Hình Thức Xử Lý': h.penalty,
      'Trạng Thái': h.status,
      'Ghi Chú': h.note
    })));
    XLSX.utils.book_append_sheet(wb, ws4, 'Bien_Ban_Vi_Pham_HSE');

    XLSX.writeFile(wb, `Quan_Ly_Hanh_Chinh_Tong_Hop_${policy.companyName.replace(/\s+/g, '_')}_2026.xlsx`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. HEADER BANNER THU GỌN: VỪA VẶN TRONG TRANG 1 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-3.5 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-indigo-400" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              Quản Trị Hành Chính, Đối Tác Dịch Vụ & An Toàn Lao Động (HSE)
            </h1>
            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Vận Hành Thực Tế
            </span>
          </div>
          <p className="text-[11px] text-indigo-200 mt-0.5">
            Quản lý tập trung: Tiếp khách, phòng họp, VPP, văn thư, xe cộ, nhà ăn, bảo vệ, tạp vụ và kiểm tra an toàn HSE
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={handleExportAdminSummaryExcel}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Xuất toàn bộ dữ liệu quản lý hành chính ra file Excel đầy đủ"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel Báo Cáo HCNS</span>
          </button>
        </div>
      </div>

      {/* 2. THANH ĐIỀU HƯỚNG 9 PHÂN KHU NGHIỆP VỤ (CÓ THANH RULE CUỘN NGANG & NÚT CUỘN) */}
      <div className="border-b border-slate-200 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScrollAdminTabs('left')}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-xs shrink-0 cursor-pointer hidden md:flex items-center justify-center transition-colors"
            title="Cuộn các tab sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div 
            ref={adminTabsRef}
            className="flex items-center space-x-1.5 overflow-x-auto scrollable-tabs pb-1.5 scroll-smooth flex-1"
          >
        <button
          onClick={() => setActiveSubTab('VISITORS_AND_MEETINGS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'VISITORS_AND_MEETINGS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>1. Tiếp Khách & Phòng Họp</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ADMIN_REQUESTS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'ADMIN_REQUESTS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>2. Đăng Ký & Phê Duyệt</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ARCHIVE_DOCUMENTS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'ARCHIVE_DOCUMENTS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>3. Văn Thư Lưu Trữ Số</span>
        </button>

        <button
          onClick={() => setActiveSubTab('OFFICE_COSTS_INFRA')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'OFFICE_COSTS_INFRA'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>4. Chi Phí & Hạ Tầng</span>
        </button>

        <button
          onClick={() => setActiveSubTab('VEHICLES_TRAVEL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'VEHICLES_TRAVEL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>5. Xe & Vé Công Tác</span>
        </button>

        <button
          onClick={() => setActiveSubTab('UNIFORMS_AND_ASSETS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'UNIFORMS_AND_ASSETS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>6. Đồng Phục & CCDC</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MEDICAL_ROOM')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'MEDICAL_ROOM'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>7. Tủ Thuốc Y Tế</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PARTNER_SERVICES')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'PARTNER_SERVICES'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>8. Dịch Vụ Thuê Ngoài</span>
        </button>

        <button
          onClick={() => setActiveSubTab('HSE_SAFETY_COMPLIANCE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'HSE_SAFETY_COMPLIANCE'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-rose-500" />
          <span>9. HSE & Tuân Thủ</span>
        </button>
          </div>

          <button
            type="button"
            onClick={() => handleScrollAdminTabs('right')}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-xs shrink-0 cursor-pointer hidden md:flex items-center justify-center transition-colors"
            title="Cuộn các tab sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ════════════════════ TAB 1: TIẾP KHÁCH & ĐẶT PHÒNG HỌP ════════════════════ */}
      {activeSubTab === 'VISITORS_AND_MEETINGS' && (
        <ReceptionAndMeetingHub
          policy={policy}
          employees={employees}
          currentRole={currentRole}
        />
      )}

      {/* ════════════════════ TAB 2: TIẾP NHẬN & PHÊ DUYỆT YÊU CẦU ════════════════════ */}
      {activeSubTab === 'ADMIN_REQUESTS' && (
        <AdminRequisitionsHub
          policy={policy}
          employees={employees}
          currentRole={currentRole}
        />
      )}

      {/* ════════════════════ TAB 3: VĂN THƯ LƯU TRỮ SỐ ════════════════════ */}
      {activeSubTab === 'ARCHIVE_DOCUMENTS' && (
        <DigitalArchiveHub
          policy={policy}
          employees={employees}
          currentRole={currentRole}
        />
      )}

      {/* ════════════════════ TAB 4: CHI PHÍ & HẠ TẦNG ════════════════════ */}
      {activeSubTab === 'OFFICE_COSTS_INFRA' && (
        <OfficeCostsAndInfraHub
          policy={policy}
          employees={employees}
          currentRole={currentRole}
        />
      )}

      {/* ════════════════════ TAB 5: XE & VÉ CÔNG TÁC ════════════════════ */}
      {activeSubTab === 'VEHICLES_TRAVEL' && (
        <VehicleAndTravelHub
          policy={policy}
          employees={employees}
          currentRole={currentRole}
        />
      )}

      {/* ════════════════════ TAB 6: ĐỒNG PHỤC & CCDC ════════════════════ */}
      {activeSubTab === 'UNIFORMS_AND_ASSETS' && (
        <UniformsAndPPEHub
          policy={policy}
          employees={employees}
          currentRole={currentRole}
        />
      )}

      {/* ════════════════════ TAB 7: TỦ THUỐC Y TẾ ════════════════════ */}
      {activeSubTab === 'MEDICAL_ROOM' && (
        <MedicalAndFirstAidHub
          policy={policy}
          employees={employees}
          currentRole={currentRole}
        />
      )}

      {/* ════════════════════ TAB 8: DỊCH VỤ ĐỐI TÁC THUÊ NGOÀI (6 PHÂN HỆ CHUYÊN BIỆT) ════════════════════ */}
      {activeSubTab === 'PARTNER_SERVICES' && (
        <div className="space-y-4 animate-in fade-in">
          {/* BANNER TỔNG QUAN HỢP ĐỒNG ĐỐI TÁC DỊCH VỤ */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-indigo-900/30">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                    Quản Lý Đối Tác Dịch Vụ Thuê Ngoài &amp; Tiện Ích Cơ Sở (Facility Management)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-400 text-slate-950">
                    6 Phân Hệ SLA
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Giám sát chất lượng hợp đồng, định mức nhân sự ca trực, checklist 5S, kiểm định PCCC &amp; thanh toán minh bạch
                </p>
              </div>
            </div>

            <div className="text-right bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 shrink-0">
              <span className="text-[10px] text-indigo-200 block uppercase font-bold">Tổng Ngân Sách Dịch Vụ / Tháng:</span>
              <span className="text-base font-black text-amber-300 font-mono">
                {partnerVendors.reduce((sum, v) => sum + v.costMonth, 0).toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>

          {/* 6 NÚT TAB CHUYÊN BIỆT HÓA TỪNG DỊCH VỤ THUÊ NGOÀI */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center space-x-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollable-tabs">
              <button
                type="button"
                onClick={() => setActivePartnerServiceTab('SECURITY')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  activePartnerServiceTab === 'SECURITY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>1. An Ninh &amp; Bảo Vệ (24/7)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePartnerServiceTab('CLEANING')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  activePartnerServiceTab === 'CLEANING'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>2. Tạp Vụ &amp; Rác Thải CTNH</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePartnerServiceTab('CANTEEN')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  activePartnerServiceTab === 'CANTEEN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Utensils className="w-4 h-4 text-amber-500" />
                <span>3. Nhà Ăn Ca &amp; Cơm Doanh Nghiệp</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                  Full Quản Trị
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActivePartnerServiceTab('LANDSCAPE')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  activePartnerServiceTab === 'LANDSCAPE'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <TreePine className="w-4 h-4 text-emerald-500" />
                <span>4. Cây Xanh &amp; Diệt Côn Trùng</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePartnerServiceTab('MEP_FACILITY')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  activePartnerServiceTab === 'MEP_FACILITY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Power className="w-4 h-4 text-amber-500" />
                <span>5. Cơ Điện, Thang Máy &amp; PCCC</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePartnerServiceTab('OFFICE_EQUIP')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  activePartnerServiceTab === 'OFFICE_EQUIP'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Printer className="w-4 h-4 text-indigo-500" />
                <span>6. Thuê Máy Photocopy &amp; CNTT</span>
              </button>
            </div>

            {/* ════════════════════ PHÂN HỆ 1: AN NINH & BẢO VỆ ════════════════════ */}
            {activePartnerServiceTab === 'SECURITY' && (
              <div className="p-4 space-y-4">
                {/* Thẻ nhà thầu bảo vệ */}
                {(() => {
                  const sec = partnerVendors.find(v => v.serviceCategory === 'SECURITY')!;
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 text-sm sm:text-base">{sec.serviceName}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              SLA: {sec.slaScore}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Nhà cung cấp: <b className="text-indigo-700">{sec.provider}</b> • Hợp đồng số: <b className="font-mono">{sec.contractNo}</b> • Hạn gia hạn: <span className="font-mono text-slate-700 font-bold">{sec.renewalDate}</span>
                          </div>
                          <p className="text-[11.5px] text-slate-500">Đầu mối chỉ huy: <b>{sec.contactPerson}</b> • Quân số thường trực: <b className="text-slate-800">{sec.headcount} vệ sĩ</b></p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10.5px] text-slate-400 block font-bold">Chi phí thuê bảo vệ:</span>
                          <span className="text-xl font-black text-indigo-700 font-mono">{sec.costMonth.toLocaleString('vi-VN')} đ/tháng</span>
                        </div>
                      </div>

                      {/* 4 Chốt trực bảo vệ chi tiết */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Danh Sách Vị Trí Chốt Trực &amp; Phân Bổ Quân Số Vệ Sĩ Thường Trực</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {sec.guardPosts?.map((post, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-xs">{post.postName}</span>
                                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200">
                                  {post.headCount} nhân sự
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600">Ca trực: <b className="font-mono text-slate-700">{post.dutyTime}</b></div>
                              <div className="text-[10.5px] text-slate-500">Tổ trưởng chốt: <b>{post.leader}</b></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tiêu chí giám sát SLA */}
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-emerald-900 flex items-center gap-1">
                          <CheckCheck className="w-4 h-4 text-emerald-600" />
                          <span>Chỉ số giám sát tuần tra: Đúng giờ: {sec.slaDetails.patrolPunctuality} • Đồng phục &amp; Tác phong: {sec.slaDetails.uniformCompliance} • PCCC: {sec.slaDetails.fireSafetyDrills}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => alert('Đã xuất biên bản giao nhận ca và kiểm kê tài sản an ninh ra file Word/PDF!')}
                          className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-xs cursor-pointer"
                        >
                          In Sổ Bàn Giao Ca Vệ Sĩ
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ════════════════════ PHÂN HỆ 2: TẠP VỤ & RÁC THẢI ════════════════════ */}
            {activePartnerServiceTab === 'CLEANING' && (
              <div className="p-4 space-y-4">
                {(() => {
                  const cln = partnerVendors.find(v => v.serviceCategory === 'CLEANING')!;
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 text-sm sm:text-base">{cln.serviceName}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              SLA: {cln.slaScore}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Đơn vị thực hiện: <b className="text-indigo-700">{cln.provider}</b> • Hợp đồng số: <b className="font-mono">{cln.contractNo}</b>
                          </div>
                          <p className="text-[11.5px] text-slate-500">Giám sát ca: <b>{cln.contactPerson}</b> • Nhân sự tạp vụ: <b className="text-slate-800">{cln.headcount} nhân sự</b></p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10.5px] text-slate-400 block font-bold">Chi phí vệ sinh &amp; rác thải:</span>
                          <span className="text-xl font-black text-indigo-700 font-mono">{cln.costMonth.toLocaleString('vi-VN')} đ/tháng</span>
                        </div>
                      </div>

                      {/* Phân khu vệ sinh 5S & Rác thải nguy hại */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
                          <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                            <span>Khu Vực Phân Bổ Làm Vệ Sinh 5S Hằng Ngày</span>
                          </h4>
                          <div className="space-y-2">
                            {cln.cleaningZones?.map((z, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex justify-between items-center">
                                <div>
                                  <div className="font-bold text-slate-900">{z.zone}</div>
                                  <div className="text-[10.5px] text-slate-500">Tần suất: {z.freq}</div>
                                </div>
                                <span className="font-bold text-indigo-700">{z.staff} nhân sự</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2">
                          <h4 className="text-xs font-black uppercase text-rose-900 flex items-center gap-1.5">
                            <Trash2 className="w-4 h-4 text-rose-600" />
                            <span>Quản Lý Thu Gom Chất Thải Nguy Hại (CTNH)</span>
                          </h4>
                          <div className="text-xs text-slate-700 space-y-1.5">
                            <div>Đơn vị thu gom: <b className="text-slate-900">{cln.wasteContracts?.hazardousWastePartner}</b></div>
                            <div>Giấy phép quản lý CTNH số: <b className="font-mono text-rose-700">{cln.wasteContracts?.wastePermitNo}</b></div>
                            <div>Kỳ thu gom kế tiếp: <b className="text-emerald-700 font-mono">{cln.wasteContracts?.nextDisposalDate}</b></div>
                            <p className="text-[11px] text-slate-500 pt-1 border-t border-rose-100 italic">
                              * Tuân thủ Thông tư 02/2022/TT-BTNMT: Bắt buộc lập chứng từ chuyển giao chất thải nguy hại điện tử lưu trữ 5 năm.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ════════════════════ PHÂN HỆ 3: NHÀ ĂN CA & CƠM DOANH NGHIỆP (TÍCH HỢP TRỌN GÓI) ════════════════════ */}
            {activePartnerServiceTab === 'CANTEEN' && (
              <div className="p-4 space-y-5 animate-in fade-in">
                {(() => {
                  const can = partnerVendors.find(v => v.serviceCategory === 'CANTEEN')!;
                  return (
                    <div className="space-y-4">
                      {/* KHỐI 1: THÔNG TIN NHÀ THẦU, HỢP ĐỒNG & NGÂN SÁCH THÁNG */}
                      <div className="p-4 rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-black text-slate-900 text-sm sm:text-base">{can.serviceName}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-600 text-white shadow-xs">
                              SLA: {can.slaScore}
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Đang Phục Vụ 2 Ca/Ngày
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Nhà thầu bếp: <b className="text-emerald-800">{can.provider}</b> • Hợp đồng: <b className="font-mono">{can.contractNo}</b> (Hiệu lực đến {can.renewalDate})
                          </div>
                          <p className="text-[11.5px] text-slate-600">Đầu mối bếp trưởng: <b>{can.contactPerson}</b> • Đội ngũ thường trực: <b className="text-slate-900">{can.headcount} nhân sự (Đầy đủ Thẻ Xanh)</b></p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Ngân sách suất ăn/tháng:</span>
                            <span className="text-xl font-black text-emerald-800 font-mono">{can.costMonth.toLocaleString('vi-VN')} đ/tháng</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleExportCanteenReconciliationExcel}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                            title="Xuất bảng đối soát và biên bản nghiệm thu chi phí ăn ca ra Excel"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Xuất Quyết Toán Excel</span>
                          </button>
                        </div>
                      </div>

                      {/* KHỐI 2: 4 THẺ CHỈ SỐ VẬN HÀNH THỜI GIAN THỰC */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
                            <span>Dự Báo Bếp Nấu</span>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <div className="text-xl font-black text-slate-900 font-mono">663 <span className="text-xs font-normal text-slate-500">suất</span></div>
                          <div className="text-[10.5px] text-emerald-700 font-medium truncate">580 Mặn • 42 Chay • 20 Cháo • 21 Khách</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
                            <span>Thực Tế Chấm Công</span>
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div className="text-xl font-black text-emerald-700 font-mono">642 <span className="text-xs font-normal text-slate-500">NV đi làm</span></div>
                          <div className="text-[10.5px] text-emerald-600 font-medium">Sai lệch -3.1% (An toàn)</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
                            <span>Chờ HR Duyệt</span>
                            <Users className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <div className="text-xl font-black text-amber-600 font-mono">
                            {adminGuestMealRequests.filter(r => r.status === 'PENDING_HR').reduce((acc, r) => acc + r.guestCount, 0)} <span className="text-xs font-normal text-slate-500">suất khách</span>
                          </div>
                          <div className="text-[10.5px] text-amber-700 font-medium">Đoàn khách PwC chờ duyệt</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
                            <span>Điểm SLA Bếp</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <div className="text-xl font-black text-indigo-700 font-mono">4.2 / 5.0 ⭐</div>
                          <div className="text-[10.5px] text-slate-600 font-medium">Lưu mẫu 24h: 100% Niêm phong</div>
                        </div>
                      </div>

                      {/* KHỐI 3: THANH CHỌN 4 PHÂN KHU NGHIỆP VỤ BẾP ĂN */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="flex items-center space-x-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollable-tabs">
                          <button
                            type="button"
                            onClick={() => setCanteenActiveView('FORECAST_AI')}
                            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                              canteenActiveView === 'FORECAST_AI'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>1. Dự Báo Nhu Cầu Suất Ăn AI &amp; Tránh Lãng Phí</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCanteenActiveView('GUEST_PARTNER_APPROVAL')}
                            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                              canteenActiveView === 'GUEST_PARTNER_APPROVAL'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>2. Duyệt Khách Mời &amp; Suất Tiếp Đón ({adminGuestMealRequests.filter(r => r.status === 'PENDING_HR').length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCanteenActiveView('BILLING_RECONCILIATION')}
                            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                              canteenActiveView === 'BILLING_RECONCILIATION'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>3. Quyết Toán Tiền Ăn &amp; Phạt SLA Nhà Bếp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCanteenActiveView('FOOD_SAFETY_AUDIT')}
                            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                              canteenActiveView === 'FOOD_SAFETY_AUDIT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>4. Sổ Lưu Mẫu Thực Phẩm 24H &amp; ATTP</span>
                          </button>
                        </div>

                        {/* NỘI DUNG 1: DỰ BÁO NHU CẦU SUẤT ĂN AI */}
                        {canteenActiveView === 'FORECAST_AI' && (
                          <div className="p-4 space-y-4">
                            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-black text-indigo-900 uppercase">THUẬT TOÁN ĐIỀU PHỐI SUẤT ĂN THỜI GIAN THỰC</span>
                                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-200 text-indigo-900">
                                    Cập nhật: 11:15:00 Hôm nay
                                  </span>
                                </div>
                                <p className="text-[11.5px] text-slate-600">
                                  Hệ thống tự động liên kết máy quét vân tay cổng, đơn xin nghỉ phép đã duyệt và số lượt đăng ký cơm chay/cháo để ra lệnh bếp chuẩn bị khẩu phần chính xác đến từng khay cơm.
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0">
                                <span className="text-[11px] text-slate-500 font-bold">Lọc ca làm việc:</span>
                                <select
                                  value={canteenShiftFilter}
                                  onChange={e => setCanteenShiftFilter(e.target.value as any)}
                                  className="p-1.5 bg-white border border-indigo-300 rounded-xl font-bold text-slate-800 text-xs outline-none"
                                >
                                  <option value="LUNCH">Cơm Ca Trưa (11:30 - 13:30)</option>
                                  <option value="BREAKFAST">Suất Ăn Sáng (06:30 - 08:30)</option>
                                  <option value="DINNER">Cơm Ca Chiều (17:30 - 19:30)</option>
                                  <option value="NIGHT">Suất Ăn Đêm Tăng Ca (22:00 - 23:30)</option>
                                </select>
                              </div>
                            </div>

                            {/* BẢNG SO SÁNH DỰ BÁO VÀ THỰC TẾ THEO PHÂN XƯỞNG */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                                <thead className="bg-slate-100 border-b border-slate-200 text-[10.5px] font-black uppercase text-slate-700">
                                  <tr>
                                    <th className="px-3 py-2.5">Phân Xưởng / Khối</th>
                                    <th className="px-3 py-2.5 text-center">Tổng Nhân Sự Ca</th>
                                    <th className="px-3 py-2.5 text-center">Nghỉ Phép/Vắng</th>
                                    <th className="px-3 py-2.5 text-center font-bold text-emerald-800">Đã Check-in Vân Tay</th>
                                    <th className="px-3 py-2.5 text-center font-bold text-emerald-700">Cơm Chay</th>
                                    <th className="px-3 py-2.5 text-center font-bold text-amber-700">Cháo Bệnh</th>
                                    <th className="px-3 py-2.5 text-center font-bold text-slate-900">Cơm Mặn Thường</th>
                                    <th className="px-3 py-2.5 text-center">Khuyến Nghị Nấu</th>
                                    <th className="px-3 py-2.5 text-center">Trạng Thái Bếp</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                  <tr className="hover:bg-slate-50">
                                    <td className="px-3 py-2.5 font-bold text-slate-900">Phân Xưởng Chế Biến 1</td>
                                    <td className="px-3 py-2.5 text-center font-mono">240</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-rose-600">-6</td>
                                    <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-700">234</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-emerald-800 font-bold">18</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-amber-800 font-bold">8</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-slate-800 font-bold">208</td>
                                    <td className="px-3 py-2.5 text-center font-black text-indigo-700">234 suất</td>
                                    <td className="px-3 py-2.5 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        ✓ Đủ nguyên liệu
                                      </span>
                                    </td>
                                  </tr>
                                  <tr className="hover:bg-slate-50">
                                    <td className="px-3 py-2.5 font-bold text-slate-900">Phân Xưởng Đóng Gói &amp; Kho</td>
                                    <td className="px-3 py-2.5 text-center font-mono">180</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-rose-600">-4</td>
                                    <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-700">176</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-emerald-800 font-bold">14</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-amber-800 font-bold">6</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-slate-800 font-bold">156</td>
                                    <td className="px-3 py-2.5 text-center font-black text-indigo-700">176 suất</td>
                                    <td className="px-3 py-2.5 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        ✓ Đã chia khay
                                      </span>
                                    </td>
                                  </tr>
                                  <tr className="hover:bg-slate-50">
                                    <td className="px-3 py-2.5 font-bold text-slate-900">Khối Cơ Điện &amp; Bảo Trì</td>
                                    <td className="px-3 py-2.5 text-center font-mono">65</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-rose-600">-1</td>
                                    <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-700">64</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-emerald-800 font-bold">4</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-amber-800 font-bold">2</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-slate-800 font-bold">58</td>
                                    <td className="px-3 py-2.5 text-center font-black text-indigo-700">64 suất</td>
                                    <td className="px-3 py-2.5 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        ✓ Đã chuẩn bị
                                      </span>
                                    </td>
                                  </tr>
                                  <tr className="hover:bg-slate-50">
                                    <td className="px-3 py-2.5 font-bold text-slate-900">Khối Văn Phòng &amp; Điều Hành</td>
                                    <td className="px-3 py-2.5 text-center font-mono">92</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-rose-600">-3</td>
                                    <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-700">89</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-emerald-800 font-bold">6</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-amber-800 font-bold">4</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-slate-800 font-bold">79</td>
                                    <td className="px-3 py-2.5 text-center font-black text-indigo-700">89 suất</td>
                                    <td className="px-3 py-2.5 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        ✓ Giữ nóng tủ hấp
                                      </span>
                                    </td>
                                  </tr>
                                  <tr className="hover:bg-slate-50 bg-slate-50/60">
                                    <td className="px-3 py-2.5 font-bold text-purple-900">Khách Tiếp Đãi &amp; LĐ Dịch Vụ</td>
                                    <td className="px-3 py-2.5 text-center font-mono">21</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-slate-400">0</td>
                                    <td className="px-3 py-2.5 text-center font-mono font-bold text-purple-700">21</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-emerald-800 font-bold">4</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-amber-800 font-bold">1</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-slate-800 font-bold">16</td>
                                    <td className="px-3 py-2.5 text-center font-black text-purple-800">21 suất (7 Khách + 14 BV/TV)</td>
                                    <td className="px-3 py-2.5 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                        Bàn VIP &amp; Suất ngoài
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                                <tfoot className="bg-slate-100 font-black border-t-2 border-slate-300">
                                  <tr>
                                    <td className="px-3 py-2.5 text-slate-900">TỔNG TOÀN DOANH NGHIỆP</td>
                                    <td className="px-3 py-2.5 text-center font-mono">598</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-rose-600">-14</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-emerald-800 text-sm">584</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-emerald-700">46</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-amber-700">21</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-slate-900">517</td>
                                    <td className="px-3 py-2.5 text-center text-sm text-indigo-700">605 + 21 = 626 suất</td>
                                    <td className="px-3 py-2.5 text-center text-emerald-700">Khớp số liệu 99.2%</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* NỘI DUNG 2: PHÊ DUYỆT KHÁCH MỜI & LAO ĐỘNG DỊCH VỤ */}
                        {canteenActiveView === 'GUEST_PARTNER_APPROVAL' && (
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                              <div>
                                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                  <Users className="w-4 h-4 text-indigo-600" />
                                  <span>Hồ Sơ Tiếp Đón Khách Mời &amp; Phê Duyệt Cơm Ca Tiếp Khách</span>
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                  Duyệt cấp suất ăn tiếp đãi đối tác, chuyên gia kỹ thuật và cơ quan ban ngành đến làm việc
                                </p>
                              </div>
                              <span className="text-xs font-bold text-indigo-700">
                                Hạn mức suất ăn khách: 50.000 VNĐ / suất
                              </span>
                            </div>

                            <div className="space-y-3">
                              {adminGuestMealRequests.map(req => (
                                <div key={req.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-mono text-xs font-black text-indigo-700">{req.id}</span>
                                      <span className="font-black text-slate-900 text-sm">{req.guestCompany}</span>
                                      <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                        {req.guestCount} SUẤT
                                      </span>
                                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                        {req.dietLabel}
                                      </span>
                                    </div>
                                    <div className="text-[11.5px] text-slate-600">
                                      Đại diện khách: <b>{req.contactPerson}</b> • Cán bộ tiếp đón: <b>{req.hostEmpName}</b> ({req.hostDept})
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono">
                                      Giờ gửi: {req.requestTime} • Ca ăn: {req.shiftName} • Mã ngân sách duyệt: <b className="text-slate-700">{req.budgetApprovalCode}</b>
                                    </div>
                                  </div>

                                  {/* Nút hành động phê duyệt */}
                                  <div className="flex items-center space-x-2 shrink-0">
                                    {req.status === 'APPROVED' ? (
                                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                                        <span>Đã Phê Duyệt Xuất Cơm</span>
                                      </span>
                                    ) : req.status === 'REJECTED' ? (
                                      <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold">
                                        ✕ Đã Từ Chối
                                      </span>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <button
                                          type="button"
                                          onClick={() => handleAdminApproveGuestMeal(req.id)}
                                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>1-Click Phê Duyệt</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleAdminRejectGuestMeal(req.id)}
                                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl cursor-pointer"
                                        >
                                          Từ Chối
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* NỘI DUNG 3: QUYẾT TOÁN TIỀN ĂN & PHẠT SLA */}
                        {canteenActiveView === 'BILLING_RECONCILIATION' && (
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                              <div>
                                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                  <DollarSign className="w-4 h-4 text-emerald-600" />
                                  <span>Bảng Nghiệm Thu &amp; Quyết Toán Chi Phí Suất Ăn Ca Tháng 09/2026</span>
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                  Tự động nhân số suất thực nhận với đơn giá hợp đồng, trừ tiền vi phạm chất lượng thức ăn
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleExportCanteenReconciliationExcel}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Tải Biên Bản Nghiệm Thu (Excel)</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                <span className="text-[10.5px] font-bold text-slate-500 uppercase block">Đơn vị thầu nhà ăn</span>
                                <span className="font-black text-slate-900 text-xs block">Công ty CP Suất Ăn Hàng Không Nội Bài</span>
                                <span className="text-[11px] text-slate-600">Hợp đồng số: HD-CANTEEN-2026-04</span>
                              </div>
                              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                                <span className="text-[10.5px] font-bold text-emerald-800 uppercase block">Định mức suất ăn tiêu chuẩn</span>
                                <span className="font-black text-emerald-900 text-xs block">25.000 đ / suất mặn &amp; chay</span>
                                <span className="text-[11px] text-emerald-700">Suất cháo: 20.000 đ • Khách VIP: 50.000 đ</span>
                              </div>
                              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                                <span className="text-[10.5px] font-bold text-rose-800 uppercase block">Chế tài vi phạm SLA chất lượng</span>
                                <span className="font-black text-rose-900 text-xs block">-2.000.000 đ / lỗi có ảnh bằng chứng</span>
                                <span className="text-[11px] text-rose-700">Tháng này: Phát hiện 1 vụ cơm nguội quá giờ</span>
                              </div>
                            </div>

                            {/* BẢNG TỔNG KẾT QUYẾT TOÁN */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                                <thead className="bg-slate-100 border-b border-slate-200 text-[10.5px] font-black uppercase text-slate-700">
                                  <tr>
                                    <th className="px-3 py-2.5">Hạng Mục Suất Ăn Ca</th>
                                    <th className="px-3 py-2.5 text-center">Số Lượng Thực Nhận</th>
                                    <th className="px-3 py-2.5 text-right">Đơn Giá Hợp Đồng</th>
                                    <th className="px-3 py-2.5 text-right font-bold text-slate-900">Thành Tiền (VNĐ)</th>
                                    <th className="px-3 py-2.5 text-center">Căn Cứ Đối Soát</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                  <tr>
                                    <td className="px-3 py-2.5 font-bold text-slate-900">1. Cơm Mặn Tiêu Chuẩn (Ca ngày &amp; ca đêm)</td>
                                    <td className="px-3 py-2.5 text-center font-mono">580</td>
                                    <td className="px-3 py-2.5 text-right font-mono">25.000 đ</td>
                                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">14.500.000 đ</td>
                                    <td className="px-3 py-2.5 text-center text-[10px] text-slate-500">Mã quẹt QR POS Canteen</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-bold text-slate-900">2. Cơm Chay Dinh Dưỡng (Nhân sự đăng ký)</td>
                                    <td className="px-3 py-2.5 text-center font-mono">42</td>
                                    <td className="px-3 py-2.5 text-right font-mono">25.000 đ</td>
                                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">1.050.000 đ</td>
                                    <td className="px-3 py-2.5 text-center text-[10px] text-slate-500">Đăng ký trong 30p vàng</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-bold text-slate-900">3. Cháo Dinh Dưỡng Dành Cho Lao Động Mệt</td>
                                    <td className="px-3 py-2.5 text-center font-mono">20</td>
                                    <td className="px-3 py-2.5 text-right font-mono">20.000 đ</td>
                                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">400.000 đ</td>
                                    <td className="px-3 py-2.5 text-center text-[10px] text-slate-500">Xác nhận của Y Tế/Đ.Ký</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-bold text-slate-900">4. Suất Tiếp Khách Cơ Quan &amp; Chuyên Gia (VIP)</td>
                                    <td className="px-3 py-2.5 text-center font-mono">7</td>
                                    <td className="px-3 py-2.5 text-right font-mono">50.000 đ</td>
                                    <td className="px-3 py-2.5 text-right font-mono font-bold text-indigo-700">350.000 đ</td>
                                    <td className="px-3 py-2.5 text-center text-[10px] text-indigo-600 font-bold">Phòng HR Phê Duyệt</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2.5 font-bold text-slate-900">5. Suất Ăn Đối Tác (Bảo Vệ Long Hoàng &amp; Tạp Vụ)</td>
                                    <td className="px-3 py-2.5 text-center font-mono">14</td>
                                    <td className="px-3 py-2.5 text-right font-mono">25.000 đ</td>
                                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">350.000 đ</td>
                                    <td className="px-3 py-2.5 text-center text-[10px] text-purple-600 font-bold">Mã PIN Bàn Giao Ca</td>
                                  </tr>
                                  <tr className="bg-rose-50/50">
                                    <td className="px-3 py-2.5 font-bold text-rose-800">6. Khấu Trừ Phạt Vi Phạm SLA Chất Lượng (Ảnh Feedback)</td>
                                    <td className="px-3 py-2.5 text-center font-mono text-rose-700 font-bold">1 vụ</td>
                                    <td className="px-3 py-2.5 text-right font-mono text-rose-700">-2.000.000 đ</td>
                                    <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-700">-2.000.000 đ</td>
                                    <td className="px-3 py-2.5 text-center text-[10px] text-rose-700 font-bold">Biên bản xử lý ngày 28/08</td>
                                  </tr>
                                </tbody>
                                <tfoot className="bg-emerald-50 border-t-2 border-emerald-300 text-xs font-black">
                                  <tr>
                                    <td className="px-3 py-3 text-emerald-950 uppercase">TỔNG SỐ TIỀN THANH TOÁN THỰC TẾ CHO BẾP</td>
                                    <td className="px-3 py-3 text-center font-mono text-emerald-950 text-sm">663 Suất</td>
                                    <td className="px-3 py-3 text-right"></td>
                                    <td className="px-3 py-3 text-right font-mono text-emerald-950 text-base">
                                      14.650.000 đ
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                                        Đủ điều kiện thanh toán
                                      </span>
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* NỘI DUNG 4: SỔ LƯU MẪU THỰC PHẨM 24H */}
                        {canteenActiveView === 'FOOD_SAFETY_AUDIT' && (
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                              <div>
                                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <span>Sổ Lưu Mẫu Thức Ăn 24 Giờ (Theo Quyết định số 1246/QĐ-BYT của Bộ Y Tế)</span>
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                  Lưu trữ tối thiểu 100g thức ăn đặc / 150ml canh trong hũ thủy tinh tiệt trùng, niêm phong tủ mát 2°C - 8°C đủ 24 giờ
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const item = prompt('Nhập thực đơn món ăn lưu mẫu hôm nay:', 'Cơm trắng, Cá lóc kho tộ, Canh chua, Bắp cải xào');
                                  if (!item) return;
                                  const newLog = {
                                    id: `SMP-${Date.now().toString().slice(-8)}`,
                                    date: new Date().toISOString().split('T')[0],
                                    shiftName: 'Cơm Ca Trưa (11:30)',
                                    menuItems: item,
                                    sampledAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
                                    sampledBy: 'Y tá Nguyễn Thu Thảo & Bếp trưởng Tuấn Anh',
                                    tempStorage: '3.8°C (Tủ mẫu chuyên dụng)',
                                    sealStatus: 'SEALED',
                                    sealCode: `NIEM-PHONG-${Date.now().toString().slice(-4)}`,
                                    disposeTime: 'Sau 24 giờ',
                                    result: 'PASSED'
                                  };
                                  setFoodSampleLogs([newLog, ...foodSampleLogs]);
                                  alert('✓ Đã cập nhật sổ niêm phong lưu mẫu thực phẩm thành công!');
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Lập Niêm Phong Mẫu Ăn Mới</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              {foodSampleLogs.map(s => (
                                <div key={s.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                        {s.id}
                                      </span>
                                      <span className="font-black text-slate-900 text-xs">{s.shiftName} ({s.date})</span>
                                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                        Nhiệt độ: {s.tempStorage}
                                      </span>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                      s.sealStatus === 'SEALED' 
                                        ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' 
                                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    }`}>
                                      {s.sealStatus === 'SEALED' ? '🔒 ĐANG NIÊM PHONG LƯU 24H' : '✓ ĐÃ HOÀN TẤT TIÊU HỦY ĐỦ HẠN'}
                                    </span>
                                  </div>

                                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                                    <div><b>Thực đơn lưu nghiệm:</b> {s.menuItems}</div>
                                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
                                      <span>Cán bộ niêm phong: <b>{s.sampledBy}</b></span>
                                      <span>Mã niêm phong tem: <b className="font-mono text-indigo-700">{s.sealCode}</b></span>
                                      <span>Thời điểm lấy mẫu: <b>{s.sampledAt}</b></span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* KHỐI 4: ĐỘI NGŨ ĐẦU BẾP & HỒ SƠ THẺ XANH SỨC KHỎE */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>Danh Sách Đội Ngũ Nhân Sự Bếp &amp; Hồ Sơ Sức Khỏe Thẻ Xanh</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {can.kitchenStaff?.map((k, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                              <span className="text-[10.5px] font-bold text-slate-400 uppercase block">{k.role}</span>
                              <div className="font-black text-slate-900 text-xs">{k.name}</div>
                              <div className="text-[10.5px] text-emerald-700 font-medium">✓ {k.cert}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* KHỐI 5: NHẬT KÝ ĐÁNH GIÁ KHAY CƠM HÀNG NGÀY (CÓ ẢNH XÁC THỰC) */}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                            <Utensils className="w-4 h-4 text-amber-600" />
                            <span>Nhật Ký Đánh Giá Khay Cơm Hằng Ngày (Có hình ảnh xác thực)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowMealFeedbackModal(true)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            + Gửi Đánh Giá Khay Cơm
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-700 border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                              <tr>
                                <th className="px-3 py-2 text-center">Mã ĐG</th>
                                <th className="px-3 py-2">Ngày &amp; Ca Ăn</th>
                                <th className="px-3 py-2">Nhân Sự Đánh Giá</th>
                                <th className="px-3 py-2 text-center">Điểm</th>
                                <th className="px-3 py-2">Mặt Hài Lòng</th>
                                <th className="px-3 py-2">Mặt Cần Khắc Phục</th>
                                <th className="px-3 py-2 text-center">Hình Ảnh</th>
                                <th className="px-3 py-2">Phản Hồi Bếp Trưởng</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {mealFeedbacks.map(fb => (
                                <tr key={fb.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 text-center font-mono font-bold text-indigo-700 text-[10px]">{fb.id}</td>
                                  <td className="px-3 py-2 font-bold text-slate-900">{fb.date} ({fb.shift})</td>
                                  <td className="px-3 py-2">{fb.employeeName} ({fb.department})</td>
                                  <td className="px-3 py-2 text-center font-black text-amber-600">{fb.rating} ⭐</td>
                                  <td className="px-3 py-2 text-emerald-800 text-[11px] max-w-[200px]">{fb.positiveFeedback}</td>
                                  <td className="px-3 py-2 text-rose-800 text-[11px] max-w-[200px]">{fb.negativeFeedback}</td>
                                  <td className="px-3 py-2 text-center">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                      {fb.hasPhotoEvidence ? '✓ Có ảnh' : 'Không'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 italic text-[11px]">{fb.kitchenResponse}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ════════════════════ PHÂN HỆ 4: CẢNH QUAN & DIỆT CÔN TRÙNG ════════════════════ */}
            {activePartnerServiceTab === 'LANDSCAPE' && (
              <div className="p-4 space-y-4">
                {(() => {
                  const lnd = partnerVendors.find(v => v.serviceCategory === 'LANDSCAPE')!;
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 text-sm sm:text-base">{lnd.serviceName}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              SLA: {lnd.slaScore}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Đơn vị thực hiện: <b className="text-indigo-700">{lnd.provider}</b> • Hợp đồng số: <b className="font-mono">{lnd.contractNo}</b>
                          </div>
                          <p className="text-[11.5px] text-slate-500">Chỉ huy cảnh quan: <b>{lnd.contactPerson}</b> • Nhân sự thường trực: <b className="text-slate-800">{lnd.headcount} kỹ thuật viên</b></p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10.5px] text-slate-400 block font-bold">Chi phí chăm sóc &amp; phun xịt:</span>
                          <span className="text-xl font-black text-indigo-700 font-mono">{lnd.costMonth.toLocaleString('vi-VN')} đ/tháng</span>
                        </div>
                      </div>

                      {/* Lịch phun thuốc diệt mối, muỗi & chăm sóc cây */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                          <h4 className="text-xs font-black uppercase text-emerald-900 flex items-center gap-1.5">
                            <TreePine className="w-4 h-4 text-emerald-600" />
                            <span>Quản Lý 120 Cây Cảnh Văn Phòng &amp; Thảm Cỏ Khuôn Viên</span>
                          </h4>
                          <div className="text-xs text-slate-700 space-y-1">
                            <div>• Tần suất tưới nước: <b>Hằng ngày (07:00 &amp; 16:30)</b></div>
                            <div>• Cắt tỉa thảm cỏ sân xưởng: <b>2 tuần / lần (Thứ Bảy)</b></div>
                            <div>• Bón phân &amp; thay đất cây văn phòng: <b>Định kỳ mỗi 3 tháng</b></div>
                            <div className="text-emerald-700 font-bold pt-1">Tỷ lệ cây sinh trưởng tốt: 98.5%</div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
                          <h4 className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                            <Bug className="w-4 h-4 text-amber-600" />
                            <span>Lịch Phun Thuốc Diệt Côn Trùng &amp; Khử Khuẩn (Pest Control)</span>
                          </h4>
                          <div className="text-xs text-slate-700 space-y-1">
                            <div>Lần phun gần nhất: <b className="font-mono">{lnd.pestSchedule?.lastSprayingDate}</b></div>
                            <div>Lần phun kế tiếp: <b className="font-mono text-indigo-700">{lnd.pestSchedule?.nextSprayingDate}</b></div>
                            <div>Hóa chất sử dụng: <b className="text-slate-900">{lnd.pestSchedule?.chemicalUsed}</b></div>
                            <p className="text-[10.5px] text-slate-500 italic pt-1 border-t border-amber-200">
                              * Có thông báo trước 48h cho toàn bộ nhân viên đóng kín tủ hồ sơ trước khi phun.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ════════════════════ PHÂN HỆ 5: BẢO TRÌ CƠ ĐIỆN & PCCC ════════════════════ */}
            {activePartnerServiceTab === 'MEP_FACILITY' && (
              <div className="p-4 space-y-4">
                {(() => {
                  const mep = partnerVendors.find(v => v.serviceCategory === 'MEP_FACILITY')!;
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 text-sm sm:text-base">{mep.serviceName}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              SLA: {mep.slaScore}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Đơn vị bảo trì: <b className="text-indigo-700">{mep.provider}</b> • Hợp đồng số: <b className="font-mono">{mep.contractNo}</b>
                          </div>
                          <p className="text-[11.5px] text-slate-500">Kỹ sư trưởng: <b>{mep.contactPerson}</b> • Cam kết khắc phục sự cố khẩn: <b className="text-rose-700">{mep.slaDetails.emergencyResponseTime}</b></p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10.5px] text-slate-400 block font-bold">Chi phí bảo trì kỹ thuật:</span>
                          <span className="text-xl font-black text-indigo-700 font-mono">{mep.costMonth.toLocaleString('vi-VN')} đ/tháng</span>
                        </div>
                      </div>

                      {/* 4 Tài sản kỹ thuật trọng yếu */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Power className="w-4 h-4 text-amber-500" />
                          <span>Lịch Kiểm Định &amp; Bảo Dưỡng Các Thiết Bị Nghiêm Ngặt</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {mep.criticalAssets?.map((a, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                              <span className="font-bold text-slate-900 text-xs block truncate">{a.asset}</span>
                              <div className="text-[11px] text-slate-600">Chu kỳ: <b>{a.cycle}</b></div>
                              <div className="text-[11px] text-indigo-700">Kỳ tới: <b className="font-mono">{a.nextDate}</b></div>
                              <div className="text-[10px] text-slate-400 border-t pt-1 truncate">{a.testCompany}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ════════════════════ PHÂN HỆ 6: THUÊ MÁY PHOTOCOPY & CNTT ════════════════════ */}
            {activePartnerServiceTab === 'OFFICE_EQUIP' && (
              <div className="p-4 space-y-4">
                {(() => {
                  const xrx = partnerVendors.find(v => v.serviceCategory === 'OFFICE_EQUIP')!;
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 text-sm sm:text-base">{xrx.serviceName}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              SLA: {xrx.slaScore}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Đối tác thiết bị: <b className="text-indigo-700">{xrx.provider}</b> • Hợp đồng: <b className="font-mono">{xrx.contractNo}</b>
                          </div>
                          <p className="text-[11.5px] text-slate-500">Chuyên viên hỗ trợ: <b>{xrx.contactPerson}</b> • Cam kết cấp mực: <b className="text-emerald-700">{xrx.slaDetails.tonerRefillTime}</b></p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10.5px] text-slate-400 block font-bold">Chi phí thuê máy in trọn gói:</span>
                          <span className="text-xl font-black text-indigo-700 font-mono">{xrx.costMonth.toLocaleString('vi-VN')} đ/tháng</span>
                        </div>
                      </div>

                      {/* Danh sách 4 máy photo và hạn mức bản in */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Printer className="w-4 h-4 text-indigo-600" />
                          <span>Hạn Mức Bản In &amp; Trạng Thái Máy Thuê Tại Các Phòng Ban</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {xrx.rentedMachines?.map((m, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
                              <span className="font-bold text-slate-900 text-xs block leading-tight">{m.model}</span>
                              <div className="text-[11px] text-slate-600 flex justify-between">
                                <span>Đã in tháng:</span>
                                <b className="font-mono text-indigo-700">{m.currentPages} / {m.quotaPages} trang</b>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-full rounded-full" 
                                  style={{ width: `${(m.currentPages / m.quotaPages) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-emerald-700 font-bold block">✓ {m.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════ TAB 9: AN TOÀN HSE & TUÂN THỦ ════════════════════ */}
      {activeSubTab === 'HSE_SAFETY_COMPLIANCE' && (
        <HSEAndSafetyComplianceHub
          policy={policy}
          employees={employees}
          currentRole={currentRole}
        />
      )}

      {/* ════════════════════ MODAL 1: ĐĂNG KÝ TIẾP KHÁCH / PHÒNG HỌP ════════════════════ */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Đăng Ký Tiếp Đón Đoàn Khách & Phòng Họp</h3>
              <button onClick={() => setShowMeetingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} className="space-y-2.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên Chương Trình / Buổi Làm Việc:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tiếp Đoàn Chuyên Gia Đối Tác..."
                  value={newMeetingForm.title}
                  onChange={e => setNewMeetingForm({ ...newMeetingForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cơ Quan / Đơn Vị Đến:</label>
                  <input
                    type="text"
                    required
                    value={newMeetingForm.organization}
                    onChange={e => setNewMeetingForm({ ...newMeetingForm, organization: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Lượng Khách:</label>
                  <input
                    type="number"
                    min="1"
                    value={newMeetingForm.visitorCount}
                    onChange={e => setNewMeetingForm({ ...newMeetingForm, visitorCount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Tiếp:</label>
                  <input
                    type="date"
                    value={newMeetingForm.date}
                    onChange={e => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Khung Giờ:</label>
                  <input
                    type="text"
                    value={newMeetingForm.time}
                    onChange={e => setNewMeetingForm({ ...newMeetingForm, time: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chọn Phòng Họp:</label>
                <select
                  value={newMeetingForm.room}
                  onChange={e => setNewMeetingForm({ ...newMeetingForm, room: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white"
                >
                  <option value="Phòng Hội Nghị 1 (Tầng 2)">Phòng Hội Nghị 1 (Tầng 2 - 30 chỗ)</option>
                  <option value="Phòng Khánh Tiết (Tầng 3)">Phòng Khánh Tiết (Tầng 3 - 15 chỗ)</option>
                  <option value="Phòng VIP Boardroom (Tầng 5)">Phòng VIP Boardroom (Tầng 5 - 12 chỗ)</option>
                  <option value="Phòng Họp Lớn Hội Trường (Tầng 1)">Phòng Họp Lớn Hội Trường (Tầng 1 - 100 chỗ)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Yêu Cầu Hậu Cần (Trà, Cà Phê, Trái Cây, Quà):</label>
                <input
                  type="text"
                  value={newMeetingForm.teaAndSnacks}
                  onChange={e => setNewMeetingForm({ ...newMeetingForm, teaAndSnacks: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  Lưu & Xác Nhận Đặt Phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 2: TẠO YÊU CẦU HÀNH CHÍNH MỚI ════════════════════ */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Đăng Ký Nhu Cầu Hành Chính (VPP, Vé Máy Bay, Khám SK...)</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-2.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Loại Nhu Cầu Đăng Ký:</label>
                <select
                  value={newRequestForm.categoryName}
                  onChange={e => setNewRequestForm({ ...newRequestForm, categoryName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white"
                >
                  <option value="Mua Văn Phòng Phẩm (VPP)">Mua Văn Phòng Phẩm (VPP, giấy, bút, sổ)</option>
                  <option value="Đặt Vé Máy Bay & Khách Sạn Công Tác">Đặt Vé Máy Bay & Khách Sạn Công Tác</option>
                  <option value="Khám Sức Khỏe Định Kỳ Doanh Nghiệp">Khám Sức Khỏe Định Kỳ Doanh Nghiệp</option>
                  <option value="Huấn Luyện An Toàn Vệ Sinh Lao Động (NĐ 44)">Huấn Luyện An Toàn Vệ Sinh Lao Động (NĐ 44)</option>
                  <option value="Du Lịch / Teambuilding Thường Niên">Du Lịch / Teambuilding Thường Niên</option>
                  <option value="Cấp Phát Đồng Phục / CCDC Bổ Sung">Cấp Phát Đồng Phục / CCDC Bổ Sung</option>
                  <option value="Yêu Cầu Hành Chính Khác">Yêu Cầu Hành Chính Khác</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Người Đề Xuất:</label>
                  <input
                    type="text"
                    required
                    value={newRequestForm.requesterName}
                    onChange={e => setNewRequestForm({ ...newRequestForm, requesterName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phòng Ban:</label>
                  <input
                    type="text"
                    required
                    value={newRequestForm.department}
                    onChange={e => setNewRequestForm({ ...newRequestForm, department: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nội Dung Đề Xuất Chi Tiết:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ghi rõ chủng loại, số lượng, quy cách cần mua hoặc mục đích công tác..."
                  value={newRequestForm.content}
                  onChange={e => setNewRequestForm({ ...newRequestForm, content: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kinh Phí Dự Kiến (VNĐ):</label>
                  <FormattedNumberInput
                    value={newRequestForm.estimatedCost || 0}
                    onChange={val => setNewRequestForm({ ...newRequestForm, estimatedCost: val })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono font-bold text-slate-800"
                    placeholder="VD: 3.500.000"
                    unit="VNĐ"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời Hạn Cần Hoàn Thành:</label>
                  <input
                    type="date"
                    value={newRequestForm.deadline}
                    onChange={e => setNewRequestForm({ ...newRequestForm, deadline: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  Gửi Yêu Cầu Đến HCNS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL 3: VÀO SỔ CÔNG VĂN MỚI ════════════════════ */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Vào Sổ Lưu Trữ Văn Thư Mới</h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDoc} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Loại Công Văn:</label>
                  <select
                    value={newDocForm.docType}
                    onChange={e => {
                      const dt = e.target.value;
                      setNewDocForm({
                        ...newDocForm,
                        docType: dt,
                        docTypeName: dt === 'DOC_IN' ? 'Công Văn Đến' : dt === 'DOC_OUT' ? 'Công Văn Đi' : 'Văn Bản Nội Bộ'
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="DOC_IN">Công Văn Đến (Từ cơ quan bên ngoài)</option>
                    <option value="DOC_OUT">Công Văn Đi (Gửi cơ quan/đối tác)</option>
                    <option value="INTERNAL">Văn Bản Nội Bộ (Thông báo, Quyết định)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Hiệu Văn Bản:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 15/QĐ-AVM-2026..."
                    value={newDocForm.docNumber}
                    onChange={e => setNewDocForm({ ...newDocForm, docNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Người Ký / Nơi Ban Hành:</label>
                  <input
                    type="text"
                    required
                    placeholder="Tổng Giám Đốc hoặc Sở LĐTBXH..."
                    value={newDocForm.signer}
                    onChange={e => setNewDocForm({ ...newDocForm, signer: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày Ban Hành:</label>
                  <input
                    type="date"
                    value={newDocForm.issueDate}
                    onChange={e => setNewDocForm({ ...newDocForm, issueDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trích Yếu Nội Dung:</label>
                <textarea
                  required
                  rows={3}
                  value={newDocForm.summary}
                  onChange={e => setNewDocForm({ ...newDocForm, summary: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  Lưu Vào Sổ Văn Thư
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ════════════════════ MODAL A: KHÁCH VÀO CỔNG MỚI (CHECK-IN TỰ ĐỘNG) ════════════════════ */}
      {showGateCheckInModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <LogIn className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Ghi Nhận Khách Vào Cổng Bảo Vệ Mới</h3>
              </div>
              <button onClick={() => setShowGateCheckInModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAutoCheckIn} className="space-y-3 text-xs">
              {/* Phân loại đối tượng ra vào cổng */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block text-[11px] uppercase">
                  Phân Loại Đối Tượng Ra Vào Cổng *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-2 cursor-pointer transition-all ${
                    newGateVisitor.visitorCategory === 'GUEST'
                      ? 'bg-blue-50 text-blue-800 border-blue-400 ring-1 ring-blue-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="visitorCategory"
                      checked={newGateVisitor.visitorCategory === 'GUEST'}
                      onChange={() => setNewGateVisitor({ ...newGateVisitor, visitorCategory: 'GUEST' })}
                      className="text-blue-600"
                    />
                    <span>Khách Thăm / Đối Tác Công Ty</span>
                  </label>

                  <label className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-2 cursor-pointer transition-all ${
                    newGateVisitor.visitorCategory === 'OUTSOURCED_PARTNER'
                      ? 'bg-purple-50 text-purple-800 border-purple-400 ring-1 ring-purple-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="visitorCategory"
                      checked={newGateVisitor.visitorCategory === 'OUTSOURCED_PARTNER'}
                      onChange={() => setNewGateVisitor({ ...newGateVisitor, visitorCategory: 'OUTSOURCED_PARTNER' })}
                      className="text-purple-600"
                    />
                    <span>Đối Tác Dịch Vụ (Bảo Vệ / Tạp Vụ)</span>
                  </label>
                </div>

                {newGateVisitor.visitorCategory === 'OUTSOURCED_PARTNER' && (
                  <div className="pt-1 flex items-center space-x-2">
                    <span className="text-[11px] text-slate-600 font-semibold">Vai trò cụ thể:</span>
                    <select
                      value={newGateVisitor.partnerRoleDetail}
                      onChange={e => setNewGateVisitor({ ...newGateVisitor, partnerRoleDetail: e.target.value })}
                      className="p-1 border border-purple-300 rounded-lg text-xs font-bold bg-white text-purple-900 outline-none"
                    >
                      <option value="Bảo Vệ">Bảo Vệ Cổng / Tuần Tra</option>
                      <option value="Tạp Vụ">Tạp Vụ Vệ Sinh</option>
                      <option value="Nhà Thầu Kỹ Thuật">Kỹ Thuật Nhà Thầu Bảo Trì</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {newGateVisitor.visitorCategory === 'OUTSOURCED_PARTNER' ? 'Họ & Tên Nhân Sự Dịch Vụ *:' : 'Họ & Tên Khách *:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A..."
                    value={newGateVisitor.fullName}
                    onChange={e => setNewGateVisitor({ ...newGateVisitor, fullName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giới Tính:</label>
                  <select
                    value={newGateVisitor.gender}
                    onChange={e => setNewGateVisitor({ ...newGateVisitor, gender: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cơ Quan / Công Ty:</label>
                  <input
                    type="text"
                    required
                    placeholder="Công ty TNHH..."
                    value={newGateVisitor.company}
                    onChange={e => setNewGateVisitor({ ...newGateVisitor, company: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    required
                    placeholder="0912.xxx.xxx"
                    value={newGateVisitor.phone}
                    onChange={e => setNewGateVisitor({ ...newGateVisitor, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Người Xác Nhận Tiếp Đón (Phòng Ban):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Anh Hoàng - TP Cơ Điện / Chị Mai - HCNS..."
                  value={newGateVisitor.hostPerson}
                  onChange={e => setNewGateVisitor({ ...newGateVisitor, hostPerson: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi Chú / Mục Đích Vào:</label>
                <input
                  type="text"
                  placeholder="Bảo trì máy, khảo sát, giao hàng, công tác..."
                  value={newGateVisitor.note}
                  onChange={e => setNewGateVisitor({ ...newGateVisitor, note: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              {/* Tùy chọn kiểm tra an toàn HSE */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Yêu Cầu Kiểm Tra An Toàn (Safety Induction)</span>
                  </span>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGateVisitor.requiresSafetyTest}
                      onChange={e => setNewGateVisitor({ ...newGateVisitor, requiresSafetyTest: e.target.checked })}
                      className="rounded text-indigo-600 w-4 h-4"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">Bắt buộc</span>
                  </label>
                </div>
                {newGateVisitor.requiresSafetyTest && (
                  <div className="flex items-center space-x-3 text-xs pt-1">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="safetyType"
                        checked={newGateVisitor.safetyTestType === 'QR_MOBILE'}
                        onChange={() => setNewGateVisitor({ ...newGateVisitor, safetyTestType: 'QR_MOBILE' })}
                      />
                      <span>Quét QR Mobile (Xem clip 2p &amp; thi)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="safetyType"
                        checked={newGateVisitor.safetyTestType === 'PAPER_FORM'}
                        onChange={() => setNewGateVisitor({ ...newGateVisitor, safetyTestType: 'PAPER_FORM' })}
                      />
                      <span>In Phiếu Giấy Viết Tay</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Hệ thống sẽ <b>tự động ghi nhận giờ vào thực tế</b> ngay khi bấm nút xác nhận.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGateCheckInModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác Nhận Cho Vào Cổng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL B: MÃ QR KIỂM TRA AN TOÀN CHO KHÁCH (MOBILE) ════════════════════ */}
      {showSafetyQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>Quét Mã QR: Kiểm Tra An Toàn Nhà Xưởng</span>
              </h3>
              <button onClick={() => setShowSafetyQrModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
              <p className="text-xs text-purple-900 font-semibold">
                Khách dùng Camera điện thoại quét mã QR bên dưới:
              </p>
              
              {/* QR Mockup trực quan */}
              <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl border-2 border-purple-300 shadow-sm flex flex-col items-center justify-center space-y-1">
                <QrCode className="w-28 h-28 text-slate-900" />
                <span className="text-[10px] font-mono text-purple-700 font-bold">HSE-PASS-2026</span>
              </div>

              <div className="text-[11px] text-slate-600 text-left space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                  <Video className="w-3.5 h-3.5" />
                  <span>Bước 1: Xem video an toàn 2 phút</span>
                </div>
                <p className="text-slate-500 pl-5">Quy định mang giày mũi sắt, nón bảo hộ, cấm lửa và đường thoát hiểm.</p>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold pt-1">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Bước 2: Trả lời 3 câu hỏi trắc nghiệm an toàn</span>
                </div>
                <p className="text-slate-500 pl-5">Đạt 3/3 câu hệ thống cấp Thẻ An Toàn Điện Tử (Digital Safety Pass).</p>
              </div>
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => {
                  alert('✓ Mô phỏng: Khách đã quét QR, xem xong video và đạt 3/3 câu trắc nghiệm trên điện thoại!');
                  setShowSafetyQrModal(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 cursor-pointer shadow-xs flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Khách Đã Thi Xong (Đạt 100%)</span>
              </button>
              <button
                onClick={() => setShowSafetyQrModal(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL C: IN BIỂU MẪU KIỂM TRA AN TOÀN BẰNG GIẤY (PAPER SAFETY TEST) ════════════════════ */}
      {showSafetyPaperModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  Biểu Mẫu Giấy: Bài Kiểm Tra &amp; Cam Kết An Toàn Khách Vào Nhà Máy
                </h3>
              </div>
              <button onClick={() => setShowSafetyPaperModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Khung tài liệu giấy chuẩn để in */}
            <div className="border border-slate-300 p-4 rounded-xl bg-slate-50/50 space-y-3 text-xs leading-relaxed font-sans">
              <div className="text-center border-b border-slate-300 pb-2">
                <p className="font-bold uppercase text-[11px] text-slate-800">{policy.companyName}</p>
                <h4 className="font-black text-sm text-slate-900 uppercase mt-0.5">BÀI KIỂM TRA AN TOÀN LAO ĐỘNG (SAFETY PASS)</h4>
                <p className="text-[10px] text-slate-500 italic">Dành cho khách tham quan, đối tác, nhà thầu thi công vào khu vực sản xuất</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                <div>Họ và tên: ............................................................</div>
                <div>Đơn vị: ..............................................................</div>
                <div>Số CCCD/SĐT: .....................................................</div>
                <div>Ngày vào cổng: {new Date().toLocaleDateString('vi-VN')}</div>
              </div>

              <div className="space-y-2 text-[11px]">
                <p className="font-bold text-slate-900 uppercase">PHẦN TRẮC NGHIỆM AN TOÀN (Tích chọn đáp án đúng):</p>
                
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <p className="font-semibold text-slate-800">Câu 1: Trang bị bảo hộ cá nhân (PPE) bắt buộc khi vào phân xưởng là gì?</p>
                  <p className="text-slate-600">[ ] A. Dép lê, áo cộc tay</p>
                  <p className="text-slate-600">[ ] B. Giày bảo hộ chống đinh/dập ngón, nón bảo hộ, thẻ khách</p>
                  <p className="text-slate-600">[ ] C. Không cần trang bị nếu đi cùng nhân viên</p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <p className="font-semibold text-slate-800">Câu 2: Quy định về hút thuốc và sử dụng nguồn lửa trần trong nhà xưởng?</p>
                  <p className="text-slate-600">[ ] A. Được hút thuốc tại góc khuất kho hàng</p>
                  <p className="text-slate-600">[ ] B. Nghiêm cấm tuyệt đối hút thuốc và mang chất cháy nổ vào xưởng</p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <p className="font-semibold text-slate-800">Câu 3: Khi có còi báo cháy hoặc tình huống khẩn cấp, bạn cần làm gì?</p>
                  <p className="text-slate-600">[ ] A. Nhanh chóng di chuyển theo đèn Exit thoát hiểm ra điểm tập kết an toàn</p>
                  <p className="text-slate-600">[ ] B. Quay lại lấy tư trang và đứng chờ người đón</p>
                </div>
              </div>

              <div className="border-t border-slate-300 pt-2 flex justify-between text-[11px] italic text-slate-600">
                <div>Người làm bài cam kết (Ký, ghi rõ họ tên)</div>
                <div>Bảo vệ trực cổng xác nhận (Ký duyệt)</div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSafetyPaperModal(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Ra Máy In Bàn Bảo Vệ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL D: GỬI ĐÁNH GIÁ SUẤT ĂN CA HẰNG NGÀY (CANTEEN MEAL FEEDBACK) ════════════════════ */}
      {showMealFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Đánh Giá Bữa Ăn Ca Hôm Nay</h3>
              </div>
              <button onClick={() => setShowMealFeedbackModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMealFeedback} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ca Ăn Của Bạn:</label>
                  <select
                    value={newMealFeedback.shift}
                    onChange={e => setNewMealFeedback({ ...newMealFeedback, shift: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Ăn Ca Sáng (06:00 - 07:00)">Ăn Ca Sáng (06:00 - 07:00)</option>
                    <option value="Ăn Ca Trưa (11:30 - 12:30)">Ăn Ca Trưa (11:30 - 12:30)</option>
                    <option value="Ăn Ca Chiều (17:00 - 18:00)">Ăn Ca Chiều (17:00 - 18:00)</option>
                    <option value="Ăn Ca Đêm (23:00 - 00:00)">Ăn Ca Đêm (23:00 - 00:00)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mức Độ Hài Lòng Chung:</label>
                  <div className="flex items-center space-x-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewMealFeedback({ ...newMealFeedback, rating: star })}
                        className={`px-2 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                          newMealFeedback.rating >= star
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {star} ⭐
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hướng dẫn quy chuẩn đánh giá */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-[11px] text-amber-900">
                <p className="font-bold flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Hướng dẫn quy chuẩn phản hồi suất ăn:</span>
                </p>
                <p>• <b>Nội dung phù hợp:</b> Nêu rõ món ăn ngon, cơm dẻo, vệ sinh sạch sẽ, phục vụ tận tình.</p>
                <p>• <b>Nội dung chưa phù hợp:</b> Nêu rõ chi tiết món nào mặn/nhạt, nguội, thức ăn thiếu định lượng, hoặc thái độ phục vụ chưa tốt.</p>
                <p>• <b>Hình ảnh:</b> Bắt buộc chụp ảnh thực tế khay cơm ngay ngắn, rõ nét trên bàn ăn lưu trong điện thoại/máy tính để đối soát với nhà bếp.</p>
              </div>

              <div>
                <label className="font-bold text-emerald-800 block mb-1">
                  1. Mô Tả Nội Dung Phù Hợp (Hài Lòng):
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Cơm nóng dẻo, cá kho đượm vị, rau xào tươi ngon, bàn ăn lau sạch..."
                  value={newMealFeedback.positiveFeedback}
                  onChange={e => setNewMealFeedback({ ...newMealFeedback, positiveFeedback: e.target.value })}
                  className="w-full p-2.5 border border-emerald-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-emerald-50/20"
                />
              </div>

              <div>
                <label className="font-bold text-rose-800 block mb-1">
                  2. Chi Tiết Nội Dung Chưa Phù Hợp (Nếu có - Để bếp trưởng khắc phục):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Canh cải nấu hơi mặn, tráng miệng trái cây chưa chín, xếp hàng khay cơm bị chậm..."
                  value={newMealFeedback.negativeFeedback}
                  onChange={e => setNewMealFeedback({ ...newMealFeedback, negativeFeedback: e.target.value })}
                  className="w-full p-2.5 border border-rose-300 rounded-xl outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-rose-50/20"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-bold text-slate-800 text-[11.5px]">Xác nhận chụp ảnh khay cơm ngay ngắn:</p>
                    <p className="text-[10px] text-slate-500">Đã chụp ảnh thực tế bằng điện thoại làm bằng chứng đối chiếu</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newMealFeedback.photoConfirmed}
                  onChange={e => setNewMealFeedback({ ...newMealFeedback, photoConfirmed: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMealFeedbackModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Ý Kiến Đóng Góp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ── MODAL CAMERA AI OCR NHẬN DIỆN BIỂN SỐ XE TẠI CỔNG BẢO VỆ ── */}
      {showAnprModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-sm">Hệ Thống Camera AI OCR Nhận Diện Biển Số Cổng Bảo Vệ</h3>
              </div>
              <button
                onClick={() => setShowAnprModal(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {/* Mô phỏng màn hình camera cổng */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border-2 border-purple-500/50 p-4 text-white font-mono space-y-2">
                <div className="flex items-center justify-between text-[11px] text-emerald-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>LIVE CAM 01 - CỔNG BẢO VỆ SỐ 1</span>
                  </div>
                  <span>FPS: 30 • HD 1080P</span>
                </div>

                <div className="h-36 bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 border-2 border-dashed border-purple-400/40 m-4 rounded flex items-center justify-center">
                    <span className="text-[10px] text-purple-300/60 tracking-widest uppercase">KHUNG QUÉT BIỂN SỐ XE AI</span>
                  </div>
                  <div className="z-10 bg-black/80 px-4 py-2 rounded-lg border-2 border-emerald-400 shadow-lg text-center">
                    <p className="text-lg font-bold text-yellow-300 tracking-wider">
                      {showAnprModal.licensePlate}
                    </p>
                    <p className="text-[9.5px] text-emerald-400">✓ AI OCR MATCH: 99.8%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-white/5 p-2 rounded">
                  <div>
                    <span className="text-slate-400">Phương tiện:</span> {showAnprModal.vehicleModel}
                  </div>
                  <div>
                    <span className="text-slate-400">Màu sơn:</span> {showAnprModal.vehicleColor}
                  </div>
                  <div>
                    <span className="text-slate-400">Chủ xe:</span> {showAnprModal.empName}
                  </div>
                  <div>
                    <span className="text-slate-400">Cà vẹt:</span> {showAnprModal.registrationDoc}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-[11px]">
                  <b>Kết quả đối soát:</b> Biển số xe thực tế trước camera hoàn toàn trùng khớp với hồ sơ khai báo và giấy đăng ký phương tiện đã lưu trữ trong phần mềm!
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowAnprModal(null)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    alert('✓ Đã lưu lại ảnh chụp camera nhận diện biển số ' + showAnprModal.licensePlate + ' vào nhật ký bàn giao an ninh!');
                    setShowAnprModal(null);
                  }}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Lưu Ảnh Đối Soát An Ninh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KHAI BÁO MẤT THẺ XE ── */}
      {showLostCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileWarning className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-sm">Khai Báo Mất Thẻ Xe &amp; Đề Nghị Xuất Bến An Toàn</h3>
              </div>
              <button
                onClick={() => setShowLostCardModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newReport: LostParkingCardReport = {
                  id: `TX-2026-${String(lostParkingReports.length + 1).padStart(3, '0')}`,
                  empId: newLostCardForm.empId || 'AV-' + Math.floor(1000 + Math.random() * 9000),
                  empName: newLostCardForm.empName,
                  dept: newLostCardForm.dept,
                  licensePlate: newLostCardForm.licensePlate,
                  vehicleModel: newLostCardForm.vehicleModel,
                  vehicleColor: newLostCardForm.vehicleColor,
                  registrationDoc: newLostCardForm.registrationDoc,
                  parkingLocation: newLostCardForm.parkingLocation,
                  lostTime: newLostCardForm.lostTime || new Date().toLocaleString('vi-VN'),
                  reportDate: new Date().toLocaleDateString('vi-VN'),
                  witnessType: newLostCardForm.witnessType,
                  witnesses: newLostCardForm.witnessType === 'TWO_COWORKERS' ? [
                    { id: 'W1', name: newLostCardForm.witness1Name, empId: newLostCardForm.witness1EmpId || 'AV-W1', roleDesc: 'Đồng nghiệp xác nhận 1', confirmed: false, reasonNote: '' },
                    { id: 'W2', name: newLostCardForm.witness2Name, empId: newLostCardForm.witness2EmpId || 'AV-W2', roleDesc: 'Đồng nghiệp xác nhận 2', confirmed: false, reasonNote: '' }
                  ] : [
                    { id: 'W1', name: newLostCardForm.managerName, empId: newLostCardForm.managerEmpId || 'AV-MGR', roleDesc: 'Quản lý trực tiếp', confirmed: false, reasonNote: '' }
                  ],
                  securityGuardConfirmed: false,
                  status: 'WAITING_WITNESS'
                };
                setLostParkingReports(prev => [newReport, ...prev]);
                setShowLostCardModal(false);
              }}
              className="p-4 text-xs space-y-3 max-h-[85vh] overflow-y-auto"
            >
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                Quy trình an ninh: Sau khi gửi khai báo, hệ thống sẽ gửi yêu cầu xác nhận tới người làm chứng (2 đồng nghiệp hoặc Trưởng phòng). Bảo vệ cổng chỉ mở barie khi đã có chữ ký xác nhận số.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Họ tên nhân viên mất thẻ:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn A"
                    value={newLostCardForm.empName}
                    onChange={e => setNewLostCardForm({ ...newLostCardForm, empName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phòng ban / Phân xưởng:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Phân Xưởng Chế Biến"
                    value={newLostCardForm.dept}
                    onChange={e => setNewLostCardForm({ ...newLostCardForm, dept: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Biển số xe thực tế:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 59P2-431.88"
                    value={newLostCardForm.licensePlate}
                    onChange={e => setNewLostCardForm({ ...newLostCardForm, licensePlate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-600 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dòng xe &amp; Màu sơn:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Honda Vision 110 - Trắng bạc"
                    value={newLostCardForm.vehicleModel}
                    onChange={e => setNewLostCardForm({ ...newLostCardForm, vehicleModel: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Cà vẹt / Đăng ký xe:</label>
                  <input
                    type="text"
                    placeholder="VD: 098124/CA-Thủ Đức"
                    value={newLostCardForm.registrationDoc}
                    onChange={e => setNewLostCardForm({ ...newLostCardForm, registrationDoc: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vị trí đỗ &amp; Giờ mất:</label>
                  <input
                    type="text"
                    placeholder="VD: Bãi số 1 - Khoảng 17:30"
                    value={newLostCardForm.parkingLocation}
                    onChange={e => setNewLostCardForm({ ...newLostCardForm, parkingLocation: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Hình thức người làm chứng */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 block">Hình thức chứng nhận xuất xe:</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="witnessType"
                      checked={newLostCardForm.witnessType === 'TWO_COWORKERS'}
                      onChange={() => setNewLostCardForm({ ...newLostCardForm, witnessType: 'TWO_COWORKERS' })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium text-slate-700">2 Đồng nghiệp cùng ca</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="witnessType"
                      checked={newLostCardForm.witnessType === 'DEPT_HEAD'}
                      onChange={() => setNewLostCardForm({ ...newLostCardForm, witnessType: 'DEPT_HEAD' })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium text-slate-700">Trưởng bộ phận / Quản lý</span>
                  </label>
                </div>

                {newLostCardForm.witnessType === 'TWO_COWORKERS' ? (
                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Họ tên đồng nghiệp 1"
                        value={newLostCardForm.witness1Name}
                        onChange={e => setNewLostCardForm({ ...newLostCardForm, witness1Name: e.target.value, witness1EmpId: 'AV-0418' })}
                        className="w-full p-1.5 border border-slate-300 rounded-lg outline-none focus:border-amber-600"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Họ tên đồng nghiệp 2"
                        value={newLostCardForm.witness2Name}
                        onChange={e => setNewLostCardForm({ ...newLostCardForm, witness2Name: e.target.value, witness2EmpId: 'AV-0399' })}
                        className="w-full p-1.5 border border-slate-300 rounded-lg outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 border-t border-slate-200">
                    <label className="font-medium text-slate-600 block mb-0.5">Quản lý trực tiếp (Họ tên &amp; Chức vụ):</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Nguyễn Thị Mai Chi - Kế Toán Trưởng"
                      value={newLostCardForm.managerName}
                      onChange={e => setNewLostCardForm({ ...newLostCardForm, managerName: e.target.value, managerEmpId: 'AV-0120' })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg outline-none focus:border-amber-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLostCardModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Khai Báo Mất Thẻ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL XÁC NHẬN LÀM CHỨNG & BẮT BUỘC NHẬP LÝ DO ── */}
      {showWitnessConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-sm">Xác Nhận Làm Chứng Mất Thẻ Xe</h3>
              </div>
              <button
                onClick={() => setShowWitnessConfirmModal(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWitnessConfirmSubmit} className="p-4 space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <p className="font-bold">Nhân viên cần xác nhận: {showWitnessConfirmModal.report.empName} ({showWitnessConfirmModal.report.dept})</p>
                <p className="text-[11px] mt-0.5">Phương tiện: <b className="font-mono text-indigo-700">{showWitnessConfirmModal.report.licensePlate}</b> ({showWitnessConfirmModal.report.vehicleModel})</p>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Mô Tả Chi Tiết Lý Do Làm Chứng (BẮT BUỘC):
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Tôi cùng ca làm việc với bạn Tuấn, sáng nay 07:35 có đi gửi xe cùng lúc ở Bãi 1, thấy bạn đi đúng chiếc xe Wave xanh BKS 60B1-892.45 gửi đúng ô số 42..."
                  value={witnessInputReason}
                  onChange={e => setWitnessInputReason(e.target.value)}
                  className="w-full p-2.5 border border-amber-300 rounded-xl outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-amber-50/20 text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  * Lời khai làm chứng này sẽ được in trực tiếp trên Biên bản bàn giao gửi Đội An Ninh / Bảo vệ dịch vụ kiểm tra.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWitnessConfirmModal(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xác Nhận &amp; Lưu Lời Khai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL IN BIÊN BẢN MẤT THẺ XE & CAM KẾT BÀN GIAO CHO CÔNG TY BẢO VỆ ── */}
      {showPrintLostCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Mẫu Giấy: Biên Bản Báo Mất Thẻ Xe &amp; Cam Kết Nhận Phương Tiện (A4 Chuẩn)
                </h3>
              </div>
              <button
                onClick={() => setShowPrintLostCardModal(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif leading-relaxed text-slate-900 bg-white">

              <div className="flex items-center justify-between border-b pb-3">
                <div className="text-left">
                  <p className="font-bold text-sm uppercase">CÔNG TY CỔ PHẦN AN VIỆT FOODS</p>
                  <p className="font-bold text-xs uppercase text-slate-600">ĐỘI AN NINH - BẢO VỆ DỊCH VỤ NHÀ MÁY</p>
                  <h2 className="text-base font-bold uppercase mt-1 text-slate-900">
                    BIÊN BẢN XÁC NHẬN MẤT THẺ XE &amp; BÀN GIAO PHƯƠNG TIỆN
                  </h2>
                  <p className="text-[11px] italic text-slate-500">Mã biên bản: {showPrintLostCardModal.id} • Ngày lập: {showPrintLostCardModal.reportDate}</p>
                </div>
                <div className="flex items-center space-x-2 border border-slate-300 p-2 rounded-lg bg-slate-50 shrink-0">
                  <QrCode className="w-9 h-9 text-slate-800" />
                  <div className="text-[9px] leading-tight text-slate-600 text-left">
                    <p className="font-bold text-slate-900 uppercase">XÁC THỰC SỐ</p>
                    <p className="font-mono">VERIFY-{showPrintLostCardModal.id}</p>
                    <p className="text-emerald-700 font-semibold">✓ Chữ ký số bảo mật</p>
                  </div>
                </div>
              </div>


              <div className="space-y-1.5">
                <p><b>1. Người làm đơn báo mất:</b> Ông/Bà <b>{showPrintLostCardModal.empName}</b> - Mã NV: <b>{showPrintLostCardModal.empId}</b></p>
                <p>Bộ phận / Phân xưởng: <b>{showPrintLostCardModal.dept}</b></p>
                <p>Đặc điểm phương tiện: Biển số: <b className="text-indigo-800 font-mono text-sm">{showPrintLostCardModal.licensePlate}</b> • Loại xe: <b>{showPrintLostCardModal.vehicleModel}</b> ({showPrintLostCardModal.vehicleColor})</p>
                <p>Số Cà vẹt / Giấy đăng ký xe: <b>{showPrintLostCardModal.registrationDoc}</b> • Vị trí gửi: <b>{showPrintLostCardModal.parkingLocation}</b></p>
                <p>Thời gian phát hiện mất thẻ: <b>{showPrintLostCardModal.lostTime}</b></p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <p className="font-bold uppercase text-[11px] text-slate-800">2. Xác nhận của người làm chứng:</p>
                {showPrintLostCardModal.witnesses.map((w, idx) => (
                  <div key={w.id} className="text-[11.5px] border-b border-slate-200 pb-1.5 last:border-b-0">
                    <p>• <b>Người làm chứng {idx + 1}:</b> {w.name} ({w.roleDesc}) - Mã NV: {w.empId}</p>
                    <p className="italic text-slate-700">&ldquo;Lý do xác nhận: {w.reasonNote || 'Chưa ghi nhận lời khai'}&rdquo;</p>
                  </div>
                ))}
              </div>

              <div className="text-[11px] space-y-1 border-t pt-2">
                <p><b>3. Cam kết của người làm đơn:</b> Tôi xin cam kết những thông tin trên hoàn toàn đúng sự thật. Chiếc xe trên thuộc quyền sở hữu/sử dụng hợp pháp của tôi. Nếu có tranh chấp hoặc sai phạm, tôi xin hoàn toàn chịu trách nhiệm trước pháp luật và Ban Giám Đốc công ty.</p>
                <p><b>4. Xử lý thẻ cũ:</b> Đội bảo vệ tiến hành khóa vĩnh viễn mã thẻ xe cũ trên hệ thống phần mềm, chống trường hợp kẻ gian nhặt được đưa xe ra ngoài.</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center pt-4 mt-4 border-t">
                <div>
                  <p className="font-bold uppercase text-[11px]">Người Làm Chứng</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[11px]">Bảo Vệ Ca Trực</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Đã đối chiếu Cà vẹt &amp; Ký tên)</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[11px]">Người Làm Đơn</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Mẫu in chuẩn A4 bàn giao cho công ty bảo vệ dịch vụ lưu hồ sơ</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintLostCardModal(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Văn Bản Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thẻ Lấy Suất Ăn Ca (E-Meal Pass) được mở từ Khối 8.B */}
      <CanteenMealPassModal
        isOpen={showMealPassDirectModal}
        onClose={() => setShowMealPassDirectModal(false)}
        employees={employees}
      />

    </div>
  );
};
