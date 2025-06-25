// utils/filters.js

/**
 * Filter candidates based on multiple criteria
 */
export const filterCandidates = (candidates, filters) => {
    return candidates.filter(candidate => {
      // Score range filter
      if (filters.minScore && candidate.overall_score < filters.minScore) {
        return false;
      }
      if (filters.maxScore && candidate.overall_score > filters.maxScore) {
        return false;
      }
  
      // Recommendation filter
      if (filters.recommendation && filters.recommendation !== 'all') {
        const rec = candidate.recommendation?.toLowerCase() || '';
        if (filters.recommendation === 'strongly_recommend' && !rec.includes('strongly')) {
          return false;
        }
        if (filters.recommendation === 'recommend' && !rec.includes('recommend')) {
          return false;
        }
        if (filters.recommendation === 'maybe' && !rec.includes('maybe')) {
          return false;
        }
        if (filters.recommendation === 'not_recommended' && 
            (rec.includes('recommend') || rec.includes('maybe'))) {
          return false;
        }
      }
  
      // Risk level filter
      if (filters.riskLevel && filters.riskLevel !== 'all') {
        const risk = candidate.risk_factors?.level?.toLowerCase() || 'medium';
        if (filters.riskLevel !== risk) {
          return false;
        }
      }
  
      // Skills filter
      if (filters.skills && filters.skills.length > 0) {
        const candidateSkills = extractCandidateSkills(candidate);
        const hasAllSkills = filters.skills.every(skill => 
          candidateSkills.some(cs => cs.name.toLowerCase().includes(skill.toLowerCase()))
        );
        if (!hasAllSkills) {
          return false;
        }
      }
  
      // Experience level filter
      if (filters.experienceYears) {
        const candidateExp = candidate.experience_profile_analysis?.years_of_experience || 0;
        if (candidateExp < filters.experienceYears.min || 
            candidateExp > filters.experienceYears.max) {
          return false;
        }
      }
  
      return true;
    });
  };
  
  /**
   * Sort candidates by various criteria
   */
  export const sortCandidates = (candidates, sortBy, sortOrder = 'desc') => {
    const sorted = [...candidates].sort((a, b) => {
      let aValue, bValue;
  
      switch (sortBy) {
        case 'overall_score':
          aValue = a.overall_score || 0;
          bValue = b.overall_score || 0;
          break;
        case 'technical_score':
          aValue = a.technical_score || 0;
          bValue = b.technical_score || 0;
          break;
        case 'experience_score':
          aValue = a.experience_score || 0;
          bValue = b.experience_score || 0;
          break;
        case 'name':
          aValue = a.candidate_name?.toLowerCase() || '';
          bValue = b.candidate_name?.toLowerCase() || '';
          break;
        case 'evaluated_at':
          aValue = new Date(a.evaluated_at || 0).getTime();
          bValue = new Date(b.evaluated_at || 0).getTime();
          break;
        default:
          return 0;
      }
  
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  
    return sorted;
  };
  
  /**
   * Extract skills from candidate data
   */
  export const extractCandidateSkills = (candidate) => {
    const skills = [];
    
    // Extract from technical_assessment
    if (candidate.technical_assessment?.skill_depth_analysis) {
      const skillAnalysis = candidate.technical_assessment.skill_depth_analysis;
      Object.entries(skillAnalysis).forEach(([skill, data]) => {
        skills.push({
          name: skill,
          score: data.score || 0,
          category: 'technical'
        });
      });
    }
  
    // Extract from technical_requirements match
    if (candidate.technical_assessment?.required_skills_match) {
      const match = candidate.technical_assessment.required_skills_match;
      // Parse "7/10 required skills" format
      const [matched] = match.match(/\d+/) || [0];
      skills.push({
        name: 'Required Skills Match',
        score: (parseInt(matched) / 10) * 100,
        category: 'match'
      });
    }
  
    return skills;
  };
  
  /**
   * Calculate aggregate statistics for candidates
   */
  export const calculateStats = (candidates) => {
    if (candidates.length === 0) {
      return {
        avgScore: 0,
        avgTechnical: 0,
        avgExperience: 0,
        avgSoftSkills: 0,
        avgCultural: 0,
        topScore: 0,
        recommendedCount: 0,
        riskDistribution: { low: 0, medium: 0, high: 0 }
      };
    }
  
    const stats = candidates.reduce((acc, candidate) => {
      acc.totalScore += candidate.overall_score || 0;
      acc.totalTechnical += candidate.technical_score || 0;
      acc.totalExperience += candidate.experience_score || 0;
      acc.totalSoftSkills += candidate.soft_skills_score || 0;
      acc.totalCultural += candidate.cultural_fit_score || 0;
      
      if (candidate.overall_score > acc.topScore) {
        acc.topScore = candidate.overall_score;
      }
      
      const rec = candidate.recommendation?.toLowerCase() || '';
      if (rec.includes('recommend')) {
        acc.recommendedCount++;
      }
      
      const risk = candidate.risk_factors?.level?.toLowerCase() || 'medium';
      acc.riskDistribution[risk]++;
      
      return acc;
    }, {
      totalScore: 0,
      totalTechnical: 0,
      totalExperience: 0,
      totalSoftSkills: 0,
      totalCultural: 0,
      topScore: 0,
      recommendedCount: 0,
      riskDistribution: { low: 0, medium: 0, high: 0 }
    });
  
    const count = candidates.length;
    
    return {
      avgScore: Math.round(stats.totalScore / count),
      avgTechnical: Math.round(stats.totalTechnical / count),
      avgExperience: Math.round(stats.totalExperience / count),
      avgSoftSkills: Math.round(stats.totalSoftSkills / count),
      avgCultural: Math.round(stats.totalCultural / count),
      topScore: stats.topScore,
      recommendedCount: stats.recommendedCount,
      riskDistribution: stats.riskDistribution
    };
  };
  
  /**
   * Group candidates by various criteria
   */
  export const groupCandidates = (candidates, groupBy) => {
    const groups = {};
  
    candidates.forEach(candidate => {
      let key;
  
      switch (groupBy) {
        case 'recommendation':
          key = candidate.recommendation || 'Not Evaluated';
          break;
        case 'risk':
          key = candidate.risk_factors?.level || 'Medium Risk';
          break;
        case 'scoreRange':
          const score = candidate.overall_score || 0;
          if (score >= 80) key = 'Excellent (80-100)';
          else if (score >= 60) key = 'Good (60-79)';
          else if (score >= 40) key = 'Fair (40-59)';
          else key = 'Poor (0-39)';
          break;
        case 'persona':
          key = candidate.candidate_persona_analysis?.likely_persona || 'Unknown';
          break;
        default:
          key = 'All Candidates';
      }
  
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(candidate);
    });
  
    return groups;
  };
  
  /**
   * Search candidates by text query
   */
  export const searchCandidates = (candidates, query) => {
    if (!query || query.trim() === '') {
      return candidates;
    }
  
    const searchTerm = query.toLowerCase();
  
    return candidates.filter(candidate => {
      // Search in name
      if (candidate.candidate_name?.toLowerCase().includes(searchTerm)) {
        return true;
      }
  
      // Search in email
      if (candidate.email?.toLowerCase().includes(searchTerm)) {
        return true;
      }
  
      // Search in current role
      if ((candidate.curent_role || candidate.current_role)?.toLowerCase().includes(searchTerm)) {
        return true;
      }
  
      // Search in skills
      const skills = extractCandidateSkills(candidate);
      if (skills.some(skill => skill.name.toLowerCase().includes(searchTerm))) {
        return true;
      }
  
      // Search in strengths
      if (candidate.strengths?.list?.some(strength => 
          strength.toLowerCase().includes(searchTerm))) {
        return true;
      }
  
      return false;
    });
  };
  
  /**
   * Format candidate data for export
   */
  export const formatForExport = (candidates) => {
    return candidates.map(candidate => ({
      'Name': candidate.candidate_name,
      'Email': candidate.email || 'N/A',
      'Phone': candidate.phone || 'N/A',
      'Current Role': candidate.curent_role || candidate.current_role || 'N/A',
      'Overall Score': candidate.overall_score,
      'Technical Score': candidate.technical_score,
      'Experience Score': candidate.experience_score,
      'Soft Skills Score': candidate.soft_skills_score,
      'Cultural Fit Score': candidate.cultural_fit_score,
      'Recommendation': candidate.recommendation || 'Not Evaluated',
      'Risk Level': candidate.risk_factors?.level || 'Medium',
      'Years of Experience': candidate.experience_profile_analysis?.years_of_experience || 'N/A',
      'Key Strengths': (candidate.strengths?.list || []).slice(0, 3).join('; '),
      'Main Concerns': (candidate.concerns?.list || []).slice(0, 2).join('; '),
      'HR Recommendation': candidate.hr_recommendation || 'N/A',
      'Evaluated Date': candidate.evaluated_at ? 
        new Date(candidate.evaluated_at).toLocaleDateString() : 'N/A'
    }));
  };
  
  /**
   * Validate filter values
   */
  export const validateFilters = (filters) => {
    const validated = { ...filters };
  
    // Ensure score ranges are valid
    if (validated.minScore && validated.maxScore) {
      if (validated.minScore > validated.maxScore) {
        [validated.minScore, validated.maxScore] = [validated.maxScore, validated.minScore];
      }
    }
  
    // Ensure experience years are valid
    if (validated.experienceYears) {
      if (validated.experienceYears.min < 0) {
        validated.experienceYears.min = 0;
      }
      if (validated.experienceYears.max < validated.experienceYears.min) {
        validated.experienceYears.max = validated.experienceYears.min;
      }
    }
  
    return validated;
  };
  
  /**
   * Get filter suggestions based on current candidates
   */
  export const getFilterSuggestions = (candidates) => {
    const skills = new Set();
    const recommendations = new Set();
    const riskLevels = new Set();
  
    candidates.forEach(candidate => {
      // Collect unique skills
      const candidateSkills = extractCandidateSkills(candidate);
      candidateSkills.forEach(skill => skills.add(skill.name));
  
      // Collect recommendations
      if (candidate.recommendation) {
        recommendations.add(candidate.recommendation);
      }
  
      // Collect risk levels
      if (candidate.risk_factors?.level) {
        riskLevels.add(candidate.risk_factors.level);
      }
    });
  
    return {
      skills: Array.from(skills).sort(),
      recommendations: Array.from(recommendations),
      riskLevels: Array.from(riskLevels),
      scoreRange: {
        min: Math.min(...candidates.map(c => c.overall_score || 0)),
        max: Math.max(...candidates.map(c => c.overall_score || 100))
      }
    };
  };
  
  // Export all functions
  export default {
    filterCandidates,
    sortCandidates,
    extractCandidateSkills,
    calculateStats,
    groupCandidates,
    searchCandidates,
    formatForExport,
    validateFilters,
    getFilterSuggestions
  };