// components/ChartCandidateBar.jsx
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from 'next-themes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartCandidateBar = ({ candidates, onBarClick, showStackedView = false }) => {
  const { theme } = useTheme();
  const chartRef = useRef(null);

  // Sort candidates by overall score
  const sortedCandidates = [...candidates]
    .sort((a, b) => b.overall_score - a.overall_score)
    .slice(0, 10); // Top 10 candidates

  const labels = sortedCandidates.map(c => 
    c.candidate_name.length > 15 
      ? c.candidate_name.substring(0, 15) + '...' 
      : c.candidate_name
  );

  const colors = {
    technical: theme === 'dark' ? 'rgba(223, 177, 182, 0.8)' : 'rgba(223, 177, 182, 0.6)',
    experience: theme === 'dark' ? 'rgba(35, 66, 114, 0.8)' : 'rgba(35, 66, 114, 0.6)',
    softSkills: theme === 'dark' ? 'rgba(166, 66, 124, 0.8)' : 'rgba(166, 66, 124, 0.6)',
    cultural: theme === 'dark' ? 'rgba(16, 30, 66, 0.8)' : 'rgba(16, 30, 66, 0.6)',
    overall: 'rgba(166, 66, 124, 1)',
  };

  const datasets = showStackedView ? [
    {
      label: 'Technical Skills',
      data: sortedCandidates.map(c => c.technical_score || 0),
      backgroundColor: colors.technical,
      borderColor: colors.technical.replace('0.6', '1').replace('0.8', '1'),
      borderWidth: 1,
    },
    {
      label: 'Experience',
      data: sortedCandidates.map(c => c.experience_score || 0),
      backgroundColor: colors.experience,
      borderColor: colors.experience.replace('0.6', '1').replace('0.8', '1'),
      borderWidth: 1,
    },
    {
      label: 'Soft Skills',
      data: sortedCandidates.map(c => c.soft_skills_score || 0),
      backgroundColor: colors.softSkills,
      borderColor: colors.softSkills.replace('0.6', '1').replace('0.8', '1'),
      borderWidth: 1,
    },
    {
      label: 'Cultural Fit',
      data: sortedCandidates.map(c => c.cultural_fit_score || 0),
      backgroundColor: colors.cultural,
      borderColor: colors.cultural.replace('0.6', '1').replace('0.8', '1'),
      borderWidth: 1,
    },
  ] : [
    {
      label: 'Overall Score',
      data: sortedCandidates.map(c => c.overall_score || 0),
      backgroundColor: sortedCandidates.map((c, index) => {
        // Gradient effect based on score
        if (c.overall_score >= 80) return 'rgba(34, 197, 94, 0.8)';
        if (c.overall_score >= 60) return 'rgba(59, 130, 246, 0.8)';
        if (c.overall_score >= 40) return 'rgba(251, 191, 36, 0.8)';
        return 'rgba(239, 68, 68, 0.8)';
      }),
      borderColor: sortedCandidates.map((c, index) => {
        if (c.overall_score >= 80) return 'rgba(34, 197, 94, 1)';
        if (c.overall_score >= 60) return 'rgba(59, 130, 246, 1)';
        if (c.overall_score >= 40) return 'rgba(251, 191, 36, 1)';
        return 'rgba(239, 68, 68, 1)';
      }),
      borderWidth: 2,
      borderRadius: 8,
    },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        display: showStackedView,
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#F5EAE3' : '#101E42',
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: showStackedView ? 'Score Breakdown by Category' : 'Top Candidates by Overall Score',
        color: theme === 'dark' ? '#F5EAE3' : '#101E42',
        font: {
          size: 16,
          family: "'Outfit', sans-serif",
          weight: '600',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#101E42' : '#FFFFFF',
        titleColor: theme === 'dark' ? '#F5EAE3' : '#101E42',
        bodyColor: theme === 'dark' ? '#F5EAE3' : '#101E42',
        borderColor: theme === 'dark' ? '#234272' : '#DFB1B6',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: showStackedView,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return sortedCandidates[index].candidate_name;
          },
          label: (context) => {
            if (showStackedView) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            }
            const candidate = sortedCandidates[context.dataIndex];
            return [
              `Overall Score: ${candidate.overall_score}%`,
              `Recommendation: ${candidate.recommendation || 'N/A'}`,
              `Technical: ${candidate.technical_score}%`,
              `Experience: ${candidate.experience_score}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        stacked: showStackedView,
        grid: {
          display: false,
        },
        ticks: {
          color: theme === 'dark' ? '#F5EAE3' : '#101E42',
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        stacked: showStackedView,
        beginAtZero: true,
        max: showStackedView ? 400 : 100,
        grid: {
          color: theme === 'dark' ? 'rgba(245, 234, 227, 0.1)' : 'rgba(16, 30, 66, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#F5EAE3' : '#101E42',
          font: {
            size: 11,
          },
          callback: (value) => `${value}%`,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick) {
        const index = elements[0].index;
        const candidate = sortedCandidates[index];
        onBarClick(candidate);
      }
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-display font-bold text-astral-ink dark:text-spooled-white">
            Candidate Rankings
          </h3>
          <p className="text-sm text-astral-ink/60 dark:text-spooled-white/60 mt-1">
            Click on bars to view candidate details
          </p>
        </div>
        <button
          onClick={() => onBarClick && onBarClick({ showStackedView: !showStackedView })}
          className="px-3 py-1 text-sm bg-sakura/10 dark:bg-cold-current/20 text-astral-ink dark:text-spooled-white rounded-lg hover:bg-sakura/20 dark:hover:bg-cold-current/30 transition-colors"
        >
          {showStackedView ? 'Overall View' : 'Breakdown View'}
        </button>
      </div>
      
      <div className="h-[400px]">
        <Bar ref={chartRef} data={{ labels, datasets }} options={options} />
      </div>
    </motion.div>
  );
};

export default ChartCandidateBar;