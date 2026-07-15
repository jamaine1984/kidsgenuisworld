import { MathProblem } from '../../types';
import { createSeededRandom, getDailySeed } from '../dailyRotation';

const COLORS = ['red', 'blue', 'yellow', 'green'];
const SHAPES = ['circle', 'square', 'triangle', 'rectangle'] as const;
const SOLIDS = ['sphere', 'cube', 'cone', 'cylinder'] as const;

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const numericOptions = (answer: number, maximum: number, random: () => number): number[] => {
  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    choices.add(Math.max(0, Math.min(maximum, answer + Math.floor(random() * 7) - 3)));
  }
  return shuffle([...choices], random);
};

const wordOptions = (answer: string, pool: string[], random: () => number): string[] => (
  shuffle([answer, ...shuffle(pool.filter(item => item !== answer), random).slice(0, 3)], random)
);

const preKFactories = (random: () => number): Array<() => MathProblem> => [
  () => {
    const count = Math.floor(random() * 6);
    return {
      question: 'How many counters do you see?',
      answer: count,
      options: numericOptions(count, 10, random),
      operation: 'counting', context: 'counting', difficulty: 1, skill: 'one-to-one counting to 5',
      explanation: `Touch each counter once. There are ${count} counters.`,
      visualModel: { kind: 'counters', leftCount: count, color: COLORS[Math.floor(random() * COLORS.length)] },
    };
  },
  () => {
    const count = Math.floor(random() * 6);
    return {
      question: `Which number matches a group of ${count}?`,
      answer: count,
      options: numericOptions(count, 10, random),
      operation: 'counting', context: 'counting', difficulty: 1, skill: 'numeral and quantity matching',
      explanation: `The numeral ${count} tells how many are in the group.`,
      visualModel: { kind: 'counters', leftCount: count, color: 'blue' },
    };
  },
  () => {
    const leftCount = Math.floor(random() * 5) + 1;
    const relation = random() > 0.33 ? (random() > 0.5 ? 1 : -1) : 0;
    const rightCount = Math.max(1, Math.min(5, leftCount + relation));
    const answer = leftCount === rightCount ? 'same' : leftCount > rightCount ? 'left group' : 'right group';
    return {
      question: 'Which group has more counters?',
      answer,
      options: wordOptions(answer, ['left group', 'right group', 'same', 'cannot tell'], random),
      operation: 'comparison', context: 'comparison', difficulty: 1, skill: 'compare quantities to 5',
      explanation: leftCount === rightCount
        ? `Both groups have ${leftCount}, so they are the same.`
        : `${answer === 'left group' ? 'The left group' : 'The right group'} has more when we match or count each counter.`,
      visualModel: { kind: 'compare-groups', leftCount, rightCount, color: 'teal', secondaryColor: 'violet' },
    };
  },
  () => {
    const color = COLORS[Math.floor(random() * COLORS.length)];
    return {
      question: 'What color are the counters?',
      answer: color,
      options: wordOptions(color, COLORS, random),
      operation: 'classification', context: 'classification', difficulty: 1, skill: 'color recognition',
      explanation: `The counters are ${color}. Color is one way to describe and sort objects.`,
      visualModel: { kind: 'color-set', leftCount: Math.floor(random() * 3) + 3, color },
    };
  },
  () => {
    const shape = SHAPES[Math.floor(random() * SHAPES.length)];
    return {
      question: 'What shape do you see?',
      answer: shape,
      options: wordOptions(shape, [...SHAPES], random),
      operation: 'classification', context: 'geometry', difficulty: 1, skill: 'basic shape recognition',
      explanation: `This is a ${shape}. Look at its straight or curved sides.`,
      visualModel: { kind: 'shape', shape, color: COLORS[Math.floor(random() * COLORS.length)] },
    };
  },
  () => {
    const first = COLORS[Math.floor(random() * COLORS.length)];
    const secondPool = COLORS.filter(color => color !== first);
    const second = secondPool[Math.floor(random() * secondPool.length)];
    const answer = random() > 0.5 ? first : second;
    return {
      question: `${first}, ${second}, ${first}, ${second}. What comes next?`,
      answer: first,
      options: wordOptions(first, COLORS, random),
      operation: 'pattern', context: 'pattern', difficulty: 1, skill: 'AB patterns',
      explanation: `The pattern repeats ${first}, ${second}. The next color is ${first}.`,
      visualModel: { kind: 'pattern', items: [first, second, first, second, '?'] },
    };
  },
  () => {
    const relations = ['above', 'below', 'inside', 'beside'] as const;
    const relation = relations[Math.floor(random() * relations.length)];
    return {
      question: 'Where is the small blue circle compared with the large square?',
      answer: relation,
      options: wordOptions(relation, [...relations], random),
      operation: 'spatial', context: 'spatial', difficulty: 1, skill: 'position words',
      explanation: `The blue circle is ${relation} the square.`,
      visualModel: { kind: 'position', relation },
    };
  },
  () => {
    const start = Math.floor(random() * 5);
    const answer = start + 1;
    return {
      question: `What number is one more than ${start}?`,
      answer,
      options: numericOptions(answer, 10, random),
      operation: 'addition', context: 'counting', difficulty: 1, skill: 'one more within 5',
      explanation: `Count one step after ${start}. One more is ${answer}.`,
      visualModel: { kind: 'number-path', start, end: answer },
    };
  },
  () => {
    const start = Math.floor(random() * 5) + 1;
    const answer = start - 1;
    return {
      question: `What number is one less than ${start}?`,
      answer,
      options: numericOptions(answer, 10, random),
      operation: 'subtraction', context: 'counting', difficulty: 1, skill: 'one less within 5',
      explanation: `Count one step back from ${start}. One less is ${answer}.`,
      visualModel: { kind: 'number-path', start, end: answer },
    };
  },
  () => {
    const first = Math.floor(random() * 4) + 1;
    const second = Math.floor(random() * (6 - first));
    const answer = first + second;
    return {
      question: `${first} counters and ${second} more counters make how many?`,
      answer,
      options: numericOptions(answer, 10, random),
      operation: 'addition', context: 'word-problem', difficulty: 1, skill: 'combine groups within 5',
      explanation: `Count ${first}, then count ${second} more. There are ${answer} altogether.`,
      visualModel: { kind: 'compare-groups', leftCount: first, rightCount: second, color: 'sky', secondaryColor: 'amber' },
    };
  },
];

