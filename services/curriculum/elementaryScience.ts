import { createSeededRandom, getDailySeed } from '../dailyRotation';
import { EarlyScienceQuestion } from './earlyScience';

export type ElementaryScienceLevel = 3 | 4;

const PHASES = ['Observe', 'Predict', 'Compare', 'Test an idea', 'Use evidence', 'Explain'];

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const choices = (answer: string, distractors: string[], random: () => number): string[] => (
  shuffle([answer, ...shuffle([...new Set(distractors)].filter(item => item !== answer), random).slice(0, 3)], random)
);

type QuestionSeed = Omit<EarlyScienceQuestion, 'id' | 'phase'>;

const firstGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => ({
    title: 'Light Test', prompt: 'Which object is a source of its own light?', observation: 'sun, mirror, moon, white paper', visual: 'sunlight', answer: 'The sun',
    options: choices('The sun', ['A mirror', 'The moon', 'White paper', 'A shadow'], random), skill: 'sources of light',
    evidence: 'The sun produces light. A mirror, the moon, and paper only reflect light.', explanation: 'The sun is a light source because it produces its own light.',
  }),
  () => ({
    title: 'Shadow Investigation', prompt: 'What must happen to make a clear shadow?', observation: 'flashlight → block → wall', visual: 'shade', answer: 'An object blocks the light',
    options: choices('An object blocks the light', ['The flashlight is turned off forever', 'The wall becomes water', 'The object makes its own sunlight', 'Air stops moving'], random),
    skill: 'light and shadows', evidence: 'A shadow appears on the wall where the block stops the flashlight beam.', explanation: 'A clear shadow forms when an object blocks light from reaching a surface.',
  }),
  () => ({
    title: 'Sound and Vibration', prompt: 'A rubber band is plucked and makes a sound. What evidence shows why?', observation: 'The rubber band moves back and forth quickly.', visual: 'pattern', answer: 'The rubber band vibrates',
    options: choices('The rubber band vibrates', ['The rubber band grows leaves', 'The air becomes solid', 'The table makes sunlight', 'The band turns into water'], random),
    skill: 'sound from vibrations', evidence: 'The band can be seen moving back and forth while the sound is heard.', explanation: 'The vibrating rubber band makes nearby air vibrate, creating sound.',
  }),
  () => ({
    title: 'Plant Parts', prompt: 'Which plant part takes in water from the soil?', observation: 'A seedling has roots, a stem, leaves, and a flower.', visual: 'plant', answer: 'Roots',
    options: choices('Roots', ['Flowers', 'Fruit', 'Petals', 'Pollen'], random), skill: 'plant structures and functions',
    evidence: 'Roots grow through soil where water is found.', explanation: 'Roots absorb water and also help hold the plant in place.',
  }),
  () => ({
    title: 'Animal Body Tools', prompt: 'Which body part helps a duck move through water?', observation: 'A duck has webbed feet, feathers, a beak, and wings.', visual: 'animal', answer: 'Webbed feet',
    options: choices('Webbed feet', ['Dry leaves', 'Tree bark', 'Flower petals', 'A smooth rock'], random), skill: 'animal structures and functions',
    evidence: 'Webbed feet push against water like paddles.', explanation: 'A duck’s webbed feet help it push water and swim.',
  }),
  () => ({
    title: 'Parents and Young', prompt: 'How is a young bird like its parent?', observation: 'Both have beaks, wings, and feathers, but the young bird is smaller.', visual: 'animal', answer: 'Both have the same kinds of body parts',
    options: choices('Both have the same kinds of body parts', ['The young bird is always larger', 'Only the young bird has a beak', 'The parent has no feathers', 'They are made of different materials'], random),
    skill: 'parents and offspring', evidence: 'The observation lists beaks, wings, and feathers on both birds.', explanation: 'Young animals resemble their parents but are not exactly the same.',
  }),
  () => ({
    title: 'Helpful Behavior', prompt: 'Why do adult birds bring food to their chicks?', observation: 'Chicks stay in the nest while adults return with insects.', visual: 'habitat', answer: 'The chicks need food to grow',
    options: choices('The chicks need food to grow', ['The nest needs to become heavier', 'The insects build the nest', 'The chicks make their own sunlight', 'The adults are hiding the sky'], random),
    skill: 'survival behavior', evidence: 'The chicks eat the insects and grow over time.', explanation: 'Adult birds care for their young by bringing food that helps them survive and grow.',
  }),
  () => ({
    title: 'Season Pattern', prompt: 'A tree has flowers in spring, full leaves in summer, and falling leaves in autumn. What does this show?', observation: 'spring: flowers | summer: leaves | autumn: falling leaves', visual: 'pattern', answer: 'Trees change in a seasonal pattern',
    options: choices('Trees change in a seasonal pattern', ['The seasons happen in one day', 'Trees never change', 'Leaves cause winter', 'Flowers only grow at night'], random),
    skill: 'seasonal patterns', evidence: 'Different tree changes repeat during different seasons.', explanation: 'The observations show a pattern of tree changes across the seasons.',
  }),
  () => ({
    title: 'Sky Pattern', prompt: 'Why does the sun seem to move across the sky during the day?', observation: 'morning: east | noon: high | evening: west', visual: 'sky', answer: 'Earth rotates',
    options: choices('Earth rotates', ['The sun circles one playground', 'Clouds pull the sun', 'Night pushes the sun', 'Trees turn the sky'], random),
    skill: 'sun and sky patterns', evidence: 'The sun appears in predictable positions from morning to evening.', explanation: 'Earth’s rotation makes the sun appear to move across our sky.',
  }),
  () => ({
    title: 'Force and Motion', prompt: 'Two identical toy cars are pushed. Car A gets a stronger push. What should happen?', observation: 'same cars + same floor; Car A gets the stronger push', visual: 'force', answer: 'Car A travels farther',
    options: choices('Car A travels farther', ['Car A turns into a ball', 'Both cars disappear', 'Car B makes its own road', 'Neither car can move'], random),
    skill: 'strength of forces', evidence: 'Only the strength of the push changes between the two trials.', explanation: 'A stronger push can make the same object move farther or faster.',
  }),
  () => ({
    title: 'Material Choice', prompt: 'Which material is best for a raincoat?', observation: 'cotton absorbs water; paper tears when wet; plastic keeps water out', visual: 'water', answer: 'Plastic',
    options: choices('Plastic', ['Paper', 'Cotton', 'Cardboard', 'Dry leaves'], random), skill: 'material properties',
    evidence: 'The test shows that plastic keeps water from passing through.', explanation: 'Plastic is useful for a raincoat because it is waterproof.',
  }),
  () => ({
    title: 'Fair Test', prompt: 'To test which paper towel absorbs most water, what should stay the same?', observation: 'Three towel brands are tested with water.', visual: 'water', answer: 'The amount of water used',
    options: choices('The amount of water used', ['The towel brand', 'The final result', 'The name of the observer', 'The answer choice order'], random), skill: 'fair investigations',
    evidence: 'Using the same amount of water makes the towel comparison fair.', explanation: 'A fair test changes one variable and keeps the other conditions the same.',
  }),
];

const secondGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => ({
    title: 'Matter Properties', prompt: 'Which property best explains why glass is used for a window?', observation: 'glass: hard, smooth, transparent', visual: 'senses', answer: 'Transparent',
    options: choices('Transparent', ['Soft', 'Magnetic', 'Stretchy', 'Absorbent'], random), skill: 'properties of matter',
    evidence: 'Light passes through transparent glass, so people can see through it.', explanation: 'Glass is useful for windows because its transparency lets light pass through.',
  }),
  () => ({
    title: 'Reversible Change', prompt: 'Ice melts into liquid water. How can the liquid become solid again?', observation: 'ice → melt → liquid water', visual: 'water', answer: 'Cool it below freezing',
    options: choices('Cool it below freezing', ['Add paper', 'Shine more light forever', 'Mix it with sand', 'Cut it with scissors'], random), skill: 'reversible changes',
    evidence: 'Cooling liquid water below freezing changes it back into ice.', explanation: 'Melting can be reversed by removing heat until the water freezes.',
  }),
  () => ({
    title: 'Build from Pieces', prompt: 'Small blocks are used to build a bridge. What is true about the blocks?', observation: '12 separate blocks → one bridge model', visual: 'pattern', answer: 'The same pieces can be rearranged into a new object',
    options: choices('The same pieces can be rearranged into a new object', ['The blocks stop being matter', 'The bridge makes new blocks', 'Every block becomes liquid', 'The pieces disappear'], random), skill: 'objects made from parts',
    evidence: 'All 12 blocks are still present after they are arranged as a bridge.', explanation: 'A set of pieces can be taken apart and rearranged to build different objects.',
  }),
  () => ({
    title: 'Plant Investigation', prompt: 'Two similar plants get equal light. Plant A gets water; Plant B does not. What result is most likely?', observation: 'same plants + same light; only Plant A receives water', visual: 'plant', answer: 'Plant A grows better',
    options: choices('Plant A grows better', ['Plant B grows better without water', 'Both plants become rocks', 'Light stops reaching Plant A', 'Water makes Plant A disappear'], random), skill: 'plant needs and fair tests',
    evidence: 'Water is the one tested condition, and plants need water to grow.', explanation: 'Plant A is more likely to grow well because it receives both light and water.',
  }),
  () => ({
    title: 'Seed Travel', prompt: 'Which seed is most likely carried by wind?', observation: 'Seed A has light wings. Seed B is heavy and round. Seed C is inside a thick fruit.', visual: 'plant', answer: 'Seed A',
    options: choices('Seed A', ['Seed B', 'Seed C', 'All seeds stay beside the parent plant', 'No seed can move'], random), skill: 'seed dispersal',
    evidence: 'Light wing-like parts help a seed catch moving air.', explanation: 'Seed A has structures that help wind carry it away from the parent plant.',
  }),
  () => ({
    title: 'Habitat Diversity', prompt: 'Why are many different animals found in a wetland?', observation: 'wetland: water, plants, mud, insects, fish, nesting areas', visual: 'habitat', answer: 'It provides many kinds of food and shelter',
    options: choices('It provides many kinds of food and shelter', ['Every animal eats the same food', 'Wetlands have no water', 'Only one plant can grow there', 'Animals do not need shelter'], random), skill: 'biodiversity in habitats',
    evidence: 'The wetland observation lists several resources and places to live.', explanation: 'Different wetland resources support many kinds of living things.',
  }),
  () => ({
    title: 'Life Cycle', prompt: 'Which stage comes after a caterpillar in a butterfly life cycle?', observation: 'egg → caterpillar → ? → butterfly', visual: 'pattern', answer: 'Chrysalis',
    options: choices('Chrysalis', ['Seedling', 'Tadpole', 'Adult frog', 'Flower'], random), skill: 'animal life cycles',
    evidence: 'A caterpillar forms a chrysalis before becoming an adult butterfly.', explanation: 'The chrysalis is the stage between caterpillar and adult butterfly.',
  }),
  () => ({
    title: 'Erosion Test', prompt: 'Which design best slows soil from washing down a slope?', observation: 'Tray A: bare soil. Tray B: soil with plant roots. Equal water is poured.', visual: 'water', answer: 'Soil with plant roots',
    options: choices('Soil with plant roots', ['Bare loose soil', 'More water on the slope', 'A smoother empty tray', 'Removing every plant'], random), skill: 'erosion prevention',
    evidence: 'Roots hold soil in place, so less soil moves with the water.', explanation: 'Plant roots help slow erosion by holding soil together.',
  }),
  () => ({
    title: 'Land and Water Change', prompt: 'After many rainstorms, a stream bank becomes smaller. What process moved the soil?', observation: 'rain + flowing water → soil carried downstream', visual: 'water', answer: 'Erosion',
    options: choices('Erosion', ['Freezing', 'Reflection', 'Pollination', 'Germination'], random), skill: 'erosion and land change',
    evidence: 'Flowing water carried soil away from the stream bank.', explanation: 'Erosion is the movement of rock or soil by water, wind, ice, or gravity.',
  }),
  () => ({
    title: 'Map Water Forms', prompt: 'Which description matches a river?', observation: 'long narrow water feature flowing across land', visual: 'water', answer: 'Flowing water in a channel',
    options: choices('Flowing water in a channel', ['Salt water covering most of Earth', 'Still water surrounded by land', 'Frozen water on a mountain', 'Water vapor in the air'], random), skill: 'landforms and bodies of water',
    evidence: 'A river flows through a channel from higher land toward lower land.', explanation: 'A river is flowing water that follows a channel across land.',
  }),
  () => ({
    title: 'Engineering Test', prompt: 'A paper bridge bends under five cubes. What should the team do next?', observation: 'flat paper bridge bends; folded paper is available', visual: 'force', answer: 'Change the design and test again',
    options: choices('Change the design and test again', ['Hide the result', 'Use no evidence', 'Say every design is equal', 'Stop after the first failure'], random), skill: 'engineering design cycle',
    evidence: 'Testing revealed the bridge’s weak point, which can guide an improvement.', explanation: 'Engineers use test results to improve a design and test it again.',
  }),
  () => ({
    title: 'Data Evidence', prompt: 'Plant A grew 2 cm, Plant B grew 6 cm, and Plant C grew 4 cm. Which claim is supported?', observation: 'A: 2 cm | B: 6 cm | C: 4 cm', visual: 'pattern', answer: 'Plant B grew the most',
    options: choices('Plant B grew the most', ['Plant A grew the most', 'All plants grew equally', 'Plant C did not grow', 'No comparison is possible'], random), skill: 'using measurement data',
    evidence: 'Six centimeters is greater than four centimeters and two centimeters.', explanation: 'The measurements support the claim that Plant B grew the most.',
  }),
];

export const generateElementaryScienceQuestion = (level: ElementaryScienceLevel, step: number): EarlyScienceQuestion => {
  const random = createSeededRandom(getDailySeed(`elementary-science-grade-${level}`, step));
  const factories = level === 3 ? firstGradeFactories(random) : secondGradeFactories(random);
  const question = factories[Math.floor(random() * factories.length)]();
  return {
    ...question,
    id: `elementary-science-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    phase: PHASES[step % PHASES.length],
  };
};
