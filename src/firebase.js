// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBdK2rxXVoppvMOknCN9pTShWhO_0kxx0",
  authDomain: "finalwop.firebaseapp.com",
  projectId: "finalwop",
  storageBucket: "finalwop.firebasestorage.app",
  messagingSenderId: "422478407156",
  appId: "1:422478407156:web:59bc4f3665554e8811c5a1"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Email login
export const loginEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// Google login
export const loginGoogle = () =>
  signInWithPopup(auth, googleProvider);

// Fetch role from Firestore
export const getUserRole = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().role;
};
