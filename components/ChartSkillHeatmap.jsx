// components/ChartSkillHeatmap.jsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiInfo } from 'react-icons/fi';

const ChartSkillHeatmap = ({ candidates, skills, onCellClick, view = 'global' }) => {
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

  // Extract skills from candidates if not provided
  const extractedSkills = skills || [
    'Python', 'SQL', 'Spark', 'AWS', 'Data Modeling',
    'ETL/ELT', 'Docker', 'Git', 'Airflow', 'Machine Learning'
  ];

  // Create heatmap data
  const createHeatmapData = () => {
    if (view === 'global') {
      // Global view: Skills demand vs supply
      return extractedSkills.map(skill => {
        const scores = candidates.map(candidate => {
          // Extract skill score from technical_assessment if available
          const techAssessment = candidate.technical_assessment;
          if (techAssessment && typeof techAssessment === 'object') {
            // Look for skill in technical assessment
            const skillScore = Object.entries(techAssessment).find(([key, value]) => 
              key.toLowerCase().includes(skill.toLowerCase())
            );
            return skillScore ? parseInt(skillScore[1]) || 0 : Math.random() * 100;
          }
          return Math.random() * 100; // Placeholder for demo
        });
        
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const proficiencyCount = scores.filter(s => s > 70).length;
        
        return {
          skill,
          avgScore,
          demand: 80 + Math.random() * 20, // Placeholder demand score
          supply: (proficiencyCount / candidates.length) * 100,
          proficiencyCount
        };
      });
    } else {
      // Individual view: Candidate skill intensity
      return candidates.slice(0, 10).map(candidate => ({
        name: candidate.candidate_name,
        skills: extractedSkills.map(skill => ({
          skill,
          score: Math.random() * 100, // Placeholder - would extract from candidate data
          hasSkill: Math.random() > 0.3
        }))
      }));
    }
  };

  const heatmapData = createHeatmapData();

  // Color scale function
  const getColor = (value, isDark) => {
    const colors = {
      0: isDark ? '#1a1a2e' : '#f0f0f0',
      20: isDark ? '#16213e' : '#fce4ec',
      40: isDark ? '#0f3460' : '#f8bbd0',
      60: isDark ? '#53354a' : '#f48fb1',
      80: isDark ? '#903749' : '#ec407a',
      100: isDark ? '#e94560' : '#d81b60'
    };
    
    const keys = Object.keys(colors).map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (value >= keys[i] && value <= keys[i + 1]) {
        const ratio = (value - keys[i]) / (keys[i + 1] - keys[i]);
        return interpolateColor(colors[keys[i]], colors[keys[i + 1]], ratio);
      }
    }
    
    return colors[100];
  };

  const interpolateColor = (color1, color2, ratio) => {
    const hex2rgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };
    
    const rgb2hex = (r, g, b) => {
      return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    };
    
    const c1 = hex2rgb(color1);
    const c2 = hex2rgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
    
    return rgb2hex(r, g, b);
  };

  // Draw heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const isDark = theme === 'dark';
    
    // Set canvas size
    const cellWidth = 60;
    const cellHeight = 40;
    const labelWidth = 120;
    const labelHeight = 30;
    
    if (view === 'global') {
      canvas.width = labelWidth + cellWidth * 3;
      canvas.height = labelHeight + cellHeight * heatmapData.length;
    } else {
      canvas.width = labelWidth + cellWidth * extractedSkills.length;
      canvas.height = labelHeight + cellHeight * Math.min(candidates.length, 10);
    }
    
    // Clear canvas
    ctx.fillStyle = isDark ? '#1a1a2e' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set font
    ctx.font = '12px Inter, sans-serif';
    
    if (view === 'global') {
      // Draw skill labels
      ctx.fillStyle = isDark ? '#F5EAE3' : '#101E42';
      heatmapData.forEach((item, i) => {
        ctx.textAlign = 'right';
        ctx.fillText(item.skill, labelWidth - 10, labelHeight + i * cellHeight + cellHeight / 2 + 4);
      });
      
      // Draw column headers
      ctx.textAlign = 'center';
      ctx.fillText('Demand', labelWidth + cellWidth / 2, labelHeight - 5);
      ctx.fillText('Supply', labelWidth + cellWidth * 1.5, labelHeight - 5);
      ctx.fillText('Gap', labelWidth + cellWidth * 2.5, labelHeight - 5);
      
      // Draw cells
      heatmapData.forEach((item, i) => {
        const y = labelHeight + i * cellHeight;
        
        // Demand cell
        ctx.fillStyle = getColor(item.demand, isDark);
        ctx.fillRect(labelWidth, y, cellWidth, cellHeight);
        
        // Supply cell
        ctx.fillStyle = getColor(item.supply, isDark);
        ctx.fillRect(labelWidth + cellWidth, y, cellWidth, cellHeight);
        
        // Gap cell (demand - supply)
        const gap = Math.max(0, item.demand - item.supply);
        ctx.fillStyle = getColor(gap, isDark);
        ctx.fillRect(labelWidth + cellWidth * 2, y, cellWidth, cellHeight);
        
        // Draw cell borders
        ctx.strokeStyle = isDark ? 'rgba(245, 234, 227, 0.1)' : 'rgba(16, 30, 66, 0.1)';
        ctx.strokeRect(labelWidth, y, cellWidth * 3, cellHeight);
      });
    } else {
      // Individual view
      // Draw skill headers
      ctx.save();
      ctx.translate(labelWidth, labelHeight);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.fillStyle = isDark ? '#F5EAE3' : '#101E42';
      
      extractedSkills.forEach((skill, i) => {
        ctx.fillText(skill, 0, i * cellWidth + 10);
      });
      ctx.restore();
      
      // Draw candidate names
      ctx.fillStyle = isDark ? '#F5EAE3' : '#101E42';
      ctx.textAlign = 'right';
      heatmapData.forEach((candidate, i) => {
        const name = candidate.name.length > 15 ? candidate.name.substring(0, 15) + '...' : candidate.name;
        ctx.fillText(name, labelWidth - 10, labelHeight + i * cellHeight + cellHeight / 2 + 4);
      });
      
      // Draw cells
      heatmapData.forEach((candidate, i) => {
        candidate.skills.forEach((skill, j) => {
          const x = labelWidth + j * cellWidth;
          const y = labelHeight + i * cellHeight;
          
          ctx.fillStyle = skill.hasSkill ? getColor(skill.score, isDark) : (isDark ? '#1a1a2e' : '#f5f5f5');
          ctx.fillRect(x, y, cellWidth, cellHeight);
          
          // Draw cell border
          ctx.strokeStyle = isDark ? 'rgba(245, 234, 227, 0.1)' : 'rgba(16, 30, 66, 0.1)';
          ctx.strokeRect(x, y, cellWidth, cellHeight);
        });
      });
    }
  }, [heatmapData, theme, view]);

  // Handle mouse events
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellWidth = 60;
    const cellHeight = 40;
    const labelWidth = 120;
    const labelHeight = 30;
    
    if (x > labelWidth && y > labelHeight) {
      const col = Math.floor((x - labelWidth) / cellWidth);
      const row = Math.floor((y - labelHeight) / cellHeight);
      
      if (view === 'global' && row < heatmapData.length && col < 3) {
        const item = heatmapData[row];
        const values = [item.demand, item.supply, Math.max(0, item.demand - item.supply)];
        const labels = ['Demand', 'Supply', 'Gap'];
        
        setTooltip({
          show: true,
          x: e.clientX,
          y: e.clientY,
          content: `${item.skill} - ${labels[col]}: ${values[col].toFixed(1)}%`
        });
      } else if (view === 'individual' && row < heatmapData.length && col < extractedSkills.length) {
        const candidate = heatmapData[row];
        const skill = candidate.skills[col];
        
        setTooltip({
          show: true,
          x: e.clientX,
          y: e.clientY,
          content: `${candidate.name} - ${skill.skill}: ${skill.hasSkill ? skill.score.toFixed(0) + '%' : 'Not Listed'}`
        });
      }
    } else {
      setTooltip({ show: false, x: 0, y: 0, content: '' });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: '' });
  };

  const handleClick = (e) => {
    if (!onCellClick) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellWidth = 60;
    const cellHeight = 40;
    const labelWidth = 120;
    const labelHeight = 30;
    
    if (x > labelWidth && y > labelHeight) {
      const col = Math.floor((x - labelWidth) / cellWidth);
      const row = Math.floor((y - labelHeight) / cellHeight);
      
      if (view === 'global' && row < heatmapData.length && col < 3) {
        onCellClick({ skill: heatmapData[row].skill, type: ['demand', 'supply', 'gap'][col] });
      } else if (view === 'individual' && row < heatmapData.length && col < extractedSkills.length) {
        onCellClick({ 
          candidate: heatmapData[row].name, 
          skill: extractedSkills[col] 
        });
      }
    }
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
            {view === 'global' ? 'Skills Supply vs Demand' : 'Candidate Skill Matrix'}
          </h3>
          <p className="text-sm text-astral-ink/60 dark:text-spooled-white/60 mt-1">
            {view === 'global' 
              ? 'Identify skill gaps in your talent pool' 
              : 'Individual candidate skill proficiency levels'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FiInfo className="w-4 h-4 text-astral-ink/60 dark:text-spooled-white/60" />
          <span className="text-xs text-astral-ink/60 dark:text-spooled-white/60">
            Click cells to filter
          </span>
        </div>
      </div>
      
      <div className="relative overflow-auto">
        <canvas
          ref={canvasRef}
          className="cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
        
        {/* Tooltip */}
        {tooltip.show && (
          <div
            className="absolute z-10 px-3 py-2 bg-astral-ink dark:bg-spooled-white text-spooled-white dark:text-astral-ink text-sm rounded-lg shadow-lg pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 30,
              transform: 'translateX(-50%)'
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="text-xs text-astral-ink/60 dark:text-spooled-white/60">Low</span>
        <div className="flex h-4 rounded overflow-hidden">
          {[0, 20, 40, 60, 80, 100].map((value) => (
            <div
              key={value}
              className="w-8 h-full"
              style={{ backgroundColor: getColor(value, theme === 'dark') }}
            />
          ))}
        </div>
        <span className="text-xs text-astral-ink/60 dark:text-spooled-white/60">High</span>
      </div>
    </motion.div>
  );
};

export default ChartSkillHeatmap;