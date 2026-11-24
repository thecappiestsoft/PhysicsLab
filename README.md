# PhysicsLab

Interaktywne laboratorium fizyki dla szkoły podstawowej i ponadpodstawowej: 36 symulacji w 9 działach (mechanika, dynamika, energia, drgania i fale, elektryczność, magnetyzm, optyka, termodynamika, fizyka atomowa). Aplikacja ma wykresy, tabelę pomiarów z eksportem CSV, zadania z informacją zwrotną, interfejs PL/EN oraz motyw jasny i ciemny.

Czysty HTML, CSS i JavaScript — bez frameworków, bez kompilacji, bez zależności w przeglądarce.

© 2026 CappySoft.pl

---

## Publikacja na GitHub Pages

1. Utwórz repozytorium na GitHubie i wgraj **całą zawartość tego folderu** (z `index.html` w katalogu głównym, razem z ukrytymi plikami `.nojekyll`, `.github/`, `.gitignore`).
2. W repozytorium wejdź w **Settings → Pages**.
3. W sekcji **Build and deployment** wybierz **Source: Deploy from a branch**, gałąź **`main`**, folder **`/ (root)`** i kliknij **Save**.
4. Po 1–2 minutach strona będzie dostępna pod adresem `https://<twoja-nazwa>.github.io/<nazwa-repozytorium>/`.

> **Nie usuwaj pliku `.nojekyll`.** Bez niego GitHub Pages przepuszcza stronę przez Jekylla, który pomija pliki zaczynające się od `_` (np. `js/sims/electricity/_circuit.js`) — część symulacji przestałaby działać.

Każda symulacja ma własny adres, który można wysłać uczniom, np. `…/physicslab/#pend` (wahadło) albo `…/physicslab/#ohm` (prawo Ohma). Lista identyfikatorów jest w tabeli na końcu tego pliku.

Przy każdym pushu GitHub Actions (`.github/workflows/test.yml`) sprawdza formatowanie i uruchamia testy fizyki — wynik widać w zakładce **Actions**.

---

## Praca lokalna

| Cel | Polecenie |
| --- | --- |
| Uruchomić aplikację | otwórz `index.html` w przeglądarce (działa bez serwera) **albo** `npm start` |
| Uruchomić testy | `npm test` |
| Sformatować kod | `npm install` (jednorazowo), potem `npm run format` |
| Sprawdzić wszystko przed commitem | `npm run check` |
| Zbudować wersję jednoplikową | `npm run build` → `dist/PhysicsLab.html` |

Wymagania dla narzędzi: Node.js ≥ 18. Prettier jest jedyną zależnością deweloperską.

**Wersja jednoplikowa** (`dist/PhysicsLab.html`) przydaje się tam, gdzie nie da się wgrać wielu plików — np. w Google Sites (Osadź → Kod), Moodle albo jako załącznik. Folder `dist/` jest w `.gitignore`, bo powstaje z kodu źródłowego.

---

## Struktura projektu

