import React from 'react';
import { BannerAd } from './BannerAd';
import { NavTab } from './Sidebar';
import { CompanyPolicy } from '../types/hrm';

interface GlobalBannerAreaProps {
  currentTab: NavTab;
  policy: CompanyPolicy;
}

export const GlobalBannerArea: React.FC<GlobalBannerAreaProps> = ({ currentTab, policy }) => {
  // Configured banners per tab (Mỗi tab 1 chủ đề)
  const tabBanners: Partial<Record<NavTab, React.ReactNode>> = {
    'DASHBOARD': (
      <BannerAd
        id="banner-dashboard"
        variant="horizontal"
        badge="ƯU ĐÃI THÁNG"
        title="Nâng cấp gói Enterprise"
        subtitle="Mở khóa toàn bộ tính năng quản trị nhân sự nâng cao, bảo mật 2 lớp và hỗ trợ 24/7."
        ctaText="Xem bảng giá"
        href={policy.promoBannerLink || "#"}
        bgClass="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500/30"
      />
    ),
    'RECRUITMENT': (
      <BannerAd
        id="banner-ats"
        variant="horizontal"
        badge="DÀNH CHO NHÀ TUYỂN DỤNG"
        title="Đăng tin tuyển dụng MIỄN PHÍ"
        subtitle="Tiếp cận hàng ngàn ứng viên phù hợp, tin được duyệt nhanh, ưu tiên hiển thị trên top tìm kiếm."
        ctaText="Đăng tin ngay"
        href={policy.promoBannerLink || "#"}
        bgClass="bg-gradient-to-r from-[#3b2b2b] to-[#1e1414] border border-[#ff6a00]/30"
      />
    ),
    'TRAINING': (
      <BannerAd
        id="banner-training"
        variant="horizontal"
        badge="ĐÀO TẠO NỘI BỘ"
        title="Khóa học Kỹ năng quản lý Cấp trung"
        subtitle="Tài trợ 100% học phí cho nhân viên xuất sắc. Đăng ký ngay hôm nay để nhận suất."
        ctaText="Đăng ký ngay"
        href={policy.promoBannerLink || "#"}
        bgClass="bg-gradient-to-r from-emerald-900 to-teal-900 border border-emerald-500/30"
      />
    ),
    'PERFORMANCE': (
      <BannerAd
        id="banner-performance"
        variant="horizontal"
        badge="CÔNG CỤ MỚI"
        title="Đánh giá 360 độ bằng AI"
        subtitle="Tự động tổng hợp nhận xét, loại bỏ cảm tính và đề xuất tăng lương chính xác."
        ctaText="Trải nghiệm thử"
        href={policy.promoBannerLink || "#"}
        bgClass="bg-gradient-to-r from-purple-900 to-fuchsia-900 border border-purple-500/30"
      />
    ),
    'ATTENDANCE': (
      <BannerAd
        id="banner-attendance"
        variant="horizontal"
        badge="ĐỘC QUYỀN VIP"
        title="Quản lý suất ăn AI & Nhận diện khuôn mặt"
        subtitle="Chấm ăn tự động, chống thất thoát. Trải nghiệm miễn phí 30 ngày."
        ctaText="Kích hoạt ngay"
        href={policy.promoBannerLink || "#"}
        bgClass="bg-gradient-to-r from-rose-900 to-red-900 border border-rose-500/30"
      />
    )
  };

  // Default banner for other tabs (Áp dụng toàn bộ)
  const defaultBanner = (
    <BannerAd
      id="banner-global"
      variant="horizontal"
      badge="THÔNG BÁO CHUNG"
      title="Tải ứng dụng HRM trên điện thoại"
      subtitle="Chấm công GPS, nhận thông báo lương và duyệt đơn từ mọi lúc mọi nơi."
      ctaText="Tải App ngay"
      href={policy.promoBannerLink || "#"}
      bgClass="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700"
    />
  );

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {tabBanners[currentTab] || defaultBanner}
    </div>
  );
};
