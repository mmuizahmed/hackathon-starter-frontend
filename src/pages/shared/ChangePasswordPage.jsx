import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button, FormAlert, PasswordInput } from "../../components/ui";
import { authCardClass } from "../../components/layout/AuthBrand";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { homePathForRole } from "../../routes/navigation";
import { MIN_PASSWORD_LENGTH } from "../../lib/validate";

export function ChangePasswordPage() {
  const { user, changePassword, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  useDocumentTitle("Change password");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const forced = Boolean(user?.mustChangePassword);
  const home = homePathForRole(user?.role) || "/";

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!currentPassword) nextErrors.currentPassword = "Enter your current password.";
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    } else if (newPassword === currentPassword) {
      nextErrors.newPassword = "Choose a password that is different from the current one.";
    }
    if (confirmPassword !== newPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const next = await changePassword(currentPassword, newPassword);
      if (next?.mustChangePassword) {
        setFormError("The password was not accepted. Try a different one.");
        setSubmitting(false);
        return;
      }
      toast.success("Password updated");
      navigate(home, { replace: true });
    } catch (error) {
      setFormError(error.message || "Could not change the password.");
      if (error.errors) setErrors(error.errors);
      setSubmitting(false);
    }
  }

  async function onLogout() {
    try {
      await logout();
    } catch (error) {
      setFormError(error.message || "Could not log out.");
      return;
    }
    navigate("/login", { replace: true });
  }

  return (
    <div className={`mx-auto max-w-sm ${authCardClass}`}>
      <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Change password</h1>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {forced
          ? "This account is using a temporary password. Choose a new one to continue."
          : `Update the password for ${user?.email || "your account"}.`}
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate aria-busy={submitting || undefined}>
        <FormAlert message={formError} />
        <PasswordInput
          name="currentPassword"
          label="Current password"
          value={currentPassword}
          error={errors.currentPassword}
          required
          autoComplete="current-password"
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
        <PasswordInput
          name="newPassword"
          label="New password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          value={newPassword}
          error={errors.newPassword}
          required
          autoComplete="new-password"
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <PasswordInput
          name="confirmPassword"
          label="Confirm new password"
          value={confirmPassword}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
          {forced ? (
            <Button variant="ghost" onClick={onLogout}>
              Log out
            </Button>
          ) : (
            <Button variant="secondary" to={home}>
              Back
            </Button>
          )}
          <Button type="submit" loading={submitting}>
            Update password
          </Button>
        </div>
      </form>
    </div>
  );
}
