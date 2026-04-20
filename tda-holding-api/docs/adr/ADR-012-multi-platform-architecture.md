 # ADR-012 — Architecture multi-plateforme : Next.js unifié + PWA

- **Date** : 2026-04-19
- **Statut** : Accepté (en attente d'implémentation)
- **Auteur** : Winston 🏛️ (Architecte)
- **Implémentation** : Amelia 🎨💻 — Sprints Web 1 à 5
- **Documents liés** : `BRIEF-001`, `PRD-001`, `ADR-009`, `ADR-010`, `ADR-011`
- **Décision utilisateur** : présence stores (Play / App Store) non requise au lancement

---

## Contexte

L'utilisateur souhaite introduire une **application web** grand public. L'écosystème TDA Holding contient aujourd'hui :

- `tda-holding-api` — Laravel 13 + API Sanctum + Back-office Inertia/React (interne, non public)
- `tda-holding-mobile` — Expo SDK 54 / React Native 0.81 (client public)

Le BRIEF-001 a listé 4 options (A : `react-native-web`, B : Next.js dédié + RN, C : monorepo Turborepo, D : Inertia étendu au public). L'analyse a fait émerger une **Option E** non listée initialement :

> **Option E — Remplacer l'app mobile RN par une PWA Next.js unifiée.**

Après arbitrage utilisateur (2026-04-19), cette Option E est retenue. La présence App Store / Play Store n'est **pas** requise au lancement ; elle pourra être ajoutée plus tard via un wrapper TWA ou Capacitor sans refonte du codebase.

### Facteurs déterminants

1. **Usage actuel de l'app mobile** ne mobilise aucune API native exclusive (pas de NFC, ni Bluetooth, ni biométrie, ni SDK paiement natif). Seules la caméra et les notifications sont envisagées, toutes deux disponibles en Web API.
2. **Parc africain majoritairement Android bas-moyen de gamme** où la PWA performe mieux qu'une app native lourde (mises à jour silencieuses, empreinte disque minimale, aucun téléchargement store).
3. **Risque structurel de drift** mobile/web (P5 du PRD) résolu par design si un seul frontend existe.
4. **Phase 3 mobile** livrée très récemment et de taille modeste (~15 écrans) : les décisions produit sont transposables, seule l'enveloppe technique change.

---

## Décision

### 1. Architecture cible

```
┌──────────────────────────────────────────────────────────────────────┐
│                    TDA Holding — Architecture E                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Navigateur desktop       Navigateur mobile       PWA installée     │
│        ▼                         ▼                        ▼          │
│   ┌─────────────────────────────────────────────────────────┐        │
│   │   tda-holding-web (Next.js 15 App Router)               │        │
│   │   tdaholding.com                                        │        │
│   │   - React Server Components par défaut                  │        │
│   │   - PWA Manifest + Service Worker                       │        │
│   │   - Web Push API (iOS 16.4+ / Android)                  │        │
│   │   - Package @tda/api-types (généré OpenAPI)             │        │
│   └──────────────────────┬──────────────────────────────────┘        │
│                          │ cookies httpOnly + CSRF                   │
│                          ▼                                           │
│   ┌─────────────────────────────────────────────────────────┐        │
│   │   tda-holding-api (Laravel 13)                          │        │
│   │   api.tdaholding.com                                    │        │
│   │   - Sanctum SPA (cookie) + Sanctum Bearer (legacy)      │        │
│   │   - Routes /api/v1/...                                  │        │
│   │   - Policies RBAC (ADR-010)                             │        │
│   │   - BookingWorkflow (ADR-009)                           │        │
│   │   - Morph map + FormRequests (ADR-011)                  │        │
│   │   - OpenAPI spec exposée sur /api/v1/openapi.json       │        │
│   └──────────┬──────────────────────────────────────────────┘        │
│              ▼                                                       │
│   ┌─────────────────────────────────────────────────────────┐        │
│   │   tda-holding-admin (Inertia/React — inchangé)          │        │
│   │   admin.tdaholding.com                                  │        │
│   └─────────────────────────────────────────────────────────┘        │
│                                                                      │
│   ❌ tda-holding-mobile (Expo/RN) → archivé                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 2. Stack `tda-holding-web`

| Couche | Technologie | Justification |
|---|---|---|
| Framework | Next.js 15 (App Router) | SEO natif (SSR/SSG/ISR), React Server Components, écosystème mature |
| Runtime | React 19 | Aligné avec l'admin Inertia, Server Actions disponibles |
| Langage | TypeScript 5.6+ strict | Typage cross-stack via `@tda/api-types` |
| UI | Tailwind CSS 4 + shadcn/ui | Cohérence design system avec l'admin |
| Icônes | Lucide React | Cohérence admin |
| Formulaires | React Hook Form + Zod | Validation côté client alignée sur les FormRequests backend |
| HTTP | `fetch` natif + wrapper TanStack Query v5 | Server Components utilisent `fetch`, client utilise React Query pour les mutations |
| Auth client | `next-auth` v5 **OU** implémentation manuelle Sanctum SPA | Décision tranchée en §4 |
| PWA | `@ducanh2912/next-pwa` (ou Serwist) | Génération Service Worker, manifest, stratégies de cache |
| Tests unit | Vitest + Testing Library | Rapidité, compat Next.js 15 |
| Tests E2E | Playwright | Multi-navigateur, tests PWA possibles |
| Lint / Format | ESLint + Prettier | Config Next.js par défaut |
| Déploiement | Vercel (production) + Docker fallback | Vercel = DX optimale, fallback VPS si souveraineté |

### 3. Monorepo léger

Plutôt qu'un Turborepo complet (Option C du BRIEF, jugée trop lourde), on introduit **un monorepo minimal** au sein de `tda-holding-web` :

```
tda-holding-web/
├── apps/
│   └── web/                    # Next.js 15 (ancienne racine)
├── packages/
│   └── api-types/              # Types TypeScript générés depuis OpenAPI
├── package.json                # workspaces: apps/*, packages/*
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

**Workflow `@tda/api-types`** :

1. Laravel expose `GET /api/v1/openapi.json` (via `dedoc/scramble` ou `l5-swagger`).
2. Script `pnpm generate:types` → `openapi-typescript http://api.tdaholding.com/api/v1/openapi.json -o packages/api-types/src/index.ts`.
3. CI déclenche la regénération à chaque push sur `main` de `tda-holding-api`.
4. Les composants Next.js consomment les types : `import type { paths, components } from '@tda/api-types'`.

**Bénéfice** : un ajout de champ côté API est détecté comme type error dans Next.js dès la CI. Zéro drift possible.

### 4. Authentification web — Sanctum SPA stateful

**Décision** : Sanctum SPA (cookies httpOnly + CSRF), **pas** de Bearer token côté web.

**Pourquoi** :
- Le token Bearer stocké en `localStorage` est exposé XSS — inacceptable pour un site public.
- Les cookies httpOnly + `SameSite=Lax` + CSRF token = état de l'art web sécurité.
- Sanctum supporte nativement les deux modes sur la **même installation** : `tda-holding-web` utilise le mode SPA, `tda-holding-mobile` (désormais archivé) utilisait le mode Bearer.

**Implémentation** :

```php
// config/sanctum.php — déjà en place, à confirmer
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'tdaholding.com,localhost:3000')),
```

```typescript
// Next.js — initialisation CSRF avant chaque mutation
async function getCsrf() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
}
```

**Flow login web** :

1. Next.js `GET /sanctum/csrf-cookie` → cookie `XSRF-TOKEN` reçu.
2. `POST /api/v1/auth/login` avec header `X-XSRF-TOKEN` → session cookie reçu (httpOnly).
3. Requêtes suivantes : cookie envoyé automatiquement (`credentials: 'include'`).

**Impact backend** — modifications à prévoir (voir §12) :
- Confirmer `EnsureFrontendRequestsAreStateful` actif sur `/api/*`.
- Mettre à jour `config/cors.php` pour autoriser `tdaholding.com` avec `supports_credentials: true`.

### 5. Domaines et CORS

| Domaine | Rôle | Hébergement |
|---|---|---|
| `tdaholding.com` | Site public (Next.js + PWA) | Vercel |
| `www.tdaholding.com` | Redirect 301 → `tdaholding.com` | Vercel |
| `api.tdaholding.com` | API Laravel | VPS (inchangé) |
| `admin.tdaholding.com` | Back-office Inertia | VPS (inchangé) |

**CORS `config/cors.php`** :

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://tdaholding.com',
        'http://localhost:3000',         // dev web
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,       // requis pour Sanctum SPA
];
```

**Cookies de session** : domaine `.tdaholding.com` pour pouvoir être partagé entre sous-domaines si l'admin et le web public utilisent la même session (décision §9).

### 6. Versioning API — `/api/v1/`

**Décision** : migrer toutes les routes `/api/*` vers `/api/v1/*` **dans le sprint backend précédant Web Sprint 1**.

**Implémentation Laravel 11+** (dans `bootstrap/app.php`) :

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    apiPrefix: 'api/v1',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

**Rétro-compatibilité** : une route catch-all sur `/api/*` (hors `/api/v1/*`) renvoie 410 Gone avec un message explicite. L'app mobile RN est archivée donc aucun client legacy ne subsiste.

**Pourquoi maintenant** : le coût est quasi-nul tant qu'il n'y a qu'un seul client. L'ajouter plus tard = migration forcée de tous les clients.

### 7. PWA — Manifest, Service Worker, Push

**Manifest** (`apps/web/public/manifest.json`) :

```json
{
  "name": "TDA Holding",
  "short_name": "TDA",
  "description": "Mobilité et immobilier premium en Afrique",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1B5E20",
  "theme_color": "#1B5E20",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [...]
}
```

**Service Worker** (via Serwist ou next-pwa) :

- **Pages** : `NetworkFirst` avec fallback cache (catalogue reste consultable hors ligne).
- **API `/api/v1/vehicles` + `/api/v1/properties`** : `StaleWhileRevalidate` 24h.
- **API mutations** (`POST`, `PUT`, `DELETE`) : **pas de cache**, toujours réseau. Background sync pour les échecs.
- **Médias** : `CacheFirst` 30 jours.
- **App shell** : `CacheFirst` avec versioning auto Next.js.

**Web Push** :

- Enregistrement : API Web Push standard + clés VAPID stockées en `.env`.
- Backend Laravel : canal `webpush` via `laravel-notification-channels/webpush`.
- Notifications déclenchées : confirmation booking, rappel RDV J-1, message admin.
- Opt-in explicite côté UI (pas de demande auto au premier chargement — anti-pattern).

**Installabilité** :

- Bannière Chrome Android : déclenchée automatiquement par le navigateur après critères PWA validés.
- Bouton custom « Installer l'app » sur iOS (Safari ne déclenche pas de bannière) avec tutoriel « Partager → Ajouter à l'écran d'accueil ».

### 8. Stratégie médias — CDN léger

**Décision** : migrer les médias vers un **CDN externe** dès le sprint Web 1.

**Choix recommandé** : **Cloudflare R2** (S3-compatible, pas de frais de sortie, ~0.015 $/Go/mois).

**Alternative** : Bunny.net (~0.01 $/Go/mois) si simplicité max.

**Pourquoi** :
- LCP ≤ 2.5s du PRD impossible avec `storage/app/public` servi par Laravel (pas de HTTP/2 push, pas d'edge, pas de transformation d'image).
- Le Lighthouse SEO ≥ 90 exigé par le PRD nécessite des images optimisées et servies en edge.
- Coût maîtrisé : estimation ~10 000 photos × 500 Ko = 5 Go → ~0.05-0.08 $/mois stockage + bande passante.

**Implémentation** :

- Adapter Flysystem Laravel avec driver S3 pointant sur R2.
- `.env` : `FILESYSTEM_DISK=r2` en prod, `public` en dev local.
- `Media` model : accessor `url` qui pointe sur le CDN en prod, sur `/storage/...` en dev.
- Next.js : `<Image src={media.url}>` — le domaine R2 est whitelisté dans `next.config.js`.

### 9. Sessions partagées web ↔ admin ?

**Décision** : **non**. Chaque sous-domaine a sa session distincte.

**Justification** :
- Un super_admin qui se connecte sur `admin.tdaholding.com` **n'est pas** automatiquement connecté sur `tdaholding.com` côté client. Séparation de privilèges nette.
- Un admin peut légitimement ouvrir `tdaholding.com` en tant que visiteur public sans interférence avec sa session admin.
- Cookies configurés avec `domain=admin.tdaholding.com` et `domain=tdaholding.com` respectivement (pas `.tdaholding.com`).

### 10. Plan de sunset `tda-holding-mobile`

**Séquence** :

1. **Sprint Web 1-4** : mobile RN reste déployable mais ne reçoit **aucun développement nouveau**. Freeze.
2. **Sprint Web 5 (fin MVP web)** : tests utilisateurs de la PWA sur Android bas de gamme + iPhone SE + Samsung récents. Validation des KPIs AC-10 du PRD.
3. **Go-live web** : communication utilisateurs → *« la nouvelle app TDA est sur tdaholding.com, installez-la depuis votre navigateur »*.
4. **Semaine +2** : archive Git du repo `tda-holding-mobile` (tag `archive/2026-04` + README « projet archivé »). Le repo reste consultable.
5. **Semaine +4** : si aucun feedback utilisateur négatif, retrait définitif des builds Expo (EAS).

**Bundle IDs conservés** :
- iOS : `com.tdaholding.mobile` → réservé pour future app native éventuelle.
- Android : `com.tdaholding.mobile` → idem.

### 11. CI/CD

**`tda-holding-api`** (inchangé) :
- GitHub Actions : lint (Pint) + tests (PHPUnit) + regénération OpenAPI sur `main`.
- Publish spec sur S3/R2 public → consommable par `tda-holding-web` en CI.
- Déploiement VPS via SSH (script existant).

**`tda-holding-web`** (nouveau) :
- GitHub Actions : lint + typecheck + tests Vitest + build Next.js + Playwright E2E.
- Sur push `main` : déploiement Vercel production.
- Sur PR : preview URL Vercel par branche.
- Cron CI quotidien : `pnpm generate:types` → commit auto si diff (détection drift API).

### 12. Pré-requis backend avant Sprint Web 1

Le code backend doit impérativement avoir atteint les jalons suivants (cf. `audit-remediation-guide.md`) :

- ✅ **ADR-009** — BookingWorkflow unifié (terminé)
- ✅ **ADR-011** — Morph map + FormRequests + QueryHelpers (terminé)
- ⚠️ **ADR-010** — Policies RBAC complètes (en cours, à finaliser)
- ⚠️ **Epic Q** — Quick wins P0 (en cours)
- 🔲 **API versioning `/api/v1/`** — à faire
- 🔲 **OpenAPI spec exposée** — à faire (`dedoc/scramble` recommandé)
- 🔲 **CORS mis à jour** pour `tdaholding.com` + `supports_credentials: true`
- 🔲 **Sanctum SPA testé** depuis un client local Next.js
- 🔲 **Migration médias R2** — à faire ou reporter à Sprint Web 1
- 🔲 **`slug` nullable** sur `vehicles` et `properties` — migration + backfill

**Blocage explicite** : Web Sprint 1 **ne démarre pas** tant que ces items ne sont pas verts.

---

## Conséquences

### Positives

- **Un seul frontend public** à maintenir (vs 2 prévus initialement). Vélocité doublée.
- **Zéro drift structurel** mobile/web (P5 du PRD résolu by design).
- **SEO natif** disponible dès que l'utilisateur investira en contenu (Phase V2 du PRD).
- **Mises à jour instantanées** — pas de cycle App Store review, pas de forcing updates côté utilisateur.
- **Cross-device trivial** (AC-7 du PRD devient tautologique : même app).
- **Empreinte disque utilisateur minimale** — critique sur Android bas de gamme.
- **Budget infra maîtrisé** : Vercel gratuit (Hobby) ou ~20 $/mois (Pro), R2 ~5 $/mois, VPS Laravel inchangé.
- **Réversibilité** : si un jour une vraie app native devient stratégique, wrap Capacitor (1-2 sprints) sans rewrite.

### Négatives / compromis

- **Aucune présence stores** au lancement. Les utilisateurs découvrent le produit via URL, WhatsApp, SEO, bouche-à-oreille. Acceptable au démarrage TDA, à réévaluer à 6 mois.
- **iOS : installation PWA moins fluide** que sur Android (pas de bannière auto, Safari impose « Partager → Ajouter à l'écran »). Tutoriel UI requis.
- **Push notifications iOS** : fonctionnent uniquement après installation PWA (pas avant). Taux d'adoption push probablement plus faible que sur Android.
- **Phase 3 mobile RN** devient du code mort. Psychologiquement coûteux même si techniquement assumé.
- **Dépendance Vercel** (ou infra équivalente) : si souveraineté africaine devient exigence, replier sur VPS Docker reste possible mais perd une partie de la DX.
- **Pas d'accès natif avancé** : si une future feature requiert NFC (iOS), Bluetooth (iOS) ou SDK bancaire natif, il faudra passer en Option F (Capacitor wrap).

### Impact utilisateurs existants

- Les utilisateurs beta qui auraient installé l'app RN doivent migrer vers la PWA. Communication explicite : *« la nouvelle app TDA remplace l'ancienne, installez-la depuis votre navigateur Chrome/Safari »*.
- Les tokens Sanctum Bearer éventuellement stockés dans l'AsyncStorage mobile deviennent obsolètes → re-login nécessaire.

---

## Alternatives considérées

| Option | Description | Pourquoi rejetée |
|---|---|---|
| **A** | `react-native-web` pour compiler l'app RN en web | SEO inexistant, UX desktop médiocre, bundle JS énorme |
| **B** | Next.js dédié + mobile RN conservé | 2 frontends à maintenir, drift structurel inévitable, coût d'opportunité élevé |
| **C** | Monorepo Turborepo avec packages partagés | Complexité initiale importante (migration 2 repos existants), ROI insuffisant pour une équipe réduite |
| **D** | Étendre l'admin Inertia au grand public | Mélange périmètres public/admin (sécurité), SEO faible, rupture avec le pattern "admin séparé" déjà en place |
| **F (future)** | Capacitor wrap iOS + Android de la PWA | Non nécessaire au MVP. Option d'upgrade si besoin stores plus tard |

**Option retenue : E** — la plus simple, la plus cohérente, la plus réversible.

---

## Critères d'acceptation (à valider à la livraison)

### Architecture

- [ ] `tda-holding-web` créé avec structure monorepo `apps/web` + `packages/api-types`.
- [ ] OpenAPI spec exposée sur `/api/v1/openapi.json` et consommée en CI.
- [ ] `grep -r "http://localhost" apps/web/src` → 0 résultat (toutes les URLs viennent d'une config centralisée).
- [ ] TypeScript `strict: true` activé sans `any` implicite.

### Auth

- [ ] Login web via Sanctum SPA fonctionnel (cookies httpOnly + CSRF).
- [ ] Session admin (`admin.tdaholding.com`) distincte de la session public (`tdaholding.com`).
- [ ] XSS test passant (injection dans un champ profil ne permet pas de voler le cookie).
- [ ] CSRF test passant (requête cross-origin sans token → 419).

### PWA

- [ ] Lighthouse PWA score ≥ 90.
- [ ] Installation Chrome Android déclenche la bannière.
- [ ] Installation iOS Safari fonctionne via « Partager → Ajouter à l'écran d'accueil ».
- [ ] App ouverte en `display=standalone` (pas de barre d'URL).
- [ ] Service Worker cache le catalogue → navigation hors ligne possible sur pages déjà visitées.
- [ ] Web Push reçu sur Android Chrome et iOS 16.4+ après opt-in.

### Performance (cibles PRD AC-10)

- [ ] LCP < 2.5s sur catalogue en 4G simulé.
- [ ] CLS < 0.1.
- [ ] Bundle JS initial < 200 KB gzipped.
- [ ] Lighthouse SEO ≥ 90.

### Backend

- [ ] Toutes les routes API migrées sur `/api/v1/*`.
- [ ] `/api/*` hors `/v1/*` retourne 410 Gone.
- [ ] `config/cors.php` autorise `tdaholding.com` avec `supports_credentials: true`.
- [ ] Médias servis via CDN R2 en prod.

### Sunset mobile

- [ ] `tda-holding-mobile` archivé (tag `archive/2026-04`, README mise à jour).
- [ ] Builds EAS iOS/Android supprimés ou désactivés.
- [ ] Communication utilisateurs beta effectuée.

---

## Plan de release récapitulatif

```
Sprint BE-1  [Backend]  Finaliser Epic Q (audit quick wins) + Epic A (policies RBAC)
Sprint BE-2  [Backend]  API versioning /v1 + OpenAPI spec + CORS Sanctum SPA + slug columns
Sprint BE-3  [Backend]  Migration médias CDN R2 + tests de charge

Sprint WEB-1 [Web]      Setup Next.js 15 + monorepo + @tda/api-types + auth Sanctum SPA
                        + home + catalogue véhicules + détail véhicule
Sprint WEB-2 [Web]      Catalogue immobilier + détail + booking form + appointment form
Sprint WEB-3 [Web]      Dashboard client (réservations, RDV, favoris, profil, notifications)
Sprint WEB-4 [Web]      PWA manifest + Service Worker + Web Push + installabilité
Sprint WEB-5 [Release]  Tests utilisateurs + audit Lighthouse + go-live + sunset mobile
```

**Durée estimée** : 8 sprints (3 backend + 5 web) ≈ 10-14 semaines selon vélocité équipe.

---

## Références

### Documents internes
- `@d:/Mes_Projets/tda-holding-api/.bmad/briefs/BRIEF-001-multi-platform-evolution.md`
- `@d:/Mes_Projets/tda-holding-api/.bmad/prds/PRD-001-web-platform.md`
- `@d:/Mes_Projets/tda-holding-api/docs/adr/ADR-009-booking-workflow.md`
- `@d:/Mes_Projets/tda-holding-api/docs/adr/ADR-010-authorization-policies.md`
- `@d:/Mes_Projets/tda-holding-api/docs/adr/ADR-011-structural-hygiene.md`
- `@d:/Mes_Projets/tda-holding-api/audit-remediation-guide.md`

### Standards et documentation externes
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Laravel Sanctum SPA Authentication](https://laravel.com/docs/sanctum#spa-authentication)
- [Web Push API (MDN)](https://developer.mozilla.org/docs/Web/API/Push_API)
- [PWA on iOS 16.4+](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [Serwist (Next.js PWA)](https://serwist.pages.dev/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [dedoc/scramble (OpenAPI Laravel)](https://scramble.dedoc.co/)

---

*« L'architecture la plus élégante n'est pas celle qui contient le plus de composants, mais celle qu'on peut expliquer en un diagramme. »*
— Winston 🏛️
