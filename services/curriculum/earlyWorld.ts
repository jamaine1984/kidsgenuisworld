import { createSeededRandom, getDailySeed } from '../dailyRotation';

export type EarlyWorldVisual = 'position' | 'home' | 'school' | 'neighborhood' | 'land-water' | 'map-symbol' | 'directions' | 'weather' | 'community' | 'resources' | 'traditions';

export interface EarlyWorldQuestion {
  id: string;
  phase: string;
  title: string;
  prompt: string;
  mapClue: string;
  visual: EarlyWorldVisual;
  answer: string;
  options: string[];
  skill: string;
  explanation: string;
}

const PHASES = ['Start with me', 'Read the place', 'Follow the map', 'Compare communities', 'Connect people and places', 'World Studies check'];

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const options = (answer: string, distractors: string[], random: () => number) => shuffle([answer, ...distractors.filter(item => item !== answer).slice(0, 3)], random);
const pick = <T,>(items: T[], random: () => number) => items[Math.floor(random() * items.length)];
type Factory = (random: () => number) => Omit<EarlyWorldQuestion, 'id' | 'phase'>;

const preKFactories: Factory[] = [
  random => {
    const clue = pick([
      { scene: 'The red ball is beside the blue box.', answer: 'Beside' },
      { scene: 'The teddy bear is under the chair.', answer: 'Under' },
      { scene: 'The book is on the table.', answer: 'On' },
      { scene: 'The child stands behind the door.', answer: 'Behind' },
    ], random);
    return { title: 'My Body in Space', prompt: 'Which position word matches the clue?', mapClue: clue.scene, visual: 'position', answer: clue.answer, options: options(clue.answer, ['Beside', 'Under', 'On', 'Behind'].filter(item => item !== clue.answer), random), skill: 'position words', explanation: `${clue.answer} tells where one thing is compared with another. ${clue.scene}` };
  },
  random => {
    const room = pick([
      { action: 'A family cooks dinner.', answer: 'Kitchen' },
      { action: 'A child sleeps at night.', answer: 'Bedroom' },
      { action: 'A family sits together on a sofa.', answer: 'Living room' },
      { action: 'A person washes hands at a sink.', answer: 'Bathroom' },
    ], random);
    return { title: 'Places in My Home', prompt: `Which room best matches this activity?`, mapClue: room.action, visual: 'home', answer: room.answer, options: options(room.answer, ['Kitchen', 'Bedroom', 'Living room', 'Bathroom'].filter(item => item !== room.answer), random), skill: 'home places and uses', explanation: `${room.answer} is the home place that best fits the activity: ${room.action}` };
  },
  random => {
    const helper = pick([
      { need: 'check out a storybook', answer: 'Library' },
      { need: 'eat lunch with the class', answer: 'Cafeteria' },
      { need: 'get help for a scraped knee', answer: 'Nurse office' },
      { need: 'play safely outside', answer: 'Playground' },
    ], random);
    return { title: 'My School Map', prompt: `Where should a student go to ${helper.need}?`, mapClue: `school entrance -> ?`, visual: 'school', answer: helper.answer, options: options(helper.answer, ['Library', 'Cafeteria', 'Nurse office', 'Playground'].filter(item => item !== helper.answer), random), skill: 'school places and helpers', explanation: `The ${helper.answer} is the school place connected to that need.` };
  },
  random => {
    const destination = pick([
      { need: 'borrow books', answer: 'Library' },
      { need: 'buy food', answer: 'Grocery store' },
      { need: 'play on swings', answer: 'Park' },
      { need: 'mail a letter', answer: 'Post office' },
    ], random);
    return { title: 'My Neighborhood', prompt: `Which neighborhood place helps people ${destination.need}?`, mapClue: `home -> street -> ${destination.answer}`, visual: 'neighborhood', answer: destination.answer, options: options(destination.answer, ['Library', 'Grocery store', 'Park', 'Post office'].filter(item => item !== destination.answer), random), skill: 'neighborhood places', explanation: `A ${destination.answer} is a neighborhood place where people can ${destination.need}.` };
  },
  random => {
    const feature = pick([
      { clue: 'A large blue area where fish can swim', answer: 'Water' },
      { clue: 'A grassy place where a house can stand', answer: 'Land' },
      { clue: 'A flowing blue line through a valley', answer: 'Water' },
      { clue: 'A rocky mountain above a town', answer: 'Land' },
    ], random);
    return { title: 'Land and Water', prompt: 'Should this feature be sorted as land or water?', mapClue: feature.clue, visual: 'land-water', answer: feature.answer, options: options(feature.answer, ['Land', 'Water', 'A building', 'A road sign'].filter(item => item !== feature.answer), random), skill: 'land and water features', explanation: `${feature.clue} is an example of ${feature.answer.toLowerCase()}.` };
  },
  random => {
    const symbol = pick([
      { mark: 'A small tree picture', answer: 'Park' },
      { mark: 'A book picture', answer: 'Library' },
      { mark: 'A red cross or H', answer: 'Hospital' },
      { mark: 'A bus picture', answer: 'Bus stop' },
    ], random);
    return { title: 'Picture Map Symbols', prompt: 'What place could this map symbol represent?', mapClue: symbol.mark, visual: 'map-symbol', answer: symbol.answer, options: options(symbol.answer, ['Park', 'Library', 'Hospital', 'Bus stop'].filter(item => item !== symbol.answer), random), skill: 'matching map symbols to places', explanation: `${symbol.mark} can stand for a ${symbol.answer.toLowerCase()} on a picture map.` };
  },
  random => {
    const route = pick([
      { clue: 'Start at the house. Move one square right.', answer: 'Right' },
      { clue: 'Start at the tree. Move one square left.', answer: 'Left' },
      { clue: 'Start at the pond. Move one square up.', answer: 'Up' },
      { clue: 'Start at the school. Move one square down.', answer: 'Down' },
    ], random);
    return { title: 'Follow the Route', prompt: 'Which direction does the map tell you to move?', mapClue: route.clue, visual: 'directions', answer: route.answer, options: options(route.answer, ['Up', 'Down', 'Left', 'Right'].filter(item => item !== route.answer), random), skill: 'following simple directions', explanation: `${route.answer} is the direction named by the route clue.` };
  },
  random => {
    const weather = pick([
      { clue: 'Rain falls and puddles form.', answer: 'Raincoat and boots' },
      { clue: 'Snow covers the ground.', answer: 'Warm coat and gloves' },
      { clue: 'The sun is bright and the day is hot.', answer: 'Sun hat and water bottle' },
      { clue: 'A cool wind moves the leaves.', answer: 'Light jacket' },
    ], random);
    return { title: 'Weather and Clothing', prompt: 'Which choice helps a child prepare for this weather?', mapClue: weather.clue, visual: 'weather', answer: weather.answer, options: options(weather.answer, ['Raincoat and boots', 'Warm coat and gloves', 'Sun hat and water bottle', 'Light jacket'].filter(item => item !== weather.answer), random), skill: 'weather and daily life', explanation: `${weather.answer} is a useful choice when ${weather.clue.toLowerCase()}` };
  },
];

