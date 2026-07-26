import { createSeededRandom, getDailySeed } from './dailyRotation';

/**
 * GRADE-LOCKED DAILY QUESTION GENERATORS
 * ======================================
 * Hand-authored question banks cannot reach the volume this app needs.
 * Six classes a day, five days a week, thirty-six weeks is ~1,080 sessions per
 * grade per year -- roughly 10,000 questions per grade if a session is ten
 * questions. Authoring that by hand across seven grades is not realistic.
 *
 * Instead we store grade-tagged STRUCTURED FACTS and generate questions from
 * them with several templates. A handful of facts becomes hundreds of distinct
 * questions, and every question is guaranteed to be built only from facts
 * tagged for that exact grade -- so grade purity is structural, not a filter
 * someone can forget to apply.
 *
 * Every generator is seeded by (date + grade + step), so:
 *   - all children in a grade get the same set on a given day
 *   - the set is completely different tomorrow
 *   - a parent report can reproduce exactly what was asked, any day
 */

// ============================================
// SHARED HELPERS
// ============================================

/** Deterministic shuffle driven by the daily seed. */
const seededShuffle = <T>(items: T[], random: () => number): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const pick = <T>(items: T[], random: () => number): T => items[Math.floor(random() * items.length)];

/** Clamp any incoming level to the 1-7 (Pre-K .. 5th grade) range. */
const clampLevel = (level: number): number => Math.min(Math.max(Math.round(level), 1), 7);

const GRADE_NAMES: Record<number, string> = {
  1: 'Pre-K',
  2: 'Kindergarten',
  3: '1st Grade',
  4: '2nd Grade',
  5: '3rd Grade',
  6: '4th Grade',
  7: '5th Grade',
};

export const getGradeName = (level: number): string => GRADE_NAMES[clampLevel(level)] || `Level ${level}`;

// ============================================
// GEOGRAPHY: structured place facts per grade
// ============================================

interface PlaceFact {
  name: string;
  capital?: string;
  continent?: string;
  landmark?: string;
  funFact: string;
}

/**
 * Countries/places tagged to the grade where that content is developmentally
 * appropriate. Lower grades stay concrete (land vs water, familiar countries);
 * upper grades add capitals, regions, and physical geography.
 */
