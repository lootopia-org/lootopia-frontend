# Lootopia Frontend

Production web portal for [Lootopia](https://api.wookiesrpeople2.dev) — player dashboard, hunt catalog, partner hunt builder, and admin console. Gameplay happens in the mobile app; the web is for stats, management, and discovery.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS v4** — premium dark adventure theme
- **React Three Fiber** — cinematic 3D hero and dashboard accents
- **TanStack Query** — API state against the live Rust backend
- **shadcn-style UI** — glass panels, gold/teal accents

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_APP_DOWNLOAD_URL` | Direct APK download link you host |
| `BACKEND_API_URL` | Server-side proxy target (optional) |

API requests from the browser go through `/api/*` (Next.js rewrite) to avoid CORS issues.

## Routes

| Path | Audience | Purpose |
|------|----------|---------|
| `/` | Public | 3D landing + app download CTA |
| `/hunts` | Authenticated | Hunt catalog preview |
| `/dashboard` | Player | Stats, joined hunts, security |
| `/partner` | Partner/Admin | Hunt management + wizard |
| `/admin` | Admin | Profiles + platform overview |

## No mocks

All data comes from the live API. There is no mock data, demo login, or in-browser gameplay.

## Docker

```bash
docker build -t lootopia-frontend .
docker run -p 3000:3000 lootopia-frontend
```

## License

Private — Lootopia project.
