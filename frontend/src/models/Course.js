// models/Course.js
export class Course {
    constructor(data = {}) {
        this.id = data.id || null;
        this.code = data.code || '';
        this.title = data.title || '';
        this.department_id = data.department_id || null;
        this.institution_id = data.institution_id || null;
        this.department_name = data.department_name || '';
        this.institution_name = data.institution_name || '';
    }

    static fromAPI(data) {
        return new Course(data);
    }

    toAPI() {
        return {
            id: this.id,
            code: this.code,
            title: this.title,
            department_id: this.department_id,
            institution_id: this.institution_id
        };
    }

    validate() {
        const errors = [];
        if (!this.code.trim()) {
            errors.push('Course code is required');
        }
        if (!this.title.trim()) {
            errors.push('Course title is required');
        }
        if (!this.department_id) {
            errors.push('Department is required');
        }
        if (!this.institution_id) {
            errors.push('Institution is required');
        }
        return errors;
    }

    get displayName() {
        return `${this.code}: ${this.title}`;
    }
}
