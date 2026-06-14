import { GradeLevel, RoomType, UserProgress } from '../types';
import { MASTERED_PRACTICE_TARGET, SCHOOL_YEAR_PACING } from './learningConstants';

export interface CurriculumUnit {
  id: string;
  grade: GradeLevel;
  room: RoomType;
  title: string;
  objective: string;
  prerequisite?: string;
  masteryTarget: string;
  standardsFocus: string[];
  reviewCycleDays: number;
  parentActivity: string;
  successCheck: string;
  practiceActivities?: string[];
  endOfLessonChecks?: string[];
  masteryGate?: string;
  parentExplanation?: string;
}

export type UnitReadiness = 'needs-practice' | 'in-progress' | 'ready';

export interface WeeklyPlanItem {
  day: string;
  unit: CurriculumUnit;
  focus: string;
}

const CORE_CURRICULUM_UNITS: CurriculumUnit[] = [
  {
    id: 'prek-count-colors',
    grade: GradeLevel.PRE_K,
    room: RoomType.MATH,
    title: 'Count and Compare',
    objective: 'Count small sets, name colors, and compare more or less.',
    masteryTarget: 'Count groups up to five and choose the larger group.',
    standardsFocus: ['Counting', 'Comparing quantities', 'Visual discrimination'],
    reviewCycleDays: 2,
    parentActivity: 'Put five small toys on a table, move some into two groups, and ask which group has more.',
    successCheck: 'Child counts each group and correctly points to more, less, or same.',
  },
  {
    id: 'prek-picture-words',
    grade: GradeLevel.PRE_K,
    room: RoomType.READING,
    title: 'Picture Words',
    objective: 'Connect familiar pictures to spoken words and first sounds.',
    masteryTarget: 'Match common pictures to words and repeat beginning sounds.',
    standardsFocus: ['Oral vocabulary', 'Print awareness', 'Beginning sounds'],
    reviewCycleDays: 2,
    parentActivity: 'Pick three household objects and ask your child to say the first sound in each word.',
    successCheck: 'Child can repeat the word and identify at least two beginning sounds.',
  },
  {
    id: 'prek-kindness-focus',
    grade: GradeLevel.PRE_K,
    room: RoomType.STORYBOOK,
    title: 'Kind Choices',
    objective: 'Listen to short stories about sharing, patience, and helping.',
    masteryTarget: 'Name one kind choice from a story.',
    standardsFocus: ['Listening comprehension', 'Social-emotional learning', 'Oral response'],
    reviewCycleDays: 3,
    parentActivity: 'After a short story, ask what the character did that was kind or helpful.',
    successCheck: 'Child names one action and explains why it helped.',
  },
  {
    id: 'prek-move-and-pattern',
    grade: GradeLevel.PRE_K,
    room: RoomType.PUZZLE,
    title: 'Move and Pattern',
    objective: 'Copy simple color, sound, and movement patterns.',
    masteryTarget: 'Continue an AB pattern with objects, claps, or steps.',
    standardsFocus: ['Patterning', 'Memory', 'Fine motor control'],
    reviewCycleDays: 2,
    parentActivity: 'Make a clap-stomp-clap-stomp pattern and ask your child what comes next.',
    successCheck: 'Child continues the pattern for at least four turns.',
  },
  {
    id: 'prek-feelings-words',
    grade: GradeLevel.PRE_K,
    room: RoomType.STORYBOOK,
    title: 'Feelings Words',
    objective: 'Name happy, sad, mad, worried, and proud feelings in stories.',
    masteryTarget: 'Point to a feeling and say what may have caused it.',
    standardsFocus: ['Social-emotional learning', 'Oral language', 'Story listening'],
    reviewCycleDays: 3,
    parentActivity: 'Make simple feeling faces together and ask what each face could mean.',
    successCheck: 'Child names at least two feelings and one reason for a feeling.',
  },
  {
    id: 'math-number-sense-k',
    grade: GradeLevel.KINDERGARTEN,
    room: RoomType.MATH,
    title: 'Number Sense',
    objective: 'Count, compare, and combine small groups.',
    masteryTarget: 'Answer addition and counting questions with confidence.',
    standardsFocus: ['Counting cardinality', 'Addition foundations', 'Number comparison'],
    reviewCycleDays: 3,
    parentActivity: 'Use snacks or blocks to make simple addition stories like 2 and 3 make 5.',
    successCheck: 'Child explains the total using counting or counting on.',
  },
  {
    id: 'reading-phonics-k',
    grade: GradeLevel.KINDERGARTEN,
    room: RoomType.READING,
    title: 'Sound Out Words',
    objective: 'Blend simple sounds and match words to pictures.',
    masteryTarget: 'Read common short words and hear rhymes.',
    standardsFocus: ['Phonemic awareness', 'CVC words', 'Rhyming'],
    reviewCycleDays: 2,
    parentActivity: 'Say a CVC word slowly, then have your child blend the sounds back together.',
    successCheck: 'Child blends at least three short words with support.',
  },
  {
    id: 'science-observe-k',
    grade: GradeLevel.KINDERGARTEN,
    room: RoomType.SCIENCE,
    title: 'Observe Like a Scientist',
    objective: 'Use senses to describe weather, plants, animals, and materials.',
    masteryTarget: 'Choose observations that match what is shown or described.',
    standardsFocus: ['Observation', 'Living and nonliving things', 'Weather'],
    reviewCycleDays: 4,
    parentActivity: 'Look outside together and describe the weather using three observation words.',
    successCheck: 'Child gives observations like sunny, cloudy, windy, hot, or cold.',
  },
  {
    id: 'kindergarten-sight-word-fluency',
    grade: GradeLevel.KINDERGARTEN,
    room: RoomType.READING,
    title: 'Sight Word Fluency',
    objective: 'Recognize high-frequency words in short phrases.',
    prerequisite: 'Letter names and common beginning sounds',
    masteryTarget: 'Read five familiar sight words without guessing from pictures.',
    standardsFocus: ['Sight words', 'Print tracking', 'Fluency'],
    reviewCycleDays: 2,
    parentActivity: 'Write three sight words on paper and hide them around the room for a word hunt.',
    successCheck: 'Child finds each word and reads it aloud.',
  },
  {
    id: 'kindergarten-build-and-test',
    grade: GradeLevel.KINDERGARTEN,
    room: RoomType.SCIENCE,
    title: 'Build and Test',
    objective: 'Try a simple structure, observe what happens, and improve it.',
    masteryTarget: 'Build a small tower and explain one change that made it stronger.',
    standardsFocus: ['Engineering', 'Observation', 'Cause and effect'],
    reviewCycleDays: 4,
    parentActivity: 'Build a tower with cups, blocks, or paper and test what makes it stand taller.',
    successCheck: 'Child explains one change, such as a wider base or careful stacking.',
  },
  {
    id: 'grade1-add-subtract',
    grade: GradeLevel.FIRST_GRADE,
    room: RoomType.MATH,
    title: 'Add and Subtract Within 20',
    objective: 'Use pictures, counting on, and counting back to solve equations.',
    prerequisite: 'Counting and combining small groups',
    masteryTarget: 'Solve mixed addition and subtraction facts within 20.',
    standardsFocus: ['Addition', 'Subtraction', 'Fact fluency'],
    reviewCycleDays: 3,
    parentActivity: 'Ask two quick story problems during snack time, one addition and one subtraction.',
    successCheck: 'Child chooses the right operation and solves with objects or mental math.',
  },
  {
    id: 'grade1-decodable-reading',
    grade: GradeLevel.FIRST_GRADE,
    room: RoomType.READING,
    title: 'Decode and Read',
    objective: 'Blend digraphs, long vowels, and common sight words.',
    prerequisite: 'CVC words and beginning sounds',
    masteryTarget: 'Read short sentences and answer a simple who/what question.',
    standardsFocus: ['Phonics', 'Sight words', 'Sentence reading'],
    reviewCycleDays: 2,
    parentActivity: 'Read one short decodable sentence together and ask who or what it was about.',
    successCheck: 'Child reads most words and answers one simple comprehension question.',
  },
  {
    id: 'grade1-map-basics',
    grade: GradeLevel.FIRST_GRADE,
    room: RoomType.GEOGRAPHY,
    title: 'Map Basics',
    objective: 'Recognize land, water, continents, and familiar landmarks.',
    masteryTarget: 'Answer basic map and landmark questions.',
    standardsFocus: ['Spatial awareness', 'Land and water', 'Continents'],
    reviewCycleDays: 5,
    parentActivity: 'Open a map or globe and point out land, water, and where your home is.',
    successCheck: 'Child can identify land and water and point to one familiar place.',
  },
  {
    id: 'grade1-word-problem-stories',
    grade: GradeLevel.FIRST_GRADE,
    room: RoomType.MATH,
    title: 'Word Problem Stories',
    objective: 'Listen for join, take away, and compare clues in story problems.',
    prerequisite: 'Addition and subtraction within 20',
    masteryTarget: 'Choose the correct operation for a one-step story problem.',
    standardsFocus: ['Word problems', 'Operation sense', 'Math vocabulary'],
    reviewCycleDays: 3,
    parentActivity: 'Tell one joining story and one taking-away story using toys or snacks.',
    successCheck: 'Child says whether to add or subtract and explains the clue.',
  },
  {
    id: 'grade1-patience-practice',
    grade: GradeLevel.FIRST_GRADE,
    room: RoomType.STORYBOOK,
    title: 'Patience Practice',
    objective: 'Use story moments to talk about waiting, trying again, and asking for help.',
    masteryTarget: 'Name one strategy for frustration during a learning challenge.',
    standardsFocus: ['Social-emotional learning', 'Self-regulation', 'Listening comprehension'],
    reviewCycleDays: 4,
    parentActivity: 'Ask what the child can do when work feels hard: breathe, ask, try again, or take a short break.',
    successCheck: 'Child names one calm-down or try-again strategy.',
  },
  {
    id: 'math-place-value-2',
    grade: GradeLevel.SECOND_GRADE,
    room: RoomType.MATH,
    title: 'Place Value Power',
    objective: 'Use tens and ones to solve larger addition and subtraction.',
    prerequisite: 'Single-digit addition and subtraction',
    masteryTarget: 'Solve mixed two-digit problems accurately.',
    standardsFocus: ['Place value', 'Two-digit operations', 'Mental math'],
    reviewCycleDays: 3,
    parentActivity: 'Build two-digit numbers with tens and ones using coins, sticks, or drawn boxes.',
    successCheck: 'Child explains how many tens and ones are in a number.',
  },
  {
    id: 'science-observe-explain',
    grade: GradeLevel.SECOND_GRADE,
    room: RoomType.SCIENCE,
    title: 'Observe and Explain',
    objective: 'Use evidence to explain everyday science.',
    masteryTarget: 'Choose the best explanation and repeat the key fact.',
    standardsFocus: ['Evidence', 'Forces', 'Matter', 'Earth science'],
    reviewCycleDays: 4,
    parentActivity: 'Drop two safe objects and ask what happened, then compare the observations.',
    successCheck: 'Child uses evidence words like faster, slower, heavier, lighter, or same.',
  },
  {
    id: 'grade2-money-time',
    grade: GradeLevel.SECOND_GRADE,
    room: RoomType.MATH,
    title: 'Money and Time',
    objective: 'Practice everyday math with clocks, coins, and simple word problems.',
    prerequisite: 'Place value and skip counting',
    masteryTarget: 'Solve basic time and money questions in context.',
    standardsFocus: ['Measurement', 'Money', 'Time', 'Word problems'],
    reviewCycleDays: 4,
    parentActivity: 'Show a clock or coins and ask one real-world question about time or value.',
    successCheck: 'Child explains the answer using counting, skip counting, or clock position.',
  },
  {
    id: 'grade2-fluency-and-comprehension',
    grade: GradeLevel.SECOND_GRADE,
    room: RoomType.STORYBOOK,
    title: 'Fluency and Comprehension',
    objective: 'Read short passages smoothly and answer who, what, when, where, and why questions.',
    prerequisite: 'Decodable sentence reading',
    masteryTarget: 'Retell a short story with beginning, middle, and end.',
    standardsFocus: ['Fluency', 'Comprehension', 'Retelling'],
    reviewCycleDays: 3,
    parentActivity: 'Read a short page together, then ask for the beginning, middle, and end.',
    successCheck: 'Child retells three events in order.',
  },
  {
    id: 'grade2-weather-patterns',
    grade: GradeLevel.SECOND_GRADE,
    room: RoomType.SCIENCE,
    title: 'Weather Patterns',
    objective: 'Observe daily weather and compare temperature, wind, clouds, and rain.',
    masteryTarget: 'Describe a weather pattern using two days of observations.',
    standardsFocus: ['Weather', 'Data', 'Patterns'],
    reviewCycleDays: 5,
    parentActivity: 'Record the weather for two days with words or drawings and compare what changed.',
    successCheck: 'Child names one thing that stayed the same and one thing that changed.',
  },
  {
    id: 'coding-sequence-loop',
    grade: GradeLevel.THIRD_GRADE,
    room: RoomType.CODING,
    title: 'Sequences and Loops',
    objective: 'Build step-by-step programs and shorten repeated actions.',
    prerequisite: 'Directional movement',
    masteryTarget: 'Complete a path using fewer blocks.',
    standardsFocus: ['Sequencing', 'Loops', 'Debugging'],
    reviewCycleDays: 3,
    parentActivity: 'Give directions across a room using forward, turn, and repeat language.',
    successCheck: 'Child follows or creates a short sequence without skipping steps.',
  },
  {
    id: 'grade3-multiply-divide',
    grade: GradeLevel.THIRD_GRADE,
    room: RoomType.MATH,
    title: 'Multiply and Divide',
    objective: 'Use equal groups, arrays, and fact families.',
    prerequisite: 'Addition and subtraction fluency',
    masteryTarget: 'Solve multiplication and division facts with strategy support.',
    standardsFocus: ['Multiplication', 'Division', 'Arrays', 'Fact families'],
    reviewCycleDays: 3,
    parentActivity: 'Arrange objects into equal rows and ask for the multiplication sentence.',
    successCheck: 'Child connects equal groups to multiplication or division.',
  },
  {
    id: 'grade3-reading-response',
    grade: GradeLevel.THIRD_GRADE,
    room: RoomType.STORYBOOK,
    title: 'Story Evidence',
    objective: 'Find details in a story that support an answer.',
    prerequisite: 'Short sentence reading',
    masteryTarget: 'Answer comprehension questions using story details.',
    standardsFocus: ['Comprehension', 'Evidence', 'Main idea'],
    reviewCycleDays: 3,
    parentActivity: 'After reading, ask your child to show the sentence or moment that supports their answer.',
    successCheck: 'Child points to a detail and connects it to an answer.',
  },
  {
    id: 'grade3-fractions-measurement',
    grade: GradeLevel.THIRD_GRADE,
    room: RoomType.MATH,
    title: 'Fractions and Measurement',
    objective: 'Understand halves, thirds, fourths, length, and simple measurement comparisons.',
    prerequisite: 'Equal groups and skip counting',
    masteryTarget: 'Identify equal parts and compare simple measurements.',
    standardsFocus: ['Fractions', 'Measurement', 'Number line'],
    reviewCycleDays: 4,
    parentActivity: 'Measure two household items with the same tool and compare which is longer.',
    successCheck: 'Child states the measurement comparison and uses the same unit.',
  },
  {
    id: 'grade3-debugging-habits',
    grade: GradeLevel.THIRD_GRADE,
    room: RoomType.CODING,
    title: 'Debugging Habits',
    objective: 'Find mistakes in a sequence and fix one step at a time.',
    prerequisite: 'Sequencing and turns',
    masteryTarget: 'Explain where a program went wrong and make a correction.',
    standardsFocus: ['Debugging', 'Sequencing', 'Persistence'],
    reviewCycleDays: 3,
    parentActivity: 'Give a silly direction sequence with one wrong step and ask your child to fix it.',
    successCheck: 'Child identifies the wrong step and replaces it with a better one.',
  },
  {
    id: 'reading-comprehension',
    grade: GradeLevel.FOURTH_GRADE,
    room: RoomType.STORYBOOK,
    title: 'Read and Reflect',
    objective: 'Read a story and explain the main lesson.',
    masteryTarget: 'Finish stories and discuss the moral or key idea.',
    standardsFocus: ['Theme', 'Character actions', 'Summary'],
    reviewCycleDays: 4,
    parentActivity: 'Ask what changed from the beginning to the end of a story.',
    successCheck: 'Child summarizes the story and names the lesson or theme.',
  },
  {
    id: 'grade4-fractions-geometry',
    grade: GradeLevel.FOURTH_GRADE,
    room: RoomType.MATH,
    title: 'Fractions and Geometry',
    objective: 'Compare fractions and identify shapes, angles, and area ideas.',
    prerequisite: 'Multiplication and division facts',
    masteryTarget: 'Solve introductory fraction and geometry questions.',
    standardsFocus: ['Fractions', 'Geometry', 'Measurement'],
    reviewCycleDays: 4,
    parentActivity: 'Cut or draw a shape into equal parts and compare halves, thirds, or fourths.',
    successCheck: 'Child explains equal parts and compares two fractions visually.',
  },
  {
    id: 'grade4-language-builder',
    grade: GradeLevel.FOURTH_GRADE,
    room: RoomType.LANGUAGE,
    title: 'World Words',
    objective: 'Practice greetings, numbers, colors, animals, food, and family words.',
    masteryTarget: 'Match common words across supported languages.',
    standardsFocus: ['Vocabulary', 'Listening', 'Cultural awareness'],
    reviewCycleDays: 5,
    parentActivity: 'Practice three greetings or color words in another language during the day.',
    successCheck: 'Child remembers at least two words and when to use them.',
  },
  {
    id: 'grade4-engineering-design',
    grade: GradeLevel.FOURTH_GRADE,
    room: RoomType.SCIENCE,
    title: 'Engineering Design',
    objective: 'Define a problem, test a solution, and improve the design.',
    prerequisite: 'Observation and cause-effect reasoning',
    masteryTarget: 'Explain one design improvement using evidence from a test.',
    standardsFocus: ['Engineering', 'Evidence', 'Iteration'],
    reviewCycleDays: 5,
    parentActivity: 'Build a paper bridge between two books and test how many coins it can hold.',
    successCheck: 'Child changes the design and explains why the change helped.',
  },
  {
    id: 'grade4-keyboard-logic',
    grade: GradeLevel.FOURTH_GRADE,
    room: RoomType.CODING,
    title: 'Logic and Conditions',
    objective: 'Use if-then thinking to plan decisions in a path or puzzle.',
    prerequisite: 'Loops and debugging',
    masteryTarget: 'Describe a condition and the action that should happen next.',
    standardsFocus: ['Conditional logic', 'Debugging', 'Algorithm design'],
    reviewCycleDays: 4,
    parentActivity: 'Play an if-then game, such as if the card is red clap once, if it is black tap the table.',
    successCheck: 'Child follows and explains at least two if-then rules.',
  },
  {
    id: 'geo-world-literacy',
    grade: GradeLevel.FIFTH_GRADE,
    room: RoomType.GEOGRAPHY,
    title: 'World Literacy',
    objective: 'Connect countries, landmarks, flags, and capitals.',
    masteryTarget: 'Recognize major world facts across regions.',
    standardsFocus: ['Countries', 'Capitals', 'Landmarks', 'Flags'],
    reviewCycleDays: 5,
    parentActivity: 'Choose one country and look up its flag, capital, and one landmark together.',
    successCheck: 'Child can recall two facts about the country.',
  },
  {
    id: 'grade5-decimals-word-problems',
    grade: GradeLevel.FIFTH_GRADE,
    room: RoomType.MATH,
    title: 'Decimals and Word Problems',
    objective: 'Use multi-step reasoning with whole numbers, fractions, and decimals.',
    prerequisite: 'Fractions and multi-digit operations',
    masteryTarget: 'Solve multi-step questions and explain the operation choice.',
    standardsFocus: ['Decimals', 'Fractions', 'Multi-step reasoning'],
    reviewCycleDays: 4,
    parentActivity: 'Use a receipt, recipe, or measurement label to make a two-step math question.',
    successCheck: 'Child identifies the steps and explains why each operation is needed.',
  },
  {
    id: 'grade5-science-systems',
    grade: GradeLevel.FIFTH_GRADE,
    room: RoomType.SCIENCE,
    title: 'Systems Thinking',
    objective: 'Connect body systems, ecosystems, space systems, and energy flow.',
    prerequisite: 'Observation and evidence',
    masteryTarget: 'Explain how parts of a system work together.',
    standardsFocus: ['Life science', 'Earth science', 'Space', 'Energy'],
    reviewCycleDays: 5,
    parentActivity: 'Pick a system, such as the body or ecosystem, and name three parts that work together.',
    successCheck: 'Child explains how one part affects another part of the system.',
  },
  {
    id: 'grade5-argument-reading',
    grade: GradeLevel.FIFTH_GRADE,
    room: RoomType.STORYBOOK,
    title: 'Evidence and Opinion',
    objective: 'Separate facts, opinions, claims, and supporting evidence in reading.',
    prerequisite: 'Story evidence and summary',
    masteryTarget: 'Support an answer with two details from a text or story.',
    standardsFocus: ['Evidence', 'Claims', 'Opinion writing'],
    reviewCycleDays: 4,
    parentActivity: 'Ask a real question, such as which snack is best, then list facts and opinions separately.',
    successCheck: 'Child gives one opinion and one fact that supports or challenges it.',
  },
  {
    id: 'grade5-capstone-project',
    grade: GradeLevel.FIFTH_GRADE,
    room: RoomType.CODING,
    title: 'Learning Capstone',
    objective: 'Combine coding, math, reading, and science thinking into one planned project.',
    prerequisite: 'Debugging, multi-step reasoning, and evidence explanations',
    masteryTarget: 'Plan a project with steps, checks, and one improvement after testing.',
    standardsFocus: ['Project planning', 'Computational thinking', 'Reflection'],
    reviewCycleDays: 7,
    parentActivity: 'Choose a small project, write three steps, test it, then write one improvement.',
    successCheck: 'Child explains the plan, test result, and improvement clearly.',
  },
];

