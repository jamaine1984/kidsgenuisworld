import { createSeededRandom, getDailySeed } from '../dailyRotation';
import { EarlyPuzzleQuestion, EarlyPuzzleVisual } from './earlyPuzzle';

export type UpperElementaryPuzzleLevel = 5 | 6 | 7;

const PHASES = ['Notice', 'Represent', 'Use every clue', 'Test a strategy', 'Check the result', 'Explain'];

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const q = (
  title: string,
  prompt: string,
  visual: EarlyPuzzleVisual,
  clueItems: string[],
  clueText: string,
  answer: string,
  distractors: string[],
  skill: string,
  explanation: string,
  random: () => number,
): Omit<EarlyPuzzleQuestion, 'id' | 'phase'> => ({
  title, prompt, visual, clueItems, clueText, answer,
  options: shuffle([answer, ...distractors], random), skill, explanation,
});

const gradeThree = (r: () => number) => [
  q('Two-Step Pattern', 'What number comes next?', 'pattern', ['4', '8', '9', '18', '19', '?'], 'Double, then add 1; repeat', '38', ['20', '37', '39'], 'multi-rule number patterns', 'After eighteen, the pattern adds one to make nineteen. The next operation doubles nineteen to make thirty-eight.', r),
  q('Order the Racers', 'Mia finished before Leo. Leo finished before Ava. Who finished second?', 'position', ['Mia', 'Leo', 'Ava'], 'Mia before Leo before Ava', 'Leo', ['Mia', 'Ava', 'Cannot know'], 'transitive ordering', 'Combining both clues gives one order: Mia first, Leo second, and Ava third.', r),
  q('Use Elimination', 'A secret number is even, greater than 30, less than 40, and not a multiple of 3. Which number fits?', 'logic', ['even', '>30', '<40', 'not x3'], 'Every condition must be true', '38', ['33', '36', '41'], 'constraint satisfaction', 'Thirty-eight is even and lies between thirty and forty, while it is not divisible by three.', r),
  q('Track Coordinates', 'Start at (2, 1), move left 1, up 3, then right 2. Where do you finish?', 'position', ['(2,1)', 'left 1', 'up 3', 'right 2'], 'Update one coordinate at a time', '(3, 4)', ['(1, 4)', '(4, 3)', '(3, 2)'], 'multi-step coordinate reasoning', 'The moves take the point from (2, 1) to (1, 1), then (1, 4), and finally (3, 4).', r),
  q('Rotate a Shape', 'An arrow points left. After a half turn, which way does it point?', 'position', ['left', 'half turn', '?'], 'A half turn is 180 degrees', 'right', ['up', 'down', 'left'], 'mental rotation', 'A half turn reverses the direction, so an arrow pointing left finishes pointing right.', r),
  q('Find the Intersection', 'Which number belongs in both groups: multiples of 4 and multiples of 6?', 'sort', ['x4', 'x6', 'both'], 'Find a number divisible by both', '24', ['16', '18', '22'], 'set intersections', 'Twenty-four divides evenly by four and by six, so it belongs in the intersection of both groups.', r),
  q('Balance the Scale', 'Three identical boxes weigh 21 pounds altogether. How much does one box weigh?', 'logic', ['box', 'box', 'box', '21 lb'], 'Equal boxes have equal weights', '7 pounds', ['3 pounds', '6 pounds', '18 pounds'], 'equivalent groups and balance', 'Dividing the total weight of twenty-one equally among three boxes gives seven pounds per box.', r),
  q('Decode the Message', 'Using A=1, B=2, and so on, what word is 3-1-20?', 'memory', ['3', '1', '20'], 'Match each number to its letter', 'CAT', ['BAT', 'CAR', 'DOG'], 'symbol decoding', 'Three maps to C, one maps to A, and twenty maps to T, so the decoded word is CAT.', r),
  q('Compare Chances', 'A bag has 5 blue, 2 red, and 1 green token. Which color is most likely to be picked?', 'logic', ['blue 5', 'red 2', 'green 1'], 'More matching tokens means a greater chance', 'blue', ['red', 'green', 'all are equally likely'], 'qualitative probability', 'Blue has five of the eight tokens, more than either other color, so blue is most likely.', r),
  q('Choose the Shortest Route', 'Which route from Start to Finish uses the fewest total steps?', 'position', ['A: 4+3', 'B: 2+2+2', 'C: 5+2'], 'Add the steps in each route', 'Route B', ['Route A', 'Route C', 'All routes tie'], 'route optimization', 'Route A and C each use seven steps, while Route B uses six, making Route B shortest.', r),
  q('Complete the Analogy', 'Puppy is to dog as kitten is to what?', 'logic', ['puppy', 'dog', 'kitten', '?'], 'Young animal to adult animal', 'cat', ['cub', 'horse', 'bird'], 'relationship analogies', 'A puppy is a young dog, and a kitten is a young cat, so the relationships match.', r),
  q('Justify a Claim', 'Nia says every multiple of 4 is even. Which explanation proves her claim?', 'logic', ['4=2x2', '8=2x4', '12=2x6'], 'Look for a rule that works every time', 'Every multiple of 4 can be written as 2 times a whole number', ['The first three examples are enough by themselves', 'Every even number is a multiple of 4', 'Four is an odd number'], 'generalizing with reasoning', 'Because four times any whole number equals two times another whole number, every multiple of four is even.', r),
];

