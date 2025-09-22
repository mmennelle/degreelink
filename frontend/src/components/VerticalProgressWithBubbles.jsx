// VerticalProgressWithBubbles.jsx
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, X, Plus, BookOpen, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// Static class map for consistent styling
const COLOR = {
  blue: {
    bar: 'bg-blue-600 dark:bg-blue-500',
    track: 'bg-blue-200 dark:bg-blue-900/40',
    bubble: 'bg-blue-600 text-white ring-blue-300 dark:ring-blue-700 hover:bg-blue-700',
    bubblePartial: 'bg-yellow-500 text-white ring-yellow-300 dark:ring-yellow-700 hover:bg-yellow-600',
    bubbleNone: 'bg-gray-400 text-white ring-gray-300 dark:ring-gray-600 hover:bg-gray-500',
    title: 'text-blue-700 dark:text-blue-300',
    legend: 'text-blue-600 dark:text-blue-400',
  },
  violet: {
    bar: 'bg-violet-600 dark:bg-violet-500',
    track: 'bg-violet-200 dark:bg-violet-900/40',
    bubble: 'bg-violet-600 text-white ring-violet-300 dark:ring-violet-700 hover:bg-violet-700',
    bubblePartial: 'bg-yellow-500 text-white ring-yellow-300 dark:ring-yellow-700 hover:bg-yellow-600',
    bubbleNone: 'bg-gray-400 text-white ring-gray-300 dark:ring-gray-600 hover:bg-gray-500',
    title: 'text-violet-700 dark:text-violet-300',
    legend: 'text-violet-600 dark:text-violet-400',
  },
  emerald: {
    bar: 'bg-emerald-600 dark:bg-emerald-500',
    track: 'bg-emerald-200 dark:bg-emerald-900/40',
    bubble: 'bg-emerald-600 text-white ring-emerald-300 dark:ring-emerald-700 hover:bg-emerald-700',
    bubblePartial: 'bg-yellow-500 text-white ring-yellow-300 dark:ring-yellow-700 hover:bg-yellow-600',
    bubbleNone: 'bg-gray-400 text-white ring-gray-300 dark:ring-gray-600 hover:bg-gray-500',
    title: 'text-emerald-700 dark:text-emerald-300',
    legend: 'text-emerald-600 dark:text-emerald-400',
  },
};

// Detect mobile layout (Tailwind 'sm' breakpoint)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener?.('change', handler);
    mq.addListener?.(handler);
    return () => {
      mq.removeEventListener?.('change', handler);
      mq.removeListener?.(handler);
    };
  }, []);
  return isMobile;
}

/**
 * Enhanced Vertical Progress with Academic Requirements
 * Props:
 * - title: string
 * - percent: number (0..100)  // used for All view label; recalculated per view for accuracy
 * - requirements: array of requirement objects
 * - color: 'blue' | 'violet' | 'emerald'
 * - program: program object
 * - plan: the selected plan (needed to compute view-specific progress)
 * - onAddCourse: callback
 * - enableCarousel: boolean
 * - views: array of strings, e.g., ['All Courses', 'Planned', 'In Progress', 'Completed']
 */