const gradeExpansionPlans = [
  {
    grade: GradeLevel.PRE_K,
    label: 'Pre-K',
    stage: 'recognize, name, copy, and explain with support',
    complexity: 'pictures, movement, and short spoken answers',
  },
  {
    grade: GradeLevel.KINDERGARTEN,
    label: 'Kindergarten',
    stage: 'practice early skills with simple choices and short explanations',
    complexity: 'hands-on examples, short words, and guided repetition',
  },
  {
    grade: GradeLevel.FIRST_GRADE,
    label: '1st Grade',
    stage: 'build accuracy and explain one-step thinking',
    complexity: 'sentences, simple strategies, and everyday examples',
  },
  {
    grade: GradeLevel.SECOND_GRADE,
    label: '2nd Grade',
    stage: 'connect skills to word problems, stories, and observations',
    complexity: 'multi-step talk, early fluency, and real-world examples',
  },
  {
    grade: GradeLevel.THIRD_GRADE,
    label: '3rd Grade',
    stage: 'use strategies, evidence, and debugging habits',
    complexity: 'longer explanations, comparisons, and planned practice',
  },
  {
    grade: GradeLevel.FOURTH_GRADE,
    label: '4th Grade',
    stage: 'apply knowledge across subjects and defend choices',
    complexity: 'deeper vocabulary, models, and evidence-based answers',
  },
  {
    grade: GradeLevel.FIFTH_GRADE,
    label: '5th Grade',
    stage: 'solve multi-step challenges and reflect on improvement',
    complexity: 'projects, claims, systems, and independent review',
  },
];

