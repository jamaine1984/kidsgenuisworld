import { createSeededRandom, getDailySeed } from '../dailyRotation';
import { EarlyWorldQuestion } from './earlyWorld';

export type ElementaryWorldLevel = 3 | 4;

const PHASES = ['Start with me', 'Read the place', 'Follow the map', 'Compare communities', 'Connect people and places', 'World Studies check'];

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

type QuestionSeed = Omit<EarlyWorldQuestion, 'id' | 'phase'>;

const firstGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => ({
    title: 'Map Key Detective', prompt: 'The map key says a blue line means river. What does the blue line crossing town show?', mapClue: 'KEY: blue line = river | MAP: blue line through town', visual: 'map-symbol', answer: 'A river',
    options: choices('A river', ['A road', 'A school', 'A mountain', 'A border'], random), skill: 'using map keys', explanation: 'The map key directly connects the blue line symbol to a river.',
  }),
  () => ({
    title: 'Cardinal Direction Route', prompt: 'The park is north of the library. Which direction should you travel from the library?', mapClue: 'PARK N ↑ | LIBRARY', visual: 'directions', answer: 'North',
    options: choices('North', ['South', 'East', 'West', 'Downstairs'], random), skill: 'cardinal directions', explanation: 'North is toward the top of a north-up map, where the park is shown.',
  }),
  () => ({
    title: 'Continents and Oceans', prompt: 'Which kind of feature is the Pacific?', mapClue: 'A very large body of salt water between continents', visual: 'land-water', answer: 'Ocean',
    options: choices('Ocean', ['Continent', 'Country', 'City', 'Mountain'], random), skill: 'continents and oceans', explanation: 'The Pacific is an ocean, a huge body of salt water between continents.',
  }),
  () => ({
    title: 'Landform Match', prompt: 'Which landform is high land with steep sides and a peak?', mapClue: 'high + steep sides + peak', visual: 'land-water', answer: 'Mountain',
    options: choices('Mountain', ['Plain', 'Island', 'River', 'Valley'], random), skill: 'physical landforms', explanation: 'A mountain is high land that usually has steep sides and a peak.',
  }),
  () => ({
    title: 'Address and Location', prompt: 'Why does a street address help a mail carrier?', mapClue: '24 Oak Street → one exact building', visual: 'neighborhood', answer: 'It identifies an exact location',
    options: choices('It identifies an exact location', ['It predicts tomorrow’s weather', 'It changes the road direction', 'It names every person inside', 'It measures a mountain'], random), skill: 'addresses and absolute location', explanation: 'A street address identifies a specific building so people and deliveries can find it.',
  }),
  () => ({
    title: 'Community Roles', prompt: 'Which local worker helps create and enforce community safety rules?', mapClue: 'community need: safe roads and shared rules', visual: 'community', answer: 'Local government leaders',
    options: choices('Local government leaders', ['Only grocery shoppers', 'Visiting tourists', 'Sports fans', 'Pet owners'], random), skill: 'community government roles', explanation: 'Local government leaders help make decisions and support rules and services for the community.',
  }),
  () => ({
    title: 'Goods or Services', prompt: 'A baker sells a loaf of bread. Is the bread a good or a service?', mapClue: 'bread can be made, bought, and carried home', visual: 'resources', answer: 'A good',
    options: choices('A good', ['A service', 'A law', 'A direction', 'A tradition'], random), skill: 'goods and services', explanation: 'Bread is a good because it is a physical product people can buy and use.',
  }),
  () => ({
    title: 'Needs and Wants', prompt: 'Which choice is a basic need?', mapClue: 'food | toy robot | game | sticker', visual: 'resources', answer: 'Food',
    options: choices('Food', ['Toy robot', 'Video game', 'Sticker', 'Party hat'], random), skill: 'needs and wants', explanation: 'Food is a need because people require it to live. The other choices are wants.',
  }),
  () => ({
    title: 'Rules and Reasons', prompt: 'Why does a school have a walk-in-the-hall rule?', mapClue: 'many students share the hallway', visual: 'school', answer: 'To help everyone move safely',
    options: choices('To help everyone move safely', ['To make classes longer', 'To stop every conversation', 'To change the weather', 'To remove all doors'], random), skill: 'purpose of rules', explanation: 'Walking helps prevent collisions when many people share the hallway.',
  }),
  () => ({
    title: 'Past and Present', prompt: 'Which object is evidence about school life long ago?', mapClue: 'an old classroom photograph dated 1920', visual: 'traditions', answer: 'The dated photograph',
    options: choices('The dated photograph', ['A guess with no source', 'Tomorrow’s lunch menu', 'A made-up rumor', 'A blank page'], random), skill: 'sources about the past', explanation: 'A dated photograph is a source that shows real details from an earlier time.',
  }),
  () => ({
    title: 'Traditions and Respect', prompt: 'Two families celebrate the same season with different foods. What is a respectful conclusion?', mapClue: 'Family A: soup | Family B: rice dish', visual: 'traditions', answer: 'Communities can have different meaningful traditions',
    options: choices('Communities can have different meaningful traditions', ['Only one family celebrates correctly', 'Every family must eat the same food', 'Traditions never have meaning', 'Different foods cannot be shared'], random), skill: 'cultural traditions', explanation: 'Different foods can represent meaningful family and community traditions.',
  }),
  () => ({
    title: 'People and Environment', prompt: 'A town near heavy winter snow builds steep roofs. Why?', mapClue: 'snowy climate → steep roofs', visual: 'weather', answer: 'Snow can slide off more easily',
    options: choices('Snow can slide off more easily', ['Roofs create the snow', 'Steep roofs stop all wind', 'The town has no weather', 'Every building must look identical'], random), skill: 'environment shapes communities', explanation: 'People adapt buildings to local conditions; steep roofs help shed heavy snow.',
  }),
];

const secondGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => ({
    title: 'Map Scale', prompt: 'A map scale says 1 inch equals 5 miles. Two towns are 3 inches apart. How far apart are they?', mapClue: '1 inch = 5 miles | map distance = 3 inches', visual: 'directions', answer: '15 miles',
    options: choices('15 miles', ['3 miles', '5 miles', '8 miles', '30 miles'], random), skill: 'using map scale', explanation: 'Three map inches represent three groups of five miles, or 15 miles.',
  }),
  () => ({
    title: 'Physical and Human Features', prompt: 'Which feature was built by people?', mapClue: 'river | bridge | mountain | lake', visual: 'land-water', answer: 'Bridge',
    options: choices('Bridge', ['River', 'Mountain', 'Lake', 'Valley'], random), skill: 'physical and human features', explanation: 'A bridge is a human-made feature. Rivers, mountains, lakes, and valleys form naturally.',
  }),
  () => ({
    title: 'Urban, Suburban, Rural', prompt: 'Which description best matches a rural community?', mapClue: 'farms + open land + homes spread apart', visual: 'community', answer: 'Farms and homes spread across open land',
    options: choices('Farms and homes spread across open land', ['Many tall buildings close together', 'A neighborhood outside a large city', 'Only boats with no land', 'One classroom inside a school'], random), skill: 'community types', explanation: 'Rural communities often have farms, open land, and buildings spread farther apart.',
  }),
  () => ({
    title: 'Regions', prompt: 'Why might several states be grouped into one region?', mapClue: 'shared climate, landforms, history, or economy', visual: 'map-symbol', answer: 'They share important characteristics',
    options: choices('They share important characteristics', ['They are all the same exact place', 'They have no borders', 'Every person has the same job', 'Regions only include islands'], random), skill: 'geographic regions', explanation: 'A region groups places that share characteristics such as climate, landforms, culture, or economic activity.',
  }),
  () => ({
    title: 'Why People Move', prompt: 'A family moves closer to a new job and relatives. What are these reasons called?', mapClue: 'job opportunity + family connection', visual: 'home', answer: 'Reasons for migration',
    options: choices('Reasons for migration', ['Map symbols', 'Weather instruments', 'Landforms', 'Classroom rules'], random), skill: 'human migration', explanation: 'Migration means moving from one place to another; jobs and family are common reasons people move.',
  }),
  () => ({
    title: 'Trade Connection', prompt: 'A farm sells apples to a city bakery and buys tools from a factory. What does this show?', mapClue: 'farm ↔ city bakery ↔ factory', visual: 'resources', answer: 'Communities depend on trade',
    options: choices('Communities depend on trade', ['Every place makes everything alone', 'Goods cannot move between places', 'Only farms use tools', 'Cities do not need food'], random), skill: 'trade and interdependence', explanation: 'Trade lets communities exchange goods and services they produce for things they need.',
  }),
  () => ({
    title: 'Local Government Service', prompt: 'Which service is usually supported by local government?', mapClue: 'shared town needs', visual: 'community', answer: 'Fire protection',
    options: choices('Fire protection', ['Choosing every family meal', 'Writing every child’s story', 'Selecting all clothing', 'Planning private birthday parties'], random), skill: 'local government services', explanation: 'Fire protection is a shared public service that helps keep the whole community safe.',
  }),
  () => ({
    title: 'Civic Responsibility', prompt: 'Which action shows responsible community participation?', mapClue: 'shared park has litter after an event', visual: 'community', answer: 'Join a supervised cleanup and sort recycling',
    options: choices('Join a supervised cleanup and sort recycling', ['Leave more litter', 'Damage park signs', 'Ignore every shared rule', 'Keep others from using the park'], random), skill: 'civic responsibility', explanation: 'Helping care for shared spaces is one way people contribute responsibly to a community.',
  }),
  () => ({
    title: 'Timeline Order', prompt: 'Which event belongs last on the timeline?', mapClue: '1900: school opens | 1950: new library | 2000: computer lab | 2025: solar panels', visual: 'traditions', answer: 'Solar panels added in 2025',
    options: choices('Solar panels added in 2025', ['School opens in 1900', 'Library opens in 1950', 'Computer lab opens in 2000', 'All events happen together'], random), skill: 'reading timelines', explanation: 'The latest year is 2025, so adding solar panels belongs last.',
  }),
  () => ({
    title: 'Primary Source', prompt: 'Which item is a primary source for learning about a 1940 school day?', mapClue: 'sources: student diary | modern textbook | recent cartoon | guess', visual: 'traditions', answer: 'A student diary written in 1940',
    options: choices('A student diary written in 1940', ['A textbook written today', 'A recent cartoon', 'A guess with no evidence', 'A blank worksheet'], random), skill: 'primary and secondary sources', explanation: 'A diary written by a student at that time is direct evidence from the historical period.',
  }),
  () => ({
    title: 'Compare Cultures Carefully', prompt: 'Students study homes in two climates. What is the best comparison?', mapClue: 'rainy place: raised floor | snowy place: steep roof', visual: 'traditions', answer: 'Both designs respond to local weather in different ways',
    options: choices('Both designs respond to local weather in different ways', ['One community is better than the other', 'Weather never affects homes', 'All homes must use one design', 'The designs have no purpose'], random), skill: 'cultural and environmental comparison', explanation: 'Both communities adapt homes to local conditions, though the specific solutions differ.',
  }),
  () => ({
    title: 'Resource Conservation', prompt: 'Which town plan best protects a limited water supply?', mapClue: 'dry season + low reservoir', visual: 'resources', answer: 'Repair leaks and use water carefully',
    options: choices('Repair leaks and use water carefully', ['Leave every faucet running', 'Pollute the reservoir', 'Remove all water rules', 'Use clean water to wash roads daily'], random), skill: 'resource conservation', explanation: 'Repairing leaks and reducing waste help conserve limited clean water for community needs.',
  }),
];

export const generateElementaryWorldQuestion = (level: ElementaryWorldLevel, step: number): EarlyWorldQuestion => {
  const random = createSeededRandom(getDailySeed(`elementary-world-grade-${level}`, step));
  const factories = level === 3 ? firstGradeFactories(random) : secondGradeFactories(random);
  const question = factories[Math.floor(random() * factories.length)]();
  return {
    ...question,
    id: `elementary-world-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    phase: PHASES[step % PHASES.length],
  };
};
