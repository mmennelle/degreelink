import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * usePlans encapsulates plan list + selection + plan detail loading.
 * It can operate in controlled (external plans supplied) or uncontrolled mode.
 */
export function usePlans({ externalPlans, externalSelectedPlanId, externalSetSelectedPlanId, refreshTrigger }) {
  const [internalPlans, setInternalPlans] = useState([]);
  const [internalSelectedPlanId, setInternalSelectedPlanId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const plans = externalPlans !== undefined ? externalPlans : internalPlans;
  const selectedPlanId = externalSelectedPlanId !== undefined ? externalSelectedPlanId : internalSelectedPlanId;
  const setSelectedPlanId = externalSetSelectedPlanId || setInternalSelectedPlanId;

  const loadPlans = useCallback(async () => {
    if (externalPlans !== undefined) return; // controlled
    setLoading(true);
    setError(null);
    try {
      const sessionStatus = await api.getSessionStatus();
      if (sessionStatus.has_access && sessionStatus.plan_id) {
        try {
          const planData = await api.getPlan(sessionStatus.plan_id);
          setInternalPlans([planData]);
          if (!internalSelectedPlanId) setInternalSelectedPlanId(planData.id);
        } catch {
          setInternalPlans([]);
          setInternalSelectedPlanId(null);
        }
      } else {
        setInternalPlans([]);
        setInternalSelectedPlanId(null);
      }
    } catch (e) {
      setInternalPlans([]);
      setInternalSelectedPlanId(null);
      setError('Unable to access plans. Use a plan code to access your plan.');
    } finally {
      setLoading(false);
    }
  }, [externalPlans, internalSelectedPlanId]);

  const loadPlanDetails = useCallback(async (planId) => {
    if (!planId) { setSelectedPlan(null); return; }
    setLoading(true);
    setError(null);
    try {
      const planData = await api.getPlan(planId);
      setSelectedPlan(planData);
    } catch (e) {
      setError('Failed to load plan details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlan = useCallback(async (plan) => {
    await api.deletePlan(plan.id);
    if (externalPlans && externalSetSelectedPlanId) {
      if (selectedPlanId === plan.id) externalSetSelectedPlanId(null);
    } else {
      setInternalPlans(prev => prev.filter(p => p.id !== plan.id));
      if (internalSelectedPlanId === plan.id) {
        setInternalSelectedPlanId(null);
        setSelectedPlan(null);
      }
    }
  }, [externalPlans, externalSetSelectedPlanId, selectedPlanId, internalSelectedPlanId]);

  useEffect(() => { loadPlans(); }, []); // initial
  useEffect(() => { if (selectedPlanId) loadPlanDetails(selectedPlanId); else setSelectedPlan(null); }, [selectedPlanId, refreshTrigger]);

  return {
    plans,
    selectedPlanId,
    setSelectedPlanId,
    selectedPlan,
    loading,
    error,
    reloadPlans: loadPlans,
    reloadPlan: loadPlanDetails,
    deletePlan,
    internalMode: externalPlans === undefined,
  };
}
