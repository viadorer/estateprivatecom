# Row Level Security (RLS) - Vysvětlení pro Estate Private

## ⚠️ Problém s RLS

Při aplikaci migrace `00003_rls_policies.sql` se objevila chyba:
```
ERROR: 42846: cannot cast type uuid to integer
```

## 🔍 Příčina

Estate Private používá **vlastní autentizaci** (JWT tokeny, vlastní users tabulka s INTEGER ID), ale Supabase RLS očekává **Supabase Auth** (UUID identifikátory).

### Konflikt:
- **Vaše aplikace**: `users.id` je `INTEGER` (1, 2, 3...)
- **Supabase Auth**: `auth.uid()` vrací `UUID` (např. `550e8400-e29b-41d4-a716-446655440000`)

## 🛠️ Řešení

### Možnost 1: VYPNOUT RLS (DOPORUČENO pro rychlý start)

Použijte migraci `00003_rls_policies_fixed.sql` která:
- ✅ Vypíná RLS na všech tabulkách
- ✅ Zabezpečení zůstává na úrovni backendu (jak to máte teď)
- ✅ Používáte SERVICE_ROLE key pro přístup k databázi
- ✅ Backend kontroluje oprávnění pomocí JWT tokenů

**Aplikace:**
```sql
-- V Supabase SQL Editor spusťte:
\i supabase/migrations/00003_rls_policies_fixed.sql
```

### Možnost 2: Migrace na Supabase Auth (DLOUHODOBÉ řešení)

Pokud chcete plně využít Supabase včetně RLS:

1. **Přidat UUID sloupec do users tabulky:**
```sql
ALTER TABLE users ADD COLUMN auth_user_id UUID UNIQUE;
```

2. **Vytvořit Supabase Auth uživatele:**
```javascript
// Pro každého existujícího uživatele
const { data, error } = await supabase.auth.admin.createUser({
  email: user.email,
  password: 'temporary-password',
  email_confirm: true
})

// Uložit auth_user_id
await supabase
  .from('users')
  .update({ auth_user_id: data.user.id })
  .eq('id', user.id)
```

3. **Upravit RLS politiky:**
```sql
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);
```

4. **Upravit frontend:**
```javascript
// Místo vlastního login
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
})
```

### Možnost 3: Hybridní přístup

Použít Supabase pouze jako databázi, ponechat vlastní autentizaci:
- ✅ RLS vypnuté
- ✅ Vlastní JWT tokeny
- ✅ Backend kontroluje oprávnění
- ✅ Používat SERVICE_ROLE key v backendu

## 📊 Srovnání možností

| Vlastnost | Možnost 1 (RLS OFF) | Možnost 2 (Supabase Auth) | Možnost 3 (Hybrid) |
|-----------|---------------------|---------------------------|-------------------|
| Rychlost implementace | ⚡ Okamžitě | 🐌 Několik dní | ⚡ Okamžitě |
| Bezpečnost | ✅ Backend kontrola | ✅✅ DB + Backend | ✅ Backend kontrola |
| Složitost | 🟢 Jednoduchá | 🔴 Složitá | 🟢 Jednoduchá |
| Supabase features | ⚠️ Omezené | ✅ Plné | ⚠️ Omezené |
| Migrace dat | ✅ Žádná | 🔴 Nutná | ✅ Žádná |

## 🎯 Doporučení

**Pro Estate Private doporučuji Možnost 1 (RLS OFF):**

### Proč?
1. ✅ **Rychlé nasazení** - funguje okamžitě
2. ✅ **Žádná migrace** - ponecháte stávající autentizaci
3. ✅ **Bezpečné** - backend již kontroluje oprávnění
4. ✅ **Testované** - stávající kód funguje
5. ✅ **Jednoduché** - méně věcí, které se mohou pokazit

### Zabezpečení bez RLS:

Vaše aplikace je stále bezpečná, protože:

1. **Backend middleware** kontroluje JWT tokeny
2. **Role-based access** kontroluje oprávnění
3. **Service role key** je pouze v backendu (ne na frontendu)
4. **Anon key** na frontendu nemá přímý přístup k DB

```javascript
// Backend middleware (už máte)
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']
  if (!token) return res.sendStatus(401)
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Role check (už máte)
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
```

## 🚀 Jak pokračovat

### 1. Aplikujte fixed migraci:

V Supabase SQL Editor:
```sql
-- Vypnout RLS na všech tabulkách
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
-- ... atd pro všechny tabulky
```

Nebo zkopírujte celý obsah `00003_rls_policies_fixed.sql` a spusťte.

### 2. Použijte SERVICE_ROLE key v backendu:

```env
# backend/.env
SUPABASE_SERVICE_KEY=eyJhbGc...  # Service role key z Dashboardu
```

### 3. Použijte ANON key na frontendu:

```env
# frontend/.env
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...  # Anon key (už máte)
```

### 4. Backend přístup k DB:

```javascript
// backend/supabaseClient.js
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // SERVICE key pro admin přístup
)

module.exports = supabase
```

## ✅ Checklist

- [ ] Aplikovat `00003_rls_policies_fixed.sql` (vypnout RLS)
- [ ] Přidat SERVICE_ROLE key do backend/.env
- [ ] Testovat přihlášení
- [ ] Testovat vytvoření nemovitosti
- [ ] Testovat vytvoření poptávky
- [ ] Ověřit, že admin vidí vše
- [ ] Ověřit, že agent vidí pouze své nemovitosti
- [ ] Ověřit, že client vidí pouze své poptávky

## 📚 Další informace

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Custom Claims in JWT](https://supabase.com/docs/guides/auth/managing-user-data)
- [Service Role vs Anon Key](https://supabase.com/docs/guides/api/api-keys)
