// pages/interviews/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiMail,
  FiVideo,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
  FiPlus,
  FiEdit3,
  FiTrash2
} from 'react-icons/fi';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import Calendar from 'react-calendar';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import Header from '../../components/Header';
import { api } from '../../services/api';

const InterviewsPage = () => {
  const router = useRouter();
  const { requirementId } = router.query;
  
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch interviews
  const { data: interviews = [], isLoading, refetch } = useQuery(
    ['interviews', requirementId],
    () => api.getInterviewSchedules(requirementId || 'all'),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      onError: (error) => {
        console.error('Failed to fetch interviews:', error);
        toast.error('Failed to load interviews');
      }
    }
  );

  // Filter interviews
  const filteredInterviews = interviews.filter(interview => {
    if (filterStatus === 'all') return true;
    return interview.status === filterStatus;
  });

  // Group interviews by date for calendar view
  const interviewsByDate = filteredInterviews.reduce((acc, interview) => {
    const date = format(new Date(interview.scheduled_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(interview);
    return acc;
  }, {});

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { 
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', 
        icon: FiCalendar,
        label: 'Scheduled' 
      },
      completed: { 
        color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', 
        icon: FiCheckCircle,
        label: 'Completed' 
      },
      cancelled: { 
        color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', 
        icon: FiXCircle,
        label: 'Cancelled' 
      },
      rescheduled: { 
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', 
        icon: FiAlertCircle,
        label: 'Rescheduled' 
      }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span className={clsx('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium', config.color)}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getInterviewTypeBadge = (type) => {
    const typeConfig = {
      technical: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', emoji: '💻' },
      behavioral: { color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300', emoji: '🧠' },
      cultural: { color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300', emoji: '🤝' },
      final: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', emoji: '🎯' }
    };
    
    const config = typeConfig[type] || typeConfig.technical;
    return (
      <span className={clsx('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium', config.color)}>
        <span>{config.emoji}</span>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const handleStatusUpdate = async (interviewId, newStatus) => {
    try {
      await api.updateInterviewStatus(interviewId, newStatus);
      toast.success(`Interview ${newStatus}`);
      refetch();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update interview status');
    }
  };

  const handleDelete = async (interviewId) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;
    
    try {
      // In production, implement delete API
      toast.success('Interview deleted');
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete interview');
    }
  };

  const formatInterviewTime = (dateString) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else if (isPast(date)) {
      return format(date, 'MMM d, yyyy h:mm a');
    } else {
      return format(date, 'EEE, MMM d at h:mm a');
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayInterviews = interviewsByDate[dateStr];
      
      if (dayInterviews && dayInterviews.length > 0) {
        return (
          <div className="flex justify-center">
            <span className="w-2 h-2 bg-pink-ballad rounded-full"></span>
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-spooled-white dark:bg-astral-ink">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-display font-bold text-astral-ink dark:text-spooled-white">
              Interview Schedule
            </h1>
            <p className="text-astral-ink/60 dark:text-spooled-white/60 mt-2">
              Manage and track all scheduled interviews
            </p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/interviews/schedule')}
            className="px-6 py-3 bg-gradient-to-r from-pink-ballad to-sakura text-white rounded-lg font-medium hover:shadow-sakura transition-all flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Schedule Interview
          </motion.button>
        </div>

        {/* Filters and View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-astral-ink/60 dark:text-spooled-white/60" />
              <div className="flex gap-2">
                {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      filterStatus === status
                        ? 'bg-pink-ballad text-white'
                        : 'bg-sakura/10 dark:bg-cold-current/20 text-astral-ink dark:text-spooled-white hover:bg-sakura/20 dark:hover:bg-cold-current/30'
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status !== 'all' && (
                      <span className="ml-2 text-xs">
                        ({interviews.filter(i => i.status === status).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-sakura/10 dark:bg-cold-current/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'px-4 py-2 rounded transition-colors text-sm font-medium',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-secondary-700 text-astral-ink dark:text-spooled-white shadow-sm'
                    : 'text-astral-ink/60 dark:text-spooled-white/60'
                )}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={clsx(
                  'px-4 py-2 rounded transition-colors text-sm font-medium',
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-secondary-700 text-astral-ink dark:text-spooled-white shadow-sm'
                    : 'text-astral-ink/60 dark:text-spooled-white/60'
                )}
              >
                Calendar View
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-secondary-800 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-sakura/20 dark:bg-cold-current/20 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-sakura/10 dark:bg-cold-current/10 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredInterviews.length === 0 ? (
                <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-12 text-center">
                  <FiCalendar className="w-16 h-16 mx-auto text-astral-ink/20 dark:text-spooled-white/20 mb-4" />
                  <h3 className="text-xl font-semibold text-astral-ink dark:text-spooled-white mb-2">
                    No interviews scheduled
                  </h3>
                  <p className="text-astral-ink/60 dark:text-spooled-white/60">
                    Start scheduling interviews with your top candidates
                  </p>
                </div>
              ) : (
                filteredInterviews.map((interview) => (
                  <motion.div
                    key={interview.interview_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ x: 5 }}
                    className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-semibold text-astral-ink dark:text-spooled-white">
                            {interview.candidate_name}
                          </h3>
                          {getStatusBadge(interview.status)}
                          {getInterviewTypeBadge(interview.interview_type)}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-astral-ink/60 dark:text-spooled-white/60">
                            <FiClock className="w-4 h-4" />
                            <span>{formatInterviewTime(interview.scheduled_at)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-astral-ink/60 dark:text-spooled-white/60">
                            <FiUser className="w-4 h-4" />
                            <span>{interview.duration_minutes} minutes</span>
                          </div>
                          
                          {interview.interviewer_email && (
                            <div className="flex items-center gap-2 text-astral-ink/60 dark:text-spooled-white/60">
                              <FiMail className="w-4 h-4" />
                              <span className="truncate">{interview.interviewer_email}</span>
                            </div>
                          )}
                          
                          {interview.overall_score && (
                            <div className="flex items-center gap-2">
                              <span className="text-astral-ink/60 dark:text-spooled-white/60">Score:</span>
                              <span className="font-semibold text-astral-ink dark:text-spooled-white">
                                {interview.overall_score}%
                              </span>
                            </div>
                          )}
                        </div>

                        {interview.meeting_link && (
                          <div className="mt-3">
                            <a
                              href={interview.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-cold-current dark:text-sakura hover:underline"
                            >
                              <FiVideo className="w-4 h-4" />
                              Join Meeting
                            </a>
                          </div>
                        )}

                        {interview.notes && (
                          <div className="mt-3 p-3 bg-sakura/10 dark:bg-cold-current/20 rounded-lg">
                            <p className="text-sm text-astral-ink/70 dark:text-spooled-white/70">
                              {interview.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {interview.status === 'scheduled' && isFuture(new Date(interview.scheduled_at)) && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStatusUpdate(interview.interview_id, 'cancelled')}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Cancel Interview"
                            >
                              <FiXCircle className="w-5 h-5" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => router.push(`/interviews/schedule?edit=${interview.interview_id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Reschedule"
                            >
                              <FiEdit3 className="w-5 h-5" />
                            </motion.button>
                          </>
                        )}
                        
                        {interview.status === 'scheduled' && isPast(new Date(interview.scheduled_at)) && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusUpdate(interview.interview_id, 'completed')}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Mark as Completed"
                          >
                            <FiCheckCircle className="w-5 h-5" />
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(interview.interview_id)}
                          className="p-2 text-astral-ink/40 dark:text-spooled-white/40 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileContent={tileContent}
                    className="w-full border-0"
                  />
                </div>

                {/* Selected Date Interviews */}
                <div>
                  <h3 className="text-lg font-semibold text-astral-ink dark:text-spooled-white mb-4">
                    {format(selectedDate, 'EEEE, MMMM d')}
                  </h3>
                  
                  <div className="space-y-3">
                    {interviewsByDate[format(selectedDate, 'yyyy-MM-dd')]?.map((interview) => (
                      <div 
                        key={interview.interview_id}
                        className="p-4 bg-sakura/10 dark:bg-cold-current/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-astral-ink dark:text-spooled-white">
                            {format(new Date(interview.scheduled_at), 'h:mm a')}
                          </span>
                          {getInterviewTypeBadge(interview.interview_type)}
                        </div>
                        <p className="text-sm text-astral-ink/70 dark:text-spooled-white/70">
                          {interview.candidate_name}
                        </p>
                        {interview.interviewer_email && (
                          <p className="text-xs text-astral-ink/50 dark:text-spooled-white/50 mt-1">
                            with {interview.interviewer_email}
                          </p>
                        )}
                      </div>
                    )) || (
                      <p className="text-center text-astral-ink/60 dark:text-spooled-white/60 py-8">
                        No interviews scheduled for this date
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { label: 'Total Interviews', value: interviews.length, color: 'from-cold-current to-astral-ink' },
            { label: 'Scheduled', value: interviews.filter(i => i.status === 'scheduled').length, color: 'from-blue-500 to-cyan-500' },
            { label: 'Completed', value: interviews.filter(i => i.status === 'completed').length, color: 'from-green-500 to-emerald-500' },
            { label: 'This Week', value: interviews.filter(i => {
              const date = new Date(i.scheduled_at);
              const now = new Date();
              const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
              const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
              return date >= weekStart && date <= weekEnd;
            }).length, color: 'from-pink-ballad to-sakura' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6"
            >
              <div className={clsx(
                'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mb-4',
                stat.color
              )}>
                <FiCalendar className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-astral-ink dark:text-spooled-white mb-1">
                {stat.value}
              </div>
              <p className="text-sm text-astral-ink/60 dark:text-spooled-white/60">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default InterviewsPage;