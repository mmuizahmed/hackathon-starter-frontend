import { Button } from "./Button";
import { DatePicker } from "./DatePicker";
import { Select } from "./Select";

export function FilterBar({ from = "", to = "", department = "", departments = [], onChange, onClear }) {
  function update(partial) {
    onChange({ from, to, department, ...partial });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="w-full sm:w-44">
        <DatePicker
          name="from"
          label="From"
          value={from}
          onChange={(event) => update({ from: event.target.value })}
        />
      </div>
      <div className="w-full sm:w-44">
        <DatePicker name="to" label="To" value={to} onChange={(event) => update({ to: event.target.value })} />
      </div>
      <div className="w-full sm:w-56">
        <Select
          name="department"
          label="Department"
          placeholder="All departments"
          value={department}
          options={departments}
          onChange={(event) => update({ department: event.target.value })}
        />
      </div>
      {onClear ? (
        <Button variant="secondary" onClick={onClear}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}
