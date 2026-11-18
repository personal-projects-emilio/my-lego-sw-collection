# CLAUDE.md

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`.

- **Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`.
- **Scope** (optional): the app area, matching the Linear area labels: `sets`, `minifigs`, `loose`, `resale`, `auth`, `api`.
- **Footer**: `Refs: LSW-<n>` to link the Linear issue.
- **PR titles** must use the same format. PRs are squash-merged, so the title becomes the commit on `develop`. The `PR title` workflow checks it.
- No AI attribution anywhere: no `Co-Authored-By` trailers and no "Generated with" lines in commits, PRs or issues.
- WIP commits on feature branches are fine in any format. No local hook enforces the convention, on purpose.

## Code

- **Component size**: a component file can hold everything up to 150 lines. Past that, split it: styles go to `Foo.styles.ts` (like `SetFormModal.styles.ts`), and sub-components to their own files.
- **Map names**: lookup constants are named `mapFooToBar`, e.g. `mapKeysToActions`, `mapKindsToIcons`.
- **Object params**: our own functions with two or more params take one object with named fields. Native and library callback signatures (comparators, `reduce`, event handlers) keep theirs. ESLint's `no-restricted-syntax` enforces it; `by*`/`compare*` comparators are exempt.
- **No abbreviations**: spell names out, type parameters included: `Item`, `ListKey`, not `T`, `K`. ESLint's `@typescript-eslint/naming-convention` enforces it for type parameters.

## Tests

- Prefer table-driven tests with Vitest's `test.for([...])(name, fn)`: one row per case, `$field` placeholders in the name. It's the default for simple functions, and should be used elsewhere whenever the cases share a shape.

## Agent skills

### Issue tracker

Issues live in Linear (team LSW), accessed through the Linear connector; code and PRs are on GitHub. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels, as Linear labels on team LSW. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
