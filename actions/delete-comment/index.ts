"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { DeleteComment } from "./schema";

/** 删除评论；只能删除自己发表的评论。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { id, boardId } = data;
    let comment;

    try {
        comment = await db.comment.delete({
            where: {
                id,
                userId,
                card: { list: { boardId, board: { orgId } } },
            },
        });
    } catch (error) {
        console.error("[DELETE_COMMENT]", error);
        return { error: "Failed to delete comment." };
    }

    revalidatePath(`/board/${boardId}`, "layout");
    return { data: comment };
};

export const deleteComment = createSafeAction(DeleteComment, handler);
