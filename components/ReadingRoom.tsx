import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Star, Type, Image as ImageIcon, Volume2, Mic2, Sparkles, Book, Ear, X } from 'lucide-react';
import { playSuccess, playWrongBuzzer, playPop, speak, speakAsync, speakCorrect, speakWrong, speakMultipleChoiceQuestion } from '../services/audioService';
import { pickDailyItem, shuffleDailyItems } from '../services/dailyRotation';
import { EarlyReadingLesson } from './reading/EarlyReadingLesson';

interface ReadingRoomProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  onAttempt?: (meta: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }, correct: boolean) => void;
  level: number; // 1-7 corresponds to grade levels
}

// Enhanced Vocabulary with grade levels and more words
export const VOCABULARY = [
  // PRE-K (Level 1) - Simple CVC words
  { word: 'Cat', emoji: '🐱', level: 1, rhyme: 'Bat', segments: ['C','a','t'], sentence: 'The cat is fluffy.' },
  { word: 'Dog', emoji: '🐶', level: 1, rhyme: 'Log', segments: ['D','o','g'], sentence: 'The dog runs fast.' },
  { word: 'Pig', emoji: '🐷', level: 1, rhyme: 'Wig', segments: ['P','i','g'], sentence: 'The pig is pink.' },
  { word: 'Sun', emoji: '☀️', level: 1, rhyme: 'Run', segments: ['S','u','n'], sentence: 'The sun is hot.' },
  { word: 'Bus', emoji: '🚌', level: 1, rhyme: 'Us', segments: ['B','u','s'], sentence: 'I ride the bus.' },
  { word: 'Bed', emoji: '🛏️', level: 1, rhyme: 'Red', segments: ['B','e','d'], sentence: 'I sleep in bed.' },
  { word: 'Hat', emoji: '🎩', level: 1, rhyme: 'Bat', segments: ['H','a','t'], sentence: 'I wear a hat.' },
  { word: 'Pen', emoji: '🖊️', level: 1, rhyme: 'Hen', segments: ['P','e','n'], sentence: 'I write with a pen.' },
  { word: 'Mop', emoji: '🧹', level: 1, rhyme: 'Top', segments: ['M','o','p'], sentence: 'I clean with a mop.' },
  { word: 'Cup', emoji: '🥤', level: 1, rhyme: 'Up', segments: ['C','u','p'], sentence: 'I drink from a cup.' },

  // KINDERGARTEN (Level 2) - Blends/4-letter words
  { word: 'Frog', emoji: '🐸', level: 2, rhyme: 'Log', segments: ['Fr','o','g'], sentence: 'The frog can jump.' },
  { word: 'Duck', emoji: '🦆', level: 2, rhyme: 'Truck', segments: ['D','u','ck'], sentence: 'The duck says quack.' },
  { word: 'Book', emoji: '📖', level: 2, rhyme: 'Cook', segments: ['B','oo','k'], sentence: 'I read a book.' },
  { word: 'Ball', emoji: '⚽', level: 2, rhyme: 'Call', segments: ['B','a','ll'], sentence: 'I throw the ball.' },
  { word: 'Moon', emoji: '🌙', level: 2, rhyme: 'Spoon', segments: ['M','oo','n'], sentence: 'The moon shines at night.' },
  { word: 'Tree', emoji: '🌳', level: 2, rhyme: 'Bee', segments: ['Tr','ee'], sentence: 'The tree is tall.' },
  { word: 'Star', emoji: '⭐', level: 2, rhyme: 'Car', segments: ['St','ar'], sentence: 'I see a star.' },
  { word: 'Fish', emoji: '🐟', level: 2, rhyme: 'Dish', segments: ['F','i','sh'], sentence: 'The fish can swim.' },
  { word: 'Cake', emoji: '🎂', level: 2, rhyme: 'Lake', segments: ['C','a','ke'], sentence: 'I eat cake.' },
  { word: 'Ring', emoji: '💍', level: 2, rhyme: 'King', segments: ['R','i','ng'], sentence: 'She has a ring.' },

  // FIRST GRADE (Level 3) - Digraphs/Longer words
  { word: 'Sheep', emoji: '🐑', level: 3, rhyme: 'Jeep', segments: ['Sh','ee','p'], sentence: 'The sheep has wool.' },
  { word: 'Train', emoji: '🚂', level: 3, rhyme: 'Rain', segments: ['Tr','ai','n'], sentence: 'The train goes choo choo!' },
  { word: 'House', emoji: '🏠', level: 3, rhyme: 'Mouse', segments: ['H','ou','se'], sentence: 'I live in a house.' },
  { word: 'Grape', emoji: '🍇', level: 3, rhyme: 'Tape', segments: ['Gr','a','pe'], sentence: 'I like grapes.' },
  { word: 'Cloud', emoji: '☁️', level: 3, rhyme: 'Loud', segments: ['Cl','ou','d'], sentence: 'The cloud is white.' },
  { word: 'Chair', emoji: '🪑', level: 3, rhyme: 'Bear', segments: ['Ch','ai','r'], sentence: 'I sit on a chair.' },
  { word: 'Whale', emoji: '🐋', level: 3, rhyme: 'Tail', segments: ['Wh','a','le'], sentence: 'The whale is huge!' },
  { word: 'Bread', emoji: '🍞', level: 3, rhyme: 'Head', segments: ['Br','ea','d'], sentence: 'I eat bread.' },
  { word: 'Snake', emoji: '🐍', level: 3, rhyme: 'Lake', segments: ['Sn','a','ke'], sentence: 'The snake slithers.' },
  { word: 'Plane', emoji: '✈️', level: 3, rhyme: 'Lane', segments: ['Pl','a','ne'], sentence: 'The plane can fly.' },

  // SECOND GRADE (Level 4) - Multi-syllable words
  { word: 'Robot', emoji: '🤖', level: 4, rhyme: 'Dot', segments: ['Ro','bot'], sentence: 'The robot can dance!' },
  { word: 'Apple', emoji: '🍎', level: 4, rhyme: 'Snapple', segments: ['Ap','ple'], sentence: 'An apple a day keeps the doctor away.' },
  { word: 'Monkey', emoji: '🐒', level: 4, rhyme: 'Funky', segments: ['Mon','key'], sentence: 'The monkey swings in trees.' },
  { word: 'Pizza', emoji: '🍕', level: 4, rhyme: 'Lisa', segments: ['Piz','za'], sentence: 'I love eating pizza.' },
  { word: 'Tiger', emoji: '🐯', level: 4, rhyme: 'Liger', segments: ['Ti','ger'], sentence: 'The tiger has stripes.' },
  { word: 'Butter', emoji: '🧈', level: 4, rhyme: 'Mutter', segments: ['But','ter'], sentence: 'I put butter on toast.' },
  { word: 'Spider', emoji: '🕷️', level: 4, rhyme: 'Cider', segments: ['Spi','der'], sentence: 'The spider spins a web.' },
  { word: 'Dragon', emoji: '🐉', level: 4, rhyme: 'Wagon', segments: ['Dra','gon'], sentence: 'The dragon breathes fire!' },
  { word: 'Rabbit', emoji: '🐰', level: 4, rhyme: 'Habit', segments: ['Rab','bit'], sentence: 'The rabbit hops fast.' },
  { word: 'Pumpkin', emoji: '🎃', level: 4, rhyme: 'Munchkin', segments: ['Pump','kin'], sentence: 'We carve a pumpkin.' },

  // THIRD GRADE (Level 5) - More complex
  { word: 'Rocket', emoji: '🚀', level: 5, rhyme: 'Pocket', segments: ['Roc','ket'], sentence: 'The rocket flies to space.' },
  { word: 'Rainbow', emoji: '🌈', level: 5, rhyme: 'Brain Show', segments: ['Rain','bow'], sentence: 'The rainbow has many colors.' },
  { word: 'Dolphin', emoji: '🐬', level: 5, rhyme: 'Golfin', segments: ['Dol','phin'], sentence: 'The dolphin is very smart.' },
  { word: 'Penguin', emoji: '🐧', level: 5, rhyme: 'Fin', segments: ['Pen','guin'], sentence: 'The penguin lives in the cold.' },
  { word: 'Tornado', emoji: '🌪️', level: 5, rhyme: 'Avocado', segments: ['Tor','na','do'], sentence: 'A tornado is very strong.' },
  { word: 'Thunder', emoji: '⚡', level: 5, rhyme: 'Wonder', segments: ['Thun','der'], sentence: 'Thunder is loud!' },
  { word: 'Volcano', emoji: '🌋', level: 5, rhyme: 'No', segments: ['Vol','ca','no'], sentence: 'The volcano can erupt.' },
  { word: 'Crystal', emoji: '💎', level: 5, rhyme: 'Pistol', segments: ['Crys','tal'], sentence: 'The crystal sparkles.' },
  { word: 'Bicycle', emoji: '🚲', level: 5, rhyme: 'Icicle', segments: ['Bi','cy','cle'], sentence: 'I ride my bicycle to school.' },
  { word: 'Pancake', emoji: '🥞', level: 5, rhyme: 'Awake', segments: ['Pan','cake'], sentence: 'I eat pancakes for breakfast.' },

  // FOURTH GRADE (Level 6) - Advanced
  { word: 'Treasure', emoji: '💰', level: 6, rhyme: 'Measure', segments: ['Trea','sure'], sentence: 'Pirates look for treasure.' },
  { word: 'Adventure', emoji: '🗺️', level: 6, rhyme: 'Venture', segments: ['Ad','ven','ture'], sentence: 'I love going on adventures.' },
  { word: 'Dinosaur', emoji: '🦕', level: 6, rhyme: 'More', segments: ['Di','no','saur'], sentence: 'Dinosaurs lived long ago.' },
  { word: 'Astronaut', emoji: '👨‍🚀', level: 6, rhyme: 'Caught', segments: ['As','tro','naut'], sentence: 'The astronaut went to space.' },
  { word: 'Microscope', emoji: '🔬', level: 6, rhyme: 'Scope', segments: ['Mi','cro','scope'], sentence: 'I look through the microscope.' },
  { word: 'Telescope', emoji: '🔭', level: 6, rhyme: 'Hope', segments: ['Tel','e','scope'], sentence: 'I see stars with my telescope.' },
  { word: 'Hurricane', emoji: '🌀', level: 6, rhyme: 'Pain', segments: ['Hur','ri','cane'], sentence: 'A hurricane is a big storm.' },
  { word: 'Butterfly', emoji: '🦋', level: 6, rhyme: 'Fly', segments: ['But','ter','fly'], sentence: 'The butterfly is beautiful.' },
  { word: 'Strawberry', emoji: '🍓', level: 6, rhyme: 'Very', segments: ['Straw','ber','ry'], sentence: 'I picked a strawberry.' },
  { word: 'Crocodile', emoji: '🐊', level: 6, rhyme: 'Smile', segments: ['Croc','o','dile'], sentence: 'The crocodile has sharp teeth.' },

  // FIFTH GRADE (Level 7) - Most advanced
  { word: 'Encyclopedia', emoji: '📚', level: 7, rhyme: 'Media', segments: ['En','cy','clo','pe','di','a'], sentence: 'I learn from the encyclopedia.' },
  { word: 'Constellation', emoji: '✨', level: 7, rhyme: 'Nation', segments: ['Con','stel','la','tion'], sentence: 'Orion is a constellation.' },
  { word: 'Hippopotamus', emoji: '🦛', level: 7, rhyme: 'Famous', segments: ['Hip','po','pot','a','mus'], sentence: 'The hippopotamus is heavy.' },
  { word: 'Metamorphosis', emoji: '🦋', level: 7, rhyme: 'This', segments: ['Met','a','mor','pho','sis'], sentence: 'A caterpillar goes through metamorphosis.' },
  { word: 'Archaeology', emoji: '🏺', level: 7, rhyme: 'Ology', segments: ['Ar','chae','ol','o','gy'], sentence: 'Archaeology studies old things.' },
  { word: 'Photosynthesis', emoji: '🌱', level: 7, rhyme: 'This', segments: ['Pho','to','syn','the','sis'], sentence: 'Plants do photosynthesis.' },
  { word: 'Camouflage', emoji: '🦎', level: 7, rhyme: 'Garage', segments: ['Cam','ou','flage'], sentence: 'The lizard uses camouflage.' },
  { word: 'Temperature', emoji: '🌡️', level: 7, rhyme: 'Nature', segments: ['Tem','per','a','ture'], sentence: 'The temperature is warm today.' },
  { word: 'Experiment', emoji: '🧪', level: 7, rhyme: 'Meant', segments: ['Ex','per','i','ment'], sentence: 'We did a science experiment.' },
  { word: 'Civilization', emoji: '🏛️', level: 7, rhyme: 'Nation', segments: ['Civ','i','li','za','tion'], sentence: 'Ancient civilizations built pyramids.' },
  { word: 'Jam', emoji: 'JAM', level: 1, rhyme: 'Ham', segments: ['J','a','m'], sentence: 'Jam is on the toast.' },
  { word: 'Net', emoji: 'NET', level: 1, rhyme: 'Pet', segments: ['N','e','t'], sentence: 'The net is by the ball.' },
  { word: 'Fox', emoji: 'FOX', level: 1, rhyme: 'Box', segments: ['F','o','x'], sentence: 'The fox runs fast.' },
  { word: 'Map', emoji: 'MAP', level: 1, rhyme: 'Cap', segments: ['M','a','p'], sentence: 'The map shows the park.' },
  { word: 'Log', emoji: 'LOG', level: 1, rhyme: 'Dog', segments: ['L','o','g'], sentence: 'The log is on the path.' },
  { word: 'Ship', emoji: 'SHIP', level: 2, rhyme: 'Chip', segments: ['Sh','i','p'], sentence: 'The ship sails away.' },
  { word: 'Clock', emoji: 'CLOCK', level: 2, rhyme: 'Rock', segments: ['Cl','o','ck'], sentence: 'The clock shows time.' },
  { word: 'Brush', emoji: 'BRUSH', level: 2, rhyme: 'Crush', segments: ['Br','u','sh'], sentence: 'I use a brush to paint.' },
  { word: 'Nest', emoji: 'NEST', level: 2, rhyme: 'Best', segments: ['N','e','st'], sentence: 'The bird has a nest.' },
  { word: 'Light', emoji: 'LIGHT', level: 2, rhyme: 'Bright', segments: ['L','igh','t'], sentence: 'The light is bright.' },
  { word: 'Teacher', emoji: 'TEACH', level: 3, rhyme: 'Creature', segments: ['Teach','er'], sentence: 'The teacher reads a story.' },
  { word: 'Garden', emoji: 'GARDEN', level: 3, rhyme: 'Pardon', segments: ['Gar','den'], sentence: 'The garden has flowers.' },
  { word: 'Window', emoji: 'WINDOW', level: 3, rhyme: 'Wind blow', segments: ['Win','dow'], sentence: 'Rain taps the window.' },
  { word: 'Puzzle', emoji: 'PUZZLE', level: 3, rhyme: 'Muzzle', segments: ['Puz','zle'], sentence: 'The puzzle has many pieces.' },
  { word: 'Pocket', emoji: 'POCKET', level: 3, rhyme: 'Rocket', segments: ['Pock','et'], sentence: 'I put a shell in my pocket.' },
  { word: 'Measure', emoji: 'RULER', level: 4, rhyme: 'Treasure', segments: ['Mea','sure'], sentence: 'We measure the table.' },
  { word: 'Compare', emoji: 'SCALE', level: 4, rhyme: 'Chair', segments: ['Com','pare'], sentence: 'Compare the two pictures.' },
  { word: 'Reason', emoji: 'WHY', level: 4, rhyme: 'Season', segments: ['Rea','son'], sentence: 'Give a reason for your answer.' },
  { word: 'Habitat', emoji: 'POND', level: 4, rhyme: 'Cat', segments: ['Hab','i','tat'], sentence: 'A pond is a habitat.' },
  { word: 'Compass', emoji: 'NORTH', level: 4, rhyme: 'Campus', segments: ['Com','pass'], sentence: 'A compass helps with direction.' },
  { word: 'Evidence', emoji: 'CLUE', level: 5, rhyme: 'Residence', segments: ['Ev','i','dence'], sentence: 'Evidence supports an answer.' },
  { word: 'Strategy', emoji: 'PLAN', level: 5, rhyme: 'Energy', segments: ['Strat','e','gy'], sentence: 'A strategy helps you solve.' },
  { word: 'Equation', emoji: 'MATH', level: 5, rhyme: 'Station', segments: ['E','qua','tion'], sentence: 'An equation shows equal values.' },
  { word: 'Forecast', emoji: 'SKY', level: 5, rhyme: 'Past', segments: ['Fore','cast'], sentence: 'A forecast predicts weather.' },
  { word: 'Culture', emoji: 'WORLD', level: 5, rhyme: 'Vulture', segments: ['Cul','ture'], sentence: 'Culture includes traditions.' },
  { word: 'Analyze', emoji: 'THINK', level: 6, rhyme: 'Wise', segments: ['An','a','lyze'], sentence: 'Analyze the clues before answering.' },
  { word: 'Argument', emoji: 'CLAIM', level: 6, rhyme: 'Parliament', segments: ['Ar','gu','ment'], sentence: 'An argument needs evidence.' },
  { word: 'Structure', emoji: 'BUILD', level: 6, rhyme: 'Picture', segments: ['Struc','ture'], sentence: 'A bridge needs a strong structure.' },
  { word: 'Migration', emoji: 'MOVE', level: 6, rhyme: 'Nation', segments: ['Mi','gra','tion'], sentence: 'Migration means moving from place to place.' },
  { word: 'Resource', emoji: 'WATER', level: 6, rhyme: 'Course', segments: ['Re','source'], sentence: 'Water is an important resource.' },
  { word: 'Hypothesis', emoji: 'TEST', level: 7, rhyme: 'Emphasis', segments: ['Hy','poth','e','sis'], sentence: 'A hypothesis is a testable idea.' },
  { word: 'Democracy', emoji: 'VOTE', level: 7, rhyme: 'Policy', segments: ['De','moc','ra','cy'], sentence: 'Democracy gives people a voice.' },
  { word: 'Renewable', emoji: 'WIND', level: 7, rhyme: 'Doable', segments: ['Re','new','a','ble'], sentence: 'Wind can be renewable energy.' },
  { word: 'Perspective', emoji: 'VIEW', level: 7, rhyme: 'Detective', segments: ['Per','spec','tive'], sentence: 'Perspective is a way of seeing.' },
  { word: 'Innovation', emoji: 'IDEA', level: 7, rhyme: 'Creation', segments: ['In','no','va','tion'], sentence: 'Innovation means creating a better way.' },
];

