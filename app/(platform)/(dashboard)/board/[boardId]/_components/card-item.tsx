"use client";

import { Card } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { useCardModal } from "@/hooks/use-card-modal";
interface CardItemProps {
    data: Card;
    index: number;
}

export const CardItem = ({ data, index }: CardItemProps) => {
    const cardModal = useCardModal();

    return (
        <Draggable draggableId={data.id} index={index}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    role="button"
                    onClick={() => cardModal.onOpen(data.id)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            cardModal.onOpen(data.id);
                        }
                    }}
                    aria-label={`Open card ${data.title}`}
                    className="cursor-pointer break-words rounded-lg border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] duration-150 hover:border-primary/50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {data.title}
                </div>
            )}
        </Draggable>
    );
};
