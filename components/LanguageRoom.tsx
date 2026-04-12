import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Languages, Star, Volume2, Flag, Heart } from 'lucide-react';
import { LanguageWord } from '../types';
import { speak, speakAsync, speakCorrect, speakWrong, speakQuestion, playSuccess, playWrongBuzzer } from '../services/audioService';

interface LanguageRoomProps {
  level: number;
  onBack: () => void;
  onReward: () => void;
}

// Language vocabulary with translations
export const VOCABULARY: { [key: string]: LanguageWord[] } = {
  spanish: [
    // Greetings
    { english: 'Hello', translation: 'Hola', pronunciation: 'OH-lah', language: 'spanish', category: 'greetings' },
    { english: 'Goodbye', translation: 'Adiós', pronunciation: 'ah-dee-OHS', language: 'spanish', category: 'greetings' },
    { english: 'Please', translation: 'Por favor', pronunciation: 'por fah-VOR', language: 'spanish', category: 'greetings' },
    { english: 'Thank you', translation: 'Gracias', pronunciation: 'GRAH-see-ahs', language: 'spanish', category: 'greetings' },
    { english: 'Good morning', translation: 'Buenos días', pronunciation: 'BWEH-nohs DEE-ahs', language: 'spanish', category: 'greetings' },
    // Numbers
    { english: 'One', translation: 'Uno', pronunciation: 'OO-noh', language: 'spanish', category: 'numbers' },
    { english: 'Two', translation: 'Dos', pronunciation: 'dohs', language: 'spanish', category: 'numbers' },
    { english: 'Three', translation: 'Tres', pronunciation: 'trehs', language: 'spanish', category: 'numbers' },
    { english: 'Four', translation: 'Cuatro', pronunciation: 'KWAH-troh', language: 'spanish', category: 'numbers' },
    { english: 'Five', translation: 'Cinco', pronunciation: 'SEEN-koh', language: 'spanish', category: 'numbers' },
    // Colors
    { english: 'Red', translation: 'Rojo', pronunciation: 'ROH-hoh', language: 'spanish', category: 'colors' },
    { english: 'Blue', translation: 'Azul', pronunciation: 'ah-SOOL', language: 'spanish', category: 'colors' },
    { english: 'Green', translation: 'Verde', pronunciation: 'BEHR-deh', language: 'spanish', category: 'colors' },
    { english: 'Yellow', translation: 'Amarillo', pronunciation: 'ah-mah-REE-yoh', language: 'spanish', category: 'colors' },
    // Animals
    { english: 'Dog', translation: 'Perro', pronunciation: 'PEH-rroh', language: 'spanish', category: 'animals' },
    { english: 'Cat', translation: 'Gato', pronunciation: 'GAH-toh', language: 'spanish', category: 'animals' },
    { english: 'Bird', translation: 'Pájaro', pronunciation: 'PAH-hah-roh', language: 'spanish', category: 'animals' },
    // Food
    { english: 'Apple', translation: 'Manzana', pronunciation: 'mahn-SAH-nah', language: 'spanish', category: 'food' },
    { english: 'Water', translation: 'Agua', pronunciation: 'AH-gwah', language: 'spanish', category: 'food' },
    { english: 'Bread', translation: 'Pan', pronunciation: 'pahn', language: 'spanish', category: 'food' },
    // Family
    { english: 'Mom', translation: 'Mamá', pronunciation: 'mah-MAH', language: 'spanish', category: 'family' },
    { english: 'Dad', translation: 'Papá', pronunciation: 'pah-PAH', language: 'spanish', category: 'family' },
    { english: 'Friend', translation: 'Amigo', pronunciation: 'ah-MEE-goh', language: 'spanish', category: 'family' },
  ],
  french: [
    // Greetings
    { english: 'Hello', translation: 'Bonjour', pronunciation: 'bon-ZHOOR', language: 'french', category: 'greetings' },
    { english: 'Goodbye', translation: 'Au revoir', pronunciation: 'oh reh-VWAHR', language: 'french', category: 'greetings' },
    { english: 'Please', translation: "S'il vous plaît", pronunciation: 'seel voo PLEH', language: 'french', category: 'greetings' },
    { english: 'Thank you', translation: 'Merci', pronunciation: 'mehr-SEE', language: 'french', category: 'greetings' },
    // Numbers
    { english: 'One', translation: 'Un', pronunciation: 'uhn', language: 'french', category: 'numbers' },
    { english: 'Two', translation: 'Deux', pronunciation: 'duh', language: 'french', category: 'numbers' },
    { english: 'Three', translation: 'Trois', pronunciation: 'trwah', language: 'french', category: 'numbers' },
    // Colors
    { english: 'Red', translation: 'Rouge', pronunciation: 'roozh', language: 'french', category: 'colors' },
    { english: 'Blue', translation: 'Bleu', pronunciation: 'bluh', language: 'french', category: 'colors' },
    { english: 'Green', translation: 'Vert', pronunciation: 'vehr', language: 'french', category: 'colors' },
    // Animals
    { english: 'Dog', translation: 'Chien', pronunciation: 'shee-EN', language: 'french', category: 'animals' },
    { english: 'Cat', translation: 'Chat', pronunciation: 'shah', language: 'french', category: 'animals' },
    // Food
    { english: 'Apple', translation: 'Pomme', pronunciation: 'puhm', language: 'french', category: 'food' },
    { english: 'Water', translation: 'Eau', pronunciation: 'oh', language: 'french', category: 'food' },
  ],
  mandarin: [
    // Greetings
    { english: 'Hello', translation: '你好', pronunciation: 'nee-HOW', language: 'mandarin', category: 'greetings' },
    { english: 'Thank you', translation: '谢谢', pronunciation: 'syeh-syeh', language: 'mandarin', category: 'greetings' },
    { english: 'Goodbye', translation: '再见', pronunciation: 'zai-jyen', language: 'mandarin', category: 'greetings' },
    // Numbers
    { english: 'One', translation: '一', pronunciation: 'ee', language: 'mandarin', category: 'numbers' },
    { english: 'Two', translation: '二', pronunciation: 'er', language: 'mandarin', category: 'numbers' },
    { english: 'Three', translation: '三', pronunciation: 'san', language: 'mandarin', category: 'numbers' },
    // Animals
    { english: 'Dog', translation: '狗', pronunciation: 'go', language: 'mandarin', category: 'animals' },
    { english: 'Cat', translation: '猫', pronunciation: 'mao', language: 'mandarin', category: 'animals' },
  ],
  japanese: [
    // Greetings
    { english: 'Hello', translation: 'こんにちは', pronunciation: 'kohn-nee-chee-wah', language: 'japanese', category: 'greetings' },
    { english: 'Thank you', translation: 'ありがとう', pronunciation: 'ah-ree-GAH-toh', language: 'japanese', category: 'greetings' },
    { english: 'Goodbye', translation: 'さようなら', pronunciation: 'sah-yoh-nah-rah', language: 'japanese', category: 'greetings' },
    // Numbers
    { english: 'One', translation: '一', pronunciation: 'ee-chee', language: 'japanese', category: 'numbers' },
    { english: 'Two', translation: '二', pronunciation: 'nee', language: 'japanese', category: 'numbers' },
    { english: 'Three', translation: '三', pronunciation: 'sahn', language: 'japanese', category: 'numbers' },
    // Animals
    { english: 'Dog', translation: '犬', pronunciation: 'ee-noo', language: 'japanese', category: 'animals' },
    { english: 'Cat', translation: '猫', pronunciation: 'neh-koh', language: 'japanese', category: 'animals' },
  ],
};

