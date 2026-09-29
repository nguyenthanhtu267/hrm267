import { FormattedNumberInput } from './FormattedNumberInput';
import React, { useState, useMemo } from 'react';
import { Employee, CompanyPolicy, UserRole } from '../types/hrm';
import { excelService } from '../services/excelService';
import { evaluateColumnCondition, CompactPagination } from './SmartTableFilter';
import { pokaYokeValidationService } from '../services/pokaYokeValidationService';
import { initialTrainingCommitments, initialEmployeeProgress } from '../services/trainingLndService';
import { generateZaloBadgeQR } from '../services/smartBadgeService';
import { ExportDropdown } from './ExportDropdown';
import { printTableToPdf } from '../utils/exportUtils';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  AlertCircle,
  FileSpreadsheet,
  Milk,
  Building,
  CreditCard,
  FileText,
  X,
  Check,
  Clock,
  GraduationCap
} from 'lucide-react';

interface EmployeeListViewProps {
  employees: Employee[];
  policy: CompanyPolicy;
  currentRole: UserRole;
  onUpdateEmployees: (updated: Employee[]) => void;
}

export const EmployeeListView: React.FC<EmployeeListViewProps> = ({
  employees,
  policy,
  currentRole,
  onUpdateEmployees,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [employee360Tab, setEmployee360Tab] = useState<'PROFILE' | 'ATTENDANCE' | 'PAYSLIP' | 'TRAINING' | 'LEAVE' | 'SMART_BADGE'>('PROFILE');
  const [employeeBadgeQR, setEmployeeBadgeQR] = useState<string>('');

  // Phân trang & Lọc cột
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [colFilters, setColFilters] = useState({
    code: '',
    name: '',
    position: '',
    status: '',
    baseSalary: '',
    toxic: '',
    leave: ''
  });

  // Form thêm nhân viên
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    fullName: '',
    gender: 'MALE',
    dob: '1995-01-01',
    phone: '',
    email: '',
    cccd: '',
    branchName: 'Nhà Máy Chế Biến Thực Phẩm Bình Dương',
    departmentName: 'Khối Sản Xuất Nhà Máy',
    position: 'Công Nhân Vận Hành',
    status: 'OFFICIAL',
    contractType: 'DEFINITE_12M',
    baseSalary: 7500000,
    positionSalary: 1500000,
    lunchAllowance: 730000,
    transportAllowance: 500000,
    phoneAllowance: 0,
    toxicTier: 2,
    bankAccountNumber: '',
    bankName: 'Vietcombank',
    taxCode: '',
    socialInsuranceNumber: '',
    numberOfDependents: 0,
  });

  const currentTenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === policy.tenantId);
  }, [employees, policy.tenantId]);

  // Lọc dữ liệu kết hợp bộ lọc cột toán học
  const filteredEmployees = useMemo(() => {
    return currentTenantEmployees.filter(emp => {
      const matchSearch = 
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone.includes(searchTerm);

      const matchStatus = statusFilter === 'ALL' || emp.status === statusFilter;
      const matchDept = departmentFilter === 'ALL' || emp.departmentName === departmentFilter;

      if (!matchSearch || !matchStatus || !matchDept) return false;

      // Bộ lọc từng cột
      if (!evaluateColumnCondition(emp.code, colFilters.code)) return false;
      if (!evaluateColumnCondition(emp.fullName, colFilters.name)) return false;
      if (!evaluateColumnCondition(`${emp.position} ${emp.departmentName}`, colFilters.position)) return false;
      
      const statusText = emp.isCivilContractor ? 'Cộng tác viên Dân sự' :
        emp.status === 'OFFICIAL' ? 'Chính thức' :
        emp.status === 'PROBATION' ? 'Thử việc' :
        emp.status === 'NOTICE_PERIOD' ? 'Sắp nghỉ báo trước' :
        emp.status === 'SUSPENDED' ? 'Tạm hoãn' :
        emp.status === 'DISMISSED' ? 'Sa thải kỷ luật' : 'Đã thôi việc';
      if (!evaluateColumnCondition(statusText, colFilters.status)) return false;

      // Lọc lương bằng toán tử >= <= > < =
      if (!evaluateColumnCondition(emp.baseSalary, colFilters.baseSalary)) return false;

      // Lọc độc hại
      const toxicText = emp.toxicTier > 0 ? `Mức ${emp.toxicTier}` : 'Không có';
      if (!evaluateColumnCondition(toxicText, colFilters.toxic)) return false;

      // Lọc phép còn lại
      const leaveRemaining = emp.annualLeaveTotal - emp.annualLeaveUsed;
      if (!evaluateColumnCondition(leaveRemaining, colFilters.leave)) return false;

      return true;
    });
  }, [currentTenantEmployees, searchTerm, statusFilter, departmentFilter, colFilters]);

  // Phân trang
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Xuất Excel
  const handleExportExcel = () => {
    excelService.exportEmployees(filteredEmployees, `Danh_Sach_Nhan_Su_${policy.companyName}.xlsx`);
  };

  // Xuất PDF
  const handleExportPdf = () => {
    const headers = ['Mã NV', 'Họ Và Tên', 'Chức Vụ', 'Phòng Ban', 'Lương CB (đ)', 'Lương Chức Danh (đ)', 'Trạng Thái'];
    const rows = filteredEmployees.map(e => [
      e.code,
      e.fullName,
      e.position,
      e.departmentName,
      (e.baseSalary || 0).toLocaleString('vi-VN'),
      (e.positionSalary || 0).toLocaleString('vi-VN'),
      e.status === 'OFFICIAL' ? 'Chính thức' : e.status === 'PROBATION' ? 'Thử việc' : 'Đã nghỉ'
    ]);
    printTableToPdf(`DANH SÁCH HỒ SƠ NHÂN SỰ — ${policy.companyName}`, `Tổng số: ${filteredEmployees.length.toLocaleString('vi-VN')} nhân sự`, headers, rows);
  };

  // Nhập Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await excelService.readExcelFile(file);
      alert(`Đã đọc thành công ${data.length.toLocaleString('vi-VN')} dòng từ file Excel! Đang kiểm tra đối soát hợp lệ...`);
    } catch (err) {
      alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng.');
    }
  };

  // Thêm nhân sự mới
  
  // ----------------------------------------------------
  // POKA-YOKE REAL-TIME VALIDATION (TRIẾT LÝ: KHÔNG THỂ LÀM SAI ĐƯỢC)
  // ----------------------------------------------------
  const phoneValidation = useMemo(() => 
    newEmp.phone ? pokaYokeValidationService.validateVietnamPhone(newEmp.phone) : { isValid: false, message: 'Số điện thoại là bắt buộc (10 số VN)' }
  , [newEmp.phone]);

  const cccdValidation = useMemo(() => 
    newEmp.cccd ? pokaYokeValidationService.validateCitizenId(newEmp.cccd) : { isValid: false, message: 'CCCD gắn chip là bắt buộc (12 chữ số)' }
  , [newEmp.cccd]);

  const emailValidation = useMemo(() => 
    newEmp.email ? pokaYokeValidationService.validateEmail(newEmp.email) : { isValid: true, message: '' }
  , [newEmp.email]);

  const taxValidation = useMemo(() => 
    newEmp.taxCode ? pokaYokeValidationService.validateTaxId(newEmp.taxCode) : { isValid: true, message: '' }
  , [newEmp.taxCode]);

  const bhxhValidation = useMemo(() => 
    newEmp.socialInsuranceNumber ? pokaYokeValidationService.validateSocialInsurance(newEmp.socialInsuranceNumber) : { isValid: true, message: '' }
  , [newEmp.socialInsuranceNumber]);

  const bankValidation = useMemo(() => 
    newEmp.bankAccountNumber ? pokaYokeValidationService.validateBankAccount(newEmp.bankAccountNumber) : { isValid: true, message: '' }
  , [newEmp.bankAccountNumber]);

  const dobValidation = useMemo(() => 
    newEmp.dob ? pokaYokeValidationService.validateLaborAge(newEmp.dob) : { isValid: false, message: 'Ngày sinh là bắt buộc' }
  , [newEmp.dob]);

  const isFormPokaYokeValid = useMemo(() => {
    return (
      (newEmp.fullName?.trim().length || 0) >= 2 &&
      phoneValidation.isValid &&
      cccdValidation.isValid &&
      emailValidation.isValid &&
      taxValidation.isValid &&
      bhxhValidation.isValid &&
      bankValidation.isValid &&
      dobValidation.isValid
    );
  }, [newEmp.fullName, phoneValidation, cccdValidation, emailValidation, taxValidation, bhxhValidation, bankValidation, dobValidation]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.fullName || !newEmp.baseSalary) {
      alert('Vui lòng nhập đầy đủ họ tên và mức lương!');
      return;
    }

    const code = `NV-${Math.floor(100 + Math.random() * 900)}`;
    const created: Employee = {
      id: `EMP-${Date.now()}`,
      tenantId: policy.tenantId,
      code,
      fullName: newEmp.fullName || '',
      gender: newEmp.gender || 'MALE',
      dob: newEmp.dob || '1995-01-01',
      phone: newEmp.phone || '0901234567',
      email: newEmp.email || `${code.toLowerCase()}@${policy.tenantId.toLowerCase()}.vn`,
      cccd: newEmp.cccd || '079095001234',
      cccdDate: '2022-01-01',
      cccdPlace: 'Cục Cảnh sát QLHC về TTXH',
      address: 'TP. Hồ Chí Minh',
      branchId: 'BR-01',
      branchName: newEmp.branchName || 'Chi Nhánh Chính',
      departmentId: 'DEPT-01',
      departmentName: newEmp.departmentName || 'Phòng Ban Chung',
      position: newEmp.position || 'Nhân Viên',
      role: 'EMPLOYEE',
      status: newEmp.status || 'OFFICIAL',
      contractType: newEmp.contractType || 'DEFINITE_12M',
      contractNumber: `HDLD-${Date.now().toString().slice(-4)}`,
      joinDate: new Date().toISOString().split('T')[0],
      contractStartDate: new Date().toISOString().split('T')[0],
      bankAccountNumber: newEmp.bankAccountNumber || '0071000123456',
      bankName: newEmp.bankName || 'Vietcombank',
      taxCode: newEmp.taxCode || '8012345678',
      socialInsuranceNumber: newEmp.socialInsuranceNumber || '7924001234',
      numberOfDependents: Number(newEmp.numberOfDependents || 0),
      baseSalary: Number(newEmp.baseSalary || 7500000),
      positionSalary: Number(newEmp.positionSalary || 0),
      lunchAllowance: Number(newEmp.lunchAllowance || 730000),
      transportAllowance: Number(newEmp.transportAllowance || 0),
      phoneAllowance: Number(newEmp.phoneAllowance || 0),
      toxicTier: (Number(newEmp.toxicTier) || 0) as any,
      annualLeaveTotal: 12,
      annualLeaveUsed: 0,
      annualLeaveCarriedOver: 0,
      isCivilContractor: newEmp.isCivilContractor || false,
    };

    onUpdateEmployees([...employees, created]);
    setShowAddModal(false);
    alert(`Đã thêm thành công nhân sự ${created.fullName} (${created.code})!`);
  };

  const departments = Array.from(new Set(currentTenantEmployees.map(e => e.departmentName)));

  return (
    <div className="space-y-4">
      {/* Thanh Tiêu đề & Thao tác */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Quản Lý Hồ Sơ Nhân Sự</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng: <b className="text-slate-900">{currentTenantEmployees.length.toLocaleString('vi-VN')} nhân sự</b> • Cắt trang thu gọn • Hỗ trợ lọc cột toán học
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            label="Xuất Hồ Sơ"
            buttonColorClass="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700"
          />

          <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Nhập Excel</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
          </label>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Nhân Sự Mới</span>
          </button>
        </div>
      </div>

      {/* Thanh Tìm kiếm & Lọc nhanh */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã nhân viên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả trạng thái ({currentTenantEmployees.length.toLocaleString('vi-VN')})</option>
            <option value="OFFICIAL">Chính thức</option>
            <option value="PROBATION">Thử việc (tích lũy phép)</option>
            <option value="NOTICE_PERIOD">Đang chờ nghỉ việc (báo trước)</option>
            <option value="SUSPENDED">Tạm hoãn HĐLĐ (thai sản/nghĩa vụ)</option>
            <option value="DISMISSED">Bị kỷ luật sa thải (Điều 125)</option>
            <option value="COLLABORATOR">Cộng tác viên (HĐ dịch vụ)</option>
            <option value="RESIGNED">Đã thôi việc / thanh lý</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả phòng ban / xưởng</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {(colFilters.code || colFilters.name || colFilters.position || colFilters.status || colFilters.baseSalary || colFilters.toxic || colFilters.leave) && (
            <button
              onClick={() => {
                setColFilters({ code: '', name: '', position: '', status: '', baseSalary: '', toxic: '', leave: '' });
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold whitespace-nowrap"
              title="Xóa tất cả lọc cột"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Bảng danh sách nhân sự với hàng lọc toán học dưới tiêu đề */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-2 w-24">Mã NV</th>
                <th className="px-3 py-2 min-w-[180px]">Họ Và Tên</th>
                <th className="px-3 py-2 min-w-[160px]">Phòng Ban / Vị Trí</th>
                <th className="px-3 py-2 w-32">Trạng Thái</th>
                <th className="px-3 py-2 w-32">Lương Cơ Bản</th>
                <th className="px-3 py-2 w-36">Độc Hại Sữa (TT 24)</th>
                <th className="px-3 py-2 w-28">Phép Năm</th>
                <th className="px-3 py-2 text-right w-24">Thao Tác</th>
              </tr>
              {/* HÀNG TÌM KIẾM CỘT DƯỚI TIÊU ĐỀ (Toán tử >=, <=, >, <, =) */}
              <tr className="bg-slate-100/80 border-b border-slate-200">
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Mã..."
                    value={colFilters.code}
                    onChange={(e) => { setColFilters({ ...colFilters, code: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Tên nhân viên..."
                    value={colFilters.name}
                    onChange={(e) => { setColFilters({ ...colFilters, name: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Vị trí / xưởng..."
                    value={colFilters.position}
                    onChange={(e) => { setColFilters({ ...colFilters, position: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Trạng thái..."
                    value={colFilters.status}
                    onChange={(e) => { setColFilters({ ...colFilters, status: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder=">= 7000000..."
                    value={colFilters.baseSalary}
                    onChange={(e) => { setColFilters({ ...colFilters, baseSalary: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500 font-mono"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder="Mức 1, 2..."
                    value={colFilters.toxic}
                    onChange={(e) => { setColFilters({ ...colFilters, toxic: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                  />
                </th>
                <th className="p-1.5">
                  <input
                    type="text"
                    placeholder=">= 5..."
                    value={colFilters.leave}
                    onChange={(e) => { setColFilters({ ...colFilters, leave: e.target.value }); setCurrentPage(1); }}
                    className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500 font-mono"
                  />
                </th>
                <th className="p-1.5 text-center text-[10px] text-slate-400 font-normal">
                  -
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2 font-mono font-bold text-indigo-700">{emp.code}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-900">{emp.fullName}</div>
                    <div className="text-[10px] text-slate-400">{emp.phone} • {emp.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">{emp.position}</div>
                    <div className="text-[10px] text-slate-400">{emp.departmentName}</div>
                  </td>
                  <td className="px-3 py-2">
                    {emp.isCivilContractor ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Cộng tác viên (10%)
                      </span>
                    ) : emp.status === 'OFFICIAL' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Chính thức
                      </span>
                    ) : emp.status === 'PROBATION' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        Thử việc ({emp.annualLeaveTotal}p)
                      </span>
                    ) : emp.status === 'NOTICE_PERIOD' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                        Sắp nghỉ
                      </span>
                    ) : emp.status === 'SUSPENDED' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        Tạm hoãn HĐLĐ
                      </span>
                    ) : emp.status === 'DISMISSED' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-800 border border-red-300">
                        ⚡ Sa thải
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Đã thôi việc
                      </span>
                    )}
                    {emp.debtBalance && emp.debtBalance > 0 && (
                      <span className="block mt-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                        Nợ: {emp.debtBalance.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-bold text-slate-900">{emp.baseSalary.toLocaleString('vi-VN')} đ</div>
                    {emp.positionSalary > 0 && (
                      <div className="text-[10px] text-slate-400">+{emp.positionSalary.toLocaleString('vi-VN')} đ CD</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {emp.toxicTier > 0 ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                        <Milk className="w-3 h-3 text-amber-500" />
                        <span>Mức {emp.toxicTier}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Không</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-[10px]">
                      Còn: <b className="text-indigo-600 font-bold">{emp.annualLeaveTotal - emp.annualLeaveUsed}</b> / {emp.annualLeaveTotal} ngày
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors inline-flex items-center space-x-1 text-[11px] font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Không tìm thấy nhân sự phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang thu gọn */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <CompactPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalRecords={filteredEmployees.length}
            pageSize={pageSize}
          />
          <div className="text-[11px] text-slate-500">
            Hiển thị tối đa <span className="font-bold text-slate-800">{pageSize}</span> nhân sự/trang (không phải cuộn dài)
          </div>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT HỒ SƠ 360 ĐỘ */}
      {selectedEmployee && (() => {
        // Tra cứu dữ liệu đào tạo & cam kết đào tạo liên thông
        const empProgress = initialEmployeeProgress.find(p => p.employeeCode === selectedEmployee.code || p.employeeName === selectedEmployee.fullName);
        const empCommitment = initialTrainingCommitments.find(c => c.employeeId === selectedEmployee.code || c.employeeName === selectedEmployee.fullName);

        return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center text-lg font-black shadow-md">
                  {selectedEmployee.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-slate-900">{selectedEmployee.fullName}</h3>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {selectedEmployee.code}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Hồ Sơ 360° Liên Thông
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedEmployee.position} • {selectedEmployee.departmentName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 TABS HỒ SƠ 360° */}
            <div className="px-6 pt-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2 overflow-x-auto scrollable-tabs pb-1">
                <button
                  type="button"
                  onClick={() => setEmployee360Tab('PROFILE')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                    employee360Tab === 'PROFILE'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>1. Lý Lịch & Pháp Lý</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmployee360Tab('ATTENDANCE')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                    employee360Tab === 'ATTENDANCE'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>2. Chấm Công & Giờ Làm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmployee360Tab('PAYSLIP')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                    employee360Tab === 'PAYSLIP'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>3. Lương & Đãi Ngộ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEmployee360Tab('TRAINING')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                    employee360Tab === 'TRAINING'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>4. Đào Tạo L&D & Cam Kết Đ62</span>
                  {empCommitment && empCommitment.status === 'ACTIVE' && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEmployee360Tab('LEAVE')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                    employee360Tab === 'LEAVE'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>5. Phép Năm & Đơn Từ</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* TAB 1: LÝ LỊCH & PHÁP LÝ */}
              {employee360Tab === 'PROFILE' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>Thông Tin Định Danh & Liên Lạc (Chuẩn Poka-Yoke)</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-slate-400 block">Số điện thoại (10 số):</span>
                        <b className="text-slate-900 font-mono">{selectedEmployee.phone}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Số CCCD gắn chip (12 số):</span>
                        <b className="text-slate-900 font-mono">{selectedEmployee.cccd || '079095001234'}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Mã số thuế cá nhân (10 số):</span>
                        <b className="text-slate-900 font-mono">{selectedEmployee.taxCode || '8492019281'}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Mã số sổ BHXH (10 số):</span>
                        <b className="text-slate-900 font-mono">{selectedEmployee.socialInsuranceNumber || '7918293849'}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Ngày sinh & Giới tính:</span>
                        <b className="text-slate-900">{selectedEmployee.dob} ({selectedEmployee.gender === 'MALE' ? 'Nam' : 'Nữ'})</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Email công ty:</span>
                        <b className="text-slate-900">{selectedEmployee.email || 'nhansu@anviet.vn'}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Tài khoản ngân hàng:</span>
                        <b className="text-slate-900 font-mono">{selectedEmployee.bankAccountNumber} ({selectedEmployee.bankName})</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Người phụ thuộc giảm trừ:</span>
                        <b className="text-indigo-700 font-bold">{selectedEmployee.numberOfDependents || 0} người</b>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Hợp Đồng Lao Động & Tuân Thủ Pháp Luật</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block">Loại hợp đồng:</span>
                        <b className="text-slate-900">{selectedEmployee.contractType}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Số hợp đồng:</span>
                        <b className="text-slate-900 font-mono">{selectedEmployee.contractNumber || 'HĐLĐ-2024/AV-01'}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Ngày bắt đầu làm việc:</span>
                        <b className="text-slate-900">{selectedEmployee.startDate || '01/01/2021'}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Thâm niên công tác:</span>
                        <b className="text-emerald-700 font-bold">5 năm 8 tháng (+1 ngày phép Đ.114)</b>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHẤM CÔNG & GIỜ LÀM */}
              {employee360Tab === 'ATTENDANCE' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[11px] block">Ngày công chuẩn tháng:</span>
                      <b className="text-base text-slate-900 font-mono">24.0 công</b>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 text-[11px] block">Ngày công thực tế:</span>
                      <b className="text-base text-emerald-800 font-mono">23.5 công (98%)</b>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                      <span className="text-indigo-700 text-[11px] block">Số giờ làm thêm OT:</span>
                      <b className="text-base text-indigo-800 font-mono">14.0 giờ (Tuân thủ Đ107)</b>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-amber-800 text-[11px] block">Đi muộn / Về sớm:</span>
                      <b className="text-base text-amber-900 font-mono">1 lần (12 phút)</b>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 block">Lịch sử quẹt thẻ / GPS gần nhất:</span>
                    <div className="space-y-1 text-[11px] text-slate-600 font-mono">
                      <p>• Hôm nay (09/09/2026): Check-in <b>07:54:12</b> (Vân tay Cổng chính) • Check-out <b>--:--:--</b></p>
                      <p>• Hôm qua (08/09/2026): Check-in <b>07:58:30</b> • Check-out <b>17:05:44</b> (Đủ 8h làm việc)</p>
                      <p>• Thứ Hai (07/09/2026): Check-in <b>08:12:00</b> (Muộn 12p - Đã gửi giải trình) • Check-out <b>19:00:00</b> (+2h OT)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LƯƠNG & ĐÃI NGỘ */}
              {employee360Tab === 'PAYSLIP' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Lương cơ bản đóng BHXH:</span>
                      <b className="text-slate-900 text-sm font-mono">{selectedEmployee.baseSalary.toLocaleString('vi-VN')} đ</b>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lương chức danh / 3P:</span>
                      <b className="text-slate-900 text-sm font-mono">{selectedEmployee.positionSalary.toLocaleString('vi-VN')} đ</b>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phụ cấp ăn trưa:</span>
                      <b className="text-slate-900 text-sm font-mono">{selectedEmployee.lunchAllowance.toLocaleString('vi-VN')} đ</b>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Bồi dưỡng độc hại (Sữa):</span>
                      <b className="text-amber-700 text-sm font-bold">
                        {selectedEmployee.toxicTier > 0 ? `Mức ${selectedEmployee.toxicTier}` : 'Không có'}
                      </b>
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-700 uppercase block">Ước tính thực nhận tháng này (NET):</span>
                      <span className="text-xl font-black text-indigo-900">
                        {((selectedEmployee.baseSalary + selectedEmployee.positionSalary + selectedEmployee.lunchAllowance) * 0.895).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    <span className="text-xs bg-white text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-300">
                      Tài khoản: {selectedEmployee.bankAccountNumber} ({selectedEmployee.bankName})
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: ĐÀO TẠO L&D & CAM KẾT ĐIỀU 62 BLLĐ */}
              {employee360Tab === 'TRAINING' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-3.5">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[11px] block">Giờ học tích lũy năm 2026:</span>
                      <b className="text-lg text-indigo-700 font-bold">{empProgress ? empProgress.totalAccumulatedHours : 28} giờ</b>
                      <span className="text-[10px] text-slate-400 block mt-0.5">/ {empProgress ? empProgress.targetHours : 30}h định mức năm</span>
                    </div>
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 text-[11px] block">Tỷ lệ đào tạo nội bộ:</span>
                      <b className="text-lg text-emerald-800 font-bold">{empProgress ? empProgress.internalRatioActual : 80}%</b>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">✓ Vượt chuẩn quy ước (≥70%)</span>
                    </div>
                    <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
                      <span className="text-purple-700 text-[11px] block">Đánh giá thi đua L&D:</span>
                      <b className="text-sm text-purple-900 font-bold">
                        {empProgress?.kpiStatus === 'EXCELLENT' ? 'Vượt Chỉ Tiêu' : 'Đạt Chuẩn KPI'}
                      </b>
                      <span className="text-[10px] text-purple-600 block mt-0.5">Đủ điều kiện xét thưởng</span>
                    </div>
                  </div>

                  {/* Cảnh báo cam kết đào tạo Điều 62 BLLĐ */}
                  {empCommitment && empCommitment.status === 'ACTIVE' ? (
                    <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 space-y-2">
                      <div className="flex items-center justify-between font-bold text-amber-950">
                        <span className="flex items-center space-x-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>HỢP ĐỒNG CAM KẾT ĐÀO TẠO ĐANG HIỆU LỰC (ĐIỀU 62 BLLĐ 2019):</span>
                        </span>
                        <span className="font-mono text-xs bg-amber-200/80 px-2 py-0.5 rounded text-amber-900">
                          {empCommitment.commitmentCode}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        • Khóa học: <b>{empCommitment.courseName}</b> ({empCommitment.provider}).<br />
                        • Tổng chi phí đài thọ: <b>{empCommitment.totalInvestmentCost.toLocaleString('vi-VN')} đ</b>.<br />
                        • Thời hạn cam kết: <b>{empCommitment.commitmentMonths} tháng</b> (Đã phục vụ {empCommitment.servedMonths} tháng, còn lại <b>{empCommitment.remainingMonths} tháng</b>).<br />
                        • <span className="text-rose-700 font-bold">Nếu nghỉ việc tại thời điểm này, số tiền phải bồi hoàn khấu hao là: {empCommitment.potentialRefundAmount.toLocaleString('vi-VN')} đ</span>.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-center">
                      Nhân sự không có hợp đồng cam kết bồi hoàn đào tạo nào đang hiệu lực.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PHÉP NĂM & ĐƠN TỪ */}
              {employee360Tab === 'LEAVE' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-4 gap-3.5">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-slate-500 text-[11px] block">Tiêu chuẩn phép năm:</span>
                      <b className="text-lg text-slate-900 font-bold">12 ngày</b>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                      <span className="text-blue-700 text-[11px] block">Thâm niên (+5 năm):</span>
                      <b className="text-lg text-blue-900 font-bold">+1 ngày</b>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                      <span className="text-amber-800 text-[11px] block">Đã sử dụng 2026:</span>
                      <b className="text-lg text-amber-900 font-bold">3.0 ngày</b>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                      <span className="text-emerald-700 text-[11px] block">Phép tồn hiện tại:</span>
                      <b className="text-lg text-emerald-800 font-bold">10.0 ngày</b>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 block text-xs">Lịch sử đơn từ gần nhất:</span>
                    <p className="text-[11px] text-slate-600">• 25/08/2026: Nghỉ phép năm 1 ngày (Đã được Trưởng phòng phê duyệt • Trừ phép tự động)</p>
                    <p className="text-[11px] text-slate-600">• 12/07/2026: Giấy ra cổng việc riêng 1.5h (Đã quét QR bảo vệ lúc 14:00 - Vào lại 15:30)</p>
                  </div>
                </div>
              )}

              {/* TAB 6: THẺ TỪ THÔNG MINH & IN THẺ TRỰC TIẾP */}
              {employee360Tab === 'SMART_BADGE' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-4 rounded-2xl text-white flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-teal-200 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-teal-400" />
                        <span>Thẻ Nhân Viên &amp; Thẻ Từ Thông Minh 4-Trong-1</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Tích hợp RFID/NFC (Gửi xe, thang máy, cửa kiểm soát) &amp; Mã QR Zalo chuẩn quốc gia kết nối bạn bè ngay khi quét
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>In Thẻ Nhân Viên (CR-80)</span>
                    </button>
                  </div>

                  {/* Bản hiển thị thẻ chuẩn CR-80 */}
                  <div className="flex justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <div
                      className="border-2 border-slate-800 rounded-2xl p-5 bg-gradient-to-br from-white via-slate-50 to-teal-50 shadow-xl flex flex-col justify-between"
                      style={{ width: '360px', minHeight: '220px' }}
                    >
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                            HR
                          </div>
                          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">
                            {policy.companyName}
                          </span>
                        </div>
                        <span className="text-[9.5px] font-mono font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                          {selectedEmployee.code}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 py-2">
                        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                          <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                            {selectedEmployee.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {selectedEmployee.fullName}
                            </h4>
                            <p className="text-[10px] text-teal-700 font-semibold truncate mt-0.5">
                              {selectedEmployee.position}
                            </p>
                            <p className="text-[9px] text-slate-500 truncate">
                              {selectedEmployee.departmentName}
                            </p>
                          </div>
                        </div>

                        <div className="text-center shrink-0">
                          {employeeBadgeQR ? (
                            <img src={employeeBadgeQR} alt="Zalo QR" className="w-14 h-14 rounded border border-slate-200" />
                          ) : (
                            <div className="w-14 h-14 bg-slate-100 rounded flex items-center justify-center text-[8px] text-slate-400">
                              QR Zalo
                            </div>
                          )}
                          <span className="text-[8px] font-mono text-teal-800 block font-bold mt-0.5">
                            Quét Zalo
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t pt-1.5 text-[8.5px] text-slate-500">
                        <span className="font-mono">
                          RFID: RFID-${selectedEmployee.code}-ACTIVE
                        </span>
                        <span className="font-bold text-teal-700">
                          Gửi xe • Thang máy • Nhà ăn
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phân quyền 4 trong 1 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">1. Bãi giữ xe:</span>
                      <b className="text-emerald-700">✓ Đã cấp quyền B1/B2</b>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">2. Thang máy:</span>
                      <b className="text-slate-800">Tầng T1, T2, T3, T4</b>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">3. Cửa ra vào:</span>
                      <b className="text-slate-800">Cổng Chính &amp; Khối VP</b>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">4. Suất ăn ca:</span>
                      <b className="text-emerald-700">✓ Đã liên kết Zalo QR</b>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Đóng Hồ Sơ 360°
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* MODAL THÊM NHÂN VIÊN MỚI - ÁP DỤNG TRIẾT LÝ POKA-YOKE KHÔNG THỂ LÀM SAI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-slate-900">Thêm Hồ Sơ Nhân Sự Mới</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    🛡️ Poka-Yoke Mistake-Proofing
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hệ thống tự động kiểm tra định dạng số điện thoại, CCCD, MST, BHXH thời gian thực để ngăn chặn dữ liệu sai sót
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4 text-xs">
              {/* Họ tên & SĐT */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Họ và tên nhân viên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Văn An"
                    value={newEmp.fullName}
                    onChange={(e) => setNewEmp({ ...newEmp, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  {newEmp.fullName && newEmp.fullName.trim().length < 2 && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Họ tên phải có ít nhất 2 ký tự</span>
                    </p>
                  )}
                </div>

                {/* SỐ ĐIỆN THOẠI POKA-YOKE: BẮT BUỘC ĐÚNG 10 SỐ */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Số điện thoại di động (Đúng 10 số VN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0912345678"
                    value={newEmp.phone}
                    maxLength={10}
                    onChange={(e) => {
                      // Chỉ cho phép nhập số
                      const val = e.target.value.replace(/\D/g, '');
                      setNewEmp({ ...newEmp, phone: val });
                    }}
                    className={`w-full p-2.5 rounded-xl border font-mono outline-none transition-colors ${
                      newEmp.phone
                        ? phoneValidation.isValid
                          ? 'border-emerald-500 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-400'
                          : 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                  {newEmp.phone ? (
                    <p className={`text-[10.5px] font-semibold mt-1 flex items-center space-x-1 ${
                      phoneValidation.isValid ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {phoneValidation.isValid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{phoneValidation.message}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">Đầu số: 03x, 05x, 07x, 08x, 09x (10 chữ số)</p>
                  )}
                </div>
              </div>

              {/* CCCD & Ngày sinh */}
              <div className="grid grid-cols-2 gap-4">
                {/* CCCD POKA-YOKE: BẮT BUỘC ĐÚNG 12 SỐ */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Số CCCD gắn chip (Đúng 12 số) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="079095001234"
                    value={newEmp.cccd}
                    maxLength={12}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewEmp({ ...newEmp, cccd: val });
                    }}
                    className={`w-full p-2.5 rounded-xl border font-mono outline-none transition-colors ${
                      newEmp.cccd
                        ? cccdValidation.isValid
                          ? 'border-emerald-500 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-400'
                          : 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                  {newEmp.cccd ? (
                    <p className={`text-[10.5px] font-semibold mt-1 flex items-center space-x-1 ${
                      cccdValidation.isValid ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {cccdValidation.isValid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{cccdValidation.message}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">Chuẩn thẻ căn cước công dân gắn chip 12 chữ số</p>
                  )}
                </div>

                {/* NGÀY SINH POKA-YOKE: ĐỦ 18 TUỔI */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày sinh (BLLĐ: ≥ 18 tuổi) *</label>
                  <input
                    type="date"
                    required
                    value={newEmp.dob}
                    onChange={(e) => setNewEmp({ ...newEmp, dob: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      newEmp.dob
                        ? dobValidation.isValid
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300'
                    }`}
                  />
                  {newEmp.dob && (
                    <p className={`text-[10.5px] font-semibold mt-1 flex items-center space-x-1 ${
                      dobValidation.isValid ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {dobValidation.isValid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{dobValidation.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email & MST */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email công ty / cá nhân</label>
                  <input
                    type="email"
                    placeholder="nguyenvan@anviet.vn"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      newEmp.email
                        ? emailValidation.isValid
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300'
                    }`}
                  />
                  {newEmp.email && !emailValidation.isValid && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{emailValidation.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã số thuế cá nhân (10 số)</label>
                  <input
                    type="text"
                    placeholder="8492019281"
                    value={newEmp.taxCode}
                    maxLength={13}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewEmp({ ...newEmp, taxCode: val });
                    }}
                    className={`w-full p-2.5 rounded-xl border font-mono outline-none ${
                      newEmp.taxCode
                        ? taxValidation.isValid
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300'
                    }`}
                  />
                  {newEmp.taxCode && (
                    <p className={`text-[10.5px] font-semibold mt-1 flex items-center space-x-1 ${
                      taxValidation.isValid ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {taxValidation.isValid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{taxValidation.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Mã BHXH & Tài khoản ngân hàng */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã số sổ BHXH (10 số)</label>
                  <input
                    type="text"
                    placeholder="7918293849"
                    value={newEmp.socialInsuranceNumber}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewEmp({ ...newEmp, socialInsuranceNumber: val });
                    }}
                    className={`w-full p-2.5 rounded-xl border font-mono outline-none ${
                      newEmp.socialInsuranceNumber
                        ? bhxhValidation.isValid
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300'
                    }`}
                  />
                  {newEmp.socialInsuranceNumber && (
                    <p className={`text-[10.5px] font-semibold mt-1 flex items-center space-x-1 ${
                      bhxhValidation.isValid ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {bhxhValidation.isValid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{bhxhValidation.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số tài khoản ngân hàng chi lương</label>
                  <input
                    type="text"
                    placeholder="0071001234567 (Vietcombank)"
                    value={newEmp.bankAccountNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewEmp({ ...newEmp, bankAccountNumber: val });
                    }}
                    className={`w-full p-2.5 rounded-xl border font-mono outline-none ${
                      newEmp.bankAccountNumber
                        ? bankValidation.isValid
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-300'
                    }`}
                  />
                  {newEmp.bankAccountNumber && !bankValidation.isValid && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{bankValidation.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Phòng ban & Chức vụ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phòng ban / Xưởng sản xuất</label>
                  <input
                    type="text"
                    value={newEmp.departmentName}
                    onChange={(e) => setNewEmp({ ...newEmp, departmentName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chức danh công việc</label>
                  <input
                    type="text"
                    value={newEmp.position}
                    onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Lương & Độc hại */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trạng thái nhân sự</label>
                  <select
                    value={newEmp.status}
                    onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                  >
                    <option value="OFFICIAL">Chính thức</option>
                    <option value="PROBATION">Thử việc</option>
                    <option value="COLLABORATOR">Cộng tác viên (Dân sự)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lương cơ bản (VNĐ) *</label>
                  <FormattedNumberInput
                    required
                    value={newEmp.baseSalary}
                    onChange={(val) => setNewEmp({ ...newEmp, baseSalary: val })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none"
                    placeholder="VD: 10.000.000"
                    unit="VNĐ"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bồi dưỡng độc hại (Sữa)</label>
                  <select
                    value={newEmp.toxicTier}
                    onChange={(e) => setNewEmp({ ...newEmp, toxicTier: Number(e.target.value) as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                  >
                    <option value={0}>Không độc hại</option>
                    <option value={1}>Mức 1 (13.000 đ/ngày)</option>
                    <option value={2}>Mức 2 (20.000 đ/ngày)</option>
                    <option value={3}>Mức 3 (26.000 đ/ngày)</option>
                    <option value={4}>Mức 4 (32.000 đ/ngày)</option>
                  </select>
                </div>
              </div>

              {/* KHỐI CẢNH BÁO BẢO VỆ POKA-YOKE */}
              {!isFormPokaYokeValid && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-[11px]">
                    <p className="font-bold">TRIẾT LÝ POKA-YOKE: Vui lòng nhập đúng quy chuẩn để lưu hồ sơ!</p>
                    <p>Hệ thống tự động khóa nút Lưu cho đến khi các thông tin bắt buộc (Số điện thoại 10 số, CCCD 12 số, Tuổi lao động ≥ 18) hoàn toàn chính xác.</p>
                  </div>
                </div>
              )}

              {isFormPokaYokeValid && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-[11px] font-bold">✓ 100% dữ liệu đã đạt chuẩn Poka-Yoke. Sẵn sàng lưu vào hệ thống!</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!isFormPokaYokeValid}
                  className={`px-5 py-2 rounded-xl font-bold transition-all shadow-md flex items-center space-x-1.5 ${
                    isFormPokaYokeValid
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  }`}
                  title={!isFormPokaYokeValid ? 'Vui lòng sửa các trường lỗi trước khi lưu' : 'Lưu hồ sơ nhân sự chuẩn'}
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Hồ Sơ Nhân Sự</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
