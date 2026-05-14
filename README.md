# Amen Kids Store Management System

Full-stack store management system for Amen Kids Store.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Supabase
- **Frontend**: React, Vite, TailwindCSS v4, TypeScript

## Deployment

### Backend → Render.com
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`

### Frontend → Vercel
- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Environment Variables

### Backend (Render)
```
SUPABASE_URL=https://whjexiderqdmblllxzuh.supabase.co/rest/v1/
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=amen-kids-super-secret-jwt-key-2024
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_URL=https://<your-render-app>.onrender.com/api
```
