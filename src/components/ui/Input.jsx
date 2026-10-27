import { Field, fieldDescribedBy } from "./Field";
import { controlClasses } from "./styles";

// `trailing` is an optional element (like an icon button) shown inside the right edge of the input.
export function Input({ id, name, label, hint, error, className = "", required = false, trailing = null, ...props }) {
  const inputId = id || name;

  const input = (
    <input
      id={inputId}
      name={name}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={fieldDescribedBy(inputId, { hint, error })}
      className={controlClasses({ error, className })}
      {...props}
    />
  );

  return (
    <Field id={inputId} label={label} hint={hint} error={error}>
      {trailing ? (
        <div className="relative">
          {input}
          <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>
        </div>
      ) : (
        input
      )}
    </Field>
  );
}
