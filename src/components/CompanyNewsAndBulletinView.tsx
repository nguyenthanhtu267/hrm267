import { FormattedNumberInput } from './FormattedNumberInput';
import React, { useState, useMemo } from 'react';
import { SmartEmployeeCardModal } from './SmartEmployeeCardModal';
import { SmartBadgeBatchPrintModal } from './SmartBadgeBatchPrintModal';
import { SmartBadgePrintingHubModal } from './SmartBadgePrintingHubModal';
import { initialReissueRequests, BadgeReissueRequest } from '../services/smartBadgeService';
import { SmartBadgeConfig, initialSmartBadges } from '../services/smartBadgeService';
import { CompanyPolicy, Employee, UserRole } from '../types/hrm';
import { 
  Megaphone, 
  HeartHandshake, 
  Trophy, 
  Flame, 
  Cake, 
  Bell, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Download, 
  Heart, 
  Award, 
  Star, 
  Gift, 
  Eye, 
  Sparkles,
  DollarSign,
  Vote,
  Medal,
  Smile,
  Lock,
  BarChart2,
  Send,
  HelpCircle,
  ThumbsUp,
  Printer,
  Plus,
  X,
  UserPlus,
  Users,
  CreditCard,
  QrCode,
  Check,
  Laptop,
  Mail,
  MapPin,
  ShieldCheck,
  Crown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Utensils
} from 'lucide-react';

interface CompanyNewsAndBulletinViewProps {
  policy: CompanyPolicy;
  employees: Employee[];
  currentRole: UserRole;
  onOpenMealPassModal?: () => void;
}

export type BulletinSubTab = 
  | 'OFFICIAL_NEWS'        // 1. Bản Tin & Thông Cáo Doanh Nghiệp
  | 'NEW_HIRES'            // 2. Chào Đón Thành Viên Mới
  | 'UNION_AND_CHARITY'     // 3. Công Đoàn Cơ Sở & Quỹ Tấm Lòng Vàng
  | 'RECOGNITION_AWARDS'    // 3. Khen Thưởng
  | 'SPORTS_AND_TALENTS'    // 4. Cuộc Thi
  | 'BIRTHDAYS_AND_FUN'     // 5. Góc Chúc Mừng Sinh Nhật & Tương Tác Vui
  | 'HAPPINESS_SURVEY';     // 6. Khảo Sát Chỉ Số Hạnh Phúc (Bảo Mật HR)

