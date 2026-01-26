import React, { useState, useEffect } from 'react';
import { ArrowLeft, Globe2, MapPin, Star, Plane, Volume2 } from 'lucide-react';
import { GeographyQuestion } from '../types';
import { speak, speakCorrect, speakWrong, speakQuestion, playSuccess, playWrongBuzzer } from '../services/audioService';

interface GeographyRoomProps {
  level: number; // 1-7 corresponds to grade levels
  onBack: () => void;
  onReward: () => void;
}

// Geography questions organized by grade level
const GEOGRAPHY_QUESTIONS: (GeographyQuestion & { gradeLevel: number })[] = [
  // PRE-K (Level 1) - Very simple
  { gradeLevel: 1, type: 'country', question: 'Do you live on planet Earth? 🌍', answer: 'Yes!', options: ['Yes!', 'No', 'Maybe', 'I don\'t know'], funFact: 'Earth is our home planet! It\'s the only planet with people on it!' },
  { gradeLevel: 1, type: 'landmark', question: 'What color is the sky on a sunny day? ☀️', answer: 'Blue', options: ['Blue', 'Green', 'Red', 'Purple'], funFact: 'The sky looks blue because of how sunlight bounces around!' },
  { gradeLevel: 1, type: 'nature', question: 'What do we call the big blue areas of water on Earth? 🌊', answer: 'Oceans', options: ['Oceans', 'Rivers', 'Puddles', 'Pools'], funFact: 'Oceans cover most of Earth! That\'s why Earth is called the Blue Planet!' },

  // KINDERGARTEN (Level 2)
  { gradeLevel: 2, type: 'flag', question: 'Which country has this flag? 🇺🇸', answer: 'United States', options: ['United States', 'United Kingdom', 'France', 'Canada'], funFact: 'The US flag has 50 stars - one for each state!' },
  { gradeLevel: 2, type: 'continent', question: 'Which is the largest continent?', answer: 'Asia', options: ['Africa', 'Europe', 'Asia', 'North America'], funFact: 'More than half of the world\'s people live in Asia!' },
  { gradeLevel: 2, type: 'landmark', question: 'Where is the Statue of Liberty?', answer: 'United States', options: ['France', 'United States', 'Italy', 'Greece'], funFact: 'The Statue of Liberty was a gift from France!' },
  { gradeLevel: 2, type: 'country', question: 'Which country has kangaroos?', answer: 'Australia', options: ['Africa', 'Australia', 'South America', 'Indonesia'], funFact: 'Baby kangaroos are called joeys!' },

  // FIRST GRADE (Level 3)
  { gradeLevel: 3, type: 'flag', question: 'Which country has this flag? 🇬🇧', answer: 'United Kingdom', options: ['Australia', 'United Kingdom', 'New Zealand', 'Iceland'], funFact: 'The UK flag is called the Union Jack!' },
  { gradeLevel: 3, type: 'flag', question: 'Which country has this flag? 🇯🇵', answer: 'Japan', options: ['China', 'Korea', 'Japan', 'Vietnam'], funFact: 'Japan is called the Land of the Rising Sun!' },
  { gradeLevel: 3, type: 'continent', question: 'Which continent has penguins and is covered in ice?', answer: 'Antarctica', options: ['Arctic', 'Antarctica', 'Australia', 'Europe'], funFact: 'Antarctica is the coldest, windiest, and driest continent!' },
  { gradeLevel: 3, type: 'landmark', question: 'Where is the Eiffel Tower?', answer: 'France', options: ['Italy', 'Spain', 'France', 'Germany'], funFact: 'The Eiffel Tower was only meant to stand for 20 years!' },
  { gradeLevel: 3, type: 'country', question: 'Which country is shaped like a boot?', answer: 'Italy', options: ['Spain', 'Italy', 'Greece', 'France'], funFact: 'Italy is famous for pizza, pasta, and gelato!' },

  // SECOND GRADE (Level 4)
  { gradeLevel: 4, type: 'flag', question: 'Which country has this flag? 🇫🇷', answer: 'France', options: ['Italy', 'France', 'Belgium', 'Ireland'], funFact: 'The Eiffel Tower in France is visited by 7 million people every year!' },
  { gradeLevel: 4, type: 'flag', question: 'Which country has this flag? 🇧🇷', answer: 'Brazil', options: ['Portugal', 'Argentina', 'Brazil', 'Mexico'], funFact: 'Brazil is the largest country in South America!' },
  { gradeLevel: 4, type: 'flag', question: 'Which country has this flag? 🇨🇦', answer: 'Canada', options: ['United States', 'Canada', 'Switzerland', 'Japan'], funFact: 'Canada has more lakes than all other countries combined!' },
  { gradeLevel: 4, type: 'capital', question: 'What is the capital of the United States?', answer: 'Washington D.C.', options: ['New York', 'Washington D.C.', 'Los Angeles', 'Chicago'], funFact: 'Washington D.C. is not in any state!' },
  { gradeLevel: 4, type: 'capital', question: 'What is the capital of France?', answer: 'Paris', options: ['Lyon', 'Paris', 'Nice', 'Marseille'], funFact: 'Paris is called the City of Light!' },
  { gradeLevel: 4, type: 'landmark', question: 'Where is the Great Wall?', answer: 'China', options: ['Japan', 'China', 'India', 'Korea'], funFact: 'The Great Wall is over 13,000 miles long!' },

  // THIRD GRADE (Level 5)
  { gradeLevel: 5, type: 'flag', question: 'Which country has this flag? 🇦🇺', answer: 'Australia', options: ['Australia', 'New Zealand', 'United Kingdom', 'Fiji'], funFact: 'Australia is both a country and a continent!' },
  { gradeLevel: 5, type: 'flag', question: 'Which country has this flag? 🇮🇹', answer: 'Italy', options: ['Mexico', 'Italy', 'Ireland', 'Hungary'], funFact: 'Pizza was invented in Italy!' },
  { gradeLevel: 5, type: 'flag', question: 'Which country has this flag? 🇲🇽', answer: 'Mexico', options: ['Mexico', 'Italy', 'Spain', 'Brazil'], funFact: 'Mexico introduced chocolate to the world!' },
  { gradeLevel: 5, type: 'capital', question: 'What is the capital of Japan?', answer: 'Tokyo', options: ['Osaka', 'Kyoto', 'Tokyo', 'Hokkaido'], funFact: 'Tokyo is one of the biggest cities in the world!' },
  { gradeLevel: 5, type: 'capital', question: 'What is the capital of the United Kingdom?', answer: 'London', options: ['Manchester', 'London', 'Edinburgh', 'Liverpool'], funFact: 'London has been a major city for nearly 2,000 years!' },
  { gradeLevel: 5, type: 'continent', question: 'Which continent has the most countries?', answer: 'Africa', options: ['Europe', 'Asia', 'Africa', 'South America'], funFact: 'Africa has 54 countries!' },
  { gradeLevel: 5, type: 'landmark', question: 'Where are the Pyramids?', answer: 'Egypt', options: ['Mexico', 'Egypt', 'Greece', 'Morocco'], funFact: 'The pyramids are over 4,500 years old!' },

  // FOURTH GRADE (Level 6)
  { gradeLevel: 6, type: 'flag', question: 'Which country has this flag? 🇨🇳', answer: 'China', options: ['Japan', 'China', 'Vietnam', 'Korea'], funFact: 'The Great Wall of China is so long it would take 18 months to walk!' },
  { gradeLevel: 6, type: 'flag', question: 'Which country has this flag? 🇮🇳', answer: 'India', options: ['India', 'Niger', 'Ireland', 'Ivory Coast'], funFact: 'India has more people than any other country except China!' },
  { gradeLevel: 6, type: 'flag', question: 'Which country has this flag? 🇪🇸', answer: 'Spain', options: ['Spain', 'Portugal', 'Italy', 'Colombia'], funFact: 'Spanish is spoken in over 20 countries!' },
  { gradeLevel: 6, type: 'capital', question: 'What is the capital of Australia?', answer: 'Canberra', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], funFact: 'Canberra was specially built to be the capital!' },
  { gradeLevel: 6, type: 'continent', question: 'Which continent is also a country?', answer: 'Australia', options: ['Antarctica', 'Australia', 'Europe', 'Africa'], funFact: 'Australia has animals found nowhere else, like kangaroos and koalas!' },
  { gradeLevel: 6, type: 'landmark', question: 'Where is Big Ben?', answer: 'United Kingdom', options: ['United States', 'France', 'Germany', 'United Kingdom'], funFact: 'Big Ben is actually the name of the bell inside the clock tower!' },
  { gradeLevel: 6, type: 'country', question: 'Which country has the most people?', answer: 'China', options: ['United States', 'India', 'China', 'Brazil'], funFact: 'China has over 1.4 billion people!' },

  // FIFTH GRADE (Level 7)
  { gradeLevel: 7, type: 'flag', question: 'Which country has this flag? 🇷🇺', answer: 'Russia', options: ['France', 'Russia', 'Netherlands', 'Luxembourg'], funFact: 'Russia is the largest country in the world by land area!' },
  { gradeLevel: 7, type: 'flag', question: 'Which country has this flag? 🇰🇷', answer: 'South Korea', options: ['Japan', 'China', 'South Korea', 'Taiwan'], funFact: 'South Korea is known for K-pop music and amazing technology!' },
  { gradeLevel: 7, type: 'flag', question: 'Which country has this flag? 🇿🇦', answer: 'South Africa', options: ['South Africa', 'Nigeria', 'Kenya', 'Ethiopia'], funFact: 'South Africa has 11 official languages!' },
  { gradeLevel: 7, type: 'capital', question: 'What is the capital of Germany?', answer: 'Berlin', options: ['Munich', 'Berlin', 'Frankfurt', 'Hamburg'], funFact: 'The Berlin Wall divided the city for 28 years!' },
  { gradeLevel: 7, type: 'capital', question: 'What is the capital of Italy?', answer: 'Rome', options: ['Rome', 'Milan', 'Venice', 'Florence'], funFact: 'Rome was the center of the ancient Roman Empire!' },
  { gradeLevel: 7, type: 'capital', question: 'What is the capital of China?', answer: 'Beijing', options: ['Shanghai', 'Beijing', 'Hong Kong', 'Guangzhou'], funFact: 'Beijing hosted the Summer Olympics in 2008!' },
  { gradeLevel: 7, type: 'landmark', question: 'Where is the Taj Mahal?', answer: 'India', options: ['Pakistan', 'India', 'Bangladesh', 'Nepal'], funFact: 'The Taj Mahal took over 20 years to build!' },
  { gradeLevel: 7, type: 'landmark', question: 'Where is Machu Picchu?', answer: 'Peru', options: ['Mexico', 'Peru', 'Chile', 'Colombia'], funFact: 'Machu Picchu was built by the Inca civilization over 500 years ago!' },
];

