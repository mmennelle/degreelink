/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

// ProgressTracking.jsx - Pure presentation component (formerly VerticalProgressWithBubbles)
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { createPortal } from 'react-dom';
import { X, Plus, BookOpen, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

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

// Normalize requirement/category names to short, human-readable labels
const CATEGORY_DISPLAY_NAMES = {
	'english composition': 'English',
	'english': 'English',
	'composition': 'English',
	'literature': 'Literature',
	'math/analytical reasoning': 'Math',
	'mathematical reasoning': 'Math',
	'mathematics': 'Math',
	'math': 'Math',
	'analytical reasoning': 'Math',
	'biology': 'Biology',
	'biology electives': 'Bio Electives',
	'biological sciences': 'Biology',
	'biological sciences major reqs': 'Bio Major',
	'biological sciences - major requirements': 'Bio Major',
	'chemistry': 'Chemistry',
	'physics': 'Physics',
	'physical science': 'Physics',
	'history': 'History',
	'science': 'Science',
	'natural sciences': 'Science',
	'social sciences': 'Social Sci',
	'social science': 'Social Sci',
	'social/behavioral sciences': 'Social Sci',
	'behavioral sciences': 'Social Sci',
	'humanities': 'Humanities',
	'arts': 'Arts',
	'fine arts': 'Arts',
	'liberal arts': 'Liberal Arts',
	'core major requirements': 'Core Major',
	'core requirements': 'Core',
	'core courses': 'Core',
	'core': 'Core',
	'general education': 'Gen Ed',
	'electives': 'Electives',
	'elective': 'Electives',
	'free elective': 'Free Elec',
	'free electives': 'Free Elec',
	'computer science': 'Comp Sci',
	'foreign language': 'Language',
	'world languages': 'Language',
	'other major requirements': 'Other Major',
	'communications': 'Comm',
	'communication': 'Comm',
	'quantitative reasoning': 'Quant',
	'writing intensive': 'Writing',
	'capstone': 'Capstone',
};

function getDisplayName(name) {
	if (!name) return '??';
	const key = name.toLowerCase().trim();
	if (CATEGORY_DISPLAY_NAMES[key]) return CATEGORY_DISPLAY_NAMES[key];
	// Fallback: capitalize first letter of each significant word, truncate to ~12 chars
	const STOP = new Set(['of', 'and', 'the', 'in', 'for', 'to', 'a', 'an', 'at', 'by', 'or', 'with']);
	const words = name.trim().split(/[\s\-\/]+/).filter(w => w.length > 0);
	const sig = words.filter(w => !STOP.has(w.toLowerCase()));
	const parts = sig.length > 0 ? sig : words;
	let result = parts.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
	if (result.length > 12) result = result.substring(0, 11) + '\u2026';
	return result;
}

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

export default function ProgressTracking({
	title,
	percent = 0,
	requirements = [],
	color = 'blue',
	program = null,
	onAddCourse = null,
	plan = null,
	onEditPlanCourse,
	overlayCloseTick,
	currentView = 'All Courses',
}) {
	const c = COLOR[color] || COLOR.blue;
	const barFrameRef = useRef(null);
	const shellRef = useRef(null);
	const [openBubbleKey, setOpenBubbleKey] = useState(null);
	const isMobile = useIsMobile();

	const displayRequirements = useMemo(() => {
		return requirements || [];
	}, [requirements, currentView]);

	const displayPercent = useMemo(() => percent || 0, [percent, title]);

	// Get a short, readable label for the segment (no cryptic abbreviations)
	function getSegmentLabel(name, backendAbbreviation) {
		// If advisor set a custom abbreviation, respect it
		if (backendAbbreviation) return backendAbbreviation;
		return getDisplayName(name);
	}

	const buildSegments = useCallback((reqList) => {
		const list = reqList || [];
		const n = list.length;
		if (!n) return [];
		// Compute base values (use at least 1 for requirements with no explicit credits)
		const values = list.map(req => {
			const tot = req.totalCredits ?? req.credits_required ?? 0;
			return tot > 0 ? tot : 1;
		});
		const sum = values.reduce((a, b) => a + b, 0);
		let heights = values.map(v => (sum > 0 ? (v / sum) * 100 : (100 / n)));
		// Enforce a minimum height so the abbreviation text fits inside the segment.
		// Use a desired minimum of ~6%; if many segments, cap by feasible per-segment space.
		const desiredMin = 6; // percent
		const maxFeasible = Math.max(0, (100 / n) - 0.1);
		const minPct = Math.max(0, Math.min(desiredMin, maxFeasible));
		if (minPct > 0) {
			// First, clamp all below-min segments up to minPct and track the extra needed.
			let extraNeeded = 0;
			const below = new Array(n).fill(false);
			for (let i = 0; i < n; i++) {
				if (heights[i] < minPct) {
					extraNeeded += (minPct - heights[i]);
					heights[i] = minPct;
					below[i] = true;
				}
			}
			// Reduce from segments above minPct proportionally to their surplus until we cover extraNeeded.
			let iterations = 0;
			while (extraNeeded > 0 && iterations < n + 2) {
				iterations++;
				let donorSurplusTotal = 0;
				const surplus = heights.map((h, i) => {
					const s = Math.max(0, h - minPct);
					donorSurplusTotal += (below[i] ? 0 : s);
					return s;
				});
				if (donorSurplusTotal <= 0) break; // No room to take from; keep clamped values
				let remainingToTake = extraNeeded;
				for (let i = 0; i < n; i++) {
					if (below[i] || surplus[i] <= 0) continue;
					const share = (surplus[i] / donorSurplusTotal) * extraNeeded;
					// Don't drop below minPct
					const take = Math.min(share, heights[i] - minPct);
					heights[i] -= take;
					remainingToTake -= take;
				}
				extraNeeded = Math.max(0, remainingToTake);
			}
			// Final normalization to account for floating point drift; scale to exactly 100%
			const totalAfter = heights.reduce((a, b) => a + b, 0) || 100;
			heights = heights.map(h => (h / totalAfter) * 100);
		}
		// Build segment objects with positions and fill
		let cumulative = 0;
		return list.map((req, index) => {
			const tot = req.totalCredits ?? req.credits_required ?? 0;
			const completed = req.completedCredits ?? req.credits_completed ?? 0;
			// If totalCredits is 0 but we have completed credits, treat it as 100% filled
			const fillPercent = tot > 0
				? Math.min((completed / tot) * 100, 100)
				: (completed > 0 ? 100 : 0);
			// Muted, text-friendly fill colors — soft gradient from slate to teal
			const getGradientColor = (p) => {
				const t = Math.max(0, Math.min(100, p)) / 100;
				// 0% → muted slate-blue (120,140,170), 100% → soft teal-green (70,160,130)
				const r = Math.round(120 + (70 - 120) * t);
				const g = Math.round(140 + (160 - 140) * t);
				const b = Math.round(170 + (130 - 170) * t);
				return { backgroundColor: `rgb(${r}, ${g}, ${b})` };
			};
			const initials = getSegmentLabel(req.name || req.category || '', req.abbreviation);
			const side = index % 2 === 0 ? 'left' : 'right';
			const segHeight = heights[index];
			const start = cumulative;
			const mid = start + segHeight / 2;
			cumulative += segHeight;
			return { requirement: req, id: req.id || req.name || index, height: segHeight, fillPercent, fillStyle: getGradientColor(fillPercent), trackClass: 'bg-gray-200 dark:bg-gray-700', initials, side, mid };
		});
	}, []);

	useEffect(() => {
		// If parent signals opening a new modal, close any open requirement popover/sheet
		if (overlayCloseTick !== undefined) {
			setOpenBubbleKey(null);
		}
	}, [overlayCloseTick]);

	useEffect(() => {
		if (!isMobile || !openBubbleKey) return;
		// Save previous styles
		const prevOverflow = document.body.style.overflow;
		const prevPosition = document.body.style.position;
		const prevTop = document.body.style.top;
		const prevWidth = document.body.style.width;
		const scrollY = window.scrollY;
		
		// Lock scroll by fixing body position
		document.body.style.overflow = 'hidden';
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollY}px`;
		document.body.style.width = '100%';
		
		return () => {
			// Restore previous styles
			document.body.style.overflow = prevOverflow;
			document.body.style.position = prevPosition;
			document.body.style.top = prevTop;
			document.body.style.width = prevWidth;
			// Restore scroll position
			window.scrollTo(0, scrollY);
		};
	}, [isMobile, openBubbleKey]);

	useEffect(() => {
		const onKey = (e) => e.key === 'Escape' && setOpenBubbleKey(null);
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, []);

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
				<button aria-label="Close popover" onClick={(e) => { e.stopPropagation(); setOpenBubbleKey(null); }} onTouchStart={(e) => { e.stopPropagation(); setOpenBubbleKey(null); }} className="fixed inset-0 z-[998] bg-transparent" style={{ touchAction: 'none' }} />
				<div role="dialog" aria-modal="false" className="fixed z-[999] w-80 max-w-[85vw] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl" style={{ top, left: leftBase, transform, maxHeight: 'min(70vh, 560px)', overflow: 'hidden' }}>
					<div style={{ maxHeight: 'inherit', overflowY: 'auto', overscrollBehavior: 'contain' }}>{children}</div>
				</div>
			</>,
			document.body
		);
	};

	const MobileSheetPortal = ({ children }) => {
		const [vh, setVh] = React.useState(() => typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 800);
		React.useEffect(() => {
			const update = () => { const h = window.visualViewport?.height || window.innerHeight; setVh(h); };
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
				<button aria-label="Close panel" onClick={(e) => { e.stopPropagation(); setOpenBubbleKey(null); }} onTouchStart={(e) => { e.stopPropagation(); setOpenBubbleKey(null); }} className="fixed inset-0 z-[1098] bg-black/50 backdrop-blur-[1px]" style={{ touchAction: 'none' }} />
				<div role="dialog" aria-modal="true" className="fixed inset-x-0 bottom-0 z-[1099] rounded-t-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl pt-3 pb-4 px-4" style={{ maxHeight: `${sheetMaxPx}px`, height: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', overflow: 'hidden', overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
					<div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
					<div style={{ maxHeight: 'inherit', overflowY: 'auto', overscrollBehavior: 'contain' }}>{children}</div>
				</div>
			</>,
			document.body
		);
	};

	const titleColor = (COLOR[color] || COLOR.blue).title;

	return (
		<section className="flex flex-col items-center gap-2 sm:gap-3 select-none w-full max-w-full" ref={shellRef} aria-labelledby={`progress-title-${title.replace(/\s+/g, '-')}`}>
			<div className="flex items-center gap-2">
				<h3 id={`progress-title-${title.replace(/\s+/g, '-')}`} className={`text-sm font-semibold text-center ${titleColor}`}>{title}</h3>
			</div>
			<div className="relative h-80 w-28 sm:h-80 sm:w-28 mx-1 sm:mx-2 border-2 border-gray-300 dark:border-gray-900 rounded-md overflow-hidden" ref={barFrameRef} role="progressbar" aria-valuenow={Math.round(displayPercent)} aria-valuemin="0" aria-valuemax="100" aria-label={`${title} progress: ${Math.round(displayPercent)} percent complete`}>
				<div className="absolute -right-5 -top-7 translate-x-full">
					<div className="px-2 py-1 text-xs rounded-lg bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100 shadow-lg font-medium" aria-hidden="true">{Math.round(displayPercent)}%</div>
				</div>
				{buildSegments(displayRequirements).map((seg, index) => {
					const segKey = `${seg.id}-single`;
					const isOpen = openBubbleKey === segKey;
					const segments = buildSegments(displayRequirements);
					return (
						<React.Fragment key={segKey}>
							<div 
								className="relative w-full cursor-pointer" 
								style={{ height: `${seg.height}%`, touchAction: 'manipulation' }}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setOpenBubbleKey(isOpen ? null : segKey);
								}}
								onTouchStart={(e) => {
									e.stopPropagation();
								}}
								onTouchEnd={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setOpenBubbleKey(isOpen ? null : segKey);
								}}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										setOpenBubbleKey(isOpen ? null : segKey);
									}
								}}
								aria-expanded={isOpen ? 'true' : 'false'}
								aria-label={`${seg.requirement.name} requirement (${seg.requirement.status})`}
							>
								<div className={`absolute inset-0 ${seg.trackClass} ${index === 0 ? 'rounded-t-sm' : ''} ${index === segments.length - 1 ? 'rounded-b-sm' : ''}`} />
								<div className={`absolute bottom-0 left-0 w-full ${index === 0 ? 'rounded-t-sm' : ''} ${index === segments.length - 1 ? 'rounded-b-sm' : ''}`} style={{ height: `${seg.fillPercent}%`, transition: 'height .25s ease', ...seg.fillStyle }} />
								{index < segments.length - 1 && (<div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-400 dark:bg-black z-10" />)}
								<div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
									<span className="font-semibold text-[10px] leading-tight text-white drop-shadow-sm text-center px-0.5" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.4)' }}>{seg.initials}</span>
								</div>
							</div>
							{isOpen && (isMobile ? (
								<MobileSheetPortal>
									<RequirementDetails requirement={seg.requirement} onClose={() => setOpenBubbleKey(null)} onAddCourse={onAddCourse} onEditPlanCourse={onEditPlanCourse} plan={plan} program={program} compact />
								</MobileSheetPortal>
							) : (
								<DesktopPopoverPortal seg={seg}>
									<RequirementDetails requirement={seg.requirement} onClose={() => setOpenBubbleKey(null)} onAddCourse={onAddCourse} onEditPlanCourse={onEditPlanCourse} plan={plan} program={program} />
								</DesktopPopoverPortal>
							))}
						</React.Fragment>
					);
				})}
			</div>
		</section>
	);
}

function RequirementDetails({ requirement, onClose, onAddCourse, onEditPlanCourse, plan, program, compact = false }) {
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [showCourses, setShowCourses] = useState(false);
	const [suggestions, setSuggestions] = useState([]); // For simple requirements, flat array
	const [groupedSuggestions, setGroupedSuggestions] = useState({}); // For grouped requirements, keyed by group_name
	const [expandedGroups, setExpandedGroups] = useState({}); // Track which groups are expanded
	const [loadingSuggestions, setLoadingSuggestions] = useState(false);
	const { name, status, completedCredits, totalCredits, description, programRequirement} = requirement;
	
	// Helper to generate human-readable constraint descriptions
	const getConstraintDescription = (constraint) => {
		if (constraint.description) return constraint.description;
		
		const params = constraint.params || {};
		const type = constraint.constraint_type;
		
		switch (type) {
			case 'credits': {
				const min = params.credits_min;
				const max = params.credits_max;
				if (min != null && max != null) return `Between ${min} and ${max} credits required`;
				if (min != null) return `At least ${min} credits required`;
				if (max != null) return `At most ${max} credits allowed`;
				return 'Credits';
			}
			case 'min_level_credits':
				return `Need at least ${params.credits || 0} credits from ${params.level_min || 0}-level or higher courses`;
			case 'max_tag_credits':
				return `No more than ${params.credits || 0} credits from ${params.tag || 'tagged'} courses allowed`;
			case 'min_tag_courses':
				return `Must include at least ${params.courses || 0} ${params.tag || 'tagged'} course${(params.courses || 0) !== 1 ? 's' : ''}`;
			case 'min_courses_at_level':
				return `Must include at least ${params.courses || 0} course${(params.courses || 0) !== 1 ? 's' : ''} at the ${params.level || 0}+ level`;
			default:
				return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
		}
	};

	// Make tally keys human-readable
	const humanizeTallyKey = (key) => {
		// e.g. "credits_3000_plus" -> "Credits at 3000+ level"
		// "credits_3000_plus_required" -> "Credits required at 3000+ level"
		// "lab_courses" -> "Lab courses"
		// "lab_courses_required" -> "Lab courses required"
		let s = key;
		const levelMatch = s.match(/^(credits|courses)_(at_)?(\d+)(\+|_plus)?(_required)?$/);
		if (levelMatch) {
			const what = levelMatch[1] === 'credits' ? 'Credits' : 'Courses';
			const level = levelMatch[3];
			const isRequired = !!levelMatch[5];
			return isRequired ? `${what} required (${level}+ level)` : `${what} earned (${level}+ level)`;
		}
		const tagMatch = s.match(/^(.+?)_(credits|courses)(_required|_max)?$/);
		if (tagMatch) {
			const tag = tagMatch[1].replace(/_/g, ' ');
			const what = tagMatch[2] === 'credits' ? 'credits' : 'courses';
			const suffix = tagMatch[3] === '_required' ? ' required' : tagMatch[3] === '_max' ? ' max' : ' earned';
			const tagCap = tag.charAt(0).toUpperCase() + tag.slice(1);
			return `${tagCap} ${what}${suffix}`;
		}
		return s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
	};
	
	// Log suggestions state whenever it changes
	React.useEffect(() => {
		console.log(`[${name}] suggestions state updated:`, suggestions.length, 'items');
		if (suggestions.length > 0) {
			console.log(`[${name}] First suggestion:`, suggestions[0]);
		}
	}, [suggestions, name]);
	
	const requirementCourses = React.useMemo(() => {
		if (!plan?.courses) return [];
		
		// Use the backend's authoritative courses array if available.
		// The backend already does proper equivalency-based, subject-code, and
		// group matching — so use its course IDs to look up full plan course data.
		const backendCourses = requirement.courses || [];
		if (backendCourses.length > 0) {
			const matchedCourseIds = new Set(backendCourses.map(c => c.id).filter(Boolean));
			// Also build a set of course codes for fallback matching (some courses may have
			// different IDs across programs but same code via equivalency)
			const matchedCodes = new Set(backendCourses.map(c => (c.code || '').toUpperCase()).filter(Boolean));
			const equivCodes = new Set(backendCourses
				.filter(c => c.equivalent_code)
				.map(c => c.equivalent_code.toUpperCase()));
			
			return plan.courses.filter(pc => {
				const courseId = pc.course?.id || pc.course_id;
				const courseCode = (pc.course?.code || '').toUpperCase();
				return matchedCourseIds.has(courseId) || matchedCodes.has(courseCode) || equivCodes.has(courseCode);
			});
		}
		
		// Fallback: fuzzy category matching for when backend courses array is empty
		const normalizeCategory = (category) => (category || '').toLowerCase().replace(/[\/\-\s]+/g, ' ').replace(/\s+/g, ' ').trim();
		const categoriesMatch = (reqCategory, courseCategory) => {
			const reqNorm = normalizeCategory(reqCategory);
			const courseNorm = normalizeCategory(courseCategory);
			if (reqNorm === courseNorm) return true;
			if (reqNorm.includes(courseNorm) || courseNorm.includes(reqNorm)) return true;
			const mathKeywords = ['math', 'mathematics', 'analytical', 'reasoning', 'calculus', 'algebra'];
			const englishKeywords = ['english', 'composition', 'writing', 'literature'];
			const scienceKeywords = ['biology', 'chemistry', 'physics', 'science'];
			const socialKeywords = ['social', 'psychology', 'sociology', 'history'];
			const check = (kw) => kw.some(k => reqNorm.includes(k)) && kw.some(k => courseNorm.includes(k));
			if (check(mathKeywords) || check(englishKeywords) || check(scienceKeywords) || check(socialKeywords)) return true;
			return false;
		};
		return plan.courses.filter(pc => categoriesMatch(name, pc.requirement_category || 'Uncategorized'));
	}, [plan?.courses, name, requirement.courses]);
	
	// Extract constraint information from requirement
	const constraints = requirement.constraint_results || [];
	const hasCourses = requirementCourses.length > 0;
	const constraintsSatisfied = hasCourses ? (requirement.constraints_satisfied !== false) : false;
	const allConstraintsCapOnly = constraints.length > 0 && constraints.every(c => c.is_cap_only);
	const hasConstraints = constraints.length > 0;

	const generateSuggestions = useCallback(async () => {
		if (loadingSuggestions || !plan) return;
		setLoadingSuggestions(true);

		try {
			// Resolve the requirement ID from the program's requirements list
			let reqId = requirement.id;
			if (!reqId && program?.requirements) {
				const match = program.requirements.find(r =>
					r.category === requirement.category || r.category === requirement.name
				);
				if (match) reqId = match.id;
			}

			if (!reqId || !program?.id) {
				setSuggestions([]);
				setGroupedSuggestions({});
				return;
			}

			const resp = await api.getProgramRequirementSuggestions(program.id, reqId, plan.id);

			// Build grouped and flat structures from the unified response
			const grouped = {};
			const flat = [];

			(resp?.suggestions || []).forEach(groupData => {
				const groupInfo = groupData.group;
				const groupName = groupInfo?.group_name || 'Other';
				const isRealGroup = groupInfo?.id != null;

				const courses = [];
				(groupData.course_options || []).forEach(({ course, option_info, group_name }) => {
					if (!course) return;
					courses.push({
						id: course.id,
						code: course.code,
						title: course.title,
						credits: course.credits,
						institution: course.institution,
						description: course.description,
						prerequisites: course.prerequisites,
						group_name: isRealGroup ? groupName : undefined,
						is_preferred: option_info?.is_preferred || false,
						notes: option_info?.notes || '',
						requirement_category: requirement.name || requirement.category,
						detectedCategory: requirement.name || requirement.category,
						requirement_group_id: groupInfo?.id,
						course_level: course.course_level,
						course_type: course.course_type,
					});
				});

				if (courses.length > 0) {
					if (isRealGroup) {
						grouped[groupName] = {
							groupInfo,
							courses: courses.slice(0, 12),
						};
					} else {
						flat.push(...courses);
					}
				}
			});

			if (Object.keys(grouped).length > 0) {
				setGroupedSuggestions(grouped);
				setSuggestions([]);
			} else {
				setSuggestions(flat.slice(0, 12));
				setGroupedSuggestions({});
			}
		} catch (err) {
			console.error('generateSuggestions error:', err);
			setSuggestions([]);
			setGroupedSuggestions({});
		} finally {
			setLoadingSuggestions(false);
		}
	}, [loadingSuggestions, plan, program, requirement]);

	const getStatusChip = (status) => {
		switch (status) {
			case 'met': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
			case 'part': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
			default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
		}
	};
	const getStatusText = (s) => (s === 'met' ? 'Complete' : s === 'part' ? 'In Progress' : 'Not Started');
	const badgeByCourseStatus = (status) => {
		switch (status) {
			case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
			case 'in_progress': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
			case 'planned': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
			default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
		}
	};

	return (
		<div className="p-3 sm:p-4 overflow-y-auto" style={{ maxHeight: 'inherit' }}>
			<div className="flex items-start justify-between gap-2 sm:gap-3 mb-4">
				<div className="flex-1 min-w-0">
					<h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words">{name}</h4>
					<div className="flex items-center flex-wrap gap-2 mt-1">
						<span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusChip(requirement.status)}`}>{getStatusText(requirement.status)}</span>
						{totalCredits > 0
							? (<span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{(completedCredits ?? 0)}/{totalCredits} credits</span>)
							: (completedCredits > 0
								? (<span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{completedCredits} credits earned</span>)
								: null)
						}
					</div>
					{description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 break-words">{description}</p>}
				</div>
				<div className="flex-shrink-0">
					<button aria-label="Close details" onClick={onClose} className={`p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${compact ? 'hidden sm:inline-flex' : ''}`}><X size={18} /></button>
				</div>
			</div>
			{totalCredits > 0 && (
				<div className="mb-4">
					<div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1"><span>Credits Progress</span><span>{Math.round(((completedCredits ?? 0) / totalCredits) * 100)}%</span></div>
					<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className="h-2 rounded-full transition-all duration-300 bg-blue-600 dark:bg-blue-500" style={{ width: `${Math.min(((completedCredits ?? 0) / totalCredits) * 100, 100)}%` }} /></div>
					{Math.max(0, totalCredits - (completedCredits ?? 0)) > 0 && (<p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{Math.max(0, totalCredits - (completedCredits ?? 0))} more credits needed</p>)}
				</div>
			)}
			{plan?.courses && (
				<div className="mb-2">
					<button onClick={() => setShowCourses(v => !v)} className="w-full flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
						<span className="flex items-center"><BookOpen size={14} className="mr-1" />Current Courses ({requirementCourses.length})</span>{showCourses ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
					</button>
					{showCourses && (
						<div className={`mt-3 space-y-2 ${compact ? '' : 'max-h-48 sm:max-h-64 overflow-y-auto pr-1'}`}>
							{requirementCourses.length > 0 ? requirementCourses.map((pc) => (
								<div key={pc.id} className={`rounded-lg p-2 sm:p-3 ${pc.constraint_violation ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700' : 'bg-gray-50 dark:bg-gray-700'}`}>
									<div className="flex flex-col sm:flex-row sm:items-start gap-2">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-1 flex-wrap">
												<h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{pc.course?.code}: {pc.course?.title}</h6>
												{pc.constraint_violation && (
													<span className="px-1.5 py-0.5 text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded flex-shrink-0" title={pc.constraint_violation_reason}>⚠️</span>
												)}
											</div>
											<p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{(pc.credits || pc.course?.credits) ?? 0} credits • {pc.course?.institution}</p>
											{pc.constraint_violation && pc.constraint_violation_reason && (
												<p className="text-xs text-orange-600 dark:text-orange-400 mt-1">⚠️ {pc.constraint_violation_reason}</p>
											)}
										</div>
										<div className="flex items-center gap-2 sm:flex-col sm:items-end">
											<span className={`px-2 py-1 text-xs rounded border whitespace-nowrap ${badgeByCourseStatus(pc.status)}`}>
												{pc.status === 'in_progress' ? 'In Progress' : pc.status === 'completed' ? 'Completed' : 'Planned'}
											</span>
											{onEditPlanCourse && (
												<button 
													onClick={() => onEditPlanCourse(pc)} 
													className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 whitespace-nowrap"
												>
													Edit
												</button>
											)}
										</div>
									</div>
								</div>
							)) : (<p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">No courses added for this requirement yet</p>)}
						</div>
					)}
				</div>
			)}
			{onAddCourse && (
				<div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
					<button onClick={() => { if (!showSuggestions && suggestions.length === 0 && Object.keys(groupedSuggestions).length === 0) generateSuggestions(); setShowSuggestions(v => !v); }} className="w-full flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
						<span className="flex items-center">
							<Plus size={14} className="mr-1" />Course Suggestions
							{hasConstraints && !constraintsSatisfied && <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">Constraints Not Met</span>}
							{hasConstraints && constraintsSatisfied && allConstraintsCapOnly && <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">Within Limits</span>}
							{hasConstraints && constraintsSatisfied && !allConstraintsCapOnly && <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">✓</span>}
						</span>
						{showSuggestions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
					</button>
					{showSuggestions && (
						<div className="mt-3 space-y-3">
							{/* Constraint status cards */}
							{hasConstraints && (
								<div className="space-y-2 mb-3">
									{constraints.map((constraint, idx) => {
										// Cap-only constraints (credits_max with no credits_min) use neutral styling
										// since "within limit" != "completed"
										const isCap = constraint.is_cap_only;
										const isOk = constraint.satisfied;
										const cardClass = !isOk
											? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
											: isCap
												? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
												: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
										const iconClass = !isOk
											? 'text-red-600 dark:text-red-400'
											: isCap
												? 'text-blue-600 dark:text-blue-400'
												: 'text-green-600 dark:text-green-400';
										const textClass = !isOk
											? 'text-red-800 dark:text-red-300'
											: isCap
												? 'text-blue-800 dark:text-blue-300'
												: 'text-green-800 dark:text-green-300';
										return (
										<div key={idx} className={`rounded-lg p-2 sm:p-3 border ${cardClass}`}>
											<div className="flex items-start gap-2">
												<div className="flex-shrink-0 mt-0.5">
													{!isOk ? (
														<AlertCircle size={16} className={iconClass} />
													) : isCap ? (
														<AlertCircle size={16} className={iconClass} />
													) : (
														<CheckCircle size={16} className={iconClass} />
													)}
												</div>
												<div className="flex-1 min-w-0">
													<p className={`text-xs font-medium break-words ${textClass}`}>
														{getConstraintDescription(constraint)}{isCap && isOk ? ' (within limit)' : ''}
													</p>
													{!constraint.satisfied && constraint.reason && (
														<p className="text-xs text-red-600 dark:text-red-400 mt-1 break-words">{constraint.reason}</p>
													)}
													{constraint.tally && Object.keys(constraint.tally).length > 0 && (
														<div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap gap-2">
															{Object.entries(constraint.tally).map(([key, value]) => (
																<span key={key} className="whitespace-nowrap">{humanizeTallyKey(key)}: {value}</span>
															))}
														</div>
													)}
												</div>
											</div>
										</div>
										);
									})}
								</div>
							)}
							{loadingSuggestions ? (
								<div className="flex items-center justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div><span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading suggestions...</span></div>
							) : Object.keys(groupedSuggestions).length > 0 ? (
								<>
									{/* Display grouped suggestions */}
									{Object.entries(groupedSuggestions).map(([groupName, groupData]) => {
										const isExpanded = expandedGroups[groupName];
										const coursesToShow = compact ? groupData.courses.slice(0, 2) : groupData.courses.slice(0, 3);
										const hasMore = groupData.courses.length > coursesToShow.length;
										const groupInfo = groupData.groupInfo || {};
										
										// Calculate group progress
										const groupCourses = requirementCourses.filter(pc => {
											return groupData.groupInfo?.course_options?.some(opt => 
												opt.course_code === pc.course?.code
											);
										});
										const groupCreditsCompleted = groupCourses.reduce((sum, c) => 
											sum + (c.credits || c.course?.credits || 0), 0
										);
										const groupCreditsRequired = groupInfo.credits_required || 0;
										const groupCoursesRequired = groupInfo.courses_required || 0;
										
										return (
											<div key={groupName} className="border border-gray-200 dark:border-gray-600 rounded-lg p-2 sm:p-3 bg-white dark:bg-gray-800">
												<button 
													onClick={() => setExpandedGroups(prev => ({...prev, [groupName]: !prev[groupName]}))}
													className="w-full flex items-center justify-between mb-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded p-1 transition-colors"
												>
													<div className="flex-1 min-w-0">
														<h6 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{groupName}</h6>
														<div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
															{groupCreditsRequired > 0 && (
																<span className="text-xs text-gray-600 dark:text-gray-400">
																	{groupCreditsCompleted}/{groupCreditsRequired} credits
																</span>
															)}
															{groupCoursesRequired > 0 && (
																<span className="text-xs text-purple-600 dark:text-purple-400">
																	{groupCourses.length}/{groupCoursesRequired} courses
																</span>
															)}
															{groupCourses.length > 0 && (
																<span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
																	{groupCourses.length} added
																</span>
															)}
														</div>
													</div>
													<div className="flex-shrink-0 ml-2">
														{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
													</div>
												</button>
												
												{isExpanded && (
													<div className="space-y-2 mt-2">
														{groupData.courses.map((course) => (
															<div key={course.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
																<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
																	<div className="flex-1 min-w-0">
																		<h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{course.code}: {course.title}</h6>
																		<p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{course.credits} credits • {course.institution}</p>
																		{course.notes && (
																			<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{course.notes}</p>
																		)}
																	</div>
																	<button 
																		onClick={() => onAddCourse([{ ...course, detectedCategory: course.requirement_category, requirement_group_id: course.requirement_group_id }])} 
																		className="px-3 py-1.5 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/70 transition-colors flex-shrink-0 w-full sm:w-auto text-center font-medium"
																	>
																		Add
																	</button>
																</div>
															</div>
														))}
													</div>
												)}
												
												{!isExpanded && coursesToShow.length > 0 && (
													<div className="space-y-2 mt-2">
														{coursesToShow.map((course) => (
															<div key={course.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
																<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
																	<div className="flex-1 min-w-0">
																		<h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{course.code}: {course.title}</h6>
																		<p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{course.credits} credits</p>
																	</div>
																	<button 
																		onClick={() => onAddCourse([{ ...course, detectedCategory: course.requirement_category, requirement_group_id: course.requirement_group_id }])} 
																		className="px-3 py-1.5 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/70 transition-colors flex-shrink-0 w-full sm:w-auto text-center font-medium"
																	>
																		Add
																	</button>
																</div>
															</div>
														))}
													</div>
												)}
												
												{!isExpanded && hasMore && (
													<button 
														onClick={() => setExpandedGroups(prev => ({...prev, [groupName]: true}))}
														className="text-xs text-blue-600 dark:text-blue-400 hover:underline w-full text-center py-2 mt-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors"
													>
														Show {groupData.courses.length - coursesToShow.length} more...
													</button>
												)}
											</div>
										);
									})}
								</>
							) : suggestions.length > 0 ? (
								<>
									{/* Display flat suggestions for simple requirements */}
									{console.log(`[${name}] RENDERING ${suggestions.length} suggestions, showing ${compact ? 3 : 4}`)}
									<div className="space-y-2">
										{(compact ? suggestions.slice(0, 3) : suggestions.slice(0, 4)).map((course) => (
											<div key={course.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
												<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
													<div className="flex-1 min-w-0">
														<h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{course.code}: {course.title}</h6>
														<p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{course.credits} credits • {course.institution}</p>
														{course.group_name && (<p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{course.group_name}</p>)}
													</div>
													<button 
														onClick={() => onAddCourse([{ ...course, detectedCategory: course.requirement_category }])} 
														className="px-3 py-1.5 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/70 transition-colors flex-shrink-0 w-full sm:w-auto text-center font-medium"
													>
														Add
													</button>
												</div>
											</div>
										))}
									</div>
								</>
							) : (<p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">No suggestions available for this requirement</p>)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

