# Specyfikacja symulacji (Simulation API)

Każda symulacja to jedno wywołanie `sim({...})` w osobnym pliku w `js/sims/<dział>/`. Rdzeń (`engine.js`, `views.js`) sam buduje wokół niej cały interfejs: scenę, przyciski, panel parametrów, odczyty, wykres, tabelę pomiarów, zakładki „Wiedza” i „Zadanie”.

Najszybciej zacząć od szablonu: [`templates/simulation-template.js`](templates/simulation-template.js).

---

## Pola definicji

### Identyfikacja

| Pole | Typ | Wymagane | Opis |
| --- | --- | --- | --- |
| `id` | `string` | ✔ | Unikalny identyfikator; jest też adresem strony (`#id`). Litery, cyfry, myślniki. |
| `sec` | `string` | ✔ | Dział: `mech`, `dyn`, `en`, `osc`, `el`, `mag`, `opt`, `th`, `at`. |
| `n` | `L(pl, en)` | ✔ | Nazwa wyświetlana w menu i nagłówku. |
| `d` | `L(pl, en)` | ✔ | Jedno–dwa zdania opisu pod nagłówkiem. |

### Parametry — `params: [...]`

Każdy element tworzy kontrolkę w panelu „Parametry”. Bieżące wartości trafiają do obiektu `p` (`p[k]`) i są zapamiętywane w `localStorage`.

| Pole | Opis |
| --- | --- |
| `k` | Klucz w obiekcie `p`. |
| `l` | Etykieta `L(pl, en)`. |
| `type` | brak = suwak + pole liczbowe; `'sel'` = lista; `'chk'` = pole wyboru. |
| `min`, `max`, `step`, `v`, `u` | Dla suwaka: zakres, krok, wartość domyślna, jednostka (tekst). |
| `o` | Dla `'sel'`: `[[wartość, L(pl, en)], ...]`. Gdy `v` jest liczbą, wybrana wartość też zostanie zamieniona na liczbę. |
| `v` | Wartość domyślna (dla `'chk'`: `true/false`). |
| `live` | `true` → zmiana **nie** resetuje symulacji (np. kąt w optyce, napięcie w obwodzie). |
| `if` | `p => boolean` — pokaż kontrolkę tylko gdy warunek jest spełniony (np. parametry drugiego pojazdu). |

Ustawienia na poziomie symulacji:

| Pole | Opis |
| --- | --- |
| `live` | `true` (wszystkie parametry na żywo) albo tablica kluczy. |
| `onLive(s, p, k)` | Wywoływane po zmianie parametru „na żywo” (np. przeskalowanie prędkości cząsteczek po zmianie T). |
| `keepRun` | Po resecie wywołanym zmianą parametru symulacja dalej działa. |

### Model i czas

| Pole | Opis |
| --- | --- |
| `init(s, p)` | Ustawia stan początkowy w obiekcie `s`. Rdzeń wcześniej tworzy `s = { t: 0, hist: [] }`. |
| `step(s, p, h)` | Jeden krok fizyki o długości `h` [s]. Rdzeń sam zwiększa `s.t`. Ustaw `s.done = true`, aby zatrzymać symulację. **Brak `step` = symulacja statyczna** (bez Start/Pauza/Krok). |
| `dt` | Krok całkowania (domyślnie `1/240` s). Dla sztywnych układów mniejszy, np. `1/1000`. |
| `autorun` | Startuje sama po wejściu/resecie (fale, obwody, cząsteczki). |
| `anim(s, p, dtReal)` | Opcjonalna animacja niezależna od Start/Pauza. |
| `leave(s, p)` | Sprzątanie przy wyjściu z symulacji (np. wyłączenie dźwięku). |

Zasada: **fizyka w `init`/`step` nie dotyka DOM ani canvasu** — dzięki temu testy w `tests/` mogą ją uruchomić w Node.

### Rysowanie — `draw(c, w, h, s, p)`

`c` to `CanvasRenderingContext2D` przeskalowany do pikseli CSS, `w × h` to wymiary sceny. Rysuj od zera w każdej klatce, najczęściej zaczynając od `bg(c, w, h)` (tło z siatką).

Pomocnicze funkcje z `core/draw.js` (kolory podawaj nazwą z palety: `'ink'`, `'muted'`, `'c1'`…`'c6'`):

| Funkcja | Zastosowanie |
| --- | --- |
| `bg(c, w, h, grid?)` | tło sceny, opcjonalna siatka (`false` = bez) |
| `line(c, x1, y1, x2, y2, kolor, grubość?, dash?)` | odcinek |
| `arrow(c, x1, y1, x2, y2, kolor, etykieta?, opcje?)` | wektor z grotem i podpisem |
| `text(c, s, x, y, { size, weight, color, align, mono, halo })` | tekst |
| `circle`, `rrect` | koło, zaokrąglony prostokąt |
| `bars(c, x, y, w, h, [[etykieta, wartość, kolor]], max, tytuł)` | słupki energii |
| `ruler(c, x0, y, x1, m0, m1, krok, jednostka)` | podziałka/linijka |
| `legend(c, [[etykieta, kolor]], x, y)` | legenda |
| `alpha(hex, a)` | kolor z przezroczystością |

