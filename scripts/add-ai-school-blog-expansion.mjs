import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'https://kid-genius-world.com';
const lastMod = new Date().toISOString().slice(0, 10);
const root = process.cwd();

const disclaimer = 'Kid Genius World is an AI-powered learning app and parent-guided AI school experience. It is not an accredited school, is not a real school, does not issue grades, credits, diplomas, or transcripts, and does not replace a teacher, school curriculum, therapist, medical professional, or parent judgment.';

const posts = [
  {
    slug: 'ai-school-for-kids-parent-guide',
    title: 'AI School for Kids: A Parent Guide to Kid Genius World',
    meta: 'A parent-friendly guide to using Kid Genius World as an AI school experience for reading, math, science, coding, stories, and games with clear non-accredited limits.',
    category: 'AI school',
    audience: 'Parents',
    image: '/blog/images/kid-genius-world-ai-base.png',
    intro: 'Parents are searching for AI school options because they want learning that feels personal, guided, and interesting. Kid Genius World can be described as an AI school experience because it organizes lessons, practice, stories, games, and parent progress tools in one child-friendly app.',
    angle: 'The important difference is honesty. Kid Genius World is not trying to replace a public school, private school, homeschool curriculum, teacher, therapist, or accredited program. It is a guided practice app that can support daily learning at home.',
    bullets: ['Use it for short reading, math, science, coding, geography, and language practice.', 'Review progress in the parent dashboard instead of guessing what the child practiced.', 'Keep the experience parent-guided with setup, privacy, billing, and learning controls handled by an adult.', 'Treat the app as supplemental learning, not a diploma or transcript program.'],
    parentStep: 'Start with one room and one short goal so the child builds confidence before expanding to a full routine.'
  },
  {
    slug: 'is-kid-genius-world-an-accredited-school',
    title: 'Is Kid Genius World an Accredited School?',
    meta: 'Kid Genius World is not accredited and is not a real school. It is an AI-powered learning app for parent-guided practice at home.',
    category: 'Disclosure',
    audience: 'Parents',
    image: '/room-scenes/reading.png',
    intro: 'No. Kid Genius World is not an accredited school and should not be presented as one. It does not grant credits, diplomas, transcripts, or official grade placement.',
    angle: 'The app can still be useful as an AI school-style learning experience. Parents can use it for reading practice, math review, science curiosity, coding logic, stories, games, and progress visibility while keeping official school decisions separate.',
    bullets: ['Not accredited by a school agency or education department.', 'Not a replacement for required schooling or homeschool compliance.', 'No official credits, diplomas, transcripts, or grade promotion.', 'Designed as supervised educational practice for families.'],
    parentStep: 'Use the app as a supplement, then keep official school, homeschool, therapy, or tutoring decisions with qualified adults.'
  },
  {
    slug: 'ai-school-vs-online-learning-app',
    title: 'AI School vs. Online Learning App: What Parents Should Know',
    meta: 'Learn the difference between an AI school experience and an accredited school, and how Kid Genius World fits as a parent-guided learning app.',
    category: 'Parent guide',
    audience: 'Parents',
    image: '/room-scenes/storybook.png',
    intro: 'An AI school experience can feel more structured than a basic game app because it includes subjects, practice paths, feedback, and progress tools. An accredited school is different because it has official authority, records, credits, and compliance requirements.',
    angle: 'Kid Genius World belongs in the first category. It can feel like a school-style learning world, but it is an app for practice, enrichment, and parent-guided routines.',
    bullets: ['AI school experience means guided learning features inside the app.', 'Accredited school means official academic authority, which Kid Genius World does not have.', 'Parents should use app progress as informal learning insight.', 'The best routine combines app practice with real reading, conversation, projects, and adult support.'],
    parentStep: 'Call it an AI school experience in marketing, but always include the non-accredited disclosure near signup, terms, and blog content.'
  },
  {
    slug: 'parent-guided-ai-school-for-elementary-kids',
    title: 'Parent-Guided AI School for Elementary Kids',
    meta: 'How families can use Kid Genius World as a parent-guided AI school experience for elementary reading, math, science, coding, and confidence.',
    category: 'Elementary',
    audience: 'Parents',
    image: '/room-scenes/math.png',
    intro: 'Elementary learners need structure without pressure. Kid Genius World can help parents create a simple AI school-style routine with rooms for subjects, playful missions, and visible progress.',
    angle: 'Parent-guided matters because children still need adults to choose the right level, notice frustration, celebrate effort, and connect digital practice to real-world learning.',
    bullets: ['Pick a grade level and adjust if the work feels too easy or too hard.', 'Use short sessions so the app stays productive, not exhausting.', 'Review the parent dashboard to spot strengths and practice needs.', 'Pair app work with books, drawing, counting, experiments, and conversation.'],
    parentStep: 'Try a 20-minute routine: one reading activity, one math activity, and one creative or science room.'
  },
  {
    slug: 'ai-reading-tutor-for-kids-at-home',
    title: 'AI Reading Tutor for Kids at Home',
    meta: 'Kid Genius World can support reading confidence with parent-guided AI school practice, stories, vocabulary, and read-aloud routines.',
    category: 'Reading',
    audience: 'Parents',
    image: '/blog/images/reading-confidence-for-elementary-kids.jpg',
    intro: 'Reading growth comes from steady practice, vocabulary, fluency, and confidence. Kid Genius World can support that routine with story rooms, vocabulary games, and parent-visible progress.',
    angle: 'This is not a formal reading diagnosis or therapy program. It is a practice environment parents can use alongside books, school assignments, library visits, and qualified support when needed.',
    bullets: ['Use read-aloud time to build confidence before independent reading.', 'Practice vocabulary in context instead of isolated memorization only.', 'Watch for frustration and lower the difficulty when needed.', 'Celebrate effort, attention, and comprehension, not only correct answers.'],
    parentStep: 'Ask the child to retell one story detail after each reading session.'
  },
  {
    slug: 'ai-math-practice-for-kids-with-parent-dashboard',
    title: 'AI Math Practice for Kids With a Parent Dashboard',
    meta: 'Use Kid Genius World for parent-guided math practice, number sense, patterns, problem solving, and progress checks.',
    category: 'Math',
    audience: 'Parents',
    image: '/blog/images/math-fact-practice-without-stress.jpg',
    intro: 'Math practice works best when children get repetition without shame. Kid Genius World can help parents build a steady AI school routine around number sense, facts, patterns, and problem solving.',
    angle: 'The parent dashboard should be used as a guide, not a pressure tool. A low score is a signal to slow down, review, and explain the idea another way.',
    bullets: ['Practice math facts in short bursts.', 'Use visual thinking and patterns before rushing to speed.', 'Review dashboard signals to choose the next room.', 'Keep official grading and placement decisions outside the app.'],
    parentStep: 'After math practice, ask the child to explain one answer out loud.'
  },
  {
    slug: 'safe-ai-learning-for-kids',
    title: 'Safe AI Learning for Kids: Parent Controls, Privacy, and Real Limits',
    meta: 'A parent safety guide for using AI-powered learning apps with children, including privacy, supervision, and Kid Genius World limits.',
    category: 'Safety',
    audience: 'Parents',
    image: '/blog/images/safe-educational-screen-time-that-actually-teaches.jpg',
    intro: 'Parents are right to ask how AI learning apps handle safety. A strong child learning app should avoid open child chat, keep setup parent-gated, explain data use, and make support easy to find.',
    angle: 'Kid Genius World should be marketed around parent-guided learning, not unsupervised AI. The value is structured practice and progress visibility, with adults making the important decisions.',
    bullets: ['Use parent setup before paid rooms open.', 'Keep child profiles limited and age-appropriate.', 'Do not treat app feedback as medical, therapy, or official school advice.', 'Review privacy and terms before creating a routine.'],
    parentStep: 'Check privacy, support, and billing pages before handing the app to a child.'
  },
  {
    slug: 'homeschool-ai-school-supplement',
    title: 'Homeschool AI School Supplement: Using Kid Genius World the Right Way',
    meta: 'How homeschool families can use Kid Genius World as a supplemental AI school-style app without confusing it for an accredited school.',
    category: 'Homeschool',
    audience: 'Homeschool families',
    image: '/blog/images/homeschool-enrichment-with-kid-genius-world.jpg',
    intro: 'Homeschool families often look for tools that add practice, variety, and progress visibility. Kid Genius World can fit as a supplement for reading, math, science, coding, and creative learning.',
    angle: 'The app does not replace homeschool legal requirements, parent instruction, recordkeeping, or curriculum decisions. It can support a plan that parents already manage.',
    bullets: ['Use app sessions as enrichment or review.', 'Keep official homeschool records separately.', 'Match app rooms to the child current learning goals.', 'Use progress data as informal insight, not official grades.'],
    parentStep: 'Add one app activity after a hands-on lesson so digital practice reinforces real instruction.'
  },
  {
    slug: 'after-school-ai-learning-routine',
    title: 'After-School AI Learning Routine for Busy Families',
    meta: 'A simple after-school AI learning routine using Kid Genius World for short reading, math, science, coding, and story practice.',
    category: 'Routine',
    audience: 'Parents',
    image: '/blog/images/after-school-learning-for-international-families.jpg',
    intro: 'After school, kids may be tired and parents may be busy. A good AI learning routine should be short, clear, and calm.',
    angle: 'Kid Genius World can help families turn screen time into practice time when parents set the goal and stop before the child is overloaded.',
    bullets: ['Start with a snack, movement, or rest break before app practice.', 'Choose one core room and one fun room.', 'Stop while the child still feels successful.', 'Use the parent dashboard later, not during every answer.'],
    parentStep: 'Try 15 to 25 minutes on school nights and longer exploration on weekends.'
  },
  {
    slug: 'ai-coding-school-for-kids',
    title: 'AI Coding School for Kids: Logic, Loops, and Debugging Practice',
    meta: 'Kid Genius World can introduce coding ideas through parent-guided AI school practice with logic, sequencing, loops, and debugging games.',
    category: 'Coding',
    audience: 'Parents',
    image: '/blog/images/coding-for-kids-at-home-loops-logic-and-debugging.jpg',
    intro: 'Kids do not need to start with full programming languages to build coding confidence. They can practice sequencing, loops, cause and effect, and debugging through simple missions.',
    angle: 'Kid Genius World can be described as an AI coding school experience only in the practice sense. It does not certify coding skill or replace a real teacher or curriculum.',
    bullets: ['Practice order and sequence before syntax.', 'Use mistakes as debugging practice.', 'Connect patterns to math, music, maps, and stories.', 'Let kids explain the steps in their own words.'],
    parentStep: 'Ask the child what changed after each debugging step.'
  },
  {
    slug: 'ai-science-lessons-for-curious-kids',
    title: 'AI Science Lessons for Curious Kids',
    meta: 'Use Kid Genius World for parent-guided science curiosity, observation, prediction, experiments, and explanation practice.',
    category: 'Science',
    audience: 'Parents',
    image: '/blog/images/science-activities-for-curious-kids-at-home.jpg',
    intro: 'Science starts with noticing, wondering, predicting, testing, and explaining. Kid Genius World can help children practice those habits through a guided AI school-style routine.',
    angle: 'The app should support curiosity, not replace hands-on experiments or adult safety. Parents should connect digital science practice to safe real-world observation.',
    bullets: ['Ask children what they notice before giving an answer.', 'Use safe home observations to extend app lessons.', 'Practice prediction and explanation together.', 'Avoid treating app content as professional science instruction.'],
    parentStep: 'After a science room, ask one question that starts with why or how.'
  },
  {
    slug: 'ai-vocabulary-and-reading-games',
    title: 'AI Vocabulary and Reading Games for Kids',
    meta: 'Kid Genius World can help kids practice vocabulary and reading through games, stories, context, and parent-guided review.',
    category: 'Vocabulary',
    audience: 'Parents',
    image: '/blog/images/vocabulary-games-that-help-kids-use-new-words.jpg',
    intro: 'Vocabulary grows when kids hear words, read words, use words, and connect words to meaning. Games can make that practice feel less like a worksheet.',
    angle: 'Kid Genius World can provide structured vocabulary practice, but parents should still read aloud, talk about new words, and connect language to everyday life.',
    bullets: ['Introduce new words in stories and missions.', 'Ask children to use a new word in a sentence.', 'Review words over several days instead of once.', 'Use progress as a parent clue, not an official language score.'],
    parentStep: 'Pick one new word after each session and use it at dinner or bedtime.'
  },
  {
    slug: 'kid-genius-world-vs-generic-learning-apps',
    title: 'Kid Genius World vs. Generic Learning Apps',
    meta: 'How Kid Genius World can stand out as an AI school-style learning app with parent setup, progress tools, stories, games, and multi-subject practice.',
    category: 'Comparison',
    audience: 'Parents',
    image: '/room-scenes/geography.png',
    intro: 'Many learning apps focus on one subject or one game loop. Kid Genius World can stand out by presenting a broader learning world with rooms, stories, games, progress, and parent-guided structure.',
    angle: 'The positioning should stay accurate: it is an AI-powered learning app and AI school experience, not an accredited school. That honesty builds parent trust and keeps the marketing clean.',
    bullets: ['Multi-subject practice across reading, math, science, coding, geography, art, and stories.', 'Parent setup and support instead of child-managed billing.', 'Progress tools that help parents see what happened.', 'Clear disclaimers about accreditation and official schooling.'],
    parentStep: 'Compare apps by asking what the child practices, what the parent controls, and what claims the company makes.'
  },
  {
    slug: 'non-accredited-ai-school-explained',
    title: 'What a Non-Accredited AI School Experience Means',
    meta: 'A plain-language explanation of non-accredited AI school experiences and how families should understand Kid Genius World.',
    category: 'Disclosure',
    audience: 'Parents',
    image: '/room-scenes/language.png',
    intro: 'Non-accredited means the app is not officially recognized as a school that can issue academic credit or credentials. That does not make the app useless; it means parents should understand its correct role.',
    angle: 'Kid Genius World can provide guided practice, subject variety, confidence building, and parent visibility. It should not be used to claim official enrollment, credits, transcripts, or diplomas.',
    bullets: ['Good for supplemental practice and enrichment.', 'Not valid as official school registration or grade placement.', 'No diplomas, transcripts, or credits.', 'Parents remain responsible for official education decisions.'],
    parentStep: 'Keep this distinction visible anywhere the app uses AI school language.'
  },
  {
    slug: 'ai-school-for-busy-families',
    title: 'AI School for Busy Families: Short Practice That Still Counts',
    meta: 'Busy families can use Kid Genius World for short AI school-style practice sessions without turning learning into pressure.',
    category: 'Busy families',
    audience: 'Parents',
    image: '/blog/images/reading-routines-for-busy-families.jpg',
    intro: 'Busy families need learning tools that fit real schedules. A good AI school routine should work before dinner, after homework, on weekends, or during a quiet morning window.',
    angle: 'Short practice can still be valuable when it is consistent. The app should support family rhythm instead of demanding long sessions every day.',
    bullets: ['Use shorter sessions more often instead of rare long sessions.', 'Rotate subjects across the week.', 'Let the parent dashboard guide review days.', 'Stop before the child sees learning as punishment.'],
    parentStep: 'Choose three days a week for app practice and keep the same start time when possible.'
  },
  {
    slug: 'global-ai-school-for-kids',
    title: 'Global AI School for Kids: Learning Across Languages, Maps, and Cultures',
    meta: 'Kid Genius World can support global learning through geography, language, stories, science, and parent-guided AI school practice.',
    category: 'Global learning',
    audience: 'International families',
    image: '/blog/images/global-classroom-curiosity-for-kids.jpg',
    intro: 'Families around the world want children to learn beyond their neighborhood. A global AI school experience can support curiosity through maps, languages, stories, science, and cultural awareness.',
    angle: 'Kid Genius World should be positioned as a supplemental learning app for global families, not a replacement for local schools, language instruction, or official curriculum.',
    bullets: ['Use maps and geography rooms to build world awareness.', 'Use language practice as support, not formal certification.', 'Connect stories to family conversation.', 'Respect local school requirements and parent judgment.'],
    parentStep: 'Ask the child to point to one place on a map after a geography or global learning session.'
  },
  {
    slug: 'ai-school-parent-dashboard-progress',
    title: 'AI School Parent Dashboard: How to Read Learning Progress Without Pressure',
    meta: 'A guide for parents using the Kid Genius World dashboard to understand practice, progress, and next steps without treating it like official grading.',
    category: 'Parent dashboard',
    audience: 'Parents',
    image: '/blog/images/parent-dashboard-learning-progress-that-makes-sense.jpg',
    intro: 'Progress data should help parents understand what a child practiced. It should not make every mistake feel like a failure.',
    angle: 'Kid Genius World progress tools can support parent-guided routines, but they do not replace teacher assessment, official grades, therapy evaluation, or professional testing.',
    bullets: ['Look for repeated patterns, not one missed answer.', 'Use progress to choose review rooms.', 'Celebrate effort and consistency.', 'Keep official grading separate from app practice.'],
    parentStep: 'Review progress once or twice a week instead of hovering over every activity.'
  },
  {
    slug: 'ai-school-with-games-and-stories',
    title: 'AI School With Games and Stories: Why Play Helps Kids Practice',
    meta: 'Kid Genius World uses games, stories, and subject rooms to make AI school-style practice more engaging for kids.',
    category: 'Games and stories',
    audience: 'Parents',
    image: '/room-scenes/art.png',
    intro: 'Children often learn better when practice has imagination, choice, and play. Games and stories can make repetition feel meaningful instead of mechanical.',
    angle: 'Play should still have a learning purpose. Kid Genius World can use games and stories to practice reading, vocabulary, logic, creativity, and confidence while parents keep the routine balanced.',
    bullets: ['Stories help children connect words to meaning.', 'Games can make repetition easier to tolerate.', 'Creative rooms support expression and confidence.', 'Parents should balance screen practice with offline play and reading.'],
    parentStep: 'Ask what the child learned from the game, not only whether they won.'
  },
  {
    slug: 'screen-time-ai-school-that-teaches',
    title: 'Screen Time AI School That Teaches Instead of Distracts',
    meta: 'How parents can make screen time more useful with Kid Genius World, an AI-powered learning app with parent-guided practice and clear limits.',
    category: 'Screen time',
    audience: 'Parents',
    image: '/blog/images/safe-educational-screen-time-that-actually-teaches.jpg',
    intro: 'Parents do not just want more screen time. They want screen time that teaches, builds confidence, and stays under adult control.',
    angle: 'Kid Genius World can support educational screen time when sessions are intentional, parent-guided, and limited. The app should not become a replacement for sleep, movement, family conversation, or school responsibilities.',
    bullets: ['Set a goal before opening the app.', 'Use rooms that match the child current learning need.', 'Stop at a planned time.', 'Discuss one thing the child practiced afterward.'],
    parentStep: 'Use a timer and a simple closing question: what did you learn today?'
  },
  {
    slug: 'ai-school-for-kids-subscription-guide',
    title: 'AI School for Kids Subscription Guide: What Parents Should Check First',
    meta: 'Before subscribing to Kid Genius World, parents should review the AI school limits, privacy, billing, support, and learning expectations.',
    category: 'Subscription',
    audience: 'Parents',
    image: '/blog/images/parent-guided-online-learning-for-every-schedule.jpg',
    intro: 'Before paying for any AI school-style app, parents should understand what the product does, what it does not do, and how billing and support work.',
    angle: 'Kid Genius World should be clear that subscription access is for app learning features, not accredited school enrollment or official education credentials.',
    bullets: ['Read privacy, terms, and parent support pages.', 'Confirm the app is not accredited and does not issue credits.', 'Check whether the subjects match the child needs.', 'Use the trial or first month to test routine fit before relying on it.'],
    parentStep: 'Subscribe only after deciding how the app fits into the family learning routine.'
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function writeUtf8(relativePath, content) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function articleHtml(post) {
  const url = `${baseUrl}/blog/${post.slug}.html`;
  const imageUrl = post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta,
    datePublished: lastMod,
    dateModified: lastMod,
    image: imageUrl,
    author: { '@type': 'Organization', name: 'Kid Genius World' },
    publisher: { '@type': 'Organization', name: 'CrateShip Studios', url: 'https://crateshipstudios.com' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }
  };
  const bullets = post.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(post.title)} | Kid Genius World</title>
  <meta name="description" content="${escapeHtml(post.meta)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:title" content="${escapeHtml(post.title)} | Kid Genius World" />
  <meta property="og:description" content="${escapeHtml(post.meta)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="/blog/blog.css" />
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "6d20913065cc437ba6ef78cc99c57926"}'></script>
<!-- End Cloudflare Web Analytics -->
</head>
<body>
  <header class="site-header"><div class="header-inner"><a class="brand" href="/">Kid Genius World</a><nav class="nav"><a href="/">Learning App</a><a href="/blog/">Blog</a><a href="/#parent-support">Parent Support</a></nav></div></header>
  <section class="hero"><div class="hero-inner"><p class="eyebrow">${escapeHtml(post.category)} | ${escapeHtml(post.audience)}</p><h1>${escapeHtml(post.title)}</h1><p class="lead">${escapeHtml(post.meta)}</p></div></section>
  <main class="page article">
    <article class="article-main">
      <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" />
      <p>${escapeHtml(post.intro)}</p>
      <h2>How Kid Genius World fits</h2>
      <p>${escapeHtml(post.angle)}</p>
      <h2>What parents can use it for</h2>
      <ul>${bullets}</ul>
      <h2>Parent next step</h2>
      <p>${escapeHtml(post.parentStep)}</p>
      <div class="cta">
        <h2>Try parent-guided AI school practice</h2>
        <p>Kid Genius World gives families a colorful learning app for reading, math, science, coding, stories, games, and progress checks with parent setup and support.</p>
        <p><a href="/">Open Kid Genius World</a> | <a href="/blog/">Read more parent guides</a></p>
      </div>
    </article>
    <aside class="aside">
      <h2>Important disclosure</h2>
      <p>${escapeHtml(disclaimer)}</p>
      <h2>Good use</h2>
      <ul>
        <li>Supplemental practice</li>
        <li>Parent-guided routines</li>
        <li>Confidence building</li>
        <li>Progress visibility</li>
      </ul>
    </aside>
  </main>
  <footer class="site-footer"><div class="footer-inner">Kid Genius World by CrateShip Studios. Parent support: <a href="mailto:crateshipstudios@gmail.com">crateshipstudios@gmail.com</a>.</div></footer>
