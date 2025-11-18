import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Plus, Edit, Trash2, ChevronDown, ChevronRight, Save } from 'lucide-react';

const UploadConfirmationModal = ({ previewData, onConfirm, onCancel, uploadType = 'requirements' }) => {
  const [expandedSections, setExpandedSections] = useState({
    programsNew: true,
    requirementsNew: true,
    requirementsUpdated: true,
    groupsDeleted: true,
    coursesNew: true,
    coursesUpdated: true,
    equivalenciesNew: true,
    equivalenciesUpdated: true
  });
  
  const [editedData, setEditedData] = useState({
    requirements: {
      new: [],
      updated: []
    }
  });
  
  const [editMode, setEditMode] = useState({});

  // Initialize editedData when previewData changes
  useEffect(() => {
    if (previewData) {
      if (uploadType === 'requirements') {
        setEditedData({
          requirements: {
            new: previewData.requirements?.new || [],
            updated: previewData.requirements?.updated || []
          }
        });
      }
      // For courses and equivalencies, we don't need editing - just preview
    }
  }, [previewData, uploadType]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleEdit = (section, index) => {
    const key = `${section}-${index}`;
    setEditMode(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateRequirement = (section, index, field, value) => {
    setEditedData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [section]: prev.requirements[section].map((req, i) => 
          i === index ? { ...req, [field]: value } : req
        )
      }
    }));
  };

  const handleConfirm = () => {
    if (uploadType === 'requirements') {
      onConfirm(editedData);
    } else {
      // For courses and equivalencies, just confirm without edited data
      onConfirm();
    }
  };

  if (!previewData) return null;

  // Determine what kind of data we have and calculate summary
  let summary, hasChanges, errors, warnings;
  
  if (uploadType === 'requirements') {
    const { summary: reqSummary, programs, requirements, groups, errors: reqErrors, warnings: reqWarnings } = previewData;
    summary = reqSummary;
    errors = reqErrors;
    warnings = reqWarnings;
    hasChanges = summary.programs_new > 0 || 
                summary.requirements_new > 0 || 
                summary.requirements_updated > 0 ||
                summary.groups_new > 0 ||
                summary.groups_deleted > 0;
  } else if (uploadType === 'courses') {
    const { courses, errors: courseErrors, warnings: courseWarnings } = previewData;
    errors = courseErrors;
    warnings = courseWarnings;
    summary = {
      courses_new: courses?.new?.length || 0,
      courses_updated: courses?.updated?.length || 0,
      courses_unchanged: courses?.unchanged?.length || 0
    };
    hasChanges = summary.courses_new > 0 || summary.courses_updated > 0;
  } else if (uploadType === 'equivalencies') {
    const { equivalencies, errors: equivErrors, warnings: equivWarnings } = previewData;
    errors = equivErrors;
    warnings = equivWarnings;
    summary = {
      equivalencies_new: equivalencies?.new?.length || 0,
      equivalencies_updated: equivalencies?.updated?.length || 0,
      equivalencies_unchanged: equivalencies?.unchanged?.length || 0
    };
    hasChanges = summary.equivalencies_new > 0 || summary.equivalencies_updated > 0;
  }

  // Get title based on upload type
  const getTitle = () => {
    switch (uploadType) {
      case 'courses': return 'Confirm Courses Upload';
      case 'equivalencies': return 'Confirm Equivalencies Upload';
      default: return 'Confirm Requirements Upload';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Upload Summary</h3>
            
            {uploadType === 'requirements' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Total Rows</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_rows}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">New Programs</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.programs_new}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">New Requirements</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.requirements_new}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Updated Requirements</div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.requirements_updated}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">New Groups</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.groups_new}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Deleted Groups</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.groups_deleted}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Unchanged</div>
                  <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">{summary.requirements_unchanged}</div>
                </div>
              </div>
            )}

            {uploadType === 'courses' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">New Courses</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.courses_new}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Updated Courses</div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.courses_updated}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Unchanged</div>
                  <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">{summary.courses_unchanged}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Total</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.courses_new + summary.courses_updated + summary.courses_unchanged}
                  </div>
                </div>
              </div>
            )}

            {uploadType === 'equivalencies' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">New Equivalencies</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.equivalencies_new}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Updated Equivalencies</div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.equivalencies_updated}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Unchanged</div>
                  <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">{summary.equivalencies_unchanged}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Total</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.equivalencies_new + summary.equivalencies_updated + summary.equivalencies_unchanged}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Errors */}
          {errors?.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Errors ({errors.length})</h3>
              </div>
              <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings?.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={20} />
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Warnings ({warnings.length})</h3>
              </div>
              <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Courses Preview Sections */}
          {uploadType === 'courses' && (
            <>
              {/* New Courses */}
              {previewData.courses?.new?.length > 0 && (
                <div className="border border-green-200 dark:border-green-700 rounded-lg">
                  <button
                    onClick={() => toggleSection('coursesNew')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="text-green-600 dark:text-green-400" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        New Courses ({previewData.courses.new.length})
                      </h3>
                    </div>
                    {expandedSections.coursesNew ? <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />}
                  </button>
                  {expandedSections.coursesNew && (
                    <div className="p-4 pt-0 space-y-2">
                      {previewData.courses.new.map((course, idx) => (
                        <div key={idx} className="bg-green-50 dark:bg-green-900/30 rounded p-3 text-sm">
                          <div className="font-semibold text-gray-900 dark:text-white">{course.code} - {course.name || course.title}</div>
                          <div className="text-gray-600 dark:text-gray-300">Institution: {course.institution}</div>
                          <div className="text-gray-600 dark:text-gray-300">Credits: {course.credits}</div>
                          {course.prerequisites && <div className="text-gray-600 dark:text-gray-300">Prerequisites: {course.prerequisites}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Updated Courses */}
              {previewData.courses?.updated?.length > 0 && (
                <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <button
                    onClick={() => toggleSection('coursesUpdated')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Edit className="text-yellow-600 dark:text-yellow-400" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Updated Courses ({previewData.courses.updated.length})
                      </h3>
                    </div>
                    {expandedSections.coursesUpdated ? <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />}
                  </button>
                  {expandedSections.coursesUpdated && (
                    <div className="p-4 pt-0 space-y-2">
                      {previewData.courses.updated.map((course, idx) => (
                        <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/30 rounded p-3 text-sm">
                          <div className="font-semibold text-gray-900 dark:text-white">{course.code} - {course.name || course.title}</div>
                          <div className="text-gray-600 dark:text-gray-300">Institution: {course.institution}</div>
                          <div className="text-gray-600 dark:text-gray-300">Credits: {course.credits}</div>
                          {course.prerequisites && <div className="text-gray-600 dark:text-gray-300">Prerequisites: {course.prerequisites}</div>}
                          {course.changes && course.changes.length > 0 && (
                            <div className="text-yellow-700 dark:text-yellow-300 text-xs mt-2">
                              <strong>Changes:</strong> {course.changes.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Equivalencies Preview Sections */}
          {uploadType === 'equivalencies' && (
            <>
              {/* New Equivalencies */}
              {previewData.equivalencies?.new?.length > 0 && (
                <div className="border border-green-200 dark:border-green-700 rounded-lg">
                  <button
                    onClick={() => toggleSection('equivalenciesNew')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="text-green-600 dark:text-green-400" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        New Equivalencies ({previewData.equivalencies.new.length})
                      </h3>
                    </div>
                    {expandedSections.equivalenciesNew ? <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />}
                  </button>
                  {expandedSections.equivalenciesNew && (
                    <div className="p-4 pt-0 space-y-2">
                      {previewData.equivalencies.new.map((equiv, idx) => (
                        <div key={idx} className="bg-green-50 dark:bg-green-900/30 rounded p-3 text-sm">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {equiv.from_course} → {equiv.to_course}
                          </div>
                          <div className="text-gray-600 dark:text-gray-300">
                            Type: {equiv.equivalency_type}
                          </div>
                          {equiv.notes && (
                            <div className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                              Notes: {equiv.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Updated Equivalencies */}
              {previewData.equivalencies?.updated?.length > 0 && (
                <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <button
                    onClick={() => toggleSection('equivalenciesUpdated')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Edit className="text-yellow-600 dark:text-yellow-400" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Updated Equivalencies ({previewData.equivalencies.updated.length})
                      </h3>
                    </div>
                    {expandedSections.equivalenciesUpdated ? <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />}
                  </button>
                  {expandedSections.equivalenciesUpdated && (
                    <div className="p-4 pt-0 space-y-2">
                      {previewData.equivalencies.updated.map((equiv, idx) => (
                        <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/30 rounded p-3 text-sm">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {equiv.from_course} → {equiv.to_course}
                          </div>
                          <div className="text-gray-600 dark:text-gray-300">
                            Type: {equiv.equivalency_type}
                          </div>
                          {equiv.changes && equiv.changes.length > 0 && (
                            <div className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                              Changes: {equiv.changes.join(', ')}
                            </div>
                          )}
                          {equiv.notes && (
                            <div className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                              Notes: {equiv.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Requirements Preview Sections */}
          {uploadType === 'requirements' && (
            <>
              {/* New Programs */}
              {previewData.programs?.new?.length > 0 && (
            <div className="border border-green-200 dark:border-green-700 rounded-lg">
              <button
                onClick={() => toggleSection('programsNew')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="text-green-600 dark:text-green-400" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    New Programs ({programs.new.length})
                  </h3>
                </div>
                {expandedSections.programsNew ? <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />}
              </button>
              {expandedSections.programsNew && (
                <div className="p-4 pt-0 space-y-2">
                  {programs.new.map((prog, idx) => (
                    <div key={idx} className="bg-green-50 dark:bg-green-900/30 rounded p-3 text-sm">
                      <div className="font-semibold text-gray-900 dark:text-white">{prog.name}</div>
                      <div className="text-gray-600 dark:text-gray-300">Institution: {prog.institution}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Existing Programs */}
          {previewData.programs?.existing?.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-gray-600 dark:text-gray-400" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Existing Programs ({previewData.programs.existing.length})
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* New Requirements */}
          {editedData.requirements.new?.length > 0 && (
            <div className="border border-green-200 dark:border-green-700 rounded-lg">
              <button
                onClick={() => toggleSection('requirementsNew')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="text-green-600 dark:text-green-400" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    New Requirements ({editedData.requirements.new.length})
                  </h3>
                </div>
                {expandedSections.requirementsNew ? <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />}
              </button>
              {expandedSections.requirementsNew && (
                <div className="p-4 pt-0 space-y-2 max-h-64 overflow-y-auto">
                  {editedData.requirements.new.map((req, idx) => {
                    const editKey = `new-${idx}`;
                    const isEditing = editMode[editKey];
                    
                    return (
                      <div key={idx} className="bg-green-50 dark:bg-green-900/30 rounded p-3 text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {req.program} - {req.category}
                          </div>
                          <button
                            onClick={() => toggleEdit('new', idx)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            title={isEditing ? 'Save' : 'Edit'}
                          >
                            {isEditing ? <Save size={16} /> : <Edit size={16} />}
                          </button>
                        </div>
                        
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400">Type:</label>
                              <select
                                value={req.requirement_type}
                                onChange={(e) => updateRequirement('new', idx, 'requirement_type', e.target.value)}
                                className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option value="simple">Simple</option>
                                <option value="grouped">Grouped</option>
                              </select>
                            </div>
                            {req.semester && (
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Semester:</label>
                                <input
                                  type="text"
                                  value={req.semester}
                                  onChange={(e) => updateRequirement('new', idx, 'semester', e.target.value)}
                                  className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="text-gray-600 dark:text-gray-300">
                              Type: {req.requirement_type}
                              {req.semester && req.year && ` | ${req.semester} ${req.year}`}
                            </div>
                            {req.groups?.length > 0 && (
                              <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                                Groups: {req.groups.join(', ')}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Updated Requirements */}
          {editedData.requirements.updated?.length > 0 && (
            <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <button
                onClick={() => toggleSection('requirementsUpdated')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Edit className="text-yellow-600 dark:text-yellow-400" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Updated Requirements ({editedData.requirements.updated.length})
                  </h3>
                </div>
                {expandedSections.requirementsUpdated ? <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />}
              </button>
              {expandedSections.requirementsUpdated && (
                <div className="p-4 pt-0 space-y-2 max-h-64 overflow-y-auto">
                  {editedData.requirements.updated.map((req, idx) => {
                    const editKey = `updated-${idx}`;
                    const isEditing = editMode[editKey];
                    
                    return (
                      <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/30 rounded p-3 text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {req.program} - {req.category}
                            </div>
                            {req.semester && req.year && (
                              <div className="text-gray-600 dark:text-gray-400 text-xs">
                                {req.semester} {req.year}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => toggleEdit('updated', idx)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            title={isEditing ? 'Save' : 'Edit'}
                          >
                            {isEditing ? <Save size={16} /> : <Edit size={16} />}
                          </button>
                        </div>
                        
                        {isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400">Type:</label>
                              <select
                                value={req.requirement_type}
                                onChange={(e) => updateRequirement('updated', idx, 'requirement_type', e.target.value)}
                                className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option value="simple">Simple</option>
                                <option value="grouped">Grouped</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400">Credits Required:</label>
                              <input
                                type="number"
                                value={req.credits_required || ''}
                                onChange={(e) => updateRequirement('updated', idx, 'credits_required', parseInt(e.target.value) || 0)}
                                className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400">Description:</label>
                              <textarea
                                value={req.description || ''}
                                onChange={(e) => updateRequirement('updated', idx, 'description', e.target.value)}
                                className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                rows="2"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-yellow-800 dark:text-yellow-200 font-medium mt-1">
                              Changes: {req.changes.join(', ')}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                              Type: {req.requirement_type} | Credits: {req.credits_required}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Deleted Groups */}
          {previewData.groups?.deleted?.length > 0 && (
            <div className="border border-red-200 dark:border-red-700 rounded-lg">
              <button
                onClick={() => toggleSection('groupsDeleted')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="text-red-600 dark:text-red-400" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Groups to be Deleted ({previewData.groups.deleted.length})
                  </h3>
                </div>
                {expandedSections.groupsDeleted ? <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" /> : <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />}
              </button>
              {expandedSections.groupsDeleted && (
                <div className="p-4 pt-0 space-y-2 max-h-64 overflow-y-auto">
                  {previewData.groups.deleted.map((group, idx) => (
                    <div key={idx} className="bg-red-50 dark:bg-red-900/30 rounded p-3 text-sm">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {group.program} - {group.category}
                      </div>
                      <div className="text-red-800 dark:text-red-200">
                        Group: {group.group_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Groups */}
          {previewData.groups?.new?.length > 0 && (
            <div className="border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="text-green-600 dark:text-green-400" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  New Groups ({previewData.groups.new.length})
                </h3>
              </div>
              <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {previewData.groups.new.map((group, idx) => (
                  <div key={idx} className="bg-green-50 dark:bg-green-900/30 rounded p-2 text-gray-900 dark:text-white">
                    {group.program} - {group.category}: {group.group_name}
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}

          {!hasChanges && (
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center">
              <CheckCircle className="mx-auto text-gray-400 dark:text-gray-500 mb-2" size={48} />
              <p className="text-gray-600 dark:text-gray-300">No changes detected. All data matches existing records.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={errors?.length > 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              errors?.length > 0
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
            }`}
          >
            {hasChanges ? 'Confirm Upload' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadConfirmationModal;
