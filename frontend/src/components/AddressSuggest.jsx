import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

export default function AddressSuggest({ value, onChange, placeholder = "Zadejte adresu", className = "" }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const wrapperRef = useRef(null)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    // Zavřít suggestions při kliknutí mimo
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    try {
      // Seznam.cz Suggest API
      const response = await fetch(
        `https://api.mapy.cz/v1/suggest?lang=cs&limit=10&locality=cz&type=regional.address&query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json',
            'X-Mapy-Api-Key': 'MTIdGpXVtxteHwipIwRw1MyH8f4IWYNgTyppp75Vp54'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        
        // Parsovat regionalStructure pro každý návrh
        const enrichedSuggestions = (data.items || []).map(item => {
          // Najít město, okres, kraj z regionalStructure
          const municipality = item.regionalStructure?.find(r => r.type === 'regional.municipality')?.name
          const district = item.regionalStructure?.find(r => r.type === 'regional.region' && r.name.startsWith('okres'))?.name
          const region = item.regionalStructure?.find(r => r.type === 'regional.region' && r.name.startsWith('kraj'))?.name
          
          return {
            ...item,
            enrichedData: {
              city: municipality,
              district: district?.replace('okres ', ''),
              region: region?.replace('kraj ', ''),
              zip: item.zip
            }
          }
        })
        
        setSuggestions(enrichedSuggestions)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Chyba při načítání návrhů:', error)
      setSuggestions([])
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    
    // Debounce - čekat 300ms před voláním API
    if (window.suggestTimeout) clearTimeout(window.suggestTimeout)
    window.suggestTimeout = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  const handleSelectSuggestion = async (suggestion) => {
    const fullAddress = suggestion.name + (suggestion.label ? `, ${suggestion.label}` : '')
    setInputValue(suggestion.name) // Jen ulice do inputu
    
    console.log('Selected suggestion:', suggestion) // Debug
    
    // Získat detailní informace o adrese
    let details = {
      latitude: suggestion.position?.lat || suggestion.location?.lat,
      longitude: suggestion.position?.lon || suggestion.location?.lon,
      street: suggestion.name,
      city: suggestion.enrichedData?.city || null,
      district: suggestion.enrichedData?.district || null,
      region: suggestion.enrichedData?.region || null,
      zip: suggestion.enrichedData?.zip || null
    }
    
    // Pokusit se získat více detailů z geocode API
    if (suggestion.location?.lat && suggestion.location?.lon) {
      try {
        const geocodeResponse = await fetch(
          `https://api.mapy.cz/v1/rgeocode?lang=cs&lat=${suggestion.location.lat}&lon=${suggestion.location.lon}`,
          {
            headers: {
              'Accept': 'application/json',
              'X-Mapy-Api-Key': 'MTIdGpXVtxteHwipIwRw1MyH8f4IWYNgTyppp75Vp54'
            }
          }
        )
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          const item = geocodeData.items?.[0]
          
          console.log('Geocode data:', item) // Debug
          
          if (item) {
            // Město - použít municipality nebo city, NE name (to je název místa)
            details.city = item.municipality || item.city || null
            
            // Okres a kraj z regionalStructure
            if (item.regionalStructure) {
              const rs = item.regionalStructure
              details.district = rs.district || null
              details.region = rs.region || null
            }
            
            // PSČ
            details.zip = item.zip || null
            
            console.log('Parsed details:', details) // Debug
          }
        }
      } catch (error) {
        console.error('Chyba při získávání detailů adresy:', error)
      }
    }
    
    // Fallback - parsovat z label (např. "Praha 1, Hlavní město Praha")
    if (suggestion.label) {
      const parts = suggestion.label.split(',').map(p => p.trim())
      if (!details.city && parts[0]) {
        details.city = parts[0]
      }
      if (!details.region && parts[1]) {
        details.region = parts[1]
      }
    }
    
    // Fallback na userData
    if (!details.city && suggestion.userData?.suggestFirstRow) {
      details.city = suggestion.userData.suggestFirstRow
    }
    if (!details.district && suggestion.userData?.suggestSecondRow) {
      details.district = suggestion.userData.suggestSecondRow
    }
    
    onChange(fullAddress, details)
    setShowSuggestions(false)
    setSuggestions([])
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
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 glass-card max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 transition border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">
                    {suggestion.name}
                  </div>
                  {suggestion.enrichedData && (
                    <>
                      <div className="text-sm text-gray-700">
                        {suggestion.enrichedData.city}
                        {suggestion.enrichedData.zip && `, ${suggestion.enrichedData.zip}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestion.enrichedData.district && `${suggestion.enrichedData.district}, `}
                        {suggestion.enrichedData.region}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