</body>
</html>
`;
}

for (const post of posts) {
  writeUtf8(`public/blog/${post.slug}.html`, articleHtml(post));
}

const cardHtml = posts.map((post) => `<a class="post-card" data-expansion="ai-school" href="/blog/${post.slug}.html"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" /><div class="post-card-content"><p class="meta">${escapeHtml(post.category)} | ${escapeHtml(post.audience)}</p><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.meta)}</p></div></a>`).join('\n');

const blogIndexPath = path.join(root, 'public/blog/index.html');
let blogIndex = fs.readFileSync(blogIndexPath, 'utf8');
blogIndex = blogIndex
  .replace('Parent-friendly U.S. and international articles about online learning for kids, reading, math, science, coding, screen time, curriculum pacing, and learning progress.', 'Parent-friendly U.S. and international articles about Kid Genius World as an AI school experience for kids, with reading, math, science, coding, games, progress tools, and clear non-accredited limits.')
  .replace('<p class="eyebrow">Fresh guides</p><h1>Kid Learning Blog</h1><p class="lead">Parent-friendly U.S. and international articles about online learning for kids, reading, math, science, coding, screen time, curriculum pacing, and learning progress.</p>', '<p class="eyebrow">AI school guides</p><h1>Kid Learning Blog</h1><p class="lead">Parent-friendly U.S. and international articles about Kid Genius World as an AI school experience for kids, with reading, math, science, coding, games, progress tools, and clear non-accredited limits.</p>')
  .replace(/<a class="post-card" data-expansion="ai-school"[\s\S]*?<\/a>\n?/g, '');
