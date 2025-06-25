// components/ChartSkillRadar.jsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useTheme } from 'next-themes';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const ChartSkillRadar = ({ candidates, selectedCandidateIds, onSegmentClick }) => {
  const { theme } = useTheme();
  const chartRef = useRef(null);

  // Filter candidates based on selection
  const displayCandidates = selectedCandidateIds?.length > 0
    ? candidates.filter(c => selectedCandidateIds.includes(c.candidate_id))
    : candidates.slice(0, 5); // Show top 5 by default

  // Extract skill categories from evaluations
  const skillCategories = [
    'Technical Skills',
    'Experience',
    'Soft Skills',
    'Cultural Fit',
    'Leadership',
    'Problem Solving'
  ];

  const colors = {
    light: {
      sakura: 'rgba(223, 177, 182, 0.8)',
      'pink-ballad': 'rgba(166, 66, 124, 0.8)',
      'cold-current': 'rgba(35, 66, 114, 0.8)',
      'astral-ink': 'rgba(16, 30, 66, 0.8)',
      'spooled-white': 'rgba(245, 234, 227, 0.8)',
    },
    dark: {
      sakura: 'rgba(223, 177, 182, 0.9)',
      'pink-ballad': 'rgba(166, 66, 124, 0.9)',
      'cold-current': 'rgba(35, 66, 114, 0.9)',
      'astral-ink': 'rgba(16, 30, 66, 0.9)',
      'spooled-white': 'rgba(245, 234, 227, 0.9)',
    }
  };

  const colorPalette = theme === 'dark' ? colors.dark : colors.light;
  const colorKeys = Object.keys(colorPalette);

  const datasets = displayCandidates.map((candidate, index) => {
    const scores = [
      candidate.technical_score || 0,
      candidate.experience_score || 0,
      candidate.soft_skills_score || 0,
      candidate.cultural_fit_score || 0,
      // Extract additional scores from soft_skills_analysis if available
      candidate.soft_skills_analysis?.leadership_potential?.score || 
        Math.round((candidate.overall_score || 0) * 0.85),
      candidate.soft_skills_analysis?.problem_solving?.score || 
        Math.round((candidate.overall_score || 0) * 0.9),
    ];

    const color = colorPalette[colorKeys[index % colorKeys.length]];
    const bgColor = color.replace('0.8', '0.2').replace('0.9', '0.3');

    return {
      label: candidate.candidate_name,
      data: scores,
      borderColor: color,
      backgroundColor: bgColor,
      borderWidth: 2,
      pointBackgroundColor: color,
      pointBorderColor: theme === 'dark' ? '#101E42' : '#FFFFFF',
      pointHoverBackgroundColor: theme === 'dark' ? '#DFB1B6' : '#A6427C',
      pointHoverBorderColor: theme === 'dark' ? '#101E42' : '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });

  const data = {
    labels: skillCategories,
    datasets: datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#F5EAE3' : '#101E42',
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#101E42' : '#FFFFFF',
        titleColor: theme === 'dark' ? '#F5EAE3' : '#101E42',
        bodyColor: theme === 'dark' ? '#F5EAE3' : '#101E42',
        borderColor: theme === 'dark' ? '#234272' : '#DFB1B6',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.r}%`;
          },
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
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500',
          },
          padding: 15,
        },
        ticks: {
          color: theme === 'dark' ? 'rgba(245, 234, 227, 0.6)' : 'rgba(16, 30, 66, 0.6)',
          backdropColor: 'transparent',
          stepSize: 20,
          max: 100,
          display: true,
          font: {
            size: 10,
          },
        },
        beginAtZero: true,
        max: 100,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onSegmentClick) {
        const elementIndex = elements[0].index;
        const skill = skillCategories[elementIndex];
        onSegmentClick(skill);
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
      <div className="mb-4">
        <h3 className="text-lg font-display font-bold text-astral-ink dark:text-spooled-white">
          Skills Comparison Radar
        </h3>
        <p className="text-sm text-astral-ink/60 dark:text-spooled-white/60 mt-1">
          Click on skill segments to filter candidates
        </p>
      </div>
      
      <div className="h-[400px] relative">
        <Radar ref={chartRef} data={data} options={options} />
      </div>

      {/* Legend Enhancement */}
      <div className="mt-6 pt-4 border-t border-sakura/20 dark:border-cold-current/20">
        <div className="flex flex-wrap gap-4 justify-center">
          {displayCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.candidate_id}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: colorPalette[colorKeys[index % colorKeys.length]] 
                }}
              />
              <span className="text-sm text-astral-ink dark:text-spooled-white">
                {candidate.candidate_name}
              </span>
              <span className="text-xs text-astral-ink/60 dark:text-spooled-white/60">
                ({candidate.overall_score}%)
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ChartSkillRadar;