import { Building2, FileText, Users, Check, Lock, Mail, Calendar, TrendingUp, Shield, Target } from 'lucide-react'

export default function DashboardWelcome({ currentUser }) {
  if (!currentUser) return null

  const renderPortalIntro = () => (
    <div className="glass-card p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 mb-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-900 mb-4">PTF reality - Off-market realitní platforma</h1>
        
        <p className="text-lg text-indigo-800 mb-4 leading-relaxed">
          Vítejte na exkluzivní platformě pro <strong>off-market nemovitosti</strong> - nabídky a poptávky, 
          které nenajdete nikde jinde. Propojujeme realitní agenty s klienty prostřednictvím inteligentního 
          párování a zajišťujeme maximální ochranu dat.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 bg-white/60">
            <h3 className="font-bold text-indigo-900 mb-2">Kdo jsou naši agenti?</h3>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Realitní makléři a zprostředkovatelé</li>
              <li>• Realitní kanceláře a agentury</li>
              <li>• Developeři s novými projekty</li>
              <li>• Investoři s portfoliem nemovitostí</li>
              <li>• Správci nemovitostí</li>
            </ul>
          </div>
          
          <div className="glass-card p-4 bg-white/60">
            <h3 className="font-bold text-indigo-900 mb-2">Kdo jsou naši klienti?</h3>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Soukromí investoři</li>
              <li>• Developeři hledající pozemky</li>
              <li>• Firmy a korporace</li>
              <li>• Investiční fondy</li>
              <li>• Fyzické osoby hledající bydlení</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 bg-white/80">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-indigo-100 text-indigo-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Exkluzivní nabídky</h3>
                <p className="text-sm text-gray-600">
                  Off-market nemovitosti dostupné pouze pro registrované agenty a klienty
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white/80">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-purple-100 text-purple-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Inteligentní párování</h3>
                <p className="text-sm text-gray-600">
                  Automatické propojení nabídek s poptávkami podle parametrů
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white/80">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-pink-100 text-pink-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Ochrana dat</h3>
                <p className="text-sm text-gray-600">
                  LOI systém zajišťuje přístup pouze pro vážné zájemce
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 bg-white border-2 border-indigo-200 shadow-lg">
          <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-indigo-900">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Naše poslání
          </h3>
          <p className="text-gray-800 leading-relaxed text-base">
            Vytvářet bezpečné a efektivní prostředí pro obchodování s off-market nemovitostmi, 
            kde se setkávají profesionální realitní agenti s klienty hledajícími exkluzivní příležitosti. 
            Poskytujeme nástroje pro rychlé propojení nabídky s poptávkou při zachování maximální 
            diskrétnosti a ochrany citlivých informací.
          </p>
        </div>
      </div>
    </div>
  )

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {renderPortalIntro()}
      
      <div className="glass-card p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">Administrace systému</h2>
        <p className="text-purple-700 mb-4">
          Jako <strong>administrátor</strong> máte plnou kontrolu nad off-market platformou PTF reality.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-purple-100 text-purple-600">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Schvalování nabídek a poptávek</h3>
                <p className="text-sm text-gray-600">
                  Kontrolujte a schvalujte nové nabídky od agentů. Nastavujte provize a podmínky zprostředkovatelských smluv.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-blue-100 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Správa uživatelů</h3>
                <p className="text-sm text-gray-600">
                  Vytvářejte a spravujte účty agentů a klientů. Resetujte hesla a upravujte oprávnění.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-green-100 text-green-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Plný přístup k datům</h3>
                <p className="text-sm text-gray-600">
                  Vidíte všechny nabídky, poptávky a kontaktní údaje bez omezení. Přístup k detailům bez LOI.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-amber-100 text-amber-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Audit a reporting</h3>
                <p className="text-sm text-gray-600">
                  Sledujte všechny akce v systému prostřednictvím audit logu. Exportujte data a generujte reporty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3">Novinky v systému</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>LOI systém:</strong> Nový systém Letter of Intent pro kontrolu přístupu k detailům nabídek</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Reset hesla:</strong> Možnost resetovat hesla uživatelů přímo z administrace</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Badgy na kartách:</strong> Vizuální indikátory pro vlastní nabídky, LOI a smlouvy</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Email notifikace:</strong> Automatické odesílání kódů pro LOI a smlouvy</span>
          </li>
        </ul>
      </div>
    </div>
  )

  const renderAgentDashboard = () => (
    <div className="space-y-6">
      {renderPortalIntro()}
      
      <div className="glass-card p-6 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
        <h2 className="text-2xl font-bold text-green-900 mb-4">Vítejte, {currentUser.name}</h2>
        <p className="text-green-700 mb-4">
          Jako <strong>realitní agent</strong> (makléř, developer, investor nebo správce nemovitostí) 
          můžete přidávat exkluzivní off-market nabídky a získávat přístup k poptávkám klientů, 
          které nenajdete na běžných portálech.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-green-100 text-green-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Off-market nabídky</h3>
                <p className="text-sm text-gray-600">
                  Přidávejte exkluzivní nemovitosti, které nejsou na běžných portálech. 
                  Po schválení adminem podepíšete zprostředkovatelskou smlouvu a nabídka se zpřístupní klientům.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-blue-100 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">LOI pro přístup k detailům</h3>
                <p className="text-sm text-gray-600">
                  Pro zobrazení detailů cizích nabídek nebo poptávek musíte podepsat LOI (Letter of Intent). Kód obdržíte emailem.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-purple-100 text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Přístup k poptávkám</h3>
                <p className="text-sm text-gray-600">
                  Vidíte všechny aktivní poptávky klientů. Pro kontaktní údaje a detaily podepište LOI.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-amber-100 text-amber-600">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Automatické párování</h3>
                <p className="text-sm text-gray-600">
                  Systém automaticky najde shody mezi vašimi nabídkami a poptávkami klientů.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 bg-amber-50 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-3">Jak funguje schvalování nabídek?</h3>
        <ol className="space-y-3 text-sm text-amber-800">
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">1.</span>
            <span>Vytvoříte novou nabídku s kompletními údaji a fotkami</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">2.</span>
            <span>Admin zkontroluje nabídku a nastaví provizi PTF reality</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">3.</span>
            <span>Obdržíte email s kódem pro podpis zprostředkovatelské smlouvy</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">4.</span>
            <span>Po podpisu smlouvy se nabídka aktivuje a zobrazí se klientům</span>
          </li>
        </ol>
      </div>

      <div className="glass-card p-6 bg-green-50 border border-green-200">
        <h3 className="text-lg font-bold text-green-900 mb-3">Novinky pro agenty</h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Badgy na kartách:</strong> Vaše nabídky jsou označeny "Moje", podepsané LOI "LOI"</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Rychlý přístup:</strong> LOI můžete podepsat přímo z detailu nabídky/poptávky</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Automatické vyplnění:</strong> Při vytváření nabídky jste automaticky vybraný jako agent</span>
          </li>
        </ul>
      </div>
    </div>
  )

  const renderClientDashboard = () => (
    <div className="space-y-6">
      {renderPortalIntro()}
      
      <div className="glass-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Vítejte, {currentUser.name}</h2>
        <p className="text-blue-700 mb-4">
          Jako <strong>klient</strong> (investor, developer, firma nebo fyzická osoba) máte přístup 
          k exkluzivním off-market nabídkám, které nejsou veřejně dostupné. Vytvořte poptávku 
          a systém vás automaticky propojí s vhodnými nemovitostmi.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-blue-100 text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Exkluzivní nabídky</h3>
                <p className="text-sm text-gray-600">
                  Přístup k off-market nemovitostem, které nenajdete nikde jinde. 
                  Pro zobrazení detailů a kontaktů podepište LOI a vyjádřete vážný zájem.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-green-100 text-green-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Vytváření poptávek</h3>
                <p className="text-sm text-gray-600">
                  Zadejte parametry nemovitosti, kterou hledáte. Systém vás automaticky propojí s vhodnými nabídkami.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-purple-100 text-purple-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">LOI systém</h3>
                <p className="text-sm text-gray-600">
                  Letter of Intent chrání vaše údaje a zajišťuje, že agenti mají vážný zájem o vaši poptávku.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="icon-circle bg-amber-100 text-amber-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Email notifikace</h3>
                <p className="text-sm text-gray-600">
                  Dostávejte upozornění na nové nabídky, které odpovídají vaší poptávce.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 bg-indigo-50 border border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-900 mb-3">Jak funguje LOI (Letter of Intent)?</h3>
        <ol className="space-y-3 text-sm text-indigo-800">
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">1.</span>
            <span>Najdete zajímavou nabídku a kliknete na "Detail"</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">2.</span>
            <span>Systém vás vyzve k podpisu LOI - vyjádření vážného zájmu</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">3.</span>
            <span>Obdržíte 6-místný kód na email pro potvrzení</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold flex-shrink-0">4.</span>
            <span>Po zadání kódu získáte přístup k detailům a kontaktům na agenta</span>
          </li>
        </ol>
      </div>

      <div className="glass-card p-6 bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3">Novinky pro klienty</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Jednoduchý LOI proces:</strong> Podpis LOI přímo v aplikaci s kódem z emailu</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Ochrana dat:</strong> Vaše kontaktní údaje vidí pouze agenti s podepsanou LOI</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Přehled smluv:</strong> Všechny podepsané LOI najdete v sekci "Podepsané dokumenty"</span>
          </li>
        </ul>
      </div>
    </div>
  )

  return (
    <div className="mb-8">
      {currentUser.role === 'admin' && renderAdminDashboard()}
      {currentUser.role === 'agent' && renderAgentDashboard()}
      {currentUser.role === 'client' && renderClientDashboard()}
    </div>
  )
}
