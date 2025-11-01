# Estate Private - Railway Backend Setup

## 🚂 Nasazení backendu na Railway

### Krok 1: Přihlášení

1. Otevřete [railway.app](https://railway.app)
2. Přihlaste se pomocí GitHub účtu
3. Klikněte **New Project**

---

### Krok 2: Deploy z GitHub

1. Vyberte **Deploy from GitHub repo**
2. Autorizujte Railway přístup k vašemu GitHub účtu
3. Vyberte repo: `estate-private` (nebo jak jste ho pojmenovali)
4. Klikněte na repo

---

### Krok 3: Konfigurace projektu

Railway automaticky detekuje Node.js projekt, ale musíte nastavit:

#### A) Root Directory
1. Klikněte na **Settings** (ozubené kolečko)
2. Najděte **Root Directory**
3. Nastavte na: `backend`
4. Klikněte **Save**

#### B) Start Command (volitelné, mělo by být automatické)
- Railway použije `npm start` z `package.json`
- Pokud ne, nastavte ručně: `node server.js`

---

### Krok 4: Environment Variables

1. Klikněte na **Variables** (v levém menu)
2. Klikněte **+ New Variable**
3. Přidejte tyto proměnné:

```env
SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDk1NDksImV4cCI6MjA3NzU4NTU0OX0.Zm2B5i98BILRgn_VsqwLTYUSWsMb9bs_TW0TkCNsaUo

SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAwOTU0OSwiZXhwIjoyMDc3NTg1NTQ5fQ.W7ijtZPDdUQS3WvPvbHNUNbXh2MtHajjapPyznCY9Vk

DATABASE_URL=postgresql://postgres:vApgog-cemfoc-kembu7@db.aanxxeyysqtpdcrrwnhm.supabase.co:5432/postgres

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

EMAIL_USER=your-email@gmail.com

EMAIL_PASSWORD=your-gmail-app-password

PORT=5000

NODE_ENV=production
```

**Důležité:**
- Každou proměnnou přidejte zvlášť (Name + Value)
- Klikněte **Add** po každé proměnné
- `JWT_SECRET` změňte na něco bezpečného (např. dlouhý random string)

---

### Krok 5: Deploy

1. Po přidání všech proměnných Railway automaticky začne deployment
2. Sledujte **Deployments** tab - uvidíte build log
3. Počkejte, až se objeví ✅ **Success**

---

### Krok 6: Získat Railway URL

1. Po úspěšném deployi klikněte na **Settings**
2. Najděte sekci **Domains**
3. Klikněte **Generate Domain**
4. Zkopírujte vygenerovanou URL (např. `estate-private-backend.up.railway.app`)

---

### Krok 7: Aktualizovat Vercel

1. Otevřete Vercel Dashboard
2. Vyberte váš frontend projekt
3. Jděte do **Settings** → **Environment Variables**
4. Najděte `REACT_APP_API_URL`
5. Změňte hodnotu na Railway URL (např. `https://estate-private-backend.up.railway.app`)
6. Klikněte **Save**
7. Jděte do **Deployments** a klikněte **Redeploy**

---

## 🔍 Řešení problémů

### Build selhává

**Problém:** `npm install` selhává
**Řešení:** 
- Zkontrolujte, že Root Directory je `backend`
- Zkontrolujte, že `package.json` existuje v `backend/`

### Aplikace crashuje

**Problém:** Deployment je úspěšný, ale aplikace nefunguje
**Řešení:**
- Zkontrolujte **Logs** v Railway
- Ověřte, že všechny Environment Variables jsou správně nastaveny
- Zkontrolujte, že `PORT` je nastaven na `5000`

### Database connection error

**Problém:** Chyba připojení k databázi
**Řešení:**
- Ověřte `DATABASE_URL` - musí být přesně stejný jako v Supabase
- Zkontrolujte, že Supabase projekt běží
- Ověřte, že `SUPABASE_SERVICE_KEY` je správný

### CORS errors

**Problém:** Frontend nemůže volat backend API
**Řešení:**
- Zkontrolujte CORS nastavení v `backend/server.js`
- Přidejte Vercel doménu do CORS allowed origins

---

## 📊 Monitoring

Railway poskytuje:
- **Logs** - Real-time logy aplikace
- **Metrics** - CPU, Memory, Network usage
- **Deployments** - Historie všech deploymentů

---

## 💰 Pricing

Railway Free Tier:
- **$5 credit/měsíc** zdarma
- Cca **500 hodin běhu** měsíčně
- Pro malé projekty to stačí

Pokud potřebujete víc:
- **Hobby Plan**: $5/měsíc
- **Pro Plan**: $20/měsíc

---

## ✅ Checklist

```
[ ] Railway účet vytvořen
[ ] Projekt importován z GitHub
[ ] Root Directory nastaven na "backend"
[ ] Všechny Environment Variables přidány
[ ] Deployment úspěšný
[ ] Railway URL zkopírována
[ ] Vercel aktualizován s Railway URL
[ ] Frontend redeployed
[ ] Aplikace testována
```

---

## 🎉 Hotovo!

Po dokončení všech kroků máte:
- ✅ Frontend běžící na Vercel
- ✅ Backend běžící na Railway
- ✅ Databáze na Supabase
- ✅ Plně funkční produkční aplikaci

**URL aplikace:** `https://your-project.vercel.app`
