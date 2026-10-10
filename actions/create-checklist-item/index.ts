"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { CreateChecklistItem } from "./schema";

/** 在清单末尾添加一个条目。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { checklistId, boardId, title } = data;
    let result;

    try {
        const checklist = await db.checklist.findUnique({
            where: {
                id: checklistId,
                card: { list: { boardId, board: { orgId } } },
            },
            select: { id: true },
        });
        if (!checklist) {
            return { error: "Checklist not found." };
        }
        const lastItem = await db.checklistItem.findFirst({
            where: { checklistId },
            orderBy: { order: "desc" },
            select: { order: true },
        });
        result = await db.checklistItem.create({
            data: {
                checklistId,
                title,
                order: lastItem ? lastItem.order + 1 : 0,
            },
        });
    } catch (error) {
        console.error("[CREATE_CHECKLIST_ITEM]", error);
        return { error: "Failed to add item." };
    }

    revalidatePath(`/board/${data.boardId}`, "layout");
    return { data: result };
};

export const createChecklistItem = createSafeAction(
    CreateChecklistItem,
    handler,
);
