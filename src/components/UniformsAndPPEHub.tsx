import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Shirt,
  ShieldCheck,
  Wrench,
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
  CheckCheck,
  FileSpreadsheet,
  BarChart3,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  Tag,
  Package,
  Layers,
  Laptop,
  HardHat,
  Glasses,
  Send,
  Boxes,
  RotateCcw,
  SlidersHorizontal,
  FileCheck2,
  Clock,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserX,
  Footprints
} from 'lucide-react';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';

interface UniformsAndPPEHubProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
}

// 6 PHÂN HỆ ĐỒNG PHỤC & CCDC
export type UniformSubCategory =
  | 'UNIFORM_INVENTORY'    // 1. Cấp Phát Đồng Phục Theo Size & Niên Khóa
  | 'PPE_SAFETY'          // 2. Trang Bị BHLĐ / PPE Theo TT 25/2013/TT-BLĐTBXH
  | 'TOOLS_EQUIPMENT'     // 3. Quản Lý Công Cụ Dụng Cụ (CCDC) Làm Việc
  | 'ISSUANCE_HANDOVER'   // 4. Phiếu Cấp Phát & Thu Hồi Bàn Giao Thôi Việc
  | 'SAFETY_STOCK_ALERT'  // 5. Quản Lý Tồn Kho An Toàn & Cảnh Báo AI Đặt Hàng
  | 'COST_ALLOCATION';    // 6. Báo Cáo Chi Phí, Hạch Toán Khấu Hao & Xuất Excel

// 1. Dữ Liệu Mặt Hàng Đồng Phục
export interface UniformItem {
  id: string;
  itemCode: string;       // VD: UNIF-SM-M
  itemName: string;
  category: 'OFFICE_SHIRT' | 'FACTORY_TSHIRT' | 'TROUSERS_SKIRT' | 'WINTER_JACKET';
  categoryLabel: string;
  targetAudience: 'VĂN PHÒNG' | 'CÔNG NHÂN' | 'TOÀN BỘ';
  unit: string;
  allocatedCycle: string; // VD: 2 cái / năm
  unitPrice: number;
  sizeStock: { [size: string]: number }; // S, M, L, XL, XXL, 3XL
  totalStock: number;
  totalAllocated: number;
  safetyStockMin: number; // Mức tồn an toàn tối thiểu
}

// 2. Dữ Liệu Trang Bị Bảo Hộ Lao Động (PPE)
export interface PPEItem {
  id: string;
  ppeCode: string;        // VD: PPE-SHOE-01
  name: string;
  category: 'SAFETY_SHOES' | 'HARD_HAT' | 'SAFETY_GLASSES' | 'GLOVES' | 'RESPIRATOR' | 'SAFETY_HARNESS';
  categoryLabel: string;
  standardCompliance: string; // VD: EN ISO 20345 / QCVN 06:2020 / TCVN 6407
  assignedPositions: string;  // Thợ cơ điện, công nhân chế biến, kho vận
  unit: string;
  stockQty: number;
  allocatedQty: number;
  unitPrice: number;
  replacementCycleMonths: number;
  hasPeriodicInspection?: boolean; // Cần kiểm định định kỳ (đai an toàn, nón cách điện)
  inspectionExpiry?: string;
  safetyStatus: 'COMPLIANT' | 'LOW_STOCK' | 'INSPECTION_DUE';
}

// 3. Dữ Liệu Công Cụ Dụng Cụ (CCDC)
export interface ToolEquipmentItem {
  id: string;
  toolCode: string;       // VD: CCDC-LAP-042
  toolName: string;
  category: 'LAPTOP_PC' | 'COMMUNICATION' | 'ELECTRIC_TOOLS' | 'MEASUREMENT' | 'OFFICE_TOOL';
  categoryLabel: string;
  serialNumber: string;
  assignedEmployee: string;
  department: string;
  assignedDate: string;
  originalCost: number;
  amortizationMonths: number; // Thời gian phân bổ khấu hao (12, 24, 36 tháng)
  remainingValue: number;
  conditionStatus: 'GOOD' | 'NEEDS_MAINTENANCE' | 'DISPOSAL_PROPOSED';
}

