"use client";

import { ListWithCards } from "@/types";
import { ListForm } from "./list-form";
import { useEffect, useState } from "react";
import { ListItem } from "./list-item";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { updateCardOrder } from "@/actions/update-card-order";
import { toast } from "sonner";

interface ListContainerProps {
    data: ListWithCards[];
    boardId: string;
}

/**
 * 重新排列数组中指定范围的元素。
 * @param list 被操作的数组。
 * @param startIndex 起始索引，表示需要重新排列的元素的起始位置。
 * @param endIndex 结束索引，表示需要重新排列的元素的结束位置。
 * @returns 返回重新排列后的数组。
 */
function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    // 复制传入的数组，以避免修改原数组
    const result = Array.from(list);
    // 从起始索引处移除一个元素，并将其存储在removed中
    const [removed] = result.splice(startIndex, 1);
    // 将移除的元素插入到指定的新位置
    result.splice(endIndex, 0, removed);

    return result;
}

export const ListContainer = ({ data, boardId }: ListContainerProps) => {
    const [orderedData, setOrderedData] = useState(data);

    const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
        onSuccess() {
            toast.success("List reordered");
        },
        onError(error) {
            toast.error(error);
        },
    });

    const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
        onSuccess() {
            toast.success("Card reordered");
        },
        onError(error) {
            toast.error(error);
        },
    });

    //乐观更新
    useEffect(() => {
        setOrderedData(data);
    }, [data]);

    const onDragEnd = (result: any) => {
        const { destination, source, type } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === "list") {
            const items = reorder(
                orderedData,
                source.index,
                destination.index
            ).map((item, index) => ({ ...item, order: index }));
            setOrderedData(items);

            executeUpdateListOrder({
                items,
                boardId,
            });
        }

        //User moves a card
        if (type === "card") {
            let newOrderedData = [...orderedData];

            const sourceList = newOrderedData.find(
                (list) => list.id === source.droppableId
            );
            const destList = newOrderedData.find(
                (list) => list.id === destination.droppableId
            );

            if (!sourceList || !destList) {
                return;
            }

            //check if cards exists on the sourceList
            if (!sourceList.cards) {
                sourceList.cards = [];
            }
            //check if cards exists on the destList
            if (!destList.cards) {
                destList.cards = [];
            }

            // Moving the card in the same list
            if (source.droppableId === destination.droppableId) {
                const reorderedCards = reorder(
                    sourceList.cards,
                    source.index,
                    destination.index
                );

                reorderedCards.forEach((card, idx) => {
                    card.order = idx;
                });

                sourceList.cards = reorderedCards;

                setOrderedData(newOrderedData);

                executeUpdateCardOrder({
                    boardId: boardId,
                    items: reorderedCards,
                });

                //User moves the card to another list
            } else {
                const [movedCard] = sourceList.cards.splice(source.index, 1);
                //Assign the new listId to the move card
                movedCard.listId = destination.droppableId;

                //Add the card to the destination list
                destList.cards.splice(destination.index, 0, movedCard);

                sourceList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                //update the order for each card in the destination list
                destList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                setOrderedData(newOrderedData);

                executeUpdateCardOrder({
                    boardId: boardId,
                    items: destList.cards,
                });
            }
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="lists" type="list" direction="horizontal">
                {(provided) => (
                    <ol
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex gap-x-3 h-full"
                    >
                        {orderedData.map((list, index) => {
                            return (
                                <ListItem
                                    key={list.id}
                                    index={index}
                                    data={list}
                                />
                            );
                        })}
                        {provided.placeholder}
                        <ListForm />
                        <div className="flex-shrink-0 w-1" />
                    </ol>
                )}
            </Droppable>
        </DragDropContext>
    );
};
