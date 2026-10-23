import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
        Page not found
      </h1>
      <p className="max-w-xl text-sm leading-6 text-stone-600">
        That address is not part of this starter. Check the URL, or go back to
        the home page.
      </p>
      <Button to="/">Back to home</Button>
    </div>
  );
}
