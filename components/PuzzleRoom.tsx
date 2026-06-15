import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Shapes, Grid3X3, BrainCircuit } from 'lucide-react';
import { playSuccess, playError, playPop } from '../services/audioService';
import { pickDailyItem, shuffleDailyItems } from '../services/dailyRotation';

interface PuzzleRoomProps {
  onBack: () => void;
  onReward: () => void;
  level: number;
}

type PuzzleMode = 'MEMORY' | 'PATTERN' | 'SHAPES';

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
  const puzzleStep = useRef(0);

  const ITEMS = ['🦄', '🦕', '🍕', '🚀', '🎈', '🎁'];
  const SHAPES = ['🟥', '🟦', '🟩', '🟨', '🟠', '🟣'];

  const mission = useMemo(() => {
    const missionPool = PUZZLE_MISSIONS.filter(item => item.gradeLevel <= Math.min(Math.max(level, 1), 7));
    return pickDailyItem(missionPool, `puzzle-mission-grade-${level}`) || PUZZLE_MISSIONS[0];
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
    } else if (mode === 'SHAPES') {
        const target = pickDailyItem(SHAPES, `puzzle-shape-target-${level}-${mission.title}`, step);
        setTargetShape(target);
        const distractors = shuffleDailyItems(SHAPES.filter(shape => shape !== target), `puzzle-shape-distractors-${level}-${mission.title}`, step).slice(0, level >= 5 ? 5 : 3);
        setShapeOptions(shuffleDailyItems([target, ...distractors], `puzzle-shape-options-${level}-${mission.title}`, step));
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
            setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, isMatched: true } : c));
            setFlipped([]);
            setIsLocked(false);
            if (newCards.filter(c => !c.isMatched).length <= 2) setTimeout(onReward, 500);
        } else {
            setTimeout(() => {
                playError();
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
          setTimeout(() => {
              onReward();
              initGame();
          }, 1000);
      } else {
          playError();
      }
  };

  const handleShapeClick = (opt: string) => {
      if (opt === targetShape) {
          playSuccess();
          onReward();
          initGame();
      } else {
          playError();
      }
  }

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#bef264_0,#14b8a6_34%,#0f766e_70%,#134e4a_100%)] flex flex-col p-4 relative overflow-auto">
      <header className="flex justify-between items-center mb-4 z-10">
        <button onClick={onBack} aria-label="Back to world map" className="bg-white p-2 rounded-full shadow-lg">
          <ArrowLeft className="text-teal-600" />
        </button>
        
        <div className="flex bg-teal-900/50 p-1 rounded-xl backdrop-blur-md shadow-lg">
            <button onClick={() => setMode('MEMORY')} className={`p-2 rounded-lg ${mode==='MEMORY'?'bg-white text-teal-800':'text-white'}`}><Grid3X3 /></button>
            <button onClick={() => setMode('PATTERN')} className={`p-2 rounded-lg ${mode==='PATTERN'?'bg-white text-teal-800':'text-white'}`}><BrainCircuit /></button>
            <button onClick={() => setMode('SHAPES')} className={`p-2 rounded-lg ${mode==='SHAPES'?'bg-white text-teal-800':'text-white'}`}><Shapes /></button>
        </div>

        <button onClick={initGame} className="bg-teal-800 p-2 rounded-full text-white hover:bg-teal-700">
           <RefreshCw size={20} />
        </button>
      </header>

      <div className="mx-auto mb-4 max-w-3xl rounded-2xl bg-white/95 p-4 text-center shadow-lg ring-1 ring-teal-100">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-teal-600">Puzzle Brain Gym</div>
        <div className="mt-1 text-lg font-black text-slate-800">{mission.title}</div>
        <div className="text-xs font-bold text-slate-500">{mission.prompt}</div>
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
                    <div key={card.id} onClick={() => handleMemoryClick(card.id)} className="relative w-full h-24 perspective-1000 cursor-pointer group">
                        <div className={`w-full h-full transition-all duration-500 transform style-preserve-3d ${card.isFlipped ? 'rotate-y-180' : ''}`}>
                            <div className="absolute inset-0 bg-teal-800 rounded-xl border-4 border-teal-400 flex items-center justify-center backface-hidden shadow-lg">
                                <span className="text-4xl opacity-50">❓</span>
                            </div>
                            <div className="absolute inset-0 bg-white rounded-xl border-4 border-yellow-400 flex items-center justify-center backface-hidden rotate-y-180 shadow-xl">
                                <span className="text-5xl">{card.emoji}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {mode === 'PATTERN' && (
            <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
                <h2 className="text-white text-2xl font-bold uppercase tracking-widest">What comes next?</h2>
                <div className="flex gap-4 p-6 bg-white/20 rounded-2xl">
                    {sequence.map((item, i) => (
                        <div key={i} className="w-20 h-20 bg-white rounded-xl flex items-center justify-center text-5xl shadow-lg">
                            {item}
                        </div>
                    ))}
                </div>
                <div className="flex gap-4">
                    {patternOptions.map((opt, i) => (
                        <button key={i} onClick={() => handlePatternClick(opt)} className="w-24 h-24 bg-yellow-400 hover:bg-yellow-300 rounded-xl text-5xl shadow-[0_6px_0_rgb(200,150,0)] active:translate-y-2 active:shadow-none transition-all">
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {mode === 'SHAPES' && (
            <div className="flex flex-col items-center gap-12">
                <h2 className="text-white text-2xl font-bold uppercase">Find the matching shape!</h2>
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-8xl shadow-[0_0_50px_white] animate-bounce">
                    {targetShape}
                </div>
                <div className="grid grid-cols-4 gap-6">
                     {shapeOptions.map((opt, i) => (
                         <button key={i} onClick={() => handleShapeClick(opt)} className="w-20 h-20 bg-teal-800 hover:bg-teal-700 rounded-xl text-4xl border-b-4 border-teal-900 active:border-b-0 active:translate-y-1">
                             {opt}
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
