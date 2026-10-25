import type { CapacitorConfig } from "@capacitor/cli";

// The Android app is a shell around the live site. The WebView opens `server.url`,
// so sign-in cookies stay on that host. `/api` on the same host is proxied to the
// API, which keeps the session cookie first-party.
//
// Default site: https://hcm.muiz.pk
// Point the shell at another site, then sync (the URL is copied into the Android project):
//   CAPACITOR_SERVER_URL=https://hackathon-starter-frontend-eight.vercel.app npx cap sync android
// A local dev server works the same way (http:// is allowed as cleartext):
//   CAPACITOR_SERVER_URL=http://10.0.2.2:5173 npx cap sync android
//
// `webDir` stays `dist` so a later offline build can drop `server.url` and ship the bundle.

const DEFAULT_SERVER_URL = "https://hcm.muiz.pk";

const serverUrl = process.env.CAPACITOR_SERVER_URL || DEFAULT_SERVER_URL;

const config: CapacitorConfig = {
  appId: "pk.muiz.hcmlite",
  appName: "HCM Lite",
  webDir: "dist",
  server: {
    url: serverUrl,
    androidScheme: "https",
    // Hosts the WebView may open. The host in `url` is always allowed; listing
    // both production hosts keeps a move between them inside the app.
    allowNavigation: ["hcm.muiz.pk", "hackathon-starter-frontend-eight.vercel.app"],
    cleartext: serverUrl.startsWith("http://"),
  },
};

export default config;
