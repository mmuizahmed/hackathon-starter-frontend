# Frontend guide

This is the map of the HCM Lite React app. Read it before you add a screen. The code is plain JavaScript, not TypeScript.

Judges start from an empty database. Do not put sample employees, fake totals, or lorem text in the UI. Empty states are the right UI when a list has no rows.

## Folder structure

```text
src/
  main.jsx                  React entry
  App.jsx                   Router and providers
  index.css                 Tailwind and the reduced-motion rule
  lib/api.js                The only fetch wrapper
  lib/user.js               Turns an API user into the shape the app stores
  lib/validate.js           Shared email and password checks
  lib/theme.js              Light / dark, stored in localStorage
  context/                  Auth, theme, toasts
  routes/navigation.js      Menu labels, icons, and paths for each role
  routes/guards.jsx         Who may open which URL
  routes/AppRoutes.jsx      Connects a path to a page component
  hooks/                    Small hooks (page title, close-on-outside-click)
  components/ui/            Shared controls. Import these. Do not restyle per page.
  components/layout/        Sidebar, header, assistant panel, auth frame
  pages/admin/              Admin screens
  pages/hr/                 HR screens
  pages/employee/           Employee screens
  pages/shared/             Setup, sign in, change password, 404, placeholders
  features/<module>/api.js  Functions that call api() for that module
```

A page should not call `fetch`. It calls a function in `src/features/<module>/api.js`. That function calls `api()`.

Modules: `auth`, `setup`, `organization`, `employees`, `attendance`, `leave`, `payroll`, `dashboards`, `assistant`, `announcements`, `audit`.

## Design system

The look is a quiet admin tool. One accent, zinc neutrals, no gradients, no emoji icons.

Tokens live in `tailwind.config.js`:

| Token | Use |
| --- | --- |
| `brand-700` (`#0f766e`) | Primary buttons, focus ring, the small mark next to the wordmark |
| `zinc` | Text, borders, backgrounds |
| spacing | Tailwind's scale. `1` is 4px, `2` is 8px. Stick to 2, 3, 4, 6, 8. |
| `rounded-control` | 6px. Buttons, inputs, nav items. |
| `rounded-card` | 8px. Panels, dialogs, tables. |
| `rounded-full` | Status pills only. |
| `shadow-card` | Panels on the page. |
| `shadow-pop` | Menus and dialogs. |

Font is Inter, then the system font. Page title is `text-xl font-semibold`. Body copy is `text-sm`. Icons are `lucide-react`, usually `h-4 w-4`.

Dark mode is the `class` strategy. `dark` on `<html>` turns it on. Every new control needs a `dark:` background, border, and text color. Do not invent a second theme.

## How the API client works

`api(path, options)` in `src/lib/api.js`:

1. Builds `/api` + `path`. Vite (dev) or Vercel (production) forwards that to the backend.
2. Sends `credentials: "include"` so the httpOnly session cookie goes with the request.
3. Sends JSON when you pass `body`.
4. Reads the envelope.
   - Success `{ success: true, data }` returns `data` only. A list is `{ items, total, page, limit }`. You do not unwrap it again.
   - Failure `{ success: false, message, errors? }` throws `ApiError`.
5. `error.status` is the HTTP status. `error.message` is the server message. `error.errors` is a flat object of field name to string, when the server sent field errors.
6. `error.code === "unreachable"` means the browser could not connect.
7. A 401 on a normal call fires the browser event `hcm:unauthorized`. AuthProvider clears the user and opens `/login`.

These paths do **not** redirect on 401: `/setup/status`, `/setup`, `/auth/login`, `/auth/logout`, `/auth/me`. A wrong password and a signed-out first load are both 401. Redirecting those would bounce the sign-in form.

`api.js` does not import React. The event is how it talks to the router without a circular import.

Example for a later screen:

```js
import { api } from "../../lib/api";

export function listEmployees({ page = 1, limit = 20 } = {}, options) {
  return api(`/employees?page=${page}&limit=${limit}`, options);
}
```

Use the path your backend actually exposes. The line above is the shape, not a promise that `/employees` is final.

```js
const data = await listEmployees({ page });
// data.items, data.total, data.page, data.limit
```

Pass `{ signal }` from an `AbortController` as the second argument when a screen should cancel an old request.

## How auth and the route guards work

On load, `AuthProvider` does this:

1. `GET /api/setup/status`.
2. If `data.initialized` is false, there is no company yet. `user` stays null.
3. If the company exists, `GET /api/auth/me`.
4. 401 from `/auth/me` means nobody is signed in. Any other error fills the full-page "Cannot reach HCM Lite" state. **Try again** runs the same two calls.
5. The stored user is `{ id, name, email, role, mustChangePassword, employeeId }`. `role` must be `admin`, `hr`, or `employee`.

