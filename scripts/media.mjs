#!/usr/bin/env node
/**
 * Fetches the demo's photography. **Maintainer-only** — the assets it writes are
 * committed, so a clone never needs this script, and `npm run seed` never touches
 * the network.
 *
 *   npm run media faces            # speaker portraits  → seed/assets/portraits/
 *   npm run media faces -- --review  # contact sheets for picking indices
 *   npm run media scenes           # the two photographs → public/media/
 *
 * `scenes` needs PIXABAY_API_KEY (put it in .env.local — it is never required to
 * run the app) and ffmpeg. `faces` needs neither.
 *
 * Two sources, on purpose:
 *
 *   Faces  — randomuser.me/photos, hand-picked from the authorized section of
 *            UI Faces, i.e. a set curated for placeholder use. Using a stock
 *            photo of an identifiable stranger to illustrate a fabricated name
 *            and employer is a different thing, and not one this repo does.
 *   Scenes — Pixabay, wide shots where no individual is the subject.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const command = args[0];
const REVIEW = args.includes("--review");

/* ------------------------------------------------------------------ faces -- */

const RANDOMUSER = "https://randomuser.me/api/portraits";

/**
 * One face per speaker, pinned so a re-run is reproducible and a rebuild never
 * shuffles who is who. Indices were chosen by eye from the contact sheets that
 * `--review` writes, matching each fixture's name as plausibly as a 200-face set
 * allows. `dir` is randomuser's own directory split, not a claim about anybody.
 *
 * Jonas is absent deliberately: one speaker without a photo keeps the gallery's
 * no-photo fallback demonstrable (EMB-12).
 */
const FACES = {
  priya: { dir: "women", index: 8 }, //  Priya Raman
  marcus: { dir: "men", index: 80 }, //  Marcus Okafor
  grace: { dir: "women", index: 27 }, // Grace Nakamura
  hugo: { dir: "men", index: 41 }, //    Hugo Martins
  elena: { dir: "women", index: 26 }, // Elena Fischer
  ana: { dir: "women", index: 29 }, //   Ana Beltrán
  keiko: { dir: "women", index: 51 }, // Keiko Tanaka
  farid: { dir: "men", index: 86 }, //   Farid Haddad
  iris: { dir: "women", index: 62 }, //  Iris Oyelaran
  chen: { dir: "men", index: 26 }, //    Chen Wei
  dana: { dir: "women", index: 45 }, //  Dana Kowalski
};

