/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

class ApiService {
  constructor() {
    // Allow override via Vite env (e.g. VITE_API_BASE="http://127.0.0.1:5000/api")
    this.baseURL = import.meta?.env?.VITE_API_BASE || '/api';
    this.adminToken = import.meta?.env?.VITE_ADMIN_API_TOKEN || null;
    this.advisorToken = null; // Set after advisor login
    
    // Fallbacks: localStorage keys if env not injected
    if (!this.adminToken && typeof window !== 'undefined') {
      this.adminToken = window.localStorage.getItem('VITE_ADMIN_API_TOKEN')
        || window.localStorage.getItem('ADMIN_API_TOKEN')
        || window.localStorage.getItem('adminToken');
    }
    
    // Load advisor token from localStorage
    if (typeof window !== 'undefined') {
      this.advisorToken = window.localStorage.getItem('advisorToken');
    }
    
    if (!this.adminToken && import.meta?.env?.MODE !== 'production') {
      console.warn('[ApiService] Admin token not found at init (may be set later).');
    }

    // Expose for debugging in development
    if (import.meta?.env?.MODE !== 'production' && typeof window !== 'undefined') {
      window.__API_SERVICE__ = this;
    }
  }

  setAdvisorToken(token) {
    this.advisorToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        window.localStorage.setItem('advisorToken', token);
      } else {
        window.localStorage.removeItem('advisorToken');
      }
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const isFormData = options.body instanceof FormData;

    const headers = {
      // Only set JSON content type if NOT using FormData (browser will set correct multipart boundary)
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    // If we somehow initialized before env/localStorage was ready, try lazy refresh
    if (!this.adminToken && typeof window !== 'undefined') {
      const refreshed = window.localStorage.getItem('VITE_ADMIN_API_TOKEN')
        || window.localStorage.getItem('ADMIN_API_TOKEN')
        || window.localStorage.getItem('adminToken');
      if (refreshed) {
        this.adminToken = refreshed.trim();
        if (import.meta?.env?.MODE !== 'production') {
          console.info('[ApiService] Admin token lazily loaded at request time (length=' + this.adminToken.length + ')');
        }
      }
    }

    // Inject admin token if available and not explicitly disabled
    if (this.adminToken && !headers['X-Admin-Token']) {
      headers['X-Admin-Token'] = this.adminToken.trim();
    }
    
    // Inject advisor token if available
    if (this.advisorToken && !headers['X-Advisor-Token']) {
      headers['X-Advisor-Token'] = this.advisorToken.trim();
    }
    
    // Dev aid: warn if making a known protected mutation without token
    const method = (options.method || 'GET').toUpperCase();
    const protectedPatterns = [
      /\/upload\//,
      /\/courses$/,
      /\/courses\/\d+$/,
      /\/equivalencies/,
      /\/plans$/,
      // note: PUT /plans/:id is allowed with plan access session; don't blanket-require admin here
      /set-current/, /requirements\//
    ];
    const requiresAdmin = method !== 'GET' && protectedPatterns.some(r => r.test(endpoint));
    if (requiresAdmin && !this.adminToken) {
      console.warn('[ApiService] Missing admin token for protected request:', method, endpoint, '(no X-Admin-Token header will be sent)');
    } else if (requiresAdmin && this.adminToken && import.meta?.env?.MODE !== 'production') {
      // Light debug trace in dev
      console.debug('[ApiService] Protected request with admin token len=' + this.adminToken.length + ':', method, endpoint);
    }

    const config = {
      // Always include cookies; required for session-based plan access when VITE_API_BASE points to 5000
      credentials: 'include',
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    // Removed verbose post-fetch debug logging
    const raw = await response.text(); // read once
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch {}

    if (!response.ok) {
      // Server may return { error: { message, code } } or flat
      let msg = data?.error || data?.message || data?.detail || `HTTP ${response.status}: ${response.statusText}`;
      if (typeof msg === 'object') {
        msg = msg.message || msg.code || JSON.stringify(msg);
      }
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
    
    async updateProgram(id, data) {
      return this.request(`/programs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
    
    async deleteProgram(id) {
      return this.request(`/programs/${id}`, {
        method: 'DELETE'
      });
    }
    
    async getProgramRequirementSuggestions(programId, requirementId) {
      return this.request(`/programs/${programId}/requirements/${requirementId}/suggestions`);
    }
    
    // Plan progress with view filtering support
    async getPlanProgress(planId, viewFilter = 'All Courses') {
      const query = new URLSearchParams();
      if (viewFilter) query.set('view', viewFilter);
      return this.request(`/plans/${planId}/progress${query.toString() ? `?${query.toString()}` : ''}`);
    }
  
  async uploadRequirements(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload/requirements', {
      method: 'POST',
      // no manual content-type
      body: formData
    });
  }

  async previewRequirements(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload/requirements/preview', {
      method: 'POST',
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

    async getProgramRequirements(programId, semester, year) {
      const params = new URLSearchParams();
      if (semester) params.set('semester', semester);
      if (year) params.set('year', year);
      return this.request(`/programs/${programId}/requirements?${params.toString()}`);
    }

    async updateProgramRequirements(programId, semester, year, requirements) {
      return this.request(`/programs/${programId}/requirements/bulk`, {
        method: 'PUT',
        body: JSON.stringify({ semester, year, requirements })
      });
    }

    // Degree audit
    async getPlanAudit(planId) {
      return this.request(`/plans/${planId}/audit`);
    }

    async downloadPlanAudit(planId, format = 'csv') {
      const endpoint = `/plans/${planId}/degree-audit?format=${format}`;
  const response = await fetch(`${this.baseURL}${endpoint}`, { credentials: 'include' });
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
  
    //course addition with new fields
    async addCourseToPlan(planId, courseData) {
      try {
        return await this.request(`/plans/${planId}/courses`, {
          method: 'POST',
          body: JSON.stringify({
            course_id: courseData.course_id,
            semester: courseData.semester,
            year: courseData.year,
            status: courseData.status,
            requirement_category: courseData.requirement_category,
            requirement_group_id: courseData.requirement_group_id, 
            credits: courseData.credits, 
            grade: courseData.grade, 
            notes: courseData.notes
          })
        });
      } catch (error) {
        console.error('Error adding course to plan:', error);
        throw error;
      }
    }
  
    // Enhanced course update with new fields
    async updatePlanCourse(planId, courseId, data) {
      return this.request(`/plans/${planId}/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify({
          semester: data.semester,
          year: data.year,
          status: data.status,
          grade: data.grade,
          credits: data.credits, 
          requirement_category: data.requirement_category,
          requirement_group_id: data.requirement_group_id, 
          notes: data.notes
        })
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
      body: formData
    });
  }
  
  async previewCourses(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload/courses/preview', {
      method: 'POST',
      body: formData
    });
  }
  
