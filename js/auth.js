// Google-Login und Prüfung der Gästeliste (Collection "members").
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { auth, db } from "./firebase.js";

export function login() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function logout() {
  return signOut(auth);
}

// Die Gästeliste liegt in Firestore: members/<e-mail-adresse>.
// Die Regeln erlauben jedem angemeldeten Konto nur, sein eigenes Dokument abzufragen.
async function isMember(user) {
  if (!user.email || !user.emailVerified) return false;
  try {
    const snap = await getDoc(doc(db, "members", user.email.toLowerCase()));
    return snap.exists();
  } catch (err) {
    console.warn("Mitgliederprüfung fehlgeschlagen:", err.code);
    return false;
  }
}

// state: "out" (nicht angemeldet) | "denied" (angemeldet, aber nicht auf der Gästeliste) | "member"
export function watchAuth(onChange) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return onChange("out", null);
    onChange((await isMember(user)) ? "member" : "denied", user);
  });
}
