"use client";

import { ListWithCards } from "@/types";
import { ListHeader } from "./list-header";
import { ElementRef, useRef, useState } from "react";
import { CardForm } from "./card-form";
import { cn } from "@/lib/utils";
import { CardItem } from "./card-item";
import { Droppable, Draggable } from "@hello-pangea/dnd";

interface ListItemProps {
    data: ListWithCards;
    index: number;
}

export const ListItem = ({ data, index }: ListItemProps) => {
    const textareaRef = useRef<ElementRef<"textarea">>(null);
    const [isEditing, setIsEditing] = useState(false);

    const disableEditing = () => {
        setIsEditing(false);
    };

    const enableEditing = () => {
        setIsEditing(true);
        setTimeout(() => {
            textareaRef.current?.focus();
        });
    };

    return (
        <Draggable draggableId={data.id} index={index}>
            {(provided) => (
                <li
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className="h-full w-[280px] shrink-0 select-none"
                >
                    <div
                        {...provided.dragHandleProps}
                        className="w-full rounded-xl bg-list pb-2 shadow-md ring-1 ring-black/5"
                    >
                        <ListHeader
                            onAddCard={enableEditing}
                            data={data}
                            cardCount={data.cards.length}
                        />
                        <Droppable droppableId={data.id} type="card">
                            {(provided) => (
                                <ol
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={cn(
                                        "mx-1 flex min-h-[4px] flex-col gap-y-2 px-1 py-0.5",
                                        data.cards.length > 0 ? "mt-2" : "mt-0"
                                    )}
                                >
                                    {data.cards.map((card, index) => (
                                        <CardItem
                                            data={card}
                                            index={index}
                                            key={card.id}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </ol>
                            )}
                        </Droppable>
                        <CardForm
                            listId={data.id}
                            ref={textareaRef}
                            isEditing={isEditing}
                            enableEditing={enableEditing}
                            disableEditing={disableEditing}
                        />
                    </div>
                </li>
            )}
        </Draggable>
    );
};
