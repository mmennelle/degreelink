import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Expose selected env vars for debugging (non-production safeguard)
if (import.meta.env.MODE !== 'production' && typeof window !== 'undefined') {
  window.__APP_ENV__ = {
    VITE_API_BASE: import.meta.env.VITE_API_BASE,
    VITE_ADMIN_API_TOKEN: import.meta.env.VITE_ADMIN_API_TOKEN ? '[set]' : undefined,
    MODE: import.meta.env.MODE
  };
  // eslint-disable-next-line no-console
  console.info('[env] window.__APP_ENV__ =', window.__APP_ENV__);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)