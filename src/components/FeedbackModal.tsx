import React, { useState } from 'react';
import { FeedbackItem, UserRole } from '../types/hrm';
import { MessageSquarePlus, X, Check, AlertTriangle, Sparkles } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSubmitFeedback: (item: FeedbackItem) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSubmitFeedback,
}) => {
  const [moduleName, setModuleName] = useState('Chấm công & Ca kíp');
  const [userName, setUserName] = useState('Người kiểm thử / Bạn bè');
  const [feedbackType, setFeedbackType] = useState<FeedbackItem['feedbackType']>('UI_IMPROVEMENT');
  const [content, setContent] = useState('');
  const [expectedResult, setExpectedResult] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    const item: FeedbackItem = {
      id: `FB-${Date.now()}`,
      moduleName,
      userName,
      userRole: currentRole,
      feedbackType,
      content,
      expectedResult,
      status: 'NEW',
      createdAt: new Date().toLocaleString(),
    };

    onSubmitFeedback(item);
    onClose();
    alert('Cảm ơn bạn! Ý kiến đóng góp đã được lưu vào hệ thống để kỹ sư tiếp tục tối ưu.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-3 space-y-1.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Góp Ý & Báo Lỗi Trải Nghiệm</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Gửi nhận xét của bạn hoặc bạn bè khi trải nghiệm thử nghiệm tính năng để chúng tôi hoàn thiện phần mềm tốt nhất.
        </p>

        <form onSubmit={handleSubmit} className="space-y-1.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tên người gửi</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phân hệ liên quan</label>
              <select
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Hồ sơ nhân sự 360°">Hồ sơ nhân sự 360°</option>
                <option value="Chấm công & Ca kíp">Chấm công & Ca kíp</option>
                <option value="Tính lương & Thuế TNCN">Tính lương & Thuế TNCN</option>
                <option value="Đơn từ & Phê duyệt">Đơn từ & Phê duyệt</option>
                <option value="Thanh lý thôi việc">Thanh lý thôi việc</option>
                <option value="Quy ước chung doanh nghiệp">Quy ước chung doanh nghiệp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Loại góp ý</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UI_IMPROVEMENT', label: 'Cải tiến giao diện' },
                { id: 'FEATURE_REQUEST', label: 'Đề xuất tính năng' },
                { id: 'BUG', label: 'Báo lỗi thao tác' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFeedbackType(t.id as any)}
                  className={`p-2 rounded-lg border text-center font-medium transition-colors ${
                    feedbackType === t.id 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nội dung chi tiết *</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả trải nghiệm, lỗi hoặc ý tưởng cải tiến của bạn..."
              className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kết quả mong muốn đạt được</label>
            <input
              type="text"
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              placeholder="Ví dụ: Giảm số lần bấm chuột, tự động điền thông tin..."
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md"
            >
              Gửi Nhận Xét
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
