# ADR-010 — Autorisation par Policies + séparation `super_admin` / `agent`

- **Date** : 2026-04-18
- **Statut** : Accepté
- **Auteur initial** : Winston 🏛️ (Architecte)
- **Implémentation** : Amelia 🎨💻 (Dev-Designer) — Sprint 2, Epic A
- **Tickets concernés** : TDA-A01, TDA-A02, TDA-A03, TDA-A04

## Contexte

L'audit structurel du 18/04/2026 a identifié 4 findings P0 sur l'autorisation :

1. **TDA-A01** — Une seule policy (`AppointmentPolicy`) dans un projet comptant 10 ressources. Les contrôleurs faisaient du `if ($user->isClient() && ...)` inline, dupliqué et divergent (`Api\BookingController::show` vs `cancel`).
2. **TDA-A02** — Le middleware `role:super_admin,agent` traitait les deux rôles comme interchangeables. Un agent pouvait supprimer n'importe quelle catégorie, véhicule, bien ou transaction. Violation du principe de moindre privilège.
3. **TDA-A03** — Les routes publiques `GET /api/vehicles/{id}` et `GET /api/properties/{id}` chargeaient la relation `owner` et exposaient `email`, `phone`, `address`, `city`, `role` à tout visiteur non authentifié.
4. **TDA-A04** — Seules les routes `auth/*` étaient throttlées. Un client pouvait spammer `POST /api/bookings`, `/api/appointments`, `/api/favorites/toggle`.

## Décision

### 1. Autorisation centralisée par **Policies**

Toute règle d'accès à une ressource est encapsulée dans une classe `App\Policies\{Model}Policy`. Les contrôleurs appellent `$this->authorize($ability, $model)` ; plus aucune vérification RBAC n'est inline dans un contrôleur.

**Pattern uniformisé** :

```php
public function before(User $user, string $ability): ?bool
{
    return $user->isSuperAdmin() ? true : null;
}
```

Le `before()` rend `super_admin` omnipotent par défaut, à deux exceptions explicites documentées ci-dessous.

### 2. Matrice de rôles formelle (TDA-A02)

| Action | `client` | `agent` | `super_admin` |
|---|:---:|:---:|:---:|
| Lire ses propres bookings / transactions / appointments | ✅ | ✅ | ✅ |
| Lire **tous** les bookings / transactions | ❌ | ✅ | ✅ |
| Créer booking / appointment / favorite | ✅ | ✅ | ✅ |
| Annuler sa propre ressource | ✅ | ✅ | ✅ |
| Confirmer / rejeter / démarrer / compléter un booking | ❌ | ✅ | ✅ |
| Confirmer / compléter une transaction | ❌ | ✅ | ✅ |
| Créer / mettre à jour vehicle / property / driver | ❌ | ✅ | ✅ |
| Upload / delete / set primary media | ❌ | ✅ | ✅ |
| **Supprimer** vehicle / property / driver / transaction | ❌ | ❌ | ✅ |
| **CRUD complet** catégorie | ❌ | ❌ | ✅ |
| Activer / désactiver un client | ❌ | ❌ | ✅ |
| Modifier / désactiver un autre administrateur | ❌ | ❌ | ❌ |

### 3. Exceptions au `before()` — règles de sécurité inviolables

Deux policies **n'utilisent pas** le court-circuit `super_admin = true` :

- **`UserPolicy::toggleStatus`** — un super_admin ne peut JAMAIS toggle un autre admin (super_admin ou agent), ni se désactiver lui-même. Règle encapsulée explicitement dans la méthode.
- **`TransactionPolicy::delete` / `VehiclePolicy::delete` / `PropertyPolicy::delete` / `DriverPolicy::delete`** — retournent `false` pour tous (y compris agents). Seul le `before()` super_admin les autorise.

### 4. Masquer les PII sur les routes publiques (TDA-A03)

Solution **pragmatique retenue** (alternative mentionnée par Winston) : ne **pas** charger la relation `owner` sur `Api\VehicleController::show` et `Api\PropertyController::show` tant que l'UI mobile n'en a pas besoin. Plus simple et plus sûr qu'un `PublicOwnerResource` qu'on pourrait oublier de câbler.

Si besoin futur (contact vendeur public) : réintroduire via `PublicOwnerResource` ne renvoyant que `{ id, first_name }`.

