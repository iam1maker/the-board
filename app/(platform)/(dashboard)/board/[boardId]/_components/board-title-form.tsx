"use client";
import { ElementRef, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Board } from "@prisma/client";
import { FormInput } from "@/components/form/form-input";
import { updateBoard } from "@/actions/update-board";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";

interface BoardTitleFormProps {
    data: Board;
}

export const BoardTitleForm = ({ data }: BoardTitleFormProps) => {
    const { execute } = useAction(updateBoard, {
        onSuccess(data) {
            toast.success(`Board "${data.title}" updated`);
            setTitle(data.title);
            disableEditing();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const formRef = useRef<ElementRef<"form">>(null);
    const inputRef = useRef<ElementRef<"input">>(null);

    const [title, setTitle] = useState(data.title);
    const [isEditing, setIsEditing] = useState(false);

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

    const onSubmit = (formData: FormData) => {
        const title = formData.get("title") as string;
        execute({
            title,
            id: data.id,
        });
    };

    const onBlur = () => {
        formRef.current?.requestSubmit();
    };

    if (isEditing) {
        return (
            <form
                action={onSubmit}
                ref={formRef}
                className="flex items-center gap-x-2"
            >
                <FormInput
                    ref={inputRef}
                    id="title"
                    onBlur={onBlur}
                    defaultValue={title}
                    className="h-9 border-white/40 bg-white/10 px-2 text-lg font-bold text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-0"
                />
            </form>
        );
    }

    return (
        <Button
            onClick={enableEditing}
            variant={"transparent"}
            className="h-9 w-auto px-2 text-lg font-bold"
            aria-label={`Rename board ${title}`}
        >
            {title}
        </Button>
    );
};
