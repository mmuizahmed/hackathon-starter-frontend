import { Card, EmptyState, Button } from "../../../components/ui";
import { formatMonth, formatRupees } from "../../../lib/format";

export function LastPayslipCard({ payslip }) {
  return (
    <Card
      title="Last payslip"
      actions={
        payslip ? (
          <Button variant="ghost" className="h-8 px-2" to={`/employee/payslips?id=${payslip.id}`}>
            View
          </Button>
        ) : null
      }
    >
      {payslip ? (
        <div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-950 dark:text-zinc-50">{formatRupees(payslip.net)}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Net pay · {formatMonth(payslip.month)}</p>
        </div>
      ) : (
        <EmptyState title="No payslip yet" message="Your latest payslip shows here after payroll is finalized." />
      )}
    </Card>
  );
}
