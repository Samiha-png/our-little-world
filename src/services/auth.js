/* =========================================================================
   AUTH — real Firebase Authentication (email + password).
   Ported 1:1 from js/auth.js. No hardcoded identities; the signed-in UID
   is the only source of "who is using the app right now".
   ========================================================================= */
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export function currentUid() {
  return auth.currentUser ? auth.currentUser.uid : null;
}

export async function signUp(email, password, displayName) {
  email = email.trim().toLowerCase();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: displayName || email.split("@")[0] });

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    displayName: displayName || email.split("@")[0],
    spaceId: null,
    createdAt: serverTimestamp()
  });

  return cred.user;
}

export async function logIn(email, password) {
  email = email.trim().toLowerCase();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOutUser() {
  await fbSignOut(auth);
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export function listenUserDoc(uid, callback) {
  return onSnapshot(doc(db, "users", uid), (snap) => callback(snap.exists() ? snap.data() : null));
}

export async function setUserSettings(uid, settings) {
  return setDoc(doc(db, "users", uid), { settings, updatedAt: serverTimestamp() }, { merge: true });
}

export function friendlyAuthError(err) {
  const code = (err && err.code) || "";
  const map = {
    "auth/email-already-in-use": "That email already has an account — try logging in instead.",
    "auth/invalid-email": "That email doesn't look right.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Wrong password.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/too-many-requests": "Too many attempts — please wait a moment and try again."
  };
  return map[code] || (err && err.message) || "Something went wrong. Please try again.";
}
