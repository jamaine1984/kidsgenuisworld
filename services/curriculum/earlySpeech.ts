import { createSeededRandom, getDailySeed } from '../dailyRotation';

export type EarlySpeechVisual = 'conversation' | 'emotion' | 'listening' | 'direction' | 'category' | 'sentence' | 'sequence' | 'question';

export interface EarlySpeechQuestion {
  id: string;
  phase: string;
  prompt: string;
  focusText: string;
  visual: EarlySpeechVisual;
  answer: string;
  options: string[];
  skill: string;
  coachCue: string;
  explanation: string;
}

const PHASES = ['Listen and notice', 'Teacher model', 'Try it together', 'Speak with confidence', 'Review and remember', 'Show what you know'];

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const makeOptions = (answer: string, distractors: string[], random: () => number) => (
  shuffle([answer, ...distractors.filter(item => item !== answer).slice(0, 3)], random)
);

type QuestionFactory = (random: () => number) => Omit<EarlySpeechQuestion, 'id' | 'phase'>;

const preKFactories: QuestionFactory[] = [
  random => ({
    prompt: 'A classmate says hello. What can you say back?',
    focusText: 'Hello!',
    visual: 'conversation',
    answer: 'Hello!',
    options: makeOptions('Hello!', ['Give me that.', 'Go away.', 'I am not listening.'], random),
    skill: 'friendly greetings',
    coachCue: 'Look at the speaker and use a friendly voice.',
    explanation: 'Saying hello back is a friendly way to begin a conversation.',
  }),
  random => ({
    prompt: 'The crayons are too high to reach. What is a clear way to ask for help?',
    focusText: 'Use a complete request.',
    visual: 'question',
    answer: 'Can you help me, please?',
    options: makeOptions('Can you help me, please?', ['Crayons now!', 'I will yell.', 'That is blue.'], random),
    skill: 'asking for help',
    coachCue: 'Say who can help, what you need, and please.',
    explanation: 'Can you help me, please is a clear and polite request.',
  }),
  random => ({
    prompt: 'A child is frowning because a toy broke. How might the child feel?',
    focusText: 'The toy broke.',
    visual: 'emotion',
    answer: 'Sad',
    options: makeOptions('Sad', ['Proud', 'Sleepy', 'Silly'], random),
    skill: 'emotion words',
    coachCue: 'Notice the face and what happened in the story.',
    explanation: 'A frown after a toy breaks can show that the child feels sad.',
  }),
  random => ({
    prompt: 'Apple, banana, and orange belong in which group?',
    focusText: 'apple  banana  orange',
    visual: 'category',
    answer: 'Fruit',
    options: makeOptions('Fruit', ['Clothes', 'Vehicles', 'Furniture'], random),
    skill: 'word categories',
    coachCue: 'Think about what all three words have in common.',
    explanation: 'Apple, banana, and orange are all kinds of fruit.',
  }),
  random => ({
    prompt: 'Listen: Touch your head. Which body part should you touch?',
    focusText: 'Touch your head.',
    visual: 'listening',
    answer: 'Head',
    options: makeOptions('Head', ['Knee', 'Foot', 'Elbow'], random),
    skill: 'following one-step directions',
    coachCue: 'Listen for the action word and the body part.',
    explanation: 'The direction says touch your head, so head is the body part to touch.',
  }),
  random => ({
    prompt: 'Which sentence tells a complete idea about the dog?',
    focusText: 'A dog runs across the grass.',
    visual: 'sentence',
    answer: 'The dog is running.',
    options: makeOptions('The dog is running.', ['The dog.', 'Running fast.', 'And the grass.'], random),
    skill: 'complete spoken sentences',
    coachCue: 'A complete sentence tells who and what is happening.',
    explanation: 'The dog is running tells who the sentence is about and what the dog is doing.',
  }),
  random => ({
    prompt: 'Which word best describes an elephant?',
    focusText: 'elephant',
    visual: 'category',
    answer: 'Big',
    options: makeOptions('Big', ['Tiny', 'Empty', 'Quiet as a color'], random),
    skill: 'describing words',
    coachCue: 'Picture the animal and choose a word that tells about it.',
    explanation: 'Big is a describing word that tells about an elephant\'s size.',
  }),
  random => ({
    prompt: 'Maya put on her coat and walked outside. Where did Maya go?',
    focusText: 'Maya walked outside.',
    visual: 'question',
    answer: 'Outside',
    options: makeOptions('Outside', ['Under the bed', 'Into a cup', 'On the ceiling'], random),
    skill: 'answering where questions',
    coachCue: 'Listen for the place named in the sentence.',
    explanation: 'The sentence says Maya walked outside, so outside answers where.',
  }),
];

