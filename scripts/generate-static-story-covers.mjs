import fs from 'node:fs';
import path from 'node:path';

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
    if (next.length > 18 && line) {
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
  adventure: ['#f97316', '#fde68a', '#38bdf8', '#0f172a'],
  animals: ['#22c55e', '#dcfce7', '#a3e635', '#14532d'],
  nature: ['#06b6d4', '#cffafe', '#34d399', '#164e63'],
  fantasy: ['#8b5cf6', '#ede9fe', '#f0abfc', '#312e81'],
  friendship: ['#ec4899', '#fce7f3', '#fbbf24', '#831843'],
  family: ['#f59e0b', '#fef3c7', '#fb7185', '#78350f'],
  learning: ['#3b82f6', '#dbeafe', '#facc15', '#1e3a8a'],
};

const storyRegex = /id: '([^']+)', title: '((?:\\'|[^'])+)', author: '((?:\\'|[^'])+)', cover: '([^']*)', gradeLevel: (\d+), category: '([^']+)'/g;
const stories = Array.from(source.matchAll(storyRegex)).map(match => ({
  id: match[1],
  title: match[2].replace(/\\'/g, "'"),
  cover: match[4],
  gradeLevel: Number(match[5]),
  category: match[6],
}));

for (const story of stories) {
  const [primary, soft, accent, ink] = palettes[story.category] || palettes.learning;
  const initials = story.title
    .split(/\s+/)
    .filter(word => !['the', 'and', 'a', 'an', 'of'].includes(word.toLowerCase()))
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
  const lines = titleLines(story.title);
  const lineSvg = lines.map((line, index) =>
    `<text x="64" y="${690 + index * 58}" font-size="${lines.length > 2 ? 42 : 50}" font-weight="900" fill="${ink}" font-family="Arial, sans-serif">${escapeXml(line)}</text>`
  ).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024" role="img" aria-label="${escapeXml(story.title)} cover">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${soft}"/>
      <stop offset="0.58" stop-color="#ffffff"/>
      <stop offset="1" stop-color="${primary}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="768" height="1024" rx="44" fill="url(#sky)"/>
  <circle cx="620" cy="130" r="120" fill="${accent}" opacity="0.58"/>
  <circle cx="128" cy="248" r="86" fill="#ffffff" opacity="0.72"/>
  <path d="M0 600 C150 512 245 672 386 590 C520 512 605 560 768 492 L768 1024 L0 1024 Z" fill="${primary}" opacity="0.82"/>
  <path d="M0 692 C170 620 250 752 392 682 C540 608 640 650 768 596 L768 1024 L0 1024 Z" fill="${accent}" opacity="0.7"/>
  <g filter="url(#shadow)">
    <rect x="64" y="82" width="312" height="78" rx="39" fill="#ffffff" opacity="0.88"/>
    <text x="92" y="132" font-size="28" font-weight="900" letter-spacing="3" fill="${ink}" font-family="Arial, sans-serif">${escapeXml(story.category.toUpperCase())}</text>
    <rect x="588" y="82" width="96" height="78" rx="39" fill="${ink}"/>
    <text x="616" y="132" font-size="30" font-weight="900" fill="#ffffff" font-family="Arial, sans-serif">G${story.gradeLevel}</text>
  </g>
  <g filter="url(#shadow)">
    <circle cx="384" cy="388" r="158" fill="#ffffff" opacity="0.86"/>
    <circle cx="384" cy="388" r="126" fill="${soft}" opacity="0.95"/>
    <text x="384" y="356" text-anchor="middle" font-size="86" font-weight="900" fill="${ink}" font-family="Arial, sans-serif">${escapeXml(initials)}</text>
    <text x="384" y="450" text-anchor="middle" font-size="86" fill="${ink}" font-family="Arial, sans-serif">${escapeXml(story.cover)}</text>
  </g>
  <g filter="url(#shadow)">
    <rect x="48" y="630" width="672" height="284" rx="42" fill="#ffffff" opacity="0.92"/>
    <text x="64" y="668" font-size="22" font-weight="900" letter-spacing="4" fill="#64748b" font-family="Arial, sans-serif">KID GENIUS ORIGINAL</text>
    ${lineSvg}
  </g>
</svg>
`;

  fs.writeFileSync(path.join(outputDir, `${story.id}.svg`), svg);
}

console.log(JSON.stringify({
  output: path.relative(root, outputDir),
  covers: stories.length,
}, null, 2));
