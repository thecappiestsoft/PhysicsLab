# Architektura PhysicsLab

## Przegląd

```
index.html ──► core/*.js ──► i18n/*.js ──► sims/**/*.js ──► core/app.js (boot)
                 │                             │
                 │   sim({...}) rejestruje ────┘
                 ▼
        SIMS[] / simById{}  (registry.js)
                 │
   location.hash ─► route() (views.js) ─► viewHome | viewSim(sim) | viewLab
                                              │
                                              ▼
                                engine.js: resetSim → loop(requestAnimationFrame)
                                   ├─ sim.step(s, p, h)   × n kroków (stały krok h)
                                   ├─ sample()            → s.hist  → wykres
                                   ├─ sim.draw(ctx, …)    → scena
                                   └─ sim.read(s, p)      → odczyty → „Zapisz pomiar” → tabela/CSV
```

## Moduły rdzenia

| Plik | Odpowiedzialność | Najważniejsze nazwy |
| --- | --- | --- |
| `storage.js` | `localStorage` z obsługą błędów (sandbox, tryb prywatny) | `store.get/set` |
| `i18n.js` | język i teksty | `lang`, `L()`, `tr()`, `t()`, `UI` |
| `registry.js` | działy, ikony, rejestracja symulacji | `SECTIONS`, `ICONS`, `SIMS`, `simById`, `sim()` |
| `theme.js` | motyw, paleta dla canvasu, przełączanie języka | `theme`, `C`, `readColors()`, `setTheme()`, `setLang()` |
| `format.js` | liczby i drobna matematyka | `fmt()`, `clamp`, `lerp`, `DEG` |
| `draw.js` | prymitywy 2D, skalowanie HiDPI | `fitCanvas`, `arrow`, `text`, `bars`, `ruler`… |
| `chart.js` | wykres liniowy/punktowy z automatyczną skalą | `drawChart(canvas, spec)` |
| `engine.js` | pętla czasu, pomiary, eksport | `E`, `resetSim`, `loop`, `record`, `csvOf`, `download` |
| `views.js` | generowanie HTML widoków, panel parametrów, routing | `route`, `viewSim`, `setParam`, `sideTab` |
| `app.js` | podpięcie zdarzeń i start | `boot()` |

## Stan

- **`E`** (engine.js) — jedna aktywna symulacja: `E.sim` (definicja), `E.p` (parametry), `E.s` (stan), `E.run`, `E.speed`, `E.stageH`.
- **`s`** — stan fizyczny tworzony przez `init`; `s.t` (czas) i `s.hist` (próbki do wykresu) zarządza rdzeń.
- **`p`** — wartości parametrów; zapisywane per symulacja (`physicslab.p.<id>`).
- **`MEAS`**, **`NOTES`** — pomiary i notatki ucznia (`physicslab.meas`, `physicslab.notes`).

## Czas i całkowanie

`loop()` mierzy rzeczywisty czas klatki (maks. 50 ms), mnoży przez tempo (×0,1 … ×4) i wykonuje tyle stałych kroków `h = sim.dt`, ile się mieści. Dzięki stałemu krokowi wyniki nie zależą od szybkości komputera. Modele z rozwiązaniem analitycznym (ruch jednostajnie zmienny, rzuty) liczą położenie wprost ze wzoru; pozostałe całkują numerycznie (Euler półjawny lub RK4 dla wahadła).

## Rysowanie

- Scena i wykres to `<canvas>` skalowany przez `fitCanvas()` do `devicePixelRatio` (ostry obraz na ekranach Retina i tablicach 4K).
- Kolory pochodzą z CSS (`tokens.css`) — zmiana motywu wywołuje `readColors()` i przerysowanie.
- Odczyty i wykres odświeżają się co ~110 ms (`throttle`), scena w każdej klatce.

## Routing

Bieżący widok trzyma zmienna `ROUTE`, a przejścia wykonuje `go(nazwa)` (`home`, `lab` albo id symulacji). Linki w interfejsie to elementy z atrybutem `data-go="…"` **bez `href`** — Google Sites i podobne serwisy przechwytują kliknięcia w zwykłe linki w osadzonym kodzie, więc nawigacja przez `href="#…"` tam nie działa. Adres `#nazwa` jest aktualizowany tylko pomocniczo (link bezpośredni, przycisk Wstecz), jeśli przeglądarka na to pozwala. Przy dodawaniu nowych linków wewnętrznych używaj `data-go`.

## Eksport plików

`download()` próbuje kolejno: zdolności `downloads` platformy (gdy strona działa jako opublikowany artefakt), zwykłego pobrania przez `Blob`, a w razie odmowy kopiuje CSV do schowka. Separator CSV: `;` po polsku (Excel PL), `,` po angielsku.

## Build

`tools/build.mjs` czyta `index.html`, zastępuje każdy `<link rel="stylesheet">` i `<script src>` zawartością pliku (w tej samej kolejności) i zapisuje `dist/PhysicsLab.html`. Brak transpilacji — kod musi działać w nowoczesnych przeglądarkach (ES2020, `roundRect` ma fallback).

## Rozszerzenia przewidziane w projekcie (etapy 2–3)

| Funkcja | Gdzie zacząć |
| --- | --- |
| Konta, klasy, panel nauczyciela | backend + zamiana `store` na API; `MEAS`/`NOTES` już mają gotową strukturę danych |
| Tryb offline (PWA) | `manifest.json` + service worker obok `dist/PhysicsLab.html` |
| Scenariusze lekcji / zestawy parametrów | link `#<id>` + parametry w `localStorage` (`physicslab.p.<id>`) lub nowy parametr w adresie |
| Symulacje 3D | nowa symulacja może w `draw` korzystać z własnego canvasu WebGL (np. Three.js) |
| Integracja z LMS | eksport CSV już jest; dla SCORM/LTI owinąć `dist/PhysicsLab.html` |
