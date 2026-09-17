import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { getUser } from '../utils/auth'

export default function Engagements() {
  const user = getUser()
  const role = user?.role?.toLowerCase()

  const [engagements, setEngagements] = useState([])
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    client: '',
    serviceType: '',
    type: 'Recurring',
    period: ''
  })

  async function load() {
    try {
      setLoading(true)
      setError('')

      const [
        engagementResult,
        clientResult,
        serviceResult
      ] = await Promise.all([
        api.engagements(),
        api.clients(),
        api.services()
      ])

      setEngagements(
        engagementResult?.engagements || []
      )

      setClients(
        clientResult?.clients || []
      )

      setServices(
        Array.isArray(serviceResult)
          ? serviceResult
          : serviceResult?.serviceTypes || []
      )

    } catch (err) {
      console.error(
        'Engagement loading error:',
        err
      )

      setError(
        err.message ||
        'Failed to load engagements'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function getClient(id) {
    const clientId =
      id?._id || id

    return clients.find(
      client =>
        client._id === clientId
    )
  }

  function getClientName(id) {
    const client = getClient(id)

    return (
      client?.name ||
      'Unknown Client'
    )
  }

  function getClientEmail(id) {
    const client = getClient(id)

    return client?.email || ''
  }

  function getServiceName(id) {
    const serviceId =
      id?._id || id

    const service = services.find(
      item =>
        item._id === serviceId
    )

    return (
      service?.name ||
      'Unknown Service'
    )
  }

  function startEdit(engagement) {
    setEditingId(engagement._id)

    setForm({
      client:
        engagement.client?._id ||
        engagement.client ||
        '',

      serviceType:
        engagement.serviceType?._id ||
        engagement.serviceType ||
        '',

      type:
        engagement.type ||
        'Recurring',

      period:
        engagement.period || ''
    })

    setError('')
  }

  function resetForm() {
    setEditingId(null)

    setForm({
      client: '',
      serviceType: '',
      type: 'Recurring',
      period: ''
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')

    if (!form.client) {
      setError('Please select a client')
      return
    }

    if (!form.serviceType) {
      setError(
        'Please select a service type'
      )
      return
    }

    if (
      form.type === 'Recurring' &&
      !form.period
    ) {
      setError(
        'Period is required for recurring engagement'
      )
      return
    }

    try {
      const data = {
        client: form.client,
        serviceType: form.serviceType,
        type: form.type,
        period:
          form.type === 'Recurring'
            ? form.period
            : ''
      }

      if (editingId) {
        await api.updateEngagement(
          editingId,
          data
        )
      } else {
        await api.createEngagement(data)
      }

      resetForm()

      await load()

    } catch (err) {
      console.error(
        'Engagement save error:',
        err
      )

      setError(
        err.message ||
        'Failed to save engagement'
      )
    }
  }

  async function createNextPeriod(id) {
    try {
      setError('')

      await api.nextPeriod(id)

      await load()

    } catch (err) {
      console.error(
        'Next period error:',
        err
      )

      setError(
        err.message ||
        'Failed to create next period'
      )
    }
  }

  if (
    role !== 'admin' &&
    role !== 'manager'
  ) {
    return null
  }

  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h1>Engagements</h1>

          <p>
            Manage client engagements and recurring periods.
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

      {/*manager*/}
      {role === 'manager' && (
        <div className="card">

          <h2>
            {editingId
              ? 'Edit Engagement'
              : 'Create Engagement'}
          </h2>

          <form
            className="form-grid"
            onSubmit={handleSubmit}
          >

            {/* client */}
            <label>
              Client

              <select
                required
                value={form.client}
                onChange={e =>
                  setForm({
                    ...form,
                    client: e.target.value
                  })
                }
              >

                <option value="">
                  Select client
                </option>

                {clients.map(client => (
                  <option
                    key={client._id}
                    value={client._id}
                  >
                    {client.name}
                    {client.email
                      ? ` — ${client.email}`
                      : ''}
                  </option>
                ))}

              </select>

            </label>

            {/* service */}
            <label>
              Service Type

              <select
                required
                value={form.serviceType}
                onChange={e =>
                  setForm({
                    ...form,
                    serviceType:
                      e.target.value
                  })
                }
              >

                <option value="">
                  Select service type
                </option>

                {services.map(service => (
                  <option
                    key={service._id}
                    value={service._id}
                  >
                    {service.name}
                  </option>
                ))}

              </select>

            </label>

            {/* tye */}
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

            {/* priod */}
            <label>
              Period

              <input
                type="month"
                required={
                  form.type === 'Recurring'
                }
                value={form.period}
                onChange={e =>
                  setForm({
                    ...form,
                    period: e.target.value
                  })
                }
              />

            </label>

            <div className="form-actions">

              <button
                type="submit"
                className="primary"
              >
                {editingId
                  ? 'Update Engagement'
                  : 'Create Engagement'}
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

      {/* engagement */}
      <div className="card">

        <div className="card-header">

          <h2>Engagements</h2>

          <span className="count">
            {engagements.length}
          </span>

        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-wrap">

            <table>

              <thead>

                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Period</th>

                  {role === 'manager' && (
                    <th>Action</th>
                  )}
                </tr>

              </thead>

              <tbody>

                {engagements.map(item => (
                  <tr key={item._id}>

                    <td>
                      {getClientName(
                        item.client
                      )}
                    </td>

                    <td>
                      {getClientEmail(
                        item.client
                      ) || '—'}
                    </td>

                    <td>
                      {getServiceName(
                        item.serviceType
                      )}
                    </td>

                    <td>
                      {item.type}
                    </td>

                    <td>
                      {item.period || '—'}
                    </td>

                    {role === 'manager' && (
                      <td>

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(item)
                          }
                        >
                          Edit
                        </button>

                        {item.type ===
                          'Recurring' && (
                          <button
                            type="button"
                            onClick={() =>
                              createNextPeriod(
                                item._id
                              )
                            }
                          >
                            Next Period
                          </button>
                        )}

                      </td>
                    )}

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

        {!loading &&
          engagements.length === 0 && (
            <p className="empty">
              No engagements found.
            </p>
          )}

      </div>

    </div>
  )
}