const roomExpansionPlans = [
  {
    room: RoomType.MATH,
    title: 'Math Skill Builder',
    objective: 'Practice number sense, operation choice, and problem-solving stamina.',
    masteryTarget: 'Solve a grade-level math challenge and explain the strategy used.',
    standardsFocus: ['Number sense', 'Operations', 'Problem solving'],
    reviewCycleDays: 3,
    parentActivity: 'Make one quick math story from snacks, toys, money, time, or measurements.',
    successCheck: 'Child explains the answer and the strategy instead of only guessing.',
  },
  {
    room: RoomType.READING,
    title: 'Reading Skill Builder',
    objective: 'Build phonics, vocabulary, fluency, and sentence understanding.',
    masteryTarget: 'Read or identify grade-level words and answer a comprehension prompt.',
    standardsFocus: ['Phonics', 'Vocabulary', 'Reading fluency'],
    reviewCycleDays: 2,
    parentActivity: 'Read a short line together and ask your child to find one important word.',
    successCheck: 'Child reads the word or sentence and explains what it means.',
  },
  {
    room: RoomType.STORYBOOK,
    title: 'Story Thinking',
    objective: 'Use stories to practice listening, comprehension, morals, and evidence.',
    masteryTarget: 'Retell the important part of a story and name the lesson or evidence.',
    standardsFocus: ['Comprehension', 'Evidence', 'Social-emotional learning'],
    reviewCycleDays: 3,
    parentActivity: 'After a story, ask what changed and what the character learned.',
    successCheck: 'Child gives a story detail and connects it to a lesson or answer.',
  },
  {
    room: RoomType.SCIENCE,
    title: 'Science Explorer',
    objective: 'Observe, compare, predict, and explain everyday science ideas.',
    masteryTarget: 'Use evidence words to explain what happened and why.',
    standardsFocus: ['Observation', 'Cause and effect', 'Evidence'],
    reviewCycleDays: 4,
    parentActivity: 'Try one safe observation with water, weather, shadows, plants, or motion.',
    successCheck: 'Child names what they observed and gives one evidence-based explanation.',
  },
  {
    room: RoomType.GEOGRAPHY,
    title: 'World Explorer',
    objective: 'Learn places, maps, flags, landmarks, and how people live around the world.',
    masteryTarget: 'Identify a place or map feature and recall one connected fact.',
    standardsFocus: ['Maps', 'Places', 'World knowledge'],
    reviewCycleDays: 5,
    parentActivity: 'Look at a map, flag, or landmark and talk about where it is.',
    successCheck: 'Child points to a place or feature and remembers one fact.',
  },
  {
    room: RoomType.CODING,
    title: 'Coding Logic',
    objective: 'Practice sequencing, loops, conditions, debugging, and planning.',
    masteryTarget: 'Build or explain a grade-level code path with a correction if needed.',
    standardsFocus: ['Sequencing', 'Debugging', 'Computational thinking'],
    reviewCycleDays: 3,
    parentActivity: 'Give a real-life direction sequence and ask your child to find or fix one step.',
    successCheck: 'Child explains the order and corrects a mistake when one appears.',
  },
  {
    room: RoomType.LANGUAGE,
    title: 'Language Lab',
    objective: 'Practice greetings, colors, numbers, food, family, and listening patterns.',
    masteryTarget: 'Match or say grade-level words in another language with context.',
    standardsFocus: ['World language', 'Listening', 'Cultural awareness'],
    reviewCycleDays: 5,
    parentActivity: 'Use one new greeting, color, or number word during the day.',
    successCheck: 'Child remembers the word and when to use it.',
  },
  {
    room: RoomType.ART,
    title: 'Art Studio',
    objective: 'Use color, shape, pattern, and creative choices to communicate an idea.',
    masteryTarget: 'Create or describe an artwork using grade-level art vocabulary.',
    standardsFocus: ['Creativity', 'Visual design', 'Fine motor skills'],
    reviewCycleDays: 4,
    parentActivity: 'Draw a simple picture together and ask what color, shape, or pattern choice matters most.',
    successCheck: 'Child names one design choice and why they made it.',
  },
  {
    room: RoomType.MUSIC,
    title: 'Music Meadow',
    objective: 'Practice rhythm, pitch, listening, patterns, and musical memory.',
    masteryTarget: 'Copy or explain a grade-level rhythm, sound pattern, or music choice.',
    standardsFocus: ['Rhythm', 'Listening', 'Pattern recognition'],
    reviewCycleDays: 4,
    parentActivity: 'Clap a short rhythm and let your child echo it or change one part.',
    successCheck: 'Child repeats the rhythm or explains how the pattern changed.',
  },
  {
    room: RoomType.PUZZLE,
    title: 'Puzzle Strategy',
    objective: 'Strengthen memory, logic, attention, spatial reasoning, and persistence.',
    masteryTarget: 'Complete a grade-level puzzle using a named strategy.',
    standardsFocus: ['Logic', 'Memory', 'Persistence'],
    reviewCycleDays: 3,
    parentActivity: 'Work on a small puzzle and ask what strategy helped: match, sort, rotate, or check again.',
    successCheck: 'Child names one strategy and uses it to keep trying.',
  },
  {
    room: RoomType.PUZZLE,
    title: 'Focus and SEL Strategy',
    objective: 'Use logic puzzles to practice focus, patience, self-control, and trying again.',
    masteryTarget: 'Name a focus strategy and use it during a grade-level puzzle.',
    standardsFocus: ['Social-emotional learning', 'Self-regulation', 'Persistence'],
    reviewCycleDays: 2,
    parentActivity: 'Pause during a tricky puzzle and ask what helps the brain stay calm: breathing, checking again, or trying a new strategy.',
    successCheck: 'Child names one focus strategy and uses it to keep working.',
  },
];

