import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input, PageHeader } from "../../../components/ui";
import { currentMonthInKarachi } from "../../../lib/format";
import { ViewTabs } from "../../hr/ViewTabs";
import { PayrollMonth } from "./PayrollMonth";
import { SalaryStructures } from "./SalaryStructures";

export function PayrollWorkspace({ role }) {
  const canGenerate = role === "hr";
  const canFinalize = role === "admin";
  const [params, setParams] = useSearchParams();
  const [month, setMonth] = useState(currentMonthInKarachi);
  const tab = role === "admin" && params.get("tab") === "salary" ? "salary" : "payroll";

  function setTab(next) {
    const updated = new URLSearchParams(params);
    if (next === "salary") updated.set("tab", "salary");
    else updated.delete("tab");
    setParams(updated);
  }

  const description = canFinalize
    ? "Review the draft HR prepared. Finalizing locks the month. Salary structures are read-only here."
    : "Build the monthly draft from attendance, leave, and salary. An admin locks it.";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description={description}
        actions={
          tab === "payroll" ? (
            <div className="w-40">
              <Input
                name="payrollMonth"
                label="Month"
                type="month"
                value={month}
                onChange={(event) => {
                  if (event.target.value) setMonth(event.target.value);
                }}
              />
            </div>
          ) : null
        }
      />
      {role === "admin" ? (
        <ViewTabs
          label="Payroll sections"
          value={tab}
          onChange={setTab}
          options={[
            { value: "payroll", label: "Payroll" },
            { value: "salary", label: "Salary structures" },
          ]}
        />
      ) : null}
      {tab === "salary" ? (
        <SalaryStructures canEdit={false} />
      ) : (
        <PayrollMonth role={role} month={month} canGenerate={canGenerate} canFinalize={canFinalize} />
      )}
    </div>
  );
}
