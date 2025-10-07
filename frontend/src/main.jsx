import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import api from './services/api'
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

// Append a cache-busting query param if provided (?v=123) to force fresh loads of dynamic imports, etc.
// Optional cache-bust query (?v=123) support for dev refreshes
const bust = new URLSearchParams(window.location.search).get('v');

// Ensure admin token initialized (belt-and-suspenders) after potential cache bust
if (!api.adminToken) {
  const envToken = import.meta.env.VITE_ADMIN_API_TOKEN;
  const storedToken = localStorage.getItem('VITE_ADMIN_API_TOKEN');
  if (envToken) {
    api.adminToken = envToken.trim();
  } else if (storedToken) {
    api.adminToken = storedToken.trim();
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)