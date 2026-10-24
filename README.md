# HCM Lite

Web app for Admin, HR, and Employee. This repository is the frontend. The API is a separate service. The browser always calls `/api` on the same origin, so the session can stay in an httpOnly cookie.

A fresh install opens **Set up your company**. Create the company and the Admin account there. The app does not ship sample employees, attendance, or payroll.

## Run locally

1. Install [Node.js](https://nodejs.org/) 20 or newer.
2. Install dependencies:

```bash
npm install
```

3. Start the API on port **5000**.
4. Start this app:

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173).

There is no demo password. The first Admin is whoever you enter on the setup screen. HR accounts are created later from Users. An employee login is created when HR registers that person, and the temporary password must be changed on first sign-in.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server. Proxies `/api` to `http://localhost:5000`. |
| `npm run build` | Production build in `dist/`. |
| `npm run preview` | Serve that build locally. |
| `npm run lint` | ESLint. |
| `npm test` | Tests for the API client, user parsing, and the setup payload. |

## How `/api` is routed

The UI never calls `localhost:5000` or the hosted API host directly.

- **Dev.** `vite.config.js` proxies `/api` to `http://localhost:5000`.
- **Production.** `vercel.json` rewrites `/api/(.*)` to the Render API. The rewrite is listed before the SPA fallback so `/api` is not swallowed by `index.html`. Point that destination at the team's backend before you deploy.

`src/lib/api.js` sends `credentials: "include"` on every call. Do not put a token in `localStorage`.

## Charts

`recharts` 3 is installed for the dashboards (brief module 7). Those screens are still placeholders. When you build them, import charts from `recharts` inside `src/features/dashboards` or the dashboard page. The server computes the numbers. The chart only draws them.

## For the team

Read [docs/FRONTEND_GUIDE.md](docs/FRONTEND_GUIDE.md) before adding a screen. It covers folders, the route guards, the API client, and the shared components.

## What is built

- First-run setup, sign in, log out, change password
- Menus and route guards for Admin, HR, and Employee
- Shared layout: sidebar, header, notifications placeholder, assistant panel
- Shared UI kit and light / dark mode
- Placeholder pages for the rest of the menu

Not built yet: organization setup screens, employees, attendance, leave, payroll, dashboards, the assistant, announcements, and the audit log.
