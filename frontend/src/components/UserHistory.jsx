import { useState, useEffect } from 'react'
import { Clock, FileText, Building2, Search, CheckCircle, AlertCircle, Activity } from 'lucide-react'

const API_URL = '/api'

export default function UserHistory({ userId, userName, userRole }) {
  const [contracts, setContracts] = useState([])
  const [lois, setLois] = useState([])
  const [properties, setProperties] = useState([])
  const [demands, setDemands] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // all, contracts, properties, demands, logs

  useEffect(() => {
    fetchUserHistory()
  }, [userId])

  const fetchUserHistory = async () => {
    try {
      setLoading(true)
      
      // Načíst zprostředkovatelské smlouvy
      const contractsRes = await fetch(`${API_URL}/brokerage-contracts/user/${userId}`)
      if (contractsRes.ok) {
        const contractsData = await contractsRes.json()
        setContracts(contractsData)
      }
      
      // Načíst LOI
      const loisRes = await fetch(`${API_URL}/loi-signatures/user/${userId}`)
      if (loisRes.ok) {
        const loisData = await loisRes.json()
        setLois(loisData)
      }
      
      // Načíst nabídky uživatele
      const propertiesRes = await fetch(`${API_URL}/properties?agent_id=${userId}`)
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json()
        setProperties(propertiesData)
      }
      
      // Načíst poptávky uživatele
      const demandsRes = await fetch(`${API_URL}/demands?client_id=${userId}`)
      if (demandsRes.ok) {
        const demandsData = await demandsRes.json()
        setDemands(demandsData)
      }
      
      // Načíst audit logy
      const auditRes = await fetch(`${API_URL}/audit-logs/user/${userId}`)
      if (auditRes.ok) {
        const auditData = await auditRes.json()
        setAuditLogs(auditData)
      }
    } catch (error) {
      console.error('Chyba při načítání historie:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved_pending_contract: 'bg-orange-100 text-orange-700',
      rejected: 'bg-red-100 text-red-700',
      inactive: 'bg-gray-100 text-gray-700'
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Aktivní',
      pending: 'Čeká na schválení',
      approved_pending_contract: 'Čeká na podpis smlouvy',
      rejected: 'Zamítnuto',
      inactive: 'Neaktivní'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historie uživatele</h3>
        <div className="text-center py-4 text-gray-500">Načítání...</div>
      </div>
    )
  }

  const allItems = [
    ...contracts.map(c => ({ ...c, type: 'contract', timestamp: c.signed_at })),
    ...lois.map(l => ({ ...l, type: 'loi', timestamp: l.signed_at })),
    ...properties.map(p => ({ ...p, type: 'property', timestamp: p.created_at })),
    ...demands.map(d => ({ ...d, type: 'demand', timestamp: d.created_at })),
    ...auditLogs.map(a => ({ ...a, type: 'log', timestamp: a.created_at }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const filteredItems = activeTab === 'all' ? allItems :
                        activeTab === 'contracts' ? [...contracts, ...lois].map(c => ({ ...c, type: c.commission_rate ? 'contract' : 'loi', timestamp: c.signed_at })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) :
                        activeTab === 'properties' ? properties.map(p => ({ ...p, type: 'property', timestamp: p.created_at })) :
                        activeTab === 'demands' ? demands.map(d => ({ ...d, type: 'demand', timestamp: d.created_at })) :
                        auditLogs.map(a => ({ ...a, type: 'log', timestamp: a.created_at }))

  const counts = {
    all: allItems.length,
    contracts: contracts.length + lois.length,
    properties: properties.length,
    demands: demands.length,
    logs: auditLogs.length
  }

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            Historie uživatele
          </h3>
          <p className="text-sm text-gray-500 mt-1 md:mt-0">
            {userName}{userRole ? ` • ${userRole}` : ''}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-white/80 px-4 py-1 text-sm font-medium text-gray-600 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
          {counts.all} záznamů
        </span>
      </div>

      {/* Filtry */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { id: 'all', label: 'Vše' },
          { id: 'contracts', label: 'Smlouvy' },
          { id: 'properties', label: 'Nabídky' },
          { id: 'demands', label: 'Poptávky' },
          { id: 'logs', label: 'Logy' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-white/70 border border-white/80 text-gray-600 hover:text-primary-600'
            }`}
          >
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Žádná historie</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div key={`${item.type}-${item.id}-${index}`} className="glass-card p-4 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                {/* Ikona podle typu */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  item.type === 'contract' ? 'bg-purple-100 text-purple-600' :
                  item.type === 'loi' ? 'bg-blue-100 text-blue-600' :
                  item.type === 'property' ? 'bg-green-100 text-green-600' :
                  item.type === 'demand' ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.type === 'contract' || item.type === 'loi' ? <FileText className="w-5 h-5" /> :
                   item.type === 'property' ? <Building2 className="w-5 h-5" /> :
                   item.type === 'demand' ? <Search className="w-5 h-5" /> :
                   <Activity className="w-5 h-5" />}
                </div>

                {/* Obsah */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {item.type === 'contract' ? 'Zprostředkovatelská smlouva' :
                       item.type === 'loi' ? 'LOI (Letter of Intent)' :
                       item.type === 'property' ? item.title :
                       item.type === 'demand' ? `${item.transaction_type} - ${item.property_type}` :
                       item.action}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  {/* Detaily podle typu */}
                  {item.type === 'contract' && (
                    <div className="text-sm text-gray-600">
                      <span className="badge bg-purple-100 text-purple-700 text-xs mr-2">
                        Provize: {item.commission_rate}%
                      </span>
                      {item.entity_title}
                    </div>
                  )}

                  {item.type === 'loi' && (
                    <div className="text-sm text-gray-600">
                      {item.property_title} ↔ {item.demand_title}
                    </div>
                  )}

                  {(item.type === 'property' || item.type === 'demand') && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge text-xs ${getStatusBadge(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                      {item.commission_rate && (
                        <span className="text-xs text-gray-600">
                          Provize: {item.commission_rate}%
                        </span>
                      )}
                    </div>
                  )}

                  {item.type === 'log' && (
                    <div className="text-sm text-gray-600">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
