// Uhr: Datum/Uhrzeit in der Zeitzone des Geräts (also dort, wo wir gerade sind) und die Uhrzeit in Zürich.
// Das Handy stellt seine Zeitzone unterwegs selbst um, wir lesen sie nur aus.
const $ = (id) => document.getElementById(id);
const HOME_ZONE = "Europe/Zurich";

function cityName(zone) {
  if (zone === HOME_ZONE) return "Zürich";
  return zone.split("/").pop().replace(/_/g, " ");
}

// Abweichung einer Zeitzone von UTC in Minuten (inkl. Sommerzeit) zum Zeitpunkt `date`.
function zoneOffsetMinutes(date, zone) {
  const p = {};
  for (const part of new Intl.DateTimeFormat("en-US", {
    timeZone: zone, hourCycle: "h23",
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric"
  }).formatToParts(date)) p[part.type] = Number(part.value);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000;
}

function offsetText(localZone, now) {
  const diff = zoneOffsetMinutes(now, localZone) - zoneOffsetMinutes(now, HOME_ZONE);
  if (diff === 0) return "Gleiche Zeit wie zu Hause";
  const hours = Math.abs(diff) / 60;
  const label = (Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(".", ",")) + " h";
  return diff > 0 ? `Hier ${label} später als zu Hause` : `Hier ${label} früher als zu Hause`;
}

function setText(id, text) {
  const node = $(id);
  if (node.textContent !== text) node.textContent = text;
}

function tick() {
  const now = new Date();
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || HOME_ZONE;
  const time = { hour: "2-digit", minute: "2-digit" };

  setText("clock-local-city", "Hier · " + cityName(localZone));
  setText("clock-local-time", now.toLocaleTimeString("de-CH", time));
  setText("clock-local-date", now.toLocaleDateString("de-CH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }));

  setText("clock-home-time", now.toLocaleTimeString("de-CH", { ...time, timeZone: HOME_ZONE }));
  setText("clock-home-date", now.toLocaleDateString("de-CH", {
    weekday: "short", day: "numeric", month: "short", timeZone: HOME_ZONE
  }));
  setText("clock-offset", offsetText(localZone, now));
}

tick();
setInterval(tick, 1000);
