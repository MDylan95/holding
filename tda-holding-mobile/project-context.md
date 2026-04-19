# TDA Holding — Project Context (Mobile)

> Ce fichier est un **lien symbolique conceptuel** vers la source de vérité unique située dans le workspace backend.
> Pour la documentation complète (stack, architecture, conventions, API, règles métier), consulter :
>
> **`d:\Mes_Projets\tda-holding-api\project-context.md`**
>
> Cette app mobile (`tda-holding-mobile`) est **un composant client** du projet TDA Holding et ne doit pas diverger des conventions globales.

---

## Résumé spécifique mobile

- **Stack** : Expo SDK 54 · React 19.1 · React Native 0.81.5 · React Navigation 7 · Axios 1.14 · AsyncStorage 2.2
- **Bundle ID** : `com.tdaholding.mobile`
- **URL API** (dans `src/constants/config.js`) :
  ```js
  android: 'http://10.0.2.2:8000/api'
  ios:     'http://192.168.100.16:8000/api'   // adapter à l'IP locale
  web:     'http://127.0.0.1:8000/api'
  ```
- **Lancement** : `npx expo start` (puis `a`, `i`, ou `w`)
- **Backend requis** : `php artisan serve --host=0.0.0.0 --port=8000` depuis `tda-holding-api`

## Règles spécifiques

1. Toujours utiliser `AsyncStorage.getItem/setItem` individuels (pas `multiGet`) → compat web.
2. Token Sanctum stocké sous la clé `@tda_auth_token`.
3. Login accepte email OU téléphone (champ `login`).
4. UI conditionnelle sur `vehicle.offer_type` : `rent` → Réserver · `sale`/`both` → Rendez-vous + WhatsApp.
5. Véhicule avec `is_available=false` → badge "Réservé", bouton d'action désactivé.

## Méthodologie BMAD

Les profils d'agents se trouvent dans `.bmad/agents/` du workspace backend (`tda-holding-api`). Ils s'appliquent aux **deux** workspaces.