const READING_EXPANSION_WORDS = [
  ['Dad', 'DAD', 1, 'Sad'], ['Mom', 'MOM', 1, 'Tom'], ['Sit', 'SIT', 1, 'Fit'], ['Run', 'RUN', 1, 'Sun'], ['Top', 'TOP', 1, 'Hop'],
  ['Bell', 'BELL', 2, 'Shell'], ['Duck', 'DUCK', 2, 'Truck'], ['Shop', 'SHOP', 2, 'Stop'], ['Hill', 'HILL', 2, 'Will'], ['Rain', 'RAIN', 2, 'Train'],
  ['Helper', 'HELP', 3, 'Yelper'], ['Basket', 'BASKET', 3, 'Task it'], ['Market', 'MARKET', 3, 'Park it'], ['Garden', 'GARDEN', 3, 'Pardon'], ['Rocket', 'ROCKET', 3, 'Pocket'],
  ['Measure', 'RULER', 4, 'Treasure'], ['Weather', 'SKY', 4, 'Feather'], ['Problem', 'THINK', 4, 'Solve them'], ['Compass', 'NORTH', 4, 'Campus'], ['Habitat', 'POND', 4, 'Cat'],
  ['Evidence', 'CLUE', 5, 'Residence'], ['Strategy', 'PLAN', 5, 'Energy'], ['Estimate', 'ABOUT', 5, 'Best mate'], ['Culture', 'WORLD', 5, 'Vulture'], ['System', 'GEAR', 5, 'Wisdom'],
  ['Analyze', 'THINK', 6, 'Wise'], ['Compare', 'SCALE', 6, 'Chair'], ['Structure', 'BUILD', 6, 'Picture'], ['Migration', 'MOVE', 6, 'Nation'], ['Resource', 'WATER', 6, 'Course'],
  ['Hypothesis', 'TEST', 7, 'Emphasis'], ['Democracy', 'VOTE', 7, 'Policy'], ['Renewable', 'WIND', 7, 'Doable'], ['Perspective', 'VIEW', 7, 'Detective'], ['Innovation', 'IDEA', 7, 'Creation'],
] as const;

