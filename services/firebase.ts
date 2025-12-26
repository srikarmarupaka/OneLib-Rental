import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBehlFV6EegMNuqovpaVmC9_3JYqAq82TA",
  authDomain: "onelib-7a67e.firebaseapp.com",
  projectId: "onelib-7a67e",
  storageBucket: "onelib-7a67e.firebasestorage.app",
  messagingSenderId: "1042738538",
  appId: "1:1042738538:web:744d139a1dff413ab68913",
  measurementId: "G-6KTKM54612"
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