export default function VerticalProgressWithBubbles({
  title,
  percent = 0,
  requirements = [],
  color = 'blue',
  program = null,
  onAddCourse = null,
  plan = null,
  enableCarousel = false,
  views = ['All Courses', 'Planned', 'In Progress', 'Completed'],
}) {
  const c = COLOR[color] || COLOR.blue;
  const barFrameRef = useRef(null);     // the visible frame
  const shellRef = useRef(null);        // outer section for touch handlers
  const [openBubbleId, setOpenBubbleId] = useState(null);

  // carousel state
  const isMobile = useIsMobile();
  const [viewIndex, setViewIndex] = useState(0);

  const safeViews = views && views.length ? views : ['All Courses', 'Planned', 'In Progress', 'Completed'];

  const go = useCallback((dirOrIndex) => {
    setOpenBubbleId(null); // close popovers when moving views
    setViewIndex((i) => {
      if (typeof dirOrIndex === 'number') return clamp(dirOrIndex, 0, safeViews.length - 1);
      const n = safeViews.length;
      return (i + (dirOrIndex === 'next' ? 1 : -1) + n) % n;
    });
  }, [safeViews.length]);

  // swipe/drag handling for mobile
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    if (!enableCarousel || !isMobile || !shellRef.current) return;
    const el = shellRef.current;

    let startX = 0, startY = 0, dx = 0, dy = 0, tracking = false;

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY; dx = 0; dy = 0;
      tracking = true;
      setDragging(true);
      setDragX(0);
    };

    const onTouchMove = (e) => {
      if (!tracking) return;
      const t = e.touches[0];
      dx = t.clientX - startX;
      dy = t.clientY - startY;
      // horizontal intent with some vertical forgiveness
      if (Math.abs(dx) > Math.abs(dy) * 1.3) {
        setDragX(dx);
      }
    };

    const onTouchEnd = () => {
      if (!tracking) return;
      tracking = false;
      const frame = barFrameRef.current;
      const width = frame ? frame.clientWidth : 1;
      const threshold = width * 0.25; // swipe threshold
      const next = dx < -threshold;
      const prev = dx > threshold;
      setDragging(false);
      setDragX(0);
      if (next) go('next');
      else if (prev) go('prev');
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [enableCarousel, isMobile, go]);

  // --- De-duplication helpers (category-level) ---
  const catKey = (s) => (s || 'Uncategorized').trim().toLowerCase();

  const mergeReq = (a, b) => {
    const totalA = a.totalCredits ?? a.credits_required ?? 0;
    const totalB = b.totalCredits ?? b.credits_required ?? 0;
    const doneA  = a.completedCredits ?? a.credits_completed ?? 0;
    const doneB  = b.completedCredits ?? b.credits_completed ?? 0;
    const maxTotal = Math.max(totalA, totalB);
    const maxDone  = Math.max(doneA, doneB);

    return {
      ...a,
      name: a.name || b.name,
      description: a.description || b.description,
      requirement_type: a.requirement_type || b.requirement_type,
      totalCredits: maxTotal,
      credits_required: maxTotal,
      completedCredits: maxDone,
      credits_completed: maxDone,
      courses: Array.from(new Set([...(a.courses || []), ...(b.courses || [])])),
      status: (() => {
        if (maxTotal <= 0) return 'none';
        if (maxDone >= maxTotal) return 'met';
        return maxDone > 0 ? 'part' : 'none';
      })(),
    };
  };

  const dedupeByCategory = (list = [], program = null) => {
    const byKey = new Map();
    for (const req of list) {
      const key = catKey(req.category || req.name);
      const base = {
        id: req.id || key,
        name: req.category || req.name || 'Unknown Requirement',
        status: req.status || (req.is_complete ? 'met' :
                (req.credits_completed || req.completedCredits || 0) > 0 ? 'part' : 'none'),
        completedCredits: req.credits_completed || req.completedCredits || 0,
        totalCredits: req.credits_required || req.totalCredits || 0,
        courses: req.courses || req.applied || [],
        description: req.description || '',
        requirement_type: req.requirement_type || 'simple',
        programRequirement: program?.requirements?.find(
          pr => (pr.category || pr.name) === (req.category || req.name)
        ) || null,
      };
      if (!byKey.has(key)) {
        byKey.set(key, base);
      } else {
        byKey.set(key, mergeReq(byKey.get(key), base));
      }
    }
    return Array.from(byKey.values());
  };

  // Base, de-duped requirements (as provided by backend = "All Courses" snapshot)
  const baseReqs = useMemo(() => {
    return dedupeByCategory(requirements || [], program);
  }, [requirements, program]);

  // Recompute requirement completion based on a filtered view of plan.courses
  const computeReqsForView = useCallback((which) => {
    if (!plan?.courses || !baseReqs.length) return baseReqs;

    const buckets = {};
    const allowed = (status) => {
      if (which === 'All Courses') return true;
      if (which === 'Planned') return status === 'planned';
      if (which === 'In Progress') return status === 'in_progress';
      if (which === 'Completed') return status === 'completed';
      return true;
    };

    for (const pc of plan.courses) {
      if (!allowed(pc.status)) continue;
      const cat = pc.requirement_category || 'Uncategorized';
      const credits = pc.credits || pc.course?.credits || 0;
      buckets[cat] = (buckets[cat] || 0) + credits;
    }

    return baseReqs.map((req) => {
      const got = buckets[req.name] || 0;
      const need = req.totalCredits || 0;
      const status = need > 0 ? (got >= need ? 'met' : (got > 0 ? 'part' : 'none')) : 'none';
      return {
        ...req,
        completedCredits: got,
        credits_completed: got,
        status,
      };
    });
  }, [plan?.courses, baseReqs]);

  const computeOverallPercent = (reqs) => {
    let need = 0, got = 0;
    for (const r of reqs) {
      need += (r.totalCredits || 0);
      got  += Math.min(r.completedCredits || 0, r.totalCredits || 0);
    }
    if (need <= 0) return 0;
    return Math.min(Math.round((got / need) * 100), 100);
  };

  // Build per-view datasets once, so the track can render all slides
  const perViewData = useMemo(() => {
    return safeViews.map((v) => {
      const reqs = computeReqsForView(v);
      const percent = computeOverallPercent(reqs);
      return { name: v, reqs, percent };
    });
  }, [safeViews, computeReqsForView]);

  // Utility colors
  const getColorForName = useCallback(() => {
    return { fill: 'bg-amber-500', track: 'bg-indigo-900' };
  }, []);

  function getRequirementInitials(name) {
    if (!name) return 'XX';
    const abbreviations = {
      'mathematics': 'MATH', 'math': 'MATH', 'english': 'ENGL', 'composition': 'ENG-COMP',
      'literature': 'LIT', 'humanities': 'HUMS', 'biology': 'BIO', 'chemistry': 'CHEM',
      'physics': 'PHYS', 'history': 'HIST', 'science': 'SCI', 'social science': 'SOC-SCI',
      'social sciences': 'SOC-SCI', 'liberal arts': 'LIB-ART', 'fine arts': 'FA', 'core': 'CORE',
      'elective': 'ELEC', 'free elective': 'FR-ELEC', 'general education': 'GEN-ED'
    };
    const nameLower = name.toLowerCase();
    if (abbreviations[nameLower]) return abbreviations[nameLower];
    for (const [key, abbrev] of Object.entries(abbreviations)) {
      if (nameLower.includes(key)) return abbrev;
    }
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return words.slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
  }

  // Build segments for a given requirement list
  const buildSegments = useCallback((reqList) => {
    const list = reqList || [];
    const n = list.length;
    if (!n) return [];

    let sumCredits = 0;
    list.forEach((req) => {
      const tot = req.totalCredits ?? req.credits_required ?? 0;
      sumCredits += (tot > 0 ? tot : 1);
    });

    let cumulative = 0;
    return list.map((req, index) => {
      const tot = req.totalCredits ?? req.credits_required ?? 0;
      const segValue = (tot > 0 ? tot : 1);
      const segHeight = sumCredits > 0 ? (segValue / sumCredits) * 100 : (100 / n);
      const completed = req.completedCredits ?? req.credits_completed ?? 0;
      const fillPercent = tot > 0 ? Math.min((completed / tot) * 100, 100) : 0;
      const colors = getColorForName(req.name || req.category || '');
      const initials = getRequirementInitials(req.name || req.category || '');
      const side = index % 2 === 0 ? 'left' : 'right';
      const start = cumulative;
      const mid = start + segHeight / 2;
      cumulative += segHeight;

      return {
        requirement: req,
        id: req.id || req.name || index,
        height: segHeight,
        fillPercent,
        fillClass: colors.fill,
        trackClass: colors.track,
        initials,
        side,
        mid
      };
    });
  }, [getColorForName]);

  // Accessibility: lock page scroll when a popover is open on mobile
  useEffect(() => {
    if (!isMobile || !openBubbleId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isMobile, openBubbleId]);

  // Close popover on outside click / ESC
  const onDoc = useCallback((e) => {
    if (!barFrameRef.current) return;
    if (!barFrameRef.current.contains(e.target)) setOpenBubbleId(null);
  }, []);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpenBubbleId(null);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onDoc]);

  const titleColor = (COLOR[color] || COLOR.blue).title;

  // --- RENDER ---
  // Track translation (animate unless actively dragging)
  const slideStyle = (() => {
    const basePct = -(viewIndex * 100);
    // Convert dragX pixels to percentage relative to frame width
    const frame = barFrameRef.current;
    const width = frame ? frame.clientWidth || 1 : 1;
    const dragPct = dragging ? (dragX / width) * 100 : 0;
    const tx = basePct + dragPct;
    return {
      transform: `translateX(${tx}%)`,
      transition: dragging ? 'none' : 'transform 300ms ease',
      willChange: 'transform',
    };
  })();

  return (
    <section className="flex flex-col items-center gap-3 select-none" ref={shellRef}>
      {/* Header with carousel controls */}
      <div className="flex items-center gap-2">
        {enableCarousel && !isMobile && (
          <button
            type="button"
            onClick={() => go('prev')}
            aria-label="Previous view"
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft size={18}/>
          </button>
        )}
        <h3 className={`text-sm font-semibold text-center ${titleColor}`}>
          {title}
          {enableCarousel && (
            <span className="text-gray-500 dark:text-gray-400"> • {safeViews[viewIndex]}</span>
          )}
        </h3>
        {enableCarousel && !isMobile && (
          <button
            type="button"
            onClick={() => go('next')}
            aria-label="Next view"
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <ChevronRight size={18}/>
          </button>
        )}
      </div>

      {/* Mobile edge-peek to hint more content */}
      {enableCarousel && isMobile && safeViews.length > 1 && (
        <div className="relative w-full h-0">
          <div className="absolute right-0 -top-2 translate-x-1/4 text-[10px] text-gray-400 select-none">
            {safeViews[(viewIndex + 1) % safeViews.length].split(' ')[0]} ›
          </div>
        </div>
      )}

      {/* BAR FRAME (visible window) */}
      <div
        className="relative h-64 w-20 mx-2 border-2 border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
        ref={barFrameRef}
        aria-label={`${title} ${safeViews[viewIndex]} progress`}
        role="group"
      >
        {/* SLIDE TRACK */}
        <div
          className="absolute inset-0 flex"
          style={slideStyle}
        >
          {perViewData.map(({ name: viewName, reqs, percent: viewPct }, slideIdx) => {
            const segments = buildSegments(reqs);
            return (
              <div key={viewName} className="shrink-0 grow-0 basis-full relative">
                {/* Per-view percent label */}
                <div className="absolute -right-5 -top-7 translate-x-full">
                  <div className="px-2 py-1 text-xs rounded-lg bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100 shadow-lg font-medium">
                    {Math.round(clamp(viewPct, 0, 100))}%
                  </div>
                </div>

                {/* Render segments representing each requirement */}
                {segments.map((seg, index) => (
                  <div
                    key={`${seg.id}-${slideIdx}`}
                    className="relative w-full"
                    style={{ height: `${seg.height}%` }}
                  >
                    {/* Track background */}
                    <div className={`absolute inset-0 ${seg.trackClass} ${index === 0 ? 'rounded-t-sm' : ''} ${index === segments.length - 1 ? 'rounded-b-sm' : ''}`} />

                    {/* Filled portion */}
                    <div
                      className={`absolute bottom-0 left-0 w-full ${seg.fillClass} ${index === 0 ? 'rounded-t-sm' : ''} ${index === segments.length - 1 ? 'rounded-b-sm' : ''}`}
                      style={{ height: `${seg.fillPercent}%`, transition: 'height .25s ease' }}
                    />

                    {/* Horizontal divider between segments */}
                    {index < segments.length - 1 && (
                      <div className="absolute bottom-0 left-0 w-full h-px bg-gray-400 dark:bg-gray-500 z-10" />
                    )}

                    {/* Abbreviation label overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <span
                        className="uppercase font-bold text-xs text-white drop-shadow-sm"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                      >
                        {seg.initials}
                      </span>
                    </div>

                    {/* Clickable area to toggle popover */}
                    <button
                      type="button"
                      onClick={() => setOpenBubbleId(openBubbleId === `${seg.id}-${slideIdx}` ? null : `${seg.id}-${slideIdx}`)}
                      aria-expanded={openBubbleId === `${seg.id}-${slideIdx}` ? 'true' : 'false'}
                      aria-label={`${seg.requirement.name} requirement (${seg.requirement.status})`}
                      className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 z-30"
                    />

                    {/* Popover for requirement details */}
                    {openBubbleId === `${seg.id}-${slideIdx}` && (
                      isMobile ? (
                        <>
                          {/* Backdrop */}
                          <button
                            aria-label="Close panel"
                            onClick={() => setOpenBubbleId(null)}
                            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[1px]"
                          />
                          {/* Sheet */}
                          <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={`req-title-${seg.id}-${slideIdx}`}
                            className="fixed inset-x-0 bottom-0 z-[70] rounded-t-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl pt-3 pb-4 px-4"
                          >
                            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <RequirementDetails
                              requirement={seg.requirement}
                              onClose={() => setOpenBubbleId(null)}
                              onAddCourse={onAddCourse}
                              plan={plan}
                              compact
                            />
                            <button onClick={() => setOpenBubbleId(null)} className="sr-only">
                              Close
                            </button>
                          </div>
                        </>
                      ) : (
                        <div
                          role="dialog"
                          aria-modal="false"
                          className={`absolute z-50 w-80 max-w-[85vw] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl ${
                            seg.side === 'left' ? 'right-full mr-2' : 'left-full ml-2'
                          }`}
                          style={{
                            top: `${seg.mid}%`,
                            transform: 'translateY(-50%)',
                            opacity: 1,
                            visibility: 'visible'
                          }}
                        >
                          <RequirementDetails
                            requirement={seg.requirement}
                            onClose={() => setOpenBubbleId(null)}
                            onAddCourse={onAddCourse}
                            plan={plan}
                          />
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Desktop arrow overlays (inside frame so layout doesn’t jump) */}
        {enableCarousel && !isMobile && (
          <>
            <button
              type="button"
              onClick={() => go('prev')}
              className="absolute left-[-36px] top-1/2 -translate-y-1/2 p-1 rounded-md bg-white/70 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              aria-label="Previous"
              title="Previous"
            >
              <ChevronLeft size={16}/>
            </button>
            <button
              type="button"
              onClick={() => go('next')}
              className="absolute right-[-36px] top-1/2 -translate-y-1/2 p-1 rounded-md bg-white/70 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              aria-label="Next"
              title="Next"
            >
              <ChevronRight size={16}/>
            </button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {enableCarousel && (
        <div className="flex items-center gap-1 mt-1">
          {safeViews.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to ${safeViews[i]}`}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${i === viewIndex ? 'w-4 bg-gray-700 dark:bg-gray-200' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
        <CheckCircle2 size={14} className={c.legend} />
        <span>requirement progress</span>
      </div>
    </section>
  );
}

function RequirementDetails({ requirement, onClose, onAddCourse, plan, compact = false }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const {
    name,
    status,
    completedCredits,
    totalCredits,
    courses = [],
    description,
    programRequirement
  } = requirement;

  const ratio = totalCredits ? `${completedCredits ?? 0}/${totalCredits}` : null;
  const creditsNeeded = Math.max(0, totalCredits - (completedCredits ?? 0));

  const requirementCourses = useMemo(() => {
    if (!plan?.courses) return [];
    return plan.courses.filter(planCourse =>
      (planCourse.requirement_category || 'Uncategorized') === name
    );
  }, [plan?.courses, name]);

  const generateSuggestions = useCallback(async () => {
    if (!programRequirement || loadingSuggestions || !plan) return;

    setLoadingSuggestions(true);
    try {
      const suggestions = [];

      if (programRequirement.requirement_type === 'grouped' && programRequirement.groups) {
        for (const group of programRequirement.groups) {
          if (group.course_options) {
            for (const option of group.course_options) {
              try {
                const courseSearchResponse = await fetch(`/api/courses?search=${encodeURIComponent(option.course_code)}&institution=${encodeURIComponent(option.institution || '')}`);
                if (courseSearchResponse.ok) {
                  const courseData = await courseSearchResponse.json();
                  const course = courseData.courses && courseData.courses.length > 0 ? courseData.courses[0] : null;

                  if (course) {
                    suggestions.push({
                      id: course.id,
                      code: course.code,
                      title: course.title,
                      credits: course.credits,
                      institution: course.institution,
                      description: course.description,
                      group_name: group.group_name,
                      is_preferred: option.is_preferred,
                      notes: option.notes,
                      requirement_category: name,
                      detectedCategory: name
                    });
                  }
                }
              } catch {/* ignore */}
            }
          }
        }
      } else {
        const searchTerms = [];
        const categoryMappings = {
          'english': ['ENG', 'ENGL', 'composition', 'writing'],
          'composition': ['ENG', 'ENGL', 'composition', 'writing'],
          'literature': ['ENG', 'ENGL', 'LIT', 'literature'],
          'mathematics': ['MATH', 'mathematics', 'calculus', 'algebra'],
          'math': ['MATH', 'mathematics', 'calculus', 'algebra'],
          'biology': ['BIOL', 'BIO', 'biology', 'life science'],
          'chemistry': ['CHEM', 'chemistry'],
          'physics': ['PHYS', 'physics'],
          'history': ['HIST', 'history'],
          'science': ['BIOL', 'CHEM', 'PHYS', 'science'],
          'social': ['SOC', 'PSY', 'POLI', 'social'],
          'humanities': ['ENG', 'HIST', 'PHIL', 'ART', 'humanities']
        };
        const nameLower = name.toLowerCase();
        for (const [key, terms] of Object.entries(categoryMappings)) {
          if (nameLower.includes(key)) { searchTerms.push(...terms); break; }
        }
        if (searchTerms.length === 0) searchTerms.push(name);

        try {
          const searchResponse = await fetch(`/api/courses?search=${encodeURIComponent(searchTerms[0])}&per_page=8`);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.courses) {
              searchData.courses.forEach(course => {
                suggestions.push({
                  id: course.id,
                  code: course.code,
                  title: course.title,
                  credits: course.credits,
                  institution: course.institution,
                  description: course.description,
                  requirement_category: name,
                  is_preferred: false,
                  detectedCategory: name
                });
              });
            }
          }
        } catch {/* ignore */}
      }

      setSuggestions(suggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [programRequirement, loadingSuggestions, name, plan]);

  const handleShowSuggestions = () => {
    if (!showSuggestions && suggestions.length === 0) {
      generateSuggestions();
    }
    setShowSuggestions(!showSuggestions);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'met':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'part':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };
  const getStatusText = (status) => (status === 'met' ? 'Complete' : status === 'part' ? 'In Progress' : 'Not Started');

  const getStatusColor2 = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'in_progress':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'planned':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div className="p-4 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </span>
            {totalCredits ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {(completedCredits ?? 0)}/{totalCredits} credits
              </span>
            ) : null}
          </div>
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            aria-label="Close details"
            onClick={onClose}
            className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${compact ? 'hidden sm:inline-flex' : ''}`}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Progress Details */}
      {totalCredits > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Credits Progress</span>
            <span>{Math.round(((completedCredits ?? 0) / totalCredits) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-blue-600 dark:bg-blue-500"
              style={{ width: `${Math.min(((completedCredits ?? 0) / totalCredits) * 100, 100)}%` }}
            />
          </div>
          {Math.max(0, totalCredits - (completedCredits ?? 0)) > 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {Math.max(0, totalCredits - (completedCredits ?? 0))} more credits needed
            </p>
          )}
        </div>
      )}

      {/* Current Courses Toggle */}
      {plan?.courses && (
        <div className="mb-2">
          <button
            onClick={() => setShowCourses(!showCourses)}
            className="w-full flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <span className="flex items-center">
              <BookOpen size={14} className="mr-1" />
              Current Courses
            </span>
            {showCourses ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showCourses && (
            <div className={`mt-3 space-y-2 ${compact ? '' : 'max-h-32 overflow-y-auto'}`}>
              {(plan.courses || []).filter(pc => (pc.requirement_category || 'Uncategorized') === name).map((pc) => (
                <div key={pc.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {pc.course?.code}: {pc.course?.title}
                      </h6>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {(pc.credits || pc.course?.credits) ?? 0} credits • {pc.course?.institution}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded border ${getStatusColor2(pc.status)}`}>
                      {pc.status === 'in_progress' ? 'In Progress' : pc.status === 'completed' ? 'Completed' : 'Planned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {onAddCourse && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <button
            onClick={handleShowSuggestions}
            className="w-full flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <span className="flex items-center">
              <Plus size={14} className="mr-1" />
              Course Suggestions
            </span>
            {showSuggestions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showSuggestions && (
            <div className="mt-3 space-y-2">
              {loadingSuggestions ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading suggestions...</span>
                </div>
              ) : suggestions.length > 0 ? (
                (compact ? suggestions.slice(0, 3) : suggestions.slice(0, 4)).map((course) => (
                  <div key={course.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {course.code}: {course.title}
                        </h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {course.credits} credits • {course.institution}
                        </p>
                        {course.group_name && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {course.group_name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onAddCourse([{...course, detectedCategory: course.requirement_category}])}
                        className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/70 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                  No suggestions available for this requirement
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
