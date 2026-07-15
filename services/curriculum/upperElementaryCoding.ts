import { createSeededRandom, getDailySeed } from '../dailyRotation';
import { EarlyCodingBoard, EarlyCodingQuestion } from './earlyCoding';

export type UpperElementaryCodingLevel = 5 | 6 | 7;

const PHASES = ['Plan', 'Trace', 'Predict', 'Debug', 'Test', 'Explain'];

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
  codeClue: string[],
  answer: string,
  distractors: string[],
  skill: string,
  explanation: string,
  random: () => number,
  board?: EarlyCodingBoard,
): Omit<EarlyCodingQuestion, 'id' | 'phase'> => ({
  title,
  prompt,
  codeClue,
  answer,
  options: shuffle([answer, ...distractors], random),
  skill,
  explanation,
  board,
});

const gradeThree = (r: () => number) => [
  q('Trace an Algorithm', 'What value does score hold after this algorithm finishes?', ['score = 2', 'score = score + 3', 'score = score * 2'], '10', ['7', '8', '12'], 'tracing variable algorithms', 'The program adds three to make five, then multiplies five by two, so the final score is ten.', r),
  q('Count a Nested Loop', 'How many total stamps does the program print?', ['REPEAT 3', '  REPEAT 2', '    PRINT STAMP'], '6 stamps', ['2 stamps', '3 stamps', '5 stamps'], 'nested loop iteration counts', 'The inner loop prints two stamps during each of three outer repeats, giving three groups of two, or six stamps.', r),
  q('Choose a Condition', 'Which condition makes the character carry an umbrella only when it is raining?', ['IF ?', '  carry umbrella', 'ELSE', '  leave umbrella'], 'weather = raining', ['weather = sunny', 'score > 10', 'key pressed'], 'if-else conditions', 'The action should depend on the weather, so checking whether the weather equals raining connects the correct condition to the umbrella action.', r),
  q('Handle an Event', 'Which event should start the code when a player taps the character?', ['WHEN ?', '  SAY Hello', '  PLAY greeting sound'], 'character clicked', ['green flag clicked', 'timer reaches zero', 'space key released'], 'events and messages', 'A character-click event responds directly to the player tapping that character, then runs the greeting commands in order.', r),
  q('Update a Counter', 'The counter starts at 7. A player finds four gems. Which value should the counter show?', ['gems = 7', 'REPEAT 4', '  gems = gems + 1'], '11', ['3', '7', '28'], 'variables and counters', 'Each of the four repeats increases the stored value by one, so the counter changes from seven to eleven.', r),
  q('Move on a Grid', 'Robot starts at (1, 1), moves right two spaces, then down one. Where does it finish?', ['START (1, 1)', 'CHANGE x BY 2', 'CHANGE y BY 1'], '(3, 2)', ['(2, 3)', '(3, 1)', '(1, 2)'], 'coordinate movement', 'Changing x by two moves from one to three, and changing y by one moves from one to two, producing coordinate (3, 2).', r, { rows: 3, columns: 4, robot: [1, 1], goal: [3, 2], facing: 'right' }),
  q('Find the Sequence Bug', 'The robot should draw a square. Which missing command fixes the program?', ['REPEAT 4', '  MOVE 2', '  ?'], 'TURN RIGHT 90', ['MOVE 4', 'TURN RIGHT 45', 'STOP ALL'], 'debugging command sequences', 'A square needs four equal sides and a ninety-degree turn after each side, so the missing command is Turn right 90.', r),
  q('Decompose a Project', 'Which set of smaller jobs best breaks down the task Build a quiz game?', ['BIG TASK: BUILD A QUIZ GAME'], 'Write questions, check answers, track score, show results', ['Pick one color and stop', 'Write every feature at once', 'Delete the score and questions'], 'project decomposition', 'A useful decomposition separates content, answer checking, score tracking, and results into smaller parts that can be built and tested.', r),
  q('Reuse a Procedure', 'Which procedure would remove repeated code in this animation?', ['JUMP, SPIN, SAY Yay', 'JUMP, SPIN, SAY Yay', 'JUMP, SPIN, SAY Yay'], 'Create a Celebrate procedure and call it three times', ['Keep three copied blocks', 'Delete two celebrations', 'Put the blocks in random order'], 'procedures and code reuse', 'A named Celebrate procedure stores the repeated steps once and can be called whenever the same animation is needed.', r),
  q('Test Both Outcomes', 'Which pair of test scores checks both branches of this rule?', ['IF score >= 8', '  SAY Pass', 'ELSE', '  SAY Practice'], '8 and 7', ['9 and 10', '3 and 4', '8 and 12'], 'testing conditional branches', 'A score of eight tests the true branch while seven tests the false branch, so both possible outputs are checked.', r),
  q('Compare Efficiency', 'Both programs move Robot twelve spaces. Which program is easier to read and update?', ['A: MOVE repeated 12 times', 'B: REPEAT 12 -> MOVE'], 'Program B', ['Program A', 'Both require twelve written moves', 'Neither program moves'], 'algorithm efficiency', 'Program B expresses the same behavior with one loop and one move command, making the intent clearer and changes easier.', r),
  q('Protect Private Data', 'A class game asks students to post their full names and home addresses. What is the safest response?', ['FORM REQUESTS:', 'full name', 'home address'], 'Stop and tell a trusted adult before sharing anything', ['Post both answers', 'Use a friend\'s address', 'Share the information publicly'], 'digital citizenship and privacy', 'Full names and home addresses are personal information, so a child should pause and involve a trusted adult before sharing them online.', r),
];

