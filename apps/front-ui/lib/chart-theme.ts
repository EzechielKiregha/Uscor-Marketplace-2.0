/**
 * USCOR Chart Theme — Consistent orange-based palette for all Recharts charts.
 *
 * Usage:
 *   import { CHART_COLORS, CHART_GRADIENT } from "@/lib/chart-theme";
 *   <Bar fill={CHART_COLORS.primary} />
 *   <Cell fill={CHART_COLORS.palette[i % CHART_COLORS.palette.length]} />
 */

export const CHART_COLORS = {
  /** Main chart color — USCOR orange */
  primary: "#f97316",
  /** Lighter variant for secondary series */
  secondary: "#fb923c",
  /** Accent — darker orange for contrast */
  accent: "#ea580c",
  /** Success green (for positive metrics) */
  success: "#22c55e",
  /** Muted for comparison / previous period */
  muted: "#94a3b8",

  /** Ordered palette for pie/donut charts and multi-series */
  palette: [
    "#f97316", // orange-500
    "#fb923c", // orange-400
    "#ea580c", // orange-600
    "#fdba74", // orange-300
    "#c2410c", // orange-700
    "#fed7aa", // orange-200
  ] as const,
} as const;

/** Gradient stop presets for area charts */
export const CHART_GRADIENT = {
  startOpacity: 0.3,
  endOpacity: 0.05,
} as const;

/** Shared tooltip style matching the app's card theme */
export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    fontSize: "0.8125rem",
  },
  labelStyle: {
    fontWeight: 600,
    marginBottom: "0.25rem",
  },
} as const;