const kindergartenFactories: Factory[] = [
  random => {
    const symbol = pick([
      { clue: 'A blue wavy line', answer: 'River' },
      { clue: 'A green tree shape', answer: 'Park' },
      { clue: 'A black line with small cross marks', answer: 'Railroad' },
      { clue: 'A star beside a building', answer: 'Important place' },
    ], random);
    return { title: 'Read a Map Key', prompt: 'Use the map key. What does this symbol show?', mapClue: symbol.clue, visual: 'map-symbol', answer: symbol.answer, options: options(symbol.answer, ['River', 'Park', 'Railroad', 'Important place'].filter(item => item !== symbol.answer), random), skill: 'using map symbols and keys', explanation: `The map key connects ${symbol.clue.toLowerCase()} with ${symbol.answer.toLowerCase()}.` };
  },
  random => ({ title: 'Cardinal Directions', prompt: 'The library is east of the school. Which way should you travel from school?', mapClue: 'W  <-  SCHOOL  ->  LIBRARY  E', visual: 'directions', answer: 'East', options: options('East', ['West', 'North', 'South'], random), skill: 'cardinal directions', explanation: 'East is to the right on this north-up map, and the library is east of the school.' }),
  random => {
    const feature = pick([
      { clue: 'land with water on every side', answer: 'Island' },
      { clue: 'water with land around it', answer: 'Lake' },
      { clue: 'high, steep land', answer: 'Mountain' },
      { clue: 'water flowing across land', answer: 'River' },
    ], random);
    return { title: 'Landform Detective', prompt: `Which feature means ${feature.clue}?`, mapClue: feature.clue, visual: 'land-water', answer: feature.answer, options: options(feature.answer, ['Island', 'Lake', 'Mountain', 'River'].filter(item => item !== feature.answer), random), skill: 'land and water features', explanation: `${feature.answer} means ${feature.clue}.` };
  },
  random => {
    const helper = pick([
      { clue: 'helps when a building is on fire', answer: 'Firefighter at a fire station' },
      { clue: 'helps people find and borrow books', answer: 'Librarian at a library' },
      { clue: 'delivers letters and packages', answer: 'Mail carrier at a post office' },
      { clue: 'helps sick people feel better', answer: 'Doctor at a clinic' },
    ], random);
    return { title: 'Community Helpers', prompt: `Who works in a place that helps with this need: ${helper.clue}?`, mapClue: 'community need -> helper -> place', visual: 'community', answer: helper.answer, options: options(helper.answer, ['Firefighter at a fire station', 'Librarian at a library', 'Mail carrier at a post office', 'Doctor at a clinic'].filter(item => item !== helper.answer), random), skill: 'community helpers and places', explanation: `${helper.answer} ${helper.clue}.` };
  },
  random => {
    const resource = pick([
      { need: 'drinking and washing', answer: 'Clean water' },
      { need: 'building a wooden table', answer: 'Trees' },
      { need: 'growing vegetables', answer: 'Soil and water' },
      { need: 'warming a sunny window', answer: 'Sunlight' },
    ], random);
    return { title: 'Needs and Resources', prompt: `Which resource can people use for ${resource.need}?`, mapClue: `need: ${resource.need}`, visual: 'resources', answer: resource.answer, options: options(resource.answer, ['Clean water', 'Trees', 'Soil and water', 'Sunlight'].filter(item => item !== resource.answer), random), skill: 'resources meeting needs', explanation: `${resource.answer} is a resource people can use for ${resource.need}.` };
  },
  random => ({ title: 'Weather Changes Daily Life', prompt: 'Town A is snowy. Town B is hot and dry. Which plan best fits both places?', mapClue: 'Town A: snow | Town B: hot sun', visual: 'weather', answer: 'Wear warm boots in A and carry water in B.', options: options('Wear warm boots in A and carry water in B.', ['Wear swimsuits in both towns.', 'Use snow boots only in Town B.', 'Pretend weather never affects plans.'], random), skill: 'weather and place', explanation: 'People make different clothing and safety choices because places can have different weather.' }),
  random => ({ title: 'Family Traditions', prompt: 'Two families celebrate special days in different ways. What should the class understand?', mapClue: 'Family A shares a meal. Family B sings special songs.', visual: 'traditions', answer: 'Families can have different meaningful traditions.', options: options('Families can have different meaningful traditions.', ['Only one family is correct.', 'Every family must celebrate the same way.', 'Traditions have no meaning.'], random), skill: 'families and traditions', explanation: 'Communities include families with different traditions, foods, music, stories, and celebrations.' }),
  random => ({ title: 'Home and School Route', prompt: 'The map key says a dotted line is a walking path. What does the dotted line from home to school show?', mapClue: 'HOME  . . . . .  SCHOOL', visual: 'directions', answer: 'A route from home to school', options: options('A route from home to school', ['A river under the school', 'The weather tomorrow', 'A list of classroom rules'], random), skill: 'using a map route', explanation: 'The dotted line is a map symbol for a route connecting home and school.' }),
];

export const generateEarlyWorldQuestion = (level: 1 | 2, step: number): EarlyWorldQuestion => {
  const random = createSeededRandom(getDailySeed(`early-world-grade-${level}`, step));
  const factories = level === 1 ? preKFactories : kindergartenFactories;
  const question = factories[step % factories.length](random);
  return { ...question, id: `early-world-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`, phase: PHASES[step % PHASES.length] };
};
