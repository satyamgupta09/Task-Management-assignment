import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { getUser } from '../utils/auth'

export default function ServiceTypes() {
  const user = getUser()
  const role = user?.role?.toLowerCase()

  const [services, setServices] = useState([])
  const [templates, setTemplates] = useState([])

  const [form, setForm] = useState({
    name: '',
    type: 'Recurring',
    taskTemplate: ''
  })

  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setLoading(true)
      setError('')

      const [serviceResult, templateResult] =
        await Promise.all([
          api.services(),
          api.taskTemplates()
        ])

      setServices(
        Array.isArray(serviceResult)
          ? serviceResult
          : serviceResult?.serviceTypes || []
      )

      setTemplates(
        Array.isArray(templateResult)
          ? templateResult
          : templateResult?.taskTemplates || []
      )
    } catch (err) {
      setError(
        err.message || 'Failed to load service types'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.name.trim()) {
      setError('Service name is required')
      return
    }

    if (!form.taskTemplate) {
      setError('Please select a task template')
      return
    }

    try {
      setError('')

      const data = {
        name: form.name.trim(),
        type: form.type,
        taskTemplate: form.taskTemplate
      }

      if (editingId) {
        await api.updateService(
          editingId,
          data
        )
      } else {
        await api.createService(data)
      }

      resetForm()
      await load()
    } catch (err) {
      setError(
        err.message ||
        'Failed to save service type'
      )
    }
  }

  function resetForm() {
    setEditingId(null)

    setForm({
      name: '',
      type: 'Recurring',
      taskTemplate: ''
    })
  }

  function startEdit(service) {
    setEditingId(service._id)

    setForm({
      name: service.name || '',
      type: service.type || 'Recurring',
      taskTemplate:
        service.taskTemplate?._id ||
        service.taskTemplate ||
        ''
    })
  }

  function getTemplateName(service) {
    const templateId =
      service.taskTemplate?._id ||
      service.taskTemplate

    const template = templates.find(
      item => item._id === templateId
    )

    return (
      service.taskTemplate?.name ||
      template?.name ||
      'Not assigned'
    )
  }

  if (role !== 'admin' && role !== 'manager') {
    return null
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Service Types</h1>
          <p>
            {role === 'admin'
              ? 'Create and manage service types.'
              : 'View service types.'}
          </p>
        </div>

        <button
          type="button"
          onClick={load}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {role === 'admin' && (
        <div className="card">
          <h2>
            {editingId
              ? 'Edit Service Type'
              : 'Add Service Type'}
          </h2>

          <form
            className="form-grid"
            onSubmit={handleSubmit}
          >
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={e =>
                  setForm({
                    ...form,
                    name: e.target.value
                  })
                }
                placeholder="e.g. Monthly GST Compliance"
              />
            </label>

            <label>
              Type
              <select
                value={form.type}
                onChange={e =>
                  setForm({
                    ...form,
                    type: e.target.value
                  })
                }
              >
                <option value="Recurring">
                  Recurring
                </option>

                <option value="One-time">
                  One-time
                </option>
              </select>
            </label>

            <label>
              Task Template
              <select
                required
                value={form.taskTemplate}
                onChange={e =>
                  setForm({
                    ...form,
                    taskTemplate: e.target.value
                  })
                }
              >
                <option value="">
                  Select task template
                </option>

                {templates.map(template => (
                  <option
                    key={template._id}
                    value={template._id}
                  >
                    {template.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <button
                type="submit"
                className="primary"
              >
                {editingId
                  ? 'Update Service'
                  : 'Add Service'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Service Types</h2>

          <span className="count">
            {services.length}
          </span>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Task Template</th>

                  {role === 'admin' && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {services.map(service => (
                  <tr key={service._id}>
                    <td>
                      {service.name}
                    </td>

                    <td>
                      {service.type}
                    </td>

                    <td>
                      {getTemplateName(service)}
                    </td>

                    {role === 'admin' && (
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(service)
                          }
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading &&
          services.length === 0 && (
            <p className="empty">
              No service types found.
            </p>
          )}
      </div>
    </div>
  )
}