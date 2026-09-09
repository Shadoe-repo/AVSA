import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyKeyForEvaluationASVA2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "asva-emergency-net.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "asva-emergency-net",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "asva-emergency-net.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcdef123456"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyDemoDummyKeyForEvaluationASVA2026"
);

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase initialization warning (running in robust offline-first mode):", error);
}

export { app, db, auth };
