import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  HeartPulse,
  Stethoscope,
  Pill,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Users,
  Search,
  Filter,
  Download,
  Plus,
  X,
  Eye,
  Printer,
  Sparkles,
  ShieldAlert,
  Activity,
  FileSpreadsheet,
  FileText,
  PhoneCall,
  Award,
  ChevronRight,
  TrendingUp,
  Layers,
  Hospital,
  Thermometer,
  ShieldCheck,
  Building2,
  Package,
  CalendarCheck,
  FileCheck2,
  Timer,
  Syringe,
  History,
  Check,
  CheckCheck,
  AlertOctagon
} from 'lucide-react';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';

interface MedicalAndFirstAidHubProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
}

// 6 PHÂN HỆ Y TẾ & SƠ CẤP CỨU
export type MedicalSubTab =
  | 'FIRST_AID_KITS'      // 1. Tủ thuốc & Túi sơ cứu loại A/B/C (TT 19/2016/TT-BYT)
  | 'CLINIC_LOGS'         // 2. Nhật ký khám sơ cấp cứu & cấp phát thuốc hàng ngày
  | 'EXPIRY_FEFO'         // 3. Quản lý hạn dùng FEFO & AI cảnh báo hết hạn / tồn kho
  | 'HEALTH_EXAM'         // 4. Khám sức khỏe định kỳ & Bệnh nghề nghiệp (TT 28/2016/TT-BYT)
  | 'FIRST_AID_TEAM'      // 5. Đội sơ cấp cứu cơ sở & Huấn luyện an toàn (NĐ 44/2016/NĐ-CP)
  | 'HEALTH_REPORTS';     // 6. Báo cáo sức khỏe 360° & Xuất Excel 5 sheet

// Kiểu dữ liệu Tủ thuốc & Túi sơ cứu
export interface FirstAidKit {
  id: string;
  name: string;
  type: 'CENTRAL_CLINIC' | 'KIT_TYPE_A' | 'KIT_TYPE_B' | 'KIT_TYPE_C';
  location: string;
  capacityScope: string; // VD: Phục vụ 150 công nhân xưởng A
  responsiblePerson: string; // Tên cán bộ phụ trách
  phone: string;
  itemsCount: number;
  lastCheckedDate: string;
  nextCheckDueDate: string;
  status: 'QUALIFIED' | 'NEEDS_REFILL' | 'EXPIRING_ITEMS';
  notes: string;
}

// Kiểu dữ liệu Thuốc & Vật tư trong túi/tủ
export interface MedicalInventoryItem {
  id: string;
  kitId: string;
  kitName: string;
  itemName: string;
  category: 'THUOC_THIET_YEU' | 'BANG_GA_SAT_TRUNG' | 'DUNG_CU_SO_CUU' | 'THIET_BI_DO';
  unit: string;
  standardQty: number; // Cơ số chuẩn theo TT 19
  actualQty: number;   // Số lượng thực tế
  batchNumber: string; // Số lô SX
  manufactureDate: string;
  expiryDate: string;  // Hạn dùng
  daysUntilExpiry: number;
  fefoStatus: 'EXPIRED' | 'CRITICAL_30' | 'WARNING_90' | 'GOOD';
  minStockAlert: boolean;
  unitPrice: number;
}

// Kiểu dữ liệu Lượt khám sơ cấp cứu
export interface ClinicVisitLog {
  id: string;
  visitCode: string;
  dateTime: string;
  empId: string;
  empName: string;
  department: string;
  shift: 'CA_1' | 'CA_2' | 'CA_3' | 'HANH_CHINH';
  symptom: string; // Triệu chứng: Đau đầu, chóng mặt, vết rách da...
  vitalSigns: {
    bloodPressure: string; // VD: 120/80 mmHg
    heartRate: number;     // bpm
    temperature: number;   // °C
    spO2: number;          // %
  };
  diagnosis: string; // Chẩn đoán sơ bộ
  treatment: string; // Xử trí: Rửa sát khuẩn bằng Povidine, băng ép...
  prescribedMeds: string; // Thuốc cấp: Paracetamol 500mg x 1 viên...
  restDurationMinutes: number; // Số phút nằm nghỉ tại trạm xá
  disposition: 'RETURN_TO_WORK' | 'SICK_LEAVE_HOME' | 'HOSPITAL_TRANSFER';
  attendingStaff: string; // Y tá / Bác sĩ trực
  notes?: string;
  hospitalTransferDetails?: {
    hospitalName: string;
    ambulanceCalled: boolean;
    escortStaff: string;
    reason: string;
  };
}

// Kiểu dữ liệu Khám sức khỏe định kỳ & Bệnh nghề nghiệp
export interface PeriodicHealthExam {
  id: string;
  examBatch: string; // VD: Khám Sức Khỏe Toàn Diện Đợt 1 - 2026
  examDate: string;
  hospitalPartner: string; // Bệnh viện Đại học Y Dược / BV Đa khoa Bình Dương
  totalEmployeesEligible: number;
  totalExamined: number;
  type1Count: number; // Loại I - Rất khỏe
  type2Count: number; // Loại II - Khỏe
  type3Count: number; // Loại III - Trung bình
  type4Count: number; // Loại IV - Yếu
  type5Count: number; // Loại V - Rất yếu
  occupationalScreening: {
    audiometryNoiseTested: number; // Đo thính lực tiếng ồn
    hearingLossDetected: number;   // Giảm thính lực nghề nghiệp
    chestXRayTested: number;       // Chụp X-quang phổi bụi
    silicosisDetected: number;     // Bụi phổi
    toxicSolventTested: number;    // Xét nghiệm nhiễm độc dung môi/hóa chất
    toxicityDetected: number;
  };
  status: 'COMPLETED' | 'IN_PROGRESS' | 'REPORT_SUBMITTED';
}

// Kiểu dữ liệu Đội sơ cứu cơ sở
export interface FirstAidResponder {
  id: string;
  empId: string;
  fullName: string;
  department: string;
  assignedZone: string; // Khu vực phụ trách sơ cứu
  roleInTeam: 'DOI_TRUONG' | 'DOI_PHO' | 'CUU_THUONG_VIEN' | 'AN_TOAN_VE_SINH_VIEN';
  certNumber: string; // Số chứng chỉ huấn luyện sơ cấp cứu
  certIssueDate: string;
  certExpiryDate: string;
  isCertValid: boolean;
  phone: string;
  lastDrillDate: string; // Diễn tập gần nhất
  skills: string[]; // CPR, Garo, Cố định xương, Bỏng...
}

