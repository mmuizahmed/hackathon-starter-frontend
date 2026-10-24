import { formatMoney } from "../../../lib/format";

function Row({ label, value, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2 last:border-0 dark:border-zinc-800">
      <div>
        <p className="text-sm text-zinc-700 dark:text-zinc-200">{label}</p>
        {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
      </div>
      <p className="text-sm font-medium tabular-nums text-zinc-950 dark:text-zinc-50">{formatMoney(value)}</p>
    </div>
  );
}

export function SalaryPreview({ salary }) {
  if (!salary) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Type a basic salary. HRA, medical, and gross update here before you save.
      </p>
    );
  }

  return (
    <div>
      <Row label="Basic" value={salary.basic} />
      <Row label="HRA" value={salary.hra} hint="40% of basic" />
      <Row label="Medical" value={salary.medical} hint="10% of basic" />
      <Row label="Other" value={salary.other} hint="None in the standard structure" />
      <Row label="Gross" value={salary.gross} hint="Basic + HRA + medical, which is 1.5× basic" />
    </div>
  );
}
