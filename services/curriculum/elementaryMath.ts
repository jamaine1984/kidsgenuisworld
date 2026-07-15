import { MathProblem } from '../../types';
import { createSeededRandom, getDailySeed } from '../dailyRotation';

export type ElementaryMathLevel = 3 | 4;

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const numberChoices = (answer: number, random: () => number, minimum = 0): number[] => {
  const offsets = shuffle([-10, -5, -3, -2, -1, 1, 2, 3, 5, 10], random);
  const choices = new Set<number>([answer]);
  for (const offset of offsets) {
    choices.add(Math.max(minimum, answer + offset));
    if (choices.size === 4) break;
  }
  return shuffle([...choices], random);
};

const wordChoices = (answer: string, distractors: string[], random: () => number): string[] => (
  shuffle([answer, ...shuffle([...new Set(distractors)].filter(item => item !== answer), random).slice(0, 3)], random)
);

const coinValue = { penny: 1, nickel: 5, dime: 10, quarter: 25 } as const;
type Coin = keyof typeof coinValue;

const firstGradeFactories = (random: () => number): Array<() => MathProblem> => [
  () => {
    const first = Math.floor(random() * 11) + 4;
    const second = Math.floor(random() * (21 - first));
    const answer = first + second;
    return {
      question: `${first} + ${second} = ?`, answer, options: numberChoices(answer, random),
      operation: 'addition', context: 'equation', difficulty: 3, skill: 'addition within 20',
      explanation: `Start with ${first} and count on ${second} more to reach ${answer}.`,
      visualModel: { kind: 'compare-groups', leftCount: first, rightCount: second, color: 'sky', secondaryColor: 'amber' },
    };
  },
  () => {
    const first = Math.floor(random() * 11) + 10;
    const second = Math.floor(random() * Math.min(10, first)) + 1;
    const answer = first - second;
    return {
      question: `${first} - ${second} = ?`, answer, options: numberChoices(answer, random),
      operation: 'subtraction', context: 'equation', difficulty: 3, skill: 'subtraction within 20',
      explanation: `Start at ${first} and count back ${second}. You land on ${answer}.`,
      visualModel: { kind: 'counters', leftCount: first, rightCount: second, color: 'rose' },
    };
  },
  () => {
    const total = Math.floor(random() * 8) + 12;
    const known = Math.floor(random() * (total - 5)) + 3;
    const answer = total - known;
    return {
      question: `${known} + ? = ${total}`, answer, options: numberChoices(answer, random),
      operation: 'addition', context: 'equation', difficulty: 3, skill: 'missing addends within 20',
      explanation: `Count from ${known} up to ${total}. The missing part is ${answer}.`,
      visualModel: { kind: 'number-path', start: known, end: total },
    };
  },
  () => {
    const tens = Math.floor(random() * 8) + 1;
    const ones = Math.floor(random() * 10);
    const answer = tens * 10 + ones;
    return {
      question: `${tens} tens and ${ones} ones make what number?`, answer, options: numberChoices(answer, random),
      operation: 'counting', context: 'counting', difficulty: 3, skill: 'place value to 99',
      explanation: `${tens} tens are ${tens * 10}. Add ${ones} ones to make ${answer}.`,
      visualModel: { kind: 'base-ten', tens, ones },
    };
  },
  () => {
    const left = Math.floor(random() * 70) + 20;
    const right = Math.max(10, Math.min(99, left + Math.floor(random() * 19) - 9));
    const answer = left === right ? '=' : left > right ? '>' : '<';
    return {
      question: `Which symbol makes ${left} __ ${right} true?`, answer,
      options: wordChoices(answer, ['>', '<', '=', '+'], random), operation: 'comparison', context: 'comparison', difficulty: 3,
      skill: 'compare two-digit numbers', explanation: `Compare the tens first. ${left} ${answer} ${right}.`,
      visualModel: { kind: 'measurement', leftLength: left, rightLength: right },
    };
  },
  () => {
    const step = [2, 5, 10][Math.floor(random() * 3)];
    const start = step * (Math.floor(random() * 4) + 1);
    const answer = start + step * 3;
    return {
      question: `${start}, ${start + step}, ${start + step * 2}, __. What comes next?`, answer,
      options: numberChoices(answer, random), operation: 'pattern', context: 'pattern', difficulty: 3, skill: `skip-count by ${step}s`,
      explanation: `Add ${step} each time. The next number is ${answer}.`,
      visualModel: { kind: 'number-path', start: start + step * 2, end: answer },
    };
  },
  () => {
    const first = Math.floor(random() * 9) + 5;
    const second = Math.floor(random() * 8) + 2;
    const answer = first + second;
    return {
      question: `Maya has ${first} crayons and gets ${second} more. How many crayons does she have now?`, answer,
      options: numberChoices(answer, random), operation: 'addition', context: 'word-problem', difficulty: 3, skill: 'addition story problems',
      explanation: `The words gets more tell us to join the groups: ${first} + ${second} = ${answer}.`,
      visualModel: { kind: 'compare-groups', leftCount: first, rightCount: second, color: 'violet', secondaryColor: 'rose' },
    };
  },
  () => {
    const start = Math.floor(random() * 9) + 11;
    const removed = Math.floor(random() * 8) + 2;
    const answer = start - removed;
    return {
      question: `There are ${start} birds. ${removed} fly away. How many birds remain?`, answer,
      options: numberChoices(answer, random), operation: 'subtraction', context: 'word-problem', difficulty: 3, skill: 'subtraction story problems',
      explanation: `Fly away means take away: ${start} - ${removed} = ${answer}.`,
      visualModel: { kind: 'counters', leftCount: start, rightCount: removed, color: 'sky' },
    };
  },
  () => {
    const hour = Math.floor(random() * 12) + 1;
    const minutes = random() > 0.5 ? 30 : 0;
    const answer = `${hour}:${String(minutes).padStart(2, '0')}`;
    const nextHour = hour === 12 ? 1 : hour + 1;
    return {
      question: 'What time does the clock show?', answer,
      options: wordChoices(answer, [`${nextHour}:${String(minutes).padStart(2, '0')}`, `${hour}:${minutes === 0 ? '30' : '00'}`, `${nextHour}:${minutes === 0 ? '30' : '00'}`], random),
      operation: 'time', context: 'time', difficulty: 3, skill: 'time to the hour and half-hour',
      explanation: `The short hand shows ${hour}. The long hand shows ${minutes === 0 ? 'zero minutes' : 'thirty minutes'}, so the time is ${answer}.`,
      visualModel: { kind: 'clock', hour, minutes },
    };
  },
  () => {
    const pool: Coin[] = ['penny', 'nickel', 'dime'];
    const coins = Array.from({ length: Math.floor(random() * 3) + 2 }, () => pool[Math.floor(random() * pool.length)]);
    const answer = coins.reduce((total, coin) => total + coinValue[coin], 0);
    return {
      question: 'How many cents are shown?', answer, options: numberChoices(answer, random),
      operation: 'money', context: 'money', difficulty: 3, skill: 'count pennies, nickels, and dimes',
      explanation: `Count each coin by its value. Together the coins are worth ${answer} cents.`,
      visualModel: { kind: 'coins', coins },
    };
  },
  () => {
    const denominator = random() > 0.5 ? 2 : 4;
    const numerator = Math.floor(random() * (denominator - 1)) + 1;
    const answer = `${numerator}/${denominator}`;
    return {
      question: 'What fraction of the shape is shaded?', answer,
      options: wordChoices(answer, [`0/${denominator}`, `${denominator - numerator}/${denominator}`, `${numerator}/${denominator + 1}`, `${denominator}/${numerator}`], random),
      operation: 'fraction', context: 'fraction', difficulty: 3, skill: 'halves and fourths',
      explanation: `There are ${denominator} equal parts and ${numerator} shaded, so the fraction is ${answer}.`,
      visualModel: { kind: 'fraction', numerator, denominator },
    };
  },
  () => {
    const leftLength = Math.floor(random() * 8) + 3;
    const rightLength = Math.max(2, leftLength + Math.floor(random() * 7) - 3);
    const answer = leftLength === rightLength ? 'same length' : leftLength > rightLength ? 'bar A' : 'bar B';
    return {
      question: 'Which bar is longer?', answer,
      options: wordChoices(answer, ['bar A', 'bar B', 'same length', 'cannot measure'], random),
      operation: 'comparison', context: 'geometry', difficulty: 3, skill: 'compare length',
      explanation: `${answer === 'same length' ? 'Both bars have the same length.' : `${answer} reaches farther, so it is longer.`}`,
      visualModel: { kind: 'measurement', leftLength, rightLength },
    };
  },
];