  async uploadEquivalencies(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload/equivalencies', {
      method: 'POST',
      body: formData
    });
  }
  
  async previewEquivalencies(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload/equivalencies/preview', {
      method: 'POST',
      body: formData
    });
  }
  
  async uploadConstraints(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/upload/constraints', {
      method: 'POST',
      body: formData
    });
  }

  // Advisor Authentication Methods
  async requestAdvisorCode(email) {
    return this.request('/advisor-auth/request-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async verifyAdvisorCode(email, code, totp = '') {
    const response = await this.request('/advisor-auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code, totp })
    });
    
    // Store the token
    if (response.session_token) {
      this.setAdvisorToken(response.session_token);
    }
    
    return response;
  }

  async verifyAdvisorSession() {
    return this.request('/advisor-auth/verify-session');
  }

  async logoutAdvisor() {
    const response = await this.request('/advisor-auth/logout', {
      method: 'POST'
    });
    
    // Clear the token
    this.setAdvisorToken(null);
    
    return response;
  }

  async regenerateAdvisorTotp(email, code, totp) {
    return this.request('/advisor-auth/regenerate-totp', {
      method: 'POST',
      body: JSON.stringify({ email, code, totp })
    });
  }

  // Advisor Whitelist Management (Admin only)
  async getAdvisorWhitelist() {
    return this.request('/advisor-auth/whitelist');
  }

  async addAdvisorToWhitelist(email) {
    return this.request('/advisor-auth/whitelist', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async bulkAddAdvisorsToWhitelist(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/advisor-auth/whitelist/bulk', {
      method: 'POST',
      body: formData
    });
  }

  async removeAdvisorFromWhitelist(advisorId) {
    return this.request(`/advisor-auth/whitelist/${advisorId}`, {
      method: 'DELETE'
    });
  }

  // Advisor Center - Get plans associated with advisor
  async getAdvisorPlans(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.program_id) queryParams.append('program_id', params.program_id);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    
    const queryString = queryParams.toString();
    const endpoint = `/advisor-auth/advisor-center/plans${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {
      headers: {
        'X-Advisor-Session-Token': this.advisorToken
      }
    });
  }

  // Advisor Center - Get statistics
  async getAdvisorStats() {
    return this.request('/advisor-auth/advisor-center/stats', {
      headers: {
        'X-Advisor-Session-Token': this.advisorToken
      }
    });
  }
}

const api = new ApiService();
export default api;