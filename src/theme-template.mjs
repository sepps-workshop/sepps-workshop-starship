// Maps the foundation's prompt roles to Starship `starship.toml` content.
// Two pure functions: tokens -> file content.
//
// Starship draws on the terminal's background and knows nothing of syntax
// or the sixteen ANSI colours: those belong to the shell and terminal ports.
// Config reference: https://starship.rs/config/

import { resolveTarget } from "@sepps-workshop/design-system/tools/build-tokens";

// The file name without extension, and the name of the palette table.
export const THEME_ID = "sepps-workshop";
export const PALETTE = "sepps_workshop";
const HOMEPAGE = "https://github.com/sepps-workshop/sepps-workshop-starship";

// Every Starship module that prints a version. All take the one
// `language_module` role: the symbol identifies the language, not a hue.
export const LANGUAGE_MODULES = [
  "buf",
  "bun",
  "c",
  "cmake",
  "cobol",
  "cpp",
  "crystal",
  "daml",
  "dart",
  "deno",
  "dotnet",
  "elixir",
  "elm",
  "erlang",
  "fennel",
  "fortran",
  "gleam",
  "golang",
  "gradle",
  "haskell",
  "haxe",
  "helm",
  "java",
  "julia",
  "kotlin",
  "lua",
  "maven",
  "nim",
  "nodejs",
  "ocaml",
  "opa",
  "package",
  "perl",
  "php",
  "pixi",
  "pulumi",
  "purescript",
  "python",
  "quarto",
  "raku",
  "red",
  "rlang",
  "ruby",
  "rust",
  "scala",
  "solidity",
  "swift",
  "terraform",
  "typst",
  "vagrant",
  "vlang",
  "xmake",
  "zig",
];

// Starship `git_status` key -> what it prints. The symbols are Starship's
// own; the count is added. The keys are also states in `prompt_roles`.
export const GIT_STATUS = {
  conflicted: "=$count",
  ahead: "⇡$count",
  behind: "⇣$count",
  diverged: "⇕⇡$ahead_count⇣$behind_count",
  untracked: "?$count",
  stashed: "\\\\$$count",
  modified: "!$count",
  staged: "+$count",
  renamed: "»$count",
  deleted: "✘$count",
};

// States the foundation names and the theme does not set: Starship counts
// a newly added file as staged unless its optional `index_added` is set.
export const GIT_STATUS_UNMAPPED = ["added"];

// "semantic.info" -> "info": a palette key Starship accepts in a style.
const paletteName = (target) => target.split(".").pop();

// Every colour target `prompt_roles` names, in order of first use.
export function promptTargets(tokens) {
  const { git_status, ...roles } = tokens.prompt_roles;
  return [
    ...new Set([
      ...Object.values(roles).map((role) => role.color),
      ...Object.values(git_status),
    ]),
  ];
}

// Palette key -> colour, for exactly the targets the prompt roles use.
export function palette(tokens) {
  return Object.fromEntries(
    promptTargets(tokens).map((target) => [
      paletteName(target),
      resolveTarget(tokens, target),
    ]),
  );
}

// One role -> a Starship style string, e.g. "bold accent".
const style = (role) =>
  [...(role.style ?? []), paletteName(role.color)].join(" ");

const table = (name, lines) => [`[${name}]`, ...lines].join("\n");

function header(tokens, kind) {
  const font = tokens.typography.mono;
  return [
    `# ${tokens.meta.name} for Starship: ${kind}`,
    `# Generated, do not edit by hand. Source: ${HOMEPAGE}`,
    `# The icons need a Nerd Font. Recommended: ${font.nerd_font} (${font.nerd_font_source})`,
  ].join("\n");
}

function render(tokens, custom) {
  const roles = tokens.prompt_roles;
  const language = style(roles.language_module);

  const root = [
    // Root keys come before the first table, or TOML reads them as part of
    // it. `format` leads: Starship 1.26.0 gets the width of $fill wrong
    // when a table precedes it.
    ...(custom
      ? [
          `format = """\n$directory$git_branch$git_status${LANGUAGE_MODULES.map((name) => `$${name}`).join("")}$cmd_duration$fill$time\n$character"""\n`,
        ]
      : []),
    // Version checks of some toolchains outlast Starship's 500 ms.
    "command_timeout = 1000",
    `palette = "${PALETTE}"`,
  ].join("\n");

  const tables = [
    table(
      `palettes.${PALETTE}`,
      Object.entries(palette(tokens)).map(
        ([name, colour]) => `${name} = "${colour}"`,
      ),
    ),
    table("directory", [`style = "${style(roles.directory)}"`]),
    table("git_branch", [`style = "${style(roles.git_branch)}"`]),
    table("git_status", [
      // Each state brings its own colour. The brackets carry no style, so
      // they are drawn in the terminal's foreground.
      'format = "(\\\\[$all_status$ahead_behind\\\\] )"',
      ...Object.entries(GIT_STATUS).map(
        ([state, text]) =>
          `${state} = "[${text}](${paletteName(roles.git_status[state])})"`,
      ),
    ]),
    table("character", [
      `success_symbol = "[❯](${style(roles.character_success)})"`,
      `error_symbol = "[❯](${style(roles.character_error)})"`,
    ]),
    table("cmd_duration", [
      `style = "${style(roles.duration)}"`,
      ...(custom ? ['format = "[$duration]($style) "'] : []),
    ]),
    ...(custom ? [table("fill", ['symbol = " "'])] : []),
    table("time", [
      ...(custom ? ["disabled = false"] : []),
      `style = "${style(roles.time)}"`,
      ...(custom ? ['format = "[$time]($style)"'] : []),
    ]),
    ...LANGUAGE_MODULES.map((name) =>
      // The formats stay Starship's: several show more than a version
      // (a virtualenv, a workspace), and that must not get lost.
      table(name, [`style = "${language}"`]),
    ),
  ];

  return (
    [
      header(tokens, custom ? "custom prompt" : "colours only"),
      root,
      ...tables,
    ].join("\n\n") + "\n"
  );
}

// Starship's default prompt, repainted.
export const buildColorsOnly = (tokens) => render(tokens, false);

// The same colours on a two-line layout with the time at the right edge.
export const buildCustomPrompt = (tokens) => render(tokens, true);

// File name -> content, for the build and the tests.
export const themeFiles = (tokens) => ({
  [`${THEME_ID}.toml`]: buildColorsOnly(tokens),
  [`${THEME_ID}-custom.toml`]: buildCustomPrompt(tokens),
});
