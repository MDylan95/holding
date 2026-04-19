# ADR-011 — Hygiène structurelle (Morph map, FormRequests, QueryHelpers)

- **Date** : 2026-04-19
- **Statut** : Accepté
- **Auteur initial** : Winston 🏛️ (Architecte)
- **Implémentation** : Amelia 🎨💻 (Dev-Designer) — Sprint 3, Epic C
- **Tickets concernés** : TDA-C01, TDA-C02, TDA-C04

## Contexte

Trois dettes d'hygiène mineures mais invasives, identifiées lors de l'audit 18/04/2026 :

1. **TDA-C01 — Couplage morph ↔ namespace `App\Models`**
   Les colonnes `bookable_type`, `favorable_type`, `mediable_type` stockaient le FQCN (`App\Models\Vehicle`). Tout renommage / déplacement de classe devenait un breaking change DB. Les réponses JSON de l'API fuitaient aussi l'architecture PHP vers le mobile.

2. **TDA-C02 — Validation inline répétée et dupliquée**
   `Api\VehicleController`, `Api\PropertyController`, `Api\DriverController` contenaient chacun ~25 lignes de `$request->validate([...])` en `store()` et ~25 lignes quasi-identiques en `update()`. Risque de divergence + impossible à tester unitairement.

3. **TDA-C04 — `ilike` PostgreSQL-only**
   5 contrôleurs Admin utilisaient `$q->where('brand', 'ilike', "%…%")`. Fonctionnel en PostgreSQL (prod) mais plante silencieusement en SQLite (dev/CI), empêchant les tests de recherche admin.

## Décision

### 1. Morph map non-stricte (TDA-C01)

Enregistrer une morph map dans `AppServiceProvider::configureMorphMap()` via `Relation::morphMap([...])` (non-strict) :

```php
Relation::morphMap([
    'vehicle' => \App\Models\Vehicle::class,
    'property' => \App\Models\Property::class,
]);
```

**Pourquoi non-strict (`morphMap` vs `enforceMorphMap`)** : le système de notifications Laravel stocke `notifiable_type = 'App\Models\User'` en FQCN dans `notifications`. Activer `enforceMorphMap` casse la lecture de ces notifications. Le mode non-strict autorise les deux formats tout en garantissant que toute écriture via une relation (`$vehicle->bookings()->create(...)`) utilise l'alias.

**Règle d'écriture** : tous les contrôleurs (`Api\BookingController`, `Api\FavoriteController`, `Api\MediaController`, `Admin\VehicleController`, `Admin\PropertyController`) stockent désormais directement la chaîne d'alias (`'vehicle'` / `'property'`), pas `Vehicle::class`.

**Lecture** : la résolution alias → classe passe par `Relation::getMorphedModel('vehicle')`.

**Migration de reprise** : `2026_04_18_240000_migrate_morph_types_to_aliases.php` convertit les données existantes `'App\Models\Vehicle'` → `'vehicle'` sur 3 tables (`bookings`, `favorites`, `media`). Migration réversible.

### 2. FormRequests pour les ressources CRUD volumineuses (TDA-C02)

6 FormRequests créés, un par action × ressource :

```
app/Http/Requests/
  Vehicle/StoreVehicleRequest.php + UpdateVehicleRequest.php
  Property/StorePropertyRequest.php + UpdatePropertyRequest.php
  Driver/StoreDriverRequest.php + UpdateDriverRequest.php
```

**Pattern** :
- `authorize()` délègue à la policy (`$this->user()->can('create', Vehicle::class)`).
- `rules()` contient les règles de validation, avec accès à `$this->route('vehicle')` pour les règles `unique:...,id`.

Les `Api\*Controller::store()` et `update()` deviennent minimalistes :

```php
public function store(StoreVehicleRequest $request): JsonResponse
{
    $validated = $request->validated();
    $validated['owner_id'] = $request->user()->id;

    $vehicle = Vehicle::create($validated);
    return response()->json(['data' => $vehicle], 201);
}
```

Les autres ressources (Category, Media, Favorite, Booking, Transaction, Appointment) conservent leur validation inline car soit :
- Les règles sont très courtes (3–5 champs).
- La validation est couplée à de la logique métier (ex. Booking `store` avec overlap check).

### 3. `QueryHelpers::whereILike` cross-DB (TDA-C04)

Helper statique dans `App\Support\QueryHelpers` :

