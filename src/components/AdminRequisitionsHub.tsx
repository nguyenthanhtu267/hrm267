import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Building, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  Car, 
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
  Check, 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  ClipboardCheck, 
  QrCode, 
  Key, 
  FileSignature, 
  UserCheck, 
  ShieldCheck, 
  CheckCheck, 
  HardHat, 
  Gift, 
  Maximize2, 
  Minimize2, 
  ListChecks, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Plane,
  Hotel,
  Briefcase,
  Shirt,
  BookOpen,
  Layers,
  RefreshCw,
  Send,
  HelpCircle,
  FileSpreadsheet,
  Package,
  AlertOctagon,
  CheckSquare,
  BarChart3,
  Award,
  Flame,
  Stethoscope,
  Activity,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';

interface AdminRequisitionsHubProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
}

// 6 PHÂN HỆ CHUYÊN BIỆT CỦA MỤC 2. ĐĂNG KÝ & PHÊ DUYỆT
export type AdminReqSubCategory = 
  | 'COMMAND_CENTER'      // 1. Trung Tâm Điều Phối & Phê Duyệt Đa Cấp 360°
  | 'STATIONERY_QUOTA'    // 2. Văn Phòng Phẩm & Định Mức Quota Phòng Ban
  | 'BUSINESS_TRAVEL'     // 3. Vé Máy Bay, Khách Sạn & Công Tác Phí
  | 'HEALTH_EXAMS'        // 4. Khám Sức Khỏe Định Kỳ & Bệnh Nghề Nghiệp
  | 'PPE_UNIFORMS'        // 5. Đồng Phục & Bảo Hộ Lao Động (PPE)
  | 'HSE_TRAINING_EVENTS';// 6. Huấn Luyện ATVSLĐ & Sự Kiện Doanh Nghiệp

export interface RequisitionItem {
  id: string;
  category: 'STATIONERY' | 'TRAVEL_FLIGHT' | 'HEALTH_EXAM' | 'PPE_UNIFORM' | 'HSE_TRAINING' | 'EVENT_BENEFIT';
  categoryLabel: string;
  requesterName: string;
  requesterEmpId: string;
  department: string;
  title: string;
  details: string;
  estimatedCost: number;
  createdAt: string;
  deadline: string;
  urgency: 'NORMAL' | 'HIGH' | 'URGENT';
  approvalStep: 'DEPT_HEAD' | 'ADMIN_REVIEW' | 'FINANCE_CHECK' | 'BOD_APPROVED' | 'REJECTED';
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  approverHistory: Array<{
    role: string;
    name: string;
    action: 'APPROVED' | 'REJECTED' | 'FORWARDED';
    time: string;
    note?: string;
  }>;
  quotaWarning?: boolean;
}

export interface DepartmentQuota {
  deptId: string;
  deptName: string;
  headcount: number;
  quotaPerCapita: number; // VNĐ / người / tháng
  monthlyBudget: number;  // quotaPerCapita * headcount
  spentThisMonth: number;
  pendingRequestsCost: number;
}

export interface StationeryItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentStock: number;
  safetyStock: number;
  unitPrice: number;
  supplier: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface TravelBooking {
  id: string;
  reqId: string;
  staffName: string;
  roleTitle: string;
  dept: string;
  destination: string;
  purpose: string;
  dates: string;
  flightRoute?: string;
  airline?: string;
  flightCode?: string;
  pnrCode?: string;
  hotelName?: string;
  hotelNights?: number;
  hotelCost?: number;
  perDiemAllowance: number;
  totalCost: number;
  status: 'WAITING_APPROVAL' | 'BOOKED' | 'TRAVELING' | 'EXPENSED';
}

export interface HealthExamBatch {
  id: string;
  batchName: string;
  packageType: 'PACKAGE_A_OFFICE' | 'PACKAGE_B_FACTORY' | 'PACKAGE_C_VIP';
  packageTitle: string;
  targetDept: string;
  headcountRegistered: number;
  headcountExamined: number;
  examHospital: string;
  examDate: string;
  unitCost: number;
  totalBudget: number;
  status: 'PLANNING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  healthResults: {
    type1VeryHealthy: number;
    type2Healthy: number;
    type3Average: number;
    type4Weak: number;
    type5Chronic: number;
  };
}

export interface PPEAllocation {
  id: string;
  itemName: string;
  itemCategory: 'SAFETY_SHOES' | 'WORKWEAR' | 'HELMET' | 'GLOVES' | 'RESPIRATOR' | 'GLASSES';
  spec: string;
  dept: string;
  recipientName: string;
  recipientEmpId: string;
  size: string;
  quantity: number;
  unitCost: number;
  allocatedDate: string;
  cycleMonths: number;
  nextRenewalDate: string;
  status: 'APPROVED' | 'DELIVERED' | 'WAITING_STOCK';
}

export interface HSETrainingBatch {
  id: string;
  groupType: 'GROUP_1' | 'GROUP_2' | 'GROUP_3' | 'GROUP_4' | 'GROUP_5' | 'GROUP_6';
  groupName: string;
  targetRole: string;
  attendeesCount: number;
  trainingCenter: string;
  trainingDate: string;
  certificateValidityYears: number;
  expiryDate: string;
  estimatedBudget: number;
  status: 'PENDING_APPROVAL' | 'TRAINING_SCHEDULED' | 'CERTIFIED';
}

