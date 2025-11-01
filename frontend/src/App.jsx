import { useState, useEffect, useCallback } from 'react'
import UserHistory from './components/UserHistory'
import PropertiesMap from './components/PropertiesMap'
import PropertyCard from './components/PropertyCard'
import AdminImportSources from './components/AdminImportSources'
import { Building2, Home, Search, Users as UsersIcon, LogOut, Building, Heart, Calendar, Edit, Pause, Play, Grid, List, Clock, User, FileText, Image as ImageIcon, Upload, X, Check, AlertCircle, Mail, Map, Plus, Trash2, MapPin, Lock } from 'lucide-react'
import { LABELS_CS } from './constants'
import GDPRBanner from './components/GDPRBanner'
import AccessCodeModal from './components/AccessCodeModal'
import LOIModal from './components/LOIModal'
import PasswordResetModal from './components/PasswordResetModal'
import DashboardWelcome from './components/DashboardWelcome'
import NotificationBell from './components/NotificationBell'
import PendingApprovalsPage from './components/PendingApprovalsPage'
import AddressSuggest from './components/AddressSuggest'
import CompanySuggest from './components/CompanySuggest'
import LocationMultiSuggest from './components/LocationMultiSuggest'
import BrokerageContractModal from './components/BrokerageContractModal'
import EntityHistory from './components/EntityHistory'
import MatchesList from './components/MatchesList'
import SignedDocuments from './components/SignedDocuments'

const normalizeCommissionPayload = (payload) => ({
  ...payload,
  commission_value: payload.commission_value !== '' ? Number(payload.commission_value) : '',
  commission_rate: payload.commission_rate !== '' ? Number(payload.commission_rate) : '',
  commission_base_amount: payload.commission_base_amount !== '' ? Number(payload.commission_base_amount) : ''
})

const PROPERTY_PRESENTATION = {
  flat: {
    labels: {
      headline: 'flatHeadline',
      secondary: 'flatSecondary',
      gridFacts: ['rooms', 'area', 'floor'],
      gridBadges: ['has_balcony', 'has_terrace', 'has_loggia', 'has_elevator', 'has_parking', 'has_garage'],
      listHighlights: ['transaction_type', 'property_type', 'property_subtype'],
      listDetails: ['rooms', 'area', 'floor', 'total_floors', 'has_balcony', 'has_elevator', 'has_parking'],
      listLocation: ['city', 'district', 'street']
    }
  },
  house: {
    labels: {
      headline: 'houseHeadline',
      secondary: 'houseSecondary',
      gridFacts: ['rooms', 'area', 'land_area'],
      gridBadges: ['has_garden', 'has_garage', 'has_parking', 'has_pool'],
      listHighlights: ['transaction_type', 'property_type', 'property_subtype'],
      listDetails: ['rooms', 'area', 'land_area', 'has_garden', 'has_garage', 'has_parking'],
      listLocation: ['city', 'district', 'street']
    }
  },
  commercial: {
    labels: {
      headline: 'commercialHeadline',
      secondary: 'commercialSecondary',
      gridFacts: ['area', 'floor', 'total_floors'],
      gridBadges: ['has_parking'],
      listHighlights: ['transaction_type', 'property_type', 'property_subtype'],
      listDetails: ['area', 'floor', 'total_floors', 'has_parking'],
      listLocation: ['city', 'district']
    }
  },
  land: {
    labels: {
      headline: 'landHeadline',
      secondary: 'landSecondary',
      gridFacts: ['land_area', 'area'],
      gridBadges: ['has_utilities'],
      listHighlights: ['transaction_type', 'property_type', 'property_subtype'],
      listDetails: ['land_area', 'area', 'has_utilities'],
      listLocation: ['city', 'district']
    }
  },
  project: {
    labels: {
      headline: 'projectHeadline',
      secondary: 'projectSecondary',
      gridFacts: ['project_units', 'area', 'project_completion'],
      gridBadges: ['project_stage'],
      listHighlights: ['transaction_type', 'property_type', 'project_stage'],
      listDetails: ['project_units', 'area', 'project_completion'],
      listLocation: ['city', 'district']
    }
  }
}

const PROPERTY_DISPLAY_RESOLVERS = {
  flatHeadline: (property, labels) => `${labels[property.property_type] || 'Nemovitost'} ${labels[property.property_subtype] || property.property_subtype || ''}`.trim(),
  flatSecondary: (property) => property.district || property.city || property.address || '',
  houseHeadline: (property, labels) => `${labels[property.property_type] || 'Nemovitost'} ${labels[property.property_subtype] || ''}`.trim(),
  houseSecondary: (property) => [property.city, property.district, property.address].filter(Boolean).join(', '),
  commercialHeadline: (property, labels) => `${labels[property.property_type] || 'Nemovitost'} ${labels[property.property_subtype] || ''}`.trim(),
  commercialSecondary: (property) => property.city || property.district || '',
  landHeadline: (property, labels) => `${labels[property.property_type] || 'Pozemek'} ${labels[property.property_subtype] || ''}`.trim(),
  landSecondary: (property) => property.city || property.district || '',
  projectHeadline: (property, labels) => property.title || `${labels[property.property_type] || 'Projekt'} ${labels[property.property_subtype] || ''}`.trim(),
  projectSecondary: (property) => property.city || property.district || '',
  area: (property) => property.area ? `${property.area} m²` : null,
  land_area: (property) => property.land_area ? `${property.land_area} m² pozemek` : null,
  rooms: (property) => Number(property.rooms) > 0 ? `${property.rooms} pokoje` : null,
  floor: (property) => property.floor ? `${property.floor}. patro` : null,
  total_floors: (property) => property.total_floors ? `${property.total_floors} pater` : null,
  project_units: (property) => property.project_units ? `${property.project_units} jednotek` : null,
  project_completion: (property) => property.project_completion ? `Dokončení ${property.project_completion}` : null,
  has_balcony: (property) => property.has_balcony ? 'Balkon' : null,
  has_terrace: (property) => property.has_terrace ? 'Terasa' : null,
  has_loggia: (property) => property.has_loggia ? 'Lodžie' : null,
  has_elevator: (property) => property.has_elevator ? 'Výtah' : null,
  has_parking: (property) => property.has_parking ? 'Parkování' : null,
  has_garage: (property) => property.has_garage ? 'Garáž' : null,
  has_cellar: (property) => property.has_cellar ? 'Sklep' : null,
  has_garden: (property) => property.has_garden ? 'Zahrada' : null,
  has_pool: (property) => property.has_pool ? 'Bazén' : null,
  has_utilities: (property) => property.has_utilities ? 'Inženýrské sítě' : null,
  project_stage: (property, labels) => property.project_stage ? labels[property.project_stage] || property.project_stage : null,
  transaction_type: (property, labels) => labels[property.transaction_type] || property.transaction_type,
  property_type: (property, labels) => labels[property.property_type] || property.property_type,
  property_subtype: (property, labels) => labels[property.property_subtype] || property.property_subtype || null,
  city: (property) => property.city || null,
  district: (property) => property.district || null,
  street: (property) => property.street || null
}

const buildPropertyPresentation = (property, labels = LABELS_CS) => {
  const config = PROPERTY_PRESENTATION[property.property_type] || PROPERTY_PRESENTATION.flat
  const resolve = (key) => {
    const resolver = PROPERTY_DISPLAY_RESOLVERS[key]
    if (!resolver) return null
    return resolver(property, labels)
  }

  const headline = resolve(config.labels.headline)
  const secondary = resolve(config.labels.secondary)
  const gridFacts = (config.labels.gridFacts || []).map(resolve).filter(Boolean)
  const gridBadges = (config.labels.gridBadges || []).map(resolve).filter(Boolean)

  const listHighlights = (config.labels.listHighlights || []).map(resolve).filter(Boolean)
  const listDetails = (config.labels.listDetails || []).map(resolve).filter(Boolean)
  const listLocation = (config.labels.listLocation || []).map(resolve).filter(Boolean)

  return {
    headline,
    secondary,
    gridFacts,
    gridBadges,
    list: {
      highlights: listHighlights,
      details: listDetails,
      location: listLocation
    },
    priceLabel: property.price_on_request ? 'Cena po podpisu LOI' : `${new Intl.NumberFormat('cs-CZ').format(property.price)} Kč`
  }
}

