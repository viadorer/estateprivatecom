import { useState, useEffect } from 'react'
import { Clock, Plus, Check, FileText, RefreshCw, AlertCircle } from 'lucide-react'

const API_URL = '/api'

export default function EntityHistory({ entityType, entityId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [entityType, entityId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/history/${entityType}/${entityId}`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      } else {
        throw new Error('Chyba při načítání historie')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'plus': return <Plus className="w-5 h-5" />
      case 'check': return <Check className="w-5 h-5" />
      case 'file-text': return <FileText className="w-5 h-5" />
      case 'refresh': return <RefreshCw className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'green': return 'bg-green-100 text-green-600 border-green-200'
      case 'purple': return 'bg-purple-100 text-purple-600 border-purple-200'
      case 'orange': return 'bg-orange-100 text-orange-600 border-orange-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historie</h3>
        <div className="text-center py-8 text-gray-500">Načítání...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historie</h3>
        <div className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary-600" />
        Historie
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Timeline items */}
        <div className="space-y-6">
          {history.map((item, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 ${getColorClasses(item.color)}`}>
                {getIcon(item.icon)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="glass-card p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{item.description}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{item.user}</span>
                  </p>

                  {item.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      {item.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Žádná historie k dispozici
          </div>
        )}
      </div>
    </div>
  )
}