const lessonArcPlans = [
  {
    id: 'foundation',
    title: 'Foundation',
    focus: 'Build the idea',
    activityPrompt: 'Start with a short guided example, name the key idea, and try one supported answer.',
    checkPrompt: 'Child can name the idea and complete one supported example.',
    parentCue: 'Ask your child to explain the new idea in one sentence before moving on.',
    masteryCue: 'Needs at least one accurate guided response before the next practice step.',
    reviewOffset: 0,
  },
  {
    id: 'guided-practice',
    title: 'Guided Practice',
    focus: 'Practice with support',
    activityPrompt: 'Try several varied examples, compare answers, and explain which strategy helped.',
    checkPrompt: 'Child completes varied examples and explains the strategy used.',
    parentCue: 'Use a real-world example and ask what strategy made the answer easier.',
    masteryCue: 'Needs repeated accurate practice with a spoken strategy explanation.',
    reviewOffset: 1,
  },
  {
    id: 'independent-practice',
    title: 'Independent Practice',
    focus: 'Build stamina',
    activityPrompt: 'Complete a mixed practice set with less help, pause after each one, and name the clue that guided the answer.',
    checkPrompt: 'Child completes mixed examples with fewer prompts and can name the clue or rule used.',
    parentCue: 'Let your child try first, then ask which clue helped before giving support.',
    masteryCue: 'Needs independent attempts across mixed examples before the mastery check opens.',
    reviewOffset: 2,
  },
  {
    id: 'mastery-check',
    title: 'Mastery Check',
    focus: 'Explain and apply',
    activityPrompt: 'Solve a fresh challenge, teach the idea back, and choose one mistake to avoid next time.',
    checkPrompt: 'Child applies the skill without guessing and teaches the idea back clearly.',
    parentCue: 'Ask your child to teach the skill back, then give one new example.',
    masteryCue: `Counts toward mastery after ${MASTERED_PRACTICE_TARGET} saved practice rounds and a clear teach-back.`,
    reviewOffset: 2,
  },
  {
    id: 'spiral-review',
    title: 'Spiral Review',
    focus: 'Review and connect',
    activityPrompt: 'Revisit the skill with an older idea, compare what is the same or different, and finish with one explain-again answer.',
    checkPrompt: 'Child connects the new skill to an earlier skill and explains the connection without rushing.',
    parentCue: 'Bring back a past example and ask what stayed the same and what changed.',
    masteryCue: 'Keeps the lesson in review until the child can connect it to a past skill.',
    reviewOffset: 4,
  },
];

