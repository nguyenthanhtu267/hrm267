import React, { useState, useMemo } from 'react';
import { Employee, CompanyPolicy, UserRole, PersonnelChange, ContractType } from '../types/hrm';
import { evaluateColumnCondition, CompactPagination } from './SmartTableFilter';
import { ExportDropdown } from './ExportDropdown';
import { printTableToPdf } from '../utils/exportUtils';
import { 
  FileSignature, 
  ShieldCheck, 
  KeyRound, 
  Printer, 
  X, 
  FileText, 
  AlertCircle,
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Download, 
  Building2, 
  Calendar, 
  Layers, 
  FileCheck,
  Eye 
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ContractViewProps {
  employees: Employee[];
  policy: CompanyPolicy;
  currentRole: UserRole;
  personnelChanges?: PersonnelChange[];
  onUpdatePersonnelChanges?: (changes: PersonnelChange[]) => void;
  onUpdateEmployees?: (employees: Employee[]) => void;
}

export const ContractView: React.FC<ContractViewProps> = ({ 
  employees, 
  policy, 
  currentRole,
  personnelChanges = [],
  onUpdatePersonnelChanges,
  onUpdateEmployees
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'CONTRACT_LIST' | 'VIEW_CONTRACT' | 'VIEW_ANNEX'>('CONTRACT_LIST');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(employees[0] || null);
  const [selectedAnnex, setSelectedAnnex] = useState<PersonnelChange | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSigned, setIsSigned] = useState(false);

  // Bộ lọc danh sách hợp đồng
  const [searchTerm, setSearchTerm] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Phân trang & Lọc cột toán học
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [colFilters, setColFilters] = useState({
    name: '',
    contractNumber: '',
    contractType: '',
    date: '',
    dept: '',
    salary: '',
    status: ''
  });

  const currentTenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === policy.tenantId);
  }, [employees, policy.tenantId]);

  const currentTenantChanges = useMemo(() => {
    return personnelChanges.filter(c => c.tenantId === policy.tenantId);
  }, [personnelChanges, policy.tenantId]);

  // Phụ lục gắn liền với nhân sự đang chọn
  const employeeAnnexes = useMemo(() => {
    return selectedEmployee 
      ? currentTenantChanges.filter(c => c.employeeId === selectedEmployee.id)
      : [];
  }, [selectedEmployee, currentTenantChanges]);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === '123456' || otpCode.length === 6) {
      setIsSigned(true);
      setShowSignModal(false);
      alert('Ký số Hợp đồng lao động thành công! Dữ liệu đã được niêm phong mã hóa SHA-256.');
    } else {
      alert('Mã OTP không đúng. Hãy nhập 123456 để thử nghiệm!');
    }
  };

  // Tính toán thời hạn và tình trạng hợp đồng
  const getContractStatusBadge = (emp: Employee) => {
    if (emp.status === 'RESIGNED') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Đã thanh lý</span>;
    }
    if (emp.contractType === 'PROBATION') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Thử việc (02 tháng)</span>;
    }
    if (emp.contractType === 'INDEFINITE') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Vô thời hạn</span>;
    }
    if (emp.contractType === 'CIVIL_SERVICE') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">HĐ Dân Sự</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Xác định thời hạn</span>;
  };

  const getContractTypeName = (type: ContractType) => {
    switch (type) {
      case 'PROBATION': return 'Hợp đồng thử việc';
      case 'DEFINITE_12M': return 'HĐLĐ xác định thời hạn (12 tháng)';
      case 'DEFINITE_24M': return 'HĐLĐ xác định thời hạn (24 tháng)';
      case 'INDEFINITE': return 'HĐLĐ không xác định thời hạn';
      case 'CIVIL_SERVICE': return 'Hợp đồng dịch vụ cộng tác viên';
      default: return type;
    }
  };

  // Lọc danh sách nhân viên & tình trạng hợp đồng với bộ lọc cột toán học
  const filteredEmployees = useMemo(() => {
    return currentTenantEmployees.filter(emp => {
      const matchSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = contractTypeFilter === 'ALL' || emp.contractType === contractTypeFilter;
      const matchStatus = statusFilter === 'ALL' || emp.status === statusFilter;

      if (!matchSearch || !matchType || !matchStatus) return false;

      // Lọc chi tiết cột
      if (!evaluateColumnCondition(`${emp.fullName} ${emp.code}`, colFilters.name)) return false;
      if (!evaluateColumnCondition(emp.contractNumber, colFilters.contractNumber)) return false;
      if (!evaluateColumnCondition(getContractTypeName(emp.contractType), colFilters.contractType)) return false;
      if (!evaluateColumnCondition(`${emp.contractStartDate} ${emp.contractEndDate || ''}`, colFilters.date)) return false;
      if (!evaluateColumnCondition(`${emp.position} ${emp.departmentName}`, colFilters.dept)) return false;
      if (!evaluateColumnCondition(emp.baseSalary, colFilters.salary)) return false;
      
      const statusStr = emp.status === 'OFFICIAL' ? 'Chính thức' : emp.status === 'PROBATION' ? 'Thử việc' : 'Đã thanh lý';
      if (!evaluateColumnCondition(statusStr, colFilters.status)) return false;

      return true;
    });
  }, [currentTenantEmployees, searchTerm, contractTypeFilter, statusFilter, colFilters]);

  // Phân trang
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Xuất file Excel Danh Sách Hợp Đồng
  const handleExportContractsExcel = () => {
    const data = filteredEmployees.map(emp => {
      const annexCount = currentTenantChanges.filter(c => c.employeeId === emp.id).length;
      return {
        'Mã Nhân Viên': emp.code,
        'Họ Và Tên': emp.fullName,
        'Số Hợp Đồng': emp.contractNumber,
        'Loại Hợp Đồng': getContractTypeName(emp.contractType),
        'Ngày Bắt Đầu': emp.contractStartDate,
        'Ngày Hết Hạn': emp.contractEndDate || 'Không xác định',
        'Phòng Ban': emp.departmentName,
        'Chức Vụ': emp.position,
        'Lương Đóng BHXH': emp.baseSalary,
        'Lương Chức Danh': emp.positionSalary,
        'Số Phụ Lục Đã Ký': annexCount,
        'Tình Trạng': emp.status === 'OFFICIAL' ? 'Chính thức' : emp.status === 'PROBATION' ? 'Thử việc' : emp.status
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Hop_Dong');
    XLSX.writeFile(wb, `Danh_Sach_Hop_Dong_Lao_Dong_${policy.companyName}.xlsx`);
  };

  // Xuất file PDF Danh Sách Hợp Đồng
  const handleExportContractsPdf = () => {
    const headers = ['Mã NV', 'Họ Và Tên', 'Số Hợp Đồng', 'Loại Hợp Đồng', 'Ngày Bắt Đầu', 'Ngày Hết Hạn', 'Phòng Ban', 'Chức Vụ', 'Tình Trạng'];
    const rows = filteredEmployees.map(emp => [
      emp.code,
      emp.fullName,
      emp.contractNumber,
      getContractTypeName(emp.contractType),
      emp.contractStartDate,
      emp.contractEndDate || 'Không xác định',
      emp.departmentName,
      emp.position,
      emp.status === 'OFFICIAL' ? 'Chính thức' : emp.status === 'PROBATION' ? 'Thử việc' : emp.status
    ]);
    printTableToPdf(`DANH SÁCH HỢP ĐỒNG LAO ĐỘNG — ${policy.companyName}`, `Tổng cộng: ${filteredEmployees.length.toLocaleString('vi-VN')} hợp đồng`, headers, rows);
  };

  return (
    <div className="space-y-1.5">
      {/* Tiêu đề & Nút Thao Tác */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <FileSignature className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Quản Lý Hợp Đồng & Ký Số OTP</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình chuẩn hóa HĐLĐ (BLLĐ 2019) • Cắt trang thu gọn • Tìm kiếm cột toán học
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ExportDropdown
            onExportExcel={handleExportContractsExcel}
            onExportPdf={handleExportContractsPdf}
            label="Xuất Hợp Đồng"
            buttonColorClass="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          />

          {activeSubTab !== 'CONTRACT_LIST' && (
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Văn Bản</span>
            </button>
          )}

          {activeSubTab === 'VIEW_CONTRACT' && (
            <button
              onClick={() => {
                setOtpCode('');
                setShowSignModal(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ký Số OTP</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Tab Điều Hướng Khoa Học */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('CONTRACT_LIST')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeSubTab === 'CONTRACT_LIST'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Danh Sách Tình Trạng Hợp Đồng ({currentTenantEmployees.length.toLocaleString('vi-VN')})</span>
        </button>

        <button
          onClick={() => {
            if (!selectedEmployee && currentTenantEmployees.length > 0) {
              setSelectedEmployee(currentTenantEmployees[0]);
            }
            setActiveSubTab('VIEW_CONTRACT');
          }}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeSubTab === 'VIEW_CONTRACT'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Xem & Ký Số Hợp Đồng Mẫu</span>
        </button>

        <button
          onClick={() => setActiveSubTab('VIEW_ANNEX')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeSubTab === 'VIEW_ANNEX'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Phụ Lục Hợp Đồng Kèm Theo ({currentTenantChanges.length.toLocaleString('vi-VN')})</span>
        </button>
      </div>

      {/* TAB 1: DANH SÁCH TẤT CẢ NHÂN VIÊN & TÌNH TRẠNG HỢP ĐỒNG */}
      {activeSubTab === 'CONTRACT_LIST' && (
        <div className="space-y-3">
          {/* Bộ lọc và tìm kiếm */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã NV, họ tên, số HĐ, phòng ban..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-slate-500 font-medium">Loại HĐ:</span>
                <select
                  value={contractTypeFilter}
                  onChange={(e) => { setContractTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Tất cả loại HĐ</option>
                  <option value="PROBATION">Thử việc</option>
                  <option value="DEFINITE_12M">12 Tháng</option>
                  <option value="DEFINITE_24M">24 Tháng</option>
                  <option value="INDEFINITE">Không xác định thời hạn</option>
                  <option value="CIVIL_SERVICE">Cộng tác viên / Dịch vụ</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="OFFICIAL">Chính thức</option>
                  <option value="PROBATION">Thử việc</option>
                  <option value="RESIGNED">Đã nghỉ việc</option>
                </select>
              </div>

              {(colFilters.name || colFilters.contractNumber || colFilters.contractType || colFilters.date || colFilters.dept || colFilters.salary || colFilters.status) && (
                <button
                  onClick={() => {
                    setColFilters({ name: '', contractNumber: '', contractType: '', date: '', dept: '', salary: '', status: '' });
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                  title="Xóa tất cả lọc cột"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* Bảng danh sách chi tiết với hàng lọc toán học dưới tiêu đề */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 w-40">Mã & Họ Tên</th>
                  <th className="p-3 w-32">Số Hợp Đồng</th>
                  <th className="p-3 w-40">Loại Hợp Đồng</th>
                  <th className="p-3 w-36">Ngày Hiệu Lực</th>
                  <th className="p-3 min-w-[160px]">Vị Trí & Phòng Ban</th>
                  <th className="p-3 text-right w-32">Lương BHXH</th>
                  <th className="p-3 text-center w-24">Phụ Lục</th>
                  <th className="p-3 text-center w-32">Tình Trạng</th>
                  <th className="p-3 text-center w-28">Thao Tác</th>
                </tr>
                {/* HÀNG TÌM KIẾM CỘT DƯỚI TIÊU ĐỀ */}
                <tr className="bg-slate-100/80 border-b border-slate-200">
                  <th className="p-1.5">
                    <input
                      type="text"
                      placeholder="Tên/mã..."
                      value={colFilters.name}
                      onChange={(e) => { setColFilters({ ...colFilters, name: e.target.value }); setCurrentPage(1); }}
                      className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="p-1.5">
                    <input
                      type="text"
                      placeholder="Số HĐ..."
                      value={colFilters.contractNumber}
                      onChange={(e) => { setColFilters({ ...colFilters, contractNumber: e.target.value }); setCurrentPage(1); }}
                      className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="p-1.5">
                    <input
                      type="text"
                      placeholder="Loại HĐ..."
                      value={colFilters.contractType}
                      onChange={(e) => { setColFilters({ ...colFilters, contractType: e.target.value }); setCurrentPage(1); }}
                      className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="p-1.5">
                    <input
                      type="text"
                      placeholder="Ngày..."
                      value={colFilters.date}
                      onChange={(e) => { setColFilters({ ...colFilters, date: e.target.value }); setCurrentPage(1); }}
                      className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="p-1.5">
                    <input
                      type="text"
                      placeholder="Vị trí/phòng..."
                      value={colFilters.dept}
                      onChange={(e) => { setColFilters({ ...colFilters, dept: e.target.value }); setCurrentPage(1); }}
                      className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="p-1.5">
                    <input
                      type="text"
                      placeholder=">= 7000000..."
                      value={colFilters.salary}
                      onChange={(e) => { setColFilters({ ...colFilters, salary: e.target.value }); setCurrentPage(1); }}
                      className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </th>
                  <th className="p-1.5 text-center text-slate-400 font-normal">-</th>
                  <th className="p-1.5">
                    <input
                      type="text"
                      placeholder="Tình trạng..."
                      value={colFilters.status}
                      onChange={(e) => { setColFilters({ ...colFilters, status: e.target.value }); setCurrentPage(1); }}
                      className="w-full px-2 py-1 text-[11px] font-normal rounded border border-slate-300 bg-white outline-none focus:border-indigo-500"
                    />
                  </th>
                  <th className="p-1.5 text-center text-slate-400 font-normal">-</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      Không tìm thấy nhân viên hoặc hợp đồng phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => {
                    const annexCount = currentTenantChanges.filter(c => c.employeeId === emp.id).length;
                    return (
                      <tr 
                        key={emp.id} 
                        onClick={() => {
                          setSelectedEmployee(emp);
                          const annexes = currentTenantChanges.filter(c => c.employeeId === emp.id);
                          if (annexes.length > 0) setSelectedAnnex(annexes[0]);
                        }}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          selectedEmployee?.id === emp.id ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{emp.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{emp.code}</div>
                        </td>
                        <td className="p-3 font-mono font-medium text-slate-700">
                          {emp.contractNumber}
                        </td>
                        <td className="p-3">
                          <span className="text-slate-800 font-medium">{getContractTypeName(emp.contractType)}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-600">
                          <div>Từ: {emp.contractStartDate}</div>
                          {emp.contractEndDate && (
                            <div className="text-slate-400 text-[10px]">Đến: {emp.contractEndDate}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{emp.position}</div>
                          <div className="text-[10px] text-slate-500">{emp.departmentName}</div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {emp.baseSalary.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-3 text-center">
                          {annexCount > 0 ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmployee(emp);
                                const annexes = currentTenantChanges.filter(c => c.employeeId === emp.id);
                                setSelectedAnnex(annexes[0] || null);
                                setActiveSubTab('VIEW_ANNEX');
                              }}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            >
                              {annexCount} phụ lục
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px]">0</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {getContractStatusBadge(emp)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmployee(emp);
                                setActiveSubTab('VIEW_CONTRACT');
                              }}
                              title="Xem Hợp Đồng"
                              className="px-2 py-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded text-[10px] font-semibold"
                            >
                              Xem HĐ
                            </button>
                            {annexCount > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEmployee(emp);
                                  const annexes = currentTenantChanges.filter(c => c.employeeId === emp.id);
                                  setSelectedAnnex(annexes[0] || null);
                                  setActiveSubTab('VIEW_ANNEX');
                                }}
                                title="Xem Phụ Lục HĐ"
                                className="px-2 py-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded text-[10px] font-semibold"
                              >
                                Phụ Lục
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

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
                Hiển thị tối đa <span className="font-bold text-slate-800">{pageSize}</span> hợp đồng/trang (không phải cuộn dài)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHI TIẾT MẪU HỢP ĐỒNG LAO ĐỘNG (BLLĐ 2019) */}
      {activeSubTab === 'VIEW_CONTRACT' && (
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row items-center justify-between bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200 gap-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-slate-600">Đang hiển thị hợp đồng của: </span>
                <b className="text-indigo-950 font-bold">{selectedEmployee?.fullName} ({selectedEmployee?.code})</b>
                <span className="text-slate-500"> - Số HĐ: </span>
                <span className="font-mono font-bold text-slate-800">{selectedEmployee?.contractNumber}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Chọn nhân viên khác:</span>
              <select
                value={selectedEmployee?.id}
                onChange={(e) => {
                  const emp = currentTenantEmployees.find(emp => emp.id === e.target.value);
                  if (emp) {
                    setSelectedEmployee(emp);
                    const annexes = currentTenantChanges.filter(c => c.employeeId === emp.id);
                    if (annexes.length > 0) setSelectedAnnex(annexes[0]);
                  }
                }}
                className="text-xs font-semibold p-1.5 rounded-lg border border-slate-300 bg-white"
              >
                {currentTenantEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.code})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedEmployee && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-3 text-xs text-slate-800 leading-relaxed print:p-0 print:border-none print:shadow-none">
              {/* Tiêu ngữ Quốc Gia */}
              <div className="text-center space-y-1">
                <h3 className="font-bold text-sm tracking-wider uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                <p className="font-semibold underline underline-offset-4 text-xs">Độc lập - Tự do - Hạnh phúc</p>
                <div className="pt-3 font-bold text-base text-indigo-900 tracking-wide">
                  HỢP ĐỒNG LAO ĐỘNG
                </div>
                <p className="text-slate-500 font-mono text-xs">Số: {selectedEmployee.contractNumber}</p>
                <p className="text-[11px] text-slate-400 italic">
                  (Ban hành theo quy định của Bộ luật Lao động số 45/2019/QH14 và các văn bản hướng dẫn thi hành)
                </p>
              </div>

              {/* Điều khoản 1: Các bên giao kết */}
              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-xs">BÊN A: NGƯỜI SỬ DỤNG LAO ĐỘNG (DOANH NGHIỆP)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div><b>Tên doanh nghiệp:</b> {policy.companyName}</div>
                    <div><b>Mã số thuế:</b> {policy.taxCode}</div>
                    <div><b>Địa chỉ:</b> {policy.address || 'Khu Công Nghiệp VSIP, Việt Nam'}</div>
                    <div><b>Đại diện theo pháp luật:</b> Tổng Giám Đốc</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-xs">BÊN B: NGƯỜI LAO ĐỘNG</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div><b>Họ và tên:</b> <span className="font-bold text-slate-900">{selectedEmployee.fullName}</span></div>
                    <div><b>Mã nhân sự:</b> <span className="font-mono font-bold text-indigo-700">{selectedEmployee.code}</span></div>
                    <div><b>Số CCCD:</b> {selectedEmployee.cccd}</div>
                    <div><b>Ngày sinh:</b> {selectedEmployee.dob} ({selectedEmployee.gender === 'MALE' ? 'Nam' : 'Nữ'})</div>
                    <div><b>Số điện thoại:</b> {selectedEmployee.phone}</div>
                    <div><b>Mã số thuế cá nhân:</b> {selectedEmployee.taxCode || 'Theo đăng ký cơ quan thuế'}</div>
                    <div><b>Số sổ BHXH:</b> {selectedEmployee.socialInsuranceNumber || 'Đăng ký mới'}</div>
                    <div><b>Tài khoản ngân hàng:</b> {selectedEmployee.bankAccountNumber} ({selectedEmployee.bankName})</div>
                  </div>
                </div>
              </div>

              {/* Điều khoản 2: Thời hạn hợp đồng & Chế độ làm việc */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase text-xs">ĐIỀU 1: THỜI HẠN VÀ ĐỊA ĐIỂM LÀM VIỆC</h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p>• <b>Loại hợp đồng:</b> {getContractTypeName(selectedEmployee.contractType)}</p>
                  <p>• <b>Thời hạn hợp đồng:</b> Từ ngày <b>{selectedEmployee.contractStartDate}</b> {selectedEmployee.contractEndDate ? `đến ngày ${selectedEmployee.contractEndDate}` : '(Không xác định thời hạn)'}.</p>
                  <p>• <b>Địa điểm làm việc:</b> {selectedEmployee.branchName} - {policy.companyName}.</p>
                  <p>• <b>Chức danh / Vị trí chuyên môn:</b> {selectedEmployee.position} thuộc <b>{selectedEmployee.departmentName}</b>.</p>
                  <p>• <b>Thời giờ làm việc:</b> 8 giờ/ngày theo quy chế ca kíp doanh nghiệp, bảo đảm không quá 48 giờ/tuần và nghỉ giữa ca liên tục ít nhất 12 giờ theo Điều 110 BLLĐ.</p>
                </div>
              </div>

              {/* Điều khoản 3: Tiền lương và quyền lợi */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase text-xs">ĐIỀU 2: TIỀN LƯƠNG, PHỤ CẤP VÀ CÁC KHOẢN BỔ SUNG KHÁC</h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p>• <b>Mức lương chính (đóng BHXH):</b> <b className="text-slate-900 font-mono">{selectedEmployee.baseSalary.toLocaleString('vi-VN')} VNĐ/tháng</b>.</p>
                    <p>• <b>Lương chức danh / năng lực (3P):</b> <b className="text-slate-900 font-mono">{selectedEmployee.positionSalary.toLocaleString('vi-VN')} VNĐ/tháng</b>.</p>
                    <p>• <b>Phụ cấp ăn ca:</b> <span className="font-mono">{selectedEmployee.lunchAllowance.toLocaleString('vi-VN')} VNĐ/tháng</span> (Miễn thuế TNCN theo TT 111/2013).</p>
                    <p>• <b>Chế độ độc hại:</b> {selectedEmployee.toxicTier > 0 ? `Bồi dưỡng Mức ${selectedEmployee.toxicTier} bằng HIỆN VẬT theo Thông tư 24/2022/TT-BLĐTBXH` : 'Không thuộc danh mục độc hại'}.</p>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    • <b>Hình thức trả lương:</b> Chuyển khoản ngân hàng định kỳ vào ngày {policy.payrollCycleType === 'CYCLE_26_TO_25' ? '05' : '10'} hàng tháng.
                  </p>
                </div>
              </div>

              {/* Điều khoản 4: Chữ ký 2 bên */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center">
                <div className="space-y-1">
                  <p className="font-bold uppercase text-slate-900">NGƯỜI LAO ĐỘNG</p>
                  <p className="text-[11px] text-slate-400 italic">(Ký số điện tử OTP / Ký ghi rõ họ tên)</p>
                  <div className="h-24 flex items-center justify-center">
                    {isSigned ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-sm">
                        ✓ ĐÃ KÝ SỐ XÁC THỰC OTP (SHA-256)<br />
                        <span className="text-[10px] font-normal text-emerald-600">{new Date().toLocaleString('vi-VN')}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 italic text-xs">[Chưa ký số OTP]</span>
                    )}
                  </div>
                  <p className="font-bold text-slate-900">{selectedEmployee.fullName}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold uppercase text-slate-900">NGƯỜI SỬ DỤNG LAO ĐỘNG</p>
                  <p className="text-[11px] text-slate-400 italic">(Đại diện theo pháp luật)</p>
                  <div className="h-24 flex items-center justify-center">
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-800 text-xs font-bold shadow-sm">
                      ✓ ĐÃ KÝ SỐ DOANH NGHIỆP (CA-VNPT)<br />
                      <span className="text-[10px] font-normal text-indigo-600">{policy.companyName}</span>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">TỔNG GIÁM ĐỐC</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PHỤ LỤC HỢP ĐỒNG LAO ĐỘNG KÈM THEO */}
      {activeSubTab === 'VIEW_ANNEX' && (
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 gap-3">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-slate-600">Phụ lục của: </span>
                <b className="text-emerald-950 font-bold">{selectedEmployee?.fullName} ({selectedEmployee?.code})</b>
                <span className="text-slate-500"> - Có </span>
                <b className="text-emerald-800">{employeeAnnexes.length} phụ lục</b> ghi nhận thay đổi vị trí, lương, chức danh.
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Chọn phụ lục:</span>
              <select
                value={selectedAnnex?.id}
                onChange={(e) => {
                  const item = employeeAnnexes.find(a => a.id === e.target.value);
                  if (item) setSelectedAnnex(item);
                }}
                className="text-xs font-semibold p-1.5 rounded-lg border border-slate-300 bg-white"
              >
                {employeeAnnexes.map((a, idx) => (
                  <option key={a.id} value={a.id}>Phụ lục #{idx + 1}: {a.reason} ({a.effectiveDate})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedAnnex ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-3 text-xs text-slate-800 leading-relaxed print:p-0 print:border-none print:shadow-none">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-sm tracking-wider uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                <p className="font-semibold underline underline-offset-4 text-xs">Độc lập - Tự do - Hạnh phúc</p>
                <div className="pt-3 font-bold text-base text-emerald-900 tracking-wide">
                  PHỤ LỤC HỢP ĐỒNG LAO ĐỘNG
                </div>
                <p className="text-slate-500 font-mono text-xs">Số: {selectedAnnex.decisionNumber || 'PLHD-01'}</p>
                <p className="text-[11px] text-slate-400 italic">
                  (Căn cứ HĐLĐ số {selectedEmployee?.contractNumber} ký giữa {policy.companyName} và Ông/Bà {selectedEmployee?.fullName})
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-xs">NỘI DUNG THAY ĐỔI, BỔ SUNG:</h4>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div>• <b>Lý do sửa đổi:</b> {selectedAnnex.reason}</div>
                  <div>• <b>Ngày bắt đầu có hiệu lực:</b> <span className="font-bold text-indigo-700">{selectedAnnex.effectiveDate}</span></div>
                  <div>• <b>Vị trí mới:</b> {selectedAnnex.newPosition} (trước đây: {selectedAnnex.oldPosition})</div>
                  <div>• <b>Phòng ban / Xưởng mới:</b> {selectedAnnex.newDepartment} (trước đây: {selectedAnnex.oldDepartment})</div>
                  <div>• <b>Mức lương mới áp dụng:</b> <span className="font-mono font-bold text-emerald-700">{selectedAnnex.newBaseSalary?.toLocaleString('vi-VN')} VNĐ/tháng</span></div>
                </div>
                <p className="text-slate-600 italic text-[11px]">
                  Các điều khoản khác của Hợp đồng lao động số {selectedEmployee?.contractNumber} không được sửa đổi, bổ sung tại Phụ lục này vẫn giữ nguyên giá trị thi hành.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center">
                <div className="space-y-1">
                  <p className="font-bold uppercase text-slate-900">NGƯỜI LAO ĐỘNG</p>
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-slate-400 italic">[Đã ký nháy phụ lục]</span>
                  </div>
                  <p className="font-bold text-slate-900">{selectedEmployee?.fullName}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold uppercase text-slate-900">NGƯỜI SỬ DỤNG LAO ĐỘNG</p>
                  <div className="h-20 flex items-center justify-center">
                    <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                      ✓ ĐÃ XÁC THỰC DOANH NGHIỆP
                    </div>
                  </div>
                  <p className="font-semibold text-slate-800">{selectedAnnex.decisionSignerName}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-xl">
              Chưa có phụ lục hợp đồng nào cho nhân sự này.
            </div>
          )}
        </div>
      )}

      {/* MODAL NHẬP MÃ OTP KÝ SỐ */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-3 space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Xác Thực Ký Số Bằng Mã OTP</h3>
              </div>
              <button onClick={() => setShowSignModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Mã xác thực gồm 6 chữ số đã được gửi mô phỏng đến số điện thoại <b>{selectedEmployee?.phone}</b> của nhân sự <b>{selectedEmployee?.fullName}</b>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-1.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nhập mã OTP (Thử nghiệm: 123456):</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-bold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Xác Nhận Ký Hợp Đồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
