import { useState, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'

export default function NotificationBell({ userId, onContractRequired }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      fetchUnreadCount()
      
      // Polling každých 30 sekund
      const interval = setInterval(() => {
        fetchNotifications()
        fetchUnreadCount()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/${userId}`)
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Chyba při načítání notifikací:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`/api/notifications/${userId}/unread-count`)
      const data = await response.json()
      setUnreadCount(data.count)
    } catch (error) {
      console.error('Chyba při načítání počtu nepřečtených:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Chyba při označování jako přečtené:', error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      await fetch(`/api/notifications/user/${userId}/read-all`, {
        method: 'PATCH'
      })
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Chyba při označování všech jako přečtené:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Chyba při mazání notifikace:', error)
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'approval': return 'Schváleno'
      case 'rejection': return 'Zamítnuto'
      case 'match': return 'Shoda'
      case 'message': return 'Zpráva'
      case 'system': return 'Systém'
      case 'contract_required': return 'Podpis smlouvy'
      default: return 'Oznámení'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // rozdíl v sekundách

    if (diff < 60) return 'právě teď'
    if (diff < 3600) return `před ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `před ${Math.floor(diff / 3600)} h`
    if (diff < 604800) return `před ${Math.floor(diff / 86400)} dny`
    return date.toLocaleDateString('cs-CZ')
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}
        onMouseLeave={(e) => e.target.style.background = 'none'}
      >
        <Bell size={24} color={unreadCount > 0 ? '#667eea' : '#6b7280'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#ef4444',
            color: 'white',
            borderRadius: '10px',
            padding: '2px 6px',
            fontSize: '11px',
            fontWeight: 'bold',
            minWidth: '18px',
            textAlign: 'center'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40
            }}
            onClick={() => setShowDropdown(false)}
          />
          
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            width: '400px',
            maxWidth: '90vw',
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 50,
            maxHeight: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>
                Notifikace
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    style={{
                      background: '#eff6ff',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      color: '#3b82f6',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? 'Označuji...' : 'Označit vše'}
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div style={{
              overflowY: 'auto',
              maxHeight: '500px'
            }}>
              {notifications.length === 0 ? (
                <div style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>Žádné notifikace</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #f3f4f6',
                      background: notif.is_read ? 'white' : '#f0f9ff',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => e.target.style.background = notif.is_read ? '#f9fafb' : '#e0f2fe'}
                    onMouseLeave={(e) => e.target.style.background = notif.is_read ? 'white' : '#f0f9ff'}
                    onClick={() => {
                      if (!notif.is_read) markAsRead(notif.id)
                      
                      // Speciální handling pro contract_required notifikace
                      if (notif.type === 'contract_required' && onContractRequired) {
                        setShowDropdown(false)
                        onContractRequired(notif.entity_type, notif.entity_id)
                      } else if (notif.action_url) {
                        window.location.href = notif.action_url
                      }
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ 
                        fontSize: '0.75rem',
                        flexShrink: 0,
                        background: '#e0e7ff',
                        color: '#4338ca',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontWeight: '600'
                      }}>
                        {getTypeLabel(notif.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.875rem',
                          fontWeight: notif.is_read ? '500' : '700',
                          color: '#111827'
                        }}>
                          {notif.title}
                        </h4>
                        <p style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          lineHeight: '1.4'
                        }}>
                          {notif.message}
                        </p>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af'
                        }}>
                          {formatTime(notif.created_at)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notif.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          opacity: 0.5,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = 1}
                        onMouseLeave={(e) => e.target.style.opacity = 0.5}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
