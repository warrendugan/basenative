# Spec: Labor Abstraction Ecosystem

## Overview

A multi-tenant Nx monorepo powering three business entities through Angular 21 frontends and Cloudflare Workers APIs. The system manages CRM leads, M&A deal pipelines, treasury accounts, sweep automation, and document vaults — all under strict semantic web standards with DTCG design tokens as the single source of truth.

## Goals

1. **GreenPut CRM** — Complete lead-to-close lifecycle for electrical contracting: leads, estimates, projects, invoicing
2. **M&A Pipeline** — Deal tracking from prospect through due diligence to close, with document vault
3. **Treasury Management** — Multi-account monitoring, yield tracking, automated sweep rules
4. **BaseNative Showcase** — Foundation marketing site demonstrating semantic web capabilities
5. **Dugan Labs Portal** — Parent entity hub linking all products

## User Stories

See `prd.json` for the full backlog (LAE-001 through LAE-010).

### Priority 1 (Must Ship)
- LAE-001: BaseNative showcase deployment
- LAE-002: GreenPut lead management flow
- LAE-005: API Worker CRUD for leads
- LAE-007: JWT authentication flow
- LAE-010: Multi-tenant data isolation

### Priority 2 (Should Ship)
- LAE-003: Deal tracking pipeline
- LAE-004: Treasury dashboard
- LAE-006: Consent receipt endpoints

### Priority 3 (Nice to Have)
- LAE-008: Pact contract tests
- LAE-009: MSW mock handlers

## Non-Functional Requirements

- Initial page load < 2 seconds
- All interactions respond within 200ms
- Lighthouse performance score > 90
- WCAG 2.1 AA compliance
- Zero hardcoded values in CSS (tokens only)
- Zero magic strings in HTML templates
- Zero `<div>` or `<span>` in semantic contexts
