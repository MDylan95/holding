---
id: BRIEF-001
title: Évolution multi-plateforme — web dédié + mobile
author: Bob (Scrum Master)
status: Open
created: 2026-04-19
audience: Olivia (Chef de Projet), Winston (Architect), Amelia (Dev-Designer)
related:
  - project-context.md
  - docs/adr/ADR-011-structural-hygiene.md
next-deliverables:
  - PRD-001 (by Olivia)
  - ADR-012 (by Winston)
---

# BRIEF-001 — Évolution multi-plateforme : web dédié + mobile

## 📋 Résumé exécutif

Le produit TDA Holding existe aujourd'hui sous deux formes : **une API Laravel** (backend + back-office admin Inertia) et **une app mobile React Native/Expo**. L'utilisateur souhaite introduire **une véritable application web accessible depuis un navigateur**, dédiée au grand public, **en conservant** l'app mobile existante pour les usages smartphone.

L'objectif est une architecture multi-plateforme claire : chaque environnement (mobile / web) offre une **UX optimisée pour son device**, en s'appuyant sur une **base backend commune**.

**Mission de ce brief** : aligner Olivia, Winston et Amelia sur le contexte, les options et les questions à trancher avant production du PRD et de l'ADR.

---

## 🧭 Contexte — état actuel (2026-04-19)

### Stack existante

| Workspace                   | Stack                                              | Rôle                                    | Statut |
|-----------------------------|----------------------------------------------------|-----------------------------------------|--------|
| `tda-holding-api`           | Laravel 13 + Sanctum + Inertia/React 18 + Tailwind 4 | Backend API + back-office admin        | ✅ Phase 1 & 2 livrées |
| `tda-holding-mobile`        | Expo SDK 54 + React Native 0.81 + React 19.1       | App client iOS/Android                  | ✅ Phase 3 livrée     |

### Éléments notables du mobile

- Dépendance **`react-native-web` 0.21** déjà présente → l'app RN est *techniquement* lançable en navigateur via `expo start --web`.
- `package.json` déclare même un script `"web": "expo start --web"` → cette voie a été explorée mais non déployée.
- Le bundle ID iOS/Android est `com.tdaholding.mobile` → positionnement clairement mobile.

### Frontends "web" déjà présents dans l'écosystème

1. **Back-office admin Inertia** (`tda-holding-api/resources/js/Pages/Admin/`) — pour `super_admin` / `agent`. **Non-destiné au grand public.**
2. **Expo Web via `react-native-web`** — techniquement fonctionnel mais **non-optimisé pour desktop et non-SEO**.

### API REST existante

- 45+ routes sous `/api/...` (pas de versioning à ce jour — à adresser)
- Auth : **Sanctum Bearer token** (orienté mobile)
- CORS : configuration par défaut Laravel
- Médias : `storage/app/public` (pas de CDN)

### Design system

- Palette africaine : vert foncé `#1B5E20` / doré `#DAA520`
- Branding "TDA Holding" (logo avec carte Afrique)
- Typographies et composants définis dans `src/constants/theme.js` (mobile) et dans Tailwind (admin)

---

## 🎯 Objectif métier

### Vision
Faire passer TDA Holding d'une offre **mobile-only** à une offre **multi-plateforme** cohérente, en introduisant une application web publique accessible depuis desktop/laptop, **sans dégrader** l'expérience mobile existante.

### Bénéfices attendus
1. **Accessibilité élargie** : toucher les utilisateurs en contexte desktop (recherche prolongée, comparaison, B2B)
2. **SEO** : rendre chaque véhicule / bien indexable sur Google → acquisition organique
3. **Usages riches desktop** : dashboard avancé, filtres multicritères, carte interactive, tableaux comparatifs
4. **Marketing** : landing pages, contenus SEO locaux ("villa Cocody", "location 4x4 Abidjan"), pages UTM-friendly
5. **Conservation de l'ergonomie mobile** : pas de régression sur l'expérience smartphone actuelle

### Non-objectifs (explicites)
- ❌ Ne **pas** transformer le back-office admin en site public
- ❌ Ne **pas** abandonner l'app mobile au profit d'une PWA
- ❌ Ne **pas** faire de parité stricte mobile ↔ web (chaque plateforme a ses usages)

---

## 🗺️ Options d'architecture — panorama

### Option A — Statu quo via `react-native-web`
Pousser en prod l'app Expo compilée en web.

- ✅ Zéro nouveau code, mutualisation maximale
- ✅ Cohérence visuelle parfaite mobile↔web
- ❌ **Pas de SEO** (SPA RN, rendu client uniquement)
- ❌ UX desktop médiocre (paradigme mobile étiré)
- ❌ Bundle JS volumineux, pas optimal pour acquisition organique

### Option B — Web dédié (Next.js) + Mobile RN — codebases séparées
Nouveau workspace `tda-holding-web` en Next.js 15 + React 19 + Tailwind 4, consommant la même API Sanctum. Mobile RN inchangé.

