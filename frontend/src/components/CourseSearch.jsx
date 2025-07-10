
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import api from '../services/api';

const CourseSearch = ({ onCourseSelect = null, onMultiSelect = null, planId = null, onAddToPlan = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [institution, setInstitution] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const toggleCourseSelection = (course) => {
    const isSelected = selectedCourses.some((c) => c.id === course.id);
    if (isSelected) {
      setSelectedCourses(selectedCourses.filter((c) => c.id !== course.id));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleAddSelected = () => {
    if (onMultiSelect && selectedCourses.length > 0) {
      onMultiSelect(selectedCourses);
      setSelectedCourses([]);
    }
  };
  const [error, setError] = useState(null);

  const searchCourses = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = { search: searchTerm };
      if (institution.trim()) {
        params.institution = institution;
      }
      
      const response = await api.searchCourses(params);
      setCourses(response.courses || []);
      
      if (response.courses?.length === 0) {
        setError('No courses found matching your search criteria');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError(error.message || 'Search failed. Please try again.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Search className="mr-2" size={20} />
        Course Search
      </h2>
      
      {/* Search Form */}
      <div className="">  {/*im not sure if this is needed or not*/}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search courses (code, title, description)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="w-48">
          <input
            type="text"
            placeholder="Institution (optional)"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={searchCourses}
          disabled={loading || !searchTerm.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {courses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">
            Search Results ({courses.length})
          </h3>
          {onMultiSelect && (
            <button
              onClick={handleAddSelected}
              disabled={selectedCourses.length === 0}
              className="mb-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Add Selected Courses ({selectedCourses.length})
            </button>
          )}
          {courses.map((course) => {
            const isSelected = selectedCourses.some((c) => c.id === course.id);
            return (
              <div
                key={course.id}
                className={`border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
                onClick={onMultiSelect ? () => toggleCourseSelection(course) : undefined}
                style={{ cursor: onMultiSelect ? 'pointer' : 'default' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-600">
                      {course.code}: {course.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {course.institution} • {course.credits} credit{course.credits !== 1 ? 's' : ''}
                      {course.department && ` • ${course.department}`}
                    </p>
                    {course.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {course.description.length > 150
                          ? `${course.description.substring(0, 150)}...`
                          : course.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); viewCourseDetails(course.id); }}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Details
                    </button>
                    {onCourseSelect && !onMultiSelect && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onCourseSelect(course); }}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Select
                      </button>
                    )}
                    {onMultiSelect && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCourseSelection(course)}
                        onClick={e => e.stopPropagation()}
                        className="form-checkbox h-5 w-5 text-blue-600"
                        aria-label="Select course"
                      />
                    )}
                    {/* Add to Plan button if planId and onAddToPlan are provided */}
                    {planId && onAddToPlan && (
                      <button
                        onClick={e => { e.stopPropagation(); onAddToPlan(course); }}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
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

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">Course Details</h3>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Course Info */}
              <div>
                <h4 className="text-lg font-medium text-blue-600">
                  {selectedCourse.course.code}: {selectedCourse.course.title}
                </h4>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  <span>📍 {selectedCourse.course.institution}</span>
                  <span>📚 {selectedCourse.course.credits} credits</span>
                  {selectedCourse.course.department && (
                    <span>🏢 {selectedCourse.course.department}</span>
                  )}
                </div>
              </div>
              
              {/* Description */}
              {selectedCourse.course.description && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Description</h5>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedCourse.course.description}
                  </p>
                </div>
              )}

              {/* Prerequisites */}
              {selectedCourse.course.prerequisites && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Prerequisites</h5>
                  <p className="text-gray-600">
                    {selectedCourse.course.prerequisites}
                  </p>
                </div>
              )}
              
              {/* Equivalencies */}
              {selectedCourse.equivalencies && selectedCourse.equivalencies.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">
                    Transfer Equivalencies ({selectedCourse.equivalencies.length})
                  </h5>
                  <div className="space-y-3">
                    {selectedCourse.equivalencies.map((equiv, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md border">
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-medium text-gray-800">
                            {equiv.course.code}: {equiv.course.title}
                          </h6>
                          <span className={`px-2 py-1 text-xs rounded ${
                            equiv.equivalency.equivalency_type === 'direct' 
                              ? 'bg-green-100 text-green-800'
                              : equiv.equivalency.equivalency_type === 'partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {equiv.equivalency.equivalency_type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 flex flex-col gap-2">
                          <p>🏫 {equiv.course.institution} • {equiv.course.credits} credits</p>
                          {equiv.equivalency.notes && (
                            <p className="mt-1">📝 {equiv.equivalency.notes}</p>
                          )}
                          {equiv.equivalency.approved_by && (
                            <p className="mt-1">✅ Approved by {equiv.equivalency.approved_by}</p>
                          )}
                          {/* Add to Plan button for this equivalency's course */}
                          {planId && onAddToPlan && equiv.course && equiv.course.id && (
                            <button
                              onClick={() => onAddToPlan(equiv.course)}
                              className="mt-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors self-start"
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
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ No transfer equivalencies found for this course. Contact your advisor for more information.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSearch;