# TDA Holding — Guide de remédiation de l'audit structurel

> **Document technique — implémentation**
> Auteur : 🏛️ **Winston** (Architecte) — pour le compte du dev en charge de la correction
> Dernière mise à jour : 2026-04-18
> Référence de l'audit : voir rapport du 18/04/2026 (26 findings, P0 → P3)

Ce document transforme les **26 findings** de l'audit structurel en **tickets actionnables** prêts à être planifiés par Bob (Scrum Master) et implémentés par le dev. Chaque ticket contient :

- le **contexte** (cause racine) ;
- les **fichiers et lignes** impactés ;
- la **solution canonique** (extraits de code cibles) ;
- les **critères d'acceptation** (DoD) ;
- la **stratégie de test** (Pest/PHPUnit).

---

## Sommaire

- [Conventions d'implémentation](#conventions-dimplémentation)
- [Epic Q — Quick wins (⚡ 1 sprint court)](#epic-q--quick-wins--1-sprint-court)
- [Epic A — Durcissement de l'autorisation (ADR-010)](#epic-a--durcissement-de-lautorisation-adr-010)
- [Epic B — BookingWorkflow unifié (ADR-009)](#epic-b--bookingworkflow-unifié-adr-009)
- [Epic C — Hygiène structurelle (ADR-011)](#epic-c--hygiène-structurelle-adr-011)
- [Epic D — Cohérence métier & API](#epic-d--cohérence-métier--api)
- [Epic E — Dette technique](#epic-e--dette-technique)
- [Stratégie de tests transverse](#stratégie-de-tests-transverse)
- [Plan de release recommandé](#plan-de-release-recommandé)

---

## Conventions d'implémentation

**Branches** — une branche par epic, préfixe `fix/` pour les bugs, `refactor/` pour les restructurations, `security/` pour l'autorisation :

```
security/adr-010-authorization-policies
refactor/adr-009-booking-workflow
fix/quick-wins-p0
```

**Commits** — format conventionnel, référence du ticket dans le sujet :

```
fix(auth): TDA-Q02 renforcer règles mot de passe à min 8 caractères
security(policies): TDA-A01 introduire BookingPolicy
```

**Tests** — chaque ticket P0/P1 doit livrer **au moins un test de régression** dans `tests/Feature/` avant d'être mergé. Les refactors (Epic B, C) doivent conserver ou augmenter la couverture.

**Migrations** — les changements de schéma vont dans de **nouvelles migrations** datées ; ne jamais modifier les migrations existantes.

**Rétro-compat mobile** — toute modification de réponse API doit être notifiée au dev mobile (Rachid) ; voir section « Impact mobile » de chaque ticket concerné.

---

## Epic Q — Quick wins (⚡ 1 sprint court)

> **Objectif** : corriger les 4 bugs unitaires P0 qui peuvent tomber dans un sprint d'une journée. Pas de refactor, juste des patches ciblés.

### TDA-Q01 — Corriger `AppointmentPolicy` : `$user->is_admin` inexistant

**Priorité** : P0 — **Type** : Bug — **Effort** : 15 min

**Contexte**
Le modèle `User` expose la méthode `isAdmin()` mais aucune propriété `is_admin`. Le fallback PHP retourne `null`, donc toutes les règles admin de la policy échouent silencieusement (tests manuels : un super_admin reçoit 403 sur `GET /api/appointments/{id}` d'un autre utilisateur).

**Fichier**

- `@d:/Mes_Projets/tda-holding-api/app/Policies/AppointmentPolicy.php:22-48`

**Solution**

Remplacer les 3 occurrences de `$user->is_admin` par un appel à la méthode existante :

```php
public function view(User $user, Appointment $appointment): bool
{
    return $user->id === $appointment->user_id || $user->isAdmin();
}
```

Faire de même pour `update()` et `delete()`.

**Critères d'acceptation**

- Un `super_admin` obtient 200 sur `GET /api/appointments/{id}` d'un autre user.
- Un `client` non-propriétaire obtient 403 sur la même route.
- Aucune autre policy n'introduit `$user->is_admin` (grep le projet).

**Test**

`tests/Feature/AppointmentPolicyTest.php` — 3 scénarios : propriétaire OK, admin OK, autre client 403.

---

### TDA-Q02 — Politique de mot de passe à `min:8`

**Priorité** : P0 — **Type** : Security — **Effort** : 20 min

**Contexte**
`min:6` est trop permissif pour une plateforme traitant données personnelles et paiements.

**Fichiers**

- `@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Api/AuthController.php:21` (register)
- `@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Api/AuthController.php:123` (changePassword)

**Solution**

Remplacer `'required|string|min:6|confirmed'` par les règles Laravel par défaut :

```php
use Illuminate\Validation\Rules\Password;

'password' => ['required', 'confirmed', Password::defaults()],
```

`Password::defaults()` impose min 8 caractères. Pour durcir davantage (phase 5), on pourra configurer dans `AppServiceProvider::boot()` : `Password::defaults(fn () => Password::min(8)->mixedCase()->numbers());`.

**Critères d'acceptation**

- `POST /api/auth/register` avec `password = "abc123"` retourne 422.
- Avec `password = "Abcdef12"` retourne 201.
- Idem pour `PUT /api/auth/password`.

**Test**

Étendre `tests/Feature/Auth/RegisterTest.php` et créer `ChangePasswordTest.php`.

---

### TDA-Q03 — Supprimer les routes Breeze cassées (register web)

**Priorité** : P0 — **Type** : Bug — **Effort** : 30 min

**Contexte**
`@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Auth/RegisteredUserController.php:34-44` insère un champ `name` inexistant → crash SQL. Le produit ne prévoit **pas** d'inscription libre en back-office (les agents sont créés par l'admin). La route doit donc être supprimée, pas réparée.

**Fichiers**

- `@d:/Mes_Projets/tda-holding-api/routes/auth.php:15-18` → supprimer les deux routes `register`.
- `@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Auth/RegisteredUserController.php` → supprimer le fichier.
- `@d:/Mes_Projets/tda-holding-api/resources/js/Pages/Auth/Register.jsx` → supprimer la vue Inertia.
- Vérifier que `Login.jsx` ne renvoie plus vers `/register`.

**Critères d'acceptation**

- `GET /register` retourne 404.
- `POST /register` retourne 404.
- Aucun lien « Créer un compte » dans la vue Login.
- L'API `POST /api/auth/register` (canal mobile) reste fonctionnelle et intacte.

**Test**

`tests/Feature/Auth/RegisterRouteRemovedTest.php` — asserte 404 sur les deux routes.

---

### TDA-Q04 — Seeder admin : fixer `email_verified_at`

**Priorité** : P0 — **Type** : Bug — **Effort** : 10 min

**Contexte**
`migrate:fresh --seed` crée un super_admin sans `email_verified_at`. Le middleware `verified` sur `/admin/*` bloque alors l'accès. En l'absence de mailer configuré en dev, l'admin est enfermé dehors.

**Fichier**

- `@d:/Mes_Projets/tda-holding-api/database/seeders/RoleSeeder.php:12-22`

**Solution**

```php
User::create([
    'first_name' => 'Admin',
    'last_name' => 'TDA',
    'email' => 'admin@tda-holding.com',
    'phone' => '+2250000000000',
    'password' => 'password',
    'role' => 'super_admin',
    'is_active' => true,
    'email_verified_at' => now(),
    'city' => 'Abidjan',
    'country' => 'Côte d\'Ivoire',
]);
```

> **Note** : le TDA-E02 (voir Epic E) envisage de retirer complètement le flux `verified` ; ce patch est donc transitoire.

**Critères d'acceptation**

- `php artisan migrate:fresh --seed` puis login admin → arrivée directe sur `/admin/dashboard` sans écran `verify-email`.

---

## Epic A — Durcissement de l'autorisation (ADR-010)

> **Objectif** : introduire des Policies systématiques, séparer `super_admin` et `agent`, et supprimer les fuites de données publiques. Livre un ADR-010.

### TDA-A01 — Créer les Policies manquantes (8 ressources)

**Priorité** : P0 — **Type** : Security — **Effort** : 1.5 jour

**Contexte**
Seule `AppointmentPolicy` existe. Les contrôleurs font du `if ($user->isClient() && ...)` inline, répété et incohérent (cf. `Api\BookingController::show` vs `cancel`).

**Livrables**

Créer sous `app/Policies/` :

| Policy | Méthodes | Règles clés |
|---|---|---|
| `BookingPolicy` | viewAny, view, create, cancel, confirm, reject, start, complete | client : owner only ; agent : tout ; super_admin : tout |
| `TransactionPolicy` | viewAny, view, create, confirm, complete, delete | idem |
| `VehiclePolicy` | create, update, delete | super_admin + agent ; `view`/`viewAny` publics (pas de policy nécessaire) |
| `PropertyPolicy` | idem `VehiclePolicy` | |
| `DriverPolicy` | create, update, delete | admin uniquement |
| `FavoritePolicy` | viewAny, delete | owner only |
| `MediaPolicy` | create, delete, setPrimary | admin ; à terme vendor = owner du mediable |
| `UserPolicy` | toggleStatus | super_admin ; **jamais** sur un autre admin |

**Pattern recommandé** — factoriser via une méthode `before()` :

```php
public function before(User $user, string $ability): ?bool
{
    return $user->isSuperAdmin() ? true : null;
}
```

Enregistrer les policies dans un `AuthServiceProvider` (à créer si absent) ou via auto-discovery Laravel 11+ (vérifier présence dans `bootstrap/providers.php`).

**Refactor des contrôleurs**

Remplacer tous les `if ($user->isClient() && $booking->user_id !== $user->id)` par `$this->authorize('view', $booking);`. Retirer les vérifications inline devenues redondantes.

**Critères d'acceptation**

- `grep -r "isClient() &&" app/Http/Controllers` → 0 résultat.
- `grep -r "isAdmin()" app/Http/Controllers` → 0 résultat (autorisation centralisée).
- Chaque méthode mutante d'un contrôleur API appelle `$this->authorize()`.
- Tests de policy couvrent les 3 rôles × (propriétaire / non-propriétaire).

**Test**

- `tests/Unit/Policies/BookingPolicyTest.php` pour chaque policy.
- `tests/Feature/Api/BookingAuthorizationTest.php` : appel HTTP, vérification 403/200.

**Impact mobile** : aucun (les codes HTTP restent identiques).

---

### TDA-A02 — Séparer `super_admin` et `agent`

**Priorité** : P0 — **Type** : Security — **Effort** : 4 h

**Contexte**
Actuellement `role:super_admin,agent` traite les deux rôles comme identiques. Un agent peut supprimer n'importe quelle catégorie, vehicle, bien, transaction. Contraire au principe de moindre privilège.

**Matrice de permissions cible**

| Action | agent | super_admin |
|---|:---:|:---:|
| Lire dashboard, bookings, transactions | ✅ | ✅ |
| Confirmer / rejeter / compléter booking | ✅ | ✅ |
| Confirmer / compléter transaction | ✅ | ✅ |
| Créer véhicule / bien / chauffeur | ✅ | ✅ |
| **Supprimer** véhicule / bien / chauffeur / catégorie | ❌ | ✅ |
| **Supprimer** transaction | ❌ | ✅ |
| Gérer catégories (CRUD complet) | ❌ | ✅ |
| Activer / désactiver un client | ❌ | ✅ |
| Gérer les autres agents / vendeurs | ❌ | ✅ |

**Solution**

- Ne garder `role:super_admin,agent` que sur les routes partagées.
- Basculer les routes destructives sous un groupe `role:super_admin` dédié :

```php
Route::middleware('role:super_admin')->group(function () {
    Route::delete('/categories/{category}', ...);
    Route::delete('/vehicles/{vehicle}', ...);
    // ...
});
```

- Implémenter les règles correspondantes dans les policies (TDA-A01).

**Critères d'acceptation**

- Un agent authentifié reçoit 403 sur `DELETE /api/vehicles/{id}`.
- Un super_admin reçoit 200 sur la même route.
- Matrice ci-dessus couverte par tests.

**Test** : `tests/Feature/Api/RoleSeparationTest.php`.

---

### TDA-A03 — Créer `UserResource` pour masquer les données propriétaires

**Priorité** : P0 — **Type** : Security — **Effort** : 2 h

**Contexte**
`@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Api/VehicleController.php:115` et `PropertyController.php:132` chargent la relation `owner` et exposent email, téléphone, adresse, ville de l'utilisateur à toute personne non authentifiée.

**Solution**

Créer `app/Http/Resources/PublicOwnerResource.php` :

```php
class PublicOwnerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
        ];
    }
}
```

Dans les `show()` des routes publiques, encapsuler :

```php
return response()->json([
    'data' => [
        ...$vehicle->toArray(),
        'owner' => new PublicOwnerResource($vehicle->owner),
    ],
]);
```

**Alternative pragmatique** : ne pas charger `owner` du tout sur `Api\VehicleController::show` et `Api\PropertyController::show`. C'est **la solution recommandée** tant que l'UI mobile n'a pas besoin du propriétaire.

**Critères d'acceptation**

- `GET /api/vehicles/{id}` ne retourne ni `email`, ni `phone`, ni `address`, ni `city`, ni `role` de l'owner.
- Tests de non-régression sur la structure de réponse.

**Test** : `tests/Feature/Api/PublicExposureTest.php` — asserte `assertJsonMissingPath('data.owner.email')`.

**Impact mobile** : ⚠️ Rachid à notifier si la vue détail affiche actuellement les coords du propriétaire.

---

### TDA-A04 — Rate-limiting sur routes mutantes API

**Priorité** : P0 — **Type** : Security — **Effort** : 1 h

**Contexte**
Seul `auth/*` est throttlé. Un client peut spammer `POST /api/bookings`, `POST /api/appointments`, `POST /api/favorites/toggle`, etc.

**Solution**

Dans `@d:/Mes_Projets/tda-holding-api/routes/api.php`, envelopper les routes sensibles :

```php
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // routes actuelles
});

// Plus strict sur création
Route::middleware(['auth:sanctum', 'throttle:10,1'])->group(function () {
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::post('/media/upload', [MediaController::class, 'upload']);
});
```

Préférer définir des limiters nommés dans `AppServiceProvider::boot()` via `RateLimiter::for('create-booking', ...)` pour la lisibilité.

**Critères d'acceptation**

- Le 11e POST `/api/bookings` en moins d'une minute retourne 429.

**Test** : `tests/Feature/Api/RateLimitTest.php`.

---

## Epic B — BookingWorkflow unifié (ADR-009)

> **Objectif** : éliminer la duplication Api/Admin et les divergences qu'elle génère. Livre un ADR-009 et un service de domaine testable isolément.

### TDA-B01 — Créer `App\Services\BookingWorkflow`

**Priorité** : P1 — **Type** : Refactor — **Effort** : 2 jours

**Contexte**
`Api\BookingController` et `Admin\BookingController` implémentent chacun `confirm/cancel/complete/reject`. Ils ont déjà divergé :

- génération auto de `Transaction` présente côté Admin (`@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Admin/BookingController.php:73-83`), absente côté API ;
- mise à jour de `is_available` sur Property côté Admin, absente côté API.

**Solution**

Créer `app/Services/BookingWorkflow.php` qui encapsule les transitions et leurs effets de bord :

```php
class BookingWorkflow
{
    public function __construct(private NotificationDispatcher $notifier) {}

    public function confirm(Booking $booking, User $admin): Booking
    {
        if (!$booking->isPending()) {
            throw new InvalidBookingTransitionException('Cette réservation ne peut pas être confirmée.');
        }

        DB::transaction(function () use ($booking, $admin) {
            $booking->confirm($admin->id);
            $this->lockBookable($booking);
            $this->lockDriver($booking);
            $this->ensurePendingTransaction($booking);
        });

        $booking->user?->notify(new BookingConfirmed($booking));

        return $booking->fresh()->load(['bookable', 'driver']);
    }

    public function cancel(Booking $booking, ?string $reason, User $actor): Booking { /* ... */ }
    public function complete(Booking $booking): Booking { /* ... */ }
    public function reject(Booking $booking, string $reason, User $admin): Booking { /* ... */ }

    private function lockBookable(Booking $booking): void { /* Vehicle::markAsRented, Property::markAsRented */ }
    private function lockDriver(Booking $booking): void { /* ... */ }
    private function ensurePendingTransaction(Booking $booking): void { /* logique actuelle de Admin */ }
}

final class InvalidBookingTransitionException extends DomainException {}
```

**Refactor des contrôleurs**

Api\BookingController et Admin\BookingController deviennent de simples orchestrateurs HTTP :

```php
public function confirm(Booking $booking, Request $request, BookingWorkflow $workflow): JsonResponse
{
    $this->authorize('confirm', $booking);
    $booking = $workflow->confirm($booking, $request->user());

    return response()->json(['message' => 'Réservation confirmée.', 'booking' => $booking]);
}
```

**Critères d'acceptation**

- Une confirmation via `/api/bookings/{id}/confirm` crée la transaction pending comme côté web.
- Une confirmation via les deux canaux produit **exactement le même état final** en DB (diff test).
- Les contrôleurs `Api\BookingController` et `Admin\BookingController` ne contiennent plus de règles métier, uniquement HTTP ↔ service.
- Toutes les transitions sont **atomiques** (DB transaction).

**Tests**

- `tests/Unit/Services/BookingWorkflowTest.php` : isolé, couvre les transitions d'état et les exceptions.
- `tests/Feature/Api/BookingLifecycleTest.php` : scénario end-to-end client + admin.

---

### TDA-B02 — Ajouter `markAsRented / markAsAvailable / markAsSold` à `Property`

**Priorité** : P1 — **Type** : Refactor — **Effort** : 1 h

**Contexte**
Asymétrie avec `Vehicle` (`@d:/Mes_Projets/tda-holding-api/app/Models/Vehicle.php:117-125`). L'API Booking met seulement `status='rented'` pour Property mais pas `is_available = false`.

**Solution**

Ajouter dans `@d:/Mes_Projets/tda-holding-api/app/Models/Property.php` :

```php
public function markAsRented(): void
{
    $this->update(['status' => 'rented', 'is_available' => false]);
}

public function markAsSold(): void
{
    $this->update(['status' => 'sold', 'is_available' => false]);
}

public function markAsAvailable(): void
{
    $this->update(['status' => 'available', 'is_available' => true]);
}
```

Utiliser ces méthodes dans `BookingWorkflow` (TDA-B01).

**Critères d'acceptation**

- `grep "status.*=.*rented" app/` ne trouve plus de chaîne littérale hors modèle/migration.
- `Property::$is_available` est **toujours** cohérent avec `status` après toute transition.

---

### TDA-B03 — Corriger la vérification d'overlap (inclure `in_progress`)

**Priorité** : P1 — **Type** : Bug — **Effort** : 15 min

**Contexte**
`@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Api/BookingController.php:86` :

```php
->whereIn('status', ['pending', 'confirmed'])
```

Ne bloque pas les réservations en cours → double-booking possible pendant la location active.

**Solution**

```php
->whereIn('status', ['pending', 'confirmed', 'in_progress'])
```

À déplacer dans `BookingWorkflow::hasOverlap()` au passage (TDA-B01).

**Test** : `tests/Feature/Api/BookingOverlapTest.php` — créer booking `in_progress`, tenter nouveau booking chevauchant, asserter 422.

---

### TDA-B04 — Valider `offer_type` à la création d'un booking

**Priorité** : P1 — **Type** : Bug — **Effort** : 30 min

**Contexte**
Un véhicule `offer_type=sale` peut être « réservé en location » (règle D2 violée).

**Solution**

Dans `BookingWorkflow::create()` (ou le FormRequest de création — voir TDA-C02) :

```php
if (!in_array($bookable->offer_type, ['rent', 'both'], true)) {
    throw new InvalidBookingTransitionException("Ce bien n'est pas disponible à la location.");
}
```

**Critères d'acceptation**

- Réserver un vehicle `offer_type=sale` → 422 avec message clair.
- Un vehicle `offer_type=both` reste réservable.

---

## Epic C — Hygiène structurelle (ADR-011)

> **Objectif** : aligner le code sur les bonnes pratiques Laravel 11+ (FormRequests, morph map) et préparer le multi-vendeurs.

### TDA-C01 — Enregistrer la morph map

**Priorité** : P2 — **Type** : Refactor — **Effort** : 3 h (incl. migration de reprise)

**Contexte**
Les colonnes `bookable_type`, `favorable_type`, `mediable_type` stockent des classes complètes (`App\Models\Vehicle`). Couplage au namespace → refactor catastrophique.

**Solution**

1. Dans `@d:/Mes_Projets/tda-holding-api/app/Providers/AppServiceProvider.php::boot()` :

```php
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::enforceMorphMap([
    'vehicle' => \App\Models\Vehicle::class,
    'property' => \App\Models\Property::class,
]);
```

2. Migration de reprise des données existantes :

```php
// database/migrations/2026_04_18_000001_migrate_morph_types_to_aliases.php
DB::table('bookings')->where('bookable_type', 'App\\Models\\Vehicle')->update(['bookable_type' => 'vehicle']);
DB::table('bookings')->where('bookable_type', 'App\\Models\\Property')->update(['bookable_type' => 'property']);
DB::table('favorites')->where('favorable_type', 'App\\Models\\Vehicle')->update(['favorable_type' => 'vehicle']);
// idem favorable_type property, mediable_type vehicle/property
```

3. Aligner les contrôleurs qui recevaient `bookable_type=vehicle` de la mobile et le traduisaient via un `$morphMap` local → désormais **inutile**, stocker directement la valeur reçue.

**Critères d'acceptation**

- `SELECT DISTINCT bookable_type FROM bookings` → `vehicle`, `property` uniquement.
- Tests existants passent.
- Le dev mobile n'a pas à changer son payload (il envoyait déjà `vehicle`/`property`).

**Impact mobile** : 0 si l'API renvoie toujours `vehicle`/`property` dans ses réponses. ⚠️ À vérifier sur `GET /api/bookings` — le front iOS/Android doit peut-être s'adapter si les types passaient par là.

---

### TDA-C02 — Introduire les `FormRequest`

**Priorité** : P2 — **Type** : Refactor — **Effort** : 1 jour

**Contexte**
Validation dupliquée entre Api et Admin, divergences constatées (ex. règles véhicule différentes sur `mimes:heic`).

**Livrables**

Pour chaque ressource CRUD, créer deux FormRequests dans `app/Http/Requests/` :

```
Vehicle/StoreVehicleRequest.php
Vehicle/UpdateVehicleRequest.php
Property/Store... Update...
Booking/StoreBookingRequest.php
Appointment/Store... Cancel...
Transaction/StoreTransactionRequest.php
Driver/Store... Update...
Category/Store... Update...
Media/UploadMediaRequest.php
```

**Règle** : une seule source de vérité par ressource, partagée entre Api\* et Admin\* contrôleurs.

**Critères d'acceptation**

- `grep "validate(\[" app/Http/Controllers` → 0 résultat.
- Chaque action mutante référence un FormRequest.
- Les règles d'autorisation dans `FormRequest::authorize()` sont déléguées au Policy (`return $this->user()->can('create', Vehicle::class);`).

---

### TDA-C03 — `RoleMiddleware` : répondre selon le contexte (web vs API)

**Priorité** : P1 — **Type** : Bug — **Effort** : 30 min

**Contexte**
Le middleware renvoie du JSON sur routes web Inertia, cassant l'UX.

**Fichier** : `@d:/Mes_Projets/tda-holding-api/app/Http/Middleware/RoleMiddleware.php:11-20`

**Solution**

```php
public function handle(Request $request, Closure $next, string ...$roles): Response
{
    if (!$request->user() || !in_array($request->user()->role, $roles, true)) {
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }
        abort(403, 'Accès non autorisé.');
    }

    return $next($request);
}
```

**Critères d'acceptation**

- Client non-admin accédant à `/admin/dashboard` → page d'erreur 403 Laravel (HTML).
- Client non-admin accédant à `/api/admin/...` → JSON 403.

---

### TDA-C04 — Remplacer `ilike` par un équivalent cross-DB

**Priorité** : P2 — **Type** : Bug — **Effort** : 1 h

**Contexte**
`ilike` est PostgreSQL-only. En SQLite (dev), les recherches admin plantent.

**Fichiers** : chercher via `grep -rn "'ilike'" app/Http/Controllers/Admin` — touche 5 contrôleurs.

**Solution**

Créer un macro Eloquent ou un helper :

```php
// app/Support/QueryHelpers.php
function whereILike(Builder $query, string $column, string $value): Builder
{
    return $query->whereRaw("LOWER({$column}) LIKE ?", ['%'.strtolower($value).'%']);
}
```

Ou mieux, un scope local sur chaque modèle concerné. Remplacer chaque `->where('col', 'ilike', "%{$s}%")` par cet appel.

**Critères d'acceptation**

- Les recherches admin fonctionnent identiquement sur SQLite et PostgreSQL.
- Tests d'intégration sur SQLite passent (CI).

---

## Epic D — Cohérence métier & API

### TDA-D01 — Booking API expose Transaction auto après confirmation

*Traité par TDA-B01 (BookingWorkflow).*

### TDA-D02 — Normaliser `Property.status` — ajouter `maintenance`

**Priorité** : P2 — **Type** : Enhancement — **Effort** : 45 min

**Solution**

Nouvelle migration `add_maintenance_status_to_properties_table` :

```php
// PostgreSQL : recréer la contrainte check
DB::statement("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check");
DB::statement("ALTER TABLE properties ADD CONSTRAINT properties_status_check CHECK (status IN ('available','rented','sold','unavailable','maintenance'))");
```

Ajouter les validations correspondantes dans `UpdatePropertyRequest`.

---

### TDA-D03 — Clarifier `Appointment.created_by` → `confirmed_by`

**Priorité** : P1 — **Type** : Refactor — **Effort** : 2 h

**Contexte**
`@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Admin/AppointmentController.php:53` écrase `created_by` à **chaque** update. La relation s'appelle `confirmedBy()` mais pointe sur `created_by`. Sémantique cassée.

**Solution**

1. Nouvelle migration `add_confirmed_fields_to_appointments_table` qui ajoute `confirmed_by` (foreignId nullable) et `confirmed_at` (timestamp nullable).
2. Conserver `created_by` uniquement pour auditer qui a créé le RDV (admin qui a saisi pour un client, ou null si client en self-service).
3. Mettre à jour la relation `confirmedBy()` pour pointer vers `confirmed_by` :

```php
public function confirmedBy()
{
    return $this->belongsTo(User::class, 'confirmed_by');
}
```

4. Dans `Admin\AppointmentController::update`, n'assigner `confirmed_by` + `confirmed_at` que si la transition passe à `confirmed` :

```php
if ($validated['status'] === 'confirmed' && $appointment->status !== 'confirmed') {
    $validated['confirmed_by'] = $request->user()->id;
    $validated['confirmed_at'] = now();
}
```

**Critères d'acceptation**

- Modifier les `admin_notes` sans changer le statut **ne modifie pas** `confirmed_by`.
- Passage à `confirmed` affecte les deux champs une seule fois.
- La relation `confirmedBy()` retourne bien l'admin ayant confirmé.

---

### TDA-D04 — Appointment : rendre `email` optionnel si téléphone présent

**Priorité** : P2 — **Type** : Bug — **Effort** : 20 min

**Contexte**
Contradiction avec D3 (inscription téléphone OU email). Un client « téléphone only » ne peut pas créer de RDV.

**Fichier** : `@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Api/AppointmentController.php:29-30`

**Solution**

```php
'phone' => 'nullable|string|max:20|required_without:email',
'email' => 'nullable|email|required_without:phone',
```

Ne pas oublier la migration `appointments` : rendre `phone` et `email` nullables.

---

### TDA-D05 — Ajouter un index composite sur `bookings`

**Priorité** : P2 — **Type** : Performance — **Effort** : 20 min

**Contexte**
Overlap check scanne bookable + status + dates. Dette notée dans ADR-005, à réaliser avant Phase 5.

**Solution** — nouvelle migration :

```php
Schema::table('bookings', function (Blueprint $table) {
    $table->index(['bookable_type', 'bookable_id', 'status', 'start_date', 'end_date'], 'bookings_overlap_idx');
});
```

---

### TDA-D06 — `AuthController::updateProfile` : verrouiller explicitement role/is_active via FormRequest

**Priorité** : P3 — **Type** : Security (défense en profondeur) — **Effort** : 15 min (inclus dans TDA-C02)

Intégré au `UpdateProfileRequest`. Ne pas lister `role` ni `is_active` dans les champs autorisés. Documenter explicitement dans le PHPDoc.

---

## Epic E — Dette technique

### TDA-E01 — Transaction : nettoyer enum `status`

**Priorité** : P3 — **Effort** : 30 min

Décider entre deux options :

- **A. Retirer** `refunded` et `failed` tant que les flows ne sont pas implémentés.
- **B. Implémenter** a minima les méthodes `Transaction::markAsFailed()` / `refund()` et les routes correspondantes.

Recommandation Winston : **option A** pour la Phase 4, réintroduire en Phase 6 avec le mobile money.

---

### TDA-E02 — Retirer le middleware `verified` tant que la vérification email n'est pas opérationnelle

**Priorité** : P3 — **Effort** : 30 min

Actuellement inutile (pas de mailer) et source de bug (TDA-Q04). Retirer de `routes/web.php` ligne 22 et de la route `/dashboard` ligne 80. Réintroduire uniquement quand le flow email est réellement brancher (phase 5+).

---

### TDA-E03 — `Vehicle::markAsRented` vs `markAsSold`

**Priorité** : P3 — **Effort** : 30 min

Symétrie avec Property (TDA-B02). Ajouter `Vehicle::markAsSold()` et utiliser dans `BookingWorkflow` selon `offer_type` du booking (quand le flow de vente aboutira).

---

## Stratégie de tests transverse

### Pyramide cible après remédiation

- **Unit** (50%) — Policies, Services (BookingWorkflow), helpers.
- **Feature** (45%) — parcours HTTP complets, authentifiés par rôle.
- **E2E** (5%) — déjà couvert par Playwright côté admin si présent ; sinon hors périmètre.

### Tests obligatoires à livrer

| Epic | Fichier de test | Scénarios |
|---|---|---|
| Q | `tests/Feature/Auth/*Test.php` | règles mot de passe, absence route register |
| A | `tests/Unit/Policies/*PolicyTest.php` | 3 rôles × 2 propriétés |
| A | `tests/Feature/Api/RoleSeparationTest.php` | agent interdit sur DELETE |
| A | `tests/Feature/Api/PublicExposureTest.php` | pas de fuite owner |
| B | `tests/Unit/Services/BookingWorkflowTest.php` | toutes transitions + erreurs |
| B | `tests/Feature/Api/BookingLifecycleTest.php` | scenario bout-en-bout |
| C | `tests/Feature/MorphMapTest.php` | types alias en DB |
| D | `tests/Feature/Api/AppointmentTest.php` | email OR phone, confirmed_by semantics |

### Commandes de référence

```bash
# Tout lancer
php artisan test

# Un epic
php artisan test --filter=BookingLifecycleTest

# Couverture
php artisan test --coverage --min=70
```

---

## Plan de release recommandé

> Proposition à valider avec Bob (Scrum Master) et Sarah (PO).

### Sprint 1 — Stabilisation (1 semaine)

- **Epic Q** en intégralité (4 tickets, ~1 jour cumulé)
- **TDA-C03** (role middleware)
- **TDA-B03** + **TDA-B04** (bugs overlap / offer_type)
- **TDA-D04** (appointment email optional)

**Livrable** : hotfix déployable, aucune régression fonctionnelle.

### Sprint 2 — Sécurité (2 semaines)

- **Epic A** en intégralité (A01 → A04)
- ADR-010 rédigé et mergé

**Livrable** : plateforme durcie, matrice RBAC documentée.

### Sprint 3 — Refactor (2 semaines)

- **Epic B** (BookingWorkflow)
- **Epic C** (FormRequests, morph map, ilike)
- ADR-009 et ADR-011 rédigés

**Livrable** : codebase alignée sur les bonnes pratiques Laravel 11+.

### Sprint 4 — Nettoyage (1 semaine, en parallèle des tests phase 4)

- **Epic D** restant (D02, D03, D05, D06)
- **Epic E** (dette technique)

**Livrable** : Phase 4 (tests & déploiement) peut se clôturer proprement, base saine pour Phase 5 (monétisation) et Phase 6 (multi-vendeurs).

---

## Contacts et validation

| Rôle | Agent | Responsabilité sur ce document |
|---|---|---|
| **Architecte** | Winston 🏛️ | Valide les ADR produits, revoit les PR Epic B et C |
| **Chef de projet** | Olivia 🎯 | Priorise et séquence les sprints |
| **Scrum Master** | Bob 🏃 | Découpe les epics en tickets JIRA/Linear |
| **Dev** | (à assigner) | Implémente, livre les tests, notifie le mobile |
| **Dev mobile** | Rachid 📱 | Vérifie l'impact sur le client Expo/RN |
| **QA** | — | Valide les critères d'acceptation |

**En cas d'ambiguïté** : ouvrir une question sur le ticket correspondant et m'escalader (Winston) avant d'implémenter.

*« Ship correct things slowly is faster than shipping broken things quickly. »*
— Winston 🏛️
