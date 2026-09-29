import React from 'react';
import { FeedbackItem } from '../types/hrm';
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface FeedbackListViewProps {
  feedbacks: FeedbackItem[];
  onUpdateFeedbacks: (updated: FeedbackItem[]) => void;
}

export const FeedbackListView: React.FC<FeedbackListViewProps> = ({
  feedbacks,
  onUpdateFeedbacks,
}) => {
  const handleUpdateStatus = (id: string, status: FeedbackItem['status']) => {
    const updated = feedbacks.map(f => f.id === id ? { ...f, status } : f);
    onUpdateFeedbacks(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-900">Bảng Theo Dõi Góp Ý & Đánh Giá Của Người Thử Nghiệm</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Tổng hợp toàn bộ phản hồi từ bạn và bạn bè trong quá trình trải nghiệm các tính năng của phần mềm
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Người Gửi / Vai Trò</th>
                <th className="px-4 py-3.5">Phân Hệ</th>
                <th className="px-4 py-3.5">Loại Góp Ý</th>
                <th className="px-4 py-3.5">Nội Dung Chi Tiết</th>
                <th className="px-4 py-3.5">Kỳ Vọng</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-4 py-3.5 text-right">Cập Nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900">{fb.userName}</span>
                    <div className="text-[10px] text-slate-400">{fb.userRole}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-indigo-700">{fb.moduleName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      fb.feedbackType === 'BUG' ? 'bg-rose-50 text-rose-700' :
                      fb.feedbackType === 'FEATURE_REQUEST' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {fb.feedbackType === 'BUG' ? 'Báo lỗi' : fb.feedbackType === 'FEATURE_REQUEST' ? 'Tính năng' : 'Giao diện'}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">{fb.content}</td>
                  <td className="px-4 py-3 max-w-xs text-slate-500 italic">{fb.expectedResult || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      fb.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      fb.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {fb.status === 'RESOLVED' ? 'Đã hoàn thành' : fb.status === 'IN_PROGRESS' ? 'Đang xử lý' : 'Mới tiếp nhận'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={fb.status}
                      onChange={(e) => handleUpdateStatus(fb.id, e.target.value as any)}
                      className="text-xs p-1 rounded border border-slate-300 bg-white"
                    >
                      <option value="NEW">Mới nhận</option>
                      <option value="IN_PROGRESS">Đang xử lý</option>
                      <option value="RESOLVED">Đã xong</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
