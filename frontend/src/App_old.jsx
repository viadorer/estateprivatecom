import { useState, useEffect } from 'react'
import { LayoutDashboard, FolderKanban, CheckSquare, Users as UsersIcon, Plus, Trash2, Edit, Calendar, LogOut, User, Lock, Mail, Shield, Crown, UserCog } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    // Načíst přihlášeného uživatele z localStorage
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes, statsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/users'),
        fetch('/api/stats')
      ])
      
      setProjects(await projectsRes.json())
      setTasks(await tasksRes.json())
      setUsers(await usersRes.json())
      setStats(await statsRes.json())
      setLoading(false)
    } catch (error) {
      console.error('Chyba při načítání dat:', error)
      setLoading(false)
    }
  }

  const deleteTask = async (id) => {
    if (!confirm('Opravdu chcete smazat tento úkol?')) return
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Chyba při mazání úkolu:', error)
    }
  }

  const deleteProject = async (id) => {
    if (!confirm('Opravdu chcete smazat tento projekt?')) return
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Chyba při mazání projektu:', error)
    }
  }

  const updateTaskStatus = async (id, newStatus) => {
    try {
      const task = tasks.find(t => t.id === id)
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      })
      fetchData()
    } catch (error) {
      console.error('Chyba při aktualizaci úkolu:', error)
    }
  }

  const deleteUser = async (id) => {
    if (!confirm('Opravdu chcete smazat tohoto uživatele? Budou smazány i všechny jeho projekty a úkoly!')) return
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Chyba při mazání uživatele:', error)
    }
  }

  const createUser = async (name, email) => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })
      fetchData()
    } catch (error) {
      console.error('Chyba při vytváření uživatele:', error)
      throw error
    }
  }

  const updateUser = async (id, name, email) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      })
      fetchData()
    } catch (error) {
      console.error('Chyba při aktualizaci uživatele:', error)
      throw error
    }
  }

  const createProject = async (name, description, user_id) => {
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, user_id })
      })
      fetchData()
    } catch (error) {
      console.error('Chyba při vytváření projektu:', error)
      throw error
    }
  }

  const updateProject = async (id, name, description, user_id) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, user_id })
      })
      fetchData()
    } catch (error) {
      console.error('Chyba při aktualizaci projektu:', error)
      throw error
    }
  }

  const createTask = async (title, description, status, priority, project_id, user_id, due_date) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, priority, project_id, user_id, due_date })
      })
      fetchData()
    } catch (error) {
      console.error('Chyba při vytváření úkolu:', error)
      throw error
    }
  }

  const updateTask = async (id, title, description, status, priority, project_id, user_id, due_date) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, priority, project_id, user_id, due_date })
      })
      fetchData()
    } catch (error) {
      console.error('Chyba při aktualizaci úkolu:', error)
      throw error
    }
  }

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Přihlášení selhalo')
      }
      
      const user = await response.json()
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
      setShowLoginModal(false)
    } catch (error) {
      console.error('Chyba při přihlášení:', error)
      throw error
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Načítání...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                    <CheckSquare className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Task Manager</h1>
                </div>
              </div>
              {currentUser && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'projects'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <FolderKanban className="w-4 h-4 mr-2" />
                  Projekty
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'tasks'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Úkoly
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Uživatelé
                </button>
              </div>
              )}
            </div>
            <div className="flex items-center">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2">
                    <div className="text-2xl">{currentUser.avatar || '👤'}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                      <RoleBadge role={currentUser.role} />
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Odhlásit
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Přihlásit se
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!currentUser ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vítejte v Task Manageru</h2>
              <p className="text-gray-600 mb-4">Pro pokračování se prosím přihlaste</p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <User className="w-5 h-5 mr-2" />
                Přihlásit se
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard stats={stats} tasks={tasks} projects={projects} />}
            {activeTab === 'projects' && <Projects projects={projects} users={users} onDelete={deleteProject} onCreate={createProject} onUpdate={updateProject} />}
            {activeTab === 'tasks' && <Tasks tasks={tasks} projects={projects} users={users} onDelete={deleteTask} onUpdateStatus={updateTaskStatus} onCreate={createTask} onUpdate={updateTask} />}
            {activeTab === 'users' && <Users users={users} onDelete={deleteUser} onCreate={createUser} onUpdate={updateUser} />}
          </>
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && <LoginForm onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
    </div>
  )
}

function Dashboard({ stats, tasks, projects }) {
  const recentTasks = tasks.slice(0, 5)
  
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Celkem projektů" value={stats.totalProjects} color="blue" />
        <StatCard title="Celkem úkolů" value={stats.totalTasks} color="purple" />
        <StatCard title="Dokončeno" value={stats.completedTasks} color="green" />
        <StatCard title="Probíhá" value={stats.inProgressTasks} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Poslední úkoly</h3>
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.project_name}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aktivní projekty</h3>
          <div className="space-y-3">
            {projects.filter(p => p.status === 'active').map(project => (
              <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{project.name}</p>
                <p className="text-sm text-gray-500">{project.task_count} úkolů</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Projects({ projects, users, onDelete, onCreate, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', user_id: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProject) {
        await onUpdate(editingProject.id, formData.name, formData.description, formData.user_id)
      } else {
        await onCreate(formData.name, formData.description, formData.user_id)
      }
      setShowModal(false)
      setEditingProject(null)
      setFormData({ name: '', description: '', user_id: '' })
    } catch (error) {
      alert('Chyba: ' + error.message)
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({ name: project.name, description: project.description, user_id: project.user_id })
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingProject(null)
    setFormData({ name: '', description: '', user_id: '' })
    setShowModal(true)
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Projekty</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Přidat projekt
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <div key={project.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{project.task_count} úkolů</span>
              <span className="text-gray-500">{project.user_name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingProject ? 'Upravit projekt' : 'Přidat projekt'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Název</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vlastník</label>
                  <select
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Vyberte uživatele</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingProject(null)
                    setFormData({ name: '', description: '', user_id: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingProject ? 'Uložit' : 'Přidat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Tasks({ tasks, projects, users, onDelete, onUpdateStatus, onCreate, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    project_id: '',
    user_id: '',
    due_date: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTask) {
        await onUpdate(
          editingTask.id,
          formData.title,
          formData.description,
          formData.status,
          formData.priority,
          formData.project_id,
          formData.user_id,
          formData.due_date || null
        )
      } else {
        await onCreate(
          formData.title,
          formData.description,
          formData.status,
          formData.priority,
          formData.project_id,
          formData.user_id,
          formData.due_date || null
        )
      }
      setShowModal(false)
      setEditingTask(null)
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        project_id: '',
        user_id: '',
        due_date: ''
      })
    } catch (error) {
      alert('Chyba: ' + error.message)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      project_id: task.project_id,
      user_id: task.user_id,
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      project_id: '',
      user_id: '',
      due_date: ''
    })
    setShowModal(true)
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Úkoly</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Přidat úkol
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Název</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projekt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stav</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorita</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akce</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.project_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                  >
                    <option value="todo">K provedení</option>
                    <option value="in_progress">Probíhá</option>
                    <option value="completed">Dokončeno</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTask ? 'Upravit úkol' : 'Přidat úkol'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Název</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                  <select
                    required
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Vyberte projekt</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Přiřazený uživatel</label>
                  <select
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Vyberte uživatele</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stav</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">K provedení</option>
                    <option value="in_progress">Probíhá</option>
                    <option value="completed">Dokončeno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorita</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Nízká</option>
                    <option value="medium">Střední</option>
                    <option value="high">Vysoká</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Termín splnění</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTask(null)
                    setFormData({
                      title: '',
                      description: '',
                      status: 'todo',
                      priority: 'medium',
                      project_id: '',
                      user_id: '',
                      due_date: ''
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingTask ? 'Uložit' : 'Přidat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Users({ users, onDelete, onCreate, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await onUpdate(editingUser.id, formData.name, formData.email)
      } else {
        await onCreate(formData.name, formData.email)
      }
      setShowModal(false)
      setEditingUser(null)
      setFormData({ name: '', email: '' })
    } catch (error) {
      alert('Chyba: ' + error.message)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: user.email })
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '' })
    setShowModal(true)
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Uživatelé</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Přidat uživatele
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {users.map(user => (
            <li key={user.id} className="px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-3xl">{user.avatar || '👤'}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <RoleBadge role={user.role} />
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('cs-CZ')}
                  </span>
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-800 transition"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingUser ? 'Upravit uživatele' : 'Přidat uživatele'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jméno
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingUser(null)
                    setFormData({ name: '', email: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingUser ? 'Uložit' : 'Přidat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500'
  }
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${colors[color]} rounded-md p-3`}>
            <CheckSquare className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  }
  
  const labels = {
    todo: 'K provedení',
    in_progress: 'Probíhá',
    completed: 'Dokončeno'
  }
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const styles = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }
  
  const labels = {
    low: 'Nízká',
    medium: 'Střední',
    high: 'Vysoká'
  }
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[priority]}`}>
      {labels[priority]}
    </span>
  )
}

function LoginForm({ onLogin, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await onLogin(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">Přihlášení</h2>
          <p className="text-blue-100 text-center text-sm">Zadejte své přihlašovací údaje</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="vas@email.cz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heslo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Přihlašování...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Přihlásit se
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Zrušit
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">🔑 Demo přihlašovací údaje:</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p><strong>Admin:</strong> admin@taskmanager.cz / heslo123</p>
              <p><strong>Manager:</strong> jan.novak@example.com / heslo123</p>
              <p><strong>User:</strong> eva.svobodova@example.com / heslo123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoleBadge({ role }) {
  const config = {
    admin: {
      icon: Crown,
      label: 'Admin',
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    manager: {
      icon: UserCog,
      label: 'Manager',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    user: {
      icon: User,
      label: 'Uživatel',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const { icon: Icon, label, className } = config[role] || config.user

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  )
}

export default App
