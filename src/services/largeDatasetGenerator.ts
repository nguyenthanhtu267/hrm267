// ========================================================
// LARGE DATASET GENERATOR - DỮ LIỆU NHÂN SỰ LỚN TOÀN DIỆN
// Sinh 250 nhân sự trải rộng từ 2024 - 2026
// ========================================================

import { Employee, DisciplinaryRecord, JobCandidate, AttendanceRecord, OffboardingRecord } from '../types/hrm';
import { initialEmployees } from './mockData';

// Danh sách họ và tên đệm / tên thực tế Việt Nam
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn', 'Lâm', 'Trịnh'];
const middleNamesMale = ['Văn', 'Hữu', 'Đức', 'Quốc', 'Thành', 'Minh', 'Trọng', 'Đình', 'Xuân', 'Bảo', 'Gia', 'Hải'];
const middleNamesFemale = ['Thị', 'Thu', 'Thanh', 'Ngọc', 'Mai', 'Phương', 'Bích', 'Hồng', 'Mỹ', 'Như', 'Khánh', 'Ánh'];
const firstNamesMale = ['Hùng', 'Nam', 'Dũng', 'Tuấn', 'Long', 'Hoàng', 'Trung', 'Sơn', 'Tùng', 'Cường', 'Khoa', 'Tài', 'Đạt', 'Bình', 'Phong', 'Thắng', 'Tân', 'Khánh', 'Hiếu', 'Nghĩa'];
const firstNamesFemale = ['Trang', 'Hương', 'Linh', 'Hà', 'Lan', 'Mai', 'Thảo', 'Yến', 'Nhung', 'Hoa', 'Vy', 'Oanh', 'Hằng', 'Chi', 'Tuyết', 'Nga', 'Trâm', 'Ngân', 'Quyên', 'Châu'];

const departmentsByBranch: { branch: string; depts: { name: string; roles: { title: string; minSal: number; maxSal: number; toxic: 0 | 1 | 2 | 3 | 4 }[] }[] }[] = [
  {
    branch: 'Trụ Sở Chính TP.HCM',
    depts: [
      {
        name: 'Ban Tổng Giám Đốc',
        roles: [
          { title: 'Tổng Giám Đốc (CEO)', minSal: 150000000, maxSal: 200000000, toxic: 0 },
          { title: 'Phó Tổng Giám Đốc Vận Hành (COO)', minSal: 80000000, maxSal: 120000000, toxic: 0 },
          { title: 'Trợ Lý Ban Điều Hành', minSal: 22000000, maxSal: 35000000, toxic: 0 }
        ]
      },
      {
        name: 'Phòng Nhân Sự',
        roles: [
          { title: 'Trưởng Phòng Nhân Sự', minSal: 35000000, maxSal: 50000000, toxic: 0 },
          { title: 'Chuyên Viên C&B', minSal: 14000000, maxSal: 22000000, toxic: 0 },
          { title: 'Chuyên Viên Tuyển Dụng & Thu Hút Nhân Tài', minSal: 12000000, maxSal: 18000000, toxic: 0 },
          { title: 'Chuyên Viên Đào Tạo & Phát Triển (L&D)', minSal: 13000000, maxSal: 20000000, toxic: 0 }
        ]
      },
      {
        name: 'Phòng Tài Chính Kế Toán',
        roles: [
          { title: 'Kế Toán Trưởng', minSal: 40000000, maxSal: 60000000, toxic: 0 },
          { title: 'Kế Toán Tổng Hợp', minSal: 16000000, maxSal: 24000000, toxic: 0 },
          { title: 'Kế Toán Thanh Toán & Ngân Hàng', minSal: 12000000, maxSal: 16000000, toxic: 0 },
          { title: 'Kế Toán Kho & Giá Thành Sản Phẩm', minSal: 14000000, maxSal: 18000000, toxic: 0 },
          { title: 'Kế Toán Thuế & Báo Cáo Tài Chính', minSal: 16000000, maxSal: 25000000, toxic: 0 }
        ]
      },
      {
        name: 'Khối Kinh Doanh Toàn Quốc',
        roles: [
          { title: 'Giám Đốc Kinh Doanh Toàn Quốc (CCO)', minSal: 60000000, maxSal: 90000000, toxic: 0 },
          { title: 'Trưởng Nhóm Bán Lẻ Kênh GT Miền Nam', minSal: 25000000, maxSal: 40000000, toxic: 0 },
          { title: 'Trưởng Nhóm Bán Hàng Siêu Thị Kênh MT', minSal: 25000000, maxSal: 38000000, toxic: 0 },
          { title: 'Nhân Viên Phát Triển Thị Trường', minSal: 9000000, maxSal: 15000000, toxic: 0 },
          { title: 'Chuyên Viên Quản Trị Đơn Hàng & Dịch Vụ Khách Hàng', minSal: 11000000, maxSal: 16000000, toxic: 0 }
        ]
      },
      {
        name: 'Phòng Công Nghệ Thông Tin (IT)',
        roles: [
          { title: 'Trưởng Phòng CNTT & Chuyển Đổi Số', minSal: 40000000, maxSal: 60000000, toxic: 0 },
          { title: 'Kỹ Sư Hệ Thống Mạng & An Toàn Thông Tin', minSal: 18000000, maxSal: 30000000, toxic: 0 },
          { title: 'Chuyên Viên Quản Trị Hệ Thống ERP & HRM', minSal: 18000000, maxSal: 28000000, toxic: 0 },
          { title: 'Nhân Viên Kỹ Thuật IT Helpdesk', minSal: 10000000, maxSal: 15000000, toxic: 0 }
        ]
      }
    ]
  },
  {
    branch: 'Nhà Máy Chế Biến Thực Phẩm Bình Dương',
    depts: [
      {
        name: 'Ban Giám Đốc Nhà Máy',
        roles: [
          { title: 'Giám Đốc Nhà Máy', minSal: 50000000, maxSal: 80000000, toxic: 1 },
          { title: 'Phó Giám Đốc Kỹ Thuật Sản Xuất', minSal: 35000000, maxSal: 55000000, toxic: 1 }
        ]
      },
      {
        name: 'Phân Xưởng Đóng Gói',
        roles: [
          { title: 'Quản Đốc Phân Xưởng', minSal: 22000000, maxSal: 32000000, toxic: 2 },
          { title: 'Trưởng Ca Vận Hành Máy Đóng Gói', minSal: 14000000, maxSal: 18000000, toxic: 2 },
          { title: 'Kỹ Thuật Viên Máy Bao Bì Tự Động', minSal: 10000000, maxSal: 14000000, toxic: 2 },
          { title: 'Công Nhân Vận Hành Máy Dán Nhãn', minSal: 6500000, maxSal: 8500000, toxic: 2 },
          { title: 'Công Nhân Đóng Thùng & Xếp Pallet', minSal: 5310000, maxSal: 7500000, toxic: 2 },
          { title: 'Công Nhân Đóng Gói Thủ Công Hút Chân Không', minSal: 5310000, maxSal: 7000000, toxic: 2 }
        ]
      },
      {
        name: 'Phân Xưởng Chế Biến & Nhiệt Hóa',
        roles: [
          { title: 'Quản Đốc Phân Xưởng Nhiệt Hóa', minSal: 24000000, maxSal: 35000000, toxic: 3 },
          { title: 'Trưởng Ca Nấu Chiên Sấy Nhiệt Độ Cao', minSal: 15000000, maxSal: 20000000, toxic: 3 },
          { title: 'Kỹ Thuật Viên Nồi Hơi & Áp Suất', minSal: 12000000, maxSal: 16000000, toxic: 4 },
          { title: 'Công Nhân Vận Hành Dây Chuyền Sấy Liên Tục', minSal: 6800000, maxSal: 9000000, toxic: 3 },
          { title: 'Công Nhân Trực Lò Gia Nhiệt', minSal: 6500000, maxSal: 8500000, toxic: 4 }
        ]
      },
      {
        name: 'Phòng Quản Lý Chất Lượng (QA/QC)',
        roles: [
          { title: 'Trưởng Phòng Đảm Bảo Chất Lượng (QA)', minSal: 28000000, maxSal: 40000000, toxic: 1 },
          { title: 'Kỹ Sư Kiểm Soát Vi Sinh Phòng Thí Nghiệm', minSal: 14000000, maxSal: 20000000, toxic: 2 },
          { title: 'Chuyên Viên Giám Sát ATTP Dây Chuyền HACCP', minSal: 12000000, maxSal: 17000000, toxic: 2 },
          { title: 'Nhân Viên QC Kiểm Tra Nguyên Liệu Đầu Vào', minSal: 9000000, maxSal: 13000000, toxic: 1 },
          { title: 'Nhân Viên QC Kiểm Tra Thành Phẩm Xuất Kho', minSal: 9000000, maxSal: 13000000, toxic: 1 }
        ]
      },
      {
        name: 'Phòng Kỹ Thuật & Bảo Trì Cơ Điện',
        roles: [
          { title: 'Trưởng Phòng Cơ Điện (Maintenance Manager)', minSal: 30000000, maxSal: 45000000, toxic: 2 },
          { title: 'Kỹ Sư Tự Động Hóa PLC & Scada', minSal: 18000000, maxSal: 28000000, toxic: 2 },
          { title: 'Thợ Điện Công Nghiệp Trực Ca', minSal: 10000000, maxSal: 14000000, toxic: 2 },
          { title: 'Thợ Cơ Khí Sửa Chữa Băng Chuyền', minSal: 9500000, maxSal: 13500000, toxic: 2 }
        ]
      },
      {
        name: 'Kho Vận & Logistics',
        roles: [
          { title: 'Trưởng Kho Tổng Nhà Máy', minSal: 20000000, maxSal: 30000000, toxic: 1 },
          { title: 'Thủ Kho Nguyên Liệu & Phụ Gia Thực Phẩm', minSal: 11000000, maxSal: 16000000, toxic: 1 },
          { title: 'Thủ Kho Bao Bì & Thành Phẩm', minSal: 11000000, maxSal: 15000000, toxic: 1 },
          { title: 'Tài Xế Lái Xe Nâng Hàng (Forklift)', minSal: 9000000, maxSal: 13000000, toxic: 2 },
          { title: 'Nhân Viên Bốc Xếp & Kiểm Đếm Kho', minSal: 6500000, maxSal: 9000000, toxic: 2 }
        ]
      }
    ]
  },
  {
    branch: 'Chi Nhánh Cần Thơ & Kho Miền Tây',
    depts: [
      {
        name: 'Chi Nhánh Phân Phối Cần Thơ',
        roles: [
          { title: 'Giám Đốc Chi Nhánh Cần Thơ', minSal: 35000000, maxSal: 50000000, toxic: 0 },
          { title: 'Giám Sát Bán Hàng Khu Vực Mekong', minSal: 18000000, maxSal: 28000000, toxic: 0 },
          { title: 'Nhân Viên Kinh Doanh Thị Trường', minSal: 8000000, maxSal: 13000000, toxic: 0 },
          { title: 'Kế Toán Chi Nhánh', minSal: 10000000, maxSal: 15000000, toxic: 0 },
          { title: 'Thủ Kho Phân Phối', minSal: 8500000, maxSal: 12000000, toxic: 0 },
          { title: 'Tài Xế Xe Tải Giao Hàng', minSal: 9000000, maxSal: 14000000, toxic: 1 }
        ]
      }
    ]
  },
  {
    branch: 'Trạm Thu Mua Nông Sản Vùng Nguyên Liệu',
    depts: [
      {
        name: 'Trạm Thu Mua & Sơ Chế Thô',
        roles: [
          { title: 'Trạm Trưởng Thu Mua Vùng Nguyên Liệu', minSal: 20000000, maxSal: 30000000, toxic: 1 },
          { title: 'Nhân Viên Thẩm Định Chất Lượng Nông Sản', minSal: 9000000, maxSal: 14000000, toxic: 1 },
          { title: 'Công Nhân Sơ Chế Nông Sản Tại Trạm', minSal: 3700000, maxSal: 5500000, toxic: 1 },
          { title: 'Công Nhân Phân Loại Nông Sản', minSal: 3700000, maxSal: 5000000, toxic: 1 }
        ]
      }
    ]
  }
];

