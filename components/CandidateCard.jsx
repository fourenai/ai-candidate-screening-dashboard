import { 
    User, 
    Mail, 
    Phone, 
    Briefcase, 
    Star, 
    Calendar,
    ArrowRight,
    Trophy,
    TrendingUp,
    AlertCircle
  } from 'lucide-react';
  
  export default function CandidateCard({ candidate, viewMode = 'grid', onView, onScheduleInterview }) {
    const getScoreColor = (score) => {
      if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      if (score >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      if (score >= 40) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    };
  
    const getRecommendationColor = (recommendation) => {
      switch (recommendation) {
        case 'Strongly Recommend':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'Recommend':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'Maybe':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'Not Recommended':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
    };
  
    const getInitials = (name) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };
  
    if (viewMode === 'list') {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {getInitials(candidate.candidate_name)}
                </span>
              </div>
  
              {/* Info */}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {candidate.candidate_name}
                </h4>
                <div className="flex items-center space-x-4 mt-1">
                  {candidate.current_role && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {candidate.current_role}
                    </span>
                  )}
                  {candidate.email && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {candidate.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
  
            {/* Scores and Actions */}
            <div className="flex items-center space-x-6">
              {/* Category Scores */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Technical</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {candidate.technical_score || '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {candidate.experience_score || '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Soft Skills</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {candidate.soft_skills_score || '—'}
                  </p>
                </div>
              </div>
  
              {/* Overall Score */}
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(candidate.overall_score)}`}>
                  {candidate.overall_score}
                </div>
              </div>
  
              {/* Recommendation */}
              <div className="hidden sm:block">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(candidate.recommendation)}`}>
                  {candidate.recommendation}
                </span>
              </div>
  
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onView}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="View Details"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onScheduleInterview}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Schedule Interview"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  
    // Grid View (Card)
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden group">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {getInitials(candidate.candidate_name)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {candidate.candidate_name}
                </h3>
                {candidate.current_role && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {candidate.current_role}
                  </p>
                )}
              </div>
            </div>
            
            {/* Overall Score */}
            <div className={`px-3 py-1 rounded-full text-lg font-bold ${getScoreColor(candidate.overall_score)}`}>
              {candidate.overall_score}
            </div>
          </div>
  
          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            {candidate.email && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </div>
            )}
            {candidate.phone && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{candidate.phone}</span>
              </div>
            )}
          </div>
  
          {/* Recommendation Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(candidate.recommendation)}`}>
              {candidate.recommendation === 'Strongly Recommend' && <Trophy className="w-3 h-3 mr-1" />}
              {candidate.recommendation}
            </span>
          </div>
  
          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Technical</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {candidate.technical_score || '—'}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Experience</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {candidate.experience_score || '—'}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Soft Skills</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {candidate.soft_skills_score || '—'}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Cultural Fit</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {candidate.cultural_fit_score || '—'}
                </span>
              </div>
            </div>
          </div>
  
          {/* Key Insights */}
          {candidate.key_strengths && candidate.key_strengths.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Key Strengths</p>
              <div className="flex flex-wrap gap-1">
                {candidate.key_strengths.slice(0, 3).map((strength, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <Star className="w-3 h-3 mr-1" />
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}
  
          {/* Risk Level */}
          {candidate.risk_level && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-3 h-3 mr-1" />
              Risk Level: <span className="font-medium ml-1 capitalize">{candidate.risk_level}</span>
            </div>
          )}
        </div>
  
        {/* Actions */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={onView}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={onScheduleInterview}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-1.5" />
            Schedule Interview
          </button>
        </div>
      </div>
    );
  }