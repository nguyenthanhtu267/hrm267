import React from 'react';
import { CompanyPolicy } from '../types/hrm';

interface FloatingBannerProps {
  policy: CompanyPolicy;
}

export const FloatingBanner: React.FC<FloatingBannerProps> = ({ policy }) => {
  // If explicitly disabled in admin, don't show
  if (policy.promoBannerEnabled === false) return null;

  const link = policy.promoBannerLink || 'https://tuyendungvieclam.vercel.app/';
  const text = policy.promoBannerText || 'Đăng Tuyển Dụng';

  return (
    <>
      <style>
        {`
          .app-side-widget {
            position: fixed;
            top: 55%;
            right: 0;
            transform: translateY(-50%);
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 12px 6px;
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
            width: 32px;
          }

          .app-side-widget:hover {
            padding-right: 10px;
            background: linear-gradient(135deg, #2a5298 0%, #1e3c72 100%);
          }

          .app-side-widget .app-side-text {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-weight: bold;
            font-size: 11px;
            letter-spacing: 0px;
            margin-top: 8px;
          }

          .app-side-badge {
            background-color: #ff3b30;
            color: white;
            font-size: 9px;
            font-weight: 900;
            padding: 2px 4px;
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
          
          /* Responsive (Co giãn theo điện thoại/tablet) */
          @media (max-width: 768px) {
            .app-side-widget {
              padding: 10px 6px;
              top: 60%;
            }
            .app-side-widget:hover {
              padding-right: 10px;
            }
            .app-side-widget .app-side-text {
              font-size: 12px;
              margin-top: 6px;
            }
            .app-side-badge {
              font-size: 9px;
              padding: 2px 4px;
            }
          }
        `}
      </style>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="app-side-widget"
        title={text}
      >
        <span className="app-side-badge">FREE</span>
        <span className="app-side-text">{text}</span>
      </a>
    </>
  );
};
