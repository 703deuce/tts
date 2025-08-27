import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASdf98Soi-LtMowVOQMhQvMWWVEP3KoC8",
  authDomain: "aitts-d4c6d.firebaseapp.com",
  projectId: "aitts-d4c6d",
  storageBucket: "aitts-d4c6d.firebasestorage.app",
  messagingSenderId: "927299361889",
  appId: "1:927299361889:web:13408945d50bda7a2f5e20",
  measurementId: "G-P1TK2HHBXR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
