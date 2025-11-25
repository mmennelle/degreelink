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

export function usePrograms(externalPrograms) {
  const [internalPrograms, setInternalPrograms] = useState([]);

  // Choose source (prefer external if provided and non-empty)
  const programs = (externalPrograms && externalPrograms.length > 0)
    ? externalPrograms
    : internalPrograms;

  useEffect(() => {
    // If caller passed programs (non-empty) we skip fetching entirely
    if (externalPrograms && externalPrograms.length > 0) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await api.getPrograms();
        if (!cancelled) setInternalPrograms(res.programs || []);
      } catch (e) {
        // optional: could expose error state later
      }
    })();
    return () => { cancelled = true; };
    // We only care if the external array becomes populated; watching length avoids
    // identity-based loops if parent re-renders with a new [] reference.
  }, [externalPrograms?.length]);

  return { programs };
}
