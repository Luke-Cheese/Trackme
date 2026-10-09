# Guida: creare un APK senza PowerShell

Questo ZIP contiene il progetto sorgente, non un APK già compilato. La compilazione cloud richiede un account Expo e un repository GitHub collegato a EAS.

1. Crea un account Expo: https://expo.dev/signup
2. Crea un repository GitHub: https://github.com/new
3. Estrai questo ZIP sul PC e carica nel repository tutti i file e le cartelle della cartella `mtb-gps-tracker-pro` (non caricare il solo ZIP).
4. Collega il repository GitHub a Expo/EAS dalla dashboard web seguendo la procedura guidata disponibile nel tuo account.
5. Avvia una build Android con il profilo `preview`: è configurato per produrre un APK installabile.
6. Quando la build termina, scarica l’APK dalla pagina della build e aprilo sul telefono Android.
7. Se Android lo chiede, consenti al browser di installare app da questa origine.

## Avvisi importanti
- Il token Mapbox incluso è pubblico: prima di distribuire l’app, limita il token in Mapbox o crea un token dedicato.
- Gli avvisi `deprecated` di npm non significano necessariamente che la compilazione fallirà. Se EAS segnala `Failed`, serve il log dell’errore.
- Il tracking in background dipende dai permessi Android e dalle impostazioni di risparmio batteria. Prova prima una breve uscita.