// Các kịch bản Kỷ luật & Sa thải chuẩn BLLĐ 2019
const disciplinaryTemplates: {
  infractionType: DisciplinaryRecord['infractionType'];
  desc: string;
  form: DisciplinaryRecord['form'];
  decisionPrefix: string;
}[] = [
  {
    infractionType: 'ASSAULT_FIGHTING',
    desc: 'Xô xát, đánh nhau gây thương tích cho đồng nghiệp tại khu vực tủ đồ cá nhân xưởng đóng gói trong giờ nghỉ giữa ca, gây mất trật tự an ninh nghiêm trọng (Vi phạm Khoản 1 Điều 125 BLLĐ 2019).',
    form: 'DISMISSAL',
    decisionPrefix: 'QĐ-ST/AVM-FIGHT'
  },
  {
    infractionType: 'THEFT',
    desc: 'Có hành vi trộm cắp 15 thùng phụ gia thực phẩm đặc dụng trị giá 18.500.000đ tại kho nguyên liệu, bị camera an ninh ghi nhận và lực lượng bảo vệ lập biên bản quả tang (Vi phạm Khoản 1 Điều 125 BLLĐ 2019).',
    form: 'DISMISSAL',
    decisionPrefix: 'QĐ-ST/AVM-THEFT'
  },
  {
    infractionType: 'REPEATED_NON_COMPLIANCE',
    desc: 'Tự ý bỏ việc 05 ngày làm việc cộng dồn trong thời hạn 30 ngày (từ 02/06 đến 28/06) mà không có lý do chính đáng, công ty đã gửi thông báo triệu tập 3 lần nhưng không phản hồi (Vi phạm Khoản 4 Điều 125 BLLĐ 2019).',
    form: 'DISMISSAL',
    decisionPrefix: 'QĐ-ST/AVM-ABSENT'
  },
  {
    infractionType: 'POOR_PERFORMANCE',
    desc: 'Thường xuyên không hoàn thành nhiệm vụ theo chỉ tiêu định mức chất lượng liên tiếp 3 tháng, đã được đào tạo bồi dưỡng lại và khiển trách bằng văn bản nhưng không khắc phục (Khoản 1 Điều 36 BLLĐ 2019).',
    form: 'DISMISSAL',
    decisionPrefix: 'QĐ-ST/AVM-PERF'
  },
  {
    infractionType: 'SAFETY_VIOLATION',
    desc: 'Cố ý tắt hệ thống cảm biến rò rỉ khí gas tại cụm lò sấy để đốt tắt công đoạn, đe dọa trực tiếp tính mạng của 40 công nhân ca làm việc.',
    form: 'DISMISSAL',
    decisionPrefix: 'QĐ-ST/AVM-SAFETY'
  },
  {
    infractionType: 'POOR_PERFORMANCE',
    desc: 'Giao hàng trễ hạn cho đối tác chiến lược 4 lần liên tiếp không báo cáo quản lý.',
    form: 'SALARY_DELAY',
    decisionPrefix: 'QĐ-KL/AVM-DELAY'
  },
  {
    infractionType: 'REPEATED_NON_COMPLIANCE',
    desc: 'Đi làm muộn trên 30 phút 8 lần trong 1 tháng mà không có đơn giải trình hợp lệ.',
    form: 'REPRIMAND',
    decisionPrefix: 'QĐ-KL/AVM-REP'
  }
];

/**
 * Sinh chuỗi ngày cách tuần từ 2024 đến 2026
 */
function getRandomJoinDate(index: number, total: number): string {
  const startDate = new Date('2024-01-08T00:00:00Z').getTime();
  const endDate = new Date('2026-08-20T00:00:00Z').getTime();
  const timeStep = (endDate - startDate) / total;
  const targetTime = startDate + index * timeStep + ((index % 5) - 2) * 86400000;
  const d = new Date(targetTime);
  return d.toISOString().split('T')[0];
}

/**
 * Tạo danh sách 6789 nhân sự quy mô lớn toàn diện
 * Phân bổ logic tuyệt đối:
 * - Tổng cộng: 6.789 nhân viên
 * - Chính thức (OFFICIAL): 6.000
 * - Thử việc (PROBATION): 180 (>= 10)
 * - Đang báo trước nghỉ (NOTICE_PERIOD): 85 (>= 10)
 * - Tạm hoãn / Thai sản (SUSPENDED): 95 (>= 10)
 * - Thôi việc (RESIGNED): 320 (>= 10)
 * - Kỷ luật sa thải (DISMISSED): 45 (>= 10)
 * - Cộng tác viên / Dịch vụ (CIVIL_SERVICE): 64 (>= 10)
 * Tổng cộng: 6000 + 180 + 85 + 95 + 320 + 45 + 64 = 6.789
 * Trường hợp đặc biệt:
 * - Dưới 18 tuổi (MINOR_UNDER_18): 15 người (>= 10)
 * - Người cao tuổi (ELDERLY_OVER_RETIREMENT): 25 người (>= 10)
 * - Có công nợ tạm ứng (debtBalance > 0): 60 người (>= 10)
 */