blogIndex = blogIndex.replace('<main class="page"><div class="post-grid">', `<main class="page"><div class="post-grid">${cardHtml}\n`);
fs.writeFileSync(blogIndexPath, blogIndex, 'utf8');

const sitemapPath = path.join(root, 'public/sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
sitemap = sitemap.replace(/<lastmod>2026-05-17<\/lastmod>/, `<lastmod>${lastMod}</lastmod>`);
sitemap = sitemap.replace(/<loc>https:\/\/kid-genius-world\.com\/blog\/<\/loc>\s*<lastmod>2026-05-17<\/lastmod>/, `<loc>https://kid-genius-world.com/blog/</loc>\n    <lastmod>${lastMod}</lastmod>`);
for (const post of posts) {
  const loc = `${baseUrl}/blog/${post.slug}.html`;
  const escapedLoc = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  sitemap = sitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${escapedLoc}<\\/loc>[\\s\\S]*?<\\/url>\\s*`, 'g'), '\n');
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    const imageUrl = post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`;
    const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image><image:loc>${imageUrl}</image:loc></image:image>
  </url>
`;
    sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
  }
}
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

const rootIndexPath = path.join(root, 'index.html');
let rootIndex = fs.readFileSync(rootIndexPath, 'utf8');
rootIndex = rootIndex
  .replace('Kid Genius World by CrateShip Studios is a parent-guided online learning app for kids with reading, math, science, coding, stories, games, and progress tools.', 'Kid Genius World by CrateShip Studios is a parent-guided AI school experience and online learning app for kids with reading, math, science, coding, stories, games, and progress tools. It is not accredited and is not a real school.')
  .replace('Kid Genius World | Parent-Guided Online Learning for Kids', 'Kid Genius World | Parent-Guided AI School Experience for Kids')
  .replace('A colorful learning app for kids with grade-level lessons, stories, games, parent controls, and progress tracking.', 'A colorful AI-powered learning app for kids with lessons, stories, games, parent controls, progress tracking, and clear non-accredited limits.');
fs.writeFileSync(rootIndexPath, rootIndex, 'utf8');

console.log(`Added ${posts.length} Kid Genius World AI school blog pages and updated index, homepage metadata, and sitemap.`);
