const API_BASE = '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('acad_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => apiFetch('/auth/logout', { method: 'POST' }),
    getMe: () => apiFetch('/auth/me'),
    changePassword: (data) => apiFetch('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  },
  dashboard: {
    getAdmin: () => apiFetch('/dashboard/admin'),
    getFaculty: () => apiFetch('/dashboard/faculty'),
    getStudent: () => apiFetch('/dashboard/student'),
  },
  departments: {
    getAll: (params = '') => apiFetch(`/departments${params ? `?${params}` : ''}`),
    getById: (id) => apiFetch(`/departments/${id}`),
    create: (data) => apiFetch('/departments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/departments/${id}`, { method: 'DELETE' }),
  },
  courses: {
    getAll: (params = '') => apiFetch(`/courses${params ? `?${params}` : ''}`),
    getById: (id) => apiFetch(`/courses/${id}`),
    create: (data) => apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/courses/${id}`, { method: 'DELETE' }),
  },
  subjects: {
    getAll: (params = '') => apiFetch(`/subjects${params ? `?${params}` : ''}`),
    getById: (id) => apiFetch(`/subjects/${id}`),
    create: (data) => apiFetch('/subjects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/subjects/${id}`, { method: 'DELETE' }),
  },
  faculty: {
    getAll: (params = '') => apiFetch(`/faculty${params ? `?${params}` : ''}`),
    getById: (id) => apiFetch(`/faculty/${id}`),
    create: (data) => apiFetch('/faculty', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/faculty/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  students: {
    getAll: (params = '') => apiFetch(`/students${params ? `?${params}` : ''}`),
    getById: (id) => apiFetch(`/students/${id}`),
    create: (data) => apiFetch('/students', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id, status) => apiFetch(`/students/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  attendance: {
    markBatch: (data) => apiFetch('/attendance/batch', { method: 'POST', body: JSON.stringify(data) }),
    getClassSheet: (subjectId, date) => apiFetch(`/attendance/class-sheet?subject=${subjectId}&date=${date}`),
    getStudentHistory: (studentId, params = '') => apiFetch(`/attendance/student/${studentId}${params ? `?${params}` : ''}`),
  },
  exams: {
    getAll: (params = '') => apiFetch(`/exams${params ? `?${params}` : ''}`),
    getById: (id) => apiFetch(`/exams/${id}`),
    create: (data) => apiFetch('/exams', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/exams/${id}`, { method: 'DELETE' }),
    submitResults: (data) => apiFetch('/exams/results/submit', { method: 'POST', body: JSON.stringify(data) }),
    publish: (id, isPublished) => apiFetch(`/exams/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ isPublished }) }),
    getStudentResults: (studentId) => apiFetch(`/exams/student/${studentId}/results`),
  },
  enrollments: {
    getAll: (params = '') => apiFetch(`/enrollments${params ? `?${params}` : ''}`),
    create: (data) => apiFetch('/enrollments', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status, remarks) => apiFetch(`/enrollments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, remarks }) }),
  },
};
