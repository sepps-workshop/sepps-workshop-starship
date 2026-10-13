// Renders a prompt with the real Starship and each built file, in a
// throwaway git repository, so a TOML mistake, an unknown key or a style
// Starship cannot resolve shows up as a warning.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import tokens from "@sepps-workshop/design-system";
import { resolveTarget } from "@sepps-workshop/design-system/tools/build-tokens";
import { themeFiles, GIT_STATUS, LANGUAGE_MODULES } from "./theme-template.mjs";

const work = mkdtempSync(join(tmpdir(), "sepps-workshop-starship-"));
const repo = join(work, "repo");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  assert.equal(
    result.error,
    undefined,
    `${command} must be installed to run this test`,
  );
  return result;
}

run("git", ["init", "--quiet", repo]);
// An untracked file: git_status has something to show, nodejs and package too.
writeFileSync(join(repo, "package.json"), '{"name":"x","version":"1.2.3"}\n');

function starship(file, ...args) {
  return run("starship", args, {
    cwd: repo,
    env: {
      ...process.env,
      // Starship takes the directory from PWD, not from the process.
      PWD: repo,
      STARSHIP_CONFIG: fileURLToPath(
        new URL(`../themes/${file}`, import.meta.url),
      ),
      STARSHIP_CACHE: join(work, "cache"),
      STARSHIP_LOG: "warn",
      STARSHIP_SHELL: "",
    },
  });
}

// "#rrggbb" -> the 24-bit sequence Starship writes for it.
const ansi = (target) => {
  const hex = resolveTarget(tokens, target);
  const channel = (at) => parseInt(hex.slice(at, at + 2), 16);
  return `38;2;${channel(1)};${channel(3)};${channel(5)}m`;
};

const roles = tokens.prompt_roles;

for (const file of Object.keys(themeFiles(tokens))) {
  test(`starship draws ${file} without complaint, in the role colours`, () => {
    const ok = starship(file, "prompt", "--cmd-duration", "5000");
    assert.equal(ok.stderr, "");
    assert.equal(ok.status, 0);
    for (const [what, sequence] of [
      ["directory", `1;${ansi(roles.directory.color)}repo`],
      ["git_branch", ansi(roles.git_branch.color)],
      ["untracked", `${ansi(roles.git_status.untracked)}?1`],
      ["duration", `${ansi(roles.duration.color)}5s`],
      ["character", `${ansi(roles.character_success.color)}❯`],
    ]) {
      assert.ok(ok.stdout.includes(sequence), `${file}: ${what}`);
    }

    const failed = starship(file, "prompt", "--status", "1");
    assert.equal(failed.stderr, "");
    assert.ok(
      failed.stdout.includes(`${ansi(roles.character_error.color)}✗`),
      `${file}: error character`,
    );
  });
}

// Table name -> keys, from the config Starship prints for its defaults.
function defaults() {
  const printed = starship(
    Object.keys(themeFiles(tokens))[0],
    "print-config",
    "--default",
  );
  assert.equal(printed.status, 0);
  const result = {};
  let current;
  for (const line of printed.stdout.split("\n")) {
    const head = line.match(/^\[(\w+)\]$/);
    const key = line.match(/^(\w+) = /);
    if (head) current = result[head[1]] = [];
    else if (current && key) current.push(key[1]);
  }
  return result;
}

test("the language modules are the Starship modules that print a version", () => {
  const versioned = Object.entries(defaults())
    .filter(([, keys]) => keys.includes("version_format"))
    .map(([name]) => name);
  assert.deepEqual(
    LANGUAGE_MODULES,
    versioned.sort(),
    "update LANGUAGE_MODULES in src/theme-template.mjs for this Starship",
  );
});

test("every git state the theme sets is a key Starship knows", () => {
  const known = defaults().git_status;
  for (const state of Object.keys(GIT_STATUS)) {
    assert.ok(known.includes(state), state);
  }
});
