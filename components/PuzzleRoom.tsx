import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Shapes, Grid3X3, BrainCircuit } from 'lucide-react';
import { playSuccess, playError, playPop } from '../services/audioService';

interface PuzzleRoomProps {
  onBack: () => void;
  onReward: () => void;
}

type PuzzleMode = 'MEMORY' | 'PATTERN' | 'SHAPES';

export const PuzzleRoom: React.FC<PuzzleRoomProps> = ({ onBack, onReward }) => {
  const [mode, setMode] = useState<PuzzleMode>('MEMORY');
  
  // Memory State
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  // Pattern State
  const [sequence, setSequence] = useState<string[]>([]);
  const [patternOptions, setPatternOptions] = useState<string[]>([]);
  const [missingIndex, setMissingIndex] = useState(0);

  // Shapes State
  const [targetShape, setTargetShape] = useState('');
  const [shapeOptions, setShapeOptions] = useState<string[]>([]);

  const ITEMS = ['🦄', '🦕', '🍕', '🚀', '🎈', '🎁'];
  const SHAPES = ['🟥', '🟦', '🟩', '🟨', '🟠', '🟣'];

  const initGame = () => {
    if (mode === 'MEMORY') {
        const deck = [...ITEMS, ...ITEMS].sort(() => Math.random() - 0.5).map((emoji, i) => ({
            id: i, emoji, isFlipped: false, isMatched: false
        }));
        setCards(deck);
        setFlipped([]);
        setIsLocked(false);
    } else if (mode === 'PATTERN') {
        // Create pattern like A B A B ?
        const a = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        const b = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        setSequence([a, b, a, b, '?']);
        setMissingIndex(4);
        setPatternOptions([a, b, ITEMS[0] === a ? ITEMS[1] : ITEMS[0]].sort(() => Math.random() - 0.5));
    } else if (mode === 'SHAPES') {
        const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        setTargetShape(target);
        setShapeOptions([...SHAPES].sort(() => Math.random() - 0.5).slice(0, 4));
        if (!shapeOptions.includes(target)) shapeOptions[0] = target; // Ensure answer exists
    }
  };

  useEffect(() => {
    initGame();
  }, [mode]);

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
      // Assuming simple A B A B logic
      const answer = sequence[0]; // If A B A B, next is A
      if (opt === answer) {
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
    <div className="h-full w-full bg-teal-600 flex flex-col p-4 relative">
      <header className="flex justify-between items-center mb-4 z-10">
        <button onClick={onBack} className="bg-white p-2 rounded-full shadow-lg">
          <ArrowLeft className="text-teal-600" />
        </button>
        
        <div className="flex bg-teal-800/50 p-1 rounded-xl backdrop-blur-md">
            <button onClick={() => setMode('MEMORY')} className={`p-2 rounded-lg ${mode==='MEMORY'?'bg-white text-teal-800':'text-white'}`}><Grid3X3 /></button>
            <button onClick={() => setMode('PATTERN')} className={`p-2 rounded-lg ${mode==='PATTERN'?'bg-white text-teal-800':'text-white'}`}><BrainCircuit /></button>
            <button onClick={() => setMode('SHAPES')} className={`p-2 rounded-lg ${mode==='SHAPES'?'bg-white text-teal-800':'text-white'}`}><Shapes /></button>
        </div>

        <button onClick={initGame} className="bg-teal-800 p-2 rounded-full text-white hover:bg-teal-700">
           <RefreshCw size={20} />
        </button>
      </header>

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