const PLACE_FACTS: Record<number, PlaceFact[]> = {
  // Pre-K: concrete places a young child can picture
  1: [
    { name: 'ocean', funFact: 'The ocean is a very big body of salty water.' },
    { name: 'mountain', funFact: 'A mountain is land that rises high above the ground around it.' },
    { name: 'forest', funFact: 'A forest is a place where many trees grow together.' },
    { name: 'desert', funFact: 'A desert is a very dry place that gets little rain.' },
    { name: 'river', funFact: 'A river is water that flows across the land.' },
    { name: 'island', funFact: 'An island is land with water all around it.' },
    { name: 'lake', funFact: 'A lake is water with land all around it.' },
    { name: 'beach', funFact: 'A beach is the sandy land right next to the water.' },
  ],
  // Kindergarten: continents and very familiar countries
  2: [
    { name: 'United States', continent: 'North America', landmark: 'the Statue of Liberty', funFact: 'The Statue of Liberty stands in New York Harbor.' },
    { name: 'Canada', continent: 'North America', landmark: 'Niagara Falls', funFact: 'Canada is the country directly north of the United States.' },
    { name: 'Mexico', continent: 'North America', landmark: 'Chichen Itza', funFact: 'Mexico is directly south of the United States.' },
    { name: 'Australia', continent: 'Australia', landmark: 'the Sydney Opera House', funFact: 'Kangaroos and koalas live in Australia.' },
    { name: 'Egypt', continent: 'Africa', landmark: 'the pyramids of Giza', funFact: 'The pyramids of Giza were built thousands of years ago.' },
    { name: 'Japan', continent: 'Asia', landmark: 'Mount Fuji', funFact: 'Japan is an island country in East Asia.' },
  ],
  // 1st grade: continents plus recognizable landmarks
  3: [
    { name: 'France', capital: 'Paris', continent: 'Europe', landmark: 'the Eiffel Tower', funFact: 'The Eiffel Tower is a famous landmark in Paris.' },
    { name: 'Italy', capital: 'Rome', continent: 'Europe', landmark: 'the Colosseum', funFact: 'Italy is shaped like a boot.' },
    { name: 'China', capital: 'Beijing', continent: 'Asia', landmark: 'the Great Wall', funFact: 'The Great Wall of China is one of the longest structures ever built.' },
    { name: 'Brazil', capital: 'Brasilia', continent: 'South America', landmark: 'the Amazon rainforest', funFact: 'Brazil is the largest country in South America.' },
    { name: 'India', capital: 'New Delhi', continent: 'Asia', landmark: 'the Taj Mahal', funFact: 'The Taj Mahal is a famous white marble building in India.' },
    { name: 'Kenya', capital: 'Nairobi', continent: 'Africa', landmark: 'the Great Rift Valley', funFact: 'Kenya is known for safaris and wildlife reserves.' },
  ],
  // 2nd grade: capitals become the focus
  4: [
    { name: 'United States', capital: 'Washington D.C.', continent: 'North America', landmark: 'the White House', funFact: 'Washington D.C. is not part of any state.' },
    { name: 'United Kingdom', capital: 'London', continent: 'Europe', landmark: 'Big Ben', funFact: 'London sits on the River Thames.' },
    { name: 'Germany', capital: 'Berlin', continent: 'Europe', landmark: 'the Brandenburg Gate', funFact: 'Germany is in the middle of Europe.' },
    { name: 'Spain', capital: 'Madrid', continent: 'Europe', landmark: 'the Sagrada Familia', funFact: 'Madrid sits near the center of Spain.' },
    { name: 'Argentina', capital: 'Buenos Aires', continent: 'South America', landmark: 'the Andes Mountains', funFact: 'Argentina reaches from tropics to near-Antarctic lands.' },
    { name: 'South Africa', capital: 'Pretoria', continent: 'Africa', landmark: 'Table Mountain', funFact: 'South Africa has three capital cities for different branches of government.' },
  ],
  // 3rd grade: wider world, physical geography
  5: [
    { name: 'Russia', capital: 'Moscow', continent: 'Europe and Asia', landmark: 'the Kremlin', funFact: 'Russia spans both Europe and Asia and is the largest country in the world by land area.' },
    { name: 'Peru', capital: 'Lima', continent: 'South America', landmark: 'Machu Picchu', funFact: 'Machu Picchu sits high in the Andes Mountains.' },
    { name: 'Greece', capital: 'Athens', continent: 'Europe', landmark: 'the Parthenon', funFact: 'Greece has thousands of islands.' },
    { name: 'Norway', capital: 'Oslo', continent: 'Europe', landmark: 'the fjords', funFact: 'Norway has deep coastal valleys called fjords carved by glaciers.' },
    { name: 'Nigeria', capital: 'Abuja', continent: 'Africa', landmark: 'the Niger River', funFact: 'Nigeria has the largest population of any African country.' },
    { name: 'Thailand', capital: 'Bangkok', continent: 'Asia', landmark: 'the Grand Palace', funFact: 'Thailand is the only Southeast Asian country never colonized by a European power.' },
  ],
  // 4th grade: less familiar capitals and regions
  6: [
    { name: 'Turkey', capital: 'Ankara', continent: 'Europe and Asia', landmark: 'the Hagia Sophia', funFact: 'Turkey sits on two continents, Europe and Asia.' },
    { name: 'Chile', capital: 'Santiago', continent: 'South America', landmark: 'the Atacama Desert', funFact: 'The Atacama Desert is one of the driest places on Earth.' },
    { name: 'Vietnam', capital: 'Hanoi', continent: 'Asia', landmark: 'Ha Long Bay', funFact: 'Ha Long Bay has thousands of limestone islands.' },
    { name: 'Morocco', capital: 'Rabat', continent: 'Africa', landmark: 'the Sahara Desert', funFact: 'The Sahara is the largest hot desert in the world.' },
    { name: 'Sweden', capital: 'Stockholm', continent: 'Europe', landmark: 'the Baltic Sea', funFact: 'Stockholm is built across fourteen islands.' },
    { name: 'Indonesia', capital: 'Jakarta', continent: 'Asia', landmark: 'Borobudur', funFact: 'Indonesia is made up of more than 17,000 islands.' },
  ],
  // 5th grade: demanding capitals and physical systems
  7: [
    { name: 'Kazakhstan', capital: 'Astana', continent: 'Asia', landmark: 'the Steppe', funFact: 'Kazakhstan is the largest landlocked country in the world.' },
    { name: 'Ethiopia', capital: 'Addis Ababa', continent: 'Africa', landmark: 'the Simien Mountains', funFact: 'Ethiopia is one of the oldest continuously independent countries in Africa.' },
    { name: 'Switzerland', capital: 'Bern', continent: 'Europe', landmark: 'the Matterhorn', funFact: 'The Alps cover roughly sixty percent of Switzerland.' },
    { name: 'New Zealand', capital: 'Wellington', continent: 'Oceania', landmark: 'the Southern Alps', funFact: 'New Zealand is part of Oceania and sits on the boundary of two tectonic plates.' },
    { name: 'Colombia', capital: 'Bogota', continent: 'South America', landmark: 'the Amazon basin', funFact: 'Colombia touches both the Pacific Ocean and the Caribbean Sea.' },
    { name: 'Nepal', capital: 'Kathmandu', continent: 'Asia', landmark: 'Mount Everest', funFact: 'Mount Everest is the highest point on Earth above sea level.' },
  ],
};

