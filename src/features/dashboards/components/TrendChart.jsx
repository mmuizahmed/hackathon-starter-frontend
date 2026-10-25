import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "../../../components/ui";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-10-05" becomes "5 Oct".
function shortDay(value) {
  const [, month, day] = String(value).split("-");
  if (!month || !day) return String(value);
  return `${Number(day)} ${MONTHS[Number(month) - 1] || month}`;
}

function chartColors(theme) {
  const dark = theme === "dark";
  return {
    axis: dark ? "#d4d4d8" : "#52525b",
    grid: dark ? "#3f3f46" : "#e4e4e7",
    tooltipBg: dark ? "#18181b" : "#ffffff",
    tooltipText: dark ? "#fafafa" : "#18181b",
  };
}

export function TrendChart({ data = [], theme = "light" }) {
  if (!data.length) {
    return (
      <EmptyState
        title="No attendance trend"
        message="Rates show up after working days in this range have a status."
      />
    );
  }

  const colors = chartColors(theme);
  // A 0% series sits on the axis. Markers keep that line visible.
  const flatZero = data.every((point) => Number(point.rate) === 0);

  return (
    <div className="w-full min-w-0">
      <div className="h-64" role="img" aria-label="Attendance rate by day">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={colors.axis}
              tick={{ fill: colors.axis, fontSize: 12 }}
              tickFormatter={shortDay}
              minTickGap={16}
            />
            <YAxis width={48} domain={[0, 100]} stroke={colors.axis} tick={{ fill: colors.axis, fontSize: 12 }} unit="%" />
            <Tooltip
              contentStyle={{
                background: colors.tooltipBg,
                border: `1px solid ${colors.grid}`,
                borderRadius: 8,
                color: colors.tooltipText,
                fontSize: 12,
              }}
              labelFormatter={shortDay}
              formatter={(value) => [`${value}%`, "Attendance"]}
            />
            <Line
              type="monotone"
              dataKey="rate"
              name="Attendance"
              stroke="#0f766e"
              strokeWidth={2}
              dot={{ r: 3, fill: "#0f766e", stroke: "#0f766e" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {flatZero ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Attendance is 0% on every day in this range.</p>
      ) : null}
    </div>
  );
}
