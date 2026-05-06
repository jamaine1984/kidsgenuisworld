import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.join(process.cwd(), 'public', 'room-scenes');

const palette = {
  math: ['#4f46e5', '#38bdf8', '#fef08a'],
  reading: ['#f97316', '#facc15', '#22c55e'],
  science: ['#10b981', '#67e8f9', '#f0fdf4'],
  geography: ['#06b6d4', '#2563eb', '#86efac'],
  coding: ['#7c3aed', '#a78bfa', '#f8fafc'],
  art: ['#ec4899', '#fb7185', '#fef3c7'],
  music: ['#c026d3', '#a855f7', '#f0abfc'],
  language: ['#e11d48', '#fb7185', '#fecdd3'],
  puzzle: ['#0d9488', '#22d3ee', '#fef08a'],
  storybook: ['#f59e0b', '#facc15', '#84cc16'],
};

const svg = (_title, colors, body) => `
<svg width="720" height="540" viewBox="0 0 720 540" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${colors[0]}"/>
      <stop offset="0.55" stop-color="${colors[1]}"/>
      <stop offset="1" stop-color="${colors[2]}"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#0f172a" flood-opacity=".28"/>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#0f172a" flood-opacity=".18"/>
    </filter>
  </defs>
  <rect width="720" height="540" rx="56" fill="url(#bg)"/>
  <circle cx="610" cy="76" r="118" fill="#ffffff" opacity=".18"/>
  <circle cx="92" cy="430" r="144" fill="#ffffff" opacity=".12"/>
  <ellipse cx="360" cy="438" rx="230" ry="42" fill="#0f172a" opacity=".18"/>
  ${body}
</svg>`;

