import { Field, fieldDescribedBy } from "./Field";
import { controlClasses } from "./styles";

export function Textarea({ id, name, label, hint, error, className = "", required = false, rows = 4, ...props }) {
  const textareaId = id || name;

  return (
    <Field id={textareaId} label={label} hint={hint} error={error}>
      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(textareaId, { hint, error })}
        className={controlClasses({
          error,
          className: `h-auto min-h-24 py-2 ${className}`,
        })}
        {...props}
      />
    </Field>
  );
}
