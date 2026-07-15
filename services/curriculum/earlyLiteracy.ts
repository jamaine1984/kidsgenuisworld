import { createSeededRandom, getDailySeed } from '../dailyRotation';

export type EarlyLiteracyVisual = 'letter' | 'word' | 'cat' | 'dog' | 'sun' | 'bus' | 'bed' | 'cup' | 'apple' | 'fish' | 'tree' | 'moon' | 'book';

export interface EarlyLiteracyQuestion {
  id: string;
  prompt: string;
  focusText: string;
  visual: EarlyLiteracyVisual;
  answer: string;
  options: string[];
  skill: string;
  explanation: string;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const WORDS = [
  { word: 'cat', visual: 'cat' as const, first: 'C', last: 'T', rhyme: 'hat', syllables: '1' },
  { word: 'dog', visual: 'dog' as const, first: 'D', last: 'G', rhyme: 'log', syllables: '1' },
  { word: 'sun', visual: 'sun' as const, first: 'S', last: 'N', rhyme: 'run', syllables: '1' },
  { word: 'bus', visual: 'bus' as const, first: 'B', last: 'S', rhyme: 'us', syllables: '1' },
  { word: 'bed', visual: 'bed' as const, first: 'B', last: 'D', rhyme: 'red', syllables: '1' },
  { word: 'cup', visual: 'cup' as const, first: 'C', last: 'P', rhyme: 'pup', syllables: '1' },
  { word: 'apple', visual: 'apple' as const, first: 'A', last: 'E', rhyme: 'maple', syllables: '2' },
  { word: 'fish', visual: 'fish' as const, first: 'F', last: 'H', rhyme: 'dish', syllables: '1' },
  { word: 'tree', visual: 'tree' as const, first: 'T', last: 'E', rhyme: 'bee', syllables: '1' },
  { word: 'moon', visual: 'moon' as const, first: 'M', last: 'N', rhyme: 'spoon', syllables: '1' },
];

const CVC_WORDS = [
  { word: 'cat', sounds: 'c - a - t' }, { word: 'map', sounds: 'm - a - p' },
  { word: 'sit', sounds: 's - i - t' }, { word: 'pig', sounds: 'p - i - g' },
  { word: 'hot', sounds: 'h - o - t' }, { word: 'log', sounds: 'l - o - g' },
  { word: 'bed', sounds: 'b - e - d' }, { word: 'hen', sounds: 'h - e - n' },
  { word: 'sun', sounds: 's - u - n' }, { word: 'cup', sounds: 'c - u - p' },
];

const SIGHT_WORDS = ['I', 'a', 'the', 'see', 'my', 'like', 'we', 'go', 'to', 'is'];
const PHASES = ['Warm-up', 'Teacher model', 'Try together', 'Try with less help', 'Spiral review', 'Exit ticket'];

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};
const choices = (answer: string, pool: string[], random: () => number) => (
  shuffle([answer, ...shuffle(pool.filter(item => item.toLowerCase() !== answer.toLowerCase()), random).slice(0, 3)], random)
);

const preKFactories = (random: () => number): Array<() => Omit<EarlyLiteracyQuestion, 'id'>> => [
  () => {
    const answer = LETTERS[Math.floor(random() * 13)];
    return {
      prompt: `Which letter is uppercase ${answer}?`, focusText: answer, visual: 'letter', answer,
      options: choices(answer, LETTERS, random), skill: 'uppercase letter recognition',
      explanation: `${answer} is the uppercase letter ${answer}. Trace its shape with your finger.`,
    };
  },
  () => {
    const uppercase = LETTERS[Math.floor(random() * 18)];
    const answer = uppercase.toLowerCase();
    return {
      prompt: `Which lowercase letter matches ${uppercase}?`, focusText: uppercase, visual: 'letter', answer,
      options: choices(answer, LETTERS.map(letter => letter.toLowerCase()), random), skill: 'uppercase and lowercase matching',
      explanation: `${uppercase} and ${answer} are the same letter in uppercase and lowercase forms.`,
    };
  },
  () => {
    const item = WORDS[Math.floor(random() * WORDS.length)];
    return {
      prompt: `What sound does ${item.word} begin with?`, focusText: item.word, visual: item.visual, answer: item.first,
      options: choices(item.first, LETTERS, random), skill: 'beginning sounds',
      explanation: `${item.word} begins with the ${item.first} sound. Say ${item.first.toLowerCase()}, ${item.word}.`,
    };
  },
  () => {
    const item = WORDS[Math.floor(random() * 6)];
    const rhymePool = WORDS.map(word => word.rhyme).concat(['kite', 'chair', 'boat', 'leaf']);
    return {
      prompt: `Which word rhymes with ${item.word}?`, focusText: item.word, visual: item.visual, answer: item.rhyme,
      options: choices(item.rhyme, rhymePool, random), skill: 'rhyming words',
      explanation: `${item.word} and ${item.rhyme} rhyme because their ending sounds match.`,
    };
  },
  () => {
    const item = WORDS[Math.floor(random() * WORDS.length)];
    return {
      prompt: `Clap ${item.word}. How many word beats do you hear?`, focusText: item.word, visual: item.visual, answer: item.syllables,
      options: choices(item.syllables, ['1', '2', '3', '4'], random), skill: 'syllable counting',
      explanation: `${item.word} has ${item.syllables} syllable${item.syllables === '1' ? '' : 's'}, or word beat${item.syllables === '1' ? '' : 's'}.`,
    };
  },
  () => {
    const item = WORDS[Math.floor(random() * WORDS.length)];
    return {
      prompt: 'Which word names this picture?', focusText: item.word, visual: item.visual, answer: item.word,
      options: choices(item.word, WORDS.map(word => word.word), random), skill: 'picture vocabulary',
      explanation: `The picture shows a ${item.word}. The word is ${item.word}.`,
    };
  },
  () => ({
    prompt: 'Listen: The dog naps on the rug. Where does the dog nap?', focusText: 'The dog naps on the rug.', visual: 'dog', answer: 'on the rug',
    options: choices('on the rug', ['in a tree', 'on the bus', 'by the moon', 'under water'], random), skill: 'listening for a detail',
    explanation: 'The sentence says the dog naps on the rug. That detail answers where.',
  }),
  () => ({
    prompt: 'Listen: Mia opens a book, reads one page, and closes it. What happens first?', focusText: 'First, next, last', visual: 'book', answer: 'Mia opens the book',
    options: choices('Mia opens the book', ['Mia closes the book', 'Mia takes a nap', 'Mia rides a bus', 'Mia waters a tree'], random), skill: 'first and last events',
    explanation: 'Mia opens the book first. Then she reads, and closing the book happens last.',
  }),
];

