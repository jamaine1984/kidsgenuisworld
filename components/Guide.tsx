import React, { useState, useEffect } from 'react';
import { MessageCircle, Volume2 } from 'lucide-react';
import { getGuideMessage } from '../services/geminiService';
import { speak as speakText, isSpeaking } from '../services/audioService';
import { RoomType } from '../types';

interface GuideProps {
  room: RoomType;
  trigger: number; // Increment to force new message
}

export const Guide: React.FC<GuideProps> = ({ room, trigger }) => {
  const [message, setMessage] = useState("Welcome to Kid Genius World!");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      const msg = await getGuideMessage(room === RoomType.HUB ? "Main Hall" : `${room} Room`);
      setMessage(msg);
      setIsLoading(false);
    };
    fetchMessage();
  }, [room, trigger]);

  const speak = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    // Use FREE Web Speech API instead of paid Gemini TTS
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
            {isLoading ? "Thinking..." : message}
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