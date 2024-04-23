import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { ENTITY_TYPE } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * 使用GET请求获取指定卡片的最近三次审计日志。
 * 
 * @param request - Next.js的Request对象，包含请求信息。
 * @param {params} - 包含通过路径传递的参数的对象，其中params对象必须包含cardId字段。
 * @returns 返回一个NextResponse对象，包含审计日志数据或错误信息。如果用户未授权，返回401状态码；如果发生内部错误，返回500状态码。
 */
export async function GET(
    request: Request,
    { params }: { params: { cardId: string } }
) {
    try {
        // 验证用户授权，获取用户ID和组织ID
        const { userId, orgId } = auth();
        // 如果用户ID或组织ID不存在，则返回未授权响应
        if (!userId || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // 从数据库中查询指定卡片的最近三次审计日志
        const auditLogs = await db.auditLog.findMany({
            where: {
                orgId,
                entityId: params.cardId,
                entityType: ENTITY_TYPE.CARD,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 3,
        })
        // 将查询结果以JSON格式返回
        return NextResponse.json(auditLogs)
    } catch (error) {
        // 如果发生任何错误，返回内部错误响应
        return new NextResponse("Internal Error", { status: 500 })
    }
}