Wspólne rysunki: `car`, `box`, `ground`, `spring` (`sims/shared/drawing.js`), elementy obwodów (`electricity/_circuit.js`), kompas i magnes (`magnetism/_magnet.js`), termometr (`thermodynamics/_thermo.js`), kolor fali świetlnej `wlColor(nm)` (`atomic/_light.js`).

### Interakcja na scenie (przeciąganie)

| Pole | Opis |
| --- | --- |
| `down(s, p, x, y, w, h)` | Zwróć `true`, jeśli kliknięcie „złapało” obiekt. |
| `move(s, p, x, y, w, h)` | Przeciąganie; możesz zmieniać `p` — suwaki zsynchronizują się same. |
| `up(s, p)` | Puszczenie. |
| `hover(s, p, x, y, w, h)` | Zwróć `true`, aby pokazać kursor „łapki”. |
| `drag` | `true` → w zakładce „Wiedza” pojawi się podpowiedź o przeciąganiu. |

### Odczyty i pomiary — `read(s, p)`

Zwraca tablicę wierszy: `[etykieta, wartość, jednostka?, miejscaPoPrzecinku?, szeroki?, pomińWPomiarze?, bezSzumu?]`

- `etykieta` — `L(pl, en)`,
- `wartość` — liczba (formatowana przez `fmt`) albo tekst / `L(pl, en)`,
- `szeroki` — kafelek na całą szerokość panelu,
- `pomińWPomiarze` — nie trafia do tabeli pomiarów,
- `bezSzumu` — nie dodawaj losowego błędu pomiarowego ±2%.

Przycisk „Zapisz pomiar” zapisuje bieżące odczyty jako wiersz tabeli. Nagłówki kolumn to etykiety z jednostkami w bieżącym języku.

### Wykresy — `charts: [...]`

Kilka wykresów = przełącznik nad wykresem. Dwa rodzaje:

**1. Z historii symulacji.** `sample(s, p)` zwraca obiekt wartości co `sampleDt` (domyślnie 1/30 s); `t` jest dopisywane automatycznie.

```js
sample: s => ({ x: s.x, v: s.v }),
charts: [
  { name: 'x(t)', xl: 't [s]', yl: 'x [m]', ser: [{ k: 'x', n: L('pojazd', 'vehicle'), c: 'c1' }] },
  { name: 'v(x)', xk: 'x', xl: 'x [m]', yl: 'v [m/s]', ser: [{ k: 'v', c: 'c3' }] },
],
```

Opcje serii: `k` (klucz z `sample`), `n` (nazwa w legendzie), `c` (kolor), `dash`, `if: p => bool`. Opcje osi: `xk`, `xmin`, `xmax`, `ymin`, `ymax` (`xmax`/`ymax` mogą być funkcjami `(p, s) => …`).

**2. Wyliczany** — `fn(p, s, rows)` zwraca gotową specyfikację; `rows` to zapisane pomiary (tak powstaje np. wykres I(U) z pomiarów ucznia):

```js
{ name: L('T(l) — teoria', 'T(l) — theory'),
  fn: p => ({ xl: 'l [m]', yl: 'T [s]', ser: [{ c: 'c1', pts: [[0.1, 0.63], /* … */] }],
              marker: [p.L, 2 * Math.PI * Math.sqrt(p.L / p.g)] }) }
```

Pola specyfikacji: `ser[].pts` (`[[x, y], …]`, `NaN` przerywa linię), `ser[].dots` (punkty zamiast linii), `marker: [x, y, kolor?]`, `vline: x`.

### Panel „Wiedza” i „Zadanie”

| Pole | Opis |
| --- | --- |
| `f` | Wzory: tablica napisów lub `L(pl, en)`. |
| `model` | `L(pl, en)` — założenia i uproszczenia modelu (wymagane dydaktycznie). |
| `q` | Pytania badawcze: tablica `L(pl, en)`. |
| `task` | `{ q: L, o: [L, …], a: indeksPoprawnej, ex: L }` — pytanie kontrolne z wyjaśnieniem. |

Zakładka „Zadanie” prowadzi ucznia cyklem **przewiduj → eksperymentuj → mierz → wyjaśnij**: hipoteza, pytanie z informacją zwrotną, wniosek. Notatki są zapisywane w „Moim laboratorium”.

### Dodatkowy przycisk

`extraBtn: { l: L(pl, en), f: (s, p) => {...} }` — przycisk w pasku narzędzi (np. „Odtwórz” w symulacji dźwięku).

---

## Dostępne zmienne globalne

| Nazwa | Znaczenie |
| --- | --- |
| `lang` | `'pl'` lub `'en'` |
| `C` | paleta kolorów bieżącego motywu (`C.ink`, `C.c1`, `C.scene`, `C.dark` …) |
| `E` | stan silnika (`E.sim`, `E.s`, `E.p`, `E.run`, `E.stageH`) — w symulacjach używaj oszczędnie |
| `simById` | rejestr symulacji — przydatny, gdy wykres potrzebuje metody innej symulacji |
| `DEG`, `clamp`, `lerp`, `fmt`, `niceStep` | matematyka i formatowanie |
