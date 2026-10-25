import { useState } from "react";
import { Badge, Button, Card, EmptyState, ErrorState, Spinner } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { AiMarkdown } from "../../../features/assistant/AiMarkdown";
import { explainPayslip } from "../../../features/assistant/api";
import { assistantProblem } from "../../../features/assistant/messages";
import { downloadPayslipPdf } from "../../../features/payroll/api";
import { lineFormula, payslipShareText, splitPayslipLines, whatsAppHref } from "../../../features/payroll/payslipText";
import { formatRupees } from "../../../lib/format";

function LineList({ lines }) {
  if (!lines.length) return <p className="text-sm text-zinc-500 dark:text-zinc-400">No lines.</p>;
  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {lines.map((line) => (
        <li key={line.label} className="py-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{line.label}</p>
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{formatRupees(line.amount)}</p>
          </div>
          {lineFormula(line) ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{lineFormula(line)}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function PayslipView({ slip, loading, error, onRetry }) {
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explainError, setExplainError] = useState("");

  if (loading) return <Spinner label="Loading payslip" />;
  if (error) return <ErrorState title="Could not load this payslip" message={error} onRetry={onRetry} />;
  if (!slip) {
    return <EmptyState title="Select a month" message="Choose a payslip from the list to see the breakdown." />;
  }

  const { earnings, deductions, tax } = splitPayslipLines(slip.breakdown);
  const taxInfo = slip.breakdown?.tax;

  async function onDownload() {
    setDownloading(true);
    try {
      await downloadPayslipPdf(slip.id);
      toast.success("Payslip downloaded.");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDownloading(false);
    }
  }

  async function onExplain() {
    setExplaining(true);
    setExplainError("");
    try {
      const data = await explainPayslip({ payslipId: slip.id });
      setExplanation(data);
    } catch (requestError) {
      setExplanation(null);
      setExplainError(assistantProblem(requestError));
    } finally {
      setExplaining(false);
    }
  }

  const shareHref = whatsAppHref(payslipShareText(slip));
  const explanationText = explanation?.explanation || explanation?.answer || assistantProblem(null, explanation);

  return (
    <Card
      title={slip.month}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" loading={downloading} onClick={onDownload}>
            Download PDF
          </Button>
          <Button variant="secondary" onClick={() => window.open(shareHref, "_blank", "noopener,noreferrer")}>
            Share on WhatsApp
          </Button>
        </div>
      }
    >
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Net pay</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{formatRupees(slip.net)}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Earnings</h3>
          <div className="mt-2">
            <LineList lines={earnings} />
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Gross {formatRupees(slip.gross)}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Deductions</h3>
          <div className="mt-2">
            <LineList lines={deductions} />
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Total {formatRupees(slip.deductions)}</p>
        </section>
      </div>

      <section className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Tax</h3>
        <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">{formatRupees(slip.tax)}</p>
        {taxInfo?.slabLabel ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Slab: {taxInfo.slabLabel}</p>
        ) : null}
        {taxInfo?.formula ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{taxInfo.formula}</p> : null}
        {tax && lineFormula(tax) && lineFormula(tax) !== taxInfo?.formula ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{lineFormula(tax)}</p>
        ) : null}
      </section>

      <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Button variant="secondary" loading={explaining} onClick={onExplain}>
          Explain my payslip
        </Button>
        {explainError ? <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{explainError}</p> : null}
        {explanation ? (
          <div className="mt-3">
            <Badge tone="blue">{explanation.label || "AI-generated"}</Badge>
            <AiMarkdown className="mt-2" text={explanationText} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
