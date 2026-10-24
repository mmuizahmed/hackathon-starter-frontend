import { Input } from "./Input";

// Native date input so we do not ship a second calendar widget.
export function DatePicker(props) {
  return <Input type="date" {...props} />;
}
