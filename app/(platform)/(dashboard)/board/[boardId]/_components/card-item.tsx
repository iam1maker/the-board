"use client";

import Image from "next/image";
import { Draggable } from "@hello-pangea/dnd";
import {
    AlignLeft,
    CheckCircle2,
    CheckSquare,
    Clock,
    MessageSquare,
} from "lucide-react";

import { BoardCard } from "@/types";
import { cn } from "@/lib/utils";
import { useCardModal } from "@/hooks/use-card-modal";
import {
    DUE_STATUS_STYLES,
    formatCardDate,
    getDueStatus,
} from "@/lib/due-date";
import {
    COVER_COLORS,
    CoverColor,
    LABEL_COLORS,
    LabelColor,
} from "@/constants/labels";

interface CardItemProps {
    data: BoardCard;
    index: number;
}

export const CardItem = ({ data, index }: CardItemProps) => {
    const cardModal = useCardModal();

    return (
        <Draggable draggableId={data.id} index={index}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    role="button"
                    aria-label={`Open card ${data.title}`}
                    onClick={() => cardModal.onOpen(data.id)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            cardModal.onOpen(data.id);
                        }
                    }}
                    className={cn(
                        "group cursor-pointer overflow-hidden rounded-lg bg-card text-sm text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)] transition-shadow duration-150 hover:shadow-[0_0_0_2px_hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        snapshot.isDragging && "shadow-lg",
                    )}
                >
                    <CardCover card={data} />
                    <div className="space-y-1.5 px-3 py-2.5">
                        {data.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {data.labels.map(({ label }) => (
                                    <span
                                        key={label.id}
                                        title={
                                            label.name ||
                                            LABEL_COLORS[
                                                label.color as LabelColor
                                            ]?.name
                                        }
                                        className={cn(
                                            "inline-flex h-4 min-w-[40px] max-w-full items-center truncate rounded px-1.5 text-[11px] font-semibold leading-none",
                                            LABEL_COLORS[
                                                label.color as LabelColor
                                            ]?.className,
                                        )}
                                    >
                                        {label.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        <p className="flex items-start gap-x-1.5 break-words leading-snug">
                            {data.completed && (
                                <CheckCircle2
                                    className="mt-px h-4 w-4 shrink-0 text-emerald-600"
                                    aria-label="Complete"
                                />
                            )}
                            <span className="min-w-0">{data.title}</span>
                        </p>
                        <CardBadges card={data} />
                    </div>
                </div>
            )}
        </Draggable>
    );
};

const CardCover = ({ card }: { card: BoardCard }) => {
    if (card.coverImageUrl) {
        return (
            <div className="relative h-32 bg-muted">
                <Image
                    src={card.coverImageUrl}
                    alt=""
                    fill
                    sizes="280px"
                    className="object-cover"
                />
            </div>
        );
    }
    if (card.coverColor) {
        return (
            <div
                className={cn(
                    "h-8",
                    COVER_COLORS[card.coverColor as CoverColor] ??
                        COVER_COLORS.slate,
                )}
            />
        );
    }
    return null;
};

const CardBadges = ({ card }: { card: BoardCard }) => {
    const items = card.checklists.flatMap((c) => c.items);
    const doneItems = items.filter((i) => i.completed).length;
    const commentCount = card._count.comments;
    const dueStatus = card.dueDate
        ? getDueStatus(card.dueDate, card.completed)
        : null;

    const hasBadges =
        !!card.dueDate ||
        !!card.description ||
        commentCount > 0 ||
        items.length > 0;
    if (!hasBadges) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-xs text-muted-foreground">
            {card.dueDate && dueStatus && (
                <span
                    className={cn(
                        "inline-flex items-center gap-x-1 rounded px-1.5 py-0.5",
                        dueStatus === "upcoming"
                            ? ""
                            : DUE_STATUS_STYLES[dueStatus].className,
                    )}
                    title={DUE_STATUS_STYLES[dueStatus].label ?? "Due date"}
                >
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {formatCardDate(card.dueDate)}
                </span>
            )}
            {card.description && (
                <AlignLeft
                    className="h-3.5 w-3.5"
                    aria-label="Has description"
                />
            )}
            {commentCount > 0 && (
                <span
                    className="inline-flex items-center gap-x-1"
                    aria-label={`${commentCount} comments`}
                >
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                    {commentCount}
                </span>
            )}
            {items.length > 0 && (
                <span
                    className={cn(
                        "inline-flex items-center gap-x-1 rounded px-1.5 py-0.5",
                        doneItems === items.length &&
                            "bg-emerald-600 text-white",
                    )}
                    aria-label={`Checklist ${doneItems} of ${items.length} done`}
                >
                    <CheckSquare className="h-3.5 w-3.5" aria-hidden />
                    {doneItems}/{items.length}
                </span>
            )}
        </div>
    );
};
