---
id: PRD-001
title: Plateforme unifiée TDA Holding (web + PWA) — MVP
author: Olivia (Chef de Projet)
status: Accepté (amendé Option E)
created: 2026-04-19
updated: 2026-04-19
audience: Bob (Scrum Master), Winston (Architect), Amelia (Dev-Designer)
related:
  - .bmad/briefs/BRIEF-001-multi-platform-evolution.md
  - docs/adr/ADR-012-multi-platform-architecture.md
  - project-context.md
  - project-documentation.md
decisions-inputs:
  - Q1 (SEO): pas de prod, local uniquement → non bloquant au MVP, archi doit le supporter
  - Q2 (Personas): identiques au mobile
  - Q3 (Parité): subset MVP (catalogue + détail + booking/RDV + auth + favoris + dashboard client)
  - Q4 (Dashboard client web): OUI dès le MVP
  - Q5 (Marketing/SEO local): reporté post-MVP
  - Q6 (Carte interactive): reportée (v2 ou plus tard)
  - Q7 (Domaine): tranché par ADR-012 (tdaholding.com + api.tdaholding.com + admin.tdaholding.com)
  - Q-Stores (Play/App Store): non requis au lancement → Option E retenue
architecture-decision:
  - Option E (Next.js 15 unifié + PWA) retenue via ADR-012
  - Retrait de l'app mobile React Native — remplacée par une PWA installable
  - Un seul frontend public (web desktop + web mobile + PWA installée = même codebase)
next-deliverables:
  - Epics/Stories (Bob) après validation finale par l'utilisateur
  - Plan de sunset tda-holding-mobile (Bob)
---

# PRD-001 — Plateforme unifiée TDA Holding (web + PWA)

## 1. Résumé exécutif

TDA Holding se dote d'une **application unifiée web + PWA**, accessible depuis un navigateur et **installable** sur smartphone comme application à part entière. Cette plateforme **remplace** l'application React Native initialement prévue : un seul codebase Next.js sert **à la fois** le site web desktop (SEO-ready) et l'app mobile (PWA installable avec icône, plein écran, offline, notifications push).

Le back-office admin (Inertia/React) reste **séparé et inchangé**, dédié aux `super_admin` et `agent`. L'API Laravel reste **la source de vérité** et n'est pas impactée structurellement.

**Le projet n'étant pas en production**, le MVP est livré en une seule fois avec un périmètre **volontairement resserré**. Les fonctionnalités différenciantes (carte interactive, SEO local, blog, présence Play Store / App Store) sont **explicitement reportées en v2+**.

### En une phrase
> *« Une expérience premium accessible partout : desktop pour la recherche approfondie, PWA installable pour l'usage mobile quotidien, un seul codebase, zéro divergence. »*

---

## 2. Contexte & objectifs

### 2.1 Contexte
Voir `BRIEF-001` et `ADR-012` pour le contexte complet. L'essentiel :
- API Laravel 13 + Sanctum livrée — source de vérité backend commune (**inchangée**)
- Back-office Inertia/React livré — réservé à `super_admin` / `agent`, **pas public** (**inchangé**)
- App mobile Expo SDK 54 livrée (Phase 3) mais **remplacée** par la PWA Next.js — les décisions produit et écrans sont transposés, l'enveloppe technique change
- Aucune des briques n'est encore en production → la bascule Option E n'impacte aucun utilisateur final

### 2.2 Objectifs métier (MVP)

| # | Objectif                                                                             | Type       |
|---|--------------------------------------------------------------------------------------|------------|
| O1| Offrir un canal desktop/laptop pour la recherche approfondie et la comparaison       | Primaire   |
| O2| Permettre à un client d'aller jusqu'à la réservation/RDV en **autonomie**, web ou PWA | Primaire   |
| O3| Permettre de **suivre** ses bookings/RDV depuis n'importe quel appareil             | Primaire   |
| O4| Livrer une **PWA installable** qui se substitue à l'app mobile RN (icône, plein écran, push) | Primaire   |
| O5| Préparer techniquement les bases SEO (sans investir en contenu au MVP)              | Secondaire |
| O6| **Zéro divergence** structurelle entre desktop et mobile (un seul codebase)          | Primaire   |

### 2.3 Non-objectifs (MVP)

- ❌ Pages marketing SEO locales (`/location-voiture-abidjan`, etc.)
- ❌ Blog / contenus éditoriaux
- ❌ Carte interactive du catalogue
- ❌ Comparateur avancé, tableaux multi-items
- ❌ Paiement en ligne / mobile money (phase 5 commune)
- ❌ Espace vendor/agent self-service (phase 6)
- ❌ i18n multi-langue (FR uniquement au MVP ; archi `next-intl` compatible)
- ❌ Présence Play Store / App Store (réversible via TWA/Capacitor en V2+)

---

## 3. Personas

**Décision** : personas identiques à ceux du `project-documentation.md` §3 — la plateforme unifiée adapte son **contexte d'usage** (desktop vs mobile) selon l'appareil, mais sert les mêmes personnes.

### 3.1 Personas primaires

| Persona        | Contexte d'usage spécifique                                                                                                                                 |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Client desktop** | Recherche prolongée bureau/maison ; comparaison de plusieurs biens/véhicules ; préparation avant déplacement ; plus grand écran = meilleure perception des photos |
| **Client mobile** | Installe la PWA depuis son navigateur ; icône sur écran d'accueil ; usage type "app native" : consultations courtes, RDV, notifications push                |
| **Super admin**| **N'utilise pas** le site public (back-office séparé sur `admin.tdaholding.com`) — peut s'y connecter pour tester                                            |
| **Agent**      | Idem super_admin — support opérationnel                                                                                                                     |
| **Vendor**     | Pas d'espace dédié au MVP — visite le site public pour voir le rendu final de ses annonces                                                                  |

