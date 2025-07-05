// views/pages/CreatePlanPage.jsx
import React from 'react';
import { InstitutionSelectorView } from '../components/Institution/InstitutionSelectorView.jsx';
import { SelectedCoursesView } from '../components/TransferPlan/SelectedCoursesView.jsx';

export const CreatePlanPage = ({
  planName,
  setPlanName,
  sourceInstitution,
  setSourceInstitution,
  targetInstitution,
  setTargetInstitution,
  institutions,
  selectedCourses,
  onCourseToggle,
  onCreatePlan,
  onResetPlan,
  loading
}) => {
  return (
    <div>
      <h2>Create Transfer Plan</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
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
            onClick={onCreatePlan}
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
            {loading ? 'Creating...' : 'Create Plan'}
          </button>
          <button
            onClick={onResetPlan}
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
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};