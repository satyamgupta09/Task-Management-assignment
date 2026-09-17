export function getSession() {
  try {
    return JSON.parse(localStorage.getItem('session') || 'null')
  } catch {
    return null
  }
}

export function getUser() {
  return getSession()?.user || null
}

export function getToken() {
  return getSession()?.token || null
}

export function saveSession(data) {
  localStorage.setItem('session', JSON.stringify(data))

  if (data?.token) {
    localStorage.setItem('token', data.token)
  }

  if (data?.user) {
    localStorage.setItem('user', JSON.stringify(data.user))
  }
}

export function logout() {
  localStorage.removeItem('session')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
