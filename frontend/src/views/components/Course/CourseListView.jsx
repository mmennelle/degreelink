// views/components/Course/CourseListView.jsx
import React from 'react';

export const CourseListView = ({ 
    courses, 
    selectedCourses, 
    onCourseSelect, 
    onCourseToggle,
    isEditMode = false 
}) => {
    return (
        <div>
            {courses.length > 0 ? (
                <div style={{ marginLeft: '20px' }}>
                    {courses.map(course => (
                        <CourseItemView
                            key={course.id}
                            course={course}
                            isSelected={selectedCourses.some(c => c.id === course.id)}
                            onSelect={() => onCourseSelect(course)}
                            onToggle={() => onCourseToggle(course)}
                            isEditMode={isEditMode}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ marginLeft: '20px', fontStyle: 'italic', color: '#666' }}>
                    No courses found
                </div>
            )}
        </div>
    );
};