const EXPANDED_VOCABULARY = READING_EXPANSION_WORDS.flatMap(([word, emoji, baseLevel, rhyme], index) =>
  Array.from({ length: 2 }, (_, variant) => ({
    word: variant === 0 ? word : `${word}${baseLevel <= 2 ? '' : 's'}`,
    emoji,
    level: baseLevel,
    rhyme,
    segments: word.length <= 4 ? word.split('') : word.match(/.{1,3}/g) || [word],
    sentence: variant === 0
      ? `Read the word ${word.toLowerCase()} carefully.`
      : `Use ${word.toLowerCase()} in a clear sentence.`,
    id: `expanded-word-${index + 1}-${variant + 1}`,
  }))
);

export const ALL_VOCABULARY = [...VOCABULARY, ...EXPANDED_VOCABULARY];

const PICTURE_SYMBOLS: Record<string, string> = {
  ABOUT: '🎯',
  BASKET: '🧺',
  BELL: '🔔',
  BRUSH: '🖌️',
  BUILD: '🧱',
  CLAIM: '💬',
  CLOCK: '🕒',
  CLUE: '🔎',
  DAD: '👨',
  DUCK: '🦆',
  FOX: '🦊',
  GARDEN: '🌻',
  GEAR: '⚙️',
  HELP: '🤝',
  HILL: '⛰️',
  IDEA: '💡',
  JAM: '🍓',
  LIGHT: '💡',
  LOG: '🪵',
  MAP: '🗺️',
  MARKET: '🛒',
  MATH: '➗',
  MOM: '👩',
  MOVE: '🐦',
  NEST: '🪹',
  NET: '🥅',
  NORTH: '🧭',
  PLAN: '📝',
  POCKET: '👖',
  POND: '🐸',
  PUZZLE: '🧩',
  RAIN: '🌧️',
  ROCKET: '🚀',
  RULER: '📏',
  RUN: '🏃',
  SCALE: '⚖️',
  SHIP: '🚢',
  SHOP: '🏪',
  SIT: '🪑',
  SKY: '🌤️',
  TEACH: '🧑‍🏫',
  TEST: '🧪',
  THINK: '💭',
  TOP: '🔝',
  VIEW: '👀',
  VOTE: '🗳️',
  WATER: '💧',
  WHY: '❓',
  WIND: '🌬️',
  WINDOW: '🪟',
  WORLD: '🌍',
};

const getPictureSymbol = (picture: string) => PICTURE_SYMBOLS[picture] || picture;
const getPictureLabel = (picture: string) => (
  ALL_VOCABULARY.find(item => item.emoji === picture)?.word || picture.toLowerCase()
);

type Activity = 'MATCH' | 'SPELL' | 'RHYME' | 'PHONICS' | 'COMPREHENSION';

interface ReadingPassage {
  id: string;
  level: number;
  title: string;
  passage: string;
  question: string;
  answer: string;
  options: string[];
  skill: string;
}

