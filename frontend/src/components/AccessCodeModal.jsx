import { useState } from 'react'
import { X, Lock } from 'lucide-react'

export default function AccessCodeModal({ isOpen, onClose, onSubmit, entityType }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (code.length !== 6) {
      setError('Kód musí mít 6 znaků')
      return
    }

    setLoading(true)
    setError('')

    try {
      const success = await onSubmit(code.toUpperCase())
      if (!success) {
        setError('Neplatný nebo expirovaný kód')
      }
    } catch (err) {
      setError(err.message || 'Chyba při ověřování kódu')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCode('')
    setError('')
    onClose()
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= 6) {
      setCode(value)
      setError('')
    }
  }

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            Zadat přístupový kód
          </h2>
          <button 
            onClick={handleClose}
            style={{
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
            onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <X size={24} />
          </button>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Lock 
              size={48} 
              style={{ 
                color: '#667eea',
                animation: 'pulse 2s ease-in-out infinite'
              }} 
            />
          </div>

          <p className="text-center text-gray-600 mb-6">
            Pro zobrazení detailu {entityType === 'property' ? 'nemovitosti' : 'poptávky'} 
            zadejte 6-místný přístupový kód, který jste obdrželi od agenta.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Přístupový kód *</label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="XXXXXX"
                className="glass-input"
                maxLength={6}
                autoFocus
                required
                style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.5em',
                  fontFamily: "'Courier New', monospace",
                  textTransform: 'uppercase'
                }}
              />
              <div style={{ 
                textAlign: 'center', 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginTop: '0.5rem' 
              }}>
                {code.length}/6 znaků
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center',
                animation: 'shake 0.5s'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={handleClose} 
                className="btn-secondary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                Zrušit
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading || code.length !== 6}
                style={{ flex: 1 }}
              >
                {loading ? 'Ověřuji...' : 'Ověřit kód'}
              </button>
            </div>
          </form>

          <div style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid #e5e7eb', 
            textAlign: 'center' 
          }}>
            <p className="text-sm text-gray-500">
              Pokud nemáte přístupový kód, kontaktujte svého agenta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
