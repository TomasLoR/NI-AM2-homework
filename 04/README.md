# WebSocket Proxy a Chat Klient

## Struktura souborů

- `src/server.js` - Node.js server, který poskytuje statické soubory přes HTTP a zároveň běží jako WebSocket proxy.
- `src/index.html` - Hlavní stránka chatovacího rozhraní klienta.
- `src/style.css` - Vizuální úprava chatu.
- `src/script.js` - Klientská logika pro připojení k WebSocket proxy serveru, odesílání a zobrazování zpráv.

## Jak to funguje
- **Frontend (Klient)** je poskytován přes HTTP na portu 8080. Z klientského [src/script.js](petert13/04/src/script.js) se pak inicializuje WebSocket spojení zpět na běžící proxy server.
- **Backend (Proxy)** přijme spojení, založí vlastní spojení k `ws://ws-chat-service` a veškerou komunikaci obousměrně přeposílá.