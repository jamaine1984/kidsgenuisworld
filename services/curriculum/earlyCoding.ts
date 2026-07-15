import { createSeededRandom, getDailySeed } from '../dailyRotation';

export type CodingDirection = 'up' | 'down' | 'left' | 'right';
export interface EarlyCodingBoard {
  rows: number;
  columns: number;
  robot: [number, number];
  goal: [number, number];
  obstacles?: Array<[number, number]>;
  facing: CodingDirection;
}

export interface EarlyCodingQuestion {
  id: string;
  phase: string;
  title: string;
  prompt: string;
  codeClue: string[];
  board?: EarlyCodingBoard;
  answer: string;
  options: string[];
  skill: string;
  explanation: string;
}

const PHASES = ['Plan', 'Follow', 'Predict', 'Find the bug', 'Fix and test', 'Explain the code'];
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
type Factory = (random: () => number) => Omit<EarlyCodingQuestion, 'id' | 'phase'>;

const preKFactories: Factory[] = [
  random => {
    const routine = pick([
      { task: 'wash hands', first: 'Turn on the water', later: ['Dry hands', 'Put the towel away', 'Eat lunch'] },
      { task: 'put on shoes', first: 'Find the shoes', later: ['Tie or fasten them', 'Stand up', 'Walk outside'] },
      { task: 'plant a seed', first: 'Put soil in the cup', later: ['Add the seed', 'Cover it gently', 'Give it water'] },
    ], random);
    return { title: 'First Step', prompt: `Which step should happen first to ${routine.task}?`, codeClue: ['FIRST', 'NEXT', 'LAST'], answer: routine.first, options: options(routine.first, routine.later, random), skill: 'putting actions in order', explanation: `${routine.first} must happen before the later steps. An algorithm is a set of steps in order.` };
  },
  random => {
    const direction = pick<CodingDirection>(['up', 'down', 'left', 'right'], random);
    return { title: 'Follow the Arrow', prompt: 'Which command matches the arrow?', codeClue: [`ARROW: ${direction.toUpperCase()}`], answer: `Move ${direction}`, options: options(`Move ${direction}`, ['Move up', 'Move down', 'Move left', 'Move right'].filter(item => item !== `Move ${direction}`), random), skill: 'matching arrows to commands', explanation: `The arrow points ${direction}, so the matching command is Move ${direction}.` };
  },
  random => ({ title: 'Reach the Star', prompt: 'Robot faces right. Which command moves Robot one square onto the star?', codeClue: ['ROBOT -> STAR'], board: { rows: 1, columns: 2, robot: [0, 0], goal: [1, 0], facing: 'right' }, answer: 'Move forward', options: options('Move forward', ['Turn left', 'Stop forever', 'Move backward twice'], random), skill: 'choosing a movement command', explanation: 'Robot already faces the star, so one Move forward command reaches it.' }),
  random => ({ title: 'Turn Then Move', prompt: 'Robot faces up, but the star is to the right. What should Robot do first?', codeClue: ['FACE UP', 'STAR RIGHT'], board: { rows: 2, columns: 2, robot: [0, 1], goal: [1, 1], facing: 'up' }, answer: 'Turn right', options: options('Turn right', ['Turn left', 'Move forward', 'Repeat nothing'], random), skill: 'turning toward a goal', explanation: 'Robot must turn right to face the star before moving forward.' }),
  random => ({ title: 'Find the Mixed-Up Step', prompt: 'Which step is in the wrong place in this morning routine?', codeClue: ['1. Put on socks', '2. Put on shoes', '3. Get out of bed'], answer: 'Get out of bed should be first.', options: options('Get out of bed should be first.', ['Put on shoes should be first.', 'The steps are already correct.', 'Socks should come after walking outside.'], random), skill: 'finding an order bug', explanation: 'Getting out of bed must happen before putting on socks and shoes. The last step is the bug.' }),
  random => ({ title: 'Fix the Path', prompt: 'Robot should reach the star without touching the rock. Which first command is safe?', codeClue: ['ROBOT', 'ROCK', 'STAR'], board: { rows: 2, columns: 3, robot: [0, 0], goal: [2, 0], obstacles: [[1, 0]], facing: 'right' }, answer: 'Turn right and move down', options: options('Turn right and move down', ['Move forward into the rock', 'Stop before starting', 'Turn around and leave the board'], random), skill: 'choosing a safe path', explanation: 'The rock blocks the direct route. Moving down begins a path around the obstacle.' }),
  random => ({ title: 'Spot the Repeat', prompt: 'Which short code says Move forward three times?', codeClue: ['MOVE', 'MOVE', 'MOVE'], answer: 'Repeat Move 3 times', options: options('Repeat Move 3 times', ['Turn left 3 times', 'Stop 3 times', 'Move only 1 time'], random), skill: 'recognizing repeated actions', explanation: 'The same Move command appears three times, so Repeat Move 3 times describes the pattern.' }),
  random => ({ title: 'Predict the Finish', prompt: 'Robot follows Move right, Move right. Where will Robot finish?', codeClue: ['MOVE RIGHT', 'MOVE RIGHT'], board: { rows: 1, columns: 3, robot: [0, 0], goal: [2, 0], facing: 'right' }, answer: 'On the star', options: options('On the star', ['On the starting square', 'Outside the board', 'On a rock'], random), skill: 'predicting a sequence', explanation: 'Two right moves take Robot from the first square to the third square where the star is.' }),
];

