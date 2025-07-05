// models/Institution.js
export class Institution {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
    }

    static fromAPI(data) {
        return new Institution(data);
    }

    toAPI() {
        return {
            id: this.id,
            name: this.name
        };
    }

    validate() {
        const errors = [];
        if (!this.name.trim()) {
            errors.push('Institution name is required');
        }
        return errors;
    }

    async get(url, params = {}) {
        return this.client.get(url, { params });
    }

    async post(url, data = {}) {
        return this.client.post(url, data);
    }

    async put(url, data = {}) {
        return this.client.put(url, data);
    }

    async delete(url) {
        return this.client.delete(url);
    }

    async uploadFile(url, file) {
        const formData = new FormData();
        formData.append('file', file);
        
        return this.client.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}