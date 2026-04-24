import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaK-kkNMtlkAoOqPZVRCXCoTJAz9ABlnA",
  authDomain: "apkatszaliczenie.firebaseapp.com",
  projectId: "apkatszaliczenie",
  storageBucket: "apkatszaliczenie.firebasestorage.app",
  messagingSenderId: "286991563537",
  appId: "1:286991563537:web:88c014a93f946f40982ab0",
  measurementId: "G-LBRB6ST1J1",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
