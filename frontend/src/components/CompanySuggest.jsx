import { useState, useEffect, useRef } from 'react'
import { Building2, Search } from 'lucide-react'

export default function CompanySuggest({ value, onChange, onCompanySelect, placeholder = "IČO nebo název firmy", className = "" }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchCompanies = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      // Použijeme ARES základní endpoint - spolehlivější
      const isIco = query.match(/^\d{8}$/) // IČO musí mít přesně 8 číslic
      
      if (isIco) {
        // Pro IČO použijeme základní endpoint
        const response = await fetch(
          `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${query}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          setSuggestions([data])
          setShowSuggestions(true)
        } else {
          setSuggestions([])
        }
      } else {
        // Pro název firmy - zatím jen info, že je potřeba IČO
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Chyba při načítání firem:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    
    // Debounce
    if (window.companyTimeout) clearTimeout(window.companyTimeout)
    window.companyTimeout = setTimeout(() => {
      fetchCompanies(newValue)
    }, 500)
  }

  const handleSelectCompany = (company) => {
    const ico = company.ico
    const name = company.obchodniJmeno
    const sidlo = company.sidlo || {}
    
    // Parsovat adresu na jednotlivé části
    const street = sidlo.nazevUlice && sidlo.cisloDomovni 
      ? `${sidlo.nazevUlice} ${sidlo.cisloDomovni}${sidlo.cisloOrientacni ? '/' + sidlo.cisloOrientacni : ''}`
      : sidlo.nazevUlice || ''
    const city = sidlo.nazevObce || ''
    const zip = sidlo.psc || ''
    
    setInputValue(ico)
    onChange(ico)
    
    if (onCompanySelect) {
      onCompanySelect({
        ico,
        name,
        street,
        city,
        zip,
        dic: company.dic,
        full: company
      })
    }
    
    setShowSuggestions(false)
    setSuggestions([])
  }

  const formatAddress = (sidlo) => {
    const parts = []
    if (sidlo.nazevUlice) parts.push(sidlo.nazevUlice)
    if (sidlo.cisloDomovni) parts.push(sidlo.cisloDomovni)
    if (sidlo.nazevObce) parts.push(sidlo.nazevObce)
    if (sidlo.psc) parts.push(sidlo.psc)
    return parts.join(', ')
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
          autoComplete="off"
        />
        {loading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 glass-card max-h-80 overflow-y-auto">
          {suggestions.map((company, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectCompany(company)}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 transition border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 mb-1">
                    {company.obchodniJmeno}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>IČO: <span className="font-medium">{company.ico}</span></div>
                    {company.sidlo && (
                      <div className="truncate">{formatAddress(company.sidlo)}</div>
                    )}
                    {company.dic && (
                      <div>DIČ: <span className="font-medium">{company.dic}</span></div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && !loading && suggestions.length === 0 && inputValue.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 glass-card p-4 text-center text-gray-600">
          Žádné výsledky nenalezeny
        </div>
      )}
    </div>
  )
}
