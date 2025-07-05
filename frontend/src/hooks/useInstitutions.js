// hooks/useInstitutions.js
import { useState, useEffect } from 'react';
import { InstitutionController } from '../controllers/InstitutionController.js';

export const useInstitutions = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const controller = new InstitutionController();

    const loadInstitutions = async () => {
        setLoading(true);
        setError(null);
        
        const result = await controller.getAllInstitutions();
        
        if (result.success) {
            setInstitutions(result.data);
        } else {
            setError(result.error);
        }
        
        setLoading(false);
    };

    useEffect(() => {
        loadInstitutions();
    }, []);

    return {
        institutions,
        loading,
        error,
        reload: loadInstitutions
    };
};
