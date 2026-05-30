# Bold Pieces — Deployment Guide

## Architecture

| Layer | Host |
|-------|------|
| Frontend (Vite/React) | Vercel |
| API (Express) | Railway or Render |
| Database | MongoDB Atlas |
| Payments | Shwary Mobile Money |

---

## API deployment (Railway or Render)

### Required environment variables

Set these in the Railway/Render dashboard (root directory: **`server`**):

| Variable | Example / notes |
|----------|-----------------|
| `PORT` | Set automatically by the platform |
| `MONGODB_URI` | `mongodb+srv://...` (Atlas connection string) |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `CUSTOMER_JWT_SECRET` | Generate: `openssl rand -hex 32` (different from JWT_SECRET) |
| `ADMIN_EMAIL` | `admin@boldpieces.com` |
| `ADMIN_PASSWORD` | Strong password — **not** `admin123` |
| `SHWARY_MERCHANT_ID` | `b93d2aae-0e61-4d4c-b80b-a75bfab33e4c` |
| `SHWARY_MERCHANT_KEY` | Live key from Shwary dashboard |
| `SHWARY_CALLBACK_URL` | `https://your-api.railway.app/api/shwary/callback` |
| `SHWARY_SANDBOX` | `false` for live payments |
| `ALLOWED_ORIGIN` | `https://your-frontend.vercel.app` |

### Deploy steps

1. Push the repo to GitHub
2. Create a new Railway/Render project and connect the repo
3. Set **root directory** to `/server`
4. Set all environment variables above
5. Start command: `npm start` (runs `node src/index.js`)
6. Copy the live API URL (e.g. `https://bold-pieces-api.railway.app`)
7. Verify: `GET https://your-api.railway.app/api/health` → `shwaryConfigured: true`, `shwarySandbox: false`

`server/Procfile`:

```
web: node src/index.js
```

---

## Frontend deployment (Vercel)

1. Create a new Vercel project and connect the GitHub repo
2. Set **root directory** to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables:

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://your-api.railway.app` (no trailing slash) |
| `VITE_SHOW_ADMIN_LINK` | Leave **unset** in production (hides Admin link) |

`client/vercel.json` includes SPA rewrites so `/shop`, `/checkout`, `/confirmation/:id`, etc. work on direct load and refresh.

---

## Post-deploy checklist

- [ ] Visit `/api/health` — `shwaryConfigured: true`, `shwarySandbox: false`
- [ ] Place a test order end-to-end (real phone, small amount)
- [ ] Confirm Shwary callback updates order status in admin
- [ ] Confirmation page shows **"Your Bold Piece is on its way."** after payment
- [ ] Admin dashboard loads orders and analytics
- [ ] `/shop`, `/checkout`, `/confirmation/:id` work on direct URL load
- [ ] `ADMIN_PASSWORD` and `JWT_SECRET` are strong, unique values
- [ ] Admin link is **not** visible on the public storefront
- [ ] `ALLOWED_ORIGIN` matches your Vercel domain only

---

## Security (included in codebase)

- Legacy `POST /api/orders` removed (checkout uses `POST /api/checkout` only)
- `helmet` security headers
- Rate limits on login/register and checkout
- CORS restricted via `ALLOWED_ORIGIN`
- Admin JWT requires `role: "admin"`
- Customer JWT uses `CUSTOMER_JWT_SECRET` when set

See `LOCAL_DEV.md` for ngrok-based Shwary callback testing during development.
