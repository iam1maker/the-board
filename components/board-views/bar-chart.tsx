"use client";

import { cn } from "@/lib/utils";

/**
 * Horizontal bar chart in plain HTML, following the dataviz mark specs:
 * bars <= 24px thick, 4px rounded data-end (square at the baseline), a 2px
 * surface gap between stacked segments, value at the bar tip, per-row hover/focus
 * tooltip. Text always uses text tokens; color is only on the marks.
 */

export type BarSegment = {
    name: string;
    value: number;
    /** Background color for the mark (hex or CSS color). */
    color: string;
};

export type BarRow = {
    key: string;
    label: React.ReactNode;
    /** Plain-text version of the label for the tooltip / aria. */
    labelText: string;
    segments: BarSegment[];
};

interface HBarChartProps {
    rows: BarRow[];
    /** Shown when every row is zero / there are no rows. */
    emptyText?: string;
    /** Legend entries; only pass for >= 2 series. */
    legend?: { name: string; color: string }[];
}

const BAR_HEIGHT = 20;
const LABEL_WIDTH = "9rem";

export const HBarChart = ({
    rows,
    emptyText = "No data yet",
    legend,
}: HBarChartProps) => {
    const max = Math.max(
        0,
        ...rows.map((r) => r.segments.reduce((sum, s) => sum + s.value, 0)),
    );

    if (rows.length === 0 || max === 0) {
        return (
            <p className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
            </p>
        );
    }

    return (
        <div>
            {legend && legend.length >= 2 && (
                <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {legend.map((item) => (
                        <li
                            key={item.name}
                            className="flex items-center gap-x-1.5"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-sm"
                                style={{ background: item.color }}
                                aria-hidden
                            />
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}
            <ul className="space-y-2.5">
                {rows.map((row) => {
                    const total = row.segments.reduce(
                        (sum, s) => sum + s.value,
                        0,
                    );
                    const breakdown = row.segments
                        .filter((s) => s.value > 0)
                        .map((s) => `${s.value} ${s.name}`)
                        .join(", ");
                    const visible = row.segments.filter((s) => s.value > 0);
                    return (
                        <li
                            key={row.key}
                            tabIndex={0}
                            aria-label={`${row.labelText}: ${total}${breakdown && visible.length > 1 ? ` (${breakdown})` : ""}`}
                            className="group relative grid items-center gap-x-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            style={{
                                gridTemplateColumns: `${LABEL_WIDTH} 1fr`,
                            }}
                        >
                            <span
                                className="truncate text-sm text-foreground"
                                aria-hidden
                            >
                                {row.label}
                            </span>
                            <span
                                className="flex items-center gap-x-2"
                                aria-hidden
                            >
                                <span
                                    className="flex overflow-hidden"
                                    style={{
                                        width: `${(total / max) * 85}%`,
                                        height: BAR_HEIGHT,
                                    }}
                                >
                                    {visible.map((segment, i) => (
                                        <span
                                            key={segment.name}
                                            className={cn(
                                                "h-full",
                                                i > 0 &&
                                                    "border-l-2 border-card",
                                                i === visible.length - 1 &&
                                                    "rounded-r",
                                            )}
                                            style={{
                                                width: `${(segment.value / total) * 100}%`,
                                                background: segment.color,
                                            }}
                                        />
                                    ))}
                                </span>
                                <span className="text-xs font-medium tabular-nums text-foreground">
                                    {total}
                                </span>
                            </span>
                            {/* Hover / focus tooltip */}
                            <span
                                role="tooltip"
                                className="pointer-events-none absolute -top-2 left-[9.75rem] z-10 hidden -translate-y-full whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block"
                            >
                                <span className="block font-semibold">
                                    {row.labelText}
                                </span>
                                {visible.map((s) => (
                                    <span
                                        key={s.name}
                                        className="flex items-center gap-x-1.5"
                                    >
                                        <span
                                            className="h-2 w-2 rounded-sm"
                                            style={{ background: s.color }}
                                        />
                                        {s.name}:{" "}
                                        <span className="tabular-nums">
                                            {s.value}
                                        </span>
                                    </span>
                                ))}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
