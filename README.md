# HCM Lite

Web app for HCM Lite, an HR system for one company with three roles: Admin, HR and Employee. It covers attendance with camera check-in, leave, payroll with payslips, dashboards and an AI assistant. This repository is the frontend. The API is in [hcm-lite-backend](https://github.com/mmuizahmed/hcm-lite-backend).

| | |
| --- | --- |
| Live app | https://hcm.muiz.pk |
| Android APK | [HCM-Lite.apk](https://github.com/mmuizahmed/hcm-lite-frontend/releases/download/apk-latest/HCM-Lite.apk) |
| Backend repo | https://github.com/mmuizahmed/hcm-lite-backend |

A new install opens the **Set up your company** screen, where you create the company and the first Admin. There is no sample data.

## Tech stack

| Part | Choice |
| --- | --- |
| UI | React 18, Vite 6, React Router 6 |
| Styling | Tailwind CSS 3, light and dark mode |
| Charts | Recharts 3 |
| Icons | lucide-react |
| Face check | `@vladmandic/human` (runs in the browser) |
| Android | Capacitor 8 |
| Hosting | Vercel |

## Features

- **Setup and sign-in.** First-run setup, login, forced password change for new accounts, and menus and route guards per role.
- **Admin.** Company settings, departments, designations, leave types, holidays, HR logins, payroll finalize, audit log, and a company dashboard with headcount, attrition, payroll cost, gender and tenure.
- **HR.** Employee directory with CSV import and export, employee profile pages, daily attendance board, corrections, leave approvals, salary structures, payroll drafts, and an HR dashboard with attendance trend, absenteeism, late arrivals, absence flags and attrition risk.
- **Employee.** Check-in by button or camera, attendance calendar, correction requests, leave with live balances, payslips with PDF download and an AI explanation, and a personal dashboard.
- **Everyone.** Announcements, notifications, and an AI assistant panel. Every AI answer is labelled "AI-generated".
- **Camera check-in.** The front camera checks for one face and a blink, and the browser reads GPS. Only a face descriptor (numbers) is sent to the server, never a photo. The server makes the final decision.
- **Mobile.** Works at phone width. It can be installed from the browser as a web app, or used through the Android APK.

## Done and not done

Done: every screen for the three roles, dashboards with date and department filters, the AI assistant, camera check-in, dark mode, the installable web app, and the Android APK.

Not done:

- No offline mode. The app needs a connection.
- Notifications refresh every 60 seconds instead of arriving instantly.
- The APK is a debug build, not signed for the Play Store.

## Run locally

Needs Node.js 20 or newer, with the [backend](https://github.com/mmuizahmed/hcm-lite-backend) running on port 5000.

```bash
npm install
npm run dev
```

Open http://localhost:5173. On an empty database you will see the setup screen. That is where the first Admin is created. The AI key is set on the backend, never here.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server. Forwards `/api` to `http://localhost:5000`. |
| `npm run build` | Production build in `dist/`. |
| `npm run preview` | Serves the production build. |
| `npm run lint` | ESLint. |
| `npm test` | Unit tests for the API client, dates and money formatting, leave, payroll, dashboard ranges, the assistant and the camera logic. |

## How the API is reached

The browser only calls `/api` on its own host. In development, Vite forwards it to port 5000. In production, `vercel.json` forwards it to the API on Render. Because of this, the login cookie is first-party and httpOnly, and no token is stored in `localStorage`.

## Android app

The APK is a Capacitor shell that opens https://hcm.muiz.pk in a WebView, so it always runs the latest version of the site. It asks for camera and location access for check-in.

GitHub Actions (`.github/workflows/android.yml`) builds the APK and replaces the `apk-latest` release whenever the Android project changes on `main`.

To build it locally, install JDK 21 and Android SDK platform 36, then run:

```bash
npm ci
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

The file is written to `android/app/build/outputs/apk/debug/app-debug.apk`. To point the app at another address, set `CAPACITOR_SERVER_URL` before `npx cap sync android`.

## Code guide

[docs/FRONTEND_GUIDE.md](docs/FRONTEND_GUIDE.md) explains the folders, the API client, the route guards, the shared components and each feature.
