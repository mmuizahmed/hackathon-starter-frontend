import { Input } from "../../../components/ui";

export function CompanyStep({ form, errors, onChange }) {
  return (
    <Input
      name="companyName"
      label="Company name"
      hint="Shown on payslips and announcements."
      value={form.companyName}
      error={errors.companyName}
      required
      maxLength={120}
      autoComplete="organization"
      onChange={(event) => onChange("companyName", event.target.value)}
    />
  );
}
