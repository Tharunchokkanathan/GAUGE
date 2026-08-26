import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForGaugeApp12345678',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gauge-nutrition.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gauge-nutrition',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gauge-nutrition.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890'
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
