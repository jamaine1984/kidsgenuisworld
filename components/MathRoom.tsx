import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { speakCorrect, speakWrong, playSuccess, playWrongBuzzer, speakMultipleChoiceQuestion } from '../services/audioService';
import { MathProblem } from '../types';
import { Star, ArrowLeft, Volume2, RefreshCw, Calculator } from 'lucide-react';
import { withSeededRandom } from '../services/dailyRotation';
import { generateEarlyMathProblem } from '../services/curriculum/earlyMath';
import { generateElementaryMathProblem } from '../services/curriculum/elementaryMath';
import { generateUpperElementaryMathProblem } from '../services/curriculum/upperElementaryMath';
import { EarlyMathModel } from './math/EarlyMathModel';

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
  const [selectedChoice, setSelectedChoice] = useState<number | string | null>(null);
  const lessonStep = React.useRef(0);
  const choiceLabels = ['A', 'B', 'C', 'D'];

  const lessonLabel = useMemo(() => {
    if (level === 1) return 'Touch, count, compare, and name what you see';
    if (level === 2) return 'Build numbers with pictures, shapes, and stories';
    if (level === 3) return 'Build facts, place value, time, money, and measurement with models';
    if (level === 4) return 'Connect place value to two-step problems and real-world math';
    if (level === 5) return 'Model multiplication, division, fractions, area, and data';
    if (level === 6) return 'Connect multi-digit operations, factors, fractions, and measurement';
    return 'Reason with decimals, fractions, volume, coordinates, and expressions';
  }, [level]);

  const buildCoachTip = useCallback((currentProblem: MathProblem) => {
    const skill = currentProblem.skill || '';
    if (/decimal/i.test(skill)) return 'Line up the decimal points first, then work one place value at a time.';
    if (/unlike denominators/i.test(skill)) return 'Rename both fractions with a common denominator before combining them.';
    if (/fraction/i.test(skill)) return 'Use equal-size parts, then compare or combine the numerators carefully.';
    if (/order of operations/i.test(skill)) return 'Complete multiplication or division before addition or subtraction.';
    if (/volume/i.test(skill)) return 'Count cubic layers by multiplying length, width, and height.';
    if (/area/i.test(skill)) return 'Count square units by multiplying the rectangle length and width.';
    if (/perimeter/i.test(skill)) return 'Trace the outside edge and add every side exactly once.';
    if (/coordinate|ordered pair/i.test(skill)) return 'Read x first by moving right, then read y by moving up.';
    if (/data|graph|line plot/i.test(skill)) return 'Read the labels and scale before comparing the data values.';
    if (/multi-step/i.test(skill)) return 'Write the result of the first step, then use it in the second step.';
    if (/conversion/i.test(skill)) return 'Name the unit relationship first, then multiply or divide by the conversion factor.';
    if (currentProblem.skill === 'color recognition') return 'Say the color name, then check every counter.';
    if (currentProblem.context === 'comparison') return 'Match one counter from each group before deciding which has more.';
    if (currentProblem.context === 'pattern') return 'Say the repeating part aloud, then start the pattern again.';
    if (currentProblem.context === 'spatial') return 'Look at the blue circle first, then describe where it is.';
    if (currentProblem.context === 'counting') return 'Touch each counter once and let the last number tell how many.';
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

    const prompt = currentProblem.context === 'equation' ? `What is ${spokenText}?` : spokenText;
    void speakMultipleChoiceQuestion(prompt, currentProblem.options)
      .finally(() => setIsSpeaking(false));
  }, [isSpeaking]);

  const teachProblem = useCallback(async (currentProblem: MathProblem) => {
    setIsSpeaking(true);
    const spokenText = currentProblem.question
      .replace(/\+/g, 'plus')
      .replace(/-/g, 'minus')
      .replace(/×/g, 'times')
      .replace(/÷/g, 'divided by')
      .replace(/=/g, 'equals')
      .replace(/\?/g, '');
    const prompt = currentProblem.context === 'equation' ? `What is ${spokenText}?` : spokenText;
    await speakMultipleChoiceQuestion(prompt, currentProblem.options);
    setIsSpeaking(false);
  }, []);
  const loadProblem = useCallback(() => {
    setFeedback('idle');
    setSelectedChoice(null);
    const step = lessonStep.current;
    lessonStep.current += 1;
    const p = level <= 2
      ? generateEarlyMathProblem(level as 1 | 2, step)
      : level <= 4
        ? generateElementaryMathProblem(level as 3 | 4, step)
        : level <= 7
          ? generateUpperElementaryMathProblem(level as 5 | 6 | 7, step)
          : withSeededRandom(`math-grade-${level}`, step, () => generateMathProblem(level));
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

  const handleAnswer = (val: number | string) => {
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
    if (problem.visualModel) {
      return (
        <div className="mb-7 rounded-[28px] bg-gradient-to-br from-sky-50 via-white to-amber-50 p-4 ring-2 ring-indigo-100">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Math model</p>
          <EarlyMathModel model={problem.visualModel} />
        </div>
      );
    }
    const numbers = problem.question.match(/\d+/g)?.map(Number) || [];
    const numberBondMatch = problem.question.match(/^(\d+)\s*\+\s*\?\s*=\s*(\d+)$/);
    const isNumberBond = Boolean(numberBondMatch);
    const firstValue = isNumberBond ? Number(numberBondMatch?.[1] || 0) : (numbers[0] || 0);
    const secondValue = isNumberBond ? problem.answer : (numbers[1] || 0);
    const numberBondTotal = isNumberBond ? Number(numberBondMatch?.[2] || 0) : 0;
    const operation =
      isNumberBond ? `make ${numberBondTotal}`
        : problem.context === 'money' ? 'count coins'
        : problem.context === 'time' ? 'count hours'
          : problem.context === 'fraction' ? 'equal pieces'
            : problem.context === 'geometry' ? 'count sides'
              : problem.operation === 'addition' ? 'add'
                : problem.operation === 'subtraction' ? 'subtract'
                  : problem.operation === 'multiplication' ? 'groups'
                    : problem.operation === 'division' ? 'share'
                      : 'solve';
    const firstCount = Math.min(firstValue, 20);
    const secondCount = Math.min(secondValue, 20);
    const firstLabel = isNumberBond ? `${firstValue} known` : firstValue > 20 ? `${firstValue} total` : `${firstValue}`;
    const secondLabel = isNumberBond ? '? more' : secondValue > 20 ? `${secondValue} total` : `${secondValue}`;
    const isTakeAway = problem.operation === 'subtraction' || (
      problem.context === 'word-problem' && /left|eat|eats|uses|puts away|take away|minus|cuts off/i.test(problem.question)
    );
    const visibleFirstCount = Math.max(firstCount, 1);

    return (
      <div className="mb-8 grid grid-cols-1 gap-3 rounded-[28px] bg-gradient-to-r from-sky-50 to-indigo-50 p-4 text-left sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-sky-600">
            {isTakeAway ? 'Start with' : isNumberBond ? 'Known part' : 'First number'}
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
            {isTakeAway ? 'Take away' : isNumberBond ? 'Count the empty spaces' : 'Second number'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[...Array(Math.max(secondCount, 1))].map((_, index) => (
              <span key={index} className={`h-7 w-7 rounded-lg shadow-sm ${isTakeAway ? 'bg-rose-400' : isNumberBond ? 'border-2 border-violet-500 bg-white/80' : 'bg-violet-400'}`} />
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
        {isNumberBond && (
          <div className="rounded-2xl bg-amber-50 p-3 text-center shadow-sm sm:col-span-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Number bond model</p>
            <p className="mt-1 text-sm font-bold text-amber-950">
              Start at {firstValue}. Count the outlined spaces until the whole reaches {numberBondTotal}.
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
    const skill = currentProblem.skill || '';
    if (/decimal/i.test(skill)) return 'Decimal Lab';
    if (/fraction/i.test(skill)) return 'Fraction Reasoning';
    if (/area|perimeter|volume/i.test(skill)) return 'Measurement Lab';
    if (/coordinate|ordered pair/i.test(skill)) return 'Coordinate Lab';
    if (/data|graph|line plot/i.test(skill)) return 'Data Lab';
    if (/multi-step/i.test(skill)) return 'Multi-Step Mission';
    if (/factor|multiple/i.test(skill)) return 'Number Structure';
    if (currentProblem.context === 'counting') return 'Counting Lab';
    if (currentProblem.context === 'comparison') return 'Compare Groups';
    if (currentProblem.context === 'classification') return 'Sort and Name';
    if (currentProblem.context === 'pattern') return 'Pattern Lab';
    if (currentProblem.context === 'spatial') return 'Position Words';
    if (currentProblem.context === 'word-problem') return 'Word Problem';
    if (currentProblem.context === 'money') return 'Money Math';
    if (currentProblem.context === 'time') return 'Time Math';
    if (currentProblem.context === 'fraction') return 'Fractions';
    if (currentProblem.context === 'geometry') return 'Geometry';
    return 'Number Facts';
  };

  return (
    <div className="academy-room-surface h-full w-full bg-indigo-50 p-6 flex flex-col relative overflow-hidden" style={{ '--academy-room-scene': "url('/academy/rooms/math.webp')" } as React.CSSProperties}>
       <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>

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
          <div className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-indigo-200 bg-white/95 text-center shadow-2xl animate-pop-in">
            <div className="flex flex-col gap-2 bg-indigo-950 px-5 py-4 text-left text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Today's math focus</p>
                <p className="mt-1 text-lg font-black capitalize">{problem.skill || getMissionLabel(problem)}</p>
              </div>
              <p className="max-w-xl text-sm font-semibold text-indigo-100">{lessonLabel}</p>
            </div>
            <div className="relative p-5 sm:p-8">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-6 py-2 rounded-full font-bold shadow-md text-sm uppercase tracking-widest">
                Question {Math.min(score + 1, 6)} of 6
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
              className={`${problem.context === 'equation' ? 'text-5xl sm:text-7xl font-mono tracking-wider' : 'text-2xl sm:text-3xl leading-snug'} mb-7 mt-8 font-bold text-indigo-950`}
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
                  <span className="min-w-0 break-words text-2xl font-black leading-tight sm:text-4xl">{opt}</span>
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
