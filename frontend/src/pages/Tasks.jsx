import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { getUser } from '../utils/auth'
import PageHeader from '../components/PageHeader'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'

const statuses = [
  'Not Started',
  'In Progress',
  'Waiting for Client',
  'Ready for Review',
  'Changes Requested',
  'Completed'
]

export default function Tasks() {
  const user = getUser()
  const role = user?.role?.toLowerCase()

  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  async function load() {
    try {
      setLoading(true)
      setError('')

      const taskResult = await api.tasks()

      setTasks(taskResult?.tasks || [])
      if (role === 'manager') {
        const memberResult = await api.teamMembers()
        setMembers(memberResult?.users || [])
      } else {
        setMembers([])
      }

    } catch (e) {
      console.error('Task loading error:', e)

      setError(
        e.message ||
        'Failed to load tasks'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {

      const matchesStatus =
        filter === 'All' ||
        task.status === filter

      const text = [
        task.title,
        task.assignedTo?.name,
        task.engagement?.period
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return (
        matchesStatus &&
        text.includes(search.toLowerCase())
      )
    })
  }, [tasks, filter, search])

  async function runAction(action) {
    try {
      setError('')

      await action()

      await load()

    } catch (e) {
      console.error('Task action error:', e)

      setError(
        e.message ||
        'Action failed'
      )
    }
  }

  if (loading) {
    return (
      <div className="page">

        <PageHeader
          title={
            role === 'team member'
              ? 'My Tasks'
              : 'Tasks'
          }
        />

        <Loading />

      </div>
    )
  }

  return (
    <div className="page">

      <PageHeader
        title={
          role === 'team member'
            ? 'My Tasks'
            : 'Tasks'
        }

        description={
          role === 'team member'
            ? 'Tasks assigned to you.'
            : 'Manage task assignment, deadlines and review workflow.'
        }

        action={
          <button
            type="button"
            onClick={load}
          >
            Refresh
          </button>
        }
      />

      <ErrorMessage
        message={error}
        onClose={() => setError('')}
      />

      <div className="toolbar">

        <input
          placeholder="Search task, assignee or period..."
          value={search}
          onChange={e =>
            setSearch(e.target.value)
          }
        />

        <select
          value={filter}
          onChange={e =>
            setFilter(e.target.value)
          }
        >

          <option value="All">
            All statuses
          </option>

          {statuses.map(status => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}

        </select>

      </div>

      <div className="card">

        <div className="card-header">

          <h2>Task List</h2>

          <span className="count">
            {visibleTasks.length}
          </span>

        </div>

        <div className="table-wrap">

          <table className="tasks-table">

            <thead>

              <tr>

                <th>Task</th>

                <th>Engagement</th>

                <th>Assignee</th>

                <th>Status</th>

                <th>Deadline</th>

                {/* ONLY MANAGER */}
                {role === 'manager' && (
                  <th>Assignment</th>
                )}

                {/* ONLY MANAGER */}
                {role === 'manager' && (
                  <th>Set Deadline</th>
                )}

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {visibleTasks.map(task => (

                <TaskRow
                  key={task._id}
                  task={task}
                  role={role}
                  members={members}
                  canAssign={role === 'manager'}
                  canEditDeadline={
                    role === 'manager'
                  }
                  runAction={runAction}
                />

              ))}

            </tbody>

          </table>

        </div>

        {!visibleTasks.length && (
          <p className="empty">
            No tasks match the current filters.
          </p>
        )}

      </div>

    </div>
  )
}


function TaskRow({
  task,
  role,
  members,
  canAssign,
  canEditDeadline,
  runAction
}) {

  const [assignee, setAssignee] =
    useState(
      task.assignedTo?._id || ''
    )

  const [deadline, setDeadline] =
    useState(
      toInputDate(task.deadline)
    )

  useEffect(() => {

    setAssignee(
      task.assignedTo?._id || ''
    )

    setDeadline(
      toInputDate(task.deadline)
    )

  }, [task])


  return (
    <tr>

      <td>

        <strong>
          {task.title}
        </strong>

      </td>


      <td>

        {task.engagement?.period || '—'}

      </td>

      <td>

        {task.assignedTo?.name || (
          <span className="muted">
            Unassigned
          </span>
        )}

      </td>


      <td>

        <StatusBadge
          status={task.status}
        />

      </td>

      <td>

        {task.deadline
          ? new Date(
              task.deadline
            ).toLocaleDateString()
          : '—'}

      </td>

      {canAssign && (

        <td>

          <div className="inline-control">

            <select
              value={assignee}
              onChange={e =>
                setAssignee(
                  e.target.value
                )
              }
            >

              <option value="">
                Unassigned
              </option>

              {members.map(member => (

                <option
                  key={member._id}
                  value={member._id}
                >
                  {member.name}
                </option>

              ))}

            </select>


            <button
              type="button"
              onClick={() => {

                if (!assignee) {
                  return
                }

                runAction(() =>
                  api.assignTask(
                    task._id,
                    assignee
                  )
                )

              }}
            >
              Assign
            </button>

          </div>

        </td>

      )}

      {canEditDeadline && (

        <td>

          <div className="inline-control">

            <input
              type="date"
              value={deadline}
              onChange={e =>
                setDeadline(
                  e.target.value
                )
              }
            />


            <button
              type="button"
              onClick={() => {

                if (!deadline) {
                  return
                }

                runAction(() =>
                  api.setDeadline(
                    task._id,
                    deadline
                  )
                )

              }}
            >
              Save
            </button>

          </div>

        </td>

      )}


      <td>

        <TaskActions
          task={task}
          role={role}
          runAction={runAction}
        />

      </td>

    </tr>
  )
}


function TaskActions({
  task,
  role,
  runAction
}) {

  if (role === 'team member') {

    return (

      <div className="action-stack">

        {task.status === 'Not Started' && (

          <button
            type="button"
            className="primary"
            onClick={() =>
              runAction(() =>
                api.updateStatus(
                  task._id,
                  'In Progress'
                )
              )
            }
          >
            Start Task
          </button>

        )}


        {task.status === 'Changes Requested' && (

          <button
            type="button"
            className="primary"
            onClick={() =>
              runAction(() =>
                api.updateStatus(
                  task._id,
                  'In Progress'
                )
              )
            }
          >
            Resume Work
          </button>

        )}


        {task.status === 'Waiting for Client' && (

          <button
            type="button"
            className="primary"
            onClick={() =>
              runAction(() =>
                api.updateStatus(
                  task._id,
                  'In Progress'
                )
              )
            }
          >
            Client Info Received
          </button>

        )}


        {task.status === 'In Progress' && (

          <>

            <button
              type="button"
              onClick={() =>
                runAction(() =>
                  api.waitingForClient(
                    task._id
                  )
                )
              }
            >
              Waiting for Client
            </button>


            <button
              type="button"
              className="primary"
              onClick={() =>
                runAction(() =>
                  api.submitTask(
                    task._id
                  )
                )
              }
            >
              Submit for Review
            </button>

          </>

        )}


        {(task.status === 'Ready for Review' ||
          task.status === 'Completed') && (

          <span className="muted">
            No action available
          </span>

        )}

      </div>

    )
  }

  if (role === 'manager') {

    return (

      <div className="action-stack">

        {task.status === 'Ready for Review' && (

          <>

            <button
              type="button"
              className="primary"
              onClick={() =>
                runAction(() =>
                  api.approveTask(
                    task._id
                  )
                )
              }
            >
              Approve
            </button>


            <button
              type="button"
              onClick={() =>
                runAction(() =>
                  api.requestChanges(
                    task._id
                  )
                )
              }
            >
              Request Changes
            </button>

          </>

        )}


        {task.status !== 'Ready for Review' && (

          <span className="muted">
            No review action
          </span>

        )}

      </div>

    )
  }

  if (role === 'admin') {

    return (

      <span className="muted">
        View only
      </span>

    )
  }


  return (

    <span className="muted">
      View only
    </span>

  )
}


function toInputDate(value) {

  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date
    .toISOString()
    .slice(0, 10)
}