# Git Workflow

This document defines the git workflow for this project. All contributors must follow this process.

## Branch Structure

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Never push directly to this branch. |
| `feat/XXXX-description` | Feature branches for new work. |

## Workflow

### 1. Pick an Issue

- Go to the [Issues](../../issues) tab
- Pick an open issue to work on
- Assign yourself to the issue so others know it's being worked on

### 2. Create a Feature Branch

Always branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/XXXX-description
```

**Branch naming format:** `feat/XXXX-description`
- `XXXX` = 4-digit padded GitHub issue number
- `description` = short kebab-case summary

**Examples:**
- Issue #1 → `feat/0001-input-validation`
- Issue #8 → `feat/0008-add-alarm-sound`
- Issue #12 → `feat/0012-fix-timer-drift`

### 3. Make Your Changes

- Write your code on the feature branch
- Commit often with clear, descriptive messages
- Run checks before committing:

```bash
pnpm lint        # Check for lint errors
pnpm build       # Verify TypeScript compiles
pnpm test        # Run all tests
```

### 4. Commit Messages

Write clear commit messages that explain **what** and **why**:

```
feat: add input validation for minutes and seconds fields

Cap minutes and seconds at 59, hours at 99.
Disable Save button when total time is 0.

Closes #1
```

**Prefix your commits:**
| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `test:` | Adding or updating tests |
| `refactor:` | Code restructuring without behavior change |
| `docs:` | Documentation changes |
| `style:` | Formatting, whitespace, no code change |

### 5. Push and Create a Pull Request

```bash
git push origin feat/XXXX-description
```

Then create a PR on GitHub:
- **Target branch:** `main`
- **Title:** Short, clear summary (under 70 characters)
- **Description:** What changed, why, and how to test it
- **Link the issue:** Include `Closes #XXXX` in the PR description so the issue auto-closes when merged

### 6. Code Review

- Request a review (or self-review if working solo)
- Review checklist:
  - [ ] Code works as described in the issue's Acceptance Criteria
  - [ ] No lint errors (`pnpm lint`)
  - [ ] No TypeScript errors (`pnpm build`)
  - [ ] All tests pass (`pnpm test`)
  - [ ] New tests are written for new functionality
  - [ ] No unrelated changes included
- Address any review feedback with new commits (don't force-push)

### 7. Merge

- Once approved, merge the PR into `main` using **"Squash and merge"** or **"Create a merge commit"** (pick one and stay consistent)
- Delete the feature branch after merge:

```bash
# Remote
git push origin --delete feat/XXXX-description

# Local
git checkout main
git pull origin main
git branch -D feat/XXXX-description
```

### 8. Verify

- Confirm the issue is closed
- Verify the fix/feature works on `main`

## Rules

1. **Never push directly to `main`** — always use a PR
2. **Never skip tests** — all tests must pass before merging
3. **One issue per branch** — don't bundle unrelated changes
4. **Keep PRs small** — easier to review, less risk of conflicts
5. **Delete branches after merge** — keep the repo clean
