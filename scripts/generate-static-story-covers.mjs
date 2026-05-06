import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const storyBookPath = path.join(root, 'components', 'StoryBook.tsx');
const outputDir = path.join(root, 'public', 'story-covers');
const source = fs.readFileSync(storyBookPath, 'utf8');

fs.mkdirSync(outputDir, { recursive: true });

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const titleLines = (title) => {
  const words = title.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > 17 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
};

const palettes = {
  adventure: ['#f97316', '#fde68a', '#22d3ee', '#1f2937', '#fff7ed'],
  animals: ['#16a34a', '#dcfce7', '#bef264', '#14532d', '#f7fee7'],
  nature: ['#0891b2', '#cffafe', '#34d399', '#164e63', '#ecfeff'],
  fantasy: ['#7c3aed', '#ede9fe', '#f0abfc', '#312e81', '#faf5ff'],
  friendship: ['#db2777', '#fce7f3', '#fbbf24', '#831843', '#fff1f2'],
  family: ['#d97706', '#fef3c7', '#fb7185', '#78350f', '#fffbeb'],
  learning: ['#2563eb', '#dbeafe', '#facc15', '#1e3a8a', '#eff6ff'],
};

const storyRegex = /id: '([^']+)', title: '((?:\\'|[^'])+)', author: '((?:\\'|[^'])+)', cover: '([^']*)', gradeLevel: (\d+), category: '([^']+)'/g;
const stories = Array.from(source.matchAll(storyRegex)).map(match => ({
  id: match[1],
  title: match[2].replace(/\\'/g, "'"),
  cover: match[4],
  gradeLevel: Number(match[5]),
  category: match[6],
}));

const getStoryBadgeLabel = (gradeLevel) => {
  if (gradeLevel === 1) return 'PK';
  if (gradeLevel === 2) return 'K';
  return `G${gradeLevel - 2}`;
};

const shape = {
  cloud: (x, y, scale = 1, fill = '#ffffff', opacity = 0.78) => `
    <g opacity="${opacity}" transform="translate(${x} ${y}) scale(${scale})">
      <circle cx="36" cy="30" r="24" fill="${fill}"/><circle cx="64" cy="24" r="30" fill="${fill}"/><circle cx="96" cy="34" r="22" fill="${fill}"/>
      <rect x="28" y="32" width="88" height="30" rx="15" fill="${fill}"/>
    </g>`,
  star: (x, y, r, fill, opacity = 1) => `<path d="M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z" fill="${fill}" opacity="${opacity}"/>`,
  leaf: (x, y, rotate, fill) => `<ellipse cx="${x}" cy="${y}" rx="28" ry="58" fill="${fill}" transform="rotate(${rotate} ${x} ${y})"/>`,
};

const sceneFor = (story, colors) => {
  const [primary, soft, accent, ink] = colors;
  const title = story.title.toLowerCase();
  const category = story.category;

  if (title.includes('robot') || title.includes('code')) {
    return `
      <rect x="260" y="278" width="248" height="210" rx="42" fill="#e0f2fe" stroke="${ink}" stroke-width="12"/>
      <rect x="304" y="224" width="160" height="76" rx="34" fill="${accent}" stroke="${ink}" stroke-width="10"/>
      <circle cx="330" cy="370" r="28" fill="${ink}"/><circle cx="438" cy="370" r="28" fill="${ink}"/>
      <path d="M322 436 Q384 470 446 436" fill="none" stroke="${primary}" stroke-width="16" stroke-linecap="round"/>
      <path d="M244 510 L524 510" stroke="${ink}" stroke-width="14" stroke-linecap="round"/>
      ${shape.star(570, 270, 42, accent, 0.9)}`;
  }

  if (title.includes('game') || title.includes('championship')) {
    return `
      <path d="M92 594 C220 520 548 520 676 594 L676 674 C548 604 220 604 92 674 Z" fill="#16a34a" stroke="${ink}" stroke-width="12"/>
      <path d="M230 612 L384 502 L538 612 L384 704 Z" fill="#ffffff" stroke="${ink}" stroke-width="10"/>
      <circle cx="384" cy="390" r="122" fill="#ffffff" stroke="${ink}" stroke-width="12"/>
      <path d="M310 340 C350 374 350 406 310 442 M458 340 C418 374 418 406 458 442" fill="none" stroke="${primary}" stroke-width="12" stroke-linecap="round"/>
      <path d="M568 280 L608 360" stroke="${ink}" stroke-width="16" stroke-linecap="round"/>
      ${shape.star(204, 262, 38, accent, 0.9)}`;
  }

  if (title.includes('music') || title.includes('drum')) {
    return `
      <ellipse cx="384" cy="548" rx="154" ry="58" fill="${primary}" stroke="${ink}" stroke-width="12"/>
      <rect x="230" y="360" width="308" height="190" rx="34" fill="${soft}" stroke="${ink}" stroke-width="12"/>
      <ellipse cx="384" cy="360" rx="154" ry="58" fill="#ffffff" stroke="${ink}" stroke-width="12"/>
      <path d="M282 284 L314 228 M486 284 L520 228" stroke="${ink}" stroke-width="14" stroke-linecap="round"/>
      <path d="M560 326 C620 284 650 356 604 386 C638 430 562 464 548 400" fill="${accent}" opacity="0.9"/>
      ${shape.star(184, 306, 30, accent, 0.8)}`;
  }

  if (title.includes('debate') || title.includes('pen pal')) {
    return `
      <rect x="206" y="510" width="356" height="102" rx="30" fill="${primary}" stroke="${ink}" stroke-width="12"/>
      <circle cx="384" cy="360" r="92" fill="#ffffff" stroke="${ink}" stroke-width="12"/>
      <rect x="358" y="430" width="52" height="142" rx="26" fill="${ink}"/>
      <path d="M284 310 C216 288 202 392 272 398 L272 456 L340 394" fill="${accent}" stroke="${ink}" stroke-width="10"/>
      <path d="M492 310 C560 288 574 392 504 398 L504 456 L436 394" fill="${soft}" stroke="${ink}" stroke-width="10"/>
      ${shape.star(592, 252, 32, accent, 0.85)}`;
  }

  if (title.includes('cookie') || title.includes('recipe') || title.includes('pizza') || title.includes('picnic')) {
    return `
      <circle cx="384" cy="440" r="162" fill="#fef3c7" stroke="${ink}" stroke-width="12"/>
      <circle cx="324" cy="382" r="24" fill="${primary}"/><circle cx="432" cy="384" r="24" fill="${primary}"/>
      <circle cx="384" cy="478" r="22" fill="${accent}"/><circle cx="456" cy="508" r="18" fill="${primary}"/><circle cx="310" cy="506" r="18" fill="${accent}"/>
      <path d="M226 642 C264 560 504 560 542 642 Z" fill="${primary}" stroke="${ink}" stroke-width="12"/>
      <path d="M278 622 L490 622" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/>
      ${shape.cloud(520, 210, 0.72)}`;
  }

  if (title.includes('mystery') || title.includes('lost') || title.includes('secret')) {
    return `
      <circle cx="356" cy="396" r="128" fill="#ffffff" stroke="${ink}" stroke-width="14"/>
      <rect x="466" y="500" width="164" height="42" rx="21" fill="${ink}" transform="rotate(42 466 500)"/>
      <path d="M302 386 Q356 330 410 386" fill="none" stroke="${primary}" stroke-width="18" stroke-linecap="round"/>
      <circle cx="356" cy="454" r="16" fill="${accent}"/>
      <path d="M160 614 C242 554 504 554 608 614" stroke="${accent}" stroke-width="20" stroke-linecap="round" fill="none"/>
      ${shape.star(582, 238, 34, accent, 0.84)}`;
  }

  if (title.includes('rocket') || title.includes('moon') || title.includes('stars') || title.includes('climate')) {
    return `
      <circle cx="572" cy="230" r="92" fill="${accent}" opacity="0.72"/>
      ${shape.star(174, 224, 30, '#ffffff', 0.9)}${shape.star(238, 318, 20, '#ffffff', 0.75)}${shape.star(610, 396, 24, '#ffffff', 0.8)}
      <path d="M348 506 C330 402 350 304 418 238 C492 312 506 404 474 510 Z" fill="#ffffff" stroke="${ink}" stroke-width="12"/>
      <path d="M358 506 L300 604 L388 558 Z" fill="${primary}" stroke="${ink}" stroke-width="10"/>
      <path d="M464 506 L532 604 L440 558 Z" fill="${primary}" stroke="${ink}" stroke-width="10"/>
      <circle cx="414" cy="352" r="44" fill="${soft}" stroke="${ink}" stroke-width="10"/>`;
  }

  if (title.includes('bridge') || title.includes('map') || title.includes('lighthouse') || title.includes('journey') || title.includes('ocean')) {
    return `
      <path d="M126 516 C254 438 506 438 642 516 L642 594 C506 510 258 510 126 594 Z" fill="${primary}" stroke="${ink}" stroke-width="12"/>
      <path d="M176 536 L176 644 M286 500 L286 644 M396 494 L396 644 M506 506 L506 644 M616 548 L616 644" stroke="${ink}" stroke-width="10" stroke-linecap="round"/>
      <path d="M0 666 C132 622 218 692 354 648 C496 604 586 662 768 620 L768 1024 L0 1024 Z" fill="${accent}" opacity="0.72"/>
      <circle cx="146" cy="250" r="66" fill="#ffffff" opacity="0.74"/>
      ${shape.cloud(470, 188, 1.05)}`;
  }

  if (title.includes('garden') || title.includes('seed') || title.includes('tree') || title.includes('caterpillar') || title.includes('vegetable') || title.includes('cloud') || category === 'nature') {
    return `
      <path d="M384 620 C354 514 358 420 386 332 C416 420 420 516 384 620 Z" fill="${ink}" opacity="0.78"/>
      ${shape.leaf(314, 416, -42, primary)}${shape.leaf(458, 410, 42, accent)}${shape.leaf(332, 522, -58, '#86efac')}${shape.leaf(454, 526, 58, '#67e8f9')}
      <circle cx="220" cy="586" r="44" fill="${accent}"/><circle cx="174" cy="610" r="34" fill="${primary}"/><circle cx="574" cy="590" r="50" fill="${accent}"/>
      <path d="M0 668 C168 602 250 700 392 652 C532 604 628 656 768 620 L768 1024 L0 1024 Z" fill="${primary}" opacity="0.74"/>
      ${shape.cloud(108, 194, 0.95)}${shape.cloud(492, 164, 0.82)}`;
  }

  if (title.includes('cat') || title.includes('dog') || title.includes('fish') || title.includes('frog') || title.includes('bear') || title.includes('monkey') || title.includes('mouse') || title.includes('puppy') || title.includes('nest') || category === 'animals') {
    return `
      <ellipse cx="384" cy="460" rx="156" ry="134" fill="#ffffff" stroke="${ink}" stroke-width="12"/>
      <circle cx="320" cy="430" r="22" fill="${ink}"/><circle cx="448" cy="430" r="22" fill="${ink}"/>
      <path d="M354 494 Q384 528 414 494" fill="none" stroke="${primary}" stroke-width="14" stroke-linecap="round"/>
      <path d="M258 350 L202 258 L326 322 Z" fill="${accent}" stroke="${ink}" stroke-width="10"/>
      <path d="M510 350 L566 258 L442 322 Z" fill="${accent}" stroke="${ink}" stroke-width="10"/>
      <ellipse cx="384" cy="588" rx="230" ry="54" fill="${primary}" opacity="0.3"/>
      ${shape.star(574, 250, 34, accent, 0.8)}`;
  }

  if (title.includes('library') || title.includes('paintbrush') || title.includes('fairy') || title.includes('dragon') || title.includes('knight') || category === 'fantasy') {
    return `
      <path d="M244 586 L524 586 L490 338 Q384 238 278 338 Z" fill="${primary}" stroke="${ink}" stroke-width="12"/>
      <path d="M304 586 L304 428 Q384 362 464 428 L464 586 Z" fill="${soft}" stroke="${ink}" stroke-width="10"/>
      ${shape.star(206, 272, 44, accent, 0.92)}${shape.star(560, 244, 34, '#ffffff', 0.9)}${shape.star(600, 382, 24, accent, 0.86)}
      <path d="M196 634 C282 590 496 590 586 634" stroke="${accent}" stroke-width="22" stroke-linecap="round" fill="none"/>`;
  }

  if (title.includes('friend') || title.includes('kind') || title.includes('sharing') || title.includes('helpful') || title.includes('standing') || category === 'friendship') {
    return `
      <circle cx="300" cy="372" r="72" fill="${soft}" stroke="${ink}" stroke-width="10"/>
      <circle cx="468" cy="372" r="72" fill="#ffffff" stroke="${ink}" stroke-width="10"/>
      <path d="M228 600 C246 500 352 482 384 552 C416 482 522 500 540 600 Z" fill="${primary}" stroke="${ink}" stroke-width="12"/>
      <path d="M320 470 Q384 536 448 470" fill="none" stroke="${accent}" stroke-width="20" stroke-linecap="round"/>
      ${shape.star(568, 244, 36, accent, 0.85)}`;
  }

  if (title.includes('grandma') || title.includes('mom') || title.includes('family') || title.includes('recipes') || title.includes('mitten') || title.includes('pizza') || category === 'family') {
    return `
      <path d="M178 484 L384 286 L590 484 L590 642 L178 642 Z" fill="${primary}" stroke="${ink}" stroke-width="12"/>
      <path d="M136 500 L384 258 L632 500" fill="none" stroke="${ink}" stroke-width="18" stroke-linecap="round"/>
      <rect x="316" y="500" width="136" height="142" rx="16" fill="${soft}" stroke="${ink}" stroke-width="10"/>
      <circle cx="252" cy="370" r="40" fill="${accent}"/><circle cx="516" cy="370" r="40" fill="${accent}"/>
      ${shape.cloud(118, 206, 0.78)}${shape.cloud(504, 186, 0.72)}`;
  }

  if (title.includes('number') || title.includes('inventor') || title.includes('science') || title.includes('debate') || title.includes('reading') || category === 'learning') {
    return `
      <rect x="188" y="304" width="392" height="270" rx="34" fill="#ffffff" stroke="${ink}" stroke-width="12"/>
      <path d="M242 390 H526 M242 458 H526 M242 526 H420" stroke="${primary}" stroke-width="18" stroke-linecap="round"/>
      <circle cx="568" cy="286" r="58" fill="${accent}" opacity="0.9"/>
      <path d="M562 256 L594 304 L542 304 Z" fill="${ink}"/>
      <rect x="276" y="616" width="216" height="48" rx="24" fill="${accent}"/>
      ${shape.star(170, 252, 32, accent, 0.75)}`;
  }

  return `
    <circle cx="384" cy="430" r="154" fill="#ffffff" stroke="${ink}" stroke-width="12"/>
    <path d="M288 454 Q384 540 480 454" fill="none" stroke="${primary}" stroke-width="18" stroke-linecap="round"/>
    ${shape.star(224, 268, 38, accent, 0.85)}${shape.star(566, 316, 30, primary, 0.85)}`;
};

for (const story of stories) {
  const colors = palettes[story.category] || palettes.learning;
  const [primary, soft, accent, ink, paper] = colors;
  const lines = titleLines(story.title);
  const badgeLabel = getStoryBadgeLabel(story.gradeLevel);
  const lineSvg = lines.map((line, index) =>
    `<text x="64" y="${798 + index * 58}" font-size="${lines.length > 2 ? 42 : 52}" font-weight="900" fill="${ink}" font-family="Arial, sans-serif">${escapeXml(line)}</text>`
  ).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024" role="img" aria-label="${escapeXml(story.title)} cover">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${soft}"/>
      <stop offset="0.52" stop-color="${paper}"/>
      <stop offset="1" stop-color="${primary}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="34%" r="55%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.92"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.24"/>
    </filter>
  </defs>
  <rect width="768" height="1024" rx="44" fill="url(#sky)"/>
  <rect width="768" height="1024" rx="44" fill="url(#glow)"/>
  <circle cx="626" cy="134" r="118" fill="${accent}" opacity="0.45"/>
  <circle cx="120" cy="254" r="82" fill="#ffffff" opacity="0.58"/>
  <g filter="url(#shadow)">
    <rect x="54" y="70" width="340" height="76" rx="38" fill="#ffffff" opacity="0.9"/>
    <text x="86" y="119" font-size="26" font-weight="900" letter-spacing="3" fill="${ink}" font-family="Arial, sans-serif">${escapeXml(story.category.toUpperCase())}</text>
    <rect x="588" y="70" width="98" height="76" rx="38" fill="${ink}"/>
    <text x="637" y="119" font-size="30" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif">${escapeXml(badgeLabel)}</text>
  </g>
  <g filter="url(#shadow)">
    ${sceneFor(story, colors)}
  </g>
  <path d="M0 704 C160 628 250 736 392 684 C536 630 626 690 768 640 L768 1024 L0 1024 Z" fill="${ink}" opacity="0.12"/>
  <g filter="url(#shadow)">
    <rect x="42" y="662" width="684" height="300" rx="42" fill="#ffffff" opacity="0.94"/>
    <text x="64" y="720" font-size="22" font-weight="900" letter-spacing="4" fill="#64748b" font-family="Arial, sans-serif">KID GENIUS ORIGINAL</text>
    ${lineSvg}
  </g>
</svg>
`;

  const svgPath = path.join(outputDir, `${story.id}.svg`);
  const pngPath = path.join(outputDir, `${story.id}.png`);
  fs.writeFileSync(svgPath, svg);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(pngPath);
}

console.log(JSON.stringify({
  output: path.relative(root, outputDir),
  covers: stories.length,
  formats: ['svg', 'png'],
}, null, 2));
