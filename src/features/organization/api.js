import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export function listDepartments(query = {}, options) {
  return api(withQuery("/departments", query), options);
}

// One extra page covers a company larger than the default page size.
export async function listDepartmentOptions(options) {
  const first = await listDepartments({ page: 1, limit: 100, active: true }, options);
  const items = [...(first?.items || [])];
  if ((first?.total || 0) > items.length) {
    const second = await listDepartments({ page: 2, limit: 100, active: true }, options);
    items.push(...(second?.items || []));
  }
  return items
    .filter((row) => row.active !== false)
    .map((row) => ({ value: row.id, label: row.name }));
}
