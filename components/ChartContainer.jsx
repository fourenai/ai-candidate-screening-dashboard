import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Radar, Bar, Scatter, Doughnut } from 'react-chartjs-2';
import { Info } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
);

export default function ChartContainer({ type, data, jobRequirements }) {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const chartRef = useRef(null);

  // Common chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        titleColor: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
        bodyColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
  };

  // Prepare data based on chart type
  const getChartData = () => {
    if (!data || data.length === 0) {
      return null;
    }

    switch (type) {
      case 'radar':
        return {
          labels: ['Technical Skills', 'Experience', 'Soft Skills', 'Cultural Fit', 'Overall Score'],
          datasets: data.slice(0, 5).map((candidate, index) => ({
            label: candidate.candidate_name,
            data: [
              candidate.technical_score || 0,
              candidate.experience_score || 0,
              candidate.soft_skills_score || 0,
              candidate.cultural_fit_score || 0,
              candidate.overall_score || 0,
            ],
            backgroundColor: `rgba(${getColorRGB(index)}, 0.2)`,
            borderColor: `rgba(${getColorRGB(index)}, 1)`,
            borderWidth: 2,
            pointBackgroundColor: `rgba(${getColorRGB(index)}, 1)`,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: `rgba(${getColorRGB(index)}, 1)`,
          })),
        };

      case 'bar':
        return {
          labels: data.map(c => c.candidate_name.split(' ')[0]),
          datasets: [
            {
              label: 'Overall Score',
              data: data.map(c => c.overall_score),
              backgroundColor: data.map(c => {
                if (c.overall_score >= 80) return 'rgba(34, 197, 94, 0.8)';
                if (c.overall_score >= 60) return 'rgba(59, 130, 246, 0.8)';
                if (c.overall_score >= 40) return 'rgba(245, 158, 11, 0.8)';
                return 'rgba(239, 68, 68, 0.8)';
              }),
              borderWidth: 0,
            },
          ],
        };

      case 'scatter':
        return {
          datasets: [{
            label: 'Experience vs Technical Skills',
            data: data.map(c => ({
              x: c.experience_score || 0,
              y: c.technical_score || 0,
              r: (c.overall_score / 10) || 5,
            })),
            backgroundColor: data.map((c, i) => `rgba(${getColorRGB(i % 5)}, 0.6)`),
            borderColor: data.map((c, i) => `rgba(${getColorRGB(i % 5)}, 1)`),
            borderWidth: 2,
          }],
        };

      case 'heatmap':
        // For heatmap, we'll use a custom implementation
        return prepareHeatmapData();

      default:
        return null;
    }
  };

  const getColorRGB = (index) => {
    const colors = [
      '59, 130, 246', // blue
      '34, 197, 94',  // green
      '245, 158, 11', // amber
      '139, 92, 246', // violet
      '236, 72, 153', // pink
    ];
    return colors[index % colors.length];
  };

  const prepareHeatmapData = () => {
    // Create a skill matrix for heatmap
    const skills = ['Technical', 'Experience', 'Soft Skills', 'Cultural Fit'];
    const matrix = data.map(candidate => ({
      name: candidate.candidate_name,
      scores: [
        candidate.technical_score || 0,
        candidate.experience_score || 0,
        candidate.soft_skills_score || 0,
        candidate.cultural_fit_score || 0,
      ],
    }));
    return { skills, matrix };
  };

  const renderChart = () => {
    const chartData = getChartData();
    
    if (!chartData) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      );
    }

    switch (type) {
      case 'radar':
        return (
          <Radar
            ref={chartRef}
            data={chartData}
            options={{
              ...commonOptions,
              scales: {
                r: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    stepSize: 20,
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                  },
                  pointLabels: {
                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                    font: {
                      size: 12,
                    },
                  },
                },
              },
            }}
          />
        );

      case 'bar':
        return (
          <Bar
            ref={chartRef}
            data={chartData}
            options={{
              ...commonOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                  },
                },
                x: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                  },
                  grid: {
                    display: false,
                  },
                },
              },
              onClick: (event, elements) => {
                if (elements.length > 0) {
                  const index = elements[0].index;
                  setSelectedMetric(data[index]);
                }
              },
            }}
          />
        );

      case 'scatter':
        return (
          <Scatter
            ref={chartRef}
            data={chartData}
            options={{
              ...commonOptions,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Experience Score',
                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                  },
                  min: 0,
                  max: 100,
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Technical Score',
                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                  },
                  min: 0,
                  max: 100,
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                  },
                },
              },
              plugins: {
                ...commonOptions.plugins,
                tooltip: {
                  ...commonOptions.plugins.tooltip,
                  callbacks: {
                    label: (context) => {
                      const candidate = data[context.dataIndex];
                      return [
                        `${candidate.candidate_name}`,
                        `Experience: ${context.parsed.x}`,
                        `Technical: ${context.parsed.y}`,
                        `Overall: ${candidate.overall_score}`,
                      ];
                    },
                  },
                },
              },
            }}
          />
        );

      case 'heatmap':
        const heatmapData = chartData;
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Candidate
                  </th>
                  {heatmapData.skills.map((skill) => (
                    <th key={skill} className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      {skill}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.matrix.map((row, index) => (
                  <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {row.name}
                    </td>
                    {row.scores.map((score, scoreIndex) => (
                      <td
                        key={scoreIndex}
                        className="px-4 py-2 text-center text-sm font-semibold"
                        style={{
                          backgroundColor: getHeatmapColor(score),
                          color: score > 50 ? 'white' : 'black',
                        }}
                      >
                        {score}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  const getHeatmapColor = (value) => {
    const isDark = document.documentElement.classList.contains('dark');
    if (value >= 80) return isDark ? '#166534' : '#22c55e';
    if (value >= 60) return isDark ? '#1e40af' : '#3b82f6';
    if (value >= 40) return isDark ? '#a16207' : '#f59e0b';
    return isDark ? '#991b1b' : '#ef4444';
  };

  return (
    <div className="relative">
      {/* Chart Info */}
      <div className="absolute top-0 right-0 z-10">
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
          <div className="absolute right-0 top-6 w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {type === 'radar' && 'Compare multiple candidates across different skill dimensions'}
              {type === 'bar' && 'Click on bars to see detailed candidate information'}
              {type === 'scatter' && 'Bubble size represents overall score. Analyze correlation between experience and technical skills'}
              {type === 'heatmap' && 'Color intensity shows score levels. Green = High, Blue = Good, Yellow = Average, Red = Low'}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96">
        {renderChart()}
      </div>

      {/* Selected Metric Details */}
      {selectedMetric && type === 'bar' && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {selectedMetric.candidate_name}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Overall Score: {selectedMetric.overall_score} • 
                Recommendation: {selectedMetric.recommendation}
              </p>
            </div>
            <button
              onClick={() => setSelectedMetric(null)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}