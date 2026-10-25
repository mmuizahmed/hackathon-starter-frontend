import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { BrandMark } from "../../components/BrandMark";
import { ThemeToggle } from "../../components/layout/ThemeToggle";
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
  const [showPassword, setShowPassword] = useState(false);
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
        {/* Logo block */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <BrandMark className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
            <span className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
              HCM Lite
            </span>
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            HR Portal
          </p>
        </div>

        {/* Sign-in card */}
        <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-pop dark:border-zinc-800 dark:bg-zinc-900">
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

            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                error={errors.password}
                required
                autoComplete="current-password"
                className="pr-10"
                onChange={(event) => setPassword(event.target.value)}
              />
              {/* Eye icon sits inside the field, aligned with the input (label is 28px tall). */}
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-1 top-7 flex h-10 w-9 items-center justify-center rounded-control text-zinc-500 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>

            <Button type="submit" loading={submitting} className="mt-2 h-11 w-full">
              Sign in
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
