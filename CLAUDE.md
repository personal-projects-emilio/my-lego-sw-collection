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

- **Component size**: aim for component files under ~150 lines; 150 to 200 is fine, and a stateful component (a form, a dialog) can go past that when splitting it would only pass its state down. Shrink a file by pulling out what stands on its own: styles to `Foo.styles.ts`, constants, types, utils, hooks, and small components that are reused or own their state (like `FormTextField`). Never cut a component into sections that take the parent's `control` or state as props.
- **Function names** start with a verb: `getHeaderMenuItems`, `buildTagsColDef`, `isNoValue`, `addImplied`, never a noun that reads like a value (`headerMenuItems`, `tagsColDef`). Components are PascalCase, hooks `use…`, handlers `on…`, comparators `by*`/`compare*`. ESLint's `no-restricted-syntax` enforces it with a list of allowed verbs in `eslint.config.ts`; add a verb there when a new one is the right word.
- **File names**: a file that exports a single function or component is named after it: `getHeaderMenuItems.tsx`, `buildTagsColDef.ts`, `ColumnHeader.tsx`.
- **Map names**: lookup constants are named `mapFooToBar`, e.g. `mapKeysToActions`, `mapKindsToIcons`.
- **Object params**: our own functions with two or more params take one object with named fields. Native and library callback signatures (comparators, `reduce`, event handlers) keep theirs. ESLint's `no-restricted-syntax` enforces it; `by*`/`compare*` comparators are exempt.
- **No abbreviations**: spell names out, type parameters included: `Item`, `ListKey`, not `T`, `K`. A library's own type parameter name stays as the library spells it: AG Grid's `TData`. ESLint's `@typescript-eslint/naming-convention` enforces it for type parameters.

## Tests

- Prefer table-driven tests with Vitest's `test.for([...])(name, fn)`: one row per case, `$field` placeholders in the name. It's the default for simple functions, and should be used elsewhere whenever the cases share a shape.

## Agent skills

### Issue tracker

Issues live in Linear (team LSW), accessed through the Linear connector; code and PRs are on GitHub. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels, as Linear labels on team LSW. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
