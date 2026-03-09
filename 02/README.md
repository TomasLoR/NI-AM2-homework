## Blokující vs. Neblokující CPU úlohy

```bash
ab -n 100 -c 10 http://localhost:8080/<path>
```

### Celkový čas zpracování
- **Neblokující server** dokončil všech **100 požadavků** za **necelých 95 sekund**.
- **Blokující server** potřeboval **přes 481 sekund**, protože zpracovával každý výpočet **striktně jeden po druhém**.

### Stabilita serveru
- U **blokujícího serveru** došlo k **31 selhaným požadavkům** (`Non-2xx responses: 31`) při souběžné zátěži.  
  Nejspíše **timeout při komunikaci se službou `http-job-distributor`**.
- **Neblokující server** naopak **úspěšně zpracoval všech 100 požadavků** 
- ("Failed requests" můžeme ignorovat, protože ab příkaz očekává stejný content length u každé odpovědi, což pro náš task s náhodným generováním max hodonoty CPU bound tasku při každém requestu není reálné splnit -> false-positive)

### Latence
- U **blokující varianty** se fronta požadavků natolik zahltila, že **nejpomalejší požadavek čekal téměř 75 sekund** na odpověď.
- U **neblokující varianty** byla maximální latence pouze **18,5 sekundy**.