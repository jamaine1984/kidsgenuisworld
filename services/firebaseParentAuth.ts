import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirebaseServices } from './firebaseClient';

export interface ParentCloudSession {
  configured: boolean;
  signedIn: boolean;
  uid: string | null;
  email: string | null;
  familyId: string | null;
}

const buildFamilyId = (uid: string) => `family-${uid}`;
const TEST_PARENT_SESSION_KEY = 'kidGeniusTestParentSession';

const preparePersistentAuth = async () => {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error('Firebase is not configured for this browser.');
  }

  // A family should stay signed in on its own device until the parent chooses
  // Log out. Firebase owns that persisted session; profile data stays scoped
  // to the authenticated parent's family id.
  await setPersistence(services.auth, browserLocalPersistence);
  return services;
};

const getTestParentSession = (): ParentCloudSession | null => {
  if (!import.meta.env.DEV) return null;
  try {
    const saved = window.localStorage.getItem(TEST_PARENT_SESSION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Partial<ParentCloudSession>;
    if (!parsed.uid || !parsed.email) return null;
    return {
      configured: true,
      signedIn: true,
      uid: parsed.uid,
      email: parsed.email,
      familyId: parsed.familyId || buildFamilyId(parsed.uid),
    };
  } catch {
    return null;
  }
};

export const getParentFamilyId = (uid: string | null | undefined) => (
  uid ? buildFamilyId(uid) : null
);

export const getCurrentParentSession = (): ParentCloudSession => {
  const testSession = getTestParentSession();
  if (testSession) return testSession;
  const services = getFirebaseServices();
  const user = services?.auth.currentUser || null;
  return {
    configured: Boolean(services),
    signedIn: Boolean(user),
    uid: user?.uid || null,
    email: user?.email || null,
    familyId: getParentFamilyId(user?.uid),
  };
};

export const getCurrentParentIdToken = async () => {
  const services = getFirebaseServices();
  const user = services?.auth.currentUser || null;
  if (!user) {
    throw new Error('Sign in with a parent account before opening billing.');
  }

  return user.getIdToken();
};

export const subscribeParentCloudSession = (
  onChange: (session: ParentCloudSession) => void
) => {
  const testSession = getTestParentSession();
  if (testSession) {
    onChange(testSession);
    return () => undefined;
  }

  const services = getFirebaseServices();
  if (!services) {
    onChange({
      configured: false,
      signedIn: false,
      uid: null,
      email: null,
      familyId: null,
    });
    return () => undefined;
  }

  // Migrate an already-open parent session as well as new sign-ins. This keeps
  // a family signed in after closing and reopening the same browser or tablet.
  void setPersistence(services.auth, browserLocalPersistence).catch(() => undefined);

  return onAuthStateChanged(services.auth, (user: User | null) => {
    onChange({
      configured: true,
      signedIn: Boolean(user),
      uid: user?.uid || null,
      email: user?.email || null,
      familyId: getParentFamilyId(user?.uid),
    });
  });
};

export const createParentAccount = async (email: string, password: string) => {
  const services = await preparePersistentAuth();

  const credential = await createUserWithEmailAndPassword(
    services.auth,
    email.trim(),
    password
  );
  return credential.user;
};

export const signInParentAccount = async (email: string, password: string) => {
  const services = await preparePersistentAuth();

  const credential = await signInWithEmailAndPassword(
    services.auth,
    email.trim(),
    password
  );
  return credential.user;
};

export const signInParentWithGoogle = async () => {
  const services = await preparePersistentAuth();

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const credential = await signInWithPopup(services.auth, provider);
  return credential.user;
};

export const signOutParentAccount = async () => {
  if (import.meta.env.DEV) {
    window.localStorage.removeItem(TEST_PARENT_SESSION_KEY);
  }
  const services = getFirebaseServices();
  if (!services) {
    return;
  }

  await signOut(services.auth);
};
