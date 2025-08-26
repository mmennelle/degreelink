import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Plus, ChevronRight, ChevronLeft, Target, GraduationCap, AlertCircle, CheckCircle, User, Mail, X, Eye, EyeOff, Filter, Grid, List } from 'lucide-react';
import api from '../services/api';

const CourseSearch = ({ 
  onCourseSelect = null, 
  onMultiSelect = null, 
  planId = '', 
  setPlanId = null,
  onAddToPlan = null,
  program = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [institution, setInstitution] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [detectedCategories, setDetectedCategories] = useState(new Map());
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Mobile search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Removed the useEffect that fetched plans for security reasons
  // Plans are now managed at the app level via session access

  const toggleCourseSelection = (course) => {
    const isSelected = selectedCourses.some((c) => c.id === course.id);
    if (isSelected) {
      setSelectedCourses(selectedCourses.filter((c) => c.id !== course.id));
    } else {
      const courseWithCategory = {
        ...course,
        detectedCategory: detectedCategories.get(course.id) || 'Elective'
      };
      setSelectedCourses([...selectedCourses, courseWithCategory]);
    }
  };

  const handleAddSelected = () => {
    if (onMultiSelect && selectedCourses.length > 0) {
      onMultiSelect(selectedCourses);
      setSelectedCourses([]);
    }
  };

  const searchCourses = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      const trimmedSearch = searchTerm.trim();
      // If a level has been selected via the filter dropdown, use it.  Otherwise
      // fall back to the legacy behaviour of interpreting a four‑digit search
      // term divisible by 1000 as a level search.  When no level is detected
      // the search term is treated as free‑text.
      if (levelFilter) {
        params.level = parseInt(levelFilter, 10);
      } else {
        const numericLevel = /^[0-9]{4}$/.test(trimmedSearch) ? parseInt(trimmedSearch, 10) : null;
        if (numericLevel && numericLevel % 1000 === 0) {
          params.level = numericLevel;
        }
        if (trimmedSearch && (!numericLevel || numericLevel % 1000 !== 0)) {
          params.search = trimmedSearch;
        }
      }
      if (institution.trim()) {
        params.institution = institution;
      }

      const response = await api.searchCourses(params);
      const searchResults = response.courses || [];
      setCourses(searchResults);
      
      // Detect categories logic
      if (program && program.requirements && searchResults.length > 0) {
        const categoryMap = new Map();
        
        searchResults.forEach(course => {
          let detectedCategory = 'Elective';
          
          const match = program.requirements.find(req => {
            if (req.groups) {
              return req.groups.some(g => 
                g.course_options && 
                g.course_options.some(opt => opt.course_code === course.code)
              );
            }
            return false;
          });
          
          if (match) {
            detectedCategory = match.category;
          } else {
            const courseSubject = course.code.match(/^[A-Z]+/)?.[0];
            if (courseSubject) {
              const deptMatch = program.requirements.find(req => {
                const reqName = req.category.toLowerCase();
                return (
                  (courseSubject === 'BIOL' && reqName.includes('bio')) ||
                  (courseSubject === 'CHEM' && reqName.includes('chem')) ||
                  (courseSubject === 'MATH' && reqName.includes('math')) ||
                  (courseSubject === 'PHYS' && reqName.includes('phys')) ||
                  (courseSubject === 'ENG' && (reqName.includes('english') || reqName.includes('composition'))) ||
                  (courseSubject === 'HIST' && (reqName.includes('history') || reqName.includes('humanities'))) ||
                  (courseSubject === 'PHIL' && (reqName.includes('philosophy') || reqName.includes('humanities'))) ||
                  (courseSubject === 'SOC' && reqName.includes('social')) ||
                  (courseSubject === 'PSY' && reqName.includes('social'))
                );
              });
              if (deptMatch) detectedCategory = deptMatch.category;
            }
          }
          
          categoryMap.set(course.id, detectedCategory);
        });
        
        setDetectedCategories(categoryMap);
      }
      
      applyFilter(searchResults, categoryFilter);
      
      if (searchResults.length === 0) {
        setError('No courses found matching your search criteria');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError(error.message || 'Search failed. Please try again.');
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (coursesToFilter, category) => {
    if (category === 'all') {
      setFilteredCourses(coursesToFilter);
    } else {
      const filtered = coursesToFilter.filter(course => 
        detectedCategories.get(course.id) === category
      );
      setFilteredCourses(filtered);
    }
  };

  const handleCategoryFilterChange = (newCategory) => {
    setCategoryFilter(newCategory);
    applyFilter(courses, newCategory);
  };

  const viewCourseDetails = async (courseId) => {
    try {
      setLoading(true);
      const courseData = await api.getCourse(courseId);
      setSelectedCourse(courseData);
    } catch (error) {
      console.error('Failed to load course details:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchCourses();
    }
  };

  const showMultiSelect = !!onMultiSelect;
  const showSingleSelect = !!onCourseSelect && !showMultiSelect;
  const showAddToPlan = !!onAddToPlan;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors">
      {/* Mobile Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Search className="mr-2" size={20} />
            <span className="hidden sm:inline">Course Search</span>
            <span className="sm:hidden">Search</span>
          </h2>
          
          {/* Mobile View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Filter size={20} />
            </button>
            
            {courses.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Grid size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          {/* Primary Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>
            <button
              onClick={searchCourses}
              disabled={loading || !searchTerm.trim()}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search size={16} />
              )}
            </button>
          </div>

          {/* Collapsible Filters */}
          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden sm:block'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  placeholder="Filter by School"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Level
                </label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="">All Levels</option>
                  <option value="1000">1000</option>
                  <option value="2000">2000</option>
                  <option value="3000">3000</option>
                  <option value="4000">4000</option>
                  <option value="5000">5000</option>
                  <option value="6000">6000</option>
                  <option value="7000">7000</option>
                </select>
              </div>

            

              {program && program.requirements && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requirement
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => handleCategoryFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="all">All Categories</option>
                    {program.requirements.map(req => (
                      <option key={req.category} value={req.category}>
                        {req.category} ({courses.filter(c => detectedCategories.get(c.id) === req.category).length})
                      </option>
                    ))}
                    <option value="Elective">
                      General Elective ({courses.filter(c => detectedCategories.get(c.id) === 'Elective').length})
                    </option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="p-4 sm:p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-md">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {courses.length > 0 && (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                Search Results ({filteredCourses.length} of {courses.length})
              </h3>
              
              {showMultiSelect && selectedCourses.length > 0 && (
                <button
                  onClick={handleAddSelected}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  Add Selected ({selectedCourses.length})
                </button>
              )}
            </div>
            
            {filteredCourses.length === 0 && categoryFilter !== 'all' ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                <p className="text-gray-500 dark:text-gray-400">No courses found for the selected requirement category.</p>
                <button
                  onClick={() => handleCategoryFilterChange('all')}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Show all results
                </button>
              </div>
            ) : (
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}`}>
                {filteredCourses.map((course) => {
                  const isSelected = selectedCourses.some((c) => c.id === course.id);
                  const detectedCategory = detectedCategories.get(course.id) || 'Elective';
                  
                  return (
                    <div
                      key={course.id}
                      className={`border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer ${
                        showMultiSelect && isSelected ? 'ring-2 ring-blue-400 dark:ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={e => {
                        if (
                          e.target.tagName === 'BUTTON' ||
                          e.target.tagName === 'INPUT' ||
                          e.target.closest('button') ||
                          e.target.closest('input')
                        ) return;
                        viewCourseDetails(course.id);
                      }}
                    >
                      <div className="flex flex-col space-y-3">
                        {/* Course Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-blue-600 dark:text-blue-400 truncate">
                              {course.code}: {course.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {course.institution} • {course.credits} credit{course.credits !== 1 ? 's' : ''}
                              {course.department && ` • ${course.department}`}
                            </p>
                            {program && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
                                detectedCategory === 'Elective' 
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                              }`}>
                                {detectedCategory}
                              </span>
                            )}
                          </div>
                          
                          {showMultiSelect && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCourseSelection(course)}
                              onClick={e => e.stopPropagation()}
                              className="ml-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                              aria-label="Select course"
                            />
                          )}
                        </div>

                        {/* Course Description */}
                        {course.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {course.description.length > 120
                              ? `${course.description.substring(0, 120)}...`
                              : course.description}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); viewCourseDetails(course.id); }}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Details
                          </button>
                          
                          {showSingleSelect && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onCourseSelect(course); }}
                              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                            >
                              Select
                            </button>
                          )}
                          
                          {showAddToPlan && (
                            <button
                              onClick={e => { 
                                e.stopPropagation(); 
                                const courseWithCategory = {
                                  ...course,
                                  detectedCategory: detectedCategory
                                };
                                onAddToPlan(courseWithCategory); 
                              }}
                              className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors"
                            >
                              Add to Plan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Course Details Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[80vh] overflow-hidden flex flex-col transition-colors">
              {/* Modal Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Details</h3>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Course Info */}
                <div>
                  <h4 className="text-lg font-medium text-blue-600 dark:text-blue-400">
                    {selectedCourse.course.code}: {selectedCourse.course.title}
                  </h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>🏫 {selectedCourse.course.institution}</span>
                    <span>📚 {selectedCourse.course.credits} credits</span>
                    {selectedCourse.course.department && (
                      <span>🏢 {selectedCourse.course.department}</span>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                {selectedCourse.course.description && (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Description</h5>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {selectedCourse.course.description}
                    </p>
                  </div>
                )}

                {/* Prerequisites */}
                {selectedCourse.course.prerequisites && (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Prerequisites</h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedCourse.course.prerequisites}
                    </p>
                  </div>
                )}
                
                {/* Equivalencies */}
                {selectedCourse.equivalencies && selectedCourse.equivalencies.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                      Transfer Equivalencies ({selectedCourse.equivalencies.length})
                    </h5>
                    <div className="space-y-3">
                      {selectedCourse.equivalencies.map((equiv, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                            <h6 className="font-medium text-gray-800 dark:text-gray-200">
                              {equiv.course.code}: {equiv.course.title}
                            </h6>
                            <span className={`px-2 py-1 text-xs rounded self-start ${
                              equiv.equivalency.equivalency_type === 'direct' 
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                                : equiv.equivalency.equivalency_type === 'partial'
                                ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                            }`}>
                              {equiv.equivalency.equivalency_type}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <p>🏫 {equiv.course.institution} • 📚 {equiv.course.credits} credits</p>
                            {equiv.equivalency.notes && (
                              <p>📝 {equiv.equivalency.notes}</p>
                            )}
                            {equiv.equivalency.approved_by && (
                              <p>✅ Approved by {equiv.equivalency.approved_by}</p>
                            )}
                            {showAddToPlan && equiv.course && equiv.course.id && (
                              <button
                                onClick={() => {
                                  let detectedCategory = 'Elective';
                                  if (program && program.requirements) {
                                    const match = program.requirements.find(req => {
                                      if (req.groups) {
                                        return req.groups.some(g => 
                                          g.course_options && 
                                          g.course_options.some(opt => opt.course_code === equiv.course.code)
                                        );
                                      }
                                      return false;
                                    });
                                    if (match) detectedCategory = match.category;
                                  }
                                  
                                  const courseWithCategory = {
                                    ...equiv.course,
                                    detectedCategory: detectedCategory
                                  };
                                  onAddToPlan(courseWithCategory);
                                  setSelectedCourse(null);
                                }}
                                className="mt-2 px-3 py-1 text-sm bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors"
                              >
                                Add to Plan
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Equivalencies Message */}
                {selectedCourse.equivalencies && selectedCourse.equivalencies.length === 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-600 rounded-md">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                      ⚠️ No transfer equivalencies found for this course. Contact your advisor for more information.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSearch;