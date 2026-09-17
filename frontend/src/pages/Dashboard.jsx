import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { getUser } from '../utils/auth'
import PageHeader from '../components/PageHeader'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'

function TaskList({ title, tasks }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>{title}</h2>
        <span className="count">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p className="empty">No tasks here.</p>
      ) : (
        <div className="mini-list">
          {tasks.slice(0, 6).map(task => (
            <div className="mini-task" key={task._id}>
              <div>
                <strong>{task.title}</strong>
                <small>
                  {task.engagement?.period || 'No period'}
                  {task.assignedTo?.name
                    ? ` • ${task.assignedTo.name}`
                    : ''}
                </small>
              </div>

              <StatusBadge status={task.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const user = getUser()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      setError('')
      setData(await api.dashboard())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Dashboard" description="Task and engagement overview" />
        <Loading />
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        description={`Welcome ${user?.name || 'back'}. Here's your current task overview.`}
        action={
          <button onClick={load}>Refresh</button>
        }
      />

      <ErrorMessage message={error} onClose={() => setError('')} />

      {data && (
        <>
          <div className="stats-grid">
            <Stat title="Open Tasks" value={data.openTasks?.length || 0} />
            <Stat title="Overdue Tasks" value={data.overdueTasks?.length || 0} />
            <Stat title="Due Today" value={data.tasksDueToday?.length || 0} />
            <Stat title="Waiting for Client" value={data.tasksWaitingForClient?.length || 0} />
            <Stat title="Waiting for Review" value={data.tasksWaitingForReview?.length || 0} />
          </div>

          <div className="dashboard-grid">
            <TaskList title="Open Tasks" tasks={data.openTasks || []} />
            <TaskList title="Overdue Tasks" tasks={data.overdueTasks || []} />
            <TaskList title="Due Today" tasks={data.tasksDueToday || []} />
            <TaskList title="Waiting for Client" tasks={data.tasksWaitingForClient || []} />
            <TaskList title="Waiting for Review" tasks={data.tasksWaitingForReview || []} />
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ title, value }) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  )
}
