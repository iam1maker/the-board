"use client";

import { Check, ChevronDown, Copy, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { CardDetail } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/confirm-button";
import {
    Popover,
    PopoverClose,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useAction } from "@/hooks/use-action";
import { useCardAction } from "@/hooks/use-card-action";
import { useCardModal } from "@/hooks/use-card-modal";
import { moveCard } from "@/actions/move-card";
import { copyCard } from "@/actions/copy-card";
import { deleteCard } from "@/actions/delete-card";

interface TopBarProps {
    card: CardDetail;
}

/** Modal header: which list the card is in (click to move) and card actions. */
export const TopBar = ({ card }: TopBarProps) => {
    const boardId = card.list.board.id;
    const cardModal = useCardModal();

    const { execute: executeMove, isLoading: isMoving } = useCardAction(
        moveCard,
        card.id,
        {
            refreshLogs: true,
            onSuccess: () => toast.success("Card moved"),
        },
    );

    const { execute: executeCopy, isLoading: isCopying } = useAction(copyCard, {
        onSuccess: (data) => {
            toast.success(`Card "${data.title}" copied`);
            cardModal.onClose();
        },
        onError: (error) => toast.error(error),
    });

    const { execute: executeDelete, isLoading: isDeleting } = useAction(
        deleteCard,
        {
            onSuccess: (data) => {
                toast.success(`Card "${data.title}" deleted`);
                cardModal.onClose();
            },
            onError: (error) => toast.error(error),
        },
    );

    return (
        <div className="flex h-14 shrink-0 items-center gap-x-2 border-b px-4 pr-14">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="gray"
                        size="sm"
                        className="h-8 max-w-[60%] px-2.5 text-xs font-semibold"
                        disabled={isMoving}
                        aria-label={`In list ${card.list.title}. Move card`}
                    >
                        <span className="truncate">{card.list.title}</span>
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-2">
                    <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Move to list
                    </p>
                    <ul>
                        {card.list.board.lists.map((list) => {
                            const isCurrent = list.id === card.list.id;
                            return (
                                <li key={list.id}>
                                    <PopoverClose asChild>
                                        <button
                                            type="button"
                                            disabled={isCurrent}
                                            onClick={() =>
                                                executeMove({
                                                    id: card.id,
                                                    boardId,
                                                    listId: list.id,
                                                })
                                            }
                                            className={cn(
                                                "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                isCurrent &&
                                                    "cursor-default font-semibold hover:bg-transparent",
                                            )}
                                        >
                                            <span className="truncate">
                                                {list.title}
                                            </span>
                                            {isCurrent && (
                                                <Check
                                                    className="h-4 w-4 text-primary"
                                                    aria-label="Current list"
                                                />
                                            )}
                                        </button>
                                    </PopoverClose>
                                </li>
                            );
                        })}
                    </ul>
                </PopoverContent>
            </Popover>

            <div className="ml-auto">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Card actions"
                        >
                            <MoreHorizontal className="h-4 w-4" aria-hidden />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start font-normal"
                            disabled={isCopying}
                            onClick={() =>
                                executeCopy({ id: card.id, boardId })
                            }
                        >
                            <Copy className="h-4 w-4" aria-hidden />
                            Copy card
                        </Button>
                        <ConfirmButton
                            label="Delete card"
                            confirmLabel="Delete"
                            disabled={isDeleting}
                            onConfirm={() =>
                                executeDelete({ id: card.id, boardId })
                            }
                            className="h-9 w-full justify-start px-3 font-normal"
                            confirmClassName="px-1 py-1"
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};
