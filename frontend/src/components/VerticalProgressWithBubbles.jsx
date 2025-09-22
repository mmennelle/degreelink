import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, X, Plus, BookOpen, AlertCircle, Target, ChevronDown, ChevronUp } from 'lucide-react';

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
    // Safari fallback
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
 * - percent: number (0..100)
 * - requirements: array of requirement objects from your backend
 * - color: 'blue' | 'violet' | 'emerald'
 * - program: program object with requirements and groups
 * - onAddCourse: function to handle adding courses to plan
 */
export default function VerticalProgressWithBubbles({
  title,
  percent = 0,
  requirements = [],
  color = 'blue',
  program = null,
  onAddCourse = null,
  plan = null
}) {
  const c = COLOR[color] || COLOR.blue;
  const barRef = useRef(null);
  const [openBubbleId, setOpenBubbleId] = useState(null);

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

  // Process requirements -> de-duplicate by category -> bubbles
  const bubbleReqs = useMemo(() => {
    if (!requirements.length) return [];
    return dedupeByCategory(requirements, program);
  }, [requirements, program]);

  /**
   * Assign the same amber colour to every requirement segment.  This helper
   * returns static classes for the filled and track portions so that all
   * segments share the same hue and are distinguishable only by their fill
   * percentage.
   */
  const getColorForName = useCallback(() => {
    return { fill: 'bg-amber-500', track: 'bg-indigo-900' };
  }, []);

  /**
   * Convert the list of requirements into an array of segments.  Each segment
   * occupies a proportion of the bar based on the total credits required
   * (with a fallback to equal sizing if totals are unavailable).  We also
   * compute the percentage completed within each segment and store the
   * midpoint of the segment for popover positioning.
   */

  function getRequirementInitials(name) {
    if (!name) return 'XX';
    // Common abbreviations
    const abbreviations = {
      'mathematics': 'MA',
      'math': 'MA',
      'english': 'EN',
      'composition': 'EN',
      'literature': 'LI',
      'humanities': 'HU',
      'biology': 'BI',
      'chemistry': 'CH',
      'physics': 'PH',
      'history': 'HI',
      'science': 'SC',
      'social science': 'SO',
      'social sciences': 'SO',
      'liberal arts': 'LA',
      'fine arts': 'FA',
      'core': 'CO',
      'elective': 'EL',
      'free elective': 'FE',
      'general education': 'GE'
    };
    const nameLower = name.toLowerCase();
    if (abbreviations[nameLower]) {
      return abbreviations[nameLower];
    }
    for (const [key, abbrev] of Object.entries(abbreviations)) {
      if (nameLower.includes(key)) {
        return abbrev;
      }
    }
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
  }

  const segments = useMemo(() => {
    const list = bubbleReqs;
    const n = list.length;
    if (!n) return [];
    
    // Compute the sum of credits; treat zero-credit requirements as 1 to
    // guarantee they receive space in the bar.
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
  }, [bubbleReqs, getColorForName]);

  // Whether the user is on a small device; determines popover behaviour
  const isMobile = useIsMobile();

  // Lock page scroll when any popover is open on mobile
  useEffect(() => {
    if (!isMobile || !openBubbleId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isMobile, openBubbleId]);

  // Close popover on outside click / ESC
  const onDoc = useCallback((e) => {
    if (!barRef.current) return;
    if (!barRef.current.contains(e.target)) setOpenBubbleId(null);
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

  const barColor = c.bar;
  const trackColor = c.track;
  const titleColor = c.title;

  return (
    <section className="flex flex-col items-center gap-3">
      <h3 className={`text-sm font-semibold text-center ${titleColor}`}>{title}</h3>

      <div 
        className="relative h-64 w-20 mx-2 border-2 border-gray-300 dark:border-gray-600 rounded-md overflow-hidden" 
        ref={barRef} 
        aria-label={`${title} progress`} 
        role="img"
      >
        {/* Overall percent label on top */}
        <div className="absolute -right-5 -top-7 translate-x-full">
          <div className="px-2 py-1 text-xs rounded-lg bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100 shadow-lg font-medium">
            {Math.round(clamp(percent, 0, 100))}%
          </div>
        </div>
        
        {/* Render segments representing each requirement */}
        {segments.map((seg, index) => (
          <div
            key={seg.id}
            className="relative w-full"
            style={{ height: `${seg.height}%` }}
          >
            {/* Track background */}
            <div className={`absolute inset-0 ${seg.trackClass} ${index === 0 ? 'rounded-t-sm' : ''} ${index === segments.length - 1 ? 'rounded-b-sm' : ''}`} />
            
            {/* Filled portion */}
            <div
              className={`absolute bottom-0 left-0 w-full ${seg.fillClass} ${index === 0 ? 'rounded-t-sm' : ''} ${index === segments.length - 1 ? 'rounded-b-sm' : ''}`}
              style={{ height: `${seg.fillPercent}%` }}
            />
            
            {/* Horizontal divider between segments (except for last segment) */}
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
              onClick={() => setOpenBubbleId(openBubbleId === seg.id ? null : seg.id)}
              aria-expanded={openBubbleId === seg.id ? 'true' : 'false'}
              aria-label={`${seg.requirement.name} requirement (${seg.requirement.status})`}
              className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 z-30"
            />
            
            {/* Popover for requirement details */}
            {openBubbleId === seg.id && (
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
                    aria-labelledby={`req-title-${seg.id}`}
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
  const creditsNeeded = Math.max(0, totalCredits - completedCredits);

  // Get courses from the plan that satisfy this requirement
  const requirementCourses = useMemo(() => {
    if (!plan?.courses) return [];
    return plan.courses.filter(planCourse => 
      (planCourse.requirement_category || 'Uncategorized') === name
    );
  }, [plan?.courses, name]);

  // Real course suggestions integration with your existing backend logic
  const generateSuggestions = useCallback(async () => {
    if (!programRequirement || loadingSuggestions || !plan) return;
    
    setLoadingSuggestions(true);
    try {
      const suggestions = [];
      
      if (programRequirement.requirement_type === 'grouped' && programRequirement.groups) {
        // Process grouped requirements - get actual course data
        for (const group of programRequirement.groups) {
          if (group.course_options) {
            for (const option of group.course_options) {
              try {
                // Search for the actual course by code
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
              } catch (err) {
                console.warn(`Failed to fetch course ${option.course_code}:`, err);
              }
            }
          }
        }
      } else {
        // For simple requirements, use course search with department/subject matching
        const searchTerms = [];
        
        // Map requirement categories to likely search terms
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
        
        // Find matching search terms
        const nameLower = name.toLowerCase();
        for (const [key, terms] of Object.entries(categoryMappings)) {
          if (nameLower.includes(key)) {
            searchTerms.push(...terms);
            break;
          }
        }
        
        // If no specific mapping, use the requirement name itself
        if (searchTerms.length === 0) {
          searchTerms.push(name);
        }
        
        // Search for courses using the first search term
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
        } catch (err) {
          console.warn(`Failed to search courses for ${name}:`, err);
        }
      }
      
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
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

  const getStatusText = (status) => {
    switch (status) {
      case 'met': return 'Complete';
      case 'part': return 'In Progress';
      default: return 'Not Started';
    }
  };

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
            {ratio && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {ratio} credits
              </span>
            )}
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
            <span>{Math.round((completedCredits / totalCredits) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300 bg-blue-600 dark:bg-blue-500"
              style={{ width: `${Math.min((completedCredits / totalCredits) * 100, 100)}%` }}
            />
          </div>
          {creditsNeeded > 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {creditsNeeded} more credits needed
            </p>
          )}
        </div>
      )}

      {/* View Current Courses Button */}
      {requirementCourses.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowCourses(!showCourses)}
            className="w-full flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <span className="flex items-center">
              <BookOpen size={14} className="mr-1" />
              Current Courses ({requirementCourses.length})
            </span>
            {showCourses ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showCourses && (
            <div className={`mt-3 space-y-2 ${compact ? '' : 'max-h-32 overflow-y-auto'}`}>
              {requirementCourses.map((planCourse) => (
                <div key={planCourse.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {planCourse.course.code}: {planCourse.course.title}
                      </h6>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {planCourse.credits || planCourse.course.credits} credits • {planCourse.course.institution}
                      </p>
                      {planCourse.semester && planCourse.year && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {planCourse.semester} {planCourse.year}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded border ${getStatusColor2(planCourse.status)}`}>
                      {planCourse.status === 'in_progress' ? 'In Progress' : 
                       planCourse.status === 'completed' ? 'Completed' : 'Planned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Course Suggestions */}
      {creditsNeeded > 0 && onAddCourse && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
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

              {suggestions.length > 4 && (
                <button className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-2 transition-colors">
                  View {suggestions.length - 4} more suggestions
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}