export const CompanyNewsAndBulletinView: React.FC<CompanyNewsAndBulletinViewProps> = ({
  policy,
  employees,
  currentRole,
  onOpenMealPassModal
}) => {
  const [activeTab, setActiveTab] = useState<BulletinSubTab>('OFFICIAL_NEWS');
  // Quản lý cấp thẻ từ thông minh, phân quyền và in thẻ nhân viên kèm mã QR Zalo
  const [badgesMap, setBadgesMap] = useState<Record<string, SmartBadgeConfig>>(initialSmartBadges);
  const [selectedBadgeToView, setSelectedBadgeToView] = useState<SmartBadgeConfig | null>(null);
  const [showReissueModal, setShowReissueModal] = useState<boolean>(false);
  const [showPrintingHubModal, setShowPrintingHubModal] = useState<boolean>(false);
  const [printingHubInitialTab, setPrintingHubInitialTab] = useState<'NEW_EMPLOYEES' | 'REISSUE_REQUESTS'>('NEW_EMPLOYEES');
  const [printingHubBadgeToView, setPrintingHubBadgeToView] = useState<SmartBadgeConfig | null>(null);
  const [reissueRequests, setReissueRequests] = useState<BadgeReissueRequest[]>(initialReissueRequests);

  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth'
      });
    }
  };

  // -------------------------------------------------------------
  // DỮ LIỆU TIẾP NHẬN & CHÀO MỪNG NHÂN SỰ MỚI HÔM NAY (ONBOARDING SHOWCASE)
  // Cấp Trưởng phòng trở lên có khung vinh danh lớn hơn, trang trọng, trang nghiêm
  // -------------------------------------------------------------
  const [congratsCount, setCongratsCount] = useState<Record<string, number>>({
    'NH-VIP-01': 86,
    'NH-EMP-01': 42,
    'NH-EMP-02': 38,
  });
  const [userCongratulated, setUserCongratulated] = useState<Set<string>>(new Set());

  const handleSendCongrats = (id: string) => {
    if (userCongratulated.has(id)) {
      setUserCongratulated(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setCongratsCount(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 1) - 1) }));
    } else {
      setUserCongratulated(prev => new Set(prev).add(id));
      setCongratsCount(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    }
  };

  const todayNewHires = [
    {
      id: 'NH-VIP-01',
      fullName: 'ÔNG HOÀNG VĂN BÁCH',
      position: 'TRƯỞNG PHÒNG CÔNG NGHỆ THÔNG TIN & CHUYỂN ĐỔI SỐ',
      department: 'Phòng Công Nghệ & Tự Động Hóa Doanh Nghiệp',
      isManagerLevel: true, // Cấp Trưởng phòng trở lên: Ô lớn gấp đôi, trang trọng, màu vàng kim
      startDate: 'Hôm nay (09/09/2026)',
      avatarInitial: 'HB',
      executiveGreeting: 'Ban Giám Đốc cùng toàn thể CB-CNV nhiệt liệt chúc mừng và trân trọng chào đón Tân Trưởng Phòng gia nhập đội ngũ cán bộ quản lý chủ chốt của Công ty! Tin tưởng rằng với bề dày năng lực và tầm nhìn chiến lược, Anh sẽ dẫn dắt bộ phận bứt phá chuyển đổi số, tối ưu hóa vận hành nhà máy và gặt hái nhiều thắng lợi vẻ vang!',
      facilities: {
        seating: 'Phòng Làm Việc Riêng P.302 - Tầng 3 Trụ Sở Chính (Đã hoàn thiện biển tên & bàn làm việc)',
        computer: 'Laptop Dell Precision 5570 (Core i7-12800H, 32GB RAM, 1TB SSD NVMe) + Màn hình rời Dell UltraSharp 27 inch 4K',
        email: 'bach.hoang@antfood.vn (Đã cấu hình quyền Quản trị hệ thống & Cấp chữ ký số điện tử)',
        badge: 'Thẻ từ VIP nhận diện 24/7 kiểm soát ra vào cơ quan & Thẻ đỗ xe Ô tô riêng ô số B2-08',
      },
      welcomeHost: 'Tổng Giám Đốc & Giám Đốc Nhân Sự trực tiếp tiếp đón & bàn giao phòng làm việc',
      status: 'READY' as const
    },
    {
      id: 'NH-EMP-01',
      fullName: 'BÀ NGUYỄN THU HÀ',
      position: 'Chuyên Viên Phân Tích Dữ Liệu C&B',
      department: 'Phòng Nhân Sự',
      isManagerLevel: false,
      startDate: 'Hôm nay (09/09/2026)',
      avatarInitial: 'TH',
      facilities: {
        seating: 'Bàn HR-06 (Tầng 2 Khối Văn Phòng Trụ Sở)',
        computer: 'Laptop Lenovo ThinkPad T14 (Core i5, 16GB RAM)',
        email: 'ha.nguyen@antfood.vn (Đã mở hộp thư công vụ)',
        badge: 'Thẻ nhân viên thẻ từ & Thẻ giữ xe máy B1-42'
      },
      welcomeHost: 'Trưởng Nhóm C&B hướng dẫn hội nhập'
    },
    {
      id: 'NH-EMP-02',
      fullName: 'ÔNG TRẦN THANH BÌNH',
      position: 'Kỹ Sư Vận Hành Dây Chuyền Chiết Rót',
      department: 'Xưởng Sản Xuất 1 - Khối Nhà Máy',
      isManagerLevel: false,
      startDate: 'Hôm nay (09/09/2026)',
      avatarInitial: 'TB',
      facilities: {
        seating: 'Phòng Kỹ Thuật Điều Hành Xưởng 1',
        computer: 'Máy trạm công nghiệp IPC Scada Xưởng 1',
        email: 'binh.tran@antfood.vn',
        badge: 'Thẻ quẹt ca xưởng, Đồng phục bảo hộ & Giày mũi thép'
      },
      welcomeHost: 'Quản Đốc Phân Xưởng 1 kèm cặp hội nhập'
    }
  ];

  // -------------------------------------------------------------
  // 1. DỮ LIỆU BẢN TIN & THÔNG CÁO DOANH NGHIỆP
  // -------------------------------------------------------------
  const [readNotices, setReadNotices] = useState<Set<string>>(new Set(['TB-02']));
  const [newsFilter, setNewsFilter] = useState<'ALL' | 'URGENT' | 'POLICY' | 'STANDARDS'>('ALL');

  const officialNotices = [
    {
      id: 'TB-01',
      type: 'URGENT',
      badge: 'Khẩn Cấp / Quan Trọng',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      title: 'Thông báo Lịch nghỉ Lễ Quốc Khánh 02/09 & Chế độ tiền lương đi làm thêm giờ',
      date: '2026-08-20',
      author: 'Ban Giám Đốc & Phòng HCNS',
      summary: 'Toàn thể CB-CNV được nghỉ 04 ngày liên tục từ Thứ Năm (03/09) đến hết Chủ Nhật (06/09). Các vị trí trực vận hành ca kíp nhà máy được hưởng 300% lương theo Điều 98 BLLĐ 2019 kèm 01 suất quà lễ.',
      hasAttachment: true,
      attachmentName: 'Thong_Bao_Nghi_Le_02_09_2026.pdf',
      views: 1248,
      isPinned: true
    },
    {
      id: 'TB-02',
      type: 'POLICY',
      badge: 'Chính Sách Mới',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'Ban hành Nội quy lao động sửa đổi bổ sung 2026 & Quy chế làm việc Hybrid',
      date: '2026-08-15',
      author: 'Phòng Nhân Sự',
      summary: 'Bổ sung quyền đăng ký làm việc trực tuyến linh hoạt Thứ Bảy (Online Remote) cho khối văn phòng gián tiếp; Chuẩn hóa quy định bảo mật thông tin và an toàn vệ sinh lao động tại các nhà máy.',
      hasAttachment: true,
      attachmentName: 'Noi_Quy_Lao_Dong_Sua_Doi_2026.pdf',
      views: 980,
      isPinned: false
    },
    {
      id: 'TB-03',
      type: 'STANDARDS',
      badge: 'Tiêu Chuẩn & Cải Tiến',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'Phát động Chiến dịch 5S Toàn diện & Tiêu chuẩn Xanh ISO 14001:2026 tại Nhà máy',
      date: '2026-08-10',
      author: 'Ban An Toàn & Ban Giám Đốc Nhà Máy',
      summary: 'Triển khai Sàng lọc - Sắp xếp - Sạch sẽ - Săn sóc - Sẵn sàng tại 100% phân xưởng. Bộ phận đạt điểm đánh giá 5S cao nhất tháng sẽ được thưởng nóng 5.000.000đ.',
      hasAttachment: true,
      attachmentName: 'Huong_Dan_Thuc_Hien_5S_Nha_May.pdf',
      views: 845,
      isPinned: false
    },
    {
      id: 'TB-04',
      type: 'POLICY',
      badge: 'Chính Sách Mới',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'Quy chế bồi dưỡng hiện vật bằng sữa tươi và nước ép cho công nhân độc hại (TT 24/2022)',
      date: '2026-08-01',
      author: 'Phòng C&B & Bộ Phận Y Tế',
      summary: 'Từ 01/08/2026, toàn bộ công nhân Phân Xưởng Chế Biến, Nhiệt Hóa, Cơ Điện được cấp phát hiện vật trực tiếp tại giữa ca làm việc theo 4 định mức chuẩn (13k - 20k - 26k - 32k/ngày).',
      hasAttachment: true,
      attachmentName: 'Quy_Dinh_Cap_Phat_Hien_Vat_2026.pdf',
      views: 1102,
      isPinned: false
    }
  ];

  const filteredNotices = useMemo(() => {
    if (newsFilter === 'ALL') return officialNotices;
    return officialNotices.filter(n => n.type === newsFilter);
  }, [newsFilter]);

  // -------------------------------------------------------------
  // 2. DỮ LIỆU CÔNG ĐOÀN CƠ SỞ & QUỸ TẤM LÒNG VÀNG
  // -------------------------------------------------------------
  const unionPrograms = [
    {
      title: 'Chăm lo Tết Trung Thu 2026 cho con em CB-CNV',
      status: 'Đang triển khai',
      statusColor: 'bg-amber-100 text-amber-800',
      desc: 'Tặng 1.450 phần quà bánh trung thu + lồng đèn cho các bé dưới 15 tuổi. Tổ chức Đêm hội Trăng rằm tại khuôn viên nhà máy.',
      budget: '145.000.000 đ',
      icon: Gift
    },
    {
      title: 'Hỗ trợ vé xe sum họp Tết Nguyên Đán 2027 cho công nhân xa quê',
      status: 'Đã phê duyệt ngân sách',
      statusColor: 'bg-emerald-100 text-emerald-800',
      desc: 'Hỗ trợ 100% vé xe khứ hồi hoặc 500.000 đ/người cho công nhân các tỉnh miền Trung, miền Bắc có hoàn cảnh khó khăn.',
      budget: '320.000.000 đ',
      icon: HeartHandshake
    },
    {
      title: 'Tặng quà Chúc mừng ngày Phụ nữ Việt Nam 20/10',
      status: 'Kế hoạch sắp tới',
      statusColor: 'bg-blue-100 text-blue-800',
      desc: 'Món quà tri ân và hoa tươi gửi tặng 780 nữ cán bộ công nhân viên toàn công ty.',
      budget: '156.000.000 đ',
      icon: Sparkles
    }
  ];

  const unionFinance = [
    { month: 'Tháng 08/2026', income: 128500000, expense: 94200000, balance: 34300000, majorExpense: 'Thăm hỏi ốm đau (18 ca), Quà sinh nhật đoàn viên, Hỗ trợ khó khăn' },
    { month: 'Tháng 07/2026', income: 127200000, expense: 88500000, balance: 38700000, majorExpense: 'Phần thưởng học sinh giỏi cho con CB-CNV (215 cháu), Thể thao' },
    { month: 'Tháng 06/2026', income: 126800000, expense: 112000000, balance: 14800000, majorExpense: 'Tết Thiếu nhi 1/6, Hội thao công nhân viên chức lao động' }
  ];

  
  // ========================================================
  // DỮ LIỆU ĐĂNG KÝ CÔNG ĐOÀN, HƯỞNG PHÚC LỢI & QUỸ TẤM LÒNG VÀNG
  // ========================================================
  interface UnionApplication {
    id: string;
    empName: string;
    empId: string;
    dept: string;
    applyDate: string;
    consentDuesDeduction: boolean;
    status: 'PENDING' | 'APPROVED';
  }

  interface UnionBenefitClaim {
    id: string;
    empName: string;
    empId: string;
    dept: string;
    benefitType: 'WEDDING' | 'CHILD_BIRTH' | 'HOSPITALIZATION' | 'BEREAVEMENT' | 'SCHOLARSHIP' | 'EMERGENCY_AID';
    benefitName: string;
    amount: number;
    eventDate: string;
    attachedDocNote: string;
    status: 'SUBMITTED' | 'APPROVED_PAID';
    approvedDate?: string;
  }

  interface BenevolentClaim {
    id: string;
    beneficiaryName: string;
    beneficiaryEmpId: string;
    dept: string;
    submissionChannel: 'SELF' | 'TWO_COWORKERS' | 'DEPT_MANAGER';
    channelLabel: string;
    submitterInfo: string;
    reason: string;
    proposedAmount: number;
    status: 'SUBMITTED' | 'APPROVED_DISBURSED';
    disbursedDate?: string;
  }

  const [unionApplications, setUnionApplications] = useState<UnionApplication[]>([
    {
      id: 'CD-2026-001',
      empName: 'Hoàng Thị Yến',
      empId: 'AV-0812',
      dept: 'Phân Xưởng Đóng Gói',
      applyDate: '26/08/2026',
      consentDuesDeduction: true,
      status: 'APPROVED'
    },
    {
      id: 'CD-2026-002',
      empName: 'Trịnh Quốc Bảo',
      empId: 'AV-0845',
      dept: 'Khối Kỹ Thuật Cơ Điện',
      applyDate: '28/08/2026',
      consentDuesDeduction: true,
      status: 'PENDING'
    }
  ]);

  const [unionBenefitClaims, setUnionBenefitClaims] = useState<UnionBenefitClaim[]>([
    {
      id: 'PL-2026-001',
      empName: 'Phan Văn Hải',
      empId: 'AV-0391',
      dept: 'Phân Xưởng Chế Biến',
      benefitType: 'CHILD_BIRTH',
      benefitName: 'Chúc Mừng Sinh Con (1.000.000 đ)',
      amount: 1000000,
      eventDate: '22/08/2026',
      attachedDocNote: 'Giấy chứng sinh BV Hạnh Phúc',
      status: 'APPROVED_PAID',
      approvedDate: '24/08/2026'
    },
    {
      id: 'PL-2026-002',
      empName: 'Lê Thị Thu Cúc',
      empId: 'AV-0522',
      dept: 'Khối Văn Phòng',
      benefitType: 'WEDDING',
      benefitName: 'Quà Mừng Kết Hôn (1.000.000 đ)',
      amount: 1000000,
      eventDate: '30/08/2026',
      attachedDocNote: 'Giấy chứng nhận đăng ký kết hôn',
      status: 'SUBMITTED'
    },
    {
      id: 'PL-2026-003',
      empName: 'Bùi Đức Trọng',
      empId: 'AV-0412',
      dept: 'Kho Vận & Logistics',
      benefitType: 'HOSPITALIZATION',
      benefitName: 'Thăm Hỏi Nằm Viện > 3 Ngày (500.000 đ)',
      amount: 500000,
      eventDate: '27/08/2026',
      attachedDocNote: 'Giấy ra viện BV Đa Khoa Tỉnh',
      status: 'SUBMITTED'
    }
  ]);

  const [benevolentClaims, setBenevolentClaims] = useState<BenevolentClaim[]>([
    {
      id: 'TL-2026-001',
      beneficiaryName: 'Trần Văn Nam',
      beneficiaryEmpId: 'AV-0482',
      dept: 'Phân Xưởng Cơ Điện',
      submissionChannel: 'DEPT_MANAGER',
      channelLabel: 'Quản lý trực tiếp lập tờ trình',
      submitterInfo: 'Anh Phạm Hữu Thắng (Quản Đốc Phân Xưởng)',
      reason: 'Gia đình bị thiệt hại do hỏa hoạn nhà trọ, bản thân bị bỏng nhẹ khi cứu hộ tài sản.',
      proposedAmount: 15000000,
      status: 'APPROVED_DISBURSED',
      disbursedDate: '15/08/2026'
    },
    {
      id: 'TL-2026-002',
      beneficiaryName: 'Nguyễn Thị Hằng',
      beneficiaryEmpId: 'AV-0704',
      dept: 'Phân Xưởng Chế Biến',
      submissionChannel: 'TWO_COWORKERS',
      channelLabel: '02 Đồng nghiệp cùng ca làm đơn hộ',
      submitterInfo: 'Chị Lê Thị Mai (AV-0688) & Anh Vũ Văn Hùng (AV-0690)',
      reason: 'Con nhỏ 2 tuổi phát hiện mắc bệnh tim bẩm sinh cần phẫu thuật gấp, gia cảnh khó khăn.',
      proposedAmount: 20000000,
      status: 'SUBMITTED'
    }
  ]);

  // Modals
  const [showUnionAppModal, setShowUnionAppModal] = useState(false);
  const [showPrintUnionAppModal, setShowPrintUnionAppModal] = useState<UnionApplication | null>(null);

  const [showBenefitClaimModal, setShowBenefitClaimModal] = useState(false);
  const [showPrintBenefitReceiptModal, setShowPrintBenefitReceiptModal] = useState<UnionBenefitClaim | null>(null);

  const [showBenevolentClaimModal, setShowBenevolentClaimModal] = useState(false);
  const [showPrintBenevolentReceiptModal, setShowPrintBenevolentReceiptModal] = useState<BenevolentClaim | null>(null);

  // Forms
  const [newUnionAppForm, setNewUnionAppForm] = useState({
    empName: '',
    empId: '',
    dept: 'Phân Xưởng Chế Biến',
    consentDuesDeduction: true
  });

  const [newBenefitClaimForm, setNewBenefitClaimForm] = useState({
    empName: '',
    empId: '',
    dept: 'Phân Xưởng Chế Biến',
    benefitType: 'WEDDING' as 'WEDDING' | 'CHILD_BIRTH' | 'HOSPITALIZATION' | 'BEREAVEMENT' | 'SCHOLARSHIP' | 'EMERGENCY_AID',
    amount: 1000000,
    eventDate: new Date().toISOString().split('T')[0],
    attachedDocNote: ''
  });

  const [newBenevolentClaimForm, setNewBenevolentClaimForm] = useState({
    beneficiaryName: '',
    beneficiaryEmpId: '',
    dept: 'Phân Xưởng Chế Biến',
    submissionChannel: 'TWO_COWORKERS' as 'SELF' | 'TWO_COWORKERS' | 'DEPT_MANAGER',
    coworker1: '',
    coworker2: '',
    managerInfo: '',
    reason: '',
    proposedAmount: 15000000
  });

  // Action Handlers
  const handleApproveBenefitClaim = (claimId: string) => {
    const claim = unionBenefitClaims.find(c => c.id === claimId);
    if (!claim) return;
    if (unionFundBalance < claim.amount) {
      alert('⚠️ Tồn quỹ công đoàn hiện tại không đủ để chi khoản này!');
      return;
    }

    setUnionFundBalance(prev => prev - claim.amount);
    setUnionBenefitClaims(prev => prev.map(c => c.id === claimId ? {
      ...c,
      status: 'APPROVED_PAID',
      approvedDate: new Date().toLocaleDateString('vi-VN')
    } : c));

    alert('✓ Phê duyệt chi tiền phúc lợi công đoàn thành công! Tồn quỹ công đoàn đã tự động trừ ' + claim.amount.toLocaleString('vi-VN') + ' đ. Bạn có thể in phiếu chi ký nhận.');
  };

  const handleRecordUnionDuesFromPayroll = () => {
    const addedAmount = 14500000;
    setUnionFundBalance(prev => prev + addedAmount);
    alert('✓ ĐÃ ĐỒNG BỘ TRÍCH NỘP TỪ BẢNG LƯƠNG: Tồn quỹ công đoàn tăng thêm +' + addedAmount.toLocaleString('vi-VN') + ' đ (gồm 2% Kinh phí công đoàn NSDLĐ và 1% Đoàn phí đoàn viên trích từ lương)!');
  };

  const handleApproveBenevolentClaim = (claimId: string) => {
    const claim = benevolentClaims.find(c => c.id === claimId);
    if (!claim) return;
    if (benevolentFundBalance < claim.proposedAmount) {
      alert('⚠️ Số dư Quỹ Tấm Lòng Vàng không đủ để chi khoản cứu trợ này!');
      return;
    }

    setBenevolentFundBalance(prev => prev - claim.proposedAmount);
    setBenevolentClaims(prev => prev.map(c => c.id === claimId ? {
      ...c,
      status: 'APPROVED_DISBURSED',
      disbursedDate: new Date().toLocaleDateString('vi-VN')
    } : c));

    alert('✓ Đã phê duyệt giải ngân cứu trợ Quỹ Tấm Lòng Vàng! Số dư quỹ giảm ' + claim.proposedAmount.toLocaleString('vi-VN') + ' đ. Vui lòng in biên bản tiếp nhận để lưu hồ sơ.');
  };

  // Trạng thái số dư quỹ thời gian thực
  const [unionFundBalance, setUnionFundBalance] = useState(343000000);
  const [benevolentFundBalance, setBenevolentFundBalance] = useState(186450000);
  const reliefCases = [
    {
      name: 'Anh Trần Văn Nam (Mã NV: AV-0482)',
      dept: 'Phân Xưởng Cơ Điện',
      reason: 'Gia đình bị thiệt hại do hỏa hoạn, bản thân bị bỏng nhẹ khi cứu hộ',
      amount: '15.000.000 đ',
      date: '18/08/2026',
      status: 'Đã trao tận tay'
    },
    {
      name: 'Chị Lê Thị Mai (Mã NV: AV-0715)',
      dept: 'Phân Xưởng Đóng Gói',
      reason: 'Con nhỏ mắc bệnh hiểm nghèo phẫu thuật tim tại Bệnh viện Nhi Đồng',
      amount: '20.000.000 đ',
      date: '05/08/2026',
      status: 'Đã trao tận tay'
    },
    {
      name: 'Anh Nguyễn Hoàng Quân (Mã NV: AV-0931)',
      dept: 'Tổ Vận Hành Kho Bãi',
      reason: 'Bị tai nạn giao thông trên đường đi làm, hoàn cảnh vợ nuôi 2 con nhỏ',
      amount: '10.000.000 đ',
      date: '22/07/2026',
      status: 'Đã trao tận tay'
    }
  ];

  // -------------------------------------------------------------
  // 3. DỮ LIỆU THI ĐUA, KHEN THƯỞNG & VINH DANH THÂM NIÊN
  // -------------------------------------------------------------
  const starOfTheMonth = [
    {
      name: 'Phạm Minh Trí',
      code: 'AV-0128',
      dept: 'Phân Xưởng Chế Biến',
      title: 'Chiến Binh Năng Suất Tháng 08',
      achievement: 'Vượt 138% định mức năng suất ca kíp, tỷ lệ phế phẩm 0%, hướng dẫn 4 công nhân mới.',
      reward: '3.000.000 đ + Cúp Ngôi Sao Vàng',
      badge: 'Năng Suất Đỉnh Cao'
    },
    {
      name: 'Đặng Mai Hoa',
      code: 'AV-0025',
      dept: 'Ban An Toàn & Môi Trường (HSE)',
      title: 'Sáng Kiến An Toàn Kaizen',
      achievement: 'Cải tiến hệ thống che chắn cảm biến dập khuôn, ngăn ngừa 100% rủi ro kẹt tay.',
      reward: '5.000.000 đ + Bằng Khen Tổng Giám Đốc',
      badge: 'Sáng Kiến Vàng'
    },
    {
      name: 'Lâm Thị Vy',
      code: 'AV-0062',
      dept: 'Chi Nhánh Phân Phối Cần Thơ',
      title: 'Đại Sứ Dịch Vụ Xuất Sắc',
      achievement: 'Đạt 100% KPI giao hàng đúng giờ, nhận 48 đánh giá 5 sao từ đối tác siêu thị.',
      reward: '3.000.000 đ + Huy Hiệu Tận Tâm',
      badge: 'Dịch Vụ Tận Tâm'
    }
  ];

  const milestoneAnniversaries = useMemo(() => {
    const currentYear = 2026;
    return employees.map(emp => {
      const joinYear = new Date(emp.joinDate).getFullYear();
      const years = currentYear - joinYear;
      return { ...emp, years };
    }).filter(emp => emp.years >= 5 && emp.years % 5 === 0)
      .sort((a, b) => b.years - a.years);
  }, [employees]);

  // -------------------------------------------------------------
  // 4. DỮ LIỆU HỘI THAO, CUỘC THI TÀI NĂNG & BẮT TREND
  // -------------------------------------------------------------
  const [sportsList] = useState([
    {
      id: 'SPT-01',
      tournament: 'Giải Bóng Đá Nam Tứ Hùng HRM Cup 2026',
      currentStage: 'Trận Chung Kết',
      matchDetail: 'Phân Xưởng Chế Biến vs Khối Văn Phòng & Kho Vận',
      time: '16:30 Thứ Bảy (29/08) tại Sân Bóng Nhà Máy',
      score: 'Chờ thi đấu',
      statusBadge: 'Chung Kết Căng Thẳng',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      id: 'SPT-02',
      tournament: 'Giải Cầu Lông Đôi Nam Nữ Gắn Kết',
      currentStage: 'Vòng Bán Kết',
      matchDetail: 'Cặp đôi Cơ Điện vs Cặp đôi Kinh Doanh',
      time: '17:30 Thứ Năm (27/08) tại Nhà thi đấu Cụm',
      score: 'Tỉ số 1 - 1 (Sắp đấu set quyết định)',
      statusBadge: 'Đang diễn ra',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      id: 'SPT-03',
      tournament: 'Giải Chạy Bộ Marathon "10.000 Bước Chân Khỏe"',
      currentStage: 'Tổng Kết & Trao Giải',
      matchDetail: 'Hơn 450 vận động viên hoàn thành cự ly 5km & 10km',
      time: 'Đã hoàn thành',
      score: 'Vô địch: Anh Hoàng Văn Tuấn (Phân Xưởng Đóng Gói)',
      statusBadge: 'Đã trao giải',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  ]);

  const [trendContestEntries, setTrendContestEntries] = useState([
    {
      id: 'TC-01',
      title: 'Video TikTok "Đồng Phục Đi Làm Xịn Xò & Nụ Cười Năng Suất"',
      team: 'Tổ Đóng Gói 03 (Nhà Máy Dĩ An)',
      likes: 342,
      isLiked: false,
      desc: 'Clip vui nhộn cover điệu nhảy thịnh hành kết hợp thông điệp an toàn lao động, đã đạt hơn 45.000 lượt xem trên mạng xã hội.',
      tag: '#NangLuongTichCuc #DongPhucHRM'
    },
    {
      id: 'TC-02',
      title: 'Bộ ảnh "Góc Làm Việc 5S Xanh - Sạch - Thông Minh"',
      team: 'Phòng Kỹ Thuật & Tự Động Hóa',
      likes: 289,
      isLiked: false,
      desc: 'Không gian sáng tạo đầy cây xanh, bàn làm việc gọn gàng không một sợi dây điện thừa, bố trí sơ đồ trực quan.',
      tag: '#5STrangTri #GreenWorkplace'
    },
    {
      id: 'TC-03',
      title: 'Tiết mục văn nghệ "Hào Khí Người Lao Động & Khát Vọng Doanh Nghiệp"',
      team: 'Đội Văn Nghệ Xung Kích Khối Văn Phòng',
      likes: 415,
      isLiked: true,
      desc: 'Bản hòa ca acoustic kết hợp nhạc cụ tự chế từ vật tư xưởng, truyền tải tinh thần đoàn kết vượt mọi khó khăn.',
      tag: '#VanNgheNoiBo #TuHaoHRM'
    }
  ]);

  const handleToggleLike = (id: string) => {
    setTrendContestEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          isLiked: !entry.isLiked,
          likes: entry.isLiked ? entry.likes - 1 : entry.likes + 1
        };
      }
      return entry;
    }));
  };

  // -------------------------------------------------------------
  // 5. DỮ LIỆU SINH NHẬT & THĂM DÒ Ý KIẾN VUI (FUN POLL)
  // -------------------------------------------------------------
  const augustBirthdays = useMemo(() => {
    // Lọc các nhân sự có tháng sinh là tháng 8 (hoặc phân bổ thực tế cho tháng 8)
    const filtered = employees.filter((emp, idx) => {
      if (emp.dob) {
        const month = parseInt(emp.dob.split('-')[1], 10);
        return month === 8;
      }
      return idx % 12 === 7; // Phân bổ khoảng 1/12 nhân sự vào tháng 8
    });

    // Nếu dữ liệu nhân sự chưa có dob tháng 8 thì lấy mẫu danh sách đại diện tiêu biểu (48-56 nhân viên)
    const list = filtered.length > 0 ? filtered : employees.slice(0, 48);

    return list.map((emp, idx) => {
      let day = 1;
      if (emp.dob) {
        day = parseInt(emp.dob.split('-')[2], 10) || ((idx * 3) % 28 + 1);
      } else {
        day = ((idx * 7) % 28) + 1;
      }
      // Giả định ngày hôm nay trong hệ thống là ngày 25
      const isToday = day === 25 || idx === 0;
      return {
        ...emp,
        birthDay: day,
        isToday
      };
    }).sort((a, b) => a.birthDay - b.birthDay);
  }, [employees]);

  const [wishedEmpIds, setWishedEmpIds] = useState<Set<string>>(new Set());

  const handleSendWish = (empId: string) => {
    setWishedEmpIds(prev => {
      const next = new Set(prev);
      next.add(empId);
      return next;
    });
  };

  const [pollVotes, setPollVotes] = useState({
    optA: 142,
    optB: 88,
    optC: 165
  });
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 6. DỮ LIỆU KHẢO SÁT CHỈ SỐ HẠNH PHÚC TOÀN CÔNG TY (HAPPINESS INDEX)
  // -------------------------------------------------------------
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [surveyAnswers, setSurveyAnswers] = useState({
    workLifeBalance: 4,      // 1. Cân bằng công việc & cuộc sống
    workEnvironment: 5,      // 2. Môi trường làm việc & đồng nghiệp
    leadershipRecognition: 4,// 3. Sự ghi nhận và hỗ trợ từ quản lý
    welfareCompensation: 4,  // 4. Chế độ đãi ngộ, phúc lợi & công bằng
    growthCommitment: 5,     // 5. Mức độ gắn bó & cơ hội phát triển
    feedbackText: ''         // Đóng góp ý kiến ẩn danh bảo mật
  });

  // Dữ liệu mẫu kết quả khảo sát tổng hợp dành cho HR / Ban Giám Đốc phân tích
  const [surveyStats] = useState({
    totalEmployees: employees.length,
    participatedCount: 5412,
    participationRate: 79.7,
    overallHappinessScore: 4.28, // Thang 5
    breakdown: [
      { category: 'Cân bằng Công việc & Cuộc sống', score: 4.15, status: 'Tốt', color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { category: 'Môi trường Làm việc & 5S', score: 4.42, status: 'Rất tốt', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { category: 'Sự Ghi nhận từ Quản lý', score: 4.20, status: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50' },
      { category: 'Lương thưởng & Chế độ Phúc lợi', score: 4.05, status: 'Khá', color: 'text-amber-600', bg: 'bg-amber-50' },
      { category: 'Gắn bó & Tự hào Doanh nghiệp', score: 4.56, status: 'Xuất sắc', color: 'text-rose-600', bg: 'bg-rose-50' },
    ],
    departmentRankings: [
      { dept: 'Khối Văn Phòng & HCNS', score: 4.48, count: 185 },
      { dept: 'Phân Xưởng Chế Biến', score: 4.35, count: 2150 },
      { dept: 'Phân Xưởng Đóng Gói', score: 4.28, count: 1420 },
      { dept: 'Khối Kỹ Thuật Cơ Điện', score: 4.22, count: 480 },
      { dept: 'Kho Vận & Logistics', score: 4.12, count: 680 },
    ]
  });

  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    setSurveySubmitted(true);
    alert('✓ Cảm ơn bạn! Đóng góp khảo sát của bạn đã được mã hóa bảo mật 100% gửi về cơ sở dữ liệu phân tích của Phòng Nhân Sự.');
  };

  const totalVotes = pollVotes.optA + pollVotes.optB + pollVotes.optC;

  const handleVote = (opt: 'optA' | 'optB' | 'optC') => {
    if (hasVoted) return;
    setPollVotes(prev => ({ ...prev, [opt]: prev[opt] + 1 }));
    setHasVoted(true);
    setSelectedOpt(opt);
  };

  return (
    <div className="space-y-1.5 animate-in fade-in duration-200">
      {/* 1. HEADER BANNER PHÂN HỆ */}
      <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border border-purple-200 rounded-2xl p-2 text-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3 relative overflow-hidden">
        {/* Background Overlay Decor */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 text-white font-bold shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-purple-950 drop-shadow-sm">
                  Thông Báo &amp; Thông Tin Chung
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 text-purple-700 border border-purple-200 backdrop-blur-sm shadow-sm uppercase tracking-wide">
                  Văn Hóa &amp; Gắn Kết
                </span>
              </div>
              <p className="text-xs text-purple-700/80 mt-0.5 font-medium">
                Bản tin doanh nghiệp, Công đoàn cơ sở, Quỹ tấm lòng vàng, Khen thưởng vinh danh, Hội thao &amp; Chúc mừng sinh nhật
              </p>
            </div>
          </div>
        </div>

        {/* Thống kê nhanh nổi bật */}
        <div className="relative z-10 flex items-center space-x-2 bg-white/60 backdrop-blur-md p-1.5 rounded-xl border border-white shadow-sm self-start md:self-auto shrink-0 text-xs">
          <div className="px-3 py-1 bg-white/80 rounded-lg text-center shadow-sm border border-white">
            <p className="text-[10px] text-purple-600 uppercase font-bold tracking-wider">Sinh Nhật Hôm Nay</p>
            <p className="text-sm font-black text-amber-500">
              {augustBirthdays.filter(e => e.isToday).length} Đồng nghiệp 🎉
            </p>
          </div>
          <div className="px-3 py-1 bg-white/80 rounded-lg text-center shadow-sm border border-white">
            <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Quỹ Công Đoàn</p>
            <p className="text-sm font-black text-blue-600">
              {unionFundBalance.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className="px-3 py-1 bg-white/80 rounded-lg text-center shadow-sm border border-white">
            <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Quỹ Tấm Lòng Vàng</p>
            <p className="text-sm font-black text-emerald-600">
              {benevolentFundBalance.toLocaleString('vi-VN')} đ
            </p>
          </div>
        </div>
      </div>

      {/* 2. THANH 7 TABS PHÂN KHU NGHIỆP VỤ (STICKY CÓ THANH RULE CUỘN NGANG RÕ RÀNG) */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md pt-1 pb-1.5 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScrollTabs('left')}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-xs shrink-0 cursor-pointer hidden md:flex items-center justify-center transition-colors"
            title="Cuộn các tab sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div 
            ref={tabsContainerRef}
            className="flex items-center space-x-1.5 overflow-x-auto scrollable-tabs pb-1.5 scroll-smooth flex-1"
          >
        <button
          onClick={() => setActiveTab('OFFICIAL_NEWS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'OFFICIAL_NEWS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>1. Bản Tin</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-white/20 text-white font-bold">
            {officialNotices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('NEW_HIRES')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'NEW_HIRES'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
          <span>2. Thành Viên Mới</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
            {todayNewHires.length} Tân Binh
          </span>
        </button>

        <button
          onClick={() => setActiveTab('UNION_AND_CHARITY')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'UNION_AND_CHARITY'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>3. Công Đoàn &amp; Quỹ Tấm Lòng Vàng</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-emerald-500 text-white font-bold">
            Minh Bạch
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RECOGNITION_AWARDS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'RECOGNITION_AWARDS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>4. Khen Thưởng</span>
        </button>

        <button
          onClick={() => setActiveTab('SPORTS_AND_TALENTS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'SPORTS_AND_TALENTS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>5. Cuộc Thi</span>
        </button>

        <button
          onClick={() => setActiveTab('BIRTHDAYS_AND_FUN')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'BIRTHDAYS_AND_FUN'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Cake className="w-3.5 h-3.5 text-pink-500" />
          <span>6. Sinh Nhật</span>
          {augustBirthdays.filter(e => e.isToday).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-rose-500 text-white font-bold animate-pulse">
              Hôm nay
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('HAPPINESS_SURVEY')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 shrink-0 whitespace-nowrap cursor-pointer ${
            activeTab === 'HAPPINESS_SURVEY'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Smile className="w-3.5 h-3.5 text-amber-400" />
          <span>7. Khảo Sát (EHI)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-purple-100 text-purple-800 border border-purple-200 font-bold flex items-center gap-0.5">
            <Lock className="w-2.5 h-2.5" />
            Bảo Mật
          </span>
        </button>
          </div>

          <button
            type="button"
            onClick={() => handleScrollTabs('right')}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shadow-xs shrink-0 cursor-pointer hidden md:flex items-center justify-center transition-colors"
            title="Cuộn các tab sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: BẢN TIN & THÔNG CÁO DOANH NGHIỆP */}
      {/* ============================================================= */}
      {activeTab === 'OFFICIAL_NEWS' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* KHUNG CỐ ĐỊNH ĐẦU TIÊN: ĐĂNG KÝ PHẦN ĂN CA & THẺ LẤY CƠM (E-MEAL PASS) */}
          <div 
            onClick={onOpenMealPassModal}
            className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 p-3 sm:p-3.5 text-slate-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none hover:brightness-105 active:scale-[0.99]"
            title="Bấm để mở Hệ Thống Đăng Ký Phần Ăn Ca & Thẻ Lấy Cơm Điện Tử (E-Meal Pass)"
          >
            {/* Background Glow */}
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/40 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
              {/* Bên trái: Icon + Tiêu đề */}
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm shrink-0 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs sm:text-sm tracking-wide uppercase text-emerald-950">
                      HỆ THỐNG ĐĂNG KÝ PHẦN ĂN CA &amp; THẺ LẤY CƠM (E-MEAL PASS)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 shadow-xs shrink-0">
                      Mới Nhất
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5 flex items-center gap-1.5 flex-wrap font-medium">
                    <span>Đăng ký suất Chay/Cháo • Tiếp khách • Quét mã QR nhận khay cơm tại máy POS</span>
                  </p>
                </div>
              </div>

              {/* Bên phải: Nút to ngón tay cái dễ bấm trên điện thoại */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenMealPassModal) onOpenMealPassModal();
                  }}
                  className="w-full sm:w-auto h-10 sm:h-11 px-4 rounded-xl bg-white text-emerald-700 font-black text-xs flex items-center justify-center gap-2 shadow-sm border border-emerald-100 group-hover:bg-emerald-50 transition-all cursor-pointer whitespace-nowrap hover:border-emerald-300"
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>MỞ THẺ ĂN QR &amp; ĐĂNG KÝ NGAY →</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bộ lọc loại thông báo */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              <button
                onClick={() => setNewsFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  newsFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tất Cả ({officialNotices.length})
              </button>
              <button
                onClick={() => setNewsFilter('URGENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  newsFilter === 'URGENT'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Khẩn Cấp / Lễ Tết</span>
              </button>
              <button
                onClick={() => setNewsFilter('POLICY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  newsFilter === 'POLICY'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Chính Sách &amp; Phúc Lợi</span>
              </button>
              <button
                onClick={() => setNewsFilter('STANDARDS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  newsFilter === 'STANDARDS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Tiêu Chuẩn 5S &amp; ISO</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              *Mọi thông báo đều có giá trị thi hành chính thức toàn doanh nghiệp
            </p>
          </div>

          {/* Danh sách thẻ thông báo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredNotices.map((item) => {
              const isRead = readNotices.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-2 shadow-xs transition-all hover:shadow-md flex flex-col justify-between relative group ${
                    item.isPinned ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Header thông báo */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                        {item.isPinned && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500" />
                            Ghim đầu trang
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>

                    {/* Tiêu đề & Nội dung tóm tắt */}
                    <div className="mt-2.5">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {item.summary}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2">
                        Ban hành bởi: <b className="text-slate-700">{item.author}</b>
                      </p>
                    </div>
                  </div>

                  {/* Footer tương tác: Tải file & Nút "Đã đọc và hiểu rõ" */}
                  <div className="mt-1.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 text-xs">
                      {item.hasAttachment && (
                        <button
                          onClick={() => alert(`Đang tải tệp đính kèm chính thức: ${item.attachmentName}`)}
                          className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="text-[11px]">{item.attachmentName}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views.toLocaleString('vi-VN')} lượt xem
                      </span>
                      <button
                        onClick={() => {
                          setReadNotices(prev => {
                            const next = new Set(prev);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                          isRead
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isRead ? 'Đã đọc & hiểu' : 'Xác nhận đã đọc'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ============================================================= */}
      {/* TAB 2: CHÀO ĐÓN THÀNH VIÊN MỚI (GIAO DIỆN CHUẨN MỰC, NỀN SÁNG) */}
      {/* ============================================================= */}
      {activeTab === 'NEW_HIRES' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* Header Giới Thiệu Chuẩn Mực */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Chào Đón Thành Viên Mới Tiếp Nhận Hôm Nay (09/09/2026)
                  </h2>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {todayNewHires.length} Nhân sự mới
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chuẩn bị chu đáo: Chỗ ngồi làm việc • Máy tính bàn giao • Email công vụ • Thẻ nhân viên ra vào
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setPrintingHubInitialTab('NEW_EMPLOYEES');
                  setPrintingHubBadgeToView(null);
                  setShowPrintingHubModal(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md flex items-center space-x-2 transition-all cursor-pointer border border-indigo-400/40"
                title="Mở Trung tâm In Thẻ Nhân Viên chuyên nghiệp (Mục 1: Nhân viên mới chưa in thẻ và Mục 2: Cấp lại thẻ mất/hỏng; hỗ trợ Thẻ Đứng và Thẻ Ngang)"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>🖨️ Trung Tâm In Thẻ (Mới &amp; Cấp Lại)</span>
              </button>
              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Đã Chuẩn Bị Xong 100%
              </span>
            </div>
          </div>

          {/* 1. KHUNG TIẾP NHẬN CẤP QUẢN LÝ (TRƯỞNG PHÒNG TRỞ LÊN) - Ô LỚN HƠN, TRANG TRỌNG, MÀU SẮC NHÃ NHẶN NỀN SÁNG */}
          {todayNewHires.filter(h => h.isManagerLevel).map(manager => (
            <div 
              key={manager.id}
              className="bg-white rounded-2xl border-2 border-amber-300 p-2.5 shadow-xs space-y-3.5 relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-amber-100">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                    CÁN BỘ QUẢN LÝ CẤP CAO • CẤP TRƯỞNG BỘ PHẬN
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bổ nhiệm &amp; Nhận việc: 09/09/2026
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSendCongrats(manager.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      userCongratulated.has(manager.id)
                        ? 'bg-rose-50 text-rose-700 border border-rose-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${userCongratulated.has(manager.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    <span>{userCongratulated.has(manager.id) ? 'Đã chúc mừng' : 'Gửi lời chúc'} ({congratsCount[manager.id] || 0})</span>
                  </button>
                </div>
              </div>

              {/* Thông tin lãnh đạo */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 items-center">
                <div className="lg:col-span-5 flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xl flex items-center justify-center shrink-0">
                    {manager.avatarInitial}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      Tân Trưởng Bộ Phận
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {manager.fullName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700">
                      {manager.position}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {manager.department}
                    </p>
                  </div>
                </div>

                {/* Thư chúc mừng trang trọng từ Ban Giám Đốc */}
                <div className="lg:col-span-7 bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed text-slate-700">
                  <div className="flex items-center space-x-1 text-amber-800 font-bold mb-1 text-[11px]">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Thư Chúc Mừng &amp; Giao Nhiệm Vụ Từ Ban Giám Đốc:</span>
                  </div>
                  <p className="italic text-[11px] text-slate-600">
                    "{manager.executiveGreeting}"
                  </p>
                </div>
              </div>

              {/* Chi tiết chuẩn bị cơ sở vật chất */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-semibold">1. Chỗ Ngồi Làm Việc:</span>
                  <b className="text-slate-800 text-[11px] mt-0.5 block">{manager.facilities.seating}</b>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-semibold">2. Máy Tính &amp; Màn Hình:</span>
                  <b className="text-slate-800 text-[11px] mt-0.5 block">{manager.facilities.computer}</b>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-semibold">3. Email &amp; Phân Quyền:</span>
                  <b className="text-emerald-700 text-[11px] font-mono mt-0.5 block">{manager.facilities.email}</b>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-semibold">4. Thẻ VIP &amp; Đỗ Xe:</span>
                  <b className="text-slate-800 text-[11px] mt-0.5 block">{manager.facilities.badge}</b>
                </div>
              </div>
            </div>
          ))}

          {/* 2. CÁC NHÂN SỰ CHUYÊN VIÊN / KỸ SƯ (THẺ TRẮNG GỌN GÀNG, THÔNG THƯỜNG) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {todayNewHires.filter(h => !h.isManagerLevel).map(emp => (
              <div 
                key={emp.id}
                className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center border border-slate-200">
                        {emp.avatarInitial}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{emp.fullName}</h4>
                        <p className="text-[11px] font-semibold text-indigo-600">{emp.position}</p>
                        <p className="text-[10px] text-slate-400">{emp.department}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleSendCongrats(emp.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                          userCongratulated.has(emp.id)
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${userCongratulated.has(emp.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                        <span>Chúc mừng ({congratsCount[emp.id] || 0})</span>
                      </button>
                    </div>
                  </div>

                  {/* Chi tiết bàn giao cơ sở vật chất */}
                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[10px]">Chỗ ngồi:</span>
                      <span className="font-semibold text-slate-800">{emp.facilities.seating}</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[10px]">Máy tính:</span>
                      <span className="font-semibold text-slate-800">{emp.facilities.computer}</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[10px]">Email:</span>
                      <span className="font-semibold text-emerald-700 font-mono">{emp.facilities.email}</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-[10px]">Thẻ &amp; Đồ bảo hộ:</span>
                      <span className="font-semibold text-slate-800">{emp.facilities.badge}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Người hướng dẫn: <b className="text-slate-700">{emp.welcomeHost}</b></span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã sẵn sàng
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Đã tinh gọn: Toàn bộ nghiệp vụ In thẻ mới & Cấp lại thẻ mất/hỏng được quản lý tập trung 100% tại nút 'Trung Tâm In Thẻ' trên Header */}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: CÔNG ĐOÀN CƠ SỞ & QUỸ TẤM LÒNG VÀNG */}
      {/* ============================================================= */}
      {activeTab === 'UNION_AND_CHARITY' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* ── DỰ BÁO CÂN ĐỐI TÀI CHÍNH QUỸ CÔNG ĐOÀN & QUỸ TẤM LÒNG VÀNG (AI CASHFLOW) ── */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-3.5 border border-blue-800/40 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 shrink-0">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">AI Dự Báo Cân Đối Quỹ Quý 4/2026:</span>
                  <span className="px-2 py-0.2 rounded text-[9.5px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Sức Khỏe Tài Chính: Rất An Toàn
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/80 mt-0.5">
                  Dự kiến nguồn thu 3 tháng tới: <b>+385.500.000 đ</b> (KPCĐ 2% &amp; Đoàn phí 1%) • Dự toán chi chăm lo Tết Nguyên Đán &amp; 20/10: <b>~280.000.000 đ</b>.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <div className="px-2.5 py-1 bg-white/10 rounded-lg text-center">
                <p className="text-[9.5px] text-slate-300 uppercase">Dự phòng rủi ro</p>
                <p className="font-mono font-bold text-amber-300 text-xs">120.000.000 đ</p>
              </div>
              <div className="px-2.5 py-1 bg-white/10 rounded-lg text-center">
                <p className="text-[9.5px] text-slate-300 uppercase">Bảo trợ đột xuất</p>
                <p className="font-mono font-bold text-emerald-300 text-xs">186.450.000 đ</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
            {/* CỘT 1: CÔNG ĐOÀN CƠ SỞ */}
            <div className="space-y-3.5">
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Ban Chấp Hành Công Đoàn Cơ Sở</h2>
                      <p className="text-[11px] text-slate-500">Chăm lo quyền lợi hợp pháp, phúc lợi đời sống đoàn viên lao động</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    KPCĐ 2% &amp; Đoàn Phí 1%
                  </span>
                </div>

                <div className="mt-3.5 space-y-2.5">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Chương trình phúc lợi đoàn viên 2026:
                  </p>
                  {unionPrograms.map((prog, idx) => {
                    const Icon = prog.icon;
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-white text-indigo-600 border border-slate-200 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{prog.title}</h4>
                            <span className={`px-2 py-0.2 rounded text-[9.5px] font-bold ${prog.statusColor}`}>
                              {prog.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{prog.desc}</p>
                          <p className="text-[10px] font-bold text-indigo-700 mt-1">
                            Dự toán kinh phí: {prog.budget}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bảng công khai tài chính thu chi công đoàn hàng tháng */}
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Công Khai Thu - Chi Tài Chính Công Đoàn (3 Tháng Gần Nhất)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Minh Bạch 100%
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Kỳ Tháng</th>
                        <th className="p-2 text-right">Tổng Thu</th>
                        <th className="p-2 text-right">Tổng Chi</th>
                        <th className="p-2 text-right">Tồn Quỹ</th>
                        <th className="p-2">Khoản Chi Trọng Điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unionFinance.map((fin, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900">{fin.month}</td>
                          <td className="p-2 text-right font-mono text-emerald-700">+{fin.income.toLocaleString('vi-VN')} đ</td>
                          <td className="p-2 text-right font-mono text-rose-600">-{fin.expense.toLocaleString('vi-VN')} đ</td>
                          <td className="p-2 text-right font-mono font-bold text-indigo-700">{fin.balance.toLocaleString('vi-VN')} đ</td>
                          <td className="p-2 text-[10.5px] text-slate-500">{fin.majorExpense}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            
              {/* KHỐI TÁC VỤ & QUẢN LÝ QUYỀN LỢI CÔNG ĐOÀN */}
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-blue-600" />
                      <span>Đăng Ký &amp; Đề Xuất Hưởng Quyền Lợi Công Đoàn Cơ Sở</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Đoàn viên tự khai báo chế độ; BCH thẩm định duyệt chi (tự động trừ tồn quỹ); nộp đoàn phí báo tăng quỹ.
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                    <button
                      onClick={() => setShowUnionAppModal(true)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer flex items-center space-x-1"
                      title="Nộp đơn tự nguyện tham gia công đoàn và trích 1% đoàn phí từ lương"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Đăng Ký Vào Công Đoàn</span>
                    </button>
                    <button
                      onClick={() => setShowBenefitClaimModal(true)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center space-x-1"
                      title="Khai báo hưởng chế độ: cưới hỏi, sinh con, ốm đau, hiếu hỉ"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Đề Xuất Hưởng Chế Độ</span>
                    </button>
                    <button
                      onClick={handleRecordUnionDuesFromPayroll}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold cursor-pointer flex items-center space-x-1"
                      title="Báo tăng quỹ khi trích 2% KPCĐ và 1% Đoàn phí từ bảng lương tháng"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đồng Bộ Trích Nộp (+Quỹ)</span>
                    </button>
                  </div>
                </div>

                {/* Danh sách đề xuất hưởng chế độ công đoàn */}
                <div>
                  <p className="text-[11px] font-bold text-slate-700 mb-1.5 uppercase">
                    Danh sách đề xuất hưởng quyền lợi công đoàn gần đây:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase">
                        <tr>
                          <th className="p-1.5 text-center">Mã</th>
                          <th className="p-1.5">Đoàn Viên</th>
                          <th className="p-1.5">Chế Độ Hưởng</th>
                          <th className="p-1.5 text-right">Mức Chi</th>
                          <th className="p-1.5">Chứng Từ Kèm</th>
                          <th className="p-1.5 text-center">Trạng Thái</th>
                          <th className="p-1.5 text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {unionBenefitClaims.map((claim) => (
                          <tr key={claim.id} className="hover:bg-slate-50">
                            <td className="p-1.5 text-center font-mono text-[10px] text-blue-700 font-bold">{claim.id}</td>
                            <td className="p-1.5">
                              <div className="font-bold text-slate-900">{claim.empName}</div>
                              <span className="text-[10px] text-slate-400">{claim.empId} • {claim.dept}</span>
                            </td>
                            <td className="p-1.5">
                              <span className="font-semibold text-slate-800 text-[11px]">{claim.benefitName}</span>
                              <div className="text-[10px] text-slate-400">Ngày phát sinh: {claim.eventDate}</div>
                            </td>
                            <td className="p-1.5 text-right font-mono font-bold text-emerald-700">
                              {claim.amount.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="p-1.5 text-[10.5px] text-slate-600 italic max-w-[130px] truncate" title={claim.attachedDocNote}>
                              {claim.attachedDocNote}
                            </td>
                            <td className="p-1.5 text-center">
                              {claim.status === 'APPROVED_PAID' ? (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ Đã Chi Tiền
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleApproveBenefitClaim(claim.id)}
                                  className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
                                  title="Duyệt chi tiền và tự động trừ tồn quỹ công đoàn"
                                >
                                  Duyệt Chi (-Quỹ)
                                </button>
                              )}
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                onClick={() => setShowPrintBenefitReceiptModal(claim)}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10.5px] font-bold cursor-pointer inline-flex items-center gap-1"
                                title="In phiếu chi tiền mặt hoặc biên nhận phúc lợi để ký tên"
                              >
                                <Printer className="w-3 h-3 text-slate-600" />
                                <span>In Phiếu</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Danh sách đơn gia nhập công đoàn */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-bold text-slate-700 uppercase">
                      Đơn Đăng Ký Gia Nhập Công Đoàn Mới:
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Tự nguyện trích 1% đoàn phí hằng tháng
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {unionApplications.map((app) => (
                      <div key={app.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{app.empName}</span> ({app.empId} - {app.dept})
                          <div className="text-[10px] text-slate-500">
                            Ngày nộp đơn: {app.applyDate} • Đồng ý trích 1% lương: <b className="text-blue-700">✓ Đã xác nhận</b>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                            app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {app.status === 'APPROVED' ? '✓ Đoàn viên chính thức' : 'Chờ xét duyệt'}
                          </span>
                          <button
                            onClick={() => setShowPrintUnionAppModal(app)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                            title="In Đơn xin gia nhập công đoàn có chữ ký người lao động"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* CỘT 2: QUỸ TẤM LÒNG VÀNG & THIỆN NGUYỆN CSR */}
            <div className="space-y-3.5">
              <div className="bg-gradient-to-br from-amber-500 via-rose-500 to-pink-600 rounded-2xl p-2 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    Quỹ Tương Thân Tương Ái
                  </span>
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <h3 className="text-lg font-bold mt-2">Quỹ Tấm Lòng Vàng Doanh Nghiệp</h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Đóng góp tự nguyện từ CB-CNV và trích lập từ quỹ phúc lợi công ty để hỗ trợ các hoàn cảnh khó khăn
                </p>
                <div className="mt-3 p-3 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-amber-100 uppercase font-semibold">Số Dư Quỹ Thời Gian Thực</p>
                    <p className="text-xl font-extrabold text-white font-mono">
                      {benevolentFundBalance.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Mở cổng đóng góp tự nguyện trực tuyến vào Quỹ Tấm Lòng Vàng')}
                    className="px-3 py-1.5 rounded-lg bg-white text-rose-600 font-bold text-xs hover:bg-rose-50 transition-all shadow-xs cursor-pointer"
                  >
                    Ủng Hộ Quỹ ❤️
                  </button>
                </div>
              </div>

              
              {/* KHỐI ĐỀ XUẤT CỨU TRỢ QUỸ TẤM LÒNG VÀNG (3 KÊNH) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-600" />
                      <span>Đề Xuất Cứu Trợ Khẩn Cấp (Quỹ Tấm Lòng Vàng)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Linh hoạt 3 kênh: Tự khai báo, 02 đồng nghiệp khai hộ hoặc Quản lý trực tiếp đề xuất cứu trợ.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBenevolentClaimModal(true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Đề Xuất Cứu Trợ Mới</span>
                  </button>
                </div>

                {/* Bảng theo dõi các ca đề xuất cứu trợ */}
                <div className="space-y-2">
                  {benevolentClaims.map((claim) => (
                    <div key={claim.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-[10px] font-bold text-rose-700">{claim.id}</span>
                            <span className="font-bold text-slate-900 text-xs">{claim.beneficiaryName}</span>
                            <span className="text-[10.5px] text-slate-500">({claim.beneficiaryEmpId} • {claim.dept})</span>
                          </div>
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 mt-0.5 inline-block">
                            Kênh: {claim.channelLabel} ({claim.submitterInfo})
                          </span>
                        </div>
                        <span className="font-mono font-bold text-rose-700 text-sm">
                          {claim.proposedAmount.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                        <b>Hoàn cảnh &amp; Lý do:</b> {claim.reason}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10.5px]">
                        <div>
                          {claim.status === 'APPROVED_DISBURSED' ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã giải ngân: {claim.disbursedDate}</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold">Chờ Ban Quản Trị Quỹ duyệt chi</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {claim.status !== 'APPROVED_DISBURSED' && (
                            <button
                              onClick={() => handleApproveBenevolentClaim(claim.id)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold cursor-pointer shadow-2xs text-[10.5px]"
                              title="Ban Quản Trị Quỹ bấm duyệt chi cứu trợ, tự động trừ số dư quỹ thời gian thực"
                            >
                              Duyệt Giải Ngân (-Quỹ)
                            </button>
                          )}
                          <button
                            onClick={() => setShowPrintBenevolentReceiptModal(claim)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded font-bold cursor-pointer inline-flex items-center gap-1 text-[10.5px]"
                            title="In Quyết định và Biên bản tiếp nhận cứu trợ có chữ ký"
                          >
                            <Printer className="w-3 h-3 text-slate-600" />
                            <span>In Quyết Định</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Danh sách các ca đã hỗ trợ gần nhất */}
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Nhật Ký Yêu Thương (Các Trường Hợp Đã Thăm Hỏi &amp; Trợ Cấp)</span>
                </h3>
                <div className="space-y-2.5">
                  {reliefCases.map((rc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{rc.name}</h4>
                          <p className="text-[10.5px] text-slate-500">{rc.dept}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {rc.amount}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-1.5 bg-white p-2 rounded-lg border border-slate-100">
                        <b>Hoàn cảnh:</b> {rc.reason}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                        <span>Ngày trao tặng: {rc.date}</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {rc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-1.5 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Chiến dịch: "Giọt Máu Hồng Yêu Thương 2026"
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700">Đạt 85% chỉ tiêu</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 mt-1">
                    Đã có 340 cán bộ công nhân viên đăng ký tham gia hiến máu nhân đạo đợt 2 phối hợp cùng Hội Chữ Thập Đỏ Tỉnh.
                  </p>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: KHEN THƯỞNG */}
      {/* ============================================================= */}
      {activeTab === 'RECOGNITION_AWARDS' && (
        <div className="space-y-1.5 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Bảng Vàng Khen Thưởng: Ngôi Sao Tháng 08/2026</h2>
                  <p className="text-[11px] text-slate-500">Tuyên dương các cá nhân và tập thể có đóng góp xuất sắc, sáng kiến cải tiến vượt trội</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Thưởng Nóng &amp; Vinh Danh
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {starOfTheMonth.map((star, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-amber-200/80 p-2 shadow-2xs hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-2xs">
                    {star.badge}
                  </span>

                  <h3 className="text-sm font-bold text-slate-900 mt-2">{star.name}</h3>
                  <p className="text-[10.5px] text-slate-500 font-mono">{star.code} • {star.dept}</p>

                  <div className="mt-2.5 p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                    <p className="text-[11px] font-semibold text-amber-950 leading-relaxed">
                      "{star.achievement}"
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">Phần thưởng:</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {star.reward}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Medal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Tri Ân Thâm Niên Cống Hiến (Cột Mốc 5 Năm, 10 Năm, 15 Năm)</h2>
                  <p className="text-[11px] text-slate-500">Tự động đối soát từ ngày vào làm việc (joinDate) để vinh danh người lao động gắn bó lâu năm</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Điều 113 BLLĐ 2019 (+1 ngày phép/5 năm)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {milestoneAnniversaries.slice(0, 6).map((emp) => (
                <div key={emp.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {emp.years}N
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{emp.fullName}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                        {emp.years} Năm Gắn Bó
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500">{emp.jobTitle} • {emp.departmentName}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Vào làm: {emp.joinDate}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                        +{Math.floor(emp.years / 5)} ngày phép/năm
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: CUỘC THI */}
      {/* ============================================================= */}
      {activeTab === 'SPORTS_AND_TALENTS' && (
        <div className="space-y-1.5 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hội Thao &amp; Cuộc Thi Doanh Nghiệp 2026</h2>
                  <p className="text-[11px] text-slate-500">Cập nhật lịch thi đấu, kết quả tỷ số trực tiếp và bảng tổng sắp huy chương</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                Khỏe Để Lao Động &amp; Cống Hiến
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sportsList.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`px-2 py-0.2 rounded text-[9.5px] font-bold border ${item.badgeColor}`}>
                        {item.statusBadge}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{item.currentStage}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">{item.tournament}</h3>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">{item.matchDetail}</p>
                    <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200/80 text-[10.5px]">
                      <p className="text-slate-500">Diễn biến / Kết quả:</p>
                      <p className="font-bold text-indigo-700 mt-0.5">{item.score}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Cuộc Thi Sáng Tạo &amp; Phong Trào Doanh Nghiệp (Tự Nguyện &amp; Vui Vẻ)</h2>
                  <p className="text-[11px] text-slate-500">Bình chọn (Thả tim) cho các tác phẩm video ngắn, hình ảnh ấn tượng của các phân xưởng &amp; phòng ban</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Giải Thưởng Lên Đến 15.000.000đ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {trendContestEntries.map((entry) => (
                <div key={entry.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {entry.tag}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-2 leading-snug">{entry.title}</h3>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Đơn vị: <b>{entry.team}</b></p>
                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                      {entry.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      ❤️ {entry.likes} lượt bình chọn
                    </span>
                    <button
                      onClick={() => handleToggleLike(entry.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        entry.isLiked
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white hover:bg-rose-50 text-rose-600 border border-rose-200'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${entry.isLiked ? 'fill-white' : 'fill-rose-500 text-rose-500'}`} />
                      <span>{entry.isLiked ? 'Đã Thả Tim' : 'Thả Tim Bình Chọn'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: GÓC CHÚC MỪNG SINH NHẬT & TƯƠNG TÁC VUI */}
      {/* ============================================================= */}
      {activeTab === 'BIRTHDAYS_AND_FUN' && (
        <div className="space-y-1.5 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
            {/* CỘT 1 & 2: DANH SÁCH SINH NHẬT TRONG THÁNG */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-pink-50 text-pink-600 border border-pink-200">
                    <Cake className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Góc Chúc Mừng Sinh Nhật Tháng 08/2026 🎂</h2>
                    <p className="text-[11px] text-slate-500">Gửi lời chúc ấm áp và món quà tinh thần đến các đồng nghiệp thân yêu</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                  {augustBirthdays.length.toLocaleString('vi-VN')} Đồng nghiệp
                </span>
              </div>

              {/* Danh sách sinh nhật dạng thẻ gọn gàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {augustBirthdays.map((emp) => {
                  const hasWished = wishedEmpIds.has(emp.id);
                  return (
                    <div
                      key={emp.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        emp.isToday
                          ? 'bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border-pink-300 ring-1 ring-pink-200'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                          emp.isToday ? 'bg-rose-500 text-white shadow-xs animate-bounce' : 'bg-white text-slate-700 border border-slate-200'
                        }`}>
                          <span className="text-[9px] leading-none uppercase">{emp.isToday ? 'HÔM NAY' : 'NGÀY'}</span>
                          <span className="text-xs leading-none mt-0.5">{emp.birthDay}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-900">{emp.fullName}</span>
                            {emp.isToday && <span className="text-xs">👑🎉</span>}
                          </div>
                          <p className="text-[10px] text-slate-500">{emp.jobTitle} • {emp.departmentName}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendWish(emp.id)}
                        disabled={hasWished}
                        className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                          hasWished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-pink-100 hover:bg-pink-200 text-pink-800'
                        }`}
                      >
                        <span>{hasWished ? '✓ Đã chúc' : '💌 Chúc mừng'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT 3: THĂM DÒ Ý KIẾN VUI (QUICK FUN POLL) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Vote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Thăm Dò Ý Kiến Vui</h3>
                  <p className="text-[10.5px] text-slate-500">Khảo sát nhanh cuối tuần thư giãn</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <p className="font-bold text-amber-950">
                  ❓ Câu hỏi tuần này: "Chiều Thứ Sáu liên hoan Tea-break, toàn công ty muốn ăn món gì?"
                </p>
                <p className="text-[10px] text-amber-800 mt-1">Đã có {totalVotes} lượt bình chọn từ CB-CNV</p>
              </div>

              {/* Các lựa chọn bình chọn */}
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => handleVote('optA')}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    selectedOpt === 'optA' ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500' : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>🧋 A. Trà sữa full topping &amp; Bánh ngọt</span>
                    <span className="text-indigo-700">{Math.round((pollVotes.optA / totalVotes) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(pollVotes.optA / totalVotes) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{pollVotes.optA} phiếu bầu</span>
                </button>

                <button
                  onClick={() => handleVote('optB')}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    selectedOpt === 'optB' ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500' : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>🍉 B. Chè bưởi Nam Bộ &amp; Trái cây tươi</span>
                    <span className="text-emerald-700">{Math.round((pollVotes.optB / totalVotes) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(pollVotes.optB / totalVotes) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{pollVotes.optB} phiếu bầu</span>
                </button>

                <button
                  onClick={() => handleVote('optC')}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    selectedOpt === 'optC' ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500' : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>🍕 C. Pizza nóng hổi &amp; Gà rán giòn rụm</span>
                    <span className="text-rose-700">{Math.round((pollVotes.optC / totalVotes) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full" style={{ width: `${(pollVotes.optC / totalVotes) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{pollVotes.optC} phiếu bầu</span>
                </button>
              </div>

              {hasVoted && (
                <p className="text-[11px] text-emerald-700 font-bold text-center bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  🎉 Cảm ơn bạn đã tham gia bình chọn! Kết quả sẽ được chốt vào 11h30 Thứ Sáu.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 6: KHẢO SÁT CHỈ SỐ HẠNH PHÚC HÀNG NĂM (EHI - BẢO MẬT HR) */}
      {/* ============================================================= */}
      {activeTab === 'HAPPINESS_SURVEY' && (
        <div className="space-y-1.5 animate-in fade-in">
          {/* Banner thông báo khảo sát & cam kết bảo mật */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-2 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-purple-500/30 border border-purple-400/40 text-amber-300">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold">Khảo Sát Chỉ Số Hạnh Phúc Thường Niên 2026 (Employee Happiness Index)</h2>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Ẩn Danh 100%
                  </span>
                </div>
                <p className="text-xs text-purple-200 mt-1">
                  Định kỳ hàng năm toàn thể CB-CNV thực hiện khảo sát. Kết quả hoàn toàn bảo mật mã hóa và chỉ Phòng Nhân Sự cùng Ban Giám Đốc tổng hợp phân tích để cải tiến chính sách.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-purple-200">
                Kỳ khảo sát: <b>Quý 3/2026</b>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5">
            {/* CỘT 1 (7 CỘT): FORM LÀM KHẢO SÁT DÀNH CHO NHÂN VIÊN */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-purple-600" />
                    <span>Phiếu Đánh Giá Chỉ Số Hạnh Phúc Cá Nhân</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Hãy chọn mức độ hài lòng thực tế của bạn từ 1 (Rất không hài lòng) đến 5 (Rất hài lòng)</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                  5 Tiêu Chí Cốt Lõi
                </span>
              </div>

              {!surveySubmitted ? (
                <form onSubmit={handleSubmitSurvey} className="space-y-3.5 text-xs">
                  {/* Tiêu chí 1: Cân bằng công việc & cuộc sống */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">1. Cân Bằng Giữa Công Việc & Cuộc Sống Cá Nhân:</span>
                      <span className="font-bold text-indigo-700 font-mono text-sm">{surveyAnswers.workLifeBalance} / 5 ⭐</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Khối lượng công việc hợp lý, thời gian nghỉ ngơi phục hồi sức lao động đảm bảo.</p>
                    <div className="flex items-center space-x-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSurveyAnswers({ ...surveyAnswers, workLifeBalance: val })}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            surveyAnswers.workLifeBalance === val
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {val} ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tiêu chí 2: Môi trường làm việc & đồng nghiệp */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">2. Môi Trường Làm Việc, An Toàn & Đồng Nghiệp:</span>
                      <span className="font-bold text-indigo-700 font-mono text-sm">{surveyAnswers.workEnvironment} / 5 ⭐</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Không gian sạch sẽ, chuẩn 5S, văn hóa tôn trọng, tương trợ và hòa đồng.</p>
                    <div className="flex items-center space-x-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSurveyAnswers({ ...surveyAnswers, workEnvironment: val })}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            surveyAnswers.workEnvironment === val
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {val} ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tiêu chí 3: Sự ghi nhận từ cấp quản lý */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">3. Sự Lắng Nghe, Ghi Nhận & Động Viên Từ Quản Lý:</span>
                      <span className="font-bold text-indigo-700 font-mono text-sm">{surveyAnswers.leadershipRecognition} / 5 ⭐</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Cấp trên công bằng, ghi nhận thành tích xứng đáng, kịp thời tháo gỡ vướng mắc.</p>
                    <div className="flex items-center space-x-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSurveyAnswers({ ...surveyAnswers, leadershipRecognition: val })}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            surveyAnswers.leadershipRecognition === val
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {val} ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tiêu chí 4: Chế độ đãi ngộ & phúc lợi */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">4. Chế Độ Đãi Ngộ, Lương Thưởng & Bữa Ăn Ca:</span>
                      <span className="font-bold text-indigo-700 font-mono text-sm">{surveyAnswers.welfareCompensation} / 5 ⭐</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Lương đúng ngày, chế độ bồi dưỡng độc hại, chất lượng cơm ca và phúc lợi công đoàn.</p>
                    <div className="flex items-center space-x-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSurveyAnswers({ ...surveyAnswers, welfareCompensation: val })}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            surveyAnswers.welfareCompensation === val
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {val} ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tiêu chí 5: Gắn bó & Cơ hội phát triển */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">5. Mức Độ Gắn Bó Lâu Dài & Cơ Hội Thăng Tiến:</span>
                      <span className="font-bold text-indigo-700 font-mono text-sm">{surveyAnswers.growthCommitment} / 5 ⭐</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Tôi tự hào khi làm việc tại doanh nghiệp và sẵn sàng gắn bó từ 3 năm trở lên.</p>
                    <div className="flex items-center space-x-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSurveyAnswers({ ...surveyAnswers, growthCommitment: val })}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            surveyAnswers.growthCommitment === val
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {val} ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ý kiến đóng góp ẩn danh */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Góp ý hoặc tâm tư muốn gửi đến Phòng Nhân Sự (Ẩn danh hoàn toàn):
                    </label>
                    <textarea
                      rows={3}
                      value={surveyAnswers.feedbackText}
                      onChange={e => setSurveyAnswers({ ...surveyAnswers, feedbackText: e.target.value })}
                      placeholder="Chia sẻ chân thành những điều bạn cảm thấy tuyệt vời hoặc những điểm doanh nghiệp cần cải thiện..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Mã hóa bảo mật danh tính tuyệt đối
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi Đánh Giá Ẩn Danh</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 text-center space-y-3 bg-purple-50/70 rounded-2xl border border-purple-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Bạn Đã Hoàn Tất Khảo Sát Chỉ Số Hạnh Phúc 2026!</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Ý kiến đóng góp của bạn là kim chỉ nam vô giá giúp Phòng Nhân Sự và Ban Giám Đốc kiến tạo môi trường làm việc ngày càng hạnh phúc, thịnh vượng và nhân văn hơn.
                  </p>
                  <button
                    onClick={() => setSurveySubmitted(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-purple-300 text-purple-700 font-bold text-xs hover:bg-purple-100 transition-all cursor-pointer"
                  >
                    Xem lại câu trả lời
                  </button>
                </div>
              )}
            </div>

            {/* CỘT 2 (5 CỘT): KẾT QUẢ PHÂN TÍCH CHỈ DÀNH CHO HR / BGĐ */}
            <div className="lg:col-span-5 space-y-1.5">
              {/* Thẻ tổng quan chỉ số hạnh phúc */}
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-1.5">
                    <BarChart2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase">Phân Tích Dữ Liệu Dành Cho HR</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Bảo Mật Cấp Quản Trị
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-[10px] text-indigo-700 font-semibold uppercase">Chỉ Số Hạnh Phúc Toàn Cty</p>
                    <p className="text-2xl font-black text-indigo-900 font-mono mt-0.5">{surveyStats.overallHappinessScore} <span className="text-sm">/ 5.0</span></p>
                    <span className="text-[10px] text-emerald-700 font-bold bg-white px-1.5 py-0.2 rounded-full mt-1 inline-block">
                      Mức Độ: Rất Tốt
                    </span>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-700 font-semibold uppercase">Tỷ Lệ Tham Gia Khảo Sát</p>
                    <p className="text-2xl font-black text-emerald-900 font-mono mt-0.5">{surveyStats.participationRate}%</p>
                    <span className="text-[10px] text-slate-600 font-semibold block mt-1">
                      {surveyStats.participatedCount.toLocaleString('vi-VN')} / {surveyStats.totalEmployees.toLocaleString('vi-VN')} NV
                    </span>
                  </div>
                </div>

                {/* Điểm từng khía cạnh */}
                <div className="space-y-2 pt-1 text-xs">
                  <p className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide">Điểm Chi Tiết Từng Khía Cạnh:</p>
                  {surveyStats.breakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-700 font-medium">{item.category}</span>
                        <span className="font-bold text-slate-900 font-mono">{item.score} ⭐ ({item.status})</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(item.score / 5) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bảng xếp hạng hạnh phúc theo phòng ban */}
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Chỉ Số Hạnh Phúc Theo Khối / Phân Xưởng:
                </h4>
                <div className="space-y-1.5 text-xs">
                  {surveyStats.departmentRankings.map((dept, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{dept.dept}</p>
                        <span className="text-[10px] text-slate-500">{dept.count.toLocaleString('vi-VN')} phản hồi</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-purple-700 text-xs">{dept.score} ⭐</span>
                        <span className="block text-[9.5px] text-emerald-600 font-semibold">Tích cực</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ĐĂNG KÝ GIA NHẬP CÔNG ĐOÀN ── */}
      {showUnionAppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-sm">Đơn Đăng Ký Gia Nhập Công Đoàn Cơ Sở</h3>
              </div>
              <button
                onClick={() => setShowUnionAppModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const newApp: UnionApplication = {
                  id: 'CD-2026-00' + (unionApplications.length + 1),
                  empName: newUnionAppForm.empName,
                  empId: newUnionAppForm.empId,
                  dept: newUnionAppForm.dept,
                  applyDate: new Date().toLocaleDateString('vi-VN'),
                  consentDuesDeduction: newUnionAppForm.consentDuesDeduction,
                  status: 'PENDING'
                };
                setUnionApplications([newApp, ...unionApplications]);
                setShowUnionAppModal(false);
                alert('✓ Nộp đơn gia nhập công đoàn thành công! Bạn có thể in đơn giấy ký tên gửi BCH Công Đoàn phê duyệt.');
              }}
              className="p-2 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ &amp; Tên Người Lao Động:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trịnh Quốc Bảo"
                  value={newUnionAppForm.empName}
                  onChange={e => setNewUnionAppForm({ ...newUnionAppForm, empName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã Nhân Viên:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: AV-0845"
                    value={newUnionAppForm.empId}
                    onChange={e => setNewUnionAppForm({ ...newUnionAppForm, empId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phân Xưởng / Phòng Ban:</label>
                  <select
                    value={newUnionAppForm.dept}
                    onChange={e => setNewUnionAppForm({ ...newUnionAppForm, dept: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  >
                    <option value="Phân Xưởng Chế Biến">Phân Xưởng Chế Biến</option>
                    <option value="Phân Xưởng Đóng Gói">Phân Xưởng Đóng Gói</option>
                    <option value="Khối Kỹ Thuật Cơ Điện">Khối Kỹ Thuật Cơ Điện</option>
                    <option value="Kho Vận & Logistics">Kho Vận &amp; Logistics</option>
                    <option value="Khối Văn Phòng">Khối Văn Phòng</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1.5">
                <p className="font-bold">Điều lệ &amp; Cam kết đoàn viên:</p>
                <p className="text-[11px] leading-relaxed">
                  Tôi tự nguyện xin gia nhập Công đoàn Cơ sở Công ty Cổ phần An Việt Foods; cam kết chấp hành Điều lệ Công đoàn Việt Nam và đồng ý trích 1% tiền lương làm căn cứ đóng đoàn phí hàng tháng theo quy định.
                </p>
                <label className="flex items-center space-x-2 pt-1 cursor-pointer font-bold text-xs text-blue-950">
                  <input
                    type="checkbox"
                    checked={newUnionAppForm.consentDuesDeduction}
                    onChange={e => setNewUnionAppForm({ ...newUnionAppForm, consentDuesDeduction: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                    required
                  />
                  <span>Đồng ý cam kết trích 1% đoàn phí từ lương</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUnionAppModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Đơn Gia Nhập</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL KHAI BÁO ĐỀ XUẤT HƯỞNG PHÚC LỢI CÔNG ĐOÀN ── */}
      {showBenefitClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm">Khai Báo Hưởng Quyền Lợi Công Đoàn</h3>
              </div>
              <button
                onClick={() => setShowBenefitClaimModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const benefitMap: Record<string, { name: string; amount: number }> = {
                  'WEDDING': { name: 'Quà Mừng Kết Hôn', amount: 1000000 },
                  'CHILD_BIRTH': { name: 'Chúc Mừng Sinh Con', amount: 1000000 },
                  'HOSPITALIZATION': { name: 'Thăm Hỏi Ốm Đau Nằm Viện', amount: 500000 },
                  'BEREAVEMENT': { name: 'Trợ Cấp Hiếu Hỉ (Tứ thân phụ mẫu mất)', amount: 2000000 },
                  'SCHOLARSHIP': { name: 'Khen Thưởng Con Đạt Học Sinh Giỏi', amount: 500000 },
                  'EMERGENCY_AID': { name: 'Trợ Cấp Khó Khăn Đột Xuất', amount: 1500000 },
                };
                const info = benefitMap[newBenefitClaimForm.benefitType] || { name: 'Phúc Lợi Công Đoàn', amount: 1000000 };

                const newClaim: UnionBenefitClaim = {
                  id: 'PL-2026-00' + (unionBenefitClaims.length + 1),
                  empName: newBenefitClaimForm.empName,
                  empId: newBenefitClaimForm.empId,
                  dept: newBenefitClaimForm.dept,
                  benefitType: newBenefitClaimForm.benefitType,
                  benefitName: info.name + ' (' + info.amount.toLocaleString('vi-VN') + ' đ)',
                  amount: info.amount,
                  eventDate: newBenefitClaimForm.eventDate,
                  attachedDocNote: newBenefitClaimForm.attachedDocNote || 'Đã đối chiếu chứng từ gốc',
                  status: 'SUBMITTED'
                };

                setUnionBenefitClaims([newClaim, ...unionBenefitClaims]);
                setShowBenefitClaimModal(false);
                alert('✓ Đã nộp đề xuất hưởng chế độ phúc lợi công đoàn! BCH Công Đoàn sẽ thẩm định và duyệt chi.');
              }}
              className="p-2 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Họ &amp; Tên Đoàn Viên:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Lê Thị Thu Cúc"
                    value={newBenefitClaimForm.empName}
                    onChange={e => setNewBenefitClaimForm({ ...newBenefitClaimForm, empName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã NV &amp; Bộ Phận:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: AV-0522 - Văn Phòng"
                    value={newBenefitClaimForm.empId}
                    onChange={e => setNewBenefitClaimForm({ ...newBenefitClaimForm, empId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chế Độ Phúc Lợi Đề Xuất Hưởng:</label>
                <select
                  value={newBenefitClaimForm.benefitType}
                  onChange={e => setNewBenefitClaimForm({ ...newBenefitClaimForm, benefitType: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-600 font-semibold text-indigo-900"
                >
                  <option value="WEDDING">💍 Quà mừng kết hôn (1.000.000 đ)</option>
                  <option value="CHILD_BIRTH">👶 Chúc mừng sinh con (1.000.000 đ)</option>
                  <option value="HOSPITALIZATION">🏥 Thăm hỏi ốm đau nằm viện &ge; 3 ngày (500.000 đ)</option>
                  <option value="BEREAVEMENT">🕊️ Trợ cấp tứ thân phụ mẫu / vợ chồng mất (2.000.000 đ)</option>
                  <option value="SCHOLARSHIP">🎓 Khen thưởng con đạt giải HS Giỏi (500.000 đ)</option>
                  <option value="EMERGENCY_AID">🤝 Thăm hỏi hoàn cảnh khó khăn đột xuất (1.500.000 đ)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày Xảy Ra Sự Việc:</label>
                  <input
                    type="date"
                    required
                    value={newBenefitClaimForm.eventDate}
                    onChange={e => setNewBenefitClaimForm({ ...newBenefitClaimForm, eventDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô Tả Chứng Từ Kèm Theo:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Giấy chứng sinh, Giấy viện phí..."
                    value={newBenefitClaimForm.attachedDocNote}
                    onChange={e => setNewBenefitClaimForm({ ...newBenefitClaimForm, attachedDocNote: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic">
                * Sau khi BCH Công Đoàn duyệt, hệ thống sẽ tự động trừ tồn quỹ công đoàn và xuất phiếu chi ký nhận.
              </p>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBenefitClaimModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Khai Báo Chế Độ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL ĐỀ XUẤT CỨU TRỢ QUỸ TẤM LÒNG VÀNG (3 KÊNH) ── */}
      {showBenevolentClaimModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-200 fill-white" />
                <h3 className="font-bold text-sm">Đề Xuất Cứu Trợ Quỹ Tấm Lòng Vàng (3 Kênh)</h3>
              </div>
              <button
                onClick={() => setShowBenevolentClaimModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const channelLabels: Record<string, string> = {
                  'SELF': 'Bản thân tự khai báo',
                  'TWO_COWORKERS': '02 Đồng nghiệp khai báo hộ',
                  'DEPT_MANAGER': 'Quản lý trực tiếp lập tờ trình'
                };
                const submitter = newBenevolentClaimForm.submissionChannel === 'TWO_COWORKERS'
                  ? newBenevolentClaimForm.coworker1 + ' & ' + newBenevolentClaimForm.coworker2
                  : newBenevolentClaimForm.submissionChannel === 'DEPT_MANAGER'
                  ? newBenevolentClaimForm.managerInfo
                  : 'Bản thân tự làm đơn';

                const newClaim: BenevolentClaim = {
                  id: 'TL-2026-00' + (benevolentClaims.length + 1),
                  beneficiaryName: newBenevolentClaimForm.beneficiaryName,
                  beneficiaryEmpId: newBenevolentClaimForm.beneficiaryEmpId,
                  dept: newBenevolentClaimForm.dept,
                  submissionChannel: newBenevolentClaimForm.submissionChannel,
                  channelLabel: channelLabels[newBenevolentClaimForm.submissionChannel] || 'Đề xuất',
                  submitterInfo: submitter,
                  reason: newBenevolentClaimForm.reason,
                  proposedAmount: Number(newBenevolentClaimForm.proposedAmount) || 15000000,
                  status: 'SUBMITTED'
                };

                setBenevolentClaims([newClaim, ...benevolentClaims]);
                setShowBenevolentClaimModal(false);
                alert('✓ Đã tiếp nhận hồ sơ đề xuất cứu trợ Quỹ Tấm Lòng Vàng! Ban Quản Trị Quỹ sẽ thẩm định và giải ngân.');
              }}
              className="p-2 space-y-3 text-xs max-h-[85vh] overflow-y-auto"
            >
              {/* Lựa chọn kênh đề xuất */}
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <p className="font-bold text-rose-900 text-xs">Lựa chọn hình thức khai báo cứu trợ:</p>
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="submissionChannel"
                      checked={newBenevolentClaimForm.submissionChannel === 'SELF'}
                      onChange={() => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, submissionChannel: 'SELF' })}
                      className="text-rose-600"
                    />
                    <span>1. Bản thân tự khai báo khó khăn</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="submissionChannel"
                      checked={newBenevolentClaimForm.submissionChannel === 'TWO_COWORKERS'}
                      onChange={() => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, submissionChannel: 'TWO_COWORKERS' })}
                      className="text-rose-600"
                    />
                    <span>2. 02 Đồng nghiệp khai báo hộ (khi nạn nhân đang cấp cứu/hôn mê/khó khăn)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="submissionChannel"
                      checked={newBenevolentClaimForm.submissionChannel === 'DEPT_MANAGER'}
                      onChange={() => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, submissionChannel: 'DEPT_MANAGER' })}
                      className="text-rose-600"
                    />
                    <span>3. Quản lý trực tiếp (Trưởng phòng/Quản đốc xưởng) lập tờ trình đề xuất</span>
                  </label>
                </div>
              </div>

              {/* Thông tin người thụ hưởng */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Người Thụ Hưởng (Cần Cứu Trợ):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Thị Hằng"
                    value={newBenevolentClaimForm.beneficiaryName}
                    onChange={e => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, beneficiaryName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-rose-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã NV &amp; Bộ Phận:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: AV-0704 - Chế Biến"
                    value={newBenevolentClaimForm.beneficiaryEmpId}
                    onChange={e => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, beneficiaryEmpId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Chi tiết người khai báo hộ */}
              {newBenevolentClaimForm.submissionChannel === 'TWO_COWORKERS' && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-800 text-[11px]">Thông tin 02 Đồng nghiệp khai báo hộ:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Đồng nghiệp 1: Họ tên & Mã NV"
                      value={newBenevolentClaimForm.coworker1}
                      onChange={e => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, coworker1: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg outline-none focus:border-rose-600 text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Đồng nghiệp 2: Họ tên & Mã NV"
                      value={newBenevolentClaimForm.coworker2}
                      onChange={e => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, coworker2: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded-lg outline-none focus:border-rose-600 text-xs"
                    />
                  </div>
                </div>
              )}

              {newBenevolentClaimForm.submissionChannel === 'DEPT_MANAGER' && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800 text-[11px]">Thông tin Quản lý trực tiếp đề xuất:</p>
                  <input
                    type="text"
                    required
                    placeholder="VD: Anh Phạm Hữu Thắng (Quản Đốc Phân Xưởng Chế Biến)"
                    value={newBenevolentClaimForm.managerInfo}
                    onChange={e => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, managerInfo: e.target.value })}
                    className="w-full p-1.5 border border-slate-300 rounded-lg outline-none focus:border-rose-600 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô Tả Hoàn Cảnh Khó Khăn &amp; Biến Cố:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả cụ thể biến cố: hỏa hoạn, bệnh nan y, tai nạn rủi ro, gia cảnh ngặt nghèo..."
                  value={newBenevolentClaimForm.reason}
                  onChange={e => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, reason: e.target.value })}
                  className="w-full p-2.5 border border-rose-300 rounded-xl outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 bg-rose-50/20 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kinh Phí Cứu Trợ Đề Xuất (VNĐ):</label>
                <FormattedNumberInput
                  required
                  value={newBenevolentClaimForm.proposedAmount || 0}
                  onChange={val => setNewBenevolentClaimForm({ ...newBenevolentClaimForm, proposedAmount: val })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-rose-600 font-mono font-bold text-rose-700"
                  placeholder="VD: 5.000.000"
                  unit="VNĐ"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBenevolentClaimModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Hồ Sơ Cứu Trợ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL IN ĐƠN GIA NHẬP CÔNG ĐOÀN (A4 CHUẨN) ── */}
      {showPrintUnionAppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Mẫu Giấy: Đơn Xin Gia Nhập Công Đoàn Việt Nam
                </h3>
              </div>
              <button
                onClick={() => setShowPrintUnionAppModal(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 text-xs font-serif leading-relaxed text-slate-900 bg-white">

              <div className="flex items-center justify-between border-b pb-3">
                <div className="text-left">
                  <p className="font-bold text-sm uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-semibold text-xs italic">Độc lập - Tự do - Hạnh phúc</p>
                  <h2 className="text-base font-bold uppercase mt-2 text-blue-900">
                    ĐƠN XIN GIA NHẬP TỔ CHỨC CÔNG ĐOÀN VIỆT NAM
                  </h2>
                  <p className="text-[11px] italic text-slate-500">Kính gửi: Ban Chấp Hành Công Đoàn Cơ Sở An Việt Foods</p>
                </div>
                <div className="flex items-center space-x-2 border border-blue-200 p-2 rounded-lg bg-blue-50/50 shrink-0">
                  <QrCode className="w-9 h-9 text-blue-900" />
                  <div className="text-[9px] leading-tight text-blue-800 text-left">
                    <p className="font-bold uppercase">XÁC THỰC CÔNG ĐOÀN</p>
                    <p className="font-mono">VERIFY-{showPrintUnionAppModal.id}</p>
                    <p className="text-emerald-700 font-semibold">✓ Đơn điện tử hợp lệ</p>
                  </div>
                </div>
              </div>


              <div className="space-y-1.5">
                <p>Tôi tên là: <b>{showPrintUnionAppModal.empName}</b> - Mã nhân viên: <b>{showPrintUnionAppModal.empId}</b></p>
                <p>Hiện đang làm việc tại: <b>{showPrintUnionAppModal.dept}</b></p>
                <p>Ngày nộp đơn: <b>{showPrintUnionAppModal.applyDate}</b></p>
                <p>Sau khi nghiên cứu Điều lệ Công đoàn Việt Nam, tôi nhận thấy Công đoàn là tổ chức đại diện bảo vệ quyền và lợi ích hợp pháp, chính đáng của người lao động.</p>
                <p>Tôi tự nguyện làm đơn này kính xin Ban Chấp Hành Công đoàn cơ sở xem xét kết nạp tôi vào tổ chức Công đoàn Việt Nam.</p>
                <p><b>Tôi xin cam đoan:</b></p>
                <p>1. Thực hiện nghiêm túc Điều lệ Công đoàn Việt Nam và các nghị quyết của Công đoàn cấp trên.</p>
                <p>2. Đồng ý để Bộ phận Kế toán / Tiền lương trích 1% tiền lương tháng đóng đoàn phí công đoàn theo luật định.</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-center pt-4 mt-1.5 border-t">
                <div>
                  <p className="font-bold uppercase text-[11px]">TM. Ban Chấp Hành Công Đoàn</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký duyệt kết nạp)</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[11px]">Người Làm Đơn</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Mẫu in chuẩn A4 lưu trữ hồ sơ đoàn viên</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintUnionAppModal(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Đơn Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL IN PHIẾU CHI PHÚC LỢI CÔNG ĐOÀN ── */}
      {showPrintBenefitReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Mẫu Giấy: Phiếu Chi &amp; Biên Nhận Tiền Phúc Lợi Công Đoàn
                </h3>
              </div>
              <button
                onClick={() => setShowPrintBenefitReceiptModal(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 text-xs font-serif leading-relaxed text-slate-900 bg-white">

              <div className="flex items-center justify-between border-b pb-3">
                <div className="text-left">
                  <p className="font-bold text-sm uppercase">CÔNG TY CỔ PHẦN AN VIỆT FOODS</p>
                  <p className="font-bold text-xs uppercase text-slate-600">BAN CHẤP HÀNH CÔNG ĐOÀN CƠ SỞ</p>
                  <h2 className="text-base font-bold uppercase mt-1 text-indigo-900">
                    PHIẾU CHI TIỀN PHÚC LỢI ĐOÀN VIÊN CÔNG ĐOÀN
                  </h2>
                  <p className="text-[11px] italic text-slate-500">Mã phiếu: {showPrintBenefitReceiptModal.id} • Ngày lập: {showPrintBenefitReceiptModal.eventDate}</p>
                </div>
                <div className="flex items-center space-x-2 border border-emerald-300 p-2 rounded-lg bg-emerald-50/50 shrink-0">
                  <QrCode className="w-9 h-9 text-emerald-800" />
                  <div className="text-[9px] leading-tight text-slate-700 text-left">
                    <p className="font-bold uppercase text-emerald-900">XÁC THỰC TÀI CHÍNH</p>
                    <p className="font-mono">FIN-{showPrintBenefitReceiptModal.id}</p>
                    <p className="text-emerald-700 font-semibold">✓ Đã trừ sổ cái tồn quỹ</p>
                  </div>
                </div>
              </div>


              <div className="space-y-1.5">
                <p>Họ và tên người nhận tiền: <b>{showPrintBenefitReceiptModal.empName}</b> - Mã NV: <b>{showPrintBenefitReceiptModal.empId}</b></p>
                <p>Bộ phận / Phân xưởng: <b>{showPrintBenefitReceiptModal.dept}</b></p>
                <p>Lý do chi: <b>{showPrintBenefitReceiptModal.benefitName}</b></p>
                <p>Số tiền chi: <b className="text-emerald-700 text-sm font-mono">{showPrintBenefitReceiptModal.amount.toLocaleString('vi-VN')} VNĐ</b></p>
                <p>Chứng từ gốc đính kèm: <i>{showPrintBenefitReceiptModal.attachedDocNote}</i></p>
                <p>Nguồn kinh phí: <b>Quỹ Công Đoàn Cơ Sở</b> (Đã trích trừ trực tiếp vào sổ cái tồn quỹ).</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center pt-4 mt-1.5 border-t">
                <div>
                  <p className="font-bold uppercase text-[11px]">Chủ Tịch Công Đoàn</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký duyệt)</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[11px]">Kế Toán / Thủ Quỹ</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký xuất tiền)</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[11px]">Người Nhận Tiền</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Chứng từ kế toán lưu trữ hồ sơ tài chính công đoàn</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintBenefitReceiptModal(null)}
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
                  <span>In Phiếu Chi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL IN QUYẾT ĐỊNH & BIÊN NHẬN CỨU TRỢ QUỸ TẤM LÒNG VÀNG ── */}
      {showPrintBenevolentReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Mẫu Giấy: Quyết Định Trợ Cấp Cứu Trợ Quỹ Tấm Lòng Vàng
                </h3>
              </div>
              <button
                onClick={() => setShowPrintBenevolentReceiptModal(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 text-xs font-serif leading-relaxed text-slate-900 bg-white">

              <div className="flex items-center justify-between border-b pb-3">
                <div className="text-left">
                  <p className="font-bold text-sm uppercase">CÔNG TY CỔ PHẦN AN VIỆT FOODS</p>
                  <p className="font-bold text-xs uppercase text-rose-700">BAN ĐIỀU HÀNH QUỸ TẤM LÒNG VÀNG DOANH NGHIỆP</p>
                  <h2 className="text-base font-bold uppercase mt-1 text-rose-900">
                    QUYẾT ĐỊNH TRỢ CẤP HOÀN CẢNH KHÓ KHĂN ĐẶC BIỆT
                  </h2>
                  <p className="text-[11px] italic text-slate-500">Mã hồ sơ: {showPrintBenevolentReceiptModal.id}</p>
                </div>
                <div className="flex items-center space-x-2 border border-rose-300 p-2 rounded-lg bg-rose-50/50 shrink-0">
                  <QrCode className="w-9 h-9 text-rose-800" />
                  <div className="text-[9px] leading-tight text-slate-700 text-left">
                    <p className="font-bold uppercase text-rose-900">QUỸ TẤM LÒNG VÀNG</p>
                    <p className="font-mono">CHARITY-{showPrintBenevolentReceiptModal.id}</p>
                    <p className="text-emerald-700 font-semibold">✓ Đã duyệt giải ngân</p>
                  </div>
                </div>
              </div>


              <div className="space-y-1.5">
                <p>Căn cứ Quy chế Quỹ Tấm Lòng Vàng Doanh nghiệp và kết quả thẩm định thực tế;</p>
                <p><b>Quyết định trợ cấp đột xuất cho trường hợp:</b></p>
                <p>• Họ và tên: <b>{showPrintBenevolentReceiptModal.beneficiaryName}</b> - Mã NV: <b>{showPrintBenevolentReceiptModal.beneficiaryEmpId}</b></p>
                <p>• Đơn vị công tác: <b>{showPrintBenevolentReceiptModal.dept}</b></p>
                <p>• Kênh đề xuất: <b>{showPrintBenevolentReceiptModal.channelLabel}</b> ({showPrintBenevolentReceiptModal.submitterInfo})</p>
                <p>• Hoàn cảnh biến cố: <i>{showPrintBenevolentReceiptModal.reason}</i></p>
                <p>• Mức kinh phí hỗ trợ: <b className="text-rose-700 text-base font-mono">{showPrintBenevolentReceiptModal.proposedAmount.toLocaleString('vi-VN')} VNĐ</b></p>
                <p>• Nguồn chi: Trích xuất trực tiếp từ <b>Quỹ Tấm Lòng Vàng Doanh Nghiệp</b>.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center pt-4 mt-1.5 border-t">
                <div>
                  <p className="font-bold uppercase text-[11px]">Người Đề Xuất / Khai Hộ</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký tên)</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[11px]">Trưởng Ban Quản Trị Quỹ</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký duyệt)</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-[11px]">Người Nhận Trợ Cấp</p>
                  <p className="text-[10px] italic text-slate-400 mt-12">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Chứng từ minh bạch tài chính Quỹ Tấm Lòng Vàng</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintBenevolentReceiptModal(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Quyết Định</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* TRUNG TÂM IN THẺ NHÂN VIÊN CHUYÊN NGHIỆP: MỤC 1 (MỚI CHƯA IN) & MỤC 2 (CẤP LẠI) - THẺ ĐỨNG / THẺ NGANG */}
      {showPrintingHubModal && (
        <SmartBadgePrintingHubModal
          isOpen={showPrintingHubModal}
          onClose={() => setShowPrintingHubModal(false)}
          companyName={policy.companyName}
          allBadges={Object.values(badgesMap)}
          reissueRequests={reissueRequests}
          onUpdateRequests={setReissueRequests}
          onUpdateBadges={(updatedBadges) => {
            setBadgesMap(prev => {
              const next = { ...prev };
              updatedBadges.forEach(b => {
                next[b.employeeId] = b;
              });
              return next;
            });
          }}
          initialTab={printingHubInitialTab}
          badgeToView={printingHubBadgeToView}
        />
      )}

      {/* MODAL CẤP THẺ TỪ THÔNG MINH & IN THẺ NHÂN VIÊN KÈM MÃ QR ZALO CHUẨN */}
      {selectedBadgeToView && (
        <SmartEmployeeCardModal
          isOpen={!!selectedBadgeToView}
          onClose={() => setSelectedBadgeToView(null)}
          badgeConfig={selectedBadgeToView}
          companyName={policy.companyName}
          onSaveConfig={(updated) => {
            setBadgesMap(prev => ({ ...prev, [updated.employeeId]: updated }));
          }}
        />
      )}

      {/* MODAL QUẢN LÝ ĐỀ NGHỊ CẤP LẠI THẺ & IN THẺ HÀNG LOẠT KHỔ A4 */}
      {showReissueModal && (
        <SmartBadgeBatchPrintModal
          isOpen={showReissueModal}
          onClose={() => setShowReissueModal(false)}
          reissueRequests={reissueRequests}
          onUpdateRequests={setReissueRequests}
          allBadges={Object.values(badgesMap)}
          companyName={policy.companyName}
        />
      )}
    </div>
  );
};