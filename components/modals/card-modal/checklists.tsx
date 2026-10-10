"use client";

import { useState } from "react";
import { Checklist, ChecklistItem } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { CheckSquare, X } from "lucide-react";

import { CardDetail } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmButton } from "@/components/confirm-button";
import { useCardAction } from "@/hooks/use-card-action";
import { deleteChecklist } from "@/actions/delete-checklist";
import { createChecklistItem } from "@/actions/create-checklist-item";
import { updateChecklistItem } from "@/actions/update-checklist-item";
import { deleteChecklistItem } from "@/actions/delete-checklist-item";
import { MAX_CHECKLIST_TITLE_LENGTH } from "@/constants/labels";
import { SectionHeading } from "./section-heading";

type ChecklistWithItems = Checklist & { items: ChecklistItem[] };

interface ChecklistsProps {
    card: CardDetail;
}

export const Checklists = ({ card }: ChecklistsProps) => {
    if (card.checklists.length === 0) {
        return null;
    }
    return (
        <div className="space-y-8">
            {card.checklists.map((checklist) => (
                <ChecklistBlock
                    key={checklist.id}
                    card={card}
                    checklist={checklist}
                />
            ))}
        </div>
    );
};

interface ChecklistBlockProps {
    card: CardDetail;
    checklist: ChecklistWithItems;
}

const ChecklistBlock = ({ card, checklist }: ChecklistBlockProps) => {
    const boardId = card.list.board.id;
    const done = checklist.items.filter((item) => item.completed).length;
    const total = checklist.items.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    const { execute: executeDelete, isLoading: isDeleting } = useCardAction(
        deleteChecklist,
        card.id,
    );

    return (
        <section aria-label={checklist.title}>
            <SectionHeading
                icon={CheckSquare}
                action={
                    <ConfirmButton
                        label="Delete"
                        confirmLabel="Delete checklist"
                        disabled={isDeleting}
                        onConfirm={() =>
                            executeDelete({ id: checklist.id, boardId })
                        }
                        className="h-7 px-2.5 text-xs"
                        confirmClassName="p-0"
                    />
                }
            >
                {checklist.title}
            </SectionHeading>

            <div className="pl-8">
                <div className="mb-3 flex items-center gap-x-3">
                    <span className="w-8 text-xs text-muted-foreground">
                        {percent}%
                    </span>
                    <div
                        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${done} of ${total} items complete`}
                    >
                        <div
                            className={cn(
                                "h-full rounded-full transition-[width] duration-300",
                                percent === 100
                                    ? "bg-emerald-500"
                                    : "bg-primary",
                            )}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>

                <ul className="space-y-0.5">
                    {checklist.items.map((item) => (
                        <ChecklistRow
                            key={item.id}
                            card={card}
                            checklistId={checklist.id}
                            item={item}
                        />
                    ))}
                </ul>

                <AddItemForm card={card} checklistId={checklist.id} />
            </div>
        </section>
    );
};

interface ChecklistRowProps {
    card: CardDetail;
    checklistId: string;
    item: ChecklistItem;
}

const ChecklistRow = ({ card, checklistId, item }: ChecklistRowProps) => {
    const queryClient = useQueryClient();
    const boardId = card.list.board.id;
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(item.title);

    const { execute: executeUpdate } = useCardAction(
        updateChecklistItem,
        card.id,
    );
    const { execute: executeDelete } = useCardAction(
        deleteChecklistItem,
        card.id,
    );

    const toggle = () => {
        const completed = !item.completed;
        // 乐观更新勾选状态。
        queryClient.setQueryData<CardDetail>(["card", card.id], (old) =>
            old
                ? {
                      ...old,
                      checklists: old.checklists.map((c) =>
                          c.id !== checklistId
                              ? c
                              : {
                                    ...c,
                                    items: c.items.map((i) =>
                                        i.id === item.id
                                            ? { ...i, completed }
                                            : i,
                                    ),
                                },
                      ),
                  }
                : old,
        );
        executeUpdate({ id: item.id, boardId, completed });
    };

    const saveTitle = () => {
        setIsEditing(false);
        const next = title.trim();
        if (!next || next === item.title) {
            setTitle(item.title);
            return;
        }
        executeUpdate({ id: item.id, boardId, title: next });
    };

    return (
        <li className="group flex items-start gap-x-3 rounded-md px-1 py-1 hover:bg-muted/60">
            <input
                type="checkbox"
                checked={item.completed}
                onChange={toggle}
                aria-label={item.title}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[hsl(var(--primary))]"
            />
            {isEditing ? (
                <Input
                    value={title}
                    maxLength={MAX_CHECKLIST_TITLE_LENGTH}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") saveTitle();
                        if (e.key === "Escape") {
                            setTitle(item.title);
                            setIsEditing(false);
                        }
                    }}
                    className="h-8 flex-1"
                    autoFocus
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className={cn(
                        "min-w-0 flex-1 break-words text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        item.completed && "text-muted-foreground line-through",
                    )}
                >
                    {item.title}
                </button>
            )}
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                aria-label={`Delete item ${item.title}`}
                onClick={() => executeDelete({ id: item.id, boardId })}
            >
                <X className="h-3.5 w-3.5" aria-hidden />
            </Button>
        </li>
    );
};

const AddItemForm = ({
    card,
    checklistId,
}: {
    card: CardDetail;
    checklistId: string;
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");

    const { execute, isLoading } = useCardAction(createChecklistItem, card.id, {
        onSuccess: () => setTitle(""),
    });

    const add = () => {
        if (!title.trim()) return;
        execute({ checklistId, boardId: card.list.board.id, title });
    };

    if (!isAdding) {
        return (
            <Button
                variant="gray"
                size="sm"
                className="mt-2"
                onClick={() => setIsAdding(true)}
            >
                Add an item
            </Button>
        );
    }

    return (
        <div className="mt-2 space-y-2">
            <Input
                value={title}
                placeholder="Add an item"
                maxLength={MAX_CHECKLIST_TITLE_LENGTH}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") add();
                    if (e.key === "Escape") setIsAdding(false);
                }}
                className="h-9"
                aria-label="New checklist item"
                autoFocus
            />
            <div className="flex gap-x-2">
                <Button
                    variant="primary"
                    size="sm"
                    onClick={add}
                    disabled={isLoading || !title.trim()}
                >
                    Add
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdding(false)}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
};
