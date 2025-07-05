// views/pages/ViewPlanPage.jsx
import React from 'react';

export const ViewPlanPage = ({
  loadedPlan,
  onBackToBrowse,
  onStartEdit,
  onDeletePlan
}) => {
  if (!loadedPlan) {
    return (
      <div>
        <h2>Transfer Plan Details</h2>
        <p>No plan loaded.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Transfer Plan Details</h2>
      
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{loadedPlan.plan_name}</h3>
          <p style={{ margin: '5px 0', color: '#666' }}>
            <strong>Plan Code:</strong> 
            <span style={{ 
              fontFamily: 'monospace', 
              backgroundColor: '#fff', 
              padding: '3px 6px', 
              marginLeft: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '3px' 
            }}>
              {loadedPlan.code}
            </span>
          </p>
          <p style={{ margin: '5px 0', color: '#666' }}>
            <strong>Created:</strong> {new Date(loadedPlan.created_at).toLocaleDateString()}
          </p>
          <p style={{ margin: '5px 0', color: '#666' }}>
            <strong>Transfer Path:</strong> {loadedPlan.transferPath}
          </p>
        </div>

        <h4>Selected Courses ({loadedPlan.courseCount})</h4>
        
        {loadedPlan.selected_courses.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {loadedPlan.selected_courses.map((course, index) => (
              <div key={course.id} style={{ 
                padding: '15px', 
                border: '1px solid #e0e0e0', 
                borderRadius: '6px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ fontSize: '16px', color: '#333' }}>
                    {course.displayName}
                  </strong>
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {course.institution_name} - {course.department_name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontStyle: 'italic', color: '#666' }}>No courses in this plan.</p>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={onBackToBrowse}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Browse
          </button>
          <button
            onClick={onStartEdit}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Edit Plan
          </button>
          <button
            onClick={onDeletePlan}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete Plan
          </button>
        </div>
      </div>
    </div>
  );
};