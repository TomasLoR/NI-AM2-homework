# OAuth Browser-Based App

## Popis
Aplikace využívá autorizační server Google OAuth 2.0 k ověření uživatele a získání přístupového tokenu.

## Realizace
- **Frontend (`index.html`, `script.js`):** Implementuje OAuth 2.0 Implicit Flow. Přesměruje uživatele na stránku souhlasu Googlu a po úspěšném přihlášení získá `access_token` z fragmentu URL.
- **Backend (`server.js`):** Jednoduchý HTTP/2 server v Node.js, který obsluhuje statické soubory přes HTTPS. Zároveň funguje jako proxy pro logování – přijímá JSON logy z frontendu přes endpoint `/log` a předává je službě http-log-collector (služba pří testování nebyla vždy dostupná).
