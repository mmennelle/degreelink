// views/pages/BrowsePage.jsx - Refactored BrowseView
import React, { useState, useEffect } from 'react';
import { useInstitutions } from '../../hooks/useInstitutions.js';
import { useCourses } from '../../hooks/useCourses.js';
import { CourseController } from '../../controllers/CourseController.js';
import { CourseListView } from '../components/Course/CourseListView.jsx';
import { EquivalentCoursesView } from '../components/Course/EquivalentCoursesView.jsx';

export const BrowsePage = ({
    selectedCourses,
    onCourseToggle,
    isEditMode,
    loadedPlan
}) => {
    const { institutions } = useInstitutions();
    const [departments, setDepartments] = useState([]);
    const [expandedInstitution, setExpandedInstitution] = useState(null);
    const [expandedDepartment, setExpandedDepartment] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [equivalents, setEquivalents] = useState([]);
    
    const { courses } = useCourses(expandedDepartment);
    const courseController = new CourseController();

    useEffect(() => {
        if (expandedInstitution) {
            loadDepartments(expandedInstitution);
        } else {
            setDepartments([]);
            setExpandedDepartment(null);
            setSelectedCourse(null);
            setEquivalents([]);
        }
    }, [expandedInstitution]);

    useEffect(() => {
        if (!expandedDepartment) {
            setSelectedCourse(null);
            setEquivalents([]);
        }
    }, [expandedDepartment]);

    useEffect(() => {
        if (selectedCourse) {
            loadEquivalents(selectedCourse.id);
        } else {
            setEquivalents([]);
        }
    }, [selectedCourse]);

    const loadDepartments = async (institutionId) => {
        // Implementation would call department controller
        // For now, using direct API call as placeholder
        try {
            const response = await fetch(`/api/departments?institution_id=${institutionId}`);
            const data = await response.json();
            setDepartments(data.data || data);
        } catch (error) {
            console.error('Failed to load departments:', error);
        }
    };

    const loadEquivalents = async (courseId) => {
        const result = await courseController.getCourseEquivalents(courseId);
        if (result.success) {
            setEquivalents(result.data);
        }
    };

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
                                            <CourseListView
                                                courses={courses}
                                                selectedCourses={selectedCourses}
                                                onCourseSelect={setSelectedCourse}
                                                onCourseToggle={onCourseToggle}
                                                isEditMode={isEditMode}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedCourse && (
                <EquivalentCoursesView
                    equivalents={equivalents}
                    selectedCourses={selectedCourses}
                    onCourseToggle={onCourseToggle}
                    isEditMode={isEditMode}
                />
            )}
        </div>
    );
};