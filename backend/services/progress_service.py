"""Progress service skeleton.

This module begins decoupling heavy progress & suggestion logic from the Plan model.
Currently it delegates to existing Plan methods to avoid breaking behavior while
providing an abstraction seam for future refactors.
"""
from __future__ import annotations
from typing import Optional, Dict, Any

from models.plan import Plan

class ProgressService:
    """Facade for plan progress calculation.

    Future improvements:
      * Inject repositories to batch-load requirements & courses
      * Cache normalization of categories
      * Provide streaming / partial evaluation
    """
    def __init__(self, plan: Plan):
        self.plan = plan

    def full_progress(self, view_filter: str = "All Courses") -> Dict[str, Any]:
        """Return combined current + transfer progress safely."""
        return self.plan.calculate_progress(program=None, view_filter=view_filter)

    def program_progress(self, target: str, view_filter: str = "All Courses") -> Dict[str, Any]:
        if target == 'current' and self.plan.current_program:
            return self.plan.calculate_progress(self.plan.current_program, view_filter)
        if target == 'transfer' and self.plan.target_program:
            return self.plan.calculate_progress(self.plan.target_program, view_filter)
        return {
            'percent': 0,
            'requirements': [],
            'total_credits_earned': 0,
            'total_credits_required': 0,
        }

    def unmet(self):
        return self.plan.get_unmet_requirements()

    def suggestions(self):
        return self.plan.suggest_courses_for_requirements()
