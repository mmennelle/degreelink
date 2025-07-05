// controllers/CourseController.js
import { Course } from '../models/Course.js';
import { ApiService } from '../services/api.js';

export class CourseController {
    constructor() {
        this.apiService = new ApiService();
    }

    async getCoursesByDepartment(departmentId) {
        try {
            const response = await this.apiService.get(`/courses?department_id=${departmentId}`);
            return {
                success: true,
                data: response.data.map(course => Course.fromAPI(course))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getCourseEquivalents(courseId) {
        try {
            const response = await this.apiService.get(`/equivalents?course_id=${courseId}`);
            return {
                success: true,
                data: response.data.map(course => Course.fromAPI(course))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async searchCourses(query, institutionId = null, departmentId = null) {
        try {
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (institutionId) params.append('institution_id', institutionId);
            if (departmentId) params.append('department_id', departmentId);

            const response = await this.apiService.get(`/courses/search?${params}`);
            return {
                success: true,
                data: response.data.map(course => Course.fromAPI(course))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    toggleCourseSelection(course, selectedCourses, setSelectedCourses) {
        const isSelected = selectedCourses.some(c => c.id === course.id);
        if (isSelected) {
            setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
        } else {
            setSelectedCourses([...selectedCourses, course]);
        }
    }
}