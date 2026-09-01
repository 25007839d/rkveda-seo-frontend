# RKVeda GSC Frontend – Production History Sync Fix

## Included fixes

- `syncGscHistory()` now POSTs `{}` instead of `null`.
- `syncPerformanceHistory()` remains exported as a compatibility alias for older imports/builds.
- The current Google Search Console page uses `syncGscHistory()`.

## Build

```bash
npm ci
npm run build
```

Deploy the generated `dist/` directory.

Recommended production API variable:

```env
VITE_API_BASE_URL=https://api.rkveda.in/api
```
