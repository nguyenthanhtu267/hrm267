import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  BarChart2, 
  MousePointerClick, 
  Eye, 
  Layout, 
  Monitor, 
  Smartphone, 
  Edit3, 
  Trash2, 
  Copy,
  Clock,
  Sparkles,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { CompanyPolicy } from '../types/hrm';

interface BannerCampaignViewProps {
  policy: CompanyPolicy;
  onSavePolicy: (policy: CompanyPolicy) => void;
}

interface BannerCampaign {
  id: string;
  name: string;
  target: string;
  status: 'ACTIVE' | 'INACTIVE';
  views: number;
  clicks: number;
}

const initialCampaigns: BannerCampaign[] = [
  { id: '1', name: 'Ưu đãi gói tin nổi bật', target: 'Tất cả khu vực • Khách, ứng viên • Ưu tiên 10', status: 'ACTIVE', views: 845, clicks: 62 },
  { id: '2', name: 'Kêu gọi ứng tuyển Kỹ sư', target: 'Trang chủ, Chi tiết tin • Ứng viên • Ưu tiên 8', status: 'ACTIVE', views: 403, clicks: 24 }
];

export const BannerCampaignView: React.FC<BannerCampaignViewProps> = ({ policy, onSavePolicy }) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [formData, setFormData] = useState<CompanyPolicy>(policy);
  const [campaigns, setCampaigns] = useState<BannerCampaign[]>(initialCampaigns);
  const [editingCampaign, setEditingCampaign] = useState<BannerCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<Partial<BannerCampaign>>({});

  const handleSaveFloatingBanner = () => {
    onSavePolicy(formData);
    alert('Đã lưu cấu hình Floating Banner thành công!');
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : c
    ));
  };

  const handleEditCampaign = (camp: BannerCampaign) => {
    setEditingCampaign(camp);
    setCampaignForm(camp);
    setActiveTab('CREATE');
  };

  const handleCreateNew = () => {
    setEditingCampaign(null);
    setCampaignForm({ name: '', target: 'Tất cả khu vực', status: 'ACTIVE', views: 0, clicks: 0 });
    setActiveTab('CREATE');
  };

  const handleSaveCampaign = () => {
    if (!campaignForm.name) {
      alert('Vui lòng nhập tên chiến dịch');
      return;
    }
    if (editingCampaign) {
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...c, ...campaignForm } as BannerCampaign : c));
    } else {
      setCampaigns([...campaigns, { ...campaignForm, id: Date.now().toString() } as BannerCampaign]);
    }
    setActiveTab('LIST');
  };

  const activeCount = campaigns.filter(c => c.status === 'ACTIVE').length;
  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold mb-1">Đang chạy</p>
          <p className="text-2xl font-bold text-slate-900">{activeCount}<span className="text-sm text-slate-400 font-normal">/{campaigns.length}</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold mb-1">Lượt hiển thị (30 ngày)</p>
          <p className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold mb-1">Lượt bấm (30 ngày)</p>
          <p className="text-2xl font-bold text-slate-900">{totalClicks.toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold mb-1">Tỷ lệ bấm (CTR)</p>
          <p className="text-2xl font-bold text-emerald-600">{ctr}%</p>
        </div>
      </div>

      {activeTab === 'LIST' && (
        <>
          {/* Campaigns List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Quản lý Chiến dịch ({campaigns.length})
              </h2>
              <button 
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tạo chiến dịch mới
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map(camp => (
                <div key={camp.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{camp.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{camp.target}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${camp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {camp.status === 'ACTIVE' ? 'Đang chạy' : 'Đã tắt'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div className="flex gap-4 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-400" /> {camp.views}</span>
                      <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5 text-slate-400" /> {camp.clicks}</span>
                      <span className="text-emerald-600">CTR {camp.views > 0 ? ((camp.clicks / camp.views) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditCampaign(camp)} className="cursor-pointer text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100">
                        Sửa
                      </button>
                      <button onClick={() => toggleCampaignStatus(camp.id)} className="cursor-pointer text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">
                        {camp.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Banner config panel */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl shadow-sm border border-pink-100 p-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-pink-600" />
                Thiết lập Nút Quảng cáo (Floating Banner)
              </h2>
              <button
                onClick={handleSaveFloatingBanner}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Lưu cấu hình Floating
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-pink-200 bg-white">
                <span className="text-xs font-semibold text-slate-800">Trạng thái bật/tắt</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.promoBannerEnabled ?? true}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoBannerEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
              <div className="p-3 rounded-lg border border-pink-200 bg-white flex flex-col justify-center">
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Nội dung nút</label>
                <input
                  type="text"
                  value={formData.promoBannerText || 'Đăng Tuyển Dụng'}
                  onChange={(e) => setFormData({ ...formData, promoBannerText: e.target.value })}
                  className="w-full text-xs text-slate-800 font-bold focus:outline-none"
                  placeholder="Đăng Tuyển Dụng"
                />
              </div>
              <div className="p-3 rounded-lg border border-pink-200 bg-white flex flex-col justify-center">
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Link đích đến</label>
                <input
                  type="url"
                  value={formData.promoBannerLink || 'https://tuyendungvieclam.vercel.app/'}
                  onChange={(e) => setFormData({ ...formData, promoBannerLink: e.target.value })}
                  className="w-full text-xs text-indigo-600 focus:outline-none"
                  placeholder="https://tuyendungvieclam.vercel.app/"
                />
              </div>
            </div>
          </div>
          {/* Banner Placements (Khu vực đặt banner) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layout className="w-4 h-4 text-indigo-600" />
                Khu vực đặt banner (12)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Trang - vị trí</th>
                    <th className="px-4 py-3 font-semibold">Khổ / Kích thước</th>
                    <th className="px-4 py-3 font-semibold">Thiết bị</th>
                    <th className="px-4 py-3 font-semibold text-center">Đang chạy</th>
                    <th className="px-4 py-3 font-semibold text-right">Hiển thị - Bấm</th>
                    <th className="px-4 py-3 font-semibold text-center">Bật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">Trang chủ</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Dưới khối tìm kiếm, trên "Công ty nổi bật"</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Ngang toàn khung • cao ~100-130px</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5" /><Smartphone className="w-3.5 h-3.5" /> Mọi thiết bị</span></td>
                    <td className="px-4 py-3 text-center font-semibold">2</td>
                    <td className="px-4 py-3 text-right text-slate-600">845 - 62</td>
                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="accent-indigo-600" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">Chi tiết tin</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Cột phải, dưới thông tin công ty</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Dọc 280 × ~280px</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5" /> Máy tính</span></td>
                    <td className="px-4 py-3 text-center font-semibold">1</td>
                    <td className="px-4 py-3 text-right text-slate-600">403 - 24</td>
                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="accent-indigo-600" /></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">Menu điện thoại</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Cuối menu ☰ trên điện thoại</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Dải nhỏ gọn</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> Điện thoại</span></td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-400">0</td>
                    <td className="px-4 py-3 text-right text-slate-400">0 - 0</td>
                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="accent-indigo-600" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'CREATE' && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              {editingCampaign ? 'Sửa chiến dịch banner' : 'Tạo chiến dịch banner AI'}
            </h2>
            <button onClick={() => setActiveTab('LIST')} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Left */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-2 uppercase">1. Nội dung</label>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Tên chiến dịch (chỉ Admin thấy)</label>
                    <input type="text" value={campaignForm.name || ''} onChange={e => setCampaignForm({...campaignForm, name: e.target.value})} placeholder="VD: Tuyển Kỹ sư phần mềm tháng 10" className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Nhãn nhỏ (tuỳ chọn)</label>
                      <input type="text" placeholder="Hot, Mới ra mắt..." className="w-full text-xs p-2.5 rounded-lg border border-slate-300 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Đối tượng hiển thị</label>
                      <input type="text" value={campaignForm.target || ''} onChange={e => setCampaignForm({...campaignForm, target: e.target.value})} placeholder="Tất cả khu vực..." className="w-full text-xs p-2.5 rounded-lg border border-slate-300 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Mô tả ngắn (tuỳ chọn, 0/180)</label>
                    <textarea rows={2} placeholder="Nhập mô tả ngắn gọn..." className="w-full text-xs p-2.5 rounded-lg border border-slate-300 outline-none resize-none"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Chữ trên nút</label>
                      <input type="text" placeholder="Xem ngay" className="w-full text-xs p-2.5 rounded-lg border border-slate-300 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Link khi bấm (URL đích)</label>
                      <input type="url" placeholder="https://..." className="w-full text-xs p-2.5 rounded-lg border border-slate-300 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-2 uppercase">2. Nền & Màu chữ (AI Gen)</label>
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-4">
                  <div className="flex gap-2">
                    <button className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm">
                      <Sparkles className="w-4 h-4" /> Tự tạo từ mô tả
                    </button>
                    <button className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50">
                      <ImageIcon className="w-4 h-4" /> Ảnh tải lên
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Mô tả nền bạn muốn (AI Prompt)</label>
                    <textarea rows={2} defaultValue="Công nghệ, thông minh, xanh dương đậm, có họa tiết mạch điện tử mờ, phong cách hiện đại" className="w-full text-xs p-2.5 rounded-lg border border-indigo-200 outline-none resize-none bg-white"></textarea>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-600 cursor-pointer hover:bg-indigo-50">+ năng động, trẻ trung</span>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-600 cursor-pointer hover:bg-indigo-50">+ tối giản, nền sáng</span>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-full text-[10px] text-slate-600 cursor-pointer hover:bg-indigo-50">+ sang trọng, cao cấp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Right */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col">
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Xem trước trực tiếp</h3>
              
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                {/* Banner Horizontal Preview */}
                <div className="w-full max-w-md h-32 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 relative overflow-hidden shadow-lg flex flex-col justify-center">
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 transform translate-x-4"></div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-amber-950 text-[10px] font-bold w-fit mb-2">Tuyển Dụng Nóng</span>
                  <h4 className="text-lg font-black leading-tight mb-1 relative z-10">Kỹ Sư Phần Mềm (React/Node)</h4>
                  <p className="text-xs text-blue-200 mb-3 relative z-10 max-w-[70%]">Thu nhập hấp dẫn tới $2000. Môi trường làm việc Hybrid linh hoạt, thiết bị cấp Mac M2.</p>
                  <button className="px-4 py-1.5 bg-white text-indigo-900 text-xs font-bold rounded-lg w-fit shadow-sm relative z-10 hover:bg-slate-100">Ứng tuyển ngay ➔</button>
                </div>

                {/* Mobile Preview */}
                <div className="w-[280px] h-[100px] rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3 shadow-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black leading-tight mb-1">Kỹ Sư Phần Mềm</h4>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-amber-950 text-[9px] font-bold">Hot</span>
                  </div>
                  <button className="px-3 py-1.5 bg-white text-indigo-900 text-[10px] font-bold rounded-lg shadow-sm whitespace-nowrap">Xem ngay</button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button onClick={() => setActiveTab('LIST')} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Hủy</button>
            <button onClick={handleSaveCampaign} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer">{editingCampaign ? 'Lưu cập nhật' : 'Tạo chiến dịch'}</button>
          </div>
        </div>
      )}
    </div>
  );
};
