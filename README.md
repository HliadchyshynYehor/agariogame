# Agario2

Jednoduchá multiplayer hra v štýle Agar.io: ovládaš guľu, zbieraš jedlo, rastieš a môžeš naraziť na ostatných hráčov.

## Čo je v hre

* Multiplayer cez WebSocket (viac hráčov naraz)
* Ovládanie: WASD alebo šípky
* Jedlo (Food): spawn na mape, po zjedení zväčšuje veľkosť
* Kolízie hráčov: väčší hráč môže „zjesť“ menšieho
* Kamera sleduje tvojho hráča
* Zobrazenie tvojej veľkosti na obrazovke
* Registrácia hráča pomocou prezývky
* Výber farby hráča pred začiatkom hry
* Ukladanie údajov hráča do databázy
* Tabuľka najlepších hráčov podľa najväčšej veľkosti
* Game Over obrazovka po zjedení hráča
* Farebné jedlo na mape

## Ako otestovať multiplayer

1. Otvor hru v bežnej karte prehliadača
2. Otvor hru v druhej karte v režime Inkognito (alebo v inom prehliadači)

Budú to dve samostatné pripojenia a uvidíš dvoch hráčov.

## Požiadavky

* IntelliJ IDEA
* Maven
* Java 21
* PostgreSQL
* Prehliadač

## Databáza

Projekt používa PostgreSQL databázu.

Pred spustením je potrebné vytvoriť databázu s názvom:

```sql
CREATE DATABASE test;
```

Nastavenie databázy je v súbore `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/test
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

Ak máš v PostgreSQL iné heslo, treba ho zmeniť aj v `application.properties`.

Do databázy sa ukladá:

* prezývka hráča
* najväčšia dosiahnutá veľkosť
* počet odohraných hier

Databáza sa nenahráva na GitHub. Na GitHub sa ukladá iba zdrojový kód projektu. Každý, kto si projekt stiahne a spustí lokálne, potrebuje vlastnú PostgreSQL databázu.

## Spustenie

### 1) IntelliJ IDEA

* Otvor projekt
* Skontroluj, že PostgreSQL je spustený
* Skontroluj, že existuje databáza `test`
* Spusť triedu `Agario2Application`

### 2) Otvorenie klienta

V prehliadači otvor:

```text
http://localhost:8080
```

## Ovládanie

* WASD alebo šípky

## Ako hrať

1. Zadaj prezývku
2. Vyber si farbu hráča
3. Klikni na tlačidlo Start
4. Zbieraj jedlo a zväčšuj sa
5. Väčší hráč môže zjesť menšieho hráča
6. Po zjedení sa zobrazí Game Over obrazovka

## Leaderboard

V hre je tabuľka najlepších hráčov. Zobrazuje hráčov podľa najväčšej dosiahnutej veľkosti.
