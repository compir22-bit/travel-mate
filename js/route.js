// Tagesplan: Stationen live aus Firestore anzeigen, hinzufügen, bearbeiten, löschen.
// Texte werden immer mit textContent eingefügt (nie als HTML).
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db } from "./firebase.js";

const $ = (id) => document.getElementById(id);
const stopsRef = collection(db, "stops");

let unsubscribe = null;
let currentUser = null;
let stops = [];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("de-CH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

function stopCard(stop) {
  const card = el("article", "card");
  const head = el("div", "card-head");
  head.append(el("strong", "", (stop.time ? stop.time + " · " : "") + stop.title));
  const edit = el("button", "btn small", "Bearbeiten");
  edit.addEventListener("click", () => openForm(stop));
  head.append(el("span", "spacer"), edit);
  card.append(head);
  if (stop.place) card.append(el("p", "line", "📍 " + stop.place));
  if (stop.accommodation) card.append(el("p", "line", "🛏 " + stop.accommodation));
  if (stop.notes) card.append(el("p", "line muted", stop.notes));
  return card;
}

function render() {
  const list = $("route-list");
  list.replaceChildren();
  $("route-empty").hidden = stops.length > 0;

  const today = todayString();
  let lastDate = null;
  for (const stop of stops) {
    if (stop.date !== lastDate) {
      lastDate = stop.date;
      const heading = el("h3", "day", formatDate(stop.date));
      if (stop.date === today) heading.append(el("span", "badge", "Heute"));
      list.append(heading);
    }
    list.append(stopCard(stop));
  }
}

function setFormError(text) {
  $("stop-error").textContent = text;
  $("stop-error").hidden = !text;
}

function openForm(stop) {
  setFormError("");
  $("stop-id").value = stop ? stop.id : "";
  $("stop-dialog-title").textContent = stop ? "Station bearbeiten" : "Neue Station";
  $("stop-date").value = stop ? stop.date : todayString();
  $("stop-time").value = stop ? stop.time : "";
  $("stop-title").value = stop ? stop.title : "";
  $("stop-place").value = stop ? stop.place : "";
  $("stop-accommodation").value = stop ? stop.accommodation : "";
  $("stop-notes").value = stop ? stop.notes : "";
  $("btn-delete-stop").hidden = !stop;
  $("stop-dialog").showModal();
}

async function saveStop(event) {
  event.preventDefault();
  setFormError("");
  const data = {
    date: $("stop-date").value,
    time: $("stop-time").value,
    title: $("stop-title").value.trim(),
    place: $("stop-place").value.trim(),
    accommodation: $("stop-accommodation").value.trim(),
    notes: $("stop-notes").value.trim(),
    updatedAt: serverTimestamp()
  };
  const id = $("stop-id").value;
  try {
    if (id) {
      await updateDoc(doc(db, "stops", id), data);
    } else {
      await addDoc(stopsRef, { ...data, createdBy: currentUser.email.toLowerCase() });
    }
    $("stop-dialog").close();
  } catch (err) {
    setFormError("Speichern fehlgeschlagen (" + err.code + ").");
  }
}

async function deleteStop() {
  const id = $("stop-id").value;
  if (!id || !confirm("Diese Station wirklich löschen?")) return;
  try {
    await deleteDoc(doc(db, "stops", id));
    $("stop-dialog").close();
  } catch (err) {
    setFormError("Löschen fehlgeschlagen (" + err.code + ").");
  }
}

$("btn-add-stop").addEventListener("click", () => openForm(null));
$("stop-form").addEventListener("submit", saveStop);
$("btn-delete-stop").addEventListener("click", deleteStop);
$("btn-cancel-stop").addEventListener("click", () => $("stop-dialog").close());

export function startRoute(user) {
  currentUser = user;
  stopRoute();
  unsubscribe = onSnapshot(
    query(stopsRef, orderBy("date")),
    (snapshot) => {
      stops = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      stops.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      render();
    },
    (err) => {
      $("route-list").replaceChildren(el("p", "error", "Laden fehlgeschlagen (" + err.code + ")."));
    }
  );
}

export function stopRoute() {
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
  stops = [];
  $("route-list").replaceChildren();
}