export const READING_PASSAGES: ReadingPassage[] = [
  { id: 'pk-picture-walk', level: 1, title: 'The Red Hat', passage: 'Sam has a red hat. The hat is big. Sam puts it on and smiles.', question: 'What does Sam put on?', answer: 'A red hat', options: ['A red hat', 'A blue coat', 'A green shoe', 'A yellow cup'], skill: 'Remember one detail' },
  { id: 'pk-pet-nap', level: 1, title: 'Nap Time', passage: 'The dog runs. The dog gets tired. The dog naps on the rug.', question: 'Where does the dog nap?', answer: 'On the rug', options: ['On the rug', 'In a tree', 'At the store', 'Under water'], skill: 'Find the setting' },
  { id: 'k-garden-seed', level: 2, title: 'Mia Plants a Seed', passage: 'Mia digs a small hole. She drops in a seed and covers it with soil. Then she gives the seed water.', question: 'What does Mia do after she covers the seed?', answer: 'She gives it water', options: ['She gives it water', 'She eats lunch', 'She rides a bike', 'She paints a wall'], skill: 'Sequence events' },
  { id: 'k-library-card', level: 2, title: 'Library Day', passage: 'Ben chooses a book about rockets. He sits by the window and reads. Ben wants to learn about space.', question: 'Why does Ben choose the rocket book?', answer: 'He wants to learn about space', options: ['He wants to learn about space', 'He lost his shoes', 'He is cooking soup', 'He wants to take a nap'], skill: 'Connect reason and action' },
  { id: 'g1-rain-plan', level: 3, title: 'The Rainy Walk', passage: 'Ava wanted to walk to the park, but dark clouds covered the sky. She grabbed her raincoat before she opened the door. A few minutes later, rain began to fall.', question: 'What clue showed Ava that rain might come?', answer: 'Dark clouds covered the sky', options: ['Dark clouds covered the sky', 'The park was closed', 'Her shoes were new', 'A bird sang loudly'], skill: 'Use text evidence' },
  { id: 'g1-team-cleanup', level: 3, title: 'Team Cleanup', passage: 'The art table was messy after class. Leo picked up paper scraps while Nia washed the brushes. Soon the table was ready for the next group.', question: 'What is the main idea of this passage?', answer: 'The children worked together to clean up', options: ['The children worked together to clean up', 'The class went outside', 'Leo lost his backpack', 'Nia painted a mountain'], skill: 'Find the main idea' },
  { id: 'g2-solar-oven', level: 4, title: 'The Solar Oven', passage: 'Kai lined a box with shiny foil and placed a snack inside. He set the box in sunlight. After a while, the snack was warm because the foil helped reflect heat.', question: 'Why did Kai use shiny foil?', answer: 'To reflect heat from the sunlight', options: ['To reflect heat from the sunlight', 'To make the snack colder', 'To hide the box', 'To water a plant'], skill: 'Explain cause and effect' },
  { id: 'g2-map-route', level: 4, title: 'A Map for Grandma', passage: 'Rosa drew a map from the bus stop to her house. She added the library, the bakery, and the big oak tree. Grandma used the landmarks to find the house.', question: 'How did the landmarks help Grandma?', answer: 'They helped her follow the route', options: ['They helped her follow the route', 'They made the bus faster', 'They changed the weather', 'They cooked dinner'], skill: 'Use supporting details' },
  { id: 'g3-habitat-change', level: 5, title: 'A New Pond', passage: 'The old pond dried during a hot summer, so the frogs moved to a deeper pond nearby. The deeper pond had shade, insects, and cool water. By fall, many frogs were living there.', question: 'What made the deeper pond a good habitat?', answer: 'It had shade, insects, and cool water', options: ['It had shade, insects, and cool water', 'It was made of glass', 'It had no plants', 'It was far from everything'], skill: 'Summarize important details' },
  { id: 'g3-class-vote', level: 5, title: 'The Class Vote', passage: 'The class had enough money for one field trip. Some students wanted the science museum, while others wanted the theater. After each group gave reasons, the class voted for the science museum because it matched their unit on simple machines.', question: 'Why did the class choose the science museum?', answer: 'It matched their unit on simple machines', options: ['It matched their unit on simple machines', 'It was the closest building', 'The theater was closed forever', 'No one gave reasons'], skill: 'Evaluate reasons' },
  { id: 'g4-robot-test', level: 6, title: 'The Robot Test', passage: 'Maya programmed a robot to carry blocks across a table. On the first try, the robot stopped too early. Maya measured the distance again, changed the code, and tested the robot until it reached the basket.', question: 'What does Maya do when the first test fails?', answer: 'She measures again and changes the code', options: ['She measures again and changes the code', 'She gives up right away', 'She hides the blocks', 'She turns off the lights'], skill: 'Infer problem-solving behavior' },
  { id: 'g4-news-article', level: 6, title: 'The School Garden Article', passage: 'The school newspaper reported that the garden club harvested twenty pounds of vegetables. The article quoted students who said the garden helped them learn responsibility. It also listed plans to add herbs next spring.', question: 'Which detail supports the idea that the garden teaches responsibility?', answer: 'Students said the garden helped them learn responsibility', options: ['Students said the garden helped them learn responsibility', 'The article was in a newspaper', 'Herbs may be planted next spring', 'The vegetables weighed twenty pounds'], skill: 'Identify supporting evidence' },
  { id: 'g5-energy-claim', level: 7, title: 'Saving Energy at School', passage: 'The student council argued that classrooms should turn off lights when sunlight is enough. They explained that the change would save electricity and lower costs. They also suggested reminders near each light switch.', question: 'What claim is the student council making?', answer: 'Classrooms should turn off lights when sunlight is enough', options: ['Classrooms should turn off lights when sunlight is enough', 'All windows should stay closed', 'Students should stop using notebooks', 'The school should remove every switch'], skill: 'Identify an argument claim' },
  { id: 'g5-primary-source', level: 7, title: 'A Diary from Camp', passage: 'In her diary, Elena wrote that the first night at camp felt noisy and strange. By the third day, she knew the trail names and had two new friends. She wrote that trying something new was easier after the first step.', question: 'How does Elena change during the diary passage?', answer: 'She becomes more comfortable at camp', options: ['She becomes more comfortable at camp', 'She decides camp has no trails', 'She forgets how to write', 'She stops meeting people'], skill: 'Analyze character change' },
  { id: 'pk-blue-cup', level: 1, title: 'The Blue Cup', passage: 'I see a blue cup. The cup is on the mat. Mom fills the cup with milk.', question: 'Where is the cup?', answer: 'On the mat', options: ['On the mat', 'In a tree', 'Under a hat', 'By the moon'], skill: 'Locate one detail' },
  { id: 'pk-big-bus', level: 1, title: 'The Big Bus', passage: 'The bus is big. It stops by Sam. Sam waves and gets on.', question: 'What does Sam do?', answer: 'Gets on the bus', options: ['Gets on the bus', 'Eats a cake', 'Digs a hole', 'Paints a wall'], skill: 'Sequence one action' },
  { id: 'pk-red-bed', level: 1, title: 'Bedtime', passage: 'Kim has a red bed. She puts a book by the bed. Then Kim rests.', question: 'What does Kim put by the bed?', answer: 'A book', options: ['A book', 'A fish', 'A kite', 'A shoe'], skill: 'Remember object detail' },
  { id: 'k-lost-mitten', level: 2, title: 'The Lost Mitten', passage: 'Nora dropped her mitten on the playground. A friend saw it near the slide and gave it back. Nora said thank you.', question: 'Where was the mitten?', answer: 'Near the slide', options: ['Near the slide', 'Inside a lunchbox', 'On a bus seat', 'Under a pillow'], skill: 'Use setting detail' },
  { id: 'k-soup-day', level: 2, title: 'Soup Day', passage: 'Dad cut carrots and onions. Lina stirred the pot slowly. Soon the kitchen smelled warm and good.', question: 'What are Dad and Lina making?', answer: 'Soup', options: ['Soup', 'A kite', 'A map', 'A tower'], skill: 'Infer from details' },
  { id: 'k-cold-puppy', level: 2, title: 'The Cold Puppy', passage: 'The puppy shook after the rain. Jay got a towel and rubbed the puppy dry. The puppy curled up and slept.', question: 'Why did Jay use a towel?', answer: 'To dry the puppy', options: ['To dry the puppy', 'To feed the puppy', 'To hide a toy', 'To paint a sign'], skill: 'Explain why' },
  { id: 'g1-broken-crayon', level: 3, title: 'The Broken Crayon', passage: 'Milo pressed too hard while coloring the sun. His yellow crayon snapped in two. He used the bigger piece and finished the picture.', question: 'What problem did Milo solve?', answer: 'His crayon broke while he was coloring', options: ['His crayon broke while he was coloring', 'He lost his coat', 'The sun was too cold', 'He forgot how to draw'], skill: 'Identify problem and solution' },
  { id: 'g1-new-student', level: 3, title: 'The New Student', passage: 'A new student stood quietly by the door. Sara smiled and asked him to sit at her table. At recess, they played tag together.', question: 'What does Sara do that is kind?', answer: 'She asks the new student to sit with her', options: ['She asks the new student to sit with her', 'She closes the door', 'She hides the ball', 'She runs away'], skill: 'Character action evidence' },
  { id: 'g1-seed-journal', level: 3, title: 'Seed Journal', passage: 'On Monday, the cup had only soil. On Wednesday, a tiny green stem poked out. By Friday, two leaves opened.', question: 'What happened by Friday?', answer: 'Two leaves opened', options: ['Two leaves opened', 'The cup disappeared', 'The soil turned blue', 'The seed became a rock'], skill: 'Sequence growth events' },
  { id: 'g2-bridge-test', level: 4, title: 'Paper Bridge Test', passage: 'Nia folded one paper flat and placed coins on it. The bridge fell quickly. Then she folded the paper like a fan, and it held more coins.', question: 'What change made the bridge stronger?', answer: 'Folding the paper like a fan', options: ['Folding the paper like a fan', 'Using fewer coins', 'Turning off the light', 'Putting it in water'], skill: 'Cause and effect' },
  { id: 'g2-mystery-footprints', level: 4, title: 'Mystery Footprints', passage: 'In the garden, Omar saw small tracks near the lettuce. The leaves had little bite marks. He guessed a rabbit visited during the night.', question: 'What evidence helped Omar guess a rabbit visited?', answer: 'Small tracks and bite marks', options: ['Small tracks and bite marks', 'A loud song', 'A red umbrella', 'A missing pencil'], skill: 'Use evidence to infer' },
  { id: 'g2-clean-water', level: 4, title: 'Clean Water Job', passage: 'The class poured muddy water through cloth and sand. The water looked clearer after each layer. Their teacher said filters can trap some dirt.', question: 'What did the filter do?', answer: 'It trapped some dirt', options: ['It trapped some dirt', 'It made the water hot', 'It turned water into paper', 'It added more mud'], skill: 'Explain science detail' },
  { id: 'g3-soccer-strategy', level: 5, title: 'Soccer Strategy', passage: 'The team kept kicking straight at the goalie. During halftime, Coach Lee told them to pass to the side first. In the second half, the team found more open space.', question: 'Why did passing to the side help?', answer: 'It helped the team find more open space', options: ['It helped the team find more open space', 'It made the ball heavier', 'It stopped the game', 'It changed the weather'], skill: 'Explain strategy' },
  { id: 'g3-water-cycle-model', level: 5, title: 'Water Cycle Model', passage: 'Jada drew arrows from the ocean to clouds and from clouds back to land. She labeled evaporation, condensation, and precipitation. Her model showed how water keeps moving.', question: 'What idea did Jada model?', answer: 'How water keeps moving through the water cycle', options: ['How water keeps moving through the water cycle', 'How to bake bread', 'Why pencils break', 'Where buses park'], skill: 'Identify main idea' },
  { id: 'g3-museum-note', level: 5, title: 'Museum Note', passage: 'At the museum, Eli read that a fossil can show where an animal lived long ago. He noticed a fish fossil in rock from a dry place. Eli wondered if that place once had water.', question: 'What inference does Eli make?', answer: 'The dry place may once have had water', options: ['The dry place may once have had water', 'Fish can fly', 'Museums are always outside', 'Rocks are made of paper'], skill: 'Make an inference' },
  { id: 'g4-two-sources', level: 6, title: 'Two Weather Sources', passage: 'One article said the storm dropped two inches of rain. A local chart showed the same total for Saturday. Because both sources matched, Priya trusted the measurement.', question: 'Why did Priya trust the rain total?', answer: 'Two sources gave the same measurement', options: ['Two sources gave the same measurement', 'The chart was colorful', 'Saturday has many letters', 'The storm was quiet'], skill: 'Compare sources' },
  { id: 'g4-battery-test', level: 6, title: 'Battery Test', passage: 'Mateo tested two flashlights with different batteries. He used the same room and the same amount of time for each test. Keeping those things the same made the comparison fair.', question: 'Why did Mateo keep the room and time the same?', answer: 'To make the comparison fair', options: ['To make the comparison fair', 'To make the flashlights smaller', 'To avoid writing notes', 'To change the batteries into coins'], skill: 'Understand fair tests' },
  { id: 'g4-character-motive', level: 6, title: 'The Quiet Captain', passage: 'The team captain did not cheer loudly after the win. Instead, she thanked the other team and helped clean the field. Her actions showed respect mattered more to her than showing off.', question: 'What can you infer about the captain?', answer: 'She values respect more than showing off', options: ['She values respect more than showing off', 'She dislikes all sports', 'She forgot the score', 'She wanted to leave early'], skill: 'Infer character motivation' },
  { id: 'g5-ecosystem-balance', level: 7, title: 'Ecosystem Balance', passage: 'When the park added more native flowers, more bees visited. The bees helped pollinate plants, and the plants produced more seeds. The change affected several parts of the ecosystem.', question: 'What is the best summary?', answer: 'Adding native flowers helped bees and plants in the ecosystem', options: ['Adding native flowers helped bees and plants in the ecosystem', 'Bees stopped visiting the park', 'Seeds cannot grow in parks', 'Flowers only affect sidewalks'], skill: 'Summarize a system' },
  { id: 'g5-editorial-evidence', level: 7, title: 'Longer Library Hours', passage: 'The editorial argued that the library should stay open one hour later. It cited a survey showing many families visit after work. It also noted that homework help is busiest near closing time.', question: 'Which evidence supports longer hours?', answer: 'Many families visit after work and homework help is busiest near closing', options: ['Many families visit after work and homework help is busiest near closing', 'The library has windows', 'Books have covers', 'The editorial used short paragraphs'], skill: 'Evaluate evidence' },
  { id: 'g5-innovation-failure', level: 7, title: 'The First Prototype', passage: 'Renee built a cardboard phone stand, but it tipped over when she placed a phone on it. She measured the base, added side supports, and tested again. The second prototype stood steady.', question: 'How does failure help Renee?', answer: 'It shows what to improve in the next prototype', options: ['It shows what to improve in the next prototype', 'It proves she should stop designing', 'It makes cardboard disappear', 'It changes the phone size'], skill: 'Analyze engineering process' },
  { id: 'pk-little-map', level: 1, title: 'Little Map', passage: 'Dad draws a map. The map has a house and a tree. Kim follows the line to the tree.', question: 'What is on the map?', answer: 'A house and a tree', options: ['A house and a tree', 'A moon and a ship', 'A shoe and a hat', 'A cake and a cup'], skill: 'Remember picture details' },
  { id: 'pk-sun-hat', level: 1, title: 'Sun Hat', passage: 'The sun is hot. Jay puts on a hat. Now Jay can play outside.', question: 'Why does Jay put on a hat?', answer: 'The sun is hot', options: ['The sun is hot', 'The room is dark', 'The dog is asleep', 'The bus is blue'], skill: 'Connect why' },
  { id: 'pk-red-ball-rolls', level: 1, title: 'The Ball Rolls', passage: 'A red ball rolls under the chair. Pam looks down. She gets the ball.', question: 'Where did the ball roll?', answer: 'Under the chair', options: ['Under the chair', 'Into the sky', 'On a boat', 'Behind the moon'], skill: 'Find where' },
  { id: 'k-counting-shells', level: 2, title: 'Counting Shells', passage: 'Maya finds two shells. Leo finds three shells. They put all the shells in one cup.', question: 'What do Maya and Leo do with the shells?', answer: 'They put them in one cup', options: ['They put them in one cup', 'They throw them away', 'They bake them', 'They hide them in a shoe'], skill: 'Sequence and detail' },
  { id: 'k-kind-helper', level: 2, title: 'The Kind Helper', passage: 'A crayon falls off the table. Ben picks it up and gives it to Ana. Ana smiles.', question: 'What kind thing does Ben do?', answer: 'He gives Ana the crayon', options: ['He gives Ana the crayon', 'He breaks the table', 'He closes the book', 'He runs outside'], skill: 'Character action' },
  { id: 'k-windy-day', level: 2, title: 'Windy Day', passage: 'The wind blows leaves across the path. Sam holds his paper tightly so it will not fly away.', question: 'What clue shows it is windy?', answer: 'Leaves blow across the path', options: ['Leaves blow across the path', 'The soup is hot', 'The stars shine', 'The box is empty'], skill: 'Use weather clue' },
  { id: 'g1-lunch-count', level: 3, title: 'Lunch Count', passage: 'Mr. Atlas counted eight apples for snack. Four students chose apples first. He checked the basket to see how many apples were left.', question: 'What is Mr. Atlas checking?', answer: 'How many apples are left', options: ['How many apples are left', 'Where the bus parked', 'Why the lights are off', 'Which book is longest'], skill: 'Understand problem goal' },
  { id: 'g1-sound-test', level: 3, title: 'Sound Test', passage: 'Nina tapped a small drum softly. Then she tapped harder. The second sound was louder because the drum vibrated more.', question: 'Why was the second sound louder?', answer: 'The drum vibrated more', options: ['The drum vibrated more', 'The room got colder', 'The drum disappeared', 'The light was green'], skill: 'Cause and effect' },
  { id: 'g1-map-to-office', level: 3, title: 'Map to the Office', passage: 'The school map showed the office beside the library. Omar walked past the library and found the office door.', question: 'What landmark helped Omar?', answer: 'The library', options: ['The library', 'The playground slide', 'The lunch tray', 'The weather chart'], skill: 'Use map landmark' },
  { id: 'g2-fair-share', level: 4, title: 'Fair Share', passage: 'Twelve markers were on the art table. Four groups needed the same number of markers. Each group counted carefully so the share was fair.', question: 'What does fair share mean here?', answer: 'Each group gets the same number', options: ['Each group gets the same number', 'One group gets all markers', 'The markers turn blue', 'No one uses markers'], skill: 'Explain vocabulary in context' },
  { id: 'g2-plant-evidence', level: 4, title: 'Plant Evidence', passage: 'Lila forgot to water one plant for a week. Its leaves drooped. The watered plant stayed green and tall.', question: 'What evidence shows water matters?', answer: 'The dry plant leaves drooped', options: ['The dry plant leaves drooped', 'The pot was near a window', 'The table was brown', 'The classroom had chairs'], skill: 'Use evidence' },
  { id: 'g2-city-map', level: 4, title: 'City Map', passage: 'The map key showed a star for the library and a square for the school. Rosa followed three blocks east from the school to the library.', question: 'What did the star mean?', answer: 'Library', options: ['Library', 'School', 'River', 'Mountain'], skill: 'Read map key' },
  { id: 'g3-bus-estimate', level: 5, title: 'Bus Estimate', passage: 'There were 47 students on one bus and 51 students on another bus. Mr. Lee estimated about 100 students rode the two buses.', question: 'Why is 100 a reasonable estimate?', answer: '47 and 51 are close to 50 and 50', options: ['47 and 51 are close to 50 and 50', 'Both buses were red', 'The driver waved', 'The school was closed'], skill: 'Explain estimation' },
  { id: 'g3-food-web', level: 5, title: 'Food Web Clue', passage: 'Grasshoppers ate grass in the field. Frogs ate some grasshoppers. A hawk circled above the field looking for frogs.', question: 'What does the passage describe?', answer: 'How animals get energy from other living things', options: ['How animals get energy from other living things', 'How to draw a map', 'Why pencils need sharpening', 'Where buses stop'], skill: 'Identify science relationship' },
  { id: 'g3-two-opinions', level: 5, title: 'Two Opinions', passage: 'Tariq thought the class should plant flowers because bees need food. Mina wanted vegetables because families could eat them. Both students gave useful reasons.', question: 'How are Tariq and Mina alike?', answer: 'Both give reasons for their ideas', options: ['Both give reasons for their ideas', 'Both want the same plant', 'Both forgot the meeting', 'Both dislike gardens'], skill: 'Compare viewpoints' },
  { id: 'g4-bridge-claim', level: 6, title: 'Bridge Claim', passage: 'The team claimed that folded paper makes a stronger bridge than flat paper. Their chart showed the folded bridge held twenty coins, while the flat bridge held six.', question: 'Which evidence supports the claim?', answer: 'The folded bridge held twenty coins', options: ['The folded bridge held twenty coins', 'The chart used neat handwriting', 'The table was near a window', 'The paper was white'], skill: 'Match claim to evidence' },
  { id: 'g4-historical-letter', level: 6, title: 'A Letter Home', passage: 'In a letter, a child wrote that the train ride west was loud, dusty, and exciting. The letter helps readers understand what travel felt like to one person at that time.', question: 'What kind of source is the letter?', answer: 'A primary source', options: ['A primary source', 'A weather forecast', 'A fiction cover', 'A menu'], skill: 'Identify source type' },
  { id: 'g4-water-budget', level: 6, title: 'Water Budget', passage: 'The garden club had a limited amount of water. They watered young plants first because those roots were not deep yet. Older plants could wait until the evening.', question: 'Why did young plants get water first?', answer: 'Their roots were not deep yet', options: ['Their roots were not deep yet', 'They were made of plastic', 'They were already dry forever', 'They grew inside a book'], skill: 'Use causal reasoning' },
  { id: 'g5-renewable-debate', level: 7, title: 'Renewable Debate', passage: 'The debate team argued that the school should add solar panels. They used data about sunny days, electricity costs, and long-term savings to support the plan.', question: 'What makes the argument stronger?', answer: 'It uses data to support the plan', options: ['It uses data to support the plan', 'It has a short title', 'It mentions the school once', 'It avoids all numbers'], skill: 'Evaluate argument quality' },
  { id: 'g5-ecosystem-change', level: 7, title: 'Ecosystem Change', passage: 'When a stream became polluted, fewer insects lived near the water. Fish had less food, and birds visited the stream less often. One change affected the whole system.', question: 'What is the central idea?', answer: 'A change in one part of an ecosystem can affect many parts', options: ['A change in one part of an ecosystem can affect many parts', 'Birds never eat near water', 'Insects only live in deserts', 'Pollution helps every animal'], skill: 'Find central idea' },
  { id: 'g5-prototype-notebook', level: 7, title: 'Prototype Notebook', passage: 'The first wheelchair ramp model was too steep. The team measured the angle, made the ramp longer, and tested again. The second model was easier for the toy wheelchair to climb.', question: 'What revision improved the design?', answer: 'Making the ramp longer', options: ['Making the ramp longer', 'Removing all measurements', 'Using fewer tests', 'Making it steeper'], skill: 'Analyze design revision' },
];

