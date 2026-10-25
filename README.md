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

## Android app

The Android app is a shell. It does not contain a second copy of the screens. [Capacitor](https://capacitorjs.com/) opens the live site, [https://hcm.muiz.pk](https://hcm.muiz.pk), in a WebView. Sign-in uses the same cookie as the browser, because the page and `/api` are both on that host.

On startup the app asks for the camera and for location, so check-in can use the front camera and GPS.

Download the latest debug APK:

https://github.com/mmuizahmed/hackathon-starter-frontend/releases/download/apk-latest/HCM-Lite.apk

That file is replaced each time the Android workflow runs. The workflow runs on a push to `main` that changes the Android project, and when someone starts **Android APK** by hand from the Actions tab. The same file is also saved as a workflow artifact named `HCM-Lite.apk`.

Build it locally:

1. Install JDK 21 and the Android SDK (platform 36).
2. `npm ci`
3. `npm run build` creates `dist/`. Capacitor copies that folder in. The installed app still opens the live site.
4. `npx cap sync android`
5. `cd android && ./gradlew assembleDebug`

The APK is `android/app/build/outputs/apk/debug/app-debug.apk`.

The address the shell opens is `server.url` in `capacitor.config.ts`. It defaults to `https://hcm.muiz.pk`. Change it, then sync again:

```bash
CAPACITOR_SERVER_URL=https://hackathon-starter-frontend-eight.vercel.app npx cap sync android
```

`hcm.muiz.pk` and `hackathon-starter-frontend-eight.vercel.app` are both listed under `allowNavigation`, so either host can open inside the app. `webDir` stays `dist`, so a later build can remove `server.url` and open the bundled files instead.

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
