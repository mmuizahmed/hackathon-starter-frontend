import { Card } from "../components/ui/Card";

export function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          About
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          This repo is the frontend half of a MERN hackathon starter. The API
          lives in a separate Express app.
        </p>
      </div>

      <Card title="Stack">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-stone-700">
          <li>React and React Router, written in plain JavaScript.</li>
          <li>Vite for the dev server and the production build.</li>
          <li>Tailwind CSS for layout and the small UI kit.</li>
          <li>
            One fetch wrapper in <code>src/lib/api.js</code>. The browser always
            calls <code>/api</code>. Vite proxies that path locally, and Vercel
            rewrites it after deploy.
          </li>
        </ul>
      </Card>
    </div>
  );
}
