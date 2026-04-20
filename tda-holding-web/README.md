# tda-holding-web

Frontend Next.js 15 PWA pour la plateforme TDA Holding (location et vente de véhicules et biens immobiliers à Abidjan).

## Structure

```
tda-holding-web/
├── apps/
│   └── web/              # Next.js 15 App Router + TypeScript strict
├── packages/
│   └── api-types/        # Types TypeScript générés depuis OpenAPI /api/v1/openapi.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Démarrer

### Prérequis

- Node.js ≥ 20
- pnpm ≥ 10
- `tda-holding-api` lancé sur `http://127.0.0.1:8000`

### Installation

```bash
pnpm install
```

### Variables d'environnement

```bash
cp apps/web/.env.local.example apps/web/.env.local
# Éditer NEXT_PUBLIC_API_URL si l'API tourne sur un port différent
```

### Développement

```bash
pnpm dev
# → http://localhost:3000
```

### Générer les types depuis l'API

```bash
# L'API Laravel doit être démarrée
pnpm generate:types
```

## Stack

| Couche       | Technologie                     |
|--------------|---------------------------------|
| Framework    | Next.js 15 (App Router)         |
| Runtime      | React 19                        |
| Langage      | TypeScript 5.6+ strict          |
| UI           | Tailwind CSS 4 + shadcn/ui      |
| Icônes       | Lucide React                    |
| Formulaires  | React Hook Form + Zod           |
| HTTP         | fetch natif + TanStack Query v5 |
| Auth         | Sanctum SPA (cookies httpOnly)  |
| PWA          | @ducanh2912/next-pwa            |
| Tests unit   | Vitest + Testing Library        |
| Lint/Format  | ESLint + Prettier               |

## Auth SPA (Sanctum)

```typescript
import { initCsrf, apiFetch } from "@/lib/api";

// 1. Initialiser le cookie CSRF
await initCsrf();

// 2. Login
await apiFetch("/api/v1/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});

// 3. Requêtes suivantes — cookie envoyé automatiquement
const data = await apiFetch("/api/v1/auth/profile");
```