const EVERY_ROOM_CURRICULUM_UNITS: CurriculumUnit[] = gradeExpansionPlans.flatMap((gradePlan, gradeIndex) =>
  roomExpansionPlans.flatMap((roomPlan, roomIndex) =>
    lessonArcPlans.map((arcPlan, arcIndex) => ({
      id: `${gradePlan.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${roomPlan.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${arcPlan.id}`,
      grade: gradePlan.grade,
      room: roomPlan.room,
      title: `${gradePlan.label} ${roomPlan.title}: ${arcPlan.title}`,
      objective: `${roomPlan.objective} Students ${gradePlan.stage} through ${gradePlan.complexity}. ${arcPlan.focus}: ${arcPlan.activityPrompt}`,
      prerequisite: gradeIndex === 0 && arcIndex === 0
        ? undefined
        : arcIndex === 0
          ? `${gradeExpansionPlans[gradeIndex - 1].label} readiness in this room`
          : `${gradePlan.label} ${roomPlan.title}: ${lessonArcPlans[arcIndex - 1].title}`,
      masteryTarget: `${roomPlan.masteryTarget} ${arcPlan.masteryCue}`,
      standardsFocus: [...roomPlan.standardsFocus, arcPlan.focus],
      reviewCycleDays: roomPlan.reviewCycleDays + (roomIndex % 2) + arcPlan.reviewOffset,
      parentActivity: `${roomPlan.parentActivity} ${arcPlan.parentCue}`,
      successCheck: `${roomPlan.successCheck} ${arcPlan.checkPrompt}`,
      practiceActivities: [
        arcPlan.activityPrompt,
        `Use ${gradePlan.complexity} to practice ${roomPlan.standardsFocus[0].toLowerCase()}.`,
        `Try a second example that mixes ${roomPlan.standardsFocus[1].toLowerCase()} with ${arcPlan.focus.toLowerCase()}.`,
        'Pause for a mistake check: name one clue, rule, or strategy before choosing the answer.',
        `Finish one saved practice round toward the ${MASTERED_PRACTICE_TARGET}-round mastery gate.`,
        `Return later in the week for a new version of the same skill so the answer is not memorized.`,
        `Explain the idea using ${roomPlan.standardsFocus[2]?.toLowerCase() || 'grade-level'} vocabulary.`,
        'Teach the strategy back before the lesson moves into spiral review.',
      ],
      endOfLessonChecks: [
        arcPlan.checkPrompt,
        `Child can use ${roomPlan.standardsFocus[0].toLowerCase()} language while explaining the answer.`,
        'Child can handle a mixed example without trying to jump to the next grade.',
        'Child can explain what felt easy and what still needs practice.',
        'Child can try one new example without rushing to the next grade.',
        'Child can correct one mistake or explain how they would check the answer.',
        `Child has a next practice target toward ${MASTERED_PRACTICE_TARGET} saved rounds.`,
      ],
      masteryGate: arcPlan.masteryCue,
      parentExplanation: `${gradePlan.label} ${roomPlan.title} uses a ${SCHOOL_YEAR_PACING.weeks}-week school-year rhythm: foundation, guided practice, independent practice, mastery check, spiral review, and reteach when needed. This lesson is the ${arcPlan.title.toLowerCase()} step, so it should feel like ${arcPlan.focus.toLowerCase()} before the next unit opens.`,
    }))
  )
);

