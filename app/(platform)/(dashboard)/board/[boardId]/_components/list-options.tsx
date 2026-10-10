"use client";

import { ElementRef, useRef } from "react";
import { List } from "@prisma/client";
import { Copy, MoreHorizontal, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
    Popover,
    PopoverClose,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmButton } from "@/components/confirm-button";
import { useAction } from "@/hooks/use-action";
import { deleteList } from "@/actions/delete-list";
import { copyList } from "@/actions/copy-list";

const MENU_ITEM_CLASS =
    "h-auto w-full justify-start rounded-none px-5 py-2 text-sm font-normal";

interface ListOptionsProps {
    data: List;
    onAddCard: () => void;
}

export const ListOptions = ({ data, onAddCard }: ListOptionsProps) => {
    const closeRef = useRef<ElementRef<"button">>(null);

    const { execute: executeDelete, isLoading: isDeleting } = useAction(
        deleteList,
        {
            onSuccess: (data) => {
                toast.success(`List "${data.title}" deleted`);
                closeRef.current?.click();
            },
            onError: (error) => {
                toast.error(error);
            },
        }
    );

    const { execute: executeCopy, isLoading: isCopying } = useAction(copyList, {
        onSuccess: (data) => {
            toast.success(`List "${data.title}" copied`);
            closeRef.current?.click();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onAdd = () => {
        closeRef.current?.click();
        // Defer so the popover's focus restore runs before the card form grabs focus.
        setTimeout(onAddCard);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:bg-black/5"
                    variant="ghost"
                    aria-label={`Actions for list ${data.title}`}
                >
                    <MoreHorizontal className="h-4 w-4" aria-hidden />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 px-0 py-3" side="bottom" align="start">
                <div className="pb-3 text-center text-sm font-semibold text-foreground">
                    List actions
                </div>
                <PopoverClose asChild ref={closeRef}>
                    <Button
                        className="absolute right-2 top-2 h-auto w-auto p-2 text-muted-foreground"
                        variant="ghost"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" aria-hidden />
                    </Button>
                </PopoverClose>
                <Button onClick={onAdd} className={MENU_ITEM_CLASS} variant="ghost">
                    <Plus className="h-4 w-4" aria-hidden />
                    Add card
                </Button>
                <Button
                    onClick={() => executeCopy({ id: data.id, boardId: data.boardId })}
                    disabled={isCopying}
                    className={MENU_ITEM_CLASS}
                    variant="ghost"
                >
                    <Copy className="h-4 w-4" aria-hidden />
                    Copy list
                </Button>
                <Separator className="my-1" />
                <ConfirmButton
                    label="Delete this list"
                    confirmLabel="Delete list"
                    disabled={isDeleting}
                    onConfirm={() =>
                        executeDelete({ id: data.id, boardId: data.boardId })
                    }
                    className={MENU_ITEM_CLASS}
                />
            </PopoverContent>
        </Popover>
    );
};
