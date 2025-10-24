import { useState } from 'react'
import { FileText, Check, Mail, AlertCircle, Lock } from 'lucide-react'

const API_URL = '/api'

export default function LOIModal({ isOpen, onClose, entity, entityType, currentUser, onLOISigned }) {
  const [step, setStep] = useState(1) // 1 = LOI text, 2 = Generování kódu, 3 = Zadání kódu
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [enteredCode, setEnteredCode] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !entity) return null

  const entityName = entityType === 'property' 
    ? entity.title 
    : `${entity.transaction_type} - ${entity.property_type}`

  const handleGenerateCode = async () => {
    if (!agreed) {
      alert('Musíte souhlasit s LOI (Letter of Intent)')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/loi/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          property_id: entityType === 'property' ? entity.id : null,
          demand_id: entityType === 'demand' ? entity.id : null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při generování kódu')
      }

      const data = await response.json()
      setGeneratedCode(data.code)
      setStep(2)
    } catch (error) {
      alert('Chyba: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (enteredCode.length !== 6) {
      setError('Kód musí mít 6 znaků')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/loi/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          property_id: entityType === 'property' ? entity.id : null,
          demand_id: entityType === 'demand' ? entity.id : null,
          code: enteredCode.toUpperCase()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Neplatný kód')
      }

      // Kód je správný - LOI podepsána
      if (onLOISigned) {
        onLOISigned()
      }
      onClose()
      alert('✅ LOI byla úspěšně podepsána! Nyní máte přístup k detailu.')
      window.location.reload()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gradient">
            LOI - Letter of Intent (Záměr spolupráce)
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Krok 1: LOI text */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-purple-50 border border-purple-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-purple-100 text-purple-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-purple-900 mb-3">Letter of Intent (LOI)</h3>
                  <div className="space-y-3 text-sm text-purple-800 max-h-96 overflow-y-auto p-4 bg-white rounded-lg">
                    <p className="font-semibold text-base">Strany:</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-purple-50 rounded">
                        <p className="font-semibold">Poskytovatel:</p>
                        <p className="mt-2"><strong>Estate Private s.r.o.</strong></p>
                        <p className="text-xs mt-1">IČO: 12345678</p>
                        <p className="text-xs">Adresa: Praha 1, Václavské náměstí 1</p>
                      </div>
                      
                      <div className="p-3 bg-purple-50 rounded">
                        <p className="font-semibold">Zájemce:</p>
                        <p className="mt-2"><strong>{currentUser.name}</strong></p>
                        <p className="text-xs mt-1">Email: {currentUser.email}</p>
                        {currentUser.company && <p className="text-xs">Firma: {currentUser.company}</p>}
                      </div>
                    </div>

                    <p className="font-semibold mt-6">Předmět zájmu:</p>
                    <p><strong>{entityName}</strong></p>
                    
                    <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg my-4">
                      <p className="font-semibold text-blue-900">📝 Co je LOI?</p>
                      <p className="text-sm text-blue-700 mt-2">
                        Letter of Intent (Záměr spolupráce) je dokument vyjadřující váš zájem 
                        o tuto {entityType === 'property' ? 'nemovitost' : 'poptávku'}. 
                        Podpisem LOI získáte přístup k detailním informacím.
                      </p>
                    </div>

                    <p className="font-semibold mt-4">1. Účel LOI:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Vyjádření vážného zájmu o {entityType === 'property' ? 'nemovitost' : 'poptávku'}</li>
                      <li>Získání přístupu k detailním informacím a kontaktům</li>
                      <li>Ochrana dat před neoprávněným přístupem</li>
                      <li>Zajištění GDPR compliance</li>
                    </ul>

                    <p className="font-semibold mt-4">2. Vaše práva:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Přístup k detailním informacím o {entityType === 'property' ? 'nemovitosti' : 'poptávce'}</li>
                      <li>Kontakt na agenta/vlastníka</li>
                      <li>Možnost sjednání prohlídky</li>
                      <li>Možnost zahájení jednání</li>
                    </ul>

                    <p className="font-semibold mt-4">3. Vaše povinnosti:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Zachování mlčenlivosti o získaných informacích</li>
                      <li>Nepoužívání informací k jiným účelům než k jednání</li>
                      <li>Respektování GDPR a ochrany osobních údajů</li>
                    </ul>

                    <p className="font-semibold mt-4">4. Platnost:</p>
                    <p className="ml-4">LOI je platná po dobu vašeho zájmu o {entityType === 'property' ? 'nemovitost' : 'poptávku'}.</p>

                    <p className="font-semibold mt-4">5. Ukončení:</p>
                    <p className="ml-4">LOI může být kdykoliv ukončena kteroukoli stranou bez udání důvodu.</p>

                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg mt-6">
                      <p className="font-semibold text-amber-900">⚠️ Důležité upozornění:</p>
                      <p className="text-sm text-amber-700 mt-2">
                        LOI není závaznou smlouvou a nezakládá žádné právní závazky k uzavření transakce. 
                        Slouží pouze k vyjádření zájmu a získání přístupu k informacím.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-lg border-2 border-purple-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={agreed} 
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        <strong>Souhlasím s LOI (Letter of Intent)</strong> a potvrzuji, 
                        že jsem si přečetl(a) všechny podmínky a zavazuji se je dodržovat.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="btn-secondary flex-1"
              >
                Zrušit
              </button>
              <button 
                onClick={handleGenerateCode} 
                disabled={!agreed || loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generuji kód...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Pokračovat k podpisu
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Krok 2: Kód vygenerován */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-green-50 border border-green-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-green-100 text-green-600">
                  <Check className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 mb-2">Kód byl odeslán</h3>
                  <p className="text-sm text-green-700">
                    Na vaši emailovou adresu <strong>{currentUser.email}</strong> byl odeslán 6-místný ověřovací kód.
                  </p>
                </div>
              </div>
            </div>

            {/* Zobrazit kód pro testování */}
            {generatedCode && (
              <div className="glass-card p-6 bg-blue-50 border-2 border-blue-300">
                <div className="flex items-start gap-4">
                  <div className="icon-circle bg-blue-100 text-blue-600">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Pro testování:</h3>
                    <p className="text-3xl font-bold text-blue-600 font-mono tracking-wider text-center py-4">
                      {generatedCode}
                    </p>
                    <p className="text-xs text-blue-700 text-center">
                      (V produkci by kód byl odeslán pouze emailem)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Zadejte 6-místný kód z emailu:
              </label>
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                  if (value.length <= 6) {
                    setEnteredCode(value)
                    setError('')
                  }
                }}
                placeholder="XXXXXX"
                className="glass-input text-center text-2xl font-bold tracking-widest font-mono"
                maxLength={6}
                autoFocus
              />
              <p className="text-center text-sm text-gray-500">
                {enteredCode.length}/6 znaků
              </p>

              {error && (
                <div className="glass-card p-4 bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)} 
                className="btn-secondary flex-1"
              >
                Zpět
              </button>
              <button 
                onClick={handleVerifyCode} 
                disabled={enteredCode.length !== 6 || loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Ověřuji...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Podepsat LOI
                  </>
                )}
              </button>
            </div>

            <div className="glass-card p-4 bg-gray-50">
              <p className="text-xs text-gray-600 text-center">
                <strong>Tip:</strong> Pokud jste kód neobdrželi, zkontrolujte složku SPAM nebo požádejte o nový kód.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
