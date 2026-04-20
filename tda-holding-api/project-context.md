# TDA Holding — Project Context

> **Source de vérité unique** pour la stack technique, l'architecture, et les conventions de nommage du projet TDA Holding.
> Ce document doit être consulté AVANT toute intervention par les agents BMAD (Analyst, Architect, Dev, PM, SM, TEA, Tech-Writer, UX-Designer).
> Dernière mise à jour : 2026-04-19 (pivot Option E — voir `docs/adr/ADR-012-multi-platform-architecture.md`)

---

## 1. Vision produit

**TDA Holding** est une application multiservices (Mobilité & Immobilier) à vocation africaine, proposant :
- Location et vente de **véhicules** (avec ou sans chauffeur)
- Location et vente de **biens immobiliers** (villa, appartement, maison, duplex, studio, terrain, local commercial)
- Prise de **rendez-vous** pour les véhicules en vente ou vente/location
- Gestion de **chauffeurs** comme ressources admin
- **Paiement manuel** (cash à l'arrivée) — validation admin ; champs prévus pour mobile money futur

### Modèle métier
- B2C multi-agents (un seul admin pour l'instant, évolution prévue vers multi-vendeurs / multi-agents)
- Rôles RBAC : `super_admin`, `agent`, `vendor`, `client`
- Inscription libre pour les clients ; les agents/vendeurs sont créés par l'admin

### Branding
- **Logo** : TDA Holding avec carte d'Afrique
- **Palette** :
  - Vert foncé : `#1B5E20` / `#2E7D32` (primaire)
  - Doré / Or : `#DAA520` / `#FFD700` (accent)
  - Blanc, gris argent
- **Identité** : africaine, premium

### Référence UX/UI — Maquette Readdy *(validée le 2026-04-20)*

> Amelia s'inspire de cette maquette pour l'implémentation visuelle du frontend `tda-holding-web`.

| Ressource | URL |
|-----------|-----|
| **Preview maquette** | https://readdy.cc/preview/714cd5ee-bf0e-405e-add9-48b26d0f0c58/8618127/ |
| Éditeur Readdy | https://readdy.ai/project/714cd5ee-bf0e-405e-add9-48b26d0f0c58 |

- La maquette est la référence **visuelle et UX** (hiérarchie, composants, espacements, CTAs).
- Les wireframes ASCII du PRD-001 §6 restent la référence **fonctionnelle**.
- La **palette TDA** (`#1B5E20`, `#DAA520`) prime sur la maquette si conflit de couleurs.
- **Pas d'onboarding 3 slides** sur le web — la Home `/` remplace ce rôle (décision validée, A3).
- Détails complets dans `PRD-001-web-platform.md` §15b.

---

## 2. Architecture globale

```
┌────────────────────────────────────────────────────────────────────┐
│                     TDA Holding Platform (Option E)                │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌───────────────────────────┐        ┌───────────────────────────┐   │
│   │   tda-holding-web       │        │  tda-holding-api         │   │
│   │   (Next.js 15 + PWA)    │◄──────►│  (Laravel 13)            │   │
│   │                         │  HTTPS │                          │   │
│   │   - Desktop browser     │   +    │  - API Sanctum (SPA+tok) │   │
│   │   - Mobile browser      │ cookies│  - Policies RBAC         │   │
│   │   - PWA installée       │        │  - BookingWorkflow       │   │
│   │   - Service Worker      │        │  - OpenAPI /api/v1/...   │   │
│   │   - Web Push            │        │  - Back-office Inertia   │   │
│   │   tdaholding.com        │        │    (React 18)            │   │
│   │                         │        │    admin.tdaholding.com  │   │
│   └───────────────────────────┘        │    api.tdaholding.com    │   │
│            ▲                        │                          │   │
│            │                        └───────────┬───────────────┘   │
│            │                                    │                   │
│   @tda/api-types                                 ▼                   │
│   (générés depuis                       ┌─────────────────────┐        │
│    OpenAPI spec)                         │   PostgreSQL        │        │
│                                          └─────────────────────┘        │
│                                                                     │
│   ❌ tda-holding-mobile (Expo / RN) — archivé (Option E)              │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

**Deux workspaces Git actifs** (après pivot Option E) :
- `d:\Mes_Projets\tda-holding-api`   → Backend Laravel + Back-office admin Inertia
- `d:\Mes_Projets\tda-holding-web`    → Frontend unifié Next.js 15 + PWA (**à créer au Sprint WEB-1**)

**Workspace archivé** :
- `d:\Mes_Projets\tda-holding-mobile` → Application React Native Expo (**figuée, sera archivée Git post go-live**)

---

## 3. Stack technique

### 3.1 Backend — `tda-holding-api`

| Catégorie           | Technologie / Version                |
|---------------------|--------------------------------------|
| Langage             | PHP 8.3+                             |
| Framework           | Laravel 13                           |
| Auth API            | Laravel Sanctum 4                    |
| Auth Web            | Laravel Breeze 2.4 (session)         |
| SPA Admin           | Inertia.js 2 + React 18              |
| UI Admin            | Tailwind CSS 4, Headless UI, Lucide  |
| Build frontend      | Vite 8 (via laravel-vite-plugin 3)   |
| Base de données     | PostgreSQL (dev: SQLite possible)    |
| Cache / Queue       | Database driver (par défaut)         |
| Sessions            | Database driver                      |
| Tests               | PHPUnit 12                           |
| Lint                | Laravel Pint                         |
| Logs                | stack / single                       |

**Configuration .env principale** :
```
APP_NAME="TDA Holding"
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=pgsql
DB_DATABASE=tda_holding
```

### 3.2 Frontend unifié — `tda-holding-web` *(en cours de setup)*

| Catégorie             | Technologie / Version                                           |
|-----------------------|-----------------------------------------------------------------|
| Framework             | Next.js 15 (App Router)                                         |
| Runtime               | React 19                                                        |
| Langage               | TypeScript 5.6+ (strict)                                        |
| Styling               | Tailwind CSS 4 + shadcn/ui                                      |
| Icônes                | Lucide React                                                    |
| Formulaires           | React Hook Form + Zod                                           |
| HTTP client           | `fetch` natif (RSC) + TanStack Query v5 (client)                |
| Auth                  | Sanctum SPA stateful (cookies httpOnly + CSRF)                  |
| PWA                   | `@ducanh2912/next-pwa` ou Serwist                               |
| Push                  | Web Push API (VAPID, compat iOS 16.4+ et Android)               |
| Monorepo              | pnpm workspaces (apps/web + packages/api-types)                 |
| Types API             | `@tda/api-types` générés via `openapi-typescript`               |
| Tests unit            | Vitest + Testing Library                                        |
| Tests E2E             | Playwright                                                      |
| Déploiement          | Vercel (prod) + Docker fallback                                 |
| Domaine prod          | `tdaholding.com`                                                |

**Structure monorepo prévue** :
```
tda-holding-web/
├── apps/
│   └── web/                    # Next.js 15 (App Router)
├── packages/
│   └── api-types/              # Types TS générés depuis OpenAPI
├── package.json                # workspaces: apps/*, packages/*
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

**URLs par environnement** (via `.env.local`) :
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000   # dev
NEXT_PUBLIC_API_URL=https://api.tdaholding.com  # prod
```

> ⚠️ Pour développer localement avec Sanctum SPA, configurer `SANCTUM_STATEFUL_DOMAINS=localhost:3000` dans `.env` Laravel.

### 3.3 Mobile archivé — `tda-holding-mobile` *(plus de développement actif)*

| Catégorie           | Technologie / Version                |
|---------------------|--------------------------------------|
| Plateforme          | Expo SDK 54                          |
| Runtime             | React 19.1 / React Native 0.81.5     |
| Navigation          | React Navigation 7                   |
| Statut              | **Gelé — sera archivé Git après go-live de `tda-holding-web`** |
| Bundle ID iOS/Android| `com.tdaholding.mobile` (réservé pour usage futur éventuel) |

> Motivation de l'archivage : l'Option E de l'ADR-012 remplace l'app native par une PWA Next.js unifiée. Les décisions produit et écrans sont transposés, seul le tech stack change. Voir `docs/adr/ADR-012-multi-platform-architecture.md`.

---

## 4. Structure des dossiers

### 4.1 Backend `tda-holding-api/`

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/           ← Contrôleurs Inertia (back-office)
│   │   ├── Api/             ← Contrôleurs API REST (mobile)
│   │   ├── Auth/            ← Breeze (login/register web)
│   │   └── ProfileController.php
│   ├── Middleware/
│   └── Requests/
├── Models/                  ← Eloquent (10 modèles)
├── Notifications/           ← Emails/push (BookingConfirmed, etc.)
├── Policies/                ← Autorisations (AppointmentPolicy, ...)
└── Providers/

database/
├── migrations/              ← 19 migrations (schema versionné)
├── factories/
└── seeders/

routes/
├── api.php                  ← Routes mobile (Sanctum)
├── web.php                  ← Routes admin (Inertia)
├── auth.php                 ← Routes Breeze
└── console.php

resources/
├── js/
│   ├── Components/          ← Composants React partagés
│   ├── Layouts/             ← AdminLayout.jsx, GuestLayout, ...
│   └── Pages/
│       ├── Admin/           ← Écrans back-office
│       ├── Auth/
│       └── Profile/
├── css/
└── views/                   ← Blade root (Inertia app shell)
```

### 4.2 Frontend `tda-holding-web/apps/web/` *(structure cible)*

```
apps/web/
├── src/
│   ├── app/                     ← Next.js App Router (routes)
│   │   ├── (public)/            ← Pages publiques (home, catalogues, détail)
│   │   │   ├── vehicules/
│   │   │   ├── immobilier/
│   │   │   └── chauffeurs/
│   │   ├── (auth)/              ← connexion, inscription
│   │   ├── mon-compte/          ← Dashboard client (protected)
│   │   ├── api/                 ← Route handlers Next.js (si nécessaire)
│   │   └── layout.tsx
│   ├── components/              ← shadcn/ui + composants métier
│   ├── lib/                     ← api-client, auth, utils
│   ├── hooks/                   ← Hooks React (TanStack Query wrappers)
│   └── types/                   ← Types TS locaux (qui n'ont pas de pendant API)
├── public/
│   ├── manifest.json            ← PWA manifest
│   ├── icons/                   ← 192, 512, maskable, splash screens
│   └── sw.js                    ← Service Worker (généré par Serwist)
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### 4.3 Package partagé `tda-holding-web/packages/api-types/`

```
packages/api-types/
├── src/
│   └── index.ts                 ← Types générés depuis api.tdaholding.com/api/v1/openapi.json
├── scripts/
│   └── generate.ts              ← Wrapper openapi-typescript
└── package.json
```

---

## 5. Modèle de données (Eloquent)

| Modèle        | Rôle                                                           | Relations clés                       |
|---------------|----------------------------------------------------------------|--------------------------------------|
| `User`        | Utilisateur RBAC (`super_admin` / `agent` / `vendor` / `client`)| bookings, appointments, favorites, vehicles, properties |
| `Category`    | Catégorisation véhicules/biens                                  | vehicles, properties                 |
| `Vehicle`     | Véhicule (rent/sale/both) + `is_available` bool                 | category, owner, bookings, media     |
| `Property`    | Bien immobilier (rent/sale/both) + `is_available` bool          | category, owner, bookings, media     |
| `Driver`      | Chauffeur (ressource admin)                                     | assigned_vehicle                     |
| `Media`       | Média polymorphique (image/video)                               | mediable (morphTo)                   |
| `Booking`     | Réservation polymorphique                                       | user, bookable (morphTo), driver, transactions |
| `Transaction` | Paiement                                                        | booking, user                        |
| `Favorite`    | Favori polymorphique                                            | user, favorable (morphTo)            |
| `Appointment` | Rendez-vous (vente/vente+location)                              | user, vehicle, confirmedBy           |

### Conventions modèles
- **Soft deletes** activés partout (audit trail)
- **Polymorphe** pour Booking, Favorite, Media (bookable, favorable, mediable)
- **Scopes** : `available()`, `forRent()`, `forSale()`, `featured()`
- **Casts booléens** explicites : `is_available`, `is_featured`, `has_ac`, etc.

---

## 6. API REST — Conventions

### Base : `http://<host>:8000/api/v1` *(versioning acquis via ADR-012)*

### Routes publiques (pas d'auth)
```
POST   /auth/register              Inscription client
POST   /auth/login                 Connexion (champ `login` = email OU téléphone)
GET    /categories                 Liste catégories
GET    /vehicles                   Liste véhicules (filtres : category_id, offer_type, status, city, brand, search)
GET    /vehicles/{id}              Détail (accepte aussi `{id}-{slug}`)
GET    /properties                 Liste biens
GET    /properties/{id}            Détail
GET    /drivers                    Liste chauffeurs
GET    /drivers/available          Chauffeurs disponibles
GET    /drivers/{id}               Détail
GET    /openapi.json               Spécification OpenAPI (consommée par @tda/api-types)
```

### Routes authentifiées
```
Auth    : /auth/logout, /auth/profile (GET/PUT), /auth/password (PUT)
Favoris : /favorites (GET), /favorites/toggle (POST)
Bookings: /bookings (GET/POST), /bookings/{id} (GET), /bookings/{id}/cancel (POST)
Rdv     : /appointments (GET/POST), /appointments/{id} (GET), /appointments/{id}/cancel (POST)
Trans.  : /transactions (GET), /transactions/{id} (GET)
Notifs  : /notifications (GET), /notifications/{id}/read, /notifications/read-all
```

### Deux mécanismes d'authentification (Sanctum)

| Canal              | Mode Sanctum                   | Stockage                 | Usage                    |
|--------------------|--------------------------------|--------------------------|--------------------------|
| **Web / PWA**      | SPA stateful (cookie + CSRF)   | Cookie httpOnly          | Recommandé désormais     |
| **Bearer token**   | Personal Access Token          | (obsolète post-archivage mobile RN) | Conservé pour usage futur éventuel |

### Routes admin (middleware `role:super_admin,agent`)
```
Dashboard : /admin/dashboard/stats, /recent-bookings, /recent-transactions
CRUD      : /categories, /vehicles, /properties, /drivers
Bookings  : /bookings/{id}/confirm|start|reject|complete
Trans.    : /transactions (POST/DELETE), /{id}/confirm|complete
Médias    : /media/upload, /media/{id} (DELETE), /media/{id}/primary
```

### Back-office (Inertia, routes `web.php`)
```
/admin/dashboard, /admin/vehicles, /admin/properties, /admin/bookings,
/admin/appointments, /admin/drivers, /admin/categories, /admin/transactions,
/admin/notifications
```

---

## 7. Conventions de nommage

### 7.1 Global
- **Langue** : code en **anglais**, UI/docs en **français**
- **Dates/commits** : ISO 8601 (`YYYY-MM-DD`), messages impératifs français acceptés

### 7.2 Backend (Laravel)
| Élément                     | Convention                  | Exemple                          |
|-----------------------------|-----------------------------|----------------------------------|
| Classes / Controllers       | `PascalCase`                | `VehicleController`, `Booking`   |
| Méthodes / variables        | `camelCase`                 | `markAsRented()`, `$bookable`    |
| Colonnes BDD                | `snake_case`                | `daily_rate`, `is_available`     |
| Tables                      | `snake_case` pluriel        | `vehicles`, `appointments`       |
| Routes URL                  | `kebab-case` / `snake_case` | `/admin/appointments`            |
| Migrations                  | `YYYY_MM_DD_HHMMSS_verb_...`| `2026_04_16_161311_add_is_available_to_vehicles_table.php` |
| Enums métier                | `snake_case` (string)       | `pending`, `confirmed`, `in_progress` |
| Policies                    | `{Model}Policy`             | `AppointmentPolicy`              |
| Notifications               | `PascalCase`                | `BookingConfirmed`               |

### 7.3 Frontend Admin (React / Inertia)
| Élément                     | Convention                  | Exemple                          |
|-----------------------------|-----------------------------|----------------------------------|
| Composants / Pages          | `PascalCase.jsx`            | `AdminLayout.jsx`, `Show.jsx`    |
| Hooks                       | `camelCase` préfixe `use`   | `useSomething`                   |
| Fichiers utilitaires        | `camelCase.js`              | `bootstrap.js`                   |
| Routes Ziggy                | `snake_case.dot`            | `admin.appointments.index`       |

### 7.4 Frontend Web (Next.js / TypeScript)
| Élément                     | Convention                  | Exemple                          |
|-----------------------------|-----------------------------|----------------------------------|
| Composants / Pages          | `PascalCase.tsx`            | `VehicleCard.tsx`, `Page.tsx`    |
| Hooks                       | `camelCase` préfixe `use`   | `useAuthUser`, `useVehicles`     |
| Routes App Router           | `kebab-case`                | `/mon-compte/reservations`       |
| Segments dynamiques         | `[param]` ou `[...slug]`    | `/vehicules/[id]/page.tsx`       |
| Server Components           | Async par défaut, pas de `'use client'` |                     |
| Client Components           | Annotation `'use client'` en haut du fichier |               |
| Types API                   | Depuis `@tda/api-types`     | `import type { components } from '@tda/api-types'` |
| Constantes                  | `UPPER_SNAKE_CASE`          | `API_BASE_URL`                   |

### 7.5 Statuts métier canoniques

**Booking** : `pending` → `confirmed` → `in_progress` → `completed` | `cancelled` | `rejected`
**Transaction** : `pending` → `confirmed` → `completed`
**Appointment** : `pending` → `confirmed` → `completed` | `cancelled`
**Vehicle/Property status** : `available` | `rented` | `sold` | `maintenance`
**Véhicule/Property `is_available`** : booléen qui contrôle la **disponibilité** à la réservation (visibilité toujours maintenue côté client pour afficher un badge "Réservé")
**Offer type** : `rent` | `sale` | `both`

### 7.6 Alias polymorphes (morph map — ADR-011)

**Stockage DB** : `vehicle` | `property` (alias courts, plus de FQCN `App\Models\*`)
**Tables concernées** : `bookings.bookable_type`, `favorites.favorable_type`, `media.mediable_type`

---

## 8. Règles métier essentielles

1. **Visibilité des véhicules/biens** : un item réservé (`is_available = false`) **reste visible** dans le catalogue, avec badge "Réservé" et bouton d'action désactivé. Jamais masqué.
2. **UI conditionnelle selon `offer_type`** (web + PWA) :
   - `rent` → bouton **« Réserver maintenant »** (flux booking classique)
   - `sale` / `both` → boutons **« Rendez-vous »** + **« WhatsApp »** (flux appointment)
3. **Connexion** : le champ `login` accepte **email OU téléphone**.
4. **Authentification web/PWA** : Sanctum SPA stateful (cookies httpOnly + CSRF). Jamais de Bearer token stocké en `localStorage` côté frontend.
5. **Rôles** : seul `super_admin` + `agent` passent le middleware `role:super_admin,agent`. Voir ADR-010 pour la matrice RBAC complète.
6. **Paiement** : `payment_method = cash` par défaut. Transaction générée à la confirmation d'un booking via `BookingWorkflow::confirm()` (ADR-009).
7. **Validation côté backend** : FormRequests pour Vehicle/Property/Driver (ADR-011), inline pour les ressources plus simples.
8. **Polymorphisme** : utiliser les alias `vehicle` / `property` en écriture ; lire via `Relation::getMorphedModel()` si conversion vers classe nécessaire.
9. **Slug** : chaque Vehicle et Property aura une colonne `slug` (unique, nullable) pour URLs partageables `/vehicules/{id}-{slug}`.

---

## 9. Commandes utiles

### Backend — `tda-holding-api`
```bash
# Dev complet (serveur + queue + logs + vite)
composer dev

# Serveur seul (accès web local nécessite --host=0.0.0.0 si frontend sur autre port)
php artisan serve --host=0.0.0.0 --port=8000

# Migrations
php artisan migrate
php artisan migrate:fresh --seed

# Tests
composer test
php artisan test

# Build admin Inertia
npm run build

# Lint
./vendor/bin/pint

# Génération OpenAPI (post-setup scramble)
php artisan scramble:export > ../tda-holding-web/packages/api-types/openapi.json
```

### Frontend Web — `tda-holding-web` *(à créer)*
```bash
# Installation (pnpm workspaces)
pnpm install

# Dev (Next.js App Router)
pnpm --filter web dev           # http://localhost:3000

# Génération des types depuis OpenAPI
pnpm --filter api-types generate

# Build production
pnpm --filter web build
pnpm --filter web start

# Tests
pnpm --filter web test          # Vitest
pnpm --filter web test:e2e      # Playwright

# Lint / typecheck
pnpm lint
pnpm typecheck
```

### Mobile archivé — `tda-holding-mobile`
> Aucune commande active. Le workspace est gelé jusqu'à l'archivage Git officiel (tag `archive/2026-04`).

### Identifiants par défaut
- **Admin** : `admin@tda-holding.com` / `password`

---

## 10. État d'avancement (au 2026-04-19)

### Phases livrées
- ✅ **Phase 1 — Backend API Laravel** : terminée (45+ routes, 10 modèles, RBAC, Sanctum)
- ✅ **Phase 2 — Back-office admin React/Inertia** : terminée (CRUD complet, dashboard, appointments)
- ✅ **Phase 3 — App mobile React Native/Expo** : livrée mais **archivée suite au pivot Option E** (voir ADR-012). Les décisions produit et écrans seront transposés en Next.js.

### Phases en cours / planifiées
- 🔄 **Phase 4a — Audit remediation (backend)** : en cours (voir `audit-remediation-guide.md` + ADR-009/010/011)
- 🔲 **Phase 4b — Setup Next.js + PWA** : planifié post-Epic Q/A/B/C (3 sprints backend préréquis)
- 🔲 **Phase 4c — MVP web unifié** : 5 sprints web (voir ADR-012 section roadmap)
- 🔲 **Phase 4d — Sunset `tda-holding-mobile`** : après go-live web

### Décisions architecturales actées
- ✅ **ADR-009** — BookingWorkflow unifié (Sprint 3, implémenté)
- ✅ **ADR-010** — Policies RBAC (en cours)
- ✅ **ADR-011** — Morph map + FormRequests + QueryHelpers (implémenté)
- ✅ **ADR-012** — Architecture multi-plateforme Option E (Next.js + PWA)

### Fonctionnalités récentes
- ✅ **Vehicle Visibility** : logique `is_available` implémentée (véhicules visibles + badge "Réservé")
- ✅ **BookingWorkflow Service** : transitions unifiées API/Admin, atomicité garantie

---

## 11. Méthodologie BMAD (équipe optimisée à 4 rôles)

Ce projet suit la méthodologie **BMAD** (Breakthrough Method for Agile AI-Driven Development), adaptée en **équipe optimisée à 4 rôles** (v3). Les profils sont définis dans `.bmad/agents/` :

| Agent              | Nom       | Icône | Rôle principal                                                         |
|--------------------|-----------|-------|------------------------------------------------------------------------|
| **Scrum Master**   | Bob       | 🏃    | Pilote le projet : stories, sprints, DoD, QA Gate, orchestration       |
| **Chef de Projet** | Olivia    | 🎯    | Vision globale, conception, brief/PRD, parcours, wireframes concept    |
| **Architect**      | Winston   | 🏛️    | Structure technique, sécurité, ADR, design BDD et API                  |
| **Dev-Designer**   | Amelia    | 🎨💻  | Implémentation code (backend + admin + mobile) **+** UI/UX fine        |

**Bob pilote** via l'équipe optimisée : **Olivia** porte la vision et la conception ; **Winston** garantit la structure technique et la sécurité ; **Amelia** implémente code et interface UI/UX.

Flux de travail :
```
Demande → Olivia (vision + concept) → Bob (stories + sprint) → {Winston | Amelia} → Bob (QA Gate + DoD)
```

Invocation :
```
Agis en tant que @sm (Bob) et ...
Agis en tant que @chef-projet (Olivia) et ...
Agis en tant que @architect (Winston) et ...
Agis en tant que @dev-designer (Amelia) et ...
```

Consulter `.bmad/agents/README.md` pour la matrice complète et `.bmad/agents/{agent}.md` pour le profil détaillé.

---

## 12. Journal des décisions product-owner (2026-04-20)

| Réf | Décision | Statut |
|-----|----------|--------|
| A1 | Architecture SEO-ready dès le MVP (Next.js RSC) | ✅ Validé |
| A2 | Auth Sanctum SPA stateful (cookies httpOnly + CSRF) | ✅ Validé |
| A3 | URLs en français + **suppression onboarding 3 slides** (Home = première impression) | ✅ Validé |
| A4 | Médias servis via CDN (Cloudflare R2) | ✅ Validé |
| A5 | API `/api/v1/` versionnée avant MVP | ✅ Validé |
| A6 | Types TypeScript partagés (`@tda/api-types` via OpenAPI) | ✅ Validé |
| C | 5 risques « Ruptures techniques » de l'analyse de régression actés (mitigations à implémenter) | ✅ Validé |
| Maquette | Readdy https://readdy.cc/preview/714cd5ee-bf0e-405e-add9-48b26d0f0c58/8618127/ = référence UX/UI pour Amelia | ✅ Validé |
| D | Section « Zones floues » — **supprimée** du périmètre analyse (non pertinent) | ❌ Annulé |

---

*Ce document est vivant. Mettez-le à jour à chaque changement structurel (nouvelle entité, nouveau flux, changement de stack, nouvelle convention).*
