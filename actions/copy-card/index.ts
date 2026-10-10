"use server";

import { auth } from "@clerk/nextjs";
import { InputType, ReturnType } from "./type";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CopyCard } from "./schema";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return {
            error: "Unauthorized",
        };
    }

    const { id, boardId } = data;
    let card;

    try {
        const cardToCopy = await db.card.findUnique({
            where: {
                id,
                list: {
                    board: {
                        orgId,
                    },
                },
            },
            include: {
                labels: true,
                checklists: { include: { items: true } },
            },
        });
        if (!cardToCopy) {
            return { error: "Card not found" };
        }

        const lastCard = await db.card.findFirst({
            where: {
                listId: cardToCopy.listId,
            },
            orderBy: {
                order: "desc",
            },
            select: {
                order: true,
            },
        });

        const newOrder = lastCard ? lastCard.order + 1 : 1;
        card = await db.card.create({
            data: {
                title: `${cardToCopy.title}-Copy`,
                description: cardToCopy.description,
                order: newOrder,
                listId: cardToCopy.listId,
                startDate: cardToCopy.startDate,
                dueDate: cardToCopy.dueDate,
                coverColor: cardToCopy.coverColor,
                coverImageUrl: cardToCopy.coverImageUrl,
                // 复制标签和清单；评论和完成状态不复制（与 Trello 一致）。
                labels: {
                    create: cardToCopy.labels.map(({ labelId }) => ({
                        labelId,
                    })),
                },
                checklists: {
                    create: cardToCopy.checklists.map((checklist) => ({
                        title: checklist.title,
                        items: {
                            create: checklist.items.map(
                                ({ title, completed, order }) => ({
                                    title,
                                    completed,
                                    order,
                                })
                            ),
                        },
                    })),
                },
            },
        });

        await createAuditLog({
            entityTitle: card.title,
            entityId: card.id,
            entityType: ENTITY_TYPE.CARD,
            action: ACTION.CREATE,
        });
    } catch (error) {
        console.error("[COPY_CARD]", error);
        return {
            error: "Failed to copy.",
        };
    }

    revalidatePath(`/board/${boardId}`, "layout");
    return { data: card };
};

export const copyCard = createSafeAction(CopyCard, handler);
