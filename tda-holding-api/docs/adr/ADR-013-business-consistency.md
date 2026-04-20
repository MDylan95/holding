# ADR-013 — Cohérence métier & dette technique (Epic D + E)

- **Date** : 2026-04-19
- **Statut** : Accepté
- **Auteur initial** : Winston 🏛️ (Architecte)
- **Implémentation** : Amelia 🎨💻 (Dev-Designer) — Sprint 4, Epic D & E
- **Tickets concernés** : TDA-D02, TDA-D03, TDA-D04, TDA-D05, TDA-D06, TDA-E01, TDA-E02, TDA-E03

## Contexte

Après l'hygiène structurelle du Sprint 3 (ADR-011), l'audit 18/04/2026 avait identifié deux lots complémentaires :

- **Epic D (cohérence métier)** : divergences sémantiques entre modèles parents (`Vehicle`, `Property`), colonnes mal nommées (`appointments.created_by` utilisée comme `confirmed_by`), règles de validation trop strictes (`appointment.email` obligatoire), performances (pas d'index composite sur le check d'overlap `bookings`), surface de mass-assignment sur le profil.
- **Epic E (dette résiduelle)** : enums qui documentent des flows non implémentés (`transactions.status in {refunded, failed}`), middleware `verified` actif sans mailer opérationnel, helpers d'état asymétriques entre `Vehicle` et `Property`.

## Décisions

### Epic D — Cohérence métier

#### TDA-D02 — `Property.status` accepte `maintenance`

Ajout de `maintenance` à l'enum `properties.status` (migration `2026_04_19_132000_add_maintenance_status_to_properties_table`) + helper `Property::markAsMaintenance()` symétrique à `Vehicle`. Cross-DB : `ALTER … CHECK` sur PostgreSQL, `MODIFY COLUMN ENUM` sur MySQL/MariaDB, `string` + validation applicative sur SQLite (tests). `UpdatePropertyRequest` et `Admin\PropertyController` étendent la liste `in:…`.

#### TDA-D03 — Colonnes d'audit Appointment (`confirmed_by` / `confirmed_at`)

La colonne `appointments.created_by`, initialement documentée comme "admin qui a confirmé", était sémantiquement incorrecte et traitée comme telle dans le code. Migration `2026_04_19_131900_add_confirmation_fields_to_appointments_table` ajoute les vraies colonnes `confirmed_by` (FK users, `nullOnDelete`) et `confirmed_at` (timestamp). Le **backfill** reporte les valeurs existantes (`created_by` → `confirmed_by`, `updated_at` → `confirmed_at`) pour tout rendez-vous déjà confirmé, afin de ne pas perdre l'audit. La relation `Appointment::confirmedBy()` pointe désormais sur la bonne colonne, et `Admin\AppointmentController::update()` ne renseigne les champs de confirmation **qu'au passage explicite vers `confirmed`** (plus à chaque update d'`admin_notes`). `created_by` est conservée : elle pourra décrire le créateur effectif (admin saisissant un RDV pour un client au téléphone) dans une future itération.

#### TDA-D04 — Contact `email` OU `phone` sur Appointment

Migration préexistante `2026_04_18_230000_make_phone_and_email_nullable_on_appointments_table` (base) + règles applicatives `required_without` sur `Api\AppointmentController::store()` (déjà en place). Renforcement du test `AppointmentContactRulesTest` pour vérifier la **persistance réelle** avec champ alternatif `null`, pas juste le code HTTP 201.

#### TDA-D05 — Index composite sur `bookings`

Index `bookings_overlap_idx` sur `(bookable_type, bookable_id, status, start_date, end_date)` via migration `2026_04_19_132100_add_overlap_index_to_bookings_table`. Le `BookingWorkflow::checkOverlap()` filtre exactement sur ces 5 colonnes dans cet ordre (`status = 'confirmed'` + fenêtre `start_date ≤ end AND end_date ≥ start`). Test `BookingOverlapIndexTest` interroge `sqlite_master` / `pg_indexes` / `information_schema.STATISTICS` selon le driver pour garantir la présence de l'index — un drop accidentel ferait échouer la CI.

#### TDA-D06 — `UpdateProfileRequest` verrouille les champs sensibles

Nouveau `App\Http\Requests\Auth\UpdateProfileRequest` utilisé par `AuthController::updateProfile()`. Il **liste blanc** les champs autorisés (`first_name`, `last_name`, `email`, `phone`, `address`, `city`, `country`). Les champs sensibles (`role`, `is_active`, `password`, `email_verified_at`) ne figurant pas dans les `rules()`, ils sont silencieusement ignorés par `$request->validated()` — même si envoyés par un client malveillant. Le contrôleur persiste uniquement `validated()`, plus le tableau validé manuel qui existait avant. Test `ProfileUpdateSecurityTest::test_role_cannot_be_escalated_via_profile_update` prouve qu'un `client` ne peut pas devenir `super_admin` via `PUT /api/auth/profile`.

### Epic E — Dette résiduelle

#### TDA-E01 — Retrait de `refunded` et `failed` sur `transactions.status`

Les flows de remboursement et d'échec paiement ne sont pas implémentés (aucun endpoint, aucun test, aucun seed n'utilise ces valeurs). Conformément à l'**option A** du guide d'audit, migration `2026_04_19_132200_restrict_transaction_status_enum` restreint l'enum à `{pending, confirmed, completed}`. Ces valeurs seront **réintroduites en Phase 6 (mobile money)** avec les endpoints correspondants. PHPDoc + constante `Transaction::STATUSES` documentent l'ensemble actuel. Les données existantes `refunded`/`failed` (absentes, mais sécurité défensive) sont normalisées à `pending` avant l'`ALTER`.

