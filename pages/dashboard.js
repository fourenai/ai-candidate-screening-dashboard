import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import CandidateCard from '../components/CandidateCard';
import ChartContainer from '../components/ChartContainer';
import { 
  Download, 
  Filter, 
  RefreshCw, 
  Users, 
  TrendingUp, 
  Award,
  Clock,
  Search,
  Grid,
  List,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { trackAnalysisComplete, trackEvaluationView, trackExport } from '../lib/gtag';

export default function Dashboard() {
  const router = useRouter();
  const { id: requirementId } = router.query;
  
  const [analysis, setAnalysis] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedChart, setSelectedChart] = useState('radar');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('score');
  const [filterSkills, setFilterSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!requirementId) {
      router.push('/');
      return;
    }

    fetchAnalysisStatus();
    const interval = setInterval(fetchAnalysisStatus, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [requirementId]);

  const fetchAnalysisStatus = async () => {
    try {
      const response = await fetch(`/api/analysis/status/${requirementId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch analysis status');
      }

      setAnalysis(data.analysis);
      setProgress(data.analysis.progress || 0);

      if (data.analysis.status === 'completed') {
        setIsComplete(true);
        fetchResults();
        
        // Track completion
        if (!isComplete) {
          trackAnalysisComplete({
            jobId: requirementId,
            candidateCount: data.analysis.total_candidates,
            duration: new Date() - new Date(data.analysis.submitted_at)
          });
        }
      } else if (data.analysis.status === 'error') {
        setIsComplete(true);
        toast.error('Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching analysis status:', error);
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/analysis/results/${requirementId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch results');
      }

      setCandidates(data.candidates || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
      setLoading(false);
    }
  };

  const handleExport = async (format = 'excel') => {
    try {
      trackExport({
        format,
        dataType: 'analysis_results',
        itemCount: candidates.length
      });

      const response = await fetch(`/api/analysis/export/${requirementId}?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis_${requirementId}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleViewCandidate = (candidate) => {
    trackEvaluationView({
      candidateId: candidate.candidate_id,
      score: candidate.overall_score,
      recommendation: candidate.recommendation
    });
    
    router.push(`/candidates/${candidate.candidate_id}?job=${requirementId}`);
  };

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          candidate.candidate_name.toLowerCase().includes(query) ||
          candidate.email?.toLowerCase().includes(query) ||
          candidate.current_role?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(candidate => {
      // Skill filter
      if (filterSkills.length > 0) {
        // Check if candidate has any of the selected skills
        // This would require skill data in the candidate object
        return true; // Placeholder
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.overall_score - a.overall_score;
        case 'name':
          return a.candidate_name.localeCompare(b.candidate_name);
        case 'recommendation':
          const order = ['Strongly Recommend', 'Recommend', 'Maybe', 'Not Recommended'];
          return order.indexOf(a.recommendation) - order.indexOf(b.recommendation);
        default:
          return 0;
      }
    });

  if (!requirementId) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Analysis Dashboard - Resume Scoring AI</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysis?.job_title || 'Analysis Dashboard'}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  ID: {requirementId} • {analysis?.input_type === 'jobDescription' ? 'Full JD' : 'Title Only'}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={() => handleExport('excel')}
                  disabled={!isComplete || candidates.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </button>
                <button
                  onClick={fetchAnalysisStatus}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {!isComplete && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProgressBar 
              progress={progress} 
              status={analysis?.status}
              currentStep={analysis?.current_step}
            />
          </div>
        )}

        {/* Main Content */}
        {isComplete && !loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Candidates</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {analysis?.total_candidates || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recommended</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {candidates.filter(c => c.recommendation?.includes('Recommend')).length}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {candidates.length > 0 
                        ? (candidates.reduce((sum, c) => sum + c.overall_score, 0) / candidates.length).toFixed(1)
                        : '0'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Processing Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {analysis?.completed_at && analysis?.submitted_at
                        ? `${Math.round((new Date(analysis.completed_at) - new Date(analysis.submitted_at)) / 60000)}m`
                        : '—'}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Analytics Overview
                  </h2>
                  <div className="mt-4 sm:mt-0 flex space-x-2">
                    {['radar', 'bar', 'scatter', 'heatmap'].map((chart) => (
                      <button
                        key={chart}
                        onClick={() => setSelectedChart(chart)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          selectedChart === chart
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {chart.charAt(0).toUpperCase() + chart.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <ChartContainer 
                  type={selectedChart} 
                  data={candidates}
                  jobRequirements={analysis}
                />
              </div>
            </div>

            {/* Candidates Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                {/* Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Candidate Results ({filteredCandidates.length})
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="score">Sort by Score</option>
                        <option value="name">Sort by Name</option>
                        <option value="recommendation">Sort by Recommendation</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* View Mode */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'list'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </button>
                  </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Filter by skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {/* Add skill filter chips here */}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Skill filters coming soon...
                      </p>
                    </div>
                  </div>
                )}

                {/* Candidates Grid/List */}
                {filteredCandidates.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No candidates found</p>
                  </div>
                ) : (
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }>
                    {filteredCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.candidate_id}
                        candidate={candidate}
                        viewMode={viewMode}
                        onView={() => handleViewCandidate(candidate)}
                        onScheduleInterview={() => router.push(`/interviews/schedule?candidate=${candidate.candidate_id}&job=${requirementId}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && isComplete && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading results...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}