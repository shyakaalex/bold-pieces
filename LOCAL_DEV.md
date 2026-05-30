# Local development — Bold Pieces

## Run the stack

From the project root:

```bash
npm run dev
```

- API: http://127.0.0.1:5001 (`GET /api/health`)
- Storefront: http://localhost:5173 (or the port Vite prints)

## Testing Shwary callbacks locally

Shwary cannot reach `localhost`. Use ngrok to expose your local server:

1. Install ngrok: https://ngrok.com/download
2. Start your server: `cd server && npm run dev` (or `npm run dev` from root)
3. In a new terminal: `ngrok http 5001`
4. Copy the `https` URL from ngrok output (e.g. `https://abc123.ngrok-free.app`)
5. Update `server/.env`:
   ```
   SHWARY_CALLBACK_URL=https://abc123.ngrok-free.app/api/shwary/callback
   ```
6. Restart your server
7. Place a test order — Shwary will call your local server
8. In sandbox mode, you'll get a `completed` callback after ~5 seconds

**Note:** ngrok URLs change every time you restart it unless you have a paid plan.

### Polling fallback (no ngrok)

The order confirmation page polls `GET /api/orders/:id/payment-status` every 4 seconds while payment is pending. That endpoint syncs status directly from Shwary, so sandbox orders usually update to **completed** without a webhook.

## Environment files

| File | Purpose |
|------|---------|
| `server/.env` | API secrets (never commit) |
| `server/.env.example` | Template for deployment |
| `client/.env.local` | Dev-only: `VITE_SHOW_ADMIN_LINK=true` |
| `client/.env.example` | `VITE_API_URL` for production builds |

## Admin

- URL: http://localhost:5173/admin/login
- Default (change before production): see `server/.env`
