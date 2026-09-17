import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { getUser } from '../utils/auth'
import PageHeader from '../components/PageHeader'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function Clients() {
  const user = getUser()
  const role = user?.role?.toLowerCase()
  const canEdit = role === 'admin'

  const [clients, setClients] = useState([])
  const [form, setForm] = useState({ name: '', email: '' })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      setError('')
      const result = await api.clients()
      setClients(result?.clients || [])
      console.log('Clients loaded:', result?.clients || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function editClient(client) {
    setEditing(client)
    setForm({
      name: client.name || '',
      email: client.email || ''
    })
  }

  function resetForm() {
    setEditing(null)
    setForm({ name: '', email: '' })
  }

  async function save(e) {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      if (editing) {
        await api.updateClient(editing._id, form)
      } else {
        await api.createClient(form)
      }

      resetForm()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="page"><PageHeader title="Clients" /><Loading /></div>
  }

  return (
    <div className="page">
      <PageHeader
        title="Clients"
        description={canEdit ? 'Create and update clients.' : 'View clients.'}
        action={<button onClick={load}>Refresh</button>}
      />

      <ErrorMessage message={error} onClose={() => setError('')} />

      {canEdit && (
        <div className="card">
          <h2>{editing ? 'Edit Client' : 'Add Client'}</h2>

          <form className="form-grid" onSubmit={save}>
            <label>
              Client Name
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

            <div className="form-actions">
              <button className="primary" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Client' : 'Add Client'}
              </button>

              {editing && (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Client List</h2>
          <span className="count">{clients.length}</span>
        </div>

        <DataTable
          headers={['Name', 'Email', ...(canEdit ? ['Action'] : [])]}
        >
          {clients.map(client => (
            <tr key={client._id}>
              <td>{client.name}</td>
              <td>{client.email}</td>
              {canEdit && (
                <td>
                  <button onClick={() => editClient(client)}>
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </DataTable>

        {!clients.length && <p className="empty">No clients found.</p>}
      </div>
    </div>
  )
}

function DataTable({ headers, children }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map(header => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
