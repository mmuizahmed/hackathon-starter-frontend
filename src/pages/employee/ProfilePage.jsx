import { useEffect, useState } from "react";
import { Badge, Button, Card, ErrorState, FormAlert, Input, PageHeader, Spinner } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { FaceEnrollCard } from "../../features/camera/FaceEnrollCard";
import { getEmployee, updateEmployee } from "../../features/employees/api";
import { formatDate, formatRupees, titleCase } from "../../lib/format";

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-800 sm:flex-row sm:justify-between">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{value || "—"}</dd>
    </div>
  );
}

export function EmployeeProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [record, setRecord] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user?.employeeId) {
      setLoading(false);
      setError("No employee profile is linked to this login.");
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    getEmployee(user.employeeId, { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        const employee = result?.employee || result;
        setRecord(employee);
        setPhone(employee?.phone || "");
        setAddress(employee?.address || "");
        setError("");
      })
      .catch((requestError) => {
        if (!active || requestError.name === "AbortError") return;
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [user?.employeeId, reloadKey]);

  async function onSubmit(event) {
    event.preventDefault();
    if (!record || saving) return;
    setSaving(true);
    setFormError("");
    try {
      const updated = await updateEmployee(record.id, { phone, address });
      const employee = updated?.employee || updated;
      setRecord(employee);
      setPhone(employee.phone || "");
      setAddress(employee.address || "");
      toast.success("Phone and address saved.");
    } catch (requestError) {
      setFormError(requestError.message);
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your record. You can update your phone number and address." />
      {loading ? <Spinner label="Loading profile" /> : null}
      {error ? <ErrorState title="Could not load your profile" message={error} onRetry={() => setReloadKey((value) => value + 1)} /> : null}
      {record ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Record">
            <dl>
              <Row label="Name" value={record.name} />
              <Row label="Code" value={record.code} />
              <Row label="Email" value={record.email} />
              <Row label="Department" value={record.department?.name} />
              <Row label="Designation" value={record.designation?.name} />
              <Row label="Joined" value={formatDate(record.joinDate)} />
              <Row label="Gender" value={titleCase(record.gender)} />
              <Row label="Basic salary" value={formatRupees(record.salary?.basic)} />
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm text-zinc-500 dark:text-zinc-400">Status</dt>
                <dd>
                  {record.status ? (
                    <Badge tone={record.status === "exited" ? "red" : record.status === "probation" ? "amber" : "green"}>
                      {titleCase(record.status)}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </Card>
          <Card title="Contact">
            <form className="space-y-4" onSubmit={onSubmit}>
              <FormAlert message={formError} />
              <Input name="phone" label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
              <Input name="address" label="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
              <Button type="submit" loading={saving}>
                Save contact
              </Button>
            </form>
          </Card>
        </div>
      ) : null}
      {record ? <FaceEnrollCard /> : null}
    </div>
  );
}
