class ApiService {
    constructor() {
      this.baseURL = '/api';
    }
  
    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };
      
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    }
    
    async getPrograms() {
      return this.request('/programs');
    }
    
    async getProgram(id) {
      return this.request(`/programs/${id}`);
    }
    
    async getProgramRequirementSuggestions(programId, requirementId) {
      return this.request(`/programs/${programId}/requirements/${requirementId}/suggestions`);
    }
    
    async getPlanProgress(id) {
      return this.request(`/plans/${id}/progress`);
    }
    
    async uploadRequirements(file) {
      const formData = new FormData();
      formData.append('file', file);
      return this.request('/upload/requirements', {
        method: 'POST',
        headers: {}, 
        body: formData
      });
    }
  
    async healthCheck() {
      return this.request('/health');
    }
  
    async searchCourses(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/courses${queryString ? `?${queryString}` : ''}`);
    }
  
    async getCourse(id) {
      return this.request(`/courses/${id}`);
    }
  
    async createCourse(data) {
      return this.request('/courses', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  
    async updateCourse(id, data) {
      return this.request(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  
    async deleteCourse(id) {
      return this.request(`/courses/${id}`, {
        method: 'DELETE'
      });
    }
  
    async getPlans(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/plans${queryString ? `?${queryString}` : ''}`);
    }
  
    async getPlan(id) {
      return this.request(`/plans/${id}`);
    }
  
    async createPlan(data) {
      return this.request('/plans', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  
    async updatePlan(id, data) {
      return this.request(`/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  
    async deletePlan(id) {
      return this.request(`/plans/${id}`, {
        method: 'DELETE'
      });
    }
  
    async addCourseToPlan(planId, data) {
      return this.request(`/plans/${planId}/courses`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  
    async updatePlanCourse(planId, courseId, data) {
      return this.request(`/plans/${planId}/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  
    async removeCourseFromPlan(planId, courseId) {
      return this.request(`/plans/${planId}/courses/${courseId}`, {
        method: 'DELETE'
      });
    }
  
    async getEquivalencies(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/equivalencies${queryString ? `?${queryString}` : ''}`);
    }
  
    async createEquivalency(data) {
      return this.request('/equivalencies', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  
    async updateEquivalency(id, data) {
      return this.request(`/equivalencies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  
    async deleteEquivalency(id) {
      return this.request(`/equivalencies/${id}`, {
        method: 'DELETE'
      });
    }
  
    async uploadCourses(file) {
      const formData = new FormData();
      formData.append('file', file);
      return this.request('/upload/courses', {
        method: 'POST',
        headers: {}, 
        body: formData
      });
    }
  
    async uploadEquivalencies(file) {
      const formData = new FormData();
      formData.append('file', file);
      return this.request('/upload/equivalencies', {
        method: 'POST',
        headers: {}, 
        body: formData
      });
    }
}

const api = new ApiService();
export default api;