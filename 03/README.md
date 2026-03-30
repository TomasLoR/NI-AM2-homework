# SSE server

## Implementace

Skládá se ze dvou částí:

### 1. Server (`src/server.js`)
- Běží na portu `8080`.
- Zpracovává dvě cesty (routes):
  - `/`: Server přečte a vrátí soubor `index.html`.
  - `/events`: Otevře trvalé SSE spojení (nastaví hlavičky `Content-Type: text/event-stream` a `Connection: keep-alive`). Následně každé **2 sekundy** provede HTTP GET požadavek na textový generátor (`http://http-data-generator/10`) a příchozí data posílá klientovi ve formátu zpráv `data: <text>\n\n`.
  - Pokud se klient odpojí, interval časovače je zrušen, aby se zabránilo zbytečnému zatěžování paměti.

### 2. Klient (`src/index.html`)
- V JavaScriptu využívá vestavěné rozhraní prohlížeče `EventSource` k připojení na `/events`.
- Při obdržení každé zprávy klient připojí nový element `<div>` s textem zprávy a momentálním časem.
