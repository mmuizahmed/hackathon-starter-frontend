import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div role="alert" className="rounded-card border border-red-200 bg-red-50 p-4 dark:border-red-900/70 dark:bg-red-950/40">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-red-900 dark:text-red-200">{title}</p>
          {message ? <p className="mt-1 text-sm leading-6 text-red-800 dark:text-red-300">{message}</p> : null}
          {onRetry ? (
            <div className="mt-3">
              <Button variant="secondary" onClick={onRetry}>
                Try again
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