export interface GeneratedGeographyQuestion {
  gradeLevel: number;
  type: string;
  question: string;
  answer: string;
  options: string[];
  funFact: string;
}

/**
 * Builds one geography question for an exact grade. Question form varies by
 * what the grade's facts actually support, so a Pre-K child is never asked for
 * a capital city.
 */
export const generateGeographyQuestion = (
  level: number,
  step = 0,
): GeneratedGeographyQuestion | null => {
  const lvl = clampLevel(level);
  const facts = PLACE_FACTS[lvl];
  if (!facts || facts.length < 4) return null;

  const random = createSeededRandom(getDailySeed(`geography-grade-${lvl}`, step));
  const subject = pick(facts, random);
  const others = facts.filter(f => f.name !== subject.name);

  // Which templates does this grade's data support?
  const templates: string[] = [];
  if (lvl === 1) {
    templates.push('describe');
  } else {
    if (subject.continent) templates.push('continent');
    if (subject.landmark) templates.push('landmark');
    if (subject.capital && lvl >= 4) templates.push('capital', 'reverse-capital');
  }
  if (templates.length === 0) return null;

  const template = pick(templates, random);
  const buildOptions = (answer: string, pool: string[]): string[] => {
    const distractors = seededShuffle(pool.filter(p => p !== answer), random).slice(0, 3);
    return seededShuffle([answer, ...distractors], random);
  };

  switch (template) {
    case 'describe': {
      // Pre-K: match a place to its description
      return {
        gradeLevel: lvl,
        type: 'nature',
        question: `Which place is this? ${subject.funFact}`,
        answer: subject.name,
        options: buildOptions(subject.name, facts.map(f => f.name)),
        funFact: subject.funFact,
      };
    }
    case 'continent': {
      const answer = subject.continent as string;
      const pool = Array.from(new Set(facts.map(f => f.continent).filter(Boolean) as string[]));
      const extras = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Australia', 'Antarctica'];
      const merged = Array.from(new Set([...pool, ...extras]));
      return {
        gradeLevel: lvl,
        type: 'continent',
        question: `Which continent is ${subject.name} in?`,
        answer,
        options: buildOptions(answer, merged),
        funFact: subject.funFact,
      };
    }
    case 'landmark': {
      return {
        gradeLevel: lvl,
        type: 'landmark',
        question: `In which country would you find ${subject.landmark}?`,
        answer: subject.name,
        options: buildOptions(subject.name, facts.map(f => f.name)),
        funFact: subject.funFact,
      };
    }
    case 'capital': {
      const answer = subject.capital as string;
      const pool = facts.map(f => f.capital).filter(Boolean) as string[];
      return {
        gradeLevel: lvl,
        type: 'capital',
        question: `What is the capital of ${subject.name}?`,
        answer,
        options: buildOptions(answer, pool),
        funFact: subject.funFact,
      };
    }
    case 'reverse-capital': {
      return {
        gradeLevel: lvl,
        type: 'capital',
        question: `${subject.capital} is the capital of which country?`,
        answer: subject.name,
        options: buildOptions(subject.name, others.map(f => f.name).concat(subject.name)),
        funFact: subject.funFact,
      };
    }
    default:
      return null;
  }
};

