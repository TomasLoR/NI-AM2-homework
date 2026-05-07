## JWT Authentication and RBAC with Asymmetric Keys

### 1. Auth server
- **Soubor:** `src/auth-server.js`
- slouží jako autentizační autorita. Přijímá přihlašovací údaje uživatelů a vystavuje JWT tokeny.
- používá **privátní klíč** (`keys/private.key`) k podepisování nově vydaných tokenů.
- **Endpointy:**
  - `POST /auth/login` - Ověří uživatele a vrátí krátkodobý *Access token* a dlouhodobý *Refresh token*.
  - `POST /auth/refresh` - Přijme platný *Refresh token* a vystaví nový *Access token*.

### 2. Resource Server (API)
- **Soubor:** `src/resource-server.js`
- poskytuje data uživatelům s platným tokenem a odpovídajícím oprávněním.
- používá pouze **veřejný klíč** (`keys/public.key`) k ověření pravosti tokenu podepsaného Auth Serverem.
- **Endpointy:**
  - `GET /data/any` - Zpřístupní data pouze rolím, které mají oprávnění `read:any`.
  - `GET /data/own` - Zpřístupní data rolím, které mají oprávnění `read:own` nebo `read:any`.

### 3. Sdílená logika a logování
- **Soubor:** `src/common.js`
- obsahuje sdílenou konstantu `ISSUER` a funkci `logAction()` pro logging.

### 4. Konfigurace oprávnění (RBAC)
- **Soubor:** `src/roles.json`
- Řízení přístupu se spravuje přes externí JSON soubor. Namapování rolí na konkrétní akce umožňuje úpravu oprávnění bez nutnosti zásahu do kódu aplikace.
