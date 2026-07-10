import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ArrowLeft, BrainCircuit, Circle, Diamond, Fish, Flower2, Gift, Grid3X3, Hexagon, RefreshCw, Rocket, Shapes, Square, Star, Triangle } from 'lucide-react';
import { playSuccess, playError, playPop } from '../services/audioService';
import { pickDailyItem, shuffleDailyItems } from '../services/dailyRotation';

interface PuzzleRoomProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  level: number;
}

type PuzzleMode = 'MEMORY' | 'PATTERN' | 'SHAPES';

const renderPuzzleIcon = (item: string, className = 'h-10 w-10') => {
  const iconProps = { className, strokeWidth: 2.4 };
  switch (item) {
    case 'rocket': return <Rocket {...iconProps} className={`${className} text-indigo-600`} />;
    case 'gift': return <Gift {...iconProps} className={`${className} text-rose-600`} />;
    case 'flower': return <Flower2 {...iconProps} className={`${className} text-pink-600`} />;
    case 'fish': return <Fish {...iconProps} className={`${className} text-cyan-700`} />;
    case 'star': return <Star {...iconProps} className={`${className} text-amber-600`} fill="currentColor" />;
    case 'diamond': return <Diamond {...iconProps} className={`${className} text-violet-600`} fill="currentColor" />;
    case 'circle': return <Circle {...iconProps} className={`${className} text-orange-500`} fill="currentColor" />;
    case 'square': return <Square {...iconProps} className={`${className} text-blue-600`} fill="currentColor" />;
    case 'triangle': return <Triangle {...iconProps} className={`${className} text-emerald-600`} fill="currentColor" />;
    case 'hexagon': return <Hexagon {...iconProps} className={`${className} text-teal-600`} fill="currentColor" />;
    case '?': return <span className="text-4xl font-black text-teal-700">?</span>;
    default: return <Shapes {...iconProps} className={`${className} text-slate-600`} />;
  }
};

const formatPuzzleItem = (item: string) => item.charAt(0).toUpperCase() + item.slice(1);

const PUZZLE_MISSIONS = [
  { gradeLevel: 1, title: 'Memory Match', pairCount: 3, patternLength: 4, prompt: 'Match pictures and notice what repeats.' },
  { gradeLevel: 2, title: 'Shape Focus', pairCount: 4, patternLength: 5, prompt: 'Look carefully before you choose.' },
  { gradeLevel: 3, title: 'Pattern Finder', pairCount: 5, patternLength: 5, prompt: 'Find the rule, then predict the next item.' },
  { gradeLevel: 4, title: 'Strategy Builder', pairCount: 6, patternLength: 6, prompt: 'Use a plan and remember where each card was.' },
  { gradeLevel: 5, title: 'Logic Coach', pairCount: 6, patternLength: 7, prompt: 'Compare options and rule out weak choices.' },
  { gradeLevel: 6, title: 'Complex Patterns', pairCount: 6, patternLength: 8, prompt: 'Track more than one repeating part.' },
  { gradeLevel: 7, title: 'Puzzle Mastery', pairCount: 6, patternLength: 9, prompt: 'Solve with accuracy, memory, and explanation.' },
  { gradeLevel: 1, title: 'Look Twice', pairCount: 3, patternLength: 4, prompt: 'Look, remember, then choose after one careful breath.' },
  { gradeLevel: 2, title: 'Same and Different', pairCount: 4, patternLength: 5, prompt: 'Say what is the same and what is different before choosing.' },
  { gradeLevel: 3, title: 'AB Pattern Coach', pairCount: 5, patternLength: 6, prompt: 'Name the repeating rule out loud before you tap.' },
  { gradeLevel: 4, title: 'Three-Part Pattern', pairCount: 6, patternLength: 7, prompt: 'Track a longer pattern with three repeating parts.' },
  { gradeLevel: 5, title: 'Working Memory Sprint', pairCount: 6, patternLength: 8, prompt: 'Remember more cards and use a planned search path.' },
  { gradeLevel: 6, title: 'Rule Detective', pairCount: 6, patternLength: 9, prompt: 'Find the rule, test it, and explain why the answer fits.' },
  { gradeLevel: 7, title: 'Logic Proof', pairCount: 6, patternLength: 10, prompt: 'Solve and explain which options you ruled out.' },
];

const PUZZLE_EXPANSION_THEMES = [
  'color clues', 'animal pairs', 'space path', 'shape rules', 'weather sort',
  'number trail', 'garden memory', 'ocean pattern', 'robot logic', 'map route',
  'music match', 'sports sequence', 'school supplies', 'food groups', 'story order',
  'kindness choices', 'machine parts', 'season cycle', 'community helpers', 'mystery code',
];

