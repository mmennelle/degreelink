// views/components/Import/ImportSection.jsx
import React from 'react';
import { ApiService } from '../../../services/api.js';

export const ImportSection = () => {
  const apiService = new ApiService();

  const handleImport = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.file;
    
    if (!fileInput.files[0]) {
      alert('Please select a file');
      return;
    }
    
    try {
      const response = await apiService.uploadFile('/import', fileInput.files[0]);
      alert(`Import complete: ${response.message}`);
      window.location.reload();
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      marginBottom: '30px', 
      padding: '15px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px', 
      border: '1px solid #e9ecef' 
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>Import Course Data</h3>
      <form onSubmit={handleImport} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input 
          type="file" 
          name="file" 
          accept=".csv" 
          style={{ flex: 1 }}
        />
        <button 
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#c4d600',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Import CSV
        </button>
      </form>
      <small style={{ color: '#6c757d', marginTop: '5px', display: 'block' }}>
        Upload a CSV file with course equivalencies to populate the database.
      </small>
    </div>
  );
};