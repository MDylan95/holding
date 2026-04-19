# ADR-009 — BookingWorkflow unifié (service de domaine)

- **Date** : 2026-04-18
- **Statut** : Accepté
- **Auteur initial** : Winston 🏛️ (Architecte)
- **Implémentation** : Amelia 🎨💻 (Dev-Designer) — Sprint 3, Epic B
- **Tickets concernés** : TDA-B01, TDA-B02, TDA-D01 (traité par B01), TDA-E03

## Contexte

`Api\BookingController` et `Admin\BookingController` implémentaient **chacun** les transitions `confirm` / `cancel` / `complete` / `reject`. Les deux implémentations avaient déjà divergé :

| Effet | Api\BookingController | Admin\BookingController |
|---|:---:|:---:|
| `confirm` : verrouiller Vehicle (`markAsRented`) | ✅ | ✅ |
| `confirm` : verrouiller Property (`status='rented'`) | ✅ (oubliait `is_available=false`) | ✅ |
| `confirm` : créer Transaction pending auto | ❌ | ✅ |
| `confirm` : verrouiller driver | ✅ | ✅ |
| `complete` : libérer Property (`is_available=true`) | ❌ | ❌ (asymétrie) |
| `cancel` : libérer Property (`is_available=true`) | ❌ | ❌ |

Ces divergences généraient un état DB incohérent selon le canal utilisé, et le ticket TDA-D01 (API doit aussi créer la transaction) restait ouvert.

## Décision

### 1. Un service de domaine unique : `App\Services\BookingWorkflow`

Toutes les transitions d'état d'une `Booking` sont encapsulées dans une classe unique. Les deux contrôleurs (`Api\BookingController`, `Admin\BookingController`) deviennent de simples orchestrateurs HTTP :

```php
public function confirm(Booking $booking, Request $request, BookingWorkflow $workflow): JsonResponse
{
    $this->authorize('confirm', $booking);
    $booking = $workflow->confirm($booking, $request->user());

    return response()->json(['message' => 'Réservation confirmée.', 'booking' => $booking]);
}
```

### 2. Méthodes publiques du workflow

| Méthode | Pré-condition | Effets de bord |
|---|---|---|
| `confirm(Booking, User)` | `status=pending` | Lock bookable + lock driver + crée transaction pending + notifie client |
| `cancel(Booking, ?string reason, User actor)` | `status ∉ [completed, cancelled, rejected]` ; client ne peut pas annuler `in_progress` | Release bookable + release driver (si confirmé/en cours) + notifie client |
| `reject(Booking, string reason, User admin)` | `status=pending` | Marque rejected + notifie client |
| `start(Booking)` | `status=confirmed` | Transition `in_progress` |
| `complete(Booking)` | `status ∈ [confirmed, in_progress]` | Release bookable + release driver + notifie client |

### 3. `InvalidBookingTransitionException`

Toute violation de pré-condition lève `App\Exceptions\InvalidBookingTransitionException`. Elle se rend :
- **API** : 422 JSON avec `message` (grâce à sa méthode `render()`).
- **Web/Inertia** : l'exception remonte, capturée dans le contrôleur admin via `try/catch → back()->with('error', ...)`.

### 4. Atomicité

Chaque transition est enveloppée dans `DB::transaction(...)`. Les effets de bord (update booking + bookable + driver + create transaction) sont soit tous appliqués, soit aucun.

### 5. Symétrie Vehicle ↔ Property (TDA-B02, TDA-E03)

Les deux modèles exposent désormais la même API de transition :

```php
$bookable->markAsRented();      // status=rented, is_available=false
$bookable->markAsSold();        // status=sold, is_available=false  (TDA-B02/E03)
$bookable->markAsAvailable();   // status=available, is_available=true
```

Le workflow ne teste plus `instanceof` pour deux cas, il appelle juste la méthode polymorphe.

### 6. Création auto de la Transaction (TDA-D01 clos)

`ensurePendingTransaction()` est appelée **dans `confirm()`**, donc les deux canaux API et web génèrent désormais la transaction pending automatiquement — pas de duplication si une transaction existe déjà.

## Conséquences

### Positives

- **Plus de divergence** : un seul code-path pour les transitions. `BookingLifecycleTest` vérifie que l'état DB final est identique quel que soit le canal.
- **Testable unitairement** : `tests/Unit/Services/BookingWorkflowTest.php` couvre 14 scénarios sans faire d'HTTP.
- **Atomicité garantie** : fini les états intermédiaires en cas d'erreur de notif.
- **Ajout de futures transitions** (par ex. `start`, symétrie Property `sale`) : 1 seul endroit à éditer.

### Négatives / compromis

- `Api\BookingController::store` **reste** hors du service (grosse méthode de ~100 lignes avec validation, overlap check, calcul de prix, création). Winston et Amelia jugent que son extraction n'était pas couverte par le périmètre du ticket B01 (scope : transitions uniquement). À traiter si `Admin\BookingController::store` est ajouté plus tard et diverge.
- Le workflow dépend encore de `DB`, `Notifications` et des modèles concrets — injection explicite possible en Phase 6 si besoin de mocks fins.

## Critères d'acceptation validés

- [x] Une confirmation via `/api/bookings/{id}/confirm` crée la transaction pending comme côté web.
- [x] Confirmation via les deux canaux → **exactement le même état final** en DB (vérifié par `BookingLifecycleTest`).
- [x] `Api\BookingController` et `Admin\BookingController` ne contiennent plus de règles métier — uniquement HTTP ↔ service.
- [x] Toutes les transitions sont atomiques (`DB::transaction`).
- [x] `grep "status.*=.*rented" app/Http/Controllers` → 0 résultat (via `markAsRented()`).
- [x] `Property.is_available` toujours cohérent avec `status` après toute transition.
- [x] Tests : 14 unit + 6 feature lifecycle passent.

## Références

- `@d:/Mes_Projets/tda-holding-api/app/Services/BookingWorkflow.php`
- `@d:/Mes_Projets/tda-holding-api/app/Exceptions/InvalidBookingTransitionException.php`
- `@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Api/BookingController.php`
- `@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Admin/BookingController.php`
- `@d:/Mes_Projets/tda-holding-api/app/Models/Property.php:120-136`
- `@d:/Mes_Projets/tda-holding-api/app/Models/Vehicle.php:117-133`
- `@d:/Mes_Projets/tda-holding-api/tests/Unit/Services/BookingWorkflowTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Api/BookingLifecycleTest.php`
- `@d:/Mes_Projets/tda-holding-api/audit-remediation-guide.md` — guide Winston
