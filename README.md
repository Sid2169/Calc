# Calculator

A dependency-light, GNOME-inspired scientific calculator for the web. It combines a custom expression engine, complex-number operations, unit and currency conversion, persistent history and preferences, and offline installation.

## Highlights

- Basic, advanced, and keyboard-focused modes
- Scientific, statistical, complex-number, and user-defined functions
- Unit conversion across 12 quantity types
- Live currency rates with static coverage for missing currencies
- Persistent history, limited to the newest 200 calculations
- Responsive dual keypad with mobile swipe navigation
- Installable application shell with offline startup

## Run locally

The application has no build step. Serve the repository over HTTP so service workers are available:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

Install and run the test suite with:

```bash
npm ci
npm test
```

## Architecture

| File | Responsibility |
| --- | --- |
| `js/evaluator.js` | Tokenizes, parses, and evaluates mathematical expressions |
| `js/calculator.js` | Manages input, formatting, history, and keypad actions |
| `js/converter.js` | Handles units, temperature formulas, and currency rates |
| `js/settings.js` | Stores and validates persistent UI preferences |
| `js/app.js` | Initializes modules, modes, and responsive keypad navigation |
| `service-worker.js` | Caches the same-origin application shell for offline use |

## Interesting implementation details

### Mathematical evaluation without `eval`

Expressions pass through a tokenizer, a Pratt parser, an abstract syntax tree, and an evaluator. This gives the application explicit control over precedence, right-associative exponents, postfix operators, implicit multiplication, assignments, and user-defined functions without executing arbitrary JavaScript.

The evaluator also handles values JavaScript does not provide directly:

- Complex numbers use `{ re, im }` values and dedicated arithmetic and transcendental functions.
- Unicode calculator symbols are normalized before parsing: `×`, `÷`, `π`, roots, superscripts, and subscript radix notation.
- Percentage follows calculator semantics, so `50 + 10%` evaluates to `55` rather than `50.1`.
- `safeEvaluate()` lets the converter evaluate the display without mutating variables or the previous-result state.

### Keeping the calculator and converter independent

The calculator emits a `calculator:display` event whenever its value changes. The converter listens for that event and recalculates its active result. This avoids direct module coupling while keeping button input, typed input, restored history, and conversions synchronized.

Most conversions use lookup tables. Temperature uses an intermediate Celsius transformation because offsets cannot be represented by multiplication alone. Currency uses a keyless EUR-based API and fills API omissions with explicit fallback rates.

### Responsive advanced keypad

The number and scientific keypads remain side by side while their content fits. Below 541px, each becomes a full-width slide. A horizontal touch gesture or the arrow button changes the active slide; vertical gestures continue scrolling normally.

The active slide is stored as a data attribute, leaving CSS responsible for the animation. Calculator click handling is scoped to keypad buttons so navigation and converter controls cannot accidentally insert their labels into the expression.

### Persistent state with safe recovery

History and preferences use separate, versioned `localStorage` records because they have different lifecycles:

- History validates stored entries, retains the newest 200, and can be cleared without changing the current result.
- Settings retain calculator mode, converter category, and source/destination units for every category.
- Restored settings are checked against current `<select>` options before use, so removed or renamed options fall back to markup defaults.
- Storage and JSON failures are caught so private or restricted browsing never prevents the calculator from starting.

### Installable and offline

`manifest.webmanifest` supplies standalone display metadata and 192px/512px install icons. The service worker pre-caches every local file required to start the calculator, serves cached assets when offline, and uses a network-first strategy for page navigation.

Only same-origin requests enter the cache. Live currency requests keep their existing network behavior and are never mistaken for durable application assets. Installation requires HTTPS in production; browsers also permit it on localhost during development.

### Browser-level tests without duplicating the UI

The Vitest harness loads the real `index.html` into JSDOM and executes scripts in browser order. Tests interact through actual buttons, inputs, keyboard events, touch gestures, and storage records. This checks module integration and DOM wiring while keeping unit tests available for the expression evaluator and conversion tables.