```php
public static function whereILike(Builder $query, string $column, string $value): Builder
{
    return $query->whereRaw("LOWER({$column}) LIKE ?", ['%' . mb_strtolower($value) . '%']);
}
```

Appliqué aux 5 contrôleurs Admin qui faisaient `ilike`. `$column` n'est JAMAIS un input user (contrôlé par l'appelant) → pas d'injection SQL via `whereRaw`.

## Conséquences

### Positives

- **Renommage futur `Vehicle` → `Car` sans impact DB** (seul le mapping AppServiceProvider change).
- **API stable côté mobile** : `GET /api/bookings` retourne désormais `bookable_type: 'vehicle'` (plus facile à typer côté Flutter, pas de fuite d'architecture PHP).
- **Validation testable** : `FormRequestsTest` vérifie les règles sans avoir à traverser le contrôleur complet.
- **Tests admin jouables en SQLite** : la suite complète peut tourner en CI sans PostgreSQL.
- Aucune fuite SQL : `whereRaw` avec placeholder `?` et bindings paramétrisés.

### Négatives / compromis

- **Coexistence alias + FQCN transitoire** : tant qu'on reste en non-strict, du code pourrait encore écrire `'App\Models\Vehicle'` et cela ne lèverait pas d'erreur. Atténué par la migration de reprise + grep vérifié.
- 6 nouveaux fichiers FormRequest : petite augmentation du nombre de classes, mais gain clair en testabilité et DRY.
- `whereRaw("LOWER(...)")` n'utilise pas d'index. Acceptable sur volumes admin (~100–10 000 lignes). À surveiller si volumétrie > 100k — à ce moment, index fonctionnel PostgreSQL `CREATE INDEX ... ON table (LOWER(col))`.

### Impact mobile (à signaler à Rachid 📱)

**Breaking change potentiel** :
- `GET /api/bookings` → la clé `bookable_type` retourne maintenant `"vehicle"` au lieu de `"App\\Models\\Vehicle"`.
- Idem pour `favorable_type` sur `GET /api/favorites` et `mediable_type` sur Media.

Action : si le code Flutter comparait `booking.bookableType == 'App\Models\Vehicle'`, il doit maintenant comparer à `'vehicle'`. Recommandation : typer avec un enum Dart `BookableType { vehicle, property }`.

## Alternatives considérées

- **`enforceMorphMap` (strict)** — rejeté : casse les notifications Laravel (voir section Décision §1).
- **FormRequests partout** (incluant Category, Booking `store`, etc.) — rejeté : coût ROI faible pour ressources à validation minimale. Revisitable si nouveaux champs ajoutés.
- **Rendre `whereILike` une macro sur `Builder`** — rejeté : plus "magique", moins greppable. Classe statique explicite préférée.

## Critères d'acceptation validés

- [x] `grep "App\\\\Models\\\\Vehicle" app/Http/Controllers` → 0 résultat dans les morph types.
- [x] `grep "'ilike'" app/` → 0 résultat.
- [x] `Relation::getMorphedModel('vehicle')` retourne `Vehicle::class`.
- [x] Réponse `GET /api/bookings` contient `bookable_type: 'vehicle'` (vérifié par `MorphMapTest::test_booking_store_persists_alias_not_fqcn`).
- [x] 6 FormRequests créés, authorize+rules délégués aux policies.
- [x] `Api\VehicleController`, `Api\PropertyController`, `Api\DriverController` : plus de `$request->validate([...])` dans `store`/`update`.
- [x] Tests recherche admin passent en SQLite (via QueryHelpers).
- [x] Migration de reprise data fournie et réversible.
- [x] 68 tests verts (tous Sprint 1 + 2 + 3).

## Références

- `@d:/Mes_Projets/tda-holding-api/app/Providers/AppServiceProvider.php:38-46` — morph map
- `@d:/Mes_Projets/tda-holding-api/database/migrations/2026_04_18_240000_migrate_morph_types_to_aliases.php`
- `@d:/Mes_Projets/tda-holding-api/app/Http/Requests/Vehicle/` — FormRequests Vehicle
- `@d:/Mes_Projets/tda-holding-api/app/Http/Requests/Property/` — FormRequests Property
- `@d:/Mes_Projets/tda-holding-api/app/Http/Requests/Driver/` — FormRequests Driver
- `@d:/Mes_Projets/tda-holding-api/app/Support/QueryHelpers.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/MorphMapTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Api/FormRequestsTest.php`
- `@d:/Mes_Projets/tda-holding-api/audit-remediation-guide.md` — guide Winston
