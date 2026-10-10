"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { DeleteLabel } from "./schema";

/** 删除看板标签，所有卡片上的这个标签一并移除（级联删除）。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { id, boardId } = data;
    let label;

    try {
        label = await db.label.delete({
            where: { id, boardId, board: { orgId } },
        });
    } catch (error) {
        console.error("[DELETE_LABEL]", error);
        return { error: "Failed to delete label." };
    }

    revalidatePath(`/board/${boardId}`);
    return { data: label };
};

export const deleteLabel = createSafeAction(DeleteLabel, handler);
