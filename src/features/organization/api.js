import { api } from "../../lib/api";
import { toQuery } from "../../lib/query";

export function listDepartments(params = {}, options) {
  return api(`/departments${toQuery(params)}`, options);
}

export function listLeaveTypes(params = {}, options) {
  return api(`/leave-types${toQuery(params)}`, options);
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