// 4. Phiếu Cấp Phát / Bàn Giao
export interface IssuanceHandoverRecord {
  id: string;
  recordCode: string;     // VD: CP-2026-081
  recordType: 'NEW_ISSUANCE' | 'REPLACEMENT_DAMAGED' | 'OFFBOARDING_RETURN';
  employeeName: string;
  department: string;
  date: string;
  itemsList: Array<{ itemName: string; sizeOrSpec: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
  reason: string;
  approvedBy: string;
  receiverSignatureStatus: 'SIGNED' | 'PENDING';
  handoverConditionNote?: string;
}

// 5. Checklist Thu Hồi Thôi Việc
export interface OffboardingClearanceItem {
  id: string;
  empId: string;
  employeeName: string;
  department: string;
  lastWorkingDay: string;
  uniformReturned: boolean;
  ppeReturned: boolean;
  laptopToolsReturned: boolean;
  accessCardReturned: boolean;
  lockerKeyReturned: boolean;
  clearanceStatus: 'CLEARED' | 'PENDING_RETURN' | 'COMPENSATION_REQUIRED';
  compensationAmount?: number;
  notes: string;
}

export const UniformsAndPPEHub: React.FC<UniformsAndPPEHubProps> = ({
  policy,
  employees,
  currentRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<UniformSubCategory>('UNIFORM_INVENTORY');

  // ==========================================================
  // 1. DỮ LIỆU ĐỒNG PHỤC DOANH NGHIỆP
  // ==========================================================
  const [uniforms, setUniforms] = useState<UniformItem[]>([
    {
      id: 'UNIF-01',
      itemCode: 'UNIF-SM-OFFICE',
      itemName: 'Áo Sơ Mi Trắng Đồng Phục Khối Văn Phòng (Chất Vải Kate Silk Cao Cấp)',
      category: 'OFFICE_SHIRT',
      categoryLabel: 'Áo Sơ Mi Văn Phòng',
      targetAudience: 'VĂN PHÒNG',
      unit: 'Cái',
      allocatedCycle: 'Cấp 2 cái / năm',
      unitPrice: 220000,
      sizeStock: { S: 15, M: 28, L: 8, XL: 22, XXL: 12 },
      totalStock: 85,
      totalAllocated: 320,
      safetyStockMin: 30
    },
    {
      id: 'UNIF-02',
      itemCode: 'UNIF-TS-FACTORY',
      itemName: 'Áo Thun Polo Cổ Trụ Công Nhân Sản Xuất (100% Cotton Co Giãn Kháng Khuẩn)',
      category: 'FACTORY_TSHIRT',
      categoryLabel: 'Áo Thun Công Nhân',
      targetAudience: 'CÔNG NHÂN',
      unit: 'Cái',
      allocatedCycle: 'Cấp 3 cái / năm',
      unitPrice: 140000,
      sizeStock: { S: 30, M: 65, L: 85, XL: 42, XXL: 18 },
      totalStock: 240,
      totalAllocated: 1250,
      safetyStockMin: 50
    },
    {
      id: 'UNIF-03',
      itemCode: 'UNIF-PANTS-WORK',
      itemName: 'Quần Tây / Quần Kaki Công Sở Co Giãn Form Chuẩn',
      category: 'TROUSERS_SKIRT',
      categoryLabel: 'Quần Tây / Váy',
      targetAudience: 'VĂN PHÒNG',
      unit: 'Cái',
      allocatedCycle: 'Cấp 1 cái / năm',
      unitPrice: 260000,
      sizeStock: { S: 10, M: 20, L: 14, XL: 8, XXL: 6 },
      totalStock: 58,
      totalAllocated: 180,
      safetyStockMin: 20
    },
    {
      id: 'UNIF-04',
      itemCode: 'UNIF-JACKET-WINTER',
      itemName: 'Áo Khoác Gió Đồng Phục 2 Lớp Chống Thấm Nước & Giữ Ấm',
      category: 'WINTER_JACKET',
      categoryLabel: 'Áo Khoác Gió',
      targetAudience: 'TOÀN BỘ',
      unit: 'Cái',
      allocatedCycle: 'Cấp 1 cái / 2 năm',
      unitPrice: 310000,
      sizeStock: { S: 20, M: 45, L: 35, XL: 25, XXL: 15 },
      totalStock: 140,
      totalAllocated: 450,
      safetyStockMin: 40
    }
  ]);

  // ==========================================================
  // 2. DỮ LIỆU TRANG BỊ BẢO HỘ LAO ĐỘNG (BHLĐ / PPE)
  // ==========================================================
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([
    {
      id: 'PPE-01',
      ppeCode: 'PPE-SHOE-JOGGER',
      name: 'Giày Bảo Hộ Lao Động Safety Jogger Bestrun S3 Mũi Thép Chống Đinh / Chống Dập',
      category: 'SAFETY_SHOES',
      categoryLabel: 'Giày Mũi Thép Chống Đinh',
      standardCompliance: 'Tiêu chuẩn Châu Âu EN ISO 20345 / S3 & TCVN 7652',
      assignedPositions: 'Toàn bộ công nhân phân xưởng sản xuất, kho bãi & kỹ thuật',
      unit: 'Đôi',
      stockQty: 45,
      allocatedQty: 480,
      unitPrice: 420000,
      replacementCycleMonths: 12,
      safetyStatus: 'COMPLIANT'
    },
    {
      id: 'PPE-02',
      ppeCode: 'PPE-HELMET-BLUE',
      name: 'Nón Bảo Hộ Lao Động Thùy Dương Có Núm Vặn Điều Chỉnh Kèm Quai Cài Chống Rơi',
      category: 'HARD_HAT',
      categoryLabel: 'Nón Bảo Hộ Cách Điện',
      standardCompliance: 'TCVN 6407:1998 (Cách điện đến 2.200V)',
      assignedPositions: 'Kỹ sư cơ điện, công nhân bảo trì & bộ phận kho vận',
      unit: 'Cái',
      stockQty: 110,
      allocatedQty: 350,
      unitPrice: 85000,
      replacementCycleMonths: 24,
      safetyStatus: 'COMPLIANT'
    },
    {
      id: 'PPE-03',
      ppeCode: 'PPE-GLASSES-3M',
      name: 'Kính Bảo Hộ Chống Hóa Chất & Tia UV 3M 1621AF Phủ Lớp Chống Đọng Sương',
      category: 'SAFETY_GLASSES',
      categoryLabel: 'Kính Bảo Hộ Hóa Chất',
      standardCompliance: 'ANSI Z87.1-2015 & TCVN 5083',
      assignedPositions: 'Nhân viên pha chế hóa chất, phòng vi sinh QA/QC & thợ hàn',
      unit: 'Cái',
      stockQty: 75,
      allocatedQty: 180,
      unitPrice: 95000,
      replacementCycleMonths: 6,
      safetyStatus: 'COMPLIANT'
    },
    {
      id: 'PPE-04',
      ppeCode: 'PPE-GLOVE-CUT5',
      name: 'Găng Tay Sợi Kevlar Phủ PU Chống Cắt Cấp Độ 5 (Cut Level 5)',
      category: 'GLOVES',
      categoryLabel: 'Găng Tay Chống Cắt Cấp 5',
      standardCompliance: 'EN 388:2016 (4X43D)',
      assignedPositions: 'Công nhân thao tác máy cắt bao bì, dao phi lê & đóng pallet',
      unit: 'Đôi',
      stockQty: 12,
      allocatedQty: 240,
      unitPrice: 65000,
      replacementCycleMonths: 3,
      safetyStatus: 'LOW_STOCK' // Báo động còn 12 đôi
    },
    {
      id: 'PPE-05',
      ppeCode: 'PPE-HARNESS-2HOOK',
      name: 'Dây Đai An Toàn Toàn Thân 2 Móc Lớn Có Giảm Chấn Chống Rơi Ngã Trên Cao',
      category: 'SAFETY_HARNESS',
      categoryLabel: 'Đai An Toàn Chống Rơi Ngã',
      standardCompliance: 'TCVN 7887:2008 & CE EN 361',
      assignedPositions: 'Tổ cơ điện bảo trì mái tôn, vệ sinh máng xối & thợ điện trạm biến áp',
      unit: 'Bộ',
      stockQty: 8,
      allocatedQty: 15,
      unitPrice: 650000,
      replacementCycleMonths: 24,
      hasPeriodicInspection: true,
      inspectionExpiry: '2026-11-20', // Còn 66 ngày
      safetyStatus: 'COMPLIANT'
    }
  ]);

  // ==========================================================
  // 3. DỮ LIỆU CÔNG CỤ DỤNG CỤ (CCDC) & THIẾT BỊ LÀM VIỆC
  // ==========================================================
  const [tools, setTools] = useState<ToolEquipmentItem[]>([
    {
      id: 'TOOL-01',
      toolCode: 'CCDC-LAP-042',
      toolName: 'Máy Tính Xách Tay Laptop Dell Latitude 5430 (Core i5/16GB/512GB SSD)',
      category: 'LAPTOP_PC',
      categoryLabel: 'Máy Tính Xách Tay',
      serialNumber: 'DELL-LAT-5430-VN8921',
      assignedEmployee: 'Trần Thị Thu Thảo',
      department: 'Phòng Phát Triển Thị Trường',
      assignedDate: '2024-03-15',
      originalCost: 21500000,
      amortizationMonths: 36,
      remainingValue: 13800000,
      conditionStatus: 'GOOD'
    },
    {
      id: 'TOOL-02',
      toolCode: 'CCDC-RADIO-01',
      toolName: 'Bộ Đàm Cầm Tay Chống Cháy Nổ Motorola CP-1300 (Dải Tần UHF)',
      category: 'COMMUNICATION',
      categoryLabel: 'Bộ Đàm Liên Lạc',
      serialNumber: 'MOT-CP1300-44918',
      assignedEmployee: 'Bảo Vệ Chốt 1 (Nguyễn Văn Hùng)',
      department: 'Đội Bảo Vệ & An Ninh',
      assignedDate: '2023-08-10',
      originalCost: 3800000,
      amortizationMonths: 24,
      remainingValue: 950000,
      conditionStatus: 'GOOD'
    },
    {
      id: 'TOOL-03',
      toolCode: 'CCDC-METER-FLUKE',
      toolName: 'Đồng Hồ Đo Vạn Năng Điện Tử Kỹ Thuật Số Fluke 179 True-RMS',
      category: 'MEASUREMENT',
      categoryLabel: 'Thiết Bị Đo Kiểm Điện',
      serialNumber: 'FLUKE-179-USA-992',
      assignedEmployee: 'Nguyễn Hữu Nam',
      department: 'Phòng Cơ Điện (MEP)',
      assignedDate: '2023-11-20',
      originalCost: 7200000,
      amortizationMonths: 36,
      remainingValue: 3600000,
      conditionStatus: 'GOOD'
    },
    {
      id: 'TOOL-04',
      toolCode: 'CCDC-DRILL-BOSCH',
      toolName: 'Máy Khoan Búa Dùng Pin Bosch GSB 18V-50 Không Chổi Than Kèm 2 Pin 5.0Ah',
      category: 'ELECTRIC_TOOLS',
      categoryLabel: 'Máy Khoan & Dụng Cụ Cầm Tay',
      serialNumber: 'BOSCH-GSB-18V-GER',
      assignedEmployee: 'Đỗ Văn Thắng',
      department: 'Phòng Cơ Điện (MEP)',
      assignedDate: '2024-01-10',
      originalCost: 4850000,
      amortizationMonths: 24,
      remainingValue: 3200000,
      conditionStatus: 'GOOD'
    }
  ]);

  // ==========================================================
  // 4. DỮ LIỆU PHIẾU CẤP PHÁT & CHECKLIST THÔI VIỆC
  // ==========================================================
  const [issuanceRecords, setIssuanceRecords] = useState<IssuanceHandoverRecord[]>([
    {
      id: 'REC-01',
      recordCode: 'CP-2026-081',
      recordType: 'NEW_ISSUANCE',
      employeeName: 'Lê Hoàng Nam',
      department: 'Phòng Đảm Bảo Chất Lượng (QA/QC)',
      date: '10/09/2026',
      itemsList: [
        { itemName: 'Áo sơ mi đồng phục văn phòng', sizeOrSpec: 'Size L', quantity: 2, unitPrice: 220000 },
        { itemName: 'Giày bảo hộ Safety Jogger', sizeOrSpec: 'Size 42', quantity: 1, unitPrice: 420000 },
        { itemName: 'Kính bảo hộ 3M chống đọng sương', sizeOrSpec: 'Trong suốt', quantity: 1, unitPrice: 95000 }
      ],
      totalAmount: 955000,
      reason: 'Cấp phát định kỳ niên khóa 2026 sau khi ký HĐLĐ chính thức',
      approvedBy: 'Trần Việt Hùng (GĐ Hành Chính)',
      receiverSignatureStatus: 'SIGNED'
    },
    {
      id: 'REC-02',
      recordCode: 'CP-2026-082',
      recordType: 'REPLACEMENT_DAMAGED',
      employeeName: 'Phạm Hồng Thái',
      department: 'Phòng Kỹ Thuật HSE',
      date: '12/09/2026',
      itemsList: [
        { itemName: 'Găng tay sợi Kevlar chống cắt cấp 5', sizeOrSpec: 'Size L', quantity: 2, unitPrice: 65000 }
      ],
      totalAmount: 130000,
      reason: 'Cấp đổi do găng tay cũ bị rách mòn sau đợt bảo trì máy cắt',
      approvedBy: 'Trần Việt Hùng (GĐ Hành Chính)',
      receiverSignatureStatus: 'SIGNED'
    }
  ]);

  // Checklist thôi việc bàn giao tài sản
  const [offboardingChecklists, setOffboardingChecklists] = useState<OffboardingClearanceItem[]>([
    {
      id: 'OFF-01',
      empId: 'NV-2024-089',
      employeeName: 'Nguyễn Văn Tuấn',
      department: 'Phân Xưởng Đóng Gói',
      lastWorkingDay: '15/09/2026',
      uniformReturned: true,
      ppeReturned: true,
      laptopToolsReturned: true,
      accessCardReturned: true,
      lockerKeyReturned: true,
      clearanceStatus: 'CLEARED',
      notes: 'Đã hoàn trả đủ 2 áo thun, 1 giày bảo hộ, thẻ từ quẹt cửa và chìa khóa tủ đồ cá nhân.'
    },
    {
      id: 'OFF-02',
      empId: 'NV-2023-042',
      employeeName: 'Đặng Minh Quân',
      department: 'Phòng Phát Triển Thị Trường',
      lastWorkingDay: '20/09/2026',
      uniformReturned: true,
      ppeReturned: true,
      laptopToolsReturned: false, // Chưa trả laptop
      accessCardReturned: true,
      lockerKeyReturned: true,
      clearanceStatus: 'PENDING_RETURN',
      notes: 'Đang sao lưu dữ liệu cá nhân, hẹn ngày 19/09 bàn giao laptop Dell và sạc cho IT.'
    }
  ]);

  // ==========================================================
  // STATE MODALS
  // ==========================================================
  const [showCreateIssuanceModal, setShowCreateIssuanceModal] = useState(false);
  const [newIssuanceForm, setNewIssuanceForm] = useState({
    employeeName: employees[0]?.fullName || 'Lê Hoàng Nam',
    department: employees[0]?.departmentName || 'Phòng Đảm Bảo Chất Lượng',
    itemName: 'Áo Sơ Mi Trắng Đồng Phục Khối Văn Phòng',
    size: 'L',
    quantity: 2,
    reason: 'Cấp phát định kỳ niên khóa 2026'
  });

  // Modal in Biên Bản Cấp Phát / Bàn Giao CCDC A4
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<IssuanceHandoverRecord | null>(null);

  // Modal Đăng ký Size Đồng Phục
  const [showSizeRegisterModal, setShowSizeRegisterModal] = useState(false);

  // ==========================================================
  // KPI THỐNG KÊ THỜI GIAN THỰC
  // ==========================================================
  const kpiStats = useMemo(() => {
    // Tổng giá trị tồn kho
    const uniformStockVal = uniforms.reduce((sum, u) => sum + u.totalStock * u.unitPrice, 0);
    const ppeStockVal = ppeItems.reduce((sum, p) => sum + p.stockQty * p.unitPrice, 0);
    const totalInventoryValue = uniformStockVal + ppeStockVal;

    // Mặt hàng dưới tồn kho an toàn
    const lowStockCount = ppeItems.filter(p => p.safetyStatus === 'LOW_STOCK').length + 
      uniforms.filter(u => u.totalStock <= u.safetyStockMin).length;

    // Tổng CCDC đang phân bổ
    const totalToolsAllocated = tools.length;
    const totalToolsValue = tools.reduce((sum, t) => sum + t.remainingValue, 0);

    return {
      totalInventoryValue,
      lowStockCount,
      totalToolsAllocated,
      totalToolsValue,
      totalAllocatedUniforms: uniforms.reduce((sum, u) => sum + u.totalAllocated, 0),
      totalAllocatedPPE: ppeItems.reduce((sum, p) => sum + p.allocatedQty, 0)
    };
  }, [uniforms, ppeItems, tools]);

  // Xử lý tạo phiếu cấp phát mới
  const handleCreateIssuance = (e: React.FormEvent) => {
    e.preventDefault();

    const newRec: IssuanceHandoverRecord = {
      id: `REC-${Date.now()}`,
      recordCode: `CP-2026-0${83 + issuanceRecords.length}`,
      recordType: 'NEW_ISSUANCE',
      employeeName: newIssuanceForm.employeeName,
      department: newIssuanceForm.department,
      date: new Date().toLocaleDateString('vi-VN'),
      itemsList: [
        {
          itemName: newIssuanceForm.itemName,
          sizeOrSpec: `Size ${newIssuanceForm.size}`,
          quantity: Number(newIssuanceForm.quantity) || 1,
          unitPrice: 220000
        }
      ],
      totalAmount: (Number(newIssuanceForm.quantity) || 1) * 220000,
      reason: newIssuanceForm.reason.trim() || 'Cấp phát đồng phục / BHLĐ bổ sung',
      approvedBy: 'Trần Việt Hùng (GĐ Hành Chính)',
      receiverSignatureStatus: 'SIGNED'
    };

    setIssuanceRecords([newRec, ...issuanceRecords]);
    setShowCreateIssuanceModal(false);
    alert(`✓ ĐÃ TẠO PHIẾU CẤP PHÁT THÀNH CÔNG!\nMã chứng từ: ${newRec.recordCode}. Bạn có thể bấm nút In Biên Bản A4 để lưu hồ sơ ký nhận.`);
  };

  // Xuất file Excel 5 Sheet tổng hợp
  const handleExportUniformExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Đồng phục theo size
    const ws1Data = uniforms.map(u => ({
      'Mã Mặt Hàng': u.itemCode,
      'Tên Trang Phục': u.itemName,
      'Đối Tượng': u.targetAudience,
      'Định Mức': u.allocatedCycle,
      'Đơn Giá (VNĐ)': u.unitPrice,
      'Size S': u.sizeStock.S || 0,
      'Size M': u.sizeStock.M || 0,
      'Size L': u.sizeStock.L || 0,
      'Size XL': u.sizeStock.XL || 0,
      'Size XXL': u.sizeStock.XXL || 0,
      'Tổng Tồn Kho': u.totalStock,
      'Đã Cấp Phát': u.totalAllocated
    }));
    const ws1 = XLSX.utils.json_to_sheet(ws1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Dong_Phuc_Theo_Size');

    // Sheet 2: Danh mục BHLĐ PPE
    const ws2Data = ppeItems.map(p => ({
      'Mã PPE': p.ppeCode,
      'Tên Phương Tiện BHLĐ': p.name,
      'Tiêu Chuẩn QCVN/TCVN': p.standardCompliance,
      'Vị Trí Trang Bị': p.assignedPositions,
      'ĐVT': p.unit,
      'Tồn Kho': p.stockQty,
      'Đã Cấp': p.allocatedQty,
      'Đơn Giá (VNĐ)': p.unitPrice,
      'Chu Kỳ Đổi': `${p.replacementCycleMonths} tháng`,
      'Hạn Kiểm Định': p.inspectionExpiry || 'Không áp dụng'
    }));
    const ws2 = XLSX.utils.json_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Trang_Bi_BHLD_PPE');

    // Sheet 3: Quản lý CCDC
    const ws3Data = tools.map(t => ({
      'Mã CCDC': t.toolCode,
      'Tên Dụng Cụ / Thiết Bị': t.toolName,
      'Số Serial': t.serialNumber,
      'Người Bàn Giao': t.assignedEmployee,
      'Phòng Ban': t.department,
      'Ngày Giao': t.assignedDate,
      'Nguyên Giá': t.originalCost,
      'Giá Trị Còn Lại': t.remainingValue,
      'Tình Trạng': t.conditionStatus
    }));
    const ws3 = XLSX.utils.json_to_sheet(ws3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'Cong_Cu_Dung_Cu_CCDC');

    // Sheet 4: Sổ cấp phát
    const ws4Data = issuanceRecords.map(r => ({
      'Mã Phiếu': r.recordCode,
      'Loại': r.recordType,
      'Người Nhận': r.employeeName,
      'Phòng Ban': r.department,
      'Ngày Cấp': r.date,
      'Mặt Hàng': r.itemsList.map(i => `${i.itemName} (${i.sizeOrSpec}) x${i.quantity}`).join('; '),
      'Tổng Tiền': r.totalAmount,
      'Lý Do': r.reason
    }));
    const ws4 = XLSX.utils.json_to_sheet(ws4Data);
    XLSX.utils.book_append_sheet(wb, ws4, 'So_Cap_Phat_Dong_Phuc');

    // Sheet 5: Checklist thôi việc
    const ws5Data = offboardingChecklists.map(o => ({
      'Mã NV': o.empId,
      'Họ Tên': o.employeeName,
      'Phòng Ban': o.department,
      'Ngày Nghỉ Việc': o.lastWorkingDay,
      'Trả Đồng Phục': o.uniformReturned ? 'Đã trả' : 'Chưa trả',
      'Trả BHLĐ': o.ppeReturned ? 'Đã trả' : 'Chưa trả',
      'Trả Laptop/CCDC': o.laptopToolsReturned ? 'Đã trả' : 'Chưa trả',
      'Trả Thẻ Từ/Khóa': (o.accessCardReturned && o.lockerKeyReturned) ? 'Đã trả' : 'Chưa trả',
      'Trạng Thái Hoàn Tất': o.clearanceStatus
    }));
    const ws5 = XLSX.utils.json_to_sheet(ws5Data);
    XLSX.utils.book_append_sheet(wb, ws5, 'Thu_Hoi_Thoi_Viec');

    XLSX.writeFile(wb, `Bao_Cao_Dong_Phuc_BHLD_CCDC_${policy.companyName.replace(/\s+/g, '_')}_09_2026.xlsx`);
  };

  return (
    <div className="space-y-1.5">
      {/* ════════════════════════════════════════════════════════════
          KHỐI 1: HEADER & KPI CARDS ĐỒNG PHỤC, BHLĐ & CCDC 360°
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 text-slate-800 rounded-2xl p-2 shadow-sm border border-indigo-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-200 pb-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                    Trung Tâm Quản Trị Cấp Phát Đồng Phục, BHLĐ &amp; Công Cụ Dụng Cụ (PPE Hub)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-400 text-slate-950">
                    Chuẩn TT 25/2013/TT-BLĐTBXH
                  </span>
                </div>
                <p className="text-[11.5px] text-indigo-800/80 font-medium">
                  Ma trận size đồng phục, trang bị bảo hộ cá nhân đạt chuẩn QCVN, quản lý CCDC và thu hồi bàn giao thôi việc
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportUniformExcel}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center space-x-1.5 border border-white/15 cursor-pointer shadow-xs active:scale-95"
              title="Xuất toàn bộ sổ đồng phục & CCDC ra Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Báo Cáo Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateIssuanceModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black transition-all flex items-center space-x-1.5 shadow-md hover:shadow-indigo-500/25 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Cấp Phát Đồng Phục / CCDC</span>
            </button>
          </div>
        </div>

        {/* 4 KPI THỐNG KÊ THỜI GIAN THỰC */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Giá Trị Tồn Kho</span>
              <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                {(kpiStats.totalInventoryValue / 1000000).toFixed(1)} <span className="text-xs font-normal text-slate-300">triệu đ</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">Đồng phục + Giày + BHLĐ</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Suất BHLĐ Đang Sử Dụng</span>
              <div className="text-xl font-black font-mono text-indigo-300 mt-0.5">
                {kpiStats.totalAllocatedPPE} <span className="text-xs font-normal text-slate-300">trang bị</span>
              </div>
              <span className="text-[10px] text-slate-300">100% đạt chuẩn an toàn TT 25</span>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cảnh Báo Tồn Kho An Toàn</span>
              <div className="text-xl font-black font-mono text-amber-300 mt-0.5">
                {kpiStats.lowStockCount} <span className="text-xs font-normal text-slate-300">mặt hàng</span>
              </div>
              <span className="text-[10px] text-rose-300 font-semibold">Găng tay chống cắt cần nhập</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Giá Trị CCDC Đang Cấp</span>
              <div className="text-xl font-black font-mono text-purple-300 mt-0.5">
                {(kpiStats.totalToolsValue / 1000000).toFixed(1)} <span className="text-xs font-normal text-slate-300">triệu đ</span>
              </div>
              <span className="text-[10px] text-purple-300 font-semibold">{kpiStats.totalToolsAllocated} thiết bị (Laptop, bộ đàm)</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Wrench className="w-4 h-4" />
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
            onClick={() => setActiveSubTab('UNIFORM_INVENTORY')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'UNIFORM_INVENTORY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shirt className="w-3.5 h-3.5 text-amber-300" />
            <span>1. Đồng Phục Theo Size &amp; Niên Khóa ({uniforms.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('PPE_SAFETY')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'PPE_SAFETY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Trang Bị BHLĐ / PPE (TT 25) ({ppeItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('TOOLS_EQUIPMENT')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'TOOLS_EQUIPMENT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Công Cụ Dụng Cụ (CCDC) Làm Việc ({tools.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ISSUANCE_HANDOVER')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'ISSUANCE_HANDOVER'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>4. Cấp Phát &amp; Thu Hồi Thôi Việc ({issuanceRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('SAFETY_STOCK_ALERT')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'SAFETY_STOCK_ALERT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>5. Tồn Kho An Toàn &amp; Cảnh Báo AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('COST_ALLOCATION')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'COST_ALLOCATION'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
            <span>6. Chi Phí &amp; Phân Bổ Phòng Ban</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: CẤP PHÁT ĐỒNG PHỤC THEO SIZE & NIÊN KHÓA
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'UNIFORM_INVENTORY' && (
        <div className="space-y-1.5 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Shirt className="w-4 h-4 text-indigo-600" />
                  <span>Ma Trận Kích Cỡ &amp; Tồn Kho Đồng Phục Niên Khóa 2026 (Size Matrix)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Quản lý tồn kho theo Size S, M, L, XL, XXL và định mức cấp phát thường niên cho văn phòng &amp; nhà máy
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSizeRegisterModal(true)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 cursor-pointer flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Xem Bảng Size Cán Bộ Nhân Viên</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Tên Loại Trang Phục</th>
                    <th className="px-3 py-2 text-center">Đối Tượng</th>
                    <th className="px-3 py-2 text-center">Định Mức Cấp</th>
                    <th className="px-3 py-2 text-center text-blue-700">Size S</th>
                    <th className="px-3 py-2 text-center text-blue-700">Size M</th>
                    <th className="px-3 py-2 text-center text-blue-700">Size L</th>
                    <th className="px-3 py-2 text-center text-blue-700">Size XL</th>
                    <th className="px-3 py-2 text-center text-blue-700">Size XXL</th>
                    <th className="px-3 py-2 text-center text-emerald-700 font-bold">Tổng Tồn Kho</th>
                    <th className="px-3 py-2 text-center text-indigo-700 font-bold">Đã Cấp Phát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uniforms.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 max-w-[240px]">
                        <div className="font-bold text-slate-900">{item.itemName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">Đơn giá: {item.unitPrice.toLocaleString('vi-VN')} đ/{item.unit}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.targetAudience}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center text-[11px] font-medium text-slate-600">{item.allocatedCycle}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">{item.sizeStock.S || 0}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">{item.sizeStock.M || 0}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">
                        <span className={item.sizeStock.L <= 10 ? 'text-rose-600 font-black' : ''}>{item.sizeStock.L || 0}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">{item.sizeStock.XL || 0}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">{item.sizeStock.XXL || 0}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-black text-emerald-700 text-sm">
                        {item.totalStock} {item.unit}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-black text-indigo-700 text-sm">
                        {item.totalAllocated} {item.unit}
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
          TAB 2: TRANG BỊ BHLĐ / PPE THEO TT 25/2013/TT-BLĐTBXH
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'PPE_SAFETY' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* BANNER PHÁP LÝ THÔNG TƯ 25 */}
          <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-black text-indigo-950 uppercase">
                  Căn Cứ Pháp Lý: Thông Tư 25/2013/TT-BLĐTBXH Về Trang Bị Phương Tiện Bảo Vệ Cá Nhân
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9.5px] font-black bg-emerald-100 text-emerald-800">
                  Đạt Chuẩn ATLĐ 100%
                </span>
              </div>
              <p className="text-xs text-indigo-800 leading-snug">
                Bắt buộc trang cấp đầy đủ phương tiện bảo vệ cá nhân đạt tiêu chuẩn QCVN/TCVN cho người lao động làm việc trong điều kiện có yếu tố nguy hiểm, độc hại.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ppeItems.map(ppe => (
              <div key={ppe.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {ppe.ppeCode}
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs mt-1 leading-snug">{ppe.name}</h5>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">✓ {ppe.standardCompliance}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black border shrink-0 ${
                    ppe.safetyStatus === 'LOW_STOCK' ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {ppe.safetyStatus === 'LOW_STOCK' ? 'Cần Nhập Thêm' : 'Tồn Kho Đạt'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-[11px] text-slate-600">
                    Đối tượng cấp: <b className="text-slate-800">{ppe.assignedPositions}</b>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Chu kỳ thay thế: <b>{ppe.replacementCycleMonths} tháng / lần</b></span>
                    <span className="text-slate-500">Đơn giá: <b className="font-mono text-slate-900">{ppe.unitPrice.toLocaleString('vi-VN')} đ</b></span>
                  </div>
                  {ppe.inspectionExpiry && (
                    <div className="text-[10.5px] text-purple-700 font-bold pt-0.5 border-t border-slate-200">
                      Tem kiểm định định kỳ đến ngày: {ppe.inspectionExpiry}
                    </div>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Tồn kho sẵn sàng: <b className="text-emerald-700 font-mono text-sm">{ppe.stockQty}</b> {ppe.unit}</span>
                  <span className="text-[11px] text-slate-500">Đã cấp phát: <b className="text-indigo-700 font-mono text-sm">{ppe.allocatedQty}</b> {ppe.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 3: CÔNG CỤ DỤNG CỤ (CCDC) & THIẾT BỊ LÀM VIỆC
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'TOOLS_EQUIPMENT' && (
        <div className="space-y-1.5 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  <span>Sổ Quản Lý Bàn Giao Công Cụ Dụng Cụ (CCDC) &amp; Thiết Bị Làm Việc</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mã CCDC, Serial Number, người chịu trách nhiệm, phân bổ khấu hao (12-36 tháng) và giá trị còn lại
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Mã CCDC</th>
                    <th className="px-3 py-2">Tên Thiết Bị / Dụng Cụ</th>
                    <th className="px-3 py-2">Số Serial</th>
                    <th className="px-3 py-2">Người Đang Giữ</th>
                    <th className="px-3 py-2">Phòng Ban</th>
                    <th className="px-3 py-2 text-right">Nguyên Giá</th>
                    <th className="px-3 py-2 text-right">Giá Trị Còn Lại</th>
                    <th className="px-3 py-2 text-center">Tình Trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tools.map(tool => (
                    <tr key={tool.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-700">{tool.toolCode}</td>
                      <td className="px-3 py-2.5 max-w-[220px]">
                        <div className="font-bold text-slate-900">{tool.toolName}</div>
                        <span className="text-[10px] text-slate-400">Phân bổ {tool.amortizationMonths} tháng</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">{tool.serialNumber}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{tool.assignedEmployee}</td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-600">{tool.department}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                        {tool.originalCost.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-700">
                        {tool.remainingValue.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Sử dụng tốt
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
          TAB 4: PHIẾU CẤP PHÁT & THU HỒI BÀN GIAO THÔI VIỆC
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'ISSUANCE_HANDOVER' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* PHẦN 1: CHECKLIST THU HỒI TÀI SẢN KHI THÔI VIỆC */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-600" />
                  <span>Quy Trình Thu Hồi Đồng Phục, BHLĐ &amp; CCDC Khi Cán Bộ Nhân Viên Nghỉ Việc</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kiểm tra hoàn trả tài sản trước khi phòng Kế toán ký quyết toán tiền lương &amp; trợ cấp thôi việc
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {offboardingChecklists.map(item => (
                <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs">{item.employeeName}</span>
                      <span className="text-[11px] text-slate-500">({item.department})</span>
                      <span className="font-mono text-[10.5px] text-slate-400">Mã NV: {item.empId}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[9.5px] font-black border ${
                        item.clearanceStatus === 'CLEARED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      }`}>
                        {item.clearanceStatus === 'CLEARED' ? '✓ Đủ điều kiện thanh toán trợ cấp' : 'Chưa hoàn tất thu hồi'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{item.notes}</p>
                    <div className="flex items-center space-x-3 text-[10.5px] font-bold pt-1">
                      <span className={item.uniformReturned ? 'text-emerald-700' : 'text-rose-600'}>
                        {item.uniformReturned ? '✓ Đồng phục' : '✗ Chưa trả đồng phục'}
                      </span>
                      <span className={item.ppeReturned ? 'text-emerald-700' : 'text-rose-600'}>
                        {item.ppeReturned ? '✓ Giày/BHLĐ' : '✗ Chưa trả BHLĐ'}
                      </span>
                      <span className={item.laptopToolsReturned ? 'text-emerald-700' : 'text-rose-600'}>
                        {item.laptopToolsReturned ? '✓ Laptop/CCDC' : '✗ Chưa trả Laptop CCDC'}
                      </span>
                      <span className={item.accessCardReturned ? 'text-emerald-700' : 'text-rose-600'}>
                        {item.accessCardReturned ? '✓ Thẻ từ quẹt cửa' : '✗ Chưa trả thẻ'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Ngày làm việc cuối:</span>
                    <b className="font-mono text-slate-800 text-xs">{item.lastWorkingDay}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PHẦN 2: LỊCH SỬ PHIẾU CẤP PHÁT & IN MẪU A4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                  <span>Sổ Cấp Phát Đồng Phục, BHLĐ &amp; In Biên Bản Bàn Giao A4</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Lưu trữ chứng từ giao nhận hiện vật ký nhận của người lao động phục vụ thanh tra lao động
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateIssuanceModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo Phiếu Cấp Phát Mới</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {issuanceRecords.map(rec => (
                <div key={rec.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {rec.recordCode}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{rec.employeeName}</span>
                        <span className="text-[11px] text-slate-500">({rec.department})</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">Lý do: {rec.reason}</p>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Danh mục cấp: <b>{rec.itemsList.map(i => `${i.itemName} (${i.sizeOrSpec}) x${i.quantity}`).join(', ')}</b>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-bold">Tổng giá trị:</span>
                      <span className="text-sm font-black font-mono text-emerald-700">{rec.totalAmount.toLocaleString('vi-VN')} đ</span>
                      <span className="text-[10px] text-slate-400 block">{rec.date}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold text-[10.5px]">✓ Người lao động đã ký nhận đủ</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRecordForPrint(rec)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10.5px] border border-slate-300 cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Printer className="w-3 h-3 text-indigo-600" />
                      <span>In Biên Bản Cấp Phát A4</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 5: QUẢN LÝ TỒN KHO AN TOÀN & CẢNH BÁO AI ĐẶT HÀNG
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'SAFETY_STOCK_ALERT' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* CẢNH BÁO TỒN KHO BÁO ĐỘNG */}
          <div className="p-3.5 rounded-2xl border-2 border-rose-300 bg-rose-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-900 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Cảnh Báo Thông Minh AI: Mặt Hàng Chạm Ngưỡng Tồn Kho An Toàn (Safety Stock)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black bg-rose-600 text-white animate-pulse">
                Cần Nhập Ngay
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-snug">
              Phát hiện <b>Găng tay chống cắt cấp 5 (chỉ còn 12 đôi / ngưỡng an toàn 30 đôi)</b> và <b>Áo sơ mi văn phòng Size L (chỉ còn 8 cái / ngưỡng an toàn 15 cái)</b>.
              Dự báo với tốc độ onboard 4 nhân viên/tháng, kho sẽ hết hàng trong vòng 10 ngày tới.
            </p>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => alert('Đã tạo phiếu đề xuất mua sắm vật tư BHLĐ bổ sung gửi Phòng Mua Hàng!')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Tạo Đề Xuất Mua Bổ Sung
              </button>
            </div>
          </div>

          {/* BẢNG SO SÁNH TỒN KHO THỰC TẾ VỚI ĐỊNH MỨC AN TOÀN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-amber-600" />
                  <span>Bảng Giám Sát Ngưỡng Tồn Kho Tối Thiểu (Safety Stock Thresholds)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tự động so khớp lượng tồn thực tế trong kho với lượng tồn quy định của doanh nghiệp
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Áo sơ mi văn phòng Size L', current: 8, min: 15, status: 'DANGER', unit: 'Cái' },
                { name: 'Găng tay sợi Kevlar chống cắt', current: 12, min: 30, status: 'DANGER', unit: 'Đôi' },
                { name: 'Giày bảo hộ Jogger Size 41', current: 14, min: 20, status: 'WARNING', unit: 'Đôi' },
                { name: 'Kính bảo hộ 3M chống hóa chất', current: 75, min: 30, status: 'SAFE', unit: 'Cái' },
                { name: 'Áo thun công nhân Size L', current: 85, min: 50, status: 'SAFE', unit: 'Cái' },
                { name: 'Nón bảo hộ Thùy Dương', current: 110, min: 40, status: 'SAFE', unit: 'Cái' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                    <span className="text-[10.5px] text-slate-500 font-mono">Tối thiểu: {item.min} {item.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-black font-mono block ${
                      item.status === 'DANGER' ? 'text-rose-600 animate-pulse' :
                      item.status === 'WARNING' ? 'text-amber-600' : 'text-emerald-700'
                    }`}>
                      {item.current} {item.unit}
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[9.5px] font-bold ${
                      item.status === 'DANGER' ? 'bg-rose-100 text-rose-800' :
                      item.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.status === 'DANGER' ? 'Báo động đỏ' : item.status === 'WARNING' ? 'Cảnh báo' : 'An toàn'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 6: BÁO CÁO CHI PHÍ & PHÂN BỔ PHÒNG BAN
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'COST_ALLOCATION' && (
        <div className="space-y-1.5 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-rose-600" />
                  <span>Phân Bổ Chi Phí Đồng Phục &amp; BHLĐ Theo Phân Xưởng / Phòng Ban</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Căn cứ Thông tư 96/2015/TT-BTC: Chi đồng phục bằng hiện vật được tính toàn bộ vào chi phí hợp lý được trừ
                </p>
              </div>
            </div>

            {/* Thanh Bar Tỷ Trọng Chi Phí (Stacked Bar) */}
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded-xl overflow-hidden flex shadow-inner">
                <div style={{ width: '52%' }} className="bg-indigo-600" title="BHLĐ Công Nhân: 52%"></div>
                <div style={{ width: '24%' }} className="bg-purple-600" title="Đồng Phục Văn Phòng: 24%"></div>
                <div style={{ width: '24%' }} className="bg-emerald-500" title="CCDC & Thiết Bị Kỹ Thuật: 24%"></div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-indigo-600"></span> BHLĐ Sản Xuất (Giày, nón, kính, găng tay: 52%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-purple-600"></span> Đồng Phục Văn Phòng &amp; Sales (Sơ mi, vest: 24%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500"></span> Công Cụ Dụng Cụ CCDC (Laptop, bộ đàm: 24%)
                </span>
              </div>
            </div>

            {/* BẢNG PHÂN BỔ THEO ĐƠN VỊ */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Phân Xưởng Chế Biến 1 &amp; 2</span>
                <div className="text-base font-black text-slate-900 font-mono">42.500.000 đ</div>
                <span className="text-[10px] text-slate-500">280 công nhân (Áo thun, giày Jogger, găng tay)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Kho Vận &amp; Logistics</span>
                <div className="text-base font-black text-indigo-700 font-mono">18.200.000 đ</div>
                <span className="text-[10px] text-slate-500">68 nhân sự (Giày mũi thép, nón cứng, áo gió)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Tổ Cơ Điện &amp; Bảo Trì (MEP)</span>
                <div className="text-base font-black text-purple-700 font-mono">16.800.000 đ</div>
                <span className="text-[10px] text-slate-500">14 kỹ sư (Đai an toàn, dụng cụ Bosch, Fluke)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Khối Văn Phòng &amp; Bán Hàng</span>
                <div className="text-base font-black text-emerald-700 font-mono">28.400.000 đ</div>
                <span className="text-[10px] text-slate-500">57 nhân sự (Sơ mi, quần tây, Laptop Dell)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 1: TẠO PHIẾU CẤP PHÁT ĐỒNG PHỤC / CCDC MỚI
      ════════════════════════════════════════════════════════════ */}
      {showCreateIssuanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shirt className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm">Cấp Phát Đồng Phục / BHLĐ / CCDC Cho Nhân Viên</h3>
              </div>
              <button onClick={() => setShowCreateIssuanceModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssuance} className="p-2 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cán Bộ Nhân Viên Nhận:</label>
                  <select
                    value={newIssuanceForm.employeeName}
                    onChange={e => {
                      const emp = employees.find(x => x.fullName === e.target.value);
                      setNewIssuanceForm({
                        ...newIssuanceForm,
                        employeeName: e.target.value,
                        department: emp?.departmentName || 'Phòng Đảm Bảo Chất Lượng'
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-semibold text-slate-800 bg-white"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.fullName}>{emp.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phòng Ban / Bộ Phận:</label>
                  <input
                    type="text"
                    readOnly
                    value={newIssuanceForm.department}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mặt Hàng Trang Cấp:</label>
                <select
                  value={newIssuanceForm.itemName}
                  onChange={e => setNewIssuanceForm({ ...newIssuanceForm, itemName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 bg-white"
                >
                  <option value="Áo Sơ Mi Trắng Đồng Phục Khối Văn Phòng">Áo Sơ Mi Trắng Đồng Phục Khối Văn Phòng</option>
                  <option value="Áo Thun Polo Cổ Trụ Công Nhân Sản Xuất">Áo Thun Polo Cổ Trụ Công Nhân Sản Xuất</option>
                  <option value="Giày Bảo Hộ Lao Động Safety Jogger Bestrun S3">Giày Bảo Hộ Lao Động Safety Jogger Bestrun S3</option>
                  <option value="Nón Bảo Hộ Lao Động Cách Điện Thùy Dương">Nón Bảo Hộ Lao Động Cách Điện Thùy Dương</option>
                  <option value="Găng Tay Sợi Kevlar Chống Cắt Cấp Độ 5">Găng Tay Sợi Kevlar Chống Cắt Cấp Độ 5</option>
                  <option value="Kính Bảo Hộ Chống Hóa Chất 3M">Kính Bảo Hộ Chống Hóa Chất 3M</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kích Cỡ (Size):</label>
                  <select
                    value={newIssuanceForm.size}
                    onChange={e => setNewIssuanceForm({ ...newIssuanceForm, size: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 bg-white"
                  >
                    <option value="S">Size S</option>
                    <option value="M">Size M</option>
                    <option value="L">Size L</option>
                    <option value="XL">Size XL</option>
                    <option value="XXL">Size XXL</option>
                    <option value="40">Size 40 (Giày)</option>
                    <option value="41">Size 41 (Giày)</option>
                    <option value="42">Size 42 (Giày)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Lượng Cấp:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newIssuanceForm.quantity}
                    onChange={e => setNewIssuanceForm({ ...newIssuanceForm, quantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lý Do Cấp Phát:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cấp phát định kỳ thường niên, cấp bổ sung nhân viên mới..."
                  value={newIssuanceForm.reason}
                  onChange={e => setNewIssuanceForm({ ...newIssuanceForm, reason: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateIssuanceModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Xác Nhận Xuất Kho &amp; Cấp Phát</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 2: IN BIÊN BẢN CẤP PHÁT & BÀN GIAO CCDC A4
      ════════════════════════════════════════════════════════════ */}
      {selectedRecordForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Biên Bản Giao Nhận Đồng Phục &amp; CCDC (A4)
                </h3>
              </div>
              <button onClick={() => setSelectedRecordForPrint(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 text-xs font-serif leading-relaxed text-slate-900 bg-white">
              <div className="border-b pb-3 text-center">
                <p className="font-bold text-xs uppercase">{policy.companyName}</p>
                <h2 className="text-base font-bold uppercase mt-1 text-slate-900">
                  BIÊN BẢN GIAO NHẬN ĐỒNG PHỤC, BHLĐ &amp; CÔNG CỤ DỤNG CỤ
                </h2>
                <p className="text-[10.5px] italic text-slate-500">Số chứng từ: {selectedRecordForPrint.recordCode} • Ngày lập: {selectedRecordForPrint.date}</p>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <p><b>Họ và tên người nhận:</b> {selectedRecordForPrint.employeeName}</p>
                <p><b>Bộ phận / Phòng ban:</b> {selectedRecordForPrint.department}</p>
                <p><b>Lý do cấp phát:</b> {selectedRecordForPrint.reason}</p>
                <p><b>Người phê duyệt:</b> {selectedRecordForPrint.approvedBy}</p>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px] mt-2">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2">STT</th>
                      <th className="p-2">Tên Mặt Hàng Trang Cấp</th>
                      <th className="p-2 text-center">Quy Cách / Size</th>
                      <th className="p-2 text-center">Số Lượng</th>
                      <th className="p-2 text-right">Đơn Giá</th>
                      <th className="p-2 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedRecordForPrint.itemsList.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-center">{idx + 1}</td>
                        <td className="p-2 font-bold">{item.itemName}</td>
                        <td className="p-2 text-center">{item.sizeOrSpec}</td>
                        <td className="p-2 text-center font-bold">{item.quantity}</td>
                        <td className="p-2 text-right font-mono">{item.unitPrice.toLocaleString('vi-VN')} đ</td>
                        <td className="p-2 text-right font-mono font-bold">{(item.quantity * item.unitPrice).toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-black">
                      <td colSpan={5} className="p-2 text-right">TỔNG GIÁ TRỊ:</td>
                      <td className="p-2 text-right font-mono text-indigo-900">{selectedRecordForPrint.totalAmount.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[10.5px] italic text-slate-600 mt-2">
                * Cam kết: Người lao động có trách nhiệm bảo quản, sử dụng đúng mục đích công vụ và hoàn trả nguyên vẹn khi chấm dứt hợp đồng lao động theo quy định công ty.
              </p>

              <div className="grid grid-cols-3 gap-2 text-center pt-8 mt-1.5 border-t text-[10.5px]">
                <div>
                  <p className="font-bold uppercase">Người Nhận</p>
                  <p className="italic text-slate-400 mt-10">{selectedRecordForPrint.employeeName}</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Thủ Kho Cấp Phát</p>
                  <p className="italic text-slate-400 mt-10">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Trưởng Phòng HCNS</p>
                  <p className="italic text-slate-400 mt-10">{selectedRecordForPrint.approvedBy}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Mẫu in A4 lưu hồ sơ cấp phát BHLĐ</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecordForPrint(null)}
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
                  <span>In Biên Bản Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 3: BẢNG SIZE ĐỒNG PHỤC CÁN BỘ NHÂN VIÊN
      ════════════════════════════════════════════════════════════ */}
      {showSizeRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Hồ Sơ Đăng Ký Size Đồng Phục &amp; Giày Cán Bộ Nhân Viên</h3>
              </div>
              <button onClick={() => setShowSizeRegisterModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 space-y-3 text-xs">
              <p className="text-slate-600">
                Thông số kích cỡ cơ thể nhân sự được lưu trữ tự động để phục vụ đặt may hàng loạt định kỳ hằng năm:
              </p>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 font-bold border-b border-slate-200 text-[10px] uppercase">
                    <tr>
                      <th className="p-2">Họ Và Tên</th>
                      <th className="p-2">Phòng Ban</th>
                      <th className="p-2 text-center">Size Áo</th>
                      <th className="p-2 text-center">Size Quần</th>
                      <th className="p-2 text-center">Size Giày</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.slice(0, 8).map((emp, i) => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">{emp.fullName}</td>
                        <td className="p-2 text-slate-500 text-[11px]">{emp.departmentName}</td>
                        <td className="p-2 text-center font-bold text-indigo-700">{i % 2 === 0 ? 'L' : 'M'}</td>
                        <td className="p-2 text-center font-mono">{i % 2 === 0 ? '31' : '29'}</td>
                        <td className="p-2 text-center font-mono font-bold text-emerald-700">{41 + (i % 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSizeRegisterModal(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
