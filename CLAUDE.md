# CLAUDE.md — Instructions for Claude Code

This document provides Claude Code with essential context for working effectively in the Labor Abstraction Ecosystem monorepo.

## READ FIRST: Constitution

Before making ANY changes, read `.spec-kit/memory/constitution.md`. It contains the 8 inviolable architecture standards that apply to every file.

## Workspace Overview

**Root Directory**: This is an Nx 22.3.3 integrated monorepo with Angular 21 apps and Cloudflare Workers.

### Entity Structure

| Entity     | Domain         | App            |
| ---------- | -------------- | -------------- |
| Dugan Labs | duganlabs.com  | apps/duganlabs |
| BaseNative | basenative.com | apps/showcase  |
| GreenPut   | greenput.com   | apps/greenput  |

### Project Structure

```
basenative/
├── .spec-kit/              # Spec-driven development
│   ├── memory/             # Constitution and persistent context
│   ├── specs/              # Feature specifications
│   ├── plans/              # Technical plans
│   └── tasks/              # Implementation tasks
├── apps/
│   ├── greenput/           # GreenPut CRM (Angular 21)
│   ├── duganlabs/          # Dugan Labs parent site (Angular 21)
│   ├── showcase/           # BaseNative showcase (Angular 21)
│   ├── greenput-api/       # Cloudflare Worker (D1 + KV)
│   └── api-gateway/        # Express API gateway (dev)
├── libs/
│   ├── tokens/             # DTCG design tokens (SOURCE OF TRUTH)
│   │   ├── src/tokens.json # DTCG token definitions
│   │   ├── scripts/        # Token build script
│   │   └── src/lib/        # Generated tokens.css
│   ├── core/               # Core utilities
│   ├── data/               # Data access
│   └── ui-glass/           # Shared UI components
├── prd.json                # Product requirements (stories LAE-001..010)
├── AGENTS.md               # Accumulated learnings
├── CLAUDE.md               # This file
└── ralph.sh                # Ralph loop automation
```

## The 8 Inviolable Standards

### 1. Semantic HTML

Use `<article>`, `<section>`, `<nav>`, `<header>`, `<main>`, `<aside>`, `<hgroup>`, `<menu>`, `<details>`, `<summary>`, `<dialog>`, `<dl>`, `<dt>`, `<dd>`, `<figure>`, `<figcaption>`, `<mark>`, `<output>`, `<data>`, `<time>`, `<table>`, `<fieldset>`, `<legend>`, `<form>`, `<label>`.

**NEVER** use `<div>` or `<span>` for layout or semantics.

### 2. Relational CSS — Zero Class Names

```css
/* CORRECT */
:host { display: grid; }
article { background: var(--color-surface-raised); }
article[aria-expanded="true"] { border-color: var(--color-accent); }
nav > menu > a:where([active]) { color: var(--color-accent); }

/* WRONG */
.card { ... }
.btn-primary { ... }
.sidebar-nav { ... }
```

### 3. DTCG Tokens Only

All values come from `libs/tokens/src/tokens.json` → generated as CSS custom properties:

- `var(--color-*)` — oklch colors
- `var(--space-*)` — spacing scale (4px base)
- `var(--radius-*)` — border radii
- `var(--shadow-*)` — box shadows
- `var(--typography-*)` — fonts, sizes, weights
- `var(--transition-*)` — timing
- `var(--size-*)` — fixed dimensions
- `var(--z-index-*)` — stacking

**NEVER** hardcode hex, rgb, rem, or px values.

### 4. Page Model Pattern

```typescript
// CORRECT — All strings in TypeScript
readonly page = {
  title: 'Dashboard',
  subtitle: 'Welcome back!',
  columns: { name: 'Name', status: 'Status' },
} as const;

// Template binds: {{ page.title }}
```

**NEVER** put string literals directly in HTML templates.

### 5. Dedicated Component Files

- `component.ts` — Logic + page model
- `component.html` — Semantic template
- `component.css` — Relational styles

**NEVER** use inline `template:` or `styles:` in the decorator.

### 6. Modern Angular 21

- `signal()`, `computed()`, `effect()` for state
- `inject()` for dependencies — no constructor injection
- `@if`/`@for`/`@switch` — no `*ngIf`/`*ngFor`
- Standalone components — no NgModules
- `input()`, `output()` signal functions — no decorators

### 7. Multi-Tenant by Default

- Every query: `WHERE tenant_id = ?`
- JWT carries `tenant_id` claim
- KV keys prefixed by tenant
- Zero cross-tenant leakage

### 8. Cloudflare-Native

- Apps → Cloudflare Pages
- API → Cloudflare Workers + D1 + KV
- DNS → Cloudflare
- CI/CD → GitHub Actions

## Token Build Pipeline

```bash
# Regenerate CSS custom properties from tokens.json:
node -e '
const fs=require("fs"), path=require("path");
const tokens=JSON.parse(fs.readFileSync("libs/tokens/src/tokens.json","utf-8"));
function proc(obj,pfx){const v=[];for(const k in obj){if(k.startsWith("$"))continue;const t=obj[k],n=pfx+"-"+k.replace(/[A-Z]/g,l=>"-"+l.toLowerCase());if(t&&typeof t==="object"&&"$value"in t)v.push(n+": "+t["$value"]+";");else if(t&&typeof t==="object")v.push(...proc(t,n));}return v;}
const vars=proc(tokens,"-");
fs.writeFileSync("libs/tokens/src/lib/tokens.css","@layer tokens {\n  :root {\n    "+vars.join("\n    ")+"\n  }\n}\n");
console.log(vars.length+" variables");
'
```

## Running Commands

```bash
# Development
npx nx serve greenput            # Start GreenPut on localhost:4200
npx nx serve greenput-api        # Start Worker locally
npx nx serve duganlabs           # Start Dugan Labs on localhost:4600

# Build
npx nx build greenput --configuration=production
npx nx build duganlabs --configuration=production

# Type check
npx tsc --noEmit

# Deploy (CI/CD handles this on push to main)
# See .github/workflows/deploy.yml
```

## Quick Reference

| Token Pattern                 | Maps To             |
| ----------------------------- | ------------------- |
| `var(--color-accent)`         | Brand emerald green |
| `var(--color-text-main)`      | Primary text        |
| `var(--color-text-muted)`     | Secondary text      |
| `var(--color-surface-base)`   | Dark background     |
| `var(--color-surface-raised)` | Elevated surface    |
| `var(--color-border-default)` | Default borders     |
| `var(--color-status-success)` | Green status        |
| `var(--color-status-warning)` | Amber status        |
| `var(--color-status-error)`   | Red status          |
| `var(--space-4)`              | 16px spacing        |
| `var(--space-6)`              | 24px spacing        |
| `var(--radius-md)`            | 8px radius          |

---

**Last Updated**: 2026-03-08

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
