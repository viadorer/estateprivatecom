import { useState, useEffect, useCallback } from 'react'
import { Building2, Home, Search, Users as UsersIcon, LogOut, Building, Heart, Calendar, Edit, Pause, Play, Grid, List, Clock, User, FileText, Image as ImageIcon, Upload, X, Check, AlertCircle, Mail, Map } from 'lucide-react'
import { LABELS_CS } from './constants'
import GDPRBanner from './components/GDPRBanner'
import AccessCodeModal from './components/AccessCodeModal'
import LOIModal from './components/LOIModal'
import NotificationBell from './components/NotificationBell'
import PendingApprovalsPage from './components/PendingApprovalsPage'
import AddressSuggest from './components/AddressSuggest'
import CompanySuggest from './components/CompanySuggest'
import BrokerageContractModal from './components/BrokerageContractModal'
import EntityHistory from './components/EntityHistory'
import MatchesList from './components/MatchesList'
import SignedDocuments from './components/SignedDocuments'
import UserHistory from './components/UserHistory'
import PropertiesMap from './components/PropertiesMap'
import PropertyCard from './components/PropertyCard'

const API_URL = '/api'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [properties, setProperties] = useState([])
  const [demands, setDemands] = useState([])
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
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

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
    // Načíst data až po inicializaci
    setLoading(false)
    
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
    
    document.addEventListener('copy', handleCopy)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('dragstart', handleDragStart)
    
    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('dragstart', handleDragStart)
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
      const demandsUrl = currentUser && currentUser.role === 'agent'
        ? `${API_URL}/demands?agentId=${currentUser.id}`
        : `${API_URL}/demands${currentUser?.role === 'admin' ? '?show_all=true' : ''}`;
      
      const [propertiesRes, demandsRes, usersRes, companiesRes, statsRes] = await Promise.all([
        fetch(propertiesUrl),
        fetch(demandsUrl),
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/companies`),
        fetch(`${API_URL}/stats`)
      ])
      
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
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Přihlášení selhalo')
      }
      
      const user = await response.json()
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
      setShowLoginModal(false)
      // Data se načtou automaticky přes useEffect
    } catch (error) {
      console.error('Chyba při přihlášení:', error)
      throw error
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
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
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">PrivateEstate</h1>
                <p className="text-xs text-gray-500">Exclusive Real Estate Platform</p>
              </div>
            </div>
            
            {/* Menu */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition ${
                    activeTab === 'dashboard'
                      ? 'glass-button'
                      : 'glass-button-secondary'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition ${
                    activeTab === 'properties'
                      ? 'glass-button'
                      : 'glass-button-secondary'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="font-medium">Nabídky</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('demands')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition ${
                    activeTab === 'demands'
                      ? 'glass-button'
                      : 'glass-button-secondary'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span className="font-medium">Poptávky</span>
                </button>

                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition ${
                    activeTab === 'documents'
                      ? 'glass-button'
                      : 'glass-button-secondary'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Dokumenty</span>
                </button>
                
                {currentUser.role === 'admin' && (
                  <>
                    <button
                      onClick={() => setActiveTab('pending')}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition ${
                        activeTab === 'pending'
                          ? 'glass-button'
                          : 'glass-button-secondary'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Schvalování</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition ${
                        activeTab === 'users'
                          ? 'glass-button'
                          : 'glass-button-secondary'
                      }`}
                    >
                      <UsersIcon className="w-4 h-4" />
                      <span className="font-medium">Uživatelé</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition ${
                        activeTab === 'audit'
                          ? 'glass-button'
                          : 'glass-button-secondary'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Audit</span>
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* User */}
            <div className="flex items-center space-x-3">
              {currentUser ? (
                <>
                  <NotificationBell 
                    userId={currentUser.id}
                    onContractRequired={async (entityType, entityId) => {
                      // Načíst entitu a otevřít modál pro podpis smlouvy
                      try {
                        const endpoint = entityType === 'property' 
                          ? `${API_URL}/properties/${entityId}`
                          : `${API_URL}/demands/${entityId}`
                        const response = await fetch(endpoint)
                        if (response.ok) {
                          const entity = await response.json()
                          setEntityForContract(entity)
                          setEntityTypeForContract(entityType)
                          setShowBrokerageContractModal(true)
                        }
                      } catch (error) {
                        console.error('Chyba při načítání entity:', error)
                      }
                    }}
                  />
                  <button
                    onClick={() => setShowUserDetail(currentUser)}
                    className="glass-card py-2 px-4 flex items-center space-x-3 hover:bg-white/50 transition cursor-pointer"
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
                  <button onClick={handleLogout} className="glass-button-secondary p-2 rounded-full" title="Odhlásit se">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="glass-button rounded-full px-6">
                  Přihlásit se
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!currentUser ? (
          <div className="flex items-center justify-center h-96">
            <div className="glass-card text-center p-12">
              <Building2 className="w-20 h-20 text-purple-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gradient mb-4">Vítejte v PrivateEstate</h2>
              <p className="text-gray-600 mb-6">Exkluzivní realitní platforma</p>
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
              />
            )}
            {activeTab === 'pending' && currentUser.role === 'admin' && (
              <PendingApprovalsPage currentUser={currentUser} />
            )}
            {activeTab === 'users' && currentUser.role === 'admin' && (
              <UsersPage 
                users={users}
                onAdd={() => { setSelectedUser(null); setShowUserModal(true); }}
                onEdit={(user) => { setSelectedUser(user); setShowUserModal(true); }}
                onDelete={handleDeleteUser}
                onViewDetail={(user) => { setSelectedUser(user); setShowUserDetail(true); }}
              />
            )}
            {activeTab === 'audit' && currentUser.role === 'admin' && (
              <AuditLogPage currentUser={currentUser} />
            )}
            {activeTab === 'documents' && (
              <div className="fade-in">
                <h1 className="text-4xl font-bold text-white mb-8">Podepsané dokumenty</h1>
                <SignedDocuments userId={currentUser.id} userRole={currentUser.role} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showLoginModal && <LoginForm onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
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
                  ...data,
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
                  ...data,
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
          onClose={() => setShowPropertyDetail(false)}
          onEdit={() => { setShowPropertyDetail(false); setShowPropertyModal(true); }}
          onToggleStatus={() => {
            handleTogglePropertyStatus(selectedProperty.id, selectedProperty.status)
            setShowPropertyDetail(false)
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
      <h1 className="text-4xl font-bold text-white mb-8">
        Vítejte, {currentUser.name}
      </h1>
      
      <div className="dashboard-grid">
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Celkem nemovitostí</p>
              <p className="text-5xl font-bold text-gradient mt-2">{stats.properties?.total || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.properties?.sale || 0} prodej • {stats.properties?.rent || 0} pronájem
              </p>
            </div>
            <Building className="w-16 h-16 text-purple-400" />
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Aktivní poptávky</p>
              <p className="text-5xl font-bold text-gradient mt-2">{stats.demands?.total || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.demands?.sale || 0} prodej • {stats.demands?.rent || 0} pronájem
              </p>
            </div>
            <Search className="w-16 h-16 text-blue-400" />
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Uživatelé</p>
              <p className="text-5xl font-bold text-gradient mt-2">{stats.users?.total || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.users?.agents || 0} agentů • {stats.users?.clients || 0} klientů
              </p>
            </div>
            <UsersIcon className="w-16 h-16 text-green-400" />
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Nové shody</p>
              <p className="text-5xl font-bold text-gradient mt-2">{stats.matches?.new || 0}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.matches?.total || 0} celkem
              </p>
            </div>
            <Heart className="w-16 h-16 text-red-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Properties({ properties, currentUser, onAdd, onEdit, onDelete, onToggleStatus, onViewDetail, onGenerateCode }) {
  const [viewMode, setViewMode] = useState('grid') // grid, list, map
  const [filters, setFilters] = useState({
    transaction_type: '',
    property_type: '',
    city: '',
    price_min: '',
    price_max: ''
  })
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false)
  const [selectedPropertyForAccess, setSelectedPropertyForAccess] = useState(null)
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ').format(price)
  }

  const filteredProperties = Array.isArray(properties) ? properties.filter(property => {
    if (filters.transaction_type && property.transaction_type !== filters.transaction_type) return false
    if (filters.property_type && property.property_type !== filters.property_type) return false
    if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.price_min && property.price < parseInt(filters.price_min)) return false
    if (filters.price_max && property.price > parseInt(filters.price_max)) return false
    return true
  }) : []

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
      {/* Filtry */}
      <div className="glass-card mb-6 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrování</h3>
        <div className="grid grid-cols-5 gap-4">
          <select
            value={filters.transaction_type}
            onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value })}
            className="glass-input"
          >
            <option value="">Všechny transakce</option>
            <option value="sale">Prodej</option>
            <option value="rent">Pronájem</option>
          </select>
          
          <select
            value={filters.property_type}
            onChange={(e) => setFilters({ ...filters, property_type: e.target.value })}
            className="glass-input"
          >
            <option value="">Všechny typy</option>
            <option value="flat">Byt</option>
            <option value="house">Dům</option>
            <option value="commercial">Komerční</option>
            <option value="land">Pozemek</option>
          </select>
          
          <input
            type="text"
            placeholder="Město"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="glass-input"
          />
          
          <input
            type="number"
            placeholder="Cena od"
            value={filters.price_min}
            onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
            className="glass-input"
          />
          
          <input
            type="number"
            placeholder="Cena do"
            value={filters.price_max}
            onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
            className="glass-input"
          />
        </div>
        <button
          onClick={() => setFilters({ transaction_type: '', property_type: '', city: '', price_min: '', price_max: '' })}
          className="glass-button-secondary mt-3 rounded-full"
        >
          Zrušit filtry
        </button>
      </div>

      <div className="flex justify-between items-center mb-8">
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
            properties={filteredProperties}
            onPropertyClick={(property) => onViewDetail(property)}
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="properties-grid">
          {filteredProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              currentUser={currentUser}
              formatPrice={formatPrice}
              LABELS_CS={LABELS_CS}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onGenerateCode={onGenerateCode}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map(property => (
            <div key={property.id} className="glass-card hover:shadow-lg transition">
              <div className="flex gap-6">
                <div className="w-80 h-56 flex-shrink-0 rounded-lg overflow-hidden relative">
                  <img 
                    src={property.main_image} 
                    alt="Nemovitost"
                    className="w-full h-full object-cover blur-sm"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Náhled</span>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {LABELS_CS[property.property_type]} {property.property_subtype}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-3">
                          <Building className="w-5 h-5 mr-2" />
                          <span className="text-lg">{property.district}</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gradient whitespace-nowrap ml-4">
                        {formatPrice(property.price)} Kč
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8 text-gray-700 mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl font-semibold mr-2">{property.area}</span>
                        <span className="text-sm">m²</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-2xl font-semibold mr-2">{property.rooms}</span>
                        <span className="text-sm">pokoje</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-2xl font-semibold mr-2">{property.floor}</span>
                        <span className="text-sm">patro</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="badge bg-purple-100 text-purple-700">
                        <Building2 className="w-3.5 h-3.5" />
                        {LABELS_CS[property.transaction_type]}
                      </span>
                      <span className="badge bg-blue-100 text-blue-700">
                        <Home className="w-3.5 h-3.5" />
                        {LABELS_CS[property.property_type]}
                      </span>
                      {property.has_balcony && (
                        <span className="badge bg-green-100 text-green-700">Balkon</span>
                      )}
                      {property.has_elevator && (
                        <span className="badge bg-green-100 text-green-700">Výtah</span>
                      )}
                      {property.has_parking && (
                        <span className="badge bg-green-100 text-green-700">Parkování</span>
                      )}
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
          ))}
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

