import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

/**
 * 使用 GET 请求获取特定的卡片信息。
 *
 * @param req - 请求对象，包含请求的细节。
 * @param {params} - 包含卡片ID的对象。
 * @returns 返回一个NextResponse对象，其中包含卡片信息或者错误信息。
 */
export async function GET(
    req: Request,
    { params }: { params: { cardId: string } }
) {
    try {
        // 验证用户认证信息，获取用户ID和组织ID
        const { userId, orgId } = auth();
        // 如果没有用户ID或组织ID，则返回未授权响应
        if (!userId || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        // 从数据库中查找独特的卡片信息，包括其所属列表的标题
        const card = await db.card.findUnique({
            where: {
                id: params.cardId,
                list: {
                    board: {
                        orgId,
                    },
                },
            },
            include: {
                list: {
                    select: {
                        title: true,
                    },
                },
            },
        });
        // 返回卡片信息的JSON响应
        return NextResponse.json(card);
    } catch (error) {
        // 如果有错误发生，则返回内部错误响应
        return new NextResponse("Internal Error", { status: 500 });
    }
}