const READING_PASSAGE_TOPICS = [
  'class garden', 'lost lunchbox', 'rainy recess', 'robot helper', 'library choice',
  'science notebook', 'map walk', 'kind teammate', 'broken bridge', 'music practice',
  'animal habitat', 'weather station', 'school vote', 'clean water', 'new student',
  'sports strategy', 'art mural', 'bus route', 'space model', 'energy saver',
];

const READING_DETAIL_BANK = [
  { detail: 'a label beside the garden seeds', action: 'watering the dry soil first', evidence: 'plant notes and leaf changes' },
  { detail: 'a name tag on the lunchbox', action: 'checking the cubby list before returning it', evidence: 'the name tag and classroom list' },
  { detail: 'dark clouds over the playground', action: 'moving recess games under the covered area', evidence: 'cloud color and the rain chart' },
  { detail: 'the robot stopped before the basket', action: 'changing one command and testing again', evidence: 'the first test and the new robot path' },
  { detail: 'the book title matched the science unit', action: 'choosing the book with the strongest connection', evidence: 'the title and the unit question' },
  { detail: 'two measurements in the science notebook', action: 'repeating the measurement before deciding', evidence: 'the first measurement and the retest' },
  { detail: 'the map key showed a star for the library', action: 'following the symbols from school to library', evidence: 'the map key and street labels' },
  { detail: 'a teammate shared the last marker', action: 'thanking the teammate and finishing together', evidence: 'the shared marker and completed poster' },
  { detail: 'the bridge sagged in the middle', action: 'folding the paper before the next test', evidence: 'the sagging bridge and stronger folded bridge' },
  { detail: 'the drum beat sped up', action: 'clapping the rhythm slowly first', evidence: 'the first beat and the corrected beat' },
  { detail: 'the pond had shade and insects', action: 'choosing the habitat with food and shelter', evidence: 'the habitat notes and animal needs chart' },
  { detail: 'the thermometer changed after lunch', action: 'recording weather at more than one time', evidence: 'morning and afternoon temperatures' },
  { detail: 'each voter gave a reason', action: 'counting votes after hearing both ideas', evidence: 'the reasons and the final vote chart' },
  { detail: 'the filter trapped sand in the cloth', action: 'adding another layer before retesting', evidence: 'the muddy cup and clearer cup' },
  { detail: 'the new student stood alone by the door', action: 'inviting the student to join the table', evidence: 'the quiet student and kind invitation' },
  { detail: 'the goalie blocked every straight kick', action: 'passing to open space on the side', evidence: 'blocked shots and the new passing lane' },
  { detail: 'the mural sketch had one blank corner', action: 'adding a symbol that matched the theme', evidence: 'the theme card and revised sketch' },
  { detail: 'the bus route passed the library first', action: 'using landmarks to check the correct stop', evidence: 'the route map and landmark list' },
  { detail: 'the moon looked different each night', action: 'ordering the moon drawings by date', evidence: 'dated drawings and sky notes' },
  { detail: 'the lights stayed on in an empty room', action: 'posting a reminder near the switch', evidence: 'the empty room and electricity chart' },
];

