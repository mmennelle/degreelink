// views/components/Navigation/Navigation.jsx
import React from 'react';

export const Navigation = ({
  currentView,
  setCurrentView,
  isEditMode,
  loadedPlan,
  selectedCourses,
  searchCode,
  setSearchCode,
  onLoadPlan,
  onCancelEdit
}) => {
  return (
    <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
      {isEditMode && (
        <div style={{ 
          marginBottom: '10px', 
          padding: '8px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>🔧 EDIT MODE:</strong> Editing plan "{loadedPlan?.plan_name}" (Code: {loadedPlan?.code})
        </div>
      )}
      
      <button 
        onClick={() => setCurrentView('browse')}
        style={{ 
          marginRight: '10px', 
          padding: '8px 16px',
          backgroundColor: currentView === 'browse' ? '#293c7d' : '#f8f9fa',
          color: currentView === 'browse' ? 'white' : 'black',
          border: '1px solid #293c7d',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {isEditMode ? 'Browse Courses (Add to Plan)' : 'Browse Courses'}
      </button>
      
      <button 
        onClick={() => setCurrentView(isEditMode ? 'edit-plan' : 'create-plan')}
        style={{ 
          marginRight: '10px', 
          padding: '8px 16px',
          backgroundColor: (currentView === 'create-plan' || currentView === 'edit-plan') ? '#293c7d' : '#f8f9fa',
          color: (currentView === 'create-plan' || currentView === 'edit-plan') ? 'white' : 'black',
          border: '1px solid #293c7d',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {isEditMode ? `Edit Plan (${selectedCourses.length} courses selected)` : `Create Plan (${selectedCourses.length} courses selected)`}
      </button>
      
      {!isEditMode && (
        <>
          <input
            type="text"
            placeholder="Enter plan code"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
            style={{ 
              marginRight: '10px', 
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '120px'
            }}
          />
          <button 
            onClick={onLoadPlan}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#c4d600',
              color: 'black',
              border: '1px solid #c4d600',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Load Plan
          </button>
        </>
      )}
      
      {isEditMode && (
        <button 
          onClick={onCancelEdit}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: '1px solid #6c757d',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Cancel Edit
        </button>
      )}
    </div>
  );
};
