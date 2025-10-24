import { useState, useEffect } from 'react'
import { X, Copy, Check } from 'lucide-react'

export default function GenerateAccessCodeModal({ isOpen, onClose, entity, entityType, onGenerate }) {
  const [selectedUser, setSelectedUser] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('7')
  const [generatedCode, setGeneratedCode] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])

  // Načíst klienty při otevření modalu
  useEffect(() => {
    if (isOpen) {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          const clients = data.filter(u => u.role === 'client')
          setUsers(clients)
        })
    }
  }, [isOpen])

  const handleGenerate = async () => {
    if (!selectedUser) {
      alert('Vyberte klienta')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(selectedUser),
          entity_type: entityType,
          entity_id: entity.id,
          expires_in_days: expiresInDays ? parseInt(expiresInDays) : null
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setGeneratedCode(data)
        if (onGenerate) onGenerate(data)
      } else {
        alert(data.error || 'Chyba při generování kódu')
      }
    } catch (error) {
      console.error('Chyba:', error)
      alert('Chyba při generování kódu')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setGeneratedCode(null)
    setSelectedUser('')
    setExpiresInDays('7')
    setCopied(false)
    onClose()
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
          maxWidth: '600px',
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
            Generovat přístupový kód
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
          {!generatedCode ? (
            <>
              <p className="text-gray-600 mb-4">
                {entityType === 'property' ? 'Nemovitost' : 'Poptávka'}: <strong>{entity.title || 'Detail'}</strong>
              </p>

              <div className="form-group">
                <label>Klient *</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="glass-input"
                  required
                >
                  <option value="">Vyberte klienta</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Platnost kódu</label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  className="glass-input"
                >
                  <option value="">Bez expirace</option>
                  <option value="1">1 den</option>
                  <option value="7">7 dní</option>
                  <option value="14">14 dní</option>
                  <option value="30">30 dní</option>
                  <option value="90">90 dní</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={handleClose} className="btn-secondary" style={{ flex: 1 }}>
                  Zrušit
                </button>
                <button 
                  onClick={handleGenerate} 
                  className="btn-primary"
                  disabled={loading || !selectedUser}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Generuji...' : 'Generovat kód'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Kód úspěšně vygenerován!</h3>
                  {generatedCode.message && (
                    <p className="text-sm text-gray-600">{generatedCode.message}</p>
                  )}
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '2rem',
                  borderRadius: '12px',
                  margin: '1.5rem 0'
                }}>
                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}>
                    <span style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      fontFamily: "'Courier New', monospace",
                      letterSpacing: '0.3em',
                      color: '#667eea'
                    }}>{generatedCode.code}</span>
                    <button 
                      onClick={handleCopy}
                      title="Kopírovat do schránky"
                      style={{
                        background: '#f3f4f6',
                        border: 'none',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#e5e7eb'
                        e.target.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#f3f4f6'
                        e.target.style.transform = 'scale(1)'
                      }}
                    >
                      {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                  </div>
                  {generatedCode.expires_at && (
                    <p className="text-sm text-gray-600 mt-2">
                      Platnost do: {new Date(generatedCode.expires_at).toLocaleString('cs-CZ')}
                    </p>
                  )}
                </div>

                <div style={{
                  background: '#eff6ff',
                  borderLeft: '4px solid #3b82f6',
                  padding: '1rem',
                  borderRadius: '4px',
                  marginTop: '1rem'
                }}>
                  <p className="text-sm">
                    Tento kód předejte klientovi emailem, SMS nebo jiným způsobem.
                    Klient ho použije pro zobrazení detailu.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button onClick={handleClose} className="btn-primary" style={{ width: '100%' }}>
                  Zavřít
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
