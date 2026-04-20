# .bmad/briefs/ — Notes de cadrage initial

Ce dossier contient les **notes de cadrage** (briefs de contexte) produits par **Bob (Scrum Master)** en amont de toute réflexion majeure nécessitant un travail coordonné des experts de l'équipe BMAD.

## À quoi sert un brief ?

Un brief est le **point de départ partagé** avant qu'Olivia, Winston ou Amelia ne produisent leurs livrables respectifs. Il répond à la question :

> « De quoi parle-t-on, où en est-on, et qu'attend-on de chaque expert ? »

Un brief N'EST PAS :
- ❌ Un **PRD** (produit par **Olivia** après lecture du brief)
- ❌ Un **ADR** (produit par **Winston** après lecture du brief)
- ❌ Une **story** (produite par **Bob** après PRD + ADR)
- ❌ Du **code** (produit par **Amelia** après story)

Un brief EST :
- ✅ Une **mise en contexte** factuelle
- ✅ Une **clarification de l'objectif métier**
- ✅ Une **cartographie** des options ouvertes
- ✅ Une **liste de questions** à trancher
- ✅ Un **plan de cadrage** précisant qui fait quoi ensuite

## Cycle de vie d'un sujet BMAD

```
Idée utilisateur
    │
    ▼
┌───────────────────────────────┐
│ 🏃 Bob : BRIEF-XXX             │  ← ici, dans ce dossier
│   .bmad/briefs/BRIEF-XXX.md   │
└────────────┬──────────────────┘
             │ distribué à
             ▼
    ┌────────┴────────┐
    ▼                 ▼
┌───────────┐   ┌──────────────┐
│ 🎯 Olivia  │   │ 🏛️ Winston    │
│ produit    │   │ produit       │
│ PRD-XXX    │   │ ADR-XXX       │
└─────┬─────┘   └───────┬──────┘
      │                 │
      └─────────┬───────┘
                ▼
        ┌───────────────┐
        │ 🏃 Bob : US-XXX │  (stories)
        └───────┬───────┘
                ▼
        ┌───────────────┐
        │ 🎨💻 Amelia     │  (code + UI)
        └───────────────┘
```

## Convention de nommage

```
BRIEF-001-<slug-court>.md
BRIEF-002-<slug-court>.md
...
```

Exemples :
- `BRIEF-001-multi-platform-evolution.md`
- `BRIEF-002-mobile-money-payment.md`
- `BRIEF-003-push-notifications.md`

## Structure type d'un brief

1. **Résumé exécutif** (3 lignes)
2. **Contexte** (état actuel)
3. **Objectif métier** (le pourquoi)
4. **Options ouvertes** (panorama des solutions)
5. **Questions stratégiques** à trancher
6. **Livrables attendus** (par agent)
7. **Risques identifiés**
8. **Références** (code, ADR liés, dépendances)

## Statuts d'un brief

- 🟢 **Open** : en discussion, questions ouvertes
- 🔵 **In-progress** : Olivia/Winston produisent leurs livrables
- ✅ **Resolved** : PRD + ADR livrés, brief archivé pour traçabilité
- ❌ **Rejected** : sujet abandonné (garder le brief pour traçabilité)

## Index des briefs

| ID          | Titre                                | Statut  | Date       |
|-------------|--------------------------------------|---------|------------|
| BRIEF-001   | Évolution multi-plateforme (web + mobile) | 🟢 Open | 2026-04-19 |
