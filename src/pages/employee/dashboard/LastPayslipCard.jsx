import { Card, EmptyState, Button } from "../../../components/ui";
import { formatRupees } from "../../../lib/format";

export function LastPayslipCard({ payslip }) {
  return (
    <Card
      title="Last payslip"
      actions={
        payslip ? (
          <Button variant="ghost" to={`/employee/payslips?id=${payslip.id}`}>
            Open
          </Button>
        ) : null
      }
    >
      {payslip ? (
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{payslip.month}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{formatRupees(payslip.net)}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Net pay</p>
        </div>
      ) : (
        <EmptyState title="No payslip yet" message="Your latest payslip shows here after payroll is finalized." />
      )}
    </Card>
  );
}
