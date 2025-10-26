// VYVOJOVY REZIM - Konfigurace pro zjednoduseni vyvoje
// Pro produkci nastavte vse na true/enable

export const DEV_CONFIG = {
  // === AUTENTIZACE ===
  auth: {
    requireLogin: true,           // false = automaticke prihlaseni jako admin
    checkTokenExpiration: true,   // false = tokeny nevyprsi
    requireStrongPassword: false, // false = povoleni slabych hesel (heslo123)
    autoLoginAs: 'admin@realitka.cz' // Email pro automaticke prihlaseni (kdyz requireLogin = false)
  },

  // === RATE LIMITING ===
  rateLimiting: {
    enabled: false,              // false = zadne limity
    authLimit: 50,               // Pocet pokusu o prihlaseni (puvodne 5)
    apiLimit: 1000               // Pocet API requestu (puvodne 100)
  },

  // === EMAILOVE NOTIFIKACE ===
  email: {
    sendEmails: true,            // false = emaily se neodesilaji (jen loguje)
    showCodeInConsole: true,     // true = pristupove kody v konzoli
    autoApproveRegistrations: false // true = automaticke schvalovani registraci
  },

  // === SCHVALOVANI ===
  approval: {
    requirePropertyApproval: true,   // false = nabidky jdou primo do active
    requireDemandApproval: true,     // false = poptavky jdou primo do active
    allAgentsVerified: true          // true = vsichni agenti jsou overeni (verified_agent=1)
  },

  // === LOI A SMLOUVY ===
  loi: {
    requireLOI: true,            // false = pristup k detailum bez LOI
    requireBrokerageContract: true, // false = bez zprostredkovatelske smlouvy
    skipCodeVerification: false  // true = jakykoli kod projde
  },

  // === GDPR ===
  gdpr: {
    requireConsent: true,        // false = bez GDPR souhlasu
    logDataAccess: true,         // false = nelogovat pristup k datum
    anonymizeData: false         // true = anonymizovat citlive udaje
  },

  // === VALIDACE ===
  validation: {
    strictValidation: false,     // false = mene prisna validace
    requireAllFields: false,     // false = nepovinne vsechny fieldy
    validateEmails: true,        // false = nevalidovat email formaty
    validatePhones: false        // false = nevalidovat telefony
  },

  // === IMPORT API ===
  importApi: {
    requireApiKey: true,         // false = import bez API klice
    checkRateLimit: true,        // false = neomezeny import
    validateData: false          // false = nevalidovat importovana data
  },

  // === DEBUGGING ===
  debug: {
    logAllQueries: false,        // true = logovat vsechny SQL dotazy
    logAllRequests: false,       // true = logovat vsechny HTTP requesty
    verboseErrors: true,         // true = detailni chybove hlasky
    showStackTraces: true        // true = zobrazit stack traces
  }
}

// Helper funkce pro kontrolu dev rezimu
export const isDev = () => process.env.NODE_ENV === 'development'

// Helper pro vypis konfigurace
export const printDevConfig = () => {
  console.log('\n=== VYVOJOVY REZIM - Aktualni konfigurace ===\n')
  
  console.log('AUTENTIZACE:')
  console.log(`  - Vyžadovat přihlášení: ${DEV_CONFIG.auth.requireLogin ? 'ANO' : 'NE (auto-login)'}`)
  console.log(`  - Kontrola expirace tokenů: ${DEV_CONFIG.auth.checkTokenExpiration ? 'ANO' : 'NE'}`)
  console.log(`  - Silná hesla: ${DEV_CONFIG.auth.requireStrongPassword ? 'ANO' : 'NE'}`)
  
  console.log('\nRATE LIMITING:')
  console.log(`  - Zapnuto: ${DEV_CONFIG.rateLimiting.enabled ? 'ANO' : 'NE'}`)
  console.log(`  - Auth limit: ${DEV_CONFIG.rateLimiting.authLimit} pokusů`)
  console.log(`  - API limit: ${DEV_CONFIG.rateLimiting.apiLimit} requestů`)
  
  console.log('\nEMAILY:')
  console.log(`  - Odesílat emaily: ${DEV_CONFIG.email.sendEmails ? 'ANO' : 'NE (pouze log)'}`)
  console.log(`  - Kódy v konzoli: ${DEV_CONFIG.email.showCodeInConsole ? 'ANO' : 'NE'}`)
  
  console.log('\nSCHVALOVANI:')
  console.log(`  - Schvalovat nabídky: ${DEV_CONFIG.approval.requirePropertyApproval ? 'ANO' : 'NE (auto-active)'}`)
  console.log(`  - Schvalovat poptávky: ${DEV_CONFIG.approval.requireDemandApproval ? 'ANO' : 'NE (auto-active)'}`)
  console.log(`  - Všichni agenti ověřeni: ${DEV_CONFIG.approval.allAgentsVerified ? 'ANO' : 'NE'}`)
  
  console.log('\nLOI A SMLOUVY:')
  console.log(`  - Vyžadovat LOI: ${DEV_CONFIG.loi.requireLOI ? 'ANO' : 'NE'}`)
  console.log(`  - Vyžadovat smlouvu: ${DEV_CONFIG.loi.requireBrokerageContract ? 'ANO' : 'NE'}`)
  
  console.log('\nDEBUGGING:')
  console.log(`  - Logovat SQL: ${DEV_CONFIG.debug.logAllQueries ? 'ANO' : 'NE'}`)
  console.log(`  - Logovat requesty: ${DEV_CONFIG.debug.logAllRequests ? 'ANO' : 'NE'}`)
  console.log(`  - Detailní errory: ${DEV_CONFIG.debug.verboseErrors ? 'ANO' : 'NE'}`)
  
  console.log('\n============================================\n')
}

// Export pro pouziti v kodu
export default DEV_CONFIG
