import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { minutesToLabel } from "../../utils/format";

const PRESENT_COLOR = "#22C55E"; // green
const LATE_COLOR = "#EAB308"; // yellow

export default function AttendanceChartCard({ days }) {
  const data = useMemo(
    () =>
      days
        .filter((d) => d.status === "present" || d.status === "late")
        .map((d) => ({ day: d.day, minutes: d.inMin, status: d.status })),
    [days]
  );

  const yDomain = useMemo(() => {
    if (!data.length) return [480, 660];
    const values = data.map((d) => d.minutes);
    return [Math.min(...values) - 20, Math.max(...values) + 20];
  }, [data]);

  return (
    <div className="tp-card p-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="font-semibold">Punch-in times</span>
          <p className="text-xs mt-0.5" style={{ color: "var(--tp-ink-soft)" }}>
            This month, day by day
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--tp-ink-soft)" }}>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: PRESENT_COLOR, display: "inline-block" }} />
            On time
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: LATE_COLOR, display: "inline-block" }} />
            Late
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-sm mt-6" style={{ color: "var(--tp-ink-soft)" }}>
          No punch-in data yet this month.
        </p>
      ) : (
        <div style={{ marginTop: "0.75rem" }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--tp-border)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "var(--tp-ink-soft)" }}
                stroke="var(--tp-border)"
              />
              <YAxis
                domain={yDomain}
                tickFormatter={minutesToLabel}
                tick={{ fontSize: 11, fill: "var(--tp-ink-soft)" }}
                stroke="var(--tp-border)"
                width={78}
              />
              <Tooltip
                formatter={(value) => [minutesToLabel(value), "Punched in"]}
                labelFormatter={(label) => `Day ${label}`}
                contentStyle={{
                  background: "var(--tp-surface)",
                  border: "1px solid var(--tp-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={22}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.status === "late" ? LATE_COLOR : PRESENT_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
