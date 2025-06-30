import React from 'react';
import axios from 'axios';

const ImportSection = () => {
  const handleImport = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.file;
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    
    try {
      const response = await axios.post("/api/import", formData);
      alert("Import complete: " + response.data.message);
      window.location.reload();
    } catch (error) {
      alert("Import failed: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
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
            backgroundColor: '#17a2b8',
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

export default ImportSection;