const enrichCurriculumUnit = (unit: CurriculumUnit): CurriculumUnit => ({
  ...unit,
  practiceActivities: unit.practiceActivities || [
    unit.objective,
    `Practice with a short example connected to ${unit.standardsFocus[0].toLowerCase()}.`,
    `Try a second example that uses ${unit.standardsFocus[Math.min(1, unit.standardsFocus.length - 1)].toLowerCase()}.`,
    'Pause for a mistake check and say which clue helped.',
    `Save one round toward the ${MASTERED_PRACTICE_TARGET}-round mastery gate.`,
    'Try a similar problem later so the skill is practiced on more than one day.',
    'Explain how this skill connects to a past lesson.',
    'Say the strategy out loud before finishing the lesson.',
  ],
  endOfLessonChecks: unit.endOfLessonChecks || [
    unit.successCheck,
    'Child can complete a second example with less help.',
    'Child can name one mistake to watch for next time.',
    'Child can explain the idea in their own words.',
    'Child is ready for one more example without guessing.',
    'Child can try a new version of the skill without rushing.',
    'Child knows the next review target before moving forward.',
  ],
  masteryGate: unit.masteryGate || `Complete ${MASTERED_PRACTICE_TARGET} saved practice rounds and explain the idea clearly.`,
  parentExplanation: unit.parentExplanation || `${unit.title} builds ${unit.standardsFocus.slice(0, 2).join(' and ').toLowerCase()} through repeated practice, a teach-back check, spiral review, and a short at-home connection.`,
});