const gradeFour = (r: () => number) => [
  q('Trace Program State', 'What number is displayed after the program finishes?', ['total = 4', 'REPEAT 3', '  total = total + 2', 'DISPLAY total'], '10', ['6', '8', '12'], 'tracing program state', 'The loop adds two three times, increasing the original four by six, so the displayed total is ten.', r),
  q('Evaluate Boolean Logic', 'When does this condition become true?', ['IF temperature < 40 AND raining = true'], 'When it is below 40 and raining', ['Whenever it rains at any temperature', 'Whenever it is below 40 and dry', 'Only when it is exactly 40'], 'compound boolean conditions', 'The AND operator requires both comparisons to be true at the same time: below forty and raining.', r),
  q('Calculate Nested Output', 'How many notes play in all?', ['REPEAT 4', '  REPEAT 3', '    PLAY NOTE'], '12 notes', ['7 notes', '8 notes', '16 notes'], 'nested loops and multiplication', 'The inner group of three notes runs four times, so four groups of three produce twelve notes altogether.', r),
  q('Use Else Correctly', 'Which output appears when lives equals zero?', ['IF lives > 0', '  SAY Keep playing', 'ELSE', '  SAY Game over'], 'Game over', ['Keep playing', 'Both messages', 'No message'], 'if-else program flow', 'Zero does not satisfy lives greater than zero, so the program skips the first branch and runs the Else branch.', r),
  q('Pass a Parameter', 'Which call uses the DrawSquare(sideLength) procedure to draw a square with sides of 8?', ['DEFINE DrawSquare(sideLength)', 'REPEAT 4: MOVE sideLength, TURN 90'], 'DrawSquare(8)', ['DrawSquare()', 'DrawSquare(4, 8)', 'sideLength = square'], 'procedures with parameters', 'The value eight is passed into the sideLength parameter, so every move inside the procedure uses a length of eight.', r),
  q('Transform Coordinates', 'A sprite at (-2, 3) changes x by 5 and y by -2. What is its new position?', ['START (-2, 3)', 'CHANGE x BY 5', 'CHANGE y BY -2'], '(3, 1)', ['(-7, 1)', '(3, 5)', '(-2, -2)'], 'coordinate transformations', 'Adding five changes x from negative two to three, while subtracting two changes y from three to one.', r),
  q('Debug an Off-by-One Error', 'The program should display numbers 1 through 5, but it displays 1 through 4. Which fix works?', ['number = 1', 'REPEAT 4', '  DISPLAY number', '  number = number + 1'], 'Change REPEAT 4 to REPEAT 5', ['Start number at 0', 'Remove the display command', 'Change + 1 to + 2'], 'debugging off-by-one errors', 'The loop runs one time too few; repeating five times displays the five intended values from one through five.', r),
  q('Filter a Data Table', 'Which rule selects every book with at least 100 pages?', ['BOOK DATA:', 'Mystery 120', 'Poetry 64', 'Science 148'], 'pages >= 100', ['pages < 100', 'title = 100', 'pages = 64'], 'data filtering rules', 'The greater-than-or-equal comparison includes both books over one hundred pages and any book with exactly one hundred pages.', r),
  q('Coordinate Two Events', 'A game has code for a key press and code for a timer. What can happen if both events occur together?', ['WHEN space pressed -> JUMP', 'WHEN timer = 0 -> END ROUND'], 'Both event scripts may begin', ['Only the first script can ever run', 'The computer deletes both scripts', 'Events must happen one day apart'], 'concurrent event handling', 'Event-driven programs can start separate scripts in response to different events, even when those events happen very close together.', r),
  q('Test a Boundary', 'A ride allows heights of 48 inches or taller. Which tests best check the boundary?', ['IF height >= 48', '  allow ride'], '47, 48, and 49', ['60, 61, and 62', '10, 20, and 30', '48 three times'], 'boundary test cases', 'Values just below, exactly at, and just above forty-eight reveal whether the comparison handles the boundary correctly.', r),
  q('Choose a Scalable Algorithm', 'Which search plan is more efficient for an alphabetized list of 1,000 names?', ['A: check every name from the start', 'B: repeatedly check the middle and discard half'], 'Plan B', ['Plan A', 'Both always check 1,000 names', 'Shuffle the list first'], 'algorithm scalability', 'Plan B uses the sorted order to remove half of the remaining possibilities at each step, so it scales much better.', r),
  q('Credit Digital Sources', 'A student uses a photo from a website in a class project. What should the student do?', ['PROJECT NEEDS ONE ONLINE PHOTO'], 'Use a permitted image and credit its creator and source', ['Remove the creator name', 'Claim the photo as original work', 'Copy any image without checking'], 'copyright and source credit', 'Checking permission and giving clear credit respects the creator and helps others understand where the digital material came from.', r),
];

