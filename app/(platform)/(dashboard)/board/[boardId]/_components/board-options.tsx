"use client";

import { MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";

import { deleteBoard } from "@/actions/delete-board";
import { useAction } from "@/hooks/use-action";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/confirm-button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverClose,
} from "@/components/ui/popover";

interface BoardOptionsProps {
    id: string;
}

export const BoardOptions = ({ id }: BoardOptionsProps) => {
    const { execute, isLoading } = useAction(deleteBoard, {
        onError: (error) => {
            toast.error(error);
        },
    });

    const onDelete = () => {
        execute({ id });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    className="h-9 w-9 p-0"
                    variant="transparent"
                    aria-label="Board actions"
                >
                    <MoreHorizontal className="h-5 w-5" aria-hidden />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 px-0 py-3" side="bottom" align="end">
                <div className="pb-3 text-center text-sm font-semibold text-foreground">
                    Board actions
                </div>
                <PopoverClose asChild>
                    <Button
                        className="absolute right-2 top-2 h-auto w-auto p-2 text-muted-foreground"
                        variant="ghost"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" aria-hidden />
                    </Button>
                </PopoverClose>
                <ConfirmButton
                    label="Delete this board"
                    confirmLabel="Delete board"
                    disabled={isLoading}
                    onConfirm={onDelete}
                    className="h-auto w-full justify-start rounded-none px-5 py-2 font-normal"
                />
            </PopoverContent>
        </Popover>
    );
};
