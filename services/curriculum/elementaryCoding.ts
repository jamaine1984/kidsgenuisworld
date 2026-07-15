import { createSeededRandom, getDailySeed } from '../dailyRotation';
import { EarlyCodingQuestion } from './earlyCoding';

export type ElementaryCodingLevel = 3 | 4;

const PHASES = ['Plan', 'Follow', 'Predict', 'Find the bug', 'Fix and test', 'Explain the code'];

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

type QuestionSeed = Omit<EarlyCodingQuestion, 'id' | 'phase'>;

const firstGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => ({
    title: 'Build an Algorithm', prompt: 'Which algorithm correctly makes a simple snack?', codeClue: ['GOAL: crackers with cheese'], answer: 'Get crackers → add cheese → place on plate',
    options: choices('Get crackers → add cheese → place on plate', ['Place plate → eat → find crackers', 'Add cheese → hide crackers → stop', 'Wash plate → put away cheese → begin', 'Skip every step'], random),
    skill: 'ordered algorithms', explanation: 'An algorithm lists useful steps in the order needed to reach a goal.',
  }),
  () => ({
    title: 'Trace the Path', prompt: 'Robot faces right. Where does it finish after Move, Move, Turn right, Move?', codeClue: ['MOVE', 'MOVE', 'TURN RIGHT', 'MOVE'], board: { rows: 2, columns: 3, robot: [0, 0], goal: [2, 1], facing: 'right' }, answer: 'On the star',
    options: choices('On the star', ['On the start', 'Outside the grid', 'On the middle top square', 'Facing left at the start'], random), skill: 'tracing multi-step programs', explanation: 'Two moves reach the top-right square, the turn points down, and the final move reaches the star.',
  }),
  () => ({
    title: 'Use a Loop', prompt: 'Which code is the clearest way to move forward five squares?', codeClue: ['MOVE', 'MOVE', 'MOVE', 'MOVE', 'MOVE'], answer: 'Repeat Move 5 times',
    options: choices('Repeat Move 5 times', ['Turn right 5 times', 'Move only once', 'Repeat Stop 5 times', 'Delete the goal'], random), skill: 'counted loops', explanation: 'A counted loop repeats the same command a specific number of times.',
  }),
  () => ({
    title: 'Loop Output', prompt: 'What happens when Robot runs Repeat Clap 3 times?', codeClue: ['REPEAT 3', '  CLAP'], answer: 'Robot claps three times',
    options: choices('Robot claps three times', ['Robot claps once', 'Robot turns three times', 'Robot never claps', 'Robot claps forever'], random), skill: 'predicting loop output', explanation: 'The repeat count is three, so the Clap command runs exactly three times.',
  }),
  () => ({
    title: 'Event Starts Code', prompt: 'Which block should start a program when the green flag is clicked?', codeClue: ['EVENT: GREEN FLAG'], answer: 'When green flag clicked',
    options: choices('When green flag clicked', ['Move before start', 'Stop all forever', 'Hide every block', 'Repeat without an event'], random), skill: 'events and program starts', explanation: 'An event block tells the program when to begin running its commands.',
  }),
  () => ({
    title: 'Simple Condition', prompt: 'Robot should turn only when it reaches a wall. Which rule works?', codeClue: ['IF touching wall', 'THEN ?'], answer: 'Turn right',
    options: choices('Turn right', ['Move into the wall forever', 'Delete Robot', 'Ignore every wall', 'Stop before starting'], random), skill: 'if-then conditions', explanation: 'The condition checks for a wall; only then does Robot run Turn right.',
  }),
  () => ({
    title: 'Find the Direction Bug', prompt: 'Robot faces the star, but the code turns around before moving. Which block is the bug?', codeClue: ['TURN AROUND', 'MOVE'], board: { rows: 1, columns: 2, robot: [0, 0], goal: [1, 0], facing: 'right' }, answer: 'Turn around',
    options: choices('Turn around', ['Move', 'The star', 'The starting square', 'The grid'], random), skill: 'debugging direction errors', explanation: 'Turn around points Robot away from the goal, so it causes the wrong output.',
  }),
  () => ({
    title: 'Fix and Retest', prompt: 'A program moves into a rock. What is the best debugging step?', codeClue: ['OLD: MOVE', 'RESULT: hits rock'], board: { rows: 2, columns: 3, robot: [0, 0], goal: [2, 0], obstacles: [[1, 0]], facing: 'right' }, answer: 'Change the first command and run the program again',
    options: choices('Change the first command and run the program again', ['Run the same code without checking', 'Remove the goal', 'Add more rocks', 'Guess that it worked'], random), skill: 'debugging and retesting', explanation: 'Debugging means changing the faulty step, running the program again, and checking the new result.',
  }),
  () => ({
    title: 'Break Down a Task', prompt: 'Which smaller task belongs in a program for making a digital story?', codeClue: ['BIG TASK: create digital story'], answer: 'Choose a character and setting',
    options: choices('Choose a character and setting', ['Solve every problem at once', 'Delete the project first', 'Ignore the story goal', 'Turn off the device before planning'], random), skill: 'decomposition', explanation: 'Decomposition breaks a large project into smaller useful tasks such as choosing characters and settings.',
  }),
  () => ({
    title: 'Compare Algorithms', prompt: 'Both routes reach the star. Which one is more efficient?', codeClue: ['A: MOVE, MOVE', 'B: MOVE, TURN LEFT, TURN RIGHT, MOVE'], board: { rows: 1, columns: 3, robot: [0, 0], goal: [2, 0], facing: 'right' }, answer: 'Route A',
    options: choices('Route A', ['Route B', 'Neither route', 'The route with more blocks', 'Efficiency cannot be compared'], random), skill: 'algorithm efficiency', explanation: 'Route A reaches the same goal with fewer commands and no unnecessary turns.',
  }),
  () => ({
    title: 'Input and Output', prompt: 'A child presses the space key and a character jumps. What is the input?', codeClue: ['SPACE KEY → CHARACTER JUMPS'], answer: 'Pressing the space key',
    options: choices('Pressing the space key', ['The character jumping', 'The screen color', 'The final score', 'The speaker volume'], random), skill: 'input and output', explanation: 'The key press is the input sent to the program; the jump is the output.',
  }),
  () => ({
    title: 'Digital Safety Rule', prompt: 'A game asks for a home address. What should a child do?', codeClue: ['REQUEST: HOME ADDRESS'], answer: 'Stop and ask a trusted adult',
    options: choices('Stop and ask a trusted adult', ['Share it immediately', 'Post it publicly', 'Guess another child’s address', 'Send a password too'], random), skill: 'private information safety', explanation: 'A home address is private information and should only be handled with a trusted adult.',
  }),
];

const secondGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => ({
    title: 'Nested Pattern', prompt: 'Which description matches this program?', codeClue: ['REPEAT 2', '  REPEAT 3', '    CLAP'], answer: 'Clap six times',
    options: choices('Clap six times', ['Clap two times', 'Clap three times', 'Clap five times', 'Clap forever'], random), skill: 'nested loop output', explanation: 'The inner three claps run twice, making 2 × 3 = 6 claps.',
  }),
  () => ({
    title: 'Conditional Choice', prompt: 'Which rule makes Robot collect a coin only when one is present?', codeClue: ['IF coin here', 'THEN ?'], answer: 'Collect coin',
    options: choices('Collect coin', ['Collect coin on every empty square', 'Stop before checking', 'Delete the board', 'Turn forever'], random), skill: 'conditional behavior', explanation: 'The Collect coin command runs only when the condition coin here is true.',
  }),
  () => ({
    title: 'Two Events', prompt: 'Which event should make the character say “Hello”?', codeClue: ['GOAL: greet when clicked'], answer: 'When character clicked',
    options: choices('When character clicked', ['When project closes', 'Before any event', 'When sound ends forever', 'When no input happens'], random), skill: 'event handlers', explanation: 'The click event matches the user action that should trigger the greeting.',
  }),
  () => ({
    title: 'Variable Score', prompt: 'A player earns one point. Which command updates the score?', codeClue: ['score = 4', 'player earns 1 point'], answer: 'Change score by 1',
    options: choices('Change score by 1', ['Set score to 0', 'Hide score forever', 'Change time by 1', 'Delete the player'], random), skill: 'variables and score', explanation: 'A variable stores changing data; Change score by 1 updates the stored score from four to five.',
  }),
  () => ({
    title: 'Coordinate Movement', prompt: 'Robot starts at (0, 0). Move right 2 and up 1. Where does it finish?', codeClue: ['START (0,0)', 'RIGHT 2', 'UP 1'], board: { rows: 2, columns: 3, robot: [0, 1], goal: [2, 0], facing: 'right' }, answer: '(2, 1)',
    options: choices('(2, 1)', ['(1, 2)', '(2, 0)', '(0, 1)', '(3, 1)'], random), skill: 'grid coordinates', explanation: 'Moving right changes x from 0 to 2, and moving up changes y from 0 to 1.',
  }),
  () => ({
    title: 'Trace a Loop and Turn', prompt: 'Robot repeats Move, Turn right four times. What path does it make?', codeClue: ['REPEAT 4', '  MOVE', '  TURN RIGHT'], answer: 'A square path',
    options: choices('A square path', ['A straight line', 'One triangle', 'No movement', 'An endless spiral'], random), skill: 'tracing repeated movement', explanation: 'Four equal moves with four right turns trace the four sides of a square.',
  }),
  () => ({
    title: 'Locate the Logic Bug', prompt: 'The goal is to stop at a red light, but the rule says If red, move. What is wrong?', codeClue: ['IF light = red', 'THEN MOVE'], answer: 'Move should be Stop',
    options: choices('Move should be Stop', ['Red should be green', 'The condition needs no action', 'The program should always move', 'Delete the light'], random), skill: 'debugging conditional logic', explanation: 'The condition is correct, but its action is wrong; a red light should trigger Stop.',
  }),
  () => ({
    title: 'Test Cases', prompt: 'A rule should label numbers as even. Which two inputs are useful test cases?', codeClue: ['RULE: number is even'], answer: '4 and 7',
    options: choices('4 and 7', ['Only 4 twice', 'Only the word even', 'No input values', 'A color and a sound'], random), skill: 'testing with varied inputs', explanation: 'Testing one even and one odd number checks whether the rule handles both outcomes.',
  }),
  () => ({
    title: 'Reusable Procedure', prompt: 'A game draws the same star many times. What should the coder create?', codeClue: ['DRAW STAR repeated in many places'], answer: 'A Draw Star procedure',
    options: choices('A Draw Star procedure', ['A different random block each time', 'No instructions', 'One giant comment', 'A deleted project'], random), skill: 'procedures and reuse', explanation: 'A named procedure stores reusable steps so the same star code does not need to be rebuilt.',
  }),
  () => ({
    title: 'Efficient Loop', prompt: 'Which code paints eight tiles most clearly?', codeClue: ['GOAL: PAINT 8 TILES'], answer: 'Repeat 8: Paint, Move',
    options: choices('Repeat 8: Paint, Move', ['Write Paint, Move eight separate times', 'Move once and stop', 'Repeat Turn forever', 'Paint no tiles'], random), skill: 'efficient loop design', explanation: 'The loop states the repeated pattern once and gives the exact repeat count.',
  }),
  () => ({
    title: 'Data Classification', prompt: 'A program sorts animals by habitat. Which data belongs in the ocean group?', codeClue: ['GROUPS: ocean | forest | desert'], answer: 'Dolphin',
    options: choices('Dolphin', ['Camel', 'Squirrel', 'Woodpecker', 'Lizard'], random), skill: 'classifying data', explanation: 'A dolphin lives in the ocean, so that label matches its habitat data.',
  }),
  () => ({
    title: 'Explain the Program', prompt: 'What does this program do?', codeClue: ['WHEN green flag', 'REPEAT 3', '  MOVE', 'SAY Done'], answer: 'Moves three times, then says Done',
    options: choices('Moves three times, then says Done', ['Says Done three times without moving', 'Moves forever', 'Stops before the flag', 'Turns three times'], random), skill: 'explaining program behavior', explanation: 'The flag starts the code, the loop runs Move three times, and Say Done runs after the loop.',
  }),
];

export const generateElementaryCodingQuestion = (level: ElementaryCodingLevel, step: number): EarlyCodingQuestion => {
  const random = createSeededRandom(getDailySeed(`elementary-coding-grade-${level}`, step));
  const factories = level === 3 ? firstGradeFactories(random) : secondGradeFactories(random);
  const question = factories[Math.floor(random() * factories.length)]();
  return {
    ...question,
    id: `elementary-coding-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    phase: PHASES[step % PHASES.length],
  };
};
