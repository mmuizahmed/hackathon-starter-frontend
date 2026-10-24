// Builds `?page=1&limit=20` and drops blanks so we never send `departmentId=`.
export function withQuery(path, params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

// Directory calls are capped at 100 rows. Walk a few pages so a filter can still name everyone.
export async function collectPages(loadPage) {
  const first = await loadPage(1);
  const items = [...(first?.items || [])];
  const limit = first?.limit || 100;
  const total = first?.total ?? items.length;
  const pages = Math.min(Math.ceil(total / limit), 5);

  for (let page = 2; page <= pages; page += 1) {
    const next = await loadPage(page);
    items.push(...(next?.items || []));
  }

  return items;
}