const gradeFour = (r: () => number) => [
  q('Growing Difference Pattern', 'What number comes next?', 'pattern', ['2', '5', '9', '14', '20', '?'], 'Add 3, 4, 5, 6, then 7', '27', ['26', '28', '40'], 'patterns with growing differences', 'The added amount increases by one each time, so the next step adds seven to twenty and gives twenty-seven.', r),
  q('Logic Grid Clues', 'Ari, Bo, and Cy chose art, music, and coding. Ari did not choose art. Bo chose music. Cy did not choose coding. What did Ari choose?', 'logic', ['Ari', 'Bo=music', 'Cy not coding'], 'Each person chooses one different class', 'coding', ['art', 'music', 'Cannot know'], 'logic-grid deduction', 'Bo uses music. Cy cannot use coding, so Cy must use art, leaving coding as Ari\'s only choice.', r),
  q('Follow If-Then Logic', 'If the alarm rings, the light flashes. The alarm rings. What must happen?', 'logic', ['alarm rings', 'then', 'light flashes'], 'Use the stated rule', 'The light flashes', ['The light stays off', 'The alarm did not ring', 'Nothing can be concluded'], 'conditional deduction', 'The condition is known to be true, so the rule requires the stated result: the light flashes.', r),
  q('Count Outfit Combinations', 'There are 3 shirts and 2 pairs of pants. How many different shirt-and-pants outfits are possible?', 'sort', ['3 shirts', '2 pants'], 'Pair every shirt with every pair of pants', '6', ['5', '8', '9'], 'systematic combinations', 'Each of three shirts can pair with either of two pants, so three times two makes six outfits.', r),
  q('Visualize a Cube Net', 'A cube net has six squares. Why must it contain exactly six?', 'shape', ['front', 'back', 'left', 'right', 'top', 'bottom'], 'Match one square to each face', 'A cube has 6 faces', ['A cube has 6 corners', 'Every net is a rectangle', 'A cube has only 4 sides'], 'spatial nets and solids', 'Each square in the net folds into one face, and a cube has six faces altogether.', r),
  q('Find Exact Probability', 'A fair spinner has 8 equal sections and 3 are orange. What is the probability of orange?', 'logic', ['3 orange', '8 total'], 'Favorable outcomes over total outcomes', '3/8', ['5/8', '3/5', '8/3'], 'fraction probability', 'There are three favorable orange sections out of eight equal possible sections, so the probability is three-eighths.', r),
  q('Classify with Two Rules', 'Which number is in the group odd numbers AND factors of 30?', 'sort', ['odd', 'factor of 30'], 'The answer must satisfy both labels', '5', ['2', '6', '15 is even'], 'classification with intersecting rules', 'Five is odd and divides thirty evenly, so it satisfies both category rules.', r),
  q('Find What Stays Constant', 'A square is rotated four quarter turns. What is unchanged?', 'shape', ['turn 1', 'turn 2', 'turn 3', 'turn 4'], 'Separate orientation from shape properties', 'Its side lengths and angles', ['Its direction after every single turn', 'Its color must change', 'Its number of sides doubles'], 'invariants under rotation', 'Rotation changes orientation but preserves the square\'s four equal sides and four right angles.', r),
  q('Work Backward', 'A number is doubled and then 5 is added to get 19. What was the starting number?', 'logic', ['?', 'x2', '+5', '19'], 'Undo operations in reverse order', '7', ['12', '14', '38'], 'working backward with inverse operations', 'Subtracting five from nineteen gives fourteen, and halving fourteen gives the starting number seven.', r),
  q('Schedule Without Conflict', 'Art is before lunch. Science is after lunch. Math is before art. Which order works?', 'position', ['math', 'art', 'lunch', 'science'], 'Check every before-and-after clue', 'Math, Art, Lunch, Science', ['Art, Math, Lunch, Science', 'Science, Lunch, Art, Math', 'Lunch, Math, Science, Art'], 'scheduling with constraints', 'Math must precede Art, Art must precede lunch, and Science must come after lunch, so only that order works.', r),
  q('Find a Counterexample', 'Which number disproves the claim All prime numbers are odd?', 'logic', ['claim', 'all primes', 'are odd'], 'One valid exception disproves an all claim', '2', ['3', '5', '7'], 'counterexamples and claims', 'Two is prime because it has exactly two factors, but it is even, so it disproves the claim.', r),
  q('Select an Efficient Strategy', 'What is the fastest reliable way to find the sum 1+2+3+4+5+6+7+8+9+10?', 'logic', ['1 through 10', 'pair ends'], 'Look for equal-sum pairs', 'Pair 1+10, 2+9, 3+8, 4+7, and 5+6', ['Add random numbers first', 'Count only the odd numbers', 'Multiply 10 by 10'], 'strategic grouping', 'The five pairs each total eleven, so the structure gives five times eleven, or fifty-five, efficiently.', r),
];

