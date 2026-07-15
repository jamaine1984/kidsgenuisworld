import { createSeededRandom, getDailySeed } from '../dailyRotation';
import { EarlyLiteracyQuestion } from './earlyLiteracy';

export type ElementaryLiteracyLevel = 3 | 4;

const PHASES = ['Warm-up', 'Teacher model', 'Try together', 'Try with less help', 'Spiral review', 'Exit ticket'];

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const choices = (answer: string, distractors: string[], random: () => number): string[] => (
  shuffle([answer, ...shuffle([...new Set(distractors)].filter(item => item.toLowerCase() !== answer.toLowerCase()), random).slice(0, 3)], random)
);

type QuestionSeed = Omit<EarlyLiteracyQuestion, 'id'>;

const firstGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => {
    const words = [
      ['ship', 'sh'], ['chat', 'ch'], ['thin', 'th'], ['whip', 'wh'],
    ];
    const [word, answer] = words[Math.floor(random() * words.length)];
    return {
      prompt: `Which letters spell the first sound in ${word}?`, focusText: word, visual: 'word', answer,
      options: choices(answer, ['sh', 'ch', 'th', 'wh', 'ph'], random), skill: 'consonant digraphs',
      explanation: `${word} begins with ${answer}. The two letters work together to make one sound.`,
    };
  },
  () => {
    const words = [
      ['stop', 'st'], ['frog', 'fr'], ['clap', 'cl'], ['drum', 'dr'], ['plant', 'pl'],
    ];
    const [word, answer] = words[Math.floor(random() * words.length)];
    return {
      prompt: `Which beginning blend do you hear in ${word}?`, focusText: word, visual: 'word', answer,
      options: choices(answer, ['st', 'fr', 'cl', 'dr', 'pl', 'br'], random), skill: 'beginning blends',
      explanation: `${word} begins with the blend ${answer}. You can hear both consonant sounds.`,
    };
  },
  () => {
    const pairs = [
      ['cap', 'cape'], ['kit', 'kite'], ['hop', 'hope'], ['cub', 'cube'],
    ];
    const [shortWord, answer] = pairs[Math.floor(random() * pairs.length)];
    return {
      prompt: `Add silent e to ${shortWord}. Which new word has a long vowel sound?`, focusText: `${shortWord} → ?`, visual: 'word', answer,
      options: choices(answer, pairs.flat(), random), skill: 'silent-e long vowels',
      explanation: `The silent e changes the vowel sound. ${shortWord} becomes ${answer}.`,
    };
  },
  () => {
    const groups = [
      ['rain', 'ai'], ['seed', 'ee'], ['boat', 'oa'], ['play', 'ay'],
    ];
    const [word, answer] = groups[Math.floor(random() * groups.length)];
    return {
      prompt: `Which vowel team is in ${word}?`, focusText: word, visual: 'word', answer,
      options: choices(answer, ['ai', 'ee', 'oa', 'ay', 'ea'], random), skill: 'common vowel teams',
      explanation: `${word} contains the vowel team ${answer}. Those letters work together to make the vowel sound.`,
    };
  },
  () => {
    const words = [
      ['jumped', 'jump'], ['helping', 'help'], ['cats', 'cat'], ['wishes', 'wish'],
    ];
    const [word, answer] = words[Math.floor(random() * words.length)];
    return {
      prompt: `What is the base word in ${word}?`, focusText: word, visual: 'word', answer,
      options: choices(answer, ['jump', 'help', 'cat', 'wish', 'play'], random), skill: 'base words and endings',
      explanation: `Remove the ending from ${word}. The base word is ${answer}.`,
    };
  },
  () => {
    const sentences = [
      ['The small rabbit dashed under the gate.', 'ran quickly'],
      ['Nia felt joyful when her seed sprouted.', 'very happy'],
      ['The enormous box would not fit on the shelf.', 'very large'],
      ['Sam whispered so the baby could sleep.', 'spoke softly'],
    ];
    const [sentence, answer] = sentences[Math.floor(random() * sentences.length)];
    return {
      prompt: `Read: ${sentence} What does the bold idea mean?`, focusText: sentence, visual: 'word', answer,
      options: choices(answer, ['ran quickly', 'very happy', 'very large', 'spoke softly', 'felt angry'], random), skill: 'vocabulary in context',
      explanation: `The other words in the sentence help show that the phrase means ${answer}.`,
    };
  },
  () => ({
    prompt: 'Read: First, Leo filled a pot with soil. Next, he planted a bean. Last, he added water. What happened second?',
    focusText: 'First: soil. Next: bean. Last: water.', visual: 'word', answer: 'Leo planted a bean',
    options: choices('Leo planted a bean', ['Leo filled the pot with soil', 'Leo added water', 'Leo picked a flower', 'Leo emptied the pot'], random),
    skill: 'sequence of events', explanation: 'The word next marks the second event: Leo planted a bean.',
  }),
  () => ({
    prompt: 'Read: Ana built a paper bridge. It bent under three blocks, so she folded the paper and tested it again. What problem did Ana solve?',
    focusText: 'Ana tested and improved a paper bridge.', visual: 'word', answer: 'The bridge bent under the blocks',
    options: choices('The bridge bent under the blocks', ['Ana lost all the paper', 'The blocks were too colorful', 'Ana forgot her name', 'The room was too bright'], random),
    skill: 'story problem and solution', explanation: 'The bridge bending was the problem. Folding the paper was Ana’s solution.',
  }),
  () => ({
    prompt: 'Read: Bees visit flowers to collect nectar. As they move, pollen sticks to their bodies and reaches other flowers. What is the main idea?',
    focusText: 'Bees, nectar, and pollen', visual: 'word', answer: 'Bees help move pollen between flowers',
    options: choices('Bees help move pollen between flowers', ['All flowers are the same color', 'Bees sleep inside every flower', 'Nectar is made of paper', 'Pollen only moves in rain'], random),
    skill: 'informational main idea', explanation: 'Both sentences explain how bees move pollen while visiting flowers.',
  }),
  () => ({
    prompt: 'Read: Kai packed boots and an umbrella. Dark clouds covered the sky. What can you infer?',
    focusText: 'Boots + umbrella + dark clouds', visual: 'word', answer: 'Rain may be coming',
    options: choices('Rain may be coming', ['It is time for bed', 'Kai is going swimming', 'The day is very dry', 'Snow is melting indoors'], random),
    skill: 'simple inference', explanation: 'Boots, an umbrella, and dark clouds are clues that rain may be coming.',
  }),
  () => ({
    prompt: 'Read: Turtles have shells that protect their bodies. Which detail tells what shells do?',
    focusText: 'Turtles have protective shells.', visual: 'word', answer: 'They protect turtle bodies',
    options: choices('They protect turtle bodies', ['They make turtles fly', 'They grow on trees', 'They are made of water', 'They help turtles sing'], random),
    skill: 'key details', explanation: 'The sentence directly says that shells protect turtle bodies.',
  }),
  () => ({
    prompt: 'Which sentence is complete?', focusText: 'A complete sentence names who or what and tells what happened.', visual: 'word',
    answer: 'The bright kite flew above the park.',
    options: choices('The bright kite flew above the park.', ['Above the park.', 'The bright kite.', 'Flew very high.', 'And the blue string.'], random),
    skill: 'sentence fluency', explanation: 'The sentence names the bright kite and tells that it flew above the park.',
  }),
];

