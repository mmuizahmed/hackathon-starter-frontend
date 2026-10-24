import { Field, fieldDescribedBy } from "./Field";
import { controlClasses } from "./styles";

export function Input({ id, name, label, hint, error, className = "", required = false, ...props }) {
  const inputId = id || name;

  return (
    <Field id={inputId} label={label} hint={hint} error={error}>
      <input
        id={inputId}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(inputId, { hint, error })}
        className={controlClasses({ error, className })}
        {...props}
      />
    </Field>
  );
}