### 3.2 Moments d'usage typiques (client)

- **Lundi midi, bureau (desktop)** : un cadre recherche un 4×4 pour un déplacement familial le week-end suivant
- **Soir, salon (tablet/laptop)** : un couple compare 3 villas pour leur future location
- **Transport en commun (PWA installée)** : un utilisateur rouvre son app TDA depuis son écran d'accueil, consulte ses réservations en cours hors ligne
- **Notification push** : à J-1 d'un RDV, le client reçoit un rappel directement sur son téléphone (iOS 16.4+ / Android)
- **Partage WhatsApp** : un utilisateur envoie l'URL d'un véhicule à sa femme — l'ouverture sur le téléphone du destinataire fonctionne sans installation préalable

### 3.3 Douleurs utilisateur adressées

| Douleur                                                             | Réponse unifiée                                                          |
|---------------------------------------------------------------------|---------------------------------------------------------------------------|
| "Le mobile c'est bien mais je veux comparer à l'aise"               | Desktop avec layout 2-3 colonnes, plus d'items visibles                  |
| "Je veux taper au clavier pour chercher vite"                        | Champ recherche proéminent + filtres clavier-friendly                    |
| "Je réserve sur desktop mais je veux retrouver sur mobile"           | Même compte, même session → bookings visibles partout (même codebase)    |
| "Je veux partager un lien à ma femme"                                | URL propre par item (`tdaholding.com/vehicules/{id}-{slug}`)             |
| "Je ne veux pas télécharger 50 Mo depuis le Play Store"              | PWA : installation en 1 tap, empreinte disque minimale                   |
| "Je ne veux pas d'app qui oublie de se mettre à jour"                | PWA : mise à jour silencieuse automatique, jamais de version obsolète    |

---

## 4. User flows

### 4.1 Flow découverte → réservation (véhicule en location)

```
[Home tdaholding.com]
    │ (CTA "Explorer les véhicules" ou menu)
    ▼
[/vehicules — catalogue]
    │ (filtres : catégorie, ville, prix, offer_type)
    │ (clic sur une carte véhicule)
    ▼
[/vehicules/{slug} — détail]
    │
    ├─ si offer_type = rent
    │     (bouton "Réserver maintenant")
    │     ▼
    │  [/vehicules/{slug}/reserver]
    │     │ (formulaire : dates, chauffeur ?)
    │     │ (si non connecté : modal login/register inline)
    │     ▼
    │  [POST /api/bookings → pending]
    │     ▼
    │  [/mon-compte/reservations/{id} — confirmation]
    │
    └─ si offer_type = sale|both
          (boutons "Prendre RDV" + "WhatsApp")
          ▼
       [/vehicules/{slug}/rendez-vous]
          │ (formulaire : date, créneau, lieu, tel, notes)
          ▼
       [POST /api/appointments → pending]
          ▼
       [/mon-compte/rendez-vous/{id} — confirmation]
```

### 4.2 Flow compte client

```
[Header — "Se connecter"]
    ▼
[/connexion]   (champ login = email OU téléphone, comme mobile)
    │
    ├─ "Créer un compte" → [/inscription]
    │
    └─ Mot de passe oublié → [/mot-de-passe/oublie]   (post-MVP)
       ▼
[/mon-compte] — dashboard
    ├─ Mes infos (profil, mot de passe)
    ├─ Mes réservations (liste + détail, annuler si pending)
    ├─ Mes rendez-vous (liste + détail, annuler si pending)
    ├─ Mes favoris (véhicules + biens)
    └─ Mes notifications
```

### 4.3 Flow favoris

```
[Détail véhicule/bien]
    │ (icône ♡ en haut à droite)
    ▼
Si non connecté → modal "Connectez-vous pour sauvegarder"
Si connecté    → POST /api/favorites/toggle → animation ♥ rempli
    ▼
[/mon-compte/favoris]  (liste unifiée véhicules + biens)
```

### 4.4 Edge cases à prévoir

| Cas                                                                | Comportement web                                                    |
|--------------------------------------------------------------------|---------------------------------------------------------------------|
| Item déjà réservé (`is_available = false`)                         | **Reste visible**, badge "Réservé", CTA désactivé (règle D1)         |
| Utilisateur tente `/reserver` sur un item `offer_type=sale`        | Redirection vers formulaire RDV + message informatif                |
| Session expirée en plein formulaire                                | Sauvegarde brouillon local + modal reconnexion, reprise du formulaire |
| Catalogue vide (filtre trop restrictif)                            | État vide illustré + CTA "Réinitialiser les filtres"                |
| Erreur réseau lors d'un POST                                       | Toast erreur + bouton "Réessayer", pas de perte de données          |
| Navigation directe vers `/mon-compte` sans être connecté           | Redirection `/connexion?next=/mon-compte`                           |

---

## 5. Liste priorisée des pages (MoSCoW)

### 5.1 Must have — MVP

| # | Page                                   | Route                                         | Description                                    |
|---|----------------------------------------|-----------------------------------------------|------------------------------------------------|
| 1 | Home                                   | `/`                                           | Hero, 3-4 véhicules vedettes, 3-4 biens vedettes, CTAs vers catalogues |
| 2 | Catalogue véhicules                    | `/vehicules`                                  | Liste + filtres (catégorie, ville, prix, offer_type, recherche texte) |
| 3 | Détail véhicule                        | `/vehicules/{id}-{slug}`                      | Galerie, specs complètes, CTA conditionnel selon `offer_type` |
| 4 | Catalogue biens immobiliers            | `/immobilier`                                 | Idem véhicules + filtres surface/chambres      |
| 5 | Détail bien immobilier                 | `/immobilier/{id}-{slug}`                     | Galerie, specs, CTA conditionnel                |
| 6 | Formulaire réservation (véhicule rent) | `/vehicules/{id}-{slug}/reserver`             | Dates, chauffeur, récap tarif                   |
| 7 | Formulaire rendez-vous (sale/both)     | `/vehicules/{id}-{slug}/rendez-vous`          | Date, créneau, lieu, contact                    |
| 8 | Inscription                            | `/inscription`                                | Nom, email, téléphone, mot de passe            |
| 9 | Connexion                              | `/connexion`                                  | Login (email OU tel) + mot de passe            |
| 10| Dashboard client                       | `/mon-compte`                                 | Vue synthèse + nav sous-sections                |
| 11| Mes réservations                       | `/mon-compte/reservations`                    | Liste + filtres statut                          |
| 12| Détail réservation                     | `/mon-compte/reservations/{id}`               | Récap + bouton annuler si pending               |
| 13| Mes rendez-vous                        | `/mon-compte/rendez-vous`                     | Liste + filtres statut                          |
| 14| Détail rendez-vous                     | `/mon-compte/rendez-vous/{id}`                | Récap + bouton annuler si pending               |
| 15| Mes favoris                            | `/mon-compte/favoris`                         | Liste unifiée véhicules + biens                 |
| 16| Mon profil                             | `/mon-compte/profil`                          | Édition infos + changement mot de passe         |
| 17| Mes notifications                      | `/mon-compte/notifications`                   | Liste + marquer comme lu                        |
| 18| 404                                    | `*`                                           | Page introuvable avec retour home              |

### 5.2 Should have — Post-MVP (v1.1)

| # | Page                                  | Raison                                        |
|---|---------------------------------------|-----------------------------------------------|
| S1| Page chauffeurs (liste publique)      | Parité mobile, rassurant pour les clients     |
| S2| À propos                              | Crédibilité, trust                            |
| S3| Contact                               | Formulaire générique hors RDV                 |
| S4| Conditions générales + Politique confidentialité | Obligations légales pour prod                |
| S5| Mot de passe oublié + réinitialisation | Autonomie utilisateur                        |

### 5.3 Could have — V2

- C1 Carte interactive catalogue (Q6 reportée)
- C2 Pages SEO locales (`/location-voiture-abidjan`, etc.) (Q5 reportée)
- C3 Blog / conseils
- C4 Comparateur multi-items
- C5 Partage social optimisé (OpenGraph riche par item)
- C6 Notifications push web
- C7 i18n FR/EN

### 5.4 Won't have — explicitement exclu du périmètre

- W1 Back-office admin refait en web public (**jamais** — il reste séparé sur `admin.tdaholding.com`)
- W2 Paiement en ligne (phase 5 backend commune)
- W3 Messagerie in-app client ↔ admin (phase 8 commune)
- W4 **Présence Play Store / App Store** (réversible via TWA Android ou wrap Capacitor en V2+ sans rewrite)
- W5 **App native iOS/Android** séparée (la PWA couvre les besoins identifiés ; upgrade natif seulement si besoin critique futur type NFC/SDK bancaire)

---

## 6. Wireframes conceptuels (ASCII)

