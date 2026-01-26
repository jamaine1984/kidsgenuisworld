import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { playPop, playNote } from '../services/audioService';

interface PlaygroundProps {
  onBack: () => void;
}

export const Playground: React.FC<PlaygroundProps> = ({ onBack }) => {
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 80 });
  const [isSliding, setIsSliding] = useState(false);
  const [isSwinging, setIsSwinging] = useState(false);
  
  // NPCs state
  const [npcs, setNpcs] = useState([
      { id: 1, x: 20, y: 60, dx: 0.2, color: 'bg-pink-400', face: 'OwO', bounce: 0 },
      { id: 2, x: 70, y: 65, dx: -0.15, color: 'bg-purple-400', face: 'UwU', bounce: 0 },
      { id: 3, x: 45, y: 55, dx: 0.1, color: 'bg-yellow-400', face: '^o^', bounce: 0 },
  ]);

  // Animation Loop for NPCs
  useEffect(() => {
      const interval = setInterval(() => {
          setNpcs(prev => prev.map(npc => {
              let newX = npc.x + npc.dx;
              let newDx = npc.dx;
              
              // Bounce off walls (keep within 10% - 90%)
              if (newX < 10 || newX > 90) newDx = -newDx;

              // Random simple bounce animation
              const bounce = Math.sin(Date.now() / 200) * 5;

              return { ...npc, x: newX, dx: newDx, bounce };
          }));
      }, 50);
      return () => clearInterval(interval);
  }, []);

  const kickBall = () => {
    playPop();
    const newX = Math.random() * 80 + 10; // 10% to 90%
    const newY = Math.random() * 40 + 50; // 50% to 90%
    setBallPosition({ x: newX, y: newY });
  };

  const triggerSlide = () => {
      if(isSliding) return;
      playPop();
      setIsSliding(true);
      setTimeout(() => setIsSliding(false), 2000);
  }

  const triggerSwing = () => {
      setIsSwinging(!isSwinging);
      playNote(400, 'sine', 0.5);
  }

  const playFlowerSound = (note: number) => {
      playNote(note, 'triangle', 0.3);
  }

  return (
    <div className="h-full w-full bg-sky-300 overflow-hidden relative flex flex-col">
       {/* Sky */}
       <div className="absolute top-10 left-10 text-white opacity-60 text-6xl animate-pulse">☁️</div>
       <div className="absolute top-20 right-20 text-white opacity-60 text-6xl animate-pulse delay-700">☁️</div>
       <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-300 rounded-full blur-xl opacity-80 animate-pulse"></div>

       {/* Ground */}
       <div className="absolute bottom-0 w-full h-1/3 bg-green-500 border-t-8 border-green-600"></div>

       {/* Back Button */}
       <button onClick={onBack} className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg z-50">
         <ArrowLeft className="text-green-600" />
       </button>

       {/* Scene Container */}
       <div className="absolute inset-0 pointer-events-none">
           
           {/* Interactive Sound Flowers */}
           <div className="absolute bottom-[10%] left-[5%] flex gap-4 pointer-events-auto">
                {[1, 2, 3, 4].map((f, i) => (
                    <div 
                        key={i} 
                        className="w-12 h-12 bg-pink-400 rounded-full border-4 border-white flex items-center justify-center cursor-pointer hover:scale-125 transition-transform origin-bottom group"
                        onClick={() => playFlowerSound(400 + (i * 100))}
                    >
                        <div className="w-1 h-12 bg-green-700 absolute top-10 -z-10"></div>
                        <span className="text-xs font-bold text-white group-hover:block hidden">♫</span>
                    </div>
                ))}
           </div>

           {/* The Slide */}
           <div className="absolute bottom-[25%] left-[10%] w-64 h-64 pointer-events-auto" onClick={triggerSlide}>
               <div className="absolute bottom-0 left-0 w-4 h-48 bg-red-700"></div> {/* Ladder */}
               <div className="absolute bottom-48 left-0 w-32 h-4 bg-red-700"></div> {/* Platform */}
               <div className="absolute top-12 left-28 w-4 h-64 bg-yellow-400 transform rotate-45 origin-top-left rounded-full border-4 border-yellow-600"></div> {/* Slide */}
               
               {/* Avatar on Slide */}
               <div className={`absolute top-0 left-4 w-12 h-12 bg-blue-500 rounded-full transition-all duration-[2000ms] ease-in-out ${isSliding ? 'translate-x-[200px] translate-y-[220px]' : ''}`}>
                   <div className="text-xs text-white text-center mt-3">Wee!</div>
               </div>
           </div>

           {/* NPCs */}
           {npcs.map(npc => (
               <div 
                    key={npc.id}
                    className={`absolute w-16 h-14 ${npc.color} rounded-t-full rounded-b-xl border-2 border-black/20 pointer-events-auto cursor-pointer shadow-lg transition-transform hover:scale-110`}
                    style={{ left: `${npc.x}%`, top: `${npc.y}%`, transform: `translateY(${-npc.bounce}px)` }}
                    onClick={() => playPop()}
               >
                   <div className="text-center mt-4 font-bold text-white/80">{npc.face}</div>
                   <div className="absolute -bottom-1 left-2 w-2 h-3 bg-black/20 rounded-full"></div>
                   <div className="absolute -bottom-1 right-2 w-2 h-3 bg-black/20 rounded-full"></div>
                   
                   {/* Chat bubble on hover */}
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                       Hi there!
                   </div>
               </div>
           ))}

           {/* The Swing */}
           <div className="absolute bottom-[25%] right-[15%] w-48 h-64 pointer-events-auto cursor-pointer group" onClick={triggerSwing}>
               {/* Frame */}
               <div className="absolute bottom-0 left-0 w-2 h-64 bg-gray-700 transform -rotate-12 origin-bottom"></div>
               <div className="absolute bottom-0 right-0 w-2 h-64 bg-gray-700 transform rotate-12 origin-bottom"></div>
               <div className="absolute top-0 left-[-20px] w-60 h-4 bg-gray-700"></div>
               
               {/* Swing Seat & Ropes */}
               <div className={`absolute top-4 left-1/2 -translate-x-1/2 origin-top transition-all duration-1000 ease-in-out ${isSwinging ? 'animate-swing' : ''}`}>
                   <div className="w-0.5 h-40 bg-black absolute left-[-10px]"></div>
                   <div className="w-0.5 h-40 bg-black absolute right-[-10px]"></div>
                   <div className="w-24 h-4 bg-red-600 absolute top-40 left-1/2 -translate-x-1/2 rounded-lg flex items-center justify-center">
                       <span className="text-[10px] text-white opacity-0 group-hover:opacity-100">Push me!</span>
                   </div>
               </div>
           </div>

           {/* The Ball */}
           <div 
              className="absolute w-16 h-16 text-6xl transition-all duration-700 ease-out cursor-pointer pointer-events-auto hover:scale-110 z-10"
              style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }}
              onClick={kickBall}
           >
               ⚽
           </div>
       </div>

       <style>{`
         @keyframes swing {
             0% { transform: translateX(-50%) rotate(20deg); }
             50% { transform: translateX(-50%) rotate(-20deg); }
             100% { transform: translateX(-50%) rotate(20deg); }
         }
         .animate-swing {
             animation: swing 2s infinite ease-in-out;
         }
       `}</style>
    </div>
  );
};