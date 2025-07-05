// views/pages/EditPlanPage.jsx
import React from 'react';
import { InstitutionSelectorView } from '../components/Institution/InstitutionSelectorView.jsx';
import { SelectedCoursesView } from '../components/TransferPlan/SelectedCoursesView.jsx';

export const EditPlanPage = ({
  planName,
  setPlanName,
  sourceInstitution,
  setSourceInstitution,
  targetInstitution,
  setTargetInstitution,
  institutions,
  selectedCourses,
  onCourseToggle,
  onUpdatePlan,
  onCancelEdit,
  onDeletePlan,
  loadedPlan,
  loading
}) => {
  return (
    <div>
      <h2>Edit Transfer Plan</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '6px', 
          border: '1px solid #ffeaa7' 
        }}>
          <strong>Editing Plan:</strong> {loadedPlan?.plan_name} (Code: {loadedPlan?.code})
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Plan Name:
          </label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter a name for your transfer plan"
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc', 
              borderRadius: '4px' 
            }}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <InstitutionSelectorView
            institutions={institutions}
            value={sourceInstitution}
            onChange={setSourceInstitution}
            label="Source Institution"
            placeholder="Select source institution"
          />

          <InstitutionSelectorView
            institutions={institutions}
            value={targetInstitution}
            onChange={setTargetInstitution}
            label="Target Institution"
            placeholder="Select target institution"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>Selected Courses ({selectedCourses.length}):</strong>
          <SelectedCoursesView
            selectedCourses={selectedCourses}
            onCourseRemove={onCourseToggle}
            showRemoveButtons={true}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onUpdatePlan}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Updating...' : 'Update Plan'}
          </button>
          <button
            onClick={onCancelEdit}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onDeletePlan}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginLeft: 'auto'
            }}
          >
            Delete Plan
          </button>
        </div>
      </div>
    </div>
  );
};
