import React, { useState, useEffect } from 'react';
import { Minimize2, Volume2 } from 'lucide-react';
import { speak as speakText, isSpeaking, setNarrationContext } from '../services/audioService';
import { RoomType } from '../types';

interface GuideProps {
  room: RoomType;
  trigger: number; // Increment to force new message
}

export const Guide: React.FC<GuideProps> = ({ room, trigger }) => {
  const [message, setMessage] = useState("Welcome to Kid Genius World!");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBubbleOpen, setIsBubbleOpen] = useState(room === RoomType.HUB);
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
      [RoomType.STUDY]: [
        "Let's fix missed answers and make them stronger.",
        "Choose the answer, then listen to the reason.",
      ],
    };

    const roomMessages = messages[currentRoom] || messages[RoomType.HUB];
    return roomMessages[trigger % roomMessages.length];
  };

  useEffect(() => {
    const msg = getGuideMessage(room);
    setMessage(msg);
    setIsBubbleOpen(room === RoomType.HUB);
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
    <div className="fixed bottom-3 right-3 z-40 flex flex-col items-end pointer-events-none sm:bottom-4 sm:right-4">
      {/* Speech Bubble */}
      {isBubbleOpen && (
        <div
          data-testid="guide-bubble"
          className="mb-2 max-w-[210px] rounded-2xl rounded-br-none border-4 border-yellow-400 bg-white p-3 shadow-xl pointer-events-auto sm:max-w-xs sm:p-4"
        >
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-base font-bold leading-tight text-slate-800 sm:text-lg">
                {message}
            </p>
            <button
              onClick={() => setIsBubbleOpen(false)}
              aria-label="Minimize guide message"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <Minimize2 size={15} />
            </button>
          </div>
          <button
              onClick={speak}
              className="mt-2 flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-yellow-700 hover:bg-yellow-200 hover:text-yellow-900"
          >
              <Volume2 size={14} /> {isPlaying ? "Speaking..." : "Read to me"}
          </button>
        </div>
      )}

      {/* Mascot Avatar (CSS Only) */}
      <button
        type="button"
        className={`relative pointer-events-auto cursor-pointer ${isHub ? 'floating h-12 w-12 sm:h-16 sm:w-16' : 'h-12 w-12 sm:h-14 sm:w-14'}`}
        onClick={() => {
          setIsBubbleOpen(open => !open);
        }}
        aria-label={isBubbleOpen ? 'Hide guide message' : 'Open guide message'}
      >
        {/* Head */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
           <div className="w-full h-full relative">
             {/* Eyes */}
             <div className="absolute left-1/4 top-1/3 h-2.5 w-2.5 animate-pulse rounded-full bg-black sm:h-3 sm:w-3">
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
             </div>
             <div className="absolute right-1/4 top-1/3 h-2.5 w-2.5 animate-pulse rounded-full bg-black sm:h-3 sm:w-3">
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
             </div>
             {/* Mouth */}
             <div className="absolute bottom-1/4 left-1/2 h-2.5 w-5 -translate-x-1/2 rounded-b-full border-t-2 border-red-600 bg-red-400 sm:h-3 sm:w-6"></div>
             {/* Glasses */}
             <div className="absolute left-1/2 top-1/3 h-4 w-9 -translate-x-1/2 rounded-lg border-[3px] border-indigo-600 opacity-80 sm:h-5 sm:w-11 sm:border-4"></div>
           </div>
        </div>
        {/* Antenna */}
        <div className="absolute -top-3 left-1/2 -z-10 h-4 w-1 -translate-x-1/2 bg-indigo-500"></div>
        <div className="absolute -top-4 left-1/2 h-2.5 w-2.5 -translate-x-1/2 animate-ping-slow rounded-full bg-red-500 shadow-glow"></div>
      </button>
    </div>
  );
};
