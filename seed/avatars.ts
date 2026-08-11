import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const PORTRAIT_DIR = fileURLToPath(new URL("assets/portraits", import.meta.url));

export type Headshot = { buffer: Buffer; contentType: string; extension: string };

/**
 * A speaker's headshot: a real photograph if one is vendored for them, and the
 * generated SVG below if not.
 *
 * The photographs live in `seed/assets/portraits/` and are committed, so seeding
 * stays offline and instant. `npm run media faces` refreshes them; the people
 * they illustrate are fictional and the portraits do not depict them — see
 * `seed/assets/NOTICE.md`.
 */
export function headshotFor(key: string, first: string, last: string): Headshot {
  const photo = join(PORTRAIT_DIR, `${key}.jpg`);
  if (existsSync(photo)) {
    return { buffer: readFileSync(photo), contentType: "image/jpeg", extension: "jpg" };
  }
  return {
    buffer: Buffer.from(avatarSvg(first, last), "utf8"),
    contentType: "image/svg+xml",
    extension: "svg",
  };
}

/** Every vendored portrait, in a stable order, for seeding synthetic speakers. */
export function portraitPool(): Buffer[] {
  if (!existsSync(PORTRAIT_DIR)) return [];
  return readdirSync(PORTRAIT_DIR)
    .filter((name) => name.endsWith(".jpg"))
    .sort()
    .map((name) => readFileSync(join(PORTRAIT_DIR, name)));
}

/** Deterministic pastel from a name so a speaker's avatar never changes colour. */
export function colorFor(seed: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return { bg: `hsl(${hash} 62% 88%)`, fg: `hsl(${hash} 55% 28%)` };
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

/**
 * Headshot placeholder as an SVG portrait — renders anywhere an <img> does, and
 * reads as a photo tile in the gallery rather than a broken image.
 */
export function avatarSvg(first: string, last: string): string {
  const { bg, fg } = colorFor(`${first} ${last}`);
  const { bg: bg2 } = colorFor(`${last}${first}`);
  const gradId = `g${Math.abs(hashOf(`${first}${last}`))}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="Portrait of ${first} ${last}">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#${gradId})"/>
  <g fill="${fg}" opacity="0.72">
    <circle cx="200" cy="150" r="76"/>
    <path d="M52 400c0-84 66-140 148-140s148 56 148 140z"/>
  </g>
  <g fill="${bg}" opacity="0.95">
    <rect x="132" y="330" width="136" height="42" rx="21"/>
  </g>
  <text x="200" y="361" font-family="ui-sans-serif, system-ui, Arial" font-size="26" font-weight="700"
        letter-spacing="2" fill="${fg}" text-anchor="middle">${initials(first, last)}</text>
</svg>`;
}

function hashOf(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 33 + value.charCodeAt(i)) | 0;
  return hash;
}

/* ------------------------------------------------------------ PNG writer -- */

function crc32(buf: Buffer): number {
  let c: number;
  const table: number[] = [];
  for (let n = 0; n < 256; n += 1) {
    c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

/** Minimal valid PNG (used for fixtures/headshot.png). */
export function makePng(size: number, rgb: [number, number, number]): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let offset = 0;
  for (let y = 0; y < size; y += 1) {
    raw[offset] = 0;
    offset += 1;
    for (let x = 0; x < size; x += 1) {
      const shade = 0.75 + 0.25 * (y / size);
      raw[offset] = Math.min(255, Math.round(rgb[0] * shade));
      raw[offset + 1] = Math.min(255, Math.round(rgb[1] * shade));
      raw[offset + 2] = Math.min(255, Math.round(rgb[2] * shade));
      offset += 3;
    }
  }
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Minimal one-page PDF (used for fixtures/slides.pdf). */
export function makePdf(title: string): Buffer {
  const text = `BT /F1 24 Tf 72 700 Td (${title.replace(/[()\\]/g, "")}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}
