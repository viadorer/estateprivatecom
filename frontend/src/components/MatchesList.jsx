import { useState, useEffect } from 'react'
import { Target, Building2, Search, TrendingUp, Eye, Lock } from 'lucide-react'

const API_URL = '/api'

export default function MatchesList({ entityType, entityId, currentUser, onViewDetail, onRequestAccess }) {
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
                    {/* Zobrazení poptávky - nová struktura */}
                    {match.common_filters?.price ? (
                      <div>
                        Cena: {match.common_filters.price.min ? formatPrice(match.common_filters.price.min) : '0'} - {match.common_filters.price.max ? formatPrice(match.common_filters.price.max) : '∞'} Kč
                      </div>
                    ) : match.price_min ? (
                      <div>Cena: {formatPrice(match.price_min)} - {formatPrice(match.price_max)} Kč</div>
                    ) : null}
                    
                    {match.property_requirements && match.property_requirements.length > 0 ? (
                      <div className="col-span-2">
                        Typy: {match.property_requirements.map(req => {
                          const typeLabel = req.property_type === 'flat' ? 'Byt' : 
                                          req.property_type === 'house' ? 'Dům' : 
                                          req.property_type === 'commercial' ? 'Komerční' : 
                                          req.property_type === 'land' ? 'Pozemek' : 'Projekt';
                          const subtypes = req.property_subtypes || (req.property_subtype ? [req.property_subtype] : []);
                          return subtypes.length > 0 ? `${typeLabel} (${subtypes.join(', ')})` : typeLabel;
                        }).join(' | ')}
                      </div>
                    ) : null}
                    
                    {match.locations && Array.isArray(match.locations) && match.locations.length > 0 ? (
                      <div className="col-span-2">
                        Lokality: {match.locations.map(l => l.name).join(', ')}
                      </div>
                    ) : match.cities ? (
                      <div className="col-span-2">Lokace: {match.cities.join(', ')}</div>
                    ) : null}
                    
                    {match.matched_requirement && (
                      <div className="col-span-2 text-xs text-purple-600">
                        Matchuje s: {match.matched_requirement.property_type}
                        {(() => {
                          const subtypes = match.matched_requirement.property_subtypes || 
                                         (match.matched_requirement.property_subtype ? [match.matched_requirement.property_subtype] : []);
                          return subtypes.length > 0 ? ` (${subtypes.join(', ')})` : '';
                        })()}
                      </div>
                    )}
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

              {/* Tlačítka pro akce */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                {currentUser?.role === 'admin' && (
                  <div className="text-xs text-gray-500">
                    {entityType === 'properties' ? 'Klient' : 'Agent'}: {match.client_name || match.agent_name}
                  </div>
                )}
                
                <div className="flex gap-2 ml-auto">
                  {currentUser?.role === 'admin' ? (
                    <button
                      onClick={() => onViewDetail && onViewDetail(match)}
                      className="glass-button-secondary px-3 py-1.5 text-sm rounded-full flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>
                  ) : (
                    <button
                      onClick={() => onRequestAccess && onRequestAccess(match)}
                      className="glass-button-secondary px-3 py-1.5 text-sm rounded-full flex items-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Požádat o detail
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
