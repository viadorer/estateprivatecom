import { useState, useEffect } from 'react'
import { FileText, Check, Mail, AlertCircle, Lock } from 'lucide-react'
import ComplianceNotice from './ComplianceNotice'

const API_URL = '/api'

export default function LOIModal({ isOpen, onClose, entity, entityType, currentUser, onLOISigned }) {
  const [step, setStep] = useState(0) // 0 = Úvodní vysvětlení, 1 = LOI text, 2 = Generování kódu, 3 = Zadání kódu
  const [agreed, setAgreed] = useState(false)
  const [agreedToCreate, setAgreedToCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [enteredCode, setEnteredCode] = useState('')
  const [error, setError] = useState('')
  const [contractTemplate, setContractTemplate] = useState(null)
  const [loadingTemplate, setLoadingTemplate] = useState(true)

  if (!isOpen || !entity) return null

  // Načíst šablonu LOI z databáze
  useEffect(() => {
    if (isOpen) {
      setLoadingTemplate(true)
      fetch(`${API_URL}/contract-templates/loi`)
        .then(res => res.json())
        .then(data => {
          setContractTemplate(data)
          setLoadingTemplate(false)
        })
        .catch(err => {
          console.error('Chyba při načítání šablony:', err)
          setLoadingTemplate(false)
        })
    }
  }, [isOpen])

  const entityName = entityType === 'property' 
    ? entity.title 
    : `${entity.transaction_type} - ${entity.property_type}`

  // Nahradit placeholdery v šabloně
  const renderContract = () => {
    if (!contractTemplate || !contractTemplate.template_content) return ''
    
    let text = contractTemplate.template_content
    
    // Nahradit placeholdery
    text = text.replace(/{{user_name}}/g, currentUser.name || '')
    text = text.replace(/{{user_email}}/g, currentUser.email || '')
    text = text.replace(/{{user_company}}/g, currentUser.company ? `Firma: ${currentUser.company}` : '')
    text = text.replace(/{{user_ico}}/g, currentUser.ico ? `IČO: ${currentUser.ico}` : '')
    text = text.replace(/{{entity_type}}/g, entityType === 'property' ? 'nabídce nemovitosti' : 'poptávce')
    text = text.replace(/{{entity_name}}/g, entityName)
    text = text.replace(/{{signature_date}}/g, new Date().toLocaleDateString('cs-CZ'))
    text = text.replace(/{{signature_time}}/g, new Date().toLocaleTimeString('cs-CZ'))
    
    return text
  }

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

      setStep(4)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gradient">
            {step === 0 ? 'Přístup k detailním informacím' : 'Letter of Intent (LOI)'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <ComplianceNotice className="mb-6" />

        {/* Krok 0: Úvodní vysvětlení */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-blue-100 text-blue-600">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Proč potřebujeme LOI?</h3>
                  
                  <div className="space-y-4 text-gray-800">
                    <p className="leading-relaxed">
                      Tato {entityType === 'property' ? 'nabídka' : 'poptávka'} obsahuje <strong>důvěrné informace</strong>, 
                      které nejsou veřejně dostupné. Jedná se o off-market příležitost s citlivými údaji o ceně, 
                      kontaktech a dalších detailech.
                    </p>

                    <div className="glass-card p-4 bg-white">
                      <h4 className="font-bold text-blue-900 mb-3">Co získáte podpisem LOI:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Přístup k detailům:</strong> Kompletní informace o {entityType === 'property' ? 'nemovitosti' : 'poptávce'}, fotografie, dokumenty</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Kontaktní údaje:</strong> Přímý kontakt na agenta nebo vlastníka</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Možnost jednání:</strong> Zahájení vyjednávání o transakci</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Prioritní přístup:</strong> Budete mezi prvními, kdo se dozví o aktualizacích</span>
                        </li>
                      </ul>
                    </div>

                    <div className="glass-card p-4 bg-amber-50 border border-amber-200">
                      <h4 className="font-bold text-amber-900 mb-3">Vaše závazky:</h4>
                      <ul className="space-y-2 text-sm text-amber-800">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span><strong>Mlčenlivost:</strong> Nesdílet získané informace s třetími stranami</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span><strong>Účelnost:</strong> Použít informace pouze pro posouzení této příležitosti</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span><strong>Ochrana dat:</strong> Respektovat GDPR a ochranu osobních údajů</span>
                        </li>
                      </ul>
                    </div>

                    <div className="glass-card p-4 bg-green-50 border border-green-200">
                      <h4 className="font-bold text-green-900 mb-2">Důležité informace:</h4>
                      <ul className="space-y-1 text-sm text-green-800">
                        <li>• LOI <strong>není závazná smlouva</strong> k uzavření transakce</li>
                        <li>• Můžete ji kdykoliv ukončit bez udání důvodu</li>
                        <li>• Platnost: 90 dnů od podpisu</li>
                        <li>• Podpis probíhá elektronicky pomocí kódu z emailu</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-5 bg-purple-50 border-2 border-purple-300">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={agreedToCreate}
                  onChange={(e) => setAgreedToCreate(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm text-gray-800">
                  <strong className="text-purple-900">Potvrzuji, že:</strong>
                  <ul className="mt-2 space-y-1 ml-4">
                    <li>• Rozumím účelu a podmínkám Letter of Intent</li>
                    <li>• Mám vážný zájem o tuto {entityType === 'property' ? 'nemovitost' : 'poptávku'}</li>
                    <li>• Souhlasím s vytvořením LOI a zobrazením právního dokumentu</li>
                    <li>• Zavazuji se chránit důvěrné informace</li>
                  </ul>
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="btn-secondary flex-1"
              >
                Zrušit
              </button>
              <button 
                onClick={() => {
                  if (!agreedToCreate) {
                    alert('Musíte potvrdit souhlas s vytvořením LOI')
                    return
                  }
                  setStep(1)
                }}
                disabled={!agreedToCreate}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Pokračovat k LOI
              </button>
            </div>
          </div>
        )}

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
                  
                  {loadingTemplate ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="mt-4 text-purple-700">Načítám smlouvu...</p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm text-gray-800 max-h-96 overflow-y-auto p-4 bg-white rounded-lg border border-gray-200">
                      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                        {renderContract()}
                      </pre>
                    </div>
                  )}

                  {!loadingTemplate && (
                    <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg mt-4">
                      <p className="font-semibold text-blue-900">Co je LOI?</p>
                      <p className="text-sm text-blue-700 mt-2">
                        Letter of Intent (Záměr spolupráce) je právní dokument vyjadřující váš vážný zájem 
                        o tuto {entityType === 'property' ? 'nemovitost' : 'poptávku'}. 
                        Podpisem LOI získáte přístup k detailním informacím a zavážete se k ochraně důvěrných údajů.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 p-5 bg-purple-50 rounded-lg border-2 border-purple-300">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-800">
                        <strong className="text-purple-900">Prohlašuji, že:</strong>
                        <ul className="mt-2 space-y-1 ml-4">
                          <li>• Přečetl(a) jsem si celý text Letter of Intent / Dohody o záměru</li>
                          <li>• Rozumím všem ustanovením a jejich právním důsledkům</li>
                          <li>• Zavazuji se dodržovat povinnost mlčenlivosti a ochrany důvěrných informací</li>
                          <li>• Souhlasím se zpracováním osobních údajů dle GDPR</li>
                          <li>• Beru na vědomí, že LOI je v části mlčenlivosti právně závazná</li>
                        </ul>
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

        {/* Krok 4: Úspěch */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-green-50 border border-green-200 text-center">
              <div className="icon-circle bg-green-100 text-green-600 mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">LOI úspěšně podepsána</h3>
              <p className="text-green-700">
                Potvrzení bylo odesláno na váš email. Detail {entityType === 'property' ? 'nabídky' : 'poptávky'} se nyní otevře s plným přístupem.
              </p>
            </div>

            <div className="flex justify-center">
              <button onClick={onClose} className="glass-button rounded-full px-6">
                Pokračovat na detail
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
