import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Languages, Star, Volume2, Heart } from 'lucide-react';
import { LanguageWord } from '../types';
import { speakAsync, speakCorrect, speakWrong, playSuccess, playWrongBuzzer } from '../services/audioService';

interface LanguageRoomProps {
  level: number;
  onBack: () => void;
  onReward: () => void;
}

// Grade-paced language vocabulary. Translations are romanized/ASCII so cached narration and UI labels stay stable.
export const VOCABULARY: { [key: string]: LanguageWord[] } = {
  spanish: [
    { gradeLevel: 1, english: 'Hello', translation: 'Hola', pronunciation: 'OH-lah', language: 'spanish', category: 'greetings' },
    { gradeLevel: 1, english: 'Goodbye', translation: 'Adios', pronunciation: 'ah-dee-OHS', language: 'spanish', category: 'greetings' },
    { gradeLevel: 1, english: 'Please', translation: 'Por favor', pronunciation: 'por fah-VOR', language: 'spanish', category: 'greetings' },
    { gradeLevel: 1, english: 'Thank you', translation: 'Gracias', pronunciation: 'GRAH-see-ahs', language: 'spanish', category: 'greetings' },
    { gradeLevel: 2, english: 'One', translation: 'Uno', pronunciation: 'OO-noh', language: 'spanish', category: 'numbers' },
    { gradeLevel: 2, english: 'Two', translation: 'Dos', pronunciation: 'dohs', language: 'spanish', category: 'numbers' },
    { gradeLevel: 2, english: 'Three', translation: 'Tres', pronunciation: 'trehs', language: 'spanish', category: 'numbers' },
    { gradeLevel: 2, english: 'Red', translation: 'Rojo', pronunciation: 'ROH-hoh', language: 'spanish', category: 'colors' },
    { gradeLevel: 3, english: 'Blue', translation: 'Azul', pronunciation: 'ah-SOOL', language: 'spanish', category: 'colors' },
    { gradeLevel: 3, english: 'Green', translation: 'Verde', pronunciation: 'BEHR-deh', language: 'spanish', category: 'colors' },
    { gradeLevel: 3, english: 'Dog', translation: 'Perro', pronunciation: 'PEH-rroh', language: 'spanish', category: 'animals' },
    { gradeLevel: 3, english: 'Cat', translation: 'Gato', pronunciation: 'GAH-toh', language: 'spanish', category: 'animals' },
    { gradeLevel: 4, english: 'Apple', translation: 'Manzana', pronunciation: 'mahn-SAH-nah', language: 'spanish', category: 'food' },
    { gradeLevel: 4, english: 'Water', translation: 'Agua', pronunciation: 'AH-gwah', language: 'spanish', category: 'food' },
    { gradeLevel: 4, english: 'School', translation: 'Escuela', pronunciation: 'ehs-KWEH-lah', language: 'spanish', category: 'school' },
    { gradeLevel: 4, english: 'Book', translation: 'Libro', pronunciation: 'LEE-broh', language: 'spanish', category: 'school' },
    { gradeLevel: 5, english: 'Mom', translation: 'Mama', pronunciation: 'mah-MAH', language: 'spanish', category: 'family' },
    { gradeLevel: 5, english: 'Dad', translation: 'Papa', pronunciation: 'pah-PAH', language: 'spanish', category: 'family' },
    { gradeLevel: 5, english: 'Friend', translation: 'Amigo', pronunciation: 'ah-MEE-goh', language: 'spanish', category: 'family' },
    { gradeLevel: 5, english: 'Park', translation: 'Parque', pronunciation: 'PAR-keh', language: 'spanish', category: 'places' },
    { gradeLevel: 6, english: 'Where is it?', translation: 'Donde esta?', pronunciation: 'DOHN-deh ehs-TAH', language: 'spanish', category: 'phrases' },
    { gradeLevel: 6, english: 'I like it', translation: 'Me gusta', pronunciation: 'meh GOOS-tah', language: 'spanish', category: 'phrases' },
    { gradeLevel: 7, english: 'I need help', translation: 'Necesito ayuda', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah', language: 'spanish', category: 'phrases' },
    { gradeLevel: 7, english: 'See you tomorrow', translation: 'Hasta manana', pronunciation: 'AHS-tah mahn-YAH-nah', language: 'spanish', category: 'phrases' },
  ],
  french: [
    { gradeLevel: 1, english: 'Hello', translation: 'Bonjour', pronunciation: 'bon-ZHOOR', language: 'french', category: 'greetings' },
    { gradeLevel: 1, english: 'Goodbye', translation: 'Au revoir', pronunciation: 'oh reh-VWAHR', language: 'french', category: 'greetings' },
    { gradeLevel: 1, english: 'Please', translation: "S'il vous plait", pronunciation: 'seel voo PLEH', language: 'french', category: 'greetings' },
    { gradeLevel: 1, english: 'Thank you', translation: 'Merci', pronunciation: 'mehr-SEE', language: 'french', category: 'greetings' },
    { gradeLevel: 2, english: 'One', translation: 'Un', pronunciation: 'uhn', language: 'french', category: 'numbers' },
    { gradeLevel: 2, english: 'Two', translation: 'Deux', pronunciation: 'duh', language: 'french', category: 'numbers' },
    { gradeLevel: 2, english: 'Three', translation: 'Trois', pronunciation: 'trwah', language: 'french', category: 'numbers' },
    { gradeLevel: 2, english: 'Red', translation: 'Rouge', pronunciation: 'roozh', language: 'french', category: 'colors' },
    { gradeLevel: 3, english: 'Blue', translation: 'Bleu', pronunciation: 'bluh', language: 'french', category: 'colors' },
    { gradeLevel: 3, english: 'Green', translation: 'Vert', pronunciation: 'vehr', language: 'french', category: 'colors' },
    { gradeLevel: 3, english: 'Dog', translation: 'Chien', pronunciation: 'shee-EN', language: 'french', category: 'animals' },
    { gradeLevel: 3, english: 'Cat', translation: 'Chat', pronunciation: 'shah', language: 'french', category: 'animals' },
    { gradeLevel: 4, english: 'Apple', translation: 'Pomme', pronunciation: 'puhm', language: 'french', category: 'food' },
    { gradeLevel: 4, english: 'Water', translation: 'Eau', pronunciation: 'oh', language: 'french', category: 'food' },
    { gradeLevel: 4, english: 'School', translation: 'Ecole', pronunciation: 'ay-KOHL', language: 'french', category: 'school' },
    { gradeLevel: 4, english: 'Book', translation: 'Livre', pronunciation: 'leev-ruh', language: 'french', category: 'school' },
    { gradeLevel: 5, english: 'Mom', translation: 'Maman', pronunciation: 'mah-MAHN', language: 'french', category: 'family' },
    { gradeLevel: 5, english: 'Dad', translation: 'Papa', pronunciation: 'pah-PAH', language: 'french', category: 'family' },
    { gradeLevel: 5, english: 'Friend', translation: 'Ami', pronunciation: 'ah-MEE', language: 'french', category: 'family' },
    { gradeLevel: 5, english: 'Park', translation: 'Parc', pronunciation: 'park', language: 'french', category: 'places' },
    { gradeLevel: 6, english: 'Where is it?', translation: 'Ou est-ce?', pronunciation: 'oo ess', language: 'french', category: 'phrases' },
    { gradeLevel: 6, english: 'I like it', translation: "J'aime ca", pronunciation: 'zhem sah', language: 'french', category: 'phrases' },
    { gradeLevel: 7, english: 'I need help', translation: "J'ai besoin d'aide", pronunciation: 'zhay buh-ZWAN ded', language: 'french', category: 'phrases' },
    { gradeLevel: 7, english: 'See you tomorrow', translation: 'A demain', pronunciation: 'ah duh-MAN', language: 'french', category: 'phrases' },
  ],
  mandarin: [
    { gradeLevel: 1, english: 'Hello', translation: 'Ni hao', pronunciation: 'nee-HOW', language: 'mandarin', category: 'greetings' },
    { gradeLevel: 1, english: 'Goodbye', translation: 'Zai jian', pronunciation: 'zai-jyen', language: 'mandarin', category: 'greetings' },
    { gradeLevel: 1, english: 'Please', translation: 'Qing', pronunciation: 'ching', language: 'mandarin', category: 'greetings' },
    { gradeLevel: 1, english: 'Thank you', translation: 'Xie xie', pronunciation: 'syeh-syeh', language: 'mandarin', category: 'greetings' },
    { gradeLevel: 2, english: 'One', translation: 'Yi', pronunciation: 'ee', language: 'mandarin', category: 'numbers' },
    { gradeLevel: 2, english: 'Two', translation: 'Er', pronunciation: 'ar', language: 'mandarin', category: 'numbers' },
    { gradeLevel: 2, english: 'Three', translation: 'San', pronunciation: 'sahn', language: 'mandarin', category: 'numbers' },
    { gradeLevel: 2, english: 'Red', translation: 'Hong se', pronunciation: 'hong suh', language: 'mandarin', category: 'colors' },
    { gradeLevel: 3, english: 'Blue', translation: 'Lan se', pronunciation: 'lahn suh', language: 'mandarin', category: 'colors' },
    { gradeLevel: 3, english: 'Green', translation: 'Lu se', pronunciation: 'lyoo suh', language: 'mandarin', category: 'colors' },
    { gradeLevel: 3, english: 'Dog', translation: 'Gou', pronunciation: 'go', language: 'mandarin', category: 'animals' },
    { gradeLevel: 3, english: 'Cat', translation: 'Mao', pronunciation: 'mao', language: 'mandarin', category: 'animals' },
    { gradeLevel: 4, english: 'Apple', translation: 'Ping guo', pronunciation: 'ping gwoh', language: 'mandarin', category: 'food' },
    { gradeLevel: 4, english: 'Water', translation: 'Shui', pronunciation: 'shway', language: 'mandarin', category: 'food' },
    { gradeLevel: 4, english: 'School', translation: 'Xue xiao', pronunciation: 'shweh shyow', language: 'mandarin', category: 'school' },
    { gradeLevel: 4, english: 'Book', translation: 'Shu', pronunciation: 'shoo', language: 'mandarin', category: 'school' },
    { gradeLevel: 5, english: 'Mom', translation: 'Mama', pronunciation: 'mah-mah', language: 'mandarin', category: 'family' },
    { gradeLevel: 5, english: 'Dad', translation: 'Baba', pronunciation: 'bah-bah', language: 'mandarin', category: 'family' },
    { gradeLevel: 5, english: 'Friend', translation: 'Peng you', pronunciation: 'pung yo', language: 'mandarin', category: 'family' },
    { gradeLevel: 5, english: 'Park', translation: 'Gong yuan', pronunciation: 'gong ywen', language: 'mandarin', category: 'places' },
    { gradeLevel: 6, english: 'Where is it?', translation: 'Zai na li?', pronunciation: 'zai nah lee', language: 'mandarin', category: 'phrases' },
    { gradeLevel: 6, english: 'I like it', translation: 'Wo xihuan', pronunciation: 'woh shee-hwahn', language: 'mandarin', category: 'phrases' },
    { gradeLevel: 7, english: 'I need help', translation: 'Wo xuyao bangzhu', pronunciation: 'woh shoo-yow bahng-joo', language: 'mandarin', category: 'phrases' },
    { gradeLevel: 7, english: 'See you tomorrow', translation: 'Mingtian jian', pronunciation: 'ming-tyen jyen', language: 'mandarin', category: 'phrases' },
  ],
  japanese: [
    { gradeLevel: 1, english: 'Hello', translation: 'Konnichiwa', pronunciation: 'kohn-nee-chee-wah', language: 'japanese', category: 'greetings' },
    { gradeLevel: 1, english: 'Goodbye', translation: 'Sayonara', pronunciation: 'sah-yoh-nah-rah', language: 'japanese', category: 'greetings' },
    { gradeLevel: 1, english: 'Please', translation: 'Onegai', pronunciation: 'oh-neh-gai', language: 'japanese', category: 'greetings' },
    { gradeLevel: 1, english: 'Thank you', translation: 'Arigato', pronunciation: 'ah-ree-GAH-toh', language: 'japanese', category: 'greetings' },
    { gradeLevel: 2, english: 'One', translation: 'Ichi', pronunciation: 'ee-chee', language: 'japanese', category: 'numbers' },
    { gradeLevel: 2, english: 'Two', translation: 'Ni', pronunciation: 'nee', language: 'japanese', category: 'numbers' },
    { gradeLevel: 2, english: 'Three', translation: 'San', pronunciation: 'sahn', language: 'japanese', category: 'numbers' },
    { gradeLevel: 2, english: 'Red', translation: 'Aka', pronunciation: 'ah-kah', language: 'japanese', category: 'colors' },
    { gradeLevel: 3, english: 'Blue', translation: 'Ao', pronunciation: 'ah-oh', language: 'japanese', category: 'colors' },
    { gradeLevel: 3, english: 'Green', translation: 'Midori', pronunciation: 'mee-doh-ree', language: 'japanese', category: 'colors' },
    { gradeLevel: 3, english: 'Dog', translation: 'Inu', pronunciation: 'ee-noo', language: 'japanese', category: 'animals' },
    { gradeLevel: 3, english: 'Cat', translation: 'Neko', pronunciation: 'neh-koh', language: 'japanese', category: 'animals' },
    { gradeLevel: 4, english: 'Apple', translation: 'Ringo', pronunciation: 'reen-goh', language: 'japanese', category: 'food' },
    { gradeLevel: 4, english: 'Water', translation: 'Mizu', pronunciation: 'mee-zoo', language: 'japanese', category: 'food' },
    { gradeLevel: 4, english: 'School', translation: 'Gakko', pronunciation: 'gahk-koh', language: 'japanese', category: 'school' },
    { gradeLevel: 4, english: 'Book', translation: 'Hon', pronunciation: 'hohn', language: 'japanese', category: 'school' },
    { gradeLevel: 5, english: 'Mom', translation: 'Okaasan', pronunciation: 'oh-kah-sahn', language: 'japanese', category: 'family' },
    { gradeLevel: 5, english: 'Dad', translation: 'Otoosan', pronunciation: 'oh-toh-sahn', language: 'japanese', category: 'family' },
    { gradeLevel: 5, english: 'Friend', translation: 'Tomodachi', pronunciation: 'toh-moh-dah-chee', language: 'japanese', category: 'family' },
    { gradeLevel: 5, english: 'Park', translation: 'Koen', pronunciation: 'koh-en', language: 'japanese', category: 'places' },
    { gradeLevel: 6, english: 'Where is it?', translation: 'Doko desu ka?', pronunciation: 'doh-koh dess kah', language: 'japanese', category: 'phrases' },
    { gradeLevel: 6, english: 'I like it', translation: 'Suki desu', pronunciation: 'skee dess', language: 'japanese', category: 'phrases' },
    { gradeLevel: 7, english: 'I need help', translation: 'Tasukete kudasai', pronunciation: 'tah-soo-keh-teh koo-dah-sai', language: 'japanese', category: 'phrases' },
    { gradeLevel: 7, english: 'See you tomorrow', translation: 'Mata ashita', pronunciation: 'mah-tah ah-shee-tah', language: 'japanese', category: 'phrases' },
  ],
};

const EXTRA_LANGUAGE_WORDS: { [key: string]: LanguageWord[] } = {
  spanish: [
    { gradeLevel: 2, english: 'Four', translation: 'Cuatro', pronunciation: 'KWAH-troh', language: 'spanish', category: 'numbers' },
    { gradeLevel: 2, english: 'Yellow', translation: 'Amarillo', pronunciation: 'ah-mah-REE-yoh', language: 'spanish', category: 'colors' },
    { gradeLevel: 3, english: 'Bird', translation: 'Pajaro', pronunciation: 'PAH-hah-roh', language: 'spanish', category: 'animals' },
    { gradeLevel: 4, english: 'Pencil', translation: 'Lapiz', pronunciation: 'LAH-pees', language: 'spanish', category: 'school' },
    { gradeLevel: 4, english: 'Bread', translation: 'Pan', pronunciation: 'pahn', language: 'spanish', category: 'food' },
    { gradeLevel: 5, english: 'Sister', translation: 'Hermana', pronunciation: 'ehr-MAH-nah', language: 'spanish', category: 'family' },
    { gradeLevel: 6, english: 'I am learning', translation: 'Estoy aprendiendo', pronunciation: 'eh-STOY ah-pren-DYEN-doh', language: 'spanish', category: 'phrases' },
    { gradeLevel: 7, english: 'Can you repeat?', translation: 'Puedes repetir?', pronunciation: 'PWEH-des reh-peh-TEER', language: 'spanish', category: 'phrases' },
  ],
  french: [
    { gradeLevel: 2, english: 'Four', translation: 'Quatre', pronunciation: 'katr', language: 'french', category: 'numbers' },
    { gradeLevel: 2, english: 'Yellow', translation: 'Jaune', pronunciation: 'zhohn', language: 'french', category: 'colors' },
    { gradeLevel: 3, english: 'Bird', translation: 'Oiseau', pronunciation: 'wah-ZOH', language: 'french', category: 'animals' },
    { gradeLevel: 4, english: 'Pencil', translation: 'Crayon', pronunciation: 'kray-OHN', language: 'french', category: 'school' },
    { gradeLevel: 4, english: 'Bread', translation: 'Pain', pronunciation: 'pan', language: 'french', category: 'food' },
    { gradeLevel: 5, english: 'Sister', translation: 'Soeur', pronunciation: 'sur', language: 'french', category: 'family' },
    { gradeLevel: 6, english: 'I am learning', translation: "J'apprends", pronunciation: 'zhah-PRAHN', language: 'french', category: 'phrases' },
    { gradeLevel: 7, english: 'Can you repeat?', translation: 'Pouvez-vous repeter?', pronunciation: 'poo-vay voo reh-pay-TAY', language: 'french', category: 'phrases' },
  ],
  mandarin: [
    { gradeLevel: 2, english: 'Four', translation: 'Si', pronunciation: 'suh', language: 'mandarin', category: 'numbers' },
    { gradeLevel: 2, english: 'Yellow', translation: 'Huang se', pronunciation: 'hwahng suh', language: 'mandarin', category: 'colors' },
    { gradeLevel: 3, english: 'Bird', translation: 'Niao', pronunciation: 'nyow', language: 'mandarin', category: 'animals' },
    { gradeLevel: 4, english: 'Pencil', translation: 'Qian bi', pronunciation: 'chyen bee', language: 'mandarin', category: 'school' },
    { gradeLevel: 4, english: 'Bread', translation: 'Mian bao', pronunciation: 'myen bow', language: 'mandarin', category: 'food' },
    { gradeLevel: 5, english: 'Sister', translation: 'Jiejie', pronunciation: 'jyeh-jyeh', language: 'mandarin', category: 'family' },
    { gradeLevel: 6, english: 'I am learning', translation: 'Wo zai xuexi', pronunciation: 'woh zai shweh-shee', language: 'mandarin', category: 'phrases' },
    { gradeLevel: 7, english: 'Can you repeat?', translation: 'Qing zai shuo yi bian', pronunciation: 'ching zai shwoh ee byen', language: 'mandarin', category: 'phrases' },
  ],
  japanese: [
    { gradeLevel: 2, english: 'Four', translation: 'Yon', pronunciation: 'yohn', language: 'japanese', category: 'numbers' },
    { gradeLevel: 2, english: 'Yellow', translation: 'Kiiro', pronunciation: 'kee-ee-roh', language: 'japanese', category: 'colors' },
    { gradeLevel: 3, english: 'Bird', translation: 'Tori', pronunciation: 'toh-ree', language: 'japanese', category: 'animals' },
    { gradeLevel: 4, english: 'Pencil', translation: 'Enpitsu', pronunciation: 'en-peet-soo', language: 'japanese', category: 'school' },
    { gradeLevel: 4, english: 'Bread', translation: 'Pan', pronunciation: 'pahn', language: 'japanese', category: 'food' },
    { gradeLevel: 5, english: 'Sister', translation: 'Oneesan', pronunciation: 'oh-neh-sahn', language: 'japanese', category: 'family' },
    { gradeLevel: 6, english: 'I am learning', translation: 'Benkyou shiteimasu', pronunciation: 'ben-kyoh shee-teh-ee-mahs', language: 'japanese', category: 'phrases' },
    { gradeLevel: 7, english: 'Can you repeat?', translation: 'Mou ichido onegai', pronunciation: 'moh ee-chee-doh oh-neh-gai', language: 'japanese', category: 'phrases' },
  ],
};

const getLanguageWords = (language: keyof typeof VOCABULARY) => [
  ...VOCABULARY[language],
  ...(EXTRA_LANGUAGE_WORDS[language] || []),
];

export const LANGUAGE_INFO = {
  spanish: { flag: 'ES', name: 'Spanish', color: 'from-red-500 to-yellow-500' },
  french: { flag: 'FR', name: 'French', color: 'from-blue-500 to-red-500' },
  mandarin: { flag: 'CN', name: 'Mandarin', color: 'from-red-500 to-yellow-400' },
  japanese: { flag: 'JP', name: 'Japanese', color: 'from-red-400 to-rose-500' },
};

const CATEGORY_LABELS: { [key: string]: string } = {
  greetings: 'Greeting',
  numbers: 'Number',
  colors: 'Color',
  animals: 'Animal',
  food: 'Food',
  family: 'Family',
  school: 'School',
  places: 'Place',
  phrases: 'Phrase',
};
export const LanguageRoom: React.FC<LanguageRoomProps> = ({ level, onBack, onReward }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof VOCABULARY>('spanish');
  const [currentWord, setCurrentWord] = useState<LanguageWord | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [wordsLearned, setWordsLearned] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [coachTip, setCoachTip] = useState('');

  const availableWords = useMemo(() => {
    const allWords = getLanguageWords(selectedLanguage);
    const words = allWords.filter(word => (word.gradeLevel ?? 1) <= level);
    return words.length >= 4 ? words : allWords.slice(0, 4);
  }, [level, selectedLanguage]);

  const languageTip = useMemo(() => {
    if (mode === 'learn') return 'Listen, say it, then notice the pronunciation pattern.';
    return 'Think of the sound first, then choose the translation.';
  }, [mode]);

  const getNewWord = () => {
    const words = availableWords;
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);

    // Generate wrong options
    const wrongOptions = words
      .filter(w => w.translation !== word.translation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.translation);

    const allOptions = [...wrongOptions, word.translation].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setShowResult(false);
    setCoachTip(languageTip);

    if (mode === 'quiz') {
      void speakAsync(`How do you say ${word.english} in ${LANGUAGE_INFO[selectedLanguage].name}? A. ${allOptions[0]}. B. ${allOptions[1]}. C. ${allOptions[2]}. D. ${allOptions[3]}.`, 0.86, 1.04);
    } else {
      void speakAsync(`${word.english} is ${word.translation}. Say ${word.translation}.`, 0.86, 1.04);
    }
  };

  useEffect(() => {
    getNewWord();
  }, [selectedLanguage, mode, languageTip, availableWords]);

  const speakWord = () => {
    if (currentWord) {
      // Speak the translation with pronunciation guide
      void speakAsync(`${currentWord.translation}. It sounds like ${currentWord.pronunciation}.`, 0.82, 1.0);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult || !currentWord) return;

    setSelectedAnswer(answer);
    const correct = answer === currentWord.translation;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSuccess();
      setScore(s => s + 1);
      setWordsLearned(prev => new Set(prev).add(currentWord.english));
      void speakCorrect(`${currentWord.translation} means ${currentWord.english}. Great job learning ${langInfo.name}.`);
      setTimeout(() => onReward(), 2000);
    } else {
      playWrongBuzzer();
      void speakWrong(`The answer is ${currentWord.translation}. It sounds like ${currentWord.pronunciation}.`);
    }
  };

  const langInfo = LANGUAGE_INFO[selectedLanguage];

  if (!currentWord) return null;

  return (
    <div className="w-full h-full bg-[radial-gradient(circle_at_top_left,#f9a8d4_0,#a855f7_34%,#6366f1_68%,#312e81_100%)] flex flex-col overflow-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm">
        <button onClick={onBack} aria-label="Back to world map" className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
          <ArrowLeft className="text-white" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Languages className="text-white" size={28} />
          <span className="text-2xl font-bold text-white drop-shadow">Language Lab</span>
        </div>
        <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full">
          <Heart className="text-red-300 fill-red-300" size={20} />
          <span className="text-white font-bold">{wordsLearned.size}</span>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex justify-center gap-2 p-4 flex-wrap">
        {(Object.keys(LANGUAGE_INFO) as Array<keyof typeof LANGUAGE_INFO>).map(lang => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-4 py-2 rounded-full font-bold text-base sm:text-lg transition-all transform ${
              selectedLanguage === lang
                ? 'bg-white text-purple-600 scale-110 shadow-lg'
                : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >
            {LANGUAGE_INFO[lang].name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 max-w-2xl w-full relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-pink-100/80" />
          <div className="absolute -left-12 bottom-20 h-32 w-32 rounded-full bg-indigo-100/80" />
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6 relative">
            <div className="bg-gray-100 rounded-full p-1 flex">
              <button
                onClick={() => setMode('learn')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  mode === 'learn' ? 'bg-purple-500 text-white' : 'text-gray-600'
                }`}
              >
                Learn
              </button>
              <button
                onClick={() => setMode('quiz')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  mode === 'quiz' ? 'bg-purple-500 text-white' : 'text-gray-600'
                }`}
              >
                Quiz
              </button>
            </div>
          </div>

          {/* Category Badge */}
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700">
              {CATEGORY_LABELS[currentWord.category] || currentWord.category}
            </span>
          </div>
          <div className="bg-purple-50 border-2 border-purple-100 rounded-2xl px-4 py-3 mb-5">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 mb-1">Language Coach</div>
            <div className="text-purple-900 font-semibold">{coachTip}</div>
          </div>

          <div className="relative mb-5 overflow-hidden rounded-2xl border-2 border-fuchsia-100 bg-gradient-to-br from-pink-50 via-white to-indigo-50 p-4 shadow-inner">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-600">Word Passport</div>
                <div className="text-lg font-black text-slate-800">Listen, Say, Match</div>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-fuchsia-700 shadow-sm">
                {wordsLearned.size} words saved
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['Listen', 'Hear the word'],
                ['Say', 'Practice out loud'],
                ['Match', 'Choose meaning'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-xl bg-white/95 p-3 text-center shadow-sm ring-1 ring-fuchsia-100">
                  <div className="text-sm font-black text-slate-800">{title}</div>
                  <div className="text-xs font-semibold text-slate-500">{copy}</div>
                </div>
              ))}
            </div>
          </div>

          {mode === 'learn' ? (
            /* Learn Mode */
            <div className="text-center">
              {/* English Word */}
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 mb-4">
                <p className="text-sm text-gray-500 mb-1">English</p>
                <p className="text-4xl font-bold text-gray-800">{currentWord.english}</p>
              </div>

              {/* Translation */}
              <div className={`bg-gradient-to-r ${langInfo.color} rounded-xl p-6 mb-4`}>
                <p className="text-sm text-white/80 mb-1">{langInfo.name}</p>
                <p className="text-4xl font-bold text-white">{currentWord.translation}</p>
                <p className="text-lg text-white/90 mt-2 italic">"{currentWord.pronunciation}"</p>
              </div>

              {/* Listen Button */}
              <button
                onClick={speakWord}
                className="mb-6 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <Volume2 size={24} />
                Listen & Repeat
              </button>

              {/* Next Button */}
              <button
                onClick={getNewWord}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-600 transition"
              >
                Next Word
              </button>
            </div>
          ) : (
            /* Quiz Mode */
            <>
              {/* Question */}
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 mb-6 text-center">
                <p className="text-sm text-gray-500 mb-2">How do you say this in {langInfo.name}?</p>
                <p className="text-4xl font-bold text-gray-800">{currentWord.english}</p>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {options.map((option, index) => {
                  let buttonClass = 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-purple-100 hover:to-pink-100 text-gray-700 border-2 border-gray-200';

                  if (showResult) {
                    if (option === currentWord.translation) {
                      buttonClass = 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-2 border-green-400';
                    } else if (option === selectedAnswer) {
                      buttonClass = 'bg-gradient-to-r from-red-400 to-rose-500 text-white border-2 border-red-400';
                    } else {
                      buttonClass = 'bg-gray-100 text-gray-400 border-2 border-gray-200';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                      className={`p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-md ${buttonClass}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Result */}
              {showResult && (
                <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-black uppercase tracking-wide text-slate-700">
                      {isCorrect ? 'Nice' : 'Learn'}
                    </span>
                    <div>
                      <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                        {isCorrect ? 'Perfect!' : `It's ${currentWord.translation}`}
                      </p>
                      <p className="text-gray-600">
                        Pronunciation: "{currentWord.pronunciation}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Button */}
              {showResult && (
                <button
                  onClick={getNewWord}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105"
                >
                  {isCorrect ? 'Next Word!' : 'Try Another!'}
                </button>
              )}
            </>
          )}

          {/* Score */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-400 px-3 py-1 rounded-full shadow">
            <Star className="text-white fill-white" size={16} />
            <span className="text-white font-bold">{score}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
