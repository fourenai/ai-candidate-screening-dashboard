import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

export default function ProgressBar({ progress = 0, status, currentStep }) {
  const steps = [
    { name: 'Submitted', value: 0, description: 'Job requirements received' },
    { name: 'Analyzing Job', value: 20, description: 'Creating persona graph' },
    { name: 'Searching Resumes', value: 40, description: 'Finding matching candidates' },
    { name: 'Evaluating', value: 60, description: 'AI scoring in progress' },
    { name: 'Finalizing', value: 80, description: 'Generating insights' },
    { name: 'Complete', value: 100, description: 'Analysis ready' }
  ];

  const getStepStatus = (stepValue) => {
    if (progress > stepValue) return 'complete';
    if (progress >= stepValue) return 'current';
    return 'upcoming';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'error':
        return 'bg-red-600';
      case 'completed':
        return 'bg-green-600';
      case 'processing':
        return 'bg-blue-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Analysis Progress
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {currentStep || 'Initializing analysis...'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            style={{ width: `${progress}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ease-out ${getStatusColor()}`}
          >
            <div className="h-full bg-white bg-opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mt-8">
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(step.value);
            return (
              <div
                key={step.name}
                className={`flex flex-col items-center ${
                  index !== steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                {/* Step indicator */}
                <div className="relative">
                  {/* Line to next step */}
                  {index !== steps.length - 1 && (
                    <div
                      className={`absolute top-5 left-full w-full h-0.5 ${
                        stepStatus === 'complete'
                          ? 'bg-green-600'
                          : stepStatus === 'current'
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      style={{ width: 'calc(100% - 2.5rem)' }}
                    />
                  )}
                  
                  {/* Step circle */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      stepStatus === 'complete'
                        ? 'bg-green-600 border-green-600'
                        : stepStatus === 'current'
                        ? 'bg-blue-600 border-blue-600 animate-pulse'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {stepStatus === 'complete' ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : stepStatus === 'current' ? (
                      <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                    ) : (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Step label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-xs font-medium ${
                      stepStatus === 'complete'
                        ? 'text-green-600 dark:text-green-400'
                        : stepStatus === 'current'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.name}
                  </p>
                  {stepStatus === 'current' && (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-[100px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Info */}
      {status === 'processing' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Analysis in Progress
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                This typically takes 3-5 minutes depending on the number of resumes to analyze.
                You can safely leave this page and come back later.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Analysis Failed
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                An error occurred during the analysis. Please try again or contact support if the issue persists.
              </p>
              <button className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300">
                View Error Details
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Analysis Complete!
              </p>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Your results are ready. Review candidate evaluations and insights below.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}