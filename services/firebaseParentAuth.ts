import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
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

export const getParentFamilyId = (uid: string | null | undefined) => (
  uid ? buildFamilyId(uid) : null
);

export const getCurrentParentSession = (): ParentCloudSession => {
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

export const subscribeParentCloudSession = (
  onChange: (session: ParentCloudSession) => void
) => {
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
  const services = getFirebaseServices();
  if (!services) {
    throw new Error('Firebase is not configured for this browser.');
  }

  const credential = await createUserWithEmailAndPassword(
    services.auth,
    email.trim(),
    password
  );
  return credential.user;
};

export const signInParentAccount = async (email: string, password: string) => {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error('Firebase is not configured for this browser.');
  }

  const credential = await signInWithEmailAndPassword(
    services.auth,
    email.trim(),
    password
  );
  return credential.user;
};

export const signOutParentAccount = async () => {
  const services = getFirebaseServices();
  if (!services) {
    return;
  }

  await signOut(services.auth);
};