export function generate250Employees(): Employee[] {
  const targetTotal = 6789;
  const list: Employee[] = [];

  // Lấy các nhân viên gốc mẫu (16 người đầu tiên)
  const initialCount = Math.min(initialEmployees.length, targetTotal);
  for (let i = 0; i < initialCount; i++) {
    list.push({ ...initialEmployees[i], lunchAllowance: 1200000 });
  }

  const remaining = targetTotal - initialCount;

  // Hạn ngạch số lượng cho các trạng thái đặc biệt
  // Đã trừ số lượng có sẵn trong initialEmployees
  const initOfficial = initialEmployees.filter(e => e.status === 'OFFICIAL' && e.contractType !== 'CIVIL_SERVICE').length;
  const initProbation = initialEmployees.filter(e => e.status === 'PROBATION' || e.contractType === 'PROBATION').length;
  const initNotice = initialEmployees.filter(e => e.status === 'NOTICE_PERIOD').length;
  const initSuspended = initialEmployees.filter(e => e.status === 'SUSPENDED').length;
  const initResigned = initialEmployees.filter(e => e.status === 'RESIGNED').length;
  const initDismissed = initialEmployees.filter(e => e.status === 'DISMISSED').length;
  const initCivil = initialEmployees.filter(e => e.contractType === 'CIVIL_SERVICE' || e.isCivilContractor).length;

  const quota = {
    DISMISSED: Math.max(0, 45 - initDismissed),
    RESIGNED: Math.max(0, 320 - initResigned),
    SUSPENDED: Math.max(0, 95 - initSuspended),
    NOTICE_PERIOD: Math.max(0, 85 - initNotice),
    PROBATION: Math.max(0, 180 - initProbation),
    CIVIL_SERVICE: Math.max(0, 64 - initCivil),
  };

  let countDismissed = 0;
  let countResigned = 0;
  let countSuspended = 0;
  let countNotice = 0;
  let countProbation = 0;
  let countCivil = 0;
  let countMinor = 0;
  let countElderly = 0;
  let countDebt = 0;

  for (let i = initialCount; i < targetTotal; i++) {
    const empNum = i + 1;
    // 1. Tỷ lệ giới tính: 55% Nam, 45% Nữ
    const isMale = (i % 20 < 11);
    const lName = lastNames[i % lastNames.length];
    const mName = isMale ? middleNamesMale[(i * 3) % middleNamesMale.length] : middleNamesFemale[(i * 2) % middleNamesFemale.length];
    const fName = isMale ? firstNamesMale[(i * 7) % firstNamesMale.length] : firstNamesFemale[(i * 5) % firstNamesFemale.length];
    const fullName = `${lName} ${mName} ${fName}`;

    // 2. Chi nhánh & Phòng ban
    const branchObj = departmentsByBranch[i % departmentsByBranch.length];
    const availableDepts = branchObj.depts.filter(d => d.name !== 'Ban Tổng Giám Đốc');
    const deptObj = availableDepts.length > 0 ? availableDepts[(i * 2) % availableDepts.length] : branchObj.depts[0];
    const availableRoles = deptObj.roles.filter(r => !r.title.includes('Tổng Giám Đốc (CEO)'));
    const roleObj = availableRoles.length > 0 ? availableRoles[(i * 3) % availableRoles.length] : deptObj.roles[0];

    // 3. Lịch sử vào làm
    const startMs = new Date('2018-01-01T00:00:00Z').getTime();
    const endMs = new Date('2026-08-20T00:00:00Z').getTime();
    const dMs = startMs + (i / targetTotal) * (endMs - startMs);
    const joinDate = new Date(dMs).toISOString().split('T')[0];
    const joinYear = parseInt(joinDate.split('-')[0], 10);

    // 4. Trường hợp đặc biệt về độ tuổi (Vị thành niên >= 10, Cao tuổi >= 10)
    let birthYear = 1978 + (i % 26);
    let laborSpecialType: Employee['laborSpecialType'] = 'STANDARD';
    let maxDailyHoursAllowed: number | undefined = undefined;
    let guardianConsentFile: string | undefined = undefined;
    let healthCheckFrequencyMonths: number | undefined = undefined;
    let isExemptBhtn: boolean | undefined = undefined;

    if (countMinor < 15 && i % 300 === 0) {
      // Vị thành niên (15-17 tuổi)
      birthYear = 2009 + (countMinor % 2);
      laborSpecialType = 'MINOR_UNDER_18';
      maxDailyHoursAllowed = 7;
      guardianConsentFile = `Cam_Ket_Nguoi_Giam_Ho_AF_${empNum}.pdf`;
      healthCheckFrequencyMonths = 6;
      countMinor++;
    } else if (countElderly < 25 && (i % 250 === 0 || i % 250 === 1)) {
      // Người cao tuổi (61-65 tuổi)
      birthYear = 1961 + (countElderly % 5);
      laborSpecialType = 'ELDERLY_OVER_RETIREMENT';
      healthCheckFrequencyMonths = 6;
      isExemptBhtn = true;
      countElderly++;
    }

    const birthMonth = ((i % 12) + 1).toString().padStart(2, '0');
    const birthDay = ((i % 28) + 1).toString().padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    // 5. Vùng lương tối thiểu
    let salaryRegion: 1 | 2 | 3 | 4 = 1;
    let minWage = 5310000;
    if (branchObj.branch.includes('Cần Thơ')) {
      salaryRegion = 2;
      minWage = 4730000;
    } else if (branchObj.branch.includes('Nguyên Liệu') && roleObj.title.includes('Nông Sản')) {
      salaryRegion = 4;
      minWage = 3700000;
    } else if (branchObj.branch.includes('Nguyên Liệu')) {
      salaryRegion = 3;
      minWage = 4140000;
    }

    // 6. Lương cơ bản & Lương chức danh
    let baseSalary = 0;
    if (i % 35 === 0) {
      baseSalary = minWage;
    } else {
      const salSpread = roleObj.maxSal - roleObj.minSal;
      const factor = (i % 10) / 10;
      baseSalary = Math.round((roleObj.minSal + salSpread * factor) / 100000) * 100000;
    }
    const positionSalary = baseSalary > 30000000 ? Math.round(baseSalary * 0.2) : (i % 4 === 0 ? 1500000 : 0);

    // 7. Quyết định trạng thái theo HẠN NGẠCH chính xác 100%
    let status: Employee['status'] = 'OFFICIAL';
    let contractType: Employee['contractType'] = 'INDEFINITE';
    let contractEndDate: string | undefined = undefined;
    let disciplinaryRecord: DisciplinaryRecord | undefined = undefined;
    let isCivilContractor = false;

    if (countDismissed < quota.DISMISSED && (i % 140 === 0)) {
      status = 'DISMISSED';
      contractType = 'DEFINITE_12M';
      const dTemplate = disciplinaryTemplates[countDismissed % disciplinaryTemplates.length];
      const discYear = (countDismissed % 2 === 0) ? '2026' : '2025';
      const discDate = `${discYear}-06-20`;
      contractEndDate = discDate;
      disciplinaryRecord = {
        id: `DISC-${empNum}`,
        employeeId: `EMP-${empNum}`,
        employeeCode: `AF-${empNum.toString().padStart(4, '0')}`,
        employeeName: fullName,
        infractionType: dTemplate.infractionType,
        infractionDescription: dTemplate.desc,
        infractionDate: `${discYear}-06-05`,
        form: dTemplate.form,
        invitationLetterSentDate: `${discYear}-06-08`,
        meetingMinutesDate: `${discYear}-06-15`,
        unionRepresentativeAttended: true,
        decisionNumber: `${dTemplate.decisionPrefix}-${empNum}/${discYear}`,
        decisionDate: discDate,
        decisionSignerName: 'Nguyễn Văn Hùng',
        decisionSignerPosition: 'Tổng Giám Đốc',
        status: 'EXECUTED',
        attachments: [
          { name: 'Giay_Moi_Hop_Xu_Ly_Ky_Luat.pdf', type: 'PDF' },
          { name: 'Bien_Ban_Hop_Ky_Luat_Co_Cong_Doan.pdf', type: 'PDF' },
        ]
      };
      countDismissed++;
    } else if (countResigned < quota.RESIGNED && (i % 20 === 0)) {
      status = 'RESIGNED';
      contractType = 'DEFINITE_12M';
      contractEndDate = (countResigned % 3 === 0) ? '2026-08-10' : (countResigned % 3 === 1 ? '2026-05-15' : '2025-11-20');
      countResigned++;
    } else if (countSuspended < quota.SUSPENDED && (i % 65 === 0)) {
      status = 'SUSPENDED'; // Nghỉ thai sản / tạm hoãn HĐLĐ
      contractType = 'DEFINITE_24M';
      countSuspended++;
    } else if (countNotice < quota.NOTICE_PERIOD && (i % 75 === 0)) {
      status = 'NOTICE_PERIOD'; // Đang trong thời hạn báo trước
      contractType = 'DEFINITE_12M';
      countNotice++;
    } else if (countProbation < quota.PROBATION && (i % 35 === 0)) {
      status = 'PROBATION'; // Thử việc
      contractType = 'PROBATION';
      countProbation++;
    } else if (countCivil < quota.CIVIL_SERVICE && (i % 95 === 0)) {
      status = 'OFFICIAL';
      contractType = 'CIVIL_SERVICE'; // Hợp đồng dịch vụ cộng tác viên
      isCivilContractor = true;
      countCivil++;
    } else {
      // Còn lại là Chính thức (OFFICIAL)
      status = 'OFFICIAL';
      contractType = (i % 3 === 0) ? 'INDEFINITE' : (i % 3 === 1 ? 'DEFINITE_24M' : 'DEFINITE_12M');
    }

    // 8. Quản lý công nợ tạm ứng (debtBalance > 0 >= 10 người)
    let debtBalance: number | undefined = undefined;
    let debtNotes: string | undefined = undefined;
    if (countDebt < 60 && (i % 90 === 0)) {
      debtBalance = (countDebt % 5 + 1) * 2000000;
      debtNotes = 'Tạm ứng mua thiết bị kỹ thuật bảo hộ / tạm ứng công tác phí vùng nguyên liệu';
      countDebt++;
    }

    const codeNum = empNum.toString().padStart(4, '0');
    const annualLeaveTotal = 12 + Math.floor((2026 - joinYear) / 5) + (roleObj.toxic > 0 ? 2 : 0);

    const emp: Employee = {
      id: `EMP-${empNum}`,
      tenantId: 'TENANT-ASIAFOODS',
      code: `AF-${codeNum}`,
      fullName,
      gender: isMale ? 'MALE' : 'FEMALE',
      dob,
      phone: `09${Math.floor(10000000 + (i * 791) % 89999999)}`,
      email: `${fName.toLowerCase()}.${mName.toLowerCase()}${i}@anviet.vn`,
      cccd: `0790${birthYear.toString().slice(-2)}${Math.floor(100000 + (i * 357) % 899999)}`,
      cccdDate: '2021-05-15',
      cccdPlace: 'Cục Cảnh sát QLHC về TTXH',
      address: `${10 + (i % 150)} Đường Số ${1 + (i % 25)}, ${branchObj.branch.includes('Cần Thơ') ? 'TP. Cần Thơ' : 'Bình Dương'}`,
      branchId: branchObj.branch.includes('Cần Thơ') ? 'BR-03' : branchObj.branch.includes('Bình Dương') ? 'BR-02' : 'BR-01',
      branchName: branchObj.branch,
      departmentId: deptObj.name.includes('Đóng Gói') ? 'DEPT-06' : 'DEPT-02',
      departmentName: deptObj.name,
      position: roleObj.title,
      role: 'EMPLOYEE',
      status,
      contractType,
      contractNumber: `HDLD-${joinYear}-${codeNum}`,
      joinDate,
      contractStartDate: joinDate,
      contractEndDate,
      bankAccountNumber: `10${Math.floor(10000000 + (i * 883) % 89999999)}`,
      bankName: i % 3 === 0 ? 'Vietcombank' : i % 3 === 1 ? 'BIDV' : 'Techcombank',
      taxCode: `80${Math.floor(10000000 + (i * 641) % 89999999)}`,
      socialInsuranceNumber: status === 'PROBATION' ? '' : `79${Math.floor(10000000 + (i * 513) % 89999999)}`,
      numberOfDependents: i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
      baseSalary,
      positionSalary,
      lunchAllowance: 1200000, // Cập nhật mức 1.2 triệu
      transportAllowance: baseSalary > 20000000 ? 1500000 : 500000,
      phoneAllowance: baseSalary > 20000000 ? 1000000 : 0,
      toxicTier: roleObj.toxic,
      annualLeaveTotal,
      annualLeaveUsed: Math.min(annualLeaveTotal, (i % 7)),
      annualLeaveCarriedOver: (i % 6 === 0) ? 2 : 0,
      salaryRegion,
      debtBalance,
      debtNotes,
      disciplinaryRecord,
      probationRate: status === 'PROBATION' ? 0.85 : undefined,
      isCivilContractor,
      laborSpecialType,
      maxDailyHoursAllowed,
      guardianConsentFile,
      healthCheckFrequencyMonths,
      isExemptBhtn
    };

    list.push(emp);
  }

  return list;
}

