import { EmptyState, PageHeader } from "../../components/ui";

export function PlaceholderPage({ title, description, emptyTitle = "No records yet", emptyMessage }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        title={emptyTitle}
        message={emptyMessage || "This list stays empty until someone creates the records in the app."}
      />
    </div>
  );
}
