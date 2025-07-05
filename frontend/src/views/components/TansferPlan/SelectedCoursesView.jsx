// views/components/TransferPlan/SelectedCoursesView.jsx
export const SelectedCoursesView = ({ 
    selectedCourses, 
    onCourseRemove,
    showRemoveButtons = true 
}) => {
    if (selectedCourses.length === 0) {
        return (
            <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
                No courses selected. Go to "Browse Courses" to add courses to your plan.
            </p>
        );
    }

    return (
        <div style={{ 
            marginTop: '10px', 
            maxHeight: '200px', 
            overflowY: 'auto', 
            border: '1px solid #eee', 
            padding: '10px', 
            borderRadius: '4px' 
        }}>
            {selectedCourses.map((course, index) => (
                <div key={course.id} style={{ 
                    padding: '5px', 
                    borderBottom: index < selectedCourses.length - 1 ? '1px solid #f0f0f0' : 'none' 
                }}>
                    <span>{course.displayName}</span>
                    {showRemoveButtons && onCourseRemove && (
                        <button
                            onClick={() => onCourseRemove(course)}
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
                    )}
                </div>
            ))}
        </div>
    );
};