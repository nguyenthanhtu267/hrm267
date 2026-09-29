import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
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
  AlertTriangle, 
  ClipboardCheck, 
  QrCode, 
  ShieldCheck, 
  CheckCheck, 
  FileSpreadsheet, 
  BarChart3, 
  HelpCircle, 
  ArrowRight, 
  ChevronRight, 
  Tag, 
  Flame, 
  Wrench, 
  Zap, 
  Droplets, 
  Wifi, 
  Server, 
  Coffee, 
  Sun, 
  Leaf, 
  Activity, 
  Sliders, 
  TrendingDown, 
  TrendingUp, 
  Star, 
  Send, 
  Layers, 
  Laptop, 
  Camera, 
  Maximize2,
  Cpu,
  Gauge,
  RotateCw,
  CheckSquare,
  Square,
  SlidersHorizontal,
  FileCheck2,
  Boxes,
  Share2,
  Factory,
  Warehouse
} from 'lucide-react';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';

interface OfficeCostsAndInfraHubProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
}

// 6 PHÂN HỆ NGHIỆP VỤ CHUYÊN BIỆT
export type InfraSubCategory = 
  | 'UTILITIES_EXPENSES'       // 1. Đối Soát Tiện Ích Điện 3 Giá EVN, Nước & Mạng
  | 'PREVENTIVE_MAINTENANCE'   // 2. Kế Hoạch Bảo Dưỡng Ngăn Ngừa (PM Schedule) & PCCC
  | 'FACILITIES_LEASES'        // 3. Quản Lý Mặt Bằng, Diện Tích & Hợp Đồng Thuê
  | 'WORK_ORDERS_HELPDESK'     // 4. Phiếu Tiếp Nhận Báo Hỏng & Sửa Chữa (Work Orders)
  | 'ENERGY_MANAGEMENT_ESG'    // 5. Kiểm Soát Tiêu Thụ Năng Lượng Xanh & Chống Lãng Phí ESG
  | 'ASSET_DEPRECIATION';      // 6. Kiểm Kê Tài Sản Cố Định, CCDC & Khấu Hao Thiết Bị

// 1. Hóa Đơn Tiện Ích & Năng Lượng
export interface UtilityBill {
  id: string;
  category: 'ELECTRICITY_EVN' | 'WATER_BIWASE' | 'INTERNET_TELECOM' | 'DRINKING_WATER' | 'GAS_LPG';
  categoryTitle: string;
  providerName: string;
  billingMonth: string;
  invoiceCode: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  consumptionUnit: string;
  consumptionAmount: number;
  metricsBreakdown?: {
    peakHoursKwh?: number;    // Giờ cao điểm (17:00 - 20:00 & 09:30 - 11:30)
    normalHoursKwh?: number;  // Giờ bình thường
    offPeakHoursKwh?: number; // Giờ thấp điểm (22:00 - 04:00)
    powerFactorCosPhi?: number; // Hệ số cos phi
    reactivePowerPenalty?: number; // Tiền phạt cos phi
  };
  changePercentVsLastMonth: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  notes: string;
}

// 2. Kế Hoạch Bảo Dưỡng Ngăn Ngừa (PM Schedule)
export interface PMScheduleItem {
  id: string;
  systemName: string; // Tên hệ thống (VRV, PCCC, Máy phát...)
  systemCategory: 'HVAC_VRV' | 'FIRE_PCCC' | 'GENERATOR' | 'SUBSTATION' | 'ELEVATOR' | 'AIR_COMPRESSOR';
  categoryLabel: string;
  location: string;
  frequencyMonths: number; // Định kỳ mấy tháng/lần
  lastMaintenanceDate: string;
  nextDueDate: string;
  assignedEngineer: string;
  serviceVendor: string;
  estimatedCost: number;
  checklistItems: string[];
  status: 'COMPLETED' | 'SCHEDULED' | 'OVERDUE' | 'IN_PROGRESS';
  isStrictSafetyCompliance?: boolean; // Yêu cầu nghiêm ngặt QCVN theo TT 36/2019/TT-BLĐTBXH
  safetyCertificateCode?: string;     // Số tem kiểm định
  safetyCertificateAgency?: string;   // Cơ quan kiểm định ATLĐ
  safetyCertificateExpiry?: string;   // Hạn kiểm định
  monthlyScheduleMatrix?: number[];   // Mảng 12 tháng: 1 = Đã xong, 2 = Kế hoạch, 3 = Quá hạn, 0 = Không có
}

// 3. Mặt Bằng & Hợp Đồng Thuê
export interface FacilityLease {
  id: string;
  premisesName: string;
  addressLocation: string;
  lessorName: string; // Bên cho thuê
  totalAreaM2: number;
  usableAreaM2: number;
  unitPriceM2: number;
  monthlyRent: number;
  leaseStartDate: string;
  leaseEndDate: string;
  depositAmount: number;
  paymentCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  nextPaymentDate: string;
  occupancyRatePercent: number;
  escalationClause?: string; // Tăng giá thuê theo chu kỳ (vd: +5%/năm)
  allocatedDepts: Array<{ deptName: string; areaM2: number; staffCount: number; type: 'PROD' | 'WAREHOUSE' | 'OFFICE' | 'COMMON' }>;
}

// 4. Phiếu Yêu Cầu Sửa Chữa (Work Order Helpdesk)
export interface WorkOrderTicket {
  id: string;
  ticketCode: string; // VD: WO-2026-081
  title: string;
  reportedBy: string;
  reportedDept: string;
  locationDetail: string;
  reportedAt: string;
  urgency: 'URGENT' | 'HIGH' | 'NORMAL';
  assignedTechnician: string;
  technicianType: 'INTERNAL_MEP' | 'EXTERNAL_VENDOR';
  solutionDescription?: string;
  sparePartsUsed?: Array<{ partName: string; quantity: number; unitPrice: number }>;
  materialCost: number;
  laborCost: number;
  completedAt?: string;
  satisfactionRating?: number; // 1 - 5 sao
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

// 5. Kiểm Kê Tài Sản & Khấu Hao Thiết Bị
export interface InfrastructureAsset {
  id: string;
  assetTag: string; // VD: AST-CAM-01
  assetName: string;
  category: 'SECURITY_CCTV' | 'ACCESS_CONTROL' | 'OFFICE_FURNITURE' | 'OFFICE_MACHINE' | 'ELECTRICAL' | 'AIR_CONDITION';
  categoryTitle: string;
  installedLocation: string;
  deptInCharge: string;
  purchaseDate: string;
  originalCost: number; // Nguyên giá
  depreciationYears: number; // Số năm trích khấu hao (TT 45/2013/TT-BTC)
  accumulatedDepreciation: number; // Đã khấu hao
  netBookValue: number; // Giá trị còn lại
  condition: 'EXCELLENT' | 'GOOD' | 'NEEDS_MAINTENANCE' | 'DISPOSAL_PROPOSED';
  serialNumber: string;
  manufacturer?: string;
  qrPayload?: string;
}

export const OfficeCostsAndInfraHub: React.FC<OfficeCostsAndInfraHubProps> = ({
  policy,
  employees,
  currentRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<InfraSubCategory>('UTILITIES_EXPENSES');

  // ==========================================================
  // 1. DỮ LIỆU ĐỐI SOÁT HÓA ĐƠN TIỆN ÍCH & NĂNG LƯỢNG
  // ==========================================================
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([
    {
      id: 'UB-2026-08-01',
      category: 'ELECTRICITY_EVN',
      categoryTitle: 'Hóa Đơn Tiền Điện Sản Xuất & VP (Điện lực EVN)',
      providerName: 'Công Ty Điện Lực Bình Dương (EVN SPC)',
      billingMonth: 'Tháng 08/2026',
      invoiceCode: 'HD-EVN-891283',
      amount: 48500000,
      dueDate: '2026-08-28',
      paidDate: '2026-08-27',
      consumptionUnit: 'kWh',
      consumptionAmount: 28400,
      metricsBreakdown: {
        normalHoursKwh: 14200,
        peakHoursKwh: 5800,
        offPeakHoursKwh: 8400,
        powerFactorCosPhi: 0.94,
        reactivePowerPenalty: 0
      },
      changePercentVsLastMonth: 4.2,
      status: 'PAID',
      notes: 'Trạm biến áp 1.600kVA vận hành ổn định. Tỷ lệ cos phi 0.94 đạt chuẩn (không bị phạt công suất phản kháng theo Thông tư Bộ Công Thương).'
    },
    {
      id: 'UB-2026-08-02',
      category: 'WATER_BIWASE',
      categoryTitle: 'Hóa Đơn Nước Sạch Sản Xuất & Sinh Hoạt',
      providerName: 'Công Ty CP Nước Môi Trường Bình Dương (BIWASE)',
      billingMonth: 'Tháng 08/2026',
      invoiceCode: 'HD-BIWASE-4429',
      amount: 4200000,
      dueDate: '2026-08-30',
      paidDate: '2026-08-29',
      consumptionUnit: 'm3',
      consumptionAmount: 412,
      changePercentVsLastMonth: -2.1,
      status: 'PAID',
      notes: 'Đồng hồ nước tổng chạy ổn định. Giảm 2.1% so với tháng trước nhờ vận hành bể ngầm thu gom nước mưa tưới cây.'
    },
    {
      id: 'UB-2026-08-03',
      category: 'INTERNET_TELECOM',
      categoryTitle: 'Đường Truyền Internet Cáp Quang & Leased Line 200Mbps',
      providerName: 'Tập Đoàn Bưu Chính Viễn Thông Việt Nam (VNPT)',
      billingMonth: 'Tháng 08/2026',
      invoiceCode: 'HD-VNPT-00918',
      amount: 6800000,
      dueDate: '2026-09-05',
      paidDate: '2026-09-02',
      consumptionUnit: 'Gói Cước',
      consumptionAmount: 1,
      changePercentVsLastMonth: 0,
      status: 'PAID',
      notes: 'Bao gồm Kênh thuê riêng Leased Line 200Mbps cam kết quốc tế + FTTH dự phòng 300Mbps cho khối văn phòng.'
    },
    {
      id: 'UB-2026-08-04',
      category: 'DRINKING_WATER',
      categoryTitle: 'Nước Uóng Đóng Bình Lavie 19L & Ion Life',
      providerName: 'Công Ty TNHH Phân Phối Nước Uống Tân Bình Minh',
      billingMonth: 'Tháng 08/2026',
      invoiceCode: 'HD-LAVIE-2026-08',
      amount: 3650000,
      dueDate: '2026-09-08',
      paidDate: '2026-09-05',
      consumptionUnit: 'Bình 19L',
      consumptionAmount: 65,
      changePercentVsLastMonth: 1.5,
      status: 'PAID',
      notes: 'Cấp phát cho các lầu văn phòng, phòng họp khánh tiết và khu vực phòng nghỉ công nhân nhà xưởng.'
    },
    {
      id: 'UB-2026-08-05',
      category: 'GAS_LPG',
      categoryTitle: 'Khí Gas Hóa Lỏng Công Nghiệp LPG (Nhà Ăn Ca)',
      providerName: 'Công Ty Gas Petrolimex Sài Gòn',
      billingMonth: 'Tháng 08/2026',
      invoiceCode: 'HD-PETROGAS-5521',
      amount: 7550000,
      dueDate: '2026-09-12',
      consumptionUnit: 'Bình 45kg',
      consumptionAmount: 2,
      changePercentVsLastMonth: 0,
      status: 'PENDING',
      notes: 'Bồn gas phục vụ bếp nấu 650 suất ăn ca trưa/chiều của công ty. Đã kiểm định van an toàn PCCC.'
    }
  ]);

  // State bộ mô phỏng dịch chuyển phụ tải (Load Shifting Calculator)
  const [loadShiftKwh, setLoadShiftKwh] = useState<number>(1200);

  // ==========================================================
  // 2. DỮ LIỆU KẾ HOẠCH BẢO DƯỠNG NGĂN NGỪA (PM MATRIX) & PCCC
  // ==========================================================
  const [pmFilterTab, setPmFilterTab] = useState<'ALL' | 'STRICT_SAFETY' | 'MEP'>('ALL');
  const [selectedPmCertificate, setSelectedPmCertificate] = useState<PMScheduleItem | null>(null);

  const [pmSchedules, setPmSchedules] = useState<PMScheduleItem[]>([
    {
      id: 'PM-01',
      systemName: 'Hệ Thống Điều Hòa Trung Tâm VRV Daikin (Khu Văn Phòng Tầng 1-3)',
      systemCategory: 'HVAC_VRV',
      categoryLabel: 'Điều Hòa VRV',
      location: 'Tòa Nhà Văn Phòng Điều Hành',
      frequencyMonths: 3,
      lastMaintenanceDate: '2026-08-25',
      nextDueDate: '2026-11-25',
      assignedEngineer: 'Nguyễn Hữu Nam (Kỹ sư MEP)',
      serviceVendor: 'Công Ty Kỹ Thuật Lạnh Tân Á',
      estimatedCost: 8200000,
      checklistItems: [
        'Vệ sinh phin lọc bụi và dàn lạnh 12 phòng làm việc',
        'Xịt rửa áp lực cao dàn nóng ngoài trời tầng mái',
        'Đo dòng điện máy nén Inverter và nạp bổ sung gas R410A',
        'Kiểm tra độ ồn quạt thông gió và sensor cảm biến nhiệt độ'
      ],
      status: 'COMPLETED',
      isStrictSafetyCompliance: false,
      monthlyScheduleMatrix: [1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 2, 0]
    },
    {
      id: 'PM-02',
      systemName: 'Hệ Thống Bơm Cứu Hỏa Diesel & Bình Chữa Cháy PCCC',
      systemCategory: 'FIRE_PCCC',
      categoryLabel: 'Hệ Thống PCCC',
      location: 'Nhà Bơm PCCC & Toàn Bộ Phân Xưởng',
      frequencyMonths: 1,
      lastMaintenanceDate: '2026-09-02',
      nextDueDate: '2026-10-02',
      assignedEngineer: 'Phạm Hồng Thái (Chuyên viên HSE)',
      serviceVendor: 'Công Ty Thiết Bị PCCC Thăng Long',
      estimatedCost: 3000000,
      checklistItems: [
        'Khởi động chạy thử không tải máy bơm Diesel 15 phút',
        'Kiểm tra áp suất đường ống Sprinkler duy trì mức 7.5 bar',
        'Xả thử họng nước vách tường số 3 và số 5 khu xưởng chế biến',
        'Kiểm tra hạn kiểm định nạp sạc 85 bình chữa cháy bột MFZ4/CO2'
      ],
      status: 'COMPLETED',
      isStrictSafetyCompliance: true,
      safetyCertificateCode: 'KD-PCCC-2026/089',
      safetyCertificateAgency: 'Trung Tâm Kiểm Định KT An Toàn KV2',
      safetyCertificateExpiry: '2027-08-15',
      monthlyScheduleMatrix: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2]
    },
    {
      id: 'PM-03',
      systemName: 'Máy Phát Điện Dự Phòng Khẩn Cấp Cummins 500kVA',
      systemCategory: 'GENERATOR',
      categoryLabel: 'Máy Phát Điện',
      location: 'Phòng Máy Phát Điện (Cạnh Trạm Biến Áp)',
      frequencyMonths: 1,
      lastMaintenanceDate: '2026-08-15',
      nextDueDate: '2026-09-15',
      assignedEngineer: 'Đỗ Văn Thắng (Quản đốc Cơ Điện)',
      serviceVendor: 'Trung Tâm Dịch Vụ Kỹ Thuật Cummins Việt Nam',
      estimatedCost: 4500000,
      checklistItems: [
        'Test chạy khởi động tự động qua tủ ATS khi cúp điện lưới',
        'Đo điện áp ắc quy đề 24V (đạt 25.4V chuẩn nạp no)',
        'Kiểm tra mức dầu DO trong bồn dự trữ (hiện có 1.250 lít / 1.500 lít)',
        'Thay lọc dầu nhớt và lọc tách nước nhiên liệu định kỳ 250 giờ chạy'
      ],
      status: 'SCHEDULED',
      isStrictSafetyCompliance: true,
      safetyCertificateCode: 'KD-GEN-500KVA-2026',
      safetyCertificateAgency: 'Cục Giám Định Kỹ Thuật An Toàn Công Nghiệp',
      safetyCertificateExpiry: '2027-03-20',
      monthlyScheduleMatrix: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2]
    },
    {
      id: 'PM-04',
      systemName: 'Trạm Biến Áp 1.600kVA & Tủ Điện Phân Phối Trung Hạ Thế MSB',
      systemCategory: 'SUBSTATION',
      categoryLabel: 'Trạm Biến Áp MSB',
      location: 'Trạm Biến Áp Ngoài Trời Cổng Nam',
      frequencyMonths: 6,
      lastMaintenanceDate: '2026-06-15',
      nextDueDate: '2026-12-15',
      assignedEngineer: 'Đỗ Văn Thắng (Quản đốc Cơ Điện)',
      serviceVendor: 'Công Ty Thí Nghiệm Điện Miền Nam (ETC 2)',
      estimatedCost: 12000000,
      checklistItems: [
        'Chụp ảnh nhiệt hồng ngoại FLIR phát hiện điểm tiếp xúc quá nhiệt',
        'Thử nghiệm chất lượng dầu biến thế và kiểm tra hạt Silicagel hút ẩm',
        'Đo điện trở đất hệ thống tiếp địa chống sét đánh (đạt 2.8 Ohm < 4 Ohm)',
        'Vệ sinh cách điện sứ đứng và thanh cái đồng tủ phân phối chính'
      ],
      status: 'COMPLETED',
      isStrictSafetyCompliance: true,
      safetyCertificateCode: 'KD-TBA-1600KVA-2025',
      safetyCertificateAgency: 'Công Ty CP Thí Nghiệm Điện Miền Nam (ETC2)',
      safetyCertificateExpiry: '2026-12-15',
      monthlyScheduleMatrix: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2]
    },
    {
      id: 'PM-05',
      systemName: 'Thang Máy Tải Khách & Tời Nâng Hàng Thủy Lực 2 Tấn',
      systemCategory: 'ELEVATOR',
      categoryLabel: 'Thang Máy & Tời Hàng',
      location: 'Khu Kho Ngoại Quan & Văn Phòng',
      frequencyMonths: 1,
      lastMaintenanceDate: '2026-08-20',
      nextDueDate: '2026-09-20',
      assignedEngineer: 'Kỹ sư cơ điện nhà máy',
      serviceVendor: 'Công Ty TNHH Thang Máy Mitsubishi Việt Nam',
      estimatedCost: 3500000,
      checklistItems: [
        'Kiểm tra phanh an toàn chống rơi tự do và công tắc giới hạn hành trình',
        'Bôi trơn ray dẫn hướng và đo độ mòn cáp tải thép chịu lực',
        'Test chuông báo khẩn cấp Intercom liên lạc về bàn bảo vệ'
      ],
      status: 'SCHEDULED',
      isStrictSafetyCompliance: true,
      safetyCertificateCode: 'KD-TM-2000KG-VN01',
      safetyCertificateAgency: 'Trung Tâm Kỹ Thuật Tiêu Chuẩn Đo Lường Chất Lượng 3',
      safetyCertificateExpiry: '2026-10-28',
      monthlyScheduleMatrix: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2]
    },
    {
      id: 'PM-06',
      systemName: 'Hệ Thống Máy Nén Khí Trục Vít Atlas Copco 75kW & Bình Tích Khí 3.000L',
      systemCategory: 'AIR_COMPRESSOR',
      categoryLabel: 'Máy Nén Khí & Bình Áp Lực',
      location: 'Nhà Nén Khí Cạnh Xưởng Sản Xuất',
      frequencyMonths: 3,
      lastMaintenanceDate: '2026-07-10',
      nextDueDate: '2026-10-10',
      assignedEngineer: 'Đỗ Văn Thắng (Quản đốc Cơ Điện)',
      serviceVendor: 'Đại Lý Atlas Copco Sài Gòn',
      estimatedCost: 6500000,
      checklistItems: [
        'Kiểm tra van an toàn và đồng hồ đo áp suất bình tích khí',
        'Thay tách dầu và lọc gió máy nén trục vít',
        'Xả đáy tự động đường ống khí nén ngưng tụ nước'
      ],
      status: 'SCHEDULED',
      isStrictSafetyCompliance: true,
      safetyCertificateCode: 'KD-BA-3000L-2025/11',
      safetyCertificateAgency: 'Trung Tâm Kiểm Định An Toàn Công Nghiệp',
      safetyCertificateExpiry: '2026-11-10',
      monthlyScheduleMatrix: [1, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0]
    }
  ]);

  // ==========================================================
  // 3. DỮ LIỆU QUẢN LÝ MẶT BẰNG & HỢP ĐỒNG THUÊ
  // ==========================================================
  const [facilityLeases] = useState<FacilityLease[]>([
    {
      id: 'LEASE-01',
      premisesName: 'Khuôn Viên Nhà Máy Chế Biến & Kho Ngoại Quan KCN Sóng Thần 2',
      addressLocation: 'Đường Số 3, KCN Sóng Thần 2, Dĩ An, Bình Dương',
      lessorName: 'Công Ty Cổ Phần Đại Nam (Chủ đầu tư hạ tầng KCN)',
      totalAreaM2: 12500,
      usableAreaM2: 11800,
      unitPriceM2: 45000, // 45.000 đ/m2/năm
      monthlyRent: 46875000, // ~562.5 triệu/năm
      leaseStartDate: '2015-12-15',
      leaseEndDate: '2045-12-15 (Thời hạn 30 năm)',
      depositAmount: 250000000,
      paymentCycle: 'YEARLY',
      nextPaymentDate: '2026-12-15',
      occupancyRatePercent: 94.4,
      escalationClause: 'Đơn giá cố định 5 năm đầu, tăng tối đa 5% mỗi chu kỳ 3 năm tiếp theo',
      allocatedDepts: [
        { deptName: 'Phân Xưởng Chế Biến & Sản Xuất', areaM2: 5200, staffCount: 280, type: 'PROD' },
        { deptName: 'Hệ Thống Kho Lạnh & Kho Ngoại Quan', areaM2: 3400, staffCount: 68, type: 'WAREHOUSE' },
        { deptName: 'Tòa Nhà Văn Phòng Điều Hành 3 Tầng', areaM2: 1200, staffCount: 57, type: 'OFFICE' },
        { deptName: 'Khu Nhà Ăn Ca, Bếp & Căn Tin', areaM2: 850, staffCount: 14, type: 'COMMON' },
        { deptName: 'Bãi Đỗ Xe & Đường Nội Bộ Hạ Tầng', areaM2: 1150, staffCount: 0, type: 'COMMON' }
      ]
    },
    {
      id: 'LEASE-02',
      premisesName: 'Văn Phòng Đại Diện & Trung Tâm Giao Dịch Quốc Tế (Quận 1, TP.HCM)',
      addressLocation: 'Tầng 8, Tòa Nhà Bitexco Financial Tower, Số 2 Hải Triều, Q.1, TP.HCM',
      lessorName: 'Công Ty TNHH Tập Đoàn Bitexco',
      totalAreaM2: 350,
      usableAreaM2: 320,
      unitPriceM2: 450000, // 450.000 đ/m2/tháng (~$18/m2)
      monthlyRent: 157500000,
      leaseStartDate: '2023-05-01',
      leaseEndDate: '2028-05-01 (5 năm)',
      depositAmount: 472500000, // Cọc 3 tháng
      paymentCycle: 'QUARTERLY',
      nextPaymentDate: '2026-11-01',
      occupancyRatePercent: 88.5,
      escalationClause: 'Tăng 8% sau mỗi 2 năm theo biến động thị trường CBRE',
      allocatedDepts: [
        { deptName: 'Phòng Phát Triển Thị Trường & Xuất Nhập Khẩu', areaM2: 180, staffCount: 18, type: 'OFFICE' },
        { deptName: 'Phòng Tiếp Khách VIP & Hội Đồng Quản Trị', areaM2: 140, staffCount: 6, type: 'OFFICE' }
      ]
    }
  ]);

  // ==========================================================
  // 4. DỮ LIỆU PHIẾU BÁO HỎNG & SỬA CHỮA (WORK ORDERS)
  // ==========================================================
  const [workOrderViewMode, setWorkOrderViewMode] = useState<'TABLE' | 'KANBAN'>('KANBAN');
  const [workOrders, setWorkOrders] = useState<WorkOrderTicket[]>([
    {
      id: 'WO-01',
      ticketCode: 'WO-2026-081',
      title: 'Điều hòa phòng họp VIP Boardroom bị rò rỉ nước ngưng xuống bàn họp',
      reportedBy: 'Lê Hoàng Nam (QA/QC)',
      reportedDept: 'Phòng Đảm Bảo Chất Lượng',
      locationDetail: 'Phòng Họp VIP Boardroom (Tầng 3 Nhà Điều Hành)',
      reportedAt: '09:15 08/09/2026',
      urgency: 'URGENT',
      assignedTechnician: 'Nguyễn Hữu Nam (Kỹ sư MEP)',
      technicianType: 'INTERNAL_MEP',
      solutionDescription: 'Tháo máng nước ngưng, dùng bơm nén khí thông nghẹt đường ống xả cặn bẩn, test chạy lạnh 30 phút không rò nước.',
      sparePartsUsed: [
        { partName: 'Ống ruột gà mềm D27', quantity: 2, unitPrice: 45000 }
      ],
      materialCost: 90000,
      laborCost: 0,
      completedAt: '10:45 08/09/2026 (Xử lý trong 1.5 giờ)',
      satisfactionRating: 5,
      status: 'COMPLETED'
    },
    {
      id: 'WO-02',
      ticketCode: 'WO-2026-082',
      title: 'Chập cháy 2 bóng đèn LED tuýp M16 chiếu sáng chuyền đóng gói số 2',
      reportedBy: 'Đỗ Văn Thắng (Quản đốc)',
      reportedDept: 'Phân Xưởng Đóng Gói',
      locationDetail: 'Khu Vực Line Đóng Gói Thùng Carton (Cột B4 Xưởng 1)',
      reportedAt: '14:30 07/09/2026',
      urgency: 'HIGH',
      assignedTechnician: 'Tổ Cơ Điện Ca 2',
      technicianType: 'INTERNAL_MEP',
      solutionDescription: 'Thay thế 2 bóng đèn LED Rạng Đông 18W chống ẩm bụi công nghiệp, thay tăng phô điện tử mới.',
      sparePartsUsed: [
        { partName: 'Bóng LED Tuýp 1.2m Rạng Đông 18W IP65', quantity: 2, unitPrice: 90000 },
        { partName: 'Tăng phô điện tử Ballast', quantity: 1, unitPrice: 75000 }
      ],
      materialCost: 255000,
      laborCost: 0,
      completedAt: '15:20 07/09/2026',
      satisfactionRating: 5,
      status: 'COMPLETED'
    },
    {
      id: 'WO-03',
      ticketCode: 'WO-2026-083',
      title: 'Kẹt khóa tay gạt cửa ra vào kho ngoại quan khu vực bảo quản bao bì',
      reportedBy: 'Vũ Đức Trọng (Kho Vận)',
      reportedDept: 'Kho Vận & Logistics',
      locationDetail: 'Cửa Sắt Chống Cháy Kho Ngoại Quan Khu B',
      reportedAt: '08:00 09/09/2026',
      urgency: 'HIGH',
      assignedTechnician: 'Thợ Khóa Hafele Ủy Quyền',
      technicianType: 'EXTERNAL_VENDOR',
      solutionDescription: 'Đang tiến hành thay thế ruột khóa củ chìa Master Key chịu lực chống gỉ sét.',
      sparePartsUsed: [
        { partName: 'Ruột khóa Hafele Master Key 70mm', quantity: 1, unitPrice: 650000 }
      ],
      materialCost: 650000,
      laborCost: 200000,
      status: 'IN_PROGRESS'
    },
    {
      id: 'WO-04',
      ticketCode: 'WO-2026-084',
      title: 'Van phao xả nước tự động bồn cầu khu WC Nam Tầng 1 bị rò rỉ liên tục',
      reportedBy: 'Bảo Vệ Chốt 1',
      reportedDept: 'Đội Bảo Vệ & An Ninh',
      locationDetail: 'Khu Vệ Sinh Nam Tầng Trệt Nhà Điều Hành',
      reportedAt: '07:30 15/09/2026',
      urgency: 'NORMAL',
      assignedTechnician: 'Nguyễn Hữu Nam (Kỹ sư MEP)',
      technicianType: 'INTERNAL_MEP',
      materialCost: 0,
      laborCost: 0,
      status: 'NEW'
    }
  ]);

  // ==========================================================
  // 5. DỮ LIỆU KIỂM KÊ TÀI SẢN HẠ TẦNG & KHẤU HAO THIẾT BỊ
  // ==========================================================
  const [selectedAssetForQr, setSelectedAssetForQr] = useState<InfrastructureAsset | null>(null);

  const [infraAssets] = useState<InfrastructureAsset[]>([
    {
      id: 'AST-01',
      assetTag: 'AST-CCTV-01',
      assetName: 'Hệ Thống 64 Camera Giám Sát An Ninh AI CCTV Dahua 4K & Đầu Ghi NVR 32TB',
      category: 'SECURITY_CCTV',
      categoryTitle: 'Hệ Thống An Ninh CCTV',
      installedLocation: 'Toàn Bộ Hàng Rào Nhà Xưởng, Cổng Bảo Vệ & Phân Xưởng',
      deptInCharge: 'Đội An Ninh & Phòng HCNS',
      purchaseDate: '2024-03-15',
      originalCost: 185000000,
      depreciationYears: 5,
      accumulatedDepreciation: 89400000,
      netBookValue: 95600000,
      condition: 'EXCELLENT',
      serialNumber: 'DH-NVR5432-4KS2-2024',
      manufacturer: 'Dahua Technology'
    },
    {
      id: 'AST-02',
      assetTag: 'AST-FLAP-02',
      assetName: 'Hệ Thống Cửa Từ Phân Làn Flap Barrier Tự Động Nhận Diện FaceID Cổng Nhà Máy',
      category: 'ACCESS_CONTROL',
      categoryTitle: 'Kiểm Soát Ra Vào',
      installedLocation: 'Cổng Bảo Vệ Chính Số 1',
      deptInCharge: 'Phòng Hành Chính - Nhân Sự',
      purchaseDate: '2024-06-20',
      originalCost: 140000000,
      depreciationYears: 5,
      accumulatedDepreciation: 32600000,
      netBookValue: 107400000,
      condition: 'EXCELLENT',
      serialNumber: 'ZK-FBL4000-PRO',
      manufacturer: 'ZKTeco Corp'
    },
    {
      id: 'AST-03',
      assetTag: 'AST-RICOH-03',
      assetName: 'Máy Photocopy Laser Kỹ Thuật Số Đa Chức Năng Ricoh Aficio MP C6502',
      category: 'OFFICE_MACHINE',
      categoryTitle: 'Máy Văn Phòng',
      installedLocation: 'Phòng Hành Chính - Nhân Sự & Kế Toán (Tầng 2)',
      deptInCharge: 'Bộ Phận Văn Thư Lưu Trữ',
      purchaseDate: '2023-08-10',
      originalCost: 85000000,
      depreciationYears: 3,
      accumulatedDepreciation: 56600000,
      netBookValue: 28400000,
      condition: 'GOOD',
      serialNumber: 'RICOH-MP-C6502-VN89',
      manufacturer: 'Ricoh Japan'
    },
    {
      id: 'AST-04',
      assetTag: 'AST-SAFE-04',
      assetName: 'Tủ Hồ Sơ Tài Liệu Thép Chống Cháy 4 Ngăn Century Safe Đạt Chuẩn UL 72',
      category: 'OFFICE_FURNITURE',
      categoryTitle: 'Nội Thất & Tủ Tài Liệu',
      installedLocation: 'Phòng Lưu Trữ Văn Thư Pháp Lý (Kho A Tầng 2)',
      deptInCharge: 'Phòng Pháp Chế & HCNS',
      purchaseDate: '2022-10-05',
      originalCost: 24500000,
      depreciationYears: 8,
      accumulatedDepreciation: 11900000,
      netBookValue: 12600000,
      condition: 'EXCELLENT',
      serialNumber: 'CT-FIRE-SAFE-2022',
      manufacturer: 'Century Lock Co'
    },
    {
      id: 'AST-05',
      assetTag: 'AST-VRV-05',
      assetName: 'Cụm Dàn Nóng Điều Hòa VRV IV Daikin 24HP Tiết Kiệm Điện Inverter',
      category: 'AIR_CONDITION',
      categoryTitle: 'Hệ Thống Lạnh & VRV',
      installedLocation: 'Sân Thượng Tòa Nhà Điều Hành',
      deptInCharge: 'Đội Cơ Điện MEP',
      purchaseDate: '2022-04-10',
      originalCost: 295000000,
      depreciationYears: 8,
      accumulatedDepreciation: 162000000,
      netBookValue: 133000000,
      condition: 'GOOD',
      serialNumber: 'RXQ24TYM-DK2022',
      manufacturer: 'Daikin Industries'
    }
  ]);

  // ==========================================================
  // 6. ESG CHECKLIST 8 NGUYÊN TẮC TIẾT KIỆM NĂNG LƯỢNG
  // ==========================================================
  const [esgChecklist, setEsgChecklist] = useState<Array<{ id: number; text: string; done: boolean }>>([
    { id: 1, text: 'Cài đặt nhiệt độ điều hòa văn phòng ở mức chuẩn tối ưu 26°C', done: true },
    { id: 2, text: 'Tắt toàn bộ hệ thống điều hòa trước giờ tan ca 15 phút', done: true },
    { id: 3, text: 'Tắt đèn chiếu sáng và màn hình vi tính trong giờ nghỉ trưa (12:00 - 13:00)', done: true },
    { id: 4, text: 'Tận dụng 100% ánh sáng giếng trời tự nhiên tại phân xưởng vào ban ngày', done: true },
    { id: 5, text: 'Sử dụng nước mưa tái chế tưới cây và rửa sân bãi thay cho nước sạch BIWASE', done: true },
    { id: 6, text: 'Kiểm tra ngắt điện tủ nước nóng lạnh vào 2 ngày cuối tuần', done: false },
    { id: 7, text: 'Bảo dưỡng định kỳ vệ sinh phin lọc gió VRV 3 tháng/lần giúp máy không quá tải', done: true },
    { id: 8, text: 'Ký cam kết 5S văn phòng xanh không lãng phí giấy in và cốc nhựa dùng 1 lần', done: true }
  ]);

  const toggleEsgCheckItem = (id: number) => {
    setEsgChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  // ==========================================================
  // STATE BỘ LỌC, TÌM KIẾM & MODAL
  // ==========================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal Báo hỏng sự cố mới
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    reportedBy: employees[0]?.fullName || 'Lê Hoàng Nam',
    reportedDept: employees[0]?.departmentName || 'Phòng Đảm Bảo Chất Lượng',
    locationDetail: '',
    urgency: 'NORMAL' as 'URGENT' | 'HIGH' | 'NORMAL'
  });

  // Modal Xử lý & Nghiệm thu ticket
  const [selectedTicketForAction, setSelectedTicketForAction] = useState<WorkOrderTicket | null>(null);
  const [solutionInput, setSolutionInput] = useState('');
  const [ratingInput, setRatingInput] = useState(5);
  const [materialPartInput, setMaterialPartInput] = useState('');
  const [materialCostInput, setMaterialCostInput] = useState(0);

  // Modal Chi tiết đối soát điện 3 giá EVN
  const [showUtilityAuditModal, setShowUtilityAuditModal] = useState<UtilityBill | null>(null);

  // Modal In Phiếu Kỹ Thuật A4
  const [showPrintTicketModal, setShowPrintTicketModal] = useState<WorkOrderTicket | null>(null);

  // ==========================================================
  // KPI THỜI GIAN THỰC
  // ==========================================================
  const kpiStats = useMemo(() => {
    const totalUtilityCostThisMonth = utilityBills.reduce((acc, b) => acc + b.amount, 0);
    const paidBillsCount = utilityBills.filter(b => b.status === 'PAID').length;
    const pendingTicketsCount = workOrders.filter(w => w.status !== 'COMPLETED' && w.status !== 'CANCELLED').length;
    const urgentTicketsCount = workOrders.filter(w => w.urgency === 'URGENT' && w.status !== 'COMPLETED').length;
    const completedPmCount = pmSchedules.filter(p => p.status === 'COMPLETED').length;
    const totalAssetsValue = infraAssets.reduce((acc, a) => acc + a.originalCost, 0);
    const totalNetBookValue = infraAssets.reduce((acc, a) => acc + a.netBookValue, 0);

    return {
      totalUtilityCostThisMonth,
      paidBillsCount,
      totalBillsCount: utilityBills.length,
      pendingTicketsCount,
      urgentTicketsCount,
      completedPmCount,
      totalPmCount: pmSchedules.length,
      totalAssetsValue,
      totalNetBookValue,
      avgResolutionHours: 1.6
    };
  }, [utilityBills, workOrders, pmSchedules, infraAssets]);

  // Xử lý tạo ticket báo hỏng mới
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.title.trim() || !newTicketForm.locationDetail.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin sự cố và vị trí cụ thể!');
      return;
    }

    const newTicket: WorkOrderTicket = {
      id: `WO-${Date.now()}`,
      ticketCode: `WO-2026-0${85 + workOrders.length}`,
      title: newTicketForm.title.trim(),
      reportedBy: newTicketForm.reportedBy,
      reportedDept: newTicketForm.reportedDept,
      locationDetail: newTicketForm.locationDetail.trim(),
      reportedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
      urgency: newTicketForm.urgency,
      assignedTechnician: 'Đội Kỹ Thuật Cơ Điện (MEP)',
      technicianType: 'INTERNAL_MEP',
      materialCost: 0,
      laborCost: 0,
      status: 'NEW'
    };

    setWorkOrders([newTicket, ...workOrders]);
    setShowCreateTicketModal(false);
    setNewTicketForm({
      title: '',
      reportedBy: employees[0]?.fullName || 'Lê Hoàng Nam',
      reportedDept: employees[0]?.departmentName || 'Phòng Đảm Bảo Chất Lượng',
      locationDetail: '',
      urgency: 'NORMAL'
    });
    alert('✓ ĐÃ TẠO PHIẾU YÊU CẦU SỬA CHỮA THÀNH CÔNG!\nKỹ thuật viên trực ban đã nhận thông báo và sẽ có mặt khảo sát hiện trường.');
  };

  // Xử lý hoàn tất nghiệm thu ticket
  const handleCompleteTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForAction) return;

    setWorkOrders(prev => prev.map(t => {
      if (t.id === selectedTicketForAction.id) {
        const parts = t.sparePartsUsed ? [...t.sparePartsUsed] : [];
        if (materialPartInput.trim() && materialCostInput > 0) {
          parts.push({
            partName: materialPartInput.trim(),
            quantity: 1,
            unitPrice: materialCostInput
          });
        }
        return {
          ...t,
          solutionDescription: solutionInput.trim() || 'Đã sửa chữa và khắc phục hoàn tất sự cố.',
          sparePartsUsed: parts,
          materialCost: t.materialCost + materialCostInput,
          completedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
          satisfactionRating: ratingInput,
          status: 'COMPLETED'
        };
      }
      return t;
    }));

    setSelectedTicketForAction(null);
    setSolutionInput('');
    setMaterialPartInput('');
    setMaterialCostInput(0);
    alert('✓ ĐÃ NGHIỆM THU HOÀN TẤT PHIẾU SỬA CHỮA!\nCảm ơn bạn đã đánh giá chất lượng dịch vụ bảo trì.');
  };

  // Xuất file Excel tổng hợp
  const handleExportInfraExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Hóa đơn tiện ích
    const ws1Data = utilityBills.map(b => ({
      'Mã Hóa Đơn': b.id,
      'Loại Tiện Ích': b.categoryTitle,
      'Nhà Cung Cấp': b.providerName,
      'Kỳ Tiêu Thụ': b.billingMonth,
      'Số Tiền (VNĐ)': b.amount,
      'Chỉ Số Sử Dụng': `${b.consumptionAmount} ${b.consumptionUnit}`,
      'Biến Động So Tháng Trước': `${b.changePercentVsLastMonth > 0 ? '+' : ''}${b.changePercentVsLastMonth}%`,
      'Hạn Thanh Toán': b.dueDate,
      'Trạng Thái': b.status === 'PAID' ? 'Đã thanh toán' : 'Chờ đối soát',
      'Ghi Chú Vận Hành': b.notes
    }));
    const ws1 = XLSX.utils.json_to_sheet(ws1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Hoa_Don_Tien_Ich_Nang_Luong');

    // Sheet 2: Kế hoạch bảo dưỡng ngăn ngừa
    const ws2Data = pmSchedules.map(p => ({
      'Mã PM': p.id,
      'Tên Hệ Thống': p.systemName,
      'Phân Loại': p.categoryLabel,
      'Vị Trí Lắp Đặt': p.location,
      'Định Kỳ': `${p.frequencyMonths} tháng/lần`,
      'Ngày Bảo Dưỡng Gần Nhất': p.lastMaintenanceDate,
      'Hạn Kế Tiếp': p.nextDueDate,
      'Kỹ Sư Phụ Trách': p.assignedEngineer,
      'Đơn Vị Dịch Vụ': p.serviceVendor,
      'Kinh Phí Dự Kiến (VNĐ)': p.estimatedCost,
      'Hạn Kiểm Định ATLĐ': p.safetyCertificateExpiry || 'Không áp dụng',
      'Trạng Thái': p.status
    }));
    const ws2 = XLSX.utils.json_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Ke_Hoach_Bao_Tri_PM');

    // Sheet 3: Mặt bằng thuê & phân bổ
    const ws3Data = facilityLeases.map(l => ({
      'Mã Hợp Đồng': l.id,
      'Khu Vực Mặt Bằng': l.premisesName,
      'Bên Cho Thuê': l.lessorName,
      'Tổng Diện Tích (m2)': l.totalAreaM2,
      'Diện Tích Sử Dụng (m2)': l.usableAreaM2,
      'Đơn Giá (VNĐ/m2)': l.unitPriceM2,
      'Tiền Thuê Hàng Tháng (VNĐ)': l.monthlyRent,
      'Thời Hạn': `${l.leaseStartDate} đến ${l.leaseEndDate}`,
      'Tiền Cọc (VNĐ)': l.depositAmount,
      'Tỷ Lệ Lấp Đầy': `${l.occupancyRatePercent}%`
    }));
    const ws3 = XLSX.utils.json_to_sheet(ws3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'Hop_Dong_Mat_Bang_Thue');

    // Sheet 4: Ticket báo hỏng sửa chữa
    const ws4Data = workOrders.map(w => ({
      'Mã Ticket': w.ticketCode,
      'Nội Dung Sự Cố': w.title,
      'Người Báo Hỏng': `${w.reportedBy} (${w.reportedDept})`,
      'Vị Trí Hiện Trường': w.locationDetail,
      'Thời Điểm Báo': w.reportedAt,
      'Mức Độ Khẩn': w.urgency === 'URGENT' ? 'Hỏa tốc (<2h)' : w.urgency === 'HIGH' ? 'Ưu tiên (<8h)' : 'Bình thường',
      'Kỹ Thuật Xử Lý': w.assignedTechnician,
      'Phương Án Xử Lý': w.solutionDescription || 'Đang triển khai',
      'Chi Phí Vật Tư (VNĐ)': w.materialCost,
      'Đánh Giá Sao': w.satisfactionRating ? `${w.satisfactionRating} sao ⭐` : 'Chưa đánh giá',
      'Trạng Thái': w.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang xử lý'
    }));
    const ws4 = XLSX.utils.json_to_sheet(ws4Data);
    XLSX.utils.book_append_sheet(wb, ws4, 'Ticket_Sua_Chua_Helpdesk');

    // Sheet 5: Kiểm kê tài sản hạ tầng
    const ws5Data = infraAssets.map(a => ({
      'Mã Tài Sản': a.assetTag,
      'Tên Thiết Bị / Hạ Tầng': a.assetName,
      'Danh Mục': a.categoryTitle,
      'Vị Trí Lắp Đặt': a.installedLocation,
      'Đơn Vị Quản Lý': a.deptInCharge,
      'Ngày Đưa Vào Dùng': a.purchaseDate,
      'Nguyên Giá (VNĐ)': a.originalCost,
      'Thời Gian KH (Năm)': a.depreciationYears,
      'Khấu Hao Lũy Kế (VNĐ)': a.accumulatedDepreciation,
      'Giá Trị Còn Lại (VNĐ)': a.netBookValue,
      'Tình Trạng': a.condition
    }));
    const ws5 = XLSX.utils.json_to_sheet(ws5Data);
    XLSX.utils.book_append_sheet(wb, ws5, 'Tai_San_Ha_Tang_Khau_Hao');

    XLSX.writeFile(wb, `Bao_Cao_Chi_Phi_Ha_Tang_${policy.companyName.replace(/\s+/g, '_')}_09_2026.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* ════════════════════════════════════════════════════════════
          KHỐI 1: HEADER & KPI CARDS CHI PHÍ & HẠ TẦNG 360°
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                    Trung Tâm Quản Trị Chi Phí Tiện Ích, Cơ Sở Hạ Tầng &amp; Vận Hành Kỹ Thuật (FM Hub)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-400 text-slate-950">
                    6 Phân Hệ Thông Minh
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-300">
                  Đối soát điện 3 giá EVN, bảo dưỡng ngăn ngừa QCVN, phân bổ mặt bằng, helpdesk báo hỏng và năng lượng xanh ESG
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportInfraExcel}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center space-x-1.5 border border-white/15 cursor-pointer shadow-xs active:scale-95"
              title="Xuất toàn bộ sổ chi phí hạ tầng ra Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Báo Cáo Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateTicketModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black transition-all flex items-center space-x-1.5 shadow-md hover:shadow-rose-500/25 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Báo Hỏng / Sửa Chữa Mới</span>
            </button>
          </div>
        </div>

        {/* 4 KPI THỐNG KÊ THỜI GIAN THỰC */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Chi Phí Tiện Ích Tháng</span>
              <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                {(kpiStats.totalUtilityCostThisMonth / 1000000).toFixed(1)} <span className="text-xs font-normal text-slate-300">triệu đ</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">{kpiStats.paidBillsCount}/{kpiStats.totalBillsCount} hóa đơn đã đối soát</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Bảo Trì Định Kỳ Đạt Chuẩn</span>
              <div className="text-xl font-black font-mono text-indigo-300 mt-0.5">
                {kpiStats.completedPmCount}/{kpiStats.totalPmCount} <span className="text-xs font-normal text-slate-300">hệ thống</span>
              </div>
              <span className="text-[10px] text-slate-300">Đầy đủ tem kiểm định ATLĐ QCVN</span>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Sửa Chữa Đang Xử Lý</span>
              <div className="text-xl font-black font-mono text-amber-300 mt-0.5">{kpiStats.pendingTicketsCount} <span className="text-xs font-normal text-slate-300">yêu cầu</span></div>
              <span className="text-[10px] text-rose-300 font-semibold">{kpiStats.urgentTicketsCount} sự cố khẩn cấp (SLA &lt;2h)</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Wrench className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Giá Trị Tài Sản Còn Lại</span>
              <div className="text-xl font-black font-mono text-purple-300 mt-0.5">
                {(kpiStats.totalNetBookValue / 1000000).toFixed(0)} <span className="text-xs font-normal text-slate-300">triệu đ</span>
              </div>
              <span className="text-[10px] text-purple-300 font-semibold">Khấu hao tự động theo TT45/2013</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          KHỐI 2: THANH TAB ĐIỀU HƯỚNG 6 PHÂN HỆ CHUYÊN BIỆT
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-1.5">
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-bold scrollable-tabs pb-0.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('UTILITIES_EXPENSES')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'UTILITIES_EXPENSES'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>1. Đối Soát Điện 3 Giá EVN, Nước &amp; Mạng ({utilityBills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('PREVENTIVE_MAINTENANCE')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'PREVENTIVE_MAINTENANCE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Bảo Dưỡng Ngăn Ngừa (PM) &amp; Tem QCVN ({pmSchedules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('FACILITIES_LEASES')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'FACILITIES_LEASES'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Mặt Bằng, Diện Tích &amp; Hợp Đồng Thuê ({facilityLeases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('WORK_ORDERS_HELPDESK')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'WORK_ORDERS_HELPDESK'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-rose-400" />
            <span>4. Phiếu Tiếp Nhận Báo Hỏng &amp; Sửa Chữa ({workOrders.filter(w => w.status !== 'COMPLETED').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ENERGY_MANAGEMENT_ESG')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'ENERGY_MANAGEMENT_ESG'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>5. Năng Lượng Xanh &amp; Chống Lãng Phí ESG</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ASSET_DEPRECIATION')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'ASSET_DEPRECIATION'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span>6. Kiểm Kê Tài Sản &amp; Khấu Hao Thiết Bị ({infraAssets.length})</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: ĐỐI SOÁT TIỆN ÍCH ĐIỆN 3 GIÁ EVN, NƯỚC & MẠNG
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'UTILITIES_EXPENSES' && (
        <div className="space-y-4 animate-in fade-in">
          {/* KHỐI CẢNH BÁO THÔNG MINH AI ANOMALY DETECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-white space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Cảnh Báo Điện Giờ Cao Điểm</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-200 text-amber-900">
                  Phân Tích AI
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-snug">
                Điện giờ cao điểm đạt <b>5.800 kWh (20.4%)</b> với đơn giá <b>3.076 đ/kWh</b>. Đề xuất chuyển dịch lịch vận hành máy nén lạnh sang giờ thấp điểm.
              </p>
              <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 pt-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Có thể tiết kiệm ước tính ~ 2.370.000 đ/tháng</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-50 to-white space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 uppercase flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>Giám Sát Rò Rỉ Nước Ngầm Ban Đêm</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                  Bình Thường
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-snug">
                Lưu lượng nước từ 01:00 đến 04:00 sáng ghi nhận <b>0.02 m³/h</b> (dưới ngưỡng cảnh báo rò rỉ ngầm 0.05 m³/h).
              </p>
              <div className="text-[11px] text-blue-800 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Không phát hiện rò rỉ van phao hay vỡ đường ống</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 uppercase flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Hệ Số Cos Phi (Công Suất Phản Kháng)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-200 text-emerald-900">
                  Cos φ = 0.94
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-snug">
                Tụ bù tự động trạm biến áp 1.600kVA hoạt động tốt. Hệ số cos phi đạt <b>0.94 &ge; 0.90</b> theo quy định Thông tư 15/2014/TT-BCT.
              </p>
              <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Không bị EVN phạt tiền công suất phản kháng (0 VNĐ)</span>
              </div>
            </div>
          </div>

          {/* BỘ MÔ PHỎNG DỊCH CHUYỂN PHỤ TẢI (LOAD SHIFTING SIMULATOR) */}
          <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Mô Phỏng Tối Ưu Hóa Chi Phí: Dịch Chuyển Phụ Tải Sang Giờ Thấp Điểm (Load Shifting)</span>
                </h4>
                <p className="text-[11px] text-indigo-700">
                  Đơn giá EVN: Giờ cao điểm 3.076 đ/kWh vs Giờ thấp điểm 1.100 đ/kWh (Chênh lệch: <b>1.976 đ/kWh</b>)
                </p>
              </div>

              <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Dự kiến tiết kiệm:</span>
                <span className="text-sm font-black text-emerald-700 font-mono">
                  {(loadShiftKwh * 1976).toLocaleString('vi-VN')} đ/tháng
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Khối lượng điện dự kiến chuyển sang giờ thấp điểm:</span>
                <span className="font-mono text-indigo-700 font-black">{loadShiftKwh.toLocaleString('vi-VN')} kWh</span>
              </div>
              <input 
                type="range" 
                min={200} 
                max={3000} 
                step={100}
                value={loadShiftKwh}
                onChange={e => setLoadShiftKwh(Number(e.target.value))}
                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>200 kWh</span>
                <span>1.000 kWh</span>
                <span>2.000 kWh</span>
                <span>3.000 kWh (~5.9 triệu đ/tháng)</span>
              </div>
            </div>
          </div>

          {/* DANH SÁCH HÓA ĐƠN TIỆN ÍCH */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Bảng Kê Đối Soát Hóa Đơn Tiện Ích Năng Lượng &amp; Viễn Thông Tháng 08/2026</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Đối soát chỉ số điện 3 giá EVN, nước sạch sinh hoạt, internet cáp quang, nước uống và gas bếp ăn
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                Kỳ Hóa Đơn: Tháng 08/2026
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {utilityBills.map(bill => (
                <div
                  key={bill.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-black text-slate-900 text-xs block leading-tight">
                        {bill.categoryTitle}
                      </span>
                      <span className="text-[10px] text-slate-400">{bill.providerName}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black border shrink-0 ${
                      bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {bill.status === 'PAID' ? 'Đã thanh toán' : 'Chờ đối soát'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-base font-black font-mono text-indigo-900">
                      {bill.amount.toLocaleString('vi-VN')} đ
                    </span>
                    <span className={`text-[10.5px] font-bold ${
                      bill.changePercentVsLastMonth > 0 ? 'text-rose-600' : bill.changePercentVsLastMonth < 0 ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {bill.changePercentVsLastMonth > 0 ? `+${bill.changePercentVsLastMonth}%` : `${bill.changePercentVsLastMonth}%`} so tháng 7
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Sản lượng tiêu thụ:</span>
                      <b className="font-mono text-slate-900">{bill.consumptionAmount.toLocaleString('vi-VN')} {bill.consumptionUnit}</b>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Hạn thanh toán:</span>
                      <b className="font-mono text-slate-700">{bill.dueDate}</b>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-slate-500 italic line-clamp-2">{bill.notes}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">{bill.invoiceCode}</span>
                    <button
                      type="button"
                      onClick={() => setShowUtilityAuditModal(bill)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10.5px] border border-indigo-200 cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Xem Đối Soát 3 Giá</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 2: KẾ HOẠCH BẢO DƯỠNG NGĂN NGỪA (PM SCHEDULE) & PCCC
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'PREVENTIVE_MAINTENANCE' && (
        <div className="space-y-4 animate-in fade-in">
          {/* BANNER PHÂN NHÓM & BỘ LỌC */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Ma Trận Bảo Dưỡng Ngăn Ngừa (PM Matrix 2026) &amp; Kiểm Định ATLĐ QCVN</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Chu kỳ bảo dưỡng Điều hòa VRV, PCCC, Trạm biến áp 1.600kVA, Thang máy và Bình áp lực theo Thông tư 36/2019/TT-BLĐTBXH
                </p>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPmFilterTab('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pmFilterTab === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất Cả ({pmSchedules.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPmFilterTab('STRICT_SAFETY')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pmFilterTab === 'STRICT_SAFETY' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Thiết Bị Nghiêm Ngặt QCVN ({pmSchedules.filter(p => p.isStrictSafetyCompliance).length})
                </button>
                <button
                  type="button"
                  onClick={() => setPmFilterTab('MEP')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pmFilterTab === 'MEP' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  MEP &amp; Điều Hòa
                </button>
              </div>
            </div>

            {/* MA TRẬN 12 THÁNG TRỰC QUAN (YEARLY MATRIX) */}
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 overflow-x-auto">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-white/10">
                <span className="font-black uppercase tracking-wider text-slate-300">Ma Trận Tiến Độ Bảo Dưỡng 12 Tháng Năm 2026:</span>
                <div className="flex items-center space-x-3 text-[10.5px]">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Đã hoàn tất</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Kế hoạch kỳ tới</span>
                </div>
              </div>

              <div className="min-w-[620px] space-y-1.5 pt-1">
                <div className="grid grid-cols-13 gap-1 text-center text-[10px] font-black text-slate-400">
                  <div className="text-left pl-1">Hệ Thống Hạ Tầng</div>
                  {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((m, i) => (
                    <div key={i} className={`py-0.5 rounded ${i === 8 ? 'bg-indigo-800/80 text-white font-bold' : ''}`}>{m}</div>
                  ))}
                </div>

                {pmSchedules.map(pm => (
                  <div key={pm.id} className="grid grid-cols-13 gap-1 items-center text-xs py-1 border-b border-white/5 hover:bg-white/5 rounded">
                    <div className="text-left pl-1 font-bold text-slate-200 truncate text-[11px]" title={pm.systemName}>
                      {pm.categoryLabel}
                    </div>
                    {pm.monthlyScheduleMatrix?.map((status, idx) => (
                      <div key={idx} className="flex items-center justify-center">
                        {status === 1 ? (
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center" title={`Tháng ${idx+1}: Đã hoàn tất`}>✓</span>
                        ) : status === 2 ? (
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse text-slate-950 font-black text-[9px] flex items-center justify-center" title={`Tháng ${idx+1}: Kế hoạch bảo trì`}>•</span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* DANH SÁCH THẺ BẢO TRÌ CHI TIẾT */}
            <div className="space-y-3 pt-1">
              {pmSchedules
                .filter(pm => {
                  if (pmFilterTab === 'STRICT_SAFETY') return pm.isStrictSafetyCompliance;
                  if (pmFilterTab === 'MEP') return !pm.isStrictSafetyCompliance;
                  return true;
                })
                .map(pm => (
                  <div key={pm.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-black text-slate-900 text-sm">{pm.systemName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Định kỳ {pm.frequencyMonths} tháng/lần
                          </span>
                          {pm.isStrictSafetyCompliance && (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-rose-600" />
                              <span>QCVN Nghiêm Ngặt</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Vị trí: <b>{pm.location}</b> • Kỹ sư: <b>{pm.assignedEngineer}</b> • Nhà thầu: <b>{pm.serviceVendor}</b>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">Kinh phí bảo dưỡng:</span>
                        <span className="text-base font-black font-mono text-emerald-700">
                          {pm.estimatedCost.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>

                    {/* Checklist bảo dưỡng chi tiết */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-700 text-[10.5px] uppercase block">Các Hạng Mục Kiểm Tra Bắt Buộc:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                        {pm.checklistItems.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200 text-xs">
                      <div className="flex items-center space-x-3 text-slate-500 text-[11px] font-mono flex-wrap">
                        <span>Bảo dưỡng gần nhất: <b>{pm.lastMaintenanceDate}</b></span>
                        <span>Hạn kế tiếp: <b className="text-indigo-800">{pm.nextDueDate}</b></span>
                        {pm.safetyCertificateExpiry && (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Tem kiểm định số {pm.safetyCertificateCode} (Hạn: {pm.safetyCertificateExpiry})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {pm.safetyCertificateCode && (
                          <button
                            type="button"
                            onClick={() => setSelectedPmCertificate(pm)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10.5px] font-bold border border-slate-300 cursor-pointer flex items-center gap-1"
                          >
                            <FileCheck2 className="w-3 h-3 text-indigo-600" />
                            <span>Xem Giấy Chứng Nhận ATLĐ</span>
                          </button>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          pm.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {pm.status === 'COMPLETED' ? '✓ Đã nghiệm thu đạt chuẩn' : 'Sắp tới hạn bảo dưỡng'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 3: MẶT BẰNG, DIỆN TÍCH & HỢP ĐỒNG THUÊ
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'FACILITIES_LEASES' && (
        <div className="space-y-4 animate-in fade-in">
          {/* KHỐI CHỈ SỐ HIỆU SUẤT KHÔNG GIAN (SPACE KPIS) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Mật Độ Diện Tích / Nhân Sự</span>
              <div className="text-xl font-black text-indigo-700 font-mono">
                7.2 <span className="text-xs font-normal text-slate-500">m²/người</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Chuẩn vàng: 6 - 8 m²/người</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Chi Phí Thuê / Nhân Viên / Tháng</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                1.85 <span className="text-xs font-normal text-slate-500">triệu đ</span>
              </div>
              <span className="text-[10px] text-slate-400">Đã bao gồm phí quản lý KCN</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Tỷ Lệ Lấp Đầy Không Gian</span>
              <div className="text-xl font-black text-emerald-700 font-mono">
                94.4%
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Công suất sử dụng tối ưu</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Hạn Hợp Đồng Thuê KCN</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                2045 <span className="text-xs font-normal text-slate-500">(còn 19 năm)</span>
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold">Cố định tiền thuê đất KCN</span>
            </div>
          </div>

          {/* SƠ ĐỒ TỶ LỆ PHÂN BỔ DIỆN TÍCH TRỰC QUAN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Sơ Đồ Phân Bổ Mặt Bằng Sử Dụng Nhà Máy KCN Sóng Thần 2 (12.500 m²)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Cơ cấu tỷ lệ diện tích sản xuất, kho vận, văn phòng điều hành và tiện ích chung
                </p>
              </div>
            </div>

            {/* Thanh Bar Tỷ Lệ Phân Bổ (Stacked Bar) */}
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded-xl overflow-hidden flex shadow-inner">
                <div style={{ width: '41.6%' }} className="bg-indigo-600" title="Phân Xưởng Sản Xuất: 5.200 m² (41.6%)"></div>
                <div style={{ width: '27.2%' }} className="bg-emerald-600" title="Kho Lạnh & Ngoại Quan: 3.400 m² (27.2%)"></div>
                <div style={{ width: '9.6%' }} className="bg-amber-500" title="Văn Phòng Điều Hành: 1.200 m² (9.6%)"></div>
                <div style={{ width: '6.8%' }} className="bg-purple-500" title="Khu Căn Tin & Bếp: 850 m² (6.8%)"></div>
                <div style={{ width: '14.8%' }} className="bg-slate-300" title="Bãi Xe & Hạ Tầng Giao Thông: 1.850 m² (14.8%)"></div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-indigo-600"></span> Phân Xưởng Sản Xuất (5.200 m² - 41.6%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-600"></span> Kho Ngoại Quan (3.400 m² - 27.2%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-500"></span> Tòa Nhà VP (1.200 m² - 9.6%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-purple-500"></span> Nhà Ăn Ca (850 m² - 6.8%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-300"></span> Bãi Xe &amp; Hạ Tầng (1.850 m² - 14.8%)
                </span>
              </div>
            </div>

            {/* DANH SÁCH 2 HỢP ĐỒNG THUÊ CHI TIẾT */}
            <div className="space-y-3 pt-2">
              {facilityLeases.map(lease => (
                <div key={lease.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">{lease.premisesName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {lease.totalAreaM2.toLocaleString('vi-VN')} m²
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{lease.addressLocation}</p>
                      <p className="text-[10.5px] text-slate-500">Bên cho thuê: <b>{lease.lessorName}</b></p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">Kinh phí thuê theo kỳ:</span>
                      <span className="text-base font-black font-mono text-indigo-900">
                        {lease.monthlyRent.toLocaleString('vi-VN')} đ/tháng
                      </span>
                    </div>
                  </div>

                  {/* Phân bổ diện tích phòng ban */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                    <span className="font-bold text-slate-700 text-[10.5px] uppercase block">
                      Phân Bổ Diện Tích Sử Dụng Thực Tế ({lease.usableAreaM2.toLocaleString('vi-VN')} m²):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                      {lease.allocatedDepts.map((d, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                          <span className="font-bold text-slate-800 block truncate">{d.deptName}</span>
                          <div className="flex justify-between text-slate-500 font-mono text-[10.5px]">
                            <span>{d.areaM2.toLocaleString('vi-VN')} m²</span>
                            {d.staffCount > 0 && <span>{d.staffCount} nhân sự</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200 text-xs">
                    <div className="flex items-center space-x-3 text-slate-500 text-[11px] font-mono flex-wrap">
                      <span>Thời hạn thuê: <b>{lease.leaseStartDate} ➔ {lease.leaseEndDate}</b></span>
                      <span>Tiền cọc: <b>{lease.depositAmount.toLocaleString('vi-VN')} đ</b></span>
                      {lease.escalationClause && (
                        <span className="text-indigo-700">Điều khoản trượt giá: {lease.escalationClause}</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      Hạn thanh toán kế tiếp: {lease.nextPaymentDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 4: PHIẾU TIẾP NHẬN BÁO HỎNG & SỬA CHỮA (WORK ORDERS)
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'WORK_ORDERS_HELPDESK' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-rose-600" />
                  <span>Sổ Tiếp Nhận Báo Hỏng, Sửa Chữa Cơ Sở Vật Chất (Facility Helpdesk Work Orders)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Điều phối kỹ thuật viên MEP nội bộ hoặc nhà thầu ngoài xử lý sự cố trong văn phòng &amp; nhà xưởng
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {/* Nút chuyển đổi View Mode */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setWorkOrderViewMode('KANBAN')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      workOrderViewMode === 'KANBAN' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Bảng Tiến Độ (Kanban)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkOrderViewMode('TABLE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      workOrderViewMode === 'TABLE' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Danh Sách Chi Tiết
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Phiếu Mới</span>
                </button>
              </div>
            </div>

            {/* VIEW 1: KANBAN VIEW (3 CỘT TIẾN ĐỘ) */}
            {workOrderViewMode === 'KANBAN' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Cột 1: Mới tiếp nhận */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-black text-xs uppercase text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>1. Chờ Khảo Sát &amp; Phân Công</span>
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                      {workOrders.filter(w => w.status === 'NEW').length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {workOrders.filter(w => w.status === 'NEW').map(wo => (
                      <div key={wo.id} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="font-mono font-bold text-indigo-700 text-[11px]">{wo.ticketCode}</span>
                          <span className={`px-2 py-0.2 rounded text-[9.5px] font-bold border ${
                            wo.urgency === 'URGENT' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {wo.urgency === 'URGENT' ? 'Hỏa tốc (<2h)' : 'Bình thường'}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs leading-tight">{wo.title}</h5>
                        <p className="text-[10.5px] text-slate-500">📍 {wo.locationDetail}</p>
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                          <span className="text-slate-400">{wo.reportedBy}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicketForAction(wo);
                              setSolutionInput('');
                            }}
                            className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded cursor-pointer"
                          >
                            Tiếp Nhận
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cột 2: Đang sửa chữa */}
                <div className="bg-blue-50/50 rounded-2xl border border-blue-200 p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-blue-200">
                    <span className="font-black text-xs uppercase text-blue-900 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span>2. Đang Xử Lý &amp; Sửa Chữa</span>
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-blue-100 text-blue-900">
                      {workOrders.filter(w => w.status === 'IN_PROGRESS').length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {workOrders.filter(w => w.status === 'IN_PROGRESS').map(wo => (
                      <div key={wo.id} className="p-3 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="font-mono font-bold text-indigo-700 text-[11px]">{wo.ticketCode}</span>
                          <span className="px-2 py-0.2 rounded text-[9.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Đang xử lý
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs leading-tight">{wo.title}</h5>
                        <p className="text-[10.5px] text-slate-500">Kỹ thuật: <b>{wo.assignedTechnician}</b></p>
                        {wo.solutionDescription && (
                          <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded">
                            {wo.solutionDescription}
                          </p>
                        )}
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                          <span className="font-mono text-emerald-700 font-bold">Vật tư: {wo.materialCost.toLocaleString('vi-VN')} đ</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicketForAction(wo);
                              setSolutionInput(wo.solutionDescription || '');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                          >
                            Nghiệm Thu
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cột 3: Đã nghiệm thu hoàn thành */}
                <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                    <span className="font-black text-xs uppercase text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>3. Đã Nghiệm Thu Hoàn Thành</span>
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
                      {workOrders.filter(w => w.status === 'COMPLETED').length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {workOrders.filter(w => w.status === 'COMPLETED').map(wo => (
                      <div key={wo.id} className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="font-mono font-bold text-indigo-700 text-[11px]">{wo.ticketCode}</span>
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                            {wo.satisfactionRating} ⭐⭐⭐⭐⭐
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs leading-tight">{wo.title}</h5>
                        <p className="text-[10.5px] text-slate-500">📍 {wo.locationDetail}</p>
                        <p className="text-[10px] text-emerald-800 font-medium bg-emerald-50 p-1.5 rounded">
                          ✓ {wo.solutionDescription}
                        </p>
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                          <span className="text-slate-400">{wo.completedAt}</span>
                          <button
                            type="button"
                            onClick={() => setShowPrintTicketModal(wo)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer flex items-center gap-1"
                            title="In biên bản nghiệm thu kỹ thuật A4"
                          >
                            <Printer className="w-3 h-3" />
                            <span>In Biên Bản A4</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: TABLE VIEW (BẢNG DANH SÁCH CHI TIẾT) */}
            {workOrderViewMode === 'TABLE' && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-center">Mã Phiếu</th>
                      <th className="px-3 py-2">Nội Dung Sự Cố</th>
                      <th className="px-3 py-2">Người Báo &amp; Phòng Ban</th>
                      <th className="px-3 py-2">Vị Trí Hiện Trường</th>
                      <th className="px-3 py-2 text-center">Độ Khẩn</th>
                      <th className="px-3 py-2">Kỹ Thuật Xử Lý</th>
                      <th className="px-3 py-2 text-right">Chi Phí Vật Tư</th>
                      <th className="px-3 py-2 text-center">Trạng Thái</th>
                      <th className="px-3 py-2 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workOrders.map(wo => (
                      <tr key={wo.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-700">{wo.ticketCode}</td>
                        <td className="px-3 py-2.5 max-w-[260px]">
                          <div className="font-bold text-slate-900">{wo.title}</div>
                          {wo.solutionDescription && (
                            <p className="text-[10px] text-emerald-700 font-semibold line-clamp-1">✓ {wo.solutionDescription}</p>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-slate-900">{wo.reportedBy}</div>
                          <span className="text-[10px] text-slate-400">{wo.reportedDept}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-slate-600">{wo.locationDetail}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            wo.urgency === 'URGENT' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                            wo.urgency === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {wo.urgency === 'URGENT' ? 'Hỏa tốc (<2h)' : wo.urgency === 'HIGH' ? 'Ưu tiên (<8h)' : 'Thường'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-800">{wo.assignedTechnician}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                          {wo.materialCost.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            wo.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            wo.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {wo.status === 'COMPLETED' ? '✓ Đã nghiệm thu' : wo.status === 'IN_PROGRESS' ? 'Đang sửa chữa' : 'Chờ tiếp nhận'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1">
                            {wo.status !== 'COMPLETED' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTicketForAction(wo);
                                  setSolutionInput(wo.solutionDescription || '');
                                }}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10.5px] font-bold border border-indigo-200 cursor-pointer"
                              >
                                Nghiệm Thu
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowPrintTicketModal(wo)}
                                className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 cursor-pointer"
                                title="In phiếu nghiệm thu A4"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 5: KIỂM SOÁT NĂNG LƯỢNG XANH & CHỐNG LÃNG PHÍ ESG
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'ENERGY_MANAGEMENT_ESG' && (
        <div className="space-y-4 animate-in fade-in">
          {/* 3 THẺ CHỈ SỐ ESG BẢO VỆ MÔI TRƯỜNG */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50 border border-amber-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-amber-900 font-black text-xs uppercase">
                <span>ĐIỆN MẶT TRỜI MÁI NHÀ (SOLAR ROOFTOP 200kWP)</span>
                <Sun className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black font-mono text-amber-900">
                7.952 <span className="text-xs font-normal text-slate-600">kWh / tháng</span>
              </p>
              <p className="text-xs text-emerald-700 font-bold">
                ✓ Tiết kiệm 18.200.000 đ tiền điện hóa đơn EVN tháng này.
              </p>
              <p className="text-[11px] text-slate-500">
                450 tấm pin mono-crystalline tầng mái kho 1. Tỷ lệ tự dùng 92%, hòa lưới 8%.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-blue-900 font-black text-xs uppercase">
                <span>THU GOM NƯỚC MƯA &amp; TÁI SỬ DỤNG TƯỚI CÂY</span>
                <Droplets className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black font-mono text-blue-900">
                68 <span className="text-xs font-normal text-slate-600">m³ nước tái chế</span>
              </p>
              <p className="text-xs text-emerald-700 font-bold">
                ✓ Tiết kiệm 14% lượng nước sạch mua từ BIWASE.
              </p>
              <p className="text-[11px] text-slate-500">
                Hệ thống lắng cát tự nhiên kết hợp bể ngầm 100m3 cấp nước tưới khuôn viên cảnh quan 5S.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-900 font-black text-xs uppercase">
                <span>GIẢM PHÁT THẢI KHÍ NHÀ KÍNH (CO2 REDUCTION)</span>
                <Leaf className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black font-mono text-emerald-900">
                16.4 <span className="text-xs font-normal text-slate-600">Tấn CO₂ / tháng</span>
              </p>
              <p className="text-xs text-emerald-800 font-bold">
                ✓ Tương đương trồng mới 780 cây xanh hấp thụ carbon.
              </p>
              <p className="text-[11px] text-slate-500">
                Hệ số phát thải lưới điện VN: 0.7221 kg CO2/kWh. Phục vụ kiểm toán chứng chỉ ISO 50001.
              </p>
            </div>
          </div>

          {/* ĐỒ THỊ BIỂU DIỄN ĐƯỜNG CONG SẢN LƯỢNG ĐIỆN MẶT TRỜI TRONG NGÀY */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Đường Cong Phát Điện Mặt Trời Theo Giờ Trong Ngày (Solar Generation Curve)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Đỉnh công suất đạt 165 kW từ 11:30 đến 13:00 - Cung cấp điện trực tiếp cho hệ thống chiller làm lạnh
                </p>
              </div>
              <span className="text-xs font-black text-amber-700 font-mono">Đỉnh: 165 kW</span>
            </div>

            {/* Biểu đồ cột dạng thời gian (06h - 18h) */}
            <div className="grid grid-cols-13 gap-1.5 items-end h-32 pt-4 px-2 bg-slate-50 rounded-xl border border-slate-100">
              {[
                { time: '06h', val: 5 },
                { time: '07h', val: 20 },
                { time: '08h', val: 55 },
                { time: '09h', val: 95 },
                { time: '10h', val: 135 },
                { time: '11h', val: 160 },
                { time: '12h', val: 165 },
                { time: '13h', val: 155 },
                { time: '14h', val: 125 },
                { time: '15h', val: 80 },
                { time: '16h', val: 40 },
                { time: '17h', val: 15 },
                { time: '18h', val: 2 }
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[9px] font-mono text-slate-400 group-hover:text-amber-600 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.val}kW
                  </span>
                  <div 
                    style={{ height: `${(bar.val / 165) * 100}%` }}
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-md hover:from-amber-600 hover:to-amber-400 transition-all shadow-xs"
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1">{bar.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CHECKLIST 8 THÓI QUEN TIẾT KIỆM NĂNG LƯỢNG 5S HÀNH CHÍNH */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Checklist 8 Thói Quen 5S Tiết Kiệm Năng Lượng &amp; Chống Lãng Phí Doanh Nghiệp</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tuyên truyền và giám sát thực hiện cam kết văn phòng xanh không rác thải
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                {esgChecklist.filter(c => c.done).length}/8 Đã Đạt Chuẩn
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {esgChecklist.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleEsgCheckItem(item.id)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center space-x-2.5 cursor-pointer select-none ${
                    item.done ? 'bg-emerald-50/60 border-emerald-200 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className={`p-1 rounded-lg ${item.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 6: KIỂM KÊ TÀI SẢN & KHẤU HAO THIẾT BỊ HẠ TẦNG
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'ASSET_DEPRECIATION' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Sổ Kiểm Kê Tài Sản Cố Định &amp; Bảng Tính Khấu Hao Hạ Tầng (TT 45/2013/TT-BTC)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mã thẻ tài sản (Asset Tag), nguyên giá, khấu hao lũy kế, giá trị còn lại Net Book Value và in tem mã QR
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Mã Thẻ (Tag)</th>
                    <th className="px-3 py-2">Tên Thiết Bị Hạ Tầng</th>
                    <th className="px-3 py-2">Vị Trí Lắp Đặt</th>
                    <th className="px-3 py-2">Đơn Vị Quản Lý</th>
                    <th className="px-3 py-2 text-right">Nguyên Giá</th>
                    <th className="px-3 py-2 text-right">Đã Khấu Hao</th>
                    <th className="px-3 py-2 text-right">Giá Trị Còn Lại</th>
                    <th className="px-3 py-2 text-center">Tình Trạng</th>
                    <th className="px-3 py-2 text-center">Tem QR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {infraAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-700">{asset.assetTag}</td>
                      <td className="px-3 py-2.5 max-w-[260px]">
                        <div className="font-bold text-slate-900">{asset.assetName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">S/N: {asset.serialNumber}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-600">{asset.installedLocation}</td>
                      <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-800">{asset.deptInCharge}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                        {asset.originalCost.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">
                        {asset.accumulatedDepreciation.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-700">
                        {asset.netBookValue.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Hoạt động tốt
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedAssetForQr(asset)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] border border-indigo-200 cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Xem Nhãn QR</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 1: TẠO PHIẾU BÁO HỎNG SỰ CỐ MỚI
      ════════════════════════════════════════════════════════════ */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-sm">Tạo Phiếu Báo Hỏng Cơ Sở Vật Chất / Hạ Tầng Mới</h3>
              </div>
              <button onClick={() => setShowCreateTicketModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề &amp; Hiện Tượng Sự Cố:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Điều hòa phòng họp 2 bị chảy nước, hỏng đèn tuýp LED chuyền 1..."
                  value={newTicketForm.title}
                  onChange={e => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-rose-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Người Báo Sự Cố:</label>
                  <select
                    value={newTicketForm.reportedBy}
                    onChange={e => {
                      const emp = employees.find(x => x.fullName === e.target.value);
                      setNewTicketForm({
                        ...newTicketForm,
                        reportedBy: e.target.value,
                        reportedDept: emp?.departmentName || 'Khối Văn Phòng'
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none text-slate-800 bg-white font-semibold"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.fullName}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức Độ Khẩn Cấp (SLA):</label>
                  <select
                    value={newTicketForm.urgency}
                    onChange={e => setNewTicketForm({ ...newTicketForm, urgency: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 bg-white"
                  >
                    <option value="URGENT">Hỏa Tốc (Sự cố nghiêm trọng &lt; 2h)</option>
                    <option value="HIGH">Ưu Tiên Cao (Ảnh hưởng công việc &lt; 8h)</option>
                    <option value="NORMAL">Bình Thường (Xử lý trong 24h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vị Trí Hiện Trường Chi Tiết:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ghi rõ phòng nào, tầng mấy, cột số bao nhiêu hoặc máy móc bị ảnh hưởng..."
                  value={newTicketForm.locationDetail}
                  onChange={e => setNewTicketForm({ ...newTicketForm, locationDetail: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Phiếu Báo Hỏng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 2: NGHIỆM THU HOÀN TẤT TICKET
      ════════════════════════════════════════════════════════════ */}
      {selectedTicketForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Nghiệm Thu Sửa Chữa: {selectedTicketForAction.ticketCode}</h3>
              </div>
              <button onClick={() => setSelectedTicketForAction(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteTicket} className="p-4 space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p><b>Sự cố:</b> <span className="font-bold text-slate-900">{selectedTicketForAction.title}</span></p>
                <p><b>Vị trí:</b> {selectedTicketForAction.locationDetail}</p>
                <p><b>Kỹ thuật phụ trách:</b> {selectedTicketForAction.assignedTechnician}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phương Án Sửa Chữa Đã Thực Hiện:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ghi rõ công việc đã làm (vd: đã thông ống nước ngưng, thay bóng đèn mới...)"
                  value={solutionInput}
                  onChange={e => setSolutionInput(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                <span className="font-bold text-indigo-950 block">Hạch Toán Vật Tư Thay Thế (Nếu có):</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tên linh kiện/vật tư..."
                    value={materialPartInput}
                    onChange={e => setMaterialPartInput(e.target.value)}
                    className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Chi phí (VNĐ)..."
                    value={materialCostInput || ''}
                    onChange={e => setMaterialCostInput(Number(e.target.value))}
                    className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đánh Giá Mức Độ Hài Lòng Sau Sửa Chữa:</label>
                <div className="flex items-center space-x-2 pt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className={`p-2 rounded-xl font-bold cursor-pointer transition-all ${
                        ratingInput >= star ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {star} ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicketForAction(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác Nhận Nghiệm Thu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 3: XEM BẢNG ĐỐI SOÁT CHI TIẾT ĐIỆN 3 GIÁ EVN
      ════════════════════════════════════════════════════════════ */}
      {showUtilityAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Bảng Kê Chi Tiết Chỉ Số: {showUtilityAuditModal.categoryTitle}</h3>
              </div>
              <button onClick={() => setShowUtilityAuditModal(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p><b>Nhà cung cấp:</b> {showUtilityAuditModal.providerName}</p>
                <p><b>Mã hóa đơn VAT:</b> <span className="font-mono font-bold text-indigo-700">{showUtilityAuditModal.invoiceCode}</span></p>
                <p><b>Tổng tiền thanh toán:</b> <span className="font-mono font-black text-emerald-700 text-sm">{showUtilityAuditModal.amount.toLocaleString('vi-VN')} đ</span></p>
              </div>

              {showUtilityAuditModal.metricsBreakdown && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 block">Cơ Cấu Chỉ Số Điện 3 Giá EVN (kWh):</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                      <span className="text-[10px] text-blue-700 font-bold block">Giờ Bình Thường</span>
                      <b className="font-mono text-sm text-blue-900">{showUtilityAuditModal.metricsBreakdown.normalHoursKwh?.toLocaleString('vi-VN')} kWh</b>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">1.685 đ/kWh</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] text-rose-700 font-bold block">Giờ Cao Điểm</span>
                      <b className="font-mono text-sm text-rose-900">{showUtilityAuditModal.metricsBreakdown.peakHoursKwh?.toLocaleString('vi-VN')} kWh</b>
                      <span className="text-[9.5px] text-rose-600 block mt-0.5">3.076 đ/kWh</span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold block">Giờ Thấp Điểm</span>
                      <b className="font-mono text-sm text-emerald-900">{showUtilityAuditModal.metricsBreakdown.offPeakHoursKwh?.toLocaleString('vi-VN')} kWh</b>
                      <span className="text-[9.5px] text-emerald-600 block mt-0.5">1.100 đ/kWh</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                    <span>Hệ số công suất phản kháng (cos φ): <b>{showUtilityAuditModal.metricsBreakdown.powerFactorCosPhi}</b></span>
                    <span className="text-emerald-700 font-bold">✓ Đạt chuẩn &ge; 0.90 (Không bị phạt)</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUtilityAuditModal(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 4: IN BIÊN BẢN NGHIỆM THU SỬA CHỮA A4
      ════════════════════════════════════════════════════════════ */}
      {showPrintTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Biên Bản Nghiệm Thu Hoàn Thành Sửa Chữa Cơ Sở Vật Chất (A4)
                </h3>
              </div>
              <button onClick={() => setShowPrintTicketModal(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif leading-relaxed text-slate-900 bg-white">
              <div className="border-b pb-3 text-center">
                <p className="font-bold text-xs uppercase">{policy.companyName}</p>
                <h2 className="text-base font-bold uppercase mt-1 text-slate-900">
                  BIÊN BẢN NGHIỆM THU KỸ THUẬT &amp; SỬA CHỮA HẠ TẦNG
                </h2>
                <p className="text-[10.5px] italic text-slate-500">Mã phiếu: {showPrintTicketModal.ticketCode} • Thời điểm: {showPrintTicketModal.completedAt}</p>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <p><b>1. Đơn vị yêu cầu sửa chữa:</b> {showPrintTicketModal.reportedDept} (Người báo: {showPrintTicketModal.reportedBy})</p>
                <p><b>2. Địa điểm hiện trường:</b> {showPrintTicketModal.locationDetail}</p>
                <p><b>3. Hiện tượng sự cố:</b> {showPrintTicketModal.title}</p>
                <p><b>4. Phương án &amp; kết quả khắc phục:</b> {showPrintTicketModal.solutionDescription}</p>
                {showPrintTicketModal.sparePartsUsed && showPrintTicketModal.sparePartsUsed.length > 0 && (
                  <p><b>5. Vật tư linh kiện thay thế:</b> {showPrintTicketModal.sparePartsUsed.map(p => `${p.partName} (${p.quantity} cái - ${p.unitPrice.toLocaleString('vi-VN')} đ)`).join(', ')}</p>
                )}
                <p><b>6. Đơn vị thực hiện:</b> {showPrintTicketModal.assignedTechnician}</p>
                <p><b>7. Đánh giá chất lượng sau bàn giao:</b> <span className="font-bold text-amber-600">{showPrintTicketModal.satisfactionRating} ⭐ (Hài lòng)</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center pt-8 mt-6 border-t text-[11px]">
                <div>
                  <p className="font-bold uppercase">Kỹ Thuật Viên Sửa Chữa</p>
                  <p className="italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Đại Diện Bên Nghiệm Thu</p>
                  <p className="italic text-slate-400 mt-12">{showPrintTicketModal.reportedBy}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Mẫu in chuẩn A4 lưu hồ sơ bảo trì hạ tầng</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintTicketModal(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Văn Bản Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 5: XEM & IN TEM NHÃN MÃ QR TÀI SẢN (ASSET TAG QR)
      ════════════════════════════════════════════════════════════ */}
      {selectedAssetForQr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Tem Nhãn Kỹ Thuật Mã QR (80x50mm)</h3>
              </div>
              <button onClick={() => setSelectedAssetForQr(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              {/* Thẻ tem nhãn thiết kế chuẩn nhãn dán kỹ thuật */}
              <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-black text-[10.5px] uppercase tracking-wider text-slate-800">
                    {policy.companyName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 text-purple-800">
                    TEM TÀI SẢN
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Mã QR giả lập chuẩn vector */}
                  <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-2xs shrink-0 flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-900 rounded-lg p-1 flex items-center justify-center text-white">
                      <QrCode className="w-16 h-16 text-white" />
                    </div>
                    <span className="text-[8.5px] font-mono font-bold text-slate-500 mt-1">SCAN QR CODE</span>
                  </div>

                  <div className="space-y-1 text-[10.5px] text-slate-700">
                    <div>Mã thẻ: <b className="font-mono text-indigo-700 text-xs">{selectedAssetForQr.assetTag}</b></div>
                    <div className="font-bold text-slate-900 leading-tight">{selectedAssetForQr.assetName}</div>
                    <div>S/N: <span className="font-mono">{selectedAssetForQr.serialNumber}</span></div>
                    <div>Vị trí: <span className="text-slate-600">{selectedAssetForQr.installedLocation}</span></div>
                    <div>Quản lý: <b>{selectedAssetForQr.deptInCharge}</b></div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-200 text-center text-[9px] text-slate-400 italic">
                  Quét mã để xem hồ sơ bảo trì, thông số và báo hỏng kỹ thuật tức thì
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAssetForQr(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Tem Nhãn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 6: XEM GIẤY CHỨNG NHẬN KIỂM ĐỊNH KỸ THUẬT AN TOÀN LAO ĐỘNG
      ════════════════════════════════════════════════════════════ */}
      {selectedPmCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Giấy Chứng Nhận Kết Quả Kiểm Định Kỹ Thuật An Toàn (QCVN)
                </h3>
              </div>
              <button onClick={() => setSelectedPmCertificate(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif leading-relaxed text-slate-900 bg-white">
              <div className="border-b pb-3 text-center">
                <p className="font-bold text-[10px] uppercase text-slate-500">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-[10px] italic">Độc lập - Tự do - Hạnh phúc</p>
                <h2 className="text-sm font-bold uppercase mt-2 text-slate-900">
                  GIẤY CHỨNG NHẬN KẾT QUẢ KIỂM ĐỊNH
                </h2>
                <p className="text-[10.5px] italic text-slate-500">Số: {selectedPmCertificate.safetyCertificateCode} • Căn cứ TT 36/2019/TT-BLĐTBXH</p>
              </div>

              <div className="space-y-2 text-[11px]">
                <p><b>1. Thiết bị được kiểm định:</b> {selectedPmCertificate.systemName}</p>
                <p><b>2. Đơn vị sở hữu / sử dụng:</b> {policy.companyName}</p>
                <p><b>3. Vị trí lắp đặt:</b> {selectedPmCertificate.location}</p>
                <p><b>4. Đơn vị thực hiện kiểm định:</b> {selectedPmCertificate.safetyCertificateAgency || 'Trung Tâm Kiểm Định Kỹ Thuật An Toàn KV2'}</p>
                <p><b>5. Kết luận kiểm định:</b> <span className="font-bold text-emerald-700">ĐẠT YÊU CẦU KỸ THUẬT AN TOÀN LAO ĐỘNG</span> theo Quy chuẩn Kỹ thuật Quốc gia QCVN.</p>
                <p><b>6. Thời hạn kiểm định có hiệu lực:</b> Đến ngày <b className="font-mono text-indigo-700">{selectedPmCertificate.safetyCertificateExpiry}</b></p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center pt-8 mt-6 border-t text-[11px]">
                <div>
                  <p className="font-bold uppercase">Kiểm Định Viên</p>
                  <p className="italic text-slate-400 mt-12">(Ký và đóng dấu kiểm định)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Thủ Trưởng Cơ Quan Kiểm Định</p>
                  <p className="italic text-slate-400 mt-12">(Ký tên và đóng dấu đỏ)</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Tem kiểm định kỹ thuật an toàn lưu hồ sơ pháp lý</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedPmCertificate(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Chứng Nhận</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