// ============================================
// SCIENCE: tagged items drive classification questions
// ============================================

interface ScienceItem {
  name: string;
  tags: string[];
  funFact: string;
}

/**
 * Items tagged with the categories they belong to. Questions are generated by
 * asking which item carries a tag, with distractors drawn from same-grade items
 * that lack it -- so answers are always defensible and never ambiguous.
 */
const SCIENCE_ITEMS: Record<number, ScienceItem[]> = {
  1: [
    { name: 'a puppy', tags: ['living', 'animal'], funFact: 'Living things can move, eat, and grow.' },
    { name: 'a flower', tags: ['living', 'plant'], funFact: 'Plants are alive and grow toward the light.' },
    { name: 'a rock', tags: ['nonliving'], funFact: 'Rocks do not eat, grow, or breathe.' },
    { name: 'a toy car', tags: ['nonliving'], funFact: 'Toys are made by people and are not alive.' },
    { name: 'ice cream', tags: ['nonliving', 'cold'], funFact: 'Ice cream must stay cold or it melts.' },
    { name: 'a cup of soup', tags: ['nonliving', 'hot'], funFact: 'Hot soup gives off steam as it cools.' },
    { name: 'the sun', tags: ['nonliving', 'hot', 'sky'], funFact: 'The sun gives us light and warmth.' },
    { name: 'a tree', tags: ['living', 'plant'], funFact: 'Trees make new leaves as they grow.' },
  ],
  2: [
    { name: 'a fish', tags: ['living', 'animal', 'water'], funFact: 'Fish have gills that let them breathe underwater.' },
    { name: 'a bird', tags: ['living', 'animal', 'air'], funFact: 'Most birds have hollow bones that keep them light.' },
    { name: 'a sunflower', tags: ['living', 'plant'], funFact: 'Sunflowers turn to follow the sun across the sky.' },
    { name: 'a cloud', tags: ['nonliving', 'weather', 'sky'], funFact: 'Clouds are made of tiny water droplets.' },
    { name: 'rain', tags: ['nonliving', 'weather', 'water'], funFact: 'Rain falls when water droplets grow heavy enough.' },
    { name: 'a rock', tags: ['nonliving'], funFact: 'Rocks are not alive and do not grow.' },
    { name: 'a cactus', tags: ['living', 'plant', 'desert'], funFact: 'A cactus stores water inside its thick stem.' },
    { name: 'snow', tags: ['nonliving', 'weather', 'cold'], funFact: 'Snow forms when water freezes into ice crystals.' },
  ],
  3: [
    { name: 'the heart', tags: ['body', 'organ'], funFact: 'Your heart beats about 100,000 times every day.' },
    { name: 'the lungs', tags: ['body', 'organ'], funFact: 'Your lungs bring oxygen into your blood.' },
    { name: 'iron', tags: ['magnetic', 'metal'], funFact: 'Magnets attract metals like iron and steel.' },
    { name: 'wood', tags: ['nonmagnetic'], funFact: 'Magnets do not stick to wood.' },
    { name: 'plastic', tags: ['nonmagnetic'], funFact: 'Plastic is not attracted to magnets.' },
    { name: 'a butterfly', tags: ['living', 'animal', 'insect'], funFact: 'A butterfly begins life as a caterpillar.' },
    { name: 'spring', tags: ['season'], funFact: 'Spring is when many plants begin to grow again.' },
    { name: 'winter', tags: ['season', 'cold'], funFact: 'Winter is the coldest season of the year.' },
  ],
  4: [
    { name: 'gravity', tags: ['force'], funFact: 'Gravity pulls everything toward the center of Earth.' },
    { name: 'friction', tags: ['force'], funFact: 'Friction slows things down when surfaces rub together.' },
    { name: 'ice', tags: ['solid', 'water'], funFact: 'Ice is water in its solid state, and it floats.' },
    { name: 'steam', tags: ['gas', 'water'], funFact: 'Steam is water in its gas state.' },
    { name: 'liquid water', tags: ['liquid', 'water'], funFact: 'Liquid water takes the shape of its container.' },
    { name: 'the moon', tags: ['space', 'nonliving'], funFact: 'The moon reflects sunlight rather than making its own light.' },
    { name: 'sound', tags: ['energy', 'wave'], funFact: 'Sound travels as vibrations and cannot travel in space.' },
    { name: 'light', tags: ['energy', 'wave'], funFact: 'Light travels faster than anything else we know of.' },
  ],
  5: [
    { name: 'a mirror', tags: ['reflects'], funFact: 'A mirror reflects light back at the same angle it arrives.' },
    { name: 'photosynthesis', tags: ['plant', 'process'], funFact: 'Plants use sunlight, water, and carbon dioxide to make food.' },
    { name: 'evaporation', tags: ['water-cycle', 'process'], funFact: 'Evaporation turns liquid water into water vapor.' },
    { name: 'condensation', tags: ['water-cycle', 'process'], funFact: 'Condensation turns water vapor back into liquid droplets.' },
    { name: 'a conductor', tags: ['electricity'], funFact: 'Conductors like copper let electricity flow through them easily.' },
    { name: 'an insulator', tags: ['electricity'], funFact: 'Insulators like rubber block the flow of electricity.' },
    { name: 'a food chain', tags: ['ecosystem'], funFact: 'A food chain shows how energy passes from one living thing to another.' },
    { name: 'erosion', tags: ['earth', 'process'], funFact: 'Erosion is the slow movement of rock and soil by wind or water.' },
  ],
  6: [
    { name: 'a mammal', tags: ['vertebrate', 'animal-class'], funFact: 'Mammals have hair or fur and feed milk to their young.' },
    { name: 'a reptile', tags: ['vertebrate', 'animal-class'], funFact: 'Reptiles are cold-blooded and most lay eggs on land.' },
    { name: 'an amphibian', tags: ['vertebrate', 'animal-class'], funFact: 'Amphibians usually begin life in water and later live on land.' },
    { name: 'an atom', tags: ['matter', 'particle'], funFact: 'Atoms are the building blocks of all matter.' },
    { name: 'a molecule', tags: ['matter', 'particle'], funFact: 'A molecule forms when two or more atoms bond together.' },
    { name: 'kinetic energy', tags: ['energy'], funFact: 'Kinetic energy is the energy of motion.' },
    { name: 'potential energy', tags: ['energy'], funFact: 'Potential energy is stored energy waiting to be released.' },
    { name: 'a circuit', tags: ['electricity'], funFact: 'Electricity needs a complete loop, called a circuit, to flow.' },
  ],
  7: [
    { name: 'the water cycle', tags: ['earth-system', 'process'], funFact: 'The water cycle moves water between oceans, air, and land.' },
    { name: 'plate tectonics', tags: ['earth-system', 'process'], funFact: 'Earth’s crust is broken into plates that slowly move.' },
    { name: 'a cell membrane', tags: ['cell', 'biology'], funFact: 'The cell membrane controls what enters and leaves a cell.' },
    { name: 'a nucleus', tags: ['cell', 'biology'], funFact: 'The nucleus holds a cell’s genetic instructions.' },
    { name: 'a chemical change', tags: ['chemistry', 'change'], funFact: 'A chemical change makes a new substance and is hard to reverse.' },
    { name: 'a physical change', tags: ['chemistry', 'change'], funFact: 'A physical change alters form but not the substance itself.' },
    { name: 'renewable energy', tags: ['energy', 'resource'], funFact: 'Renewable sources like wind and solar replenish naturally.' },
    { name: 'nonrenewable energy', tags: ['energy', 'resource'], funFact: 'Nonrenewable sources like coal take millions of years to form.' },
  ],
};

