import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC83m577b7Lw6LJn0NwUSdWl4ncqlxgcTc",
  authDomain: "dvc-ctps.firebaseapp.com",
  projectId: "dvc-ctps",
  storageBucket: "dvc-ctps.firebasestorage.app",
  messagingSenderId: "659349146426",
  appId: "1:659349146426:web:34186899dd2d3f53a3de03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); 