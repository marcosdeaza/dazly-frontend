# 🚀 Guía de Deployment - Dazly

## Variables de Entorno para Producción

### Frontend (.env)
```env
VITE_API_URL=https://api.dazly.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_stripe
```

### Backend (Node.js)
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dazly_prod

# JWT
JWT_SECRET=tu_super_secret_key_muy_seguro_produccion
JWT_EXPIRES_IN=7d

# Google Cloud / Vertex AI  
GOOGLE_CLOUD_PROJECT_ID=dazly-prod-123456
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/service-account-key.json
VERTEX_AI_LOCATION=us-central1

# Stripe
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# OAuth Google
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=https://api.dazly.com/api/auth/google/callback

# Otros
FRONTEND_URL=https://dazly.com
CORS_ORIGIN=https://dazly.com
NODE_ENV=production
PORT=8080
```

## Mapeo de Price IDs de Stripe

```javascript
const STRIPE_PRICE_IDS = {
  pulse: 'price_1ABC123def456GHI',     // €3.99/mes - 50 imágenes
  flow: 'price_1DEF789ghi012JKL',      // €9.99/mes - 150 imágenes  
  summit: 'price_1GHI345jkl678MNO',    // €19.99/mes - 350 imágenes
  peak: 'price_1JKL901mno234PQR',      // €39.99/mes - 700 imágenes
  infinity: 'price_1MNO567pqr890STU'   // €79.99/mes - 1500 imágenes
};
```

## Deploy Commands

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy /dist folder
```

### Backend (Railway/Heroku/DigitalOcean)
```bash
# Railway
railway deploy

# Heroku  
git push heroku main

# Docker
docker build -t dazly-api .
docker push your-registry/dazly-api
```

## DNS y Dominios

```
dazly.com          -> Frontend (Vercel/Netlify)
api.dazly.com      -> Backend API (Railway/Heroku)
www.dazly.com      -> Redirect to dazly.com
```

¡Listo para el lanzamiento! 🎊