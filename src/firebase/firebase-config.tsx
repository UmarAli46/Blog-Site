import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCX9RfdFlTG4hkYvttfFgr-J7-8D6gmHZg",
  authDomain: "mystore-88e2b.firebaseapp.com",
  projectId: "mystore-88e2b",
  storageBucket: "mystore-88e2b.firebasestorage.app",
  messagingSenderId: "101042058598",
  appId: "1:101042058598:web:508a9038d28baa88ee44a7",
  measurementId: "G-EZKDST7NRE",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const user = auth.currentUser;
