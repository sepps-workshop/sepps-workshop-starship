// Reads foundation tokens from @sepps-workshop/design-system, emits the two
// Starship config files and copies the README images from the foundation.

import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tokens from "@sepps-workshop/design-system";

import { themeFiles } from "./src/theme-template.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const THEMES = join(ROOT, "themes");
const IMAGES = join(ROOT, "images");

mkdirSync(THEMES, { recursive: true });
const files = Object.entries(themeFiles(tokens));
for (const [name, content] of files) {
  writeFileSync(join(THEMES, name), content, "utf8");
}

// The images are the foundation's; copying them here keeps them from drifting.
mkdirSync(IMAGES, { recursive: true });
for (const image of ["sepps-workshop-header.jpg", "sepp-recruiting.png"]) {
  copyFileSync(
    fileURLToPath(
      import.meta.resolve(`@sepps-workshop/design-system/assets/${image}`),
    ),
    join(IMAGES, image),
  );
}

console.log(
  `Built ${files.map(([name]) => `themes/${name}`).join(", ")} and images/`,
);