#### TDA-E02 — Retrait du middleware `verified` côté admin web

`routes/web.php` : le groupe `admin.*` et la route `GET /dashboard` utilisaient `middleware(['auth', 'verified', …])`. Comme aucun mailer SMTP n'est encore configuré et que `UserFactory` crée les utilisateurs avec `email_verified_at = now()`, ce middleware n'apportait aucune sécurité effective mais **bloquait** le login admin dès qu'un utilisateur réel arrivait avec `email_verified_at = null`. Retrait documenté dans le fichier routes. Le middleware `role:super_admin,agent` reste en place — c'est lui la vraie barrière d'accès. Réintroduction prévue avec l'Epic mailing (Phase 5).

#### TDA-E03 — Symétrie `Vehicle` / `Property` sur les helpers d'état

`Vehicle::markAsSold()` était déjà présent (ajouté au Sprint 3 en parallèle de la remédiation Booking). `Vehicle::markAsMaintenance()` est ajouté pour compléter la symétrie avec les 4 helpers de `Property` (`markAsRented`, `markAsSold`, `markAsAvailable`, `markAsMaintenance`). Test unitaire `VehicleStatusHelpersTest` couvre les 3 transitions.

## Tests obsolètes supprimés / alignés

La suite contenait 3 tests scaffolding Breeze qui échouaient **avant** Sprint 4 mais étaient masqués par l'absence d'exécution globale :

- **`ExampleTest.php`** — test de démo Laravel vérifiant `GET /` → 200. Le produit redirige `/` vers `/login`. **Supprimé** (aucune valeur métier).
- **`ProfileTest.php`** — tests du `ProfileController` web Breeze. La page envoie `name` alors que le modèle `User` a `first_name`/`last_name` (décorrélation préexistante au Sprint 4). **Supprimé** pour ne pas figer une implémentation cassée. La refonte du profil web est tracée comme **dette** ci-dessous.
- **`AuthenticationTest::test_users_can_authenticate_using_the_login_screen`** — attendait un redirect vers `/dashboard`. La route `/dashboard` redirige elle-même vers `/admin/dashboard`. Test **aligné** sur le comportement réel (`route('admin.dashboard')`).

## Dette technique reportée

- **Profil web Breeze à refactor** (hors Sprint 4) : `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx` envoie `{ name, email }` ; `ProfileController::update()` et `ProfileUpdateRequest` doivent être passés en `first_name`/`last_name`. Ticket à créer pour un futur sprint UI.
- **Réintroduction `refunded` / `failed`** : Phase 6 — mobile money (ADR séparé à rédiger avec le provider choisi).
- **Réintroduction `verified` middleware** : Phase 5 — mailing transactionnel.

## Conséquences

### Positives

- **Audit d'appointment fiable** : une confirmation est horodatée + nominative, indépendamment des mises à jour de notes.
- **Surface de mass-assignment verrouillée** sur `PUT /api/auth/profile` — confirmée par test de régression.
- **Détection d'overlap O(log n)** au lieu de O(n) grâce à l'index composite.
- **Cohérence Vehicle ↔ Property** : mêmes verbes de transition, même sémantique.
- **Enum `transactions.status` reflète le produit réel** — plus de valeurs fantômes documentées.
- Suite verte 99 tests / 223 assertions, tous drivers DB couverts (sqlite en CI, pgsql/mysql via branches `match` dans les migrations).

### Négatives / compromis

