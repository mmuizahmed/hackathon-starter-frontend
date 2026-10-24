// Apply needs a leave type id. Balances include leaveTypeId. The catalog is the fallback.
export function leaveTypeChoices({ balances = [], catalog = [] } = {}) {
  const ids = new Map();

  for (const type of catalog) {
    if (type?.code && type?.id) ids.set(type.code, type.id);
  }

  return balances.map((item) => ({
    id: item.leaveTypeId || ids.get(item.code) || "",
    code: item.code,
    name: item.name || item.code,
    paid: item.paid,
    quota: item.quota ?? null,
    used: item.used ?? 0,
    pending: item.pending ?? 0,
    remaining: item.remaining ?? null,
  }));
}
