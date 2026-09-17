import { useEffect, useState } from 'react'
import { api } from '../services/api'
import PageHeader from '../components/PageHeader'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

const emptyForm = {
  name: '',
  tasksText: ''
}

export default function TaskTemplates() {
  const [templates, setTemplates] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      setError('')

      const result = await api.taskTemplates()
      setTemplates(result?.taskTemplates || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function editTemplate(template) {
    setEditing(template)

    setForm({
      name: template.name || '',
      tasksText: (template.tasks || [])
        .map(task => task.title || task.name || '')
        .join('\n')
    })
  }

  function reset() {
    setEditing(null)
    setForm(emptyForm)
  }

  async function save(e) {
    e.preventDefault()

    const tasks = form.tasksText
      .split('\n')
      .map(title => title.trim())
      .filter(Boolean)
      .map(title => ({ title }))

    try {
      setSaving(true)
      setError('')

      const payload = {
        name: form.name,
        tasks
      }

      if (editing) {
        await api.updateTaskTemplate(editing._id, payload)
      } else {
        await api.createTaskTemplate(payload)
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
    return <div className="page"><PageHeader title="Task Templates" /><Loading /></div>
  }

  return (
    <div className="page">
      <PageHeader
        title="Task Templates"
        description="Create templates used when engagements generate tasks."
        action={<button onClick={load}>Refresh</button>}
      />

      <ErrorMessage message={error} onClose={() => setError('')} />

      <div className="card">
        <h2>{editing ? 'Edit Task Template' : 'Add Task Template'}</h2>

        <form className="form-grid" onSubmit={save}>
          <label>
            Template Name
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label className="wide">
            Tasks
            <textarea
              rows="7"
              value={form.tasksText}
              onChange={e => setForm({ ...form, tasksText: e.target.value })}
              placeholder={'Collect client information\nPrepare GST return\nReview GST return\nSubmit GST return'}
              required
            />
            <small>Enter one task title per line.</small>
          </label>

          <div className="form-actions">
            <button className="primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Template' : 'Create Template'}
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
          <h2>Templates</h2>
          <span className="count">{templates.length}</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Tasks</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {templates.map(template => (
                <tr key={template._id}>
                  <td>{template.name}</td>
                  <td>
                    <div className="task-lines">
                      {(template.tasks || []).map((task, index) => (
                        <span key={task._id || index}>
                          {index + 1}. {task.title || task.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button onClick={() => editTemplate(template)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!templates.length && <p className="empty">No task templates found.</p>}
      </div>
    </div>
  )
}
