import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, DataTable, EmptyState, ErrorState, Input, PageHeader, Spinner } from "../../components/ui";
import { getPayslip, listPayslips } from "../../features/payroll/api";
import { formatRupees } from "../../lib/format";
import { PayslipView } from "./payslips/PayslipView";

const LIMIT = 12;

export function EmployeePayslipsPage() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("id") || "";
  const [month, setMonth] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [listError, setListError] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [slip, setSlip] = useState(null);
  const [slipError, setSlipError] = useState("");
  const [slipLoading, setSlipLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setListLoading(true);
    listPayslips({ page, limit: LIMIT, month: month || undefined }, { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setList(result);
        setListError("");
      })
      .catch((error) => {
        if (!active || error.name === "AbortError") return;
        setListError(error.message);
      })
      .finally(() => {
        if (active) setListLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [page, month, reloadKey]);

  useEffect(() => {
    if (selectedId || !list?.items?.length) return;
    setParams({ id: list.items[0].id }, { replace: true });
  }, [list, selectedId, setParams]);

  useEffect(() => {
    if (!selectedId) {
      setSlip(null);
      setSlipError("");
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    setSlipLoading(true);
    getPayslip(selectedId, { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        setSlip(result);
        setSlipError("");
      })
      .catch((error) => {
        if (!active || error.name === "AbortError") return;
        setSlip(null);
        setSlipError(error.message);
      })
      .finally(() => {
        if (active) setSlipLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedId, reloadKey]);

  const hasRows = (list?.items || []).length > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="My Payslips" description="Net pay, the lines that made it, and a PDF of the same slip." />
      <div className="max-w-xs">
        <Input
          name="month"
          type="month"
          label="Month"
          value={month}
          onChange={(event) => {
            setPage(1);
            setMonth(event.target.value);
          }}
        />
      </div>

      {listLoading && !list ? <Spinner label="Loading payslips" /> : null}
      {listError && !list ? (
        <ErrorState title="Could not load payslips" message={listError} onRetry={() => setReloadKey((value) => value + 1)} />
      ) : null}

      {list && !hasRows && !listLoading ? (
        <EmptyState title="No payslips" message="A month appears here after payroll for you is finalized." />
      ) : null}

      {list && hasRows ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <DataTable
            caption="Payslips by month"
            columns={[
              { key: "month", header: "Month" },
              { key: "net", header: "Net", align: "right", render: (row) => formatRupees(row.net) },
              {
                key: "open",
                header: "",
                render: (row) => (
                  <Button
                    variant={row.id === selectedId ? "primary" : "ghost"}
                    onClick={() => setParams({ id: row.id })}
                  >
                    View
                  </Button>
                ),
              },
            ]}
            rows={list.items}
            page={list.page || page}
            limit={list.limit || LIMIT}
            total={list.total || 0}
            onPageChange={setPage}
            loading={listLoading}
            error={listError}
            onRetry={() => setReloadKey((value) => value + 1)}
            emptyTitle="No payslips"
            emptyMessage="Nothing matches this month."
          />
          <PayslipView
            slip={slip}
            loading={slipLoading}
            error={slipError}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        </div>
      ) : null}
    </div>
  );
}
