const baseUrl = (process.env.KID_GENIUS_LIVE_URL || process.argv[2] || 'https://kid-genius-world.com').replace(/\/$/, '');
const base = new URL(baseUrl);

const fail = (message) => {
  console.error(`Live site check failed: ${message}`);
  process.exit(1);
};

const asUrl = (pathOrUrl) => new URL(pathOrUrl, baseUrl).href;

const fetchOk = async (pathOrUrl, options = {}) => {
  const url = asUrl(pathOrUrl);
  const response = await fetch(url, options);
  if (!response.ok) {
    fail(`${url} returned ${response.status}.`);
  }
  return response;
};

const expectHeaderIncludes = (response, header, value) => {
  const actual = response.headers.get(header) || '';
  if (!actual.toLowerCase().includes(value.toLowerCase())) {
    fail(`${response.url} expected ${header} to include "${value}", got "${actual}".`);
  }
};

const getText = async (pathOrUrl, options = {}) => {
  const response = await fetchOk(pathOrUrl, options);
  return { response, text: await response.text() };
};

const checkWwwRedirect = async () => {
  if (base.hostname.startsWith('www.')) return;
  const wwwUrl = `${base.protocol}//www.${base.hostname}/`;
  const response = await fetch(wwwUrl, { redirect: 'manual' });
  if (![301, 302, 307, 308].includes(response.status)) {
    fail(`${wwwUrl} should redirect to ${baseUrl}/, got ${response.status}.`);
  }
  const location = new URL(response.headers.get('location') || '', wwwUrl);
  if (location.origin !== base.origin || location.pathname !== '/') {
    fail(`${wwwUrl} redirects to ${location.href}, expected ${baseUrl}/.`);
  }
};

const checkRoot = async () => {
  const { response, text } = await getText('/');
  expectHeaderIncludes(response, 'content-type', 'text/html');
  expectHeaderIncludes(response, 'cache-control', 'no-store');
  for (const required of [
    '<title>Kid Genius World</title>',
    '/manifest.webmanifest',
    '/icons/apple-touch-icon.png',
    'Kid Genius World by CrateShip Studios',
  ]) {
    if (!text.includes(required)) fail(`Homepage is missing "${required}".`);
  }

  const assetPaths = [
    ...text.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]*\/assets\/[^"]+\.(?:js|css))"/g),
  ].map((match) => match[1]);
  if (assetPaths.length < 2) fail('Homepage does not reference bundled production assets.');
  for (const assetPath of assetPaths.slice(0, 4)) {
    const asset = await fetchOk(assetPath, { method: 'HEAD' });
    expectHeaderIncludes(asset, 'cache-control', 'immutable');
  }
};

const checkPwa = async () => {
  const manifestResponse = await fetchOk('/manifest.webmanifest');
  expectHeaderIncludes(manifestResponse, 'content-type', 'manifest+json');
  expectHeaderIncludes(manifestResponse, 'cache-control', 'no-store');
  const manifest = await manifestResponse.json();
  if (manifest.name !== 'Kid Genius World' || manifest.display !== 'standalone' || manifest.start_url !== '/?source=pwa') {
    fail('PWA manifest does not describe the standalone Kid Genius World app.');
  }
  if (!manifest.icons?.some((icon) => icon.src === '/icons/maskable-icon-512.png' && icon.purpose === 'maskable')) {
    fail('PWA manifest is missing the maskable app icon.');
  }

  const pwaAssets = [
    '/sw.js',
    '/icons/icon.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/maskable-icon-512.png',
    '/icons/apple-touch-icon.png',
    ...(manifest.screenshots || []).map((screenshot) => screenshot.src),
  ];

  for (const assetPath of pwaAssets) {
    const response = await fetchOk(assetPath, { method: 'GET' });
    if (assetPath === '/sw.js') {
      expectHeaderIncludes(response, 'cache-control', 'no-cache');
      const sw = await response.text();
      if (!sw.includes('CACHE_NAME') || !sw.includes("url.pathname.startsWith('/api/')")) {
        fail('Service worker is missing cache name or API bypass guard.');
      }
      continue;
    }
    expectHeaderIncludes(response, 'content-type', assetPath.endsWith('.svg') ? 'image/svg' : 'image/');
  }
};

const checkSeoAndBlog = async () => {
  const { response: robotsResponse, text: robots } = await getText('/robots.txt');
  expectHeaderIncludes(robotsResponse, 'content-type', 'text/plain');
  if (!robots.includes(`Sitemap: ${baseUrl}/sitemap.xml`)) {
    fail('robots.txt does not point at the canonical sitemap.');
  }

  const { response: sitemapResponse, text: sitemap } = await getText('/sitemap.xml');
  expectHeaderIncludes(sitemapResponse, 'content-type', 'xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const pageLocs = locs.filter((loc) => !/\.(png|jpe?g|svg|webp)$/i.test(loc));
  const imageLocs = locs.filter((loc) => /\.(png|jpe?g|svg|webp)$/i.test(loc));
  if (pageLocs.length < 30) fail(`Sitemap has too few page URLs: ${pageLocs.length}.`);
  for (const loc of locs) {
    if (!loc.startsWith(`${baseUrl}/`)) fail(`Sitemap URL is not canonical: ${loc}.`);
  }

  const { response: blogResponse, text: blogIndex } = await getText('/blog/');
  expectHeaderIncludes(blogResponse, 'content-type', 'text/html');
  if (!blogIndex.includes('<link rel="canonical" href="https://kid-genius-world.com/blog/"')) {
    fail('Blog index is missing the canonical URL.');
  }

  const blogLinks = [...new Set([...blogIndex.matchAll(/href="(\/blog\/[^"#?]+\.html)"/g)].map((match) => match[1]))];
  const blogImages = [...new Set([...blogIndex.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]))];
  if (blogLinks.length < 30) fail(`Blog index has too few article links: ${blogLinks.length}.`);

  for (const articlePath of blogLinks) {
    const { response, text } = await getText(articlePath);
    expectHeaderIncludes(response, 'content-type', 'text/html');
    if (!text.includes('Kid Genius World') || !text.includes('CrateShip Studios')) {
      fail(`${articlePath} is missing brand or footer trust copy.`);
    }
  }

  for (const imagePath of [...blogImages, ...imageLocs]) {
    const response = await fetchOk(imagePath, { method: 'HEAD' });
    expectHeaderIncludes(response, 'content-type', 'image/');
  }
};

await checkWwwRedirect();
await checkRoot();
await checkPwa();
await checkSeoAndBlog();

console.log(`Live site check passed for ${baseUrl}: homepage, www redirect, PWA assets, sitemap, blog links, and images verified.`);
