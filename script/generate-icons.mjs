import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const outputDir = new URL('../public/icons/', import.meta.url);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#FFF9F4"/>
  <defs>
    <linearGradient id="heart" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.58" stop-color="#FB923C"/>
      <stop offset="1" stop-color="#F0741F"/>
    </linearGradient>
  </defs>
  <path d="M256 422 91 257C-8 158 135 48 256 166 377 48 520 158 421 257Z" fill="url(#heart)"/>
</svg>`;

await mkdir(outputDir, { recursive: true });
const source = new URL('./heart.svg', import.meta.url);
await writeFile(source, svg);

for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-512-maskable.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  const result = spawnSync('rsvg-convert', ['-w', String(size), '-h', String(size), '-o', new URL(name, outputDir).pathname, source.pathname], {
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(result.stderr || `rsvg-convert failed for ${name}`);
}
