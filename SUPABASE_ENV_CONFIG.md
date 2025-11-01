# Estate Private - Supabase Environment Configuration

## ✅ KOMPLETNÍ KONFIGURACE

### Backend .env

Zkopírujte toto do `/backend/.env`:

```env
# ===== SUPABASE =====
SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDk1NDksImV4cCI6MjA3NzU4NTU0OX0.Zm2B5i98BILRgn_VsqwLTYUSWsMb9bs_TW0TkCNsaUo
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAwOTU0OSwiZXhwIjoyMDc3NTg1NTQ5fQ.W7ijtZPDdUQS3WvPvbHNUNbXh2MtHajjapPyznCY9Vk

# ===== DATABASE =====
DATABASE_URL=postgresql://postgres:vApgog-cemfoc-kembu7@db.aanxxeyysqtpdcrrwnhm.supabase.co:5432/postgres

# Zakomentovat staré SQLite
# DATABASE_PATH=./realestate.db

# ===== EMAIL (ponechat stávající) =====
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# ===== JWT (ponechat stávající) =====
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# ===== SERVER =====
PORT=5000
NODE_ENV=development
```

---

### Frontend .env

Zkopírujte toto do `/frontend/.env`:

```env
# ===== SUPABASE =====
REACT_APP_SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDk1NDksImV4cCI6MjA3NzU4NTU0OX0.Zm2B5i98BILRgn_VsqwLTYUSWsMb9bs_TW0TkCNsaUo

# ===== BACKEND API (ponechat stávající) =====
REACT_APP_API_URL=http://localhost:5000
```

---

## 🔑 Admin přihlášení

Po spuštění aplikace se přihlaste:
- **Email:** `admin@ptf.cz`
- **Heslo:** `admin123`

---

## 📋 Další kroky

1. ✅ Zkopírovat konfiguraci do .env souborů
2. Instalovat dependencies:
   ```bash
   cd backend && npm install @supabase/supabase-js pg
   cd ../frontend && npm install @supabase/supabase-js
   ```
3. Spustit aplikaci:
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend (v novém terminálu)
   cd frontend && npm start
   ```
4. Otevřít http://localhost:3000
5. Přihlásit se jako admin

---

## ⚠️ BEZPEČNOST

- **SERVICE_ROLE key** - POUZE v backendu, NIKDY na frontendu!
- **ANON key** - můžete použít na frontendu (má omezená práva)
- `.env` soubory jsou v `.gitignore` - necommitujte je!
