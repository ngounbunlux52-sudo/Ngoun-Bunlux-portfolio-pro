import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely filter out benign ResizeObserver loop limit errors and Vite HMR WebSocket errors
if (typeof window !== 'undefined') {
  const benignErrorKeywords = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'failed to connect to websocket',
    'WebSocket closed without opened',
    'websocket'
  ];

  window.addEventListener('error', (e) => {
    const errorMsg = e.message || '';
    if (benignErrorKeywords.some(keyword => errorMsg.toLowerCase().includes(keyword.toLowerCase()))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    const errorMsg = (e.reason && (e.reason.message || String(e.reason))) || '';
    if (benignErrorKeywords.some(keyword => errorMsg.toLowerCase().includes(keyword.toLowerCase()))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
