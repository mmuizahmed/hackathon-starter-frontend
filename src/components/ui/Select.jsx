import { ChevronDown } from "lucide-react";
import { Field, fieldDescribedBy } from "./Field";
import { controlClasses } from "./styles";

export function Select({
  id,
  name,
  label,
  hint,
  error,
  options = [],
  placeholder,
  className = "",
  required = false,
  ...props
}) {
  const selectId = id || name;

  return (
    <Field id={selectId} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={selectId}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(selectId, { hint, error })}
          className={controlClasses({ error, className: `appearance-none pr-9 ${className}` })}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}
