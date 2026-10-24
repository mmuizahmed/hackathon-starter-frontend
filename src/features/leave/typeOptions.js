// Apply needs a leave type id. Balances only carry the code, so ids are taken
// from the catalog when the role can read it, or from this person's past requests.
export function leaveTypeChoices({ balances = [], catalog = [], requests = [] } = {}) {
  const ids = new Map();

  for (const type of catalog) {
    if (type?.code && type?.id) ids.set(type.code, type.id);
  }
  for (const request of requests) {
    const type = request?.leaveType;
    if (type?.code && type?.id && !ids.has(type.code)) ids.set(type.code, type.id);
  }

  return balances.map((item) => ({
    id: item.id || item.leaveTypeId || ids.get(item.code) || "",
    code: item.code,
    name: item.name || item.code,
    paid: item.paid,
    quota: item.quota ?? null,
    used: item.used ?? 0,
    pending: item.pending ?? 0,
    remaining: item.remaining ?? null,
  }));
}
