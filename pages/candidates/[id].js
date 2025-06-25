// pages/candidates/[id].js
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiMail, 
  FiPhone, 
  FiDownload,
  FiCalendar,
  FiFileText,
  FiStar,
  FiTrendingUp,
  FiTarget,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiBriefcase
} from 'react-icons/fi';
import { Radar, Bar } from 'react-chartjs-2';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import Header from '../../components/Header';
import { api } from '../../services/api';

const CandidateDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();

  // Fetch candidate details
  const { data: candidate, isLoading } = useQuery(
    ['candidate', id],
    () => api.getCandidateDetails(id),
    {
      enabled: !!id,
      onError: (error) => {
        console.error('Failed to fetch candidate:', error);
        toast.error('Failed to load candidate details');
      }
    }
  );

  // Fetch candidate evaluation for the current job
  const { data: evaluation } = useQuery(
    ['candidateEvaluation', id],
    async () => {
      // Get requirementId from query or localStorage
      const requirementId = router.query.requirementId || localStorage.getItem('currentRequirementId');
      if (requirementId) {
        return api.getCandidateEvaluation(requirementId, id);
      }
      return null;
    },
    {
      enabled: !!id,
    }
  );

  const downloadResume = () => {
    // In production, this would download the actual resume file
    toast.success('Resume download started!');
  };

  const scheduleInterview = () => {
    const requirementId = router.query.requirementId || localStorage.getItem('currentRequirementId');
    router.push({
      pathname: '/interviews/schedule',
      query: { 
        requirementId,
        candidateId: id,
        candidateName: candidate?.candidate_name
      }
    });
  };

  // Chart data for skills radar
  const skillsData = {
    labels: ['Technical', 'Experience', 'Soft Skills', 'Cultural Fit', 'Leadership', 'Innovation'],
    datasets: [{
      label: candidate?.candidate_name || 'Candidate',
      data: [
        evaluation?.technical_score || 0,
        evaluation?.experience_score || 0,
        evaluation?.soft_skills_score || 0,
        evaluation?.cultural_fit_score || 0,
        evaluation?.soft_skills_analysis?.leadership_potential?.score || 70,
        80, // Placeholder for innovation
      ],
      backgroundColor: 'rgba(166, 66, 124, 0.2)',
      borderColor: 'rgba(166, 66, 124, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(166, 66, 124, 1)',
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      r: {
        angleLines: {
          color: theme === 'dark' ? 'rgba(245, 234, 227, 0.1)' : 'rgba(16, 30, 66, 0.1)',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(245, 234, 227, 0.1)' : 'rgba(16, 30, 66, 0.1)',
        },
        pointLabels: {
          color: theme === 'dark' ? '#F5EAE3' : '#101E42',
          font: { size: 12 },
        },
        ticks: {
          color: theme === 'dark' ? 'rgba(245, 234, 227, 0.6)' : 'rgba(16, 30, 66, 0.6)',
          backdropColor: 'transparent',
        },
        beginAtZero: true,
        max: 100,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spooled-white dark:bg-astral-ink">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-sakura/20 dark:bg-cold-current/20 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-sakura/10 dark:bg-cold-current/10 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-spooled-white dark:bg-astral-ink">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <FiAlertCircle className="w-16 h-16 mx-auto text-astral-ink/40 dark:text-spooled-white/40 mb-4" />
            <h2 className="text-xl font-semibold text-astral-ink dark:text-spooled-white">
              Candidate not found
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spooled-white dark:bg-astral-ink">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-astral-ink/70 dark:text-spooled-white/70 hover:text-astral-ink dark:hover:text-spooled-white mb-6"
        >
          <FiArrowLeft />
          Back
        </motion.button>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold text-astral-ink dark:text-spooled-white mb-2">
                {candidate.candidate_name}
              </h1>
              <div className="flex items-center gap-4 text-astral-ink/60 dark:text-spooled-white/60 mb-4">
                <div className="flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4" />
                  <span>{candidate.curent_role || candidate.current_role || 'Not specified'}</span>
                </div>
                {evaluation?.experience_profile_analysis?.years_of_experience && (
                  <div className="flex items-center gap-2">
                    <FiStar className="w-4 h-4" />
                    <span>{evaluation.experience_profile_analysis.years_of_experience} years experience</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4">
                {candidate.email && (
                  <a 
                    href={`mailto:${candidate.email}`}
                    className="flex items-center gap-2 text-cold-current dark:text-sakura hover:underline"
                  >
                    <FiMail className="w-4 h-4" />
                    {candidate.email}
                  </a>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-astral-ink/60 dark:text-spooled-white/60">
                    <FiPhone className="w-4 h-4" />
                    {candidate.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-sakura/20 dark:text-cold-current/20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(evaluation?.overall_score / 100) * 377} 377`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A6427C" />
                      <stop offset="100%" stopColor="#DFB1B6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-astral-ink dark:text-spooled-white">
                    {evaluation?.overall_score || 0}%
                  </span>
                  <span className="text-xs text-astral-ink/60 dark:text-spooled-white/60">
                    Overall Score
                  </span>
                </div>
              </div>
              
              {evaluation?.recommendation && (
                <div className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  evaluation.recommendation.toLowerCase().includes('strongly') 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : evaluation.recommendation.toLowerCase().includes('recommend')
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                )}>
                  {evaluation.recommendation}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-sakura/20 dark:border-cold-current/20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={scheduleInterview}
              className="px-6 py-3 bg-gradient-to-r from-pink-ballad to-sakura text-white rounded-lg font-medium hover:shadow-sakura transition-all flex items-center gap-2"
            >
              <FiCalendar className="w-5 h-5" />
              Schedule Interview
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadResume}
              className="px-6 py-3 bg-cold-current dark:bg-astral-ink text-white rounded-lg font-medium hover:shadow-astral transition-all flex items-center gap-2"
            >
              <FiDownload className="w-5 h-5" />
              Download Resume
            </motion.button>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Evaluation Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Score Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-6">
                Score Breakdown
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Technical', score: evaluation?.technical_score, icon: FiFileText },
                  { label: 'Experience', score: evaluation?.experience_score, icon: FiTrendingUp },
                  { label: 'Soft Skills', score: evaluation?.soft_skills_score, icon: FiStar },
                  { label: 'Cultural Fit', score: evaluation?.cultural_fit_score, icon: FiTarget },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <item.icon className="w-8 h-8 mx-auto mb-2 text-astral-ink/60 dark:text-spooled-white/60" />
                    <div className="text-2xl font-bold text-astral-ink dark:text-spooled-white">
                      {item.score || 0}%
                    </div>
                    <div className="text-sm text-astral-ink/60 dark:text-spooled-white/60">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {evaluation?.score_justification && (
                <div className="mt-6 p-4 bg-sakura/10 dark:bg-cold-current/20 rounded-lg">
                  <p className="text-sm text-astral-ink/70 dark:text-spooled-white/70">
                    {evaluation.score_justification}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Strengths & Concerns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-6">
                Strengths & Areas of Improvement
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h3 className="font-medium text-astral-ink dark:text-spooled-white mb-3 flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5 text-green-500" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {(evaluation?.strengths?.list || []).map((strength, index) => (
                      <li key={index} className="text-sm text-astral-ink/70 dark:text-spooled-white/70 pl-6 relative">
                        <span className="absolute left-0 top-1 w-2 h-2 bg-green-500 rounded-full"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns */}
                <div>
                  <h3 className="font-medium text-astral-ink dark:text-spooled-white mb-3 flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5 text-yellow-500" />
                    Areas of Improvement
                  </h3>
                  <ul className="space-y-2">
                    {(evaluation?.concerns?.list || []).map((concern, index) => (
                      <li key={index} className="text-sm text-astral-ink/70 dark:text-spooled-white/70 pl-6 relative">
                        <span className="absolute left-0 top-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* HR Recommendation */}
            {evaluation?.hr_recommendation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-pink-ballad/10 to-sakura/10 dark:from-cold-current/20 dark:to-astral-ink/20 rounded-xl p-6"
              >
                <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-4">
                  HR Recommendation
                </h2>
                <p className="text-astral-ink/70 dark:text-spooled-white/70">
                  {evaluation.hr_recommendation}
                </p>
              </motion.div>
            )}

            {/* Interview Focus Areas */}
            {evaluation?.interview_focus?.list && evaluation.interview_focus.list.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-4">
                  Interview Focus Areas
                </h2>
                <ul className="space-y-3">
                  {evaluation.interview_focus.list.map((focus, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FiTarget className="w-5 h-5 text-cold-current dark:text-sakura flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-astral-ink/70 dark:text-spooled-white/70">
                        {focus}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Right Column - Skills Radar & Additional Info */}
          <div className="space-y-8">
            {/* Skills Radar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-4">
                Skills Profile
              </h2>
              <div className="h-[300px]">
                <Radar data={skillsData} options={radarOptions} />
              </div>
            </motion.div>

            {/* Candidate Persona */}
            {evaluation?.candidate_persona_analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-4">
                  Candidate Profile
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-astral-ink/60 dark:text-spooled-white/60 mb-1">
                      Likely Persona
                    </h3>
                    <p className="font-medium text-astral-ink dark:text-spooled-white">
                      {evaluation.candidate_persona_analysis.likely_persona || 'Not determined'}
                    </p>
                  </div>

                  {evaluation.candidate_persona_analysis.domain_pattern && (
                    <div>
                      <h3 className="text-sm font-medium text-astral-ink/60 dark:text-spooled-white/60 mb-1">
                        Domain Pattern
                      </h3>
                      <p className="text-sm text-astral-ink/70 dark:text-spooled-white/70">
                        {evaluation.candidate_persona_analysis.domain_pattern}
                      </p>
                    </div>
                  )}

                  {evaluation.candidate_persona_analysis.risk_profile && (
                    <div>
                      <h3 className="text-sm font-medium text-astral-ink/60 dark:text-spooled-white/60 mb-1">
                        Risk Assessment
                      </h3>
                      <div className={clsx(
                        'inline-flex px-3 py-1 rounded-full text-sm font-medium',
                        evaluation.candidate_persona_analysis.risk_profile.level === 'low'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : evaluation.candidate_persona_analysis.risk_profile.level === 'high'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      )}>
                        {evaluation.candidate_persona_analysis.risk_profile.level} Risk
                      </div>
                      {evaluation.candidate_persona_analysis.risk_profile.rationale && (
                        <p className="text-sm text-astral-ink/70 dark:text-spooled-white/70 mt-2">
                          {evaluation.candidate_persona_analysis.risk_profile.rationale}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Technical Assessment */}
            {evaluation?.technical_assessment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-4">
                  Technical Assessment
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-astral-ink/60 dark:text-spooled-white/60">
                      Skills Match
                    </span>
                    <span className="font-medium text-astral-ink dark:text-spooled-white">
                      {evaluation.technical_assessment.required_skills_match || 'N/A'}
                    </span>
                  </div>
                  
                  {evaluation.technical_assessment.skill_depth_analysis && (
                    <div>
                      <h3 className="text-sm font-medium text-astral-ink/60 dark:text-spooled-white/60 mb-2">
                        Skill Analysis
                      </h3>
                      <p className="text-sm text-astral-ink/70 dark:text-spooled-white/70">
                        {evaluation.technical_assessment.skill_depth_analysis}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Meta Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-sakura/10 dark:bg-cold-current/20 rounded-xl p-6"
            >
              <h3 className="text-sm font-medium text-astral-ink/60 dark:text-spooled-white/60 mb-3">
                Evaluation Details
              </h3>
              <div className="space-y-2 text-sm text-astral-ink/70 dark:text-spooled-white/70">
                {evaluation?.evaluated_at && (
                  <div className="flex justify-between">
                    <span>Evaluated on:</span>
                    <span>{format(new Date(evaluation.evaluated_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {evaluation?.ai_model_version && (
                  <div className="flex justify-between">
                    <span>AI Model:</span>
                    <span>{evaluation.ai_model_version}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Candidate ID:</span>
                  <span className="font-mono text-xs">{id}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateDetail;