import { useState } from 'react'
import { FileText, Check, Mail, AlertCircle } from 'lucide-react'
import ComplianceNotice from './ComplianceNotice'

const API_URL = '/api'

export default function BrokerageContractModal({ isOpen, onClose, entity, entityType, currentUser, onContractSigned }) {
  const [step, setStep] = useState(1) // 1 = Smlouva, 2 = Generování kódu, 3 = Zadání kódu
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
      alert('Musíte souhlasit se zprostředkovatelskou smlouvou')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/brokerage-contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          entity_type: entityType,
          entity_id: entity.id,
          commission_rate: entity.commission_rate,
          send_email: true
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
      const response = await fetch(`${API_URL}/brokerage-contracts/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          entity_type: entityType,
          entity_id: entity.id,
          code: enteredCode
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Neplatný kód')
      }

      // Kód je správný - smlouva podepsána
      if (onContractSigned) {
        onContractSigned()
      }
      onClose()
      alert('Zprostředkovatelská smlouva byla úspěšně podepsána! Nabídka/poptávka je nyní aktivní.')
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
            Zprostředkovatelská smlouva
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <ComplianceNotice className="mb-6" />

        {/* Krok 1: Smlouva */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-blue-100 text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">Zprostředkovatelská smlouva</h3>
                  <div className="space-y-3 text-sm text-blue-800 max-h-96 overflow-y-auto p-4 bg-white rounded-lg">
                    <p className="font-semibold text-base">Smluvní strany:</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="font-semibold">Zprostředkovatel:</p>
                        <p className="mt-2"><strong>PTF reality, s.r.o.</strong></p>
                        <p className="text-xs mt-1">IČO: 06684394</p>
                        <p className="text-xs">Sídlo: Dřevěná 99/3, 301 00 Plzeň</p>
                        <p className="text-xs mt-1">Zapsaná v OR Krajského soudu v Plzni, oddíl C, vložka 35601</p>
                        <p className="text-xs mt-1">Zastoupená: Bc. David Choc, jednatel</p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="font-semibold">Agent:</p>
                        <p className="mt-2"><strong>{currentUser.name}</strong></p>
                        <p className="text-xs mt-1">Email: {currentUser.email}</p>
                        {currentUser.company && <p className="text-xs">Firma: {currentUser.company}</p>}
                        {currentUser.ico && <p className="text-xs">IČO: {currentUser.ico}</p>}
                      </div>
                    </div>

                    <p className="font-semibold mt-6">Předmět smlouvy:</p>
                    <p><strong>{entityName}</strong></p>
                    
                    <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg my-4">
                      <p className="font-semibold text-amber-900 text-lg">Provize Estate Private:</p>
                      <p className="text-3xl font-bold text-amber-600 mt-2">{entity.commission_rate}%</p>
                      <p className="text-xs text-amber-700 mt-2">z celkové ceny transakce při úspěšném uzavření obchodu</p>
                    </div>

                    <p className="font-semibold mt-4">Podmínky spolupráce:</p>
                    <p className="p-3 bg-gray-50 rounded">{entity.commission_terms || 'Standardní podmínky zprostředkování'}</p>
                    
                    <p className="font-semibold mt-4">1. Závazky zprostředkovatele (Estate Private):</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Poskytnutí platformy pro prezentaci nabídky/poptávky</li>
                      <li>Matching s vhodnými protistranami</li>
                      <li>Technická podpora systému</li>
                      <li>Ochrana osobních údajů dle GDPR</li>
                    </ul>
                    
                    <p className="font-semibold mt-4">2. Závazky agenta:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Poskytování pravdivých a aktuálních informací</li>
                      <li>Dodržování etického kodexu realitního makléře</li>
                      <li>Uhrazení provize při úspěšném uzavření transakce</li>
                      <li>Neprodlené informování o změnách stavu nabídky/poptávky</li>
                    </ul>
                    
                    <p className="font-semibold mt-4">3. Provize a platební podmínky:</p>
                    <p>Provize ve výši <strong>{entity.commission_rate}%</strong> z celkové ceny transakce je splatná do 14 dnů od uzavření kupní/nájemní smlouvy. Provize je splatná i v případě, že k uzavření transakce dojde prostřednictvím kontaktu získaného přes platformu Estate Private.</p>
                    
                    <p className="font-semibold mt-4">4. Ochrana osobních údajů:</p>
                    <p>Obě strany se zavazují chránit osobní údaje v souladu s GDPR a neposkytovat je třetím stranám bez souhlasu.</p>
                    
                    <p className="font-semibold mt-4">5. Platnost smlouvy:</p>
                    <p>Tato smlouva je platná od okamžiku podpisu do uzavření transakce nebo do odvolání nabídky/poptávky.</p>
                    
                    <p className="font-semibold mt-4">6. Sankce:</p>
                    <p className="text-red-700 font-semibold">V případě porušení podmínek této smlouvy, zejména neuhrazení provize, se agent zavazuje uhradit smluvní pokutu ve výši dvojnásobku provize.</p>
                    
                    <p className="mt-4 text-gray-600 text-xs">
                      Datum: {new Date().toLocaleDateString('cs-CZ')}<br />
                      Místo: Praha
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 bg-white border-2 border-blue-300">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 mt-1"
                />
                <span className="text-sm">
                  <strong className="text-blue-900">Souhlasím se zprostředkovatelskou smlouvou</strong> a zavazuji se uhradit provizi {entity.commission_rate}% společnosti Estate Private při úspěšném uzavření transakce. Jsem si vědom(a) smluvní pokuty při porušení podmínek.
                </span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button onClick={onClose} className="flex-1 glass-button-secondary rounded-full">
                Zrušit
              </button>
              <button 
                onClick={handleGenerateCode} 
                disabled={!agreed || loading}
                className="flex-1 glass-button rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generuji kód...' : 'Souhlasím a pokračovat'}
              </button>
            </div>
          </div>
        )}

        {/* Krok 2: Kód vygenerován */}
        {step === 2 && generatedCode && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-green-50 border border-green-200 text-center">
              <div className="icon-circle bg-green-100 text-green-600 mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">Ověřovací kód byl odeslán!</h3>
              <p className="text-green-700 mb-4">
                Kód byl odeslán na váš email: <strong>{currentUser.email}</strong>
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-green-300 inline-block">
                <p className="text-sm text-gray-600 mb-1">Váš ověřovací kód:</p>
                <p className="text-3xl font-bold text-primary-600 tracking-wider">{generatedCode}</p>
              </div>
            </div>

            <div className="glass-card p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zadejte 6-místný ověřovací kód
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                className="glass-input text-center text-2xl tracking-widest font-bold"
                placeholder="XXXXXX"
              />
              <p className="text-xs text-gray-500 mt-2">
                {enteredCode.length}/6 znaků
              </p>
              {error && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button onClick={onClose} className="flex-1 glass-button-secondary rounded-full">
                Zrušit
              </button>
              <button 
                onClick={handleVerifyCode}
                disabled={enteredCode.length !== 6 || loading}
                className="flex-1 glass-button rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Ověřuji...' : 'Podepsat smlouvu'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
