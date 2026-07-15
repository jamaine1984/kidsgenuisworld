import { createSeededRandom, getDailySeed } from '../dailyRotation';

export type PuzzleToken = 'star' | 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'fish' | 'flower' | 'rocket' | 'gift' | '?' | 'small-circle' | 'large-circle';
export type EarlyPuzzleVisual = 'match' | 'pattern' | 'shape' | 'size' | 'sort' | 'odd-one-out' | 'position' | 'memory' | 'logic';

export interface EarlyPuzzleQuestion {
  id: string;
  phase: string;
  title: string;
  prompt: string;
  visual: EarlyPuzzleVisual;
  clueItems: string[];
  clueText: string;
  answer: string;
  options: string[];
  skill: string;
  explanation: string;
}

const PHASES = ['Look carefully', 'Name the rule', 'Compare', 'Remember', 'Try a strategy', 'Explain'];
const TOKENS: PuzzleToken[] = ['star', 'circle', 'square', 'triangle', 'diamond', 'hexagon', 'fish', 'flower', 'rocket', 'gift'];
const SHAPES: PuzzleToken[] = ['circle', 'square', 'triangle', 'diamond', 'hexagon'];
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
const label = (token: string) => token.replace('-', ' ').replace(/^\w/, letter => letter.toUpperCase());
type Factory = (random: () => number) => Omit<EarlyPuzzleQuestion, 'id' | 'phase'>;

const preKFactories: Factory[] = [
  random => {
    const target = pick(TOKENS, random);
    return { title: 'Find the Match', prompt: 'Which choice matches the target exactly?', visual: 'match', clueItems: [target], clueText: 'Same picture, same shape', answer: target, options: options(target, TOKENS.filter(item => item !== target), random), skill: 'visual matching', explanation: `${label(target)} matches the target in shape and picture.` };
  },
  random => {
    const pair = shuffle(SHAPES, random).slice(0, 2);
    return { title: 'AB Pattern', prompt: 'What comes next in the repeating pattern?', visual: 'pattern', clueItems: [pair[0], pair[1], pair[0], pair[1], '?'], clueText: `${label(pair[0])}, ${label(pair[1])}, repeat`, answer: pair[0], options: options(pair[0], TOKENS.filter(item => item !== pair[0]), random), skill: 'continuing an AB pattern', explanation: `The rule repeats ${label(pair[0])}, ${label(pair[1])}. ${label(pair[0])} comes next.` };
  },
  random => {
    const target = pick(SHAPES, random);
    return { title: 'Name the Shape', prompt: 'What is the name of this shape?', visual: 'shape', clueItems: [target], clueText: 'Look at the outline and corners', answer: label(target), options: options(label(target), SHAPES.filter(item => item !== target).map(label), random), skill: 'recognizing basic shapes', explanation: `The shape is a ${target}. Its outline and corners help identify it.` };
  },
  random => ({ title: 'Compare Size', prompt: 'Which circle is larger?', visual: 'size', clueItems: ['small-circle', 'large-circle'], clueText: 'Compare how much space each circle fills', answer: 'The second circle', options: options('The second circle', ['The first circle', 'They are the same size', 'There are no circles'], random), skill: 'comparing size', explanation: 'The second circle fills more space, so it is larger.' }),
  random => ({ title: 'Sort the Group', prompt: 'Which group contains only shapes?', visual: 'sort', clueItems: ['circle', 'square', 'triangle'], clueText: 'Find what all items have in common', answer: 'Circle, square, triangle', options: options('Circle, square, triangle', ['Fish, flower, gift', 'Rocket, fish, star', 'Gift, circle, fish'], random), skill: 'sorting by category', explanation: 'Circle, square, and triangle are all shapes, so they belong in one group.' }),
  random => ({ title: 'Odd One Out', prompt: 'Which picture does not belong with the shapes?', visual: 'odd-one-out', clueItems: ['circle', 'square', 'fish', 'triangle'], clueText: 'Three are shapes and one is an animal', answer: 'fish', options: options('fish', ['circle', 'square', 'triangle'], random), skill: 'finding an item that does not belong', explanation: 'Fish does not belong because it is an animal. The other pictures are shapes.' }),
  random => ({ title: 'Where Is the Star?', prompt: 'The star is above the square. Which position word tells where the star is?', visual: 'position', clueItems: ['star', 'square'], clueText: 'STAR above SQUARE', answer: 'Above', options: options('Above', ['Below', 'Inside', 'Behind'], random), skill: 'spatial position words', explanation: 'Above means the star is higher than the square.' }),
  random => {
    const sequence = shuffle(['rocket', 'gift', 'flower', 'fish'] as PuzzleToken[], random);
    return { title: 'Remember the Middle', prompt: 'Which picture was second in the row?', visual: 'memory', clueItems: sequence, clueText: 'Look left to right and remember the order', answer: sequence[1], options: options(sequence[1], sequence.filter(item => item !== sequence[1]), random), skill: 'remembering visual order', explanation: `${label(sequence[1])} was the second picture when reading the row from left to right.` };
  },
];

