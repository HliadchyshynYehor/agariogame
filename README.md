Jednoduchá multiplayer hra v štýle Agar.io: ovládaš guľu, zbieraš jedlo, rastieš a môžeš naraziť na ostatných hráčov.

Čo je v hre
- Multiplayer cez WebSocket (viac hráčov naraz)
- Ovládanie: WASD alebo šípky
- Jedlo (Food): spawn na mape, po zjedení zväčšuje veľkosť
- Kolízie hráčov: väčší hráč môže „zjesť“ menšieho
- Kamera sleduje tvojho hráča
- Zobrazenie tvojej veľkosti na obrazovke

Ako otestovať multiplayer
1. Otvor hru v bežnej karte prehliadača
2. Otvor hru v druhej karte v režime Inkognito (alebo v inom prehliadači)

Budú to dve samostatné pripojenia a uvidíš dvoch hráčov.

Požiadavky
- Maven alebo Maven Wrapper (ak je v projekte mvnw)
- Prehliadač

Spustenie

1) Spustenie servera (Spring Boot)

Ak používaš Maven Wrapper:
./mvnw spring-boot:run

Ak používaš Maven:
mvn spring-boot:run

Alternatíva cez IntelliJ IDEA:
- Otvor projekt
- Spusť triedu Agario2Application

2) Otvorenie klienta
V prehliadači otvor:
http://localhost:8080/index.html

Ovládanie
- WASD alebo šípky
