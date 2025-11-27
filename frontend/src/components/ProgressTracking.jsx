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
			const fillPercent = tot > 0 ? Math.min((completed / tot) * 100, 100) : 0;
			const getGradientColor = (p) => {
				const normalizedPercent = Math.max(0, Math.min(100, p));
				const red = Math.round(255 * (1 - normalizedPercent / 100));
				const green = Math.round(255 * (normalizedPercent / 100));
				return { backgroundColor: `rgb(${red}, ${green}, 0)` };
			};
			const initials = getRequirementInitials(req.name || req.category || '');
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
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => { document.body.style.overflow = prev; };
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
				<button aria-label="Close popover" onClick={(e) => { e.stopPropagation(); setOpenBubbleKey(null); }} onTouchStart={(e) => { e.stopPropagation(); setOpenBubbleKey(null); }} className="fixed inset-0 z-[998] bg-transparent" style={{ touchAction: 'manipulation' }} />
				<div role="dialog" aria-modal="false" className="fixed z-[999] w-80 max-w-[85vw] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl" style={{ top, left: leftBase, transform, maxHeight: 'min(70vh, 560px)', overflow: 'hidden' }}>
					<div style={{ maxHeight: 'inherit', overflowY: 'auto' }}>{children}</div>
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
				<button aria-label="Close panel" onClick={(e) => { e.stopPropagation(); setOpenBubbleKey(null); }} onTouchStart={(e) => { e.stopPropagation(); setOpenBubbleKey(null); }} className="fixed inset-0 z-[1098] bg-black/50 backdrop-blur-[1px]" style={{ touchAction: 'manipulation' }} />
				<div role="dialog" aria-modal="true" className="fixed inset-x-0 bottom-0 z-[1099] rounded-t-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl pt-3 pb-4 px-4" style={{ maxHeight: `${sheetMaxPx}px`, height: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', overflow: 'hidden', overscrollBehavior: 'contain' }}>
					<div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
					<div style={{ maxHeight: 'inherit', overflowY: 'auto' }}>{children}</div>
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
									<span className="uppercase font-bold text-xs text-white drop-shadow-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{seg.initials}</span>
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
	const [showConstraints, setShowConstraints] = useState(false);
	const { name, status, completedCredits, totalCredits, description, programRequirement} = requirement;
	
	// Log suggestions state whenever it changes
	React.useEffect(() => {
		console.log(`[${name}] suggestions state updated:`, suggestions.length, 'items');
		if (suggestions.length > 0) {
			console.log(`[${name}] First suggestion:`, suggestions[0]);
		}
	}, [suggestions, name]);
	
	// Extract constraint information from requirement
	const constraints = requirement.constraint_results || [];
	const constraintsSatisfied = requirement.constraints_satisfied !== false;
	const hasConstraints = constraints.length > 0;
	const requirementCourses = React.useMemo(() => {
		if (!plan?.courses) return [];
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
	}, [plan?.courses, name]);

	const generateSuggestions = useCallback(async () => {
		if (loadingSuggestions || !plan) return;
		setLoadingSuggestions(true);
		
		console.log('=== generateSuggestions START ===');
		console.log('requirement:', requirement);
		console.log('program:', program);
		console.log('hasConstraints:', hasConstraints);
		console.log('constraints:', constraints);
		
		try {
			const out = [];
			const targetInstitution = program?.institution;
			
			// Extract constraint filters from requirement
			const constraintFilters = {
				minLevel: null,
				excludeTags: [],
				maxTagCredits: {}
			};
			
			// Parse constraints to extract filtering rules
			if (hasConstraints) {
				constraints.forEach(c => {
					const params = c.params || {};
					if (c.constraint_type === 'min_level_credits' && params.level_min) {
						constraintFilters.minLevel = params.level_min;
					}
					// Track tags that are at max capacity
					if (c.constraint_type === 'max_tag_credits' && !c.satisfied) {
						const tag = params.tag;
						if (tag) constraintFilters.excludeTags.push(tag);
					}
				});
			}
			console.log('constraintFilters after initial parse:', constraintFilters);
			
			// Helper to check if course passes constraint filters
			const passesConstraintFilters = (course) => {
				// Check minimum level requirement
				if (constraintFilters.minLevel) {
					const courseLevel = course.course_level || course.course_number_numeric || 0;
					if (courseLevel > 0 && courseLevel < constraintFilters.minLevel) {
						return false;
					}
					// If we can't determine level but there's a min level requirement,
					// be conservative and reject unless it's clearly a high-level course
					if (courseLevel === 0 && constraintFilters.minLevel >= 3000) {
						return false;
					}
				}
				// Check tag exclusions
				if (constraintFilters.excludeTags.length > 0 && course.course_type) {
					if (constraintFilters.excludeTags.includes(course.course_type)) {
						return false;
					}
				}
				return true;
			};
			
			// Try to find the actual requirement definition from the program
			// This gives us access to constraints and better metadata
			let actualRequirement = null;
			if (program && program.requirements) {
				actualRequirement = program.requirements.find(req => 
					req.category === requirement.category || req.id === requirement.id
				);
			}
			console.log('actualRequirement found:', actualRequirement);
			if (actualRequirement && actualRequirement.constraints) {
				console.log('actualRequirement.constraints:', actualRequirement.constraints);
			}
			if (actualRequirement && actualRequirement.groups !== undefined) {
				console.log('actualRequirement.groups:', actualRequirement.groups);
				console.log('actualRequirement.groups.length:', actualRequirement.groups?.length);
			}
			
			// If we found the actual requirement and it has constraints, update our constraint data
			if (actualRequirement && actualRequirement.constraints && actualRequirement.constraints.length > 0) {
				console.log('Re-extracting constraints from actualRequirement');
				// Re-extract constraint filters from the actual requirement
				actualRequirement.constraints.forEach(c => {
					console.log('Processing constraint:', c.constraint_type, c.params);
					const params = c.params || {};
					if (c.constraint_type === 'min_level_credits' && params.level_min) {
						constraintFilters.minLevel = params.level_min;
						console.log('Set minLevel filter to:', params.level_min);
					}
					if (c.constraint_type === 'max_tag_credits' && !c.satisfied) {
						const tag = params.tag;
						if (tag) {
							constraintFilters.excludeTags.push(tag);
							console.log('Added tag to exclude:', tag);
						}
					}
				});
			}
			console.log('constraintFilters after actualRequirement:', constraintFilters);
			
			// Smart defaults: For university-level (BS, BA) programs, only exclude clearly developmental courses
			// Don't apply a blanket 2000-level filter since some valid 1000-level courses exist (like MATH 1125, 1126)
			// The backend will have proper course_level data and grouped requirements should handle this
			if (!constraintFilters.minLevel && program?.degree_type && ['BS', 'BA', 'MS', 'MA', 'PhD'].includes(program.degree_type.toUpperCase())) {
				// Only exclude courses explicitly marked as developmental (below 1000 level)
				constraintFilters.minLevel = 1000;
				console.log('Applied smart default minLevel filter for university program:', constraintFilters.minLevel);
			}
			
			console.log('Final constraintFilters:', constraintFilters);
			
			// For grouped requirements, prefer authoritative backend suggestions tied to program requirement definitions
			// The progress data comes pre-filtered by program (current vs transfer), so we can trust
			// that the requirement belongs to the program being displayed
			const requirementBelongsToProgram = true; // Requirements are already filtered by program in calculate_progress
			
			console.log('requirementBelongsToProgram:', requirementBelongsToProgram);
			console.log('requirement.program_id:', requirement?.program_id, '(Note: not included in progress data)');
			console.log('program.id:', program?.id);
			
			// Use actualRequirement if we found it, otherwise fall back to what we have
			const reqToUse = actualRequirement || requirement;
			console.log('reqToUse:', reqToUse);
			console.log('reqToUse.id:', reqToUse?.id);
			console.log('reqToUse.requirement_type:', reqToUse?.requirement_type);
			
			if ((reqToUse?.requirement_type === 'grouped' || programRequirement?.requirement_type === 'grouped') && 
			    reqToUse?.id && program?.id && requirementBelongsToProgram) {
				console.log('Attempting backend API call for grouped requirement suggestions');
				try {
					const resp = await api.getProgramRequirementSuggestions(program.id, reqToUse.id);
					console.log('Backend suggestions response:', resp);
					
					// Group suggestions by group_name
					const grouped = {};
					const groups = reqToUse?.groups || programRequirement?.groups || [];
					
					(resp?.suggestions || []).forEach(groupData => {
						const groupInfo = groupData.group;
						const groupName = groupInfo?.group_name || 'Other';
						
						const groupCourses = [];
						(groupData.course_options || []).forEach(({ course, option_info, group_name }) => {
							if (!course) return;
							// Filter out courses already on plan and exclude developmental (< 1000 level or numeric < 100)
							const already = (plan?.courses || []).some(pc => pc.course?.id === course.id);
							const level = course.course_level ?? null;
							const num = course.course_number_numeric ?? null;
							if (already || (level !== null && level < 1000) || (num !== null && num < 100)) return;
							
							// Apply constraint filters
							if (!passesConstraintFilters(course)) return;
							groupCourses.push({
								id: course.id,
								code: course.code,
								title: course.title,
								credits: course.credits,
								institution: course.institution,
								description: course.description,
								group_name: groupName,
								is_preferred: option_info?.is_preferred || false,
								notes: option_info?.notes || '',
								requirement_category: requirement.name || requirement.category,
								detectedCategory: requirement.name || requirement.category,
								requirement_group_id: groupInfo?.id
							});
						});
						
						if (groupCourses.length > 0) {
							grouped[groupName] = {
								groupInfo: groupInfo,
								courses: groupCourses.slice(0, 12) // Limit per group
							};
						}
					});
					
					console.log('Processed grouped suggestions:', Object.keys(grouped).length, 'groups');
					setGroupedSuggestions(grouped);
					setSuggestions([]); // Clear flat suggestions for grouped requirements
					console.log('SET GROUPED SUGGESTIONS:', Object.keys(grouped));
					return;
				} catch (err) {
					console.log('Backend suggestions failed, falling through to local heuristics:', err);
					// Fall through to local heuristics if backend suggestions fail
				}
			} else {
				console.log('Skipping backend API - using local heuristics because:');
				console.log('  - reqToUse.requirement_type:', reqToUse?.requirement_type);
				console.log('  - reqToUse.id:', reqToUse?.id);
				console.log('  - program.id:', program?.id);
				console.log('  - requirementBelongsToProgram:', requirementBelongsToProgram);
			}
			// Helper: de-dupe accumulator
			const pushUnique = (course, extra = {}) => {
				// Exclude developmental/remedial courses (< 1000 level or explicitly marked)
				if (typeof course.course_level === 'number') {
					if (course.course_level < 1000) return;
				} else if (typeof course.course_number_numeric === 'number') {
					// Fallback: if no course_level but has course_number_numeric
					if (course.course_number_numeric < 1000) return;
				}
				// Exclude courses with "No equivalent" or similar non-transferable indicators
				if (course.title && (
					course.title.includes('No equivalent') ||
					course.title.includes('No Equivalent')
				)) {
					return;
				}
				// Exclude courses with NE suffix (non-equivalent courses)
				if (course.code && course.code.endsWith('NE')) {
					return;
				}
				// Apply constraint filters
				if (!passesConstraintFilters(course)) return;
				if (!out.find(e => e.id === course.id)) {
					out.push({
						id: course.id,
						code: course.code,
						title: course.title,
						credits: course.credits,
						institution: course.institution,
						description: course.description,
						requirement_category: name,
						is_preferred: false,
						detectedCategory: name,
						course_level: course.course_level,
						course_type: course.course_type,
						...extra
					});
				}
			};

			// Collect IDs already on the plan to avoid suggesting duplicates
			const existingIds = new Set((plan.courses || []).map(pc => pc.course?.id).filter(Boolean));
			console.log('existingIds:', existingIds);

			// Special case: If requirement is marked as "simple" but has groups with course_options,
			// treat it like a grouped requirement and use the specific course codes
			const hasGroupOptions = reqToUse?.groups?.length > 0 && 
			                        reqToUse.groups.some(g => g.course_options && g.course_options.length > 0);
			
			if (hasGroupOptions) {
				console.log('Simple requirement has groups with course options - using specific course codes');
				for (const group of reqToUse.groups) {
					if (!group.course_options) continue;
					for (const option of group.course_options) {
						try {
							let searchUrl = `/api/courses?search=${encodeURIComponent(option.course_code)}`;
							const institutionToSearch = option.institution || targetInstitution;
							if (institutionToSearch) searchUrl += `&institution=${encodeURIComponent(institutionToSearch)}`;
							const res = await fetch(searchUrl);
							if (res.ok) {
								const data = await res.json();
								const course = data.courses?.[0];
								if (course && !existingIds.has(course.id)) {
									pushUnique(course, { 
										group_name: group.group_name, 
										is_preferred: option.is_preferred, 
										notes: option.notes 
									});
								}
							}
						} catch { /* ignore */ }
					}
				}
			} else if (!programRequirement || programRequirement.requirement_type === 'simple') {
				console.log('Using simple requirement local heuristics');
				console.log('requirement name:', name);
				// Map requirement category keywords to subject codes and optional title filters
				const subjectMap = {
					'english composition': { subjects: ['ENGL', 'ENG'], titleIncludesAny: ['composition', 'writing', 'rhetoric'] },
					'composition': { subjects: ['ENGL', 'ENG'], titleIncludesAny: ['composition', 'writing', 'rhetoric'] },
					'english': { subjects: ['ENGL', 'ENG'] },
					'literature': { subjects: ['ENGL', 'LIT'] },
					'mathematics': { subjects: ['MATH', 'STAT'] },
					'math': { subjects: ['MATH', 'STAT'] },
					'analytical reasoning': { subjects: ['MATH', 'STAT', 'PHIL'], titleIncludesAny: ['logic', 'statistics', 'analysis'] },
					'reasoning': { subjects: ['MATH', 'PHIL'], titleIncludesAny: ['logic'] },
					'biology': { subjects: ['BIOL', 'BIO'] },
					'chemistry': { subjects: ['CHEM'] },
					'physics': { subjects: ['PHYS'] },
					'history': { subjects: ['HIST'] },
					'science': { subjects: ['BIOL', 'CHEM', 'PHYS'] },
					'social sciences': { subjects: ['SOC', 'PSY', 'POLI'] },
					'social science': { subjects: ['SOC', 'PSY', 'POLI'] },
					'humanities': { subjects: ['ENGL', 'HIST', 'PHIL', 'ART', 'MUSC', 'THEA'] },
					'arts': { subjects: ['ART', 'MUSC', 'THEA'] },
					'fine arts': { subjects: ['ART', 'MUSC', 'THEA'] },
					'liberal arts': { subjects: ['ENGL', 'HIST', 'PHIL', 'ART', 'MUSC', 'THEA', 'SOC', 'PSY', 'POLI'] }
				};
				const nameLower = name.toLowerCase();
				let mappingKey = Object.keys(subjectMap).find(k => nameLower.includes(k));
				const conf = mappingKey ? subjectMap[mappingKey] : { subjects: [] };
				let subjects = conf.subjects;
				// Fallback: try to infer a subject by taking the first uppercase token in the name
				if (!subjects || subjects.length === 0) {
					// No strong mapping; try a conservative search using subject-like tokens (e.g., "CSCI", "MATH")
					subjects = [];
				}

				// Query by subject code to avoid broad full-text matches
				const subjectsToQuery = subjects.slice(0, 3); // limit network calls
				for (const subj of subjectsToQuery) {
					try {
						let url = `/api/courses?subject=${encodeURIComponent(subj)}&per_page=20`;
						if (targetInstitution) url += `&institution=${encodeURIComponent(targetInstitution)}`;
						const res = await fetch(url);
						if (res.ok) {
							const data = await res.json();
							(data.courses || []).forEach(course => {
								const instOk = !targetInstitution || (course.institution || '').toLowerCase() === targetInstitution.toLowerCase();
								if (!instOk) return;
								if (existingIds.has(course.id)) return;
								// Optional stricter title filter for some categories
								if (conf.titleIncludesAny && conf.titleIncludesAny.length > 0) {
									const title = (course.title || '').toLowerCase();
									if (!conf.titleIncludesAny.some(w => title.includes(w))) return;
								}
								pushUnique(course);
							});
						}
					} catch {
						// ignore fetch errors per subject
					}
				}

				// If we still have no suggestions and we have a strong keyword (e.g., "composition"), run a narrow title search as a last resort
				if (out.length === 0 && conf.titleIncludesAny && conf.titleIncludesAny.length > 0) {
					for (const kw of conf.titleIncludesAny.slice(0, 1)) {
						try {
							let url = `/api/courses?search=${encodeURIComponent(kw)}&per_page=10`;
							if (targetInstitution) url += `&institution=${encodeURIComponent(targetInstitution)}`;
							const res = await fetch(url);
							if (res.ok) {
								const data = await res.json();
								(data.courses || []).forEach(course => {
									const instOk = !targetInstitution || (course.institution || '').toLowerCase() === targetInstitution.toLowerCase();
									if (!instOk) return;
									if (existingIds.has(course.id)) return;
									pushUnique(course, { search_term: kw });
								});
							}
						} catch {
							// ignore
						}
					}
				}
			} else if ((reqToUse?.requirement_type === 'grouped' || programRequirement?.requirement_type === 'grouped') && (reqToUse?.groups || programRequirement?.groups)) {
				const groupsToUse = reqToUse?.groups || programRequirement?.groups;
				for (const group of groupsToUse) {
					if (!group.course_options) continue;
						for (const option of group.course_options) {
							try {
								let searchUrl = `/api/courses?search=${encodeURIComponent(option.course_code)}`;
								const institutionToSearch = option.institution || targetInstitution;
								if (institutionToSearch) searchUrl += `&institution=${encodeURIComponent(institutionToSearch)}`;
								const res = await fetch(searchUrl);
								if (res.ok) {
									const data = await res.json();
									const course = data.courses?.[0];
									if (course && !existingIds.has(course.id)) pushUnique(course, { group_name: group.group_name, is_preferred: option.is_preferred, notes: option.notes });
								}
							} catch { /* ignore */ }
						}
				}
			}
			// Trim to a reasonable number to keep UI focused
			console.log('Final suggestions count:', out.length);
			console.log('Final suggestions:', out.slice(0, 3));
			console.log('SET SUGGESTIONS (local heuristics):', out.slice(0, 12).length, 'items');
			setSuggestions(out.slice(0, 12));
		} catch (err) { 
			console.error('generateSuggestions error:', err);
			setSuggestions([]); 
		} finally { 
			setLoadingSuggestions(false);
			console.log('=== generateSuggestions END ===');
		}
	}, [programRequirement, loadingSuggestions, name, plan, program, hasConstraints, constraints]);

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
						{totalCredits ? (<span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{(completedCredits ?? 0)}/{totalCredits} credits</span>) : null}
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
			{hasConstraints && (
				<div className="mb-2">
					<button onClick={() => setShowConstraints(v => !v)} className="w-full flex items-center justify-between text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors p-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
						<span className="flex items-center flex-wrap gap-1">
							<span className="flex items-center">
								<AlertCircle size={14} className="mr-1" />
								Constraints ({constraints.length})
							</span>
							{!constraintsSatisfied && <span className="px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">Not Met</span>}
							{constraintsSatisfied && <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">✓</span>}
						</span>
						{showConstraints ? <ChevronUp size={14} className="flex-shrink-0 ml-2" /> : <ChevronDown size={14} className="flex-shrink-0 ml-2" />}
					</button>
					{showConstraints && (
						<div className="mt-3 space-y-2">
							{constraints.map((constraint, idx) => (
								<div key={idx} className={`rounded-lg p-2 sm:p-3 border ${constraint.satisfied ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
									<div className="flex items-start gap-2">
										<div className="flex-shrink-0 mt-0.5">
											{constraint.satisfied ? (
												<CheckCircle size={16} className="text-green-600 dark:text-green-400" />
											) : (
												<AlertCircle size={16} className="text-red-600 dark:text-red-400" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className={`text-xs font-medium break-words ${constraint.satisfied ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
												{constraint.description || constraint.constraint_type}
											</p>
											{!constraint.satisfied && constraint.reason && (
												<p className="text-xs text-red-600 dark:text-red-400 mt-1 break-words">{constraint.reason}</p>
											)}
											{constraint.tally && Object.keys(constraint.tally).length > 0 && (
												<div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap gap-2">
													{Object.entries(constraint.tally).map(([key, value]) => (
														<span key={key} className="whitespace-nowrap">{key}: {value}</span>
													))}
												</div>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}
			{onAddCourse && (
				<div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
					<button onClick={() => { if (!showSuggestions && suggestions.length === 0 && Object.keys(groupedSuggestions).length === 0) generateSuggestions(); setShowSuggestions(v => !v); }} className="w-full flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
						<span className="flex items-center"><Plus size={14} className="mr-1" />Course Suggestions</span>{showSuggestions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
					</button>
					{showSuggestions && (
						<div className="mt-3 space-y-3">
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

