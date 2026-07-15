import { createSeededRandom, getDailySeed } from '../dailyRotation';

export type EarlyScienceVisual = 'senses' | 'living' | 'plant' | 'animal' | 'weather' | 'sky' | 'force' | 'water' | 'habitat' | 'sunlight' | 'shade' | 'pattern';

export interface EarlyScienceQuestion {
  id: string;
  phase: string;
  title: string;
  prompt: string;
  observation: string;
  visual: EarlyScienceVisual;
  answer: string;
  options: string[];
  skill: string;
  evidence: string;
  explanation: string;
}

const PHASES = ['Observe', 'Predict', 'Compare', 'Test an idea', 'Use evidence', 'Explain'];

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const options = (answer: string, distractors: string[], random: () => number) => (
  shuffle([answer, ...distractors.filter(item => item !== answer).slice(0, 3)], random)
);

const pick = <T,>(items: T[], random: () => number) => items[Math.floor(random() * items.length)];
type QuestionFactory = (random: () => number) => Omit<EarlyScienceQuestion, 'id' | 'phase'>;

const preKFactories: QuestionFactory[] = [
  random => {
    const item = pick([
      { object: 'ringing bell', sense: 'Hearing', evidence: 'A bell makes a sound that ears can hear.' },
      { object: 'bright rainbow', sense: 'Sight', evidence: 'Eyes help us see the rainbow colors.' },
      { object: 'soft blanket', sense: 'Touch', evidence: 'Skin helps us feel that the blanket is soft.' },
      { object: 'flower scent', sense: 'Smell', evidence: 'A nose can notice the flower scent.' },
    ], random);
    return {
      title: 'Sense Detective', prompt: `Which sense helps you observe a ${item.object}?`, observation: item.object, visual: 'senses', answer: item.sense,
      options: options(item.sense, ['Sight', 'Hearing', 'Touch', 'Smell'].filter(sense => sense !== item.sense), random), skill: 'using the senses',
      evidence: item.evidence, explanation: `${item.sense} is the best sense for this observation. ${item.evidence}`,
    };
  },
  random => {
    const item = pick([
      { name: 'puppy', answer: 'Living', clue: 'It eats, grows, and breathes.' },
      { name: 'sunflower', answer: 'Living', clue: 'It grows and needs water.' },
      { name: 'rock', answer: 'Nonliving', clue: 'It does not eat, grow, or breathe.' },
      { name: 'toy truck', answer: 'Nonliving', clue: 'It only moves when someone moves it.' },
    ], random);
    return {
      title: 'Living or Nonliving', prompt: `How should a scientist sort the ${item.name}?`, observation: `${item.name}: ${item.clue}`, visual: 'living', answer: item.answer,
      options: options(item.answer, ['Living', 'Nonliving', 'Weather', 'A season'], random), skill: 'living and nonliving things',
      evidence: item.clue, explanation: `The ${item.name} is ${item.answer.toLowerCase()}. ${item.clue}`,
    };
  },
  random => {
    const missing = pick(['Water', 'Sunlight', 'Air'], random);
    return {
      title: 'Help the Seedling', prompt: `A seedling has soil but no ${missing.toLowerCase()}. What should it receive?`, observation: `soil + seedling - ${missing.toLowerCase()}`, visual: 'plant', answer: missing,
      options: options(missing, ['Water', 'Sunlight', 'Air', 'A toy'].filter(item => item !== missing), random), skill: 'plant needs',
      evidence: `Healthy plants need ${missing.toLowerCase()} as they grow.`, explanation: `${missing} helps a plant live and grow. Plants also need water, light, air, and room to grow.`,
    };
  },
  random => {
    const animal = pick([
      { name: 'bird', need: 'A safe nest', clue: 'The nest gives the bird shelter.' },
      { name: 'rabbit', need: 'Food and water', clue: 'Animals need food and water to live.' },
      { name: 'fish', need: 'Clean water', clue: 'A fish lives and breathes in water.' },
    ], random);
    return {
      title: 'Animal Needs', prompt: `What does the ${animal.name} need to live?`, observation: `${animal.name} looking for a safe place`, visual: 'animal', answer: animal.need,
      options: options(animal.need, ['A safe nest', 'Food and water', 'Clean water', 'A painted toy'].filter(item => item !== animal.need), random), skill: 'animal needs',
      evidence: animal.clue, explanation: `${animal.need} meets an important need for the ${animal.name}. ${animal.clue}`,
    };
  },
  random => {
    const weather = pick([
      { clue: 'Dark clouds and drops fall from the sky.', answer: 'Rainy' },
      { clue: 'Tree branches bend and leaves blow.', answer: 'Windy' },
      { clue: 'The sky is bright with very few clouds.', answer: 'Sunny' },
      { clue: 'The sky is covered by gray clouds.', answer: 'Cloudy' },
    ], random);
    return {
      title: 'Weather Watch', prompt: 'Which weather word matches the observation?', observation: weather.clue, visual: 'weather', answer: weather.answer,
      options: options(weather.answer, ['Rainy', 'Windy', 'Sunny', 'Cloudy'].filter(item => item !== weather.answer), random), skill: 'weather observations',
      evidence: weather.clue, explanation: `${weather.answer} matches the evidence: ${weather.clue}`,
    };
  },
  random => {
    const sky = pick([
      { clue: 'The sun is bright and children are at the playground.', answer: 'Daytime' },
      { clue: 'The sky is dark and many stars are visible.', answer: 'Nighttime' },
    ], random);
    return {
      title: 'Day and Night Sky', prompt: 'When would a scientist make this sky observation?', observation: sky.clue, visual: 'sky', answer: sky.answer,
      options: options(sky.answer, ['Daytime', 'Nighttime', 'Snack time', 'Story time'].filter(item => item !== sky.answer), random), skill: 'day and night patterns',
      evidence: sky.clue, explanation: `${sky.answer} fits the sky evidence. The view changes as Earth turns.`,
    };
  },
  random => {
    const action = pick([
      { clue: 'A child moves a toy car away with one hand.', answer: 'Push' },
      { clue: 'A child brings a wagon closer using its handle.', answer: 'Pull' },
    ], random);
    return {
      title: 'Push or Pull', prompt: 'Which force is the child using?', observation: action.clue, visual: 'force', answer: action.answer,
      options: options(action.answer, ['Push', 'Pull', 'Melt', 'Float'].filter(item => item !== action.answer), random), skill: 'pushes and pulls',
      evidence: action.clue, explanation: `${action.answer} describes the force. A push moves an object away, while a pull brings it closer.`,
    };
  },
  random => {
    const item = pick([
      { object: 'dry leaf', answer: 'Float', clue: 'The leaf stays on top of the water.' },
      { object: 'metal key', answer: 'Sink', clue: 'The key moves to the bottom of the cup.' },
      { object: 'wooden craft stick', answer: 'Float', clue: 'The stick stays at the surface.' },
      { object: 'small stone', answer: 'Sink', clue: 'The stone rests at the bottom.' },
    ], random);
    return {
      title: 'Water Test', prompt: `What happens when the ${item.object} is placed in water?`, observation: item.clue, visual: 'water', answer: item.answer,
      options: options(item.answer, ['Float', 'Sink', 'Grow', 'Glow'].filter(option => option !== item.answer), random), skill: 'sink and float observations',
      evidence: item.clue, explanation: `The ${item.object} will ${item.answer.toLowerCase()}. ${item.clue}`,
    };
  },
];

