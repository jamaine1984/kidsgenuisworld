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
  let a = 0;
  let b = 0;
  let question = '';
  let answer = 0;
  let explanation = '';
  let operation: MathProblem['operation'] = 'addition';
  let context: MathProblem['context'] = 'equation';

  const setEquation = (
    first: number,
    second: number,
    op: 'addition' | 'subtraction' | 'multiplication' | 'division'
  ) => {
    a = first;
    b = second;
    operation = op;
    context = 'equation';
    if (op === 'addition') {
      answer = a + b;
      question = `${a} + ${b} = ?`;
      explanation = `${a} plus ${b} equals ${answer}`;
    } else if (op === 'subtraction') {
      answer = a - b;
      question = `${a} - ${b} = ?`;
      explanation = `${a} minus ${b} equals ${answer}`;
    } else if (op === 'multiplication') {
      answer = a * b;
      question = `${a} times ${b} = ?`;
      explanation = `${a} times ${b} equals ${answer}`;
    } else {
      answer = b;
      const total = a * b;
      question = `${total} divided by ${a} = ?`;
      explanation = `${total} divided by ${a} equals ${answer}`;
    }
  };

  const setWordProblem = () => {
    const template = Math.floor(Math.random() * 8);
    context = 'word-problem';
    if (template === 0) {
      a = Math.floor(Math.random() * 8) + 4;
      b = Math.floor(Math.random() * 6) + 2;
      operation = 'addition';
      answer = a + b;
      question = `Mia has ${a} apples. Dad gives her ${b} more. How many apples does Mia have now?`;
      explanation = `${a} apples plus ${b} more apples equals ${answer} apples.`;
    } else if (template === 1) {
      a = Math.floor(Math.random() * 12) + 8;
      b = Math.floor(Math.random() * 6) + 2;
      operation = 'subtraction';
      answer = a - b;
      question = `Noah has ${a} stickers. He uses ${b} stickers on a card. How many stickers are left?`;
      explanation = `${a} stickers minus ${b} stickers equals ${answer} stickers left.`;
    } else if (template === 2) {
      a = Math.floor(Math.random() * 4) + 2;
      b = Math.floor(Math.random() * 4) + 2;
      operation = 'multiplication';
      answer = a * b;
      question = `There are ${a} bags with ${b} marbles in each bag. How many marbles are there in all?`;
      explanation = `${a} equal groups of ${b} makes ${answer} marbles.`;
    } else if (template === 3) {
      const tens = Math.floor(Math.random() * 7) + 2;
      const ones = Math.floor(Math.random() * 8) + 1;
      a = tens;
      b = ones;
      operation = 'addition';
      answer = tens * 10 + ones;
      question = `A number has ${tens} tens and ${ones} ones. What is the number?`;
      explanation = `${tens} tens are ${tens * 10}. Add ${ones} ones to make ${answer}.`;
    } else if (template === 4) {
      const boxes = Math.floor(Math.random() * 5) + 3;
      const pencilsPerBox = Math.floor(Math.random() * 6) + 4;
      const givenAway = Math.floor(Math.random() * 8) + 3;
      a = boxes;
      b = pencilsPerBox;
      operation = 'multiplication';
      answer = boxes * pencilsPerBox - givenAway;
      question = `A class has ${boxes} boxes with ${pencilsPerBox} pencils in each box. They give away ${givenAway} pencils. How many pencils are left?`;
      explanation = `${boxes} groups of ${pencilsPerBox} is ${boxes * pencilsPerBox}. Take away ${givenAway} to get ${answer}.`;
    } else if (template === 5) {
      const shelves = Math.floor(Math.random() * 4) + 2;
      const books = shelves * (Math.floor(Math.random() * 5) + 3);
      a = shelves;
      b = books / shelves;
      operation = 'division';
      answer = books / shelves;
      question = `${books} books are shared equally on ${shelves} shelves. How many books go on each shelf?`;
      explanation = `${books} shared into ${shelves} equal groups gives ${answer} books on each shelf.`;
    } else if (template === 6) {
      const rows = Math.floor(Math.random() * 5) + 2;
      const seats = Math.floor(Math.random() * 6) + 3;
      a = rows;
      b = seats;
      operation = 'multiplication';
      answer = rows * seats;
      question = `The school bus has ${rows} rows with ${seats} seats in each row. How many seats are there?`;
      explanation = `${rows} equal rows of ${seats} seats makes ${answer} seats.`;
    } else {
      const start = Math.floor(Math.random() * 35) + 30;
      const first = Math.floor(Math.random() * 12) + 5;
      const second = Math.floor(Math.random() * 8) + 3;
      a = start;
      b = first + second;
      operation = 'subtraction';
      answer = start - first - second;
      question = `The art shelf has ${start} papers. Students use ${first} papers in the morning and ${second} papers later. How many papers are left?`;
      explanation = `Start with ${start}, subtract ${first}, then subtract ${second}. That leaves ${answer}.`;
    }
  };

  const setMeasurementProblem = () => {
    const firstLength = Math.floor(Math.random() * 18) + 8;
    const secondLength = Math.floor(Math.random() * 10) + 3;
    a = firstLength;
    b = secondLength;
    operation = 'subtraction';
    context = 'word-problem';
    answer = firstLength - secondLength;
    question = `A ribbon is ${firstLength} inches long. A student cuts off ${secondLength} inches. How many inches are left?`;
    explanation = `${firstLength} inches minus ${secondLength} inches leaves ${answer} inches.`;
  };

  const setMoneyProblem = () => {
    const dimes = Math.floor(Math.random() * 4) + 1;
    const nickels = Math.floor(Math.random() * 3) + 1;
    a = dimes;
    b = nickels;
    operation = 'money';
    context = 'money';
    answer = dimes * 10 + nickels * 5;
    question = `You have ${dimes} dimes and ${nickels} nickels. How many cents do you have?`;
    explanation = `${dimes} dimes are ${dimes * 10} cents, and ${nickels} nickels are ${nickels * 5} cents. That makes ${answer} cents.`;
  };

  const setTimeProblem = () => {
    const startHour = Math.floor(Math.random() * 5) + 1;
    const addHours = Math.floor(Math.random() * 3) + 1;
    a = startHour;
    b = addHours;
    operation = 'time';
    context = 'time';
    answer = startHour + addHours;
    question = `Practice starts at ${startHour}:00 and lasts ${addHours} hours. What hour does practice end?`;
    explanation = `${startHour}:00 plus ${addHours} hours lands on ${answer}:00.`;
  };

  const setFractionProblem = () => {
    const denominator = [2, 3, 4, 6][Math.floor(Math.random() * 4)];
    const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
    a = denominator;
    b = numerator;
    operation = 'fraction';
    context = 'fraction';
    answer = denominator - numerator;
    question = `A snack is cut into ${denominator} equal pieces. You eat ${numerator} pieces. How many pieces are left?`;
    explanation = `${denominator} total pieces minus ${numerator} eaten pieces leaves ${answer} pieces.`;
  };

  const setGeometryProblem = () => {
    const sides = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
    const shapeName = sides === 3 ? 'triangle' : sides === 4 ? 'quadrilateral' : sides === 5 ? 'pentagon' : 'hexagon';
    a = sides;
    b = 0;
    operation = 'geometry';
    context = 'geometry';
    answer = sides;
    question = `How many sides does a ${shapeName} have?`;
    explanation = `A ${shapeName} has ${answer} sides.`;
  };

  const pick = (actions: Array<() => void>) => actions[Math.floor(Math.random() * actions.length)]();

  if (level <= 1) {
    setEquation(Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 3) + 1, 'addition');
  } else if (level === 2) {
    if (Math.random() > 0.5) {
      setEquation(Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 5) + 1, 'addition');
    } else {
      const startValue = Math.floor(Math.random() * 6) + 5;
      setEquation(startValue, Math.floor(Math.random() * startValue), 'subtraction');
    }
  } else if (level === 3) {
    pick([
      () => setEquation(Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1, 'addition'),
      () => setEquation(Math.floor(Math.random() * 10) + 10, Math.floor(Math.random() * 10), 'subtraction'),
      setWordProblem,
    ]);
  } else if (level === 4) {
    pick([
      () => setEquation(Math.floor(Math.random() * 50) + 10, Math.floor(Math.random() * 50) + 10, 'addition'),
      () => setEquation(Math.floor(Math.random() * 50) + 50, Math.floor(Math.random() * 50), 'subtraction'),
      () => setEquation(Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1, 'multiplication'),
      setWordProblem,
      setMeasurementProblem,
      setMoneyProblem,
      setTimeProblem,
    ]);
  } else if (level === 5) {
    pick([
      () => setEquation(Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1, 'multiplication'),
      () => setEquation(Math.floor(Math.random() * 9) + 2, Math.floor(Math.random() * 10) + 1, 'division'),
      setWordProblem,
      setMeasurementProblem,
      setFractionProblem,
      setGeometryProblem,
    ]);
  } else {
    pick([
      () => setEquation(Math.floor(Math.random() * 100) + 50, Math.floor(Math.random() * 100) + 50, 'addition'),
      () => setEquation(Math.floor(Math.random() * 100) + 100, Math.floor(Math.random() * 100), 'subtraction'),
      () => setEquation(Math.floor(Math.random() * 12) + 2, Math.floor(Math.random() * 12) + 2, 'multiplication'),
      () => setEquation(Math.floor(Math.random() * 11) + 2, Math.floor(Math.random() * 12) + 2, 'division'),
      setWordProblem,
      setMeasurementProblem,
      setFractionProblem,
      setGeometryProblem,
    ]);
  }

  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const candidate = answer + offset;
    if (offset !== 0 && candidate >= 0) {
      options.add(candidate);
    }
    if (options.size < 4) {
      options.add(Math.max(0, answer + Math.floor(Math.random() * 20) - 10));
    }
  }

  return {
    question,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
    operation,
    context,
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

  const buildCoachTip = useCallback((currentProblem: MathProblem) => {
    if (currentProblem.context === 'word-problem') return 'Underline the numbers, then decide what the story is asking.';
    if (currentProblem.context === 'money') return 'Count coin values first, then add the cents.';
    if (currentProblem.context === 'time') return 'Start at the clock time and count hours forward.';
    if (currentProblem.context === 'fraction') return 'Think about equal pieces and subtract the pieces used.';
    if (currentProblem.context === 'geometry') return 'Picture the shape and count each side once.';
    if (currentProblem.operation === 'addition') return 'Touch each group and count all together.';
    if (currentProblem.operation === 'subtraction') return 'Start with the big number, then count back.';
    if (currentProblem.operation === 'multiplication') return 'Think of equal groups and skip count.';
    if (currentProblem.operation === 'division') return 'Split the total into equal groups.';
    return 'Take your time and solve one step at a time.';
  }, []);

  const buildTeacherIntro = useCallback((currentProblem: MathProblem) => {
    if (currentProblem.context === 'word-problem') return 'Teacher says: Read the whole story problem before solving.';
    if (currentProblem.context === 'money') return 'Teacher says: Money problems use coin values.';
    if (currentProblem.context === 'time') return 'Teacher says: Time problems use the clock and elapsed hours.';
    if (currentProblem.context === 'fraction') return 'Teacher says: Fractions are equal pieces of one whole.';
    if (currentProblem.context === 'geometry') return 'Teacher says: Geometry problems use shape clues.';
    if (currentProblem.operation === 'addition') return 'Teacher says: Let us add the groups together.';
    if (currentProblem.operation === 'subtraction') return 'Teacher says: Start with the big number and count back carefully.';
    if (currentProblem.operation === 'multiplication') return 'Teacher says: Look for equal groups and use skip counting.';
    if (currentProblem.operation === 'division') return 'Teacher says: Think about sharing into equal groups.';
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

  const teachProblem = useCallback(async (currentProblem: MathProblem) => {
    setIsSpeaking(true);
    await speakAsync(buildTeacherIntro(currentProblem), 0.88, 1.05);
    await speakAsync(buildCoachTip(currentProblem), 0.86, 1.02);
    const spokenText = currentProblem.question
      .replace(/\+/g, 'plus')
      .replace(/-/g, 'minus')
      .replace(/=/g, 'equals')
      .replace(/\?/g, '');
    await speakAsync(`Your turn. What is ${spokenText}?`, 0.86, 1.08);
    setIsSpeaking(false);
  }, [buildCoachTip, buildTeacherIntro]);
  const loadProblem = useCallback(() => {
    setFeedback('idle');
    const p = generateMathProblem(level);
    setProblem(p);
    setCoachTip(buildCoachTip(p));
  }, [level, buildCoachTip]);

  useEffect(() => {
    if (problem) {
      void teachProblem(problem);
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
      problem.context === 'money' ? 'count coins'
        : problem.context === 'time' ? 'count hours'
          : problem.context === 'fraction' ? 'equal pieces'
            : problem.context === 'geometry' ? 'count sides'
              : problem.operation === 'addition' ? 'add'
                : problem.operation === 'subtraction' ? 'subtract'
                  : problem.operation === 'multiplication' ? 'groups'
                    : problem.operation === 'division' ? 'share'
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

  const getMissionLabel = (currentProblem: MathProblem) => {
    if (currentProblem.context === 'word-problem') return 'Word Problem';
    if (currentProblem.context === 'money') return 'Money Math';
    if (currentProblem.context === 'time') return 'Time Math';
    if (currentProblem.context === 'fraction') return 'Fractions';
    if (currentProblem.context === 'geometry') return 'Geometry';
    return 'Number Facts';
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
        <button onClick={onBack} aria-label="Back to world map" className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 border-2 border-indigo-100">
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
            <div className="mb-5 flex justify-center">
              <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-700 ring-2 ring-amber-200">
                Mission Type: {getMissionLabel(problem)}
              </span>
            </div>
            <h2
              data-testid="math-question"
              className={`${problem.context === 'equation' ? 'text-6xl sm:text-7xl font-mono tracking-wider' : 'text-2xl sm:text-3xl leading-snug'} font-bold text-indigo-900 mb-12 mt-8`}
            >
              {problem.question}
            </h2>
            {renderMathManipulatives()}
            <div className="grid grid-cols-2 gap-6">
              {problem.options.map((opt, idx) => (
                <button
                  key={idx}
                  data-testid="math-answer-option"
                  data-math-correct={opt === problem.answer ? 'true' : 'false'}
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
