// Einmaliger Import des Reiseplans aus import/stops.json (liegt nur lokal, nicht auf GitHub).
// Schreibt mit dem Login des angemeldeten Mitglieds; die Firestore-Regeln prüfen jedes Dokument.
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db } from "./firebase.js";
import { watchAuth, login } from "./auth.js";

const $ = (id) => document.getElementById(id);
let stops = [];
let currentUser = null;

function row(text, className) {
  const p = document.createElement("p");
  p.className = className || "line";
  p.textContent = text;
  return p;
}

async function loadFile() {
  try {
    const res = await fetch("import/stops.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    stops = await res.json();
  } catch (err) {
    $("status").textContent = "import/stops.json nicht gefunden (" + err.message + "). Diese Seite funktioniert nur lokal.";
    return;
  }
  $("status").textContent = "Angemeldet als " + currentUser.email;
  const flights = stops.filter((s) => s.flight).length;
  $("summary").textContent = `${stops.length} Tage, davon ${flights} mit Flug.`;
  const list = $("list");
  list.replaceChildren();
  for (const s of stops) {
    const flight = s.flight ? ` ✈ ${s.flight.airline}, am Flughafen ${s.flight.atAirport}` : "";
    list.append(row(`${s.date}  ${s.time}  ${s.title}${flight}`));
  }
  $("preview").hidden = false;
}

async function runImport() {
  $("btn-import").disabled = true;
  let created = 0, skipped = 0, failed = 0;
  for (const s of stops) {
    $("result").textContent = `Importiere … ${created + skipped + failed}/${stops.length}`;
    try {
      const ref = doc(db, "stops", s.id);
      if ((await getDoc(ref)).exists()) { skipped++; continue; }
      const { id, ...fields } = s;
      await setDoc(ref, { ...fields, createdBy: currentUser.email.toLowerCase(), updatedAt: serverTimestamp() });
      created++;
    } catch (err) {
      failed++;
      console.warn(s.id, err.code);
    }
  }
  $("result").textContent = `Fertig: ${created} neu angelegt, ${skipped} schon vorhanden, ${failed} fehlgeschlagen.`;
}

$("btn-login").addEventListener("click", () => login());
$("btn-import").addEventListener("click", runImport);

watchAuth((state, user) => {
  $("btn-login").hidden = state !== "out";
  $("preview").hidden = true;
  if (state === "out") { $("status").textContent = "Bitte anmelden."; return; }
  if (state === "denied") { $("status").textContent = "Dieses Konto steht nicht auf der Gästeliste."; return; }
  currentUser = user;
  loadFile();
});
