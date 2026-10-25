# Frontend guide

This is the map of the HCM Lite React app. Read it before you add a screen. The code is plain JavaScript, not TypeScript.

A new install starts with an empty database. The UI never shows sample employees or made-up totals. A list with no rows shows an empty state.

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
  pages/shared/             Setup, sign in, change password, 404
  features/<module>/api.js  Functions that call api() for that module
```

A page should not call `fetch`. It calls a function in `src/features/<module>/api.js`. That function calls `api()`.

Modules: `auth`, `setup`, `organization`, `employees`, `attendance`, `camera`, `leave`, `payroll`, `dashboards`, `assistant`, `announcements`, `audit`.

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

`apiBlob(path)` downloads a file. Payslip PDF is `application/pdf`, not the JSON envelope. It returns `{ blob, filename }` from the `Content-Disposition` header. Errors still throw `ApiError`. The payroll module calls it for `GET /api/payslips/:id/pdf` and starts a browser download. Do not point that button at the Render host. The cookie has to stay on this origin, so the path stays under `/api`.

Example:

```js
import { api } from "../../lib/api";

export function listEmployees({ page = 1, limit = 20 } = {}, options) {
  return api(`/employees?page=${page}&limit=${limit}`, options);
}
```

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

Step 3 is pre-filled with defaults: start `09:00`, grace `15` minutes, half day under `5` hours, weekend Saturday and Sunday, radius `150` meters. **Use my current location** calls the browser Geolocation API and fills latitude and longitude. Coordinates are optional, so a blocked location prompt does not stop setup. They can be set later on Company Settings.

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
    "weekend": ["Sat", "Sun"],
    "radiusMeters": 150,
    "officeLat": 24.8607,
    "officeLng": 67.0011
  }
}
```

`officeLat` and `officeLng` are omitted when blank. `weekend` uses the API's short names: `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`. The default is `["Sat", "Sun"]`. Late penalty is not part of setup. It starts off and is edited later on Company Settings. The builder is `buildSetupPayload` in `src/features/setup/payload.js`.

A successful setup stores the returned user and opens the admin dashboard. The same cookie path as login is used.

## Page pattern

Most list pages load data the same way. This is a simplified version of `src/pages/hr/EmployeesPage.jsx`:

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

Employee 360 is not a menu item. It is an extra route next to the role routes: `/admin/employees/:id` and `/hr/employees/:id`. HR also has `/hr/settings`, a read-only copy of Company Settings.

## Organization and people

API calls for these screens live next to the page, not inside `src/lib/api.js`. Lists use `withQuery` and `usePagedResource`, which is the paged form of `useAbortableRequest`.

| Folder | What it calls |
| --- | --- |
| `src/features/organization` | Settings, departments, designations, leave types, holidays. |
| `src/features/users` | HR logins. |
| `src/features/employees` | Directory, register, import, export. |
| `src/features/audit` | Audit log. |
| `src/features/announcements` | Announcements. |

Employee CSV export calls `apiBlob` with `Accept: text/csv`. That file is not wrapped in `{ success, data }`. Payslip PDFs use the same helper.

A temporary password is shown once, from the server response, in `TemporaryPasswordDialog`. The UI does not keep a copy after the dialog closes.

Weekend days in every form are `Sat` and `Sun`, not full English names. Company Settings sends `latePenalty.enabled` and `latePenalty.latesPerHalfDay`. Setup does not.

## Shared components

Import from `src/components/ui`.

