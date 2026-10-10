"use client";

import { useState } from "react";
import { format } from "date-fns";

import { CardDetail } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverClose,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useCardAction } from "@/hooks/use-card-action";
import { updateCard } from "@/actions/update-card";

const DEFAULT_DUE_TIME = "12:00";

const toDateInput = (value: Date | string | null) =>
    value ? format(new Date(value), "yyyy-MM-dd") : "";
const toTimeInput = (value: Date | string | null) =>
    value ? format(new Date(value), "HH:mm") : DEFAULT_DUE_TIME;

/** Combine native date/time input values (local time) into a Date. */
const fromInputs = (date: string, time = "00:00") =>
    date ? new Date(`${date}T${time}`) : null;

interface DatesPopoverProps {
    card: CardDetail;
    children: React.ReactNode;
}

export const DatesPopover = ({ card, children }: DatesPopoverProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3">
                {/* Remount on open so the inputs start from the saved values. */}
                <DatesForm
                    key={`${card.startDate}-${card.dueDate}`}
                    card={card}
                />
            </PopoverContent>
        </Popover>
    );
};

const DatesForm = ({ card }: { card: CardDetail }) => {
    const boardId = card.list.board.id;
    const [hasStart, setHasStart] = useState(!!card.startDate);
    const [startDate, setStartDate] = useState(toDateInput(card.startDate));
    const [hasDue, setHasDue] = useState(!!card.dueDate || !card.startDate);
    const [dueDate, setDueDate] = useState(toDateInput(card.dueDate));
    const [dueTime, setDueTime] = useState(toTimeInput(card.dueDate));
    const [error, setError] = useState<string | null>(null);

    const { execute, isLoading } = useCardAction(updateCard, card.id, {
        refreshLogs: true,
    });

    const save = () => {
        const start = hasStart ? fromInputs(startDate) : null;
        const due = hasDue ? fromInputs(dueDate, dueTime) : null;
        if (start && due && start > due) {
            setError("Start date must be before the due date.");
            return false;
        }
        setError(null);
        execute({ id: card.id, boardId, startDate: start, dueDate: due });
        return true;
    };

    return (
        <div className="space-y-3">
            <p className="text-center text-sm font-semibold text-foreground">
                Dates
            </p>

            <fieldset className="space-y-1.5">
                <label className="flex items-center gap-x-2 text-xs font-semibold text-foreground">
                    <input
                        type="checkbox"
                        checked={hasStart}
                        onChange={(e) => setHasStart(e.target.checked)}
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                    />
                    Start date
                </label>
                <Input
                    type="date"
                    aria-label="Start date"
                    value={startDate}
                    disabled={!hasStart}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9"
                />
            </fieldset>

            <fieldset className="space-y-1.5">
                <label className="flex items-center gap-x-2 text-xs font-semibold text-foreground">
                    <input
                        type="checkbox"
                        checked={hasDue}
                        onChange={(e) => setHasDue(e.target.checked)}
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                    />
                    Due date
                </label>
                <div className="flex gap-x-2">
                    <Input
                        type="date"
                        aria-label="Due date"
                        value={dueDate}
                        disabled={!hasDue}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="h-9 flex-1"
                    />
                    <Input
                        type="time"
                        aria-label="Due time"
                        value={dueTime}
                        disabled={!hasDue}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="h-9 w-[110px]"
                    />
                </div>
            </fieldset>

            {error && (
                <p
                    role="alert"
                    className="text-xs font-medium text-destructive"
                >
                    {error}
                </p>
            )}

            <div className="space-y-1.5 pt-1">
                <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    disabled={isLoading}
                    onClick={save}
                >
                    Save
                </Button>
                <PopoverClose asChild>
                    <Button
                        variant="gray"
                        size="sm"
                        className="w-full"
                        disabled={
                            isLoading || (!card.startDate && !card.dueDate)
                        }
                        onClick={() =>
                            execute({
                                id: card.id,
                                boardId,
                                startDate: null,
                                dueDate: null,
                            })
                        }
                    >
                        Remove
                    </Button>
                </PopoverClose>
            </div>
        </div>
    );
};
