# Estate Private - Nasazení na Vercel

## 🚀 Příprava projektu

### 1. Struktura projektu pro Vercel

Vercel nejlépe funguje s monorepo strukturou. Doporučuji nasadit **pouze frontend** na Vercel a backend nechat samostatně (např. Railway, Render).

## 📋 POSTUP NASAZENÍ

### Varianta A: Frontend na Vercel + Backend jinde (DOPORUČENO)

#### 1. Připravit frontend pro Vercel

Vytvořte `frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "env": {
    "REACT_APP_SUPABASE_URL": "@supabase_url",
    "REACT_APP_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "REACT_APP_API_URL": "@api_url"
  }
}
```

#### 2. Push na GitHub

```bash
cd /Users/david/Cascade\ projekty/reactrealprojekt

# Inicializovat git (pokud ještě není)
git init

# Přidat všechny soubory
git add .

# Commit
git commit -m "Initial commit - Estate Private"

# Vytvořit repo na GitHub a připojit
git remote add origin https://github.com/YOUR_USERNAME/estate-private.git
git branch -M main
git push -u origin main
```

#### 3. Nasadit na Vercel

1. Přihlaste se na [vercel.com](https://vercel.com)
2. Klikněte **Add New** → **Project**
3. Importujte GitHub repo
4. **Root Directory**: Nastavte na `frontend`
5. **Framework Preset**: Create React App
6. **Environment Variables**:
   ```
   REACT_APP_SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   REACT_APP_API_URL=https://your-backend-url.com
   ```
7. Klikněte **Deploy**

#### 4. Nasadit backend (Railway nebo Render)

**Railway:**
1. Přihlaste se na [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Vyberte repo
4. **Root Directory**: `backend`
5. **Environment Variables**:
   ```
   SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_KEY=...
   DATABASE_URL=postgresql://postgres:vApgog-cemfoc-kembu7@db.aanxxeyysqtpdcrrwnhm.supabase.co:5432/postgres
   JWT_SECRET=your-secret
   PORT=5000
   NODE_ENV=production
   ```
6. Deploy

---

### Varianta B: Celý projekt na Vercel (složitější)

Vytvořte `vercel.json` v rootu:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

---

## 🔐 Environment Variables pro Vercel

### Frontend (.env.production)
```env
REACT_APP_SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDk1NDksImV4cCI6MjA3NzU4NTU0OX0.Zm2B5i98BILRgn_VsqwLTYUSWsMb9bs_TW0TkCNsaUo
REACT_APP_API_URL=https://your-backend.railway.app
```

### Backend (Railway/Render)
```env
SUPABASE_URL=https://aanxxeyysqtpdcrrwnhm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDk1NDksImV4cCI6MjA3NzU4NTU0OX0.Zm2B5i98BILRgn_VsqwLTYUSWsMb9bs_TW0TkCNsaUo
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbnh4ZXl5c3F0cGRjcnJ3bmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAwOTU0OSwiZXhwIjoyMDc3NTg1NTQ5fQ.W7ijtZPDdUQS3WvPvbHNUNbXh2MtHajjapPyznCY9Vk
DATABASE_URL=postgresql://postgres:vApgog-cemfoc-kembu7@db.aanxxeyysqtpdcrrwnhm.supabase.co:5432/postgres
JWT_SECRET=your-production-secret
PORT=5000
NODE_ENV=production
```

---

## 📝 .gitignore kontrola

Ujistěte se, že máte v `.gitignore`:

```
# Environment
.env
.env.local
.env.production
.env.development

# Dependencies
node_modules/
backend/node_modules/
frontend/node_modules/

# Build
frontend/build/
backend/dist/

# Uploads
backend/uploads/

# Database
backend/*.db
backend/*.sqlite

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
```

---

## 🚀 Rychlý start

```bash
# 1. Commit změny
git add .
git commit -m "Prepare for Vercel deployment"
git push

# 2. Nasadit na Vercel
# - Přihlásit se na vercel.com
# - Import GitHub repo
# - Nastavit env variables
# - Deploy

# 3. Nasadit backend na Railway
# - Přihlásit se na railway.app
# - Deploy from GitHub
# - Nastavit env variables
# - Deploy
```

---

## ✅ Checklist

- [ ] Git repo vytvořen
- [ ] Projekt pushnut na GitHub
- [ ] Frontend nasazen na Vercel
- [ ] Backend nasazen na Railway/Render
- [ ] Environment variables nastaveny
- [ ] Custom doména nastavena (volitelné)
- [ ] SSL certifikát aktivní
- [ ] Aplikace testována v produkci

---

## 🔗 Užitečné odkazy

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 💡 Tipy

1. **Oddělené nasazení** - Frontend na Vercel, backend na Railway je nejjednodušší
2. **Environment variables** - Nikdy necommitujte .env soubory
3. **CORS** - Nastavte správné CORS v backendu pro Vercel doménu
4. **Database** - Supabase je už v produkci, stačí použít stejné credentials
5. **Monitoring** - Využijte Vercel Analytics a Railway Metrics

---

**Připraveno k nasazení!** 🚀
