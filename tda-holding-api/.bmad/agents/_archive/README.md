# Archive des profils BMAD non utilisés

Ces profils faisaient partie des configurations initiales (v1 à 8 agents, puis v2 à 4 agents).
Ils sont archivés dans le cadre du passage à l'**équipe v3 optimisée à 4 rôles** : **Bob (SM) · Olivia (Chef de Projet) · Winston (Architect) · Amelia (Dev-Designer)**.

## Contenu archivé

| Fichier           | Agent           | Nom   | Archivé lors de… | Responsabilités reprises par |
|-------------------|-----------------|-------|------------------|------------------------------|
| `analyst.md`      | Analyst         | Mary  | v2 (2026-04-18)  | Olivia (brief, personas, recherche) |
| `pm.md`           | PM              | John  | v2 (2026-04-18)  | Olivia (PRD, roadmap, priorisation) |
| `tea.md`          | TEA             | Murat | v2 (2026-04-18)  | Bob (QA Gate, parcours critiques)   |
| `tech-writer.md`  | Tech-Writer     | Axel  | v2 (2026-04-18)  | Bob (changelog, release notes)      |
| `dev.md`          | Dev             | James | v3 (2026-04-18)  | Amelia (code full-stack)            |
| `ux-designer.md`  | UX-Designer     | Sally | v3 (2026-04-18)  | Amelia (UI/UX fine, design system)  |

## Réintroduction

Si le projet grandit (équipe plus large, complexité accrue, besoin de spécialisation), ces profils peuvent être restaurés :

```powershell
# Depuis la racine du workspace tda-holding-api
Move-Item .bmad\agents\_archive\<fichier>.md .bmad\agents\
```

Puis mettre à jour `.bmad/agents/README.md` et `project-context.md` section 11 pour refléter l'équipe élargie.
