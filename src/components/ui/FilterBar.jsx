import { Button } from "./Button";
import { DatePicker } from "./DatePicker";
import { Select } from "./Select";

// Phones: From and To share a row, department and Clear share the next one.
export function FilterBar({ from = "", to = "", department = "", departments = [], onChange, onClear }) {
  function update(partial) {
    onChange({ from, to, department, ...partial });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
      <div className="min-w-0 sm:w-44">
        <DatePicker
          name="from"
          label="From"
          value={from}
          onChange={(event) => update({ from: event.target.value })}
        />
      </div>
      <div className="min-w-0 sm:w-44">
        <DatePicker name="to" label="To" value={to} onChange={(event) => update({ to: event.target.value })} />
      </div>
      <div className={onClear ? "min-w-0 sm:w-56" : "col-span-2 min-w-0 sm:w-56"}>
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
        <div className="flex items-end">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClear}>
            Clear
          </Button>
        </div>
      ) : null}
    </div>
  );
}