The guards in `src/routes/guards.jsx` then run in this order:

1. `SessionGate` waits until step 5 above has finished. Until then the screen is a spinner.
2. `GuestOnly` wraps `/setup` and `/login`.
   - Company missing: only `/setup` is allowed.
   - Company exists and nobody is signed in: `/login` is allowed. `/setup` sends them to `/login`.
   - Someone is signed in: send them to their home, or to `/change-password` if they still must change it.
3. `RequireAuth` wraps everything else. No company goes to `/setup`. No user goes to `/login`. The path they wanted is kept in `location.state.from` so sign-in can return there.
4. `RequireFreshPassword` wraps the app shell, not the change-password page. If `user.mustChangePassword` is true, every app URL goes to `/change-password`.
5. `RequireRole` wraps one role's routes. An employee who opens an Admin URL is sent to `/employee`, not shown an empty admin page.

Home after sign-in:

| Role | Path |
| --- | --- |
| admin | `/admin` |
| hr | `/hr` |
| employee | `/employee` |

`/` sends a signed-in user to that home.

Sign-in calls `POST /api/auth/login`. The server sets the cookie. The response user is stored. Log out calls `POST /api/auth/logout` and clears the user. A 401 from logout still counts as logged out, because the session is already gone. A network error does not clear the user, so we do not pretend the cookie was deleted.

Change password calls `POST /api/auth/change-password` with `{ currentPassword, newPassword }`, then loads `/auth/me` again. If the server still says `mustChangePassword`, the person stays on the form.

## First-run setup

`/setup` is a three-step form:

1. Company name.
2. Admin name, email, password.
3. Office rules.

Step 3 is pre-filled from the brief: start `09:00`, grace `15` minutes, half day under `5` hours, weekend Saturday and Sunday, radius `150` meters. **Use my current location** calls the browser Geolocation API and fills latitude and longitude. Coordinates are optional so a blocked prompt does not trap the judge. They can be set later on Company Settings.

Submit sends:

```json
{
  "companyName": "Northwind",
  "adminName": "Amina Shah",
  "adminEmail": "admin@northwind.test",
  "adminPassword": "a-real-password",
  "settings": {
    "officeStart": "09:00",
    "graceMinutes": 15,
    "halfDayHours": 5,
    "weekend": ["saturday", "sunday"],
    "radiusMeters": 150,
    "officeLat": 24.8607,
    "officeLng": 67.0011
  }
}
```

`officeLat` and `officeLng` are omitted when blank. `weekend` is lowercase day names. The contract does not spell that out. The builder is `buildSetupPayload` in `src/features/setup/payload.js`. Change it there if the API expects another shape.

A successful setup stores the returned user and opens the admin dashboard. The same cookie path as login is used.

## How to replace a placeholder

The menu routes already exist. Open the page file and replace the body. Do not add another route for a screen that is already in the menu.

Example: HR employees is `src/pages/hr/EmployeesPage.jsx`. Keep the export name `HrEmployeesPage`.

```jsx
import { useEffect, useState } from "react";
import { PageHeader, DataTable, ErrorState } from "../../components/ui";
import { listEmployees } from "../../features/employees/api";

export function HrEmployeesPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    listEmployees({ page, limit: 20 }, { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((requestError) => {
        if (!active || requestError.name === "AbortError") return;
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Register people and keep their job details up to date." />
      <DataTable
        columns={[{ key: "name", header: "Name" }]}
        rows={data?.items || []}
        total={data?.total || 0}
        page={page}
        limit={20}
        onPageChange={setPage}
        loading={loading}
        error={error}
        emptyTitle="No employees yet"
        emptyMessage="HR registers employees here. The directory starts empty."
      />
    </div>
  );
}
```

`active` ignores a response that arrives after the component has unmounted. The signal cancels the HTTP call. Copy both.

## How to add a new page

Only for a URL that is not in the menu yet.

1. Create `src/pages/<role>/YourPage.jsx` and export a named component.
2. Add a row to that role in `src/routes/navigation.js` (`path`, `label`, `icon`, and `end: true` only for the role home).
3. Import the component in `src/routes/AppRoutes.jsx` and add it to the `pages` object under the same path.

The sidebar reads `navigation.js`. The router reads the `pages` object. Both must use the same path.

`end: true` is only on Dashboard. Without it, Dashboard would stay highlighted on every child URL.

## Shared components

Import from `src/components/ui`.

