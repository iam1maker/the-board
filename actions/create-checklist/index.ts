"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { CreateChecklist } from "./schema";

/** 给卡片添加一个清单。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { cardId, boardId, title } = data;
    let result;

    try {
        const card = await db.card.findUnique({
            where: { id: cardId, list: { boardId, board: { orgId } } },
            select: { id: true },
        });
        if (!card) {
            return { error: "Card not found." };
        }
        result = await db.checklist.create({ data: { cardId, title } });
    } catch (error) {
        console.error("[CREATE_CHECKLIST]", error);
        return { error: "Failed to create checklist." };
    }

    revalidatePath(`/board/${data.boardId}`, "layout");
    return { data: result };
};

export const createChecklist = createSafeAction(CreateChecklist, handler);
