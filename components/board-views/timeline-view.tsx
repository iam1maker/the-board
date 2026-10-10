"use client";

import { useMemo, useState } from "react";
import {
    addDays,
    differenceInCalendarDays,
    eachDayOfInterval,
    format,
    isToday,
    isWeekend,
    startOfDay,
    startOfWeek,
} from "date-fns";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CardWithListInfo } from "@/lib/board-data";
import { formatCardDate } from "@/lib/due-date";
import { LABEL_COLORS, LabelColor } from "@/constants/labels";
import { useCardModal } from "@/hooks/use-card-modal";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { ViewPanel } from "./view-panel";

type Zoom = "week" | "month";

const ZOOMS: Record<
    Zoom,
    { label: string; dayWidth: number; days: number; step: number }
> = {
    week: { label: "Weeks", dayWidth: 44, days: 42, step: 7 },
    month: { label: "Months", dayWidth: 14, days: 126, step: 28 },
};

const SIDEBAR_WIDTH = 240;
const ROW_HEIGHT = 40;
/** Days of context shown before the anchor (e.g. "today") when jumping. */
const LEAD_DAYS = 7;

const rangeStartFor = (date: Date) => startOfWeek(addDays(date, -LEAD_DAYS));

type Span = { start: Date; end: Date };

/** Inclusive day span of a card; a single date gives a one-day bar. */
const cardSpan = (card: CardWithListInfo): Span | null => {
    const start = card.startDate ?? card.dueDate;
    const end = card.dueDate ?? card.startDate;
    if (!start || !end) return null;
    return {
        start: startOfDay(new Date(start)),
        end: startOfDay(new Date(end)),
    };
};

interface TimelineViewProps {
    cards: CardWithListInfo[];
    lists: { id: string; title: string }[];
}