const kindergartenFactories: Factory[] = [
  random => ({ title: 'Three-Step Algorithm', prompt: 'Which algorithm puts a book away correctly?', codeClue: ['START: book in hands', 'GOAL: book on shelf'], answer: 'Walk to shelf -> find the label -> place the book', options: options('Walk to shelf -> find the label -> place the book', ['Place book -> find shelf -> pick up book', 'Run away -> hide book -> stop', 'Close eyes -> drop book -> walk'], random), skill: 'building a three-step algorithm', explanation: 'The correct algorithm moves to the shelf, finds the right location, and then places the book.' }),
  random => ({ title: 'Move on a Grid', prompt: 'Robot faces up. Which two-command plan reaches the star?', codeClue: ['FACE UP', 'STAR: one up, one right'], board: { rows: 2, columns: 2, robot: [0, 1], goal: [1, 0], facing: 'up' }, answer: 'Move forward, turn right, move forward', options: options('Move forward, turn right, move forward', ['Turn left, move forward', 'Move forward twice', 'Turn around, move forward'], random), skill: 'planning a grid path', explanation: 'Robot moves up first, turns right, and then moves onto the star.' }),
  random => ({ title: 'Left or Right Turn', prompt: 'Robot faces right. The star is above Robot. Which turn points Robot toward the star?', codeClue: ['FACE RIGHT', 'STAR ABOVE'], board: { rows: 2, columns: 2, robot: [0, 1], goal: [0, 0], facing: 'right' }, answer: 'Turn left', options: options('Turn left', ['Turn right', 'Move forward', 'Repeat move'], random), skill: 'left and right turns', explanation: 'When Robot faces right, a left turn points Robot up toward the star.' }),
  random => ({ title: 'Predict Before Running', prompt: 'Where will Robot finish after Move forward, Move forward?', codeClue: ['MOVE', 'MOVE'], board: { rows: 1, columns: 3, robot: [0, 0], goal: [2, 0], facing: 'right' }, answer: 'Two squares to the right', options: options('Two squares to the right', ['One square to the left', 'On the starting square', 'Above the board'], random), skill: 'predicting program output', explanation: "Each Move forward changes Robot's position by one square, for two squares total." }),
  random => ({ title: 'Find the First Bug', prompt: 'Robot faces the star, but this program begins Turn around, Move forward. Which command is the bug?', codeClue: ['1. TURN AROUND', '2. MOVE FORWARD'], board: { rows: 1, columns: 2, robot: [0, 0], goal: [1, 0], facing: 'right' }, answer: 'Turn around', options: options('Turn around', ['Move forward', 'The star', 'The starting square'], random), skill: 'identifying a program bug', explanation: 'Turn around points Robot away from the star. Move forward is correct when Robot faces the goal.' }),
  random => ({ title: 'Debug and Retry', prompt: 'The code Move forward hits a rock. Which change starts a safe route?', codeClue: ['OLD CODE: MOVE FORWARD', 'RESULT: BUMP'], board: { rows: 2, columns: 3, robot: [0, 0], goal: [2, 0], obstacles: [[1, 0]], facing: 'right' }, answer: 'Replace it with Turn right, Move forward', options: options('Replace it with Turn right, Move forward', ['Run the same code forever', 'Remove the star', 'Add another rock'], random), skill: 'debugging and retrying', explanation: 'Changing the first command avoids the rock. Debugging means finding and fixing a problem in code.' }),
  random => ({ title: 'Use a Repeat', prompt: 'Which code is the clearest way to move forward four times?', codeClue: ['MOVE', 'MOVE', 'MOVE', 'MOVE'], answer: 'Repeat Move 4 times', options: options('Repeat Move 4 times', ['Turn right 4 times', 'Move once', 'Repeat Stop 4 times'], random), skill: 'using repeat patterns', explanation: 'Repeat Move 4 times gives the same result with a shorter, clearer instruction.' }),
  random => ({ title: 'Choose the Better Path', prompt: 'Which plan reaches the star without touching the rock?', codeClue: ['Compare Route A and Route B'], board: { rows: 2, columns: 3, robot: [0, 0], goal: [2, 0], obstacles: [[1, 0]], facing: 'right' }, answer: 'Down, right, right, up', options: options('Down, right, right, up', ['Right, right', 'Up, up, right', 'Stop, turn, stop'], random), skill: 'comparing safe routes', explanation: 'The down-and-around route stays on the grid, avoids the rock, and reaches the star.' }),
];

export const generateEarlyCodingQuestion = (level: 1 | 2, step: number): EarlyCodingQuestion => {
  const random = createSeededRandom(getDailySeed(`early-coding-grade-${level}`, step));
  const factories = level === 1 ? preKFactories : kindergartenFactories;
  const question = factories[step % factories.length](random);
  return { ...question, id: `early-coding-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`, phase: PHASES[step % PHASES.length] };
};
