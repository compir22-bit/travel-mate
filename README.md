# Australien-Reise-Begleiter

Mobile Web-App (PWA) für unsere Australien-Reise: Tagesplan, Karte und Favoriten in der Nähe.

- **Hosting:** GitHub Pages
- **Login & Daten:** Firebase (Google-Login, Firestore)
- **Karte:** Leaflet + OpenStreetMap

## Lokal starten
`index.html` mit der VS-Code-Erweiterung **Live Server** öffnen (Rechtsklick → „Open with Live Server“).

## Sicherheit
Der Code ist öffentlich, die Daten nicht: Zugriff haben nur Mitglieder der Gästeliste (`members` in Firestore).
Private Dateien (z.B. der Google-Takeout-Export in `import/`) werden durch `.gitignore` ausgeschlossen.