export const TimelineView = ({ cards, lists }: TimelineViewProps) => {
    const [zoom, setZoom] = useState<Zoom>("week");
    const [rangeStart, setRangeStart] = useState(() =>
        rangeStartFor(new Date()),
    );
    const config = ZOOMS[zoom];

    const days = useMemo(
        () =>
            eachDayOfInterval({
                start: rangeStart,
                end: addDays(rangeStart, config.days - 1),
            }),
        [rangeStart, config.days],
    );
    const timelineWidth = days.length * config.dayWidth;

    const groups = useMemo(
        () =>
            lists
                .map((list) => ({
                    list,
                    cards: cards
                        .filter((c) => c.list.id === list.id && cardSpan(c))
                        .sort(
                            (a, b) =>
                                cardSpan(a)!.start.getTime() -
                                cardSpan(b)!.start.getTime(),
                        ),
                }))
                .filter((g) => g.cards.length > 0),
        [cards, lists],
    );
    const unscheduled = cards.filter((c) => !cardSpan(c));

    const months = useMemo(() => {
        const segments: { label: string; days: number }[] = [];
        for (const day of days) {
            const label = format(day, "MMMM yyyy");
            const last = segments[segments.length - 1];
            if (last?.label === label) last.days += 1;
            else segments.push({ label, days: 1 });
        }
        return segments;
    }, [days]);

    const todayOffset = differenceInCalendarDays(new Date(), rangeStart);
    const shift = (direction: 1 | -1) =>
        setRangeStart((d) => addDays(d, direction * config.step));

    return (
        <ViewPanel
            title="Timeline"
            description={`${format(days[0], "MMM d")} – ${format(days[days.length - 1], "MMM d, yyyy")}${
                unscheduled.length
                    ? ` · ${unscheduled.length} without dates`
                    : ""
            }`}
            toolbar={
                <div className="flex items-center gap-1">
                    <NativeSelect
                        aria-label="Zoom"
                        value={zoom}
                        onChange={(e) => setZoom(e.target.value as Zoom)}
                    >
                        {(Object.keys(ZOOMS) as Zoom[]).map((key) => (
                            <option key={key} value={key}>
                                {ZOOMS[key].label}
                            </option>
                        ))}
                    </NativeSelect>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-1 h-8"
                        onClick={() => setRangeStart(rangeStartFor(new Date()))}
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Earlier"
                        onClick={() => shift(-1)}
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Later"
                        onClick={() => shift(1)}
                    >
                        <ChevronRight className="h-4 w-4" aria-hidden />
                    </Button>
                </div>
            }
        >
            {groups.length === 0 && unscheduled.length === 0 ? (
                <div className="flex h-full min-h-[200px] items-center justify-center p-8 text-sm text-muted-foreground">
                    This board has no cards yet.
                </div>
            ) : (
                <div
                    className="relative"
                    style={{ width: SIDEBAR_WIDTH + timelineWidth }}
                >
                    {/* Header: months + days */}
                    <div className="sticky top-0 z-20 flex border-b bg-card">
                        <div
                            className="sticky left-0 z-10 flex items-end border-r bg-card px-4 pb-2 text-xs font-semibold text-muted-foreground"
                            style={{
                                width: SIDEBAR_WIDTH,
                                minWidth: SIDEBAR_WIDTH,
                            }}
                        >
                            Card
                        </div>
                        <div style={{ width: timelineWidth }}>
                            <div className="flex border-b">
                                {months.map((m) => (
                                    <div
                                        key={m.label}
                                        className="truncate border-r px-2 py-1 text-xs font-semibold text-foreground"
                                        style={{
                                            width: m.days * config.dayWidth,
                                        }}
                                    >
                                        {m.days * config.dayWidth > 80
                                            ? m.label
                                            : ""}
                                    </div>
                                ))}
                            </div>
                            <div className="flex">
                                {days.map((day) => (
                                    <div
                                        key={day.toISOString()}
                                        className={cn(
                                            "py-1 text-center text-[11px] tabular-nums text-muted-foreground",
                                            isWeekend(day) && "bg-muted/60",
                                            isToday(day) &&
                                                "font-semibold text-primary",
                                        )}
                                        style={{ width: config.dayWidth }}
                                    >
                                        {zoom === "week" || day.getDay() === 1
                                            ? format(day, "d")
                                            : ""}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="relative">
                        {/* Weekend shading + today line behind the rows */}
                        <div
                            className="pointer-events-none absolute inset-y-0 flex"
                            style={{ left: SIDEBAR_WIDTH }}
                            aria-hidden
                        >
                            {days.map((day) => (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "h-full",
                                        isWeekend(day) && "bg-muted/60",
                                    )}
                                    style={{ width: config.dayWidth }}
                                />
                            ))}
                            {todayOffset >= 0 && todayOffset < days.length && (
                                <div
                                    className="absolute inset-y-0 w-0.5 bg-primary"
                                    style={{
                                        left:
                                            todayOffset * config.dayWidth +
                                            config.dayWidth / 2 -
                                            1,
                                    }}
                                />
                            )}
                        </div>

                        {groups.map(({ list, cards: listCards }) => (
                            <div
                                key={list.id}
                                role="rowgroup"
                                aria-label={list.title}
                            >
                                <GroupHeader
                                    title={list.title}
                                    count={listCards.length}
                                />
                                {listCards.map((card) => (
                                    <TimelineRow
                                        key={card.id}
                                        card={card}
                                        rangeStart={rangeStart}
                                        dayCount={days.length}
                                        dayWidth={config.dayWidth}
                                        onJump={(date) =>
                                            setRangeStart(rangeStartFor(date))
                                        }
                                    />
                                ))}
                            </div>
                        ))}

                        {unscheduled.length > 0 && (
                            <div role="rowgroup" aria-label="No dates">
                                <GroupHeader
                                    title="No dates"
                                    count={unscheduled.length}
                                />
                                {unscheduled.map((card) => (
                                    <TimelineRow
                                        key={card.id}
                                        card={card}
                                        rangeStart={rangeStart}
                                        dayCount={days.length}
                                        dayWidth={config.dayWidth}
                                        onJump={() => {}}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ViewPanel>
    );
};

const GroupHeader = ({ title, count }: { title: string; count: number }) => (
    <div className="relative flex border-b bg-muted/70" style={{ height: 32 }}>
        <div
            className="sticky left-0 z-10 flex items-center gap-x-2 border-r bg-muted px-4 text-xs font-semibold text-foreground"
            style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH }}
        >
            <span className="truncate">{title}</span>
            <span className="rounded-full bg-black/5 px-1.5 text-muted-foreground">
                {count}
            </span>
        </div>
    </div>
);

interface TimelineRowProps {
    card: CardWithListInfo;
    rangeStart: Date;
    dayCount: number;
    dayWidth: number;
    onJump: (date: Date) => void;
}

const TimelineRow = ({
    card,
    rangeStart,
    dayCount,
    dayWidth,
    onJump,
}: TimelineRowProps) => {
    const cardModal = useCardModal();
    const span = cardSpan(card);
    const open = () => cardModal.onOpen(card.id);

    const startIdx = span
        ? differenceInCalendarDays(span.start, rangeStart)
        : 0;
    const endIdx = span ? differenceInCalendarDays(span.end, rangeStart) : 0;
    const isBefore = span && endIdx < 0;
    const isAfter = span && startIdx >= dayCount;
    const visibleStart = Math.max(startIdx, 0);
    const visibleEnd = Math.min(endIdx, dayCount - 1);

    const firstLabel = card.labels[0]?.label;
    const barColor = card.completed
        ? "bg-emerald-600 text-white"
        : firstLabel
          ? LABEL_COLORS[firstLabel.color as LabelColor]?.className
          : "bg-primary text-primary-foreground";

    const dateText = span
        ? card.startDate && card.dueDate
            ? `${formatCardDate(card.startDate)} – ${formatCardDate(card.dueDate)}`
            : card.dueDate
              ? `Due ${formatCardDate(card.dueDate)}`
              : `Starts ${formatCardDate(card.startDate!)}`
        : "No dates";

    return (
        <div
            className="relative flex border-b"
            style={{ height: ROW_HEIGHT }}
            role="row"
        >
            <div
                className="sticky left-0 z-10 flex items-center border-r bg-card px-4"
                style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH }}
                role="rowheader"
            >
                <button
                    type="button"
                    onClick={open}
                    className="flex min-w-0 items-center gap-x-1.5 text-left text-sm text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {card.completed && (
                        <CheckCircle2
                            className="h-4 w-4 shrink-0 text-emerald-600"
                            aria-label="Complete"
                        />
                    )}
                    <span className="truncate">{card.title}</span>
                </button>
            </div>
            <div className="relative flex-1" role="gridcell">
                {!span ? (
                    <button
                        type="button"
                        onClick={open}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                        Set dates
                    </button>
                ) : isBefore || isAfter ? (
                    <button
                        type="button"
                        onClick={() => onJump(span.start)}
                        className={cn(
                            "absolute top-1/2 inline-flex -translate-y-1/2 items-center gap-x-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
                            isBefore ? "left-1" : "right-1",
                        )}
                        aria-label={`${card.title}: ${dateText}. Jump to dates`}
                    >
                        {isBefore && (
                            <ArrowLeft className="h-3 w-3" aria-hidden />
                        )}
                        {dateText}
                        {isAfter && (
                            <ArrowRight className="h-3 w-3" aria-hidden />
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={open}
                        title={`${card.title} · ${dateText}`}
                        aria-label={`${card.title}: ${dateText}`}
                        className={cn(
                            "absolute top-1/2 flex h-6 -translate-y-1/2 items-center overflow-hidden rounded-md px-2 text-xs font-medium shadow-sm transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                            barColor,
                            startIdx < 0 && "rounded-l-none",
                            endIdx >= dayCount && "rounded-r-none",
                        )}
                        style={{
                            left: visibleStart * dayWidth + 2,
                            width:
                                (visibleEnd - visibleStart + 1) * dayWidth - 4,
                        }}
                    >
                        {(visibleEnd - visibleStart + 1) * dayWidth > 90 && (
                            <span className="truncate">{card.title}</span>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
