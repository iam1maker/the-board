"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/create-audit-log";
import { InputType, ReturnType } from "./type";
import { MoveCard } from "./schema";

/** 把卡片移动到同一看板的另一个列表末尾。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { id, boardId, listId } = data;
    let card;

    try {
        const targetList = await db.list.findUnique({
            where: { id: listId, boardId, board: { orgId } },
        });
        if (!targetList) {
            return { error: "List not found." };
        }

        const lastCard = await db.card.findFirst({
            where: { listId },
            orderBy: { order: "desc" },
            select: { order: true },
        });

        card = await db.card.update({
            where: { id, list: { boardId, board: { orgId } } },
            data: {
                listId,
                order: lastCard ? lastCard.order + 1 : 1,
            },
        });

        await createAuditLog({
            entityTitle: card.title,
            entityId: card.id,
            entityType: ENTITY_TYPE.CARD,
            action: ACTION.UPDATE,
        });
    } catch (error) {
        console.error("[MOVE_CARD]", error);
        return { error: "Failed to move card." };
    }

    revalidatePath(`/board/${boardId}`, "layout");
    return { data: card };
};

export const moveCard = createSafeAction(MoveCard, handler);
