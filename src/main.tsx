import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackLabel="Ứng dụng HRM Soft - Lỗi khởi động">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
