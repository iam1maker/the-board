"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { DeleteChecklistItem } from "./schema";

/** 删除一个清单条目。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { id, boardId } = data;
    let result;

    try {
        result = await db.checklistItem.delete({
            where: {
                id,
                checklist: { card: { list: { boardId, board: { orgId } } } },
            },
        });
    } catch (error) {
        console.error("[DELETE_CHECKLIST_ITEM]", error);
        return { error: "Failed to delete item." };
    }

    revalidatePath(`/board/${data.boardId}`, "layout");
    return { data: result };
};

export const deleteChecklistItem = createSafeAction(
    DeleteChecklistItem,
    handler,
);
