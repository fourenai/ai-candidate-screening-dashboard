// pages/interviews/schedule.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiMail, 
  FiLink,
  FiMessageSquare,
  FiSave,
  FiArrowLeft
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import Header from '../../components/Header';
import { api } from '../../services/api';

const ScheduleInterview = () => {
  const router = useRouter();
  const { requirementId, candidateId, candidateName } = router.query;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    time: '10:00',
    duration: '60',
    interviewType: 'technical',
    interviewerEmail: '',
    meetingLink: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interviewTypes = [
    { value: 'technical', label: 'Technical Interview', icon: '💻' },
    { value: 'behavioral', label: 'Behavioral Interview', icon: '🧠' },
    { value: 'cultural', label: 'Cultural Fit', icon: '🤝' },
    { value: 'final', label: 'Final Round', icon: '🎯' },
  ];

  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.interviewerEmail) {
      toast.error('Please enter interviewer email');
      return;
    }

    setIsSubmitting(true);

    try {
      const [hours, minutes] = formData.time.split(':').map(Number);
      const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);

      const interviewData = {
        job_id: requirementId,
        candidate_id: candidateId,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: parseInt(formData.duration),
        interview_type: formData.interviewType,
        interviewer_email: formData.interviewerEmail,
        meeting_link: formData.meetingLink,
        notes: formData.notes,
        status: 'scheduled'
      };

      await api.scheduleInterview(interviewData);
      
      // Send calendar invite (would integrate with calendar API)
      toast.success('Interview scheduled successfully!');
      
      // Redirect to interviews page
      setTimeout(() => {
        router.push(`/interviews?requirementId=${requirementId}`);
      }, 1000);
    } catch (error) {
      console.error('Schedule error:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateMeetingLink = () => {
    // In production, this would integrate with Zoom/Google Meet/Teams API
    const meetingId = Math.random().toString(36).substring(2, 15);
    const link = `https://meet.example.com/interview/${meetingId}`;
    setFormData({ ...formData, meetingLink: link });
    toast.success('Meeting link generated!');
  };

  return (
    <div className="min-h-screen bg-spooled-white dark:bg-astral-ink">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-astral-ink dark:text-spooled-white">
            Schedule Interview
          </h1>
          <p className="text-astral-ink/60 dark:text-spooled-white/60 mt-2">
            Scheduling interview for <span className="font-semibold">{candidateName || 'Candidate'}</span>
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white mb-4 flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-pink-ballad" />
              Select Date
            </h2>
            
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date()}
              maxDate={addDays(new Date(), 30)}
              className="w-full border-0"
              tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
            />
            
            <div className="mt-4 p-4 bg-sakura/10 dark:bg-cold-current/20 rounded-lg">
              <p className="text-sm font-medium text-astral-ink dark:text-spooled-white">
                Selected Date:
              </p>
              <p className="text-lg font-semibold text-pink-ballad dark:text-sakura">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </motion.div>

          {/* Interview Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-6 space-y-6"
          >
            <h2 className="text-xl font-display font-semibold text-astral-ink dark:text-spooled-white flex items-center gap-2">
              <FiClock className="w-5 h-5 text-pink-ballad" />
              Interview Details
            </h2>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-astral-ink dark:text-spooled-white mb-2">
                  Time
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-sakura/20 dark:border-cold-current/20 bg-spooled-white dark:bg-secondary-900 text-astral-ink dark:text-spooled-white focus:outline-none focus:ring-2 focus:ring-pink-ballad/50"
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-astral-ink dark:text-spooled-white mb-2">
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-sakura/20 dark:border-cold-current/20 bg-spooled-white dark:bg-secondary-900 text-astral-ink dark:text-spooled-white focus:outline-none focus:ring-2 focus:ring-pink-ballad/50"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-astral-ink dark:text-spooled-white mb-3">
                Interview Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {interviewTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, interviewType: type.value })}
                    className={clsx(
                      'py-3 px-4 rounded-lg font-medium transition-all text-sm flex items-center gap-2',
                      formData.interviewType === type.value
                        ? 'bg-gradient-to-r from-pink-ballad to-sakura text-white shadow-sakura'
                        : 'bg-sakura/10 dark:bg-cold-current/20 text-astral-ink dark:text-spooled-white hover:bg-sakura/20 dark:hover:bg-cold-current/30'
                    )}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interviewer Email */}
            <div>
              <label className="block text-sm font-medium text-astral-ink dark:text-spooled-white mb-2">
                Interviewer Email <span className="text-pink-ballad">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-astral-ink/40 dark:text-spooled-white/40" />
                <input
                  type="email"
                  value={formData.interviewerEmail}
                  onChange={(e) => setFormData({ ...formData, interviewerEmail: e.target.value })}
                  placeholder="interviewer@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-sakura/20 dark:border-cold-current/20 bg-spooled-white dark:bg-secondary-900 text-astral-ink dark:text-spooled-white placeholder-astral-ink/40 dark:placeholder-spooled-white/40 focus:outline-none focus:ring-2 focus:ring-pink-ballad/50"
                  required
                />
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-sm font-medium text-astral-ink dark:text-spooled-white mb-2">
                Meeting Link
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-astral-ink/40 dark:text-spooled-white/40" />
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://meet.example.com/..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-sakura/20 dark:border-cold-current/20 bg-spooled-white dark:bg-secondary-900 text-astral-ink dark:text-spooled-white placeholder-astral-ink/40 dark:placeholder-spooled-white/40 focus:outline-none focus:ring-2 focus:ring-pink-ballad/50"
                  />
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateMeetingLink}
                  className="px-4 py-3 bg-cold-current dark:bg-astral-ink text-white rounded-lg font-medium hover:shadow-astral transition-all"
                >
                  Generate
                </motion.button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-astral-ink dark:text-spooled-white mb-2">
                Notes
              </label>
              <div className="relative">
                <FiMessageSquare className="absolute left-3 top-3 text-astral-ink/40 dark:text-spooled-white/40" />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any special instructions or notes..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-sakura/20 dark:border-cold-current/20 bg-spooled-white dark:bg-secondary-900 text-astral-ink dark:text-spooled-white placeholder-astral-ink/40 dark:placeholder-spooled-white/40 focus:outline-none focus:ring-2 focus:ring-pink-ballad/50 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                'w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-3',
                isSubmitting
                  ? 'bg-astral-ink/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-ballad to-sakura hover:shadow-sakura'
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  Schedule Interview
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </main>
    </div>
  );
};

export default ScheduleInterview;