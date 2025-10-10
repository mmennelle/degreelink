import React, { useEffect, useState } from 'react';
import api from '../services/api';

// Simple badge showing whether admin token is active; dev only
export default function AdminModeBadge() {
  const [active, setActive] = useState(!!api.adminToken);
  const [tokenLen, setTokenLen] = useState(api.adminToken ? api.adminToken.length : 0);

  useEffect(() => {
    const id = setInterval(() => {
      if (api.adminToken) {
        setActive(true);
        setTokenLen(api.adminToken.length);
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (import.meta.env.MODE === 'production') return null;

  return (
    <div className="fixed top-10 right-20 z-50 text-xs px-2 py-1 rounded-md font-medium shadow-sm select-none"
      style={{
        background: active ? 'linear-gradient(90deg,#2563eb,#1d4ed8)' : '#374151',
        color: 'white',
        opacity: 0.20
      }}
      title={active ? `Admin token active (len=${tokenLen})` : 'No admin token; protected actions will 401'}
    >
      {active ? 'TOKEN' : 'NO TOKEN'}
    </div>
  );
}