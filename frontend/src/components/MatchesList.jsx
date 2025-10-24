import { useState, useEffect } from 'react'
import { Target, Building2, Search, TrendingUp } from 'lucide-react'

const API_URL = '/api'

export default function MatchesList({ entityType, entityId, currentUser }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [entityType, entityId])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      // Pro property získáme matching demands, pro demand získáme matching properties
      const endpoint = entityType === 'properties' 
        ? `${API_URL}/properties/${entityId}/matches`
        : `${API_URL}/demands/${entityId}/matches`
      
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
      }
    } catch (error) {
      console.error('Chyba při načítání shod:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ').format(price)
  }

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          {entityType === 'properties' ? 'Odpovídající poptávky' : 'Odpovídající nabídky'}
        </h3>
        <div className="text-center py-4 text-gray-500">Načítání...</div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          {entityType === 'properties' ? 'Odpovídající poptávky' : 'Odpovídající nabídky'}
        </h3>
        <span className="badge bg-primary-100 text-primary-700">
          {matches.length} {matches.length === 1 ? 'shoda' : matches.length < 5 ? 'shody' : 'shod'}
        </span>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Zatím žádné shody</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <div key={match.id} className="glass-card p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {entityType === 'properties' ? (
                    <Search className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Building2 className="w-5 h-5 text-purple-600" />
                  )}
                  <h4 className="font-semibold text-gray-900">
                    {entityType === 'properties' 
                      ? `${match.transaction_type === 'sale' ? 'Prodej' : 'Pronájem'} - ${match.property_type}`
                      : match.title
                    }
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-600">{match.match_score}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                {entityType === 'properties' ? (
                  <>
                    <div>Cena: {formatPrice(match.price_min)} - {formatPrice(match.price_max)} Kč</div>
                    <div>Pokoje: {match.rooms_min} - {match.rooms_max}</div>
                    <div>Plocha: {match.area_min} - {match.area_max} m²</div>
                    <div>Lokace: {match.cities?.join(', ') || 'Různé'}</div>
                  </>
                ) : (
                  <>
                    <div>Cena: {formatPrice(match.price)} Kč</div>
                    <div>Pokoje: {match.rooms}</div>
                    <div>Plocha: {match.area} m²</div>
                    <div>Lokace: {match.city}</div>
                  </>
                )}
              </div>

              {currentUser?.role === 'admin' && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                  Klient: {match.client_name || match.agent_name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