const API_URL = 'http://localhost:3001/api'
const MAPY_API_KEY = 'MTIdGpXVtxteHwipIwRw1MyH8f4IWYNgTyppp75Vp54'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [documentsSubTab, setDocumentsSubTab] = useState('signed') // 'signed' nebo 'templates'
  const [properties, setProperties] = useState([])
  const [demands, setDemands] = useState([])
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [registrationRequests, setRegistrationRequests] = useState([])
  const [emailTemplates, setEmailTemplates] = useState([])
  const [contractTemplates, setContractTemplates] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [selectedDemand, setSelectedDemand] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [showDemandModal, setShowDemandModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPropertyDetail, setShowPropertyDetail] = useState(false)
  const [showDemandDetail, setShowDemandDetail] = useState(false)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showGenerateCodeModal, setShowGenerateCodeModal] = useState(false)
  const [selectedEntityForCode, setSelectedEntityForCode] = useState(null)
  const [codeEntityType, setCodeEntityType] = useState(null)
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false)
  const [selectedEntityForCodeInput, setSelectedEntityForCodeInput] = useState(null)
  const [showAgentDeclarationModal, setShowAgentDeclarationModal] = useState(false)
  const [agentDeclarationVerified, setAgentDeclarationVerified] = useState(false)
  const [showBrokerageContractModal, setShowBrokerageContractModal] = useState(false)
  const [entityForContract, setEntityForContract] = useState(null)
  const [entityTypeForContract, setEntityTypeForContract] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mapViewMode, setMapViewMode] = useState(null) // Pro uložení stavu mapy

  useEffect(() => {
    // Ověřit session při načtení stránky
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const user = await response.json()
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Chyba při ověření session:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
    
    // Detekce kopírování textu
    const handleCopy = (e) => {
      if (currentUser) {
        const copiedText = window.getSelection().toString()
        if (copiedText.length > 10) {
          logUserAction('copy_text', 'content', null, `Zkopírováno: ${copiedText.substring(0, 100)}...`)
        }
      }
    }
    
    // Detekce pravého tlačítka myši na obrázcích
    const handleContextMenu = (e) => {
      if (currentUser && e.target.tagName === 'IMG') {
        logUserAction('right_click_image', 'image', null, `Pravé tlačítko na obrázku: ${e.target.src}`)
      }
    }
    
    // Detekce drag & drop obrázků
    const handleDragStart = (e) => {
      if (currentUser && e.target.tagName === 'IMG') {
        logUserAction('drag_image', 'image', null, `Pokus o přetažení obrázku: ${e.target.src}`)
      }
    }
    
    // Poslouchání custom eventu pro otevření registrace
    const handleOpenRegistration = () => {
      setShowRegistrationModal(true)
    }
    
    document.addEventListener('copy', handleCopy)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('dragstart', handleDragStart)
    window.addEventListener('openRegistration', handleOpenRegistration)
    
    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('dragstart', handleDragStart)
      window.removeEventListener('openRegistration', handleOpenRegistration)
    }
  }, [])

  const logUserAction = async (action, entityType, entityId, details) => {
    if (!currentUser) return
    
    try {
      await fetch(`${API_URL}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details
        })
      })
    } catch (error) {
      console.error('Chyba při logování akce:', error)
    }
  }

  const fetchData = useCallback(async () => {
    try {
      // Pro klienty a agenty načíst jen relevantní nabídky
      const propertiesUrl = currentUser && (currentUser.role === 'client' || currentUser.role === 'agent')
        ? `${API_URL}/properties/matching/${currentUser.id}`
        : `${API_URL}/properties${currentUser?.role === 'admin' ? '?show_all=true' : ''}`;
      
      // Pro agenty načíst jen poptávky jejich klientů
      const demandsUrl = currentUser.role === 'admin' || currentUser.role === 'agent'
        ? `${API_URL}/demands?show_all=true&userRole=${currentUser.role}`
        : `${API_URL}/demands?agentId=${currentUser.id}&userRole=${currentUser.role}`;
      
      const requests = [
        fetch(propertiesUrl, { credentials: 'include' }),
        fetch(demandsUrl, { credentials: 'include' }),
        fetch(`${API_URL}/users`, { credentials: 'include' }),
        fetch(`${API_URL}/companies`, { credentials: 'include' }),
        fetch(`${API_URL}/stats`, { credentials: 'include' })
      ];
      
      // Přidat registrace, emailové šablony a smluvní šablony pouze pro admina
      if (currentUser.role === 'admin') {
        requests.push(fetch(`${API_URL}/registration-requests`, { credentials: 'include' }));
        requests.push(fetch(`${API_URL}/email-templates`, { credentials: 'include' }));
        requests.push(fetch(`${API_URL}/contract-templates`, { credentials: 'include' }));
      }
      
      const responses = await Promise.all(requests);
      const [propertiesRes, demandsRes, usersRes, companiesRes, statsRes, registrationsRes, emailTemplatesRes, contractTemplatesRes] = responses;
      
      if (propertiesRes.ok) {
        setProperties(await propertiesRes.json())
      } else {
        console.error('Chyba při načítání properties:', await propertiesRes.text())
        setProperties([])
      }
      
      if (demandsRes.ok) {
        setDemands(await demandsRes.json())
      } else {
        setDemands([])
      }
      
      if (usersRes.ok) {
        setUsers(await usersRes.json())
      } else {
        setUsers([])
      }
      
      if (companiesRes.ok) {
        setCompanies(await companiesRes.json())
      } else {
        setCompanies([])
      }
      
      if (statsRes.ok) {
        setStats(await statsRes.json())
      } else {
        setStats({})
      }
      
      if (registrationsRes && registrationsRes.ok) {
        setRegistrationRequests(await registrationsRes.json())
      } else if (registrationsRes) {
        setRegistrationRequests([])
      }
      
      if (emailTemplatesRes && emailTemplatesRes.ok) {
        setEmailTemplates(await emailTemplatesRes.json())
      } else if (emailTemplatesRes) {
        setEmailTemplates([])
      }
      
      if (contractTemplatesRes && contractTemplatesRes.ok) {
        setContractTemplates(await contractTemplatesRes.json())
      } else if (contractTemplatesRes) {
        setContractTemplates([])
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Chyba při načítání dat:', error)
      setLoading(false)
    }
  }, [currentUser])

  // Načíst data když se změní currentUser
  useEffect(() => {
    if (currentUser) {
      fetchData()
    }
  }, [currentUser, fetchData])

  const handleDeleteProperty = async (id) => {
    if (!confirm('Opravdu chcete smazat tuto nemovitost?')) return
    try {
      await fetch(`${API_URL}/properties/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Chyba při mazání:', error)
      alert('Chyba při mazání nemovitosti')
    }
  }

  const handleDeleteDemand = async (id) => {
    if (!confirm('Opravdu chcete smazat tuto poptávku?')) return
    try {
      await fetch(`${API_URL}/demands/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Chyba při mazání:', error)
      alert('Chyba při mazání poptávky')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Opravdu chcete smazat tohoto uživatele?')) return
    try {
      await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Chyba při mazání:', error)
      alert('Chyba při mazání uživatele')
    }
  }

  const handleTogglePropertyStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active'
    try {
      const property = properties.find(p => p.id === id)
      await fetch(`${API_URL}/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...property, status: newStatus })
      })
      fetchData()
    } catch (error) {
      console.error('Chyba při změně stavu:', error)
      alert('Chyba při změně stavu')
    }
  }

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // DŮLEŽITÉ: Posílá a přijímá cookies
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        let errorMessage = 'Přihlášení selhalo'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (e) {
          // Pokud odpověď není JSON, použij výchozí zprávu
        }
        throw new Error(errorMessage)
      }
      
      const user = await response.json()
      setCurrentUser(user)
      setShowLoginModal(false)
      // Data se načtou automaticky přes useEffect
    } catch (error) {
      console.error('Chyba při přihlášení:', error)
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Chyba při odhlášení:', error)
    } finally {
      setCurrentUser(null)
      // Přesměrovat na login
      setShowLoginModal(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card">
          <div className="text-xl text-gray-700">Načítání...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Glassmorphism Navigation */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Estate Private" 
                className="h-12 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-600)' }}>Estate Private</h1>
                <p className="text-xs text-gray-500">Off-market realitni platforma</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-xl font-bold" style={{ color: 'var(--primary-600)' }}>Estate Private</h1>
              </div>
            </div>
            
            {/* Desktop Menu - základní položky vždy viditelné */}
            {currentUser && (
              <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'hover:bg-white/30'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium text-sm">Dashboard</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'properties'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'hover:bg-white/30'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span className="font-medium text-sm">Nabídky</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('demands')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'demands'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'hover:bg-white/30'
                  }`}
                >
                  <Search className="w-5 h-5" />
                  <span className="font-medium text-sm">Poptávky</span>
                </button>

                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'documents'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'hover:bg-white/30'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium text-sm">Dokumenty</span>
                </button>
              </div>
            )}
            
            {/* Right side - Notifikace + User + Hamburger */}
            <div className="flex items-center space-x-3">
              {currentUser && (
                <>
                  {/* Notifikace */}
                  <NotificationBell 
                    userId={currentUser.id}
                    onContractRequired={async (entityType, entityId) => {
                      try {
                        const endpoint = entityType === 'property' 
                          ? `${API_URL}/properties/${entityId}`
                          : `${API_URL}/demands/${entityId}`
                        const response = await fetch(endpoint)
                        if (response.ok) {
                          const entity = await response.json()
                          if (entityType === 'property') {
                            setSelectedProperty(entity)
                          } else {
                            setSelectedDemand(entity)
                          }
                          setShowContractModal(true)
                        }
                      } catch (error) {
                        console.error('Chyba při načítání entity:', error)
                      }
                    }}
                  />
                  
                  {/* User info - skryté na mobilu */}
                  <button
                    onClick={() => { setSelectedUser(currentUser); setShowUserDetail(true); }}
                    className="hidden md:flex glass-card py-2 px-4 items-center space-x-3 hover:bg-white/50 transition cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
                      <div className="badge bg-purple-100 text-purple-700 text-xs">
                        {LABELS_CS[currentUser.role]}
                      </div>
                    </div>
                  </button>
                  
                  {/* Odhlásit - skryté na mobilu */}
                  <button 
                    onClick={handleLogout} 
                    className="hidden md:block p-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all" 
                    title="Odhlásit se"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                  
                  {/* Hamburger menu - admin položky + mobil */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`p-2.5 rounded-xl transition-all ${
                      mobileMenuOpen 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'hover:bg-white/30'
                    }`}
                  >
                    {mobileMenuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </>
              )}
              
              {!currentUser && (
                <button onClick={() => setShowLoginModal(true)} className="glass-button rounded-full">
                  Přihlásit se
                </button>
              )}
            </div>
          </div>
          
          {/* Dropdown Menu - Admin položky + Mobil všechny položky */}
          {currentUser && mobileMenuOpen && (
            <div className="absolute right-4 top-full mt-2 w-80 glass-card rounded-2xl shadow-2xl p-4 space-y-2 z-50">
              {/* Na mobilu zobrazit základní položky */}
              <div className="md:hidden space-y-1 pb-3 border-b border-gray-200">
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                    activeTab === 'dashboard' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                      : 'hover:bg-white/50'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium text-sm">Dashboard</span>
                </button>
              
              <button
                onClick={() => { setActiveTab('properties'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === 'properties' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-white/50'
                }`}
              >
                <Building className="w-5 h-5" />
                <span className="font-medium text-sm">Nabídky</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('demands'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === 'demands' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-white/50'
                }`}
              >
                <Search className="w-5 h-5" />
                <span className="font-medium text-sm">Poptávky</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('documents'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === 'documents' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-white/50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium text-sm">Dokumenty</span>
              </button>
              </div>
              
              {/* Admin položky - vždy viditelné v dropdown */}
              {currentUser.role === 'admin' && (
                <>
                  <div className="pt-2 mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">Admin sekce</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('pending'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                      activeTab === 'pending' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    <span className="font-medium text-sm">Schvalování</span>
                  </button>
                  
                  <button
                    onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                      activeTab === 'users' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <UsersIcon className="w-5 h-5" />
                    <span className="font-medium text-sm">Uživatelé</span>
                  </button>
                  
                  <button
                    onClick={() => { setActiveTab('registrations'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                      activeTab === 'registrations' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <UsersIcon className="w-5 h-5" />
                      <span className="font-medium text-sm">Registrace</span>
                    </div>
                    {registrationRequests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        {registrationRequests.filter(r => r.status === 'pending').length}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => { setActiveTab('audit'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                      activeTab === 'audit' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium text-sm">Audit</span>
                  </button>
                  
                  <button
                    onClick={() => { setActiveTab('email-templates'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                      activeTab === 'email-templates' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium text-sm">Emaily</span>
                  </button>
                  
                  <button
                    onClick={() => { setActiveTab('import-sources'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                      activeTab === 'import-sources' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-medium text-sm">Import API</span>
                  </button>
                </>
              )}
              
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/30 transition cursor-pointer"
                  onClick={() => { setSelectedUser(currentUser); setShowUserDetail(true); }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{LABELS_CS[currentUser.role]}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Odhlásit se</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!currentUser ? (
          <div className="flex items-center justify-center h-96">
            <div className="glass-card text-center p-12">
              <img 
                src="/logo.png" 
                alt="Estate Private" 
                className="h-24 w-auto mx-auto mb-6"
              />
              <h2 className="text-3xl font-bold text-gradient mb-4">Vítejte na Estate Private</h2>
              <p className="text-gray-600 mb-6 max-w-2xl">Vítejte na exkluzivní platformě pro off-market nemovitosti - nabídky a poptávky, které nenajdete nikde jinde. Propojujeme realitní agenty s klienty prostřednictvím inteligentního párování a zajišťujeme maximální ochranu dat.</p>
              <button onClick={() => setShowLoginModal(true)} className="glass-button rounded-full">
                Přihlásit se
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard stats={stats} currentUser={currentUser} />}
            {activeTab === 'properties' && (
              <Properties 
                properties={properties} 
                currentUser={currentUser}
                mapViewMode={mapViewMode}
                setMapViewMode={setMapViewMode}
                onAdd={() => { 
                  setSelectedProperty(null);
                  // Agent musí nejdřív podepsat prohlášení
                  if (currentUser.role === 'agent') {
                    setShowAgentDeclarationModal(true);
                  } else {
                    setShowPropertyModal(true);
                  }
                }}
                onEdit={(property) => { setSelectedProperty(property); setShowPropertyModal(true); }}
                onDelete={handleDeleteProperty}
                onToggleStatus={handleTogglePropertyStatus}
                onViewDetail={(property) => { 
                  setSelectedProperty(property); 
                  setShowPropertyDetail(true);
                  logUserAction('view', 'property', property.id, `Zobrazení detailu nemovitosti: ${property.title}`);
                }}
                onGenerateCode={(property) => {
                  setSelectedEntityForCode(property);
                  setCodeEntityType('property');
                  setShowGenerateCodeModal(true);
                }}
                onApprove={async (propertyId) => {
                  try {
                    const response = await fetch(`${API_URL}/properties/${propertyId}/approve`, {
                      method: 'POST',
                      credentials: 'include'
                    });
                    if (response.ok) {
                      const result = await response.json();
                      alert(`Nabídka schválena! Odesláno ${result.notificationsSent} emailů.`);
                      fetchData();
                    } else {
                      alert('Chyba při schvalování nabídky');
                    }
                  } catch (error) {
                    console.error('Chyba při schvalování:', error);
                    alert('Chyba při schvalování nabídky');
                  }
                }}
              />
            )}
            {activeTab === 'demands' && (
              <Demands 
                demands={demands} 
                currentUser={currentUser}
                onAdd={() => { setSelectedDemand(null); setShowDemandModal(true); }}
                onEdit={(demand) => { setSelectedDemand(demand); setShowDemandModal(true); }}
                onDelete={handleDeleteDemand}
                onViewDetail={(demand) => { 
                  setSelectedDemand(demand); 
                  setShowDemandDetail(true);
                  logUserAction('view', 'demand', demand.id, `Zobrazení detailu poptávky: ${demand.transaction_type} ${demand.property_type}`);
                }}
                onGenerateCode={(demand) => {
                  setSelectedEntityForCode(demand);
                  setCodeEntityType('demand');
                  setShowGenerateCodeModal(true);
                }}
                onApprove={async (demandId) => {
                  try {
                    const response = await fetch(`${API_URL}/demands/${demandId}/approve`, {
                      method: 'POST',
                      credentials: 'include'
                    });
                    if (response.ok) {
                      const result = await response.json();
                      alert(`Poptávka schválena! Odesláno ${result.notificationsSent} emailů.`);
                      fetchData();
                    } else {
                      alert('Chyba při schvalování poptávky');
                    }
                  } catch (error) {
                    console.error('Chyba při schvalování:', error);
                    alert('Chyba při schvalování poptávky');
                  }
                }}
              />
            )}
            {activeTab === 'pending' && currentUser.role === 'admin' && (
              <PendingApprovalsPage currentUser={currentUser} />
            )}
            {activeTab === 'users' && currentUser.role === 'admin' && (
              <UsersPage 
                users={users.filter(u => u.is_active === 1)}
                onAdd={() => { setSelectedUser(null); setShowUserModal(true); }}
                onEdit={(user) => { setSelectedUser(user); setShowUserModal(true); }}
                onDelete={handleDeleteUser}
                onViewDetail={(user) => { setSelectedUser(user); setShowUserDetail(true); }}
              />
            )}
            {activeTab === 'registrations' && currentUser.role === 'admin' && (
              <RegistrationRequestsPage 
                requests={registrationRequests}
                onApprove={async (request, approvalData) => {
                  // Schválení registrace
                  try {
                    const response = await fetch(`${API_URL}/registration-requests/${request.id}/approve`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...approvalData,
                        approved_by: currentUser.id
                      })
                    })
                    if (response.ok) {
                      await fetchData()
                      alert('Registrace byla schválena')
                    } else {
                      const error = await response.json()
                      alert('Chyba: ' + error.error)
                    }
                  } catch (error) {
                    alert('Chyba při schvalování: ' + error.message)
                  }
                }}
                onReject={async (requestId, reason) => {
                  // Zamítnutí registrace
                  try {
                    const response = await fetch(`${API_URL}/registration-requests/${requestId}/reject`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reason })
                    })
                    if (response.ok) {
                      await fetchData()
                      alert('Registrace byla zamítnuta')
                    }
                  } catch (error) {
                    alert('Chyba při zamítání: ' + error.message)
                  }
                }}
              />
            )}
            {activeTab === 'audit' && currentUser.role === 'admin' && (
              <AuditLogPage currentUser={currentUser} />
            )}
            {activeTab === 'email-templates' && currentUser.role === 'admin' && (
              <EmailTemplatesPage 
                templates={emailTemplates}
                onUpdate={async (id, data) => {
                  try {
                    const response = await fetch(`${API_URL}/email-templates/${id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    });
                    if (response.ok) {
                      await fetchData();
                      alert('Šablona byla úspěšně aktualizována');
                    }
                  } catch (error) {
                    console.error('Chyba při aktualizaci šablony:', error);
                    alert('Chyba při aktualizaci šablony');
                  }
                }}
              />
            )}
            {activeTab === 'import-sources' && currentUser.role === 'admin' && (
              <div className="fade-in">
                <h1 className="text-4xl font-bold text-white mb-8">Import Sources</h1>
                <AdminImportSources currentUser={currentUser} />
              </div>
            )}
            {activeTab === 'documents' && (
              <div className="fade-in">
                <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--primary-600)' }}>Dokumenty</h1>
                
                {/* Sub-taby */}
                <div className="glass-card mb-6 p-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setDocumentsSubTab('signed')}
                      className={`px-6 py-2.5 rounded-full transition-all text-sm font-medium ${
                        documentsSubTab === 'signed'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                          : 'hover:bg-white/30'
                      }`}
                    >
                      Podepsané dokumenty
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => setDocumentsSubTab('templates')}
                        className={`px-6 py-2.5 rounded-full transition-all text-sm font-medium ${
                          documentsSubTab === 'templates'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                            : 'hover:bg-white/30'
                        }`}
                      >
                        Smluvní šablony
                      </button>
                    )}
                  </div>
                </div>
                
                {documentsSubTab === 'signed' && (
                  <SignedDocuments userId={currentUser.id} userRole={currentUser.role} />
                )}
                
                {documentsSubTab === 'templates' && currentUser.role === 'admin' && (
                  <ContractTemplatesManager 
                    templates={contractTemplates}
                    onUpdate={fetchData}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showLoginModal && <LoginForm onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
      {showRegistrationModal && (
        <RegistrationForm 
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={() => {
            // Můžeme zobrazit notifikaci nebo přesměrovat
          }}
        />
      )}
      {showPropertyModal && (
        <PropertyModal 
          property={selectedProperty}
          users={users.filter(u => u.role === 'agent')}
          currentUser={currentUser}
          onSave={async (data) => {
            try {
              const method = selectedProperty ? 'PUT' : 'POST'
              const url = selectedProperty ? `${API_URL}/properties/${selectedProperty.id}` : `${API_URL}/properties`
              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...normalizeCommissionPayload({
                    ...data,
                    price_on_request: data.price_on_request ? 1 : 0
                  }),
                  user_role: currentUser.role  // Přidáme roli pro určení statusu
                })
              })
              
              if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Chyba při ukládání')
              }
              
              await fetchData()
              setShowPropertyModal(false)
              alert(selectedProperty ? 'Nabídka byla upravena' : 'Nabídka byla přidána')
            } catch (error) {
              console.error('Chyba:', error)
              alert('Chyba při ukládání: ' + error.message)
            }
          }}
          onClose={() => setShowPropertyModal(false)}
        />
      )}
      {showDemandModal && (
        <DemandModal 
          demand={selectedDemand}
          users={users.filter(u => u.role === 'client')}
          currentUser={currentUser}
          onSave={async (data) => {
            try {
              const method = selectedDemand ? 'PUT' : 'POST'
              const url = selectedDemand ? `${API_URL}/demands/${selectedDemand.id}` : `${API_URL}/demands`
              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...normalizeCommissionPayload(data),
                  user_role: currentUser.role  // Přidáme roli pro určení statusu
                })
              })
              
              if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Chyba při ukládání')
              }
              
              const result = await response.json()
              
              await fetchData()
              setShowDemandModal(false)
              
              // Zpráva podle toho, zda bylo vytvořeno více poptávek
              if (selectedDemand) {
                alert('Poptávka byla upravena')
              } else if (result.count) {
                alert(`Úspěšně vytvořeno ${result.count} poptávek`)
              } else {
                alert('Poptávka byla přidána')
              }
            } catch (error) {
              console.error('Chyba:', error)
              alert('Chyba při ukládání: ' + error.message)
            }
          }}
          onClose={() => setShowDemandModal(false)}
        />
      )}
      {showUserModal && (
        <UserModal 
          user={selectedUser}
          companies={companies}
          currentUser={currentUser}
          onSave={async (data) => {
            try {
              const method = selectedUser ? 'PUT' : 'POST'
              const url = selectedUser ? `${API_URL}/users/${selectedUser.id}` : `${API_URL}/users`
              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              })
              
              if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Chyba při ukládání')
              }
              
              await fetchData()
              setShowUserModal(false)
              alert(selectedUser ? 'Uživatel byl upraven' : 'Uživatel byl přidán')
            } catch (error) {
              console.error('Chyba:', error)
              alert('Chyba při ukládání: ' + error.message)
            }
          }}
          onClose={() => setShowUserModal(false)}
        />
      )}
      {showPropertyDetail && selectedProperty && (
        <PropertyDetail 
          property={selectedProperty}
          currentUser={currentUser}
          onClose={() => {
            setShowPropertyDetail(false)
            // Pokud byl otevřen z mapy, obnovit mapu
            if (mapViewMode === 'map') {
              setMapViewMode(null)
            }
          }}
          onEdit={() => { setShowPropertyDetail(false); setShowPropertyModal(true); }}
          onToggleStatus={() => {
            handleTogglePropertyStatus(selectedProperty.id, selectedProperty.status)
            setShowPropertyDetail(false)
            if (mapViewMode === 'map') {
              setMapViewMode(null)
            }
          }}
          onAddProperty={() => {
            setSelectedProperty(null)
            setShowPropertyDetail(false)
            setShowPropertyModal(true)
          }}
          onAddDemand={() => {
            setSelectedDemand(null)
            setShowPropertyDetail(false)
            setShowDemandModal(true)
          }}
        />
      )}
      {showDemandDetail && selectedDemand && (
        <DemandDetail 
          demand={selectedDemand}
          currentUser={currentUser}
          onClose={() => setShowDemandDetail(false)}
          onEdit={() => { setShowDemandDetail(false); setShowDemandModal(true); }}
          onAddProperty={() => {
            setSelectedProperty(null)
            setShowDemandDetail(false)
            setShowPropertyModal(true)
          }}
          onAddDemand={() => {
            setSelectedDemand(null)
            setShowDemandDetail(false)
            setShowDemandModal(true)
          }}
        />
      )}
      {showUserDetail && selectedUser && (
        <UserDetail 
          user={selectedUser}
          currentUser={currentUser}
          onClose={() => setShowUserDetail(false)}
          onEdit={() => { setShowUserDetail(false); setShowUserModal(true); }}
        />
      )}

      {/* GDPR Cookie Banner */}
      <GDPRBanner onAccept={(consents) => {
        console.log('GDPR souhlasy přijaty:', consents)
      }} />
      
      {/* Modal pro generování přístupového kódu */}
      {showGenerateCodeModal && (
        <GenerateAccessCodeModal
          isOpen={showGenerateCodeModal}
          onClose={() => {
            setShowGenerateCodeModal(false)
            setSelectedEntityForCode(null)
            setCodeEntityType(null)
          }}
          entity={selectedEntityForCode}
          entityType={codeEntityType}
          currentUser={currentUser}
          onCodeGenerated={(entity, entityType) => {
            // Po vygenerování kódu otevřít modál pro zadání kódu
            setSelectedEntityForCodeInput(entity)
            setCodeEntityType(entityType)
            setShowAccessCodeInput(true)
          }}
        />
      )}

      {/* Modal pro zadání přístupového kódu */}
      {showAccessCodeInput && selectedEntityForCodeInput && (
        <AccessCodeModal
          isOpen={showAccessCodeInput}
          onSubmit={async (code) => {
            try {
              const endpoint = codeEntityType === 'property' 
                ? `${API_URL}/properties/${selectedEntityForCodeInput.id}/verify-code`
                : `${API_URL}/demands/${selectedEntityForCodeInput.id}/verify-code`
              
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, user_id: currentUser.id })
              })
              
              if (response.ok) {
                setShowAccessCodeInput(false)
                // Otevřít detail
                if (codeEntityType === 'property') {
                  setSelectedProperty(selectedEntityForCodeInput)
                  setShowPropertyDetail(true)
                } else {
                  setSelectedDemand(selectedEntityForCodeInput)
                  setShowDemandDetail(true)
                }
                return true
              } else {
                const data = await response.json()
                throw new Error(data.error || 'Neplatný přístupový kód')
              }
            } catch (error) {
              throw error
            }
          }}
          onClose={() => {
            setShowAccessCodeInput(false)
            setSelectedEntityForCodeInput(null)
          }}
          entityType={codeEntityType}
        />
      )}

      {/* Modal pro prohlášení agenta */}
      {showAgentDeclarationModal && (
        <AgentDeclarationModal
          isOpen={showAgentDeclarationModal}
          onClose={() => setShowAgentDeclarationModal(false)}
          currentUser={currentUser}
          onVerified={() => {
            setAgentDeclarationVerified(true)
            setShowAgentDeclarationModal(false)
            setShowPropertyModal(true)
          }}
        />
      )}

      {/* Modal pro zprostředkovatelskou smlouvu */}
      {showBrokerageContractModal && entityForContract && (
        <BrokerageContractModal
          isOpen={showBrokerageContractModal}
          onClose={() => {
            setShowBrokerageContractModal(false)
            setEntityForContract(null)
            setEntityTypeForContract(null)
          }}
          entity={entityForContract}
          entityType={entityTypeForContract}
          currentUser={currentUser}
          onContractSigned={() => {
            fetchData() // Reload data po podpisu
          }}
        />
      )}
    </div>
  )
}

