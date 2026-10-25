import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AuthBrand, authCardClass } from "../../components/layout/AuthBrand";
import { ThemeToggle } from "../../components/layout/ThemeToggle";
import { Button, FormAlert, Input, PasswordInput } from "../../components/ui";
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
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="absolute right-3 top-3">
        <ThemeToggle />
      </div>

      <main id="main" className="w-full max-w-sm">
        <AuthBrand />

        {/* Sign-in card */}
        <div className={`mt-8 ${authCardClass}`}>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Sign in</h1>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Use the email and password given to you by your company.
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
              placeholder="you@company.com"
              onChange={(event) => setEmail(event.target.value)}
            />

            <PasswordInput
              name="password"
              label="Password"
              value={password}
              error={errors.password}
              required
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />

            <Button type="submit" loading={submitting} className="mt-2 h-11 w-full">
              Sign in
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
