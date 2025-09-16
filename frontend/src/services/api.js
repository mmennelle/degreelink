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
      const raw = await response.text();           // read once
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}
      if (!response.ok) {
        const msg = data?.error || data?.message || data?.detail || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(msg);
      }
      return data;
    }
    
    // Session Management Methods
    async getSessionStatus() {
      try {
        return await this.request('/plans/session/status');
      } catch (error) {
        // If session endpoint doesn't exist, return default
        return { has_access: false, plan_id: null };
      }
    }
    
    async clearPlanAccess() {
      try {
        return await this.request('/plans/session/clear', {
          method: 'POST'
        });
      } catch (error) {
        // If session clearing endpoint doesn't exist, clear client-side storage
        console.warn('Session clearing not available on server, clearing client-side only');
        return { success: true };
      }
    }
    
    async extendSession() {
      try {
        return await this.request('/plans/session/extend', {
          method: 'POST'
        });
      } catch (error) {
        console.warn('Session extension not available on server');
        return { success: false };
      }
    }
    
    // Plan Code Methods
    async getPlanByCode(planCode) {
      if (!planCode || planCode.length !== 8) {
        throw new Error('Plan code must be exactly 8 characters');
      }
      return this.request(`/plans/by-code/${planCode.toUpperCase()}`);
    }
    
    async verifyPlanCode(planCode) {
      if (!planCode || planCode.length !== 8) {
        throw new Error('Plan code must be exactly 8 characters');
      }
      return this.request(`/plans/verify-code/${planCode.toUpperCase()}`);
    }
    
    async addCourseToPlanByCode(planCode, courseData) {
      if (!planCode || planCode.length !== 8) {
        throw new Error('Plan code must be exactly 8 characters');
      }
      return this.request(`/plans/by-code/${planCode.toUpperCase()}/courses`, {
        method: 'POST',
        body: JSON.stringify(courseData)
      });
    }
    
    async deletePlanByCode(planCode) {
      if (!planCode || planCode.length !== 8) {
        throw new Error('Plan code must be exactly 8 characters');
      }
      return this.request(`/plans/by-code/${planCode.toUpperCase()}`, {
        method: 'DELETE'
      });
    }
    
    // Existing methods...
    async getPrograms(params = {}) {
      // Supports optional params: include_all (bool), semester, year
      const query = new URLSearchParams();
      if (params.include_all) query.set('include_all', 'true');
      if (params.semester) query.set('semester', params.semester);
      if (params.year) query.set('year', params.year);
      const qs = query.toString();
      return this.request(`/programs${qs ? `?${qs}` : ''}`);
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

    // Program version management
    async getProgramVersions(programId) {
      return this.request(`/programs/${programId}/versions`);
    }

    async setCurrentVersion(programId, semester, year) {
      return this.request(`/programs/${programId}/versions/set-current`, {
        method: 'PUT',
        body: JSON.stringify({ semester, year })
      });
    }

    async updateRequirement(programId, requirementId, data) {
      return this.request(`/programs/${programId}/requirements/${requirementId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }

    // Degree audit
    async getPlanAudit(planId) {
      return this.request(`/plans/${planId}/audit`);
    }

    async downloadPlanAudit(planId, format = 'csv') {
      const endpoint = `/plans/${planId}/degree-audit?format=${format}`;
      const response = await fetch(`${this.baseURL}${endpoint}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const blob = await response.blob();
      return blob;
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
      try {
        return await this.request(`/plans${queryString ? `?${queryString}` : ''}`);
      } catch (error) {
        // If plans endpoint returns 403 (no access), return empty list
        if (error.message.includes('403') || error.message.includes('Access denied')) {
          return { plans: [] };
        }
        throw error;
      }
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