const EXPANDED_PUZZLE_MISSIONS = PUZZLE_EXPANSION_THEMES.flatMap((theme, themeIndex) =>
  Array.from({ length: 7 }, (_, gradeIndex) => Array.from({ length: 2 }, (_, variantIndex) => {
    const gradeLevel = gradeIndex + 1;
    return {
      gradeLevel,
      title: `${theme.replace(/^\w/, letter => letter.toUpperCase())} Challenge ${variantIndex + 1}`,
      pairCount: Math.min(6, 3 + Math.floor((gradeLevel + themeIndex % 2) / 2)),
      patternLength: 4 + gradeLevel + (themeIndex % 3) + variantIndex,
      prompt: gradeLevel <= 2
        ? `Use careful looking to solve the ${theme} puzzle.`
        : gradeLevel <= 4
          ? `Find the rule in the ${theme} puzzle, then explain what comes next.`
          : `Use memory, logic, and elimination to prove the best ${theme} answer.`,
    };
  })).flat()
);

const ALL_PUZZLE_MISSIONS = [...PUZZLE_MISSIONS, ...EXPANDED_PUZZLE_MISSIONS];

export const PuzzleRoom: React.FC<PuzzleRoomProps> = ({ onBack, onReward, level }) => {
  const [mode, setMode] = useState<PuzzleMode>('MEMORY');
  
  // Memory State
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  // Pattern State
  const [sequence, setSequence] = useState<string[]>([]);
  const [patternOptions, setPatternOptions] = useState<string[]>([]);
  const [patternAnswer, setPatternAnswer] = useState('');
  const [missingIndex, setMissingIndex] = useState(0);

  // Shapes State
  const [targetShape, setTargetShape] = useState('');
  const [shapeOptions, setShapeOptions] = useState<string[]>([]);
  const [teacherFeedback, setTeacherFeedback] = useState('Teacher Check: look carefully, name your strategy, then solve the puzzle.');
  const puzzleStep = useRef(0);

  const ITEMS = ['rocket', 'gift', 'flower', 'fish', 'star', 'diamond'];
  const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];

  const mission = useMemo(() => {
    const missionPool = ALL_PUZZLE_MISSIONS.filter(item => item.gradeLevel <= Math.min(Math.max(level, 1), 7));
    return pickDailyItem(missionPool, `puzzle-mission-grade-${level}`) || ALL_PUZZLE_MISSIONS[0];
  }, [level]);

  const initGame = () => {
    const step = puzzleStep.current;
    puzzleStep.current += 1;

    if (mode === 'MEMORY') {
        const missionItems = shuffleDailyItems(ITEMS, `puzzle-memory-items-${level}-${mission.title}`, step).slice(0, mission.pairCount);
        const deck = shuffleDailyItems([...missionItems, ...missionItems], `puzzle-memory-deck-${level}-${mission.title}`, step).map((emoji, i) => ({
            id: i, emoji, isFlipped: false, isMatched: false
        }));
        setCards(deck);
        setFlipped([]);
        setIsLocked(false);
        setTeacherFeedback(`Teacher Check: memory mission ready. Find ${mission.pairCount} matching pairs.`);
    } else if (mode === 'PATTERN') {
        const shuffled = shuffleDailyItems(ITEMS, `puzzle-pattern-items-${level}-${mission.title}`, step);
        const patternSize = level >= 5 ? 3 : 2;
        const pattern = shuffled.slice(0, patternSize);
        const built = Array.from({ length: mission.patternLength }, (_, i) => pattern[i % pattern.length]);
        const answer = built[built.length - 1];
        setSequence([...built.slice(0, -1), '?']);
        setPatternAnswer(answer);
        setMissingIndex(built.length - 1);
        const options = Array.from(new Set([...pattern, answer, ...shuffled])).slice(0, Math.max(3, patternSize + 1));
        setPatternOptions(shuffleDailyItems(options, `puzzle-pattern-options-${level}-${mission.title}`, step));
        setTeacherFeedback(`Teacher Check: pattern mission ready. Say the rule, then choose what comes next.`);
    } else if (mode === 'SHAPES') {
        const target = pickDailyItem(SHAPES, `puzzle-shape-target-${level}-${mission.title}`, step);
        setTargetShape(target);
        const distractors = shuffleDailyItems(SHAPES.filter(shape => shape !== target), `puzzle-shape-distractors-${level}-${mission.title}`, step).slice(0, level >= 5 ? 5 : 3);
        setShapeOptions(shuffleDailyItems([target, ...distractors], `puzzle-shape-options-${level}-${mission.title}`, step));
        setTeacherFeedback(`Teacher Check: shape mission ready. Match the target exactly.`);
    }
  };

  useEffect(() => {
    initGame();
  }, [mode, level]);

  const handleMemoryClick = (id: number) => {
    if (isLocked) return;
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    playPop();
    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
        setIsLocked(true);
        const [c1, c2] = newCards.filter(c => newFlipped.includes(c.id));
        if (c1.emoji === c2.emoji) {
            playSuccess();
            setTeacherFeedback(`Correct match. You found two ${formatPuzzleItem(c1.emoji)} cards. Keep scanning slowly.`);
            setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, isMatched: true } : c));
            setFlipped([]);
            setIsLocked(false);
            if (newCards.filter(c => !c.isMatched).length <= 2) {
              setTeacherFeedback(`Teacher Check: memory mission complete. You matched ${mission.pairCount} pairs by remembering card locations.`);
              setTimeout(() => onReward({
                questionId: `puzzle-memory-${mission.title}`,
                skill: 'memory matching',
                prompt: mission.prompt,
                selectedAnswer: 'matched all pairs',
                correctAnswer: `${mission.pairCount} pairs`,
              }), 500);
            }
        } else {
            setTimeout(() => {
                playError();
                setTeacherFeedback(`Good try. ${c1.emoji} and ${c2.emoji} do not match. Remember those spots and try another pair.`);
                setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c));
                setFlipped([]);
                setIsLocked(false);
            }, 1000);
        }
    }
  };

  const handlePatternClick = (opt: string) => {
      if (opt === patternAnswer) {
          playSuccess();
          setSequence(prev => prev.map(p => p === '?' ? opt : p));
          setTeacherFeedback(`Correct. ${formatPuzzleItem(opt)} completes the pattern because the rule repeats.`);
          setTimeout(() => {
              onReward({
                questionId: `puzzle-pattern-${mission.title}-${sequence.join('')}`,
                skill: 'pattern logic',
                prompt: mission.prompt,
                selectedAnswer: opt,
                correctAnswer: patternAnswer,
              });
              initGame();
          }, 1000);
      } else {
          playError();
          setTeacherFeedback(`Try again. ${formatPuzzleItem(opt)} does not fit the rule yet. Look at the first two or three items and repeat the pattern.`);
      }
  };

  const handleShapeClick = (opt: string) => {
      if (opt === targetShape) {
          playSuccess();
          setTeacherFeedback(`Correct. ${formatPuzzleItem(opt)} matches the target shape exactly.`);
          onReward({
            questionId: `puzzle-shape-${mission.title}-${targetShape}`,
            skill: 'visual discrimination',
            prompt: mission.prompt,
            selectedAnswer: opt,
            correctAnswer: targetShape,
          });
          initGame();
      } else {
          playError();
          setTeacherFeedback(`Try again. ${formatPuzzleItem(opt)} is not the target. Compare color and shape before tapping.`);
      }
  }

  const modeTitle = mode === 'MEMORY' ? 'Memory Match' : mode === 'PATTERN' ? 'Pattern Builder' : 'Shape Detective';
  const modePrompt = mode === 'MEMORY'
    ? `Find ${mission.pairCount} matching pairs. Remember where each picture is hiding.`
    : mode === 'PATTERN'
      ? 'Name the repeating rule, then choose what comes next.'
      : 'Compare every detail and find the exact matching shape.';

  return (
    <div className="academy-room-surface h-full w-full flex flex-col p-4 relative overflow-auto" style={{ '--academy-room-scene': "url('/academy/rooms/puzzle.webp')" } as React.CSSProperties}>
      <header className="flex justify-between items-center mb-4 z-10">
        <button onClick={onBack} aria-label="Back to world map" className="bg-white p-2 rounded-full shadow-lg">
          <ArrowLeft className="text-teal-600" />
        </button>
        
        <div className="flex bg-teal-900/50 p-1 rounded-xl backdrop-blur-md shadow-lg">
            <button aria-label="Memory Match" title="Memory Match" onClick={() => setMode('MEMORY')} className={`p-2 rounded-lg ${mode==='MEMORY'?'bg-white text-teal-800':'text-white'}`}><Grid3X3 /></button>
            <button aria-label="Pattern Builder" title="Pattern Builder" onClick={() => setMode('PATTERN')} className={`p-2 rounded-lg ${mode==='PATTERN'?'bg-white text-teal-800':'text-white'}`}><BrainCircuit /></button>
            <button aria-label="Shape Detective" title="Shape Detective" onClick={() => setMode('SHAPES')} className={`p-2 rounded-lg ${mode==='SHAPES'?'bg-white text-teal-800':'text-white'}`}><Shapes /></button>
        </div>

        <button onClick={initGame} aria-label="New puzzle" title="New puzzle" className="bg-teal-800 p-2 rounded-full text-white hover:bg-teal-700">
           <RefreshCw size={20} />
        </button>
      </header>

      <div className="mx-auto mb-4 max-w-3xl rounded-2xl bg-white/95 p-4 text-center shadow-lg ring-1 ring-teal-100">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-teal-600">Puzzle Brain Gym</div>
        <div className="mt-1 text-lg font-black text-slate-800">{modeTitle}</div>
        <div className="text-xs font-bold text-slate-500">{modePrompt}</div>
        <div className="mt-3 rounded-xl bg-white px-4 py-3 text-sm font-black text-teal-900 shadow-sm ring-1 ring-teal-100">
          {teacherFeedback}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            ['Memory', 'Flip and match'],
            ['Pattern', 'Find what comes next'],
            ['Shapes', 'Compare carefully'],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-xl bg-teal-50 p-2">
              <div className="text-sm font-black text-slate-800">{title}</div>
              <div className="text-xs font-semibold text-slate-500">{copy}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center flex-col">
        
        {mode === 'MEMORY' && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl w-full aspect-square md:aspect-auto">
                {cards.map(card => (
                    <button type="button" aria-label={`Memory card ${card.id + 1}`} key={card.id} onClick={() => handleMemoryClick(card.id)} className="group relative h-24 w-full cursor-pointer perspective-1000">
                        <div className={`w-full h-full transition-all duration-500 transform style-preserve-3d ${card.isFlipped ? 'rotate-y-180' : ''}`}>
                            <div className="absolute inset-0 bg-teal-800 rounded-xl border-4 border-teal-400 flex items-center justify-center backface-hidden shadow-lg">
                                <span className="text-4xl font-black text-teal-100/80">?</span>
                            </div>
                            <div className="absolute inset-0 bg-white rounded-xl border-4 border-yellow-400 flex items-center justify-center backface-hidden rotate-y-180 shadow-xl">
                                {renderPuzzleIcon(card.emoji, 'h-12 w-12')}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        )}

        {mode === 'PATTERN' && (
            <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
                <h2 className="text-white text-2xl font-bold uppercase tracking-widest">What comes next?</h2>
                <div className="flex gap-4 p-6 bg-white/20 rounded-2xl">
                    {sequence.map((item, i) => (
                        <div key={i} className="w-20 h-20 bg-white rounded-xl flex items-center justify-center text-5xl shadow-lg">
                            {renderPuzzleIcon(item, 'h-12 w-12')}
                        </div>
                    ))}
                </div>
                <div className="flex gap-4">
                    {patternOptions.map((opt, i) => (
                        <button key={i} aria-label={`Choose ${formatPuzzleItem(opt)}`} data-testid="pattern-answer" data-pattern-correct={opt === patternAnswer ? 'true' : 'false'} onClick={() => handlePatternClick(opt)} className="w-24 h-24 bg-yellow-400 hover:bg-yellow-300 rounded-xl text-5xl shadow-[0_6px_0_rgb(200,150,0)] active:translate-y-2 active:shadow-none transition-all">
                            {renderPuzzleIcon(opt, 'h-12 w-12')}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {mode === 'SHAPES' && (
            <div className="flex flex-col items-center gap-12">
                <h2 className="text-white text-2xl font-bold uppercase">Find the matching shape!</h2>
                <div data-testid="shape-target" data-shape={targetShape} className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-8xl shadow-[0_0_50px_white] animate-bounce">
                    {renderPuzzleIcon(targetShape, 'h-20 w-20')}
                </div>
                <div className="grid grid-cols-4 gap-6">
                     {shapeOptions.map((opt, i) => (
                         <button key={i} aria-label={`Choose ${formatPuzzleItem(opt)}`} data-testid="shape-answer" data-shape-correct={opt === targetShape ? 'true' : 'false'} onClick={() => handleShapeClick(opt)} className="w-20 h-20 bg-teal-800 hover:bg-teal-700 rounded-xl text-4xl border-b-4 border-teal-900 active:border-b-0 active:translate-y-1">
                             {renderPuzzleIcon(opt, 'h-10 w-10')}
                         </button>
                     ))}
                </div>
            </div>
        )}

      </div>
      <style>{`.style-preserve-3d { transform-style: preserve-3d; } .rotate-y-180 { transform: rotateY(180deg); } .backface-hidden { backface-visibility: hidden; }`}</style>
    </div>
  );
};
