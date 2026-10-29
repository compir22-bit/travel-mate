// Firebase-Konfiguration. Diese Werte sind öffentlich und kein Geheimnis:
// Der Schutz der Daten kommt von den Firestore-Regeln (firestore.rules).
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVhVUvMaaN0hmDBSgRkmSqUqKphYiuncA",
  authDomain: "travel-mate-6e946.firebaseapp.com",
  projectId: "travel-mate-6e946",
  storageBucket: "travel-mate-6e946.firebasestorage.app",
  messagingSenderId: "776772650239",
  appId: "1:776772650239:web:12aa9fb2c43679d78038ca"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
