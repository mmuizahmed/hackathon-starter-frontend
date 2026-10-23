import { Button } from "./Button";

export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="font-medium text-red-900">{title}</p>
      {message ? <p className="mt-1 text-sm text-red-800">{message}</p> : null}
      {onRetry ? (
        <div className="mt-3">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