```
physicslab/
├── index.html                ← strona aplikacji + lista plików CSS/JS w kolejności ładowania
├── favicon.svg
├── .nojekyll                 ← wyłącza Jekylla na GitHub Pages (WYMAGANY)
├── css/
│   ├── tokens.css            ← kolory, promienie, czcionki (motyw jasny i ciemny)
│   ├── base.css              ← elementy bazowe, przyciski, kontrolki
│   ├── layout.css            ← nagłówek, stopka, strona główna
│   ├── simulation.css        ← widok symulacji, panele, tabela, „Moje laboratorium”
│   └── responsive.css        ← tryb tablicy i widok mobilny
├── js/
│   ├── core/                 ← silnik aplikacji (niezależny od konkretnych symulacji)
│   │   ├── storage.js        ← bezpieczny wrapper na localStorage
│   │   ├── i18n.js           ← L(pl, en), tr(), t(), bieżący język
│   │   ├── registry.js       ← lista działów (SECTIONS), ikony, rejestr sim()
│   │   ├── theme.js          ← motyw, paleta C dla canvasu, przełączniki
│   │   ├── format.js         ← fmt() z przecinkiem/kropką wg języka, clamp, lerp, DEG
│   │   ├── draw.js           ← rysowanie na canvasie (strzałki, tekst, słupki, linijki)
│   │   ├── chart.js          ← wykresy liniowe i punktowe
│   │   ├── engine.js         ← pętla czasu, próbkowanie, odczyty, pomiary, CSV
│   │   ├── views.js          ← widoki (start, symulacja, „Moje laboratorium”) i nawigacja
│   │   └── app.js            ← start aplikacji (ładowany jako ostatni)
│   ├── i18n/
│   │   ├── pl.js             ← teksty interfejsu po polsku
│   │   └── en.js             ← teksty interfejsu po angielsku
│   └── sims/                 ← symulacje — jeden plik = jedna symulacja
│       ├── shared/           ← wspólne presety i rysunki (samochód, skrzynia, sprężyna)
│       ├── mechanics/  dynamics/  energy/  waves/  electricity/
│       ├── magnetism/  optics/  thermodynamics/  atomic/
│       └── <dział>/_*.js     ← funkcje pomocnicze danego działu (prefiks „_”)
├── tests/
│   ├── harness.mjs           ← ładuje aplikację w Node (bez przeglądarki)
│   ├── physics.test.mjs      ← zgodność modeli ze wzorami (spadek, wahadło, soczewka…)
│   └── structure.test.mjs    ← poprawność definicji wszystkich symulacji i tłumaczeń
├── tools/
│   └── build.mjs             ← skleja stronę w jeden plik dist/PhysicsLab.html
├── docs/
│   ├── ARCHITECTURE.md       ← jak działa aplikacja (przepływ, stan, rysowanie, nawigacja)
│   ├── SIMULATION_API.md     ← pełna specyfikacja definicji symulacji
│   └── templates/
│       └── simulation-template.js ← działający szablon nowej symulacji
└── .github/workflows/test.yml ← testy w GitHub Actions
```

### Dlaczego zwykłe `<script>`, a nie moduły ES?

Pliki są ładowane klasycznymi tagami `<script>`, które współdzielą zakres globalny. Dzięki temu:

- `index.html` działa po dwukrotnym kliknięciu (`file://`) — moduły ES są tam blokowane przez przeglądarkę,
- wersja jednoplikowa to proste sklejenie plików, bez bundlera,
- ten sam kod da się załadować w testach Node.

Konsekwencja: **kolejność w `index.html` ma znaczenie** (rdzeń → tłumaczenia → symulacje → `app.js`), a nazwy funkcji pomocniczych muszą być unikalne w całym projekcie.

---

## Dodawanie nowej symulacji — w 5 krokach

1. Skopiuj `docs/templates/simulation-template.js` do odpowiedniego działu, np. `js/sims/optics/eye.js`.
2. Nadaj unikalne `id` i ustaw `sec` (np. `'opt'`; lista działów w `js/core/registry.js`).
3. Opisz parametry, `init/step/draw`, odczyty, wykresy, wzory i zadanie — szczegóły w [`docs/SIMULATION_API.md`](docs/SIMULATION_API.md).
4. Dopisz `<script src="js/sims/optics/eye.js"></script>` w `index.html` w miejscu, w którym symulacja ma się pojawić w menu działu.
5. Uruchom `npm test` (sprawdzi tłumaczenia, zakresy parametrów i zadanie), a jeśli model da się porównać ze wzorem — dopisz test w `tests/physics.test.mjs`.

Nowy **dział** dodajesz w tablicy `SECTIONS` i obiekcie `ICONS` w `js/core/registry.js` oraz tworzysz katalog w `js/sims/`.

## Linki wewnątrz aplikacji

Nawigacja nie używa `<a href="#…">`, tylko atrybutu `data-go`:

```html
<a data-go="pend" role="link" tabindex="0">Wahadło</a>
```

Google Sites i podobne serwisy przechwytują kliknięcia w zwykłe linki w osadzonym kodzie, więc `href="#…"` tam nie działa. Kliknięcie w element z `data-go` obsługuje `go()` w `js/core/views.js`; adres `#pend` w pasku przeglądarki aktualizuje się pomocniczo (linki bezpośrednie, przycisk Wstecz).

