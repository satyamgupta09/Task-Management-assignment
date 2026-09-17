import { NavLink, useNavigate } from 'react-router-dom'
import { getUser, logout } from '../utils/auth'

export default function Sidebar() {
  const navigate = useNavigate()
  const user = getUser()
  const role = user?.role?.toLowerCase()

  const links = {
    admin: [
      ['/dashboard', 'Dashboard'],
      ['/tasks', 'Tasks'],
      ['/engagements', 'Engagements'],
      ['/clients', 'Clients'],
      ['/users', 'Users'],
      ['/services', 'Service Types'],
      ['/templates', 'Task Templates']
    ],

    manager: [
      ['/dashboard', 'Dashboard'],
      ['/tasks', 'Tasks'],
      ['/engagements', 'Engagements'],
      ['/clients', 'Clients'],
      ['/services', 'Service Types']
    ],

    'team member': [
      ['/dashboard', 'Dashboard'],
      ['/tasks', 'My Tasks']
    ]
  }

  const navigation = links[role] || []

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        TaskFlow<span>.</span>
      </div>

      <div className="user-box">
        <strong>{user?.name || 'User'}</strong>
        <span>{user?.role || ''}</span>
      </div>

      <nav className="sidebar-nav">
        {navigation.map(([path, label]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  )
}
