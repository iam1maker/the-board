import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

/** 获取卡片的全部评论，最新的在前。 */
export async function GET(
    request: Request,
    { params }: { params: { cardId: string } },
) {
    try {
        const { userId, orgId } = auth();
        if (!userId || !orgId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const comments = await db.comment.findMany({
            where: {
                cardId: params.cardId,
                card: { list: { board: { orgId } } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(comments);
    } catch (error) {
        console.error("[CARD_COMMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
