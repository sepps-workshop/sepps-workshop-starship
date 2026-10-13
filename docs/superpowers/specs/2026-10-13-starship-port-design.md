# Sepp’s Workshop for Starship: design

Date: 2026-10-13. Status: implemented, awaiting review.

## Goal

One Starship theme, generated from `@sepps-workshop/design-system`, installed by copying a file from a clone or by pointing `STARSHIP_CONFIG` at it. The port decides which prompt role feeds which Starship module and nothing about colour.

Blueprints: `vivid-life-starship` for the Starship mechanics (palette table, the two files, key order, install wording), `sepps-workshop-fish` for everything else (rules, tests, scaffolding, README structure and voice).

## Decisions taken with the user

1. Two files, as in Vivid Life: colours only, and a custom prompt. They hold the same palette, so this is one theme on two layouts and not a variant.
2. The time in the custom prompt gets a role in the foundation (`prompt_roles.time`) instead of a colour chosen here. The port ships only after that release.
3. Every Starship module that prints a version takes `language_module`, not only the six Vivid Life restyles.

## Foundation change (`sepps-workshop-design-system`, 0.8.0)

`prompt_roles.time: { color: "fg_muted" }`, beside `duration`. Both are secondary information at the edge of the prompt, and `fg_muted` is what Vivid Life uses for the time. The generated README table and the previews pick the role up; the prompt sample in `preview/03-shell.html` shows a time. Additive, so a minor bump. The release (tag, push, npm publish through CI) is the user's step with the foundation's `/release` skill.

Released as 0.8.0 on 2026-10-13; the port depends on `^0.8.0`.

## The port

### Output

`themes/sepps-workshop.toml` and `themes/sepps-workshop-custom.toml`, generated and committed. Both start with a three-line comment (name from `tokens.meta.name`, source, the Nerd Font from `tokens.typography.mono`), then the root keys, then the palette table `[palettes.sepps_workshop]`, then the module tables.

### Mapping

`src/theme-template.mjs` has one renderer with a `custom` switch.

- **Palette**: the distinct colour targets named in `prompt_roles`, resolved with `resolveTarget`. A palette key is the last part of the target (`semantic.info` becomes `info`, `fg_muted` stays). No other colour enters the file.
- **Style of a role**: its font styles, then its palette key, for example `bold accent`.

| Starship                     | Role                                           |
| ---------------------------- | ---------------------------------------------- |
| `directory.style`            | `directory`                                    |
| `git_branch.style`           | `git_branch`                                   |
| `git_status.<state>`         | `git_status.<state>`, as `[symbol$count](key)` |
| `character.success_symbol`   | `character_success`                            |
| `character.error_symbol`     | `character_error`                              |
| `cmd_duration.style`         | `duration`                                     |
| `time.style`                 | `time`                                         |
| `<module>.style`, 53 modules | `language_module`                              |

`git_status.style` colours only the brackets around the states, and the foundation has no role for them. The format is restated without a style group, so Starship draws the brackets in the terminal's foreground. The state symbols are Starship's defaults plus a count, as in Vivid Life. The foundation's `added` state is listed as unmapped: Starship counts a newly added file as `staged` unless the optional `index_added` key is set, which the port leaves alone; a test fails when the foundation gains a state the port neither maps nor lists.

The language modules are the modules with a `version_format` key in `starship print-config --default` (Starship 1.26.0: 53). A test compares the list in the source with the installed Starship.

The custom file adds: the root `format` (line one: directory, git branch, git status, the language modules, command duration, `$fill`, time; line two: the character), `fill.symbol = " "` with no style, `time.disabled = false`, and compact formats for `cmd_duration` and `time`. The language modules keep Starship's own formats: several show more than a version (`python` the virtualenv, `terraform` the workspace, `pulumi` the stack), and one shared format would drop that.

The prompt character is Starship's `❯` for both states, coloured by `character_success` and `character_error`, as in Vivid Life. A first draft changed the error character to `✗`; the user chose the Vivid Life behaviour, which is proven in daily use.

`command_timeout = 1000` in both files, as in Vivid Life: toolchain version checks can outlast the 500 ms default.

### Left at Starship's defaults

Modules and keys with no role: `username`, `hostname`, `docker_context`, `kubernetes`, cloud modules, `battery`, `status`, the `vimcmd_*` symbols, `directory.read_only_style`, `git_status.typechanged` and `up_to_date`. Their defaults are ANSI colour names and so resolve to the terminal port's palette. The README lists them.

### Key order

Root keys stand above the first table, or TOML reads them as part of it. `format` leads, because Starship 1.26.0 gets the width of `$fill` wrong when a table precedes it (vivid-life-starship issue 2).

### Tests (`node --test`)

1. The palette is the resolved prompt targets and nothing else, in both files.
2. Every style word is a palette key or `bold`.
3. Each module carries the key of its role.
4. Every foundation git state is mapped or listed as unmapped; the brackets have no style.
5. Key order.
6. The colours-only file sets no layout; the custom file has the two-line format.
7. No hex value in `src/theme-template.mjs` or `build.mjs`.
8. The committed `themes/` and `images/` equal a fresh build.
9. With the real Starship, in a temporary git repository: both files draw a prompt with empty stderr, and the output holds the 24-bit sequences of the directory, branch, untracked, duration and both character colours.
10. `LANGUAGE_MODULES` equals Starship's versioned modules; every git state key is one Starship knows.

### Install and update

Clone, then `cp` a file to `~/.config/starship.toml`, or set `STARSHIP_CONFIG` (bash/zsh, fish, PowerShell). Update is `git pull`, plus a second `cp` for those who copied. No install script: there is one file to place and Starship has no theme directory.

### Scaffolding

As the fish port: MIT licence, Claude Code config and skills, pre-commit hook, Prettier, changelog, the two Claude workflows, and `.gitattributes` from the Windows Terminal port so the generated files stay on LF.