function Demands({ demands, currentUser, onAdd, onEdit, onDelete, onViewDetail, onGenerateCode }) {
  const [filters, setFilters] = useState({
    transaction_type: '',
    property_type: '',
    price_min: '',
    price_max: ''
  })
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false)
  const [selectedDemandForAccess, setSelectedDemandForAccess] = useState(null)
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ').format(price)
  }

  const filteredDemands = demands.filter(demand => {
    if (filters.transaction_type && demand.transaction_type !== filters.transaction_type) return false
    if (filters.property_type && demand.property_type !== filters.property_type) return false
    if (filters.price_min && demand.price_max < parseInt(filters.price_min)) return false
    if (filters.price_max && demand.price_min > parseInt(filters.price_max)) return false
    return true
  })

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
      {/* Filtry */}
      <div className="glass-card mb-6 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrování</h3>
        <div className="grid grid-cols-4 gap-4">
          <select
            value={filters.transaction_type}
            onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value })}
            className="glass-input"
          >
            <option value="">Všechny transakce</option>
            <option value="sale">Prodej</option>
            <option value="rent">Pronájem</option>
          </select>
          
          <select
            value={filters.property_type}
            onChange={(e) => setFilters({ ...filters, property_type: e.target.value })}
            className="glass-input"
          >
            <option value="">Všechny typy</option>
            <option value="flat">Byt</option>
            <option value="house">Dům</option>
            <option value="commercial">Komerční</option>
            <option value="land">Pozemek</option>
          </select>
          
          <input
            type="number"
            placeholder="Cena od"
            value={filters.price_min}
            onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
            className="glass-input"
          />
          
          <input
            type="number"
            placeholder="Cena do"
            value={filters.price_max}
            onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
            className="glass-input"
          />
        </div>
        <button
          onClick={() => setFilters({ transaction_type: '', property_type: '', price_min: '', price_max: '' })}
          className="glass-button-secondary mt-3 rounded-full"
        >
          Zrušit filtry
        </button>
      </div>

      <div className="flex justify-between items-center mb-8">
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
        {filteredDemands.map(demand => {
          const isOwn = isOwnDemand(demand)
          const canViewFull = currentUser.role === 'admin' || isOwn
          
          return (
            <div key={demand.id} className="glass-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {LABELS_CS[demand.transaction_type]} • {LABELS_CS[demand.property_type]}
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
                    {isOwn && (
                      <span className="badge badge-success">
                        <Check className="w-3.5 h-3.5" />
                        Vaše poptávka
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-gray-600">
                    <span>Cena: {formatPrice(demand.price_min)} - {formatPrice(demand.price_max)} Kč</span>
                    <span>Plocha: {demand.area_min} - {demand.area_max} m²</span>
                    <span>Pokoje: {demand.rooms_min} - {demand.rooms_max}</span>
                    {canViewFull ? (
                      <span>Lokace: {demand.cities?.join(', ')}</span>
                    ) : (
                      <span>Lokace: Skryto</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {canViewFull ? (
                    <>
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
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Uživatelé</h1>
        <button onClick={onAdd} className="glass-button rounded-full">+ Přidat uživatele</button>
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
            {users.map(user => (
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
    has_terrace: property?.has_terrace || 0,
    has_cellar: property?.has_cellar || 0,
    has_garage: property?.has_garage || 0,
    has_parking: property?.has_parking || 0,
    has_elevator: property?.has_elevator || 0,
    has_garden: property?.has_garden || 0,
    has_pool: property?.has_pool || 0,
    energy_rating: property?.energy_rating || '',
    heating_type: property?.heating_type || '',
    agent_id: property?.agent_id || (currentUser?.role === 'agent' ? currentUser.id : ''),
    status: property?.status || 'active',
    images: property?.images || [],
    main_image: property?.main_image || '',
    documents: Array.isArray(property?.documents) ? property.documents : (property?.documents ? JSON.parse(property.documents) : []),
    video_url: property?.video_url || '',
    video_tour_url: property?.video_tour_url || '',
    matterport_url: property?.matterport_url || '',
    website_url: property?.website_url || '',
    is_reserved: property?.is_reserved || 0,
    reserved_until: property?.reserved_until || ''
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
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  className="glass-input"
                >
                  <option value="flat">Byt</option>
                  <option value="house">Dům</option>
                  <option value="commercial">Komerční</option>
                  <option value="land">Pozemek</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dispozice</label>
                <select
                  value={formData.property_subtype}
                  onChange={(e) => setFormData({ ...formData, property_subtype: e.target.value })}
                  className="glass-input"
                >
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
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cena (Kč)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="glass-input"
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Ulice a číslo popisné</label>
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
                  placeholder="Začněte psát adresu pro automatické vyplnění..."
                  className="glass-input"
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

          {/* Parametry */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Parametry</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plocha (m²)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="glass-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pokoje</label>
                <input
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                  className="glass-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patro</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="glass-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Celkem pater</label>
                <input
                  type="number"
                  value={formData.total_floors}
                  onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>
          </div>

          {/* Vlastnosti */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Vlastnosti</h3>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.has_balcony}
                  onChange={(e) => setFormData({ ...formData, has_balcony: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Balkon</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.has_elevator}
                  onChange={(e) => setFormData({ ...formData, has_elevator: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Výtah</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.has_parking}
                  onChange={(e) => setFormData({ ...formData, has_parking: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Parkování</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.has_terrace}
                  onChange={(e) => setFormData({ ...formData, has_terrace: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Terasa</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.has_cellar}
                  onChange={(e) => setFormData({ ...formData, has_cellar: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Sklep</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.has_garage}
                  onChange={(e) => setFormData({ ...formData, has_garage: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Garáž</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.has_garden}
                  onChange={(e) => setFormData({ ...formData, has_garden: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Zahrada</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.has_pool}
                  onChange={(e) => setFormData({ ...formData, has_pool: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Bazén</span>
              </label>
            </div>
          </div>

          {/* Další vlastnosti */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Další vlastnosti</h3>
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Plocha pozemku (m²)</label>
                <input
                  type="number"
                  value={formData.land_area}
                  onChange={(e) => setFormData({ ...formData, land_area: e.target.value })}
                  className="glass-input"
                />
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
            </div>
          </div>

          {/* GPS souřadnice */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">GPS souřadnice</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zeměpisná šířka</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="glass-input"
                  placeholder="50.0755"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zeměpisná délka</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="glass-input"
                  placeholder="14.4378"
                />
              </div>
            </div>
          </div>

          {/* Fotografie */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">📸 Fotografie</h3>
            
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

          {/* Rezervace */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Rezervace</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_reserved}
                  onChange={(e) => setFormData({ ...formData, is_reserved: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Nemovitost je rezervována</span>
              </label>
              
              {formData.is_reserved === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rezervováno do</label>
                  <input
                    type="datetime-local"
                    value={formData.reserved_until}
                    onChange={(e) => setFormData({ ...formData, reserved_until: e.target.value })}
                    className="glass-input"
                  />
                </div>
              )}
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
              ) : (
                // Admin může vybrat
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
  const [formData, setFormData] = useState({
    client_id: demand?.client_id || (currentUser.role !== 'admin' ? currentUser.id : ''),
    transaction_type: demand?.transaction_type || 'sale',
    property_type: demand?.property_type || 'flat',
    property_subtype: demand?.property_subtype || '',
    property_types: demand?.property_types || ['flat'], // Pole typů
    transaction_types: demand?.transaction_types || ['sale'], // Pole transakcí
    price_min: demand?.price_min || '',
    price_max: demand?.price_max || '',
    cities: demand?.cities ? demand.cities.join(', ') : '',
    districts: demand?.districts ? demand.districts.join(', ') : '',
    area_min: demand?.area_min || '',
    area_max: demand?.area_max || '',
    rooms_min: demand?.rooms_min || '',
    rooms_max: demand?.rooms_max || '',
    floor_min: demand?.floor_min || '',
    floor_max: demand?.floor_max || '',
    required_features: demand?.required_features || [],
    status: demand?.status || 'active',
    email_notifications: demand?.email_notifications !== undefined ? demand.email_notifications : 1
  })

  const togglePropertyType = (type) => {
    const types = formData.property_types.includes(type)
      ? formData.property_types.filter(t => t !== type)
      : [...formData.property_types, type];
    setFormData({ ...formData, property_types: types, property_type: types[0] || 'flat' })
  }

  const toggleTransactionType = (type) => {
    const types = formData.transaction_types.includes(type)
      ? formData.transaction_types.filter(t => t !== type)
      : [...formData.transaction_types, type];
    setFormData({ ...formData, transaction_types: types, transaction_type: types[0] || 'sale' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      cities: formData.cities.split(',').map(c => c.trim()).filter(c => c),
      districts: formData.districts.split(',').map(d => d.trim()).filter(d => d)
    }
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gradient mb-6">
          {demand ? 'Upravit poptávku' : 'Vytvořit poptávku'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Pole Klient pouze pro admina */}
            {currentUser.role === 'admin' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Klient</label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="glass-input"
                >
                  <option value="">Vyberte klienta</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="col-span-2">
              <div className="glass-card p-4 bg-blue-50 border border-blue-200 mb-4">
                <div className="flex items-start gap-3">
                  <div className="icon-circle icon-circle-sm bg-blue-100 text-blue-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">Multi-poptávka</h4>
                    <p className="text-sm text-blue-700">
                      Můžete vybrat více typů transakcí a nemovitostí. Systém automaticky vytvoří samostatnou poptávku pro každou kombinaci.
                      <br />
                      <strong>Příklad:</strong> Výběr "Prodej + Pronájem" a "Byt + Dům" vytvoří 4 poptávky.
                    </p>
                  </div>
                </div>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">Typ transakce (můžete vybrat více)</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.transaction_types.includes('sale')}
                    onChange={() => toggleTransactionType('sale')}
                    className="w-4 h-4"
                  />
                  <span>Prodej</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.transaction_types.includes('rent')}
                    onChange={() => toggleTransactionType('rent')}
                    className="w-4 h-4"
                  />
                  <span>Pronájem</span>
                </label>
              </div>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Typ nemovitosti (můžete vybrat více)</label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.property_types.includes('flat')}
                    onChange={() => togglePropertyType('flat')}
                    className="w-4 h-4"
                  />
                  <span>Byt</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.property_types.includes('house')}
                    onChange={() => togglePropertyType('house')}
                    className="w-4 h-4"
                  />
                  <span>Dům</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.property_types.includes('commercial')}
                    onChange={() => togglePropertyType('commercial')}
                    className="w-4 h-4"
                  />
                  <span>Komerční</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.property_types.includes('land')}
                    onChange={() => togglePropertyType('land')}
                    className="w-4 h-4"
                  />
                  <span>Pozemek</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cena od (Kč)</label>
              <input
                type="number"
                value={formData.price_min}
                onChange={(e) => setFormData({ ...formData, price_min: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cena do (Kč)</label>
              <input
                type="number"
                value={formData.price_max}
                onChange={(e) => setFormData({ ...formData, price_max: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Města (oddělené čárkou)</label>
              <input
                type="text"
                value={formData.cities}
                onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                className="glass-input"
                placeholder="Praha, Brno, Ostrava"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plocha od (m²)</label>
              <input
                type="number"
                value={formData.area_min}
                onChange={(e) => setFormData({ ...formData, area_min: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plocha do (m²)</label>
              <input
                type="number"
                value={formData.area_max}
                onChange={(e) => setFormData({ ...formData, area_max: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pokoje od</label>
              <input
                type="number"
                value={formData.rooms_min}
                onChange={(e) => setFormData({ ...formData, rooms_min: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pokoje do</label>
              <input
                type="number"
                value={formData.rooms_max}
                onChange={(e) => setFormData({ ...formData, rooms_max: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Okresy (oddělené čárkou)</label>
              <input
                type="text"
                value={formData.districts}
                onChange={(e) => setFormData({ ...formData, districts: e.target.value })}
                className="glass-input"
                placeholder="Praha-východ, Brno-město"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patro od</label>
              <input
                type="number"
                value={formData.floor_min}
                onChange={(e) => setFormData({ ...formData, floor_min: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patro do</label>
              <input
                type="number"
                value={formData.floor_max}
                onChange={(e) => setFormData({ ...formData, floor_max: e.target.value })}
                className="glass-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dispozice</label>
              <select
                value={formData.property_subtype}
                onChange={(e) => setFormData({ ...formData, property_subtype: e.target.value })}
                className="glass-input"
              >
                <option value="">Jakákoliv</option>
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
              </select>
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

function UserModal({ user, companies, onSave, onClose }) {
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
                placeholder="👤 nebo https://..."
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
                🔍 Vyhledat adresu
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
                🔍 Vyhledat firmu podle IČO
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
                placeholder="Vyplní se automaticky"
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

  // Kontrola přístupu k detailu
  useEffect(() => {
    const checkAccess = async () => {
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
    }
    
    checkAccess()
  }, [property.id, currentUser.id])
  
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
      onLOISigned={() => window.location.reload()}
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
              <span className="badge bg-blue-100 text-blue-700">🏠 Moje nabídka</span>
            )}
            {accessReason === 'signed_loi' && (
              <span className="badge bg-green-100 text-green-700">✅ LOI podepsána</span>
            )}
            {accessReason === 'admin' && (
              <span className="badge bg-purple-100 text-purple-700">👑 Admin</span>
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
                  🔍 Zobrazit v plné velikosti
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
                      Estateprivate.com
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
                      <div className="icon-circle icon-circle-sm bg-green-100 text-green-600">
                        <Building className="w-4 h-4" />
                      </div>
                      <span style={{ fontWeight: '600' }}>
                        +420 XXX XXX XXX
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

          {/* Shody (matching demands) - pouze admin */}
          {currentUser.role === 'admin' && (
            <MatchesList entityType="properties" entityId={property.id} currentUser={currentUser} />
          )}

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
              ) : (
                <>
                  {/* Klient a agent vidí jen text a tlačítko */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Estateprivate.com
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

          {/* Požadavky */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Požadavky</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Typ transakce</div>
                <div className="font-semibold">{LABELS_CS[demand.transaction_type]}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Typ nemovitosti</div>
                <div className="font-semibold">{LABELS_CS[demand.property_type]}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Cenové rozpětí</div>
                <div className="font-semibold">
                  {formatPrice(demand.price_min)} - {formatPrice(demand.price_max)} Kč
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Plocha</div>
                <div className="font-semibold">{demand.area_min} - {demand.area_max} m²</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Počet pokojů</div>
                <div className="font-semibold">{demand.rooms_min} - {demand.rooms_max}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Města</div>
                <div className="font-semibold">{demand.cities?.join(', ')}</div>
              </div>
            </div>
          </div>

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

          {/* Shody (matching properties) - pouze admin */}
          {currentUser.role === 'admin' && (
            <MatchesList entityType="demands" entityId={demand.id} currentUser={currentUser} />
          )}

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
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gradient">{user.name}</h2>
              <span className="badge bg-purple-100 text-purple-700">
                {LABELS_CS[user.role]}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="space-y-6">
          {/* Kontaktní informace */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Kontaktní informace</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="font-semibold">{user.email}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-600 mb-1">Telefon</div>
                <div className="font-semibold">{user.phone || '-'}</div>
              </div>
              {user.phone_2 && (
                <div className="glass-card p-4">
                  <div className="text-sm text-gray-600 mb-1">Telefon 2</div>
                  <div className="font-semibold">{user.phone_2}</div>
                </div>
              )}
            </div>
          </div>

          {/* Adresa */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Adresa</h3>
            <div className="glass-card p-4">
              <div>{user.address_street || '-'}</div>
              <div>{user.address_city || '-'} {user.address_zip || ''}</div>
            </div>
          </div>

          {/* Společnost */}
          {user.company_name && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Společnost</h3>
              <div className="glass-card p-4">
                <div className="font-semibold text-lg">{user.company_name}</div>
                {user.company_position && (
                  <div className="text-gray-600">{user.company_position}</div>
                )}
                {user.company_ico && (
                  <div className="text-sm text-gray-600 mt-2">IČO: {user.company_ico}</div>
                )}
              </div>
            </div>
          )}

          {/* Poznámky */}
          {user.notes && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Poznámky</h3>
              <div className="glass-card p-4">
                <p className="text-gray-700">{user.notes}</p>
              </div>
            </div>
          )}

          {/* Historie uživatele */}
          <UserHistory userId={user.id} userName={user.name} />

          {/* Tlačítka pro admina */}
          {currentUser.role === 'admin' && (
            <div className="flex space-x-3 pt-4 border-t">
              <button onClick={onEdit} className="glass-button flex-1 rounded-full">
                Upravit uživatele
              </button>
            </div>
          )}
        </div>
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
      <h1 className="text-4xl font-bold text-white mb-8">Audit Log - Záznamy aktivit</h1>
      
      {/* Filtry */}
      <div className="glass-card mb-6 p-4">
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
              disabled={loading}
              className="glass-button flex-1 rounded-full"
            >
              {loading ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </div>
        </form>
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

export default App