| Component | Use it for | Props that matter |
| --- | --- | --- |
| `Button` | Actions. `to` renders a link. | `variant`: `primary`, `secondary`, `danger`, `ghost`. `loading`, `disabled`, `type`. |
| `IconButton` | Icon-only buttons. | `label` becomes the accessible name. |
| `Input` | Text, email, password, number, time. | `name`, `label`, `hint`, `error`, `value`, `onChange`. |
| `Select` | A native select. | `options: [{ value, label }]`, `placeholder`, `error`. |
| `Textarea` | Multi-line text. | Same field props as `Input`. |
| `DatePicker` | A native `input type="date"`. | Same field props as `Input`. |
| `FormAlert` | A form-level error above the fields. | `message`. Renders nothing when empty. |
| `PageHeader` | The top of every app page. Sets the document title. | `title`, `description`, `actions`. |
| `EmptyState` | A list or panel with nothing to show. | `title`, `message`, optional `icon`. |
| `ErrorState` | A failed request. | `title`, `message`, `onRetry`. |
| `Spinner` | A short wait that is not a table. | `label`. |
| `Card` | A bordered section. | `title`, `actions`, `children`. |
| `StatCard` | One KPI. Pass a real value, or do not render the card. | `label`, `value`, `hint`, optional `icon`. |
| `DataTable` | Server-paged lists. | See below. |
| `FilterBar` | Date range plus department. | `from`, `to`, `department`, `departments`, `onChange`, `onClear`. |
| `Modal` | A dialog. | `open`, `title`, `onClose`, `footer`, `children`. Escape and the backdrop close it. Focus stays inside. |
| `ConfirmDialog` | A yes / no modal. | `open`, `title`, `message`, `confirmLabel`, `tone` (`danger` or `primary`), `loading`, `onConfirm`, `onCancel`. |
| `Badge` | A small label. | `tone`: `neutral`, `green`, `amber`, `orange`, `red`, `blue`, `yellow`. |
| `StatusPill` | A known status. | `status`: `present`, `late`, `half_day`, `absent`, `on_leave`, `missing_checkout`, `pending`, `approved`, `rejected`. |
| `useToast()` | A short confirmation. Not a component. | `toast.success(message)`, `toast.error(message)`, `toast.info(message)`. |

`DataTable` columns are `{ key, header, render(row)?, align?: "right", wrap?: true }`.

```jsx
<DataTable
  columns={[
    { key: "name", header: "Name" },
    { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
  ]}
  rows={data.items}
  rowKey="id"
  page={data.page}
  limit={data.limit}
  total={data.total}
  onPageChange={setPage}
  loading={loading}
  error={error}
  onRetry={reload}
  emptyTitle="No attendance yet"
  emptyMessage="Records appear after someone checks in."
/>
```

While `loading` is true the body is a skeleton. While `error` is set the table is replaced by `ErrorState`. Zero rows shows `EmptyState`. The footer says "Showing 1–20 of 45" and moves `page` by 1. The parent owns the fetch.

`FilterBar` calls `onChange({ from, to, department })`. `departments` is `{ value, label }[]` from the API, not a hard-coded list. An empty array still shows "All departments".

## Layout

`AppLayout` is the signed-in shell:

- Sidebar from `roleNavigation`. On a phone it is a drawer. Escape or the backdrop closes it.
- Header: assistant, notifications, theme, account menu (change password, log out).
- Main column, max width `72rem`.
- Assistant panel, 380px, closed until the header button opens it. The panel is a placeholder until the assistant API exists.

`AuthLayout` is the frame for setup, sign in, and change password. No sidebar.

Notifications are an empty placeholder. Do not invent notification rows.

## Dark mode

The header moon / sun button calls `toggleTheme`. The choice is stored under `hcm-theme` (`light` or `dark`). If nothing is stored, the system preference is used.

`index.html` applies the class before React loads, using the same key, so the first paint is not a flash of light mode. If you rename the key, change it in both `index.html` and `src/lib/theme.js`.

## Keyboard

- Tab moves through controls. Focus uses a teal ring (`focus-visible`), not a glow on mouse click.
- Enter submits the open form.
- Escape closes the mobile menu, the account menu, the notification panel, and a dialog.
- Icon buttons have an accessible name via `label` or `aria-label`.
- "Skip to content" is the first tab stop.

## Charts

`recharts` 3 is a dependency. Do not add another chart library. Import it when a dashboard is built:

```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
```

Plot numbers the server returned for the current filters. Do not invent a series so the chart looks alive.

## Checks

```bash
npm run lint
npm test
npm run build
```

`npm test` covers the client envelope, 401 behaviour, user parsing, and the setup JSON. It does not open a browser.