/** Human-readable prompts for each tag, so questions read naturally. */
const TAG_PROMPTS: Record<string, string> = {
  living: 'Which one is alive?',
  nonliving: 'Which one is NOT alive?',
  plant: 'Which one is a plant?',
  animal: 'Which one is an animal?',
  hot: 'Which one is hot?',
  cold: 'Which one is cold?',
  weather: 'Which one is a kind of weather?',
  water: 'Which one is found in water?',
  season: 'Which one is a season?',
  organ: 'Which one is an organ in your body?',
  magnetic: 'Which one would a magnet stick to?',
  nonmagnetic: 'Which one would a magnet NOT stick to?',
  force: 'Which one is a force?',
  solid: 'Which one is a solid?',
  liquid: 'Which one is a liquid?',
  gas: 'Which one is a gas?',
  energy: 'Which one is a form of energy?',
  process: 'Which one is a natural process?',
  electricity: 'Which one is used to explain electricity?',
  particle: 'Which one is a building block of matter?',
  cell: 'Which one is part of a cell?',
};

export interface GeneratedScienceQuestion {
  id: string;
  gradeLevel: number;
  title: string;
  question: string;
  hypothesis: string[];
  correctAnswer: number;
  explanation: string;
  funFact: string;
  category: string;
  icon: string;
}

