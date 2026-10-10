"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { DeleteChecklist } from "./schema";

/** 删除清单及其所有条目。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { id, boardId } = data;
    let result;

    try {
        result = await db.checklist.delete({
            where: { id, card: { list: { boardId, board: { orgId } } } },
        });
    } catch (error) {
        console.error("[DELETE_CHECKLIST]", error);
        return { error: "Failed to delete checklist." };
    }

    revalidatePath(`/board/${data.boardId}`, "layout");
    return { data: result };
};

export const deleteChecklist = createSafeAction(DeleteChecklist, handler);
