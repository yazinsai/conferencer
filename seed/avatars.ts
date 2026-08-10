import { deflateSync } from "node:zlib";

/** Deterministic pastel from a name so a speaker's avatar never changes colour. */
export function colorFor(seed: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return { bg: `hsl(${hash} 62% 88%)`, fg: `hsl(${hash} 55% 28%)` };
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

/** Headshot placeholder as an SVG — renders anywhere an <img> does. */
export function avatarSvg(first: string, last: string): string {
  const { bg, fg } = colorFor(`${first} ${last}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${first} ${last}">
  <rect width="400" height="400" fill="${bg}"/>
  <circle cx="200" cy="158" r="72" fill="${fg}" opacity="0.22"/>
  <path d="M60 400c0-79 63-132 140-132s140 53 140 132z" fill="${fg}" opacity="0.22"/>
  <text x="200" y="232" font-family="ui-sans-serif, system-ui, Arial" font-size="132" font-weight="700"
        fill="${fg}" text-anchor="middle">${initials(first, last)}</text>
</svg>`;
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
