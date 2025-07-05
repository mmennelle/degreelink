// controllers/InstitutionController.js
import { Institution } from '../models/Institution.js';
import { ApiService } from '../services/api.js';

export class InstitutionController {
    constructor() {
        this.apiService = new ApiService();
    }

    async getAllInstitutions() {
        try {
            const response = await this.apiService.get('/institutions');
            return {
                success: true,
                data: response.data.map(inst => Institution.fromAPI(inst))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getInstitution(id) {
        try {
            const response = await this.apiService.get(`/institutions/${id}`);
            return {
                success: true,
                data: Institution.fromAPI(response.data)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async createInstitution(institutionData) {
        try {
            const institution = new Institution(institutionData);
            const validationErrors = institution.validate();
            
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    errors: validationErrors
                };
            }

            const response = await this.apiService.post('/institutions', institution.toAPI());
            return {
                success: true,
                data: Institution.fromAPI(response.data),
                message: 'Institution created successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}