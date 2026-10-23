import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";

const hints = [
  {
    title: "Add a page",
    text: "Create a file in src/pages and register it in src/routes/AppRoutes.jsx.",
  },
  {
    title: "Add a navigation link",
    text: "Add an entry to the links array in src/components/layout/Sidebar.jsx.",
  },
  {
    title: "Call the API",
    text: "Add a function in src/lib/api.js that calls api(\"/your-path\").",
  },
  {
    title: "Show every state",
    text: "Use Spinner while loading, EmptyState when a list is empty, and ErrorState when a request fails.",
  },
];

export function WorkspacePage() {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return hints;
    return hints.filter((hint) =>
      `${hint.title} ${hint.text}`.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          Workspace
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          Replace this page with the first module of your assignment. The notes
          below are only a local checklist. They do not come from the API.
        </p>
      </div>

      <Card title="Where to start">
        <div className="space-y-4">
          <Input
            name="guide-search"
            label="Filter the checklist"
            placeholder="Try “page” or “API”"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {visible.length === 0 ? (
            <EmptyState
              title="No matching notes"
              message="Clear the filter to see the checklist again."
            />
          ) : (
            <ul className="space-y-3">
              {visible.map((hint) => (
                <li key={hint.title}>
                  <p className="text-sm font-medium text-stone-900">{hint.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{hint.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
