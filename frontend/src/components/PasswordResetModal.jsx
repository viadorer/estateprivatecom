import { useState } from 'react'
import { Mail, Lock, Check, AlertCircle } from 'lucide-react'

const API_URL = '/api'

export default function PasswordResetModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1) // 1 = Email, 2 = Kód + Heslo
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedCode, setGeneratedCode] = useState(null)

  if (!isOpen) return null

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při žádosti o reset')
      }

      setGeneratedCode(data.code) // Pro testování (development)
      setStep(2)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Hesla se neshodují')
      return
    }

    if (newPassword.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: code.toUpperCase(),
          new_password: newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při resetu hesla')
      }

      alert('Heslo bylo úspěšně změněno! Nyní se můžete přihlásit.')
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gradient">
            Reset hesla
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Krok 1: Zadání emailu */}
        {step === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div className="glass-card p-6 bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-blue-100 text-blue-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Zapomenuté heslo?</h3>
                  <p className="text-sm text-blue-700">
                    Zadejte svůj email a my vám pošleme kód pro reset hesla.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                placeholder="vas-email@example.com"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="glass-card p-4 bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Odesílám...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Odeslat kód
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Krok 2: Zadání kódu a nového hesla */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="glass-card p-6 bg-green-50 border border-green-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-green-100 text-green-600">
                  <Check className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 mb-2">Kód odeslán</h3>
                  <p className="text-sm text-green-700">
                    Na email <strong>{email}</strong> byl odeslán 6-místný kód.
                  </p>
                </div>
              </div>
            </div>

            {/* Zobrazit kód pro testování */}
            {generatedCode && (
              <div className="glass-card p-4 bg-blue-50 border-2 border-blue-300">
                <div className="flex items-start gap-4">
                  <div className="icon-circle bg-blue-100 text-blue-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">Pro testování:</h3>
                    <p className="text-2xl font-bold text-blue-600 font-mono tracking-wider text-center py-2">
                      {generatedCode}
                    </p>
                    <p className="text-xs text-blue-700 text-center mt-2">
                      (V produkci by kód byl odeslán pouze emailem)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6-místný kód z emailu
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                  if (value.length <= 6) setCode(value)
                }}
                className="glass-input text-center text-2xl font-bold tracking-widest font-mono"
                placeholder="XXXXXX"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-center text-sm text-gray-500 mt-1">
                {code.length}/6 znaků
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nové heslo
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="glass-input"
                placeholder="Alespoň 6 znaků"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potvrdit heslo
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-input"
                placeholder="Zadejte heslo znovu"
                required
              />
            </div>

            {error && (
              <div className="glass-card p-4 bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                Zpět
              </button>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Resetuji...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Změnit heslo
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
