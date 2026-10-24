import { Badge, Card, ErrorState, Spinner } from "../../../components/ui";

export function SummaryCard({ summary, loading, error, onRetry }) {
  if (loading) {
    return (
      <Card title="Summary">
        <Spinner label="Writing the summary" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Summary">
        <ErrorState title="Could not summarize" message={error} onRetry={onRetry} />
      </Card>
    );
  }

  if (!summary) return null;

  const bullets = Array.isArray(summary.bullets) ? summary.bullets : [];

  return (
    <Card title="Summary">
      <Badge tone="blue">{summary.label || "AI-generated"}</Badge>
      {summary.fallback ? (
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          The assistant was unavailable, so these lines repeat the figures currently on screen.
        </p>
      ) : null}
      {bullets.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">The summary did not include any lines.</p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-800 dark:text-zinc-200">
          {bullets.map((bullet, index) => (
            <li key={`${index}-${bullet}`}>{bullet}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
