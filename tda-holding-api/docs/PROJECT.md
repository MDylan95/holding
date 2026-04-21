# TDA Holding — Documentation du projet

> **Source de vérité unique** de la plateforme TDA Holding.
> Dernière mise à jour : 2026-04-21

---

## 1. Vision produit

**TDA Holding** est une plateforme multiservices (Mobilité & Immobilier) à vocation africaine, basée à Abidjan, proposant :

- Location et vente de **véhicules** (avec ou sans chauffeur)
- Location et vente de **biens immobiliers** (villa, appartement, maison, duplex, studio, terrain, local commercial)
- Prise de **rendez-vous** pour les véhicules en vente
- Gestion de **chauffeurs** comme ressources admin
- **Paiement manuel** (cash à l'arrivée) — validation admin ; champs prévus pour mobile money futur

### Modèle métier

- **B2C multi-agents** (un seul admin pour l'instant, évolution prévue vers multi-vendeurs / multi-agents)
- **Rôles RBAC** : `super_admin`, `agent`, `vendor`, `client`
- Inscription libre pour les clients ; les agents/vendeurs sont créés par l'admin

### Branding

- **Logo** : TDA Holding avec carte d'Afrique
- **Palette** :
  - Vert foncé : `#1B5E20` / `#2E7D32` (primaire)
  - Doré / Or : `#DAA520` / `#FFD700` (accent)
  - Blanc, gris argent
- **Identité** : africaine, premium

---

## 2. Architecture globale

```
┌────────────────────────────────────────────────────────────────────┐
│                     TDA Holding Platform                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌───────────────────────────┐      ┌───────────────────────────┐ │
│   │   tda-holding-web         │      │   tda-holding-api         │ │
│   │   (Next.js 15 + PWA)      │◄────►│   (Laravel 13)            │ │
│   │                           │ HTTPS│                           │ │
│   │   - Site public           │  +   │   - API Sanctum (SPA)     │ │
│   │   - Dashboard client      │cookie│   - Policies RBAC         │ │
│   │   - PWA installable       │      │   - BookingWorkflow       │ │
│   │   - Service Worker        │      │   - OpenAPI /api/v1/...   │ │
│   │                           │      │   - Back-office Inertia   │ │
│   │   tdaholding.com          │      │   api.tdaholding.com      │ │
│   │   localhost:3000 (dev)    │      │   admin.tdaholding.com    │ │
│   └───────────────────────────┘      │   localhost:8000 (dev)    │ │
│                                      └──────────┬────────────────┘ │
│                                                 │                  │
│   @tda/api-types (types TS)                     ▼                  │
│   générés depuis OpenAPI              ┌─────────────────────┐      │
│                                       │   PostgreSQL        │      │
│                                       └─────────────────────┘      │
│                                                                    │
│   ❌ tda-holding-mobile (Expo / RN) — archivé                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Workspaces Git actifs** :

- `tda-holding-api/` → Backend Laravel + Back-office admin Inertia
- `tda-holding-web/` → Frontend Next.js 15 PWA (site public + dashboard client)

**Workspace archivé** :

- `tda-holding-mobile/` → Application React Native Expo (remplacée par la PWA)

---

## 3. Stack technique

### 3.1 Backend — `tda-holding-api`

| Catégorie         | Technologie / Version              |
|-------------------|------------------------------------|
| Langage           | PHP 8.3+                           |
| Framework         | Laravel 13                         |
| Auth API          | Laravel Sanctum 4 (SPA + tokens)   |
| Auth Web          | Laravel Breeze 2.4 (session)       |
| SPA Admin         | Inertia.js 2 + React 18            |
| UI Admin          | Tailwind CSS 4, Headless UI, Lucide|
| Build frontend    | Vite 8 (laravel-vite-plugin 3)     |
| Base de données   | PostgreSQL (dev : SQLite possible) |
| Cache / Queue     | Database driver                    |
| Storage           | Local (dev) / Cloudflare R2 (prod) |
| Tests             | PHPUnit 12                         |
| Lint              | Laravel Pint                       |

**URLs** :

- Dev : `http://127.0.0.1:8000`
- Prod : `api.tdaholding.com` + `admin.tdaholding.com`

### 3.2 Frontend — `tda-holding-web`

| Catégorie     | Technologie / Version                           |
|---------------|-------------------------------------------------|
| Framework     | Next.js 15 (App Router)                         |
| Runtime       | React 19                                        |
| Langage       | TypeScript 5.6+ strict                          |
| Styling       | Tailwind CSS 4 + shadcn/ui                      |
| Icônes        | Lucide React                                    |
| Formulaires   | React Hook Form + Zod                           |
| HTTP client   | `fetch` natif + TanStack Query v5               |
| Auth          | Sanctum SPA (cookies httpOnly + CSRF)           |
| PWA           | `@ducanh2912/next-pwa`                          |
| Monorepo      | pnpm workspaces (apps/web + packages/api-types) |
| Types API     | `@tda/api-types` générés via `openapi-typescript`|
| Tests unit    | Vitest + Testing Library                        |
| Déploiement   | Vercel (prod)                                   |

**URLs** :

- Dev : `http://localhost:3000`
- Prod : `tdaholding.com`

### 3.3 Mobile archivé — `tda-holding-mobile`

| Catégorie           | Technologie / Version                |
|---------------------|--------------------------------------|
| Plateforme          | Expo SDK 54                          |
| Runtime             | React Native 0.81.5                  |
| Navigation          | React Navigation 7                   |
| Statut              | **Gelé — remplacé par la PWA**        |

---

## 4. Structure des dossiers

### 4.1 Backend `tda-holding-api/`

```
tda-holding-api/
├── app/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/           # Contrôleurs Inertia (back-office)
│   │   │   ├── Api/             # Contrôleurs API REST v1
│   │   │   └── Auth/            # Breeze (login/register web)
│   │   ├── Middleware/
│   │   └── Requests/            # FormRequests (Vehicle, Property, …)
│   ├── Models/                  # Eloquent (10 modèles)
│   ├── Notifications/           # Emails/push (BookingConfirmed, etc.)
│   ├── Policies/                # Autorisations RBAC
│   ├── Providers/
│   ├── Services/                # BookingWorkflow, etc.
│   └── Support/                 # QueryHelpers (cross-DB)
│
├── database/
│   ├── migrations/              # 26 migrations versionnées
│   ├── factories/
│   └── seeders/
│
├── routes/
│   ├── api.php                  # Retourne 410 Gone (deprecated)
│   ├── api_v1.php               # Routes API publiques + authentifiées
│   ├── web.php                  # Routes admin (Inertia)
│   ├── auth.php                 # Routes Breeze
│   └── console.php
│
├── resources/
│   ├── js/
│   │   ├── Components/          # Composants React partagés (admin)
│   │   ├── Layouts/             # AdminLayout.jsx, GuestLayout, …
│   │   └── Pages/
│   │       ├── Admin/           # Écrans back-office
│   │       ├── Auth/
│   │       └── Profile/
│   ├── css/
│   └── views/                   # Blade root (Inertia app shell)
│
├── docs/
│   ├── adr/                     # Architectural Decision Records
│   │   ├── ADR-009-booking-workflow.md
│   │   ├── ADR-010-authorization-policies.md
│   │   ├── ADR-011-structural-hygiene.md
│   │   ├── ADR-012-multi-platform-architecture.md
│   │   └── ADR-013-business-consistency.md
│   ├── PROJECT.md               # Ce document
│   └── CLEANUP.md               # Fichiers à supprimer
│
└── tests/                       # Feature + Unit tests (PHPUnit)
```

### 4.2 Frontend `tda-holding-web/apps/web/`

```
apps/web/src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Pages publiques
│   │   ├── page.tsx            # Accueil
│   │   ├── layout.tsx
│   │   ├── contact/
│   │   ├── services/
│   │   ├── reservations/       # Catalogue public (véhicules + immobilier)
│   │   ├── vehicules/[slug]/   # Détail véhicule
│   │   ├── proprietes/[slug]/  # Détail propriété
│   │   └── profil/
│   ├── dashboard/              # Espace utilisateur (auth requise)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Home dashboard
│   │   ├── reservations/
│   │   ├── favoris/
│   │   ├── profil/
│   │   ├── notifications/
│   │   └── parametres/
│   ├── layout.tsx              # Root layout (providers globaux)
│   └── globals.css
│
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── DashboardSidebar.tsx
│   └── …
│
├── lib/
│   ├── api.ts                  # Wrapper fetch + CSRF (Sanctum)
│   ├── auth.ts                 # login/logout/register helpers
│   ├── auth-context.tsx        # Contexte global utilisateur
│   └── hooks.ts                # useVehicles, useProperties, useUserBookings…
│
└── test/                       # Vitest setup
```

### 4.3 Package partagé `tda-holding-web/packages/api-types/`

```
packages/api-types/
├── src/index.ts                # Types générés depuis openapi.json
└── package.json
```

---

## 5. Modèle de données (Eloquent)

| Modèle        | Rôle                                                             | Relations clés                                         |
|---------------|------------------------------------------------------------------|--------------------------------------------------------|
| `User`        | Utilisateur RBAC (`super_admin`, `agent`, `vendor`, `client`)    | bookings, appointments, favorites, vehicles, properties|
| `Category`    | Catégorisation véhicules/biens                                   | vehicles, properties                                   |
| `Vehicle`     | Véhicule (rent/sale/both) + `is_available` bool + `slug` unique  | category, owner, bookings, media, driver               |
| `Property`    | Bien immobilier (rent/sale/both) + `is_available` + `slug`       | category, owner, bookings, media                       |
| `Driver`      | Chauffeur (ressource admin)                                      | assigned_vehicle                                       |
| `Media`       | Média polymorphique (image/video)                                | mediable (morphTo)                                     |
| `Booking`     | Réservation polymorphique                                        | user, bookable (morphTo), driver, transactions         |
| `Transaction` | Paiement                                                         | booking, user                                          |
| `Favorite`    | Favori polymorphique                                             | user, favorable (morphTo)                              |
| `Appointment` | Rendez-vous (vente / vente+location)                             | user, vehicle, confirmedBy                             |

### Conventions modèles

- **Soft deletes** activés partout (audit trail)
- **Morph polymorphique** pour Booking, Favorite, Media (bookable, favorable, mediable)
- **Scopes** : `available()`, `forRent()`, `forSale()`, `featured()`
- **Casts booléens** explicites : `is_available`, `is_featured`, `has_ac`, etc.
- **Accessors** pour compatibilité frontend : `name`, `price_per_day`, `price_sale`, `type`, `url` (Media)
- **Route key** : `slug` pour Vehicle/Property (API) — ID pour l'admin back-office

---

## 6. API REST — Conventions

### Base : `http://<host>:8000/api/v1`

### Routes publiques (pas d'auth)

```
POST   /auth/register              Inscription client
POST   /auth/login                 Connexion (email OU téléphone)
GET    /categories                 Liste catégories
GET    /vehicles                   Liste véhicules (filtres : category_id, offer_type, status, city, brand, search)
GET    /vehicles/{slug}            Détail véhicule
GET    /properties                 Liste biens
GET    /properties/{slug}          Détail bien
GET    /drivers                    Liste chauffeurs
GET    /drivers/available          Chauffeurs disponibles
GET    /drivers/{driver}           Détail chauffeur
GET    /openapi.json               Spécification OpenAPI
GET    /docs                       UI de la spec (Scramble)
```

### Routes authentifiées

```
Auth          : POST /auth/logout, GET/PUT /auth/profile, PUT /auth/password
Favoris       : GET /favorites, POST /favorites/toggle
Bookings      : GET /bookings, GET /bookings/{id}, POST /bookings, POST /bookings/{id}/cancel
Appointments  : GET /appointments, POST /appointments, POST /appointments/{id}/cancel
Transactions  : GET /transactions, GET /transactions/{id}
Notifications : GET /notifications, POST /notifications/{id}/read, POST /notifications/read-all
```

### Routes admin (super_admin + agent)

```
Dashboard  : GET /admin/dashboard/stats, recent-bookings, recent-transactions
Véhicules  : POST /vehicles, PUT /vehicles/{id}
Biens      : POST /properties, PUT /properties/{id}
Chauffeurs : POST /drivers, PUT /drivers/{id}
Bookings   : confirm, start, reject, complete
Médias     : POST /media/upload, DELETE /media/{id}, POST /media/{id}/primary
```

### Routes super_admin uniquement

```
Catégories : POST / PUT / DELETE
Suppressions : DELETE /vehicles/{id}, /properties/{id}, /drivers/{id}, /transactions/{id}
```

### Rate limiting

- `throttle:10,1` — Routes `auth/*` (register/login)
- `throttle:api-authenticated` — 60/min par utilisateur
- `throttle:api-create` — 10/min pour POST sensibles (bookings, favorites, appointments, transactions, media)

---

## 7. Authentification — Sanctum SPA

### Cycle dev

1. Frontend appelle `GET /sanctum/csrf-cookie` → reçoit cookie `XSRF-TOKEN`
2. Frontend inclut `X-XSRF-TOKEN` header + `withCredentials: true` sur chaque requête
3. Laravel valide le CSRF et la session

### Config requise

**Backend `.env`** :
```
APP_URL=http://127.0.0.1:8000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend `.env.local`** :
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 8. Historique du projet (état initial → état actuel)

### Phase 1 — Setup initial (Sprint BE-1)

- Initialisation Laravel 13 + Sanctum + Breeze
- Création des 10 modèles Eloquent avec relations polymorphiques
- 19 migrations initiales
- Seeders de démo (catégories, véhicules, propriétés)
- Back-office admin Inertia/React

### Phase 2 — Audit structurel (avril 2026)

- Audit structurel → 26 findings identifiés (P0 → P3)
- ADR-009 : BookingWorkflow unifié (overlap, verrouillage ressource)
- ADR-010 : Policies RBAC (clients vs agents vs super_admin)
- ADR-011 : Hygiène structurelle (morph map, FormRequests, cross-DB helpers)
- ADR-013 : Cohérence métier (renommé de ADR-012)

### Phase 3 — Multi-plateforme (Sprint BE-2)

- ADR-012 : Décision de remplacer l'app mobile RN par une PWA Next.js
- API versioning `/api/v1/*` (api.php → 410 Gone)
- OpenAPI via `dedoc/scramble` → `/api/v1/openapi.json` et `/api/v1/docs`
- CORS configuré avec `supports_credentials=true`
- Ajout de `slug` unique sur vehicles + properties (génération auto via `booted()`)
- **99 tests / 223 assertions verts**

### Phase 4 — Storage CDN (Sprint BE-3)

- Disk `r2` (Cloudflare R2, S3-compat) dans `config/filesystems.php`
- `Media::getUrlAttribute` disk-aware (dev `public` / prod `r2`)
- Upload + delete dans MediaController utilisent le disk configuré
- **101 tests / 225 assertions verts**

### Phase 5 — Frontend PWA (Sprint WEB-1)

- Création du monorepo `tda-holding-web/` (pnpm workspaces)
- Setup Next.js 15 + React 19 + TypeScript strict + Tailwind CSS 4
- PWA : `@ducanh2912/next-pwa`, manifest, service worker
- Image domains configurés (R2 CDN + local storage)
- Wrapper API Sanctum (`initCsrf`, `apiFetch`, `ApiError`)
- Package `@tda/api-types` (openapi-typescript)
- **Build prod : 108 kB first load JS**

### Phase 6 — Pages publiques (Sprint WEB-2)

**Site public connecté à l'API** :
- Accueil `/` — 4 véhicules en vedette dynamiques
- Catalogue `/reservations` (anciennement "Réservations") — véhicules + biens avec filtres (ville, type)
- Détail véhicule `/vehicules/[slug]` — galerie, specs, WhatsApp
- Détail propriété `/proprietes/[slug]` — galerie, specs, WhatsApp
- Header avec menu "Catalogue"

**Dashboard client complet** :
- Home `/dashboard` — stats temps réel (réservations actives, favoris, notifications)
- `/dashboard/reservations` — bookings réels de l'utilisateur
- `/dashboard/favoris` — toggle favoris via `/api/v1/favorites/toggle`
- `/dashboard/profil` — édition via `/api/v1/auth/profile`
- `/dashboard/notifications` — liste + mark as read
- `/dashboard/parametres` — changement mot de passe + préférences + déconnexion
- Sidebar avec boutons "Retour au site" et "Déconnexion" toujours visibles (scrollable)

**Hooks réutilisables** (`src/lib/hooks.ts`) :
- `useVehicles()`, `useProperties()`, `useDrivers()`, `useCategories()`
- `useVehicleBySlug(slug)`, `usePropertyBySlug(slug)`
- `useUserBookings()`, `useFavorites()` (avec toggle)

### Phase 7 — Corrections dashboard admin (21 avril 2026)

Suite aux tests utilisateur :

**Backend corrigé** :
- Casting `decimal:2` → `float` sur `daily_rate`, `sale_price`, `monthly_rent`, `surface_area` (évite la réduction de 1 FCFA)
- Accessors ajoutés sur Vehicle (`name`, `price_per_day`, `price_sale`, `type`) et Property (`name`, `price`, `type`) + `$appends`
- `Media::getUrlAttribute()` génère une URL absolue en dev (`http://localhost:8000/storage/...`)
- Admin `VehicleController` : `withoutTrashed()` sur l'index ; `edit/update/destroy` utilisent l'ID au lieu du slug (évite conflit avec `getRouteKeyName()`)

---

## 9. État actuel (21 avril 2026)

### ✅ Fonctionnel

- Site public Next.js entièrement connecté à l'API
- Dashboard client complet (bookings, favoris, profil, notifications, paramètres)
- Back-office admin Laravel/Inertia (CRUD véhicules, biens, chauffeurs, catégories, utilisateurs, bookings, rendez-vous, transactions, notifications)
- Auth Sanctum SPA + CSRF opérationnelle
- Upload médias (disk public en dev, R2 prévu en prod)
- Génération automatique des slugs (véhicules + propriétés)

### 🚧 À faire (prochaines étapes)

1. **Système de réservation / booking** — workflow complet côté frontend public (sélection dates, conflits, confirmation)
2. **Paiements** — intégration mobile money (champs déjà prévus côté modèle Transaction)
3. **Notifications push** — Web Push API (VAPID) côté PWA
4. **Tests E2E** — Playwright pour le frontend
5. **Déploiement** — Vercel pour le front + serveur (Forge/autre) pour l'API
6. **Images par défaut** — fallback côté backend si aucun média n'est uploadé

---

## 10. Commandes utiles

### Backend

```bash
cd tda-holding-api

# Setup
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Dev
php artisan serve                # http://127.0.0.1:8000
npm run dev                      # Vite pour l'admin Inertia

# Tests
php artisan test

# Storage
php artisan storage:link

# Lint
./vendor/bin/pint
```

### Frontend

```bash
cd tda-holding-web

# Setup
pnpm install

# Dev
pnpm dev                         # http://localhost:3000

# Types (nécessite l'API démarrée)
pnpm generate:types

# Tests
pnpm test

# Build
pnpm build
```

---

## 11. Conventions Git

**Format de commit** : `<type>(<scope>): <subject>`

- `feat(WEB-2): connect dashboard to API`
- `fix(BE-3): media URL generation`
- `docs(ADR-012): multi-platform architecture`
- `test(TDA-D05): booking workflow overlap`

**Types** : `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `style`

**Scopes** :
- `BE-<n>` : Sprint backend (API)
- `WEB-<n>` : Sprint frontend (Next.js)
- `ADR-<n>` : Architecture Decision Record
- `TDA-<letter><n>` : Ticket épique (A/B/C/D/E/Q)
- `Admin` : Back-office
