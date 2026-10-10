"use client";

import { Plus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, ElementRef } from "react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useAction } from "@/hooks/use-action";
import { createList } from "@/actions/create-list";

import { FormInput } from "@/components/form/form-input";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";

import { ListWrapper } from "./list-wrapper";
import { toast } from "sonner";

export const ListForm = () => {
    const router = useRouter();
    const params = useParams();

    const inputRef = useRef<ElementRef<"input">>(null);
    const formRef = useRef<ElementRef<"form">>(null);

    const [isEditing, setIsEditing] = useState(false);

    const enableEditing = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
        });
    };

    const disableEditing = () => {
        setIsEditing(false);
    };

    const { execute, fieldErrors } = useAction(createList, {
        onSuccess: (data) => {
            toast.success(`List "${data.title}" created`);
            disableEditing();
            router.refresh();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            disableEditing();
        }
    };

    useEventListener("keydown", onKeyDown);
    useOnClickOutside(formRef, disableEditing);

    const onSubmit = (formData: FormData) => {
        const title = formData.get("title") as string;
        const boardId = formData.get("boardId") as string;

        execute({ title, boardId });
    };

    if (isEditing) {
        return (
            <ListWrapper>
                <form
                    action={onSubmit}
                    ref={formRef}
                    className="w-full space-y-3 rounded-xl bg-list p-3 shadow-md ring-1 ring-black/5"
                >
                    <FormInput
                        ref={inputRef}
                        id="title"
                        errors={fieldErrors}
                        className="h-9 bg-card px-2 text-sm font-medium"
                        placeholder="Enter list title"
                    />
                    <input hidden value={params.boardId} name="boardId" />
                    <div className="flex items-center gap-x-1">
                        <FormSubmit>Add list</FormSubmit>
                        <Button
                            type="button"
                            onClick={disableEditing}
                            size={"sm"}
                            variant={"ghost"}
                            aria-label="Cancel"
                        >
                            <X className="h-5 w-5" aria-hidden />
                        </Button>
                    </div>
                </form>
            </ListWrapper>
        );
    }

    return (
        <ListWrapper>
            <button
                onClick={enableEditing}
                className="flex w-full items-center rounded-xl bg-black/30 p-3 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Add a list
            </button>
        </ListWrapper>
    );
};
