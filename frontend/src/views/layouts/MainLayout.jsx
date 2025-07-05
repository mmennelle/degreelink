// views/layouts/MainLayout.jsx
import React from 'react';
import unoLogo from '../../assets/uno-logo.avif';
import delgadoLogo from '../../assets/delgado-logo.jpg';

export const MainLayout = ({ children }) => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }}>
      {/* Header with Logos */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 0'
      }}>
        {/* Left Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={unoLogo} 
            alt="University of New Orleans" 
            style={{ 
              height: '60px', 
              maxWidth: '200px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div 
            style={{ 
              display: 'none',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            UNO
          </div>
        </div>

        {/* Center Title */}
        <h1 style={{ 
          color: '#333', 
          margin: '0',
          textAlign: 'center',
          flex: 1,
          fontSize: '24px'
        }}>
          Course Equivalency Finder
        </h1>

        {/* Right Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={delgadoLogo} 
            alt="Delgado Community College" 
            style={{ 
              height: '60px', 
              maxWidth: '200px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div 
            style={{ 
              display: 'none',
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Delgado CC
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div style={{ 
        borderBottom: '10px solid #00402a', 
        marginBottom: '20px' 
      }}></div>

      {children}
    </div>
  );
};