### 5. Rate limiters nommés (TDA-A04)

Deux limiters enregistrés dans `AppServiceProvider::configureRateLimiting()` :

- **`api-authenticated`** — 60 req/min par `user_id` — appliqué globalement au groupe authentifié.
- **`api-create`** — 10 req/min par `user_id` — appliqué sur les créations sensibles : `POST /bookings`, `/appointments`, `/favorites/toggle`, `/transactions`, `/media/upload`.

Les routes publiques `auth/*` conservent `throttle:10,1` par IP.

### 6. Séparation stricte des routes (TDA-A02)

`routes/api.php` est restructuré en trois niveaux :

```
middleware('auth:sanctum', 'throttle:api-authenticated')
├── actions client (lecture, cancel own, etc.)
├── middleware('throttle:api-create')
│     └── créations sensibles (booking, appointment, favorite)
├── middleware('role:super_admin,agent')
│     └── CRUD partagé + workflow booking/transaction + media
└── middleware('role:super_admin')
      └── DELETE vehicle/property/driver/transaction
          + CRUD catégories
```

## Conséquences

### Positives

- Plus de duplication d'autorisation entre `Api\*` et `Admin\*` contrôleurs.
- Matrice RBAC documentée et **testable unitairement** (`tests/Unit/Policies/`).
- Un agent ne peut plus effacer accidentellement (ou malicieusement) de véhicules / transactions.
- Pas de fuite de PII sur le catalogue public.
- Protection contre le spam applicatif (rate-limiting adapté à chaque type d'action).

### Négatives / compromis

- Deux niveaux de protection (middleware `role:` + policy) sur les routes admin — redondance volontaire pour défense en profondeur.
- Ajout d'une complexité : tout nouveau controller doit déclarer ses `$this->authorize()` ; les oublis sont repérés via les tests de role separation.

### Impact mobile (à notifier à Rachid 📱)

- **TDA-A03** : si l'écran "détail véhicule / bien" affichait `owner.email` ou `owner.phone`, il ne les recevra plus. Basculer vers un bouton "Demander un rendez-vous" (déjà branché).
- **TDA-A04** : le 11ᵉ `POST /bookings` (ou autre création sensible) en moins d'une minute renverra `429 Too Many Requests`. Le mobile doit gérer ce code (message + cooldown UI).
- Sinon : aucun changement de shape API.

## Alternatives considérées

- **Spatie Laravel-Permission** — rejeté : 3 rôles seulement, pas besoin d'un package complet + permissions granulaires ; les policies Laravel natives suffisent et restent explicites.
- **Gate::define() dans un ServiceProvider** — rejeté : moins organisé que les Policies (une classe par modèle) ; plus dur à tester unitairement.
- **`PublicOwnerResource` (alternative guide)** — noté comme possible si besoin futur (vendor contact) ; pour l'instant on retire `owner` du load.

## Critères d'acceptation validés

- [x] 9 policies créées (`Booking`, `Transaction`, `Vehicle`, `Property`, `Driver`, `Favorite`, `Media`, `User`, `Category`).
- [x] `grep -r "isClient() &&" app/Http/Controllers` → 0 résultat.
- [x] `grep -r "isAdmin()" app/Http/Controllers` → 1 résultat métier (workflow booking in_progress), pas RBAC.
- [x] Un agent reçoit 403 sur `DELETE /api/vehicles/{id}` ; super_admin reçoit 200.
- [x] `GET /api/vehicles/{id}` ne retourne ni email, phone, address, city de l'owner.
- [x] Le 11e `POST /api/bookings` en 60s retourne 429.
- [x] Couverture tests : 22 tests Epic A + 17 tests Sprint 1 passent.

## Références

- `@d:/Mes_Projets/tda-holding-api/app/Policies/` — 9 policies
- `@d:/Mes_Projets/tda-holding-api/app/Providers/AppServiceProvider.php:34-45` — rate limiters
- `@d:/Mes_Projets/tda-holding-api/routes/api.php` — séparation super_admin/agent
- `@d:/Mes_Projets/tda-holding-api/tests/Unit/Policies/` — tests unitaires
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Api/RoleSeparationTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Api/PublicExposureTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Api/RateLimitTest.php`
- `@d:/Mes_Projets/tda-holding-api/audit-remediation-guide.md` — guide Winston
