# dazly-frontend

Frontend for [dazly.art](https://dazly.art). React SPA for AI image generation and editing. Tiered subscription model with project-based organization.

---

## What It Does

- **AI chat interface**: Prompt-based image generation with conversation history
- **Project management**: Organize generations into named projects
- **Subscription tiers**: 6 plans from Free (10 images/mo) to Infinity (1500 images/mo)
- **Account dashboard**: Profile, subscription status, usage stats, billing history
- **Auth**: Email/password + Google OAuth with JWT persistence

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| State | Zustand (auth + user stores) |
| Validation | Zod |
| HTTP | Axios with interceptors |
| Payments | Stripe.js (publishable key only) |

---

## Infrastructure

- **Host**: Static build served via CDN
- **API backend**: `https://dazly.art/api` (Express on Railway)
- **Domain**: `dazly.art`

---

## Security

- JWT tokens in memory (no localStorage for sensitive data)
- Route guards redirect unauthenticated users to login
- API interceptors handle 401 auto-logout
- Zod validation on all forms

---

## Environment

```bash
cp .env.example .env
npm install
npm run dev
```

Required variables:

```
VITE_API_URL
VITE_STRIPE_PUBLISHABLE_KEY
```

---

## Directory

```
src/
  components/
    ui/               # shadcn/ui primitives
    ChatSidebar.tsx   # Project navigation
    Navbar.tsx         # Auth-aware navigation
    ProtectedRoute.tsx # Route guard
  pages/
    Index.tsx          # Landing
    LoginPage.tsx
    RegisterPage.tsx
    ChatPage.tsx       # Main workspace
    PlansPage.tsx      # Subscription tiers
    AccountPage.tsx    # Dashboard
  store/
    authStore.ts      # JWT + session state
    userStore.ts      # Profile + projects
  lib/
    api.ts            # Axios client with interceptors
  types/
    index.ts          # TypeScript definitions
```

---

## Subscription Tiers

| Plan | Images/mo | Price |
|------|-----------|-------|
| Free | 10 | €0 |
| Pulse | 50 | €3.99 |
| Flow | 150 | €9.99 |
| Summit | 350 | €19.99 |
| Peak | 700 | €39.99 |
| Infinity | 1500 | €79.99 |

---

## License

MIT License — see [LICENSE](LICENSE)

**Proprietary deployment — dazly.art**
