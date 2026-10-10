"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { UpdateChecklistItem } from "./schema";

/** 勾选/取消勾选或重命名清单条目。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { id, boardId, ...values } = data;
    let result;

    try {
        result = await db.checklistItem.update({
            where: {
                id,
                checklist: { card: { list: { boardId, board: { orgId } } } },
            },
            data: values,
        });
    } catch (error) {
        console.error("[UPDATE_CHECKLIST_ITEM]", error);
        return { error: "Failed to update item." };
    }

    revalidatePath(`/board/${data.boardId}`, "layout");
    return { data: result };
};

export const updateChecklistItem = createSafeAction(
    UpdateChecklistItem,
    handler,
);