const kindergartenFactories: QuestionFactory[] = [
  random => ({
    prompt: 'Which sentence clearly tells what the children are doing?',
    focusText: 'Two children build a tall block tower.',
    visual: 'sentence',
    answer: 'The children are building a tower.',
    options: makeOptions('The children are building a tower.', ['The children tower.', 'Building and tall.', 'The blocks because.'], random),
    skill: 'complete and clear sentences',
    coachCue: 'Name who is doing the action and tell what they are doing.',
    explanation: 'The children are building a tower is a complete sentence with a who and an action.',
  }),
  random => ({
    prompt: 'Which question would help you learn the place where the class is going?',
    focusText: 'Ask about a place.',
    visual: 'question',
    answer: 'Where are we going?',
    options: makeOptions('Where are we going?', ['Who is your teacher?', 'When is your birthday?', 'Why is ice cold?'], random),
    skill: 'using question words',
    coachCue: 'Where asks about a place.',
    explanation: 'Where are we going asks for the name of a place.',
  }),
  random => ({
    prompt: 'Listen: First Noah washes the apple. Next he slices it. What happens first?',
    focusText: 'wash  then  slice',
    visual: 'sequence',
    answer: 'Noah washes the apple.',
    options: makeOptions('Noah washes the apple.', ['Noah slices the apple.', 'Noah plants the apple.', 'Noah throws the apple.'], random),
    skill: 'retelling events in order',
    coachCue: 'Listen for the word first.',
    explanation: 'Washing the apple happens first. Slicing it happens next.',
  }),
  random => ({
    prompt: 'Your classmate is speaking. What should you do before sharing your idea?',
    focusText: 'Take turns speaking.',
    visual: 'conversation',
    answer: 'Listen and wait for a turn.',
    options: makeOptions('Listen and wait for a turn.', ['Talk over the classmate.', 'Walk away mid-sentence.', 'Shout the answer.'], random),
    skill: 'conversation turn-taking',
    coachCue: 'A good conversation has one speaker and one listener at a time.',
    explanation: 'Listening and waiting gives both people a fair turn to speak.',
  }),
  random => ({
    prompt: 'Listen: The little bird carried a blue string to its nest. What color was the string?',
    focusText: 'The bird carried a blue string.',
    visual: 'listening',
    answer: 'Blue',
    options: makeOptions('Blue', ['Green', 'Orange', 'Purple'], random),
    skill: 'listening for key details',
    coachCue: 'Hold the important detail in your mind while you listen.',
    explanation: 'The sentence says blue string, so blue is the key detail.',
  }),
  random => ({
    prompt: 'Which word best completes the sentence: The rabbit hops ___ the log?',
    focusText: 'The rabbit hops ___ the log.',
    visual: 'direction',
    answer: 'over',
    options: makeOptions('over', ['purple', 'quietly as a place', 'yesterday as an object'], random),
    skill: 'position and direction words',
    coachCue: 'Picture where the rabbit moves in relation to the log.',
    explanation: 'Over tells the rabbit\'s position as it hops above and across the log.',
  }),
  random => ({
    prompt: 'Which words belong together because they are all ways to travel?',
    focusText: 'Find the category.',
    visual: 'category',
    answer: 'Bus, train, bicycle',
    options: makeOptions('Bus, train, bicycle', ['Fork, plate, spoon', 'Hat, sock, shirt', 'Apple, pear, peach'], random),
    skill: 'explaining word relationships',
    coachCue: 'Name the idea that connects all three words.',
    explanation: 'A bus, train, and bicycle can all help people travel from place to place.',
  }),
  random => ({
    prompt: 'You did not hear the teacher\'s direction. What should you say?',
    focusText: 'Ask for the message again.',
    visual: 'conversation',
    answer: 'Could you please say that again?',
    options: makeOptions('Could you please say that again?', ['I will guess and not ask.', 'That is not my problem.', 'Speak faster!'], random),
    skill: 'repairing a conversation',
    coachCue: 'Use a polite question when a message is unclear.',
    explanation: 'Asking the speaker to say it again helps repair a missed message.',
  }),
];

export const getEarlySpeechQuestionBank = (level: 1 | 2): EarlySpeechQuestion[] => {
  const random = createSeededRandom(`voice-cache-early-speech-${level}`);
  const factories = level === 1 ? preKFactories : kindergartenFactories;
  return factories.map((factory, index) => {
    const question = factory(random);
    return {
      ...question,
      id: `early-speech-bank-${level}-${index}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
      phase: PHASES[index % PHASES.length],
    };
  });
};

export const generateEarlySpeechQuestion = (level: 1 | 2, step: number): EarlySpeechQuestion => {
  const random = createSeededRandom(getDailySeed(`early-speech-grade-${level}`, step));
  const factories = level === 1 ? preKFactories : kindergartenFactories;
  const factory = factories[step % factories.length];
  const question = factory(random);
  return {
    ...question,
    id: `early-speech-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    phase: PHASES[step % PHASES.length],
  };
};
