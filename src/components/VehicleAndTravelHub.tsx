import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Car,
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
  Wrench,
  Fuel,
  Plane,
  Building,
  Navigation,
  Key,
  CreditCard,
  TrendingUp,
  TrendingDown,
  FileCheck2,
  SlidersHorizontal,
  Send,
  Bus,
  Gauge,
  RotateCw,
  PhoneCall,
  UserCheck,
  BadgeAlert
} from 'lucide-react';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';

interface VehicleAndTravelHubProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
}

// 6 PHÂN HỆ ĐIỀU HÀNH XE & VÉ CÔNG TÁC
export type VehicleSubCategory =
  | 'DISPATCH_BOOKING'        // 1. Lệnh Điều Xe & Đăng Ký Xe Công Tác
  | 'SHUTTLE_BUS'            // 2. Tuyến Xe Đưa Đón Cán Bộ Công Nhân Viên
  | 'GRAB_TAXI_CORP'         // 3. Quản Lý Thẻ Grab for Business & Taxi Trả Sau
  | 'FLIGHTS_HOTELS_PERDIEM' // 4. Vé Máy Bay, Khách Sạn & Công Tác Phí
  | 'FUEL_AND_MAINTENANCE'   // 5. Định Mức Nhiên Liệu, Bảo Dưỡng & Đăng Kiểm
  | 'TRAVEL_ANALYTICS';      // 6. Báo Cáo Phân Tích Chi Phí Đi Lại 360°

// 1. Dữ Liệu Xe Công Ty
export interface CompanyVehicle {
  id: string;
  plateNumber: string;       // Biển số xe (vd: 61A-888.68)
  vehicleModel: string;      // Tên xe (vd: Toyota Fortuner 2.8V 4x4)
  vehicleType: 'SEDAN_4' | 'SUV_7' | 'BUS_29' | 'BUS_45' | 'PICKUP';
  typeLabel: string;
  seatingCapacity: number;
  assignedDriver: string;
  driverPhone: string;
  currentStatus: 'AVAILABLE' | 'ON_DUTY' | 'MAINTENANCE';
  currentOdometerKm: number;
  fuelType: 'DIESEL' | 'GASOLINE_RON95';
  fuelQuotaPer100Km: number; // Định mức L/100km
  inspectionExpiry: string;  // Hạn đăng kiểm
  insuranceExpiry: string;   // Hạn bảo hiểm TNDS & Thân vỏ
  roadFeeExpiry: string;     // Phí bảo trì đường bộ
  assignedDepartment: string;
}

// 2. Lệnh Điều Xe Công Tác
export interface VehicleBookingRequisition {
  id: string;
  orderCode: string;         // VD: LĐX-2026-089
  requestedBy: string;
  department: string;
  purpose: string;           // Mục đích công tác
  destinationRoute: string;  // Lộ trình (vd: Nhà máy Bình Dương ↔ Sở Công Thương TP.HCM)
  departureTime: string;     // Giờ khởi hành
  returnTime: string;        // Giờ dự kiến về
  passengerCount: number;
  passengerNames: string[];
  vehicleId: string;
  vehicleName: string;
  driverName: string;
  driverPhone: string;
  startOdometerKm?: number;
  endOdometerKm?: number;
  actualDistanceKm?: number;
  tollFeeAmount: number;     // Phí cầu đường BOT
  status: 'PENDING_APPROVAL' | 'DISPATCHED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  approvedBy?: string;
}

// 3. Tuyến Xe Đưa Đón Cán Bộ Công Nhân Viên (Shuttle Bus)
export interface ShuttleRoute {
  id: string;
  routeName: string;         // VD: Tuyến 01: TP. Thủ Dầu Một ↔ KCN Sóng Thần 2
  busPlate: string;
  vehicleCapacity: number;
  registeredEmployeesCount: number;
  driverName: string;
  driverPhone: string;
  pickupStops: Array<{ stopName: string; morningPickupTime: string; afternoonDropTime: string; count: number }>;
  operatingShift: string;    // Ca làm việc (vd: Ca hành chính 07:30 - 16:30)
  status: 'ACTIVE' | 'STANDBY';
  monthlyContractCost: number;
}

// 4. Giao Dịch Đi Lại Doanh Nghiệp (Grab for Business / Taxi)
export interface CorporateRideTransaction {
  id: string;
  tripCode: string;          // VD: GRB-2026-9921
  employeeName: string;
  department: string;
  tripTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  distanceKm: number;
  fareAmount: number;
  serviceType: 'GRAB_CAR' | 'GRAB_BIKE' | 'VINASUN_TAXI' | 'MAI_LINH';
  businessReason: string;
  isAfterHours: boolean;     // Đi ngoài giờ (>22:00 hoặc cuối tuần)
  flagAnomaly?: string;      // Cảnh báo AI (vd: Cần giải trình mục đích)
  auditStatus: 'VERIFIED' | 'FLAGGED_REVIEW' | 'REJECTED';
}

// 5. Chuyến Công Tác Xa, Vé Máy Bay & Quyết Toán Phí (Per Diem)
export interface BusinessTravelClaim {
  id: string;
  claimCode: string;         // VD: CT-2026-042
  travelerName: string;
  department: string;
  destinationCity: string;   // Hà Nội, Đà Nẵng, Cần Thơ, Hải Phòng
  flightRoute: string;       // SGN - HAN khứ hồi
  airlineName: string;       // Vietnam Airlines, Vietjet
  pnrTicketCode: string;     // Mã vé PNR
  flightCost: number;
  hotelNightsCount: number;
  hotelCost: number;
  perDiemDays: number;       // Số ngày hưởng công tác phí
  perDiemDailyRate: number;  // 300.000 đ/ngày
  localTaxiCost: number;
  advanceAmountPaid: number; // Tiền đã tạm ứng
  totalActualCost: number;   // Tổng chi phí thực tế
  balanceToSettle: number;   // Chênh lệch cần thanh toán thêm hoặc hoàn trả
  status: 'APPROVED' | 'IN_PROGRESS' | 'SETTLED';
}

