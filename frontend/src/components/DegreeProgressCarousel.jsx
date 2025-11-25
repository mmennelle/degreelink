/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProgressTracking from './ProgressTracking';
import { useCarouselDrag } from '../hooks/useCarouselDrag';

function ProgressSkeleton() {
  return (
    <div className="flex items-start justify-center gap-6 w-full animate-pulse">
      {[0,1].map(i => (
        <div key={i} className="flex flex-col items-center w-1/2 max-w-[160px] gap-3">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-40 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="space-y-1 w-full">
            {Array.from({length:4}).map((_,j)=>(<div key={j} className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded"/>))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DegreeProgressCarousel({
  selectedPlanId,
  selectedPlan,
  progress,
  progressLoading,
  getCurrentProgram,
  getTargetProgram,
  handleCourseSelect,
  onEditPlanCourse,
  overlayCloseTick,
  views,
  viewIndex,
  setViewIndex,
}) {
  const slides = useMemo(() => {
    if (!progress || !selectedPlan) return [];
    return views.map(viewName => {
      const currentData = progress.current || { percent: 0, requirements: [] };
      const transferData = progress.transfer || { percent: 0, requirements: [] };
      return {
        name: viewName,
        current: currentData,
        transfer: transferData,
      };
    });
  }, [progress, selectedPlan, views]);

  const { frameRef, trackStyle, go } = useCarouselDrag(viewIndex, setViewIndex, views.length);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;

  return (
    <div className="mt-4 px-2 sm:px-3 lg:px-4 py-3 sm:py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Degree Progress</h2>
        {progressLoading && <span className="text-xs text-gray-500 dark:text-gray-400">Loading…</span>}
      </div>

      {!selectedPlanId ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Create or select a plan to see progress.</div>
      ) : progressLoading && !progress ? (
        <ProgressSkeleton />
      ) : !progress ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">No progress data available.</div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {!isMobile && (
              <button onClick={() => go('prev')} aria-label="Previous view" className="p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{views[viewIndex]}</div>
            {!isMobile && (
              <button onClick={() => go('next')} aria-label="Next view" className="p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <ChevronRight size={18} />
              </button>
            )}
          </div>
          <div ref={frameRef} className="relative w-full touch-pan-y select-none cursor-grab active:cursor-grabbing" style={{ touchAction: 'pan-y pinch-zoom' }}>
            <div className="overflow-hidden w-full">
              <div className="flex w-full" style={trackStyle}>
                {slides.map(slide => (
                  <div key={slide.name} className="basis-full shrink-0">
                    <div className="flex items-start justify-center gap-3 sm:gap-6 lg:gap-8 w-full max-w-full px-1 sm:px-0">
                      <ProgressTracking
                        title={getCurrentProgram()?.institution || 'Current Program'}
                        percent={slide.current.percent}
                        requirements={slide.current.requirements}
                        color="blue"
                        program={getCurrentProgram()}
                        plan={selectedPlan}
                        onAddCourse={handleCourseSelect}
                        onEditPlanCourse={onEditPlanCourse}
                        overlayCloseTick={overlayCloseTick}
                        currentView={views[viewIndex]}
                      />
                      <ProgressTracking
                        title={getTargetProgram()?.institution || 'Transfer Program'}
                        percent={slide.transfer.percent}
                        requirements={slide.transfer.requirements}
                        color="violet"
                        program={getTargetProgram()}
                        plan={selectedPlan}
                        onAddCourse={handleCourseSelect}
                        onEditPlanCourse={onEditPlanCourse}
                        overlayCloseTick={overlayCloseTick}
                        currentView={views[viewIndex]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {views.map((v,i)=>(
              <button key={v} aria-label={`Go to ${v}`} onClick={()=>setViewIndex(i)} className={`h-1.5 rounded-full transition-all ${i===viewIndex? 'w-4 bg-gray-700 dark:bg-gray-200':'w-2 bg-gray-300 dark:bg-gray-600'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
