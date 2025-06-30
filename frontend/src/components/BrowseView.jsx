import React from 'react';

const BrowseView = ({
  institutions,
  departments,
  courses,
  equivalents,
  expandedInstitution,
  setExpandedInstitution,
  expandedDepartment,
  setExpandedDepartment,
  selectedCourse,
  setSelectedCourse,
  selectedCourses,
  toggleCourseSelection,
  isEditMode,
  loadedPlan
}) => {
  return (
    <div>
      {isEditMode && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#e3f2fd', 
          border: '1px solid #2196f3', 
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
            🔧 Adding Courses to Existing Plan
          </h3>
          <p style={{ margin: '0', color: '#333' }}>
            You are editing "<strong>{loadedPlan?.plan_name}</strong>" (Code: {loadedPlan?.code}). 
            Add courses below and they will be included in your existing plan.
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Currently selected: {selectedCourses.length} courses
          </p>
        </div>
      )}
      
      <div>
        {institutions.map(inst => (
          <div key={inst.id} style={{ marginBottom: '10px' }}>
            <div
              style={{ cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => {
                setExpandedInstitution(inst.id === expandedInstitution ? null : inst.id);
                setExpandedDepartment(null);
                setSelectedCourse(null);
              }}
            >
              [{inst.id === expandedInstitution ? '-' : '+'}] {inst.name}
            </div>

            {inst.id === expandedInstitution && (
              <div style={{ marginLeft: '20px' }}>
                {departments.map(dept => (
                  <div key={dept.id}>
                    <div
                      style={{ cursor: 'pointer', fontStyle: 'italic' }}
                      onClick={() => {
                        setExpandedDepartment(dept.id === expandedDepartment ? null : dept.id);
                        setSelectedCourse(null);
                      }}
                    >
                      [{dept.id === expandedDepartment ? '-' : '+'}] {dept.name}
                    </div>

                    {dept.id === expandedDepartment && (
                      <div style={{ marginLeft: '20px' }}>
                        {courses.map(course => {
                          return (
                            <div
                              key={course.id}
                              style={{ 
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                margin: '2px 0'
                              }}
                              onClick={() => setSelectedCourse(course.id)}
                            >
                              <span>{course.code}: {course.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Equivalent Courses</h2>
          {equivalents.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {equivalents.map(e => {
                const isSelected = selectedCourses.some(c => c.id === e.id);
                return (
                  <li key={e.id} style={{ 
                    marginBottom: '10px', 
                    padding: '10px', 
                    border: '1px solid #eee', 
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#e3f2fd' : '#f9f9f9',
                    borderColor: isSelected ? '#2196f3' : '#eee'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{e.code}: {e.title}</strong>
                        <br />
                        <small style={{ color: '#666' }}>{e.institution_name} - {e.department_name}</small>
                      </div>
                      <button
                        onClick={() => toggleCourseSelection(e)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '14px',
                          backgroundColor: isSelected ? '#f44336' : '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {isSelected ? 'Remove from Plan' : `Add to ${isEditMode ? 'Existing' : ''} Plan`}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No equivalent courses found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowseView;