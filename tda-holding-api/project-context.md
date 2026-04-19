# TDA Holding — Project Context

> **Source de vérité unique** pour la stack technique, l'architecture, et les conventions de nommage du projet TDA Holding.
> Ce document doit être consulté AVANT toute intervention par les agents BMAD (Analyst, Architect, Dev, PM, SM, TEA, Tech-Writer, UX-Designer).
> Dernière mise à jour : 2026-04-18

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

---

## 2. Architecture globale

```
┌───────────────────────────────────────────────────────────────────┐
│                         TDA Holding Platform                      │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────────────┐        ┌────────────────────────────┐   │
│   │   tda-holding-api   │◀──────▶│    tda-holding-mobile      │   │
│   │   (Laravel 13)      │  HTTP  │    (React Native / Expo)   │   │
│   │                     │  REST  │                            │   │
│   │   - API Sanctum     │        │   Clients finaux           │   │
│   │   - Back-office     │        │   iOS / Android / Web      │   │
│   │     Inertia/React   │        │                            │   │
│   └─────────────────────┘        └────────────────────────────┘   │
│            │                                                      │
│            ▼                                                      │
│   ┌─────────────────────┐                                         │
│   │   PostgreSQL        │  (SQLite en dev possible)               │
│   └─────────────────────┘                                         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

Deux **workspaces Git distincts** :
- `d:\Mes_Projets\tda-holding-api`   → Backend + Back-office admin
- `d:\Mes_Projets\tda-holding-mobile` → Application mobile client

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

### 3.2 Mobile — `tda-holding-mobile`

| Catégorie           | Technologie / Version                |
|---------------------|--------------------------------------|
| Plateforme          | Expo SDK 54 (newArchEnabled: true)   |
| Runtime             | React 19.1 / React Native 0.81.5     |
| Navigation          | React Navigation 7 (stack + tabs + drawer) |
| HTTP                | Axios 1.14                           |
| Storage local       | AsyncStorage 2.2                     |
| Icônes              | @expo/vector-icons (Ionicons)        |
| Web compat          | react-native-web                     |
| Bundle ID iOS       | `com.tdaholding.mobile`              |
| Package Android     | `com.tdaholding.mobile`              |

**URLs API par plateforme** (`src/constants/config.js`) :
```js
android: 'http://10.0.2.2:8000/api'      // émulateur Android
ios:     'http://192.168.100.16:8000/api' // IP locale machine
web:     'http://127.0.0.1:8000/api'
```

> ⚠️ Pour appareil physique, utiliser l'IP locale réelle et lancer Laravel avec `php artisan serve --host=0.0.0.0 --port=8000`.

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

### 4.2 Mobile `tda-holding-mobile/src/`

```
src/
├── components/              ← Réutilisables (StatusBadge, Skeleton, ...)
├── constants/               ← config.js (API URL, BOOKING_STATUS, ...)
├── contexts/                ← AuthContext.js
├── hooks/                   ← Hooks personnalisés
├── navigation/              ← AppNavigator.js (stacks + tabs)
├── screens/
│   ├── Appointments/        ← Form + Detail
│   ├── Auth/                ← Login + Register
│   ├── Booking/             ← Création réservation
│   ├── Bookings/            ← Liste + Detail
│   ├── Catalogue/
│   ├── Drivers/
│   ├── Favorites/
│   ├── Home/
│   ├── Notifications/
│   ├── Onboarding/
│   ├── Profile/
│   ├── Properties/
│   └── Vehicles/
├── services/                ← api.js (axios + intercepteurs)
└── utils/                   ← storage.js, helpers
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

### Base : `http://<host>:8000/api`

### Routes publiques (pas d'auth)
```
POST   /auth/register              Inscription client
POST   /auth/login                 Connexion (champ `login` = email OU téléphone)
GET    /categories                 Liste catégories
GET    /vehicles                   Liste véhicules (filtres : category_id, offer_type, status, city, brand, search)
GET    /vehicles/{id}              Détail
GET    /properties                 Liste biens
GET    /properties/{id}            Détail
GET    /drivers                    Liste chauffeurs
GET    /drivers/available          Chauffeurs disponibles
GET    /drivers/{id}               Détail
```

### Routes authentifiées (Sanctum)
```
Auth    : /auth/logout, /auth/profile (GET/PUT), /auth/password (PUT)
Favoris : /favorites (GET), /favorites/toggle (POST)
Bookings: /bookings (GET/POST), /bookings/{id} (GET), /bookings/{id}/cancel (POST)
Rdv     : /appointments (GET/POST), /appointments/{id} (GET), /appointments/{id}/cancel (POST)
Trans.  : /transactions (GET), /transactions/{id} (GET)
Notifs  : /notifications (GET), /notifications/{id}/read, /notifications/read-all
```

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

### 7.4 Mobile (React Native)
| Élément                     | Convention                  | Exemple                          |
|-----------------------------|-----------------------------|----------------------------------|
| Écrans                      | `{Entité}{Vue}Screen.js`    | `VehicleDetailScreen.js`         |
| Composants                  | `PascalCase.js`             | `StatusBadge.js`, `Skeleton.js`  |
| Constantes                  | `UPPER_SNAKE_CASE`          | `API_BASE_URL`, `STORAGE_KEYS`   |
| Services                    | `camelCase` + suffix `API`  | `appointmentsAPI`, `bookingsAPI` |
| Navigation routes           | `PascalCase`                | `VehicleDetail`, `AppointmentForm` |

### 7.5 Statuts métier canoniques

**Booking** : `pending` → `confirmed` → `in_progress` → `completed` | `cancelled` | `rejected`
**Transaction** : `pending` → `confirmed` → `completed`
**Appointment** : `pending` → `confirmed` → `completed` | `cancelled`
**Vehicle/Property status** : `available` | `rented` | `sold` | `maintenance`
**Véhicule/Property `is_available`** : booléen qui contrôle la **disponibilité** à la réservation (visibilité toujours maintenue côté client pour afficher un badge "Réservé")
**Offer type** : `rent` | `sale` | `both`

---

## 8. Règles métier essentielles

1. **Visibilité des véhicules/biens** : un item réservé (`is_available = false`) **reste visible** dans le catalogue, avec badge "Réservé" et bouton d'action désactivé. Jamais masqué.
2. **UI conditionnelle mobile selon `offer_type`** :
   - `rent` → bouton **« Réserver maintenant »** (flux booking classique)
   - `sale` / `both` → boutons **« Rendez-vous »** + **« WhatsApp »** (flux appointment)
3. **Connexion mobile** : le champ `login` accepte **email OU téléphone**.
4. **AsyncStorage** : utiliser `getItem`/`setItem` individuels (pas `multiGet`/`multiSet`) pour compat web.
5. **Authentification API** : Bearer token Sanctum, stocké en AsyncStorage (`@tda_auth_token`).
6. **Rôles** : seul `super_admin` + `agent` passent le middleware `role:super_admin,agent`.
7. **Paiement** : `payment_method = cash` par défaut. Transaction générée à la confirmation d'un booking.

---

## 9. Commandes utiles

### Backend
```bash
# Dev complet (serveur + queue + logs + vite)
composer dev

# Serveur seul (accès mobile nécessite --host=0.0.0.0)
php artisan serve --host=0.0.0.0 --port=8000

# Migrations
php artisan migrate
php artisan migrate:fresh --seed

# Tests
composer test
php artisan test

# Build admin
npm run build

# Lint
./vendor/bin/pint
```

### Mobile
```bash
npx expo start            # QR code (Expo Go)
npx expo start --web      # navigateur
npx expo start --android  # émulateur Android
npx expo start --ios      # simulateur iOS (macOS)
```

### Identifiants par défaut
- **Admin** : `admin@tda-holding.com` / `password`

---

## 10. État d'avancement (au 2026-04-18)

- ✅ **Phase 1 — Backend API Laravel** : terminée (45+ routes, 10 modèles, RBAC, Sanctum)
- ✅ **Phase 2 — Back-office admin React/Inertia** : terminée (CRUD complet, dashboard, appointments)
- ✅ **Phase 3 — App mobile React Native/Expo** : terminée (14+ écrans, flux booking + appointment)
- 🔄 **Phase 4 — Tests & déploiement** : en cours
- 🔄 **Vehicle Visibility** : logique `is_available` implémentée (véhicules visibles + badge "Réservé")

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

*Ce document est vivant. Mettez-le à jour à chaque changement structurel (nouvelle entité, nouveau flux, changement de stack, nouvelle convention).*
