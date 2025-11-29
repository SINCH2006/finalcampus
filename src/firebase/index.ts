import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { firebaseConfig } from "./config";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// FIX: force popup to avoid "cancelled-popup-request"
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export const firestore = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
