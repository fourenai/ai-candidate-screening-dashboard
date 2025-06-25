import { useState } from 'react';
import { Briefcase, FileText, AlertCircle, ChevronDown } from 'lucide-react';

export default function InputForm({ onSubmit, isSubmitting }) {
  const [inputType, setInputType] = useState('title'); // 'title' or 'description'
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (inputType === 'title' && !jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    } else if (inputType === 'title' && jobTitle.trim().length < 3) {
      newErrors.jobTitle = 'Job title must be at least 3 characters';
    }

    if (inputType === 'description' && !jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    } else if (inputType === 'description' && jobDescription.trim().length < 50) {
      newErrors.jobDescription = 'Job description must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formData = {
      jobTitle: inputType === 'title' ? jobTitle : extractTitleFromDescription(jobDescription),
      jobDescription: inputType === 'description' ? jobDescription : '',
      experienceLevel,
      inputType
    };

    onSubmit(formData);
  };

  const extractTitleFromDescription = (description) => {
    // Try to extract job title from the first line of the description
    const firstLine = description.split('\n')[0];
    if (firstLine.length < 100) {
      return firstLine.replace(/[:.]/g, '').trim();
    }
    return 'Extracted Position';
  };

  const clearForm = () => {
    setJobTitle('');
    setJobDescription('');
    setErrors({});
  };

  const sampleTitles = [
    'Senior Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'Marketing Manager',
    'Sales Executive'
  ];

  return (
    <form onSubmit={handleSubmit} id="job-form" className="space-y-6">
      {/* Input Type Toggle */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        <button
          type="button"
          onClick={() => {
            setInputType('title');
            setErrors({});
          }}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputType === 'title'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Job Title
        </button>
        <button
          type="button"
          onClick={() => {
            setInputType('description');
            setErrors({});
          }}
          className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputType === 'description'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Full Description
        </button>
      </div>

      {/* Job Title Input */}
      {inputType === 'title' && (
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Title
          </label>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              if (errors.jobTitle) {
                setErrors({ ...errors, jobTitle: '' });
              }
            }}
            placeholder="e.g., Senior Software Engineer"
            className={`w-full px-4 py-3 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.jobTitle ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting}
          />
          {errors.jobTitle && (
            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.jobTitle}
            </div>
          )}
          
          {/* Sample titles */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {sampleTitles.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => setJobTitle(title)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Job Description Input */}
      {inputType === 'description' && (
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              if (errors.jobDescription) {
                setErrors({ ...errors, jobDescription: '' });
              }
            }}
            placeholder="Paste the complete job description here..."
            rows={8}
            className={`w-full px-4 py-3 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.jobDescription ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting}
          />
          {errors.jobDescription && (
            <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.jobDescription}
            </div>
          )}
        </div>
      )}

      {/* Experience Level */}
      <div>
        <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Experience Level
        </label>
        <div className="relative">
          <select
            id="experienceLevel"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isSubmitting}
          >
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (2-5 years)</option>
            <option value="senior">Senior Level (5-10 years)</option>
            <option value="lead">Lead/Principal (10+ years)</option>
            <option value="executive">Executive Level</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={clearForm}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          disabled={isSubmitting}
        >
          Clear Form
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Start Analysis'
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {inputType === 'title' 
                ? 'We\'ll search our database for matching job descriptions and analyze resumes accordingly.'
                : 'Provide a detailed job description for more accurate candidate matching and evaluation.'}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}