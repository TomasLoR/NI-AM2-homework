# Služba stahování dat

Jednoduchá aplikace klient-server demonstrující dva různé přístupy ke stahování velkých souborů: **XHR** a **Fetch API**

## Jak to funguje

### Server (`server.js`)
- **Node.js HTTP Server** běžící na portu 8080
- **Dvě hlavní cesty:**
  1. `/data/{size}` - Předává požadavky externí službě generující data
  2. Obsluha statických souborů - HTML, CSS a JavaScript

### Frontend (`index.html`, `script.js`, `style.css`)
- **HTML a CSS**: Jednoduché rozhraní se dvěma tlačítky (XHR a Fetch), uživatel může zadat velikost souboru a rozhraní ukazuje stav a progres bar stahování
- **JavaScript**: Dvě implementace pro stahování souborů:
  - **XHR metoda**: Používá XMLHttpRequest s přechody readyState a event progress
    - Progres bar se vytváří v `updateProgress()` funkci
     - počet `=` znaků odpovídá procent stahování v rozmezí 20 znaků
  - **Fetch metoda**: Používá modernější Fetch API.
    - Ačkoliv Fetch API nemá vestavěné readyState jako XHR, sledujeme stavy manuálně:
      - **"loading"** - Iniciálně nastaveno při zahájení fetch requestu
      - **"loaded"** - Nastaveno po obdržení response z serveru
      - **"downloading"** - Nastaveno po spuštění čtení streamu přes `response.body.getReader()`
      - **"finished downloading"** - Nastaveno po přečtení všech dat ze streamu
    - Pokrok se počítá na základě `Content-Length` headeru a počtu přečtených bajtů za pomoci `reader.read()`
    - Progres bar se vytváří stejně jako u XHR -> vizuální reprezentace pomocí vypočítaného procenta stahování

## Spuštění

```bash
cd src
node server.js
```
