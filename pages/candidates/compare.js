// pages/candidates/compare.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiTrendingUp,
  FiStar,
  FiTarget,
  FiFileText
} from 'react-icons/fi';
import { Radar } from 'react-chartjs-2';
import { useTheme } from 'next-themes';
import clsx from 'clsx';

import Header from '../../components/Header';
import { api } from '../../services/api';

const CompareCandidate = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { ids, requirementId } = router.query;
  
  const candidateIds = ids ? ids.split(',') : [];

  // Fetch candidate details
  const { data: candidates = [], isLoading } = useQuery(
    ['compareCandidate', candidateIds],
    async () => {
      const promises = candidateIds.map(id => api.getCandidateDetails(id));
      return Promise.all(promises);
    },
    {
      enabled: candidateIds.length > 0,
    }
  );

  const colors = ['#A6427C', '#234272', '#DFB1B6'];

  // Radar chart data
  const radarData = {
    labels: ['Technical', 'Experience', 'Soft Skills', 'Cultural Fit', 'Leadership', 'Innovation'],
    datasets: candidates.map((candidate, index) => ({
      label: candidate.candidate_name,
      data: [
        candidate.technical_score || 0,
        candidate.experience_score || 0,
        candidate.soft_skills_score || 0,
        candidate.cultural_fit_score || 0,
        candidate.soft_skills_analysis?.leadership_potential?.score || 75,
        candidate.technical_assessment?.innovation_score || 70,
      ],
      borderColor: colors[index],
      backgroundColor: colors[index] + '33',
      borderWidth: 2,
      pointBackgroundColor: colors[index],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: colors[index],
    })),
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#F5EAE3' : '#101E42',
          padding: 20,
          font: { size: 14 },
        },
      },
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

  const compareAttributes = [
    { label: 'Overall Score', key: 'overall_score', icon: FiTrendingUp },
    { label: 'Technical Skills', key: 'technical_score', icon: FiFileText },
    { label: 'Experience', key: 'experience_score', icon: FiStar },
    { label: 'Soft Skills', key: 'soft_skills_score', icon: FiTarget },
    { label: 'Cultural Fit', key: 'cultural_fit_score', icon: FiCheckCircle },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getHighestScore = (attribute) => {
    const scores = candidates.map(c => c[attribute] || 0);
    return Math.max(...scores);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spooled-white dark:bg-astral-ink">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-sakura/20 dark:bg-cold-current/20 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-sakura/10 dark:bg-cold-current/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spooled-white dark:bg-astral-ink">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-astral-ink/70 dark:text-spooled-white/70 hover:text-astral-ink dark:hover:text-spooled-white mb-6"
        >
          <FiArrowLeft />
          Back to Dashboard
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-astral-ink dark:text-spooled-white">
            Compare Candidates
          </h1>
          <p className="text-astral-ink/60 dark:text-spooled-white/60 mt-2">
            Side-by-side comparison of {candidates.length} candidates
          </p>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6 mb-8"
        >
          <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-6">
            Skills Comparison Overview
          </h2>
          <div className="h-[400px]">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.candidate_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg overflow-hidden"
              style={{ borderTop: `4px solid ${colors[index]}` }}
            >
              {/* Candidate Header */}
              <div className="p-6 bg-gradient-to-br from-sakura/5 to-pink-ballad/5 dark:from-cold-current/10 dark:to-astral-ink/10">
                <h3 className="text-lg font-semibold text-astral-ink dark:text-spooled-white">
                  {candidate.candidate_name}
                </h3>
                <p className="text-sm text-astral-ink/60 dark:text-spooled-white/60 mt-1">
                  {candidate.curent_role || candidate.current_role}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold" style={{ color: colors[index] }}>
                      {candidate.overall_score}%
                    </div>
                    <div className="text-xs text-astral-ink/60 dark:text-spooled-white/60">
                      Overall Score
                    </div>
                  </div>
                  <div className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    candidate.recommendation?.toLowerCase().includes('strongly') 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : candidate.recommendation?.toLowerCase().includes('recommend')
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  )}>
                    {candidate.recommendation || 'Not Evaluated'}
                  </div>
                </div>
              </div>

              {/* Scores Breakdown */}
              <div className="p-6 space-y-4">
                {compareAttributes.map((attr) => {
                  const score = candidate[attr.key] || 0;
                  const isHighest = score === getHighestScore(attr.key) && score > 0;
                  
                  return (
                    <div key={attr.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <attr.icon className="w-4 h-4 text-astral-ink/60 dark:text-spooled-white/60" />
                        <span className="text-sm text-astral-ink/70 dark:text-spooled-white/70">
                          {attr.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'font-semibold',
                          getScoreColor(score)
                        )}>
                          {score}%
                        </span>
                        {isHighest && (
                          <span className="text-xs bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 px-2 py-0.5 rounded-full">
                            Best
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Key Strengths */}
              <div className="px-6 pb-6">
                <h4 className="text-sm font-medium text-astral-ink dark:text-spooled-white mb-3">
                  Key Strengths
                </h4>
                <div className="space-y-2">
                  {(candidate.strengths?.list || []).slice(0, 3).map((strength, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-astral-ink/70 dark:text-spooled-white/70">
                        {strength.length > 60 ? `${strength.substring(0, 60)}...` : strength}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Concerns */}
              <div className="px-6 pb-6 border-t border-sakura/20 dark:border-cold-current/20 pt-6">
                <h4 className="text-sm font-medium text-astral-ink dark:text-spooled-white mb-3">
                  Areas of Concern
                </h4>
                <div className="space-y-2">
                  {(candidate.concerns?.list || []).slice(0, 2).map((concern, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <FiAlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-astral-ink/70 dark:text-spooled-white/70">
                        {concern.length > 60 ? `${concern.substring(0, 60)}...` : concern}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/candidates/${candidate.candidate_id}`)}
                  className="w-full py-3 bg-gradient-to-r from-cold-current to-astral-ink text-white rounded-lg font-medium hover:shadow-astral transition-all"
                >
                  View Full Profile
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-pink-ballad/10 to-sakura/10 dark:from-cold-current/20 dark:to-astral-ink/20 rounded-2xl p-8"
        >
          <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-4">
            Comparison Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {candidates.map((candidate, index) => {
              const rank = [...candidates]
                .sort((a, b) => b.overall_score - a.overall_score)
                .findIndex(c => c.candidate_id === candidate.candidate_id) + 1;
              
              return (
                <div key={candidate.candidate_id} className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: colors[index] }}>
                    #{rank}
                  </div>
                  <p className="font-medium text-astral-ink dark:text-spooled-white">
                    {candidate.candidate_name}
                  </p>
                  <p className="text-sm text-astral-ink/60 dark:text-spooled-white/60 mt-1">
                    Best in: {
                      compareAttributes
                        .filter(attr => candidate[attr.key] === getHighestScore(attr.key))
                        .map(attr => attr.label)
                        .join(', ') || 'None'
                    }
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CompareCandidate;