export const AdminRequisitionsHub: React.FC<AdminRequisitionsHubProps> = ({
  policy,
  employees,
  currentRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminReqSubCategory>('COMMAND_CENTER');

  // ==========================================================
  // 1. DỮ LIỆU CÁC ĐƠN YÊU CẦU HÀNH CHÍNH TỔNG HỢP
  // ==========================================================
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>([
    {
      id: 'REQ-HC-2026-101',
      category: 'STATIONERY',
      categoryLabel: 'Mua Văn Phòng Phẩm (VPP)',
      requesterName: 'Trần Thị Thu Trang',
      requesterEmpId: 'AV-0128',
      department: 'Phân Xưởng Đóng Gói',
      title: 'Đăng ký cấp VPP tháng 09: 25 ram giấy in A4, 10 hộp bút, 15 kẹp còng',
      details: 'Phục vụ in nhãn thùng hàng xuất khẩu đợt cuối năm và lưu trữ biên bản kiểm phẩm KCS.',
      estimatedCost: 2850000,
      createdAt: '2026-09-08',
      deadline: '2026-09-12',
      urgency: 'NORMAL',
      approvalStep: 'DEPT_HEAD',
      status: 'PENDING',
      approverHistory: [
        { role: 'Người lập đơn', name: 'Trần Thị Thu Trang', action: 'FORWARDED', time: '08:30 08/09/2026', note: 'Gửi quản đốc xưởng duyệt định mức' }
      ],
      quotaWarning: false
    },
    {
      id: 'REQ-HC-2026-102',
      category: 'TRAVEL_FLIGHT',
      categoryLabel: 'Vé Máy Bay & Khách Sạn Công Tác',
      requesterName: 'Lê Hoàng Nam (Trưởng Ban QA/QC)',
      requesterEmpId: 'AV-0412',
      department: 'Phòng Đảm Bảo Chất Lượng',
      title: 'Vé máy bay khứ hồi SGN-HAN & Khách sạn 3N2Đ thanh tra nhà máy chi nhánh Hải Phòng',
      details: 'Đoàn 2 người: Lê Hoàng Nam & Kỹ sư trưởng Tuấn. Vé Vietnam Airlines hạng phổ thông linh hoạt, khách sạn 3 sao.',
      estimatedCost: 11800000,
      createdAt: '2026-09-06',
      deadline: '2026-09-15',
      urgency: 'HIGH',
      approvalStep: 'BOD_APPROVED',
      status: 'APPROVED',
      approverHistory: [
        { role: 'Trưởng phòng', name: 'Lê Hoàng Nam', action: 'APPROVED', time: '09:00 06/09/2026' },
        { role: 'HCNS Thẩm định', name: 'Nguyễn Thị Mai Chi', action: 'APPROVED', time: '14:20 06/09/2026', note: 'Đã check đúng hạn mức chức danh' },
        { role: 'Ban Giám Đốc', name: 'Tổng Giám Đốc Trần An', action: 'APPROVED', time: '17:00 06/09/2026', note: 'Duyệt công tác theo kế hoạch' }
      ],
      quotaWarning: false
    },
    {
      id: 'REQ-HC-2026-103',
      category: 'HEALTH_EXAM',
      categoryLabel: 'Khám Sức Khỏe Định Kỳ & Bệnh Nghề Nghiệp',
      requesterName: 'Phạm Hồng Thái (Chuyên viên HSE)',
      requesterEmpId: 'AV-0399',
      department: 'Ban An Toàn & Môi Trường (HSE)',
      title: 'Khám sức khỏe định kỳ & đo thính lực buồng cách âm cho 450 công nhân xưởng sản xuất',
      details: 'Theo Thông tư 14/2013 và TT 19/2016 Bộ Y Tế. Lấy mẫu máu xét nghiệm tại xưởng, chụp X-quang phổi kỹ thuật số xe lưu động.',
      estimatedCost: 157500000,
      createdAt: '2026-08-25',
      deadline: '2026-09-20',
      urgency: 'NORMAL',
      approvalStep: 'BOD_APPROVED',
      status: 'APPROVED',
      approverHistory: [
        { role: 'Trưởng Ban HSE', name: 'Hoàng Minh Quân', action: 'APPROVED', time: '10:00 25/08/2026' },
        { role: 'Kế Toán Trưởng', name: 'Vũ Bích Ngọc', action: 'APPROVED', time: '15:30 26/08/2026', note: 'Đã đưa vào dự toán chi phí phúc lợi Q3' },
        { role: 'Tổng Giám Đốc', name: 'Ban TGĐ Phê Duyệt', action: 'APPROVED', time: '09:15 27/08/2026' }
      ],
      quotaWarning: false
    },
    {
      id: 'REQ-HC-2026-104',
      category: 'HSE_TRAINING',
      categoryLabel: 'Huấn Luyện ATVSLĐ Nghị Định 44',
      requesterName: 'Nguyễn Văn Tuấn (Kỹ sư HSE)',
      requesterEmpId: 'AV-0418',
      department: 'Phòng Kỹ Thuật & HSE',
      title: 'Đào tạo cấp thẻ an toàn lao động Nhóm 3 (Lái xe nâng, thợ điện, vận hành lò hơi 48 người)',
      details: 'Chứng chỉ hết hạn ngày 30/09/2026. Mời Trung tâm Kiểm định Kỹ thuật ATLĐ Tỉnh Bình Dương về đào tạo và sát hạch cấp thẻ.',
      estimatedCost: 28800000,
      createdAt: '2026-09-07',
      deadline: '2026-09-11',
      urgency: 'URGENT',
      approvalStep: 'ADMIN_REVIEW',
      status: 'PENDING',
      approverHistory: [
        { role: 'Quản đốc xưởng', name: 'Vũ Đức Trọng', action: 'APPROVED', time: '11:00 07/09/2026' }
      ],
      quotaWarning: false
    },
    {
      id: 'REQ-HC-2026-105',
      category: 'PPE_UNIFORM',
      categoryLabel: 'Đồng Phục & Bảo Hộ Lao Động (PPE)',
      requesterName: 'Đỗ Văn Thắng (Quản đốc Xưởng Cơ Điện)',
      requesterEmpId: 'AV-0210',
      department: 'Phân Xưởng Cơ Điện',
      title: 'Cấp phát bổ sung 45 đôi giày mũi thép Safety Jogger Bestrun S3 cho công nhân mới & hao mòn',
      details: 'Đạt chuẩn EN ISO 20345:2011 chống đinh, chống dập ngón chân và đế chống trơn trượt dầu mỡ.',
      estimatedCost: 18000000,
      createdAt: '2026-09-05',
      deadline: '2026-09-10',
      urgency: 'HIGH',
      approvalStep: 'BOD_APPROVED',
      status: 'IN_PROGRESS',
      approverHistory: [
        { role: 'Quản đốc', name: 'Đỗ Văn Thắng', action: 'APPROVED', time: '08:00 05/09/2026' },
        { role: 'HCNS Thẩm định', name: 'Đã duyệt kho cấp phát', action: 'APPROVED', time: '14:00 05/09/2026' }
      ],
      quotaWarning: false
    },
    {
      id: 'REQ-HC-2026-106',
      category: 'EVENT_BENEFIT',
      categoryLabel: 'Sự Kiện, Du Lịch & Phúc Lợi Doanh Nghiệp',
      requesterName: 'BCH Công Đoàn Cơ Sở',
      requesterEmpId: 'AV-CĐ01',
      department: 'Ban Chấp Hành Công Đoàn',
      title: 'Dự toán tặng 750 hộp bánh Trung thu Kinh Đô cao cấp cho toàn thể CBCNV & Đối tác VIP',
      details: 'Tiêu chuẩn mỗi CBCNV 01 hộp 4 bánh (550.000đ/hộp) + 50 hộp quà tặng đối tác doanh nghiệp.',
      estimatedCost: 44000000,
      createdAt: '2026-09-02',
      deadline: '2026-09-15',
      urgency: 'NORMAL',
      approvalStep: 'BOD_APPROVED',
      status: 'COMPLETED',
      approverHistory: [
        { role: 'Chủ tịch Công đoàn', name: 'Trần Thị Thu Trang', action: 'APPROVED', time: '09:00 02/09/2026' },
        { role: 'Tổng Giám Đốc', name: 'Ban TGĐ Ký Duyệt', action: 'APPROVED', time: '16:00 03/09/2026' }
      ],
      quotaWarning: false
    }
  ]);

  // ==========================================================
  // 2. DỮ LIỆU ĐỊNH MỨC QUOTA VĂN PHÒNG PHẨM TỪNG PHÒNG BAN
  // ==========================================================
  const [departmentQuotas] = useState<DepartmentQuota[]>([
    {
      deptId: 'DEPT-VP',
      deptName: 'Khối Văn Phòng (HCNS, Kế Toán, Thu Mua)',
      headcount: 42,
      quotaPerCapita: 120000, // 120k / người
      monthlyBudget: 5040000,
      spentThisMonth: 3820000,
      pendingRequestsCost: 0
    },
    {
      deptId: 'DEPT-CB',
      deptName: 'Phân Xưởng Chế Biến & Đóng Gói',
      headcount: 280,
      quotaPerCapita: 35000,  // 35k / người
      monthlyBudget: 9800000,
      spentThisMonth: 7200000,
      pendingRequestsCost: 2850000
    },
    {
      deptId: 'DEPT-CD',
      deptName: 'Phân Xưởng Cơ Điện & Bảo Trì',
      headcount: 95,
      quotaPerCapita: 40000,  // 40k / người
      monthlyBudget: 3800000,
      spentThisMonth: 4120000, // Đã vượt 108%
      pendingRequestsCost: 0
    },
    {
      deptId: 'DEPT-KV',
      deptName: 'Kho Vận & Logistics Nhà Máy',
      headcount: 68,
      quotaPerCapita: 50000,
      monthlyBudget: 3400000,
      spentThisMonth: 2100000,
      pendingRequestsCost: 0
    },
    {
      deptId: 'DEPT-BOD',
      deptName: 'Ban Giám Đốc & Khối Điều Hành',
      headcount: 15,
      quotaPerCapita: 250000,
      monthlyBudget: 3750000,
      spentThisMonth: 2450000,
      pendingRequestsCost: 0
    }
  ]);

  // ==========================================================
  // 3. KHO ĐỆM VẬT TƯ TIÊU HAO THIẾT YẾU TẠI CHỖ (VPP)
  // ==========================================================
  const [stationeryInventory] = useState<StationeryItem[]>([
    { id: 'VPP-01', code: 'VPP-GIAYA4', name: 'Giấy in Double A A4 70gsm (Thùng 5 ram)', unit: 'Thùng', currentStock: 24, safetyStock: 15, unitPrice: 360000, supplier: 'Công ty CP Giấy Hải Tiến', status: 'IN_STOCK' },
    { id: 'VPP-02', code: 'VPP-MUCCANON', name: 'Mực máy in Canon LBP 2900 (Hộp Cartridge 303)', unit: 'Hộp', currentStock: 3, safetyStock: 5, unitPrice: 280000, supplier: 'Công ty Tin Học Tân Á', status: 'LOW_STOCK' },
    { id: 'VPP-03', code: 'VPP-BUTBI-X', name: 'Bút bi Thiên Long TL-027 Xanh (Hộp 20 cây)', unit: 'Hộp', currentStock: 18, safetyStock: 10, unitPrice: 85000, supplier: 'Đại lý VPP Bến Thành', status: 'IN_STOCK' },
    { id: 'VPP-04', code: 'VPP-BIACONG', name: 'Bìa còng bật Kokuyo 7cm Khổ F4', unit: 'Cái', currentStock: 12, safetyStock: 20, unitPrice: 48000, supplier: 'Đại lý VPP Bến Thành', status: 'LOW_STOCK' },
    { id: 'VPP-05', code: 'VPP-KEPBUOM', name: 'Kẹp bướm các cỡ 19mm - 25mm - 32mm', unit: 'Hộp', currentStock: 35, safetyStock: 15, unitPrice: 18000, supplier: 'Đại lý VPP Bến Thành', status: 'IN_STOCK' },
    { id: 'VPP-06', code: 'VPP-BANGKEO', name: 'Băng keo dán thùng OPP Trong 5cm x 100Y', unit: 'Cuộn', currentStock: 8, safetyStock: 25, unitPrice: 22000, supplier: 'Bao Bì Tân Phú', status: 'LOW_STOCK' }
  ]);

  // ==========================================================
  // 4. DANH SÁCH BOOKING VÉ MÁY BAY & KHÁCH SẠN CÔNG TÁC
  // ==========================================================
  const [travelBookings] = useState<TravelBooking[]>([
    {
      id: 'TRV-2026-01',
      reqId: 'REQ-HC-2026-102',
      staffName: 'Lê Hoàng Nam',
      roleTitle: 'Trưởng Ban QA/QC',
      dept: 'Phòng Đảm Bảo Chất Lượng',
      destination: 'Hà Nội & Hải Phòng',
      purpose: 'Thanh tra định kỳ nhà máy đối tác đóng gói chi nhánh miền Bắc',
      dates: '16/09/2026 - 18/09/2026 (3N2Đ)',
      flightRoute: 'SGN ⇄ HAN (Khứ hồi)',
      airline: 'Vietnam Airlines',
      flightCode: 'VN246 (Đi 07:00) / VN251 (Về 18:30)',
      pnrCode: 'VNA-8921XK',
      hotelName: 'Khách sạn Mercure Hải Phòng (4 sao)',
      hotelNights: 2,
      hotelCost: 2400000,
      perDiemAllowance: 1050000,
      totalCost: 11800000,
      status: 'BOOKED'
    },
    {
      id: 'TRV-2026-02',
      reqId: 'REQ-HC-2026-118',
      staffName: 'Vũ Đức Trọng',
      roleTitle: 'Giám Sát Kho Vận',
      dept: 'Kho Vận & Logistics',
      destination: 'Đà Nẵng & Quảng Nam',
      purpose: 'Nghiệm thu lắp đặt hệ thống giá kệ thông minh Selective kho miền Trung',
      dates: '22/09/2026 - 24/09/2026 (3N2Đ)',
      flightRoute: 'SGN ⇄ DAD (Khứ hồi)',
      airline: 'Vietjet Air',
      flightCode: 'VJ628 (Đi 08:15) / VJ633 (Về 19:00)',
      pnrCode: 'VJ-44390B',
      hotelName: 'Khách sạn Grand Gold Danang (3 sao)',
      hotelNights: 2,
      hotelCost: 1400000,
      perDiemAllowance: 750000,
      totalCost: 6500000,
      status: 'WAITING_APPROVAL'
    }
  ]);

  // ==========================================================
  // 5. KẾ HOẠCH KHÁM SỨC KHỎE ĐỊNH KỲ DOANH NGHIỆP
  // ==========================================================
  const [healthExamBatches] = useState<HealthExamBatch[]>([
    {
      id: 'HEX-2026-01',
      batchName: 'Đợt 1: Khối Văn Phòng & Quản Lý',
      packageType: 'PACKAGE_A_OFFICE',
      packageTitle: 'Gói Tiêu Chuẩn Văn Phòng: Lâm sàng, xét nghiệm máu, siêu âm, X-quang phổi',
      targetDept: 'Khối Văn Phòng, HCNS, Kế Toán, Kinh Doanh',
      headcountRegistered: 145,
      headcountExamined: 142,
      examHospital: 'Bệnh viện Đa Khoa Quốc Tế Becamex',
      examDate: '12/09/2026',
      unitCost: 650000,
      totalBudget: 94250000,
      status: 'COMPLETED',
      healthResults: {
        type1VeryHealthy: 68,
        type2Healthy: 54,
        type3Average: 18,
        type4Weak: 2,
        type5Chronic: 0
      }
    },
    {
      id: 'HEX-2026-02',
      batchName: 'Đợt 2: Khối Phân Xưởng & Tầm Soát Bệnh Nghề Nghiệp',
      packageType: 'PACKAGE_B_FACTORY',
      packageTitle: 'Gói Bệnh Nghề Nghiệp: Đo thính lực buồng cách âm, X-quang phổi kỹ thuật số, da liễu độc chất',
      targetDept: 'Phân Xưởng Chế Biến, Phân Xưởng Cơ Điện, Kho Vận',
      headcountRegistered: 450,
      headcountExamined: 442,
      examHospital: 'Bệnh Viện Quân Y 175 (Đoàn Khám Lưu Động)',
      examDate: '18/09/2026 - 21/09/2026',
      unitCost: 950000,
      totalBudget: 427500000,
      status: 'IN_PROGRESS',
      healthResults: {
        type1VeryHealthy: 210,
        type2Healthy: 165,
        type3Average: 58,
        type4Weak: 9,
        type5Chronic: 0
      }
    }
  ]);

  // ==========================================================
  // 6. CẤP PHÁT ĐỒNG PHỤC & TRANG BỊ BẢO HỘ LAO ĐỘNG (PPE)
  // ==========================================================
  const [ppeAllocations] = useState<PPEAllocation[]>([
    {
      id: 'PPE-2026-01',
      itemName: 'Giày Bảo Hộ Mũi Thép Chống Đinh Safety Jogger Bestrun S3',
      itemCategory: 'SAFETY_SHOES',
      spec: 'Da bò thật, mũi thép chịu lực 200J, lót thép chống đinh, đế PU chống trơn dầu mỡ',
      dept: 'Phân Xưởng Cơ Điện',
      recipientName: 'Vũ Văn Hùng',
      recipientEmpId: 'AV-0482',
      size: 'Size 41',
      quantity: 1,
      unitCost: 400000,
      allocatedDate: '05/09/2026',
      cycleMonths: 6,
      nextRenewalDate: '05/03/2027',
      status: 'DELIVERED'
    },
    {
      id: 'PPE-2026-02',
      itemName: 'Bộ Quần Áo Bảo Hộ Lao Động Kaki Nam Định Phối Phản Quang',
      itemCategory: 'WORKWEAR',
      spec: 'Vải Kaki liên doanh 65/35 thấm hút mồ hôi, viền phản quang xám 3M lưng áo',
      dept: 'Phân Xưởng Chế Biến',
      recipientName: 'Đặng Quốc Huy',
      recipientEmpId: 'AV-0590',
      size: 'Size L (65 - 72kg)',
      quantity: 2,
      unitCost: 280000,
      allocatedDate: '02/09/2026',
      cycleMonths: 6,
      nextRenewalDate: '02/03/2027',
      status: 'DELIVERED'
    },
    {
      id: 'PPE-2026-03',
      itemName: 'Nón Bảo Hộ Chịu Lực Thùy Dương N40 Có Núm Vặn & Quai Cài',
      itemCategory: 'HELMET',
      spec: 'Nhựa ABS nguyên sinh chống va đập, quai đeo chữ Y lót mút thấm mồ hôi',
      dept: 'Kho Vận & Logistics',
      recipientName: 'Phan Văn Nam',
      recipientEmpId: 'AV-0594',
      size: 'Free Size (Điều chỉnh núm vặn)',
      quantity: 1,
      unitCost: 95000,
      allocatedDate: '01/09/2026',
      cycleMonths: 12,
      nextRenewalDate: '01/09/2027',
      status: 'DELIVERED'
    }
  ]);

  // ==========================================================
  // 7. HUẤN LUYỆN ATVSLĐ NGHỊ ĐỊNH 44 & SỰ KIỆN PHÚC LỢI
  // ==========================================================
  const [hseTrainingBatches] = useState<HSETrainingBatch[]>([
    {
      id: 'TRN-ND44-01',
      groupType: 'GROUP_1',
      groupName: 'Nhóm 1: Người Làm Công Tác Quản Lý',
      targetRole: 'Ban Tổng Giám Đốc, Giám Đốc Nhà Máy, Quản Đốc Phân Xưởng',
      attendeesCount: 14,
      trainingCenter: 'Trung Tâm Kiểm Định KT ATLĐ Khu Vực II',
      trainingDate: '15/10/2026 (Khóa 16 giờ)',
      certificateValidityYears: 2,
      expiryDate: '15/10/2028',
      estimatedBudget: 8400000,
      status: 'TRAINING_SCHEDULED'
    },
    {
      id: 'TRN-ND44-03',
      groupType: 'GROUP_3',
      groupName: 'Nhóm 3: Công Việc Có Yêu Cầu Nghiêm Ngặt Về ATVSLĐ',
      targetRole: 'Vận hành xe nâng (24 người), Vận hành lò hơi (8 người), Thợ điện (16 người)',
      attendeesCount: 48,
      trainingCenter: 'Trung Tâm Huấn Luyện ATLĐ Sở LĐ-TB&XH Tỉnh',
      trainingDate: '24/09/2026 - 26/09/2026 (Khóa 24 giờ)',
      certificateValidityYears: 2,
      expiryDate: '26/09/2028',
      estimatedBudget: 28800000,
      status: 'PENDING_APPROVAL'
    },
    {
      id: 'TRN-ND44-04',
      groupType: 'GROUP_4',
      groupName: 'Nhóm 4: Người Lao Động Không Thuộc Nhóm 1, 2, 3, 5, 6',
      targetRole: 'Toàn bộ công nhân sản xuất trực tiếp và nhân viên mới tuyển dụng',
      attendeesCount: 450,
      trainingCenter: 'Nội bộ Công ty (Cán bộ HSE huấn luyện)',
      trainingDate: 'Định kỳ hàng tháng',
      certificateValidityYears: 1,
      expiryDate: '12/2026',
      estimatedBudget: 15000000,
      status: 'CERTIFIED'
    }
  ]);

  // ==========================================================
  // STATE CỦA BỘ LỌC, TÌM KIẾM & MODAL
  // ==========================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'STATIONERY' | 'TRAVEL_FLIGHT' | 'HEALTH_EXAM' | 'PPE_UNIFORM' | 'HSE_TRAINING' | 'EVENT_BENEFIT'>('ALL');

  // Modal tạo yêu cầu mới thông minh
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReqForm, setNewReqForm] = useState({
    category: 'STATIONERY' as 'STATIONERY' | 'TRAVEL_FLIGHT' | 'HEALTH_EXAM' | 'PPE_UNIFORM' | 'HSE_TRAINING' | 'EVENT_BENEFIT',
    requesterName: employees[0]?.fullName || 'Trần Thị Thu Trang',
    requesterEmpId: employees[0]?.employeeCode || 'AV-0128',
    department: employees[0]?.departmentName || 'Phân Xưởng Đóng Gói',
    title: '',
    details: '',
    estimatedCost: 1500000,
    deadline: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    urgency: 'NORMAL' as 'NORMAL' | 'HIGH' | 'URGENT'
  });

  // Modal xem chi tiết & phê duyệt đơn
  const [selectedReqForAction, setSelectedReqForAction] = useState<RequisitionItem | null>(null);
  const [approvalActionNote, setApprovalActionNote] = useState('');

  // Modal in văn bản A4 chuẩn
  const [showPrintReqModal, setShowPrintReqModal] = useState<RequisitionItem | null>(null);

  // ==========================================================
  // TÍNH TOÁN KPI THỜI GIAN THỰC
  // ==========================================================
  const kpiStats = useMemo(() => {
    const totalRequests = requisitions.length;
    const pendingCount = requisitions.filter(r => r.status === 'PENDING').length;
    const approvedCount = requisitions.filter(r => r.status === 'APPROVED' || r.status === 'IN_PROGRESS' || r.status === 'COMPLETED').length;
    const totalCost = requisitions.reduce((acc, r) => acc + r.estimatedCost, 0);
    const urgentCount = requisitions.filter(r => r.urgency === 'URGENT' && r.status === 'PENDING').length;
    
    return {
      totalRequests,
      pendingCount,
      approvedCount,
      totalCost,
      urgentCount,
      slaComplianceRate: 97.4,
      avgApprovalHours: 3.8
    };
  }, [requisitions]);

  // ==========================================================
  // LỌC DANH SÁCH YÊU CẦU
  // ==========================================================
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(r => {
      const matchSearch = searchTerm === '' ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [requisitions, searchTerm, statusFilter, categoryFilter]);

  // ==========================================================
  // XỬ LÝ DUYỆT & TỪ CHỐI ĐƠN
  // ==========================================================
  const handleApproveRequisition = (reqId: string) => {
    setRequisitions(prev => prev.map(r => {
      if (r.id === reqId) {
        const nowStr = new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN');
        const newHistory = [
          ...r.approverHistory,
          {
            role: 'Cấp Thẩm Quyền Ký Duyệt',
            name: currentRole === 'SUPER_ADMIN' ? 'Ban Giám Đốc Phê Duyệt' : 'Trưởng Bộ Phận Duyệt',
            action: 'APPROVED' as const,
            time: nowStr,
            note: approvalActionNote.trim() || 'Đã kiểm tra tính hợp lệ & định mức ngân sách.'
          }
        ];
        return {
          ...r,
          status: 'APPROVED',
          approvalStep: 'BOD_APPROVED',
          approverHistory: newHistory
        };
      }
      return r;
    }));
    setSelectedReqForAction(null);
    setApprovalActionNote('');
    alert('✓ ĐÃ PHÊ DUYỆT YÊU CẦU HÀNH CHÍNH THÀNH CÔNG!\nBộ phận Hành chính và Kế toán đã nhận thông báo tiến hành mua sắm/booking.');
  };

  const handleRejectRequisition = (reqId: string) => {
    if (!approvalActionNote.trim()) {
      alert('Vui lòng nhập lý do từ chối để người lập đơn được biết và điều chỉnh!');
      return;
    }
    setRequisitions(prev => prev.map(r => {
      if (r.id === reqId) {
        const nowStr = new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN');
        const newHistory = [
          ...r.approverHistory,
          {
            role: 'Người Thẩm Định',
            name: currentRole === 'SUPER_ADMIN' ? 'Ban Giám Đốc' : 'Trưởng Bộ Phận',
            action: 'REJECTED' as const,
            time: nowStr,
            note: approvalActionNote.trim()
          }
        ];
        return {
          ...r,
          status: 'REJECTED',
          approvalStep: 'REJECTED',
          approverHistory: newHistory
        };
      }
      return r;
    }));
    setSelectedReqForAction(null);
    setApprovalActionNote('');
    alert('Đã từ chối đơn yêu cầu. Lý do đã được gửi phản hồi tới người lập đơn.');
  };

  // Tạo đơn yêu cầu mới
  const handleCreateNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqForm.title.trim() || !newReqForm.details.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và mô tả nội dung yêu cầu!');
      return;
    }

    const catLabels: Record<string, string> = {
      'STATIONERY': 'Mua Văn Phòng Phẩm (VPP)',
      'TRAVEL_FLIGHT': 'Vé Máy Bay & Khách Sạn Công Tác',
      'HEALTH_EXAM': 'Khám Sức Khỏe Định Kỳ & Bệnh Nghề Nghiệp',
      'PPE_UNIFORM': 'Đồng Phục & Bảo Hộ Lao Động (PPE)',
      'HSE_TRAINING': 'Huấn Luyện ATVSLĐ Nghị Định 44',
      'EVENT_BENEFIT': 'Sự Kiện, Du Lịch & Phúc Lợi Doanh Nghiệp'
    };

    const newId = `REQ-HC-2026-${110 + requisitions.length}`;
    const nowStr = new Date().toISOString().slice(0, 10);

    const newReq: RequisitionItem = {
      id: newId,
      category: newReqForm.category,
      categoryLabel: catLabels[newReqForm.category] || 'Yêu cầu hành chính',
      requesterName: newReqForm.requesterName,
      requesterEmpId: newReqForm.requesterEmpId,
      department: newReqForm.department,
      title: newReqForm.title,
      details: newReqForm.details,
      estimatedCost: Number(newReqForm.estimatedCost) || 0,
      createdAt: nowStr,
      deadline: newReqForm.deadline,
      urgency: newReqForm.urgency,
      approvalStep: 'DEPT_HEAD',
      status: 'PENDING',
      approverHistory: [
        {
          role: 'Người lập đơn',
          name: newReqForm.requesterName,
          action: 'FORWARDED',
          time: new Date().toLocaleTimeString('vi-VN') + ' ' + nowStr,
          note: 'Đã nộp tờ trình lên hệ thống'
        }
      ],
      quotaWarning: false
    };

    setRequisitions([newReq, ...requisitions]);
    setShowCreateModal(false);
    setNewReqForm({
      category: 'STATIONERY',
      requesterName: employees[0]?.fullName || 'Trần Thị Thu Trang',
      requesterEmpId: employees[0]?.employeeCode || 'AV-0128',
      department: employees[0]?.departmentName || 'Phân Xưởng Đóng Gói',
      title: '',
      details: '',
      estimatedCost: 1500000,
      deadline: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      urgency: 'NORMAL'
    });
    alert('✓ ĐÃ TẠO YÊU CẦU HÀNH CHÍNH THÀNH CÔNG!\nĐơn đã được gửi tới Quản lý trực tiếp để bắt đầu quy trình phê duyệt số hóa.');
  };

  // ==========================================================
  // XUẤT BÁO CÁO EXCEL TỔNG HỢP ĐA SHEET (XLSX)
  // ==========================================================
  const handleExportRequisitionsExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Bảng kê các đơn yêu cầu hành chính
    const ws1Data = requisitions.map(r => ({
      'Mã Yêu Cầu': r.id,
      'Danh Mục': r.categoryLabel,
      'Người Đề Xuất': `${r.requesterName} (${r.requesterEmpId})`,
      'Phòng Ban': r.department,
      'Tiêu Đề Yêu Cầu': r.title,
      'Nội Dung Chi Tiết': r.details,
      'Dự Toán Kinh Phí (VNĐ)': r.estimatedCost,
      'Ngày Đề Xuất': r.createdAt,
      'Hạn Hoàn Tất': r.deadline,
      'Độ Khẩn Cấp': r.urgency === 'URGENT' ? 'Hỏa tốc (<24h)' : r.urgency === 'HIGH' ? 'Ưu tiên cao' : 'Bình thường',
      'Trạng Thái': r.status === 'APPROVED' ? 'Đã phê duyệt' : r.status === 'IN_PROGRESS' ? 'Đang mua sắm' : r.status === 'COMPLETED' ? 'Đã hoàn tất' : r.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'
    }));
    const ws1 = XLSX.utils.json_to_sheet(ws1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Yeu_Cau_Hanh_Chinh');

    // Sheet 2: Định mức Quota VPP theo phòng ban
    const ws2Data = departmentQuotas.map(q => ({
      'Mã BP': q.deptId,
      'Phòng Ban / Phân Xưởng': q.deptName,
      'Định Biên Nhân Sự': q.headcount,
      'Định Mức / Người / Tháng (VNĐ)': q.quotaPerCapita,
      'Tổng Ngân Sách Tháng (VNĐ)': q.monthlyBudget,
      'Thực Tế Đã Dùng (VNĐ)': q.spentThisMonth,
      'Tỷ Lệ Tiêu Hoa (%)': Math.round((q.spentThisMonth / q.monthlyBudget) * 100) + '%',
      'Đánh Giá Ngân Sách': q.spentThisMonth > q.monthlyBudget ? 'VƯỢT ĐỊNH MỨC' : 'Trong hạn mức'
    }));
    const ws2 = XLSX.utils.json_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Dinh_Muc_Quota_VPP');

    // Sheet 3: Danh sách booking vé máy bay & khách sạn
    const ws3Data = travelBookings.map(t => ({
      'Mã Booking': t.id,
      'Nhân Sự Công Tác': `${t.staffName} (${t.roleTitle})`,
      'Phòng Ban': t.dept,
      'Địa Điểm Công Tác': t.destination,
      'Mục Đích': t.purpose,
      'Thời Gian': t.dates,
      'Chặng Bay & Hãng': `${t.airline} - ${t.flightRoute}`,
      'Mã Vé (PNR)': t.pnrCode,
      'Khách Sạn Lưu Trú': t.hotelName,
      'Phụ Cấp Lưu Trú (VNĐ)': t.perDiemAllowance,
      'Tổng Chi Phí (VNĐ)': t.totalCost,
      'Trạng Thái': t.status
    }));
    const ws3 = XLSX.utils.json_to_sheet(ws3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'Ve_May_Bay_Khach_San');

    // Sheet 4: Sổ cấp phát bảo hộ lao động (PPE)
    const ws4Data = ppeAllocations.map(p => ({
      'Mã Cấp Phát': p.id,
      'Tên Trang Bị PPE': p.itemName,
      'Quy Cách & Tiêu Chuẩn': p.spec,
      'Người Nhận': `${p.recipientName} (${p.recipientEmpId})`,
      'Phòng Ban': p.dept,
      'Kích Cỡ (Size)': p.size,
      'Số Lượng': p.quantity,
      'Đơn Giá (VNĐ)': p.unitCost,
      'Ngày Cấp': p.allocatedDate,
      'Chu Kỳ Khấu Hao': p.cycleMonths + ' tháng',
      'Kỳ Cấp Tiếp Theo': p.nextRenewalDate
    }));
    const ws4 = XLSX.utils.json_to_sheet(ws4Data);
    XLSX.utils.book_append_sheet(wb, ws4, 'Cap_Phat_BHLD_PPE');

    XLSX.writeFile(wb, `Bao_Cao_Yeu_Cau_Hanh_Chinh_${policy.companyName.replace(/\s+/g, '_')}_09_2026.xlsx`);
  };

  return (
    <div className="space-y-1.5">
      {/* ════════════════════════════════════════════════════════════
          KHỐI 1: HEADER & KPI CARDS ĐIỀU HÀNH 360°
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 text-slate-800 rounded-2xl p-2 shadow-sm border border-indigo-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-200 pb-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-sm border-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-black tracking-wide uppercase">
                    Trung Tâm Đăng Ký &amp; Phê Duyệt Yêu Cầu Hành Chính Doanh Nghiệp
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200 shadow-sm">
                    SLA Chuẩn Doanh Nghiệp 2026
                  </span>
                </div>
                <p className="text-[11.5px] text-indigo-800/80 font-medium">
                  Tiếp nhận, kiểm tra định mức Quota, số hóa quy trình thẩm định đa cấp và phê duyệt tự động
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportRequisitionsExcel}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition-all flex items-center space-x-1.5 border border-indigo-200 cursor-pointer shadow-sm"
              title="Xuất toàn bộ báo cáo yêu cầu hành chính ra Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Báo Cáo Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black transition-all flex items-center space-x-1.5 shadow-md hover:shadow-indigo-500/25 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Yêu Cầu Mới</span>
            </button>
          </div>
        </div>

        {/* 4 KPI THỐNG KÊ THỜI GIAN THỰC */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Yêu Cầu Đã Tiếp Nhận</span>
              <div className="text-xl font-black font-mono text-white mt-0.5">{kpiStats.totalRequests} <span className="text-xs font-normal text-slate-300">đơn</span></div>
              <span className="text-[10px] text-emerald-400 font-semibold">{kpiStats.approvedCount} đã duyệt • {kpiStats.pendingCount} chờ xử lý</span>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <ListChecks className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kinh Phí Dự Toán Đề Xuất</span>
              <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                {(kpiStats.totalCost / 1000000).toFixed(1)} <span className="text-xs font-normal text-slate-300">triệu đ</span>
              </div>
              <span className="text-[10px] text-slate-300">Đã kiểm tra đối soát Quota</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">SLA Thời Gian Duyệt Đơn</span>
              <div className="text-xl font-black font-mono text-amber-300 mt-0.5">{kpiStats.avgApprovalHours} <span className="text-xs font-normal text-slate-300">giờ</span></div>
              <span className="text-[10px] text-amber-300 font-semibold">Tỷ lệ đúng hạn: {kpiStats.slaComplianceRate}%</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cảnh Báo Đơn Khẩn Cấp</span>
              <div className="text-xl font-black font-mono text-rose-300 mt-0.5">{kpiStats.urgentCount} <span className="text-xs font-normal text-slate-300">đơn hỏa tốc</span></div>
              <span className="text-[10px] text-rose-300 font-semibold">Cần duyệt &lt; 24h</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <AlertTriangle className="w-4 h-4" />
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
            onClick={() => setActiveSubTab('COMMAND_CENTER')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'COMMAND_CENTER'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>1. Trung Tâm Điều Phối &amp; Phê Duyệt Đa Cấp ({requisitions.filter(r => r.status === 'PENDING').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('STATIONERY_QUOTA')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'STATIONERY_QUOTA'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. Định Mức Quota VPP &amp; Vật Tư Tiêu Hao</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('BUSINESS_TRAVEL')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'BUSINESS_TRAVEL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-blue-500" />
            <span>3. Vé Máy Bay, Khách Sạn &amp; Công Tác Phí</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('HEALTH_EXAMS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'HEALTH_EXAMS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            <span>4. Khám Sức Khỏe Định Kỳ &amp; Bệnh Nghề Nghiệp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('PPE_UNIFORMS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'PPE_UNIFORMS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shirt className="w-3.5 h-3.5 text-emerald-500" />
            <span>5. Đồng Phục &amp; Bảo Hộ Lao Động (PPE)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('HSE_TRAINING_EVENTS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'HSE_TRAINING_EVENTS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-500" />
            <span>6. Huấn Luyện ATVSLĐ &amp; Sự Kiện Doanh Nghiệp</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: TRUNG TÂM ĐIỀU PHỐI & PHÊ DUYỆT ĐA CẤP 360°
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'COMMAND_CENTER' && (
        <div className="space-y-3">
          {/* THANH PIPELINE QUY TRÌNH DUYỆT TRỰC QUAN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quy Trình Phê Duyệt Hành Chính Đa Cấp Số Hóa (Digital Multi-Tier Workflow)</span>
              </span>
              <span className="text-[10px] text-slate-400">Tự động điều phối theo thẩm quyền phân cấp</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2.5 text-center text-xs">
              <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-700 block">BƯỚC 1</span>
                <p className="font-bold text-slate-800 text-[11px] mt-0.5">Người Lập Đơn</p>
                <p className="text-[10px] text-slate-500">Tạo đề xuất &amp; báo giá</p>
              </div>
              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-700 block">BƯỚC 2</span>
                <p className="font-bold text-slate-800 text-[11px] mt-0.5">Trưởng Bộ Phận</p>
                <p className="text-[10px] text-slate-500">Xác nhận nhu cầu nội bộ</p>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-200">
                <span className="text-[10px] font-bold text-purple-700 block">BƯỚC 3</span>
                <p className="font-bold text-slate-800 text-[11px] mt-0.5">HCNS Thẩm Định</p>
                <p className="text-[10px] text-slate-500">Đối soát định mức Quota</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-700 block">BƯỚC 4</span>
                <p className="font-bold text-slate-800 text-[11px] mt-0.5">Kế Toán Ngân Sách</p>
                <p className="text-[10px] text-slate-500">Kiểm tra dòng tiền &amp; dự toán</p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 block">BƯỚC 5</span>
                <p className="font-bold text-slate-800 text-[11px] mt-0.5">Ban TGĐ Ký Số</p>
                <p className="text-[10px] text-slate-500">Phê duyệt lệnh mua sắm</p>
              </div>
            </div>
          </div>

          {/* BỘ LỌC TÌM KIẾM & BẢNG ĐIỀU PHỐI ĐƠN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tiêu đề, người đề xuất..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value as any)}
                  className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-semibold"
                >
                  <option value="ALL">Tất Cả Danh Mục Yêu Cầu</option>
                  <option value="STATIONERY">Văn Phòng Phẩm (VPP)</option>
                  <option value="TRAVEL_FLIGHT">Vé Máy Bay &amp; Khách Sạn</option>
                  <option value="HEALTH_EXAM">Khám Sức Khỏe Định Kỳ</option>
                  <option value="PPE_UNIFORM">Đồng Phục &amp; Bảo Hộ Lao Động</option>
                  <option value="HSE_TRAINING">Huấn Luyện ATVSLĐ NĐ 44</option>
                  <option value="EVENT_BENEFIT">Sự Kiện &amp; Phúc Lợi</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-semibold"
                >
                  <option value="ALL">Tất Cả Trạng Thái</option>
                  <option value="PENDING">Đang Chờ Duyệt</option>
                  <option value="APPROVED">Đã Phê Duyệt</option>
                  <option value="IN_PROGRESS">Đang Triển Khai</option>
                  <option value="COMPLETED">Đã Hoàn Tất</option>
                  <option value="REJECTED">Đã Từ Chối</option>
                </select>
              </div>
            </div>

            {/* BẢNG DỮ LIỆU ĐƠN */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10.5px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5 text-center">Mã Đơn</th>
                    <th className="px-3 py-2.5">Danh Mục</th>
                    <th className="px-3 py-2.5">Người &amp; Phòng Ban</th>
                    <th className="px-3 py-2.5">Tiêu Đề &amp; Nội Dung Yêu Cầu</th>
                    <th className="px-3 py-2.5 text-right">Kinh Phí Dự Toán</th>
                    <th className="px-3 py-2.5 text-center">Thời Hạn</th>
                    <th className="px-3 py-2.5 text-center">Độ Khẩn</th>
                    <th className="px-3 py-2.5 text-center">Trạng Thái</th>
                    <th className="px-3 py-2.5 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequisitions.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 text-center font-mono text-[10px] text-indigo-700 font-bold">
                        {r.id}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {r.categoryLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{r.requesterName}</div>
                        <span className="text-[10px] text-slate-400">{r.department} ({r.requesterEmpId})</span>
                      </td>
                      <td className="px-3 py-2.5 max-w-[280px]">
                        <div className="font-semibold text-slate-800 line-clamp-1">{r.title}</div>
                        <p className="text-[10.5px] text-slate-500 line-clamp-1">{r.details}</p>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-700 whitespace-nowrap">
                        {r.estimatedCost.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-[10.5px] text-slate-500 whitespace-nowrap">
                        {r.deadline}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.urgency === 'URGENT' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                          r.urgency === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {r.urgency === 'URGENT' ? 'Hỏa tốc' : r.urgency === 'HIGH' ? 'Ưu tiên' : 'Thường'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          r.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          r.status === 'COMPLETED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          r.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {r.status === 'APPROVED' ? '✓ Đã duyệt mua' :
                           r.status === 'IN_PROGRESS' ? 'Đang mua sắm' :
                           r.status === 'COMPLETED' ? 'Đã hoàn tất' :
                           r.status === 'REJECTED' ? 'Bị từ chối' : 'Chờ phê duyệt'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => setSelectedReqForAction(r)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10.5px] font-bold border border-indigo-200 transition-colors cursor-pointer"
                            title="Xem chi tiết và phê duyệt"
                          >
                            Xử lý
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPrintReqModal(r)}
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="In tờ trình A4 ký số"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
          TAB 2: ĐỊNH MỨC QUOTA VPP & VẬT TƯ TIÊU HAO
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'STATIONERY_QUOTA' && (
        <div className="space-y-1.5">
          {/* BẢNG THEO DÕI QUOTA THEO PHÒNG BAN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Bảng Quota Định Mức Văn Phòng Phẩm Theo Đầu Người Từng Phòng Ban
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hạn mức cấp VPP hàng tháng tự động tính theo định biên nhân sự thực tế
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Chu kỳ: Tháng 09/2026
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {departmentQuotas.map(q => {
                const percent = Math.min(Math.round((q.spentThisMonth / q.monthlyBudget) * 100), 100);
                const isOver = q.spentThisMonth > q.monthlyBudget;
                return (
                  <div key={q.deptId} className={`p-3 rounded-xl border transition-all ${
                    isOver ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50/70 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[200px]" title={q.deptName}>
                        {q.deptName}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-black ${
                        isOver ? 'bg-rose-100 text-rose-700' : percent > 80 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {percent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span>Định biên: <b>{q.headcount} nhân sự</b></span>
                      <span>Định mức: <b>{q.quotaPerCapita.toLocaleString('vi-VN')} đ/người</b></span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-rose-600' : percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] mt-2 pt-1 border-t border-slate-200/60 font-mono">
                      <span className="text-slate-500">Đã dùng: <b className="text-slate-800">{q.spentThisMonth.toLocaleString('vi-VN')} đ</b></span>
                      <span className="text-slate-500">Hạn mức: <b className="text-indigo-700">{q.monthlyBudget.toLocaleString('vi-VN')} đ</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KHO ĐỆM VẬT TƯ TIÊU HAO THIẾT YẾU TẠI CHỖ */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Kho Đệm Vật Tư Tiêu Hao Thiết Yếu &amp; Đề Xuất Gom Đơn Ngày 25
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tồn kho an toàn tại kho hành chính. Tự động gom đơn định kỳ để hưởng chiết khấu đại lý 15-20%
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert('✓ ĐÃ KÍCH HOẠT THUẬT TOÁN GOM ĐƠN ĐỊNH KỲ NGÀY 25!\nHệ thống tự động tổng hợp toàn bộ các mặt hàng dưới tồn an toàn và tạo phiếu đề xuất mua hàng tổng gửi phòng Thu Mua.')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center space-x-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Gom Đơn Mua Hàng Loạt</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Mã Vật Tư</th>
                    <th className="px-3 py-2">Tên Vật Tư VPP Tiêu Hao</th>
                    <th className="px-3 py-2 text-center">ĐVT</th>
                    <th className="px-3 py-2 text-center">Tồn Hiện Tại</th>
                    <th className="px-3 py-2 text-center">Tồn Tối Thiểu</th>
                    <th className="px-3 py-2 text-right">Đơn Giá Tham Chiếu</th>
                    <th className="px-3 py-2">Nhà Cung Cấp</th>
                    <th className="px-3 py-2 text-center">Tình Trạng Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stationeryInventory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-indigo-700 font-bold">{item.code}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{item.name}</td>
                      <td className="px-3 py-2 text-center text-slate-500">{item.unit}</td>
                      <td className="px-3 py-2 text-center font-bold font-mono text-slate-800">{item.currentStock}</td>
                      <td className="px-3 py-2 text-center font-mono text-slate-400">{item.safetyStock}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">{item.unitPrice.toLocaleString('vi-VN')} đ</td>
                      <td className="px-3 py-2 text-slate-500 text-[11px]">{item.supplier}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'LOW_STOCK' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.status === 'LOW_STOCK' ? 'Cần bổ sung' : 'Đủ tồn kho'}
                        </span>
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
          TAB 3: VÉ MÁY BAY, KHÁCH SẠN & CÔNG TÁC PHÍ
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'BUSINESS_TRAVEL' && (
        <div className="space-y-1.5">
          {/* CHÍNH SÁCH ĐỊNH MỨC CÔNG TÁC DOANH NGHIỆP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-2 text-indigo-900 font-black text-xs">
                <Plane className="w-4 h-4 text-indigo-600" />
                <span>CẤP LÃNH ĐẠO (BAN TGĐ / GIÁM ĐỐC)</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1">
                <li>• <b>Vé bay:</b> Vietnam Airlines Phổ thông đặc biệt / Thương gia</li>
                <li>• <b>Khách sạn:</b> 4-5 sao (Hạn mức 1.800.000đ - 2.500.000đ/đêm)</li>
                <li>• <b>Phụ cấp lưu trú:</b> 500.000đ / ngày</li>
                <li>• <b>Đưa đón:</b> Xe đưa đón riêng của công ty hoặc Grab Car VIP</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-2 text-blue-900 font-black text-xs">
                <Hotel className="w-4 h-4 text-blue-600" />
                <span>CẤP QUẢN LÝ (TRƯỞNG / PHÓ PHÒNG)</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1">
                <li>• <b>Vé bay:</b> Hạng phổ thông linh hoạt (Economy Flex)</li>
                <li>• <b>Khách sạn:</b> 3-4 sao (Hạn mức 900.000đ - 1.200.000đ/đêm)</li>
                <li>• <b>Phụ cấp lưu trú:</b> 350.000đ / ngày</li>
                <li>• <b>Đi lại:</b> Grab for Business / Taxi Vinasun, Mai Linh</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-900 font-black text-xs">
                <Car className="w-4 h-4 text-slate-600" />
                <span>CẤP CHUYÊN VIÊN &amp; KỸ SƯ</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1">
                <li>• <b>Vé bay:</b> Hạng phổ thông tiết kiệm (Economy Promo)</li>
                <li>• <b>Khách sạn:</b> 2-3 sao (Hạn mức 550.000đ - 700.000đ/đêm)</li>
                <li>• <b>Phụ cấp lưu trú:</b> 250.000đ / ngày</li>
                <li>• <b>Đi lại:</b> Vé xe khách giường nằm cao cấp / Xe đưa đón xưởng</li>
              </ul>
            </div>
          </div>

          {/* BẢNG QUẢN LÝ BOOKING CÔNG TÁC THỜI GIAN THỰC */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Sổ Theo Dõi Lịch Trình Công Tác &amp; Đặt Vé Máy Bay / Khách Sạn
                </h3>
                <p className="text-[11px] text-slate-500">Mã PNR vé máy bay điện tử và chi phí quyết toán công tác</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Mã Booking</th>
                    <th className="px-3 py-2">Nhân Sự Đi Công Tác</th>
                    <th className="px-3 py-2">Lộ Trình &amp; Mục Đích</th>
                    <th className="px-3 py-2">Chặng Bay &amp; Khách Sạn</th>
                    <th className="px-3 py-2 text-center">Mã Vé (PNR)</th>
                    <th className="px-3 py-2 text-right">Tổng Chi Phí</th>
                    <th className="px-3 py-2 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {travelBookings.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-mono text-indigo-700 font-bold">{t.id}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{t.staffName}</div>
                        <span className="text-[10px] text-slate-400">{t.roleTitle} • {t.dept}</span>
                      </td>
                      <td className="px-3 py-2.5 max-w-[220px]">
                        <div className="font-semibold text-slate-800">{t.destination} ({t.dates})</div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{t.purpose}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-slate-900">{t.airline} ({t.flightCode})</div>
                        <span className="text-[10.5px] text-slate-500">{t.hotelName}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-800">
                        {t.pnrCode || 'Chờ đại lý xuất vé'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-700">
                        {t.totalCost.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === 'BOOKED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {t.status === 'BOOKED' ? 'Đã xuất vé & phòng' : 'Chờ phê duyệt'}
                        </span>
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
          TAB 4: KHÁM SỨC KHỎE ĐỊNH KỲ & BỆNH NGHỀ NGHIỆP
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'HEALTH_EXAMS' && (
        <div className="space-y-1.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Kế Hoạch Khám Sức Khỏe Định Kỳ &amp; Phát Hiện Bệnh Nghề Nghiệp (TT 14 &amp; 19/2016/TT-BYT)
                </h3>
                <p className="text-[11px] text-slate-500">Phân loại sức khỏe Loại I đến Loại V và theo dõi hồ sơ y tế người lao động</p>
              </div>
            </div>

            <div className="space-y-3">
              {healthExamBatches.map(b => (
                <div key={b.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">{b.batchName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {b.examHospital}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{b.packageTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Ngân sách gói khám:</span>
                      <span className="text-base font-black font-mono text-emerald-700">{b.totalBudget.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] text-emerald-800 font-bold block">Loại I (Rất Khỏe)</span>
                      <span className="font-mono font-black text-emerald-900 text-sm">{b.healthResults.type1VeryHealthy} người</span>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-center">
                      <span className="text-[10px] text-blue-800 font-bold block">Loại II (Khỏe)</span>
                      <span className="font-mono font-black text-blue-900 text-sm">{b.healthResults.type2Healthy} người</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                      <span className="text-[10px] text-amber-800 font-bold block">Loại III (Trung Bình)</span>
                      <span className="font-mono font-black text-amber-900 text-sm">{b.healthResults.type3Average} người</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-center">
                      <span className="text-[10px] text-rose-800 font-bold block">Loại IV (Cần Theo Dõi)</span>
                      <span className="font-mono font-black text-rose-900 text-sm">{b.healthResults.type4Weak} người</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-center">
                      <span className="text-[10px] text-purple-800 font-bold block">Tỷ Lệ Đã Khám</span>
                      <span className="font-mono font-black text-purple-900 text-sm">
                        {Math.round((b.headcountExamined / b.headcountRegistered) * 100)}%
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
          TAB 5: ĐỒNG PHỤC & BẢO HỘ LAO ĐỘNG (PPE)
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'PPE_UNIFORMS' && (
        <div className="space-y-1.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Sổ Cấp Phát Đồng Phục, Giày Mũi Thép &amp; Trang Bị Bảo Hộ Lao Động (PPE)
                </h3>
                <p className="text-[11px] text-slate-500">Chu kỳ khấu hao trang bị và lịch cấp phát bổ sung</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Mã Cấp</th>
                    <th className="px-3 py-2">Tên Trang Bị PPE &amp; Quy Cách</th>
                    <th className="px-3 py-2">Người Nhận &amp; Phòng Ban</th>
                    <th className="px-3 py-2 text-center">Kích Cỡ (Size)</th>
                    <th className="px-3 py-2 text-center">Số Lượng</th>
                    <th className="px-3 py-2 text-right">Đơn Giá</th>
                    <th className="px-3 py-2 text-center">Ngày Cấp</th>
                    <th className="px-3 py-2 text-center">Kỳ Cấp Kế Tiếp</th>
                    <th className="px-3 py-2 text-center">Tình Trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ppeAllocations.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-mono text-indigo-700 font-bold">{p.id}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{p.itemName}</div>
                        <span className="text-[10px] text-slate-500">{p.spec}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-slate-900">{p.recipientName}</div>
                        <span className="text-[10px] text-slate-400">{p.dept} ({p.recipientEmpId})</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-indigo-800">{p.size}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold">{p.quantity}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-800">{p.unitCost.toLocaleString('vi-VN')} đ</td>
                      <td className="px-3 py-2.5 text-center font-mono text-slate-500">{p.allocatedDate}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-emerald-700 font-bold">{p.nextRenewalDate}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đã cấp phát
                        </span>
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
          TAB 6: HUẤN LUYỆN ATVSLĐ & SỰ KIỆN DOANH NGHIỆP
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'HSE_TRAINING_EVENTS' && (
        <div className="space-y-1.5">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Kế Hoạch Huấn Luyện ATVSLĐ Theo 6 Nhóm Pháp Định (Nghị Định 44/2016/NĐ-CP)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Thời hạn chứng chỉ an toàn, số lượng học viên và cảnh báo hạn kiểm định sát hạch
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {hseTrainingBatches.map(tr => (
                <div key={tr.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">{tr.groupName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Hiệu lực: {tr.certificateValidityYears} năm
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Đối tượng: <b>{tr.targetRole}</b></p>
                      <p className="text-[10.5px] text-slate-500">Đơn vị đào tạo: {tr.trainingCenter} • Ngày tổ chức: {tr.trainingDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Kinh phí đào tạo:</span>
                      <span className="text-base font-black font-mono text-purple-700">{tr.estimatedBudget.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 1: TẠO YÊU CẦU HÀNH CHÍNH MỚI THÔNG MINH
      ════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-200" />
                <h3 className="font-black text-sm">Tạo Tờ Trình Đăng Ký Yêu Cầu Hành Chính Mới</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRequest} className="p-2 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Danh Mục Yêu Cầu:</label>
                  <select
                    value={newReqForm.category}
                    onChange={e => setNewReqForm({ ...newReqForm, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 bg-white"
                  >
                    <option value="STATIONERY">1. Mua Văn Phòng Phẩm (VPP)</option>
                    <option value="TRAVEL_FLIGHT">2. Đặt Vé Máy Bay &amp; Khách Sạn</option>
                    <option value="HEALTH_EXAM">3. Khám Sức Khỏe Định Kỳ</option>
                    <option value="PPE_UNIFORM">4. Đồng Phục &amp; Bảo Hộ Lao Động (PPE)</option>
                    <option value="HSE_TRAINING">5. Huấn Luyện ATVSLĐ NĐ 44</option>
                    <option value="EVENT_BENEFIT">6. Sự Kiện, Du Lịch &amp; Phúc Lợi</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Độ Ưu Tiên / Mức Khẩn Cấp:</label>
                  <select
                    value={newReqForm.urgency}
                    onChange={e => setNewReqForm({ ...newReqForm, urgency: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 bg-white"
                  >
                    <option value="NORMAL">Bình Thường (Xử lý theo SLA 48h)</option>
                    <option value="HIGH">Ưu Tiên Cao (Xử lý trong 24h)</option>
                    <option value="URGENT">Hỏa Tốc / Khẩn Cấp (Xử lý ngay &lt; 4h)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Người Đề Xuất (Nhân viên):</label>
                  <select
                    value={newReqForm.requesterName}
                    onChange={e => {
                      const emp = employees.find(x => x.fullName === e.target.value);
                      setNewReqForm({
                        ...newReqForm,
                        requesterName: e.target.value,
                        requesterEmpId: emp?.employeeCode || 'AV-NEW',
                        department: emp?.departmentName || 'Khối Văn Phòng'
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none text-slate-800 bg-white font-semibold"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.fullName}>
                        {emp.fullName} ({emp.employeeCode} - {emp.departmentName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phòng Ban / Bộ Phận:</label>
                  <input
                    type="text"
                    readOnly
                    value={newReqForm.department}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Tóm Tắt Đề Xuất:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Đăng ký cấp VPP tháng 9 cho phân xưởng đóng gói..."
                  value={newReqForm.title}
                  onChange={e => setNewReqForm({ ...newReqForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chi Tiết Quy Cách, Số Lượng &amp; Lý Do Sử Dụng:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi rõ chi tiết từng món đồ, quy cách kỹ thuật, nơi nhận và mục đích công việc..."
                  value={newReqForm.details}
                  onChange={e => setNewReqForm({ ...newReqForm, details: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dự Toán Kinh Phí (VNĐ):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={10000}
                    value={newReqForm.estimatedCost}
                    onChange={e => setNewReqForm({ ...newReqForm, estimatedCost: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hạn Hoàn Tất Mong Muốn:</label>
                  <input
                    type="date"
                    required
                    value={newReqForm.deadline}
                    onChange={e => setNewReqForm({ ...newReqForm, deadline: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Hệ thống sẽ tự động kiểm tra định mức Quota phòng ban và chuyển tiếp hồ sơ tới Trưởng bộ phận thẩm định.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Nộp Tờ Trình Phê Duyệt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 2: XỬ LÝ & PHÊ DUYỆT ĐƠN YÊU CẦU
      ════════════════════════════════════════════════════════════ */}
      {selectedReqForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm">Thẩm Định &amp; Phê Duyệt Đơn: {selectedReqForAction.id}</h3>
                  <span className="text-[10px] text-slate-400">{selectedReqForAction.categoryLabel}</span>
                </div>
              </div>
              <button onClick={() => setSelectedReqForAction(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <p><b>Người lập đơn:</b> {selectedReqForAction.requesterName} ({selectedReqForAction.requesterEmpId})</p>
                <p><b>Phòng ban:</b> {selectedReqForAction.department}</p>
                <p><b>Tiêu đề:</b> <span className="font-bold text-slate-900">{selectedReqForAction.title}</span></p>
                <p><b>Nội dung:</b> {selectedReqForAction.details}</p>
                <p><b>Dự toán kinh phí:</b> <span className="font-mono font-black text-emerald-700 text-sm">{selectedReqForAction.estimatedCost.toLocaleString('vi-VN')} đ</span></p>
                <p><b>Hạn cần xử lý:</b> <span className="font-mono">{selectedReqForAction.deadline}</span></p>
              </div>

              {/* Lịch sử thẩm định */}
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Lịch Sử Phê Duyệt Trước Đó:</span>
                <div className="space-y-1 border border-slate-200 p-2 rounded-xl bg-white max-h-28 overflow-y-auto">
                  {selectedReqForAction.approverHistory.map((h, i) => (
                    <div key={i} className="text-[10.5px] border-b border-slate-100 pb-1 last:border-b-0">
                      <span className="font-bold text-slate-800">{h.role} ({h.name})</span>: <span className="text-emerald-700 font-semibold">{h.action}</span> lúc {h.time}
                      {h.note && <p className="text-slate-500 italic">&ldquo;{h.note}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi Chú Phê Duyệt / Lý Do Từ Chối:</label>
                <textarea
                  rows={2}
                  placeholder="Nhập ý kiến thẩm định hoặc lý do từ chối để thông báo lại người đề xuất..."
                  value={approvalActionNote}
                  onChange={e => setApprovalActionNote(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRejectRequisition(selectedReqForAction.id)}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold cursor-pointer"
                >
                  Từ Chối Đơn
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReqForAction(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveRequisition(selectedReqForAction.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Phê Duyệt Đơn Này</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 3: IN TỜ TRÌNH YÊU CẦU HÀNH CHÍNH (A4 CHUẨN KÝ SỐ)
      ════════════════════════════════════════════════════════════ */}
      {showPrintReqModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[92vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Mẫu In Tờ Trình Đề Xuất Hành Chính &amp; Ký Duyệt Số (A4 Chuẩn)
                </h3>
              </div>
              <button onClick={() => setShowPrintReqModal(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 text-xs font-serif leading-relaxed text-slate-900 bg-white">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="text-left">
                  <p className="font-bold text-sm uppercase">{policy.companyName}</p>
                  <p className="font-bold text-xs uppercase text-slate-600">PHÒNG HÀNH CHÍNH - NHÂN SỰ &amp; TÀI CHÍNH</p>
                  <h2 className="text-base font-bold uppercase mt-1 text-indigo-900">
                    TỜ TRÌNH ĐỀ XUẤT HÀNH CHÍNH &amp; MUA SẮM
                  </h2>
                  <p className="text-[11px] italic text-slate-500">Mã đơn: {showPrintReqModal.id} • Ngày lập: {showPrintReqModal.createdAt}</p>
                </div>
                <div className="flex items-center space-x-2 border border-slate-300 p-2 rounded-lg bg-slate-50 shrink-0">
                  <QrCode className="w-9 h-9 text-slate-800" />
                  <div className="text-[9px] leading-tight text-slate-600 text-left">
                    <p className="font-bold text-slate-900 uppercase">XÁC THỰC KÝ SỐ</p>
                    <p className="font-mono">VERIFY-{showPrintReqModal.id}</p>
                    <p className="text-emerald-700 font-semibold">✓ Đã đối soát Quota</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <p><b>1. Kính gửi:</b> Ban Tổng Giám Đốc, Phòng HCNS, Phòng Kế Toán - Tài Chính.</p>
                <p><b>2. Đơn vị đề xuất:</b> {showPrintReqModal.department} • <b>Người đề xuất:</b> {showPrintReqModal.requesterName} (Mã: {showPrintReqModal.requesterEmpId})</p>
                <p><b>3. Danh mục:</b> {showPrintReqModal.categoryLabel}</p>
                <p><b>4. Tiêu đề đề xuất:</b> <b>{showPrintReqModal.title}</b></p>
                <p><b>5. Nội dung &amp; giải trình chi tiết:</b> {showPrintReqModal.details}</p>
                <p><b>6. Kinh phí dự toán:</b> <b className="text-indigo-900 font-mono text-sm">{showPrintReqModal.estimatedCost.toLocaleString('vi-VN')} VNĐ</b></p>
                <p><b>7. Thời hạn hoàn thành:</b> Ngày {showPrintReqModal.deadline}</p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center pt-6 mt-3 border-t text-[10.5px]">
                <div>
                  <p className="font-bold uppercase">Người Lập Đơn</p>
                  <p className="italic text-slate-400 mt-12">{showPrintReqModal.requesterName}</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Trưởng Bộ Phận</p>
                  <p className="italic text-slate-400 mt-12">(Đã duyệt)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Kế Toán Trưởng</p>
                  <p className="italic text-slate-400 mt-12">(Đối soát ngân sách)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Tổng Giám Đốc</p>
                  <p className="italic text-emerald-700 font-bold mt-12">✓ Đã Ký Điện Tử</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Mẫu in chuẩn hành chính doanh nghiệp lưu hồ sơ thanh toán</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintReqModal(null)}
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
                  <span>In Văn Bản Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
