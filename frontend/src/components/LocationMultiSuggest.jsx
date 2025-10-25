import { useState, useEffect, useRef } from 'react'
import { MapPin, X, Plus } from 'lucide-react'

export default function LocationMultiSuggest({ locations = [], onChange, placeholder = "Zadejte lokalitu (město, vesnice, čtvrť, okres)" }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(
        `https://api.mapy.cz/v1/suggest?lang=cs&limit=10&locality=cz&type=regional&query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json',
            'X-Mapy-Api-Key': 'MTIdGpXVtxteHwipIwRw1MyH8f4IWYNgTyppp75Vp54'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        
        const enrichedSuggestions = (data.items || []).map(item => {
          const municipality = item.regionalStructure?.find(r => r.type === 'regional.municipality')?.name
          const district = item.regionalStructure?.find(r => r.type === 'regional.region' && r.name.startsWith('okres'))?.name
          const region = item.regionalStructure?.find(r => r.type === 'regional.region' && r.name.startsWith('kraj'))?.name
          const quarter = item.regionalStructure?.find(r => r.type === 'regional.quarter')?.name
          
          return {
            ...item,
            enrichedData: {
              name: item.name,
              type: item.type,
              city: municipality,
              quarter: quarter,
              district: district?.replace('okres ', ''),
              region: region?.replace('kraj ', ''),
              zip: item.zip,
              latitude: item.location?.lat || item.position?.lat,
              longitude: item.location?.lon || item.position?.lon
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
    
    if (window.locationSuggestTimeout) clearTimeout(window.locationSuggestTimeout)
    window.locationSuggestTimeout = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  const handleSelectSuggestion = (suggestion) => {
    const locationData = {
      name: suggestion.name,
      type: suggestion.type,
      city: suggestion.enrichedData?.city,
      quarter: suggestion.enrichedData?.quarter,
      district: suggestion.enrichedData?.district,
      region: suggestion.enrichedData?.region,
      latitude: suggestion.enrichedData?.latitude,
      longitude: suggestion.enrichedData?.longitude
    }
    
    // Kontrola, zda už lokalita není přidána
    const isDuplicate = locations.some(loc => 
      loc.name === locationData.name && 
      loc.latitude === locationData.latitude &&
      loc.longitude === locationData.longitude
    )
    
    if (!isDuplicate) {
      onChange([...locations, locationData])
    }
    
    setInputValue('')
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleRemoveLocation = (index) => {
    onChange(locations.filter((_, i) => i !== index))
  }

  const getLocationLabel = (location) => {
    const parts = []
    if (location.name) parts.push(location.name)
    if (location.quarter && location.quarter !== location.name) parts.push(location.quarter)
    if (location.city && location.city !== location.name) parts.push(location.city)
    if (location.district) parts.push(location.district)
    return parts.join(', ')
  }

  const getLocationTypeLabel = (type) => {
    const typeMap = {
      'regional.municipality': 'Město/Obec',
      'regional.quarter': 'Čtvrť',
      'regional.region': 'Okres/Kraj',
      'regional.municipality_part': 'Část obce'
    }
    return typeMap[type] || 'Lokalita'
  }

  return (
    <div className="space-y-3">
      {/* Přidané lokality */}
      {locations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {locations.map((location, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm border border-primary-200"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium">{getLocationLabel(location)}</span>
              <button
                type="button"
                onClick={() => handleRemoveLocation(index)}
                className="hover:text-primary-900 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input pro přidání nové lokality */}
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="glass-input pr-10"
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{suggestion.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {getLocationTypeLabel(suggestion.type)}
                      </span>
                    </div>
                    {suggestion.enrichedData && (
                      <>
                        <div className="text-sm text-gray-700 mt-0.5">
                          {suggestion.enrichedData.quarter && suggestion.enrichedData.quarter !== suggestion.name && (
                            <span>{suggestion.enrichedData.quarter}, </span>
                          )}
                          {suggestion.enrichedData.city && suggestion.enrichedData.city !== suggestion.name && (
                            <span>{suggestion.enrichedData.city}</span>
                          )}
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

      <p className="text-xs text-gray-500">
        Můžete přidat města, vesnice, čtvrti, okresy nebo kraje. GPS souřadnice se ukládají automaticky.
      </p>
    </div>
  )
}
