# Plan: Architecture Standards Refactor

## Context

All Angular components are being refactored to follow the constitution's 8 inviolable standards. This plan covers the systematic migration from prototype-grade code (div soup, class names, inline templates, magic strings) to production-grade semantic web components.

## Approach

### Phase 1: Token Foundation (COMPLETE)
- [x] Expand `tokens.json` with semantic tokens (status, stage, account colors)
- [x] Add typography scale, letter spacing, transitions, breakpoints
- [x] Rebuild CSS custom properties (131 variables generated)

### Phase 2: GreenPut Component Refactor (COMPLETE)
- [x] App shell (app.ts/html/css) — semantic nav, header, main, aside
- [x] Dashboard — hgroup, dl, article, time elements
- [x] Deals Kanban — section[data-stage], article[aria-expanded], ol, menu
- [x] Treasury — table, thead, tbody, mark[data-type], output[data-status], dl
- [x] Sweep — article[data-enabled], input checkbox toggle, dl, footer
- [x] Lead Intake — table, output[data-status], mark[data-service]
- [x] Lead Form — form, fieldset, legend, label
- [x] Documents — table, mark[data-type], output[data-status], figure

### Phase 3: Token Consistency Audit (COMPLETE)
- [x] Fix --gp-* prefix in dashboard.css → --color-*, --space-*, etc.
- [x] Fix --pb-* prefix in deals.css → --color-*, --space-*, etc.
- [x] Fix --yp-* prefix in treasury/sweep CSS
- [x] Remove all hardcoded hex/rgba values
- [x] Verify all 131 token variables are correctly referenced

### Phase 4: Global Styles Cleanup (COMPLETE)
- [x] Remove all utility classes from styles.css
- [x] Remove all --gp-* custom properties
- [x] Import only tokens.css + minimal base reset
- [x] Component styles belong in component files only

### Phase 5: Spec-Kit Implementation (COMPLETE)
- [x] Create .spec-kit directory structure
- [x] Write constitution.md with all 8 inviolable standards
- [x] Write ecosystem spec
- [x] Write this architecture plan
- [x] Update AGENTS.md and CLAUDE.md

### Phase 6: Remaining Work (PENDING)
- [ ] Refactor DuganLabs app to standards
- [ ] Refactor Showcase (BaseNative) app to standards
- [ ] Implement real API integration (replace mock data)
- [ ] Add unit tests for all refactored components
- [ ] Deploy via CI/CD pipeline

## Decisions

1. **oklch over hex/rgb**: Perceptually uniform, supports wide gamut, future-proof
2. **Relational CSS over BEM/utility**: Eliminates class name proliferation, aligns with semantic HTML
3. **Page model over i18n**: Simpler for current scale, easy to migrate to i18n later
4. **DTCG JSON over Figma variables**: Single source of truth that generates both CSS and can sync to Figma
5. **Dark-first theme**: Target users are developers/power users who prefer dark mode
