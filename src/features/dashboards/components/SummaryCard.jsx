import { Badge, Card, ErrorState, Spinner } from "../../../components/ui";
import { AiMarkdown } from "../../assistant/AiMarkdown";

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

  if (summary.fallback) {
    return (
      <Card title="Summary">
        <Badge tone="blue">{summary.label || "AI-generated"}</Badge>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">AI summary unavailable.</p>
      </Card>
    );
  }

  const bullets = Array.isArray(summary.bullets) ? summary.bullets : [];

  return (
    <Card title="Summary">
      <Badge tone="blue">{summary.label || "AI-generated"}</Badge>
      {bullets.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">The summary did not include any lines.</p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {bullets.map((bullet, index) => (
            <li key={`${index}-${bullet}`}>
              <AiMarkdown text={bullet} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
