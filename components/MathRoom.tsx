import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { speakAsync, speakCorrect, speakWrong, playSuccess, playWrongBuzzer, speakMultipleChoiceQuestion } from '../services/audioService';
import { MathProblem } from '../types';
import { Star, ArrowLeft, Volume2, RefreshCw, Calculator } from 'lucide-react';
import { withSeededRandom } from '../services/dailyRotation';

interface MathRoomProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  onAttempt?: (meta: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }, correct: boolean) => void;
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

  const setEarlyWordProblem = () => {
    const templates = [
      () => {
        a = Math.floor(Math.random() * 5) + 2;
        b = Math.floor(Math.random() * 4) + 1;
        operation = 'addition';
        context = 'word-problem';
        answer = a + b;
        question = `Lena has ${a} crayons. She gets ${b} more crayons. How many crayons does she have now?`;
        explanation = `${a} crayons plus ${b} more crayons equals ${answer} crayons.`;
      },
      () => {
        a = Math.floor(Math.random() * 5) + 5;
        b = Math.floor(Math.random() * 3) + 1;
        operation = 'subtraction';
        context = 'word-problem';
        answer = a - b;
        question = `A boy starts with ${a} apples. He eats ${b} apples. How many apples are left?`;
        explanation = `Start with ${a} apples and take away ${b}. There are ${answer} apples left.`;
      },
      () => {
        a = Math.floor(Math.random() * 4) + 3;
        b = Math.floor(Math.random() * 3) + 2;
        operation = 'addition';
        context = 'word-problem';
        answer = a + b;
        question = `There are ${a} ducks in the pond. ${b} more ducks swim over. How many ducks are in the pond?`;
        explanation = `${a} ducks and ${b} more ducks make ${answer} ducks.`;
      },
      () => {
        a = Math.floor(Math.random() * 6) + 4;
        b = Math.floor(Math.random() * 3) + 1;
        operation = 'subtraction';
        context = 'word-problem';
        answer = a - b;
        question = `There are ${a} blocks on the rug. A student puts away ${b} blocks. How many blocks stay on the rug?`;
        explanation = `${a} blocks minus ${b} blocks leaves ${answer} blocks.`;
      },
      () => {
        const tenFrame = 10;
        a = Math.floor(Math.random() * 6) + 2;
        b = tenFrame - a;
        operation = 'addition';
        context = 'equation';
        answer = tenFrame;
        question = `${a} + ${b} = ?`;
        explanation = `${a} and ${b} make a full ten frame of ${tenFrame}.`;
      },
      () => {
        a = Math.floor(Math.random() * 7) + 3;
        b = Math.floor(Math.random() * 3) + 1;
        operation = 'subtraction';
        context = 'equation';
        answer = a - b;
        question = `${a} - ${b} = ?`;
        explanation = `Picture ${a} counters. Cross out ${b}. ${answer} counters are left.`;
      },
    ];
    templates[Math.floor(Math.random() * templates.length)]();
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

  const setNumberBondProblem = () => {
    const total = level <= 2 ? 10 : level <= 4 ? 20 : 100;
    a = Math.floor(Math.random() * (total - 2)) + 1;
    b = total - a;
    operation = 'addition';
    context = 'equation';
    answer = b;
    question = `${a} + ? = ${total}`;
    explanation = `${a} needs ${b} more to make ${total}.`;
  };

  const setCompareProblem = () => {
    const left = Math.floor(Math.random() * (level <= 3 ? 12 : 60)) + 4;
    const difference = Math.floor(Math.random() * (level <= 3 ? 5 : 20)) + 1;
    const right = left + difference;
    a = right;
    b = left;
    operation = 'subtraction';
    context = 'word-problem';
    answer = difference;
    question = `Jay has ${right} blocks. Ava has ${left} blocks. How many more blocks does Jay have than Ava?`;
    explanation = `Compare by subtracting ${left} from ${right}. The difference is ${answer}.`;
  };

  const setArrayProblem = () => {
    const rows = Math.floor(Math.random() * (level <= 4 ? 4 : 8)) + 2;
    const columns = Math.floor(Math.random() * (level <= 4 ? 4 : 8)) + 2;
    a = rows;
    b = columns;
    operation = 'multiplication';
    context = 'word-problem';
    answer = rows * columns;
    question = `A sticker chart has ${rows} rows with ${columns} stickers in each row. How many stickers are on the chart?`;
    explanation = `${rows} equal rows of ${columns} makes ${answer} stickers.`;
  };

  const setSkipCountProblem = () => {
    const step = [2, 5, 10][Math.floor(Math.random() * 3)];
    const count = Math.floor(Math.random() * 5) + 3;
    a = step;
    b = count;
    operation = 'multiplication';
    context = 'equation';
    answer = step * count;
    question = `Skip count by ${step}s for ${count} jumps. Where do you land?`;
    explanation = `${count} jumps of ${step} is ${answer}.`;
  };

  const setPlaceValueProblem = () => {
    const hundreds = level >= 5 ? Math.floor(Math.random() * 8) + 1 : 0;
    const tens = Math.floor(Math.random() * 9) + 1;
    const ones = Math.floor(Math.random() * 9);
    a = tens;
    b = ones;
    operation = 'addition';
    context = 'equation';
    answer = hundreds * 100 + tens * 10 + ones;
    question = hundreds > 0
      ? `A number has ${hundreds} hundreds, ${tens} tens, and ${ones} ones. What is the number?`
      : `A number has ${tens} tens and ${ones} ones. What is the number?`;
    explanation = hundreds > 0
      ? `${hundreds} hundreds, ${tens} tens, and ${ones} ones make ${answer}.`
      : `${tens} tens are ${tens * 10}. Add ${ones} ones to make ${answer}.`;
  };

  const setExpandedFormProblem = () => {
    const hundreds = Math.floor(Math.random() * 8) + 1;
    const tens = Math.floor(Math.random() * 9) + 1;
    const ones = Math.floor(Math.random() * 9);
    a = hundreds;
    b = tens;
    operation = 'addition';
    context = 'equation';
    answer = hundreds * 100 + tens * 10 + ones;
    question = `What number is ${hundreds * 100} + ${tens * 10} + ${ones}?`;
    explanation = `Expanded form ${hundreds * 100} plus ${tens * 10} plus ${ones} equals ${answer}.`;
  };

  const setMissingAddendStory = () => {
    const total = Math.floor(Math.random() * (level <= 3 ? 10 : 30)) + (level <= 3 ? 5 : 15);
    const known = Math.floor(Math.random() * (total - 2)) + 1;
    a = known;
    b = total;
    operation = 'subtraction';
    context = 'word-problem';
    answer = total - known;
    question = `The class needs ${total} craft sticks. They already have ${known}. How many more craft sticks do they need?`;
    explanation = `Find the missing part by subtracting ${known} from ${total}. They need ${answer} more.`;
  };

  const setEqualShareProblem = () => {
    const groups = Math.floor(Math.random() * 5) + 2;
    const each = Math.floor(Math.random() * 6) + 2;
    const total = groups * each;
    a = groups;
    b = each;
    operation = 'division';
    context = 'word-problem';
    answer = each;
    question = `${total} crackers are shared equally by ${groups} kids. How many crackers does each kid get?`;
    explanation = `${total} split into ${groups} equal groups gives ${answer} in each group.`;
  };

  const setElapsedTimeHalfHourProblem = () => {
    const addHalfHours = Math.floor(Math.random() * 4) + 1;
    a = addHalfHours;
    b = addHalfHours;
    operation = 'time';
    context = 'time';
    answer = addHalfHours * 30;
    question = `Reading class lasts ${addHalfHours} half-hour blocks. How many minutes is that?`;
    explanation = `Each half-hour is 30 minutes, so ${addHalfHours} half-hour blocks is ${answer} minutes.`;
  };

  const setMixedMoneyProblem = () => {
    const quarters = Math.floor(Math.random() * 3) + 1;
    const dimes = Math.floor(Math.random() * 4) + 1;
    const nickels = Math.floor(Math.random() * 3);
    a = quarters;
    b = dimes;
    operation = 'money';
    context = 'money';
    answer = quarters * 25 + dimes * 10 + nickels * 5;
    question = `You have ${quarters} quarters, ${dimes} dimes, and ${nickels} nickels. How many cents is that?`;
    explanation = `${quarters} quarters are ${quarters * 25} cents, ${dimes} dimes are ${dimes * 10} cents, and ${nickels} nickels are ${nickels * 5} cents. Total is ${answer} cents.`;
  };

  const setPerimeterProblem = () => {
    const length = Math.floor(Math.random() * 8) + 3;
    const width = Math.floor(Math.random() * 6) + 2;
    a = length;
    b = width;
    operation = 'geometry';
    context = 'geometry';
    answer = length + length + width + width;
    question = `A rectangle is ${length} units long and ${width} units wide. What is its perimeter?`;
    explanation = `Perimeter goes around the outside: ${length} + ${width} + ${length} + ${width} = ${answer}.`;
  };

  const setAreaProblem = () => {
    const length = Math.floor(Math.random() * 7) + 3;
    const width = Math.floor(Math.random() * 5) + 2;
    a = length;
    b = width;
    operation = 'multiplication';
    context = 'geometry';
    answer = length * width;
    question = `A garden array is ${length} squares long and ${width} squares wide. How many square units are inside?`;
    explanation = `Area is rows times columns: ${length} times ${width} equals ${answer} square units.`;
  };

  const setFractionCompareProblem = () => {
    const denominator = [4, 6, 8, 10][Math.floor(Math.random() * 4)];
    const numerator = Math.floor(Math.random() * (denominator - 2)) + 1;
    a = denominator;
    b = numerator;
    operation = 'fraction';
    context = 'fraction';
    answer = denominator - numerator;
    question = `A rectangle has ${denominator} equal parts. ${numerator} parts are shaded. How many equal parts are not shaded?`;
    explanation = `${denominator} total parts minus ${numerator} shaded parts leaves ${answer} not shaded.`;
  };

  const setMultiStepProblem = () => {
    const boxes = Math.floor(Math.random() * 5) + 3;
    const each = Math.floor(Math.random() * 8) + 4;
    const extra = Math.floor(Math.random() * 12) + 5;
    a = boxes;
    b = each;
    operation = 'multiplication';
    context = 'word-problem';
    answer = boxes * each + extra;
    question = `The library has ${boxes} shelves with ${each} books on each shelf. A teacher adds ${extra} more books. How many books are there now?`;
    explanation = `First multiply ${boxes} by ${each} to get ${boxes * each}. Then add ${extra}. Total is ${answer}.`;
  };

  const pick = (actions: Array<() => void>) => actions[Math.floor(Math.random() * actions.length)]();

  if (level <= 1) {
    pick([
      () => setEquation(Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1, 'addition'),
      setEarlyWordProblem,
      setNumberBondProblem,
    ]);
  } else if (level === 2) {
    pick([
      () => setEquation(Math.floor(Math.random() * 8) + 1, Math.floor(Math.random() * 6) + 1, 'addition'),
      () => {
        const startValue = Math.floor(Math.random() * 8) + 5;
        setEquation(startValue, Math.floor(Math.random() * Math.max(1, startValue - 1)) + 1, 'subtraction');
      },
      setEarlyWordProblem,
      setNumberBondProblem,
      setMissingAddendStory,
      setPlaceValueProblem,
    ]);
  } else if (level === 3) {
    pick([
      () => setEquation(Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1, 'addition'),
      () => setEquation(Math.floor(Math.random() * 10) + 10, Math.floor(Math.random() * 10), 'subtraction'),
      setEarlyWordProblem,
      setWordProblem,
      setNumberBondProblem,
      setCompareProblem,
      setMissingAddendStory,
      setPlaceValueProblem,
      setSkipCountProblem,
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
      setCompareProblem,
      setArrayProblem,
      setPlaceValueProblem,
      setMissingAddendStory,
      setEqualShareProblem,
    ]);
  } else if (level === 5) {
    pick([
      () => setEquation(Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1, 'multiplication'),
      () => setEquation(Math.floor(Math.random() * 9) + 2, Math.floor(Math.random() * 10) + 1, 'division'),
      setWordProblem,
      setMeasurementProblem,
      setFractionProblem,
      setGeometryProblem,
      setArrayProblem,
      setEqualShareProblem,
      setExpandedFormProblem,
      setMixedMoneyProblem,
      setFractionCompareProblem,
      setPerimeterProblem,
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
      setExpandedFormProblem,
      setMixedMoneyProblem,
      setElapsedTimeHalfHourProblem,
      setPerimeterProblem,
      setAreaProblem,
      setFractionCompareProblem,
      setMultiStepProblem,
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
export const MathRoom: React.FC<MathRoomProps> = ({ onBack, onReward, onAttempt, level }) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [coachTip, setCoachTip] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const lessonStep = React.useRef(0);
  const choiceLabels = ['A', 'B', 'C', 'D'];

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

  const speakMathQuestion = useCallback((currentProblem: MathProblem) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    const spokenText = currentProblem.question
      .replace(/\+/g, 'plus')
      .replace(/-/g, 'minus')
      .replace(/×/g, 'times')
      .replace(/÷/g, 'divided by')
      .replace(/=/g, 'equals')
      .replace(/\?/g, '');

    void speakMultipleChoiceQuestion(`What is ${spokenText}?`, currentProblem.options)
      .finally(() => setIsSpeaking(false));
  }, [isSpeaking]);

  const teachProblem = useCallback(async (currentProblem: MathProblem) => {
    setIsSpeaking(true);
    const spokenText = currentProblem.question
      .replace(/\+/g, 'plus')
      .replace(/-/g, 'minus')
      .replace(/=/g, 'equals')
      .replace(/\?/g, '');
    await speakAsync(buildCoachTip(currentProblem), 0.82, 1.02, 'gentle');
    await speakMultipleChoiceQuestion(`What is ${spokenText}?`, currentProblem.options);
    setIsSpeaking(false);
  }, [buildCoachTip]);
  const loadProblem = useCallback(() => {
    setFeedback('idle');
    setSelectedChoice(null);
    const step = lessonStep.current;
    lessonStep.current += 1;
    const p = withSeededRandom(`math-grade-${level}`, step, () => generateMathProblem(level));
    setProblem(p);
    setCoachTip(buildCoachTip(p));
  }, [level, buildCoachTip]);

  useEffect(() => {
    if (problem) {
      void teachProblem(problem);
    }
  }, [problem, teachProblem]);

  useEffect(() => {
    loadProblem();
  }, [lessonLabel, loadProblem]);

  const handleAnswer = (val: number) => {
    if (!problem || feedback !== 'idle') return;
    setSelectedChoice(val);

    if (val === problem.answer) {
      setFeedback('correct');
      playSuccess();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(s => s + 1);

      void speakCorrect(`That is correct. ${problem.explanation}`);

      onReward({
        questionId: `math-${level}-${problem.context || 'equation'}-${problem.operation}-${problem.question}`,
        skill: problem.context || problem.operation,
        prompt: problem.question,
        selectedAnswer: String(val),
        correctAnswer: String(problem.answer),
      });

      setTimeout(loadProblem, 2500);
    } else {
      setFeedback('wrong');
      playWrongBuzzer();
      setStreak(0);
      onAttempt?.({
        questionId: `math-${level}-${problem.context || 'equation'}-${problem.operation}-${problem.question}`,
        skill: problem.context || problem.operation,
        prompt: problem.question,
        selectedAnswer: String(val),
        correctAnswer: String(problem.answer),
      }, false);

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
    const isTakeAway = problem.operation === 'subtraction' || (
      problem.context === 'word-problem' && /left|eat|eats|uses|puts away|take away|minus|cuts off/i.test(problem.question)
    );
    const visibleFirstCount = Math.max(firstCount, 1);

    return (
      <div className="mb-8 grid grid-cols-1 gap-3 rounded-[28px] bg-gradient-to-r from-sky-50 to-indigo-50 p-4 text-left sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-sky-600">
            {isTakeAway ? 'Start with' : 'First number'}
          </p>
          <div className="flex flex-wrap gap-1.5" aria-label={isTakeAway ? 'Starting group with crossed-out counters for take away' : 'First number counters'}>
            {[...Array(visibleFirstCount)].map((_, index) => (
              <span
                key={index}
                className={`relative h-7 w-7 rounded-lg shadow-sm ${
                  isTakeAway && index >= Math.max(0, visibleFirstCount - secondCount)
                    ? 'bg-rose-200 opacity-80'
                    : 'bg-sky-400'
                }`}
              >
                {isTakeAway && index >= Math.max(0, visibleFirstCount - secondCount) && (
                  <span className="absolute left-1/2 top-1/2 h-0.5 w-8 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-rose-700" />
                )}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm font-black text-sky-900">{firstLabel}</p>
        </div>
        <div className="flex items-center justify-center">
          <span className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg">{operation}</span>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-violet-600">
            {isTakeAway ? 'Take away' : 'Second number'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[...Array(Math.max(secondCount, 1))].map((_, index) => (
              <span key={index} className={`h-7 w-7 rounded-lg shadow-sm ${isTakeAway ? 'bg-rose-400' : 'bg-violet-400'}`} />
            ))}
          </div>
          <p className="mt-2 text-sm font-black text-violet-900">{secondLabel}</p>
        </div>
        {isTakeAway && (
          <div className="rounded-2xl bg-emerald-50 p-3 text-center shadow-sm sm:col-span-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Picture model</p>
            <p className="mt-1 text-sm font-bold text-emerald-900">
              Cross out {numbers[1] || 0}. Count what is not crossed out to find what is left.
            </p>
          </div>
        )}
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
                onClick={() => speakMathQuestion(problem)}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              {problem.options.map((opt, idx) => (
                <button
                  key={idx}
                  data-testid="math-answer-option"
                  data-math-correct={opt === problem.answer ? 'true' : 'false'}
                  onClick={() => handleAnswer(opt)}
                  disabled={feedback !== 'idle'}
                  className={`
                    flex min-h-[112px] items-center gap-4 rounded-3xl p-5 text-left text-white transition-all transform hover:scale-105 hover:shadow-xl active:scale-95
                    ${feedback === 'correct' && opt === problem.answer ? 'bg-green-500 animate-pulse ring-4 ring-green-300' : ''}
                    ${feedback === 'wrong' && opt === problem.answer ? 'bg-green-500' : ''}
                    ${feedback === 'wrong' && opt !== problem.answer ? (selectedChoice === opt ? 'bg-orange-400 ring-4 ring-orange-200' : 'bg-gray-300 cursor-not-allowed') : ''}
                    ${feedback === 'idle' ? 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_6px_0_rgb(55,48,163)] active:shadow-none active:translate-y-2' : ''}
                  `}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/95 text-2xl font-black text-indigo-700 shadow-sm">
                    {choiceLabels[idx]}
                  </span>
                  <span className="text-4xl font-black leading-none sm:text-5xl">{opt}</span>
                </button>
              ))}
            </div>
            {feedback === 'correct' && (
                <div className="mt-6 rounded-[28px] border-2 border-green-200 bg-green-50 p-5 text-left text-green-800 shadow-sm">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-green-600">Teacher Check</div>
                    <div className="mt-2 text-2xl font-black">Correct. {problem.explanation}</div>
                </div>
            )}
            {feedback === 'wrong' && (
                <div className="mt-6 rounded-[28px] border-2 border-orange-200 bg-orange-50 p-5 text-left text-orange-800 shadow-sm">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Teacher Check</div>
                    <div className="mt-2 text-2xl font-black">The answer is {problem.answer}. {problem.explanation}</div>
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
