<p align="center">
  <img src="./images/sepps-workshop-header.jpg" width="100%" alt="Sepp, the blue robot, assembling code blocks with a wrench in his workshop" />
</p>

# Sepp’s Workshop for Starship

<p>
  <img src="https://img.shields.io/badge/WCAG-AA-3aaa35" alt="WCAG AA" />
  <img src="https://img.shields.io/badge/license-MIT-b2b2b2" alt="MIT license" />
</p>

One dark colour theme for the [Starship](https://starship.rs) prompt, in the sepp.med colours, with Sunset yellow as the accent. It colours the directory, the git branch and status, the prompt character, the command duration, the time and the language modules. There are no colour variants: this is the one theme, on a prompt layout of your choice.

The colours come from the [Sepp’s Workshop design system](https://github.com/sepps-workshop/sepps-workshop-design-system), whose build refuses to ship a text colour that fails WCAG AA on its background.

## Requirements

- [Starship](https://starship.rs/guide/), installed and initialised in your shell. The theme is tested with Starship 1.26.
- A [Nerd Font](https://www.nerdfonts.com/font-downloads) in your terminal, or the module icons render as a row of empty boxes. The design system recommends JetBrainsMono Nerd Font.

## Install

The theme ships as two files in [`themes/`](./themes/). They hold the same colours and differ in the layout:

| File                         | What it is                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `sepps-workshop.toml`        | **Colours only**: Starship's own default prompt, repainted.                                                                         |
| `sepps-workshop-custom.toml` | **Custom prompt**: two lines. Directory, git, language versions and the last command's duration on the left, the time at the right. |

Clone the repository, then copy your pick to Starship's config location:

```bash
git clone https://github.com/sepps-workshop/sepps-workshop-starship.git
mkdir -p ~/.config
cp sepps-workshop-starship/themes/sepps-workshop.toml ~/.config/starship.toml
```

That `cp` replaces an existing `starship.toml`. Back yours up first if it holds years of careful tuning.

Or leave the file where it is and point `STARSHIP_CONFIG` at it. In `~/.bashrc` or `~/.zshrc`:

```bash
export STARSHIP_CONFIG=~/path/to/sepps-workshop-starship/themes/sepps-workshop-custom.toml
```

In `~/.config/fish/config.fish`:

```fish
set -gx STARSHIP_CONFIG ~/path/to/sepps-workshop-starship/themes/sepps-workshop-custom.toml
```

In your PowerShell `$PROFILE`, before the line that initialises Starship:

```powershell
$ENV:STARSHIP_CONFIG = "$HOME\path\to\sepps-workshop-starship\themes\sepps-workshop-custom.toml"
```

Replace `path/to` with wherever you cloned the repository, then open a new shell. After a `cp`, the next prompt is already drawn with the theme.

### Update

```bash
cd sepps-workshop-starship
git pull
```

With `STARSHIP_CONFIG` that is all. If you copied the file, copy it again.

### Already have a `starship.toml`?

Starship reads one config file, so the theme cannot sit beside yours. To keep your own layout, copy the `palette` line and the `[palettes.sepps_workshop]` table from [`themes/sepps-workshop.toml`](./themes/sepps-workshop.toml) into your file and use the palette names in your styles, for example `style = "bold accent"`. The `palette` line must stand above the first table.

### Uninstall

Remove the `STARSHIP_CONFIG` line, or delete `~/.config/starship.toml` and put your backup in its place.

## Recommended companions

- **Terminal colours**: Starship draws on the background your terminal has. Every colour here is chosen and checked for the dark blue terminal background of the design system (`#14284c`, a shade darker than Darkblue), which is what [Sepp’s Workshop for Windows Terminal](https://github.com/sepps-workshop/sepps-workshop-windows-terminal) sets. On a light background the prompt is hard to read.
- **Font**: themes cannot ship fonts. For this port the Nerd Font is a requirement, not a suggestion: [JetBrainsMono Nerd Font](https://www.nerdfonts.com/font-downloads) is the Nerd Font build of [JetBrains Mono](https://www.jetbrains.com/lp/mono/).
- **Shell colours**: the prompt ends where your typing begins. For syntax highlighting on the command line there are [Sepp’s Workshop for fish](https://github.com/sepps-workshop/sepps-workshop-fish) and [Sepp’s Workshop for PowerShell](https://github.com/sepps-workshop/sepps-workshop-powershell).

## How it is built

Both files are generated. The design system says what colour the directory, the branch, each git state or a language module has; this repository puts those colours into a Starship palette and names them in the module styles. It contains no colour value of its own, and a test fails if one appears.

A few things follow from the palette and are deliberate:

- The directory is the one accented thing in the prompt: Sunset yellow and bold.
- Every language and tool module is the same muted grey-blue. The palette has too few hues to give each language its own, and the symbol already says which one it is.
- The prompt character is green after a command that worked and coral red after one that failed. It keeps Starship's `❯` in both cases.
- Red is a signal only: a failed command and deleted files. It is a coral red, not the Racing Red of the logo, which does not reach a readable contrast on a dark blue.
- Each git state has its own colour and shows a count, such as `!2` for two modified files. The brackets around them carry no colour and are drawn in your terminal's text colour.
- `command_timeout` is raised from 500 ms to one second, so that a slow version check does not drop its module from the prompt.

### Not set by the theme

The design system has no role for these, so the theme leaves them at Starship's defaults, which take their colours from the sixteen ANSI colours of your terminal:

- Every other module, such as `username`, `hostname`, `docker_context`, `kubernetes`, the cloud modules, `battery` and `status`. The custom prompt does not show them.
- The vi-mode symbols of the prompt character (`vimcmd_symbol` and its siblings).
- `read_only_style` of the directory, and the `typechanged` and `up_to_date` states of `git_status`.

The design system also names a git state `added`. Starship counts a newly added file as `staged` unless its optional `index_added` key is set, and the theme leaves that key alone.

## Contributing

You need Node.js 20 or later, and Starship and git for the tests.

```bash
npm install
npm run build   # regenerates themes/ and images/ from @sepps-workshop/design-system
npm test
```

The files under `themes/` are generated; edit `src/theme-template.mjs` and rebuild. To try a local build, run `STARSHIP_CONFIG=themes/sepps-workshop-custom.toml starship prompt`, or point `STARSHIP_CONFIG` at the file in your shell.

If a colour looks wrong, or two things are hard to tell apart, the cause is almost always in the design system and not in this port. Please open the issue [there](https://github.com/sepps-workshop/sepps-workshop-design-system/issues). A mapping mistake (the right colour on the wrong module) belongs here.

## License

MIT. See [LICENSE](./LICENSE).

## Want to join Sepp’s Workshop?

<img align="right" width="150" src="./images/sepp-recruiting.png" alt="Sepp, the blue robot, holding a sign that reads Be you – with us!" />

sepp.med builds and tests software for places where a bug is more than an inconvenience: medical devices, cars, aircraft. We have been doing it since 1980, as a family-run company in the Nuremberg metropolitan region. If you would rather get the contrast ratio right than argue about it, you might like it here.

Browse the [open positions](https://www.seppmed.com/career/open-positions/), or send a [speculative application](https://www.seppmed.com/career/speculative-application/) if none of them fits yet. Be you – with us.
