---
title: "ADR-001: Adoption of @angular/aria Primitives"
date: "2026-01-23"
status: "Accepted"
tags:
  - accessibility
  - angular
  - aria
---

# Adoption of @angular/aria

## Context
We want to improve accessibility and standardize interaction patterns across our UI library (`libs/ui`) and primitives (`libs/primitives`).
Angular v21 has introduced `@angular/aria`, a set of framework-agnostic, unstyled primitives for building accessible components.

## Decision
We will adopt `@angular/aria` for complex interactive components where the library provides a corresponding primitive.

**Available Primitives in @angular/aria v21:**
- `Accordion`
- `Combobox`
- `Grid`
- `Listbox`
- `Menu`
- `Tabs`
- `Toolbar`
- `Tree`

**Excluded Components:**
- Basic buttons and checkboxes are not currently exported by `@angular/aria`. These will continue to use native HTML elements or existing CDK-based implementations.
- Dialogs are not currently part of the `@angular/aria` export set.

## Strategy
1. **Identify candidates**: Audit existing components (Tabs, Menus, Toolbars, Accordions) for replacement.
2. **Refactor**: Implement `@angular/aria` primitives to handle ARIA attributes and keyboard navigation.
3. **Style**: Apply existing "glass" or design system styles to the new accessible structures.

## Consequences
- **Positive**: Guaranteed WCAG compliance for complex interactions; reduced maintenance of custom a11y logic.
- **Negative**: Dependency on `@angular/aria` package; rigorous testing required during migration.
