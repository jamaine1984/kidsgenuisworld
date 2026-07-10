import React, { useEffect, useState } from 'react';
import { GraduationCap, Minimize2, Volume2 } from 'lucide-react';
import { isSpeaking, setNarrationContext, speak as speakText } from '../services/audioService';
import { RoomType } from '../types';

interface GuideProps {
  room: RoomType;
  trigger: number;
}

const GUIDE_MESSAGES: Record<RoomType, string[]> = {
  [RoomType.HUB]: [
    "Pick a classroom and let's start learning.",
    "Your next period is ready when you are.",
  ],
  [RoomType.MATH]: [
    'Count carefully and take your time in Math Lab.',
    "Let's solve one problem at a time.",
  ],
  [RoomType.READING]: [
    'Tap the speaker anytime to hear the word again.',
    "Let's read the word slowly together.",
  ],
  [RoomType.PUZZLE]: ['Look for patterns before you choose.'],
  [RoomType.MUSIC]: ['Listen first, then tap along with the beat.'],
  [RoomType.ART]: ['Be creative. There is more than one good idea here.'],
  [RoomType.SCIENCE]: ['Think like a scientist and test your best idea.'],
  [RoomType.GEOGRAPHY]: ['Look closely at the clues before you answer.'],
  [RoomType.CODING]: ['Try one step, then check what the robot does.'],
  [RoomType.LANGUAGE]: ['Listen to the new word, then say it back.'],
  [RoomType.STORYBOOK]: ['Listen to the story one page at a time.'],
  [RoomType.STUDY]: [
    "Let's strengthen the skills that need another try.",
    'Choose the answer, then listen to the reason.',
  ],
};

export const Guide: React.FC<GuideProps> = ({ room, trigger }) => {
  const [message, setMessage] = useState(GUIDE_MESSAGES[RoomType.HUB][0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);

  useEffect(() => {
    const roomMessages = GUIDE_MESSAGES[room] || GUIDE_MESSAGES[RoomType.HUB];
    setMessage(roomMessages[trigger % roomMessages.length]);
    setIsBubbleOpen(false);
  }, [room, trigger]);

  const speak = () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setNarrationContext(`${room}-guide`);
    speakText(message);

    const checkSpeaking = window.setInterval(() => {
      if (!isSpeaking()) {
        setIsPlaying(false);
        window.clearInterval(checkSpeaking);
      }
    }, 100);

    window.setTimeout(() => {
      setIsPlaying(false);
      window.clearInterval(checkSpeaking);
    }, 10000);
  };

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-40 flex flex-col items-end sm:bottom-5 sm:right-5">
      {isBubbleOpen && (
        <div
          data-testid="guide-bubble"
          className="pointer-events-auto mb-3 w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3 bg-slate-950 px-4 py-3 text-white">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
              <GraduationCap size={18} /> Mr. Atlas
            </span>
            <button
              type="button"
              onClick={() => setIsBubbleOpen(false)}
              aria-label="Minimize guide message"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <Minimize2 size={15} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-base font-extrabold leading-6 text-slate-800">{message}</p>
            <button
              type="button"
              onClick={speak}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-700"
            >
              <Volume2 size={17} /> {isPlaying ? 'Speaking...' : 'Read to me'}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-slate-950 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-950 sm:h-14 sm:w-14"
        onClick={() => setIsBubbleOpen(open => !open)}
        aria-label={isBubbleOpen ? 'Hide guide message' : 'Open guide message'}
        title="Ask Mr. Atlas"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500">
          <GraduationCap size={18} />
        </span>
      </button>
    </div>
  );
};
