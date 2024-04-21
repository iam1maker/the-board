"use server"

import { auth } from "@clerk/nextjs"
import { InputType, ReturnType } from "./type"
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateCard } from "./schema";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

/**
 * 异步处理更新卡片信息的请求。
 * 
 * @param data 包含卡片更新所需数据的对象，必须包括卡片id（id），列表id（boardId）以及其他要更新的卡片字段。
 * @returns 返回一个Promise，成功时该Promise解析为更新后的卡片数据，失败时解析为包含错误信息的对象。
 */
const handler = async (data: InputType): Promise<ReturnType> => {

    // 从认证信息中提取用户ID和组织ID
    const { userId, orgId } = auth();

    // 检查用户ID和组织ID是否存在，若不存在，则返回未授权错误
    if (!userId || !orgId) {
        return {
            error: "Unauthorized",
        };
    }

    // 从传入的数据中解构出卡片ID，列表ID和其他需要更新的值
    const { id, boardId, ...values } = data;
    let card;

    try {
        // 尝试更新数据库中的卡片信息
        card = await db.card.update({
            where: {
                id,
                list: {
                    board: {
                        orgId
                    }
                }
            },
            data: {
                ...values,
            }
        })
        await createAuditLog({
            entityTitle: card.title,
            entityId: card.id,
            entityType: ENTITY_TYPE.CARD,
            action: ACTION.UPDATE
        })
    } catch (error) {
        // 更新失败时，返回错误信息
        return {
            error: "Failed to update card.",
        }
    }

    // 重新验证与该列表相关的路径，以触发界面更新
    revalidatePath(`/board/${boardId}`);
    return { data: card }
}

// 导出一个安全的动作创建器，用于封装和执行更新卡片的动作
export const updateCard = createSafeAction(UpdateCard, handler)