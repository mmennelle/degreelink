// views/components/Course/CourseItemView.jsx
export const CourseItemView = ({ 
    course, 
    isSelected, 
    onSelect, 
    onToggle, 
    isEditMode 
}) => {
    return (
        <div
            style={{ 
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                margin: '2px 0',
                backgroundColor: isSelected ? '#e3f2fd' : 'transparent'
            }}
            onClick={onSelect}
        >
            <span>{course.displayName}</span>
            {onToggle && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    style={{
                        marginLeft: '10px',
                        padding: '2px 6px',
                        fontSize: '12px',
                        backgroundColor: isSelected ? '#f44336' : '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                >
                    {isSelected ? 'Remove' : `Add to ${isEditMode ? 'Existing' : ''} Plan`}
                </button>
            )}
        </div>
    );
};