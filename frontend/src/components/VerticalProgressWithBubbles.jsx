// VerticalProgressWithBubbles.jsx - Refactored to be a pure presentation component
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function VerticalProgressWithBubbles({
  title,
  percent = 0,
  requirements = [],
  color = 'blue',
  program = null,
  onAddCourse = null,
  plan = null,
  currentView = 'All Courses',
}) {
  const c = COLOR[color] || COLOR.blue;
  const barFrameRef = useRef(null);
  const shellRef = useRef(null);
  const [openBubbleKey, setOpenBubbleKey] = useState(null);
  const isMobile = useIsMobile();

  // Use the requirements as-is from parent (already processed and filtered)
  const displayRequirements = useMemo(() => {
    console.log('VerticalProgress received requirements:', requirements.length, 'items for view:', currentView);
    console.log('Requirements data:', requirements.map(r => ({ 
      name: r.name, 
      category: r.category, 
      completed: r.completedCredits, 
      total: r.totalCredits 
    })));
    // Return requirements as-is since parent handles all processing
    return requirements || [];
  }, [requirements, currentView]);

  // Use percent exactly as passed from parent
  const displayPercent = useMemo(() => {
    console.log(`Progress for ${title}: ${percent}% (provided by parent)`);
    return percent || 0;
  }, [percent, title]);

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
      
      // Generate gradient color based on fill percentage
      const getGradientColor = (percent) => {
        const normalizedPercent = Math.max(0, Math.min(100, percent));
        const red = Math.round(255 * (1 - normalizedPercent / 100));
        const green = Math.round(255 * (normalizedPercent / 100));
        const blue = 0;
        
        return {
          backgroundColor: `rgb(${red}, ${green}, ${blue})`
        };
      };

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
        fillStyle: getGradientColor(fillPercent),
        trackClass: 'bg-gray-200 dark:bg-gray-700',
        initials, 
        side, 
        mid 
      };
    });
  }, []);

  // Lock page scroll when mobile sheet is open
  useEffect(() => {
    if (!isMobile || !openBubbleKey) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isMobile, openBubbleKey]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpenBubbleKey(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ---------- PORTAL HELPERS ----------
  const DesktopPopoverPortal = ({ seg, children }) => {
    const [rect, setRect] = useState(null);
    useEffect(() => {
      const update = () => setRect(barFrameRef.current?.getBoundingClientRect() || null);
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      };
    }, [barFrameRef, seg?.id]);

    if (!rect) return null;
    const gap = 8;
    const top = rect.top + (seg.mid / 100) * rect.height;
    const leftBase = seg.side === 'left' ? (rect.left - gap) : (rect.right + gap);
    const transform = seg.side === 'left' ? 'translate(-100%, -50%)' : 'translate(0, -50%)';

    return createPortal(
      <>
        <button
          aria-label="Close popover"
          onClick={() => setOpenBubbleKey(null)}
          className="fixed inset-0 z-[998] bg-transparent"
        />
        <div
          role="dialog"
          aria-modal="false"
          className="fixed z-[999] w-80 max-w-[85vw] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl"
          style={{
            top,
            left: leftBase,
            transform,
            maxHeight: 'min(70vh, 560px)',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxHeight: 'inherit', overflowY: 'auto' }}>
            {children}
          </div>
        </div>
      </>,
      document.body
    );
  };

  const MobileSheetPortal = ({ children }) => {
    const [vh, setVh] = React.useState(() =>
      typeof window !== 'undefined'
        ? (window.visualViewport?.height || window.innerHeight)
        : 800
    );

    React.useEffect(() => {
      const update = () => {
        const h = window.visualViewport?.height || window.innerHeight;
        setVh(h);
      };
      update();
      window.addEventListener('resize', update);
      window.addEventListener('orientationchange', update);
      window.visualViewport?.addEventListener('resize', update);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('orientationchange', update);
        window.visualViewport?.removeEventListener('resize', update);
      };
    }, []);

    const sheetMaxPx = Math.round(vh * 0.88);

    return createPortal(
      <>
        <button
          aria-label="Close panel"
          onClick={() => setOpenBubbleKey(null)}
          className="fixed inset-0 z-[1098] bg-black/50 backdrop-blur-[1px]"
        />
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-x-0 bottom-0 z-[1099] rounded-t-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl pt-3 pb-4 px-4"
          style={{
            maxHeight: `${sheetMaxPx}px`,
            height: 'auto',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
            overflow: 'hidden',
            overscrollBehavior: 'contain',
          }}
        >
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div style={{ maxHeight: 'inherit', overflowY: 'auto' }}>
            {children}
          </div>
        </div>
      </>,
      document.body
    );
  };

  const titleColor = (COLOR[color] || COLOR.blue).title;

  return (
    <section className="flex flex-col items-center gap-2 sm:gap-3 select-none w-full max-w-full" ref={shellRef}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className={`text-sm font-semibold text-center ${titleColor}`}>
          {title}
        </h3>
      </div>

      {/* BAR FRAME - Single view, no carousel */}
      <div
        className="relative h-80 w-28 sm:h-80 sm:w-28 mx-1 sm:mx-2 border-2 border-gray-300 dark:border-gray-900 rounded-md overflow-hidden"
        ref={barFrameRef}
        aria-label={`${title} progress`}
        role="group"
      >
        {/* Progress percentage label */}
        <div className="absolute -right-5 -top-7 translate-x-full">
          <div className="px-2 py-1 text-xs rounded-lg bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100 shadow-lg font-medium">
            {Math.round(displayPercent)}%
          </div>
        </div>

        {/* Single view segments */}
        {buildSegments(displayRequirements).map((seg, index) => {
          const segKey = `${seg.id}-single`;
          const isOpen = openBubbleKey === segKey;
          const segments = buildSegments(displayRequirements);
          
          return (
            <div key={segKey} className="relative w-full" style={{ height: `${seg.height}%` }}>
              {/* Track */}
              <div className={`absolute inset-0 ${seg.trackClass} ${index === 0 ? 'rounded-t-sm' : ''} ${index === segments.length - 1 ? 'rounded-b-sm' : ''}`} />
              
              {/* Fill */}
              <div
                className={`absolute bottom-0 left-0 w-full ${index === 0 ? 'rounded-t-sm' : ''} ${index === segments.length - 1 ? 'rounded-b-sm' : ''}`}
                style={{
                  height: `${seg.fillPercent}%`,
                  transition: 'height .25s ease',
                  ...seg.fillStyle
                }}
              />
              
              {/* Divider */}
              {index < segments.length - 1 && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-400 dark:bg-black z-10" />
              )}
              
              {/* Label */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <span
                  className="uppercase font-bold text-xs text-white drop-shadow-sm"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {seg.initials}
                </span>
              </div>
              
              {/* Click target */}
              <button
                type="button"
                onClick={() => setOpenBubbleKey(isOpen ? null : segKey)}
                aria-expanded={isOpen ? 'true' : 'false'}
                aria-label={`${seg.requirement.name} requirement (${seg.requirement.status})`}
                className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 z-30"
              />

              {/* POPOVER via PORTAL */}
              {isOpen && (
                isMobile ? (
                  <MobileSheetPortal>
                    <RequirementDetails
                      requirement={seg.requirement}
                      onClose={() => setOpenBubbleKey(null)}
                      onAddCourse={onAddCourse}
                      plan={plan}
                      compact
                    />
                  </MobileSheetPortal>
                ) : (
                  <DesktopPopoverPortal seg={seg}>
                    <RequirementDetails
                      requirement={seg.requirement}
                      onClose={() => setOpenBubbleKey(null)}
                      onAddCourse={onAddCourse}
                      plan={plan}
                    />
                  </DesktopPopoverPortal>
                )
              )}
            </div>
          );
        })}
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
    description,
    programRequirement
  } = requirement;

  const requirementCourses = React.useMemo(() => {
    if (!plan?.courses) return [];
    return plan.courses.filter(pc => (pc.requirement_category || 'Uncategorized') === name);
  }, [plan?.courses, name]);

  const generateSuggestions = useCallback(async () => {
    if (!programRequirement || loadingSuggestions || !plan) return;
    setLoadingSuggestions(true);
    try {
      const out = [];
      if (programRequirement.requirement_type === 'grouped' && programRequirement.groups) {
        for (const group of programRequirement.groups) {
          if (!group.course_options) continue;
          for (const option of group.course_options) {
            try {
              const res = await fetch(`/api/courses?search=${encodeURIComponent(option.course_code)}&institution=${encodeURIComponent(option.institution || '')}`);
              if (res.ok) {
                const data = await res.json();
                const course = data.courses?.[0];
                if (course) {
                  out.push({
                    id: course.id, code: course.code, title: course.title, credits: course.credits,
                    institution: course.institution, description: course.description,
                    group_name: group.group_name, is_preferred: option.is_preferred, notes: option.notes,
                    requirement_category: name, detectedCategory: name
                  });
                }
              }
            } catch {}
          }
        }
      } else {
        const mappings = {
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
        const terms = Object.entries(mappings).find(([k]) => nameLower.includes(k))?.[1] || [name];
        try {
          const res = await fetch(`/api/courses?search=${encodeURIComponent(terms[0])}&per_page=8`);
          if (res.ok) {
            const data = await res.json();
            data.courses?.forEach(course => {
              out.push({
                id: course.id, code: course.code, title: course.title, credits: course.credits,
                institution: course.institution, description: course.description,
                requirement_category: name, is_preferred: false, detectedCategory: name
              });
            });
          }
        } catch {}
      }
      setSuggestions(out);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [programRequirement, loadingSuggestions, name, plan]);

  const getStatusChip = (status) => {
    switch (status) {
     case 'met':
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    case 'part':
    return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };
  const getStatusText = (s) => (s === 'met' ? 'Complete' : s === 'part' ? 'In Progress' : 'Not Started');

  const badgeByCourseStatus = (status) => {
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
    <div className="p-4 overflow-y-auto" style={{ maxHeight: 'inherit' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChip(requirement.status)}`}>
              {getStatusText(requirement.status)}
            </span>
            {totalCredits ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {(completedCredits ?? 0)}/{totalCredits} credits
              </span>
            ) : null}
          </div>
          {description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{description}</p>}
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

      {/* Current Courses */}
      {plan?.courses && (
        <div className="mb-2">
          <button
            onClick={() => setShowCourses(v => !v)}
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
              {requirementCourses.map((pc) => (
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
                    <span className={`px-2 py-1 text-xs rounded border ${badgeByCourseStatus(pc.status)}`}>
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
            onClick={() => {
              if (!showSuggestions && suggestions.length === 0) generateSuggestions();
              setShowSuggestions(v => !v);
            }}
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