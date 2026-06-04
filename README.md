# ProductivityFrontend

LedgerFlow — React personal finance dashboard (Vite + TypeScript + Tailwind).

## Requirements

- Node.js 20+
- Running [ProductivityBackend](https://github.com/Prasannakbhat123/ProductivityBackend) API

## Setup

```bash
npm install
cp .env.example .env
# Set VITE_API_URL to your backend URL (e.g. http://localhost:4000)
npm run dev
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (no trailing slash) |

## Build

```bash
npm run build
npm run preview
```

Static output is in `dist/`. Deploy `dist/` to Vercel, Netlify, Cloudflare Pages, or any static host.

Set `VITE_API_URL` in your host’s environment **before** build so the API URL is baked into the bundle.

## Deploy (Vercel example)

1. Import this repository.
2. Framework preset: **Vite**
3. Add environment variable `VITE_API_URL=https://your-backend.example.com`
4. Build command: `npm run build`
5. Output directory: `dist`
