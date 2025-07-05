// models/Department.js
export class Department {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.institution_id = data.institution_id || null;
        this.institution_name = data.institution_name || '';
    }

    static fromAPI(data) {
        return new Department(data);
    }

    toAPI() {
        return {
            id: this.id,
            name: this.name,
            institution_id: this.institution_id
        };
    }

    validate() {
        const errors = [];
        if (!this.name.trim()) {
            errors.push('Department name is required');
        }
        if (!this.institution_id) {
            errors.push('Institution is required');
        }
        return errors;
    }
}
