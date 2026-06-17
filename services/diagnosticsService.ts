export type DiagnosticSeverity = 'info' | 'warn' | 'error';

export interface DiagnosticEvent {
  id: string;
  createdAt: string;
  severity: DiagnosticSeverity;
  area: string;
  message: string;
  detail?: string;
  url?: string;
  appVersion: string;
}

const DIAGNOSTICS_KEY = 'kidGeniusDiagnostics';
const MAX_DIAGNOSTIC_EVENTS = 80;
const APP_VERSION = 'kid-genius-world-web';

const redactSensitiveText = (value: string) => value
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
  .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[number]')
  .slice(0, 700);

const readStoredDiagnostics = (): DiagnosticEvent[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(DIAGNOSTICS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_DIAGNOSTIC_EVENTS) : [];
  } catch {
    return [];
  }
};

const writeStoredDiagnostics = (events: DiagnosticEvent[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DIAGNOSTICS_KEY, JSON.stringify(events.slice(0, MAX_DIAGNOSTIC_EVENTS)));
  } catch {
    // Diagnostics should never break the child app.
  }
};

export const logDiagnosticEvent = (
  severity: DiagnosticSeverity,
  area: string,
  message: string,
  detail?: unknown
) => {
  const event: DiagnosticEvent = {
    id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    severity,
    area: redactSensitiveText(area),
    message: redactSensitiveText(message),
    detail: detail ? redactSensitiveText(detail instanceof Error ? detail.message : String(detail)) : undefined,
    url: typeof window !== 'undefined' ? window.location.pathname : undefined,
    appVersion: APP_VERSION,
  };

  writeStoredDiagnostics([event, ...readStoredDiagnostics()]);
  return event;
};

export const getDiagnosticEvents = () => readStoredDiagnostics();

export const clearDiagnosticEvents = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DIAGNOSTICS_KEY);
};

export const exportDiagnosticEvents = () => {
  const events = getDiagnosticEvents();
  const exportData = {
    exportedAt: new Date().toISOString(),
    app: 'Kid Genius World',
    version: APP_VERSION,
    note: 'Parent diagnostics export. This contains technical app events only and redacts emails/numbers where detected.',
    events,
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `kid-genius-diagnostics-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
