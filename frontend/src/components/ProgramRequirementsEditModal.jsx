import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Edit, Save, Plus, Trash2, ChevronDown, ChevronRight, AlertCircle, Search } from 'lucide-react';
import api from '../services/api';

/**
 * ProgramRequirementsEditModal - Edit program requirements inline
 * 
 * Requirement Type Semantics:
 * - SIMPLE: Pool of courses with a credit goal. Student can choose ANY courses 
 *   from the pool to meet the credit requirement. All courses are optional.
 *   Example: "Choose 15 credits from these biology courses"
 * 
 * - GROUPED: Subdivided pool with multiple mandatory groups. Student must 
 *   satisfy ALL groups (each group has its own requirements).
 *   Example: "Complete 2 courses from Group A AND 3 courses from Group B"
 * 
 * - CONDITIONAL: Sequential/prerequisite-based requirements. Courses must be 
 *   completed in a specific order based on prerequisites.
 *   Example: "Take MATH 101 before MATH 201"
 *   (Note: Currently treated as simple; full prerequisite logic pending)
 */
const ProgramRequirementsEditModal = ({ program, semester, year, onClose, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [error, setError] = useState(null);
  
  // Course search state
  const [showCourseSearch, setShowCourseSearch] = useState({});
  const [courseSearchQuery, setCourseSearchQuery] = useState({});
  const [courseSearchResults, setCourseSearchResults] = useState({});
  const [searchingCourses, setSearchingCourses] = useState({});
  
  // Debounce timer for search
  const searchTimers = useRef({});

  useEffect(() => {
    loadRequirements();
  }, [program, semester, year]);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch requirements for this specific version
      const response = await api.getProgramRequirements(program.id, semester, year);
      setRequirements(response.requirements || []);
      
      // Auto-expand all categories
      const expanded = {};
      response.requirements?.forEach(req => {
        expanded[req.category] = true;
      });
      setExpandedCategories(expanded);
    } catch (err) {
      console.error('Failed to load requirements:', err);
      setError(err.message || 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleEdit = (reqId) => {
    setEditMode(prev => ({
      ...prev,
      [reqId]: !prev[reqId]
    }));
  };

  const updateRequirement = (reqId, field, value) => {
    setRequirements(prev => prev.map(req => 
      req.id === reqId ? { ...req, [field]: value } : req
    ));
  };

  const updateGroup = (reqId, groupIndex, field, value) => {
    setRequirements(prev => prev.map(req => {
      if (req.id === reqId && req.groups) {
        const updatedGroups = [...req.groups];
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          [field]: value
        };
        return { ...req, groups: updatedGroups };
      }
      return req;
    }));
  };

  const updateCourseOption = (reqId, groupIndex, optionIndex, field, value) => {
    setRequirements(prev => prev.map(req => {
      if (req.id === reqId) {
        // Initialize groups array if it doesn't exist (for simple requirements)
        if (!req.groups || req.groups.length === 0) {
          req.groups = [{ id: `new-group-${Date.now()}`, group_name: 'Eligible', options: [] }];
        }
        
        const updatedGroups = [...req.groups];
        
        // Ensure the group at groupIndex exists
        if (!updatedGroups[groupIndex]) {
          updatedGroups[groupIndex] = { id: `new-group-${Date.now()}`, group_name: 'Eligible', options: [] };
        }
        
        // Ensure options array exists
        if (!updatedGroups[groupIndex].options) {
          updatedGroups[groupIndex].options = [];
        }
        
        const updatedOptions = [...updatedGroups[groupIndex].options];
        updatedOptions[optionIndex] = {
          ...updatedOptions[optionIndex],
          [field]: value
        };
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          options: updatedOptions
        };
        return { ...req, groups: updatedGroups };
      }
      return req;
    }));
  };

  const deleteRequirement = (reqId) => {
    if (confirm('Are you sure you want to delete this requirement?')) {
      setRequirements(prev => prev.filter(req => req.id !== reqId));
    }
  };

  const deleteCourseOption = (reqId, groupIndex, optionIndex) => {
    if (confirm('Are you sure you want to delete this course option?')) {
      setRequirements(prev => prev.map(req => {
        if (req.id === reqId) {
          // Handle case where groups might not be initialized
          if (!req.groups || !req.groups[groupIndex]) {
            return req;
          }
          
          const updatedGroups = [...req.groups];
          const updatedOptions = (updatedGroups[groupIndex].options || []).filter((_, idx) => idx !== optionIndex);
          updatedGroups[groupIndex] = {
            ...updatedGroups[groupIndex],
            options: updatedOptions
          };
          return { ...req, groups: updatedGroups };
        }
        return req;
      }));
    }
  };

  const toggleCourseSearch = (reqId, groupIndex) => {
    const key = `${reqId}-${groupIndex}`;
    setShowCourseSearch(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // Clear search when closing
    if (showCourseSearch[key]) {
      setCourseSearchQuery(prev => ({ ...prev, [key]: '' }));
      setCourseSearchResults(prev => ({ ...prev, [key]: [] }));
    }
  };

  const searchCourses = (reqId, groupIndex, query) => {
    const key = `${reqId}-${groupIndex}`;
    setCourseSearchQuery(prev => ({ ...prev, [key]: query }));
    
    // Clear existing timer for this search key
    if (searchTimers.current[key]) {
      clearTimeout(searchTimers.current[key]);
    }
    
    if (!query || query.length < 2) {
      setCourseSearchResults(prev => ({ ...prev, [key]: [] }));
      setSearchingCourses(prev => ({ ...prev, [key]: false }));
      return;
    }

    // Set searching state immediately for user feedback
    setSearchingCourses(prev => ({ ...prev, [key]: true }));
    
    // Debounce the actual API call
    searchTimers.current[key] = setTimeout(async () => {
      try {
        const response = await api.searchCourses({ search: query, per_page: 10 });
        setCourseSearchResults(prev => ({ 
          ...prev, 
          [key]: response.courses || [] 
        }));
      } catch (err) {
        console.error('Course search failed:', err);
        setCourseSearchResults(prev => ({ ...prev, [key]: [] }));
      } finally {
        setSearchingCourses(prev => ({ ...prev, [key]: false }));
      }
    }, 300); // 300ms debounce
  };

  const addCourseToGroup = (reqId, groupIndex, course) => {
    setRequirements(prev => prev.map(req => {
      if (req.id === reqId) {
        // Initialize groups array if it doesn't exist (for simple requirements)
        if (!req.groups || req.groups.length === 0) {
          req.groups = [{ id: `new-group-${Date.now()}`, group_name: 'Eligible', options: [] }];
        }
        
        const updatedGroups = [...req.groups];
        
        // Ensure the group at groupIndex exists
        if (!updatedGroups[groupIndex]) {
          updatedGroups[groupIndex] = { id: `new-group-${Date.now()}`, group_name: 'Eligible', options: [] };
        }
        
        const newOption = {
          id: `new-option-${Date.now()}`, // Temporary ID for new options
          course_code: course.code,
          institution: course.institution,
          is_preferred: false
        };
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          options: [...(updatedGroups[groupIndex].options || []), newOption]
        };
        return { ...req, groups: updatedGroups };
      }
      return req;
    }));
    
    // Close search and clear results
    const key = `${reqId}-${groupIndex}`;
    setShowCourseSearch(prev => ({ ...prev, [key]: false }));
    setCourseSearchQuery(prev => ({ ...prev, [key]: '' }));
    setCourseSearchResults(prev => ({ ...prev, [key]: [] }));
  };

  const addManualCourseToGroup = (reqId, groupIndex) => {
    setRequirements(prev => prev.map(req => {
      if (req.id === reqId) {
        // Initialize groups array if it doesn't exist (for simple requirements)
        if (!req.groups || req.groups.length === 0) {
          req.groups = [{ id: `new-group-${Date.now()}`, group_name: 'Eligible', options: [] }];
        }
        
        const updatedGroups = [...req.groups];
        
        // Ensure the group at groupIndex exists
        if (!updatedGroups[groupIndex]) {
          updatedGroups[groupIndex] = { id: `new-group-${Date.now()}`, group_name: 'Eligible', options: [] };
        }
        
        const newOption = {
          id: `new-option-${Date.now()}`,
          course_code: '',
          institution: '',
          is_preferred: false
        };
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          options: [...(updatedGroups[groupIndex].options || []), newOption]
        };
        return { ...req, groups: updatedGroups };
      }
      return req;
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Save all modified requirements
      await api.updateProgramRequirements(program.id, semester, year, requirements);
      
      if (onSave) {
        await onSave();
      }
      onClose();
    } catch (err) {
      console.error('Failed to save requirements:', err);
      setError(err.message || 'Failed to save requirements');
    } finally {
      setSaving(false);
    }
  };

  // Group requirements by category
  const groupedRequirements = requirements.reduce((acc, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 dark:text-gray-300">Loading requirements...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Program Requirements
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {program.name} - {semester} {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="text-red-600 dark:text-red-400 mr-3 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">Error</h4>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {Object.entries(groupedRequirements).map(([category, reqs]) => (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-t-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category} ({reqs.length})
                </h3>
                {expandedCategories[category] ? 
                  <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : 
                  <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                }
              </button>

              {/* Requirements in Category */}
              {expandedCategories[category] && (
                <div className="p-4 space-y-4">
                  {reqs.map((req) => {
                    const isEditing = editMode[req.id];
                    
                    return (
                      <div key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        {/* Requirement Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Requirement Type:</label>
                                  <select
                                    value={req.requirement_type}
                                    onChange={(e) => updateRequirement(req.id, 'requirement_type', e.target.value)}
                                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  >
                                    <option value="simple">Simple</option>
                                    <option value="grouped">Grouped</option>
                                    <option value="conditional">Conditional</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Credits Required:</label>
                                  <input
                                    type="number"
                                    value={req.credits_required || ''}
                                    onChange={(e) => updateRequirement(req.id, 'credits_required', parseInt(e.target.value) || 0)}
                                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Description:</label>
                                  <textarea
                                    value={req.description || ''}
                                    onChange={(e) => updateRequirement(req.id, 'description', e.target.value)}
                                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows="2"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  Type: {req.requirement_type} | Credits: {req.credits_required}
                                </div>
                                {req.semester && req.year && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {req.semester} {req.year}
                                  </div>
                                )}
                                {req.description && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {req.description}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => toggleEdit(req.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              title={isEditing ? 'Save' : 'Edit'}
                            >
                              {isEditing ? <Save size={18} /> : <Edit size={18} />}
                            </button>
                            <button
                              onClick={() => deleteRequirement(req.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Simple Requirements - Course Management */}
                        {req.requirement_type === 'simple' && (
                          <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-3">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  Eligible Courses
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => toggleCourseSearch(req.id, 0)}
                                    className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                                    title="Search courses"
                                  >
                                    <Search size={14} />
                                    Search
                                  </button>
                                  <button
                                    onClick={() => addManualCourseToGroup(req.id, 0)}
                                    className="text-sm px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                                    title="Add blank course"
                                  >
                                    <Plus size={14} />
                                    Add
                                  </button>
                                </div>
                              </div>
                              
                              {(() => {
                                const searchKey = `${req.id}-0`;
                                const isSearching = searchingCourses[searchKey];
                                const searchResults = courseSearchResults[searchKey] || [];
                                const showSearch = showCourseSearch[searchKey];
                                // For simple requirements, create a virtual group if it doesn't exist
                                const simpleGroup = req.groups?.[0] || { group_name: 'Eligible', options: [] };
                                
                                return (
                                  <>
                                    {/* Course Search */}
                                    {showSearch && (
                                      <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                                        <div className="flex gap-2 mb-2">
                                          <input
                                            type="text"
                                            value={courseSearchQuery[searchKey] || ''}
                                            onChange={(e) => searchCourses(req.id, 0, e.target.value)}
                                            placeholder="Search by course code or title..."
                                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            autoFocus
                                          />
                                          <button
                                            onClick={() => toggleCourseSearch(req.id, 0)}
                                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                          >
                                            <X size={16} />
                                          </button>
                                        </div>
                                        
                                        {isSearching && (
                                          <div className="text-center py-2 text-sm text-gray-600 dark:text-gray-400">
                                            Searching...
                                          </div>
                                        )}
                                        
                                        {!isSearching && searchResults.length > 0 && (
                                          <div className="max-h-48 overflow-y-auto space-y-1">
                                            {searchResults.map((course, idx) => (
                                              <button
                                                key={idx}
                                                onClick={() => addCourseToGroup(req.id, 0, course)}
                                                className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-start"
                                              >
                                                <div>
                                                  <div className="font-medium text-gray-900 dark:text-white">
                                                    {course.code}
                                                  </div>
                                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {course.title} • {course.institution}
                                                  </div>
                                                </div>
                                                <Plus size={16} className="text-green-600 dark:text-green-400 mt-1" />
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                        
                                        {!isSearching && courseSearchQuery[searchKey] && courseSearchQuery[searchKey].length >= 2 && searchResults.length === 0 && (
                                          <div className="text-center py-2 text-sm text-gray-600 dark:text-gray-400">
                                            No courses found
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Course Options */}
                                    <div className="space-y-2">
                                      {simpleGroup.options?.length > 0 ? (
                                        simpleGroup.options.map((option, optIdx) => (
                                          <div key={optIdx} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded p-2">
                                            <div className="flex-1">
                                              <input
                                                type="text"
                                                value={option.course_code || ''}
                                                onChange={(e) => updateCourseOption(req.id, 0, optIdx, 'course_code', e.target.value)}
                                                placeholder="Course Code"
                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                              />
                                            </div>
                                            <div className="flex-1">
                                              <input
                                                type="text"
                                                value={option.institution || ''}
                                                onChange={(e) => updateCourseOption(req.id, 0, optIdx, 'institution', e.target.value)}
                                                placeholder="Institution"
                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                              />
                                            </div>
                                            <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                              <input
                                                type="checkbox"
                                                checked={option.is_preferred || false}
                                                onChange={(e) => updateCourseOption(req.id, 0, optIdx, 'is_preferred', e.target.checked)}
                                                className="rounded"
                                              />
                                              Preferred
                                            </label>
                                            <button
                                              onClick={() => deleteCourseOption(req.id, 0, optIdx)}
                                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                              title="Delete option"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                                          No courses defined. Click "Search" or "Add" to add courses.
                                        </div>
                                      )}
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Groups (for grouped/conditional requirements) */}
                        {req.requirement_type !== 'simple' && req.groups && req.groups.length > 0 && (
                          <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-600 pt-3">
                            {req.groups.map((group, groupIdx) => {
                              const searchKey = `${req.id}-${groupIdx}`;
                              const isSearching = searchingCourses[searchKey];
                              const searchResults = courseSearchResults[searchKey] || [];
                              const showSearch = showCourseSearch[searchKey];
                              
                              return (
                                <div key={groupIdx} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      Group: {group.group_name}
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => toggleCourseSearch(req.id, groupIdx)}
                                        className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                                        title="Search courses"
                                      >
                                        <Search size={14} />
                                        Search
                                      </button>
                                      <button
                                        onClick={() => addManualCourseToGroup(req.id, groupIdx)}
                                        className="text-sm px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                                        title="Add blank course"
                                      >
                                        <Plus size={14} />
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {/* Course Search */}
                                  {showSearch && (
                                    <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                                      <div className="flex gap-2 mb-2">
                                        <input
                                          type="text"
                                          value={courseSearchQuery[searchKey] || ''}
                                          onChange={(e) => searchCourses(req.id, groupIdx, e.target.value)}
                                          placeholder="Search by course code or title..."
                                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          autoFocus
                                        />
                                        <button
                                          onClick={() => toggleCourseSearch(req.id, groupIdx)}
                                          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                      
                                      {isSearching && (
                                        <div className="text-center py-2 text-sm text-gray-600 dark:text-gray-400">
                                          Searching...
                                        </div>
                                      )}
                                      
                                      {!isSearching && searchResults.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto space-y-1">
                                          {searchResults.map((course, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => addCourseToGroup(req.id, groupIdx, course)}
                                              className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex justify-between items-start"
                                            >
                                              <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                  {course.code}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                  {course.title} • {course.institution}
                                                </div>
                                              </div>
                                              <Plus size={16} className="text-green-600 dark:text-green-400 mt-1" />
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {!isSearching && courseSearchQuery[searchKey] && courseSearchQuery[searchKey].length >= 2 && searchResults.length === 0 && (
                                        <div className="text-center py-2 text-sm text-gray-600 dark:text-gray-400">
                                          No courses found
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Course Options */}
                                  <div className="space-y-2">
                                    {group.options?.map((option, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded p-2">
                                        <div className="flex-1">
                                          <input
                                            type="text"
                                            value={option.course_code || ''}
                                            onChange={(e) => updateCourseOption(req.id, groupIdx, optIdx, 'course_code', e.target.value)}
                                            placeholder="Course Code"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <input
                                            type="text"
                                            value={option.institution || ''}
                                            onChange={(e) => updateCourseOption(req.id, groupIdx, optIdx, 'institution', e.target.value)}
                                            placeholder="Institution"
                                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          />
                                        </div>
                                        <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                          <input
                                            type="checkbox"
                                            checked={option.is_preferred || false}
                                            onChange={(e) => updateCourseOption(req.id, groupIdx, optIdx, 'is_preferred', e.target.checked)}
                                            className="rounded"
                                          />
                                          Preferred
                                        </label>
                                        <button
                                          onClick={() => deleteCourseOption(req.id, groupIdx, optIdx)}
                                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                          title="Delete option"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {requirements.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No requirements found for this version.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramRequirementsEditModal;
