import { useState, useEffect } from 'react'
import { Building, Edit, Pause, Play } from 'lucide-react'

const API_URL = '/api'

export default function PropertyCard({ property, currentUser, formatPrice, LABELS_CS, onViewDetail, onEdit, onToggleStatus, onGenerateCode }) {
  const [hasAccess, setHasAccess] = useState(null) // null = loading, true/false = result

  useEffect(() => {
    // Admin a agent mají vždy přístup
    if (currentUser.role === 'admin' || currentUser.role === 'agent') {
      setHasAccess(true)
      return
    }

    // Pro ostatní kontrolovat přístup
    checkAccess()
  }, [property.id, currentUser.id])

  const checkAccess = async () => {
    try {
      const response = await fetch(`${API_URL}/properties/${property.id}/check-access/${currentUser.id}`)
      const data = await response.json()
      setHasAccess(data.hasAccess)
    } catch (error) {
      console.error('Chyba při kontrole přístupu:', error)
      setHasAccess(false)
    }
  }

  return (
    <div className="glass-card hover:scale-105 transition-transform">
      <div className="relative mb-4 rounded-lg overflow-hidden">
        <img 
          src={property.main_image} 
          alt="Nemovitost"
          className="w-full h-48 object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <span className="text-white font-bold text-lg">Náhled</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {LABELS_CS[property.property_type]} {property.property_subtype}
      </h3>
      
      <div className="flex items-center text-gray-600 text-sm mb-3">
        <Building className="w-4 h-4 mr-1" />
        {property.district}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>{property.area} m²</span>
        <span>{property.rooms} pokoje</span>
        <span>{property.floor}. patro</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gradient">
          {formatPrice(property.price)} Kč
        </div>
        <div className="flex space-x-2">
          {currentUser.role === 'admin' ? (
            <>
              <button 
                onClick={() => onViewDetail(property)} 
                className="glass-button-secondary rounded-full"
              >
                Detail
              </button>
              <button 
                onClick={() => onEdit(property)} 
                className="glass-button-secondary p-2 rounded-full"
                title="Upravit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onToggleStatus(property.id, property.status)} 
                className="glass-button-secondary p-2 rounded-full"
                title={property.status === 'active' ? 'Deaktivovat' : 'Aktivovat'}
              >
                {property.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </>
          ) : hasAccess === null ? (
            <button className="glass-button-secondary rounded-full" disabled>
              Načítání...
            </button>
          ) : hasAccess ? (
            <button 
              onClick={() => onViewDetail(property)} 
              className="glass-button rounded-full"
            >
              Detail
            </button>
          ) : (
            <button 
              onClick={() => onGenerateCode(property)} 
              className="glass-button rounded-full"
            >
              Požádat o přístup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