function Dashboard({ stats, currentUser }) {
  return (
    <div className="fade-in">
      <DashboardWelcome currentUser={currentUser} />
      
      <div className="glass-card mb-6 p-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Statistiky</h3>
          <p className="text-sm text-gray-600 mt-1">
            {currentUser?.role === 'admin' && 'Přehled klíčových metrik systému'}
            {currentUser?.role === 'agent' && 'Přehled vašich nabídek a poptávek'}
            {currentUser?.role === 'client' && 'Přehled vašich poptávek'}
          </p>
        </div>
      </div>
      
      <div className="dashboard-grid">
        {/* Admin - Aktivní nabídky */}
        {currentUser?.role === 'admin' && (
          <div className="glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Aktivní nabídky</p>
                <p className="text-5xl font-bold text-gradient mt-2">{stats.properties?.total || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.properties?.sale || 0} k prodeji • {stats.properties?.rent || 0} k pronájmu
                </p>
              </div>
              <Building className="w-16 h-16 text-purple-400" />
            </div>
          </div>
        )}
        
        {/* Agent - Moje nabídky */}
        {currentUser?.role === 'agent' && (
          <div className="glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Moje nabídky</p>
                <p className="text-5xl font-bold text-gradient mt-2">{stats.properties?.total || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.properties?.sale || 0} k prodeji • {stats.properties?.rent || 0} k pronájmu
                </p>
              </div>
              <Building className="w-16 h-16 text-purple-400" />
            </div>
          </div>
        )}
        
        {/* Admin - Aktivní poptávky */}
        {currentUser?.role === 'admin' && (
          <div className="glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Aktivní poptávky</p>
                <p className="text-5xl font-bold text-gradient mt-2">{stats.demands?.total || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.demands?.sale || 0} na prodej • {stats.demands?.rent || 0} na pronájem
                </p>
              </div>
              <Search className="w-16 h-16 text-blue-400" />
            </div>
          </div>
        )}
        
        {/* Agent - Dostupné poptávky */}
        {currentUser?.role === 'agent' && (
          <div className="glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Dostupné poptávky</p>
                <p className="text-5xl font-bold text-gradient mt-2">{stats.demands?.total || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Poptávky k nabídnutí
                </p>
              </div>
              <Search className="w-16 h-16 text-blue-400" />
            </div>
          </div>
        )}
        
        {/* Klient - Moje poptávky */}
        {currentUser?.role === 'client' && (
          <div className="glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Moje poptávky</p>
                <p className="text-5xl font-bold text-gradient mt-2">{stats.demands?.total || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.demands?.sale || 0} na prodej • {stats.demands?.rent || 0} na pronájem
                </p>
              </div>
              <Search className="w-16 h-16 text-blue-400" />
            </div>
          </div>
        )}
        
        {/* Aktivní uživatelé - pouze Admin */}
        {currentUser?.role === 'admin' && (
          <div className="glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Aktivní uživatelé</p>
                <p className="text-5xl font-bold text-gradient mt-2">{stats.users?.total || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.users?.agents || 0} {(stats.users?.agents || 0) === 1 ? 'agent' : (stats.users?.agents || 0) < 5 ? 'agenti' : 'agentů'} • {stats.users?.clients || 0} {(stats.users?.clients || 0) === 1 ? 'klient' : (stats.users?.clients || 0) < 5 ? 'klienti' : 'klientů'}
                </p>
              </div>
              <UsersIcon className="w-16 h-16 text-green-400" />
            </div>
          </div>
        )}
        
        {/* Páry nabídka-poptávka - skryto (počítá se dynamicky v detailech) */}
        
        {/* Čekající registrace - pouze Admin */}
        {currentUser?.role === 'admin' && (
          <div className="glass-card border-2 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Čekající registrace</p>
                <p className="text-5xl font-bold text-gradient mt-2">{stats.registrations?.pending || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Ke schválení
                </p>
              </div>
              <UsersIcon className="w-16 h-16 text-yellow-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Properties({ properties, currentUser, mapViewMode, setMapViewMode, onAdd, onEdit, onDelete, onToggleStatus, onViewDetail, onGenerateCode, onApprove }) {
  const [viewMode, setViewMode] = useState('grid') // grid, list, map, hidden
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  
  // Obnovit mapu po zavření detailu
  useEffect(() => {
    if (mapViewMode === null && viewMode === 'hidden') {
      setViewMode('map')
    }
  }, [mapViewMode])
  const [filters, setFilters] = useState({
    transaction_type: '',
    property_type: '',
    property_subtype: '',
    city: '',
    price_min: '',
    price_max: '',
    location_search: '',
    location_radius: '0',
    mine: false // Filtr pro "Moje nabídky"
  })
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false)
  const [selectedPropertyForAccess, setSelectedPropertyForAccess] = useState(null)
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ').format(price)
  }

  // Haversine formula pro výpočet vzdálenosti mezi GPS souřadnicemi
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Poloměr Země v km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Vzdálenost v km
  }

  // Našeptávač lokalit
  const searchLocations = async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([])
      return
    }

    try {
      const response = await fetch(
        `https://api.mapy.cz/v1/suggest?lang=cs&limit=8&locality=cz&type=regional&query=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: 'application/json',
            'X-Mapy-Api-Key': MAPY_API_KEY
          }
        }
      )

      if (!response.ok) throw new Error('Sugest API error')
      const data = await response.json()

      const suggestions = (data.items || []).map(item => {
        const normalizedBbox = Array.isArray(item.bbox) && item.bbox.length === 4
          ? {
              minLon: Number(item.bbox[0]),
              minLat: Number(item.bbox[1]),
              maxLon: Number(item.bbox[2]),
              maxLat: Number(item.bbox[3])
            }
          : null

        const municipality = item.regionalStructure?.find(r => r.type === 'regional.municipality')?.name
        const district = item.regionalStructure?.find(r => r.type === 'regional.region' && r.name.startsWith('okres'))?.name?.replace('okres ', '')
        const region = item.regionalStructure?.find(r => r.type === 'regional.region' && r.name.startsWith('kraj'))?.name?.replace('kraj ', '')
        const labelParts = [item.name]
        if (municipality && municipality !== item.name) labelParts.push(municipality)
        if (district) labelParts.push(district)
        if (region) labelParts.push(region)

        return {
          label: labelParts.join(', '),
          name: item.name,
          city: municipality,
          district,
          region,
          latitude: item.location?.lat || item.position?.lat || null,
          longitude: item.location?.lon || item.position?.lon || null,
          bbox: normalizedBbox
        }
      })

      setLocationSuggestions(suggestions)
    } catch (error) {
      console.error('Chyba při našeptávání lokality:', error)
      setLocationSuggestions([])
    }
  }

  const filteredProperties = Array.isArray(properties) ? properties.filter(property => {
    if (filters.transaction_type && property.transaction_type !== filters.transaction_type) return false
    if (filters.property_type && property.property_type !== filters.property_type) return false
    if (filters.property_subtype && property.property_subtype !== filters.property_subtype) return false
    if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.price_min && property.price < parseInt(filters.price_min)) return false
    if (filters.price_max && property.price > parseInt(filters.price_max)) return false
    
    // Filtrování podle lokality - textové vyhledávání
    if (filters.location_search) {
      if (selectedLocation?.bbox && property.latitude && property.longitude) {
        const { minLat, maxLat, minLon, maxLon } = selectedLocation.bbox
        const lat = Number(property.latitude)
        const lon = Number(property.longitude)
        if (
          Number.isFinite(lat) && Number.isFinite(lon) &&
          (lat < minLat || lat > maxLat || lon < minLon || lon > maxLon)
        ) {
          return false
        }
      } else if (property.city) {
        if (!property.city.toLowerCase().includes(filters.location_search.toLowerCase())) return false
      }
    }
    
    // Filtr "Moje nabídky"
    if (filters.mine && Number(property.agent_id) !== Number(currentUser.id)) return false
    
    return true
  }) : []

  // Stránkování
  const enrichedProperties = filteredProperties.map(property => ({
    ...property,
    presentation: buildPropertyPresentation(property, LABELS_CS)
  }))

  const totalPages = Math.ceil(enrichedProperties.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProperties = viewMode === 'map' ? enrichedProperties : enrichedProperties.slice(indexOfFirstItem, indexOfLastItem)
  
  // Reset na první stránku při změně filtrů
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleAccessCodeSubmit = async (code) => {
    try {
      const response = await fetch(`${API_URL}/properties/${selectedPropertyForAccess.id}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, user_id: currentUser.id })
      })
      if (response.ok) {
        onViewDetail(selectedPropertyForAccess)
        setShowAccessCodeModal(false)
        return true
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Neplatný přístupový kód')
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="fade-in">
      {/* Header s filtry a akcemi */}
      <div className="glass-card mb-6 p-6">
        {/* Filtry - styl navigace */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(currentUser.role === 'agent' || currentUser.role === 'admin') && (
            <>
              <button
                onClick={() => setFilters({ ...filters, mine: !filters.mine })}
                className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                  filters.mine
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'hover:bg-white/30'
                }`}
              >
                Moje nabídky
              </button>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
            </>
          )}
          
          <button
            onClick={() => setFilters({ ...filters, transaction_type: '', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.transaction_type === '' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Vše
          </button>
          <button
            onClick={() => setFilters({ ...filters, transaction_type: 'sale' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.transaction_type === 'sale' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Prodej
          </button>
          <button
            onClick={() => setFilters({ ...filters, transaction_type: 'rent' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.transaction_type === 'rent' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Pronájem
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          
          <button
            onClick={() => setFilters({ ...filters, property_type: '', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === '' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Všechny typy
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'flat', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'flat' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Byty
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'house', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'house' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Domy
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'commercial', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'commercial' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Komerční
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'land', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'land' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Pozemky
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'project', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'project' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Projekty
          </button>
        </div>
        
        {/* Podtypy nemovitostí - dynamicky podle vybraného typu */}
        {filters.property_type && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Podtyp:</span>
            <button
              onClick={() => setFilters({ ...filters, property_subtype: '' })}
              className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                filters.property_subtype === '' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'hover:bg-white/30 text-gray-600'
              }`}
            >
              Všechny
            </button>
            {filters.property_type === 'flat' && ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', 'atypical'].map(subtype => (
              <button
                key={subtype}
                onClick={() => setFilters({ ...filters, property_subtype: subtype })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === subtype 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {subtype === 'atypical' ? 'Atypický' : subtype}
              </button>
            ))}
            {filters.property_type === 'house' && [{v:'family_house',l:'Rodinný dům'},{v:'villa',l:'Vila'},{v:'cottage',l:'Chalupa'},{v:'cabin',l:'Chata'}].map(({v,l}) => (
              <button
                key={v}
                onClick={() => setFilters({ ...filters, property_subtype: v })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === v 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
            {filters.property_type === 'commercial' && [{v:'apartment_building',l:'Činžovní dům'},{v:'office',l:'Kancelář'},{v:'retail',l:'Obchod'},{v:'warehouse',l:'Sklad'},{v:'production',l:'Výroba'}].map(({v,l}) => (
              <button
                key={v}
                onClick={() => setFilters({ ...filters, property_subtype: v })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === v 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
            {filters.property_type === 'land' && [{v:'building_plot',l:'Stavební'},{v:'agricultural',l:'Zemědělský'},{v:'forest',l:'Les'},{v:'garden',l:'Zahrada'}].map(({v,l}) => (
              <button
                key={v}
                onClick={() => setFilters({ ...filters, property_subtype: v })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === v 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
            {filters.property_type === 'project' && [{v:'residential',l:'Bytový projekt'},{v:'commercial',l:'Komerční projekt'},{v:'mixed',l:'Smíšený projekt'},{v:'other',l:'Jiný'}].map(({v,l}) => (
              <button
                key={v}
                onClick={() => setFilters({ ...filters, property_subtype: v })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === v 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        )}
        
        {/* Další filtry a akce */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative" style={{width: '600px'}}>
              <input
                type="text"
                placeholder="Lokalita (město, vesnice)"
                value={filters.location_search}
                onChange={(e) => {
                  const value = e.target.value
                  setFilters({ ...filters, location_search: value })
                  if (!value) {
                    setSelectedLocation(null)
                    setLocationSuggestions([])
                    return
                  }
                  if (selectedLocation && selectedLocation.label !== value) {
                    setSelectedLocation(null)
                  }
                  searchLocations(value)
                }}
                onFocus={() => filters.location_search && filters.location_search.length >= 2 && searchLocations(filters.location_search)}
                className="glass-input w-full"
              />
              {locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFilters({ ...filters, location_search: suggestion.label })
                        setSelectedLocation(suggestion)
                        setLocationSuggestions([])
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/30 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">{suggestion.label}</span>
                        {(suggestion.district || suggestion.region) && (
                          <span className="text-xs text-gray-500">
                            {[suggestion.district, suggestion.region].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="number"
              placeholder="Cena od"
              value={filters.price_min}
              onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
              className="glass-input w-28"
            />
            <input
              type="number"
              placeholder="Cena do"
              value={filters.price_max}
              onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
              className="glass-input w-28"
            />
            <button
              onClick={() => {
                setFilters({ transaction_type: '', property_type: '', property_subtype: '', city: '', price_min: '', price_max: '', location_search: '', location_radius: '0' })
                setSelectedLocation(null)
                setLocationSuggestions([])
              }}
              className="px-4 py-2 rounded-xl hover:bg-white/30 transition-all text-sm font-medium whitespace-nowrap"
            >
              Zrušit filtry
            </button>
          </div>
          
          {/* Zobrazovací módy a přidat nabídku */}
          <div className="flex items-center gap-2">
            <div className="flex glass-card p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-white/30'
                }`}
                title="Mřížka"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-white/30'
                }`}
                title="Seznam"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'map' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-white/30'
                }`}
                title="Mapa"
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
            
            {(currentUser.role === 'admin' || currentUser.role === 'agent') && (
              <button
                onClick={onAdd}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                title="Přidat nabídku"
              >
                <span className="text-2xl font-light">+</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8 hidden">
        <div>
          <h1 className="text-4xl font-bold text-white">Nabídky nemovitostí</h1>
          {currentUser.role === 'agent' && (
            <p className="text-white/70 text-sm mt-2">Vaše nabídky budou po vytvoření čekat na schválení adminem</p>
          )}
          {currentUser.role === 'client' && (
            <p className="text-white/70 text-sm mt-2">Zobrazují se pouze nemovitosti odpovídající vašim poptávkám</p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex glass-card p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white/50 text-purple-700' : 'text-gray-600'}`}
              title="Dlaždice"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white/50 text-purple-700' : 'text-gray-600'}`}
              title="Seznam"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition ${viewMode === 'map' ? 'bg-white/50 text-purple-700' : 'text-gray-600'}`}
              title="Mapa"
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
          {(currentUser.role === 'admin' || currentUser.role === 'agent') && (
            <button onClick={onAdd} className="glass-button rounded-full">
              <Building className="w-4 h-4 inline mr-2" />
              Přidat nabídku
            </button>
          )}
        </div>
      </div>
      
{viewMode === 'map' ? (
        <div className="h-[600px] rounded-lg overflow-hidden">
          <PropertiesMap 
            properties={enrichedProperties}
            onPropertyClick={(property) => {
              setMapViewMode('map')
              setViewMode('hidden')
              onViewDetail(property)
            }}
          />
        </div>
      ) : viewMode === 'hidden' ? (
        <div className="h-[600px] rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Detail nemovitosti</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="properties-grid">
          {currentProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              currentUser={currentUser}
              presentation={property.presentation}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onGenerateCode={onGenerateCode}
              onApprove={onApprove}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {currentProperties.map(property => {
            const isMyProperty = property.agent_id === currentUser.id
            const hasLOI = property.has_loi === 1
            const hasContract = property.brokerage_contract_signed === 1
            const presentation = property.presentation

            return (
            <div key={property.id} className="glass-card hover:shadow-lg transition">
              <div className="flex gap-6">
                <div className="w-80 h-56 flex-shrink-0 rounded-lg overflow-hidden relative">
                  <img 
                    src={property.main_image} 
                    alt={property.title}
                    className="w-full h-full object-cover blur-sm"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Náhled</span>
                  </div>
                  
                  {/* Badgy */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {isMyProperty && (
                      <span className="badge bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        Moje
                      </span>
                    )}
                    {hasLOI && !isMyProperty && (
                      <span className="badge bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        LOI
                      </span>
                    )}
                    {hasContract && (
                      <span className="badge bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        Smlouva
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {presentation.headline}
                        </h3>
                        {presentation.secondary && (
                          <div className="flex items-center text-gray-600 mb-3">
                            <Building className="w-5 h-5 mr-2" />
                            <span className="text-lg truncate">{presentation.secondary}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-3xl font-bold text-gradient whitespace-nowrap ml-4">
                        {presentation.priceLabel}
                      </div>
                    </div>
                    
                    {presentation.list.details.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 text-gray-700 mb-4">
                        {presentation.list.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center text-sm bg-white/70 px-3 py-2 rounded-lg">
                            <span className="truncate">{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {presentation.list.highlights.map((badge, idx) => (
                        <span key={`highlight-${idx}`} className="badge bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {badge}
                        </span>
                      ))}
                      {presentation.list.location.map((loc, idx) => (
                        <span key={`loc-${idx}`} className="badge bg-blue-100 text-blue-700">{loc}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    {currentUser.role === 'admin' ? (
                      <>
                        <button 
                          onClick={() => onViewDetail(property)} 
                          className="glass-button-secondary rounded-full px-6"
                        >
                          Detail
                        </button>
                        <button 
                          onClick={() => onEdit(property)} 
                          className="glass-button-secondary p-3 rounded-full"
                          title="Upravit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onToggleStatus(property.id, property.status)} 
                          className="glass-button-secondary p-3 rounded-full"
                          title={property.status === 'active' ? 'Deaktivovat' : 'Aktivovat'}
                        >
                          {property.status === 'active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => onGenerateCode(property)} 
                        className="glass-button rounded-full px-8"
                      >
                        Požádat o přístup
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}
      
      {/* Stránkování */}
      {viewMode !== 'map' && viewMode !== 'hidden' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="glass-button-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Předchozí
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1
              // Zobrazit pouze stránky okolo aktuální
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'glass-button-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              } else if (
                pageNum === currentPage - 3 ||
                pageNum === currentPage + 3
              ) {
                return <span key={pageNum} className="px-2">...</span>
              }
              return null
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="glass-button-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Další
          </button>
          
          <span className="ml-4 text-sm text-gray-600">
            Stránka {currentPage} z {totalPages} ({filteredProperties.length} nabídek)
          </span>
        </div>
      )}
      
      {/* Modal pro přístupový kód */}
      {showAccessCodeModal && (
        <AccessCodeModal
          isOpen={showAccessCodeModal}
          onSubmit={handleAccessCodeSubmit}
          onClose={() => setShowAccessCodeModal(false)}
          entityType="property"
        />
      )}
    </div>
  )
}

function Demands({ demands, currentUser, onAdd, onEdit, onDelete, onViewDetail, onGenerateCode, onApprove }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [filters, setFilters] = useState({
    transaction_type: '',
    property_type: '',
    property_subtype: '',
    price_min: '',
    price_max: '',
    location_search: '',
    location_radius: '0',
    mine: false // Filtr pro "Moje poptávky"
  })
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false)
  const [selectedDemandForAccess, setSelectedDemandForAccess] = useState(null)
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ').format(price)
  }

  // Haversine formula pro výpočet vzdálenosti mezi GPS souřadnicemi
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Našeptávač lokalit
  const searchLocations = async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([])
      return
    }

    // Získat unikátní města z poptávek a z nové struktury locations
    const fromPreferred = demands.map(d => d.preferred_location).filter(Boolean)
    const fromLocations = demands
      .flatMap(d => Array.isArray(d.locations) ? d.locations : [])
      .map(loc => loc?.name || loc?.district || loc?.region)
      .filter(Boolean)

    const uniqueCities = [...new Set([...fromPreferred, ...fromLocations])]
    const matches = uniqueCities
      .filter(city => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)

    setLocationSuggestions(matches)
  }

  const filteredDemands = demands.filter(demand => {
    if (filters.transaction_type && demand.transaction_type !== filters.transaction_type) return false
    if (filters.property_type && demand.property_type !== filters.property_type) return false
    
    // Filtrování podle podtypu - pracujeme pouze s novou strukturou property_requirements
    if (filters.property_subtype) {
      const requirements = Array.isArray(demand.property_requirements) ? demand.property_requirements : []
      const hasSubtype = requirements.some(req => {
        const subtypes = req?.property_subtypes
        if (Array.isArray(subtypes)) {
          return subtypes.includes(filters.property_subtype)
        }
        if (typeof req?.property_subtype === 'string') {
          return req.property_subtype === filters.property_subtype
        }
        return false
      })
      if (!hasSubtype) return false
    }
    
    if (filters.price_min && demand.price_max < parseInt(filters.price_min)) return false
    if (filters.price_max && demand.price_min > parseInt(filters.price_max)) return false
    
    // Filtrování podle lokality - textové vyhledávání
    if (filters.location_search) {
      const query = filters.location_search.toLowerCase()
      const preferredMatch = demand.preferred_location && demand.preferred_location.toLowerCase().includes(query)
      const arrayMatch = Array.isArray(demand.locations) && demand.locations.some(loc => {
        const candidate = loc?.name || loc?.district || loc?.region
        return candidate ? candidate.toLowerCase().includes(query) : false
      })
      if (!preferredMatch && !arrayMatch) return false
    }
    
    // Filtr "Moje poptávky"
    if (filters.mine && Number(demand.client_id) !== Number(currentUser.id)) return false
    
    return true
  })

  // Stránkování
  const totalPages = Math.ceil(filteredDemands.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentDemands = filteredDemands.slice(indexOfFirstItem, indexOfLastItem)
  
  // Reset na první stránku při změně filtrů
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleAccessCodeSubmit = async (code) => {
    try {
      const response = await fetch(`${API_URL}/demands/${selectedDemandForAccess.id}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, user_id: currentUser.id })
      })
      if (response.ok) {
        onViewDetail(selectedDemandForAccess)
        setShowAccessCodeModal(false)
        return true
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Neplatný přístupový kód')
      }
    } catch (error) {
      throw error
    }
  }

  const isOwnDemand = (demand) => {
    return currentUser.role === 'client' && demand.client_id === currentUser.id
  }

  return (
    <div className="fade-in">
      {/* Header s filtry a akcemi */}
      <div className="glass-card mb-6 p-6">
        {/* Filtry - styl navigace */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(currentUser.role === 'client' || currentUser.role === 'admin') && (
            <>
              <button
                onClick={() => setFilters({ ...filters, mine: !filters.mine })}
                className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                  filters.mine
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                    : 'hover:bg-white/30'
                }`}
              >
                Moje poptávky
              </button>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
            </>
          )}
          
          <button
            onClick={() => setFilters({ ...filters, transaction_type: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.transaction_type === '' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Vše
          </button>
          <button
            onClick={() => setFilters({ ...filters, transaction_type: 'sale' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.transaction_type === 'sale' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Prodej
          </button>
          <button
            onClick={() => setFilters({ ...filters, transaction_type: 'rent' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.transaction_type === 'rent' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Pronájem
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          
          <button
            onClick={() => setFilters({ ...filters, property_type: '', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === '' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Všechny typy
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'flat', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'flat' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Byty
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'house', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'house' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Domy
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'commercial', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'commercial' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Komerční
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'land', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'land' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Pozemky
          </button>
          <button
            onClick={() => setFilters({ ...filters, property_type: 'project', property_subtype: '' })}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filters.property_type === 'project' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Projekty
          </button>
        </div>
        
        {/* Podtypy nemovitostí - dynamicky podle vybraného typu */}
        {filters.property_type && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Podtyp:</span>
            <button
              onClick={() => setFilters({ ...filters, property_subtype: '' })}
              className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                filters.property_subtype === '' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'hover:bg-white/30 text-gray-600'
              }`}
            >
              Všechny
            </button>
            {filters.property_type === 'flat' && ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', 'atypical'].map(subtype => (
              <button
                key={subtype}
                onClick={() => setFilters({ ...filters, property_subtype: subtype })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === subtype 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {subtype === 'atypical' ? 'Atypický' : subtype}
              </button>
            ))}
            {filters.property_type === 'house' && [{v:'family_house',l:'Rodinný dům'},{v:'villa',l:'Vila'},{v:'cottage',l:'Chalupa'},{v:'cabin',l:'Chata'}].map(({v,l}) => (
              <button
                key={v}
                onClick={() => setFilters({ ...filters, property_subtype: v })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === v 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
            {filters.property_type === 'commercial' && [{v:'apartment_building',l:'Činžovní dům'},{v:'office',l:'Kancelář'},{v:'retail',l:'Obchod'},{v:'warehouse',l:'Sklad'},{v:'production',l:'Výroba'}].map(({v,l}) => (
              <button
                key={v}
                onClick={() => setFilters({ ...filters, property_subtype: v })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === v 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
            {filters.property_type === 'land' && [{v:'building_plot',l:'Stavební'},{v:'agricultural',l:'Zemědělský'},{v:'forest',l:'Les'},{v:'garden',l:'Zahrada'}].map(({v,l}) => (
              <button
                key={v}
                onClick={() => setFilters({ ...filters, property_subtype: v })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === v 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
            {filters.property_type === 'project' && [{v:'residential',l:'Bytový projekt'},{v:'commercial',l:'Komerční projekt'},{v:'mixed',l:'Smíšený projekt'},{v:'other',l:'Jiný'}].map(({v,l}) => (
              <button
                key={v}
                onClick={() => setFilters({ ...filters, property_subtype: v })}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-medium ${
                  filters.property_subtype === v 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'hover:bg-white/30 text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        )}
        
        {/* Další filtry a akce */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative" style={{width: '600px'}}>
              <input
                type="text"
                placeholder="Lokalita (město, vesnice)"
                value={filters.location_search}
                onChange={(e) => {
                  setFilters({ ...filters, location_search: e.target.value })
                  searchLocations(e.target.value)
                }}
                onFocus={() => filters.location_search && searchLocations(filters.location_search)}
                className="glass-input w-full"
              />
              {locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 glass-card max-h-60 overflow-y-auto">
                  {locationSuggestions.map((city, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFilters({ ...filters, location_search: city })
                        setLocationSuggestions([])
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/30 transition-all"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="number"
              placeholder="Cena od"
              value={filters.price_min}
              onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
              className="glass-input w-28"
            />
            <input
              type="number"
              placeholder="Cena do"
              value={filters.price_max}
              onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
              className="glass-input w-28"
            />
            <button
              onClick={() => {
                setFilters({ transaction_type: '', property_type: '', price_min: '', price_max: '', location_search: '', location_radius: '0' })
                setSelectedLocation(null)
                setLocationSuggestions([])
              }}
              className="px-4 py-2 rounded-xl hover:bg-white/30 transition-all text-sm font-medium whitespace-nowrap"
            >
              Zrušit filtry
            </button>
          </div>
          
          {/* Tlačítko přidat poptávku */}
          {(currentUser.role === 'admin' || currentUser.role === 'agent' || currentUser.role === 'client') && (
            <button
              onClick={onAdd}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              title="Přidat poptávku"
            >
              <span className="text-2xl font-light">+</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-8 hidden">
        <div>
          <h1 className="text-4xl font-bold text-white">Poptávky</h1>
          {currentUser.role === 'agent' && (
            <p className="text-white/70 text-sm mt-2">Vaše poptávky budou po vytvoření čekat na schválení adminem</p>
          )}
          {currentUser.role === 'client' && (
            <p className="text-white/70 text-sm mt-2">Vaše poptávky budou po vytvoření čekat na schválení adminem</p>
          )}
        </div>
        {(currentUser.role === 'admin' || currentUser.role === 'agent' || currentUser.role === 'client') && (
          <button onClick={onAdd} className="glass-button rounded-full">
            <Search className="w-4 h-4 inline mr-2" />
            Vytvořit poptávku
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {currentDemands.map(demand => {
          const isOwn = isOwnDemand(demand)
          const canViewFull = currentUser.role === 'admin' || isOwn
          const hasLOI = demand.has_loi === 1
          const hasContract = demand.brokerage_contract_signed === 1
          
          return (
            <div key={demand.id} className="glass-card hover:shadow-lg transition relative">
              {/* Badgy v pravém horním rohu */}
              <div className="absolute top-4 right-4 flex gap-2">
                {isOwn && (
                  <span className="badge bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                    Moje
                  </span>
                )}
                {hasLOI && !isOwn && (
                  <span className="badge bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                    LOI
                  </span>
                )}
                {hasContract && (
                  <span className="badge bg-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                    Smlouva
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {LABELS_CS[demand.transaction_type]} • {LABELS_CS[demand.property_type]}
                      {demand.property_requirements && demand.property_requirements.length > 1 && (
                        <span className="text-sm text-purple-600 ml-2">
                          (+{demand.property_requirements.length - 1} dalších typů)
                        </span>
                      )}
                    </h3>
                    {canViewFull ? (
                      <span className="badge bg-purple-100 text-purple-700">
                        <User className="w-3.5 h-3.5" />
                        {demand.client_name}
                      </span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-600">
                        Anonymní klient
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-gray-600">
                    {/* Nová struktura s common_filters */}
                    {demand.common_filters?.price && (
                      <span>
                        Cena: {demand.common_filters.price.min ? formatPrice(demand.common_filters.price.min) : '0'} - {demand.common_filters.price.max ? formatPrice(demand.common_filters.price.max) : '∞'} Kč
                      </span>
                    )}
                    {/* Stará struktura - fallback */}
                    {!demand.common_filters?.price && demand.price_min && (
                      <span>Cena: {formatPrice(demand.price_min)} - {formatPrice(demand.price_max)} Kč</span>
                    )}
                    
                    {/* Zobrazit lokality z nové struktury */}
                    {canViewFull ? (
                      demand.locations && Array.isArray(demand.locations) && demand.locations.length > 0 ? (
                        <span>Lokality: {demand.locations.map(l => l.name).join(', ')}</span>
                      ) : demand.cities && Array.isArray(demand.cities) && demand.cities.length > 0 ? (
                        <span>Lokace: {demand.cities.join(', ')}</span>
                      ) : null
                    ) : (
                      <span>Lokace: Skryto</span>
                    )}
                    
                    {/* Zobrazit typy nemovitostí */}
                    {demand.property_requirements && demand.property_requirements.length > 0 && (
                      <span className="text-sm">
                        {demand.property_requirements.map((req, i) => {
                          const subtypes = req.property_subtypes || (req.property_subtype ? [req.property_subtype] : []);
                          return (
                            <span key={i}>
                              {i > 0 && ' | '}
                              {LABELS_CS[req.property_type]}
                              {subtypes.length > 0 && ` (${subtypes.join(', ')})`}
                            </span>
                          );
                        })}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {canViewFull ? (
                    <>
                      {currentUser.role === 'admin' && demand.status === 'pending_approval' && onApprove && (
                        <button 
                          onClick={() => onApprove(demand.id)} 
                          className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all text-sm font-medium"
                          title="Schválit poptávku"
                        >
                          Schválit
                        </button>
                      )}
                      <button 
                        onClick={() => onViewDetail(demand)} 
                        className="glass-button rounded-full"
                      >
                        Detail
                      </button>
                      {currentUser.role === 'admin' && (
                        <button 
                          onClick={() => onEdit(demand)} 
                          className="glass-button-secondary p-2 rounded-full"
                          title="Upravit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <button 
                      onClick={() => onGenerateCode(demand)} 
                      className="glass-button rounded-full"
                    >
                      Požádat o přístup
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Stránkování */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="glass-button-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Předchozí
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'glass-button-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              } else if (
                pageNum === currentPage - 3 ||
                pageNum === currentPage + 3
              ) {
                return <span key={pageNum} className="px-2">...</span>
              }
              return null
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="glass-button-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Další
          </button>
          
          <span className="ml-4 text-sm text-gray-600">
            Stránka {currentPage} z {totalPages} ({filteredDemands.length} poptávek)
          </span>
        </div>
      )}
      
      {/* Modal pro přístupový kód */}
      {showAccessCodeModal && (
        <AccessCodeModal
          isOpen={showAccessCodeModal}
          onSubmit={handleAccessCodeSubmit}
          onClose={() => setShowAccessCodeModal(false)}
          entityType="demand"
        />
      )}
    </div>
  )
}

function UsersPage({ users, onAdd, onEdit, onDelete, onViewDetail }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  return (
    <div className="fade-in">
      <div className="glass-card mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Uživatelé</h3>
            <p className="text-sm text-gray-600 mt-1">{users.length} uživatelů</p>
          </div>
          <button 
            onClick={onAdd} 
            className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            title="Přidat uživatele"
          >
            <span className="text-2xl font-light">+</span>
          </button>
        </div>

        {/* Vyhledávání a filtry */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Hledat podle jména, emailu, společnosti nebo města..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                roleFilter === 'all' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                  : 'hover:bg-white/30'
              }`}
            >
              Vše
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                roleFilter === 'admin' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                  : 'hover:bg-white/30'
              }`}
            >
              Admini
            </button>
            <button
              onClick={() => setRoleFilter('agent')}
              className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                roleFilter === 'agent' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                  : 'hover:bg-white/30'
              }`}
            >
              Agenti
            </button>
            <button
              onClick={() => setRoleFilter('client')}
              className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
                roleFilter === 'client' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                  : 'hover:bg-white/30'
              }`}
            >
              Klienti
            </button>
          </div>
        </div>
      </div>
      
      <div className="glass-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Jméno</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Společnost</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefon</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Město</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Akce</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-white/30 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-neutral-600" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{user.email}</td>
                <td className="py-3 px-4">
                  <span className="badge bg-purple-100 text-purple-700">
                    {LABELS_CS[user.role]}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">{user.company_name || '-'}</td>
                <td className="py-3 px-4 text-gray-600">{user.phone}</td>
                <td className="py-3 px-4 text-gray-600">{user.address_city}</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onViewDetail(user)} 
                      className="glass-button-secondary text-sm px-3 py-1 rounded-full"
                    >
                      Detail
                    </button>
                    <button 
                      onClick={() => onEdit(user)} 
                      className="glass-button-secondary p-2 rounded-full"
                      title="Upravit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PropertyModal({ property, users, onSave, onClose, currentUser }) {
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    transaction_type: property?.transaction_type || 'sale',
    property_type: property?.property_type || 'flat',
    property_subtype: property?.property_subtype || '2+kk',
    price: property?.price || '',
    price_currency: property?.price_currency || 'CZK',
    price_unit: property?.price_unit || 'total',
    price_on_request: property?.price_on_request || 0,
    price_note: property?.price_note || '',
    city: property?.city || '',
    district: property?.district || '',
    street: property?.street || '',
    zip_code: property?.zip_code || '',
    latitude: property?.latitude || '',
    longitude: property?.longitude || '',
    area: property?.area || '',
    land_area: property?.land_area || '',
    rooms: property?.rooms || '',
    floor: property?.floor || '',
    total_floors: property?.total_floors || '',
    building_type: property?.building_type || 'brick',
    building_condition: property?.building_condition || 'good',
    ownership: property?.ownership || 'personal',
    furnished: property?.furnished || 'not_furnished',
    has_balcony: property?.has_balcony || 0,
    has_loggia: property?.has_loggia || 0,
    has_terrace: property?.has_terrace || 0,
    has_cellar: property?.has_cellar || 0,
    has_garage: property?.has_garage || 0,
    has_parking: property?.has_parking || 0,
    has_elevator: property?.has_elevator || 0,
    has_garden: property?.has_garden || 0,
    has_pool: property?.has_pool || 0,
    is_auction: property?.is_auction || 0,
    exclusively_at_rk: property?.exclusively_at_rk || 0,
    attractive_offer: property?.attractive_offer || 0,
    energy_rating: property?.energy_rating || '',
    heating_type: property?.heating_type || '',
    agent_id: property?.agent_id || (currentUser?.role === 'agent' || currentUser?.role === 'admin' ? currentUser.id : ''),
    status: property?.status || 'active',
    images: property?.images || [],
    main_image: property?.main_image || '',
    documents: Array.isArray(property?.documents) ? property.documents : (property?.documents ? JSON.parse(property.documents) : []),
    video_url: property?.video_url || '',
    video_tour_url: property?.video_tour_url || '',
    matterport_url: property?.matterport_url || '',
    website_url: property?.website_url || '',
    validity_days: property?.validity_days || 14,
    commission_type: property?.commission_type || 'percent',
    commission_value: property?.commission_value || '',
    commission_currency: property?.commission_currency || property?.price_currency || 'CZK',
    commission_payer: property?.commission_payer || 'seller',
    commission_vat: property?.commission_vat || 'bez DPH',
    commission_terms: property?.commission_terms || '',
    commission_rate: property?.commission_rate || '',
    commission_base_amount: property?.commission_base_amount || '',
    contract_signed_at: property?.contract_signed_at || ''
  })
  
  const [uploading, setUploading] = useState(false)
  const [uploadingDocs, setUploadingDocs] = useState(false)

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      for (let i = 0; i < files.length; i++) {
        formDataUpload.append('images', files[i])
      }

      const response = await fetch(`${API_URL}/upload/properties`, {
        method: 'POST',
        body: formDataUpload
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Přidat nahrané obrázky do galerie
        setFormData({ ...formData, images: [...formData.images, ...data.images] })
        
        // Pokud není hlavní obrázek, nastavit první nahraný
        if (!formData.main_image && data.images.length > 0) {
          setFormData({ ...formData, main_image: data.images[0], images: [...formData.images, ...data.images] })
        }
        
        alert(`Úspěšně nahráno ${data.count} obrázků`)
      } else {
        alert('Chyba při nahrávání: ' + data.error)
      }
    } catch (error) {
      console.error('Chyba při uploadu:', error)
      alert('Chyba při nahrávání obrázků')
    } finally {
      setUploading(false)
      e.target.value = '' // Reset input
    }
  }

  const handleDocumentUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingDocs(true)
    try {
      const formDataUpload = new FormData()
      for (let i = 0; i < files.length; i++) {
        formDataUpload.append('documents', files[i])
      }

      const response = await fetch(`${API_URL}/upload/documents`, {
        method: 'POST',
        body: formDataUpload
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Přidat nahrané dokumenty
        setFormData({ ...formData, documents: [...formData.documents, ...data.documents] })
        alert(`Úspěšně nahráno ${data.count} dokumentů`)
      } else {
        alert('Chyba při nahrávání: ' + data.error)
      }
    } catch (error) {
      console.error('Chyba při uploadu dokumentů:', error)
      alert('Chyba při nahrávání dokumentů: ' + error.message)
    } finally {
      setUploadingDocs(false)
      e.target.value = '' // Reset input
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gradient mb-6">
          {property ? 'Upravit nabídku' : 'Přidat nabídku'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Základní informace */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Základní informace</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Název</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="glass-input"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typ transakce</label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                  className="glass-input"
                >
                  <option value="sale">Prodej</option>
                  <option value="rent">Pronájem</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typ nemovitosti</label>
                <select
                  value={formData.property_type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    // Automaticky nastavit správný defaultní podtyp podle typu nemovitosti
                    let defaultSubtype = '2+kk';
                    if (newType === 'house') defaultSubtype = 'family_house';
                    if (newType === 'commercial') defaultSubtype = 'office';
                    if (newType === 'land') defaultSubtype = 'building_plot';
                    if (newType === 'project') defaultSubtype = 'residential';
                    setFormData({ ...formData, property_type: newType, property_subtype: defaultSubtype });
                  }}
                  className="glass-input"
                >
                  <option value="flat">Byt</option>
                  <option value="house">Dům</option>
                  <option value="commercial">Komerční</option>
                  <option value="land">Pozemek</option>
                  <option value="project">Projekt</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.property_type === 'flat' && 'Dispozice'}
                  {formData.property_type === 'house' && 'Typ domu'}
                  {formData.property_type === 'commercial' && 'Typ komerční nemovitosti'}
                  {formData.property_type === 'land' && 'Typ pozemku'}
                  {formData.property_type === 'project' && 'Typ projektu'}
                </label>
                <select
                  value={formData.property_subtype}
                  onChange={(e) => setFormData({ ...formData, property_subtype: e.target.value })}
                  className="glass-input"
                >
                  {formData.property_type === 'flat' && (
                    <>
                      <option value="1+kk">1+kk</option>
                      <option value="1+1">1+1</option>
                      <option value="2+kk">2+kk</option>
                      <option value="2+1">2+1</option>
                      <option value="3+kk">3+kk</option>
                      <option value="3+1">3+1</option>
                      <option value="4+kk">4+kk</option>
                      <option value="4+1">4+1</option>
                      <option value="5+kk">5+kk</option>
                      <option value="5+1">5+1</option>
                      <option value="6+kk">6+kk</option>
                      <option value="6+1">6+1</option>
                      <option value="atypical">Atypický</option>
                      <option value="other">Jiný</option>
                    </>
                  )}
                  {formData.property_type === 'house' && (
                    <>
                      <option value="family_house">Rodinný dům</option>
                      <option value="villa">Vila</option>
                      <option value="cottage">Chalupa</option>
                      <option value="cabin">Chata</option>
                      <option value="farmhouse">Zemědělská usedlost</option>
                      <option value="mobile_home">Mobilní dům</option>
                      <option value="other">Jiný</option>
                    </>
                  )}
                  {formData.property_type === 'commercial' && (
                    <>
                      <option value="apartment_building">Činžovní dům</option>
                      <option value="office">Kancelář</option>
                      <option value="retail">Obchod</option>
                      <option value="warehouse">Sklad</option>
                      <option value="production">Výroba</option>
                      <option value="restaurant">Restaurace</option>
                      <option value="accommodation">Ubytování</option>
                      <option value="agricultural">Zemědělský objekt</option>
                      <option value="garage">Garáž</option>
                      <option value="other">Jiný</option>
                    </>
                  )}
                  {formData.property_type === 'land' && (
                    <>
                      <option value="building_plot">Stavební parcela</option>
                      <option value="agricultural">Zemědělský</option>
                      <option value="forest">Les</option>
                      <option value="garden">Zahrada</option>
                      <option value="orchard">Sad</option>
                      <option value="meadow">Louka</option>
                      <option value="pond">Rybník</option>
                      <option value="other">Jiný</option>
                    </>
                  )}
                  {formData.property_type === 'project' && (
                    <>
                      <option value="residential">Bytový projekt</option>
                      <option value="commercial">Komerční projekt</option>
                      <option value="mixed">Smíšený projekt</option>
                      <option value="other">Jiný projekt</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cena</label>
                <input
                  type="number"
                  required={!formData.price_on_request}
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="glass-input"
                  disabled={formData.price_on_request}
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <select
                    value={formData.price_currency}
                    onChange={(e) => setFormData({ ...formData, price_currency: e.target.value })}
                    className="glass-input"
                  >
                    <option value="CZK">CZK</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="BTC">BTC</option>
                  </select>
                  <select
                    value={formData.price_unit}
                    onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                    className="glass-input"
                  >
                    <option value="total">Celková cena</option>
                    <option value="per_m2">Cena / m²</option>
                    <option value="per_m2_month">Cena / m² / měsíc</option>
                    <option value="per_unit">Cena / jednotku</option>
                    <option value="per_unit_month">Cena / jednotku / měsíc</option>
                  </select>
                </div>
                <label className="flex items-center mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.price_on_request || false}
                    onChange={(e) => setFormData({ ...formData, price_on_request: e.target.checked ? 1 : 0, price: e.target.checked ? '' : formData.price })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Cena po podpisu LOI</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platnost nabídky</label>
                <select
                  value={formData.validity_days}
                  onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) })}
                  className="glass-input"
                >
                  <option value="14">14 dní</option>
                  <option value="30">30 dní</option>
                  <option value="60">60 dní</option>
                  <option value="0">Stále (bez omezení)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Po vypršení bude potřeba potvrdit aktuálnost.</p>
              </div>
            </div>
          </div>

          {/* Lokace */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Lokace</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Město</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="glass-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Okres</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="glass-input"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  <span className="text-gradient text-lg">Ulice a číslo popisné</span>
                  <span className="block text-xs text-gray-500 mt-1 font-normal">
                    Inteligentní našeptávač - automaticky vyplní město, PSČ a GPS souřadnice
                  </span>
                </label>
                <AddressSuggest
                  value={formData.street}
                  onChange={(address, details) => {
                    console.log('Address details:', details) // Debug
                    setFormData({
                      ...formData,
                      street: details?.street || address,
                      city: details?.city || formData.city,
                      district: details?.district || formData.district,
                      zip_code: details?.zip || formData.zip_code,
                      latitude: details?.latitude || formData.latitude,
                      longitude: details?.longitude || formData.longitude
                    })
                  }}
                  placeholder="Začněte psát adresu... (např. Václavské náměstí 1, Praha)"
                  className="glass-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PSČ</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="glass-input"
                  placeholder="110 00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPS - Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="glass-input"
                  placeholder="Vyplní se automaticky"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPS - Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="glass-input"
                  placeholder="Vyplní se automaticky"
                />
              </div>
            </div>
          </div>

          {/* Parametry - skrýt pro projekty */}
          {formData.property_type !== 'project' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Parametry</h3>
              <div className="grid grid-cols-4 gap-4">
                {/* Plocha - pro všechny typy kromě pozemků */}
                {formData.property_type !== 'land' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plocha {formData.property_type === 'flat' ? 'bytu' : formData.property_type === 'house' ? 'domu' : 'objektu'} (m²)
                    </label>
                    <input
                      type="number"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                )}
              
              {/* Plocha pozemku - pro domy a pozemky */}
              {(formData.property_type === 'house' || formData.property_type === 'land') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plocha pozemku (m²)</label>
                  <input
                    type="number"
                    value={formData.land_area}
                    onChange={(e) => setFormData({ ...formData, land_area: e.target.value })}
                    className="glass-input"
                  />
                </div>
              )}
              
              {/* Pokoje - pro byty a domy */}
              {(formData.property_type === 'flat' || formData.property_type === 'house') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Počet pokojů</label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    className="glass-input"
                  />
                </div>
              )}
              
              {/* Patro - pouze pro byty a komerční (kromě garáží) */}
              {(formData.property_type === 'flat' || 
                (formData.property_type === 'commercial' && formData.property_subtype !== 'garage')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patro</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="glass-input"
                  />
                </div>
              )}
              
              {/* Celkem pater - pro byty, domy a komerční (kromě garáží a zemědělských) */}
              {(formData.property_type === 'flat' || 
                formData.property_type === 'house' ||
                (formData.property_type === 'commercial' && 
                 formData.property_subtype !== 'garage' && 
                 formData.property_subtype !== 'agricultural')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.property_type === 'flat' ? 'Pater v domě' : 'Počet podlaží'}
                  </label>
                  <input
                    type="number"
                    value={formData.total_floors}
                    onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
                    className="glass-input"
                  />
                </div>
              )}
            </div>
            </div>
          )}

          {/* Vlastnosti - pouze pokud není pozemek ani projekt */}
          {formData.property_type !== 'land' && formData.property_type !== 'project' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Vlastnosti</h3>
              <div className="grid grid-cols-3 gap-4">
                {/* Balkon - pouze pro byty */}
                {formData.property_type === 'flat' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_balcony}
                      onChange={(e) => setFormData({ ...formData, has_balcony: e.target.checked ? 1 : 0 })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Balkon</span>
                  </label>
                )}
                
                {/* Lodžie - pouze pro byty */}
                {formData.property_type === 'flat' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_loggia}
                      onChange={(e) => setFormData({ ...formData, has_loggia: e.target.checked ? 1 : 0 })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Lodžie</span>
                  </label>
                )}
                
                {/* Výtah - pro byty a komerční */}
                {(formData.property_type === 'flat' || formData.property_type === 'commercial') && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_elevator}
                      onChange={(e) => setFormData({ ...formData, has_elevator: e.target.checked ? 1 : 0 })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Výtah</span>
                  </label>
                )}
                
                {/* Parkování - pro všechny kromě pozemků */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.has_parking}
                    onChange={(e) => setFormData({ ...formData, has_parking: e.target.checked ? 1 : 0 })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Parkování</span>
                </label>
                
                {/* Terasa - pro byty, domy a restaurace */}
                {(formData.property_type === 'flat' || 
                  formData.property_type === 'house' || 
                  (formData.property_type === 'commercial' && formData.property_subtype === 'restaurant')) && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_terrace}
                      onChange={(e) => setFormData({ ...formData, has_terrace: e.target.checked ? 1 : 0 })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Terasa{formData.property_type === 'commercial' ? ' / Venkovní posezení' : ''}</span>
                  </label>
                )}
                
                {/* Sklep - pro byty, domy a komerční */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.has_cellar}
                    onChange={(e) => setFormData({ ...formData, has_cellar: e.target.checked ? 1 : 0 })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Sklep</span>
                </label>
                
                {/* Garáž - pro domy */}
                {formData.property_type === 'house' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_garage}
                      onChange={(e) => setFormData({ ...formData, has_garage: e.target.checked ? 1 : 0 })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Garáž</span>
                  </label>
                )}
                
                {/* Zahrada - pro domy */}
                {formData.property_type === 'house' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_garden}
                      onChange={(e) => setFormData({ ...formData, has_garden: e.target.checked ? 1 : 0 })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Zahrada</span>
                  </label>
                )}
                
                {/* Bazén - pro domy */}
                {formData.property_type === 'house' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_pool}
                      onChange={(e) => setFormData({ ...formData, has_pool: e.target.checked ? 1 : 0 })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Bazén</span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Další vlastnosti - pouze pro byty, domy a komerční */}
          {formData.property_type !== 'land' && formData.property_type !== 'project' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Další vlastnosti</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typ stavby</label>
                  <select
                    value={formData.building_type}
                    onChange={(e) => setFormData({ ...formData, building_type: e.target.value })}
                    className="glass-input"
                  >
                    <option value="">Vyberte</option>
                    <option value="brick">Cihlová</option>
                    <option value="panel">Panelová</option>
                    <option value="wood">Dřevěná</option>
                    <option value="stone">Kamenná</option>
                    <option value="mixed">Smíšená</option>
                    <option value="monolithic">Monolitická</option>
                    <option value="skeleton">Skeletová</option>
                    <option value="other">Jiná</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stav stavby</label>
                  <select
                    value={formData.building_condition}
                    onChange={(e) => setFormData({ ...formData, building_condition: e.target.value })}
                    className="glass-input"
                  >
                    <option value="">Vyberte</option>
                    <option value="new_building">Novostavba</option>
                    <option value="very_good">Velmi dobrý</option>
                    <option value="good">Dobrý</option>
                    <option value="after_reconstruction">Po rekonstrukci</option>
                    <option value="before_reconstruction">Před rekonstrukcí</option>
                    <option value="in_construction">Ve výstavbě</option>
                    <option value="project">Projekt</option>
                    <option value="demolished">K demolici</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vlastnictví</label>
                  <select
                    value={formData.ownership}
                    onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                    className="glass-input"
                  >
                    <option value="">Vyberte</option>
                    <option value="personal">Osobní</option>
                    <option value="cooperative">Družstevní</option>
                    <option value="state">Státní</option>
                    <option value="church">Církevní</option>
                    <option value="transferred">Převedené</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vybavení</label>
                  <select
                    value={formData.furnished}
                    onChange={(e) => setFormData({ ...formData, furnished: e.target.value })}
                    className="glass-input"
                  >
                    <option value="not_furnished">Nevybaveno</option>
                    <option value="partly_furnished">Částečně vybaveno</option>
                    <option value="furnished">Vybaveno</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energetická třída</label>
                  <select
                    value={formData.energy_rating}
                    onChange={(e) => setFormData({ ...formData, energy_rating: e.target.value })}
                    className="glass-input"
                  >
                    <option value="">Vyberte</option>
                    <option value="A">A - Velmi úsporná</option>
                    <option value="B">B - Úsporná</option>
                    <option value="C">C - Vyhovující</option>
                    <option value="D">D - Nevyhovující</option>
                    <option value="E">E - Nehospodárná</option>
                    <option value="F">F - Velmi nehospodárná</option>
                    <option value="G">G - Mimořádně nehospodárná</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typ vytápění</label>
                  <select
                    value={formData.heating_type}
                    onChange={(e) => setFormData({ ...formData, heating_type: e.target.value })}
                    className="glass-input"
                  >
                    <option value="">Vyberte</option>
                    <option value="gas">Plynové</option>
                    <option value="electric">Elektrické</option>
                    <option value="central">Ústřední</option>
                    <option value="heat_pump">Tepelné čerpadlo</option>
                    <option value="solid_fuel">Tuhá paliva</option>
                    <option value="other">Jiné</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL webu nemovitosti</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="glass-input"
                    placeholder="https://..."
                  />
                </div>
                
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Speciální označení</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_auction}
                        onChange={(e) => setFormData({ ...formData, is_auction: e.target.checked ? 1 : 0 })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Dražba</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.exclusively_at_rk}
                        onChange={(e) => setFormData({ ...formData, exclusively_at_rk: e.target.checked ? 1 : 0 })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Exkluzivně v RK</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.attractive_offer}
                        onChange={(e) => setFormData({ ...formData, attractive_offer: e.target.checked ? 1 : 0 })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Atraktivní nabídka</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Provize a spolupráce */}
          <div className="space-y-4">
            <div className="glass-card p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Provize a podmínky spolupráce</h3>
              <p className="text-sm text-gray-700">
                Zadejte hodnoty, které máte s klientem dohodnuté. Provize slouží jako podklad pro zprostředkovatelskou smlouvu –
                po schválení z ní administrátor vypočítá odměnu portálu Estate Private (typicky 25&nbsp;% až 50&nbsp;% z celkové provize).
                Přesné a odsouhlasené údaje urychlí přípravu smlouvy i vyúčtování.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typ provize</label>
                <select
                  value={formData.commission_type}
                  onChange={(e) => setFormData({ ...formData, commission_type: e.target.value })}
                  className="glass-input"
                  required
                >
                  <option value="percent">Procento z ceny</option>
                  <option value="amount">Pevná částka</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.commission_type === 'amount' ? 'Výše provize' : 'Provize v %'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.commission_value}
                  onChange={(e) => setFormData({ ...formData, commission_value: e.target.value })}
                  className="glass-input"
                  required
                />
              </div>

              {formData.commission_type === 'amount' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Měna provize</label>
                  <select
                    value={formData.commission_currency}
                    onChange={(e) => setFormData({ ...formData, commission_currency: e.target.value })}
                    className="glass-input"
                  >
                    <option value="CZK">CZK</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provizi hradí</label>
                <select
                  value={formData.commission_payer}
                  onChange={(e) => setFormData({ ...formData, commission_payer: e.target.value })}
                  className="glass-input"
                >
                  <option value="seller">Prodávající</option>
                  <option value="buyer">Kupující</option>
                  <option value="both">Obě strany</option>
                  <option value="other">Jiná dohoda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Režim DPH</label>
                <select
                  value={formData.commission_vat}
                  onChange={(e) => setFormData({ ...formData, commission_vat: e.target.value })}
                  className="glass-input"
                >
                  <option value="bez DPH">Bez DPH</option>
                  <option value="včetně DPH">Včetně DPH</option>
                  <option value="+ DPH">+ DPH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Výsledná sazba (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                  className="glass-input"
                  placeholder="Automaticky vypočteno nebo zadejte ručně"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Základ pro výpočet</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.commission_base_amount}
                  onChange={(e) => setFormData({ ...formData, commission_base_amount: e.target.value })}
                  className="glass-input"
                  placeholder="Celková cena transakce"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Podmínky provize</label>
                <textarea
                  rows="3"
                  value={formData.commission_terms}
                  onChange={(e) => setFormData({ ...formData, commission_terms: e.target.value })}
                  className="glass-input"
                  placeholder="Např. datum splatnosti, navazující služby, speciální podmínky..."
                />
              </div>
            </div>
          </div>

          {/* Fotografie */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Fotografie</h3>
            
            <div className="space-y-4">
              {/* Upload tlačítko */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nahrát fotografie
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div style={{
                      border: '2px dashed #d1d5db',
                      borderRadius: '0.5rem',
                      padding: '2rem',
                      textAlign: 'center',
                      background: uploading ? '#f3f4f6' : 'white',
                      transition: 'all 0.2s'
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.currentTarget.style.borderColor = '#667eea'
                      e.currentTarget.style.background = '#f0f9ff'
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db'
                      e.currentTarget.style.background = 'white'
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.style.borderColor = '#d1d5db'
                      e.currentTarget.style.background = 'white'
                      const files = e.dataTransfer.files
                      if (files.length > 0) {
                        handleFileUpload({ target: { files } })
                      }
                    }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                      {uploading ? (
                        <>
                          <Upload className="w-12 h-12 mx-auto mb-2 text-neutral-400 animate-pulse" />
                          <p style={{ color: '#6b7280' }}>Nahrávám fotografie...</p>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
                          <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            Klikněte nebo přetáhněte fotografie
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Podporované formáty: JPG, PNG, WEBP
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                            Automatická komprese na max 1920x1080px
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Galerie fotek */}
              {formData.images.length > 0 && (
                <div className="space-y-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="text-sm font-medium text-gray-700">
                      Galerie ({formData.images.length} {formData.images.length === 1 ? 'fotka' : formData.images.length < 5 ? 'fotky' : 'fotek'})
                    </p>
                    {formData.main_image && (
                      <span className="badge badge-info">
                        Hlavní fotka nastavena
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="relative group"
                        style={{
                          border: formData.main_image === img ? '3px solid #667eea' : '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                          background: 'white'
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`Foto ${idx + 1}`} 
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover'
                          }}
                        />
                        
                        {/* Overlay s akcemi */}
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        }}
                        className="group-hover:opacity-100"
                        >
                          {formData.main_image !== img && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, main_image: img })
                              }}
                              style={{
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Nastavit jako hlavní
                            </button>
                          )}
                          {formData.main_image === img && (
                            <span style={{
                              background: '#10b981',
                              color: 'white',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              ✓ Hlavní fotka
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== idx)
                              setFormData({ 
                                ...formData, 
                                images: newImages,
                                main_image: formData.main_image === img ? (newImages[0] || '') : formData.main_image
                              })
                            }}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            Smazat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.images.length === 0 && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  color: '#92400e'
                }}>
                  Doporučujeme nahrát alespoň 3-5 fotografií nemovitosti
                </div>
              )}
            </div>
          </div>

          {/* Dokumenty */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Dokumenty
            </h3>
            
            <div className="space-y-4">
              {/* Upload dokumentů */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nahrát dokumenty (půdorysy, PENB, smlouvy, atd.)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div style={{
                      border: '2px dashed #d1d5db',
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      textAlign: 'center',
                      background: uploadingDocs ? '#f3f4f6' : 'white',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        multiple
                        onChange={handleDocumentUpload}
                        disabled={uploadingDocs}
                        style={{ display: 'none' }}
                      />
                      {uploadingDocs ? (
                        <>
                          <Upload className="w-10 h-10 mx-auto mb-2 text-neutral-400 animate-pulse" />
                          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Nahrávám dokumenty...</p>
                        </>
                      ) : (
                        <>
                          <FileText className="w-10 h-10 mx-auto mb-2 text-neutral-400" />
                          <p style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                            Klikněte pro výběr dokumentů
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            PDF, DOC, JPG, PNG (max 10MB/soubor)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Seznam dokumentů */}
              {Array.isArray(formData.documents) && formData.documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Nahrané dokumenty ({formData.documents.length})
                  </p>
                  <div className="space-y-2">
                    {formData.documents.map((doc, idx) => {
                      const fileName = doc.split('/').pop()
                      const fileExt = fileName.split('.').pop().toUpperCase()
                      const getIcon = (ext) => {
                        if (ext === 'PDF') return <FileText className="w-5 h-5 text-red-500" />
                        if (['JPG', 'JPEG', 'PNG', 'WEBP'].includes(ext)) return <ImageIcon className="w-5 h-5 text-blue-500" />
                        if (['DOC', 'DOCX'].includes(ext)) return <FileText className="w-5 h-5 text-blue-600" />
                        return <FileText className="w-5 h-5 text-neutral-500" />
                      }
                      
                      return (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            <div>{getIcon(fileExt)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ 
                                fontSize: '0.875rem', 
                                fontWeight: '500',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {fileName}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {fileExt}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <a
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#eff6ff',
                                color: '#3b82f6',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textDecoration: 'none'
                              }}
                            >
                              Zobrazit
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ 
                                  ...formData, 
                                  documents: formData.documents.filter((_, i) => i !== idx)
                                })
                              }}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Smazat
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {formData.documents.length === 0 && (
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #3b82f6',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#1e40af'
                }}>
                  Tip: Nahrajte půdorysy, energetický štítek (PENB), nebo další dokumenty
                </div>
              )}
            </div>
          </div>

          {/* Video a 3D prohlídka */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="icon-circle icon-circle-sm bg-red-100 text-red-600">
                <Play className="w-4 h-4" />
              </div>
              Video a 3D prohlídka
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL videa (YouTube, Vimeo)</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="glass-input"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL virtuální prohlídky</label>
                <input
                  type="url"
                  value={formData.video_tour_url}
                  onChange={(e) => setFormData({ ...formData, video_tour_url: e.target.value })}
                  className="glass-input"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL Matterport 3D prohlídky</label>
                <input
                  type="url"
                  value={formData.matterport_url}
                  onChange={(e) => setFormData({ ...formData, matterport_url: e.target.value })}
                  className="glass-input"
                  placeholder="https://my.matterport.com/show/?m=..."
                />
              </div>
            </div>
          </div>

          {/* Agent a stav */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
              {currentUser.role === 'agent' ? (
                // Agent vidí jen sebe
                <input
                  type="text"
                  value={currentUser.name}
                  disabled
                  className="glass-input bg-gray-100"
                />
              ) : currentUser.role === 'admin' ? (
                // Admin může vybrat sebe nebo jiného agenta
                <select
                  required
                  value={formData.agent_id}
                  onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                  className="glass-input"
                >
                  <option value="">Vyberte agenta</option>
                  <option value={currentUser.id}>{currentUser.name} (Já)</option>
                  {users.filter(u => u.id !== currentUser.id).map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              ) : (
                // Fallback
                <select
                  required
                  value={formData.agent_id}
                  onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                  className="glass-input"
                >
                  <option value="">Vyberte agenta</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stav</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="glass-input"
              >
                <option value="active">Aktivní</option>
                <option value="reserved">Rezervováno</option>
                <option value="sold">Prodáno</option>
                <option value="archived">Archivováno</option>
              </select>
            </div>
          </div>

          {/* Tlačítka */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="glass-button-secondary flex-1 rounded-full"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="glass-button flex-1 rounded-full"
            >
              {property ? 'Uložit změny' : 'Přidat nabídku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DemandModal({ demand, users, onSave, onClose, currentUser }) {
  // Nová flexibilní struktura
  const [propertyRequirements, setPropertyRequirements] = useState(
    Array.isArray(demand?.property_requirements) && demand.property_requirements.length > 0
      ? demand.property_requirements.map(req => ({
          ...req,
          // Migrace ze starého formátu (property_subtype) na nový (property_subtypes)
          property_subtypes: req.property_subtypes || (req.property_subtype ? [req.property_subtype] : [])
        }))
      : [
          {
            transaction_type: 'sale',
            property_type: 'flat',
            property_subtypes: [],
            filters: {}
          }
        ]
  )
  
  const [commonFilters, setCommonFilters] = useState({
    price: {
      min: demand?.common_filters?.price?.min ?? '',
      max: demand?.common_filters?.price?.max ?? ''
    }
  })
  
  const [locations, setLocations] = useState(
    Array.isArray(demand?.locations) ? demand.locations : []
  )
  
  const [formData, setFormData] = useState({
    client_id: demand?.client_id || currentUser.id,
    status: demand?.status || 'active',
    email_notifications: demand?.email_notifications !== undefined ? demand.email_notifications : 1,
    validity_days: demand?.validity_days || 30,
    commission_type: demand?.commission_type || 'percent',
    commission_value: demand?.commission_value || '',
    commission_currency: demand?.commission_currency || 'CZK',
    commission_payer: demand?.commission_payer || 'buyer',
    commission_vat: demand?.commission_vat || 'bez DPH',
    commission_rate: demand?.commission_rate || '',
    commission_base_amount: demand?.commission_base_amount || '',
    commission_terms: demand?.commission_terms || ''
  })

  // Přidat novou konfiguraci typu nemovitosti
  const addPropertyRequirement = () => {
    // Použít stejný typ transakce jako první požadavek
    const transactionType = propertyRequirements[0]?.transaction_type || 'sale';
    
    setPropertyRequirements([
      ...propertyRequirements,
      {
        transaction_type: transactionType,
        property_type: 'flat',
        property_subtype: '2+kk',
        filters: {}
      }
    ])
  }

  // Odstranit konfiguraci
  const removePropertyRequirement = (index) => {
    if (propertyRequirements.length > 1) {
      setPropertyRequirements(propertyRequirements.filter((_, i) => i !== index))
    }
  }

  // Aktualizovat konfiguraci
  const updatePropertyRequirement = (index, field, value) => {
    const updated = [...propertyRequirements]
    
    // Pokud se mění typ transakce, změnit u všech požadavků
    if (field === 'transaction_type') {
      updated.forEach(req => {
        req.transaction_type = value
      })
    } else if (field.includes('.')) {
      const parts = field.split('.')
      if (parts.length === 3) {
        // filters.rooms.min
        const [parent, child, grandchild] = parts
        updated[index][parent] = {
          ...updated[index][parent],
          [child]: {
            ...(updated[index][parent]?.[child] || {}),
            [grandchild]: value
          }
        }
      } else {
        // parent.child
        const [parent, child] = parts
        updated[index][parent] = { ...updated[index][parent], [child]: value }
      }
    } else {
      updated[index][field] = value
    }
    setPropertyRequirements(updated)
  }


  const handleSubmit = (e) => {
    e.preventDefault()
    
    const data = {
      ...formData,
      property_requirements: propertyRequirements,
      common_filters: {
        price: commonFilters.price
      },
      locations: locations
    }
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gradient mb-6">
          {demand ? 'Upravit poptávku' : 'Vytvořit poptávku'}
        </h2>
        
        {/* Informace o poptávce a spolupráci */}
        <div className="space-y-4 mb-6">
          <div className="glass-card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="icon-circle icon-circle-sm bg-blue-100 text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Jak vytvořit poptávku?</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>1. Společné informace:</strong> Zadejte cenové rozpětí, platnost a lokality (města, čtvrti, okresy).</p>
                  <p><strong>2. Specifické požadavky:</strong> Pro každý typ nemovitosti můžete zadat vlastní kritéria (pokoje, patro, plocha, vybavení...)</p>
                  <p><strong>3. Více typů najednou:</strong> Klikněte na "Přidat další typ nemovitosti" pro vytvoření komplexní poptávky.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-2">Provize a smlouva o vyhledání nemovitosti</h4>
            <p className="text-sm text-gray-700">
              Vyplňte provizní model, který máte s klientem dohodnutý. Po odeslání poptávky proběhne generování smlouvy o vyhledání
              příležitosti – administrátor připraví dokument, ve kterém bude sjednána vaše odměna za úspěšné zprostředkování.
              U poptávek se standardně pohybujeme v rozmezí 0,5&nbsp;% až 3&nbsp;% z dosažené kupní ceny podle charakteru obchodu.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Smlouva a přístupový kód fungují stejně jako u nabídek: po schválení poptávky obdržíte e-mail s dalšími kroky
              a klient získá přístup přes unikátní kód.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Pole Klient */}
            {currentUser.role === 'admin' ? (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Klient</label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="glass-input"
                >
                  <option value="">Vyberte klienta</option>
                  <option value={currentUser.id}>{currentUser.name} (Já)</option>
                  {users.filter(u => u.id !== currentUser.id).map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Klient</label>
                <input
                  type="text"
                  value={currentUser.name}
                  disabled
                  className="glass-input bg-gray-100"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cena od (Kč)</label>
              <input
                type="number"
                value={commonFilters.price.min}
                onChange={(e) => setCommonFilters({ 
                  ...commonFilters, 
                  price: { ...commonFilters.price, min: e.target.value }
                })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cena do (Kč)</label>
              <input
                type="number"
                value={commonFilters.price.max}
                onChange={(e) => setCommonFilters({ 
                  ...commonFilters, 
                  price: { ...commonFilters.price, max: e.target.value }
                })}
                className="glass-input"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Platnost poptávky</label>
              <select
                value={formData.validity_days}
                onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) })}
                className="glass-input"
              >
                <option value="14">14 dní</option>
                <option value="30">30 dní</option>
                <option value="60">60 dní</option>
                <option value="0">Stále (bez omezení)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Po vypršení bude potřeba potvrdit aktuálnost.</p>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-gradient text-lg">Lokality</span>
                <span className="block text-xs text-gray-500 mt-1 font-normal">
                  Inteligentní našeptávač - můžete přidat města, vesnice, čtvrti, okresy nebo kraje
                </span>
              </label>
              <LocationMultiSuggest
                locations={locations}
                onChange={setLocations}
                placeholder="Zadejte lokalitu (např. Praha, Brno...)"
              />
            </div>

            {/* Provize a spolupráce */}
            <div className="col-span-2">
              <div className="glass-card p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Provize za úspěšné vyhledání</h3>
                <p className="text-sm text-gray-700">
                  Tato provize se stává součástí smlouvy o vyhledání příležitosti. Po podpisu s klientem se z ní odvíjí vyúčtování
                  mezi vámi a portálem Estate Private.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typ provize</label>
                  <select
                    value={formData.commission_type}
                    onChange={(e) => setFormData({ ...formData, commission_type: e.target.value })}
                    className="glass-input"
                    required
                  >
                    <option value="percent">Procento z kupní ceny</option>
                    <option value="amount">Pevná částka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.commission_type === 'amount' ? 'Výše provize' : 'Provize v %'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.commission_value}
                    onChange={(e) => setFormData({ ...formData, commission_value: e.target.value })}
                    className="glass-input"
                    required
                  />
                  {formData.commission_type === 'percent' && (
                    <p className="text-xs text-gray-500 mt-1">Doporučené rozpětí: 0,5&nbsp;% až 3&nbsp;% dle charakteru obchodu.</p>
                  )}
                </div>

                {formData.commission_type === 'amount' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Měna</label>
                    <select
                      value={formData.commission_currency}
                      onChange={(e) => setFormData({ ...formData, commission_currency: e.target.value })}
                      className="glass-input"
                    >
                      <option value="CZK">CZK</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="BTC">BTC</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provizi hradí</label>
                  <select
                    value={formData.commission_payer}
                    onChange={(e) => setFormData({ ...formData, commission_payer: e.target.value })}
                    className="glass-input"
                  >
                    <option value="buyer">Kupující (klient)</option>
                    <option value="seller">Prodávající</option>
                    <option value="both">Obě strany</option>
                    <option value="other">Jiná dohoda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Režim DPH</label>
                  <select
                    value={formData.commission_vat}
                    onChange={(e) => setFormData({ ...formData, commission_vat: e.target.value })}
                    className="glass-input"
                  >
                    <option value="bez DPH">Bez DPH</option>
                    <option value="včetně DPH">Včetně DPH</option>
                    <option value="+ DPH">+ DPH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Odhadovaná sazba (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    className="glass-input"
                    placeholder="Např. 1.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Základ pro výpočet</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.commission_base_amount}
                    onChange={(e) => setFormData({ ...formData, commission_base_amount: e.target.value })}
                    className="glass-input"
                    placeholder="Odhadovaná kupní cena"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Speciální podmínky</label>
                  <textarea
                    rows="3"
                    value={formData.commission_terms}
                    onChange={(e) => setFormData({ ...formData, commission_terms: e.target.value })}
                    className="glass-input"
                    placeholder="Např. splatnost odměny, navazující služby, bonusy..."
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 text-sm text-blue-800 space-y-2">
                <p><strong>Před dokončením poptávky proběhne:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Administrátor zkontroluje zadané informace a připraví smlouvu o vyhledání příležitosti.</li>
                  <li>Do e-mailu obdržíte návrh smlouvy a přístupový kód k poptávce; klient zároveň dostane instrukce k podpisu.</li>
                  <li>Po podpisu smlouvy je poptávka aktivována a můžete přidávat nabídky.</li>
                </ol>
              </div>
            </div>

            {/* Nová sekce: Specifické požadavky podle typu nemovitosti */}
            <div className="col-span-2">
              <div className="border-t border-gray-200 my-6"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifické požadavky na nemovitosti</h3>
              <p className="text-sm text-gray-600 mb-4">
                Pro každý vybraný typ nemovitosti můžete zadat specifické požadavky (pokoje, patro, plocha pozemku atd.)
              </p>
              
              {propertyRequirements.map((req, index) => (
                <div key={index} className="glass-card p-4 mb-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      Požadavek {index + 1}: {req.transaction_type === 'sale' ? 'Prodej' : 'Pronájem'} - {
                        req.property_type === 'flat' ? 'Byt' :
                        req.property_type === 'house' ? 'Dům' :
                        req.property_type === 'commercial' ? 'Komerční' :
                        req.property_type === 'land' ? 'Pozemek' : 'Projekt'
                      }
                    </h4>
                    {propertyRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePropertyRequirement(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Typ transakce
                        {propertyRequirements.length > 1 && (
                          <span className="text-xs text-purple-600 ml-2">(společné pro všechny typy)</span>
                        )}
                      </label>
                      <select
                        value={req.transaction_type}
                        onChange={(e) => updatePropertyRequirement(index, 'transaction_type', e.target.value)}
                        className="glass-input"
                      >
                        <option value="sale">Prodej</option>
                        <option value="rent">Pronájem</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Typ nemovitosti</label>
                      <select
                        value={req.property_type}
                        onChange={(e) => updatePropertyRequirement(index, 'property_type', e.target.value)}
                        className="glass-input"
                      >
                        <option value="flat">Byt</option>
                        <option value="house">Dům</option>
                        <option value="commercial">Komerční</option>
                        <option value="land">Pozemek</option>
                        <option value="project">Projekt</option>
                      </select>
                    </div>
                    
                    {/* Podtypy nemovitosti - multi-select */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {req.property_type === 'flat' && 'Dispozice (můžete vybrat více)'}
                        {req.property_type === 'house' && 'Typ domu (můžete vybrat více)'}
                        {req.property_type === 'commercial' && 'Typ komerční nemovitosti (můžete vybrat více)'}
                        {req.property_type === 'land' && 'Typ pozemku (můžete vybrat více)'}
                        {req.property_type === 'project' && 'Typ projektu (můžete vybrat více)'}
                      </label>
                      <div className="glass-card p-3 max-h-48 overflow-y-auto">
                        <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={!req.property_subtypes || req.property_subtypes.length === 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePropertyRequirement(index, 'property_subtypes', [])
                              }
                            }}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm font-medium">Jakýkoliv</span>
                        </label>
                        {req.property_type === 'flat' && (
                          <>
                            {['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6+kk', '6+1', 'atypical', 'other'].map(subtype => (
                              <label key={subtype} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(req.property_subtypes || []).includes(subtype)}
                                  onChange={(e) => {
                                    const current = req.property_subtypes || []
                                    const updated = e.target.checked 
                                      ? [...current, subtype]
                                      : current.filter(s => s !== subtype)
                                    updatePropertyRequirement(index, 'property_subtypes', updated)
                                  }}
                                  className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm">{subtype === 'atypical' ? 'Atypický' : subtype === 'other' ? 'Jiný' : subtype}</span>
                              </label>
                            ))}
                          </>
                        )}
                        {req.property_type === 'house' && (
                          <>
                            {[{v:'family_house',l:'Rodinný dům'},{v:'villa',l:'Vila'},{v:'cottage',l:'Chalupa'},{v:'cabin',l:'Chata'},{v:'farmhouse',l:'Zemědělská usedlost'},{v:'mobile_home',l:'Mobilní dům'},{v:'other',l:'Jiný'}].map(({v,l}) => (
                              <label key={v} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(req.property_subtypes || []).includes(v)}
                                  onChange={(e) => {
                                    const current = req.property_subtypes || []
                                    const updated = e.target.checked ? [...current, v] : current.filter(s => s !== v)
                                    updatePropertyRequirement(index, 'property_subtypes', updated)
                                  }}
                                  className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm">{l}</span>
                              </label>
                            ))}
                          </>
                        )}
                        {req.property_type === 'commercial' && (
                          <>
                            {[{v:'apartment_building',l:'Činžovní dům'},{v:'office',l:'Kancelář'},{v:'retail',l:'Obchod'},{v:'warehouse',l:'Sklad'},{v:'production',l:'Výroba'},{v:'restaurant',l:'Restaurace'},{v:'accommodation',l:'Ubytování'},{v:'agricultural',l:'Zemědělský objekt'},{v:'garage',l:'Garáž'},{v:'other',l:'Jiný'}].map(({v,l}) => (
                              <label key={v} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(req.property_subtypes || []).includes(v)}
                                  onChange={(e) => {
                                    const current = req.property_subtypes || []
                                    const updated = e.target.checked ? [...current, v] : current.filter(s => s !== v)
                                    updatePropertyRequirement(index, 'property_subtypes', updated)
                                  }}
                                  className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm">{l}</span>
                              </label>
                            ))}
                          </>
                        )}
                        {req.property_type === 'land' && (
                          <>
                            {[{v:'building_plot',l:'Stavební parcela'},{v:'agricultural',l:'Zemědělský'},{v:'forest',l:'Les'},{v:'garden',l:'Zahrada'},{v:'orchard',l:'Sad'},{v:'meadow',l:'Louka'},{v:'pond',l:'Rybník'},{v:'other',l:'Jiný'}].map(({v,l}) => (
                              <label key={v} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(req.property_subtypes || []).includes(v)}
                                  onChange={(e) => {
                                    const current = req.property_subtypes || []
                                    const updated = e.target.checked ? [...current, v] : current.filter(s => s !== v)
                                    updatePropertyRequirement(index, 'property_subtypes', updated)
                                  }}
                                  className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm">{l}</span>
                              </label>
                            ))}
                          </>
                        )}
                        {req.property_type === 'project' && (
                          <>
                            {[{v:'residential',l:'Bytový projekt'},{v:'commercial',l:'Komerční projekt'},{v:'mixed',l:'Smíšený projekt'},{v:'other',l:'Jiný'}].map(({v,l}) => (
                              <label key={v} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={(req.property_subtypes || []).includes(v)}
                                  onChange={(e) => {
                                    const current = req.property_subtypes || []
                                    const updated = e.target.checked ? [...current, v] : current.filter(s => s !== v)
                                    updatePropertyRequirement(index, 'property_subtypes', updated)
                                  }}
                                  className="w-4 h-4 text-primary-600"
                                />
                                <span className="text-sm">{l}</span>
                              </label>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Dynamická pole podle typu nemovitosti */}
                    {req.property_type === 'flat' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Patro od</label>
                          <input
                            type="number"
                            value={req.filters?.floor?.min || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.floor.min', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Patro do</label>
                          <input
                            type="number"
                            value={req.filters?.floor?.max || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.floor.max', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha od (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.area?.min || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.area.min', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha do (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.area?.max || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.area.max', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                      </>
                    )}
                    
                    {req.property_type === 'land' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha pozemku od (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.land_area?.min || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.land_area.min', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha pozemku do (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.land_area?.max || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.land_area.max', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Domy - plocha a plocha pozemku */}
                    {req.property_type === 'house' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha od (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.area?.min || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.area.min', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha do (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.area?.max || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.area.max', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha pozemku od (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.land_area?.min || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.land_area.min', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha pozemku do (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.land_area?.max || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.land_area.max', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Komerční - plocha */}
                    {req.property_type === 'commercial' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha od (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.area?.min || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.area.min', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Plocha do (m²)</label>
                          <input
                            type="number"
                            value={req.filters?.area?.max || ''}
                            onChange={(e) => updatePropertyRequirement(index, 'filters.area.max', e.target.value)}
                            className="glass-input"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addPropertyRequirement}
                className="glass-button-secondary w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Přidat další typ nemovitosti
              </button>
            </div>
            
            <div className="col-span-2">
              <div className="border-t border-gray-200 my-6"></div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stav poptávky</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="glass-input"
              >
                <option value="active">Aktivní</option>
                <option value="fulfilled">Splněno</option>
                <option value="cancelled">Zrušeno</option>
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.email_notifications}
                  onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Zasílat emailové notifikace o nových nabídkách</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="glass-button-secondary flex-1 rounded-full"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="glass-button flex-1 rounded-full"
            >
              {demand ? 'Uložit změny' : 'Vytvořit poptávku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UserModal({ user, companies, onSave, onClose, currentUser }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'client',
    phone: user?.phone || '',
    phone_secondary: user?.phone_secondary || '',
    avatar: user?.avatar || '',
    address_street: user?.address_street || '',
    address_city: user?.address_city || '',
    address_zip: user?.address_zip || '',
    address_country: user?.address_country || 'Česká republika',
    company_id: user?.company_id || '',
    company: user?.company || '',
    company_position: user?.company_position || '',
    ico: user?.ico || '',
    dic: user?.dic || '',
    preferred_contact: user?.preferred_contact || 'email',
    newsletter_subscribed: user?.newsletter_subscribed !== undefined ? user.newsletter_subscribed : 1,
    notes: user?.notes || '',
    is_active: user?.is_active !== undefined ? user.is_active : 1
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...formData }
    if (!data.password) delete data.password
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gradient mb-6">
          {user ? 'Upravit uživatele' : 'Přidat uživatele'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jméno</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heslo {user && '(ponechte prázdné pro zachování)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="glass-input"
                required={!user}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="glass-input"
              >
                <option value="admin">Administrátor</option>
                <option value="agent">Agent</option>
                <option value="client">Klient</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="glass-input"
                placeholder="+420 777 123 456"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sekundární telefon</label>
              <input
                type="tel"
                value={formData.phone_secondary}
                onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                className="glass-input"
                placeholder="+420 777 123 457"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar (emoji nebo URL)</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="glass-input"
                placeholder="Emoji nebo URL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferovaný kontakt</label>
              <select
                value={formData.preferred_contact}
                onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value })}
                className="glass-input"
              >
                <option value="email">Email</option>
                <option value="phone">Telefon</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            
            {/* Vyhledání adresy */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyhledat adresu
              </label>
              <AddressSuggest
                value=""
                onChange={(address, details) => {
                  setFormData({
                    ...formData,
                    address_street: details?.street || address,
                    address_city: details?.city || formData.address_city,
                    address_zip: details?.zip || formData.address_zip
                  })
                }}
                placeholder="Začněte psát adresu pro automatické vyplnění..."
                className="glass-input"
              />
            </div>
            
            {/* Vyplněné pole adresy */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ulice a číslo popisné</label>
              <input
                type="text"
                value={formData.address_street}
                onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                className="glass-input"
                placeholder="Vyplní se automaticky"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Město</label>
              <input
                type="text"
                value={formData.address_city}
                onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                className="glass-input"
                placeholder="Vyplní se automaticky"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PSČ</label>
              <input
                type="text"
                value={formData.address_zip}
                onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                className="glass-input"
                placeholder="Vyplní se automaticky"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Země</label>
              <input
                type="text"
                value={formData.address_country}
                onChange={(e) => setFormData({ ...formData, address_country: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Společnost</label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="glass-input"
              >
                <option value="">Žádná</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pozice</label>
              <input
                type="text"
                value={formData.company_position}
                onChange={(e) => setFormData({ ...formData, company_position: e.target.value })}
                className="glass-input"
              />
            </div>
            
            {/* Vyhledání firmy podle IČO */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyhledat firmu podle IČO
              </label>
              <CompanySuggest
                value=""
                onChange={() => {}}
                onCompanySelect={(company) => {
                  setFormData({
                    ...formData,
                    ico: company.ico,
                    company: company.name,
                    dic: company.dic || formData.dic,
                    address_street: company.street || formData.address_street,
                    address_city: company.city || formData.address_city,
                    address_zip: company.zip || formData.address_zip
                  })
                }}
                placeholder="Zadejte 8-místné IČO pro automatické vyplnění"
                className="glass-input"
              />
            </div>
            
            {/* Vyplněná pole firmy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IČO</label>
              <input
                type="text"
                value={formData.ico}
                onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
                className="glass-input"
                placeholder="Vyplní se automaticky"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Název firmy</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="glass-input"
                placeholder="Vyplní se automaticky"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DIČ</label>
              <input
                type="text"
                value={formData.dic}
                onChange={(e) => setFormData({ ...formData, dic: e.target.value })}
                className="glass-input"
                placeholder="CZ12345678"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Poznámky</label>
              <textarea
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="glass-input"
                placeholder="Interní poznámky o uživateli..."
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.newsletter_subscribed}
                  onChange={(e) => setFormData({ ...formData, newsletter_subscribed: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Odběr newsletteru</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Aktivní účet</span>
              </label>
            </div>
          </div>

          {/* Admin může resetovat heslo */}
          {user && currentUser?.role === 'admin' && (
            <div className="glass-card p-4 bg-yellow-50 border border-yellow-200">
              <h3 className="text-sm font-bold text-yellow-900 mb-2">Reset hesla (pouze admin)</h3>
              <button
                type="button"
                onClick={async () => {
                  const newPassword = prompt(`Zadejte nové heslo pro ${user.name}:`)
                  if (!newPassword) return
                  
                  if (newPassword.length < 6) {
                    alert('Heslo musí mít alespoň 6 znaků')
                    return
                  }
                  
                  try {
                    const response = await fetch(`${API_URL}/admin/reset-user-password`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        admin_id: currentUser.id,
                        user_id: user.id,
                        new_password: newPassword
                      })
                    })
                    
                    const data = await response.json()
                    
                    if (response.ok) {
                      alert(data.message)
                    } else {
                      alert('Chyba: ' + data.error)
                    }
                  } catch (error) {
                    alert('Chyba: ' + error.message)
                  }
                }}
                className="btn-secondary text-sm"
              >
                Resetovat heslo
              </button>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="glass-button-secondary flex-1 rounded-full"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="glass-button flex-1 rounded-full"
            >
              {user ? 'Uložit změny' : 'Přidat uživatele'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PropertyDetail({ property, currentUser, onClose, onEdit, onToggleStatus, onAddProperty, onAddDemand }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [hasAccess, setHasAccess] = useState(null) // null = loading, true/false = result
  const [accessReason, setAccessReason] = useState(null)
  const [accessMessage, setAccessMessage] = useState(null)

  const checkAccess = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/properties/${property.id}/check-access/${currentUser.id}`)
      const data = await response.json()

      setHasAccess(data.hasAccess)
      setAccessReason(data.reason)
      setAccessMessage(data.message)
    } catch (error) {
      console.error('Chyba při kontrole přístupu:', error)
      setHasAccess(false)
    }
  }, [property.id, currentUser.id])

  useEffect(() => {
    setHasAccess(null)
    checkAccess()
  }, [checkAccess])
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ').format(price)
  }

  const images = property.images || []
  const allImages = property.main_image ? [property.main_image, ...images.filter(img => img !== property.main_image)] : images

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Loading
  if (hasAccess === null) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kontroluji přístup...</p>
        </div>
      </div>
    )
  }

  // Nemá přístup - zobrazit LOI modal
  if (!hasAccess) {
    return <LOIModal 
      isOpen={true}
      onClose={onClose}
      entity={property}
      entityType="property"
      currentUser={currentUser}
      onLOISigned={() => {
        setHasAccess(null)
        checkAccess()
      }}
    />
  }

  // Má přístup - zobrazit detail
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gradient mb-2">{property.title}</h2>
            {accessReason === 'owner' && (
              <span className="badge bg-blue-100 text-blue-700">Moje nabídka</span>
            )}
            {accessReason === 'signed_loi' && (
              <span className="badge bg-green-100 text-green-700">LOI podepsána</span>
            )}
            {accessReason === 'admin' && (
              <span className="badge bg-purple-100 text-purple-700">Admin</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl ml-4">×</button>
        </div>

        <div className="space-y-6">
          {/* Galerie fotek */}
          {allImages.length > 0 && (
            <div>
              <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={`${property.title} - foto ${currentImageIndex + 1}`}
                  style={{ width: '100%', height: '400px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => setShowFullscreen(true)}
                />
                
                {/* Šipky pro listování */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.7)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.7)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}
                    >
                      ›
                    </button>
                  </>
                )}
                
                {/* Počítadlo fotek */}
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  right: '1rem',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {currentImageIndex + 1} / {allImages.length}
                </div>
                
                {/* Tlačítko pro fullscreen */}
                <button
                  onClick={() => setShowFullscreen(true)}
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Zobrazit v plné velikosti
                </button>
              </div>
              
              {/* Miniaturky */}
              {allImages.length > 1 && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                  gap: '0.5rem', 
                  marginTop: '1rem' 
                }}>
                  {allImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      style={{
                        cursor: 'pointer',
                        border: currentImageIndex === idx ? '3px solid #667eea' : '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img 
                        src={img} 
                        alt={`Miniatura ${idx + 1}`}
                        style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Fullscreen modal */}
          {showFullscreen && (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.95)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
              }}
              onClick={() => setShowFullscreen(false)}
            >
              <button
                onClick={() => setShowFullscreen(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
              
              <img 
                src={allImages[currentImageIndex]} 
                alt={`${property.title} - fullscreen`}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  borderRadius: '0.5rem'
                }}
                onClick={(e) => e.stopPropagation()}
              />
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    style={{
                      position: 'absolute',
                      left: '2rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '64px',
                      height: '64px',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    style={{
                      position: 'absolute',
                      right: '2rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '64px',
                      height: '64px',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ›
                  </button>
                  
                  <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Cena a základní info */}
          <div className="flex justify-between items-center">
            <div className="text-4xl font-bold text-gradient">
              {formatPrice(property.price)} Kč
            </div>
            <div className="flex items-center space-x-2">
              <span className={`badge ${
                property.status === 'active' ? 'badge-success' :
                property.status === 'reserved' ? 'badge-warning' :
                property.status === 'sold' ? 'badge-danger' :
                'badge-neutral'
              }`}>
                {LABELS_CS[property.status]}
              </span>
            </div>
          </div>

          {/* Základní parametry */}
              <div className="grid grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.area} m²</div>
                  <div className="text-sm text-gray-600">Plocha</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.rooms}</div>
                  <div className="text-sm text-gray-600">Pokoje</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.floor}</div>
                  <div className="text-sm text-gray-600">Patro</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.total_floors}</div>
                  <div className="text-sm text-gray-600">Celkem pater</div>
                </div>
              </div>

              {/* Popis */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Popis</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Lokace */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lokace</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Město:</span>
                    <span className="ml-2 font-semibold">{property.city}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Okres:</span>
                    <span className="ml-2 font-semibold">{property.district}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600">Ulice:</span>
                    <span className="ml-2 font-semibold">{property.street || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Vlastnosti */}
              <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Vlastnosti</h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-purple-100 text-purple-700">
                <Building2 className="w-3.5 h-3.5" />
                {LABELS_CS[property.transaction_type]}
              </span>
              <span className="badge bg-blue-100 text-blue-700">
                <Home className="w-3.5 h-3.5" />
                {LABELS_CS[property.property_type]}
              </span>
              <span className="badge bg-neutral-100 text-neutral-700">
                {property.property_subtype}
              </span>
              {property.has_balcony ? (
                <span className="badge badge-success">Balkon</span>
              ) : null}
              {property.has_elevator ? (
                <span className="badge badge-success">Výtah</span>
              ) : null}
              {property.has_parking ? (
                <span className="badge badge-success">Parkování</span>
              ) : null}
            </div>
          </div>

          {/* Video prohlídka */}
          {property.video_url && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="icon-circle icon-circle-sm bg-red-100 text-red-600">
                  <Play className="w-4 h-4" />
                </div>
                Video prohlídka
              </h3>
              <div className="glass-card p-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={(() => {
                      // Převod YouTube URL na embed formát
                      const url = property.video_url
                      if (url.includes('youtube.com/watch')) {
                        const videoId = new URL(url).searchParams.get('v')
                        return `https://www.youtube.com/embed/${videoId}`
                      } else if (url.includes('youtu.be/')) {
                        const videoId = url.split('youtu.be/')[1].split('?')[0]
                        return `https://www.youtube.com/embed/${videoId}`
                      }
                      return url
                    })()}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          )}

          {/* Matterport 3D prohlídka */}
          {property.matterport_url && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="icon-circle icon-circle-sm bg-purple-100 text-purple-600">
                  <Building2 className="w-4 h-4" />
                </div>
                3D virtuální prohlídka
              </h3>
              <div className="glass-card p-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={property.matterport_url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          )}

          {/* Dokumenty */}
          {Array.isArray(property.documents) && property.documents.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="icon-circle icon-circle-sm bg-blue-100 text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
                Dokumenty
              </h3>
              <div className="glass-card p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.documents.map((doc, idx) => {
                    const fileName = doc.split('/').pop()
                    const fileExt = fileName.split('.').pop().toUpperCase()
                    
                    return (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                      >
                        <div className="icon-circle icon-circle-sm bg-blue-100 text-blue-600">
                          {fileExt === 'PDF' ? (
                            <FileText className="w-4 h-4" />
                          ) : ['JPG', 'JPEG', 'PNG', 'WEBP'].includes(fileExt) ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{fileName}</div>
                          <div className="text-xs text-neutral-500">{fileExt}</div>
                        </div>
                        <div className="icon-circle icon-circle-sm bg-neutral-100 text-neutral-600">
                          <Upload className="w-3 h-3 rotate-90" />
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Kontakt */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="icon-circle icon-circle-sm bg-primary-100 text-primary-600">
                <User className="w-4 h-4" />
              </div>
              Kontakt
            </h3>
            <div className="glass-card p-4">
              {currentUser.role === 'admin' ? (
                // Admin vidí skutečné kontakty
                <div className="space-y-4">
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem'
                  }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {property.agent_name || 'Agent'}
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                      Kontaktní údaje agenta
                    </div>
                  </div>
                  <div className="space-y-2">
                    {property.agent_email && (
                      <div className="flex items-center gap-2">
                        <div className="icon-circle icon-circle-sm bg-blue-100 text-blue-600">
                          <Mail className="w-4 h-4" />
                        </div>
                        <a href={`mailto:${property.agent_email}`} style={{ color: '#667eea', fontWeight: '600' }}>
                          {property.agent_email}
                        </a>
                      </div>
                    )}
                    {property.agent_phone && (
                      <div className="flex items-center gap-2">
                        <div className="icon-circle icon-circle-sm bg-green-100 text-green-600">
                          <Building className="w-4 h-4" />
                        </div>
                        <a href={`tel:${property.agent_phone}`} style={{ fontWeight: '600', color: '#10b981' }}>
                          {property.agent_phone}
                        </a>
                      </div>
                    )}
                    {property.agent_company && (
                      <div className="flex items-center gap-2">
                        <div className="icon-circle icon-circle-sm bg-purple-100 text-purple-600">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span style={{ fontWeight: '600' }}>
                          {property.agent_company}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Ostatní vidí obecné kontakty
                <>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      PTF reality, s.r.o.
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                      Pro více informací o této nemovitosti nás kontaktujte
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="icon-circle icon-circle-sm bg-blue-100 text-blue-600">
                        <Mail className="w-4 h-4" />
                      </div>
                      <a href="mailto:info@ptf.cz" style={{ color: '#667eea', fontWeight: '600' }}>
                        info@ptf.cz
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="icon-circle icon-circle-sm bg-purple-100 text-purple-600">
                        <Building className="w-4 h-4" />
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                        IČO: 06684394
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="icon-circle icon-circle-sm bg-green-100 text-green-600">
                        <Building className="w-4 h-4" />
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                        Dřevěná 99/3, 301 00 Plzeň
                      </span>
                    </div>
                  </div>
                </>
              )}
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#f0f9ff',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#1e40af'
              }}>
                Náš tým vás spojí s příslušným agentem a zodpoví všechny vaše dotazy
              </div>
            </div>
          </div>

          {/* Tlačítka pro admina a agenta */}
          {(currentUser.role === 'admin' || currentUser.role === 'agent') && (
            <div className="space-y-3 pt-4 border-t">
              {currentUser.role === 'admin' && (
                <div className="flex space-x-3">
                  <button onClick={onEdit} className="glass-button flex-1 rounded-full">
                    Upravit nabídku
                  </button>
                  <button onClick={onToggleStatus} className="glass-button-secondary flex-1 rounded-full">
                    {property.status === 'active' ? 'Deaktivovat' : 'Aktivovat'}
                  </button>
                </div>
              )}
              <div className="flex space-x-3">
                <button onClick={onAddProperty} className="glass-button-secondary flex-1 rounded-full flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  Přidat nabídku
                </button>
                <button onClick={onAddDemand} className="glass-button-secondary flex-1 rounded-full flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Přidat poptávku
                </button>
              </div>
            </div>
          )}

          {/* Shody (matching demands) */}
          <MatchesList 
            entityType="properties" 
            entityId={property.id} 
            currentUser={currentUser}
            onViewDetail={(demand) => {
              // Otevřít detail poptávky
              window.location.hash = `demand-${demand.id}`;
            }}
            onRequestAccess={(demand) => {
              // Požádat o přístup k poptávce
              alert('Funkce "Požádat o detail" bude implementována');
            }}
          />

          {/* Historie - pouze admin */}
          {currentUser.role === 'admin' && (
            <EntityHistory entityType="properties" entityId={property.id} />
          )}
        </div>
      </div>
    </div>
  )
}

function DemandDetail({ demand, currentUser, onClose, onEdit, onAddProperty, onAddDemand }) {
  const [hasAccess, setHasAccess] = useState(null)
  const [accessReason, setAccessReason] = useState(null)
  const [accessMessage, setAccessMessage] = useState(null)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ').format(price)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-gradient">Detail poptávky</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="space-y-6">
          {/* Kontakt */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="icon-circle icon-circle-sm bg-primary-100 text-primary-600">
                <User className="w-4 h-4" />
              </div>
              Kontakt
            </h3>
            <div className="glass-card p-4">
              {currentUser.role === 'admin' ? (
                <>
                  {/* Admin vidí kontakty */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {demand.client_name || 'Klient'}
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                      Kontaktní informace klienta
                    </div>
                  </div>
                  <div className="space-y-2">
                    {demand.client_email && (
                      <div className="flex items-center gap-2">
                        <div className="icon-circle icon-circle-sm bg-blue-100 text-blue-600">
                          <Mail className="w-4 h-4" />
                        </div>
                        <a href={`mailto:${demand.client_email}`} style={{ color: '#667eea', fontWeight: '600' }}>
                          {demand.client_email}
                        </a>
                      </div>
                    )}
                    {demand.client_phone && (
                      <div className="flex items-center gap-2">
                        <div className="icon-circle icon-circle-sm bg-green-100 text-green-600">
                          <Building className="w-4 h-4" />
                        </div>
                        <a href={`tel:${demand.client_phone}`} style={{ fontWeight: '600', color: '#10b981' }}>
                          {demand.client_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </>
              ) : currentUser.role === 'agent' ? (
                <>
                  {/* Agent vidí tlačítko pro žádost o kontakty */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Kontaktní údaje klienta
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                      Pro získání kontaktů na klienta požádejte admina o schválení
                    </div>
                  </div>
                  <div style={{
                    padding: '0.75rem',
                    background: '#fff3cd',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#856404',
                    marginBottom: '1rem'
                  }}>
                    Po schválení vám budou zpřístupněny kontaktní údaje klienta a přesné lokality
                  </div>
                  <button 
                    onClick={() => alert('Žádost o kontakty bude odeslána adminovi')}
                    className="glass-button w-full rounded-full flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Požádat o kontakty klienta
                  </button>
                </>
              ) : (
                <>
                  {/* Klient vidí jen text a tlačítko */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      PTF reality, s.r.o.
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                      Pro více informací o této poptávce nás kontaktujte
                    </div>
                  </div>
                  <div style={{
                    padding: '0.75rem',
                    background: '#f0f9ff',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#1e40af',
                    marginBottom: '1rem'
                  }}>
                    Náš tým vás spojí s klientem a pomůže s nabídkou vhodných nemovitostí
                  </div>
                  <button className="glass-button w-full rounded-full flex items-center justify-center gap-2">
                    <User className="w-4 h-4" />
                    Mám zájem o bližší informace
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Společné filtry */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="icon-circle icon-circle-sm bg-purple-100 text-purple-600">
                <Building2 className="w-4 h-4" />
              </div>
              Společné požadavky
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {demand.common_filters?.price && (
                <div className="glass-card p-4">
                  <div className="text-sm text-gray-600 mb-1">Cenové rozpětí</div>
                  <div className="font-semibold">
                    {demand.common_filters.price.min ? formatPrice(demand.common_filters.price.min) : '0'} - {demand.common_filters.price.max ? formatPrice(demand.common_filters.price.max) : '∞'} Kč
                  </div>
                </div>
              )}
              {demand.locations && Array.isArray(demand.locations) && demand.locations.length > 0 && (
                <div className="glass-card p-4 col-span-2">
                  <div className="text-sm text-gray-600 mb-2">
                    Lokality
                    {currentUser.role === 'agent' && !demand.locations[0].name && (
                      <span className="text-xs text-orange-600 ml-2">(omezený přístup)</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {demand.locations.map((loc, i) => (
                      <span key={i} className="badge bg-primary-100 text-primary-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {loc.name || `${loc.district || loc.region}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Platnost</div>
                <div className="font-semibold">
                  {demand.validity_days > 0 ? `${demand.validity_days} dní` : 'Stále'}
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Email notifikace</div>
                <div className="font-semibold">
                  {demand.email_notifications ? 'Zapnuto' : 'Vypnuto'}
                </div>
              </div>
            </div>
          </div>

          {/* Specifické požadavky na typy nemovitostí */}
          {demand.property_requirements && Array.isArray(demand.property_requirements) && demand.property_requirements.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="icon-circle icon-circle-sm bg-indigo-100 text-indigo-600">
                  <Home className="w-4 h-4" />
                </div>
                Typy nemovitostí
                {demand.property_requirements.length > 1 && (
                  <span className="badge bg-purple-100 text-purple-700">
                    Multi-poptávka ({demand.property_requirements.length} typů)
                  </span>
                )}
              </h3>
              <div className="space-y-4">
                {demand.property_requirements.map((req, index) => (
                  <div key={index} className="glass-card p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg text-gray-900">
                        {index + 1}. {LABELS_CS[req.transaction_type]} • {LABELS_CS[req.property_type]}
                      </h4>
                    </div>
                    
                    {/* Zobrazit všechny vybrané podtypy */}
                    {(() => {
                      const subtypes = req.property_subtypes || (req.property_subtype ? [req.property_subtype] : []);
                      if (subtypes.length > 0) {
                        return (
                          <div className="mb-3">
                            <div className="text-xs text-gray-600 mb-2">Podtypy:</div>
                            <div className="flex flex-wrap gap-2">
                              {subtypes.map((subtype, i) => (
                                <span key={i} className="badge bg-purple-100 text-purple-700 text-xs">
                                  {subtype}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {req.filters && Object.keys(req.filters).length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {req.filters.rooms && (
                          <div className="bg-white/70 p-3 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Pokoje</div>
                            <div className="font-semibold">
                              {req.filters.rooms.min || '0'} - {req.filters.rooms.max || '∞'}
                            </div>
                          </div>
                        )}
                        {req.filters.floor && (
                          <div className="bg-white/70 p-3 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Patro</div>
                            <div className="font-semibold">
                              {req.filters.floor.min || '0'} - {req.filters.floor.max || '∞'}
                            </div>
                          </div>
                        )}
                        {req.filters.area && (
                          <div className="bg-white/70 p-3 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Plocha</div>
                            <div className="font-semibold">
                              {req.filters.area.min || '0'} - {req.filters.area.max || '∞'} m²
                            </div>
                          </div>
                        )}
                        {req.filters.land_area && (
                          <div className="bg-white/70 p-3 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Plocha pozemku</div>
                            <div className="font-semibold">
                              {req.filters.land_area.min || '0'} - {req.filters.land_area.max || '∞'} m²
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tlačítka pro admina a agenta */}
          {(currentUser.role === 'admin' || currentUser.role === 'agent') && (
            <div className="space-y-3 pt-4 border-t">
              {currentUser.role === 'admin' && (
                <div className="flex space-x-3">
                  <button onClick={onEdit} className="glass-button flex-1 rounded-full">
                    Upravit poptávku
                  </button>
                </div>
              )}
              <div className="flex space-x-3">
                <button onClick={onAddProperty} className="glass-button-secondary flex-1 rounded-full flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  Přidat nabídku
                </button>
                <button onClick={onAddDemand} className="glass-button-secondary flex-1 rounded-full flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Přidat poptávku
                </button>
              </div>
            </div>
          )}

          {/* Shody (matching properties) */}
          <MatchesList 
            entityType="demands" 
            entityId={demand.id} 
            currentUser={currentUser}
            onViewDetail={(property) => {
              // Otevřít detail nabídky
              window.location.hash = `property-${property.id}`;
            }}
            onRequestAccess={(property) => {
              // Požádat o přístup k nabídce
              alert('Funkce "Požádat o detail" bude implementována');
            }}
          />

          {/* Historie - pouze admin */}
          {currentUser.role === 'admin' && (
            <EntityHistory entityType="demands" entityId={demand.id} />
          )}
        </div>
      </div>
    </div>
  )
}

function UserDetail({ user, currentUser, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profil' },
    user.company_name ? { id: 'company', label: 'Společnost' } : null,
    { id: 'history', label: 'Historie' }
  ].filter(Boolean)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 via-white/80 to-primary-50 border border-white/60 flex items-center justify-center shadow-sm">
              <User className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-600 px-3 py-1 font-medium">
                  {LABELS_CS[user.role]}
                </span>
                {user.id && (
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    ID: {user.id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 bg-white/60 border border-white/80 rounded-full p-1.5 shadow-inner">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white/80 text-gray-600 hover:text-primary-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="glass-card p-4 border border-white/60">
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Email</div>
                  <div className="text-sm font-semibold text-gray-900">{user.email}</div>
                </div>
                <div className="glass-card p-4 border border-white/60">
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Telefon</div>
                  <div className="text-sm font-semibold text-gray-900">{user.phone || '—'}</div>
                </div>
                {user.phone_2 && (
                  <div className="glass-card p-4 border border-white/60">
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Telefon 2</div>
                    <div className="text-sm font-semibold text-gray-900">{user.phone_2}</div>
                  </div>
                )}
                <div className="glass-card p-4 border border-white/60">
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Role v systému</div>
                  <div className="text-sm font-semibold text-gray-900">{LABELS_CS[user.role]}</div>
                </div>
              </div>

              <div className="glass-card p-4 border border-white/60">
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Adresa</div>
                <div className="text-sm text-gray-900">
                  <div>{user.address_street || '—'}</div>
                  <div>{user.address_city || '—'} {user.address_zip || ''}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="glass-card p-4 border border-white/60">
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Vytvořen</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {user.created_at ? new Date(user.created_at).toLocaleString('cs-CZ') : '—'}
                  </div>
                </div>
                <div className="glass-card p-4 border border-white/60">
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Poslední aktivita</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString('cs-CZ') : '—'}
                  </div>
                </div>
              </div>

              {user.notes && (
                <div className="glass-card p-4 border border-white/60">
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Poznámky</div>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{user.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-5">
              <div className="glass-card p-6 border border-white/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.company_name}</h3>
                    {user.company_position && (
                      <p className="text-sm text-gray-500 mt-1">{user.company_position}</p>
                    )}
                  </div>
                  <div className="rounded-full bg-primary-50 text-primary-600 px-3 py-1 text-sm font-medium">
                    Firemní údaje
                  </div>
                </div>

                <div className="grid gap-4 mt-6 md:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">IČO</div>
                    <div className="text-sm font-semibold text-gray-900">{user.company_ico || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">DIČ</div>
                    <div className="text-sm font-semibold text-gray-900">{user.company_dic || '—'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Sídlo</div>
                    <div className="text-sm text-gray-900">{user.company_address || '—'}</div>
                  </div>
                </div>
              </div>

              {!user.company_name && (
                <div className="glass-card p-6 border border-dashed border-white/60 text-center text-sm text-gray-500">
                  Uživatel zatím nemá vyplněné firemní údaje.
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="glass-card p-4 border border-white/60">
              <UserHistory userId={user.id} userName={user.name} userRole={LABELS_CS[user.role]} />
            </div>
          )}
        </div>

        {currentUser.role === 'admin' && (
          <div className="border-t border-white/60 px-6 py-4 bg-white/40 backdrop-blur flex gap-3">
            <button onClick={onEdit} className="glass-button flex-1 rounded-full">
              Upravit uživatele
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AuditLogPage({ currentUser }) {
  const [logs, setLogs] = useState([])
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    entity_type: '',
    date_from: '',
    date_to: ''
  })

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    try {
      // Filtrovat pouze neprázdné parametry
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key])
        }
      })
      
      const url = `/api/audit-logs${params.toString() ? '?' + params.toString() : ''}`
      console.log('Načítám audit logy z:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Načteno audit logů:', data.length, data)
      setLogs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Chyba při načítání logů:', error)
      setLogs([])
    }
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="fade-in text-center py-12">
        <h2 className="text-2xl font-bold text-white">Přístup odepřen</h2>
        <p className="text-white/70 mt-2">Pouze administrátor může zobrazit audit log</p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="glass-card mb-6 p-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Audit Log</h3>
          <p className="text-sm text-gray-600 mt-1">Záznamy všech aktivit v systému</p>
        </div>
      </div>
      
      {/* Filtry */}
      <div className="glass-card mb-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrování</h3>
        <div className="grid grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="ID uživatele"
            value={filters.user_id}
            onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
            className="glass-input"
          />
          
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="glass-input"
          >
            <option value="">Všechny akce</option>
            <option value="view">Zobrazení</option>
            <option value="create">Vytvoření</option>
            <option value="update">Úprava</option>
            <option value="delete">Smazání</option>
            <option value="login">Přihlášení</option>
            <option value="access_code">Použití kódu</option>
          </select>
          
          <select
            value={filters.entity_type}
            onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
            className="glass-input"
          >
            <option value="">Všechny entity</option>
            <option value="property">Nemovitost</option>
            <option value="demand">Poptávka</option>
            <option value="user">Uživatel</option>
          </select>
          
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            className="glass-input"
          />
          
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            className="glass-input"
          />
        </div>
      </div>

      {/* Tabulka logů */}
      <div className="glass-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Čas</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Uživatel</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Akce</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Entita</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Detail</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">IP adresa</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-white/30 transition">
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(log.created_at).toLocaleString('cs-CZ')}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{log.user_name}</div>
                  <div className="text-xs text-gray-600">{log.user_email}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`badge ${
                    log.action === 'create' ? 'badge-success' :
                    log.action === 'update' ? 'badge-info' :
                    log.action === 'delete' ? 'badge-danger' :
                    log.action === 'view' ? 'bg-purple-100 text-purple-700' :
                    'badge-neutral'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {log.entity_type} #{log.entity_id}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {log.details}
                </td>
                <td className="py-3 px-4 text-xs text-gray-500">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            Žádné záznamy
          </div>
        )}
      </div>
    </div>
  )
}

function LoginForm({ onLogin, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await onLogin(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card max-w-md w-full mx-4 p-8">
        <h2 className="text-3xl font-bold text-gradient mb-6">Přihlášení</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              placeholder="admin@realitka.cz"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heslo</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
              placeholder="heslo123"
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
            <p className="font-semibold mb-1">Demo účty:</p>
            <p>Admin: admin@realitka.cz / heslo123</p>
            <p>Agent: jana.novakova@realitka.cz / heslo123</p>
            <p>Klient: martin.dvorak@email.cz / heslo123</p>
          </div>
          
          <div className="text-center mb-4">
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Zapomenuté heslo?
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="glass-button-secondary flex-1 rounded-full"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glass-button flex-1 rounded-full"
            >
              {loading ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-3">
            Nemáte účet?
          </p>
          <button
            type="button"
            onClick={() => {
              onClose()
              // Otevřít registrační formulář
              window.dispatchEvent(new CustomEvent('openRegistration'))
            }}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Zaregistrovat se na waitlist
          </button>
        </div>

        {/* Password Reset Modal */}
        <PasswordResetModal
          isOpen={showPasswordReset}
          onClose={() => setShowPasswordReset(false)}
        />
      </div>
    </div>
  )
}

function GenerateAccessCodeModal({ isOpen, onClose, entity, entityType, currentUser, onCodeGenerated }) {
  const [step, setStep] = useState(1) // 1 = Vysvětlení, 2 = LOI souhlas, 3 = Potvrzení
  const [agreedToLOI, setAgreedToLOI] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)

  if (!isOpen) return null

  const entityTitle = entityType === 'property' 
    ? entity?.title || 'Nemovitost'
    : `Poptávka ${LABELS_CS[entity?.transaction_type]} - ${LABELS_CS[entity?.property_type]}`

  const handleGenerateCode = async () => {
    if (!agreedToLOI) {
      alert('Musíte souhlasit s podmínkami LOI')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/access-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          entity_type: entityType,
          entity_id: entity.id,
          expires_in_days: 30,
          send_email: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při generování kódu')
      }

      const data = await response.json()
      setGeneratedCode(data.code)
      setStep(3)
    } catch (error) {
      alert('Chyba: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gradient">
            Žádost o přístupový kód
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Krok 1: Vysvětlení systému */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-blue-100 text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">Jak funguje systém přístupových kódů?</h3>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">1</div>
                      <p><strong>Požádáte o přístupový kód</strong> - Kód je unikátní pro každou nemovitost/poptávku a každého uživatele</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">2</div>
                      <p><strong>Podepíšete LOI</strong> (Letter of Intent) - Souhlas s podmínkami spolupráce</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">3</div>
                      <p><strong>Obdržíte kód emailem</strong> - Kód bude zaslán na váš registrovaný email</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">4</div>
                      <p><strong>Zadáte kód</strong> - Po zadání kódu získáte přístup k detailním informacím</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-purple-50 border border-purple-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-purple-100 text-purple-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-purple-900 mb-2">Detail entity:</h3>
                  <p className="text-purple-800 font-semibold">{entityTitle}</p>
                  <p className="text-sm text-purple-700 mt-2">
                    {entityType === 'property' ? 'Nabídka nemovitosti' : 'Poptávka klienta'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button onClick={onClose} className="glass-button-secondary flex-1 rounded-full">
                Zrušit
              </button>
              <button onClick={() => setStep(2)} className="glass-button flex-1 rounded-full">
                Pokračovat k LOI
              </button>
            </div>
          </div>
        )}

        {/* Krok 2: LOI Souhlas */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-amber-100 text-amber-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">Letter of Intent (LOI)</h3>
                  <h4 className="font-semibold text-amber-800 mb-2">Podmínky spolupráce s Estate Private</h4>
                  <div className="space-y-2 text-sm text-amber-800 max-h-96 overflow-y-auto p-4 bg-white rounded-lg">
                    <p className="font-semibold">1. Předmět spolupráce</p>
                    <p>Tímto prohlašuji, že žádám o přístup k detailním informacím o nemovitosti/poptávce prostřednictvím platformy Estate Private.</p>
                    
                    <p className="font-semibold mt-4">2. Provizní podmínky</p>
                    <p>V případě, že dojde k uzavření obchodu (prodej, pronájem, nebo jiná transakce) týkající se této nemovitosti/poptávky, souhlasím s tím, že společnosti <strong>Estate Private</strong> náleží provize dle platného ceníku a smluvních podmínek.</p>
                    
                    <p className="font-semibold mt-4">3. Důvěrnost informací</p>
                    <p>Zavazuji se zachovávat mlčenlivost o všech informacích, které mi budou poskytnuty v rámci tohoto přístupu.</p>
                    
                    <p className="font-semibold mt-4">4. Platnost kódu</p>
                    <p>Přístupový kód je platný 30 dní od vygenerování a je určen výhradně pro mou osobu. Kód nelze předávat třetím osobám.</p>
                    
                    <p className="font-semibold mt-4">5. Individuální podmínky</p>
                    <p>Beru na vědomí, že každý obchod může mít specifické podmínky, které budou upřesněny v samostatné smlouvě.</p>
                    
                    <p className="font-semibold mt-4">6. Souhlas se zpracováním</p>
                    <p>Souhlasím se zpracováním mých osobních údajů pro účely této spolupráce v souladu s GDPR.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 bg-white border-2 border-primary-300">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToLOI}
                  onChange={(e) => setAgreedToLOI(e.target.checked)}
                  className="w-5 h-5 mt-1"
                />
                <span className="text-sm">
                  <strong className="text-primary-900">Souhlasím s podmínkami LOI</strong> a beru na vědomí, že v případě uzavření obchodu náleží společnosti Estate Private provize. Potvrzuji, že jsem si přečetl(a) a rozumím všem výše uvedeným podmínkám.
                </span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setStep(1)} className="glass-button-secondary flex-1 rounded-full">
                Zpět
              </button>
              <button 
                onClick={handleGenerateCode} 
                disabled={!agreedToLOI || loading}
                className="glass-button flex-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generuji kód...' : 'Souhlasím a generovat kód'}
              </button>
            </div>
          </div>
        )}

        {/* Krok 3: Potvrzení */}
        {step === 3 && generatedCode && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-green-50 border border-green-200 text-center">
              <div className="icon-circle bg-green-100 text-green-600 mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">Kód byl vygenerován!</h3>
              <p className="text-green-700 mb-4">
                Přístupový kód byl odeslán na váš email: <strong>{currentUser.email}</strong>
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-green-300 inline-block">
                <p className="text-sm text-gray-600 mb-1">Váš přístupový kód:</p>
                <p className="text-3xl font-bold text-primary-600 tracking-wider">{generatedCode}</p>
              </div>
            </div>

            <div className="glass-card p-4 bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="icon-circle icon-circle-sm bg-blue-100 text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Další kroky:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Zkontrolujte svůj email ({currentUser.email})</li>
                    <li>Najděte email s přístupovým kódem</li>
                    <li>Klikněte na nemovitost/poptávku a zadejte kód</li>
                    <li>Získáte přístup k detailním informacím</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button onClick={onClose} className="glass-button-secondary flex-1 rounded-full">
                Zavřít
              </button>
              <button 
                onClick={() => {
                  onClose()
                  if (onCodeGenerated) {
                    onCodeGenerated(entity, entityType)
                  }
                }} 
                className="glass-button flex-1 rounded-full"
              >
                Zadat kód nyní
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AgentDeclarationModal({ isOpen, onClose, currentUser, onVerified }) {
  const [step, setStep] = useState(1) // 1 = Prohlášení, 2 = Generování kódu, 3 = Zadání kódu
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [enteredCode, setEnteredCode] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleGenerateCode = async () => {
    if (!agreed) {
      alert('Musíte souhlasit s prohlášením')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/agent-declarations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          send_email: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při generování kódu')
      }

      const data = await response.json()
      setGeneratedCode(data.code)
      setStep(2)
    } catch (error) {
      alert('Chyba: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (enteredCode.length !== 6) {
      setError('Kód musí mít 6 znaků')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/agent-declarations/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          code: enteredCode
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Neplatný kód')
      }

      // Kód je správný
      onVerified()
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gradient">
            Prohlášení agenta
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {/* Krok 1: Prohlášení */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-4">
                <div className="icon-circle bg-amber-100 text-amber-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">Prohlášení pod smluvní pokutou</h3>
                  <div className="space-y-3 text-sm text-amber-800 max-h-96 overflow-y-auto p-4 bg-white rounded-lg">
                    <p className="font-semibold text-base">Prohlašuji, že:</p>
                    
                    <p className="font-semibold mt-4">1. Platná smlouva s vlastníkem</p>
                    <p>Mám uzavřenou platnou zprostředkovatelskou smlouvu s vlastníkem nemovitosti, kterou chci vložit do systému Estate Private. Tato smlouva je v souladu se zákonem a opravňuje mě k nabízení této nemovitosti.</p>
                    
                    <p className="font-semibold mt-4">2. Pravdivost údajů</p>
                    <p>Všechny údaje o nemovitosti, které vložím do systému, jsou pravdivé a odpovídají skutečnosti. Zavazuji se neprodleně aktualizovat jakékoliv změny.</p>
                    
                    <p className="font-semibold mt-4">3. Exkluzivita a provize</p>
                    <p>Beru na vědomí, že pokud dojde k uzavření obchodu prostřednictvím platformy Estate Private, náleží společnosti Estate Private provize dle platného ceníku.</p>
                    
                    <p className="font-semibold mt-4">4. Smluvní pokuta</p>
                    <p className="text-red-700 font-semibold">V případě, že toto prohlášení není pravdivé nebo pokud poruším jakékoliv z výše uvedených bodů, zavazuji se uhradit smluvní pokutu ve výši 50 000 Kč a nahradit veškerou škodu, která tímto vznikne společnosti Estate Private nebo třetím stranám.</p>
                    
                    <p className="font-semibold mt-4">5. Ochrana osobních údajů</p>
                    <p>Souhlasím se zpracováním mých osobních údajů pro účely této spolupráce v souladu s GDPR.</p>
                    
                    <p className="mt-4 text-gray-600 text-xs">
                      Datum: {new Date().toLocaleDateString('cs-CZ')}<br />
                      Agent: {currentUser.name}<br />
                      Email: {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 bg-white border-2 border-red-300">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 mt-1"
                />
                <span className="text-sm">
                  <strong className="text-red-900">Souhlasím s prohlášením pod smluvní pokutou</strong> a potvrzuji, že mám uzavřenou platnou smlouvu s vlastníkem nemovitosti. Jsem si vědom(a) důsledků nepravdivého prohlášení včetně smluvní pokuty 50 000 Kč.
                </span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button onClick={onClose} className="glass-button-secondary flex-1 rounded-full">
                Zrušit
              </button>
              <button 
                onClick={handleGenerateCode} 
                disabled={!agreed || loading}
                className="glass-button flex-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generuji kód...' : 'Souhlasím a pokračovat'}
              </button>
            </div>
          </div>
        )}

        {/* Krok 2: Kód vygenerován */}
        {step === 2 && generatedCode && (
          <div className="space-y-6">
            <div className="glass-card p-6 bg-green-50 border border-green-200 text-center">
              <div className="icon-circle bg-green-100 text-green-600 mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">Ověřovací kód byl odeslán!</h3>
              <p className="text-green-700 mb-4">
                Kód byl odeslán na váš email: <strong>{currentUser.email}</strong>
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-green-300 inline-block">
                <p className="text-sm text-gray-600 mb-1">Váš ověřovací kód:</p>
                <p className="text-3xl font-bold text-primary-600 tracking-wider">{generatedCode}</p>
              </div>
            </div>

            <div className="glass-card p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zadejte 6-místný ověřovací kód
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                className="glass-input text-center text-2xl tracking-widest font-bold"
                placeholder="XXXXXX"
              />
              <p className="text-xs text-gray-500 mt-2">
                {enteredCode.length}/6 znaků
              </p>
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button onClick={onClose} className="glass-button-secondary flex-1 rounded-full">
                Zrušit
              </button>
              <button 
                onClick={handleVerifyCode}
                disabled={enteredCode.length !== 6 || loading}
                className="glass-button flex-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Ověřuji...' : 'Ověřit kód'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RegistrationForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address_street: '',
    address_city: '',
    address_zip: '',
    ico: '',
    dic: '',
    company: '',
    company_position: '',
    user_type: 'demand_only', // demand_only nebo offer
    demand_description: ''
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Validace IČO pro agenty
      if (formData.user_type === 'offer' && !formData.ico) {
        setError('IČO je povinné pro uživatele, kteří nabízejí nemovitosti')
        setLoading(false)
        return
      }
      
      const response = await fetch(`${API_URL}/registration-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requested_role: formData.user_type === 'offer' ? 'agent' : 'client'
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Chyba při odesílání registrace')
      }
      
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 3000)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-card max-w-md w-full mx-4 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Registrace odeslána!</h3>
          <p className="text-gray-600">
            Vaše žádost byla úspěšně odeslána. Budeme vás kontaktovat po schválení.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full mx-4 my-8 p-8">
        <h2 className="text-3xl font-bold text-gradient mb-6">Registrace na waitlist</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Typ uživatele */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Co chcete dělat?</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-lg p-4 transition ${
                formData.user_type === 'demand_only' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="user_type"
                  value="demand_only"
                  checked={formData.user_type === 'demand_only'}
                  onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-semibold text-lg mb-1">Jen poptávám</div>
                  <div className="text-xs text-gray-600">Hledám nemovitost</div>
                </div>
              </label>
              
              <label className={`cursor-pointer border-2 rounded-lg p-4 transition ${
                formData.user_type === 'offer' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="user_type"
                  value="offer"
                  checked={formData.user_type === 'offer'}
                  onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-semibold text-lg mb-1">Nabízím</div>
                  <div className="text-xs text-gray-600">Prodávám/pronajímám</div>
                </div>
              </label>
            </div>
          </div>

          {/* Osobní údaje */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jméno *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Příjmení *</label>
              <input
                type="text"
                required
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="glass-input"
                placeholder="+420 123 456 789"
              />
            </div>
          </div>

          {/* Adresa s našeptávačem */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-gradient text-lg">Ulice a číslo popisné</span>
              <span className="block text-xs text-gray-500 mt-1 font-normal">
                Inteligentní našeptávač - automaticky vyplní město a PSČ
              </span>
            </label>
            <AddressSuggest
              value={formData.address_street}
              onChange={(address, details) => {
                setFormData({
                  ...formData,
                  address_street: details?.street || address,
                  address_city: details?.city || formData.address_city,
                  address_zip: details?.zip || formData.address_zip
                })
              }}
              placeholder="Začněte psát adresu... (např. Václavské náměstí 1, Praha)"
              className="glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Město</label>
              <input
                type="text"
                value={formData.address_city}
                onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PSČ</label>
              <input
                type="text"
                value={formData.address_zip}
                onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                className="glass-input"
                placeholder="110 00"
              />
            </div>
          </div>

          {/* Firemní údaje s našeptávačem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vyhledat firmu podle IČO {formData.user_type === 'offer' && '*'}
            </label>
            <CompanySuggest
              value={formData.ico}
              onChange={(value) => setFormData({ ...formData, ico: value })}
              onCompanySelect={(company) => {
                setFormData({
                  ...formData,
                  ico: company.ico,
                  dic: company.dic || formData.dic,
                  company: company.name,
                  address_street: company.street || formData.address_street,
                  address_city: company.city || formData.address_city,
                  address_zip: company.zip || formData.address_zip
                })
              }}
              placeholder="Začněte psát IČO nebo název firmy..."
              className="glass-input"
              required={formData.user_type === 'offer'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IČO</label>
              <input
                type="text"
                value={formData.ico}
                onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
                className="glass-input bg-gray-50"
                placeholder="12345678"
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DIČ</label>
              <input
                type="text"
                value={formData.dic}
                onChange={(e) => setFormData({ ...formData, dic: e.target.value })}
                className="glass-input"
                placeholder="CZ12345678"
              />
            </div>
          </div>

          {formData.ico && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Název firmy</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pozice ve firmě</label>
                <input
                  type="text"
                  value={formData.company_position}
                  onChange={(e) => setFormData({ ...formData, company_position: e.target.value })}
                  className="glass-input"
                />
              </div>
            </>
          )}

          {/* Poptávka */}
          {formData.user_type === 'demand_only' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Co poptáváte? (volitelné)
              </label>
              <textarea
                value={formData.demand_description}
                onChange={(e) => setFormData({ ...formData, demand_description: e.target.value })}
                className="glass-input"
                rows={4}
                placeholder="Popište, jakou nemovitost hledáte..."
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">Co bude dál?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Vaše žádost zkontrolujeme</li>
              <li>Po schválení vám zašleme přístupový kód</li>
              <li>Podepíšete smlouvu o spolupráci</li>
              <li>Nastavíte si heslo a můžete začít</li>
            </ol>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="glass-button-secondary flex-1 rounded-full"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glass-button flex-1 rounded-full"
            >
              {loading ? 'Odesílám...' : 'Odeslat žádost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RegistrationRequestsPage({ requests, onApprove, onReject }) {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [filter, setFilter] = useState('pending') // pending, approved, rejected, all

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="fade-in">
      <div className="glass-card mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Registrační žádosti</h3>
            <p className="text-sm text-gray-600 mt-1">
              {requests.length} žádostí celkem
              {pendingCount > 0 && (
                <span className="ml-2 text-yellow-600 font-semibold">
                  ({pendingCount} čeká na schválení)
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filter === 'pending' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Čekající ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filter === 'approved' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Schválené ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filter === 'rejected' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Zamítnuté ({requests.filter(r => r.status === 'rejected').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                : 'hover:bg-white/30'
            }`}
          >
            Vše ({requests.length})
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p className="text-gray-500">Žádné registrace k zobrazení</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div key={request.id} className="glass-card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {request.name} {request.surname}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'pending' ? 'Čeká na schválení' :
                       request.status === 'approved' ? 'Schváleno' : 'Zamítnuto'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.requested_role === 'agent' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {request.requested_role === 'agent' ? 'Agent' : 'Klient'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Email:</p>
                      <p className="font-medium">{request.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Telefon:</p>
                      <p className="font-medium">{request.phone}</p>
                    </div>
                    {request.address_street && (
                      <div>
                        <p className="text-gray-600">Adresa:</p>
                        <p className="font-medium">
                          {request.address_street}, {request.address_city} {request.address_zip}
                        </p>
                      </div>
                    )}
                    {request.ico && (
                      <div>
                        <p className="text-gray-600">IČO:</p>
                        <p className="font-medium">{request.ico}</p>
                      </div>
                    )}
                    {request.company && (
                      <div>
                        <p className="text-gray-600">Firma:</p>
                        <p className="font-medium">{request.company}</p>
                      </div>
                    )}
                    {request.demand_description && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Poptávka:</p>
                        <p className="font-medium">{request.demand_description}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Vytvořeno:</p>
                      <p className="font-medium">
                        {new Date(request.created_at).toLocaleString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowApprovalModal(true)
                      }}
                      className="glass-button px-4 py-2 rounded-full"
                    >
                      Schválit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Opravdu chcete zamítnout tuto registraci?')) {
                          const reason = prompt('Důvod zamítnutí:')
                          if (reason) {
                            onReject(request.id, reason)
                          }
                        }
                      }}
                      className="glass-button-secondary px-4 py-2 rounded-full text-red-600"
                    >
                      Zamítnout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showApprovalModal && selectedRequest && (
        <ApprovalModal
          request={selectedRequest}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedRequest(null)
          }}
          onApprove={(approvalData) => {
            onApprove(selectedRequest, approvalData)
            setShowApprovalModal(false)
            setSelectedRequest(null)
          }}
        />
      )}
    </div>
  )
}

function ApprovalModal({ request, onClose, onApprove }) {
  const [formData, setFormData] = useState({
    contract_type: request.requested_role === 'agent' 
      ? 'cooperation_agent' 
      : 'cooperation_client',
    commission_rate: request.requested_role === 'agent' ? 3 : 0,
    commission_terms: request.requested_role === 'agent' 
      ? 'Provize 3% z prodejní ceny nemovitosti' 
      : '',
    admin_notes: ''
  })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card max-w-2xl w-full mx-4 p-8">
        <h2 className="text-3xl font-bold text-gradient mb-6">
          Schválení registrace
        </h2>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-lg mb-2">
            {request.name} {request.surname}
          </h3>
          <p className="text-sm text-gray-600">
            {request.email} • {request.phone}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Role: <span className="font-medium">
              {request.requested_role === 'agent' ? 'Agent' : 'Klient'}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ smlouvy
            </label>
            <select
              value={formData.contract_type}
              onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
              className="glass-input"
            >
              {request.requested_role === 'agent' ? (
                <option value="cooperation_agent">Smlouva o spolupráci - Agent</option>
              ) : (
                <>
                  <option value="cooperation_client">Smlouva o spolupráci - Klient</option>
                  <option value="cooperation_client_commission">
                    Smlouva o spolupráci - Klient s provizí
                  </option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provize (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.commission_rate || ''}
              onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
              className="glass-input"
              placeholder="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provizní podmínky
            </label>
            <textarea
              value={formData.commission_terms}
              onChange={(e) => setFormData({ ...formData, commission_terms: e.target.value })}
              className="glass-input"
              rows={3}
              placeholder="Provize 3% z prodejní ceny nemovitosti"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poznámky (interní)
            </label>
            <textarea
              value={formData.admin_notes}
              onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
              className="glass-input"
              rows={2}
              placeholder="Interní poznámky..."
            />
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="glass-button-secondary flex-1 rounded-full"
          >
            Zrušit
          </button>
          <button
            onClick={() => onApprove(formData)}
            className="glass-button flex-1 rounded-full"
          >
            Schválit a odeslat kód
          </button>
        </div>
      </div>
    </div>
  )
}

function EmailTemplatesPage({ templates, onUpdate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <div className="fade-in">
      <div className="glass-card mb-6 p-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Emailové šablony</h3>
          <p className="text-sm text-gray-600 mt-1">{templates.length} šablon</p>
        </div>
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <div key={template.id} className="glass-card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.is_active ? 'Aktivní' : 'Neaktivní'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Klíč:</strong> {template.template_key}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Předmět:</strong> {template.subject}
                </p>
                {template.description && (
                  <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                )}
                {template.variables && (
                  <p className="text-xs text-gray-400">
                    <strong>Proměnné:</strong> {template.variables.split(',').map(v => `{{${v}}}`).join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedTemplate(template)
                  setShowEditModal(true)
                }}
                className="glass-button px-4 py-2 rounded-full"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Upravit
              </button>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && selectedTemplate && (
        <EmailTemplateEditModal
          template={selectedTemplate}
          onClose={() => {
            setShowEditModal(false)
            setSelectedTemplate(null)
          }}
          onSave={async (data) => {
            await onUpdate(selectedTemplate.id, data)
            setShowEditModal(false)
            setSelectedTemplate(null)
          }}
        />
      )}
    </div>
  )
}

function EmailTemplateEditModal({ template, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: template.name,
    subject: template.subject,
    html_content: template.html_content,
    variables: template.variables,
    description: template.description,
    is_active: template.is_active
  })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gradient">Upravit emailovou šablonu</h2>
          <button onClick={onClose} className="glass-button-secondary p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Název</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Předmět emailu</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="glass-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTML obsah
              <span className="text-xs text-gray-500 ml-2">
                Použijte proměnné ve formátu: {'{{'} variableName {'}}'}
              </span>
            </label>
            <textarea
              value={formData.html_content}
              onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
              className="glass-input font-mono text-sm"
              rows={15}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proměnné
              <span className="text-xs text-gray-500 ml-2">
                Oddělené čárkou (např: recipientName,accessCode)
              </span>
            </label>
            <input
              type="text"
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              className="glass-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_active === 1}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium text-gray-700">Aktivní šablona</label>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="glass-button-secondary flex-1 rounded-full"
          >
            Zrušit
          </button>
          <button
            onClick={() => onSave(formData)}
            className="glass-button flex-1 rounded-full"
          >
            Uložit změny
          </button>
        </div>
      </div>
    </div>
  )
}

function ContractTemplatesManager({ templates, onUpdate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    template_key: '',
    name: '',
    description: '',
    template_content: '',
    variables: ''
  })

  console.log('Contract templates:', templates)

  const handleEdit = (template) => {
    setSelectedTemplate(template)
    setFormData({
      template_key: template.template_key,
      name: template.name,
      description: template.description || '',
      template_content: template.template_content,
      variables: template.variables || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/contract-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Chyba pri ukladani')
      }

      alert('Sablona byla ulozena')
      setShowModal(false)
      onUpdate()
    } catch (error) {
      alert('Chyba: ' + error.message)
    }
  }

  return (
    <div className="space-y-4">
      {!templates || templates.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-600">Žádné šablony k dispozici</p>
        </div>
      ) : (
        templates.map(template => (
        <div key={template.id} className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {template.template_key}
              </span>
            </div>
            <button
              onClick={() => handleEdit(template)}
              className="glass-button-secondary px-4 py-2 rounded-full"
            >
              Upravit
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Náhled obsahu:</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-3">
              {template.template_content}
            </p>
          </div>
        </div>
      ))
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upravit šablonu</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Název</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="glass-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Obsah šablony
                    <span className="text-xs text-gray-500 ml-2">
                      Použijte placeholdery: {'{'}{'{'} user_name {'}'}{'}'},  {'{'}{'{'} user_email {'}'}{'}'},  {'{'}{'{'} signature_date {'}'}{'}'}, atd.
                    </span>
                  </label>
                  <textarea
                    value={formData.template_content}
                    onChange={(e) => setFormData({ ...formData, template_content: e.target.value })}
                    className="glass-input font-mono text-sm"
                    rows={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proměnné (JSON)
                  </label>
                  <input
                    type="text"
                    value={formData.variables}
                    onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                    className="glass-input font-mono text-sm"
                    placeholder='["user_name", "user_email", "signature_date"]'
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="glass-button-secondary flex-1 rounded-full"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSave}
                  className="glass-button flex-1 rounded-full"
                >
                  Uložit změny
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
