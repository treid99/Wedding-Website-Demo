---
name: commit-builder
description: Generate a scored commit message based on a quality rubric, then commit after explicit user approval
disable-model-invocation: false
---

# Generate Scored Commit Message

You are generating a high-quality commit message for the current staged and unstaged changes. The message MUST be explicitly approved by the user before any commit is made.

## Step 1: Gather Context

Run these commands in parallel to understand the current state:

- `git status` — see all changed, staged, and untracked files (never use `-uall`)
- `git diff` — see unstaged changes
- `git diff --cached` — see staged changes
- `git log --oneline -10` — see recent commit style for consistency

If there are no changes to commit, inform the user and stop.

## Step 2: Draft the Commit Message

Write a commit message that maximizes the score under the rubric below. Target an **A grade (>= 90)**.

### Message Structure

```
type: Imperative subject line (10-50 chars)

Body paragraph explaining the "why" behind this change.
What problem does it solve? What motivated it? What side effects
does it have? The body MUST be >= 80 characters to earn full marks.
```

### Conventional Commit Types

Use one of these type prefixes:

| Type       | When to use                                    |
|------------|------------------------------------------------|
| `feat:`    | New feature or capability                      |
| `fix:`     | Bug fix                                        |
| `docs:`    | Documentation only                             |
| `style:`   | Formatting, whitespace, no code change         |
| `refactor:`| Code change that neither fixes nor adds        |
| `test:`    | Adding or updating tests                       |
| `chore:`   | Build, config, tooling, dependencies           |
| `perf:`    | Performance improvement                        |
| `ci:`      | CI/CD pipeline changes                         |

### Rules

- Subject line: 10-50 characters, no trailing period, starts with type prefix
- Use imperative mood after the prefix (e.g., "feat: Add login page", not "feat: Added login page")
- Body must explain the **why**, not just the **what**
- Body must be >= 80 characters for full marks
- The message must be specific and descriptive (no generic "fix", "wip", "temp", or fewer than 3 words)

## Step 3: Score the Message

Score the drafted message using this rubric and present the breakdown to the user:

### Quality Scoring Rubric (0-100)

| Category                              | Max Pts | Criteria |
|---------------------------------------|---------|----------|
| **Subject Line Length & Formatting**  | 25      | 10-50 chars (10 pts). No trailing period (8 pts). Starts with capital letter or `type:` prefix (7 pts). |
| **Conventional Commit / Imperative**  | 20      | Recognized `type:` prefix (20 pts) OR imperative verb without prefix (14 pts). |
| **Commit Body Present & Descriptive** | 25      | Body >= 80 chars explaining "why" (25 pts). 30-79 chars (partial). No body (0 pts). |
| **Non-Generic / Non-Lazy Message**    | 20      | Specific, descriptive subject. Generic messages like "fix", "wip", "temp", or < 3 words score 0. |
| **Focused Change Scope**              | 10      | 1-10 files (10 pts). 11-30 files (5 pts). 30+ files (0 pts). |

**Grades:** A (>= 90) | B (>= 75) | C (>= 60) | D (>= 40) | F (< 40)

Merge commits receive a fixed score of **70**.

## Step 4: Present to User for Approval

Display the following to the user and **wait for explicit approval**:

1. **Files to be committed** — list all files that will be included
2. **Proposed commit message** — the full message (subject + body)
3. **Score breakdown** — table with each category, points earned, and total score/grade
4. Ask: **"Would you like to commit with this message? (yes / edit / cancel)"**

### Handling Responses

- **yes** / **y** / affirmative — proceed to Step 5
- **edit** / user provides changes — revise the message, re-score, and present again
- **cancel** / **no** / **n** — abort without committing
- If the user suggests modifications to the message, incorporate them, re-score, and present the updated version for approval

**CRITICAL: Do NOT run `git commit` until the user explicitly approves.**

## Step 5: Commit

Only after explicit user approval:

1. Stage all relevant files with `git add` (prefer adding specific files by name)
2. Run the commit using a HEREDOC for proper formatting:

```bash
git commit -m "$(cat <<'EOF'
type: Subject line here

Body paragraph here explaining the why.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

3. Run `git status` after the commit to verify success
4. Report the result to the user

## Important Notes

- NEVER commit without explicit user approval
- NEVER use `git add -A` or `git add .` — always add specific files
- NEVER skip pre-commit hooks (`--no-verify`)
- NEVER amend previous commits unless the user explicitly asks
- If a pre-commit hook fails, diagnose the issue, fix it, and create a NEW commit
- Always append the `Co-Authored-By` line to the commit body
