"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { ToggleCardLabel } from "./schema";

/** 给卡片加上或去掉一个标签；标签必须属于卡片所在的看板。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { cardId, labelId, boardId } = data;
    let added: boolean;

    try {
        const [card, label] = await Promise.all([
            db.card.findUnique({
                where: { id: cardId, list: { boardId, board: { orgId } } },
                select: { id: true },
            }),
            db.label.findUnique({
                where: { id: labelId, boardId, board: { orgId } },
                select: { id: true },
            }),
        ]);
        if (!card || !label) {
            return { error: "Card or label not found." };
        }

        const key = { cardId_labelId: { cardId, labelId } };
        const existing = await db.cardLabel.findUnique({ where: key });
        if (existing) {
            await db.cardLabel.delete({ where: key });
            added = false;
        } else {
            await db.cardLabel.create({ data: { cardId, labelId } });
            added = true;
        }
    } catch (error) {
        console.error("[TOGGLE_CARD_LABEL]", error);
        return { error: "Failed to update labels." };
    }

    revalidatePath(`/board/${boardId}`);
    return { data: { cardId, labelId, added } };
};

export const toggleCardLabel = createSafeAction(ToggleCardLabel, handler);
