import { UserRole } from '../types/hrm';

export interface InternalMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientType: 'ALL' | 'DEPARTMENT' | 'INDIVIDUAL';
  recipientId?: string; // 'ALL', 'Khối Sản Xuất', or employee code 'AV-0891'
  recipientName?: string;
  content: string;
  createdAt: string; // ISO or formatted date
  expiresAt: string; // 30 days from creation
  isReminder: boolean; // Gắn cờ nhắc việc
  reminderDueDate?: string;
  reminderSetBy: string; // ID / Role của người cài đặt nhắc việc
  reminderSetByName: string;
  reminderStatus?: 'PENDING' | 'DONE';
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  isRead: boolean;

  // NÂNG CẤP VÒNG ĐỜI & QUẢN TRỊ NÂNG CAO
  isStarred?: boolean; // ⭐ Bấm sao theo dõi
  status?: 'ACTIVE' | 'RESOLVED'; // 'RESOLVED': Hai bên đã trao đổi xong việc trước 30 ngày
  isEdited?: boolean; // Đã chỉnh sửa
  editedAt?: string; // Thời gian chỉnh sửa
  isRecalled?: boolean; // Đã thu hồi
  recalledAt?: string;
}

const STORAGE_KEY = 'omnihrm_internal_messages';

// Khởi tạo các tin nhắn mẫu ban đầu
const getInitialMessages = (): InternalMessage[] => {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'MSG-001',
      senderId: 'GENERAL_DIRECTOR',
      senderName: 'TỔNG GIÁM ĐỐC (Admin)',
      senderRole: 'GENERAL_DIRECTOR',
      recipientType: 'ALL',
      recipientId: 'ALL',
      recipientName: 'Toàn Thể Cán Bộ - Công Nhân Viên',
      content: 'Chỉ đạo khẩn: Toàn thể các phân xưởng nhà máy và khối văn phòng kiểm tra an toàn PCCC, rà soát vệ sinh 5S chuẩn bị đón đoàn kiểm toán ISO 14001 vào thứ Sáu tuần này.',
      createdAt: '2026-09-08 08:30',
      expiresAt: thirtyDaysLater.toISOString().split('T')[0] + ' 23:59',
      isReminder: false,
      priority: 'URGENT',
      isRead: false,
      reminderSetBy: 'GENERAL_DIRECTOR',
      reminderSetByName: 'TỔNG GIÁM ĐỐC',
      isStarred: true,
      status: 'ACTIVE',
    },
    {
      id: 'REMIND-001',
      senderId: 'HR_MANAGER',
      senderName: 'Phan Mai Lan (HR Manager)',
      senderRole: 'HR_MANAGER',
      recipientType: 'INDIVIDUAL',
      recipientId: 'AV-0891',
      recipientName: 'Bà Nguyễn Thu Hà (C&B Specialist)',
      content: '📌 NHẮC VIỆC QUAN TRỌNG: Hoàn tất bảng kê đối chiếu ngược chuyển khoản lương VCB và nộp danh sách BHXH tháng 8 trước 17:00 ngày 10/09/2026.',
      createdAt: '2026-09-09 07:45',
      expiresAt: '2099-12-31',
      isReminder: true,
      reminderDueDate: '2026-09-10 17:00',
      reminderSetBy: 'HR_MANAGER',
      reminderSetByName: 'Phan Mai Lan (HR Manager)',
      reminderStatus: 'PENDING',
      priority: 'HIGH',
      isRead: false,
      isStarred: true,
      status: 'ACTIVE',
    },
    {
      id: 'MSG-002',
      senderId: 'HR_MANAGER',
      senderName: 'Phòng Nhân Sự',
      senderRole: 'HR_MANAGER',
      recipientType: 'INDIVIDUAL',
      recipientId: 'AV-0922',
      recipientName: 'Ông Trần Thanh Bình (Kỹ Sư Chiết Rót)',
      content: 'Chào bạn Bình, đề nghị cấp lại thẻ từ RFID gửi xe & nhà ăn của bạn đã được duyệt. Thẻ đã in xong, bạn vui lòng ghé văn phòng HR tầng 2 để nhận thẻ mới nhé.',
      createdAt: '2026-09-09 08:15',
      expiresAt: thirtyDaysLater.toISOString().split('T')[0] + ' 23:59',
      isReminder: false,
      priority: 'NORMAL',
      isRead: true,
      reminderSetBy: 'HR_MANAGER',
      reminderSetByName: 'Phòng Nhân Sự',
      isStarred: false,
      status: 'ACTIVE',
    }
  ];
};