async function download(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

/** Writes two indexed contact sheets so the pinned indices can be chosen by eye. */
async function reviewFaces() {
  const out = "/tmp/faces";
  mkdirSync(out, { recursive: true });
  for (const dir of ["women", "men"]) {
    const cells = [];
    for (let i = 0; i < 100; i += 1) {
      const buffer = await download(`${RANDOMUSER}/${dir}/${i}.jpg`);
      cells.push(
        `<figure style="margin:0;text-align:center"><img src="data:image/jpeg;base64,${buffer.toString(
          "base64",
        )}" width="72" height="72" style="border-radius:8px;display:block"><figcaption style="font:11px ui-monospace">${i}</figcaption></figure>`,
      );
      if (i % 20 === 19) process.stdout.write(".");
    }
    writeFileSync(
      join(out, `${dir}.html`),
      `<html><body style="background:#fff;font-family:system-ui;padding:20px"><h2>${dir}</h2>
       <div style="display:grid;grid-template-columns:repeat(10,72px);gap:12px">${cells.join("")}</div></body></html>`,
    );
    console.log(` ${dir} sheet → ${join(out, `${dir}.html`)}`);
  }
}

async function fetchFaces() {
  const out = join(ROOT, "seed/assets/portraits");
  mkdirSync(out, { recursive: true });
  const rows = [];
  let total = 0;
  for (const [key, { dir, index }] of Object.entries(FACES)) {
    const url = `${RANDOMUSER}/${dir}/${index}.jpg`;
    const buffer = await download(url);
    writeFileSync(join(out, `${key}.jpg`), buffer);
    total += buffer.length;
    rows.push(`| \`${key}.jpg\` | ${dir}/${index} | ${url} | ${Math.round(buffer.length / 102.4) / 10} KB |`);
    console.log(`  ✓ ${key.padEnd(8)} ${dir}/${index}  ${Math.round(buffer.length / 1024)} KB`);
  }
  writeFileSync(
    join(ROOT, "seed/assets/NOTICE.md"),
    `# Speaker portraits

The people in this repository's demo data are **fictional**. These portraits are placeholder
photography and do not depict the named individuals, their employers, or anyone connected to them.

## Source

[randomuser.me/photos](https://randomuser.me/photos). Its portraits are, in the project's own words,
"hand picked from the authorized section of [UI Faces](https://uifaces.co)" — a set curated for
placeholder and prototyping use. See the [UI Faces FAQ](https://uifaces.co) for the terms that govern
them; they are appropriate for a demo like this one, and a production deployment should replace them
with photographs of its actual speakers.

Served at 128×128, already square and face-centred, so they are vendored unmodified.

Regenerate with \`npm run media faces\`. The indices are pinned in \`scripts/media.mjs\` so a re-run
never reshuffles who is who.

| File | randomuser index | URL | Size |
| --- | --- | --- | --- |
${rows.join("\n")}

Total ${Math.round(total / 1024)} KB across ${rows.length} portraits.

One speaker — Jonas Lindqvist — has no portrait on purpose, so the speaker gallery's no-photo
fallback stays visible in the demo.
`,
  );
  console.log(`\n${rows.length} portraits, ${Math.round(total / 1024)} KB → seed/assets/portraits/`);
}

/* ----------------------------------------------------------------- scenes -- */

/**
 * The two photographs the design system allows (design.md § Per-page
 * allowances). Both are wide shots in which no individual is the subject.
 * Pixabay ids are pinned for the same reason the face indices are.
 */
const SCENES = [
  {
    name: "venue",
    id: 2565153,
    query: "conference hall",
    alt: "A conference auditorium seen from the back of the room.",
    width: 2000,
  },
  {
    name: "audience",
    id: 1597531,
    query: "conference audience",
    alt: "An audience seated in a conference auditorium.",
    width: 2000,
  },
];

function env(name) {
  const local = join(ROOT, ".env.local");
  if (!process.env[name] && existsSync(local)) {
    const match = new RegExp(`^${name}=(.*)$`, "m").exec(readFileSync(local, "utf8"));
    if (match) return match[1].trim();
  }
  return process.env[name];
}

async function fetchScenes() {
  const key = env("PIXABAY_API_KEY");
  if (!key) throw new Error("PIXABAY_API_KEY is not set (put it in .env.local — see .env.example)");
  const out = join(ROOT, "public/media");
  mkdirSync(out, { recursive: true });

  const rows = [];
  for (const scene of SCENES) {
    const meta = await fetch(`https://pixabay.com/api/?key=${key}&id=${scene.id}`).then((r) => r.json());
    const hit = meta.hits?.[0];
    if (!hit) throw new Error(`Pixabay returned nothing for id ${scene.id}`);

    const source = join("/tmp", `${scene.name}-source.jpg`);
    writeFileSync(source, await download(hit.largeImageURL));

    // 16:9 centre crop, then WebP. ffmpeg is a maintainer-time dependency only.
    const target = join(out, `${scene.name}.webp`);
    execFileSync("ffmpeg", [
      "-y", "-loglevel", "error", "-i", source,
      "-vf", `crop='min(iw,ih*16/9)':'min(ih,iw*9/16)',scale=${scene.width}:-2`,
      "-quality", "80", target,
    ]);
    const bytes = readFileSync(target).length;
    rows.push(
      `| \`${scene.name}.webp\` | [${hit.id}](${hit.pageURL}) | ${hit.user} | ${Math.round(bytes / 1024)} KB |`,
    );
    console.log(`  ✓ ${scene.name.padEnd(10)} ${Math.round(bytes / 1024)} KB  by ${hit.user}`);
  }

  writeFileSync(
    join(out, "NOTICE.md"),
    `# Photography

Two photographs, used in the two places \`design.md\` § Per-page allowances permits: the public event
fold and the landing page's proof band. Both are wide shots in which no individual is the subject.

Source: [Pixabay](https://pixabay.com), under the
[Content License](https://pixabay.com/service/license-summary/) — free to use and modify, no
attribution required. Credit is given anyway, as it is for the fonts.

Centre-cropped to 16:9 and re-encoded as WebP. Regenerate with \`npm run media scenes\`
(needs \`PIXABAY_API_KEY\` and \`ffmpeg\`).

| File | Pixabay | Photographer | Size |
| --- | --- | --- | --- |
${rows.join("\n")}
`,
  );
  console.log(`\n${rows.length} photographs → public/media/`);
}

/* -------------------------------------------------------------------- cli -- */

const COMMANDS = {
  faces: () => (REVIEW ? reviewFaces() : fetchFaces()),
  scenes: fetchScenes,
};

if (!COMMANDS[command]) {
  console.error("usage: npm run media <faces|scenes> [-- --review]");
  process.exit(1);
}
console.log(`\x1b[1mConferencer media\x1b[0m → ${command}${REVIEW ? " (review)" : ""}\n`);
COMMANDS[command]().catch((error) => {
  console.error(`\x1b[31m${error.stack ?? error.message}\x1b[0m`);
  process.exit(1);
});
