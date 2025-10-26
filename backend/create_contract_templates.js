import Database from 'better-sqlite3';

const db = new Database('realestate.db');

// Vytvoření tabulky
db.exec(`
  CREATE TABLE IF NOT EXISTS contract_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    template_content TEXT NOT NULL,
    variables TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('Tabulka contract_templates vytvorena');

// Šablony smluv
const templates = [
  {
    template_key: 'loi',
    name: 'Letter of Intent (LOI)',
    description: 'Dohoda o záměru - přístup k důvěrným informacím',
    template_content: `DOHODA O ZÁMĚRU
(Letter of Intent)

Datum: {{signature_date}}
Čas: {{signature_time}}

ÚČASTNÍCI DOHODY:

1. Poskytovatel informací:
   Estate Private, s.r.o.
   
2. Příjemce informací:
   Jméno: {{user_name}}
   Email: {{user_email}}
   {{user_company}}
   {{user_ico}}

PŘEDMĚT DOHODY:

Tato Dohoda o záměru upravuje podmínky poskytnutí důvěrných informací týkajících se {{entity_type}}:
{{entity_name}}

PROHLÁŠENÍ PŘÍJEMCE:

Příjemce prohlašuje, že:

1. Má vážný zájem o {{entity_type}} a hodlá posoudit možnost transakce
2. Bude zachovávat mlčenlivost o všech poskytnutých informacích
3. Použije informace výhradně pro účely posouzení této transakce
4. Nebude informace sdílet s třetími stranami bez předchozího souhlasu
5. Vrátí nebo zničí všechny poskytnuté materiály na požádání

DŮVĚRNOST:

Příjemce se zavazuje:
- Chránit důvěrné informace před neoprávněným přístupem
- Nepoužívat informace k jiným účelům než k posouzení transakce
- Respektovat GDPR a ochranu osobních údajů
- Neprodleně informovat o jakémkoliv úniku informací

PLATNOST:

Tato dohoda je platná po dobu 90 dnů od podpisu.
Povinnost mlčenlivosti trvá i po ukončení dohody.

PRÁVNÍ DŮSLEDKY:

Porušení této dohody může vést k:
- Náhradě škody
- Smluvní pokutě
- Trestněprávní odpovědnosti

PODPIS:

Elektronicky podepsáno dne {{signature_date}} v {{signature_time}}
Ověřovací kód: [KÓD]

Příjemce: {{user_name}}
Email: {{user_email}}`,
    variables: JSON.stringify(['user_name', 'user_email', 'user_company', 'user_ico', 'entity_type', 'entity_name', 'signature_date', 'signature_time'])
  },
  {
    template_key: 'brokerage_contract',
    name: 'Zprostředkovatelská smlouva',
    description: 'Smlouva o zprostředkování prodeje/pronájmu nemovitosti',
    template_content: `SMLOUVA O ZPROSTŘEDKOVÁNÍ

Datum: {{signature_date}}

SMLUVNÍ STRANY:

1. Zprostředkovatel:
   Estate Private, s.r.o.
   
2. Zadavatel:
   Jméno: {{user_name}}
   Email: {{user_email}}
   {{user_company}}
   {{user_ico}}

PŘEDMĚT SMLOUVY:

Zprostředkování {{transaction_type}} nemovitosti:
{{property_title}}
{{property_address}}

PROVIZE:

Výše provize: {{commission_rate}}%
{{commission_terms}}

PRÁVA A POVINNOSTI ZPROSTŘEDKOVATELE:

1. Aktivně vyhledávat potenciální zájemce
2. Prezentovat nemovitost na platformě Estate Private
3. Zajistit prohlídky nemovitosti
4. Asistovat při jednání s kupujícími/nájemci
5. Pomoci s přípravou dokumentace

PRÁVA A POVINNOSTI ZADAVATELE:

1. Poskytnout pravdivé informace o nemovitosti
2. Umožnit prohlídky nemovitosti
3. Uhradit provizi při úspěšném zprostředkování
4. Informovat o změnách týkajících se nemovitosti

PLATNOST:

Smlouva je uzavřena na dobu určitou do: {{valid_until}}

UKONČENÍ:

Smlouva může být ukončena:
- Dohodou obou stran
- Výpovědí s 30denní lhůtou
- Úspěšným zprostředkováním

PODPIS:

Elektronicky podepsáno dne {{signature_date}}
Ověřovací kód: [KÓD]

Zadavatel: {{user_name}}`,
    variables: JSON.stringify(['user_name', 'user_email', 'user_company', 'user_ico', 'transaction_type', 'property_title', 'property_address', 'commission_rate', 'commission_terms', 'valid_until', 'signature_date'])
  },
  {
    template_key: 'agent_cooperation',
    name: 'Smlouva o spolupráci s agentem',
    description: 'Rámcová smlouva o spolupráci při založení agenta',
    template_content: `SMLOUVA O SPOLUPRÁCI

Datum: {{signature_date}}

SMLUVNÍ STRANY:

1. Provozovatel platformy:
   Estate Private, s.r.o.
   
2. Realitní agent:
   Jméno: {{agent_name}}
   Email: {{agent_email}}
   Společnost: {{agent_company}}
   IČO: {{agent_ico}}

PŘEDMĚT SMLOUVY:

Tato smlouva upravuje podmínky spolupráce realitního agenta s platformou Estate Private.

OBECNÉ PODMÍNKY:

1. PROVIZE PLATFORMY
   - Standardní provize: {{default_commission}}%
   - Provize se vztahuje na všechny transakce zprostředkované přes platformu
   - Provize je splatná po úspěšném dokončení transakce

2. PRÁVA AGENTA
   - Přístup k platformě Estate Private
   - Možnost vkládat nabídky nemovitostí
   - Přístup k poptávkám klientů
   - Automatické matchování nabídek a poptávek
   - Podpora při zprostředkování

3. POVINNOSTI AGENTA
   - Poskytovat pravdivé informace o nemovitostech
   - Mít platnou zprostředkovatelskou smlouvu s vlastníkem
   - Dodržovat etický kodex realitních makléřů
   - Uhradit provizi platformě při úspěšné transakci
   - Chránit důvěrné informace klientů

4. ODPOVĚDNOST
   - Agent odpovídá za pravdivost poskytnutých údajů
   - Agent ručí za platnost smluv s vlastníky
   - Porušení podmínek může vést ke smluvní pokutě 50 000 Kč

5. OCHRANA DAT
   - Agent se zavazuje dodržovat GDPR
   - Osobní údaje klientů nesmí být sdíleny s třetími stranami
   - Veškerá komunikace musí být v souladu se zákonem

PLATNOST:

Smlouva je uzavřena na dobu neurčitou s možností výpovědi.
Výpovědní lhůta: 30 dní

PODPIS:

Elektronicky podepsáno dne {{signature_date}}

Realitní agent: {{agent_name}}
Email: {{agent_email}}`,
    variables: JSON.stringify(['agent_name', 'agent_email', 'agent_company', 'agent_ico', 'default_commission', 'signature_date'])
  }
];

const insertTemplate = db.prepare(`
  INSERT INTO contract_templates (template_key, name, description, template_content, variables, is_active)
  VALUES (?, ?, ?, ?, ?, ?)
`);

let count = 0;

templates.forEach(template => {
  try {
    insertTemplate.run(
      template.template_key,
      template.name,
      template.description,
      template.template_content,
      template.variables,
      1
    );
    count++;
    console.log(`Pridana sablona: ${template.name}`);
  } catch (error) {
    console.error(`Chyba pri pridavani sablony ${template.name}:`, error.message);
  }
});

console.log(`\nCelkem pridano ${count} smluvnich sablon`);

db.close();