- ✅ **SEO natif** (SSR / SSG / ISR)
- ✅ UX desktop optimale (patterns web natifs)
- ✅ Stack cohérente avec l'admin Inertia (React 19 + Tailwind 4 déjà maîtrisé par l'équipe)
- ❌ Duplication de logique client (forms, validation, types)
- ❌ 3 frontends à maintenir (admin + web + mobile)

### Option C — Monorepo (Turborepo/Nx) avec packages partagés
Mobile RN + Web Next.js dans un monorepo, avec packages partagés `@tda/types`, `@tda/api-client`, `@tda/utils`.

- ✅ Tous les avantages de B + **DRY** sur la couche data
- ✅ Types TypeScript partagés → moins de drift API/client
- ❌ Complexité monorepo (outillage, CI, configuration)
- ❌ Refactor initial conséquent (migration 2 repos Git existants)
- ❌ Courbe d'apprentissage pour l'équipe

### Option D — Étendre l'admin Inertia au grand public
Ajouter des routes publiques dans `tda-holding-api` + `resources/js/Pages/Public/`.

- ✅ Réutilise l'infra Laravel existante, zéro nouveau workspace
- ✅ Sessions + CSRF déjà en place
- ❌ Inertia = SPA authentifiée par nature → **SEO faible**
- ❌ Mélange public / admin dans un même déploiement (risque sécurité)
- ❌ Pas adapté à une vitrine marketplace

### Tableau comparatif synthétique

| Critère              | A (RNW) | B (Next.js) | C (Monorepo) | D (Inertia) |
|----------------------|---------|-------------|--------------|-------------|
| SEO                  | ❌      | ✅          | ✅           | ❌          |
| UX desktop           | ⚠️      | ✅          | ✅           | ⚠️          |
| Time-to-market       | ✅      | ⚠️          | ❌           | ✅          |
| Maintenance          | ✅      | ⚠️          | ⚠️           | ✅          |
| Mutualisation code   | ✅      | ❌          | ✅           | ⚠️          |
| Flexibilité future   | ❌      | ✅          | ✅           | ❌          |
| Complexité initiale  | ✅      | ⚠️          | ❌           | ✅          |

### Recommandation préliminaire (à valider par ADR)

