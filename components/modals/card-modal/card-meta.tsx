"use client";

import { forwardRef } from "react";
import {
    CheckSquare,
    Clock,
    Image as ImageIcon,
    Plus,
    Tag,
} from "lucide-react";

import { CardDetail } from "@/types";
import { cn } from "@/lib/utils";
import {
    DUE_STATUS_STYLES,
    formatCardDate,
    getDueStatus,
} from "@/lib/due-date";
import { LABEL_COLORS, LabelColor } from "@/constants/labels";
import { Button, ButtonProps } from "@/components/ui/button";
import { LabelsPopover } from "./labels-popover";
import { DatesPopover } from "./dates-popover";
import { ChecklistPopover } from "./checklist-popover";
import { CoverPopover } from "./cover-popover";

interface CardMetaProps {
    card: CardDetail;
}

// forwardRef: these are Radix PopoverTrigger children, which need the DOM node
// to position the popover.
const ToolbarButton = forwardRef<
    HTMLButtonElement,
    ButtonProps & { icon: typeof Tag }
>(({ icon: Icon, children, ...props }, ref) => (
    <Button
        ref={ref}
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-sm"
        {...props}
    >
        <Icon className="h-4 w-4" aria-hidden />
        {children}
    </Button>
));
ToolbarButton.displayName = "ToolbarButton";

/** Action buttons under the title, plus the card's labels and dates once set. */
export const CardMeta = ({ card }: CardMetaProps) => {
    const hasLabels = card.labels.length > 0;
    const hasDates = !!card.startDate || !!card.dueDate;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <LabelsPopover card={card}>
                    <ToolbarButton icon={Tag}>Labels</ToolbarButton>
                </LabelsPopover>
                <DatesPopover card={card}>
                    <ToolbarButton icon={Clock}>Dates</ToolbarButton>
                </DatesPopover>
                <ChecklistPopover card={card}>
                    <ToolbarButton icon={CheckSquare}>Checklist</ToolbarButton>
                </ChecklistPopover>
                <CoverPopover card={card}>
                    <ToolbarButton icon={ImageIcon}>Cover</ToolbarButton>
                </CoverPopover>
            </div>

            {(hasLabels || hasDates) && (
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {hasLabels && (
                        <div>
                            <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                                Labels
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {card.labels.map(({ label }) => (
                                    <span
                                        key={label.id}
                                        className={cn(
                                            "inline-flex h-8 min-w-[48px] items-center rounded-md px-3 text-sm font-medium",
                                            LABEL_COLORS[
                                                label.color as LabelColor
                                            ]?.className,
                                        )}
                                    >
                                        {label.name}
                                    </span>
                                ))}
                                <LabelsPopover card={card}>
                                    <Button
                                        variant="gray"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label="Edit labels"
                                    >
                                        <Plus className="h-4 w-4" aria-hidden />
                                    </Button>
                                </LabelsPopover>
                            </div>
                        </div>
                    )}
                    {hasDates && <DatesSummary card={card} />}
                </div>
            )}
        </div>
    );
};

const DatesSummary = ({ card }: { card: CardDetail }) => {
    const status = card.dueDate
        ? getDueStatus(card.dueDate, card.completed)
        : null;
    const style = status ? DUE_STATUS_STYLES[status] : null;

    const range = [
        card.startDate && formatCardDate(card.startDate),
        card.dueDate && formatCardDate(card.dueDate, true),
    ]
        .filter(Boolean)
        .join(" – ");

    return (
        <div>
            <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                {card.startDate && card.dueDate
                    ? "Dates"
                    : card.dueDate
                      ? "Due date"
                      : "Start date"}
            </p>
            <DatesPopover card={card}>
                <Button
                    variant="gray"
                    size="sm"
                    className="h-8 px-3 font-normal"
                >
                    {range}
                    {style?.label && (
                        <span
                            className={cn(
                                "rounded px-1.5 py-0.5 text-xs font-semibold",
                                style.className,
                            )}
                        >
                            {style.label}
                        </span>
                    )}
                </Button>
            </DatesPopover>
        </div>
    );
};
