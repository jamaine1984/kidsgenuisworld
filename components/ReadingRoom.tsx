import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Star, Type, Image as ImageIcon, Volume2, Mic2, Sparkles, Book, Ear, X } from 'lucide-react';
import { playSuccess, playWrongBuzzer, playPop, speak, speakAsync, speakCorrect, speakWrong, speakQuestion } from '../services/audioService';

interface ReadingRoomProps {
  onBack: () => void;
  onReward: () => void;
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
];

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
];

const SUCCESS_ROUND_DELAY_MS = 1800;

export const ReadingRoom: React.FC<ReadingRoomProps> = ({ onBack, onReward, level }) => {
  const [mode, setMode] = useState<Activity>('MATCH');
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState(VOCABULARY[0]);
  const [currentPassage, setCurrentPassage] = useState(READING_PASSAGES[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<{id: number, char: string}[]>([]);
  const [spelledWord, setSpelledWord] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [coachTip, setCoachTip] = useState('');

  // Phonics State
  const [isRecording, setIsRecording] = useState(false);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const hasInitializedMode = useRef(false);

  const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

  const modeTip = useMemo(() => {
    switch (mode) {
      case 'MATCH': return 'Look at the word, then find the picture that fits.';
      case 'SPELL': return 'Say each letter as you build the word.';
      case 'RHYME': return 'Listen for the ending sound.';
      case 'PHONICS': return 'Tap each sound block slowly, then blend them.';
      case 'COMPREHENSION': return 'Read the short passage, then answer using evidence.';
    }
  }, [mode]);

  const buildTeacherPrompt = useCallback((word: typeof VOCABULARY[number]) => {
    switch (mode) {
      case 'MATCH':
        return `Teacher says: We are matching the word ${word.word}. Look at the letters, then find the picture that fits.`;
      case 'SPELL':
        return `Teacher says: We are spelling the word ${word.word}. Say each letter slowly as you build it.`;
      case 'RHYME':
        return `Teacher says: Listen for the ending sound in ${word.word}. We want a word that sounds the same at the end.`;
      case 'PHONICS':
        return `Teacher says: We are going to tap each sound in ${word.word}, then blend the sounds together.`;
      case 'COMPREHENSION':
        return 'Teacher says: Read the passage first. Then use a detail from the text to answer the question.';
    }
  }, [mode]);

  const narrateRound = useCallback(async (word: typeof VOCABULARY[number]) => {
    await speakAsync(buildTeacherPrompt(word), 0.88, 1.04);
    switch (mode) {
      case 'MATCH':
        await speakAsync(`Find the picture for ${word.word}. ${word.sentence}`, 0.86, 1.04);
        break;
      case 'SPELL':
        await speakAsync(`Spell the word ${word.word}. ${word.sentence}`, 0.86, 1.04);
        break;
      case 'RHYME':
        await speakAsync(`What rhymes with ${word.word}? Listen to the ending sound.`, 0.86, 1.04);
        break;
      case 'PHONICS':
        await speakAsync(`Let us sound out the word ${word.word}. Tap each sound block, then read the whole word.`, 0.84, 1.02);
        break;
      case 'COMPREHENSION':
        break;
    }
  }, [buildTeacherPrompt, mode]);

  const getWordsForLevel = () => {
    const maxLvl = Math.min(Math.max(level, 1), 7);
    const list = VOCABULARY.filter(v => v.level <= maxLvl);
    return list.length > 0 ? list : VOCABULARY;
  };

  const getPassagesForLevel = () => {
    const maxLvl = Math.min(Math.max(level, 1), 7);
    const list = READING_PASSAGES.filter(p => p.level <= maxLvl);
    return list.length > 0 ? list : READING_PASSAGES;
  };

  const narratePassageRound = useCallback(async (passage: ReadingPassage) => {
    await speakAsync('Teacher says: Read the passage first. Listen for the important details.', 0.88, 1.04);
    await speakAsync(`${passage.title}. ${passage.passage}`, 0.86, 1.02);
    await speakAsync(passage.question, 0.86, 1.02);
  }, []);

  const nextRound = () => {
    setShowSuccess(false);
    setShowWrong(false);
    setSpelledWord('');
    setCoachTip(modeTip);
    if (mode === 'COMPREHENSION') {
      const passagePool = getPassagesForLevel();
      const nextPassage = passagePool[Math.floor(Math.random() * passagePool.length)];
      setCurrentPassage(nextPassage);
      setOptions(shuffle(nextPassage.options));
      void narratePassageRound(nextPassage);
      return;
    }
    const pool = getWordsForLevel();
    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrentWord(next);

    if (mode === 'MATCH') {
      const distractors = shuffle(VOCABULARY.filter(v => v.word !== next.word)).slice(0, 3);
      setOptions(shuffle([next, ...distractors]).map(o => o.emoji));

    } else if (mode === 'SPELL') {
      const letters = next.word.toUpperCase().split('').map((char, i) => ({ id: i, char }));
      setScrambledLetters(shuffle(letters));

    } else if (mode === 'RHYME') {
      const distractors = shuffle(VOCABULARY.filter(v => v.rhyme !== next.rhyme && v.word !== next.word)).slice(0, 2);
      const correctRhyme = next.rhyme;
      const wrongRhymes = distractors.map(d => d.rhyme);
      setOptions(shuffle([correctRhyme, ...wrongRhymes]));

    } else if (mode === 'PHONICS') {
    }

    void narrateRound(next);
  };

  useEffect(() => {
    const startLesson = async () => {
      await speakAsync(`Welcome to the Reading Library. ${modeTip}`);
      nextRound();
      hasInitializedMode.current = true;
    };
    void startLesson();
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
      if (mode === 'COMPREHENSION') {
        void speakCorrect(`Great reading. The text evidence is: ${currentPassage.answer}.`);
      } else {
        void speakCorrect(`Great reading. ${currentWord.word}. ${currentWord.sentence}`);
      }
      if (score > 0 && score % 3 === 0) onReward();
      setTimeout(nextRound, SUCCESS_ROUND_DELAY_MS);
    } else {
      playWrongBuzzer();
      setShowWrong(true);
      if (mode === 'MATCH') {
        void speakWrong(`That is not ${currentWord.word}. Look again and find the matching picture.`);
      } else if (mode === 'RHYME') {
        void speakWrong(`${val} does not rhyme with ${currentWord.word}. The rhyming answer is ${currentWord.rhyme}.`);
      } else if (mode === 'COMPREHENSION') {
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
      void speakCorrect(`You spelled ${currentWord.word}. ${currentWord.sentence}`);
      if (score > 0 && score % 3 === 0) onReward();
      setTimeout(nextRound, SUCCESS_ROUND_DELAY_MS);
    } else if (newSpelled.length === currentWord.word.length && newSpelled !== currentWord.word.toUpperCase()) {
      // Wrong spelling
      playWrongBuzzer();
      setShowWrong(true);
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
    await speakAsync(`Teacher says the sound is ${segment}.`, 0.78, 1.0);
    setTimeout(() => setActiveSegment(null), 1000);
  };

  const handleMicClick = () => {
    setIsRecording(true);
    void speakAsync(`Teacher says: Read the word ${currentWord.word} out loud.`, 0.84, 1.02);
    setTimeout(async () => {
      setIsRecording(false);
      playSuccess();
      void speakCorrect(`Excellent pronunciation. You said ${currentWord.word} very clearly.`);
      setScore(s => s + 1);
      if (score > 0 && score % 3 === 0) onReward();
      setTimeout(nextRound, SUCCESS_ROUND_DELAY_MS);
    }, 3500);
  };

  const speakCurrentWord = () => {
    if (mode === 'COMPREHENSION') {
      void speakAsync(`${currentPassage.title}. ${currentPassage.passage} ${currentPassage.question}`, 0.86, 1.02);
      return;
    }
    void speakAsync(`Teacher says the word is ${currentWord.word}. ${currentWord.sentence}`, 0.86, 1.02);
  };

  const modeSteps = [
    { id: 'MATCH', label: 'Match', hint: 'Picture clue' },
    { id: 'SPELL', label: 'Spell', hint: 'Build letters' },
    { id: 'RHYME', label: 'Rhyme', hint: 'Hear endings' },
    { id: 'PHONICS', label: 'Sound', hint: 'Tap sounds' },
    { id: 'COMPREHENSION', label: 'Read', hint: 'Use evidence' },
  ];

  return (
    <div className="h-full w-full bg-orange-50 flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fff7ed_0%,#fed7aa_34%,#fdba74_64%,#fb923c_100%)]"></div>
      <div className="absolute top-0 w-full h-64 bg-orange-200/80 rounded-b-[50%] z-0"></div>
      <div className="absolute left-8 top-28 h-28 w-20 rotate-[-10deg] rounded-xl bg-white/40 shadow-xl"></div>
      <div className="absolute right-10 bottom-16 h-24 w-32 rotate-6 rounded-[28px] bg-yellow-200/50 shadow-xl"></div>

      <header className="w-full p-4 flex justify-between items-center z-10 flex-wrap gap-2">
        <button onClick={onBack} aria-label="Back to world map" className="bg-white p-3 rounded-full shadow-lg hover:bg-orange-100">
          <ArrowLeft className="text-orange-600" />
        </button>

        <div className="flex bg-white/80 p-1 rounded-2xl backdrop-blur-sm overflow-x-auto max-w-[60vw] shadow-sm">
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
          ) : (
            <div className="mb-5 rounded-[28px] bg-gradient-to-br from-orange-100 to-yellow-50 p-5 shadow-inner">
              <div className="text-7xl mb-3">{currentWord.emoji}</div>
              <p className="text-5xl font-black text-orange-700">{currentWord.word}</p>
              <p className="mt-3 rounded-2xl bg-white/80 px-4 py-2 text-sm font-bold text-orange-900">{currentWord.sentence}</p>
            </div>
          )}

          {mode === 'MATCH' && <h1 className="sr-only">{currentWord.word}</h1>}
          {mode === 'SPELL' && <div className="mb-6 text-sm font-black uppercase tracking-[0.18em] text-orange-500">Build the word</div>}
          {mode === 'RHYME' && (
            <div>
              <div className="text-6xl mb-4">{currentWord.emoji}</div>
              <h1 className="text-2xl font-bold text-orange-800 mb-6">What rhymes with <span className="text-orange-600 underline">{currentWord.word}</span>?</h1>
            </div>
          )}

          {/* PHONICS VIEW */}
          {mode === 'PHONICS' && (
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-4">{currentWord.emoji}</div>

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
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
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
                  onClick={() => handleOptionClick(opt)}
                  className={`${mode === 'COMPREHENSION' ? 'min-h-24 px-4 text-base leading-snug' : 'h-28 text-4xl'} bg-white rounded-3xl font-bold flex items-center justify-center text-center shadow-lg hover:bg-orange-50 border-b-8 border-orange-100 active:border-b-0 active:translate-y-2 transition-all`}
                >
                  {opt}
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

      </div>
    </div>
  );
};