export const MedicalAndFirstAidHub: React.FC<MedicalAndFirstAidHubProps> = ({
  policy,
  employees,
  currentRole
}) => {
  const [activeTab, setActiveTab] = useState<MedicalSubTab>('FIRST_AID_KITS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKitFilter, setSelectedKitFilter] = useState<string>('ALL');
  const [selectedFefoFilter, setSelectedFefoFilter] = useState<string>('ALL');
  const [selectedDispositionFilter, setSelectedDispositionFilter] = useState<string>('ALL');

  // Modals
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [showPrintVisitModal, setShowPrintVisitModal] = useState(false);
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState<ClinicVisitLog | null>(null);

  // MOCK DATA 1: Danh sách Tủ thuốc & Túi sơ cứu theo TT 19/2016/TT-BYT
  const [firstAidKits, setFirstAidKits] = useState<FirstAidKit[]>([
    {
      id: 'KIT-CENTRAL',
      name: 'Phòng Y Tế Trung Tâm (Trạm Y Tế Cơ Sở)',
      type: 'CENTRAL_CLINIC',
      location: 'Tầng 1 - Tòa nhà Điều hành & Nhà máy',
      capacityScope: 'Phục vụ toàn bộ 850 CBCNV & Chuyên gia',
      responsiblePerson: 'Bác sĩ CKI. Phạm Minh Tuấn',
      phone: '0908.112.233 (Hotline Y tế 24/7)',
      itemsCount: 48,
      lastCheckedDate: '2026-09-01',
      nextCheckDueDate: '2026-10-01',
      status: 'QUALIFIED',
      notes: 'Trang bị 03 giường bệnh nội trú lưu bệnh nhẹ, bình oxy 40L, cáng cứu thương gấp gọn'
    },
    {
      id: 'KIT-XUONG-A',
      name: 'Túi Sơ Cứu C - Phân Xưởng Dập & Cơ Khí',
      type: 'KIT_TYPE_C',
      location: 'Trụ B3 - Cửa thoát hiểm số 2 Xưởng Dập A',
      capacityScope: 'Phục vụ 135 công nhân thao tác máy nặng',
      responsiblePerson: 'ATVSV. Nguyễn Văn Long',
      phone: '0912.345.678',
      itemsCount: 26,
      lastCheckedDate: '2026-09-05',
      nextCheckDueDate: '2026-10-05',
      status: 'QUALIFIED',
      notes: 'Tăng cường băng ép garo cầm máu động mạch và nẹp nẹp cẳng tay cẳng chân định hình'
    },
    {
      id: 'KIT-XUONG-B',
      name: 'Túi Sơ Cứu C - Phân Xưởng May & Lắp Ráp',
      type: 'KIT_TYPE_C',
      location: 'Khu vực kiểm tra chất lượng KCS Xưởng May B',
      capacityScope: 'Phục vụ 120 công nhân ca kíp',
      responsiblePerson: 'ATVSV. Trần Thị Mai',
      phone: '0983.456.789',
      itemsCount: 24,
      lastCheckedDate: '2026-09-03',
      nextCheckDueDate: '2026-10-03',
      status: 'EXPIRING_ITEMS',
      notes: 'Có 02 chai Povidine 20ml cận hạn dùng dưới 30 ngày cần thu hồi đổi mới'
    },
    {
      id: 'KIT-KHO-LOG',
      name: 'Túi Sơ Cứu B - Kho Thành Phẩm & Xuất Hàng',
      type: 'KIT_TYPE_B',
      location: 'Cửa xuất nhập hàng Dock Container số 1',
      capacityScope: 'Phục vụ 45 nhân viên kho & tài xế xe nâng',
      responsiblePerson: 'ATVSV. Lê Văn Tài',
      phone: '0977.889.900',
      itemsCount: 18,
      lastCheckedDate: '2026-09-08',
      nextCheckDueDate: '2026-10-08',
      status: 'QUALIFIED',
      notes: 'Chuẩn bị đầy đủ dung dịch rửa mắt khẩn cấp và gạc chống phỏng'
    },
    {
      id: 'KIT-CANTEEN',
      name: 'Túi Sơ Cứu A - Khu Vực Căn Tin & Bếp Ăn',
      type: 'KIT_TYPE_A',
      location: 'Cửa ra vào sảnh Căn tin tầng trệt',
      capacityScope: 'Phục vụ 20 nhân sự cấp dưỡng & sơ chế',
      responsiblePerson: 'Bếp trưởng. Hoàng Văn Hùng',
      phone: '0933.221.144',
      itemsCount: 14,
      lastCheckedDate: '2026-08-28',
      nextCheckDueDate: '2026-09-28',
      status: 'NEEDS_REFILL',
      notes: 'Đã dùng hết 02 cuộn băng thun và 1 vỉ Paracetamol 500mg, đang chờ bổ sung'
    },
    {
      id: 'KIT-OFFICE',
      name: 'Túi Sơ Cứu A - Tòa Nhà Khối Văn Phòng (Lầu 2)',
      type: 'KIT_TYPE_A',
      location: 'Pantry lầu 2 cạnh phòng họp Hội Đồng Quản Trị',
      capacityScope: 'Phục vụ 22 nhân viên phòng ban chức năng',
      responsiblePerson: 'Cán bộ HC. Đỗ Thị Bích',
      phone: '0918.776.554',
      itemsCount: 15,
      lastCheckedDate: '2026-09-02',
      nextCheckDueDate: '2026-10-02',
      status: 'QUALIFIED',
      notes: 'Cơ số thuốc cảm sốt thông thường, dầu gió, Salonpas và cồn sát khuẩn đầy đủ'
    }
  ]);

  // MOCK DATA 2: Danh mục thuốc & vật tư (FEFO & Min-Stock)
  const [inventoryItems, setInventoryItems] = useState<MedicalInventoryItem[]>([
    {
      id: 'MED-001',
      kitId: 'KIT-CENTRAL',
      kitName: 'Phòng Y Tế Trung Tâm',
      itemName: 'Paracetamol 500mg (Hộp 10 vỉ x 10 viên)',
      category: 'THUOC_THIET_YEU',
      unit: 'Hộp',
      standardQty: 10,
      actualQty: 8,
      batchNumber: 'L260105',
      manufactureDate: '2025-06-10',
      expiryDate: '2028-06-10',
      daysUntilExpiry: 633,
      fefoStatus: 'GOOD',
      minStockAlert: false,
      unitPrice: 85000
    },
    {
      id: 'MED-002',
      kitId: 'KIT-XUONG-B',
      kitName: 'Túi Sơ Cứu C - Xưởng May B',
      itemName: 'Dung dịch sát khuẩn Povidine Iod 10% (Chai 20ml)',
      category: 'BANG_GA_SAT_TRUNG',
      unit: 'Chai',
      standardQty: 6,
      actualQty: 5,
      batchNumber: 'POV2409',
      manufactureDate: '2024-09-15',
      expiryDate: '2026-09-30',
      daysUntilExpiry: 15,
      fefoStatus: 'CRITICAL_30',
      minStockAlert: false,
      unitPrice: 12000
    },
    {
      id: 'MED-003',
      kitId: 'KIT-CANTEEN',
      kitName: 'Túi Sơ Cứu A - Căn Tin',
      itemName: 'Băng thun co giãn y tế 3 inch (Cuộn)',
      category: 'BANG_GA_SAT_TRUNG',
      unit: 'Cuộn',
      standardQty: 5,
      actualQty: 1,
      batchNumber: 'BT2510',
      manufactureDate: '2025-01-10',
      expiryDate: '2028-01-10',
      daysUntilExpiry: 482,
      fefoStatus: 'GOOD',
      minStockAlert: true,
      unitPrice: 15000
    },
    {
      id: 'MED-004',
      kitId: 'KIT-XUONG-A',
      kitName: 'Túi Sơ Cứu C - Xưởng Dập A',
      itemName: 'Băng tam giác vải không dệt cố định gãy xương',
      category: 'DUNG_CU_SO_CUU',
      unit: 'Cái',
      standardQty: 4,
      actualQty: 4,
      batchNumber: 'BTG2503',
      manufactureDate: '2025-03-01',
      expiryDate: '2030-03-01',
      daysUntilExpiry: 1262,
      fefoStatus: 'GOOD',
      minStockAlert: false,
      unitPrice: 22000
    },
    {
      id: 'MED-005',
      kitId: 'KIT-CENTRAL',
      kitName: 'Phòng Y Tế Trung Tâm',
      itemName: 'Thuốc nhỏ mắt rửa dị vật Efticol NaCl 0.9% (Lọ 10ml)',
      category: 'THUOC_THIET_YEU',
      unit: 'Lọ',
      standardQty: 20,
      actualQty: 18,
      batchNumber: 'EFT2511',
      manufactureDate: '2025-11-20',
      expiryDate: '2026-11-20',
      daysUntilExpiry: 66,
      fefoStatus: 'WARNING_90',
      minStockAlert: false,
      unitPrice: 6000
    },
    {
      id: 'MED-006',
      kitId: 'KIT-XUONG-A',
      kitName: 'Túi Sơ Cứu C - Xưởng Dập A',
      itemName: 'Nẹp gỗ / composite cố định gãy xương cẳng tay',
      category: 'DUNG_CU_SO_CUU',
      unit: 'Bộ',
      standardQty: 2,
      actualQty: 2,
      batchNumber: 'NEP2025',
      manufactureDate: '2025-01-01',
      expiryDate: '2035-01-01',
      daysUntilExpiry: 3030,
      fefoStatus: 'GOOD',
      minStockAlert: false,
      unitPrice: 120000
    },
    {
      id: 'MED-007',
      kitId: 'KIT-CENTRAL',
      kitName: 'Phòng Y Tế Trung Tâm',
      itemName: 'Oresol 245 bù nước điện giải (Gói)',
      category: 'THUOC_THIET_YEU',
      unit: 'Gói',
      standardQty: 50,
      actualQty: 12,
      batchNumber: 'ORS2505',
      manufactureDate: '2025-05-15',
      expiryDate: '2027-05-15',
      daysUntilExpiry: 242,
      fefoStatus: 'GOOD',
      minStockAlert: true,
      unitPrice: 4500
    },
    {
      id: 'MED-008',
      kitId: 'KIT-CENTRAL',
      kitName: 'Phòng Y Tế Trung Tâm',
      itemName: 'Máy đo huyết áp bắp tay điện tử Omron HEM-7120',
      category: 'THIET_BI_DO',
      unit: 'Máy',
      standardQty: 2,
      actualQty: 2,
      batchNumber: 'OMR2024',
      manufactureDate: '2024-10-01',
      expiryDate: '2030-10-01',
      daysUntilExpiry: 1477,
      fefoStatus: 'GOOD',
      minStockAlert: false,
      unitPrice: 850000
    },
    {
      id: 'MED-009',
      kitId: 'KIT-CENTRAL',
      kitName: 'Phòng Y Tế Trung Tâm',
      itemName: 'Máy kẹp đo nồng độ bão hòa oxy đầu ngón tay SpO2',
      category: 'THIET_BI_DO',
      unit: 'Cái',
      standardQty: 2,
      actualQty: 2,
      batchNumber: 'SPO2025',
      manufactureDate: '2025-02-15',
      expiryDate: '2030-02-15',
      daysUntilExpiry: 1248,
      fefoStatus: 'GOOD',
      minStockAlert: false,
      unitPrice: 320000
    }
  ]);

  // MOCK DATA 3: Nhật ký khám sơ cấp cứu hàng ngày (Clinic logs)
  const [clinicLogs, setClinicLogs] = useState<ClinicVisitLog[]>([
    {
      id: 'VISIT-2026-001',
      visitCode: 'KB-0915-01',
      dateTime: '2026-09-15 08:30',
      empId: 'AF-002',
      empName: 'Nguyễn Văn Long',
      department: 'Phân Xưởng Cơ Khí - Dập A',
      shift: 'CA_1',
      symptom: 'Đau đầu âm ỉ, sốt nhẹ lúc bắt đầu ca làm việc 1',
      vitalSigns: {
        bloodPressure: '125/80',
        heartRate: 84,
        temperature: 37.8,
        spO2: 98
      },
      diagnosis: 'Sốt siêu vi thể nhẹ / Cảm cúm thời tiết',
      treatment: 'Đo sinh hiệu, lau khăn ấm trán, hướng dẫn uống nhiều nước ấm',
      prescribedMeds: 'Paracetamol 500mg x 01 viên, Vitamin C 500mg sủi x 01 viên',
      restDurationMinutes: 45,
      disposition: 'RETURN_TO_WORK',
      attendingStaff: 'Y tá Nguyễn Thu Thảo',
      notes: 'Sau 45 phút hạ sốt còn 37.1°C, thể trạng tỉnh táo trở lại xưởng làm việc nhẹ'
    },
    {
      id: 'VISIT-2026-002',
      visitCode: 'KB-0914-02',
      dateTime: '2026-09-14 10:15',
      empId: 'AF-010',
      empName: 'Trần Văn Thành',
      department: 'Phân Xưởng Đột Dập & Khuôn Mẫu',
      shift: 'CA_1',
      symptom: 'Vết thương trầy xước rách da mu bàn tay trái chảy máu do bavia kim loại',
      vitalSigns: {
        bloodPressure: '130/85',
        heartRate: 90,
        temperature: 36.8,
        spO2: 99
      },
      diagnosis: 'Vết rách nông mu bàn tay trái cự ly 2.5cm, không tổn thương gân xương',
      treatment: 'Rửa vết thương bằng NaCl 0.9%, sát khuẩn Povidine 10%, băng ép gạc tiệt trùng',
      prescribedMeds: 'Alpha Chymotrypsin x 02 viên, kiểm tra sổ tiêm phòng uốn ván VAT còn hiệu lực',
      restDurationMinutes: 30,
      disposition: 'RETURN_TO_WORK',
      attendingStaff: 'Bác sĩ CKI. Phạm Minh Tuấn',
      notes: 'Đã nhắc nhở tuân thủ đeo găng tay sợi phủ Nitrile chống cắt cấp độ 5 khi bốc phôi thép'
    },
    {
      id: 'VISIT-2026-003',
      visitCode: 'KB-0912-03',
      dateTime: '2026-09-12 14:20',
      empId: 'AF-015',
      empName: 'Lê Thị Thu Cúc',
      department: 'Phân Xưởng May Mặc & Kiểm Hàng B',
      shift: 'CA_2',
      symptom: 'Chóng mặt, vã mồ hôi lạnh, hoa mắt ngất xỉu nhẹ tại chuyền may',
      vitalSigns: {
        bloodPressure: '85/55',
        heartRate: 68,
        temperature: 36.4,
        spO2: 97
      },
      diagnosis: 'Hạ đường huyết & tụt huyết áp tư thế do bỏ bữa trưa',
      treatment: 'Đặt nằm đầu thấp nghiêng sang một bên, ủ ấm, cho uống 01 ly trà gừng ấm pha đường phèn',
      prescribedMeds: 'Bổ sung dung dịch Oresol bù khoáng điện giải 200ml',
      restDurationMinutes: 60,
      disposition: 'RETURN_TO_WORK',
      attendingStaff: 'Y tá Nguyễn Thu Thảo',
      notes: 'Sau 60 phút huyết áp ổn định lại 105/70 mmHg, hồng hào, tự đi lại được'
    },
    {
      id: 'VISIT-2026-004',
      visitCode: 'KB-0910-04',
      dateTime: '2026-09-10 16:45',
      empId: 'AF-033',
      empName: 'Vũ Quốc Khánh',
      department: 'Phân Xưởng Pha Chế Sơn & Keo Hóa Chất',
      shift: 'CA_2',
      symptom: 'Chấn thương bỏng dung môi nhiệt nhẹ cẳng tay phải cự ly 5x4cm nổi bọng nước nhỏ',
      vitalSigns: {
        bloodPressure: '140/90',
        heartRate: 96,
        temperature: 37.0,
        spO2: 98
      },
      diagnosis: 'Bỏng nhiệt hóa chất độ II nông diện tích khoảng 1.5% cơ thể',
      treatment: 'Xối rửa ngay dưới vòi nước sạch 20 phút, bôi kem mỡ Silvirin bạc, đắp gạc chống dính vô trùng',
      prescribedMeds: 'Paracetamol giảm đau 500mg, kháng histamine chống phù nề',
      restDurationMinutes: 40,
      disposition: 'HOSPITAL_TRANSFER',
      attendingStaff: 'Bác sĩ CKI. Phạm Minh Tuấn',
      hospitalTransferDetails: {
        hospitalName: 'Bệnh Viện Đa Khoa Tỉnh Bình Dương (Khoa Bỏng & Chấn Thương)',
        ambulanceCalled: false,
        escortStaff: 'Cán bộ ATVSV Đỗ Văn Bình (Xe cấp cứu công ty đưa đi)',
        reason: 'Theo dõi chuyên khoa bỏng để tránh nhiễm trùng mô hạt dưới da'
      },
      notes: 'Đã hoàn tất thủ tục BHYT và biên bản ghi nhận sự cố an toàn lao động gửi Ban Giám Đốc'
    }
  ]);

  // MOCK DATA 4: Khám sức khỏe định kỳ & Bệnh nghề nghiệp (TT 28/2016/TT-BYT)
  const [healthExams, setHealthExams] = useState<PeriodicHealthExam[]>([
    {
      id: 'EXAM-2026-01',
      examBatch: 'Khám Sức Khỏe Định Kỳ Toàn Diện Đợt 1 - Năm 2026',
      examDate: '2026-05-18 đến 2026-05-22',
      hospitalPartner: 'Bệnh Viện Đa Khoa Quốc Tế Becamex Bình Dương',
      totalEmployeesEligible: 850,
      totalExamined: 842,
      type1Count: 310, // 36.8%
      type2Count: 420, // 49.9%
      type3Count: 95,  // 11.3%
      type4Count: 15,  // 1.8%
      type5Count: 2,   // 0.2%
      occupationalScreening: {
        audiometryNoiseTested: 260, // Khối dập cơ khí
        hearingLossDetected: 4,     // 4 ca giảm thính lực nhẹ tần số cao 4000Hz
        chestXRayTested: 842,       // 100% chụp phổi
        silicosisDetected: 0,       // 0 ca bụi phổi
        toxicSolventTested: 110,    // Khối sơn & keo
        toxicityDetected: 0
      },
      status: 'REPORT_SUBMITTED'
    },
    {
      id: 'EXAM-2025-02',
      examBatch: 'Khám Phát Hiện Sớm Bệnh Nghề Nghiệp Đợt 2 - Năm 2025',
      examDate: '2025-11-10 đến 2025-11-12',
      hospitalPartner: 'Trung Tâm Y Tế Dự Phòng & Phòng Chống Bệnh Nghề Nghiệp Tỉnh',
      totalEmployeesEligible: 370,
      totalExamined: 370,
      type1Count: 125,
      type2Count: 198,
      type3Count: 41,
      type4Count: 6,
      type5Count: 0,
      occupationalScreening: {
        audiometryNoiseTested: 245,
        hearingLossDetected: 5,
        chestXRayTested: 370,
        silicosisDetected: 0,
        toxicSolventTested: 98,
        toxicityDetected: 0
      },
      status: 'REPORT_SUBMITTED'
    }
  ]);

  // MOCK DATA 5: Đội sơ cấp cứu cơ sở (Nghị định 44/2016/NĐ-CP)
  const [firstAidTeam, setFirstAidTeam] = useState<FirstAidResponder[]>([
    {
      id: 'FAR-01',
      empId: 'AF-DOC1',
      fullName: 'BS. CKI Phạm Minh Tuấn',
      department: 'Phòng Y Tế & Chăm Sóc Sức Khỏe',
      assignedZone: 'Trạm Y Tế Trung Tâm & Điều Phối Khẩn Cấp Toàn Cty',
      roleInTeam: 'DOI_TRUONG',
      certNumber: 'CC-SCC-BYT-2024-88',
      certIssueDate: '2024-04-10',
      certExpiryDate: '2027-04-10',
      isCertValid: true,
      phone: '0908.112.233',
      lastDrillDate: '2026-06-15',
      skills: ['Hồi sinh tim phổi CPR nâng cao', 'Xử trí sốc phản vệ', 'Đặt nẹp gãy xương phức tạp', 'Cấp cứu bỏng diện rộng']
    },
    {
      id: 'FAR-02',
      empId: 'AF-NURSE1',
      fullName: 'Y tá Nguyễn Thu Thảo',
      department: 'Phòng Y Tế & Chăm Sóc Sức Khỏe',
      assignedZone: 'Phòng Y Tế Trung Tâm & Khu Vực Văn Phòng Lầu 2',
      roleInTeam: 'DOI_PHO',
      certNumber: 'CC-SCC-BYT-2024-89',
      certIssueDate: '2024-04-10',
      certExpiryDate: '2027-04-10',
      isCertValid: true,
      phone: '0912.889.977',
      lastDrillDate: '2026-06-15',
      skills: ['Kỹ thuật tiêm truyền vô trùng', 'Băng bó vết thương hở', 'Sơ cứu say nắng say nóng', 'Sơ cứu ngộ độc']
    },
    {
      id: 'FAR-03',
      empId: 'AF-002',
      fullName: 'Nguyễn Văn Long',
      department: 'Phân Xưởng Cơ Khí - Dập A',
      assignedZone: 'Chuyền Dập Kim Loại & Đột Lỗ Phân Xưởng A',
      roleInTeam: 'AN_TOAN_VE_SINH_VIEN',
      certNumber: 'CC-ATVSV-2025-102',
      certIssueDate: '2025-03-20',
      certExpiryDate: '2027-03-20',
      isCertValid: true,
      phone: '0912.345.678',
      lastDrillDate: '2026-06-15',
      skills: ['Garo cầm máu động mạch', 'Sơ cứu chấn thương do kẹp cuốn máy', 'Di chuyển nạn nhân bằng cáng mềm']
    },
    {
      id: 'FAR-04',
      empId: 'AF-022',
      fullName: 'Trần Thị Mai',
      department: 'Phân Xưởng May Mặc & Kiểm Hàng B',
      assignedZone: 'Khu Vực Chuyền May & Hoàn Thiện Xưởng B',
      roleInTeam: 'AN_TOAN_VE_SINH_VIEN',
      certNumber: 'CC-ATVSV-2025-105',
      certIssueDate: '2025-03-20',
      certExpiryDate: '2027-03-20',
      isCertValid: true,
      phone: '0983.456.789',
      lastDrillDate: '2026-06-15',
      skills: ['Sơ cứu tụt huyết áp', 'Xử lý dị vật đâm xuyên ghim kim máy may', 'Thao tác ép tim ngoài lồng ngực CPR']
    },
    {
      id: 'FAR-05',
      empId: 'AF-045',
      fullName: 'Lê Văn Tài',
      department: 'Kho Vận & Logistics',
      assignedZone: 'Khu Vực Kho Thành Phẩm & Cửa Dock Container',
      roleInTeam: 'CUU_THUONG_VIEN',
      certNumber: 'CC-SCC-2024-332',
      certIssueDate: '2024-08-15',
      certExpiryDate: '2026-08-15',
      isCertValid: false, // Hết hạn cần tái huấn luyện!
      phone: '0977.889.900',
      lastDrillDate: '2026-06-15',
      skills: ['Sơ cứu va chạm xe nâng', 'Cố định cột sống cổ', 'Sơ cứu gãy xương kín']
    }
  ]);

  // STATE FORM: Thêm Lượt Khám Mới
  const [newVisitForm, setNewVisitForm] = useState({
    empId: 'AF-001',
    empName: 'Trần Thị Bích Ngọc',
    department: 'Khối Sản Xuất',
    shift: 'CA_1' as 'CA_1' | 'CA_2' | 'CA_3' | 'HANH_CHINH',
    symptom: '',
    bloodPressure: '120/80',
    heartRate: 80,
    temperature: 37.0,
    spO2: 98,
    diagnosis: '',
    treatment: '',
    prescribedMeds: '',
    restDurationMinutes: 30,
    disposition: 'RETURN_TO_WORK' as 'RETURN_TO_WORK' | 'SICK_LEAVE_HOME' | 'HOSPITAL_TRANSFER',
    attendingStaff: 'Y tá Nguyễn Thu Thảo',
    notes: '',
    hospitalName: 'Bệnh Viện Đa Khoa Becamex Bình Dương'
  });

  // KPI TÍNH TOÁN TỔNG HỢP
  const kpiStats = useMemo(() => {
    const totalKits = firstAidKits.length;
    const qualifiedKits = firstAidKits.filter(k => k.status === 'QUALIFIED').length;
    const totalVisitsMonth = clinicLogs.length;
    const hospitalTransfers = clinicLogs.filter(v => v.disposition === 'HOSPITAL_TRANSFER').length;
    const criticalExpiryItems = inventoryItems.filter(i => i.fefoStatus === 'CRITICAL_30' || i.fefoStatus === 'EXPIRED').length;
    const lowStockAlerts = inventoryItems.filter(i => i.minStockAlert).length;
    const latestExam = healthExams[0];
    const totalEmployeesExamined = latestExam ? latestExam.totalExamined : 0;
    const healthyRate = latestExam ? (((latestExam.type1Count + latestExam.type2Count) / latestExam.totalExamined) * 100).toFixed(1) : '90';

    return {
      totalKits,
      qualifiedKits,
      totalVisitsMonth,
      hospitalTransfers,
      criticalExpiryItems,
      lowStockAlerts,
      totalEmployeesExamined,
      healthyRate
    };
  }, [firstAidKits, clinicLogs, inventoryItems, healthExams]);

  // FILTERED LISTS
  const filteredKits = useMemo(() => {
    return firstAidKits.filter(k => {
      const matchSearch =
        k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedKitFilter === 'ALL' || k.type === selectedKitFilter;
      return matchSearch && matchType;
    });
  }, [firstAidKits, searchTerm, selectedKitFilter]);

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter(i => {
      const matchSearch =
        i.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.kitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFefo = selectedFefoFilter === 'ALL' || i.fefoStatus === selectedFefoFilter;
      return matchSearch && matchFefo;
    });
  }, [inventoryItems, searchTerm, selectedFefoFilter]);

  const filteredClinicLogs = useMemo(() => {
    return clinicLogs.filter(v => {
      const matchSearch =
        v.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.symptom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDisp = selectedDispositionFilter === 'ALL' || v.disposition === selectedDispositionFilter;
      return matchSearch && matchDisp;
    });
  }, [clinicLogs, searchTerm, selectedDispositionFilter]);

  // HÀM XUẤT BÁO CÁO EXCEL 5 SHEET
  const handleExportExcel5Sheets = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Danh mục tủ & túi sơ cứu
    const ws1Data = firstAidKits.map((k, idx) => ({
      STT: idx + 1,
      'Mã Tủ / Túi': k.id,
      'Tên Tủ / Túi': k.name,
      'Phân Loại': k.type === 'CENTRAL_CLINIC' ? 'Trạm Y Tế Cơ Sở' : `Túi Sơ Cứu Loại ${k.type.replace('KIT_TYPE_', '')}`,
      'Vị Trí Đặt': k.location,
      'Phạm Vi Phục Vụ': k.capacityScope,
      'Cán Bộ Phụ Trách': k.responsiblePerson,
      'Điện Thoại': k.phone,
      'Số Loại Thuốc/Vật Tư': k.itemsCount,
      'Kiểm Tra Gần Nhất': k.lastCheckedDate,
      'Hạn Kiểm Tra Kế Tiếp': k.nextCheckDueDate,
      'Trạng Thái Đánh Giá': k.status === 'QUALIFIED' ? 'Đạt Chuẩn TT 19' : k.status === 'EXPIRING_ITEMS' ? 'Có Thuốc Cận Date' : 'Cần Bổ Sung Cơ Số',
      'Ghi Chú': k.notes
    }));
    const ws1 = XLSX.utils.json_to_sheet(ws1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Tu_Thuoc_Va_Tui_So_Cuu_TT19');

    // Sheet 2: Nhật ký khám sơ cấp cứu
    const ws2Data = clinicLogs.map((v, idx) => ({
      STT: idx + 1,
      'Mã Lượt Khám': v.visitCode,
      'Thời Gian': v.dateTime,
      'Mã Nhân Viên': v.empId,
      'Họ Và Tên': v.empName,
      'Bộ Phận / Xưởng': v.department,
      'Ca Làm Việc': v.shift,
      'Triệu Chứng Lâm Sàng': v.symptom,
      'Huyết Áp': v.vitalSigns.bloodPressure,
      'Nhịp Tim (Bpm)': v.vitalSigns.heartRate,
      'Nhiệt Độ (°C)': v.vitalSigns.temperature,
      'SpO2 (%)': v.vitalSigns.spO2,
      'Chẩn Đoán Sơ Bộ': v.diagnosis,
      'Biện Pháp Xử Trí': v.treatment,
      'Thuốc Cấp Phát': v.prescribedMeds,
      'Nghỉ Tại Trạm (Phút)': v.restDurationMinutes,
      'Kết Quả': v.disposition === 'RETURN_TO_WORK' ? 'Trở lại làm việc' : v.disposition === 'SICK_LEAVE_HOME' ? 'Cho về nghỉ ốm' : 'Chuyển viện cấp cứu',
      'Cán Bộ Y Tế': v.attendingStaff,
      'Ghi Chú Chi Tiết': v.notes || ''
    }));
    const ws2 = XLSX.utils.json_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Nhat_Ky_Kham_Cap_Cuu');

    // Sheet 3: Theo dõi hạn dùng FEFO
    const ws3Data = inventoryItems.map((i, idx) => ({
      STT: idx + 1,
      'Mã Dược Phẩm': i.id,
      'Tên Thuốc / Vật Tư': i.itemName,
      'Thuộc Tủ / Túi': i.kitName,
      'Phân Loại': i.category === 'THUOC_THIET_YEU' ? 'Thuốc thiết yếu' : i.category === 'BANG_GA_SAT_TRUNG' ? 'Băng gạc & Sát trùng' : i.category === 'DUNG_CU_SO_CUU' ? 'Dụng cụ sơ cứu' : 'Thiết bị đo',
      'Đơn Vị Tính': i.unit,
      'Định Mức TT19': i.standardQty,
      'Tồn Kho Thực Tế': i.actualQty,
      'Số Lô Sản Xuất': i.batchNumber,
      'Ngày Sản Xuất': i.manufactureDate,
      'Hạn Sử Dụng (Expiry)': i.expiryDate,
      'Số Ngày Còn Lại': i.daysUntilExpiry,
      'Trạng Thái FEFO': i.fefoStatus === 'EXPIRED' ? 'Đã Hết Hạn' : i.fefoStatus === 'CRITICAL_30' ? 'Khẩn Cấp (<30 ngày)' : i.fefoStatus === 'WARNING_90' ? 'Cảnh Báo (<90 ngày)' : 'An Toàn',
      'Cảnh Báo Thiếu Cơ Số': i.minStockAlert ? 'Thiếu tồn kho tối thiểu' : 'Đầy đủ',
      'Đơn Giá (VNĐ)': i.unitPrice
    }));
    const ws3 = XLSX.utils.json_to_sheet(ws3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'Theo_Doi_Han_Dung_FEFO');

    // Sheet 4: Khám sức khỏe định kỳ
    const ws4Data = healthExams.map((e, idx) => ({
      STT: idx + 1,
      'Đợt Khám': e.examBatch,
      'Thời Gian Tổ Chức': e.examDate,
      'Bệnh Viện Phối Hợp': e.hospitalPartner,
      'Tổng Số CBCNV Được Khám': e.totalEmployeesEligible,
      'Thực Tế Đã Khám': e.totalExamined,
      'Sức Khỏe Loại I (Rất Khỏe)': e.type1Count,
      'Sức Khỏe Loại II (Khỏe)': e.type2Count,
      'Sức Khỏe Loại III (Trung Bình)': e.type3Count,
      'Sức Khỏe Loại IV (Yếu)': e.type4Count,
      'Sức Khỏe Loại V (Rất Yếu)': e.type5Count,
      'Khám Thính Lực Tiếng Ồn': e.occupationalScreening.audiometryNoiseTested,
      'Phát Hiện Suy Giảm Thính Lực': e.occupationalScreening.hearingLossDetected,
      'Chụp X-Quang Phổi Bụi': e.occupationalScreening.chestXRayTested,
      'Bụi Phổi Silic': e.occupationalScreening.silicosisDetected,
      'Trạng Thái Hồ Sơ': e.status
    }));
    const ws4 = XLSX.utils.json_to_sheet(ws4Data);
    XLSX.utils.book_append_sheet(wb, ws4, 'Kham_Suc_Khoe_Dinh_Ky');

    // Sheet 5: Đội sơ cấp cứu cơ sở
    const ws5Data = firstAidTeam.map((m, idx) => ({
      STT: idx + 1,
      'Mã Nhân Viên': m.empId,
      'Họ Và Tên': m.fullName,
      'Bộ Phận Làm Việc': m.department,
      'Khu Vực Trực Sơ Cứu': m.assignedZone,
      'Vai Trò Đội Cứu Nạn': m.roleInTeam === 'DOI_TRUONG' ? 'Đội Trưởng' : m.roleInTeam === 'DOI_PHO' ? 'Đội Phó' : m.roleInTeam === 'AN_TOAN_VE_SINH_VIEN' ? 'An Toàn Vệ Sinh Viên' : 'Cứu Thương Viên',
      'Số Chứng Chỉ SCC': m.certNumber,
      'Ngày Cấp Chứng Chỉ': m.certIssueDate,
      'Hạn Hiệu Lực': m.certExpiryDate,
      'Tình Trạng Chứng Chỉ': m.isCertValid ? 'Còn Hiệu Lực' : 'ĐÃ HẾT HẠN - CẦN TÁI HUẤN LUYỆN',
      'Số Điện Thoại Liên Hệ': m.phone,
      'Lần Diễn Tập Gần Nhất': m.lastDrillDate,
      'Kỹ Năng Đã Huấn Luyện': m.skills.join(', ')
    }));
    const ws5 = XLSX.utils.json_to_sheet(ws5Data);
    XLSX.utils.book_append_sheet(wb, ws5, 'Doi_So_Cap_Cuu_Co_So');

    XLSX.writeFile(wb, `Bao_Cao_Y_Te_Doanh_Nghiep_TT19_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // HÀM SUBMIT THÊM LƯỢT KHÁM MỚI
  const handleAddNewVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: ClinicVisitLog = {
      id: `VISIT-${Date.now()}`,
      visitCode: `KB-${new Date().toISOString().slice(5, 10).replace('-', '')}-${String(clinicLogs.length + 1).padStart(2, '0')}`,
      dateTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      empId: newVisitForm.empId,
      empName: newVisitForm.empName,
      department: newVisitForm.department,
      shift: newVisitForm.shift,
      symptom: newVisitForm.symptom || 'Mệt mỏi, nhức đầu',
      vitalSigns: {
        bloodPressure: newVisitForm.bloodPressure || '120/80',
        heartRate: Number(newVisitForm.heartRate) || 80,
        temperature: Number(newVisitForm.temperature) || 37.0,
        spO2: Number(newVisitForm.spO2) || 98
      },
      diagnosis: newVisitForm.diagnosis || 'Cảm mạo nhẹ',
      treatment: newVisitForm.treatment || 'Nghỉ ngơi, cấp thuốc hạ sốt',
      prescribedMeds: newVisitForm.prescribedMeds || 'Paracetamol 500mg x 1',
      restDurationMinutes: Number(newVisitForm.restDurationMinutes) || 30,
      disposition: newVisitForm.disposition,
      attendingStaff: newVisitForm.attendingStaff,
      notes: newVisitForm.notes,
      ...(newVisitForm.disposition === 'HOSPITAL_TRANSFER' && {
        hospitalTransferDetails: {
          hospitalName: newVisitForm.hospitalName,
          ambulanceCalled: false,
          escortStaff: 'Cán bộ Y tế trực tiếp áp tải',
          reason: 'Chuyển viện khẩn cấp'
        }
      })
    };

    setClinicLogs([newLog, ...clinicLogs]);
    setShowAddVisitModal(false);
  };

  return (
    <div className="space-y-1.5 animate-in fade-in duration-300">
      {/* ════════════════════ HEADER BANNER ════════════════════ */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 rounded-2xl p-2 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-emerald-900/40">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shadow-inner">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                Quản Lý Y Tế Doanh Nghiệp, Tủ Thuốc & Sơ Cấp Cứu Lao Động
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">
                TT 19/2016/TT-BYT & TT 28/2016
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Cơ số túi sơ cứu loại A/B/C, sổ khám sơ cấp cứu điện tử, cảnh báo hạn dùng thuốc FEFO & giám sát bệnh nghề nghiệp
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddVisitModal(true)}
            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tiếp Nhận Ca Khám Mới</span>
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

      {/* ════════════════════ 4 KPI CARDS TRỰC QUAN ════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tủ Thuốc & Túi Sơ Cứu:</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-slate-900 font-mono">
                {kpiStats.qualifiedKits}/{kpiStats.totalKits}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">Đạt chuẩn TT19</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Lượt Khám Tháng Này:</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-slate-900 font-mono">{kpiStats.totalVisitsMonth}</span>
              <span className="text-[11px] font-semibold text-slate-500">lượt ({kpiStats.hospitalTransfers} ca viện)</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Thuốc Cận Date (FEFO):</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-rose-600 font-mono">{kpiStats.criticalExpiryItems}</span>
              <span className="text-[11px] font-bold text-amber-600">thuốc &lt; 30 ngày ({kpiStats.lowStockAlerts} thiếu cơ số)</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tỷ Lệ Sức Khỏe Loại I-II:</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-emerald-700 font-mono">{kpiStats.healthyRate}%</span>
              <span className="text-[11px] text-slate-500">({kpiStats.totalEmployeesExamined} CBCNV khám)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════ 6 NÚT TABS PHÂN HỆ Y TẾ ════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center space-x-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollable-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('FIRST_AID_KITS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'FIRST_AID_KITS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Hospital className="w-4 h-4 text-amber-300" />
            <span>1. Tủ Thuốc &amp; Túi Sơ Cứu A/B/C (TT 19)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CLINIC_LOGS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'CLINIC_LOGS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-200" />
            <span>2. Nhật Ký Khám Sơ Cấp Cứu Hằng Ngày</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EXPIRY_FEFO')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'EXPIRY_FEFO'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Pill className="w-4 h-4 text-amber-200" />
            <span>3. Hạn Dùng Thuốc (FEFO) &amp; Tồn Kho Tối Thiểu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HEALTH_EXAM')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'HEALTH_EXAM'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-200" />
            <span>4. Khám Sức Khỏe &amp; Bệnh Nghề Nghiệp (TT 28)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FIRST_AID_TEAM')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'FIRST_AID_TEAM'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-200" />
            <span>5. Đội Sơ Cấp Cứu Cơ Sở (NĐ 44)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HEALTH_REPORTS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeTab === 'HEALTH_REPORTS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-200" />
            <span>6. Báo Cáo Y Tế 360° &amp; Xuất Excel</span>
          </button>
        </div>

        {/* ════════════════════ TAB 1: TỦ THUỐC & TÚI SƠ CỨU A/B/C ════════════════════ */}
        {activeTab === 'FIRST_AID_KITS' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Thanh công cụ tìm kiếm & lọc */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên túi sơ cứu, vị trí xưởng, người trực..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-medium">Phân loại:</span>
                <select
                  value={selectedKitFilter}
                  onChange={e => setSelectedKitFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
                >
                  <option value="ALL">Tất cả loại túi/tủ (6 vị trí)</option>
                  <option value="CENTRAL_CLINIC">Trạm Y Tế Trung Tâm</option>
                  <option value="KIT_TYPE_A">Túi Sơ Cứu Loại A (&lt; 25 người)</option>
                  <option value="KIT_TYPE_B">Túi Sơ Cứu Loại B (26 - 50 người)</option>
                  <option value="KIT_TYPE_C">Túi Sơ Cứu Loại C (51 - 150 người)</option>
                </select>
              </div>
            </div>

            {/* Thẻ hướng dẫn quy định TT 19/2016/TT-BYT */}
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-start space-x-3 text-xs text-teal-900">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold">Quy chuẩn cơ số sơ cấp cứu Thông tư 19/2016/TT-BYT Phụ lục 4:</b>
                <p className="text-[11px] text-teal-800 mt-0.5">
                  • <b>Túi A</b>: Tối thiểu 1 túi cho khu vực &lt; 25 lao động (Văn phòng, Căn tin).<br />
                  • <b>Túi B</b>: Tối thiểu 1 túi cho 26 - 50 lao động (Khu vực Kho vận, Đóng gói).<br />
                  • <b>Túi C</b>: Tối thiểu 1 túi cho 51 - 150 lao động (Xưởng dập cơ khí, Xưởng may). Cơ số bắt buộc: Băng tam giác, nẹp gãy xương, gạc tiệt trùng, Povidine, băng cuộn và kéo y tế vô trùng.
                </p>
              </div>
            </div>

            {/* Grid danh sách các Tủ & Túi sơ cứu */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredKits.map(kit => (
                <div
                  key={kit.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all p-3.5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${
                          kit.type === 'CENTRAL_CLINIC'
                            ? 'bg-teal-100 text-teal-800'
                            : kit.type === 'KIT_TYPE_C'
                            ? 'bg-rose-100 text-rose-800'
                            : kit.type === 'KIT_TYPE_B'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Hospital className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {kit.id}
                          </span>
                          <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            kit.type === 'CENTRAL_CLINIC'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {kit.type === 'CENTRAL_CLINIC' ? 'Trạm Y Tế' : `Túi Loại ${kit.type.replace('KIT_TYPE_', '')}`}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        kit.status === 'QUALIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : kit.status === 'EXPIRING_ITEMS'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {kit.status === 'QUALIFIED' ? 'Đầy đủ định mức' : kit.status === 'EXPIRING_ITEMS' ? 'Có thuốc cận date' : 'Cần bổ sung'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs leading-snug">
                      {kit.name}
                    </h4>

                    <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400 font-medium shrink-0">📍 Vị trí:</span>
                        <span className="font-semibold text-slate-800 truncate">{kit.location}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400 font-medium shrink-0">👥 Quy mô:</span>
                        <span className="text-slate-700 truncate">{kit.capacityScope}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400 font-medium shrink-0">👤 Phụ trách:</span>
                        <span className="font-semibold text-teal-700">{kit.responsiblePerson}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400 font-medium shrink-0">📞 Hotline:</span>
                        <span className="font-mono text-slate-700">{kit.phone}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      "{kit.notes}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <div>
                      <span>Kiểm tra: </span>
                      <b className="font-mono text-slate-700">{kit.lastCheckedDate}</b>
                    </div>
                    <div>
                      <span>Hạn kế: </span>
                      <b className="font-mono text-teal-700">{kit.nextCheckDueDate}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 2: NHẬT KÝ KHÁM SƠ CẤP CỨU HẰNG NGÀY ════════════════════ */}
        {activeTab === 'CLINIC_LOGS' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Bộ lọc nhật ký khám */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm mã NV, tên nhân viên, triệu chứng, chẩn đoán..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-medium">Kết quả xử trí:</span>
                <select
                  value={selectedDispositionFilter}
                  onChange={e => setSelectedDispositionFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
                >
                  <option value="ALL">Tất cả kết quả</option>
                  <option value="RETURN_TO_WORK">Trở lại làm việc</option>
                  <option value="SICK_LEAVE_HOME">Cho về nghỉ ốm BHXH</option>
                  <option value="HOSPITAL_TRANSFER">Chuyển viện khẩn cấp</option>
                </select>
              </div>
            </div>

            {/* Bảng nhật ký ca khám */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5">Thời Gian &amp; Mã Ca</th>
                    <th className="px-3 py-2.5">Nhân Viên / Xưởng</th>
                    <th className="px-3 py-2.5">Chỉ Số Sinh Hiệu</th>
                    <th className="px-3 py-2.5">Triệu Chứng &amp; Chẩn Đoán</th>
                    <th className="px-3 py-2.5">Xử Trí &amp; Thuốc Cấp</th>
                    <th className="px-3 py-2.5 text-center">Nghỉ Tại Trạm</th>
                    <th className="px-3 py-2.5 text-center">Kết Quả</th>
                    <th className="px-3 py-2.5 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClinicLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-[11px]">{log.dateTime}</div>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono">
                          {log.visitCode}
                        </span>
                        <span className="ml-1 text-[10px] text-slate-400 font-medium">({log.shift})</span>
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{log.empName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.empId} • {log.department}</div>
                      </td>

                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-[11px]">
                          <span className="text-slate-500">HA:</span>
                          <b className="text-slate-800 font-mono">{log.vitalSigns.bloodPressure}</b>
                          <span className="text-[10px] text-slate-400">mmHg</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                          <span>Nhiệt độ: <b className="text-rose-700 font-mono">{log.vitalSigns.temperature}°C</b></span>
                          <span>SpO2: <b className="text-emerald-700 font-mono">{log.vitalSigns.spO2}%</b></span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 max-w-xs">
                        <div className="text-rose-700 font-semibold text-[11px]">• {log.symptom}</div>
                        <div className="text-slate-600 text-[10px]">Chẩn đoán: {log.diagnosis}</div>
                      </td>

                      <td className="px-3 py-2.5 max-w-xs">
                        <div className="text-slate-800 text-[11px]">• {log.treatment}</div>
                        <div className="text-emerald-700 font-medium text-[10px]">Thuốc: {log.prescribedMeds}</div>
                        <div className="text-[10px] text-slate-400">Trực: {log.attendingStaff}</div>
                      </td>

                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-700 text-xs">
                        {log.restDurationMinutes} phút
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        {log.disposition === 'RETURN_TO_WORK' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Về xưởng làm việc
                          </span>
                        ) : log.disposition === 'SICK_LEAVE_HOME' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Nghỉ ốm BHXH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            Chuyển viện khẩn cấp
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVisitForPrint(log);
                            setShowPrintVisitModal(true);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all flex items-center space-x-1 mx-auto cursor-pointer"
                          title="In phiếu khám sơ cứu A4"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>In Phiếu A4</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 3: HẠN DÙNG THUỐC FEFO & TỒN KHO TỐI THIỂU ════════════════════ */}
        {activeTab === 'EXPIRY_FEFO' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Bộ lọc hạn dùng & tìm kiếm */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên thuốc, số lô, túi sơ cứu..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-medium">Trạng thái FEFO:</span>
                <select
                  value={selectedFefoFilter}
                  onChange={e => setSelectedFefoFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
                >
                  <option value="ALL">Tất cả trạng thái dược phẩm</option>
                  <option value="CRITICAL_30">🔴 Khẩn cấp (&lt; 30 ngày hết hạn)</option>
                  <option value="WARNING_90">🟡 Cảnh báo (30 - 90 ngày)</option>
                  <option value="GOOD">🟢 An toàn (&gt; 90 ngày)</option>
                  <option value="EXPIRED">⚫ Đã hết hạn (Cần hủy)</option>
                </select>
              </div>
            </div>

            {/* Thẻ nguyên tắc FEFO */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold">Nguyên tắc quản lý dược phẩm FEFO (First Expired, First Out):</b>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  • Thuốc có hạn dùng gần hơn bắt buộc phải được ưu tiên xuất dùng trước.<br />
                  • Đối với các lô thuốc còn dưới 30 ngày, hệ thống tự động khóa cấp phát cho các túi sơ cứu xưởng, thu hồi về trạm y tế trung tâm hoặc lập biên bản tiêu hủy rác thải y tế theo quy chuẩn Thông tư liên tịch 58/2015/TTLT-BYT-BTNMT.
                </p>
              </div>
            </div>

            {/* Bảng theo dõi hạn dùng thuốc */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5">Tên Dược Phẩm / Vật Tư Y Tế</th>
                    <th className="px-3 py-2.5">Vị Trí Tủ / Túi</th>
                    <th className="px-3 py-2.5 text-center">ĐVT</th>
                    <th className="px-3 py-2.5 text-center">Định Mức / Tồn Kho</th>
                    <th className="px-3 py-2.5">Số Lô &amp; Ngày SX</th>
                    <th className="px-3 py-2.5">Hạn Dùng (Expiry Date)</th>
                    <th className="px-3 py-2.5 text-center">Cảnh Báo FEFO</th>
                    <th className="px-3 py-2.5 text-right">Đơn Giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{item.itemName}</div>
                        <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                        {item.minStockAlert && (
                          <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                            Thiếu tồn tối thiểu!
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 font-medium text-slate-600">
                        {item.kitName}
                      </td>

                      <td className="px-3 py-2.5 text-center text-slate-500 font-medium">
                        {item.unit}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <span className="font-mono font-bold text-slate-900">{item.actualQty}</span>
                        <span className="text-slate-400"> / {item.standardQty}</span>
                      </td>

                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                        <div>Lô: <b>{item.batchNumber}</b></div>
                        <div className="text-[10px] text-slate-400">SX: {item.manufactureDate}</div>
                      </td>

                      <td className="px-3 py-2.5 font-mono">
                        <div className="font-bold text-slate-900">{item.expiryDate}</div>
                        <div className="text-[10px] text-slate-500">Còn {item.daysUntilExpiry} ngày</div>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        {item.fefoStatus === 'CRITICAL_30' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse flex items-center justify-center space-x-1 w-max mx-auto">
                            <AlertCircle className="w-3 h-3" />
                            <span>Khẩn cấp (&lt; 30 ngày)</span>
                          </span>
                        ) : item.fefoStatus === 'WARNING_90' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 flex items-center justify-center space-x-1 w-max mx-auto">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Cận date (&lt; 90 ngày)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center space-x-1 w-max mx-auto">
                            <Check className="w-3 h-3" />
                            <span>An toàn dài hạn</span>
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-slate-900 font-semibold">
                        {item.unitPrice.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 4: KHÁM SỨC KHỎE ĐỊNH KỲ & BỆNH NGHỀ NGHIỆP ════════════════════ */}
        {activeTab === 'HEALTH_EXAM' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Thông tin khám sức khỏe định kỳ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
              {healthExams.map(exam => (
                <div key={exam.id} className="bg-white rounded-xl border border-slate-200 p-2 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {exam.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{exam.examBatch}</h4>
                      <p className="text-xs text-slate-500">🏥 Đơn vị khám: {exam.hospitalPartner}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đã nộp Sở Y Tế
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                    <span>Tổng nhân sự khám: <b className="font-mono text-slate-900">{exam.totalExamined}/{exam.totalEmployeesEligible}</b></span>
                    <span className="font-semibold text-emerald-700">Tỷ lệ: {((exam.totalExamined / exam.totalEmployeesEligible) * 100).toFixed(1)}%</span>
                  </div>

                  {/* Phân loại sức khỏe I - V theo Bộ Y Tế */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Phân Loại Sức Khỏe (Bộ Y Tế):</span>
                      <span className="text-[11px] text-slate-400 font-normal">Quy chuẩn 5 mức độ</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-center text-xs">
                      <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg">
                        <span className="text-[10px] font-bold text-emerald-700 block">Loại I</span>
                        <b className="text-slate-900 font-mono text-xs">{exam.type1Count}</b>
                        <span className="text-[9px] text-slate-500 block">Rất khỏe</span>
                      </div>

                      <div className="bg-teal-50 border border-teal-200 p-1.5 rounded-lg">
                        <span className="text-[10px] font-bold text-teal-700 block">Loại II</span>
                        <b className="text-slate-900 font-mono text-xs">{exam.type2Count}</b>
                        <span className="text-[9px] text-slate-500 block">Khỏe</span>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 p-1.5 rounded-lg">
                        <span className="text-[10px] font-bold text-blue-700 block">Loại III</span>
                        <b className="text-slate-900 font-mono text-xs">{exam.type3Count}</b>
                        <span className="text-[9px] text-slate-500 block">T.Bình</span>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 p-1.5 rounded-lg">
                        <span className="text-[10px] font-bold text-amber-700 block">Loại IV</span>
                        <b className="text-amber-800 font-mono text-xs">{exam.type4Count}</b>
                        <span className="text-[9px] text-slate-500 block">Yếu</span>
                      </div>

                      <div className="bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                        <span className="text-[10px] font-bold text-rose-700 block">Loại V</span>
                        <b className="text-rose-800 font-mono text-xs">{exam.type5Count}</b>
                        <span className="text-[9px] text-slate-500 block">Rất yếu</span>
                      </div>
                    </div>
                  </div>

                  {/* Tầm soát bệnh nghề nghiệp chuyên sâu */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                    <b className="text-slate-900 block font-bold">Tầm Soát Yếu Tố Bệnh Nghề Nghiệp (TT 28/2016):</b>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block">Đo thính lực (Ồn):</span>
                        <b className="text-slate-900">{exam.occupationalScreening.audiometryNoiseTested} ca</b>
                        <span className="text-[10px] text-amber-600 block">({exam.occupationalScreening.hearingLossDetected} ca giảm nhẹ)</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block">X-quang phổi bụi:</span>
                        <b className="text-slate-900">{exam.occupationalScreening.chestXRayTested} ca</b>
                        <span className="text-[10px] text-emerald-600 block">({exam.occupationalScreening.silicosisDetected} ca bệnh nghề nghiệp)</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block">Xét nghiệm hóa chất:</span>
                        <b className="text-slate-900">{exam.occupationalScreening.toxicSolventTested} ca</b>
                        <span className="text-[10px] text-emerald-600 block">(0 ca nhiễm độc)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 5: ĐỘI SƠ CẤP CỨU CƠ SỞ ════════════════════ */}
        {activeTab === 'FIRST_AID_TEAM' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Thẻ quy định Nghị định 44/2016/NĐ-CP */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-start space-x-3 text-xs text-rose-950">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold">Quy định lực lượng sơ cứu, cấp cứu cơ sở theo Nghị định 44/2016/NĐ-CP:</b>
                <p className="text-[11px] text-rose-900 mt-0.5">
                  • Cơ sở sản xuất có từ 301 đến 1.000 lao động phải có tối thiểu 1 người làm công tác y tế có trình độ y sĩ trở lên hoặc hợp đồng với cơ sở y tế đủ năng lực.<br />
                  • Thành viên đội sơ cấp cứu và mạng lưới An toàn vệ sinh viên bắt buộc phải được huấn luyện cấp chứng chỉ định kỳ 2 năm một lần.
                </p>
              </div>
            </div>

            {/* Bảng danh sách Đội sơ cấp cứu */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5">Thành Viên Cấp Cứu</th>
                    <th className="px-3 py-2.5">Bộ Phận &amp; Vị Trí Trực</th>
                    <th className="px-3 py-2.5 text-center">Vai Trò Đội</th>
                    <th className="px-3 py-2.5">Chứng Chỉ Sơ Cấp Cứu</th>
                    <th className="px-3 py-2.5 text-center">Hạn Hiệu Lực</th>
                    <th className="px-3 py-2.5">Kỹ Năng Đã Huấn Luyện</th>
                    <th className="px-3 py-2.5 text-center">Điện Thoại Trực</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {firstAidTeam.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{member.fullName}</div>
                        <span className="text-[10px] text-slate-500 font-mono">{member.empId}</span>
                      </td>

                      <td className="px-3 py-2.5 max-w-xs">
                        <div className="font-semibold text-slate-800">{member.department}</div>
                        <div className="text-[10px] text-slate-500">📍 {member.assignedZone}</div>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.roleInTeam === 'DOI_TRUONG'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : member.roleInTeam === 'DOI_PHO'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {member.roleInTeam === 'DOI_TRUONG' ? 'Đội Trưởng' : member.roleInTeam === 'DOI_PHO' ? 'Đội Phó' : member.roleInTeam === 'AN_TOAN_VE_SINH_VIEN' ? 'ATVSV' : 'Cứu Thương Viên'}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 font-mono text-[11px]">
                        <div className="font-bold text-slate-800">{member.certNumber}</div>
                        <div className="text-[10px] text-slate-400">Cấp ngày: {member.certIssueDate}</div>
                      </td>

                      <td className="px-3 py-2.5 text-center whitespace-nowrap font-mono">
                        {member.isCertValid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Hạn đến {member.certExpiryDate}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            HẾT HẠN - CẦN TÁI ĐÀO TẠO
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2.5 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {member.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-center font-mono font-bold text-rose-700 text-xs whitespace-nowrap">
                        📞 {member.phone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════ TAB 6: BÁO CÁO Y TẾ 360° & XUẤT EXCEL ════════════════════ */}
        {activeTab === 'HEALTH_REPORTS' && (
          <div className="p-2 space-y-1.5 animate-in fade-in">
            {/* Biểu đồ phân tích cơ cấu bệnh tật & chi phí y tế */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {/* Mô hình bệnh tật */}
              <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Cơ Cấu Bệnh Tật Thường Gặp Trong Doanh Nghiệp (YTD 2026)
                  </h4>
                  <span className="text-[10px] text-slate-400">Dữ liệu trạm xá</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">1. Cảm cúm &amp; Viêm đường hô hấp trên</span>
                      <span className="font-bold text-slate-900 font-mono">38.5% (142 ca)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '38.5%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">2. Đau dạ dày &amp; Rối loạn tiêu hóa</span>
                      <span className="font-bold text-slate-900 font-mono">24.2% (89 ca)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24.2%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">3. Đau mỏi cơ xương khớp (Ergonomics)</span>
                      <span className="font-bold text-slate-900 font-mono">21.3% (78 ca)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '21.3%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">4. Chấn thương trầy xước cơ học nhẹ</span>
                      <span className="font-bold text-slate-900 font-mono">16.0% (59 ca)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: '16.0%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Thống kê tỷ lệ nghỉ ốm & ngân sách thuốc */}
              <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Chỉ Số Nghỉ Ốm &amp; Chi Phí Chăm Sóc Sức Khỏe
                  </h4>
                  <span className="text-[10px] text-slate-400">KPI Sức Khỏe</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tỷ Lệ Nghỉ Ốm (Sick-Leave):</span>
                    <b className="text-lg font-black text-slate-900 font-mono">0.82%</b>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Dưới ngưỡng KPI 1.2%</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Chi Phí Thuốc / Tháng:</span>
                    <b className="text-lg font-black text-teal-700 font-mono">12.850.000 đ</b>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Bình quân 15.100 đ / người</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-900">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Tuân thủ đầy đủ chế độ BHYT &amp; Khám định kỳ</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    100% người lao động được cấp thẻ BHYT đầy đủ. Không có sự cố ngộ độc thực phẩm tập thể hoặc tai nạn lao động nghiêm trọng phát sinh trong năm 2026.
                  </p>
                </div>
              </div>
            </div>

            {/* Banner xuất Excel 5 sheet */}
            <div className="bg-gradient-to-r from-slate-900 to-teal-950 p-2 rounded-xl text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Xuất Trọn Bộ Hồ Sơ Y Tế Doanh Nghiệp (Excel 5 Sheet)</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Bao gồm: Sổ kiểm tra tủ thuốc TT 19, Nhật ký ca khám, Danh mục thuốc FEFO, Kết quả khám định kỳ và Đội sơ cứu cơ sở.
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

      {/* ════════════════════ MODAL: TIẾP NHẬN CA KHÁM MỚI ════════════════════ */}
      {showAddVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-2 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-gradient-to-r from-teal-900 to-emerald-900 p-2 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Stethoscope className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">Tiếp Nhận &amp; Khám Sơ Cấp Cứu Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVisitModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewVisit} className="p-2.5 space-y-1.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã / Tên Cán Bộ Nhân Viên:</label>
                  <select
                    value={newVisitForm.empId}
                    onChange={e => {
                      const emp = employees.find(x => x.id === e.target.value);
                      if (emp) {
                        setNewVisitForm({
                          ...newVisitForm,
                          empId: emp.id,
                          empName: emp.name,
                          department: emp.department || 'Khối Sản Xuất'
                        });
                      }
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ca Làm Việc:</label>
                  <select
                    value={newVisitForm.shift}
                    onChange={e => setNewVisitForm({ ...newVisitForm, shift: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="CA_1">Ca 1 (06:00 - 14:00)</option>
                    <option value="CA_2">Ca 2 (14:00 - 22:00)</option>
                    <option value="CA_3">Ca 3 (22:00 - 06:00)</option>
                    <option value="HANH_CHINH">Hành Chính (08:00 - 17:00)</option>
                  </select>
                </div>
              </div>

              {/* Đo sinh hiệu */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <b className="text-slate-800 block">Chỉ Số Sinh Hiệu Tại Thời Điểm Tiếp Nhận:</b>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">Huyết Áp (mmHg):</label>
                    <input
                      type="text"
                      value={newVisitForm.bloodPressure}
                      onChange={e => setNewVisitForm({ ...newVisitForm, bloodPressure: e.target.value })}
                      placeholder="120/80"
                      className="w-full border border-slate-300 rounded p-1.5 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Nhịp Tim (bpm):</label>
                    <input
                      type="number"
                      value={newVisitForm.heartRate}
                      onChange={e => setNewVisitForm({ ...newVisitForm, heartRate: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1.5 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Nhiệt Độ (°C):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newVisitForm.temperature}
                      onChange={e => setNewVisitForm({ ...newVisitForm, temperature: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1.5 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">SpO2 (%):</label>
                    <input
                      type="number"
                      value={newVisitForm.spO2}
                      onChange={e => setNewVisitForm({ ...newVisitForm, spO2: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded p-1.5 font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Triệu Chứng Bệnh Nhân Khai Báo:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Đau bụng từng cơn, chóng mặt hoa mắt, vết rách da bàn tay..."
                  value={newVisitForm.symptom}
                  onChange={e => setNewVisitForm({ ...newVisitForm, symptom: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chẩn Đoán Sơ Bộ:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Rối loạn tiêu hóa nhẹ, trầy xước nông..."
                    value={newVisitForm.diagnosis}
                    onChange={e => setNewVisitForm({ ...newVisitForm, diagnosis: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xử Trí Sơ Cứu:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Rửa sát trùng Povidine, chườm ấm..."
                    value={newVisitForm.treatment}
                    onChange={e => setNewVisitForm({ ...newVisitForm, treatment: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thuốc Cấp Phát:</label>
                  <input
                    type="text"
                    placeholder="VD: Berberin 100mg x 4 viên, Oresol 1 gói..."
                    value={newVisitForm.prescribedMeds}
                    onChange={e => setNewVisitForm({ ...newVisitForm, prescribedMeds: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời Gian Nghỉ Tại Trạm (Phút):</label>
                  <input
                    type="number"
                    value={newVisitForm.restDurationMinutes}
                    onChange={e => setNewVisitForm({ ...newVisitForm, restDurationMinutes: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hướng Xử Trí Kết Quả:</label>
                <select
                  value={newVisitForm.disposition}
                  onChange={e => setNewVisitForm({ ...newVisitForm, disposition: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="RETURN_TO_WORK">Trở lại làm việc (Sau khi hồi phục tại trạm)</option>
                  <option value="SICK_LEAVE_HOME">Cho về nghỉ ốm hưởng BHXH trong ngày</option>
                  <option value="HOSPITAL_TRANSFER">Chuyển viện khẩn cấp lên tuyến trên</option>
                </select>
              </div>

              {newVisitForm.disposition === 'HOSPITAL_TRANSFER' && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <label className="block font-bold text-rose-800 mb-1">Bệnh Viện Tiếp Nhận:</label>
                  <input
                    type="text"
                    value={newVisitForm.hospitalName}
                    onChange={e => setNewVisitForm({ ...newVisitForm, hospitalName: e.target.value })}
                    className="w-full border border-rose-300 rounded-lg p-2 font-medium text-rose-900 bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cán Bộ Y Tế Phụ Trách:</label>
                <input
                  type="text"
                  value={newVisitForm.attendingStaff}
                  onChange={e => setNewVisitForm({ ...newVisitForm, attendingStaff: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Lưu Phiếu Khám
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL: IN PHIẾU KHÁM SƠ CỨU / CHUYỂN VIỆN A4 ════════════════════ */}
      {showPrintVisitModal && selectedVisitForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-slate-900 p-3.5 text-white flex items-center justify-between no-print">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Xem Trước Bản In Phiếu Tiếp Nhận Y Tế &amp; Chuyển Tuyến (A4)</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintVisitModal(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Khổ giấy A4 hiển thị */}
            <div className="p-8 space-y-3 text-slate-900 bg-white font-serif text-xs leading-relaxed printable-a4">
              {/* Tiêu ngữ */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-xs">CÔNG TY CỔ PHẦN TẬP ĐOÀN CÔNG NGHỆ OMNI</h4>
                  <p className="text-[10px] text-slate-600">BỘ PHẬN Y TẾ &amp; AN TOÀN VỆ SINH LAO ĐỘNG</p>
                  <p className="text-[10px] text-slate-500">Số: {selectedVisitForPrint.visitCode}/PK-YT2026</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold uppercase text-xs">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                  <p className="text-[10px] italic">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="text-[10px] text-slate-500 mt-1">Bình Dương, ngày {selectedVisitForPrint.dateTime.slice(8, 10)} tháng {selectedVisitForPrint.dateTime.slice(5, 7)} năm 2026</p>
                </div>
              </div>

              {/* Tiêu đề phiếu */}
              <div className="text-center space-y-1">
                <h2 className="text-base font-black uppercase tracking-tight">
                  {selectedVisitForPrint.disposition === 'HOSPITAL_TRANSFER'
                    ? 'PHIẾU CHUYỂN TUYẾN CẤP CỨU ĐIỀU TRỊ BỆNH NHÂN'
                    : 'PHIẾU KHÁM SƠ CẤP CỨU & CẤP PHÁT THUỐC CƠ SỞ'}
                </h2>
                <p className="text-[10px] italic text-slate-500">
                  (Căn cứ Thông tư số 19/2016/TT-BYT ngày 30/06/2016 của Bộ Y Tế)
                </p>
              </div>

              {/* Thông tin bệnh nhân */}
              <div className="space-y-2 border border-slate-200 p-3 rounded">
                <div className="grid grid-cols-2 gap-2">
                  <div>• Họ và tên người bệnh: <b>{selectedVisitForPrint.empName}</b></div>
                  <div>• Mã số nhân viên: <b className="font-mono">{selectedVisitForPrint.empId}</b></div>
                  <div>• Bộ phận công tác: <b>{selectedVisitForPrint.department}</b></div>
                  <div>• Ca làm việc: <b className="font-mono">{selectedVisitForPrint.shift}</b></div>
                  <div>• Thời điểm tiếp nhận: <b className="font-mono">{selectedVisitForPrint.dateTime}</b></div>
                  <div>• Thẻ BHYT: <b className="font-mono">DN 4 79 7922889988</b></div>
                </div>
              </div>

              {/* Sinh hiệu & Chẩn đoán */}
              <div className="space-y-2 border border-slate-200 p-3 rounded">
                <div className="font-bold border-b border-slate-200 pb-1 uppercase text-[11px]">Tình Trạng Tiếp Nhận &amp; Khám Lâm Sàng:</div>
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-2 rounded">
                  <div>Huyết áp: <b>{selectedVisitForPrint.vitalSigns.bloodPressure}</b> mmHg</div>
                  <div>Nhịp tim: <b>{selectedVisitForPrint.vitalSigns.heartRate}</b> bpm</div>
                  <div>Nhiệt độ: <b>{selectedVisitForPrint.vitalSigns.temperature}</b> °C</div>
                  <div>SpO2: <b>{selectedVisitForPrint.vitalSigns.spO2}</b> %</div>
                </div>
                <div>• <b>Triệu chứng:</b> {selectedVisitForPrint.symptom}</div>
                <div>• <b>Chẩn đoán sơ bộ:</b> {selectedVisitForPrint.diagnosis}</div>
                <div>• <b>Biện pháp sơ cứu đã thực hiện:</b> {selectedVisitForPrint.treatment}</div>
                <div>• <b>Thuốc và vật tư đã cấp:</b> {selectedVisitForPrint.prescribedMeds}</div>
                <div>• <b>Thời gian nằm theo dõi tại phòng y tế:</b> {selectedVisitForPrint.restDurationMinutes} phút</div>
              </div>

              {/* Kết luận & Hướng xử trí */}
              <div className="space-y-1.5 border border-slate-200 p-3 rounded bg-slate-50/50">
                <div className="font-bold uppercase text-[11px]">Kết Luận Xử Trí Y Tế:</div>
                <div>
                  • Kết quả đánh giá: {' '}
                  <b className="uppercase">
                    {selectedVisitForPrint.disposition === 'RETURN_TO_WORK'
                      ? 'Đủ điều kiện sức khỏe trở lại vị trí làm việc'
                      : selectedVisitForPrint.disposition === 'SICK_LEAVE_HOME'
                      ? 'Đề nghị cho nghỉ làm việc hưởng chế độ bảo hiểm ốm đau trong ngày'
                      : `Chuyển viện khẩn cấp đến: ${selectedVisitForPrint.hospitalTransferDetails?.hospitalName || 'Bệnh Viện Tuyến Trên'}`}
                  </b>
                </div>
                {selectedVisitForPrint.notes && (
                  <div className="italic text-slate-600">• Ghi chú theo dõi: {selectedVisitForPrint.notes}</div>
                )}
              </div>

              {/* Ký tên 3 bên */}
              <div className="pt-6 grid grid-cols-3 gap-1.5 text-center">
                <div>
                  <p className="font-bold uppercase">NGƯỜI BỆNH / NHÂN VIÊN</p>
                  <p className="text-[10px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                  <div className="h-14" />
                  <p className="font-bold">{selectedVisitForPrint.empName}</p>
                </div>

                <div>
                  <p className="font-bold uppercase">TRƯỞNG BỘ PHẬN / QUẢN LÝ</p>
                  <p className="text-[10px] italic text-slate-500">(Xác nhận vắng mặt ca trực)</p>
                  <div className="h-14" />
                  <p className="font-bold">Đã ký duyệt</p>
                </div>

                <div>
                  <p className="font-bold uppercase">CÁN BỘ Y TẾ PHỤ TRÁCH</p>
                  <p className="text-[10px] italic text-slate-500">(Ký, đóng dấu y tế)</p>
                  <div className="h-14" />
                  <p className="font-bold">{selectedVisitForPrint.attendingStaff}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
