"use client";

import { updateList } from "@/actions/update-list";
import { FormInput } from "@/components/form/form-input";
import { useAction } from "@/hooks/use-action";
import { List } from "@prisma/client";
import { useState, useRef, ElementRef } from "react";
import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";
import { ListOptions } from "./list-options";

interface ListHeaderProps {
    data: List;
    cardCount: number;
    onAddCard: () => void;
}

export const ListHeader = ({ data, cardCount, onAddCard }: ListHeaderProps) => {
    const [title, setTitle] = useState(data.title);
    const [isEditing, setIsEditing] = useState(false);

    const formRef = useRef<ElementRef<"form">>(null);
    const inputRef = useRef<ElementRef<"input">>(null);

    const enableEditing = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        });
    };

    const disableEditing = () => {
        setIsEditing(false);
    };

    const { execute } = useAction(updateList, {
        onSuccess(data) {
            toast.success(`Renamed to ${data.title}`);
            setTitle(data.title);
            disableEditing();
        },
        onError(error) {
            toast.error(error);
        },
    });

    const handleSubmit = (formData: FormData) => {
        const title = formData.get("title") as string;
        const id = formData.get("id") as string;
        const boardId = formData.get("boardId") as string;

        if (title === data.title) {
            return disableEditing();
        }

        execute({ id, title, boardId });
    };

    const onBlur = () => {
        formRef.current?.requestSubmit();
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            formRef.current?.requestSubmit();
        }
    };

    useEventListener("keydown", onKeyDown);

    return (
        <div className="flex items-start justify-between gap-x-2 px-2 pt-2 text-sm font-semibold">
            {isEditing ? (
                <form
                    ref={formRef}
                    action={handleSubmit}
                    className="flex-1 px-[2px]"
                >
                    <input hidden id="id" name="id" value={data.id} />
                    <input
                        hidden
                        id="boardId"
                        name="boardId"
                        value={data.boardId}
                    />
                    <FormInput
                        ref={inputRef}
                        onBlur={onBlur}
                        id="title"
                        placeholder="Enter list title"
                        defaultValue={title}
                        className="h-8 truncate border-input bg-card px-2 text-sm font-semibold"
                    />
                    <button type="submit" hidden />
                </form>
            ) : (
                <button
                    type="button"
                    onClick={enableEditing}
                    className="flex h-8 w-full min-w-0 items-center gap-x-2 rounded-md px-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Rename list ${data.title}`}
                >
                    <span className="truncate">{data.title}</span>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {cardCount}
                    </span>
                </button>
            )}
            <ListOptions data={data} onAddCard={onAddCard} />
        </div>
    );
};
