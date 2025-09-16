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

  // Process requirements to create bubbles for all requirement categories
  const bubbleReqs = useMemo(() => {
    if (!requirements.length) return [];
    
    return requirements.map(req => ({
      id: req.id || req.category || req.name,
      name: req.category || req.name || 'Unknown Requirement',
      status: req.status || (req.is_complete ? 'met' : 
                req.credits_completed > 0 ? 'part' : 'none'),
      completedCredits: req.credits_completed || req.completedCredits || 0,
      totalCredits: req.credits_required || req.totalCredits || 0,
      courses: req.courses || req.applied || [],
      description: req.description || '',
      requirement_type: req.requirement_type || 'simple',
      // Add program requirement data for suggestions
      programRequirement: program?.requirements?.find(pr => 
        pr.category === (req.category || req.name)
      ) || null
    }));
  }, [requirements, program]);

  // Position bubbles evenly along the bar, but ensure all are visible
  const positioned = useMemo(() => {
    const n = bubbleReqs.length;
    if (n === 0) return [];
    
    // For 1-3 bubbles, space them more naturally
    if (n <= 3) {
      return bubbleReqs.map((r, i) => {
        const positions = n === 1 ? [50] : n === 2 ? [30, 70] : [20, 50, 80];
        return { ...r, y: positions[i] };
      });
    }
    
    // For more bubbles, distribute evenly with padding
    return bubbleReqs.map((r, i) => {
      const pct = (i + 1) / (n + 1);
      return { ...r, y: clamp(pct * 100, 12, 88) };
    });
  }, [bubbleReqs]);

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

      <div className="relative h-64 w-12" ref={barRef} aria-label={`${title} progress`} role="img">
        {/* Track */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 rounded-full ${trackColor}`} 
          style={{ width: 8, height: '100%' }} 
        />

        {/* Fill */}
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: 8, height: `${clamp(percent, 0, 100)}%` }}
          aria-hidden="true"
        />

        {/* Percent label */}
        <div className="absolute -right-4 -top-4 translate-x-full">
          <div className="px-2 py-1 text-xs rounded-lg bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 shadow-lg font-medium">
            {Math.round(clamp(percent, 0, 100))}%
          </div>
        </div>

        {/* Requirement Bubbles */}
        {positioned.map((req) => (
          <RequirementBubble
            key={req.id}
            requirement={req}
            y={req.y}
            colorScheme={c}
            open={openBubbleId === req.id}
            onToggle={() => setOpenBubbleId(openBubbleId === req.id ? null : req.id)}
            onClose={() => setOpenBubbleId(null)}
            onAddCourse={onAddCourse}
            plan={plan}
          />
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <CheckCircle2 size={14} className={c.legend} />
        <span>requirement progress</span>
      </div>
    </section>
  );
}

function RequirementBubble({ 
  requirement, 
  y, 
  colorScheme, 
  open, 
  onToggle, 
  onClose, 
  onAddCourse,
  plan 
}) {
  const getBubbleColor = (status) => {
    switch (status) {
      case 'met': return colorScheme.bubble;
      case 'part': return colorScheme.bubblePartial;
      default: return colorScheme.bubbleNone;
    }
  };

  const getBubbleIcon = (status) => {
    switch (status) {
      case 'met': return <CheckCircle2 size={12} />;
      case 'part': return <AlertCircle size={12} />;
      default: return <Target size={12} />;
    }
  };

  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 z-10" 
      style={{ bottom: `${y}%` }}
    >
      {/* Bubble button */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open ? 'true' : 'false'}
        aria-label={`${requirement.name} requirement (${requirement.status})`}
        className={`relative h-7 w-7 rounded-full ring-2 shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${getBubbleColor(requirement.status)}`}
      >
        <div className="flex items-center justify-center">
          {getBubbleIcon(requirement.status)}
        </div>
      </button>

      {/* Popover */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-80 max-w-[85vw] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl animate-in slide-in-from-left-2 duration-200"
        >
          <RequirementDetails 
            requirement={requirement}
            onClose={onClose}
            onAddCourse={onAddCourse}
            plan={plan}
          />
        </div>
      )}
    </div>
  );
}

function RequirementDetails({ requirement, onClose, onAddCourse, plan }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  // Mock course suggestions based on requirement (integrate with your existing logic)
  const generateSuggestions = useCallback(async () => {
    if (!programRequirement || loadingSuggestions) return;
    
    setLoadingSuggestions(true);
    try {
      // This would integrate with your existing suggestion logic
      // For now, showing the structure you'd need
      const mockSuggestions = [];
      
      if (programRequirement.requirement_type === 'grouped' && programRequirement.groups) {
        programRequirement.groups.forEach(group => {
          if (group.course_options) {
            group.course_options.forEach(option => {
              mockSuggestions.push({
                id: `${group.id}-${option.course_code}`,
                code: option.course_code,
                title: `Sample Course Title for ${option.course_code}`,
                credits: 3,
                institution: option.institution || programRequirement.institution || 'University',
                group_name: group.group_name,
                is_preferred: option.is_preferred,
                notes: option.notes,
                requirement_category: name
              });
            });
          }
        });
      } else {
        // Generate suggestions for simple requirements
        // You'd integrate your existing course search/suggestion logic here
        const sampleCourses = [
          { code: 'ENG 101', title: 'English Composition I', credits: 3 },
          { code: 'ENG 102', title: 'English Composition II', credits: 3 },
          { code: 'LIT 201', title: 'Introduction to Literature', credits: 3 }
        ].filter(course => 
          name.toLowerCase().includes('english') || 
          name.toLowerCase().includes('composition') ||
          name.toLowerCase().includes('literature')
        );

        mockSuggestions.push(...sampleCourses.map(course => ({
          ...course,
          id: course.code,
          institution: 'University of New Orleans',
          requirement_category: name,
          is_preferred: false
        })));
      }
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [programRequirement, loadingSuggestions, name]);

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
        <button
          aria-label="Close details"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={18} />
        </button>
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

      {/* Applied Courses */}
      {courses.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <BookOpen size={14} className="mr-1" />
            Applied Courses ({courses.length})
          </h5>
          <ul className="space-y-1">
            {courses.slice(0, 3).map((course, index) => (
              <li key={index} className="text-xs bg-gray-50 dark:bg-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300">
                {typeof course === 'string' ? course : `${course.code || course.title || 'Unknown Course'}`}
              </li>
            ))}
            {courses.length > 3 && (
              <li className="text-xs text-gray-500 dark:text-gray-400 px-2">
                ...and {courses.length - 3} more
              </li>
            )}
          </ul>
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
                suggestions.slice(0, 4).map((course) => (
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