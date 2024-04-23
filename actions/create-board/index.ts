"use server"

import { auth } from "@clerk/nextjs"
import { InputType, ReturnType } from "./types"
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateBoard } from "./scheme";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { incrementAvailableCount, hasAvailableCount } from "@/lib/org-limit";
import { checkSubscription } from "@/lib/subscription";

const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
        return {
            error: "Unauthorized",
        }
    }

    //异步验证 
    const canCreate = await hasAvailableCount();
    const isPro = await checkSubscription();

    if (!canCreate && !isPro) {
        return {
            error: "You have reached your limit of boards. Please upgrade to create more."
        };
    }

    const { title, image } = data;

    const [
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageLinkHTML,
        imageUserName
    ] = image.split("|");

    console.log({
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageLinkHTML,
        imageUserName
    })

    if (!imageId || !imageThumbUrl || !imageFullUrl || !imageLinkHTML || !imageUserName) {
        return {
            error: "Missing fields. Failed to create board"
        };
    }

    let board;

    try {
        board = await db.board.create({
            data: {
                title,
                orgId,
                imageId,
                imageThumbUrl,
                imageLinkHTML,
                imageFullUrl,
                imageUserName
            }
        })

        if (!isPro) {
            await incrementAvailableCount();
        }

        await createAuditLog({
            entityTitle: board.title,
            entityId: board.id,
            entityType: ENTITY_TYPE.BOARD,
            action: ACTION.CREATE
        })
    } catch (error) {
        return {
            error: "Failed to create"
        }
    }
    revalidatePath(`/board/${board.id}`)
    return { data: board }
}

export const createBoard = createSafeAction(CreateBoard, handler)
