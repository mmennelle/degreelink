// controllers/TransferPlanController.js
import { TransferPlan } from '../models/TransferPlan.js';
import { ApiService } from '../services/api.js';

export class TransferPlanController {
    constructor() {
        this.apiService = new ApiService();
    }

    async createTransferPlan(planData) {
        try {
            const plan = new TransferPlan(planData);
            const validationErrors = plan.validate();
            
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    errors: validationErrors
                };
            }

            const response = await this.apiService.post('/create-plan', plan.toAPI());
            return {
                success: true,
                data: response.data,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getTransferPlan(planCode) {
        try {
            const response = await this.apiService.get(`/get-plan/${planCode}`);
            return {
                success: true,
                data: TransferPlan.fromAPI(response.data.plan)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateTransferPlan(planCode, planData) {
        try {
            const plan = new TransferPlan(planData);
            const validationErrors = plan.validate();
            
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    errors: validationErrors
                };
            }

            const response = await this.apiService.put(`/update-plan/${planCode}`, plan.toAPI());
            return {
                success: true,
                data: TransferPlan.fromAPI(response.data.plan),
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteTransferPlan(planCode) {
        try {
            const response = await this.apiService.delete(`/delete-plan/${planCode}`);
            return {
                success: true,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    validatePlanCode(code) {
        if (!code || code.trim().length !== 8) {
            return { valid: false, error: 'Plan code must be exactly 8 characters' };
        }
        return { valid: true };
    }
}
