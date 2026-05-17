import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, X } from 'lucide-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isAppleMobile = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export const InstallAppButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showInstallTip, setShowInstallTip] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    setReady(true);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowInstallTip(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!ready || installed) {
    return null;
  }

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstallTip(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setInstallPrompt(null);
  };

  return (
    <div className={`relative z-[80] ${className}`}>
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 bg-white/92 px-5 py-3 text-sm font-black text-sky-800 shadow-xl backdrop-blur hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/70"
      >
        <Download size={18} />
        Install App
      </button>

      {showInstallTip && (
        <div className="absolute left-1/2 top-full z-[90] mt-3 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-sky-100 bg-white p-4 text-left text-sm font-bold text-slate-700 shadow-2xl">
          <button
            type="button"
            onClick={() => setShowInstallTip(false)}
            className="absolute right-2 top-2 rounded-full p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close install tip"
          >
            <X size={16} />
          </button>
          <div className="mb-2 flex items-center gap-2 text-sky-700">
            <CheckCircle2 size={18} />
            {isAppleMobile() ? 'Add to Home Screen' : 'Install from Browser'}
          </div>
          <div className="space-y-2 pr-4 leading-5">
            <p>iPhone or iPad: open Safari Share, then choose Add to Home Screen.</p>
            <p>Android: open Chrome menu, then choose Install app or Add to Home screen.</p>
          </div>
        </div>
      )}
    </div>
  );
};
