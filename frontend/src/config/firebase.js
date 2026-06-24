import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Note: We're using Cloudinary for storage, not Firebase Storage

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAKkn61BdC_Ezra_kGDqecA31gWz1PbTxw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "tcet-capture.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "tcet-capture",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "tcet-capture.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "472670570755",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:472670570755:web:e42d69213e7ea420dac136",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-KFJTH3ZCBY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Storage is handled by Cloudinary, not Firebase Storage
export default app;

