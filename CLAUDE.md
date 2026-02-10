# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mobile-first PWA expense tracker built with Nuxt 4. Users create expense categories with monthly budgets and log transactions in multiple currencies (RSD, EUR, RUB) with automatic conversion to Serbian Dinars.

## Commands

```bash
npm run dev          # Development server at localhost:3000
npm run generate     # Static build for GitHub Pages (outputs to .output/public)
npm run preview      # Preview production build
```

## Architecture

### Data Layer
- **Dexie.js** (IndexedDB wrapper) for client-side storage — no backend required
- Database schema in `app/composables/useDatabase.ts`: categories, transactions, settings tables
- Pinia stores (`app/stores/`) provide reactive state management over Dexie

### Key Types (`app/types/index.ts`)
- `ExpenseCategory`: name, budgetLimit, createdAt
- `Transaction`: categoryId, amount (in RSD), originalAmount, originalCurrency, description
- `CurrencyRates`: EUR and RUB conversion rates to RSD

### Pages
- `/` — Category list with progress bars showing budget usage
- `/category/[id]` — Transaction list for a category
- `/settings` — Currency rates configuration, backup export/import

### PWA Configuration
- Service Worker via `@vite-pwa/nuxt` for offline support
- Workbox caches all static assets and Iconify icons
- GitHub Pages deployment uses dynamic `baseURL` based on `GITHUB_ACTIONS` env var

## SCSS
- Variables defined in `app/assets/scss/_variables.scss`
- Use `@/assets/scss/variables` alias (not `~/`) for SCSS imports in components
- Dark theme with mobile-optimized touch targets