| Component | Use it for | Props that matter |
| --- | --- | --- |
| `Button` | Actions. `to` renders a link. | `variant`: `primary`, `secondary`, `danger`, `ghost`. `loading`, `disabled`, `type`. |
| `IconButton` | Icon-only buttons. | `label` becomes the accessible name. |
| `Input` | Text, email, password, number, time. | `name`, `label`, `hint`, `error`, `value`, `onChange`. |
| `PasswordInput` | A password field with a show / hide eye button. | Same field props as `Input`. |
| `Select` | A native select. | `options: [{ value, label }]`, `placeholder`, `error`. |
| `Textarea` | Multi-line text. | Same field props as `Input`. |
| `DatePicker` | A native `input type="date"`. | Same field props as `Input`. |
| `FormAlert` | A form-level error above the fields. | `message`. Renders nothing when empty. |
| `PageHeader` | The top of every app page. Sets the document title. | `title`, `description`, `actions`. |
| `EmptyState` | A list or panel with nothing to show. | `title`, `message`, optional `icon`. |
| `ErrorState` | A failed request. | `title`, `message`, `onRetry`. |
| `Spinner` | A short wait that is not a table. | `label`. |
| `Card` | A bordered section. | `title`, `actions`, `children`. |
| `StatCard` | One KPI. Pass a real value, or do not render the card. | `label`, `value`, `hint`, optional `icon`, optional `className` (for grid spans). |
| `DataTable` | Server-paged lists. | See below. |
| `FilterBar` | Date range plus department. | `from`, `to`, `department`, `departments`, `onChange`, `onClear`. |
| `Modal` | A dialog. | `open`, `title`, `onClose`, `footer`, `children`. Escape and the backdrop close it. Focus stays inside. |
| `ConfirmDialog` | A yes / no modal. | `open`, `title`, `message`, `confirmLabel`, `tone` (`danger` or `primary`), `loading`, `onConfirm`, `onCancel`. |
| `CodeChip` | A short machine code, such as an audit action. | `children`. |
| `Badge` | A small label. | `tone`: `neutral`, `green`, `amber`, `orange`, `red`, `blue`, `yellow`. |
| `StatusPill` | A known status. | `status`: `present`, `late`, `half_day`, `absent`, `on_leave`, `missing_checkout`, `pending`, `approved`, `rejected`. |
| `useToast()` | A short confirmation. Not a component. | `toast.success(message)`, `toast.error(message)`, `toast.info(message)`. |

`DataTable` columns are `{ key, header, render(row)?, align?: "right", wrap?: true }`. `minWidth` (default `36rem`) sets when the table starts to scroll sideways; pass `"0"` for a narrow table inside a side column.

On phones (below `sm`, 640px) the table is replaced by one card per row, with each column as a label and value. Only one of the two layouts is in the page at a time, so inputs inside rows keep unique ids. For lists people mostly use to open a record, pass `mobileRow(row)` to draw a compact row instead, for example the employee directory (name and code link to Employee 360) or the users list. Keep the default cards for rows with many numbers, such as payroll and attendance.

The footer shows "Showing x–y of n". Previous and Next only appear when there is more than one page.

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

On a phone (below the `sm` breakpoint) each row becomes a small card: the first column is the title, the other columns are label / value pairs, and columns with no header or the header `Actions` go at the bottom. Put the column that names the row first.

While `loading` is true the body is a skeleton. While `error` is set the table is replaced by `ErrorState`. Zero rows shows `EmptyState`. The footer says "Showing 1–20 of 45" and moves `page` by 1. The parent owns the fetch.

`FilterBar` calls `onChange({ from, to, department })`. `departments` is `{ value, label }[]` from the API, not a hard-coded list. An empty array still shows "All departments".

## Layout

`AppLayout` is the signed-in shell:

- Sidebar from `roleNavigation`. On a phone it is a drawer. Escape or the backdrop closes it.
- Header: assistant, notifications, theme, account menu (change password, log out).
- Main column, max width `72rem`.
- Assistant panel, 380px on a desktop and a full-screen sheet on a phone. It stays mounted while closed so the chat remains in component state. The employee dashboard opens it with the `hcm:open-assistant` window event.