const EXPANDED_READING_PASSAGES: ReadingPassage[] = READING_PASSAGE_TOPICS.flatMap((topic, topicIndex) =>
  Array.from({ length: 7 }, (_, gradeIndex) => Array.from({ length: 5 }, (_, variantIndex) => {
    const level = gradeIndex + 1;
    const detail = READING_DETAIL_BANK[(topicIndex + variantIndex) % READING_DETAIL_BANK.length];
    const title = `${topic.replace(/^\w/, letter => letter.toUpperCase())} Reader ${level}.${variantIndex + 1}`;
    const passage = level <= 2
      ? `A child studies the ${topic}. The child notices ${detail.detail}. Then the child tells that detail to the teacher.`
      : level <= 4
        ? `The class worked on a ${topic}. First they made a plan. Then they tried ${detail.action}. The change helped their work make more sense.`
        : `Students studied a ${topic} problem. They compared ${detail.evidence}, explained their claim, and revised the plan after a fair test.`;
    const answer = level <= 2 ? detail.detail : level <= 4 ? detail.action : `They compared ${detail.evidence}`;
    return {
      id: `expanded-reading-${topicIndex + 1}-g${level}-v${variantIndex + 1}`,
      level,
      title,
      passage,
      question: level <= 2 ? 'What detail does the child notice?' : level <= 4 ? 'What helped the class improve?' : 'What made the students explanation stronger?',
      answer,
      options: [answer, 'They guessed without reading', 'They stopped before checking', 'They picked an unrelated idea'],
      skill: level <= 2 ? 'Remember key detail' : level <= 4 ? 'Sequence and cause' : 'Evidence and reasoning',
    };
  })).flat()
);

export const ALL_READING_PASSAGES = [...READING_PASSAGES, ...EXPANDED_READING_PASSAGES];

const SUCCESS_ROUND_DELAY_MS = 1800;
const MATCH_SUCCESS_ROUND_DELAY_MS = 950;

