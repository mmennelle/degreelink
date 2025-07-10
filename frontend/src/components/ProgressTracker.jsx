import React from 'react';
import { Target, GraduationCap, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';

const ProgressTracker = ({ plan }) => {
  if (!plan || !plan.progress) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="mr-2" size={20} />
          Degree Progress
        </h3>
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>Progress information not available</p>
        </div>
      </div>
    );
  }

  const progress = plan.progress;
  const unmetRequirements = plan.unmet_requirements || [];
  const completionPercentage = Math.min(progress.completion_percentage || 0, 100);
  const isCompleted = completionPercentage >= 100;

  
  const groupCoursesByRequirement = (courses) => {
    const grouped = {};
    courses.forEach(course => {
      const category = course.requirement_category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(course);
    });
    return grouped;
  };

  const coursesByRequirement = groupCoursesByRequirement(plan.courses || []);

  
  const getRequirementProgress = (category) => {
    const courses = coursesByRequirement[category] || [];
    const completedCourses = courses.filter(c => c.status === 'completed');
    const inProgressCourses = courses.filter(c => c.status === 'in_progress');
    const plannedCourses = courses.filter(c => c.status === 'planned');
    
    const completedCredits = completedCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
    const inProgressCredits = inProgressCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
    const plannedCredits = plannedCourses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
    
    return {
      completed: completedCredits,
      inProgress: inProgressCredits,
      planned: plannedCredits,
      total: completedCredits + inProgressCredits + plannedCredits,
      courses: courses
    };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 75) return 'from-blue-500 to-green-500';
    if (percentage >= 50) return 'from-yellow-500 to-blue-500';
    if (percentage >= 25) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  const getProgressMessage = (percentage) => {
    if (percentage >= 100) return 'Congratulations! All requirements completed!';
    if (percentage >= 75) return 'You\'re almost there! Keep up the great work!';
    if (percentage >= 50) return 'Great progress! You\'re halfway there!';
    if (percentage >= 25) return 'Good start! Continue building your plan!';
    return 'This is the beginning of an incredible journey!';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper: get credits_required for a category from backend progress
  const getCreditsRequired = (category) => {
    if (!progress.requirement_progress) return 0;
    const req = progress.requirement_progress.find(r => r.category === category);
    return req ? req.credits_required : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <Target className="mr-2" size={20} />
        Degree Progress
      </h3>

      {/* Completion Status Banner */}
      {isCompleted && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <GraduationCap className="text-green-600 mr-3" size={32} />
            <div>
              <h4 className="font-semibold text-green-800 text-lg">
                🎉 Degree Requirements Complete!
              </h4>
              <p className="text-green-700">
                You have completed all degree requirements. Contact your advisor about graduation!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Overall Completion</span>
          <span className="text-lg font-bold text-gray-900">
            {completionPercentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-4 rounded-full bg-gradient-to-r ${getProgressColor(completionPercentage)} transition-all duration-500 ease-out`}
            style={{ width: `${completionPercentage}%` }}
          >
            <div className="h-full w-full bg-white bg-opacity-20"></div>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-medium">{getProgressMessage(completionPercentage)}</p>
          <p className="mt-1">
            <span className="font-semibold">{progress.total_credits_earned}</span> of{' '}
            <span className="font-semibold">{progress.total_credits_required}</span> credits completed
            {progress.remaining_credits > 0 && (
              <span className="text-blue-600 ml-2">
                • {progress.remaining_credits} credits remaining
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Credits Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {progress.total_credits_earned}
          </div>
          <div className="text-sm text-blue-800 font-medium">Credits Earned</div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {progress.total_credits_required}
          </div>
          <div className="text-sm text-gray-800 font-medium">Total Required</div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.max(0, progress.remaining_credits)}
          </div>
          <div className="text-sm text-orange-800 font-medium">Remaining</div>
        </div>
      </div>

      {/* Requirement Categories with Courses */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800 mb-4 flex items-center">
          <BookOpen className="mr-2" size={18} />
          Requirements Progress
        </h4>

        {/* Show each requirement category */}
        {unmetRequirements.map((req, index) => {
          const category = req.category;
          const creditsRequired = getCreditsRequired(category);
          const categoryProgress = getRequirementProgress(category);
          const isComplete = categoryProgress.completed >= creditsRequired;
          const progressPercentage = creditsRequired > 0 ? Math.min((categoryProgress.completed / creditsRequired) * 100, 100) : 0;

          return (
            <div key={index} className={`border rounded-lg p-4 ${
              isComplete ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className={`font-medium ${isComplete ? 'text-green-800' : 'text-yellow-800'}`}>
                      {category}
                    </h5>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isComplete ? (
                        <>
                          <CheckCircle className="mr-1" size={12} />
                          Complete
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-1" size={12} />
                          {req.credits_needed} credits needed
                        </>
                      )}
                    </span>
                  </div>
                  {req.description && (
                    <p className={`text-sm mt-1 ${isComplete ? 'text-green-700' : 'text-yellow-700'}`}>
                      {req.description}
                    </p>
                  )}
                  {/* Progress bar for this requirement */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={isComplete ? 'text-green-700' : 'text-yellow-700'}>
                        {categoryProgress.completed} / {creditsRequired} credits
                      </span>
                      <span className={isComplete ? 'text-green-700' : 'text-yellow-700'}>
                        {progressPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isComplete ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show courses that satisfy this requirement */}
              {categoryProgress.courses.length > 0 && (
                <div className="mt-4">
                  <h6 className={`text-sm font-medium mb-2 ${isComplete ? 'text-green-800' : 'text-yellow-800'}`}>
                    Courses in this category ({categoryProgress.courses.length}):
                  </h6>
                  <div className="space-y-2">
                    {categoryProgress.courses.map((course, courseIndex) => (
                      <div key={courseIndex} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex-1">
                          <span className="font-medium text-sm">
                            {course.course.code}: {course.course.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">
                              {course.credits || course.course.credits} credits
                            </span>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-600">
                              {course.course.institution}
                            </span>
                            {course.semester && course.year && (
                              <>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-600">
                                  {course.semester} {course.year}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {course.grade && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {course.grade}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(course.status)}`}>
                            {course.status === 'in_progress' ? 'In Progress' : 
                             course.status === 'completed' ? 'Completed' : 'Planned'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show if no courses are assigned to this requirement */}
              {categoryProgress.courses.length === 0 && (
                <div className="mt-4 p-3 bg-white border border-dashed border-gray-300 rounded text-center">
                  <p className="text-sm text-gray-500">
                    No courses assigned to this requirement yet.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add courses and assign them to "{req.category}" to fulfill this requirement.
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Show completed requirements */}
        {Object.entries(coursesByRequirement).map(([category, courses]) => {
          const isUnmet = unmetRequirements.some(req => req.category === category);
          if (isUnmet) return null;

          const creditsRequired = getCreditsRequired(category);
          const categoryProgress = getRequirementProgress(category);
          const progressPercentage = creditsRequired > 0 ? Math.min((categoryProgress.completed / creditsRequired) * 100, 100) : 0;

          return (
            <div key={category} className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-green-800">{category}</h5>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="mr-1" size={12} />
                      Complete
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {categoryProgress.completed} / {creditsRequired} credits completed
                  </p>
                  {/* Progress bar for this requirement */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-700">
                        {categoryProgress.completed} / {creditsRequired} credits
                      </span>
                      <span className="text-green-700">
                        {progressPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300 bg-green-500"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Show courses that satisfy this requirement */}
              <div className="mt-4">
                <h6 className="text-sm font-medium mb-2 text-green-800">
                  Courses in this category ({courses.length}):
                </h6>
                <div className="space-y-2">
                  {courses.map((course, courseIndex) => (
                    <div key={courseIndex} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex-1">
                        <span className="font-medium text-sm">
                          {course.course.code}: {course.course.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">
                            {course.credits || course.course.credits} credits
                          </span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-600">
                            {course.course.institution}
                          </span>
                          {course.semester && course.year && (
                            <>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-600">
                                {course.semester} {course.year}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.grade && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {course.grade}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(course.status)}`}>
                          {course.status === 'in_progress' ? 'In Progress' : 
                           course.status === 'completed' ? 'Completed' : 'Planned'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Completion Message */}
      {unmetRequirements.length === 0 && progress.total_credits_earned > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 mr-2" size={20} />
            <div>
              <h4 className="font-medium text-green-800">All Requirements Met!</h4>
              <p className="text-sm text-green-700 mt-1">
                You have satisfied all degree requirements. Great work on completing your academic plan!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Progress Message */}
      {progress.total_credits_earned === 0 && (
        <div className="text-center py-6">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="font-medium text-gray-700 mb-2">Ready to Start Your Journey?</h4>
          <p className="text-sm text-gray-500 mb-4">
            Add courses to your plan to see your progress toward degree completion.
          </p>
        </div>
      )}

      {/* Helpful Tips */}
      {unmetRequirements.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h5 className="font-medium text-blue-800 mb-2">💡 Tips for completing requirements:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use the course search to find classes that fulfill specific requirements</li>
            <li>• When adding courses, select the correct requirement category</li>
            <li>• Mark courses as "completed" to see them count toward your progress</li>
            <li>• Look for transfer equivalencies if you're a community college student</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;