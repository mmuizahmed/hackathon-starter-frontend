import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, FormAlert, Input } from "../../components/ui";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { homePathForRole } from "../../routes/navigation";
import { isEmail } from "../../lib/validate";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle("Sign in");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!isEmail(email)) nextErrors.email = "Enter the email on the account.";
    if (!password) nextErrors.password = "Enter the password.";
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      const requested = location.state?.from;
      const next = user.mustChangePassword
        ? "/change-password"
        : requested || homePathForRole(user.role) || "/";
      navigate(next, { replace: true });
    } catch (error) {
      setFormError(error.message || "Could not sign in.");
      if (error.errors) setErrors(error.errors);
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-card border border-zinc-200 bg-white p-4 shadow-card dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">Sign in</h1>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Use the email and password for your HCM Lite account.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate aria-busy={submitting || undefined}>
        <FormAlert message={formError} />
        <Input
          name="email"
          type="email"
          label="Email"
          value={email}
          error={errors.email}
          required
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          name="password"
          type="password"
          label="Password"
          value={password}
          error={errors.password}
          required
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>
    </div>
  );
}
