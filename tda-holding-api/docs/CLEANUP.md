# Fichiers à nettoyer — TDA Holding

> Liste des fichiers identifiés comme **obsolètes** ou **inutiles** à la date du 2026-04-21.
> Chaque entrée est accompagnée d'une **justification**.
> Aucune suppression n'est automatisée : validez chaque cas avant d'agir.

---

## 1. Fichiers déjà supprimés

### ✅ `tda-holding-api/.bmad/` *(supprimé)*

Dossier contenant les agents BMAD (analyst, architect, dev, pm, sm, tea, tech-writer, ux-designer, chef-projet), briefs et PRDs liés à la méthodologie BMAD.

**Justification** : La méthode BMAD est abandonnée au profit d'une méthode de travail individuelle.

---

## 2. À supprimer — priorité HAUTE

### 🔴 `tda-holding-api/project-context.md` (28 KB)

Ancien fichier de contexte destiné à la méthode BMAD (référence explicite aux agents « Analyst, Architect, Dev, PM, SM, TEA, Tech-Writer, UX-Designer »).

**Remplacé par** : `tda-holding-api/docs/PROJECT.md`

**Action recommandée** :
```powershell
Remove-Item "d:\Mes_Projets\tda-holding-api\project-context.md"
```

---

### 🔴 `tda-holding-api/project-documentation.md` (31 KB)

Documentation généralisée produite dans le cadre de BMAD, redondante avec `PROJECT.md` et les ADR.

**Remplacé par** : `tda-holding-api/docs/PROJECT.md` + `tda-holding-api/docs/adr/`

**Action recommandée** :
```powershell
Remove-Item "d:\Mes_Projets\tda-holding-api\project-documentation.md"
```

---

### 🔴 `tda-holding-api/audit-remediation-guide.md` (32 KB)

Guide de remédiation de l'audit d'avril 2026 rédigé par « Winston (Architecte) » (agent BMAD). Les 26 findings qu'il listait ont tous été traités ou capturés dans les ADR-009 à ADR-013.

**Remplacé par** : les ADR `docs/adr/ADR-009` à `ADR-013`

**Action recommandée** :
```powershell
Remove-Item "d:\Mes_Projets\tda-holding-api\audit-remediation-guide.md"
```

---

### 🔴 `tda-holding-mobile/project-context.md` (1.6 KB)

Fichier de contexte BMAD pour le projet mobile, qui est archivé (Option E de l'ADR-012, remplacé par la PWA Next.js).

**Action recommandée** :
```powershell
Remove-Item "d:\Mes_Projets\tda-holding-mobile\project-context.md"
```

---

## 3. À évaluer — priorité MOYENNE

### 🟡 `tda-holding-api/.phpunit.result.cache` (12 KB)

Cache binaire de PHPUnit. Ne devrait jamais être commité (généré automatiquement).

**Action recommandée** :
1. Supprimer le fichier.
2. S'assurer qu'il est ignoré :
   ```powershell
   Add-Content "d:\Mes_Projets\tda-holding-api\.gitignore" "`n.phpunit.result.cache"
   ```

---

### 🟡 `tda-holding-api/public/sw.js` *(si présent)*

Service Worker PWA. D'après la mémoire de projet, il est censé être gitignoré mais à vérifier.

**Action** : vérifier qu'il est bien dans `.gitignore` ; sinon l'ajouter.

---

### 🟡 `tda-holding-mobile/` — workspace complet

Le projet Expo / React Native est archivé (ADR-012, Option E). Actuellement conservé comme référence historique.

**Options** :
- **Garder** : si vous prévoyez un éventuel retour à une app native (bundle ID `com.tdaholding.mobile` déjà réservé).
- **Archiver** : déplacer dans un tag Git `mobile-archive` puis supprimer du répertoire de travail.
- **Supprimer** : si l'app native est définitivement abandonnée.

**Action recommandée** : tagger la version actuelle avant toute suppression.
```powershell
cd d:\Mes_Projets
git tag mobile-archive-2026-04 -m "Archive tda-holding-mobile avant suppression"
git push origin mobile-archive-2026-04
```

---

## 4. À conserver — hors scope mais à noter

### 🟢 Archives `.zip` à la racine `d:\Mes_Projets\`

- `cnpsci.zip` (29 MB)
- `PleinDeFoin.zip` (9 MB)
- `projet.zip` (160 MB)
- `tda-holding-api.zip` (65 MB)
- `tda-holding-mobile.zip` (82 MB)

Ces fichiers sont **en dehors** du repo git (ignorés par le `.gitignore` racine qui ne whiteliste que `tda-holding-api/`, `tda-holding-mobile/`, `tda-holding-web/`).

**Justification de conservation** : ce sont des backups personnels hors versioning. Vous pouvez les déplacer hors de `d:\Mes_Projets\` pour alléger le répertoire, mais aucun impact sur le repo.

---

### 🟢 Dossiers d'autres projets (hors TDA Holding)

`PleinDeFoin/`, `cnpsci/`, `StudioProjets/`, `kreativ/`, `mabanque_backend/`, `perso/`, `portfolio/`, `site_miroir/`, `transbanque/`

Tous ignorés par le `.gitignore` racine, sans impact sur le repo TDA Holding.

---

## 5. Récapitulatif des actions

| Fichier / Dossier                                     | Taille  | Action              | Priorité |
|-------------------------------------------------------|---------|---------------------|----------|
| `tda-holding-api/.bmad/`                              | —       | ✅ Déjà supprimé     | —        |
| `tda-holding-api/project-context.md`                  | 28 KB   | 🔴 Supprimer         | Haute    |
| `tda-holding-api/project-documentation.md`            | 31 KB   | 🔴 Supprimer         | Haute    |
| `tda-holding-api/audit-remediation-guide.md`          | 32 KB   | 🔴 Supprimer         | Haute    |
| `tda-holding-mobile/project-context.md`               | 1.6 KB  | 🔴 Supprimer         | Haute    |
| `tda-holding-api/.phpunit.result.cache`               | 12 KB   | 🟡 Supprimer + ignore| Moyenne  |
| `tda-holding-mobile/` (complet)                       | ~       | 🟡 Tagger puis décider| Moyenne |
| Archives `.zip` racine                                | ~345 MB | 🟢 Déplacer (hors repo)| Basse  |
| Autres projets racine                                 | —       | 🟢 Ignorer           | —        |

**Gain net attendu** (si toutes les actions haute priorité sont exécutées) : environ **93 KB** dans le repo git.