export const CURRICULUM_UNITS: CurriculumUnit[] = [
  ...CORE_CURRICULUM_UNITS,
  ...EVERY_ROOM_CURRICULUM_UNITS,
].map(enrichCurriculumUnit);

const gradeOrder = [
  GradeLevel.PRE_K,
  GradeLevel.KINDERGARTEN,
  GradeLevel.FIRST_GRADE,
  GradeLevel.SECOND_GRADE,
  GradeLevel.THIRD_GRADE,
  GradeLevel.FOURTH_GRADE,
  GradeLevel.FIFTH_GRADE,
];

export const getUnitsForGrade = (grade: GradeLevel) => {
  const gradeIndex = gradeOrder.indexOf(grade);
  return CURRICULUM_UNITS.filter((unit) => gradeOrder.indexOf(unit.grade) <= Math.max(gradeIndex, 0));
};

export const getCurrentGradeUnits = (grade: GradeLevel) =>
  CURRICULUM_UNITS.filter((unit) => unit.grade === grade);

export const getDailyMission = (progress: UserProgress): CurriculumUnit => {
  const units = getUnitsForGrade(progress.currentGrade);
  const currentGradeUnits = units.filter((unit) => unit.grade === progress.currentGrade);
  const candidateUnits = currentGradeUnits.length > 0 ? currentGradeUnits : units;
  const visitedRooms = new Set(progress.gradeRoomVisits?.[String(progress.currentLevel)] || []);
  const roomScores: Record<string, number> = {
    [RoomType.MATH]: progress.mathScore,
    [RoomType.READING]: progress.readingScore,
    [RoomType.SCIENCE]: progress.scienceScore,
    [RoomType.GEOGRAPHY]: progress.geographyScore,
    [RoomType.CODING]: progress.codingScore,
    [RoomType.LANGUAGE]: progress.languageScore,
    [RoomType.STORYBOOK]: progress.storybookScore || 0,
    [RoomType.ART]: visitedRooms.has(RoomType.ART) ? 1 : 0,
    [RoomType.MUSIC]: visitedRooms.has(RoomType.MUSIC) ? 1 : 0,
    [RoomType.PUZZLE]: visitedRooms.has(RoomType.PUZZLE) ? 1 : 0,
  };

  return [...candidateUnits].sort((a, b) => (roomScores[a.room] || 0) - (roomScores[b.room] || 0))[0] || CURRICULUM_UNITS[0];
};

