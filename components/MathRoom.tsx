import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { speak, speakQuestion, speakCorrect, speakWrong, playSuccess, playWrongBuzzer, speakAsync } from '../services/audioService';
import { MathProblem } from '../types';
import { Star, ArrowLeft, Volume2, RefreshCw, Calculator } from 'lucide-react';

interface MathRoomProps {
  onBack: () => void;
  onReward: () => void;
  level: number; // 1-7 corresponds to grade levels
}

// Generate math problems based on grade level
const generateMathProblem = (level: number): MathProblem => {
  let a: number, b: number, question: string, answer: number;
  let explanation: string;

  switch (level) {
    case 1: // Pre-K: counting and simple addition 0-5
      a = Math.floor(Math.random() * 3) + 1;
      b = Math.floor(Math.random() * 3) + 1;
      answer = a + b;
      question = `${a} + ${b} = ?`;
      explanation = `${a} plus ${b} equals ${answer}`;
      break;

    case 2: // Kindergarten: addition and subtraction 0-10
      if (Math.random() > 0.5) {
        a = Math.floor(Math.random() * 6) + 1;
        b = Math.floor(Math.random() * 5) + 1;
        answer = a + b;
        question = `${a} + ${b} = ?`;
        explanation = `${a} plus ${b} equals ${answer}`;
      } else {
        a = Math.floor(Math.random() * 6) + 5;
        b = Math.floor(Math.random() * a);
        answer = a - b;
        question = `${a} - ${b} = ?`;
        explanation = `${a} minus ${b} equals ${answer}`;
      }
      break;

    case 3: // 1st Grade: addition and subtraction 0-20
      if (Math.random() > 0.5) {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        answer = a + b;
        question = `${a} + ${b} = ?`;
        explanation = `${a} plus ${b} equals ${answer}`;
      } else {
        a = Math.floor(Math.random() * 10) + 10;
        b = Math.floor(Math.random() * 10);
        answer = a - b;
        question = `${a} - ${b} = ?`;
        explanation = `${a} minus ${b} equals ${answer}`;
      }
      break;

    case 4: // 2nd Grade: larger addition/subtraction, intro multiplication
      const rand4 = Math.random();
      if (rand4 > 0.66) {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 50) + 10;
        answer = a + b;
        question = `${a} + ${b} = ?`;
        explanation = `${a} plus ${b} equals ${answer}`;
      } else if (rand4 > 0.33) {
        a = Math.floor(Math.random() * 50) + 50;
        b = Math.floor(Math.random() * 50);
        answer = a - b;
        question = `${a} - ${b} = ?`;
        explanation = `${a} minus ${b} equals ${answer}`;
      } else {
        a = Math.floor(Math.random() * 5) + 1;
        b = Math.floor(Math.random() * 5) + 1;
        answer = a * b;
        question = `${a} × ${b} = ?`;
        explanation = `${a} times ${b} equals ${answer}`;
      }
      break;

    case 5: // 3rd Grade: multiplication facts, simple division
      if (Math.random() > 0.5) {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        answer = a * b;
        question = `${a} × ${b} = ?`;
        explanation = `${a} times ${b} equals ${answer}`;
      } else {
        b = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 10) + 1;
        a = b * answer;
        question = `${a} ÷ ${b} = ?`;
        explanation = `${a} divided by ${b} equals ${answer}`;
      }
      break;

    case 6: // 4th Grade: multi-digit multiplication
      if (Math.random() > 0.5) {
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        question = `${a} × ${b} = ?`;
        explanation = `${a} times ${b} equals ${answer}`;
      } else {
        b = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 12) + 1;
        a = b * answer;
        question = `${a} ÷ ${b} = ?`;
        explanation = `${a} divided by ${b} equals ${answer}`;
      }
      break;

    case 7: // 5th Grade: all operations with larger numbers
    default:
      const rand7 = Math.random();
      if (rand7 > 0.75) {
        a = Math.floor(Math.random() * 100) + 50;
        b = Math.floor(Math.random() * 100) + 50;
        answer = a + b;
        question = `${a} + ${b} = ?`;
        explanation = `${a} plus ${b} equals ${answer}`;
      } else if (rand7 > 0.5) {
        a = Math.floor(Math.random() * 100) + 100;
        b = Math.floor(Math.random() * 100);
        answer = a - b;
        question = `${a} - ${b} = ?`;
        explanation = `${a} minus ${b} equals ${answer}`;
      } else if (rand7 > 0.25) {
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        answer = a * b;
        question = `${a} × ${b} = ?`;
        explanation = `${a} times ${b} equals ${answer}`;
      } else {
        b = Math.floor(Math.random() * 11) + 2;
        answer = Math.floor(Math.random() * 12) + 2;
        a = b * answer;
        question = `${a} ÷ ${b} = ?`;
        explanation = `${a} divided by ${b} equals ${answer}`;
      }
      break;
  }

  // Generate options
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    if (offset !== 0 && answer + offset > 0) {
      options.add(answer + offset);
    }
    if (options.size < 4) {
      options.add(Math.max(1, answer + Math.floor(Math.random() * 20) - 10));
    }
  }

  return {
    question,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
    difficulty: Math.min(level, 5) as 1 | 2 | 3 | 4 | 5,
    explanation,
    subject: 'math'
  };
};

