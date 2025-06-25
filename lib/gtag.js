// Google Analytics tracking ID
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Check if we're in production and have a tracking ID
const isProduction = process.env.NODE_ENV === 'production';
const hasTrackingId = GA_TRACKING_ID && GA_TRACKING_ID !== '';

// Enable analytics only in production with a valid tracking ID
export const analyticsEnabled = isProduction && hasTrackingId;

/**
 * Log page view
 * @param {string} url - Page URL
 */
export const pageview = (url) => {
  if (!analyticsEnabled) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

/**
 * Log specific events
 * @param {string} action - Event action
 * @param {Object} parameters - Event parameters
 */
export const event = ({ action, category, label, value, ...parameters }) => {
  if (!analyticsEnabled) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...parameters,
  });
};

/**
 * Track exceptions
 * @param {string} description - Error description
 * @param {boolean} fatal - Whether the error is fatal
 */
export const exception = (description, fatal = false) => {
  if (!analyticsEnabled) return;

  window.gtag('event', 'exception', {
    description,
    fatal,
  });
};

/**
 * Track social interactions
 * @param {string} network - Social network
 * @param {string} action - Social action
 * @param {string} target - Target URL
 */
export const social = (network, action, target) => {
  if (!analyticsEnabled) return;

  window.gtag('event', 'social', {
    social_network: network,
    social_action: action,
    social_target: target,
  });
};

/**
 * Track timing events
 * @param {string} name - Timing variable
 * @param {number} value - Time in milliseconds
 * @param {string} category - Event category
 * @param {string} label - Event label
 */
export const timing = (name, value, category, label) => {
  if (!analyticsEnabled) return;

  window.gtag('event', 'timing_complete', {
    name,
    value,
    event_category: category,
    event_label: label,
  });
};

// Predefined events for the application

/**
 * Track job analysis start
 * @param {Object} params - Analysis parameters
 */
export const trackAnalysisStart = ({ jobTitle, inputType, experienceLevel }) => {
  event({
    action: 'start_analysis',
    category: 'engagement',
    label: jobTitle,
    value: 1,
    job_title: jobTitle,
    input_type: inputType,
    experience_level: experienceLevel,
  });
};

/**
 * Track analysis completion
 * @param {Object} params - Completion parameters
 */
export const trackAnalysisComplete = ({ jobId, candidateCount, duration }) => {
  event({
    action: 'complete_analysis',
    category: 'engagement',
    label: jobId,
    value: candidateCount,
    duration_seconds: Math.round(duration / 1000),
  });

  // Also track timing
  timing('analysis_duration', duration, 'performance', 'complete');
};

/**
 * Track candidate evaluation view
 * @param {Object} params - Evaluation parameters
 */
export const trackEvaluationView = ({ candidateId, score, recommendation }) => {
  event({
    action: 'view_evaluation',
    category: 'engagement',
    label: recommendation,
    value: score,
    candidate_id: candidateId,
  });
};

/**
 * Track interview scheduled
 * @param {Object} params - Interview parameters
 */
export const trackInterviewScheduled = ({ candidateId, interviewType }) => {
  event({
    action: 'schedule_interview',
    category: 'conversion',
    label: interviewType,
    value: 1,
    candidate_id: candidateId,
  });
};

/**
 * Track export action
 * @param {Object} params - Export parameters
 */
export const trackExport = ({ format, dataType, itemCount }) => {
  event({
    action: 'export_data',
    category: 'engagement',
    label: `${dataType}_${format}`,
    value: itemCount,
  });
};

/**
 * Track search performed
 * @param {Object} params - Search parameters
 */
export const trackSearch = ({ searchType, query, resultCount }) => {
  event({
    action: 'search',
    category: 'engagement',
    label: searchType,
    value: resultCount,
    search_term: query,
  });
};

/**
 * Track filter applied
 * @param {Object} params - Filter parameters
 */
export const trackFilter = ({ filterType, filterValue, resultCount }) => {
  event({
    action: 'apply_filter',
    category: 'engagement',
    label: `${filterType}:${filterValue}`,
    value: resultCount,
  });
};

/**
 * Track error occurred
 * @param {Object} params - Error parameters
 */
export const trackError = ({ errorType, errorMessage, fatal = false }) => {
  exception(`${errorType}: ${errorMessage}`, fatal);
};

/**
 * Track user signup
 * @param {Object} params - Signup parameters
 */
export const trackSignup = ({ method }) => {
  event({
    action: 'sign_up',
    category: 'conversion',
    label: method,
    value: 1,
  });
};

/**
 * Track user login
 * @param {Object} params - Login parameters
 */
export const trackLogin = ({ method }) => {
  event({
    action: 'login',
    category: 'engagement',
    label: method,
    value: 1,
  });
};

/**
 * Track feature usage
 * @param {Object} params - Feature parameters
 */
export const trackFeatureUsage = ({ featureName, action }) => {
  event({
    action: 'use_feature',
    category: 'engagement',
    label: featureName,
    value: 1,
    feature_action: action,
  });
};

// Export all functions
export default {
  pageview,
  event,
  exception,
  social,
  timing,
  trackAnalysisStart,
  trackAnalysisComplete,
  trackEvaluationView,
  trackInterviewScheduled,
  trackExport,
  trackSearch,
  trackFilter,
  trackError,
  trackSignup,
  trackLogin,
  trackFeatureUsage,
};