const kindergartenFactories: Factory[] = [
  random => {
    const pair = shuffle(SHAPES, random).slice(0, 2);
    return { title: 'AAB Pattern', prompt: 'What comes next in this pattern?', visual: 'pattern', clueItems: [pair[0], pair[0], pair[1], pair[0], pair[0], '?'], clueText: `${label(pair[0])}, ${label(pair[0])}, ${label(pair[1])}`, answer: pair[1], options: options(pair[1], TOKENS.filter(item => item !== pair[1]), random), skill: 'continuing an AAB pattern', explanation: `The unit is ${label(pair[0])}, ${label(pair[0])}, ${label(pair[1])}, so ${label(pair[1])} completes it.` };
  },
  random => {
    const trio = shuffle(SHAPES, random).slice(0, 3);
    return { title: 'ABC Pattern', prompt: 'Which picture comes next?', visual: 'pattern', clueItems: [...trio, ...trio.slice(0, 2), '?'], clueText: trio.map(label).join(', '), answer: trio[2], options: options(trio[2], TOKENS.filter(item => item !== trio[2]), random), skill: 'continuing an ABC pattern', explanation: `The three-part rule repeats ${trio.map(label).join(', ')}. ${label(trio[2])} comes next.` };
  },
  random => {
    const shape = pick([{ token: 'triangle' as PuzzleToken, sides: '3' }, { token: 'square' as PuzzleToken, sides: '4' }, { token: 'hexagon' as PuzzleToken, sides: '6' }], random);
    return { title: 'Count the Sides', prompt: `How many straight sides does this ${shape.token} have?`, visual: 'shape', clueItems: [shape.token], clueText: 'Trace every side once', answer: shape.sides, options: options(shape.sides, ['2', '3', '4', '6'].filter(item => item !== shape.sides), random), skill: 'describing shape attributes', explanation: `A ${shape.token} has ${shape.sides} straight sides.` };
  },
  random => ({ title: 'Sort by a Rule', prompt: 'Which rule correctly describes this group?', visual: 'sort', clueItems: ['triangle', 'square', 'hexagon'], clueText: 'Triangle, square, hexagon', answer: 'Shapes with straight sides', options: options('Shapes with straight sides', ['Animals that swim', 'Things used for gifts', 'Shapes with no sides'], random), skill: 'explaining a sorting rule', explanation: 'Each item is a shape made with straight sides, so that rule fits every item.' }),
  random => ({ title: 'Follow the Position Clue', prompt: 'The gift is left of the rocket. Which picture should be first in the row?', visual: 'position', clueItems: ['gift', 'rocket'], clueText: 'GIFT is left of ROCKET', answer: 'gift', options: options('gift', ['rocket', 'flower', 'fish'], random), skill: 'left and right position', explanation: 'Left means the gift appears before the rocket when the row is read left to right.' }),
  random => {
    const sequence = shuffle(['star', 'diamond', 'gift', 'rocket'] as PuzzleToken[], random);
    return { title: 'Visual Memory', prompt: 'Which picture was immediately before the last picture?', visual: 'memory', clueItems: sequence, clueText: 'Remember all four positions', answer: sequence[2], options: options(sequence[2], sequence.filter(item => item !== sequence[2]), random), skill: 'working memory for position', explanation: `${label(sequence[2])} was in the third position, immediately before the last picture.` };
  },
  random => ({ title: 'Growing Pattern', prompt: 'What should come next: small circle, large circle, small circle, large circle?', visual: 'logic', clueItems: ['small-circle', 'large-circle', 'small-circle', 'large-circle', '?'], clueText: 'Size alternates small, large', answer: 'small-circle', options: options('small-circle', ['large-circle', 'square', 'fish'], random), skill: 'tracking a changing attribute', explanation: 'The size alternates small, large. A small circle comes next.' }),
  random => ({ title: 'Category Logic', prompt: 'Which picture does not belong in the group?', visual: 'odd-one-out', clueItems: ['fish', 'flower', 'rocket', 'gift'], clueText: 'Three are objects or plants; one is a vehicle', answer: 'rocket', options: options('rocket', ['fish', 'flower', 'gift'], random), skill: 'explaining category differences', explanation: 'Rocket is a vehicle. The other pictures are not vehicles, so rocket is the odd one out.' }),
];

export const generateEarlyPuzzleQuestion = (level: 1 | 2, step: number): EarlyPuzzleQuestion => {
  const random = createSeededRandom(getDailySeed(`early-puzzle-grade-${level}`, step));
  const factories = level === 1 ? preKFactories : kindergartenFactories;
  const question = factories[step % factories.length](random);
  return { ...question, id: `early-puzzle-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`, phase: PHASES[step % PHASES.length] };
};