export const MathRoom: React.FC<MathRoomProps> = ({ onBack, onReward, level }) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [coachTip, setCoachTip] = useState('');

  const lessonLabel = useMemo(() => {
    if (level <= 2) return 'Count and picture the groups';
    if (level <= 4) return 'Look for the operation clue';
    if (level <= 5) return 'Use fact families and patterns';
    return 'Estimate first, then solve carefully';
  }, [level]);

  const buildCoachTip = useCallback((text: string) => {
    if (text.includes('+')) return 'Touch each group and count all together.';
    if (text.includes('-')) return 'Start with the big number, then count back.';
    if (text.includes('×')) return 'Think of equal groups and skip count.';
    if (text.includes('÷')) return 'Split the total into equal groups.';
    return 'Take your time and solve one step at a time.';
  }, []);

  const buildTeacherIntro = useCallback((text: string) => {
    if (text.includes('+')) return 'Teacher says: Let us add the groups together.';
    if (text.includes('-')) return 'Teacher says: Start with the big number and count back carefully.';
    if (text.includes('×')) return 'Teacher says: Look for equal groups and use skip counting.';
    if (text.includes('÷')) return 'Teacher says: Think about sharing into equal groups.';
    return 'Teacher says: Read the problem carefully and solve one step at a time.';
  }, []);

  const speakMathQuestion = useCallback((text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    const spokenText = text
      .replace(/\+/g, 'plus')
      .replace(/-/g, 'minus')
      .replace(/×/g, 'times')
      .replace(/÷/g, 'divided by')
      .replace(/=/g, 'equals')
      .replace(/\?/g, '');

    speakQuestion(`What is ${spokenText}?`);
    setTimeout(() => setIsSpeaking(false), 2000);
  }, [isSpeaking]);

  const teachProblem = useCallback(async (text: string) => {
    setIsSpeaking(true);
    await speakAsync(buildTeacherIntro(text), 0.88, 1.05);
    await speakAsync(buildCoachTip(text), 0.86, 1.02);
    const spokenText = text
      .replace(/\+/g, 'plus')
      .replace(/-/g, 'minus')
      .replace(/×/g, 'times')
      .replace(/÷/g, 'divided by')
      .replace(/=/g, 'equals')
      .replace(/\?/g, '');
    await speakAsync(`Your turn. What is ${spokenText}?`, 0.86, 1.08);
    setIsSpeaking(false);
  }, [buildCoachTip, buildTeacherIntro]);

  const loadProblem = useCallback(() => {
    setFeedback('idle');
    const p = generateMathProblem(level);
    setProblem(p);
    setCoachTip(buildCoachTip(p.question));
  }, [level, buildCoachTip]);

  useEffect(() => {
    if (problem) {
      void teachProblem(problem.question);
    }
  }, [problem, teachProblem]);

  useEffect(() => {
    const startLesson = async () => {
      await speakAsync(`Welcome to the Math Lab. ${lessonLabel}.`);
      loadProblem();
    };
    void startLesson();
  }, [lessonLabel, loadProblem]);

  const handleAnswer = (val: number) => {
    if (!problem || feedback !== 'idle') return;

    if (val === problem.answer) {
      setFeedback('correct');
      playSuccess();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(s => s + 1);

      void speakCorrect(`That is correct. ${problem.explanation}`);

      if (newStreak > 0 && newStreak % 3 === 0) {
        onReward();
      }

      setTimeout(loadProblem, 2500);
    } else {
      setFeedback('wrong');
      playWrongBuzzer();
      setStreak(0);

      void speakWrong(`Let us learn it together. ${problem.explanation}`);

      setTimeout(() => setFeedback('idle'), 3000);
    }
  };

  const renderMathManipulatives = () => {
    if (!problem) return null;
    const numbers = problem.question.match(/\d+/g)?.map(Number) || [];
    const operation =
      problem.question.includes('+') ? 'add'
        : problem.question.includes('-') ? 'subtract'
          : problem.question.includes('×') ? 'groups'
            : problem.question.includes('÷') ? 'share'
              : 'solve';
    const firstCount = Math.min(numbers[0] || 0, 12);
    const secondCount = Math.min(numbers[1] || 0, 12);
    const firstLabel = numbers[0] && numbers[0] > 12 ? `${numbers[0]} total` : `${numbers[0] || 0}`;
    const secondLabel = numbers[1] && numbers[1] > 12 ? `${numbers[1]} total` : `${numbers[1] || 0}`;

    return (
      <div className="mb-8 grid grid-cols-1 gap-3 rounded-[28px] bg-gradient-to-r from-sky-50 to-indigo-50 p-4 text-left sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-sky-600">First number</p>
          <div className="flex flex-wrap gap-1.5">
            {[...Array(Math.max(firstCount, 1))].map((_, index) => (
              <span key={index} className="h-6 w-6 rounded-lg bg-sky-400 shadow-sm" />
            ))}
          </div>
          <p className="mt-2 text-sm font-black text-sky-900">{firstLabel}</p>
        </div>
        <div className="flex items-center justify-center">
          <span className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg">{operation}</span>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-violet-600">Second number</p>
          <div className="flex flex-wrap gap-1.5">
            {[...Array(Math.max(secondCount, 1))].map((_, index) => (
              <span key={index} className="h-6 w-6 rounded-lg bg-violet-400 shadow-sm" />
            ))}
          </div>
          <p className="mt-2 text-sm font-black text-violet-900">{secondLabel}</p>
        </div>
      </div>
    );
  };

  const getGradeName = () => {
    switch (level) {
      case 1: return 'Pre-K';
      case 2: return 'Kindergarten';
      case 3: return '1st Grade';
      case 4: return '2nd Grade';
      case 5: return '3rd Grade';
      case 6: return '4th Grade';
      case 7: return '5th Grade';
      default: return `Level ${level}`;
    }
  };

  return (
    <div className="h-full w-full bg-indigo-50 p-6 flex flex-col relative overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#dbeafe_28%,#c7d2fe_62%,#eef2ff_100%)]"></div>
       <div className="absolute top-0 left-0 w-full h-64 bg-indigo-200/70 rounded-b-full"></div>
       <div className="absolute top-10 left-10 text-indigo-300 text-9xl font-bold opacity-20 rotate-12 pointer-events-none">123</div>
       <div className="absolute bottom-10 right-10 text-blue-300 text-9xl font-bold opacity-20 -rotate-12 pointer-events-none">+</div>
       <div className="absolute bottom-16 left-12 h-24 w-24 rounded-[28px] bg-yellow-300/50 rotate-12 shadow-xl"></div>
       <div className="absolute right-24 top-28 h-20 w-20 rounded-full bg-pink-300/40 shadow-xl"></div>

      <header className="flex justify-between items-center mb-8 z-10">
        <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 border-2 border-indigo-100">
          <ArrowLeft className="text-indigo-600" />
        </button>
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full flex items-center gap-2 shadow-sm border border-indigo-100">
           <Calculator size={16} className="text-indigo-600" />
           <span className="text-indigo-800 font-bold uppercase text-xs tracking-wider">{getGradeName()} Math</span>
           <div className="flex gap-1 ml-2">
             {[...Array(Math.min(streak, 5))].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-yellow-400 animate-bounce" />
             ))}
           </div>
        </div>
        <div className="flex items-center gap-1 bg-yellow-400 px-4 py-2 rounded-full shadow">
          <Star className="text-white fill-white" size={16} />
          <span className="text-white font-bold">{score}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {problem ? (
          <div className="bg-white/95 p-8 rounded-[40px] shadow-2xl w-full max-w-3xl text-center border-b-8 border-indigo-300 relative animate-pop-in">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-6 py-2 rounded-full font-bold shadow-md text-sm uppercase tracking-widest">
                Flash Card
            </div>
            <button
                onClick={() => speakMathQuestion(problem.question)}
                disabled={isSpeaking}
                className={`absolute top-6 right-6 p-3 rounded-full transition-all ${isSpeaking ? 'bg-yellow-400 scale-110 ring-4 ring-yellow-200' : 'bg-indigo-100 hover:bg-indigo-200'}`}
            >
                <Volume2 className={isSpeaking ? 'text-white' : 'text-indigo-600'} />
            </button>
            <div className="mb-6 bg-indigo-50 border-2 border-indigo-100 rounded-2xl px-4 py-3 text-left">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Coach Tip</div>
              <div className="text-indigo-900 font-semibold">{coachTip}</div>
            </div>
            <h2 className="text-7xl font-bold text-indigo-900 mb-12 mt-8 font-mono tracking-wider">{problem.question}</h2>
            {renderMathManipulatives()}
            <div className="grid grid-cols-2 gap-6">
              {problem.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedback !== 'idle'}
                  className={`
                    p-8 rounded-3xl text-5xl font-bold text-white transition-all transform hover:scale-105 hover:shadow-xl active:scale-95
                    ${feedback === 'correct' && opt === problem.answer ? 'bg-green-500 animate-pulse ring-4 ring-green-300' : ''}
                    ${feedback === 'wrong' && opt === problem.answer ? 'bg-green-500' : ''}
                    ${feedback === 'wrong' && opt !== problem.answer ? 'bg-gray-300 cursor-not-allowed' : ''}
                    ${feedback === 'idle' ? 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_6px_0_rgb(55,48,163)] active:shadow-none active:translate-y-2' : ''}
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
            {feedback === 'correct' && (
                <div className="absolute inset-x-0 bottom-[-80px] text-4xl font-bold text-green-600 animate-bounce text-center">
                    Awesome! 🎉
                </div>
            )}
            {feedback === 'wrong' && (
                <div className="absolute inset-x-0 bottom-[-80px] text-2xl font-bold text-orange-600 text-center">
                    The answer is {problem.answer}
                </div>
            )}
          </div>
        ) : (
           <button onClick={loadProblem} className="flex items-center gap-2 text-indigo-600 bg-white px-6 py-3 rounded-full shadow-lg font-bold">
               <RefreshCw className="animate-spin" /> Loading...
           </button>
        )}
      </div>
    </div>
  );
};