export const internalMessagingService = {
  // Lấy danh sách tin nhắn có tự động dọn dẹp tin quá 30 ngày (Auto-Purge)
  getMessages: (): InternalMessage[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let messages: InternalMessage[] = raw ? JSON.parse(raw) : getInitialMessages();

      const now = new Date();
      // LỌC TỰ ĐỘNG: Giữ lại tin nhắn chưa hết hạn (trong vòng 30 ngày) HOẶC tin là nhắc việc HOẶC tin được gắn sao ⭐ theo dõi
      const validMessages = messages.filter(m => {
        if (m.isReminder) return true; // Nhắc việc LƯU VĨNH VIỄN không bị tự xóa
        if (m.isStarred) return true;  // ⭐ Tin đang theo dõi được bảo lưu không bị tự xóa sau 30 ngày
        
        if (!m.expiresAt) return true;
        const expDate = new Date(m.expiresAt);
        return expDate.getTime() >= now.getTime(); // Còn hạn
      });

      if (validMessages.length !== messages.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validMessages));
      }

      return validMessages;
    } catch (e) {
      console.error('Error reading messages:', e);
      return getInitialMessages();
    }
  },

  // Lưu danh sách tin nhắn
  saveMessages: (messages: InternalMessage[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving messages:', e);
    }
  },

  // Gửi tin nhắn mới
  sendMessage: (msg: Omit<InternalMessage, 'id' | 'createdAt' | 'expiresAt' | 'isRead'>): InternalMessage => {
    const messages = internalMessagingService.getMessages();
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const newMsg: InternalMessage = {
      ...msg,
      id: msg.isReminder ? 'REMIND-' + Date.now() : 'MSG-' + Date.now(),
      createdAt: now.toISOString().split('T')[0] + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      expiresAt: msg.isReminder ? '2099-12-31' : (thirtyDaysLater.toISOString().split('T')[0] + ' 23:59'),
      isRead: false,
      isStarred: false,
      status: 'ACTIVE',
    };

    const updated = [newMsg, ...messages];
    internalMessagingService.saveMessages(updated);
    return newMsg;
  },

  // ⭐ BẬT / TẮT SAO THEO DÕI (TOGGLE STAR)
  toggleStar: (messageId: string): boolean => {
    const messages = internalMessagingService.getMessages();
    let currentStarred = false;
    const updated = messages.map(m => {
      if (m.id === messageId) {
        currentStarred = !m.isStarred;
        return { ...m, isStarred: currentStarred };
      }
      return m;
    });
    internalMessagingService.saveMessages(updated);
    return currentStarred;
  },

  // ✓ ĐÓNG HỘI THOẠI / ĐÃ XONG VIỆC (MARK RESOLVED & ARCHIVE TRƯỚC 30 NGÀY)
  toggleResolveStatus: (messageId: string): 'RESOLVED' | 'ACTIVE' => {
    const messages = internalMessagingService.getMessages();
    let newStatus: 'RESOLVED' | 'ACTIVE' = 'RESOLVED';
    const updated = messages.map(m => {
      if (m.id === messageId) {
        newStatus = m.status === 'RESOLVED' ? 'ACTIVE' : 'RESOLVED';
        return { ...m, status: newStatus };
      }
      return m;
    });
    internalMessagingService.saveMessages(updated);
    return newStatus;
  },

  // ✏️ CHỈNH SỬA TIN NHẮN (EDIT MESSAGE)
  editMessage: (messageId: string, newContent: string): { success: boolean; message: string } => {
    const messages = internalMessagingService.getMessages();
    const target = messages.find(m => m.id === messageId);
    if (!target) return { success: false, message: 'Không tìm thấy tin nhắn.' };

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const updated = messages.map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          content: newContent,
          isEdited: true,
          editedAt: timeStr,
        };
      }
      return m;
    });

    internalMessagingService.saveMessages(updated);
    return { success: true, message: 'Đã cập nhật nội dung tin nhắn thành công.' };
  },

  // 🚨 THU HỒI TIN NHẮN (RECALL / DELETE FOR ALL - CÁ NHÂN & PHÁT TIN TOÀN CÔNG TY)
  recallMessage: (messageId: string): { success: boolean; message: string } => {
    const messages = internalMessagingService.getMessages();
    const target = messages.find(m => m.id === messageId);
    if (!target) return { success: false, message: 'Không tìm thấy tin nhắn cần thu hồi.' };

    // Xóa sạch hoàn toàn tin nhắn khỏi hệ thống để không lan truyền
    const updated = messages.filter(m => m.id !== messageId);
    internalMessagingService.saveMessages(updated);
    return { 
      success: true, 
      message: target.recipientType === 'ALL' 
        ? '✓ Đã thu hồi thông điệp phát tán toàn công ty thành công!' 
        : '✓ Đã thu hồi tin nhắn thành công.' 
    };
  },

  // 🗑️ XÓA THỦ CÔNG (DELETE)
  deleteMessage: (messageId: string): void => {
    const messages = internalMessagingService.getMessages();
    const updated = messages.filter(m => m.id !== messageId);
    internalMessagingService.saveMessages(updated);
  },

  // Đánh dấu đã đọc
  markAsRead: (messageId: string): void => {
    const messages = internalMessagingService.getMessages();
    const updated = messages.map(m => m.id === messageId ? { ...m, isRead: true } : m);
    internalMessagingService.saveMessages(updated);
  },

  // Đánh dấu đọc tất cả
  markAllAsRead: (): void => {
    const messages = internalMessagingService.getMessages();
    const updated = messages.map(m => ({ ...m, isRead: true }));
    internalMessagingService.saveMessages(updated);
  },

  // Hoàn thành Nhắc việc (POKA-YOKE: Chỉ người cài đặt mới được xóa)
  completeReminder: (reminderId: string, currentRole: string, isAdmin: boolean): boolean => {
    const messages = internalMessagingService.getMessages();
    const target = messages.find(m => m.id === reminderId);
    if (!target) return false;

    const isSetter = 
      target.reminderSetBy === currentRole || 
      isAdmin || 
      target.senderRole === currentRole;

    if (!isSetter) return false;

    const updated = messages.filter(m => m.id !== reminderId);
    internalMessagingService.saveMessages(updated);
    return true;
  },

  // Đếm số tin nhắn chưa đọc
  getUnreadCount: (): number => {
    const messages = internalMessagingService.getMessages();
    return messages.filter(m => !m.isRead).length;
  }
};
