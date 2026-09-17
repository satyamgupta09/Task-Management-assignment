import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Engagements from './pages/Engagements'
import Clients from './pages/Clients'
import Users from './pages/Users'
import ServiceTypes from './pages/ServiceTypes'
import TaskTemplates from './pages/TaskTemplates'
import Layout from './components/Layout'
import { getUser } from './utils/auth'

function PrivateRoute() {
  return getUser() ? <Layout /> : <Navigate to="/login" replace />
}

function RoleRoute({ roles, children }) {
  const user = getUser()
  const role = user?.role?.toLowerCase()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<PrivateRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />

        <Route path="tasks" element={<Tasks />} />

        <Route
          path="engagements"
          element={
            <RoleRoute roles={['admin', 'manager']}>
              <Engagements />
            </RoleRoute>
          }
        />

        <Route
          path="clients"
          element={
            <RoleRoute roles={['admin', 'manager']}>
              <Clients />
            </RoleRoute>
          }
        />

        <Route
          path="users"
          element={
            <RoleRoute roles={['admin']}>
              <Users />
            </RoleRoute>
          }
        />

        <Route
          path="services"
          element={
            <RoleRoute roles={['admin', 'manager']}>
              <ServiceTypes />
            </RoleRoute>
          }
        />

        <Route
          path="templates"
          element={
            <RoleRoute roles={['admin']}>
              <TaskTemplates />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
