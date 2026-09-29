import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, Employee } from '../types/hrm';
import { 
  InternalMessage, 
  internalMessagingService 
} from '../services/internalMessagingService';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Pin, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  X, 
  Users, 
  User, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Unlock,
  Building,
  Filter,
  Search,
  CheckCheck,
  Check,
  ChevronDown,
  UserCheck,
  Star,
  Edit3,
  RotateCcw,
  Archive,
  Eye,
  CornerDownRight
} from 'lucide-react';

interface InternalMessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  employees: Employee[];
  companyName: string;
}

export const InternalMessengerModal: React.FC<InternalMessengerModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  employees,
  companyName
}) => {
  const [activeTab, setActiveTab] = useState<'DIRECT' | 'BROADCAST' | 'REMINDERS'>('DIRECT');
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  
  // LỌC THEO TRẠNG THÁI: ALL | STARRED | ACTIVE | RESOLVED
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'STARRED' | 'ACTIVE' | 'RESOLVED'>('ALL');

  // POKA-YOKE: Mặc định TRỐNG 100%, không bao giờ chọn sẵn bất kỳ nhóm hay cá nhân nào
  const [recipientMode, setRecipientMode] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [empSearchQuery, setEmpSearchQuery] = useState<string>('');
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Nhóm nhận tin: MẶC ĐỊNH ĐỂ TRỐNG
  const [groupTarget, setGroupTarget] = useState<string>('');
  const [groupDeptName, setGroupDeptName] = useState<string>('Khối Sản Xuất Nhà Máy');

  const [messageInput, setMessageInput] = useState<string>('');
  const [isReminderFlag, setIsReminderFlag] = useState<boolean>(false);
  const [reminderDueDate, setReminderDueDate] = useState<string>('');
  const [priority, setPriority] = useState<InternalMessage['priority']>('NORMAL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Trạng thái Chỉnh sửa tin nhắn (Inline Editing)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  // Form phát tin quản trị (Broadcast)
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'FACTORY' | 'OFFICE' | 'DEPARTMENT' | ''>('');
  const [broadcastDept, setBroadcastDept] = useState<string>('Khối Sản Xuất Nhà Máy');
  const [broadcastContent, setBroadcastContent] = useState<string>('');
  const [broadcastPriority, setBroadcastPriority] = useState<InternalMessage['priority']>('URGENT');

  // POPUP CẢNH BÁO XÁC NHẬN LẦN 2 (DOUBLE CONFIRMATION MODAL)
  const [showDoubleConfirmModal, setShowDoubleConfirmModal] = useState<boolean>(false);
  const [pendingConfirmInfo, setPendingConfirmInfo] = useState<{
    targetName: string;
    recipientType: 'ALL' | 'DEPARTMENT';
    recipientId: string;
    content: string;
    isReminder: boolean;
    reminderDueDate?: string;
    priority: InternalMessage['priority'];
  } | null>(null);

  // Load tin nhắn từ service
  const loadMessages = () => {
    const list = internalMessagingService.getMessages();
    setMessages(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  // Đóng dropdown tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEmpDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Kiểm tra quyền hạn
  const isAdminOrCEO = currentRole === 'GENERAL_DIRECTOR';
  const isHR = currentRole === 'HR_MANAGER' || currentRole === 'PAYROLL_SPECIALIST' || currentRole === 'HR_ADMIN_HSE';

  // Lọc danh sách nhắc việc
  const remindersList = useMemo(() => {
    return messages.filter(m => m.isReminder);
  }, [messages]);

  // Lọc danh sách nhân viên tìm kiếm
  const filteredEmployeesList = useMemo(() => {
    if (!empSearchQuery.trim()) return employees.slice(0, 30);
    const q = empSearchQuery.toLowerCase().trim();
    return employees.filter(e => 
      e.fullName.toLowerCase().includes(q) ||
      (e.code && e.code.toLowerCase().includes(q)) ||
      (e.phone && e.phone.includes(q)) ||
      (e.departmentName && e.departmentName.toLowerCase().includes(q)) ||
      (e.position && e.position.toLowerCase().includes(q))
    ).slice(0, 50);
  }, [employees, empSearchQuery]);

  // Danh sách các phòng ban thực tế trong công ty
  const departmentList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.departmentName) set.add(e.departmentName);
    });
    const arr = Array.from(set).filter(Boolean);
    if (arr.length === 0) {
      return ['Khối Sản Xuất Nhà Máy', 'Phòng Kế Toán', 'Phòng Nhân Sự', 'Khối Kinh Doanh', 'Kho Vận & Cung Ứng'];
    }
    return arr;
  }, [employees]);

  // Danh sách hội thoại lọc theo từ khóa & bộ lọc trạng thái (Starred / Active / Resolved)
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      // Bộ lọc theo Trạng thái (Status Filter)
      if (statusFilter === 'STARRED' && !m.isStarred) return false;
      if (statusFilter === 'ACTIVE' && m.status === 'RESOLVED') return false;
      if (statusFilter === 'RESOLVED' && m.status !== 'RESOLVED') return false;

      // Tìm kiếm từ khóa
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = 
          m.content.toLowerCase().includes(term) ||
          m.senderName.toLowerCase().includes(term) ||
          (m.recipientName && m.recipientName.toLowerCase().includes(term));
        if (!match) return false;
      }
      return true;
    });
  }, [messages, searchTerm, statusFilter]);

  // Đếm số tin nhắn có gắn sao
  const starredCount = useMemo(() => {
    return messages.filter(m => m.isStarred).length;
  }, [messages]);

  // ⭐ Bấm sao theo dõi
  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    internalMessagingService.toggleStar(id);
    loadMessages();
  };

  // ✓ Đóng hội thoại / Đã xong việc
  const handleToggleResolve = (id: string) => {
    const newStatus = internalMessagingService.toggleResolveStatus(id);
    loadMessages();
  };

  // ✏️ Bắt đầu chỉnh sửa tin nhắn
  const handleStartEdit = (msg: InternalMessage) => {
    setEditingMessageId(msg.id);
    setEditingContent(msg.content);
  };

  // 💾 Lưu chỉnh sửa
  const handleSaveEdit = (id: string) => {
    if (!editingContent.trim()) {
      alert('Nội dung không được để trống!');
      return;
    }
    const res = internalMessagingService.editMessage(id, editingContent);
    if (res.success) {
      setEditingMessageId(null);
      setEditingContent('');
      loadMessages();
    }
  };

  // 🚨 Thu hồi tin nhắn (Recall)
  const handleRecall = (msg: InternalMessage) => {
    const isBroadcast = msg.recipientType === 'ALL';
    const confirmText = isBroadcast
      ? `🚨 XÁC NHẬN THU HỒI PHÁT TIN TOÀN CÔNG TY:\nBạn có chắc chắn muốn thu hồi thông điệp này không?\n\nThông điệp sẽ bị GỠ BỎ TỨC THÌ khỏi màn hình của 100% nhân viên trong công ty!`
      : `↩️ Xác nhận thu hồi tin nhắn gửi đến ${msg.recipientName}?\nTin nhắn sẽ biến mất khỏi hộp thư của cả 2 bên.`;

    if (window.confirm(confirmText)) {
      const res = internalMessagingService.recallMessage(msg.id);
      alert(res.message);
      loadMessages();
    }
  };

  // 🗑️ Xóa thủ công
  const handleDeleteManual = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này khỏi hộp thư cá nhân?')) {
      internalMessagingService.deleteMessage(id);
      loadMessages();
    }
  };

  // Thực thi gửi tin nhắn
  const executeSendMessage = (payload: {
    recipientType: 'ALL' | 'DEPARTMENT' | 'INDIVIDUAL';
    recipientId: string;
    recipientName: string;
    content: string;
    isReminder: boolean;
    reminderDueDate?: string;
    priority: InternalMessage['priority'];
  }) => {
    const senderDisplay = isAdminOrCEO 
      ? 'TỔNG GIÁM ĐỐC (Admin)' 
      : isHR 
        ? 'Phòng Nhân Sự' 
        : 'Nhân Viên (' + currentRole + ')';

    internalMessagingService.sendMessage({
      senderId: currentRole,
      senderName: senderDisplay,
      senderRole: currentRole,
      recipientType: payload.recipientType,
      recipientId: payload.recipientId,
      recipientName: payload.recipientName,
      content: payload.content,
      isReminder: payload.isReminder,
      reminderDueDate: payload.reminderDueDate,
      reminderSetBy: currentRole,
      reminderSetByName: senderDisplay,
      reminderStatus: payload.isReminder ? 'PENDING' : undefined,
      priority: payload.priority,
    });

    setMessageInput('');
    setIsReminderFlag(false);
    setReminderDueDate('');
    setSelectedEmployee(null);
    setEmpSearchQuery('');
    setGroupTarget('');
    setShowDoubleConfirmModal(false);
    setPendingConfirmInfo(null);
    loadMessages();
  };

  // Khởi tạo quy trình gửi tin (Kiểm tra Poka-Yoke và chặn để xác nhận lần 2 nếu là nhóm)
  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) {
      alert('⚠️ Vui lòng nhập nội dung tin nhắn trước khi gửi!');
      return;
    }

    if (recipientMode === 'INDIVIDUAL') {
      if (!selectedEmployee) {
        alert('⚠️ NGUYÊN TẮC POKA-YOKE (CHỐNG GỬI NHẦM):\nBạn chưa chọn nhân sự nhận tin! Vui lòng gõ tên hoặc mã nhân viên để chọn người nhận cụ thể.');
        return;
      }

      executeSendMessage({
        recipientType: 'INDIVIDUAL',
        recipientId: selectedEmployee.code || selectedEmployee.id,
        recipientName: `${selectedEmployee.fullName} (${selectedEmployee.departmentName})`,
        content: messageInput,
        isReminder: isReminderFlag,
        reminderDueDate: isReminderFlag ? (reminderDueDate || 'Trong tuần này') : undefined,
        priority: isReminderFlag ? 'HIGH' : priority,
      });
      return;
    }

    if (!groupTarget) {
      alert('⚠️ NGUYÊN TẮC POKA-YOKE:\nBạn chưa chọn nhóm nhận tin! Vui lòng chọn phạm vi: Toàn công ty, Khối nhà máy, Khối văn phòng hoặc Phòng ban.');
      return;
    }

    let targetName = 'Toàn Thể Cán Bộ - Công Nhân Viên';
    let recipientType: 'ALL' | 'DEPARTMENT' = 'ALL';
    let targetId = 'ALL';

    if (groupTarget === 'ALL_COMPANY') {
      targetName = 'Toàn Thể Công Ty (100% Cán Bộ - Công Nhân Viên)';
      recipientType = 'ALL';
      targetId = 'ALL';
    } else if (groupTarget === 'FACTORY') {
      targetName = 'Toàn Bộ Khối Nhà Máy & Phân Xưởng Sản Xuất';
      recipientType = 'DEPARTMENT';
      targetId = 'FACTORY_ALL';
    } else if (groupTarget === 'OFFICE') {
      targetName = 'Toàn Bộ Khối Văn Phòng Trụ Sở';
      recipientType = 'DEPARTMENT';
      targetId = 'OFFICE_ALL';
    } else if (groupTarget === 'DEPT') {
      targetName = `Phòng Ban: ${groupDeptName}`;
      recipientType = 'DEPARTMENT';
      targetId = groupDeptName;
    }

    setPendingConfirmInfo({
      targetName,
      recipientType,
      recipientId: targetId,
      content: messageInput,
      isReminder: isReminderFlag,
      reminderDueDate: isReminderFlag ? (reminderDueDate || 'Trong tuần này') : undefined,
      priority: isReminderFlag ? 'HIGH' : priority,
    });
    setShowDoubleConfirmModal(true);
  };

  // Khởi tạo phát tin quản trị từ Tab 2
  const handleInitiateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim()) {
      alert('⚠️ Vui lòng nhập nội dung chỉ đạo điều hành!');
      return;
    }

    if (!broadcastTarget) {
      alert('⚠️ BẢO VỆ POKA-YOKE:\nBạn chưa chọn phạm vi phát tán thông điệp! Vui lòng chọn Toàn công ty, Khối nhà máy, Khối văn phòng hoặc Phòng ban.');
      return;
    }

    let targetType: InternalMessage['recipientType'] = 'ALL';
    let targetName = 'Toàn Thể Cán Bộ - Công Nhân Viên';
    let targetId = 'ALL';

    if (broadcastTarget === 'FACTORY') {
      targetType = 'DEPARTMENT';
      targetName = 'Toàn Bộ Khối Nhà Máy & Phân Xưởng Sản Xuất';
      targetId = 'FACTORY_ALL';
    } else if (broadcastTarget === 'OFFICE') {
      targetType = 'DEPARTMENT';
      targetName = 'Toàn Bộ Khối Văn Phòng Trụ Sở';
      targetId = 'OFFICE_ALL';
    } else if (broadcastTarget === 'DEPARTMENT') {
      targetType = 'DEPARTMENT';
      targetName = 'Phòng Ban: ' + broadcastDept;
      targetId = broadcastDept;
    }

    setPendingConfirmInfo({
      targetName,
      recipientType: targetType,
      recipientId: targetId,
      content: broadcastContent,
      isReminder: false,
      priority: broadcastPriority,
    });
    setShowDoubleConfirmModal(true);
  };

  // Xóa / Hoàn thành nhắc việc
  const handleDeleteOrComplete = (msgId: string) => {
    const success = internalMessagingService.completeReminder(msgId, currentRole, isAdminOrCEO);
    if (success) {
      loadMessages();
    } else {
      alert('⚠️ POKA-YOKE BẢO VỆ NHẮC VIỆC:\nBạn không phải là người cài đặt nhiệm vụ này nên không có quyền xóa! Chỉ người giao việc mới có thể xác nhận đã hoàn tất.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Hộp Tin Nhắn Doanh Nghiệp &amp; Sổ Nhắc Việc Thông Minh
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950 uppercase tracking-wide">
                  Tự Dọn Dẹp Sau 30 Ngày
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                ⭐ Bấm sao theo dõi • ✓ Đóng xong việc sớm • ✏️ Sửa tin &amp; 🚨 Thu hồi phát tán toàn công ty
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 pt-3 flex space-x-2">
          <button
            onClick={() => setActiveTab('DIRECT')}
            className={'px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center space-x-2 border-t border-x cursor-pointer ' + (
              activeTab === 'DIRECT'
                ? 'bg-white text-indigo-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-indigo-700 border-transparent hover:bg-slate-100'
            )}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tin Nhắn Trực Tiếp &amp; Nhóm ({messages.length})</span>
          </button>

          {(isAdminOrCEO || isHR) && (
            <button
              onClick={() => setActiveTab('BROADCAST')}
              className={'px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center space-x-2 border-t border-x cursor-pointer ' + (
                activeTab === 'BROADCAST'
                  ? 'bg-white text-rose-700 border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-rose-700 border-transparent hover:bg-slate-100'
              )}
            >
              <Radio className="w-3.5 h-3.5 text-rose-600" />
              <span>Phát Tin Chỉ Đạo (Toàn Công Ty / Nhóm)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('REMINDERS')}
            className={'px-4 py-2 text-xs font-bold rounded-t-xl transition-colors flex items-center space-x-2 border-t border-x cursor-pointer ' + (
              activeTab === 'REMINDERS'
                ? 'bg-white text-amber-700 border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-amber-700 border-transparent hover:bg-slate-100'
            )}
          >
            <Pin className="w-3.5 h-3.5 text-amber-500" />
            <span>Sổ Nhắc Việc Bất Tử ({remindersList.length})</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-amber-100 text-amber-800 font-bold">
              Không Xóa Sau 30 Ngày
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: TIN NHẮN TRỰC TIẾP & NHÓM */}
          {activeTab === 'DIRECT' && (
            <div className="space-y-4">
              
              {/* THANH CÔNG CỤ LỌC THÔNG MINH: ALL | STARRED | ACTIVE | RESOLVED */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="font-extrabold text-slate-700 mr-1 uppercase text-[10.5px]">Lọc hiển thị:</span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Tất Cả ({messages.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('STARRED')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                      statusFilter === 'STARRED' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>Đang Theo Dõi ({starredCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('ACTIVE')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    ⚡ Đang Xử Lý ({messages.filter(m => m.status !== 'RESOLVED').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('RESOLVED')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      statusFilter === 'RESOLVED' ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    ✓ Đã Xong Việc ({messages.filter(m => m.status === 'RESOLVED').length})
                  </button>
                </div>

                <div className="relative shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tin..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8 pr-2 py-1 bg-white border border-slate-300 rounded-lg text-xs outline-none w-36 sm:w-44"
                  />
                </div>
              </div>

              {/* Danh sách tin nhắn */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                {filteredMessages.map((msg) => {
                  const isBroadcast = msg.recipientType === 'ALL';
                  const isMyMessage = msg.senderRole === currentRole || (isAdminOrCEO && msg.senderRole === 'GENERAL_DIRECTOR');
                  const canManage = isMyMessage || isAdminOrCEO;
                  const isEditingThis = editingMessageId === msg.id;

                  return (
                    <div 
                      key={msg.id} 
                      className={'p-4 transition-colors relative group ' + (
                        msg.status === 'RESOLVED'
                          ? 'bg-slate-50/70 opacity-75'
                          : msg.isReminder 
                            ? 'bg-amber-50/40 hover:bg-amber-50/70' 
                            : isBroadcast 
                              ? 'bg-rose-50/20 hover:bg-rose-50/40' 
                              : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2 flex-wrap">
                          {/* Nút bấm Sao theo dõi ⭐ */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(msg.id, e)}
                            className="p-1 text-slate-400 hover:text-amber-500 cursor-pointer transition-transform active:scale-125"
                            title={msg.isStarred ? "Bỏ theo dõi" : "Bấm sao để theo dõi tin này"}
                          >
                            <Star className={`w-4 h-4 ${msg.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-300 hover:text-amber-400'}`} />
                          </button>

                          <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (
                            msg.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : msg.priority === 'HIGH'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                          )}>
                            {msg.priority === 'URGENT' ? '⚡ Khẩn Cấp' : msg.priority === 'HIGH' ? '⚠️ Quan Trọng' : 'Tin Nhắn'}
                          </span>

                          <span className="font-bold text-slate-900 text-xs">
                            {msg.senderName}
                          </span>

                          <span className="text-slate-400 text-xs">→</span>

                          <span className="font-semibold text-indigo-700 text-xs">
                            {msg.recipientName}
                          </span>

                          {msg.status === 'RESOLVED' && (
                            <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-extrabold text-[9.5px]">
                              ✓ ĐÃ XONG VIỆC
                            </span>
                          )}

                          {msg.isEdited && (
                            <span className="text-[10px] text-slate-400 italic">
                              (Đã sửa: {msg.editedAt})
                            </span>
                          )}
                        </div>

                        {/* Các hành động trên tin nhắn: Sửa, Thu Hồi, Xong việc, Xóa */}
                        <div className="flex items-center space-x-2 text-[11px] font-mono shrink-0">
                          <span className="text-slate-400">{msg.createdAt}</span>

                          {/* Nút Xong Việc / Mở lại */}
                          <button
                            type="button"
                            onClick={() => handleToggleResolve(msg.id)}
                            className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all ${
                              msg.status === 'RESOLVED'
                                ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                            }`}
                            title={msg.status === 'RESOLVED' ? "Bấm để mở lại việc này" : "Bấm để đóng và đánh dấu đã trao đổi xong"}
                          >
                            {msg.status === 'RESOLVED' ? 'Mở lại' : '✓ Xong việc'}
                          </button>

                          {/* Nút Sửa tin nhắn (Chỉ người gửi hoặc Admin) */}
                          {canManage && !msg.isReminder && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(msg)}
                              className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                              title="Chỉnh sửa nội dung tin nhắn"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Nút Thu hồi tin nhắn (Cá nhân & Hàng loạt) */}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleRecall(msg)}
                              className={`p-1 cursor-pointer transition-colors ${
                                isBroadcast ? 'text-rose-600 hover:text-rose-800 font-bold' : 'text-slate-400 hover:text-rose-600'
                              }`}
                              title={isBroadcast ? "🚨 THU HỒI PHÁT TIN TOÀN CÔNG TY" : "Thu hồi tin nhắn"}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Xóa thủ công */}
                          <button
                            type="button"
                            onClick={() => handleDeleteManual(msg.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 cursor-pointer"
                            title="Xóa khỏi hộp thư"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Nội dung tin nhắn (Hoặc khung chỉnh sửa nếu đang edit) */}
                      {isEditingThis ? (
                        <div className="mt-2.5 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 animate-in fade-in-50">
                          <textarea
                            rows={2}
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            className="w-full p-2 bg-white border border-indigo-300 rounded-lg text-xs outline-none font-medium text-slate-900"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingMessageId(null)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(msg.id)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                            >
                              Lưu Thay Đổi
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`mt-2 text-xs leading-relaxed font-normal ${msg.status === 'RESOLVED' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                          {msg.content}
                        </p>
                      )}

                      {msg.isReminder && (
                        <div className="mt-2.5 p-2 bg-amber-100/60 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 text-amber-900">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Hạn chót nhiệm vụ: <b className="font-mono">{msg.reminderDueDate}</b></span>
                            <span className="text-slate-400">•</span>
                            <span>Người cài: <b>{msg.reminderSetByName}</b></span>
                          </div>

                          {(msg.reminderSetBy === currentRole || isAdminOrCEO || msg.senderRole === currentRole) && (
                            <button
                              onClick={() => handleDeleteOrComplete(msg.id)}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                            >
                              Xác nhận hoàn thành / Xóa
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredMessages.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 italic">
                    {statusFilter === 'STARRED'
                      ? 'Chưa có tin nhắn nào được gắn sao ⭐ theo dõi.'
                      : statusFilter === 'RESOLVED'
                        ? 'Chưa có hội thoại nào được đánh dấu ✓ Đã xong việc.'
                        : 'Chưa có tin nhắn nào phù hợp.'}
                  </div>
                )}
              </div>

              {/* ===================== Ô SOẠN TIN NHẮN AN TOÀN (POKA-YOKE) ===================== */}
              <form onSubmit={handleInitiateSend} className="p-4 bg-slate-50 rounded-2xl border-2 border-indigo-100 space-y-3.5">
                
                {/* THANH CHUYỂN ĐỔI: GỬI CÁ NHÂN (1-ON-1) HOẶC GỬI NHÓM */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Hình thức gửi:</span>
                    <div className="inline-flex p-0.5 bg-slate-200 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setRecipientMode('INDIVIDUAL');
                          setGroupTarget('');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                          recipientMode === 'INDIVIDUAL'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>👤 Gửi Riêng Cho Cá Nhân (1-on-1)</span>
                      </button>

                      {(isAdminOrCEO || isHR) && (
                        <button
                          type="button"
                          onClick={() => {
                            setRecipientMode('GROUP');
                            setSelectedEmployee(null);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                            recipientMode === 'GROUP'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>📢 Gửi Nhóm / Toàn Công Ty</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cài báo nhắc việc */}
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isReminderFlag}
                        onChange={e => setIsReminderFlag(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Pin className="w-3.5 h-3.5 text-amber-600" />
                        <span>Cài báo nhắc việc (Lưu vĩnh viễn)</span>
                      </span>
                    </label>

                    {isReminderFlag && (
                      <input
                        type="text"
                        placeholder="Hạn chót (VD: 17:00 ngày 15/09)..."
                        value={reminderDueDate}
                        onChange={e => setReminderDueDate(e.target.value)}
                        className="p-1 border rounded-lg bg-white text-xs w-44 font-mono"
                      />
                    )}
                  </div>
                </div>

                {/* KHU VỰC CHỌN NGƯỜI NHẬN THEO CHẾ ĐỘ */}
                <div>
                  {/* CHẾ ĐỘ 1: GỬI CÁ NHÂN (CÓ TÌM KIẾM NHÂN SỰ TOÀN DIỆN) */}
                  {recipientMode === 'INDIVIDUAL' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-800 uppercase flex items-center justify-between">
                        <span>1. Chọn Nhân Sự Nhận Tin (Bắt buộc chọn - Đang để trống):</span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {selectedEmployee ? '✓ Đã chọn người nhận' : '⚠️ Chưa chọn ai'}
                        </span>
                      </label>

                      {selectedEmployee ? (
                        <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between shadow-xs animate-in zoom-in-95">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                              {selectedEmployee.fullName.slice(-2)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black text-slate-900 uppercase">
                                  {selectedEmployee.fullName}
                                </span>
                                <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-950 font-mono text-[10px] font-extrabold rounded-md">
                                  {selectedEmployee.code || selectedEmployee.id}
                                </span>
                              </div>
                              <p className="text-[11px] text-emerald-900 font-medium mt-0.5">
                                {selectedEmployee.departmentName} • {selectedEmployee.position} • SĐT: <b className="font-mono">{selectedEmployee.phone}</b>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedEmployee(null)}
                            className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Đổi Người Khác</span>
                          </button>
                        </div>
                      ) : (
                        <div className="relative" ref={dropdownRef}>
                          <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={empSearchQuery}
                              onFocus={() => setIsEmpDropdownOpen(true)}
                              onChange={e => {
                                setEmpSearchQuery(e.target.value);
                                setIsEmpDropdownOpen(true);
                              }}
                              placeholder="🔍 Gõ tên nhân viên, mã nhân viên (AF-...), số điện thoại hoặc phòng ban..."
                              className="w-full py-2.5 pl-9 pr-8 bg-white border-2 border-slate-300 focus:border-indigo-600 rounded-2xl text-xs font-semibold text-slate-900 outline-none shadow-xs"
                            />
                            {empSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setEmpSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {isEmpDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-64 overflow-y-auto divide-y divide-slate-100">
                              <div className="p-2 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                                <span>Danh bạ nhân sự công ty ({filteredEmployeesList.length} kết quả)</span>
                                <span>Nhấp chọn để gửi</span>
                              </div>

                              {filteredEmployeesList.map(emp => (
                                <div
                                  key={emp.id}
                                  onClick={() => {
                                    setSelectedEmployee(emp);
                                    setIsEmpDropdownOpen(false);
                                  }}
                                  className="p-2.5 hover:bg-indigo-50/80 cursor-pointer flex items-center justify-between transition-colors"
                                >
                                  <div className="flex items-center space-x-2.5">
                                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                                      {emp.fullName.slice(-2)}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-900">
                                        {emp.fullName} <span className="font-mono text-indigo-700 font-normal">({emp.code})</span>
                                      </p>
                                      <p className="text-[10.5px] text-slate-500">
                                        {emp.departmentName} • {emp.position}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right text-[11px] font-mono text-slate-400">
                                    {emp.phone}
                                  </div>
                                </div>
                              ))}

                              {filteredEmployeesList.length === 0 && (
                                <div className="p-6 text-center text-xs text-slate-400 italic">
                                  Không tìm thấy nhân viên nào khớp với từ khóa "{empSearchQuery}".
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CHẾ ĐỘ 2: GỬI NHÓM / TOÀN CÔNG TY (POKA-YOKE) */}
                  {recipientMode === 'GROUP' && (
                    <div className="space-y-2 p-3 bg-rose-50/60 border border-rose-200 rounded-2xl">
                      <label className="text-xs font-black text-rose-950 uppercase flex items-center justify-between">
                        <span>2. Chọn Nhóm Nhận Tin (Bắt buộc chọn - Đang để trống):</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-200 text-rose-900 rounded-md">
                          CẦN XÁC NHẬN LẦN 2
                        </span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={groupTarget}
                          onChange={e => setGroupTarget(e.target.value)}
                          className="w-full p-2.5 bg-white border-2 border-rose-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-rose-600"
                        >
                          <option value="">-- Vui lòng chọn phạm vi nhóm nhận tin --</option>
                          <option value="ALL_COMPANY">📢 Toàn Thể Công Ty (100% Cán Bộ - Công Nhân Viên)</option>
                          <option value="FACTORY">🏭 Khối Nhà Máy &amp; Phân Xưởng Sản Xuất</option>
                          <option value="OFFICE">🏢 Khối Văn Phòng Trụ Sở</option>
                          <option value="DEPT">📁 Theo Phòng Ban / Phân Xưởng Cụ Thể</option>
                        </select>

                        {groupTarget === 'DEPT' && (
                          <select
                            value={groupDeptName}
                            onChange={e => setGroupDeptName(e.target.value)}
                            className="w-full p-2.5 bg-white border-2 border-rose-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-rose-600"
                          >
                            {departmentList.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <p className="text-[11px] text-rose-800 font-semibold leading-relaxed">
                        ⚠️ <b>Cảnh báo an toàn:</b> Gửi nhóm sẽ phát tin diện rộng cho nhiều người. Hệ thống sẽ tự động bật cửa sổ <b>Xác Nhận Lần 2</b> khi bạn bấm gửi để ngăn chặn 100% việc gửi nhầm!
                      </p>
                    </div>
                  )}
                </div>

                {/* Ô NHẬP NỘI DUNG & NÚT GỬI */}
                <div className="flex items-center space-x-2 pt-1">
                  <textarea
                    rows={2}
                    required
                    placeholder={
                      recipientMode === 'INDIVIDUAL'
                        ? (selectedEmployee ? `Nhập tin nhắn riêng gửi tới ${selectedEmployee.fullName}...` : "Vui lòng chọn nhân sự trước khi gõ tin nhắn...")
                        : "Nhập nội dung thông điệp gửi tới nhóm / toàn thể công ty..."
                    }
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-indigo-500 font-normal"
                  />
                  <button
                    type="submit"
                    className={`px-5 py-3 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer shrink-0 transition-all active:scale-98 ${
                      recipientMode === 'GROUP' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{recipientMode === 'GROUP' ? 'Kiểm Tra & Gửi Đi' : 'Gửi Đi'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PHÁT TIN CHỈ ĐẠO (BROADCAST ALL / GROUP) */}
          {activeTab === 'BROADCAST' && (isAdminOrCEO || isHR) && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-rose-600" />
                  <span>Quyền Quản Trị: Phát Tin Khẩn Cấp &amp; Thông Điệp Điều Hành</span>
                </h3>
                <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                  Tin nhắn phát tán sẽ xuất hiện tức thì trong hộp tin nhắn của toàn thể nhân sự được chỉ định. Mọi phát tin hàng loạt đều được kiểm soát với <b>Bước Xác Nhận Lần 2</b> và có thể <b>Thu Hồi Bất Kỳ Lúc Nào</b>.
                </p>
              </div>

              <form onSubmit={handleInitiateBroadcast} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">Phạm vi phát tán thông điệp (Bắt buộc chọn) *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastTarget('ALL')}
                      className={'p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ' + (
                        broadcastTarget === 'ALL'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <div>Toàn Thể Công Ty</div>
                      <span className="text-[10px] font-normal opacity-80">100% Cán bộ công nhân viên</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastTarget('FACTORY')}
                      className={'p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ' + (
                        broadcastTarget === 'FACTORY'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <div>Khối Nhà Máy &amp; Xưởng</div>
                      <span className="text-[10px] font-normal opacity-80">Công nhân &amp; Quản đốc</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastTarget('OFFICE')}
                      className={'p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ' + (
                        broadcastTarget === 'OFFICE'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <div>Khối Văn Phòng</div>
                      <span className="text-[10px] font-normal opacity-80">Trụ sở &amp; Gián tiếp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastTarget('DEPARTMENT')}
                      className={'p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ' + (
                        broadcastTarget === 'DEPARTMENT'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <div>Theo Phòng Ban</div>
                      <span className="text-[10px] font-normal opacity-80">Chỉ định cụ thể</span>
                    </button>
                  </div>
                </div>

                {broadcastTarget === 'DEPARTMENT' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Chọn phòng ban nhận tin *</label>
                    <select
                      value={broadcastDept}
                      onChange={e => setBroadcastDept(e.target.value)}
                      className="w-full p-2 border rounded-xl bg-white font-bold"
                    >
                      {departmentList.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mức độ ưu tiên</label>
                    <select
                      value={broadcastPriority}
                      onChange={e => setBroadcastPriority(e.target.value as any)}
                      className="w-full p-2 border rounded-xl bg-white font-bold"
                    >
                      <option value="URGENT">⚡ Khẩn Cấp (Hiện cảnh báo đỏ)</option>
                      <option value="HIGH">⚠️ Quan Trọng (Nhắc nhở tuần)</option>
                      <option value="NORMAL">ℹ️ Thông Báo Bình Thường</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nội dung chỉ đạo phát tán *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Nhập nội dung thông điệp chỉ đạo điều hành của Ban Giám Đốc..."
                    value={broadcastContent}
                    onChange={e => setBroadcastContent(e.target.value)}
                    className="w-full p-3 border rounded-xl bg-white text-xs outline-none focus:border-rose-500 font-normal"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Kiểm Tra &amp; Phát Tin Chỉ Đạo</span>
                  </button>
                </div>
              </form>

              {/* DANH SÁCH CÁC THÔNG ĐIỆP ĐÃ PHÁT TÁN & QUYỀN THU HỒI / CHỈNH SỬA TỨC THÌ */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-rose-600" />
                    <span>Lịch Sử Thông Điệp Đã Phát Tán (Quản Trị Thu Hồi &amp; Chỉnh Sửa)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    {messages.filter(m => m.recipientType === 'ALL' || (m.recipientType === 'DEPARTMENT' && m.senderRole === currentRole)).length} Thông Điệp
                  </span>
                </div>

                <div className="space-y-2.5">
                  {messages
                    .filter(m => m.recipientType === 'ALL' || (m.recipientType === 'DEPARTMENT' && (m.senderRole === currentRole || isAdminOrCEO)))
                    .map((bMsg) => {
                      const isEditingThisBroadcast = editingMessageId === bMsg.id;

                      return (
                        <div 
                          key={bMsg.id}
                          className="p-3.5 bg-white rounded-2xl border-2 border-rose-100 hover:border-rose-300 transition-all shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                                <Radio className="w-3 h-3" />
                                <span>Phát Tin Diện Rộng</span>
                              </span>
                              <span className="font-bold text-slate-900">{bMsg.senderName}</span>
                              <span className="text-slate-400">→</span>
                              <span className="font-bold text-rose-700">{bMsg.recipientName}</span>
                              {bMsg.isEdited && (
                                <span className="text-[10px] text-slate-400 italic">
                                  (Đã sửa: {bMsg.editedAt})
                                </span>
                              )}
                            </div>

                            {/* CÁC THAO TÁC THU HỒI / CHỈNH SỬA / XÓA BẢN PHÁT TIN */}
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className="text-[11px] text-slate-400 font-mono">{bMsg.createdAt}</span>

                              {/* Nút Chỉnh sửa */}
                              <button
                                type="button"
                                onClick={() => handleStartEdit(bMsg)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                                title="Chỉnh sửa nội dung thông điệp này (tất cả nhân viên sẽ nhận nội dung mới)"
                              >
                                <Edit3 className="w-3 h-3 text-indigo-600" />
                                <span>Chỉnh Sửa</span>
                              </button>

                              {/* Nút Thu hồi diện rộng */}
                              <button
                                type="button"
                                onClick={() => handleRecall(bMsg)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                                title="🚨 THU HỒI TỨC THÌ: Gỡ bỏ thông điệp này khỏi màn hình của toàn bộ nhân viên"
                              >
                                <RotateCcw className="w-3 h-3 text-rose-600" />
                                <span>Thu Hồi Ngay</span>
                              </button>
                            </div>
                          </div>

                          {/* Nội dung thông điệp hoặc ô sửa */}
                          {isEditingThisBroadcast ? (
                            <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2 animate-in fade-in-50">
                              <textarea
                                rows={3}
                                value={editingContent}
                                onChange={e => setEditingContent(e.target.value)}
                                className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs outline-none font-medium text-slate-900"
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingMessageId(null)}
                                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border cursor-pointer"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(bMsg.id)}
                                  className="px-4 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                                >
                                  Lưu &amp; Cập Nhật Toàn Bộ
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              {bMsg.content}
                            </p>
                          )}
                        </div>
                      );
                    })}

                  {messages.filter(m => m.recipientType === 'ALL' || (m.recipientType === 'DEPARTMENT' && (m.senderRole === currentRole || isAdminOrCEO))).length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Chưa có thông điệp chỉ đạo diện rộng nào được phát tán.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SỔ NHẮC VIỆC BẤT TỬ (PERSISTENT REMINDERS) */}
          {activeTab === 'REMINDERS' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Pin className="w-4 h-4 text-amber-600" />
                    <span>Sổ Nhắc Việc Bất Tử (Nguyên Tắc Poka-Yoke: Không Bao Giờ Tự Xóa Sau 30 Ngày)</span>
                  </h3>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Chỉ có <b>Người giao việc / Người cài đặt nhắc việc</b> mới có quyền bấm <i>"Xác nhận hoàn thành &amp; Xóa"</i>. Người nhận không thể tự ý xóa để tránh thoái thác nhiệm vụ.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-600 text-white font-bold text-xs font-mono shrink-0">
                  {remindersList.length} Nhiệm Vụ
                </span>
              </div>

              <div className="space-y-3">
                {remindersList.map((remind) => {
                  const isSetter = 
                    remind.reminderSetBy === currentRole || 
                    isAdminOrCEO || 
                    remind.senderRole === currentRole;

                  return (
                    <div 
                      key={remind.id} 
                      className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-300 transition-all"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Pin className="w-3 h-3 text-amber-600" />
                            <span>Nhắc Việc</span>
                          </span>

                          <span className="text-xs font-bold text-slate-900">
                            Người Giao: <b className="text-indigo-700">{remind.reminderSetByName}</b>
                          </span>

                          <span className="text-slate-400 text-xs">→</span>

                          <span className="text-xs font-bold text-slate-700">
                            Người Nhận: <b className="text-slate-900">{remind.recipientName}</b>
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 leading-relaxed pl-1">
                          {remind.content}
                        </p>

                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono pt-1">
                          <span>📅 Ngày tạo: {remind.createdAt}</span>
                          <span>⏰ Hạn hoàn thành: <b className="text-rose-700">{remind.reminderDueDate || 'Không giới hạn'}</b></span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center space-x-2">
                        {isSetter ? (
                          <button
                            onClick={() => handleDeleteOrComplete(remind.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
                            title="Người giao việc xác nhận nhiệm vụ đã hoàn tất và xóa khỏi sổ nhắc việc"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Xác Nhận Đã Xong &amp; Xóa</span>
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-semibold flex items-center space-x-1 border border-slate-200">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Chỉ {remind.reminderSetByName} mới được xóa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {remindersList.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    Không có nhắc việc nào đang chờ xử lý. Tất cả nhiệm vụ đều đã hoàn tất!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center text-xs text-slate-500">
          <div>
            Hệ thống tin nhắn tự động áp dụng chính sách <b>Data Minimization (ISO 27001 &amp; GDPR)</b>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Đóng Hộp Tin Nhắn
          </button>
        </div>

        {/* ===================== POPUP XÁC NHẬN LẦN 2 (DOUBLE CONFIRMATION MODAL) ===================== */}
        {showDoubleConfirmModal && pendingConfirmInfo && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-rose-500 max-w-lg w-full overflow-hidden">
              <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white p-4 sm:p-5 flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-7 h-7 text-white animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-200 block">
                    BẢO VỆ POKA-YOKE • BƯỚC XÁC NHẬN LẦN 2
                  </span>
                  <h3 className="text-base font-black tracking-tight text-white">
                    Xác Nhận Phát Tin Hàng Loạt / Diện Rộng
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-rose-900 font-extrabold text-xs">
                    <span>📢 NHÓM TIẾP NHẬN TIN:</span>
                    <span className="px-2 py-0.5 bg-rose-200 text-rose-950 rounded-lg uppercase text-[10px]">
                      {pendingConfirmInfo.recipientType === 'ALL' ? 'Toàn Công Ty' : 'Theo Khối/Phòng'}
                    </span>
                  </div>
                  <p className="font-black text-slate-900 text-sm">
                    {pendingConfirmInfo.targetName}
                  </p>
                  <p className="text-[11px] text-rose-700 font-semibold leading-relaxed">
                    ⚠️ Tin nhắn này sẽ được đẩy đồng loạt lên màn hình làm việc của tất cả các nhân viên thuộc nhóm trên. Hành động này không thể hoàn tác!
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Trích Đoạn Nội Dung Sắp Phát:</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 italic max-h-28 overflow-y-auto leading-relaxed">
                    "{pendingConfirmInfo.content}"
                  </div>
                </div>

                {pendingConfirmInfo.isReminder && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-amber-900 font-bold text-xs">
                    <Pin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Tin này được gắn cờ SỔ NHẮC VIỆC (Lưu vĩnh viễn đến khi hoàn thành).</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowDoubleConfirmModal(false);
                    setPendingConfirmInfo(null);
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer transition-all"
                >
                  Hủy Bỏ / Sửa Lại
                </button>
                <button
                  type="button"
                  onClick={() => executeSendMessage(pendingConfirmInfo)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center space-x-1.5 active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>Tôi Hiểu &amp; Xác Nhận Gửi Hàng Loạt</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