const secondGradeFactories = (random: () => number): Array<() => MathProblem> => [
  () => {
    const first = Math.floor(random() * 60) + 20;
    const second = Math.floor(random() * Math.min(30, 101 - first)) + 1;
    const answer = first + second;
    return {
      question: `${first} + ${second} = ?`, answer, options: numberChoices(answer, random),
      operation: 'addition', context: 'equation', difficulty: 4, skill: 'addition within 100',
      explanation: `Add tens, then ones. ${first} + ${second} = ${answer}.`,
      visualModel: { kind: 'base-ten', tens: Math.floor(first / 10), ones: first % 10 },
    };
  },
  () => {
    const first = Math.floor(random() * 60) + 40;
    const second = Math.floor(random() * 30) + 5;
    const answer = first - second;
    return {
      question: `${first} - ${second} = ?`, answer, options: numberChoices(answer, random),
      operation: 'subtraction', context: 'equation', difficulty: 4, skill: 'subtraction within 100',
      explanation: `Subtract the tens and ones carefully. ${first} - ${second} = ${answer}.`,
      visualModel: { kind: 'base-ten', tens: Math.floor(first / 10), ones: first % 10 },
    };
  },
  () => {
    const tens = Math.floor(random() * 8) + 1;
    const ones = Math.floor(random() * 10);
    const answer = tens * 10 + ones;
    return {
      question: `What number is ${tens * 10} + ${ones}?`, answer, options: numberChoices(answer, random),
      operation: 'addition', context: 'counting', difficulty: 4, skill: 'expanded form',
      explanation: `${tens * 10} is ${tens} tens. Add ${ones} ones to make ${answer}.`,
      visualModel: { kind: 'base-ten', tens, ones },
    };
  },
  () => {
    const left = Math.floor(random() * 80) + 20;
    const right = Math.floor(random() * 80) + 20;
    const answer = left === right ? '=' : left > right ? '>' : '<';
    return {
      question: `Choose the correct symbol: ${left} __ ${right}`, answer,
      options: wordChoices(answer, ['>', '<', '=', '-'], random), operation: 'comparison', context: 'comparison', difficulty: 4,
      skill: 'compare numbers within 100', explanation: `Compare tens first, then ones. ${left} ${answer} ${right}.`,
      visualModel: { kind: 'measurement', leftLength: left, rightLength: right },
    };
  },
  () => {
    const number = Math.floor(random() * 98) + 2;
    const answer = number % 2 === 0 ? 'even' : 'odd';
    return {
      question: `Is ${number} odd or even?`, answer, options: wordChoices(answer, ['odd', 'even', 'both', 'neither'], random),
      operation: 'classification', context: 'classification', difficulty: 4, skill: 'odd and even numbers',
      explanation: `${number} can be paired with none left over, so it is ${answer}.`,
      visualModel: { kind: 'base-ten', tens: Math.floor(number / 10), ones: number % 10 },
    };
  },
  () => {
    const start = Math.floor(random() * 30) + 20;
    const added = Math.floor(random() * 20) + 10;
    const removed = Math.floor(random() * 10) + 1;
    const answer = start + added - removed;
    return {
      question: `A class has ${start} pencils, gets ${added} more, then uses ${removed}. How many remain?`, answer,
      options: numberChoices(answer, random), operation: 'subtraction', context: 'word-problem', difficulty: 4, skill: 'two-step word problems',
      explanation: `First add: ${start} + ${added} = ${start + added}. Then subtract ${removed} to get ${answer}.`,
      visualModel: { kind: 'base-ten', tens: Math.floor((start + added) / 10), ones: (start + added) % 10 },
    };
  },
  () => {
    const pool: Coin[] = ['nickel', 'dime', 'quarter'];
    const coins = Array.from({ length: Math.floor(random() * 3) + 2 }, () => pool[Math.floor(random() * pool.length)]);
    const answer = coins.reduce((total, coin) => total + coinValue[coin], 0);
    return {
      question: 'What is the total value of these coins in cents?', answer, options: numberChoices(answer, random),
      operation: 'money', context: 'money', difficulty: 4, skill: 'count mixed coins',
      explanation: `Add the coin values to get ${answer} cents.`, visualModel: { kind: 'coins', coins },
    };
  },
  () => {
    const hour = Math.floor(random() * 12) + 1;
    const minutes = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55][Math.floor(random() * 11)];
    const answer = `${hour}:${String(minutes).padStart(2, '0')}`;
    return {
      question: 'What time does the clock show?', answer,
      options: wordChoices(answer, [`${hour}:${String((minutes + 5) % 60).padStart(2, '0')}`, `${hour}:${String(Math.max(0, minutes - 5)).padStart(2, '0')}`, `${hour === 12 ? 1 : hour + 1}:${String(minutes).padStart(2, '0')}`], random),
      operation: 'time', context: 'time', difficulty: 4, skill: 'time to five minutes',
      explanation: `The hour hand is near ${hour}, and the minute hand shows ${minutes} minutes. The time is ${answer}.`,
      visualModel: { kind: 'clock', hour, minutes },
    };
  },
  () => {
    const denominator = [3, 4][Math.floor(random() * 2)];
    const numerator = Math.floor(random() * denominator) + 1;
    const answer = `${numerator}/${denominator}`;
    return {
      question: 'What fraction of the model is shaded?', answer,
      options: wordChoices(answer, [`1/${denominator}`, `${denominator - numerator}/${denominator}`, `${numerator}/${denominator + 1}`, `${denominator}/${numerator}`], random),
      operation: 'fraction', context: 'fraction', difficulty: 4, skill: 'halves, thirds, and fourths',
      explanation: `${numerator} of ${denominator} equal parts are shaded, so the fraction is ${answer}.`,
      visualModel: { kind: 'fraction', numerator, denominator },
    };
  },
  () => {
    const rows = Math.floor(random() * 3) + 2;
    const columns = Math.floor(random() * 4) + 2;
    const answer = rows * columns;
    return {
      question: `${rows} equal rows have ${columns} counters in each row. How many counters are there?`, answer,
      options: numberChoices(answer, random), operation: 'multiplication', context: 'word-problem', difficulty: 4, skill: 'equal groups and arrays',
      explanation: `Add ${columns}, ${rows} times. ${rows} groups of ${columns} make ${answer}.`,
      visualModel: { kind: 'counters', leftCount: answer, color: 'violet' },
    };
  },
  () => {
    const leftLength = Math.floor(random() * 12) + 5;
    const rightLength = Math.floor(random() * 12) + 5;
    const answer = Math.abs(leftLength - rightLength);
    return {
      question: `Bar A is ${leftLength} units and Bar B is ${rightLength} units. What is the difference in length?`, answer,
      options: numberChoices(answer, random), operation: 'subtraction', context: 'geometry', difficulty: 4, skill: 'measure and compare lengths',
      explanation: `Subtract the shorter length from the longer length: ${Math.max(leftLength, rightLength)} - ${Math.min(leftLength, rightLength)} = ${answer}.`,
      visualModel: { kind: 'measurement', leftLength, rightLength },
    };
  },
  () => {
    const sides = [3, 4, 6][Math.floor(random() * 3)];
    const shape = sides === 3 ? 'triangle' : sides === 4 ? 'rectangle' : 'hexagon';
    return {
      question: `Which shape has ${sides} sides?`, answer: shape,
      options: wordChoices(shape, ['triangle', 'rectangle', 'hexagon', 'circle'], random),
      operation: 'geometry', context: 'geometry', difficulty: 4, skill: 'shape attributes',
      explanation: `A ${shape} has ${sides} sides. Count each side once.`, visualModel: { kind: 'shape', shape, color: 'blue' },
    };
  },
];

const LESSON_PHASES = ['Warm-up', 'Teacher model', 'Try together', 'Try with less help', 'Spiral review', 'Exit ticket'];

export const generateElementaryMathProblem = (level: ElementaryMathLevel, step: number): MathProblem => {
  const random = createSeededRandom(getDailySeed(`elementary-math-grade-${level}`, step));
  const factories = level === 3 ? firstGradeFactories(random) : secondGradeFactories(random);
  const problem = factories[Math.floor(random() * factories.length)]();
  return {
    ...problem,
    question: `${LESSON_PHASES[step % LESSON_PHASES.length]}: ${problem.question}`,
  };
};
