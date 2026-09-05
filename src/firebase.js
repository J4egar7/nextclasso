import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDOsb4e7Uc1Co0ddG-xReFmSRUv4rkdkuI",
  authDomain: "classo-1.firebaseapp.com",
  projectId: "classo-1",
  storageBucket: "classo-1.firebasestorage.app",
  messagingSenderId: "926225999366",
  appId: "1:926225999366:web:41926af19f105a68a24587"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);