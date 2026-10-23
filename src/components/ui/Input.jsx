export function Input({
  id,
  name,
  label,
  hint,
  error,
  className = "",
  ...props
}) {
  const inputId = id || name;

  return (
    <div>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-stone-700"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        name={name}
        className={[
          "w-full rounded-md border bg-white px-3 py-2 text-sm text-stone-900",
          "placeholder:text-stone-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          error ? "border-red-500" : "border-stone-300",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-sm text-red-700">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-sm text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}
