// services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://demo.fourentech.ai';
const WEBHOOK_URL = `${API_BASE_URL}/webhook/submit-resume-analysis`;

// Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Trigger analysis webhook
  async triggerAnalysis({ requirementId, jobTitle, jobDescription, experienceLevel = 'mid' }) {
    try {
      const payload = {
        requirement_id: requirementId,
        jobTitle,
        jobDescription,
        experienceLevel,
        userId: localStorage.getItem('user_id') || 'anonymous',
      };

      const response = await axios.post(WEBHOOK_URL, payload);
      return response.data;
    } catch (error) {
      console.error('Analysis trigger error:', error);
      throw error;
    }
  },

  // Get job analysis status
  async getJobStatus(requirementId) {
    const response = await apiClient.get(`/api/jobs/${requirementId}/status`);
    return response.data;
  },

  // Get analysis summary
  async getAnalysisSummary(requirementId) {
    const response = await apiClient.get(`/api/jobs/${requirementId}/summary`);
    return response.data;
  },

  // Get all candidates for a job
  async getCandidates(requirementId) {
    const response = await apiClient.get(`/api/jobs/${requirementId}/candidates`);
    return response.data;
  },

  // Get candidate details
  async getCandidateDetails(candidateId) {
    const response = await apiClient.get(`/api/candidates/${candidateId}`);
    return response.data;
  },

  // Get candidate evaluation
  async getCandidateEvaluation(requirementId, candidateId) {
    const response = await apiClient.get(`/api/jobs/${requirementId}/candidates/${candidateId}/evaluation`);
    return response.data;
  },

  // Get interview schedules
  async getInterviewSchedules(requirementId) {
    const response = await apiClient.get(`/api/jobs/${requirementId}/interviews`);
    return response.data;
  },

  // Schedule interview
  async scheduleInterview(data) {
    const response = await apiClient.post('/api/interviews', data);
    return response.data;
  },

  // Update interview status
  async updateInterviewStatus(interviewId, status) {
    const response = await apiClient.patch(`/api/interviews/${interviewId}`, { status });
    return response.data;
  },

  // Get error logs
  async getErrorLogs(requirementId) {
    const response = await apiClient.get(`/api/jobs/${requirementId}/errors`);
    return response.data;
  },

  // Retry failed job
  async retryJob(requirementId) {
    const response = await apiClient.post(`/api/jobs/${requirementId}/retry`);
    return response.data;
  },

  // Get skills master data
  async getSkillsMaster() {
    const response = await apiClient.get('/api/skills');
    return response.data;
  },

  // Export candidates data
  async exportCandidates(requirementId, format = 'csv') {
    const response = await apiClient.get(`/api/jobs/${requirementId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  // Get processing queue status
  async getProcessingQueue(requirementId) {
    const response = await apiClient.get(`/api/jobs/${requirementId}/queue`);
    return response.data;
  },
};

// WebSocket connection for real-time updates
export class RealtimeConnection {
  constructor(requirementId) {
    this.requirementId = requirementId;
    this.ws = null;
    this.listeners = new Map();
  }

  connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://demo.fourentech.ai/ws';
    this.ws = new WebSocket(`${wsUrl}?requirement_id=${this.requirementId}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
      // Auto-reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default api;