const secondGradeFactories = (random: () => number): Array<() => QuestionSeed> => [
  () => {
    const words = [
      ['storm', 'or'], ['bird', 'ir'], ['turn', 'ur'], ['park', 'ar'], ['fern', 'er'],
    ];
    const [word, answer] = words[Math.floor(random() * words.length)];
    return {
      prompt: `Which r-controlled vowel pattern is in ${word}?`, focusText: word, visual: 'word', answer,
      options: choices(answer, ['or', 'ir', 'ur', 'ar', 'er'], random), skill: 'r-controlled vowels',
      explanation: `${word} contains ${answer}. The letter r changes the vowel sound.`,
    };
  },
  () => {
    const words = [
      ['replay', 'play again'], ['unkind', 'not kind'], ['preview', 'view before'], ['disagree', 'not agree'],
    ];
    const [word, answer] = words[Math.floor(random() * words.length)];
    return {
      prompt: `What does ${word} mean?`, focusText: word, visual: 'word', answer,
      options: choices(answer, ['play again', 'not kind', 'view before', 'not agree', 'play slowly'], random), skill: 'prefix meaning',
      explanation: `The prefix changes the base word. ${word} means ${answer}.`,
    };
  },
  () => {
    const words = [
      ['careful', 'full of care'], ['hopeful', 'full of hope'], ['fearless', 'without fear'], ['slowly', 'in a slow way'],
    ];
    const [word, answer] = words[Math.floor(random() * words.length)];
    return {
      prompt: `Use the suffix to find the meaning of ${word}.`, focusText: word, visual: 'word', answer,
      options: choices(answer, ['full of care', 'full of hope', 'without fear', 'in a slow way', 'before care'], random), skill: 'suffix meaning',
      explanation: `The suffix gives a meaning clue. ${word} means ${answer}.`,
    };
  },
  () => {
    const words = [
      ['sunset', 'sun + set'], ['raincoat', 'rain + coat'], ['playground', 'play + ground'], ['notebook', 'note + book'],
    ];
    const [word, answer] = words[Math.floor(random() * words.length)];
    return {
      prompt: `Which two smaller words make ${word}?`, focusText: word, visual: 'word', answer,
      options: choices(answer, ['sun + set', 'rain + coat', 'play + ground', 'note + book', 'snow + ball'], random), skill: 'compound words',
      explanation: `${word} is a compound word made from ${answer}.`,
    };
  },
  () => ({
    prompt: 'Read: The trail was narrow, so the hikers walked in a single line. What does narrow mean?',
    focusText: 'The trail was narrow.', visual: 'word', answer: 'not wide',
    options: choices('not wide', ['very loud', 'full of water', 'easy to lift', 'brightly colored'], random),
    skill: 'context clues', explanation: 'Walking in a single line is a clue that narrow means not wide.',
  }),
  () => ({
    prompt: 'Read: A cactus stores water in its thick stem. Its waxy covering slows water loss. These features help it live in dry places. What is the main idea?',
    focusText: 'How a cactus survives', visual: 'word', answer: 'Cactus features help it save water',
    options: choices('Cactus features help it save water', ['Every cactus grows in snow', 'Cactus stems are made of wax', 'Dry places have too much water', 'All plants have thick stems'], random),
    skill: 'main idea and supporting details', explanation: 'The details about the thick stem and waxy covering both show how a cactus saves water.',
  }),
  () => ({
    prompt: 'Read: Mina checked the weather, packed a jacket, and tied down the tent. Wind rattled the trees that night. Which detail best shows Mina prepared?',
    focusText: 'Mina prepares for a windy night.', visual: 'word', answer: 'She tied down the tent',
    options: choices('She tied down the tent', ['The trees rattled', 'Night came after sunset', 'The jacket had a zipper', 'The tent was green'], random),
    skill: 'text evidence', explanation: 'Tying down the tent is direct evidence that Mina prepared for wind.',
  }),
  () => ({
    prompt: 'Read: The sidewalk was wet, but the sky was clear. Drops sparkled on every leaf. What most likely happened earlier?',
    focusText: 'Wet sidewalk + drops on leaves', visual: 'word', answer: 'It rained',
    options: choices('It rained', ['The leaves were painted', 'A snowstorm began', 'The sidewalk disappeared', 'The sun never rose'], random),
    skill: 'inference with evidence', explanation: 'A wet sidewalk and drops on leaves are evidence that it rained earlier.',
  }),
  () => ({
    prompt: 'Read: The temperature dropped below freezing, so water in the tray became ice. What is the cause?',
    focusText: 'Temperature drops → water freezes', visual: 'word', answer: 'The temperature dropped below freezing',
    options: choices('The temperature dropped below freezing', ['The water became ice', 'The tray was square', 'Someone opened a book', 'The room had a window'], random),
    skill: 'cause and effect', explanation: 'The temperature dropping is the cause. The water becoming ice is the effect.',
  }),
  () => ({
    prompt: 'Read: Frogs and fish both live near water. Frogs can live on land too, but fish stay in water. How are they different?',
    focusText: 'Frogs compared with fish', visual: 'word', answer: 'Frogs can live on land, but fish stay in water',
    options: choices('Frogs can live on land, but fish stay in water', ['Both need water', 'Both are animals', 'Both can move', 'Both live on Earth'], random),
    skill: 'compare and contrast', explanation: 'The difference is that frogs can live on land while fish stay in water.',
  }),
  () => ({
    prompt: 'Read: First rinse the berries. Next place them in a bowl. Then add yogurt. What should happen before adding yogurt?',
    focusText: 'Rinse → bowl → yogurt', visual: 'word', answer: 'Place the berries in a bowl',
    options: choices('Place the berries in a bowl', ['Eat the empty bowl', 'Freeze the yogurt', 'Throw away the berries', 'Wash the table tomorrow'], random),
    skill: 'procedural sequence', explanation: 'The sequence says to place the berries in a bowl immediately before adding yogurt.',
  }),
  () => ({
    prompt: 'Read: Remember to turn off the faucet while brushing. This saves clean water for everyone. Why did the author write this?',
    focusText: 'Turn off the faucet to save water.', visual: 'word', answer: 'To persuade readers to save water',
    options: choices('To persuade readers to save water', ['To tell a fantasy story', 'To describe a pet', 'To explain how clouds form', 'To make readers laugh at a joke'], random),
    skill: 'author purpose', explanation: 'The author gives a reason and asks readers to act, so the purpose is to persuade.',
  }),
];

export const generateElementaryLiteracyQuestion = (level: ElementaryLiteracyLevel, step: number): EarlyLiteracyQuestion => {
  const random = createSeededRandom(getDailySeed(`elementary-literacy-grade-${level}`, step));
  const factories = level === 3 ? firstGradeFactories(random) : secondGradeFactories(random);
  const question = factories[Math.floor(random() * factories.length)]();
  return {
    ...question,
    id: `elementary-reading-${level}-${step}-${question.skill.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    prompt: `${PHASES[step % PHASES.length]}: ${question.prompt}`,
  };
};
