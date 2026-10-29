// Start der App: Anzeige je nach Anmeldestatus und Tab-Navigation.
import { watchAuth, login, logout } from "./auth.js";

const $ = (id) => document.getElementById(id);
const screens = ["loading", "login", "denied", "app"];

function showScreen(name) {
  for (const s of screens) $("screen-" + s).hidden = s !== name;
}

function showTab(name) {
  for (const tab of document.querySelectorAll(".tab")) {
    const active = tab.dataset.tab === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-current", active ? "page" : "false");
    $("view-" + tab.dataset.tab).hidden = !active;
  }
}

function setError(text) {
  $("login-error").textContent = text;
  $("login-error").hidden = !text;
}

$("btn-login").addEventListener("click", async () => {
  setError("");
  try {
    await login();
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
      setError("Anmeldung fehlgeschlagen (" + err.code + ").");
    }
  }
});

for (const id of ["btn-logout", "btn-logout-denied"]) {
  $(id).addEventListener("click", () => logout());
}

for (const tab of document.querySelectorAll(".tab")) {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
}

watchAuth((state, user) => {
  if (state === "out") return showScreen("login");
  if (state === "denied") {
    $("denied-email").textContent = user.email || "";
    return showScreen("denied");
  }
  $("user-name").textContent = user.displayName || user.email;
  showTab("route");
  showScreen("app");
});
