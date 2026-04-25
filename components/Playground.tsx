import React from 'react';

interface PlaygroundProps {
  onBack: () => void;
  onReward: () => void;
}

export const Playground: React.FC<PlaygroundProps> = ({ onBack }) => (
  <div className="w-full h-full bg-slate-50 flex items-center justify-center p-6">
    <div className="max-w-md rounded-2xl bg-white p-6 shadow text-center">
      <h1 className="text-2xl font-black text-slate-900 mb-2">Playground Retired</h1>
      <p className="text-sm text-slate-600 mb-4">
        The Playground room has been removed from the launch app so the experience stays focused on learning rooms, stories, and parent-trusted progress.
      </p>
      <button
        onClick={onBack}
        className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
      >
        Back to Learning
      </button>
    </div>
  </div>
);
