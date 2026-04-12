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
      [RoomType.PLAYGROUND]: [
        "Take a fun break, then jump back into learning.",
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
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      {/* Speech Bubble */}
      <div className="bg-white p-4 rounded-2xl rounded-br-none shadow-xl mb-2 max-w-xs border-4 border-yellow-400 animate-bounce-slight pointer-events-auto transform transition-all hover:scale-105">
        <p className="text-slate-800 font-bold text-lg leading-tight">
            {message}
        </p>
        <button 
            onClick={speak}
            className="mt-2 flex items-center gap-1 text-xs font-bold text-yellow-600 uppercase tracking-wider hover:text-yellow-800"
        >
            <Volume2 size={14} /> {isPlaying ? "Speaking..." : "Read to me"}
        </button>
      </div>

      {/* Mascot Avatar (CSS Only) */}
      <div className="relative w-24 h-24 floating pointer-events-auto cursor-pointer" onClick={() => speak()}>
        {/* Head */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
           <div className="w-full h-full relative">
             {/* Eyes */}
             <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-black rounded-full animate-pulse">
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
             </div>
             <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-black rounded-full animate-pulse">
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full"></div>
             </div>
             {/* Mouth */}
             <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-red-400 rounded-b-full border-t-2 border-red-600"></div>
             {/* Glasses */}
             <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-16 h-6 border-4 border-indigo-600 rounded-lg opacity-80"></div>
           </div>
        </div>
        {/* Antenna */}
        <div className="absolute -top-4 left-1/2 w-1 h-6 bg-indigo-500 transform -translate-x-1/2 -z-10"></div>
        <div className="absolute -top-6 left-1/2 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 shadow-glow animate-ping-slow"></div>
      </div>
    </div>
  );
};
