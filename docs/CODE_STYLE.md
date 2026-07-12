# Code style

Conventions for this repo, covering how the project is organized and how to write the
Astro and TypeScript/JavaScript. Prettier owns formatting, so the code rules below only
cover the choices Prettier does not make.

## Project structure

```text
src/
├─ pages/            one .astro per route, `<page>-images/` holds page-only images
├─ layouts/          StandardLayout.astro wraps every page, owns <head> and the nav
├─ components/       one folder per component (see below)
├─ styles/           global CSS (master, responsive, home), fonts/, shared images/
├─ data/             JSON data (schema.org, etc.)
├─ consts.ts         site-wide constants (nav items, social links, site meta)
└─ env.d.ts
public/              copied verbatim into dist (favicon, manifest, robots, sitemap, PWA icons)
docs/                project docs (this file, BACKLOG.md, plans/, screenshots/)
tests/               Playwright e2e and a11y specs
```

### Astro components

Each component is a self-contained folder holding everything it needs:

```text
src/components/<Name>/
├─ <Name>.astro      markup, PascalCase, matches the folder name
├─ <name>.css        styles, kebab-case
├─ <name>.ts         client script, only if the component is interactive
├─ <name>.test.ts    Vitest unit test, colocated with the code it tests
└─ images/           component-only images
```

- Component folders and their `.astro` file use PascalCase, everything else is kebab-case.
- Keep a component's markup, styles, script, test, and images together in its folder.
- Cross-folder imports use the `@/*` alias, same-folder imports stay relative (`./`).
- Unit tests colocate as `*.test.ts`, e2e and a11y specs live in `tests/`.
- Page-only images live in `src/pages/<page>-images/`, component images in the component's `images/`.

---

## Formatting is Prettier's job

- Prettier is the source of truth for formatting, do not hand-format code.
- Run `npm run prettier:write` before committing, or `npm run prettier:check` to verify.
- The pre-commit hook formats staged files, and config lives in `.prettierrc`.

### Small, focused files

Prefer small, single-purpose files over one large module. Split pure logic away from DOM
wiring and side effects so the logic can be unit-tested on its own.

- One clear responsibility per file.
- Keep pure, testable functions separate from the code that touches the DOM or the network.
- If a file is hard to test or hard to name, it is probably doing too much, so split it.

---

## Styling rules

Follow stylelint `stylelint-config-standard` recommendations.

---

## TypeScript rules

### No single-letter names

Avoid single-letter variable names, a name should say what the value holds. It does not
need to be verbose, common abbreviations are fine (`len`, `btn`, `io`), and common single-letter
variables like `i`, `x`, and `y` are acceptable.

```ts
// avoid
const m = i % len;
entries.forEach((e) => observe(e.target));

// good
const remainder = i % len;
entries.forEach((entry) => observe(entry.target));
```

### Brace every `if`

Always wrap `if` bodies in braces, even a single statement. No bracketless ifs.

```ts
// good
if (!user) {
  return;
}

// avoid
if (!user) return;
```

### Early returns over `else`

Prefer guard clauses that return early. Drop the `else` when an early return makes it redundant.

```ts
// good
function label(item) {
  if (!item) {
    return 'none';
  }
  return item.name;
}

// avoid
function label(item) {
  if (!item) {
    return 'none';
  } else {
    return item.name;
  }
}
```

### Optional chaining only when truly optional

Use `?.` only when the value can genuinely be null or undefined. Reaching for it on a
value that is always present hides real bugs, a missing value should throw, not pass silently.

```ts
// good, the element may not be in the DOM
const btn = root.querySelector('.menu-icon');
btn?.addEventListener('click', onClick);

// avoid, `config` is always defined here
const speed = config?.speed;
// write: const speed = config.speed;
```

### Nullish coalescing over `||`

Prefer `??` when the fallback should apply only to null or undefined. `||` also fires on
`0`, `''`, and `false`, which is usually a bug.

```ts
// good, a real 0 is kept
const count = input.count ?? 10;

// bug, 0 becomes 10
const count = input.count || 10;
```

Use `||` only when you truly want the fallback for every falsy value.

### No `any`, sparing `as`

Never use `any` or `as any`. Reach for `unknown` and narrow, or write a real type. Avoid
`as` assertions in general, prefer proper types or a type guard. Narrowing a known DOM
type is fine when the type is genuinely certain.

```ts
// ok, the target is known to be an element
setActive(slides.indexOf(entry.target as HTMLElement));

// avoid, `any` throws away all type safety
const attrs = rest as Record<string, any>;
```

### Avoid non-null assertions

In `src`, do not use the `!` non-null assertion. Prefer an explicit check with an early
return so a missing value fails loudly at its source. Tests may use `!` on fixtures they control.

```ts
// good
const btn = root.querySelector('.menu-icon');
if (!btn) {
  return;
}
btn.addEventListener('click', onClick);

// avoid
root.querySelector('.menu-icon')!.addEventListener('click', onClick);
```

### `const` by default

Use `const`. Reach for `let` only when a value is genuinely reassigned.

### Avoid nested ternaries

A single ternary is fine and encouraged for a short either/or value. Just never nest them,
nested ternaries are hard to scan. For more than two branches, reach for early returns, an
if/else chain, or a small lookup, whichever reads most clearly.

```ts
// good, a single ternary
const state = isOpen ? 'open' : 'closed';

// avoid, nested ternary
const label = done ? 'done' : active ? 'active' : 'idle';

// good, use early returns for more than two branches
function label() {
  if (done) {
    return 'done';
  }
  if (active) {
    return 'active';
  }
  return 'idle';
}
```

### Prefer named exports

Use named exports in `.ts` files, not default exports. A named export keeps one name across
every import, so rename and find-references stay reliable, and editor auto-import works better.

Default exports are only for places a tool requires them, like `.astro` components, which
Astro default-exports for you.

```ts
// good, named export, one name at every import
export function initNav() {}
import { initNav } from './nav';

// avoid, default export, the import name can drift
export default function initNav() {}
import setupNav from './nav';
```