export const VehicleAndTravelHub: React.FC<VehicleAndTravelHubProps> = ({
  policy,
  employees,
  currentRole
}) => {
  const [activeSubTab, setActiveSubTab] = useState<VehicleSubCategory>('DISPATCH_BOOKING');

  // ==========================================================
  // 1. DỮ LIỆU ĐỘI XE DOANH NGHIỆP
  // ==========================================================
  const [vehicles, setVehicles] = useState<CompanyVehicle[]>([
    {
      id: 'VEH-01',
      plateNumber: '61A-888.68',
      vehicleModel: 'Toyota Fortuner 2.8V 4x4 Legender (Màu Đen)',
      vehicleType: 'SUV_7',
      typeLabel: 'Xe 7 Chỗ Lãnh Đạo',
      seatingCapacity: 7,
      assignedDriver: 'Nguyễn Văn Hải',
      driverPhone: '0912.345.678',
      currentStatus: 'AVAILABLE',
      currentOdometerKm: 68420,
      fuelType: 'DIESEL',
      fuelQuotaPer100Km: 11.0,
      inspectionExpiry: '2026-10-08', // Còn 23 ngày (Cảnh báo đỏ)
      insuranceExpiry: '2026-11-15',
      roadFeeExpiry: '2026-12-31',
      assignedDepartment: 'Ban Tổng Giám Đốc & Tiếp Khách VIP'
    },
    {
      id: 'VEH-02',
      plateNumber: '61A-799.99',
      vehicleModel: 'Kia Carnival 2.2D Signature 7 Chỗ VIP (Màu Trắng)',
      vehicleType: 'SUV_7',
      typeLabel: 'Xe 7 Chỗ Chuyên Gia',
      seatingCapacity: 7,
      assignedDriver: 'Phạm Đức Long',
      driverPhone: '0988.234.567',
      currentStatus: 'ON_DUTY',
      currentOdometerKm: 42150,
      fuelType: 'DIESEL',
      fuelQuotaPer100Km: 9.5,
      inspectionExpiry: '2027-04-12',
      insuranceExpiry: '2027-04-12',
      roadFeeExpiry: '2027-04-12',
      assignedDepartment: 'Đưa Đón Chuyên Gia & Ban Giám Đốc'
    },
    {
      id: 'VEH-03',
      plateNumber: '61C-523.45',
      vehicleModel: 'Ford Ranger Wildtrak 2.0L Bi-Turbo 4x4 (Bán Tải)',
      vehicleType: 'PICKUP',
      typeLabel: 'Xe Bán Tải Hiện Trường',
      seatingCapacity: 5,
      assignedDriver: 'Đỗ Quốc Việt',
      driverPhone: '0903.888.999',
      currentStatus: 'AVAILABLE',
      currentOdometerKm: 95300,
      fuelType: 'DIESEL',
      fuelQuotaPer100Km: 8.5,
      inspectionExpiry: '2026-12-20',
      insuranceExpiry: '2027-01-10',
      roadFeeExpiry: '2026-12-20',
      assignedDepartment: 'Đội Kỹ Thuật, QA/QC & Giao Nhận Mẫu Hàng'
    },
    {
      id: 'VEH-04',
      plateNumber: '61B-012.34',
      vehicleModel: 'Hyundai Universe 29 Chỗ (Xe Đưa Đón Công Nhân)',
      vehicleType: 'BUS_29',
      typeLabel: 'Xe Tuyến 29 Chỗ',
      seatingCapacity: 29,
      assignedDriver: 'Trần Đình Trọng',
      driverPhone: '0988.765.432',
      currentStatus: 'ON_DUTY',
      currentOdometerKm: 148200,
      fuelType: 'DIESEL',
      fuelQuotaPer100Km: 16.0,
      inspectionExpiry: '2026-11-05',
      insuranceExpiry: '2026-11-05',
      roadFeeExpiry: '2026-11-05',
      assignedDepartment: 'Tuyến Đưa Đón Công Nhân Tuyến 1'
    }
  ]);

  // ==========================================================
  // 2. DỮ LIỆU LỆNH ĐIỀU XE CÔNG TÁC
  // ==========================================================
  const [dispatchOrders, setDispatchOrders] = useState<VehicleBookingRequisition[]>([
    {
      id: 'DISP-01',
      orderCode: 'LĐX-2026-088',
      requestedBy: 'Trần Thị Thu Thảo',
      department: 'Phòng Phát Triển Thị Trường & Sales',
      purpose: 'Đưa đoàn khách đối tác Nhật Bản (Tập đoàn Mitsubishi) tham quan nhà máy và làm việc hợp đồng',
      destinationRoute: 'Nhà Máy KCN Sóng Thần 2 ↔ Sân Bay Tân Sơn Nhất & Khách Sạn Sheraton Q.1',
      departureTime: '08:00 15/09/2026',
      returnTime: '17:30 15/09/2026',
      passengerCount: 4,
      passengerNames: ['Trần Thị Thu Thảo', 'Mr. Kenji Sato', 'Ms. Yoko Tanaka', 'Phiên dịch viên'],
      vehicleId: 'VEH-02',
      vehicleName: 'Kia Carnival 2.2D Signature (61A-799.99)',
      driverName: 'Phạm Đức Long',
      driverPhone: '0988.234.567',
      startOdometerKm: 42150,
      tollFeeAmount: 90000,
      status: 'IN_TRANSIT',
      approvedBy: 'Trần Việt Hùng (GĐ Hành Chính)'
    },
    {
      id: 'DISP-02',
      orderCode: 'LĐX-2026-089',
      requestedBy: 'Lê Hoàng Nam',
      department: 'Phòng Đảm Bảo Chất Lượng (QA/QC)',
      purpose: 'Vận chuyển thùng mẫu kiểm nghiệm vi sinh thực phẩm đến Trung tâm Đo lường Chất lượng Quatest 3',
      destinationRoute: 'Nhà Máy KCN Sóng Thần 2 ↔ Quatest 3 (KCN Cát Lái, TP. Thủ Đức)',
      departureTime: '13:30 15/09/2026',
      returnTime: '16:30 15/09/2026',
      passengerCount: 2,
      passengerNames: ['Lê Hoàng Nam', 'Nhân viên lấy mẫu'],
      vehicleId: 'VEH-03',
      vehicleName: 'Ford Ranger Wildtrak (61C-523.45)',
      driverName: 'Đỗ Quốc Việt',
      driverPhone: '0903.888.999',
      startOdometerKm: 95300,
      tollFeeAmount: 45000,
      status: 'DISPATCHED',
      approvedBy: 'Trần Việt Hùng (GĐ Hành Chính)'
    },
    {
      id: 'DISP-03',
      orderCode: 'LĐX-2026-087',
      requestedBy: 'Vũ Đức Trọng',
      department: 'Kho Vận & Logistics',
      purpose: 'Làm thủ tục thông quan lô hàng xuất khẩu tại Chi cục Hải quan Cảng Sài Gòn Khu vực 1',
      destinationRoute: 'Nhà Máy KCN Sóng Thần 2 ↔ Cảng Cát Lái TP.HCM',
      departureTime: '08:30 14/09/2026',
      returnTime: '15:00 14/09/2026',
      passengerCount: 2,
      passengerNames: ['Vũ Đức Trọng', 'Chuyên viên XNK'],
      vehicleId: 'VEH-03',
      vehicleName: 'Ford Ranger Wildtrak (61C-523.45)',
      driverName: 'Đỗ Quốc Việt',
      driverPhone: '0903.888.999',
      startOdometerKm: 95180,
      endOdometerKm: 95300,
      actualDistanceKm: 120,
      tollFeeAmount: 70000,
      status: 'COMPLETED',
      approvedBy: 'Trần Việt Hùng (GĐ Hành Chính)'
    }
  ]);

  // ==========================================================
  // 3. DỮ LIỆU TUYẾN XE ĐƯA ĐÓN CÔNG NHÂN (SHUTTLE BUS)
  // ==========================================================
  const [shuttleRoutes, setShuttleRoutes] = useState<ShuttleRoute[]>([
    {
      id: 'ROUTE-01',
      routeName: 'Tuyến 01: TP. Thủ Dầu Một ↔ KCN Sóng Thần 2',
      busPlate: '61B-012.34 (Xe 29 Chỗ Cty)',
      vehicleCapacity: 29,
      registeredEmployeesCount: 26,
      driverName: 'Trần Đình Trọng',
      driverPhone: '0988.765.432',
      pickupStops: [
        { stopName: 'Bến Xe Khách Tỉnh Bình Dương (Đường 30/4)', morningPickupTime: '06:15', afternoonDropTime: '17:45', count: 8 },
        { stopName: 'Ngã Tư Địa Chất (Đại Lộ Bình Dương)', morningPickupTime: '06:30', afternoonDropTime: '17:30', count: 11 },
        { stopName: 'Ngã Tư 550 (Dĩ An)', morningPickupTime: '06:50', afternoonDropTime: '17:10', count: 7 }
      ],
      operatingShift: 'Ca 1 (07:30 - 16:30)',
      status: 'ACTIVE',
      monthlyContractCost: 18500000
    },
    {
      id: 'ROUTE-02',
      routeName: 'Tuyến 02: TP. Biên Hòa ↔ KCN Sóng Thần 2',
      busPlate: '60B-089.12 (Xe 45 Chỗ Thuê Ngoài)',
      vehicleCapacity: 45,
      registeredEmployeesCount: 41,
      driverName: 'Lê Thanh Tùng (Nhà xe Đồng Nai Trans)',
      driverPhone: '0913.999.888',
      pickupStops: [
        { stopName: 'Công Viên Biên Hùng (Biên Hòa)', morningPickupTime: '06:10', afternoonDropTime: '17:50', count: 14 },
        { stopName: 'Ngã Ba Vũng Tàu', morningPickupTime: '06:25', afternoonDropTime: '17:35', count: 18 },
        { stopName: 'Cầu Vượt Sóng Thần', morningPickupTime: '06:45', afternoonDropTime: '17:15', count: 9 }
      ],
      operatingShift: 'Ca 1 (07:30 - 16:30)',
      status: 'ACTIVE',
      monthlyContractCost: 24500000
    },
    {
      id: 'ROUTE-03',
      routeName: 'Tuyến 03: TP.HCM (Hàng Xanh) ↔ KCN Sóng Thần 2',
      busPlate: '51B-234.56 (Xe 16 Chỗ Ford Transit)',
      vehicleCapacity: 16,
      registeredEmployeesCount: 14,
      driverName: 'Nguyễn Văn Minh (Hợp tác xã Vận tải)',
      driverPhone: '0908.123.789',
      pickupStops: [
        { stopName: 'Ngã Tư Hàng Xanh (Cây Xăng Petro)', morningPickupTime: '06:20', afternoonDropTime: '17:40', count: 6 },
        { stopName: 'Ngã Tư Thủ Đức (Trạm Bus ĐH Sư Phạm Kỹ Thuật)', morningPickupTime: '06:35', afternoonDropTime: '17:25', count: 5 },
        { stopName: 'Khu Công Nghệ Cao Quận 9', morningPickupTime: '06:45', afternoonDropTime: '17:15', count: 3 }
      ],
      operatingShift: 'Khối Kỹ Sư & Văn Phòng Điều Hành',
      status: 'ACTIVE',
      monthlyContractCost: 16000000
    }
  ]);

  // ==========================================================
  // 4. DỮ LIỆU ĐI LẠI DOANH NGHIỆP (GRAB / TAXI CORP)
  // ==========================================================
  const [corporateRides, setCorporateRides] = useState<CorporateRideTransaction[]>([
    {
      id: 'TRIP-01',
      tripCode: 'GRB-2026-9921',
      employeeName: 'Nguyễn Thanh Tùng',
      department: 'Phòng Phát Triển Thị Trường',
      tripTime: '14:20 12/09/2026',
      pickupLocation: 'Nhà Máy KCN Sóng Thần 2',
      dropoffLocation: 'Trụ sở Big C Thăng Long (Chi nhánh Dĩ An)',
      distanceKm: 8.4,
      fareAmount: 125000,
      serviceType: 'GRAB_CAR',
      businessReason: 'Khảo sát quầy kệ trưng bày sản phẩm FMCG',
      isAfterHours: false,
      auditStatus: 'VERIFIED'
    },
    {
      id: 'TRIP-02',
      tripCode: 'GRB-2026-9922',
      employeeName: 'Trần Thị Thu Thảo',
      department: 'Phòng Kinh Doanh & Bán Hàng',
      tripTime: '22:45 10/09/2026',
      pickupLocation: 'Nhà Hàng San Fu Lou (Quận 1, TP.HCM)',
      dropoffLocation: 'Chung Cư Vinhomes Central Park (Bình Thạnh)',
      distanceKm: 5.2,
      fareAmount: 88000,
      serviceType: 'GRAB_CAR',
      businessReason: 'Ăn tối tiếp đoàn khách đối tác xuất khẩu Nhật Bản',
      isAfterHours: true,
      flagAnomaly: '⚠️ Chuyến đi sau 22:00 cần đính kèm hóa đơn tiếp khách được duyệt',
      auditStatus: 'FLAGGED_REVIEW'
    },
    {
      id: 'TRIP-03',
      tripCode: 'TX-2026-4412',
      employeeName: 'Đỗ Văn Thắng',
      department: 'Phòng Cơ Điện (MEP)',
      tripTime: '09:15 08/09/2026',
      pickupLocation: 'Nhà Máy KCN Sóng Thần 2',
      dropoffLocation: 'Chợ Dân Sinh Quận 1 (Mua linh kiện khí nén gấp)',
      distanceKm: 24.5,
      fareAmount: 380000,
      serviceType: 'VINASUN_TAXI',
      businessReason: 'Mua van điều áp khẩn cấp khắc phục sự cố rò rỉ chuyền 1',
      isAfterHours: false,
      auditStatus: 'VERIFIED'
    }
  ]);

  // ==========================================================
  // 5. DỮ LIỆU CÔNG TÁC XA, VÉ MÁY BAY & QUYẾT TOÁN PER DIEM
  // ==========================================================
  const [travelClaims, setTravelClaims] = useState<BusinessTravelClaim[]>([
    {
      id: 'CLM-01',
      claimCode: 'CT-2026-041',
      travelerName: 'Phạm Hồng Thái',
      department: 'Phòng Quản Lý Chất Lượng & HSE',
      destinationCity: 'Hà Nội',
      flightRoute: 'SGN ↔ HAN (Khứ hồi)',
      airlineName: 'Vietnam Airlines (Hạng Phổ Thông)',
      pnrTicketCode: 'VN-891283',
      flightCost: 3850000,
      hotelNightsCount: 3,
      hotelCost: 3300000, // 1.1tr/đêm x 3 đêm
      perDiemDays: 4,
      perDiemDailyRate: 300000,
      localTaxiCost: 450000,
      advanceAmountPaid: 8000000,
      totalActualCost: 8800000,
      balanceToSettle: 800000, // Cty chi trả thêm 800k
      status: 'APPROVED'
    },
    {
      id: 'CLM-02',
      claimCode: 'CT-2026-042',
      travelerName: 'Trần Việt Hùng (GĐ Hành Chính)',
      department: 'Ban Giám Đốc',
      destinationCity: 'Đà Nẵng & Chu Lai',
      flightRoute: 'SGN ↔ DAD (Khứ hồi)',
      airlineName: 'Vietnam Airlines (Hạng Thương Gia Business)',
      pnrTicketCode: 'VN-994411',
      flightCost: 6500000,
      hotelNightsCount: 2,
      hotelCost: 3600000, // 1.8tr/đêm x 2 đêm
      perDiemDays: 3,
      perDiemDailyRate: 500000,
      localTaxiCost: 350000,
      advanceAmountPaid: 12000000,
      totalActualCost: 11950000,
      balanceToSettle: -50000, // Nhân viên hoàn trả cty 50k
      status: 'SETTLED'
    }
  ]);

  // ==========================================================
  // STATE MODALS & FORMS
  // ==========================================================
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    requestedBy: employees[0]?.fullName || 'Trần Thị Thu Thảo',
    department: employees[0]?.departmentName || 'Phòng Phát Triển Thị Trường',
    purpose: '',
    destinationRoute: '',
    departureTime: '',
    returnTime: '',
    passengerCount: 1,
    vehicleId: 'VEH-01'
  });

  // Modal in Lệnh Điều Xe A4
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<VehicleBookingRequisition | null>(null);

  // Modal xem Hồ sơ đăng kiểm xe A4
  const [selectedVehicleForInspection, setSelectedVehicleForInspection] = useState<CompanyVehicle | null>(null);

  // Modal Quyết toán công tác phí
  const [selectedClaimForModal, setSelectedClaimForModal] = useState<BusinessTravelClaim | null>(null);

  // ==========================================================
  // KPI THỐNG KÊ THỜI GIAN THỰC
  // ==========================================================
  const kpiStats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.currentStatus === 'AVAILABLE').length;
    const inTransitVehicles = vehicles.filter(v => v.currentStatus === 'ON_DUTY').length;

    // Tổng chi phí đi lại tháng 8/2026
    const busMonthlyCost = shuttleRoutes.reduce((sum, r) => sum + r.monthlyContractCost, 0);
    const grabMonthlyCost = corporateRides.reduce((sum, r) => sum + r.fareAmount, 0);
    const flightsCost = travelClaims.reduce((sum, c) => sum + c.totalActualCost, 0);
    const totalTravelCostMonth = busMonthlyCost + grabMonthlyCost + flightsCost + 15400000; // +15.4tr tiền xăng xe cty

    // Cảnh báo đăng kiểm sắp hết hạn trong 30 ngày
    const urgentInspectionCount = vehicles.filter(v => {
      const exp = new Date(v.inspectionExpiry).getTime();
      const now = new Date('2026-09-15').getTime();
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length;

    return {
      totalVehicles,
      availableVehicles,
      inTransitVehicles,
      totalTravelCostMonth,
      activeDispatchCount: dispatchOrders.filter(d => d.status === 'IN_TRANSIT' || d.status === 'DISPATCHED').length,
      urgentInspectionCount,
      totalShuttlePassengers: shuttleRoutes.reduce((sum, r) => sum + r.registeredEmployeesCount, 0)
    };
  }, [vehicles, shuttleRoutes, corporateRides, travelClaims, dispatchOrders]);

  // Xử lý tạo lệnh điều xe mới
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingForm.purpose.trim() || !newBookingForm.destinationRoute.trim()) {
      alert('Vui lòng nhập đầy đủ mục đích công tác và lộ trình di chuyển!');
      return;
    }

    const selectedVeh = vehicles.find(v => v.id === newBookingForm.vehicleId) || vehicles[0];

    const newOrder: VehicleBookingRequisition = {
      id: `DISP-${Date.now()}`,
      orderCode: `LĐX-2026-0${90 + dispatchOrders.length}`,
      requestedBy: newBookingForm.requestedBy,
      department: newBookingForm.department,
      purpose: newBookingForm.purpose.trim(),
      destinationRoute: newBookingForm.destinationRoute.trim(),
      departureTime: newBookingForm.departureTime || '08:00 16/09/2026',
      returnTime: newBookingForm.returnTime || '17:00 16/09/2026',
      passengerCount: Number(newBookingForm.passengerCount) || 1,
      passengerNames: [newBookingForm.requestedBy],
      vehicleId: selectedVeh.id,
      vehicleName: `${selectedVeh.vehicleModel} (${selectedVeh.plateNumber})`,
      driverName: selectedVeh.assignedDriver,
      driverPhone: selectedVeh.driverPhone,
      tollFeeAmount: 0,
      status: 'DISPATCHED',
      approvedBy: 'Trần Việt Hùng (GĐ Hành Chính)'
    };

    setDispatchOrders([newOrder, ...dispatchOrders]);
    setShowCreateBookingModal(false);
    setNewBookingForm({
      requestedBy: employees[0]?.fullName || 'Trần Thị Thu Thảo',
      department: employees[0]?.departmentName || 'Phòng Phát Triển Thị Trường',
      purpose: '',
      destinationRoute: '',
      departureTime: '',
      returnTime: '',
      passengerCount: 1,
      vehicleId: 'VEH-01'
    });

    alert(`✓ ĐÃ DUYỆT & ĐIỀU XE THÀNH CÔNG!\nLệnh điều xe ${newOrder.orderCode} đã được gửi tới tài xế ${selectedVeh.assignedDriver} (${selectedVeh.driverPhone}).`);
  };

  // Xuất báo cáo Excel 5 Sheet tổng hợp
  const handleExportTravelExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Danh mục đội xe
    const ws1Data = vehicles.map(v => ({
      'Biển Số Xe': v.plateNumber,
      'Dòng Xe': v.vehicleModel,
      'Phân Loại': v.typeLabel,
      'Số Chỗ': v.seatingCapacity,
      'Tài Xế Phụ Trách': v.assignedDriver,
      'Số Điện Thoại': v.driverPhone,
      'Trạng Thái': v.currentStatus === 'AVAILABLE' ? 'Sẵn sàng' : 'Đang chạy',
      'Công-Tơ-Mét (Km)': v.currentOdometerKm,
      'Định Mức Nhiên Liệu': `${v.fuelQuotaPer100Km} L/100km`,
      'Hạn Đăng Kiểm': v.inspectionExpiry,
      'Hạn Bảo Hiểm': v.insuranceExpiry,
      'Phòng Ban Phụ Trách': v.assignedDepartment
    }));
    const ws1 = XLSX.utils.json_to_sheet(ws1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Danh_Muc_Doi_Xe');

    // Sheet 2: Lệnh điều xe công tác
    const ws2Data = dispatchOrders.map(d => ({
      'Mã Lệnh Điều Xe': d.orderCode,
      'Người Đi Công Tác': d.requestedBy,
      'Phòng Ban': d.department,
      'Mục Đích Công Tác': d.purpose,
      'Lộ Trình': d.destinationRoute,
      'Thời Gian Khởi Hành': d.departureTime,
      'Thời Gian Về': d.returnTime,
      'Phương Tiện': d.vehicleName,
      'Tài Xế': d.driverName,
      'Quãng Đường (Km)': d.actualDistanceKm || 'Đang di chuyển',
      'Phí Cầu Đường BOT (VNĐ)': d.tollFeeAmount,
      'Trạng Thái': d.status
    }));
    const ws2 = XLSX.utils.json_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, 'Lenh_Dieu_Xe_Cong_Tac');

    // Sheet 3: Tuyến xe đưa đón công nhân
    const ws3Data = shuttleRoutes.map(r => ({
      'Tên Tuyến': r.routeName,
      'Biển Số Xe': r.busPlate,
      'Số Ghế': r.vehicleCapacity,
      'CBNV Đăng Ký': r.registeredEmployeesCount,
      'Tài Xế': r.driverName,
      'Ca Phục Vụ': r.operatingShift,
      'Kinh Phí Hàng Tháng (VNĐ)': r.monthlyContractCost
    }));
    const ws3 = XLSX.utils.json_to_sheet(ws3Data);
    XLSX.utils.book_append_sheet(wb, ws3, 'Tuyen_Xe_Dua_Don_Bus');

    // Sheet 4: Đi lại Grab & Taxi
    const ws4Data = corporateRides.map(t => ({
      'Mã Chuyến Đi': t.tripCode,
      'Nhân Viên': t.employeeName,
      'Phòng Ban': t.department,
      'Thời Gian': t.tripTime,
      'Điểm Đón': t.pickupLocation,
      'Điểm Đến': t.dropoffLocation,
      'Khoảng Cách (Km)': t.distanceKm,
      'Chi Phí (VNĐ)': t.fareAmount,
      'Lý Do Đi Lại': t.businessReason,
      'Đi Ngoài Giờ': t.isAfterHours ? 'Có' : 'Không',
      'Trạng Thái Đối Soát': t.auditStatus
    }));
    const ws4 = XLSX.utils.json_to_sheet(ws4Data);
    XLSX.utils.book_append_sheet(wb, ws4, 'Doi_Soat_Grab_Taxi');

    // Sheet 5: Vé máy bay & Quyết toán công tác phí
    const ws5Data = travelClaims.map(c => ({
      'Mã Quyết Toán': c.claimCode,
      'Cán Bộ Đi Công Tác': c.travelerName,
      'Phòng Ban': c.department,
      'Địa Điểm': c.destinationCity,
      'Chặng Bay': c.flightRoute,
      'Mã Vé PNR': c.pnrTicketCode,
      'Tiền Vé Máy Bay': c.flightCost,
      'Tiền Khách Sạn': c.hotelCost,
      'Phụ Cấp Lưu Trú (Per Diem)': c.perDiemDays * c.perDiemDailyRate,
      'Taxi / Đi Lại Nội Tỉnh': c.localTaxiCost,
      'Đã Tạm Ứng (VNĐ)': c.advanceAmountPaid,
      'Tổng Chi Phí (VNĐ)': c.totalActualCost,
      'Cần Quyết Toán Thêm/Hoàn Lại': c.balanceToSettle,
      'Trạng Thái': c.status
    }));
    const ws5 = XLSX.utils.json_to_sheet(ws5Data);
    XLSX.utils.book_append_sheet(wb, ws5, 'Ve_May_Bay_Cong_Tac_Phi');

    XLSX.writeFile(wb, `Bao_Cao_Xe_Va_Di_Lai_Cong_Tac_${policy.companyName.replace(/\s+/g, '_')}_09_2026.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* ════════════════════════════════════════════════════════════
          KHỐI 1: HEADER & KPI CARDS ĐIỀU HÀNH ĐI LẠI 360°
      ════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                    Trung Tâm Điều Phối Đội Xe, Tuyến Đưa Đón &amp; Quản Trị Công Tác Phí
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-400 text-slate-950">
                    6 Phân Hệ Thông Minh
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-300">
                  Điều xe công tác, 3 tuyến bus công nhân, thẻ Grab Corporate, vé máy bay &amp; định mức xăng dầu đăng kiểm
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportTravelExcel}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center space-x-1.5 border border-white/15 cursor-pointer shadow-xs active:scale-95"
              title="Xuất toàn bộ sổ điều hành xe ra Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Báo Cáo Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateBookingModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black transition-all flex items-center space-x-1.5 shadow-md hover:shadow-indigo-500/25 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng Ký Xe Công Tác Mới</span>
            </button>
          </div>
        </div>

        {/* 4 KPI THỐNG KÊ THỜI GIAN THỰC */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Chi Phí Đi Lại Tháng Này</span>
              <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                {(kpiStats.totalTravelCostMonth / 1000000).toFixed(1)} <span className="text-xs font-normal text-slate-300">triệu đ</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">Bus KCN + Grab + Vé máy bay</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Đội Xe Sẵn Sàng Vận Hành</span>
              <div className="text-xl font-black font-mono text-indigo-300 mt-0.5">
                {kpiStats.availableVehicles}/{kpiStats.totalVehicles} <span className="text-xs font-normal text-slate-300">xe ở bãi</span>
              </div>
              <span className="text-[10px] text-slate-300">{kpiStats.inTransitVehicles} xe đang lăn bánh công vụ</span>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Car className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Lệnh Điều Xe Đang Thực Hiện</span>
              <div className="text-xl font-black font-mono text-amber-300 mt-0.5">
                {kpiStats.activeDispatchCount} <span className="text-xs font-normal text-slate-300">chuyến đi</span>
              </div>
              <span className="text-[10px] text-amber-300 font-semibold">Đưa đón khách VIP &amp; Hải quan</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Navigation className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cảnh Báo Hạn Đăng Kiểm</span>
              <div className="text-xl font-black font-mono text-rose-300 mt-0.5">
                {kpiStats.urgentInspectionCount} <span className="text-xs font-normal text-slate-300">xe &le;30 ngày</span>
              </div>
              <span className="text-[10px] text-rose-300 font-semibold">Xe 61A-888.68 cần đi kiểm định</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <ShieldCheck className="w-4 h-4" />
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
            onClick={() => setActiveSubTab('DISPATCH_BOOKING')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'DISPATCH_BOOKING'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-amber-300" />
            <span>1. Lệnh Điều Xe &amp; Lịch Trình Công Tác ({dispatchOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('SHUTTLE_BUS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'SHUTTLE_BUS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Tuyến Xe Đưa Đón Công Nhân ({shuttleRoutes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('GRAB_TAXI_CORP')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'GRAB_TAXI_CORP'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Thẻ Grab / Taxi Doanh Nghiệp ({corporateRides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('FLIGHTS_HOTELS_PERDIEM')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'FLIGHTS_HOTELS_PERDIEM'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-purple-400" />
            <span>4. Vé Máy Bay, Khách Sạn &amp; Quyết Toán ({travelClaims.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('FUEL_AND_MAINTENANCE')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'FUEL_AND_MAINTENANCE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Fuel className="w-3.5 h-3.5 text-amber-400" />
            <span>5. Định Mức Nhiên Liệu &amp; Đăng Kiểm ({vehicles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('TRAVEL_ANALYTICS')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSubTab === 'TRAVEL_ANALYTICS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
            <span>6. Báo Cáo Phân Tích Chi Phí 360°</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          TAB 1: LỆNH ĐIỀU XE & ĐĂNG KÝ XE CÔNG TÁC
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'DISPATCH_BOOKING' && (
        <div className="space-y-4 animate-in fade-in">
          {/* LỊCH TRÌNH CA CHẠY XE TRONG NGÀY (DISPATCH TIMELINE) */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-md border border-indigo-900/50">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Biểu Đồ Điều Phối Lăn Bánh Đội Xe Hôm Nay (15/09/2026)</span>
                </h4>
                <p className="text-[11px] text-slate-400">Giám sát xe bận đón khách, xe rảnh tại bãi đỗ và xe đang giao nhận hàng</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                Ca Trực 07:00 - 18:00
              </span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {vehicles.map(veh => {
                const activeDisp = dispatchOrders.find(d => d.vehicleId === veh.id && d.status === 'IN_TRANSIT');
                return (
                  <div key={veh.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-amber-300">{veh.plateNumber}</span>
                        <span className="font-bold text-slate-200">{veh.vehicleModel}</span>
                        <span className="text-[10.5px] text-slate-400">({veh.typeLabel})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Tài xế: <b className="text-slate-200">{veh.assignedDriver}</b> ({veh.driverPhone})
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                      {activeDisp ? (
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                            Đang Di Chuyển
                          </span>
                          <span className="text-[10.5px] text-slate-300 block mt-0.5 truncate max-w-[240px]">
                            {activeDisp.destinationRoute}
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            Sẵn Sàng Tại Bãi Xe
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Odo: {veh.currentOdometerKm.toLocaleString('vi-VN')} km</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DANH SÁCH LỆNH ĐIỀU XE CÔNG TÁC */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-indigo-600" />
                  <span>Sổ Quản Lý Lệnh Điều Xe Đi Công Tác (Fleet Dispatch Book)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Lộ trình di chuyển, mục đích công vụ, tài xế phụ trách và in lệnh điều xe chuẩn mẫu A4
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateBookingModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo Yêu Cầu Xe Mới</span>
              </button>
            </div>

            <div className="space-y-3">
              {dispatchOrders.map(order => (
                <div key={order.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono font-black text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {order.orderCode}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{order.requestedBy}</span>
                        <span className="text-[11px] text-slate-500">({order.department})</span>
                        <span className={`px-2 py-0.2 rounded-full text-[9.5px] font-black border ${
                          order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'IN_TRANSIT' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {order.status === 'COMPLETED' ? '✓ Đã hoàn thành chuyến' : order.status === 'IN_TRANSIT' ? 'Đang trên đường' : 'Đã duyệt & điều xe'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-semibold mt-1">
                        🎯 Mục đích: {order.purpose}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        📍 Lộ trình: <b>{order.destinationRoute}</b>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-bold">Phương tiện &amp; Lái xe:</span>
                      <span className="text-xs font-black text-slate-900 font-mono block">{order.vehicleName}</span>
                      <span className="text-[11px] text-indigo-700 font-medium">{order.driverName} ({order.driverPhone})</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono flex-wrap">
                      <span>Xuất phát: <b>{order.departureTime}</b></span>
                      <span>Về dự kiến: <b>{order.returnTime}</b></span>
                      <span>Số người đi: <b>{order.passengerCount} người</b></span>
                      {order.actualDistanceKm && <span>Quãng đường: <b className="text-emerald-700">{order.actualDistanceKm} km</b></span>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForPrint(order)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10.5px] font-bold border border-slate-300 cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="In lệnh điều xe chuẩn A4"
                      >
                        <Printer className="w-3 h-3 text-indigo-600" />
                        <span>In Lệnh Điều Xe A4</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 2: TUYẾN XE ĐƯA ĐÓN CÁN BỘ CÔNG NHÂN VIÊN
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'SHUTTLE_BUS' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {shuttleRoutes.map(route => {
              const occupancyPct = Math.round((route.registeredEmployeesCount / route.vehicleCapacity) * 100);
              return (
                <div key={route.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-black text-slate-900 text-xs block leading-tight">
                        {route.routeName}
                      </span>
                      <span className="text-[10.5px] text-indigo-700 font-mono font-bold">{route.busPlate}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đang Chạy
                    </span>
                  </div>

                  {/* Thanh tỷ lệ lấp đầy ghế ngồi */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Tỷ lệ lấp đầy:</span>
                      <b className="font-mono text-indigo-700">{route.registeredEmployeesCount}/{route.vehicleCapacity} ghế ({occupancyPct}%)</b>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${occupancyPct}%` }}
                        className={`h-full rounded-full ${occupancyPct > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      ></div>
                    </div>
                  </div>

                  {/* Điểm đón chính */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <span className="font-bold text-slate-700 text-[10.5px] uppercase block">Các Điểm Đón Cố Định:</span>
                    {route.pickupStops.map((stop, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 py-0.5">
                        <span className="truncate max-w-[170px]">• {stop.stopName}</span>
                        <span className="font-mono font-bold text-slate-800 shrink-0">{stop.morningPickupTime} ({stop.count} người)</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Tài xế: <b>{route.driverName}</b></span>
                    <span className="font-mono font-black text-emerald-700">{(route.monthlyContractCost / 1000000).toFixed(1)} tr/tháng</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 3: THẺ GRAB / TAXI DOANH NGHIỆP
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'GRAB_TAXI_CORP' && (
        <div className="space-y-4 animate-in fade-in">
          {/* CẢNH BÁO AI TRAVEL FRAUD DETECTION */}
          <div className="p-3.5 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black text-amber-900 uppercase">
                  Kiểm Soát Thông Minh AI: Phát Hiện Chuyến Đi Ngoài Giờ &amp; Sai Tuyến
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-amber-200 text-amber-900">
                  1 Chuyến Cần Rà Soát
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Phát hiện chuyến đi lúc <b>22:45</b> của cán bộ <b>Trần Thị Thu Thảo</b>. Yêu cầu đính kèm hóa đơn tiếp khách hoặc biên bản làm việc để HCNS duyệt đối soát cuối tháng.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => alert('Đã gửi thông báo nhắc nhở nhân viên bổ sung giải trình mục đích công tác!')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs"
            >
              Yêu Cầu Giải Trình
            </button>
          </div>

          {/* DANH SÁCH ĐỐI SOÁT CHUYẾN ĐI GRAB/TAXI */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Sổ Đối Soát Hóa Đơn Điện Tử Grab for Business &amp; Taxi Trả Sau</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Đối chiếu lộ trình, thời gian, mục đích công vụ và hạn mức ngân sách phân bổ phòng ban
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Kỳ Hóa Đơn: Tháng 08/2026
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">Mã Chuyến</th>
                    <th className="px-3 py-2">Nhân Viên &amp; Phòng Ban</th>
                    <th className="px-3 py-2">Thời Gian Đi</th>
                    <th className="px-3 py-2">Lộ Trình (Điểm Đón ➔ Đến)</th>
                    <th className="px-3 py-2">Mục Đích Công Vụ</th>
                    <th className="px-3 py-2 text-right">Chi Phí</th>
                    <th className="px-3 py-2 text-center">Kiểm Tra AI</th>
                    <th className="px-3 py-2 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {corporateRides.map(ride => (
                    <tr key={ride.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-indigo-700">{ride.tripCode}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{ride.employeeName}</div>
                        <span className="text-[10px] text-slate-400">{ride.department}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-600 font-mono">{ride.tripTime}</td>
                      <td className="px-3 py-2.5 text-[11px] max-w-[220px]">
                        <div>{ride.pickupLocation}</div>
                        <div className="text-slate-400">➔ {ride.dropoffLocation}</div>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-700 max-w-[200px]">{ride.businessReason}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">
                        {ride.fareAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {ride.isAfterHours ? (
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Đi ngoài giờ
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[10.5px]">✓ Chuẩn</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          ride.auditStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {ride.auditStatus === 'VERIFIED' ? 'Đã duyệt' : 'Cần rà soát'}
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
          TAB 4: VÉ MÁY BAY, KHÁCH SẠN & QUYẾT TOÁN CÔNG TÁC PHÍ
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'FLIGHTS_HOTELS_PERDIEM' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-purple-600" />
                  <span>Sổ Quản Lý Chuyến Công Tác Xa, Vé Máy Bay &amp; Quyết Toán Phụ Cấp Lưu Trú</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hạn mức tiền vé máy bay, định mức tiền phòng khách sạn và phụ cấp lưu trú Per Diem (300.000 đ/ngày)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {travelClaims.map(claim => (
                <div key={claim.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono font-black text-purple-700 text-xs bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {claim.claimCode}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{claim.travelerName}</span>
                        <span className="text-xs text-slate-500">({claim.department})</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Địa bàn: {claim.destinationCity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">
                        ✈️ Chặng bay: <b>{claim.flightRoute}</b> • Hãng bay: <b>{claim.airlineName}</b> • Mã PNR: <b className="font-mono text-purple-700">{claim.pnrTicketCode}</b>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-bold">Tổng chi phí công tác:</span>
                      <span className="text-base font-black font-mono text-slate-900">
                        {claim.totalActualCost.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10.5px] text-slate-500 block">Đã tạm ứng: {claim.advanceAmountPaid.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  {/* Chi tiết các cấu phần chi phí */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Vé Máy Bay</span>
                      <b className="font-mono text-slate-900">{claim.flightCost.toLocaleString('vi-VN')} đ</b>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Khách Sạn ({claim.hotelNightsCount} đêm)</span>
                      <b className="font-mono text-slate-900">{claim.hotelCost.toLocaleString('vi-VN')} đ</b>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">3. Per Diem ({claim.perDiemDays} ngày)</span>
                      <b className="font-mono text-emerald-700">{(claim.perDiemDays * claim.perDiemDailyRate).toLocaleString('vi-VN')} đ</b>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">4. Quyết Toán</span>
                      <b className={`font-mono ${claim.balanceToSettle >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                        {claim.balanceToSettle >= 0 ? `+${claim.balanceToSettle.toLocaleString('vi-VN')} đ (Chi thêm)` : `${claim.balanceToSettle.toLocaleString('vi-VN')} đ (Hoàn lại)`}
                      </b>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedClaimForModal(claim)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-purple-700 font-bold rounded-lg text-xs border border-purple-200 cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem Phiếu Quyết Toán Chi Tiết</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 5: ĐỊNH MỨC NHIÊN LIỆU, BẢO DƯỠNG & ĐĂNG KIỂM XE
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'FUEL_AND_MAINTENANCE' && (
        <div className="space-y-4 animate-in fade-in">
          {/* CẢNH BÁO ĐẾM NGƯỢC HẠN ĐĂNG KIỂM & BẢO HIỂM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border-2 border-rose-300 bg-rose-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-900 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Sắp Đến Hạn Đăng Kiểm: 61A-888.68 (Toyota Fortuner)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-rose-600 text-white animate-pulse">
                  Còn 23 Ngày
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Hạn kiểm định an toàn kỹ thuật phương tiện: <b>08/10/2026</b> (Trung tâm Đăng kiểm 61-01S Bình Dương). Lái xe cần đưa xe đi đăng kiểm trước ngày 05/10/2026.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 uppercase flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-emerald-600" />
                  <span>Đối Soát Thẻ Xăng Petrolimex Flexicard</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-200 text-emerald-900">
                  Đạt Chuẩn Định Mức
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Toàn bộ 4 xe công ty có mức tiêu hao thực tế so khớp sai lệch &lt; 5% so với định mức tiêu chuẩn L/100km. Không phát hiện thất thoát nhiên liệu.
              </p>
            </div>
          </div>

          {/* DANH SÁCH 4 XE VỚI HỒ SƠ PHÁP LÝ CHI TIẾT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-amber-600" />
                  <span>Sổ Theo Dõi Pháp Lý, Định Mức Nhiên Liệu &amp; Đăng Kiểm Đội Xe</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Chỉ số công-tơ-mét Odometer, định mức xăng dầu, hạn đăng kiểm và bảo hiểm TNDS/thân vỏ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vehicles.map(veh => (
                <div key={veh.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-black text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {veh.plateNumber}
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs mt-1">{veh.vehicleModel}</h5>
                      <span className="text-[10.5px] text-slate-500">{veh.assignedDepartment}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {veh.typeLabel}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Định mức tiêu hao:</span>
                      <b className="font-mono text-slate-900">{veh.fuelQuotaPer100Km} L/100km ({veh.fuelType})</b>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Đồng hồ Odometer:</span>
                      <b className="font-mono text-indigo-700">{veh.currentOdometerKm.toLocaleString('vi-VN')} km</b>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Hạn đăng kiểm:</span>
                      <b className="font-mono text-rose-700 font-bold">{veh.inspectionExpiry}</b>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Hạn bảo hiểm TNDS:</span>
                      <b className="font-mono text-slate-700">{veh.insuranceExpiry}</b>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-500">Lái xe: <b>{veh.assignedDriver}</b> ({veh.driverPhone})</span>
                    <button
                      type="button"
                      onClick={() => setSelectedVehicleForInspection(veh)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10.5px] border border-slate-300 cursor-pointer flex items-center gap-1"
                    >
                      <FileCheck2 className="w-3 h-3 text-indigo-600" />
                      <span>Xem Sổ Đăng Kiểm</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 6: BÁO CÁO PHÂN TÍCH CHI PHÍ ĐI LẠI 360°
      ════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'TRAVEL_ANALYTICS' && (
        <div className="space-y-4 animate-in fade-in">
          {/* CƠ CẤU CHI PHÍ ĐI LẠI TOÀN DOANH NGHIỆP */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-rose-600" />
                  <span>Cơ Cấu Chi Phí Đi Lại Doanh Nghiệp Tháng 08/2026 ({(kpiStats.totalTravelCostMonth / 1000000).toFixed(1)} Triệu Đồng)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tỷ trọng phân bổ giữa tuyến xe đưa đón công nhân, xe công ty, Grab Corporate và vé máy bay
                </p>
              </div>
            </div>

            {/* Thanh Bar Tỷ Trọng Chi Phí (Stacked Bar) */}
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded-xl overflow-hidden flex shadow-inner">
                <div style={{ width: '62.5%' }} className="bg-blue-600" title="Tuyến Xe Bus Đưa Đón: 59.0 triệu (62.5%)"></div>
                <div style={{ width: '16.3%' }} className="bg-indigo-600" title="Xăng & Bảo Trì Xe Cty: 15.4 triệu (16.3%)"></div>
                <div style={{ width: '13.6%' }} className="bg-purple-600" title="Vé Máy Bay & Khách Sạn: 12.8 triệu (13.6%)"></div>
                <div style={{ width: '7.6%' }} className="bg-emerald-500" title="Grab for Business / Taxi: 7.2 triệu (7.6%)"></div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-blue-600"></span> Xe Bus Tuyến Công Nhân (59.0 tr - 62.5%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-indigo-600"></span> Xăng Xe &amp; Bảo Dưỡng Cty (15.4 tr - 16.3%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-purple-600"></span> Vé Máy Bay &amp; Khách Sạn (12.8 tr - 13.6%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500"></span> Grab / Taxi Doanh Nghiệp (7.2 tr - 7.6%)
                </span>
              </div>
            </div>

            {/* BẢNG PHÂN BỔ CHI PHÍ THEO PHÒNG BAN */}
            <div className="pt-2">
              <h4 className="text-xs font-black uppercase text-slate-800 mb-2">Phân Bổ Chi Phí Đi Lại Theo Phòng Ban:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Khối Sản Xuất &amp; Nhà Máy</span>
                  <div className="text-base font-black text-slate-900 font-mono">59.000.000 đ</div>
                  <span className="text-[10px] text-slate-500">3 Tuyến xe đưa đón công nhân</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Phòng Kinh Doanh &amp; Sales</span>
                  <div className="text-base font-black text-indigo-700 font-mono">14.650.000 đ</div>
                  <span className="text-[10px] text-slate-500">Grab, Fortuner &amp; Công tác tỉnh</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Ban Tổng Giám Đốc</span>
                  <div className="text-base font-black text-purple-700 font-mono">12.500.000 đ</div>
                  <span className="text-[10px] text-slate-500">Carnival đón chuyên gia &amp; Vé máy bay</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Phòng Kỹ Thuật, QA &amp; Kho</span>
                  <div className="text-base font-black text-emerald-700 font-mono">8.250.000 đ</div>
                  <span className="text-[10px] text-slate-500">Bán tải Ranger &amp; Hải quan cảng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 1: ĐĂNG KÝ YÊU CẦU XE CÔNG TÁC MỚI
      ════════════════════════════════════════════════════════════ */}
      {showCreateBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Car className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm">Đăng Ký Sử Dụng Xe Công Tác Mới</h3>
              </div>
              <button onClick={() => setShowCreateBookingModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Người Đăng Ký:</label>
                  <select
                    value={newBookingForm.requestedBy}
                    onChange={e => {
                      const emp = employees.find(x => x.fullName === e.target.value);
                      setNewBookingForm({
                        ...newBookingForm,
                        requestedBy: e.target.value,
                        department: emp?.departmentName || 'Phòng Phát Triển Thị Trường'
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
                  <label className="font-bold text-slate-700 block mb-1">Số Lượng Người Đi:</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={newBookingForm.passengerCount}
                    onChange={e => setNewBookingForm({ ...newBookingForm, passengerCount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mục Đích Đi Công Tác:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Đưa đón đối tác khách hàng, làm việc hải quan, giao hàng mẫu..."
                  value={newBookingForm.purpose}
                  onChange={e => setNewBookingForm({ ...newBookingForm, purpose: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lộ Trình Tuyến Đường (Điểm Đi ➔ Điểm Đến):</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ghi rõ địa chỉ đón và các điểm đến trong chuyến đi..."
                  value={newBookingForm.destinationRoute}
                  onChange={e => setNewBookingForm({ ...newBookingForm, destinationRoute: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ Khởi Hành:</label>
                  <input
                    type="text"
                    placeholder="VD: 08:30 16/09/2026"
                    value={newBookingForm.departureTime}
                    onChange={e => setNewBookingForm({ ...newBookingForm, departureTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ Dự Kiến Về:</label>
                  <input
                    type="text"
                    placeholder="VD: 17:00 16/09/2026"
                    value={newBookingForm.returnTime}
                    onChange={e => setNewBookingForm({ ...newBookingForm, returnTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chọn Phương Tiện Đề Xuất:</label>
                <select
                  value={newBookingForm.vehicleId}
                  onChange={e => setNewBookingForm({ ...newBookingForm, vehicleId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none font-bold text-slate-800 bg-white"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleModel} - {v.plateNumber} (Tài xế: {v.assignedDriver})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateBookingModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Duyệt &amp; Điều Xe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 2: IN LỆNH ĐIỀU XE ĐI CÔNG TÁC A4 CHUẨN PHÁP LÝ
      ════════════════════════════════════════════════════════════ */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Lệnh Điều Xe Ô Tô Đi Công Tác (Mẫu In A4)
                </h3>
              </div>
              <button onClick={() => setSelectedOrderForPrint(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif leading-relaxed text-slate-900 bg-white">
              <div className="border-b pb-3 text-center">
                <p className="font-bold text-xs uppercase">{policy.companyName}</p>
                <h2 className="text-base font-bold uppercase mt-1 text-slate-900">
                  LỆNH ĐIỀU XE Ô TÔ ĐI CÔNG TÁC
                </h2>
                <p className="text-[10.5px] italic text-slate-500">Mã lệnh: {selectedOrderForPrint.orderCode} • Ngày duyệt: {selectedOrderForPrint.departureTime}</p>
              </div>

              <div className="space-y-2 text-[11px]">
                <p><b>1. Đơn vị đề xuất:</b> {selectedOrderForPrint.department} (Người đăng ký: {selectedOrderForPrint.requestedBy})</p>
                <p><b>2. Mục đích chuyến đi:</b> {selectedOrderForPrint.purpose}</p>
                <p><b>3. Lộ trình công tác:</b> {selectedOrderForPrint.destinationRoute}</p>
                <p><b>4. Phương tiện điều động:</b> {selectedOrderForPrint.vehicleName}</p>
                <p><b>5. Lái xe phụ trách:</b> {selectedOrderForPrint.driverName} (SĐT: {selectedOrderForPrint.driverPhone})</p>
                <p><b>6. Thời gian phục vụ:</b> Từ {selectedOrderForPrint.departureTime} đến {selectedOrderForPrint.returnTime}</p>
                <p><b>7. Danh sách nhân sự đi xe ({selectedOrderForPrint.passengerCount} người):</b> {selectedOrderForPrint.passengerNames.join(', ')}</p>
                <div className="p-2 bg-slate-50 rounded border border-slate-200 mt-2 font-mono text-[10.5px]">
                  <div>• Chỉ số công-tơ-mét khi đi: .............. km • Giờ xe ra cổng: ..............</div>
                  <div>• Chỉ số công-tơ-mét khi về: .............. km • Giờ xe vào cổng: ..............</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center pt-8 mt-6 border-t text-[10px]">
                <div>
                  <p className="font-bold uppercase">Người Đi Xe</p>
                  <p className="italic text-slate-400 mt-10">(Ký tên)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Lái Xe</p>
                  <p className="italic text-slate-400 mt-10">{selectedOrderForPrint.driverName}</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Bảo Vệ Cổng</p>
                  <p className="italic text-slate-400 mt-10">(Ký xác nhận km)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Phòng Hành Chính</p>
                  <p className="italic text-slate-400 mt-10">Trần Việt Hùng</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Mẫu in A4 chuẩn lưu hồ sơ thanh toán xăng dầu</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPrint(null)}
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
                  <span>In Lệnh Điều Xe Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 3: XEM SỔ ĐĂNG KIỂM & PHÁP LÝ XE A4
      ════════════════════════════════════════════════════════════ */}
      {selectedVehicleForInspection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Giấy Chứng Nhận Kiểm Định Kỹ Thuật &amp; Bảo Vệ Môi Trường (A4)
                </h3>
              </div>
              <button onClick={() => setSelectedVehicleForInspection(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif leading-relaxed text-slate-900 bg-white">
              <div className="border-b pb-3 text-center">
                <p className="font-bold text-[10px] uppercase text-slate-500">CỤC ĐĂNG KIỂM VIỆT NAM</p>
                <h2 className="text-sm font-bold uppercase mt-1 text-slate-900">
                  GIẤY CHỨNG NHẬN KIỂM ĐỊNH AN TOÀN KỸ THUẬT XE CƠ GIỚI
                </h2>
                <p className="text-[10.5px] italic text-slate-500">Biển số đăng ký: {selectedVehicleForInspection.plateNumber}</p>
              </div>

              <div className="space-y-2 text-[11px]">
                <p><b>1. Nhãn hiệu / Kiểu loại:</b> {selectedVehicleForInspection.vehicleModel}</p>
                <p><b>2. Chủ phương tiện:</b> {policy.companyName}</p>
                <p><b>3. Số chỗ ngồi cho phép:</b> {selectedVehicleForInspection.seatingCapacity} chỗ</p>
                <p><b>4. Loại nhiên liệu:</b> {selectedVehicleForInspection.fuelType}</p>
                <p><b>5. Đơn vị đăng kiểm:</b> Trung Tâm Đăng Kiểm Xe Cơ Giới 61-01S Tỉnh Bình Dương</p>
                <p><b>6. Thời hạn hiệu lực giấy chứng nhận:</b> Đến ngày <b className="font-mono text-rose-700">{selectedVehicleForInspection.inspectionExpiry}</b></p>
                <p><b>7. Thời hạn bảo hiểm TNDS &amp; Thân vỏ:</b> Đến ngày <b className="font-mono text-indigo-700">{selectedVehicleForInspection.insuranceExpiry}</b></p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center pt-8 mt-6 border-t text-[11px]">
                <div>
                  <p className="font-bold uppercase">Lái Xe Phụ Trách</p>
                  <p className="italic text-slate-400 mt-10">{selectedVehicleForInspection.assignedDriver}</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Thủ Trưởng Đơn Vị Đăng Kiểm</p>
                  <p className="italic text-slate-400 mt-10">(Ký và đóng dấu đỏ)</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Hồ sơ lưu trữ quản lý xe công ty</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedVehicleForInspection(null)}
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
                  <span>In Hồ Sơ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          MODAL 4: XEM BẢNG THANH TOÁN QUYẾT TOÁN CÔNG TÁC PHÍ A4
      ════════════════════════════════════════════════════════════ */}
      {selectedClaimForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Bảng Thanh Toán Quyết Toán Công Tác Phí (A4)
                </h3>
              </div>
              <button onClick={() => setSelectedClaimForModal(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-serif leading-relaxed text-slate-900 bg-white">
              <div className="border-b pb-3 text-center">
                <p className="font-bold text-xs uppercase">{policy.companyName}</p>
                <h2 className="text-base font-bold uppercase mt-1 text-slate-900">
                  GIẤY THANH TOÁN TIỀN CÔNG TÁC PHÍ
                </h2>
                <p className="text-[10.5px] italic text-slate-500">Mã chứng từ: {selectedClaimForModal.claimCode}</p>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <p><b>Họ và tên người đi công tác:</b> {selectedClaimForModal.travelerName}</p>
                <p><b>Bộ phận / Phòng ban:</b> {selectedClaimForModal.department}</p>
                <p><b>Địa điểm đến công tác:</b> {selectedClaimForModal.destinationCity}</p>
                <p><b>Chặng bay &amp; Mã vé PNR:</b> {selectedClaimForModal.flightRoute} ({selectedClaimForModal.pnrTicketCode})</p>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2">Khoản Mục Chi Phí</th>
                      <th className="p-2 text-right">Số Tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2">1. Tiền vé máy bay khứ hồi ({selectedClaimForModal.airlineName})</td>
                      <td className="p-2 text-right font-mono">{selectedClaimForModal.flightCost.toLocaleString('vi-VN')} đ</td>
                    </tr>
                    <tr>
                      <td className="p-2">2. Tiền thuê phòng khách sạn ({selectedClaimForModal.hotelNightsCount} đêm)</td>
                      <td className="p-2 text-right font-mono">{selectedClaimForModal.hotelCost.toLocaleString('vi-VN')} đ</td>
                    </tr>
                    <tr>
                      <td className="p-2">3. Phụ cấp lưu trú Per Diem ({selectedClaimForModal.perDiemDays} ngày x {selectedClaimForModal.perDiemDailyRate.toLocaleString('vi-VN')} đ)</td>
                      <td className="p-2 text-right font-mono">{(selectedClaimForModal.perDiemDays * selectedClaimForModal.perDiemDailyRate).toLocaleString('vi-VN')} đ</td>
                    </tr>
                    <tr>
                      <td className="p-2">4. Chi phí taxi &amp; di chuyển địa phương</td>
                      <td className="p-2 text-right font-mono">{selectedClaimForModal.localTaxiCost.toLocaleString('vi-VN')} đ</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2">TỔNG CHI PHÍ THỰC TẾ (A)</td>
                      <td className="p-2 text-right font-mono text-indigo-900">{selectedClaimForModal.totalActualCost.toLocaleString('vi-VN')} đ</td>
                    </tr>
                    <tr>
                      <td className="p-2">Số tiền đã tạm ứng trước khi đi (B)</td>
                      <td className="p-2 text-right font-mono">{selectedClaimForModal.advanceAmountPaid.toLocaleString('vi-VN')} đ</td>
                    </tr>
                    <tr className="bg-purple-50 font-black">
                      <td className="p-2">SỐ TIỀN CẦN QUYẾT TOÁN (A - B)</td>
                      <td className="p-2 text-right font-mono text-purple-900">
                        {selectedClaimForModal.balanceToSettle >= 0 ? `Công ty chi thêm: ${selectedClaimForModal.balanceToSettle.toLocaleString('vi-VN')} đ` : `Hoàn trả lại quỹ: ${Math.abs(selectedClaimForModal.balanceToSettle).toLocaleString('vi-VN')} đ`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-8 mt-6 border-t text-[10.5px]">
                <div>
                  <p className="font-bold uppercase">Người Thanh Toán</p>
                  <p className="italic text-slate-400 mt-10">{selectedClaimForModal.travelerName}</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Kế Toán Thanh Toán</p>
                  <p className="italic text-slate-400 mt-10">(Ký duyệt)</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Giám Đốc Duyệt</p>
                  <p className="italic text-slate-400 mt-10">Trần Việt Hùng</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Mẫu chứng từ kế toán thanh toán công tác phí</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaimForModal(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Giấy Thanh Toán</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
