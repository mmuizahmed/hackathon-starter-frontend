import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "../../../components/ui";

function chartColors(theme) {
  const dark = theme === "dark";
  return {
    axis: dark ? "#a1a1aa" : "#52525b",
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

  return (
    <div className="h-64 w-full min-w-0" role="img" aria-label="Attendance rate by day">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.axis, fontSize: 12 }} tickFormatter={(value) => String(value).slice(5)} />
          <YAxis width={40} domain={[0, 100]} tick={{ fill: colors.axis, fontSize: 12 }} unit="%" />
          <Tooltip
            contentStyle={{
              background: colors.tooltipBg,
              border: `1px solid ${colors.grid}`,
              borderRadius: 8,
              color: colors.tooltipText,
              fontSize: 12,
            }}
            formatter={(value) => [`${value}%`, "Attendance"]}
          />
          <Line type="monotone" dataKey="rate" name="Attendance" stroke="#0f766e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
