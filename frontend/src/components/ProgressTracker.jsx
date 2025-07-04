// src/components/ProgressTracker.jsx
import React from 'react';
import { Target, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';

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
    return 'Just getting started! Add more courses to see progress!';
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

      {/* Outstanding Requirements */}
      {unmetRequirements.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <AlertCircle className="mr-2 text-yellow-600" size={18} />
            Outstanding Requirements ({unmetRequirements.length})
          </h4>
          <div className="space-y-3">
            {unmetRequirements.map((req, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-yellow-800 mb-1">{req.category}</h5>
                    {req.description && (
                      <p className="text-sm text-yellow-700 mb-2">{req.description}</p>
                    )}
                    <div className="flex items-center text-sm text-yellow-600">
                      <span className="font-medium">{req.credits_needed} credits needed</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Incomplete
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Use the course search to find classes that fulfill these requirements. 
              Look for courses marked with the appropriate requirement categories.
            </p>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {unmetRequirements.length === 0 && progress.total_credits_earned > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
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
    </div>
  );
};

export default ProgressTracker;