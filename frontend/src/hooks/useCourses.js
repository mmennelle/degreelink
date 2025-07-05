// hooks/useCourses.js
import { useState, useEffect } from 'react';
import { CourseController } from '../controllers/CourseController.js';

export const useCourses = (departmentId) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const controller = new CourseController();

    const loadCourses = async () => {
        if (!departmentId) {
            setCourses([]);
            return;
        }

        setLoading(true);
        setError(null);
        
        const result = await controller.getCoursesByDepartment(departmentId);
        
        if (result.success) {
            setCourses(result.data);
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    useEffect(() => {
        loadCourses();
    }, [departmentId]);

    return {
        courses,
        loading,
        error,
        reload: loadCourses
    };
};