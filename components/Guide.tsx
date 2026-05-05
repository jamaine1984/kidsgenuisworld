import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { speak as speakText, isSpeaking, setNarrationContext } from '../services/audioService';
import { RoomType } from '../types';

interface GuideProps {
  room: RoomType;
  trigger: number; // Increment to force new message
}

export const Guide: React.FC<GuideProps> = ({ room, trigger }) => {
  const [message, setMessage] = useState("Welcome to Kid Genius World!");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBubbleOpen, setIsBubbleOpen] = useState(room !== RoomType.HUB);
  const isHub = room === RoomType.HUB;

  const getGuideMessage = (currentRoom: RoomType) => {
    const messages: Record<RoomType, string[]> = {
      [RoomType.HUB]: [
        "Pick a room and let's start learning.",
        "Tap a place on the map for your next adventure.",
      ],
      [RoomType.MATH]: [
        "Count carefully and take your time in Math Lab.",
        "Let's solve one problem at a time.",
      ],
      [RoomType.READING]: [
        "Tap the speaker anytime to hear the word again.",
        "Let's read the word slowly together.",
      ],
      [RoomType.PUZZLE]: [
        "Look for patterns before you choose.",
      ],
      [RoomType.MUSIC]: [
        "Listen first, then tap along with the beat.",
      ],
      [RoomType.ART]: [
        "Be creative. There is more than one good idea here.",
      ],
      [RoomType.SCIENCE]: [
        "Think like a scientist and test your best idea.",
      ],
      [RoomType.GEOGRAPHY]: [
        "Look closely at the clues before you answer.",
      ],
      [RoomType.CODING]: [
        "Try one step, then check what the robot does.",
      ],
      [RoomType.LANGUAGE]: [
        "Listen to the new word, then say it back.",
      ],
      [RoomType.STORYBOOK]: [
        "Sit back and listen to the story page by page.",
      ],
    };

    const roomMessages = messages[currentRoom] || messages[RoomType.HUB];
    return roomMessages[trigger % roomMessages.length];
  };

  useEffect(() => {
    const msg = getGuideMessage(room);
    setMessage(msg);
    setIsBubbleOpen(room !== RoomType.HUB);
  }, [room, trigger]);

  const speak = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setNarrationContext(`${room}-guide`);
    speakText(message);
    // Check periodically if speech has finished
    const checkSpeaking = setInterval(() => {
      if (!isSpeaking()) {
        setIsPlaying(false);
        clearInterval(checkSpeaking);
      }
    }, 100);
    // Timeout after 10 seconds max
    setTimeout(() => {
      setIsPlaying(false);
      clearInterval(checkSpeaking);
    }, 10000);
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 flex flex-col items-end pointer-events-none">
      {/* Speech Bubble */}
      {isBubbleOpen && (
        <div className="bg-white p-3 sm:p-4 rounded-2xl rounded-br-none shadow-xl mb-2 max-w-[220px] sm:max-w-xs border-4 border-yellow-400 animate-bounce-slight pointer-events-auto transform transition-all hover:scale-105">
          <p className="text-slate-800 font-bold text-base sm:text-lg leading-tight">
              {message}
          </p>
          <button
              onClick={speak}
              className="mt-2 flex items-center gap-1 text-xs font-bold text-yellow-600 uppercase tracking-wider hover:text-yellow-800"
          >
              <Volume2 size={14} /> {isPlaying ? "Speaking..." : "Read to me"}
          </button>
        </div>
      )}

      {/* Mascot Avatar (CSS Only) */}
      <button
        type="button"
        className={`relative floating pointer-events-auto cursor-pointer ${isHub ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-16 h-16 sm:w-24 sm:h-24'}`}
        onClick={() => {
          if (!isBubbleOpen) {
            setIsBubbleOpen(true);
            return;
          }
          speak();
        }}
        aria-label={isBubbleOpen ? 'Read guide message' : 'Open guide message'}
      >
        {/* Head */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
           <div className="w-full h-full relative">
             {/* Eyes */}
             <div className={`absolute top-1/3 left-1/4 bg-black rounded-full animate-pulse ${isHub ? 'w-2.5 h-2.5 sm:w-3 sm:h-3' : 'w-3 h-3 sm:w-4 sm:h-4'}`}>
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
             </div>
             <div className={`absolute top-1/3 right-1/4 bg-black rounded-full animate-pulse ${isHub ? 'w-2.5 h-2.5 sm:w-3 sm:h-3' : 'w-3 h-3 sm:w-4 sm:h-4'}`}>
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
             </div>
             {/* Mouth */}
             <div className={`absolute bottom-1/4 left-1/2 transform -translate-x-1/2 bg-red-400 rounded-b-full border-t-2 border-red-600 ${isHub ? 'w-5 h-2.5 sm:w-6 sm:h-3' : 'w-6 h-3 sm:w-8 sm:h-4'}`}></div>
             {/* Glasses */}
             <div className={`absolute top-1/3 left-1/2 transform -translate-x-1/2 border-[3px] sm:border-4 border-indigo-600 rounded-lg opacity-80 ${isHub ? 'w-9 h-4 sm:w-11 sm:h-5' : 'w-11 h-5 sm:w-16 sm:h-6'}`}></div>
           </div>
        </div>
        {/* Antenna */}
        <div className={`absolute left-1/2 w-1 bg-indigo-500 transform -translate-x-1/2 -z-10 ${isHub ? '-top-3 h-4' : '-top-4 h-6'}`}></div>
        <div className={`absolute left-1/2 bg-red-500 rounded-full transform -translate-x-1/2 shadow-glow animate-ping-slow ${isHub ? '-top-4 w-2.5 h-2.5' : '-top-6 w-3 h-3'}`}></div>
      </button>
    </div>
  );
};
