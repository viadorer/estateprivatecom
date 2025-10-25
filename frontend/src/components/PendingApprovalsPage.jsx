import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Building2, Search } from 'lucide-react'

export default function PendingApprovalsPage({ currentUser }) {
  const [pendingProperties, setPendingProperties] = useState([])
  const [pendingDemands, setPendingDemands] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('properties')
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [selectedEntityType, setSelectedEntityType] = useState(null)
  const [commissionData, setCommissionData] = useState({
    commission_rate: 3,
    commission_terms: 'Provize Estate Private při úspěšném uzavření transakce.'
  })

  useEffect(() => {
    fetchPendingApprovals()
    
    // Refresh každých 30 sekund
    const interval = setInterval(fetchPendingApprovals, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch('/api/pending-approvals')
      const data = await response.json()
      setPendingProperties(data.properties || [])
      setPendingDemands(data.demands || [])
    } catch (error) {
      console.error('Chyba při načítání čekajících schválení:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, type, status, commission = null) => {
    // Pokud schvalujeme (ne zamítáme) a nemáme provizi, otevřeme modál
    if (status === 'active' && !commission) {
      setSelectedEntity({ id, type })
      setSelectedEntityType(type)
      setShowCommissionModal(true)
      return
    }
    
    const endpoint = type === 'property' 
      ? `/api/properties/${id}/approve`
      : `/api/demands/${id}/approve`
    
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_id: currentUser.id,
          ...(commission && {
            commission_rate: commission.commission_rate,
            commission_terms: commission.commission_terms
          })
        })
      })

      if (response.ok) {
        const statusText = status === 'active' || status === 'approved_pending_contract' ? 'schváleno' : 'zamítnuto'
        alert(`${type === 'property' ? 'Nemovitost' : 'Poptávka'} byla ${statusText}. ${status === 'active' || status === 'approved_pending_contract' ? 'Agent obdrží email s výzvou k podpisu smlouvy.' : 'Email byl odeslán.'}`)
        fetchPendingApprovals()
        setShowCommissionModal(false)
      } else {
        const error = await response.json()
        alert(`Chyba: ${error.error}`)
      }
    } catch (error) {
      console.error('Chyba při schvalování:', error)
      alert('Chyba při schvalování')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(price)
  }

  const totalPending = pendingProperties.length + pendingDemands.length

  if (loading) {
    return (
      <div className="fade-in flex items-center justify-center h-96">
        <div className="glass-card text-center p-12">
          <Clock className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Načítám čekající schválení...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="glass-card mb-6 p-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Čekající schválení</h3>
          <p className="text-sm text-gray-600 mt-1">
            Celkem <strong>{totalPending}</strong> položek čeká na vaše schválení
          </p>
        </div>
      </div>

      {totalPending === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="icon-circle bg-green-100 text-green-600 mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vše schváleno!
          </h2>
          <p className="text-gray-600">
            Momentálně nejsou žádné položky čekající na schválení.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs - styl navigace */}
          <div className="glass-card p-6 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('properties')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                  activeTab === 'properties'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'hover:bg-white/30'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Nemovitosti ({pendingProperties.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('demands')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                  activeTab === 'demands'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'hover:bg-white/30'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Poptávky ({pendingDemands.length})</span>
              </button>
            </div>
          </div>

          {/* Properties */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              {pendingProperties.map(property => (
                <div key={property.id} className="glass-card p-6">
                  <div className="flex gap-6 items-start">
                    {/* Image */}
                    <div className="w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                      {property.main_image ? (
                        <img src={property.main_image} alt={property.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {property.title}
                        </h3>
                        <span className="badge bg-amber-100 text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                          Čeká
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Cena:</span>
                          <p className="font-semibold text-gray-900">{formatPrice(property.price)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Typ:</span>
                          <p className="font-semibold text-gray-900">
                            {property.transaction_type === 'sale' ? 'Prodej' : 'Pronájem'} - {property.property_type}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Agent:</span>
                          <p className="font-semibold text-gray-900">{property.agent_name || 'Neznámý'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Vytvořeno:</span>
                          <p className="font-semibold text-gray-900">{formatDate(property.created_at)}</p>
                        </div>
                      </div>

                      {property.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {property.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(property.id, 'property', 'active')}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Schválit
                        </button>
                        <button
                          onClick={() => handleApprove(property.id, 'property', 'rejected')}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition"
                        >
                          <XCircle className="w-5 h-5" />
                          Zamítnout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Demands */}
          {activeTab === 'demands' && (
            <div className="space-y-4">
              {pendingDemands.map(demand => (
                <div key={demand.id} className="glass-card p-6">
                  <div className="flex gap-6 items-start">
                    {/* Icon */}
                    <div className="w-28 h-28 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0 flex items-center justify-center">
                      <Search className="w-12 h-12 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {demand.transaction_type === 'sale' ? 'Prodej' : 'Pronájem'} - {demand.property_type}
                        </h3>
                        <span className="badge bg-amber-100 text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                          Čeká
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Cenové rozpětí:</span>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(demand.price_min)} - {formatPrice(demand.price_max)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Klient:</span>
                          <p className="font-semibold text-gray-900">{demand.client_name || 'Neznámý'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Pokoje:</span>
                          <p className="font-semibold text-gray-900">
                            {demand.rooms_min} - {demand.rooms_max}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Vytvořeno:</span>
                          <p className="font-semibold text-gray-900">{formatDate(demand.created_at)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(demand.id, 'demand', 'active')}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Schválit
                        </button>
                        <button
                          onClick={() => handleApprove(demand.id, 'demand', 'rejected')}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition"
                        >
                          <XCircle className="w-5 h-5" />
                          Zamítnout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modál pro nastavení provize */}
      {showCommissionModal && selectedEntity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gradient mb-6">
              Nastavení podmínek spolupráce
            </h2>
            
            <div className="space-y-6">
              <div className="glass-card p-4 bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Důležité:</strong> Po schválení bude agentovi zaslán email s výzvou k podpisu zprostředkovatelské smlouvy. 
                  Nabídka/poptávka bude aktivována až po podpisu smlouvy.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provize Estate Private (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={commissionData.commission_rate}
                  onChange={(e) => setCommissionData({ ...commissionData, commission_rate: parseFloat(e.target.value) })}
                  className="glass-input"
                  placeholder="3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Doporučená provize: 2-5%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Podmínky spolupráce
                </label>
                <textarea
                  rows="4"
                  value={commissionData.commission_terms}
                  onChange={(e) => setCommissionData({ ...commissionData, commission_terms: e.target.value })}
                  className="glass-input"
                  placeholder="Podmínky provize a spolupráce..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tyto podmínky se zobrazí agentovi ve zprostředkovatelské smlouvě
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCommissionModal(false)
                    setSelectedEntity(null)
                  }}
                  className="flex-1 glass-button-secondary rounded-full"
                >
                  Zrušit
                </button>
                <button
                  onClick={() => handleApprove(selectedEntity.id, selectedEntity.type, 'active', commissionData)}
                  className="flex-1 glass-button rounded-full"
                >
                  Schválit s těmito podmínkami
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
