---
description: "Use when planning or executing git operations for this repository, including branch strategy, commits, pull requests, and releases."
name: "Repository Git Workflow Rules"
applyTo: ["**/*"]
---
# Git Workflow Rules

- Never commit directly to `main`.
- Never push directly to `origin/main`.
- Always create a working branch from latest `main` before changes.
- The assistant should always propose a branch prefix based on the change intent.
- Prefix mapping guideline:
	- Feature work: `feat/`
	- Bug fix: `fix/`
	- Maintenance or tooling: `chore/`
	- Documentation-only updates: `docs/`
	- Emergency production fix: `hotfix/`
- Merge into `main` only through Pull Requests.
- Prefer `Squash and merge` for PR merges to keep history concise.
- Before merge, ensure build and tests pass (`npm run compile`, `npm test`).
- Keep PR scope small and focused; avoid mixing unrelated changes.
- For emergency fixes, use `hotfix/*` branch and still follow PR flow if feasible.

## Future Scale: develop Branch Model

- Current default is a single integration branch (`main`) with short-lived topic branches.
- When parallel work increases, introduce `develop` as the integration branch.
- In that model:
	- `feature/*`, `fix/*`, `chore/*`, `docs/*` branch from `develop` and merge back into `develop` via PR.
	- Release preparation merges from `develop` into `main` via PR.
	- `hotfix/*` branches from `main`, then back-merge into `develop` after release.
- Even after introducing `develop`, direct commits and direct pushes to protected branches remain disallowed.
