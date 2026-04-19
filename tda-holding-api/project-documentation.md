# TDA Holding — Documentation Projet

> **Document produit** — de la conception à l'état actuel
> Auteur : 🎯 **Olivia** (Chef de Projet)
> Dernière mise à jour : 2026-04-18
> Complément de `project-context.md` (référentiel technique). Ce document raconte le **pourquoi**, le **quoi** et le **quand** ; `project-context.md` raconte le **comment technique**.

---

## Sommaire

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Genèse & vision](#2-genèse--vision)
3. [Personas & problèmes utilisateurs](#3-personas--problèmes-utilisateurs)
4. [Périmètre fonctionnel](#4-périmètre-fonctionnel)
5. [Décisions produit structurantes](#5-décisions-produit-structurantes)
6. [Chronologie des phases](#6-chronologie-des-phases)
7. [Catalogue des fonctionnalités livrées](#7-catalogue-des-fonctionnalités-livrées)
8. [Architecture fonctionnelle](#8-architecture-fonctionnelle)
9. [Parcours utilisateurs clés](#9-parcours-utilisateurs-clés)
10. [Règles métier canoniques](#10-règles-métier-canoniques)
11. [Méthodologie & organisation](#11-méthodologie--organisation)
12. [KPIs & critères de succès](#12-kpis--critères-de-succès)
13. [Risques, dettes & dépendances](#13-risques-dettes--dépendances)
14. [Roadmap & prochaines étapes](#14-roadmap--prochaines-étapes)
15. [Leçons apprises](#15-leçons-apprises)

---

## 1. Résumé exécutif

**TDA Holding** est une **plateforme multiservices africaine** couvrant deux verticales complémentaires : **Mobilité** (véhicules) et **Immobilier** (biens). Elle se destine à un marché B2C où le **paiement cash à l'arrivée** reste dominant, tout en préparant les rails techniques pour du **mobile money** futur.

L'application se matérialise en trois briques :

- **Backend API Laravel 13** (REST + Sanctum) — source de vérité métier
- **Back-office admin Inertia/React 18** — gestion opérationnelle interne
- **App mobile Expo SDK 54 / React Native 0.81** — canal client principal

**État au 18 avril 2026** : les trois briques sont **livrées et intégrées**. Le produit est **en phase 4** (tests & déploiement), avant l'ouverture au public et les évolutions monétisation (mobile money) et multi-vendeurs.

---

## 2. Genèse & vision

### 2.1 L'idée initiale

TDA Holding est née du constat qu'en Afrique francophone, **deux besoins essentiels** — se déplacer (louer ou acheter un véhicule) et se loger (louer ou acheter un bien) — sont fragmentés entre :

- des **annonces informelles** (WhatsApp, Facebook, bouche-à-oreille)
- des **agents locaux non numérisés**
- des **solutions internationales** qui ne correspondent pas aux pratiques locales (paiement en ligne obligatoire, pas de prise de rendez-vous physique, etc.)

**Problème résolu** : offrir une plateforme **unique, localisée et premium** qui numérise l'ensemble du parcours tout en respectant les usages africains (cash, contact direct, confiance par le relationnel).

### 2.2 Vision produit

> *« La plateforme de confiance africaine pour se déplacer et se loger, premium mais accessible, digitale mais humaine. »*

**Piliers** :

1. **Confiance** — validation admin systématique, transactions tracées, chauffeurs identifiés
2. **Simplicité** — inscription libre client, login email **ou** téléphone, UI épurée
3. **Flexibilité locale** — cash par défaut, contact WhatsApp, rendez-vous physiques
4. **Identité africaine forte** — branding vert/or, typographie chaleureuse, ton premium

### 2.3 Modèle d'affaires

- **B2C** multi-agents à terme (un seul admin en phase de lancement)
- Commissions sur bookings + ventes (monétisation future)
- **Paiement manuel** (cash à l'arrivée), validé par l'admin — rails prêts pour mobile money

---

## 3. Personas & problèmes utilisateurs

### 3.1 Personas primaires

| Persona        | Profil                                                          | Douleurs principales                                                                         | Attentes clés                                                  |
|----------------|-----------------------------------------------------------------|----------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| **Client**     | Particulier 25-55 ans, urbain, smartphone, revenus moyens+      | Manque de visibilité sur l'offre, méfiance (arnaques), difficulté à joindre les propriétaires | Catalogue clair, photos, contact direct, paiement sur place    |
| **Super admin**| Dirigeant TDA Holding                                           | Pilotage global, validation manuelle, visibilité financière                                  | Dashboard unifié, CRUD complet, export, KPIs                   |
| **Agent**      | Collaborateur interne qui traite les demandes                   | Outil de saisie rapide, vue claire des réservations à traiter                                | Filtres, recherche, workflows de statuts explicites            |
| **Vendor**     | *(planifié)* Partenaire externe qui publie ses propres annonces | Autonomie, visibilité de ses propres listings                                                 | Espace dédié, modération légère, reporting                     |

### 3.2 Personas secondaires

- **Chauffeur** — ressource gérée par l'admin, **sans compte utilisateur** (identité connue, CV, disponibilités)
- **Propriétaire offline** — contacté hors plateforme, ses biens sont publiés par un agent

### 3.3 Parcours types

- **Client** : découvre l'app → explore catalogue → met en favoris → réserve OU prend rendez-vous → est contacté par l'admin → paie cash à la remise des clés → note
- **Admin** : reçoit une demande → vérifie → confirme OU rejette → suit l'exécution → encaisse → clôture → archive

---

## 4. Périmètre fonctionnel

### 4.1 Inclus (périmètre livré)

**Catalogue**
- Véhicules (rent / sale / both) avec filtres multi-critères
- Biens immobiliers (villa, appart, maison, duplex, studio, terrain, local commercial)
- Catégorisation, médias multiples (photos), favoris

**Transactions**
- Réservation (booking) pour la location
- Rendez-vous (appointment) pour la vente ou vente+location
- Transaction liée à chaque booking (paiement cash)

**Ressources**
- Gestion des chauffeurs (CRUD admin)
- Assignation chauffeur ↔ booking véhicule

**Utilisateurs & droits**
- Inscription libre client, login email ou téléphone
- RBAC 4 rôles : `super_admin`, `agent`, `vendor`, `client`
- Policies Laravel pour chaque ressource sensible

**Communication**
- Notifications (base de données + push prête pour Expo)
- Intégration WhatsApp (deeplink depuis détail véhicule en vente)

**Back-office admin**
- Dashboard avec stats temps réel
- CRUD complet de toutes les entités
- Workflows statuts (confirm, reject, start, complete, cancel)
- Upload médias et gestion de l'image principale

### 4.2 Exclu (volontairement hors périmètre v1)

- Paiement en ligne (Wave, Orange Money, Stripe)
- Espace vendor self-service
- Messagerie in-app client ↔ admin
- Avis / notations clients
- Programme de fidélité
- Application tablette dédiée admin

### 4.3 À faire (prochaines phases)

Voir section [Roadmap](#14-roadmap--prochaines-étapes).

---

## 5. Décisions produit structurantes

Ces décisions ont été prises en concertation Olivia ↔ Winston et formalisent l'ADN du produit.

### D1 — Visibilité permanente des items réservés
Un véhicule ou bien réservé (`is_available = false`) **reste visible** au catalogue, avec un **badge « Réservé »** et un CTA désactivé. Raison : préserver la preuve sociale ("ce produit est demandé") et éviter l'effet catalogue vide.

### D2 — UI conditionnelle selon `offer_type`
- `rent` → CTA **« Réserver maintenant »** (parcours booking standard)
- `sale` ou `both` → CTAs **« Rendez-vous »** + **« WhatsApp »** (parcours appointment)

Raison : le parcours d'achat nécessite un contact humain (visite, négociation), le parcours location peut être automatisé.

### D3 — Login unique email OU téléphone
Le champ `login` de l'API accepte indifféremment un email ou un numéro de téléphone. Raison : en Afrique, le téléphone est l'identifiant prioritaire, souvent mémorisé avant l'email.

### D4 — Paiement cash par défaut
`payment_method = cash` par défaut. La transaction est créée à la confirmation du booking et validée manuellement par l'admin à l'encaissement. Les champs pour mobile money existent mais ne sont pas activés.

### D5 — Chauffeurs sans compte utilisateur
Les chauffeurs sont des **ressources** gérées par l'admin, pas des utilisateurs. Raison : simplification de la phase 1, le chauffeur n'a pas besoin d'interface. Évolution possible en phase 5.

### D6 — Soft deletes partout
Audit trail activé sur toutes les entités métier. Raison : traçabilité légale et récupération d'erreurs admin.

### D7 — Polymorphisme Booking / Favorite / Media
Ces trois entités pointent vers `Vehicle` OU `Property` via `morphTo`. Raison : éviter la duplication de logique, unifier l'expérience client entre les deux verticales.

### D8 — Deux dépôts Git séparés
Backend+Admin d'un côté (`tda-holding-api`), mobile de l'autre (`tda-holding-mobile`). Raison : cycles de release différents (mobile = store review), équipes potentiellement distinctes à terme.

---

## 6. Chronologie des phases

### 📅 Phase 0 — Conception (mars 2026)
- Brief initial, personas, parcours haut niveau
- Choix de stack (Laravel + Inertia + Expo)
- Définition des entités et du modèle de données
- Charte graphique (vert #1B5E20 / or #DAA520)

### ✅ Phase 1 — Backend API Laravel (mars — début avril 2026)
- Mise en place Laravel 13, Sanctum, Breeze
- **10 modèles Eloquent** avec relations et scopes
- **45+ routes API REST** (publiques / authentifiées / admin)
- Policies RBAC pour toutes les ressources
- Seeders (catégories, rôles, admin par défaut)
- PostgreSQL en prod, SQLite en dev

**Livraison** : API complète testable via Postman, admin créé par seeder.

### ✅ Phase 2 — Back-office admin Inertia/React (avril 2026)
- SPA Inertia.js 2 + React 18 + Tailwind 4
- Dashboard avec statistiques et activité récente
- CRUD complet : catégories, véhicules, biens, chauffeurs, bookings, transactions, notifications
- Upload multi-médias avec gestion de l'image principale
- Workflows statuts (confirm / reject / start / complete)
- Layout responsive avec sidebar, palette TDA

**Livraison** : admin autonome pouvant gérer 100% des opérations sans toucher la BDD.

### ✅ Phase 3 — App mobile Expo (avril 2026)
- Setup Expo SDK 54, React Navigation 7 (stack + tabs)
- **14+ écrans** : Onboarding, Auth, Home, Catalogues, Détails, Favoris, Booking, Rendez-vous, Notifications, Profil
- 5 onglets principaux : Accueil, Véhicules, Immobilier, Réservations, Profil
- AuthContext + AsyncStorage pour la persistance
- Axios avec intercepteurs (token Sanctum, erreurs)
- Compatibilité web via `react-native-web`

**Livraison** : app testable sur Expo Go (iOS/Android) et web.

### ✅ Phase 3 bis — Système de rendez-vous (mi-avril 2026)
- Ajout de l'entité `Appointment` (backend + admin + mobile)
- Logique conditionnelle `offer_type` sur la fiche véhicule
- Flux complet : formulaire mobile → validation admin → statuts
- Intégration CTA **WhatsApp** en parallèle

### ✅ Phase 3 ter — Visibilité des items réservés (mi-avril 2026)
- Ajout du booléen `is_available` sur véhicules et biens
- Badge **« Réservé »** + CTA désactivé côté mobile
- Gestion admin de la disponibilité dans les écrans CRUD

### 🔄 Phase 4 — Tests & déploiement (en cours)
- Tests d'intégration backend (PHPUnit)
- Tests E2E parcours critiques
- Préparation build Android (EAS Build)
- Déploiement API (VPS / hébergeur PHP)
- Nom de domaine, HTTPS, CI/CD basique

### 🟡 Phase 5 — Paiement mobile money (planifié)
Wave, Orange Money, MTN Momo. Pré-requis déjà en place côté modèle `Transaction`.

### 🟡 Phase 6 — Multi-agents / Multi-vendeurs (planifié)
Espace vendor self-service, commissions, modération légère.

### 🟡 Phase 7 — Notifications push (planifié)
Expo Push Notifications + back-office d'envoi de messages.

---

## 7. Catalogue des fonctionnalités livrées

### 7.1 Authentification & compte

| Feature                                 | Backend | Admin | Mobile |
|-----------------------------------------|:-------:|:-----:|:------:|
| Inscription client (nom, email, tel)    | ✅      | —     | ✅     |
| Login email **ou** téléphone            | ✅      | ✅    | ✅     |
| Sanctum token (Bearer)                  | ✅      | —     | ✅     |
| Logout (revoke token)                   | ✅      | —     | ✅     |
| Profil (voir / modifier)                | ✅      | ✅    | ✅     |
| Changement mot de passe                 | ✅      | ✅    | ✅     |

### 7.2 Catalogue véhicules

- Filtres : catégorie, offer_type, status, ville, marque, recherche texte
- Tri par prix, par date
- Pagination
- Affichage photos multiples, infos détaillées (marque, modèle, année, clim, transmission, etc.)
- Favoris (toggle)
- Badge « Réservé » si `is_available = false`

### 7.3 Catalogue immobilier

- Filtres similaires aux véhicules + surface, chambres, salles de bain
- 7 types de biens : villa, appartement, maison, duplex, studio, terrain, local commercial
- Médias, favoris, badge « Réservé »

### 7.4 Réservations (bookings)

- Création depuis le mobile pour les items `rent` ou `both`
- Choix des dates, durée calculée automatiquement
- Statuts : `pending` → `confirmed` → `in_progress` → `completed` (+ `cancelled`, `rejected`)
- Admin peut : confirmer, rejeter (avec raison), démarrer, terminer, annuler
- Client peut : annuler si `pending`
- Liste + détail côté client ; liste globale + détail côté admin

### 7.5 Rendez-vous (appointments)

- Création depuis mobile pour items `sale` ou `both`
- Champs : date, créneau préféré, lieu, téléphone, email, notes
- Statuts : `pending` → `confirmed` → `completed` (+ `cancelled`)
- Notes internes admin séparées des notes client
- Admin peut changer statut + ajouter notes internes
- Client peut annuler si `pending`

### 7.6 Transactions

- Créée automatiquement à la confirmation d'un booking
- `payment_method = cash` par défaut
- Statuts : `pending` → `confirmed` → `completed`
- Admin peut confirmer / compléter manuellement
- Champs prêts pour mobile money

### 7.7 Favoris

- Polymorphique (véhicule OU bien)
- Toggle depuis le détail
- Écran dédié listant les deux types ensemble

### 7.8 Chauffeurs

- CRUD admin uniquement
- Liste publique côté mobile (visible pour info)
- Assignation à un booking véhicule
- Statut disponibilité

### 7.9 Notifications

- Modèle persistant en base
- Écran mobile listant les notifications
- Marquer comme lu, tout marquer comme lu
- Types : `BookingConfirmed`, `BookingCancelled`, `BookingCompleted`, `BookingRejected`, `AppointmentConfirmed`, etc.

### 7.10 Dashboard admin

- Stats : bookings par statut, revenus, utilisateurs, items disponibles
- Recent bookings, recent transactions
- Accès rapide aux actions en attente

---

## 8. Architecture fonctionnelle

### 8.1 Vue macro

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENTS FINAUX                          │
│   📱 App mobile (iOS/Android/Web)                            │
└────────────────────────────┬─────────────────────────────────┘
                             │ REST + Sanctum
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND LARAVEL (API)                      │
│   • 10 modèles • 45+ routes • RBAC • Policies • Sanctum      │
│                                                              │
│   ┌─────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│   │ /api/public │  │ /api/auth  │  │ /api/admin (role)    │  │
│   └─────────────┘  └────────────┘  └──────────────────────┘  │
└──────────────┬─────────────────────────────┬─────────────────┘
               │                             │ Inertia (session)
               ▼                             ▼
     ┌─────────────────┐         ┌──────────────────────────┐
     │   PostgreSQL    │         │  BACK-OFFICE ADMIN        │
     │  (SQLite dev)   │         │  (Inertia + React + TW)   │
     └─────────────────┘         └──────────────────────────┘
```

### 8.2 Entités principales (modèle polymorphique)

```
User ──┬── owns ────── Vehicle ─────┐
       │                            │
       ├── owns ────── Property ────┤
       │                            │
       ├── books ──────────────────►│ (polymorphique : bookable)
       ├── favorites ──────────────►│ (polymorphique : favorable)
       └── appointments ────► Vehicle (vente/sale+rent)

Booking ── has many ── Transaction
Media   ── morphTo ── (Vehicle | Property)
Driver  ── assigned to ── Booking (véhicule)
```

### 8.3 Flux de données critiques

**Création d'une réservation**
```
Mobile → POST /api/bookings
     → Validation (dates, disponibilité, offer_type=rent)
     → Création Booking (pending) + Transaction (pending)
     → Notification admin + client
     → Admin confirme depuis back-office
     → Mise à jour statut + notification client
     → Client se présente → admin encaisse → marque completed
```

**Création d'un rendez-vous**
```
Mobile → POST /api/appointments (offer_type=sale|both)
     → Validation (date future, vehicle_id)
     → Création Appointment (pending)
     → Notification admin
     → Admin prend contact → confirme + notes internes
     → Rendez-vous physique → admin marque completed
```

---

## 9. Parcours utilisateurs clés

### 9.1 Parcours client — Location d'un véhicule

```
[Onboarding]
    ▼
[Login / Register]
    ▼
[Home — véhicules en avant]
    ▼
[Liste véhicules + filtres]
    ▼
[Détail véhicule — offer_type=rent]
    │
    ├─► [♡ Favori]
    │
    └─► [Réserver maintenant]
           ▼
        [Formulaire booking — dates, chauffeur ?]
           ▼
        [Confirmation → statut pending]
           ▼
        [Mes réservations → attente confirmation admin]
           ▼
        [Notification reçue → Confirmé]
           ▼
        [Jour J : remise du véhicule, paiement cash]
           ▼
        [Statut completed → historique]
```

### 9.2 Parcours client — Achat d'un véhicule

```
[Détail véhicule — offer_type=sale ou both]
    │
    ├─► [WhatsApp] → deeplink direct vers admin
    │
    └─► [Prendre rendez-vous]
           ▼
        [Formulaire RDV — date, créneau, lieu, tel, notes]
           ▼
        [Confirmation → statut pending]
           ▼
        [Mes rendez-vous]
           ▼
        [Admin appelle + confirme]
           ▼
        [RDV physique → essai + négociation]
           ▼
        [Statut completed]
```

### 9.3 Parcours admin — Journée type

```
[Login /admin]
    ▼
[Dashboard — stats du jour, demandes en attente]
    ▼
[Bookings en attente] ──► Confirmer OU Rejeter (avec raison)
    ▼
[Rendez-vous en attente] ──► Appeler client → Confirmer + notes
    ▼
[Transactions à encaisser] ──► Marquer completed à réception du cash
    ▼
[Ajouter nouveaux items] ──► CRUD véhicules / biens / chauffeurs
    ▼
[Gérer médias] ──► Upload, image principale
```

---

## 10. Règles métier canoniques

> Ces règles font **foi** et doivent être respectées par toute nouvelle feature.

1. **Un item réservé reste visible** — badge "Réservé" + CTA désactivé (jamais masqué).
2. **UI conditionnelle selon `offer_type`** — `rent` → Réserver / `sale`·`both` → RDV + WhatsApp.
3. **Login mobile = email OU téléphone** dans un seul champ `login`.
4. **Paiement cash par défaut** — transaction créée à la confirmation, validée à l'encaissement.
5. **Chauffeurs = ressources admin**, pas de compte utilisateur.
6. **Soft deletes partout** — audit trail obligatoire.
7. **Rôles RBAC (4)** — `super_admin`, `agent`, `vendor`, `client` ; penser aux 4 dès la conception.
8. **Polymorphisme** — `Booking`, `Favorite`, `Media` pointent vers `Vehicle` OU `Property`.
9. **Branding africain** — vert foncé #1B5E20 + or #DAA520, chaleureux, premium.
10. **Cohérence mobile ↔ admin** — mêmes terminologies, mêmes statuts, mêmes couleurs d'état.

### Statuts canoniques

| Entité        | Statuts                                                                      |
|---------------|------------------------------------------------------------------------------|
| Booking       | `pending` → `confirmed` → `in_progress` → `completed` · `cancelled` · `rejected` |
| Transaction   | `pending` → `confirmed` → `completed`                                        |
| Appointment   | `pending` → `confirmed` → `completed` · `cancelled`                          |
| Vehicle/Prop  | `available` · `rented` · `sold` · `maintenance` (+ bool `is_available`)      |
| Offer type    | `rent` · `sale` · `both`                                                     |

---

## 11. Méthodologie & organisation

### 11.1 Méthode BMAD (v3 — 4 rôles optimisés)

Le projet est piloté selon la méthodologie **BMAD** (Breakthrough Method for Agile AI-Driven Development) adaptée en **équipe optimisée à 4 rôles** :

| Agent              | Nom       | Rôle                                                       |
|--------------------|-----------|------------------------------------------------------------|
| 🏃 Scrum Master    | Bob       | Pilote : stories, sprints, DoD, QA Gate                    |
| 🎯 Chef de Projet  | **Olivia**| Vision, conception, brief/PRD, parcours, priorisation      |
| 🏛️ Architect       | Winston   | Structure technique, sécurité, ADR, design BDD et API      |
| 🎨💻 Dev-Designer   | Amelia    | Implémentation code (back + admin + mobile) + UI/UX fine   |

### 11.2 Flux de travail

```
Demande → 🎯 Olivia (vision/concept)
        → 🏃 Bob (stories/sprint)
        → 🏛️ Winston (ADR si impact archi)
        → 🎨💻 Amelia (exécution)
        → 🏃 Bob (QA Gate + DoD)
```

### 11.3 Outils & conventions

- **Source de vérité technique** : `project-context.md`
- **Source de vérité produit** : ce document (`project-documentation.md`)
- **Profils agents** : `.bmad/agents/*.md`
- **Commits** : messages impératifs français acceptés
- **Code** : anglais ; UI / docs : français
- **Lint** : Laravel Pint (backend), Prettier + ESLint (mobile/admin)

---

## 12. KPIs & critères de succès

### 12.1 KPIs produit (phase lancement)

| KPI                                        | Cible 3 mois | Cible 6 mois |
|--------------------------------------------|--------------|--------------|
| Utilisateurs inscrits                      | 500          | 2 000        |
| Véhicules actifs au catalogue              | 30           | 100          |
| Biens immobiliers actifs                   | 20           | 80           |
| Bookings confirmés / mois                  | 20           | 100          |
| Rendez-vous confirmés / mois               | 15           | 60           |
| Taux de confirmation booking (pending→OK)  | ≥ 70%        | ≥ 80%        |
| Temps moyen réponse admin (RDV)            | < 24h        | < 4h         |
| Rétention J30                              | ≥ 25%        | ≥ 35%        |

### 12.2 Critères de succès qualitatifs

- Zéro confusion utilisateur entre location et achat grâce à l'UI conditionnelle
- Parcours inscription → première action < 2 minutes
- Admin peut traiter 100% des opérations sans accès BDD direct
- 0 incident de sécurité (token, policies) en phase pilote

---

## 13. Risques, dettes & dépendances

### 13.1 Risques produit

| Risque                                        | Impact | Mitigation                                               |
|-----------------------------------------------|--------|----------------------------------------------------------|
| Adoption mobile lente (smartphones bas-gamme) | Haut   | Version web fonctionnelle via `react-native-web`         |
| Confiance client (nouveaux users méfiants)    | Moyen  | Badges, photos qualité, contact WhatsApp direct          |
| Charge admin manuelle (validation)            | Moyen  | Dashboard prioritaire, notifications, phase 5 automatise |
| Concurrence locale qui copie                  | Faible | Branding fort + verrouillage agents/vendeurs (phase 6)   |

### 13.2 Dettes techniques connues

- Pas de tests automatisés exhaustifs (phase 4)
- Cache en DB driver (pas de Redis) — à migrer avant montée en charge
- Queue en DB driver — idem
- Push notifications Expo prêtes mais non branchées
- Certaines images non optimisées côté mobile (à compresser)

### 13.3 Dépendances externes

- **Laravel 13** (LTS) — stable
- **Expo SDK 54** — nécessite upgrade annuel
- **React Native 0.81** — stable
- **PostgreSQL** prod — DBA / hébergeur à sélectionner
- **WhatsApp Business** — deeplink fonctionne mais pas d'API officielle en phase 1

---

## 14. Roadmap & prochaines étapes

### 14.1 Phases livrées

| # | Phase                                         | Statut |
|---|-----------------------------------------------|--------|
| 1 | Backend API Laravel                           | ✅     |
| 2 | Back-office admin Inertia/React               | ✅     |
| 3 | App mobile React Native/Expo                  | ✅     |
| 3b| Système de rendez-vous                        | ✅     |
| 3c| Visibilité `is_available`                     | ✅     |

### 14.2 Phase en cours

| # | Phase                         | Statut | Livrables attendus                              |
|---|-------------------------------|--------|-------------------------------------------------|
| 4 | Tests & déploiement           | 🔄     | Tests E2E, CI/CD, build Android, déploiement API, domaine, HTTPS |

### 14.3 Phases planifiées

| # | Phase                                         | Priorité | Échéance cible |
|---|-----------------------------------------------|----------|----------------|
| 5 | Paiement Mobile Money (Wave, Orange, MTN)     | P1       | T3 2026        |
| 6 | Multi-agents / Multi-vendeurs self-service    | P1       | T4 2026        |
| 7 | Notifications push Expo                       | P2       | T3 2026        |
| 8 | Messagerie in-app client ↔ admin              | P2       | T4 2026        |
| 9 | Avis & notations clients                      | P3       | 2027           |
| 10| Programme de fidélité                         | P3       | 2027           |

### 14.4 Priorités immédiates (4 prochaines semaines)

1. **Tests critiques** — auth, booking, appointment (parcours happy path)
2. **Build Android signé** via EAS Build et test sur device réel
3. **Déploiement API** sur serveur de staging
4. **Revue design system mobile** — cohérence finale couleurs/typos
5. **Documentation utilisateur admin** — courte vidéo ou guide PDF

---

## 15. Leçons apprises

Bilan des trois phases livrées, à retenir pour la suite.

### ✅ Ce qui a bien marché

- **Architecture polymorphique** (`Booking`, `Favorite`, `Media`) a divisé par 2 le code côté client — décision payante
- **Logique conditionnelle `offer_type`** a levé la confusion UX dès les premiers tests
- **Login email OU téléphone** adopté immédiatement par les testeurs africains
- **Seeders + admin par défaut** ont permis de démarrer les démos en < 5 minutes
- **Méthodologie BMAD 4 rôles** a évité les zones grises entre conception et exécution

### ⚠️ Points d'attention

- **Expo Web** demande des adaptations AsyncStorage (utiliser `getItem`/`setItem` et non `multiGet`)
- **URL API par plateforme** (`10.0.2.2` Android, IP locale iOS, `127.0.0.1` web) doit être documentée visiblement
- **Middleware `role:`** a nécessité plusieurs itérations — documenter les rôles acceptés dans chaque route
- **Soft deletes** doivent être vérifiés dans les requêtes de stats admin (sinon compteurs faussés)
- Le champ `is_available` a dû être ajouté a posteriori — **prévoir les booléens de gestion dès la conception** est une règle désormais acquise

### 💡 À retenir pour la suite

- **Toujours prototyper en ASCII wireframe** avant d'envoyer à Amelia (diminue les allers-retours)
- **Ouvrir un ADR dès qu'un choix impacte 2+ briques** (backend + mobile)
- **Décisions produit = écrites dans ce document** avant implémentation
- **Tests E2E parcours critiques** dès la phase suivante, pas en fin de cycle

---

## Annexes

### A. Liens vers documents complémentaires

- `project-context.md` — référentiel technique (stack, API, conventions)
- `.bmad/agents/chef-projet.md` — profil Olivia
- `.bmad/agents/architect.md` — profil Winston
- `.bmad/agents/dev-designer.md` — profil Amelia
- `.bmad/agents/sm.md` — profil Bob
- `.bmad/agents/README.md` — matrice BMAD

### B. Identifiants par défaut (dev)

- **Admin** : `admin@tda-holding.com` / `password`

### C. Commandes utiles

```bash
# Backend
composer dev                                # serveur + queue + vite + logs
php artisan serve --host=0.0.0.0 --port=8000  # accès mobile
php artisan migrate:fresh --seed             # reset complet
npm run build                                # build admin

# Mobile
npx expo start            # Expo Go
npx expo start --web      # navigateur
npx expo start --android  # émulateur
```

---

*« Ce document raconte l'histoire. `project-context.md` dit comment c'est fait. Les deux sont indissociables. »* — Olivia 🎯
