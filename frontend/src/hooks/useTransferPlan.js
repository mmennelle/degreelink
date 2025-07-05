// hooks/useTransferPlan.js
import { useState } from 'react';
import { TransferPlanController } from '../controllers/TransferPlanController.js';
import { Course } from '../models/Course.js';

export const useTransferPlan = () => {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [planName, setPlanName] = useState('');
    const [sourceInstitution, setSourceInstitution] = useState('');
    const [targetInstitution, setTargetInstitution] = useState('');
    const [loadedPlan, setLoadedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const controller = new TransferPlanController();

    const toggleCourseSelection = (course) => {
        const courseModel = course instanceof Course ? course : Course.fromAPI(course);
        const isSelected = selectedCourses.some(c => c.id === courseModel.id);
        
        if (isSelected) {
            setSelectedCourses(selectedCourses.filter(c => c.id !== courseModel.id));
        } else {
            setSelectedCourses([...selectedCourses, courseModel]);
        }
    };

    const createPlan = async () => {
        setLoading(true);
        setError(null);
        
        const planData = {
            plan_name: planName,
            source_institution_id: sourceInstitution,
            target_institution_id: targetInstitution,
            selected_courses: selectedCourses
        };
        
        const result = await controller.createTransferPlan(planData);
        setLoading(false);
        
        return result;
    };

    const loadPlan = async (planCode) => {
        setLoading(true);
        setError(null);
        
        const result = await controller.getTransferPlan(planCode);
        
        if (result.success) {
            const plan = result.data;
            setLoadedPlan(plan);
            setPlanName(plan.plan_name);
            setSourceInstitution(plan.source_institution_id);
            setTargetInstitution(plan.target_institution_id);
            setSelectedCourses(plan.selected_courses);
        } else {
            setError(result.error);
        }
        
        setLoading(false);
        return result;
    };

    const updatePlan = async (planCode) => {
        setLoading(true);
        setError(null);
        
        const planData = {
            plan_name: planName,
            source_institution_id: sourceInstitution,
            target_institution_id: targetInstitution,
            selected_courses: selectedCourses
        };
        
        const result = await controller.updateTransferPlan(planCode, planData);
        
        if (result.success) {
            setLoadedPlan(result.data);
        }
        
        setLoading(false);
        return result;
    };

    const deletePlan = async (planCode) => {
        setLoading(true);
        setError(null);
        
        const result = await controller.deleteTransferPlan(planCode);
        
        if (result.success) {
            resetPlan();
        }
        
        setLoading(false);
        return result;
    };

    const resetPlan = () => {
        setSelectedCourses([]);
        setPlanName('');
        setSourceInstitution('');
        setTargetInstitution('');
        setLoadedPlan(null);
        setError(null);
    };

    return {
        selectedCourses,
        planName,
        setPlanName,
        sourceInstitution,
        setSourceInstitution,
        targetInstitution,
        setTargetInstitution,
        loadedPlan,
        loading,
        error,
        toggleCourseSelection,
        createPlan,
        loadPlan,
        updatePlan,
        deletePlan,
        resetPlan
    };
};
