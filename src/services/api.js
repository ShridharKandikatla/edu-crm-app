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

async function uploadFile(endpoint, file, extraFields = {}, requestOptions = {}) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(extraFields).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') formData.append(key, val);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...requestOptions.headers,
      },
      body: formData,
      signal: controller.signal,
    });
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
    throw new ApiError(data.message || `Upload failed (${response.status})`, response.status, data);
  }

  return data;
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

  let callerAbortHandler = null;
  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('The operation was aborted.', 'AbortError');
    }
    callerAbortHandler = () => controller.abort();
    options.signal.addEventListener('abort', callerAbortHandler, { once: true });
  }

  config.signal = controller.signal;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (err) {
    clearTimeout(timeoutId);
    if (callerAbortHandler) options.signal.removeEventListener('abort', callerAbortHandler);
    if (err.name === 'AbortError') {
      if (options.signal?.aborted) throw err;
      throw new NetworkError('Request timed out. Please check your connection and try again.');
    }
    if (retryCount < MAX_RETRIES && !options.method) {
      return request(endpoint, options, retryCount + 1);
    }
    throw new NetworkError('Network error. Please check your connection and try again.');
  } finally {
    clearTimeout(timeoutId);
    if (callerAbortHandler) options.signal?.removeEventListener('abort', callerAbortHandler);
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
    login: async (email, password, requestOptions = {}) => {
      const data = await request('/auth/login', {
        ...requestOptions,
        method: 'POST',
        body: { email, password },
      });
      if (data.success && data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
      }
      return data;
    },
    register: async (userData, requestOptions = {}) => {
      return request('/auth/register', {
        ...requestOptions,
        method: 'POST',
        body: userData,
      });
    },
    getMe: async (requestOptions = {}) => {
      return request('/auth/me', requestOptions);
    },
    changePassword: async (currentPassword, newPassword, requestOptions = {}) => {
      return request('/auth/change-password', {
        ...requestOptions,
        method: 'PUT',
        body: { currentPassword, newPassword },
      });
    },
    logout: async (requestOptions = {}) => {
      try {
        await request('/auth/logout', { ...requestOptions, method: 'POST' });
      } catch {
        // Token may already be invalid — proceed with client cleanup
      }
      localStorage.removeItem('token');
    },
  },

  // Leads endpoints
  leads: {
    getAll: async (params = {}, requestOptions = {}) => {
      return request(`/leads${buildQueryString(params)}`, requestOptions);
    },
    getById: async (id, requestOptions = {}) => {
      return request(`/leads/${id}`, requestOptions);
    },
    create: async (leadData, requestOptions = {}) => {
      return request('/leads', {
        ...requestOptions,
        method: 'POST',
        body: leadData,
      });
    },
    update: async (id, leadData, requestOptions = {}) => {
      return request(`/leads/${id}`, {
        ...requestOptions,
        method: 'PUT',
        body: leadData,
      });
    },
    delete: async (id, requestOptions = {}) => {
      return request(`/leads/${id}`, {
        ...requestOptions,
        method: 'DELETE',
      });
    },
    convert: async (id, admissionData, requestOptions = {}) => {
      return request(`/leads/${id}/convert`, {
        ...requestOptions,
        method: 'POST',
        body: admissionData,
      });
    },
    fail: async (id, failData, requestOptions = {}) => {
      return request(`/leads/${id}/fail`, {
        ...requestOptions,
        method: 'POST',
        body: failData,
      });
    },
    reEngage: async (id, requestOptions = {}) => {
      return request(`/leads/${id}/re-engage`, {
        ...requestOptions,
        method: 'POST',
      });
    },
    addComment: async (id, content, requestOptions = {}) => {
      return request(`/leads/${id}/comment`, {
        ...requestOptions,
        method: 'POST',
        body: { content },
      });
    },
    bulkAssign: async (leadIds, userId, requestOptions = {}) => {
      return request('/leads/bulk-assign', {
        ...requestOptions,
        method: 'POST',
        body: { leadIds, assignedTo: userId, userId },
      });
    },
    checkDuplicates: async (phone, email, requestOptions = {}) => {
      const query = new URLSearchParams();
      if (phone) query.append('phone', phone);
      if (email) query.append('email', email);
      return request(`/leads/duplicates-check?${query.toString()}`, requestOptions);
    },
    export: async (params = {}, requestOptions = {}) => {
      const token = localStorage.getItem('token');
      const query = buildQueryString(params);
      const res = await fetch(`${API_BASE_URL}/leads/export${query}`, {
        headers: { Authorization: `Bearer ${token}` },
        ...requestOptions,
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
    getAll: async (params = {}, requestOptions = {}) => {
      return request(`/follow-ups${buildQueryString(params)}`, requestOptions);
    },
    getStats: async (requestOptions = {}) => {
      return request('/follow-ups/stats', requestOptions);
    },
    create: async (followUpData, requestOptions = {}) => {
      return request('/follow-ups', {
        ...requestOptions,
        method: 'POST',
        body: followUpData,
      });
    },
    complete: async (id, outcomeData, requestOptions = {}) => {
      return request(`/follow-ups/${id}/complete`, {
        ...requestOptions,
        method: 'PUT',
        body: outcomeData,
      });
    },
    delete: async (id, requestOptions = {}) => {
      return request(`/follow-ups/${id}`, {
        ...requestOptions,
        method: 'DELETE',
      });
    },
  },

  // Dashboard endpoints
  dashboard: {
    getStats: async (requestOptions = {}) => {
      return request('/dashboard/stats', requestOptions);
    },
    getCharts: async (requestOptions = {}) => {
      return request('/dashboard/charts', requestOptions);
    },
  },

  // Reports endpoints
  reports: {
    getSourceReport: async (requestOptions = {}) => {
      return request('/reports/source', requestOptions);
    },
    getCounselorReport: async (requestOptions = {}) => {
      return request('/reports/counselor', requestOptions);
    },
    getCourseReport: async (requestOptions = {}) => {
      return request('/reports/course', requestOptions);
    },
    getFunnelReport: async (params = {}, requestOptions = {}) => {
      return request(`/reports/funnel${buildQueryString(params)}`, requestOptions);
    },
    getRoiReport: async (params = {}, requestOptions = {}) => {
      return request(`/reports/roi${buildQueryString(params)}`, requestOptions);
    },
    getForecastReport: async (params = {}, requestOptions = {}) => {
      return request(`/reports/forecast${buildQueryString(params)}`, requestOptions);
    },
    exportReport: async (tab, params = {}, requestOptions = {}) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/reports/export?tab=${tab}${buildQueryString(params)}`, {
        headers: { Authorization: `Bearer ${token}` },
        ...requestOptions,
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
    getAll: async (requestOptions = {}) => {
      return request('/courses', requestOptions);
    },
    create: async (courseData, requestOptions = {}) => {
      return request('/courses', {
        ...requestOptions,
        method: 'POST',
        body: courseData,
      });
    },
    update: async (id, courseData, requestOptions = {}) => {
      return request(`/courses/${id}`, {
        ...requestOptions,
        method: 'PUT',
        body: courseData,
      });
    },
    delete: async (id, requestOptions = {}) => {
      return request(`/courses/${id}`, {
        ...requestOptions,
        method: 'DELETE',
      });
    },
    getIntakes: async (requestOptions = {}) => {
      return request('/courses/intakes', requestOptions);
    },
    createIntake: async (intakeData, requestOptions = {}) => {
      return request('/courses/intakes', {
        ...requestOptions,
        method: 'POST',
        body: intakeData,
      });
    },
    getAllIntakes: async (requestOptions = {}) => {
      return request('/courses/intakes/all', requestOptions);
    },
    updateIntake: async (id, intakeData, requestOptions = {}) => {
      return request(`/courses/intakes/${id}`, {
        ...requestOptions,
        method: 'PUT',
        body: intakeData,
      });
    },
    deleteIntake: async (id, requestOptions = {}) => {
      return request(`/courses/intakes/${id}`, {
        ...requestOptions,
        method: 'DELETE',
      });
    },
  },

  // Users endpoints
  users: {
    getAll: async (requestOptions = {}) => {
      return request('/users', requestOptions);
    },
    getById: async (id, requestOptions = {}) => {
      return request(`/users/${id}`, requestOptions);
    },
    update: async (id, userData, requestOptions = {}) => {
      return request(`/users/${id}`, {
        ...requestOptions,
        method: 'PUT',
        body: userData,
      });
    },
    resetPassword: async (id, password, requestOptions = {}) => {
      return request(`/users/${id}/reset-password`, {
        ...requestOptions,
        method: 'PUT',
        body: { newPassword: password },
      });
    },
    delete: async (id, requestOptions = {}) => {
      return request(`/users/${id}`, {
        ...requestOptions,
        method: 'DELETE',
      });
    },
  },

  // Notifications endpoints
  notifications: {
    getAll: async (requestOptions = {}) => {
      return request('/notifications', requestOptions);
    },
    markAllAsRead: async (requestOptions = {}) => {
      return request('/notifications/read-all', {
        ...requestOptions,
        method: 'PUT',
      });
    },
    markAsRead: async (id, requestOptions = {}) => {
      return request(`/notifications/${id}/read`, {
        ...requestOptions,
        method: 'PUT',
      });
    },
  },

  // Notification Preferences endpoints
  notificationPreferences: {
    get: async (requestOptions = {}) => {
      return request('/notification-preferences', requestOptions);
    },
    update: async (preferences, requestOptions = {}) => {
      return request('/notification-preferences', {
        ...requestOptions,
        method: 'PUT',
        body: { preferences },
      });
    },
  },

  // Features endpoints
  features: {
    getAll: async (requestOptions = {}) => {
      return request('/features', requestOptions);
    },
    update: async (key, data, requestOptions = {}) => {
      return request(`/features/${key}`, {
        ...requestOptions,
        method: 'PUT',
        body: data,
      });
    },
  },

  // Message templates endpoints
  templates: {
    getAll: async (requestOptions = {}) => {
      return request('/templates', requestOptions);
    },
    create: async (data, requestOptions = {}) => {
      return request('/templates', {
        ...requestOptions,
        method: 'POST',
        body: data,
      });
    },
    update: async (id, data, requestOptions = {}) => {
      return request(`/templates/${id}`, {
        ...requestOptions,
        method: 'PUT',
        body: data,
      });
    },
    remove: async (id, requestOptions = {}) => {
      return request(`/templates/${id}`, {
        ...requestOptions,
        method: 'DELETE',
      });
    },
  },

  // Marketing campaigns endpoints
  campaigns: {
    getAll: async (requestOptions = {}) => {
      return request('/campaigns', requestOptions);
    },
    create: async (data, requestOptions = {}) => {
      return request('/campaigns', {
        ...requestOptions,
        method: 'POST',
        body: data,
      });
    },
    update: async (id, data, requestOptions = {}) => {
      return request(`/campaigns/${id}`, {
        ...requestOptions,
        method: 'PUT',
        body: data,
      });
    },
    remove: async (id, requestOptions = {}) => {
      return request(`/campaigns/${id}`, {
        ...requestOptions,
        method: 'DELETE',
      });
    },
  },

  // WhatsApp endpoints
  whatsapp: {
    getThread: async (leadId, requestOptions = {}) => {
      return request(`/leads/${leadId}/whatsapp`, requestOptions);
    },
    sendMessage: async (leadId, data, requestOptions = {}) => {
      return request(`/leads/${leadId}/whatsapp`, {
        ...requestOptions,
        method: 'POST',
        body: data,
      });
    },
    listTemplates: async (requestOptions = {}) => {
      return request(`/whatsapp/templates`, requestOptions);
    },
  },

  // Applications & fee tracking endpoints
  applications: {
    getAll: async (params = {}, requestOptions = {}) => {
      return request(`/applications${buildQueryString(params)}`, requestOptions);
    },
    getById: async (id, requestOptions = {}) => {
      return request(`/applications/${id}`, requestOptions);
    },
    getByLead: async (leadId, requestOptions = {}) => {
      return request(`/applications/lead/${leadId}`, requestOptions);
    },
    create: async (data, requestOptions = {}) => {
      return request('/applications', { ...requestOptions, method: 'POST', body: data });
    },
    update: async (id, data, requestOptions = {}) => {
      return request(`/applications/${id}`, { ...requestOptions, method: 'PUT', body: data });
    },
    remove: async (id, requestOptions = {}) => {
      return request(`/applications/${id}`, { ...requestOptions, method: 'DELETE' });
    },
    uploadDocument: async (id, file, fields = {}, requestOptions = {}) => {
      return uploadFile(`/applications/${id}/documents`, file, fields, requestOptions);
    },
    deleteDocument: async (id, docId, requestOptions = {}) => {
      return request(`/applications/${id}/documents/${docId}`, { ...requestOptions, method: 'DELETE' });
    },
    addPayment: async (id, data, requestOptions = {}) => {
      return request(`/applications/${id}/payments`, { ...requestOptions, method: 'POST', body: data });
    },
    deletePayment: async (id, paymentId, requestOptions = {}) => {
      return request(`/applications/${id}/payments/${paymentId}`, { ...requestOptions, method: 'DELETE' });
    },
  },

  // Student self-service portal endpoints (public)
  portal: {
    track: async (applicationNumber, phone, requestOptions = {}) => {
      const query = new URLSearchParams({ applicationNumber, phone });
      return request(`/public/applications/track?${query.toString()}`, requestOptions);
    },
    submit: async (data, requestOptions = {}) => {
      return request('/public/applications', { ...requestOptions, method: 'POST', body: data });
    },
    uploadDocument: async (applicationNumber, phone, file, type = 'OTHER', requestOptions = {}) => {
      return uploadFile('/public/applications/upload', file, { applicationNumber, phone, type }, requestOptions);
    },
  },

  // AI endpoints
  ai: {
    scoreLead: async (leadId, requestOptions = {}) => {
      return request(`/ai/score/${leadId}`, { ...requestOptions, method: 'POST' });
    },
    batchScore: async (requestOptions = {}) => {
      return request('/ai/score/batch', { ...requestOptions, method: 'POST' });
    },
    explainScore: async (leadId, requestOptions = {}) => {
      return request(`/ai/score/${leadId}/explain`, requestOptions);
    },
    getRecommendation: async (leadId, requestOptions = {}) => {
      return request(`/ai/recommendation/${leadId}`, requestOptions);
    },
    getRecommendations: async (requestOptions = {}) => {
      return request('/ai/recommendations', requestOptions);
    },
    chat: async (message, conversationId, requestOptions = {}) => {
      return request('/ai/chat', {
        ...requestOptions,
        method: 'POST',
        body: { message, conversationId },
      });
    },
    getDashboardInsights: async (requestOptions = {}) => {
      return request('/ai/dashboard-insights', requestOptions);
    },
    dashboardQuery: async (prompt, requestOptions = {}) => {
      return request('/ai/dashboard-query', {
        ...requestOptions,
        method: 'POST',
        body: { prompt },
      });
    },
  },
};
