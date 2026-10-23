import type { ReactNode } from "react";

export type ChartPoint = { label: string; value: number };

function nice(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toFixed(1);
}

export function Ring({
  value,
  max,
  label,
  detail,
  size = 148,
  color = "#5f8a35",
}: {
  value: number;
  max: number;
  label: string;
  detail?: string;
  size?: number;
  color?: string;
}) {
  const safeMax = Math.max(1, max);
  const progress = Math.max(0, Math.min(1, value / safeMax));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="ring-chart" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" role="img" aria-label={`${label}: ${Math.round(value)} of ${Math.round(max)}`}>
        <circle className="ring-track" cx="70" cy="70" r={radius} />
        <circle
          className="ring-progress"
          cx="70"
          cy="70"
          r={radius}
          stroke={color}
          strokeDasharray={`${circumference * progress} ${circumference}`}
        />
      </svg>
      <div className="ring-label">
        <strong>{nice(value)}</strong>
        <small>{detail || `/ ${nice(max)}`}</small>
      </div>
    </div>
  );
}

export function LineChart({
  data,
  height = 150,
  color = "#5f8a35",
  zeroBased = false,
  suffix = "",
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
  zeroBased?: boolean;
  suffix?: string;
}) {
  if (!data.length) return <ChartEmpty />;
  const width = 360;
  const padX = 14;
  const padTop = 18;
  const padBottom = 30;
  const values = data.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const range = Math.max(1, rawMax - rawMin);
  const min = zeroBased ? 0 : Math.max(0, rawMin - range * 0.22);
  const max = rawMax + range * 0.22 || 1;
  const x = (index: number) => padX + (index / Math.max(1, data.length - 1)) * (width - padX * 2);
  const y = (value: number) => padTop + (1 - (value - min) / Math.max(1, max - min)) * (height - padTop - padBottom);
  const line = data.map((point, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${height - padBottom} L${x(0).toFixed(1)},${height - padBottom} Z`;

  return (
    <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={data.map((point) => `${point.label}: ${point.value}${suffix}`).join(", ")}>
      <defs>
        <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((fraction) => (
        <line key={fraction} className="chart-grid" x1={padX} x2={width - padX} y1={padTop + fraction * (height - padTop - padBottom)} y2={padTop + fraction * (height - padTop - padBottom)} />
      ))}
      <path d={area} fill={`url(#fill-${color.replace("#", "")})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((point, index) => (
        <g key={`${point.label}-${index}`}>
          <circle cx={x(index)} cy={y(point.value)} r="4" fill="#fff" stroke={color} strokeWidth="2.5">
            <title>{`${point.label}: ${point.value}${suffix}`}</title>
          </circle>
          {(data.length <= 8 || index === 0 || index === data.length - 1 || index === Math.floor(data.length / 2)) && (
            <text className="chart-label" x={x(index)} y={height - 8} textAnchor="middle">{point.label}</text>
          )}
        </g>
      ))}
      <text className="chart-value" x={width - padX} y={padTop - 4} textAnchor="end">{nice(rawMax)}{suffix}</text>
    </svg>
  );
}

export function BarChart({
  data,
  height = 160,
  color = "#5f8a35",
  suffix = "",
}: {
  data: ChartPoint[];
  height?: number;
  color?: string;
  suffix?: string;
}) {
  if (!data.length) return <ChartEmpty />;
  const width = 360;
  const padX = 10;
  const padTop = 18;
  const padBottom = 30;
  const max = Math.max(1, ...data.map((point) => point.value));
  const slot = (width - padX * 2) / data.length;
  const barWidth = Math.min(34, slot * 0.58);
  return (
    <svg className="bar-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={data.map((point) => `${point.label}: ${point.value}${suffix}`).join(", ")}>
      {[0, 0.5, 1].map((fraction) => (
        <line key={fraction} className="chart-grid" x1={padX} x2={width - padX} y1={padTop + fraction * (height - padTop - padBottom)} y2={padTop + fraction * (height - padTop - padBottom)} />
      ))}
      {data.map((point, index) => {
        const barHeight = Math.max(2, (point.value / max) * (height - padTop - padBottom));
        const x = padX + index * slot + (slot - barWidth) / 2;
        return (
          <g key={`${point.label}-${index}`}>
            <rect x={x} y={height - padBottom - barHeight} width={barWidth} height={barHeight} rx="6" fill={color} opacity={point.value ? 0.9 : 0.18}>
              <title>{`${point.label}: ${point.value}${suffix}`}</title>
            </rect>
            <text className="chart-label" x={x + barWidth / 2} y={height - 8} textAnchor="middle">{point.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function MacroBar({
  protein,
  carbs,
  fat,
  targets,
}: {
  protein: number;
  carbs: number;
  fat: number;
  targets: { protein: number; carbs: number; fat: number };
}) {
  const total = Math.max(1, protein * 4 + carbs * 4 + fat * 9);
  const targetTotal = Math.max(1, targets.protein * 4 + targets.carbs * 4 + targets.fat * 9);
  return (
    <div className="macro-bars">
      {[
        { label: "Protein", value: protein, target: targets.protein, color: "#5f8a35", calorie: protein * 4 },
        { label: "Carbs", value: carbs, target: targets.carbs, color: "#d19a38", calorie: carbs * 4 },
        { label: "Fat", value: fat, target: targets.fat, color: "#bc6a56", calorie: fat * 9 },
      ].map((macro) => (
        <div className="macro-row" key={macro.label}>
          <span>{macro.label}<small>{Math.round(macro.value)} / {macro.target} g</small></span>
          <div><i style={{ width: `${Math.min(100, (macro.value / Math.max(1, macro.target)) * 100)}%`, background: macro.color }} /></div>
          <small>{Math.round((macro.calorie / total) * 100)}% of logged kcal</small>
        </div>
      ))}
      <div className="macro-legend">Target split: {Math.round((targets.protein * 4 / targetTotal) * 100)}% protein · {Math.round((targets.carbs * 4 / targetTotal) * 100)}% carbs · {Math.round((targets.fat * 9 / targetTotal) * 100)}% fat</div>
    </div>
  );
}

export function ChartEmpty({ children }: { children?: ReactNode }) {
  return <div className="chart-empty"><span>—</span><p>{children || "Log a few days to see your trend."}</p></div>;
}

export function StatCard({
  icon,
  label,
  value,
  detail,
  tone = "green",
  action,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "green" | "blue" | "amber" | "rose";
  action?: ReactNode;
}) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <span className="stat-icon">{icon}</span>
      <small>{label}</small>
      <b>{value}</b>
      <p>{detail}</p>
      {action}
    </article>
  );
}