### 6.1 Home (`/`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [LOGO TDA]   Véhicules  Immobilier  Chauffeurs       [Connexion] ♡  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐     │
│   │    HERO — image Afrique                                    │     │
│   │    "Se déplacer et se loger, version premium africaine"    │     │
│   │    [Explorer les véhicules]   [Découvrir l'immobilier]     │     │
│   └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│   ── Véhicules en vedette ──────────────── voir tout →              │
│   [card] [card] [card] [card]                                        │
│                                                                      │
│   ── Biens immobiliers en vedette ────── voir tout →                │
│   [card] [card] [card] [card]                                        │
│                                                                      │
│   ── Pourquoi TDA Holding ── (3 valeurs : confiance, cash, local)   │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  Footer — liens, contact, mentions légales                           │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 Catalogue véhicules (`/vehicules`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [LOGO]   Véhicules  Immobilier  ...                [Connexion]   ♡   │
├──────────────────────────────────────────────────────────────────────┤
│ > Accueil > Véhicules                          [🔍 Rechercher...]    │
├───────────────────┬──────────────────────────────────────────────────┤
│  FILTRES          │   152 véhicules                  [Tri ▾] [Grille]│
│                   │                                                  │
│  Offre            │  ┌──────┐  ┌──────┐  ┌──────┐                   │
│  ◉ Tous           │  │[img] │  │[img] │  │[img] │                   │
│  ○ Location       │  │Toyota│  │Nissan│  │Kia   │                   │
│  ○ Vente          │  │RAV4  │  │Patrol│  │Rio   │                   │
│                   │  │45k/j │  │-VENDU│  │25k/j │                   │
│  Catégorie        │  │Coco  │  │Riv.  │  │Plat. │                   │
│  ☐ SUV / 4x4      │  │  ♡   │  │  ♡   │  │  ♡   │                   │
│  ☐ Berline        │  └──────┘  └──────┘  └──────┘                   │
│  ☐ Pickup         │                                                  │
│                   │  ┌──────┐  ┌──────┐  ┌──────┐                   │
│  Ville            │  │ ...  │  │ ...  │  │ ...  │                   │
│  [Abidjan    ▾]   │  └──────┘  └──────┘  └──────┘                   │
│                   │                                                  │
│  Prix / jour      │                                                  │
│  [min] — [max]    │  « 1  2  3  4  5  »                              │
│                   │                                                  │
│  [Réinitialiser]  │                                                  │
└───────────────────┴──────────────────────────────────────────────────┘
```

### 6.3 Détail véhicule (`/vehicules/{id}-{slug}`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [LOGO]   ...                                       [Connexion]   ♡   │
├──────────────────────────────────────────────────────────────────────┤
│ > Accueil > Véhicules > Toyota RAV4 2022                             │
├──────────────────────────────────────────────┬───────────────────────┤
│                                              │                       │
│  ┌───────────────────────────────┐           │  Toyota RAV4 2022  ♡ │
│  │      GALERIE PHOTO PRINCIPALE │           │  ★ Featured           │
│  │           [grande image]      │           │                       │
│  └───────────────────────────────┘           │  💰 45 000 FCFA / j   │
│  [thumb] [thumb] [thumb] [thumb]             │  (ou 18M FCFA achat)  │
│                                              │                       │
│  Description                                 │  📍 Cocody, Abidjan   │
│  Lorem ipsum ...                             │  🚗 SUV · 4x4         │
│                                              │  ⚙️  Automatique      │
│  Caractéristiques                            │  ❄️  Climatisation    │
│  • Marque : Toyota                           │                       │
│  • Modèle : RAV4                             │  ┌────────────────┐   │
│  • Année : 2022                              │  │ RÉSERVER       │   │
│  • Kilométrage : 25 000 km                   │  │ MAINTENANT     │   │
│  • Carburant : Essence                       │  └────────────────┘   │
│  • Transmission : Automatique                │                       │
│  • Climatisation : Oui                       │  (si sale/both :       │
│  • Portes : 5                                │   [Prendre RDV]        │
│                                              │   [WhatsApp] )         │
│                                              │                       │
│                                              │  Contact admin :      │
│                                              │  +225 XX XX XX XX     │
│                                              │                       │
├──────────────────────────────────────────────┴───────────────────────┤
│  Véhicules similaires                                                │
│  [card] [card] [card]                                                │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.4 Dashboard client (`/mon-compte`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [LOGO]   ...                                [Kouadio ▾]   🔔 3   ♡   │
├──────────────────────────────────────────────────────────────────────┤
│ > Accueil > Mon compte                                               │
├────────────────────┬─────────────────────────────────────────────────┤
│  MON COMPTE        │  Bonjour Kouadio 👋                             │
│                    │                                                 │
│  📊 Aperçu        │  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  🚗 Réservations   │  │  2        │  │  1        │  │  7        │    │
│  📅 Rendez-vous    │  │ en cours  │  │ RDV à     │  │ favoris   │    │
│  ♡  Favoris        │  │           │  │ venir     │  │           │    │
│  🔔 Notifications  │  └───────────┘  └───────────┘  └───────────┘    │
│  👤 Profil         │                                                 │
│  ⎋  Se déconnecter │  ── Dernière réservation ──                    │
│                    │  Toyota RAV4 · 12-15 avril · Confirmée          │
│                    │  [Voir détail]                                  │
│                    │                                                 │
│                    │  ── Prochain rendez-vous ──                     │
│                    │  Villa Cocody · 21 avril, 14h-16h · Confirmé    │
│                    │  [Voir détail]                                  │
│                    │                                                 │
│                    │  ── Notifications récentes ──                   │
│                    │  • Réservation confirmée par l'admin            │
│                    │  • Rappel RDV dans 2 jours                      │
│                    │  [Voir toutes]                                  │
└────────────────────┴─────────────────────────────────────────────────┘
```

### 6.5 Formulaire réservation (`/vehicules/{id}/reserver`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ > Véhicules > Toyota RAV4 > Réserver                                 │
├──────────────────────────────────┬───────────────────────────────────┤
│                                  │                                   │
│   Vos dates                      │  RÉCAPITULATIF                    │
│   Du  [__/__/____]               │  ┌───────────────────────────┐   │
│   Au  [__/__/____]               │  │  [photo] Toyota RAV4       │   │
│                                  │  │  Cocody, Abidjan           │   │
│   Chauffeur                      │  │                            │   │
│   ○ Sans chauffeur               │  │  Du 12/04 au 15/04         │   │
│   ◉ Avec chauffeur               │  │  = 3 jours                 │   │
│     [Kouassi D.  ▾]              │  │                            │   │
│                                  │  │  Tarif : 45k × 3 = 135k    │   │
│   Contact                        │  │  Chauffeur : +15k          │   │
│   Téléphone [_______________]    │  │  ────────────────          │   │
│                                  │  │  Total : 150 000 FCFA      │   │
│   Notes (optionnel)              │  │                            │   │
│   ┌──────────────────────────┐   │  │  Paiement : cash à la      │   │
│   │                          │   │  │  remise du véhicule        │   │
│   └──────────────────────────┘   │  └───────────────────────────┘   │
│                                  │                                   │
│                                  │  ☐ J'accepte les CGV              │
│                                  │                                   │
│                                  │  [  Confirmer la réservation  ]   │
│                                  │                                   │
└──────────────────────────────────┴───────────────────────────────────┘
```

### 6.6 Connexion (`/connexion`)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                    ┌─────────────────────────────┐                   │
│                    │        [LOGO TDA]           │                   │
│                    │     Bienvenue               │                   │
│                    │                             │                   │
│                    │  Email ou téléphone         │                   │
│                    │  [________________________] │                   │
│                    │                             │                   │
│                    │  Mot de passe               │                   │
│                    │  [________________________] │                   │
│                    │                             │                   │
│                    │  Mot de passe oublié ? →    │                   │
│                    │                             │                   │
│                    │  [   Se connecter   ]       │                   │
│                    │                             │                   │
│                    │  ───  ou  ───               │                   │
│                    │                             │                   │
│                    │  Nouveau ? Créer un compte →│                   │
│                    └─────────────────────────────┘                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 7. Règles produit spécifiques au web

Héritées du mobile (cf. `project-documentation.md` §10) + ajouts web :

| # | Règle                                                                                       |
|---|---------------------------------------------------------------------------------------------|
| 1 | Items réservés **visibles** avec badge "Réservé" et CTA désactivé *(règle D1 héritée)*     |
| 2 | UI conditionnelle selon `offer_type` — `rent` → Réserver / `sale`·`both` → RDV + WhatsApp *(D2)* |
| 3 | Login = email OU téléphone (champ unique) *(D3)*                                            |
| 4 | Paiement cash par défaut, transaction créée à la confirmation *(D4)*                        |
| 5 | Mêmes statuts canoniques que l'ancien mobile (cf. `project-context.md` §7.5)                |
| 6 | Mêmes couleurs d'état (badges statut) que le design system TDA                              |
| 7 | **URLs propres et partageables** : `/vehicules/{id}-{slug}` → un utilisateur peut envoyer un lien WhatsApp à un ami |
| 8 | **Responsive mobile-first** : même codebase, layouts adaptatifs selon breakpoint            |
| 9 | **PWA installable dès le MVP** (manifest + Service Worker + icônes + splash screen)         |
| 10| **Cohérence visuelle TDA** : palette officielle (#1B5E20 / #DAA520), logo, composants StatusBadge |
| 11| **Tutoriel d'installation iOS** explicite (« Partager → Ajouter à l'écran d'accueil »)       |
| 12| **Opt-in explicite** pour les notifications push (jamais de demande automatique au premier chargement) |
| 13| **Pas d'onboarding 3 slides** — l'écran de démarrage de l'ex-app RN (3 slides de présentation) est **supprimé** ; la Home (`/`) remplace ce rôle d'introduction. *(Décision A3 — 2026-04-20)* |

### Règles techniques impactant le produit *(actées par ADR-012, validées 2026-04-20)*
- A1 ✅ **Architecture SEO-ready** dès le MVP (Next.js 15 App Router + RSC), même sans investissement contenu au lancement
- A2 ✅ **Auth unifiée** : Sanctum SPA stateful (cookies httpOnly + CSRF) ; pas de Bearer token côté web pour raisons XSS
- A3 ✅ **URLs en français** : `/vehicules`, `/immobilier`, `/connexion`, `/mon-compte` (cohérent avec UI FR) — **+ Suppression onboarding 3 slides** : la Home `/` remplace ce rôle, pas d'écran intro séparé
- A4 ✅ **Médias servis via CDN** (Cloudflare R2 ou équivalent) dès la mise en prod pour respecter AC-10 performance
- A5 ✅ **API `/api/v1/` versionnée** avant l'ouverture du MVP
- A6 ✅ **Types TypeScript partagés** : package `@tda/api-types` généré depuis OpenAPI spec → zéro drift

---

## 8. Critères d'acceptation fonctionnels (niveau MVP)

### AC-1 — Navigation publique sans compte
- [ ] Un visiteur peut parcourir `/vehicules` et `/immobilier` sans se connecter
- [ ] Filtres et pagination fonctionnent
- [ ] Clic sur une carte → page détail accessible, URL propre
- [ ] Les items `is_available=false` affichent le badge "Réservé"

### AC-2 — Inscription & connexion
- [ ] Inscription avec nom + email + téléphone + mot de passe
- [ ] Connexion avec **email OU téléphone** dans un seul champ
- [ ] Message d'erreur explicite si identifiants invalides
- [ ] Après connexion, redirection vers `/mon-compte` (ou vers la page précédente)

### AC-3 — Réservation (offer_type = rent)
- [ ] Bouton "Réserver maintenant" uniquement si `offer_type=rent` et `is_available=true`
- [ ] Formulaire : dates, chauffeur optionnel, téléphone, notes
- [ ] Validation dates cohérentes (début < fin, pas dans le passé)
- [ ] Récap tarifaire en temps réel
- [ ] Création booking en statut `pending` + transaction
- [ ] Redirection vers `/mon-compte/reservations/{id}` après succès

### AC-4 — Rendez-vous (offer_type = sale/both)
- [ ] Boutons "Prendre RDV" + "WhatsApp" uniquement si `offer_type` ∈ {sale, both}
- [ ] Formulaire : date, créneau, lieu, téléphone, email, notes
- [ ] Création appointment en statut `pending`
- [ ] Redirection vers `/mon-compte/rendez-vous/{id}` après succès

### AC-5 — Favoris
- [ ] Icône ♡ sur les cartes catalogue et en détail
- [ ] Clic non-connecté → modal invitation à se connecter
- [ ] Clic connecté → toggle favori, animation ♥ rempli
- [ ] `/mon-compte/favoris` liste unifiée véhicules + biens

### AC-6 — Dashboard client
- [ ] Accès `/mon-compte` uniquement si connecté (sinon redirect `/connexion?next=...`)
- [ ] Vue synthèse : compteurs réservations actives, RDV à venir, favoris
- [ ] Sections accessibles : réservations, rendez-vous, favoris, notifications, profil
- [ ] Détail booking avec bouton "Annuler" si `status=pending`
- [ ] Détail appointment avec bouton "Annuler" si `status=pending`
- [ ] Édition profil + changement mot de passe fonctionnels

### AC-7 — Cohérence cross-device
- [ ] Un client qui réserve depuis la PWA installée (mobile) voit sa réservation depuis le web desktop du même compte
- [ ] Session valide depuis n'importe quel appareil (un seul codebase = pas de drift possible)
- [ ] Déconnexion depuis un appareil n'invalide pas la session des autres appareils (comportement web standard)

### AC-8 — États vides, erreurs, chargements
- [ ] Skeletons pendant le chargement des listes
- [ ] État vide illustré pour chaque liste vide (catalogue filtré, favoris, etc.)
- [ ] Toasts d'erreur réseau avec bouton "Réessayer"
- [ ] 404 personnalisée avec retour home

### AC-9 — Responsive & PWA
- [ ] Breakpoints : mobile (320-767), tablette (768-1023), desktop (1024+)
- [ ] Aucune fonctionnalité bloquée quel que soit l'appareil
- [ ] Layout desktop utilise pleinement l'espace (min 1200px)
- [ ] Manifest PWA valide (Lighthouse PWA score ≥ 90)
- [ ] Service Worker enregistré, app navigable hors ligne sur pages déjà visitées
- [ ] Installation via bannière Chrome Android fonctionnelle
- [ ] Installation via Safari iOS 16.4+ (tutoriel UI présent)
- [ ] App ouverte en `display=standalone` après installation (pas de barre d'URL)

### AC-10 — Performance MVP (cible, non bloquant)
- [ ] LCP < 2.5s sur catalogue en 4G simulé
- [ ] Temps d'interaction < 3s après ouverture détail
- [ ] Images optimisées (formats modernes, tailles adaptées)

---

## 9. Priorisation RICE — Features du MVP

Rappel RICE : **R**each × **I**mpact × **C**onfidence ÷ **E**ffort.

| Feature                           | Reach | Impact | Confidence | Effort | Score | Priorité |
|-----------------------------------|-------|--------|------------|--------|-------|----------|
| Catalogue + détail (2 verticales) | 10    | 3      | 90%        | 5      | 54    | P0       |
| Réservation véhicule              | 8     | 3      | 85%        | 4      | 51    | P0       |
| Rendez-vous (sale/both)           | 6     | 3      | 85%        | 3      | 51    | P0       |
| Auth (register/login)             | 10    | 2      | 95%        | 3      | 63    | P0       |
| Dashboard client (réservations)   | 7     | 3      | 85%        | 4      | 45    | P0       |
| Favoris                           | 5     | 2      | 80%        | 2      | 40    | P1       |
| Notifications client              | 5     | 2      | 80%        | 3      | 27    | P1       |
| Profil / mot de passe             | 4     | 2      | 90%        | 2      | 36    | P1       |
| Page chauffeurs publique          | 3     | 1      | 80%        | 1      | 24    | P2       |
| Mot de passe oublié               | 6     | 2      | 80%        | 3      | 32    | P1       |

→ **P0** = Must have MVP (sprint 1-2) ; **P1** = MVP étendu (sprint 3) ; **P2** = post-MVP.

---

## 10. KPIs & critères de succès

### 10.1 KPIs produit (à activer après mise en production)

| KPI                                        | Cible 3 mois post-prod | Cible 6 mois post-prod |
|--------------------------------------------|:----------------------:|:----------------------:|
| Visiteurs uniques mensuels (toutes sources)| 2 000                  | 10 000                 |
| Taux de conversion visiteur → inscription  | ≥ 3%                   | ≥ 5%                   |
| Part des bookings créés via web / total    | ≥ 20%                  | ≥ 35%                  |
| Taux de complétion formulaire booking      | ≥ 60%                  | ≥ 75%                  |
| Taux de complétion formulaire RDV          | ≥ 70%                  | ≥ 80%                  |
| Utilisateurs cross-device (web + mobile)   | ≥ 15%                  | ≥ 25%                  |

### 10.2 KPIs techniques (suivis dès le MVP, même en local)

- **LCP** (Largest Contentful Paint) < 2.5s sur catalogue
- **CLS** (Cumulative Layout Shift) < 0.1
- **TTI** < 3.5s desktop
- **Bundle JS initial** < 200 KB gzipped
- **Lighthouse SEO** ≥ 90 (même sans contenu, l'archi doit être saine)

### 10.3 Critères de succès qualitatifs

- [ ] Un client peut réaliser tout le parcours découverte → réservation sans jamais toucher le mobile
- [ ] Un lien de détail partagé sur WhatsApp s'ouvre correctement (pas de flash blanc, pas d'erreur)
- [ ] L'admin ne voit **aucune différence** dans son back-office, que le booking vienne du web ou du mobile
- [ ] Zéro régression mobile constatée après mise en production web

---

## 11. Dépendances & prérequis

### 11.1 Dépendances techniques (à adresser par Winston dans ADR-012)

| # | Dépendance                                                                       | Statut         | Bloquant MVP ? |
|---|----------------------------------------------------------------------------------|----------------|:--------------:|
| 1 | Décision d'architecture → **Option E** (Next.js + PWA)                           | ✅ ADR-012 acté | —              |
| 2 | Stratégie d'auth → **Sanctum SPA stateful** (cookies httpOnly + CSRF)            | ✅ ADR-012      | —              |
| 3 | API versioning `/api/v1/*`                                                       | 🔲 à faire     | OUI            |
| 4 | Config CORS pour `tdaholding.com` avec `supports_credentials: true`              | 🔲 à faire     | OUI            |
| 5 | Migration médias vers CDN (Cloudflare R2) — requis pour AC-10                    | 🔲 à faire     | OUI            |
| 6 | Génération de `slug` + colonnes DB sur `vehicles` et `properties`                | 🔲 à faire     | OUI            |
| 7 | Routes API additionnelles (`featured`, `search`, etc.)                           | ⚠️ à préciser  | Probable       |
| 8 | **Archivage** de `tda-holding-mobile` (Option E)                                 | 🔲 à faire     | Non (post-release) |
| 9 | OpenAPI spec exposée sur `/api/v1/openapi.json` pour génération `@tda/api-types` | 🔲 à faire     | OUI            |
| 10| Policies RBAC complètes (ADR-010) + Epic Q de l'audit                            | 🔄 en cours    | OUI            |

### 11.2 Dépendances produit

- **Données réelles** en base (catégories, seed véhicules/biens) pour démo crédible
- **Médias de qualité** (photos haute def) — peut nécessiter une session photo (impact direct sur AC-10 et Lighthouse)
- **Mentions légales / CGV rédigées** avant mise en production (post-MVP OK en local)
- **Icônes PWA** : 192×192, 512×512, maskable 512×512 + splash screens (Amelia + designer)
- **Clés VAPID** pour Web Push (générées au setup, stockées en `.env`)

### 11.3 Dépendances équipe

- **Amelia** disponible pour exécution (code + UI fine)
- **Winston** pour ADR-012 **avant** découpage en stories par Bob
- **Olivia** (moi) pour arbitrages en cours de route

---

## 12. Risques — vue produit

Risques techniques / organisationnels : voir BRIEF-001 §7.

Risques **produit** spécifiques :

| # | Risque                                                              | Probabilité | Impact | Mitigation                                                          |
|---|---------------------------------------------------------------------|-------------|--------|---------------------------------------------------------------------|
| P1| Parcours booking web/PWA différent = admin confus                   | Faible      | Élevé  | Option E = 1 codebase → structurellement impossible de diverger     |
| P2| Perception "c'est un site, pas une vraie app" chez utilisateurs     | Moyenne     | Moyen  | Tutoriel d'installation + communication "installez TDA sur votre écran d'accueil" |
| P3| UX desktop perçue comme "mobile étiré" si composants mal adaptés    | Moyenne     | Élevé  | Design adaptatif selon breakpoint (layouts 2-3 cols desktop)        |
| P4| Manque de photos HD pour un rendu desktop premium                   | Élevée      | Moyen  | Audit photos dès sprint 1, remplacement au besoin                   |
| P5| Drift de règles métier web/mobile au fil du temps                   | **Nulle**   | —      | **Option E résout le risque by design** (un seul codebase)          |
| P6| iOS : installation PWA moins fluide qu'Android (pas de bannière)    | Élevée      | Moyen  | Tutoriel Safari explicite + bouton « Installer » custom              |
| P7| Absence de présence Play Store / App Store perçue comme manque      | Moyenne     | Moyen  | Communication marketing sur la "nouveauté" PWA ; réversible via TWA  |
| P8| Report indéfini de la carte (Q6) perçu comme manque                 | Faible      | Faible | Clairement positionné comme V2 dans la communication                |
| P9| Push notifications iOS dépendent de l'installation préalable        | Élevée      | Moyen  | Communication dans l'UI : "installez pour recevoir des rappels"      |

---

## 13. Roadmap unifiée

### Phase MVP — "Plateforme unifiée" *(3 sprints backend + 5 sprints web estimés ; voir ADR-012)*
- Backend : Epic Q (audit) + Epic A (policies) + API v1 + OpenAPI + CORS Sanctum SPA + slug + CDN R2
- Web : toutes les pages P0 + P1 listées section 5.1
- PWA installable (manifest + Service Worker + Web Push opt-in)
- Responsive desktop + mobile
- Sunset du workspace `tda-holding-mobile` post-go-live
- **Livrable** : plateforme unifiée déployée, utilisateurs RN migrés

### Phase V1.1 — "Trust & complétude" *(1 sprint post-MVP)*
- Page chauffeurs publique
- À propos, Contact
- CGV / Politique de confidentialité
- Mot de passe oublié + réinitialisation

### Phase V2 — "Différenciation & acquisition" *(plus tard)*
- Carte interactive catalogue (Q6)
- Pages SEO locales (Q5)
- Partage social optimisé (OpenGraph riche par item)
- Comparateur multi-items
- i18n FR/EN (`next-intl` déjà préparé)
- Évaluation **présence Play Store** via TWA (si business justifie)

### Phase V3 — "Engagement" *(long terme)*
- Blog / conseils (SEO de contenu)
- Espace vendor self-service (phase 6 commune backend)
- Évaluation **wrap Capacitor** pour App Store iOS (si business critique)
- Features natives avancées uniquement si besoin stratégique (NFC, SDK bancaire)

---

## 14. Ce que ce PRD ne couvre PAS

Pour éviter les malentendus :

- Les **choix techniques fins** (structure monorepo, Service Worker strategy, etc.) → **ADR-012 de Winston** *(tranché)*
- Le **découpage en stories** → **Bob**
- Le **design system fin** (couleurs exactes, espacements, typos) → **Amelia** (s'appuie sur `src/constants/theme.js` de l'ex-mobile + Tailwind admin)
- Les **mockups haute-fidélité** → **Amelia**
- Les **icônes PWA + splash screens** → **Amelia** (+ designer si besoin)
- Le **plan de déploiement détaillé** → **Winston** dans ADR-012 *(tranché)*
- Les **tests E2E** → **Bob** dans la QA Gate

---

## 15. Checklist de sortie (Concept Ready → Stories)

- [x] Problème et opportunité clairs
- [x] Personas et parcours identifiés
- [x] User stories haut niveau rédigées (via les pages P0)
- [x] Wireframes conceptuels des 6 écrans clés
- [x] Critères d'acceptation fonctionnels listés (AC-1 à AC-10)
- [x] Règles métier explicites (héritées + spécifiques plateforme unifiée)
- [x] Priorité explicite (P0/P1/P2 + MoSCoW + RICE)
- [x] KPIs de succès définis (produit + technique + qualitatif)
- [x] Dépendances et risques listés
- [x] **ADR-012 produit et validé** → décision Option E actée
- [x] Prêt à être consommé par Bob pour découpage en stories

---

## 15b. Référence maquette UX/UI — Readdy

> **Décision validée le 2026-04-20** par le Product Owner.

Amelia doit **s'inspirer de la maquette Readdy** suivante pour le design UX/UI du frontend `tda-holding-web` :

| Ressource | URL |
|-----------|-----|
| **Maquette interactive Readdy** | https://readdy.cc/preview/714cd5ee-bf0e-405e-add9-48b26d0f0c58/8618127/ |
| Projet Readdy (éditeur) | https://readdy.ai/project/714cd5ee-bf0e-405e-add9-48b26d0f0c58 |

### Instructions pour Amelia (Dev-Designer)

1. **Ouvrir la maquette** dans un navigateur (Chrome recommandé) avant de commencer l'implémentation.
2. **Analyser l'ensemble des écrans** disponibles dans la preview : Home, Catalogue, Détail, Dashboard, Connexion, Réservation.
3. **S'appuyer sur la maquette** pour :
   - Hiérarchie visuelle et typographie
   - Disposition des composants (grilles, cards, sections)
   - Choix de couleurs et espacements (à harmoniser avec la palette TDA officielle : `#1B5E20` vert, `#DAA520` doré)
   - Style des CTAs, badges de statut, navigation
4. **Adapter au design system TDA** : le branding (couleurs, logo) prime sur la maquette si conflit.
5. **Conserver les wireframes conceptuels** de ce PRD (section 6) comme référence fonctionnelle ; la maquette Readdy est la référence **visuelle et UX**.
6. **Pas d'onboarding 3 slides** — cette feature de l'app mobile RN n'existe pas dans la version web. La Home fait office de première impression.

> ⚠️ Si le lien Readdy devient inaccessible, contacter le Product Owner pour obtenir les exports assets.

---

## 16. Prochaines actions

| # | Acteur           | Action                                                                          | Échéance  |
|---|------------------|---------------------------------------------------------------------------------|-----------|
| 1 | **Utilisateur**  | Validation finale PRD + ADR-012 (Option E actée)                                 | Immédiat  |
| 2 | **Bob**          | Découper en epics/stories selon ADR-012, planifier sprints BE-1 à WEB-5          | Sprint suivant |
| 3 | **Bob**          | Mettre à jour `project-context.md` (workspaces, stack, état d'avancement)        | Sprint suivant |
| 4 | **Bob**          | Rédiger le plan de sunset `tda-holding-mobile` (communication, archivage Git)    | Avant WEB-5 |
| 5 | **Olivia** (moi) | Trancher Q6 (carte) quand on sera prêts à planifier la V2                        | Plus tard |
| 6 | **Amelia**       | Analyser la maquette Readdy (§15b), setup `tda-holding-web` selon ADR-012, puis implémentation MVP | Sprint WEB-1 |

---

## Annexe A — Glossaire

| Terme               | Définition                                                                                 |
|---------------------|--------------------------------------------------------------------------------------------|
| MVP                 | Minimum Viable Product — version minimale utile                                           |
| offer_type          | Attribut véhicule/bien : `rent`, `sale` ou `both`                                         |
| is_available        | Booléen item disponible à la réservation (visible même si false)                          |
| RBAC                | Role-Based Access Control — `super_admin`, `agent`, `vendor`, `client`                   |
| PWA                 | Progressive Web App — application web installable avec icône, plein écran, offline, push |
| Service Worker      | Script navigateur qui intercepte les requêtes réseau et gère cache + offline              |
| SSR / SSG / ISR     | Server Side Rendering / Static Site Generation / Incremental Static Regeneration (Next.js) |
| RSC                 | React Server Components — rendu côté serveur par défaut dans Next.js 15 App Router        |
| Sanctum SPA         | Mode d'authentification Laravel par cookies httpOnly + CSRF (vs Bearer token)             |
| LCP / CLS / TTI     | Core Web Vitals — métriques de performance                                                |
| TWA                 | Trusted Web Activity — empaquetage PWA Android pour Play Store (V2+)                      |
| Capacitor           | Wrapper natif iOS/Android autour d'une app web (option future V2+)                        |
| VAPID               | Voluntary Application Server Identification — clés pour Web Push                          |

---

## Historique des révisions

| Date       | Version | Changements                                                                 |
|------------|---------|-----------------------------------------------------------------------------|
| 2026-04-19 | 1.0     | Création initiale — périmètre "web dédié complémentaire au mobile RN"        |
| 2026-04-19 | 2.0     | **Pivot Option E** : plateforme unifiée Next.js + PWA, retrait de React Native. Amendement titre, résumé, objectifs, personas, règles, AC, dépendances, risques, roadmap. |
| 2026-04-20 | 2.1     | **Décisions validées** : A1–A6 validées, A3 complétée par suppression onboarding 3 slides, validation C (5 risques ruptures techniques actés), section D (zones floues) supprimée, ajout §15b référence maquette Readdy pour Amelia. |

---

*PRD rédigé le 2026-04-19 par Olivia (Chef de Projet), amendé le 2026-04-19 suite à la décision utilisateur et l'ADR-012 de Winston.*

*« La vision s'ajuste, la technique suit, le produit gagne en cohérence. »* — Olivia 🎯
