# Doménová Struktura Estate Private

**Datum:** 26. října 2024  
**Hlavní doména:** estateprivate.com

---

## DOMÉNOVÁ STRUKTURA

### Produkční Prostředí

```
estateprivate.com
├── https://estateprivate.com              # Frontend (React)
├── https://api.estateprivate.com          # Backend API
└── https://import.estateprivate.com       # Import API (pro RK)
```

### Vývojové Prostředí

```
localhost
├── http://localhost:3000                  # Frontend (React)
├── http://localhost:3001                  # Backend API
└── http://localhost:3001/api/import       # Import API (pro RK)
```

---

## DNS NASTAVENÍ (Pro Produkci)

### A Records

```
estateprivate.com           A    YOUR_SERVER_IP
www.estateprivate.com       A    YOUR_SERVER_IP
api.estateprivate.com       A    YOUR_SERVER_IP
import.estateprivate.com    A    YOUR_SERVER_IP
```

### CNAME Records (Alternativa)

```
www.estateprivate.com       CNAME    estateprivate.com
api.estateprivate.com       CNAME    estateprivate.com
import.estateprivate.com    CNAME    estateprivate.com
```

---

## NGINX KONFIGURACE

### Frontend (estateprivate.com)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name estateprivate.com www.estateprivate.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name estateprivate.com www.estateprivate.com;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/estateprivate.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/estateprivate.com/privkey.pem;
    
    # Frontend (React build)
    root /var/www/estateprivate/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Backend API (api.estateprivate.com)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.estateprivate.com;
    
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.estateprivate.com;
    
    ssl_certificate /etc/letsencrypt/live/estateprivate.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/estateprivate.com/privkey.pem;
    
    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req zone=api burst=20 nodelay;
}
```

### Import API (import.estateprivate.com)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name import.estateprivate.com;
    
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name import.estateprivate.com;
    
    ssl_certificate /etc/letsencrypt/live/estateprivate.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/estateprivate.com/privkey.pem;
    
    # Proxy to Node.js backend (import routes)
    location / {
        proxy_pass http://localhost:3001/api/import;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # API Key required
        if ($http_x_api_key = "") {
            return 401;
        }
    }
    
    # Strict rate limiting for import API
    limit_req_zone $http_x_api_key zone=import:10m rate=100r/h;
    limit_req zone=import burst=10 nodelay;
}
```

---

## SSL CERTIFIKÁTY (Let's Encrypt)

### Instalace Certbot

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

### Získání Certifikátů

```bash
# Získat certifikáty pro všechny subdomény
sudo certbot --nginx -d estateprivate.com \
  -d www.estateprivate.com \
  -d api.estateprivate.com \
  -d import.estateprivate.com

# Automatické obnovení
sudo certbot renew --dry-run
```

---

## ENVIRONMENT VARIABLES

### Backend (.env)

```bash
# URLs
FRONTEND_URL=https://estateprivate.com
API_URL=https://api.estateprivate.com
IMPORT_API_URL=https://import.estateprivate.com

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Email
EMAIL_USER=noreply@estateprivate.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=Estate Private <noreply@estateprivate.com>

# Node
NODE_ENV=production
PORT=3001
```

### Frontend (.env)

```bash
VITE_API_URL=https://api.estateprivate.com
VITE_IMPORT_API_URL=https://import.estateprivate.com
```

---

## CORS NASTAVENÍ

### Backend (server.js)

```javascript
app.use(cors({
  origin: [
    'https://estateprivate.com',
    'https://www.estateprivate.com',
    'http://localhost:3000' // Pro vývoj
  ],
  credentials: true
}));
```

---

## IMPORT API DOKUMENTACE PRO RK

### Base URL

**Produkce:** `https://import.estateprivate.com`  
**Vývoj:** `http://localhost:3001/api/import`

### Autentizace

Všechny requesty musí obsahovat API klíč v headeru:

```
X-API-Key: VAS_API_KLIC
```

### Endpointy

#### POST /properties
Vytvoření nebo aktualizace nemovitosti.

```bash
curl -X POST https://import.estateprivate.com/properties \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "RK123",
    "transaction_type": "sale",
    "property_type": "flat",
    "property_subtype": "2+kk",
    "price": 5000000,
    "title": "Moderni byt 2+kk",
    "description": "Krasny svetly byt...",
    "city": "Praha",
    "area": 65
  }'
```

#### DELETE /properties/:external_id
Smazání nemovitosti.

```bash
curl -X DELETE https://import.estateprivate.com/properties/RK123 \
  -H "X-API-Key: YOUR_API_KEY"
```

#### GET /properties
Seznam všech vašich importovaných nemovitostí.

```bash
curl https://import.estateprivate.com/properties \
  -H "X-API-Key: YOUR_API_KEY"
```

#### GET /stats
Statistiky vašich importů.

```bash
curl https://import.estateprivate.com/stats \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## RATE LIMITING

### API (api.estateprivate.com)
- 100 requestů za minutu per IP
- Burst: 20 requestů

### Import API (import.estateprivate.com)
- 100 requestů za hodinu per API klíč
- Burst: 10 requestů

---

## MONITORING

### Health Check Endpoints

```bash
# Backend API
curl https://api.estateprivate.com/health

# Import API
curl https://import.estateprivate.com/health \
  -H "X-API-Key: YOUR_API_KEY"
```

### Log Files

```bash
# Backend logs
/var/log/estateprivate/backend.log

# Nginx access logs
/var/log/nginx/estateprivate-access.log

# Nginx error logs
/var/log/nginx/estateprivate-error.log
```

---

## DEPLOYMENT CHECKLIST

- [ ] DNS záznamy nastaveny
- [ ] SSL certifikáty získány
- [ ] Nginx konfigurace nahrána
- [ ] Environment variables nastaveny
- [ ] Backend běží na portu 3001
- [ ] Frontend build vytvořen
- [ ] CORS správně nakonfigurován
- [ ] Rate limiting aktivní
- [ ] Monitoring nastaven
- [ ] Backup databáze automatizován

---

**Vytvořeno:** 26. října 2024  
**Verze:** 1.0
