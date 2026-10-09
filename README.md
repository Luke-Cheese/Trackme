# MTB GPS Tracker Pro
Versione Android + iPhone con Mapbox, tracking background, dashboard MTB, D+, velocità media/max, auto-pausa, GPX e riepilogo attività.

## Avvio
1. Installa Node.js.
2. `npm install`
3. `npx expo prebuild`
4. Android: `npx expo run:android`
5. iOS: `npx expo run:ios` (richiede macOS/Xcode)
6. Per store: `eas build --platform android` e `eas build --platform ios`.

Il token Mapbox è già configurato nel file `.env`. Per sicurezza, prima della pubblicazione imposta restrizioni sul token e valuta di rigenerarlo se è stato condiviso pubblicamente.

## Nota background
Il sistema usa il foreground service su Android e il background location mode su iOS. I sistemi operativi possono limitare il tracking se l'utente forza la chiusura dell'app o applica restrizioni energetiche.
