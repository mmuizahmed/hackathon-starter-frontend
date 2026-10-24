import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "../../../components/ui";

function chartColors(theme) {
  const dark = theme === "dark";
  return {
    axis: dark ? "#d4d4d8" : "#52525b",
    grid: dark ? "#3f3f46" : "#e4e4e7",
    tooltipBg: dark ? "#18181b" : "#ffffff",
    tooltipText: dark ? "#fafafa" : "#18181b",
  };
}

export function CategoryChart({
  data = [],
  nameKey,
  valueKey,
  valueLabel,
  theme = "light",
  formatValue,
  emptyTitle = "No figures",
  emptyMessage = "This chart fills in when the selected range has records.",
}) {
  const rows = data.filter((row) => row && row[nameKey]);
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  const colors = chartColors(theme);
  const height = Math.max(220, rows.length * 36);

  return (
    <div className="w-full min-w-0" style={{ height }} role="img" aria-label={valueLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid stroke={colors.grid} horizontal={false} />
          <XAxis type="number" stroke={colors.axis} tick={{ fill: colors.axis, fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey={nameKey}
            width={108}
            stroke={colors.axis}
            tick={{ fill: colors.axis, fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: colors.tooltipBg,
              border: `1px solid ${colors.grid}`,
              borderRadius: 8,
              color: colors.tooltipText,
              fontSize: 12,
            }}
            formatter={(value) => [formatValue ? formatValue(value) : value, valueLabel]}
          />
          <Bar dataKey={valueKey} name={valueLabel} fill="#0f766e" maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