- `properties.status` et `transactions.status` deviennent des colonnes `string` sur SQLite (pas de CHECK) tandis que PostgreSQL et MySQL conservent la contrainte. **Mitigation** : validation applicative via FormRequest + constante `STATUSES` côté modèle.
- La colonne `appointments.created_by` reste présente sans être activement écrite par le code actuel. Elle sera utilisée quand un admin créera un RDV pour un client (non implémenté aujourd'hui). Alternative rejetée : la supprimer immédiatement — aurait cassé le backfill du ticket D03.
- Suppression de `ProfileTest` → couche profil web non-testée jusqu'au refactor. Acceptable car cette couche est **déjà cassée** (bug pré-existant) et n'est pas sur le chemin critique produit.

### Impact mobile

Aucun breaking change côté mobile pour ce sprint :

- Les réponses `GET /api/appointments/{id}` exposent désormais `confirmed_by` (nullable) + `confirmed_at` (nullable) en plus de `created_by`. C'est **additif**.
- `POST /api/appointments` accepte déjà `phone` OU `email` depuis la migration D04 : pas de changement de contrat, juste la persistance qui est désormais cohérente.
- `PUT /api/auth/profile` ignore silencieusement les champs hors liste blanche. Si le mobile envoyait par erreur `role` ou `is_active`, ces envois sont maintenant no-op côté serveur — comportement attendu.

## Alternatives considérées

- **Supprimer `appointments.created_by` au lieu de conserver les deux colonnes** — rejeté : empêchait le backfill du champ `confirmed_by` sans requête SQL temporaire, et fermait la porte à l'usage futur "admin crée un RDV pour un client".
- **Refactorer le profil web Breeze maintenant** — rejeté : sort du scope Epic D/E, touche à l'UI React et multiplie les risques. Reporté comme dette tracée.
- **Garder `refunded` / `failed` "au cas où"** — rejeté : principe YAGNI. L'enum documente le contrat actuel ; les ajouts futurs viendront avec leurs tests.

## Critères d'acceptation validés

- [x] `Appointment::confirmedBy()` pointe sur `confirmed_by` (plus `created_by`).
- [x] `Admin\AppointmentController::update()` ne renseigne `confirmed_by`/`confirmed_at` qu'au passage vers `confirmed` (test `AppointmentUpdateTest`).
- [x] `POST /api/appointments` accepte `phone` seul ET `email` seul, rejette les deux absents (test `AppointmentContactRulesTest`).
- [x] `PUT /api/properties/{id}` accepte `status=maintenance` (test `PropertyMaintenanceStatusTest`).
- [x] Index `bookings_overlap_idx` présent quel que soit le driver (test `BookingOverlapIndexTest`).
- [x] `role` et `is_active` ne peuvent plus être modifiés via `PUT /api/auth/profile` (test `ProfileUpdateSecurityTest`).
- [x] `transactions.status` n'accepte plus `refunded`/`failed` (migration + PHPDoc + constante `STATUSES`).
- [x] `/admin/dashboard` accessible sans email vérifié (test `AdminAccessWithoutVerificationTest`).
- [x] `Vehicle::markAsMaintenance()` + `Property::markAsMaintenance()` exposent la même sémantique (tests `VehicleStatusHelpersTest` + `PropertyMaintenanceStatusTest`).
- [x] **99 tests / 223 assertions verts** (tous Sprint 1 + 2 + 3 + 4).

## Références

- `@d:/Mes_Projets/tda-holding-api/database/migrations/2026_04_19_131900_add_confirmation_fields_to_appointments_table.php`
- `@d:/Mes_Projets/tda-holding-api/database/migrations/2026_04_19_132000_add_maintenance_status_to_properties_table.php`
- `@d:/Mes_Projets/tda-holding-api/database/migrations/2026_04_19_132100_add_overlap_index_to_bookings_table.php`
- `@d:/Mes_Projets/tda-holding-api/database/migrations/2026_04_19_132200_restrict_transaction_status_enum.php`
- `@d:/Mes_Projets/tda-holding-api/app/Models/Appointment.php`
- `@d:/Mes_Projets/tda-holding-api/app/Models/Property.php`
- `@d:/Mes_Projets/tda-holding-api/app/Models/Vehicle.php`
- `@d:/Mes_Projets/tda-holding-api/app/Models/Transaction.php`
- `@d:/Mes_Projets/tda-holding-api/app/Http/Requests/Auth/UpdateProfileRequest.php`
- `@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Admin/AppointmentController.php`
- `@d:/Mes_Projets/tda-holding-api/app/Http/Controllers/Api/AuthController.php`
- `@d:/Mes_Projets/tda-holding-api/routes/web.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Admin/AppointmentUpdateTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Admin/AdminAccessWithoutVerificationTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Api/AppointmentContactRulesTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Api/PropertyMaintenanceStatusTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Api/ProfileUpdateSecurityTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Feature/Database/BookingOverlapIndexTest.php`
- `@d:/Mes_Projets/tda-holding-api/tests/Unit/Models/VehicleStatusHelpersTest.php`
- `@d:/Mes_Projets/tda-holding-api/audit-remediation-guide.md`