export const getRoomPracticeScore = (progress: UserProgress, room: RoomType): number => {
  const visitedRooms = new Set(progress.gradeRoomVisits?.[String(progress.currentLevel)] || []);
  const scoreMap: Record<string, number> = {
    [RoomType.MATH]: progress.mathScore || 0,
    [RoomType.READING]: progress.readingScore || 0,
    [RoomType.STORYBOOK]: progress.storybookScore || 0,
    [RoomType.SCIENCE]: progress.scienceScore || 0,
    [RoomType.GEOGRAPHY]: progress.geographyScore || 0,
    [RoomType.CODING]: progress.codingScore || 0,
    [RoomType.LANGUAGE]: progress.languageScore || 0,
    [RoomType.ART]: visitedRooms.has(RoomType.ART) ? 1 : 0,
    [RoomType.MUSIC]: visitedRooms.has(RoomType.MUSIC) ? 1 : 0,
    [RoomType.PUZZLE]: visitedRooms.has(RoomType.PUZZLE) ? 1 : 0,
  };

  return scoreMap[room] || 0;
};

export const getUnitReadiness = (
  progress: UserProgress,
  unit: CurriculumUnit,
  requiredPractice = MASTERED_PRACTICE_TARGET
): UnitReadiness => {
  if (progress.completedUnitIds?.includes(unit.id)) return 'ready';
  const exactPracticeCount = progress.unitPracticeCounts?.[unit.id] || 0;
  if (exactPracticeCount >= requiredPractice) return 'ready';
  if (exactPracticeCount > 0) return 'in-progress';
  const score = getRoomPracticeScore(progress, unit.room);
  if (score >= requiredPractice) return 'ready';
  if (score > 0) return 'in-progress';
  return 'needs-practice';
};

export const getWeeklyLearningPlan = (progress: UserProgress): WeeklyPlanItem[] => {
  const dayLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  const currentGradeUnits = getCurrentGradeUnits(progress.currentGrade);
  const readinessRank: Record<UnitReadiness, number> = {
    'needs-practice': 0,
    'in-progress': 1,
    ready: 2,
  };
  const selectedRooms = new Set<RoomType>();

  const prioritized = [...currentGradeUnits].sort((a, b) => {
    const readinessDelta = readinessRank[getUnitReadiness(progress, a)] - readinessRank[getUnitReadiness(progress, b)];
    if (readinessDelta !== 0) return readinessDelta;

    const practiceDelta = getRoomPracticeScore(progress, a.room) - getRoomPracticeScore(progress, b.room);
    if (practiceDelta !== 0) return practiceDelta;

    return a.reviewCycleDays - b.reviewCycleDays;
  });

  const balancedUnits = [
    ...prioritized.filter(unit => {
      if (selectedRooms.has(unit.room)) return false;
      selectedRooms.add(unit.room);
      return true;
    }),
    ...prioritized,
  ];

  return dayLabels.map((day, index) => {
    const unit = balancedUnits[index % Math.max(balancedUnits.length, 1)] || CURRICULUM_UNITS[0];
    return {
      day,
      unit,
      focus: index === 4 ? 'Review and explain' : getUnitReadiness(progress, unit) === 'needs-practice' ? 'Build foundation' : 'Practice to mastery',
    };
  });
};

export const getRoadmapRecommendations = (progress: UserProgress): string[] => {
  const mission = getDailyMission(progress);
  const recommendations = [
    `Start with ${mission.title}: ${mission.objective}`,
    `Mastery goal: ${mission.masteryTarget}`,
  ];

  if (mission.prerequisite) {
    recommendations.push(`Review first if needed: ${mission.prerequisite}.`);
  }

  const weakAreas = progress.learningProfile?.weakAreas || [];
  if (weakAreas.length > 0) {
    recommendations.push(`Extra practice: ${weakAreas.slice(0, 2).join(', ')}.`);
  }

  const lowPracticeRooms = [
    { room: RoomType.READING, score: progress.readingScore, label: 'Reading fluency' },
    { room: RoomType.SCIENCE, score: progress.scienceScore, label: 'Science explanations' },
    { room: RoomType.GEOGRAPHY, score: progress.geographyScore, label: 'World knowledge' },
    { room: RoomType.CODING, score: progress.codingScore, label: 'Coding logic' },
  ].filter(item => item.score < MASTERED_PRACTICE_TARGET);

  if (lowPracticeRooms.length > 0) {
    recommendations.push(`Balance the week with ${lowPracticeRooms[0].label}.`);
  }

  return recommendations.slice(0, 5);
};
