import React from 'react';
import { CompanyPolicy } from '../types/hrm';

interface FloatingBannerProps {
  policy: CompanyPolicy;
}

export const FloatingBanner: React.FC<FloatingBannerProps> = ({ policy }) => {
  // If explicitly disabled in admin, don't show
  if (policy.promoBannerEnabled === false) return null;

  const link = policy.promoBannerLink || 'https://tuyendung.hrm.com/post-job';
  const text = policy.promoBannerText || 'Đăng Tuyển Dụng';

  return (
    <>
      <style>
        {`
          .floating-promo-btn {
            position: fixed;
            top: calc(50% + 80px);
            right: 0;
            transform: translateY(-50%);
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 15px 10px;
            border-radius: 8px 0 0 8px;
            text-decoration: none;
            box-shadow: -4px 0 15px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-right: none;
            transition: all 0.3s ease;
          }

          .floating-promo-btn:hover {
            padding-right: 15px;
            background: linear-gradient(135deg, #2a5298 0%, #1e3c72 100%);
          }

          .floating-promo-btn .promo-text {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 1px;
            margin-top: 10px;
          }

          .promo-free-badge {
            background-color: #ff3b30;
            color: white;
            font-size: 11px;
            font-weight: 900;
            padding: 3px 6px;
            border-radius: 4px;
            box-shadow: 0 0 8px rgba(255, 59, 48, 0.6);
            animation: pulse-red 1.5s infinite;
          }

          @keyframes pulse-red {
            0% {
              transform: scale(0.95);
              box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 8px rgba(255, 59, 48, 0);
            }
            100% {
              transform: scale(0.95);
              box-shadow: 0 0 0 0 rgba(255, 59, 48, 0);
            }
          }
        `}
      </style>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-promo-btn"
        title={text}
      >
        <span className="promo-free-badge">FREE</span>
        <span className="promo-text">{text}</span>
      </a>
    </>
  );
};
