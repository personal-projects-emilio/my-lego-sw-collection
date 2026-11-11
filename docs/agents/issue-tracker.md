# Issue tracker: Linear

Issues and specs for this repo live in **Linear, team LSW** (Lego Star Wars Collection Manager). Use the Linear connector tools for all operations. Code and pull requests stay on GitHub (`personal-projects-emilio/my-lego-sw-collection`).

## Conventions

- **Create an issue**: `save_issue` with `team: "LSW"`, a `title` and a Markdown `description`. Before creating one, check with `list_issues` that it doesn't already exist.
- **Projects and milestones**: larger efforts are a Linear project with milestones (for example "Collection v2"). Put each ticket in the matching `project` and `milestone`.
- **Read an issue**: `get_issue` with the identifier (for example `LSW-28`), plus `list_comments` for the discussion.
- **List issues**: `list_issues` filtered by team, project, label or state.
- **Sub-issues**: set `parentId` on `save_issue`.
- **Comment**: `save_comment` on the issue.
- **Labels**: `addLabels` / `removeLabels` on `save_issue`. Each issue gets:
  - one triage label (see `triage-labels.md`)
  - one area label from the **Applications** group (Sets, Minifigs, Loose minifigs, Double, Auth)
  - one type label (Feature, Improvement, Setup, Bug)
- **Close**: set `state` to Done (or Canceled for `wontfix`), with a comment saying why.

## Blocking

Use Linear's built-in relations: `blockedBy` / `blocks` on `save_issue`. A ticket is unblocked once every blocker is Done.

## Branches and pull requests

- Branches use the issue's suggested git branch name (for example `lsw-28-finish-and-ship-the-brickset-csv-import`), so the GitHub PR links to the Linear issue automatically.
- PRs target `develop`. Pushes to `develop` deploy to GitHub Pages.

## Pull requests as a triage surface

**PRs as a request surface: no.** This is a solo project, so PRs don't go through triage.

## When a skill says "publish to the issue tracker"

Create a Linear issue in team LSW, as described above.

## When a skill says "fetch the relevant ticket"

`get_issue` with its identifier, plus `list_comments`.

## Wayfinding operations

Used by `/wayfinder`.

- **Map**: a parent Linear issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: a sub-issue of the map (`parentId`), labelled `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`).
- **Blocking**: Linear's built-in `blockedBy` relations.
- **Frontier query**: the map's open sub-issues with no open blocker and no assignee. The first in map order wins.
- **Claim**: set `assignee: "me"`. This is the session's first write.
- **Resolve**: comment with the answer, set the state to Done, then add a pointer (gist plus link) to the map's Decisions-so-far.