const SCIENCE_ICONS = ['\u{1F52C}', '\u{1F9EA}', '\u{1F30D}', '⚡', '\u{1F331}', '\u{1F9F2}'];

/**
 * Builds one science classification question for an exact grade. The correct
 * answer carries the target tag; every distractor provably does not.
 */
export const generateScienceQuestion = (
  level: number,
  step = 0,
): GeneratedScienceQuestion | null => {
  const lvl = clampLevel(level);
  const items = SCIENCE_ITEMS[lvl];
  if (!items || items.length < 4) return null;

  const random = createSeededRandom(getDailySeed(`science-grade-${lvl}`, step));

  // Only use tags that have at least one match AND at least three non-matches,
  // so we can always build one correct answer plus three clean distractors.
  const usableTags = Object.keys(TAG_PROMPTS).filter(tag => {
    const withTag = items.filter(i => i.tags.includes(tag));
    const withoutTag = items.filter(i => !i.tags.includes(tag));
    return withTag.length >= 1 && withoutTag.length >= 3;
  });
  if (usableTags.length === 0) return null;

  const tag = pick(usableTags, random);
  const matches = items.filter(i => i.tags.includes(tag));
  const nonMatches = items.filter(i => !i.tags.includes(tag));

  const answerItem = pick(matches, random);
  const distractors = seededShuffle(nonMatches, random).slice(0, 3);
  const options = seededShuffle([answerItem, ...distractors], random);

  return {
    id: `science-gen-${lvl}-${tag}-${answerItem.name.replace(/\s+/g, '-')}-${step}`,
    gradeLevel: lvl,
    title: getGradeName(lvl) + ' Science',
    question: TAG_PROMPTS[tag],
    hypothesis: options.map(o => o.name),
    correctAnswer: options.findIndex(o => o.name === answerItem.name),
    explanation: `${answerItem.name.charAt(0).toUpperCase()}${answerItem.name.slice(1)} is the answer. ${answerItem.funFact}`,
    funFact: answerItem.funFact,
    category: 'nature',
    icon: SCIENCE_ICONS[Math.floor(random() * SCIENCE_ICONS.length)],
  };
};

// ============================================
// CAPACITY REPORTING (used by QA + parent reports)
// ============================================

/**
 * Rough count of distinct questions each generator can produce for a grade.
 * Used by the QA script to prove the app has enough non-repeating content to
 * cover a full school year.
 */
export const getGeneratorCapacity = (level: number): { geography: number; science: number } => {
  const lvl = clampLevel(level);
  const places = PLACE_FACTS[lvl] || [];
  const items = SCIENCE_ITEMS[lvl] || [];

  // Geography: each fact supports several templates, each with shuffled options.
  const templatesPerFact = lvl === 1 ? 1 : (places[0]?.capital && lvl >= 4 ? 4 : 2);
  const geography = places.length * templatesPerFact;

  // Science: every (tag, matching item) pair is a distinct question.
  let science = 0;
  Object.keys(TAG_PROMPTS).forEach(tag => {
    const withTag = items.filter(i => i.tags.includes(tag)).length;
    const withoutTag = items.filter(i => !i.tags.includes(tag)).length;
    if (withTag >= 1 && withoutTag >= 3) science += withTag;
  });

  return { geography, science };
};

// ============================================
// CODING: procedurally generated grid puzzles
// ============================================

export interface GeneratedCodingChallenge {
  id: string;
  name: string;
  story: string;
  grid: Array<Array<{ type: string }>>;
  startPos: { x: number; y: number; direction: string };
  goalPos: { x: number; y: number };
  maxBlocks: number;
  hint: string;
  gradeLevel: number;
  category: 'basic' | 'turns' | 'loops' | 'maze' | 'advanced';
}

