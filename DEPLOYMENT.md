# 🚀 Deployment Guide

Návod na nasazení Task Manager aplikace do produkce.

## 📋 Příprava

### 1. Build frontend
```bash
cd frontend
npm run build
```

Vytvoří se `dist/` složka s optimalizovanými soubory.

### 2. Konfigurace prostředí

Vytvořte `.env` soubor v backend složce:
```bash
cp .env.example .env
```

Upravte hodnoty:
```env
NODE_ENV=production
PORT=3001
DATABASE_PATH=./tasks.db
FRONTEND_URL=https://vase-domena.cz
```

## 🌐 Možnosti nasazení

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend na Vercel

1. **Připojte GitHub repozitář**
   - Přihlaste se na [vercel.com](https://vercel.com)
   - Import projektu z GitHubu

2. **Konfigurace**
   ```
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Environment Variables**
   ```
   VITE_API_URL=https://vase-backend.railway.app
   ```

#### Backend na Railway

1. **Vytvořte nový projekt**
   - Přihlaste se na [railway.app](https://railway.app)
   - New Project → Deploy from GitHub

2. **Konfigurace**
   ```
   Root Directory: backend
   Start Command: npm start
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://vase-app.vercel.app
   ```

### Option 2: Heroku (Full-stack)

1. **Instalace Heroku CLI**
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Vytvoření aplikace**
   ```bash
   heroku create vase-app-nazev
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: DigitalOcean / VPS

#### 1. Připojení k serveru
```bash
ssh root@vase-ip-adresa
```

#### 2. Instalace Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. Instalace PM2
```bash
npm install -g pm2
```

#### 4. Nahrání projektu
```bash
# Na lokálním počítači
scp -r reactrealprojekt root@vase-ip:/var/www/
```

#### 5. Instalace závislostí
```bash
cd /var/www/reactrealprojekt/backend
npm install --production

cd /var/www/reactrealprojekt/frontend
npm install
npm run build
```

#### 6. Spuštění backendu s PM2
```bash
cd /var/www/reactrealprojekt/backend
pm2 start server.js --name task-manager-api
pm2 save
pm2 startup
```

#### 7. Nginx konfigurace

Vytvořte `/etc/nginx/sites-available/task-manager`:
```nginx
server {
    listen 80;
    server_name vase-domena.cz;

    # Frontend
    location / {
        root /var/www/reactrealprojekt/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktivujte konfiguraci:
```bash
sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. SSL certifikát (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d vase-domena.cz
```

### Option 4: Docker

#### 1. Backend Dockerfile

Vytvořte `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

#### 2. Frontend Dockerfile

Vytvořte `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Docker Compose

Vytvořte `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - ./backend/tasks.db:/app/tasks.db
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

#### 4. Spuštění
```bash
docker-compose up -d
```

## 🔒 Bezpečnost

### 1. Environment Variables
- Nikdy necommitujte `.env` soubory
- Používejte silné JWT secret klíče
- Nastavte správné CORS origins

### 2. Database
- Pravidelné zálohy databáze
- Šifrování citlivých dat
- Omezení přístupu k databázovému souboru

### 3. HTTPS
- Vždy používejte HTTPS v produkci
- Nastavte HSTS headers
- Používejte aktuální TLS verze

### 4. Rate Limiting
Přidejte do backendu:
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100 // limit 100 požadavků
});

app.use('/api', limiter);
```

## 📊 Monitoring

### 1. PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### 2. Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)

### 3. Error Tracking
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)

## 🔄 CI/CD

### GitHub Actions

Vytvořte `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend && npm install
        cd ../frontend && npm install
    
    - name: Build frontend
      run: cd frontend && npm run build
    
    - name: Deploy to server
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        source: "."
        target: "/var/www/task-manager"
```

## 📦 Zálohy

### Automatické zálohy databáze

Vytvořte cron job:
```bash
crontab -e
```

Přidejte:
```
0 2 * * * cp /var/www/reactrealprojekt/backend/tasks.db /var/backups/tasks-$(date +\%Y\%m\%d).db
```

### Záloha do cloudu
```bash
# AWS S3
aws s3 cp tasks.db s3://vase-bucket/backups/

# Google Cloud Storage
gsutil cp tasks.db gs://vase-bucket/backups/
```

## 🔧 Údržba

### Aktualizace závislostí
```bash
npm outdated
npm update
```

### Čištění logů
```bash
pm2 flush
```

### Restart služeb
```bash
pm2 restart all
sudo systemctl restart nginx
```

## 📈 Performance

### 1. Frontend optimalizace
- Gzip komprese
- Caching statických souborů
- CDN pro assety

### 2. Backend optimalizace
- Database indexy
- Response caching
- Connection pooling

### 3. Nginx caching
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## ✅ Checklist před deploym

- [ ] Frontend build funguje (`npm run build`)
- [ ] Backend běží bez chyb
- [ ] Environment variables nastaveny
- [ ] Database zálohy nakonfigurovány
- [ ] HTTPS certifikát nastaven
- [ ] Monitoring nastaven
- [ ] Rate limiting aktivován
- [ ] Error tracking nastaven
- [ ] CI/CD pipeline funguje
- [ ] Dokumentace aktualizována

## 🆘 Troubleshooting

### Frontend se nenačte
- Zkontrolujte build output
- Ověřte Nginx konfiguraci
- Zkontrolujte browser console

### Backend nefunguje
- Zkontrolujte PM2 logs: `pm2 logs`
- Ověřte environment variables
- Zkontrolujte port a firewall

### Databáze chyby
- Zkontrolujte oprávnění k souboru
- Ověřte cestu k databázi
- Zkontrolujte disk space

## 📞 Podpora

Pro problémy s deploymentem:
1. Zkontrolujte logy
2. Přečtěte si dokumentaci
3. Vytvořte issue na GitHubu
