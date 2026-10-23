# Hackathon starter (frontend)

A small React app for a MERN hackathon. It gives you routing, a responsive shell, a few UI pieces, and one place to call the API. Build the assignment on top of it. The Express + MongoDB API is a separate repo: [hackathon-starter-backend](https://github.com/mmuizahmed/hackathon-starter-backend).

There is no `.env` file. The browser always calls `/api` on the same origin. Vite and Vercel forward that path to the backend, so you do not configure an API URL in the frontend.

## Setup

1. Install [Node.js](https://nodejs.org/) 20 or newer.
2. Install dependencies:

```bash
npm install
```

3. Start the backend on port **5000** (see that repo).
4. Start this app:

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173). Home calls `GET /api/health` and shows **ok** or **unreachable**.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with the `/api` proxy. |
| `npm run build` | Build the static site into `dist/`. |
| `npm run preview` | Serve the production build locally. |

## How API calls are routed

The UI never talks to `localhost:5000` directly.

- **Dev.** `vite.config.js` proxies `/api` to `http://localhost:5000`. A call to `/api/health` from the page becomes `http://localhost:5000/api/health`.
- **Production.** `vercel.json` rewrites `/api/(.*)` to `https://YOUR-BACKEND.onrender.com/api/$1`. Replace `YOUR-BACKEND` with your Render service name before you deploy. The rewrite is listed **before** the SPA fallback so `/api/health` is not swallowed by `index.html`.

The client in `src/lib/api.js` expects the shared contract:

- Success: `{ "success": true, "data": {}, "meta": {} }`
- Error: `{ "success": false, "message": "What went wrong" }`

`GET /api/health` should return the success shape. Home treats `{ "data": { "status": "ok" } }` as **ok**. If the browser cannot reach the API, or the proxy gets a 5xx with no message, Home shows **unreachable**.

## Folder structure

```text
src/
  main.jsx                 React entry
  App.jsx                  BrowserRouter
  index.css                Tailwind
  lib/api.js               The only fetch wrapper
  routes/AppRoutes.jsx     URL to page map
  components/ui/           Button, Input, Card, Spinner, EmptyState, ErrorState
  components/layout/       Header, sidebar, page shell
  pages/                   Home, Workspace, About, 404
```

Add a feature by adding a page, a route, a nav link, and (when you need data) a function next to `getHealth` in `src/lib/api.js`.

## Add a page

Example: a Tasks page.

1. Create `src/pages/TasksPage.jsx`.

```jsx
export function TasksPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
      <p className="mt-2 text-sm text-stone-600">Your assignment module goes here.</p>
    </div>
  );
}
```

2. Register it in `src/routes/AppRoutes.jsx` inside the `AppLayout` route:

```jsx
<Route path="/tasks" element={<TasksPage />} />
```

3. Add a link in the `links` array in `src/components/layout/Sidebar.jsx`:

```js
{ to: "/tasks", label: "Tasks" },
```

4. When the page needs data, add a function in `src/lib/api.js` and call it from the page:

```js
export function getTasks() {
  return api("/tasks");
}
```

Use `Spinner` while the request is in flight, `EmptyState` when the list is empty, and `ErrorState` when `api()` throws. Read `message` from the error. That string comes from `{ success: false, message }`.

Copy `src/pages/HomePage.jsx` if you want a worked example of loading, success, and failure.

## Deploy to Vercel

1. In `vercel.json`, change `https://YOUR-BACKEND.onrender.com` to your real backend host. Leave `/api/$1` at the end.
2. Push this repo to GitHub.
3. In Vercel, choose **Add New Project** and import the repo.
4. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`. No environment variables are required.
5. Deploy, then open the site and check Home.

The browser stays on your Vercel domain. Vercel forwards `/api/*` to Render, so those requests are same-origin. Do not point the React app at the Render URL from JavaScript, or cookies and CORS get harder later.

Local check of the production build:

```bash
npm run build
npm run preview
```

## UI pieces

| Component | Use it for |
| --- | --- |
| `Button` | Actions. Pass `to="/path"` when it should navigate. |
| `Input` | A labeled text field. Pass `error` to show a validation message. |
| `Card` | A section with an optional title. |
| `Spinner` | A loading line. It uses `role="status"`. |
| `EmptyState` | A list or filter with nothing to show. |
| `ErrorState` | A failed request, with an optional **Try again** button. |

Colors live in `tailwind.config.js` under `brand`. Change those values to restyle the shell.

## What is left for the assignment

Auth, roles, forms, uploads, and feature modules are not in this repo on purpose. Add only what the brief asks for, using the page recipe above.