const scenes = {
  math: svg('Math Lab', palette.math, `
    <g filter="url(#shadow)">
      <path d="M122 394 L262 176 L388 394 Z" fill="#e0f2fe"/>
      <path d="M256 394 L420 128 L598 394 Z" fill="#ffffff"/>
      <path d="M420 128 L486 394 L598 394 Z" fill="#bae6fd"/>
      <circle cx="250" cy="264" r="46" fill="#fde047"/>
      <circle cx="493" cy="285" r="50" fill="#f97316"/>
      <text x="231" y="280" font-family="Arial" font-size="44" font-weight="900" fill="#1e3a8a">7</text>
      <text x="472" y="301" font-family="Arial" font-size="44" font-weight="900" fill="#7c2d12">+</text>
    </g>`),
  reading: svg('Reading Cove', palette.reading, `
    <path d="M80 362 C190 300 314 438 438 352 C518 296 590 300 660 342 L660 540 L80 540 Z" fill="#38bdf8" opacity=".55"/>
    <g filter="url(#shadow)">
      <rect x="174" y="162" width="150" height="190" rx="24" fill="#fff7ed" transform="rotate(-8 249 257)"/>
      <rect x="344" y="148" width="162" height="204" rx="24" fill="#fef3c7" transform="rotate(8 425 250)"/>
      <rect x="201" y="215" width="82" height="18" rx="9" fill="#fb923c"/>
      <rect x="374" y="210" width="96" height="18" rx="9" fill="#22c55e"/>
      <circle cx="274" cy="292" r="34" fill="#f59e0b"/>
      <path d="M250 286 Q274 320 300 286" stroke="#7c2d12" stroke-width="9" fill="none" stroke-linecap="round"/>
    </g>`),
  science: svg('Science Lab', palette.science, `
    <g filter="url(#shadow)">
      <rect x="238" y="132" width="98" height="260" rx="24" fill="#ecfeff"/>
      <rect x="238" y="252" width="98" height="140" rx="24" fill="#22c55e"/>
      <rect x="402" y="108" width="72" height="292" rx="32" fill="#f0fdfa"/>
      <rect x="402" y="282" width="72" height="118" rx="32" fill="#38bdf8"/>
      <circle cx="304" cy="114" r="28" fill="#d9f99d"/>
      <circle cx="442" cy="88" r="20" fill="#cffafe"/>
      <circle cx="370" cy="180" r="24" fill="#bbf7d0"/>
    </g>`),
  geography: svg('World Map', palette.geography, `
    <g filter="url(#shadow)">
      <circle cx="360" cy="270" r="150" fill="#bfdbfe"/>
      <path d="M260 210 C304 166 350 188 336 242 C320 302 274 286 246 324 C220 272 226 236 260 210Z" fill="#22c55e"/>
      <path d="M410 170 C500 196 520 270 466 318 C430 350 472 378 404 398 C370 350 382 306 392 260 C404 220 376 194 410 170Z" fill="#16a34a"/>
      <path d="M360 120 C310 208 310 332 360 420" stroke="#e0f2fe" stroke-width="10" fill="none"/>
      <path d="M360 120 C410 208 410 332 360 420" stroke="#e0f2fe" stroke-width="10" fill="none"/>
      <path d="M212 270 H508" stroke="#e0f2fe" stroke-width="10"/>
      <path d="M542 146 C582 146 614 178 614 218 C614 270 542 338 542 338 C542 338 470 270 470 218 C470 178 502 146 542 146Z" fill="#f97316"/>
      <circle cx="542" cy="218" r="24" fill="#fff7ed"/>
    </g>`),
  coding: svg('Code Castle', palette.coding, `
    <g filter="url(#shadow)">
      <rect x="190" y="240" width="340" height="170" rx="28" fill="#ede9fe"/>
      <rect x="226" y="174" width="72" height="236" rx="18" fill="#ddd6fe"/>
      <rect x="422" y="174" width="72" height="236" rx="18" fill="#ddd6fe"/>
      <path d="M226 174 L262 128 L298 174 Z" fill="#f8fafc"/>
      <path d="M422 174 L458 128 L494 174 Z" fill="#f8fafc"/>
      <rect x="280" y="278" width="160" height="92" rx="22" fill="#4c1d95"/>
      <circle cx="326" cy="324" r="15" fill="#67e8f9"/>
      <circle cx="394" cy="324" r="15" fill="#67e8f9"/>
      <path d="M320 360 H400" stroke="#c4b5fd" stroke-width="12" stroke-linecap="round"/>
    </g>`),
  art: svg('Art Studio', palette.art, `
    <g filter="url(#shadow)">
      <path d="M228 172 C162 220 160 324 232 376 C278 410 320 382 344 400 C382 430 468 396 496 334 C538 238 454 148 350 156 C310 160 270 142 228 172Z" fill="#fff7ed"/>
      <circle cx="250" cy="254" r="30" fill="#fb7185"/>
      <circle cx="332" cy="224" r="30" fill="#facc15"/>
      <circle cx="410" cy="262" r="30" fill="#38bdf8"/>
      <circle cx="322" cy="330" r="34" fill="#22c55e"/>
      <rect x="458" y="154" width="42" height="260" rx="21" fill="#7c2d12" transform="rotate(34 479 284)"/>
      <path d="M540 132 C584 128 600 176 562 200 L514 174 Z" fill="#fef3c7"/>
    </g>`),
  music: svg('Music Room', palette.music, `
    <g filter="url(#shadow)">
      <circle cx="280" cy="298" r="56" fill="#fef3c7"/>
      <rect x="326" y="138" width="26" height="178" rx="13" fill="#fef3c7"/>
      <path d="M350 144 C438 150 440 216 358 218 Z" fill="#fef3c7"/>
      <circle cx="450" cy="344" r="48" fill="#f0abfc"/>
      <rect x="490" y="190" width="24" height="158" rx="12" fill="#f0abfc"/>
      <path d="M514 192 C574 196 578 250 518 256 Z" fill="#f0abfc"/>
      <path d="M176 220 C230 170 260 170 312 220" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M156 292 C232 238 288 238 364 292" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity=".75"/>
    </g>`),
  language: svg('Language Hub', palette.language, `
    <g filter="url(#shadow)">
      <rect x="128" y="172" width="218" height="118" rx="34" fill="#fff1f2"/>
      <path d="M196 288 L164 334 L252 288 Z" fill="#fff1f2"/>
      <circle cx="194" cy="231" r="14" fill="#be123c"/>
      <circle cx="238" cy="231" r="14" fill="#be123c"/>
      <circle cx="282" cy="231" r="14" fill="#be123c"/>
      <rect x="374" y="238" width="236" height="124" rx="34" fill="#ffe4e6"/>
      <path d="M520 360 L568 410 L486 360 Z" fill="#ffe4e6"/>
      <circle cx="438" cy="304" r="14" fill="#9f1239"/>
      <circle cx="492" cy="304" r="14" fill="#9f1239"/>
      <circle cx="546" cy="304" r="14" fill="#9f1239"/>
      <path d="M360 120 L392 178 H328 Z" fill="#fef2f2"/>
      <rect x="330" y="176" width="60" height="92" rx="28" fill="#fda4af"/>
    </g>`),
  puzzle: svg('Puzzle Pier', palette.puzzle, `
    <g filter="url(#shadow)">
      <rect x="210" y="150" width="120" height="120" rx="26" fill="#fef08a"/>
      <rect x="342" y="150" width="120" height="120" rx="26" fill="#67e8f9"/>
      <rect x="210" y="282" width="120" height="120" rx="26" fill="#a7f3d0"/>
      <rect x="342" y="282" width="120" height="120" rx="26" fill="#f0abfc"/>
      <circle cx="330" cy="210" r="24" fill="#67e8f9"/>
      <circle cx="402" cy="270" r="24" fill="#67e8f9"/>
      <circle cx="330" cy="342" r="24" fill="#f0abfc"/>
      <path d="M512 180 L582 250 L512 320" stroke="#fff" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`),
  storybook: svg('Story Tree', palette.storybook, `
    <g filter="url(#shadow)">
      <rect x="332" y="234" width="54" height="176" rx="22" fill="#92400e"/>
      <circle cx="300" cy="212" r="86" fill="#84cc16"/>
      <circle cx="404" cy="202" r="92" fill="#65a30d"/>
      <circle cx="362" cy="140" r="76" fill="#a3e635"/>
      <rect x="258" y="224" width="206" height="120" rx="30" fill="#fef3c7"/>
      <path d="M258 224 L362 158 L464 224 Z" fill="#f59e0b"/>
      <rect x="326" y="270" width="72" height="74" rx="18" fill="#92400e"/>
      <path d="M158 360 Q260 314 360 360 T562 360 L562 430 Q460 382 360 430 Q260 382 158 430 Z" fill="#fff7ed"/>
      <path d="M360 360 V430" stroke="#f59e0b" stroke-width="8"/>
    </g>`),
};

await fs.mkdir(outDir, { recursive: true });

for (const [name, source] of Object.entries(scenes)) {
  await sharp(Buffer.from(source))
    .resize(720, 540)
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(path.join(outDir, `${name}.png`));
}

console.log(`Generated ${Object.keys(scenes).length} room scene images in ${outDir}`);
