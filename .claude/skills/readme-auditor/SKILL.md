---
name: readme-auditor
description: Audit README.md against the actual codebase and correct it only where it is factually wrong, outdated, or missing important functionality
disable-model-invocation: false
---

# Audit and Update the README

You are auditing `README.md` in the project root against what the code actually
does. **The default outcome is no change.** Edit only to fix something that is
wrong, stale, or genuinely missing — not to restyle, expand, or "improve" prose
that is already accurate.

The README's audience is someone seeing this project for the first time: they
should be able to run it, understand what it contains, and know where things
live. Judge every proposed edit against that reader.

## Step 1: Read the README

Read `README.md` in full first, before looking at any code. Note the claims it
makes — each one is a thing to verify. Note also its voice and structure, which
you will preserve.

## Step 2: Gather Ground Truth

Verify against the repo, not memory. Run these in parallel:

- `package.json` — every `scripts` entry, dependencies and their major versions
- `git log --oneline -20` — what changed recently; recent commits are the most
  likely source of drift
- `git status` — uncommitted work that may already be described, or may not be
  ready to describe
- Directory listings for the paths the README's Layout section names
  (`app/`, `components/`, `lib/`, `scripts/`, `tests/`, …)

Then read whatever the README makes specific claims about. Follow the claim to
its source — a route table means checking the route directories exist, a
described behavior means reading the function that implements it, a setup
command means confirming the script it invokes is real.

Prefer the dedicated search tools over shell for this. Do not run destructive
scripts (`db:reset`, `photos:shrink`) or long builds just to verify a sentence.

## Step 3: Classify Every Discrepancy

Sort what you found into exactly one of these buckets.

| Bucket | Meaning | Action |
|---|---|---|
| **Wrong** | The README states something the code contradicts — a renamed file, a changed command, a behavior that no longer works that way, a version bump | Fix |
| **Outdated** | Was true, no longer is — a removed page, a superseded workflow, a resolved caveat still listed as a known limit | Fix |
| **Missing** | A capability a newcomer needs and would not find on their own — a whole feature area, a test suite, a required setup step, a new top-level directory | Add |
| **Cosmetic** | Accurate but you would have phrased it differently — wording, ordering, heading style, table vs. list | **Leave alone** |
| **Trivia** | Accurate and complete, just not exhaustive — an internal helper, a minor prop, a one-off script | **Leave alone** |

A discrepancy must be in the first three buckets to justify an edit. If
everything lands in the last two, the README is fine and you say so.

### Calibration

**Fix:** a `npm run` command that no longer exists; a documented file path that
moved; a stated dependency version that is a major behind; a page listed that
was deleted; a "known limit" that has since been fixed.

**Add:** a test suite with no mention of how to run it; a new user-facing
feature area; a setup step a fresh clone now requires.

**Do not touch:** internal refactors with no external effect; new private
helpers; formatting preferences; anything you would add only for completeness.

## Step 4: Report Before Editing

Present the audit to the user:

1. **Verified** — one line summarizing what you checked and found accurate
2. **Findings** — a table of `location · bucket · what's wrong · proposed fix`,
   or an explicit statement that there are none
3. **Deliberately skipped** — cosmetic/trivia items you found and are leaving,
   so the user can overrule you

If there are no findings, stop here. Report that the README is accurate and
name the areas you verified. **Do not make an edit just to have made one.**

## Step 5: Apply the Fixes

Only for items in the Wrong / Outdated / Missing buckets.

- Use `Edit`, never a full rewrite. Every untouched line stays byte-identical.
- **Match the existing voice.** This README is direct and specific — it explains
  *why* a thing is the way it is, not just what it is. It uses short prose
  paragraphs, tables for enumerations, and fenced blocks for commands and trees.
  Do not introduce marketing tone, emoji, or badge rows.
- Keep new content proportional. A missing feature area earns a few lines in the
  section where it belongs, not a new top-level section, unless it genuinely has
  no home.
- Every command you write must be one you confirmed exists in `package.json`.
- Every path you write must be one you confirmed exists on disk.
- Preserve the section order and heading levels already in the file.

## Step 6: Verify

After editing, re-read the changed sections and confirm:

- Every command mentioned resolves to a real `scripts` entry
- Every path mentioned exists
- No claim was introduced that you did not verify in Step 2
- Markdown still renders — tables aligned, fences closed, links intact

Then show the user a diff summary of what changed and why.

## Important Notes

- **No change is a valid, common, and often correct result.** An accurate README
  left untouched is a successful run of this skill.
- Never document aspirational or planned behavior — only what is in the code now.
- Never invent versions, benchmarks, counts, or file sizes. If the README states
  a number you cannot verify cheaply, leave it and flag it as unverified rather
  than guessing a replacement.
- Do not commit. If the user wants the change committed, that is the
  `commit-builder` skill's job.
- If uncommitted work in `git status` is the source of a discrepancy, say so —
  the README may be correct for `main` and simply ahead of or behind the working
  tree. Ask before documenting unfinished work.
