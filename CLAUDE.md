# CLAUDE.md

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`.

- **Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`.
- **Scope** (optional): the app area, matching the Linear area labels: `sets`, `minifigs`, `loose`, `resale`, `auth`, `api`.
- **Footer**: `Refs: LSW-<n>` to link the Linear issue.
- **PR titles** use the same format.
- WIP commits on feature branches are fine and don't need the format. It isn't enforced by a hook on purpose. Squash or reword them before merging so `develop` only gets conventional messages.

## Agent skills

### Issue tracker

Issues live in Linear (team LSW), accessed through the Linear connector; code and PRs are on GitHub. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels, as Linear labels on team LSW. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
