# Constitution — Labor Abstraction Ecosystem

> These principles are immutable. They apply to every change, every component, every line of code. AI agents and human developers alike must follow them without exception.

## Entity Structure

| Entity | Domain | Purpose |
|--------|--------|---------|
| **Dugan Labs** | duganlabs.com | Parent umbrella. R&D. High-integrity infrastructure. |
| **BaseNative** | basenative.com | Foundation. Semantic web, 48V home standards, USB-C Metric patent. Open source (software) + profit (hardware). |
| **GreenPut** | greenput.com | The Engine. Logic, state-machines, high-integrity fintech. Bill pay, stablecoin compounding, M&A deals, treasury sweep. For-profit. |

## Inviolable Architecture Standards

### 1. Semantic HTML — No Exceptions

There is hardly ever a need for `<div>` or `<span>`. Every element must carry meaning.

**Use these:**
`<article>`, `<section>`, `<nav>`, `<aside>`, `<header>`, `<footer>`, `<main>`, `<hgroup>`, `<menu>`, `<details>`, `<summary>`, `<dialog>`, `<dl>`, `<dt>`, `<dd>`, `<figure>`, `<figcaption>`, `<mark>`, `<output>`, `<data>`, `<time>`, `<address>`, `<fieldset>`, `<legend>`, `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`, `<ol>`, `<ul>`, `<li>`, `<form>`, `<label>`, `<select>`, `<input>`, `<textarea>`, `<button>`

**Modern APIs required:**
- Popover API (`popover` attribute, `popovertarget`)
- CSS Anchor Positioning
- `<dialog>` for modals
- `<details>`/`<summary>` for disclosure widgets

### 2. Relational CSS — No Class Names

Style by what elements ARE, not what you name them.

- Element selectors: `article`, `nav`, `header`
- Attribute selectors: `[data-stage]`, `[aria-expanded]`, `[data-status]`
- Pseudo-classes: `:has()`, `:is()`, `:where()`, `:nth-of-type()`
- Combinators: `>`, `+`, `~`
- `:host` for component root

**Never:** `.my-class`, `.btn-primary`, `.card-header`

### 3. DTCG Tokens as Source of Truth

All visual values come from `libs/tokens/src/tokens.json` (DTCG format). The build script generates CSS custom properties consumed by components.

- Colors: `var(--color-*)` — oklch color space
- Spacing: `var(--space-*)` — 4px base scale
- Radii: `var(--radius-*)`
- Shadows: `var(--shadow-*)`
- Typography: `var(--typography-*)`
- Transitions: `var(--transition-*)`
- Sizes: `var(--size-*)`
- Z-index: `var(--z-index-*)`

**Never:** hardcoded hex, rgb, rem values, or px values for spacing/sizing.

### 4. Page Model Pattern — No Magic Strings in Templates

Every string visible in the UI lives in the TypeScript component as a typed readonly object.

```typescript
readonly page = {
  title: 'Dashboard',
  subtitle: 'Welcome back!',
  columns: { name: 'Name', status: 'Status' },
} as const;
```

Templates bind to `{{ page.title }}`, never `Dashboard` directly.

### 5. Dedicated Component Files

Every component has three files: `.ts`, `.html`, `.css`.

- `templateUrl: './component.html'` — always
- `styleUrl: './component.css'` — always
- NO inline `template:` or `styles:` properties

### 6. Modern Angular (21.x Signals-First)

- `signal()`, `computed()`, `effect()` for all state
- `inject()` for all dependencies — no constructor injection
- `@if`/`@for`/`@switch` control flow — no `*ngIf`/`*ngFor`
- Standalone components only — no NgModules
- `input()`, `output()` signal functions for component I/O — no decorators
- Strict TypeScript — no implicit any

### 7. Multi-Tenant by Default

- Every D1 query includes `WHERE tenant_id = ?`
- JWT tokens carry `tenant_id` claims
- KV keys prefixed by tenant
- Application middleware enforces tenant context
- Zero cross-tenant data leakage

### 8. Cloudflare-Native Infrastructure

- Angular apps → Cloudflare Pages
- API → Cloudflare Workers with D1 + KV
- DNS → Cloudflare
- CI/CD → GitHub Actions with wrangler-action

## Design Language

- **Color space:** oklch (perceptually uniform)
- **Theme:** Dark-first glassmorphism with emerald accent
- **Typography:** Inter (sans), JetBrains Mono (mono)
- **Motion:** Reduced by default, respect `prefers-reduced-motion`

## Quality Gates

Every change must:
1. Pass TypeScript strict compilation
2. Follow all 8 architecture standards above
3. Maintain tenant isolation
4. Use only DTCG token values
5. Contain zero magic strings in templates
6. Use only semantic HTML elements
