import { FormattedNumberInput } from './FormattedNumberInput';
import React, { useState, useMemo } from 'react';
import { 
  PersonnelChange, 
  PersonnelChangeType, 
  PersonnelChangeStatus, 
  Employee, 
  CompanyPolicy, 
  UserRole 
} from '../types/hrm';
import * as XLSX from 'xlsx';
import { 
  UserCog, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Printer, 
  Download, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Ban, 
  FileSignature, 
  Building2, 
  Calendar, 
  TrendingUp, 
  Award,
  Layers,
  Sparkles,
  HelpCircle,
  Eye
} from 'lucide-react';

interface PersonnelChangesViewProps {
  personnelChanges: PersonnelChange[];
  employees: Employee[];
  policy: CompanyPolicy;
  currentRole: UserRole;
  onUpdatePersonnelChanges: (changes: PersonnelChange[]) => void;
  onUpdateEmployees: (employees: Employee[]) => void;
}

const CHANGE_TYPE_LABELS: Record<PersonnelChangeType, { label: string; color: string }> = {
  SALARY_ADJUSTMENT: { label: 'Điều Chỉnh Lương & Phụ Cấp', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  PROMOTION_APPOINTMENT: { label: 'Bổ Nhiệm / Đổi Chức Danh', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  DEPARTMENT_TRANSFER: { label: 'Điều Chuyển Phòng Ban', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  WORKPLACE_RELOCATION: { label: 'Thay Đổi Địa Điểm Làm Việc', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  BENEFITS_SHIFT_CHANGE: { label: 'Thay Đổi Chế Độ / Ca Kíp', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  OFFICIAL_CONVERSION: { label: 'Chuyển Chính Thức Sau Thử Việc', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  REWARD_DISCIPLINE: { label: 'Khen Thưởng / Kỷ Luật', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const STATUS_LABELS: Record<PersonnelChangeStatus, { label: string; badge: string }> = {
  DRAFT: { label: 'Dự thảo', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  PROPOSED: { label: 'Chờ HR Thẩm Định', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  HR_REVIEWED: { label: 'Chờ Ban Giám Đốc Duyệt', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  APPROVED: { label: 'Đã Duyệt (Chờ Ra QĐ)', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  DECISION_ISSUED: { label: 'Đã Ban Hành Quyết Định', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  APPLIED: { label: 'Đã Áp Dụng Vào Hệ Thống', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  REJECTED: { label: 'Từ Chối', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export const PersonnelChangesView: React.FC<PersonnelChangesViewProps> = ({
  personnelChanges,
  employees,
  policy,
  currentRole,
  onUpdatePersonnelChanges,
  onUpdateEmployees,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChange, setSelectedChange] = useState<PersonnelChange | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionPreviewChange, setDecisionPreviewChange] = useState<PersonnelChange | null>(null);

  // Form State tạo mới biến động
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [formType, setFormType] = useState<PersonnelChangeType>('SALARY_ADJUSTMENT');
  const [formTitle, setFormTitle] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formEffectiveDate, setFormEffectiveDate] = useState('2026-09-01');
  const [formProposedData, setFormProposedData] = useState<Partial<PersonnelChange['proposedData']>>({});

  const selectedEmployeeObj = useMemo(() => {
    return employees.find(e => e.id === selectedEmpId);
  }, [employees, selectedEmpId]);

  // Khi chọn nhân viên, tự nạp dữ liệu hiện tại làm base
  const handleSelectEmployeeForForm = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setFormProposedData({
        baseSalary: emp.baseSalary,
        positionSalary: emp.positionSalary,
        lunchAllowance: emp.lunchAllowance,
        transportAllowance: emp.transportAllowance,
        phoneAllowance: emp.phoneAllowance,
        toxicTier: emp.toxicTier,
        position: emp.position,
        departmentName: emp.departmentName,
        branchName: emp.branchName,
        status: emp.status
      });
      setFormTitle(`Đề xuất điều chỉnh nhân sự cho ${emp.fullName} (${emp.code})`);
    }
  };

  // Thống kê thẻ số liệu
  const stats = useMemo(() => {
    const total = personnelChanges.length;
    const pendingHr = personnelChanges.filter(c => c.status === 'PROPOSED').length;
    const pendingApproval = personnelChanges.filter(c => c.status === 'HR_REVIEWED').length;
    const decisionIssued = personnelChanges.filter(c => c.status === 'DECISION_ISSUED').length;
    const applied = personnelChanges.filter(c => c.status === 'APPLIED').length;
    return { total, pendingHr, pendingApproval, decisionIssued, applied };
  }, [personnelChanges]);

  // Lọc danh sách biến động
  const filteredChanges = useMemo(() => {
    return personnelChanges.filter(item => {
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (departmentFilter !== 'ALL' && item.departmentName !== departmentFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.employeeName.toLowerCase().includes(term);
        const matchCode = item.employeeCode.toLowerCase().includes(term);
        const matchChangeCode = item.code.toLowerCase().includes(term);
        const matchTitle = item.title.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchChangeCode && !matchTitle) return false;
      }
      return true;
    });
  }, [personnelChanges, typeFilter, statusFilter, departmentFilter, searchTerm]);

  // Danh sách phòng ban
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.departmentName) set.add(e.departmentName);
    });
    return Array.from(set);
  }, [employees]);

  // Xử lý tạo đề xuất
  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeObj) {
      alert('Vui lòng chọn nhân sự cần thực hiện thủ tục biến động!');
      return;
    }
    if (!formReason.trim()) {
      alert('Vui lòng nhập lý do đề xuất biến động nhân sự!');
      return;
    }

    const newCode = `BDNS-2026-${String(personnelChanges.length + 1).padStart(3, '0')}`;
    const newChange: PersonnelChange = {
      id: `CHG-${Date.now()}`,
      code: newCode,
      tenantId: policy.tenantId,
      employeeId: selectedEmployeeObj.id,
      employeeCode: selectedEmployeeObj.code,
      employeeName: selectedEmployeeObj.fullName,
      departmentName: selectedEmployeeObj.departmentName,
      currentPosition: selectedEmployeeObj.position,
      type: formType,
      title: formTitle.trim() || `Biến động nhân sự cho ${selectedEmployeeObj.fullName}`,
      reason: formReason.trim(),
      effectiveDate: formEffectiveDate,
      previousData: {
        baseSalary: selectedEmployeeObj.baseSalary,
        positionSalary: selectedEmployeeObj.positionSalary,
        lunchAllowance: selectedEmployeeObj.lunchAllowance,
        transportAllowance: selectedEmployeeObj.transportAllowance,
        phoneAllowance: selectedEmployeeObj.phoneAllowance,
        toxicTier: selectedEmployeeObj.toxicTier,
        position: selectedEmployeeObj.position,
        departmentName: selectedEmployeeObj.departmentName,
        branchName: selectedEmployeeObj.branchName,
        status: selectedEmployeeObj.status
      },
      proposedData: {
        baseSalary: Number(formProposedData.baseSalary) || selectedEmployeeObj.baseSalary,
        positionSalary: Number(formProposedData.positionSalary) || selectedEmployeeObj.positionSalary,
        lunchAllowance: Number(formProposedData.lunchAllowance) || selectedEmployeeObj.lunchAllowance,
        transportAllowance: Number(formProposedData.transportAllowance) || selectedEmployeeObj.transportAllowance,
        phoneAllowance: Number(formProposedData.phoneAllowance) || selectedEmployeeObj.phoneAllowance,
        toxicTier: formProposedData.toxicTier ?? selectedEmployeeObj.toxicTier,
        position: formProposedData.position || selectedEmployeeObj.position,
        departmentName: formProposedData.departmentName || selectedEmployeeObj.departmentName,
        branchName: formProposedData.branchName || selectedEmployeeObj.branchName,
        status: formProposedData.status || selectedEmployeeObj.status
      },
      status: 'PROPOSED',
      proposedBy: currentRole === 'GENERAL_DIRECTOR' ? 'Tổng Giám Đốc' : currentRole === 'HR_MANAGER' ? 'Trưởng Phòng HCNS' : 'Quản Lý Bộ Phận',
      proposedDate: new Date().toISOString().split('T')[0],
      isAppliedToPayroll: false,
      isAppliedToProfile: false
    };

    const updated = [newChange, ...personnelChanges];
    onUpdatePersonnelChanges(updated);
    setShowCreateModal(false);
    setSelectedEmpId('');
    setFormReason('');
    alert(`Đã lập đề xuất ${newCode} thành công và chuyển sang bước HR Thẩm Định!`);
  };

  // 1. HR Kiểm tra & Rà soát
  const handleHrReview = (changeId: string, notes: string) => {
    const updated = personnelChanges.map(c => {
      if (c.id === changeId) {
        return {
          ...c,
          status: 'HR_REVIEWED' as PersonnelChangeStatus,
          hrReviewedBy: 'Trần Thị Thu Thảo (Trưởng Phòng HCNS)',
          hrReviewedDate: new Date().toISOString().split('T')[0],
          hrNotes: notes || 'Đã kiểm tra hợp thức, đối chiếu quỹ lương và định biên nhân sự đạt yêu cầu.'
        };
      }
      return c;
    });
    onUpdatePersonnelChanges(updated);
    if (selectedChange?.id === changeId) {
      setSelectedChange(updated.find(c => c.id === changeId) || null);
    }
    alert('Đã hoàn thành bước HR Thẩm định & chuyển lên Ban Giám Đốc phê duyệt!');
  };

  // 2. Ban Giám Đốc Duyệt
  const handleApprove = (changeId: string, notes: string) => {
    const updated = personnelChanges.map(c => {
      if (c.id === changeId) {
        return {
          ...c,
          status: 'APPROVED' as PersonnelChangeStatus,
          approvedBy: 'Nguyễn Văn Hùng (Tổng Giám Đốc)',
          approvedDate: new Date().toISOString().split('T')[0],
          approvalNotes: notes || 'Phê duyệt đồng ý ban hành quyết định và áp dụng.'
        };
      }
      return c;
    });
    onUpdatePersonnelChanges(updated);
    if (selectedChange?.id === changeId) {
      setSelectedChange(updated.find(c => c.id === changeId) || null);
    }
    alert('Ban Giám Đốc đã phê duyệt! Hồ sơ sẵn sàng ban hành Quyết định chính thức.');
  };

  // 3. Từ chối
  const handleReject = (changeId: string, reason: string) => {
    const updated = personnelChanges.map(c => {
      if (c.id === changeId) {
        return {
          ...c,
          status: 'REJECTED' as PersonnelChangeStatus,
          approvalNotes: reason || 'Từ chối do chưa phù hợp kế hoạch định biên ngân sách.'
        };
      }
      return c;
    });
    onUpdatePersonnelChanges(updated);
    if (selectedChange?.id === changeId) {
      setSelectedChange(updated.find(c => c.id === changeId) || null);
    }
    alert('Đã từ chối đề xuất biến động nhân sự.');
  };

  // 4. Ban hành Quyết định chính thức
  const handleIssueDecision = (changeId: string) => {
    const target = personnelChanges.find(c => c.id === changeId);
    if (!target) return;

    const decNumber = target.decisionNumber || `QD-${String(Math.floor(Math.random() * 900) + 100)}/2026/QD-AV`;
    const updated = personnelChanges.map(c => {
      if (c.id === changeId) {
        return {
          ...c,
          status: 'DECISION_ISSUED' as PersonnelChangeStatus,
          decisionNumber: decNumber,
          decisionDate: new Date().toISOString().split('T')[0],
          signerName: 'Nguyễn Văn Hùng',
          signerTitle: 'Tổng Giám Đốc'
        };
      }
      return c;
    });
    onUpdatePersonnelChanges(updated);
    const refreshed = updated.find(c => c.id === changeId) || null;
    if (selectedChange?.id === changeId) {
      setSelectedChange(refreshed);
    }
    setDecisionPreviewChange(refreshed);
    setShowDecisionModal(true);
  };

  // 5. ÁP DỤNG VÀO HỆ THỐNG: CẬP NHẬT HỒ SƠ & LIÊN KẾT TIỀN LƯƠNG
  const handleApplyToSystem = (changeId: string) => {
    const target = personnelChanges.find(c => c.id === changeId);
    if (!target) return;

    // Cập nhật bảng nhân viên
    const updatedEmployees = employees.map(emp => {
      if (emp.id === target.employeeId) {
        return {
          ...emp,
          baseSalary: target.proposedData.baseSalary ?? emp.baseSalary,
          positionSalary: target.proposedData.positionSalary ?? emp.positionSalary,
          lunchAllowance: target.proposedData.lunchAllowance ?? emp.lunchAllowance,
          transportAllowance: target.proposedData.transportAllowance ?? emp.transportAllowance,
          phoneAllowance: target.proposedData.phoneAllowance ?? emp.phoneAllowance,
          toxicTier: target.proposedData.toxicTier ?? emp.toxicTier,
          position: target.proposedData.position ?? emp.position,
          departmentName: target.proposedData.departmentName ?? emp.departmentName,
          branchName: target.proposedData.branchName ?? emp.branchName,
          status: target.proposedData.status ?? emp.status
        };
      }
      return emp;
    });
    onUpdateEmployees(updatedEmployees);

    // Cập nhật trạng thái biến động thành APPLIED
    const updatedChanges = personnelChanges.map(c => {
      if (c.id === changeId) {
        return {
          ...c,
          status: 'APPLIED' as PersonnelChangeStatus,
          isAppliedToPayroll: true,
          isAppliedToProfile: true,
          appliedDate: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });
    onUpdatePersonnelChanges(updatedChanges);
    if (selectedChange?.id === changeId) {
      setSelectedChange(updatedChanges.find(c => c.id === changeId) || null);
    }

    alert(`THÀNH CÔNG!
Đã áp dụng Quyết định ${target.decisionNumber || target.code}:
1. Cập nhật trực tiếp vào Hồ Sơ Nhân Viên ${target.employeeName} (${target.employeeCode}).
2. Liên kết tự động sang Bảng Lương kể từ ngày hiệu lực ${target.effectiveDate}.
3. Lưu trữ vào Sổ theo dõi biến động nhân sự doanh nghiệp.`);
  };

  // 6. PHÁT HÀNH THÔNG BÁO CHO NHÂN SỰ BẰNG TAY (KIỂM SOÁT THỦ CÔNG AN TOÀN)
  const handleNotifyEmployee = (changeId: string) => {
    const target = personnelChanges.find(c => c.id === changeId);
    if (!target) return;

    if (!window.confirm(`XÁC NHẬN PHÁT HÀNH THÔNG BÁO THỦ CÔNG:\n\nBạn có chắc chắn muốn phát hành quyết định và gửi thông báo (Email & Cổng ESS) đến nhân viên "${target.employeeName}" không?\n\n(Lưu ý bảo mật: Thao tác này được duyệt bằng tay để đảm bảo Ban Giám Đốc không còn điều chỉnh số liệu lương phút chót).`)) {
      return;
    }

    const nowStr = new Date().toLocaleString('vi-VN');
    const updatedChanges = personnelChanges.map(c => {
      if (c.id === changeId) {
        return {
          ...c,
          isNotifiedToEmployee: true,
          notifiedDate: nowStr,
          notifiedBy: currentRole === 'GENERAL_DIRECTOR' ? 'Tổng Giám Đốc' : 'Trưởng Phòng Nhân Sự'
        };
      }
      return c;
    });

    onUpdatePersonnelChanges(updatedChanges);
    if (selectedChange?.id === changeId) {
      setSelectedChange(updatedChanges.find(c => c.id === changeId) || null);
    }

    alert(`ĐÃ PHÁT HÀNH THÀNH CÔNG!\n\nThông báo và file Quyết định đã được gửi đến nhân viên "${target.employeeName}" qua Email và Cổng nhân sự cá nhân.`);
  };

  // Xuất Excel Sổ theo dõi biến động nhân sự
  const handleExportExcel = () => {
    const data = filteredChanges.map(item => ({
      'Mã Biến Động': item.code,
      'Mã Nhân Viên': item.employeeCode,
      'Họ Và Tên': item.employeeName,
      'Phòng Ban Hiện Tại': item.departmentName,
      'Chức Danh Hiện Tại': item.currentPosition,
      'Loại Biến Động': CHANGE_TYPE_LABELS[item.type]?.label || item.type,
      'Tiêu Đề / Nội Dung': item.title,
      'Lý Do': item.reason,
      'Lương CB Cũ': item.previousData.baseSalary || 0,
      'Lương CB Mới': item.proposedData.baseSalary || 0,
      'Chức Vụ Mới': item.proposedData.position || item.currentPosition,
      'Phòng Ban Mới': item.proposedData.departmentName || item.departmentName,
      'Ngày Hiệu Lực': item.effectiveDate,
      'Trạng Thái': STATUS_LABELS[item.status]?.label || item.status,
      'Người Đề Xuất': item.proposedBy,
      'Ngày Đề Xuất': item.proposedDate,
      'HR Thẩm Định': item.hrReviewedBy || '',
      'Ban Giám Đốc Duyệt': item.approvedBy || '',
      'Số Quyết Định': item.decisionNumber || '',
      'Ngày Ký QĐ': item.decisionDate || '',
      'Đã Áp Dụng Lương': item.isAppliedToPayroll ? 'ĐÃ ÁP DỤNG' : 'CHƯA'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'So_Bien_Dong_Nhan_Su');
    XLSX.writeFile(wb, `So_Theo_Doi_Bien_Dong_Nhan_Su_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* HEADER & THỐNG KÊ NHANH */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Thủ Tục & Biến Động Nhân Sự</h2>
                <p className="text-xs text-slate-500">
                  Quy trình 5 bước: Đề xuất &rarr; HR rà soát &rarr; Duyệt trực tuyến &rarr; Ban hành Quyết định &rarr; Áp dụng Tiền lương & Hồ sơ
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất Sổ Biến Động (Excel)</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Lập Đề Xuất Biến Động Mới</span>
            </button>
          </div>
        </div>

        {/* 5 THẺ CHỈ SỐ THEO TIẾN TRÌNH */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Tổng Biến Động</span>
            <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{stats.total}</p>
            <span className="text-[10px] text-slate-400">Toàn bộ hồ sơ phát sinh</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase">Chờ HR Thẩm Định</span>
            <p className="text-xl font-black text-amber-600 font-mono mt-0.5">{stats.pendingHr}</p>
            <span className="text-[10px] text-amber-700">Kiểm tra định biên & quỹ lương</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-[11px] font-bold text-blue-800 uppercase">Chờ Giám Đốc Duyệt</span>
            <p className="text-xl font-black text-blue-600 font-mono mt-0.5">{stats.pendingApproval}</p>
            <span className="text-[10px] text-blue-700">Cần phê duyệt trực tuyến</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
            <span className="text-[11px] font-bold text-purple-800 uppercase">Đã Ra Quyết Định</span>
            <p className="text-xl font-black text-purple-600 font-mono mt-0.5">{stats.decisionIssued}</p>
            <span className="text-[10px] text-purple-700">Sẵn sàng áp dụng sang lương</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase">Đã Áp Dụng Hệ Thống</span>
            <p className="text-xl font-black text-emerald-600 font-mono mt-0.5">{stats.applied}</p>
            <span className="text-[10px] text-emerald-700">Cập nhật hồ sơ & lương hoàn tất</span>
          </div>
        </div>
      </div>

      {/* BỘ LỌC & BẢNG THEO DÕI BIẾN ĐỘNG */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã phiếu, tên nhân sự..."
                className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả loại biến động</option>
              <option value="SALARY_ADJUSTMENT">Điều chỉnh Lương & Phụ cấp</option>
              <option value="PROMOTION_APPOINTMENT">Bổ nhiệm / Đổi Chức danh</option>
              <option value="DEPARTMENT_TRANSFER">Điều chuyển Phòng ban</option>
              <option value="WORKPLACE_RELOCATION">Thay đổi Địa điểm làm việc</option>
              <option value="BENEFITS_SHIFT_CHANGE">Thay đổi Chế độ / Ca kíp</option>
              <option value="OFFICIAL_CONVERSION">Chuyển chính thức sau thử việc</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PROPOSED">Chờ HR Thẩm định</option>
              <option value="HR_REVIEWED">Chờ Giám Đốc duyệt</option>
              <option value="APPROVED">Đã duyệt (Chờ ra QĐ)</option>
              <option value="DECISION_ISSUED">Đã ban hành Quyết định</option>
              <option value="APPLIED">Đã áp dụng vào hệ thống</option>
              <option value="REJECTED">Từ chối</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Tất cả phòng ban</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Hiển thị <b>{filteredChanges.length}</b>/{personnelChanges.length} biến động
          </span>
        </div>

        {/* BẢNG THEO DÕI */}
        {filteredChanges.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            Không tìm thấy bản ghi biến động nhân sự nào phù hợp với điều kiện tìm kiếm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Mã Phiếu</th>
                  <th className="p-2.5">Nhân Sự</th>
                  <th className="p-2.5">Loại Biến Động</th>
                  <th className="p-2.5">Chi Tiết Thay Đổi (Cũ &rarr; Mới)</th>
                  <th className="p-2.5">Ngày Hiệu Lực</th>
                  <th className="p-2.5">Quyết Định</th>
                  <th className="p-2.5">Trạng Thái</th>
                  <th className="p-2.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChanges.map((item) => {
                  const typeInfo = CHANGE_TYPE_LABELS[item.type] || { label: item.type, color: 'bg-slate-100 text-slate-800' };
                  const statusInfo = STATUS_LABELS[item.status] || { label: item.status, badge: 'bg-slate-100 text-slate-700' };

                  // Tính chênh lệch lương nếu có
                  const oldBase = item.previousData.baseSalary || 0;
                  const newBase = item.proposedData.baseSalary || 0;
                  const diffBase = newBase - oldBase;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-mono font-bold text-indigo-600 whitespace-nowrap">
                        {item.code}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="block font-bold text-slate-900">{item.employeeName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.employeeCode} • {item.departmentName}</span>
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="p-2.5 max-w-xs">
                        <p className="text-[11.5px] font-semibold text-slate-800 leading-snug line-clamp-1">{item.title}</p>
                        <div className="text-[10.5px] text-slate-600 mt-0.5 space-y-0.5">
                          {diffBase !== 0 && (
                            <span className="block font-mono">
                              Lương CB: {oldBase.toLocaleString('vi-VN')}đ &rarr; <b className="text-emerald-700">{newBase.toLocaleString('vi-VN')}đ</b>
                              <span className="text-emerald-600 font-bold ml-1">
                                ({diffBase > 0 ? `+${diffBase.toLocaleString('vi-VN')}` : diffBase.toLocaleString('vi-VN')}đ)
                              </span>
                            </span>
                          )}
                          {item.proposedData.position && item.proposedData.position !== item.previousData.position && (
                            <span className="block text-indigo-700">
                              Chức vụ: {item.previousData.position} &rarr; <b>{item.proposedData.position}</b>
                            </span>
                          )}
                          {item.proposedData.branchName && item.proposedData.branchName !== item.previousData.branchName && (
                            <span className="block text-amber-800">
                              Nơi làm việc: {item.previousData.branchName} &rarr; <b>{item.proposedData.branchName}</b>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-slate-700 whitespace-nowrap">
                        {item.effectiveDate}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        {item.decisionNumber ? (
                          <button
                            onClick={() => {
                              setDecisionPreviewChange(item);
                              setShowDecisionModal(true);
                            }}
                            className="font-mono text-indigo-600 font-bold hover:underline flex items-center space-x-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{item.decisionNumber}</span>
                          </button>
                        ) : (
                          <span className="text-[10.5px] text-slate-400 italic">Chưa ban hành</span>
                        )}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setSelectedChange(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Xem Quy Trình &rarr;
                        </button>

                        {/* Nút tác vụ nhanh */}
                        {item.status === 'DECISION_ISSUED' && (
                          <button
                            onClick={() => handleApplyToSystem(item.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-xs"
                          >
                            Áp Dụng Vào Lương
                          </button>
                        )}

                        {/* Kiểm soát phát hành thông báo thủ công */}
                        {(item.status === 'DECISION_ISSUED' || item.status === 'APPLIED') && (
                          !item.isNotifiedToEmployee ? (
                            <button
                              onClick={() => handleNotifyEmployee(item.id)}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition-colors shadow-xs"
                              title="Duyệt bằng tay phát hành thông báo đến nhân sự (Tránh rủi ro phát hành tự động)"
                            >
                              Phát Hành NV
                            </button>
                          ) : (
                            <span 
                              className="inline-block px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-[10px] font-bold"
                              title={`Đã phát hành lúc ${item.notifiedDate} bởi ${item.notifiedBy || 'Hệ thống'}`}
                            >
                              ✓ Đã báo NV
                            </span>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: LẬP ĐỀ XUẤT BIẾN ĐỘNG MỚI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-indigo-600 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCog className="w-5 h-5" />
                <h3 className="font-bold text-sm">Lập Đề Xuất Biến Động Nhân Sự Mới</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Bước chọn nhân sự */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Chọn Nhân Viên Cần Thực Hiện Biến Động <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => handleSelectEmployeeForForm(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Bấm để chọn nhân viên trong công ty --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.code} - {emp.fullName} ({emp.departmentName} • {emp.position})
                    </option>
                  ))}
                </select>
              </div>

              {/* Loại biến động & Ngày hiệu lực */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. Loại Biến Động <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PersonnelChangeType)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SALARY_ADJUSTMENT">Điều chỉnh Lương & Phụ cấp</option>
                    <option value="PROMOTION_APPOINTMENT">Bổ nhiệm / Đổi Chức danh</option>
                    <option value="DEPARTMENT_TRANSFER">Điều chuyển Phòng ban / Phân xưởng</option>
                    <option value="WORKPLACE_RELOCATION">Thay đổi Địa điểm / Nơi làm việc</option>
                    <option value="BENEFITS_SHIFT_CHANGE">Thay đổi Chế độ đãi ngộ / Ca làm việc</option>
                    <option value="OFFICIAL_CONVERSION">Tiếp nhận chính thức sau thử việc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Ngày Có Hiệu Lực Áp Dụng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formEffectiveDate}
                    onChange={(e) => setFormEffectiveDate(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Tiêu đề & Lý do */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Tiêu Đề Đề Xuất <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Vd: Đề xuất tăng lương và bổ nhiệm Phó quản đốc phân xưởng..."
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  5. Lý Do Biến Động & Căn Cứ Đề Xuất <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Vd: Hoàn thành xuất sắc KPI 6 tháng, đạt chứng chỉ chuyên môn, nhu cầu mở rộng chuyền sản xuất..."
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* BẢNG SO SÁNH THÔNG TIN CŨ VS ĐỀ XUẤT MỚI */}
              {selectedEmployeeObj && (
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center justify-between">
                    <span>6. Thông Số Cụ Thể (Cũ vs Đề Xuất Mới)</span>
                    <span className="text-[11px] font-normal text-indigo-600 font-mono">{selectedEmployeeObj.code}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Lương Cơ Bản */}
                    <div>
                      <span className="block text-slate-500 mb-0.5">Lương Cơ Bản Đóng BHXH:</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-mono">
                          {selectedEmployeeObj.baseSalary.toLocaleString('vi-VN')}đ
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <FormattedNumberInput
                          value={formProposedData.baseSalary ?? selectedEmployeeObj.baseSalary}
                          onChange={(val) => setFormProposedData({ ...formProposedData, baseSalary: val })}
                          className="flex-1 p-1 bg-white border border-indigo-300 rounded font-mono text-xs font-bold text-indigo-700"
                        />
                      </div>
                    </div>

                    {/* Lương Chức Danh */}
                    <div>
                      <span className="block text-slate-500 mb-0.5">Lương Chức Danh / Hiệu Quả:</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-mono">
                          {selectedEmployeeObj.positionSalary.toLocaleString('vi-VN')}đ
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <FormattedNumberInput
                          value={formProposedData.positionSalary ?? selectedEmployeeObj.positionSalary}
                          onChange={(val) => setFormProposedData({ ...formProposedData, positionSalary: val })}
                          className="flex-1 p-1 bg-white border border-indigo-300 rounded font-mono text-xs font-bold text-indigo-700"
                        />
                      </div>
                    </div>

                    {/* Chức Vụ / Vị Trí */}
                    <div>
                      <span className="block text-slate-500 mb-0.5">Chức Danh / Vị Trí:</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs truncate max-w-[120px]">
                          {selectedEmployeeObj.position}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={formProposedData.position ?? selectedEmployeeObj.position}
                          onChange={(e) => setFormProposedData({ ...formProposedData, position: e.target.value })}
                          className="flex-1 p-1 bg-white border border-indigo-300 rounded text-xs font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Phòng Ban */}
                    <div>
                      <span className="block text-slate-500 mb-0.5">Phòng Ban / Phân Xưởng:</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs truncate max-w-[120px]">
                          {selectedEmployeeObj.departmentName}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={formProposedData.departmentName ?? selectedEmployeeObj.departmentName}
                          onChange={(e) => setFormProposedData({ ...formProposedData, departmentName: e.target.value })}
                          className="flex-1 p-1 bg-white border border-indigo-300 rounded text-xs font-medium text-slate-800"
                        >
                          {departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Nơi Làm Việc */}
                    <div>
                      <span className="block text-slate-500 mb-0.5">Nơi Làm Việc / Chi Nhánh:</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs truncate max-w-[120px]">
                          {selectedEmployeeObj.branchName}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={formProposedData.branchName ?? selectedEmployeeObj.branchName}
                          onChange={(e) => setFormProposedData({ ...formProposedData, branchName: e.target.value })}
                          className="flex-1 p-1 bg-white border border-indigo-300 rounded text-xs font-medium text-slate-800"
                        >
                          <option value="VP Điều Hành TP.HCM">VP Điều Hành TP.HCM</option>
                          <option value="Nhà Máy Bình Dương">Nhà Máy Bình Dương</option>
                          <option value="Nhà Máy Long An">Nhà Máy Long An</option>
                        </select>
                      </div>
                    </div>

                    {/* Mức Độc Hại */}
                    <div>
                      <span className="block text-slate-500 mb-0.5">Mức Phụ Cấp Độc Hại:</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs">
                          Mức {selectedEmployeeObj.toxicTier}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={formProposedData.toxicTier ?? selectedEmployeeObj.toxicTier}
                          onChange={(e) => setFormProposedData({ ...formProposedData, toxicTier: Number(e.target.value) as any })}
                          className="flex-1 p-1 bg-white border border-indigo-300 rounded text-xs font-medium text-slate-800"
                        >
                          <option value={0}>Mức 0 (Không độc hại)</option>
                          <option value={1}>Mức 1 (13.000 đ/ngày)</option>
                          <option value={2}>Mức 2 (20.000 đ/ngày)</option>
                          <option value={3}>Mức 3 (26.000 đ/ngày)</option>
                          <option value={4}>Mức 4 (32.000 đ/ngày)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs"
                >
                  Gửi Đề Xuất Lên Phòng HCNS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: XEM CHI TIẾT & TIẾN TRÌNH 5 BƯỚC */}
      {selectedChange && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSignature className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm">Hồ Sơ Biến Động Nhân Sự: {selectedChange.code}</h3>
                  <p className="text-[11px] text-slate-400">{selectedChange.title}</p>
                </div>
              </div>
              <button onClick={() => setSelectedChange(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* TIMELINE 5 BƯỚC */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Tiến Trình Xử Lý 5 Bước Khép Kín</h4>
                <div className="grid grid-cols-5 gap-2 text-center relative">
                  {/* Bước 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-600 text-white shadow-xs">
                      ✓
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 mt-1">1. Đề Xuất</span>
                    <span className="text-[9.5px] text-slate-500">{selectedChange.proposedDate}</span>
                  </div>

                  {/* Bước 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedChange.status !== 'PROPOSED' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    }`}>
                      {selectedChange.status !== 'PROPOSED' ? '✓' : '2'}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 mt-1">2. HR Rà Soát</span>
                    <span className="text-[9.5px] text-slate-500">{selectedChange.hrReviewedDate || 'Đang chờ'}</span>
                  </div>

                  {/* Bước 3 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedChange.status === 'APPROVED' || selectedChange.status === 'DECISION_ISSUED' || selectedChange.status === 'APPLIED'
                        ? 'bg-emerald-600 text-white'
                        : selectedChange.status === 'HR_REVIEWED'
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {selectedChange.status === 'APPROVED' || selectedChange.status === 'DECISION_ISSUED' || selectedChange.status === 'APPLIED' ? '✓' : '3'}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 mt-1">3. Giám Đốc Duyệt</span>
                    <span className="text-[9.5px] text-slate-500">{selectedChange.approvedDate || 'Chưa duyệt'}</span>
                  </div>

                  {/* Bước 4 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedChange.status === 'DECISION_ISSUED' || selectedChange.status === 'APPLIED'
                        ? 'bg-emerald-600 text-white'
                        : selectedChange.status === 'APPROVED'
                        ? 'bg-purple-600 text-white ring-4 ring-purple-100 animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {selectedChange.status === 'DECISION_ISSUED' || selectedChange.status === 'APPLIED' ? '✓' : '4'}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 mt-1">4. Ra Quyết Định</span>
                    <span className="text-[9.5px] text-slate-500">{selectedChange.decisionDate || 'Chưa ban hành'}</span>
                  </div>

                  {/* Bước 5 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedChange.status === 'APPLIED'
                        ? 'bg-emerald-600 text-white'
                        : selectedChange.status === 'DECISION_ISSUED'
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {selectedChange.status === 'APPLIED' ? '✓' : '5'}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 mt-1">5. Áp Dụng Lương</span>
                    <span className="text-[9.5px] text-slate-500">{selectedChange.appliedDate || 'Chờ áp dụng'}</span>
                  </div>
                </div>
              </div>

              {/* BẢNG THÔNG TIN SO SÁNH */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-700 uppercase border-b border-slate-200 pb-1">Dữ Liệu Hiện Tại (Cũ)</h5>
                  <div>
                    <span className="text-slate-500">Nhân viên:</span> <b>{selectedChange.employeeName}</b> ({selectedChange.employeeCode})
                  </div>
                  <div>
                    <span className="text-slate-500">Phòng ban:</span> <b>{selectedChange.previousData.departmentName}</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Chức vụ:</span> <b>{selectedChange.previousData.position}</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Nơi làm việc:</span> <b>{selectedChange.previousData.branchName}</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Lương cơ bản:</span> <b className="font-mono">{(selectedChange.previousData.baseSalary || 0).toLocaleString('vi-VN')}đ</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Lương chức danh:</span> <b className="font-mono">{(selectedChange.previousData.positionSalary || 0).toLocaleString('vi-VN')}đ</b>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2 text-xs">
                  <h5 className="font-bold text-indigo-900 uppercase border-b border-indigo-200 pb-1">Dữ Liệu Đề Xuất / Được Duyệt (Mới)</h5>
                  <div>
                    <span className="text-slate-500">Ngày hiệu lực:</span> <b className="font-mono text-indigo-700">{selectedChange.effectiveDate}</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Phòng ban mới:</span> <b className="text-indigo-900">{selectedChange.proposedData.departmentName}</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Chức vụ mới:</span> <b className="text-indigo-900">{selectedChange.proposedData.position}</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Nơi làm việc mới:</span> <b className="text-indigo-900">{selectedChange.proposedData.branchName}</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Lương cơ bản mới:</span> <b className="font-mono text-emerald-700 font-bold">{(selectedChange.proposedData.baseSalary || 0).toLocaleString('vi-VN')}đ</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Lương chức danh mới:</span> <b className="font-mono text-emerald-700 font-bold">{(selectedChange.proposedData.positionSalary || 0).toLocaleString('vi-VN')}đ</b>
                  </div>
                </div>
              </div>

              {/* LÝ DO & GHI CHÚ */}
              <div className="text-xs space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div><span className="font-bold text-slate-700">Lý do biến động:</span> {selectedChange.reason}</div>
                {selectedChange.hrNotes && <div><span className="font-bold text-blue-700">Ý kiến thẩm định HR:</span> {selectedChange.hrNotes} ({selectedChange.hrReviewedBy})</div>}
                {selectedChange.approvalNotes && <div><span className="font-bold text-emerald-700">Ý kiến Ban Giám Đốc:</span> {selectedChange.approvalNotes} ({selectedChange.approvedBy})</div>}
                {selectedChange.decisionNumber && <div><span className="font-bold text-purple-700">Quyết định ban hành:</span> Số <b>{selectedChange.decisionNumber}</b> ký ngày {selectedChange.decisionDate} bởi {selectedChange.signerName} ({selectedChange.signerTitle})</div>}
              </div>

              {/* KHỐI HÀNH ĐỘNG THEO TỪNG VAI TRÒ */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedChange(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Đóng
                </button>

                <div className="flex items-center space-x-2">
                  {/* Hành động bước 2: HR Thẩm định */}
                  {selectedChange.status === 'PROPOSED' && (
                    <button
                      onClick={() => handleHrReview(selectedChange.id, 'Đã thẩm định: Thỏa mãn định biên nhân sự và quỹ lương năm 2026.')}
                      className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-xs"
                    >
                      HR Thẩm Định & Trình Lên Ban Giám Đốc &rarr;
                    </button>
                  )}

                  {/* Hành động bước 3: Giám đốc duyệt */}
                  {selectedChange.status === 'HR_REVIEWED' && (
                    <>
                      <button
                        onClick={() => handleReject(selectedChange.id, 'Chưa phê duyệt trong kỳ này.')}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100"
                      >
                        Từ Chối
                      </button>
                      <button
                        onClick={() => handleApprove(selectedChange.id, 'Đồng ý phê duyệt ban hành quyết định.')}
                        className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs"
                      >
                        Tổng Giám Đốc Phê Duyệt &rarr;
                      </button>
                    </>
                  )}

                  {/* Hành động bước 4: Ban hành quyết định */}
                  {selectedChange.status === 'APPROVED' && (
                    <button
                      onClick={() => handleIssueDecision(selectedChange.id)}
                      className="px-3.5 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 shadow-xs flex items-center space-x-1.5"
                    >
                      <FileSignature className="w-3.5 h-3.5" />
                      <span>Ban Hành Quyết Định Chính Thức</span>
                    </button>
                  )}

                  {/* Hành động bước 5: Áp dụng vào hệ thống */}
                  {selectedChange.status === 'DECISION_ISSUED' && (
                    <button
                      onClick={() => handleApplyToSystem(selectedChange.id)}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center space-x-1.5 animate-pulse"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Áp Dụng Vào Tiền Lương & Hồ Sơ Nhân Viên</span>
                    </button>
                  )}

                  {/* Đã áp dụng */}
                  {selectedChange.status === 'APPLIED' && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Đã Áp Dụng Hoàn Tất Vào Hệ Thống</span>
                    </span>
                  )}

                  {/* Kiểm soát thủ công phát hành thông báo đến nhân sự */}
                  {(selectedChange.status === 'DECISION_ISSUED' || selectedChange.status === 'APPLIED') && (
                    !selectedChange.isNotifiedToEmployee ? (
                      <button
                        onClick={() => handleNotifyEmployee(selectedChange.id)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                        title="Duyệt bằng tay phát hành thông báo chính thức đến nhân sự sau khi Ban Giám Đốc đã rà soát chắc chắn 100%"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Duyệt & Phát Hành Thông Báo Đến Nhân Sự (Email/ESS)</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        <span>Đã phát hành thông báo cho NV ({selectedChange.notifiedDate})</span>
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM & IN VĂN BẢN QUYẾT ĐỊNH (CHUẨN DOANH NGHIỆP) */}
      {showDecisionModal && decisionPreviewChange && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between no-print">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs uppercase">Văn Bản Quyết Định Ban Hành Chính Thức</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Quyết Định</span>
                </button>
                <button onClick={() => setShowDecisionModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* NỘI DUNG VĂN BẢN QUYẾT ĐỊNH */}
            <div className="p-8 space-y-5 text-slate-900 bg-white font-serif max-h-[80vh] overflow-y-auto print:p-0 print:m-0 print:overflow-visible">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4 text-xs font-sans">
                <div>
                  <p className="font-bold text-slate-800 uppercase">{policy.companyName || 'CÔNG TY CỔ PHẦN AN VIỆT MANUFACTURING'}</p>
                  <p className="text-[11px] text-slate-500">Mã số thuế: {policy.taxCode || '0315896245'}</p>
                  <p className="text-[11px] text-slate-500">Số: <b>{decisionPreviewChange.decisionNumber || 'QD-088/2026/QD-AV'}</b></p>
                </div>
                <div className="text-center">
                  <p className="font-bold uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="text-[11px] font-bold">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="text-[10px] text-slate-500 italic mt-1">TP. Hồ Chí Minh, ngày {decisionPreviewChange.decisionDate?.split('-')[2] || '25'} tháng {decisionPreviewChange.decisionDate?.split('-')[1] || '08'} năm {decisionPreviewChange.decisionDate?.split('-')[0] || '2026'}</p>
                </div>
              </div>

              <div className="text-center space-y-1 pt-2">
                <h2 className="text-base font-bold uppercase tracking-wide">QUYẾT ĐỊNH</h2>
                <p className="text-xs font-bold italic">
                  V/v: {decisionPreviewChange.title}
                </p>
                <p className="text-xs font-bold uppercase pt-1">TỔNG GIÁM ĐỐC CÔNG TY</p>
              </div>

              <div className="text-xs space-y-1.5 leading-relaxed font-sans text-slate-700 italic">
                <p>- Căn cứ Bộ luật Lao động số 45/2019/QH14 ngày 20 tháng 11 năm 2019;</p>
                <p>- Căn cứ Điều lệ tổ chức và hoạt động của Công ty;</p>
                <p>- Căn cứ Hợp đồng lao động đã giao kết giữa Công ty và Ông/Bà <b>{decisionPreviewChange.employeeName}</b>;</p>
                <p>- Xét đề xuất tại Tờ trình số {decisionPreviewChange.code} của Trưởng Phòng Hành Chính Nhân Sự.</p>
              </div>

              <div className="space-y-3 text-xs leading-relaxed font-sans">
                <p className="font-bold uppercase text-center text-indigo-900">QUYẾT ĐỊNH:</p>

                <p>
                  <b>Điều 1:</b> Thực hiện {CHANGE_TYPE_LABELS[decisionPreviewChange.type]?.label.toLowerCase()} đối với Ông/Bà:
                  <br />
                  - Họ và tên: <b>{decisionPreviewChange.employeeName}</b> &nbsp;&nbsp;&nbsp;&nbsp; Mã nhân viên: <b>{decisionPreviewChange.employeeCode}</b>
                  <br />
                  - Chức danh công việc mới: <b>{decisionPreviewChange.proposedData.position || decisionPreviewChange.currentPosition}</b>
                  <br />
                  - Đơn vị công tác mới: <b>{decisionPreviewChange.proposedData.departmentName || decisionPreviewChange.departmentName}</b> ({decisionPreviewChange.proposedData.branchName || 'VP Điều Hành TP.HCM'})
                  <br />
                  - Mức lương cơ bản mới: <b>{(decisionPreviewChange.proposedData.baseSalary || 0).toLocaleString('vi-VN')} VNĐ/tháng</b>
                  <br />
                  - Mức lương chức danh mới: <b>{(decisionPreviewChange.proposedData.positionSalary || 0).toLocaleString('vi-VN')} VNĐ/tháng</b>
                </p>

                <p>
                  <b>Điều 2:</b> Quyết định này có hiệu lực thi hành kể từ ngày <b>{decisionPreviewChange.effectiveDate}</b>. Các điều khoản khác trong Hợp đồng lao động không đề cập trong Quyết định này vẫn giữ nguyên giá trị pháp lý.
                </p>

                <p>
                  <b>Điều 3:</b> Phòng Hành chính Nhân sự, Phòng Kế toán - Tài chính, Trưởng bộ phận quản lý trực tiếp và Ông/Bà <b>{decisionPreviewChange.employeeName}</b> chịu trách nhiệm thi hành Quyết định này.
                </p>
              </div>

              <div className="flex justify-between items-start pt-6 border-t border-slate-200 text-xs font-sans">
                <div className="text-[10px] text-slate-500">
                  <p className="font-bold uppercase">Nơi nhận:</p>
                  <p>- Như Điều 3;</p>
                  <p>- Lưu: VT, HCNS, Hồ sơ lương.</p>
                </div>

                <div className="text-center font-sans">
                  <p className="font-bold uppercase">TỔNG GIÁM ĐỐC</p>
                  <p className="text-[10px] text-slate-400 italic mb-10">(Ký, đóng dấu và ghi rõ họ tên)</p>
                  <p className="font-bold text-indigo-900 text-sm">{decisionPreviewChange.signerName || 'Nguyễn Văn Hùng'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