const gradeFive = (r: () => number) => [
  q('Trace an Accumulator', 'What value does sum hold after this loop?', ['sum = 0', 'FOR number IN [2, 4, 6]', '  sum = sum + number'], '12', ['6', '8', '24'], 'accumulators and iteration', 'The accumulator begins at zero and adds two, four, and six in sequence, resulting in a final total of twelve.', r),
  q('Evaluate a Compound Rule', 'Which student receives the badge?', ['IF lessons >= 5 AND (quiz >= 80 OR project = complete)'], 'Ari: 5 lessons, quiz 76, project complete', ['Bo: 4 lessons, quiz 95, project complete', 'Cam: 5 lessons, quiz 70, project incomplete', 'Dee: 3 lessons, quiz 60, project incomplete'], 'compound conditional logic', 'Ari meets the five-lesson requirement and also satisfies the OR group because the project is complete.', r),
  q('Analyze Nested Loops', 'How many grid cells are colored?', ['FOR row = 1 TO 5', '  FOR column = 1 TO 4', '    COLOR CELL'], '20 cells', ['9 cells', '16 cells', '25 cells'], 'nested loops for grids', 'The inner command runs for four columns in each of five rows, so five times four colors twenty cells.', r),
  q('Update Multiple Variables', 'What are the final values of x and y?', ['x = 3, y = 5', 'x = x + y', 'y = x - y'], 'x = 8, y = 3', ['x = 5, y = 2', 'x = 8, y = 5', 'x = 3, y = 8'], 'variable state changes', 'The first update makes x equal eight; the next line uses that new x, so y becomes eight minus five, or three.', r),
  q('Use a Return Value', 'What does result store after this code runs?', ['FUNCTION double(n)', '  RETURN n * 2', 'result = double(7)'], '14', ['7', '9', '49'], 'functions and return values', 'The argument seven becomes n, the function calculates seven times two, and the returned fourteen is stored in result.', r),
  q('Calculate Sprite Movement', 'A sprite at (4, -1) points left and moves 6 units. What is the new coordinate?', ['START (4, -1)', 'POINT LEFT', 'MOVE 6'], '(-2, -1)', ['(10, -1)', '(4, 5)', '(-1, -6)'], 'coordinate sprite movement', 'Moving left subtracts six from the x-coordinate while the y-coordinate stays unchanged, producing negative two, negative one.', r),
  q('Repair a Loop Condition', 'The timer should count 3, 2, 1 and stop, but it continues below zero. Which fix works?', ['timer = 3', 'WHILE timer <= 3', '  DISPLAY timer', '  timer = timer - 1'], 'Change the condition to timer > 0', ['Change timer to -3', 'Add 1 instead of subtracting', 'Remove the timer update'], 'debugging loop conditions', 'The loop should continue only while the timer remains above zero; the original condition stays true for negative numbers.', r),
  q('Represent and Filter Data', 'Which record matches the filter genre = science AND rating >= 4?', ['A: science, 5', 'B: science, 3', 'C: history, 5'], 'Record A', ['Record B', 'Record C', 'All three records'], 'structured data and filters', 'Record A is the only entry that has the required science label and a rating of at least four.', r),
  q('Judge a Random Simulation', 'A program chooses a number from 1 to 6 with equal probability. Which change would make 6 more likely?', ['choice = RANDOM 1 TO 6'], 'Choose from [1, 2, 3, 4, 5, 6, 6]', ['Run the fair code again', 'Rename choice to roll', 'Display the result more slowly'], 'randomness and simulation fairness', 'Adding a second six to the selection list gives six two possible slots while each other number has only one.', r),
  q('Design Edge Cases', 'Which inputs best test a username rule that allows 3 through 12 characters?', ['VALID WHEN length >= 3 AND length <= 12'], '2, 3, 12, and 13 characters', ['5 and 6 characters', 'Only 3 characters', '20 and 21 characters'], 'edge-case testing', 'The selected lengths test just outside and exactly on both boundaries, exposing errors in either comparison.', r),
  q('Compare Growth', 'Program A checks every pair of students. Program B checks each student once. Which scales better as the class grows?', ['A: every student compared with every other', 'B: each student checked once'], 'Program B', ['Program A', 'Both grow at the same rate', 'Neither program uses data'], 'comparing algorithm growth', 'A single pass adds roughly one check per new student, while pairwise comparisons grow much faster as the group expands.', r),
  q('Spot a Phishing Message', 'Which clue most strongly suggests that an account message may be phishing?', ['URGENT: click this unknown link now', 'Send your password to keep access'], 'It pressures you to share a password through an unknown link', ['It uses complete sentences', 'It arrived during the day', 'It mentions an account'], 'cybersecurity and phishing', 'Legitimate services should not ask a child to send a password through an unexpected link, especially with urgent pressure.', r),
];

export const generateUpperElementaryCodingQuestion = (level: UpperElementaryCodingLevel, step: number): EarlyCodingQuestion => {
  const random = createSeededRandom(getDailySeed(`upper-elementary-coding-grade-${level}`, step));
  const bank = level === 5 ? gradeThree(random) : level === 6 ? gradeFour(random) : gradeFive(random);
  const question = bank[step % bank.length];
  return {
    ...question,
    id: `upper-coding-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    phase: PHASES[step % PHASES.length],
  };
};
