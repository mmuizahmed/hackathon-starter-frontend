import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, FormAlert } from "../../components/ui";
import { DEFAULT_OFFICE_SETTINGS, buildSetupPayload } from "../../features/setup/payload";
import { readCurrentPosition } from "../../lib/geo";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/api";
import { homePathForRole } from "../../routes/navigation";
import { isEmail, MIN_PASSWORD_LENGTH } from "../../lib/validate";
import { AdminStep } from "./setup/AdminStep";
import { CompanyStep } from "./setup/CompanyStep";
import { OfficeStep } from "./setup/OfficeStep";

const STEP_TITLES = {
  1: "Company",
  2: "Admin account",
  3: "Office rules",
};

const FIELD_STEP = {
  companyName: 1,
  adminName: 2,
  adminEmail: 2,
  adminPassword: 2,
  confirmPassword: 2,
  officeStart: 3,
  graceMinutes: 3,
  halfDayHours: 3,
  weekend: 3,
  officeLat: 3,
  officeLng: 3,
  radiusMeters: 3,
};

const emptyErrors = {};

function validate(step, form) {
  const errors = {};

  if (step === 1) {
    if (form.companyName.trim().length < 2) errors.companyName = "Enter the company name.";
  }

  if (step === 2) {
    if (form.adminName.trim().length < 2) errors.adminName = "Enter your name.";
    if (!isEmail(form.adminEmail)) errors.adminEmail = "Enter a valid email.";
    if (form.adminPassword.length < MIN_PASSWORD_LENGTH) {
      errors.adminPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (form.confirmPassword !== form.adminPassword) errors.confirmPassword = "Passwords do not match.";
  }

  if (step === 3) {
    if (!form.officeStart) errors.officeStart = "Choose a start time.";

    const grace = Number(form.graceMinutes);
    if (form.graceMinutes === "" || !Number.isInteger(grace) || grace < 0 || grace > 180) {
      errors.graceMinutes = "Enter grace minutes from 0 to 180.";
    }

    const hours = Number(form.halfDayHours);
    if (form.halfDayHours === "" || Number.isNaN(hours) || hours <= 0 || hours > 12) {
      errors.halfDayHours = "Enter hours greater than 0 and at most 12.";
    }

    if (form.weekend.length === 0) errors.weekend = "Choose at least one weekend day.";

    const radius = Number(form.radiusMeters);
    if (form.radiusMeters === "" || !Number.isInteger(radius) || radius < 10 || radius > 5000) {
      errors.radiusMeters = "Enter a radius from 10 to 5000 meters.";
    }

    const latBlank = form.officeLat === "";
    const lngBlank = form.officeLng === "";
    if (latBlank !== lngBlank) {
      errors.officeLat = "Enter both latitude and longitude, or leave both blank.";
    } else if (!latBlank) {
      const lat = Number(form.officeLat);
      const lng = Number(form.officeLng);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) errors.officeLat = "Latitude must be between -90 and 90.";
      if (Number.isNaN(lng) || lng < -180 || lng > 180) errors.officeLng = "Longitude must be between -180 and 180.";
    }
  }

  return errors;
}

function focusField(errors) {
  const name = Object.keys(errors)[0];
  if (!name) return;
  document.getElementById(name)?.focus();
}

function flattenServerErrors(errors) {
  if (!errors) return null;
  const flat = {};
  for (const [field, message] of Object.entries(errors)) {
    flat[field.split(".").pop()] = message;
  }
  return flat;
}

function stepForServerErrors(errors) {
  if (!errors) return null;
  for (const field of Object.keys(errors)) {
    const key = field.split(".").pop();
    if (FIELD_STEP[key]) return FIELD_STEP[key];
    if (FIELD_STEP[field]) return FIELD_STEP[field];
  }
  return null;
}

export function SetupPage() {
  const { completeSetup } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle("Set up your company");

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState(emptyErrors);
  const [form, setForm] = useState({
    companyName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    ...DEFAULT_OFFICE_SETTINGS,
    weekend: [...DEFAULT_OFFICE_SETTINGS.weekend],
  });

  useEffect(() => {
    const id = step === 1 ? "companyName" : step === 2 ? "adminName" : "officeStart";
    document.getElementById(id)?.focus();
  }, [step]);

  function onChange(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function onToggleDay(day) {
    setForm((current) => {
      const selected = current.weekend.includes(day);
      const weekend = selected ? current.weekend.filter((item) => item !== day) : [...current.weekend, day];
      return { ...current, weekend };
    });
    setErrors((current) => ({ ...current, weekend: undefined }));
  }

  function onUseLocation() {
    setLocationMessage("");
    setLocating(true);
    readCurrentPosition()
      .then((position) => {
        setForm((current) => ({
          ...current,
          officeLat: position.latitude,
          officeLng: position.longitude,
        }));
      })
      .catch((error) => setLocationMessage(error.message))
      .finally(() => setLocating(false));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate(step, form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) {
      focusField(nextErrors);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    try {
      const user = await completeSetup(buildSetupPayload(form));
      const home = user.mustChangePassword ? "/change-password" : homePathForRole(user.role) || "/admin";
      navigate(home, { replace: true });
    } catch (error) {
      const fieldErrors = flattenServerErrors(error instanceof ApiError ? error.errors : null);
      if (fieldErrors) {
        setErrors(fieldErrors);
        const serverStep = stepForServerErrors(fieldErrors);
        if (serverStep) setStep(serverStep);
        window.setTimeout(() => focusField(fieldErrors), 0);
      }
      setFormError(error.message || "Setup could not be completed.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-card border border-zinc-200 bg-white p-4 shadow-card dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Step {step} of 3</p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{STEP_TITLES[step]}</h1>
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {step === 1 ? "Name the company. You can invite HR after this." : null}
        {step === 2 ? "This person is the first Admin." : null}
        {step === 3 ? "Office hours decide who is late, and the map decides camera check-in." : null}
      </p>
      <div className="mt-4 h-1 bg-zinc-100 dark:bg-zinc-800" aria-hidden="true">
        <div className="h-1 bg-brand-700" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate aria-busy={submitting || undefined}>
        <FormAlert message={formError} />
        {step === 1 ? <CompanyStep form={form} errors={errors} onChange={onChange} /> : null}
        {step === 2 ? <AdminStep form={form} errors={errors} onChange={onChange} /> : null}
        {step === 3 ? (
          <OfficeStep
            form={form}
            errors={errors}
            locating={locating}
            locationMessage={locationMessage}
            onChange={onChange}
            onToggleDay={onToggleDay}
            onUseLocation={onUseLocation}
          />
        ) : null}
        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={submitting}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" loading={submitting}>
            {step === 3 ? "Create company" : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