export const LANGUAGE_INFO = {
  spanish: { flag: '🇪🇸', name: 'Spanish', color: 'from-red-500 to-yellow-500' },
  french: { flag: '🇫🇷', name: 'French', color: 'from-blue-500 to-red-500' },
  mandarin: { flag: '🇨🇳', name: 'Mandarin', color: 'from-red-500 to-yellow-400' },
  japanese: { flag: '🇯🇵', name: 'Japanese', color: 'from-red-400 to-white' },
};

const CATEGORY_EMOJIS: { [key: string]: string } = {
  greetings: '👋',
  numbers: '🔢',
  colors: '🌈',
  animals: '🐾',
  food: '🍎',
  family: '👨‍👩‍👧',
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

  const languageTip = useMemo(() => {
    if (mode === 'learn') return 'Listen, say it, then notice the pronunciation pattern.';
    return 'Think of the sound first, then choose the translation.';
  }, [mode]);

  const teacherIntro = useMemo(() => {
    if (mode === 'learn') return 'Teacher says: Listen first, then repeat the new word clearly.';
    return 'Teacher says: Think of the translation before you choose your answer.';
  }, [mode]);

  const getNewWord = () => {
    const words = VOCABULARY[selectedLanguage];
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

    void (async () => {
      await speakAsync(teacherIntro, 0.88, 1.03);
      if (mode === 'quiz') {
        await speakAsync(`How do you say ${word.english} in ${LANGUAGE_INFO[selectedLanguage].name}?`, 0.86, 1.04);
      } else {
        await speakAsync(`In ${LANGUAGE_INFO[selectedLanguage].name}, ${word.english} is ${word.translation}.`, 0.86, 1.04);
        await speakAsync(`Say it after me. ${word.translation}.`, 0.82, 1.0);
      }
    })();
  };

  useEffect(() => {
    const startLesson = async () => {
      await speakAsync(`Welcome to the Language Lab. ${languageTip}`);
      getNewWord();
    };
    void startLesson();
  }, [selectedLanguage, mode, languageTip]);

  const speakWord = () => {
    if (currentWord) {
      // Speak the translation with pronunciation guide
      void speakAsync(`Teacher says: ${currentWord.translation}. It sounds like ${currentWord.pronunciation}.`, 0.82, 1.0);
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
    <div className="w-full h-full bg-gradient-to-b from-pink-400 via-purple-500 to-indigo-600 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm">
        <button onClick={onBack} className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
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
      <div className="flex justify-center gap-2 p-4">
        {(Object.keys(LANGUAGE_INFO) as Array<keyof typeof LANGUAGE_INFO>).map(lang => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-4 py-2 rounded-full font-bold text-lg transition-all transform ${
              selectedLanguage === lang
                ? 'bg-white text-purple-600 scale-110 shadow-lg'
                : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >
            {LANGUAGE_INFO[lang].flag} {LANGUAGE_INFO[lang].name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-full p-1 flex">
              <button
                onClick={() => setMode('learn')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  mode === 'learn' ? 'bg-purple-500 text-white' : 'text-gray-600'
                }`}
              >
                📚 Learn
              </button>
              <button
                onClick={() => setMode('quiz')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  mode === 'quiz' ? 'bg-purple-500 text-white' : 'text-gray-600'
                }`}
              >
                🎯 Quiz
              </button>
            </div>
          </div>

          {/* Category Badge */}
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700">
              {CATEGORY_EMOJIS[currentWord.category]} {currentWord.category}
            </span>
          </div>
          <div className="bg-purple-50 border-2 border-purple-100 rounded-2xl px-4 py-3 mb-5">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-purple-500 mb-1">Language Coach</div>
            <div className="text-purple-900 font-semibold">{coachTip}</div>
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
                Next Word →
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
                    <span className="text-2xl">{isCorrect ? '🎉' : '💪'}</span>
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
                  {isCorrect ? 'Next Word! 🌟' : 'Try Another!'}
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
