import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { getUser, saveSession } from '../utils/auth'

export default function Login() {
  const navigate = useNavigate()
  const existingUser = getUser()

  const [email, setEmail] = useState('manager1@test.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (existingUser) {
    return <Navigate to="/dashboard" replace />
  }

  async function submit(e) {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

      const result = await api.login({
        email,
        password
      })

      saveSession(result)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand login-brand">
          TaskFlow<span>.</span>
        </div>

        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage your tasks and engagements.</p>

        {error && <div className="error-message">{error}</div>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>

        <button className="primary full-width" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
