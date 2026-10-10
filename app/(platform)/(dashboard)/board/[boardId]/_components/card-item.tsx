"use client";

import { Card } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { AlignLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCardModal } from "@/hooks/use-card-modal";

interface CardItemProps {
    data: Card;
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
                        "group cursor-pointer rounded-lg bg-card px-3 py-2.5 text-sm text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)] transition-shadow duration-150 hover:shadow-[0_0_0_2px_hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        snapshot.isDragging && "shadow-lg"
                    )}
                >
                    <p className="break-words leading-snug">{data.title}</p>
                    {data.description && (
                        <div className="mt-2 flex items-center text-muted-foreground">
                            <AlignLeft
                                className="h-3.5 w-3.5"
                                aria-label="Has description"
                            />
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};