const kindergartenFactories = (random: () => number): Array<() => Omit<EarlyLiteracyQuestion, 'id'>> => [
  () => {
    const item = WORDS[Math.floor(random() * WORDS.length)];
    return {
      prompt: `Which letter makes the first sound in ${item.word}?`, focusText: item.word, visual: item.visual, answer: item.first,
      options: choices(item.first, LETTERS, random), skill: 'initial phoneme and letter',
      explanation: `${item.word} starts with ${item.first}. Say the first sound slowly.`,
    };
  },
  () => {
    const item = WORDS[Math.floor(random() * 6)];
    return {
      prompt: `Which letter makes the final sound in ${item.word}?`, focusText: item.word, visual: item.visual, answer: item.last,
      options: choices(item.last, LETTERS, random), skill: 'final phoneme and letter',
      explanation: `${item.word} ends with the ${item.last} sound. Stretch the word and listen to the end.`,
    };
  },
  () => {
    const item = CVC_WORDS[Math.floor(random() * CVC_WORDS.length)];
    return {
      prompt: `Blend these sounds: ${item.sounds}. Which word do they make?`, focusText: item.sounds, visual: 'word', answer: item.word,
      options: choices(item.word, CVC_WORDS.map(word => word.word), random), skill: 'CVC sound blending',
      explanation: `${item.sounds} blend together to make ${item.word}.`,
    };
  },
  () => {
    const item = CVC_WORDS[Math.floor(random() * CVC_WORDS.length)];
    const vowel = item.word[1];
    return {
      prompt: `Which vowel sound is in ${item.word}?`, focusText: item.word, visual: 'word', answer: vowel,
      options: choices(vowel, ['a', 'e', 'i', 'o', 'u'], random), skill: 'short vowel sounds',
      explanation: `${item.word} has the short ${vowel} sound in the middle.`,
    };
  },
  () => {
    const answer = SIGHT_WORDS[Math.floor(random() * SIGHT_WORDS.length)];
    return {
      prompt: `Find the sight word ${answer}.`, focusText: answer, visual: 'word', answer,
      options: choices(answer, SIGHT_WORDS, random), skill: 'high-frequency words',
      explanation: `${answer} is a word readers learn to recognize quickly.`,
    };
  },
  () => {
    const item = WORDS[Math.floor(random() * 6)];
    return {
      prompt: `Which word rhymes with ${item.word}?`, focusText: item.word, visual: item.visual, answer: item.rhyme,
      options: choices(item.rhyme, WORDS.map(word => word.rhyme), random), skill: 'produce and recognize rhyme',
      explanation: `${item.word} and ${item.rhyme} have the same ending sound.`,
    };
  },
  () => ({
    prompt: 'Read: The red ball rolled under the chair. Where is the ball?', focusText: 'The red ball rolled under the chair.', visual: 'word', answer: 'under the chair',
    options: choices('under the chair', ['in the tree', 'on the moon', 'inside a cup', 'by the bus'], random), skill: 'sentence comprehension',
    explanation: 'The sentence says the ball rolled under the chair. The words in the sentence are the evidence.',
  }),
  () => ({
    prompt: 'Read: Ava plants a seed. Next, she gives it water. What happens next?', focusText: 'Ava plants a seed. Next, she gives it water.', visual: 'word', answer: 'She gives the seed water',
    options: choices('She gives the seed water', ['She rides a bus', 'She closes a book', 'She feeds a fish', 'She takes a nap'], random), skill: 'sequence events',
    explanation: 'The word next tells us that giving the seed water happens after planting it.',
  }),
];

export const generateEarlyLiteracyQuestion = (level: 1 | 2, step: number): EarlyLiteracyQuestion => {
  const random = createSeededRandom(getDailySeed(`early-literacy-grade-${level}`, step));
  const factories = level === 1 ? preKFactories(random) : kindergartenFactories(random);
  const question = factories[Math.floor(random() * factories.length)]();
  return {
    ...question,
    id: `early-reading-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    prompt: `${PHASES[step % PHASES.length]}: ${question.prompt}`,
  };
};
