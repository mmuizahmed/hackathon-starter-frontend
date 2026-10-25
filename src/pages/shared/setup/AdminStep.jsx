import { Input, PasswordInput } from "../../../components/ui";
import { MIN_PASSWORD_LENGTH } from "../../../lib/validate";

export function AdminStep({ form, errors, onChange }) {
  return (
    <div className="space-y-4">
      <Input
        name="adminName"
        label="Your name"
        value={form.adminName}
        error={errors.adminName}
        required
        maxLength={120}
        autoComplete="name"
        onChange={(event) => onChange("adminName", event.target.value)}
      />
      <Input
        name="adminEmail"
        type="email"
        label="Email"
        value={form.adminEmail}
        error={errors.adminEmail}
        required
        maxLength={254}
        autoComplete="email"
        onChange={(event) => onChange("adminEmail", event.target.value)}
      />
      <PasswordInput
        name="adminPassword"
        label="Password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        value={form.adminPassword}
        error={errors.adminPassword}
        required
        maxLength={128}
        autoComplete="new-password"
        onChange={(event) => onChange("adminPassword", event.target.value)}
      />
      <PasswordInput
        name="confirmPassword"
        label="Confirm password"
        value={form.confirmPassword}
        error={errors.confirmPassword}
        required
        maxLength={128}
        autoComplete="new-password"
        onChange={(event) => onChange("confirmPassword", event.target.value)}
      />
    </div>
  );
}
