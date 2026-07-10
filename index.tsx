import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('qaAcademy') === '1') {
  const now = Date.now();
  const familyId = 'family-academy-design-audit';
  const childId = 'academy-audit-student';

  window.localStorage.setItem('kidGeniusTestParentSession', JSON.stringify({
    uid: 'academy-design-audit-parent',
    email: 'academy-audit@kidgenius.test',
    familyId,
  }));
  window.localStorage.setItem('kidGeniusDevAccessOverride', 'true');
  window.localStorage.setItem(`kidGeniusParentOnboarded:${familyId}`, 'true');
  window.localStorage.setItem(`kidGeniusParentPin:${familyId}`, '2468');
  window.localStorage.setItem(`kidGeniusProfiles:${familyId}`, JSON.stringify([
    {
      id: childId,
      name: 'Avery',
      grade: '1st Grade',
      createdAt: now - 86_400_000,
      lastActiveAt: now,
    },
  ]));
  window.localStorage.setItem(`kidGeniusActiveProfileId:${familyId}`, childId);
  window.localStorage.setItem(`kidGeniusProgress:${familyId}:${childId}`, JSON.stringify({
    childName: 'Avery',
    currentGrade: '1st Grade',
    currentLevel: 3,
    totalXP: 360,
    stickers: [],
    achievements: [],
  }));
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <App />
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Kid Genius World install support could not start.', error);
    });
  });
}
