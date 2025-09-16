import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, X } from 'lucide-react';

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// Static class map so Tailwind doesn't purge and we don't rely on template strings.
const COLOR = {
  blue: {
    bar: 'bg-blue-600',
    track: 'bg-blue-200 dark:bg-blue-900/40',
    bubble: 'bg-blue-600 text-white ring-blue-300 dark:ring-blue-800',
    title: 'text-blue-700 dark:text-blue-300',
    legend: 'text-blue-600',
  },
  violet: {
    bar: 'bg-violet-600',
    track: 'bg-violet-200 dark:bg-violet-900/40',
    bubble: 'bg-violet-600 text-white ring-violet-300 dark:ring-violet-800',
    title: 'text-violet-700 dark:text-violet-300',
    legend: 'text-violet-600',
  },
  emerald: {
    bar: 'bg-emerald-600',
    track: 'bg-emerald-200 dark:bg-emerald-900/40',
    bubble: 'bg-emerald-600 text-white ring-emerald-300 dark:ring-emerald-800',
    title: 'text-emerald-700 dark:text-emerald-300',
    legend: 'text-emerald-600',
  },
};

/**
 * Props:
 * - title: string
 * - percent: number (0..100)
 * - requirements: array of { id, name, status: 'met'|'part'|'none', completedCredits?, totalCredits?, courses?: string[] }
 * - color: 'blue' | 'violet' | 'emerald'
 */
export default function VerticalProgressWithBubbles({
  title,
  percent = 0,
  requirements = [],
  color = 'blue',
}) {
  const c = COLOR[color] || COLOR.blue;

  const barRef = useRef(null);
  const [openBubbleId, setOpenBubbleId] = useState(null);

  // Show bubbles for completed (and partial, if you like)
  const bubbleReqs = useMemo(
    () => requirements.filter((r) => r.status === 'met' || r.status === 'part'),
    [requirements]
  );

  // Evenly space bubbles along the bar
  const positioned = useMemo(() => {
    const n = bubbleReqs.length;
    if (n === 0) return [];
    return bubbleReqs.map((r, i) => {
      const pct = (i + 1) / (n + 1);
      return { ...r, y: clamp(pct * 100, 8, 92) };
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
  const bubbleColor = c.bubble;
  const titleColor = c.title;

  return (
    <section className="flex flex-col items-center gap-3">
      <h3 className={`text-sm font-semibold ${titleColor}`}>{title}</h3>

      <div className="relative h-64 w-10" ref={barRef} aria-label={`${title} progress`} role="img">
        {/* Track */}
        <div className={`absolute inset-x-1 left-1/2 -translate-x-1/2 rounded-full ${trackColor}`} style={{ width: 8, height: '100%' }} />

        {/* Fill */}
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-full ${barColor}`}
          style={{ width: 8, height: `${clamp(percent, 0, 100)}%` }}
          aria-hidden="true"
        />

        {/* Percent label */}
        <div className="absolute -right-3 -top-3 translate-x-full">
          <div className="px-2 py-1 text-xs rounded bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 shadow">
            {Math.round(clamp(percent, 0, 100))}%
          </div>
        </div>

        {/* Bubbles */}
        {positioned.map((req) => (
          <Bubble
            key={req.id}
            y={req.y}
            label={req.name}
            colorClass={bubbleColor}
            open={openBubbleId === req.id}
            onToggle={() => setOpenBubbleId(openBubbleId === req.id ? null : req.id)}
          >
            <RequirementDetails req={req} onClose={() => setOpenBubbleId(null)} />
          </Bubble>
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <CheckCircle2 size={14} className={COLOR[color]?.legend || COLOR.blue.legend} /> requirement complete
      </div>
    </section>
  );
}

function Bubble({ y, label, colorClass, open, onToggle, children }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: `${y}%` }}>
      {/* Bubble button */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open ? 'true' : 'false'}
        aria-label={`${label} (tap for details)`}
        className={`relative z-10 h-6 w-6 rounded-full ring-2 ${colorClass} shadow focus:outline-none focus-visible:ring-4`}
      >
        <span className="sr-only">{label}</span>
      </button>

      {/* Thought tail */}
      <div
        className="absolute -left-1 -bottom-3 h-3 w-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        aria-hidden="true"
      />

      {/* Popover */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-64 max-w-[70vw] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function RequirementDetails({ req, onClose }) {
  const { name, status, completedCredits, totalCredits, courses = [] } = req;
  const ratio = totalCredits ? `${completedCredits ?? 0}/${totalCredits}` : null;

  return (
    <div className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            Status: {status}
            {ratio ? ` • ${ratio} credits` : ''}
          </div>
        </div>
        <button
          aria-label="Close details"
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={16} />
        </button>
      </div>

      {courses.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Applied courses</div>
          <ul className="mt-1 text-xs text-gray-600 dark:text-gray-300 list-disc pl-4 space-y-0.5">
            {courses.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