const kindergartenFactories = (random: () => number): Array<() => MathProblem> => [
  () => {
    const count = Math.floor(random() * 21);
    return {
      question: 'Count the counters. How many are there?',
      answer: count,
      options: numericOptions(count, 20, random),
      operation: 'counting', context: 'counting', difficulty: 2, skill: 'count quantities to 20',
      explanation: `Count each counter once. The last number said is ${count}.`,
      visualModel: { kind: 'counters', leftCount: count, color: COLORS[Math.floor(random() * COLORS.length)] },
    };
  },
  () => {
    const start = Math.floor(random() * 16);
    const answer = start + Math.floor(random() * Math.min(4, 20 - start)) + 1;
    return {
      question: `Start at ${start} and count forward to the highlighted number. Where do you stop?`,
      answer,
      options: numericOptions(answer, 20, random),
      operation: 'counting', context: 'counting', difficulty: 2, skill: 'count forward from a given number',
      explanation: `Start at ${start} instead of going back to one. Count forward until ${answer}.`,
      visualModel: { kind: 'number-path', start, end: answer },
    };
  },
  () => {
    const leftCount = Math.floor(random() * 10) + 1;
    const rightCount = Math.floor(random() * 10) + 1;
    const answer = leftCount === rightCount ? 'same' : leftCount > rightCount ? 'left group' : 'right group';
    return {
      question: 'Which group has more?',
      answer,
      options: wordOptions(answer, ['left group', 'right group', 'same', 'both have zero'], random),
      operation: 'comparison', context: 'comparison', difficulty: 2, skill: 'compare quantities to 10',
      explanation: leftCount === rightCount
        ? `Both groups have ${leftCount}, so the quantities are equal.`
        : `Count or match the groups. The ${answer} has the greater quantity.`,
      visualModel: { kind: 'compare-groups', leftCount, rightCount, color: 'teal', secondaryColor: 'violet' },
    };
  },
  () => {
    const first = Math.floor(random() * 10);
    const second = Math.floor(random() * (11 - first));
    const answer = first + second;
    return {
      question: `${first} + ${second} = ?`,
      answer,
      options: numericOptions(answer, 10, random),
      operation: 'addition', context: 'equation', difficulty: 2, skill: 'addition within 10',
      explanation: `Join ${first} and ${second}. Count all to get ${answer}.`,
      visualModel: { kind: 'compare-groups', leftCount: first, rightCount: second, color: 'sky', secondaryColor: 'amber' },
    };
  },
  () => {
    const first = Math.floor(random() * 10) + 1;
    const second = Math.floor(random() * (first + 1));
    const answer = first - second;
    return {
      question: `${first} - ${second} = ?`,
      answer,
      options: numericOptions(answer, 10, random),
      operation: 'subtraction', context: 'equation', difficulty: 2, skill: 'subtraction within 10',
      explanation: `Start with ${first}, take away ${second}, and count ${answer} left.`,
      visualModel: { kind: 'counters', leftCount: first, rightCount: second, color: 'rose' },
    };
  },
  () => {
    const known = Math.floor(random() * 10);
    const answer = 10 - known;
    return {
      question: `${known} and what number make 10?`,
      answer,
      options: numericOptions(answer, 10, random),
      operation: 'addition', context: 'equation', difficulty: 2, skill: 'compose 10',
      explanation: `Count from ${known} to 10. It takes ${answer} more.`,
      visualModel: { kind: 'number-path', start: known, end: 10 },
    };
  },
  () => {
    const shape = random() > 0.6
      ? SOLIDS[Math.floor(random() * SOLIDS.length)]
      : SHAPES[Math.floor(random() * SHAPES.length)];
    return {
      question: 'What shape do you see?',
      answer: shape,
      options: wordOptions(shape, [...SHAPES, ...SOLIDS], random),
      operation: 'classification', context: 'geometry', difficulty: 2, skill: shape === 'circle' || shape === 'square' || shape === 'triangle' || shape === 'rectangle' ? '2D shapes' : '3D shapes',
      explanation: `This shape is a ${shape}. Name the features you notice.`,
      visualModel: { kind: 'shape', shape, color: COLORS[Math.floor(random() * COLORS.length)] },
    };
  },
  () => {
    const tens = 1;
    const ones = Math.floor(random() * 10);
    const answer = tens * 10 + ones;
    return {
      question: `One ten and ${ones} ones make what number?`,
      answer,
      options: numericOptions(answer, 20, random),
      operation: 'counting', context: 'counting', difficulty: 2, skill: 'teen numbers as ten and ones',
      explanation: `One ten is 10. Add ${ones} ones to make ${answer}.`,
      visualModel: { kind: 'counters', leftCount: answer, color: 'blue' },
    };
  },
];

export const generateEarlyMathProblem = (level: 1 | 2, step: number): MathProblem => {
  const random = createSeededRandom(getDailySeed(`early-math-grade-${level}`, step));
  const factories = level === 1 ? preKFactories(random) : kindergartenFactories(random);
  const problem = factories[Math.floor(random() * factories.length)]();
  const lessonPhases = [
    'Warm-up',
    'Teacher model',
    'Try together',
    'Try with less help',
    'Spiral review',
    'Exit ticket',
  ];
  return {
    ...problem,
    question: `${lessonPhases[step % lessonPhases.length]}: ${problem.question}`,
  };
};
