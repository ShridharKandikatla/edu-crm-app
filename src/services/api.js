import { config } from '../config/env';

const API_BASE_URL = config.apiUrl;
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 1;

let globalErrorHandler = null;
export function setApiErrorHandler(handler) { globalErrorHandler = handler; }

function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

async function request(endpoint, options = {}, retryCount = 0) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  config.signal = controller.signal;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new NetworkError('Request timed out. Please check your connection and try again.');
    }
    if (retryCount < MAX_RETRIES && !options.method) {
      return request(endpoint, options, retryCount + 1);
    }
    throw new NetworkError('Network error. Please check your connection and try again.');
  } finally {
    clearTimeout(timeoutId);
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const message = data.message || `Request failed with status ${response.status}`;

    if (response.status === 429) {
      globalErrorHandler?.(message);
    }

    if (response.status !== 429 && response.status >= 500 && retryCount < MAX_RETRIES && !options.method) {
      return request(endpoint, options, retryCount + 1);
    }

    throw new ApiError(message, response.status, data);
  }

  return data;
}

export const api = {
  // Auth endpoints
  auth: {
    login: async (email, password) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      if (data.success && data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
      }
      return data;
    },
    register: async (userData) => {
      return request('/auth/register', {
        method: 'POST',
        body: userData,
      });
    },
    getMe: async () => {
      return request('/auth/me');
    },
    changePassword: async (currentPassword, newPassword) => {
      return request('/auth/change-password', {
        method: 'PUT',
        body: { currentPassword, newPassword },
      });
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch {
        // Token may already be invalid — proceed with client cleanup
      }
      localStorage.removeItem('token');
    },
  },

  // Leads endpoints
  leads: {
    getAll: async (params = {}) => {
      return request(`/leads${buildQueryString(params)}`);
    },
    getById: async (id) => {
      return request(`/leads/${id}`);
    },
    create: async (leadData) => {
      return request('/leads', {
        method: 'POST',
        body: leadData,
      });
    },
    update: async (id, leadData) => {
      return request(`/leads/${id}`, {
        method: 'PUT',
        body: leadData,
      });
    },
    delete: async (id) => {
      return request(`/leads/${id}`, {
        method: 'DELETE',
      });
    },
    convert: async (id, admissionData) => {
      return request(`/leads/${id}/convert`, {
        method: 'POST',
        body: admissionData,
      });
    },
    fail: async (id, failData) => {
      return request(`/leads/${id}/fail`, {
        method: 'POST',
        body: failData,
      });
    },
    reEngage: async (id) => {
      return request(`/leads/${id}/re-engage`, {
        method: 'POST',
      });
    },
    addComment: async (id, content) => {
      return request(`/leads/${id}/comment`, {
        method: 'POST',
        body: { content },
      });
    },
    bulkAssign: async (leadIds, userId) => {
      return request('/leads/bulk-assign', {
        method: 'POST',
        body: { leadIds, assignedTo: userId, userId },
      });
    },
    checkDuplicates: async (phone, email) => {
      const query = new URLSearchParams();
      if (phone) query.append('phone', phone);
      if (email) query.append('email', email);
      return request(`/leads/duplicates-check?${query.toString()}`);
    },
    export: async (params = {}) => {
      const token = localStorage.getItem('token');
      const query = buildQueryString(params);
      const res = await fetch(`${API_BASE_URL}/leads/export${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  },

  // Follow-ups endpoints
  followUps: {
    getAll: async (params = {}) => {
      return request(`/follow-ups${buildQueryString(params)}`);
    },
    getStats: async () => {
      return request('/follow-ups/stats');
    },
    create: async (followUpData) => {
      return request('/follow-ups', {
        method: 'POST',
        body: followUpData,
      });
    },
    complete: async (id, outcomeData) => {
      return request(`/follow-ups/${id}/complete`, {
        method: 'PUT',
        body: outcomeData,
      });
    },
    delete: async (id) => {
      return request(`/follow-ups/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Dashboard endpoints
  dashboard: {
    getStats: async () => {
      return request('/dashboard/stats');
    },
    getCharts: async () => {
      return request('/dashboard/charts');
    },
  },

  // Reports endpoints
  reports: {
    getSourceReport: async () => {
      return request('/reports/source');
    },
    getCounselorReport: async () => {
      return request('/reports/counselor');
    },
    getCourseReport: async () => {
      return request('/reports/course');
    },
    exportReport: async (tab) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/reports/export?tab=${tab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tab}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  },

  // Courses endpoints
  courses: {
    getAll: async () => {
      return request('/courses');
    },
    create: async (courseData) => {
      return request('/courses', {
        method: 'POST',
        body: courseData,
      });
    },
    update: async (id, courseData) => {
      return request(`/courses/${id}`, {
        method: 'PUT',
        body: courseData,
      });
    },
    delete: async (id) => {
      return request(`/courses/${id}`, {
        method: 'DELETE',
      });
    },
    getIntakes: async () => {
      return request('/courses/intakes');
    },
    createIntake: async (intakeData) => {
      return request('/courses/intakes', {
        method: 'POST',
        body: intakeData,
      });
    },
    getAllIntakes: async () => {
      return request('/courses/intakes/all');
    },
    updateIntake: async (id, intakeData) => {
      return request(`/courses/intakes/${id}`, {
        method: 'PUT',
        body: intakeData,
      });
    },
    deleteIntake: async (id) => {
      return request(`/courses/intakes/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Users endpoints
  users: {
    getAll: async () => {
      return request('/users');
    },
    getById: async (id) => {
      return request(`/users/${id}`);
    },
    update: async (id, userData) => {
      return request(`/users/${id}`, {
        method: 'PUT',
        body: userData,
      });
    },
    resetPassword: async (id, password) => {
      return request(`/users/${id}/reset-password`, {
        method: 'PUT',
        body: { newPassword: password },
      });
    },
    delete: async (id) => {
      return request(`/users/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Notifications endpoints
  notifications: {
    getAll: async () => {
      return request('/notifications');
    },
    markAllAsRead: async () => {
      return request('/notifications/read-all', {
        method: 'PUT',
      });
    },
    markAsRead: async (id) => {
      return request(`/notifications/${id}/read`, {
        method: 'PUT',
      });
    },
  },

  // AI endpoints
  ai: {
    scoreLead: async (leadId) => {
      return request(`/ai/score/${leadId}`, { method: 'POST' });
    },
    batchScore: async () => {
      return request('/ai/score/batch', { method: 'POST' });
    },
    explainScore: async (leadId) => {
      return request(`/ai/score/${leadId}/explain`);
    },
    getRecommendation: async (leadId) => {
      return request(`/ai/recommendation/${leadId}`);
    },
    getRecommendations: async () => {
      return request('/ai/recommendations');
    },
    chat: async (message, conversationId) => {
      return request('/ai/chat', {
        method: 'POST',
        body: { message, conversationId },
      });
    },
    getDashboardInsights: async () => {
      return request('/ai/dashboard-insights');
    },
    dashboardQuery: async (prompt) => {
      return request('/ai/dashboard-query', {
        method: 'POST',
        body: { prompt },
      });
    },
  },
};
