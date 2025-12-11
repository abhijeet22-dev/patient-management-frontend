// --- FIREBASE DISABLED FOR TESTING BUILD ---
// This file is currently a placeholder to ensure the app runs offline without API keys.
// In a real production deployment, uncomment the code below and add environment variables.

/*
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
*/

// Mock exports to prevent runtime errors if imported
export const auth = {
  signOut: async () => {
    localStorage.removeItem('medicare_auth');
    return Promise.resolve();
  }
};

export const db = {};