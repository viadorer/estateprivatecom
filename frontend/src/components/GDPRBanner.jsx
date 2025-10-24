import { useState, useEffect } from 'react'
import { X, Shield, Cookie, Settings } from 'lucide-react'

const API_URL = '/api'

export default function GDPRBanner({ onAccept }) {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consents, setConsents] = useState({
    necessary: true, // Vždy povoleno
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    // Zkontrolovat, zda už uživatel dal souhlas
    const hasConsent = localStorage.getItem('gdpr_consent')
    if (!hasConsent) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = async () => {
    console.log('Kliknuto na "Přijmout vše"')
    const consentData = {
      email: null,
      consent_terms: true,
      consent_privacy: true,
      consent_marketing: true,
      consent_profiling: false,
      consent_third_party: false,
      consent_cookies_analytics: true,
      consent_cookies_marketing: true,
      consent_method: 'web_banner'
    }

    // Uložit do localStorage vždy
    localStorage.setItem('gdpr_consent', JSON.stringify({
      ...consentData,
      date: new Date().toISOString()
    }))
    console.log('Souhlas uložen do localStorage')

    // Zavřít banner okamžitě
    setShowBanner(false)
    if (onAccept) onAccept(consentData)

    // Pokusit se uložit na server (neblokující)
    try {
      const response = await fetch(`${API_URL}/gdpr/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData)
      })
      
      if (response.ok) {
        console.log('Souhlas uložen na server')
      } else {
        console.warn('Nepodařilo se uložit souhlas na server:', response.status)
      }
    } catch (error) {
      console.warn('Chyba při ukládání souhlasu na server:', error)
    }
  }

  const handleAcceptNecessary = async () => {
    console.log('Kliknuto na "Pouze nezbytné"')
    const consentData = {
      email: null,
      consent_terms: true,
      consent_privacy: true,
      consent_marketing: false,
      consent_profiling: false,
      consent_third_party: false,
      consent_cookies_analytics: false,
      consent_cookies_marketing: false,
      consent_method: 'web_banner'
    }

    // Uložit do localStorage vždy
    localStorage.setItem('gdpr_consent', JSON.stringify({
      ...consentData,
      date: new Date().toISOString()
    }))
    console.log('Souhlas uložen do localStorage')

    // Zavřít banner okamžitě
    setShowBanner(false)
    if (onAccept) onAccept(consentData)

    // Pokusit se uložit na server (neblokující)
    try {
      const response = await fetch(`${API_URL}/gdpr/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData)
      })
      
      if (response.ok) {
        console.log('Souhlas uložen na server')
      } else {
        console.warn('Nepodařilo se uložit souhlas na server:', response.status)
      }
    } catch (error) {
      console.warn('Chyba při ukládání souhlasu na server:', error)
    }
  }

  const handleSaveSettings = async () => {
    console.log('Ukládám nastavení cookies:', consents)
    
    const consentData = {
      email: null,
      consent_terms: true,
      consent_privacy: true,
      consent_marketing: consents.marketing,
      consent_profiling: false,
      consent_third_party: false,
      consent_cookies_analytics: consents.analytics,
      consent_cookies_marketing: consents.marketing,
      consent_method: 'web_banner_custom'
    }

    // Uložit do localStorage vždy
    localStorage.setItem('gdpr_consent', JSON.stringify({
      ...consentData,
      date: new Date().toISOString()
    }))
    console.log('Nastavení uloženo do localStorage')

    // Zavřít modální okno okamžitě
    setShowBanner(false)
    setShowSettings(false)
    if (onAccept) onAccept(consentData)

    // Pokusit se uložit na server (neblokující)
    try {
      const response = await fetch(`${API_URL}/gdpr/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Nastavení uloženo na server:', result)
      } else {
        console.warn('Nepodařilo se uložit nastavení na server:', response.status)
      }
    } catch (error) {
      console.warn('Chyba při ukládání nastavení na server:', error)
    }
  }

  if (!showBanner) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4">
        <div className="max-w-6xl mx-auto glass-card p-6 shadow-2xl">
          {!showSettings ? (
            <>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Cookie className="w-12 h-12 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Používáme cookies
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Tato webová stránka používá cookies pro zajištění správné funkčnosti, 
                    analýzu návštěvnosti a zlepšení uživatelského zážitku. Používáním této 
                    stránky souhlasíte se zpracováním vašich osobních údajů v souladu s{' '}
                    <a href="/privacy-policy" className="text-purple-600 hover:underline font-semibold">
                      Zásadami ochrany osobních údajů
                    </a>{' '}
                    a{' '}
                    <a href="/terms" className="text-purple-600 hover:underline font-semibold">
                      Obchodními podmínkami
                    </a>.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Správce osobních údajů:</strong> PrivateEstate s.r.o., IČO: 12345678
                    <br />
                    <strong>Kontakt:</strong> gdpr@privateestate.cz
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="glass-button rounded-full px-6 py-2"
                    >
                      Přijmout vše
                    </button>
                    <button
                      onClick={handleAcceptNecessary}
                      className="glass-button-secondary rounded-full px-6 py-2"
                    >
                      Pouze nezbytné
                    </button>
                    <button
                      onClick={() => {
                        console.log('Otevírám nastavení cookies')
                        setShowSettings(true)
                      }}
                      className="glass-button-secondary rounded-full px-6 py-2 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Nastavení
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Nastavení cookies a souhlasů
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Nezbytné cookies */}
                <div className="glass-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Nezbytné cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        Tyto cookies jsou nezbytné pro správnou funkci webu a nelze je vypnout. 
                        Zahrnují cookies pro přihlášení, zabezpečení a základní funkce.
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-5 h-5 cursor-not-allowed opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Analytické cookies */}
                <div className="glass-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Analytické cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        Pomáhají nám pochopit, jak návštěvníci používají web. Všechny informace 
                        jsou anonymní a používáme je pouze pro zlepšení webu.
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={consents.analytics}
                        onChange={(e) => setConsents({ ...consents, analytics: e.target.checked })}
                        className="w-5 h-5 cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Marketingové cookies */}
                <div className="glass-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Marketingové cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        Používají se pro zobrazení relevantních reklam a měření efektivity 
                        marketingových kampaní. Mohou sledovat vaši aktivitu napříč weby.
                      </p>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={consents.marketing}
                        onChange={(e) => setConsents({ ...consents, marketing: e.target.checked })}
                        className="w-5 h-5 cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveSettings}
                  className="glass-button rounded-full px-6 py-2"
                >
                  Uložit nastavení
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="glass-button-secondary rounded-full px-6 py-2"
                >
                  Zpět
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
