// services/api.js
import axios from 'axios';

export class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: '/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Response interceptor to handle errors consistently
        this.client.interceptors.response.use(
            response => response.data,
            error => {
                const message = error.response?.data?.error || 
                               error.response?.data?.message || 
                               error.message || 
                               'An error occurred';
                throw new Error(message);
            }
        );
    }};