const kindergartenFactories: QuestionFactory[] = [
  random => {
    const trial = pick([
      { clue: 'Car A gets a gentle push. Car B gets a stronger push.', answer: 'Car B travels farther.' },
      { clue: 'Ball A gets a short push. Ball B gets no push.', answer: 'Ball A starts moving.' },
    ], random);
    return {
      title: 'Force Test', prompt: 'What result should the class predict?', observation: trial.clue, visual: 'force', answer: trial.answer,
      options: options(trial.answer, ['Car B travels farther.', 'Ball A starts moving.', 'Both objects disappear.', 'The objects turn into water.'].filter(item => item !== trial.answer), random), skill: 'effects of pushes and pulls',
      evidence: 'A push can start motion, and a stronger push can cause a larger change.', explanation: `${trial.answer} Pushes can change an object’s speed or distance.`,
    };
  },
  random => ({
    title: 'Change Direction', prompt: 'A rolling ball is tapped from the side. What can happen?', observation: 'The ball rolls forward, then receives a sideways tap.', visual: 'force', answer: 'The ball changes direction.',
    options: options('The ball changes direction.', ['The ball becomes a plant.', 'The ball makes its own light.', 'The ball turns into a cloud.'], random), skill: 'force and direction',
    evidence: 'A force from the side can change where a moving object goes.', explanation: 'The ball changes direction because the sideways tap is a force.',
  }),
  random => ({
    title: 'Plant Investigation', prompt: 'Two plants get water. Only Plant A gets sunlight. Which plant is more likely to grow well?', observation: 'Plant A: water + light. Plant B: water + dark box.', visual: 'plant', answer: 'Plant A',
    options: options('Plant A', ['Plant B', 'Both grow without light forever', 'Neither plant needs water'], random), skill: 'plant needs investigation',
    evidence: 'Plants need light and water to live and grow.', explanation: 'Plant A has both water and light, so it has the resources needed for healthy growth.',
  }),
  random => {
    const animal = pick([
      { name: 'frog', home: 'A pond with water and plants' },
      { name: 'polar bear', home: 'A cold place with ice and food' },
      { name: 'squirrel', home: 'A woodland with trees and seeds' },
      { name: 'camel', home: 'A dry desert with scarce water' },
    ], random);
    return {
      title: 'Habitat Match', prompt: `Which habitat best meets the needs of a ${animal.name}?`, observation: `${animal.name}: needs food, water, shelter, and space`, visual: 'habitat', answer: animal.home,
      options: options(animal.home, ['A pond with water and plants', 'A cold place with ice and food', 'A woodland with trees and seeds', 'A dry desert with scarce water'].filter(home => home !== animal.home), random), skill: 'animal habitats and needs',
      evidence: `The ${animal.name}'s body and needs fit ${animal.home.toLowerCase()}.`, explanation: `${animal.home} provides resources the ${animal.name} needs to survive.`,
    };
  },
  random => {
    const record = pick([
      { data: 'Morning: 48 degrees. Afternoon: 61 degrees.', answer: 'It became warmer.' },
      { data: 'Morning: calm. Afternoon: flags moved quickly.', answer: 'It became windier.' },
      { data: 'Morning: no rain. Afternoon: puddles formed.', answer: 'Rain fell later.' },
    ], random);
    return {
      title: 'Weather Data', prompt: 'What does the weather record show?', observation: record.data, visual: 'weather', answer: record.answer,
      options: options(record.answer, ['It became warmer.', 'It became windier.', 'Rain fell later.', 'The weather never changed.'].filter(item => item !== record.answer), random), skill: 'recording weather changes',
      evidence: record.data, explanation: `${record.answer} The two observations provide evidence of change.`,
    };
  },
  random => ({
    title: 'Weather Pattern', prompt: 'The class recorded rain on Monday, sun on Tuesday, and rain on Wednesday. What is true?', observation: 'Monday: rain | Tuesday: sun | Wednesday: rain', visual: 'pattern', answer: 'The weather changed across the days.',
    options: options('The weather changed across the days.', ['Every day was sunny.', 'Weather cannot be observed.', 'Wednesday came before Monday.'], random), skill: 'comparing weather across days',
    evidence: 'The symbols show two rainy days and one sunny day.', explanation: 'The weather changed across the days because the observations were not all the same.',
  }),
  random => ({
    title: 'Sunlight Test', prompt: 'One tile sits in sunlight and one tile sits in shade. Which tile will probably feel warmer?', observation: 'Tile A: direct sunlight. Tile B: under a cover.', visual: 'sunlight', answer: 'Tile A in sunlight',
    options: options('Tile A in sunlight', ['Tile B in shade', 'Both tiles become ice', 'Neither tile can change'], random), skill: 'sunlight and warmth',
    evidence: 'Sunlight transfers energy that can warm a surface.', explanation: 'Tile A in sunlight will probably feel warmer because sunlight can warm materials.',
  }),
  random => ({
    title: 'Design Some Shade', prompt: 'Which design will keep a toy animal coolest in bright sunlight?', observation: 'Choose a structure that blocks light from reaching the toy.', visual: 'shade', answer: 'A wide roof above the toy',
    options: options('A wide roof above the toy', ['A clear sheet under the toy', 'A tiny stick beside the toy', 'A lamp pointed at the toy'], random), skill: 'designing shade',
    evidence: 'A wide roof blocks more direct sunlight and creates shade.', explanation: 'A wide roof above the toy reduces the sunlight reaching it, so the toy stays cooler.',
  }),
];

export const generateEarlyScienceQuestion = (level: 1 | 2, step: number): EarlyScienceQuestion => {
  const random = createSeededRandom(getDailySeed(`early-science-grade-${level}`, step));
  const factories = level === 1 ? preKFactories : kindergartenFactories;
  const question = factories[step % factories.length](random);
  return {
    ...question,
    id: `early-science-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    phase: PHASES[step % PHASES.length],
  };
};
