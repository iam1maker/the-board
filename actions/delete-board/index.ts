"use server";

import { auth } from "@clerk/nextjs";
import { InputType, ReturnType } from "./type";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { DeleteBoard } from "./schema";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { decreaseAvailableCount } from "@/lib/org-limit";
import { checkSubscription } from "@/lib/subscription";

/**
 * 异步删除看板的处理函数。
 *
 * @param data 包含要删除的看板ID的数据对象，类型为 InputType。
 * @returns 返回一个 Promise，成功时其类型为 ReturnType，包含操作结果；失败时返回错误信息。
 */
const handler = async (data: InputType): Promise<ReturnType> => {
    // 从认证信息中提取用户ID和组织ID
    const { userId, orgId } = auth();

    // 检查用户ID和组织ID是否存在，不存在则返回未授权错误
    if (!userId || !orgId) {
        return {
            error: "Unauthorized",
        };
    }

    // 检查订阅状态，判断是否为Pro版本
    const isPro = await checkSubscription();

    const { id } = data;
    let board;

    try {
        // 从数据库中删除指定ID和组织ID的看板
        board = await db.board.delete({
            where: {
                id,
                orgId,
            },
        });

        // 非Pro用户执行可用看板数量减操作
        if (!isPro) {
            await decreaseAvailableCount();
        }

        // 创建审计日志，记录删除操作
        await createAuditLog({
            entityTitle: board.title,
            entityId: board.id,
            entityType: ENTITY_TYPE.BOARD,
            action: ACTION.DELETE,
        });
    } catch (error) {
        // 删除操作失败，返回错误信息
        return {
            error: "Failed to delete.",
        };
    }

    // 重新验证路径并重定向到组织页面
    revalidatePath(`/organization/${orgId}`);
    redirect(`/organization/${orgId}`);
};

// 导出经过安全封装的删除看板动作
export const deleteBoard = createSafeAction(DeleteBoard, handler);