`AuthLayout` is the frame for setup and change password: the `AuthBrand` logo block above one centered card, and the theme button in the corner. No sidebar. The sign-in page draws the same frame itself, using `AuthBrand` and `authCardClass` from `components/layout/AuthBrand.jsx`.

The notification menu polls `GET /api/notifications/unread-count` every 60 seconds. Opening it loads `GET /api/notifications`. Mark read and mark all read call the matching POST routes. There is no websocket.

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

Dashboards use `recharts` 3. The wrappers are `CategoryChart` and `TrendChart` in `src/features/dashboards/components/`. They only plot numbers the server returned for the current filters.

## HR operations

Attendance, corrections, leave approval, salary, and payroll live in `src/features/attendance`, `src/features/leave`, and `src/features/payroll`. Pages call only that module's `api.js`. Those files also read `/departments` and `/employees` when a screen has to filter or show a name the row does not include. Do not call `fetch` from a page.

Admin can view attendance, corrections, leave, salary, and the payroll draft. HR approves corrections and leave, edits salary, and generates the draft. Only admin sees Finalize. A finalized month shows a Locked badge and hides Generate.

| Screen | Page | What it calls |
| --- | --- | --- |
| Daily board | `pages/hr/AttendancePage.jsx`, `pages/admin/AttendancePage.jsx` | `GET /attendance/board`, then `GET /attendance/calendar` for one person |
| Corrections | `pages/hr/CorrectionsPage.jsx`. Admin uses the Corrections tab on Attendance | `GET /attendance/corrections`, `POST /attendance/corrections/:id/review` |
| Leave inbox | `pages/hr/LeaveApprovalsPage.jsx`, `pages/admin/LeavePage.jsx` | `GET /leave/requests`, `POST /leave/requests/:id/review` |
| Salary | `pages/hr/SalaryStructuresPage.jsx`. Admin uses the Salary tab on Payroll | `GET /salary-structures`, `PUT /salary-structures/:employeeId` |
| Payroll and payslips | `pages/hr/PayrollPage.jsx`, `pages/admin/PayrollPage.jsx` | `POST /payroll/runs`, `GET /payroll/runs/:id`, `GET /payroll/runs/:id/checks`, `POST /payroll/runs/:id/finalize`, `GET /payslips/:id/pdf` |

`AttendanceCalendar` is `src/features/attendance/components/AttendanceCalendar.jsx`. It does not fetch. Pass `month` (`YYYY-MM`) and `days` (`{ date, status, workingDay, late }`). `onSelectDay` and `selectedDate` are optional. HR and Admin leave `selectedDate` empty. My Attendance sets it. The grid is built from the year and month in `src/features/attendance/calendar.js`, not from the browser's local midnight.

Hours on the board are check-out minus check-in. The board payload does not include worked minutes. Salary preview uses the same rounding as the server: HRA 40% of basic, medical 10%, gross the sum (1.5× basic). The save request omits `allowances` so the server stores that standard structure. Paid days are employed working days minus absent days, unpaid leave, and half of the half-days.

Leave rows are records rather than one wide table so the context stays visible on a phone: balance (`Casual 10 -> 8`), holidays, colleagues on leave, and this year's approved leave. Approve sends `{ decision: "approved" }` with no dialog. Reject requires a comment. Correction review requires a comment for both decisions, because the API rejects an empty one.

Payroll checks link to salary, leave, and corrections. Finalize stays disabled while `checks.ok` is false. Override asks for a reason, then locks the month. The confirm copy says the month cannot be edited after that. The payslip drawer lists `breakdown.lines` with the formula inputs and the tax `slabLabel`.

