"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GOLD = "#c6a15b";
const BURGUNDY = "#541323";
const PIE_COLORS = ["#059669", "#2563eb", "#d97706", "#e11d48"];

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white p-3 shadow-lg shadow-zinc-900/5">
      {label && <p className="mb-1 text-xs font-semibold text-zinc-800">{label}</p>}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color || BURGUNDY }}
            />
            <span className="font-medium text-zinc-600">{item.name}:</span>
            <span className="font-semibold text-zinc-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendChart({
  data,
}: {
  data: Array<{ day: string; count: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#71717a", fontFamily: "Inter" }}
          tickFormatter={(d: string) => d.slice(5)}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#71717a", fontFamily: "Inter" }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          name="Registrations"
          fill={BURGUNDY}
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendancePie({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  if (data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-center text-xs font-medium text-zinc-400">
          No attendance responses yet
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          strokeWidth={1}
          stroke="#ffffff"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, fontFamily: "Inter", paddingTop: 8 }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GroupBars({
  data,
}: {
  data: Array<{ name: string; count: number; checkedIn: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 48)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 24, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#71717a", fontFamily: "Inter" }}
          allowDecimals={false}
          axisLine={{ stroke: "#e4e4e7" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 11, fill: "#52525b", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, fontFamily: "Inter", paddingTop: 8 }}
          iconType="circle"
        />
        <Bar
          dataKey="count"
          name="Guests"
          fill={GOLD}
          radius={[0, 4, 4, 0]}
          maxBarSize={16}
        />
        <Bar
          dataKey="checkedIn"
          name="Checked in"
          fill={BURGUNDY}
          radius={[0, 4, 4, 0]}
          maxBarSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
