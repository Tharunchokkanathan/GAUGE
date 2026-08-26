import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key-gauge-nutrition',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gauge-nutrition.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gauge-nutrition',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gauge-nutrition.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:gauge123456'
};

// Initialize Firebase safely
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);

export { app, auth, db, isFirebaseConfigured };