export const comprehensiveCandidates: JobCandidate[] = [
  // CỘT 1: ỨNG VIÊN MỚI (NEW_APPLIED)
  {
    id: 'CAND-01',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Đỗ Hải Đăng',
    email: 'dang.dohai@gmail.com',
    phone: '0908112233',
    positionApplied: 'Kỹ Sư Quản Trị Hệ Thống ERP & HRM',
    departmentName: 'Phòng Công Nghệ Thông Tin (IT)',
    appliedDate: '2026-08-20',
    skills: ['ERP SAP', 'PostgreSQL', 'TypeScript', 'Docker', 'Bảo Mật Dữ Liệu'],
    experienceYears: 4,
    aiMatchScore: 84,
    aiReviewNotes: 'CV kinh nghiệm tốt về hạ tầng ERP cho chuỗi nhà máy sản xuất. Đã triển khai bảo mật chuẩn ISO 27001.',
    stage: 'NEW_APPLIED'
  },
  {
    id: 'CAND-02',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Lê Minh Thảo',
    email: 'thao.leminh.qa@gmail.com',
    phone: '0912334455',
    positionApplied: 'Chuyên Viên Giám Sát ATTP Dây Chuyền HACCP',
    departmentName: 'Phòng Quản Lý Chất Lượng (QA/QC)',
    appliedDate: '2026-08-22',
    skills: ['HACCP', 'ISO 22000', 'Kiểm nghiệm vi sinh', 'Auditor ATTP'],
    experienceYears: 3,
    aiMatchScore: 88,
    aiReviewNotes: 'Từng làm lead kiểm nghiệm tại tập đoàn thủy hải sản, chứng chỉ Lead Auditor HACCP còn hạn đến 2028.',
    stage: 'NEW_APPLIED'
  },
  {
    id: 'CAND-03',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Vũ Quốc Khánh',
    email: 'khanh.vu.sales@yahoo.com',
    phone: '0933778899',
    positionApplied: 'Nhân Viên Phát Triển Thị Trường',
    departmentName: 'Khối Kinh Doanh Toàn Quốc',
    appliedDate: '2026-08-23',
    skills: ['Bán hàng FMCG', 'Mở điểm bán lẻ GT', 'Khai thác NPP miền Tây'],
    experienceYears: 2,
    aiMatchScore: 72,
    aiReviewNotes: 'Kỹ năng giao tiếp tự tin, có xe máy cá nhân và am hiểu thị trường Tiền Giang, Bến Tre.',
    stage: 'NEW_APPLIED'
  },
  {
    id: 'CAND-04',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Trương Ngọc Ánh',
    email: 'anh.truongngoc@outlook.com',
    phone: '0944556677',
    positionApplied: 'Kế Toán Kho & Giá Thành Sản Phẩm',
    departmentName: 'Phòng Tài Chính Kế Toán',
    appliedDate: '2026-08-24',
    skills: ['Tính giá thành định mức', 'Kế toán kho Misa/Fast', 'Kiểm kê thực tế'],
    experienceYears: 5,
    aiMatchScore: 90,
    aiReviewNotes: 'Chuyên sâu giá thành sản xuất thực phẩm đóng hộp, đối soát chênh lệch định mức nguyên liệu hao hụt chuẩn xác.',
    stage: 'NEW_APPLIED'
  },

  // CỘT 2: AI SƠ TUYỂN ĐẠT CHUẨN >70% (AI_SCREENED)
  {
    id: 'CAND-05',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Bùi Thanh Phong',
    email: 'phong.buithanh@gmail.com',
    phone: '0988112244',
    positionApplied: 'Kỹ Sư Công Nghệ Thực Phẩm (R&D)',
    departmentName: 'Phòng Nghiên Cứu & Phát Triển (R&D)',
    appliedDate: '2026-08-18',
    skills: ['R&D Thực Phẩm', 'Công thức gia vị', 'Bảo quản sấy thăng hoa', 'Cảm quan thực phẩm'],
    experienceYears: 6,
    aiMatchScore: 94,
    aiReviewNotes: 'Điểm tương thích xuất sắc 94%. Đã từng chủ trì 3 dự án tung sản phẩm gia vị mì ăn liền xuất khẩu EU.',
    stage: 'AI_SCREENED'
  },
  {
    id: 'CAND-06',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Nguyễn Thị Ngọc Hân',
    email: 'han.nguyen.cb@gmail.com',
    phone: '0977223344',
    positionApplied: 'Chuyên Viên C&B (Tiền Lương & Chế Độ)',
    departmentName: 'Phòng Nhân Sự',
    appliedDate: '2026-08-17',
    skills: ['BLLĐ 2019', 'Nghị định 293/2025 Lương tối thiểu', 'Thuế TNCN 7 bậc', 'Excel hàm nâng cao'],
    experienceYears: 4,
    aiMatchScore: 91,
    aiReviewNotes: 'Nắm vững luật lao động, đã làm quyết toán thuế TNCN cho hơn 800 công nhân, giải quyết phép tồn và thai sản chuẩn.',
    stage: 'AI_SCREENED'
  },
  {
    id: 'CAND-07',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Phạm Đức Trọng',
    email: 'trong.phamduc.plc@gmail.com',
    phone: '0938445566',
    positionApplied: 'Kỹ Sư Tự Động Hóa PLC & Scada',
    departmentName: 'Phòng Kỹ Thuật & Bảo Trì Cơ Điện',
    appliedDate: '2026-08-19',
    skills: ['Lập trình PLC Siemens S7-1200', 'Biến tần Mitsubishi', 'SCADA WinCC', 'Bảo dưỡng định kỳ'],
    experienceYears: 5,
    aiMatchScore: 86,
    aiReviewNotes: 'Có kinh nghiệm lập trình điều khiển dây chuyền đóng gói bánh kẹo và nước giải khát tự động.',
    stage: 'AI_SCREENED'
  },
  {
    id: 'CAND-08',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Hoàng Mỹ Duyên',
    email: 'duyen.hoangmy@gmail.com',
    phone: '0903889900',
    positionApplied: 'Trưởng Nhóm Bán Hàng Siêu Thị Kênh MT',
    departmentName: 'Khối Kinh Doanh Toàn Quốc',
    appliedDate: '2026-08-16',
    skills: ['Quản lý kênh BigC/Coopmart', 'Đàm phán chiết khấu quầy kệ', 'Thúc đẩy Trade Promotion'],
    experienceYears: 7,
    aiMatchScore: 89,
    aiReviewNotes: 'Mối quan hệ tốt với các Buyer chuỗi siêu thị lớn, quản lý đội PG chuyên nghiệp.',
    stage: 'AI_SCREENED'
  },

  // CỘT 3: ĐANG PHỎNG VẤN (INTERVIEWING)
  {
    id: 'CAND-09',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Trần Văn Kiên',
    email: 'kien.tranvan.factory@gmail.com',
    phone: '0918776655',
    positionApplied: 'Quản Đốc Phân Xưởng Đóng Gói',
    departmentName: 'Phân Xưởng Đóng Gói',
    appliedDate: '2026-08-10',
    interviewDate: '2026-08-28 09:30',
    interviewNotes: 'Vòng 2: Phỏng vấn trực tiếp với Giám Đốc Nhà Máy & Trưởng Phòng Nhân Sự tại nhà máy Bình Dương.',
    skills: ['Lean Manufacturing', 'Quản trị 5S', 'Điều phối 3 ca sản xuất', 'OEE Dây chuyền'],
    experienceYears: 8,
    aiMatchScore: 92,
    aiReviewNotes: 'Ứng viên sáng giá cho vị trí quản đốc, phong thái lãnh đạo công nhân tốt, cam kết giảm tỷ lệ phế phẩm < 0.5%.',
    stage: 'INTERVIEWING'
  },
  {
    id: 'CAND-10',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Ngô Thanh Huyền',
    email: 'huyen.ngothanh@gmail.com',
    phone: '0937221199',
    positionApplied: 'Chuyên Viên Tuyển Dụng & Thu Hút Nhân Tài',
    departmentName: 'Phòng Nhân Sự',
    appliedDate: '2026-08-12',
    interviewDate: '2026-08-28 14:00',
    interviewNotes: 'Vòng 1: Phỏng vấn chuyên môn với Trưởng Phòng Nhân Sự.',
    skills: ['Headhunting cấp quản lý', 'Tổ chức ngày hội việc làm công nhân', 'Employer Branding'],
    experienceYears: 4,
    aiMatchScore: 85,
    aiReviewNotes: 'Nhanh nhẹn, có nguồn ứng viên công nhân dồi dào từ các tỉnh miền Tây và Tây Nguyên.',
    stage: 'INTERVIEWING'
  },
  {
    id: 'CAND-11',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Lâm Gia Bảo',
    email: 'bao.lamgia.forklift@gmail.com',
    phone: '0966442211',
    positionApplied: 'Tài Xế Lái Xe Nâng Hàng (Forklift)',
    departmentName: 'Kho Vận & Logistics',
    appliedDate: '2026-08-14',
    interviewDate: '2026-08-27 10:00',
    interviewNotes: 'Đã test tay lái nâng hàng xếp tầng 5 an toàn tuyệt đối.',
    skills: ['Bằng lái xe nâng hàng kiểm định', 'Xếp pallet giá cao', 'Kiểm tra an toàn bình điện'],
    experienceYears: 6,
    aiMatchScore: 88,
    aiReviewNotes: 'Thao tác nâng hạ chuẩn xác, cẩn thận, hồ sơ lý lịch tư pháp trong sạch.',
    stage: 'INTERVIEWING'
  },

  // CỘT 4: ĐÃ GỬI OFFER (OFFERED)
  {
    id: 'CAND-12',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Đoàn Nhật Nam',
    email: 'nam.doannhat.audit@gmail.com',
    phone: '0909667788',
    positionApplied: 'Kế Toán Trưởng',
    departmentName: 'Phòng Tài Chính Kế Toán',
    appliedDate: '2026-08-05',
    offeredSalary: 45000000,
    skills: ['Chứng chỉ Kế toán trưởng', 'Kiểm toán Big4', 'Hạch toán TT 200', 'Thuế TNDN'],
    experienceYears: 10,
    aiMatchScore: 96,
    aiReviewNotes: 'Kế toán trưởng dày dặn kinh nghiệm, nắm vững các chuẩn mực kiểm toán và tối ưu hóa dòng tiền doanh nghiệp.',
    stage: 'OFFERED'
  },
  {
    id: 'CAND-13',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Nguyễn Bích Phương',
    email: 'phuong.nguyenbich.food@gmail.com',
    phone: '0982334411',
    positionApplied: 'Kỹ Sư Kiểm Soát Vi Sinh Phòng Thí Nghiệm',
    departmentName: 'Phòng Quản Lý Chất Lượng (QA/QC)',
    appliedDate: '2026-08-08',
    offeredSalary: 16000000,
    skills: ['Nuôi cấy vi sinh', 'PCR kiểm tra khuẩn Salmonella', 'Thực hành phòng Lab GLP'],
    experienceYears: 4,
    aiMatchScore: 90,
    aiReviewNotes: 'Đã thông qua đàm phán lương 16.000.000đ + phụ cấp sữa độc hại mức 2.',
    stage: 'OFFERED'
  },
  {
    id: 'CAND-14',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Huỳnh Văn Toàn',
    email: 'toan.huynhvan@gmail.com',
    phone: '0944112288',
    positionApplied: 'Thợ Điện Công Nghiệp Trực Ca',
    departmentName: 'Phòng Kỹ Thuật & Bảo Trì Cơ Điện',
    appliedDate: '2026-08-09',
    offeredSalary: 12500000,
    skills: ['Đấu nối tủ điện 3 pha', 'Xử lý sự cố mất pha', 'An toàn điện cao thế'],
    experienceYears: 5,
    aiMatchScore: 87,
    aiReviewNotes: 'Sẵn sàng đi ca đêm, đã gửi thư mời nhận việc ngày 01/09/2026.',
    stage: 'OFFERED'
  },

  // CỘT 5: ĐÃ NHẬN VIỆC (HIRED - Chuyển sang Thử Việc)
  {
    id: 'CAND-15',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Võ Minh Quân',
    email: 'quan.vominh.tech@gmail.com',
    phone: '0979887766',
    positionApplied: 'Kỹ Sư Hệ Thống Mạng & An Toàn Thông Tin',
    departmentName: 'Phòng Công Nghệ Thông Tin (IT)',
    appliedDate: '2026-08-01',
    offeredSalary: 22000000,
    skills: ['Cisco CCNA', 'Firewall Fortinet', 'VPN Site-to-site', 'Backup Veeam'],
    experienceYears: 5,
    aiMatchScore: 93,
    aiReviewNotes: 'Đã hoàn tất thủ tục onboarding và ký HĐLĐ thử việc 60 ngày.',
    stage: 'HIRED'
  },
  {
    id: 'CAND-16',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Lê Thu Trang',
    email: 'trang.lethu.sales@gmail.com',
    phone: '0919554433',
    positionApplied: 'Chuyên Viên Quản Trị Đơn Hàng & Dịch Vụ Khách Hàng',
    departmentName: 'Khối Kinh Doanh Toàn Quốc',
    appliedDate: '2026-08-02',
    offeredSalary: 13000000,
    skills: ['Xử lý PO siêu thị', 'Theo dõi tồn kho', 'Điều phối giao vận'],
    experienceYears: 3,
    aiMatchScore: 89,
    aiReviewNotes: 'Bắt đầu làm việc từ ngày 15/08/2026, hòa nhập tốt với phòng kinh doanh.',
    stage: 'HIRED'
  },
  {
    id: 'CAND-17',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Phan Quốc Hưng',
    email: 'hung.phanquoc.boiler@gmail.com',
    phone: '0932665544',
    positionApplied: 'Kỹ Thuật Viên Nồi Hơi & Áp Suất',
    departmentName: 'Phân Xưởng Chế Biến & Nhiệt Hóa',
    appliedDate: '2026-08-03',
    offeredSalary: 14500000,
    skills: ['Vận hành lò hơi đốt than/biomass', 'Chứng chỉ an toàn thiết bị áp lực', 'Xử lý nước cấp lò hơi'],
    experienceYears: 6,
    aiMatchScore: 91,
    aiReviewNotes: 'Đã nhận việc, hưởng phụ cấp độc hại sữa mức 4 (32.000đ/ngày).',
    stage: 'HIRED'
  },
  {
    id: 'CAND-18',
    tenantId: 'TENANT-ASIAFOODS',
    fullName: 'Đinh Thị Cẩm Tú',
    email: 'tu.dinhthicam@gmail.com',
    phone: '0902119933',
    positionApplied: 'Công Nhân Đóng Thùng & Xếp Pallet',
    departmentName: 'Phân Xưởng Đóng Gói',
    appliedDate: '2026-08-04',
    offeredSalary: 6200000,
    skills: ['Nhanh nhẹn', 'Sức khỏe tốt', 'Làm việc theo ca kíp'],
    experienceYears: 2,
    aiMatchScore: 82,
    aiReviewNotes: 'Đã được khám sức khỏe định kỳ và cấp phát đồ bảo hộ lao động.',
    stage: 'HIRED'
  }
];

