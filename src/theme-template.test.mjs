import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tokens from "@sepps-workshop/design-system";
import { resolveTarget } from "@sepps-workshop/design-system/tools/build-tokens";
import {
  buildColorsOnly,
  buildCustomPrompt,
  themeFiles,
  palette,
  promptTargets,
  GIT_STATUS,
  GIT_STATUS_UNMAPPED,
  LANGUAGE_MODULES,
  PALETTE,
} from "./theme-template.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const roles = tokens.prompt_roles;
const colors = buildColorsOnly(tokens);
const custom = buildCustomPrompt(tokens);
const both = [
  ["colours only", colors],
  ["custom prompt", custom],
];

// Table name -> { key: raw value } for the tables of a generated file.
function tables(content) {
  const result = {};
  let current;
  for (const line of content.split("\n")) {
    const head = line.match(/^\[([\w.]+)\]$/);
    if (head) current = result[head[1]] = {};
    else if (current && line.includes(" = ")) {
      const at = line.indexOf(" = ");
      current[line.slice(0, at)] = JSON.parse(line.slice(at + 3));
    }
  }
  return result;
}

test("the palette holds the colours the prompt roles name, and no others", () => {
  const targets = promptTargets(tokens);
  assert.ok(targets.length >= 5, "the foundation names prompt colours");
  assert.equal(Object.keys(palette(tokens)).length, targets.length);
  assert.deepEqual(
    Object.values(palette(tokens)),
    targets.map((target) => resolveTarget(tokens, target)),
  );
  for (const [kind, content] of both) {
    assert.deepEqual(
      tables(content)[`palettes.${PALETTE}`],
      palette(tokens),
      kind,
    );
  }
});

test("every style names a palette key or a text style", () => {
  const known = new Set([...Object.keys(palette(tokens)), "bold"]);
  for (const [kind, content] of both) {
    const words = [
      ...[...content.matchAll(/^style = "(.+)"$/gm)].flatMap((m) =>
        m[1].split(" "),
      ),
      ...[...content.matchAll(/\]\(([a-z_ ]+)\)/g)].flatMap((m) =>
        m[1].split(" "),
      ),
    ];
    assert.ok(words.length > LANGUAGE_MODULES.length, kind);
    for (const word of words) assert.ok(known.has(word), `${kind}: ${word}`);
  }
});

test("each module takes the colour of its role", () => {
  const key = (target) => target.split(".").pop();
  for (const [kind, content] of both) {
    const t = tables(content);
    assert.equal(t.directory.style, `bold ${key(roles.directory.color)}`, kind);
    assert.equal(t.git_branch.style, key(roles.git_branch.color), kind);
    assert.equal(t.cmd_duration.style, key(roles.duration.color), kind);
    assert.equal(t.time.style, key(roles.time.color), kind);
    assert.equal(
      t.character.success_symbol,
      `[❯](${key(roles.character_success.color)})`,
      kind,
    );
    assert.equal(
      t.character.error_symbol,
      `[❯](${key(roles.character_error.color)})`,
      kind,
    );
    for (const name of LANGUAGE_MODULES) {
      assert.equal(t[name].style, key(roles.language_module.color), name);
    }
  }
});

test("every git state of the foundation is mapped or listed as unmapped", () => {
  assert.deepEqual(
    [...Object.keys(GIT_STATUS), ...GIT_STATUS_UNMAPPED].sort(),
    Object.keys(roles.git_status).sort(),
  );
  for (const [kind, content] of both) {
    const status = tables(content).git_status;
    for (const state of Object.keys(GIT_STATUS)) {
      assert.ok(
        status[state].endsWith(
          `](${roles.git_status[state].split(".").pop()})`,
        ),
        `${kind}: ${state}`,
      );
    }
    // The brackets around the states carry no style of their own.
    assert.equal(status.format, "(\\[$all_status$ahead_behind\\] )", kind);
    assert.equal(status.style, undefined, kind);
  }
});

test("root keys come before the first table, and format leads", () => {
  for (const [kind, content] of both) {
    const palette = content.indexOf(`\npalette = "${PALETTE}"\n`);
    const timeout = content.indexOf("\ncommand_timeout = 1000\n");
    const firstTable = content.search(/^\[/m);
    assert.ok(timeout > 0 && timeout < palette && palette < firstTable, kind);
  }
  const format = custom.indexOf('\nformat = """');
  assert.ok(format > 0 && format < custom.indexOf("\ncommand_timeout"));
});

test("the colours-only file keeps Starship's layout", () => {
  assert.doesNotMatch(colors, /^format = """/m);
  const t = tables(colors);
  assert.equal(t.fill, undefined);
  assert.equal(t.time.disabled, undefined);
  for (const [name, keys] of Object.entries(t)) {
    if (name !== "git_status") assert.equal(keys.format, undefined, name);
  }
});

test("the custom file lays out two lines with the time at the right", () => {
  const format = custom.match(/^format = """\n(.+)\n(.+)"""$/m);
  assert.ok(format, "a two-line format");
  assert.equal(
    format[1],
    `$directory$git_branch$git_status${LANGUAGE_MODULES.map((m) => `$${m}`).join("")}$cmd_duration$fill$time`,
  );
  assert.equal(format[2], "$character");
  const t = tables(custom);
  assert.equal(t.time.disabled, false);
  assert.equal(t.fill.symbol, " ");
  assert.equal(t.fill.style, undefined);
  for (const name of LANGUAGE_MODULES) {
    assert.deepEqual(Object.keys(t[name]), ["style"], name);
  }
});

test("the sources contain no colour value", () => {
  for (const file of ["src/theme-template.mjs", "build.mjs"]) {
    assert.doesNotMatch(
      read(file).toString("utf8"),
      /#[0-9a-f]{3,8}\b|\balphaOver\b/i,
      `${file} must take every colour from the tokens`,
    );
  }
});

test("the committed themes and images are what the build produces", () => {
  const files = themeFiles(tokens);
  assert.deepEqual(
    readdirSync(new URL("../themes/", import.meta.url)).sort(),
    Object.keys(files).sort(),
  );
  for (const [name, content] of Object.entries(files)) {
    assert.equal(
      read(`themes/${name}`).toString("utf8"),
      content,
      `themes/${name} is stale: run \`npm run build\``,
    );
    assert.ok(content.endsWith("\n") && !content.endsWith("\n\n"));
  }
  for (const image of ["sepps-workshop-header.jpg", "sepp-recruiting.png"]) {
    const source = readFileSync(
      fileURLToPath(
        import.meta.resolve(`@sepps-workshop/design-system/assets/${image}`),
      ),
    );
    assert.ok(read(`images/${image}`).equals(source), `${image} is stale`);
  }
});