/** Grid size and puzzle style scale with the grade. */
const CODING_SHAPE: Record<number, { w: number; h: number; walls: number; category: GeneratedCodingChallenge['category'] }> = {
  1: { w: 3, h: 1, walls: 0, category: 'basic' },
  2: { w: 4, h: 1, walls: 0, category: 'basic' },
  3: { w: 4, h: 2, walls: 0, category: 'turns' },
  4: { w: 5, h: 3, walls: 1, category: 'turns' },
  5: { w: 5, h: 4, walls: 2, category: 'loops' },
  6: { w: 6, h: 4, walls: 3, category: 'maze' },
  7: { w: 6, h: 5, walls: 4, category: 'advanced' },
};

const CODING_STORIES = [
  'Robot wants to reach the star!',
  'Help Robot find the treasure!',
  'Robot is late for class. Guide it home!',
  'Robot spotted a friend. Plan the path!',
  'Robot needs to deliver a package!',
];

/**
 * Builds a solvable grid puzzle for an exact grade. The goal is always placed
 * on a reachable square and `maxBlocks` is derived from the true shortest path,
 * so every generated puzzle is guaranteed to have a solution.
 */
export const generateCodingChallenge = (
  level: number,
  step = 0,
): GeneratedCodingChallenge | null => {
  const lvl = clampLevel(level);
  const shape = CODING_SHAPE[lvl];
  if (!shape) return null;

  const random = createSeededRandom(getDailySeed(`coding-grade-${lvl}`, step));
  const { w, h } = shape;

  // Start bottom-left, goal somewhere else on the board.
  const start = { x: 0, y: h - 1 };
  const candidates: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const manhattan = Math.abs(x - start.x) + Math.abs(y - start.y);
      if (manhattan >= Math.max(1, Math.floor((w + h) / 3))) candidates.push({ x, y });
    }
  }
  if (candidates.length === 0) return null;
  const goal = pick(candidates, random);

  // Place walls only on squares that are neither start, goal, nor on the simple
  // L-shaped path from start to goal -- that keeps every puzzle solvable.
  const onSimplePath = (x: number, y: number): boolean => {
    const alongX = y === start.y && x >= Math.min(start.x, goal.x) && x <= Math.max(start.x, goal.x);
    const alongY = x === goal.x && y >= Math.min(start.y, goal.y) && y <= Math.max(start.y, goal.y);
    return alongX || alongY;
  };

  const wallSpots: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const isStart = x === start.x && y === start.y;
      const isGoal = x === goal.x && y === goal.y;
      if (!isStart && !isGoal && !onSimplePath(x, y)) wallSpots.push({ x, y });
    }
  }
  const walls = seededShuffle(wallSpots, random).slice(0, Math.min(shape.walls, wallSpots.length));

  const grid: Array<Array<{ type: string }>> = [];
  for (let y = 0; y < h; y += 1) {
    const row: Array<{ type: string }> = [];
    for (let x = 0; x < w; x += 1) {
      if (x === start.x && y === start.y) row.push({ type: 'start' });
      else if (x === goal.x && y === goal.y) row.push({ type: 'goal' });
      else if (walls.some(wall => wall.x === x && wall.y === y)) row.push({ type: 'wall' });
      else row.push({ type: 'empty' });
    }
    grid.push(row);
  }

  // Shortest path along the L route, plus one block per turn needed.
  const stepsX = Math.abs(goal.x - start.x);
  const stepsY = Math.abs(goal.y - start.y);
  const turns = stepsX > 0 && stepsY > 0 ? 1 : 0;
  const maxBlocks = stepsX + stepsY + turns + 1;

  return {
    id: `coding-gen-${lvl}-${step}-${goal.x}-${goal.y}`,
    name: `${getGradeName(lvl)} Path ${step + 1}`,
    story: pick(CODING_STORIES, random),
    grid,
    startPos: { x: start.x, y: start.y, direction: 'right' },
    goalPos: { x: goal.x, y: goal.y },
    maxBlocks,
    hint: turns > 0
      ? `Move across first, then turn and move ${stepsY} more.`
      : `Move forward ${stepsX + stepsY} times.`,
    gradeLevel: lvl,
    category: shape.category,
  };
};
