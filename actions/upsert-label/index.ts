"use server";

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./type";
import { UpsertLabel } from "./schema";

/** 新建或修改看板标签（名称可为空，和 Trello 一样只显示颜色）。 */
const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return { error: "Unauthorized" };
    }

    const { boardId, id, name, color } = data;
    let label;

    try {
        if (id) {
            label = await db.label.update({
                where: { id, boardId, board: { orgId } },
                data: { name, color },
            });
        } else {
            const board = await db.board.findUnique({
                where: { id: boardId, orgId },
                select: { id: true },
            });
            if (!board) {
                return { error: "Board not found." };
            }
            label = await db.label.create({ data: { boardId, name, color } });
        }
    } catch (error) {
        console.error("[UPSERT_LABEL]", error);
        return { error: "Failed to save label." };
    }

    revalidatePath(`/board/${boardId}`, "layout");
    return { data: label };
};

export const upsertLabel = createSafeAction(UpsertLabel, handler);
