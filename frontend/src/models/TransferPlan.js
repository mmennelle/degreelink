// models/TransferPlan.js
export class TransferPlan {
    constructor(data = {}) {
        this.code = data.code || '';
        this.plan_name = data.plan_name || '';
        this.source_institution = data.source_institution || '';
        this.target_institution = data.target_institution || '';
        this.source_institution_id = data.source_institution_id || null;
        this.target_institution_id = data.target_institution_id || null;
        this.selected_courses = data.selected_courses || [];
        this.created_at = data.created_at || null;
        this.plan_data = data.plan_data || {};
    }

    static fromAPI(data) {
        const plan = new TransferPlan(data);
        plan.selected_courses = data.selected_courses.map(course => Course.fromAPI(course));
        return plan;
    }

    toAPI() {
        return {
            plan_name: this.plan_name,
            source_institution_id: this.source_institution_id,
            target_institution_id: this.target_institution_id,
            selected_courses: this.selected_courses.map(course => course.id),
            additional_data: {
                total_courses: this.selected_courses.length,
                created_by_user: true
            }
        };
    }

    validate() {
        const errors = [];
        if (!this.plan_name.trim()) {
            errors.push('Plan name is required');
        }
        if (!this.source_institution_id) {
            errors.push('Source institution is required');
        }
        if (!this.target_institution_id) {
            errors.push('Target institution is required');
        }
        if (this.selected_courses.length === 0) {
            errors.push('At least one course must be selected');
        }
        return errors;
    }

    get courseCount() {
        return this.selected_courses.length;
    }

    get transferPath() {
        return `${this.source_institution} → ${this.target_institution}`;
    }
}
