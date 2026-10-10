"use client";

import { useState } from "react";
import { Label } from "@prisma/client";
import { Check, ChevronLeft, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { CardDetail } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmButton } from "@/components/confirm-button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useCardAction } from "@/hooks/use-card-action";
import { toggleCardLabel } from "@/actions/toggle-card-label";
import { upsertLabel } from "@/actions/upsert-label";
import { deleteLabel } from "@/actions/delete-label";
import {
    LABEL_COLORS,
    LABEL_COLOR_KEYS,
    LabelColor,
    MAX_LABEL_NAME_LENGTH,
} from "@/constants/labels";

type View = { mode: "list" } | { mode: "edit"; label?: Label };

interface LabelsPopoverProps {
    card: CardDetail;
    children: React.ReactNode;
}

export const LabelsPopover = ({ card, children }: LabelsPopoverProps) => {
    const [view, setView] = useState<View>({ mode: "list" });

    return (
        <Popover onOpenChange={(open) => !open && setView({ mode: "list" })}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3">
                {view.mode === "list" ? (
                    <LabelList
                        card={card}
                        onEdit={(label) => setView({ mode: "edit", label })}
                    />
                ) : (
                    <LabelEditor
                        card={card}
                        label={view.label}
                        onDone={() => setView({ mode: "list" })}
                    />
                )}
            </PopoverContent>
        </Popover>
    );
};

const LabelSwatch = ({
    label,
    className,
}: {
    label: Pick<Label, "name" | "color">;
    className?: string;
}) => (
    <span
        className={cn(
            "flex h-8 min-w-0 flex-1 items-center truncate rounded-md px-3 text-sm font-medium",
            LABEL_COLORS[label.color as LabelColor]?.className ??
                LABEL_COLORS.slate.className,
            className,
        )}
    >
        {label.name}
    </span>
);

interface LabelListProps {
    card: CardDetail;
    onEdit: (label?: Label) => void;
}

const LabelList = ({ card, onEdit }: LabelListProps) => {
    const queryClient = useQueryClient();
    const boardId = card.list.board.id;
    const selected = new Set(card.labels.map((l) => l.labelId));

    const { execute } = useCardAction(toggleCardLabel, card.id);

    const toggle = (label: Label) => {
        const isSelected = selected.has(label.id);
        // 乐观更新卡片上的标签。
        queryClient.setQueryData<CardDetail>(["card", card.id], (old) => {
            if (!old) return old;
            const labels = isSelected
                ? old.labels.filter((l) => l.labelId !== label.id)
                : [
                      ...old.labels,
                      {
                          cardId: old.id,
                          labelId: label.id,
                          label,
                          createdAt: new Date(),
                      },
                  ];
            return { ...old, labels };
        });
        execute({ cardId: card.id, labelId: label.id, boardId });
    };

    return (
        <div>
            <p className="pb-3 text-center text-sm font-semibold text-foreground">
                Labels
            </p>
            <ul className="space-y-1.5">
                {card.list.board.labels.map((label) => {
                    const isSelected = selected.has(label.id);
                    const colorName =
                        LABEL_COLORS[label.color as LabelColor]?.name ??
                        label.color;
                    return (
                        <li
                            key={label.id}
                            className="flex items-center gap-x-2"
                        >
                            <button
                                type="button"
                                role="checkbox"
                                aria-checked={isSelected}
                                aria-label={
                                    label.name
                                        ? `${label.name} (${colorName})`
                                        : `${colorName} label`
                                }
                                onClick={() => toggle(label)}
                                className="flex min-w-0 flex-1 items-center gap-x-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <span
                                    className={cn(
                                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                        isSelected
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-input bg-card",
                                    )}
                                >
                                    {isSelected && (
                                        <Check
                                            className="h-3 w-3"
                                            aria-hidden
                                        />
                                    )}
                                </span>
                                <LabelSwatch
                                    label={label}
                                    className="hover:opacity-90"
                                />
                            </button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                aria-label={`Edit ${label.name || colorName} label`}
                                onClick={() => onEdit(label)}
                            >
                                <Pencil className="h-3.5 w-3.5" aria-hidden />
                            </Button>
                        </li>
                    );
                })}
            </ul>
            <Button
                variant="gray"
                size="sm"
                className="mt-3 w-full"
                onClick={() => onEdit(undefined)}
            >
                Create a new label
            </Button>
        </div>
    );
};

interface LabelEditorProps {
    card: CardDetail;
    label?: Label;
    onDone: () => void;
}

const LabelEditor = ({ card, label, onDone }: LabelEditorProps) => {
    const boardId = card.list.board.id;
    const [name, setName] = useState(label?.name ?? "");
    const [color, setColor] = useState<LabelColor>(
        (label?.color as LabelColor) ?? "green",
    );

    const { execute: executeSave, isLoading: isSaving } = useCardAction(
        upsertLabel,
        card.id,
        {
            onSuccess: onDone,
        },
    );
    const { execute: executeDelete, isLoading: isDeleting } = useCardAction(
        deleteLabel,
        card.id,
        {
            onSuccess: onDone,
        },
    );

    const save = () => executeSave({ boardId, id: label?.id, name, color });

    return (
        <div>
            <div className="relative pb-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -left-1 -top-1 h-7 w-7"
                    aria-label="Back to labels"
                    onClick={onDone}
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                </Button>
                <p className="text-center text-sm font-semibold text-foreground">
                    {label ? "Edit label" : "Create label"}
                </p>
            </div>
            <div className="mb-3 rounded-md bg-muted p-4">
                <LabelSwatch label={{ name, color }} />
            </div>
            <label
                htmlFor="label-name"
                className="text-xs font-semibold text-foreground"
            >
                Title
            </label>
            <Input
                id="label-name"
                value={name}
                maxLength={MAX_LABEL_NAME_LENGTH}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                className="mb-3 mt-1 h-9"
                autoFocus
            />
            <p className="mb-1 text-xs font-semibold text-foreground">
                Select a color
            </p>
            <div
                className="mb-4 grid grid-cols-5 gap-1.5"
                role="radiogroup"
                aria-label="Label color"
            >
                {LABEL_COLOR_KEYS.map((key) => (
                    <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={color === key}
                        aria-label={LABEL_COLORS[key].name}
                        onClick={() => setColor(key)}
                        className={cn(
                            "h-8 rounded-md ring-offset-2 ring-offset-popover transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            LABEL_COLORS[key].className,
                            color === key && "ring-2 ring-foreground",
                        )}
                    />
                ))}
            </div>
            <div className="flex items-center justify-between gap-x-2">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={save}
                    disabled={isSaving}
                >
                    {label ? "Save" : "Create"}
                </Button>
                {label && (
                    <ConfirmButton
                        label="Delete"
                        confirmLabel="Delete label"
                        disabled={isDeleting}
                        onConfirm={() =>
                            executeDelete({ id: label.id, boardId })
                        }
                        className="h-9 px-3"
                        confirmClassName="p-0"
                    />
                )}
            </div>
        </div>
    );
};
