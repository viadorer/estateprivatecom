import { useState, useEffect } from 'react'
import { FileText, Eye, Download, CheckCircle } from 'lucide-react'
import ComplianceNotice from './ComplianceNotice'

const API_URL = '/api'

export default function SignedDocuments({ userId, userRole }) {
  const [documents, setDocuments] = useState([])
  const [lois, setLois] = useState([])
  const [generalContracts, setGeneralContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [activeDocType, setActiveDocType] = useState('all') // all, contracts, loi, general

  useEffect(() => {
    fetchDocuments()
  }, [userId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      
      // Načíst zprostředkovatelské smlouvy
      const contractsEndpoint = userRole === 'admin' 
        ? `${API_URL}/brokerage-contracts/all`
        : `${API_URL}/brokerage-contracts/user/${userId}`
      
      const contractsResponse = await fetch(contractsEndpoint)
      if (contractsResponse.ok) {
        const contractsData = await contractsResponse.json()
        // Přidat type pro unikátní key
        const contractsWithType = contractsData.map(doc => ({ ...doc, type: 'contract' }))
        setDocuments(contractsWithType)
      }
      
      // Načíst LOI
      const loisEndpoint = userRole === 'admin'
        ? `${API_URL}/loi-signatures/all`
        : `${API_URL}/loi-signatures/user/${userId}`
      
      const loisResponse = await fetch(loisEndpoint)
      if (loisResponse.ok) {
        const loisData = await loisResponse.json()
        // Přidat type pro unikátní key
        const loisWithType = loisData.map(doc => ({ ...doc, type: 'loi' }))
        setLois(loisWithType)
      }
      
      // Načíst obecné smlouvy (cooperation_client apod.)
      const generalEndpoint = userRole === 'admin'
        ? `${API_URL}/contracts/all`
        : `${API_URL}/contracts/user/${userId}`
      
      const generalResponse = await fetch(generalEndpoint)
      if (generalResponse.ok) {
        const generalData = await generalResponse.json()
        // Přidat type pro unikátní key
        const generalWithType = generalData.map(doc => ({ ...doc, type: 'general' }))
        setGeneralContracts(generalWithType)
      }
    } catch (error) {
      console.error('Chyba při načítání dokumentů:', error)
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

  const viewDocument = (doc) => {
    setSelectedDoc(doc)
  }

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Podepsané dokumenty</h3>
        <div className="text-center py-4 text-gray-500">Načítání...</div>
      </div>
    )
  }

  const totalDocs = documents.length + lois.length + generalContracts.length;
  const filteredDocs = activeDocType === 'contracts' ? documents : 
                       activeDocType === 'loi' ? lois :
                       activeDocType === 'general' ? generalContracts :
                       [...documents, ...lois, ...generalContracts].sort((a, b) => new Date(b.signed_at || b.created_at) - new Date(a.signed_at || a.created_at));

  return (
    <>
      <ComplianceNotice className="mb-6" />
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Podepsané dokumenty</h3>
            <p className="text-sm text-gray-600 mt-1">
              {totalDocs} {totalDocs === 1 ? 'dokument' : totalDocs < 5 ? 'dokumenty' : 'dokumentů'}
            </p>
          </div>
        </div>

        {/* Filtry - styl navigace */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setActiveDocType('all')}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              activeDocType === 'all' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Vše ({totalDocs})
          </button>
          <button
            onClick={() => setActiveDocType('contracts')}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              activeDocType === 'contracts' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Zprostředkovatelské smlouvy ({documents.length})
          </button>
          <button
            onClick={() => setActiveDocType('loi')}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              activeDocType === 'loi' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            LOI ({lois.length})
          </button>
          <button
            onClick={() => setActiveDocType('general')}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              activeDocType === 'general' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Smlouvy o spolupráci ({generalContracts.length})
          </button>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Žádné podepsané dokumenty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div key={`${doc.type}-${doc.id}`} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">
                        {doc.type === 'contract' ? 'Zprostředkovatelská smlouva' : 
                         doc.type === 'loi' ? 'LOI (Letter of Intent)' :
                         doc.type === 'general' && doc.contract_type === 'cooperation_client' ? 'Smlouva o spolupráci s klientem' :
                         'Smlouva'}
                      </h4>
                      <span className={`badge text-xs ${
                        doc.type === 'contract' ? 'bg-purple-100 text-purple-700' : 
                        doc.type === 'loi' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {doc.type === 'contract' 
                          ? (doc.entity_type === 'property' ? 'Nabídka' : 'Poptávka') + ' #' + doc.entity_id
                          : doc.type === 'loi' ? 'Match'
                          : doc.contract_type || 'Obecná'
                        }
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                      {doc.commission_rate ? (
                        <div>Provize: <strong>{doc.commission_rate}%</strong></div>
                      ) : doc.type === 'loi' ? (
                        <div>Typ: <strong>Záměr spolupráce</strong></div>
                      ) : (
                        <div>Status: <strong>{doc.status === 'signed' ? 'Podepsáno' : doc.status}</strong></div>
                      )}
                      <div>Podepsáno: {formatDate(doc.signed_at || doc.created_at)}</div>
                      {userRole === 'admin' && (
                        <div className="col-span-2">
                          {doc.commission_rate ? 'Agent' : 'Uživatel'}: {doc.user_name}
                        </div>
                      )}
                    </div>

                    {(doc.entity_title || doc.property_title) && (
                      <div className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                        {doc.entity_title || `${doc.property_title} ↔ ${doc.demand_title}`}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => viewDocument(doc)}
                    className="ml-4 p-2 hover:bg-primary-50 rounded-lg transition"
                    title="Zobrazit dokument"
                  >
                    <Eye className="w-5 h-5 text-primary-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal pro zobrazení dokumentu */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gradient">Zprostředkovatelská smlouva</h2>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-4 bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-green-900">Dokument podepsán</h3>
                </div>
                <p className="text-sm text-green-700">
                  Podepsáno dne: <strong>{formatDate(selectedDoc.signed_at)}</strong>
                </p>
              </div>

              <div className="glass-card p-4">
                <h4 className="font-semibold mb-2">Detaily smlouvy:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Typ:</span>
                    <span className="font-medium">{selectedDoc.entity_type === 'property' ? 'Nabídka' : 'Poptávka'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium">#{selectedDoc.entity_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provize Estate Private:</span>
                    <span className="font-bold text-primary-600">{selectedDoc.commission_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vytvořeno:</span>
                    <span className="font-medium">{formatDate(selectedDoc.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedDoc(null)} className="flex-1 glass-button-secondary rounded-full">
                  Zavřít
                </button>
                <button className="flex-1 glass-button rounded-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Stáhnout PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
