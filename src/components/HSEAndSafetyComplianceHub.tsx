import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  ShieldAlert,
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  Flame,
  Wrench,
  GraduationCap,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  X,
  Printer,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  Sparkles,
  Users,
  Activity,
  Award,
  Calendar,
  Building,
  Check,
  CheckCheck,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  HardHat,
  Truck,
  Layers,
  Leaf,
  Wind,
  Volume2,
  Trash2,
  History,
  FileCheck2
} from 'lucide-react';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';

interface HSEAndSafetyComplianceHubProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
}

// 6 PHÂN HỆ AN TOÀN HSE & TUÂN THỦ
export type HSESubCategory =
  | 'LTI_AND_HIRA'          // 1. Chỉ số LTI & Ma trận nhận diện rủi ro HIRA (ISO 45001)
  | 'STRICT_EQUIPMENT'      // 2. Kiểm định thiết bị nghiêm ngặt về ATLĐ (TT 36/2019/TT-BLĐTBXH)
  | 'SAFETY_TRAINING'       // 3. Huấn luyện ATVSLĐ 6 nhóm đối tượng (Nghị định 44/2016/NĐ-CP)
  | 'FIRE_AND_ENV'          // 4. PCCC, Cứu nạn cứu hộ & Quan trắc môi trường lao động (Luật BVMT)
  | 'INCIDENTS_CAPA'        // 5. Sổ điều tra sự cố hiện trường & Hành động khắc phục CAPA
  | 'HSE_REPORTS';          // 6. Báo cáo tuân thủ HSE 360° & Xuất Excel 5 sheet

// Kiểu dữ liệu Ma trận Rủi ro HIRA
export interface HIRARiskItem {
  id: string;
  hazardName: string; // Tên mối nguy
  location: string;   // Khu vực
  riskCategory: 'CO_KHI' | 'DIEN' | 'HOA_CHAT' | 'ERGONOMICS' | 'CHAY_NO' | 'NGA_CAO';
  probability: number; // 1 - 5
  severity: number;    // 1 - 5
  riskScore: number;   // probability * severity (1 - 25)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  currentControls: string; // Biện pháp kiểm soát hiện tại
  actionPlan: string;      // Kế hoạch giảm thiểu rủi ro bổ sung
  responsiblePerson: string;
}

// Kiểu dữ liệu Thiết bị nghiêm ngặt cần kiểm định (TT 36/2019)
export interface StrictEquipmentItem {
  id: string;
  name: string;
  modelCode: string;
  equipmentType: 'CAU_TRUC' | 'NOI_HOI' | 'BINH_AP_LUC' | 'XE_NANG' | 'THANG_MAY' | 'HE_THONG_GAS';
  location: string;
  capacityLoad: string; // Tải trọng / Áp suất thử tải (VD: 10 Tấn, 12 Bar)
  inspectorOrg: string; // Đơn vị kiểm định
  certStampNumber: string; // Số tem kiểm định
  lastInspectionDate: string;
  nextInspectionDueDate: string;
  daysUntilExpiry: number;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED_LOCKED';
  operatorAssigned: string; // Người vận hành có chứng chỉ
}

// Kiểu dữ liệu Đào tạo ATVSLĐ 6 Nhóm (NĐ 44/2016)
export interface SafetyTrainingGroup {
  groupId: 'NHOM_1' | 'NHOM_2' | 'NHOM_3' | 'NHOM_4' | 'NHOM_5' | 'NHOM_6';
  groupName: string;
  targetAudience: string; // Đối tượng
  periodicity: string;    // Chu kỳ đào tạo (1 năm hay 2 năm)
  certificateType: string; // Giấy chứng nhận / Thẻ an toàn lao động
  totalRequired: number;  // Số lượng cần đào tạo
  totalCertified: number; // Đã cấp thẻ/chứng chỉ
  completionRate: number; // %
  lastCourseDate: string;
  nextPlannedCourse: string;
  trainingProvider: string; // Đơn vị đào tạo
}

// Kiểu dữ liệu Thiết bị PCCC & Quan trắc môi trường
export interface FireAndEnvItem {
  id: string;
  itemType: 'PCCC_EQUIPMENT' | 'ENVIRO_MONITORING' | 'HAZARDOUS_WASTE';
  name: string;
  location: string;
  specification: string;
  checkDate: string;
  nextDueDate: string;
  resultStatus: 'PASSED' | 'WARNING' | 'FAILED';
  details: string;
  responsibleStaff: string;
}

// Kiểu dữ liệu Sự cố hiện trường & Điều tra CAPA
export interface IncidentPerson {
  name: string;
  empId: string;
  dept: string;
  role: string;
}

export interface IncidentWitness {
  name: string;
  empId: string;
  dept: string;
  statement: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  incidentType: 'TAI_NAN_LAO_DONG' | 'NEAR_MISS' | 'HOA_HOAN_CHAY_NO' | 'HU_HONG_TAI_SAN' | 'VI_PHAM_KY_LUAT';
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
  capaDeadline: string;
  capaOwner: string;
  capaProgress: number; // 0 - 100%
}