Shared helpers: `src/lib/format.js` (Karachi dates and money), `src/lib/query.js` (`withQuery`, `collectPages`), and `src/hooks/useAbortableRequest.js` (the guide's abort pattern).

## Checks

```bash
npm run lint
npm test
npm run build
```

`npm test` covers the client envelope, 401 behaviour, payslip downloads, user parsing, the setup JSON, Karachi dates, company settings, the attendance month grid, leave weekday preview, leave context labels, payslip line text, salary math, assistant fallback copy, dashboard date ranges, and the camera status logic. It does not open a browser.

Payslip PDF is not JSON. `apiBlob()` in `src/lib/api.js` returns the bytes. `downloadPayslipPdf` in `src/features/payroll/api.js` saves the file.

## Employee self-service, dashboards, assistant

These screens call the feature `api.js` files. They do not call `fetch`.

| Screen | Page | What it reads and writes |
| --- | --- | --- |
| Employee dashboard | `src/pages/employee/DashboardPage.jsx` | `GET /api/analytics/me`, today's attendance, leave balances, announcements. Check-in and check-out, including camera. A 409 check-in shows "Already checked in today". |
| My Attendance | `src/pages/employee/AttendancePage.jsx` | Month calendar from `GET /api/attendance/calendar`, day detail, correction form, own corrections. |
| My Leave | `src/pages/employee/LeavePage.jsx` | Balances with remaining and pending, apply, cancel, history. Smart leave calls `POST /api/ai/smart-leave` and only pre-fills the normal form. |
| My Payslips | `src/pages/employee/PayslipsPage.jsx` | List by month, net pay, earnings and deduction lines with their inputs, tax slab, PDF, explain, and a `wa.me` link. |
| My Profile | `src/pages/employee/ProfilePage.jsx` | Employee 360. Save sends only `phone` and `address`. Face enrollment is on this page. |
| HR dashboard | `src/pages/hr/DashboardPage.jsx` | `GET /api/analytics/hr`, anomalies, attrition risk, and the latest announcements. Filter changes refetch every widget. Absence flags and attrition risk are labeled rule-based. |
| Admin dashboard | `src/pages/admin/DashboardPage.jsx` | `GET /api/analytics/admin` and the latest announcements. The default range is 1 January through today so attrition is year to date. |
| Assistant | `src/features/assistant/AssistantChat.jsx` | `POST /api/ai/chat`. Suggested questions depend on the role. Each model answer shows "AI-generated" and is rendered as markdown. A collapsed row names the records it used, such as "Based on: Your leave balance", and is hidden when no tool ran. |
| Summarize | Both company dashboards | `POST /api/ai/summary` with the KPI JSON on screen and the current filters. A `fallback: true` response shows "AI summary unavailable" and hides the raw key bullets. |

My Attendance uses the shared `AttendanceCalendar`. The employee page passes `selectedDate` so the open day stays marked. HR and Admin omit that prop. Month changes stay in the page, using `shiftMonth` from `calendar.js`.

Leave apply reads `leaveTypeId` from the balance. If that field is missing, the form uses `GET /api/leave-types`.

The weekday count on the apply form skips Saturday and Sunday only. The server also skips holidays and is the count that gets saved.

Charts use `recharts`. Axis and tooltip colors follow the light or dark class. An empty series uses `EmptyState` instead of a blank chart. A trend that is 0% on every day still draws a marker for each day and says so.

AI calls with no provider key return HTTP 200 and `fallback: true`. The panel shows that sentence. HTTP 429 shows "Too many AI requests. Try again in an hour." Smart leave fallback does not change the form.

## Camera attendance

Camera check-in runs in the browser. The page never uploads a photo. It sends a face signature (an array of numbers), a blink flag, and the device location.

`@vladmandic/human` loads through a dynamic `import()` the first time the camera opens, so it stays out of the main bundle. Model files come from the jsDelivr URL for the installed version:

`https://cdn.jsdelivr.net/npm/@vladmandic/human@<version>/models/`

The running set is the face detector, face mesh, iris, and the FaceRes description model (`human-faceres`). Emotion, body, hand, and object models stay off. Gesture stays on, because that is how a blink is read (`blink left eye` and `blink right eye` from the mesh). WebGL is the backend. WASM is used when WebGL cannot start. The preview uses the front camera (`facingMode: "user"`). `useFaceCamera` stops those tracks when the view closes.

The hook reports the face count, the descriptor, whether a blink happened, and a short status: loading models, no face, more than one face, hold still, please blink, blink detected.

On the employee dashboard, camera check-in and camera check-out call the same attendance routes as the web buttons. The body is `source: "camera"`, `descriptor`, `liveness: { blink: true }`, `faceCount: 1`, `lat`, `lng`, and `accuracy`. The browser shows accuracy in meters and warns above 100 meters. The server decides. It compares descriptors with Human's `match.similarity` (Euclidean order 2, multiplier 25) and accepts 0.55 or higher. The page shows the returned status, `location.distanceMeters`, and `faceMatchScore`. A rejection is shown with the server's sentence, including "Enroll your face first", "Blink check failed", "Face does not match the enrolled face", "Face descriptor is required", and "Face descriptor length does not match the enrolled face". The link under the camera says "Can't check in? Request an HR correction" and opens My Attendance at the correction form.

Enrollment is on My Profile. `GET /api/face/me` returns `{ enrolled, enrolledAt, model }`. With nobody enrolled that is `{ enrolled: false, enrolledAt: null, model: null }`. A new signature needs one face and a blink, then averages 3 to 5 descriptors and `POST /api/face/enroll` with `model: "human-faceres"`. A new enroll is 201 and returns `{ enrolled, enrolledAt, model }`. The notice on that card is "We store a face signature (numbers), not your photo". A second enroll is 409, "Face already enrolled. Ask HR to reset it." Camera check-out uses the same face, blink, and location checks as camera check-in, and it does not change the stored attendance source. HR and Admin see a Face enrolled badge on the employee record and can `DELETE /api/face/:employeeId` after a confirm. That delete returns `{ employeeId, enrolled: false }`.

Files: `src/features/camera/`.

## Android app

The Android app is not a second UI. It is a Capacitor shell that opens the live site in a WebView. The default address is `https://hcm.muiz.pk`, set as `server.url` in `capacitor.config.ts`. The scheme is `https`, and the app id is `pk.muiz.hcmlite`.

Because the WebView's page is that site, login cookies stay on `hcm.muiz.pk`. Calls still go to `/api` on the same host, and that host proxies them to the API. The cookie never has to be sent to a different origin.

`allowNavigation` lists both `hcm.muiz.pk` and `hackathon-starter-frontend-eight.vercel.app`, so a link to either host stays in the app. Point the shell somewhere else by setting `CAPACITOR_SERVER_URL` and running `npx cap sync android`. The value is copied into the Android project at sync time. `webDir` is `dist`. Removing `server.url` later would make the app open that bundle instead of the live site.

The manifest allows internet, camera, and fine and coarse location. `MainActivity` asks for the camera and location when the app starts. A small WebView change then grants video capture, which is what `getUserMedia` needs for the front camera. Location uses `navigator.geolocation`; Capacitor allows that prompt once the Android location permission is granted.

Icons and the splash are generated from `assets/logo.svg` (dark green `#0f3d2a`, two bars, orange swoosh) with `@capacitor/assets`. The status bar is that same dark green, with light icons.

Build: JDK 21, Android SDK platform 36, `npm ci`, `npm run build`, `npx cap sync android`, then `cd android && ./gradlew assembleDebug`. GitHub Actions does those steps in `.github/workflows/android.yml` and publishes `HCM-Lite.apk` on the `apk-latest` release:

https://github.com/mmuizahmed/hcm-lite-frontend/releases/download/apk-latest/HCM-Lite.apk

Vercel deploys ignore the `android/` folder.

## Install as a web app

`public/manifest.webmanifest` plus the icons in `public/` let Chrome and Safari add HCM Lite to the home screen. It opens full screen like an app. There is no service worker, so the app still needs a connection.