export const GeographyRoom: React.FC<GeographyRoomProps> = ({ level, onBack, onReward }) => {
  // Filter questions by grade level
  const availableQuestions = GEOGRAPHY_QUESTIONS.filter(q => q.gradeLevel <= level);

  const [question, setQuestion] = useState<typeof GEOGRAPHY_QUESTIONS[0] | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [countriesLearned, setCountriesLearned] = useState<Set<string>>(new Set());

  const getNewQuestion = () => {
    const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    // Shuffle options
    const shuffledOptions = [...randomQ.options].sort(() => Math.random() - 0.5);
    setQuestion({ ...randomQ, options: shuffledOptions });
    setSelectedAnswer(null);
    setShowResult(false);

    // Read the question aloud
    setTimeout(() => {
      speakQuestion(randomQ.question.replace(/🇺🇸|🇬🇧|🇯🇵|🇫🇷|🇧🇷|🇨🇦|🇦🇺|🇮🇹|🇲🇽|🇨🇳|🇮🇳|🇪🇸|🇷🇺|🇰🇷|🇿🇦|🌍|☀️|🌊/g, ''));
    }, 500);
  };

  useEffect(() => {
    speak("Welcome to Geography Globe! Let's explore the world!");
    setTimeout(() => getNewQuestion(), 1500);
  }, []);

  const readQuestionAloud = () => {
    if (question) {
      speakQuestion(question.question.replace(/🇺🇸|🇬🇧|🇯🇵|🇫🇷|🇧🇷|🇨🇦|🇦🇺|🇮🇹|🇲🇽|🇨🇳|🇮🇳|🇪🇸|🇷🇺|🇰🇷|🇿🇦|🌍|☀️|🌊/g, ''));
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult || !question) return;

    setSelectedAnswer(answer);
    const correct = answer === question.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSuccess();
      setScore(s => s + 1);
      setCountriesLearned(prev => new Set(prev).add(question.answer));
      speakCorrect(question.funFact);
      setTimeout(() => onReward(), 2000);
    } else {
      playWrongBuzzer();
      speakWrong(`The answer is ${question.answer}. ${question.funFact}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flag': return '🏳️';
      case 'continent': return '🌍';
      case 'capital': return '🏛️';
      case 'landmark': return '🗿';
      case 'country': return '📍';
      case 'nature': return '🌊';
      default: return '🌎';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flag': return 'from-red-400 to-blue-500';
      case 'continent': return 'from-green-400 to-teal-500';
      case 'capital': return 'from-purple-400 to-indigo-500';
      case 'landmark': return 'from-yellow-400 to-orange-500';
      case 'country': return 'from-pink-400 to-rose-500';
      case 'nature': return 'from-cyan-400 to-blue-500';
      default: return 'from-cyan-400 to-blue-500';
    }
  };

  if (!question) return null;

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-400 via-cyan-500 to-teal-600 flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm">
        <button onClick={onBack} className="p-2 bg-white/30 rounded-full hover:bg-white/50 transition">
          <ArrowLeft className="text-white" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Globe2 className="text-white" size={28} />
          <span className="text-2xl font-bold text-white drop-shadow">Geography Globe</span>
        </div>
        <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full">
          <MapPin className="text-red-300" size={20} />
          <span className="text-white font-bold">{countriesLearned.size}</span>
        </div>
      </div>

      {/* Floating decorations */}
      <div className="absolute top-20 left-10 text-4xl animate-float opacity-50">✈️</div>
      <div className="absolute top-40 right-10 text-4xl animate-float-delayed opacity-50">🌍</div>
      <div className="absolute bottom-40 left-20 text-4xl animate-float opacity-50">🗺️</div>
      <div className="absolute bottom-20 right-20 text-4xl animate-float-delayed opacity-50">🧭</div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full relative overflow-hidden">
          {/* Decorative globe background */}
          <div className="absolute -right-16 -top-16 text-[150px] opacity-10 rotate-12">🌍</div>

          {/* Type Badge */}
          <div className="text-center mb-4 flex items-center justify-center gap-2">
            <span className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-gradient-to-r ${getTypeColor(question.type)} text-white shadow-lg`}>
              <span>{getTypeIcon(question.type)}</span>
              {question.type}
            </span>
            <button
              onClick={readQuestionAloud}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <Volume2 className="text-gray-600" size={16} />
            </button>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 mb-6 relative">
            <p className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {question.options.map((option, index) => {
              let buttonClass = 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-cyan-100 text-gray-700 border-2 border-gray-200';

              if (showResult) {
                if (option === question.answer) {
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

          {/* Result & Fun Fact */}
          {showResult && (
            <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-100' : 'bg-orange-100'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{isCorrect ? '🎉' : '🌟'}</span>
                <div>
                  <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                    {isCorrect ? 'Correct!' : `The answer is ${question.answer}`}
                  </p>
                  <p className="text-gray-600 mt-1">{question.funFact}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button
              onClick={getNewQuestion}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plane size={20} />
              Explore More!
            </button>
          )}

          {/* Score Display */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-400 px-3 py-1 rounded-full shadow">
            <Star className="text-white fill-white" size={16} />
            <span className="text-white font-bold">{score}</span>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 text-center text-sm text-gray-500">
            {availableQuestions.length} locations to explore at your level
          </div>
        </div>
      </div>
    </div>
  );
};
