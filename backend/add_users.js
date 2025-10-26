import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('realestate.db');

// Heslo pro všechny: heslo123
const hashedPassword = bcrypt.hashSync('heslo123', 10);

// Najít existující společnosti
const companies = db.prepare('SELECT id, name FROM companies').all();
const premiumReality = companies.find(c => c.name === 'Premium Reality');
const cityRealty = companies.find(c => c.name === 'City Realty');

const users = [
  // Agenti (8)
  {
    name: 'Petr Novák',
    email: 'petr.novak@ptf.cz',
    role: 'agent',
    phone: '+420 777 001 001',
    company_id: premiumReality?.id || null,
    company_position: 'Senior realitní makléř'
  },
  {
    name: 'Jana Svobodová',
    email: 'jana.svobodova@ptf.cz',
    role: 'agent',
    phone: '+420 777 001 002',
    company_id: premiumReality?.id || null,
    company_position: 'Realitní makléř'
  },
  {
    name: 'Martin Dvořák',
    email: 'martin.dvorak@ptf.cz',
    role: 'agent',
    phone: '+420 777 001 003',
    company_id: cityRealty?.id || null,
    company_position: 'Realitní konzultant'
  },
  {
    name: 'Lucie Černá',
    email: 'lucie.cerna@ptf.cz',
    role: 'agent',
    phone: '+420 777 001 004',
    company_id: cityRealty?.id || null,
    company_position: 'Realitní makléř'
  },
  {
    name: 'Tomáš Procházka',
    email: 'tomas.prochazka@ptf.cz',
    role: 'agent',
    phone: '+420 777 001 005',
    company_id: premiumReality?.id || null,
    company_position: 'Junior realitní makléř'
  },
  {
    name: 'Kateřina Veselá',
    email: 'katerina.vesela@ptf.cz',
    role: 'agent',
    phone: '+420 777 001 006',
    company_id: cityRealty?.id || null,
    company_position: 'Realitní konzultant'
  },
  {
    name: 'Jakub Horák',
    email: 'jakub.horak@ptf.cz',
    role: 'agent',
    phone: '+420 777 001 007',
    company_id: premiumReality?.id || null,
    company_position: 'Realitní makléř'
  },
  {
    name: 'Michaela Králová',
    email: 'michaela.kralova@ptf.cz',
    role: 'agent',
    phone: '+420 777 001 008',
    company_id: cityRealty?.id || null,
    company_position: 'Senior realitní makléř'
  },
  
  // Klienti (7)
  {
    name: 'David Novotný',
    email: 'david.novotny@ptf.cz',
    role: 'client',
    phone: '+420 777 002 001',
    company_id: null,
    company_position: null
  },
  {
    name: 'Eva Marková',
    email: 'eva.markova@ptf.cz',
    role: 'client',
    phone: '+420 777 002 002',
    company_id: null,
    company_position: null
  },
  {
    name: 'Pavel Beneš',
    email: 'pavel.benes@ptf.cz',
    role: 'client',
    phone: '+420 777 002 003',
    company_id: null,
    company_position: null
  },
  {
    name: 'Lenka Pokorná',
    email: 'lenka.pokorna@ptf.cz',
    role: 'client',
    phone: '+420 777 002 004',
    company_id: null,
    company_position: null
  },
  {
    name: 'Ondřej Kučera',
    email: 'ondrej.kucera@ptf.cz',
    role: 'client',
    phone: '+420 777 002 005',
    company_id: null,
    company_position: null
  },
  {
    name: 'Barbora Němcová',
    email: 'barbora.nemcova@ptf.cz',
    role: 'client',
    phone: '+420 777 002 006',
    company_id: null,
    company_position: null
  },
  {
    name: 'Filip Urban',
    email: 'filip.urban@ptf.cz',
    role: 'client',
    phone: '+420 777 002 007',
    company_id: null,
    company_position: null
  }
];

const insertUser = db.prepare(`
  INSERT INTO users (
    name, email, password, role, phone, company_id, company_position,
    address_street, address_city, address_zip, address_country,
    preferred_contact, is_active
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let agentCount = 0;
let clientCount = 0;

users.forEach(user => {
  try {
    insertUser.run(
      user.name,
      user.email,
      hashedPassword,
      user.role,
      user.phone,
      user.company_id,
      user.company_position,
      'Testovací ulice 1',
      'Praha',
      '110 00',
      'Česká republika',
      'email',
      1
    );
    
    if (user.role === 'agent') {
      agentCount++;
    } else {
      clientCount++;
    }
    
    console.log(`✓ ${user.role === 'agent' ? 'Agent' : 'Klient'}: ${user.name} (${user.email})`);
  } catch (error) {
    console.error(`✗ Chyba při vytváření ${user.name}:`, error.message);
  }
});

console.log(`\nVytvořeno ${agentCount} agentů a ${clientCount} klientů`);
console.log('Heslo pro všechny: heslo123');

db.close();