## Tłumaczenia

- **Teksty interfejsu** (przyciski, nagłówki, komunikaty) są w `js/i18n/pl.js` i `en.js`. Oba pliki muszą mieć te same klucze — pilnuje tego test.
- **Teksty symulacji** zapisuje się przy symulacji funkcją `L('po polsku', 'in English')`. W kodzie rysującym wybierz wersję przez `tr(obiekt)` albo warunek `lang === 'pl'`.
- **Liczby** zawsze formatuj przez `fmt(wartość, miejscaPoPrzecinku)` — dobiera przecinek (PL) lub kropkę (EN).

## Motywy i kolory

Wszystkie kolory są zmiennymi CSS w `css/tokens.css` (`:root` = jasny, `[data-theme=dark]` = ciemny). Canvas korzysta z tej samej palety przez obiekt `C` (`C.ink`, `C.c1`…`C.c6`, `C.scene`…). W funkcjach rysujących podawaj nazwę koloru (`'c3'`, `'muted'`), a nie kod HEX — wtedy kolor sam dopasuje się do motywu.

Umowne kolory w scenach: `c3` (zielony) — prędkość, `c4` (czerwony) — przyspieszenie i siła wypadkowa, `c1` (niebieski) — główny obiekt, `c5` (fioletowy) — ciężar i pole, `c2` (pomarańczowy) — siła przyłożona.

## Testy

`npm test` uruchamia wbudowany runner Node (`node --test`) i nie wymaga przeglądarki:

- `physics.test.mjs` — wyniki symulacji porównywane z obliczeniami wzorcowymi (czas spadku, zasięg rzutu, okres wahadła i sprężyny, zachowanie energii, zasady dynamiki, prawo Ohma, równanie soczewki, prawo Snelliusa, bilans cieplny, rozpad, fotoefekt),
- `structure.test.mjs` — dla każdej symulacji: kompletne tłumaczenia, poprawne domyślne wartości parametrów, poprawne zadanie, a `init/step/read` nie rzucają wyjątków.

## Konwencje

- Formatowanie: Prettier (`.prettierrc.json`), 2 spacje, pojedyncze cudzysłowy.
- Jednostki SI w obliczeniach; konwersja (cm, mV, kPa…) dopiero przy wyświetlaniu.
- Każdy model ma w polu `model` opis założeń i uproszczeń.
- Fizyka (`init`/`step`) nie korzysta z DOM — dzięki temu da się ją testować w Node.
- Dane ucznia (pomiary, hipotezy, wnioski) są zapisywane tylko lokalnie w przeglądarce (`localStorage`, klucze z prefiksem `physicslab.`).

---

## Identyfikatory symulacji (linki bezpośrednie `#id`)

| Dział | Symulacje |
| --- | --- |
| Mechanika | `motion` ruch prostoliniowy · `fall` spadek swobodny · `vthrow` rzut pionowy · `proj` rzut ukośny |
| Dynamika | `newton2` II zasada i tarcie · `incline` równia pochyła · `newton3` III zasada · `newton1` I zasada |
| Energia | `track` zjazd po torze · `springE` energia sprężystości · `work` praca siły |
| Drgania i fale | `pend` wahadło · `springosc` masa na sprężynie · `wave` fala na sznurze · `sound` dźwięk · `interf` interferencja |
| Elektryczność | `ohm` prawo Ohma · `circuit` połączenia szeregowe i równoległe · `meters` prawidłowy pomiar |
| Magnetyzm | `magfield` magnes i kompas · `wire` przewodnik z prądem · `emag` elektromagnes · `induct` indukcja · `motor` silnik |
| Optyka | `lens` soczewki · `mirror` zwierciadła · `refr` załamanie i całkowite odbicie |
| Termodynamika | `mix` bilans cieplny · `cond` przewodzenie ciepła · `gas` gaz doskonały · `expand` rozszerzalność cieplna |
| Fizyka atomowa | `atom` budowa atomu · `decay` rozpad · `shield` osłony · `photo` fotoefekt · `spectra` widma |

Specjalne widoki: `#home` (strona główna), `#lab` (Moje laboratorium).
