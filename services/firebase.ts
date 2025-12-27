import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  // measurementId removed to prevent net::ERR_BLOCKED_BY_CLIENT from ad-blockers
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Mock Login function for simulation (since we don't have backend users set up yet)
export const mockLibrarianLogin = async (email: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'lib_admin_01',
        email,
        role: 'librarian',
        name: 'Head Librarian',
        employeeId: 'EMP-001',
        memberSince: new Date().toISOString(),
        rentedBooks: [],
        downloadedBooks: [],
        wishlist: []
      });
    }, 1000);
  });
};