const AdvancedReadingRoom: React.FC<ReadingRoomProps> = ({ onBack, onReward, onAttempt, level }) => {
  const [mode, setMode] = useState<Activity>('MATCH');
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState(ALL_VOCABULARY[0]);
  const [currentPassage, setCurrentPassage] = useState(ALL_READING_PASSAGES[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<{id: number, char: string}[]>([]);
  const [spelledWord, setSpelledWord] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [coachTip, setCoachTip] = useState('');
  const [teacherCheck, setTeacherCheck] = useState<{
    status: 'correct' | 'wrong';
    title: string;
    detail: string;
    selectedAnswer?: string;
    correctAnswer?: string;
  } | null>(null);

  // Phonics State
  const [isRecording, setIsRecording] = useState(false);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const hasInitializedMode = useRef(false);
  const lessonStep = useRef(0);

  const shuffle = <T,>(array: T[], scope: string, step: number) => shuffleDailyItems(array, scope, step);

  const modeTip = useMemo(() => {
    switch (mode) {
      case 'MATCH': return 'Read the word, then choose the picture that matches.';
      case 'SPELL': return 'Say each letter as you build the word.';
      case 'RHYME': return 'Listen for the ending sound.';
      case 'PHONICS': return 'Tap each sound block slowly, then blend them.';
      case 'COMPREHENSION': return 'Read the short passage, then answer using evidence.';
    }
  }, [mode]);

  const narrateRound = useCallback(async (word: typeof ALL_VOCABULARY[number], roundOptions: string[]) => {
    switch (mode) {
      case 'MATCH':
        await speakMultipleChoiceQuestion(`Which picture shows ${word.word}?`, roundOptions.map(getPictureLabel));
        break;
      case 'SPELL':
        await speakAsync(`Spell ${word.word}.`, 0.86, 1.04);
        break;
      case 'RHYME':
        await speakMultipleChoiceQuestion(`What rhymes with ${word.word}?`, roundOptions);
        break;
      case 'PHONICS':
        await speakAsync(`Sound out ${word.word}.`, 0.84, 1.02);
        break;
      case 'COMPREHENSION':
        break;
    }
  }, [mode]);

  const getWordsForLevel = () => {
    const maxLvl = Math.min(Math.max(level, 1), 7);
    const list = ALL_VOCABULARY.filter(v => v.level === maxLvl);
    return list.length > 0 ? list : ALL_VOCABULARY;
  };

  const getPassagesForLevel = () => {
    const maxLvl = Math.min(Math.max(level, 1), 7);
    const list = ALL_READING_PASSAGES.filter(p => p.level === maxLvl);
    return list.length > 0 ? list : ALL_READING_PASSAGES;
  };

  const narratePassageRound = useCallback(async (passage: ReadingPassage) => {
    await speakAsync(`${passage.title}. ${passage.passage}`, 0.86, 1.02);
    await speakMultipleChoiceQuestion(passage.question, passage.options);
  }, []);

  const nextRound = () => {
    setShowSuccess(false);
    setShowWrong(false);
    setTeacherCheck(null);
    setSpelledWord('');
    setCoachTip(modeTip);
    const step = lessonStep.current;
    lessonStep.current += 1;

    if (mode === 'COMPREHENSION') {
      const passagePool = getPassagesForLevel();
      const nextPassage = pickDailyItem(passagePool, `reading-passage-grade-${level}`, step);
      setCurrentPassage(nextPassage);
      setOptions(shuffle(nextPassage.options, `reading-passage-options-${level}-${nextPassage.title}`, step));
      void narratePassageRound(nextPassage);
      return;
    }
    const pool = getWordsForLevel();
    const next = mode === 'MATCH'
      ? shuffle(pool, `reading-match-six-round-queue-${level}`, 0)[step % pool.length]
      : pickDailyItem(pool, `reading-${mode.toLowerCase()}-grade-${level}`, step);
    setCurrentWord(next);

    if (mode === 'MATCH') {
      const distractors = shuffle(
        pool.filter(v => v.word !== next.word),
        `reading-match-distractors-${level}-${next.word}`,
        step
      ).slice(0, 3);
      const roundOptions = shuffle([next, ...distractors], `reading-match-options-${level}-${next.word}`, step).map(o => o.emoji);
      setOptions(roundOptions);
      void narrateRound(next, roundOptions);
      return;

    } else if (mode === 'SPELL') {
      const letters = next.word.toUpperCase().split('').map((char, i) => ({ id: i, char }));
      setScrambledLetters(shuffle(letters, `reading-spell-letters-${level}-${next.word}`, step));
      void narrateRound(next, []);
      return;

    } else if (mode === 'RHYME') {
      const distractors = shuffle(ALL_VOCABULARY.filter(v => v.rhyme !== next.rhyme && v.word !== next.word), `reading-rhyme-distractors-${level}-${next.word}`, step).slice(0, 2);
      const correctRhyme = next.rhyme;
      const wrongRhymes = distractors.map(d => d.rhyme);
      const roundOptions = shuffle([correctRhyme, ...wrongRhymes], `reading-rhyme-options-${level}-${next.word}`, step);
      setOptions(roundOptions);
      void narrateRound(next, roundOptions);
      return;

    } else if (mode === 'PHONICS') {
      void narrateRound(next, []);
      return;
    }
  };

  useEffect(() => {
    nextRound();
    hasInitializedMode.current = true;
  }, []);

  useEffect(() => {
    if (!hasInitializedMode.current) {
      return;
    }
    nextRound();
  }, [mode, level]);

  const handleOptionClick = (val: string) => {
    let correct = false;
    if (mode === 'MATCH' && val === currentWord.emoji) correct = true;
    if (mode === 'RHYME' && val === currentWord.rhyme) correct = true;
    if (mode === 'COMPREHENSION' && val === currentPassage.answer) correct = true;

    if (correct) {
      playSuccess();
      setShowSuccess(true);
      setScore(s => s + 1);
      const correctAnswer = mode === 'COMPREHENSION'
        ? currentPassage.answer
        : mode === 'MATCH'
          ? currentWord.word
          : currentWord.rhyme;
      setTeacherCheck({
        status: 'correct',
        title: mode === 'COMPREHENSION' ? 'Correct. Use the evidence.' : 'Correct reading.',
        detail: mode === 'COMPREHENSION'
          ? `The text evidence is: ${currentPassage.answer}.`
          : mode === 'MATCH'
            ? `${currentWord.word} matches that picture.`
            : `${val} rhymes with ${currentWord.word}.`,
        selectedAnswer: mode === 'MATCH' ? getPictureLabel(val) : val,
        correctAnswer,
      });
      if (mode === 'COMPREHENSION') {
        void speakCorrect(`Great reading. The text evidence is: ${currentPassage.answer}.`);
      } else {
        void speakCorrect(mode === 'MATCH'
          ? `Correct. ${currentWord.word}. Let's try the next match.`
          : `Great reading. ${currentWord.word}. ${currentWord.sentence}`
        );
      }
      onReward(mode === 'COMPREHENSION'
        ? {
          questionId: `reading-comprehension-${currentPassage.id}`,
          skill: currentPassage.skill,
          prompt: currentPassage.question,
          selectedAnswer: val,
          correctAnswer: currentPassage.answer,
        }
        : {
          questionId: `reading-${mode.toLowerCase()}-${currentWord.word}`,
          skill: mode.toLowerCase(),
          prompt: mode === 'MATCH' ? `Match ${currentWord.word}` : `What rhymes with ${currentWord.word}?`,
          selectedAnswer: mode === 'MATCH' ? getPictureLabel(val) : val,
          correctAnswer: mode === 'MATCH' ? currentWord.word : currentWord.rhyme,
        });
      setTimeout(nextRound, mode === 'MATCH' ? MATCH_SUCCESS_ROUND_DELAY_MS : SUCCESS_ROUND_DELAY_MS);
    } else {
      playWrongBuzzer();
      setShowWrong(true);
      if (mode === 'MATCH') {
        onAttempt?.({
          questionId: `reading-match-${currentWord.word}`,
          skill: 'match',
          prompt: `Match ${currentWord.word}`,
          selectedAnswer: getPictureLabel(val),
          correctAnswer: currentWord.word,
        }, false);
        setTeacherCheck({
          status: 'wrong',
          title: 'Look again at the word.',
          detail: `${currentWord.word} matches the picture of ${currentWord.word.toLowerCase()}.`,
          selectedAnswer: getPictureLabel(val),
          correctAnswer: currentWord.word,
        });
        void speakWrong(`That is not ${currentWord.word}. Look again and find the matching picture.`);
      } else if (mode === 'RHYME') {
        onAttempt?.({
          questionId: `reading-rhyme-${currentWord.word}`,
          skill: 'rhyme',
          prompt: `What rhymes with ${currentWord.word}?`,
          selectedAnswer: val,
          correctAnswer: currentWord.rhyme,
        }, false);
        setTeacherCheck({
          status: 'wrong',
          title: 'Listen for the ending sound.',
          detail: `${currentWord.rhyme} rhymes with ${currentWord.word}.`,
          selectedAnswer: val,
          correctAnswer: currentWord.rhyme,
        });
        void speakWrong(`${val} does not rhyme with ${currentWord.word}. The rhyming answer is ${currentWord.rhyme}.`);
      } else if (mode === 'COMPREHENSION') {
        onAttempt?.({
          questionId: `reading-comprehension-${currentPassage.id}`,
          skill: currentPassage.skill,
          prompt: currentPassage.question,
          selectedAnswer: val,
          correctAnswer: currentPassage.answer,
        }, false);
        setTeacherCheck({
          status: 'wrong',
          title: 'Go back to the passage.',
          detail: `The best text evidence is: ${currentPassage.answer}.`,
          selectedAnswer: val,
          correctAnswer: currentPassage.answer,
        });
        void speakWrong(`Look back at the passage. The best answer is ${currentPassage.answer}.`);
      }
      setTimeout(() => setShowWrong(false), 2000);
    }
  };

  const handleSpellClick = (charObj: {id: number, char: string}) => {
    playPop();
    const newSpelled = spelledWord + charObj.char;
    setSpelledWord(newSpelled);
    setScrambledLetters(prev => prev.filter(l => l.id !== charObj.id));

    if (newSpelled === currentWord.word.toUpperCase()) {
      playSuccess();
      setShowSuccess(true);
      setScore(s => s + 1);
      setTeacherCheck({
        status: 'correct',
        title: 'Correct spelling.',
        detail: `${currentWord.word} is spelled ${currentWord.word.toUpperCase().split('').join('-')}.`,
        selectedAnswer: newSpelled,
        correctAnswer: currentWord.word.toUpperCase(),
      });
      void speakCorrect(`You spelled ${currentWord.word}. ${currentWord.sentence}`);
      onReward({
        questionId: `reading-spell-${currentWord.word}`,
        skill: 'spelling',
        prompt: `Spell ${currentWord.word}`,
        selectedAnswer: newSpelled,
        correctAnswer: currentWord.word.toUpperCase(),
      });
      setTimeout(nextRound, SUCCESS_ROUND_DELAY_MS);
    } else if (newSpelled.length === currentWord.word.length && newSpelled !== currentWord.word.toUpperCase()) {
      // Wrong spelling
      playWrongBuzzer();
      setShowWrong(true);
      onAttempt?.({
        questionId: `reading-spell-${currentWord.word}`,
        skill: 'spelling',
        prompt: `Spell ${currentWord.word}`,
        selectedAnswer: newSpelled,
        correctAnswer: currentWord.word.toUpperCase(),
      }, false);
      setTeacherCheck({
        status: 'wrong',
        title: 'Let us spell it together.',
        detail: `${currentWord.word} is spelled ${currentWord.word.toUpperCase().split('').join('-')}.`,
        selectedAnswer: newSpelled,
        correctAnswer: currentWord.word.toUpperCase(),
      });
      void speakWrong(`Let us spell it together. ${currentWord.word.split('').join(' ')}.`);
      setTimeout(() => {
        setShowWrong(false);
        nextRound();
      }, 3000);
    }
  };

  // Phonics Handlers
  const playSegment = async (segment: string, index: number) => {
    setActiveSegment(index);
    await speakAsync(`Sound: ${segment}.`, 0.78, 1.0);
    setTimeout(() => setActiveSegment(null), 1000);
  };

  const handleMicClick = () => {
    setIsRecording(true);
    void speakAsync(`Read ${currentWord.word} out loud.`, 0.84, 1.02);
    setTimeout(async () => {
      setIsRecording(false);
      playSuccess();
      setTeacherCheck({
        status: 'correct',
        title: 'Clear reading voice.',
        detail: `You practiced saying ${currentWord.word}. ${currentWord.sentence}`,
        selectedAnswer: currentWord.word,
        correctAnswer: currentWord.word,
      });
      void speakCorrect(`Excellent pronunciation. You said ${currentWord.word} very clearly.`);
      setScore(s => s + 1);
      onReward({
        questionId: `reading-phonics-${currentWord.word}`,
        skill: 'phonics',
        prompt: `Read ${currentWord.word} out loud`,
        selectedAnswer: currentWord.word,
        correctAnswer: currentWord.word,
      });
      setTimeout(nextRound, SUCCESS_ROUND_DELAY_MS);
    }, 3500);
  };

  const speakCurrentWord = () => {
    if (mode === 'COMPREHENSION') {
      void (async () => {
        await speakAsync(`${currentPassage.title}. ${currentPassage.passage}`, 0.86, 1.02);
        await speakMultipleChoiceQuestion(currentPassage.question, currentPassage.options);
      })();
      return;
    }
    void speakAsync(`${currentWord.word}. ${currentWord.sentence}`, 0.86, 1.02);
  };

  const modeSteps = [
    { id: 'MATCH', label: 'Match', hint: 'Picture clue' },
    { id: 'SPELL', label: 'Spell', hint: 'Build letters' },
    { id: 'RHYME', label: 'Rhyme', hint: 'Hear endings' },
    { id: 'PHONICS', label: 'Sound', hint: 'Tap sounds' },
    { id: 'COMPREHENSION', label: 'Read', hint: 'Use evidence' },
  ];

  return (
    <div className="academy-room-surface h-full w-full bg-orange-50 flex flex-col items-center relative overflow-hidden" style={{ '--academy-room-scene': "url('/academy/rooms/reading.webp')" } as React.CSSProperties}>
      <div className="absolute inset-0 bg-white/35 backdrop-blur-[1px]"></div>

      <header className="w-full p-4 flex justify-between items-center z-10 flex-wrap gap-2">
        <button onClick={onBack} aria-label="Back to world map" className="bg-white p-3 rounded-full shadow-lg hover:bg-orange-100">
          <ArrowLeft className="text-orange-600" />
        </button>

        <div className="flex max-w-[60vw] overflow-x-auto rounded-2xl border border-white/60 bg-white/90 p-1 shadow-lg backdrop-blur-md">
          {(['MATCH', 'SPELL', 'RHYME', 'PHONICS', 'COMPREHENSION'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-xl font-bold text-sm flex gap-2 items-center whitespace-nowrap transition-all ${mode === m ? 'bg-orange-500 text-white shadow-md scale-105' : 'text-orange-800 hover:bg-orange-100'}`}
            >
              {m === 'MATCH' && <ImageIcon size={16} />}
              {m === 'SPELL' && <Type size={16} />}
              {m === 'RHYME' && <Sparkles size={16} />}
              {m === 'PHONICS' && <Mic2 size={16} />}
              {m === 'COMPREHENSION' && <Book size={16} />}
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border-2 border-orange-100">
          <Star className="text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-orange-800">{score}</span>
        </div>
      </header>

      <div className="z-10 flex flex-col items-center mt-8 w-full max-w-5xl px-4">
        <div className="mb-5 grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {modeSteps.map(step => (
            <button
              key={step.id}
              onClick={() => setMode(step.id as Activity)}
              className={`rounded-2xl border-2 px-3 py-3 text-left shadow-sm transition ${mode === step.id ? 'border-orange-500 bg-white text-orange-700 scale-[1.03]' : 'border-white/50 bg-white/70 text-orange-900 hover:bg-white'}`}
            >
              <p className="text-sm font-black">{step.label}</p>
              <p className="text-[11px] font-bold opacity-70">{step.hint}</p>
            </button>
          ))}
        </div>
        <div className="mb-5 bg-orange-50 border-2 border-orange-100 rounded-2xl px-4 py-3 text-left w-full max-w-md">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Reading Coach</div>
          <div className="text-orange-900 font-semibold">{coachTip}</div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/95 p-8 rounded-[40px] shadow-2xl border-b-8 border-orange-300 mb-8 text-center w-full max-w-xl relative animate-pop-in">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-6 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg">
            Word Stage
          </div>

          {/* Global Volume Button */}
          <button
            onClick={speakCurrentWord}
            className="absolute top-6 right-6 p-2 bg-orange-100 rounded-full text-orange-500 hover:bg-orange-200 hover:scale-110 transition-all"
          >
            <Volume2 size={24} />
          </button>

          {showSuccess && (
            <div className="absolute inset-0 bg-green-100/90 rounded-[32px] flex flex-col items-center justify-center z-20 animate-fade-in">
              <Check size={80} className="text-green-600 animate-bounce" />
              <span className="text-green-700 font-bold text-2xl">Great Job!</span>
            </div>
          )}

          {showWrong && (
            <div className="absolute inset-0 bg-red-100/90 rounded-[32px] flex flex-col items-center justify-center z-20 animate-fade-in">
              <X size={80} className="text-red-500" />
              <span className="text-red-600 font-bold text-xl">Try Again!</span>
            </div>
          )}

          {/* Mode Specific Headers */}
          {mode === 'COMPREHENSION' ? (
            <div className="mb-5 rounded-[28px] bg-gradient-to-br from-orange-100 to-yellow-50 p-5 text-left shadow-inner">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-orange-500">Comprehension Quest</div>
              <p className="text-3xl font-black text-orange-700">{currentPassage.title}</p>
              <p className="mt-2 rounded-2xl bg-white/85 px-4 py-3 text-base font-semibold leading-relaxed text-slate-800">{currentPassage.passage}</p>
              <p className="mt-3 rounded-2xl bg-orange-500 px-4 py-3 text-base font-black text-white">{currentPassage.question}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-orange-500">Skill: {currentPassage.skill}</p>
            </div>
          ) : mode === 'MATCH' ? (
            <div className="mb-5 rounded-[28px] bg-gradient-to-br from-orange-100 to-yellow-50 p-5 shadow-inner">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-orange-500">Read this word</div>
              <p className="text-6xl font-black text-orange-700">{currentWord.word}</p>
              <p className="mt-3 rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold text-orange-900">
                Choose the picture that matches this word.
              </p>
            </div>
          ) : mode === 'RHYME' ? (
            <div className="mb-5 rounded-[28px] bg-gradient-to-br from-orange-100 to-yellow-50 p-5 shadow-inner">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-orange-500">Listen for ending sounds</div>
              <p className="text-6xl font-black text-orange-700">{currentWord.word}</p>
              <p className="mt-3 rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold text-orange-900">
                Pick the word that rhymes.
              </p>
            </div>
          ) : (
            <div className="mb-5 rounded-[28px] bg-gradient-to-br from-orange-100 to-yellow-50 p-5 shadow-inner">
              <div className="text-7xl mb-3">{getPictureSymbol(currentWord.emoji)}</div>
              <p className="text-5xl font-black text-orange-700">{currentWord.word}</p>
              <p className="mt-3 rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold text-orange-900">{currentWord.sentence}</p>
            </div>
          )}

          {mode === 'MATCH' && <h1 className="sr-only">{currentWord.word}</h1>}
          {mode === 'SPELL' && <div className="mb-6 text-sm font-black uppercase tracking-[0.18em] text-orange-500">Build the word</div>}
          {mode === 'RHYME' && <h1 className="sr-only">What rhymes with {currentWord.word}?</h1>}

          {/* PHONICS VIEW */}
          {mode === 'PHONICS' && (
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-4">{getPictureSymbol(currentWord.emoji)}</div>

              {/* Segmented Word */}
              <div className="flex gap-2 mb-8 flex-wrap justify-center">
                {currentWord.segments ? currentWord.segments.map((seg, i) => (
                  <button
                    key={i}
                    onClick={() => playSegment(seg, i)}
                    className={`
                      px-4 py-4 rounded-2xl text-3xl font-bold border-b-4 transition-all active:scale-95
                      ${activeSegment === i
                        ? 'bg-yellow-400 text-yellow-900 border-yellow-600 scale-110'
                        : 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200'}
                    `}
                  >
                    {seg}
                  </button>
                )) : (
                  <span className="text-5xl font-bold text-orange-600">{currentWord.word}</span>
                )}
              </div>

              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Tap blocks to sound it out</div>

              {/* Interaction Buttons */}
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => speak(`The word is ${currentWord.word}. ${currentWord.sentence}`)}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_4px_0_rgb(55,48,163)] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2"
                >
                  <Ear /> Listen
                </button>
                <button
                  onClick={handleMicClick}
                  disabled={isRecording}
                  className={`
                    flex-1 py-4 rounded-2xl font-bold text-lg shadow-[0_4px_0_rgb(180,83,9)] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2
                    ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 hover:bg-orange-400 text-white'}
                  `}
                >
                  <Mic2 /> {isRecording ? 'Listening...' : 'Read it!'}
                </button>
              </div>

              {/* Decorative audio waveform */}
              {isRecording && (
                <div className="flex gap-1 mt-4 h-8 items-center">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="w-2 bg-red-400 rounded-full animate-bounce" style={{height: Math.random() * 24 + 4 + 'px', animationDelay: i * 0.1 + 's'}}></div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interaction Area (Options/Spelling) */}
        {(mode === 'MATCH' || mode === 'RHYME' || mode === 'COMPREHENSION') && (
          <div className="grid grid-cols-1 gap-4 w-full max-w-md sm:grid-cols-2">
            {options.map((opt, i) => {
              const isCorrect =
                (mode === 'MATCH' && opt === currentWord.emoji) ||
                (mode === 'RHYME' && opt === currentWord.rhyme) ||
                (mode === 'COMPREHENSION' && opt === currentPassage.answer);
              return (
                <button
                  key={i}
                  data-testid="reading-answer-option"
                  data-reading-correct={isCorrect ? 'true' : 'false'}
                  aria-label={mode === 'MATCH' ? `${String.fromCharCode(65 + i)}. Picture of ${getPictureLabel(opt)}` : undefined}
                  onClick={() => handleOptionClick(opt)}
                  className={`${mode === 'COMPREHENSION' ? 'min-h-24 px-4 text-base leading-snug' : 'min-h-28 text-4xl'} bg-white rounded-3xl font-bold flex items-center justify-center gap-3 text-center shadow-lg hover:bg-orange-50 border-b-8 border-orange-100 active:border-b-0 active:translate-y-2 transition-all`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-base font-black text-orange-700">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span aria-hidden={mode === 'MATCH' ? 'true' : undefined}>{mode === 'MATCH' ? getPictureSymbol(opt) : opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {mode === 'SPELL' && (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex gap-2 h-24 justify-center items-end flex-wrap">
              {currentWord.word.split('').map((_, i) => (
                <div key={i} className="w-14 h-20 border-b-8 border-orange-300 flex items-center justify-center text-5xl font-bold text-orange-800 bg-white/60 rounded-t-xl">
                  {spelledWord[i] || ''}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {scrambledLetters.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSpellClick(item)}
                  className="w-16 h-16 bg-yellow-400 hover:bg-yellow-300 rounded-2xl shadow-[0_6px_0_rgb(200,150,0)] text-4xl font-bold text-yellow-900 active:translate-y-2 active:shadow-none transition-all"
                >
                  {item.char}
                </button>
              ))}
            </div>
          </div>
        )}

        {teacherCheck && (
          <div className={`mb-8 w-full max-w-xl rounded-[28px] border-2 p-5 shadow-lg ${teacherCheck.status === 'correct' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <div className={`text-xs font-black uppercase tracking-[0.18em] ${teacherCheck.status === 'correct' ? 'text-green-600' : 'text-orange-600'}`}>
              Teacher Check
            </div>
            <div className={`mt-1 text-xl font-black ${teacherCheck.status === 'correct' ? 'text-green-800' : 'text-orange-800'}`}>
              {teacherCheck.title}
            </div>
            <div className="mt-3 grid gap-2 text-sm font-bold text-slate-700 sm:grid-cols-2">
              {teacherCheck.selectedAnswer && (
                <div className="rounded-xl bg-white/85 p-3 shadow-sm">Your answer: {teacherCheck.selectedAnswer}</div>
              )}
              {teacherCheck.correctAnswer && (
                <div className="rounded-xl bg-white/85 p-3 shadow-sm">Correct answer: {teacherCheck.correctAnswer}</div>
              )}
            </div>
            <p className="mt-3 font-semibold text-slate-700">{teacherCheck.detail}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export const ReadingRoom: React.FC<ReadingRoomProps> = (props) => (
  props.level <= 7 ? <EarlyReadingLesson {...props} /> : <AdvancedReadingRoom {...props} />
);