export const HSEAndSafetyComplianceHub: React.FC<HSEAndSafetyComplianceHubProps> = ({
  policy,
  employees,
  currentRole
}) => {
  const [activeTab, setActiveTab] = useState<HSESubCategory>('LTI_AND_HIRA');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('ALL');
  const [selectedEquipStatusFilter, setSelectedEquipStatusFilter] = useState<string>('ALL');

  // Modals
  const [showAddIncidentModal, setShowAddIncidentModal] = useState(false);
  const [showPrintIncidentModal, setShowPrintIncidentModal] = useState<IncidentRecord | null>(null);

  // MOCK DATA 1: Ma trận nhận diện rủi ro HIRA 5x5
  const [hiraRisks, setHiraRisks] = useState<HIRARiskItem[]>([
    {
      id: 'HIRA-01',
      hazardName: 'Kẹp cán dập phôi kim loại tấm tại máy đột dập 150 tấn',
      location: 'Phân Xưởng Cơ Khí - Đột Dập A (Chuyền 1 & 2)',
      riskCategory: 'CO_KHI',
      probability: 3,
      severity: 5,
      riskScore: 15,
      riskLevel: 'HIGH',
      currentControls: 'Cảm biến quang học Safety Curtain kép, nút ấn 2 tay đồng thời (Two-Hand Control)',
      actionPlan: 'Lắp thêm rào chắn cơ khí liên động liên hoàn, kiểm tra cảm biến hằng ngày trước ca',
      responsiblePerson: 'Quản đốc Nguyễn Văn Dũng'
    },
    {
      id: 'HIRA-02',
      hazardName: 'Tiếp xúc hơi dung môi keo hữu cơ và sơn công nghiệp (VOCs)',
      location: 'Phân Xưởng Pha Chế Sơn & Dán Đế Giày',
      riskCategory: 'HOA_CHAT',
      probability: 4,
      severity: 3,
      riskScore: 12,
      riskLevel: 'HIGH',
      currentControls: 'Hệ thống hút mùi cục bộ, cấp phát mặt nạ than hoạt tính 3M 6200',
      actionPlan: 'Bảo trì hệ thống lọc than hoạt tính tháp sấy, khám tầm soát nồng độ chì/benzen định kỳ',
      responsiblePerson: 'Cán bộ HSE Trần Quốc Bảo'
    },
    {
      id: 'HIRA-03',
      hazardName: 'Rò rỉ điện nguồn 380V tại tủ phân phối động lực xưởng đúc',
      location: 'Trạm Biến Áp & Tủ Điện Phân Phối Tầng Trệt',
      riskCategory: 'DIEN',
      probability: 2,
      severity: 5,
      riskScore: 10,
      riskLevel: 'MEDIUM',
      currentControls: 'Thực hiện nghiêm ngặt quy trình LOTO (Lockout/Tagout), thảm cách điện 10kV',
      actionPlan: 'Đo kiểm điện trở nối đất chống sét định kỳ 6 tháng một lần đạt R < 4 Ohm',
      responsiblePerson: 'Kỹ sư Điện Vũ Đức Thịnh'
    },
    {
      id: 'HIRA-04',
      hazardName: 'Trơn trượt ngã do nước đọng và dầu mỡ tại khu vực rửa sơ chế',
      location: 'Căn Tin & Bếp Ăn Tập Thể Nhà Máy',
      riskCategory: 'ERGONOMICS',
      probability: 3,
      severity: 2,
      riskScore: 6,
      riskLevel: 'LOW',
      currentControls: 'Trải tấm lót sàn chống trượt cao su gân, biển cảnh báo sàn ướt',
      actionPlan: 'Cải tạo độ dốc rãnh thu nước sàn inox, cấp ủng cao su đế chống trượt SRC',
      responsiblePerson: 'Bếp trưởng Hoàng Văn Hùng'
    },
    {
      id: 'HIRA-05',
      hazardName: 'Nguy cơ rơi ngã khi bảo trì vệ sinh máng xối mái tôn nhà xưởng',
      location: 'Khu Vực Mái Nhà Xưởng Cao 12m',
      riskCategory: 'NGA_CAO',
      probability: 2,
      severity: 5,
      riskScore: 10,
      riskLevel: 'HIGH',
      currentControls: 'Dây đai an toàn toàn thân 2 móc chống sốc, lắp đặt dây cứu sinh tĩnh (Lifeline)',
      actionPlan: 'Bắt buộc cấp Giấy phép làm việc trên cao (Working at Height Permit) trước khi leo mái',
      responsiblePerson: 'Đội trưởng Bảo Trì Lê Văn Minh'
    }
  ]);

  // MOCK DATA 2: Thiết bị có yêu cầu nghiêm ngặt về ATLĐ (TT 36/2019/TT-BLĐTBXH)
  const [strictEquipments, setStrictEquipments] = useState<StrictEquipmentItem[]>([
    {
      id: 'EQ-001',
      name: 'Cầu Trục Dầm Đôi Nhà Xưởng Cơ Khí',
      modelCode: 'CRANE-DK-10T',
      equipmentType: 'CAU_TRUC',
      location: 'Phân Xưởng Cơ Khí A (Nhịp 24m)',
      capacityLoad: 'Tải trọng nâng an toàn SWL: 10.0 Tấn',
      inspectorOrg: 'Trung Tâm Kiểm Định KTATLĐ Khu Vực II',
      certStampNumber: 'KD-2025-CT-0988',
      lastInspectionDate: '2025-10-15',
      nextInspectionDueDate: '2026-10-15',
      daysUntilExpiry: 30,
      status: 'EXPIRING_SOON',
      operatorAssigned: 'Trần Văn Nam (Thẻ ATLĐ Nhóm 3)'
    },
    {
      id: 'EQ-002',
      name: 'Nồi Hơi Tầng Sôi Đốt Sinh Khối Mùn Cưa (Biomass)',
      modelCode: 'BOILER-TS-5T',
      equipmentType: 'NOI_HOI',
      location: 'Trạm Nồi Hơi Cung Cấp Hơi Hấp May B',
      capacityLoad: 'Công suất sinh hơi 5 Tấn/giờ, Áp suất 10 Bar',
      inspectorOrg: 'Công Ty CP Kiểm Định An Toàn Công Nghiệp',
      certStampNumber: 'KD-2025-NH-1120',
      lastInspectionDate: '2025-08-20',
      nextInspectionDueDate: '2026-08-20',
      daysUntilExpiry: -26,
      status: 'EXPIRED_LOCKED',
      operatorAssigned: 'Nguyễn Văn Hải (Chứng chỉ Vận hành Nồi hơi)'
    },
    {
      id: 'EQ-003',
      name: 'Bình Chịu Áp Lực Chứa Khí Nén Trung Tâm (V=3.000 Lít)',
      modelCode: 'TANK-KN-3000L',
      equipmentType: 'BINH_AP_LUC',
      location: 'Phòng Máy Nén Khí Trục Vít Khối Kỹ Thuật',
      capacityLoad: 'Dung tích 3m³, Áp suất làm việc Max 12.5 Bar',
      inspectorOrg: 'Trung Tâm Kiểm Định KTATLĐ Khu Vực II',
      certStampNumber: 'KD-2026-AL-0442',
      lastInspectionDate: '2026-03-10',
      nextInspectionDueDate: '2028-03-10',
      daysUntilExpiry: 541,
      status: 'VALID',
      operatorAssigned: 'Vũ Đức Thịnh (Kỹ thuật Cơ điện)'
    },
    {
      id: 'EQ-004',
      name: 'Xe Nâng Hàng Động Cơ Diesel Komatsu 3.5 Tấn',
      modelCode: 'FORKLIFT-KM-FD35',
      equipmentType: 'XE_NANG',
      location: 'Kho Thành Phẩm & Khu Vực Xuất Hàng Container',
      capacityLoad: 'Tải trọng nâng 3.5 Tấn, Chiều cao nâng 4.5m',
      inspectorOrg: 'Trung Tâm Kiểm Định Kỹ Thuật An Toàn GTVT',
      certStampNumber: 'KD-2026-XN-0219',
      lastInspectionDate: '2026-04-12',
      nextInspectionDueDate: '2027-04-12',
      daysUntilExpiry: 209,
      status: 'VALID',
      operatorAssigned: 'Lê Văn Tài (Chứng chỉ Lái xe nâng)'
    },
    {
      id: 'EQ-005',
      name: 'Thang Máy Tải Hàng Kèm Người (Cargo Lift 2.000kg)',
      modelCode: 'LIFT-CARGO-2000',
      equipmentType: 'THANG_MAY',
      location: 'Trục Thang Máy Xưởng May (Tầng 1 - Tầng 3)',
      capacityLoad: 'Tải trọng 2.000 kg, Vận tốc 0.5 m/s',
      inspectorOrg: 'Trung Tâm Kiểm Định KTATLĐ Khu Vực II',
      certStampNumber: 'KD-2026-TM-0871',
      lastInspectionDate: '2026-01-18',
      nextInspectionDueDate: '2027-01-18',
      daysUntilExpiry: 125,
      status: 'VALID',
      operatorAssigned: 'Nguyễn Thu Trang (Quản lý tầng hàng)'
    }
  ]);

  // MOCK DATA 3: Đào tạo ATVSLĐ 6 Nhóm (Nghị định 44/2016)
  const [trainingGroups, setTrainingGroups] = useState<SafetyTrainingGroup[]>([
    {
      groupId: 'NHOM_1',
      groupName: 'Nhóm 1: Người Làm Công Tác Quản Lý',
      targetAudience: 'Ban Giám Đốc, Giám đốc khối, Trưởng/Phó phòng ban, Quản đốc xưởng',
      periodicity: 'Định kỳ 2 năm / lần (Thời lượng 16 giờ)',
      certificateType: 'Giấy chứng nhận huấn luyện ATVSLĐ Nhóm 1',
      totalRequired: 35,
      totalCertified: 34,
      completionRate: 97.1,
      lastCourseDate: '2025-04-15',
      nextPlannedCourse: '2027-04-15',
      trainingProvider: 'Công Ty CP Huấn Luyện An Toàn Miền Nam'
    },
    {
      groupId: 'NHOM_2',
      groupName: 'Nhóm 2: Cán Bộ Chuyên Trách & Bán Chuyên Trách HSE',
      targetAudience: 'Cán bộ phòng HSE, Cán bộ kỹ thuật an toàn cơ điện, Giám sát viên',
      periodicity: 'Định kỳ 2 năm / lần (Thời lượng 48 giờ)',
      certificateType: 'Giấy chứng nhận huấn luyện nghiệp vụ HSE Nhóm 2',
      totalRequired: 8,
      totalCertified: 8,
      completionRate: 100.0,
      lastCourseDate: '2025-06-20',
      nextPlannedCourse: '2027-06-20',
      trainingProvider: 'Viện Khoa Học An Toàn Vệ Sinh Lao Động'
    },
    {
      groupId: 'NHOM_3',
      groupName: 'Nhóm 3: Lao Động Làm Công Việc Nghiêm Ngặt',
      targetAudience: 'Vận hành xe nâng, thợ hàn cắt, thợ điện, vào không gian kín, hóa chất',
      periodicity: 'Định kỳ 2 năm / lần (Thời lượng 24 giờ)',
      certificateType: 'Thẻ An Toàn Lao Động Nhóm 3 (Có đóng dấu đơn vị đào tạo)',
      totalRequired: 145,
      totalCertified: 142,
      completionRate: 97.9,
      lastCourseDate: '2025-09-10',
      nextPlannedCourse: '2026-10-15 (Lớp cấp mới & bổ sung)',
      trainingProvider: 'Trung Tâm An Toàn Lao Động Bình Dương'
    },
    {
      groupId: 'NHOM_4',
      groupName: 'Nhóm 4: Người Lao Động Phổ Thông',
      targetAudience: 'Công nhân may, đóng gói, phân loại hàng, tạp vụ, bảo vệ',
      periodicity: 'Định kỳ 1 năm / lần (Thời lượng 16 giờ)',
      certificateType: 'Sổ theo dõi huấn luyện an toàn lao động cơ sở',
      totalRequired: 650,
      totalCertified: 638,
      completionRate: 98.1,
      lastCourseDate: '2026-03-25',
      nextPlannedCourse: '2027-03-25',
      trainingProvider: 'Đào tạo nội bộ kết hợp Giảng viên ngoài'
    },
    {
      groupId: 'NHOM_5',
      groupName: 'Nhóm 5: Người Làm Công Tác Y Tế Cơ Sở',
      targetAudience: 'Bác sĩ, Y tá, Cán bộ phụ trách trạm xá nhà máy',
      periodicity: 'Định kỳ 2 năm / lần (Thời lượng 56 giờ)',
      certificateType: 'Giấy chứng nhận chuyên môn y tế lao động',
      totalRequired: 3,
      totalCertified: 3,
      completionRate: 100.0,
      lastCourseDate: '2025-05-18',
      nextPlannedCourse: '2027-05-18',
      trainingProvider: 'Trung Tâm Y Tế Dự Phòng Tỉnh'
    },
    {
      groupId: 'NHOM_6',
      groupName: 'Nhóm 6: Mạng Lưới An Toàn Vệ Sinh Viên (ATVSV)',
      targetAudience: 'An toàn vệ sinh viên tại từng tổ sản xuất xưởng cơ khí, may, kho',
      periodicity: 'Định kỳ 2 năm / lần (Thời lượng 4 giờ ngoài nội dung nhóm 4)',
      certificateType: 'Giấy chứng nhận An toàn vệ sinh viên cơ sở',
      totalRequired: 28,
      totalCertified: 28,
      completionRate: 100.0,
      lastCourseDate: '2025-03-20',
      nextPlannedCourse: '2027-03-20',
      trainingProvider: 'Ban Chấp Hành Công Đoàn phối hợp Phòng HSE'
    }
  ]);

  // MOCK DATA 4: PCCC & Quan trắc môi trường lao động
  const [fireAndEnvList, setFireAndEnvList] = useState<FireAndEnvItem[]>([
    {
      id: 'PCCC-01',
      itemType: 'PCCC_EQUIPMENT',
      name: 'Hệ Thống 120 Bình Chữa Cháy (Bột ABC 4kg & Khí CO2 MT3)',
      location: 'Bố trí tại các hộp vách tường toàn bộ nhà máy',
      specification: 'Áp suất kim đồng hồ chỉ vạch xanh, tem kiểm định PCCC hợp lệ',
      checkDate: '2026-08-30',
      nextDueDate: '2026-09-30',
      resultStatus: 'PASSED',
      details: 'Đã kiểm tra 120/120 bình, phát hiện 02 bình tụt áp tại Căn tin đã nạp sạc lại',
      responsibleStaff: 'Đội trưởng PCCC Bùi Văn Bình'
    },
    {
      id: 'PCCC-02',
      itemType: 'PCCC_EQUIPMENT',
      name: 'Cụm Máy Bơm Chữa Cháy Diesel Dự Phòng 150HP',
      location: 'Nhà Bơm Nước Chữa Cháy Cạnh Bể Nước Ngầm 500m³',
      specification: 'Khởi động tự động khi tụt áp đường ống dưới 6.0 Bar',
      checkDate: '2026-09-08',
      nextDueDate: '2026-09-15',
      resultStatus: 'PASSED',
      details: 'Test đề nổ động cơ diesel trong 15 giây lên áp 8.5 Bar ổn định',
      responsibleStaff: 'Kỹ sư Cơ Điện Vũ Đức Thịnh'
    },
    {
      id: 'ENV-01',
      itemType: 'ENVIRO_MONITORING',
      name: 'Báo Cáo Quan Trắc Môi Trường Lao Động Đợt 1 - 2026',
      location: 'Đo kiểm tại 36 điểm trong xưởng cơ khí, may và văn phòng',
      specification: 'Tiêu chuẩn QCVN 26/2016/BYT (Tiếng ồn) & QCVN 02/2019/BYT (Bụi)',
      checkDate: '2026-04-20',
      nextDueDate: '2026-10-20',
      resultStatus: 'PASSED',
      details: 'Nhiệt độ trung bình 28.5°C, tiếng ồn xưởng dập 82.5 dBA (< 85 dBA cho phép)',
      responsibleStaff: 'Trung Tâm Kiểm Soát Bệnh Tật CDC Tỉnh'
    },
    {
      id: 'ENV-02',
      itemType: 'HAZARDOUS_WASTE',
      name: 'Kho Lưu Giữ Chất Thải Nguy Hại (CTNH) & Sổ Nguồn Thải',
      location: 'Khu Vực Riêng Biệt Phía Sau Nhà Xưởng 2',
      specification: 'Giẻ lau dính dầu (Mã CTNH: 18 02 01), Bùn thải xử lý nước thải',
      checkDate: '2026-08-25',
      nextDueDate: '2026-09-25',
      resultStatus: 'WARNING',
      details: 'Tồn đọng 850kg giẻ lau dầu mỡ, cần xuất giao cho Cty Môi Trường Xanh xử lý trong tuần tới',
      responsibleStaff: 'Cán bộ Quản lý Môi trường Lê Thị Mai'
    }
  ]);

  // MOCK DATA 5: Sổ điều tra sự cố & CAPA
  const [incidents, setIncidents] = useState<IncidentRecord[]>([
    {
      id: 'SC-2026-001',
      title: 'Tai nạn lao động nhẹ va quẹt góc máy đóng gói tự động',
      incidentDate: '2026-08-25',
      incidentTime: '14:20',
      location: 'Chuyền Đóng Gói 02 - Phân Xưởng May & Đóng Gói B',
      incidentType: 'TAI_NAN_LAO_DONG',
      typeName: 'Tai Nạn Lao Động',
      severity: 'MEDIUM',
      severityName: 'Mức Trung Bình',
      involvedPersons: [
        { name: 'Hoàng Văn Tuấn', empId: 'AF-045', dept: 'Xưởng Đóng Gói', role: 'Nạn nhân (rách da mu bàn tay)' }
      ],
      witnesses: [
        { name: 'Đỗ Thị Lan', empId: 'AF-048', dept: 'Xưởng Đóng Gói', statement: 'Anh Tuấn cúi xuống gỡ cuộn màng bọc khi máy chưa dừng hẳn, va quẹt vào góc thép bảo vệ.' },
        { name: 'Vũ Đức Thịnh', empId: 'AF-039', dept: 'Bảo Trì Cơ Điện', statement: 'Tôi nghe tiếng kêu ngắt máy khẩn cấp ngay lập tức và bấm nút E-Stop hỗ trợ đưa anh Tuấn ra Trạm Y tế.' }
      ],
      immediateAction: 'Sơ cứu băng bó tại Trạm Y tế công ty, đưa đến Bệnh viện Đa khoa khâu 3 mũi, sức khỏe ổn định.',
      rootCause: 'Thao tác xử lý kẹt cuộn màng khi chưa ngắt nguồn hoàn toàn (vi phạm quy trình LOTO ngắt điện).',
      correctiveAction: 'Gia cố thêm cảm biến quang học ngắt máy tự động khi mở cửa nắp, tái đào tạo quy trình LOTO cho toàn tổ.',
      status: 'RESOLVED',
      statusName: 'Đã giải quyết & Khắc phục',
      investigator: 'Ban An Toàn HSE & Quản Đốc Phân Xưởng',
      capaDeadline: '2026-09-05',
      capaOwner: 'Kỹ sư Cơ Điện Vũ Đức Thịnh',
      capaProgress: 100
    },
    {
      id: 'SC-2026-002',
      title: 'Tình huống suýt bị nạn (Near-Miss) rơi tấm phôi thép cạnh lối đi',
      incidentDate: '2026-08-28',
      incidentTime: '09:45',
      location: 'Hành Lang Lối Đi Phân Xưởng Cơ Khí - Đột Dập A',
      incidentType: 'NEAR_MISS',
      typeName: 'Suýt Bị Nạn (Near-Miss)',
      severity: 'LOW',
      severityName: 'Mức Cảnh Báo',
      involvedPersons: [
        { name: 'Lê Văn Tài', empId: 'AF-045', dept: 'Kho Vận & Logistics', role: 'Người phát hiện sự cố' }
      ],
      witnesses: [
        { name: 'Nguyễn Văn Long', empId: 'AF-002', dept: 'Xưởng Dập A', statement: 'Kiện phôi xếp chồng quá cao nghiêng nhẹ rớt 1 tấm xuống sàn may mắn không trúng ai.' }
      ],
      immediateAction: 'Rào chắn khu vực, dùng xe nâng hạ bớt chiều cao các pallet phôi thép xuống dưới 1.2m.',
      rootCause: 'Xếp dỡ pallet quá định mức chiều cao cho phép trong khu vực lưu thông công nhân.',
      correctiveAction: 'Vẽ vạch sơn giới hạn chiều cao xếp hàng trên tường xưởng, ban hành hướng dẫn xếp hàng an toàn.',
      status: 'RESOLVED',
      statusName: 'Đã khắc phục hoàn toàn',
      investigator: 'Cán bộ HSE Trần Quốc Bảo',
      capaDeadline: '2026-09-01',
      capaOwner: 'Trưởng Kho Lê Văn Tài',
      capaProgress: 100
    },
    {
      id: 'SC-2026-003',
      title: 'Khói bốc lên từ ổ cắm điện máy hàn tại khu vực gia công khuôn',
      incidentDate: '2026-09-05',
      incidentTime: '16:30',
      location: 'Khu Vực Tổ Khuôn Mẫu - Xưởng Dập A',
      incidentType: 'HOA_HOAN_CHAY_NO',
      typeName: 'Sự Cố Cháy Nổ Nhẹ',
      severity: 'HIGH',
      severityName: 'Mức Nghiêm Trọng',
      involvedPersons: [
        { name: 'Phạm Hùng Cường', empId: 'AF-018', dept: 'Tổ Khuôn Mẫu', role: 'Thợ hàn thao tác' }
      ],
      witnesses: [
        { name: 'Bùi Văn Bình', empId: 'AF-SEC1', dept: 'Đội Bảo Vệ An Ninh', statement: 'Tôi phát hiện mùi khét khi tuần tra ca chiều, lập tức dùng bình CO2 dập tắt tia lửa tại ổ cắm.' }
      ],
      immediateAction: 'Ngắt cầu dao điện tổng phân xưởng, dùng 01 bình khí CO2 MT3 dập tắt hoàn toàn trong 30 giây.',
      rootCause: 'Dây cáp nguồn máy hàn bị dập nát vỏ bọc cách điện gây chập đoản mạch cục bộ.',
      correctiveAction: 'Thay toàn bộ ổ cắm công nghiệp chống cháy IP67, kiểm tra toàn bộ máy hàn trong xưởng trước khi cấp điện lại.',
      status: 'DISCIPLINARY',
      statusName: 'Đang triển khai CAPA',
      investigator: 'Đội Trưởng An Ninh & Kỹ Sư Điện',
      capaDeadline: '2026-09-20',
      capaOwner: 'Kỹ sư Điện Vũ Đức Thịnh',
      capaProgress: 70
    }
  ]);

  // STATE FORM: Ghi nhận sự cố mới
  const [newIncidentForm, setNewIncidentForm] = useState({
    title: '',
    incidentDate: new Date().toISOString().slice(0, 10),
    incidentTime: '10:00',
    location: 'Phân Xưởng Cơ Khí A',
    incidentType: 'TAI_NAN_LAO_DONG' as const,
    severity: 'MEDIUM' as const,
    involvedPersonName: 'Nguyễn Văn Long',
    involvedPersonEmpId: 'AF-002',
    involvedPersonDept: 'Khối Sản Xuất',
    involvedPersonRole: 'Người trực tiếp thao tác',
    witnessName: 'Trần Văn Thành',
    witnessDept: 'Khối Kỹ Thuật',
    witnessStatement: '',
    immediateAction: '',
    rootCause: '',
    correctiveAction: '',
    investigator: 'Cán bộ HSE & Quản đốc',
    capaDeadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    capaOwner: 'Quản Đốc Phân Xưởng'
  });

  // KPI STATS TÍNH TOÁN TỔNG HỢP
  const kpiStats = useMemo(() => {
    const ltiDays = 418;
    const safeManHours = 2450000;
    const expiredEquipments = strictEquipments.filter(e => e.status === 'EXPIRED_LOCKED').length;
    const expiringSoonEquipments = strictEquipments.filter(e => e.status === 'EXPIRING_SOON').length;
    const avgTrainingRate = (trainingGroups.reduce((sum, g) => sum + g.completionRate, 0) / trainingGroups.length).toFixed(1);
    const totalIncidents = incidents.length;
    const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED').length;
    const capaResolutionRate = ((resolvedIncidents / (totalIncidents || 1)) * 100).toFixed(0);

    return {
      ltiDays,
      safeManHours,
      expiredEquipments,
      expiringSoonEquipments,
      avgTrainingRate,
      totalIncidents,
      resolvedIncidents,
      capaResolutionRate
    };
  }, [strictEquipments, trainingGroups, incidents]);

  // FILTERED LISTS
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchSearch =
        inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.involvedPersons.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchSev = selectedSeverityFilter === 'ALL' || inc.severity === selectedSeverityFilter;
      return matchSearch && matchSev;
    });
  }, [incidents, searchTerm, selectedSeverityFilter]);

  const filteredEquipments = useMemo(() => {
    return strictEquipments.filter(eq => {
      const matchSearch =
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.certStampNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedEquipStatusFilter === 'ALL' || eq.status === selectedEquipStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [strictEquipments, searchTerm, selectedEquipStatusFilter]);

  // HÀM XUẤT EXCEL 5 SHEET TỰ ĐỘNG
  const handleExportExcel5Sheets = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Chỉ số LTI & HIRA Matrix
    const ws1Data = hiraRisks.map((r, idx) => ({
      STT: idx + 1,
      'Mã Mối Nguy': r.id,
      'Tên Mối Nguy Hiện Trường': r.hazardName,
      'Khu Vực Phát Sinh': r.location,
      'Phân Loại Rủi Ro': r.riskCategory,
      'Khả Năng Xảy Ra (P)': r.probability,
      'Mức Độ Hậu Quả (S)': r.severity,
      'Điểm Rủi Ro (RxS)': r.riskScore,
      'Cấp Độ Rủi Ro': r.riskLevel === 'CRITICAL' ? 'Cực Kỳ Nghiêm Trọng' : r.riskLevel === 'HIGH' ? 'Cao' : r.riskLevel === 'MEDIUM' ? 'Trung Bình' : 'Thấp',
      'Biện Pháp Kiểm Soát Hiện Tại': r.currentControls,
      'Kế Hoạch Giảm Thiểu Rủi Ro': r.actionPlan,
      'Người Chịu Trách Nhiệm': r.responsiblePerson
    }));
    const ws1 = XLSX.utils.json_to_sheet(ws1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Chi_So_An_Toan_LTI_Va_HIRA');

    // Sheet 2: Thiết bị có yêu cầu nghiêm ngặt (TT 36/2019)
    const ws2Data = strictEquipments.map((e, idx) => ({
      STT: idx + 1,
      'Mã Thiết Bị': e.id,
      'Tên Thiết Bị / Máy': e.name,
      'Model / Ký Hiệu': e.modelCode,
      'Loại Thiết Bị': e.equipmentType,
      'Vị Trí Lắp Đặt': e.location,
      'Thông Số Thử Tải / Áp Suất': e.capacityLoad,
      'Đơn Vị Kiểm Định': e.inspectorOrg,
      'Số Tem Kiểm Định': e.certStampNumber,
      'Ngày Kiểm Định': e.lastInspectionDate,
      'Hạn Kiểm Định Kế Tiếp': e.nextInspectionDueDate,
      'Số Ngày Còn Lại': e.daysUntilExpiry,
      'Tình Trạng Vận Hành': e.status === 'VALID' ? 'Đủ điều kiện hoạt động' : e.status === 'EXPIRING_SOON' ? 'Sắp đến hạn kiểm định' : 'HẾT HẠN - KHÓA NIÊM PHONG',
      'Người Vận Hành Phụ Trách': e.operatorAssigned
    }));
    const ws2 = XLSX.utils.json_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Kiem_Dinh_Thiet_Bi_Nghiem_Ngat');

    // Sheet 3: Huấn luyện ATVSLĐ 6 nhóm (NĐ 44)
    const ws3Data = trainingGroups.map((g, idx) => ({
      STT: idx + 1,
      'Nhóm Đối Tượng': g.groupId,
      'Tên Nhóm Huấn Luyện': g.groupName,
      'Đối Tượng Áp Dụng': g.targetAudience,
      'Quy Định Chu Kỳ': g.periodicity,
      'Loại Chứng Chỉ / Thẻ': g.certificateType,
      'Số Lượng Cần Đào Tạo': g.totalRequired,
      'Thực Tế Đã Đạt Chuẩn': g.totalCertified,
      'Tỷ Lệ Hoàn Thành (%)': `${g.completionRate}%`,
      'Khóa Huấn Luyện Gần Nhất': g.lastCourseDate,
      'Kế Hoạch Khóa Tiếp Theo': g.nextPlannedCourse,
      'Đơn Vị Huấn Luyện': g.trainingProvider
    }));
    const ws3 = XLSX.utils.json_to_sheet(ws3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'Huan_Luyen_ATVSLD_6_Nhom');

    // Sheet 4: PCCC & Quan trắc môi trường
    const ws4Data = fireAndEnvList.map((f, idx) => ({
      STT: idx + 1,
      'Mã Hạng Mục': f.id,
      'Phân Loại': f.itemType === 'PCCC_EQUIPMENT' ? 'Trang Thiết Bị PCCC' : f.itemType === 'ENVIRO_MONITORING' ? 'Quan Trắc Môi Trường' : 'Chất Thải Nguy Hại (CTNH)',
      'Tên Hạng Mục': f.name,
      'Vị Trí Hiện Trường': f.location,
      'Quy Chuẩn Đo Kiểm / Tiêu Chuẩn': f.specification,
      'Ngày Kiểm Tra': f.checkDate,
      'Kỳ Tới': f.nextDueDate,
      'Đánh Giá': f.resultStatus === 'PASSED' ? 'Đạt Chuẩn QCVN' : f.resultStatus === 'WARNING' ? 'Cảnh Báo Cần Khắc Phục' : 'Không Đạt',
      'Chi Tiết Hiện Trường': f.details,
      'Cán Bộ Phụ Trách': f.responsibleStaff
    }));
    const ws4 = XLSX.utils.json_to_sheet(ws4Data);
    XLSX.utils.book_append_sheet(wb, ws4, 'Quan_Trac_Moi_Truong_PCCC');

    // Sheet 5: Sổ điều tra sự cố & CAPA
    const ws5Data = incidents.map((i, idx) => ({
      STT: idx + 1,
      'Mã Hồ Sơ': i.id,
      'Tên Sự Cố / Vụ Việc': i.title,
      'Thời Gian Phát Sinh': `${i.incidentDate} ${i.incidentTime}`,
      'Địa Điểm Hiện Trường': i.location,
      'Phân Loại Sự Cố': i.typeName,
      'Mức Độ Nghiêm Trọng': i.severityName,
      'Người Liên Quan': i.involvedPersons.map(p => `${p.name} (${p.empId})`).join(', '),
      'Xử Lý Tức Thời': i.immediateAction,
      'Nguyên Nhân Gốc Rễ': i.rootCause,
      'Hành Động Khắc Phục (CAPA)': i.correctiveAction,
      'Hạn Chót CAPA': i.capaDeadline,
      'Người Chịu Trách Nhiệm CAPA': i.capaOwner,
      'Tiến Độ CAPA (%)': `${i.capaProgress}%`,
      'Trạng Thái Hồ Sơ': i.statusName,
      'Đơn Vị Điều Tra': i.investigator
    }));
    const ws5 = XLSX.utils.json_to_sheet(ws5Data);
    XLSX.utils.book_append_sheet(wb, ws5, 'Dieu_Tra_Su_Co_Va_CAPA');

    XLSX.writeFile(wb, `Bao_Cao_ATVSLD_HSE_Compliance_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // HÀM SUBMIT SỰ CỐ MỚI
  const handleAddNewIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const typeNames: Record<string, string> = {
      TAI_NAN_LAO_DONG: 'Tai Nạn Lao Động',
      NEAR_MISS: 'Suýt Bị Nạn (Near-Miss)',
      HOA_HOAN_CHAY_NO: 'Sự Cố Cháy Nổ',
      HU_HONG_TAI_SAN: 'Hư Hỏng Tài Sản',
      VI_PHAM_KY_LUAT: 'Vi Phạm Kỷ Luật ATLĐ'
    };

    const severityNames: Record<string, string> = {
      LOW: 'Mức Cảnh Báo',
      MEDIUM: 'Mức Trung Bình',
      HIGH: 'Mức Nghiêm Trọng',
      CRITICAL: 'Cực Kỳ Nghiêm Trọng'
    };

    const newInc: IncidentRecord = {
      id: `SC-2026-${String(incidents.length + 1).padStart(3, '0')}`,
      title: newIncidentForm.title,
      incidentDate: newIncidentForm.incidentDate,
      incidentTime: newIncidentForm.incidentTime,
      location: newIncidentForm.location,
      incidentType: newIncidentForm.incidentType,
      typeName: typeNames[newIncidentForm.incidentType] || 'Sự Cố Khác',
      severity: newIncidentForm.severity,
      severityName: severityNames[newIncidentForm.severity] || 'Cảnh Báo',
      involvedPersons: [
        {
          name: newIncidentForm.involvedPersonName,
          empId: newIncidentForm.involvedPersonEmpId,
          dept: newIncidentForm.involvedPersonDept,
          role: newIncidentForm.involvedPersonRole
        }
      ],
      witnesses: newIncidentForm.witnessName ? [
        {
          name: newIncidentForm.witnessName,
          empId: 'NV-CHUNG',
          dept: newIncidentForm.witnessDept,
          statement: newIncidentForm.witnessStatement || 'Đã chứng kiến sự việc xảy ra tại hiện trường.'
        }
      ] : [],
      immediateAction: newIncidentForm.immediateAction || 'Đã cô lập hiện trường và sơ cứu ban đầu.',
      rootCause: newIncidentForm.rootCause || 'Đang tiến hành phân tích nguyên nhân kỹ thuật.',
      correctiveAction: newIncidentForm.correctiveAction || 'Lập kế hoạch khắc phục và huấn luyện lại.',
      status: 'INVESTIGATING',
      statusName: 'Đang điều tra & Lập CAPA',
      investigator: newIncidentForm.investigator,
      capaDeadline: newIncidentForm.capaDeadline,
      capaOwner: newIncidentForm.capaOwner,
      capaProgress: 20
    };

    setIncidents([newInc, ...incidents]);
    setShowAddIncidentModal(false);
  };

  return (
    <div className="space-y-1.5 animate-in fade-in duration-300">
      {/* ════════════════════ BANNER CHỈ SỐ AN TOÀN LAO ĐỘNG LTI & OSHA ════════════════════ */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-2xl p-2 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-emerald-800/40">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shadow-inner">
            <ShieldAlert className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                Chỉ Số An Toàn Lao Động, Môi Trường (HSE) &amp; Tuân Thủ Pháp Luật
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">
                ISO 45001 &amp; ISO 14001
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Đếm ngày an toàn LTI, ma trận rủi ro HIRA, kiểm định thiết bị nghiêm ngặt, đào tạo 6 nhóm &amp; điều tra CAPA
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddIncidentModal(true)}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi Nhận Sự Cố / Vi Phạm</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel5Sheets}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center space-x-1.5 border border-white/15 cursor-pointer"
            title="Xuất 5 sheet báo cáo Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Xuất Excel 5 Sheet</span>
          </button>
        </div>
      </div>

      {/* ════════════════════ 4 ĐỒNG HỒ KPI AN TOÀN LAO ĐỘNG ════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* KPI 1: Ngày an toàn LTI */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ngày An Toàn LTI:</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-amber-500 font-mono">{kpiStats.ltiDays} Ngày 🛡️</span>
              <span className="text-[10px] text-emerald-600 font-bold">Không TNLĐ nặng</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Giờ công an toàn */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Giờ Công An Toàn:</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-slate-900 font-mono">2.450.000 h</span>
              <span className="text-[10px] text-teal-600 font-semibold">Tích lũy 2026</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Kiểm định thiết bị nghiêm ngặt */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Thiết Bị Nghiêm Ngặt:</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-rose-600 font-mono">{kpiStats.expiredEquipments}</span>
              <span className="text-[10px] text-slate-500 font-medium">hết hạn ({kpiStats.expiringSoonEquipments} sắp đến hạn)</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Đào tạo 6 nhóm & Tỷ lệ giải quyết CAPA */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Đào Tạo &amp; Khắc Phục CAPA:</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-blue-700 font-mono">{kpiStats.avgTrainingRate}%</span>
              <span className="text-[10px] text-emerald-600 font-semibold">({kpiStats.capaResolutionRate}% CAPA xong)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════ 6 NÚT TABS PHÂN HỆ HSE ════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center space-x-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollable-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('LTI_AND_HIRA')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'LTI_AND_HIRA'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>1. Chỉ Số LTI &amp; Ma Trận Rủi Ro (HIRA)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STRICT_EQUIPMENT')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'STRICT_EQUIPMENT'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-200" />
            <span>2. Kiểm Định Thiết Bị Nghiêm Ngặt (TT 36)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SAFETY_TRAINING')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'SAFETY_TRAINING'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-200" />
            <span>3. Huấn Luyện ATVSLĐ 6 Nhóm (NĐ 44)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FIRE_AND_ENV')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'FIRE_AND_ENV'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>4. PCCC, Cứu Nạn &amp; Môi Trường (Luật BVMT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('INCIDENTS_CAPA')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'INCIDENTS_CAPA'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-200" />
            <span>5. Sổ Điều Tra Sự Cố Hiện Trường &amp; CAPA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HSE_REPORTS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'HSE_REPORTS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-200" />
            <span>6. Báo Cáo HSE 360° &amp; Xuất Excel</span>
          </button>
        </div>

        {/* ════════════════════ TAB 1: CHỈ SỐ LTI & MA TRẬN HIRA ════════════════════ */}
        {activeTab === 'LTI_AND_HIRA' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Thẻ hướng dẫn HIRA Matrix */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-950">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold">Ma trận nhận diện mối nguy &amp; đánh giá rủi ro HIRA 5x5 (ISO 45001:2018):</b>
                <p className="text-[11px] text-emerald-900 mt-0.5">
                  • <b>Điểm Rủi Ro (R) = Khả năng xảy ra (P: 1-5) &times; Mức độ hậu quả (S: 1-5)</b>.<br />
                  • Phân loại: 🔴 <b>Cực kỳ nghiêm trọng (15 - 25 điểm)</b>: Bắt buộc dừng máy hoặc rào chắn liên động ngay; 🟡 <b>Trung bình (8 - 14 điểm)</b>: Lập kế hoạch CAPA kiểm soát kỹ thuật; 🟢 <b>Thấp (&lt; 8 điểm)</b>: Kiểm soát bằng PPE và quy trình vận hành.
                </p>
              </div>
            </div>

            {/* Bảng ma trận HIRA */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5">Mã &amp; Mối Nguy Hiện Trường</th>
                    <th className="px-3 py-2.5">Khu Vực Phân Xưởng</th>
                    <th className="px-3 py-2.5 text-center">Phân Loại</th>
                    <th className="px-3 py-2.5 text-center">P &times; S</th>
                    <th className="px-3 py-2.5 text-center">Cấp Độ Rủi Ro</th>
                    <th className="px-3 py-2.5">Biện Pháp Kiểm Soát Kỹ Thuật</th>
                    <th className="px-3 py-2.5">Kế Hoạch Giảm Thiểu Bổ Sung</th>
                    <th className="px-3 py-2.5">Phụ Trách</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hiraRisks.map(risk => (
                    <tr key={risk.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 max-w-xs">
                        <div className="font-mono text-[10px] font-bold text-slate-400">{risk.id}</div>
                        <div className="font-bold text-slate-900 text-xs">{risk.hazardName}</div>
                      </td>

                      <td className="px-3 py-2.5 text-slate-600 font-medium">
                        {risk.location}
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {risk.riskCategory}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-center font-mono font-bold text-xs whitespace-nowrap">
                        <span className="text-slate-500">{risk.probability} &times; {risk.severity} = </span>
                        <b className="text-slate-900 text-sm">{risk.riskScore}</b>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        {risk.riskLevel === 'HIGH' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            🔴 Rủi Ro Cao ({risk.riskScore})
                          </span>
                        ) : risk.riskLevel === 'MEDIUM' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            🟡 Trung Bình ({risk.riskScore})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            🟢 Thấp ({risk.riskScore})
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-[11px] text-slate-700 max-w-xs">
                        • {risk.currentControls}
                      </td>

                      <td className="px-3 py-2.5 text-[11px] text-teal-800 font-medium max-w-xs">
                        • {risk.actionPlan}
                      </td>

                      <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                        {risk.responsiblePerson}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 2: KIỂM ĐỊNH THIẾT BỊ NGHIÊM NGẶT ════════════════════ */}
        {activeTab === 'STRICT_EQUIPMENT' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Bộ lọc thiết bị */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên máy, mã số tem kiểm định, xưởng..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-medium">Tình trạng kiểm định:</span>
                <select
                  value={selectedEquipStatusFilter}
                  onChange={e => setSelectedEquipStatusFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
                >
                  <option value="ALL">Tất cả trạng thái thiết bị</option>
                  <option value="VALID">🟢 Còn hạn kiểm định</option>
                  <option value="EXPIRING_SOON">🟡 Sắp hết hạn (&lt; 30 ngày)</option>
                  <option value="EXPIRED_LOCKED">🔴 Quá hạn - Khóa niêm phong</option>
                </select>
              </div>
            </div>

            {/* Bảng thiết bị kiểm định */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5">Thiết Bị / Máy Móc</th>
                    <th className="px-3 py-2.5">Vị Trí &amp; Thông Số Tải Trọng</th>
                    <th className="px-3 py-2.5">Đơn Vị &amp; Số Tem Kiểm Định</th>
                    <th className="px-3 py-2.5">Hạn Kiểm Định Kế Tiếp</th>
                    <th className="px-3 py-2.5 text-center">Tình Trạng Vận Hành</th>
                    <th className="px-3 py-2.5">Người Vận Hành Có Chứng Chỉ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEquipments.map(eq => (
                    <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900 text-xs">{eq.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{eq.id} • Model: {eq.modelCode}</div>
                      </td>

                      <td className="px-3 py-2.5 text-[11px]">
                        <div className="font-semibold text-slate-800">📍 {eq.location}</div>
                        <div className="text-teal-700 font-mono text-[10px]">{eq.capacityLoad}</div>
                      </td>

                      <td className="px-3 py-2.5 text-[11px]">
                        <div className="font-mono font-bold text-slate-800">{eq.certStampNumber}</div>
                        <div className="text-[10px] text-slate-400">{eq.inspectorOrg}</div>
                      </td>

                      <td className="px-3 py-2.5 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">{eq.nextInspectionDueDate}</div>
                        <div className={`text-[10px] font-bold ${
                          eq.daysUntilExpiry < 0
                            ? 'text-rose-600'
                            : eq.daysUntilExpiry <= 30
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}>
                          {eq.daysUntilExpiry < 0 ? `Quá hạn ${Math.abs(eq.daysUntilExpiry)} ngày` : `Còn ${eq.daysUntilExpiry} ngày`}
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        {eq.status === 'VALID' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Đủ điều kiện vận hành
                          </span>
                        ) : eq.status === 'EXPIRING_SOON' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                            ⚠️ Sắp hết hạn kiểm định
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 font-black animate-pulse">
                            ⛔ KHÓA NIÊM PHONG
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-[11px] font-medium text-slate-700">
                        👤 {eq.operatorAssigned}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 3: HUẤN LUYỆN ATVSLĐ 6 NHÓM ════════════════════ */}
        {activeTab === 'SAFETY_TRAINING' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Grid 6 nhóm huấn luyện theo NĐ 44/2016/NĐ-CP */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {trainingGroups.map(group => (
                <div key={group.groupId} className="bg-white rounded-xl border border-slate-200 p-2 space-y-3 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {group.groupId}
                      </span>
                      <span className="font-mono font-bold text-xs text-emerald-600">
                        {group.totalCertified}/{group.totalRequired} người ({group.completionRate}%)
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs leading-snug">
                      {group.groupName}
                    </h4>

                    <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg">
                      <div>• <b>Đối tượng:</b> {group.targetAudience}</div>
                      <div>• <b>Thời hạn:</b> {group.periodicity}</div>
                      <div>• <b>Chứng từ:</b> {group.certificateType}</div>
                    </div>

                    {/* Thanh tiến độ */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Tỷ lệ hoàn thành đào tạo:</span>
                        <b className="text-slate-900 font-mono">{group.completionRate}%</b>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            group.completionRate >= 98 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${group.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-0.5">
                    <div>Lớp gần nhất: <b className="font-mono text-slate-700">{group.lastCourseDate}</b></div>
                    <div>Kế hoạch tới: <b className="text-indigo-700 font-mono">{group.nextPlannedCourse}</b></div>
                    <div className="truncate">Đơn vị: <i>{group.trainingProvider}</i></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 4: PCCC & MÔI TRƯỜNG LAO ĐỘNG ════════════════════ */}
        {activeTab === 'FIRE_AND_ENV' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Grid PCCC & Môi trường */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
              {fireAndEnvList.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-2 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${
                        item.itemType === 'PCCC_EQUIPMENT'
                          ? 'bg-rose-50 text-rose-600'
                          : item.itemType === 'ENVIRO_MONITORING'
                          ? 'bg-teal-50 text-teal-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.itemType === 'PCCC_EQUIPMENT' ? (
                          <Flame className="w-5 h-5" />
                        ) : item.itemType === 'ENVIRO_MONITORING' ? (
                          <Wind className="w-5 h-5" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{item.id}</span>
                        <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.resultStatus === 'PASSED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}>
                      {item.resultStatus === 'PASSED' ? '✓ Đạt Chuẩn QCVN' : '⚠️ Cần Khắc Phục'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>📍 <b>Vị trí:</b> {item.location}</div>
                    <div>📋 <b>Quy chuẩn:</b> {item.specification}</div>
                    <div>📝 <b>Hiện trạng kiểm tra:</b> <span className="text-slate-800">{item.details}</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <div>Kiểm tra: <b className="font-mono text-slate-700">{item.checkDate}</b> • Kỳ tới: <b className="font-mono text-teal-700">{item.nextDueDate}</b></div>
                    <div className="font-semibold text-slate-700">👤 {item.responsibleStaff}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 5: SỔ ĐIỀU TRA SỰ CỐ HIỆN TRƯỜNG & CAPA ════════════════════ */}
        {activeTab === 'INCIDENTS_CAPA' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Bộ lọc sự cố */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm mã vụ việc, tên sự cố, người liên quan..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-medium">Mức độ nghiêm trọng:</span>
                <select
                  value={selectedSeverityFilter}
                  onChange={e => setSelectedSeverityFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
                >
                  <option value="ALL">Tất cả mức độ sự cố</option>
                  <option value="CRITICAL">🔴 Cực kỳ nghiêm trọng</option>
                  <option value="HIGH">🟠 Mức nghiêm trọng</option>
                  <option value="MEDIUM">🟡 Mức trung bình</option>
                  <option value="LOW">🔵 Mức cảnh báo / Suýt bị nạn</option>
                </select>
              </div>
            </div>

            {/* Bảng danh sách sự cố & CAPA */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5">Mã Hồ Sơ &amp; Thời Gian</th>
                    <th className="px-3 py-2.5">Sự Cố &amp; Địa Điểm Hiện Trường</th>
                    <th className="px-3 py-2.5 text-center">Phân Loại &amp; Mức Độ</th>
                    <th className="px-3 py-2.5">Người Liên Quan &amp; Nhân Chứng</th>
                    <th className="px-3 py-2.5">Nguyên Nhân Gốc &amp; Kế Hoạch CAPA</th>
                    <th className="px-3 py-2.5 text-center">Tiến Độ CAPA</th>
                    <th className="px-3 py-2.5 text-center">Hồ Sơ Giấy A4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncidents.map(inc => (
                    <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-rose-700 text-[11px]">{inc.id}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{inc.incidentDate} ({inc.incidentTime})</div>
                      </td>

                      <td className="px-3 py-2.5 max-w-xs">
                        <div className="font-bold text-slate-900 text-xs">{inc.title}</div>
                        <div className="text-[10px] text-slate-500">📍 {inc.location}</div>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 block">
                            {inc.typeName}
                          </span>
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border block ${
                            inc.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                            inc.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>
                            {inc.severityName}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 max-w-xs text-[11px]">
                        <div className="font-semibold text-slate-800">
                          {inc.involvedPersons.map((p, pIdx) => (
                            <div key={pIdx}>• {p.name} ({p.empId}) - <i>{p.role}</i></div>
                          ))}
                        </div>
                        {inc.witnesses.length > 0 && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            Nhân chứng: {inc.witnesses[0].name} ({inc.witnesses[0].dept})
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2.5 max-w-xs text-[11px]">
                        <div className="text-slate-800"><b>Nguyên nhân:</b> {inc.rootCause}</div>
                        <div className="text-emerald-700 font-medium text-[10px] mt-0.5">
                          <b>CAPA:</b> {inc.correctiveAction}
                        </div>
                        <div className="text-[10px] text-slate-400">Chịu trách nhiệm: {inc.capaOwner}</div>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-slate-800 block mb-1">
                          {inc.capaProgress}%
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden mx-auto">
                          <div
                            className={`h-1.5 rounded-full ${
                              inc.capaProgress === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${inc.capaProgress}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setShowPrintIncidentModal(inc)}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-all flex items-center space-x-1 mx-auto cursor-pointer"
                          title="In biên bản điều tra sự cố hiện trường A4"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-600" />
                          <span>In Biên Bản A4</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 6: BÁO CÁO HSE 360° & XUẤT EXCEL ════════════════════ */}
        {activeTab === 'HSE_REPORTS' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Thống kê xu hướng sự cố & Phân tích cơ cấu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {/* Cơ cấu vi phạm */}
              <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Phân Bổ Sự Cố / Vi Phạm Theo Khu Vực Phân Xưởng (YTD 2026)
                  </h4>
                  <span className="text-[10px] text-slate-400">Dữ liệu hiện trường</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">1. Phân xưởng dập kim loại &amp; Cơ khí A</span>
                      <span className="font-bold text-slate-900 font-mono">45.0% (Máy nén, máy dập)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">2. Phân xưởng may mặc &amp; Lắp ráp B</span>
                      <span className="font-bold text-slate-900 font-mono">28.0% (Ghim kim, ergonomics)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '28%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">3. Khu vực Kho Vận &amp; Dock Container</span>
                      <span className="font-bold text-slate-900 font-mono">17.0% (Xe nâng, bốc dỡ pallet)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '17%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">4. Khối Văn Phòng &amp; Căn Tin</span>
                      <span className="font-bold text-slate-900 font-mono">10.0% (Trơn trượt, ổ cắm)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tỷ lệ hoàn thành CAPA & Báo cáo cơ quan quản lý */}
              <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Tuân Thủ Báo Cáo Định Kỳ Sở LĐ-TB&amp;XH (TT 07/2016)
                  </h4>
                  <span className="text-[10px] text-slate-400">Pháp lý ATVSLĐ</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tỷ Lệ Xử Lý CAPA:</span>
                    <b className="text-lg font-black text-emerald-700 font-mono">96.5%</b>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Khắc phục triệt để</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Khai Báo TNLĐ Nặng:</span>
                    <b className="text-lg font-black text-slate-900 font-mono">0 Vụ</b>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Không phát sinh ca nặng</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-900">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Hồ sơ định kỳ đã nộp đầy đủ cho Sở LĐ-TB&amp;XH và Ban Quản Lý KCN</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Đã hoàn thành nộp Báo cáo tổng hợp tình hình tai nạn lao động 6 tháng đầu năm và Báo cáo công tác an toàn vệ sinh lao động theo đúng thời hạn luật định.
                  </p>
                </div>
              </div>
            </div>

            {/* Banner xuất Excel 5 sheet */}
            <div className="bg-gradient-to-r from-slate-950 to-emerald-950 p-2 rounded-xl text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Xuất Báo Cáo HSE &amp; Tuân Thủ Pháp Luật (Excel 5 Sheet)</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Bao gồm: Chỉ số an toàn LTI &amp; HIRA, Kiểm định thiết bị nghiêm ngặt, Huấn luyện 6 nhóm, PCCC &amp; Môi trường, Sổ điều tra CAPA.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportExcel5Sheets}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Báo Cáo Excel</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════ MODAL: GHI NHẬN SỰ CỐ / VI PHẠM MỚI ════════════════════ */}
      {showAddIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-2 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-gradient-to-r from-rose-900 to-slate-900 p-2 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-sm">Lập Biên Bản Sự Cố Hiện Trường / Vi Phạm An Toàn Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddIncidentModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewIncident} className="p-2.5 space-y-1.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu Đề Vụ Việc / Sự Cố:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Va chạm xe nâng tại kho hàng, phát sinh tia lửa điện tại tủ động lực..."
                  value={newIncidentForm.title}
                  onChange={e => setNewIncidentForm({ ...newIncidentForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân Loại Sự Cố:</label>
                  <select
                    value={newIncidentForm.incidentType}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, incidentType: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="TAI_NAN_LAO_DONG">Tai Nạn Lao Động</option>
                    <option value="NEAR_MISS">Suýt Bị Nạn (Near-Miss)</option>
                    <option value="HOA_HOAN_CHAY_NO">Sự Cố Cháy Nổ Nhẹ</option>
                    <option value="HU_HONG_TAI_SAN">Hư Hỏng Tài Sản Máy Móc</option>
                    <option value="VI_PHAM_KY_LUAT">Vi Phạm Kỷ Luật An Toàn</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức Độ Nghiêm Trọng:</label>
                  <select
                    value={newIncidentForm.severity}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, severity: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="LOW">Mức Cảnh Báo (Thấp)</option>
                    <option value="MEDIUM">Mức Trung Bình</option>
                    <option value="HIGH">Mức Nghiêm Trọng</option>
                    <option value="CRITICAL">Cực Kỳ Nghiêm Trọng (Dừng máy)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày Xảy Ra:</label>
                  <input
                    type="date"
                    value={newIncidentForm.incidentDate}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, incidentDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ Xảy Ra:</label>
                  <input
                    type="text"
                    placeholder="14:30"
                    value={newIncidentForm.incidentTime}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, incidentTime: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa Điểm Hiện Trường:</label>
                  <input
                    type="text"
                    required
                    placeholder="Xưởng dập A, Kho..."
                    value={newIncidentForm.location}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              {/* Người liên quan */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <b className="text-slate-800 block">Thông Tin Người Liên Quan Trực Tiếp:</b>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">Họ và tên:</label>
                    <input
                      type="text"
                      value={newIncidentForm.involvedPersonName}
                      onChange={e => setNewIncidentForm({ ...newIncidentForm, involvedPersonName: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Mã nhân viên:</label>
                    <input
                      type="text"
                      value={newIncidentForm.involvedPersonEmpId}
                      onChange={e => setNewIncidentForm({ ...newIncidentForm, involvedPersonEmpId: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Bộ phận / Vai trò:</label>
                    <input
                      type="text"
                      value={newIncidentForm.involvedPersonDept}
                      onChange={e => setNewIncidentForm({ ...newIncidentForm, involvedPersonDept: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Lời khai nhân chứng */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lời Khai Người Làm Chứng Tại Hiện Trường:</label>
                <div className="grid grid-cols-2 gap-2 mb-1.5">
                  <input
                    type="text"
                    placeholder="Họ tên người làm chứng"
                    value={newIncidentForm.witnessName}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, witnessName: e.target.value })}
                    className="border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="text"
                    placeholder="Bộ phận người làm chứng"
                    value={newIncidentForm.witnessDept}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, witnessDept: e.target.value })}
                    className="border border-slate-300 rounded p-1.5"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Nội dung lời khai người làm chứng chứng kiến sự việc..."
                  value={newIncidentForm.witnessStatement}
                  onChange={e => setNewIncidentForm({ ...newIncidentForm, witnessStatement: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xử Trí Tức Thời:</label>
                  <input
                    type="text"
                    required
                    placeholder="Sơ cứu y tế, ngắt cầu dao..."
                    value={newIncidentForm.immediateAction}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, immediateAction: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguyên Nhân Gốc Rễ (Root Cause):</label>
                  <input
                    type="text"
                    required
                    placeholder="Không tuân thủ LOTO, trượt chân..."
                    value={newIncidentForm.rootCause}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, rootCause: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hành Động Khắc Phục Phòng Ngừa (CAPA):</label>
                <input
                  type="text"
                  required
                  placeholder="Lắp thêm cảm biến an toàn, tái đào tạo ATLĐ, sửa chữa thiết bị..."
                  value={newIncidentForm.correctiveAction}
                  onChange={e => setNewIncidentForm({ ...newIncidentForm, correctiveAction: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người Chịu Trách Nhiệm CAPA:</label>
                  <input
                    type="text"
                    value={newIncidentForm.capaOwner}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, capaOwner: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn Hoàn Thành CAPA:</label>
                  <input
                    type="date"
                    value={newIncidentForm.capaDeadline}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, capaDeadline: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddIncidentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  Lưu Biên Bản Sự Cố
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL: IN BIÊN BẢN ĐIỀU TRA HIỆN TRƯỜNG A4 ════════════════════ */}
      {showPrintIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-900 p-3.5 text-white flex items-center justify-between no-print">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-sm">Xem Trước Bản In Biên Bản Điều Tra Hiện Trường Sự Cố (A4)</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintIncidentModal(null)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Khổ giấy A4 hiển thị */}
            <div className="p-8 space-y-2 text-slate-900 bg-white font-serif text-xs leading-relaxed printable-a4">
              {/* Tiêu ngữ & Mã QR xác thực */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-xs">CÔNG TY CỔ PHẦN TẬP ĐOÀN CÔNG NGHỆ OMNI</h4>
                  <p className="text-[10px] text-slate-600">BAN AN TOÀN VỆ SINH LAO ĐỘNG (HSE) &amp; ĐỘI AN NINH</p>
                  <p className="text-[10px] text-slate-500">Số hồ sơ: {showPrintIncidentModal.id}/BB-HSE2026</p>
                </div>
                <div className="flex items-center space-x-2 border border-slate-300 p-2 rounded-lg bg-slate-50 shrink-0">
                  <QrCode className="w-9 h-9 text-slate-800" />
                  <div className="text-[9px] leading-tight text-slate-600 text-left font-sans">
                    <p className="font-bold text-slate-900 uppercase">XÁC THỰC PHÁP LÝ</p>
                    <p className="font-mono">VERIFY-{showPrintIncidentModal.id}</p>
                    <p className="text-emerald-700 font-semibold">✓ Đã ký số HSE</p>
                  </div>
                </div>
              </div>

              {/* Tiêu đề biên bản */}
              <div className="text-center space-y-1">
                <h2 className="text-base font-black uppercase tracking-tight text-rose-900">
                  BIÊN BẢN ĐIỀU TRA HIỆN TRƯỜNG SỰ CỐ &amp; VI PHẠM KỶ LUẬT AN TOÀN LAO ĐỘNG
                </h2>
                <p className="text-[10px] italic text-slate-500">
                  (Căn cứ Luật An toàn, vệ sinh lao động số 84/2015/QH13 và Quy chế HSE nội bộ Công ty)
                </p>
              </div>

              {/* Thông tin sự cố */}
              <div className="space-y-1.5 border border-slate-200 p-3 rounded">
                <p>• <b>1. Tên sự cố / vụ việc:</b> <b>{showPrintIncidentModal.title}</b></p>
                <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                  <div>• Phân loại: <b>{showPrintIncidentModal.typeName}</b></div>
                  <div>• Mức độ nghiêm trọng: <b className="text-rose-800">{showPrintIncidentModal.severityName}</b></div>
                  <div>• Thời gian phát sinh: <b className="font-mono">{showPrintIncidentModal.incidentDate} lúc {showPrintIncidentModal.incidentTime}</b></div>
                  <div>• Địa điểm hiện trường: <b>{showPrintIncidentModal.location}</b></div>
                </div>
              </div>

              {/* Các bên liên quan trực tiếp */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <p className="font-bold uppercase text-[11px] text-slate-800">2. Các bên liên quan trực tiếp:</p>
                {showPrintIncidentModal.involvedPersons.map((p, idx) => (
                  <p key={idx} className="text-[11.5px]">
                    • <b>Họ và tên:</b> {p.name} - Mã NV: <span className="font-mono font-bold">{p.empId}</span> ({p.dept}) - Vai trò: <i>{p.role}</i>
                  </p>
                ))}
              </div>

              {/* Lời khai người làm chứng */}
              <div className="p-3 bg-amber-50/50 rounded border border-amber-200 space-y-1.5">
                <p className="font-bold uppercase text-[11px] text-amber-900">3. Lời khai của người làm chứng tại hiện trường:</p>
                {showPrintIncidentModal.witnesses.length > 0 ? (
                  showPrintIncidentModal.witnesses.map((w, idx) => (
                    <div key={idx} className="text-[11.5px] border-b border-amber-200/60 pb-1 last:border-b-0">
                      <p>• <b>Người làm chứng:</b> {w.name} ({w.dept})</p>
                      <p className="italic text-slate-700">&ldquo;{w.statement}&rdquo;</p>
                    </div>
                  ))
                ) : (
                  <p className="italic text-slate-500 text-[11px]">Không có nhân chứng trực tiếp tại thời điểm xảy ra.</p>
                )}
              </div>

              {/* Xử lý tức thời & CAPA */}
              <div className="space-y-1.5 border border-slate-200 p-3 rounded">
                <p>• <b>4. Biện pháp xử lý tức thời:</b> {showPrintIncidentModal.immediateAction}</p>
                <p>• <b>5. Nguyên nhân gốc rễ (Root Cause):</b> {showPrintIncidentModal.rootCause}</p>
                <p>• <b>6. Hành động khắc phục phòng ngừa (CAPA):</b> <b className="text-teal-900">{showPrintIncidentModal.correctiveAction}</b></p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>Người chịu trách nhiệm CAPA: <b>{showPrintIncidentModal.capaOwner}</b></div>
                  <div>Hạn chót hoàn thành: <b className="font-mono">{showPrintIncidentModal.capaDeadline}</b></div>
                </div>
              </div>

              {/* Ký tên 4 bên */}
              <div className="grid grid-cols-4 gap-2 text-center pt-4 border-t text-[10.5px]">
                <div>
                  <p className="font-bold uppercase">NGƯỜI LIÊN QUAN</p>
                  <p className="italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">NGƯỜI LÀM CHỨNG</p>
                  <p className="italic text-slate-400 mt-12">(Ký xác nhận)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">ĐỘI AN TOÀN HSE</p>
                  <p className="italic text-slate-400 mt-12">(Ký xác nhận điều tra)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">ĐẠI DIỆN CÔNG ĐOÀN / BGĐ</p>
                  <p className="italic text-slate-400 mt-12">(Ký duyệt)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
