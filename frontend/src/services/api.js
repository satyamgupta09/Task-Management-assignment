const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
  
async function request(url, options = {}) {
  let token = localStorage.getItem('token')

  if (!token) {
    try {
      const session = JSON.parse(
        localStorage.getItem('session') || 'null'
      )

      token = session?.token || null
    } catch {
      token = null
    }
  }

  const headers = {
    ...(options.body
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(
      `${API_URL}${url}`,
      {
        ...options,
        headers
      }
    )
  } catch (error) {
    throw new Error(
      'Unable to connect to backend'
    )
  }

  const contentType =
    response.headers.get('content-type') || ''

  let data = null

  if (
    contentType.includes('application/json')
  ) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    const text = await response.text()

    if (text) {
      data = {
        message: text
      }
    }
  }

  if (!response.ok) {

    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('session')
    }

    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`
    )
  }

  return data
}

export const api = {


  login: data =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),


  dashboard: () =>
    request('/tasks/dashboard'),

  users: () =>
    request('/users'),

  teamMembers: () =>
    request('/users/team-members'),

  createUser: data =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateUser: (id, data) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),


  clients: () =>
    request('/clients'),

  createClient: data =>
    request('/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateClient: (id, data) =>
    request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  services: () =>
    request('/service-types'),

  createService: data =>
    request('/service-types', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateService: (id, data) =>
    request(`/service-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),


  taskTemplates: () =>
    request('/task-templates'),

  createTaskTemplate: data =>
    request('/task-templates', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateTaskTemplate: (id, data) =>
    request(`/task-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  engagements: () =>
    request('/engagements'),

  createEngagement: data =>
    request('/engagements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateEngagement: (id, data) =>
    request(`/engagements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  nextPeriod: id =>
    request(
      `/engagements/${id}/next-period`,
      {
        method: 'POST'
      }
    ),


  tasks: () =>
    request('/tasks'),

  myTasks: () =>
    request('/tasks/my'),

  updateStatus: (id, status) =>
    request(`/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status
      })
    }),

  waitingForClient: id =>
    request(
      `/tasks/${id}/waiting-for-client`,
      {
        method: 'POST'
      }
    ),

  submitTask: id =>
    request(`/tasks/${id}/submit`, {
      method: 'POST'
    }),

  assignTask: (id, assignedTo) =>
    request(`/tasks/${id}/assignedTo`, {
      method: 'PUT',
      body: JSON.stringify({
        assignedTo
      })
    }),

  setDeadline: (id, deadline) =>
    request(`/tasks/${id}/deadline`, {
      method: 'PUT',
      body: JSON.stringify({
        deadline
      })
    }),

  approveTask: id =>
    request(`/tasks/${id}/approve`, {
      method: 'POST'
    }),

  requestChanges: id =>
    request(
      `/tasks/${id}/changes-requested`,
      {
        method: 'POST'
      }
    )
}