const gradeFive = (r: () => number) => [
  q('Exponential Pattern', 'What number comes next?', 'pattern', ['3', '7', '15', '31', '?'], 'Double, then add 1', '63', ['32', '62', '64'], 'recursive exponential patterns', 'Doubling thirty-one gives sixty-two and adding one gives sixty-three, matching the rule used at every step.', r),
  q('Solve a Logic Grid', 'Jae, Kim, and Luz own a cat, dog, and fish. Jae does not own the dog. Kim owns the fish. Luz does not own the cat. Which pet does Jae own?', 'logic', ['Kim=fish', 'Jae not dog', 'Luz not cat'], 'Each person owns one different pet', 'cat', ['dog', 'fish', 'Cannot know'], 'multi-clue logic grids', 'Kim has the fish. Luz cannot have the cat, so Luz has the dog, leaving the cat for Jae.', r),
  q('Use a Syllogism', 'All maple trees are plants. This tree is a maple. What conclusion must be true?', 'logic', ['maple -> plant', 'this is maple'], 'Connect the two statements', 'This tree is a plant', ['Every plant is a maple', 'This tree is not a plant', 'No conclusion is possible'], 'deductive syllogisms', 'The tree belongs to the maple group, and every member of that group is a plant, so the conclusion follows.', r),
  q('Avoid the Converse Error', 'If a shape is a square, then it has four sides. A shape has four sides. What can you conclude?', 'logic', ['square -> 4 sides', 'shape has 4 sides'], 'The rule works forward, not automatically backward', 'It might be a square, but more information is needed', ['It must be a square', 'It cannot be a square', 'It must be a triangle'], 'conditional reasoning and converses', 'Many quadrilaterals have four sides, so having four sides alone does not guarantee the shape is a square.', r),
  q('Count Meal Combinations', 'A menu offers 3 entrees, 2 sides, and 2 drinks. How many one-entree, one-side, one-drink meals are possible?', 'sort', ['3 entrees', '2 sides', '2 drinks'], 'Multiply the independent choices', '12', ['7', '10', '16'], 'multiplicative counting principle', 'For each entree there are two side choices and two drink choices, so three times two times two equals twelve.', r),
  q('Probability Without Replacement', 'A bag has 3 red and 1 blue token. A red token is removed and not replaced. What is the chance the next token is blue?', 'logic', ['start: 3R 1B', 'remove: 1R', 'remain: 2R 1B'], 'Use the new total after removal', '1/3', ['1/4', '2/3', '3/4'], 'probability without replacement', 'After one red token is removed, three tokens remain and one is blue, giving a probability of one-third.', r),
  q('Reason About Volume', 'A solid is built from 3 layers with 8 unit cubes in each layer. How many cubes are used?', 'shape', ['layer 1: 8', 'layer 2: 8', 'layer 3: 8'], 'Equal layers form the solid', '24', ['11', '16', '32'], 'spatial volume reasoning', 'Each of the three layers contains eight cubes, so three times eight gives twenty-four unit cubes.', r),
  q('Optimize Under a Limit', 'A backpack can carry 10 pounds. Which set gives the greatest total weight without going over?', 'logic', ['A: 6+5', 'B: 4+6', 'C: 3+4'], 'Compare each total with the limit of 10', 'Set B', ['Set A', 'Set C', 'All sets tie'], 'optimization with constraints', 'Set A exceeds the limit, Set C totals seven, and Set B reaches exactly ten without going over.', r),
  q('Solve a Symbol Equation', 'If STAR + STAR = 18 and MOON = STAR - 4, what is MOON?', 'logic', ['STAR+STAR=18', 'MOON=STAR-4'], 'Find STAR first, then substitute', '5', ['4', '9', '14'], 'multi-step symbolic reasoning', 'Two equal stars total eighteen, so each star is nine; subtracting four gives a moon value of five.', r),
  q('Choose a Winning Strategy', 'There are 5 counters. Players take 1 or 2 each turn. You want to take the last counter. What first move leaves 3 counters?', 'logic', ['start 5', 'take 1 or 2', 'leave 3'], 'Work backward from the desired position', 'Take 2 counters', ['Take 1 counter', 'Take all 5 counters', 'Skip the turn'], 'game strategy and working backward', 'Taking two leaves exactly three counters, the target position named in the strategy.', r),
  q('Test a Universal Claim', 'Which value disproves the claim Multiplying a number by itself always makes it larger?', 'logic', ['claim: n x n > n'], 'Try zero, one, fractions, and negatives', '1', ['2', '3', '10'], 'testing claims with counterexamples', 'One times one equals one rather than a larger number, so one is a valid counterexample to the universal claim.', r),
  q('Complete a Proof', 'Why is the sum of two odd whole numbers always even?', 'logic', ['odd=2a+1', 'odd=2b+1'], 'Combine the two general forms', 'Their sum is 2(a+b+1), which is divisible by 2', ['Two examples prove every case', 'Odd plus odd is sometimes odd', 'The numbers must be equal'], 'algebraic reasoning and proof', 'Writing the odd numbers generally shows their sum has a factor of two, so the result is even in every case.', r),
];

export const generateUpperElementaryPuzzleQuestion = (level: UpperElementaryPuzzleLevel, step: number): EarlyPuzzleQuestion => {
  const random = createSeededRandom(getDailySeed(`upper-elementary-puzzle-grade-${level}`, step));
  const bank = level === 5 ? gradeThree(random) : level === 6 ? gradeFour(random) : gradeFive(random);
  const question = bank[step % bank.length];
  return {
    ...question,
    id: `upper-puzzle-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    phase: PHASES[step % PHASES.length],
  };
};
