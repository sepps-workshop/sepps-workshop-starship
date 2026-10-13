# sepps-workshop-starship

Starship prompt port of the [Sepp’s Workshop design system](https://github.com/sepps-workshop/sepps-workshop-design-system). Node.js + ESM. Reads tokens from `@sepps-workshop/design-system`; emits two config files to `themes/`. One theme, no colour variants.

## Key Config Files

| File                                       | Purpose                                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `.claude/learnings.md`                     | One-line corrections from past sessions; appended to, never rewritten                     |
| `.claude/settings.json`                    | Permissions, secret-file guard, PostToolUse Prettier hook, env defaults                   |
| `.claude/skills/release/SKILL.md`          | `/release` skill: version bump → CHANGELOG → tag → push → GitHub release                  |
| `.claude/skills/sepps-workshop/SKILL.md`   | Port-side skill: how to read foundation tokens; copied from the foundation's `handoff/`   |
| `.claudeignore`                            | Paths Claude Code should skip when indexing (`node_modules/`, `themes/`)                  |
| `.githooks/pre-commit`                     | Runs sync-config-table.sh and gitleaks on every commit                                    |
| `.github/workflows/claude-code-review.yml` | Auto-reviews PRs with Claude on open/synchronize                                          |
| `.github/workflows/claude.yml`             | Responds to `@claude` mentions in issues, PRs, and review comments                        |
| `.gitignore`                               | Git ignore patterns                                                                       |
| `.prettierignore`                          | Paths Prettier must skip: generated `themes/` and `images/`                               |
| `build.mjs`                                | Reads foundation tokens, emits the config files to `themes/` and copies the README images |
| `package.json`                             | npm scripts (`build`, `test`, `format`) and the design-system devDependency               |
| `scripts/sync-config-table.sh`             | Keeps this table in sync with the filesystem (called by pre-commit)                       |

## Commands

- `npm install` — fetch deps (foundation tokens, prettier)
- `npm run build` — read tokens, emit `themes/sepps-workshop.toml`, `themes/sepps-workshop-custom.toml` and `images/`
- `npm test` — template tests, then an integration test that draws a prompt with the real Starship
- `npm run format` — run Prettier on the project

After cloning, run `git config core.hooksPath .githooks` to enable the pre-commit hook.

## Structure

- `build.mjs` — top-level build script
- `src/theme-template.mjs` — pure `buildColorsOnly(tokens)` and `buildCustomPrompt(tokens)`: one renderer, the custom file adds the layout
- `src/theme-template.test.mjs` — unit tests; expected values come from the tokens
- `src/starship.test.mjs` — runs Starship against the built files in a temporary git repository
- `themes/` — **generated**, committed (users copy or reference the files from a clone)
- `images/` — **generated**: copied by the build from the foundation's `assets/`

## References

`.claude/skills/sepps-workshop/SKILL.md` **Read when:** adding or changing any colour mapping. It maps port needs to foundation tokens.

`node_modules/@sepps-workshop/design-system/README.md` **Read when:** you need to know what a role means or why a value is what it is.

`docs/superpowers/specs/2026-10-13-starship-port-design.md` **Read when:** you need the reasoning behind a mapping, the two files or the install story.

## Conventions

- **No colour in this repository.** No hex value and no alpha arithmetic in `src/` or `build.mjs`. A test fails on either.
- **The palette is what `prompt_roles` names.** The `[palettes.sepps_workshop]` table holds the colour targets the prompt roles use and no others; a palette key is the last part of the target (`semantic.info` becomes `info`).
- **A module with no role stays at Starship's default.** Do not approximate it; list it in the README. A missing role is a gap in `sepps-workshop-design-system` and is fixed there.
- **Two files, one renderer.** `sepps-workshop.toml` repaints Starship's default prompt and sets no layout. `sepps-workshop-custom.toml` is the same output plus the root `format`, `fill`, the enabled `time` and compact formats for `cmd_duration` and `time`. The language modules keep Starship's formats, which show more than a version for some.
- **Root keys first.** `format`, `command_timeout` and `palette` stand above the first table, `format` leading: Starship 1.26.0 gets the width of `$fill` wrong when a table precedes it.
- **The language modules are Starship's.** `LANGUAGE_MODULES` is every module with a `version_format`; a test compares the list with the installed Starship.
- **Resolve role names with `resolveTarget`.** It throws on an unknown name; do not add a fallback.
- **Scope.** Starship colours the prompt. The ANSI palette belongs to the terminal port, syntax highlighting to the shell ports.
- **Determinism.** Same tokens in, byte-identical files out. `npm test` fails if `themes/` or `images/` is stale.
- **Writing.** The product name is written "Sepp’s Workshop" with a typographic apostrophe, the company "sepp.med gmbh". Docs are English, exact where technical, no emoji.

## Don't

- Don't hand-edit `themes/*.toml` or `images/`; run `npm run build`.
- Don't add a colour variant or a second palette.
- Don't put a colour into the palette that no prompt role names.
- Don't commit secrets. Don't use `--force`.

## Learnings

When the user corrects a mistake or points out a recurring issue, append a one-line summary to `.claude/learnings.md`. Don't modify CLAUDE.md directly.

## Compact Instructions

When compacting, preserve: list of modified files, current test status, open TODOs, and key decisions made.
