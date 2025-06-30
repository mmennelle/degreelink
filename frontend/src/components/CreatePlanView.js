import React from 'react';

const CreatePlanView = ({
  planName,
  setPlanName,
  sourceInstitution,
  setSourceInstitution,
  targetInstitution,
  setTargetInstitution,
  institutions,
  selectedCourses,
  toggleCourseSelection,
  createPlan,
  resetPlanCreation,
  planCode
}) => {
  return (
    <div>
      <h2>Create Transfer Plan</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Plan Name:</label>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter a name for your transfer plan"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Source Institution:</label>
            <select
              value={sourceInstitution}
              onChange={(e) => setSourceInstitution(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">Select source institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Target Institution:</label>
            <select
              value={targetInstitution}
              onChange={(e) => setTargetInstitution(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">Select target institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>Selected Courses ({selectedCourses.length}):</strong>
          {selectedCourses.length > 0 ? (
            <div style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
              {selectedCourses.map((course, index) => (
                <div key={course.id} style={{ padding: '5px', borderBottom: '1px solid #f0f0f0' }}>
                  <span>{course.code}: {course.title}</span>
                  <button
                    onClick={() => toggleCourseSelection(course)}
                    style={{
                      marginLeft: '10px',
                      padding: '2px 6px',
                      fontSize: '12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
              No courses selected. Go to "Browse Courses" to add courses to your plan.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={createPlan}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Create Plan
          </button>
          <button
            onClick={resetPlanCreation}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>

        {planCode && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
            <strong>Plan Created Successfully!</strong>
            <br />
            <span style={{ fontSize: '18px', fontFamily: 'monospace', backgroundColor: '#fff', padding: '5px', border: '1px solid #ddd', borderRadius: '3px' }}>
              {planCode}
            </span>
            <br />
            <small>Save this code to access your plan later. Plans are stored for 1 year.</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePlanView;