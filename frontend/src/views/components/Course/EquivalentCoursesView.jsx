// views/components/Course/EquivalentCoursesView.jsx
export const EquivalentCoursesView = ({ 
    equivalents, 
    selectedCourses, 
    onCourseToggle,
    isEditMode = false 
}) => {
    if (!equivalents || equivalents.length === 0) {
        return (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>Equivalent Courses</h2>
                <p>No equivalent courses found.</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Equivalent Courses</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {equivalents.map(course => {
                    const isSelected = selectedCourses.some(c => c.id === course.id);
                    return (
                        <li key={course.id} style={{ 
                            marginBottom: '10px', 
                            padding: '10px', 
                            border: '1px solid #eee', 
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#e3f2fd' : '#f9f9f9',
                            borderColor: isSelected ? '#2196f3' : '#eee'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{course.displayName}</strong>
                                    <br />
                                    <small style={{ color: '#666' }}>
                                        {course.institution_name} - {course.department_name}
                                    </small>
                                </div>
                                <button
                                    onClick={() => onCourseToggle(course)}
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
        </div>
    );
};