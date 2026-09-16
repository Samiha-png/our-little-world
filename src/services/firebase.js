/* =========================================================================
   FIREBASE INIT — single source of truth for app/auth/db/storage instances.
   Ported from js/firebase-init.js. SAME project (our-little-space-6f128),
   just imported from the npm "firebase" package instead of the gstatic CDN
   so it works with Vite's bundler/dev server.
   ========================================================================= */
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDDl5W8V582C1LBLdXrhO4J8hBpaSIxP1A",
  authDomain: "our-little-space-6f128.firebaseapp.com",
  projectId: "our-little-space-6f128",
  storageBucket: "our-little-space-6f128.firebasestorage.app",
  messagingSenderId: "380778121059",
  appId: "1:380778121059:web:6970e03feaa38819f0b556",
  measurementId: "G-R76FZ0NQDX"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence).catch(() => {});

enableIndexedDbPersistence(db).catch(() => {
  // Multiple tabs open, or unsupported browser — app still works,
  // just without offline cache.
});
