"use client";

import { useEffect, useMemo, useState } from "react";
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { CardWithListInfo } from "@/lib/board-data";
import { DUE_STATUS_STYLES, getDueStatus } from "@/lib/due-date";
import { useAction } from "@/hooks/use-action";
import { useCardModal } from "@/hooks/use-card-modal";
import { updateCard } from "@/actions/update-card";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ViewPanel } from "./view-panel";

const MAX_CARDS_PER_DAY = 3;
const DAY_KEY = "yyyy-MM-dd";
const DRAG_TYPE = "application/x-taskify-card";

/** Status → left stripe on a calendar chip (the chip's text/aria label carries the meaning too). */
const STRIPE: Record<ReturnType<typeof getDueStatus>, string> = {
    complete: "border-l-emerald-600",
    overdue: "border-l-red-600",
    "due-soon": "border-l-amber-400",
    upcoming: "border-l-primary",
};

interface CalendarViewProps {
    boardId: string;
    cards: CardWithListInfo[];
}

export const CalendarView = ({ boardId, cards }: CalendarViewProps) => {
    const [month, setMonth] = useState(() => startOfMonth(new Date()));
    // Optimistic due dates while a drag-and-drop reschedule is saving.
    const [moved, setMoved] = useState<Record<string, Date>>({});
    const [dropTarget, setDropTarget] = useState<string | null>(null);

    // Fresh server data (after revalidation or edits in the card modal) replaces
    // any optimistic overrides.
    useEffect(() => {
        setMoved({});
    }, [cards]);

    const { execute } = useAction(updateCard, {
        onSuccess: (card) => {
            toast.success(
                `"${card.title}" moved to ${format(new Date(card.dueDate!), "MMM d")}`,
            );
        },
        onError: (error) => {
            toast.error(error);
            setMoved({});
        },
    });

    const days = useMemo(
        () =>
            eachDayOfInterval({
                start: startOfWeek(startOfMonth(month)),
                end: endOfWeek(endOfMonth(month)),
            }),
        [month],
    );

    const cardsByDay = useMemo(() => {
        const map = new Map<string, CardWithListInfo[]>();
        for (const card of cards) {
            const due = moved[card.id] ?? card.dueDate;
            if (!due) continue;
            const key = format(new Date(due), DAY_KEY);
            map.set(key, [
                ...(map.get(key) ?? []),
                { ...card, dueDate: new Date(due) },
            ]);
        }
        for (const list of Array.from(map.values())) {
            list.sort(
                (a, b) =>
                    new Date(a.dueDate!).getTime() -
                    new Date(b.dueDate!).getTime(),
            );
        }
        return map;
    }, [cards, moved]);

    const unscheduled = cards.filter((c) => !c.dueDate).length;

    const reschedule = (cardId: string, day: Date) => {
        const card = cards.find((c) => c.id === cardId);
        if (!card) return;
        const current = new Date(moved[cardId] ?? card.dueDate ?? day);
        const next = new Date(day);
        // Keep the original time of day; only the date changes.
        next.setHours(current.getHours(), current.getMinutes(), 0, 0);
        if (card.startDate && new Date(card.startDate) > next) {
            toast.error("Due date can't be before the start date.");
            return;
        }
        if (
            card.dueDate &&
            format(new Date(card.dueDate), DAY_KEY) === format(next, DAY_KEY)
        ) {
            return;
        }
        setMoved((prev) => ({ ...prev, [cardId]: next }));
        execute({ id: cardId, boardId, dueDate: next });
    };

    return (
        <ViewPanel
            title={format(month, "MMMM yyyy")}
            description={
                unscheduled > 0
                    ? `${unscheduled} ${unscheduled === 1 ? "card has" : "cards have"} no due date · drag a card to another day to reschedule`
                    : "Drag a card to another day to reschedule"
            }
            toolbar={
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => setMonth(startOfMonth(new Date()))}
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Previous month"
                        onClick={() => setMonth((m) => addMonths(m, -1))}
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Next month"
                        onClick={() => setMonth((m) => addMonths(m, 1))}
                    >
                        <ChevronRight className="h-4 w-4" aria-hidden />
                    </Button>
                </div>
            }
        >
            <div className="flex min-h-full min-w-[720px] flex-col">
                <div
                    className="grid grid-cols-7 border-b text-xs font-semibold text-muted-foreground"
                    role="row"
                >
                    {days.slice(0, 7).map((day) => (
                        <div
                            key={day.toISOString()}
                            className="px-2 py-2"
                            role="columnheader"
                        >
                            {format(day, "EEE")}
                        </div>
                    ))}
                </div>
                <div
                    className="grid flex-1 grid-cols-7"
                    // Weeks share the panel height evenly, never shorter than a usable cell.
                    style={{
                        gridTemplateRows: `repeat(${days.length / 7}, minmax(112px, 1fr))`,
                    }}
                    role="grid"
                    aria-label={format(month, "MMMM yyyy")}
                >
                    {days.map((day) => {
                        const key = format(day, DAY_KEY);
                        const dayCards = cardsByDay.get(key) ?? [];
                        const visible = dayCards.slice(0, MAX_CARDS_PER_DAY);
                        const hidden = dayCards.length - visible.length;
                        const inMonth = isSameMonth(day, month);
                        return (
                            <div
                                key={key}
                                role="gridcell"
                                aria-label={`${format(day, "EEEE, MMMM d")}, ${dayCards.length} cards`}
                                onDragOver={(e) => {
                                    if (
                                        !e.dataTransfer.types.includes(
                                            DRAG_TYPE,
                                        )
                                    )
                                        return;
                                    e.preventDefault();
                                    setDropTarget(key);
                                }}
                                onDragLeave={() =>
                                    setDropTarget((t) => (t === key ? null : t))
                                }
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDropTarget(null);
                                    const cardId =
                                        e.dataTransfer.getData(DRAG_TYPE);
                                    if (cardId) reschedule(cardId, day);
                                }}
                                className={cn(
                                    "border-b border-r p-1.5 transition-colors [&:nth-child(7n)]:border-r-0",
                                    !inMonth && "bg-muted/40",
                                    dropTarget === key && "bg-secondary",
                                )}
                            >
                                <div className="mb-1 flex justify-end">
                                    <span
                                        className={cn(
                                            "flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs tabular-nums",
                                            inMonth
                                                ? "text-foreground"
                                                : "text-muted-foreground",
                                            isToday(day) &&
                                                "bg-primary font-semibold text-primary-foreground",
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>
                                </div>
                                <ul className="space-y-1">
                                    {visible.map((card) => (
                                        <li key={card.id}>
                                            <CalendarChip card={card} />
                                        </li>
                                    ))}
                                </ul>
                                {hidden > 0 && (
                                    <MoreCards
                                        day={day}
                                        cards={dayCards}
                                        count={hidden}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </ViewPanel>
    );
};

const CalendarChip = ({ card }: { card: CardWithListInfo }) => {
    const cardModal = useCardModal();
    const status = getDueStatus(card.dueDate!, card.completed);
    const statusLabel = DUE_STATUS_STYLES[status].label;

    return (
        <button
            type="button"
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_TYPE, card.id);
                e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => cardModal.onOpen(card.id)}
            title={`${card.title} · ${card.list.title}`}
            aria-label={`${card.title}, due ${format(new Date(card.dueDate!), "h:mm a")}${statusLabel ? `, ${statusLabel}` : ""}`}
            className={cn(
                "flex w-full cursor-grab items-center gap-x-1 rounded border border-l-[3px] bg-card px-1.5 py-1 text-left text-xs shadow-sm transition-shadow hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
                STRIPE[status],
            )}
        >
            {card.completed && (
                <CheckCircle2
                    className="h-3 w-3 shrink-0 text-emerald-600"
                    aria-hidden
                />
            )}
            <span
                className={cn(
                    "truncate",
                    card.completed && "text-muted-foreground line-through",
                )}
            >
                {card.title}
            </span>
        </button>
    );
};

const MoreCards = ({
    day,
    cards,
    count,
}: {
    day: Date;
    cards: CardWithListInfo[];
    count: number;
}) => (
    <Popover>
        <PopoverTrigger asChild>
            <button
                type="button"
                className="mt-1 w-full rounded px-1.5 py-0.5 text-left text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                +{count} more
            </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
            <p className="px-1 pb-2 text-xs font-semibold text-muted-foreground">
                {format(day, "EEEE, MMMM d")}
            </p>
            <ul className="space-y-1">
                {cards.map((card) => (
                    <li key={card.id}>
                        <CalendarChip card={card} />
                    </li>
                ))}
            </ul>
        </PopoverContent>
    </Popover>
);
