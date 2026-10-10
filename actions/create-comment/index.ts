"use server";

import { auth, currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { CreateComment } from "./schema";

/** 以当前用户身份在卡片上发表评论。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();
    const user = await currentUser();

    if (!userId || !orgId || !user) {
        return { error: "Unauthorized" };
    }

    const { cardId, boardId, content } = data;
    let comment;

    try {
        const card = await db.card.findUnique({
            where: { id: cardId, list: { boardId, board: { orgId } } },
            select: { id: true },
        });
        if (!card) {
            return { error: "Card not found." };
        }

        const userName =
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.username ||
            "Unknown user";

        comment = await db.comment.create({
            data: {
                cardId,
                content,
                userId,
                userName,
                userImage: user.imageUrl,
            },
        });
    } catch (error) {
        console.error("[CREATE_COMMENT]", error);
        return { error: "Failed to add comment." };
    }

    revalidatePath(`/board/${boardId}`, "layout");
    return { data: comment };
};

export const createComment = createSafeAction(CreateComment, handler);
