import { useEffect, useState } from 'react'
import { api } from '../services/api'
import PageHeader from '../components/PageHeader'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'team member'
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      setError('')
      const result = await api.users()
      setUsers(result?.users || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function editUser(user) {
    setEditing(user)
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'team member'
    })
  }

  function reset() {
    setEditing(null)
    setForm(emptyForm)
  }

  async function save(e) {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      const payload = {
        name: form.name,
        email: form.email,
        role: form.role
      }

      if (form.password) {
        payload.password = form.password
      }

      if (editing) {
        await api.updateUser(editing._id, payload)
      } else {
        await api.createUser({
          ...payload,
          password: form.password
        })
      }

      reset()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="page"><PageHeader title="Users" /><Loading /></div>
  }

  return (
    <div className="page">
      <PageHeader title="Users" description="Admin user management." />

      <ErrorMessage message={error} onClose={() => setError('')} />

      <div className="card">
        <h2>{editing ? 'Edit User' : 'Add User'}</h2>

        <form className="form-grid" onSubmit={save}>
          <label>
            Name
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              placeholder={editing ? 'Leave blank to keep current password' : ''}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required={!editing}
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="team member">Team Member</option>
            </select>
          </label>

          <div className="form-actions">
            <button className="primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update User' : 'Add User'}
            </button>

            {editing && (
              <button type="button" onClick={reset}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>User List</h2>
          <span className="count">{users.length}</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => editUser(user)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!users.length && <p className="empty">No users found.</p>}
      </div>
    </div>
  )
}