**Option B (web dédié Next.js)** semble la plus alignée avec l'objectif, avec un **chemin d'upgrade ultérieur vers C** si la duplication devient douloureuse (via extraction progressive d'un package `@tda/types` publié en npm privé).

> ⚠️ Cette recommandation n'engage pas Winston. **C'est à lui de conclure via ADR-012.**

---

## ❓ Questions stratégiques à trancher

Ces questions doivent recevoir une réponse **avant** que le PRD (Olivia) et l'ADR (Winston) ne soient finalisés. Elles orientent directement la décision.

### Pour Olivia (produit)
1. **SEO critique, oui/non ?** (1-10) — Si ≥ 7, l'Option A est exclue.
2. **Personas web** : mêmes que mobile, ou distincts (ex: B2B pros, investisseurs immobiliers) ?
3. **Parité de features** : 100 %, subset MVP, ou features exclusives au web ?
4. **Dashboard client web** : les utilisateurs doivent-ils pouvoir voir leurs bookings/RDV/favoris en web ?
5. **Pages marketing** : landing, blog, pages SEO locales prévues dès le MVP ou plus tard ?
6. **Carte interactive** du catalogue (géolocalisation véhicules/biens) : MVP ou v2 ?

### Pour Winston (technique)
7. **Stratégie d'auth web** : Sanctum SPA (cookies CSRF) ou rester en Bearer token ?
8. **API versioning** : migrer vers `/api/v1/...` avant d'ouvrir un 2e client ?
9. **Médias** : rester sur `storage/app/public` ou migrer S3 + CDN ?
10. **Déploiement web** : Vercel (Next.js natif), VPS, ou même infra que l'API ?
11. **Domaine** : `tdaholding.com` (web) + `api.tdaholding.com` (API) + `admin.tdaholding.com` ?
12. **i18n** : prévu dès le MVP (FR + EN ?) ou post-MVP ?

### Pour l'utilisateur (arbitrage)
13. **Budget / délai** : MVP web en 6-8 semaines ou chantier long 3-4 mois ?
14. **Équipe** : ressources disponibles pour maintenir 3 frontends ?
15. **Priorité business** : SEO & acquisition, ou features internes (B2B), ou les deux ?

---

## 📦 Livrables attendus — plan de cadrage

### 1. 🎯 Olivia produira — `PRD-001-web-platform.md`
- Vision produit du web (distincte du mobile)
- Personas web détaillés
- User flows web (parcours discovery → booking/appointment)
- Liste priorisée des pages (MoSCoW)
- Wireframes conceptuels des 5-6 pages clés (home, catalogue, détail, dashboard client, contact)
- KPIs de succès (trafic SEO, taux de conversion, temps sur site)
- Roadmap web par phases

### 2. 🏛️ Winston produira — `docs/adr/ADR-012-multi-platform-architecture.md`
- Décision parmi Options A/B/C/D (avec justification)
- Diagramme d'architecture cible
- Stratégie d'auth (Sanctum SPA vs token)
- Stratégie CORS et domaines
- Plan de migration `react-native-web` (retrait ou conservation)
- API versioning (`/v1` ou non)
- Stratégie médias (local vs CDN)
- Plan de déploiement (infra, CI/CD)

### 3. 🏃 Bob produira ensuite (une fois PRD + ADR livrés)
- Epics + stories découpées selon l'ADR validé
- Sprint planning pour l'équipe
- Mise à jour de `project-context.md` avec le 3e workspace

### 4. 🎨💻 Amelia exécutera (une fois stories prêtes)
- Setup `tda-holding-web` selon ADR
- Design tokens partagés (palette TDA)
- Implémentation pages MVP selon PRD
- Retrait `react-native-web` du mobile (si décidé par ADR)

---

## ⚠️ Risques identifiés

| # | Risque                                                               | Probabilité | Impact | Mitigation envisagée                                             |
|---|----------------------------------------------------------------------|-------------|--------|------------------------------------------------------------------|
| 1 | Divergence des features mobile↔web (roadmaps désalignées)            | Moyenne     | Élevé  | Olivia maintient une roadmap unifiée ; parité négociée sprint-par-sprint |
| 2 | Surcharge équipe (3 frontends à maintenir)                           | Élevée      | Élevé  | Commencer par MVP web minimal, automatiser tests, prioriser RICE |
| 3 | Drift des types API entre clients (backend change → web/mobile cassent) | Moyenne | Moyen  | Package `@tda/types` (option C) ou OpenAPI + codegen             |
| 4 | Sécurité : CSRF/XSS sur web ≠ token mobile                           | Moyenne     | Élevé  | Sanctum SPA stateful + rotation secrets (Winston)                |
| 5 | SEO déceptif si mal configuré (sitemap, meta, robots)                | Moyenne     | Moyen  | Next.js SSG + checklist SEO (Olivia + Amelia)                    |
| 6 | Coût infra (Vercel + S3 + API) non maîtrisé                          | Faible      | Moyen  | Estimation initiale + plan d'hébergement alternatif              |
| 7 | Migration `react-native-web` → Next.js → perte de features prototypées | Faible    | Faible | Audit avant retrait, liste des features à porter                 |

---

## 📚 Références

### Fichiers à consulter
- `project-context.md` — source de vérité unique (stack, conventions, règles métier)
- `tda-holding-mobile/package.json` — dépendances mobile (présence de `react-native-web`)
- `tda-holding-mobile/src/constants/config.js` — URLs API par plateforme
- `tda-holding-api/routes/api.php` — 45+ endpoints REST existants
- `tda-holding-api/config/sanctum.php` — configuration auth actuelle
- `tda-holding-api/resources/js/Pages/Admin/` — pattern Inertia existant

### ADR existants à prendre en compte
- `docs/adr/ADR-009-booking-workflow.md` — workflow de réservation (ne pas dupliquer la logique)
- `docs/adr/ADR-010-authorization-policies.md` — policies RBAC (à respecter côté web)
- `docs/adr/ADR-011-structural-hygiene.md` — conventions structurelles

### Standards à envisager
- [Next.js 15 Docs](https://nextjs.org/docs) (App Router, Server Components)
- [Laravel Sanctum SPA Authentication](https://laravel.com/docs/sanctum#spa-authentication)
- [Turborepo](https://turbo.build/repo) (si Option C)

---

## ✅ Prochaines actions

| # | Acteur                 | Action                                                            | Échéance |
|---|------------------------|-------------------------------------------------------------------|----------|
| 1 | **Utilisateur**        | Répondre aux questions stratégiques (13-15 minimum)               | Immédiat |
| 2 | **Olivia**             | Produire `PRD-001-web-platform.md` dans `.bmad/prds/`             | Sprint 1 |
| 3 | **Winston**            | Produire `ADR-012-multi-platform-architecture.md` dans `docs/adr/`| Sprint 1 |
| 4 | **Bob**                | Consolider, découper en epics/stories dans `.bmad/stories/`       | Sprint 2 |
| 5 | **Amelia**             | Commencer l'implémentation selon stories prioritaires             | Sprint 3 |

---

## 🏃 Note de Bob (SM)

> Je recommande de **ne pas coder une ligne** tant que le PRD (Olivia) et l'ADR (Winston) ne sont pas validés par l'utilisateur. Cette décision est **structurante pour 2-3 ans** et coûte cher à défaire. Le temps investi en cadrage ici est largement rentabilisé en évitant un refactor majeur dans 6 mois.
>
> Ma préférence personnelle : **Option B** avec une veille sur C si la duplication devient pénible. Mais la décision revient à Winston après validation du cadrage produit par Olivia.

---

*Brief ouvert le 2026-04-19 par Bob. Dernière mise à jour : 2026-04-19.*
