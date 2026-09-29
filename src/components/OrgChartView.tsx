import React, { useState, useMemo } from 'react';
import { CompanyPolicy, Employee } from '../types/hrm';
import { 
  Network, 
  Building2, 
  Factory, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  User, 
  UserX, 
  UserPlus, 
  AlertCircle, 
  Search, 
  Briefcase, 
  CheckCircle2, 
  MapPin, 
  BarChart3, 
  Filter,
  Layers,
  ChevronUp,
  ChevronLeft
} from 'lucide-react';

interface OrgChartViewProps {
  policy: CompanyPolicy;
  employees: Employee[];
}

export const OrgChartView: React.FC<OrgChartViewProps> = ({ policy, employees }) => {
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ORG_TREE' | 'VACANCIES'>('ORG_TREE');
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

  const currentTenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === policy.tenantId);
  }, [employees, policy.tenantId]);

  const activeEmployees = useMemo(() => {
    return currentTenantEmployees.filter(e => e.status !== 'RESIGNED' && e.status !== 'DISMISSED');
  }, [currentTenantEmployees]);

  const resignedEmployees = useMemo(() => {
    return currentTenantEmployees.filter(e => e.status === 'RESIGNED' || e.status === 'DISMISSED');
  }, [currentTenantEmployees]);

  // Danh sách các chi nhánh chuẩn
  const branchNames = useMemo(() => {
    const list = Array.from(new Set(currentTenantEmployees.map(e => e.branchName).filter(Boolean)));
    return list.sort();
  }, [currentTenantEmployees]);

  // Lọc chi nhánh đang chọn
  const filteredBranches = useMemo(() => {
    if (selectedBranch === 'ALL') return branchNames;
    return branchNames.filter(b => b === selectedBranch);
  }, [branchNames, selectedBranch]);

  // Định biên động tính toán khoa học
  const getDeptQuota = (deptEmps: Employee[], deptResigned: Employee[]) => {
    const activeCount = deptEmps.length;
    const vacantCount = deptResigned.length;
    return Math.max(activeCount + vacantCount, Math.ceil(activeCount * 1.15));
  };

  const toggleDept = (deptKey: string) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptKey]: !prev[deptKey]
    }));
  };

  const toggleAllDepts = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    branchNames.forEach(b => {
      const bEmps = currentTenantEmployees.filter(e => e.branchName === b);
      const depts = Array.from(new Set(bEmps.map(e => e.departmentName)));
      depts.forEach(d => {
        next[`${b}__${d}`] = expand;
      });
    });
    setExpandedDepts(next);
  };

  // Tổng quan chỉ số toàn doanh nghiệp
  const totalActiveCount = activeEmployees.length;
  const totalVacantCount = resignedEmployees.length;
  const totalNominalQuota = totalActiveCount + totalVacantCount;
  const fillRate = totalNominalQuota > 0 ? Math.round((totalActiveCount / totalNominalQuota) * 100) : 100;

  // Tìm kiếm nhân sự hoặc chức danh
  const filterEmployeeMatch = (emp: Employee) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      emp.fullName.toLowerCase().includes(q) ||
      emp.code.toLowerCase().includes(q) ||
      emp.position.toLowerCase().includes(q) ||
      emp.departmentName.toLowerCase().includes(q)
    );
  };

  const [selectedEmpDetail, setSelectedEmpDetail] = useState<Employee | null>(null);

  // Danh sách toàn bộ các phòng ban/phân xưởng cần hiển thị (theo chi nhánh và tìm kiếm)
  const allDeptsList = useMemo(() => {
    const list: Array<{ branchName: string; deptName: string; deptKey: string }> = [];
    filteredBranches.forEach(bName => {
      const bDepts = Array.from(new Set(
        currentTenantEmployees.filter(e => e.branchName === bName).map(e => e.departmentName)
      )).filter(d => d !== 'Ban Tổng Giám Đốc');

      bDepts.forEach(dName => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchDept = dName.toLowerCase().includes(q);
          const matchEmp = currentTenantEmployees.some(e => 
            e.branchName === bName && e.departmentName === dName && filterEmployeeMatch(e)
          );
          if (!matchDept && !matchEmp) return;
        }
        list.push({ branchName: bName, deptName: dName, deptKey: `${bName}__${dName}` });
      });
    });
    return list;
  }, [filteredBranches, currentTenantEmployees, searchQuery]);

  // Phân trang danh sách phòng ban: 3 bảng / hàng × 2 hàng = 6 bảng / trang
  const DEPT_PAGE_SIZE = 6;
  const [deptPage, setDeptPage] = useState(1);
  const totalDeptPages = Math.ceil(allDeptsList.length / DEPT_PAGE_SIZE) || 1;

  const paginatedDepts = useMemo(() => {
    const start = (deptPage - 1) * DEPT_PAGE_SIZE;
    return allDeptsList.slice(start, start + DEPT_PAGE_SIZE);
  }, [allDeptsList, deptPage]);

  // Phân trang Tab Vị Trí Khuyết: 8 dòng / trang
  const VACANCIES_PAGE_SIZE = 8;
  const [vacanciesPage, setVacanciesPage] = useState(1);
  const totalVacanciesPages = Math.ceil(resignedEmployees.length / VACANCIES_PAGE_SIZE) || 1;

  const paginatedVacancies = useMemo(() => {
    const start = (vacanciesPage - 1) * VACANCIES_PAGE_SIZE;
    return resignedEmployees.slice(start, start + VACANCIES_PAGE_SIZE);
  }, [resignedEmployees, vacanciesPage]);

  // Quan hệ 3 cấp của nhân sự được chọn: Cấp trên, Đồng nghiệp ngang cấp, Cấp dưới
  const employeeRelations = useMemo(() => {
    if (!selectedEmpDetail) return null;
    const current = selectedEmpDetail;
    const manager = currentTenantEmployees.find(e => e.id === current.managerId || (current.managerId === 'EMP-001' && e.code === 'AF-001'));
    const peers = currentTenantEmployees.filter(e => 
      e.id !== current.id && 
      e.departmentName === current.departmentName && 
      (e.status === 'OFFICIAL' || e.status === 'PROBATION')
    );
    const subordinates = currentTenantEmployees.filter(e => 
      e.managerId === current.id || (current.code === 'AF-001' && e.managerId === 'EMP-001')
    );
    return { current, manager, peers, subordinates };
  }, [selectedEmpDetail, currentTenantEmployees]);

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ VÀ THẺ METRIC */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Sơ Đồ Tổ Chức & Quản Trị Định Biên</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cơ cấu tổ chức đa chi nhánh: Bấm vào bất kỳ nhân viên nào để mở sơ đồ 3 cấp (Cấp trên - Đồng nghiệp - Cấp dưới)
          </p>
        </div>

        {/* Thống kê quân số trực quan với dấu chấm phân cách hàng ngàn */}
        <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-2xl border border-slate-200 text-xs shadow-sm">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600">Đang Làm Việc</span>
            <span className="text-base font-black">{totalActiveCount.toLocaleString('vi-VN')}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 flex flex-col items-center cursor-pointer hover:bg-rose-100 transition-colors"
               onClick={() => setActiveTab('VACANCIES')}
               title="Bấm để xem danh sách vị trí trống cần tuyển bù đắp">
            <span className="text-[10px] uppercase font-bold text-rose-600">Vị Trí Cần Tuyển</span>
            <span className="text-base font-black">{totalVacantCount.toLocaleString('vi-VN')}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-100 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-indigo-600">Tỷ Lệ Lấp Đầy</span>
            <span className="text-base font-black">{fillRate}%</span>
          </div>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG VÀ BỘ LỌC CHI NHÁNH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Tabs chính */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold w-fit">
            <button
              onClick={() => setActiveTab('ORG_TREE')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ORG_TREE' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cây Phân Cấp Tổ Chức
            </button>
            <button
              onClick={() => setActiveTab('VACANCIES')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'VACANCIES' 
                  ? 'bg-white text-rose-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Vị Trí Cần Tuyển Bù Đắp</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                {totalVacantCount}
              </span>
            </button>
          </div>

          {/* Ô tìm kiếm nhanh */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhân sự, chức danh, mã NV..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDeptPage(1);
                  setVacanciesPage(1);
                }}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none w-64 transition-all"
              />
            </div>
            
            {activeTab === 'ORG_TREE' && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => toggleAllDepts(true)}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Mở hết
                </button>
                <button
                  onClick={() => toggleAllDepts(false)}
                  className="px-2.5 py-1.5 text-[11px] font-medium rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Thu gọn
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Lọc theo Chi nhánh / Đơn vị */}
        {activeTab === 'ORG_TREE' && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px] font-medium flex items-center mr-1">
              <Filter className="w-3 h-3 mr-1" /> Chi nhánh:
            </span>
            <button
              onClick={() => {
                setSelectedBranch('ALL');
                setDeptPage(1);
              }}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedBranch === 'ALL'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              Tất Cả ({activeEmployees.length.toLocaleString('vi-VN')} nhân sự)
            </button>
            {branchNames.map((bName) => {
              const bCount = activeEmployees.filter(e => e.branchName === bName).length;
              return (
                <button
                  key={bName}
                  onClick={() => {
                    setSelectedBranch(bName);
                    setDeptPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedBranch === bName
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
                  }`}
                >
                  {bName} ({bCount.toLocaleString('vi-VN')})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================== TAB 1: CÂY PHÂN CẤP TỔ CHỨC ===================== */}
      {activeTab === 'ORG_TREE' && (
        <div className="space-y-4">
          {/* CẤP ĐIỀU HÀNH CAO NHẤT: THIẾT KẾ THU GỌN */}
          {(selectedBranch === 'ALL' || selectedBranch.includes('Trụ Sở Chính')) && (
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{policy.companyName}</h3>
                    <p className="text-[10.5px] text-slate-500">Hội Đồng Quản Trị & Ban Tổng Giám Đốc Điều Hành (HQ TP.HCM)</p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 font-bold">
                  Ban Lãnh Đạo Trọng Yếu
                </span>
              </div>

              {/* Thẻ thành viên Ban Điều Hành */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {activeEmployees
                  .filter(e => e.departmentName === 'Ban Tổng Giám Đốc')
                  .map((leader) => (
                    <div 
                      key={leader.id} 
                      onClick={() => setSelectedEmpDetail(leader)}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer transition-all flex items-center space-x-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs flex-shrink-0">
                        {leader.fullName.split(' ').pop()?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate hover:text-indigo-600">{leader.fullName}</h4>
                        <p className="text-[10.5px] text-indigo-700 font-medium truncate">{leader.position}</p>
                        <span className="text-[9.5px] text-slate-400 font-mono block">{leader.code} • Bấm xem cấp dưới</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* LƯỚI CÁC PHÒNG BAN / PHÂN XƯỞNG: 3 BẢNG 1 HÀNG, THU NHỎ GỌN GÀNG, CẮT SANG TRANG SAU KHI ĐẦY */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedDepts.map(({ branchName, deptName, deptKey }) => {
              const isExpanded = expandedDepts[deptKey] ?? false;
              const branchActive = activeEmployees.filter(e => e.branchName === branchName);
              const branchResigned = resignedEmployees.filter(e => e.branchName === branchName);

              const deptActiveEmps = branchActive.filter(e => e.departmentName === deptName && filterEmployeeMatch(e));
              const allDeptActive = branchActive.filter(e => e.departmentName === deptName);
              const deptResignedEmps = branchResigned.filter(e => e.departmentName === deptName);
              const quota = getDeptQuota(allDeptActive, deptResignedEmps);
              const deptFillRate = quota > 0 ? Math.round((allDeptActive.length / quota) * 100) : 100;

              // Trưởng bộ phận / Quản đốc (nếu có)
              const manager = allDeptActive.find(e => 
                e.position.includes('Trưởng Phòng') || 
                e.position.includes('Quản Đốc') || 
                e.position.includes('Giám Đốc') ||
                e.position.includes('Trạm Trưởng')
              );

              return (
                <div 
                  key={deptKey} 
                  className="border border-slate-200 rounded-xl bg-white hover:border-indigo-300 transition-all shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  {/* Header Thẻ Phòng Ban */}
                  <div 
                    onClick={() => toggleDept(deptKey)}
                    className="p-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1 mb-0.5">
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 truncate max-w-[130px]">
                            {branchName}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 hover:text-indigo-600 transition-colors truncate" title={deptName}>
                          {deptName}
                        </h4>
                        {manager ? (
                          <p className="text-[10.5px] text-slate-500 mt-0.5 truncate flex items-center">
                            <Briefcase className="w-2.5 h-2.5 mr-1 text-slate-400 flex-shrink-0" />
                            Phụ trách: <span className="font-semibold text-slate-800 ml-1">{manager.fullName}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-0.5 italic">Chưa bổ nhiệm cấp trưởng</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <span className={`px-1.5 py-0.2 text-[9.5px] font-bold rounded-md border ${
                          deptFillRate >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          deptFillRate >= 75 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {allDeptActive.length}/{quota} ({deptFillRate}%)
                        </span>
                        <div className="p-0.5 text-slate-400 hover:text-slate-600">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>

                    {/* Dải tiến độ định biên */}
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">{allDeptActive.length} đang làm</span>
                      {deptResignedEmps.length > 0 && (
                        <span className="text-rose-600 font-bold">({deptResignedEmps.length} vị trí trống)</span>
                      )}
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full ${
                          deptFillRate >= 90 ? 'bg-emerald-500' :
                          deptFillRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, deptFillRate)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* DANH SÁCH NHÂN VIÊN MỞ RỘNG */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Nhân sự ({deptActiveEmps.length})</span>
                        <span>Chức vụ</span>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                        {deptActiveEmps.map((emp) => (
                          <div 
                            key={emp.id} 
                            onClick={() => setSelectedEmpDetail(emp)}
                            className="pt-1 flex items-center justify-between text-[11px] hover:bg-indigo-50/60 cursor-pointer p-1 rounded transition-colors group"
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[9px] group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                                {emp.fullName.split(' ').pop()?.substring(0, 1)}
                              </div>
                              <span className="font-semibold text-slate-900 group-hover:text-indigo-600 truncate">{emp.fullName}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 truncate max-w-[110px] ml-1">{emp.position}</span>
                          </div>
                        ))}

                        {deptActiveEmps.length === 0 && (
                          <div className="text-center py-2 text-[11px] text-slate-400 italic">
                            Không có nhân viên phù hợp
                          </div>
                        )}
                      </div>

                      {/* Vị trí khuyết */}
                      {deptResignedEmps.length > 0 && (
                        <div className="mt-1 pt-1.5 border-t border-dashed border-rose-200">
                          <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                            Vị trí trống ({deptResignedEmps.length}):
                          </span>
                          <div className="space-y-1">
                            {deptResignedEmps.slice(0, 2).map((v) => (
                              <div key={`vac-${v.id}`} className="flex items-center justify-between text-[10px] p-1 rounded bg-rose-50 text-rose-900 border border-rose-200">
                                <span className="font-semibold truncate">{v.position.replace('(Đã thôi việc)', '').trim()}</span>
                                <span className="text-[9px] text-rose-600 font-mono ml-1">Cần tuyển</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* THANH PHÂN TRANG (PAGINATION: 3 BẢNG × 2 HÀNG = 6 BẢNG / TRANG) */}
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="text-xs text-slate-500">
              Hiển thị <b className="text-slate-800">{allDeptsList.length > 0 ? (deptPage - 1) * DEPT_PAGE_SIZE + 1 : 0} - {Math.min(deptPage * DEPT_PAGE_SIZE, allDeptsList.length)}</b> trong tổng số <b className="text-slate-800">{allDeptsList.length.toLocaleString('vi-VN')}</b> phòng ban/xưởng (3 bảng/hàng × 2 hàng/trang)
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setDeptPage(p => Math.max(1, p - 1))}
                disabled={deptPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-all ${
                  deptPage === 1
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-xs'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trang trước</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalDeptPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setDeptPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      deptPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setDeptPage(p => Math.min(totalDeptPages, p + 1))}
                disabled={deptPage === totalDeptPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-all ${
                  deptPage === totalDeptPages
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-xs'
                }`}
              >
                <span>Trang sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: VỊ TRÍ CẦN TUYỂN BÙ ĐẮP ===================== */}
      {activeTab === 'VACANCIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900">Danh Sách Vị Trí Khuyết Cần Tuyển Bù Đắp (Succession Planning)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp {resignedEmployees.length.toLocaleString('vi-VN')} vị trí đang trống do nhân sự thôi việc hoặc bị xử lý kỷ luật sa thải, cần mở đợt tuyển dụng ATS AI
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10.5px] tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">Vị Trí Cần Tuyển</th>
                  <th className="px-3.5 py-2.5">Chi Nhánh & Phòng Ban</th>
                  <th className="px-3.5 py-2.5">Nhân Sự Cũ Từng Đảm Nhiệm</th>
                  <th className="px-3.5 py-2.5">Lý Do Khuyết</th>
                  <th className="px-3.5 py-2.5">Ngày Rời Đơn Vị</th>
                  <th className="px-3.5 py-2.5">Mức Lương Dự Kiến</th>
                  <th className="px-3.5 py-2.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedVacancies.map((emp) => {
                  const isDismissed = emp.status === 'DISMISSED';
                  const exitDate = emp.contractEndDate || (isDismissed ? emp.disciplinaryRecord?.decisionDate || '2026-06-25' : '2026-05-15');

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3.5 py-2 font-bold text-slate-900">
                        {emp.position.replace('(Đã thôi việc)', '').trim()}
                      </td>
                      <td className="px-3.5 py-2">
                        <span className="font-semibold text-slate-800 block">{emp.departmentName}</span>
                        <span className="text-[10.5px] text-slate-400">{emp.branchName}</span>
                      </td>
                      <td className="px-3.5 py-2">
                        <span className="font-medium text-slate-700">{emp.fullName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{emp.code}</span>
                      </td>
                      <td className="px-3.5 py-2">
                        {isDismissed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Sa Thải Kỷ Luật (Đ.125)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Thôi Việc Cá Nhân
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2 font-mono font-medium text-slate-600">
                        {exitDate}
                      </td>
                      <td className="px-3.5 py-2 font-semibold text-emerald-700">
                        {(emp.baseSalary + emp.positionSalary).toLocaleString('vi-VN')} đ/tháng
                      </td>
                      <td className="px-3.5 py-2 text-right">
                        <button
                          onClick={() => alert(`Đã chuyển vị trí "${emp.position}" của bộ phận ${emp.departmentName} sang phân hệ Tuyển Dụng (ATS AI)!`)}
                          className="px-2.5 py-1 text-[10.5px] font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                        >
                          Mở Tuyển ATS
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang Vị trí khuyết */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <div className="text-slate-500">
              Hiển thị <b className="text-slate-800">{resignedEmployees.length > 0 ? (vacanciesPage - 1) * VACANCIES_PAGE_SIZE + 1 : 0} - {Math.min(vacanciesPage * VACANCIES_PAGE_SIZE, resignedEmployees.length)}</b> trong tổng số <b className="text-slate-800">{resignedEmployees.length.toLocaleString('vi-VN')}</b> vị trí trống
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setVacanciesPage(p => Math.max(1, p - 1))}
                disabled={vacanciesPage === 1}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-all ${
                  vacanciesPage === 1
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-xs'
                }`}
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Trước</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalVacanciesPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setVacanciesPage(pageNum)}
                    className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      vacanciesPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setVacanciesPage(p => Math.min(totalVacanciesPages, p + 1))}
                disabled={vacanciesPage === totalVacanciesPages}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-all ${
                  vacanciesPage === totalVacanciesPages
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-xs'
                }`}
              >
                <span>Sau</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL / DRAWER SƠ ĐỒ 3 CẤP NHÂN SỰ (CẤP TRÊN - ĐỒNG NGHIỆP - CẤP DƯỚI) */}
      {selectedEmpDetail && employeeRelations && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                  {selectedEmpDetail.fullName.split(' ').pop()?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                    <span>{selectedEmpDetail.fullName}</span>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono">
                      {selectedEmpDetail.code}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">{selectedEmpDetail.position} • {selectedEmpDetail.departmentName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmpDetail(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Nội dung 3 tầng quan hệ */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* TẦNG 1: CẤP QUẢN LÝ TRỰC TIẾP (REPORTS TO) */}
              <div className="border border-slate-200 rounded-xl p-3 bg-amber-50/40">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-2">
                  ⬆ Cấp Quản Lý Trực Tiếp (Báo cáo cho ai)
                </span>
                {employeeRelations.manager ? (
                  <div 
                    onClick={() => setSelectedEmpDetail(employeeRelations.manager!)}
                    className="p-2.5 rounded-lg bg-white border border-amber-200 hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{employeeRelations.manager.fullName}</span>
                      <span className="text-[11px] text-amber-700">{employeeRelations.manager.position}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {employeeRelations.manager.code}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Là thành viên Ban Điều Hành cao nhất, trực tiếp báo cáo Đại Hội Đồng Cổ Đông / HĐQT.
                  </p>
                )}
              </div>

              {/* TẦNG 2: NHÂN SỰ ĐANG XEM (CURRENT POSITION) */}
              <div className="border-2 border-indigo-500 rounded-xl p-3 bg-indigo-50/30">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-2">
                  ★ Vị Trí Đang Chọn
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Chi nhánh / Nhà máy:</span>
                    <span className="font-medium text-slate-800">{selectedEmpDetail.branchName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Loại hợp đồng:</span>
                    <span className="font-medium text-slate-800">{selectedEmpDetail.contractType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Ngày vào làm:</span>
                    <span className="font-medium text-slate-800">{selectedEmpDetail.joinDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Email / Liên lạc:</span>
                    <span className="font-medium text-slate-800">{selectedEmpDetail.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* TẦNG 3: CẤP DƯỚI TRỰC TIẾP (DIRECT SUBORDINATES) */}
              <div className="border border-slate-200 rounded-xl p-3 bg-emerald-50/40">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                  ⬇ Nhân Viên Cấp Dưới Trực Tiếp ({employeeRelations.subordinates.length} nhân sự)
                </span>
                {employeeRelations.subordinates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {employeeRelations.subordinates.map(sub => (
                      <div 
                        key={sub.id}
                        onClick={() => setSelectedEmpDetail(sub)}
                        className="p-2 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-1">
                          <span className="font-bold text-xs text-slate-900 block truncate">{sub.fullName}</span>
                          <span className="text-[10px] text-emerald-700 block truncate">{sub.position}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">{sub.code}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Không có nhân viên cấp dưới trực tiếp.</p>
                )}
              </div>

              {/* TẦNG 4: ĐỒNG NGHIỆP CÙNG PHÒNG / BAN (PEERS) */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  👥 Đồng Nghiệp Ngang Cấp Cùng Phòng Ban ({employeeRelations.peers.length} nhân sự)
                </span>
                {employeeRelations.peers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {employeeRelations.peers.slice(0, 10).map(peer => (
                      <div 
                        key={peer.id}
                        onClick={() => setSelectedEmpDetail(peer)}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-1">
                          <span className="font-semibold text-xs text-slate-900 block truncate">{peer.fullName}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{peer.position}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">{peer.code}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Không có đồng nghiệp ngang cấp khác trong đơn vị.</p>
                )}
                {employeeRelations.peers.length > 10 && (
                  <p className="text-[10px] text-slate-500 mt-1 italic text-center">+ và {employeeRelations.peers.length - 10} đồng sự khác cùng phòng</p>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedEmpDetail(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

