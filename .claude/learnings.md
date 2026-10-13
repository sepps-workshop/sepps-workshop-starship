# Learnings

- 2026-10-13: Starship takes the directory it shows from the `PWD` environment variable, not from the process's working directory. A test that spawns `starship prompt` must set `PWD` as well as `cwd`.
- 2026-10-13: Text in a Starship format string outside a `[text](style)` group is drawn in the terminal's foreground. That keeps the brackets of `git_status` without a colour the foundation does not name.
- 2026-10-13: Do not override the `format` of every language module in one sweep: `python`, `terraform`, `pulumi`, `dotnet` and others show more than `$version`, and a shared format drops it.
- 2026-10-13: Starship's `git_status` counts a newly added file as `staged` unless the optional `index_added` key is set, so the foundation's `added` state stays unmapped. Its language modules are the ones with a `version_format` key in `starship print-config --default`.
