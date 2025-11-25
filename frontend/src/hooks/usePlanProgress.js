/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

export function usePlanProgress(planId, viewFilter, refreshTrigger) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!planId) { setProgress(null); return; }
      setLoading(true);
      try {
        const data = await api.getPlanProgress(planId, viewFilter);
        if (!alive) return;
        setProgress({
          current: data.current || { percent: 0, requirements: [] },
          transfer: data.transfer || { percent: 0, requirements: [] }
        });
      } catch (e) {
        if (!alive) return;
        setProgress({ current: { percent: 0, requirements: [] }, transfer: { percent: 0, requirements: [] } });
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [planId, viewFilter, refreshTrigger]);

  return { progress, progressLoading: loading };
}
