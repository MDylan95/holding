# TDA Holding — Monorepo

Ce dépôt regroupe les deux projets de la plateforme TDA Holding (location/vente de véhicules et biens immobiliers à Abidjan).

## Structure

- **`tda-holding-api/`** — Backend Laravel 13 + Inertia/React (admin) + API Sanctum.
  Stack : PHP 8.3, Laravel 13, Sanctum, Inertia, React, Tailwind, PostgreSQL (prod) / SQLite (tests).
- **`tda-holding-web/`** — Frontend Next.js 15 PWA (site public + PWA installable).
  Stack : Next.js 15, React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui, TanStack Query, Sanctum SPA, pnpm workspaces.
- **`tda-holding-mobile/`** — App mobile Expo / React Native (archivée — remplacée par la PWA).
  Stack : Expo, React Native, Axios.

## Démarrer

### API

```bash
cd tda-holding-api
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
npm run dev
```

Tests : `php artisan test` (99 tests, SQLite en mémoire).

### Mobile

```bash
cd tda-holding-mobile
npm install
npx expo start
```

## Architecture & décisions

Les ADR sont dans `tda-holding-api/docs/adr/` :

- **ADR-009** — Booking workflow (overlap, verrouillage ressource).
- **ADR-010** — Policies d'autorisation (clients vs agents vs super_admin).
- **ADR-011** — Hygiène structurelle (morph map, FormRequests, cross-DB helpers).
- **ADR-012** — Cohérence métier & dette technique (Epic D + E).

## Convention de commits

Préfixes suivis du ticket : `feat(TDA-D03): …`, `fix(TDA-Q04): …`, `docs(ADR-012): …`, `test(TDA-D05): …`.
