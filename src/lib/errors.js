export function messageFrom(error, fallback = "Something went wrong.") {
  if (!error || error.name === "AbortError") return "";
  return error.message || fallback;
}

export function fieldMessage(errors, name) {
  if (!errors || !name) return undefined;
  if (errors[name]) return errors[name];
  const match = Object.entries(errors).find(([key]) => key === name || key.endsWith(`.${name}`));
  return match?.[1];
}