/**
 * Sinh dữ liệu nhật ký chấm công hàng ngày cho toàn bộ nhân viên thực tế đang làm việc
 * Tuyệt đối tôn trọng: Ngày vào làm (joinDate), Ngày nghỉ việc/sa thải (resignation/dismissal), Trạng thái hoãn (SUSPENDED)
 */
export function generateDailyAttendanceForEmployees(
  employees: Employee[],
  targetDate: string = '2026-08-25'
): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];

  for (let idx = 0; idx < employees.length; idx++) {
    const emp = employees[idx];
    if (emp.tenantId !== 'TENANT-ASIAFOODS') continue;

    // 1. Chưa đến ngày vào làm: Tuyệt đối không chấm công
    if (emp.joinDate > targetDate) {
      continue;
    }

    // 2. Đã nghỉ việc hoặc bị sa thải trước ngày này: Tuyệt đối không chấm công
    const exitDate = emp.contractEndDate || (emp.status === 'DISMISSED' ? emp.disciplinaryRecord?.decisionDate : undefined);
    if ((emp.status === 'RESIGNED' || emp.status === 'DISMISSED') && exitDate && targetDate > exitDate) {
      continue;
    }

    // 3. Tạm hoãn HĐLĐ (nghỉ thai sản, nghĩa vụ quân sự, tạm hoãn không lương): Không phát sinh chấm công thực tế
    if (emp.status === 'SUSPENDED') {
      continue;
    }

    // 4. Xác định Ca làm việc và Phương thức chấm công theo bộ phận
    const isFactory = emp.departmentName.includes('Đóng Gói') || 
                      emp.departmentName.includes('Nhiệt Hóa') || 
                      emp.departmentName.includes('Cơ Điện') ||
                      emp.departmentName.includes('Sơ Chế') ||
                      emp.departmentName.includes('Xưởng');
    const isIT = emp.departmentName.includes('Công Nghệ Thông Tin');
    const isLogistics = emp.departmentName.includes('Kho Vận');

    let shiftCode = 'CA-HC';
    let standardWorkHours = 8.0;
    let scheduledIn = '08:00';
    let scheduledOut = '17:00';
    let isNightShift = false;
    let source: AttendanceRecord['source'] = 'BIOMETRIC_DEVICE';

    if (isIT) {
      source = 'WEB_PORTAL';
    } else if (isFactory) {
      source = 'BIOMETRIC_DEVICE';
      // Phân bổ ca nhà máy: 50% Ca 1 (sáng), 30% Ca 2 (chiều), 20% Ca 3 (đêm)
      const shiftMod = idx % 5;
      if (shiftMod === 0 || shiftMod === 1 || shiftMod === 2) {
        shiftCode = 'CA-1';
        scheduledIn = '06:00';
        scheduledOut = '14:00';
        standardWorkHours = 7.25;
      } else if (shiftMod === 3) {
        shiftCode = 'CA-2';
        scheduledIn = '14:00';
        scheduledOut = '22:00';
        standardWorkHours = 7.25;
      } else {
        shiftCode = 'CA-3';
        scheduledIn = '22:00';
        scheduledOut = '06:00';
        standardWorkHours = 7.0;
        isNightShift = true;
      }
    } else if (isLogistics) {
      source = 'BIOMETRIC_DEVICE';
      shiftCode = 'CA-HC';
      scheduledIn = '07:30';
      scheduledOut = '16:30';
      standardWorkHours = 8.0;
    } else {
      source = (idx % 2 === 0) ? 'MOBILE_GPS_FACE' : 'BIOMETRIC_DEVICE';
    }

    // 5. Phân phối độ đúng giờ thực tế & Giờ công
    let status: AttendanceRecord['status'] = 'PRESENT';
    let lateMinutes = 0;
    let earlyMinutes = 0;
    let deductedWorkHours = 0;
    let actualWorkHours = standardWorkHours;
    let checkIn = scheduledIn;
    let checkOut = scheduledOut;
    let notes = 'Đúng giờ';

    const pMod = idx % 25;
    if (pMod === 5 || pMod === 12) {
      // Đi muộn 4-9 phút (mức 1 hoặc 2: trừ 0.5h hoặc 1h công theo quy ước)
      lateMinutes = pMod === 5 ? 4 : 9;
      status = 'LATE';
      deductedWorkHours = lateMinutes <= 5 ? 0.5 : 1.0;
      actualWorkHours = Math.max(0, standardWorkHours - deductedWorkHours);
      
      const [h, m] = scheduledIn.split(':').map(Number);
      const newM = m + lateMinutes;
      checkIn = `${h.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
      notes = `Đi trễ ${lateMinutes} phút: trừ ${deductedWorkHours}h công theo Bảng quy ước`;
    } else if (pMod === 18) {
      // Đi muộn 18 phút (mức 3: trễ >15m trừ 4h công)
      lateMinutes = 18;
      status = 'LATE';
      deductedWorkHours = 4.0;
      actualWorkHours = Math.max(0, standardWorkHours - deductedWorkHours);
      const [h, m] = scheduledIn.split(':').map(Number);
      checkIn = `${h.toString().padStart(2, '0')}:${(m + lateMinutes).toString().padStart(2, '0')}`;
      notes = `Đi muộn ${lateMinutes} phút (>15m): Không tính công nửa ca theo Bảng quy ước`;
    } else if (isIT && pMod === 7) {
      status = 'ONLINE_WORK';
      notes = 'Làm việc Online từ xa (Chấm công qua Web Portal)';
    } else {
      // Đúng giờ: vào sớm 2-7 phút
      const earlyM = 2 + (idx % 6);
      const [h, m] = scheduledIn.split(':').map(Number);
      let inH = h, inM = m - earlyM;
      if (inM < 0) { inH -= 1; inM += 60; }
      checkIn = `${inH.toString().padStart(2, '0')}:${inM.toString().padStart(2, '0')}`;
      notes = isNightShift ? 'Ca đêm 22h-06h: Hưởng +30% phụ cấp đêm và sữa hộp TT24' : 'Đúng giờ';
    }

    const nightHours = isNightShift ? 7.0 : 0;

    records.push({
      id: `ATT-${targetDate}-${emp.code}`,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      date: targetDate,
      shiftCode,
      checkIn,
      checkOut,
      lateMinutes,
      earlyMinutes,
      deductedWorkHours,
      actualWorkHours,
      standardWorkHours,
      normalOtHours: (idx % 15 === 0 && isFactory) ? 2.0 : 0,
      weekendOtHours: 0,
      holidayOtHours: 0,
      nightHours,
      nightOtHours: 0,
      source,
      status,
      notes,
    });
  }

  return records;
}

/**
 * Sinh hồ sơ thanh lý quyết toán thôi việc đầy đủ cho tất cả nhân viên RESIGNED và DISMISSED
 */
export function generateOffboardingRecords(employees: Employee[]): OffboardingRecord[] {
  const offboardings: OffboardingRecord[] = [];
  const offEmps = employees.filter(e => e.status === 'RESIGNED' || e.status === 'DISMISSED');

  offEmps.forEach((emp, idx) => {
    const isDismissed = emp.status === 'DISMISSED';
    const exitDate = emp.contractEndDate || (isDismissed ? emp.disciplinaryRecord?.decisionDate || '2026-06-25' : '2026-05-15');
    
    // Tính lương ngày công còn lại
    const dailyRate = Math.round((emp.baseSalary + emp.positionSalary) / 26);
    const remainingDays = isDismissed ? 0 : Math.max(0, 10 - (idx % 6));
    const remainingDaysSalary = remainingDays * dailyRate;

    // Phép tồn
    const remainingLeaveDays = Math.max(0, (emp.annualLeaveTotal || 12) - (emp.annualLeaveUsed || 4));
    const remainingLeavePay = remainingLeaveDays * dailyRate;

    // Trợ cấp thôi việc Điều 46 BLLĐ 2019
    const joinYear = parseInt(emp.joinDate.split('-')[0] || '2024');
    const severancePay = joinYear <= 2008 ? Math.round(emp.baseSalary * 1.5) : 0;

    // Công nợ khấu trừ
    const deductionDebt = emp.debtBalance || 0;

    const netSettlementAmount = Math.max(0, remainingDaysSalary + remainingLeavePay + severancePay - deductionDebt);
    const isPast = exitDate < '2026-08-01';

    offboardings.push({
      id: `OFF-${emp.code}`,
      tenantId: emp.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      position: emp.position,
      resignationDate: exitDate,
      lastWorkingDate: exitDate,
      reason: isDismissed 
        ? `Sa thải kỷ luật theo ${emp.disciplinaryRecord?.decisionNumber || 'QĐ-ST'}: ${emp.disciplinaryRecord?.infractionDescription || 'Vi phạm nội quy lao động nghiêm trọng'}`
        : (idx % 2 === 0 ? 'Có nguyện vọng cá nhân chuyển đổi định hướng nghề nghiệp' : 'Chuyển nơi cư trú về quê cùng gia đình'),
      handoverWorkCompleted: isPast ? true : (idx % 2 === 0),
      handoverAssetCompleted: isPast ? true : (idx % 3 === 0),
      handoverItAccountCompleted: isPast ? true : true,
      handoverFinanceCompleted: isPast ? true : (idx % 2 === 0),
      remainingDaysSalary,
      remainingLeaveDays,
      remainingLeavePay,
      severancePay,
      deductionDebt,
      netSettlementAmount,
      paymentDeadlineOption: 'WITHIN_14_DAYS',
      status: isPast ? 'COMPLETED' : 'IN_PROGRESS',
      accountLockoutStatus: isPast ? 'LOCKED_POST_SHIFT' : 'SCHEDULED_LOCK',
      lockoutEffectiveTime: `17:30 ngày ${exitDate} (Sau ca làm việc cuối)`,
      preserveDataAudit: true,
    });
  });

  return offboardings;
}


/**
 * Sinh danh sách 390+ Đơn Từ Toàn Doanh Nghiệp (60-90 đơn mỗi loại theo yêu cầu)
 * Bao gồm: Nghỉ phép, Làm thêm giờ (OT), Giải trình bổ sung công, Tạm ứng lương, Hoán đổi ca, Thôi việc & Rút đơn thôi việc
 */
export function generateRichWorkflowRequests(employees: Employee[]): WorkflowRequest[] {
  const requests: WorkflowRequest[] = [];
  if (!employees || employees.length === 0) return requests;

  const tenantEmployees = employees.filter(e => e.tenantId === 'TENANT-ASIAFOODS');
  const pool = tenantEmployees.length > 0 ? tenantEmployees : employees;

  const leaveReasons = [
    { title: 'Đơn xin nghỉ phép năm 1 ngày', reason: 'Giải quyết công việc gia đình cá nhân', type: 'ANNUAL' as const, days: 1 },
    { title: 'Đơn xin nghỉ phép năm 2 ngày', reason: 'Về quê thăm người thân lớn tuổi', type: 'ANNUAL' as const, days: 2 },
    { title: 'Đơn xin nghỉ phép năm 3 ngày', reason: 'Nghỉ dưỡng sức và tái tạo năng lượng', type: 'ANNUAL' as const, days: 3 },
    { title: 'Đơn xin nghỉ ốm hưởng trợ cấp BHXH', reason: 'Bị sốt xuất huyết nhập viện điều trị theo chỉ định bác sĩ', type: 'SICK' as const, days: 4 },
    { title: 'Đơn xin nghỉ thai sản 6 tháng', reason: 'Sinh con đầu lòng theo chế độ thai sản Luật BHXH', type: 'MATERNITY' as const, days: 180 },
    { title: 'Đơn xin nghỉ việc riêng có lương', reason: 'Kết hôn theo quy định Điều 115 Bộ luật Lao động', type: 'SPECIAL_PAID' as const, days: 3 },
    { title: 'Đơn xin nghỉ việc riêng có lương', reason: 'Bố mẹ ruột mất theo Điều 115 BLLĐ', type: 'SPECIAL_PAID' as const, days: 3 },
    { title: 'Đơn xin nghỉ không hưởng lương', reason: 'Việc gia đình đột xuất không còn phép năm', type: 'UNPAID' as const, days: 2 },
  ];

  const otReasons = [
    { title: 'Đăng ký làm thêm giờ ca tối (2h)', reason: 'Tăng ca hoàn thành đơn hàng xuất khẩu gấp theo tiến độ', hours: 2 },
    { title: 'Đăng ký làm thêm giờ ca tối (3.5h)', reason: 'Xử lý đóng gói lô thực phẩm chế biến giao siêu thị', hours: 3.5 },
    { title: 'Đăng ký tăng ca thứ 7 (8h)', reason: 'Vận hành dây chuyền sản xuất bù công suất định kỳ', hours: 8 },
    { title: 'Đăng ký tăng ca Chủ Nhật (8h)', reason: 'Bảo trì lớn và kiểm thử máy móc đóng gói tự động', hours: 8 },
    { title: 'Đăng ký trực ca đêm ngày lễ', reason: 'Trực kỹ thuật hệ thống lò hơi nhiệt độ cao', hours: 8 },
  ];

  const correctionReasons = [
    { title: 'Giải trình bổ sung giờ chấm công vào', reason: 'Máy chấm công vân tay cửa xưởng 2 bị nghẽn mạng LAN, đã vào xưởng lúc 07:55 có Trưởng ca xác nhận' },
    { title: 'Giải trình quên bấm vân tay giờ ra', reason: 'Phải hỗ trợ dọn dẹp băng chuyền sau ca 2 lúc 22:05, vội ra về nên quên quẹt thẻ' },
    { title: 'Bổ sung công tác gặp gỡ khách hàng ngoài', reason: 'Đi khảo sát thị trường nhà phân phối miền Tây từ 08:30 đến 16:30' },
    { title: 'Xác nhận công làm việc online tại nhà', reason: 'Thời tiết mưa bão ngập tuyến đường được Quản lý duyệt Remote' },
  ];

  const advanceReasons = [
    { title: 'Đề nghị tạm ứng lương giữa kỳ', reason: 'Tạm ứng 5.000.000 đ công tác phí thị trường các tỉnh miền Đông', amount: 5000000 },
    { title: 'Đề nghị tạm ứng chi trả viện phí', reason: 'Tạm ứng viện phí cấp cứu cho người nhà nhập viện', amount: 8000000 },
    { title: 'Đề nghị tạm ứng đóng học phí con', reason: 'Tạm ứng lương đầu năm học mới cho con', amount: 6000000 },
    { title: 'Đề nghị tạm ứng giải quyết khó khăn đột xuất', reason: 'Sửa chữa nhà cửa do dông lốc', amount: 4000000 },
    { title: 'Đề nghị tạm ứng lương theo kỳ', reason: 'Chi tiêu sinh hoạt giữa tháng', amount: 3000000 },
  ];

  const swapReasons = [
    { title: 'Đơn xin hoán đổi ca 1 sang ca 2', current: 'CA-1', req: 'CA-2', reason: 'Bận việc gia đình buổi sáng, xin đổi sang ca chiều' },
    { title: 'Đơn xin hoán đổi ca 2 sang ca 3 đêm', current: 'CA-2', req: 'CA-3', reason: 'Có lịch học buổi chiều tối, xin chuyển sang làm ca đêm' },
    { title: 'Đơn xin hoán đổi ca trực thứ 7', current: 'CA-HC', req: 'CA-1', reason: 'Đổi ngày trực để về quê cùng người thân' },
  ];

  const resignationReasons = [
    { title: 'Đơn xin thôi việc / chấm dứt HĐLĐ', reason: 'Thay đổi định hướng phát triển nghề nghiệp cá nhân' },
    { title: 'Đơn xin thôi việc vì lý do gia đình', reason: 'Chuyển nơi cư trú về quê chăm sóc bố mẹ lớn tuổi' },
    { title: 'Đơn xin rút lại đơn thôi việc', reason: 'Đã sắp xếp ổn thỏa việc gia đình và mong muốn tiếp tục cống hiến cho Công ty', isRetract: true },
  ];

  let reqIdCounter = 1;

  // 1. Sinh 70 Đơn Nghỉ Phép (LEAVE)
  for (let i = 0; i < 70; i++) {
    const emp = pool[i % pool.length];
    const template = leaveReasons[i % leaveReasons.length];
    const dayOffset = (i % 25) + 1;
    const dateStr = `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset}`;
    const status: RequestStatus = i % 5 === 0 ? 'PENDING' : i % 8 === 0 ? 'REJECTED' : 'APPROVED';

    requests.push({
      id: `REQ-LV-${String(reqIdCounter++).padStart(4, '0')}`,
      tenantId: emp.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      type: 'LEAVE',
      title: template.title,
      reason: template.reason,
      startDate: dateStr,
      endDate: dateStr,
      durationDays: template.days,
      leaveType: template.type,
      status,
      currentApproverId: emp.managerId || 'EMP-002',
      currentApproverName: 'Trưởng Bộ Phận / Quản Lý',
      approvalHistory: [
        {
          step: 1,
          approverName: 'Trưởng Bộ Phận',
          action: status === 'REJECTED' ? 'REJECTED' : status === 'APPROVED' ? 'APPROVED' : 'FORWARDED',
          comment: status === 'APPROVED' ? 'Đã bố trí nhân sự bàn giao, duyệt cho nghỉ.' : status === 'REJECTED' ? 'Kế hoạch sản xuất đang cao điểm, đề nghị sắp xếp lại lịch nghỉ.' : 'Đang xem xét duyệt',
          timestamp: `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset} 09:15`,
        }
      ],
      createdAt: `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset}`,
    });
  }

  // 2. Sinh 70 Đơn Làm Thêm Giờ (OVERTIME)
  for (let i = 0; i < 70; i++) {
    const emp = pool[(i + 15) % pool.length];
    const template = otReasons[i % otReasons.length];
    const dayOffset = (i % 26) + 1;
    const dateStr = `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset}`;
    const status: RequestStatus = i % 6 === 0 ? 'PENDING' : i % 10 === 0 ? 'REJECTED' : 'APPROVED';

    requests.push({
      id: `REQ-OT-${String(reqIdCounter++).padStart(4, '0')}`,
      tenantId: emp.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      type: 'OVERTIME',
      title: template.title,
      reason: template.reason,
      otDate: dateStr,
      otHours: template.hours,
      status,
      currentApproverId: emp.managerId || 'EMP-002',
      currentApproverName: 'Quản Đốc / Trưởng Phòng',
      approvalHistory: [
        {
          step: 1,
          approverName: 'Quản Đốc / Trưởng Phòng',
          action: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'FORWARDED',
          comment: status === 'APPROVED' ? `Đã xác nhận kế hoạch OT ${template.hours}h, tính hệ số theo quy định BLLĐ.` : 'Chưa cần thiết tăng ca trong ngày này.',
          timestamp: `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset} 17:00`,
        }
      ],
      createdAt: dateStr,
    });
  }

  // 3. Sinh 65 Đơn Bổ Sung Công / Giải Trình (ATTENDANCE_CORRECTION)
  for (let i = 0; i < 65; i++) {
    const emp = pool[(i + 30) % pool.length];
    const template = correctionReasons[i % correctionReasons.length];
    const dayOffset = (i % 25) + 1;
    const dateStr = `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset}`;
    const status: RequestStatus = i % 4 === 0 ? 'PENDING' : 'APPROVED';

    requests.push({
      id: `REQ-ATT-${String(reqIdCounter++).padStart(4, '0')}`,
      tenantId: emp.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      type: 'ATTENDANCE_CORRECTION',
      title: template.title,
      reason: template.reason,
      startDate: dateStr,
      endDate: dateStr,
      status,
      currentApproverId: emp.managerId || 'EMP-002',
      currentApproverName: 'Chuyên Viên C&B / Quản Lý',
      approvalHistory: [
        {
          step: 1,
          approverName: 'Quản Lý Trực Tiếp',
          action: status === 'APPROVED' ? 'APPROVED' : 'FORWARDED',
          comment: status === 'APPROVED' ? 'Xác nhận nhân viên có mặt đúng giờ, duyệt bổ sung công.' : 'Chờ xác nhận camera/đồng nghiệp',
          timestamp: `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset} 10:00`,
        }
      ],
      createdAt: dateStr,
    });
  }

  // 4. Sinh 65 Đơn Tạm Ứng Lương (SALARY_ADVANCE)
  for (let i = 0; i < 65; i++) {
    const emp = pool[(i + 45) % pool.length];
    const template = advanceReasons[i % advanceReasons.length];
    const dayOffset = (i % 20) + 1;
    const dateStr = `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset}`;
    const status: RequestStatus = i % 5 === 0 ? 'PENDING' : i % 9 === 0 ? 'REJECTED' : 'APPROVED';

    requests.push({
      id: `REQ-ADV-${String(reqIdCounter++).padStart(4, '0')}`,
      tenantId: emp.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      type: 'SALARY_ADVANCE',
      title: template.title,
      reason: template.reason,
      requestedAmount: template.amount,
      status,
      currentApproverId: 'EMP-001',
      currentApproverName: 'Ban Tổng Giám Đốc & Kế Toán',
      approvalHistory: [
        {
          step: 1,
          approverName: 'Trưởng Phòng Nhân Sự',
          action: 'FORWARDED',
          comment: `Đủ điều kiện tạm ứng (<= 50% lương thực nhận), chuyển Ban Giám Đốc.`,
          timestamp: `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset} 11:30`,
        },
        {
          step: 2,
          approverName: 'Nguyễn Văn Hùng (TGĐ)',
          action: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'FORWARDED',
          comment: status === 'APPROVED' ? `Đồng ý chi tạm ứng ${template.amount.toLocaleString('vi-VN')} đ, trừ vào kỳ lương tháng 08.` : 'Số tiền tạm ứng vượt quá định mức quy định.',
          timestamp: `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset} 14:00`,
        }
      ],
      createdAt: dateStr,
    });
  }

  // 5. Sinh 60 Đơn Hoán Đổi Ca (SHIFT_SWAP)
  for (let i = 0; i < 60; i++) {
    const emp = pool[(i + 60) % pool.length];
    const partner = pool[(i + 61) % pool.length];
    const template = swapReasons[i % swapReasons.length];
    const dayOffset = (i % 25) + 1;
    const dateStr = `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset}`;
    const status: RequestStatus = i % 5 === 0 ? 'PENDING' : 'APPROVED';

    requests.push({
      id: `REQ-SWAP-${String(reqIdCounter++).padStart(4, '0')}`,
      tenantId: emp.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      type: 'SHIFT_SWAP',
      title: template.title,
      reason: template.reason,
      currentShiftCode: template.current,
      requestedShiftCode: template.req,
      swapWithEmployeeName: partner.fullName,
      swapDate: dateStr,
      startDate: dateStr,
      status,
      currentApproverId: emp.managerId || 'EMP-002',
      currentApproverName: 'Quản Đốc Phân Xưởng',
      approvalHistory: [
        {
          step: 1,
          approverName: 'Quản Đốc Phân Xưởng',
          action: status === 'APPROVED' ? 'APPROVED' : 'FORWARDED',
          comment: status === 'APPROVED' ? `Đã kiểm tra khoảng cách nghỉ giữa 2 ca >= 12h, đồng ý cho đổi ca cùng ${partner.fullName}.` : 'Chờ xác nhận của nhân sự hoán đổi.',
          timestamp: `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset} 15:20`,
        }
      ],
      createdAt: dateStr,
    });
  }

  // 6. Sinh 60 Đơn Thôi Việc & Rút Lại Đơn Thôi Việc
  for (let i = 0; i < 60; i++) {
    const emp = pool[(i + 80) % pool.length];
    const isRetract = i % 3 === 0;
    const template = isRetract ? resignationReasons[2] : resignationReasons[i % 2];
    const dayOffset = (i % 20) + 1;
    const dateStr = `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset}`;
    const lastDayStr = `2026-09-${dayOffset < 10 ? '0' + dayOffset : dayOffset}`;
    const status: RequestStatus = i % 4 === 0 ? 'PENDING' : isRetract ? 'APPROVED' : 'APPROVED';

    requests.push({
      id: `REQ-RESIGN-${String(reqIdCounter++).padStart(4, '0')}`,
      tenantId: emp.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      type: isRetract ? 'RETRACT_RESIGNATION' : 'RESIGNATION',
      title: template.title,
      reason: template.reason,
      lastWorkingDate: lastDayStr,
      isPrintedAndSigned: true,
      noticeDeliveredToManager: true,
      noticeDeliveredToHr: true,
      status,
      currentApproverId: 'EMP-001',
      currentApproverName: 'Tổng Giám Đốc & HR',
      approvalHistory: [
        {
          step: 1,
          approverName: 'Trần Thị Thu Trang (Trưởng phòng NS)',
          action: 'FORWARDED',
          comment: isRetract ? 'Nhân viên xin rút lại đơn thôi việc, đánh giá nhân sự có năng lực tốt, đề xuất TGĐ phê duyệt.' : 'Đã nhận bàn giao và phỏng vấn thôi việc (Exit Interview).',
          timestamp: `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset} 10:00`,
        },
        {
          step: 2,
          approverName: 'Nguyễn Văn Hùng (TGĐ)',
          action: status === 'APPROVED' ? 'APPROVED' : 'FORWARDED',
          comment: isRetract ? 'Đồng ý cho nhân viên tiếp tục làm việc và cống hiến.' : 'Phê duyệt chấm dứt HĐLĐ, tiến hành thủ tục thanh lý trong vòng 14 ngày.',
          timestamp: `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset} 16:30`,
        }
      ],
      createdAt: dateStr,
    });
  }

  // 7. Sinh 35 Đơn Xin Ra Cổng Trong Giờ Làm (GATE_PASS)
  const gatePassTemplates = [
    {
      title: 'Giấy ra cổng việc công ty - Giao dịch ngân hàng',
      reason: 'Đi nộp tiền và hoàn tất thủ tục mở L/C tại Vietcombank Chi nhánh KCN Sóng Thần',
      purpose: 'COMPANY_BUSINESS' as const,
      exit: '09:00',
      returnT: '11:30',
      hasAsset: false,
    },
    {
      title: 'Giấy ra cổng việc công ty - Mang thiết bị đi bảo hành',
      reason: 'Đem máy tính trạm thiết kế Precision đi bảo hành tại Trung tâm bảo hành Dell',
      purpose: 'COMPANY_BUSINESS' as const,
      exit: '13:30',
      returnT: '16:30',
      hasAsset: true,
      permitNo: 'PX-2026/088-KT',
      assetNote: '01 Laptop Dell Precision 5570 + Cục sạc nguồn chính hãng',
    },
    {
      title: 'Giấy ra cổng việc công ty - Gửi mẫu kiểm nghiệm ATTP',
      reason: 'Chuyển mẫu gia vị và nước chấm mới sang Trung tâm Đo lường Chất lượng 3 (Quatest 3)',
      purpose: 'COMPANY_BUSINESS' as const,
      exit: '10:00',
      returnT: '12:00',
      hasAsset: true,
      permitNo: 'PX-2026/095-KT',
      assetNote: 'Thùng mẫu thực phẩm niêm phong tem QC số #7890',
    },
    {
      title: 'Giấy ra cổng việc riêng - Khám răng nha khoa',
      reason: 'Đi khám nhổ răng khôn đột xuất theo lịch hẹn bác sĩ',
      purpose: 'PERSONAL_AFFAIR' as const,
      exit: '14:00',
      returnT: '16:00',
      hasAsset: false,
    },
    {
      title: 'Giấy ra cổng việc riêng - Đón con nhỏ sốt',
      reason: 'Trường mầm non gọi báo con bị sốt cao, xin ra đón con về gửi người nhà chăm sóc',
      purpose: 'PERSONAL_AFFAIR' as const,
      exit: '10:30',
      returnT: '12:00',
      hasAsset: false,
    },
    {
      title: 'Giấy ra cổng việc công ty - Họp đối tác cung cấp nguyên liệu',
      reason: 'Đi dự buổi thẩm định đánh giá năng lực nhà cung ứng bột mì tại KCN VSIP 1',
      purpose: 'COMPANY_BUSINESS' as const,
      exit: '08:30',
      returnT: '11:45',
      hasAsset: false,
    },
    {
      title: 'Giấy ra cổng việc công ty - Mang máy đo độ ẩm đi hiệu chuẩn',
      reason: 'Đem thiết bị đo độ ẩm A&D sang Viện Đo lường Việt Nam kiểm định định kỳ năm 2026',
      purpose: 'COMPANY_BUSINESS' as const,
      exit: '13:15',
      returnT: '17:00',
      hasAsset: true,
      permitNo: 'GVT-2026/102-KT',
      assetNote: 'Máy đo độ ẩm tia hồng ngoại A&D ML-50 kèm hộp chống sốc',
    }
  ];

  for (let i = 0; i < 35; i++) {
    const emp = pool[(i + 45) % pool.length];
    const tpl = gatePassTemplates[i % gatePassTemplates.length];
    const dayOffset = (i % 25) + 1;
    const dateStr = `2026-08-${dayOffset < 10 ? '0' + dayOffset : dayOffset}`;
    const status: RequestStatus = i % 5 === 0 ? 'PENDING' : i % 12 === 0 ? 'REJECTED' : 'APPROVED';

    const secStatus = status === 'APPROVED' 
      ? (i % 3 === 0 ? 'CHECKED_IN' : i % 3 === 1 ? 'CHECKED_OUT' : 'PENDING_EXIT')
      : 'PENDING_EXIT';

    const actualExit = secStatus === 'CHECKED_OUT' || secStatus === 'CHECKED_IN' ? tpl.exit : undefined;
    const actualReturn = secStatus === 'CHECKED_IN' ? tpl.returnT : undefined;

    requests.push({
      id: `REQ-GATE-${String(reqIdCounter++).padStart(4, '0')}`,
      tenantId: emp.tenantId,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      departmentName: emp.departmentName,
      type: 'GATE_PASS',
      title: tpl.title,
      reason: tpl.reason,
      startDate: dateStr,
      endDate: dateStr,
      gatePassPurpose: tpl.purpose,
      gatePassExitTime: tpl.exit,
      gatePassExpectedReturnTime: tpl.returnT,
      isNotReturning: false,
      hasGoodsOrAsset: tpl.hasAsset,
      assetPermitNumber: tpl.permitNo,
      assetPermitNote: tpl.assetNote,
      securityCheckStatus: secStatus,
      actualExitTime: actualExit,
      actualReturnTime: actualReturn,
      securityGuardName: actualExit ? 'Nguyễn Văn Định (Chốt Cổng 1)' : undefined,
      securityGuardNote: tpl.hasAsset && actualExit ? 'Đã kiểm tra Giấy phép Kế toán kèm theo, niêm phong nguyên vẹn' : undefined,
      status,
      currentApproverId: emp.managerId || 'EMP-002',
      currentApproverName: 'Trưởng Bộ Phận & Phòng Nhân Sự',
      approvalHistory: [
        {
          step: 1,
          approverName: emp.fullName,
          action: 'FORWARDED',
          comment: `Đăng ký xin ra cổng trong ca làm việc (${tpl.purpose === 'COMPANY_BUSINESS' ? 'Việc công ty' : 'Việc riêng'})`,
          timestamp: `${dateStr} 08:00`,
        },
        {
          step: 2,
          approverName: 'Trưởng Bộ Phận',
          action: status === 'REJECTED' ? 'REJECTED' : status === 'APPROVED' ? 'APPROVED' : 'FORWARDED',
          comment: status === 'APPROVED' ? (tpl.hasAsset ? 'Duyệt cho ra ngoài. Lưu ý xuất trình Giấy phép tài sản Kế toán cho Bảo vệ.' : 'Đồng ý duyệt cho ra cổng theo giờ đăng ký.') : status === 'REJECTED' ? 'Công việc đang dở dang không giải quyết cho ra ngoài lúc này.' : 'Đang đợi phê duyệt',
          timestamp: `${dateStr} 08:30`,
        }
      ],
      createdAt: dateStr,
    });
  }

  return requests;
}
